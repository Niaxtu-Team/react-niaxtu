import { useState } from 'react';
import { Search } from 'lucide-react';
import PageLayout from '../layout/PageLayout';
import { Input } from '../ui';
import DataTable from './DataTable';

/**
 * Layout de liste standard avec recherche et tableau
 */
export default function ListLayout({
  title,
  icon,
  iconColor,
  iconBg,
  data = [],
  columns = [],
  searchFields = [],
  searchPlaceholder = 'Rechercher...',
  emptyMessage = 'Aucun élément trouvé',
  children,
  actions
}) {
  const [search, setSearch] = useState('');

  // Filtrage des données
  const filteredData = data.filter(item => {
    if (!search.trim()) return true;
    
    const searchLower = search.toLowerCase();
    return searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });

  return (
    <PageLayout
      title={title}
      icon={icon}
      iconColor={iconColor}
      iconBg={iconBg}
    >
      {/* Barre de recherche et actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(name, value) => setSearch(value)}
            icon={Search}
          />
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Contenu personnalisé */}
      {children}

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl">
        <DataTable
          data={filteredData}
          columns={columns}
          emptyMessage={emptyMessage}
        />
      </div>
    </PageLayout>
  );
} 