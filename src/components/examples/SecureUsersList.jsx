import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/apiService';
import ProtectedRoute from '../ProtectedRoute';
import { PERMISSIONS, ROLES } from '../../constants/roles';

const SecureUsersList = () => {
  const { hasPermission, isSuperAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: 1,
        limit: 20,
        ...filters
      };
      
      const response = await apiService.get('/users/all', params);
      
      if (response.success) {
        setUsers(response.data);
        console.log(`${response.data.length} utilisateurs chargés`);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setError(error.message);
      
      // Gérer les erreurs spécifiques
      if (error.message.includes('accès')) {
        setError('Vous n\'avez pas les droits pour voir les utilisateurs');
      }
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (userId) => {
    if (!hasPermission(PERMISSIONS.EDIT_USERS)) {
      alert('Vous n\'avez pas la permission de modifier les utilisateurs');
      return;
    }

    try {
      // Logique de modification
      console.log('Modification utilisateur:', userId);
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!hasPermission(PERMISSIONS.DELETE_USERS)) {
      alert('Vous n\'avez pas la permission de supprimer les utilisateurs');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await apiService.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      console.log('Utilisateur supprimé:', userId);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-2">Chargement...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-red-800 font-medium">Erreur</span>
      </div>
      <p className="text-red-700 mt-1">{error}</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Liste des Utilisateurs</h2>
        
        {/* Affichage conditionnel selon les permissions */}
        {isSuperAdmin() && (
          <div className="mt-2 p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-purple-800 font-medium">Mode Super Administrateur</span>
            </div>
            <p className="text-purple-700 text-sm mt-1">Vous avez accès à toutes les fonctionnalités sans restriction</p>
          </div>
        )}
      </div>

      {/* Actions conditionnelles */}
      <div className="mb-4 flex gap-2">
        {hasPermission(PERMISSIONS.CREATE_USERS) && (
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Créer un utilisateur
          </button>
        )}
        
        {hasPermission(PERMISSIONS.EXPORT_DATA) && (
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Exporter la liste
          </button>
        )}
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-4 border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user.prenom} {user.nom}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-700">
                <strong>Rôle:</strong> {user.role}
              </p>
              {user.permissions && user.permissions.length > 0 && (
                <p className="text-sm text-gray-700">
                  <strong>Permissions:</strong> {user.permissions.length}
                </p>
              )}
            </div>

            {/* Actions conditionnelles par utilisateur */}
            <div className="flex gap-2">
              {hasPermission(PERMISSIONS.EDIT_USERS) && (
                <button 
                  onClick={() => editUser(user.id)}
                  className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Modifier
                </button>
              )}
              
              {hasPermission(PERMISSIONS.DELETE_USERS) && user.role !== ROLES.SUPER_ADMIN && (
                <button 
                  onClick={() => deleteUser(user.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>

            {/* Avertissement si tentative de suppression d'un super admin */}
            {user.role === ROLES.SUPER_ADMIN && (
              <p className="text-xs text-gray-500 mt-2 italic">
                Les super administrateurs ne peuvent pas être supprimés
              </p>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  );
};

// Export avec protection - Seuls les utilisateurs avec la permission VIEW_USERS peuvent accéder
export default () => (
  <ProtectedRoute 
    permission={PERMISSIONS.VIEW_USERS}
    fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Accès refusé
          </h1>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas accès à la liste des utilisateurs.
          </p>
          <p className="text-sm text-gray-500">
            Permission requise : <code className="bg-gray-100 px-2 py-1 rounded">view_users</code>
          </p>
        </div>
      </div>
    }
  >
    <SecureUsersList />
  </ProtectedRoute>
); 
