import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './shared-page.css';

type TabKey = 'tiers' | 'rules';

const tierConfig: Record<string, { cls: string; icon: string }> = {
  Bronze: { cls: 'sp-badge-orange', icon: '🥉' },
  Silver: { cls: 'sp-badge-gray', icon: '🥈' },
  Gold:   { cls: 'sp-badge-teal', icon: '🥇' },
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default function Loyalty() {
  const [activeTab, setActiveTab] = useState<TabKey>('tiers');
  const [tiers, setTiers] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get('/finance/loyalty-tiers'),
      api.get('/finance/bonus-rules'),
    ]).then(([tiersRes, rulesRes]: any[]) => {
      setTiers(Array.isArray(tiersRes) ? tiersRes : (tiersRes?.data ?? []));
      setRules(Array.isArray(rulesRes) ? rulesRes : (rulesRes?.data ?? []));
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const filteredTiers = tiers.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRules = rules.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Loyalty Program</h1>
          <p>Manage bonus tiers and earning rules for your clinic</p>
        </div>
        <button className="sp-btn-primary">
          <PlusIcon />
          {activeTab === 'tiers' ? 'Add Tier' : 'Add Rule'}
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{tiers.length}</div>
          <div className="sp-stat-label">Loyalty Tiers</div>
          <div className="sp-stat-trend up">Active tiers</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{rules.length}</div>
          <div className="sp-stat-label">Bonus Rules</div>
          <div className="sp-stat-trend up">Earning rules configured</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{rules.filter(r => r.isActive).length}</div>
          <div className="sp-stat-label">Active Rules</div>
          <div className="sp-stat-trend up">Currently active</div>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <div className="sp-tabs">
            <button className={`sp-tab${activeTab === 'tiers' ? ' active' : ''}`} onClick={() => setActiveTab('tiers')}>
              Loyalty Tiers
            </button>
            <button className={`sp-tab${activeTab === 'rules' ? ' active' : ''}`} onClick={() => setActiveTab('rules')}>
              Bonus Rules
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: 'var(--space-l)', color: 'var(--text-secondary)', fontSize: '13px' }}>Loading...</div>
          ) : activeTab === 'tiers' ? (
            <table className="sp-table">
              <thead>
                <tr>
                  <th>Tier Name</th>
                  <th>Min Points</th>
                  <th>Bonus %</th>
                  <th>Discount %</th>
                  <th>Color</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTiers.length === 0 ? (
                  <tr><td colSpan={6} className="sp-empty">No loyalty tiers configured</td></tr>
                ) : filteredTiers.map(tier => (
                  <tr key={tier.id}>
                    <td style={{ fontWeight: 600 }}>
                      {tierConfig[tier.name]?.icon ?? '⭐'} {tier.name}
                    </td>
                    <td>{(tier.minPoints ?? 0).toLocaleString()} pts</td>
                    <td style={{ color: 'var(--color-teal-500)', fontWeight: 600 }}>
                      {tier.bonusPercent ?? 0}%
                    </td>
                    <td style={{ color: 'var(--accent-coral)', fontWeight: 600 }}>
                      {tier.discountPercent ?? 0}%
                    </td>
                    <td>
                      {tier.color && (
                        <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: tier.color, border: '1px solid rgba(0,0,0,0.1)' }} />
                      )}
                    </td>
                    <td>
                      <button className="sp-action-btn">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="sp-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Type</th>
                  <th>Earn Rate</th>
                  <th>Min Purchase</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.length === 0 ? (
                  <tr><td colSpan={6} className="sp-empty">No bonus rules configured</td></tr>
                ) : filteredRules.map(rule => (
                  <tr key={rule.id}>
                    <td style={{ fontWeight: 500 }}>{rule.name}</td>
                    <td>
                      <span className="sp-badge sp-badge-blue">{rule.ruleType ?? 'PURCHASE'}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{rule.earnRate ?? 0} pts / 100₽</td>
                    <td>{rule.minPurchaseAmount ? `${Number(rule.minPurchaseAmount).toLocaleString()} ₽` : '—'}</td>
                    <td>
                      <span className={`sp-badge ${rule.isActive ? 'sp-badge-green' : 'sp-badge-gray'}`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="sp-action-btn">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
