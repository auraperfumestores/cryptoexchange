import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Trading Rules & Policies',
  description: 'Read the Terms of Service governing account registration, KYC, fees, settlement, and acceptable use of the SwappINR USDT to INR exchange platform.',
  alternates: { canonical: '/terms' },
};

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: [
      `These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and SwappINR ("SwappINR," "we," "us," or "our") governing your access to and use of the SwappINR website, mobile interfaces, APIs, and all related services (collectively, the "Platform"), which facilitate the conversion of Tether (USDT) to Indian Rupees (INR) and related settlement services via UPI, IMPS, NEFT, and RTGS.`,
      `By creating an account, accessing the Platform, or initiating any transaction, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and any additional guidelines or rules posted on the Platform, which are incorporated herein by reference. If you do not agree to these Terms in their entirety, you must not access or use the Platform.`,
      `We reserve the right to amend these Terms at any time. Material changes will be notified to registered users via email or in-app notice at least seven (7) days prior to taking effect. Continued use of the Platform after such notice constitutes acceptance of the revised Terms.`,
    ],
  },
  {
    title: '2. Eligibility',
    body: [
      `To use the Platform, you must: (a) be at least eighteen (18) years of age; (b) have the legal capacity to enter into a binding contract under the Indian Contract Act, 1872; (c) not be a person barred from using virtual digital asset or financial services under any applicable law, including the Prevention of Money Laundering Act, 2002 ("PMLA"), or any directive issued by the Reserve Bank of India, Financial Intelligence Unit-India (FIU-IND), or other competent regulatory authority; and (d) complete the Know Your Customer ("KYC") verification process described in Section 4.`,
      `SwappINR reserves the right, at its sole discretion, to refuse service, suspend, or terminate accounts of users who do not meet, or are found to no longer meet, the eligibility criteria set out above.`,
    ],
  },
  {
    title: '3. Account Registration & Security',
    body: [
      `You agree to provide accurate, current, and complete information during registration and to promptly update such information to keep it accurate, current, and complete. You are solely responsible for maintaining the confidentiality of your account credentials, including your password and any one-time passwords (OTPs) sent to your registered mobile number or email address.`,
      `You must notify us immediately at the earliest opportunity of any unauthorized use of your account or any other breach of security. SwappINR will not be liable for any loss or damage arising from your failure to comply with this security obligation. You are responsible for all activities that occur under your account, whether or not authorized by you, except to the extent such activity is a direct result of SwappINR's gross negligence or willful misconduct.`,
      `We may require additional verification steps (including two-factor authentication, device verification, or re-KYC) at any time, particularly where we detect unusual account activity or as required to comply with applicable law.`,
    ],
  },
  {
    title: '4. KYC, AML & Regulatory Compliance',
    body: [
      `SwappINR is committed to operating in compliance with applicable Indian law, including the PMLA, the Information Technology Act, 2000, and guidance issued by FIU-IND with respect to virtual digital asset service providers ("VDA SPs"). As part of our Anti-Money Laundering ("AML") and Combating the Financing of Terrorism ("CFT") obligations, we require all users to complete KYC verification, which may include submission of a Permanent Account Number (PAN), Aadhaar-based identity verification, bank account or UPI VPA ownership confirmation, and a live selfie or video verification.`,
      `We reserve the right to request additional documentation, conduct enhanced due diligence, and report suspicious transactions to FIU-IND or any other competent authority, without prior notice to you, where required by law. We may freeze, suspend, or delay any transaction pending the outcome of such due diligence.`,
      `You represent and warrant that all funds and digital assets you transact through the Platform are derived from lawful sources and that you are not using the Platform for money laundering, terrorist financing, tax evasion, or any other unlawful purpose. Violation of this representation will result in immediate account suspension and may be reported to law enforcement authorities.`,
    ],
  },
  {
    title: '5. Nature of Services',
    body: [
      `SwappINR operates as a peer-to-platform exchange facilitator, enabling users to convert USDT held on supported blockchain networks (BEP-20, ERC-20, and TRC-20) into INR, and to receive settlement via UPI, IMPS, NEFT, or RTGS, subject to the limits, fees, and processing times displayed on the Platform at the time of the transaction.`,
      `Exchange rates displayed on the Platform are indicative and may fluctuate based on prevailing market conditions until the point of trade execution. The rate locked at order confirmation is final and binding for that specific order. SwappINR does not guarantee any specific rate, return, or profit and is not an investment, savings, or wealth-management product.`,
      `SwappINR does not act as a custodian of your digital assets beyond the time strictly necessary to process a confirmed transaction. You are solely responsible for the security of your wallets, private keys, and seed phrases prior to and outside of an active transaction with the Platform.`,
    ],
  },
  {
    title: '6. Fees & Settlement',
    body: [
      `Applicable fees, if any, are disclosed transparently on the order confirmation screen prior to you finalizing a transaction. SwappINR reserves the right to revise its fee structure from time to time, with such changes taking effect prospectively and not affecting orders already confirmed.`,
      `Standard settlement timelines are displayed on the Platform and may vary based on network congestion on the relevant blockchain, banking-hours restrictions on UPI/IMPS/NEFT/RTGS rails, and the outcome of any fraud or compliance screening triggered by your transaction. SwappINR will make commercially reasonable efforts to settle within the displayed timeframe but does not guarantee settlement within any specific period where delay arises from causes outside its reasonable control, including those described in Section 11 (Force Majeure).`,
    ],
  },
  {
    title: '7. Prohibited Conduct',
    body: [
      `You agree not to: (a) use the Platform for any unlawful purpose or in violation of any applicable law or regulation; (b) provide false, misleading, or fraudulent information during registration, KYC, or any transaction; (c) attempt to circumvent any security, rate-limiting, or anti-fraud measure implemented on the Platform; (d) use automated means (bots, scripts, scrapers) to access the Platform without our prior written consent; (e) engage in any activity that could disrupt, damage, or impair the Platform's functioning or the experience of other users; or (f) use the Platform to launder funds, finance terrorism, evade taxes, or facilitate any other illicit activity.`,
      `Any violation of this Section may result in immediate suspension or termination of your account, forfeiture of any pending transaction, and referral to law enforcement or regulatory authorities, in addition to any other remedies available to SwappINR under law or these Terms.`,
    ],
  },
  {
    title: '8. Risk Disclosure',
    body: [
      `Virtual digital assets, including USDT, are subject to high market volatility, regulatory uncertainty, and technological risk. You acknowledge that you are transacting with the Platform at your own risk and that SwappINR does not provide financial, investment, legal, or tax advice. You are solely responsible for evaluating the merits and risks of any transaction and for any applicable tax obligations, including under the Income-tax Act, 1961, arising from your transactions on the Platform.`,
      `Blockchain transactions are irreversible once confirmed on the underlying network. SwappINR is not responsible for losses arising from user error, including but not limited to sending assets to an incorrect address, to an unsupported network, or in an incorrect amount.`,
    ],
  },
  {
    title: '9. Limitation of Liability',
    body: [
      `To the maximum extent permitted by applicable law, SwappINR, its directors, officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of or in connection with your use of, or inability to use, the Platform, even if advised of the possibility of such damages.`,
      `Notwithstanding the foregoing, nothing in these Terms limits or excludes SwappINR's liability for fraud, willful misconduct, or gross negligence, or any other liability that cannot be excluded or limited under applicable Indian law.`,
      `SwappINR's aggregate liability arising out of or relating to these Terms or your use of the Platform shall not exceed the total fees paid by you to SwappINR in the six (6) months preceding the event giving rise to the claim.`,
    ],
  },
  {
    title: '10. Suspension & Termination',
    body: [
      `We may suspend or terminate your access to the Platform, with or without notice, where we reasonably believe you have violated these Terms, applicable law, or where required to do so by a regulatory or law-enforcement directive. Upon termination, any pending transactions will be processed, reversed, or held in accordance with applicable law and our internal compliance policies, and any unutilized balance held in your account wallet (if any) will be returned to a verified bank account or wallet address associated with your profile, subject to completion of any pending compliance review.`,
      `You may close your account at any time by submitting a request through the Platform's support channel, provided you have no pending transactions or compliance holds.`,
    ],
  },
  {
    title: '11. Force Majeure',
    body: [
      `SwappINR shall not be liable for any failure or delay in performance resulting from causes beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, civil unrest, governmental action, changes in law or regulation, blockchain network failures or congestion, banking system outages, internet or telecommunications failures, or the acts or omissions of third-party payment processors or banking partners.`,
    ],
  },
  {
    title: '12. Dispute Resolution & Governing Law',
    body: [
      `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict-of-law principles. Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or validity thereof, shall first be addressed through good-faith negotiation between the parties via our support channel.`,
      `If a dispute cannot be resolved through negotiation within thirty (30) days, it shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996, with a sole arbitrator appointed by mutual agreement of the parties. The seat and venue of arbitration shall be Mumbai, Maharashtra, India, and the language of arbitration shall be English. Subject to the foregoing, the courts at Mumbai shall have exclusive jurisdiction over any matter not subject to arbitration.`,
    ],
  },
  {
    title: '13. Severability & Entire Agreement',
    body: [
      `If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court or tribunal of competent jurisdiction, the remaining provisions shall continue in full force and effect. These Terms, together with our Privacy Policy and any order-specific terms presented at the time of a transaction, constitute the entire agreement between you and SwappINR with respect to your use of the Platform, superseding any prior agreements or understandings.`,
    ],
  },
  {
    title: '14. Contact Us',
    body: [
      `If you have any questions about these Terms, please contact our support team through the in-app support widget or by writing to us at the email address listed on the Platform's contact page. We aim to respond to all queries within two (2) business days.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 15, fontWeight: 900 }}>S</span>
          </div>
          <span style={{ color: 'var(--fr-text-primary)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
            Swapp<span style={{ color: 'var(--fr-lime)' }}>INR</span>
          </span>
        </Link>

        <h1 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', marginBottom: 40 }}>Last updated: June 23, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {SECTIONS.map(s => (
            <section key={s.title}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--fr-text-primary)', marginBottom: 10, letterSpacing: '-0.01em' }}>{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} style={{ fontSize: 14, color: 'var(--fr-text-secondary)', lineHeight: 1.8, marginBottom: 12 }}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--fr-border-subtle)' }}>
          <Link href="/" style={{ color: 'var(--fr-lime)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>← Back to SwappINR</Link>
        </div>
      </div>
    </div>
  );
}
