"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Wand2, Download, Save } from 'lucide-react';
import styles from './page.module.css';
import ResumePreview from '@/components/resume/ResumePreview';

export default function BuilderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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

    const [generatedResume, setGeneratedResume] = useState<any>(null);

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
        alert("Saving features will be activated soon!");
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
                            <Button variant="outline" size="sm" onClick={handleSaveToDB}>
                                <Save size={16} /> Save
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
