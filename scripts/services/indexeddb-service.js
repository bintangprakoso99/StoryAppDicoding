// IndexedDB Service for offline data storage
export class IndexedDBService {
  constructor() {
    this.dbName = "DicodingStoriesDB"
    this.version = 1
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"))
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Stories object store
        if (!db.objectStoreNames.contains("stories")) {
          const storiesStore = db.createObjectStore("stories", { keyPath: "id" })
          storiesStore.createIndex("createdAt", "createdAt", { unique: false })
          storiesStore.createIndex("name", "name", { unique: false })
        }

        // Favorites object store
        if (!db.objectStoreNames.contains("favorites")) {
          const favoritesStore = db.createObjectStore("favorites", { keyPath: "id" })
          favoritesStore.createIndex("addedAt", "addedAt", { unique: false })
        }

        // Offline queue object store
        if (!db.objectStoreNames.contains("offlineQueue")) {
          const queueStore = db.createObjectStore("offlineQueue", { keyPath: "id", autoIncrement: true })
          queueStore.createIndex("timestamp", "timestamp", { unique: false })
          queueStore.createIndex("type", "type", { unique: false })
        }
      }
    })
  }

  async saveStories(stories) {
    if (!this.db) await this.init()

    const transaction = this.db.transaction(["stories"], "readwrite")
    const store = transaction.objectStore("stories")

    const promises = stories.map((story) => {
      return new Promise((resolve, reject) => {
        const request = store.put({
          ...story,
          cachedAt: new Date().toISOString(),
        })
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })

    return Promise.all(promises)
  }

  async getStories() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["stories"], "readonly")
      const store = transaction.objectStore("stories")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(request.error)
    })
  }

  async addToFavorites(story) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["favorites"], "readwrite")
      const store = transaction.objectStore("favorites")
      const request = store.put({
        ...story,
        addedAt: new Date().toISOString(),
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getFavorites() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["favorites"], "readonly")
      const store = transaction.objectStore("favorites")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(request.error)
    })
  }

  async removeFromFavorites(storyId) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["favorites"], "readwrite")
      const store = transaction.objectStore("favorites")
      const request = store.delete(storyId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async addToOfflineQueue(action) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["offlineQueue"], "readwrite")
      const store = transaction.objectStore("offlineQueue")
      const request = store.add({
        ...action,
        timestamp: new Date().toISOString(),
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getOfflineQueue() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["offlineQueue"], "readonly")
      const store = transaction.objectStore("offlineQueue")
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearOfflineQueue() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["offlineQueue"], "readwrite")
      const store = transaction.objectStore("offlineQueue")
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearAllData() {
    if (!this.db) await this.init()

    const storeNames = ["stories", "favorites", "offlineQueue"]
    const promises = storeNames.map((storeName) => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    })

    return Promise.all(promises)
  }
}
