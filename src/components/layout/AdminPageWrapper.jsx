import React from 'react';
import AdminLayout from '../AdminLayout';

/**
 * Wrapper pour intégrer automatiquement les pages dans AdminLayout
 */
export default function AdminPageWrapper({ children, title }) {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {title && (
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </AdminLayout>
  );
} 
