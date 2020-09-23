import areIntlLocalesSupported from 'intl-locales-supported';

export function setupI18n(locales: string[]): void {
  if (global.Intl) {
    if (!areIntlLocalesSupported(locales)) {
      const IntlPolyfill = require('intl');
      Intl.NumberFormat = IntlPolyfill.NumberFormat;
      Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
    }
  } else {
    global.Intl = require('intl');
  }
}
