// Login Presenter - Pure business logic, no DOM manipulation
import { LoginView } from "../views/login-view.js"
import { AuthModel } from "../models/auth-model.js"

export class LoginPresenter {
  constructor(router, isRegister = false) {
    this.authModel = new AuthModel()
    this.router = router
    this.view = new LoginView()
    this.isRegister = isRegister
  }

  init() {
    this.view.init()
    this.view.render(this.isRegister)
    this.bindEvents()
  }

  bindEvents() {
    this.view.bindEvents({
      onSubmit: (e) => this.handleSubmit(e),
      onSwitchMode: () => this.switchMode(),
    })
  }

  switchMode() {
    this.isRegister = !this.isRegister
    this.view.render(this.isRegister)
    this.bindEvents()
  }

  async handleSubmit(event) {
    event.preventDefault()

    const formData = this.view.getFormData()
    this.view.clearErrors()

    if (!this.validateForm(formData)) {
      return
    }

    this.view.setSubmitButtonState(true)

    try {
      let result
      if (this.isRegister) {
        result = await this.authModel.register(formData.name, formData.email, formData.password)
        if (result.success) {
          this.view.showMessage("Registration successful! Please login.", "success")
          setTimeout(() => {
            this.switchMode()
          }, 2000)
        } else {
          this.view.showMessage(result.message, "error")
        }
      } else {
        result = await this.authModel.login(formData.email, formData.password)
        if (result.success) {
          this.router.navigate("/home")
        } else {
          this.view.showMessage(result.message, "error")
        }
      }
    } catch (error) {
      this.view.showMessage("An error occurred. Please try again.", "error")
    } finally {
      this.view.setSubmitButtonState(false)
    }
  }

  validateForm(formData) {
    let isValid = true

    if (this.isRegister && (!formData.name || formData.name.trim().length < 2)) {
      this.view.showFieldError("name-error", "Name must be at least 2 characters long")
      isValid = false
    }

    if (!formData.email || !formData.email.includes("@")) {
      this.view.showFieldError("email-error", "Please enter a valid email address")
      isValid = false
    }

    if (!formData.password || formData.password.length < 8) {
      this.view.showFieldError("password-error", "Password must be at least 8 characters long")
      isValid = false
    }

    return isValid
  }
}
