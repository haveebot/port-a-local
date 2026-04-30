import { useEffect, useState } from "react";
import * as Network from "expo-network";

/**
 * Tracks whether the device has an internet connection. Optimistic by default
 * (assumes online until proven otherwise) so we don't flash an offline banner
 * during the initial reachability check.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Network.getNetworkStateAsync()
      .then((state) => {
        if (!cancelled) {
          setOnline(state.isConnected !== false && state.isInternetReachable !== false);
        }
      })
      .catch(() => {
        /* keep optimistic default on first-load error */
      });

    const sub = Network.addNetworkStateListener((state) => {
      setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return online;
}
