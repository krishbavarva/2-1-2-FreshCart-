import React from 'react';

const NutriScoreBadge = ({ grade, size = 'md' }) => {
  if (!grade || !['A', 'B', 'C', 'D', 'E'].includes(grade.toUpperCase())) {
    return (
      <span className={`inline-flex items-center justify-center rounded-full font-bold text-white ${
        size === 'sm' ? 'w-6 h-6 text-xs' : 
        size === 'lg' ? 'w-10 h-10 text-lg' : 
        'w-8 h-8 text-sm'
      } bg-gray-300 text-gray-700`}>
        N/A
      </span>
    );
  }

  const gradeUpper = grade.toUpperCase();
  
  const colorClasses = {
    'A': 'bg-green-500 text-white',
    'B': 'bg-green-400 text-white',
    'C': 'bg-yellow-500 text-white',
    'D': 'bg-orange-500 text-white',
    'E': 'bg-red-500 text-white'
  };

  const sizeClasses = {
    'sm': 'w-6 h-6 text-xs',
    'md': 'w-8 h-8 text-sm',
    'lg': 'w-10 h-10 text-lg'
  };

  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full font-bold ${colorClasses[gradeUpper]} ${sizeClasses[size]}`}
      title={`Nutri-Score: ${gradeUpper}`}
    >
      {gradeUpper}
    </span>
  );
};

export default NutriScoreBadge;



