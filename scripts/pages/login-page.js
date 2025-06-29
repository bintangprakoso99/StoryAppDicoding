// Login Page - Coordinates presenter and handles page lifecycle
import { LoginPresenter } from "../presenters/login-presenter.js"

export class LoginPage {
  constructor(router, isRegister = false) {
    this.router = router
    this.isRegister = isRegister
    this.presenter = null
  }

  render() {
    this.presenter = new LoginPresenter(this.router, this.isRegister)
    this.presenter.init()
  }

  destroy() {
    // Cleanup if needed
  }
}
