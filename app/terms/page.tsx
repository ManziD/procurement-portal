import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions – ServiceHub-Ug',
  description: 'Terms and conditions for using ServiceHub-Ug, a platform connecting clients and service providers in Kampala, Uganda.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl prose prose-lg">
      <h1>Terms &amp; Conditions</h1>
      <p className="text-gray-600">Version 1.0 – Last revised: August 2026</p>

      <p>
        Welcome to <strong>ServiceHub-Ug</strong> (the &quot;Site&quot;), owned and operated by <strong>ServiceHub-Ug</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By using this Site, you agree to these Terms.
      </p>

      <h2>1. What We Do</h2>
      <p>
        ServiceHub-Ug is an online marketplace that connects clients seeking services with providers offering those services. We provide a platform for users to connect, communicate, and transact. We do not provide services ourselves, nor do we supervise, endorse, or verify the qualifications, background, or abilities of any user.
      </p>

      <h2>2. Accounts</h2>
      <p>
        To access certain features, you may need to create an account. You agree to provide accurate information and keep it updated. You are responsible for your login credentials and all activity under your account.
      </p>

      <h2>3. User Responsibility</h2>
      <p>
        You are solely responsible for your interactions with other users. Before hiring a service provider, you should verify their qualifications, experience, and suitability for your needs. Before accepting a job, providers should ensure the client is able to pay. We are not responsible for any disputes, performance issues, payment failures, or any other matter arising from user-to-user transactions.
      </p>
      <p className="font-semibold text-red-600">
        ⚠️ We are not a party to any agreement between users. All dealings are solely between the client and the provider.
      </p>

      <h2>4. No Liability</h2>
      <p>
        To the fullest extent permitted by law:
      </p>
      <ul>
        <li>
          <strong>We are not liable</strong> for any loss, damage, injury, or expense arising from or related to services provided (or not provided) by users of the Site.
        </li>
        <li>
          <strong>We are not liable</strong> for any disputes between clients and providers, including but not limited to disputes about payment, quality of work, timelines, or any other matter.
        </li>
        <li>
          <strong>We are not liable</strong> for any user's failure to perform a service, failure to pay, fraud, misconduct, negligence, or breach of any agreement.
        </li>
        <li>
          <strong>We do not guarantee</strong> the accuracy, completeness, or reliability of any user profile, rating, or review.
        </li>
        <li>
          <strong>We do not guarantee</strong> that any service provider will be available, qualified, or suitable for your needs.
        </li>
        <li>
          <strong>We do not guarantee</strong> that any client will pay for services rendered.
        </li>
      </ul>
      <p className="font-semibold">
        You use ServiceHub-Ug at your own risk. We provide the platform &quot;as is&quot; and &quot;as available&quot;.
      </p>

      <h2>5. Third-Party Services</h2>
      <p>
        The Site may contain links to third-party websites or services (such as WhatsApp, Google, or payment gateways). We are not responsible for their content, privacy practices, or any issues arising from your use of them.
      </p>

      <h2>6. Disclaimers</h2>
      <p>
        The Site is provided &quot;as is&quot; and &quot;as available.&quot; We do not warrant that the Site will be error-free, secure, or uninterrupted. We are not responsible for any harm, loss, or damage resulting from your use of the Site or any services booked through the Site.
      </p>

      <h2>7. No Guarantee of Service or Payment</h2>
      <p>
        We do not guarantee that:
      </p>
      <ul>
        <li>Any service provider will complete a job to your satisfaction.</li>
        <li>Any client will pay for services rendered.</li>
        <li>Any user will respond to requests or bids.</li>
        <li>Any user is qualified, licensed, or insured.</li>
      </ul>
      <p>
        You are advised to conduct your own due diligence before entering into any agreement with another user.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate your account at any time if we believe you have violated these Terms or if we suspect fraudulent or harmful activity.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the Republic of Uganda. You and we consent to the exclusive jurisdiction of the courts in Kampala, Uganda for any disputes arising from these Terms or your use of the Site.
      </p>

      <h2>10. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material changes, we will notify you by email or via a notice on the Site. Your continued use means you accept the updated Terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        If you have questions about these Terms, contact us at:
      </p>
      <ul>
        <li><strong>Email:</strong> info@servicehub-ug.com</li>
        <li><strong>Address:</strong> Bweyogerere, Kampala, Uganda</li>
      </ul>

      <p className="mt-8 text-sm text-gray-500">
        © {new Date().getFullYear()} ServiceHub-Ug. All rights reserved.
      </p>
    </div>
  )
}
