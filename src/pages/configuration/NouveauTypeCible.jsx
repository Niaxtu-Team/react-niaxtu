import { useState } from 'react';
import { Target, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TypeFormBuilder } from '../../components';
import { useTargetTypes } from '../../hooks/useTargetTypes';

export default function NouveauTypeCible() {
  const navigate = useNavigate();
  const { createTargetType, loading } = useTargetTypes();
  
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      const result = await createTargetType(formData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/admin/cibles/types');
        }, 2000);
      } else {
        throw new Error(result.error || 'Erreur lors de la création du type de cible');
      }
    } catch (err) {
      console.error('Erreur:', err);
      throw err; // L'erreur sera gérée par TypeFormBuilder
    }
  };

  const handleCancel = () => {
    navigate('/admin/cibles/types');
  };

  // Catégories prédéfinies pour les cibles
  const categories = [
    'Administration',
    'Service Public',
    'Infrastructure',
    'Transport',
    'Santé',
    'Éducation',
    'Sécurité',
    'Environnement'
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Type de cible créé avec succès !</h3>
          <p className="text-gray-600 mb-4">Le nouveau type de cible a été ajouté.</p>
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
              <span className="bg-orange-100 p-3 rounded-xl shadow text-orange-500">
                <Target className="w-7 h-7" />
              </span>
              <div className="ml-4">
                <h1 className="text-3xl font-extrabold text-gray-800">Nouveau Type de Cible</h1>
                <p className="text-gray-600">Créer une nouvelle catégorie de cible</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <TypeFormBuilder
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          categories={categories}
          typeLabel="type de cible"
          showSeverity={false}
          showOptions={false}
        />
      </div>
    </div>
  );
} 
