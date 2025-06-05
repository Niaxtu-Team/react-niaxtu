import { useState } from 'react'

 const handleLogin = (e) => {
    e.preventDefault()
    if (mode === 'email') {
      console.log("Connexion avec l'email :", email, password)
    } else {
      console.log("Connexion avec le téléphone :", telephone, password)
    }
  }
function Form1( mode) {
  const [count, setCount] = useState(0)
    const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')

  return (
    <>
       <form onSubmit={handleLogin} className="space-y-5 bg-amber-300">
          {mode === 'email' ? (
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-1">Téléphone</label>
              <input
                type="tel"
                className="w-full px-4 py-2 rounded-lg bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition duration-300 text-white rounded-lg font-semibold shadow-md hover:shadow-lg"
          >
            Se vsdjvdv cds
          </button>
        </form>
    </>
  )
}

export default Form1
