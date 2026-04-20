import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const runtime = 'edge'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Video,
  Plus,
  Search,
} from 'lucide-react'
import type { Content, Video as VideoType, Collection } from '@/types/database'
import { t } from '@/lib/i18n'

type RecentContent = Pick<Content, 'id' | 'title' | 'updated_at'>
type RecentVideo = Pick<VideoType, 'id' | 'title' | 'created_at'>

const navLinks = [
  { href: '/dashboard', label: 'nav.dashboard' },
  { href: '/content', label: 'nav.content' },
  { href: '/videos', label: 'nav.videos' },
  { href: '/search', label: 'nav.search' },
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
          {t(label)}
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

  const [
    { data: recentContent },
    { data: recentVideos },
    { data: collections },
  ] = await Promise.all([
    supabase
      .from('content')
      .select('id,title,updated_at')
      .order('updated_at', { ascending: false })
      .limit(5)
      .returns<RecentContent[]>(),
    supabase
      .from('videos')
      .select('id,title,created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<RecentVideo[]>(),
    supabase
      .from('collections')
      .select('id,title,description')
      .order('created_at', { ascending: false })
      .returns<Collection[]>(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-2xl font-semibold">{t('dashboard.welcome')}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/content/new">
                <Plus className="h-4 w-4 mr-2" />
                {t('dashboard.new_article')}
              </a>
            </Button>
            <Button asChild>
              <a href="/videos">
                <Video className="h-4 w-4 mr-2" />
                {t('dashboard.add_video')}
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t('dashboard.quick_search')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.quick_search_subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/search" method="GET">
                <Input type="text" name="q" placeholder={t('common.search_placeholder')} />
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('dashboard.recent_content')}
              </CardTitle>
              <CardDescription>{t('dashboard.recent_content_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentContent && recentContent.length > 0 ? (
                <ul className="space-y-3">
                  {recentContent.map((item: RecentContent) => (
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
                  {t('content.no_content')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                {t('dashboard.recent_videos')}
              </CardTitle>
              <CardDescription>{t('dashboard.recent_videos_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVideos && recentVideos.length > 0 ? (
                <ul className="space-y-3">
                  {recentVideos.map((video: RecentVideo) => (
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
                  {t('videos.no_videos')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.video_collections')}</CardTitle>
              <CardDescription>{t('dashboard.video_collections_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {collections && collections.length > 0 ? (
                <ul className="space-y-3">
                  {collections.map((collection: Collection) => (
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
                  {t('videos.no_collections')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
