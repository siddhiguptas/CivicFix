import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
            Join thousands of citizens already using Civic Connect to make their voices heard and create positive change
            in their communities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="min-w-[200px]">
              <Link href="/register">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="min-w-[200px] bg-transparent">
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
