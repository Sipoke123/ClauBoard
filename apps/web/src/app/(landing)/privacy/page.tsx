import { HeroHeader } from "../../../components/hero-section";
import { LandingFooter } from "../../../components/landing-footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <HeroHeader />
      <main className="max-w-3xl mx-auto px-6 py-20 prose prose-sm dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-fg prose-li:text-muted-fg prose-a:text-emerald-600 dark:prose-a:text-emerald-400">
        <h1>Privacy Policy</h1>
        <p><strong>Last updated:</strong> March 23, 2026</p>

        <h2>What we collect</h2>
        <p>
          ClauBoard collects minimal data to operate the website and improve the product:
        </p>
        <ul>
          <li><strong>Email address</strong> — only if you subscribe to the newsletter via the form on our website. We use <a href="https://buttondown.com" target="_blank" rel="noopener noreferrer">Buttondown</a> to manage subscriptions.</li>
          <li><strong>Analytics data</strong> — we use Google Analytics to understand how visitors use the website. This includes anonymized page views, referral sources, and device information. No personally identifiable information is collected through analytics.</li>
        </ul>

        <h2>How we use your data</h2>
        <ul>
          <li><strong>Newsletter emails</strong> are used solely to send product updates, new features, and release notes. We never sell or share your email with third parties.</li>
          <li><strong>Analytics data</strong> is used to understand which pages are visited and how to improve the website.</li>
        </ul>

        <h2>Third-party services</h2>
        <ul>
          <li><a href="https://buttondown.com/legal/privacy" target="_blank" rel="noopener noreferrer">Buttondown</a> — newsletter delivery</li>
          <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Analytics</a> — website analytics</li>
          <li><a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">Render</a> — website hosting</li>
          <li><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare</a> — DNS and security</li>
        </ul>

        <h2>Self-hosted version</h2>
        <p>
          When you run ClauBoard locally or self-host it, no data is sent to us. The software runs entirely on your machine. There are no telemetry, tracking, or phone-home features in the self-hosted version.
        </p>

        <h2>Cookies</h2>
        <p>
          Google Analytics may set cookies to distinguish users and sessions. No other cookies are used by ClauBoard. Your theme preference (light/dark) is stored in localStorage, not cookies.
        </p>

        <h2>Your rights</h2>
        <ul>
          <li><strong>Unsubscribe</strong> — every newsletter email includes an unsubscribe link.</li>
          <li><strong>Data deletion</strong> — contact us to request deletion of your email from our newsletter list.</li>
          <li><strong>Access</strong> — contact us to request a copy of any data we hold about you.</li>
        </ul>

        <h2>Contact</h2>
        <p>
          For privacy-related questions, reach out via <a href="https://github.com/Sipoke123/ClauBoard/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>.
        </p>
      </main>
      <LandingFooter />
    </div>
  );
}
