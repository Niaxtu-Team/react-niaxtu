import React, { useState } from 'react';

export default function ParametresAdmin() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-white py-10">
      <style>{`
        .settings-card {
          background: rgba(255,255,255,0.92);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
          border-radius: 2rem;
          padding: 2.5rem 2rem 2rem 2rem;
          max-width: 370px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .toggle-switch {
          width: 56px;
          height: 32px;
          background: #e5e7eb;
          border-radius: 999px;
          position: relative;
          cursor: pointer;
          transition: background 0.3s;
        }
        .toggle-switch.dark {
          background: #7c3aed;
        }
        .toggle-knob {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 24px;
          height: 24px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(124,58,237,0.10);
          transition: left 0.3s, background 0.3s;
        }
        .toggle-switch.dark .toggle-knob {
          left: 28px;
          background: #4c1d95;
        }
      `}</style>
      <div className="settings-card">
        <h2 className="text-2xl font-bold mb-6 text-purple-700">Paramètres</h2>
        <div className="flex items-center justify-between w-full mb-2">
          <span className="text-lg font-medium text-gray-700">Mode sombre</span>
          <div
            className={`toggle-switch${darkMode ? ' dark' : ''}`}
            onClick={() => setDarkMode(!darkMode)}
            title="Basculer le mode sombre"
          >
            <div className="toggle-knob"></div>
          </div>
        </div>
        <div className="mt-4 text-gray-500 text-sm">(Plus d'options à venir...)</div>
      </div>
    </div>
  );
} 