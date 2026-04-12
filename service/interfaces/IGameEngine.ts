/**
 * Standard interface for all game engines in the system.
 * Adheres to Liskov Substitution Principle (LSP).
 */
export interface IGameEngine {
  /**
   * Identifies if this engine should handle a specific packet type.
   */
  canHandle(packetType: string): boolean;

  /**
   * Processes a multiplayer packet.
   */
  processMultiplayer(packet: any, sourceIp?: string): void;

  /**
   * Clean up engine state (e.g. on lobby exit).
   */
  reset?(): void;
}
