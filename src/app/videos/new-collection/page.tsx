'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DuckLogo from '@/components/DuckLogo'
import { ArrowLeft, Save, Folder } from 'lucide-react'
import Link from 'next/link'

export default function NewCollectionPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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
      .from('collections')
      .insert({
        title,
        description,
        user_id: user.id,
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      alert('Failed to create collection')
      return
    }

    router.push(`/videos/${data.id}`)
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
              <label htmlFor="title" className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Collection name..."
                className="text-xl font-semibold"
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium mb-2 block">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this collection..."
                className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] resize-y"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
