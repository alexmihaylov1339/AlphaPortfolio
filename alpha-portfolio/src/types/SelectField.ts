import { BaseField } from './BaseField';

export type SelectOption = { label: string; value: string };

export type SelectField = BaseField<'select'> & {
  options: SelectOption[];
  placeholderOption?: string; // e.g., "Select..."
};

export type MultiSelectField = BaseField<'multiselect'> & {
  options: SelectOption[];
};

