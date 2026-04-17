export default function DuckLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="15.5" cy="10.5" r="1.5" fill="hsl(var(--background))" />
    </svg>
  )
}
