// Enhanced Story Model with IndexedDB integration
import { IndexedDBService } from "../services/indexeddb-service.js"

export class StoryModel {
  constructor() {
    this.baseUrl = "https://story-api.dicoding.dev/v1"
    this.tokenKey = "dicoding-story-token"
    this.indexedDBService = new IndexedDBService()
  }

  getAuthHeaders() {
    const token = this.getToken()
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  async getAllStories(page = 1, size = 10, location = 0) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        location: location.toString(),
      })

      const response = await fetch(`${this.baseUrl}/stories?${params}`, {
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (!data.error && data.listStory) {
        // Cache stories in IndexedDB for offline access
        try {
          await this.indexedDBService.saveStories(data.listStory)
        } catch (dbError) {
          console.warn("Failed to cache stories:", dbError)
        }
      }

      return { success: !data.error, data: data.listStory || [], message: data.message }
    } catch (error) {
      // Try to get cached stories when offline
      try {
        const cachedStories = await this.indexedDBService.getStories()
        if (cachedStories.length > 0) {
          return {
            success: true,
            data: cachedStories,
            message: "Showing cached stories (offline mode)",
            offline: true,
          }
        }
      } catch (dbError) {
        console.warn("Failed to get cached stories:", dbError)
      }

      return { success: false, message: "Failed to fetch stories" }
    }
  }

  async getStoryDetail(id) {
    try {
      const response = await fetch(`${this.baseUrl}/stories/${id}`, {
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()
      return { success: !data.error, data: data.story, message: data.message }
    } catch (error) {
      // Try to get from cached stories
      try {
        const cachedStories = await this.indexedDBService.getStories()
        const story = cachedStories.find((s) => s.id === id)
        if (story) {
          return {
            success: true,
            data: story,
            message: "Showing cached story (offline mode)",
            offline: true,
          }
        }
      } catch (dbError) {
        console.warn("Failed to get cached story:", dbError)
      }

      return { success: false, message: "Failed to fetch story detail" }
    }
  }

  async addStory(description, photo, lat = null, lon = null) {
    const storyData = {
      description,
      photo,
      lat,
      lon,
      timestamp: new Date().toISOString(),
    }

    try {
      const formData = new FormData()
      formData.append("description", description)
      formData.append("photo", photo)

      if (lat !== null && lon !== null) {
        formData.append("lat", lat.toString())
        formData.append("lon", lon.toString())
      }

      const response = await fetch(`${this.baseUrl}/stories`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: formData,
      })

      const data = await response.json()
      return { success: !data.error, message: data.message }
    } catch (error) {
      // Add to offline queue when offline
      try {
        await this.indexedDBService.addToOfflineQueue({
          type: "ADD_STORY",
          data: storyData,
        })
        return {
          success: true,
          message: "Story saved offline. It will be uploaded when you're back online.",
          offline: true,
        }
      } catch (dbError) {
        console.warn("Failed to save to offline queue:", dbError)
      }

      return { success: false, message: "Failed to add story" }
    }
  }

  async addToFavorites(story) {
    try {
      await this.indexedDBService.addToFavorites(story)
      return { success: true, message: "Story added to favorites" }
    } catch (error) {
      return { success: false, message: "Failed to add to favorites" }
    }
  }

  async removeFromFavorites(storyId) {
    try {
      await this.indexedDBService.removeFromFavorites(storyId)
      return { success: true, message: "Story removed from favorites" }
    } catch (error) {
      return { success: false, message: "Failed to remove from favorites" }
    }
  }

  async getFavorites() {
    try {
      const favorites = await this.indexedDBService.getFavorites()
      return { success: true, data: favorites }
    } catch (error) {
      return { success: false, message: "Failed to get favorites" }
    }
  }

  async syncOfflineQueue() {
    try {
      const queue = await this.indexedDBService.getOfflineQueue()
      const results = []

      for (const item of queue) {
        if (item.type === "ADD_STORY") {
          try {
            const formData = new FormData()
            formData.append("description", item.data.description)
            formData.append("photo", item.data.photo)

            if (item.data.lat && item.data.lon) {
              formData.append("lat", item.data.lat.toString())
              formData.append("lon", item.data.lon.toString())
            }

            const response = await fetch(`${this.baseUrl}/stories`, {
              method: "POST",
              headers: this.getAuthHeaders(),
              body: formData,
            })

            const data = await response.json()
            if (!data.error) {
              results.push({ success: true, item })
            } else {
              results.push({ success: false, item, error: data.message })
            }
          } catch (error) {
            results.push({ success: false, item, error: error.message })
          }
        }
      }

      // Clear successfully synced items
      const successfulItems = results.filter((r) => r.success)
      if (successfulItems.length > 0) {
        await this.indexedDBService.clearOfflineQueue()
      }

      return { success: true, results }
    } catch (error) {
      return { success: false, message: "Failed to sync offline queue" }
    }
  }
}
