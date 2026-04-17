import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DuckLogo from '@/components/DuckLogo'
import { Plus, Folder, Video, Edit, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 12

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const page = Math.max(1, parseInt(sp.page || '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [{ data: collections }, { data: uncategorizedVideos, count: uncategorizedCount }] = await Promise.all([
    supabase.from('collections').select('*, videos(count)').order('created_at', { ascending: false }),
    supabase.from('videos').select('*', { count: 'exact' }).is('collection_id', null).order('created_at', { ascending: false }).range(from, to),
  ])

  const totalPages = Math.ceil((uncategorizedCount || 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <DuckLogo />
            <h1 className="text-2xl font-bold">PeakLearn</h1>
          </Link>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/videos/new-collection">
                <Folder className="h-4 w-4 mr-2" />
                New Collection
              </Link>
            </Button>
            <Button asChild>
              <Link href="/videos/add">
                <Video className="h-4 w-4 mr-2" />
                Add Video
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Video Collections</h2>
          <p className="text-muted-foreground">
            Organize and manage your YouTube clips
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections && collections.length > 0 ? (
            collections.map((collection: any) => (
              <div
                key={collection.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/videos/${collection.id}`} className="block">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Folder className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{collection.title}</h3>
                    </div>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {collection.videos?.[0]?.count || 0} videos
                      </span>
                      <span>
                        {new Date(collection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="border-t px-6 py-3 bg-muted/30 flex justify-end">
                  <Link
                    href={`/videos/${collection.id}/edit`}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
              <p className="text-muted-foreground mb-4">
                Create collections to organize your videos
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link href="/videos/new-collection">Create Collection</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/videos/add">Add Video</Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {uncategorizedVideos && uncategorizedVideos.length > 0 && (
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Uncategorized Videos</h2>
              <p className="text-muted-foreground">
                Videos not assigned to any collection
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {uncategorizedVideos.map((video: any) => (
                <Link
                  key={video.id}
                  href={`/videos/v/${video.id}`}
                  className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
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
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} &middot; {uncategorizedCount} videos
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={page - 1 > 1 ? `/videos?page=${page - 1}` : '/videos'}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Link>
                    </Button>
                  )}
                  {page < totalPages && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/videos?page=${page + 1}`}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
