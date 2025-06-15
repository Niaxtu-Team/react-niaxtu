import { useState, useEffect } from 'react';
import { Layers, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { StructureFormBuilder } from '../../components';

export default function NouveauSousSecteur() {
  const navigate = useNavigate();
  const { apiService } = useAuth();
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
      const response = await apiService.post('/sectors/subsectors', formData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/sous-secteurs');
        }, 2000);
      } else {
        throw new Error(response.message || 'Erreur lors de la création du sous-secteur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      throw error; // L'erreur sera gérée par StructureFormBuilder
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/sous-secteurs');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sous-secteur créé avec succès !</h3>
          <p className="text-gray-600 mb-4">Le nouveau sous-secteur a été ajouté.</p>
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
                <Layers className="w-7 h-7" />
              </span>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Nouveau Sous-Secteur</h1>
                <p className="text-gray-600">Créer un nouveau sous-secteur d'activité</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <StructureFormBuilder
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          type="sous-secteur"
          parentOptions={secteurs}
          showContact={false}
          showLocation={false}
          showColor={false}
          showIcon={true}
        />
      </div>
    </div>
  );
} 
