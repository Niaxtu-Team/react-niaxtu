import { useState } from 'react'
import './App.css'
import Acceuil from './pages/accueil'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Page2 from './pages/page2'
import AdminDashboard from './pages/AdminDashboard'
import NouveauTypePlainte from './pages/NouveauTypePlainte'
import ListeTypesPlainte from './pages/ListeTypesPlainte'
import NouveauTypeCible from './pages/NouveauTypeCible'
import ListeTypesCible from './pages/ListeTypesCible'
import ToutesPlaintes from './pages/ToutesPlaintes'
import PlaintesEnAttente from './pages/PlaintesEnAttente'
import PlaintesEnTraitement from './pages/PlaintesEnTraitement'
import PlaintesResolues from './pages/PlaintesResolues'
import PlaintesRejetees from './pages/PlaintesRejetees'
import NouveauSecteur from './pages/NouveauSecteur'
import ListeSecteurs from './pages/ListeSecteurs'
import NouveauSousSecteur from './pages/NouveauSousSecteur'
import ListeSousSecteurs from './pages/ListeSousSecteurs'
import NouvelleStructure from './pages/NouvelleStructure'
import ListeStructures from './pages/ListeStructures'
import ApercuGeneral from './pages/ApercuGeneral'
import Utilisateurs from './pages/Utilisateurs'
import Statistiques from './pages/Statistiques'
import ExporterDonnees from './pages/ExporterDonnees'
import ProfilAdmin from './pages/ProfilAdmin'
import { ThemeProvider } from './pages/ThemeContext'
import ParametresAdmin from './pages/ParametresAdmin'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Acceuil />} />
          <Route path="/Page2" element={<Page2 />} />
          {/* Layout persistant pour toute la partie admin */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<ApercuGeneral />} />
            <Route path="dashboard" element={<ApercuGeneral />} />
            <Route path="plaintes/types/nouveau" element={<NouveauTypePlainte />} />
            <Route path="plaintes/types" element={<ListeTypesPlainte />} />
            <Route path="cibles/types/nouveau" element={<NouveauTypeCible />} />
            <Route path="cibles/types" element={<ListeTypesCible />} />
            <Route path="plaintes" element={<ToutesPlaintes />} />
            <Route path="plaintes/en-attente" element={<PlaintesEnAttente />} />
            <Route path="plaintes/en-traitement" element={<PlaintesEnTraitement />} />
            <Route path="plaintes/resolues" element={<PlaintesResolues />} />
            <Route path="plaintes/rejetees" element={<PlaintesRejetees />} />
            <Route path="secteurs/nouveau" element={<NouveauSecteur />} />
            <Route path="secteurs" element={<ListeSecteurs />} />
            <Route path="sous-secteurs/nouveau" element={<NouveauSousSecteur />} />
            <Route path="sous-secteurs" element={<ListeSousSecteurs />} />
            <Route path="structures/nouveau" element={<NouvelleStructure />} />
            <Route path="structures" element={<ListeStructures />} />
            <Route path="utilisateurs" element={<Utilisateurs />} />
            <Route path="rapports/statistiques" element={<Statistiques />} />
            <Route path="rapports/export" element={<ExporterDonnees />} />
            <Route path="profil" element={<ProfilAdmin />} />
            <Route path="parametres" element={<ParametresAdmin />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
