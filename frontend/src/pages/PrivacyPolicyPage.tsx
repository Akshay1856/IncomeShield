import incomeshieldLogo from '@/assets/incomeshield-logo.png';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col items-center gap-3">
          <img src={incomeshieldLogo} alt="IncomeShield" className="h-14 w-14 dark:invert" />
          <h1 className="text-3xl font-bold text-foreground">IncomeShield</h1>
        </div>

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h2 className="text-2xl font-bold text-foreground">Privacy Policy</h2>
        <p className="text-sm text-muted-foreground">Last updated: April 5, 2026</p>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">1. Information We Collect</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Personal information: name, email address, phone number, date of birth, city of residence</li>
              <li>Work information: employment type (full-time/part-time), delivery platform (Zomato/Swiggy), preferred working hours</li>
              <li>Location data: GPS coordinates for real-time weather monitoring and disruption detection</li>
              <li>Device information: browser type, operating system, device identifiers for PWA functionality</li>
              <li>Payment information: UPI ID, bank account details for payout processing</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">2. How We Use Your Information</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>To provide parametric insurance coverage and process automatic claims</li>
              <li>To monitor weather conditions, AQI levels, and platform downtime in your area</li>
              <li>To calculate risk scores and personalized premium rates based on your location and work patterns</li>
              <li>To process instant payouts via UPI or bank transfer when disruption triggers are activated</li>
              <li>To send notifications about trigger events, claim statuses, and policy updates</li>
              <li>To improve IncomeShield's AI risk assessment and fraud detection systems</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">3. Data Sharing</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>IncomeShield does not sell your personal data to third parties</li>
              <li>We share data with payment processors (UPI/NEFT) solely for payout transactions</li>
              <li>Weather and environmental data is sourced from third-party APIs (OpenWeatherMap) and is not linked to your identity</li>
              <li>We may share anonymized, aggregated data for research and improving gig worker protections</li>
              <li>We comply with legal requirements and may disclose data when required by Indian law enforcement</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">4. Data Security</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Authentication is handled via secure session tokens with automatic refresh</li>
              <li>Payment credentials are never stored on IncomeShield servers — processed via certified payment gateways</li>
              <li>Regular security audits and vulnerability assessments are conducted</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">5. Your Rights</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>You can access, update, or delete your personal information from your Profile page</li>
              <li>You can opt out of non-essential notifications at any time</li>
              <li>You can request a complete export of your data by contacting support@incomeshield.in</li>
              <li>You can delete your account permanently — all associated data will be removed within 30 days</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">6. Cookies & Local Storage</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>IncomeShield uses local storage to maintain your session and language preferences</li>
              <li>No third-party tracking cookies are used</li>
              <li>PWA service workers cache app assets locally for offline functionality</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">7. Contact Us</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Email: privacy@incomeshield.in</li>
              <li>Address: IncomeShield Technologies Pvt. Ltd., Mumbai, Maharashtra, India</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
