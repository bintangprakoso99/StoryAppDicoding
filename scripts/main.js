// Enhanced main application with PWA features
import { Router } from "./router.js"
import { AuthModel } from "./models/auth-model.js"
import { HomePage } from "./pages/home-page.js"
import { AddStoryPage } from "./pages/add-story-page.js"
import { LoginPage } from "./pages/login-page.js"
import { MapPage } from "./pages/map-page.js"
import { SettingsPage } from "./pages/settings-page.js"
import { FavoritesPage } from "./pages/favorites-page.js"
import { StoryDetailPage } from "./pages/story-detail-page.js"
import { NotificationService } from "./services/notification-service.js"
import { IndexedDBService } from "./services/indexeddb-service.js"

class App {
  constructor() {
    this.router = new Router()
    this.authModel = new AuthModel()
    this.notificationService = new NotificationService()
    this.indexedDBService = new IndexedDBService()
    this.currentPage = null
    this.init()
  }

  async init() {
    await this.initializePWA()
    this.setupSkipToContent()
    this.setupMobileMenu()
    this.setupRoutes()
    this.setupNavigation()
    this.checkAuthState()
    this.initializeDarkMode()
    this.setupServiceWorkerMessages()
    this.router.init()
  }

  async initializePWA() {
    try {
      // Initialize IndexedDB
      await this.indexedDBService.init()
      console.log("IndexedDB initialized")

      // Register service worker dengan path yang benar
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("./sw.js", {
          scope: "./",
        })
        console.log("Service Worker registered:", registration)

        // Handle service worker updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              this.showUpdateAvailable()
            }
          })
        })
      }

      // Handle online/offline events
      window.addEventListener("online", () => {
        this.handleOnline()
      })

      window.addEventListener("offline", () => {
        this.handleOffline()
      })

      // Show install prompt
      this.setupInstallPrompt()
    } catch (error) {
      console.error("Failed to initialize PWA features:", error)
    }
  }

  setupInstallPrompt() {
    let deferredPrompt

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      deferredPrompt = e
      this.showInstallButton(deferredPrompt)
    })

    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed")
      this.hideInstallButton()
      this.showNotification("App installed successfully!", "success")
    })
  }

  showInstallButton(deferredPrompt) {
    const installBtn = document.createElement("button")
    installBtn.id = "install-btn"
    installBtn.className = "btn btn-primary install-btn"
    installBtn.innerHTML = "📱 Install App"
    installBtn.setAttribute("aria-label", "Install Dicoding Stories app")

    installBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)
        deferredPrompt = null
        this.hideInstallButton()
      }
    })

    const navbar = document.querySelector(".nav-menu")
    if (navbar && !document.getElementById("install-btn")) {
      navbar.appendChild(installBtn)
    }
  }

  hideInstallButton() {
    const installBtn = document.getElementById("install-btn")
    if (installBtn) {
      installBtn.remove()
    }
  }

  showUpdateAvailable() {
    const updateBanner = document.createElement("div")
    updateBanner.className = "update-banner"
    updateBanner.innerHTML = `
      <div class="update-content">
        <span>🔄 A new version is available!</span>
        <button id="update-btn" class="btn btn-sm btn-primary">Update Now</button>
        <button id="dismiss-update" class="btn btn-sm btn-secondary">Later</button>
      </div>
    `

    document.body.appendChild(updateBanner)

    document.getElementById("update-btn").addEventListener("click", () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" })
      }
      window.location.reload()
    })

    document.getElementById("dismiss-update").addEventListener("click", () => {
      updateBanner.remove()
    })
  }

  async handleOnline() {
    console.log("App is online")
    this.showNotification("You're back online! Syncing data...", "success")

    // Sync offline queue
    try {
      const storyModel = new (await import("./models/story-model.js")).StoryModel()
      const result = await storyModel.syncOfflineQueue()
      if (result.success && result.results.length > 0) {
        const successCount = result.results.filter((r) => r.success).length
        if (successCount > 0) {
          this.showNotification(`${successCount} offline stories synced successfully!`, "success")
        }
      }
    } catch (error) {
      console.error("Failed to sync offline data:", error)
    }
  }

  handleOffline() {
    console.log("App is offline")
    this.showNotification("You're offline. Some features may be limited.", "warning")
  }

  setupServiceWorkerMessages() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "BACKGROUND_SYNC") {
          this.handleOnline()
        }
      })
    }
  }

  showNotification(message, type) {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.setAttribute("role", "alert")
    notification.setAttribute("aria-live", "polite")

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 5000)
  }

  setupSkipToContent() {
    const mainContent = document.querySelector("#main-content")
    const skipLink = document.querySelector(".skip-link")

    skipLink.addEventListener("click", (event) => {
      event.preventDefault()
      skipLink.blur()
      mainContent.focus()
      mainContent.scrollIntoView()
    })
  }

  setupMobileMenu() {
    const mobileToggle = document.getElementById("mobile-menu-toggle")
    const navMenu = document.getElementById("nav-menu")

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener("click", () => {
        const isActive = navMenu.classList.contains("active")

        if (isActive) {
          navMenu.classList.remove("active")
          mobileToggle.classList.remove("active")
          mobileToggle.setAttribute("aria-expanded", "false")
        } else {
          navMenu.classList.add("active")
          mobileToggle.classList.add("active")
          mobileToggle.setAttribute("aria-expanded", "true")
        }
      })

      // Close mobile menu when clicking nav links
      navMenu.addEventListener("click", (e) => {
        if (e.target.classList.contains("nav-link")) {
          navMenu.classList.remove("active")
          mobileToggle.classList.remove("active")
          mobileToggle.setAttribute("aria-expanded", "false")
        }
      })

      // Close mobile menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove("active")
          mobileToggle.classList.remove("active")
          mobileToggle.setAttribute("aria-expanded", "false")
        }
      })
    }
  }

  setupRoutes() {
    this.router.addRoute("/", () => this.redirectToHome())
    this.router.addRoute("/home", () => this.showPage(HomePage))
    this.router.addRoute("/login", () => this.showPage(LoginPage, false))
    this.router.addRoute("/register", () => this.showPage(LoginPage, true))
    this.router.addRoute("/add-story", () => this.showPage(AddStoryPage))
    this.router.addRoute("/map", () => this.showPage(MapPage))
    this.router.addRoute("/settings", () => this.showPage(SettingsPage))
    this.router.addRoute("/favorites", () => this.showPage(FavoritesPage))
    this.router.addRoute("/story/:id", (storyId) => this.showPage(StoryDetailPage, storyId))
  }

  async showPage(PageClass, ...args) {
    // Check authentication for protected routes
    const protectedRoutes = [HomePage, AddStoryPage, MapPage, SettingsPage, FavoritesPage, StoryDetailPage]
    if (protectedRoutes.includes(PageClass) && !this.authModel.isAuthenticated()) {
      this.router.navigate("/login")
      return
    }

    // Destroy current page
    if (this.currentPage?.destroy) {
      this.currentPage.destroy()
    }

    // Create and render new page
    this.currentPage = new PageClass(this.router, ...args)
    await this.currentPage.render()
  }

  updateNavigation() {
    const isAuthenticated = this.authModel.isAuthenticated()
    const logoutBtn = document.getElementById("logout-btn")
    const homeLink = document.getElementById("home-link")
    const addStoryLink = document.getElementById("add-story-link")
    const mapLink = document.getElementById("map-link")
    const settingsLink = document.getElementById("settings-link")
    const favoritesLink = document.getElementById("favorites-link")

    if (isAuthenticated) {
      // Show all navigation for authenticated users
      if (logoutBtn) logoutBtn.style.display = "flex"
      if (homeLink) homeLink.style.display = "flex"
      if (addStoryLink) addStoryLink.style.display = "flex"
      if (mapLink) mapLink.style.display = "flex"
      if (settingsLink) settingsLink.style.display = "flex"
      if (favoritesLink) favoritesLink.style.display = "flex"
    } else {
      // Hide navigation for non-authenticated users
      if (logoutBtn) logoutBtn.style.display = "none"
      if (homeLink) homeLink.style.display = "none"
      if (addStoryLink) addStoryLink.style.display = "none"
      if (mapLink) mapLink.style.display = "none"
      if (settingsLink) settingsLink.style.display = "none"
      if (favoritesLink) favoritesLink.style.display = "none"
    }
  }

  checkAuthState() {
    const isAuthenticated = this.authModel.isAuthenticated()
    this.updateNavigation()

    if (!isAuthenticated && !window.location.hash.includes("login") && !window.location.hash.includes("register")) {
      this.router.navigate("/login")
    }
  }

  initializeDarkMode() {
    const isDarkMode = localStorage.getItem("dark-mode-enabled") === "true"
    if (isDarkMode) {
      document.body.classList.add("dark-mode")
    }
  }

  redirectToHome() {
    this.router.navigate("/home")
  }

  setupNavigation() {
    const logoutBtn = document.getElementById("logout-btn")
    logoutBtn.addEventListener("click", () => {
      this.authModel.logout()
      this.updateNavigation()
      this.router.navigate("/login")
    })
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new App()
})
