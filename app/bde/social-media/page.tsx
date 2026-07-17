"use client";

import { Mail, Send, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react';

const channels = [
  { name: 'Email', icon: <Mail className="h-6 w-6" />, color: 'bg-blue-100 text-blue-600', description: 'Send bulk emails to leads', available: true },
  { name: 'Telegram', icon: <Send className="h-6 w-6" />, color: 'bg-sky-100 text-sky-600', description: 'Send messages to Telegram group', available: true },
  { name: 'WhatsApp', icon: <MessageCircle className="h-6 w-6" />, color: 'bg-green-100 text-green-600', description: 'Send WhatsApp messages to leads', available: true },
  { name: 'Instagram', icon: <Instagram className="h-6 w-6" />, color: 'bg-pink-100 text-pink-600', description: 'Open Instagram DMs', available: false },
  { name: 'Facebook', icon: <Facebook className="h-6 w-6" />, color: 'bg-indigo-100 text-indigo-600', description: 'Open Facebook Messenger', available: false },
  { name: 'Twitter', icon: <Twitter className="h-6 w-6" />, color: 'bg-slate-100 text-slate-600', description: 'Open Twitter DMs', available: false },
];

export default function SocialMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Social Media / Channels</h1>
        <p className="text-muted-foreground mt-1">Send messages to your leads across different platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <div key={channel.name} className="rounded-xl border bg-card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel.color}`}>
                {channel.icon}
              </div>
              <div>
                <h3 className="font-semibold">{channel.name}</h3>
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              </div>
            </div>
            {channel.available ? (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">✓ Available</span>
                <span className="text-xs text-muted-foreground">Use from My Leads page</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">Coming Soon</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-2">How to send bulk messages</h2>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Go to <strong>My Leads</strong> page</li>
          <li>Select leads using the checkboxes</li>
          <li>Click the <strong>Social Media</strong> button that appears</li>
          <li>Choose your channel — Email, Telegram, or WhatsApp</li>
          <li>Compose and send your message</li>
        </ol>
      </div>
    </div>
  );
}