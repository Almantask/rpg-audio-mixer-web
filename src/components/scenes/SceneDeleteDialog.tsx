import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SceneDeleteDialogProps {
  open: boolean
  sceneName: string
  sessionLinkCount: number
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function SceneDeleteDialog({
  open,
  sceneName,
  sessionLinkCount,
  onOpenChange,
  onConfirm,
}: SceneDeleteDialogProps) {
  const requiresWarning = sessionLinkCount > 0

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {requiresWarning ? 'Delete linked scene?' : `Delete ${sceneName}?`}
          </AlertDialogTitle>
          {requiresWarning ? (
            <AlertDialogDescription>
              This scene is linked to {sessionLinkCount}{' '}
              {sessionLinkCount === 1 ? 'session' : 'sessions'}. It will be unlinked from those
              sessions and moved to Trash.
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface UnlinkSceneDialogProps {
  open: boolean
  sceneName: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function UnlinkSceneDialog({
  open,
  sceneName,
  onOpenChange,
  onConfirm,
}: UnlinkSceneDialogProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlink {sceneName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the scene from this session only. The global scene will remain available in
            Scenes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Unlink</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
