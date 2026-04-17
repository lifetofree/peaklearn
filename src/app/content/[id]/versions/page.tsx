'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import DuckLogo from '@/components/DuckLogo'
import { ArrowLeft, History, RotateCcw, Eye } from 'lucide-react'
import Link from 'next/link'

interface ContentVersion {
  id: string
  content_id: string
  body: any
  version_number: number
  created_at: string
}

interface Content {
  id: string
  title: string
}

export default function ContentVersionsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      loadData()
    }
    checkAuth()
  }, [params.id])

  const loadData = async () => {
    const [contentRes, versionsRes] = await Promise.all([
      supabase
        .from('content')
        .select('id, title')
        .eq('id', params.id)
        .single(),
      supabase
        .from('content_versions')
        .select('*')
        .eq('content_id', params.id)
        .order('version_number', { ascending: false }),
    ])

    if (contentRes.error || !contentRes.data) {
      router.push('/content')
      return
    }

    setContent(contentRes.data)
    setVersions(versionsRes.data || [])
    setLoading(false)
  }

  const handleRestore = async (version: ContentVersion) => {
    if (!confirm(`Restore to version ${version.version_number}? This will create a new version with the current content first.`)) {
      return
    }

    setRestoring(version.id)

    const currentRes = await supabase
      .from('content')
      .select('body')
      .eq('id', params.id)
      .single()

    if (currentRes.data) {
      const latestVersionRes = await supabase
        .from('content_versions')
        .select('version_number')
        .eq('content_id', params.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()

      const nextVersion = latestVersionRes?.data?.version_number 
        ? latestVersionRes.data.version_number + 1 
        : 1

      await supabase.from('content_versions').insert({
        content_id: params.id,
        body: currentRes.data.body,
        version_number: nextVersion,
      })
    }

    const { error } = await supabase
      .from('content')
      .update({
        body: version.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    setRestoring(null)

    if (error) {
      alert('Failed to restore version')
      return
    }

    router.push(`/content/${params.id}`)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
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
          <Button
            variant="outline"
            onClick={() => router.push(`/content/${params.id}/edit`)}
          >
            Back to Edit
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/content/${params.id}`}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Article
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6" />
              Version History
            </h2>
            <p className="text-muted-foreground mt-1">{content?.title}</p>
          </div>

          {versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No versions yet</p>
              <p className="text-sm">Versions are created when you save changes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 flex items-center justify-between ${
                    selectedVersion?.id === version.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Version {version.version_number}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(version.created_at)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersion(
                          selectedVersion?.id === version.id ? null : version
                        )}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(version)}
                        disabled={restoring === version.id}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {restoring === version.id ? 'Restoring...' : 'Restore'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {selectedVersion && (
                <div className="border rounded-lg p-6 mt-6 bg-muted/30">
                  <h3 className="font-medium mb-4">
                    Preview - Version {selectedVersion.version_number}
                  </h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {selectedVersion.body?.content?.map((node: any, index: number) => (
                      <div key={index}>
                        {node.type === 'paragraph' && (
                          <p className="mb-2">
                            {node.content?.map((c: any) => c.text || '').join('')}
                          </p>
                        )}
                        {node.type === 'heading' && (
                          <h4 className="text-lg font-semibold mt-4 mb-2">
                            {node.content?.map((c: any) => c.text || '').join('')}
                          </h4>
                        )}
                        {node.type === 'bulletList' && (
                          <ul className="list-disc pl-6 mb-2">
                            {node.content?.map((item: any, i: number) => (
                              <li key={i}>
                                {item.content?.map((c: any) => c.text || '').join('')}
                              </li>
                            ))}
                          </ul>
                        )}
                        {node.type === 'orderedList' && (
                          <ol className="list-decimal pl-6 mb-2">
                            {node.content?.map((item: any, i: number) => (
                              <li key={i}>
                                {item.content?.map((c: any) => c.text || '').join('')}
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
