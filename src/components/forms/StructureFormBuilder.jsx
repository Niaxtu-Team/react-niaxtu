import { useState } from 'react';
import { 
  Building, 
  Building2, 
  Landmark, 
  Layers,
  FileText, 
  Hash, 
  Phone,
  Mail,
  MapPin,
  User,
  Palette
} from 'lucide-react';
import { FormBuilder } from '../index';

const StructureFormBuilder = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  type = 'structure', // 'ministere', 'direction', 'service', 'secteur', 'sous-secteur'
  parentOptions = [], // ministères pour directions, directions pour services, secteurs pour sous-secteurs
  showContact = true,
  showLocation = false,
  showColor = false,
  showIcon = false,
  className = ""
}) => {
  // Champs de base pour toutes les structures
  const baseFields = [
    {
      name: 'nom',
      type: 'text',
      label: `Nom ${getTypeLabel(type)}`,
      placeholder: `Ex: ${getTypePlaceholder(type)}`,
      required: true,
      icon: getTypeIcon(type)
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: `Décrivez ce ${getTypeLabel(type)} en détail...`,
      rows: 4,
      icon: FileText
    },
    {
      name: 'code',
      type: 'text',
      label: 'Code (optionnel)',
      placeholder: 'Généré automatiquement si vide',
      icon: Hash
    }
  ];

  // Champs conditionnels selon le type
  const conditionalFields = [];

  // Champ parent selon le type
  if (parentOptions.length > 0) {
    const parentField = getParentField(type, parentOptions);
    if (parentField) {
      conditionalFields.push(parentField);
    }
  }

  // Champs de contact
  const contactFields = showContact ? [
    {
      name: 'contact.telephone',
      type: 'tel',
      label: 'Téléphone',
      placeholder: '+212 5XX-XXXXXX',
      icon: Phone
    },
    {
      name: 'contact.email',
      type: 'email',
      label: 'Email',
      placeholder: 'contact@ministere.gov.ma',
      icon: Mail
    },
    {
      name: 'contact.adresse',
      type: 'textarea',
      label: 'Adresse',
      placeholder: 'Adresse complète...',
      rows: 2,
      icon: MapPin
    }
  ] : [];

  // Champs de localisation (pour services)
  const locationFields = showLocation ? [
    {
      name: 'localisation.adresse',
      type: 'textarea',
      label: 'Adresse de localisation',
      placeholder: 'Adresse précise du service...',
      rows: 2,
      icon: MapPin
    },
    {
      name: 'localisation.latitude',
      type: 'number',
      label: 'Latitude',
      placeholder: '33.5731',
      step: 'any'
    },
    {
      name: 'localisation.longitude',
      type: 'number',
      label: 'Longitude',
      placeholder: '-7.5898',
      step: 'any'
    }
  ] : [];

  // Champs spéciaux pour secteurs
  const sectorFields = (type === 'secteur' || type === 'sous-secteur') ? [
    ...(showIcon ? [{
      name: 'icon',
      type: 'text',
      label: 'Icône',
      placeholder: 'Nom de l\'icône Lucide',
      icon: Building
    }] : []),
    ...(showColor ? [{
      name: 'color',
      type: 'color',
      label: 'Couleur',
      icon: Palette
    }] : [])
  ] : [];

  // Champ responsable
  const responsableField = {
    name: 'responsable',
    type: 'text',
    label: 'Responsable',
    placeholder: 'Nom du responsable',
    icon: User
  };

  // Champ statut
  const statusField = {
    name: 'actif',
    type: 'checkbox',
    label: 'Structure active'
  };

  // Tous les champs
  const allFields = [
    ...baseFields,
    ...conditionalFields,
    ...contactFields,
    ...locationFields,
    ...sectorFields,
    responsableField,
    statusField
  ];

  // Soumission avec traitement des données
  const handleSubmit = (formData) => {
    const submitData = {
      ...formData,
      // Générer le code automatiquement si vide
      code: formData.code || formData.nom?.toUpperCase().replace(/\s+/g, '_'),
      // Assurer la structure des objets imbriqués
      contact: formData.contact || {},
      localisation: formData.localisation || {}
    };
    onSubmit(submitData);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Formulaire principal */}
      <FormBuilder
        fields={allFields}
        initialData={{
          actif: true,
          color: '#3B82F6',
          ...initialData
        }}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={loading}
        submitLabel={`Créer ${getTypeLabel(type)}`}
        cancelLabel="Annuler"
      />

      {/* Informations d'aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-0.5">
            {getTypeIcon(type)({ className: "w-5 h-5" })}
          </div>
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-1">Conseils pour créer {getTypeLabel(type)} :</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Choisissez un nom clair et officiel</li>
              <li>• Ajoutez une description détaillée des missions</li>
              <li>• Le code sera généré automatiquement si non spécifié</li>
              {showContact && <li>• Renseignez les informations de contact pour faciliter les échanges</li>}
              {showLocation && <li>• La localisation précise aide les citoyens à trouver le service</li>}
              {type === 'secteur' && <li>• Choisissez une couleur distinctive pour l'identification visuelle</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonctions utilitaires
function getTypeLabel(type) {
  switch (type) {
    case 'ministere': return 'le ministère';
    case 'direction': return 'la direction';
    case 'service': return 'le service';
    case 'secteur': return 'le secteur';
    case 'sous-secteur': return 'le sous-secteur';
    default: return 'la structure';
  }
}

function getTypePlaceholder(type) {
  switch (type) {
    case 'ministere': return 'Ministère de l\'Intérieur';
    case 'direction': return 'Direction Générale des Collectivités Locales';
    case 'service': return 'Service des Affaires Administratives';
    case 'secteur': return 'Transport Public';
    case 'sous-secteur': return 'Transport Urbain';
    default: return 'Nom de la structure';
  }
}

function getTypeIcon(type) {
  switch (type) {
    case 'ministere': return Landmark;
    case 'direction': return Building2;
    case 'service': return Building;
    case 'secteur': return Layers;
    case 'sous-secteur': return Layers;
    default: return Building;
  }
}

function getParentField(type, parentOptions) {
  switch (type) {
    case 'direction':
      return {
        name: 'ministereId',
        type: 'select',
        label: 'Ministère de tutelle',
        required: true,
        icon: Landmark,
        options: [
          { value: '', label: 'Sélectionner un ministère' },
          ...parentOptions.map(item => ({
            value: item.id,
            label: item.nom || item.name
          }))
        ]
      };
    case 'service':
      return {
        name: 'directionId',
        type: 'select',
        label: 'Direction de rattachement',
        required: true,
        icon: Building2,
        options: [
          { value: '', label: 'Sélectionner une direction' },
          ...parentOptions.map(item => ({
            value: item.id,
            label: item.nom || item.name
          }))
        ]
      };
    case 'sous-secteur':
      return {
        name: 'sectorId',
        type: 'select',
        label: 'Secteur parent',
        required: true,
        icon: Layers,
        options: [
          { value: '', label: 'Sélectionner un secteur' },
          ...parentOptions.map(item => ({
            value: item.id,
            label: item.nom || item.name
          }))
        ]
      };
    default:
      return null;
  }
}

export default StructureFormBuilder; 