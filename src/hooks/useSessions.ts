import { useState, useEffect, useCallback } from 'react'
import { getSupabase, Session, SessionInsert } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UseSessions {
    sessions: Session[]
    isLoading: boolean
    error: string | null
    saveSession: (sessionData: Omit<SessionInsert, 'user_id'>) => Promise<Session | null>
    updateSessionName: (sessionId: string, name: string) => Promise<boolean>
    deleteSession: (sessionId: string) => Promise<boolean>
    refreshSessions: () => Promise<void>
    getNextSessionNumber: () => number
}

export function useSessions(user: User | null): UseSessions {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch sessions from Supabase
    const fetchSessions = useCallback(async () => {
        if (!user) {
            setSessions([])
            setIsLoading(false)
            return
        }

        const supabase = getSupabase()
        if (!supabase) {
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (fetchError) {
                console.error('Error fetching sessions:', fetchError)
                setError(fetchError.message)
                return
            }

            setSessions(data || [])
        } catch (err) {
            console.error('Error fetching sessions:', err)
            setError('Failed to fetch sessions')
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // Fetch sessions when user changes
    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    // Real-time subscription for session updates
    useEffect(() => {
        if (!user) return

        const supabase = getSupabase()
        if (!supabase) return

        const channel = supabase
            .channel('sessions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sessions',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setSessions((prev) => [payload.new as Session, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setSessions((prev) =>
                            prev.map((s) => (s.id === (payload.new as Session).id ? (payload.new as Session) : s))
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setSessions((prev) => prev.filter((s) => s.id !== (payload.old as Session).id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    // Save a new session
    const saveSession = useCallback(
        async (sessionData: Omit<SessionInsert, 'user_id'>): Promise<Session | null> => {
            if (!user) {
                setError('User not authenticated')
                return null
            }

            const supabase = getSupabase()
            if (!supabase) {
                setError('Database service unavailable')
                return null
            }

            try {
                setError(null)

                const { data, error: insertError } = await supabase
                    .from('sessions')
                    .insert({
                        ...sessionData,
                        user_id: user.id,
                        completed_at: new Date().toISOString(),
                    })
                    .select()
                    .single()

                if (insertError) {
                    console.error('Error saving session:', insertError)
                    setError(insertError.message)
                    return null
                }

                // Immediately update state with the new session (don't wait for real-time subscription)
                if (data) {
                    setSessions((prev) => {
                        // Check if session already exists (avoid duplicates from real-time subscription)
                        const exists = prev.some((s) => s.id === data.id)
                        if (exists) return prev
                        return [data, ...prev]
                    })
                }

                return data
            } catch (err) {
                console.error('Error saving session:', err)
                setError('Failed to save session')
                return null
            }
        },
        [user]
    )

    // Update session name
    const updateSessionName = useCallback(
        async (sessionId: string, name: string): Promise<boolean> => {
            if (!user) {
                setError('User not authenticated')
                return false
            }

            const supabase = getSupabase()
            if (!supabase) {
                setError('Database service unavailable')
                return false
            }

            try {
                setError(null)

                const { error: updateError } = await supabase
                    .from('sessions')
                    .update({ session_name: name })
                    .eq('id', sessionId)
                    .eq('user_id', user.id)

                if (updateError) {
                    console.error('Error updating session name:', updateError)
                    setError(updateError.message)
                    return false
                }

                return true
            } catch (err) {
                console.error('Error updating session name:', err)
                setError('Failed to update session name')
                return false
            }
        },
        [user]
    )

    // Delete a session
    const deleteSession = useCallback(
        async (sessionId: string): Promise<boolean> => {
            if (!user) {
                setError('User not authenticated')
                return false
            }

            const supabase = getSupabase()
            if (!supabase) {
                setError('Database service unavailable')
                return false
            }

            try {
                setError(null)

                const { error: deleteError } = await supabase
                    .from('sessions')
                    .delete()
                    .eq('id', sessionId)
                    .eq('user_id', user.id)

                if (deleteError) {
                    console.error('Error deleting session:', deleteError)
                    setError(deleteError.message)
                    return false
                }

                return true
            } catch (err) {
                console.error('Error deleting session:', err)
                setError('Failed to delete session')
                return false
            }
        },
        [user]
    )

    // Get next session number
    const getNextSessionNumber = useCallback((): number => {
        if (sessions.length === 0) return 1
        const maxNumber = Math.max(...sessions.map((s) => s.session_number))
        return maxNumber + 1
    }, [sessions])

    // Refresh sessions
    const refreshSessions = useCallback(async () => {
        await fetchSessions()
    }, [fetchSessions])

    return {
        sessions,
        isLoading,
        error,
        saveSession,
        updateSessionName,
        deleteSession,
        refreshSessions,
        getNextSessionNumber,
    }
}
