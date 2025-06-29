// Settings Model - Handles settings data and localStorage
export class SettingsModel {
  constructor() {
    this.keys = {
      notifications: "notifications-enabled",
      locationSharing: "location-sharing-enabled",
      darkMode: "dark-mode-enabled",
    }
  }

  getSettings() {
    return {
      notifications: localStorage.getItem(this.keys.notifications) === "true",
      locationSharing: localStorage.getItem(this.keys.locationSharing) !== "false",
      darkMode: localStorage.getItem(this.keys.darkMode) === "true",
    }
  }

  saveSetting(key, value) {
    if (this.keys[key]) {
      localStorage.setItem(this.keys[key], value.toString())
    }
  }

  saveSettings(settings) {
    Object.keys(settings).forEach((key) => {
      this.saveSetting(key, settings[key])
    })
  }

  exportUserData() {
    const authToken = localStorage.getItem("dicoding-story-token")
    const userData = localStorage.getItem("dicoding-story-user")
    const settings = this.getSettings()

    return {
      user: userData ? JSON.parse(userData) : {},
      settings: settings,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    }
  }

  async clearCache() {
    try {
      // Clear browser caches
      if ("caches" in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      }

      // Preserve important data
      const authToken = localStorage.getItem("dicoding-story-token")
      const userData = localStorage.getItem("dicoding-story-user")
      const settings = this.getSettings()

      // Clear localStorage
      localStorage.clear()

      // Restore important data
      if (authToken) localStorage.setItem("dicoding-story-token", authToken)
      if (userData) localStorage.setItem("dicoding-story-user", userData)
      this.saveSettings(settings)

      return { success: true, message: "Cache cleared successfully" }
    } catch (error) {
      return { success: false, message: "Failed to clear cache" }
    }
  }
}
