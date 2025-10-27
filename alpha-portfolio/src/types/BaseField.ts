export type BaseField<T extends string> = {
  type: T;
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Optional description/help text under the field */
  description?: string;
  /** Optional id override (auto-generated if omitted) */
  id?: string;
  /** Show only when predicate returns true (computed with current formValues) */
  visibleIf?: (values: Record<string, unknown>) => boolean;
};

