import incomeshieldLogo from '@/assets/incomeshield-logo.png';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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

        <h2 className="text-2xl font-bold text-foreground">Terms of Service</h2>
        <p className="text-sm text-muted-foreground">Last updated: April 5, 2026</p>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>By using IncomeShield, you agree to be bound by these Terms of Service</li>
              <li>IncomeShield is a parametric micro-insurance platform designed for gig economy delivery partners in India</li>
              <li>You must be at least 18 years old to create an account and purchase a policy</li>
              <li>These terms are governed by the laws of India and subject to the jurisdiction of Mumbai courts</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">2. Service Description</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>IncomeShield provides parametric insurance that automatically triggers payouts when predefined conditions are met</li>
              <li>Covered triggers include: heavy rainfall, heatwaves, severe air quality (AQI), and platform downtime</li>
              <li>Payouts are calculated based on lost working hours multiplied by the applicable hourly rate (₹125/hr)</li>
              <li>Claims are auto-generated and processed without the need for manual filing</li>
              <li>IncomeShield uses real-time weather data, AQI sensors, and platform status monitoring for trigger detection</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">3. Subscription & Billing</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>IncomeShield offers three plans: Basic Shield (₹29/week), Pro Shield (₹59/week), and Max Shield (₹99/week)</li>
              <li>Monthly billing options are available at a discounted rate</li>
              <li>All new users receive a 15-day free trial — no credit card required</li>
              <li>Premiums are adjusted based on your city, work type, and current weather risk factors</li>
              <li>You may cancel your subscription at any time — coverage remains active until the end of the billing period</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">4. Payouts</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Payouts are processed automatically once a parametric trigger is verified</li>
              <li>UPI payouts are instant; bank transfers (NEFT/IMPS) may take 1–2 business days</li>
              <li>Maximum weekly payout limits depend on your plan tier (₹500 / ₹1,500 / ₹3,000)</li>
              <li>The minimum payout amount is ₹100 — smaller amounts are accumulated to the next cycle</li>
              <li>IncomeShield reserves the right to delay or withhold payouts pending fraud investigation</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">5. Fraud Prevention</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>IncomeShield employs AI-based fraud detection to identify suspicious claim patterns</li>
              <li>Multiple rapid claims from the same location or inconsistent GPS data may trigger a review</li>
              <li>Fraudulent claims will result in immediate account suspension and forfeiture of pending payouts</li>
              <li>Users found engaging in fraud may be permanently banned and reported to authorities</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">6. User Responsibilities</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>You must provide accurate personal and work information during registration</li>
              <li>You must keep your account credentials secure and not share them with others</li>
              <li>You must enable location services for accurate weather monitoring and claim verification</li>
              <li>You must notify IncomeShield of any changes to your city, work type, or payment details</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">7. Limitation of Liability</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>IncomeShield is not liable for losses due to inaccurate weather data from third-party providers</li>
              <li>Maximum liability is limited to the total premiums paid by the user in the current billing period</li>
              <li>IncomeShield does not guarantee uninterrupted service availability</li>
              <li>Force majeure events may temporarily suspend trigger monitoring and payout processing</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">8. Modifications</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>IncomeShield reserves the right to modify these terms with 30 days prior notice</li>
              <li>Continued use of the platform after modifications constitutes acceptance of updated terms</li>
              <li>Material changes will be communicated via email and in-app notifications</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold">9. Contact</h3>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Email: legal@incomeshield.in</li>
              <li>Address: IncomeShield Technologies Pvt. Ltd., Mumbai, Maharashtra, India</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
