import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

function Connexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle, error, setError } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await login(email, password)
      navigate('/AdminDashboard')
    } catch (error) {
      console.error('Erreur de connexion:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await loginWithGoogle()
      navigate('/AdminDashboard')
    } catch (error) {
      console.error('Erreur de connexion Google:', error)
    } finally {
      setLoading(false)
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
    { code: '+225', label: 'Côte dIvoire' },
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

        .btn-primary {
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
          width: 100%;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #6b21a8;
          box-shadow: 0 0 15px #7c3aed;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary::before {
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
        .btn-primary:hover:not(:disabled)::before {
          left: 100%;
        }

        .btn-google {
          background-color: white;
          border: 2px solid #db4437;
          color: #db4437;
          transition: all 0.3s ease;
        }
        .btn-google:hover:not(:disabled) {
          background-color: #db4437;
          color: white;
        }

        .error-message {
          background-color: #fee2e2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .spinner {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #7c3aed;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .login-form {
          animation: fadeInUp 0.6s ease forwards;
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
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 via-blue-900 to-gray-900 px-4">
        <form
          onSubmit={handleLogin}
          className="login-form w-[400px] bg-white p-8 rounded-[30px] shadow-[0_0_40px_rgba(0,0,0,0.062)] flex flex-col items-center"
        >
          {/* LOGO */}
          <img 
            src="/WhatsApp Image 2025-05-31 à 15.40.33_b9695fc0.jpg" 
            alt="Niaxtu" 
            className="w-70 h-50 mb-4"
          />

          <h2 className="text-[2.5em] text-[#2e2e2e] font-bold mb-2">Administration</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Connectez-vous à votre espace administrateur
          </p>

          {/* Message d'erreur */}
          {error && (
            <div className="error-message w-full">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          {/* Email */}
          <div className="w-full mb-4">
            <input
              type="email"
              placeholder="Adresse e-mail"
              className="inputField w-full h-10 text-black text-sm font-medium focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Mot de passe */}
          <div className="w-full mb-6">
            <input
              type="password"
              placeholder="Mot de passe"
              className="inputField w-full h-10 text-black text-sm font-medium focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Bouton de connexion */}
          <button 
            type="submit" 
            className="btn-primary mb-4"
            disabled={loading}
          >
            <div className="flex items-center justify-center gap-2">
              {loading && <div className="spinner"></div>}
              <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
            </div>
          </button>

          {/* Séparateur */}
          <div className="w-full flex items-center mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">ou</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Connexion Google */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="btn-primary btn-google mb-6"
            disabled={loading}
          >
            <div className="flex items-center justify-center gap-2">
              {loading && <div className="spinner"></div>}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuer avec Google</span>
            </div>
          </button>

          {/* Informations sur l'accès */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              Accès réservé aux administrateurs autorisés
            </p>
            <p className="text-xs text-gray-400">
              Besoin d'un compte ? Contactez votre super administrateur
            </p>
          </div>

          {/* Lien vers la documentation */}
          <div className="mt-4 pt-4 border-t border-gray-200 w-full text-center">
            <a 
              href="http://localhost:3001/api-docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              📚 Documentation API • 🛠️ Swagger
            </a>
          </div>
        </form>
      </div>
    </>
  )
}

export default Connexion
