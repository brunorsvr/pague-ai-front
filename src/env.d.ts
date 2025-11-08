interface ImportMetaEnv {
  readonly NG_APP_API_BASE_URL?: string;
  readonly NG_APP_DEBTS_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
