# Script simple de déplacement des fichiers
Write-Host "Deplacement des fichiers..." -ForegroundColor Green

# Dashboard
Write-Host "Dashboard..." -ForegroundColor Yellow
Move-Item "src\pages\AdminDashboard.jsx" "src\pages\dashboard\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\accueil.jsx" "src\pages\dashboard\" -Force -ErrorAction SilentlyContinue

# Statistiques
Write-Host "Statistiques..." -ForegroundColor Yellow
Move-Item "src\pages\StatistiquesAvancees.jsx" "src\pages\statistiques\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\Statistiques.jsx" "src\pages\statistiques\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\ExporterDonnees.jsx" "src\pages\statistiques\" -Force -ErrorAction SilentlyContinue

# Plaintes
Write-Host "Plaintes..." -ForegroundColor Yellow
Move-Item "src\pages\ToutesPlaintes.jsx" "src\pages\plaintes\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\PlaintesEnAttente.jsx" "src\pages\plaintes\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\PlaintesEnTraitement.jsx" "src\pages\plaintes\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\PlaintesResolues.jsx" "src\pages\plaintes\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\PlaintesRejetees.jsx" "src\pages\plaintes\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\ToutesPlaintes.refactored.jsx" "src\pages\plaintes\" -Force -ErrorAction SilentlyContinue

# Administration
Write-Host "Administration..." -ForegroundColor Yellow
Move-Item "src\pages\GestionAdmins.jsx" "src\pages\administration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\NouvelAdmin.jsx" "src\pages\administration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\GestionPermissions.jsx" "src\pages\administration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\GestionAdminsPermissions.jsx" "src\pages\administration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\GestionAdminsHistorique.jsx" "src\pages\administration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\HistoriqueAdmin.jsx" "src\pages\administration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\Utilisateurs.jsx" "src\pages\administration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\TestUsers.jsx" "src\pages\administration\" -Force -ErrorAction SilentlyContinue

# Structures
Write-Host "Structures..." -ForegroundColor Yellow
Move-Item "src\pages\ListeStructures.jsx" "src\pages\structures\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\NouvelleStructure.jsx" "src\pages\structures\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\ListeSecteurs.jsx" "src\pages\structures\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\NouveauSecteur.jsx" "src\pages\structures\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\SousSecteurs.jsx" "src\pages\structures\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\ListeSousSecteurs.jsx" "src\pages\structures\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\NouveauSousSecteur.jsx" "src\pages\structures\" -Force -ErrorAction SilentlyContinue

# Configuration
Write-Host "Configuration..." -ForegroundColor Yellow
Move-Item "src\pages\ListeTypesPlainte.jsx" "src\pages\configuration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\NouveauTypePlainte.jsx" "src\pages\configuration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\NouveauTypePlainte.refactored.jsx" "src\pages\configuration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\CiblesTypes.jsx" "src\pages\configuration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\ListeTypesCible.jsx" "src\pages\configuration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\NouveauTypeCible.jsx" "src\pages\configuration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\ParametresAdmin.jsx" "src\pages\configuration\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\Page2.jsx" "src\pages\configuration\" -Force -ErrorAction SilentlyContinue

# Profil
Write-Host "Profil..." -ForegroundColor Yellow
Move-Item "src\pages\ProfilAdmin.jsx" "src\pages\profil\" -Force -ErrorAction SilentlyContinue
Move-Item "src\pages\ThemeContext.jsx" "src\pages\profil\" -Force -ErrorAction SilentlyContinue

Write-Host "Deplacement termine!" -ForegroundColor Green 