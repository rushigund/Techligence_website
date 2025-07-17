/**
 * Checks if the application is running in demo mode based on an environment variable.
 * @returns {boolean} - True if in demo mode, false otherwise.
 */
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === "true";
};