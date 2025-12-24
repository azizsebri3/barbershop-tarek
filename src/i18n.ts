import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  const safeLocale = locale ?? 'fr';
  return {
    locale: safeLocale,
    messages: (await import(`../messages/${safeLocale}.json`)).default
  };
});
