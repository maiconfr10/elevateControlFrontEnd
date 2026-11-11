/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_AUTH_MODE?: 'api' | 'demo';
  readonly VITE_API_URL?: string;
}
interface ImportMeta {readonly env:ImportMetaEnv}
