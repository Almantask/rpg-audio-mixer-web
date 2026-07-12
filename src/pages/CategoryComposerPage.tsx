import { useParams } from 'react-router-dom'
import { CategoryComposer } from '@/components/library/CategoryComposer'

export function CategoryComposerPage() {
  const { categoryId } = useParams<{ categoryId: string }>()

  if (!categoryId) {
    return null
  }

  return <CategoryComposer categoryId={categoryId} />
}
