import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Submission, SubmissionStatus, FormData } from '../types.ts';
import { DataManager } from '../services/DataManager.ts';

// 상태 타입 정의
interface DataState {
  submissions: Submission[];
  loading: boolean;
  error: string | null;
  connectionStatus: 'online' | 'offline' | 'connecting';
  lastSyncTime: Date | null;
}

// 액션 타입 정의
type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'online' | 'offline' | 'connecting' }
  | { type: 'SET_SUBMISSIONS'; payload: Submission[] }
  | { type: 'ADD_SUBMISSION'; payload: Submission }
  | { type: 'UPDATE_SUBMISSION'; payload: { id: string; updates: Partial<Submission> } }
  | { type: 'DELETE_SUBMISSION'; payload: string }
  | { type: 'SET_LAST_SYNC_TIME'; payload: Date };

// 초기 상태
const initialState: DataState = {
  submissions: [],
  loading: true,
  error: null,
  connectionStatus: 'connecting',
  lastSyncTime: null,
};

// 리듀서 함수
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_SUBMISSIONS':
      return { 
        ...state, 
        submissions: action.payload,
        lastSyncTime: new Date(),
        loading: false
      };
    case 'ADD_SUBMISSION':
      return { 
        ...state, 
        submissions: [action.payload, ...state.submissions],
        lastSyncTime: new Date()
      };
    case 'UPDATE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.map(sub =>
          sub.id === action.payload.id 
            ? { ...sub, ...action.payload.updates }
            : sub
        ),
        lastSyncTime: new Date()
      };
    case 'DELETE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.filter(sub => sub.id !== action.payload),
        lastSyncTime: new Date()
      };
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
    default:
      return state;
  }
}

// Context 타입 정의
interface DataContextType {
  state: DataState;
  actions: {
    addSubmission: (formData: FormData) => Promise<void>;
    updateSubmissionStatus: (id: string, status: SubmissionStatus) => Promise<void>;
    deleteSubmission: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
    manualSync: () => Promise<void>;
  };
}

// Context 생성
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider 컴포넌트
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const dataManager = DataManager.getInstance();

  // 초기 데이터 로드 및 실시간 구독 설정
  useEffect(() => {
    console.log('🚀 [DataProvider] 초기화 시작');
    
    const initializeData = async () => {
      try {
        // 1단계: 캐시된 데이터 즉시 로드
        console.log('📦 [DataProvider] 캐시 데이터 로드 중...');
        const cachedData = await dataManager.getCachedSubmissions();
        console.log(`📦 [DataProvider] 캐시 데이터 개수: ${cachedData.length}`);
        
        if (cachedData.length > 0) {
          dispatch({ type: 'SET_SUBMISSIONS', payload: cachedData });
          console.log(`✅ [DataProvider] ${cachedData.length}개 캐시 데이터 로드 완료`);
        } else {
          console.log('📦 [DataProvider] 캐시 데이터 없음, 로딩 상태 해제');
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_SUBMISSIONS', payload: [] });
        }

        // 2단계: Firebase 연결 및 실시간 동기화
        console.log('🔄 [DataProvider] Firebase 동기화 시작...');
        await dataManager.initialize();
        
        // 연결 상태 업데이트
        dataManager.onConnectionStatusChange((status) => {
          dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
        });

        // 데이터 변경 리스너
        dataManager.onDataChange((submissions) => {
          console.log(`📡 [DataProvider] 실시간 데이터 수신: ${submissions.length}개`);
          dispatch({ type: 'SET_SUBMISSIONS', payload: submissions });
        });

        // 에러 리스너
        dataManager.onError((error) => {
          console.error('❌ [DataProvider] 에러 발생:', error);
          dispatch({ type: 'SET_ERROR', payload: error.message });
        });

        console.log('✅ [DataProvider] 초기화 완료');

      } catch (error) {
        console.error('❌ [DataProvider] 초기화 실패:', error);
        dispatch({ type: 'SET_ERROR', payload: '데이터 초기화에 실패했습니다.' });
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'offline' });
      }
    };

    initializeData();

    // 정리 함수
    return () => {
      dataManager.cleanup();
    };
  }, []);

  // 액션 함수들
  const actions = {
    addSubmission: async (formData: FormData) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: null });
        const newSubmission = await dataManager.addSubmission(formData);
        dispatch({ type: 'ADD_SUBMISSION', payload: newSubmission });
        console.log('✅ [DataProvider] 신청서 추가 완료:', newSubmission.id);
      } catch (error) {
        console.error('❌ [DataProvider] 신청서 추가 실패:', error);
        dispatch({ type: 'SET_ERROR', payload: '신청서 저장에 실패했습니다.' });
        throw error;
      }
    },

    updateSubmissionStatus: async (id: string, status: SubmissionStatus) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: null });
        await dataManager.updateSubmissionStatus(id, status);
        dispatch({ type: 'UPDATE_SUBMISSION', payload: { id, updates: { status } } });
        console.log('✅ [DataProvider] 상태 업데이트 완료:', id, status);
      } catch (error) {
        console.error('❌ [DataProvider] 상태 업데이트 실패:', error);
        dispatch({ type: 'SET_ERROR', payload: '상태 업데이트에 실패했습니다.' });
        throw error;
      }
    },

    deleteSubmission: async (id: string) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: null });
        await dataManager.deleteSubmission(id);
        dispatch({ type: 'DELETE_SUBMISSION', payload: id });
        console.log('✅ [DataProvider] 신청서 삭제 완료:', id);
      } catch (error) {
        console.error('❌ [DataProvider] 신청서 삭제 실패:', error);
        dispatch({ type: 'SET_ERROR', payload: '신청서 삭제에 실패했습니다.' });
        throw error;
      }
    },

    refreshData: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        await dataManager.forceSync();
        console.log('✅ [DataProvider] 데이터 새로고침 완료');
      } catch (error) {
        console.error('❌ [DataProvider] 데이터 새로고침 실패:', error);
        dispatch({ type: 'SET_ERROR', payload: '데이터 새로고침에 실패했습니다.' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    manualSync: async () => {
      try {
        dispatch({ type: 'SET_ERROR', payload: null });
        await dataManager.manualSync();
        console.log('✅ [DataProvider] 수동 동기화 완료');
      } catch (error) {
        console.error('❌ [DataProvider] 수동 동기화 실패:', error);
        dispatch({ type: 'SET_ERROR', payload: '동기화에 실패했습니다.' });
      }
    }
  };

  const contextValue: DataContextType = {
    state,
    actions
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom Hook
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// 편의 훅들
export const useSubmissions = () => {
  const { state } = useData();
  return state.submissions;
};

export const useConnectionStatus = () => {
  const { state } = useData();
  return state.connectionStatus;
};

export const useDataLoading = () => {
  const { state } = useData();
  return state.loading;
};

export const useDataError = () => {
  const { state } = useData();
  return state.error;
};
