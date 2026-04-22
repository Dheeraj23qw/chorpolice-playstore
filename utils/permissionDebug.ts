const PREFIX = "[PermDebug]";

const serialize = (payload: unknown) => {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
};

export const logPermissionDebug = (scope: string, message: string, payload?: unknown) => {
  if (!__DEV__) {
    return;
  }

  if (payload === undefined) {
    console.log(`${PREFIX}[${scope}] ${message}`);
    return;
  }

  console.log(`${PREFIX}[${scope}] ${message}\n${serialize(payload)}`);
};

export const warnPermissionDebug = (
  scope: string,
  message: string,
  payload?: unknown,
) => {
  if (!__DEV__) {
    return;
  }

  if (payload === undefined) {
    console.warn(`${PREFIX}[${scope}] ${message}`);
    return;
  }

  console.warn(`${PREFIX}[${scope}] ${message}\n${serialize(payload)}`);
};

export const errorPermissionDebug = (
  scope: string,
  message: string,
  payload?: unknown,
) => {
  if (!__DEV__) {
    return;
  }

  if (payload === undefined) {
    console.error(`${PREFIX}[${scope}] ${message}`);
    return;
  }

  console.error(`${PREFIX}[${scope}] ${message}\n${serialize(payload)}`);
};
