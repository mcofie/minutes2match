
export default defineNuxtPlugin(() => {
  // Check if we're in a browser and if Telegram WebApp is available
  const isTMA = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
  
  const webApp = isTMA ? window.Telegram.WebApp : null;

  if (webApp) {
    // Notify Telegram that the app is ready
    webApp.ready();
    
    // Automatically expand to full height for better UX
    webApp.expand();

    // Enable closing confirmation to prevent accidental swipes
    webApp.enableClosingConfirmation();

    // Sync theme colors to CSS variables
    const syncTheme = () => {
      const root = document.documentElement;
      root.classList.add('tma');
      document.body.classList.add('tma');
      root.style.setProperty('--tg-theme-bg-color', webApp.backgroundColor || '#ffffff');
      root.style.setProperty('--tg-theme-text-color', webApp.textColor || '#000000');
      root.style.setProperty('--tg-theme-hint-color', webApp.hintColor || '#999999');
      root.style.setProperty('--tg-theme-link-color', webApp.linkColor || '#2481cc');
      root.style.setProperty('--tg-theme-button-color', webApp.buttonColor || '#2481cc');
      root.style.setProperty('--tg-theme-button-text-color', webApp.buttonTextColor || '#ffffff');
      root.style.setProperty('--tg-theme-secondary-bg-color', webApp.secondaryBackgroundColor || '#f0f0f0');
    };

    syncTheme();
    
    // Listen for theme changes from Telegram
    webApp.onEvent('themeChanged', syncTheme);
  }

  return {
    provide: {
      telegram: webApp,
      isTMA
    }
  };
});

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}
