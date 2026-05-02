import { renderHook, act } from "@testing-library/react-hooks";
import * as React from "react";
import { AccessibilityInfo } from "react-native";
import * as Network from "expo-network";

// Mock the modules
jest.mock("react-native", () => ({
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

jest.mock("expo-network", () => ({
  __esModule: true,
  default: {
    addNetworkStateListener: jest.fn(),
  },
  // Mock NetworkStateType enum constants
  NetworkStateType: {
    WIFI: "WIFI",
    CELLULAR: "CELLULAR",
    NONE: "NONE",
  },
}));

// Import the hooks after mocking
const { useReducedMotion } = require("../../../src/lib/useReducedMotion");
const { useOnlineStatus } = require("../../../src/lib/useOnlineStatus");

// Helper function to simulate the listener callback
type NetworkStateListener = (state: Network["NetworkState"]) => void;

describe("useReducedMotion", () => {
  const mockRemove = jest.fn();
  const mockSub = { remove: mockRemove };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup AccessibilityInfo mocks
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);
    (AccessibilityInfo.addEventListener as jest.Mock).mockReturnValue(mockSub);
  });

  it("should initialize to false (default) and resolve the initial state", async () => {
    // Mock initial resolution to false
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

    const { result, unmount } = renderHook(() => useReducedMotion());

    // Wait for the initial promise resolution
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toBe(false);
    expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalledTimes(1);
    expect(AccessibilityInfo.addEventListener).toHaveBeenCalledWith("reduceMotionChanged", expect.any(Function));
  });

  it("should update state when isReduceMotionEnabled resolves to true", async () => {
    // Mock initial resolution to true
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

    const { result, unmount } = renderHook(() => useReducedMotion());

    // Wait for the initial promise resolution
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toBe(true);
  });

  it("should update state when the listener fires (e.g., flipping state)", async () => {
    // 1. Setup initial state (false)
    (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);
    const { result, unmount } = renderHook(() => useReducedMotion());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current).toBe(false);

    // 2. Get the listener function passed to addEventListener
    const listener = (AccessibilityInfo.addEventListener as jest.Mock).mock.calls[0][1];

    // 3. Simulate the listener firing to set state to true
    await act(async () => {
      listener(true);
    });
    expect(result.current).toBe(true);

    // 4. Simulate the listener firing again to set state to false
    await act(async () => {
      listener(false);
    });
    expect(result.current).toBe(false);
  });

  it("should clean up the event listener on unmount", async () => {
    const { unmount } = renderHook(() => useReducedMotion());

    // Wait for initial setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Unmount the hook
    unmount();

    // Verify that the cleanup function (which calls sub.remove()) was executed
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});

describe("useOnlineStatus", () => {
  const mockRemove = jest.fn();
  const mockSub = { remove: mockRemove };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup Network mocks
    (Network.default.addNetworkStateListener as jest.Mock).mockReturnValue(mockSub);
  });

  it("should initialize to true (optimistic default)", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
    expect(Network.default.addNetworkStateListener).toHaveBeenCalledTimes(1);
  });

  it("should flip to false when the network state is NONE", async () => {
    const { result, unmount } = renderHook(() => useOnlineStatus());

    // 1. Get the listener function
    const listener = (Network.default.addNetworkStateListener as jest.Mock).mock.calls[0][0];

    // 2. Simulate NONE event (Offline)
    await act(async () => {
      listener({ type: Network.NetworkStateType.NONE } as any);
    });
    expect(result.current).toBe(false);
  });

  it("should flip back to true when the network state is WIFI", async () => {
    const { result, unmount } = renderHook(() => useOnlineStatus());

    // 1. Get the listener function
    const listener = (Network.default.addNetworkStateListener as jest.Mock).mock.calls[0][0];

    // 2. Simulate NONE event first (Offline)
    await act(async () => {
      listener({ type: Network.NetworkStateType.NONE } as any);
    });
    expect(result.current).toBe(false);

    // 3. Simulate WIFI event (Online)
    await act(async () => {
      listener({ type: Network.NetworkStateType.WIFI } as any);
    });
    expect(result.current).toBe(true);
  });

  it("should clean up the network listener on unmount", async () => {
    const { unmount } = renderHook(() => useOnlineStatus());

    // Wait for initial setup
    await act(async () => {
      // No explicit await needed here as the setup is synchronous, but good practice
    });

    // Unmount the hook
    unmount();

    // Verify that the cleanup function (which calls sub.remove()) was executed
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});
