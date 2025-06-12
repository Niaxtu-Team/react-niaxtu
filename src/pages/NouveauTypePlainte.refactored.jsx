import { useState } from 'react';
import { Tag } from 'lucide-react';
import { FormLayout, FormField } from '../components/forms';
import { validateRequired, validateLength } from '../utils';

export default function NouveauTypePlainte() {
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nomError = validateRequired(formData.nom, 'Le nom du type');
    if (nomError) newErrors.nom = nomError;
    
    const lengthError = validateLength(formData.nom, 2, 50, 'Le nom du type');
    if (lengthError) newErrors.nom = lengthError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return { error: 'Veuillez corriger les erreurs du formulaire' };
    }

    // Simulation d'une API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    setFormData({ nom: '', description: '' });
    
    return { 
      success: true, 
      message: 'Type de plainte créé avec succès !' 
    };
  };

  return (
    <FormLayout
      title="Nouveau type de plainte"
      icon={Tag}
      iconColor="text-indigo-500"
      iconBg="bg-indigo-100"
      onSubmit={handleSubmit}
      submitText="Créer le type"
      submitIcon={Tag}
    >
      <FormField
        label="Nom du type"
        name="nom"
        type="text"
        value={formData.nom}
        onChange={handleChange}
        placeholder="Nom du type"
        required
        error={errors.nom}
      />
      
      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description du type de plainte"
        rows={3}
      />
    </FormLayout>
  );
} 