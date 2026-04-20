import "react-native-get-random-values";
import { Buffer } from "buffer";

import React from "react";

import AppController from "@/components/AppController";

globalThis.Buffer = Buffer;

export default function Index() {
  return <AppController />;
}
