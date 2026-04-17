# PeakLearn

A personal knowledge management system with video collections, built with Next.js, Supabase, and TipTap.

## Features

- ✨ **Magic Link Authentication** - Passwordless email login
- 📝 **Rich Text Editor** - Notion-like block editor with TipTap
- 🎥 **YouTube Video Collections** - Organize clips into playlists
- 🔍 **Full-text Search** - Search across content and videos
- 🏷️ **Tags & Categories** - Organize with tags and collections
- 📊 **Content Versioning** - Track revision history (nice-to-have)
- 💬 **Comments** - Add annotations to content (nice-to-have)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Editor**: TipTap (ProseMirror-based)
- **Video**: react-youtube with privacy-enhanced mode
- **Hosting**: Vercel
- **Styling**: Tailwind CSS + shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up free](https://supabase.com/))

### 1. Clone the repository

```bash
git clone <repository-url>
cd peaklearn
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually 1-2 minutes)
3. Go to **Settings > API** and copy:
   - Project URL
   - anon public key

4. Create the database tables:
   - Go to **SQL Editor** in Supabase dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the SQL script

5. Configure Email Auth:
   - Go to **Authentication > Providers**
   - Enable **Email** provider
   - Configure email settings (Supabase provides free email service)

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
peaklearn/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── content/           # Content management
│   │   ├── videos/            # Video collections
│   │   ├── search/            # Search page
│   │   ├── settings/          # User settings
│   │   ├── dashboard/         # Main dashboard
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # UI components (shadcn/ui)
│   │   ├── editor/            # TipTap editor
│   │   ├── DuckLogo.tsx       # Logo component
│   │   └── YouTubeEmbed.tsx   # YouTube player
│   ├── lib/
│   │   ├── supabase/          # Supabase client
│   │   ├── utils.ts           # Utility functions
│   │   └── youtube.ts         # YouTube utilities
│   └── types/
│       └── database.ts        # TypeScript types
├── supabase/
│   └── migrations/            # Database migrations
└── package.json
```

## Database Schema

### Tables

- `users` - User profiles (extends Supabase auth)
- `collections` - Video playlists/collections
- `videos` - YouTube video clips
- `content` - Knowledge articles
- `content_versions` - Content revision history
- `comments` - Article comments

### Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data.

## Pages

| Path | Description |
|------|-------------|
| `/` | Login page (magic link) |
| `/dashboard` | Main dashboard with overview |
| `/content` | List all articles |
| `/content/new` | Create new article |
| `/content/[id]` | View/edit article |
| `/videos` | Video collections list |
| `/videos/[collectionId]` | View collection |
| `/videos/add` | Add new video |
| `/videos/new-collection` | Create collection |
| `/search` | Full-text search |
| `/settings` | User settings |

## Features in Detail

### Magic Link Authentication

- Passwordless email login
- 15-minute token expiry
- Single-use tokens for security
- Automatic user creation on first login

### YouTube Integration

- Privacy-enhanced player (`youtube-nocookie.com`)
- Auto-fetch video metadata (title, description)
- Thumbnail support
- Collections/playlists
- Tag support

### Content Editor

- Block-based editor (TipTap)
- Rich text formatting (bold, italic, lists, links)
- Markdown support
- Tags and categories
- Draft/publish workflow
- Version history tracking

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your production URL)
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
