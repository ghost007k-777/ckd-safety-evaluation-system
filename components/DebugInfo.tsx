import React, { useState, useEffect } from 'react';
import { useData, useConnectionStatus } from '../contexts/DataContext.tsx';
import { DataManager } from '../services/DataManager.ts';

export const DebugInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
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
        projectId: 'ckd-app-001',
        authDomain: 'ckd-app-001.firebaseapp.com'
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

  useEffect(() => {
    if (isVisible) {
      collectDebugInfo();
    }
  }, [isVisible, state]);

  // 개발 모드에서만 표시 (또는 특정 조건)
  const showDebugButton = window.location.hostname === 'localhost' || 
                         window.location.search.includes('debug=true');

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
          
          <button
            onClick={collectDebugInfo}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '3px',
              cursor: 'pointer',
              marginBottom: '15px',
              fontSize: '12px'
            }}
          >
            🔄 새로고침
          </button>
          
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
