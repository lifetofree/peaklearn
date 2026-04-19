'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DuckLogo from '@/components/DuckLogo'
import Editor from '@/components/editor/Editor'
import { ArrowLeft, Save, X, Tag } from 'lucide-react'
import Link from 'next/link'

export default function NewContentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState<any>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in')
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('content')
      .insert({
        title,
        body: content || {},
        tags,
        is_published: isPublished,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      alert('Failed to create content')
      return
    }

    router.push(`/content/${data.id}`)
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
            <Button variant="outline" onClick={() => router.push('/content')}>
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
        <div className="max-w-4xl mx-auto">
          <Link
            href="/content"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Content
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
                placeholder="Enter article title..."
                className="text-xl font-semibold"
              />
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

            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <Editor
                content={content}
                onChange={setContent}
                editable={true}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm">
                Publish this article
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
