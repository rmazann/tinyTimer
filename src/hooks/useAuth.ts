import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
    isAuthenticated: boolean
    user: User | null
    email: string | null
    isLoading: boolean
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        email: null,
        isLoading: true,
    })
    const [pendingEmail, setPendingEmail] = useState<string | null>(null)
    const [codeSent, setCodeSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Check for existing session on mount and listen for auth changes
    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const supabase = getSupabase()
            if (!supabase) {
                setAuthState(prev => ({ ...prev, isLoading: false }))
                return
            }

            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user) {
                    setAuthState({
                        isAuthenticated: true,
                        user: session.user,
                        email: session.user.email || null,
                        isLoading: false,
                    })
                } else {
                    setAuthState(prev => ({ ...prev, isLoading: false }))
                }
            } catch (err) {
                console.error('Error getting session:', err)
                setAuthState(prev => ({ ...prev, isLoading: false }))
            }
        }

        getInitialSession()

        // Listen for auth state changes
        const supabase = getSupabase()
        if (!supabase) return

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setAuthState({
                        isAuthenticated: true,
                        user: session.user,
                        email: session.user.email || null,
                        isLoading: false,
                    })
                } else {
                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        email: null,
                        isLoading: false,
                    })
                }

                // Reset OTP state on successful login
                if (event === 'SIGNED_IN') {
                    setPendingEmail(null)
                    setCodeSent(false)
                    setError(null)
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    // Send OTP code to email (Magic Link)
    const sendCode = useCallback(async (email: string): Promise<boolean> => {
        setError(null)

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            return false
        }

        const supabase = getSupabase()
        if (!supabase) {
            setError('Authentication service unavailable')
            return false
        }

        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    // This will send a 6-digit code instead of magic link
                    shouldCreateUser: true,
                },
            })

            if (otpError) {
                console.error('OTP Error:', otpError)
                setError(otpError.message)
                return false
            }

            setPendingEmail(email)
            setCodeSent(true)

            return true
        } catch (err) {
            console.error('Error sending OTP:', err)
            setError('Failed to send verification code')
            return false
        }
    }, [])

    // Verify the OTP code
    const verifyCode = useCallback(async (code: string): Promise<boolean> => {
        setError(null)

        if (!pendingEmail) {
            setError('Please enter your email address first')
            return false
        }

        const supabase = getSupabase()
        if (!supabase) {
            setError('Authentication service unavailable')
            return false
        }

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: pendingEmail,
                token: code,
                type: 'email',
            })

            if (verifyError) {
                console.error('Verify Error:', verifyError)
                setError('Token has expired or is invalid.')
                return false
            }

            // Auth state will be updated by the onAuthStateChange listener
            return true
        } catch (err) {
            console.error('Error verifying OTP:', err)
            setError('Failed to verify code')
            return false
        }
    }, [pendingEmail])

    // Sign in with Google
    const signInWithGoogle = useCallback(async (): Promise<boolean> => {
        setError(null)

        const supabase = getSupabase()
        if (!supabase) {
            setError('Authentication service unavailable')
            return false
        }

        try {
            const { error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
                },
            })

            if (googleError) {
                console.error('Google Sign In Error:', googleError)
                setError(googleError.message)
                return false
            }

            return true
        } catch (err) {
            console.error('Error signing in with Google:', err)
            setError('Failed to sign in with Google')
            return false
        }
    }, [])

    // Logout
    const logout = useCallback(async () => {
        const supabase = getSupabase()
        if (!supabase) return

        try {
            const { error: signOutError } = await supabase.auth.signOut()

            if (signOutError) {
                console.error('Sign out error:', signOutError)
            }
        } catch (err) {
            console.error('Error signing out:', err)
        }

        // Reset all state
        setAuthState({
            isAuthenticated: false,
            user: null,
            email: null,
            isLoading: false,
        })
        setPendingEmail(null)
        setCodeSent(false)
        setError(null)
    }, [])

    // Reset to email input
    const resetToEmail = useCallback(() => {
        setPendingEmail(null)
        setCodeSent(false)
        setError(null)
    }, [])

    return {
        ...authState,
        pendingEmail,
        codeSent,
        error,
        sendCode,
        verifyCode,
        signInWithGoogle,
        logout,
        resetToEmail,
    }
}
