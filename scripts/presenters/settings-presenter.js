// Settings Presenter - Pure business logic, no DOM manipulation or localStorage calls
import { SettingsView } from "../views/settings-view.js"
import { SettingsModel } from "../models/settings-model.js"
import { NotificationService } from "../services/notification-service.js"

export class SettingsPresenter {
  constructor() {
    this.settingsModel = new SettingsModel()
    this.notificationService = new NotificationService()
    this.view = new SettingsView()
    this.settings = {}
  }

  init() {
    this.view.init()
    this.loadSettings()
    this.view.render()
    this.view.updateToggleStates(this.settings)
    this.bindEvents()
  }

  loadSettings() {
    this.settings = this.settingsModel.getSettings()
    // Apply dark mode on load
    this.view.applyDarkMode(this.settings.darkMode)
  }

  saveSettings() {
    this.settingsModel.saveSettings(this.settings)
  }

  bindEvents() {
    this.view.bindEvents({
      onNotificationToggle: (enabled) => this.handleNotificationToggle(enabled),
      onLocationToggle: (enabled) => this.handleLocationToggle(enabled),
      onDarkModeToggle: (enabled) => this.handleDarkModeToggle(enabled),
      onClearCache: () => this.clearCache(),
      onExportData: () => this.exportData(),
    })
  }

  async handleNotificationToggle(enabled) {
    try {
      if (enabled) {
        const hasPermission = await this.notificationService.requestPermission()
        if (hasPermission) {
          const result = await this.notificationService.subscribeToPush()
          if (result.success) {
            this.settings.notifications = true
            this.view.showMessage("Notifications enabled successfully!", "success")
          } else {
            throw new Error(result.message)
          }
        } else {
          throw new Error("Notification permission denied")
        }
      } else {
        const result = await this.notificationService.unsubscribeFromPush()
        if (result.success) {
          this.settings.notifications = false
          this.view.showMessage("Notifications disabled", "success")
        } else {
          throw new Error(result.message)
        }
      }
      this.saveSettings()
    } catch (error) {
      this.view.showMessage(`Failed to ${enabled ? "enable" : "disable"} notifications: ${error.message}`, "error")
      // Reset toggle state
      this.view.updateToggleStates(this.settings)
    }
  }

  handleLocationToggle(enabled) {
    this.settings.locationSharing = enabled
    this.saveSettings()
    this.view.showMessage(`Location sharing ${enabled ? "enabled" : "disabled"}`, "success")
  }

  handleDarkModeToggle(enabled) {
    this.settings.darkMode = enabled
    this.saveSettings()
    this.view.applyDarkMode(enabled)
    this.view.showMessage(`Dark mode ${enabled ? "enabled" : "disabled"}`, "success")
  }

  async clearCache() {
    try {
      const result = await this.settingsModel.clearCache()
      if (result.success) {
        this.view.showMessage(result.message, "success")
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.view.showMessage("Failed to clear cache", "error")
    }
  }

  exportData() {
    try {
      const exportData = this.settingsModel.exportUserData()
      const filename = `dicoding-stories-data-${new Date().toISOString().split("T")[0]}.json`

      this.view.downloadFile(exportData, filename)
      this.view.showMessage("Data exported successfully!", "success")
    } catch (error) {
      this.view.showMessage("Failed to export data", "error")
    }
  }
}
