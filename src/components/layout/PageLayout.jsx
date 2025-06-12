import { Card } from '../ui';

/**
 * Layout de page standard avec titre et icône
 */
export default function PageLayout({ 
  title, 
  icon: Icon, 
  iconColor = 'text-indigo-500',
  iconBg = 'bg-indigo-100',
  children,
  className = '',
  maxWidth = 'max-w-5xl'
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className={`w-full ${maxWidth} p-8 rounded-2xl shadow-xl bg-white border border-gray-100 animate-fade-in ${className}`}>
        {(title || Icon) && (
          <div className="flex items-center mb-6">
            {Icon && (
              <span className={`${iconBg} p-3 rounded-xl shadow ${iconColor}`}>
                <Icon className="w-7 h-7" />
              </span>
            )}
            {title && (
              <h2 className="ml-4 text-3xl font-extrabold text-gray-800 tracking-tight">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
} 