/** @format */

const RETRYABLE_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetryNetworkError = err => {
  if (!err) {
    return false;
  }

  const msg = String(err.message || err).toLowerCase();
  return (
    err.name === 'AbortError' ||
    msg.includes('network request failed') ||
    msg.includes('timed out') ||
    msg.includes('timeout')
  );
};

const buildError = (
  type,
  message,
  { url, method, status = null, details = null, cause = null, attempt = 0 },
) => ({
  type,
  message,
  url,
  method,
  status,
  details,
  attempt,
  cause: cause ? String(cause.message || cause) : null,
});

const parseResponse = async response => {
  const rawBody = await response.text();

  if (!rawBody) {
    return { parsed: null, rawBody: '' };
  }

  try {
    return { parsed: JSON.parse(rawBody), rawBody };
  } catch (error) {
    throw {
      type: 'PARSE_ERROR',
      message: 'Response is not valid JSON',
      details: rawBody?.slice(0, 500),
      cause: error,
    };
  }
};

const logHttp = payload => {
  if (!__DEV__) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log('[httpClient]', payload);
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
  } = {},
) => {
  const sanitizedMethod = method.toUpperCase();

  for (let attempt = 0; attempt <= retries; attempt++) {
    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      logHttp({
        stage: 'request:start',
        url,
        method: sanitizedMethod,
        headers,
        attempt,
      });

      const response = await fetch(url, {
        method: sanitizedMethod,
        headers,
        body,
        signal: controller.signal,
      });

      const responseTimeMs = Date.now() - startedAt;
      const { parsed, rawBody } = await parseResponse(response);

      logHttp({
        stage: 'request:end',
        url,
        method: sanitizedMethod,
        status: response.status,
        responseTimeMs,
        attempt,
      });

      if (!response.ok) {
        const error = buildError('HTTP_ERROR', `HTTP ${response.status}`, {
          url,
          method: sanitizedMethod,
          status: response.status,
          details: rawBody?.slice(0, 500),
          attempt,
        });

        if (RETRYABLE_HTTP_STATUSES.has(response.status) && attempt < retries) {
          await sleep(retryDelayMs * Math.pow(2, attempt));
          continue;
        }

        return { data: null, error, status: response.status };
      }

      return { data: parsed, error: null, status: response.status };
    } catch (err) {
      const responseTimeMs = Date.now() - startedAt;
      const isAbortError = err?.name === 'AbortError';

      const error = isAbortError
        ? buildError('TIMEOUT_ERROR', `Request timed out after ${timeoutMs}ms`, {
            url,
            method: sanitizedMethod,
            details: { timeoutMs, responseTimeMs },
            cause: err,
            attempt,
          })
        : err?.type === 'PARSE_ERROR'
        ? buildError('PARSE_ERROR', err.message, {
            url,
            method: sanitizedMethod,
            details: err.details,
            cause: err.cause,
            attempt,
          })
        : buildError('NETWORK_ERROR', 'Network request failed', {
            url,
            method: sanitizedMethod,
            details: { responseTimeMs },
            cause: err,
            attempt,
          });

      logHttp({
        stage: 'request:error',
        url,
        method: sanitizedMethod,
        attempt,
        error,
      });

      if (shouldRetryNetworkError(err) && attempt < retries) {
        await sleep(retryDelayMs * Math.pow(2, attempt));
        continue;
      }

      return { data: null, error, status: error.status };
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    data: null,
    error: buildError('NETWORK_ERROR', 'Request failed after retries', {
      url,
      method: method.toUpperCase(),
      status: null,
    }),
    status: null,
  };
};

export default httpClient;
