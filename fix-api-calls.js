const fs = require('fs');
const path = require('path');

// Fonction pour parcourir récursivement les fichiers
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      callback(filePath);
    }
  });
}

// Patterns de remplacement
const replacements = [
  // Remplacer les appels POST avec body JSON
  {
    pattern: /await apiService\(([^,]+),\s*\{\s*method:\s*['"]POST['"][^}]*body:\s*JSON\.stringify\(([^)]+)\)[^}]*\}\)/g,
    replacement: 'await apiService.post($1, $2)'
  },
  // Remplacer les appels PUT avec body JSON
  {
    pattern: /await apiService\(([^,]+),\s*\{\s*method:\s*['"]PUT['"][^}]*body:\s*JSON\.stringify\(([^)]+)\)[^}]*\}\)/g,
    replacement: 'await apiService.put($1, $2)'
  },
  // Remplacer les appels DELETE
  {
    pattern: /await apiService\(([^,]+),\s*\{\s*method:\s*['"]DELETE['"][^}]*\}\)/g,
    replacement: 'await apiService.delete($1)'
  },
  // Remplacer les appels GET simples
  {
    pattern: /await apiService\(([^,)]+)\)/g,
    replacement: 'await apiService.get($1)'
  }
];

// Traiter chaque fichier
walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigé: ${filePath}`);
  }
});

console.log('🎉 Correction terminée !'); 