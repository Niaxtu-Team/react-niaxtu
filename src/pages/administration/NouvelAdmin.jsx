import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, CheckCircle } from 'lucide-react';
import { FormBuilder } from '../../components';

export default function NouvelAdmin() {
  const { apiService, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  // Soumettre le formulaire
  const handleSubmit = async (formData) => {
    setError(null);
    setLoading(true);

    try {
      const adminData = {
        email: formData.email.trim(),
        displayName: formData.displayName.trim(),
        password: formData.password,
        role: formData.role,
        permissions: rolePermissions[formData.role] || [],
        profile: {
          firstName: formData.firstName?.trim() || '',
          lastName: formData.lastName?.trim() || '',
          phone: formData.phone?.trim() || ''
        },
        isActive: formData.isActive !== false
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

  // Configuration des champs de formulaire
  const formFields = [
    {
      name: 'email',
      type: 'email',
      label: 'Adresse email',
      placeholder: 'admin@exemple.com',
      required: true
    },
    {
      name: 'displayName',
      type: 'text',
      label: 'Nom d\'affichage',
      placeholder: 'Nom visible dans l\'interface',
      required: true
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'Prénom',
      placeholder: 'Prénom de l\'administrateur'
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Nom de famille',
      placeholder: 'Nom de famille'
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Téléphone',
      placeholder: '+33 1 23 45 67 89'
    },
    {
      name: 'password',
      type: 'password',
      label: 'Mot de passe',
      placeholder: 'Minimum 8 caractères',
      required: true,
      minLength: 8
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirmer le mot de passe',
      placeholder: 'Retapez le mot de passe',
      required: true,
      validation: (value, formData) => {
        if (value !== formData.password) {
          return 'Les mots de passe ne correspondent pas';
        }
        return null;
      }
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rôle',
      required: true,
      options: roles.map(role => ({
        value: role.value,
        label: `${role.label} - ${role.description}`
      }))
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Compte actif'
    }
  ];

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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-sm">
                <h3 className="font-medium text-red-800">Erreur de validation</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <FormBuilder
          fields={formFields}
          initialData={{
            role: 'moderator',
            isActive: true
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/gestion-admins')}
          loading={loading}
          submitLabel="Créer l'administrateur"
          cancelLabel="Annuler"
        />
      </div>
    </div>
  );
} 
