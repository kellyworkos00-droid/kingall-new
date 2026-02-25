export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    MANAGER: 'bg-blue-100 text-blue-800',
    ACCOUNTANT: 'bg-green-100 text-green-800',
    SALES: 'bg-yellow-100 text-yellow-800',
    STOREKEEPER: 'bg-purple-100 text-purple-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export const getStatusBadgeColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    received: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};
