'use client'

import YouTube, { YouTubeProps } from 'react-youtube'
import { useState } from 'react'
import { Play } from 'lucide-react'
import { getYouTubeEmbedUrl, getYouTubeThumbnail, formatDuration } from '@/lib/youtube'
import { cn } from '@/lib/utils'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  description?: string
  duration?: number
  className?: string
  startTime?: number
}

export default function YouTubeEmbed({
  videoId,
  title,
  description,
  duration,
  className,
  startTime,
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const opts: YouTubeProps['opts'] = {
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  }

  const onPlay = () => {
    setIsPlaying(true)
  }

  const onPause = () => {
    setIsPlaying(false)
  }

  const onEnd = () => {
    setIsPlaying(false)
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <YouTube
          videoId={videoId}
          opts={opts}
          onPlay={onPlay}
          onPause={onPause}
          onEnd={onEnd}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>
      {(title || description || duration) && (
        <div className="mt-3 space-y-1">
          {title && (
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
          {duration && (
            <span className="text-xs text-muted-foreground">
              {formatDuration(duration)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
