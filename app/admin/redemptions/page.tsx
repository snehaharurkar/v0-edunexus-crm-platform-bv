"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Gift, Check, Clock, X } from 'lucide-react'

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRedemptions()
  }, [])

  const fetchRedemptions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reward_redemptions')
      .select('*')
      .order('created_at', { ascending: false })
    setRedemptions(data || [])
    setLoading(false)
  }

  const handleApprove = async (id: string, studentName: string, rewardName: string) => {
    const { error } = await supabase
      .from('reward_redemptions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id)

    if (!error) {
      toast.success(`Approved ${rewardName} for ${studentName}`)
      fetchRedemptions()
    }
  }

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('reward_redemptions')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (!error) {
      toast.success('Redemption rejected')
      fetchRedemptions()
    }
  }

  const pending = redemptions.filter(r => r.status === 'pending')
  const approved = redemptions.filter(r => r.status === 'approved')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reward Redemptions</h1>
        <p className="text-muted-foreground mt-1">
          Manage student reward redemption requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pending.length}</p>
          <p className="text-sm text-amber-600">Pending Approval</p>
        </div>
        <div className="rounded-xl border bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{approved.length}</p>
          <p className="text-sm text-green-600">Approved</p>
        </div>
        <div className="rounded-xl border bg-blue-50 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{redemptions.length}</p>
          <p className="text-sm text-blue-600">Total Redemptions</p>
        </div>
      </div>

      {/* Pending Redemptions */}
      {pending.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Pending Approval ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.student_name}</p>
                    <p className="text-xs text-muted-foreground">{r.reward_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Code: <span className="font-mono font-bold">{r.coupon_code}</span>
                      {' • '}{r.points_used} points
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(r.id, r.student_name, r.reward_name)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Redemptions */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">All Redemptions</h2>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 animate-pulse bg-muted rounded-lg" />
            ))}
          </div>
        ) : redemptions.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No redemptions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {redemptions.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {r.student_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.reward_name} • {r.points_used} points
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.status === 'approved' ? 'bg-green-100 text-green-700' :
                    r.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}