// Settings Page - Coordinates settings presenter
import { SettingsPresenter } from "../presenters/settings-presenter.js"

export class SettingsPage {
  constructor(router) {
    this.router = router
    this.presenter = null
  }

  render() {
    this.presenter = new SettingsPresenter()
    this.presenter.init()
  }

  destroy() {
    // Cleanup if needed
  }
}
