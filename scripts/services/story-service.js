// Story service for API interactions
export class StoryService {
  constructor() {
    this.baseUrl = "https://story-api.dicoding.dev/v1"
  }

  getAuthHeaders() {
    const token = localStorage.getItem("dicoding-story-token")
    return {
      Authorization: `Bearer ${token}`,
    }
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
      return { success: !data.error, data: data.listStory || [], message: data.message }
    } catch (error) {
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
      return { success: false, message: "Failed to fetch story detail" }
    }
  }

  async addStory(description, photo, lat = null, lon = null) {
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
      return { success: false, message: "Failed to add story" }
    }
  }

  async addGuestStory(description, photo, lat = null, lon = null) {
    try {
      const formData = new FormData()
      formData.append("description", description)
      formData.append("photo", photo)

      if (lat !== null && lon !== null) {
        formData.append("lat", lat.toString())
        formData.append("lon", lon.toString())
      }

      const response = await fetch(`${this.baseUrl}/stories/guest`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      return { success: !data.error, message: data.message }
    } catch (error) {
      return { success: false, message: "Failed to add guest story" }
    }
  }
}
