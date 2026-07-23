import { useEffect, useCallback, useRef } from 'react';

const LOGIN_TIME_KEY = 'drmp_session_start';
const CHECK_INTERVAL_MS = 60 * 1000;

const SESSION_DURATIONS = {
  admin: 72 * 60 * 60 * 1000,
  user: 7 * 24 * 60 * 60 * 1000,
};

const getSessionDuration = (role) => SESSION_DURATIONS[role] || SESSION_DURATIONS.user;

const isSessionExpired = (loginTime, role) => {
  if (!loginTime) return true;
  const duration = getSessionDuration(role);
  return Date.now() - loginTime > duration;
};

const useSessionTimeout = (user, onExpire) => {
  const timerRef = useRef(null);

  const clearSessionTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startSessionTimer = useCallback(() => {
    clearSessionTimer();
    timerRef.current = setInterval(() => {
      if (user && isSessionExpired(Number(localStorage.getItem(LOGIN_TIME_KEY)), user.role)) {
        clearSessionTimer();
        onExpire?.();
      }
    }, CHECK_INTERVAL_MS);
  }, [user, onExpire, clearSessionTimer]);

  useEffect(() => {
    if (!user) {
      clearSessionTimer();
      return;
    }

    const loginTime = Number(localStorage.getItem(LOGIN_TIME_KEY));

    if (isSessionExpired(loginTime, user.role)) {
      onExpire?.();
      return;
    }

    startSessionTimer();

    return clearSessionTimer;
  }, [user, onExpire, startSessionTimer, clearSessionTimer]);

  const markLogin = useCallback(() => {
    localStorage.setItem(LOGIN_TIME_KEY, String(Date.now()));
  }, []);

  const getTimeRemaining = useCallback(() => {
    if (!user) return 0;
    const loginTime = Number(localStorage.getItem(LOGIN_TIME_KEY));
    if (!loginTime) return 0;
    const duration = getSessionDuration(user.role);
    const elapsed = Date.now() - loginTime;
    return Math.max(0, duration - elapsed);
  }, [user]);

  return { markLogin, getTimeRemaining };
};

export default useSessionTimeout;
