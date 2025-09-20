import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, Award, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Advanced AI algorithms for intelligent grievance categorization and routing",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security ensuring your data remains protected",
    },
    {
      icon: Globe,
      title: "Accessible",
      description: "Multi-language support and accessible design for all citizens",
    },
    {
      icon: Users,
      title: "Community-Driven",
      description: "Built with citizen feedback and continuous improvement",
    },
  ]

  const stats = [
    { number: "50,000+", label: "Citizens Served" },
    { number: "25,000+", label: "Grievances Resolved" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "48hrs", label: "Average Response Time" },
  ]

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Technology Officer",
      description: "15+ years in civic technology and AI systems",
    },
    {
      name: "Michael Chen",
      role: "Head of Product",
      description: "Former government official with deep civic engagement experience",
    },
    {
      name: "Priya Sharma",
      role: "Lead AI Engineer",
      description: "PhD in Machine Learning, specializing in NLP and automation",
    },
  ]

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">About Civic Connect</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing civic engagement through AI-powered technology, making government services more
            accessible, efficient, and transparent for every citizen.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card className="glass">
            <CardContent className="pt-8">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To bridge the gap between citizens and government through innovative technology solutions. We believe
                that every citizen deserves quick, transparent, and effective resolution to their concerns and access to
                government services.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="pt-8">
              <div className="flex items-center mb-4">
                <Award className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To create a world where civic engagement is seamless, transparent, and empowering. We envision
                communities where technology serves as a catalyst for positive change and stronger citizen-government
                relationships.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="glass text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="glass text-center">
                <CardContent className="pt-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="glass text-center">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of citizens who are already using Civic Connect to engage with their local government and
              create positive change in their communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/register">Get Started Today</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
