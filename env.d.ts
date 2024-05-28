/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

interface ImportMetaEnv {
  readonly VITE_ALCHEMY_KEY: string;
  readonly VITE_ENABLE_TESTNETS: string;
  readonly CHVITE_WALLET_CONNECT_KEYAIN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
