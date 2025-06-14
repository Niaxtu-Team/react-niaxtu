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
import SousSecteurs from './pages/SousSecteurs'
import NouvelleStructure from './pages/NouvelleStructure'
import ListeStructures from './pages/ListeStructures'
import ApercuGeneral from './pages/ApercuGeneral'
import Utilisateurs from './pages/Utilisateurs'
import TestUsers from './pages/TestUsers'
import Statistiques from './pages/Statistiques'
import StatistiquesCompletes from './pages/StatistiquesCompletes'
import ExporterDonnees from './pages/ExporterDonnees'
import ProfilAdmin from './pages/ProfilAdmin'
import { ThemeProvider } from './pages/ThemeContext'
import ParametresAdmin from './pages/ParametresAdmin'
import GestionAdmins from './pages/GestionAdmins'
import NouvelAdmin from './pages/NouvelAdmin'
import GestionPermissions from './pages/GestionPermissions'
import GestionAdminsPermissions from './pages/GestionAdminsPermissions'
import GestionAdminsHistorique from './pages/GestionAdminsHistorique'
import CiblesTypes from './pages/CiblesTypes'
import Dashboard from './pages/Dashboard'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Acceuil />} />
            <Route path="/Page2" element={<Page2 />} />
            {/* Layout persistant pour toute la partie admin - PROTÉGÉ */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="apercu-general" element={<ApercuGeneral />} />
              
              {/* Gestion des plaintes */}
              <Route path="plaintes" element={<ToutesPlaintes />} />
              <Route path="plaintes/en-attente" element={<PlaintesEnAttente />} />
              <Route path="plaintes/en-traitement" element={<PlaintesEnTraitement />} />
              <Route path="plaintes/resolues" element={<PlaintesResolues />} />
              <Route path="plaintes/rejetees" element={<PlaintesRejetees />} />
              
              {/* Types de plaintes - Permission requise */}
              <Route path="plaintes/types" element={
                <ProtectedRoute requiredPermission="MANAGE_COMPLAINT_TYPES">
                  <ListeTypesPlainte />
                </ProtectedRoute>
              } />
              <Route path="plaintes/types/nouveau" element={
                <ProtectedRoute requiredPermission="CREATE_COMPLAINT_TYPES">
                  <NouveauTypePlainte />
                </ProtectedRoute>
              } />
              
              {/* Types de cibles - Permission requise */}
              <Route path="cibles/types" element={
                <ProtectedRoute requiredPermission="MANAGE_TARGET_TYPES">
                  <CiblesTypes />
                </ProtectedRoute>
              } />
              <Route path="cibles/types/nouveau" element={
                <ProtectedRoute requiredPermission="CREATE_TARGET_TYPES">
                  <NouveauTypeCible />
                </ProtectedRoute>
              } />
              
              {/* Secteurs */}
              <Route path="secteurs" element={<ListeSecteurs />} />
              <Route path="secteurs/nouveau" element={
                <ProtectedRoute requiredPermission="CREATE_SECTORS">
                  <NouveauSecteur />
                </ProtectedRoute>
              } />
              <Route path="sous-secteurs" element={<SousSecteurs />} />
              <Route path="sous-secteurs/nouveau" element={
                <ProtectedRoute requiredPermission="CREATE_SECTORS">
                  <NouveauSousSecteur />
                </ProtectedRoute>
              } />
              
              {/* Structures */}
              <Route path="structures" element={<ListeStructures />} />
              <Route path="structures/nouveau" element={
                <ProtectedRoute requiredPermission="CREATE_STRUCTURES">
                  <NouvelleStructure />
                </ProtectedRoute>
              } />
              
              {/* Gestion des utilisateurs */}
              <Route path="utilisateurs" element={<Utilisateurs />} />
              <Route path="test-users" element={<TestUsers />} />
              <Route path="gestion-admins" element={
                <ProtectedRoute requiredRole={['super_admin', 'admin']}>
                  <GestionAdmins />
                </ProtectedRoute>
              } />
              <Route path="gestion-admins/nouveau" element={
                <ProtectedRoute requiredPermission="CREATE_ADMIN">
                  <NouvelAdmin />
                </ProtectedRoute>
              } />
              <Route path="gestion-admins/permissions" element={
                <ProtectedRoute requiredPermission="MANAGE_PERMISSIONS">
                  <GestionAdminsPermissions />
                </ProtectedRoute>
              } />
              <Route path="gestion-admins/historique" element={
                <ProtectedRoute requiredPermission="VIEW_AUDIT_LOG">
                  <GestionAdminsHistorique />
                </ProtectedRoute>
              } />
              
              {/* Rapports et statistiques */}
              <Route path="rapports/statistiques" element={
                <ProtectedRoute requiredPermission="VIEW_REPORTS">
                  <Statistiques />
                </ProtectedRoute>
              } />
              <Route path="rapports/statistiques-completes" element={
                <ProtectedRoute requiredPermission="VIEW_REPORTS">
                  <StatistiquesCompletes />
                </ProtectedRoute>
              } />
              <Route path="rapports/export" element={
                <ProtectedRoute requiredPermission="EXPORT_DATA">
                  <ExporterDonnees />
                </ProtectedRoute>
              } />
              
              {/* Profil et paramètres */}
              <Route path="profil" element={<ProfilAdmin />} />
              <Route path="parametres" element={
                <ProtectedRoute requiredRole={['super_admin', 'admin']}>
                  <ParametresAdmin />
                </ProtectedRoute>
              } />
              
              {/* Page de test */}
              <Route path="page2" element={<Page2 />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
