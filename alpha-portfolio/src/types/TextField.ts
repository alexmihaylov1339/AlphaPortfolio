import { BaseField } from './BaseField';

export type TextField = BaseField<'text' | 'email' | 'password' | 'textarea'> & {
  maxLength?: number;
};

