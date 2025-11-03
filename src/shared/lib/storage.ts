/**
 * LocalStorage wrapper utilities
 */

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage (key: ${key}):`, error);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
    return null;
  } catch (error) {
    console.error(`Failed to load from localStorage (key: ${key}):`, error);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from localStorage (key: ${key}):`, error);
  }
}
