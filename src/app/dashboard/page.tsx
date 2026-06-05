"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Plus, FileText, LogOut, Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import styles from './page.module.css';

interface SavedResume {
    id: string;
    title: string;
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [resumes, setResumes] = useState<SavedResume[]>([]);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth');
            } else {
                setUser(session.user);
                fetchResumes(session.user.id);
            }
        };
        checkSession();
    }, [router]);

    const fetchResumes = async (userId?: string) => {
        let dbResumes: SavedResume[] = [];
        let localResumes: SavedResume[] = [];

        // Fetch local resumes
        try {
            localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
        } catch (err) {
            console.error('Failed to parse local storage resumes:', err);
        }

        // Fetch DB resumes
        if (userId) {
            try {
                const response = await fetch(`/api/resumes?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    dbResumes = data.resumes || [];
                }
            } catch (error) {
                console.error('Failed to fetch resumes from database:', error);
            }
        }

        // Merge lists (avoiding duplicate IDs if any)
        const dbIds = new Set(dbResumes.map(r => r.id));
        const uniqueLocal = localResumes.filter(r => !dbIds.has(r.id));
        
        setResumes([...dbResumes, ...uniqueLocal]);
        setLoading(false);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} size={48} />
            </div>
        );
    }

    return (
        <main className={styles.main}>
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <FileText className={styles.logoIcon} />
                    <span>My Dashboard</span>
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.userEmail}>{user?.email}</span>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                        <LogOut size={16} />
                        Sign Out
                    </Button>
                </div>
            </nav>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Your Resumes</h1>
                    <Link href="/builder">
                        <Button>
                            <Plus size={18} />
                            Create New
                        </Button>
                    </Link>
                </div>

                {resumes.length === 0 ? (
                    <div className={`${styles.emptyState} glass-panel`}>
                        <div className={styles.emptyIcon}><FileText size={48} /></div>
                        <h2>No Resumes Yet</h2>
                        <p>You haven&apos;t created any resumes. Start building your career profile today!</p>
                        <Link href="/builder">
                            <Button variant="primary">Generate First Resume</Button>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {resumes.map((resume) => (
                            <div key={resume.id} className={`${styles.resumeCard} glass-panel`}>
                                <div className={styles.cardHeader}>
                                    <FileText size={24} className={styles.cardIcon} />
                                    <h3>{resume.title || 'Untitled Resume'}</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    <p>Generated on {new Date(resume.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <Link href={`/builder?id=${resume.id}`} style={{ width: '100%' }}>
                                        <Button variant="outline" size="sm" fullWidth>View / Edit</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
