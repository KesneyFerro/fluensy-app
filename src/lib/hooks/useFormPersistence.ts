import { useEffect, useState } from "react";

/**
 * Hook to persist form data in localStorage and restore it on component mount.
 * This prevents data loss during navigation or accidental page refreshes.
 */
export function useFormPersistence<T>(
  key: string,
  initialData: T,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T>(initialData);
  const [isRestored, setIsRestored] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
      } catch (error) {
        console.error("Failed to restore form data:", error);
      }
    }
    setIsRestored(true);
  }, [key]);

  // Save to localStorage whenever data changes (after restoration)
  useEffect(() => {
    if (isRestored) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [key, data, isRestored]);

  // Update data when dependencies change (like userProfile updates)
  useEffect(() => {
    if (isRestored && dependencies.length > 0) {
      setData(initialData);
    }
  }, dependencies);

  // Clear persisted data
  const clearPersistedData = () => {
    localStorage.removeItem(key);
  };

  return {
    data,
    setData,
    clearPersistedData,
    isRestored,
  };
}
