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
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  
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

  // 로딩 화면 (KRDS 스타일)
  const renderLoadingScreen = () => (
        <div className="flex flex-col justify-center items-center h-96 space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0066CC] border-t-transparent"></div>
          <div className="text-center">
            <p className="text-lg font-semibold text-[#343A40] mb-2">데이터를 불러오는 중입니다</p>
            <p className="text-sm text-[#6C757D]">
              {connectionStatus === 'connecting' && '서버에 연결하고 있습니다...'}
              {connectionStatus === 'online' && '온라인 데이터를 동기화하고 있습니다...'}
              {connectionStatus === 'offline' && '캐시된 데이터를 불러오고 있습니다...'}
            </p>
          </div>
        </div>
      );

  // 에러 화면 (KRDS 스타일)
  const renderErrorScreen = () => (
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#F8D7DA] border-2 border-[#DC3545] rounded-xl p-6 sm:p-8 mb-8">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-[#DC3545]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold text-[#DC3545] mb-2">시스템 오류가 발생했습니다</h3>
                <div className="text-sm text-[#721C24] space-y-2">
                  <p className="font-medium">{error}</p>
                  <p className="bg-white bg-opacity-50 p-3 rounded-lg">
                    현재 <strong>{state.submissions.length}개</strong>의 캐시된 데이터를 표시하고 있습니다.
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-[#DC3545] hover:bg-[#C82333] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    새로고침
                  </button>
                  <button
                    onClick={() => actions.manualSync()}
                    className="bg-[#0066CC] hover:bg-[#0052A3] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    수동 동기화
                  </button>
                  <button
                    onClick={() => actions.refreshData()}
                    className="bg-white hover:bg-[#F1F3F5] text-[#343A40] border-2 border-[#DEE2E6] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
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
            onBackToHome={() => {
              setCurrentView('landing');
              setEditingSubmission(null);
            }} 
            onSubmit={(formData) => {
              // 수정 모드일 때도 새로운 신청서로 등록
              actions.addSubmission(formData);
              setEditingSubmission(null);
              setCurrentView('list');
            }}
            onViewList={() => setCurrentView('list')} 
            initialData={editingSubmission || undefined}
            isEditMode={!!editingSubmission}
          />
        );
      case 'list':
        return (
          <ApplicationList 
            submissions={state.submissions} 
            onBack={() => setCurrentView('landing')} 
            onEdit={(submission) => {
              setEditingSubmission(submission);
              setCurrentView('form');
            }}
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

  // 연결 상태에 따른 상태 표시 (KRDS 스타일)
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'online':
        return {
          color: 'text-[#28A745]',
          bgColor: 'bg-[#28A745]',
          text: '온라인'
        };
      case 'offline':
        return {
          color: 'text-[#DC3545]',
          bgColor: 'bg-[#DC3545]',
          text: '오프라인'
        };
      case 'connecting':
      default:
        return {
          color: 'text-[#FFC107]',
          bgColor: 'bg-[#FFC107] animate-pulse',
          text: '연결 중'
        };
    }
  };

  const connectionDisplay = getConnectionStatusDisplay();

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#212529]">
      {/* KRDS 스타일 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-[#E9ECEF]">
        <div className="max-w-7xl mx-auto py-4 sm:py-5 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* 로고 및 타이틀 */}
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <img 
                  src="https://i.ibb.co/rGGGfDqc/2025-09-02-165735.png" 
                  alt="시스템 로고" 
                  className="h-10 sm:h-12 object-contain"
                />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex items-center">
                <h1 className="text-lg sm:text-2xl font-bold text-[#212529] truncate leading-tight">
                  <span className="hidden sm:inline">CKD 적격 수급업체 안전 평가 시스템</span>
                  <span className="sm:hidden">CKD 안전평가</span>
                </h1>
              </div>
            </div>
            
            {/* 연결 상태 및 데이터 정보 */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* 신청서 수 (데스크톱) */}
              <div className="hidden md:flex items-center px-3 py-1.5 bg-[#F1F3F5] rounded-lg">
                <svg className="w-4 h-4 text-[#0066CC] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-semibold text-[#343A40]">
                  {state.submissions.length}
                  <span className="text-xs text-[#6C757D] ml-1">건</span>
                </span>
              </div>

              {/* 동기화 시간 (데스크톱) */}
              {state.lastSyncTime && (
                <div className="hidden lg:block text-xs text-[#6C757D]">
                  <span className="font-medium">마지막 동기화</span>
                  <span className="ml-1">{state.lastSyncTime.toLocaleTimeString()}</span>
                </div>
              )}

              {/* 연결 상태 */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                connectionStatus === 'online' ? 'bg-[#D4EDDA]' :
                connectionStatus === 'offline' ? 'bg-[#F8D7DA]' :
                'bg-[#FFF3CD]'
              }`}>
                <div className={`w-2 h-2 rounded-full ${connectionDisplay.bgColor}`}></div>
                <span className={`text-sm font-semibold hidden sm:inline ${connectionDisplay.color}`}>
                  {connectionDisplay.text}
                </span>
                {/* 모바일에서는 신청서 수 표시 */}
                <span className="sm:hidden text-sm font-semibold text-[#343A40]">
                  {state.submissions.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* KRDS 스타일 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* 푸터 (KRDS 스타일) */}
      <footer className="bg-white border-t border-[#E9ECEF] mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-[#6C757D]">
              © 2025 CKD 적격 수급업체 안전 평가 시스템. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
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