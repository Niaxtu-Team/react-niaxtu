import { useState } from 'react';
import { Tag } from 'lucide-react';
import { AdminPageWrapper } from '../components/layout';
import { FormField } from '../components/forms';
import { Button } from '../components/ui';
import { validateRequired, validateLength } from '../utils';

export default function NouveauTypePlainte() {
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Veuillez corriger les erreurs du formulaire');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulation d'une API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFormData({ nom: '', description: '' });
      setMessage('Type de plainte créé avec succès !');
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      setMessage('Une erreur est survenue');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminPageWrapper title="Nouveau type de plainte">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Tag className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Créer un nouveau type</h2>
              <p className="text-sm text-gray-500">Ajoutez un nouveau type de plainte au système</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Nom du type"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Problème de transport"
              required
              error={errors.nom}
              helpText="Le nom doit être unique et descriptif"
            />
            
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description détaillée du type de plainte..."
              rows={4}
              helpText="Description optionnelle pour clarifier le type de plainte"
            />

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Annuler
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                icon={Tag}
                disabled={isLoading}
              >
                {isLoading ? 'Création...' : 'Créer le type'}
              </Button>
            </div>

            {message && (
              <div className="mt-4 text-center animate-bounce-in">
                <div className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                  message.includes('erreur') || message.includes('Erreur')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </AdminPageWrapper>
  );
} 