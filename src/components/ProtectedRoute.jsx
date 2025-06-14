import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from './LoginForm';

const ProtectedRoute = ({ 
  children, 
  permission, 
  role, 
  requiredPermission = null, 
  requiredRole = null,
  fallback = null 
}) => {
  const { user, loading, hasPermission, hasRole, isSuperAdmin, isAuthenticated } = useAuth();

  // Compatibilité avec les anciens noms de props
  const finalPermission = permission || requiredPermission;
  const finalRole = role || requiredRole;

  // Afficher le loading pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Vérification des autorisations...</p>
          <p className="mt-2 text-gray-500 text-sm">Contrôle de l'accès administrateur</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, afficher le formulaire de connexion
  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  // SUPER ADMIN a accès à tout
  if (isSuperAdmin()) {
    return (
      <div>
        {/* Badge Super Admin optionnel */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 text-sm font-medium shadow-sm">
          🔐 Mode Super Administrateur - Accès total
        </div>
        {children}
      </div>
    );
  }

  // Vérifier la permission spécifique
  if (finalPermission && !hasPermission(finalPermission)) {
    console.log(`Accès refusé - Permission manquante: ${finalPermission}`);
    
    const defaultFallback = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Permission insuffisante
          </h1>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Votre rôle :</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{user.role}</code>
            </p>
            <p className="text-sm text-gray-700">
              <strong>Permission requise :</strong> <code className="bg-red-100 px-2 py-1 rounded text-xs">{finalPermission}</code>
            </p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );

    return fallback || defaultFallback;
  }

  // Vérifier le rôle spécifique
  if (finalRole && !hasRole(finalRole)) {
    console.log(`Accès refusé - Rôle manquant: ${finalRole}`);
    
    const defaultFallback = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Rôle insuffisant
          </h1>
          <p className="text-gray-600 mb-4">
            Votre rôle ne vous permet pas d'accéder à cette section.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2">
            <p className="text-sm text-gray-700">
              <strong>Votre rôle actuel :</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{user.role}</code>
            </p>
            <p className="text-sm text-gray-700">
              <strong>Rôle requis :</strong> <code className="bg-yellow-100 px-2 py-1 rounded text-xs">{finalRole}</code>
            </p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );

    return fallback || defaultFallback;
  }

  // Vérifier que l'utilisateur est actif
  if (user.isActive === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Compte désactivé
          </h1>
          <p className="text-gray-600 mb-4">
            Votre compte administrateur a été désactivé.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Contactez un super administrateur pour réactiver votre accès.
          </p>
          <button 
            onClick={() => {
              // Déconnecter l'utilisateur
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // Si toutes les vérifications passent, afficher le contenu protégé
  return children;
};

export default ProtectedRoute; 
