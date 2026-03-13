export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error: any, instance: any, info: string) => {
    console.error('[Vue Error]', error, info);
    // Suppress Telegram specific UI errors to prevent alert spam, but show critical ones
    if (typeof error === 'object' && error?.message) {
      if (document.body) {
         const div = document.createElement('div');
         div.style.position = 'fixed';
         div.style.top = '0';
         div.style.left = '0';
         div.style.right = '0';
         div.style.backgroundColor = 'red';
         div.style.color = 'white';
         div.style.zIndex = '999999';
         div.style.padding = '10px';
         div.style.fontSize = '12px';
         div.innerText = 'Vue Error: ' + error.message;
         document.body.appendChild(div);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('[Global Error]', event.error);
      if (document.body) {
         const div = document.createElement('div');
         div.style.position = 'fixed';
         div.style.bottom = '0';
         div.style.left = '0';
         div.style.right = '0';
         div.style.backgroundColor = 'darkred';
         div.style.color = 'white';
         div.style.zIndex = '999999';
         div.style.padding = '10px';
         div.style.fontSize = '12px';
         div.innerText = 'Global Error: ' + event.message;
         document.body.appendChild(div);
      }
    });
  }
});
