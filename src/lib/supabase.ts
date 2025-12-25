import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.GATSBY_SUPABASE_URL
const supabaseAnonKey = process.env.GATSBY_SUPABASE_ANON_KEY

// Lazy initialization to avoid build-time errors when env vars are missing
let supabaseInstance: SupabaseClient | null = null

const getSupabaseClient = (): SupabaseClient | null => {
    if (supabaseInstance) return supabaseInstance

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.')
        return null
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    return supabaseInstance
}

// For backward compatibility - will be null during SSR/build if env vars missing
export const supabase = (typeof window !== 'undefined') ? getSupabaseClient() : null

// Export getter for components that need to check availability
export const getSupabase = getSupabaseClient

// Type definitions for database
export interface Database {
    public: {
        Tables: {
            sessions: {
                Row: {
                    id: string
                    user_id: string
                    session_number: number
                    session_name: string | null
                    active_time: number
                    pause_time: number
                    extra_time: number
                    total_time: number
                    started_at: string
                    completed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    session_number: number
                    session_name?: string | null
                    active_time?: number
                    pause_time?: number
                    extra_time?: number
                    total_time?: number
                    started_at?: string
                    completed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    session_number?: number
                    session_name?: string | null
                    active_time?: number
                    pause_time?: number
                    extra_time?: number
                    total_time?: number
                    started_at?: string
                    completed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}

export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']
