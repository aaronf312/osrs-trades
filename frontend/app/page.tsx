'use client';
import { useState, useEffect } from 'react';

interface FlipItem {
  name: string;
  margin: number;
  volume: number;
  roi: number;
  ev: number;
}

export default function Home() {
  const [items, setItems] = useState<FlipItem[]>([]);
  const [sortBy, setSortBy] = useState<string>('roi');

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/flips/roi?sort_by=${sortBy}`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error('Fetch error:', err));
  }, [sortBy]);

  return (
    <main style={{ padding: '40px', background: '#121212', color: '#e0e0e0', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>OSRS GE Flipping Screener</h1>

      <div style={{ margin: '20px 0' }}>
        <span style={{ marginRight: '10px' }}>Sort by:</span>
        <button onClick={() => setSortBy('roi')} style={{ marginRight: '8px', padding: '6px 12px', cursor: 'pointer' }}>ROI</button>
        <button onClick={() => setSortBy('margin')} style={{ marginRight: '8px', padding: '6px 12px', cursor: 'pointer' }}>Margin</button>
        <button onClick={() => setSortBy('volume')} style={{ padding: '6px 12px', cursor: 'pointer' }}>Volume</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Item</th>
            <th style={{ padding: '10px' }}>Margin (gp)</th>
            <th style={{ padding: '10px' }}>Volume</th>
            <th style={{ padding: '10px' }}>ROI (%)</th>
            <th style={{ padding: '10px' }}>EV (gp)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '10px' }}>{item.name}</td>
              <td style={{ padding: '10px' }}>{item.margin.toLocaleString()}</td>
              <td style={{ padding: '10px' }}>{item.volume.toLocaleString()}</td>
              <td style={{ padding: '10px' }}>{item.roi.toFixed(2)}%</td>
              <td style={{ padding: '10px' }}>{item.ev.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}