# Architecture des Composants - Niaxtu Admin

Cette documentation décrit la nouvelle architecture modulaire des composants du frontend Niaxtu Admin.

## Structure des Dossiers

```
src/components/
├── ui/                 # Composants UI de base
├── layout/            # Composants de mise en page
├── dashboard/         # Composants spécifiques au dashboard
├── charts/            # Composants de graphiques
├── tables/            # Composants de tableaux
├── forms/             # Composants de formulaires
├── admin/             # Composants d'administration
├── modals/            # Composants de modales (à créer)
├── navigation/        # Composants de navigation (à créer)
└── index.js           # Export principal
```

## Composants UI de Base (`ui/`)

### Button
Composant bouton réutilisable avec plusieurs variantes et tailles.

```jsx
import { Button } from '../../components/ui';

<Button variant="primary" size="md" loading={false}>
  Cliquer ici
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `icon`: ReactNode

### Card
Composant carte avec header, content et footer.

```jsx
import { Card } from '../../components/ui';

<Card padding="md" shadow="sm" hover={true}>
  <Card.Header>
    <Card.Title>Titre</Card.Title>
  </Card.Header>
  <Card.Content>
    Contenu de la carte
  </Card.Content>
  <Card.Footer>
    Actions
  </Card.Footer>
</Card>
```

### Input
Composant input avec label, erreur et icône.

```jsx
import { Input } from '../../components/ui';

<Input
  label="Email"
  type="email"
  error="Email invalide"
  icon={<EmailIcon />}
  required
/>
```

### Modal
Composant modal avec confirmation intégrée.

```jsx
import { Modal } from '../../components/ui';

<Modal isOpen={true} onClose={handleClose} title="Titre">
  <Modal.Body>Contenu</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>

// Modal de confirmation
<Modal.Confirm
  isOpen={true}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Confirmer l'action"
  message="Êtes-vous sûr ?"
/>
```

### Badge
Composant badge pour les statuts et labels.

```jsx
import { Badge } from '../../components/ui';

<Badge variant="success">Actif</Badge>
```

## Composants Layout (`layout/`)

### Sidebar
Sidebar avec navigation hiérarchique.

```jsx
import { Sidebar } from '../../components/layout';

<Sidebar
  collapsed={false}
  onToggle={handleToggle}
  openMenus={openMenus}
  onToggleMenu={handleToggleMenu}
/>
```

### Header
Header avec recherche, notifications et profil.

```jsx
import { Header } from '../../components/layout';

<Header
  title="Dashboard"
  isScrolled={false}
  showNotifications={false}
  onToggleNotifications={handleNotifications}
  onLogout={handleLogout}
/>
```

## Composants Dashboard (`dashboard/`)

### StatCard
Carte de statistique avec icône et tendance.

```jsx
import { StatCard } from '../../components/dashboard';

<StatCard
  icon="fa-users"
  color="blue"
  title="Utilisateurs"
  value="1,234"
  trend="up"
  change="+12%"
/>
```

## Composants Charts (`charts/`)

### ChartContainer
Conteneur pour les graphiques avec titre et actions.

```jsx
import { ChartContainer } from '../../components/charts';

<ChartContainer 
  title="Évolution des ventes"
  actions={<Button>Exporter</Button>}
  height="h-80"
>
  <LineChart data={data} />
</ChartContainer>
```

## Composants Tables (`tables/`)

### DataTable
Tableau de données avec tri, pagination et actions.

```jsx
import { DataTable, StatusBadge, ActionButtons } from '../../components/tables';

const columns = [
  {
    header: 'Nom',
    accessor: 'name',
    render: (value) => <strong>{value}</strong>
  },
  {
    header: 'Statut',
    accessor: 'status',
    render: (value) => <StatusBadge status={value} />
  },
  {
    header: 'Actions',
    accessor: 'actions',
    render: (_, row) => (
      <ActionButtons
        onView={() => handleView(row)}
        onEdit={() => handleEdit(row)}
        onDelete={() => handleDelete(row)}
      />
    )
  }
];

<DataTable
  title="Utilisateurs"
  columns={columns}
  data={users}
  actions={<Button>Nouveau</Button>}
/>
```

## Composants Forms (`forms/`)

### FormField
Champ de formulaire universel.

```jsx
import { FormField } from '../../components/forms';

<FormField
  type="select"
  label="Rôle"
  name="role"
  value={formData.role}
  onChange={handleChange}
  options={roleOptions}
  required
/>
```

**Types supportés:**
- `text`, `email`, `password`, `number`
- `select`, `textarea`
- `checkbox`, `radio`

## Composants Admin (`admin/`)

### AdminTabs
Navigation par onglets pour l'administration.

```jsx
import { AdminTabs } from '../../components/admin';

const tabs = [
  { id: 'users', label: 'Utilisateurs', icon: 'fa-users', count: 10 },
  { id: 'roles', label: 'Rôles', icon: 'fa-shield' }
];

<AdminTabs
  tabs={tabs}
  activeTab="users"
  onTabChange={setActiveTab}
/>
```

### PermissionGrid
Grille de gestion des permissions.

```jsx
import { PermissionGrid } from '../../components/admin';

<PermissionGrid
  permissions={permissions}
  onPermissionChange={handlePermissionChange}
/>
```

## Utilisation

### Import des composants

```jsx
// Import groupé depuis l'index principal
import { 
  Button, 
  Card, 
  Modal, 
  DataTable, 
  StatCard 
} from '../../components';

// Import spécifique par catégorie
import { Button, Card } from '../../components/ui';
import { Sidebar, Header } from '../../components/layout';
import { DataTable } from '../../components/tables';
```

### Exemple d'utilisation complète

```jsx
import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Modal,
  DataTable,
  StatCard
} from '../../components';

const MyPage = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          icon="fa-users"
          title="Utilisateurs"
          value="1,234"
          trend="up"
          change="+12%"
        />
      </div>

      {/* Tableau */}
      <DataTable
        title="Données"
        columns={columns}
        data={data}
        actions={
          <Button onClick={() => setShowModal(true)}>
            Nouveau
          </Button>
        }
      />

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouveau élément"
      >
        <Modal.Body>
          Contenu du formulaire
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Sauvegarder
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
```

## Avantages de cette Architecture

1. **Réutilisabilité** : Composants modulaires réutilisables
2. **Maintenabilité** : Code organisé et facile à maintenir
3. **Consistance** : Interface utilisateur cohérente
4. **Performance** : Composants optimisés avec React.memo
5. **Accessibilité** : Support ARIA intégré
6. **Thématisation** : Système de couleurs et variants unifié

## Migration

Pour migrer une page existante :

1. Identifier les éléments UI répétitifs
2. Remplacer par les composants correspondants
3. Extraire la logique métier des composants UI
4. Utiliser les nouveaux composants modulaires
5. Tester et valider le comportement

## Prochaines Étapes

- [ ] Créer des composants de navigation avancés
- [ ] Ajouter des composants de formulaires complexes
- [ ] Implémenter un système de thèmes
- [ ] Ajouter des tests unitaires pour chaque composant
- [ ] Créer un Storybook pour la documentation visuelle 