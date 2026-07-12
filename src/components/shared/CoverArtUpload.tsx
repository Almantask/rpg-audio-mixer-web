import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface CoverArtUploadProps {
  value?: string
  onChange: (dataUrl: string) => void
  label?: string
  className?: string
}

export function CoverArtUpload({
  value,
  onChange,
  label = 'Cover art',
  className,
}: CoverArtUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={className}>
      <button
        type="button"
        aria-label={label}
        data-testid="cover-art-area"
        className={cn(
          'flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-dashed border-gold/40 bg-charcoal text-xs text-muted',
          value && 'border-solid',
        )}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          'Cover'
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={`${label} upload`}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            handleFile(file)
          }
        }}
      />
    </div>
  )
}
