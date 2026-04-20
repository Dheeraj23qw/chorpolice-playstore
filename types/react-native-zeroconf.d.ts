declare module "react-native-zeroconf" {
  export type ZeroconfImplType = "NSD" | "DNSSD";

  export interface ZeroconfService {
    name: string;
    host?: string;
    port?: number;
    addresses?: string[];
    txt?: Record<string, string>;
  }

  export default class Zeroconf {
    constructor();
    scan(
      type?: string,
      protocol?: string,
      domain?: string,
      implType?: ZeroconfImplType,
    ): void;
    stop(implType?: ZeroconfImplType): void;
    publishService(
      type: string,
      protocol: string,
      domain: string | undefined,
      name: string,
      port: number,
      txt?: Record<string, string>,
      implType?: ZeroconfImplType,
    ): void;
    unpublishService(name: string, implType?: ZeroconfImplType): void;
    on(event: "resolved", callback: (service: ZeroconfService) => void): this;
    on(event: "remove" | "found", callback: (serviceName: string) => void): this;
    on(event: "error", callback: (error: unknown) => void): this;
    on(
      event: "start" | "stop" | "update" | "published" | "unpublished",
      callback: (...args: any[]) => void,
    ): this;
    removeAllListeners(event?: string): this;
    removeDeviceListeners(): void;
  }
}
