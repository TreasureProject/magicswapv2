/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: string;
  readonly VITE_ENABLE_TESTNETS: string;
  readonly VITE_THIRDWEB_CLIENT_ID: string;
  readonly VITE_WALLET_CONNECT_KEY: string;
  readonly VITE_DEFAULT_TOKEN_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly TROVE_API_URL: string;
      readonly TROVE_API_NETWORK: string;
      readonly TROVE_API_KEY: string;
    }
  }
}

export {};
