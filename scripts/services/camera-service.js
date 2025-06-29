// Camera Service - Handles camera Web API
export class CameraService {
  constructor() {
    this.stream = null
    this.canvas = document.createElement("canvas")
    this.context = this.canvas.getContext("2d")
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: "environment",
        },
        audio: false,
      })
      return this.stream
    } catch (error) {
      let errorMessage = "Unable to access camera"

      if (error.name === "NotAllowedError") {
        errorMessage = "Camera access denied. Please allow camera permission and try again."
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on this device."
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application."
      }

      throw new Error(errorMessage)
    }
  }

  async capturePhoto() {
    if (!this.stream) {
      throw new Error("Camera not started")
    }

    const video = document.getElementById("camera-preview")
    this.canvas.width = video.videoWidth
    this.canvas.height = video.videoHeight
    this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)

    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, "image/jpeg", 0.9)
    })
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
      })
      this.stream = null
    }
  }

  async processUploadedFile(file) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file (JPG, PNG, GIF)")
    }

    if (file.size > 1024 * 1024) {
      throw new Error("Image size must be less than 1MB. Please choose a smaller image.")
    }

    return file
  }

  applyFilter(photoBlob, filterType) {
    // Implementation for applying filters
    // This would use ImageUtils or similar
    return photoBlob
  }
}
