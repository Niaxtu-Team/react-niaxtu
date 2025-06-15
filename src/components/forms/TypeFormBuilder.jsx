import { useState, useEffect } from 'react';
import { 
  Tag, 
  Building2, 
  FileText, 
  Hash, 
  AlertTriangle,
  MapPin,
  Camera,
  Zap,
  Plus,
  X
} from 'lucide-react';
import { FormBuilder } from '../index';

const TypeFormBuilder = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  sectors = [],
  categories = [],
  typeLabel = "type",
  showSeverity = true,
  showOptions = true,
  className = ""
}) => {
  const [keywords, setKeywords] = useState(
    initialData.keywords || []
  );
  const [newKeyword, setNewKeyword] = useState('');

  // Champs de base pour tous les types
  const baseFields = [
    {
      name: 'name',
      type: 'text',
      label: `Nom du ${typeLabel}`,
      placeholder: `Ex: Problème d'éclairage public`,
      required: true,
      icon: Tag
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: `Décrivez ce ${typeLabel} en détail...`,
      rows: 4,
      icon: FileText
    }
  ];

  // Champs conditionnels
  const conditionalFields = [];

  // Secteur (si fourni)
  if (sectors.length > 0) {
    conditionalFields.push({
      name: 'sectorId',
      type: 'select',
      label: 'Secteur',
      required: true,
      icon: Building2,
      options: [
        { value: '', label: 'Sélectionner un secteur' },
        ...sectors.map(sector => ({
          value: sector.id,
          label: sector.name
        }))
      ]
    });
  }

  // Catégorie (si fournie)
  if (categories.length > 0) {
    conditionalFields.push({
      name: 'category',
      type: 'select',
      label: 'Catégorie',
      icon: Tag,
      options: [
        { value: '', label: 'Sélectionner une catégorie' },
        ...categories.map(cat => ({
          value: cat,
          label: cat
        }))
      ]
    });
  }

  // Code
  conditionalFields.push({
    name: 'code',
    type: 'text',
    label: 'Code (optionnel)',
    placeholder: 'Généré automatiquement si vide',
    icon: Hash
  });

  // Sévérité (pour les plaintes)
  if (showSeverity) {
    conditionalFields.push({
      name: 'severity',
      type: 'select',
      label: 'Niveau de sévérité',
      icon: AlertTriangle,
      options: [
        { value: 'faible', label: 'Faible' },
        { value: 'moyenne', label: 'Moyenne' },
        { value: 'élevée', label: 'Élevée' }
      ]
    });
  }

  // Options spéciales (pour les plaintes)
  const optionFields = showOptions ? [
    {
      name: 'requiresLocation',
      type: 'checkbox',
      label: 'Localisation requise',
      icon: MapPin
    },
    {
      name: 'requiresEvidence',
      type: 'checkbox',
      label: 'Preuves requises',
      icon: Camera
    },
    {
      name: 'autoAssign',
      type: 'checkbox',
      label: 'Attribution automatique',
      icon: Zap
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Actif'
    }
  ] : [
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Actif'
    }
  ];

  // Tous les champs
  const allFields = [...baseFields, ...conditionalFields, ...optionFields];

  // Gestion des mots-clés
  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  // Soumission avec mots-clés
  const handleSubmit = (formData) => {
    const submitData = {
      ...formData,
      keywords: keywords,
      // Générer le code automatiquement si vide
      code: formData.code || formData.name?.toUpperCase().replace(/\s+/g, '_')
    };
    onSubmit(submitData);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Formulaire principal */}
      <FormBuilder
        fields={allFields}
        initialData={{
          severity: 'moyenne',
          isActive: true,
          ...initialData
        }}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={loading}
        submitLabel={`Créer le ${typeLabel}`}
        cancelLabel="Annuler"
      />

      {/* Section mots-clés personnalisée */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Mots-clés
        </h3>
        
        <div className="space-y-4">
          {/* Ajouter un mot-clé */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={handleKeywordKeyPress}
              placeholder="Ajouter un mot-clé..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={addKeyword}
              disabled={!newKeyword.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>

          {/* Liste des mots-clés */}
          {keywords.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Mots-clés ajoutés ({keywords.length}) :
              </p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {keywords.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Aucun mot-clé ajouté. Les mots-clés aident à la recherche et à la catégorisation.
            </p>
          )}
        </div>
      </div>

      {/* Informations d'aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-1">Conseils pour créer un {typeLabel} :</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Choisissez un nom clair et descriptif</li>
              <li>• Ajoutez une description détaillée pour aider les utilisateurs</li>
              <li>• Utilisez des mots-clés pertinents pour faciliter la recherche</li>
              {showSeverity && <li>• Définissez le niveau de sévérité approprié</li>}
              {showOptions && <li>• Configurez les options selon vos besoins</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeFormBuilder; 