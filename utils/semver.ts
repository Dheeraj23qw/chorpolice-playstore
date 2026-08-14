const SEMVER_REGEX = /^(\d+)(\.(\d+)(\.(\d+))?)?$/;

export function isValidSemver(version: unknown): boolean {
  if (typeof version !== "string") return false;
  return SEMVER_REGEX.test(version.trim());
}

export function normalizeSemver(version: string): string {
  const trimmed = version.trim().replace(/^v/i, "");
  const parts = trimmed.split(".");
  while (parts.length < 3) {
    parts.push("0");
  }
  return parts.slice(0, 3).join(".");
}

export function parseSemver(version: string): [number, number, number] | null {
  if (!isValidSemver(version)) return null;
  const normalized = normalizeSemver(version);
  const parts = normalized.split(".").map(Number);
  return [parts[0], parts[1], parts[2]];
}

export function compareVersions(v1: string, v2: string): number {
  const a = parseSemver(v1);
  const b = parseSemver(v2);
  if (!a || !b) {
    throw new Error(`Invalid semver: "${v1}" or "${v2}"`);
  }
  for (let i = 0; i < 3; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

export function isNewerVersion(current: string, latest: string): boolean {
  return compareVersions(current, latest) < 0;
}
