// Enhanced Web Push Notification Service with proper VAPID key
export class NotificationService {
  constructor() {
    this.baseUrl = "https://story-api.dicoding.dev/v1"
    // VAPID public key dari Dicoding API
    this.vapidPublicKey = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"
  }

  getAuthHeaders() {
    const token = localStorage.getItem("dicoding-story-token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications")
    }

    if (!("serviceWorker" in navigator)) {
      throw new Error("This browser does not support service workers")
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "./",
      })
      console.log("Service Worker registered:", registration)
      return registration
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      throw error
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async subscribeToPush() {
    try {
      const registration = await this.registerServiceWorker()

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
        })
      }

      // Send subscription to server (optional - Dicoding API might not support this)
      try {
        const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))),
            },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return { success: !data.error, message: data.message || "Subscribed to notifications" }
        }
      } catch (apiError) {
        console.log("API subscription not available, using local notifications")
      }

      // Store subscription locally for demo purposes
      localStorage.setItem("push-subscription", JSON.stringify(subscription))

      return { success: true, message: "Subscribed to notifications successfully" }
    } catch (error) {
      return { success: false, message: "Failed to subscribe to notifications: " + error.message }
    }
  }

  async unsubscribeFromPush() {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          localStorage.removeItem("push-subscription")

          // Notify server (optional)
          try {
            await fetch(`${this.baseUrl}/notifications/unsubscribe`, {
              method: "DELETE",
              headers: this.getAuthHeaders(),
              body: JSON.stringify({
                endpoint: subscription.endpoint,
              }),
            })
          } catch (apiError) {
            console.log("API unsubscribe not available")
          }
        }
      }
      return { success: true, message: "Unsubscribed from notifications" }
    } catch (error) {
      return { success: false, message: "Failed to unsubscribe from notifications: " + error.message }
    }
  }

  async showLocalNotification(title, options = {}) {
    if (!("Notification" in window)) {
      return { success: false, message: "Notifications not supported" }
    }

    if (Notification.permission !== "granted") {
      const permission = await this.requestPermission()
      if (!permission) {
        return { success: false, message: "Notification permission not granted" }
      }
    }

    try {
      const notification = new Notification(title, {
        icon: "./icons/icon-192x192.png",
        badge: "./icons/badge-72x72.png",
        vibrate: [100, 50, 100],
        ...options,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return { success: true, message: "Notification shown" }
    } catch (error) {
      return { success: false, message: "Failed to show notification: " + error.message }
    }
  }

  async triggerTestNotification() {
    return this.showLocalNotification("Dicoding Stories", {
      body: "Test notification - your PWA is working correctly! 🎉",
      tag: "test-notification",
      requireInteraction: false,
    })
  }
}
