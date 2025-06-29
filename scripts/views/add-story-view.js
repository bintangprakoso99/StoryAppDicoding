// Add Story View - Handles DOM manipulation only
export class AddStoryView {
  constructor() {
    this.container = null
  }

  init() {
    this.container = document.getElementById("app-container")
  }

  render() {
    this.container.innerHTML = `
      <section role="main" aria-labelledby="add-story-heading">
        <h1 id="add-story-heading">Add New Story</h1>
        <div id="message" class="error" style="display: none;" role="alert" aria-live="polite"></div>
        
        <form id="story-form" novalidate>
          <div class="form-group">
            <label for="story-description" class="form-label">
              Story Description <span class="required-indicator" aria-label="required">*</span>
            </label>
            <textarea 
              id="story-description" 
              name="description" 
              class="form-textarea" 
              required 
              placeholder="Tell us about your story... (minimum 10 characters)"
              aria-describedby="description-help description-error"
              maxlength="500"
            ></textarea>
            <div id="description-help" class="form-help">
              <span id="char-count" aria-live="polite">0/500 characters</span>
            </div>
            <div id="description-error" class="error" style="display: none;" role="alert"></div>
          </div>

          <fieldset class="form-group">
            <legend class="form-label">
              Photo <span class="required-indicator" aria-label="required">*</span>
            </legend>
            <div class="camera-container">
              <video 
                id="camera-preview" 
                class="camera-preview" 
                style="display: none;" 
                autoplay 
                muted
                aria-label="Camera preview"
              ></video>
              
              <canvas 
                id="photo-canvas" 
                class="camera-preview" 
                style="display: none;"
                aria-label="Photo processing canvas"
              ></canvas>
              
              <img 
                id="captured-photo" 
                class="camera-preview" 
                style="display: none;" 
                alt="Captured photo preview"
              />
              
              <div class="camera-controls">
                <button type="button" id="start-camera-btn" class="btn btn-primary">
                  📷 Start Camera
                </button>
                <button type="button" id="capture-btn" class="btn btn-success" style="display: none;">
                  📸 Capture Photo
                </button>
                <button type="button" id="retake-btn" class="btn btn-danger" style="display: none;">
                  🔄 Retake Photo
                </button>
                <button type="button" id="stop-camera-btn" class="btn btn-secondary" style="display: none;">
                  ⏹️ Stop Camera
                </button>
              </div>

              <div class="filter-section">
                <fieldset>
                  <legend class="form-label">Photo Filters (Optional)</legend>
                  <div class="filter-controls" style="display: none;" id="filter-controls" role="group" aria-label="Photo filters">
                    <button type="button" class="btn filter-btn active" data-filter="none">Original</button>
                    <button type="button" class="btn filter-btn" data-filter="grayscale">Grayscale</button>
                    <button type="button" class="btn filter-btn" data-filter="sepia">Sepia</button>
                    <button type="button" class="btn filter-btn" data-filter="vintage">Vintage</button>
                    <button type="button" class="btn filter-btn" data-filter="bright">Bright</button>
                    <button type="button" class="btn filter-btn" data-filter="contrast">Contrast</button>
                  </div>
                </fieldset>
              </div>
              
              <div class="upload-section">
                <label for="photo-upload-input" class="btn btn-outline">
                  📁 Or Upload from Device
                </label>
                <input 
                  type="file" 
                  id="photo-upload-input" 
                  accept="image/*" 
                  style="display: none;"
                  aria-describedby="upload-help"
                />
                <div id="upload-help" class="form-help">
                  Supported formats: JPG, PNG, GIF (max 1MB)
                </div>
              </div>
            </div>
            <div id="photo-error" class="error" style="display: none;" role="alert"></div>
          </fieldset>

          <fieldset class="form-group">
            <legend class="form-label">Location (Optional)</legend>
            <p class="form-help">
              Click on the map to select a location for your story. You can also use the buttons below to get your current location.
            </p>
            
            <div class="location-controls">
              <button type="button" id="get-current-location-btn" class="btn btn-secondary">
                📍 Use Current Location
              </button>
              <button type="button" id="clear-location-btn" class="btn btn-outline" style="display: none;">
                🗑️ Clear Location
              </button>
            </div>
            
            <div id="location-map" class="map-container" role="application" aria-label="Interactive map for location selection"></div>
            <div id="selected-location" class="location-info" aria-live="polite"></div>
          </fieldset>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-large" id="submit-story-btn">
              🚀 Share Story
            </button>
            <button type="button" class="btn btn-outline" id="cancel-btn">
              ❌ Cancel
            </button>
          </div>
        </form>
      </section>
    `
  }

