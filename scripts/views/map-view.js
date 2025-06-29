// Map View - Dedicated map page view
export class MapView {
  constructor() {
    this.container = document.getElementById("app-container")
  }

  showLoading() {
    this.container.innerHTML = `
      <section role="main" aria-labelledby="map-heading">
        <h1 id="map-heading">Story Locations Map</h1>
        <div class="loading" aria-live="polite">Loading story locations...</div>
      </section>
    `
  }

  showError(message) {
    this.container.innerHTML = `
      <section role="main" aria-labelledby="map-heading">
        <h1 id="map-heading">Story Locations Map</h1>
        <div class="error" role="alert">${message}</div>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </section>
    `
  }

  render(storiesCount = 0) {
    this.container.innerHTML = `
      <section role="main" aria-labelledby="map-heading">
        <div class="page-header">
          <h1 id="map-heading">Story Locations Map</h1>
        </div>
        
        <div class="map-info">
          <p class="map-description">
            🗺️ Explore stories from around the world! Click on markers to view story details.
          </p>
          <div class="map-stats">
            <span class="stat-item">
              📍 <strong>${storiesCount}</strong> stories with locations
            </span>
          </div>
        </div>

        <div class="map-controls">
          <button id="center-map-btn" class="btn btn-secondary">
            🎯 Center Map
          </button>
          <button id="toggle-satellite-btn" class="btn btn-secondary">
            🛰️ Satellite View
          </button>
          <button id="fullscreen-map-btn" class="btn btn-secondary">
            🔍 Fullscreen
          </button>
        </div>

        <div id="stories-map" class="map-container-large" role="application" aria-label="Interactive map showing all story locations"></div>
        
        <div class="map-legend">
          <h2>Map Legend</h2>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-marker">📍</span>
              <span>Story Location</span>
            </div>
            <div class="legend-item">
              <span class="legend-marker">🏠</span>
              <span>Your Location</span>
            </div>
          </div>
        </div>

        ${
          storiesCount === 0
            ? `
          <div class="empty-state" style="margin-top: 2rem;">
            <div class="empty-icon">🗺️</div>
            <h2>No Stories with Locations Yet</h2>
            <p>Stories with location data will appear on this map.</p>
            <a href="#/add-story" class="btn btn-primary">Add Story with Location</a>
          </div>
        `
            : ""
        }
      </section>
    `
  }

  getMapContainer() {
    return document.getElementById("stories-map")
  }

  bindEvents(handlers) {
    // Map control buttons
    const centerBtn = document.getElementById("center-map-btn")
    const satelliteBtn = document.getElementById("toggle-satellite-btn")
    const fullscreenBtn = document.getElementById("fullscreen-map-btn")

    if (centerBtn) centerBtn.addEventListener("click", handlers.onCenterMap)
    if (satelliteBtn) satelliteBtn.addEventListener("click", handlers.onToggleSatellite)
    if (fullscreenBtn) fullscreenBtn.addEventListener("click", handlers.onToggleFullscreen)
  }

  updateSatelliteButton(isSatellite) {
    const btn = document.getElementById("toggle-satellite-btn")
    if (btn) {
      btn.textContent = isSatellite ? "🗺️ Street View" : "🛰️ Satellite View"
    }
  }

  updateFullscreenButton(isFullscreen) {
    const btn = document.getElementById("fullscreen-map-btn")
    if (btn) {
      btn.textContent = isFullscreen ? "📱 Exit Fullscreen" : "🔍 Fullscreen"
    }
  }
}
