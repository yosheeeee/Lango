export type FileTreeItem = {
  name: string
  link: string
  isOrphan?: boolean
}

export type FileTreeGroup = {
  name: string
  nestedItems: (FileTreeGroup | FileTreeItem)[]
  isOrphan?: boolean
}
