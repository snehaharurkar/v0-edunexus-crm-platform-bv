"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { mockStudents } from "@/lib/mock-data"
import { Coins, Gift, TrendingUp, ShoppingBag, Coffee, Headphones, BookOpen, X, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

interface HistoryItem {
  id: number
  description: string
  points: number
  date: string
  type: "earned" | "redeemed"
}

interface Reward {
  id: number
  name: string
  points: number
  icon: React.ElementType
  available: boolean
  voucherPrefix: string
}

const initialHistory: HistoryItem[] = [
  { id: 1, description: "Completed React Module", points: 100, date: "May 25, 2024", type: "earned" },
  { id: 2, description: "Perfect Attendance Bonus", points: 50, date: "May 24, 2024", type: "earned" },
  { id: 3, description: "Redeemed Amazon Voucher", points: -500, date: "May 22, 2024", type: "redeemed" },
  { id: 4, description: "Assignment Submission", points: 75, date: "May 20, 2024", type: "earned" },
  { id: 5, description: "Quiz Champion Badge", points: 150, date: "May 18, 2024", type: "earned" },
  { id: 6, description: "Helped Peer in Forum", points: 25, date: "May 15, 2024", type: "earned" },
]

const rewardsConfig: Reward[] = [
  { id: 1, name: "Amazon Gift Card", points: 500, icon: ShoppingBag, available: true, voucherPrefix: "AMZ" },
  { id: 2, name: "Starbucks Voucher", points: 300, icon: Coffee, available: true, voucherPrefix: "SBX" },
  { id: 3, name: "Premium Headphones", points: 2000, icon: Headphones, available: true, voucherPrefix: "HEAD" },
  { id: 4, name: "Course Extension", points: 1000, icon: BookOpen, available: true, voucherPrefix: "COURSE" },
]

// Generate a pseudo-random voucher code
function generateVoucherCode(prefix: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const random = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${prefix}-${random}`
}

interface VoucherModalProps {
  reward: Reward
  voucherCode: string
  onClose: () => void
}

function VoucherModal({ reward, voucherCode, onClose }: VoucherModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(voucherCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Voucher code copied!")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-8 shadow-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Gift className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold">Reward Redeemed!</h2>
          <p className="mt-1 text-muted-foreground">Your {reward.name} voucher code is ready</p>
        </div>

        <div className="mt-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Your Voucher Code
          </p>
          <p className="text-2xl font-bold tracking-widest text-primary">{voucherCode}</p>
        </div>

        <div className="mt-4 space-y-3">
          <Button className="w-full gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Code"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Save this code — it will not be shown again.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function StudentRewards() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Use local state for points so redeeming actually deducts them
  const baseStudent = mockStudents.find((s) => s.email === user?.email) || mockStudents[0]
  const [availablePoints, setAvailablePoints] = useState<number>(baseStudent.points)
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)

  // Voucher modal state
  const [voucherModal, setVoucherModal] = useState<{
    reward: Reward
    code: string
  } | null>(null)

  // Track which rewards have been redeemed this session to prevent double-redeem
  const [redeemedIds, setRedeemedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleRedeem = (reward: Reward) => {
    if (availablePoints < reward.points) {
      toast.error("Not enough points to redeem this reward.")
      return
    }
    if (redeemedIds.has(reward.id)) {
      toast.error("You have already redeemed this reward.")
      return
    }

    const code = generateVoucherCode(reward.voucherPrefix)

    // Deduct points
    setAvailablePoints((prev) => prev - reward.points)

    // Add to history
    const newEntry: HistoryItem = {
      id: Date.now(),
      description: `Redeemed ${reward.name}`,
      points: -reward.points,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: "redeemed",
    }
    setHistory((prev) => [newEntry, ...prev])

    // Mark as redeemed
    setRedeemedIds((prev) => new Set([...prev, reward.id]))

    // Show voucher modal
    setVoucherModal({ reward, code })
  }

  if (isLoading) {
    return (
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
    )
  }

  return (
    <>
      {voucherModal && (
        <VoucherModal
          reward={voucherModal.reward}
          voucherCode={voucherModal.code}
          onClose={() => setVoucherModal(null)}
        />
      )}

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Rewards Center</h1>

        {/* Points Balance */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-foreground/80">Available Points</p>
                <p className="mt-1 text-4xl font-bold">{availablePoints.toLocaleString()}</p>
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
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {history.map((item) => (
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
              {rewardsConfig.map((reward) => {
                const canAfford = availablePoints >= reward.points
                const alreadyRedeemed = redeemedIds.has(reward.id)
                const isDisabled = !canAfford || alreadyRedeemed

                return (
                  <div
                    key={reward.id}
                    className={`rounded-lg border p-4 transition-opacity ${isDisabled ? "opacity-60" : ""}`}
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
                      disabled={isDisabled}
                      onClick={() => handleRedeem(reward)}
                    >
                      {alreadyRedeemed
                        ? "Redeemed ✓"
                        : canAfford
                        ? "Redeem"
                        : "Not Enough Points"}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}