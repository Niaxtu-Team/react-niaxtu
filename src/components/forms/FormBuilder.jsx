import { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const FormBuilder = ({
  fields = [],
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  showCancel = true,
  className = ""
}) => {
  const [formData, setFormData] = useState(() => {
    const initial = { ...initialData };
    // Initialiser tous les champs requis
    fields.forEach(field => {
      if (!(field.name in initial)) {
        initial[field.name] = field.type === 'checkbox' ? false : '';
      }
    });
    return initial;
  });

  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur si elle existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const validateField = (field) => {
    const value = formData[field.name];
    const fieldErrors = [];

    // Validation required
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      fieldErrors.push(`${field.label} est requis`);
    }

    // Validation spécifique par type
    if (value && field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        fieldErrors.push('Format email invalide');
      }
    }

    if (value && field.type === 'password') {
      if (field.minLength && value.length < field.minLength) {
        fieldErrors.push(`Minimum ${field.minLength} caractères`);
      }
    }

    // Validation personnalisée
    if (field.validation && value) {
      const customError = field.validation(value, formData);
      if (customError) fieldErrors.push(customError);
    }

    return fieldErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    fields.forEach(field => {
      const fieldErrors = validateField(field);
      if (fieldErrors.length > 0) {
        newErrors[field.name] = fieldErrors[0]; // Première erreur seulement
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case 'email': return Mail;
      case 'password': return Lock;
      case 'tel': return Phone;
      case 'text': 
      default: return User;
    }
  };

  const renderField = (field) => {
    const {
      name,
      type = 'text',
      label,
      placeholder,
      required = false,
      options = [],
      rows = 3,
      icon: CustomIcon
    } = field;

    const value = formData[name] || '';
    const error = errors[name];
    const Icon = CustomIcon || getFieldIcon(type);

    const baseInputClasses = `
      w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2
      ${error 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
      }
    `;

    switch (type) {
      case 'select':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              className={baseInputClasses}
              required={required}
            >
              <option value="">Sélectionner...</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className={baseInputClasses}
              required={required}
            />
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={name} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={name}
              checked={value}
              onChange={(e) => handleChange(name, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      case 'password':
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPasswords[name] ? 'text' : 'password'}
                value={value}
                onChange={(e) => handleChange(name, e.target.value)}
                placeholder={placeholder}
                className={`${baseInputClasses} pl-10 pr-10`}
                required={required}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(name)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPasswords[name] ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={type}
                value={value}
                onChange={(e) => handleChange(name, e.target.value)}
                placeholder={placeholder}
                className={`${baseInputClasses} pl-10`}
                required={required}
              />
            </div>
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(renderField)}

        {/* Boutons d'action */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {cancelLabel}
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{loading ? 'Enregistrement...' : submitLabel}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBuilder; 