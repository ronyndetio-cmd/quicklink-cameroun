import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'fr' | 'en';

const FR = {
  brand: 'QuickLink',
  brandSub: 'Cameroun',
  tagline: 'Le bon technicien, dans votre quartier.',

  // nav
  navHub: 'Accueil',
  navCategories: 'Catégories',
  navTasks: 'Tâches',
  navServices: 'Professionnels',
  navMap: 'Carte',
  navSaved: 'Enregistrés',
  navMyPosts: 'Mes publications',
  navContacts: 'Contacts',
  navProfile: 'Mon profil',
  navGroupBrowse: 'Explorer',
  navGroupYou: 'Vous',

  // header
  searchPlaceholder: 'Plombier, clim, couture…',
  searchCity: 'Ville',
  searchCategory: 'Catégorie',
  allCameroon: 'Tout le Cameroun',
  nearMe: 'Autour de moi',
  nearMeOn: 'Ma localité (40 km)',
  search: 'Rechercher',
  signIn: 'Se connecter',
  switchAccount: 'Changer de compte',
  menu: 'Menu',

  // hero
  heroEyebrow: 'Mise en relation directe',
  heroTitle: 'Trouvez la personne qui sait faire,',
  heroTitleAccent: 'à côté de chez vous.',
  heroLead:
    'Publiez ce dont vous avez besoin, ou proposez votre savoir-faire. Vous ne payez que lorsque vous décidez d’appeler quelqu’un.',
  heroStatCities: 'villes et villages',
  heroStatPros: 'métiers référencés',
  heroStatPrice: 'FCFA pour débloquer un contact',
  popularNow: 'Recherches fréquentes',
  quickMap: 'Voir la carte',
  quickProfessions: 'Annuaire des métiers',
  quickCities: 'Explorer les villes',
  featuredUrgent: 'Demandes urgentes près de vous',
  featuredServices: 'Professionnels actifs dans votre zone',
  seeAll: 'Tout voir',
  more: 'de plus',

  // feed / cards
  postedBy: 'Publié par',
  interested: 'Ça m’intéresse',
  interestedDone: 'Intérêt envoyé',
  interestedCount: 'intéressé(s)',
  viewInterested: 'Voir les intéressés',
  whatsapp: 'WhatsApp',
  call: 'Appeler',
  save: 'Enregistrer',
  saved: 'Enregistré',
  share: 'Partager',
  linkCopied: 'Lien copié',
  viewProfile: 'Voir le profil',
  watchVideo: 'Voir la vidéo de présentation',
  videoLocked: 'Débloquez le contact pour voir la vidéo',
  photos: 'photos',
  budget: 'Budget',
  rate: 'Tarif',
  noResults: 'Rien ne correspond à cette recherche.',
  noResultsHint: 'Essayez un autre mot, une autre ville, ou élargissez à tout le Cameroun.',
  loading: 'Chargement…',
  showMore: 'Voir plus',
  showLess: 'Voir moins',
  translate: 'Traduire',
  showOriginal: 'Voir l’original',
  translating: 'Traduction…',
  translationUnavailable: 'Traduction indisponible pour le moment.',

  // urgency
  urgent: 'Urgent',
  today: 'Aujourd’hui',
  this_week: 'Cette semaine',
  flexible: 'Flexible',

  // gating
  lockedNumber: 'Numéro masqué',
  unlockFor: 'Débloquer pour 250 FCFA',
  unlockedFor: 'Débloqué',
  expiresIn: 'Expire dans',
  unlockTitle: 'Débloquer ce contact',
  unlockLead: 'Débloquez le numéro pour appeler ou écrire directement.',
  unlockWith: 'Paiement Mobile Money',
  mtn: 'MTN Mobile Money',
  om: 'Orange Money',
  poweredByFapshi: 'Paiement sécurisé via Fapshi',
  yourNumber: 'Votre numéro de paiement',
  payNow: 'Payer 250 FCFA',
  pendingTitle: 'Validez sur votre téléphone',
  pendingLead: 'Un message vient d’être envoyé à votre numéro. Entrez votre code secret pour confirmer.',
  reference: 'Référence',
  paymentFailed: 'Le paiement a échoué',
  unlockSuccess: 'Contact débloqué',
  unlockSuccessLead: 'Vous pouvez maintenant appeler ou écrire.',
  done: 'Terminé',
  cancel: 'Annuler',
  close: 'Fermer',
  back: 'Retour',

  // auth
  authTitle: 'Identifiez-vous pour continuer',
  authLead: 'Le contact d’un professionnel est lié à votre compte. Connectez-vous ou créez un compte.',
  authLogin: 'Se connecter',
  authSignupTab: 'Créer un compte',
  noAccountYet: 'Pas encore de compte ?',
  alreadyHaveAccount: 'Vous avez déjà un compte ?',
  forgotPasswordLink: 'Mot de passe oublié ?',
  resetPasswordTitle: 'Réinitialiser le mot de passe',
  sendCode: 'Envoyer le code',
  codeLabel: 'Code reçu',
  newPasswordLabel: 'Nouveau mot de passe',
  confirmNewPasswordLabel: 'Confirmer le nouveau mot de passe',
  resendCode: 'Renvoyer le code',
  savePassword: 'Enregistrer le mot de passe',
  passwordResetSuccess: 'Mot de passe réinitialisé. Connectez-vous.',
  devCodeNotice: 'Mode démo, rien n’est réellement envoyé — votre code :',
  backToLogin: 'Retour à la connexion',
  passwordLabel: 'Mot de passe',
  confirmPasswordLabel: 'Confirmer',
  passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
  passwordMismatch: 'Les mots de passe ne correspondent pas',
  nameLabel: 'Nom complet',
  phoneLabel: 'Téléphone',
  phoneOrEmailLabel: 'Téléphone ou e-mail',
  cityLabel: 'Ville',
  areaLabel: 'Quartier',
  professionLabel: 'Votre métier',
  professionHint: 'Tout le monde a un métier — dites-nous le vôtre, même si vous cherchez juste de l’aide aujourd’hui.',
  professionRequired: 'Le métier est obligatoire',
  photoRequired: 'Photo de profil obligatoire',
  photoHint: 'Une vraie photo de vous inspire confiance aux autres utilisateurs.',
  roleLabel: 'Vous êtes plutôt',
  roleClient: 'Client',
  roleProvider: 'Professionnel',
  roleBoth: 'Les deux',
  createAccount: 'Créer le compte',
  cityMissing: 'Ma ville n’est pas dans la liste',
  customCity: 'Nom de votre ville',
  safetyNotice:
    'QuickLink ne prend jamais d’acompte pour vous. N’envoyez jamais d’argent à un professionnel avant que le travail soit vérifié.',

  // categories screen
  categoriesTitle: 'Tous les métiers',
  categoriesLead: 'Choisissez un domaine pour voir qui travaille près de chez vous.',
  techniciansCount: 'Techniciens',
  tasksCount: 'Tâches',
  addCategory: 'Ajouter une catégorie',
  addCategoryLead: 'Votre métier n’existe pas encore ? Créez-le.',
  categoryNameFr: 'Nom (français)',
  categoryNameEn: 'Nom (anglais)',
  iconLabel: 'Icône',
  subcategoriesFr: 'Sous-catégories (français, séparées par des virgules)',
  subcategoriesEn: 'Sous-catégories (anglais, séparées par des virgules)',
  createCategory: 'Créer la catégorie',
  categoryCreated: 'Catégorie créée',
  allGroups: 'Tout',

  // tasks
  tasksTitle: 'Demandes des clients',
  tasksLead: 'Des travaux à faire, publiés par des habitants près de chez vous.',
  postTask: 'Publier une tâche',
  postTaskTitle: 'De quoi avez-vous besoin ?',
  titleLabel: 'Titre',
  titlePlaceholder: 'Ex. Fuite sous l’évier de la cuisine',
  categoryOptional: 'Catégorie (facultatif)',
  categoryAutoCreateHint: 'Si votre métier n’est pas dans la liste, tapez-le — il sera ajouté automatiquement.',
  whatsappLabel: 'Numéro WhatsApp',
  whatsappHint: 'Laissez vide si identique à votre téléphone',
  subCategoryLabel: 'Sous-catégorie',
  urgencyLabel: 'Urgence',
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Dites ce qui se passe, ce que vous avez déjà essayé, et quand vous êtes disponible.',
  budgetLabel: 'Budget indicatif (FCFA)',
  publish: 'Publier',
  taskPublished: 'Tâche publiée',
  interestedIn: 'Intéressés par cette tâche',
  noInterestYet: 'Personne n’a encore signalé son intérêt.',

  // services
  servicesTitle: 'Professionnels disponibles',
  servicesLead: 'Des artisans et techniciens près de chez vous.',
  postService: 'Proposer un service',
  postServiceTitle: 'Que proposez-vous ?',
  specialtyLabel: 'Spécialité',
  specialtyPlaceholder: 'Ex. Plombier, Frigoriste, Tresseuse…',
  specialtyHint: 'Choisissez dans la liste ou écrivez votre propre intitulé.',
  rateLabel: 'Tarif indicatif',
  ratePlaceholder: 'Ex. 5 000 – 25 000 FCFA',
  workPhotosLabel: 'Photos de vos réalisations',
  pickSamples: 'Choisir des images d’exemple',
  pasteUrl: 'Coller l’adresse d’une image',
  add: 'Ajouter',
  servicePublished: 'Service publié',

  // map
  mapTitle: 'Carte des professionnels',
  mapLead: 'Les techniciens et les tâches autour de vous, en temps réel.',
  layerMapbox: 'Détaillé',
  layerStreets: 'Plan',
  layerLight: 'Clair',
  layerSatellite: 'Satellite',
  recenter: 'Recentrer sur moi',
  locating: 'Localisation…',
  showTechnicians: 'Techniciens',
  showTasks: 'Tâches',

  // saved / my posts / contacts
  savedTitle: 'Vos enregistrements',
  savedLead: 'Ce que vous avez mis de côté pour y revenir.',
  savedEmpty: 'Rien d’enregistré pour l’instant. Touchez le signet sur une carte pour la garder ici.',
  myPostsTitle: 'Mes publications',
  myPostsLead: 'Vos tâches et vos offres de service.',
  myPostsEmpty: 'Vous n’avez encore rien publié.',
  contactsTitle: 'Contacts débloqués',
  contactsLead: 'Les personnes que vous pouvez joindre en ce moment.',
  contactsEmpty: 'Aucun contact actif. Débloquez un prestataire pour le retrouver ici.',
  expired: 'Expiré',
  myTasks: 'Mes tâches',
  myServices: 'Mes services',
  deletePost: 'Supprimer',
  postDeleted: 'Publication supprimée',

  // profile
  profileTitle: 'Mon profil',
  editProfile: 'Modifier le profil',
  emailLabel: 'E-mail',
  emailSignupHint: 'Sert à récupérer votre mot de passe en cas d’oubli.',
  facebookLabel: 'Facebook',
  instagramLabel: 'Instagram',
  settingsLabel: 'Paramètres',
  noWorkPhotosYet: 'Aucune photo pour l’instant.',
  saveProfile: 'Enregistrer',
  profileSaved: 'Profil enregistré',
  rating: 'Note',
  reviewsCount: 'Avis',
  portfolio: 'Réalisations',
  postedTasks: 'Tâches publiées',
  showPostedTasks: 'Voir les tâches publiées',
  offeredServices: 'Services proposés',
  reviews: 'Avis',
  addPhoto: 'Ajouter une photo',
  removePhoto: 'Retirer',
  leaveReview: 'Laisser un avis',
  reviewFor: 'Avis pour',
  yourRating: 'Votre note',
  yourComment: 'Votre commentaire',
  sendReview: 'Envoyer l’avis',
  reviewSent: 'Avis publié',
  noReviews: 'Pas encore d’avis.',
  memberSince: 'Membre depuis',
  videoBio: 'Vidéo de présentation',
  videoUrlLabel: 'Adresse de la vidéo',

  // cities / professions modals
  citiesTitle: 'Villes et villages du Cameroun',
  citiesLead: 'Choisissez une localité pour voir qui y travaille.',
  regionsLabel: 'régions',
  citiesLabel: 'localités',
  pickCategory: 'Choisir un métier',
  applyFilter: 'Filtrer avec ce choix',
  localTechnicians: 'Techniciens sur place',
  professionsTitle: 'Annuaire des métiers',
  professionsLead: 'Touchez un métier pour lancer la recherche.',

  // support
  supportTitle: 'Aide QuickLink',
  supportWelcome:
    'Bonjour ! Je suis l’assistant QuickLink. Je peux vous expliquer les tarifs, vous aider à publier une tâche ou à trouver un prestataire.',
  supportAsk: 'Posez votre question…',
  supportSend: 'Envoyer',
  supportQ1: 'Combien coûte un contact ?',
  supportQ2: 'Comment publier une tâche ?',
  supportQ3: 'Comment fonctionne le paiement ?',
  supportQ4: 'Comment éviter les arnaques ?',
  supportThinking: 'L’assistant écrit…',

  // toasts / errors
  errGeneric: 'Une action n’a pas abouti. Réessayez.',
  errNetwork: 'Le serveur ne répond pas. Vérifiez votre connexion.',
  errPhoneTaken: 'Ce numéro est déjà utilisé.',
  errSelfReview: 'Vous ne pouvez pas vous évaluer vous-même.',
  loggedInAs: 'Connecté en tant que',
  loggedOut: 'Déconnecté',
  logout: 'Se déconnecter',
  deleteAccount: 'Supprimer mon compte',
  deleteAccountConfirm: 'Supprimer définitivement votre compte QuickLink ? Cette action est irréversible.',
  accountDeleted: 'Compte supprimé',

  // footer
  footerAbout: 'À propos',
  footerBlurb:
    'QuickLink met en relation les habitants et les artisans du Cameroun. Le contact reste masqué jusqu’à ce que vous décidiez de l’ouvrir.',
  footerExplore: 'Explorer',
  footerHelp: 'Aide',
  footerSafety: 'Sécurité',
  footerRights: 'Tous droits réservés.',
  language: 'Langue',
} as const;

