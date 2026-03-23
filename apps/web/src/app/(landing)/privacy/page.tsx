import { HeroHeader } from "../../../components/hero-section";
import { LandingFooter } from "../../../components/landing-footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <HeroHeader />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-fg mb-10">Last updated: March 23, 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">What we collect</h2>
          <p className="text-sm text-muted-fg mb-3">
            ClauBoard collects minimal data to operate the website and improve the product:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-fg">
            <li><strong className="text-foreground">Email address</strong> — only if you subscribe to the newsletter. We use <a href="https://buttondown.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Buttondown</a> to manage subscriptions.</li>
            <li><strong className="text-foreground">Analytics data</strong> — we use Google Analytics to understand how visitors use the website. This includes anonymized page views, referral sources, and device information.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">How we use your data</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-fg">
            <li><strong className="text-foreground">Newsletter emails</strong> are used solely to send product updates and release notes. We never sell or share your email with third parties.</li>
            <li><strong className="text-foreground">Analytics data</strong> is used to understand which pages are visited and how to improve the website.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Third-party services</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-fg">
            <li><a href="https://buttondown.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Buttondown</a> — newsletter delivery</li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Google Analytics</a> — website analytics</li>
            <li><a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Render</a> — website hosting</li>
            <li><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Cloudflare</a> — DNS and security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Self-hosted version</h2>
          <p className="text-sm text-muted-fg">
            When you run ClauBoard locally or self-host it, no data is sent to us. The software runs entirely on your machine. There are no telemetry, tracking, or phone-home features in the self-hosted version.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Cookies</h2>
          <p className="text-sm text-muted-fg">
            Google Analytics may set cookies to distinguish users and sessions. No other cookies are used by ClauBoard. Your theme preference (light/dark) is stored in localStorage, not cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Your rights</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-fg">
            <li><strong className="text-foreground">Unsubscribe</strong> — every newsletter email includes an unsubscribe link.</li>
            <li><strong className="text-foreground">Data deletion</strong> — contact us to request deletion of your email from our newsletter list.</li>
            <li><strong className="text-foreground">Access</strong> — contact us to request a copy of any data we hold about you.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <p className="text-sm text-muted-fg">
            For privacy-related questions, reach out via <a href="https://github.com/Sipoke123/ClauBoard/issues" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">GitHub Issues</a>.
          </p>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
