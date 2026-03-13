import { ref, computed } from 'vue';

export const useTelegram = () => {
  // Use a fallback for SSR to prevent errors
  const isTMA = ref(false);
  let webApp: any = null;

  if (process.client) {
    const nuxtApp = useNuxtApp();
    isTMA.value = !!nuxtApp.$isTMA;
    webApp = nuxtApp.$telegram;
  }

  const user = computed(() => {
    return webApp?.initDataUnsafe?.user || null;
  });

  const initData = computed(() => {
    return webApp?.initData || '';
  });

  const showAlert = (message: string) => {
    if (process.client && webApp) webApp.showAlert(message);
    else if (process.client) alert(message);
  };

  const showConfirm = (message: string, callback: (ok: boolean) => void) => {
    if (process.client && webApp) webApp.showConfirm(message, callback);
    else if (process.client) callback(confirm(message));
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (process.client && webApp?.HapticFeedback) {
      try {
        webApp.HapticFeedback.impactOccurred(type);
      } catch (e) {}
    }
  };

  const setMainButton = (text: string, onClick: () => void) => {
    if (process.client && webApp?.MainButton) {
      webApp.MainButton.text = text;
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (process.client && webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  const setBackButton = (onClick: () => void) => {
    if (process.client && webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (process.client && webApp?.BackButton) {
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
