import {SESSION_DURATION_MS, TOKEN, TOKEN_EXPIRES_AT} from "../config/Config";

export const setSessionExpiry = (): number => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem(TOKEN_EXPIRES_AT, expiresAt.toString());
    return expiresAt;
};

export const getSessionExpiry = (): number | null => {
    const rawExpiry = localStorage.getItem(TOKEN_EXPIRES_AT);
    if (!rawExpiry) {
        return null;
    }
    const expiry = Number(rawExpiry);
    return Number.isFinite(expiry) ? expiry : null;
};

export const getRemainingSessionMs = (): number => {
    const expiry = getSessionExpiry();
    if (!expiry) {
        return 0;
    }
    return Math.max(0, expiry - Date.now());
};

export const isSessionExpired = (): boolean => {
    const expiry = getSessionExpiry();
    if (!expiry) {
        return true;
    }
    return Date.now() >= expiry;
};

export const clearSession = (): void => {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(TOKEN_EXPIRES_AT);
};
