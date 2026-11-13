export interface GuideSection {
  id: string;
  day: string;
  titleEn: string;
  titleHi: string;
  tagEn: string;
  tagHi: string;
  summaryEn: string;
  summaryHi: string;
  tests: {
    nameEn: string;
    nameHi: string;
    detailsEn: string;
    detailsHi: string;
    assessorTipEn: string;
    assessorTipHi: string;
    commonTrapsEn?: string;
    commonTrapsHi?: string;
  }[];
}

export interface OLQItem {
  number: number;
  nameEn: string;
  nameHi: string;
  factor: 'Factor 1: Planning & Organizing' | 'Factor 2: Social Adjustment' | 'Factor 3: Social Effectiveness' | 'Factor 4: Dynamic';
  factorHi: string;
  descriptionEn: string;
  descriptionHi: string;
  inStoryEn: string;
  inStoryHi: string;
}

export const SSB_GUIDE_DATA: GuideSection[] = [
  {
    id: "stage-1-screening",
    day: "Day 1",
    titleEn: "Stage 1: Screening Test (OIR & PPDT)",
    titleHi: "स्टेज 1: स्क्रीनिंग टेस्ट (OIR और PPDT)",
    tagEn: "Crucial Filter (~60% Screened Out)",
    tagHi: "निर्णायक चरण (लगभग 60% बाहर)",
    summaryEn: "Day 1 filters candidates to select those with baseline cognitive agility, calm observational ability, and group presence for the full 5-day assessment.",
    summaryHi: "दिन 1 पर बुनियादी बौद्धिक क्षमता, शांत अवलोकन और समूह में अपनी बात रखने की क्षमता जांची जाती है। केवल चयनित उम्मीदवार अगले 4 दिनों के लिए रुकते हैं।",
    tests: [
      {
        nameEn: "Officer Intelligence Rating (OIR)",
        nameHi: "ऑफिसर इंटेलिजेंस रेटिंग (OIR)",
        detailsEn: "Two test booklets of 40-50 questions each covering Verbal reasoning (analogies, coding, classification) and Non-Verbal reasoning (cube rotations, pattern completion, odd figure out). Timed strictly (approx 20-30 seconds per question).",
        detailsHi: "40-50 प्रश्नों की 2 बुकलेट। मौखिक (सादृश्यता, कोडिंग, वर्गीकरण) और गैर-मौखिक (घन घुमाव, पैटर्न पूर्णता) तर्क शामिल हैं। समय बहुत सीमित होता है (प्रति प्रश्न 20-30 सेकंड)।",
        assessorTipEn: "OIR 1 or OIR 2 gives you a massive statistical buffer during PPDT evaluation. Do not guess blindly if negative marking is indicated, but maintain steady speed.",
        assessorTipHi: "OIR 1 या 2 स्कोर आपको PPDT में मजबूत बढ़त देता है। गति निरंतर बनाए रखें और आसान प्रश्नों को पहले हल करें।"
      },
      {
        nameEn: "PPDT - Picture Perception & Description Test",
        nameHi: "PPDT - चित्र प्रत्यक्षीकरण और विवरण परीक्षण",
        detailsEn: "A hazy, ambiguous black & white picture is projected for exactly 30 seconds. Next, you have 1 minute to fill the character box (Age, Gender, Mood - AGM) and title, then 4 minutes to write an action-oriented constructive story.",
        detailsHi: "30 सेकंड के लिए एक धुंधला चित्र दिखाया जाता है। इसके बाद 1 मिनट में बॉक्स में मुख्य पात्र (आयु, लिंग, मनोदशा) और शीर्षक लिखना होता है, और फिर 4 मिनट में सकारात्मक कहानी लिखनी होती है।",
        assessorTipEn: "Follow the 10-75-15 timeline rule: 10% setup (context), 75% positive, logical direct action, 15% earned resolution. Never invent artificial murders, ghosts, or tragic deaths.",
        assessorTipHi: "10-75-15 नियम अपनाएं: 10% शुरुआत, 75% वास्तविक तार्किक कार्य, 15% सुखद परिणाम। अनावश्यक त्रासदी, हत्या या आत्महत्या न बनाएं।"
      },
      {
        nameEn: "Individual Narration & Group Discussion (GD)",
        nameHi: "व्यक्तिगत कथन और समूह चर्चा (GD)",
        detailsEn: "Candidates sit in a semi-circle. Each candidate gets exactly 1 minute to narrate their story without looking at the assessors. Immediately after the last candidate speaks, the group discussion starts to formulate a single common consensus story.",
        detailsHi: "उम्मीदवार अर्धवृत्त में बैठते हैं। प्रत्येक को 1 मिनट में बिना परीक्षक की ओर देखे अपनी कहानी सुनानी होती है। इसके तुरंत बाद सभी को मिलकर एक साझा कहानी (Consensus Story) बनानी होती है।",
        assessorTipEn: "In narration, speak loud and clear with a gentle smile. In GD, avoid fish markets. Speak 2-3 logical points, support others by name, and steer the group toward consensus rather than shouting.",
        assessorTipHi: "कथन के समय स्पष्ट और आत्मविश्वास से बोलें। चर्चा में चीखने-चिल्लाने के बजाय 2-3 ठोस विचार रखें और समूह को एक सहमति तक पहुंचाने में मदद करें।"
      }
    ]
  },
  {
    id: "stage-2-psychology",
    day: "Day 2",
    titleEn: "Stage 2: Psychology Battery (TAT, WAT, SRT, SDT)",
    titleHi: "स्टेज 2: मनोविज्ञान परीक्षण (TAT, WAT, SRT, SDT)",
    tagEn: "Window to Subconscious Mind",
    tagHi: "अवचेतन मन का परीक्षण",
    summaryEn: "A continuous series of projective psychological tests administered without breaks, designed to bypass practiced facades and reveal genuine character traits.",
    summaryHi: "बिना ब्रेक के लगातार होने वाले प्रोजेक्टिव परीक्षण, जो रटे-रटाए मुखौटों को हटाकर आपकी वास्तविक मानसिकता और सोच को सामने लाते हैं।",
    tests: [
      {
        nameEn: "Thematic Apperception Test (TAT)",
        nameHi: "थीमैटिक एपेरसेप्शन टेस्ट (TAT)",
        detailsEn: "11 pictures shown for 30 seconds each, with 4 minutes to write a story for each. The 12th slide is completely blank, where you write a pre-prepared positive story based on your own ideals and ambition.",
        detailsHi: "11 चित्र 30-30 सेकंड के लिए दिखाए जाते हैं और प्रत्येक पर 4 मिनट में कहानी लिखनी होती है। 12वीं स्लाइड बिल्कुल खाली (Blank) होती है, जिस पर अपने जीवन मूल्यों पर आधारित कहानी लिखनी होती है।",
        assessorTipEn: "Ensure the hero has realistic authority. If the hero is a college student, solve college-level problems. Show genuine teamwork, practical resource management, and emotional stability.",
        assessorTipHi: "नायक की उम्र और पद वास्तविक रखें। कॉलेज का छात्र देश के रक्षा सौदे नहीं सुलझा सकता। व्यावहारिक सूझबूझ और टीमवर्क दिखाएं।"
      },
      {
        nameEn: "Word Association Test (WAT)",
        nameHi: "शब्द साहचर्य परीक्षण (WAT)",
        detailsEn: "60 words flashed one after another for 15 seconds each. In those 15 seconds, you must read the word, think of an idea, and write a complete sentence.",
        detailsHi: "60 शब्द एक के बाद एक स्क्रीन पर 15 सेकंड के लिए आते हैं। उसी समय में शब्द देखकर पहली स्वाभाविक और सकारात्मक सोच वाला वाक्य लिखना होता है।",
        assessorTipEn: "Avoid moral lecturing ('We should', 'One must'). Write spontaneous observation sentences or action statements reflecting resilience and optimism.",
        assessorTipHi: "'हमें ऐसा करना चाहिए' जैसे उपदेशात्मक वाक्य न लिखें। व्यावहारिक और सकारात्मक कार्य-आधारित वाक्य लिखें।"
      },
      {
        nameEn: "Situation Reaction Test (SRT)",
        nameHi: "परिस्थिति प्रतिक्रिया परीक्षण (SRT)",
        detailsEn: "A booklet containing 60 real-life practical crises or dilemmas. You have 30 minutes to write your concise, telegraphic reactions to as many as possible (aim for 40-50+).",
        detailsHi: "30 मिनट में 60 दैनिक जीवन की जटिल या आपातकालीन परिस्थितियों पर अपनी त्वरित और तार्किक प्रतिक्रिया लिखनी होती है (40-50+ का लक्ष्य रखें)।",
        assessorTipEn: "Write complete telegraphic actions: 'Turned off main switch, doused fire with sand, called 101, resumed work.' Don't leave sentences half-finished.",
        assessorTipHi: "संक्षिप्त और पूर्ण कार्य लिखें: 'मेन स्विच बंद किया, रेत डालकर आग बुझाई, दमकल को सूचित किया और काम पूरा किया।' अधूरा न छोड़ें।"
      },
      {
        nameEn: "Self Description Test (SDT)",
        nameHi: "स्व-विवरण परीक्षण (SDT)",
        detailsEn: "Write 5 paragraphs in 15 minutes: Parents' opinion, Teachers'/Employers' opinion, Friends'/Peers' opinion, Self-view, and Qualities you wish to improve.",
        detailsHi: "15 मिनट में 5 पैराग्राफ: माता-पिता की राय, शिक्षकों की राय, मित्रों की राय, स्वयं का दृष्टिकोण, और वे गुण जिन्हें आप सुधारना चाहते हैं।",
        assessorTipEn: "Be honest and humble. Mention genuine fixable weaknesses (e.g., 'need to improve marathon timing' or 'polishing conversational spoken Hindi') rather than toxic red flags.",
        assessorTipHi: "ईमानदार रहें। ऐसी कमियां बताएं जिन्हें सुधारा जा सकता है (जैसे खेल का स्टेमिना या सार्वजनिक भाषण), गंभीर चरित्र दोष नहीं।"
      }
    ]
  },
  {
    id: "stage-3-gto",
    day: "Day 3 & 4",
    titleEn: "Stage 3 & 4: Group Testing Officer (GTO) Grounds",
    titleHi: "स्टेज 3 और 4: जीटीओ (GTO) ग्राउंड टास्क",
    tagEn: "Outdoor Leadership & Team Synergy",
    tagHi: "आउटडोर नेतृत्व और टीम भावना",
    summaryEn: "9 outdoor group tasks evaluating your practical problem solving under physical fatigue, cooperation, communication, and natural leadership amidst peers.",
    summaryHi: "शारीरिक और मानसिक दबाव में आपकी व्यावहारिक समझ, टीम भावना, दूसरों के विचारों का सम्मान और स्वाभाविक नेतृत्व क्षमता की परीक्षा।",
    tests: [
      {
        nameEn: "Group Discussion (GD) & Group Planning Exercise (GPE)",
        nameHi: "समूह चर्चा (GD) एवं समूह योजना अभ्यास (GPE)",
        detailsEn: "Two back-to-back GD topics (current national/international affairs and social issues). In GPE, a map model shows 4 simultaneous emergency situations requiring urgent resource allocation and phased execution.",
        detailsHi: "दो समसामयिक विषयों पर समूह चर्चा, और फिर GPE में एक मॉडल मैप पर 4 समकालीन आपात स्थितियों को प्राथमिकताओं के अनुसार सुलझाने की योजना।",
        assessorTipEn: "In GPE, prioritize loss of human life first, then public property, then personal errand. Calculate realistic time, speed, distance, and split resources rationally.",
        assessorTipHi: "GPE में प्राथमिकता हमेशा मानव जीवन की रक्षा > सार्वजनिक संपत्ति > व्यक्तिगत कार्य होनी चाहिए। समय और दूरी का सही अनुमान लगाएं।"
      },
      {
        nameEn: "Progressive Group Task (PGT) & Half Group Task (HGT)",
        nameHi: "प्रोग्रेसिव ग्रुप टास्क (PGT) और हाफ ग्रुप टास्क (HGT)",
        detailsEn: "Navigating a team across 4 consecutive obstacle zones with helping materials (wooden plank/phatta, rope, pole/balli) and a load, abiding strictly by color rules (Red, Blue, White).",
        detailsHi: "लकड़ी के फट्टे, बल्ली, रस्सी और वजन के साथ 4 बाधाओं को पार करना। रंग के नियमों (लाल, नीला, सफेद) का कड़ाई से पालन करना अनिवार्य है।",
        assessorTipEn: "Look for cantilever and fulcrum principles. Don't hog the front if you don't have an idea; support the leader with helping materials and anchor ropes calmly.",
        assessorTipHi: "उत्तोलक (Cantilever) सिद्धांत का प्रयोग करें। यदि कोई योजना न सूझे तो आगे खड़े होकर बाधा न बनें; फट्टा या रस्सी पकड़कर साथी की मदद करें।"
      },
      {
        nameEn: "Individual Obstacles (IO) & Command Task (CT)",
        nameHi: "व्यक्तिगत बाधाएं (IO) और कमांड टास्क (CT)",
        detailsEn: "In IO, complete 10 physical obstacles (Tiger Leap, Commando Walk, Tarzan Jump) in 3 minutes. In Command Task, you are appointed Commander and pick 2 subordinates to overcome a tough obstacle.",
        detailsHi: "IO में 3 मिनट में 10 शारीरिक बाधाएं पार करनी होती हैं। कमांड टास्क में आपको कमांडर बनाकर 2 साथी चुनने होते हैं ताकि आप एक जटिल बाधा पार कर सकें।",
        assessorTipEn: "In Command Task, brief your subordinates clearly, don't do all manual labor yourself nor treat subordinates like slaves. Guide them with clear encouragement.",
        assessorTipHi: "कमांड टास्क में अपने अधीनस्थों को स्पष्ट निर्देश दें, न तो सारा काम खुद करें और न ही उन पर चिल्लाएं। सम्मान और स्पष्टता से नेतृत्व करें।"
      }
    ]
  },
  {
    id: "stage-4-interview",
    day: "Day 4",
    titleEn: "Personal Interview: The IO Interaction",
    titleHi: "व्यक्तिगत साक्षात्कार: इंटरव्यू ऑफिसर (IO)",
    tagEn: "Comprehensive Information Questionnaire (PIQ)",
    tagHi: "गहन व्यक्तित्व और पृष्ठभूमि संवाद",
    summaryEn: "A 45-60 minute structured conversation with a senior officer (Brigadier / Colonel rank) based on your PIQ form, questioning your life choices, academic trends, family dynamics, and awareness.",
    summaryHi: "एक वरिष्ठ अधिकारी के साथ 45-60 मिनट का संरचित संवाद। आपके परिवार, शिक्षा, दोस्तों, शौक, निर्णय क्षमता और राष्ट्रीय-अंतरराष्ट्रीय ज्ञान की परख।",
    tests: [
      {
        nameEn: "Comprehensive Interview Questions (CIQ Batteries)",
        nameHi: "कंप्रिहेंसिव इंटरव्यू क्वेश्चन (CIQ प्रश्नमाला)",
        detailsEn: "The IO asks a rapid series of 6-8 interrelated questions in one breath (e.g. 'Tell me about your marks from 10th to graduation, favorite teachers, subjects you disliked, and why your score dropped in 12th').",
        detailsHi: "इंटरव्यू ऑफिसर एक सांस में 6-8 जुड़े हुए प्रश्न पूछते हैं (जैसे 10वीं से स्नातक तक के अंक, पसंदीदा शिक्षक, नापसंद विषय, और 12वीं में अंक कम होने का कारण)।",
        assessorTipEn: "Listen intently without panic. Structure your answer in chronological order. Never make excuses for failures—own mistakes honestly and explain how you bounced back.",
        assessorTipHi: "घबराए बिना क्रमबद्ध उत्तर दें। असफलता का दोष दूसरों पर न मढ़ें; अपनी कमी स्वीकारें और बताएं कि आपने उससे क्या सीखा।"
      }
    ]
  },
  {
    id: "stage-5-conference",
    day: "Day 5",
    titleEn: "Stage 5: Final Board Conference & Results",
    titleHi: "स्टेज 5: फाइनल बोर्ड कॉन्फ्रेंस और परिणाम",
    tagEn: "The Final Recommendation",
    tagHi: "अंतिम अनुशंसा",
    summaryEn: "All assessors gather in full service uniform around the conference table. The board discusses borderline candidates before calling each candidate in for 1-5 minutes to deliver the verdict.",
    summaryHi: "सभी परीक्षक वर्दी में एक साथ बैठते हैं। बॉर्डरलाइन उम्मीदवारों पर विस्तृत चर्चा होती है। प्रत्येक उम्मीदवार को 1-3 मिनट के लिए अंदर बुलाया जाता है और फिर परिणाम घोषित किए जाते हैं।",
    tests: [
      {
        nameEn: "The Board Interaction & Borderline Discussions",
        nameHi: "बोर्ड संवाद एवं बॉर्डरलाइन समीक्षा",
        detailsEn: "You march in, sit on the candidate chair, answer simple questions about stay and food (or a rapid situation question if you are on the borderline of 240/900 marks).",
        detailsHi: "आप आत्मविश्वास से प्रवेश करते हैं। यदि आप 240 अंकों की सीमा रेखा पर हैं, तो कुछ अतिरिक्त प्रश्न पूछे जा सकते हैं। शांत और गरिमामय बने रहें।",
        assessorTipEn: "Hold your head high with steady eye contact. Regardless of outcome, take the feedback with officer-like dignity. The armed forces respect resilience above all else.",
        assessorTipHi: "दृढ़ नजरें और शांत चेहरा रखें। परिणाम चाहे जो भी हो, एक अधिकारी जैसी गरिमा और खेल भावना का प्रदर्शन करें।"
      }
    ]
  }
];

