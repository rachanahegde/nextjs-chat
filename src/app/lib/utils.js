export const getInitials = () => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = () => {
  if (!name) return 'bg-gray-300';
  const colors = ['bg-lavender', 'bg-pink-light', 'bg-pink-medium', 'bg-blue-light', 'bg-blue-medium'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export const formatTimestamp = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const createMessage = () => ({
  id: Date.now() + Math.random(),
  username,
  message: message.trim(),
  timestamp: formatTimestamp(),
  isOwn
});