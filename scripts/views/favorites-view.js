// Favorites View - Display saved stories from IndexedDB
export class FavoritesView {
  constructor() {
    this.container = null
  }

  init() {
    this.container = document.getElementById("app-container")
  }

  showLoading() {
    this.container.innerHTML = `
      <section role="main" aria-labelledby="favorites-heading">
        <h1 id="favorites-heading">Favorite Stories</h1>
        <div class="loading" aria-live="polite">Loading favorite stories...</div>
      </section>
    `
  }

  showError(message) {
    this.container.innerHTML = `
      <section role="main" aria-labelledby="favorites-heading">
        <h1 id="favorites-heading">Favorite Stories</h1>
        <div class="error" role="alert">${message}</div>
        <button class="btn btn-primary" id="retry-btn">Try Again</button>
      </section>
    `
  }

  render(favorites) {
    this.container.innerHTML = `
      <section role="main" aria-labelledby="favorites-heading">
        <div class="page-header">
          <h1 id="favorites-heading">Favorite Stories</h1>
          <div class="page-actions">
            <button id="clear-favorites-btn" class="btn btn-danger" ${favorites.length === 0 ? "disabled" : ""}>
              🗑️ Clear All Favorites
            </button>
            <button id="export-favorites-btn" class="btn btn-secondary" ${favorites.length === 0 ? "disabled" : ""}>
              📤 Export Favorites
            </button>
          </div>
        </div>
        
        <div class="favorites-stats">
          <p class="stats-text">
            📚 You have <strong>${favorites.length}</strong> favorite ${favorites.length === 1 ? "story" : "stories"}
          </p>
        </div>

        <div class="favorites-grid" role="list">
          ${this.renderFavorites(favorites)}
        </div>
      </section>
    `
  }

  renderFavorites(favorites) {
    if (favorites.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">💔</div>
          <h2>No Favorite Stories Yet</h2>
          <p>Start adding stories to your favorites by clicking the heart icon on any story!</p>
          <a href="#/home" class="btn btn-primary">Browse Stories</a>
        </div>
      `
    }

    return favorites
      .map(
        (story) => `
        <article class="story-card favorite-card" role="listitem">
          <button class="story-card-button" data-story-id="${story.id}" aria-label="View story by ${story.name}">
            <img 
              src="${story.photoUrl}" 
              alt="Story photo by ${story.name}: ${story.description.substring(0, 50)}..."
              class="story-image"
              loading="lazy"
            />
            <div class="story-content">
              <h3 class="story-title">${story.name}</h3>
              <p class="story-description">${story.description.length > 100 ? story.description.substring(0, 100) + "..." : story.description}</p>
              <div class="story-meta">
                <time datetime="${story.createdAt}">
                  ${new Date(story.createdAt).toLocaleDateString()}
                </time>
                <span class="favorite-badge">❤️ Favorite</span>
              </div>
              <div class="favorite-actions">
                <time class="added-date" datetime="${story.addedAt}">
                  Added: ${new Date(story.addedAt).toLocaleDateString()}
                </time>
                <button 
                  class="btn btn-sm btn-danger remove-favorite-btn" 
                  data-story-id="${story.id}"
                  aria-label="Remove ${story.name} from favorites"
                >
                  💔 Remove
                </button>
              </div>
            </div>
          </button>
        </article>
      `,
      )
      .join("")
  }

  showMessage(message, type) {
    const existingMessage = document.getElementById("favorites-message")
    if (existingMessage) {
      existingMessage.remove()
    }

    const messageEl = document.createElement("div")
    messageEl.id = "favorites-message"
    messageEl.className = type
    messageEl.textContent = message
    messageEl.setAttribute("role", "alert")
    messageEl.setAttribute("aria-live", "polite")

    const header = document.querySelector(".page-header")
    if (header) {
      header.insertAdjacentElement("afterend", messageEl)

      setTimeout(() => {
        messageEl.remove()
      }, 5000)
    }
  }

  getRetryButton() {
    return document.getElementById("retry-btn")
  }

  getClearFavoritesButton() {
    return document.getElementById("clear-favorites-btn")
  }

  getExportFavoritesButton() {
    return document.getElementById("export-favorites-btn")
  }

  downloadFile(data, filename) {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = filename
    link.click()

    URL.revokeObjectURL(link.href)
  }

  bindEvents(handlers) {
    // Story click
    this.container.addEventListener("click", (event) => {
      const button = event.target.closest(".story-card-button")
      if (button && !event.target.closest(".remove-favorite-btn")) {
        const storyId = button.dataset.storyId
        handlers.onStoryClick(storyId)
      }
    })

    // Remove favorite
    this.container.addEventListener("click", (event) => {
      if (event.target.closest(".remove-favorite-btn")) {
        event.stopPropagation()
        const button = event.target.closest(".remove-favorite-btn")
        const storyId = button.dataset.storyId
        handlers.onRemoveFavorite(storyId)
      }
    })

    // Retry button
    const retryBtn = this.getRetryButton()
    if (retryBtn) {
      retryBtn.addEventListener("click", handlers.onRetry)
    }

    // Clear favorites
    const clearBtn = this.getClearFavoritesButton()
    if (clearBtn) {
      clearBtn.addEventListener("click", handlers.onClearFavorites)
    }

    // Export favorites
    const exportBtn = this.getExportFavoritesButton()
    if (exportBtn) {
      exportBtn.addEventListener("click", handlers.onExportFavorites)
    }
  }
}
