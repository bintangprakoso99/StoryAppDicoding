// Simple hash-based router for SPA
export class Router {
  constructor() {
    this.routes = {}
    this.currentRoute = null
  }

  addRoute(path, handler) {
    this.routes[path] = handler
  }

  init() {
    window.addEventListener("hashchange", () => this.handleRoute())
    window.addEventListener("load", () => this.handleRoute())
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || "/"
    const [path, ...params] = hash.split("/")
    const fullPath = "/" + (path || "")

    // Handle parameterized routes (like /story/:id)
    const matchedRoute = this.findMatchingRoute(hash)
    if (matchedRoute) {
      this.currentRoute = hash
      this.applyPageTransition(() => {
        matchedRoute.handler(...matchedRoute.params)
      })
    } else if (this.routes[fullPath]) {
      this.currentRoute = fullPath
      this.applyPageTransition(() => {
        this.routes[fullPath]()
      })
    } else {
      // Default fallback
      this.navigate("/home")
    }
  }

  findMatchingRoute(hash) {
    for (const [route, handler] of Object.entries(this.routes)) {
      const routeParts = route.split("/")
      const hashParts = hash.split("/")

      if (routeParts.length === hashParts.length) {
        const params = []
        let isMatch = true

        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(":")) {
            params.push(hashParts[i])
          } else if (routeParts[i] !== hashParts[i]) {
            isMatch = false
            break
          }
        }

        if (isMatch) {
          return { handler, params }
        }
      }
    }
    return null
  }

  navigate(path) {
    window.location.hash = path
  }

  applyPageTransition(callback) {
    const container = document.getElementById("app-container")

    // Use View Transition API if supported
    if ("startViewTransition" in document) {
      document.startViewTransition(() => {
        callback()
      })
    } else {
      // Fallback animation
      container.style.opacity = "0"
      container.style.transform = "translateY(20px)"

      setTimeout(() => {
        callback()
        container.style.transition = "opacity 0.3s ease, transform 0.3s ease"
        container.style.opacity = "1"
        container.style.transform = "translateY(0)"
      }, 150)
    }
  }
}
