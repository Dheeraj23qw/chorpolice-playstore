/**
 * normalizePeerIp — Strips IPv6 prefixes and port suffixes from peer IPs.
 * 
 * Extracted to its own file to break circular dependencies between
 * lanGameService, HeartbeatService, and GameSessionTransport.
 */
export const normalizePeerIp = (sourceIp?: string | null): string | undefined => {
  if (!sourceIp) return undefined;
  // Handle ::ffff: prefixes and strip port suffixes
  let ip = sourceIp.replace(/^::ffff:/, "");
  return ip.split(":")[0];
};
