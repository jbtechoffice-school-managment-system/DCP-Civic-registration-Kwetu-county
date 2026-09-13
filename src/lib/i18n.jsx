import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    'nav.home': 'Home', 'nav.registrations': 'My Registrations', 'nav.messages': 'Messages',
    'nav.profile': 'Profile', 'nav.notifications': 'Notifications',
    'nav.dashboard': 'Dashboard', 'nav.summary': 'Summary', 'nav.agents': 'Agents',
    'nav.performance': 'Performance', 'nav.leaderboard': 'Leaderboard', 'nav.schedule': 'Schedule',
    'nav.unreviewed': 'Unreviewed', 'nav.statistics': 'Statistics', 'nav.map': 'Live Map',
    'nav.sessionHistory': 'Session History', 'nav.broadcast': 'Broadcast', 'nav.reports': 'Reports',
    'nav.exportData': 'Export Data', 'nav.auditLogs': 'Audit Logs', 'nav.settings': 'Settings',
    'nav.directory': 'Agent Directory', 'nav.regMap': 'Registration Map',
    'nav.analytics': 'Registration Analytics', 'nav.helpCenter': 'Help Center',
    'nav.systemStatus': 'System Status', 'nav.fieldResources': 'Field Resources',
    'nav.fieldGuidelines': 'Field Guidelines',
    'common.online': 'Online', 'common.offline': 'Offline', 'common.pending': 'Pending',
    'common.save': 'Save', 'common.cancel': 'Cancel', 'common.edit': 'Edit',
    'common.loading': 'Loading…', 'common.signOut': 'Sign out',
    'form.newReg': 'New Community Registration', 'form.personalInfo': 'Personal Information',
    'form.firstName': 'First name', 'form.surname': 'Surname', 'form.lastName': 'Last name',
    'form.idNumber': 'ID Number', 'form.contactNumber': 'Contact number',
    'form.dob': 'Date of birth', 'form.ageCategory': 'Age category', 'form.gender': 'Gender',
    'form.location': 'Location', 'form.county': 'County', 'form.constituency': 'Constituency',
    'form.ward': 'Ward', 'form.community': 'Community / Village',
    'form.station': 'Registration / administrative station',
    'form.consent': 'I confirm that the individual has been informed of the purpose of this community registration and has freely given consent for their data to be collected and processed in accordance with applicable data-protection law.',
    'form.save': 'Save', 'form.reject': 'Reject',
    'form.saved': 'Information saved successfully!', 'form.rejected': 'Form cleared. Please start a new form filling.',
    'theme.light': 'Light', 'theme.dark': 'Dark',
  },
  sw: {
    'nav.home': 'Nyumbani', 'nav.registrations': 'Usajili Wangu', 'nav.messages': 'Ujumbe',
    'nav.profile': 'Profaili', 'nav.notifications': 'Arifa',
    'nav.dashboard': 'Dashibodi', 'nav.summary': 'Muhtasari', 'nav.agents': 'Mawakala',
    'nav.performance': 'Utendaji', 'nav.leaderboard': 'Liderbodi', 'nav.schedule': 'Ratiba',
    'nav.unreviewed': 'Haijakaguliwa', 'nav.statistics': 'Takwimu', 'nav.map': 'Ramani Hai',
    'nav.sessionHistory': 'Historia ya Kikao', 'nav.broadcast': 'Tangaza', 'nav.reports': 'Ripoti',
    'nav.exportData': 'Hamisha Data', 'nav.auditLogs': 'Kumbukumbu za Ukaguzi', 'nav.settings': 'Mipangilio',
    'nav.directory': 'Orodha ya Mawakala', 'nav.regMap': 'Ramani ya Usajili',
    'nav.analytics': 'Uchanganuzi wa Usajili', 'nav.helpCenter': 'Kituo cha Msaada',
    'nav.systemStatus': 'Hali ya Mfumo', 'nav.fieldResources': 'Rasilimali za Uwanjani',
    'nav.fieldGuidelines': 'Miongozo ya Uwanjani',
    'common.online': 'Mtandaoni', 'common.offline': 'Nje ya mtandao', 'common.pending': 'Inasubiri',
    'common.save': 'Hifadhi', 'common.cancel': 'Ghairi', 'common.edit': 'Hariri',
    'common.loading': 'Inapakia…', 'common.signOut': 'Toka',
    'form.newReg': 'Usajili Mpya wa Jamii', 'form.personalInfo': 'Taarifa Binafsi',
    'form.firstName': 'Jina la kwanza', 'form.surname': 'Jina la ukoo', 'form.lastName': 'Jina la mwisho',
    'form.idNumber': 'Nambari ya Kitambulisho', 'form.contactNumber': 'Nambari ya simu',
    'form.dob': 'Tarehe ya kuzaliwa', 'form.ageCategory': 'Kategoria ya umri', 'form.gender': 'Jinsia',
    'form.location': 'Eneo', 'form.county': 'Kaunti', 'form.constituency': 'Jimbo',
    'form.ward': 'Wodi', 'form.community': 'Jamii / Kijiji',
    'form.station': 'Kituo cha usajili',
    'form.consent': 'Ninathibitisha kwamba mtu ameelezwa madhumuni ya usajili huu wa jamii na ameto ridhaa yake bila kulazimishwa kwa ajili ya kukusanywa na kushughulikiwa kwa taarifa zake kufuatana na sheria za ulinda data.',
    'form.save': 'Hifadhi', 'form.reject': 'Kataa',
    'form.saved': 'Taarifa zimehifadhiwa kwa mafanikio!', 'form.rejected': 'Fomu imefutwa. Tafadhali anza ujazaji wa fomu mpya.',
    'theme.light': 'Nuru', 'theme.dark': 'Giza',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('civic-lang') || 'en'; } catch { return 'en'; }
  });
  useEffect(() => { try { localStorage.setItem('civic-lang', lang); } catch {} }, [lang]);
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  return useContext(LanguageContext);
}