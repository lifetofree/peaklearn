'use client'

import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@/components/editor/Editor'), {
  ssr: false,
  loading: () => <div className="p-4">Loading editor...</div>,
})

interface EditorWrapperProps {
  content: any
  onChange?: (content: any) => void
  editable?: boolean
  className?: string
}

export default function EditorWrapper({ content, onChange, editable, className }: EditorWrapperProps) {
  return (
    <Editor
      content={content}
      onChange={onChange}
      editable={editable}
      className={className}
    />
  )
}
