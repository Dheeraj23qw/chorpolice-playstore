const ROOM_CODE_LENGTH = 8;

export const encodeRoomCode = (ip: string): string | null => {
  const octets = ip.split(".").map((part) => Number(part));

  if (
    octets.length !== 4 ||
    octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }

  const rawCode = octets
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return `${rawCode.slice(0, 4)}-${rawCode.slice(4)}`;
};

export const decodeRoomCode = (code: string): string | null => {
  const normalized = code.replace(/[^A-Fa-f0-9]/g, "");

  if (normalized.length !== ROOM_CODE_LENGTH) {
    return null;
  }

  const octets = normalized.match(/.{1,2}/g)?.map((part) => parseInt(part, 16));

  if (
    !octets ||
    octets.length !== 4 ||
    octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)
  ) {
    return null;
  }

  return octets.join(".");
};
