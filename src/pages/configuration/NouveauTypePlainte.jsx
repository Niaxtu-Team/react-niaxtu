import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Tag, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { TypeFormBuilder } from '../../components';

export default function NouveauTypePlainte() {
  const { apiService } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [secteurs, setSecteurs] = useState([]);

  // Charger les secteurs pour le sélecteur
  useEffect(() => {
    fetchSecteurs();
  }, []);

  const fetchSecteurs = async () => {
    try {
      const response = await apiService.get('/sectors');
      if (response.success) {
        setSecteurs(response.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des secteurs:', error);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);

    try {
      const response = await apiService.post('/types/complaints', formData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/plaintes/types');
        }, 2000);
      } else {
        throw new Error(response.message || 'Erreur lors de la création du type');
      }
    } catch (error) {
      console.error('Erreur:', error);
      // L'erreur sera gérée par TypeFormBuilder
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/plaintes/types');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Type créé avec succès !</h3>
          <p className="text-gray-600 mb-4">Le nouveau type de plainte a été ajouté.</p>
          <div className="text-sm text-gray-500">Redirection en cours...</div>
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
              <button
                onClick={handleCancel}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="bg-purple-100 p-3 rounded-xl shadow text-purple-500">
                <Tag className="w-7 h-7" />
              </span>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Nouveau Type de Plainte</h1>
                <p className="text-gray-600">Créer une nouvelle catégorie de plainte</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <TypeFormBuilder
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          sectors={secteurs}
          typeLabel="type de plainte"
          showSeverity={true}
          showOptions={true}
        />
      </div>
    </div>
  );
} 
