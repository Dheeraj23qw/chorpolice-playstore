import React from "react";
import { Buffer } from "buffer";

import AppController from "@/components/AppController";

globalThis.Buffer = Buffer;

export default function Index() {
  return <AppController />;
}
