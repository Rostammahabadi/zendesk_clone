import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

export default function Dashboard() {
  const tickets = [
    { id: 1, title: "Billing Issue", status: "Open", date: "2023-04-01" },
    { id: 2, title: "Enrollment Error", status: "In Progress", date: "2023-03-28" },
    { id: 3, title: "Coverage Question", status: "Resolved", date: "2023-03-15" },
  ]

  return (
    <Card className="mb-8 bg-[#333533]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Support Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between items-center p-4 bg-[#1A1A1D] rounded-lg">
              <div>
                <h3 className="font-semibold">{ticket.title}</h3>
                <p className="text-sm text-[#A9A9A9]">Opened on {ticket.date}</p>
              </div>
              <Badge
                variant={
                  ticket.status === "Open" ? "default" : ticket.status === "In Progress" ? "secondary" : "outline"
                }
              >
                {ticket.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