export const OLQ_FACTORS: OLQItem[] = [
  // Factor 1
  {
    number: 1,
    nameEn: "Effective Intelligence",
    nameHi: "प्रभावी बुद्धिमत्ता",
    factor: "Factor 1: Planning & Organizing",
    factorHi: "कारक 1: योजना और संगठन",
    descriptionEn: "Practical common sense and applied resourcefulness to solve real-world problems on the ground, distinct from academic rote memory.",
    descriptionHi: "किताबी ज्ञान से अलग, वास्तविक परिस्थितियों में व्यावहारिक समझ और उपलब्ध संसाधनों से समस्या सुलझाने की सूझबूझ।",
    inStoryEn: "Hero devises a practical solution using easily available local materials rather than relying on abstract high-tech wizardry.",
    inStoryHi: "नायक किसी जटिल उपकरण के बजाय मौके पर उपलब्ध सामान का उपयोग कर व्यावहारिक हल निकालता है।"
  },
  {
    number: 2,
    nameEn: "Reasoning Ability",
    nameHi: "तार्किक क्षमता",
    factor: "Factor 1: Planning & Organizing",
    factorHi: "कारक 1: योजना और संगठन",
    descriptionEn: "Ability to grasp the root cause of an issue, weigh logical alternatives, and arrive at sound conclusions.",
    descriptionHi: "समस्या की जड़ को समझना, विभिन्न विकल्पों के नफा-नुकसान को तौलना और ठोस निष्कर्ष पर पहुंचना।",
    inStoryEn: "Hero identifies the root bottleneck before blindly reacting, reasoning why Option A is safer and faster than Option B.",
    inStoryHi: "नायक बिना सोचे-समझे कूदने के बजाय पहले कारण पहचानता है और सोच-समझकर निर्णय लेता है।"
  },
  {
    number: 3,
    nameEn: "Organizing Ability",
    nameHi: "संगठन क्षमता",
    factor: "Factor 1: Planning & Organizing",
    factorHi: "कारक 1: योजना और संगठन",
    descriptionEn: "Arranging men, materials, and time in a disciplined, logical sequence to accomplish a time-bound objective.",
    descriptionHi: "लोगों, संसाधनों और समय को सही क्रम में नियोजित कर समयबद्ध लक्ष्य हासिल करना।",
    inStoryEn: "Hero divides the team into specific workstreams (first-aid, logistics, communication) with clear deadlines.",
    inStoryHi: "नायक समूह को अलग-अलग जिम्मेदारियों (राहत, रसद, संपर्क) में बांटता है और स्पष्ट समय सीमा तय करता है।"
  },
  {
    number: 4,
    nameEn: "Power of Expression",
    nameHi: "अभिव्यक्ति की क्षमता",
    factor: "Factor 1: Planning & Organizing",
    factorHi: "कारक 1: योजना और संगठन",
    descriptionEn: "Communicating ideas clearly, concisely, and persuasively to seniors, peers, and subordinates.",
    descriptionHi: "अपने विचारों को स्पष्ट, संक्षिप्त और प्रभावी ढंग से दूसरों तक पहुंचाना।",
    inStoryEn: "Hero briefs the team in 3 unambiguous bullet points, convincing villagers or superiors to adopt the plan.",
    inStoryHi: "नायक बिना अस्पष्टता के स्पष्ट बिंदुओं में टीम को काम समझाता है और सबका सहयोग प्राप्त करता है।"
  },

  // Factor 2
  {
    number: 5,
    nameEn: "Social Adaptability",
    nameHi: "सामाजिक अनुकूलनशीलता",
    factor: "Factor 2: Social Adjustment",
    factorHi: "कारक 2: सामाजिक सामंजस्य",
    descriptionEn: "Adjusting warmly and smoothly with people of diverse social strata, backgrounds, religions, and temperaments.",
    descriptionHi: "विभिन्न पृष्ठभूमि, संस्कृति और स्वभाव के लोगों के साथ सहजता और आदर से घुलना-मिलना।",
    inStoryEn: "Hero treats laborers, elders, and peers with mutual respect, adapting communication to their comfort level.",
    inStoryHi: "नायक सभी वर्गों और आयु वर्ग के लोगों के साथ सम्मानपूर्वक संवाद करता है।"
  },
  {
    number: 6,
    nameEn: "Cooperation",
    nameHi: "सहयोग की भावना",
    factor: "Factor 2: Social Adjustment",
    factorHi: "कारक 2: सामाजिक सामंजस्य",
    descriptionEn: "Willingness to participate harmoniously, prioritizing team victory over solo ego or individual credit.",
    descriptionHi: "निजी श्रेय के बजाय टीम की सफलता को सर्वोपरि रखना और दूसरों की सहायता के लिए तत्पर रहना।",
    inStoryEn: "Hero actively supports team members, passing credit to the group and stepping in where the workload is heaviest.",
    inStoryHi: "नायक समूह के साथियों का हाथ बंटाता है और सफलता का श्रेय पूरी टीम को देता है।"
  },
  {
    number: 7,
    nameEn: "Sense of Responsibility",
    nameHi: "जिम्मेदारी की भावना",
    factor: "Factor 2: Social Adjustment",
    factorHi: "कारक 2: सामाजिक सामंजस्य",
    descriptionEn: "A profound internal moral drive to fulfill duties without requiring supervision, taking ownership of errors.",
    descriptionHi: "बिना किसी निगरानी के अपने कर्तव्य का ईमानदारी से निर्वहन करना और गलतियों की जिम्मेदारी लेना।",
    inStoryEn: "Hero stays back until the entire site is clean and safe, ensuring not a single person is left stranded.",
    inStoryHi: "नायक अंतिम व्यक्ति के सुरक्षित होने तक डटा रहता है और अपनी जिम्मेदारी पूरी करके ही दम लेता है।"
  },

  // Factor 3
  {
    number: 8,
    nameEn: "Initiative",
    nameHi: "पहल करने की क्षमता (Initiative)",
    factor: "Factor 3: Social Effectiveness",
    factorHi: "कारक 3: सामाजिक प्रभावशीलता",
    descriptionEn: "Taking the first constructive step in an unfamiliar or challenging situation without waiting to be prodded.",
    descriptionHi: "कठिन परिस्थिति में बिना किसी के कहे आगे बढ़कर पहला सकारात्मक कदम उठाना।",
    inStoryEn: "Hero notices the crisis first and immediately steps forward to organize action while others hesitate.",
    inStoryHi: "जब बाकी लोग हिचकिचा रहे होते हैं, तब नायक आगे बढ़कर स्थिति को संभालने की पहल करता है।"
  },
  {
    number: 9,
    nameEn: "Self Confidence",
    nameHi: "आत्मविश्वास",
    factor: "Factor 3: Social Effectiveness",
    factorHi: "कारक 3: सामाजिक प्रभावशीलता",
    descriptionEn: "Faith in one's own capability to tackle difficult or unprecedented odds with composed equanimity.",
    descriptionHi: "प्रतिकूल और नई परिस्थितियों में अपनी क्षमताओं पर अडिग विश्वास रखना।",
    inStoryEn: "Hero remains calm in the face of sudden setbacks, reassuring teammates with steady composure.",
    inStoryHi: "अचानक रुकावट आने पर भी नायक घबराता नहीं है, बल्कि शांत रहकर टीम का हौसला बढ़ाता है।"
  },
  {
    number: 10,
    nameEn: "Speed of Decision",
    nameHi: "त्वरित निर्णय क्षमता",
    factor: "Factor 3: Social Effectiveness",
    factorHi: "कारक 3: सामाजिक प्रभावशीलता",
    descriptionEn: "Arriving at workable, rational conclusions promptly when time is critical.",
    descriptionHi: "समय के दबाव में बिना अनावश्यक देरी किए सही और त्वरित निर्णय लेना।",
    inStoryEn: "Hero assesses the rapid water level rise in seconds and immediately shifts the camp to higher ground.",
    inStoryHi: "खतरे की गंभीरता को सेकंडों में भांपकर नायक तुरंत सुरक्षित स्थान पर जाने का आदेश देता है।"
  },
  {
    number: 11,
    nameEn: "Ability to Influence the Group",
    nameHi: "समूह को प्रभावित करने की क्षमता",
    factor: "Factor 3: Social Effectiveness",
    factorHi: "कारक 3: सामाजिक प्रभावशीलता",
    descriptionEn: "Persuading and inspiring a group to voluntarily rally toward an objective through logic and character.",
    descriptionHi: "अपने तर्क, आचरण और उदाहरण से समूह को किसी उद्देश्य के लिए प्रेरित करना।",
    inStoryEn: "Through clear rationale and personal example, hero motivates discouraged volunteers to complete the embankment.",
    inStoryHi: "नायक खुद काम में जुटकर और सकारात्मक तर्क देकर निराश टीम में नया जोश भर देता है।"
  },
  {
    number: 12,
    nameEn: "Liveliness",
    nameHi: "सजीवता एवं उत्साह (Liveliness)",
    factor: "Factor 3: Social Effectiveness",
    factorHi: "कारक 3: सामाजिक प्रभावशीलता",
    descriptionEn: "Maintaining a cheerful, high-spirited temperament even under severe pressure and exhaustion.",
    descriptionHi: "अत्यधिक दबाव और थकान के बीच भी ऊर्जावान, प्रसन्नचित्त और सकारात्मक बने रहना।",
    inStoryEn: "Hero injects buoyant optimism and humor during a long grueling night of work, keeping team morale high.",
    inStoryHi: "कठिन परिश्रम के दौरान भी नायक चेहरे पर मुस्कान और ऊर्जा बनाए रखता है जिससे टीम का मनोबल ऊंचा रहता है।"
  },

  // Factor 4
  {
    number: 13,
    nameEn: "Determination",
    nameHi: "दृढ़ निश्चय (Determination)",
    factor: "Factor 4: Dynamic",
    factorHi: "कारक 4: जुझारू क्षमता (Dynamic)",
    descriptionEn: "Unshakable tenacity to see a chosen task through to the finish line despite hurdles and fatigue.",
    descriptionHi: "बाधाओं और असफलताओं के बावजूद काम को अंत तक पूरा करने की अटूट जिद्द।",
    inStoryEn: "When the first motor fails, hero does not give up; he repairs the gasket in the dark and restarts the pump.",
    inStoryHi: "पहली योजना विफल होने पर नायक निराश नहीं होता; वह तुरंत दूसरी योजना पर काम शुरू कर सफलता पाता है।"
  },
  {
    number: 14,
    nameEn: "Courage",
    nameHi: "साहस (Courage)",
    factor: "Factor 4: Dynamic",
    factorHi: "कारक 4: जुझारू क्षमता (Dynamic)",
    descriptionEn: "Willingness to confront physical danger or take calculated moral stands when conscience demands it.",
    descriptionHi: "शारीरिक खतरे का सामना करने या सही बात के लिए निर्भीकता से खड़े होने का साहस।",
    inStoryEn: "Hero wades into torrential waters with a lifeline rope to rescue stranded children without reckless bravado.",
    inStoryHi: "नायक बिना किसी लापरवाही के, सुरक्षा रस्सी के सहारे उफनती नदी में उतरकर फंसे लोगों को बचाता है।"
  },
  {
    number: 15,
    nameEn: "Stamina",
    nameHi: "शारीरिक व मानसिक सहनशीलता (Stamina)",
    factor: "Factor 4: Dynamic",
    factorHi: "कारक 4: जुझारू क्षमता (Dynamic)",
    descriptionEn: "Capacity to endure continuous physical hardship and mental strain over long durations without breaking.",
    descriptionHi: "लंबे समय तक शारीरिक श्रम और मानसिक तनाव को बिना टूटे झेलने की क्षमता।",
    inStoryEn: "Hero works non-stop for 18 hours alongside rescue workers until the entire sector is secure.",
    inStoryHi: "नायक बिना थके पूरी रात राहत कार्य में जुटा रहता है जब तक कि अंतिम व्यक्ति सुरक्षित न हो जाए।"
  }
];

