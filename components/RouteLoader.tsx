import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@/redux/reducers/loaderReducer";
import { AppDispatch } from "@/redux/store";

export default function RouteLoader() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous timer if route changes quickly
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    dispatch(showLoader("Loading Screen..."));

    timeoutRef.current = setTimeout(() => {
      dispatch(hideLoader());
    }, 500); // smoother timing

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, dispatch]);

  return null;
}
