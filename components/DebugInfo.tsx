import React, { useState, useEffect } from 'react';
import { useData, useConnectionStatus } from '../contexts/DataContext.tsx';
import { DataManager } from '../services/DataManager.ts';
import { testFirebaseConnection } from '../services/firestoreService.ts';

export const DebugInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { state } = useData();
  const connectionStatus = useConnectionStatus();

  const collectDebugInfo = () => {
    const dataManager = DataManager.getInstance();
    const managerStatus = dataManager.getStatus();
    
    const info = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      
      // React State
      reactState: {
        submissions: state.submissions.length,
        loading: state.loading,
        error: state.error,
        connectionStatus: state.connectionStatus,
        lastSyncTime: state.lastSyncTime?.toISOString()
      },
      
      // DataManager Status
      dataManager: managerStatus,
      
      // LocalStorage
      localStorage: {
        submissionsKey: localStorage.getItem('ckd-submissions') ? 'EXISTS' : 'MISSING',
        lastSyncKey: localStorage.getItem('ckd-last-sync') || 'MISSING',
        dataSize: localStorage.getItem('ckd-submissions')?.length || 0
      },
      
      // Firebase Config
      firebaseConfig: {
        apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY ? 'SET' : 'MISSING',
        authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'MISSING',
        projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'MISSING',
        storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'MISSING',
        messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || 'MISSING',
        appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID ? 'SET' : 'MISSING',
        measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || 'MISSING'
      },
      
      // Browser Info
      browser: {
        localStorage: !!localStorage,
        indexedDB: !!indexedDB,
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled
      }
    };
    
    setDebugData(info);
  };

  const testFirebase = async () => {
    setTestResult('테스트 중...');
    try {
      const result = await testFirebaseConnection();
      setTestResult(result ? '✅ 연결 성공!' : '❌ 연결 실패');
    } catch (error) {
      setTestResult(`❌ 에러: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  useEffect(() => {
    if (isVisible) {
      collectDebugInfo();
    }
  }, [isVisible, state]);

  // 개발 모드에서만 표시 (또는 특정 조건)
  const showDebugButton = window.location.hostname === 'localhost' || 
                         window.location.search.includes('debug=true') ||
                         window.location.hostname.includes('run.app');

  if (!showDebugButton) return null;

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          background: '#007cba',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        🐛 Debug
      </button>
      
      {isVisible && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          width: '400px',
          maxHeight: '600px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '15px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>🔧 Debug Information</h3>
            <button 
              onClick={() => setIsVisible(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={collectDebugInfo}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                marginRight: '10px',
                fontSize: '12px'
              }}
            >
              🔄 새로고침
            </button>
            <button
              onClick={testFirebase}
              style={{
                background: '#007cba',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔥 Firebase 테스트
            </button>
          </div>
          
          {testResult && (
            <div style={{ 
              padding: '8px', 
              background: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
              border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '3px',
              marginBottom: '15px',
              fontSize: '12px'
            }}>
              {testResult}
            </div>
          )}
          
          {debugData && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <strong>📊 현재 상태:</strong>
                <div style={{ marginLeft: '10px', color: connectionStatus === 'online' ? 'green' : 'red' }}>
                  연결: {connectionStatus} | 데이터: {state.submissions.length}개
                </div>
              </div>
              
              <details style={{ marginBottom: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔍 전체 디버그 정보</summary>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '3px', 
                  fontSize: '10px',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </details>
              
              <div style={{ fontSize: '10px', color: '#666' }}>
                <strong>🔗 유용한 링크:</strong><br/>
                <a href="https://console.firebase.google.com/project/ckd-app-001/firestore/data" target="_blank">
                  Firebase Console
                </a><br/>
                <a href="/debug-tools.html" target="_blank">
                  디버깅 도구
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
