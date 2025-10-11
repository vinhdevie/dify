'use client'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useContext } from 'use-context-selector'
import { RiUserAddLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import type { MemberWithKappPermission } from '@/service/kapp'
import { addAppMembers, fetchAppMembers } from '@/service/kapp'
import I18n from '@/context/i18n'
import { useAppContext } from '@/context/app-context'
import Avatar from '@/app/components/base/avatar'
import { useProviderContext } from '@/context/provider-context'
import { Plan } from '@/app/components/billing/type'
import Button from '@/app/components/base/button'
import { NUM_INFINITE } from '@/app/components/billing/config'
import { LanguagesSupported } from '@/i18n-config/language'
import cn from '@/utils/classnames'
import Loading from '@/app/components/base/loading'
import AddUserModal from './add-modal'
import { useStore as useAppStore } from '@/app/components/app/store'
import type { User } from '@/models/user'
import UpdateOperation from './update-operation'
import AppIcon from '@/app/components/base/app-icon'

dayjs.extend(relativeTime)

const AppUserConfig = () => {
    const { t } = useTranslation()
    const PermissionMap = {
        owner: t('common.members.owner'),
        admin: t('common.members.admin'),
        editor: t('common.members.editor'),
        normal: t('common.members.normal'),
    }
    const appDetail = useAppStore(state => state.appDetail)
    const { locale } = useContext(I18n)

    const { userProfile, currentWorkspace, isCurrentWorkspaceOwner, isCurrentWorkspaceManager, systemFeatures } = useAppContext()
    const { mutate: fetchMembersList, isLoading: memberLoading } = useSWR(
        {
            app_id: appDetail?.id,
            params: {},
        },
        fetchAppMembers,
    )

    const [addUserModalVisible, setAddUserModalVisible] = useState(false)
    const [accounts, setAccounts] = useState<MemberWithKappPermission[]>([])

    // Helper to fetch and update accounts
    const getAccounts = async () => {
        const result = await fetchMembersList()
        setAccounts(result?.accounts || [])
    }

    useEffect(() => {
        getAccounts()
    }, [appDetail?.id])

    const { plan, enableBilling } = useProviderContext()
    const isNotUnlimitedMemberPlan = enableBilling && plan.type !== Plan.team && plan.type !== Plan.enterprise
    const isMemberFull = enableBilling && isNotUnlimitedMemberPlan && accounts.length >= plan.total.teamMembers

    if (!appDetail || memberLoading) {
        return (
            <div className='flex h-full items-center justify-center bg-background-body'>
                <Loading />
            </div>
        )
    }

    const handleAddUser = async (users: User[], permission: string) => {
        const res = await addAppMembers({
            app_id: appDetail?.id,
            account_id_list: users.map(user => user.id),
            permission,
        })
        if (res.result === 'success') {
            setAddUserModalVisible(false)
            await getAccounts()
        }
    }

    return (
        <>
            <div className="relative flex grow flex-col pt-14">
                <div className="bg-default-subtle absolute left-0 top-0 flex h-14 w-full items-center justify-between px-6">
                    <div className="system-xl-semibold text-text-primary">{t('common.appMenus.user')}</div>
                </div>
            </div>
            <div className='flex flex-col'>
                <div className='mb-4 flex items-center gap-3 rounded-xl border-l-[0.5px] border-t-[0.5px] border-divider-subtle bg-gradient-to-r from-background-gradient-bg-fill-chat-bg-2 to-background-gradient-bg-fill-chat-bg-1 p-3 pr-5'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl text-[20px]'>
                        {appDetail && appDetail.icon && appDetail.icon_background && (
                            <AppIcon icon={appDetail.icon} background={appDetail.icon_background} />
                        )}
                    </div>
                    <div className='grow'>
                        <div className='system-xs-medium mt-1 text-text-tertiary'>
                            {enableBilling && isNotUnlimitedMemberPlan
                                ? (
                                    <div className='flex space-x-1'>
                                        <div>{t('billing.plansCommon.member')}{locale !== LanguagesSupported[1] && accounts.length > 1 && 's'}</div>
                                        <div className=''>{accounts.length}</div>
                                        <div>/</div>
                                        <div>{plan.total.teamMembers === NUM_INFINITE ? t('billing.plansCommon.unlimited') : plan.total.teamMembers}</div>
                                    </div>
                                )
                                : (
                                    <div className='flex space-x-1'>
                                        <div>{accounts.length}</div>
                                        <div>{t('billing.plansCommon.memberAfter')}{locale !== LanguagesSupported[1] && accounts.length > 1 && 's'}</div>
                                    </div>
                                )}
                        </div>
                    </div>
                    <Button variant='primary' className={cn('shrink-0')} onClick={() => setAddUserModalVisible(true)}>
                        <RiUserAddLine className='mr-1 h-4 w-4' />
                        {t('common.members.invite')}
                    </Button>
                </div>
                <div className='overflow-visible lg:overflow-visible'>
                    <div className='flex min-w-[480px] items-center border-b border-divider-regular py-[7px]'>
                        <div className='system-xs-medium-uppercase grow px-3 text-text-tertiary'>{t('common.members.name')}</div>
                        <div className='system-xs-medium-uppercase w-[104px] shrink-0 text-text-tertiary'>{t('common.members.lastActive')}</div>
                        <div className='system-xs-medium-uppercase w-[96px] shrink-0 px-3 text-text-tertiary'>{t('common.members.role')}</div>
                    </div>
                    <div className='relative min-w-[480px]'>
                        {
                            accounts.map(account => (
                                <div key={account.id} className='flex border-b border-divider-subtle'>
                                    <div className='flex grow items-center px-3 py-2'>
                                        <Avatar avatar={account.avatar_url} size={24} className='mr-2' name={account.name} />
                                        <div className=''>
                                            <div className='system-sm-medium text-text-secondary'>
                                                {account.name}
                                                {userProfile.email === account.email && <span className='system-xs-regular text-text-tertiary'>{t('common.members.you')}</span>}
                                            </div>
                                            <div className='system-xs-regular text-text-tertiary'>{account.email}</div>
                                        </div>
                                    </div>
                                    <div className='system-sm-regular flex w-[104px] shrink-0 items-center py-2 text-text-secondary'>{dayjs(Number((account.last_active_at || account.created_at)) * 1000).locale(locale === 'zh-Hans' ? 'zh-cn' : 'en').fromNow()}</div>
                                    <div className='flex w-[96px] shrink-0 items-center'>
                                        {
                                            isCurrentWorkspaceOwner && account.kapp_permission !== 'owner'
                                                ? <UpdateOperation app_id={appDetail?.id} member={account} operatorPermission={currentWorkspace.role} onOperate={getAccounts} />
                                                : <div className='system-sm-regular px-3 text-text-secondary'>{PermissionMap[account.kapp_permission] || PermissionMap.normal}</div>
                                        }
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            {
                addUserModalVisible && (
                    <AddUserModal
                        open={addUserModalVisible}
                        currentUserIdList={accounts.map(account => account.id)}
                        onCancel={() => setAddUserModalVisible(false)}
                        onAdd={(users, permission) => handleAddUser(users, permission)}
                    />
                )
            }
        </>
    )
}

export default AppUserConfig
