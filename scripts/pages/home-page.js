// Home Page - Coordinates presenter and handles page lifecycle
import { HomePresenter } from "../presenters/home-presenter.js"

export class HomePage {
  constructor(router) {
    this.router = router
    this.presenter = null
  }

  async render() {
    this.presenter = new HomePresenter(this.router)
    await this.presenter.init()
  }

  destroy() {
    if (this.presenter) {
      this.presenter.cleanup?.()
    }
  }
}
