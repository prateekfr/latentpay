export interface DeviceFlowStart {
  deviceCode: string;
  userCode: string;
  verificationUrl: string;
  expiresInSeconds: number;
  pollIntervalMs: number;
}

export type DeviceFlowPollResult =
  | { status: "pending" }
  | { status: "approved"; token: string }
  | { status: "expired" };

/** Kick off the OAuth-style device authorization flow: the backend mints a
 *  short display code + a secret device code and returns a browser URL to
 *  open. `fetchImpl` is injectable for tests; never throws — a failed
 *  request resolves to null so callers can show a clear error instead of an
 *  unhandled rejection. */
export async function startDeviceFlow(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DeviceFlowStart | null> {
  try {
    const res = await fetchImpl(`${baseUrl}/api/v1/auth/device/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientKind: "ide" }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Partial<DeviceFlowStart>;
    if (!json.deviceCode || !json.userCode || !json.verificationUrl) return null;
    return {
      deviceCode: json.deviceCode,
      userCode: json.userCode,
      verificationUrl: json.verificationUrl,
      expiresInSeconds: json.expiresInSeconds ?? 600,
      pollIntervalMs: json.pollIntervalMs ?? 2000,
    };
  } catch {
    return null;
  }
}

/** Single poll of the device flow's status. Never throws — a network error
 *  is reported as "pending" so a transient blip doesn't abort the wait
 *  loop; the caller's own timeout still bounds how long it waits. */
export async function pollDeviceFlow(
  baseUrl: string,
  deviceCode: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DeviceFlowPollResult> {
  try {
    const res = await fetchImpl(`${baseUrl}/api/v1/auth/device/poll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceCode }),
    });
    if (!res.ok) return { status: "pending" };
    const json = (await res.json()) as { status?: string; token?: string };
    if (json.status === "approved" && json.token) {
      return { status: "approved", token: json.token };
    }
    if (json.status === "expired") return { status: "expired" };
    return { status: "pending" };
  } catch {
    return { status: "pending" };
  }
}
