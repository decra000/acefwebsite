import React, { useState, useEffect } from 'react';
import { 
  Heart, Star, Trophy, Gift, Users, 
  ChevronLeft, ChevronRight, Sparkles,
  Crown, Award, Medal
} from 'lucide-react';

const DonorWall = ({ API_BASE = '/api' }) => {
  const [donors, setDonors] = useState([]);
  const [anonymousData, setAnonymousData] = useState({ count: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState('all'); // all, recent, featured
  const donorsPerPage = 12;

  // FIXED: Fetch donor wall data
  const fetchDonorWall = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/donations/donor-wall?limit=100`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        const completedDonors = data.data.donors || [];
        
        // Debug logging
        console.log('Donor wall data received:', {
          donorsCount: completedDonors.length,
          anonymousData: data.data.anonymous,
          sampleDonor: completedDonors[0]
        });
        
        setDonors(completedDonors);
        setAnonymousData(data.data.anonymous || { count: 0, totalAmount: 0 });
        
        console.log(`Loaded ${completedDonors.length} completed donors for wall display`);
      } else {
        console.error('API returned success: false', data);
        setDonors([]);
        setAnonymousData({ count: 0, totalAmount: 0 });
      }
    } catch (error) {
      console.error('Error fetching donor wall data:', error);
      setDonors([]);
      setAnonymousData({ count: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Filter donors based on selected filter
  const getFilteredDonors = () => {
    let filtered = [...donors];
    
    switch (filter) {
      case 'featured':
        filtered = filtered.filter(donor => donor.is_featured);
        break;
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(donor => {
          const donationDate = new Date(donor.donation_date || donor.created_at);
          return donationDate > thirtyDaysAgo;
        });
        break;
      default:
        // 'all' - backend already filters for completed, no additional filtering needed
        break;
    }
    
    return filtered;
  };

  useEffect(() => {
    fetchDonorWall();
  }, []);

  const filteredDonors = getFilteredDonors();
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);
  const currentDonors = filteredDonors.slice(
    currentPage * donorsPerPage,
    (currentPage + 1) * donorsPerPage
  );

  // Get badge for donation amount
  const getDonorBadge = (amount) => {
    if (amount >= 1000) return { icon: Crown, color: '#8B5CF6', tier: 'Platinum', glow: true };
    if (amount >= 500) return { icon: Trophy, color: '#F59E0B', tier: 'Gold', glow: true };
    if (amount >= 100) return { icon: Award, color: '#6B7280', tier: 'Silver', glow: false };
    return { icon: Medal, color: '#CD7F32', tier: 'Bronze', glow: false };
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const nextPage = () => {
    setCurrentPage(prev => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  if (loading) {
    return (
      <div className="donor-wall loading">
        <style jsx>{`
          .donor-wall.loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          .loading-spinner {
            text-align: center;
            color: #6b7280;
          }
          .loading-spinner svg {
            animation: spin 2s linear infinite;
            color: #0a451c;
            margin-bottom: 16px;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-spinner">
          <Sparkles size={40} />
          <p>Loading our amazing donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-wall">
      <style jsx>{`
        .donor-wall {
          padding: 40px 20px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          min-height: 500px;
        }

        .wall-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .wall-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0a451c;
          margin: 0 0 16px 0;
          position: relative;
        }

        .wall-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, #facf3c, #9ccf9f);
          border-radius: 2px;
        }

        .wall-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0 0 32px 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .completed-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #d1fae5;
          color: #065f46;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          margin-left: 12px;
        }

        .wall-stats {
          display: flex;
          justify-content: center;
          gap: 48px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #0a451c;
          display: block;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .filter-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 8px 20px;
          border: 2px solid transparent;
          border-radius: 25px;
          background: white;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-tab.active {
          background: #0a451c;
          color: white;
          border-color: #0a451c;
        }

        .filter-tab:hover:not(.active) {
          background: #f3f4f6;
          border-color: #e5e7eb;
        }

        .donors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
          min-height: 400px;
        }

        .donor-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          border: 2px solid transparent;
        }

        .donor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          border-color: #9ccf9f;
        }

        .donor-card.featured {
          background: linear-gradient(135deg, #fff7ed, #fef3c7);
          border-color: #facf3c;
        }

        .donor-card.featured::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-top: 20px solid #facf3c;
        }

        .donor-card.featured::after {
          content: '⭐';
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 12px;
        }

        .donor-card.completed::before {
          content: '✅';
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 14px;
          z-index: 1;
        }

        .donor-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin: 0 auto 16px;
          position: relative;
        }

        .donor-badge.glow {
          animation: glow 2s ease-in-out infinite alternate;
        }

        .donor-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
          margin: 0 0 8px 0;
        }

        .donor-amount {
          font-size: 1rem;
          font-weight: 500;
          color: #059669;
          text-align: center;
          margin: 0 0 8px 0;
        }

        .donor-date {
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
          margin: 0 0 12px 0;
        }

        .donor-tier {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 auto;
          background: #f3f4f6;
          color: #6b7280;
        }

        .anonymous-card {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          position: relative;
          overflow: hidden;
        }

        .anonymous-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.05) 10px,
            rgba(255, 255, 255, 0.05) 20px
          );
          animation: slide 20s linear infinite;
        }

        .anonymous-content {
          position: relative;
          z-index: 1;
        }

        .anonymous-icon {
          margin-bottom: 16px;
          opacity: 0.9;
        }

        .anonymous-count {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .anonymous-label {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0 0 8px 0;
        }

        .anonymous-total {
          font-size: 0.875rem;
          opacity: 0.7;
          margin: 0;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 32px;
        }

        .page-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 2px solid #e5e7eb;
          border-radius: 50%;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-button:hover {
          background: #0a451c;
          color: white;
          border-color: #0a451c;
        }

        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-button:disabled:hover {
          background: white;
          color: #6b7280;
          border-color: #e5e7eb;
        }

        .page-info {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin: 0 0 16px 0;
          color: #374151;
        }

        .empty-state p {
          font-size: 1rem;
          margin: 0;
        }

        .debug-info {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          font-family: monospace;
          font-size: 12px;
        }

        @keyframes glow {
          from {
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
          }
          to {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.6);
          }
        }

        @keyframes slide {
          0% { transform: translateX(-50px) translateY(-50px); }
          100% { transform: translateX(50px) translateY(50px); }
        }

        @media (max-width: 768px) {
          .donor-wall {
            padding: 24px 16px;
          }

          .wall-title {
            font-size: 2rem;
          }

          .wall-stats {
            gap: 24px;
          }

          .donors-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
          }

          .donor-card {
            padding: 20px;
          }

          .filter-tabs {
            gap: 4px;
          }

          .filter-tab {
            padding: 6px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .donors-grid {
            grid-template-columns: 1fr;
          }

          .wall-stats {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>

      <div className="wall-header">
        <h2 className="wall-title">
          Our Amazing Donors
          <span className="completed-badge">
            <Trophy size={12} />
            Completed Donations
          </span>
        </h2>
        <p className="wall-subtitle">
          These generous individuals have completed their donations and are making a real difference in African communities. 
          Thank you for your support and belief in our mission!
        </p>

        <div className="wall-stats">
          <div className="stat-item">
            <span className="stat-number">{donors.length + anonymousData.count}</span>
            <span className="stat-label">Completed Donors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{donors.length}</span>
            <span className="stat-label">Public Donors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{anonymousData.count}</span>
            <span className="stat-label">Anonymous</span>
          </div>
        </div>

        {/* DEBUG: Show what data we received */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            <strong>Debug Info:</strong><br />
            Donors array length: {donors.length}<br />
            Anonymous count: {anonymousData.count}<br />
            Sample donor: {JSON.stringify(donors[0] || 'none', null, 2)}
          </div>
        )}
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setFilter('all');
            setCurrentPage(0);
          }}
        >
          <Users size={16} />
          All Completed
        </button>
        <button
          className={`filter-tab ${filter === 'featured' ? 'active' : ''}`}
          onClick={() => {
            setFilter('featured');
            setCurrentPage(0);
          }}
        >
          <Star size={16} />
          Featured
        </button>
        <button
          className={`filter-tab ${filter === 'recent' ? 'active' : ''}`}
          onClick={() => {
            setFilter('recent');
            setCurrentPage(0);
          }}
        >
          <Sparkles size={16} />
          Recent
        </button>
      </div>

      {filteredDonors.length === 0 && anonymousData.count === 0 ? (
        <div className="empty-state">
          <h3>No completed donations yet</h3>
          <p>Completed donations will appear here once processing is finished!</p>
          
          {/* DEBUG: Show what we tried to fetch */}
          {process.env.NODE_ENV === 'development' && (
            <div className="debug-info">
              API endpoint: {`${API_BASE}/donations/donor-wall?limit=100`}<br />
              Check browser console for API response details.
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="donors-grid">
            {/* Anonymous donor card (only show on first page) */}
            {currentPage === 0 && anonymousData.count > 0 && (
              <div className="donor-card anonymous-card">
                <div className="anonymous-content">
                  <div className="anonymous-icon">
                    <Users size={32} />
                  </div>
                  <h3 className="anonymous-count">{anonymousData.count}</h3>
                  <p className="anonymous-label">Anonymous Donors</p>
                  <p className="anonymous-total">
                    Total: {formatAmount(anonymousData.totalAmount)}
                  </p>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    Completed Donations
                  </div>
                </div>
              </div>
            )}

            {/* FIXED: Regular donor cards with correct field mapping */}
            {currentDonors.map((donor, index) => {
              const badge = getDonorBadge(donor.donation_amount);
              const BadgeIcon = badge.icon;
              const isCompleted = donor.status === 'completed' || donor.donation_status === 'completed';

              return (
                <div 
                  key={`${donor.donation_id}-${index}`}
                  className={`donor-card ${donor.is_featured ? 'featured' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div 
                    className={`donor-badge ${badge.glow ? 'glow' : ''}`}
                    style={{ backgroundColor: `${badge.color}20`, border: `2px solid ${badge.color}` }}
                  >
                    <BadgeIcon size={24} color={badge.color} />
                  </div>

                  <h3 className="donor-name">
                    {donor.is_anonymous ? 'Anonymous Friend' : donor.donor_name}
                  </h3>
                  <p className="donor-amount">{formatAmount(donor.donation_amount)}</p>
                  <p className="donor-date">
                    {formatDate(donor.donation_date || donor.completed_at || donor.created_at)}
                  </p>
                  
                  <div className="donor-tier" style={{ color: badge.color, backgroundColor: `${badge.color}15` }}>
                    {badge.tier} Donor
                  </div>

                  {isCompleted && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#059669',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      ✓ Donation Completed
                    </div>
                  )}
                </div>
              );
            })}

            {/* Fill empty slots to maintain grid layout */}
            {currentDonors.length < donorsPerPage && currentDonors.length > 0 && (
              Array.from({ length: donorsPerPage - currentDonors.length }, (_, i) => (
                <div key={`empty-${i}`} style={{ visibility: 'hidden' }}></div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-button"
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="page-info">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                className="page-button"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      <div style={{ 
        textAlign: 'center', 
        marginTop: '48px', 
        padding: '24px',
        background: 'white',
        borderRadius: '12px',
        border: '2px dashed #e5e7eb'
      }}>
        <Heart size={24} color="#0a451c" style={{ marginBottom: '8px' }} />
        <p style={{ 
          margin: 0, 
          color: '#6b7280', 
          fontSize: '14px',
          fontStyle: 'italic'
        }}>
          "Every completed contribution creates lasting impact and brings us closer to our climate goals."
        </p>
      </div>
    </div>
  );
};

export default DonorWall;