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
 * MongoDB ObjectId validation schema
 */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

/**
 * Creates a Zod error map for internationalized error messages
 * @returns Zod error map function
 */
export const createZodI18nErrorMap = () => {
  return (issue: ZodIssue) => {
    const translate = getT();

    switch (issue.code) {
      case 'too_small':
        if (issue.type === 'string') {
          issue.message = translate('forms.validation.nameMinLength', { min: issue.minimum });
        } else if (issue.type === 'number') {
          issue.message = translate('forms.validation.weightMin', { min: issue.minimum });
        }
        break;

      case 'too_big':
        if (issue.type === 'string') {
          issue.message = translate('forms.validation.nameMaxLength', { max: issue.maximum });
        } else if (issue.type === 'number') {
          issue.message = translate('forms.validation.weightMax', { max: issue.maximum });
        }
        break;

      case 'invalid_string':
        if (issue.validation === 'regex') {
          issue.message = translate('forms.validation.nameInvalidChars');
        }
        break;

      case 'invalid_type':
        if (issue.received === 'undefined') {
          issue.message = translate('forms.validation.required');
        }
        break;

      case 'invalid_date':
        issue.message = translate('forms.validation.birthDateRequired');
        break;

      default:
        issue.message = translate('forms.validation.invalid');
    }

    return issue;
  };
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