import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'tr', name: 'TR', label: 'Türkçe' },
    { code: 'en', name: 'EN', label: 'English' },
    { code: 'ru', name: 'RU', label: 'Русский' },
    { code: 'uz', name: 'UZ', label: 'O\'zbek' },
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300 bg-white min-w-[60px]">
        <span className="text-xs font-semibold">{currentLanguage.name}</span>
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full text-left px-3 py-2 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md flex items-center justify-between text-sm ${
              i18n.language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            <span className="font-medium">{lang.name}</span>
            <span className="text-xs text-gray-500">{lang.label}</span>
            {i18n.language === lang.code && (
              <span className="ml-2 text-blue-600 text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;

