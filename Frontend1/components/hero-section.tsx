import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Shield, Users, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-liquid">
      <div className="absolute inset-0 bg-neural-network opacity-20"></div>
      <div className="absolute inset-0 bg-geometric opacity-30"></div>

      <div className="absolute inset-0 bg-particles"></div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center rounded-full glass-ultra px-6 py-3 text-sm font-medium mb-8 animate-fade-in hover-glow">
            <Sparkles className="mr-2 h-4 w-4 text-blue-400 animate-pulse" />
            <span className="text-holographic font-semibold">Next-Generation Civic Platform</span>
          </div>

          <h1 className="text-display text-white mb-6 animate-slide-in-up text-3d">
            Transform Your City with <span className="text-neon">Smart Governance</span>
          </h1>

          <p className="mx-auto max-w-3xl text-responsive-lg text-white/90 text-pretty mb-12 animate-slide-in-up stagger-delay-200 leading-relaxed">
            Experience the future of civic engagement with our{" "}
            <span className="gradient-text-civic font-semibold">AI-powered platform</span> that connects citizens and
            government seamlessly.
            <br />
            <span className="text-blue-200 font-medium text-responsive-base">
              File grievances, track progress, and build stronger communities together.
            </span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-in-up stagger-delay-300">
            <div className="glass-card-premium p-6 rounded-xl hover-lift">
              <Shield className="h-8 w-8 text-blue-400 mx-auto mb-3 animate-float" />
              <h3 className="text-responsive-base font-semibold text-white mb-2">Secure & Private</h3>
              <p className="text-responsive-sm text-white/80">End-to-end encryption for all communications</p>
            </div>
            <div className="glass-card-premium p-6 rounded-xl hover-lift stagger-delay-100">
              <Zap className="h-8 w-8 text-purple-400 mx-auto mb-3 animate-float" />
              <h3 className="text-responsive-base font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-responsive-sm text-white/80">Smart routing and automated responses</p>
            </div>
            <div className="glass-card-premium p-6 rounded-xl hover-lift stagger-delay-200">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-3 animate-float" />
              <h3 className="text-responsive-base font-semibold text-white mb-2">Community-First</h3>
              <p className="text-responsive-sm text-white/80">Built for citizens, by citizens</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-in-up stagger-delay-400">
            <Button
              size="lg"
              asChild
              className="min-w-[220px] glass-button hover-glow text-white border-white/20 text-responsive-base font-semibold"
            >
              <Link href="/register">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="min-w-[220px] glass-ultra hover-glass text-white border-white/30 bg-transparent text-responsive-base font-semibold"
            >
              <Link href="/demo">Explore Features</Link>
            </Button>
          </div>

          <div className="mt-20 text-center animate-fade-in stagger-delay-600">
            <p className="text-responsive-sm text-white/70 mb-8 font-medium">Empowering communities across India</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center stagger-children">
              <div className="glass-card p-4 rounded-lg hover-scale">
                <div className="text-responsive-lg font-bold text-white mb-1">50K+</div>
                <div className="text-responsive-sm text-white/80">Active Citizens</div>
              </div>
              <div className="glass-card p-4 rounded-lg hover-scale">
                <div className="text-responsive-lg font-bold text-white mb-1">200+</div>
                <div className="text-responsive-sm text-white/80">Government Bodies</div>
              </div>
              <div className="glass-card p-4 rounded-lg hover-scale">
                <div className="text-responsive-lg font-bold text-white mb-1">95%</div>
                <div className="text-responsive-sm text-white/80">Resolution Rate</div>
              </div>
              <div className="glass-card p-4 rounded-lg hover-scale">
                <div className="text-responsive-lg font-bold text-white mb-1">24/7</div>
                <div className="text-responsive-sm text-white/80">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-float stagger-delay-300"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-float stagger-delay-500"></div>
    </section>
  )
}
