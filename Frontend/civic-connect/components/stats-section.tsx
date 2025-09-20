import { Card } from "@/components/ui/card"

const stats = [
  {
    value: "15 days",
    label: "average resolution time",
    description: "Faster grievance processing",
  },
  {
    value: "94%",
    label: "citizen satisfaction",
    description: "Higher engagement rates",
  },
  {
    value: "60%",
    label: "reduction in paperwork",
    description: "Streamlined processes",
  },
  {
    value: "24/7",
    label: "AI assistance",
    description: "Always available support",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center glass">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
