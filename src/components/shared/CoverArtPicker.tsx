import { ImagePlus } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface CoverArtPickerProps {
  coverArtUrl?: string
  label: string
  onChange: (coverArtUrl: string | undefined) => void
}

export function CoverArtPicker({ coverArtUrl, label, onChange }: CoverArtPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <button
        aria-label={`${label} cover art area`}
        className={cn(
          'flex h-32 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-zinc-700 bg-zinc-900/50',
          coverArtUrl ? 'border-solid' : undefined,
        )}
        data-testid="cover-art-picker"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {coverArtUrl ? (
          <img alt="" className="h-full w-full object-cover" src={coverArtUrl} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <ImagePlus aria-hidden="true" className="h-6 w-6" />
            <span className="text-sm">Upload cover art</span>
          </div>
        )}
      </button>
      <input
        accept="image/*"
        aria-label={`Upload ${label} cover art`}
        className="sr-only"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
    </div>
  )
}
