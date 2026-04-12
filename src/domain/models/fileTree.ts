export type FileTreeItem = {
  name: string
  link: string
  locales: string[]
  isOrphan?: boolean
}

export type FileTreeGroup = {
  name: string
  nestedItems: (FileTreeGroup | FileTreeItem)[]
  isOrphan?: boolean
}

export type FileTreeData = {
  root: FileTreeGroup
  locales: string[]
}
