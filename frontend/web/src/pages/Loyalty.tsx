import { useState } from 'react';
import './shared-page.css';

type TabKey = 'bonus' | 'referral';

const mockMembers = [
  { id: 1, name: 'Ekaterina Sokolova', initials: 'ES', phone: '+7 (916) 234-56-78', points: 1850, tier: 'Gold', joined: '15 Jan 2025', lastActivity: '08 Mar 2026' },
  { id: 2, name: 'Mikhail Petrov', initials: 'MP', phone: '+7 (903) 345-67-89', points: 720, tier: 'Silver', joined: '03 Mar 2025', lastActivity: '07 Mar 2026' },
  { id: 3, name: 'Anna Volkova', initials: 'AV', phone: '+7 (926) 456-78-90', points: 2400, tier: 'Gold', joined: '22 Nov 2024', lastActivity: '05 Mar 2026' },
  { id: 4, name: 'Dmitry Novikov', initials: 'DN', phone: '+7 (985) 567-89-01', points: 310, tier: 'Bronze', joined: '10 Jul 2025', lastActivity: '01 Mar 2026' },
  { id: 5, name: 'Olga Smirnova', initials: 'OS', phone: '+7 (965) 678-90-12', points: 990, tier: 'Silver', joined: '18 Apr 2025', lastActivity: '06 Mar 2026' },
  { id: 6, name: 'Pavel Kozlov', initials: 'PK', phone: '+7 (977) 789-01-23', points: 150, tier: 'Bronze', joined: '01 Feb 2026', lastActivity: '28 Feb 2026' },
];

const tierConfig: Record<string, { cls: string; icon: string }> = {
  Bronze: { cls: 'sp-badge-orange', icon: '🥉' },
  Silver: { cls: 'sp-badge-gray', icon: '🥈' },
  Gold: { cls: 'sp-badge-teal', icon: '🥇' },
};

const referralData = [
  { id: 1, name: 'Ekaterina Sokolova', initials: 'ES', phone: '+7 (916) 234-56-78', referrals: 4, bonus: 2000, status: 'active' },
  { id: 2, name: 'Anna Volkova', initials: 'AV', phone: '+7 (926) 456-78-90', referrals: 7, bonus: 3500, status: 'active' },
  { id: 3, name: 'Olga Smirnova', initials: 'OS', phone: '+7 (965) 678-90-12', referrals: 2, bonus: 1000, status: 'active' },
  { id: 4, name: 'Mikhail Petrov', initials: 'MP', phone: '+7 (903) 345-67-89', referrals: 1, bonus: 500, status: 'pending' },
];

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Loyalty() {
  const [activeTab, setActiveTab] = useState<TabKey>('bonus');
  const [search, setSearch] = useState('');

  const filteredMembers = mockMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalMembers = mockMembers.length;
  const totalPoints = mockMembers.reduce((s, m) => s + m.points, 0);
  const redeemedThisMonth = 3200;
  const totalReferrals = referralData.reduce((s, r) => s + r.referrals, 0);

  return (
    <div className="sp-page">
      <div className="sp-header">
        <div>
          <h1>Loyalty Program</h1>
          <p>Manage bonus points, tiers and referral rewards</p>
        </div>
        <button className="sp-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Member
        </button>
      </div>

      <div className="sp-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalMembers}</div>
          <div className="sp-stat-label">Total Members</div>
          <div className="sp-stat-trend up">↑ 2 this month</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalPoints.toLocaleString()}</div>
          <div className="sp-stat-label">Active Bonus Points</div>
          <div className="sp-stat-trend up">↑ 420 pts earned today</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{redeemedThisMonth.toLocaleString()}</div>
          <div className="sp-stat-label">Redeemed This Month</div>
          <div className="sp-stat-trend up">pts redeemed</div>
        </div>
        <div className="sp-stat-card">
          <div className="sp-stat-value">{totalReferrals}</div>
          <div className="sp-stat-label">Total Referrals</div>
          <div className="sp-stat-trend up">↑ 3 this month</div>
        </div>
      </div>

      <div>
        <div className="sp-toolbar" style={{ marginBottom: 'var(--space-m)' }}>
          <div className="sp-search">
            <SearchIcon />
            <input
              placeholder="Search members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sp-table-card">
          <div className="sp-tabs">
            <button
              className={`sp-tab${activeTab === 'bonus' ? ' active' : ''}`}
              onClick={() => setActiveTab('bonus')}
            >
              Bonus Program
            </button>
            <button
              className={`sp-tab${activeTab === 'referral' ? ' active' : ''}`}
              onClick={() => setActiveTab('referral')}
            >
              Referral Program
            </button>
          </div>

          {activeTab === 'bonus' ? (
            <table className="sp-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Bonus Points</th>
                  <th>Tier</th>
                  <th>Joined</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div className="sp-patient-cell">
                        <div className="sp-avatar">{m.initials}</div>
                        <span className="sp-patient-name">{m.name}</span>
                      </div>
                    </td>
                    <td>{m.phone}</td>
                    <td style={{ fontWeight: 700 }}>{m.points.toLocaleString()} pts</td>
                    <td>
                      <span className={`sp-badge ${tierConfig[m.tier].cls}`}>
                        {tierConfig[m.tier].icon} {m.tier}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.joined}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.lastActivity}</td>
                    <td>
                      <button className="sp-action-btn">Adjust Points</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="sp-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Referrals Made</th>
                  <th>Bonus Earned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {referralData.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="sp-patient-cell">
                        <div className="sp-avatar">{r.initials}</div>
                        <span className="sp-patient-name">{r.name}</span>
                      </div>
                    </td>
                    <td>{r.phone}</td>
                    <td style={{ fontWeight: 700 }}>{r.referrals}</td>
                    <td style={{ fontWeight: 700 }}>{r.bonus.toLocaleString()} ₽</td>
                    <td>
                      <span className={`sp-badge ${r.status === 'active' ? 'sp-badge-green' : 'sp-badge-orange'}`}>
                        {r.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button className="sp-action-btn">View</button>
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
