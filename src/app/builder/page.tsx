"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Wand2, Download, Save } from 'lucide-react';
import styles from './page.module.css';
import ResumePreview, { ResumeData } from '@/components/resume/ResumePreview';
import { supabase } from '@/lib/supabaseClient';

export default function BuilderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [resumeId, setResumeId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        experience: '',
        education: '',
        skills: '',
        projects: ''
    });

    const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);

    useEffect(() => {
        const initBuilder = async () => {
            // Check session
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
            }

            // Get ID from URL query parameters
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            if (id) {
                setResumeId(id);
                setLoading(true);
                try {
                    // Try getting from DB first
                    let loadedFromDb = false;
                    if (session?.user) {
                        const response = await fetch(`/api/resumes?resumeId=${id}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.resume) {
                                const dbResume = data.resume;
                                if (dbResume.content?.formData && dbResume.content?.generatedResume) {
                                    setFormData(dbResume.content.formData);
                                    setGeneratedResume(dbResume.content.generatedResume);
                                } else {
                                    setGeneratedResume(dbResume.content);
                                }
                                loadedFromDb = true;
                            }
                        }
                    }

                    // Fallback to local storage if not loaded from DB
                    if (!loadedFromDb) {
                        const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                        const localResume = localResumes.find((r: any) => r.id === id);
                        if (localResume) {
                            if (localResume.content?.formData && localResume.content?.generatedResume) {
                                setFormData(localResume.content.formData);
                                setGeneratedResume(localResume.content.generatedResume);
                            } else {
                                setGeneratedResume(localResume.content);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error loading resume:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        initBuilder();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            setGeneratedResume(data.resume);
        } catch (error) {
            console.error(error);
            alert('Error generating resume. Make sure you set the GROQ_API_KEY environment variable.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        // Basic download handler, usually implemented in the Preview component
        const element = document.getElementById('resume-preview-pdf');
        if (element) {
            const html2pdf = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const canvas = await html2pdf(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${formData.fullName || 'Resume'}.pdf`);
        }
    };

    const handleSaveToDB = async () => {
        if (!generatedResume) return;
        setSaving(true);

        const resumeTitle = formData.fullName ? `${formData.fullName}'s Resume` : 'My AI Resume';
        const resumeContent = {
            formData,
            generatedResume
        };

        // Try Supabase first
        if (user) {
            try {
                const url = '/api/resumes';
                const method = resumeId ? 'PUT' : 'POST';
                const body = resumeId 
                    ? { id: resumeId, title: resumeTitle, content: resumeContent }
                    : { userId: user.id, title: resumeTitle, content: resumeContent };

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (response.ok) {
                    alert('Resume saved successfully to database!');
                    router.push('/dashboard');
                    return;
                } else {
                    console.warn('Database save failed, falling back to local storage');
                }
            } catch (dbErr) {
                console.error('Supabase save failed:', dbErr);
            }
        }

        // Local Storage Fallback
        try {
            const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
            const activeId = resumeId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));

            const newResumeObj = {
                id: activeId,
                title: resumeTitle,
                content: resumeContent,
                created_at: new Date().toISOString()
            };

            const updatedResumes = resumeId 
                ? localResumes.map((r: any) => r.id === resumeId ? newResumeObj : r)
                : [newResumeObj, ...localResumes];

            localStorage.setItem('local_resumes', JSON.stringify(updatedResumes));
            alert('Resume saved successfully to local storage (Local Offline Mode)!');
            router.push('/dashboard');
        } catch (localErr) {
            console.error('Local storage save failed:', localErr);
            alert('Failed to save resume.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className={styles.container}>
            {/* Top Navbar */}
            <nav className={styles.navbar}>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Button>
                <div className={styles.actions}>
                    {generatedResume && (
                        <>
                            <Button variant="outline" size="sm" onClick={handleSaveToDB} disabled={saving}>
                                <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleDownload}>
                                <Download size={16} /> Export PDF
                            </Button>
                        </>
                    )}
                </div>
            </nav>

            {/* Split Layout */}
            <div className={styles.splitLayout}>
                {/* Left Side: Form */}
                <section className={`${styles.formSection} glass-panel`}>
                    <div className={styles.sectionHeader}>
                        <h2>Provide Your Details</h2>
                        <p>Fill out as much as you can. Our AI will enhance and format it professionally.</p>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroupTop}>
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                            />
                            <Input
                                label="Target Job Title"
                                placeholder="Software Engineer"
                                value={formData.jobTitle}
                                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroupTop}>
                            <Input
                                label="Email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                            <Input
                                label="Phone"
                                placeholder="+1 234 567 890"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                            />
                        </div>

                        <Input
                            label="Location"
                            placeholder="New York, NY"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                        />

                        <div className={styles.textareaGroup}>
                            <label>Professional Summary</label>
                            <textarea
                                placeholder="Briefly describe your career goals and key strengths..."
                                rows={3}
                                value={formData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                            />
                        </div>

                        <div className={styles.textareaGroup}>
                            <label>Experience (Draft format is fine)</label>
                            <textarea
                                placeholder="E.g., Software Engineer at Google (2020-Present), built scalable APIs..."
                                rows={4}
                                value={formData.experience}
                                onChange={(e) => handleInputChange('experience', e.target.value)}
                            />
                        </div>

                        <div className={styles.textareaGroup}>
                            <label>Education</label>
                            <textarea
                                placeholder="E.g., BS Computer Science, MIT (2016-2020)"
                                rows={2}
                                value={formData.education}
                                onChange={(e) => handleInputChange('education', e.target.value)}
                            />
                        </div>

                        <div className={styles.textareaGroup}>
                            <label>Skills</label>
                            <textarea
                                placeholder="E.g., React, Node.js, Python, AWS"
                                rows={2}
                                value={formData.skills}
                                onChange={(e) => handleInputChange('skills', e.target.value)}
                            />
                        </div>

                        <div className={styles.textareaGroup}>
                            <label>Projects</label>
                            <textarea
                                placeholder="E.g., 'E-commerce App' - built a full stack app with Stripe..."
                                rows={3}
                                value={formData.projects}
                                onChange={(e) => handleInputChange('projects', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.generateBtnContainer}>
                        <Button size="lg" fullWidth onClick={handleGenerate} disabled={loading}>
                            <Wand2 size={20} />
                            {loading ? 'AI is working its magic...' : 'Generate AI Resume'}
                        </Button>
                    </div>
                </section>

                {/* Right Side: Preview */}
                <section className={styles.previewSection}>
                    <div className={styles.previewContainer}>
                        {loading ? (
                            <div className={styles.loadingPreview}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Generating perfect phrasing...</p>
                            </div>
                        ) : generatedResume ? (
                            <ResumePreview resume={generatedResume} />
                        ) : (
                            <div className={styles.emptyPreview}>
                                <Wand2 size={48} className={styles.emptyIcon} />
                                <h3>Preview Area</h3>
                                <p>Fill out your details and click Generate to see the magic happen.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
