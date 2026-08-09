import { router } from "expo-router";

function installNavAudit() {
  const target = router as any;
  const methods = ["push", "replace", "navigate", "back", "dismissAll", "dismiss"];

  for (const method of methods) {
    const original = target[method];
    if (typeof original !== "function") continue;

    target[method] = function (...args: unknown[]) {
      try {
        const stack = new Error().stack
          ?.split("\n")
          .slice(1, 5)
          .join("\n");
        console.log(
          `[NAV-AUDIT][GLOBAL] router.${method}(`,
          JSON.stringify(args),
          ") called from:\n",
          stack,
        );
      } catch {
        console.log(`[NAV-AUDIT][GLOBAL] router.${method}(`, JSON.stringify(args), ")");
      }
      return original.apply(this, args);
    };
  }
}

if (__DEV__) {
  try {
    installNavAudit();
  } catch (e) {
    console.warn("[NAV-AUDIT][GLOBAL] install failed", e);
  }
}

export {};
