"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "terraya-favorites";

type FavoritesContextValue = {
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  ready: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  isFavorite: () => false,
  toggle: () => {},
  remove: () => {},
  clear: () => {},
  ready: false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      /* ignore quota / disabled storage */
    }
  }, [favorites, ready]);

  const toggle = useCallback(
    (slug: string) =>
      setFavorites((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug])),
    []
  );
  const remove = useCallback((slug: string) => setFavorites((prev) => prev.filter((s) => s !== slug)), []);
  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);
  const clear = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggle, remove, clear, ready }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
