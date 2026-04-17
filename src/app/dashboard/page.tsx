import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DuckLogo from '@/components/DuckLogo'
import HeaderActions from '@/components/HeaderActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Video,
  Plus,
  Search,
} from 'lucide-react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/content', label: 'Content' },
  { href: '/videos', label: 'Videos' },
  { href: '/search', label: 'Search' },
]

function NavLinks({ activeHref }: { activeHref: string }) {
  return (
    <>
      {navLinks.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className={
            href === activeHref
              ? 'text-sm font-medium text-primary bg-accent px-3 py-1.5 rounded-lg whitespace-nowrap'
              : 'text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap'
          }
        >
          {label}
        </a>
      ))}
    </>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const [
    { data: recentContent },
    { data: recentVideos },
    { data: collections },
  ] = await Promise.all([
    supabase
      .from('content')
      .select('id,title,updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('videos')
      .select('id,title,created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('collections')
      .select('id,title,description')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DuckLogo />
            <span className="text-base font-semibold tracking-tight">PeakLearn</span>
          </div>
          <HeaderActions />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-2xl font-semibold">Welcome back.</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Your knowledge base at a glance.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/content/new">
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </a>
            </Button>
            <Button asChild>
              <a href="/videos">
                <Video className="h-4 w-4 mr-2" />
                Add Video
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Quick Search
              </CardTitle>
              <CardDescription>
                Search across all your content and videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/search" method="GET">
                <Input type="text" name="q" placeholder="Search..." />
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Content
              </CardTitle>
              <CardDescription>Your latest articles</CardDescription>
            </CardHeader>
            <CardContent>
              {recentContent && recentContent.length > 0 ? (
                <ul className="space-y-3">
                  {recentContent.map((item: any) => (
                    <li key={item.id}>
                      <a
                        href={`/content/${item.id}`}
                        className="block hover:bg-secondary rounded-lg p-2 -mx-2 transition-colors"
                      >
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No content yet. Create your first article!
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Recent Videos
              </CardTitle>
              <CardDescription>Your latest clips</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVideos && recentVideos.length > 0 ? (
                <ul className="space-y-3">
                  {recentVideos.map((video: any) => (
                    <li key={video.id}>
                      <a
                        href={`/videos/v/${video.id}`}
                        className="block hover:bg-secondary rounded-lg p-2 -mx-2 transition-colors"
                      >
                        <p className="font-medium">{video.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(video.created_at).toLocaleDateString()}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No videos yet. Add your first clip!
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Collections</CardTitle>
              <CardDescription>Your playlists</CardDescription>
            </CardHeader>
            <CardContent>
              {collections && collections.length > 0 ? (
                <ul className="space-y-3">
                  {collections.map((collection: any) => (
                    <li key={collection.id}>
                      <a
                        href={`/videos/${collection.id}`}
                        className="block hover:bg-secondary rounded-lg p-2 -mx-2 transition-colors"
                      >
                        <p className="font-medium">{collection.title}</p>
                        {collection.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {collection.description}
                          </p>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No collections yet. Create your first playlist!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
