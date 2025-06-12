 import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function PhoneInput() {
  const [countryCode, setCountryCode] = useState("+33")
  const [phoneNumber, setPhoneNumber] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!phoneNumber.trim()) {
      alert("Merci de renseigner votre numéro de téléphone")
      return
    }
    // on envoie le numéro complet à la page suivante via state
    navigate("/Page2", { state: { phoneNumber: countryCode + phoneNumber } })
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "auto", padding: 20 }}>
      <h2>Votre numéro de téléphone</h2>
      <label>
        Indicatif pays
        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 5 }}>
          <option value="+33">France (+33)</option>
          <option value="+1">USA (+1)</option>
          <option value="+237">Cameroun (+237)</option>
          <option value="+44">UK (+44)</option>
        </select>
      </label>
      <label>
        Numéro de téléphone
        <input
          type="tel"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          placeholder="Ex: 612345678"
          required
          style={{ width: "100%", padding: 8, marginTop: 5 }}
        />
      </label>
      <button type="submit" style={{ marginTop: 15, padding: 10, backgroundColor: "#8000ff", color: "white", border: "none", borderRadius: 6 }}>
        Continuer
      </button>
    </form>
  )
}
