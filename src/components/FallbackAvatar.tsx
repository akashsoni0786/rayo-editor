import React from 'react';

interface FallbackAvatarProps {
  name: string;
  className?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-gray-500',
    'bg-gray-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default function FallbackAvatar({ name, className = '' }: FallbackAvatarProps) {
  const initials = getInitials(name || 'User');
  const bgColor = getColorFromName(name || 'User');
  
  return (
    <div 
      className={`flex items-center justify-center rounded-full text-white font-medium ${bgColor} ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      <span className="text-sm">{initials}</span>
    </div>
  );
}
