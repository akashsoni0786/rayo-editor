import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import * as Dialog from '@radix-ui/react-dialog'
import { Crop as CropIcon, X, Check, Loader2 } from 'lucide-react'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImageUrl: string) => void
  onCancel: () => void
  isOpen: boolean
}

/**
 * Load an image and convert it to a data URL to avoid CORS issues
 * Uses multiple strategies: fetch API first, then canvas with crossOrigin
 */
async function loadImageAsDataUrl(src: string): Promise<string> {
  // If already a data URL, return as-is
  if (src.startsWith('data:')) {
    return src
  }

  // For blob URLs, also return as-is (they're same-origin)
  if (src.startsWith('blob:')) {
    return src
  }

  console.log('Loading image for cropping:', src)

  // For Cloudinary URLs, we can try to modify them to be more CORS-friendly
  let fetchSrc = src

  // Check if it's a Cloudinary URL and modify it for better CORS support
  if (src.includes('res.cloudinary.com')) {
    // Cloudinary URLs can have /upload/ replaced with /upload/fl_attachment/ for downloads
    // But for our case, we just need to ensure no caching issues
    // The URL format is: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
    console.log('Detected Cloudinary URL')
  }

  // Strategy 1: Try to fetch the image as a blob (works for most CDNs with CORS enabled)
  try {
    // Add cache buster to avoid CORS issues with cached responses
    const separator = fetchSrc.includes('?') ? '&' : '?'
    const fetchUrl = `${fetchSrc}${separator}_nocache=${Date.now()}`

    const response = await fetch(fetchUrl, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    })

    if (response.ok) {
      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            console.log('Successfully converted image via fetch')
            resolve(reader.result)
          } else {
            reject(new Error('Failed to read blob'))
          }
        }
        reader.onerror = () => reject(new Error('FileReader error'))
        reader.readAsDataURL(blob)
      })
      return dataUrl
    } else {
      console.warn('Fetch response not ok:', response.status)
    }
  } catch (fetchError) {
    console.warn('Fetch approach failed:', fetchError)
  }

  // Strategy 2: Try canvas approach with crossOrigin attribute
  try {
    const dataUrl = await loadImageViaCanvas(src, true)
    console.log('Successfully converted image via canvas with crossOrigin')
    return dataUrl
  } catch (canvasError) {
    console.warn('Canvas with crossOrigin failed:', canvasError)
  }

  // Strategy 3: Try canvas without crossOrigin (for same-origin images)
  try {
    const dataUrl = await loadImageViaCanvas(src, false)
    console.log('Successfully converted image via canvas without crossOrigin')
    return dataUrl
  } catch (error) {
    console.warn('Canvas without crossOrigin failed:', error)
  }

  // All strategies failed - throw error instead of returning original URL
  // This ensures the UI shows an error message rather than failing silently on crop
  throw new Error('Could not load image for cropping due to security restrictions')
}

/**
 * Load image via canvas and convert to data URL
 */
function loadImageViaCanvas(src: string, useCrossOrigin: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    if (useCrossOrigin) {
      img.crossOrigin = 'anonymous'
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0)

        // This will throw if canvas is tainted
        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Image failed to load'))
    }

    // Add cache buster to avoid cached CORS issues
    const separator = src.includes('?') ? '&' : '?'
    img.src = `${src}${separator}_t=${Date.now()}`
  })
}

/**
 * Converts canvas to data URL with proper image quality
 */
