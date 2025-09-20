import { Card } from "@/components/ui/card"
import { Bot, FileText, BarChart3, Shield, Clock, Users } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI-Powered Assistance",
    description: "Smart chatbot helps citizens navigate services and file complaints efficiently.",
  },
  {
    icon: FileText,
    title: "Digital Grievance System",
    description: "Submit and track complaints digitally with real-time status updates.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Government officials get insights into citizen concerns and resolution metrics.",
  },
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "End-to-end encryption ensures privacy while maintaining transparency.",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Citizens can monitor their grievance status and receive instant notifications.",
  },
  {
    icon: Users,
    title: "Multi-stakeholder Platform",
    description: "Connects citizens, government officials, and service providers seamlessly.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Faster iteration. More innovation.</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            The platform for rapid civic progress. Let your community focus on solving problems instead of managing
            bureaucracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 glass hover:bg-muted/10 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
