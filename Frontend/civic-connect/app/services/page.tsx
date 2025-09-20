import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, MapPin, Clock, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const services = [
    {
      icon: FileText,
      title: "File Grievances",
      description: "Submit complaints and track their resolution status in real-time",
      features: ["AI-powered categorization", "Real-time tracking", "Multi-language support"],
      href: "/grievances",
    },
    {
      icon: Users,
      title: "Citizen Services",
      description: "Access various government services and applications online",
      features: ["Document verification", "License applications", "Certificate requests"],
      href: "/citizen-services",
    },
    {
      icon: MapPin,
      title: "Local Information",
      description: "Get information about local government offices and services",
      features: ["Office locations", "Contact details", "Service hours"],
      href: "/local-info",
    },
    {
      icon: Clock,
      title: "Status Tracking",
      description: "Track the progress of your applications and grievances",
      features: ["Real-time updates", "SMS notifications", "Email alerts"],
      href: "/track",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security",
      features: ["End-to-end encryption", "Secure authentication", "Data privacy"],
      href: "/security",
    },
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Intelligent routing and automated responses for faster resolution",
      features: ["Smart categorization", "Automated routing", "Predictive analytics"],
      href: "/ai-features",
    },
  ]

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive digital governance solutions designed to make civic engagement simple and effective
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="glass hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </div>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href={service.href}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="glass max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of citizens already using our platform to engage with local government
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
