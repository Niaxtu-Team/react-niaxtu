import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS, ROLES, ROLE_LABELS, PERMISSION_LABELS } from '../../constants/roles';

const AuthDebugPanel = () => {
  const { user, hasPermission, hasRole, isSuperAdmin, authService, apiService } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [testPermission, setTestPermission] = useState('');

  // Ne pas afficher en production
  if (import.meta.env.PROD) {
    return null;
  }

  const testPermissionCheck = () => {
    if (!testPermission) return;
    const result = hasPermission(testPermission);
    alert(`Permission "${testPermission}": ${result ? '✅ ACCORDÉE' : '❌ REFUSÉE'}`);
  };

  const clearAuth = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer les données d\'authentification ?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.reload();
    }
  };

  const testApiCall = async () => {
    try {
      const response = await apiService.get('/auth/verify');
      alert('✅ Test API réussi: ' + JSON.stringify(response, null, 2));
    } catch (error) {
      alert('❌ Test API échoué: ' + error.message);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          title="Ouvrir le panneau de debug d'authentification"
        >
          🔐
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-purple-200 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
        <h3 className="font-bold text-sm">🔐 Debug Auth</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white hover:text-purple-200"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* Statut utilisateur */}
        <div>
          <h4 className="font-semibold text-purple-800 mb-2">👤 Utilisateur</h4>
          {user ? (
            <div className="bg-green-50 p-2 rounded border">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rôle:</strong> {user.role} ({ROLE_LABELS[user.role]})</p>
              <p><strong>Actif:</strong> {user.isActive ? '✅' : '❌'}</p>
              <p><strong>Super Admin:</strong> {isSuperAdmin() ? '✅' : '❌'}</p>
              <p><strong>Permissions:</strong> {user.permissions?.length || 0}</p>
            </div>
          ) : (
            <div className="bg-red-50 p-2 rounded border text-red-700">
              ❌ Aucun utilisateur connecté
            </div>
          )}
        </div>

        {/* Token */}
        <div>
          <h4 className="font-semibold text-purple-800 mb-2">🎫 Token</h4>
          <div className="bg-gray-50 p-2 rounded border">
            <p><strong>Présent:</strong> {authService.getToken() ? '✅' : '❌'}</p>
            {authService.getToken() && (
              <p className="break-all">
                <strong>Token:</strong> {authService.getToken().substring(0, 20)}...
              </p>
            )}
          </div>
        </div>

        {/* Permissions */}
        {user?.permissions && (
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">🔑 Permissions</h4>
            <div className="bg-blue-50 p-2 rounded border max-h-24 overflow-y-auto">
              {user.permissions.map(perm => (
                <div key={perm} className="text-xs">
                  • {perm} ({PERMISSION_LABELS[perm] || 'Non définie'})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test de permission */}
        <div>
          <h4 className="font-semibold text-purple-800 mb-2">🧪 Test Permission</h4>
          <div className="flex gap-1">
            <select
              value={testPermission}
              onChange={(e) => setTestPermission(e.target.value)}
              className="flex-1 text-xs border rounded px-1 py-1"
            >
              <option value="">Choisir une permission</option>
              {Object.entries(PERMISSIONS).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <button
              onClick={testPermissionCheck}
              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
              disabled={!testPermission}
            >
              Test
            </button>
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="font-semibold text-purple-800 mb-2">⚡ Actions</h4>
          <div className="space-y-1">
            <button
              onClick={testApiCall}
              className="w-full bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
            >
              Test API Call
            </button>
            <button
              onClick={() => {
                console.log('Auth Service:', authService);
                console.log('User:', user);
                console.log('Token:', authService.getToken());
              }}
              className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
            >
              Log to Console
            </button>
            <button
              onClick={clearAuth}
              className="w-full bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
            >
              Clear Auth Data
            </button>
          </div>
        </div>

        {/* Informations système */}
        <div>
          <h4 className="font-semibold text-purple-800 mb-2">⚙️ Système</h4>
          <div className="bg-gray-50 p-2 rounded border text-xs">
            <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || '/api'}</p>
            <p><strong>Mode:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}</p>
            <p><strong>LocalStorage:</strong> {localStorage.length} items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPanel; 
