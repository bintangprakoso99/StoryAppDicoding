// Login View - Pure DOM manipulation with proper label associations
export class LoginView {
  constructor() {
    this.container = null
  }

  init() {
    this.container = document.getElementById("app-container")
  }

  render(isRegister = false) {
    const title = isRegister ? "Register" : "Login"
    const submitText = isRegister ? "Register" : "Login"
    const switchText = isRegister
      ? 'Already have an account? <button type="button" id="switch-to-login" class="link-button">Login here</button>'
      : 'Don\'t have an account? <button type="button" id="switch-to-register" class="link-button">Register here</button>'

    this.container.innerHTML = `
      <section class="form-container" role="main" aria-labelledby="auth-heading">
        <h1 id="auth-heading">${title}</h1>
        <div id="message" class="error" style="display: none;" role="alert" aria-live="polite"></div>
        
        <form id="auth-form" novalidate>
          ${
            isRegister
              ? `
              <div class="form-group">
                <label for="user-name" class="form-label">
                  Full Name <span class="required-indicator" aria-label="required">*</span>
                </label>
                <input 
                  type="text" 
                  id="user-name" 
                  name="name" 
                  class="form-input" 
                  required 
                  aria-describedby="name-error"
                  autocomplete="name"
                />
                <div id="name-error" class="error" style="display: none;" role="alert"></div>
              </div>
            `
              : ""
          }
          
          <div class="form-group">
            <label for="user-email" class="form-label">
              Email Address <span class="required-indicator" aria-label="required">*</span>
            </label>
            <input 
              type="email" 
              id="user-email" 
              name="email" 
              class="form-input" 
              required 
              aria-describedby="email-error"
              autocomplete="email"
            />
            <div id="email-error" class="error" style="display: none;" role="alert"></div>
          </div>
          
          <div class="form-group">
            <label for="user-password" class="form-label">
              Password <span class="required-indicator" aria-label="required">*</span>
            </label>
            <input 
              type="password" 
              id="user-password" 
              name="password" 
              class="form-input" 
              required 
              minlength="8"
              aria-describedby="password-error password-help"
              autocomplete="${isRegister ? "new-password" : "current-password"}"
            />
            <div id="password-help" class="form-help">
              Password must be at least 8 characters long
            </div>
            <div id="password-error" class="error" style="display: none;" role="alert"></div>
          </div>
          
          <button type="submit" class="btn btn-primary" id="submit-btn">
            ${submitText}
          </button>
        </form>
        
        <p class="auth-switch">
          ${switchText}
        </p>
      </section>
    `
  }

  showMessage(message, type) {
    const messageEl = document.getElementById("message")
    messageEl.textContent = message
    messageEl.className = type
    messageEl.style.display = "block"
  }

  showFieldError(elementId, message) {
    const errorEl = document.getElementById(elementId)
    errorEl.textContent = message
    errorEl.style.display = "block"
  }

  clearErrors() {
    const errorElements = document.querySelectorAll(".error")
    errorElements.forEach((el) => {
      el.style.display = "none"
      el.textContent = ""
    })
  }

  getFormData() {
    const formData = new FormData(document.getElementById("auth-form"))
    return {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    }
  }

  setSubmitButtonState(loading) {
    const submitBtn = document.getElementById("submit-btn")
    if (loading) {
      submitBtn.disabled = true
      submitBtn.textContent = "Processing..."
      submitBtn.setAttribute("aria-busy", "true")
    } else {
      submitBtn.disabled = false
      submitBtn.textContent = submitBtn.textContent.includes("Register") ? "Register" : "Login"
      submitBtn.setAttribute("aria-busy", "false")
    }
  }

  bindEvents(handlers) {
    document.getElementById("auth-form").addEventListener("submit", handlers.onSubmit)

    // Switch between login/register
    const switchBtn = document.getElementById("switch-to-login") || document.getElementById("switch-to-register")
    if (switchBtn) {
      switchBtn.addEventListener("click", handlers.onSwitchMode)
    }
  }
}
