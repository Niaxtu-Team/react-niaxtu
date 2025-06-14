import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function NouvelAdmin() {
  const { apiService, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    role: 'moderator',
    permissions: [],
    profile: {
      firstName: '',
      lastName: '',
      phone: ''
    },
    isActive: true
  });

  // Rôles disponibles
  const roles = [
    { value: 'moderator', label: 'Modérateur', description: 'Gestion des plaintes uniquement' },
    { value: 'analyst', label: 'Analyste', description: 'Consultation et rapports' },
    { value: 'admin', label: 'Administrateur', description: 'Gestion générale' },
    { value: 'super_admin', label: 'Super Admin', description: 'Accès complet (réservé)' }
  ];

  // Permissions disponibles
  const availablePermissions = [
    { key: 'MANAGE_COMPLAINTS', label: 'Gérer les plaintes', category: 'Plaintes' },
    { key: 'DELETE_COMPLAINTS', label: 'Supprimer les plaintes', category: 'Plaintes' },
    { key: 'EXPORT_DATA', label: 'Exporter les données', category: 'Données' },
    { key: 'CREATE_STRUCTURES', label: 'Créer des structures', category: 'Configuration' },
    { key: 'MANAGE_STRUCTURES', label: 'Gérer les structures', category: 'Configuration' },
    { key: 'CREATE_SECTORS', label: 'Créer des secteurs', category: 'Configuration' },
    { key: 'MANAGE_SECTORS', label: 'Gérer les secteurs', category: 'Configuration' },
    { key: 'MANAGE_COMPLAINT_TYPES', label: 'Gérer les types de plaintes', category: 'Configuration' },
    { key: 'CREATE_COMPLAINT_TYPES', label: 'Créer des types de plaintes', category: 'Configuration' },
    { key: 'MANAGE_TARGET_TYPES', label: 'Gérer les types de cibles', category: 'Configuration' },
    { key: 'CREATE_TARGET_TYPES', label: 'Créer des types de cibles', category: 'Configuration' },
    { key: 'VIEW_REPORTS', label: 'Voir les rapports', category: 'Rapports' },
    { key: 'MANAGE_USERS', label: 'Gérer les utilisateurs', category: 'Administration' }
  ];

  // Permissions par rôle
  const rolePermissions = {
    moderator: ['MANAGE_COMPLAINTS', 'VIEW_REPORTS'],
    analyst: ['VIEW_REPORTS', 'EXPORT_DATA'],
    admin: ['MANAGE_COMPLAINTS', 'DELETE_COMPLAINTS', 'EXPORT_DATA', 'CREATE_STRUCTURES', 'MANAGE_STRUCTURES', 'CREATE_SECTORS', 'MANAGE_SECTORS', 'VIEW_REPORTS', 'MANAGE_USERS'],
    super_admin: availablePermissions.map(p => p.key)
  };

  // Vérifier les permissions d'accès
  if (!hasPermission('MANAGE_USERS') && !hasPermission('CREATE_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions pour créer des administrateurs.</p>
        </div>
      </div>
    );
  }

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];

    if (!formData.email.trim()) errors.push('L\'email est requis');
    if (!formData.displayName.trim()) errors.push('Le nom d\'affichage est requis');
    if (!formData.password.trim()) errors.push('Le mot de passe est requis');
    if (formData.password.length < 8) errors.push('Le mot de passe doit contenir au moins 8 caractères');
    if (formData.password !== formData.confirmPassword) errors.push('Les mots de passe ne correspondent pas');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Format d\'email invalide');
    }

    return errors;
  };

  // Gérer le changement de rôle
  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: rolePermissions[newRole] || []
    }));
  };

  // Gérer le changement de permissions
  const handlePermissionChange = (permission, checked) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);

    try {
      const adminData = {
        email: formData.email.trim(),
        displayName: formData.displayName.trim(),
        password: formData.password,
        role: formData.role,
        permissions: formData.permissions,
        profile: {
          firstName: formData.profile.firstName.trim(),
          lastName: formData.profile.lastName.trim(),
          phone: formData.profile.phone.trim()
        },
        isActive: formData.isActive
      };

      await apiService.post('/admin', adminData);

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/gestion-admins');
      }, 2000);

    } catch (error) {
      console.error('Erreur création admin:', error);
      setError(error.message || 'Erreur lors de la création de l\'administrateur');
    } finally {
      setLoading(false);
    }
  };

  // Regrouper les permissions par catégorie
  const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Administrateur créé !</h2>
          <p className="text-gray-600">Redirection vers la liste des administrateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-orange-100 p-3 rounded-xl shadow text-orange-500">
                <UserPlus className="w-7 h-7" />
              </span>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Nouvel Administrateur</h1>
                <p className="text-gray-600">Créer un nouveau compte administrateur</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/gestion-admins')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">Erreur</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informations générales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="admin@niaxtu.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'affichage *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.profile.firstName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    profile: { ...prev.profile, firstName: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Jean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de famille
                </label>
                <input
                  type="text"
                  value={formData.profile.lastName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    profile: { ...prev.profile, lastName: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.profile.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    profile: { ...prev.profile, phone: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Mot de passe
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* Rôle */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Rôle et permissions
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rôle *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roles.map(role => (
                    <div
                      key={role.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.role === role.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleRoleChange(role.value)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={() => handleRoleChange(role.value)}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions personnalisées */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissions supplémentaires
                </label>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissions.map(permission => (
                          <label key={permission.key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.key)}
                              onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                              className="text-orange-600 focus:ring-orange-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Statut du compte</h3>
                <p className="text-sm text-gray-500">Le compte sera-t-il actif dès sa création ?</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-900">Compte actif</span>
              </label>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/gestion-admins')}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer l'administrateur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
