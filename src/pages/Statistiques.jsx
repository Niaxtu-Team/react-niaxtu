import { BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { AdminPageWrapper } from '../components/layout';
import { Card } from '../components/ui';

export default function Statistiques() {
  return (
    <AdminPageWrapper title="Statistiques et rapports">
      <div className="space-y-6">
        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total plaintes</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-sm text-green-600">+12% ce mois</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taux de résolution</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-sm text-green-600">+5% ce mois</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Utilisateurs actifs</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
                <p className="text-sm text-blue-600">+8% ce mois</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Temps moyen</p>
                <p className="text-2xl font-bold text-gray-900">2.4j</p>
                <p className="text-sm text-red-600">-0.3j ce mois</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Évolution des plaintes
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique à implémenter</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Répartition par secteur
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique à implémenter</p>
            </div>
          </Card>
        </div>

        {/* Tableau de bord détaillé */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rapport détaillé
          </h3>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Les statistiques détaillées seront disponibles prochainement.
            </p>
          </div>
        </Card>
      </div>
    </AdminPageWrapper>
  );
} 