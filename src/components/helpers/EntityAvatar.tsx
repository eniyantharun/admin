import { iEntityAvatarProps } from '@/types';
import React from 'react';

export const EntityAvatar: React.FC<iEntityAvatarProps> = ({ 
  name, 
  id, 
  type = 'default',
  size = 'md'
}) => {
  const generateHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    return Math.abs(hash);
  };

  const gradients = [
    'from-slate-700 to-gray-900',
    'from-blue-700 to-blue-900', 
    'from-indigo-700 to-purple-900',
    'from-emerald-700 to-teal-900',
    'from-rose-700 to-pink-900',
    'from-orange-700 to-red-900',
    'from-violet-700 to-purple-900',
    'from-cyan-700 to-blue-900',
    'from-green-700 to-emerald-900',
    'from-amber-700 to-orange-900',
    'from-red-700 to-rose-900',
    'from-teal-700 to-cyan-900'
  ];

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm'
  };

  const entityIdentifier = `${id}-${name}`;
  const gradientIndex = generateHash(entityIdentifier) % gradients.length;
  const gradient = gradients[gradientIndex];
  
  const initials = name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2);
  
  return (
    <div className={`entity-avatar ${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/20`}>
      {initials || (type === 'customer' ? 'C' : type === 'supplier' ? 'S' : 'E')}
    </div>
  );
};