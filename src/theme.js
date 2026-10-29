import { useCallback, useLayoutEffect, useRef, useState } from 'react';
const storageKey = 'jn-archive-theme';
function initialTheme() {
  try { const saved = localStorage.getItem(storageKey); if (saved === 'day' || saved === 'night') return saved; } catch { /* Storage is optional. */ }
  return 'night';
}
export function useArchiveTheme() {
  const [theme, setTheme] = useState(initialTheme);
  const timer = useRef(0);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'night' ? 'dark' : 'light';
    try { localStorage.setItem(storageKey, theme); } catch { /* Private browsing may deny storage. */ }
  }, [theme]);
  useLayoutEffect(() => () => { clearTimeout(timer.current); document.documentElement.classList.remove('theme-switching'); }, []);
  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    clearTimeout(timer.current);
    root.classList.remove('theme-switching');
    if (!reduced) {
      // Restart the brief exposure wash on successive physical switch clicks.
      void root.offsetWidth;
      root.classList.add('theme-switching');
      timer.current = setTimeout(() => root.classList.remove('theme-switching'), 1150);
    }
    setTheme(current => current === 'night' ? 'day' : 'night');
  }, []);
  return { theme, toggleTheme };
}
