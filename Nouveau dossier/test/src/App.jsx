import { useState } from 'react'
import './App.css'
import Acceuil from './pages/accueil'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Page2 from './pages/page2'
import AdminDashboard from './pages/Admindashboard'
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

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Acceuil />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/Page2" element={<Page2 />} />
        <Route path="/admin/plaintes/types/nouveau" element={<NouveauTypePlainte />} />
        <Route path="/admin/plaintes/types" element={<ListeTypesPlainte />} />
        <Route path="/admin/cibles/types/nouveau" element={<NouveauTypeCible />} />
        <Route path="/admin/cibles/types" element={<ListeTypesCible />} />
        <Route path="/admin/plaintes" element={<ToutesPlaintes />} />
        <Route path="/admin/plaintes/en-attente" element={<PlaintesEnAttente />} />
        <Route path="/admin/plaintes/en-traitement" element={<PlaintesEnTraitement />} />
        <Route path="/admin/plaintes/resolues" element={<PlaintesResolues />} />
        <Route path="/admin/plaintes/rejetees" element={<PlaintesRejetees />} />
        <Route path="/admin/secteurs/nouveau" element={<NouveauSecteur />} />
        <Route path="/admin/secteurs" element={<ListeSecteurs />} />
        <Route path="/admin/sous-secteurs/nouveau" element={<NouveauSousSecteur />} />
        <Route path="/admin/sous-secteurs" element={<ListeSousSecteurs />} />
        <Route path="/admin/structures/nouveau" element={<NouvelleStructure />} />
        <Route path="/admin/structures" element={<ListeStructures />} />
        <Route path="/admin/dashboard" element={<ApercuGeneral />} />
        <Route path="/admin/utilisateurs" element={<Utilisateurs />} />
        <Route path="/admin/rapports/statistiques" element={<Statistiques />} />
        <Route path="/admin/rapports/export" element={<ExporterDonnees />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