type Dict = Record<keyof typeof FR, string>;

const EN: Dict = {
  brand: 'QuickLink',
  brandSub: 'Cameroon',
  tagline: 'The right technician, on your street.',

  navHub: 'Home',
  navCategories: 'Categories',
  navTasks: 'Tasks',
  navServices: 'Professionals',
  navMap: 'Map',
  navSaved: 'Saved',
  navMyPosts: 'My posts',
  navContacts: 'Contacts',
  navProfile: 'My profile',
  navGroupBrowse: 'Browse',
  navGroupYou: 'You',

  searchPlaceholder: 'Plumber, AC, tailoring…',
  searchCity: 'City',
  searchCategory: 'Category',
  allCameroon: 'All of Cameroon',
  nearMe: 'Near me',
  nearMeOn: 'My area (40 km)',
  search: 'Search',
  signIn: 'Sign in',
  switchAccount: 'Switch account',
  menu: 'Menu',

  heroEyebrow: 'Direct connections',
  heroTitle: 'Find the person who knows how,',
  heroTitleAccent: 'right where you live.',
  heroLead: 'Post what you need, or offer what you do. You only pay when you decide to call someone.',
  heroStatCities: 'towns and villages',
  heroStatPros: 'listed professions',
  heroStatPrice: 'FCFA to unlock a contact',
  popularNow: 'People are searching for',
  quickMap: 'Open the map',
  quickProfessions: 'Profession directory',
  quickCities: 'Explore cities',
  featuredUrgent: 'Urgent requests near you',
  featuredServices: 'Professionals active in your area',
  seeAll: 'See all',
  more: 'more',

  postedBy: 'Posted by',
  interested: 'I’m interested',
  interestedDone: 'Interest sent',
  interestedCount: 'interested',
  viewInterested: 'View who’s interested',
  whatsapp: 'WhatsApp',
  call: 'Call',
  save: 'Save',
  saved: 'Saved',
  share: 'Share',
  linkCopied: 'Link copied',
  viewProfile: 'View profile',
  watchVideo: 'Watch video bio',
  videoLocked: 'Unlock the contact to watch the video',
  photos: 'photos',
  budget: 'Budget',
  rate: 'Rate',
  noResults: 'Nothing matches that search.',
  noResultsHint: 'Try another word, another city, or widen to all of Cameroon.',
  loading: 'Loading…',
  showMore: 'Show more',
  showLess: 'Show less',
  translate: 'Translate',
  showOriginal: 'Show original',
  translating: 'Translating…',
  translationUnavailable: 'Translation is currently unavailable.',

  urgent: 'Urgent',
  today: 'Today',
  this_week: 'This week',
  flexible: 'Flexible',

  lockedNumber: 'Number hidden',
  unlockFor: 'Unlock for 250 FCFA',
  unlockedFor: 'Unlocked',
  expiresIn: 'Expires in',
  unlockTitle: 'Unlock this contact',
  unlockLead: 'Unlock the number to call or message directly.',
  unlockWith: 'Mobile Money payment',
  mtn: 'MTN Mobile Money',
  om: 'Orange Money',
  poweredByFapshi: 'Secure payment via Fapshi',
  yourNumber: 'Your payment number',
  payNow: 'Pay 250 FCFA',
  pendingTitle: 'Approve on your phone',
  pendingLead: 'A prompt was just sent to your number. Enter your secret code to confirm.',
  reference: 'Reference',
  paymentFailed: 'The payment failed',
  unlockSuccess: 'Contact unlocked',
  unlockSuccessLead: 'You can now call or message.',
  done: 'Done',
  cancel: 'Cancel',
  close: 'Close',
  back: 'Back',

  authTitle: 'Sign in to continue',
  authLead: 'A professional’s contact is tied to your account. Log in or create one.',
  authLogin: 'Log in',
  authSignupTab: 'Create account',
  noAccountYet: 'No account yet?',
  alreadyHaveAccount: 'Already have an account?',
  forgotPasswordLink: 'Forgot password?',
  resetPasswordTitle: 'Reset password',
  sendCode: 'Send code',
  codeLabel: 'Code received',
  newPasswordLabel: 'New password',
  confirmNewPasswordLabel: 'Confirm new password',
  resendCode: 'Resend code',
  savePassword: 'Save password',
  passwordResetSuccess: 'Password reset. Please log in.',
  devCodeNotice: 'Demo mode, nothing is really sent — your code:',
  backToLogin: 'Back to login',
  passwordLabel: 'Password',
  confirmPasswordLabel: 'Confirm',
  passwordTooShort: 'Password must be at least 6 characters',
  passwordMismatch: 'Passwords don’t match',
  nameLabel: 'Full name',
  phoneLabel: 'Phone',
  phoneOrEmailLabel: 'Phone or email',
  cityLabel: 'City',
  areaLabel: 'Quarter',
  professionLabel: 'Your profession',
  professionHint: 'Everyone has a trade — tell us yours, even if you’re just looking for help today.',
  professionRequired: 'Profession is required',
  photoRequired: 'Profile photo required',
  photoHint: 'A real photo of you builds trust with other users.',
  roleLabel: 'You lean towards',
  roleClient: 'A client',
  roleProvider: 'A professional',
  roleBoth: 'Both',
  createAccount: 'Create account',
  cityMissing: 'My city isn’t listed',
  customCity: 'Your city name',
  safetyNotice:
    'QuickLink never collects a deposit on your behalf. Never send money to a professional before the work has been verified.',

  categoriesTitle: 'Every trade',
  categoriesLead: 'Pick a field to see who works near you.',
  techniciansCount: 'Technicians',
  tasksCount: 'Tasks',
  addCategory: 'Add a category',
  addCategoryLead: 'Your trade isn’t here yet? Create it.',
  categoryNameFr: 'Name (French)',
  categoryNameEn: 'Name (English)',
  iconLabel: 'Icon',
  subcategoriesFr: 'Subcategories (French, comma separated)',
  subcategoriesEn: 'Subcategories (English, comma separated)',
  createCategory: 'Create category',
  categoryCreated: 'Category created',
  allGroups: 'All',

  tasksTitle: 'What clients need',
  tasksLead: 'Jobs posted by people living around you.',
  postTask: 'Post a task',
  postTaskTitle: 'What do you need done?',
  titleLabel: 'Title',
  titlePlaceholder: 'e.g. Leak under the kitchen sink',
  categoryOptional: 'Category (optional)',
  categoryAutoCreateHint: 'If your trade isn’t listed, type it — it’ll be added automatically.',
  whatsappLabel: 'WhatsApp number',
  whatsappHint: 'Leave blank if same as your phone',
  subCategoryLabel: 'Subcategory',
  urgencyLabel: 'Urgency',
  descriptionLabel: 'Description',
  descriptionPlaceholder: 'Say what’s happening, what you already tried, and when you’re available.',
  budgetLabel: 'Rough budget (FCFA)',
  publish: 'Publish',
  taskPublished: 'Task published',
  interestedIn: 'Interested in this task',
  noInterestYet: 'Nobody has signalled interest yet.',

  servicesTitle: 'Available professionals',
  servicesLead: 'Artisans and technicians near you.',
  postService: 'Offer a service',
  postServiceTitle: 'What do you offer?',
  specialtyLabel: 'Specialty',
  specialtyPlaceholder: 'e.g. Plumber, AC technician, Braider…',
  specialtyHint: 'Pick from the list or write your own title.',
  rateLabel: 'Typical rate',
  ratePlaceholder: 'e.g. 5,000 – 25,000 FCFA',
  workPhotosLabel: 'Photos of your work',
  pickSamples: 'Choose sample images',
  pasteUrl: 'Paste an image address',
  add: 'Add',
  servicePublished: 'Service published',

  mapTitle: 'Professionals map',
  mapLead: 'Technicians and tasks around you, live.',
  layerMapbox: 'Detailed',
  layerStreets: 'Streets',
  layerLight: 'Light',
  layerSatellite: 'Satellite',
  recenter: 'Recentre on me',
  locating: 'Locating…',
  showTechnicians: 'Technicians',
  showTasks: 'Tasks',

  savedTitle: 'Your saved items',
  savedLead: 'What you put aside to come back to.',
  savedEmpty: 'Nothing saved yet. Tap the bookmark on any card to keep it here.',
  myPostsTitle: 'My posts',
  myPostsLead: 'Your tasks and your service offers.',
  myPostsEmpty: 'You haven’t posted anything yet.',
  contactsTitle: 'Unlocked contacts',
  contactsLead: 'People you can reach right now.',
  contactsEmpty: 'No active contact. Unlock a provider to find them here.',
  expired: 'Expired',
  myTasks: 'My tasks',
  myServices: 'My services',
  deletePost: 'Delete',
  postDeleted: 'Post deleted',

  profileTitle: 'My profile',
  editProfile: 'Edit profile',
  emailLabel: 'Email',
  emailSignupHint: 'Used to recover your password if you ever forget it.',
  facebookLabel: 'Facebook',
  instagramLabel: 'Instagram',
  settingsLabel: 'Settings',
  noWorkPhotosYet: 'No photos yet.',
  saveProfile: 'Save',
  profileSaved: 'Profile saved',
  rating: 'Rating',
  reviewsCount: 'Reviews',
  portfolio: 'Work portfolio',
  postedTasks: 'Posted tasks',
  showPostedTasks: 'Show posted tasks',
  offeredServices: 'Offered services',
  reviews: 'Reviews',
  addPhoto: 'Add a photo',
  removePhoto: 'Remove',
  leaveReview: 'Leave a review',
  reviewFor: 'Review for',
  yourRating: 'Your rating',
  yourComment: 'Your comment',
  sendReview: 'Post review',
  reviewSent: 'Review posted',
  noReviews: 'No reviews yet.',
  memberSince: 'Member since',
  videoBio: 'Video bio',
  videoUrlLabel: 'Video address',

  citiesTitle: 'Cameroon towns and villages',
  citiesLead: 'Pick a locality to see who works there.',
  regionsLabel: 'regions',
  citiesLabel: 'localities',
  pickCategory: 'Pick a trade',
  applyFilter: 'Filter with this choice',
  localTechnicians: 'Technicians on the ground',
  professionsTitle: 'Profession directory',
  professionsLead: 'Tap a profession to run the search.',

  supportTitle: 'QuickLink help',
  supportWelcome:
    'Hello! I’m the QuickLink assistant. I can explain pricing, help you post a task, or help you find a professional.',
  supportAsk: 'Ask your question…',
  supportSend: 'Send',
  supportQ1: 'How much does a contact cost?',
  supportQ2: 'How do I post a task?',
  supportQ3: 'How does payment work?',
  supportQ4: 'How do I avoid scams?',
  supportThinking: 'The assistant is typing…',

  errGeneric: 'That didn’t go through. Try again.',
  errNetwork: 'The server isn’t responding. Check your connection.',
  errPhoneTaken: 'That number is already in use.',
  errSelfReview: 'You cannot review yourself.',
  loggedInAs: 'Signed in as',
  loggedOut: 'Signed out',
  logout: 'Sign out',
  deleteAccount: 'Delete my account',
  deleteAccountConfirm: 'Permanently delete your QuickLink account? This can’t be undone.',
  accountDeleted: 'Account deleted',

  footerAbout: 'About',
  footerBlurb:
    'QuickLink connects households and artisans across Cameroon. Contact stays hidden until you decide to open it.',
  footerExplore: 'Explore',
  footerHelp: 'Help',
  footerSafety: 'Safety',
  footerRights: 'All rights reserved.',
  language: 'Language',
};

