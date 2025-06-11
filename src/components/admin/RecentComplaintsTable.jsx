const recentComplaints = [
  { id: '#1254', type: 'Retard', sector: 'Transport', status: 'Résolue', date: '2025-05-25', priority: 'low' },
  { id: '#1253', type: 'Fuite', sector: 'Eau', status: 'En traitement', date: '2025-05-24', priority: 'medium' },
  { id: '#1252', type: 'Panne', sector: 'Énergie', status: 'En attente', date: '2025-05-23', priority: 'high' },
  { id: '#1251', type: 'Propreté', sector: 'Environnement', status: 'Résolue', date: '2025-05-22', priority: 'low' },
  { id: '#1250', type: 'Accès', sector: 'Santé', status: 'Rejetée', date: '2025-05-21', priority: 'medium' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Résolue': return 'bg-green-100 text-green-800';
    case 'En traitement': return 'bg-blue-100 text-blue-800';
    case 'En attente': return 'bg-amber-100 text-amber-800';
    case 'Rejetée': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export default function RecentComplaintsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Dernières plaintes</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-200">
          Voir toutes les plaintes
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Secteur
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priorité
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentComplaints.map((complaint, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {complaint.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {complaint.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {complaint.sector}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {complaint.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full ${getPriorityColor(complaint.priority)} mr-2`}></span>
                    <span className="text-sm text-gray-500 capitalize">{complaint.priority}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3 transition-colors duration-200">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 