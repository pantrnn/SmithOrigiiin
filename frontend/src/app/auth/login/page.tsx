'use client'
import { useState } from 'react';
import api from '../../../lib/axios';
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation';
import { saveAuth } from '../../../lib/auth';
import { UserRound, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/app/components/ui/authcontext';
import { Turnstile } from '@marsidev/react-turnstile';


interface User {
  id: number
  username: string
  email: string
  isAdmin: boolean
}

export default function AuthPage() {
    const { setUser } = useAuth()
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

    // Turnstile states
    const [turnstileToken, setTurnstileToken] = useState('');
    const [turnstileError, setTurnstileError] = useState('');

    const [signInUsername, setSignInUsername] = useState('');
    const [signInPassword, setSignInPassword] = useState('');

    const [signUpUsername, setSignUpUsername] = useState('');
    const [signUpEmail, setSignUpEmail] = useState('');
    const [signUpPassword, setSignUpPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Validasi Turnstile
        if (!turnstileToken) {
            setError('Please complete the security verification');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                username: signInUsername,
                password: signInPassword,
                turnstileToken,
            });
            const accessToken = response.data.data.accessToken

            saveAuth(accessToken)

            const decoded = jwtDecode<User>(accessToken)
            setUser(decoded)

            router.push('/user')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err?.response?.data?.message ?? err.message ?? 'Login gagal. Silakan coba lagi.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validasi Turnstile
        if (!turnstileToken) {
            setError('Please complete the security verification');
            return;
        }

        setLoading(true);
        if (signUpPassword.length < 6) {
            setError('Password minimal 6 karakter');
            setLoading(false);
            return;
        }
        try {
            const response = await api.post('/auth/register', {
                username: signUpUsername,
                email: signUpEmail,
                password: signUpPassword,
                turnstileToken,
            });
            const accessToken = response?.data?.data?.accessToken;
            if (typeof accessToken !== 'string') throw new Error('Token tidak valid');
            saveAuth(accessToken);
            router.push('/user');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const message = err?.response?.data?.message ?? err.message ?? 'Registrasi gagal. Silakan coba lagi.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Handle tab change - reset turnstile
    const handleTabChange = (tab: 'signin' | 'signup') => {
        setActiveTab(tab);
        setTurnstileToken('');
        setError('');
        setTurnstileError('');
    };

    return (
        <div>
            <section className="container px-10 mx-auto flex items-center justify-center h-screen">
                <div className="flex flex-col gap-7">
                    <div className="text-center space-y-5">
                        <h1 className="text-5xl text-red-800 font-semibold">
                            {activeTab === 'signin' ? 'Login' : 'Create Account'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {activeTab === 'signin'
                                ? 'Masukkan detail anda untuk masuk ke akun'
                                : 'Register your account to get started'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {turnstileError && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                            {turnstileError}
                        </div>
                    )}

                    {activeTab === 'signin' && (
                        <form onSubmit={handleSignIn} className="space-y-4 w-110">
                            <div className="relative">
                                <label className="absolute top-5 left-5 cursor-pointer text-gray-400" htmlFor="signin-username">
                                    <UserRound className='w-5 h-5'/>
                                </label>
                                <input
                                    id="signin-username"
                                    type="text"
                                    placeholder="Username"
                                    className="border-2 border-gray-200 py-4 px-4 pl-13 w-full rounded-2xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    value={signInUsername}
                                    onChange={(e) => setSignInUsername(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="relative">
                                <label className="absolute top-5 left-5 cursor-pointer text-gray-400" htmlFor="signin-password">
                                    <Lock className='w-5 h-5'/>
                                </label>
                                <input
                                    id="signin-password"
                                    type="password"
                                    placeholder="Password"
                                    className="border-2 border-gray-200 py-4 px-4 pl-13 w-full rounded-2xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    value={signInPassword}
                                    onChange={(e) => setSignInPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Cloudflare Turnstile */}
                            <div className="flex justify-center py-2">
                                <Turnstile
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                    onSuccess={(token) => {
                                        setTurnstileToken(token);
                                        setTurnstileError('');
                                        setError('');
                                    }}
                                    onError={() => {
                                        setTurnstileToken('');
                                        setTurnstileError('Verification failed. Please try again.');
                                    }}
                                    onExpire={() => {
                                        setTurnstileToken('');
                                        setTurnstileError('Verification expired. Please verify again.');
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !turnstileToken}
                                className="bg-red-800 text-white text-xl font-semibold w-full py-4 rounded-full cursor-pointer hover:bg-red-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Login'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'signup' && (
                        <form onSubmit={handleSignUp} className="space-y-4 w-110">
                            <div className="relative">
                                <label className="absolute top-5 left-5 text-xl cursor-pointer text-gray-400" htmlFor="signup-username">
                                    <UserRound />
                                </label>
                                <input
                                    id="signup-username"
                                    type="text"
                                    placeholder="Username"
                                    className="border-2 border-gray-200 py-4 px-4 pl-13 w-full rounded-2xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    value={signUpUsername}
                                    onChange={(e) => setSignUpUsername(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="relative">
                                <label className="absolute top-5 left-5 text-xl cursor-pointer text-gray-400" htmlFor="signup-email">
                                    <Mail className='w-5 h-5'/>
                                </label>
                                <input
                                    id="signup-email"
                                    type="email"
                                    placeholder="Email"
                                    className="border-2 border-gray-200 py-4 px-4 pl-13 w-full rounded-2xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    value={signUpEmail}
                                    onChange={(e) => setSignUpEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="relative">
                                <label className="absolute top-5 left-5 text-xl cursor-pointer text-gray-400" htmlFor="signup-password">
                                    <Lock className='w-5 h-5'/>
                                </label>
                                <input
                                    id="signup-password"
                                    type="password"
                                    placeholder="Password (min 6 karakter)"
                                    className="border-2 border-gray-200 py-4 px-4 pl-13 w-full rounded-2xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    value={signUpPassword}
                                    onChange={(e) => setSignUpPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>

                            {/* Cloudflare Turnstile */}
                            <div className="flex justify-center py-2">
                                <Turnstile
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                    onSuccess={(token) => {
                                        setTurnstileToken(token);
                                        setTurnstileError('');
                                        setError('');
                                    }}
                                    onError={() => {
                                        setTurnstileToken('');
                                        setTurnstileError('Verification failed. Please try again.');
                                    }}
                                    onExpire={() => {
                                        setTurnstileToken('');
                                        setTurnstileError('Verification expired. Please verify again.');
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !turnstileToken}
                                className="bg-red-800 text-white text-xl font-medium w-full py-4 rounded-full cursor-pointer hover:bg-red-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </form>
                    )}

                    <p className="text-[12px] text-center">
                        {activeTab === 'signin' ? "Don't have an account? " : "You already have an account? "}
                        <button
                            onClick={() => handleTabChange(activeTab === 'signin' ? 'signup' : 'signin')}
                            className="bg-transparent border-none cursor-pointer text-red-800 font-semibold hover:underline p-0"
                        >
                            {activeTab === 'signin' ? 'SignUp' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </section>
        </div>
    );
}