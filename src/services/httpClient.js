/** @format */

import NetworkTelemetry from './NetworkTelemetry';

const RETRYABLE_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const createRequestId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const sanitizeHeaders = headers => {
  const result = {};

  Object.keys(headers || {}).forEach(key => {
    const lower = key.toLowerCase();
    result[key] =
      lower.includes('authorization') || lower.includes('cookie')
        ? '***'
        : headers[key];
  });

  return result;
};

const shouldRetry = ({ status, errorType }) => {
  if (errorType === 'NETWORK_ERROR' || errorType === 'TIMEOUT_ERROR') {
    return true;
  }

  if (status && RETRYABLE_HTTP_STATUSES.has(status)) {
    return true;
  }

  return false;
};

const toError = ({
  type,
  message,
  url,
  method,
  status = null,
  responseSnippet = null,
  details = null,
  requestId,
}) => ({
  type,
  message,
  url,
  method,
  status,
  requestId,
  responseSnippet,
  details,
});

const logHttp = entry => {
  if (!__DEV__) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log('[httpClient]', entry);
};

const safeParseJson = async response => {
  const rawText = await response.text();

  if (!rawText) {
    return { parsed: null, rawText: '' };
  }

  try {
    return {
      parsed: JSON.parse(rawText),
      rawText,
    };
  } catch {
    return {
      parsed: null,
      rawText,
      parseError: true,
    };
  }
};

export const httpClient = async (
  url,
  {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = 15000,
    retries = 2,
    retryDelayMs = 500,
    parseJson = true,
  } = {},
) => {
  const requestId = createRequestId();
  const normalizedMethod = String(method || 'GET').toUpperCase();

  for (let attempt = 0; attempt <= retries; attempt++) {
    const startedAt = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      logHttp({
        stage: 'request:start',
        requestId,
        url,
        method: normalizedMethod,
        attempt,
        headers: sanitizeHeaders(headers),
      });

      const response = await fetch(url, {
        method: normalizedMethod,
        headers,
        body,
        signal: controller.signal,
      });

      const durationMs = Date.now() - startedAt;
      const { parsed, rawText, parseError } = await safeParseJson(response);

      const meta = {
        requestId,
        url,
        method: normalizedMethod,
        attempt,
        retries,
        timeoutMs,
        durationMs,
      };

      logHttp({
        stage: 'request:end',
        requestId,
        url,
        method: normalizedMethod,
        status: response.status,
        durationMs,
        attempt,
      });

      if (!response.ok) {
        const error = toError({
          type: 'HTTP_ERROR',
          message: `HTTP ${response.status}`,
          url,
          method: normalizedMethod,
          status: response.status,
          requestId,
          responseSnippet: rawText?.slice(0, 300),
          details: { attempt, durationMs },
        });

        if (attempt < retries && shouldRetry({ status: response.status })) {
          await wait(retryDelayMs * Math.pow(2, attempt));
          continue;
        }

        NetworkTelemetry.track({ url, errorType: error.type });
        return { data: null, error, status: response.status, meta };
      }

      if (parseJson && parseError) {
        const error = toError({
          type: 'PARSE_ERROR',
          message: 'Response parse failed',
          url,
          method: normalizedMethod,
          status: response.status,
          requestId,
          responseSnippet: rawText?.slice(0, 300),
          details: { attempt, durationMs },
        });

        NetworkTelemetry.track({ url, errorType: error.type });
        return { data: null, error, status: response.status, meta };
      }

      NetworkTelemetry.track({ url, errorType: null });
      return {
        data: parseJson ? parsed : rawText,
        error: null,
        status: response.status,
        meta,
      };
    } catch (err) {
      const durationMs = Date.now() - startedAt;
      const errorType = err?.name === 'AbortError' ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR';

      const meta = {
        requestId,
        url,
        method: normalizedMethod,
        attempt,
        retries,
        timeoutMs,
        durationMs,
      };

      const error = toError({
        type: errorType,
        message:
          errorType === 'TIMEOUT_ERROR'
            ? 'The server took too long to respond'
            : 'Network request failed',
        url,
        method: normalizedMethod,
        requestId,
        details: {
          attempt,
          durationMs,
          cause: String(err?.message || err),
        },
      });

      logHttp({
        stage: 'request:error',
        requestId,
        url,
        method: normalizedMethod,
        attempt,
        error,
      });

      if (attempt < retries && shouldRetry({ errorType })) {
        await wait(retryDelayMs * Math.pow(2, attempt));
        continue;
      }

      NetworkTelemetry.track({ url, errorType: error.type });
      return { data: null, error, status: null, meta };
    } finally {
      clearTimeout(timer);
    }
  }

  const fallbackMeta = {
    requestId,
    url,
    method: normalizedMethod,
    attempt: retries,
    retries,
    timeoutMs,
    durationMs: null,
  };

  const fallbackError = toError({
      type: 'NETWORK_ERROR',
      message: 'Request failed after retries',
      url,
      method: normalizedMethod,
      requestId,
      details: { retries },
    });

  NetworkTelemetry.track({ url, errorType: fallbackError.type });

  return {
    data: null,
    error: fallbackError,
    status: null,
    meta: fallbackMeta,
  };
};

export default httpClient;
