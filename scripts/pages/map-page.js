// Map Page - Coordinates map presenter
import { MapPresenter } from "../presenters/map-presenter.js"
import { StoryService } from "../services/story-service.js"
import { MapService } from "../services/map-service.js"

export class MapPage {
  constructor(router) {
    this.router = router
    this.presenter = null
  }

  async render() {
    const storyService = new StoryService()
    const mapService = new MapService()

    this.presenter = new MapPresenter(storyService, mapService, this.router)
    await this.presenter.init()
  }

  destroy() {
    if (this.presenter) {
      this.presenter.cleanup()
    }
  }
}
