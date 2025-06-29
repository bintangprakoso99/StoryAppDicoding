// Add Story Page - Coordinates presenter and handles page lifecycle
import { AddStoryPresenter } from "../presenters/add-story-presenter.js"

export class AddStoryPage {
  constructor(router) {
    this.router = router
    this.presenter = null
  }

  render() {
    this.presenter = new AddStoryPresenter(this.router)
    this.presenter.init()
  }

  destroy() {
    if (this.presenter) {
      this.presenter.cleanup()
    }
  }
}
