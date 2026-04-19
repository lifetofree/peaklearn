import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DuckLogo from '@/components/DuckLogo'
import { Plus, FileText, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20

export default async function ContentListPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string; page?: string }>
}) {
  const sp = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const selectedTags = sp.tags ? sp.tags.split(',').filter(Boolean) : []
  const page = Math.max(1, parseInt(sp.page || '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const baseQuery = supabase.from('content').select('*', { count: 'exact' }).order('updated_at', { ascending: false })
  const contentQuery = selectedTags.length > 0
    ? baseQuery.overlaps('tags', selectedTags).range(from, to)
    : baseQuery.range(from, to)

  const { data: content, count } = await contentQuery
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const { data: allTags } = await supabase
    .from('content')
    .select('tags')

  const uniqueTags = Array.from(
    new Set(allTags?.flatMap((c: any) => c.tags) || [])
  )

  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    return next.length > 0 ? `/content?tags=${next.join(',')}` : '/content'
  }

  const pageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/content?${qs}` : '/content'
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <DuckLogo />
            <h1 className="text-2xl font-bold">PeakLearn</h1>
          </Link>
          <Button asChild>
            <Link href="/content/new">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Content</h2>
          <p className="text-muted-foreground">
            Manage your knowledge base articles
          </p>
        </div>

        {uniqueTags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Filter by tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.length > 0 && (
                <Link
                  href="/content"
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </Link>
              )}
              {uniqueTags.map((tag) => {
                const isSelected = selectedTags.includes(tag as string)
                return (
                  <Link
                    key={tag as string}
                    href={toggleTag(tag as string)}
                    className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm font-semibold'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border'
                    }`}
                  >
                    {isSelected && <X className="h-3 w-3" />}
                    {tag as string}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {content && content.length > 0 ? (
            content.map((item: any) => (
              <div
                key={item.id}
                className="border rounded-lg p-6 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/content/${item.id}`}
                      className="text-xl font-semibold mb-2 flex items-center gap-2 hover:underline"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-3">
                      Last updated: {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag: string) => {
                          const isActive = selectedTags.includes(tag)
                          return (
                            <Link
                              key={tag}
                              href={toggleTag(tag)}
                              className={`text-xs px-2.5 py-1 rounded-full transition-all duration-150 ${
                                isActive
                                  ? 'bg-primary text-primary-foreground font-semibold ring-2 ring-primary ring-offset-1 ring-offset-background shadow-sm'
                                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent'
                              }`}
                            >
                              {tag}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.is_published
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedTags.length > 0 ? `No content matching selected tags` : 'No content yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedTags.length > 0
                  ? 'Try selecting different tags or clear the filter'
                  : 'Start building your knowledge base'}
              </p>
              {selectedTags.length > 0 ? (
                <Button variant="outline" asChild>
                  <Link href="/content">Clear filter</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/content/new">Create your first article</Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} &middot; {count} articles
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={pageUrl(page - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Link>
                </Button>
              )}
              {page < totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={pageUrl(page + 1)}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
