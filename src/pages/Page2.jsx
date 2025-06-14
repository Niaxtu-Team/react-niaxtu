import { useState } from 'react'

function InscriptionMultiEtapes() {
  const [step, setStep] = useState(1)
  const [countryCode, setCountryCode] = useState('+221')
  const [phoneNumber, setPhoneNumber] = useState('')

  // Infos personnelles
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const countries = [
    { code: '+221', label: '🇸🇳 Sénégal' },
    { code: '+33', label: '🇫🇷 France' },
    { code: '+1', label: '🇺🇸 USA' },
    { code: '+44', label: '🇬🇧 Royaume-Uni' },
    { code: '+49', label: '🇩🇪 Allemagne' },
    { code: '+39', label: '🇮🇹 Italie' },
    { code: '+34', label: '🇪🇸 Espagne' },
    { code: '+7', label: '🇷🇺 Russie' },
    { code: '+81', label: '🇯🇵 Japon' },
    { code: '+86', label: '🇨🇳 Chine' },
    { code: '+91', label: '🇮🇳 Inde' },
    { code: '+55', label: '🇧🇷 Brésil' },
    { code: '+27', label: '🇿🇦 Afrique du Sud' },
    { code: '+61', label: '🇦🇺 Australie' },
    { code: '+82', label: '🇰🇷 Corée du Sud' },
    { code: '+64', label: '🇳🇿 Nouvelle-Zélande' },
    { code: '+46', label: '🇸🇪 Suède' },
    { code: '+31', label: '🇳🇱 Pays-Bas' },
    { code: '+41', label: '🇨🇭 Suisse' },
    { code: '+352', label: '🇱🇺 Luxembourg' },
    { code: '+380', label: '🇺🇦 Ukraine' },
    { code: '+373', label: '🇲🇩 Moldavie' },
    { code: '+370', label: '🇱🇹 Lituanie' },
    { code: '+420', label: '🇨🇿 République Tchèque' },
    { code: '+351', label: '🇵🇹 Portugal' },
    { code: '+358', label: '🇫🇮 Finlande' },
    { code: '+48', label: '🇵🇱 Pologne' },
    { code: '+356', label: '🇲🇹 Malte' },
  ]

  const handleNextStep = () => {
    if (step < 2) setStep(step + 1)
  }

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <>
      <style>{`
        .inputField {
          border: 2px solid #e2e8f0;
          border-radius: 30px;
          padding: 1rem 1.5rem;
          transition: all 0.4s ease;
          font-size: 0.95rem;
          background: #f8fafc;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          width: 100%;
        }
        .inputField:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
          outline: none;
          transform: translateY(-1px);
        }

        .btn-purple {
          background: linear-gradient(135deg, #7c3aed, #6b21a8);
          color: white;
          border-radius: 30px;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          transition: all 0.4s ease;
          border: none;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
          position: relative;
          overflow: hidden;
        }
        .btn-purple:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }
        .btn-purple::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          transition: left 0.7s ease;
        }
        .btn-purple:hover::before {
          left: 100%;
        }

        select.inputField {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: white;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%236b21a8' viewBox='0 0 20 20'%3E%3Cpath d='M10 14l-5-5h10l-5 5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.25rem;
          padding-right: 2.5rem;
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

        .step-indicator {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .step-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e2e8f0;
          transition: all 0.4s ease;
        }

        .step-dot.active {
          background: #7c3aed;
          transform: scale(1.2);
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.4);
        }

        .step-dot.completed {
          background: #6b21a8;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="bg-animation"></div>
        <form className="form-container w-[400px] p-8 rounded-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col items-center">
          <div className="logo-container">
            <img 
              src="/logo.png" 
              alt="Niaxtu" 
              className="w-50 h-50 mb-0 transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          <h2 className="text-[2.5em] font-bold mb-6 bg-gradient-to-r from-[#7c3aed] to-[#6b21a8] bg-clip-text text-transparent">Inscription</h2>

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
          </div>

          {/* Step 1 → Téléphone + Pays */}
          {step === 1 && (
            <div className="w-full space-y-4">
              <select 
                value={countryCode} 
                onChange={(e) => setCountryCode(e.target.value)} 
                className="inputField"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Numéro de téléphone" 
                className="inputField" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                required 
              />
              <p className="text-sm text-center mt-4">
                Déjà un compte ? 
                <a href="/" className="text-[#7c3aed] font-semibold hover:underline ml-1">
                  Se connecter
                </a>
              </p>
            </div>
          )}

          {/* Step 2 → Infos personnelles */}
          {step === 2 && (
            <div className="w-full space-y-4">
              <input 
                type="text" 
                placeholder="Nom" 
                className="inputField" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)} 
                required 
              />
              <input 
                type="text" 
                placeholder="Prénom" 
                className="inputField" 
                value={prenom} 
                onChange={(e) => setPrenom(e.target.value)} 
                required 
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="inputField" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="Mot de passe" 
                className="inputField" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="Confirmer le mot de passe" 
                className="inputField" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
              <p className="text-sm text-center mt-4">
                Déjà un compte ? 
                <a href="/" className="text-[#7c3aed] font-semibold hover:underline ml-1">
                  Se connecter
                </a>
              </p>
            </div>
          )}

          <div className="flex justify-between w-full mt-6">
            {step > 1 && (
              <button 
                type="button" 
                onClick={handlePreviousStep} 
                className="btn-purple"
              >
                Retour
              </button>
            )}
            {step < 2 ? (
              <button 
                type="button" 
                onClick={handleNextStep} 
                className="btn-purple ml-auto"
              >
                Suivant
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-purple ml-auto"
              >
                S'inscrire
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  )
}

export default InscriptionMultiEtapes
