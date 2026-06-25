export interface LiveTrade {
  name: string;
  amount: string;
  txid: string;
  network: string;
  time: string;
  color: 'teal' | 'purple' | 'green' | 'pink' | 'blue';
  nameColor: string;
}

export const LIVE_TRADES: LiveTrade[] = [
  { name: 'Raj***', amount: '₹42,500',  txid: 'TXN***4521', network: 'BEP-20', time: '1 min ago',  color: 'teal',   nameColor: '#00D4C8' },
  { name: 'Pri***', amount: '₹18,750',  txid: 'TXN***8832', network: 'TRC-20', time: '2 min ago',  color: 'purple', nameColor: '#9B5DE5' },
  { name: 'Vik***', amount: '₹75,000',  txid: 'TXN***2219', network: 'ERC-20', time: '3 min ago',  color: 'green',  nameColor: '#22C55E' },
  { name: 'Anu***', amount: '₹33,200',  txid: 'TXN***6670', network: 'BEP-20', time: '4 min ago',  color: 'pink',   nameColor: '#F72585' },
  { name: 'Sam***', amount: '₹91,000',  txid: 'TXN***3344', network: 'TRC-20', time: '5 min ago',  color: 'blue',   nameColor: '#3B82F6' },
  { name: 'Dev***', amount: '₹27,800',  txid: 'TXN***7751', network: 'BEP-20', time: '6 min ago',  color: 'teal',   nameColor: '#00D4C8' },
  { name: 'Kav***', amount: '₹55,600',  txid: 'TXN***9983', network: 'ERC-20', time: '7 min ago',  color: 'purple', nameColor: '#9B5DE5' },
  { name: 'Rah***', amount: '₹12,450',  txid: 'TXN***1127', network: 'TRC-20', time: '8 min ago',  color: 'green',  nameColor: '#22C55E' },
  { name: 'Moh***', amount: '₹68,900',  txid: 'TXN***5566', network: 'BEP-20', time: '9 min ago',  color: 'pink',   nameColor: '#F72585' },
  { name: 'Nis***', amount: '₹24,300',  txid: 'TXN***4488', network: 'ERC-20', time: '10 min ago', color: 'blue',   nameColor: '#3B82F6' },
  { name: 'Tan***', amount: '₹87,500',  txid: 'TXN***2295', network: 'TRC-20', time: '11 min ago', color: 'teal',   nameColor: '#00D4C8' },
  { name: 'She***', amount: '₹46,750',  txid: 'TXN***7743', network: 'BEP-20', time: '12 min ago', color: 'purple', nameColor: '#9B5DE5' },
  { name: 'Arp***', amount: '₹15,800',  txid: 'TXN***3311', network: 'ERC-20', time: '13 min ago', color: 'green',  nameColor: '#22C55E' },
  { name: 'Kir***', amount: '₹62,000',  txid: 'TXN***8899', network: 'TRC-20', time: '14 min ago', color: 'pink',   nameColor: '#F72585' },
  { name: 'Man***', amount: '₹38,400',  txid: 'TXN***6622', network: 'BEP-20', time: '15 min ago', color: 'blue',   nameColor: '#3B82F6' },
  { name: 'Poo***', amount: '₹99,200',  txid: 'TXN***1144', network: 'ERC-20', time: '16 min ago', color: 'teal',   nameColor: '#00D4C8' },
];
