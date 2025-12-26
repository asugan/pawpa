import i18n from '../i18n';
import { ZodIssue, z } from 'zod';
import { TranslationFunction } from '../types';

/**
 * Gets the translation function dynamically
 * @returns The i18n translation function
 */
const getT = () => {
  try {
    return i18n.t;
  } catch {
    // Fallback for when i18n is not available
    return (key: string, options?: string | Record<string, unknown>) => key;
  }
};

/**
 * Creates a validation error message with translation key
 * @param key - The translation key
 * @param options - Options for interpolation
 * @returns Translated message string
 */
export const t = (key: string, options?: Record<string, unknown>) => {
  const translate = getT();
  return translate(key, options);
};

/**
 * MongoDB ObjectId validation schema
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, t('forms.validation.objectIdInvalid'));

/**
 * Creates a Zod error map for internationalized error messages
 * @returns Zod error map function
 */
export const createZodI18nErrorMap = () => {
  return (issue: ZodIssue) => {
    const translate = getT();
    let message: string | undefined;

    switch (issue.code) {
      case 'too_small':
        if ('origin' in issue && issue.origin === 'string') {
          message = translate('forms.validation.nameMinLength', { min: Number(issue.minimum) });
        } else if ('origin' in issue && issue.origin === 'number') {
          message = translate('forms.validation.weightMin', { min: Number(issue.minimum) });
        }
        break;

      case 'too_big':
        if ('origin' in issue && issue.origin === 'string') {
          message = translate('forms.validation.nameMaxLength', { max: Number(issue.maximum) });
        } else if ('origin' in issue && issue.origin === 'number') {
          message = translate('forms.validation.weightMax', { max: Number(issue.maximum) });
        }
        break;

      case 'invalid_format':
        if ('format' in issue && issue.format === 'regex') {
          message = translate('forms.validation.nameInvalidChars');
        }
        break;

      case 'invalid_type':
        if ('input' in issue && issue.input === undefined) {
          message = translate('forms.validation.required');
        }
        break;

      default:
        message = translate('forms.validation.invalid');
    }

    return { message: message ?? translate('forms.validation.invalid') };
  };
};
