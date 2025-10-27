'use client';

import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import type { FormField } from '../../../types';

type SubmitHandler = (data: Record<string, unknown>) => void | Promise<void>;

interface FormBuilderProps {
  fields: FormField[];
  initialValues?: Record<string, unknown>;
  onSubmit: SubmitHandler;
  submitButtonText?: string;
  className?: string;
  loading?: boolean;            // external loading (optional)
  resetOnSubmit?: boolean;
  validate?: (data: Record<string, unknown>) => Record<string, string> | null; // return map of errors
}

/** Utility: compute a robust default for each field */
function defaultFor(field: FormField) {
  switch (field.type) {
    case 'checkbox':   return false;
    case 'multiselect':return [];
    case 'select':     return ''; // let placeholder guide selection; avoid auto-picking first
    case 'number':     return '';
    case 'textarea':
    case 'text':
    case 'email':
    case 'password':
    default:           return '';
  }
}

export default function FormBuilder({
  fields,
  initialValues = {},
  onSubmit,
  submitButtonText = 'Submit',
  className = '',
  loading = false,
  resetOnSubmit = false,
  validate,
}: FormBuilderProps) {
  // Compute initial values deterministically when fields/initialValues change
  const initialComputed = useMemo(() => {
    const seed: Record<string, unknown> = {};
    for (const f of fields) seed[f.name] = (f.name in initialValues) ? initialValues[f.name] : defaultFor(f);
    return seed;
  }, [fields, initialValues]);

  const [formValues, setFormValues] = useState<Record<string, unknown>>(initialComputed);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  // Keep state in sync if fields set changes (edit forms / dynamic steps)
  useEffect(() => {
    setFormValues(prev => {
      const next: Record<string, unknown> = {};
      for (const f of fields) next[f.name] = (f.name in prev) ? prev[f.name] : defaultFor(f);
      return next;
    });
  }, [fields]);

  // keep state in sync when initialValues change (e.g., edit mode load)
  useEffect(() => {
    if (Object.keys(initialValues).length) {
      setFormValues(prev => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  /** Unified change handler that accepts either DOM events or (name, value) pairs */
  const handleFieldChange = useCallback((
    eOrName:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | string,
    maybeValue?: unknown
  ) => {
    // Custom components call onChange(name, value)
    if (typeof eOrName === 'string') {
      const name = eOrName;
      const value = maybeValue;
      setFormValues(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }

    // DOM components
    const e = eOrName;
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name } = target;

    let value: unknown = (target as HTMLInputElement).value;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      value = target.checked;
    } else if (target instanceof HTMLInputElement && target.type === 'number') {
      // keep empty string if user cleared input; otherwise coerce to number
      value = target.value === '' ? '' : target.valueAsNumber;
    } else if (target instanceof HTMLSelectElement && target.multiple) {
      value = Array.from(target.selectedOptions).map(o => o.value);
    }

    setFormValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const doReset = useCallback(() => {
    const reset: Record<string, unknown> = {};
    for (const f of fields) reset[f.name] = defaultFor(f);
    setFormValues(reset);
    setErrors({});
  }, [fields]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Visibility filter: exclude hidden fields from submit
    const visibleValues: Record<string, unknown> = {};
    for (const f of fields) {
      if (!f.visibleIf || f.visibleIf(formValues)) visibleValues[f.name] = formValues[f.name];
    }

    // Client-side validation (optional)
    if (validate) {
      const nextErrors = validate(visibleValues) || {};
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }

    startTransition(async () => {
      await onSubmit(visibleValues);
      if (resetOnSubmit) doReset();
    });
  }, [fields, formValues, validate, onSubmit, resetOnSubmit, doReset]);

  // Render
  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {fields.map((field) => {
        const isVisible = field.visibleIf ? field.visibleIf(formValues) : true;
        if (!isVisible) return null;

        const id = field.id ?? `field_${field.name}`;
        const error = errors[field.name];
        const value = formValues[field.name];
        const commonProps = {
          id,
          name: field.name,
          required: field.required,
          disabled: field.disabled || loading || isPending,
          'aria-invalid': !!error || undefined,
          'aria-describedby': error ? `${id}-error` : field.description ? `${id}-desc` : undefined,
          onChange: handleFieldChange as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        };

        return (
          <div key={field.name} className="mb-4">
            <label htmlFor={id} className="mb-1 block font-medium">{field.label}</label>

            {field.type === 'textarea' ? (
              <textarea
                {...commonProps}
                value={value as string}
                placeholder={field.placeholder}
                className="w-full rounded-md border px-3 py-2"
              />
            ) : field.type === 'checkbox' ? (
              <input
                id={id}
                name={field.name}
                type="checkbox"
                checked={!!formValues[field.name]}
                disabled={field.disabled || loading || isPending}
                onChange={handleFieldChange}
                className="h-4 w-4 align-middle"
              />
            ) : field.type === 'select' ? (
              <select
                {...commonProps}
                value={value as string}
                className="w-full rounded-md border px-3 py-2"
              >
                {field.placeholderOption && (
                  <option value="">{field.placeholderOption}</option>
                )}
                {field.options?.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : field.type === 'multiselect' ? (
              <select
                id={id}
                name={field.name}
                multiple
                value={formValues[field.name] as string[] || []}
                disabled={field.disabled || loading || isPending}
                onChange={handleFieldChange}
                className="w-full rounded-md border px-3 py-2"
              >
                {field.options?.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : field.type === 'number' ? (
              <input
                {...commonProps}
                type="number"
                value={value as string | number}
                placeholder={field.placeholder}
                className="w-full rounded-md border px-3 py-2"
              />
            ) : (
              // text/email/password
              <input
                {...commonProps}
                type={field.type}
                value={value as string}
                placeholder={field.placeholder}
                className="w-full rounded-md border px-3 py-2"
                autoComplete={field.type === 'password' ? 'new-password' : undefined}
              />
            )}

            {field.description && (
              <p id={`${id}-desc`} className="mt-1 text-sm text-muted-foreground">
                {field.description}
              </p>
            )}
            {error && (
              <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={loading || isPending}
        className="mt-2 w-full rounded-md border px-4 py-2"
      >
        {loading || isPending ? 'Submitting…' : submitButtonText}
      </button>
    </form>
  );
}

