import { useRef, useCallback } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";

type BackHandlerOptions = {
  enabled?: boolean;
  priority?: number;
  fallbackToSystem?: boolean;
};

type BackHandlerCallback = () => boolean | Promise<boolean>;

type HandlerEntry = {
  callback: BackHandlerCallback;
  priority: number;
};

// --- GLOBAL STATE ---
// This lives outside the hook so it doesn't get recreated on re-renders
let handlers: HandlerEntry[] = [];

/**
 * The Master Listener: Runs once per back-button press.
 * It checks the stack from highest priority to lowest.
 */
const onBackPress = (): boolean => {
  // Sort by priority (descending) so highest number runs first
  const sortedHandlers = [...handlers].sort((a, b) => b.priority - a.priority);

  for (const h of sortedHandlers) {
    try {
      const result = h.callback();

      // If the handler returns a Promise, we treat it as "Handled"
      if (result instanceof Promise) {
        result.catch((err) => console.error("Async BackHandler Error:", err));
        return true; 
      }

      // If the handler returns true, we stop the chain and don't exit the app
      if (result === true) return true;
    } catch (err) {
      console.error("BackHandler execution error:", err);
    }
  }

  // If no handlers returned true, we return false to let the system handle it
  // (e.g., exiting the app or going back in the system stack)
  return false;
};

// Register the native listener ONCE for the entire app lifecycle
BackHandler.addEventListener("hardwareBackPress", onBackPress);

/**
 * useBackHandler Hook
 * Use this in your screens or hooks (like useRajaMantriGame)
 */
export const useBackHandler = (
  handler: BackHandlerCallback,
  options: BackHandlerOptions = {}
) => {
  const {
    enabled = true,
    priority = 0,
  } = options;

  // Use a ref to ensure the listener always calls the latest version of your function
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      const entry: HandlerEntry = {
        callback: () => handlerRef.current(),
        priority,
      };

      // Add to the stack
      handlers.push(entry);

      // Cleanup: Remove from stack when screen loses focus or unmounts
      return () => {
        handlers = handlers.filter((h) => h !== entry);
      };
    }, [enabled, priority])
  );
};