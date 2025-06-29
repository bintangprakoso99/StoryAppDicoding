import { AuthService } from "../scripts/services/auth-service.js"

describe("AuthService", () => {
  let authService

  beforeEach(() => {
    authService = new AuthService()
    localStorage.clear()
    fetch.mockClear()
  })

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockResponse = {
        error: false,
        loginResult: {
          userId: "user-123",
          name: "Test User",
          token: "mock-token",
        },
      }

      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await authService.login("test@example.com", "password123")

      expect(result.success).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith("dicoding-story-token", "mock-token")
    })

    it("should handle login failure", async () => {
      const mockResponse = {
        error: true,
        message: "Invalid credentials",
      }

      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      })

      const result = await authService.login("test@example.com", "wrongpassword")

      expect(result.success).toBe(false)
      expect(result.message).toBe("Invalid credentials")
    })
  })

  describe("isAuthenticated", () => {
    it("should return true when token exists", () => {
      localStorage.getItem.mockReturnValue("mock-token")
      expect(authService.isAuthenticated()).toBe(true)
    })

    it("should return false when token does not exist", () => {
      localStorage.getItem.mockReturnValue(null)
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe("logout", () => {
    it("should clear stored data", () => {
      authService.logout()
      expect(localStorage.removeItem).toHaveBeenCalledWith("dicoding-story-token")
      expect(localStorage.removeItem).toHaveBeenCalledWith("dicoding-story-user")
    })
  })
})
