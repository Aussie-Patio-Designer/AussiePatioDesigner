"use client"

import { useEffect, useRef, useState } from "react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useMobile } from "@/hooks/use-mobile"

interface ARViewProps {
  isOpen: boolean
  onClose: () => void
  gazeboProps: {
    length: number
    width: number
    height: number
    roofType: "Gable" | "Skillion"
    roofPitch: number
    roofCladding?: string
    roofColor?: string
    postBeamColor?: string
  }
}

export default function ARView({ isOpen, onClose, gazeboProps }: ARViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useMobile()

  // Handle camera initialization
  useEffect(() => {
    if (!isOpen) return

    let videoStream: MediaStream | null = null

    const initCamera = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check for camera permissions
        const permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName })
        setCameraPermission(permissionStatus.state as "granted" | "denied" | "prompt")

        // If denied, show error
        if (permissionStatus.state === "denied") {
          setError("Camera permission denied. Please enable camera access in your browser settings.")
          setIsLoading(false)
          return
        }

        // Request camera stream
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use back camera
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight },
          },
          audio: false,
        })

        // Set video stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            setIsLoading(false)
          }
        }

        // Handle permission changes
        permissionStatus.onchange = () => {
          setCameraPermission(permissionStatus.state as "granted" | "denied" | "prompt")

          if (permissionStatus.state === "denied") {
            if (videoStream) {
              videoStream.getTracks().forEach((track) => track.stop())
            }
            setError("Camera permission was denied.")
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Unable to access your camera. Please ensure you've granted camera permissions.")
        setIsLoading(false)
      }
    }

    initCamera()

    // Cleanup
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isOpen])

  // Placeholder for AR rendering - in a real implementation, this would use AR.js or WebXR API
  // to render the 3D model on top of the camera feed
  const instructionContent = (
    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 text-center text-sm">
      <p>Point your camera at a flat surface to place the gazebo.</p>
      <p className="text-xs mt-1">(Use pinch gestures to resize, drag to reposition)</p>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-full h-[100dvh] m-0 p-0 bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Initializing AR view...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white p-4">
              <div className="bg-red-600 p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Camera Access Required</h3>
              <p className="mb-4">{error}</p>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
              >
                Close AR View
              </Button>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* Camera feed */}
            <video ref={videoRef} className="h-full w-full object-cover" playsInline autoPlay muted />

            {/* Canvas overlay for AR content */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              width={window.innerWidth}
              height={window.innerHeight}
            />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button
                onClick={onClose}
                size="icon"
                variant="outline"
                className="bg-black/50 border-white/30 hover:bg-black/70"
              >
                <span className="sr-only">Close AR View</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </Button>
            </div>

            {/* Instructions */}
            {!isLoading && instructionContent}

            {/* AR not available notification if not on mobile */}
            {!isMobile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                <div className="text-center text-white p-4">
                  <h3 className="text-lg font-bold mb-2">AR View Available on Mobile Only</h3>
                  <p className="mb-4">Please open this page on a mobile device to use the AR feature.</p>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            {/* Debug info - gazebo properties */}
            <div className="absolute top-4 left-4 bg-black/50 text-white text-xs p-2 rounded">
              <p>
                Gazebo: {gazeboProps.length}x{gazeboProps.width}x{gazeboProps.height}mm
              </p>
              <p>
                Roof: {gazeboProps.roofType} ({gazeboProps.roofPitch}°)
              </p>
              <p>Cladding: {gazeboProps.roofCladding}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
