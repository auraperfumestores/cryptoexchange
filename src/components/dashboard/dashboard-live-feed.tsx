import { TxCard } from '@/components/ui/tx-card';
import { MALE_LIVE_TRADES } from '@/lib/data/live-trades';

export function DashboardLiveFeed() {
  return (
    <div
      className="fr-dash-feed"
      style={{ left: 'calc((100vw - 1180px) / 2 - 244px)' }}
      aria-hidden="true"
    >
      <div className="fr-dash-feed__track">
        {[...MALE_LIVE_TRADES, ...MALE_LIVE_TRADES].map((t, i) => (
          <TxCard key={i} trade={t} compact />
        ))}
      </div>
    </div>
  );
}
