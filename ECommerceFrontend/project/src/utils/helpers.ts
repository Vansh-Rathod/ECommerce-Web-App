/**
 * Format price with currency symbol
 */
export const formatPrice = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format date to locale string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

/**
 * Debounce function
 */
// export const debounce = <T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): ((...args: Parameters<T>) => void) => {
//   let timeout: ReturnType<typeof setTimeout> | null = null;
  
//   return function(...args: Parameters<T>) {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// };

// Debounce utility
export function debounce<Func extends (...args: any[]) => void>(
  func: Func,
  wait: number
): (...args: Parameters<Func>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<Func>) => {
    clearTimeout(timeout);
    timeout = setTimeout(async() => {
      await func(...args);
    }, wait);
  };
}

/**
 * Generate random ID
 */
export const generateId = (prefix?: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}${randomStr}` : `${timestamp}${randomStr}`;
};

/**
 * Filter object by keys
 */
export const filterObjectByKeys = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Pick<T, K>);
};

/**
 * Check if device is mobile
 */
export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};