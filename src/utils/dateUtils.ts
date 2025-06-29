// Simple date formatting utilities to replace date-fns
export const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const monthNamesFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  switch (format) {
    case 'MMM dd, yyyy':
      return `${monthNames[month - 1]} ${day.toString().padStart(2, '0')}, ${year}`;
    case 'MMMM dd, yyyy':
      return `${monthNamesFull[month - 1]} ${day.toString().padStart(2, '0')}, ${year}`;
    case 'MMMM dd, yyyy at HH:mm':
      return `${monthNamesFull[month - 1]} ${day.toString().padStart(2, '0')}, ${year} at ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    case 'MMM dd':
      return `${monthNames[month - 1]} ${day.toString().padStart(2, '0')}`;
    case 'MMM yyyy':
      return `${monthNames[month - 1]} ${year}`;
    case 'HH:mm':
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    case 'yyyy-MM-dd':
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    default:
      return date.toLocaleDateString();
  }
};

export const format = formatDate; // Export as 'format' for compatibility