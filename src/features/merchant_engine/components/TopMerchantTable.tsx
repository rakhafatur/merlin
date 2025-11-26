import React from 'react';

type Merchant = {
  merchant_id: string;
  merchant_name: string;
  merchant_category: string;
  city: string;
  region: string;
  rank: number;
  momentum_percent: number;
  repeat_rate_percent: number;
  customer_concentration: number;
  predicted_growth_percent: number;
  health_score: number;
};

type TopMerchantTableProps = {
  merchants: Merchant[];
  selectedMerchants: string[];
  onToggle: (id: string) => void;
};

const TopMerchantTable: React.FC<TopMerchantTableProps> = ({
  merchants,
  selectedMerchants,
  onToggle,
}) => {
  const maxHealth = Math.max(...merchants.map((m) => m.health_score), 1);
  const maxMomentum = Math.max(...merchants.map((m) => m.momentum_percent), 1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: 'var(--color-blue-light)',
        }}
      >
        <thead style={{ backgroundColor: 'var(--color-blue)', color: 'white' }}>
          <tr>
            <th style={th}>Select</th>
            <th style={th}>Merchant</th>
            <th style={th}>Category</th>
            <th style={th}>City</th>
            <th style={th}>Region</th>
            <th style={th}>Rank</th>
            <th style={th}>Momentum</th>
            <th style={th}>Repeat Rate</th>
            <th style={th}>Concentration</th>
            <th style={th}>Predicted Growth</th>
            <th style={th}>Health Score</th>
          </tr>
        </thead>

        <tbody>
          {merchants.map((m, i) => (
            <tr
              key={m.merchant_id}
              style={{
                backgroundColor:
                  i % 2 === 0 ? 'var(--color-blue-light)' : 'var(--color-bg)',
              }}
            >
              {/* CHECKBOX */}
              <td style={td}>
                <input
                  type="checkbox"
                  checked={selectedMerchants.includes(m.merchant_id)}
                  onChange={() => onToggle(m.merchant_id)}
                />
              </td>

              <td style={td}>{m.merchant_name}</td>
              <td style={td}>{m.merchant_category}</td>
              <td style={td}>{m.city}</td>
              <td style={td}>{m.region}</td>
              <td style={td}>{m.rank}</td>

              {/* MOMENTUM BAR */}
              <td style={{ padding: 8, minWidth: 180 }}>
                <strong>{m.momentum_percent}%</strong>
                <div style={momentumBase}>
                  <div
                    style={{
                      ...momentumFill,
                      width: `${(m.momentum_percent / maxMomentum) * 100}%`,
                    }}
                  />
                </div>
              </td>

              <td style={td}>{m.repeat_rate_percent}%</td>
              <td style={td}>{m.customer_concentration}%</td>

              {/* GROWTH PILL */}
              <td style={td}>
                <span style={growthPill}>{m.predicted_growth_percent}%</span>
              </td>

              {/* HEALTH SCORE BAR */}
              <td style={{ padding: 8 }}>
                <strong>{m.health_score}</strong>
                <div style={healthBase}>
                  <div
                    style={{
                      ...healthFill,
                      width: `${(m.health_score / maxHealth) * 100}%`,
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const th: React.CSSProperties = {
  padding: '12px 8px',
  fontWeight: 700,
  fontSize: 13,
};

const td: React.CSSProperties = {
  padding: '8px',
  fontSize: 13,
  fontWeight: 500,
};

// Bars
const momentumBase: React.CSSProperties = {
  width: 150,
  backgroundColor: '#cae8ff',
  height: 10,
  borderRadius: 5,
  marginTop: 4,
};
const momentumFill: React.CSSProperties = {
  height: '100%',
  borderRadius: 5,
  background: '#4db7ff',
  minWidth: '5%',
};

const healthBase: React.CSSProperties = {
  width: 140,
  backgroundColor: '#ffe6c2',
  height: 10,
  borderRadius: 5,
  marginTop: 4,
};
const healthFill: React.CSSProperties = {
  height: '100%',
  borderRadius: 5,
  background: '#ffb84d',
  minWidth: '5%',
};

// Growth Pill
const growthPill: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 8,
  backgroundColor: '#fff3d1',
  color: '#b88a00',
  fontWeight: 600,
};

export default TopMerchantTable;
