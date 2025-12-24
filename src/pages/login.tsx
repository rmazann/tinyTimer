import React, { useState, useEffect } from 'react'
import { navigate } from 'gatsby'
import { useAuth } from '../hooks/useAuth'
import { ContentDivider } from '../components/ContentDivider'
import { MajorBrandLogos } from '../components/MajorBrandLogos'
import { MailCheckIcon } from '../components/MailCheckIcon'
import { OTPInput } from '../components/OTPInput'
import { ErrorWarningIcon } from '../components/ErrorWarningIcon'
import '../styles/global.css'

const LoginPage: React.FC = () => {
    const { isAuthenticated, isLoading, codeSent, error, sendCode, verifyCode, resetToEmail, pendingEmail, signInWithGoogle } = useAuth()
    const [email, setEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, isLoading])

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        await sendCode(email)

        setIsSubmitting(false)
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const success = await verifyCode(otpCode)
        if (success) {
            navigate('/')
        }
        setIsSubmitting(false)
    }

    const handleResendCode = async () => {
        if (pendingEmail) {
            await sendCode(pendingEmail)
            setOtpCode('')
        }
    }

    const handleGoogleLogin = async () => {
        setIsSubmitting(true)
        await signInWithGoogle()
        setIsSubmitting(false)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!codeSent) {
            await handleSendCode(e)
        } else {
            await handleVerifyCode(e)
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-white transition-colors duration-200">
                <div className="animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-white transition-colors duration-200 relative">

            {/* Login Content - Matching Figma Design */}
            <div className="w-full max-w-[392px] px-4">
                <div className="flex flex-col items-center gap-6">
                    {/* Forms */}
                    {!codeSent ? (
                        <>
                            {/* Header with Icon - Only shown on login screen */}
                            <div className="flex flex-col items-center gap-2 w-full">
                                {/* Custom Icon */}
                                <div className="bg-gradient-to-b from-[rgba(113,119,132,0.1)] to-[rgba(113,119,132,0)] p-4 rounded-full">
                                    <div className="bg-white border border-[#e1e4ea] rounded-full shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] w-16 h-16 flex items-center justify-center overflow-hidden">
                                        <img
                                            src="/icon.png"
                                            alt="Logo"
                                            className="w-6 h-6 object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="flex flex-col items-center w-full">
                                    <h1
                                        className="font-medium text-2xl leading-8 text-[#0e121b] text-center w-full"
                                        style={{ fontFamily: "'Inter Display', 'Inter', sans-serif" }}
                                    >
                                        Welcome back
                                    </h1>
                                </div>
                            </div>
                        </>
                    ) : null}

                    {!codeSent ? (
                        <>
                            {/* Social Buttons */}
                            <div className="flex items-start justify-center w-full">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="flex-1 bg-white border border-[#e1e4ea] flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] hover:opacity-90 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-0"
                                >
                                    <MajorBrandLogos className="w-5 h-5 shrink-0" company="Google" />
                                    <span
                                        className="font-medium text-sm leading-5 text-[#0e121b] tracking-[-0.084px]"
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                    >
                                        Continue with Google
                                    </span>
                                </button>
                            </div>

                            {/* Divider */}
                            <ContentDivider className="w-full" type="Text & Line Divider" editText="OR" />
                        </>
                    ) : null}

                    {!codeSent ? (
                        <form onSubmit={handleLogin} className="flex flex-col items-center w-full gap-4">
                            {/* Email Input */}
                            <div className="flex flex-col gap-1 items-start w-full">
                                {/* Label */}
                                <div className="flex items-center gap-0.5 font-medium text-sm leading-5 tracking-[-0.084px] w-full">
                                    <label
                                        htmlFor="email"
                                        className="text-[#0e121b]"
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                    >
                                        Email Address
                                    </label>
                                </div>

                                {/* Input */}
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className={`w-full bg-white border rounded-[10px] shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] px-3 py-2.5 text-sm leading-5 text-[#0e121b] placeholder-[#99a0ae] tracking-[-0.084px] focus:outline-none transition-all duration-150 ${error ? 'border-[#fb3748]' : 'border-[#e1e4ea] focus:border-[#0e121b]'
                                        }`}
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            {error && !codeSent && (
                                <div className="bg-[#ffebec] flex items-center rounded-[8px] w-full" style={{ padding: '12px 8px', gap: '8px' }}>
                                    <ErrorWarningIcon className="w-4 h-4 shrink-0" />
                                    <p className="flex-1 text-xs leading-4 text-[#0e121b]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="w-full border border-[rgba(255,255,255,0.12)] rounded-[10px] shadow-[0px_1px_2px_0px_rgba(27,28,29,0.48),0px_0px_0px_1px_#242628] p-2.5 flex items-center justify-center bg-gradient-to-b from-[rgba(255,255,255,0.16)] to-transparent bg-[#0e121b] hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
                                style={{
                                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(90deg, rgb(14, 18, 27) 0%, rgb(14, 18, 27) 100%)'
                                }}
                            >
                                <span
                                    className="font-medium text-sm leading-5 text-white tracking-[-0.084px]"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Continue
                                </span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode} className="flex flex-col items-center w-full gap-6" style={{ gap: '24px' }}>
                            {/* Header with Mail Icon */}
                            <div className="flex flex-col items-center w-full" style={{ gap: '8px' }}>
                                {/* Custom Icon */}
                                <div className="bg-gradient-to-b from-[rgba(113,119,132,0.1)] to-[rgba(113,119,132,0)] p-4 rounded-full">
                                    <div className="bg-white border border-[#e1e4ea] rounded-full shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] w-16 h-16 flex items-center justify-center overflow-hidden">
                                        <MailCheckIcon className="w-8 h-8" />
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="flex flex-col items-center w-full">
                                    <h1
                                        className="font-medium text-2xl leading-8 text-[#0e121b] text-center w-full"
                                        style={{ fontFamily: "'Inter Display', 'Inter', sans-serif" }}
                                    >
                                        Welcome back
                                    </h1>
                                </div>

                                {/* Email Message */}
                                <p
                                    className="text-base leading-6 text-[#525866] text-center tracking-[-0.176px]"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    We've sent a code to{' '}
                                    <span className="font-medium text-[#0e121b]">
                                        {pendingEmail || email}
                                    </span>
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="w-full flex items-center justify-center py-[1.5px]">
                                <ContentDivider className="w-full" type="Line Spacing" />
                            </div>

                            {/* OTP Input */}
                            <OTPInput
                                length={4}
                                value={otpCode}
                                onChange={setOtpCode}
                                disabled={isSubmitting}
                                hasError={!!error}
                            />

                            {error && (
                                <div className="bg-[#ffebec] flex items-center rounded-[8px] w-full" style={{ padding: '12px 8px', gap: '8px' }}>
                                    <ErrorWarningIcon className="w-4 h-4 shrink-0" />
                                    <p className="flex-1 text-xs leading-4 text-[#0e121b]" style={{ fontFamily: "'Inter', sans-serif" }}>
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Verify Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || otpCode.length !== 4}
                                className="w-full border border-[rgba(255,255,255,0.12)] rounded-[10px] shadow-[0px_1px_2px_0px_rgba(27,28,29,0.48),0px_0px_0px_1px_#242628] p-2.5 flex items-center justify-center gap-1 bg-gradient-to-b from-[rgba(255,255,255,0.16)] to-transparent bg-[#0e121b] hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
                                style={{
                                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(90deg, rgb(14, 18, 27) 0%, rgb(14, 18, 27) 100%)'
                                }}
                            >
                                <span
                                    className="font-medium text-sm leading-5 text-white tracking-[-0.084px]"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Verify
                                </span>
                            </button>

                            {/* Supporting Content */}
                            <div className="flex items-center justify-center w-full" style={{ gap: '6px' }}>
                                <p
                                    className="text-sm leading-5 text-[#525866] text-center tracking-[-0.084px] whitespace-nowrap"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Experiencing issues receiving the code?
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    className="font-medium text-sm leading-5 text-[#0e121b] underline tracking-[-0.084px] hover:opacity-80 transition-opacity whitespace-nowrap"
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    Resend code
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    )
}

export default LoginPage

export const Head: React.FC = () => (
    <>
        <title>Login | Tiny Timer</title>
        <meta name="description" content="Login to Tiny Timer Pomodoro Timer" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Inter+Display:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
    </>
)
