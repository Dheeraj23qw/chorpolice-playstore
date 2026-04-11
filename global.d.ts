// global.d.ts
export {};

declare global {
  // We extend the global namespace so TypeScript recognizes
  // 'Buffer' as a valid global object, which is required by
  // our networking libraries (TCP/UDP) to handle binary data.
  var Buffer: typeof import("buffer").Buffer;
}
