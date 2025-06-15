import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Eye, Edit, Save, X, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAdminPermissions } from '../hooks/useAdminPermissions';

export default function GestionAdminsPermissions() {
  const { user } = useAuth();
  const { 
    admins, 
    permissions, 
    roles, 
    loading, 
    error, 
    updateAdminPermissions, 
    updateAdminRole,
    refresh 
  } = useAdminPermissions();
  
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtrage des admins
  const adminsFiltres = admins.filter(admin => {
    const matchSearch = admin.name?.toLowerCase().includes(search.toLowerCase()) ||
                       admin.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchRole = selectedRole === '' || admin.role === selectedRole;
    
    return matchSearch && matchRole;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditPermissions = (admin) => {
    setEditingAdmin(admin.id);
    setEditingPermissions(admin.permissions || {});
  };

  const handleSavePermissions = async (adminId) => {
    try {
      await updateAdminPermissions(adminId, editingPermissions);
      setEditingAdmin(null);
      setEditingPermissions({});
    } catch (error) {
      console.error('Erreur sauvegarde permissions:', error);
      alert('Erreur lors de la sauvegarde des permissions');
    }
  };

  const handleCancelEdit = () => {
    setEditingAdmin(null);
    setEditingPermissions({});
  };

  const togglePermission = (permissionKey) => {
    setEditingPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-600 mx-auto absolute top-0"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-xl text-gray-700 font-semibold mb-2">Chargement des permissions...</p>
            <p className="text-sm text-gray-500">Veuillez patienter</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Gestion des Permissions
                </h1>
                <p className="text-gray-600 text-lg">Gérer les permissions des administrateurs</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
                <span className="text-yellow-800 font-semibold">
                  Modifications sensibles - Soyez prudent
                </span>
              </div>
            </div>
          </div>

          {/* Filtres modernes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un admin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-6 py-4 border-2 border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
            >
              <option value="">Tous les rôles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl text-center font-semibold shadow-lg">
              {adminsFiltres.length} administrateur{adminsFiltres.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Liste des admins */}
        <div className="space-y-6">
          {adminsFiltres.map((admin) => (
            <div key={admin.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* En-tête admin */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {admin.name?.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                      <p className="text-gray-600">{admin.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${admin.role === 'super_admin' ? 'bg-red-100 text-red-800' : admin.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {admin.role === 'super_admin' ? 'Super Admin' : admin.role === 'admin' ? 'Administrateur' : 'Modérateur'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Dernier accès: {admin.lastAccess}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {editingAdmin === admin.id ? (
                      <>
                        <button
                          onClick={() => handleSavePermissions(admin.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Sauvegarder</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Annuler</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditPermissions(admin)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((permission) => {
                    const isEnabled = editingAdmin === admin.id 
                      ? editingPermissions[permission.key] 
                      : admin.permissions[permission.key];
                    
                    return (
                      <div
                        key={permission.key}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isEnabled 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-gray-900">{permission.label}</h5>
                              {isEnabled ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                          </div>
                          
                          {editingAdmin === admin.id && (
                            <button
                              onClick={() => togglePermission(permission.key)}
                              className={`ml-3 w-12 h-6 rounded-full transition-colors ${
                                isEnabled ? 'bg-green-600' : 'bg-gray-300'
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                              }`} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {adminsFiltres.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun administrateur trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
} 
