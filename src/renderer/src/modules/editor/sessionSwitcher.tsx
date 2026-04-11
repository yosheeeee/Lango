import { projectColors } from '@renderer/utils/projectColors'
import { useSessionStore } from '@renderer/stores/sessionStore'
import { cn } from '@renderer/utils/cn'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/dropdown'
import { Button } from '@renderer/components/button'
import { ChevronDown, Plus } from 'lucide-react'
import { AddNewProjectModal } from '../addNewProjectModal'
import { Session } from 'src/domain/models/session'

export default function SessionSwitcher() {
  const { currentSession, sessions, setSession, setSessions } = useSessionStore()
  const onAdded = (s: Session) => {
    setSessions((prev) => [s, ...prev])
    setSession(s)
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              '!py-0.5 !px-1.5 rounded-md text-sm cursor-pointer flex items-center gap-2',
              currentSession ? projectColors[currentSession.color]?.base : undefined,
              currentSession ? projectColors[currentSession.color]?.hover : undefined
            )}
          >
            {currentSession?.name}
            <ChevronDown className="size-4 group-data-[state=open]:rotate-180 transition-transform" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {sessions?.map((s) => (
            <DropdownMenuItem
              key={s.id}
              onClick={() => setSession(s)}
              className={
                (cn(projectColors[s.color].base, projectColors[s.color].hover), 'cursor-pointer')
              }
            >
              {s.name}
            </DropdownMenuItem>
          ))}
          <AddNewProjectModal onAdded={onAdded}>
            <Button size={'sm'}>
              <Plus /> Add new project
            </Button>
          </AddNewProjectModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
