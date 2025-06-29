import { AddStoryView } from "../views/add-story-view.js"
import { StoryModel } from "../models/story-model.js"
import { CameraService } from "../services/camera-service.js"
import { MapService } from "../services/map-service.js"
import { LocationService } from "../services/location-service.js"

export class AddStoryPresenter {
  constructor(router) {
    this.storyModel = new StoryModel()
    this.cameraService = new CameraService()
    this.mapService = new MapService()
    this.locationService = new LocationService()
    this.router = router
    this.view = new AddStoryView()
    this.selectedLocation = null
    this.capturedPhoto = null
  }

  init() {
    this.view.init()
    this.view.render()
    this.initializeMap()
    this.bindEvents()
  }

  initializeMap() {
    const mapContainer = this.view.getMapContainer()
    this.mapService.initializeLocationMap(mapContainer, (location) => {
      this.selectedLocation = location
      this.view.updateLocationDisplay(location)
    })
  }

  bindEvents() {
    this.view.bindEvents({
      onSubmit: (e) => this.handleSubmit(e),
      onDescriptionInput: (e) => this.view.updateCharCount(e.target.value.length),
      onStartCamera: () => this.startCamera(),
      onCapturePhoto: () => this.capturePhoto(),
      onRetakePhoto: () => this.retakePhoto(),
      onStopCamera: () => this.stopCamera(),
      onFileUpload: (e) => this.handleFileUpload(e),
      onGetCurrentLocation: () => this.getCurrentLocation(),
      onClearLocation: () => this.clearLocation(),
      onCancel: () => this.router.navigate("/home"),
      onFilterSelect: (filter) => this.applyFilter(filter),
    })
  }

  async startCamera() {
    try {
      const stream = await this.cameraService.startCamera()
      this.view.showCameraPreview(stream)
      this.view.updateButtonStates("camera-active")
      this.view.showMessage("Camera started successfully! Position your subject and click capture.", "success")
    } catch (error) {
      this.view.showMessage(error.message, "error")
    }
  }

  async capturePhoto() {
    try {
      const photoBlob = await this.cameraService.capturePhoto()
      this.capturedPhoto = photoBlob
      this.view.showCapturedPhoto(photoBlob)
      this.view.hideCameraPreview()
      this.view.updateButtonStates("photo-captured")
      this.stopCamera()
      this.view.showMessage("Photo captured successfully!", "success")
    } catch (error) {
      this.view.showMessage(error.message, "error")
    }
  }

  retakePhoto() {
    this.capturedPhoto = null
    this.view.updateButtonStates("initial")
    this.view.clearErrors()
  }

  stopCamera() {
    this.cameraService.stopCamera()
    this.view.hideCameraPreview()
  }

  async handleFileUpload(event) {
    try {
      const file = event.target.files[0]
      if (!file) return

      const processedFile = await this.cameraService.processUploadedFile(file)
      this.capturedPhoto = processedFile
      this.view.showCapturedPhoto(processedFile)
      this.view.updateButtonStates("photo-captured")
      this.view.showMessage("Image uploaded successfully!", "success")
    } catch (error) {
      this.view.showMessage(error.message, "error")
    }
  }

  async getCurrentLocation() {
    try {
      const location = await this.locationService.getCurrentLocation()
      this.selectedLocation = location
      this.mapService.setLocation(location)
      this.view.updateLocationDisplay(location)
      this.view.showMessage("Current location selected successfully!", "success")
    } catch (error) {
      this.view.showMessage(error.message, "error")
    }
  }

  clearLocation() {
    this.selectedLocation = null
    this.mapService.clearLocation()
    this.view.updateLocationDisplay(null)
  }

  applyFilter(filterType) {
    if (!this.capturedPhoto) return

    try {
      const filteredPhoto = this.cameraService.applyFilter(this.capturedPhoto, filterType)
      this.capturedPhoto = filteredPhoto
      this.view.showCapturedPhoto(filteredPhoto)
    } catch (error) {
      this.view.showMessage("Failed to apply filter", "error")
    }
  }

  async handleSubmit(event) {
    event.preventDefault()

    const formData = this.view.getFormData()
    this.view.clearErrors()

    if (!this.validateForm(formData)) {
      return
    }

    try {
      const result = await this.storyModel.addStory(
        formData.description,
        this.capturedPhoto,
        this.selectedLocation?.lat,
        this.selectedLocation?.lon,
      )

      if (result.success) {
        this.view.showMessage("🎉 Story shared successfully! Redirecting to home...", "success")
        this.cleanup()
        setTimeout(() => {
          this.router.navigate("/home")
        }, 2000)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.view.showMessage(`Failed to share story: ${error.message}`, "error")
    }
  }

  validateForm(formData) {
    let isValid = true

    if (!formData.description || formData.description.length < 10) {
      this.view.showFieldError("description-error", "Description must be at least 10 characters long")
      isValid = false
    }

    if (!this.capturedPhoto) {
      this.view.showFieldError("photo-error", "Please capture a photo or upload an image")
      isValid = false
    }

    return isValid
  }

  cleanup() {
    this.stopCamera()
    this.mapService.cleanup()
  }
}
