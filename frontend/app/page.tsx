'use client';
import { useState, useEffect } from 'react';

interface FlipItem {
  name: string;
  margin: number;
  volume: number;
  roi: number;
  ev: number;
  price: number;
}

export default function Home() {
  const [items, setItems] = useState<FlipItem[]>([]);
  const [sortBy, setSortBy] = useState<string>('roi');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/flips/roi?sort_by=${sortBy}`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error('Fetch error:', err));

    fetch('http://127.0.0.1:8000/api/flips/last-updated')
      .then((res) => res.json())
      .then((data) => setLastUpdated(data.last_updated))
      .catch((err) => console.error('Error fetching timestamp:', err));
  }, [sortBy]);

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>OSRS GE Screener</h1>
            <p style={styles.subtitle}>High-margin Grand Exchange intelligence</p>
          </div>
          <div style={styles.timestampBadge}>
            <span style={styles.pulseDot}></span>
            <span>Synced: {lastUpdated || 'Loading...'}</span>
          </div>
        </header>

        <div style={styles.toolbar}>
          <div style={styles.sortGroup}>
            <span style={styles.sortLabel}>Sort By:</span>
            {(['roi', 'margin', 'volume', 'ev'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSortBy(metric)}
                style={{
                  ...styles.sortButton,
                  ...(sortBy === metric ? styles.sortButtonActive : {}),
                }}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Asset</th>
                <th
                  style={styles.thRightWithTooltip}
                  onMouseEnter={() => setActiveTooltip('margin')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  Margin
                  {activeTooltip === 'margin' && (
                    <span style={styles.tooltip}>Raw profit spread in gp</span>
                  )}
                </th>

                <th
                  style={styles.thRightWithTooltip}
                  onMouseEnter={() => setActiveTooltip('volume')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  24H Volume
                  {activeTooltip === 'volume' && (
                    <span style={styles.tooltip}>24h traded volume</span>
                  )}
                </th>

                <th
                  style={styles.thRightWithTooltip}
                  onMouseEnter={() => setActiveTooltip('roi')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  ROI
                  {activeTooltip === 'roi' && (
                    <span style={styles.tooltip}>Return on Investment percentage</span>
                  )}
                </th>

                <th
                  style={styles.thRightWithTooltip}
                  onMouseEnter={() => setActiveTooltip('ev')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  EV Score
                  {activeTooltip === 'ev' && (
                    <span style={styles.tooltip}>Volume-weighted profit potential</span>
                  )}
                </th>

                <th
                  style={styles.thRightWithTooltip}
                  onMouseEnter={() => setActiveTooltip('price')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  Price
                  {activeTooltip === 'price' && (
                    <span style={styles.tooltip}>Instant-sell low price (target buy-in)</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.emptyRow}>
                    Querying price engine...
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={i} style={styles.trBody}>
                    <td style={styles.tdItem}>{item.name}</td>
                    <td style={styles.tdRightNum}>{item.margin.toLocaleString()} gp</td>
                    <td style={styles.tdRightNum}>{item.volume.toLocaleString()}</td>
                    <td style={styles.tdRoi}>{item.roi.toFixed(2)}%</td>
                    <td style={styles.tdEv}>{item.ev.toLocaleString()}</td>
                    <td style={styles.tdPrice}>{item.price.toLocaleString()} gp</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#0d0b0a', // Deep charcoal/black void
    color: '#ff981f', // Classic RuneScape gold/orange text primary
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '40px 20px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    borderBottom: '2px solid #2d251e', // Mahogany wood trim feel
    paddingBottom: '20px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: '#ffc107', // Bright quest-log gold
    margin: '0 0 4px 0',
    textShadow: '1px 1px #000000',
  },
  subtitle: {
    fontSize: '13px',
    color: '#b0a8a0', // Muted parchment gray
    margin: 0,
  },
  timestampBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#16120e',
    border: '1px solid #3d3127',
    padding: '8px 14px',
    borderRadius: '4px', // Sharp corners match classic RS inventory boxes
    fontSize: '13px',
    color: '#d1c7bc',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#00ff00', // Classic status green
    borderRadius: '50%',
    boxShadow: '0 0 6px rgba(0, 255, 0, 0.6)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sortGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sortLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#b0a8a0',
    marginRight: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  sortButton: {
    backgroundColor: '#1b1612',
    color: '#a39e93',
    border: '1px solid #3d3127',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  sortButtonActive: {
    backgroundColor: '#3d3127',
    color: '#ffc107',
    border: '1px solid #ffc107',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
  },
  tableCard: {
    backgroundColor: '#16120e',
    border: '2px solid #2d251e',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    textAlign: 'left' as const,
  },
  trHead: {
    borderBottom: '2px solid #2d251e',
    backgroundColor: '#1b1612',
  },
  th: {
    padding: '14px 20px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#ff981f',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  thRightWithTooltip: {
    padding: '14px 20px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#ff981f',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    textAlign: 'right' as const,
    position: 'relative' as const,
    cursor: 'help',
  },
  tooltip: {
    position: 'absolute' as const,
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '6px',
    backgroundColor: '#1b1612',
    color: '#ffc107',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 400,
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.9)',
    border: '1px solid #3d3127',
    zIndex: 10,
    textTransform: 'none' as const,
  },
  trBody: {
    borderBottom: '1px solid #221b16',
    transition: 'background-color 0.1s ease',
  },
  tdItem: {
    padding: '16px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
  },
  tdRightNum: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#d1c7bc',
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  tdRoi: {
    padding: '16px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#00ff00',
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  tdEv: {
    padding: '16px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#00bfff',
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  tdPrice: {
    padding: '16px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffc107', // Gold for gp values
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  },
  emptyRow: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#b0a8a0',
    fontSize: '14px',
  },
};