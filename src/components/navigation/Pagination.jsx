import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange,
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  className = ""
}) => {
  // Calculer les pages visibles
  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Ajuster si on a moins de pages que maxVisiblePages
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 ${className}`}>
      {/* Informations */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          Affichage de <span className="font-semibold text-gray-900">{startItem}</span> à{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> sur{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> résultats
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center space-x-2">
        {/* Première page */}
        {showFirstLast && currentPage > 3 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Première page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            {currentPage > 4 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}

        {/* Page précédente */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Pages numérotées */}
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
              ${page === currentPage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            {page}
          </button>
        ))}

        {/* Page suivante */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dernière page */}
        {showFirstLast && totalPages - currentPage > 2 && (
          <>
            {totalPages - currentPage > 3 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Dernière page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Pagination; 