import { useState } from 'react';
import { Building2 } from 'lucide-react';

export default function NouveauSecteur() {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nom.trim()) {
      setMessage('Le nom du secteur est requis.');
      return;
    }
    setMessage('Secteur créé avec succès !');
    setNom('');
    setDescription('');
    setTimeout(() => setMessage(''), 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in">
        <div className="flex items-center mb-6">
          <span className="bg-blue-100 p-3 rounded-xl shadow text-blue-500">
            <Building2 className="w-7 h-7" />
          </span>
          <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">Nouveau secteur</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Nom du secteur *</label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              placeholder="Nom du secteur"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition resize-none min-h-[60px]"
              placeholder="Description"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-bold py-3 rounded-xl shadow hover:bg-blue-200 transition-all duration-200 text-lg"
          >
            <Building2 className="w-5 h-5" />
            Créer le secteur
          </button>
          {message && (
            <div className="mt-4 text-center animate-bounce-in">
              <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full shadow font-semibold">
                {message}
              </span>
            </div>
          )}
        </form>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,2,.6,1) both; }
          @keyframes bounce-in {
            0% { transform: scale(0.7); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
          }
          .animate-bounce-in { animation: bounce-in 0.7s cubic-bezier(.4,2,.6,1) both; }
        `}</style>
      </div>
    </div>
  );
} 
