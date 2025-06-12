import { useState } from 'react';
import { Building } from 'lucide-react';
import { AdminPageWrapper } from '../components/layout';
import { FormField } from '../components/forms';
import { Button } from '../components/ui';

export default function NouveauSecteur() {
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulation API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Secteur créé avec succès !');
      setFormData({ nom: '', description: '' });
      setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      setMessage('Une erreur est survenue');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminPageWrapper title="Nouveau secteur">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Créer un nouveau secteur</h2>
              <p className="text-sm text-gray-500">Ajoutez un nouveau secteur d'activité</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Nom du secteur"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Transport"
              required
            />
            
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description du secteur..."
              rows={4}
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
                icon={Building}
                disabled={isLoading}
              >
                {isLoading ? 'Création...' : 'Créer le secteur'}
              </Button>
            </div>

            {message && (
              <div className="mt-4 text-center animate-bounce-in">
                <div className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                  message.includes('erreur') 
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