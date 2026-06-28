import { MobileHandoff } from '@/components/kyc/mobile-handoff';

export default function KycMobileHandoffPage({ params }: { params: { token: string } }) {
  return <MobileHandoff token={params.token} />;
}
