import 'i18next'
import addNewProject from '../locales/ru/addNewProject.json'
import cheetSheet from '../locales/ru/cheetSheet.json'
import common from '../locales/ru/common.json'
import editor from '../locales/ru/editor.json'
import footer from '../locales/ru/footer.json'
import headerMenu from '../locales/ru/headerMenu.json'
import master from '../locales/ru/master.json'
import projectSearch from '../locales/ru/projectSearch.json'
import projectSelect from '../locales/ru/projectSelect.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'projectSelect'
    resources: {
      addNewProject: typeof addNewProject
      cheetSheet: typeof cheetSheet
      common: typeof common
      editor: typeof editor
      footer: typeof footer
      headerMenu: typeof headerMenu
      master: typeof master
      projectSearch: typeof projectSearch
      projectSelect: typeof projectSelect
    }
  }
}
