# Nexcove (Expo SDK 48 / RN 0.71) — Production Network Timeout Debug & Stabilization Plan

## 0) What I found in the current codebase (high-impact)

1. `src/common/Config.js` still contains legacy demo endpoints (`https://mstore.io/`) and even one plain HTTP page (`http://inspireui.com`), which is a red flag for wrong base URL / mixed-content mistakes after rebranding or environment swaps.
2. `src/Omni.js` has a generic `request()` helper that always attempts `response.json()` and catches all failures into `{ error: err }` without structured classification.
3. `src/services/CustomAPI.js` swallows network exceptions in `.catch()` blocks and can return `undefined`, making upper layers emit generic “Unknown error” messages.
4. NetInfo integration is partial: `Router.js` only fetches connection once at startup, while `MyNetInfo` listeners are commented out.

Those four points are enough to produce recurring “Unknown error: The request timed out.” in production.

---

## 1) Dependency audit (Expo SDK 48 + RN 0.71.14)

### A. Likely-safe core alignment for SDK 48
- `expo ~48.0.18` + `react-native 0.71.14` + `react 18.2.0` are compatible for a stabilized SDK 48 app.
- Navigation stack versions are within expected generation for RN 0.71-era apps.

### B. Outdated / risky / deprecated dependencies to prioritize

#### Highest risk (can break runtime or long-term stability)
- `expo-facebook` is legacy/deprecated in modern Expo workflows. Replace with `expo-auth-session` + Facebook OAuth flow.
- `react-native-restart` is not Expo-managed friendly in many scenarios (often needs native config; brittle after upgrades).
- GitHub URL dependencies:
  - `react-native-drawer`
  - `react-native-fluid-slider`
  - `react-native-scrollable-tab-view`
  These are supply-chain and maintainability risks (no deterministic maintenance, no Expo compatibility guarantees, possible unpinned commits).
- `react-native-render-html@4.2.4` is very old vs modern API/security fixes.
- `wpapi@1.2.2` and `api-ecommerce` wrapper introduce abstraction opacity; difficult to inspect timeout/auth internals.

#### Medium risk (technical debt / migration blockers)
- `moment` (large, legacy; prefer `dayjs` or `date-fns`).
- `react-redux@7.2.6` / `redux-thunk` legacy style (works, but modernization to Redux Toolkit improves predictability and error handling).
- `babel-eslint` legacy.

#### Network-specific risk patterns
- `queryStringAuth: true` in Woo worker initialization may expose keys in URL query and interact poorly with some proxies/WAFs.
- Multiple request paths (`fetch` direct, `api-ecommerce`, custom services) can produce inconsistent timeout and error parsing behavior.

---

## 2) Most likely root causes of “Unknown error: The request timed out” in this stack

1. **Wrong or inconsistent API base URL (or stale config)**
   - App config still references `mstore.io`; if production endpoints changed, some calls may silently target incorrect hosts.
2. **Server-side latency / WAF / rate limit on WooCommerce endpoints**
   - Heavy Woo endpoints (`products`, `checkout`, `shipping`, auth) can exceed mobile timeout windows.
3. **Error handling swallows original exception**
   - `CustomAPI` catches and discards detailed errors; upstream can only show generic “unknown error.”
4. **HTTP vs HTTPS / Android cleartext restrictions**
   - Any non-HTTPS endpoint can fail on Android release builds depending on security config.
5. **TLS or certificate chain issues**
   - Expired intermediate cert, SNI/CDN mismatch, or regional DNS failures show as timeout/network errors in RN fetch.
6. **Auth/token failure misreported as timeout**
   - Proxy or plugin can return delayed HTML/redirect/login challenge that the app parses incorrectly.
7. **Release-vs-dev differences**
   - Expo Go/dev may be more permissive; EAS production build + real transport + minified logs exposes latent issues.

---

## 3) Isolation matrix: frontend vs native env vs backend vs auth

Run these in order for each failing endpoint:

1. **Backend direct check (outside app)**
   - `curl -v` the exact endpoint from local machine and from a server in same region as users.
   - If slow/failing here, issue is backend/DNS/TLS/WAF.
2. **Frontend transport check (inside app, no business logic)**
   - Call a minimal health URL with raw `fetch` + strict timeout wrapper.
   - If health works but checkout fails, issue is endpoint-specific payload/auth.
3. **Auth check**
   - Compare unauthenticated vs authenticated calls, inspect headers and status codes.
