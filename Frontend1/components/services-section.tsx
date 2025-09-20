import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const services = [
  {
    title: "Water & Sanitation",
    description: "Report water supply issues, drainage problems, and sanitation concerns.",
    features: ["Water quality complaints", "Pipe leakage reports", "Sewage overflow issues"],
    cta: "File Water Complaint",
  },
  {
    title: "Roads & Infrastructure",
    description: "Submit complaints about road conditions, streetlights, and public infrastructure.",
    features: ["Pothole reports", "Street light issues", "Traffic signal problems"],
    cta: "Report Infrastructure Issue",
  },
  {
    title: "Public Services",
    description: "Access various government services and track application status.",
    features: ["Document verification", "License applications", "Certificate requests"],
    cta: "Access Services",
  },
  {
    title: "Emergency Services",
    description: "Quick access to emergency services and urgent complaint filing.",
    features: ["Emergency hotlines", "Urgent complaints", "24/7 support"],
    cta: "Emergency Contact",
  },
]

export function ServicesSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Make civic engagement seamless.</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Tools for your community and stakeholders to collaborate, share feedback, and resolve issues faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="p-8 glass">
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground mb-6">{service.description}</p>

              <ul className="space-y-2 mb-6">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/services">
                  {service.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
