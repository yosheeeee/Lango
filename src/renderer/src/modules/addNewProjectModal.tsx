import { useForm } from 'react-hook-form'
import { Slot } from '@radix-ui/react-slot'
import { FC, PropsWithChildren, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@renderer/components/dialog'
import { Button } from '@renderer/components/button'
import { Check, X } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from '@renderer/components/form'
import { PathInput } from '@renderer/components/inputs/PathInput'
import { ColorSelectInput } from '@renderer/components/inputs/ColorSelectInput'
import { Session } from 'src/domain/models/session'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useTranslation } from 'react-i18next'

export const AddNewProjectModal: FC<
  PropsWithChildren & { onAdded?: (session: Session) => void }
> = ({ children, onAdded }) => {
  const { t } = useTranslation(['addNewProject', 'common'])
  const [open, setOpen] = useState(false)
  const form = useForm({
    values: {
      path: '',
      name: '',
      color: ''
    },
    resolver: zodResolver(
      z.object({
        path: z.string().min(1, 'Select path'),
        name: z.string().min(1, 'Enter project name'),
        color: z.string().min(1, 'Select color')
      })
    )
  })
  const { setValue, handleSubmit, reset, setError } = form

  async function onClick(): Promise<void> {
    const path = await window.api.session.openSelectFolderDialog()
    if (path != null) {
      setValue('path', path)
      setOpen(true)
    }
  }

  const onSaveProject = handleSubmit(async (data) => {
    const newSession = await window.api.session.addSession(data)
    if ('errors' in newSession) {
      Object.entries(newSession.errors).map(([key, value]) => {
        setError(key, { message: t(`errors.${value}`) })
      })
      return
    }
    onAdded?.(newSession)
    cancelAdd()
  })

  const cancelAdd: VoidFunction = () => {
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open}>
      <Slot onClick={onClick}>{children}</Slot>
      <DialogContent>
        <DialogTitle>{t('title')}</DialogTitle>
        <Form
          {...form}
          className="grid grid-cols-[repeat(2,300px)] gap-4 items-start"
          onSubmit={onSaveProject}
        >
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('color')}</FormLabel>
                <FormControl>
                  <ColorSelectInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="path"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>{t('projectPath')}</FormLabel>
                <FormControl>
                  <PathInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-full flex  items-center justify-end w-full gap-3">
            <Button type="submit" weight={'semibold'} color="cyan">
              <Check />
              {t('common:sumbit')}
            </Button>
            <Button onClick={cancelAdd}>
              <X />
              {t('common:cancel')}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
