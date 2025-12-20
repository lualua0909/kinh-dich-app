/**
 * IndexedDB utility for storing large data
 * Used for storing hexagram meanings and other long content
 */

const DB_NAME = "KinhDichAppDB";
const DB_VERSION = 1;

// Store names
export const STORES = {
  HEXAGRAM_MEANINGS: "hexagramMeanings",
  // Add more stores here for future long content
} as const;

interface DBStore {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
}

const stores: DBStore[] = [
  {
    name: STORES.HEXAGRAM_MEANINGS,
    keyPath: "key",
  },
];

/**
 * Open or create the database
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      stores.forEach((store) => {
        if (!db.objectStoreNames.contains(store.name)) {
          db.createObjectStore(store.name, {
            keyPath: store.keyPath,
            autoIncrement: store.autoIncrement,
          });
        }
      });
    };
  });
}

/**
 * Get a value from a store by key
 */
export async function getValue<T>(
  storeName: string,
  key: string
): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? (result.value as T) : null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get value from ${storeName}`));
      };
    });
  } catch (error) {
    console.error("Error getting value from IndexedDB:", error);
    return null;
  }
}

/**
 * Set a value in a store
 */
export async function setValue<T>(
  storeName: string,
  key: string,
  value: T
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, value });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to set value in ${storeName}`));
      };
    });
  } catch (error) {
    console.error("Error setting value in IndexedDB:", error);
    throw error;
  }
}

/**
 * Set multiple values in a store (batch operation)
 */
export async function setMultipleValues<T>(
  storeName: string,
  entries: Array<{ key: string; value: T }>
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      entries.forEach((entry) => {
        store.put({ key: entry.key, value: entry.value });
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error(`Failed to set multiple values in ${storeName}`));
      };
    });
  } catch (error) {
    console.error("Error setting multiple values in IndexedDB:", error);
    throw error;
  }
}

/**
 * Get all values from a store
 */
export async function getAllValues<T>(
  storeName: string
): Promise<Record<string, T>> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const result: Record<string, T> = {};
        request.result.forEach((item: { key: string; value: T }) => {
          result[item.key] = item.value;
        });
        resolve(result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all values from ${storeName}`));
      };
    });
  } catch (error) {
    console.error("Error getting all values from IndexedDB:", error);
    return {};
  }
}

/**
 * Check if a store has data
 */
export async function hasData(storeName: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result > 0);
      };

      request.onerror = () => {
        reject(new Error(`Failed to count records in ${storeName}`));
      };
    });
  } catch (error) {
    console.error("Error checking data in IndexedDB:", error);
    return false;
  }
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}`));
      };
    });
  } catch (error) {
    console.error("Error clearing store in IndexedDB:", error);
    throw error;
  }
}

