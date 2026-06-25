import { TxCard } from '@/components/ui/tx-card';
import { LIVE_TRADES } from '@/lib/data/live-trades';

export function DashboardLiveFeed() {
  return (
    <div
      className="fr-dash-feed"
      style={{ left: 'calc((100vw - 1180px) / 2 - 244px)' }}
      aria-hidden="true"
    >
      <div className="fr-dash-feed__track">
        {[...LIVE_TRADES, ...LIVE_TRADES].map((t, i) => (
          <TxCard key={i} trade={t} compact />
        ))}
      </div>
    </div>
  );
}
