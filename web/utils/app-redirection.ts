import type { AppMode } from '@/types/app'

export const getRedirection = (
  isCurrentWorkspaceEditor: boolean,
  app: { id: string, mode: AppMode },
  redirectionFunc: (href: string) => void,
) => {
  if (!isCurrentWorkspaceEditor) {
    redirectionFunc(`/app/${app.id}/overview`)
  }
  else {
    if (app.mode === 'workflow' || app.mode === 'advanced-chat')
      redirectionFunc(`/app/${app.id}/workflow`)
    else
      redirectionFunc(`/app/${app.id}/configuration`)
  }
}

export const getExplore = (
  isCurrentWorkspaceEditor: boolean,
  app: any,
  redirectionFunc: (href: string) => void,
) => {
  redirectionFunc(`/kova/apps/${app.id}`)
}
