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
          border: 2px solid #ccc;
          border-radius: 30px;
          padding-left: 1.5rem;
          transition: border-color 0.4s ease, box-shadow 0.3s ease;
          font-size: 0.9rem;
          height: 2.5rem;
        }
        .inputField:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 8px rgba(124, 58, 237, 0.6);
          outline: none;
        }
        .btn-purple {
          background-color: #7c3aed;
          border: 2px solid #6b21a8;
          color: white;
          border-radius: 30px;
          font-weight: 600;
          padding: 0.5rem 1.5rem;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .btn-purple:hover {
          background-color: #6b21a8;
          box-shadow: 0 0 15px #7c3aed;
        }
        select.inputField {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: white;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%236b21a8' viewBox='0 0 20 20'%3E%3Cpath d='M10 14l-5-5h10l-5 5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.25rem;
          padding-right: 2.5rem;
        }
        form {
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
        <form className="w-[360px] bg-white p-8 rounded-[30px] shadow-[0_0_40px_rgba(0,0,0,0.062)] flex flex-col items-center">
                     <img 
  src="/WhatsApp Image 2025-05-31 à 15.40.33_b9695fc0.jpg" 
  alt="Niaxtu" 
  className="w-70 h-50 mb-0"
/>
          <h2 className="text-[2.5em] text-[#2e2e2e] font-bold mb-6">Inscription</h2>

          {/* Step 1 → Téléphone + Pays */}
          {step === 1 && (
            <div className="w-full">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="inputField w-full mb-3">
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                ))}
              </select>
              <input type="text" placeholder="Numéro de téléphone" className="inputField w-full mb-3" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              <p className="text-sm text-center mt-2">Déjà un compte ? <a href="/" className="text-[#7c3aed] font-semibold hover:underline">Se connecter</a></p>
            </div>
          )}

          {/* Step 2 → Infos personnelles */}
          {step === 2 && (
            <div className="w-full">
              <input type="text" placeholder="Nom" className="inputField w-full mb-3" value={nom} onChange={(e) => setNom(e.target.value)} required />
              <input type="text" placeholder="Prénom" className="inputField w-full mb-3" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
              <input type="email" placeholder="Email" className="inputField w-full mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Mot de passe" className="inputField w-full mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <input type="password" placeholder="Confirmer le mot de passe" className="inputField w-full mb-3" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <p className="text-sm text-center mt-2">Déjà un compte ? <a href="/" className="text-[#7c3aed] font-semibold hover:underline">Se connecter</a></p>
            </div>
          )}

          <div className="flex justify-between w-full mt-4">
            {step > 1 && (
              <button type="button" onClick={handlePreviousStep} className="btn-purple">Retour</button>
            )}
            {step < 2 ? (
              <button type="button" onClick={handleNextStep} className="btn-purple ml-auto">Suivant</button>
            ) : (
              <button type="submit" className="btn-purple ml-auto">S'inscrire</button>
            )}
          </div>
        </form>
      </div>
    </>
  )
}

export default InscriptionMultiEtapes
