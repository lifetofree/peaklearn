import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { FileText, Video, X } from 'lucide-react'
import type { Content, Video as VideoType } from '@/types/database'

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

  const rawQuery = (sp.q || '').trim().slice(0, 100)

  let contentResults: Content[] = []
  let videoResults: VideoType[] = []

  if (rawQuery) {
    const [
      { data: contentByTitle },
      { data: contentByTag },
      { data: videosByTitle },
      { data: videosByDesc },
      { data: videosByTag },
    ] = await Promise.all([
      supabase.from('content').select('id,title,tags,updated_at,is_published,body,created_by').ilike('title', `%${rawQuery}%`).order('updated_at', { ascending: false }),
      supabase.from('content').select('id,title,tags,updated_at,is_published,body,created_by').contains('tags', [rawQuery]).order('updated_at', { ascending: false }),
      supabase.from('videos').select('id,title,description,tags,thumbnail_url,youtube_url,collection_id,user_id,created_at,duration').ilike('title', `%${rawQuery}%`).order('created_at', { ascending: false }),
      supabase.from('videos').select('id,title,description,tags,thumbnail_url,youtube_url,collection_id,user_id,created_at,duration').ilike('description', `%${rawQuery}%`).order('created_at', { ascending: false }),
      supabase.from('videos').select('id,title,description,tags,thumbnail_url,youtube_url,collection_id,user_id,created_at,duration').contains('tags', [rawQuery]).order('created_at', { ascending: false }),
    ])

    const seenContent = new Set<string>()
    contentResults = [...(contentByTitle || []), ...(contentByTag || [])].filter(
      (item) => !seenContent.has(item.id) && !!seenContent.add(item.id)
    ) as Content[]

    const seenVideos = new Set<string>()
    videoResults = [...(videosByTitle || []), ...(videosByDesc || []), ...(videosByTag || [])].filter(
      (item) => !seenVideos.has(item.id) && !!seenVideos.add(item.id)
    ) as VideoType[]
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch searchValue={rawQuery} />
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
                Search results for &ldquo;{rawQuery}&rdquo;
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
                <p>No results found for &ldquo;{rawQuery}&rdquo;</p>
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
