import { useForm } from 'react-hook-form'
import { Slot } from '@radix-ui/react-slot'
import { FC, PropsWithChildren, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@renderer/components/dialog'
import { Button } from '@renderer/components/button'
import { Check, X } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, Input } from '@renderer/components/form'
import { PathInput } from '@renderer/components/inputs/PathInput'
import { ColorSelectInput } from '@renderer/components/inputs/ColorSelectInput'

export const AddNewProjectModal: FC<PropsWithChildren & { onAdded?: VoidFunction }> = ({
  children,
  onAdded
}) => {
  const [open, setOpen] = useState(false)
  const form = useForm({
    values: {
      path: '',
      name: '',
      color: ''
    }
  })
  const { setValue, handleSubmit, reset } = form

  async function onClick(): Promise<void> {
    const path = await window.api.session.openSelectFolderDialog()
    if (path != null) {
      setValue('path', path)
      setOpen(true)
    }
  }

  const onSaveProject = handleSubmit(async () => {
    console.log(data)
    window.api.session.addSession({})
    // onAdded?.()
  })

  const cancelAdd: VoidFunction = () => {
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open}>
      <Slot onClick={onClick}>{children}</Slot>
      <DialogContent>
        <DialogTitle>Add new project</DialogTitle>
        <Form {...form} className="grid grid-cols-[repeat(2,300px)] gap-4" onSubmit={onSaveProject}>
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <ColorSelectInput {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="path"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Project folder</FormLabel>
                <FormControl>
                  <PathInput {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="col-span-full flex  items-center justify-end w-full gap-3">
            <Button type="submit" weight={'semibold'} color="cyan">
              <Check />
              Submit
            </Button>
            <Button onClick={cancelAdd}>
              <X />
              Cancel
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
