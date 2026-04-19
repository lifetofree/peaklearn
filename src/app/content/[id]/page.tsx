import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DuckLogo from '@/components/DuckLogo'
import { ArrowLeft, Edit, Trash2, History } from 'lucide-react'
import EditorWrapper from '@/components/editor/EditorWrapper'

async function deleteContent(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('content').delete().eq('id', id)
  redirect('/content')
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single()

  if (!content) {
    redirect('/content')
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
        <div className="mb-6">
          <Link
            href="/content"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Content
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-3xl font-bold">{content.title}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link href={`/content/${content.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/content/${content.id}/versions`}>
                  <History className="h-4 w-4" />
                </Link>
              </Button>
              <form action={deleteContent}>
                <input type="hidden" name="id" value={content.id} />
                <Button type="submit" variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </form>
            </div>
          </div>

          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {content.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-slate max-w-none dark:prose-invert">
            <EditorWrapper content={content.body} editable={false} />
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
            <p>
              Created: {new Date(content.created_at).toLocaleString()}
            </p>
            <p>
              Last updated: {new Date(content.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
