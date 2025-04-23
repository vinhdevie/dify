import type { FC } from 'react'
import React from 'react'
import Main from '@/app/components/explore/installed-app'
import type { IInstalledAppProps } from '@/app/(commonLayout)/explore/installed/[appId]/page'

const InstalledApp: FC<IInstalledAppProps> = async ({ params }) => {
  return (
    <>
      <Main id={(await params).appId} />
    </>
  )
}

export default React.memo(InstalledApp)
