import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DuckLogo from '@/components/DuckLogo'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import { ArrowLeft, Folder, Video, Edit } from 'lucide-react'

export default async function VideoCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>
}) {
  const { collectionId } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .single()

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false })

  if (!collection) {
    redirect('/videos')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <DuckLogo />
            <h1 className="text-2xl font-bold">PeakLearn</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/videos"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{collection.title}</h2>
              <p className="text-sm text-muted-foreground">
                {videos?.length || 0} videos
              </p>
            </div>
          </div>
          {collection.description && (
            <p className="text-muted-foreground ml-12">{collection.description}</p>
          )}
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video: any) => (
              <div
                key={video.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/videos/v/${video.id}`}>
                  <div className="aspect-video bg-muted relative">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4 flex items-start justify-between gap-2">
                  <Link href={`/videos/v/${video.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {video.description}
                      </p>
                    )}
                  </Link>
                  <Link
                    href={`/videos/v/${video.id}/edit`}
                    className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-4">
              Add YouTube videos to this collection
            </p>
            <Button asChild>
              <Link href="/videos/add">Add Video</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
