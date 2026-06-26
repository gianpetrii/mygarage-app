import * as React from 'react';
import { AppState, type AppStateStatus } from 'react-native';

let NetInfo: typeof import('@react-native-community/netinfo').default | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  NetInfo = null;
}

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = React.useState(true);

  React.useEffect(() => {
    if (!NetInfo) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (!NetInfo) return;
    const onChange = (status: AppStateStatus) => {
      if (status === 'active') {
        NetInfo?.fetch().then((state) => setIsConnected(state.isConnected ?? true));
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  return { isConnected, isOffline: !isConnected };
}
