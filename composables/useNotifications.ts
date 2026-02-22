import type { M2MDatabase } from '~/types/database.types'

export const useNotifications = () => {
    const supabase = useSupabaseClient<M2MDatabase>() as any
    const { currentUserId } = useDashboard()

    const notifications = useState<any[]>('notifications_list', () => [])
    const unreadCount = useState<number>('notifications_unread_count', () => 0)
    const loading = useState<boolean>('notifications_loading', () => false)

    const fetchNotifications = async () => {
        const userId = currentUserId.value
        if (!userId || userId === 'undefined') return

        loading.value = true
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50)

            if (data) {
                notifications.value = data
                unreadCount.value = data.filter((n: any) => !n.read).length
            }
        } catch (err) {
            console.error('[Notifications] Error fetching:', err)
        } finally {
            loading.value = false
        }
    }

    const markAsRead = async (notificationId: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ read: true } as any)
                .eq('id', notificationId)

            // Update local state
            const index = notifications.value.findIndex(n => n.id === notificationId)
            if (index !== -1 && !notifications.value[index].read) {
                notifications.value[index].read = true
                unreadCount.value = Math.max(0, unreadCount.value - 1)
            }
        } catch (err) {
            console.error('[Notifications] Error marking as read:', err)
        }
    }

    const markAllAsRead = async () => {
        const userId = currentUserId.value
        if (!userId) return

        try {
            await supabase
                .from('notifications')
                .update({ read: true } as any)
                .eq('user_id', userId)
                .eq('read', false)

            notifications.value.forEach(n => n.read = true)
            unreadCount.value = 0
        } catch (err) {
            console.error('[Notifications] Error marking all as read:', err)
        }
    }

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    }
}
