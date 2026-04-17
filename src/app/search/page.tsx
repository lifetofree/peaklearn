import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { FileText, Video, X } from 'lucide-react'
import type { Content, Video as VideoType } from '@/types/database'

function sanitizeForLike(input: string): string {
  return input
    .slice(0, 100)
    .replace(/[%_()\[\]{}^'"\\;]/g, (match) => '\\' + match)
}

function sanitizeForJson(input: string): string {
  return input
    .slice(0, 100)
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\x00/g, '')
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const rawQuery = sp.q || ''
  const sanitizedQuery = sanitizeForJson(rawQuery)
  const safeQuery = sanitizeForLike(rawQuery)

  let contentResults: Content[] = []
  let videoResults: VideoType[] = []

  if (rawQuery) {
    const [contentRes, videoRes] = await Promise.all([
      supabase
        .from('content')
        .select('*')
        .or(`title.ilike.%${safeQuery}%,tags.cs.{${safeQuery}}`)
        .order('updated_at', { ascending: false }),

      supabase
        .from('videos')
        .select('*')
        .or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,tags.cs.{${safeQuery}}`)
        .order('created_at', { ascending: false }),
    ])

    contentResults = contentRes.data || []
    videoResults = videoRes.data || []
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch searchValue={sanitizedQuery} />
      {rawQuery && (
        <div className="container mx-auto px-4 py-2">
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear search
          </Link>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {rawQuery ? (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Search results for &ldquo;{sanitizedQuery}&rdquo;
              </h2>
              <p className="text-muted-foreground">
                {contentResults.length + videoResults.length} results found
              </p>
            </div>

            {contentResults.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content ({contentResults.length})
                </h3>
                <div className="space-y-3">
                  {contentResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/content/${item.id}`}
                      className="block p-4 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      <h4 className="font-medium">{item.title}</h4>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {videoResults.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Videos ({videoResults.length})
                </h3>
                <div className="space-y-3">
                  {videoResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/videos/v/${item.id}`}
                      className="block p-4 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      <h4 className="font-medium">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {contentResults.length === 0 && videoResults.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No results found for &ldquo;{sanitizedQuery}&rdquo;</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Enter a search term to find content and videos</p>
          </div>
        )}
      </main>
    </div>
  )
}
