export interface Historique {
  id: string;
  text: string;
  preview: string;
  risk: 'Low' | 'Medium' | 'High';
  stability: number;
  trend: string;
  dominant: string;
  goals: string;
}

export const store = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("SessionStorage error", e);
    }
  },
  remove: (key: string) => {
    sessionStorage.removeItem(key);
  }
};
