import React from 'react';
import { Badge } from '../ui';

const DataTable = ({ 
  columns, 
  data, 
  title,
  actions,
  className = '',
  ...props 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md ${className}`} {...props}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-5">
          {title && <h2 className="text-lg font-semibold text-gray-800">{title}</h2>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row[column.accessor], row, rowIndex) : (
                      <span className={column.className || 'text-sm text-gray-900'}>
                        {row[column.accessor]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composants utilitaires pour les cellules
export const StatusBadge = ({ status }) => {
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'résolue': return 'success';
      case 'en traitement': return 'primary';
      case 'en attente': return 'warning';
      case 'rejetée': return 'danger';
      default: return 'default';
    }
  };

  return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
};

export const PriorityIndicator = ({ priority }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center">
      <span className={`w-3 h-3 rounded-full ${getPriorityColor(priority)} mr-2`}></span>
      <span className="text-sm text-gray-500 capitalize">{priority}</span>
    </div>
  );
};

export const ActionButtons = ({ onView, onEdit, onDelete, row }) => (
  <div className="flex space-x-2">
    {onView && (
      <button 
        onClick={() => onView(row)}
        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
        title="Voir"
      >
        <i className="fas fa-eye"></i>
      </button>
    )}
    {onEdit && (
      <button 
        onClick={() => onEdit(row)}
        className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200"
        title="Modifier"
      >
        <i className="fas fa-edit"></i>
      </button>
    )}
    {onDelete && (
      <button 
        onClick={() => onDelete(row)}
        className="text-red-600 hover:text-red-900 transition-colors duration-200"
        title="Supprimer"
      >
        <i className="fas fa-trash"></i>
      </button>
    )}
  </div>
);

export default DataTable; 