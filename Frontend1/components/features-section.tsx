import { Card } from "@/components/ui/card"
import { Bot, FileText, BarChart3, Shield, Clock, Users } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Assistance",
    description: "Smart chatbot helps citizens navigate services and file complaints efficiently.",
    gradient: "gradient-text-blue",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: FileText,
    title: "Digital Grievance System",
    description: "Submit and track complaints digitally with real-time status updates.",
    gradient: "gradient-text-purple",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Government officials get insights into citizen concerns and resolution metrics.",
    gradient: "gradient-text-civic",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "End-to-end encryption ensures privacy while maintaining transparency.",
    gradient: "gradient-text-government",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Citizens can monitor their grievance status and receive instant notifications.",
    gradient: "gradient-text-community",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: Users,
    title: "Multi-stakeholder Platform",
    description: "Connects citizens, government officials, and service providers seamlessly.",
    gradient: "gradient-text-purple",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-500",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden bg-hexagon-pattern">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

      <div className="container relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-headline mb-6">
            <span className="gradient-text-civic">Faster iteration.</span>{" "}
            <span className="text-holographic">More innovation.</span>
          </h2>
          <p className="mx-auto max-w-3xl text-responsive-lg text-muted-foreground text-pretty leading-relaxed">
            The platform for rapid civic progress. Let your community focus on{" "}
            <span className="text-success font-semibold">solving problems</span> instead of managing bureaucracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 glass-card-premium hover-lift group relative overflow-hidden border-0">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bgColor} mb-6 animate-morphing group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.iconColor} group-hover:animate-pulse`} />
                </div>

                <h3
                  className={`text-responsive-xl font-bold mb-4 ${feature.gradient} group-hover:text-shadow-colored transition-all duration-300`}
                >
                  {feature.title}
                </h3>

                <p className="text-responsive-base text-muted-foreground leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center animate-fade-in">
          <div className="glass-ultra p-8 rounded-2xl max-w-2xl mx-auto hover-glow">
            <h3 className="text-responsive-2xl font-bold mb-4">
              <span className="gradient-text-civic">Ready to transform</span>{" "}
              <span className="text-neon">your community?</span>
            </h3>
            <p className="text-responsive-base text-muted-foreground mb-6 leading-relaxed">
              Join thousands of citizens already using our platform to create positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="glass-button px-8 py-3 rounded-xl text-responsive-base font-semibold hover-lift">
                Get Started Today
              </button>
              <button className="glass-card-premium px-8 py-3 rounded-xl text-responsive-base font-semibold hover-glass">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-10 right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl animate-float"></div>
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-float stagger-delay-400"></div>
    </section>
  )
}
