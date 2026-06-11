import { normalizeUsagePayload, type UsageEvent } from './usageNormalizer.js';

export interface ProviderProxyConfig {
  enabled: boolean;
  providerId: string;
  upstreamBaseUrl: string;
  apiKey: string;
  model: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const stringFrom = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const normalizeProviderProxyConfig = (value: unknown): ProviderProxyConfig => {
  const candidate = isRecord(value) ? value : {};
  const upstreamBaseUrl = stringFrom(candidate.upstreamBaseUrl).replace(/\/+$/g, '');
  const apiKey = stringFrom(candidate.apiKey);
  const model = stringFrom(candidate.model);

  return {
    enabled: Boolean(candidate.enabled) && Boolean(upstreamBaseUrl) && Boolean(model) && Boolean(apiKey),
    providerId: stringFrom(candidate.providerId) || 'openai-compatible',
    upstreamBaseUrl,
    apiKey,
    model,
  };
};

export const buildUpstreamUrl = (upstreamBaseUrl: string, localPath: string): string => {
  const normalizedBaseUrl = upstreamBaseUrl.replace(/\/+$/g, '');
  const pathWithoutLocalVersion = localPath.replace(/^\/v1\/?/, '/');
  return `${normalizedBaseUrl}${pathWithoutLocalVersion.startsWith('/') ? pathWithoutLocalVersion : `/${pathWithoutLocalVersion}`}`;
};

export const shouldUseConfiguredApiKey = (authorizationHeader: string | undefined): boolean => {
  if (!authorizationHeader) {
    return true;
  }

  return authorizationHeader.toLowerCase() === 'bearer token-shredder-local';
};

export const extractUsageEventFromUpstreamResponse = (
  json: unknown,
  requestBody: unknown,
  source: string,
): UsageEvent | null => {
  if (!isRecord(json) || !isRecord(json.usage)) {
    return null;
  }

  const request = isRecord(requestBody) ? requestBody : {};
  const scenarioName = stringFrom(json.model) || stringFrom(request.model) || 'OpenAI-compatible proxy request';

  return normalizeUsagePayload({
    source,
    scenarioName,
    usage: json.usage,
  });
};

export const extractAssistantText = (json: unknown): string => {
  if (!isRecord(json)) {
    return '';
  }

  const choices = Array.isArray(json.choices) ? json.choices : [];
  const firstChoice = isRecord(choices[0]) ? choices[0] : {};
  const message = isRecord(firstChoice.message) ? firstChoice.message : {};
  const textContent = stringFrom(firstChoice.text);
  const messageContent = message.content;

  if (typeof messageContent === 'string') {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((part) => {
        if (!isRecord(part)) {
          return '';
        }

        return stringFrom(part.text) || stringFrom(part.content);
      })
      .filter(Boolean)
      .join('\n');
  }

  return textContent;
};
