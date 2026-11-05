export interface NavItemConfig {
  id: string;
  iconName: 'Shield' | 'BookOpen' | 'Clock' | 'History';
  route: string;
  labelEn: string;
  labelHi: string;
  subLabelEn: string;
  subLabelHi: string;
  isPrimary?: boolean;
}

export const siteConfig = {
  name: 'VENEHA',
  currentLiveTest: 'PPDT',
  tagline: {
    en: 'SSB Simulator and AI Assessor',
    hi: 'एसएसबी सिम्युलेटर एवं AI मूल्यांकनकर्ता',
  },
  topBarStatus: {
    en: 'SSB Practice Platform',
    hi: 'एसएसबी अभ्यास मंच',
  },
  heroBadge: {
    en: 'Complete SSB practice',
    hi: 'सम्पूर्ण SSB अभ्यास',
  },
  heroHeadline: {
    enPrefix: 'Practise PPDT and WAT. ',
    enAccent: 'Get AI feedback.',
    hiPrefix: 'PPDT एवं WAT अभ्यास करें। ',
    hiAccent: 'AI फीडबैक प्राप्त करें।',
  },
  heroParagraph: {
    en: 'Learn the 5-day SSB procedure in English or Hindi, practise timed PPDT and word association (WAT) on real paper, and get instant AI feedback on your handwritten responses.',
    hi: 'अंग्रेजी या हिंदी में 5-दिवसीय एसएसबी प्रक्रिया समझें, वास्तविक कागज पर समयबद्ध PPDT और शब्द संयोजन (WAT) अभ्यास करें, और अपनी हस्तलिखित प्रतिक्रियाओं पर त्वरित AI फीडबैक प्राप्त करें।',
  },
  disclaimer: {
    en: 'Feedback is AI-generated practice guidance. It is not an official assessment or a prediction of selection.',
    hi: 'फीडबैक AI-जनित अभ्यास मार्गदर्शन है। यह कोई आधिकारिक मूल्यांकन या चयन की भविष्यवाणी नहीं है।',
  },
  featuresHeading: {
    en: 'Designed for Structured PPDT Practice',
    hi: 'संरचित PPDT अभ्यास के लिए विशेष रूप से निर्मित',
  },
  featuresSubtitle: {
    en: 'Everything you need to practise PPDT the way it is held at the SSB, and to understand Officer Like Qualities (OLQs).',
    hi: 'एसएसबी में आयोजित होने वाले PPDT का सटीक अभ्यास और ऑफिसर लाइक क्वालिटीज (OLQs) की गहरी समझ के लिए सब कुछ।',
  },
  threeSteps: [
    {
      step: 1,
      titleEn: '1. Learn',
      titleHi: '1. सीखें',
      descEn: 'Understand the 5-day SSB procedure in English or Hindi.',
      descHi: 'अंग्रेजी या हिंदी में 5-दिवसीय एसएसबी प्रक्रिया समझें।',
      route: '/guide',
    },
    {
      step: 2,
      titleEn: '2. Practise',
      titleHi: '2. अभ्यास करें',
      descEn: '30 seconds to view the picture, 4 minutes to write.',
      descHi: 'चित्र देखने के लिए 30 सेकंड, लिखने के लिए 4 मिनट।',
      route: '/practice',
    },
    {
      step: 3,
      titleEn: '3. Get feedback',
      titleHi: '3. फीडबैक प्राप्त करें',
      descEn: 'Photograph your story and receive instant AI feedback.',
      descHi: 'अपनी कहानी का फोटो लें और त्वरित AI फीडबैक प्राप्त करें।',
      route: '/practice',
    },
  ],
  pillars: [
    {
      partEn: 'Part 1',
      partHi: 'भाग 1',
      titleEn: 'Bilingual 5-Day SSB Guide',
      titleHi: 'द्विभाषी 5-दिवसीय एसएसबी गाइड',
      descEn: 'Complete walkthrough of all 5 stages from Screening to Conference. Toggle seamlessly between English and Hindi with practical tips and guidance.',
      descHi: 'स्क्रीनिंग से लेकर कॉन्फ्रेंस तक सभी 5 चरणों की विस्तृत जानकारी। व्यावहारिक सुझावों और मार्गदर्शन के साथ अंग्रेजी और हिंदी के बीच आसानी से बदलें।',
      bulletsEn: [
        'Stage 1: OIR and PPDT breakdown',
        'Stage 2: TAT, WAT, SRT, SDT psychology tips',
        'Stage 3-5: GTO tasks, Interview, and Conference',
      ],
      bulletsHi: [
        'स्टेज 1: OIR और PPDT का सम्पूर्ण विश्लेषण',
        'स्टेज 2: TAT, WAT, SRT, SDT मनोविज्ञान युक्तियाँ',
        'स्टेज 3-5: GTO कार्य, साक्षात्कार एवं कॉन्फ्रेंस',
      ],
      actionEn: 'Read Handbook',
      actionHi: 'हैंडबुक पढ़ें',
      route: '/guide',
    },
    {
      partEn: 'Part 2',
      partHi: 'भाग 2',
      titleEn: 'Timed PPDT Practice Loop',
      titleHi: 'समयबद्ध PPDT अभ्यास लूप',
      descEn: 'Simulates real testing timings: 30 seconds to observe exam-style stimulus cards, followed by 4 minutes to write your story on paper.',
      descHi: 'वास्तविक परीक्षा समय का अनुकरण: 30 सेकंड परीक्षा-शैली के चित्र का अवलोकन, उसके बाद कागज पर कहानी लिखने के लिए 4 मिनट।',
      bulletsEn: [
        '65+ exam-style PPDT practice pictures',
        'Clock-time delta timers (immune to lag)',
        'Randomized selection with no immediate repeats',
      ],
      bulletsHi: [
        '65+ परीक्षा-शैली PPDT अभ्यास चित्र',
        'सटीक क्लॉक-टाइम टाइमर (लैग-मुक्त)',
        'यादृच्छिक चयन, कोई तत्काल पुनरावृत्ति नहीं',
      ],
      actionEn: 'Start Practice',
      actionHi: 'अभ्यास शुरू करें',
      route: '/practice',
    },
    {
      partEn: 'Part 3',
      partHi: 'भाग 3',
      titleEn: 'AI Feedback on Handwritten Stories',
      titleHi: 'हस्तलिखित कहानियों पर AI फीडबैक',
      descEn: 'Take a phone photo of your paper. Gemini OCR reads your handwriting, lets you verify the transcript, and returns structured feedback on your story.',
      descHi: 'अपने कागज का फोन से फोटो लें। AI OCR आपके हस्तलेखन को पढ़ता है, आपको ट्रांसक्रिप्ट जांचने देता है, और कहानी पर संरचित फीडबैक देता है।',
      bulletsEn: [
        '10-75-15 timeline ratio check (Setup / Action / Resolution)',
        '4 D\'s audit (Direct Action, Decision, Delegation, Deployment)',
        'Elevated Model Story + Narration strategy tips',
      ],
      bulletsHi: [
        '10-75-15 समय-सीमा अनुपात जांच (प्रारंभ / कार्य / समाधान)',
        '4D ऑडिट (प्रत्यक्ष कार्य, निर्णय, कार्यभार, परिनियोजन)',
        'उन्नत मॉडल कहानी + नरेशन रणनीति सुझाव',
      ],
      privacyEn: 'Handwriting image deleted immediately after transcription',
      privacyHi: 'ट्रांसक्रिप्शन के तुरंत बाद हस्तलेखन चित्र हटा दिया जाता है',
      route: '/practice',
    },
  ],

  practiceGrid: {
    title: {
      en: 'Choose a picture',
      hi: 'एक चित्र चुनें',
    },
    subtitle: {
      en: 'Pick a picture to begin. You will see it for 30 seconds, then write for 4 minutes.',
      hi: 'शुरू करने के लिए एक चित्र चुनें। आप इसे 30 सेकंड तक देखेंगे, फिर 4 मिनट तक लिखेंगे।',
    },
    picturePrefix: {
      en: 'Picture',
      hi: 'चित्र',
    },
    scoreLabel: {
      en: 'Score',
      hi: 'अंक',
    },
    lastAttemptedLabel: {
      en: 'Last attempted',
      hi: 'अंतिम प्रयास',
    },
    notAttempted: {
      en: 'Not attempted',
      hi: 'प्रयास नहीं किया',
    },
    attempted: {
      en: 'Attempted',
      hi: 'प्रयास किया',
    },
    all: {
      en: 'All',
      hi: 'सभी',
    },
    randomPicture: {
      en: 'Random picture',
      hi: 'यादृच्छिक चित्र',
    },
    begin: {
      en: 'Begin Practice',
      hi: 'अभ्यास शुरू करें',
    },
    backToPictures: {
      en: 'Back to pictures',
      hi: 'चित्रों पर वापस जाएं',
    },
    tryAnotherPicture: {
      en: 'Try another picture',
      hi: 'दूसरा चित्र आज़माएं',
    },
    howItWorks: {
      en: 'How it works',
      hi: 'यह कैसे काम करता है',
    },
    howItWorksSteps: {
      en: [
        '1. Pick a picture.',
        '2. View it for 30 seconds, then write your story on paper for 4 minutes.',
        '3. Photograph your story and get AI feedback.',
      ],
      hi: [
        '1. एक चित्र चुनें।',
        '2. इसे 30 सेकंड तक देखें, फिर कागज पर 4 मिनट तक अपनी कहानी लिखें।',
        '3. अपनी कहानी का फोटो लें और त्वरित AI फीडबैक प्राप्त करें।',
      ],
    },
    dailyLimitMessage: {
      en: "You have used today's 5 attempts. Come back tomorrow.",
      hi: 'आप आज के 5 प्रयास पूरे कर चुके हैं। कल पुनः प्रयास करें।',
    },
    pictureNotFound: {
      en: 'Picture not found',
      hi: 'चित्र नहीं मिला',
    },
    viewFeedback: {
      en: 'View feedback',
      hi: 'फीडबैक देखें',
    },
  },


  watGrid: {
    title: {
      en: 'Choose a set',
      hi: 'एक सेट चुनें',
    },
    subtitle: {
      en: 'Each set has 60 words. You get 15 seconds per word.',
      hi: 'प्रत्येक सेट में 60 शब्द हैं। आपको प्रत्येक शब्द के लिए 15 सेकंड मिलते हैं।',
    },
    setPrefix: {
      en: 'Set',
      hi: 'सेट',
    },
    wordsCount: {
      en: '60 words',
      hi: '60 शब्द',
    },
    scoreLabel: {
      en: 'Score',
      hi: 'अंक',
    },
    lastAttemptedLabel: {
      en: 'Last attempted',
      hi: 'अंतिम प्रयास',
    },
    notAttempted: {
      en: 'Not attempted',
      hi: 'प्रयास नहीं किया',
    },
    attempted: {
      en: 'Attempted',
      hi: 'प्रयास किया',
    },
    all: {
      en: 'All',
      hi: 'सभी',
    },
    dailyLimitMessage: {
      en: "You have used today's WAT attempts. Come back tomorrow.",
      hi: 'आप आज के WAT प्रयास पूरे कर चुके हैं। कल पुनः प्रयास करें।',
    },
    viewFeedback: {
      en: 'View feedback',
      hi: 'फीडबैक देखें',
    },
  },

  navItems: [
    {
      id: 'home',
      iconName: 'Shield',
      route: '/',
      labelEn: 'Home',
      labelHi: 'होम',
      subLabelEn: 'Platform Overview',
      subLabelHi: 'प्लेटफ़ॉर्म परिचय',
    },
    {
      id: 'guide',
      iconName: 'BookOpen',
      route: '/guide',
      labelEn: '5-Day SSB Guide',
      labelHi: '5-दिवसीय एसएसबी गाइड',
      subLabelEn: 'Bilingual guide (EN / Hindi)',
      subLabelHi: 'द्विभाषी गाइड (EN / हिंदी)',
    },
    {
      id: 'practice',
      iconName: 'Clock',
      route: '/practice',
      labelEn: 'Start PPDT Practice',
      labelHi: 'PPDT अभ्यास शुरू करें',
      subLabelEn: '30s picture · 4 min write',
      subLabelHi: '30s चित्र · 4 मिनट लेखन',
      isPrimary: true,
    },
    {
      id: 'wat',
      iconName: 'Clock',
      route: '/wat',
      labelEn: 'Start WAT Practice',
      labelHi: 'WAT अभ्यास शुरू करें',
      subLabelEn: '60 words · 15 s each',
      subLabelHi: '60 शब्द · 15 s प्रत्येक',
      isPrimary: true,
    },
    {
      id: 'history',
      iconName: 'History',
      route: '/history',
      labelEn: 'Past Attempts',
      labelHi: 'पिछले प्रयास',
      subLabelEn: 'History & AI feedback',
      subLabelHi: 'इतिहास एवं AI फीडबैक',
    },
  ] as NavItemConfig[],
};

