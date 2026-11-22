import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Bell, Bot, Shield, Globe, Palette, Link as LinkIcon } from 'lucide-react'
import { settingsAPI } from '../services/api'
import toast from 'react-hot-toast'

interface Setting {
  id: string
  key: string
  value: string | null
  category: string
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<Setting[]>([])
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock settings for demo
    setSettings([
      { id: '1', key: 'site_name', value: 'Support Board', category: 'general' },
      { id: '2', key: 'tagline', value: 'Smart Chat & Chatbot for Better Support', category: 'general' },
      { id: '3', key: 'primary_color', value: '#3b82f6', category: 'appearance' },
      { id: '4', key: 'default_language', value: 'en', category: 'general' },
      { id: '5', key: 'timezone', value: 'UTC', category: 'general' },
      { id: '6', key: 'auto_translate', value: 'true', category: 'chatbot' },
      { id: '7', key: 'speech_recognition', value: 'false', category: 'chatbot' },
      { id: '8', key: 'email_notifications', value: 'true', category: 'notifications' },
      { id: '9', key: 'push_notifications', value: 'true', category: 'notifications' },
      { id: '10', key: 'sms_notifications', value: 'false', category: 'notifications' },
    ])
    const initial: Record<string, string> = {}
    settings.forEach(s => { initial[s.key] = s.value || '' })
    setLocalSettings(initial)
    setLoading(false)
  }, [])

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'chatbot', label: 'Chatbot', icon: Bot },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure your support platform
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-link w-full text-left ${
                    activeTab === tab.id ? 'sidebar-link-active' : 'sidebar-link-hover'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="card p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
                    <input
                      type="text"
                      value={localSettings.site_name || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, site_name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={localSettings.tagline || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Language</label>
                    <select
                      value={localSettings.default_language || 'en'}
                      onChange={(e) => setLocalSettings({ ...localSettings, default_language: e.target.value })}
                      className="input"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="pt">Portuguese</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                    <select
                      value={localSettings.timezone || 'UTC'}
                      onChange={(e) => setLocalSettings({ ...localSettings, timezone: e.target.value })}
                      className="input"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={localSettings.primary_color || '#3b82f6'}
                        onChange={(e) => setLocalSettings({ ...localSettings, primary_color: e.target.value })}
                        className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localSettings.primary_color || '#3b82f6'}
                        onChange={(e) => setLocalSettings({ ...localSettings, primary_color: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chat Widget Position</label>
                    <select className="input">
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 py-2">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Show Powered By Badge</span>
                    </label>
                    <label className="flex items-center gap-3 py-2">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enable Dark Mode by Default</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive new messages via email</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Browser push notifications for new messages</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive alerts via SMS</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Sound Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Play sound on new messages</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" defaultChecked />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'chatbot' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chatbot Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Welcome Message</label>
                    <textarea
                      value="Hi there! How can I help you?"
                      onChange={() => {}}
                      className="input min-h-[60px]"
                      placeholder="Enter welcome message..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fallback Message</label>
                    <textarea
                      value="I'm not sure about that. Let me connect you with an agent."
                      onChange={() => {}}
                      className="input min-h-[60px]"
                      placeholder="Enter fallback message..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Auto Translate</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Automatically translate chatbot responses</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Speech Recognition</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Convert voice messages to text</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Image Analysis</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow chatbot to analyze images</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Web Search</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Enable chatbot to search the web</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Human Takeover on Fallback</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Transfer to agent when chatbot cannot answer</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-600" defaultChecked />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <input type="password" className="input" placeholder="Enter current password..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input type="password" className="input" placeholder="Enter new password..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                    <input type="password" className="input" placeholder="Confirm new password..." />
                  </div>
                  <button className="btn btn-primary">Update Password</button>
                </div>
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Privacy & GDPR</h3>
                  <label className="flex items-center gap-3 py-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enable Privacy Acceptance</span>
                  </label>
                  <label className="flex items-center gap-3 py-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Display Privacy Notice in Chat</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Integrations</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">OpenAI</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AI-powered chatbot and smart replies</p>
                      </div>
                      <input type="text" className="input w-64 text-sm" placeholder="sk-..." />
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Zapier</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Connect with 3000+ apps</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">Connect</button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Google Calendar</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Booking integration</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">Connect</button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">WooCommerce</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shop integration</p>
                      </div>
                      <button className="btn btn-secondary btn-sm">Connect</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
