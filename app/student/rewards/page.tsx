"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { mockStudents } from "@/lib/mock-data"
import { Coins, Gift, TrendingUp, ShoppingBag, Coffee, Headphones, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

const pointsHistory = [
  { id: 1, description: "Completed React Module", points: 100, date: "May 25, 2024", type: "earned" },
  { id: 2, description: "Perfect Attendance Bonus", points: 50, date: "May 24, 2024", type: "earned" },
  { id: 3, description: "Redeemed Amazon Voucher", points: -500, date: "May 22, 2024", type: "redeemed" },
  { id: 4, description: "Assignment Submission", points: 75, date: "May 20, 2024", type: "earned" },
  { id: 5, description: "Quiz Champion Badge", points: 150, date: "May 18, 2024", type: "earned" },
  { id: 6, description: "Helped Peer in Forum", points: 25, date: "May 15, 2024", type: "earned" },
]

const rewards = [
  { id: 1, name: "Amazon Gift Card", points: 500, icon: ShoppingBag, available: true },
  { id: 2, name: "Starbucks Voucher", points: 300, icon: Coffee, available: true },
  { id: 3, name: "Premium Headphones", points: 2000, icon: Headphones, available: false },
  { id: 4, name: "Course Extension", points: 1000, icon: BookOpen, available: true },
]

export default function StudentRewards() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const student = mockStudents.find((s) => s.email === user?.email) || mockStudents[0]

  if (isLoading) {
    return (
      <>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="col-span-2 h-32" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Rewards Center</h1>

        {/* Points Balance */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-foreground/80">Available Points</p>
                <p className="mt-1 text-4xl font-bold">{student.points.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <Coins className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/80">
              <TrendingUp className="h-4 w-4" />
              <span>+250 points this month</span>
            </div>
          </div>

          <div className="col-span-2 rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">How to Earn Points</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">+100</p>
                <p className="mt-1 text-sm text-muted-foreground">Complete a Module</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">+50</p>
                <p className="mt-1 text-sm text-muted-foreground">Perfect Attendance</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">+75</p>
                <p className="mt-1 text-sm text-muted-foreground">Submit Assignment</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Points History */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Points History</h2>
            <div className="space-y-3">
              {pointsHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <span
                    className={`font-semibold ${
                      item.type === "earned" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.type === "earned" ? "+" : ""}
                    {item.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Redeem Rewards */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Redeem Rewards</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`rounded-lg border p-4 ${
                    !reward.available || student.points < reward.points
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <reward.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{reward.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Coins className="h-3 w-3" />
                        {reward.points} points
                      </p>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    disabled={!reward.available || student.points < reward.points}
                  >
                    {student.points >= reward.points ? "Redeem" : "Not Enough Points"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
