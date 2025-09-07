// src/renderer/global.d.ts
// Ensures the renderer (Next.js) project sees the Electron preload typings

import type { IpcApi } from '../../types/ipc';

declare global {
  interface Window {
    electron: IpcApi & {
      handlePinPress: (currentTimeSec?: number) => void;
      loadAsset: (assetPath: string) => Promise<ArrayBuffer>;
      assetExists: (assetPath: string) => Promise<boolean>;
    };
  }
}

export { };
