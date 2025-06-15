# Structure des Composants - Plateforme de Gestion des Plaintes

## Organisation des Composants

Cette structure organise les composants React en dossiers logiques pour améliorer la réutilisabilité et la maintenabilité.

## Structure des Dossiers

```
src/components/
├── ui/                     # Composants UI de base
├── search/                 # Composants de recherche
├── filters/                # Composants de filtrage
├── navigation/             # Composants de navigation
├── status/                 # Composants de statut/badges
├── actions/                # Composants d'actions
├── cards/                  # Composants de cartes d'affichage
├── tables/                 # Composants de tableaux existants
├── dashboard/              # Composants dashboard existants
├── charts/                 # Composants graphiques existants
├── forms/                  # Composants formulaires existants
├── layout/                 # Composants de mise en page existants
└── index.js               # Export centralisé
```

## Composants Créés

### 🔍 Recherche et Filtres
- **SearchBar** (`search/SearchBar.jsx`)
  - Barre de recherche réutilisable avec gestion du focus et bouton clear
  - Props: `placeholder`, `value`, `onChange`, `onClear`, `size`, `disabled`

- **FilterPanel** (`filters/FilterPanel.jsx`)
  - Panneau de filtres avancés avec multiple types (select, date, daterange, text)
  - Props: `filters`, `onFiltersChange`, `onReset`, `filterOptions`, `showPanel`

### 🧭 Navigation
- **Pagination** (`navigation/Pagination.jsx`)
  - Composant de pagination complet avec informations et navigation
  - Props: `currentPage`, `totalPages`, `totalItems`, `itemsPerPage`, `onPageChange`

### 🏷️ Statuts et Badges
- **StatusBadge** (`status/StatusBadge.jsx`)
  - Badge de statut configurable avec couleurs et icônes
  - Variantes: `StatusBadge`, `PriorityBadge`, `RoleBadge`
  - Props: `status`, `size`, `showIcon`, `animated`, `customColors`

### ⚡ Actions
- **ActionButtons** (`actions/ActionButtons.jsx`)
  - Boutons d'actions réutilisables avec variants (default, compact, dropdown)
  - **BulkActions** - Actions en masse pour sélections multiples
  - Props: `actions`, `size`, `variant`, `disabled`

### 🃏 Cartes d'Affichage
- **ComplaintCard** (`cards/ComplaintCard.jsx`)
  - Carte d'affichage pour les plaintes avec métadonnées et actions
  - Props: `complaint`, `onView`, `onEdit`, `onDelete`, `showActions`, `showFullDetails`

- **AdminCard** (`cards/AdminCard.jsx`)
  - Carte d'affichage pour les administrateurs avec permissions et statistiques
  - Props: `admin`, `onView`, `onEdit`, `onDelete`, `showActions`, `showStats`

## Composants Existants Intégrés

### UI de Base
- Button, Input, Card, Modal, Badge, LoadingSpinner, StatsCard

### Tableaux
- DataTable, ListLayout

### Dashboard
- StatCard, Board

### Graphiques
- ChartContainer

### Formulaires
- FormField, FormLayout, PhoneInput

### Layout
- AdminLayout, ProtectedRoute, LoginForm

## Utilisation

### Import des Composants
```jsx
import { 
  SearchBar, 
  FilterPanel, 
  Pagination, 
  StatusBadge, 
  ActionButtons,
  ComplaintCard,
  AdminCard 
} from '../../components';
```

### Exemples d'Utilisation

#### SearchBar
```jsx
<SearchBar
  placeholder="Rechercher des plaintes..."
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
  onClear={() => setSearchValue('')}
  size="medium"
/>
```

#### FilterPanel
```jsx
<FilterPanel
  filters={filters}
  onFiltersChange={setFilters}
  onReset={() => setFilters({})}
  showPanel={showFilters}
  onTogglePanel={() => setShowFilters(!showFilters)}
  filterOptions={{
    status: {
      type: 'select',
      label: 'Statut',
      options: [
        { value: 'en-attente', label: 'En attente' },
        { value: 'en-traitement', label: 'En traitement' }
      ]
    },
    dateRange: {
      type: 'daterange',
      label: 'Période'
    }
  }}
/>
```

#### StatusBadge
```jsx
<StatusBadge status="en-attente" size="medium" animated />
<PriorityBadge priority="elevee" size="small" />
<RoleBadge role="admin" size="medium" />
```

#### ActionButtons
```jsx
<ActionButtons
  actions={[
    { type: 'view', onClick: () => handleView(item) },
    { type: 'edit', onClick: () => handleEdit(item) },
    { type: 'delete', onClick: () => handleDelete(item) }
  ]}
  variant="compact"
  size="small"
/>
```

#### ComplaintCard
```jsx
<ComplaintCard
  complaint={complaint}
  onView={handleViewComplaint}
  onEdit={handleEditComplaint}
  onDelete={handleDeleteComplaint}
  showActions={true}
  showFullDetails={false}
/>
```

## Patterns d'Utilisation

### 1. Pages de Liste
Combinaison typique pour les pages de gestion :
```jsx
<SearchBar />
<FilterPanel />
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <ComplaintCard key={item.id} complaint={item} />
  ))}
</div>
<Pagination />
```

### 2. Actions Contextuelles
```jsx
<ActionButtons
  actions={[
    { type: 'view', onClick: () => navigate(`/details/${id}`) },
    { type: 'edit', onClick: () => setEditMode(true) },
    { type: 'delete', onClick: () => setShowDeleteModal(true) }
  ]}
  variant="dropdown"
/>
```

### 3. Gestion des États
```jsx
<StatusBadge 
  status={item.status} 
  animated={item.status === 'en-attente'} 
/>
```

## Avantages de cette Organisation

1. **Réutilisabilité** : Composants génériques utilisables dans multiple pages
2. **Cohérence** : Design system uniforme
3. **Maintenabilité** : Organisation logique et documentation
4. **Performance** : Composants optimisés avec gestion d'états
5. **Accessibilité** : Composants respectant les standards d'accessibilité
6. **Extensibilité** : Facilité d'ajout de nouveaux composants

## Prochaines Étapes

### Composants à Créer
- **TabNavigation** - Navigation par onglets
- **BreadcrumbNavigation** - Fil d'Ariane
- **StructureCard** - Carte pour les structures
- **StatisticWidget** - Widget de statistiques
- **ActivityTimeline** - Timeline des activités
- **ConfirmationModal** - Modal de confirmation
- **ExportButton** - Bouton d'export
- **RefreshButton** - Bouton de rafraîchissement

### Améliorations
- Tests unitaires pour chaque composant
- Storybook pour la documentation visuelle
- Thèmes et personnalisation avancée
- Animations et transitions
- Optimisations de performance

Cette structure permet une maintenance plus facile et une réutilisation optimale des composants à travers toute l'application. 