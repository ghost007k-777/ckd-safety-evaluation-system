

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage.tsx';
import { EvaluationForm } from './EvaluationForm.tsx';
import { ApplicationList } from './components/ApplicationList.tsx';
import { AdminPage } from './components/AdminPage.tsx';
import { FormData, Submission, SubmissionStatus } from './types.ts';
import { 
  addSubmission, 
  getSubmissions, 
  updateSubmissionStatus, 
  deleteSubmission,
  subscribeToSubmissions,
  testFirebaseConnection
} from './services/firestoreService.ts';

type View = 'landing' | 'form' | 'list' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 Firestore에서 데이터 로드
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        // Firebase 연결 테스트
        const isConnected = await testFirebaseConnection();
        if (!isConnected) {
          throw new Error('Firebase connection failed');
        }
        
        const data = await getSubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to load submissions:', error);
        // 실패 시 LocalStorage 백업 사용
        try {
          const saved = localStorage.getItem('ckd-submissions');
          if (saved) {
            const parsed = JSON.parse(saved);
            const restored = parsed.map((sub: any) => ({
              ...sub,
              submittedAt: new Date(sub.submittedAt),
              safetyTraining: {
                ...sub.safetyTraining,
                completionDate: sub.safetyTraining.completionDate ? new Date(sub.safetyTraining.completionDate) : null
              }
            }));
            setSubmissions(restored);
          }
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();

    // 실시간 업데이트 구독 (선택사항)
    const unsubscribe = subscribeToSubmissions((data) => {
      setSubmissions(data);
    });

    return () => unsubscribe();
  }, []);

  const handleAddSubmission = async (formData: FormData) => {
    try {
      await addSubmission(formData);
      // 실시간 구독이 자동으로 업데이트하므로 수동 업데이트 불필요
    } catch (error) {
      console.error('Failed to add submission:', error);
      alert('신청서 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleUpdateStatus = async (id: string, status: SubmissionStatus) => {
    try {
      await updateSubmissionStatus(id, status);
      // 실시간 구독이 자동으로 업데이트하므로 수동 업데이트 불필요
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 업데이트에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      await deleteSubmission(id);
      // 실시간 구독이 자동으로 업데이트하므로 수동 업데이트 불필요
    } catch (error) {
      console.error('Failed to delete submission:', error);
      alert('신청서 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'form':
        return <EvaluationForm 
                    onBackToHome={() => setCurrentView('landing')} 
                    onSubmit={handleAddSubmission} 
                    onViewList={() => setCurrentView('list')} 
                />;
      case 'list':
        return <ApplicationList submissions={submissions} onBack={() => setCurrentView('landing')} />;
      case 'admin':
        return <AdminPage submissions={submissions} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteSubmission} onBack={() => setCurrentView('landing')} />;
      case 'landing':
      default:
        return <LandingPage 
          onStartEvaluation={() => setCurrentView('form')} 
          onShowList={() => setCurrentView('list')}
          onShowAdmin={() => setCurrentView('admin')}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="w-10 h-10 overflow-hidden flex-shrink-0">
            <img src="https://i.ibb.co/rGGGfDqc/2025-09-02-165735.png" alt="시스템 로고" className="h-10"/>
          </div>
          <span className="ml-4 text-xl font-bold text-gray-800">
            CKD 적격 수급업체 안전 평가 시스템
          </span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;