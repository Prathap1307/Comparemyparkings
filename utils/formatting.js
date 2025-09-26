export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if invalid
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Helper function to format time as HH:MM AM/PM
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  let date;
  if (timeString.includes('T')) {
    date = new Date(timeString);
  } else {
    // Handle standalone time strings (HH:MM:SS)
    const [hours, minutes] = timeString.split(':');
    date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
  }
  
  if (isNaN(date.getTime())) return timeString; // Return original if invalid
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  return `${hours}:${minutes} ${ampm}`;
};