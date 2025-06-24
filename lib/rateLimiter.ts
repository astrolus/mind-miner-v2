interface UserRequestData {
  minute_timestamps: number[]; // Timestamps of requests within the last minute
  daily_count: number;
  last_day_reset: number; // Timestamp of the last daily reset
}

const userRequestMap = new Map<string, UserRequestData>();

const MINUTE_LIMIT = 15;
const DAILY_LIMIT = 1000;
const ONE_MINUTE_MS = 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function checkAndApplyRateLimit(userId: string): { allowed: boolean; retryAfter?: number; message?: string } {
  const now = Date.now();
  let userData = userRequestMap.get(userId);

  if (!userData) {
    userData = {
      minute_timestamps: [],
      daily_count: 0,
      last_day_reset: now,
    };
    userRequestMap.set(userId, userData);
  }

  // Clean up old minute timestamps
  userData.minute_timestamps = userData.minute_timestamps.filter(
    (timestamp) => now - timestamp < ONE_MINUTE_MS
  );

  // Reset daily count if a new day has started
  // Note: This simple check assumes the server runs continuously. For robust daily limits across restarts/scaling,
  // you'd need a persistent store (e.g., Redis) and a more sophisticated date-based reset.
  if (now - userData.last_day_reset >= ONE_DAY_MS) {
    userData.daily_count = 0;
    userData.last_day_reset = now;
  }

  // Check minute limit
  if (userData.minute_timestamps.length >= MINUTE_LIMIT) {
    const oldestTimestamp = userData.minute_timestamps[0];
    const retryAfter = (oldestTimestamp + ONE_MINUTE_MS - now) / 1000; // in seconds
    return {
      allowed: false,
      retryAfter: Math.ceil(retryAfter),
      message: `Too many requests. Please try again in ${Math.ceil(retryAfter)} seconds.`,
    };
  }

  // Check daily limit
  if (userData.daily_count >= DAILY_LIMIT) {
    const retryAfter = (userData.last_day_reset + ONE_DAY_MS - now) / 1000; // in seconds
    return {
      allowed: false,
      retryAfter: Math.ceil(retryAfter),
      message: `Daily limit exceeded. Please try again in ${Math.ceil(retryAfter / 3600)} hours.`,
    };
  }

  // If allowed, apply the request
  userData.minute_timestamps.push(now);
  userData.daily_count++;

  return { allowed: true };
}