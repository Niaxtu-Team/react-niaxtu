/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 * @param {string} phone - Numéro à valider
 * @returns {boolean} True si valide
 */
export const isValidPhone = (phone) => {
  // Supprime les espaces et tirets
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Formats acceptés: +33xxxxxxxxx, 0xxxxxxxxx
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  return phoneRegex.test(cleaned);
};

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {object} Résultat de validation avec détails
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!password || password.length < 8) {
    result.errors.push('Le mot de passe doit contenir au moins 8 caractères');
    result.isValid = false;
  }

  if (!/[A-Z]/.test(password)) {
    result.errors.push('Le mot de passe doit contenir au moins une majuscule');
    result.isValid = false;
  }

  if (!/[a-z]/.test(password)) {
    result.errors.push('Le mot de passe doit contenir au moins une minuscule');
    result.isValid = false;
  }

  if (!/\d/.test(password)) {
    result.errors.push('Le mot de passe doit contenir au moins un chiffre');
    result.isValid = false;
  }

  return result;
};

/**
 * Valide un champ requis
 * @param {any} value - Valeur à valider
 * @param {string} fieldName - Nom du champ
 * @returns {string|null} Message d'erreur ou null
 */
export const validateRequired = (value, fieldName = 'Ce champ') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} est requis`;
  }
  return null;
};

/**
 * Valide la longueur d'un texte
 * @param {string} text - Texte à valider
 * @param {number} minLength - Longueur minimale
 * @param {number} maxLength - Longueur maximale
 * @param {string} fieldName - Nom du champ
 * @returns {string|null} Message d'erreur ou null
 */
export const validateLength = (text, minLength = 0, maxLength = Infinity, fieldName = 'Ce champ') => {
  if (!text) return null;
  
  if (text.length < minLength) {
    return `${fieldName} doit contenir au moins ${minLength} caractères`;
  }
  
  if (text.length > maxLength) {
    return `${fieldName} ne peut pas dépasser ${maxLength} caractères`;
  }
  
  return null;
};

/**
 * Valide un formulaire complet
 * @param {object} data - Données du formulaire
 * @param {object} rules - Règles de validation
 * @returns {object} Résultat de validation
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    const fieldErrors = [];

    fieldRules.forEach(rule => {
      let error = null;
      
      switch (rule.type) {
        case 'required':
          error = validateRequired(value, rule.message || field);
          break;
        case 'email':
          if (value && !isValidEmail(value)) {
            error = rule.message || 'Format d\'email invalide';
          }
          break;
        case 'phone':
          if (value && !isValidPhone(value)) {
            error = rule.message || 'Format de téléphone invalide';
          }
          break;
        case 'length':
          error = validateLength(value, rule.min, rule.max, rule.message || field);
          break;
        default:
          break;
      }
      
      if (error) {
        fieldErrors.push(error);
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
}; 