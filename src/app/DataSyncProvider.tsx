import { createContext, useEffect } from 'react';
import Toast from 'react-native-toast-message';

import { useEnsureNetwork } from '@react-native-hello/ui';
import { useClubs } from 'lib/clubs';
import { useAppToastProps } from 'lib/toast';
import { store } from 'store';

type ContextType = {
  syncAll: () => Promise<void> | void;
  syncClubs: () => Promise<void> | void;
};

export const DataSyncContext = createContext<ContextType>({
  syncAll: async () => {
    return;
  },
  syncClubs: async () => {
    return;
  },
});

export function DataSyncProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appToastProps = useAppToastProps();
  const clubs = useClubs({ suppressErrors: true });
  const { ensureNetwork, isInternetReachable } = useEnsureNetwork();

  // Avoid re-render on biometrics settings change (no useSelector).
  const biometrics = store.getState().appSettings.biometrics;

  // Kickoff appropriate sync.
  useEffect(() => {
    if (isInternetReachable) {
      syncAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInternetReachable]);

  const syncAll = async () => {
    Promise.all([syncClubs()]);
  };

  const syncClubs = () => {
    if (!biometrics) Toast.show(appToastProps.syncingClubs);
    return ensureNetwork(() => {
      return Promise.all([clubs.get()])
        .then(() => {
          Toast.hide();
          return;
        })
        .finally(() => {
          Toast.hide();
          return;
        });
    });
  };

  return (
    <DataSyncContext.Provider
      value={{
        syncAll,
        syncClubs,
      }}>
      {children}
    </DataSyncContext.Provider>
  );
}
