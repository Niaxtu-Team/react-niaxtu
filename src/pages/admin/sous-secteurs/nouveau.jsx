import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Simuler la liste des secteurs (à remplacer par un appel API)
const sectors = [
  { id: 1, name: 'Transport' },
  { id: 2, name: 'Eau' },
  { id: 3, name: 'Énergie' },
  { id: 4, name: 'Santé' },
  { id: 5, name: 'Éducation' },
  { id: 6, name: 'Environnement' },
];

export default function NewSubsector() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sectorId: '',
    description: '',
    status: 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implémenter la logique de soumission
    console.log('Form data:', formData);
    navigate('/admin/sous-secteurs');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/sous-secteurs')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour à la liste
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Nouveau sous-secteur</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du sous-secteur
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez le nom du sous-secteur"
              />
            </div>

            <div>
              <label htmlFor="sectorId" className="block text-sm font-medium text-gray-700 mb-1">
                Secteur parent
              </label>
              <select
                id="sectorId"
                name="sectorId"
                value={formData.sectorId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionnez un secteur</option>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez la description du sous-secteur"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/sous-secteurs')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer le sous-secteur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 