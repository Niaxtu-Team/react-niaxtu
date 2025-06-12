import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { AdminPageWrapper } from '../components/layout';
import { Card, Button } from '../components/ui';
import { FormField } from '../components/forms';
import { useState } from 'react';

export default function ExporterDonnees() {
  const [exportConfig, setExportConfig] = useState({
    format: 'excel',
    dateDebut: '',
    dateFin: '',
    statut: '',
    secteur: ''
  });

  const handleChange = (name, value) => {
    setExportConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    console.log('Export avec configuration:', exportConfig);
    // Logique d'export à implémenter
  };

  return (
    <AdminPageWrapper title="Exporter les données">
      <div className="space-y-6">
        {/* Configuration d'export */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">Configuration d'export</h2>
              <p className="text-sm text-gray-500">Sélectionnez les données à exporter</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Format d'export"
              name="format"
              type="select"
              value={exportConfig.format}
              onChange={handleChange}
              options={[
                { value: 'excel', label: 'Excel (.xlsx)' },
                { value: 'csv', label: 'CSV (.csv)' },
                { value: 'pdf', label: 'PDF (.pdf)' },
                { value: 'json', label: 'JSON (.json)' }
              ]}
            />

            <FormField
              label="Type de données"
              name="type"
              type="select"
              value={exportConfig.type}
              onChange={handleChange}
              options={[
                { value: 'plaintes', label: 'Plaintes' },
                { value: 'utilisateurs', label: 'Utilisateurs' },
                { value: 'statistiques', label: 'Statistiques' },
                { value: 'tout', label: 'Toutes les données' }
              ]}
            />

            <FormField
              label="Date de début"
              name="dateDebut"
              type="date"
              value={exportConfig.dateDebut}
              onChange={handleChange}
            />

            <FormField
              label="Date de fin"
              name="dateFin"
              type="date"
              value={exportConfig.dateFin}
              onChange={handleChange}
            />

            <FormField
              label="Statut"
              name="statut"
              type="select"
              value={exportConfig.statut}
              onChange={handleChange}
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: 'en-attente', label: 'En attente' },
                { value: 'en-traitement', label: 'En traitement' },
                { value: 'resolues', label: 'Résolues' },
                { value: 'rejetees', label: 'Rejetées' }
              ]}
            />

            <FormField
              label="Secteur"
              name="secteur"
              type="select"
              value={exportConfig.secteur}
              onChange={handleChange}
              options={[
                { value: '', label: 'Tous les secteurs' },
                { value: 'transport', label: 'Transport' },
                { value: 'sante', label: 'Santé' },
                { value: 'education', label: 'Éducation' },
                { value: 'environnement', label: 'Environnement' }
              ]}
            />
          </div>

          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="primary"
              icon={Download}
              onClick={handleExport}
            >
              Exporter les données
            </Button>
          </div>
        </Card>

        {/* Exports récents */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Exports récents
          </h3>
          
          <div className="space-y-3">
            {[
              { nom: 'Plaintes_2025-06.xlsx', date: '2025-06-11', taille: '2.4 MB', statut: 'Terminé' },
              { nom: 'Utilisateurs_2025-06.csv', date: '2025-06-10', taille: '856 KB', statut: 'Terminé' },
              { nom: 'Statistiques_2025-05.pdf', date: '2025-06-09', taille: '1.2 MB', statut: 'Terminé' }
            ].map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{export_.nom}</p>
                    <p className="text-sm text-gray-500">
                      {export_.date} • {export_.taille}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {export_.statut}
                  </span>
                  <Button variant="outline" size="sm" icon={Download}>
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Informations */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Informations sur l'export
              </h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Les exports sont générés en arrière-plan</li>
                  <li>Vous recevrez une notification une fois l'export terminé</li>
                  <li>Les fichiers sont conservés 30 jours</li>
                  <li>Taille maximale : 100 MB par export</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminPageWrapper>
  );
} 