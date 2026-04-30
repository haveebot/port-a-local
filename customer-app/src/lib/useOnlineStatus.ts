import { useEffect, useState } from "react";
import * as Network from "expo-network";

/**
 * Tracks whether the device has an internet connection. Optimistic by default
 * (assumes online until proven otherwise) and only flips to offline on the
 * unambiguous NONE network type — both isConnected and isInternetReachable
 * are unreliable on the iOS simulator and lead to false positives.
 */
function isOffline(state: Network.NetworkState): boolean {
  return state.type === Network.NetworkStateType.NONE;
}

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Skip the initial getNetworkStateAsync — on the iOS simulator it
    // commonly returns stale NONE/false readings even with working
    // internet. The listener only fires on actual transitions, which
    // is exactly what we want: assume online, only flip when the device
    // tells us the network actually went away.
    const sub = Network.addNetworkStateListener((state) => {
      setOnline(!isOffline(state));
    });
    return () => sub.remove();
  }, []);

  return online;
}
