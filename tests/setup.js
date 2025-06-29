// Jest setup file
const jest = require("jest")

import "@testing-library/jest-dom"

// Mock Leaflet
global.L = {
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    on: jest.fn(),
    removeLayer: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn(),
  })),
}

// Mock navigator APIs
Object.defineProperty(navigator, "mediaDevices", {
  writable: true,
  value: {
    getUserMedia: jest.fn(),
  },
})

Object.defineProperty(navigator, "serviceWorker", {
  writable: true,
  value: {
    register: jest.fn(),
    getRegistration: jest.fn(),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn()

// Mock Notification API
global.Notification = {
  requestPermission: jest.fn(() => Promise.resolve("granted")),
}

// Mock document.startViewTransition
global.document.startViewTransition = jest.fn((callback) => {
  callback()
  return Promise.resolve()
})
