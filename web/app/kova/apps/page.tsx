'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useContext } from 'use-context-selector'

import s from './list.module.css'
import cn from '@/utils/classnames'
import ExploreContext from '@/context/explore-context'
import AppCard from '@/app/kova/components/app-card'

type AppsProps = {
  onSuccess?: () => void
}

export enum PageType {
  EXPLORE = 'explore',
  CREATE = 'create',
}

const Apps = ({
  onSuccess,
}: AppsProps) => {
  const { t } = useTranslation()
  const { installedApps } = useContext(ExploreContext)

  const router = useRouter()

  return (
    <div className={cn(
      'flex h-full flex-col border-l-[0.5px] border-divider-regular',
    )}>
      <div className={cn(
        'relative mt-4 flex flex-1 shrink-0 grow flex-col overflow-auto pb-6',
      )}>
        <nav
          className={cn(
            s.appList,
            'grid shrink-0 content-start gap-4 px-6 sm:px-12',
          )}>
          {installedApps.map((app) => {
            const url = `/kova/apps/${app.id}`
            return <AppCard
              key={app.id}
              isExplore
              appBasicInfo={app.app}
              canCreate
              onCreate={() => {
                router.push(url)
              }}
            />
          })}
        </nav>
      </div>
    </div>
  )
}

export default React.memo(Apps)
