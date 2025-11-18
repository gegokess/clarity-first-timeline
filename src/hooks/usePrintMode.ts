import { useEffect, useState } from 'react';

const PRINT_MODE_EVENT = 'print-mode-change';

/**
 * React hook to detect when the application switches into print/export mode.
 * Export helpers toggle the `print-mode` class on the body and we listen for the
 * custom event so components (Timeline) can adapt styling values.
 */
export function usePrintMode(): boolean {
  const getInitialState = () =>
    typeof document !== 'undefined' ? document.body.classList.contains('print-mode') : false;

  const [isPrintMode, setIsPrintMode] = useState(getInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleCustomEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ active: boolean }>).detail;
      if (detail && typeof detail.active === 'boolean') {
        setIsPrintMode(detail.active);
      }
    };

    const mediaQuery = window.matchMedia ? window.matchMedia('print') : null;
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsPrintMode(event.matches);
    };

    window.addEventListener(PRINT_MODE_EVENT, handleCustomEvent as EventListener);
    if (mediaQuery) {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaChange);
      } else {
        mediaQuery.addListener(handleMediaChange);
      }
    }

    return () => {
      window.removeEventListener(PRINT_MODE_EVENT, handleCustomEvent as EventListener);
      if (mediaQuery) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleMediaChange);
        } else {
          mediaQuery.removeListener(handleMediaChange);
        }
      }
    };
  }, []);

  return isPrintMode;
}
