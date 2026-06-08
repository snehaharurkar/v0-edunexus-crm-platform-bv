"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Gift, Copy, Check, Trophy, Star,
  Clock, AlertCircle, Loader2, Tag
} from 'lucide-react'

const rewards = [
  {
    id: 'discount500',
    name: 'Course Discount ₹500',
    description: 'Get ₹500 off on your next course enrollment',
    points: 500,
    discount: 500,
    type: 'discount',
    icon: '🎓',
    color: 'bg-indigo-50 border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    popular: true,
  },
  {
    id: 'discount1000',
    name: 'Course Discount ₹1000',
    description: 'Get ₹1000 off on your next course enrollment',
    points: 1000,
    discount: 1000,
    type: 'discount',
    icon: '💰',
    color: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'amazon500',
    name: 'Amazon Gift Card ₹500',
    description: 'Redeem for Amazon gift voucher (admin approval required)',
    points: 500,
    discount: 500,
    type: 'amazon',
    icon: '🛒',
    color: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    id: 'starbucks300',
    name: 'Starbucks Voucher ₹300',
    description: 'Redeem for Starbucks voucher (admin approval required)',
    points: 300,
    discount: 300,
    type: 'starbucks',
    icon: '☕',
    color: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'extension1000',
    name: 'Course Extension 1 Month',
    description: 'Extend your course access by 1 month',
    points: 1000,
    discount: 0,
    type: 'extension',
    icon: '📅',
    color: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'headphones2000',
    name: 'Premium Headphones',
    description: 'Get premium headphones (admin approval required)',
    points: 2000,
    discount: 0,
    type: 'physical',
    icon: '🎧',
    color: 'bg-pink-50 border-pink-200',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
]

const pointsHistory = [
  { id: '1', reason: 'Perfect Attendance Bonus', points: 50, date: 'Jun 8, 2026', type: 'earn' },
  { id: '2', reason: 'Completed React Module', points: 100, date: 'May 25, 2024', type: 'earn' },
  { id: '3', reason: 'Redeemed Course Discount', points: -500, date: 'May 22, 2024', type: 'redeem' },
  { id: '4', reason: 'Quiz Completion Bonus', points: 25, date: 'May 20, 2024', type: 'earn' },
  { id: '5', reason: 'Referral Bonus', points: 200, date: 'May 15, 2024', type: 'earn' },
  { id: '6', reason: 'Assignment Submitted', points: 75, date: 'May 10, 2024', type: 'earn' },
]

export default function RewardsPage() {
  const { user } = useAuth()
  const [availablePoints, setAvailablePoints] = useState(1950)
  const [loading, setLoading] = useState(false)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([])
  const [couponModal, setCouponModal] = useState<{
    show: boolean
    code: string
    discount: number
    type: string
    rewardName: string
    expiresAt: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleRedeem = async (reward: typeof rewards[0]) => {
    if (availablePoints < reward.points) {
      toast.error(`Not enough points! You need ${reward.points} but have ${availablePoints}`)
      return
    }

    if (redeemedRewards.includes(reward.id)) {
      toast.error('You have already redeemed this reward')
      return
    }

    setRedeeming(reward.id)

    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.id || 'student_1',
          studentName: user?.name || 'Student',
          rewardName: reward.name,
          pointsRequired: reward.points,
          discountAmount: reward.discount,
          rewardType: reward.type
        })
      })

      const data = await res.json()

      if (data.success) {
        setAvailablePoints(prev => prev - reward.points)
        setRedeemedRewards(prev => [...prev, reward.id])

        setCouponModal({
          show: true,
          code: data.couponCode,
          discount: data.discountAmount,
          type: reward.type,
          rewardName: reward.name,
          expiresAt: data.expiresAt
        })

        if (reward.type === 'discount') {
          toast.success(`✅ Coupon generated! Use code at checkout for ₹${reward.discount} off!`)
        } else {
          toast.success('✅ Redemption request sent! Admin will approve within 24 hours.')
        }
      } else {
        toast.error(data.error || 'Failed to redeem')
      }
    } catch (error) {
      // Fallback for demo
      const code = generateMockCode(reward.type)
      setAvailablePoints(prev => prev - reward.points)
      setRedeemedRewards(prev => [...prev, reward.id])
      setCouponModal({
        show: true,
        code,
        discount: reward.discount,
        type: reward.type,
        rewardName: reward.name,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      })
    }

    setRedeeming(null)
  }

  const generateMockCode = (type: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const prefix = type === 'discount' ? 'DISC' :
                   type === 'amazon' ? 'AMZ' :
                   type === 'starbucks' ? 'SBX' : 'RWRD'
    let code = prefix + '-'
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
    code += '-'
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  const handleCopy = () => {
    if (couponModal?.code) {
      navigator.clipboard.writeText(couponModal.code)
      setCopied(true)
      toast.success('Coupon code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const tierInfo = availablePoints >= 2000
    ? { name: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-50', next: null }
    : availablePoints >= 1000
    ? { name: 'Silver', color: 'text-gray-500', bg: 'bg-gray-50', next: 2000 }
    : { name: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-50', next: 1000 }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Rewards Center</h1>
        <p className="text-muted-foreground mt-1">
          Earn points and redeem for exciting rewards
        </p>
      </div>

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Points */}
        <div className="md:col-span-1 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
          <p className="text-indigo-200 text-sm font-medium">Available Points</p>
          <p className="text-5xl font-bold mt-2">{availablePoints.toLocaleString()}</p>
          <p className="text-indigo-200 text-sm mt-2">+250 points this month</p>
          <div className={`mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${tierInfo.bg} ${tierInfo.color}`}>
            <Trophy className="h-3 w-3" />
            {tierInfo.name} Member
          </div>
        </div>

        {/* How to Earn */}
        <div className="md:col-span-2 rounded-xl border bg-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            How to Earn Points
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { action: 'Attend a Class', points: '+10', icon: '📚' },
              { action: 'Perfect Attendance', points: '+50', icon: '🏆' },
              { action: 'Submit Assignment', points: '+25', icon: '📝' },
              { action: 'Complete a Quiz', points: '+15', icon: '✅' },
              { action: 'Refer a Friend', points: '+200', icon: '👥' },
              { action: 'Complete Course', points: '+500', icon: '🎓' },
            ].map(item => (
              <div key={item.action} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.action}</p>
                </div>
                <span className="text-xs font-bold text-green-600 shrink-0">{item.points}</span>
              </div>
            ))}
          </div>

          {/* Progress to next tier */}
          {tierInfo.next && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress to {tierInfo.next === 1000 ? 'Silver' : 'Gold'}</span>
                <span>{availablePoints} / {tierInfo.next}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${Math.min((availablePoints / tierInfo.next) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rewards Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-indigo-600" />
          Available Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map(reward => {
            const canRedeem = availablePoints >= reward.points
            const alreadyRedeemed = redeemedRewards.includes(reward.id)
            const isRedeeming = redeeming === reward.id

            return (
              <div key={reward.id} className={`rounded-xl border p-5 ${reward.color} relative`}>
                {reward.popular && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Popular
                  </span>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${reward.iconBg} flex items-center justify-center text-2xl shrink-0`}>
                    {reward.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                  </div>
                </div>

                {reward.type === 'discount' && (
                  <div className="flex items-center gap-1 mb-3 p-2 bg-white/60 rounded-lg">
                    <Tag className="h-3 w-3 text-indigo-600" />
                    <p className="text-xs text-indigo-700 font-medium">
                      Use at course checkout → ₹{reward.discount} off!
                    </p>
                  </div>
                )}

                {reward.type !== 'discount' && (
                  <div className="flex items-center gap-1 mb-3 p-2 bg-white/60 rounded-lg">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <p className="text-xs text-amber-700">Admin approval within 24hrs</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold text-sm">{reward.points} points</span>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem || alreadyRedeemed || isRedeeming}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1
                      ${alreadyRedeemed
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : canRedeem
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {isRedeeming ? (
                      <><Loader2 className="h-3 w-3 animate-spin" />Redeeming...</>
                    ) : alreadyRedeemed ? (
                      <><Check className="h-3 w-3" />Redeemed</>
                    ) : !canRedeem ? (
                      'Not Enough Points'
                    ) : (
                      <>Redeem</>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Points History */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Points History</h2>
        <div className="space-y-3">
          {pointsHistory.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${item.type === 'earn' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {item.type === 'earn' ? '⬆️' : '⬇️'}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.reason}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
              <span className={`font-bold text-sm ${item.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'earn' ? '+' : ''}{item.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon Modal */}
      {couponModal?.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-xl font-bold">Reward Redeemed! 🎉</h2>

            {couponModal.type === 'discount' ? (
              <p className="text-muted-foreground text-sm mt-2">
                Your course discount coupon is ready! Use it at checkout.
              </p>
            ) : (
              <p className="text-muted-foreground text-sm mt-2">
                Your redemption request has been sent. Admin will approve within 24 hours.
              </p>
            )}

            {/* Coupon Code Box */}
            <div className="mt-4 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                {couponModal.type === 'discount' ? 'Your Coupon Code' : 'Reference Code'}
              </p>
              <p className="text-2xl font-bold text-indigo-600 tracking-widest">
                {couponModal.code}
              </p>
              {couponModal.discount > 0 && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  ₹{couponModal.discount} discount
                </p>
              )}
            </div>

            {/* How to use */}
            {couponModal.type === 'discount' && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-left">
                <p className="text-xs font-semibold text-indigo-700 mb-1">
                  📌 How to use:
                </p>
                <ol className="text-xs text-indigo-600 space-y-0.5 list-decimal list-inside">
                  <li>Go to My Courses page</li>
                  <li>Click "Enroll Now" on any course</li>
                  <li>Enter this code at payment step</li>
                  <li>Get ₹{couponModal.discount} off instantly!</li>
                </ol>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              ⚠️ Save this code — it will not be shown again.
              {couponModal.expiresAt && ` Expires: ${new Date(couponModal.expiresAt).toLocaleDateString()}`}
            </p>

            <button
              onClick={handleCopy}
              className={`mt-4 w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors
                ${copied
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
              {copied ? (
                <><Check className="h-4 w-4" />Copied!</>
              ) : (
                <><Copy className="h-4 w-4" />Copy Code</>
              )}
            </button>

            <button
              onClick={() => setCouponModal(null)}
              className="mt-2 w-full py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}