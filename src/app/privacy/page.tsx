'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Trash2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button, CardBase, TagChip } from '@/components/ui';

export default function PrivacyPage() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full font-sans text-ink space-y-8">
      {/* Top Bar with Back Link & Lang */}
      <div className="flex items-center justify-between pb-4 border-b border-hairline">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'वापस जाएं' : 'Back'}</span>
        </Link>

        <div className="inline-flex items-center rounded-full border border-hairline bg-surface p-0.5">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              lang === 'en'
                ? 'bg-[#18181b] text-white shadow-xs dark:bg-primary dark:text-white'
                : 'text-steel hover:text-ink dark:text-slate dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
              lang === 'hi'
                ? 'bg-[#18181b] text-white shadow-xs dark:bg-primary dark:text-white'
                : 'text-steel hover:text-ink dark:text-slate dark:hover:text-white'
            }`}
          >
            हिं
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card-tint-mint text-brand-green text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'गोपनीयता और डेटा सुरक्षा' : 'Privacy & Data Protection'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          {lang === 'hi' ? 'वेनेहा गोपनीयता नोट' : 'Veneha Privacy Note'}
        </h1>
        <p className="text-sm text-slate">
          {lang === 'hi'
            ? 'अंतिम अद्यतन: नवंबर 2026 · हम आपकी व्यक्तिगत जानकारी और अभ्यास डेटा की सुरक्षा कैसे करते हैं'
            : 'Last updated: November 2026 · How we respect and protect your data'}
        </p>
      </div>

      {/* Content Cards */}
      <div className="space-y-6 text-[15px] leading-relaxed text-charcoal">
        {/* 1. What We Collect */}
        <CardBase className="p-6 space-y-3">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-card-tint-lavender text-brand-purple-800 flex items-center justify-center text-xs font-bold">1</span>
            <span>{lang === 'hi' ? 'हम क्या जानकारी एकत्र करते हैं' : 'What We Collect'}</span>
          </h2>
          <p>
            {lang === 'hi'
              ? 'हम केवल वही जानकारी एकत्र करते हैं जो आपकी अभ्यास प्रगति को सहेजने के लिए आवश्यक है:'
              : 'We collect only what is necessary to maintain your account and store your practice history:'}
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate pl-2">
            <li>
              <strong className="text-ink">{lang === 'hi' ? 'खाता विवरण:' : 'Account Details:'}</strong>{' '}
              {lang === 'hi'
                ? 'आपका नाम, ईमेल पता और सुरक्षित रूप से हैश किया गया पासवर्ड (bcrypt)। हम कभी भी सादा पासवर्ड नहीं देखते या सहेजते हैं।'
                : 'Your full name, email address, and a securely salted bcrypt password hash. We never see, store, or log plain passwords.'}
            </li>
            <li>
              <strong className="text-ink">{lang === 'hi' ? 'वैकल्पिक प्रोफ़ाइल विवरण:' : 'Optional Profile Details:'}</strong>{' '}
              {lang === 'hi'
                ? 'यदि आप जोड़ना चुनते हैं, तो हम आपके अभ्यास अनुभव को वैयक्तिकृत करने के लिए आपकी जन्म तिथि, फोन नंबर, पता, लक्षित परीक्षा, शैक्षणिक स्थिति और पिछले एसएसबी प्रयासों को सहेजते हैं। ये फ़ील्ड पूरी तरह से वैकल्पिक हैं और इन्हें किसी भी समय संपादित या हटाया जा सकता है।'
                : 'If you choose to add them, we store your date of birth, phone number, address, target exam, education status, and previous SSB attempts to personalize your practice experience. These fields are entirely optional and can be edited or deleted at any time.'}
            </li>
            <li>
              <strong className="text-ink">{lang === 'hi' ? 'अभ्यास परिणाम:' : 'Practice Results:'}</strong>{' '}
              {lang === 'hi'
                ? 'आपके द्वारा स्वीकृत कहानी ट्रांसक्रिप्ट, स्कोर, फीडबैक और अभ्यास की तारीख।'
                : 'Your confirmed story transcripts, AI ratings, OLQ feedback, and practice dates.'}
            </li>
            <li>
              <strong className="text-ink">{lang === 'hi' ? 'क्या हम एकत्र नहीं करते:' : 'What We Never Collect:'}</strong>{' '}
              {lang === 'hi'
                ? 'कोई वित्तीय या भुगतान विवरण नहीं, कोई पृष्ठभूमि ट्रैकिंग नहीं, और कोई तीसरे पक्ष के विज्ञापन ट्रैकर नहीं।'
                : 'No financial or payment data, no background tracking, and no third-party advertising trackers.'}
            </li>
          </ul>
        </CardBase>

        {/* 2. Photos & Privacy */}
        <CardBase className="p-6 space-y-4 border-emerald-200/60 bg-card-tint-mint/20">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <span>{lang === 'hi' ? 'तस्वीरें एवं गोपनीयता' : 'Photos & Image Privacy'}</span>
          </h2>
          <div className="space-y-3 text-slate">
            <div>
              <p className="font-medium text-ink">
                {lang === 'hi' ? 'हस्तलिखित कहानियां:' : 'Handwritten story photos:'}
              </p>
              <p className="text-sm mt-0.5">
                {lang === 'hi'
                  ? 'हस्तलिखित कहानियों की तस्वीरें कभी भी वेनेहा द्वारा डिस्क या स्थायी मेमोरी में सहेजी नहीं जाती हैं। वे केवल OCR ट्रांसक्रिप्शन और OLQ मूल्यांकन के लिए मेमोरी में संसाधित की जाती हैं और तुरंत हटा दी जाती हैं।'
                  : 'Handwriting photos submitted for OCR evaluation are processed strictly in memory and are never saved to disk or permanent storage. They are deleted immediately following transcription.'}
              </p>
            </div>
            <div>
              <p className="font-medium text-ink">
                {lang === 'hi' ? 'प्रोफ़ाइल फ़ोटो (अवतार):' : 'Profile photos:'}
              </p>
              <p className="text-sm mt-0.5">
                {lang === 'hi'
                  ? 'यदि आप प्रोफ़ाइल फ़ोटो अपलोड करना चुनते हैं, तो इसे केवल आपके अवतार को प्रदर्शित करने के लिए हमारे सुरक्षित सर्वर पर निजी तौर पर संग्रहीत किया जाता है। इसका उपयोग कभी भी AI प्रशिक्षण, सार्वजनिक निर्देशिकाओं या तीसरे पक्ष के साथ साझा करने के लिए नहीं किया जाता है। आप इसे अपनी प्रोफ़ाइल से किसी भी समय हटा सकते हैं।'
                  : 'If you upload a profile photo, it is stored privately on our secure server solely to display your avatar. It is never used for AI training, public directories, or third-party sharing. You can remove it at any time directly from your profile settings.'}
              </p>
            </div>
          </div>
        </CardBase>

        {/* 3. 18+ Age Requirement & Guest Mode */}
        <CardBase className="p-6 space-y-3">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-card-tint-peach text-brand-orange-deep flex items-center justify-center text-xs font-bold">3</span>
            <span>{lang === 'hi' ? '18+ आयु आवश्यकता और अतिथि मोड' : '18+ Age Requirement & Guest Mode'}</span>
          </h2>
          <p className="text-slate">
            {lang === 'hi'
              ? 'खाता बनाने के लिए 18 वर्ष या उससे अधिक आयु की पुष्टि आवश्यक है। 18 वर्ष से कम आयु के अभ्यर्थी बिना किसी ईमेल या खाते के "अतिथि (Guest) मोड" में पूरी स्वतंत्रता से अभ्यास कर सकते हैं।'
              : 'Creating a full account requires confirming that you are 18 or older. Aspirants under 18 can freely practise in Guest Mode without needing an email or account, keeping all data private to their local device.'}
          </p>
        </CardBase>

        {/* 4. Deleting Your Account */}
        <CardBase className="p-6 space-y-3">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <span>{lang === 'hi' ? 'खाता एवं डेटा हटाना' : 'Account & Data Deletion'}</span>
          </h2>
          <p className="text-slate">
            {lang === 'hi'
              ? 'आप किसी भी समय अपने खाते और संबंधित सभी अभ्यास डेटा को पूर्ण रूप से हटाने का अनुरोध कर सकते हैं। आप अपने प्रोफ़ाइल पृष्ठ (/profile) से एक क्लिक में अपना संपूर्ण डेटा निर्यात (JSON) कर सकते हैं या अपना खाता और फ़ोटो स्थायी रूप से हटा सकते हैं, अथवा privacy@veneha.com पर संपर्क कर सकते हैं।'
              : 'You have full control over your data. You can download an export of your complete profile and practice history (JSON) at any time, or permanently delete your account, avatar, and all records directly from your Profile settings (/profile), or by contacting privacy@veneha.com.'}
          </p>
        </CardBase>
      </div>
    </div>
  );
}

