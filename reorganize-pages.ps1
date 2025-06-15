# Script de réorganisation des pages React
# Auteur: Assistant IA
# Date: $(Get-Date -Format "dd/MM/yyyy HH:mm")
# Version corrigée avec gestion d'erreurs améliorée

param(
    [string]$ProjectPath = ".",
    [switch]$WhatIf = $false,
    [switch]$Force = $false
)

# Fonction pour écrire des messages colorés
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = ""
    )
    
    if ($Prefix) {
        Write-Host "$Prefix " -NoNewline -ForegroundColor $Color
        Write-Host $Message -ForegroundColor White
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

# Vérifier si nous sommes dans un projet React
if (!(Test-Path "package.json")) {
    Write-ColorMessage "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans un projet React." "Red"
    exit 1
}

$packageContent = Get-Content "package.json" -Raw | ConvertFrom-Json
if (!($packageContent.dependencies.react -or $packageContent.devDependencies.react)) {
    Write-ColorMessage "⚠️  Attention: Ce ne semble pas être un projet React." "Yellow"
    if (!$Force) {
        $response = Read-Host "Continuer quand même ? (o/N)"
        if ($response -ne "o" -and $response -ne "O") {
            Write-ColorMessage "❌ Opération annulée." "Red"
            exit 1
        }
    }
}

Write-ColorMessage "🚀 Début de la réorganisation des pages..." "Green"

# Créer les dossiers s'ils n'existent pas
$folders = @(
    "src/pages/dashboard",
    "src/pages/statistiques", 
    "src/pages/plaintes",
    "src/pages/administration",
    "src/pages/structures",
    "src/pages/configuration",
    "src/pages/profil"
)

Write-ColorMessage "📁 Création des dossiers..." "Yellow"
foreach ($folder in $folders) {
    $normalizedPath = $folder -replace "/", [IO.Path]::DirectorySeparatorChar
    
    if (!(Test-Path $normalizedPath)) {
        if (!$WhatIf) {
            try {
                New-Item -ItemType Directory -Path $normalizedPath -Force | Out-Null
                Write-ColorMessage "Créé: $normalizedPath" "Green" "   ✅"
            }
            catch {
                Write-ColorMessage "Erreur lors de la création de $normalizedPath : $($_.Exception.Message)" "Red" "   ❌"
                continue
            }
        } else {
            Write-ColorMessage "SIMULATION: Créerait $normalizedPath" "Cyan" "   📋"
        }
    } else {
        Write-ColorMessage "Existe déjà: $normalizedPath" "Cyan" "   ℹ️"
    }
}

# Définir les mouvements de fichiers avec une structure plus maintenable
$fileMapping = @{
    # 📊 DASHBOARD
    "dashboard" = @{
        "files" = @(
            "ApercuGeneral.jsx",
            "AdminDashboard.jsx",
            "accueil.jsx"
        )
        "description" = "Tableaux de bord"
        "icon" = "📊"
    }
    
    # 📈 STATISTIQUES  
    "statistiques" = @{
        "files" = @(
            "StatistiquesCompletes.jsx",
            "StatistiquesAvancees.jsx", 
            "Statistiques.jsx",
            "ExporterDonnees.jsx"
        )
        "description" = "Analyses et rapports"
        "icon" = "📈"
    }
    
    # 📋 PLAINTES
    "plaintes" = @{
        "files" = @(
            "ToutesPlaintes.jsx",
            "PlaintesEnAttente.jsx",
            "PlaintesEnTraitement.jsx", 
            "PlaintesResolues.jsx",
            "PlaintesRejetees.jsx",
            "ToutesPlaintes.refactored.jsx"
        )
        "description" = "Gestion des plaintes"
        "icon" = "📋"
    }
    
    # 👥 ADMINISTRATION
    "administration" = @{
        "files" = @(
            "GestionAdmins.jsx",
            "NouvelAdmin.jsx",
            "GestionPermissions.jsx",
            "GestionAdminsPermissions.jsx",
            "GestionAdminsHistorique.jsx",
            "HistoriqueAdmin.jsx",
            "Utilisateurs.jsx",
            "TestUsers.jsx"
        )
        "description" = "Gestion des admins"
        "icon" = "👥"
    }
    
    # 🏢 STRUCTURES
    "structures" = @{
        "files" = @(
            "ListeStructures.jsx",
            "NouvelleStructure.jsx",
            "ListeSecteurs.jsx", 
            "NouveauSecteur.jsx",
            "SousSecteurs.jsx",
            "ListeSousSecteurs.jsx",
            "NouveauSousSecteur.jsx"
        )
        "description" = "Organisations"
        "icon" = "🏢"
    }
    
    # ⚙️ CONFIGURATION
    "configuration" = @{
        "files" = @(
            "ListeTypesPlainte.jsx",
            "NouveauTypePlainte.jsx",
            "NouveauTypePlainte.refactored.jsx",
            "CiblesTypes.jsx",
            "ListeTypesCible.jsx", 
            "NouveauTypeCible.jsx",
            "ParametresAdmin.jsx",
            "Page2.jsx"
        )
        "description" = "Paramètres"
        "icon" = "⚙️"
    }
    
    # 👤 PROFIL
    "profil" = @{
        "files" = @(
            "ProfilAdmin.jsx",
            "ThemeContext.jsx"
        )
        "description" = "Profil utilisateur"
        "icon" = "👤"
    }
}

# Effectuer les déplacements
Write-ColorMessage "📦 Déplacement des fichiers..." "Yellow"

$totalFiles = 0
$movedFiles = 0
$skippedFiles = 0
$errors = @()

foreach ($folderName in $fileMapping.Keys) {
    $folderInfo = $fileMapping[$folderName]
    $destinationPath = "src/pages/$folderName" -replace "/", [IO.Path]::DirectorySeparatorChar
    
    Write-ColorMessage "Traitement du dossier: $($folderInfo.icon) $folderName ($($folderInfo.description))" "Cyan" "   📂"
    
    foreach ($file in $folderInfo.files) {
        $totalFiles++
        $sourcePath = "src/pages/$file" -replace "/", [IO.Path]::DirectorySeparatorChar
        $destinationFile = Join-Path $destinationPath $file
        
        if (Test-Path $sourcePath) {
            # Vérifier si le fichier existe déjà à la destination
            if ((Test-Path $destinationFile) -and !$Force) {
                Write-ColorMessage "Le fichier existe déjà à la destination: $file" "Yellow" "      ⚠️"
                $skippedFiles++
                continue
            }
            
            if (!$WhatIf) {
                try {
                    Move-Item $sourcePath $destinationPath -Force
                    Write-ColorMessage "$file → $folderName/" "Green" "      ✅"
                    $movedFiles++
                }
                catch {
                    $errorMsg = "Erreur lors du déplacement de $file : $($_.Exception.Message)"
                    $errors += $errorMsg
                    Write-ColorMessage $errorMsg "Red" "      ❌"
                }
            } else {
                Write-ColorMessage "SIMULATION: $file → $folderName/" "Cyan" "      📋"
                $movedFiles++
            }
        }
        else {
            Write-ColorMessage "Fichier non trouvé: $file" "Yellow" "      ⚠️"
            $skippedFiles++
        }
    }
}

# Fonction pour générer le contenu des fichiers index
function Get-IndexContent {
    param(
        [string]$FolderName,
        [array]$Files
    )
    
    $exports = @()
    $exports += "// Index des pages $($fileMapping[$FolderName].description)"
    $exports += "// Généré automatiquement le $(Get-Date -Format 'dd/MM/yyyy à HH:mm')"
    $exports += ""
    
    foreach ($file in $Files) {
        # Extraire le nom du composant (sans extension)
        $componentName = [IO.Path]::GetFileNameWithoutExtension($file)
        # Éviter les fichiers .refactored
        if ($componentName -notlike "*.refactored") {
            $exports += "export { default as $componentName } from './$componentName';"
        }
    }
    
    return $exports -join "`n"
}

# Créer les fichiers index pour chaque dossier
if (!$WhatIf) {
    Write-ColorMessage "📝 Création des fichiers index..." "Yellow"
    
    foreach ($folderName in $fileMapping.Keys) {
        $folderInfo = $fileMapping[$folderName]
        $indexPath = "src/pages/$folderName/index.js" -replace "/", [IO.Path]::DirectorySeparatorChar
        
        try {
            $indexContent = Get-IndexContent -FolderName $folderName -Files $folderInfo.files
            $indexContent | Out-File -FilePath $indexPath -Encoding UTF8
            Write-ColorMessage "Créé: $folderName/index.js" "Green" "   ✅"
        }
        catch {
            Write-ColorMessage "Erreur lors de la création de $indexPath : $($_.Exception.Message)" "Red" "   ❌"
        }
    }
    
    # Créer l'index principal
    $mainIndexContent = @"
// Index principal des pages organisées
// Généré automatiquement le $(Get-Date -Format "dd/MM/yyyy à HH:mm")

$(foreach ($folderName in $fileMapping.Keys) {
    $folderInfo = $fileMapping[$folderName]
    "// $($folderInfo.icon) $($folderInfo.description)"
    "export * from './$folderName';"
    ""
} -join "`n")
"@
    
    try {
        $mainIndexPath = "src/pages/index.js" -replace "/", [IO.Path]::DirectorySeparatorChar
        $mainIndexContent | Out-File -FilePath $mainIndexPath -Encoding UTF8
        Write-ColorMessage "Créé: index.js principal" "Green" "   ✅"
    }
    catch {
        Write-ColorMessage "Erreur lors de la création de l'index principal : $($_.Exception.Message)" "Red" "   ❌"
    }
} else {
    Write-ColorMessage "SIMULATION: Création des fichiers index..." "Cyan"
}

# Résumé final
Write-ColorMessage "`n🎉 RÉORGANISATION TERMINÉE !" "Green"
Write-ColorMessage "📊 Statistiques:" "Cyan"
Write-ColorMessage "   • Fichiers traités: $totalFiles" "White"
Write-ColorMessage "   • Fichiers déplacés: $movedFiles" "Green"
Write-ColorMessage "   • Fichiers ignorés: $skippedFiles" "Yellow"
Write-ColorMessage "   • Dossiers traités: $($folders.Count)" "Blue"

if ($errors.Count -gt 0) {
    Write-ColorMessage "`n⚠️  ERREURS RENCONTRÉES:" "Red"
    foreach ($error in $errors) {
        Write-ColorMessage "   • $error" "Red"
    }
}

Write-ColorMessage "`n📁 NOUVELLE STRUCTURE:" "Cyan"
Write-ColorMessage "src/pages/" "White"
foreach ($folderName in $fileMapping.Keys) {
    $folderInfo = $fileMapping[$folderName]
    $prefix = if ($folderName -eq ($fileMapping.Keys | Select-Object -Last 1)) { "└──" } else { "├──" }
    Write-ColorMessage "$prefix $($folderInfo.icon) $folderName/     ($($folderInfo.description))" "Blue"
}

if (!$WhatIf) {
    Write-ColorMessage "`n💡 PROCHAINES ÉTAPES:" "Yellow"
    Write-ColorMessage "1. Mettre à jour les imports dans les composants" "White"
    Write-ColorMessage "2. Vérifier les routes dans App.jsx" "White"  
    Write-ColorMessage "3. Tester l'application" "White"
    Write-ColorMessage "4. Commit les changements dans votre système de version" "White"
    
    Write-ColorMessage "`n✨ Réorganisation réussie ! Votre code est maintenant mieux structuré." "Green"
} else {
    Write-ColorMessage "`n📋 SIMULATION TERMINÉE - Utilisez -WhatIf:`$false pour exécuter réellement" "Cyan"
}

# Créer un fichier de rapport si demandé
if ($env:CREATE_REPORT -eq "true" -and !$WhatIf) {
    $reportPath = "reorganization-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    $reportContent = @"
Rapport de réorganisation des pages React
=========================================
Date: $(Get-Date)
Fichiers traités: $totalFiles
Fichiers déplacés: $movedFiles
Fichiers ignorés: $skippedFiles
Erreurs: $($errors.Count)

Structure créée:
$(foreach ($folderName in $fileMapping.Keys) {
    $folderInfo = $fileMapping[$folderName]
    "$($folderInfo.icon) $folderName/ - $($folderInfo.description)"
    foreach ($file in $folderInfo.files) {
        "  - $file"
    }
    ""
} -join "`n")

$(if ($errors.Count -gt 0) {
    "Erreurs rencontrées:"
    foreach ($error in $errors) {
        "- $error"
    }
})
"@
    
    $reportContent | Out-File -FilePath $reportPath -Encoding UTF8
    Write-ColorMessage "📄 Rapport sauvegardé: $reportPath" "Green"
}