import i18n from '@/lib/i18n';
import { addDays, addHours, endOfDay, format, formatDistanceToNow, isAfter, isToday, isTomorrow, isYesterday, startOfDay } from 'date-fns';
import { enUS, tr } from 'date-fns/locale';

const getLocale = () => {
  return i18n.language === 'tr' ? tr : enUS;
};

export const formatDate = (date: Date | string | number, formatStr: string = 'dd MMMM yyyy') => {
  const dateObj = new Date(date);
  return format(dateObj, formatStr, { locale: getLocale() });
};

export const formatTime = (date: Date | string | number) => {
  const dateObj = new Date(date);
  return format(dateObj, 'HH:mm', { locale: getLocale() });
};

export const getRelativeTime = (date: Date | string | number) => {
  const dateObj = new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: getLocale() });
};

export const formatEventDate = (date: Date | string | number, t: any) => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return t('eventCard.today');
  } else if (isTomorrow(dateObj)) {
    return t('eventCard.tomorrow');
  } else if (isYesterday(dateObj)) {
    return t('eventCard.yesterday');
  } else {
    return format(dateObj, 'dd MMMM yyyy', { locale: getLocale() });
  }
};

export const dateUtils = {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isAfter,
  addHours,
  startOfDay,
  endOfDay,
  addDays,
  getLocale
};
