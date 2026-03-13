export default defineNuxtPlugin(async () => {
  console.log('[Telegram Plugin] Initializing...');
  
  const getWebApp = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return window.Telegram.WebApp;
    }
    return null;
  };

  // Wait a tiny bit for the script if it's not ready
  if (typeof window !== 'undefined' && !window.Telegram) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  try {
    let webApp = getWebApp();
    const isTMA = !!(webApp && webApp.initData);

    if (webApp) {
      console.log('[Telegram Plugin] WebApp detected');
      webApp.ready();
      webApp.expand();
      webApp.enableClosingConfirmation();

      const syncTheme = () => {
        if (!webApp) return;
        try {
          const root = document.documentElement;
          root.classList.add('tma');
          if (document.body) {
            document.body.classList.add('tma');
          }
          root.style.setProperty('--tg-theme-bg-color', webApp.backgroundColor || '#ffffff');
          root.style.setProperty('--tg-theme-text-color', webApp.textColor || '#000000');
          root.style.setProperty('--tg-theme-hint-color', webApp.hintColor || '#999999');
          root.style.setProperty('--tg-theme-link-color', webApp.linkColor || '#2481cc');
          root.style.setProperty('--tg-theme-button-color', webApp.buttonColor || '#2481cc');
          root.style.setProperty('--tg-theme-button-text-color', webApp.buttonTextColor || '#ffffff');
          root.style.setProperty('--tg-theme-secondary-bg-color', webApp.secondaryBackgroundColor || '#f0f0f0');
        } catch (e) {
          console.error('[Telegram Plugin] Theme sync failed', e);
        }
      };

      syncTheme();
      webApp.onEvent('themeChanged', syncTheme);
    } else {
      console.log('[Telegram Plugin] Not in TMA');
    }

    return {
      provide: {
        telegram: webApp,
        isTMA
      }
    };
  } catch (err) {
    console.error('[Telegram Plugin] Fatal Error during init', err);
    return {
      provide: {
        telegram: null,
        isTMA: false
      }
    };
  }
});

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}
