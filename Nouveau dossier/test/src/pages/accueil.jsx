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
    { code: '+225', label: 'Côte d’Ivoire' },
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
          transition: color 0.3s ease, text-decoration-color 0.3s ease;
          cursor: pointer;
        }
        .toggle-mode:hover {
          color: #7c3aed;
          text-decoration: underline;
        }

        .inputField {
          border: 2px solid #ccc;
          border-radius: 30px;
          padding-left: 1.5rem;
          transition: border-color 0.4s ease, box-shadow 0.3s ease;
          font-size: 0.9rem;
        }
        .inputField:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 8px rgba(124, 58, 237, 0.6);
          outline: none;
        }

        button[type="submit"] {
          position: relative;
          overflow: hidden;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          border: 2px solid #6b21a8;
          background-color: #7c3aed;
          color: white;
          cursor: pointer;
          font-weight: 600;
          border-radius: 30px;
          height: 40px;
        }
        button[type="submit"]:hover {
          background-color: #6b21a8;
          box-shadow: 0 0 15px #7c3aed;
        }
        button[type="submit"]::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
          z-index: 0;
          border-radius: 30px;
        }
        button[type="submit"]:hover::before {
          left: 100%;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 via-blue-900 to-gray-900 px-4">
        <form
          onSubmit={handleLogin}
          className="w-[360px] bg-white p-8 rounded-[30px] shadow-[0_0_40px_rgba(0,0,0,0.062)] flex flex-col items-center"
        >
          {/* LOGO */}
         <img 
  src="/WhatsApp Image 2025-05-31 à 15.40.33_b9695fc0.jpg" 
  alt="Niaxtu" 
  className="w-70 h-50 mb-0"
/>


          <h2 className="text-[2.5em] text-[#2e2e2e] font-bold mb-2">Connexion</h2>

          <div className="mb-2 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-mode text-sm text-[#2e2e2e]"
            >
              Se connecter par {mode === 'email' ? 'téléphone' : 'email'}
            </button>
          </div>

          {/* Email ou téléphone */}
          <div className="w-full mb-3">
            {mode === 'telephone' && (
              <div className="mb-2">
                <select
                  value={indicatif}
                  onChange={(e) => setIndicatif(e.target.value)}
                  className="inputField w-full h-10 text-black text-sm font-medium px-3"
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
                className="inputField w-full h-10 text-black text-sm font-medium focus:outline-none"
                value={mode === 'email' ? email : telephone}
                onChange={(e) =>
                  mode === 'email' ? setEmail(e.target.value) : setTelephone(e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="relative w-full flex items-center mb-3">
            <input
              type="password"
              placeholder="Mot de passe"
              className="inputField w-full h-10 text-black text-sm font-medium focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Bouton de connexion */}
          <button type="submit" className="relative w-full">
            <a href="/AdminDashboard">Se connecter</a>
          </button>

          {/* Lien d'inscription */}
          <div className="mt-4 flex flex-col items-center gap-2 text-black">
            <p className="text-sm font-medium">Pas de compte ?</p>
            <a
              href="/Page2"
              className="text-sm font-medium bg-[#2e2e2e] text-white px-4 py-1.5 rounded-full"
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
