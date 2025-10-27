import { BaseField } from './BaseField';

export type NumberField = BaseField<'number'> & {
  min?: number;
  max?: number;
  step?: number;
};

