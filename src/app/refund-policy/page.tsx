import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy — Order Cancellations & Refunds',
  description: "Understand SwappINR's refund and cancellation policy for USDT to INR transactions, including failed settlements and when refunds apply.",
  alternates: { canonical: '/refund-policy' },
};

const SECTIONS = [
  {
    title: '1. Nature of Transactions',
    body: [
      `SwappINR facilitates the conversion of Tether (USDT) into Indian Rupees (INR), and the settlement of INR via UPI, IMPS, NEFT, or RTGS. Once a USDT transfer is confirmed on the relevant blockchain network (BEP-20, ERC-20, or TRC-20), it is irreversible by design — no party, including SwappINR, can recall, cancel, or reverse a confirmed on-chain transaction.`,
      `Because of this, this Refund Policy should be read as a "what happens if something goes wrong" policy rather than a right to cancel a completed conversion simply because the market rate has since moved, or because you changed your mind after funds were sent.`,
    ],
  },
  {
    title: '2. Before You Send Funds',
    body: [
      `Order details — including the exchange rate, network, destination wallet address, and the INR amount you will receive — are shown for your confirmation before you initiate a transfer. You are responsible for verifying these details, including the deposit wallet address and the selected network, before sending any USDT.`,
      `You may cancel an order at no cost at any point before funds are sent. Once USDT has been transferred from your wallet, the order is treated as initiated and is subject to the terms below.`,
    ],
  },
  {
    title: '3. When a Refund Applies',
    body: [
      `A refund (return of equivalent value, in USDT or INR as applicable) will be processed where SwappINR is unable to complete your order due to a cause within our control, including but not limited to: (a) a platform error that caused an incorrect INR amount to be quoted and that amount cannot reasonably be settled; (b) a duplicate or erroneous charge caused by a technical fault on our end; or (c) failure to settle INR within the displayed timeframe for reasons attributable to SwappINR rather than your bank, UPI provider, or blockchain network congestion.`,
      `Where SwappINR cannot complete an order for a reason outside your control, we will, at our discretion, either settle the order at the originally confirmed rate once the issue is resolved, or return the equivalent value of USDT to a wallet address you provide, less any unrecoverable network gas fees already incurred.`,
    ],
  },
  {
    title: '4. When a Refund Does Not Apply',
    body: [
      `Refunds will not be issued where: (a) USDT was sent to an incorrect address, an unsupported network, or in an incorrect amount due to user error; (b) your order is delayed or held pending KYC/AML or fraud-screening checks required under applicable law; (c) your account is suspended or your transaction is frozen due to suspected violation of our Terms of Service or applicable regulation; (d) settlement is delayed due to your bank, UPI app, or payment provider's own processing times or outages; or (e) the market rate moved after your USDT was sent and you wish you had transacted at a different rate.`,
      `SwappINR is not able to recover or refund USDT sent to the wrong network or an unsupported address, as such transactions cannot be reversed on the blockchain.`,
    ],
  },
  {
    title: '5. Failed or Stuck Bank Settlements',
    body: [
      `If INR settlement fails after your USDT has been received and confirmed by SwappINR — for example due to an incorrect bank/UPI detail on file, or a rejection by your bank — we will contact you to obtain corrected payment details and re-attempt settlement at no additional cost. If correct settlement details cannot be obtained or verified within a reasonable period, the equivalent INR value will be held in your SwappINR account balance pending resolution.`,
    ],
  },
  {
    title: '6. How to Request a Refund',
    body: [
      `To request a refund or report an issue with an order, contact our support team through the in-app support chat with your order ID and a description of the issue. We aim to acknowledge all refund-related queries within 24 hours and resolve eligible cases within 7 business days, subject to the completion of any necessary compliance review.`,
    ],
  },
  {
    title: '7. Changes to This Policy',
    body: [
      `We may update this Refund Policy from time to time to reflect changes in our processes or applicable law. Material changes will be communicated to registered users via email or in-app notice. This policy should be read together with our Terms of Service.`,
    ],
  },
];

export default function RefundPolicyPage() {
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

        <h1 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>Refund Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--fr-text-tertiary)', marginBottom: 40 }}>Last updated: June 26, 2026</p>

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
