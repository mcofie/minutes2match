import { ref, computed } from 'vue';

export const useTelegram = () => {
  // Use a fallback for SSR to prevent errors
  const isTMA = ref(false);
  let webApp: any = null;

  if (import.meta.client) {
    try {
      const nuxtApp = useNuxtApp();
      if (nuxtApp) {
        isTMA.value = !!nuxtApp.$isTMA;
        webApp = nuxtApp.$telegram || null;
      }
    } catch(e) {
      console.error('[useTelegram] Error accessing Nuxt app', e);
    }
  }

  const user = computed(() => {
    return webApp?.initDataUnsafe?.user || null;
  });

  const initData = computed(() => {
    return webApp?.initData || '';
  });

  const showAlert = (message: string) => {
    if (import.meta.client && webApp) webApp.showAlert(message);
    else if (import.meta.client) alert(message);
  };

  const showConfirm = (message: string, callback: (ok: boolean) => void) => {
    if (import.meta.client && webApp) webApp.showConfirm(message, callback);
    else if (import.meta.client) callback(confirm(message));
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (import.meta.client && webApp?.HapticFeedback) {
      try {
        webApp.HapticFeedback.impactOccurred(type);
      } catch (e) {}
    }
  };

  const setMainButton = (text: string, onClick: () => void) => {
    if (import.meta.client && webApp?.MainButton) {
      webApp.MainButton.text = text;
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (import.meta.client && webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  const setBackButton = (onClick: () => void) => {
    if (import.meta.client && webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (import.meta.client && webApp?.BackButton) {
      webApp.BackButton.hide();
    }
  };

  return {
    isTMA,
    tgUser: user,
    initData,
    webApp,
    showAlert,
    showConfirm,
    hapticFeedback,
    setMainButton,
    hideMainButton,
    setBackButton,
    hideBackButton
  };
};
