import React from 'react';
import { Card } from '../ui';

const PermissionGrid = ({ permissions, onPermissionChange, className = '' }) => {
  const permissionCategories = [
    {
      title: 'Gestion des utilisateurs',
      icon: 'fa-users',
      color: 'blue',
      permissions: ['create_users', 'edit_users', 'delete_users', 'view_users']
    },
    {
      title: 'Gestion des plaintes',
      icon: 'fa-exclamation-circle',
      color: 'red',
      permissions: ['create_complaints', 'edit_complaints', 'delete_complaints', 'view_complaints']
    },
    {
      title: 'Gestion des contenus',
      icon: 'fa-layer-group',
      color: 'green',
      permissions: ['create_content', 'edit_content', 'delete_content', 'view_content']
    },
    {
      title: 'Rapports et statistiques',
      icon: 'fa-chart-bar',
      color: 'purple',
      permissions: ['view_reports', 'export_data', 'view_analytics']
    },
    {
      title: 'Administration système',
      icon: 'fa-cog',
      color: 'amber',
      permissions: ['system_config', 'user_roles', 'backup_restore']
    }
  ];

  const getPermissionLabel = (permission) => {
    const labels = {
      create_users: 'Créer',
      edit_users: 'Modifier',
      delete_users: 'Supprimer',
      view_users: 'Consulter',
      create_complaints: 'Créer',
      edit_complaints: 'Modifier',
      delete_complaints: 'Supprimer',
      view_complaints: 'Consulter',
      create_content: 'Créer',
      edit_content: 'Modifier',
      delete_content: 'Supprimer',
      view_content: 'Consulter',
      view_reports: 'Consulter rapports',
      export_data: 'Exporter données',
      view_analytics: 'Analytics',
      system_config: 'Configuration',
      user_roles: 'Rôles utilisateurs',
      backup_restore: 'Sauvegarde'
    };
    return labels[permission] || permission;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200',
      red: 'bg-red-50 border-red-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      amber: 'bg-amber-50 border-amber-200'
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-500',
      red: 'text-red-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      amber: 'text-amber-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {permissionCategories.map((category, index) => (
        <Card 
          key={index}
          className={`${getColorClasses(category.color)} border-2 hover:shadow-lg transition-all duration-300`}
          padding="lg"
        >
          <div className="flex items-center mb-4">
            <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center mr-3`}>
              <i className={`fas ${category.icon} text-lg ${getIconColor(category.color)}`}></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{category.title}</h3>
          </div>
          
          <div className="space-y-3">
            {category.permissions.map((permission) => (
              <div key={permission} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {getPermissionLabel(permission)}
                </label>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={permissions[permission] || false}
                    onChange={(e) => onPermissionChange(permission, e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => onPermissionChange(permission, !permissions[permission])}
                    className={`w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                      permissions[permission] 
                        ? `bg-${category.color}-500` 
                        : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        permissions[permission] ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PermissionGrid; 
