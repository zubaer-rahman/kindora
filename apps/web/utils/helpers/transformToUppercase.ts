export const transformToUppercase = (
  str: string | null | undefined
): string => {
  try {
    // Check for null, undefined, or empty string
    if (!str) return '';

    // Ensure we're working with a string
    const safeStr = String(str);

    // If the string is empty after conversion, return it
    if (safeStr.length === 0) return safeStr;

    // Capitalize the first letter
    return safeStr.charAt(0).toUpperCase() + safeStr.slice(1);
  } catch {
    // If any error occurs, return the original input
    return str ?? '';
  }
};

export const transformToLowercase = (str: string) => {
  if (str.length === 0) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
};
