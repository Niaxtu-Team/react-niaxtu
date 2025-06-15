import { useState } from 'react';
import { 
  Trash2, 
  Archive, 
  CheckCircle, 
  XCircle, 
  Download,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';

const BulkActions = ({
  selectedItems = [],
  onSelectAll,
  onDeselectAll,
  onDelete,
  onArchive,
  onApprove,
  onReject,
  onExport,
  totalItems = 0,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCount = selectedItems.length;
  const allSelected = selectedCount === totalItems && totalItems > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      onDeselectAll?.();
    } else {
      onSelectAll?.();
    }
  };

  const handleAction = (action, actionFn) => {
    if (selectedCount === 0) return;
    actionFn?.(selectedItems);
    setIsOpen(false);
  };

  const actions = [
    {
      key: 'approve',
      label: 'Approuver',
      icon: CheckCircle,
      color: 'text-green-600 hover:bg-green-50',
      onClick: () => handleAction('approve', onApprove),
      show: !!onApprove
    },
    {
      key: 'reject',
      label: 'Rejeter',
      icon: XCircle,
      color: 'text-red-600 hover:bg-red-50',
      onClick: () => handleAction('reject', onReject),
      show: !!onReject
    },
    {
      key: 'archive',
      label: 'Archiver',
      icon: Archive,
      color: 'text-blue-600 hover:bg-blue-50',
      onClick: () => handleAction('archive', onArchive),
      show: !!onArchive
    },
    {
      key: 'export',
      label: 'Exporter',
      icon: Download,
      color: 'text-purple-600 hover:bg-purple-50',
      onClick: () => handleAction('export', onExport),
      show: !!onExport
    },
    {
      key: 'delete',
      label: 'Supprimer',
      icon: Trash2,
      color: 'text-red-600 hover:bg-red-50',
      onClick: () => handleAction('delete', onDelete),
      show: !!onDelete,
      separator: true
    }
  ].filter(action => action.show);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Sélection */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            {selectedCount > 0 ? (
              <span className="font-medium">
                {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span>
                Sélectionner tout ({totalItems})
              </span>
            )}
          </span>
        </div>

        {selectedCount > 0 && (
          <button
            onClick={onDeselectAll}
            disabled={disabled}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Désélectionner tout
          </button>
        )}
      </div>

      {/* Actions */}
      {selectedCount > 0 && actions.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <MoreHorizontal className="w-4 h-4 mr-2" />
            Actions
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>

          {isOpen && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="py-1">
                  {actions.map((action, index) => (
                    <div key={action.key}>
                      {action.separator && index > 0 && (
                        <div className="border-t border-gray-100 my-1" />
                      )}
                      <button
                        onClick={action.onClick}
                        className={`w-full flex items-center px-4 py-2 text-sm ${action.color} transition-colors`}
                      >
                        <action.icon className="w-4 h-4 mr-3" />
                        {action.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkActions; 