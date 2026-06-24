/// <reference types="astro/client" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/vanillajs" />

declare global {
  interface Window {
    __showToast?: (msg: string, duration?: number) => void;
  }
}

export {};
