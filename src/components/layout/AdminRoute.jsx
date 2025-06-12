import React from 'react';
import { AdminPageWrapper } from './';

/**
 * Wrapper automatique pour les routes admin
 * Applique AdminPageWrapper à toutes les pages admin
 */
export default function AdminRoute({ children, title, ...props }) {
  return (
    <AdminPageWrapper title={title} {...props}>
      {children}
    </AdminPageWrapper>
  );
} 