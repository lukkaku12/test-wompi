type ViteEnv = {
  VITE_API_BASE_URL?: string;
  VITE_PUBLIC_KEY?: string;
  VITE_BASE_URL?: string;
};

export function getEnv(): ViteEnv {
  // Tests (Jest) and runtime can both use this global.
  const fromGlobal = (globalThis as any).__VITE_ENV__ as ViteEnv | undefined;
  if (fromGlobal) return fromGlobal;

  // Fallbacks for Node/Jest if needed.
  return {
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
    VITE_PUBLIC_KEY: process.env.VITE_PUBLIC_KEY,
    VITE_BASE_URL: process.env.VITE_BASE_URL,
  };
}
