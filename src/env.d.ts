/// <reference types="astro/client" />
declare global {
  interface Window {
    __showToast?: (msg: string, duration?: number) => void;
  }
}

export {};
