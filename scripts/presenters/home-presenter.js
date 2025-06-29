// Home Presenter - Pure business logic, no DOM manipulation or Web API calls
import { HomeView } from "../views/home-view.js"
import { StoryModel } from "../models/story-model.js"
import { MapService } from "../services/map-service.js"

export class HomePresenter {
  constructor(router) {
    this.storyModel = new StoryModel()
    this.mapService = new MapService()
    this.router = router
    this.view = new HomeView()
    this.stories = []
  }

  async init() {
    this.view.init()
    this.view.showLoading()
    await this.loadStories()
    this.initializeMap()
    this.bindEvents()
  }

  async loadStories() {
    try {
      const result = await this.storyModel.getAllStories(1, 20, 1)

      if (result.success) {
        this.stories = result.data
        this.view.render(this.stories)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.view.showError(error.message || "Failed to load stories")
    }
  }

  initializeMap() {
    const mapContainer = this.view.getMapContainer()
    if (mapContainer && this.stories.length > 0) {
      this.mapService.initializeMap(mapContainer, this.stories)
    }
  }

  bindEvents() {
    this.view.bindStoryClick((storyId) => {
      this.router.navigate(`/story/${storyId}`)
    })

    this.view.bindRetryClick(() => {
      this.loadStories()
    })
  }

  cleanup() {
    this.mapService.cleanup()
  }
}
