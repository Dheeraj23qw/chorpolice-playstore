import TcpSocket from "react-native-tcp-socket";

export type ServerCallbacks = {
  onConnection: (socket: any) => void;
  onListening: (port: number) => void;
  onError: (error: any) => void;
};

/**
 * Handles the low-level logic for binding a TCP server and rotating through ports.
 */
export const TcpServerManager = {
  tryListen: (
    port: number,
    callbacks: ServerCallbacks,
    timeoutMs: number
  ): { server: any; promise: Promise<void> } => {
    const server = TcpSocket.createServer(callbacks.onConnection);
    let settled = false;

    const promise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        server.close();
        reject(new Error(`Timeout binding port ${port}`));
      }, timeoutMs);

      const cleanup = () => {
        clearTimeout(timeout);
      };

      server.on("listening", () => {
        cleanup();
        if (settled) return;
        settled = true;
        callbacks.onListening(server.address()?.port || port);
        resolve();
      });

      server.on("error", (err: any) => {
        cleanup();
        if (settled) return;
        settled = true;
        server.close();
        callbacks.onError(err);
        reject(err);
      });

      server.listen({ port, host: "0.0.0.0" });
    });

    return { server, promise };
  }
};
