'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DuckLogo from '@/components/DuckLogo'
import { ArrowLeft, Save, Trash2, X, Tag, Folder } from 'lucide-react'
import Link from 'next/link'

export default function EditVideoPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [collections, setCollections] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const init = async () => {
      const [videoRes, colRes] = await Promise.all([
        supabase.from('videos').select('*').eq('id', params.id).single(),
        supabase.from('collections').select('*').order('title'),
      ])

      if (videoRes.error || !videoRes.data) {
        setNotFound(true)
        return
      }

      setTitle(videoRes.data.title)
      setDescription(videoRes.data.description || '')
      setTags(videoRes.data.tags || [])
      setCollectionId(videoRes.data.collection_id || '')

      if (colRes.data) setCollections(colRes.data)
    }

    init()
  }, [params.id])

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('videos')
      .update({
        title,
        description,
        tags,
        collection_id: collectionId || null,
      })
      .eq('id', params.id)

    setSaving(false)

    if (error) {
      alert('Failed to update video')
      return
    }

    router.push(`/videos/v/${params.id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this video?')) return

    setDeleting(true)

    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', params.id)

    setDeleting(false)

    if (error) {
      alert('Failed to delete video')
      return
    }

    router.push('/videos')
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

  if (notFound) {
    router.push('/videos')
    return null
  }

  if (!title) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
              <Trash2 className="h-4 w-4 ml-2" />
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
            href={`/videos/v/${params.id}`}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Video
          </Link>

          <div className="space-y-6">
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
                Collection
              </label>
              <select
                id="collection"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Uncategorized</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
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
    </div>
  )
}
