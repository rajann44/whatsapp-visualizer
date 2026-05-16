"use client";

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

export function NativeBackButtonBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return;
    }

    let removeListener: (() => void) | undefined;

    App.addListener("backButton", () => {
      const hasOpenDialog = Boolean(document.querySelector('[role="dialog"]'));
      if (hasOpenDialog) {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        return;
      }

      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      App.exitApp();
    }).then((handle) => {
      removeListener = () => {
        void handle.remove();
      };
    });

    return () => {
      removeListener?.();
    };
  }, []);

  return null;
}
