import React, { useState } from 'react';

const GetUsersButton = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/all');

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Réponse non-JSON reçue:', text.substring(0, 200));
        throw new Error('La réponse n\'est pas au format JSON');
      }

      const data = await response.json();
      console.log('Réponse API:', data);
      setUsers(data.users || data || []);
    } catch (err) {
      console.error('Erreur lors du fetch:', err);
      setError(`Impossible de charger les utilisateurs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      <button
        onClick={fetchUsers}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded mb-4"
      >
        Charger les utilisateurs
      </button>

      {loading && <p className="text-yellow-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {users.length > 0 && (
        <ul className="space-y-2 mt-4">
          {users.map((user, index) => (
            <li
              key={index}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded"
            >
              {JSON.stringify(user)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GetUsersButton;
