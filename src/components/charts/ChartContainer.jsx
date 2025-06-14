import React from 'react';
import { Card } from '../ui';

const ChartContainer = ({ 
  title, 
  children, 
  actions,
  className = '',
  height = 'h-80',
  ...props 
}) => {
  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${className}`} {...props}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      <div className={height}>
        {children}
      </div>
    </Card>
  );
};

export default ChartContainer; 
