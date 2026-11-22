import { useState, useEffect } from 'react'
import { Search, BookOpen, Plus, Eye, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react'
import { articlesAPI, categoriesAPI } from '../services/api'
import type { Article, Category } from '../types'

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      articlesAPI.list({ status: 'published' }).catch(() => ({ data: { articles: [], total: 0 } })),
      categoriesAPI.list().catch(() => ({ data: [] })),
    ]).then(([articlesRes, categoriesRes]) => {
      setArticles(articlesRes.data.articles || [])
      setCategories(categoriesRes.data || [])
      setLoading(false)
    })
  }, [])

  const filteredArticles = articles.filter(a => {
    if (selectedCategory && a.category_id !== selectedCategory) return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.content.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article)
    // Increment views via API
    articlesAPI.get(article.id).catch(() => {})
  }

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </button>

        <div className="card p-8">
          <div className="flex items-center gap-2 mb-4">
            {selectedArticle.category_name && (
              <span className="badge badge-primary">{selectedArticle.category_name}</span>
            )}
            <span className="text-xs text-gray-400">{selectedArticle.views} views</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{selectedArticle.title}</h1>
          <div className="prose dark:prose-invert max-w-none mb-8" dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br />') }} />
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Was this helpful?</span>
            <button className="btn btn-secondary btn-sm flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Helpful ({selectedArticle.helpful})
            </button>
            <button className="btn btn-secondary btn-sm flex items-center gap-2">
              <ThumbsDown className="w-4 h-4" />
              Not Helpful ({selectedArticle.not_helpful})
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Browse help articles and documentation
        </p>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="input pl-12 text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`sidebar-link w-full text-left ${!selectedCategory ? 'sidebar-link-active' : 'sidebar-link-hover'}`}
              >
                <BookOpen className="w-5 h-5" />
                All Articles
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`sidebar-link w-full text-left ${selectedCategory === cat.id ? 'sidebar-link-active' : 'sidebar-link-hover'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map(article => (
                <button
                  key={article.id}
                  onClick={() => handleViewArticle(article)}
                  className="card w-full text-left p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{article.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{article.content.substring(0, 150)}...</p>
                    </div>
                    <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>{article.author_name}</span>
                    <span>{article.views} views</span>
                    <span>{article.helpful} helpful</span>
                  </div>
                </button>
              ))}
              {filteredArticles.length === 0 && (
                <div className="card p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No articles found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
