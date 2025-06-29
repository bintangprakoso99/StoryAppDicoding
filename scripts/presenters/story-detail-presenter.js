// Story Detail Presenter
import L from "leaflet" // Import Leaflet library
import { StoryModel } from "../models/story-model.js"

export class StoryDetailPresenter {
  constructor(storyService, storyId, router) {
    this.storyService = storyService
    this.storyModel = new StoryModel()
    this.storyId = storyId
    this.router = router
    this.story = null
  }

  async init() {
    const container = document.getElementById("app-container")
    container.innerHTML = this.getLoadingTemplate()

    await this.loadStoryDetail()
  }

  getLoadingTemplate() {
    return `
      <section role="main" aria-labelledby="story-detail-heading">
        <div class="loading">Loading story details...</div>
      </section>
    `
  }

  getTemplate() {
    if (!this.story) {
      return `
        <section role="main">
          <div class="error">Story not found</div>
          <a href="#/home" class="btn btn-primary">Back to Stories</a>
        </section>
      `
    }

    return `
      <section role="main" aria-labelledby="story-detail-heading">
        <nav aria-label="Breadcrumb">
          <a href="#/home" class="btn btn-primary" style="margin-bottom: 2rem;">
            ← Back to Stories
          </a>
        </nav>
        
        <article class="story-detail">
          <header class="story-header">
            <div class="story-header-content">
              <h1 id="story-detail-heading" class="story-detail-title">${this.story.name}</h1>
              <div class="story-actions">
                <button id="favorite-btn" class="btn btn-secondary favorite-btn" aria-label="Add to favorites">
                  ❤️ Add to Favorites
                </button>
                <button id="test-notification-btn" class="btn btn-secondary" aria-label="Test notification">
                  🔔 Test Notification
                </button>
              </div>
            </div>
            <time datetime="${this.story.createdAt}" class="story-date">
              ${new Date(this.story.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </header>
          
          <div class="story-image-container">
            <img 
              src="${this.story.photoUrl}" 
              alt="Story image by ${this.story.name}"
              class="story-detail-image"
              loading="lazy"
              id="story-image"
            />
          </div>
          
          <div class="story-description-container">
            <h2>Story Description</h2>
            <p class="story-detail-description">${this.story.description}</p>
          </div>
          
          ${
            this.story.lat && this.story.lon
              ? `
              <div class="story-location-container">
                <h2>Location</h2>
                <div id="story-detail-map" class="map-container"></div>
                <p class="location-coordinates">
                  Coordinates: ${this.story.lat.toFixed(6)}, ${this.story.lon.toFixed(6)}
                </p>
              </div>
            `
              : `
              <div class="story-location-container">
                <p class="no-location">No location information available</p>
              </div>
            `
          }
        </article>
      </section>
    `
  }

  async loadStoryDetail() {
    try {
      const result = await this.storyService.getStoryDetail(this.storyId)

      if (result.success) {
        this.story = result.data
        this.renderStoryDetail()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      const container = document.getElementById("app-container")
      container.innerHTML = `
        <section role="main">
          <div class="error">Failed to load story: ${error.message}</div>
          <a href="#/home" class="btn btn-primary">Back to Stories</a>
        </section>
      `
    }
  }

  renderStoryDetail() {
    const container = document.getElementById("app-container")
    container.innerHTML = this.getTemplate()

    if (this.story.lat && this.story.lon) {
      this.initializeMap()
    }

    this.bindEvents()
  }

  bindEvents() {
    // Favorite button
    const favoriteBtn = document.getElementById("favorite-btn")
    if (favoriteBtn) {
      favoriteBtn.addEventListener("click", () => this.addToFavorites())
    }

    // Test notification button
    const testNotificationBtn = document.getElementById("test-notification-btn")
    if (testNotificationBtn) {
      testNotificationBtn.addEventListener("click", () => this.testNotification())
    }

    // Image click for zoom
    const storyImage = document.getElementById("story-image")
    if (storyImage) {
      storyImage.addEventListener("click", () => this.showImageModal())
    }
  }

  async addToFavorites() {
    try {
      const result = await this.storyModel.addToFavorites(this.story)
      if (result.success) {
        this.showMessage("Story added to favorites! ❤️", "success")

        // Update button state
        const favoriteBtn = document.getElementById("favorite-btn")
        if (favoriteBtn) {
          favoriteBtn.innerHTML = "💔 Remove from Favorites"
          favoriteBtn.onclick = () => this.removeFromFavorites()
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.showMessage("Failed to add to favorites: " + error.message, "error")
    }
  }

  async removeFromFavorites() {
    try {
      const result = await this.storyModel.removeFromFavorites(this.story.id)
      if (result.success) {
        this.showMessage("Story removed from favorites", "success")

        // Update button state
        const favoriteBtn = document.getElementById("favorite-btn")
        if (favoriteBtn) {
          favoriteBtn.innerHTML = "❤️ Add to Favorites"
          favoriteBtn.onclick = () => this.addToFavorites()
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.showMessage("Failed to remove from favorites: " + error.message, "error")
    }
  }

  async testNotification() {
    try {
      // Import notification service dynamically
      const { NotificationService } = await import("../services/notification-service.js")
      const notificationService = new NotificationService()

      const result = await notificationService.triggerTestNotification()
      if (result.success) {
        this.showMessage("Test notification sent! 🔔", "success")
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.showMessage("Failed to send notification: " + error.message, "error")
    }
  }

  showImageModal() {
    const modal = document.createElement("div")
    modal.className = "image-modal"
    modal.innerHTML = `
      <img src="${this.story.photoUrl}" alt="Story image by ${this.story.name}" />
      <button class="image-modal-close" aria-label="Close image modal">×</button>
    `

    document.body.appendChild(modal)

    setTimeout(() => {
      modal.classList.add("active")
    }, 10)

    // Close modal events
    const closeBtn = modal.querySelector(".image-modal-close")
    const closeModal = () => {
      modal.classList.remove("active")
      setTimeout(() => {
        document.body.removeChild(modal)
      }, 300)
    }

    closeBtn.addEventListener("click", closeModal)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal()
      }
    })

    // ESC key to close
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeModal()
        document.removeEventListener("keydown", handleEsc)
      }
    }
    document.addEventListener("keydown", handleEsc)
  }

  showMessage(message, type) {
    const messageEl = document.createElement("div")
    messageEl.className = `notification ${type}`
    messageEl.textContent = message
    messageEl.setAttribute("role", "alert")
    messageEl.setAttribute("aria-live", "polite")

    document.body.appendChild(messageEl)

    setTimeout(() => {
      messageEl.classList.add("show")
    }, 100)

    setTimeout(() => {
      messageEl.classList.remove("show")
      setTimeout(() => {
        if (document.body.contains(messageEl)) {
          document.body.removeChild(messageEl)
        }
      }, 300)
    }, 5000)
  }

  initializeMap() {
    // Initialize map centered on story location
    const map = L.map("story-detail-map").setView([this.story.lat, this.story.lon], 15)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    // Add marker for story location
    const marker = L.marker([this.story.lat, this.story.lon]).addTo(map)
    marker.bindPopup(`
      <div>
        <h4>${this.story.name}</h4>
        <p>${this.story.description}</p>
      </div>
    `)
  }

  cleanup() {
    // Cleanup if needed
  }
}
