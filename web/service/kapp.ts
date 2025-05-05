import type { CommonResponse, Member } from '@/models/common'
import { del, get, patch, post } from './base'
import type { Fetcher } from 'swr'

export type MemberWithKappPermission = Member & {
    kapp_permission: 'owner' | 'admin' | 'editor' | 'normal'
}

export const fetchKovaInstalledAppList = (app_id?: string | null) => {
    return get(`/kova/installed-apps${app_id ? `?app_id=${app_id}` : ''}`)
}

export const fetchAppMembers: Fetcher<{ accounts: MemberWithKappPermission[] | null }, { app_id: string; params: Record<string, any> }> = ({ app_id, params }) => {
    return get<{ accounts: MemberWithKappPermission[] | null }>(`/kova/app/${app_id}/members`, { params })
}

export const addAppMembers: Fetcher<CommonResponse, { app_id: string; account_id_list: string[]; permission: string }> = ({ app_id, account_id_list, permission }) => {
    return post<CommonResponse>(`/kova/app/${app_id}/members`, { body: { account_id_list, permission } })
}

export const removeAppMember: Fetcher<CommonResponse, { app_id: string; account_id: string }> = ({ app_id, account_id }) => {
    return del<CommonResponse>(`/kova/app/${app_id}/members`, { body: { account_id } })
}

export const updateAppMemberPermission: Fetcher<CommonResponse, { app_id: string; account_id: string; permission: string }> = ({ app_id, account_id, permission }) => {
    return patch<CommonResponse>(`/kova/app/${app_id}/members/${account_id}/update-permission`, { body: { permission } })
}
