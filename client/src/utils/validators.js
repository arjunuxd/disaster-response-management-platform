export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return '';
  },

  email: (value) => {
    if (!value) return '';
    const regex = /^\S+@\S+\.\S+$/;
    if (!regex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  minLength: (min) => (value) => {
    if (!value) return '';
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return '';
  },

  maxLength: (max) => (value) => {
    if (!value) return '';
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return '';
  },

  phone: (value) => {
    if (!value) return '';
    const regex = /^\+?[\d\s\-()]{7,15}$/;
    if (!regex.test(value)) {
      return 'Please enter a valid phone number';
    }
    return '';
  },

  latitude: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < -90 || num > 90) {
      return 'Latitude must be between -90 and 90';
    }
    return '';
  },

  longitude: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < -180 || num > 180) {
      return 'Longitude must be between -180 and 180';
    }
    return '';
  },

  imageFile: (file) => {
    if (!file) return '';
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Image must be less than 5MB';
    }
    return '';
  },

  validate: (value, rules) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return '';
  },
};
