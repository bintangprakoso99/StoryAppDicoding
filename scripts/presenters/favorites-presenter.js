// Favorites Presenter - Manages favorite stories using IndexedDB
import { FavoritesView } from "../views/favorites-view.js"
import { IndexedDBService } from "../services/indexeddb-service.js"

export class FavoritesPresenter {
  constructor(router) {
    this.router = router
    this.view = new FavoritesView()
    this.indexedDBService = new IndexedDBService()
    this.favorites = []
  }

  async init() {
    this.view.init()
    this.view.showLoading()
    await this.loadFavorites()
    this.bindEvents()
  }

  async loadFavorites() {
    try {
      this.favorites = await this.indexedDBService.getFavorites()
      this.view.render(this.favorites)
    } catch (error) {
      this.view.showError("Failed to load favorite stories: " + error.message)
    }
  }

  async removeFavorite(storyId) {
    try {
      await this.indexedDBService.removeFromFavorites(storyId)
      this.favorites = this.favorites.filter((story) => story.id !== storyId)
      this.view.render(this.favorites)
      this.view.showMessage("Story removed from favorites", "success")
    } catch (error) {
      this.view.showMessage("Failed to remove story from favorites", "error")
    }
  }

  async clearAllFavorites() {
    if (this.favorites.length === 0) return

    const confirmed = confirm("Are you sure you want to remove all favorite stories? This action cannot be undone.")
    if (!confirmed) return

    try {
      // Remove all favorites one by one
      const promises = this.favorites.map((story) => this.indexedDBService.removeFromFavorites(story.id))
      await Promise.all(promises)

      this.favorites = []
      this.view.render(this.favorites)
      this.view.showMessage("All favorites cleared successfully", "success")
    } catch (error) {
      this.view.showMessage("Failed to clear favorites", "error")
    }
  }

  exportFavorites() {
    if (this.favorites.length === 0) {
      this.view.showMessage("No favorites to export", "error")
      return
    }

    const exportData = {
      favorites: this.favorites,
      exportDate: new Date().toISOString(),
      totalCount: this.favorites.length,
      version: "1.0.0",
    }

    const filename = `dicoding-stories-favorites-${new Date().toISOString().split("T")[0]}.json`
    this.view.downloadFile(exportData, filename)
    this.view.showMessage("Favorites exported successfully!", "success")
  }

  bindEvents() {
    this.view.bindEvents({
      onStoryClick: (storyId) => {
        this.router.navigate(`/story/${storyId}`)
      },
      onRemoveFavorite: (storyId) => {
        this.removeFavorite(storyId)
      },
      onRetry: () => {
        this.loadFavorites()
      },
      onClearFavorites: () => {
        this.clearAllFavorites()
      },
      onExportFavorites: () => {
        this.exportFavorites()
      },
    })
  }
}
