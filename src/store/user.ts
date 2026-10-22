/** Who is using the platform. Each user gets their own progress in localStorage. */
export const USERS = ['Vegard', 'Henrick'] as const;
const KEY = 'ieda-user';

export function getUser(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const u = localStorage.getItem(KEY);
    return u && (USERS as readonly string[]).includes(u) ? u : null;
  } catch {
    return null;
  }
}

/** switching user reloads so the progress store rehydrates from the right key */
export function switchUser(u: string | null) {
  try {
    if (u) localStorage.setItem(KEY, u);
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.location.hash = '#/';
  window.location.reload();
}

export function progressKey() {
  const u = getUser();
  return u ? `ieda3010-progress-${u.toLowerCase()}` : 'ieda3010-progress';
}

/** progress saved before user profiles existed belongs to Vegard */
export function migrateLegacyProgress() {
  try {
    const legacy = localStorage.getItem('ieda3010-progress');
    if (legacy && getUser() === 'Vegard' && !localStorage.getItem(progressKey())) localStorage.setItem(progressKey(), legacy);
  } catch {
    /* ignore */
  }
}
