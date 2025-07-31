// vite-env.d.ts
/// <reference types="vite/client" />

declare interface ImportMeta {
  glob<T = any>(pattern: string, options?: { eager?: boolean }): Record<string, () => Promise<T>>;
  globEager<T = any>(pattern: string): Record<string, T>;
}