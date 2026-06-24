import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SwapINR',
  description: 'How SwapINR collects, uses, and protects your personal data.',
};

const SECTIONS = [
  {
    title: '1. Introduction',
    body: [
      `This Privacy Policy ("Policy") describes how SwapINR ("SwapINR," "we," "us," or "our") collects, uses, discloses, retains, and protects personal data when you access or use our website, mobile interfaces, APIs, and related services (collectively, the "Platform"). This Policy is published in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 ("DPDP Act"), to the extent applicable.`,
      `By using the Platform, you consent to the collection, use, and disclosure of your personal data as described in this Policy. If you do not agree with this Policy, please discontinue use of the Platform.`,
    ],
  },
  {
    title: '2. Information We Collect',
    body: [
      `Identity & Contact Information: full name, email address, mobile number, date of birth, and residential address provided during registration or KYC.`,
      `KYC & Verification Data: Permanent Account Number (PAN), Aadhaar-linked verification data (processed via authorised verification partners; we do not store your raw Aadhaar number beyond what is required and permitted by law), bank account details, UPI Virtual Payment Addresses (VPAs), IFSC codes, selfie or liveness-check images, and government-issued identity documents.`,
      `Transaction Data: details of each USDT-to-INR conversion you initiate, including amount, exchange rate, blockchain transaction hash, wallet addresses involved, settlement bank/UPI details, timestamps, and order status.`,
      `Technical & Usage Data: IP address, device identifiers, browser type, operating system, log-in timestamps, pages visited, and approximate geolocation derived from your IP address, collected automatically through cookies and similar technologies as described in Section 7.`,
      `Communications: records of correspondence between you and our support team, including chat transcripts, emails, and call recordings (where applicable and where you have been notified of such recording).`,
    ],
  },
  {
    title: '3. How We Use Your Information',
    body: [
      `We use the information described above to: (a) create and manage your account; (b) verify your identity and perform KYC/AML checks as required under the Prevention of Money Laundering Act, 2002 and guidance issued by FIU-IND; (c) process and settle your USDT-to-INR conversion orders; (d) detect, investigate, and prevent fraud, money laundering, and other prohibited conduct; (e) communicate with you regarding your account, transactions, and customer support requests; (f) comply with legal and regulatory obligations, including responding to lawful requests from government or law-enforcement authorities; (g) improve the Platform's functionality, security, and user experience; and (h) send you service updates, security alerts, and (where you have opted in) promotional communications.`,
    ],
  },
  {
    title: '4. Legal Basis for Processing',
    body: [
      `We process your personal data on the basis of: your consent (for example, when you register or opt in to marketing communications); the necessity of processing to perform our contract with you (for example, to execute a transaction you have requested); compliance with a legal obligation (for example, KYC/AML record-keeping under the PMLA); and our legitimate interests in operating, securing, and improving the Platform, balanced against your rights and interests.`,
    ],
  },
  {
    title: '5. Sharing & Disclosure',
    body: [
      `We do not sell your personal data. We may share your information with: (a) regulated banking partners, payment gateways, and UPI/IMPS/NEFT/RTGS processing partners strictly to the extent necessary to settle your transactions; (b) identity-verification and KYC service providers engaged to validate your PAN, Aadhaar, bank, or UPI details; (c) cloud infrastructure and data-storage providers who process data on our behalf under contractual confidentiality obligations; (d) regulators, courts, law-enforcement agencies, or government authorities, where required under applicable law, court order, or to protect the rights, property, or safety of SwapINR, our users, or the public; and (e) professional advisors (legal, audit, or financial) under a duty of confidentiality, where necessary for the conduct of our business.`,
      `Any third party with whom we share personal data is contractually obligated to implement reasonable security practices and to use the data solely for the purpose for which it was shared.`,
    ],
  },
  {
    title: '6. Data Retention',
    body: [
      `We retain KYC records, transaction records, and related supporting documents for a minimum of five (5) years from the date of the transaction, or longer where required by the PMLA, FIU-IND guidance, the Income-tax Act, 1961, or any other applicable law, or where necessary to resolve disputes or enforce our agreements. Technical and usage logs are typically retained for up to twenty-four (24) months for security and fraud-prevention purposes, unless a longer period is required to investigate a specific incident.`,
      `Upon expiry of the applicable retention period, and provided no legal or regulatory obligation requires continued retention, we will securely delete or anonymize your personal data.`,
    ],
  },
  {
    title: '7. Cookies & Tracking Technologies',
    body: [
      `We use cookies, local storage, and similar technologies to: keep you signed in; remember your preferences; understand how you use the Platform; and protect the Platform from fraud and abuse (including via our content-delivery and bot-protection partner, Cloudflare). You can control or disable cookies through your browser settings; however, doing so may impair certain features of the Platform, including the ability to remain signed in.`,
    ],
  },
  {
    title: '8. Data Security',
    body: [
      `We implement reasonable technical and organizational security measures designed to protect your personal data against unauthorized access, alteration, disclosure, or destruction, including encryption of data in transit (TLS), encryption of sensitive data at rest, role-based access controls, multi-factor authentication for internal systems, and regular security reviews. Despite these measures, no system can be guaranteed to be 100% secure, and we cannot warrant the absolute security of any information you transmit to us.`,
      `In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify affected users and the relevant regulatory authority in accordance with applicable law and within the timelines prescribed thereunder.`,
    ],
  },
  {
    title: '9. Your Rights',
    body: [
      `Subject to applicable law, you have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate or incomplete data; (c) request erasure of your data, subject to our legal and regulatory retention obligations described in Section 6; (d) withdraw consent for processing that is based on consent (such as marketing communications), without affecting the lawfulness of processing carried out prior to withdrawal; (e) lodge a grievance with our Grievance Officer (Section 11); and (f) lodge a complaint with the appropriate data protection authority, where applicable.`,
      `You may exercise these rights by contacting us through the in-app support widget or the contact details listed on the Platform. We may need to verify your identity before acting on certain requests, and may decline requests that conflict with our legal or regulatory obligations.`,
    ],
  },
  {
    title: '10. International Data Transfers',
    body: [
      `Where we engage service providers located outside India (for example, certain cloud-infrastructure or communication-tooling vendors), we take reasonable steps to ensure such providers maintain a level of data protection consistent with this Policy and applicable Indian law, including through contractual safeguards.`,
    ],
  },
  {
    title: '11. Grievance Officer',
    body: [
      `In accordance with the Information Technology Act, 2000 and rules made thereunder, we have designated a Grievance Officer to address any concerns or complaints regarding the processing of your personal data. You may reach our Grievance Officer through the support contact details published on the Platform's contact page. We endeavor to acknowledge grievances within twenty-four (24) hours and resolve them within thirty (30) days.`,
    ],
  },
  {
    title: "12. Children's Privacy",
    body: [
      `The Platform is not intended for, and we do not knowingly collect personal data from, individuals under the age of eighteen (18). If we become aware that we have inadvertently collected personal data from a minor, we will take reasonable steps to delete such data promptly.`,
    ],
  },
  {
    title: '13. Changes to This Policy',
    body: [
      `We may update this Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. We will notify you of material changes via email or an in-app notice, and the "Last updated" date below will be revised accordingly. Your continued use of the Platform after such changes take effect constitutes acceptance of the revised Policy.`,
    ],
  },
  {
    title: '14. Contact Us',
    body: [
      `For any questions, concerns, or requests relating to this Privacy Policy or our data practices, please reach out via the in-app support widget or the email address listed on the Platform's contact page.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--fr-black)', color: 'var(--fr-text-primary)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--fr-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#000', fontSize: 15, fontWeight: 900 }}>S</span>
          </div>
          <span style={{ color: 'var(--fr-text-primary)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em' }}>
            Swap<span style={{ color: 'var(--fr-lime)' }}>INR</span>
          </span>
        </Link>

        <h1 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>Privacy Policy</h1>
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
          <Link href="/" style={{ color: 'var(--fr-lime)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>← Back to SwapINR</Link>
        </div>
      </div>
    </div>
  );
}
