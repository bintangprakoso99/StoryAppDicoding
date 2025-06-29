// Enhanced Map Service - Handles map functionality
import L from "leaflet"

export class MapService {
  constructor() {
    this.map = null
    this.markers = []
    this.locationMarker = null
    this.satelliteLayer = null
    this.streetLayer = null
  }

  initializeMap(container, stories) {
    this.map = L.map(container).setView([-6.2088, 106.8456], 5)

    this.streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map)

    this.addStoryMarkers(stories)
  }

  initializeFullMap(container, stories, onStoryClick) {
    this.map = L.map(container).setView([-6.2088, 106.8456], 5)

    // Street layer
    this.streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map)

    // Satellite layer (alternative tile source)
    this.satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri, Maxar, Earthstar Geographics",
      },
    )

    this.addStoryMarkers(stories, onStoryClick)

    // Fit map to show all markers
    if (stories.length > 0) {
      this.fitBounds(stories)
    }
  }

  initializeLocationMap(container, onLocationSelect) {
    this.map = L.map(container).setView([-6.2088, 106.8456], 10)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(this.map)

    this.map.on("click", (e) => {
      this.selectLocation(e.latlng, onLocationSelect)
    })
  }

  addStoryMarkers(stories, onStoryClick = null) {
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map)

        const popupContent = `
          <div class="story-popup">
            <h4>${story.name}</h4>
            <p>${story.description.length > 100 ? story.description.substring(0, 100) + "..." : story.description}</p>
            <small>${new Date(story.createdAt).toLocaleDateString()}</small>
            ${onStoryClick ? `<br><button onclick="window.storyClickHandler('${story.id}')" class="btn btn-primary btn-sm">View Story</button>` : ""}
          </div>
        `

        marker.bindPopup(popupContent)
        this.markers.push(marker)
      }
    })

    // Set up global story click handler
    if (onStoryClick) {
      window.storyClickHandler = onStoryClick
    }
  }

  selectLocation(latlng, callback) {
    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker)
    }

    this.locationMarker = L.marker([latlng.lat, latlng.lng])
      .addTo(this.map)
      .bindPopup(`
        <div style="text-align: center;">
          <strong>Selected Location</strong><br>
          Lat: ${latlng.lat.toFixed(6)}<br>
          Lng: ${latlng.lng.toFixed(6)}
        </div>
      `)
      .openPopup()

    const location = { lat: latlng.lat, lon: latlng.lng }
    callback(location)
  }

  setLocation(location) {
    if (this.map) {
      this.map.setView([location.lat, location.lon], 15)
      this.selectLocation({ lat: location.lat, lng: location.lon }, () => {})
    }
  }

  clearLocation() {
    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker)
      this.locationMarker = null
    }
  }

  fitBounds(stories) {
    if (stories.length === 0) return

    const group = new L.featureGroup(this.markers)
    this.map.fitBounds(group.getBounds().pad(0.1))
  }

  toggleSatelliteView(isSatellite) {
    if (isSatellite) {
      this.map.removeLayer(this.streetLayer)
      this.map.addLayer(this.satelliteLayer)
    } else {
      this.map.removeLayer(this.satelliteLayer)
      this.map.addLayer(this.streetLayer)
    }
  }

  invalidateSize() {
    if (this.map) {
      this.map.invalidateSize()
    }
  }

  cleanup() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.markers = []
    this.locationMarker = null

    // Clean up global handler
    if (window.storyClickHandler) {
      delete window.storyClickHandler
    }
  }
}