export interface OLQFactorStructured {
  id: string;
  titleEn: string;
  titleHi: string;
  qualitiesEn: string[];
  qualitiesHi: string[];
}

export const OLQ_FACTORS_STRUCTURED: OLQFactorStructured[] = [
  {
    id: "factor-1",
    titleEn: "Factor 1: Planning and Organizing",
    titleHi: "कारक 1: योजना और संगठन (Factor 1: Planning and Organizing)",
    qualitiesEn: [
      "Effective Intelligence",
      "Reasoning",
      "Organizing",
      "Expression",
    ],
    qualitiesHi: [
      "प्रभावी बुद्धिमत्ता (Effective Intelligence)",
      "तार्किक क्षमता (Reasoning)",
      "संगठन क्षमता (Organizing)",
      "अभिव्यक्ति की क्षमता (Expression)",
    ],
  },
  {
    id: "factor-2",
    titleEn: "Factor 2: Social Adjustment",
    titleHi: "कारक 2: सामाजिक सामंजस्य (Factor 2: Social Adjustment)",
    qualitiesEn: [
      "Social Adaptability",
      "Cooperation",
      "Sense of Responsibility",
    ],
    qualitiesHi: [
      "सामाजिक अनुकूलनशीलता (Social Adaptability)",
      "सहयोग की भावना (Cooperation)",
      "जिम्मेदारी की भावना (Sense of Responsibility)",
    ],
  },
  {
    id: "factor-3",
    titleEn: "Factor 3: Social Effectiveness",
    titleHi: "कारक 3: सामाजिक प्रभावशीलता (Factor 3: Social Effectiveness)",
    qualitiesEn: [
      "Initiative",
      "Self Confidence",
      "Decision Making",
      "Liveliness",
      "Influence",
    ],
    qualitiesHi: [
      "पहल करने की क्षमता (Initiative)",
      "आत्मविश्वास (Self Confidence)",
      "त्वरित निर्णय क्षमता (Decision Making)",
      "सजीवता एवं उत्साह (Liveliness)",
      "समूह को प्रभावित करने की क्षमता (Influence)",
    ],
  },
  {
    id: "factor-4",
    titleEn: "Factor 4: Dynamic",
    titleHi: "कारक 4: जुझारू क्षमता (Factor 4: Dynamic)",
    qualitiesEn: [
      "Determination",
      "Courage",
      "Stamina",
    ],
    qualitiesHi: [
      "दृढ़ निश्चय (Determination)",
      "साहस (Courage)",
      "सहनशीलता एवं ऊर्जा (Stamina)",
    ],
  },
];

export const OLQ_SECTION_DATA = {
  headingEn: "What is Assessed: 15 Officer Like Qualities (OLQs)",
  headingHi: "क्या जांचा जाता है: 15 ऑफिसर लाइक क्वालिटीज (OLQs)",
  introEn: "The SSB tests core personality traits grouped into 4 factors:",
  introHi: "एसएसबी में व्यक्तित्व के मूल गुणों को 4 कारकों में समूहीकृत कर परखा जाता है:",
  factors: OLQ_FACTORS_STRUCTURED,
  ctaEn: "Practise PPDT with OLQ Feedback",
  ctaHi: "OLQ फीडबैक के साथ PPDT अभ्यास करें",
};


