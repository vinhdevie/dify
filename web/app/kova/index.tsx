'use client'
import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ExploreContext from '@/context/explore-context'
import { fetchKovaInstalledAppList as doFetchInstalledAppList } from '@/service/explore'
import type { InstalledApp } from '@/models/explore'

export type IExploreProps = {
  children: React.ReactNode
}

const Explore: FC<IExploreProps> = ({
  children,
}) => {
  const { t } = useTranslation()
  const [controlUpdateInstalledApps, setControlUpdateInstalledApps] = useState(0)
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([])

  const fetchInstalledAppList = async () => {
    const { installed_apps }: any = await doFetchInstalledAppList()
    setInstalledApps(installed_apps)
  }

  useEffect(() => {
    document.title = `${t('explore.title')} - Dify`
    fetchInstalledAppList()
  }, [])

  return (
    <div className='flex h-full overflow-hidden border-t border-divider-regular bg-background-body'>
      <ExploreContext.Provider
        value={
          {
            controlUpdateInstalledApps,
            setControlUpdateInstalledApps,
            hasEditPermission: false,
            installedApps,
            setInstalledApps,
          }
        }
      >
        <div className='w-0 grow'>
          {children}
        </div>
      </ExploreContext.Provider>
    </div>
  )
}
export default React.memo(Explore)
