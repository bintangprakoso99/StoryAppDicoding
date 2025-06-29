// Settings View - Pure DOM manipulation with proper label associations
export class SettingsView {
  constructor() {
    this.container = null
  }

  init() {
    this.container = document.getElementById("app-container")
  }

  render() {
    this.container.innerHTML = `
      <section role="main" aria-labelledby="settings-heading">
        <div class="page-header">
          <h1 id="settings-heading">Settings</h1>
        </div>
        
        <div id="message" class="success" style="display: none;" role="alert" aria-live="polite"></div>
        
        <div class="settings-container">
          <div class="settings-section">
            <h2>🔔 Notifications</h2>
            <div class="setting-item">
              <label for="notification-toggle" class="setting-label">
                <input 
                  type="checkbox" 
                  id="notification-toggle" 
                  class="setting-checkbox"
                />
                <span class="setting-text">Enable push notifications</span>
              </label>
              <p class="setting-description">
                Get notified when new stories are shared or when your stories receive interactions.
              </p>
            </div>
          </div>
          
          <div class="settings-section">
            <h2>🔒 Privacy</h2>
            <div class="setting-item">
              <label for="location-toggle" class="setting-label">
                <input 
                  type="checkbox" 
                  id="location-toggle" 
                  class="setting-checkbox"
                  checked
                />
                <span class="setting-text">Share location with stories</span>
              </label>
              <p class="setting-description">
                Allow your stories to include location information for others to see.
              </p>
            </div>
          </div>
          
          <div class="settings-section">
            <h2>🎨 Display</h2>
            <div class="setting-item">
              <label for="dark-mode-toggle" class="setting-label">
                <input 
                  type="checkbox" 
                  id="dark-mode-toggle" 
                  class="setting-checkbox"
                />
                <span class="setting-text">Dark mode</span>
              </label>
              <p class="setting-description">
                Switch to dark theme for better viewing in low light conditions.
              </p>
            </div>
          </div>
          
          <div class="settings-section">
            <h2>💾 Data Management</h2>
            <div class="setting-item">
              <button id="clear-cache-btn" class="btn btn-danger">
                🗑️ Clear Cache
              </button>
              <p class="setting-description">
                Clear stored data and cache to free up space.
              </p>
            </div>
            
            <div class="setting-item">
              <button id="export-data-btn" class="btn btn-secondary">
                📤 Export My Data
              </button>
              <p class="setting-description">
                Download your stories and data in JSON format.
              </p>
            </div>
          </div>
          
          <div class="settings-section">
            <h2>ℹ️ About</h2>
            <div class="about-info">
              <p><strong>Dicoding Stories</strong></p>
              <p>Version: 1.0.0</p>
              <p>A story sharing platform for the Dicoding community</p>
              <p>Built with ❤️ using vanilla JavaScript and modern web technologies</p>
              <br>
              <p><strong>Features:</strong></p>
              <ul>
                <li>📱 Progressive Web App (PWA)</li>
                <li>🔔 Push Notifications</li>
                <li>📍 Location-based Stories</li>
                <li>❤️ Favorites System</li>
                <li>🌙 Dark Mode</li>
                <li>📱 Offline Support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    `
  }

  showMessage(message, type) {
    const messageEl = document.getElementById("message")
    messageEl.textContent = message
    messageEl.className = type
    messageEl.style.display = "block"

    setTimeout(() => {
      messageEl.style.display = "none"
    }, 3000)
  }

  updateToggleStates(settings) {
    const notificationToggle = document.getElementById("notification-toggle")
    const locationToggle = document.getElementById("location-toggle")
    const darkModeToggle = document.getElementById("dark-mode-toggle")

    if (notificationToggle) notificationToggle.checked = settings.notifications || false
    if (locationToggle) locationToggle.checked = settings.locationSharing !== false
    if (darkModeToggle) darkModeToggle.checked = settings.darkMode || false
  }

  applyDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }
  }

  downloadFile(data, filename) {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = filename
    link.click()

    URL.revokeObjectURL(link.href)
  }

  bindEvents(handlers) {
    // Notification toggle
    const notificationToggle = document.getElementById("notification-toggle")
    if (notificationToggle) {
      notificationToggle.addEventListener("change", (e) => {
        handlers.onNotificationToggle(e.target.checked)
      })
    }

    // Location toggle
    const locationToggle = document.getElementById("location-toggle")
    if (locationToggle) {
      locationToggle.addEventListener("change", (e) => {
        handlers.onLocationToggle(e.target.checked)
      })
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById("dark-mode-toggle")
    if (darkModeToggle) {
      darkModeToggle.addEventListener("change", (e) => {
        handlers.onDarkModeToggle(e.target.checked)
      })
    }

    // Clear cache button
    const clearCacheBtn = document.getElementById("clear-cache-btn")
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener("click", handlers.onClearCache)
    }

    // Export data button
    const exportDataBtn = document.getElementById("export-data-btn")
    if (exportDataBtn) {
      exportDataBtn.addEventListener("click", handlers.onExportData)
    }
  }
}
