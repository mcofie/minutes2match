
export const useTelegram = () => {
  const { $telegram, $isTMA } = useNuxtApp();
  const isTMA = ref(!!$isTMA);
  const webApp = $telegram;

  const user = computed(() => webApp?.initDataUnsafe?.user || null);
  const initData = computed(() => webApp?.initData || '');

  const showAlert = (message: string) => {
    if (webApp) webApp.showAlert(message);
    else alert(message);
  };

  const showConfirm = (message: string, callback: (ok: boolean) => void) => {
    if (webApp) webApp.showConfirm(message, callback);
    else callback(confirm(message));
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(type);
    }
  };

  const setMainButton = (text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.text = text;
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (webApp?.MainButton) {
      webApp.MainButton.hide();
    }
  };

  const setBackButton = (onClick: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (webApp?.BackButton) {
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