export const DICTS: Record<Lang, Dict> = { fr: FR as unknown as Dict, en: EN };

export type TKey = keyof typeof FR;

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: TKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = 'ql.lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof localStorage === 'undefined') return 'fr';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'fr') return stored;
    // First visit, no saved preference yet — open in whichever language the
    // phone/browser itself is set to, instead of always defaulting to
    // French. Falls back to French for French-language devices or anything
    // else the app doesn't support in kind.
    const device = typeof navigator !== 'undefined' ? navigator.language || navigator.languages?.[0] || '' : '';
    return device.toLowerCase().startsWith('en') ? 'en' : 'fr';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((l) => (l === 'fr' ? 'en' : 'fr')), []);
  const t = useCallback((key: TKey) => DICTS[lang][key] ?? String(key), [lang]);

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

/** Relative time, localised, without pulling in a date library. */
export function timeAgo(iso: string, lang: Lang): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return lang === 'fr' ? 'à l’instant' : 'just now';
  if (mins < 60) return lang === 'fr' ? `il y a ${mins} min` : `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return lang === 'fr' ? `il y a ${hrs} h` : `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return lang === 'fr' ? `il y a ${days} j` : `${days} d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return lang === 'fr' ? `il y a ${weeks} sem.` : `${weeks} w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return lang === 'fr' ? `il y a ${months} mois` : `${months} mo ago`;
  return lang === 'fr' ? `il y a ${Math.round(months / 12)} an(s)` : `${Math.round(months / 12)} y ago`;
}

export function countdown(ms: number, lang: Lang): string {
  if (ms <= 0) return lang === 'fr' ? 'expiré' : 'expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')} min`;
  if (m > 0) return `${m} min ${String(s).padStart(2, '0')} s`;
  return `${s} s`;
}

export function formatFcfa(n: number | undefined | null): string {
  if (n == null) return '';
  return `${n.toLocaleString('fr-FR').replace(/ /g, ' ')} FCFA`;
}
