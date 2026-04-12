import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@/redux/reducers/loaderReducer";
import { AppDispatch } from "@/redux/store";

/**
 * Shows the global loader briefly during route transitions.
 *
 * WHY the skip-first-mount logic:
 * On app boot, the first route mount ("/") triggers this, stacking a
 * full-screen animated overlay ON TOP of the intro video — competing for
 * GPU resources and causing the perceived freeze/lag.
 *
 * Now we skip the initial mount and only show the loader for actual navigations.
 */
export default function RouteLoader() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip the very first mount (app boot) — don't overlay on the intro video
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    dispatch(showLoader("Loading Screen..."));

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      dispatch(hideLoader());
    }, 300); // Reduced from 400ms — faster perceived transitions

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, dispatch]);

  return null;
}
