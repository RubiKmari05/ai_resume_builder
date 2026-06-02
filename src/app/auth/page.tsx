"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Signup successful! Please check your email for a confirmation link (if enabled) or proceed to login.');
            }
            if (isLogin) {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.glowOrb}></div>

            <div className={`${styles.authCard} glass-panel`}>
                <div className={styles.header}>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Sign in to access your resumes' : 'Join to start building your career'}</p>
                </div>

                <form onSubmit={handleAuth} className={styles.form}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </Button>
                </form>

                <div className={styles.toggleText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button type="button" onClick={() => setIsLogin(!isLogin)} className={styles.toggleBtn}>
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </main>
    );
}