4. **Environment check**
   - Test same build in Expo Go, dev client, and release APK/IPA.
   - If only release fails, inspect Android cleartext/TLS, minification, environment variables.

---

## 4) Production-grade network wrapper (drop-in blueprint)

Create `src/services/httpClient.js`:

```js
import NetInfo from '@react-native-community/netinfo';

const DEFAULT_TIMEOUT_MS = 15000;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const toErrorShape = ({
  type,
  message,
  url,
  method,
  status,
  code,
  attempt,
  elapsedMs,
  requestId,
  responseText,
  cause,
}) => ({
  ok: false,
  error: {
    type,
    message,
    url,
    method,
    status,
    code,
    attempt,
    elapsedMs,
    requestId,
    responseText,
    cause: cause ? String(cause) : undefined,
  },
});

const parseJsonSafe = async response => {
  const text = await response.text();
  try {
    return { data: text ? JSON.parse(text) : null, rawText: text };
  } catch {
    return { data: null, rawText: text };
  }
};

export async function httpRequest(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = 2,
    retryDelayMs = 400,
    requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    return toErrorShape({
      type: 'OFFLINE',
      message: 'No internet connection',
      url,
      method,
      requestId,
    });
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      const elapsedMs = Date.now() - start;
      const { data, rawText } = await parseJsonSafe(response);

      if (response.ok) {
        return {
          ok: true,
          data,
          meta: {
            status: response.status,
            elapsedMs,
            requestId,
            url,
            method,
            attempt,
          },
        };
      }

      const retryable = RETRYABLE_STATUS.has(response.status);
      if (retryable && attempt < retries) {
        await sleep(retryDelayMs * Math.pow(2, attempt));
        continue;
      }

      return toErrorShape({
        type: 'HTTP_ERROR',
        message: `HTTP ${response.status}`,
        url,
        method,
        status: response.status,
        attempt,
        elapsedMs,
        requestId,
        responseText: rawText?.slice(0, 500),
      });
    } catch (err) {
      const elapsedMs = Date.now() - start;
      const isAbort = err?.name === 'AbortError';
      const retryable = isAbort || /network request failed/i.test(String(err));

      if (retryable && attempt < retries) {
        await sleep(retryDelayMs * Math.pow(2, attempt));
        continue;
      }

      return toErrorShape({
        type: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isAbort
          ? `Request timed out after ${timeoutMs}ms`
          : `Network failure: ${String(err?.message || err)}`,
        url,
        method,
        code: err?.code,
        attempt,
        elapsedMs,
        requestId,
        cause: err,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  return toErrorShape({
    type: 'UNKNOWN',
    message: 'Unexpected network state',
    url,
    method,
  });
}
```

Usage example:

```js
import { httpRequest } from './httpClient';

export async function fetchProducts() {
  const res = await httpRequest(`${API_BASE}/wp-json/wc/v3/products`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    timeoutMs: 15000,
    retries: 2,
  });

  if (!res.ok) {
    // show actionable UI error
    throw new Error(
      `[${res.error.type}] ${res.error.message} (requestId=${res.error.requestId})`,
    );
  }

  return res.data;
}
```

---

## 5) Replace “Unknown error” with deterministic messages

Map errors to user + ops messages:

- `OFFLINE` → “No internet connection. Check Wi‑Fi or mobile data.”
- `TIMEOUT` → “Server is taking too long to respond. Please retry.”
- `HTTP_ERROR 401/403` → “Session expired. Please log in again.”
- `HTTP_ERROR 429` → “Too many requests. Please wait a moment.”
- `HTTP_ERROR 5xx` → “Store service temporarily unavailable.”
- `NETWORK_ERROR` → “Network handshake failed. Check VPN/firewall or try later.”

Also attach `requestId`, `url`, `status`, and `elapsedMs` in logs for every failed request.

---

## 6) NetInfo production pattern

- Subscribe globally once in app bootstrap.
- Persist latest state in Redux.
- Block expensive requests if `!isConnected`.
- Show a non-blocking offline banner + queue optional retries when connectivity is restored.

Skeleton:

```js
import NetInfo from '@react-native-community/netinfo';

let unsubscribe;

export const startNetworkListener = dispatch => {
  unsubscribe = NetInfo.addEventListener(state => {
    dispatch({
      type: 'NETINFO_UPDATE',
      payload: {
        isConnected: !!state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      },
    });
  });
};

export const stopNetworkListener = () => unsubscribe?.();
```

---

## 7) Stay on SDK 48 now, or upgrade immediately?

## Recommendation
**Stabilize on SDK 48 first (1–2 sprints), then upgrade.**

