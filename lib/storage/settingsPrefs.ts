/** Local demo preferences for notifications / 2FA / messaging privacy / language */

const NOTIF_KEY = "evolve.settings.notifications";
const TWO_FA_KEY = "evolve.settings.twoFa";
const MESSAGE_PRIVACY_KEY = "evolve.settings.messagePrivacy";
const LANGUAGE_KEY = "evolve.settings.language";

export type NotificationPrefs = {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  messages: boolean;
  stories: boolean;
};

export type MessagePrivacy = "everyone" | "followers" | "none";

const DEFAULT_NOTIFS: NotificationPrefs = {
  likes: true,
  comments: true,
  follows: true,
  messages: true,
  stories: true,
};

function canUse() {
  return typeof window !== "undefined";
}

export const settingsPrefs = {
  getNotifications(): NotificationPrefs {
    if (!canUse()) return { ...DEFAULT_NOTIFS };
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (!raw) return { ...DEFAULT_NOTIFS };
      return { ...DEFAULT_NOTIFS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_NOTIFS };
    }
  },

  setNotifications(prefs: NotificationPrefs) {
    if (!canUse()) return;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
  },

  getTwoFa(): boolean {
    if (!canUse()) return false;
    return localStorage.getItem(TWO_FA_KEY) === "1";
  },

  setTwoFa(on: boolean) {
    if (!canUse()) return;
    localStorage.setItem(TWO_FA_KEY, on ? "1" : "0");
  },

  getMessagePrivacy(): MessagePrivacy {
    if (!canUse()) return "followers";
    const v = localStorage.getItem(MESSAGE_PRIVACY_KEY);
    if (v === "everyone" || v === "followers" || v === "none") return v;
    return "followers";
  },

  setMessagePrivacy(v: MessagePrivacy) {
    if (!canUse()) return;
    localStorage.setItem(MESSAGE_PRIVACY_KEY, v);
  },

  getLanguage(): string {
    if (!canUse()) return "en";
    return localStorage.getItem(LANGUAGE_KEY) || "en";
  },

  setLanguage(code: string) {
    if (!canUse()) return;
    localStorage.setItem(LANGUAGE_KEY, code);
  },
};
