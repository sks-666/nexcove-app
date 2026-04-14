/** @format */

const stats = {
  total: 0,
  success: 0,
  failure: 0,
  byType: {},
  byEndpoint: {},
};

const endpointKey = url => {
  if (!url) {
    return 'unknown';
  }

  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    return String(url);
  }
};

const increment = (bucket, key) => {
  bucket[key] = (bucket[key] || 0) + 1;
};

const track = ({ url, errorType }) => {
  stats.total += 1;

  if (errorType) {
    stats.failure += 1;
    increment(stats.byType, errorType);
  } else {
    stats.success += 1;
  }

  increment(stats.byEndpoint, endpointKey(url));
};

const snapshot = () => ({
  total: stats.total,
  success: stats.success,
  failure: stats.failure,
  byType: { ...stats.byType },
  byEndpoint: { ...stats.byEndpoint },
});

const NetworkTelemetry = {
  track,
  snapshot,
};

export default NetworkTelemetry;
