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

  // 디버그 로그 추가
  console.log('🔍 [App] 상태 확인:', {
    currentView,
    loading,
    error,
    connectionStatus,
    submissionsCount: state.submissions?.length || 0,
    lastSyncTime: state.lastSyncTime?.toISOString(),
    submissions: state.submissions?.slice(0, 2).map(s => ({
      id: s.id,
      companyName: s.projectInfo?.companyName,
      status: s.status
    }))
  });

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
    console.log('🔍 [App] renderMainContent:', {
      currentView,
      submissionsCount: state.submissions?.length || 0
    });
    
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
    console.log('🔍 [App] renderContent 조건 확인:', {
      loading,
      submissionsLength: state.submissions.length,
      error,
      connectionStatus,
      shouldShowLoading: loading && state.submissions.length === 0,
      shouldShowError: error && connectionStatus === 'offline'
    });

    // 초기 로딩 중 (연결 상태가 connecting이고 데이터가 없을 때)
    if (loading && state.submissions.length === 0 && connectionStatus === 'connecting') {
      console.log('🔍 [App] 로딩 화면 표시');
      return renderLoadingScreen();
    }

    // 심각한 에러가 있는 경우
    if (error && connectionStatus === 'offline' && state.submissions.length === 0) {
      console.log('🔍 [App] 에러 화면 표시');
      return renderErrorScreen();
    }

    // 정상 상태 (데이터가 있거나 로딩이 완료된 경우)
    console.log('🔍 [App] 메인 콘텐츠 표시');
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
        <div className="max-w-7xl mx-auto py-3 sm:py-4 px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 overflow-hidden flex-shrink-0">
              <img 
                src="https://i.ibb.co/rGGGfDqc/2025-09-02-165735.png" 
                alt="시스템 로고" 
                className="h-8 sm:h-10"
              />
            </div>
            <span className="ml-2 sm:ml-4 text-sm sm:text-xl font-bold text-gray-800 truncate">
              <span className="hidden sm:inline">CKD 적격 수급업체 안전 평가 시스템</span>
              <span className="sm:hidden">CKD 안전평가</span>
            </span>
          </div>
          
          {/* 연결 상태 및 데이터 정보 표시 */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="hidden sm:block text-xs text-gray-500">
              {state.submissions.length}개 신청서
              {state.lastSyncTime && (
                <span className="ml-1">
                  (마지막 동기화: {state.lastSyncTime.toLocaleTimeString()})
                </span>
              )}
              </div>
            <div className={`flex items-center space-x-1 text-xs sm:text-sm ${connectionDisplay.color}`}>
              <div className={`w-2 h-2 rounded-full ${connectionDisplay.bgColor}`}></div>
              <span className="hidden sm:inline">{connectionDisplay.text}</span>
              <span className="sm:hidden">{state.submissions.length}</span>
              </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto py-4 sm:py-10 px-3 sm:px-6 lg:px-8">
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