// [English title, French title, category id]
export const PROFESSIONS: [string, string, string][] = [
  // plumbing
  ['Plumber', 'Plombier', 'plumbing'],
  ['Pipefitter', 'Tuyauteur', 'plumbing'],
  ['Borehole technician', 'Technicien forage', 'plumbing'],
  // electrical
  ['Electrician', 'Électricien', 'electrical'],
  ['Solar installer', 'Installateur solaire', 'electrical'],
  ['Generator technician', 'Technicien groupe électrogène', 'electrical'],
  // carpentry
  ['Carpenter', 'Menuisier', 'carpentry'],
  ['Furniture maker', 'Ébéniste', 'carpentry'],
  ['Roofer', 'Charpentier', 'carpentry'],
  // painting
  ['Painter', 'Peintre en bâtiment', 'painting'],
  ['Decorator', 'Décorateur', 'painting'],
  // masonry
  ['Mason', 'Maçon', 'masonry'],
  ['Plasterer', 'Plâtrier', 'masonry'],
  ['Building contractor', 'Entrepreneur BTP', 'masonry'],
  // welding
  ['Welder', 'Soudeur', 'welding'],
  ['Metalworker', 'Métallier', 'welding'],
  ['Blacksmith', 'Forgeron', 'welding'],
  // mechanics
  ['Auto mechanic', 'Mécanicien auto', 'mechanics'],
  ['Motorbike mechanic', 'Mécanicien moto', 'mechanics'],
  ['Auto electrician', 'Électricien auto', 'mechanics'],
  ['Panel beater', 'Tôlier', 'mechanics'],
  // it_repair
  ['Computer technician', 'Technicien informatique', 'it_repair'],
  ['IT support', 'Support informatique', 'it_repair'],
  ['Data recovery specialist', 'Spécialiste récupération de données', 'it_repair'],
  // phone_repair
  ['Phone repair technician', 'Réparateur de téléphones', 'phone_repair'],
  ['Screen replacement technician', 'Technicien changement écran', 'phone_repair'],
  // appliance_repair
  ['Appliance repair technician', 'Réparateur électroménager', 'appliance_repair'],
  ['Washing machine technician', 'Technicien machine à laver', 'appliance_repair'],
  // ac_refrigeration
  ['AC technician', 'Frigoriste', 'ac_refrigeration'],
  ['Refrigeration technician', 'Technicien froid', 'ac_refrigeration'],
  // tailoring
  ['Tailor', 'Couturier', 'tailoring'],
  ['Seamstress', 'Couturière', 'tailoring'],
  ['Fashion designer', 'Styliste', 'tailoring'],
  // hairdressing
  ['Hairdresser', 'Coiffeuse', 'hairdressing'],
  ['Barber', 'Coiffeur homme', 'hairdressing'],
  ['Braider', 'Tresseuse', 'hairdressing'],
  // beauty
  ['Makeup artist', 'Maquilleuse', 'beauty'],
  ['Nail technician', 'Manucure', 'beauty'],
  ['Beautician', 'Esthéticienne', 'beauty'],
  // catering
  ['Event caterer', 'Traiteur', 'catering'],
  ['Home chef', 'Chef à domicile', 'catering'],
  ['Pastry chef', 'Pâtissier', 'catering'],
  // cleaning
  ['House cleaner', 'Agent de ménage', 'cleaning'],
  ['Office cleaner', 'Agent de nettoyage bureau', 'cleaning'],
  ['Laundry service', 'Blanchisseur', 'cleaning'],
  // moving
  ['Mover', 'Déménageur', 'moving'],
  ['Delivery driver', 'Livreur', 'moving'],
  ['Courier', 'Coursier', 'moving'],
  // gardening
  ['Gardener', 'Jardinier', 'gardening'],
  ['Landscaper', 'Paysagiste', 'gardening'],
  // childcare
  ['Nanny', 'Nounou', 'childcare'],
  ['Babysitter', 'Baby-sitter', 'childcare'],
  // photography
  ['Photographer', 'Photographe', 'photography'],
  ['Videographer', 'Vidéaste', 'photography'],
  ['Drone operator', 'Opérateur de drone', 'photography'],
  // tutoring
  ['Home tutor', 'Répétiteur à domicile', 'tutoring'],
  ['Language teacher', 'Professeur de langues', 'tutoring'],
  ['University tutor', 'Tuteur universitaire', 'tutoring'],
  // music_events
  ['DJ', 'DJ', 'music_events'],
  ['MC / host', 'Animateur', 'music_events'],
  ['Musician', 'Musicien', 'music_events'],
  ['Event decorator', 'Décorateur événementiel', 'music_events'],
  // security
  ['Security guard', 'Agent de sécurité', 'security'],
  ['CCTV installer', 'Installateur caméras', 'security'],
  // networking
  ['Network technician', 'Technicien réseau', 'networking'],
  ['Wifi installer', 'Installateur wifi', 'networking'],
  // furniture
  ['Upholsterer', 'Tapissier', 'furniture'],
  ['Curtain maker', 'Rideautier', 'furniture'],
  // pet_care
  ['Dog walker', 'Promeneur de chiens', 'pet_care'],
  ['Pet groomer', 'Toiletteur', 'pet_care'],
  // electronics_repair
  ['TV repair technician', 'Réparateur TV', 'electronics_repair'],
  ['Sound system technician', 'Technicien sono', 'electronics_repair'],
  // tiling
  ['Tiler', 'Carreleur', 'tiling'],
  ['Flooring installer', 'Poseur de sols', 'tiling'],
  // driving
  ['Personal driver', 'Chauffeur privé', 'driving'],
  ['Moto-taxi rider', 'Conducteur de moto-taxi', 'driving'],
  ['Truck driver', 'Chauffeur poids lourd', 'driving'],
  // wellness
  ['Massage therapist', 'Masseur', 'wellness'],
  ['Home nurse', 'Infirmier à domicile', 'wellness'],
  ['Traditional healer', 'Tradipraticien', 'wellness'],
  // shoe_repair
  ['Shoemaker', 'Cordonnier', 'shoe_repair'],
  ['Leather craftsman', 'Maroquinier', 'shoe_repair'],

  // extra depth on the original trades
  ['Drainage specialist', 'Spécialiste drainage', 'plumbing'],
  ['Sanitary installer', 'Installateur sanitaire', 'plumbing'],
  ['Cable technician', 'Câbleur', 'electrical'],
  ['Panel installer', 'Installateur tableaux électriques', 'electrical'],
  ['Cabinet maker', 'Fabricant d’armoires', 'carpentry'],
  ['Door fitter', 'Poseur de portes', 'carpentry'],
  ['Spray painter', 'Peintre au pistolet', 'painting'],
  ['Wallpaper installer', 'Poseur de papier peint', 'painting'],
  ['Concrete finisher', 'Finisseur béton', 'masonry'],
  ['Bricklayer', 'Briqueteur', 'masonry'],
  ['Fabricator', 'Fabricant métallique', 'welding'],
  ['Gate maker', 'Fabricant de portails', 'welding'],
  ['Diesel mechanic', 'Mécanicien diesel', 'mechanics'],
  ['Tyre specialist', 'Spécialiste pneus', 'mechanics'],
  ['Software technician', 'Technicien logiciel', 'it_repair'],
  ['PC builder', 'Assembleur PC', 'it_repair'],
  ['Unlocking specialist', 'Spécialiste déblocage', 'phone_repair'],
  ['Charging port technician', 'Technicien port de charge', 'phone_repair'],
  ['Oven technician', 'Technicien four', 'appliance_repair'],
  ['Gas cooker technician', 'Technicien cuisinière à gaz', 'appliance_repair'],
  ['Cold chain technician', 'Technicien chaîne du froid', 'ac_refrigeration'],
  ['Freezer technician', 'Technicien congélateur', 'ac_refrigeration'],
  ['Pattern maker', 'Modéliste', 'tailoring'],
  ['Embroiderer', 'Brodeuse', 'tailoring'],
  ['Wig specialist', 'Spécialiste perruques', 'hairdressing'],
  ['Relaxer specialist', 'Spécialiste défrisage', 'hairdressing'],
  ['Lash technician', 'Technicienne cils', 'beauty'],
  ['Waxing specialist', 'Spécialiste épilation', 'beauty'],
  ['Caterer assistant', 'Aide traiteur', 'catering'],
  ['Buffet caterer', 'Traiteur buffet', 'catering'],
  ['Carpet cleaner', 'Nettoyeur de tapis', 'cleaning'],
  ['Window cleaner', 'Laveur de vitres', 'cleaning'],
  ['Loader', 'Chargeur', 'moving'],
  ['Packer', 'Emballeur', 'moving'],
  ['Tree surgeon', 'Élagueur', 'gardening'],
  ['Lawn mower operator', 'Tondeur de pelouse', 'gardening'],
  ['Au pair', 'Fille au pair', 'childcare'],
  ['Special needs caregiver', 'Aide pour enfants à besoins spécifiques', 'childcare'],
  ['Studio photographer', 'Photographe studio', 'photography'],
  ['Passport photo specialist', 'Photographe d’identité', 'photography'],
  ['Exam coach', 'Coach examens', 'tutoring'],
  ['Music teacher', 'Professeur de musique', 'tutoring'],
  ['Sound engineer', 'Ingénieur du son', 'music_events'],
  ['Wedding singer', 'Chanteur de mariage', 'music_events'],
  ['Bodyguard', 'Garde du corps', 'security'],
  ['Alarm technician', 'Technicien alarme', 'security'],
  ['Fiber technician', 'Technicien fibre', 'networking'],
  ['Server technician', 'Technicien serveur', 'networking'],
  ['Furniture assembler', 'Monteur de meubles', 'furniture'],
  ['Wood polisher', 'Polisseur de bois', 'furniture'],
  ['Pet sitter', 'Pension pour animaux', 'pet_care'],
  ['Poultry keeper', 'Éleveur de volaille', 'pet_care'],
  ['Speaker repair technician', 'Réparateur enceintes', 'electronics_repair'],
  ['Game console repair', 'Réparateur consoles de jeux', 'electronics_repair'],
  ['Marble installer', 'Poseur de marbre', 'tiling'],
  ['Terrazzo specialist', 'Spécialiste terrazzo', 'tiling'],
  ['Delivery rider', 'Livreur moto', 'driving'],
  ['School run driver', 'Chauffeur scolaire', 'driving'],
  ['Physiotherapist assistant', 'Assistant kiné', 'wellness'],
  ['Herbalist', 'Herboriste', 'wellness'],
  ['Bag repair specialist', 'Réparateur de sacs', 'shoe_repair'],
  ['Bag maker', 'Sacoche', 'shoe_repair'],

  // roofing
  ['Roofer', 'Couvreur', 'roofing'],
  ['Waterproofing specialist', 'Spécialiste étanchéité', 'roofing'],
  ['Gutter installer', 'Poseur de gouttières', 'roofing'],
  ['Insulation installer', 'Poseur d’isolation', 'roofing'],
  // solar_energy
  ['Solar installer', 'Installateur solaire', 'solar_energy'],
  ['Solar technician', 'Technicien solaire', 'solar_energy'],
  ['Battery specialist', 'Spécialiste batteries', 'solar_energy'],
  ['Solar sales consultant', 'Conseiller vente solaire', 'solar_energy'],
  // generator_repair
  ['Generator technician', 'Technicien groupe électrogène', 'generator_repair'],
  ['Generator installer', 'Installateur groupe électrogène', 'generator_repair'],
  ['Electrical technician', 'Technicien électrique', 'generator_repair'],
  // glazing
  ['Glazier', 'Vitrier', 'glazing'],
  ['Mirror installer', 'Poseur de miroirs', 'glazing'],
  ['Aluminium fabricator', 'Fabricant aluminium', 'glazing'],
  // event_planning
  ['Event planner', 'Organisateur d’événements', 'event_planning'],
  ['Wedding planner', 'Wedding planner', 'event_planning'],
  ['Decorator', 'Décorateur', 'event_planning'],
  ['MC for hire', 'Animateur événementiel', 'event_planning'],
  // printing
  ['Printer operator', 'Imprimeur', 'printing'],
  ['Signage maker', 'Fabricant d’enseignes', 'printing'],
  ['Graphic designer', 'Graphiste', 'printing'],
  ['Embroidery specialist', 'Brodeur', 'printing'],
  // bakery
  ['Baker', 'Boulanger', 'bakery'],
  ['Pastry chef', 'Pâtissier', 'bakery'],
  ['Cake designer', 'Décorateur de gâteaux', 'bakery'],
  ['Confectioner', 'Confiseur', 'bakery'],
  // interior_design
  ['Interior designer', 'Décorateur d’intérieur', 'interior_design'],
  ['Space planner', 'Aménageur d’espace', 'interior_design'],
  ['Curtain & blinds installer', 'Poseur rideaux et stores', 'interior_design'],
  // pool_maintenance
  ['Pool technician', 'Technicien piscine', 'pool_maintenance'],
  ['Pool cleaner', 'Nettoyeur de piscine', 'pool_maintenance'],
  ['Pool builder', 'Constructeur de piscine', 'pool_maintenance'],
  // pest_control
  ['Pest control technician', 'Technicien antiparasitaire', 'pest_control'],
  ['Fumigation specialist', 'Spécialiste fumigation', 'pest_control'],
  ['Rodent control specialist', 'Spécialiste dératisation', 'pest_control'],
  // locksmith
  ['Locksmith', 'Serrurier', 'locksmith'],
  ['Key cutter', 'Reproducteur de clés', 'locksmith'],
  ['Safe technician', 'Technicien coffre-fort', 'locksmith'],
  // recycling
  ['Waste collector', 'Collecteur de déchets', 'recycling'],
  ['Scrap dealer', 'Ferrailleur', 'recycling'],
  ['E-waste recycler', 'Recycleur électronique', 'recycling'],
  // translation
  ['Translator', 'Traducteur', 'translation'],
  ['Interpreter', 'Interprète', 'translation'],
  ['Subtitler', 'Sous-titreur', 'translation'],
  // legal_admin
  ['Paralegal assistant', 'Assistant juridique', 'legal_admin'],
  ['Notary clerk', 'Clerc de notaire', 'legal_admin'],
  ['Administrative assistant', 'Assistant administratif', 'legal_admin'],
  ['Document processor', 'Agent de dossiers', 'legal_admin'],
  // accounting
  ['Accountant', 'Comptable', 'accounting'],
  ['Bookkeeper', 'Teneur de livres', 'accounting'],
  ['Tax advisor', 'Conseiller fiscal', 'accounting'],
  ['Payroll officer', 'Agent de paie', 'accounting'],
  // real_estate
  ['Real estate agent', 'Agent immobilier', 'real_estate'],
  ['Property manager', 'Gestionnaire immobilier', 'real_estate'],
  ['Land broker', 'Courtier foncier', 'real_estate'],
  ['Rental agent', 'Agent de location', 'real_estate'],
  // fitness
  ['Personal trainer', 'Coach sportif', 'fitness'],
  ['Yoga instructor', 'Professeur de yoga', 'fitness'],
  ['Nutrition coach', 'Coach nutrition', 'fitness'],
  ['Boxing coach', 'Coach boxe', 'fitness'],
  // car_wash
  ['Car washer', 'Laveur auto', 'car_wash'],
  ['Detailer', 'Esthéticien auto', 'car_wash'],
  ['Mobile car wash operator', 'Laveur auto mobile', 'car_wash'],
  // computer_training
  ['Computer trainer', 'Formateur informatique', 'computer_training'],
  ['IT coach', 'Coach informatique', 'computer_training'],
  ['Digital literacy trainer', 'Formateur numérique', 'computer_training'],
  // ironing
  ['Presser', 'Repasseur', 'ironing'],
  ['Laundry assistant', 'Aide blanchisserie', 'ironing'],
  ['Dry cleaner', 'Pressing', 'ironing'],
  // water_delivery
  ['Water delivery agent', 'Livreur d’eau', 'water_delivery'],
  ['Dispenser technician', 'Technicien fontaine', 'water_delivery'],
  ['Borehole water vendor', 'Vendeur d’eau de forage', 'water_delivery'],

  // healthcare
  ['General practitioner', 'Médecin généraliste', 'healthcare'],
  ['Dentist', 'Dentiste', 'healthcare'],
  ['Pediatrician', 'Pédiatre', 'healthcare'],
  ['Gynecologist', 'Gynécologue', 'healthcare'],
  ['Physiotherapist', 'Kinésithérapeute', 'healthcare'],
  ['Laboratory technician', 'Technicien de laboratoire', 'healthcare'],
  ['Optometrist', 'Optométriste', 'healthcare'],
  ['Psychiatrist / counselor', 'Psychiatre / conseiller', 'healthcare'],
  ['Home nurse', 'Infirmier à domicile', 'healthcare'],
  ['Pharmacist', 'Pharmacien', 'healthcare'],
  // it_software
  ['Software developer', 'Développeur logiciel', 'it_software'],
  ['Web developer', 'Développeur web', 'it_software'],
  ['UI/UX designer', 'Designer UI/UX', 'it_software'],
  ['Software tester', 'Testeur logiciel', 'it_software'],
  ['IT project manager', 'Chef de projet informatique', 'it_software'],
  ['Data entry clerk', 'Agent de saisie', 'it_software'],
  ['Database administrator', 'Administrateur de base de données', 'it_software'],
  // legal_services
  ['Lawyer', 'Avocat', 'legal_services'],
  ['Bailiff / judicial officer', 'Huissier de justice', 'legal_services'],
  ['Notary clerk', 'Clerc de notaire', 'legal_services'],
  ['Legal adviser', 'Conseiller juridique', 'legal_services'],
  // creative_media
  ['Content creator', 'Créateur de contenu', 'creative_media'],
  ['Copywriter', 'Rédacteur publicitaire', 'creative_media'],
  ['Video editor', 'Monteur vidéo', 'creative_media'],
  ['Voice over artist', 'Voix off', 'creative_media'],
  ['Social media manager', 'Gestionnaire réseaux sociaux', 'creative_media'],
  ['Scriptwriter', 'Scénariste', 'creative_media'],
  ['Community manager', 'Community manager', 'creative_media'],
  ['Writer', 'Écrivain', 'creative_media'],
  // agriculture
  ['Agronomist', 'Agronome', 'agriculture'],
  ['Fish farmer', 'Pisciculteur', 'agriculture'],
  ['Poultry farmer', 'Aviculteur', 'agriculture'],
  ['Farmer', 'Agriculteur', 'agriculture'],
  ['Livestock breeder', 'Éleveur', 'agriculture'],
  // business_consulting
  ['Business advisor', 'Conseiller d’affaires', 'business_consulting'],
  ['Financial advisor', 'Conseiller financier', 'business_consulting'],
  ['Marketing consultant', 'Consultant marketing', 'business_consulting'],
  ['SEO specialist', 'Spécialiste SEO', 'business_consulting'],
  ['E-commerce setup expert', 'Expert mise en place e-commerce', 'business_consulting'],
  ['Import/export agent', 'Agent import-export', 'business_consulting'],
  ['Customs clearing agent', 'Agent de dédouanement', 'business_consulting'],
  // vehicle_rental
  ['Car rental agent', 'Agent de location de voiture', 'vehicle_rental'],
  ['Truck rental agent', 'Agent de location de camion', 'vehicle_rental'],
  ['Tricycle rental agent', 'Agent de location de tricycle', 'vehicle_rental'],
  ['Event chauffeur', 'Chauffeur événementiel', 'vehicle_rental'],
  // sports_coaching
  ['Swimming coach', 'Coach de natation', 'sports_coaching'],
  ['Tennis coach', 'Coach de tennis', 'sports_coaching'],
  ['Golf coach', 'Coach de golf', 'sports_coaching'],
  ['Horse riding coach', 'Coach d’équitation', 'sports_coaching'],
  ['Basketball coach', 'Coach de basketball', 'sports_coaching'],
  ['Dance instructor', 'Professeur de danse', 'sports_coaching'],
  // event_staffing
  ['Event hostess', 'Hôtesse d’événement', 'event_staffing'],
  ['Event security personnel', 'Agent de sécurité événementiel', 'event_staffing'],
  ['Event usher', 'Placeur d’événement', 'event_staffing'],
  // admin_immigration
  ['Visa application assistant', 'Assistant demande de visa', 'admin_immigration'],
  ['Passport appointment assistant', 'Assistant rendez-vous passeport', 'admin_immigration'],
  ['Company registration assistant', 'Assistant création d’entreprise', 'admin_immigration'],
  ['CNPS registration assistant', 'Assistant immatriculation CNPS', 'admin_immigration'],
  ['Immigration consultant', 'Consultant en immigration', 'admin_immigration'],

  // engineering_architecture
  ['Architect', 'Architecte', 'engineering_architecture'],
  ['Building engineer', 'Ingénieur du bâtiment', 'engineering_architecture'],
  ['Land surveyor', 'Géomètre', 'engineering_architecture'],
  ['Biomedical equipment technician', 'Technicien équipement biomédical', 'engineering_architecture'],
  // healthcare (additions)
  ['Anesthesiologist', 'Anesthésiste', 'healthcare'],
  ['Cardiologist', 'Cardiologue', 'healthcare'],
  ['Caregiver (elderly/sick)', 'Aide-soignant', 'healthcare'],
  ['Community health worker', 'Agent de santé communautaire', 'healthcare'],
  ['Dermatologist', 'Dermatologue', 'healthcare'],
  ['Endocrinologist', 'Endocrinologue', 'healthcare'],
  ['ENT specialist', 'ORL', 'healthcare'],
  ['First aid trainer', 'Formateur premiers secours', 'healthcare'],
  ['Internal medicine specialist', 'Interniste', 'healthcare'],
  ['Marriage counselor', 'Conseiller conjugal', 'healthcare'],
  ['Neurologist', 'Neurologue', 'healthcare'],
  ['Nurse anesthetist', 'Infirmier anesthésiste', 'healthcare'],
  ['Nutritionist', 'Nutritionniste', 'healthcare'],
  ['Ophthalmologist', 'Ophtalmologue', 'healthcare'],
  ['Orthopedist', 'Orthopédiste', 'healthcare'],
  ['Radiologist', 'Radiologue', 'healthcare'],
  ['Sonographer', 'Échographiste', 'healthcare'],
  ['Speech therapist', 'Orthophoniste', 'healthcare'],
  // business_consulting (additions)
  ['Ads specialist', 'Spécialiste publicité', 'business_consulting'],
  ['Cashier', 'Caissier', 'business_consulting'],
  ['Community mobilizer', 'Mobilisateur communautaire', 'business_consulting'],
  ['CV & cover letter writer', 'Rédacteur de CV', 'business_consulting'],
  ['Personal shopper', 'Personal shopper', 'business_consulting'],
  ['Projects & grants consultant', 'Consultant projets et subventions', 'business_consulting'],
  ['Public speaking coach', 'Coach en prise de parole', 'business_consulting'],
  ['QHSE consultant', 'Consultant QHSE', 'business_consulting'],
  ['Research writer', 'Rédacteur de recherche', 'business_consulting'],
  ['Secretary', 'Secrétaire', 'business_consulting'],
  ['Shipping agent', 'Agent d’expédition', 'business_consulting'],
  ['Storekeeper', 'Magasinier', 'business_consulting'],
  ['Tax declaration assistant', 'Assistant déclaration fiscale', 'accounting'],
  // creative_media (additions)
  ['Actor / actress', 'Acteur / actrice', 'creative_media'],
  ['Artist / illustrator', 'Artiste / illustrateur', 'creative_media'],
  ['Comedian', 'Humoriste', 'creative_media'],
  ['Sculptor', 'Sculpteur', 'creative_media'],
  ['Resin art decorator', 'Décorateur résine', 'creative_media'],
  // agriculture (additions)
  ['Agro-pastoralist', 'Agro-pasteur', 'agriculture'],
  ['Fish smoker', 'Fumeur de poisson', 'agriculture'],
  ['Food processor', 'Transformateur alimentaire', 'agriculture'],
  ['Forestry worker', 'Ouvrier forestier', 'agriculture'],
  ['Grain milling operator', 'Opérateur de moulin', 'agriculture'],
  // event_staffing (additions)
  ['Event equipment rental agent', 'Loueur de matériel événementiel', 'event_staffing'],
  ['Costume rental agent', 'Loueur de costumes', 'event_staffing'],
  // tutoring (additions)
  ['Chinese language teacher', 'Professeur de chinois', 'tutoring'],
  ['Fulfulde teacher', 'Professeur de fulfuldé', 'tutoring'],
  ['IELTS/TOEFL coach', 'Coach IELTS/TOEFL', 'tutoring'],
  ['Sign language interpreter', 'Interprète en langue des signes', 'tutoring'],
  // security (additions)
  ['Fire extinguisher installer', 'Installateur d’extincteurs', 'security'],
  ['Night watchman', 'Gardien de nuit', 'security'],
  ['Smoke detector installer', 'Installateur détecteurs de fumée', 'security'],
  // mechanics (additions)
  ['Electromechanic', 'Électromécanicien', 'mechanics'],
  ['GPS installer', 'Installateur GPS', 'mechanics'],
  // masonry (additions)
  ['Excavator operator', 'Opérateur d’excavatrice', 'masonry'],
  ['Forklift operator', 'Opérateur de chariot élévateur', 'masonry'],
  ['Scaffolding technician', 'Monteur d’échafaudage', 'masonry'],
  ['Stone cutter', 'Tailleur de pierre', 'masonry'],
  // welding (additions)
  ['Hot works technician', 'Technicien travaux à chaud', 'welding'],
  // electronics_repair (additions)
  ['Satellite TV technician', 'Technicien satellite', 'electronics_repair'],
  ['Projector/screen technician', 'Technicien écrans géants', 'electronics_repair'],
  // networking (additions)
  ['Telecom technician', 'Technicien télécom', 'networking'],
  // plumbing (additions)
  ['Septic tank technician', 'Technicien de fosse septique', 'plumbing'],
  ['Water tank cleaner', 'Nettoyeur de citernes', 'plumbing'],
  // appliance_repair (additions)
  ['Elevator technician', 'Technicien ascenseur', 'appliance_repair'],
  // pet_care (additions)
  ['Veterinary doctor', 'Vétérinaire', 'pet_care'],
  ['Dog trainer', 'Dresseur de chiens', 'pet_care'],
  // shoe_repair (additions)
  ['Leather cleaner', 'Nettoyeur de cuir', 'shoe_repair'],
  // it_software (additions)
  ['Virtual assistant', 'Assistant virtuel', 'it_software'],
  ['WordPress technician', 'Technicien WordPress', 'it_software'],
  // music_events (additions)
  ['Instrumentalist', 'Instrumentiste', 'music_events'],
  ['Music instructor', 'Professeur de musique', 'music_events'],
  // real_estate (additions)
  ['Property valuer', 'Expert immobilier', 'real_estate'],
  ['Real estate assistant', 'Assistant immobilier', 'real_estate'],
  ['Real estate developer', 'Promoteur immobilier', 'real_estate'],
  // admin_immigration (additions)
  ['Administrative documents guide', 'Guide de démarches administratives', 'admin_immigration'],
  ['Land documents follow-up agent', 'Agent de suivi de dossiers fonciers', 'admin_immigration'],
  // catering (additions)
  ['Cocktail mixologist', 'Barman mixologue', 'catering'],
  // vehicle_rental (additions)
  ['Vehicle towing service', 'Service de dépannage remorquage', 'vehicle_rental'],
  // engineering_architecture (surveying)
  ['Surveyor / cartographer', 'Géomètre-topographe', 'engineering_architecture'],
];

export const PROFESSION_COUNT = PROFESSIONS.length;
