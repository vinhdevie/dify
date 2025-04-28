'use client'
import { useState } from 'react'
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { RiCloseLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import s from '@/app/components/header/account-setting/members-page/invite-modal/index.module.css'
import cn from '@/utils/classnames'
import Modal from '@/app/components/base/modal'
import Button from '@/app/components/base/button'
import useSWR from 'swr'
import { fetchMembers } from '@/service/common'
import Avatar from '@/app/components/base/avatar'
import type { User } from '@/models/user'

type AddUserModalProps = {
    open: boolean;
    currentUserIdList: string[];
    onCancel: () => void;
    onAdd: (users: User[], permission: string) => void;
}

const AddUserModal = ({ open, currentUserIdList, onCancel, onAdd }: AddUserModalProps) => {
    const { t } = useTranslation()
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])
    // FIX: Temporary disabled other permissions, default to normal
    // const [role, setRole] = useState<string>('normal')
    const [query, setQuery] = useState('')

    const { data } = useSWR(
        {
            url: '/workspaces/current/members',
            params: {},
        },
        fetchMembers,
    )

    const accounts = data?.accounts?.filter(user => !currentUserIdList.includes(user.id)) || []

    const filteredUsers = query === ''
        ? accounts
        : accounts.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase())
            || user.email.toLowerCase().includes(query.toLowerCase()),
        )

    const handleAdd = () => {
        // onAdd(selectedUsers, role)
        onAdd(selectedUsers, 'normal')
        setSelectedUsers([])
    }

    const handleCancel = () => {
        setSelectedUsers([])
        onCancel()
    }

    return (
        <div className={cn(s.wrap)}>
            <Modal overflowVisible isShow={open} onClose={handleCancel} className={cn(s.modal)}>
                <div className='mb-2 flex justify-between'>
                    <div className='text-xl font-semibold text-text-primary'>{t('common.members.addUserToApp', 'Add Users to App')}</div>
                    <RiCloseLine className='h-4 w-4 cursor-pointer text-text-tertiary' onClick={handleCancel} />
                </div>
                <div className='mb-3 text-[13px] text-text-tertiary'>{t('common.members.selectUserTip', 'Select users to add to this app')}</div>
                <div className="mb-8">
                    <div className="mb-2 text-sm font-medium text-text-primary">{t('common.members.selectUsers', 'Select users')}</div>
                    <Combobox value={selectedUsers} onChange={setSelectedUsers} multiple immediate>
                        <div className="relative">
                            <div className="flex min-h-[38px] w-full flex-wrap items-center gap-1 rounded-lg border border-components-input-border-active bg-components-input-bg-normal px-2 py-1 text-sm text-text-primary focus-within:ring-2 focus-within:ring-blue-500">
                                {selectedUsers.map(user => (
                                    <span key={user.id} className="inline-flex items-center rounded bg-components-button-secondary-bg px-2 py-1 text-sm text-text-primary">
                                        {user.name}
                                        <button
                                            type="button"
                                            className="ml-1 text-gray-400 hover:text-red-400"
                                            onClick={(e) => {
                                                e.stopPropagation() // Prevent combobox dropdown from opening
                                                setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
                                            }}
                                        >
                                            <RiCloseLine className="h-4 w-4 cursor-pointer text-text-tertiary" />
                                        </button>
                                    </span>
                                ))}
                                <ComboboxInput
                                    className="grow bg-transparent px-1 py-1 text-sm outline-none"
                                    displayValue={() => ''}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder={selectedUsers.length === 0 ? t('common.members.searchUser', 'Search users...') : ''}
                                />
                            </div>
                            <ComboboxOptions className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                {filteredUsers.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-400">
                                        {t('common.members.noUserFound', 'No user found')}
                                    </div>
                                ) : (
                                    filteredUsers.map(user => (
                                        <ComboboxOption
                                            key={user.id}
                                            value={user}
                                            className={({ selected, focus }) =>
                                                `cursor-pointer select-none relative pl-4 pr-4 ${selected ? 'bg-blue-500' : focus ? 'bg-blue-50' : ''}`
                                            }
                                        >
                                            {() => (
                                                <div className='flex border-b border-divider-subtle'>
                                                    <div className='flex grow items-center px-3 py-2'>
                                                        <Avatar avatar={user.avatar_url} size={24} className='mr-2' name={user.name} />
                                                        <div>
                                                            <div className='system-sm-medium text-text-secondary'>{user.name}</div>
                                                            <div className='system-xs-regular text-text-tertiary'>{user.email}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </ComboboxOption>
                                    ))
                                )}
                            </ComboboxOptions>
                        </div>
                    </Combobox>

                </div>
                {/* <div className="mb-6">
                    <RoleSelector value={role} onChange={setRole} />
                </div> */}
                <Button
                    tabIndex={0}
                    className='mt-4 w-full'
                    onClick={handleAdd}
                    disabled={selectedUsers.length === 0}
                    variant='primary'
                >
                    {t('common.members.add', 'Add')}
                </Button>
            </Modal>
        </div>
    )
}

export default AddUserModal
