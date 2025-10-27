import { TextField } from './TextField';
import { NumberField } from './NumberField';
import { CheckboxField } from './CheckboxField';
import { SelectField, MultiSelectField } from './SelectField';

export type FieldType =
  | TextField
  | NumberField
  | CheckboxField
  | SelectField
  | MultiSelectField;

export type FormField = FieldType;

