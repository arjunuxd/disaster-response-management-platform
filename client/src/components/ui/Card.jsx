import { classNames } from '../../utils';

const Card = ({ children, className = '', hover = false, padding = true, ...props }) => {
  return (
    <div
      className={classNames(
        'bg-white rounded-xl shadow-sm border border-gray-100',
        padding && 'p-6',
        hover && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
