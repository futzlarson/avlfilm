/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import('./types/auth').AuthUser | null;
  }
}

interface Window {
  Rollbar?: {
    error: (message: string, error?: unknown) => void;
    warning: (message: string, error?: unknown) => void;
    info: (message: string, data?: unknown) => void;
  };
}
