import { useSyncExternalStore } from 'react';
import { installPlatform, subscribeInstall, type InstallPlatform } from '../services/install';

export function useInstallPlatform(): InstallPlatform {
  return useSyncExternalStore(subscribeInstall, installPlatform, () => 'unsupported' as InstallPlatform);
}
