import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    noData: 'No data available',
    networkError: 'Network error',
    offline: 'You are offline',
    tryAgain: 'Try again',
  },
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    loginError: 'Login failed',
    registerError: 'Registration failed',
    invalidEmail: 'Invalid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDontMatch: 'Passwords do not match',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    phoneRequired: 'Phone number is required',
  },
  stations: {
    title: 'Charging Stations',
    nearby: 'Nearby Stations',
    search: 'Search Stations',
    filter: 'Filter Stations',
    distance: 'Distance',
    rating: 'Rating',
    price: 'Price',
    availability: 'Availability',
    open: 'Open',
    closed: 'Closed',
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline',
    free: 'Free',
    paid: 'Paid',
    fast: 'Fast Charging',
    slow: 'Slow Charging',
    details: 'Station Details',
    address: 'Address',
    operatingHours: 'Operating Hours',
    amenities: 'Amenities',
    reviews: 'Reviews',
    directions: 'Get Directions',
    call: 'Call',
    website: 'Website',
    report: 'Report Issue',
    favorite: 'Add to Favorites',
    unfavorite: 'Remove from Favorites',
    noStationsNearby: 'No charging stations nearby',
    loadingStations: 'Loading stations...',
    errorLoadingStations: 'Error loading stations',
  },
  bookings: {
    title: 'Bookings',
    newBooking: 'New Booking',
    myBookings: 'My Bookings',
    upcoming: 'Upcoming',
    past: 'Past',
    cancelled: 'Cancelled',
    bookNow: 'Book Now',
    selectTime: 'Select Time',
    selectDate: 'Select Date',
    duration: 'Duration',
    totalPrice: 'Total Price',
    confirmBooking: 'Confirm Booking',
    bookingConfirmed: 'Booking Confirmed',
    bookingCancelled: 'Booking Cancelled',
    cancelBooking: 'Cancel Booking',
    modifyBooking: 'Modify Booking',
    noBookings: 'No bookings found',
    loadingBookings: 'Loading bookings...',
    errorLoadingBookings: 'Error loading bookings',
    bookingError: 'Booking failed',
    timeSlotUnavailable: 'Time slot unavailable',
    selectValidTime: 'Please select a valid time',
    bookingLimitReached: 'Booking limit reached',
  },
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    preferences: 'Preferences',
    notifications: 'Notifications',
    privacy: 'Privacy',
    help: 'Help & Support',
    about: 'About',
    version: 'Version',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    contactUs: 'Contact Us',
    rateApp: 'Rate App',
    shareApp: 'Share App',
    logout: 'Logout',
    deleteAccount: 'Delete Account',
    confirmDeleteAccount: 'Are you sure you want to delete your account?',
    accountDeleted: 'Account deleted successfully',
    profileUpdated: 'Profile updated successfully',
    errorUpdatingProfile: 'Error updating profile',
  },
  maps: {
    title: 'Map',
    currentLocation: 'Current Location',
    getDirections: 'Get Directions',
    showRoute: 'Show Route',
    hideRoute: 'Hide Route',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    satellite: 'Satellite View',
    street: 'Street View',
    traffic: 'Traffic',
    noLocationPermission: 'Location permission required',
    locationUnavailable: 'Location unavailable',
    enableLocation: 'Enable Location Services',
  },
  notifications: {
    title: 'Notifications',
    pushNotifications: 'Push Notifications',
    emailNotifications: 'Email Notifications',
    bookingReminders: 'Booking Reminders',
    stationUpdates: 'Station Updates',
    promotionalOffers: 'Promotional Offers',
    systemUpdates: 'System Updates',
    notificationSettings: 'Notification Settings',
    allNotifications: 'All Notifications',
    importantOnly: 'Important Only',
    none: 'None',
    sound: 'Sound',
    vibration: 'Vibration',
    badge: 'Badge',
  },
  errors: {
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    timeoutError: 'Request timeout. Please try again.',
    unauthorizedError: 'Unauthorized. Please login again.',
    forbiddenError: 'Access denied.',
    notFoundError: 'Resource not found.',
    validationError: 'Please check your input.',
    unknownError: 'An unknown error occurred.',
    offlineError: 'You are offline. Please check your connection.',
    retryError: 'Failed to retry. Please try again.',
  },
  time: {
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    nextWeek: 'Next Week',
    thisMonth: 'This Month',
    nextMonth: 'Next Month',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    years: 'years',
  },
  currency: {
    format: '{{amount}} {{currency}}',
    free: 'Free',
    perHour: 'per hour',
    perSession: 'per session',
  },
};

// Spanish translations
const es = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    refresh: 'Actualizar',
    noData: 'No hay datos disponibles',
    networkError: 'Error de red',
    offline: 'Estás desconectado',
    tryAgain: 'Intentar de nuevo',
  },
  auth: {
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phone: 'Número de Teléfono',
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetPassword: 'Restablecer Contraseña',
    loginSuccess: 'Inicio de sesión exitoso',
    registerSuccess: 'Registro exitoso',
    loginError: 'Error al iniciar sesión',
    registerError: 'Error al registrarse',
    invalidEmail: 'Dirección de correo inválida',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    passwordsDontMatch: 'Las contraseñas no coinciden',
    emailRequired: 'El correo electrónico es requerido',
    passwordRequired: 'La contraseña es requerida',
    firstNameRequired: 'El nombre es requerido',
    lastNameRequired: 'El apellido es requerido',
    phoneRequired: 'El número de teléfono es requerido',
  },
  // Add more Spanish translations as needed
};

// French translations
const fr = {
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    refresh: 'Actualiser',
    noData: 'Aucune donnée disponible',
    networkError: 'Erreur réseau',
    offline: 'Vous êtes hors ligne',
    tryAgain: 'Réessayer',
  },
  // Add more French translations as needed
};

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

try {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en', // Default language
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })
    .catch((error) => {
      console.warn('i18n initialization failed:', error);
    });
} catch (error) {
  console.warn('i18n setup failed:', error);
}

export default i18n;

// Language detection utility
export const detectLanguage = () => {
  try {
    const deviceLanguage = require('expo-localization').locale;
    const supportedLanguages = ['en', 'es', 'fr'];
    const languageCode = deviceLanguage?.split('-')[0] || 'en';
    
    return supportedLanguages.includes(languageCode) ? languageCode : 'en';
  } catch (error) {
    console.warn('Language detection failed, using default:', error);
    return 'en';
  }
};

// Language switching utility
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
};

// Number formatting utility
export const formatNumber = (number: number, locale?: string) => {
  try {
    if (number === null || number === undefined) return '0';
    return new Intl.NumberFormat(locale || i18n.language).format(number);
  } catch (error) {
    console.warn('Number formatting failed:', error);
    return String(number || 0);
  }
};

// Date formatting utility
export const formatDate = (date: Date, format?: string, locale?: string) => {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    return new Intl.DateTimeFormat(locale || i18n.language, options).format(date);
  } catch (error) {
    console.warn('Date formatting failed:', error);
    return '';
  }
};

// Currency formatting utility
export const formatCurrency = (amount: number, currency: string = 'USD', locale?: string) => {
  try {
    if (amount === null || amount === undefined) return '0';
    return new Intl.NumberFormat(locale || i18n.language, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    console.warn('Currency formatting failed:', error);
    return `${amount || 0} ${currency}`;
  }
};
