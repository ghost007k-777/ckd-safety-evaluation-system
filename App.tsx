import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage.tsx';
import { EvaluationForm } from './EvaluationForm.tsx';
import { ApplicationList } from './components/ApplicationList.tsx';
import { AdminPage } from './components/AdminPage.tsx';
import { 
  DataProvider, 
  useData, 
  useConnectionStatus, 
  useDataLoading, 
  useDataError 
} from './contexts/DataContext.tsx';
import { DebugInfo } from './components/DebugInfo.tsx';

type View = 'landing' | 'form' | 'list' | 'admin';

// 내부 앱 컴포넌트 (DataProvider로 감싸진 상태에서 실행)
const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  
  // 새로운 전역 상태 훅들 사용
  const { state, actions } = useData();
  const connectionStatus = useConnectionStatus();
  const loading = useDataLoading();
  const error = useDataError();

  // 로딩 화면
  const renderLoadingScreen = () => (
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
      <p className="text-sm text-gray-500">
        {connectionStatus === 'connecting' && '서버 연결 중...'}
        {connectionStatus === 'online' && '온라인 동기화 중...'}
        {connectionStatus === 'offline' && '캐시된 데이터 로딩 중...'}
      </p>
        </div>
      );

  // 에러 화면
  const renderErrorScreen = () => (
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">시스템 오류</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
              <p className="mt-2">현재 {state.submissions.length}개의 캐시된 데이터를 표시하고 있습니다.</p>
                </div>
            <div className="mt-4 space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    새로고침
                  </button>
                  <button
                    onClick={() => actions.manualSync()}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    수동 동기화
                  </button>
                  <button
                    onClick={() => actions.refreshData()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          </div>
          {renderMainContent()}
        </div>
      );

  // 메인 콘텐츠 렌더링
  const renderMainContent = () => {
    switch (currentView) {
      case 'form':
        return (
          <EvaluationForm 
                    onBackToHome={() => setCurrentView('landing')} 
            onSubmit={actions.addSubmission}
                    onViewList={() => setCurrentView('list')} 
          />
        );
      case 'list':
        return (
          <ApplicationList 
            submissions={state.submissions} 
            onBack={() => setCurrentView('landing')} 
          />
        );
      case 'admin':
        return (
          <AdminPage 
            submissions={state.submissions} 
            onUpdateStatus={actions.updateSubmissionStatus} 
            onDelete={actions.deleteSubmission} 
            onBack={() => setCurrentView('landing')} 
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage 
          onStartEvaluation={() => setCurrentView('form')} 
          onShowList={() => setCurrentView('list')}
          onShowAdmin={() => setCurrentView('admin')}
          />
        );
    }
  };

  // 메인 렌더링 로직
  const renderContent = () => {
    // 초기 로딩 중
    if (loading && state.submissions.length === 0) {
      return renderLoadingScreen();
    }

    // 에러가 있지만 데이터는 있는 경우 (오프라인 모드)
    if (error && connectionStatus === 'offline') {
      return renderErrorScreen();
    }

    // 정상 상태
    return renderMainContent();
  };

  // 연결 상태에 따른 상태 표시
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'online':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-500',
          text: '온라인'
        };
      case 'offline':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-500',
          text: '오프라인'
        };
      case 'connecting':
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-400 animate-pulse',
          text: '연결 중...'
        };
    }
  };

  const connectionDisplay = getConnectionStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 overflow-hidden flex-shrink-0">
              <img 
                src="https://i.ibb.co/rGGGfDqc/2025-09-02-165735.png" 
                alt="시스템 로고" 
                className="h-10"
              />
            </div>
            <span className="ml-4 text-xl font-bold text-gray-800">
              CKD 적격 수급업체 안전 평가 시스템
            </span>
          </div>
          
          {/* 연결 상태 및 데이터 정보 표시 */}
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-500">
              {state.submissions.length}개 신청서
              {state.lastSyncTime && (
                <span className="ml-1">
                  (마지막 동기화: {state.lastSyncTime.toLocaleTimeString()})
                </span>
              )}
              </div>
            <div className={`flex items-center space-x-1 text-sm ${connectionDisplay.color}`}>
              <div className={`w-2 h-2 rounded-full ${connectionDisplay.bgColor}`}></div>
              <span>{connectionDisplay.text}</span>
              </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      
      <DebugInfo />
    </div>
  );
};

// 메인 App 컴포넌트 (DataProvider로 감싸기)
const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;