function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  // Calculate scaling factors for natural image dimensions
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  // Set canvas size to crop dimensions at full resolution
  canvas.width = Math.floor(crop.width * scaleX)
  canvas.height = Math.floor(crop.height * scaleY)

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Draw cropped portion onto canvas
  ctx.drawImage(
    image,
    Math.floor(crop.x * scaleX),
    Math.floor(crop.y * scaleY),
    Math.floor(crop.width * scaleX),
    Math.floor(crop.height * scaleY),
    0,
    0,
    canvas.width,
    canvas.height
  )

  // Return as PNG data URL with max quality
  return canvas.toDataURL('image/png', 1.0)
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  isOpen
}) => {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [localImageSrc, setLocalImageSrc] = useState<string>('')
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [canCrop, setCanCrop] = useState(true) // Track if cropping will work
  const imgRef = useRef<HTMLImageElement>(null)

  // Reset state when dialog opens/closes and prepare image
  useEffect(() => {
    if (!isOpen) {
      setCrop(undefined)
      setCompletedCrop(undefined)
      setImageLoaded(false)
      setLoadError(false)
      setLocalImageSrc('')
      setIsLoadingImage(false)
      setCanCrop(true)
    } else if (imageSrc) {
      // When opening, prepare the image source
      setLoadError(false)
      setImageLoaded(false)
      setIsLoadingImage(true)
      setCanCrop(true)

      // Load and potentially convert the image
      loadImageAsDataUrl(imageSrc)
        .then((dataUrl) => {
          console.log('Image loaded successfully, data URL length:', dataUrl.length)
          setLocalImageSrc(dataUrl)
          setIsLoadingImage(false)
          setCanCrop(true)
        })
        .catch((error) => {
          console.error('Failed to load image for cropping:', error)
          // Show error - cropping won't work without data URL
          setIsLoadingImage(false)
          setCanCrop(false)
          setLoadError(true)
        })
    }
  }, [isOpen, imageSrc])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget

    if (width === 0 || height === 0) {
      setLoadError(true)
      return
    }

    // Create a centered crop that covers 80% of the image
    const cropWidthPercent = 80

    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: cropWidthPercent,
        },
        undefined, // No fixed aspect ratio - allow free cropping
        width,
        height
      ),
      width,
      height
    )

    setCrop(newCrop)
    setImageLoaded(true)

    // Also set initial completed crop
    const pixelCrop: PixelCrop = {
      unit: 'px',
      x: (newCrop.x / 100) * width,
      y: (newCrop.y / 100) * height,
      width: (newCrop.width / 100) * width,
      height: (newCrop.height / 100) * height,
    }
    setCompletedCrop(pixelCrop)
  }, [])

  const handleCropChange = useCallback((newCrop: Crop, percentCrop: Crop) => {
    setCrop(percentCrop)
  }, [])

  const handleCropComplete = useCallback((c: PixelCrop) => {
    if (c.width > 0 && c.height > 0) {
      setCompletedCrop(c)
    }
  }, [])

  const handleApplyCrop = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      console.error('No crop or image ref')
      return
    }

    // Validate crop dimensions
    if (completedCrop.width <= 0 || completedCrop.height <= 0) {
      console.error('Invalid crop dimensions')
      return
    }

    setIsProcessing(true)
    try {
      const croppedImageUrl = getCroppedImg(imgRef.current, completedCrop)
      onCropComplete(croppedImageUrl)
    } catch (error) {
      console.error('Error cropping image:', error)
      // Show error to user
      setLoadError(true)
    } finally {
      setIsProcessing(false)
    }
  }, [completedCrop, onCropComplete])

  const handleCancel = useCallback(() => {
    setCrop(undefined)
    setCompletedCrop(undefined)
    setImageLoaded(false)
    setLoadError(false)
    onCancel()
  }, [onCancel])

  const handleImageError = useCallback(() => {
    setLoadError(true)
    setImageLoaded(false)
    setIsLoadingImage(false)
    console.error('Failed to load image for cropping:', imageSrc)
  }, [imageSrc])

  const canApplyCrop = completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imageLoaded && !loadError

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="image-cropper-overlay" />
        <Dialog.Content className="image-cropper-dialog">
          <div className="image-cropper-header">
            <Dialog.Title className="image-cropper-title">
              <CropIcon size={18} />
              Crop Image
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="image-cropper-close" onClick={handleCancel}>
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="image-cropper-content">
            {loadError ? (
              <div className="image-cropper-error">
                <p>Failed to load or crop image.</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  This may be due to cross-origin security restrictions.
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
                  Try uploading the image directly instead of using an external URL.
                </p>
              </div>
            ) : isLoadingImage || !localImageSrc ? (
              <div className="image-cropper-loading">
                <Loader2 size={24} className="animate-spin" />
                <p>Loading image...</p>
              </div>
            ) : (
              <ReactCrop
                crop={crop}
                onChange={handleCropChange}
                onComplete={handleCropComplete}
                className="image-cropper-react-crop"
                minWidth={20}
                minHeight={20}
              >
                <img
                  ref={imgRef}
                  src={localImageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  onError={handleImageError}
                  style={{ maxWidth: '100%', maxHeight: '60vh', display: 'block' }}
                />
              </ReactCrop>
            )}
          </div>

          <div className="image-cropper-footer">
            <button
              className="image-cropper-btn image-cropper-btn-cancel"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              className="image-cropper-btn image-cropper-btn-apply"
              onClick={handleApplyCrop}
              disabled={!canApplyCrop || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Apply Crop
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ImageCropper
