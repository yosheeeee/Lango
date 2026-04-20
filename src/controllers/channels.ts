export const CH = {
  project: {
    getFileTree: 'project:getFileTree',
    stopWatcher: 'project:stopWatcher',
    getLocaleFolders: 'project:getLocaleFolders',
    createNamespace: 'project:createNamespace',
    fixOrphanNamespace: 'project:fixOrphanNamespace',
    deleteNamespace: 'project:deleteNamespace',
    deleteFolder: 'project:deleteFolder',
    createFolder: 'project:createFolder',
    createLocale: 'project:createLocale',
    deleteLocale: 'project:deleteLocale',
    deleteLocalizationKey: 'project:deleteLocalizationKey',
    renameLocalizationKey: 'project:renameLocalizationKey',
    getKeyTranslations: 'project:getKeyTranslations',
    updateLocalizationValue: 'project:updateLocalizationValue',
    batchUpdateLocalizationValues: 'project:batchUpdateLocalizationValues',
    getNamespaceContent: 'project:getNamespaceContent',
    getAllNamespacesContent: 'project:getAllNamespacesContent',
    getNamespaceOrphanKeys: 'project:getNamespaceOrphanKeys',
    fixOrphanKey: 'project:fixOrphanKey',
    addLocalizationKey: 'project:addLocalizationKey',
    search: 'project:search',
    getAnalytics: 'project:getAnalytics'
  },
  session: {
    getSessions: 'session:getSessions',
    addSession: 'session:addSession',
    setCurrentSession: 'session:setCurrentSession',
    removeCurrentSession: 'session:removeCurrentSession',
    getCurrentSession: 'session:getCurrentSession',
    openProjectDialog: 'session:openProjectDialog'
  },
  currentLanguage: {
    get: 'currentLanguage:get',
    set: 'currentLanguage:set'
  }
} as const
