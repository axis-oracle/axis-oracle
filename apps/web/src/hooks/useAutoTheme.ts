import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const THEME_STORAGE_KEY = 'theme';
const USER_PREFERENCE_KEY = 'theme-user-set';

/**
 * Hook that automatically sets theme based on user's local time
 * Dark theme: 6pm - 6am (18:00 - 06:00)
 * Light theme: 6am - 6pm (06:00 - 18:00)
 * 
 * User's manual choice is preserved and takes priority
 */
export const useAutoTheme = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    // Check if user has manually set a preference
    const userHasSetPreference = localStorage.getItem(USER_PREFERENCE_KEY) === 'true';
    
    if (userHasSetPreference) {
      // User has manually set their preference, don't override
      return;
    }

    // Auto-detect based on local time
    const hour = new Date().getHours();
    const isNightTime = hour >= 18 || hour < 6;
    const autoTheme = isNightTime ? 'dark' : 'light';

    // Only set if different from current
    if (theme !== autoTheme) {
      setTheme(autoTheme);
    }
  }, [setTheme, theme]);
};

/**
 * Call this when user manually toggles theme
 * to mark that they have a preference
 */
export const markUserThemePreference = () => {
  localStorage.setItem(USER_PREFERENCE_KEY, 'true');
};
