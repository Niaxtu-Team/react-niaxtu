import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'

// Import depuis la nouvelle structure organisée
import { 
  // Dashboard
  Dashboard,
  AdminDashboard,
  ApercuGeneral,
  Accueil
} from './pages/dashboard'

import {
  // Statistiques
  Statistiques,
  StatistiquesCompletes,
  ExporterDonnees
} from './pages/statistiques'

import {
  // Plaintes
  ToutesPlaintes,
  PlaintesEnAttente,
  PlaintesEnTraitement,
  PlaintesResolues,
  PlaintesRejetees
} from './pages/plaintes'

import {
  // Administration
  GestionAdmins,
  NouvelAdmin,
  GestionPermissions,
  GestionAdminsPermissions,
  GestionAdminsHistorique,
  Utilisateurs,
  TestUsers
} from './pages/administration'

import {
  // Structures
  ListeStructures,
  NouvelleStructure,
  ListeSecteurs,
  NouveauSecteur,
  SousSecteurs,
  ListeSousSecteurs,
  NouveauSousSecteur
} from './pages/structures'

import {
  // Configuration
  ListeTypesPlainte,
  NouveauTypePlainte,
  CiblesTypes,
  ListeTypesCible,
  NouveauTypeCible,
  ParametresAdmin,
  Page2
} from './pages/configuration'

import {
  // Profil
  ProfilAdmin,
  ThemeContext
} from './pages/profil'

// Import du ThemeProvider depuis le contexte
import { ThemeProvider } from './pages/profil/ThemeContext'

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Accueil />} />
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
