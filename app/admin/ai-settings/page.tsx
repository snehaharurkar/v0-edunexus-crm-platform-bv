"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Save, Sparkles, Brain, FileText, MessageSquare } from 'lucide-react';

export default function AISettingsPage() {
  const [showKeys, setShowKeys] = useState({
    claude: false,
    openai: false,
    gemini: false,
  });
  
  const [apiKeys, setApiKeys] = useState({
    claude: '',
    openai: '',
    gemini: '',
  });

  const [features, setFeatures] = useState({
    aiNotes: true,
    aiScoring: true,
    resumeBuilder: false,
    aiCounselor: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast.success('AI settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Settings</h1>
        <p className="text-muted-foreground mt-1">Configure AI integrations and features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">API Keys</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Configure your AI provider API keys for enhanced features.
          </p>

          <div className="space-y-4">
            {/* Claude API Key */}
            <div className="space-y-2">
              <Label htmlFor="claude">Claude API Key</Label>
              <div className="relative">
                <Input
                  id="claude"
                  type={showKeys.claude ? 'text' : 'password'}
                  value={apiKeys.claude}
                  onChange={(e) => setApiKeys({ ...apiKeys, claude: e.target.value })}
                  placeholder="sk-ant-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, claude: !showKeys.claude })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys.claude ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <Label htmlFor="openai">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="openai"
                  type={showKeys.openai ? 'text' : 'password'}
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Gemini API Key */}
            <div className="space-y-2">
              <Label htmlFor="gemini">Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="gemini"
                  type={showKeys.gemini ? 'text' : 'password'}
                  value={apiKeys.gemini}
                  onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                  placeholder="AIza..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys.gemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">AI Features</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enable or disable AI-powered features across the platform.
          </p>

          <div className="space-y-6">
            {/* AI Notes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">AI Notes Generator</p>
                  <p className="text-sm text-muted-foreground">Auto-generate lecture notes</p>
                </div>
              </div>
              <Switch
                checked={features.aiNotes}
                onCheckedChange={(checked) => setFeatures({ ...features, aiNotes: checked })}
              />
            </div>

            {/* AI Scoring */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">AI Lead Scoring</p>
                  <p className="text-sm text-muted-foreground">Smart lead scoring system</p>
                </div>
              </div>
              <Switch
                checked={features.aiScoring}
                onCheckedChange={(checked) => setFeatures({ ...features, aiScoring: checked })}
              />
            </div>

            {/* Resume Builder */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">AI Resume Builder</p>
                  <p className="text-sm text-muted-foreground">Generate optimized resumes</p>
                </div>
              </div>
              <Switch
                checked={features.resumeBuilder}
                onCheckedChange={(checked) => setFeatures({ ...features, resumeBuilder: checked })}
              />
            </div>

            {/* AI Counselor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">AI Counselor</p>
                  <p className="text-sm text-muted-foreground">24/7 student support chatbot</p>
                </div>
              </div>
              <Switch
                checked={features.aiCounselor}
                onCheckedChange={(checked) => setFeatures({ ...features, aiCounselor: checked })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
