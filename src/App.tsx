import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { MarketsPage } from './pages/MarketsPage';
import { TradePage } from './pages/TradePage';
import { VestingPage } from './pages/VestingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DeployPage } from './pages/DeployPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { AdminListingsPage } from './pages/AdminListingsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminPointsPage } from './pages/AdminPointsPage';
import { LiveFeedPage } from './pages/LiveFeedPage';
import type { Page } from './types';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedMarketId, setSelectedMarketId] = useState<string | undefined>();

  const handleNavigate = (page: Page, marketId?: string) => {
    if (marketId) setSelectedMarketId(marketId);
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'markets':
        return <MarketsPage onNavigate={handleNavigate} />;
      case 'trade':
        return <TradePage marketId={selectedMarketId} />;
      case 'vesting':
        return <VestingPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'deploy':
        return <DeployPage />;
      case 'create-listing':
        return <CreateListingPage />;
      case 'admin-listings':
        return <AdminListingsPage />;
      case 'admin-analytics':
        return <AdminAnalyticsPage />;
      case 'admin-points':
        return <AdminPointsPage />;
      case 'live-feed':
        return <LiveFeedPage />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
