// src/features/promo/pages/CreatePromoPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchTopMerchants } from '../../merchant_engine/merchantengineAPI';
import './CreatePromoPage.css';

type Merchant = {
  merchant_id: string;
  merchant_name: string;
  merchant_category: string;
  city: string;
  region: string;
  momentum_percent: number;
  repeat_rate_percent: number;
  customer_concentration: number;
  promo_lift_percent: number;
  predicted_growth_percent: number;
  health_score: number;
};

const MOCK_SEGMENTS = ['High Repeat', 'Low Engagement', 'New Customer'];

type Customer = {
  name: string;
  cif: string;
  accountNumber: string;
  phoneNumber: string;
  affinityScore: number;
  affinityReason: string; // alasan lebih detail (baru)
};

type SegmentTarget = {
  segment: string;
  targetCustomer: number;
  customers: Customer[];
};

type MerchantTarget = {
  merchant_id: string;
  merchant_name: string;
  segmentTargets: SegmentTarget[];
};

// --- ganti fungsi generateDummyCustomers dengan ini ---
const formatRp = (n: number) =>
  'Rp' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const generateDummyCustomers = (segment: string, count: number): Customer[] => {
  const arr: Customer[] = [];
  for (let i = 1; i <= count; i++) {
    // Affinity base on segment (kept similar)
    let affinity = 0;
    if (segment === 'High Repeat') affinity = Math.floor(Math.random() * 30) + 70;
    else if (segment === 'Low Engagement') affinity = Math.floor(Math.random() * 40) + 30;
    else if (segment === 'New Customer') affinity = Math.floor(Math.random() * 30);

    // Generate extra metrics to build a richer reason
    // frequency = jumlah transaksi dalam 90 hari
    // volume = total nominal transaksi dalam 90 hari
    // lastTxnDays = hari sejak transaksi terakhir
    const frequency = Math.max(0, Math.floor(
      (segment === 'High Repeat' ? 10 : segment === 'Low Engagement' ? 2 : 1)
      + Math.random() * (segment === 'High Repeat' ? 20 : 4)
    ));
    const avgTxn = Math.floor(
      (segment === 'High Repeat' ? 50000 : segment === 'Low Engagement' ? 30000 : 15000)
      + Math.random() * 100000
    );
    const volume = frequency * avgTxn;
    const lastTxnDays = Math.floor(Math.random() * 120); // 0..119 days ago
    const favCategoryMatch = Math.random() < (segment === 'High Repeat' ? 0.8 : 0.3); // apakah kategori merchant cocok dengan riwayat
    const recentBurst = Math.random() < 0.15; // tiba-tiba lonjakan
    const dormant = frequency === 0 || lastTxnDays > 60;

    // Build reasons array (multiple parts)
    const reasons: string[] = [];

    // Frequency part
    if (frequency >= 10) reasons.push(`${frequency} transaksi dalam 90 hari terakhir`);
    else if (frequency >= 3) reasons.push(`${frequency} transaksi (aktif) dalam 90 hari`);
    else if (frequency > 0) reasons.push(`${frequency} transaksi (jarang) dalam 90 hari`);
    else reasons.push(`Tidak ada transaksi dalam 90 hari`);

    // Volume part
    if (volume >= 2000000) reasons.push(`Total transaksi ${formatRp(volume)} dalam 90 hari`);
    else if (volume >= 500000) reasons.push(`Volume transaksi ${formatRp(volume)} (moderate)`);
    else if (volume > 0) reasons.push(`Volume ${formatRp(volume)} (low)`);

    // Last transaction recency
    if (lastTxnDays <= 7) reasons.push(`Transaksi terakhir ${lastTxnDays} hari lalu (sangat baru)`);
    else if (lastTxnDays <= 30) reasons.push(`Transaksi terakhir ${lastTxnDays} hari lalu`);
    else reasons.push(`Tidak transaksi dalam ${lastTxnDays} hari (potensi churn)`);

    // Category match & behaviour
    if (favCategoryMatch) reasons.push('Preferensi kategori merchant cocok dengan penawaran');
    if (recentBurst) reasons.push('Terdeteksi lonjakan transaksi (kampanye / event)');
    if (dormant && affinity < 40) reasons.push('Risiko churn tinggi — butuh re-engagement');

    // Affinity qualitative
    if (affinity >= 80) reasons.push('Affinity tinggi: sangat relevan untuk program retensi');
    else if (affinity >= 60) reasons.push('Affinity baik: potensi upsell');
    else if (affinity >= 40) reasons.push('Affinity sedang: butuh insentif untuk aktifkan kembali');
    else reasons.push('Affinity rendah: target dengan caution');

    // Join parts into a single human-friendly sentence (semicolon separated)
    const affinityReason = reasons.join('; ');

    arr.push({
      name: `Customer ${i}`,
      cif: `CIF${1000 + i}`,
      accountNumber: `ACC${2000 + i}`,
      phoneNumber: `0812${Math.floor(10000000 + Math.random() * 89999999)}`,
      affinityScore: affinity,
      affinityReason,
    });
  }
  return arr;
};

const CreatePromoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [merchantIds, setMerchantIds] = useState<string[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  const [promoType, setPromoType] = useState('Cashback');
  const [promoValue, setPromoValue] = useState<number>(10);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(10000);
  const [segmentCounts, setSegmentCounts] = useState<Record<string, number>>({
    'High Repeat': 30,
    'Low Engagement': 20,
    'New Customer': 50,
  });

  const [promoSummary, setPromoSummary] = useState<{
    targets: MerchantTarget[];
    totalBudget: number;
    totalCustomers: number;
  } | null>(null);

  const [currentPage, setCurrentPage] = useState<Record<string, Record<string, number>>>({});
  const [promoCreated, setPromoCreated] = useState(false);

  useEffect(() => {
    const ids = (searchParams.get('merchantIds') || '')
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    setMerchantIds(ids);
  }, [searchParams]);

  useEffect(() => {
    if (merchantIds.length === 0) {
      setMerchants([]);
      setLoading(false);
      return;
    }

    const loadMerchants = async () => {
      setLoading(true);
      try {
        const allMerchants = await fetchTopMerchants({});
        const filtered = allMerchants.filter(m => merchantIds.includes(m.merchant_id));
        setMerchants(filtered);
      } catch (err) {
        console.error(err);
        setMerchants([]);
      } finally {
        setLoading(false);
      }
    };

    loadMerchants();
  }, [merchantIds]);

  const toggleSegment = (segment: string) => {
    setSelectedSegments(prev =>
      prev.includes(segment)
        ? prev.filter(s => s !== segment)
        : [...prev, segment]
    );
  };

  const handleSegmentCountChange = (segment: string, value: number) => {
    setSegmentCounts(prev => ({ ...prev, [segment]: value }));
  };

  const calculateSegmentTargets = (merchant: Merchant): SegmentTarget[] => {
    return selectedSegments.map(segment => {
      const targetCount = segmentCounts[segment] || 0;
      const customers = generateDummyCustomers(segment, targetCount);
      return { segment, targetCustomer: targetCount, customers };
    });
  };

  const handleGenerate = () => {
    if (selectedSegments.length === 0) {
      alert('Pilih minimal 1 target segment!');
      return;
    }

    const targets: MerchantTarget[] = merchants.map(m => ({
      merchant_id: m.merchant_id,
      merchant_name: m.merchant_name,
      segmentTargets: calculateSegmentTargets(m),
    }));

    const totalCustomers = targets.reduce(
      (sum, m) => sum + m.segmentTargets.reduce((s, t) => s + t.targetCustomer, 0),
      0
    );

    const totalBudget = totalCustomers * promoValue;

    if (totalBudget > budget) {
      alert(`⚠ Budget tidak cukup. Dibutuhkan minimal ${totalBudget}`);
      setPromoSummary(null);
      return;
    }

    const pageInit: Record<string, Record<string, number>> = {};
    targets.forEach(m => {
      pageInit[m.merchant_id] = {};
      m.segmentTargets.forEach(t => {
        pageInit[m.merchant_id][t.segment] = 1;
      });
    });
    setCurrentPage(pageInit);

    setPromoSummary({ targets, totalBudget, totalCustomers });
    setPromoCreated(false);
  };

  const handleCreatePromo = () => {
    setPromoCreated(true);
    alert('Data Terkirim ke Autocashback dan Bale');
  };

  const ITEMS_PER_PAGE = 10;
  const paginate = (items: Customer[], page: number) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const handlePageChange = (merchantId: string, segment: string, delta: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [merchantId]: {
        ...prev[merchantId],
        [segment]: Math.max(1, (prev[merchantId][segment] || 1) + delta),
      },
    }));
  };

  if (loading) return <div className="cpp-loading">Loading merchants...</div>;
  if (merchants.length === 0)
    return (
      <div className="cpp-no-merchants">
        No merchants found for IDs: {merchantIds.join(', ')}
      </div>
    );

  const estimatedImpact =
    merchants.reduce((sum, m) => sum + (m.predicted_growth_percent ?? 0), 0) /
    merchants.length;

  return (
    <div className="cpp-page-wrapper">
      <div className="cpp-header">
        <h2>Create Targeted Promo</h2>
        <p>Configure customer and promo for selected merchants • Powered by MERLIN Intelligence</p>
      </div>

      <div className="cpp-merchants-grid">
        {merchants.map(m => (
          <div key={m.merchant_id} className="cpp-merchant-card">
            <h4>{m.merchant_name}</h4>
            <div className="cpp-merchant-info">
              <span>{m.merchant_category}</span>
              <span>{m.city}</span>
              <span>Health: {m.health_score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FORM INPUT */}
      <div className="cpp-create-promo-form">
        <label>
          Promo Type:
          <select value={promoType} onChange={e => setPromoType(e.target.value)}>
            <option value="Cashback">Cashback Nominal</option>
            <option value="Discount">Cashback Percent</option>
          </select>
        </label>

        <label>
          Promo Value ({promoType === 'Discount' ? '%' : 'Amount'}):
          <input
            type="number"
            value={promoValue}
            onChange={e => setPromoValue(Number(e.target.value))}
          />
        </label>

        <label>
          Budget:
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
          />
        </label>

        <div className="cpp-segments">
          <div className="cpp-segments-title">Target Customer Segments:</div>
          <div className="cpp-segments-list">
            {MOCK_SEGMENTS.map(segment => (
              <div key={segment} className="cpp-segment-input-wrapper">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedSegments.includes(segment)}
                    onChange={() => toggleSegment(segment)}
                  />
                  {segment}
                </label>
                {selectedSegments.includes(segment) && (
                  <input
                    type="number"
                    value={segmentCounts[segment] || 0}
                    min={0}
                    onChange={e => handleSegmentCountChange(segment, Number(e.target.value))}
                    placeholder="Jumlah Nasabah"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="cpp-impact">
          <strong>Estimated Impact:</strong> {estimatedImpact.toFixed(1)}% growth
        </div>

        <button className="cpp-submit" onClick={handleGenerate}>
          Generate Target Customers
        </button>
      </div>

      {/* PROMO SUMMARY & CREATE PROMO BUTTON */}
      {promoSummary && (
        <>
          <div className="cpp-promo-summary">
            <h3>Promo Summary</h3>
            <p>
              Total Budget: <strong>{promoSummary.totalBudget}</strong> | Total Customers: <strong>{promoSummary.totalCustomers}</strong>
            </p>
            <div className="cpp-summary-grid">
              {promoSummary.targets.map(m => (
                <div key={m.merchant_id} className="cpp-summary-card">
                  <h4>{m.merchant_name}</h4>
                  {m.segmentTargets.map(t => {
                    const page = currentPage[m.merchant_id][t.segment];
                    const pageItems = paginate(t.customers, page);
                    const totalPages = Math.ceil(t.customers.length / ITEMS_PER_PAGE);

                    return (
                      <div key={t.segment} className="cpp-segment-table-wrapper">
                        <strong>{t.segment}</strong> ({t.targetCustomer} customers)
                        <table className="cpp-customer-table">
                          <thead>
                            <tr>
                              <th>No</th>
                              <th>Nama Nasabah</th>
                              <th>CIF</th>
                              <th>No. Rekening</th>
                              <th>No. Telepon</th> {/* tambah nomor telepon */}
                              <th>Affinity Score</th>
                              <th>Affinity Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageItems.map((c, i) => (
                              <tr key={c.cif}>
                                <td>{(page - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                <td>{c.name}</td>
                                <td>{c.cif}</td>
                                <td>{c.accountNumber}</td>
                                <td>{c.phoneNumber}</td> {/* tampilkan nomor telepon */}
                                <td>{c.affinityScore}</td>
                                <td style={{ maxWidth: 360, whiteSpace: 'normal', wordBreak: 'break-word' }}>{c.affinityReason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {totalPages > 1 && (
                          <div className="cpp-pagination">
                            <button disabled={page <= 1} onClick={() => handlePageChange(m.merchant_id, t.segment, -1)}>Prev</button>
                            <span>Page {page} / {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => handlePageChange(m.merchant_id, t.segment, 1)}>Next</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* CREATE PROMO BUTTON BAWAH SUMMARY */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button className="cpp-submit" onClick={handleCreatePromo}>
              Create Promo
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreatePromoPage;
