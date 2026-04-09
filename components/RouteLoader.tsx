import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@/redux/reducers/loaderReducer";
import { AppDispatch } from "@/redux/store";

/**
 * Robust Route Loader
 * Handles navigation state changes with anti-flicker logic.
 */
export default function RouteLoader() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 1. Cleanup: Cancel any pending hide/show logic from the previous route
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (showTimerRef.current) clearTimeout(showTimerRef.current);

    // 2. Anti-Flicker: Wait 50ms before showing loader.
    // If transition is instant, we save the user from a visual "blink".
    showTimerRef.current = setTimeout(() => {
      if (isMounted.current) {
        dispatch(showLoader("Synchronizing..."));
      }
    }, 50);

    // 3. Minimum Visibility: Ensure the loader stays for a stable duration
    timeoutRef.current = setTimeout(() => {
      // If we are hiding, we definitely don't want the show timer to trigger late
      if (showTimerRef.current) clearTimeout(showTimerRef.current);

      if (isMounted.current) {
        dispatch(hideLoader());
      }
    }, 500);

    return () => {
      // 4. Final Cleanup: Prevent memory leaks and state updates on unmounted component
      isMounted.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [pathname, dispatch]);

  return null;
}
