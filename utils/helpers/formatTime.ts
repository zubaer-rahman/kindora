/**
 * Converts 24-hour time format (HH:MM) to 12-hour format with AM/PM
 * @param time - Time string in 24-hour format (e.g., "14:30")
 * @returns Time string in 12-hour format with AM/PM (e.g., "2:30 PM")
 */
export const formatTimeToAMPM = (time: string): string => {
  if (!time) return '';
  
  try {
    // Parse the time string (assuming format HH:MM)
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time; // Return original if parsing fails
    }
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    // Format with leading zero for minutes if needed
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  } catch {
    // Return original time if any error occurs
    return time;
  }
}; 