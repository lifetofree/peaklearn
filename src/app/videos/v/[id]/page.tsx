import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const runtime = 'edge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DuckLogo from '@/components/DuckLogo'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import { ArrowLeft, Video, Tag, Clock, Edit } from 'lucide-react'
import { extractYouTubeId, formatDuration } from '@/lib/youtube'

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: video } = await supabase
    .from('videos')
    .select('*, collections(*)')
    .eq('id', id)
    .single()

  if (!video) {
    redirect('/videos')
  }

  const videoId = extractYouTubeId(video.youtube_url)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <DuckLogo />
            <h1 className="text-2xl font-bold">PeakLearn</h1>
          </Link>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/videos/v/${id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link
          href={video.collection_id ? `/videos/${video.collection_id}` : '/videos'}
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {video.collection_id ? 'Collection' : 'Videos'}
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{video.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                YouTube
              </span>
              {video.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(video.duration)}
                </span>
              )}
              <span>
                Added: {new Date(video.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {videoId && (
            <YouTubeEmbed
              videoId={videoId}
              title={video.title}
              description={video.description || undefined}
              duration={video.duration || undefined}
            />
          )}

          {video.tags && video.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {video.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
            <p>
              Original URL:{' '}
              <a
                href={video.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {video.youtube_url}
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
