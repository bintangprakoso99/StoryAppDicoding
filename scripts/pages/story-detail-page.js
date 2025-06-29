// Story Detail Page - Coordinates story detail presenter
import { StoryDetailPresenter } from "../presenters/story-detail-presenter.js"
import { StoryService } from "../services/story-service.js"

export class StoryDetailPage {
  constructor(router, storyId) {
    this.router = router
    this.storyId = storyId
    this.presenter = null
  }

  async render() {
    const storyService = new StoryService()
    this.presenter = new StoryDetailPresenter(storyService, this.storyId, this.router)
    await this.presenter.init()
  }

  destroy() {
    if (this.presenter) {
      this.presenter.cleanup?.()
    }
  }
}
