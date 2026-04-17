'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DuckLogo from '@/components/DuckLogo'
import { ArrowLeft, Save, Video, Tag, Folder, X } from 'lucide-react'
import Link from 'next/link'
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/youtube'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'

export default function AddVideoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingVideo, setFetchingVideo] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast, showToast, dismiss } = useToast()

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('title')

    if (data) {
      setCollections(data)
    }
  }

  const fetchVideoInfo = async () => {
    const videoId = extractYouTubeId(url)

    if (!videoId) {
      showToast('Invalid YouTube URL', 'error')
      return
    }

    setFetchingVideo(true)

    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      )

      if (response.ok) {
        const data = await response.json()
        setTitle(data.title)
        setDescription(data.description || '')
      }
    } catch (error) {
      console.error('Failed to fetch video info:', error)
    } finally {
      setFetchingVideo(false)
    }
  }

  const handleSave = async () => {
    const videoId = extractYouTubeId(url)

    if (!videoId) {
      showToast('Invalid YouTube URL', 'error')
      return
    }

    if (!title.trim()) {
      showToast('Please enter a title', 'error')
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    const thumbnailUrl = getYouTubeThumbnail(videoId, 'high')

    const { error } = await supabase.from('videos').insert({
      youtube_url: url,
      title,
      description,
      thumbnail_url: thumbnailUrl,
      duration,
      tags,
      collection_id: collectionId || null,
      user_id: user.id,
    })

    setSaving(false)

    if (error) {
      showToast('Failed to add video — please try again', 'error')
      return
    }

    if (collectionId) {
      router.push(`/videos/${collectionId}`)
    } else {
      router.push('/videos')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <DuckLogo />
            <h1 className="text-2xl font-bold">PeakLearn</h1>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/videos')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/videos"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Videos
          </Link>

          <div className="space-y-6">
            <div>
              <label htmlFor="url" className="text-sm font-medium mb-2 block">
                YouTube URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1"
                />
                <Button
                  onClick={fetchVideoInfo}
                  disabled={fetchingVideo || !url}
                  variant="outline"
                >
                  {fetchingVideo ? 'Fetching...' : 'Fetch Info'}
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="text-sm font-medium mb-2 block">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Video title..."
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium mb-2 block">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Video description..."
                className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y"
              />
            </div>

            <div>
              <label htmlFor="collection" className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Collection (optional)
              </label>
              <select
                id="collection"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Uncategorized</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add a tag..."
                />
                <Button onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}
    </div>
  )
}
