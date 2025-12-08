/**
 * Main App Component
 */

import { useAuth } from './hooks/useAuth';
import { useCalendar } from './hooks/useCalendar';
import { EventPopupProvider } from './hooks/useEventPopup';
import {
  Header,
  DayView,
  WeekView,
  MonthView,
  LoginScreen,
  LoadingScreen,
} from './components';

function App() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    accessToken,
    signIn,
    signOut,
    clearError,
    handleTokenExpired,
  } = useAuth();

  const {
    columns,
    viewMode,
    currentDate,
    dateRange,
    showTentative,
    isRefreshing,
    setViewMode,
    goToPrevious,
    goToNext,
    goToToday,
    toggleTentative,
    refresh,
  } = useCalendar({ accessToken, isAuthenticated, onTokenExpired: handleTokenExpired });

  // Show loading screen during initial auth check
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onSignIn={signIn}
        isLoading={authLoading}
        error={authError}
        onClearError={clearError}
      />
    );
  }

  // Main calendar view
  return (
    <EventPopupProvider>
      <div className="h-screen flex flex-col bg-white">
        <Header
          currentDate={currentDate}
          viewMode={viewMode}
          showTentative={showTentative}
          isRefreshing={isRefreshing}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onToday={goToToday}
          onViewModeChange={setViewMode}
          onToggleTentative={toggleTentative}
          onRefresh={refresh}
          onSignOut={signOut}
        />

        <main className="flex-1 overflow-auto">
          {viewMode === 'day' && (
            <DayView columns={columns} currentDate={currentDate} />
          )}
          {viewMode === 'week' && (
            <WeekView columns={columns} dateRange={dateRange} />
          )}
          {viewMode === 'month' && (
            <MonthView
              columns={columns}
              dateRange={dateRange}
              currentDate={currentDate}
            />
          )}
        </main>
      </div>
    </EventPopupProvider>
  );
}

export default App;
