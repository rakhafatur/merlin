import React, { useEffect, useState } from 'react';
import TopMerchantTable from '../components/TopMerchantTable';
import { fetchTopMerchants } from '../merchantengineAPI';
import './merchant-engine.css';

const DashboardPage = () => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FILTERS
  const [category, setCategory] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [region, setRegion] = useState('ALL');

  // CTA state
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [lastPromoMessage, setLastPromoMessage] = useState<string | null>(null);

  // Selected merchants
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchTopMerchants({ category, city, region }) || [];
      const formatted = data.map((m: any, idx: number) => ({
        ...m,
        rank: idx + 1,
      }));
      setMerchants(formatted);
    } catch (err) {
      console.error('fetchTopMerchants error', err);
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, city, region]);

  // SELECT merchant
  const toggleMerchantSelection = (id: string) => {
    setSelectedMerchants((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // INSIGHT SYSTEM
  const computeInsights = (list: any[]) => {
    if (!list || list.length === 0) return null;

    const topGrowth = [...list].reduce((best, cur) =>
      (best == null || (cur.predicted_growth_percent ?? -999) > (best.predicted_growth_percent ?? -999)) ? cur : best
    , null as any);

    const topMomentum = [...list].reduce((best, cur) =>
      (best == null || (cur.momentum_percent ?? -999) > (best.momentum_percent ?? -999)) ? cur : best
    , null as any);

    const catCount: Record<string, number> = {};
    list.forEach((m) => {
      const c = m.merchant_category || 'Unknown';
      catCount[c] = (catCount[c] || 0) + 1;
    });
    const dominantCategory = Object.keys(catCount).reduce((a, b) => catCount[a] >= catCount[b] ? a : b);

    const cityCount: Record<string, number> = {};
    list.forEach((m) => {
      const c = m.city || 'Unknown';
      cityCount[c] = (cityCount[c] || 0) + 1;
    });
    const dominantCity = Object.keys(cityCount).reduce((a, b) => cityCount[a] >= cityCount[b] ? a : b);

    const atRisk = list.filter((m) => (m.health_score ?? 100) < 60);

    const avgHealth = (list.reduce((s, m) => s + (m.health_score ?? 0), 0) / list.length);
    const avgMomentum = (list.reduce((s, m) => s + (m.momentum_percent ?? 0), 0) / list.length);

    const strongGrowthCount = list.filter((m) => (m.predicted_growth_percent ?? 0) >= 10).length;

    return {
      topGrowth,
      topMomentum,
      dominantCategory,
      dominantCity,
      atRisk,
      avgHealth: Number(avgHealth.toFixed(1)),
      avgMomentum: Number(avgMomentum.toFixed(1)),
      strongGrowthCount,
      total: list.length,
    };
  };

  const insights = computeInsights(merchants);

  const createPromoDraft = async () => {
    if (!insights) return;
    setCreatingPromo(true);
    setTimeout(() => {
      setCreatingPromo(false);
      setLastPromoMessage('Draft promo berhasil dibuat!');
    }, 900);
  };

  const resetFilters = () => {
    setCategory('ALL');
    setCity('ALL');
    setRegion('ALL');
  };

  if (loading)
    return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24, background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-dark)' }}>
          Popular Merchant Insights
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-dark-light)', marginTop: 6 }}>
          National Merchant Performance • Powered by MERLIN Intelligence
        </p>
      </div>

      {/* FILTER WRAPPER */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 20,
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          <option value="ALL">All Categories</option>
          <option value="F&B">F&B</option>
          <option value="Fashion">Fashion</option>
          <option value="Groceries">Groceries</option>
          <option value="Electronics">Electronics</option>
        </select>

        <select value={city} onChange={(e) => setCity(e.target.value)} style={selectStyle}>
          <option value="ALL">All Cities</option>
          <option value="Jakarta Selatan">Jakarta Selatan</option>
          <option value="Jakarta Utara">Jakarta Utara</option>
          <option value="Bandung">Bandung</option>
          <option value="Surabaya">Surabaya</option>
          <option value="Medan">Medan</option>
        </select>

        <select value={region} onChange={(e) => setRegion(e.target.value)} style={selectStyle}>
          <option value="ALL">All Regions</option>
          <option value="Jabodetabek">Jabodetabek</option>
          <option value="Jawa Barat">Jawa Barat</option>
          <option value="Jawa Timur">Jawa Timur</option>
          <option value="Sumatera Utara">Sumatera Utara</option>
        </select>

        <button
          onClick={resetFilters}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--color-blue)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>

        <div style={{ marginLeft: 'auto', color: 'var(--color-dark-light)', fontSize: 13 }}>
          Showing <strong>{merchants.length}</strong> merchants
        </div>
      </div>

      {/* INSIGHT BOX */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div
          style={{
            flex: '1 1 560px',
            background: 'linear-gradient(135deg, rgba(74,144,226,0.06), rgba(255,215,0,0.03))',
            borderRadius: 12,
            padding: 18,
            border: '1px solid rgba(74,144,226,0.12)',
            boxShadow: '0 6px 18px rgba(10,30,60,0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(180deg,#4A90E2,#3B7CD6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              AI
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-dark)' }}>
                MERLIN Insights
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-dark-light)', marginTop: 4 }}>
                Auto-generated insight based on current filters
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, color: 'var(--color-dark)' }}>
            {insights ? (
              <>
                <p><strong>{insights.topGrowth?.merchant_name || '—'}</strong> has the highest predicted growth ({insights.topGrowth?.predicted_growth_percent ?? '-'}%).</p>
                <p>Top momentum is <strong>{insights.topMomentum?.merchant_name || '—'}</strong> ({insights.topMomentum?.momentum_percent ?? '-'}%).</p>
                <p>Dominant category: <strong>{insights.dominantCategory}</strong> — Top city: <strong>{insights.dominantCity}</strong>.</p>
                <p>Average health score: <strong>{insights.avgHealth}</strong> • Avg momentum: <strong>{insights.avgMomentum}%</strong>.</p>
                <p>Strong growth merchants ≥10%: <strong>{insights.strongGrowthCount}</strong> / {insights.total}.</p>
                {insights.atRisk?.length > 0 ? (
                  <p style={{ color: 'crimson' }}>
                    At-risk merchants: <strong>{insights.atRisk.length}</strong>. Consider targeted campaigns.
                  </p>
                ) : (
                  <p style={{ color: 'green' }}>No at-risk merchants detected.</p>
                )}
              </>
            ) : (
              <p>No merchant data available for insights.</p>
            )}
          </div>

        </div>

        {/* SUMMARY CARD */}
        <div
          style={{
            width: 260,
            background: '#fff',
            borderRadius: 12,
            padding: 14,
            boxShadow: '0 6px 18px rgba(10,30,60,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--color-dark-light)', marginBottom: 10 }}>
            Quick Summary
          </div>

          <SummaryRow label="Avg Health" value={insights?.avgHealth} />
          <SummaryRow label="Avg Momentum" value={`${insights?.avgMomentum}%`} />
          <SummaryRow label="Total Merchants" value={insights?.total} />
          <SummaryRow label="Strong Growth" value={insights?.strongGrowthCount} />
          <SummaryRow label="Dominant Category" value={insights?.dominantCategory} />
          <SummaryRow label="Top City" value={insights?.dominantCity} />
        </div>
      </div>

      {/* CREATE PROMO — SELECTED MERCHANTS */}
      <div
        style={{
          marginBottom: 20,
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ fontSize: 14, color: 'var(--color-dark-light)' }}>
          Selected: <strong>{selectedMerchants.length}</strong> merchants
        </div>

        <button
          disabled={selectedMerchants.length === 0}
          onClick={() => {
            const ids = selectedMerchants.join(',');
            window.location.href = `/promo/create?merchantIds=${ids}`;
          }}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background:
              selectedMerchants.length === 0 ? 'gray' : 'linear-gradient(90deg,#4A90E2,#3B7CD6)',
            color: 'white',
            fontWeight: 700,
            cursor: selectedMerchants.length ? 'pointer' : 'not-allowed',
            boxShadow:
              selectedMerchants.length ? '0 6px 18px rgba(59,124,214,0.18)' : 'none',
          }}
        >
          Buat Promo dari Merchant Terpilih
        </button>
      </div>

      {/* TABLE */}
      <TopMerchantTable
        merchants={merchants}
        selectedMerchants={selectedMerchants}
        onToggle={toggleMerchantSelection}
      />
    </div>
  );
};

const SummaryRow = ({ label, value }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0' }}>
    <span style={{ color: 'var(--color-dark-light)' }}>{label}</span>
    <span style={{ fontWeight: 700 }}>{value ?? '-'}</span>
  </div>
);

const selectStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid rgba(74,144,226,0.12)',
  background: '#fff',
  color: 'var(--color-dark)',
  fontWeight: 500,
  cursor: 'pointer',
};

export default DashboardPage;
