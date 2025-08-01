export type SupportedLanguage = "en" | "es" | "fr";

export interface TranslationSet {
  // Common
  welcome: string;
  loading: string;
  error: string;
  save: string;
  cancel: string;

  // Navigation
  home: string;
  exercise: string;
  profile: string;

  // Login
  loginToAccount: string;
  email: string;
  password: string;
  signIn: string;
  signInWithGoogle: string;
  dontHaveAccount: string;
  signUp: string;
  invalidCredentials: string;

  // Signup
  createAccount: string;
  confirmPassword: string;
  passwordsDontMatch: string;
  failedToCreateAccount: string;
  alreadyHaveAccount: string;
  signUpWithGoogle: string;
  enterInfoToCreateAccount: string;
  creatingAccount: string;
  passwordMinLength: string;
  pleaseConfirmPassword: string;

  // Home/Main page
  clickPenguinToStart: string;
  speakAfterBeep: string;
  listening: string;
  processing: string;
  clickOnPipToStart: string;
  yourTurnToSpeak: string;
  pipIsResponding: string;
  initializing: string;

  // Profile page
  loadingYourProfile: string;
  showingLocallyDataSync: string;
  yearsOld: string;
  greatProgressSpeech: string;
  speechSoundMastery: string;
  masterPercentTarget: string;
  viewSpeechReport: string;
  speechExercisesCompleted: string;
  phonemesMastered: string;
  therapyTimeToday: string;
  speechMilestones: string;

  // Profile
  myProfile: string;
  editProfile: string;
  settings: string;
  language: string;
  theme: string;
  light: string;
  dark: string;
  logout: string;
  confirmLogout: string;
  confirmLogoutMessage: string;

  // Exercise
  exerciseMode: string;
  practicePhonemes: string;
  speechTraining: string;

  // Auth forms
  enterEmailToLogin: string;
  forgotPassword: string;
  orContinueWith: string;
  newChat: string;
  replayAudio: string;

  // Edit Profile
  editProfileTitle: string;
  name: string;
  username: string;
  dateOfBirth: string;
  dateOfBirthNote: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  savePassword: string;
  passwordsDontMatchError: string;

  // Language Settings
  languageSettings: string;
  selectLanguage: string;
  languageNote: string;
  languageChangeNote: string;
  applyChanges: string;
  saving: string;

  // Exercise page
  pronunciationExercise: string;
  practicePhrase: string;
  practiceInstructions: string;
  practiceSubtitle: string;
}

