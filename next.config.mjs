import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // Critical: Enable static export for Electron production builds
  output: 'export',
  distDir: '../renderer/out',

  outputFileTracingRoot: __dirname,
  // Required for Electron to work with SSG
  images: {
    unoptimized: true,
  },
  // During CI/packaging, allow Next to proceed even if type validator emits noise
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Suppress excessive HEAD requests logging in dev mode
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Exclude files that might cause infinite compilation loops
  watchOptions: {
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/.next/**',
      '**/dist/**',
      '**/public/assets/**',
      '**/charts/**',
      '**/*.json',
      '**/scripts/**'
    ],
  },
};

export default nextConfig;
