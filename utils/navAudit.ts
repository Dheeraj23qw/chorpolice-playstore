import { router } from "expo-router";

function installNavAudit() {
  const installKey = "__chorPoliceNavAuditInstalled__";
  const auditState = globalThis as typeof globalThis & Record<string, boolean>;

  // Fast Refresh evaluates this module again. Patching a router method more than
  // once makes each navigation log recursively and obscures the real caller.
  if (auditState[installKey]) return;
  auditState[installKey] = true;

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