const translations: Record<SupportedLanguage, TranslationSet> = {
  en: {
    // Common
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    save: "Save",
    cancel: "Cancel",

    // Navigation
    home: "Home",
    exercise: "Exercise",
    profile: "Profile",

    // Login
    loginToAccount: "Login to your account",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signInWithGoogle: "Sign in with Google",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign up",
    invalidCredentials: "Invalid email or password",

    // Signup
    createAccount: "Create an account",
    confirmPassword: "Confirm password",
    passwordsDontMatch: "Passwords do not match",
    failedToCreateAccount: "Failed to create account",
    alreadyHaveAccount: "Already have an account?",
    signUpWithGoogle: "Sign up with Google",
    enterInfoToCreateAccount: "Enter your information to create your account",
    creatingAccount: "Creating account...",
    passwordMinLength: "Password must be at least 8 characters long",
    pleaseConfirmPassword: "Please confirm your password",

    // Home/Main page
    clickPenguinToStart: "Click the penguin to start!",
    speakAfterBeep: "Speak after the beep",
    listening: "Listening...",
    processing: "Processing...",
    clickOnPipToStart: "Click on Pip to start!",
    yourTurnToSpeak: "Your turn to speak!",
    pipIsResponding: "Pip is responding...",
    initializing: "Initializing...",

    // Profile page
    loadingYourProfile: "Loading your profile...",
    showingLocallyDataSync:
      "📱 Showing locally saved data. Will sync when connection is restored.",
    yearsOld: "years old",
    greatProgressSpeech:
      "Great progress with your speech sounds! Keep practicing those tricky phonemes - you're doing amazing!",
    speechSoundMastery: "Speech Sound Mastery!",
    masterPercentTarget:
      "You've mastered 76% of your target sounds. See your phoneme progress report...",
    viewSpeechReport: "View Speech Report",
    speechExercisesCompleted: "Speech exercises completed",
    phonemesMastered: "Phonemes mastered",
    therapyTimeToday: "Therapy time today",
    speechMilestones: "Speech Milestones",

    // Profile
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    logout: "Logout",
    confirmLogout: "Confirm Logout",
    confirmLogoutMessage: "Are you sure you want to logout?",

    // Exercise
    exerciseMode: "Exercise Mode",
    practicePhonemes: "Practice Phonemes",
    speechTraining: "Speech Training",

    // Auth forms
    enterEmailToLogin: "Enter your email below to login to your account",
    forgotPassword: "Forgot password?",
    orContinueWith: "Or continue with",
    newChat: "New Chat",
    replayAudio: "Replay Audio",

    // Edit Profile
    editProfileTitle: "Edit Profile",
    name: "Name",
    username: "Username",
    dateOfBirth: "Date of Birth",
    dateOfBirthNote: "Your date of birth is used to calculate your age.",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    savePassword: "Save Password",
    passwordsDontMatchError: "Passwords do not match",

    // Language Settings
    languageSettings: "Language Settings",
    selectLanguage: "Choose Your Language",
    languageNote:
      "This affects speech recognition, transcription, and pronunciation analysis",
    languageChangeNote:
      "Language changes will apply to new recordings and exercises. Your learning progress will be preserved.",
    applyChanges: "Apply Changes",
    saving: "Saving...",

    // Exercise page
    pronunciationExercise: "Pronunciation Exercise",
    practicePhrase: "Practice Phrase:",
    practiceInstructions:
      "Press the microphone button and say the phrase above. Your pronunciation will be analyzed automatically.",
    practiceSubtitle: "Practice pronouncing the phrase below",
  },

  fr: {
    // Common
    welcome: "Bienvenue",
    loading: "Chargement...",
    error: "Erreur",
    save: "Enregistrer",
    cancel: "Annuler",

    // Navigation
    home: "Accueil",
    exercise: "Exercice",
    profile: "Profil",

    // Login
    loginToAccount: "Connectez-vous à votre compte",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se connecter",
    signInWithGoogle: "Se connecter avec Google",
    dontHaveAccount: "Vous n'avez pas de compte ?",
    signUp: "S'inscrire",
    invalidCredentials: "Email ou mot de passe invalide",

    // Signup
    createAccount: "Créer un compte",
    confirmPassword: "Confirmer le mot de passe",
    passwordsDontMatch: "Les mots de passe ne correspondent pas",
    failedToCreateAccount: "Échec de la création du compte",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    signUpWithGoogle: "S'inscrire avec Google",
    enterInfoToCreateAccount: "Entrez vos informations pour créer votre compte",
    creatingAccount: "Création du compte...",
    passwordMinLength: "Le mot de passe doit contenir au moins 8 caractères",
    pleaseConfirmPassword: "Veuillez confirmer votre mot de passe",

    // Home/Main page
    clickPenguinToStart: "Cliquez sur le pingouin pour commencer !",
    speakAfterBeep: "Parlez après le bip",
    listening: "Écoute...",
    processing: "Traitement...",
    clickOnPipToStart: "Cliquez sur Pip pour commencer !",
    yourTurnToSpeak: "À votre tour de parler !",
    pipIsResponding: "Pip répond...",
    initializing: "Initialisation...",

    // Profile page
    loadingYourProfile: "Chargement de votre profil...",
    showingLocallyDataSync:
      "📱 Affichage des données sauvegardées localement. Synchronisation lors de la restauration de la connexion.",
    yearsOld: "ans",
    greatProgressSpeech:
      "Excellent progrès avec vos sons de parole ! Continuez à pratiquer ces phonèmes difficiles - vous vous débrouillez très bien !",
    speechSoundMastery: "Maîtrise des Sons de Parole !",
    masterPercentTarget:
      "Vous avez maîtrisé 76% de vos sons cibles. Consultez votre rapport de progrès phonémique...",
    viewSpeechReport: "Voir le Rapport de Parole",
    speechExercisesCompleted: "Exercices de parole terminés",
    phonemesMastered: "Phonèmes maîtrisés",
    therapyTimeToday: "Temps de thérapie aujourd'hui",
    speechMilestones: "Jalons d'Élocution",

    // Profile
    myProfile: "Mon Profil",
    editProfile: "Modifier le Profil",
    settings: "Paramètres",
    language: "Langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    logout: "Déconnexion",
    confirmLogout: "Confirmer la Déconnexion",
    confirmLogoutMessage: "Êtes-vous sûr de vouloir vous déconnecter?",

    // Exercise
    exerciseMode: "Mode Exercice",
    practicePhonemes: "Pratiquer les Phonèmes",
    speechTraining: "Entraînement Vocal",

    // Auth forms
    enterEmailToLogin:
      "Entrez votre email ci-dessous pour vous connecter à votre compte",
    forgotPassword: "Mot de passe oublié ?",
    orContinueWith: "Ou continuer avec",
    newChat: "Nouvelle Conversation",
    replayAudio: "Rejouer l'Audio",

    // Edit Profile
    editProfileTitle: "Modifier le Profil",
    name: "Nom",
    username: "Nom d'utilisateur",
    dateOfBirth: "Date de naissance",
    dateOfBirthNote:
      "Votre date de naissance est utilisée pour calculer votre âge.",
    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmNewPassword: "Confirmer le nouveau mot de passe",
    savePassword: "Enregistrer le mot de passe",
    passwordsDontMatchError: "Les mots de passe ne correspondent pas",

    // Language Settings
    languageSettings: "Paramètres de langue",
    selectLanguage: "Choisissez votre langue",
    languageNote:
      "Cela affecte la reconnaissance vocale, la transcription et l'analyse de prononciation",
    languageChangeNote:
      "Les changements de langue s'appliqueront aux nouveaux enregistrements et exercices. Vos progrès d'apprentissage seront préservés.",
    applyChanges: "Appliquer les modifications",
    saving: "Enregistrement...",

    // Exercise page
    pronunciationExercise: "Exercice de prononciation",
    practicePhrase: "Phrase à pratiquer :",
    practiceInstructions:
      "Appuyez sur le bouton du microphone et prononcez la phrase ci-dessus. Votre prononciation sera analysée automatiquement.",
    practiceSubtitle: "Entraînez-vous à prononcer la phrase ci-dessous",
  },

  es: {
    // Common
    welcome: "Bienvenido",
    loading: "Cargando...",
    error: "Error",
    save: "Guardar",
    cancel: "Cancelar",

    // Navigation
    home: "Inicio",
    exercise: "Ejercicio",
    profile: "Perfil",

    // Login
    loginToAccount: "Inicia sesión en tu cuenta",
    email: "Email",
    password: "Contraseña",
    signIn: "Iniciar sesión",
    signInWithGoogle: "Iniciar sesión con Google",
    dontHaveAccount: "¿No tienes una cuenta?",
    signUp: "Registrarse",
    invalidCredentials: "Email o contraseña inválidos",

    // Signup
    createAccount: "Crear una cuenta",
    confirmPassword: "Confirmar contraseña",
    passwordsDontMatch: "Las contraseñas no coinciden",
    failedToCreateAccount: "Error al crear la cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    signUpWithGoogle: "Registrarse con Google",
    enterInfoToCreateAccount: "Ingresa tu información para crear tu cuenta",
    creatingAccount: "Creando cuenta...",
    passwordMinLength: "La contraseña debe tener al menos 8 caracteres",
    pleaseConfirmPassword: "Por favor confirma tu contraseña",

    // Home/Main page
    clickPenguinToStart: "¡Haz clic en el pingüino para comenzar!",
    speakAfterBeep: "Habla después del pitido",
    listening: "Escuchando...",
    processing: "Procesando...",
    clickOnPipToStart: "¡Haz clic en Pip para comenzar!",
    yourTurnToSpeak: "¡Tu turno para hablar!",
    pipIsResponding: "Pip está respondiendo...",
    initializing: "Inicializando...",

    // Profile page
    loadingYourProfile: "Cargando tu perfil...",
    showingLocallyDataSync:
      "📱 Mostrando datos guardados localmente. Se sincronizará cuando se restaure la conexión.",
    yearsOld: "años",
    greatProgressSpeech:
      "¡Excelente progreso con tus sonidos del habla! Sigue practicando esos fonemas difíciles - ¡lo estás haciendo increíble!",
    speechSoundMastery: "¡Dominio de Sonidos del Habla!",
    masterPercentTarget:
      "Has dominado el 76% de tus sonidos objetivo. Consulta tu informe de progreso fonémico...",
    viewSpeechReport: "Ver Informe del Habla",
    speechExercisesCompleted: "Ejercicios de habla completados",
    phonemesMastered: "Fonemas dominados",
    therapyTimeToday: "Tiempo de terapia hoy",
    speechMilestones: "Hitos del Habla",

    // Profile
    myProfile: "Mi Perfil",
    editProfile: "Editar Perfil",
    settings: "Configuración",
    language: "Idioma",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    logout: "Cerrar Sesión",
    confirmLogout: "Confirmar Cierre de Sesión",
    confirmLogoutMessage: "¿Estás seguro de que quieres cerrar sesión?",

    // Exercise
    exerciseMode: "Modo Ejercicio",
    practicePhonemes: "Practicar Fonemas",
    speechTraining: "Entrenamiento del Habla",

    // Auth forms
    enterEmailToLogin:
      "Ingresa tu email abajo para iniciar sesión en tu cuenta",
    forgotPassword: "¿Olvidaste tu contraseña?",
    orContinueWith: "O continúa con",
    newChat: "Nueva Conversación",
    replayAudio: "Reproducir Audio",

    // Edit Profile
    editProfileTitle: "Editar Perfil",
    name: "Nombre",
    username: "Nombre de usuario",
    dateOfBirth: "Fecha de nacimiento",
    dateOfBirthNote: "Tu fecha de nacimiento se usa para calcular tu edad.",
    changePassword: "Cambiar contraseña",
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
    confirmNewPassword: "Confirmar nueva contraseña",
    savePassword: "Guardar contraseña",
    passwordsDontMatchError: "Las contraseñas no coinciden",

    // Language Settings
    languageSettings: "Configuración de idioma",
    selectLanguage: "Elige tu idioma",
    languageNote:
      "Esto afecta el reconocimiento de voz, transcripción y análisis de pronunciación",
    languageChangeNote:
      "Los cambios de idioma se aplicarán a nuevas grabaciones y ejercicios. Tu progreso de aprendizaje se conservará.",
    applyChanges: "Aplicar cambios",
    saving: "Guardando...",

    // Exercise page
    pronunciationExercise: "Ejercicio de pronunciación",
    practicePhrase: "Frase a practicar:",
    practiceInstructions:
      "Presiona el botón del micrófono y di la frase de arriba. Tu pronunciación será analizada automáticamente.",
    practiceSubtitle: "Practica pronunciando la frase de abajo",
  },
};

export function useTranslations(language: SupportedLanguage): TranslationSet {
  return translations[language] || translations.en;
}

export default translations;
