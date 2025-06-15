import { useState } from 'react'

function Connexion() {
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [indicatif, setIndicatif] = useState('+33')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (mode === 'email') {
      console.log("Connexion avec l'email :", email, password)
    } else {
      console.log("Connexion avec le téléphone :", indicatif + telephone, password)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'email' ? 'telephone' : 'email')
  }

  const indicatifs = [
    { code: '+1', label: 'Etats-Unis' },
    { code: '+33', label: 'France' },
    { code: '+44', label: 'Royaume-Uni' },
    { code: '+49', label: 'Allemagne' },
    { code: '+39', label: 'Italie' },
    { code: '+34', label: 'Espagne' },
    { code: '+32', label: 'Belgique' },
    { code: '+41', label: 'Suisse' },
    { code: '+237', label: 'Cameroun' },
    { code: '+225', label: "Côte d'Ivoire" },
    { code: '+221', label: 'Sénégal' },
    { code: '+216', label: 'Tunisie' },
    { code: '+213', label: 'Algérie' },
    { code: '+212', label: 'Maroc' },
    { code: '+20', label: 'Égypte' },
    { code: '+234', label: 'Nigéria' },
    { code: '+254', label: 'Kenya' },
    { code: '+27', label: 'Afrique du Sud' },
    { code: '+965', label: 'Koweït' },
    { code: '+966', label: 'Arabie Saoudite' },
    { code: '+971', label: 'Émirats Arabes Unis' },
    { code: '+91', label: 'Inde' },
    { code: '+81', label: 'Japon' },
    { code: '+86', label: 'Chine' },
    { code: '+90', label: 'Turquie' },
  ]

  return (
    <>
      <style>{`
        .toggle-mode {
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: rgba(124, 58, 237, 0.1);
        }
        .toggle-mode:hover {
          color: #7c3aed;
          background: rgba(124, 58, 237, 0.2);
          transform: translateY(-2px);
        }

        .inputField {
          border: 2px solid #e2e8f0;
          border-radius: 30px;
          padding: 1rem 1.5rem;
          transition: all 0.4s ease;
          font-size: 0.95rem;
          background: #f8fafc;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .inputField:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
          outline: none;
          transform: translateY(-1px);
        }

        button[type="submit"] {
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #6b21a8);
          color: white;
          cursor: pointer;
          font-weight: 600;
          border-radius: 30px;
          height: 48px;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        }
        button[type="submit"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }
        button[type="submit"]::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          transition: left 0.7s ease;
          z-index: 1;
        }
        button[type="submit"]:hover::before {
          left: 100%;
        }

        .form-container {
          animation: fadeInUp 0.8s ease forwards;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .logo-container::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 3px;
          background: linear-gradient(90deg, #7c3aed, #6b21a8);
          border-radius: 3px;
        }

        .bg-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: linear-gradient(135deg, #4f46e5, #7c3aed, #6b21a8);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="bg-animation"></div>
        <form
          onSubmit={handleLogin}
          className="form-container w-[400px] p-8 rounded-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col items-center"
        >
          <div className="logo-container">
            <img 
              src="/logo.png" 
              alt="Niaxtu" 
              className="w-50 h-50 mb-0 transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          <h2 className="text-[2.5em] text-[#2e2e2e] font-bold mb-2 bg-gradient-to-r from-[#7c3aed] to-[#6b21a8] bg-clip-text text-transparent">Connexion</h2>

          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-mode text-sm"
            >
              Se connecter par {mode === 'email' ? 'téléphone' : 'email'}
            </button>
          </div>

          {/* Email ou téléphone */}
          <div className="w-full mb-4">
            {mode === 'telephone' && (
              <div className="mb-3">
                <select
                  value={indicatif}
                  onChange={(e) => setIndicatif(e.target.value)}
                  className="inputField w-full text-black text-sm font-medium"
                >
                  {indicatifs.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label} ({item.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative w-full flex items-center">
              <input
                type={mode === 'email' ? 'email' : 'text'}
                placeholder={mode === 'email' ? 'Email' : 'Téléphone'}
                className="inputField w-full text-black text-sm font-medium"
                value={mode === 'email' ? email : telephone}
                onChange={(e) =>
                  mode === 'email' ? setEmail(e.target.value) : setTelephone(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="relative w-full flex items-center mb-6">
            <input
              type="password"
              placeholder="Mot de passe"
              className="inputField w-full text-black text-sm font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Bouton de connexion */}
          <button type="submit" className="relative w-full mb-6">
            <a href="/admin" className="block w-full h-full flex items-center justify-center">Se connecter</a>
          </button>

          {/* Lien d'inscription */}
          <div className="mt-4 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-gray-600">Pas de compte ?</p>
            <a
              href="/Page2"
              className="text-sm font-medium bg-gradient-to-r from-[#7c3aed] to-[#6b21a8] text-white px-6 py-2 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Créez-en un
            </a>
          </div>
        </form>
      </div>
    </>
  )
}

export default Connexion
