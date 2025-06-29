// Map Presenter - Dedicated map page presenter
import { MapView } from "../views/map-view.js"

export class MapPresenter {
  constructor(storyService, mapService, router) {
    this.storyService = storyService
    this.mapService = mapService
    this.router = router
    this.view = new MapView()
    this.stories = []
    this.isSatelliteView = false
    this.isFullscreen = false
  }

  async init() {
    this.view.showLoading()
    await this.loadStories()
    this.initializeMap()
    this.bindEvents()
  }

  async loadStories() {
    try {
      const result = await this.storyService.getAllStories(1, 50, 1) // Get more stories for map

      if (result.success) {
        this.stories = result.data.filter((story) => story.lat && story.lon) // Only stories with location
        this.view.render(this.stories.length)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.view.showError(error.message || "Failed to load story locations")
    }
  }

  initializeMap() {
    const mapContainer = this.view.getMapContainer()
    if (mapContainer && this.stories.length > 0) {
      this.mapService.initializeFullMap(mapContainer, this.stories, (storyId) => {
        this.router.navigate(`/story/${storyId}`)
      })
    }
  }

  bindEvents() {
    this.view.bindEvents({
      onCenterMap: () => this.centerMap(),
      onToggleSatellite: () => this.toggleSatelliteView(),
      onToggleFullscreen: () => this.toggleFullscreen(),
    })
  }

  centerMap() {
    if (this.stories.length > 0) {
      this.mapService.fitBounds(this.stories)
    }
  }

  toggleSatelliteView() {
    this.isSatelliteView = !this.isSatelliteView
    this.mapService.toggleSatelliteView(this.isSatelliteView)
    this.view.updateSatelliteButton(this.isSatelliteView)
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen
    const mapContainer = this.view.getMapContainer()

    if (this.isFullscreen) {
      mapContainer.classList.add("fullscreen-map")
      document.body.style.overflow = "hidden"
    } else {
      mapContainer.classList.remove("fullscreen-map")
      document.body.style.overflow = "auto"
    }

    this.view.updateFullscreenButton(this.isFullscreen)

    // Invalidate map size after fullscreen toggle
    setTimeout(() => {
      this.mapService.invalidateSize()
    }, 100)
  }

  cleanup() {
    this.mapService.cleanup()
    document.body.style.overflow = "auto"
  }
}
