"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Camera, X, Send, Lock } from "lucide-react"

export default function GrievancesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraError, setCameraError] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      if (authStatus === "true") {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/grievances")
    }
  }, [isAuthenticated, isLoading, router])

  const startCamera = async () => {
    try {
      setCameraError("")
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsCapturing(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraError("Unable to access camera. Please check permissions and try again.")
      setIsCapturing(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        if (context) {
          context.drawImage(video, 0, 0)
          const imageData = canvas.toDataURL("image/jpeg", 0.8)
          setCapturedImages((prev) => [...prev, imageData])
        }
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
    setCameraError("")
  }

  const removeImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background grid-bg">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
          <Card className="glass max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to file a grievance and access protected features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => router.push("/login?redirect=/grievances")} className="w-full">
                Sign In to Continue
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/register?redirect=/grievances")}
                className="w-full"
              >
                Create Account
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">File a Grievance</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Submit your complaint or concern and track its resolution through our AI-powered system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grievance Form */}
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Grievance Details
                </CardTitle>
                <CardDescription>Please provide detailed information about your concern</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your grievance..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Photo Evidence</Label>

                  {cameraError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                      {cameraError}
                    </div>
                  )}

                  {!isCapturing ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={startCamera}
                      className="w-full bg-transparent border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      Open Camera to Take Photo
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden bg-black">
                        <video ref={videoRef} className="w-full h-64 object-cover" autoPlay playsInline muted />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                          <Button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 transition-all duration-200"
                          >
                            <Camera className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={stopCamera}
                            className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}

                  {/* Display captured images */}
                  {capturedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {capturedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Captured ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border transition-transform duration-200 group-hover:scale-105"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button className="w-full" size="lg">
                  <Send className="mr-2 h-4 w-4" />
                  Submit Grievance
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Information Sidebar */}
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Submit</h4>
                    <p className="text-sm text-muted-foreground">Fill out the form with your grievance details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">AI Processing</h4>
                    <p className="text-sm text-muted-foreground">Our AI categorizes and routes your complaint</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Track Progress</h4>
                    <p className="text-sm text-muted-foreground">Monitor resolution status in real-time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If you need assistance filing your grievance, contact our support team.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
