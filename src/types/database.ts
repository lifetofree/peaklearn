export type UserRole = 'owner' | 'contributor' | 'viewer'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Collection {
  id: string
  title: string
  description: string | null
  user_id: string
  created_at: string
}

export interface Video {
  id: string
  youtube_url: string
  title: string
  description: string | null
  thumbnail_url: string | null
  duration: number | null
  tags: string[]
  collection_id: string | null
  user_id: string
  created_at: string
}

export interface Content {
  id: string
  title: string
  body: any
  tags: string[]
  is_published: boolean
  created_by: string
  updated_at: string
}

export interface ContentVersion {
  id: string
  content_id: string
  body: any
  version_number: number
  created_at: string
}

export interface Comment {
  id: string
  content_id: string
  body: string
  created_by: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'>
        Update: Partial<User>
      }
      collections: {
        Row: Collection
        Insert: Omit<Collection, 'id' | 'created_at'>
        Update: Partial<Collection>
      }
      videos: {
        Row: Video
        Insert: Omit<Video, 'id' | 'created_at'>
        Update: Partial<Video>
      }
      content: {
        Row: Content
        Insert: Omit<Content, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Content>
      }
      content_versions: {
        Row: ContentVersion
        Insert: Omit<ContentVersion, 'id' | 'created_at'>
        Update: Partial<ContentVersion>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'>
        Update: Partial<Comment>
      }
    }
  }
}
