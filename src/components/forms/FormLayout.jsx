import { useState } from 'react';
import PageLayout from '../layout/PageLayout';
import { Button } from '../ui';

/**
 * Layout de formulaire standard
 */
export default function FormLayout({
  title,
  icon,
  iconColor,
  iconBg,
  onSubmit,
  submitText = 'Enregistrer',
  submitIcon,
  children,
  isLoading = false,
  maxWidth = 'max-w-lg'
}) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await onSubmit(e);
      if (result?.success) {
        setMessage(result.message || 'Opération réussie !');
        setTimeout(() => setMessage(''), 2500);
      } else if (result?.error) {
        setMessage(result.error);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Une erreur est survenue');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <PageLayout
      title={title}
      icon={icon}
      iconColor={iconColor}
      iconBg={iconBg}
      maxWidth={maxWidth}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {children}
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
          icon={submitIcon}
        >
          {isLoading ? 'Chargement...' : submitText}
        </Button>

        {message && (
          <div className="mt-4 text-center animate-bounce-in">
            <span className={`inline-block px-4 py-2 rounded-full shadow font-semibold ${
              message.includes('erreur') || message.includes('Erreur')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </span>
          </div>
        )}
      </form>
    </PageLayout>
  );
} 