### Why
- Current issue is likely config + request/error architecture, not only package age.
- Upgrading during unresolved transport bugs can multiply variables.
- Ecommerce production reliability benefits from isolation first, migration second.

### Tradeoff
- Staying on 48 longer increases ecosystem staleness/security debt.
- But immediate major upgrade (48 → modern SDK) while network stack is unstable risks longer incident duration.

### Practical path
1. Freeze features.
2. Implement unified `httpClient` + structured errors + endpoint telemetry.
3. Stabilize error rate and P95/P99 response time.
4. Then perform staged Expo upgrades (one SDK step at a time with EAS preview builds).

---

## 8) Debugging checklist (fastest/highest-probability first)

1. Verify actual runtime API base URL at app startup log (prod + dev).
2. `curl -v` failing endpoint (same URL, headers, auth) and record TLS + total time.
3. Test same endpoint from device browser to rule out DNS/cert/firewall.
4. Add requestId + timing logs around every network call.
5. Replace generic fetch helpers with unified timeout + retry wrapper.
6. Confirm all API endpoints are HTTPS only.
7. For Android builds, confirm no HTTP endpoint is required (or explicitly allow only required cleartext domains if absolutely necessary).
8. Compare Expo Go vs EAS release behavior using same account and same API.
9. Inspect Woo/WordPress server logs (PHP-FPM slow log, Nginx/Apache upstream timeouts, WAF blocks).
10. Validate auth/token expiration and clock skew.
11. Load-test critical endpoints (`products`, `cart`, `checkout`, `shipping`) and enforce backend SLAs.
12. Add alerting for timeout rate and 5xx by endpoint.

---

## 9) Cleanup/refactor plan for old libs and GitHub dependencies

1. Remove/replace unmaintained GitHub dependencies with npm-maintained alternatives (one by one, with visual regression checks).
2. Replace `expo-facebook` with modern auth session approach.
3. Consolidate networking into one module (`httpClient` + domain services).
4. Decompose Woo API calls from UI; avoid direct API usage inside components.
5. Add runtime config per environment (dev/stage/prod) and strict validation at startup.
6. Add integration tests for auth refresh + checkout flow under slow network.

---

## 10) Exact terminal commands to validate + clean Expo environment

```bash
# 1) Dependency and Expo doctor
npx expo-doctor
npx expo install --check

# 2) Validate duplicates / risky package graph
npm ls --depth=1
npm outdated

# 3) Clean install
rm -rf node_modules package-lock.json yarn.lock
npm cache verify
npm install

# 4) Start with clean Metro cache
npx expo start -c

# 5) Build parity checks (development build + production preview)
eas build --profile development --platform android
eas build --profile preview --platform android

# 6) Runtime logs during reproduction
npx expo start --tunnel
adb logcat | rg -i "(network|ssl|okhttp|fetch|timeout|expo-updates|unknown error)"
```

(Use yarn equivalents if your CI is yarn-based; do not mix lockfiles in production pipeline.)

---

## 11) Most likely top-3 root causes, fastest fix path, long-term architecture

### Most likely 3 root causes
1. Swallowed/poorly classified fetch errors in custom helpers.
2. Endpoint/base URL mismatch or stale Woo/WordPress config.
3. Backend latency/timeout under real checkout/product load.

### Fastest fix path (48–72 hours)
1. Introduce unified `httpClient` wrapper with timeout + retry + typed errors.
2. Log and verify effective API base URL + requestId for all failing calls.
3. Benchmark and optimize top 3 slow Woo endpoints; raise server timeout budgets only where justified.

### Long-term stable architecture
- Single gateway/BFF layer in front of Woo/WordPress APIs.
- Mobile app talks to BFF with stable contracts, auth normalization, rate-limit handling, and observability.
- Expo app uses one typed service layer with standardized network policy and offline strategy.

---

## 12) Files needed next for pinpoint diagnosis (required)

Please provide these next so we can move from plan to exact patch-level fixes:

1. `app.json` / `app.config.js` (full Expo config, plugins, updates, runtimeVersion).
2. All network helpers and API service files (especially where timeout/unknown error is thrown).
3. Any `api-ecommerce` wrapper customization in project code.
4. Woo auth/token flow code (login, token store/refresh, request header injection).
5. EAS build profiles (`eas.json`) and environment variable setup.
6. Backend endpoint examples that fail (exact URL path patterns, not secrets).
7. A captured failing log with timestamp, endpoint, and stack trace from release build.
