import Link from "next/link";
import { Sparkles, FileText, Download, ShieldCheck } from "lucide-react";
import styles from "./page.module.css";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Navbar Placeholder */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Sparkles className={styles.logoIcon} />
          <span>AI Resume</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/auth">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/builder">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.glowOrb1}></div>
        <div className={styles.glowOrb2}></div>

        <h1 className={`${styles.title} animate-fade-in`}>
          Craft Your <span className="gradient-text">Dream Career</span><br />
          In Seconds With AI
        </h1>
        <p className={`${styles.subtitle} animate-fade-in`} style={{ animationDelay: '0.2s' }}>
          Stop struggling with formatting and writer&apos;s block. Let our advanced AI generate a professional, ATS-friendly resume tailored to you.
        </p>

        <div className={`${styles.ctaContainer} animate-fade-in`} style={{ animationDelay: '0.4s' }}>
          <Link href="/builder">
            <Button size="lg" className={styles.primaryCta}>
              <Sparkles size={20} />
              Build Resume Now
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="lg" variant="secondary">
              View Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Powered By Next-Gen Intelligence</h2>
        <div className={styles.featuresGrid}>
          <div className={`${styles.featureCard} glass-panel`}>
            <div className={styles.iconWrapper}><Sparkles size={24} /></div>
            <h3>Smart Generation</h3>
            <p>Our AI analyzes your basic inputs and expands them into compelling, metric-driven bullet points.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel`}>
            <div className={styles.iconWrapper}><FileText size={24} /></div>
            <h3>ATS-Optimized</h3>
            <p>Designed to pass through Applicant Tracking Systems with clean, semantic formatting.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel`}>
            <div className={styles.iconWrapper}><Download size={24} /></div>
            <h3>Instant PDF Export</h3>
            <p>Download your beautiful resume as a high-quality PDF, ready to send to employers.</p>
          </div>
          <div className={`${styles.featureCard} glass-panel`}>
            <div className={styles.iconWrapper}><ShieldCheck size={24} /></div>
            <h3>Secure Storage</h3>
            <p>Your data is safely stored in Supabase. Access, edit, or regenerate your resumes anytime.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
