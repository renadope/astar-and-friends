import { useEffect } from 'react';

type Shortcut = {
  key: string;
  callback: () => void;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

export function useShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (let i = 0; i < shortcuts.length; i++) {
        const {
          key,
          callback,
          ctrlKey = false,
          metaKey = false,
          altKey = false,
          shiftKey = false,
        } = shortcuts[i];
        const firedCmd =
          event.key === key &&
          event.ctrlKey === ctrlKey &&
          event.metaKey === metaKey &&
          event.altKey === altKey &&
          event.shiftKey === shiftKey;

        if (firedCmd) {
          event.preventDefault();
          callback();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
