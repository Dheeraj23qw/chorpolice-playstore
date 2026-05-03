import { Buffer } from "buffer";
import { NETWORK } from "@/constants/Networking";

export type PacketEnvelope = {
  version: string;
  packet: any;
};

/**
 * Wraps a packet in a length-prefixed envelope for reliable TCP transfer.
 * [4 bytes length][N bytes JSON]
 */
export const framePacket = (packet: any): Buffer => {
  const payload = JSON.stringify({
    version: NETWORK.PROTOCOL_VERSION,
    packet,
  });
  const payloadBuffer = Buffer.from(payload, "utf-8");
  const header = Buffer.alloc(4);
  header.writeUInt32BE(payloadBuffer.length, 0);
  return Buffer.concat([header, payloadBuffer]);
};

/**
 * Extracts complete framed packets from a buffer.
 * Returns [extractedPackets, remainingBuffer].
 */
export const extractFrames = (buffer: Buffer): [PacketEnvelope[], Buffer] => {
  const packets: PacketEnvelope[] = [];
  let offset = 0;

  while (offset + 4 <= buffer.length) {
    const payloadLength = buffer.readUInt32BE(offset);

    // Sanity check: reject absurdly large frames (> 1MB)
    if (payloadLength > 1_048_576) {
      console.warn(`[TCP Frame] Rejecting oversized frame (${payloadLength} bytes). Resetting buffer.`);
      return [packets, Buffer.alloc(0)];
    }

    if (offset + 4 + payloadLength > buffer.length) {
      // Incomplete frame; wait for more data
      break;
    }

    try {
      const payloadStr = buffer.toString(
        "utf-8",
        offset + 4,
        offset + 4 + payloadLength,
      );
      const envelope = JSON.parse(payloadStr) as PacketEnvelope;

      if (
        envelope &&
        envelope.version === NETWORK.PROTOCOL_VERSION &&
        envelope.packet
      ) {
        packets.push(envelope);
      }
    } catch (error) {
      console.warn("[TCP Frame] Frame parse error:", error);
    }

    offset += 4 + payloadLength;
  }

  const remaining = buffer.slice(offset);
  return [packets, remaining];
};
