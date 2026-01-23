import { useEffect } from "react";
import { usePathname } from "expo-router";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "@/redux/reducers/loaderReducer";

export default function RouteLoader() {
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(showLoader("Loading Screen..."));

    const timer = setTimeout(() => {
      dispatch(hideLoader());
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
