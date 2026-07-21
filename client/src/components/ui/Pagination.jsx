import { classNames } from '../../utils';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={classNames(
          'inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
          currentPage === 1
            ? 'text-navy-200 cursor-not-allowed'
            : 'text-navy-600 hover:bg-navy-50 hover:text-navy-800'
        )}
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-navy-600 hover:bg-navy-50 hover:text-navy-800 transition-colors duration-150"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="px-1 py-2 text-navy-300">...</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={classNames(
            'min-w-[36px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
            page === currentPage
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-navy-600 hover:bg-navy-50 hover:text-navy-800'
          )}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {pages.slice(-1)[0] < totalPages && (
        <>
          {pages.slice(-1)[0] < totalPages - 1 && (
            <span className="px-1 py-2 text-navy-300">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-navy-600 hover:bg-navy-50 hover:text-navy-800 transition-colors duration-150"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={classNames(
          'inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
          currentPage === totalPages
            ? 'text-navy-200 cursor-not-allowed'
            : 'text-navy-600 hover:bg-navy-50 hover:text-navy-800'
        )}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
};

export default Pagination;
