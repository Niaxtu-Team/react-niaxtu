import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAdminPermissions = () => {
  const { apiService } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdmins = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.get('/admin/users', filters);
      
      if (response.success) {
        setAdmins(response.users);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des administrateurs');
      }
    } catch (err) {
      console.error('Erreur chargement admins:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await apiService.get('/admin/permissions');
      
      if (response.success) {
        setPermissions(response.permissions);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des permissions');
      }
    } catch (err) {
      console.error('Erreur chargement permissions:', err);
      throw err;
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.get('/admin/roles');
      
      if (response.success) {
        setRoles(response.roles);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des rôles');
      }
    } catch (err) {
      console.error('Erreur chargement rôles:', err);
      throw err;
    }
  };

  const updateAdminPermissions = async (adminId, newPermissions) => {
    try {
      const response = await apiService.put(`/admin/users/${adminId}/permissions`, {
        permissions: newPermissions
      });
      
      if (response.success) {
        // Mettre à jour l'admin dans la liste locale
        setAdmins(prev => prev.map(admin => 
          admin.id === adminId 
            ? { ...admin, permissions: newPermissions }
            : admin
        ));
        
        return response.user;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour des permissions');
      }
    } catch (err) {
      console.error('Erreur mise à jour permissions:', err);
      throw err;
    }
  };

  const updateAdminRole = async (adminId, newRole) => {
    try {
      const response = await apiService.put(`/admin/users/${adminId}/role`, {
        role: newRole
      });
      
      if (response.success) {
        // Mettre à jour l'admin dans la liste locale
        setAdmins(prev => prev.map(admin => 
          admin.id === adminId 
            ? { ...admin, role: newRole }
            : admin
        ));
        
        return response.user;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du rôle');
      }
    } catch (err) {
      console.error('Erreur mise à jour rôle:', err);
      throw err;
    }
  };

  const toggleAdminStatus = async (adminId, isActive) => {
    try {
      const response = await apiService.put(`/admin/users/${adminId}/status`, {
        isActive
      });
      
      if (response.success) {
        // Mettre à jour l'admin dans la liste locale
        setAdmins(prev => prev.map(admin => 
          admin.id === adminId 
            ? { ...admin, isActive }
            : admin
        ));
        
        return response.user;
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du statut');
      }
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      throw err;
    }
  };

  const createAdmin = async (adminData) => {
    try {
      const response = await apiService.post('/admin/users', adminData);
      
      if (response.success) {
        // Ajouter le nouvel admin à la liste locale
        setAdmins(prev => [...prev, response.user]);
        
        return response.user;
      } else {
        throw new Error(response.message || 'Erreur lors de la création de l\'administrateur');
      }
    } catch (err) {
      console.error('Erreur création admin:', err);
      throw err;
    }
  };

  const deleteAdmin = async (adminId) => {
    try {
      const response = await apiService.delete(`/admin/users/${adminId}`);
      
      if (response.success) {
        // Supprimer l'admin de la liste locale
        setAdmins(prev => prev.filter(admin => admin.id !== adminId));
        
        return true;
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression de l\'administrateur');
      }
    } catch (err) {
      console.error('Erreur suppression admin:', err);
      throw err;
    }
  };

  const getAdminById = (adminId) => {
    return admins.find(admin => admin.id === adminId);
  };

  const getAdminsByRole = (role) => {
    return admins.filter(admin => admin.role === role);
  };

  const getAdminsWithPermission = (permission) => {
    return admins.filter(admin => 
      admin.permissions && admin.permissions.includes(permission)
    );
  };

  useEffect(() => {
    fetchAdmins();
    fetchPermissions();
    fetchRoles();
  }, []);

  return {
    admins,
    permissions,
    roles,
    loading,
    error,
    fetchAdmins,
    fetchPermissions,
    fetchRoles,
    updateAdminPermissions,
    updateAdminRole,
    toggleAdminStatus,
    createAdmin,
    deleteAdmin,
    getAdminById,
    getAdminsByRole,
    getAdminsWithPermission,
    refresh: () => {
      fetchAdmins();
      fetchPermissions();
      fetchRoles();
    }
  };
}; 