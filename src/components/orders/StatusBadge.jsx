import React from 'react';
import { MdAccessTime, MdCheck } from 'react-icons/md';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
      case 'served':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'preparing':
      case 'pending':
        return <MdAccessTime className="w-3 h-3 flex-shrink-0" />;
      case 'completed':
      case 'served':
        return <MdCheck className="w-3 h-3 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const statusText = status 
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : 'Unknown';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
      {getStatusIcon(status)}
      <span className="whitespace-nowrap">{statusText}</span>
    </span>
  );
};

export default StatusBadge;
