// Favorites Page - Coordinates favorites presenter
import { FavoritesPresenter } from "../presenters/favorites-presenter.js"

export class FavoritesPage {
  constructor(router) {
    this.router = router
    this.presenter = null
  }

  async render() {
    this.presenter = new FavoritesPresenter(this.router)
    await this.presenter.init()
  }

  destroy() {
    // Cleanup if needed
  }
}
