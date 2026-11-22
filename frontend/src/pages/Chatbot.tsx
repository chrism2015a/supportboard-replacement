import { useState, useEffect } from 'react'
import { Bot, Plus, Search, Trash2, Edit2, Eye, EyeOff, Settings as SettingsIcon, MessageSquare, Zap } from 'lucide-react'
import { chatbotAPI } from '../services/api'
import toast from 'react-hot-toast'

interface ChatbotConfig {
  id: string
  name: string
  is_active: boolean
  default_message?: string
  welcome_message?: string
  fallback_message?: string
  human_takeover_on_fallback: boolean
  auto_translate: boolean
  speech_recognition: boolean
  image_analysis: boolean
  web_search: boolean
  conversation_history: boolean
}

export default function Chatbot() {
  const [configs, setConfigs] = useState<ChatbotConfig[]>([])
  const [qnas, setQnas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddConfig, setShowAddConfig] = useState(false)
  const [activeTab, setActiveTab] = useState<'configs' | 'qna' | 'flows'>('configs')
  const [selectedConfig, setSelectedConfig] = useState<string>('default')
  const [newConfigName, setNewConfigName] = useState('')
  const [newQnAQuestion, setNewQnAQuestion] = useState('')
  const [newQnAAnswer, setNewQnAAnswer] = useState('')

  useEffect(() => {
    Promise.all([
      chatbotAPI.listConfigs().catch(() => ({ data: [] })),
      chatbotAPI.listQnA('default').catch(() => ({ data: [] })),
    ]).then(([configsRes, qnaRes]) => {
      setConfigs(configsRes.data || [])
      setQnas(qnaRes.data || [])
      setLoading(false)
    }).catch(() => {
      // Mock data
      setConfigs([
        {
          id: 'default',
          name: 'Default Assistant',
          is_active: true,
          welcome_message: 'Hi there! How can I help you?',
          fallback_message: "I'm not sure about that. Let me connect you with an agent.",
          human_takeover_on_fallback: true,
          auto_translate: true,
          speech_recognition: false,
          image_analysis: false,
          web_search: false,
          conversation_history: true,
        },
      ])
      setQnas([
        { id: '1', question: 'What are your hours?', answer: 'We are available 24/7!' },
        { id: '2', question: 'How do I reset my password?', answer: 'Go to settings and click "Forgot Password"' },
      ])
      setLoading(false)
    })
  }, [])

  const handleAddConfig = async () => {
    if (!newConfigName) return
    try {
      const res = await chatbotAPI.createConfig({ name: newConfigName })
      setConfigs([...configs, res.data])
      setShowAddConfig(false)
      setNewConfigName('')
      toast.success('Chatbot config created')
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddQnA = async () => {
    if (!newQnAQuestion || !newQnAAnswer) return
    try {
      const res = await chatbotAPI.createQnA({
        chatbot_id: selectedConfig,
        question: newQnAQuestion,
        answer: newQnAAnswer,
      })
      setQnas([...qnas, res.data])
      setNewQnAQuestion('')
      setNewQnAAnswer('')
      toast.success('Q&A pair added')
    } catch (error) {
      // Mock
      setQnas([...qnas, { id: String(Date.now()), question: newQnAQuestion, answer: newQnAAnswer }])
      setNewQnAQuestion('')
      setNewQnAAnswer('')
      toast.success('Q&A pair added')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chatbot</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure AI chatbot and automated responses
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddConfig(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Config
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {(['configs', 'qna', 'flows'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'configs' ? 'Configs' : tab === 'qna' ? 'Q&A' : 'Flows'}
          </button>
        ))}
      </div>

      {/* Add Config Modal */}
      {showAddConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-scale-in border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Chatbot Config</h2>
            <input
              type="text"
              value={newConfigName}
              onChange={(e) => setNewConfigName(e.target.value)}
              placeholder="Config name..."
              className="input mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAddConfig(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleAddConfig} className="btn btn-primary">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Configs Tab */}
      {activeTab === 'configs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            configs.map(config => (
              <div key={config.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Bot className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{config.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {config.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Toggle active
                      setConfigs(configs.map(c =>
                        c.id === config.id ? { ...c, is_active: !c.is_active } : c
                      ))
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {config.is_active ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Welcome:</span> {config.welcome_message || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Fallback:</span> {config.fallback_message || 'N/A'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {config.human_takeover_on_fallback && (
                    <span className="badge badge-success">Human Takeover</span>
                  )}
                  {config.auto_translate && (
                    <span className="badge badge-primary">Auto Translate</span>
                  )}
                  {config.speech_recognition && (
                    <span className="badge badge-warning">Speech</span>
                  )}
                  {config.image_analysis && (
                    <span className="badge badge-warning">Vision</span>
                  )}
                  {config.web_search && (
                    <span className="badge badge-primary">Web Search</span>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <SettingsIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Q&A Tab */}
      {activeTab === 'qna' && (
        <div className="space-y-6">
          {/* Add Q&A */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add Q&A Pair</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newQnAQuestion}
                onChange={(e) => setNewQnAQuestion(e.target.value)}
                placeholder="Question..."
                className="input"
              />
              <textarea
                value={newQnAAnswer}
                onChange={(e) => setNewQnAAnswer(e.target.value)}
                placeholder="Answer..."
                className="input min-h-[80px]"
              />
              <button onClick={handleAddQnA} className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Q&A
              </button>
            </div>
          </div>

          {/* Q&A List */}
          <div className="space-y-3">
            {qnas.map(qna => (
              <div key={qna.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{qna.question}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">{qna.answer}</p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flows Tab */}
      {activeTab === 'flows' && (
        <div className="card p-12 text-center">
          <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chatbot Flows</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create conversation flows to guide users through complex interactions
          </p>
          <button className="btn btn-primary mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create Flow
          </button>
        </div>
      )}
    </div>
  )
}
