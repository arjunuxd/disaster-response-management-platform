import { classNames } from '../../utils';

const AdminTable = ({ columns, data, onRowClick, emptyMessage = 'No data found.' }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-navy-100">
      <table className="w-full">
        <thead>
          <tr className="border-b border-navy-100 bg-navy-50/50">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={classNames(
                  'px-5 py-3.5 text-left text-xs font-semibold text-navy-500 uppercase tracking-wider',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-navy-50 flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-navy-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-navy-500">{emptyMessage}</p>
                  <p className="text-xs text-navy-300 mt-1">Try adjusting your filters or search query</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row._id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
                className={classNames(
                  'transition-colors duration-100',
                  onRowClick && [
                    'cursor-pointer',
                    'hover:bg-primary-50/40',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
                  ]
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={classNames(
                      'px-5 py-3.5 text-sm text-navy-700',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
