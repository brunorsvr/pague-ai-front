type EnvironmentConfig = {
  apiBaseUrl: string;
  debtsEndpoint: string;
};

const metaEnv = import.meta.env ?? {};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function normalizeEndpoint(path: string) {
  if (!path) return '/debts';
  return path.startsWith('/') ? path : `/${path}`;
}

const rawApiBaseUrl = metaEnv['NG_APP_API_BASE_URL'] ?? 'http://localhost:8000';
const rawDebtsEndpoint = metaEnv['NG_APP_DEBTS_ENDPOINT'] ?? '/debts';

export const environment: EnvironmentConfig = {
  apiBaseUrl: normalizeBaseUrl(rawApiBaseUrl),
  debtsEndpoint: normalizeEndpoint(rawDebtsEndpoint)
};
