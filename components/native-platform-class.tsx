"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

export function NativePlatformClass() {
  useEffect(() => {
    const body = document.body;
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    body.classList.add("native-app");
    const platform = Capacitor.getPlatform();
    if (platform === "android") {
      body.classList.add("android-app");
    }

    return () => {
      body.classList.remove("native-app");
      body.classList.remove("android-app");
    };
  }, []);

  return null;
}
