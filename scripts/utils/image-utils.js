// Image utility functions for filters and processing
export class ImageUtils {
  static applyFilter(canvas, filterType) {
    const ctx = canvas.getContext("2d")
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    switch (filterType) {
      case "grayscale":
        this.applyGrayscale(data)
        break
      case "sepia":
        this.applySepia(data)
        break
      case "vintage":
        this.applyVintage(data)
        break
      case "bright":
        this.applyBrightness(data, 30)
        break
      case "contrast":
        this.applyContrast(data, 30)
        break
      default:
        return
    }

    ctx.putImageData(imageData, 0, 0)
  }

  static applyGrayscale(data) {
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      data[i] = gray
      data[i + 1] = gray
      data[i + 2] = gray
    }
  }

  static applySepia(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
    }
  }

  static applyVintage(data) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + 30) // Add red tint
      data[i + 1] = Math.max(0, data[i + 1] - 10) // Reduce green
      data[i + 2] = Math.max(0, data[i + 2] - 20) // Reduce blue
    }
  }

  static applyBrightness(data, brightness) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + brightness))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness))
    }
  }

  static applyContrast(data, contrast) {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
    }
  }

  static resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(resolve, "image/jpeg", quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }
}
