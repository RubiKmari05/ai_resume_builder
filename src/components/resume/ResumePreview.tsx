import React from 'react';
import styles from './ResumePreview.module.css';

export interface ResumeData {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    experience: { company: string; role: string; dates: string; bulletPoints: string[] }[];
    education: { institution: string; degree: string; dates: string }[];
    skills: string[];
    projects: { name: string; description: string; bulletPoints: string[] }[];
}

export default function ResumePreview({ resume }: { resume: ResumeData }) {
    if (!resume) return null;

    return (
        <div id="resume-preview-pdf" className={styles.resumeDocument}>
            <header className={styles.header}>
                <h1 className={styles.name}>{resume.fullName}</h1>
                {resume.jobTitle && <h2 className={styles.jobTitle}>{resume.jobTitle}</h2>}
                <div className={styles.contactInfo}>
                    {resume.email && <span>{resume.email}</span>}
                    {resume.phone && <span> • {resume.phone}</span>}
                    {resume.location && <span> • {resume.location}</span>}
                </div>
            </header>

            {resume.summary && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Professional Summary</h3>
                    <p className={styles.regularText}>{resume.summary}</p>
                </section>
            )}

            {resume.experience && resume.experience.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Experience</h3>
                    <div className={styles.entriesList}>
                        {resume.experience.map((exp, idx) => (
                            <div key={idx} className={styles.entry}>
                                <div className={styles.entryHeader}>
                                    <div className={styles.entryTitleGroup}>
                                        <span className={styles.entryRole}>{exp.role}</span>
                                        <span className={styles.entryCompany}>, {exp.company}</span>
                                    </div>
                                    <span className={styles.entryDates}>{exp.dates}</span>
                                </div>
                                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                                    <ul className={styles.bulletList}>
                                        {exp.bulletPoints.map((bp, i) => (
                                            <li key={i}>{bp}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {resume.projects && resume.projects.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Projects</h3>
                    <div className={styles.entriesList}>
                        {resume.projects.map((proj, idx) => (
                            <div key={idx} className={styles.entry}>
                                <div className={styles.entryHeader}>
                                    <span className={styles.entryRole}>{proj.name}</span>
                                </div>
                                <p className={styles.regularText}>{proj.description}</p>
                                {proj.bulletPoints && proj.bulletPoints.length > 0 && (
                                    <ul className={styles.bulletList}>
                                        {proj.bulletPoints.map((bp, i) => (
                                            <li key={i}>{bp}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {resume.education && resume.education.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Education</h3>
                    <div className={styles.entriesList}>
                        {resume.education.map((edu, idx) => (
                            <div key={idx} className={styles.entry}>
                                <div className={styles.entryHeader}>
                                    <div className={styles.entryTitleGroup}>
                                        <span className={styles.entryRole}>{edu.degree}</span>
                                        <span className={styles.entryCompany}>, {edu.institution}</span>
                                    </div>
                                    <span className={styles.entryDates}>{edu.dates}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {resume.skills && resume.skills.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Skills</h3>
                    <div className={styles.skillsList}>
                        {resume.skills.map((skill, idx) => (
                            <span key={idx} className={styles.skillItem}>{skill}</span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
