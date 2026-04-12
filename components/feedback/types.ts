export type AlertType = "success" | "error" | "info";

export interface AlertPayload {
  message: string;
  type?: AlertType;
  duration?: number;
}
