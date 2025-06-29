// Enhanced Service Worker for PWA with offline support
const CACHE_NAME = "dicoding-stories-v3"
const STATIC_CACHE = "static-v3"
const DYNAMIC_CACHE = "dynamic-v3"
const IMAGE_CACHE = "images-v3"

// Static assets to cache
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./styles/story-detail.css",
  "./styles/add-story.css",
  "./manifest.json",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Caching static assets")
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error("Failed to cache static assets:", error)
        // Cache individual assets that are available
        return Promise.allSettled(
          STATIC_ASSETS.map((url) => cache.add(url).catch((err) => console.warn(`Failed to cache ${url}:`, err))),
        )
      })
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Handle API requests
  if (url.origin === "https://story-api.dicoding.dev") {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle image requests
  if (request.destination === "image" || url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    event.respondWith(handleImageRequest(request))
    return
  }

  // Handle static assets
  if (STATIC_ASSETS.some((asset) => request.url.includes(asset.replace("./", "")))) {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Default: try network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
      }),
  )
})

// Handle API requests - Network first, cache fallback
async function handleApiRequest(request) {
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const responseClone = response.clone()
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, responseClone)
    }
    return response
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline fallback for API requests
    return new Response(
      JSON.stringify({
        error: true,
        message: "You are offline. Please check your internet connection.",
        offline: true,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Handle image requests - Cache first
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const responseClone = response.clone()
      const cache = await caches.open(IMAGE_CACHE)
      cache.put(request, responseClone)
    }
    return response
  } catch (error) {
    // Return placeholder image for offline
    return caches.match("./icons/icon-192x192.png")
  }
}

// Handle static requests - Cache first
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const responseClone = response.clone()
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, responseClone)
    }
    return response
  } catch (error) {
    throw error
  }
}

// Handle navigation requests - Return app shell
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request)
    return response
  } catch (error) {
    const cachedResponse = await caches.match("./index.html")
    return cachedResponse || new Response("Offline", { status: 503 })
  }
}

// Push event - handle push notifications
self.addEventListener("push", (event) => {
  console.log("Push event received")

  let title = "Dicoding Stories"
  const options = {
    body: "You have a new notification!",
    icon: "./icons/icon-192x192.png",
    badge: "./icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Stories",
        icon: "./icons/icon-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "./icons/icon-192x192.png",
      },
    ],
    requireInteraction: true,
  }

  if (event.data) {
    try {
      const data = event.data.json()
      title = data.title || title
      options.body = data.body || options.body
      options.data = { ...options.data, ...data.data }
    } catch (error) {
      console.log("Error parsing push data:", error)
    }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked")
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(
      clients.openWindow("./#/home").catch(() => {
        clients.openWindow("./")
      }),
    )
  } else if (event.action === "close") {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus()
        }
        return clients.openWindow("./")
      }),
    )
  }
})

// Background sync event (for offline queue)
self.addEventListener("sync", (event) => {
  console.log("Background sync event:", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData())
  }
})

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // This would sync with IndexedDB offline queue
    console.log("Syncing offline data...")

    // Send message to main thread to handle sync
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC",
        payload: { action: "sync-offline-data" },
      })
    })
  } catch (error) {
    console.error("Error syncing offline data:", error)
  }
}

// Message event - handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
