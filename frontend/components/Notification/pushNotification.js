"use client";
import { useEffect } from "react";

const PUBLIC_VAPID_KEY = "AQUI_VA_TU_PUBLIC_VAPID_KEY"; // 🔥

export default function usePushNotifications() {
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then(async (registration) => {
        console.log("✅ Service Worker registrado");

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
          });

          console.log("📨 Suscripción creada:", newSubscription);

          // Enviar al servidor
          await fetch("/api/subscribe", {
            method: "POST",
            body: JSON.stringify(newSubscription),
            headers: { "Content-Type": "application/json" },
          });
        } else {
          console.log("🔔 Ya está suscrito");
        }
      });
    }
  }, []);

  return null;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
