import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@/redux/reducers/loaderReducer";
import { AppDispatch } from "@/redux/store";

export default function RouteLoader() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // 1. Immediately show the loader when the path changes
    dispatch(showLoader("Loading Screen..."));

    // 2. Clear any existing timer to prevent race conditions
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // 3. Set the "Hide" timer
    timeoutRef.current = setTimeout(() => {
      dispatch(hideLoader());
    }, 400);

    // 4. Cleanup on unmount or path change
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, dispatch]);

  return null;
}
