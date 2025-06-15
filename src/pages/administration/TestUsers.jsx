import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function TestUsers() {
  const { apiService } = useAuth();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testEndpoint = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log(`[TEST] Appel vers: ${endpoint}`);
      const result = await apiService.get(endpoint);
      console.log(`[TEST] Réponse de ${endpoint}:`, result);
      setResponse(result);
    } catch (err) {
      console.error(`[TEST] Erreur sur ${endpoint}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Test API Utilisateurs</h1>
        <p className="text-gray-600">Page de test pour diagnostiquer les endpoints utilisateurs</p>
      </div>

      {/* Boutons de test */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => testEndpoint('/users')}
          disabled={loading}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          GET /users
        </button>

        <button
          onClick={() => testEndpoint('/users/all')}
          disabled={loading}
          className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          GET /users/all
        </button>

        <button
          onClick={() => testEndpoint('/users/profile')}
          disabled={loading}
          className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          GET /users/profile
        </button>

        <button
          onClick={() => testEndpoint('/users?page=1&limit=10')}
          disabled={loading}
          className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          GET /users?page=1&limit=10
        </button>

        <button
          onClick={() => testEndpoint('/users/all?page=1&limit=10')}
          disabled={loading}
          className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          GET /users/all?page=1&limit=10
        </button>

        <button
          onClick={() => testEndpoint('/admin/users')}
          disabled={loading}
          className="p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          GET /admin/users
        </button>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Test en cours...</span>
        </div>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Erreur</h3>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {/* Affichage de la réponse */}
      {response && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Réponse (Type: {typeof response})
          </h3>
          <div className="space-y-2">
            <div className="text-sm text-green-700">
              <strong>Clés:</strong> {Object.keys(response || {}).join(', ')}
            </div>
            {response.success !== undefined && (
              <div className="text-sm text-green-700">
                <strong>Success:</strong> {response.success ? 'true' : 'false'}
              </div>
            )}
            {response.data && (
              <div className="text-sm text-green-700">
                <strong>Nombre d'éléments dans data:</strong> {response.data.length}
              </div>
            )}
            {response.users && (
              <div className="text-sm text-green-700">
                <strong>Nombre d'éléments dans users:</strong> {response.users.length}
              </div>
            )}
            {response.pagination && (
              <div className="text-sm text-green-700">
                <strong>Pagination:</strong> page {response.pagination.page}, total {response.pagination.total}
              </div>
            )}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-green-800 font-medium">
              Voir la réponse complète (JSON)
            </summary>
            <pre className="mt-2 text-xs text-green-700 bg-green-100 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Cliquez sur les boutons pour tester différents endpoints</li>
          <li>• Ouvrez la console (F12) pour voir les logs détaillés</li>
          <li>• Vérifiez quelle route fonctionne et retourne vos utilisateurs</li>
          <li>• Une fois trouvée, nous l'utiliserons dans le hook useUsers</li>
        </ul>
      </div>
    </div>
  );
} 
