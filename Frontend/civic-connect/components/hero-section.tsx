import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10" />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-border/40 bg-muted/50 px-3 py-1 text-sm font-medium mb-8">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            AI-Powered Civic Engagement Platform
          </div>

          {/* Main heading */}
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl mb-6">
            The complete platform to{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              connect citizens
            </span>{" "}
            with government.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty mb-10">
            Your community's toolkit to streamline governance and enhance civic participation. Securely file, track, and
            resolve grievances with AI-powered assistance.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="min-w-[200px]">
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="min-w-[200px] bg-transparent">
              <Link href="/demo">Explore the Platform</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-8">Trusted by citizens across</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              <div className="text-lg font-semibold">Mumbai</div>
              <div className="text-lg font-semibold">Delhi</div>
              <div className="text-lg font-semibold">Bangalore</div>
              <div className="text-lg font-semibold">Chennai</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
