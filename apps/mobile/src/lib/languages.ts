export type Language = { native: string; english: string; script: string; phase: 1 | 2 | 3 };
// All 22 languages of the Eighth Schedule + English, in release order (SRS: Multilingual).
export const LANGUAGES: Language[] = [
  { native: 'हिन्दी', english: 'Hindi', script: 'Devanagari', phase: 1 },
  { native: 'English', english: 'English', script: 'Roman', phase: 1 },
  { native: 'বাংলা', english: 'Bengali', script: 'Bengali', phase: 2 },
  { native: 'मराठी', english: 'Marathi', script: 'Devanagari', phase: 2 },
  { native: 'తెలుగు', english: 'Telugu', script: 'Telugu', phase: 2 },
  { native: 'தமிழ்', english: 'Tamil', script: 'Tamil', phase: 2 },
  { native: 'ગુજરાતી', english: 'Gujarati', script: 'Gujarati', phase: 2 },
  { native: 'ಕನ್ನಡ', english: 'Kannada', script: 'Kannada', phase: 2 },
  { native: 'മലയാളം', english: 'Malayalam', script: 'Malayalam', phase: 2 },
  { native: 'ଓଡ଼ିଆ', english: 'Odia', script: 'Odia', phase: 2 },
  { native: 'ਪੰਜਾਬੀ', english: 'Punjabi', script: 'Gurmukhi', phase: 2 },
  { native: 'اردو', english: 'Urdu', script: 'Perso-Arabic', phase: 3 },
  { native: 'অসমীয়া', english: 'Assamese', script: 'Bengali', phase: 3 },
  { native: 'मैथिली', english: 'Maithili', script: 'Devanagari', phase: 3 },
  { native: 'संस्कृतम्', english: 'Sanskrit', script: 'Devanagari', phase: 3 },
  { native: 'नेपाली', english: 'Nepali', script: 'Devanagari', phase: 3 },
  { native: 'कोंकणी', english: 'Konkani', script: 'Devanagari', phase: 3 },
  { native: 'ᱥᱟᱱᱛᱟᱲᱤ', english: 'Santali', script: 'Ol Chiki', phase: 3 },
  { native: 'ꯃꯤꯇꯩꯂꯣꯟ', english: 'Manipuri', script: 'Meetei Mayek', phase: 3 },
  { native: 'डोगरी', english: 'Dogri', script: 'Devanagari', phase: 3 },
  { native: 'बड़ो', english: 'Bodo', script: 'Devanagari', phase: 3 },
  { native: 'کٲشُر', english: 'Kashmiri', script: 'Perso-Arabic', phase: 3 },
  { native: 'سنڌي', english: 'Sindhi', script: 'Perso-Arabic', phase: 3 },
];
export const VERSE_SCRIPTS = ['Devanagari', 'Roman (IAST)', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Gurmukhi', 'Perso-Arabic', 'Ol Chiki', 'Meetei Mayek'];
