/**
 * Formats a date for use in HTML date input fields
 * @param date - Date object or string to format
 * @returns Formatted date string (YYYY-MM-DD) or empty string if invalid
 */
export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    
    return d.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return "";
  }
}; 