  showMessage(message, type) {
    const messageEl = document.getElementById("message")
    messageEl.textContent = message
    messageEl.className = type
    messageEl.style.display = "block"

    if (type === "success") {
      setTimeout(() => {
        messageEl.style.display = "none"
      }, 5000)
    }
  }

  showFieldError(elementId, message) {
    const errorEl = document.getElementById(elementId)
    errorEl.textContent = message
    errorEl.style.display = "block"
    errorEl.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  clearErrors() {
    const errorElements = document.querySelectorAll(".error")
    errorElements.forEach((el) => {
      el.style.display = "none"
      el.textContent = ""
    })
  }

  updateCharCount(count) {
    const charCount = document.getElementById("char-count")
    charCount.textContent = `${count}/500 characters`

    if (count > 450) {
      charCount.style.color = "#e74c3c"
    } else if (count > 400) {
      charCount.style.color = "#f39c12"
    } else {
      charCount.style.color = "#666"
    }
  }

  getFormData() {
    return {
      description: document.getElementById("story-description").value.trim(),
    }
  }

  getMapContainer() {
    return document.getElementById("location-map")
  }

  showCameraPreview(stream) {
    const video = document.getElementById("camera-preview")
    video.srcObject = stream
    video.style.display = "block"
  }

  hideCameraPreview() {
    const video = document.getElementById("camera-preview")
    video.style.display = "none"
    video.srcObject = null
  }

  showCapturedPhoto(blob) {
    const img = document.getElementById("captured-photo")
    img.src = URL.createObjectURL(blob)
    img.style.display = "block"
  }

  updateButtonStates(state) {
    const buttons = {
      start: document.getElementById("start-camera-btn"),
      capture: document.getElementById("capture-btn"),
      retake: document.getElementById("retake-btn"),
      stop: document.getElementById("stop-camera-btn"),
    }

    // Hide all buttons first
    Object.values(buttons).forEach((btn) => (btn.style.display = "none"))

    // Show relevant buttons based on state
    switch (state) {
      case "initial":
        buttons.start.style.display = "inline-block"
        break
      case "camera-active":
        buttons.capture.style.display = "inline-block"
        buttons.stop.style.display = "inline-block"
        break
      case "photo-captured":
        buttons.retake.style.display = "inline-block"
        document.getElementById("filter-controls").style.display = "flex"
        break
    }
  }

  updateLocationDisplay(location) {
    const locationEl = document.getElementById("selected-location")
    if (location) {
      locationEl.innerHTML = `
        <strong>📍 Selected Location:</strong><br>
        Latitude: ${location.lat.toFixed(6)}<br>
        Longitude: ${location.lon.toFixed(6)}
      `
      document.getElementById("clear-location-btn").style.display = "inline-block"
    } else {
      locationEl.innerHTML = ""
      document.getElementById("clear-location-btn").style.display = "none"
    }
  }

  bindEvents(handlers) {
    // Form submission
    document.getElementById("story-form").addEventListener("submit", handlers.onSubmit)

    // Character counter
    document.getElementById("story-description").addEventListener("input", handlers.onDescriptionInput)

    // Camera controls
    document.getElementById("start-camera-btn").addEventListener("click", handlers.onStartCamera)
    document.getElementById("capture-btn").addEventListener("click", handlers.onCapturePhoto)
    document.getElementById("retake-btn").addEventListener("click", handlers.onRetakePhoto)
    document.getElementById("stop-camera-btn").addEventListener("click", handlers.onStopCamera)

    // File upload
    document.getElementById("photo-upload-input").addEventListener("change", handlers.onFileUpload)

    // Location controls
    document.getElementById("get-current-location-btn").addEventListener("click", handlers.onGetCurrentLocation)
    document.getElementById("clear-location-btn").addEventListener("click", handlers.onClearLocation)

    // Cancel button
    document.getElementById("cancel-btn").addEventListener("click", handlers.onCancel)

    // Filter controls
    this.container.addEventListener("click", (e) => {
      if (e.target.classList.contains("filter-btn")) {
        handlers.onFilterSelect(e.target.dataset.filter)
        document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
        e.target.classList.add("active")
      }
    })
  }
}
