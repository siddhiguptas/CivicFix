import { RegisterForm } from "@/components/register-form"
import { MapPin } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold">Civic Connect</span>
              <span className="text-sm text-muted-foreground">AI-Powered Governance</span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join the platform to access civic services</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  )
}
