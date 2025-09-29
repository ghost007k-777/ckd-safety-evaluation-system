import { Submission, SubmissionStatus, FormData } from '../types.ts';
import { 
  addSubmission as firebaseAddSubmission,
  getSubmissions as firebaseGetSubmissions,
  updateSubmissionStatus as firebaseUpdateStatus,
  deleteSubmission as firebaseDeleteSubmission,
  subscribeToSubmissions,
  testFirebaseConnection
} from './firestoreService.ts';
import { analyzeFirebaseError, logFirebaseError } from './FirebaseErrorHandler.ts';

// 이벤트 타입 정의
type ConnectionStatus = 'online' | 'offline' | 'connecting';
type DataChangeCallback = (submissions: Submission[]) => void;
type ConnectionStatusCallback = (status: ConnectionStatus) => void;
type ErrorCallback = (error: Error) => void;

/**
 * 통합 데이터 매니저 - 싱글톤 패턴
 * LocalStorage와 Firebase를 통합 관리
 */
export class DataManager {
  private static instance: DataManager | null = null;
  
  // 상태
  private submissions: Submission[] = [];
  private connectionStatus: ConnectionStatus = 'connecting';
  private isInitialized = false;
  
  // Firebase 구독 비활성화 - 주기적 동기화 사용
  private firebaseUnsubscribe: (() => void) | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: Date | null = null;
  
  // 이벤트 리스너들
  private dataChangeListeners: DataChangeCallback[] = [];
  private connectionStatusListeners: ConnectionStatusCallback[] = [];
  private errorListeners: ErrorCallback[] = [];
  
  // LocalStorage 키
  private readonly STORAGE_KEY = 'ckd-submissions';
  private readonly LAST_SYNC_KEY = 'ckd-last-sync';
  
  private constructor() {
    console.log('🏗️ [DataManager] 인스턴스 생성');
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * 데이터 매니저 초기화
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ [DataManager] 이미 초기화됨');
      return;
    }

    console.log('🚀 [DataManager] 초기화 시작');
    console.log('🔍 [DataManager] 현재 URL:', window.location.href);
    console.log('🔍 [DataManager] 프로젝트 ID:', 'ckd-app-001');
    
    // 강제로 실시간 리스너 비활성화 (400 오류 해결)
    console.log('⚠️ [DataManager] 실시간 리스너 강제 비활성화 (400 오류 방지)');
    const disableRealtimeEnv = (import.meta as any).env?.VITE_DISABLE_FIRESTORE_LISTEN;
    const disableRealtime = String(disableRealtimeEnv ?? 'true').toLowerCase() === 'true'; // 기본값을 true로 변경
    
    try {
      // 1단계: Firebase 연결 테스트
      this.setConnectionStatus('connecting');
      const isConnected = await this.testConnection();
      
      if (isConnected) {
        console.log('✅ [DataManager] Firebase 연결 성공');
        this.setConnectionStatus('online');
        
        // 2단계: 초기 데이터 동기화
        try {
          await this.syncWithFirebase();
          console.log('✅ [DataManager] 초기 데이터 동기화 완료');
        } catch (syncError) {
          console.warn('⚠️ [DataManager] 초기 동기화 실패:', syncError);
        }

        // 3단계: 실시간 구독 또는 주기적 동기화
        if (disableRealtime) {
          console.warn('⚠️ [DataManager] 환경변수에 의해 실시간 구독 비활성화. 주기적 동기화만 사용');
          this.setupPeriodicSync();
        } else {
          try {
            await this.setupFirebaseSubscription();
            if (!this.firebaseUnsubscribe) {
              console.warn('⚠️ [DataManager] 실시간 구독이 활성화되지 않음. 폴백으로 주기적 동기화 사용');
              this.setupPeriodicSync();
            }
          } catch (subError) {
            console.warn('⚠️ [DataManager] 실시간 구독 설정 실패, 폴백으로 주기적 동기화 사용:', subError);
            this.setupPeriodicSync();
          }
        }
        
      } else {
        console.log('⚠️ [DataManager] Firebase 연결 실패, 오프라인 모드');
        this.setConnectionStatus('offline');
        
        // 캐시된 데이터만 로드
        await this.loadFromCache();
      }
      
      this.isInitialized = true;
      console.log('✅ [DataManager] 초기화 완료');
      
    } catch (error) {
      console.error('❌ [DataManager] 초기화 실패:', error);
      this.setConnectionStatus('offline');
      this.emitError(error instanceof Error ? error : new Error('초기화 실패'));
      
      // 캐시된 데이터라도 로드
      await this.loadFromCache();
      this.isInitialized = true;
    }
  }

  /**
   * Firebase 연결 테스트
   */
  private async testConnection(): Promise<boolean> {
    try {
      return await testFirebaseConnection();
    } catch (error) {
      console.error('❌ [DataManager] 연결 테스트 실패:', error);
      return false;
    }
  }

  /**
   * 주기적 동기화 설정 (실시간 구독 대신 사용)
   */
  private setupPeriodicSync(): void {
    console.log('⏰ [DataManager] 주기적 동기화 설정 중...');
    
    // 기존 인터벌 정리
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // 30초마다 동기화
    this.syncInterval = setInterval(async () => {
      if (this.connectionStatus === 'online') {
        try {
          console.log('🔄 [DataManager] 주기적 동기화 실행...');
          await this.syncWithFirebase();
          this.lastSyncTime = new Date();
          console.log('✅ [DataManager] 주기적 동기화 완료');
        } catch (error) {
          console.warn('⚠️ [DataManager] 주기적 동기화 실패:', error);
          // 연결 상태 재확인
          const isConnected = await this.testConnection();
          if (!isConnected) {
            this.setConnectionStatus('offline');
          }
        }
      }
    }, 30000); // 30초 간격
    
    console.log('✅ [DataManager] 주기적 동기화 설정 완료 (30초 간격)');
  }

  /**
   * 수동 즉시 동기화 (사용자 액션 시 호출)
   */
  public async manualSync(): Promise<void> {
    console.log('🔄 [DataManager] 수동 동기화 시작...');
    
    try {
      const isConnected = await this.testConnection();
      if (isConnected) {
        this.setConnectionStatus('online');
        await this.syncWithFirebase();
        this.lastSyncTime = new Date();
        console.log('✅ [DataManager] 수동 동기화 완료');
      } else {
        this.setConnectionStatus('offline');
        throw new Error('Firebase 연결 불가');
      }
    } catch (error) {
      console.error('❌ [DataManager] 수동 동기화 실패:', error);
      throw error;
    }
  }

  /**
   * 중복 데이터 제거 (ID 기준)
   */
  private deduplicateSubmissions(submissions: Submission[]): Submission[] {
    const seen = new Set<string>();
    const unique: Submission[] = [];
    
    for (const submission of submissions) {
      if (!seen.has(submission.id)) {
        seen.add(submission.id);
        unique.push(submission);
      }
    }
    
    console.log(`🔄 [DataManager] 중복 제거: ${submissions.length} → ${unique.length}`);
    return unique;
  }

  /**
   * Firebase와 동기화
   */
  private async syncWithFirebase(): Promise<void> {
    try {
      console.log('🔄 [DataManager] Firebase 동기화 중...');
      const submissions = await firebaseGetSubmissions();
      console.log(`✅ [DataManager] ${submissions.length}개 데이터 동기화 완료`);
      
      // 중복 제거 적용
      const uniqueSubmissions = this.deduplicateSubmissions(submissions);
      this.submissions = uniqueSubmissions;
      this.saveToCache();
      this.emitDataChange();
      
    } catch (error) {
      console.error('❌ [DataManager] Firebase 동기화 실패:', error);
      throw error;
    }
  }

  /**
   * 캐시에서 데이터 로드
   */
  private async loadFromCache(): Promise<void> {
    try {
      console.log('📦 [DataManager] 캐시에서 데이터 로드 중...');
      const cached = localStorage.getItem(this.STORAGE_KEY);
      
      if (cached) {
        const parsed = JSON.parse(cached);
        const submissions = parsed.map((sub: any) => ({
          ...sub,
          submittedAt: new Date(sub.submittedAt),
          safetyTraining: {
            ...sub.safetyTraining,
            completionDate: sub.safetyTraining.completionDate 
              ? new Date(sub.safetyTraining.completionDate) 
              : null
          }
        }));
        
        this.submissions = submissions;
        console.log(`✅ [DataManager] ${submissions.length}개 캐시 데이터 로드 완료`);
        this.emitDataChange();
      } else {
        console.log('📦 [DataManager] 캐시 데이터 없음');
        this.submissions = [];
        this.emitDataChange();
      }
    } catch (error) {
      console.error('❌ [DataManager] 캐시 로드 실패:', error);
      this.submissions = [];
      this.emitDataChange();
    }
  }

  /**
   * 캐시에 데이터 저장
   */
  private saveToCache(): void {
    try {
      const dataToSave = JSON.stringify(this.submissions);
      localStorage.setItem(this.STORAGE_KEY, dataToSave);
      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      console.log('💾 [DataManager] 캐시 저장 완료');
      console.log('💾 [DataManager] 저장된 데이터 개수:', this.submissions.length);
      console.log('💾 [DataManager] 저장된 데이터 크기:', Math.round(dataToSave.length / 1024), 'KB');
      
      // 저장 직후 검증
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('💾 [DataManager] 저장 검증 성공:', parsed.length, '개 항목');
      } else {
        console.error('❌ [DataManager] 저장 검증 실패: 데이터를 다시 읽을 수 없음');
      }
    } catch (error) {
      console.error('❌ [DataManager] 캐시 저장 실패:', error);
    }
  }

  /**
   * 연결 상태 설정
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      console.log(`🔄 [DataManager] 연결 상태 변경: ${status}`);
      this.emitConnectionStatusChange();
    }
  }

  // 공개 메서드들

  /**
   * 캐시된 데이터 즉시 반환
   */
  public async getCachedSubmissions(): Promise<Submission[]> {
    console.log('📦 [DataManager] 캐시된 데이터 요청');
    console.log('📦 [DataManager] 메모리 데이터 개수:', this.submissions.length);
    
    if (this.submissions.length > 0) {
      console.log('📦 [DataManager] 메모리에서 반환:', this.submissions.length, '개');
      return [...this.submissions];
    }
    
    // 캐시에서 로드
    console.log('📦 [DataManager] LocalStorage에서 로드 시도');
    await this.loadFromCache();
    console.log('📦 [DataManager] 로드 후 데이터 개수:', this.submissions.length);
    return [...this.submissions];
  }

  /**
   * 신청서 추가
   */
  public async addSubmission(formData: FormData): Promise<Submission> {
    console.log('📝 [DataManager] 신청서 추가 시작');
    console.log('📝 [DataManager] 회사명:', formData.projectInfo.companyName);
    console.log('📝 [DataManager] 현재 submissions 개수:', this.submissions.length);
    
    const newSubmission: Submission = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      submittedAt: new Date(),
      ...formData,
    };

    // 로컬에 즉시 추가
    this.submissions = [newSubmission, ...this.submissions];
    console.log('📝 [DataManager] 로컬 추가 완료. 새 개수:', this.submissions.length);
    this.saveToCache();
    this.emitDataChange();

    try {
      if (this.connectionStatus === 'online') {
        // Firebase에 저장
        const firebaseId = await firebaseAddSubmission(formData);
        
        // ID 업데이트 및 중복 제거
        const updatedSubmission = { ...newSubmission, id: firebaseId };
        this.submissions = this.submissions.map(sub => 
          sub.id === newSubmission.id ? updatedSubmission : sub
        );
        // 중복 제거 적용
        this.submissions = this.deduplicateSubmissions(this.submissions);
        this.saveToCache();
        this.emitDataChange();
        
        console.log('✅ [DataManager] 신청서 Firebase 저장 완료:', firebaseId);
        return updatedSubmission;
      } else {
        console.log('⚠️ [DataManager] 오프라인 모드 - 로컬에만 저장');
        return newSubmission;
      }
    } catch (error) {
      console.error('❌ [DataManager] Firebase 저장 실패:', error);
      // 로컬 저장은 이미 완료되었으므로 에러를 던지지 않음
      return newSubmission;
    }
  }

  /**
   * 신청서 상태 업데이트
   */
  public async updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<void> {
    // 로컬에서 즉시 업데이트
    this.submissions = this.submissions.map(sub =>
      sub.id === id ? { ...sub, status } : sub
    );
    this.saveToCache();
    this.emitDataChange();

    try {
      if (this.connectionStatus === 'online') {
        await firebaseUpdateStatus(id, status);
        console.log('✅ [DataManager] 상태 Firebase 업데이트 완료:', id, status);
      } else {
        console.log('⚠️ [DataManager] 오프라인 모드 - 로컬에만 업데이트');
      }
    } catch (error) {
      console.error('❌ [DataManager] Firebase 업데이트 실패:', error);
      // 로컬 업데이트는 이미 완료되었으므로 에러를 던지지 않음
    }
  }

  /**
   * 신청서 삭제
   */
  public async deleteSubmission(id: string): Promise<void> {
    // 로컬에서 즉시 삭제
    this.submissions = this.submissions.filter(sub => sub.id !== id);
    this.saveToCache();
    this.emitDataChange();

    try {
      if (this.connectionStatus === 'online') {
        await firebaseDeleteSubmission(id);
        console.log('✅ [DataManager] Firebase 삭제 완료:', id);
      } else {
        console.log('⚠️ [DataManager] 오프라인 모드 - 로컬에서만 삭제');
      }
    } catch (error) {
      console.error('❌ [DataManager] Firebase 삭제 실패:', error);
      // 로컬 삭제는 이미 완료되었으므로 에러를 던지지 않음
    }
  }

  /**
   * 강제 동기화 (WebChannel 오류 복구 포함)
   */
  public async forceSync(): Promise<void> {
    console.log('🔄 [DataManager] 강제 동기화 시작...');
    
    if (this.connectionStatus === 'offline' || this.connectionStatus === 'connecting') {
      // 연결 재시도
      console.log('🔄 [DataManager] 연결 상태 재확인 중...');
      const isConnected = await this.testConnection();
      if (isConnected) {
        console.log('✅ [DataManager] 연결 복구됨, 실시간 구독 재설정...');
        this.setConnectionStatus('online');
        await this.setupFirebaseSubscription();
      }
    }

    if (this.connectionStatus === 'online') {
      try {
        await this.syncWithFirebase();
        console.log('✅ [DataManager] 강제 동기화 완료');
      } catch (error) {
        console.error('❌ [DataManager] 강제 동기화 실패:', error);
        // 실시간 구독이 있다면 그것에 의존
        if (this.firebaseUnsubscribe) {
          console.log('⚠️ [DataManager] 수동 동기화 실패, 실시간 구독으로 대체');
        } else {
          throw error;
        }
      }
    } else {
      throw new Error('오프라인 상태에서는 동기화할 수 없습니다.');
    }
  }

  // 이벤트 리스너 관리

  public onDataChange(callback: DataChangeCallback): void {
    this.dataChangeListeners.push(callback);
  }

  public onConnectionStatusChange(callback: ConnectionStatusCallback): void {
    this.connectionStatusListeners.push(callback);
  }

  public onError(callback: ErrorCallback): void {
    this.errorListeners.push(callback);
  }

  private emitDataChange(): void {
    this.dataChangeListeners.forEach(callback => {
      try {
        callback([...this.submissions]);
      } catch (error) {
        console.error('❌ [DataManager] 데이터 변경 리스너 오류:', error);
      }
    });
  }

  private emitConnectionStatusChange(): void {
    this.connectionStatusListeners.forEach(callback => {
      try {
        callback(this.connectionStatus);
      } catch (error) {
        console.error('❌ [DataManager] 연결 상태 리스너 오류:', error);
      }
    });
  }

  private emitError(error: Error): void {
    this.errorListeners.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('❌ [DataManager] 에러 리스너 오류:', err);
      }
    });
  }

  /**
   * Firestore 실시간 구독 설정
   * - 장거리 폴링 자동감지 옵션으로 400 Listen 이슈 우회
   * - 실패 시 주기적 동기화로 폴백
   */
  private async setupFirebaseSubscription(): Promise<void> {
    // 기존 구독 정리
    if (this.firebaseUnsubscribe) {
      try { this.firebaseUnsubscribe(); } catch { /* ignore */ }
      this.firebaseUnsubscribe = null;
    }

    return new Promise((resolve) => {
      try {
        this.firebaseUnsubscribe = subscribeToSubmissions(
          (submissions) => {
            // 중복 제거: ID 기준으로 고유한 데이터만 유지
            const uniqueSubmissions = this.deduplicateSubmissions(submissions);
            this.submissions = uniqueSubmissions;
            this.saveToCache();
            this.emitDataChange();
          },
          (error) => {
            console.warn('⚠️ [DataManager] 실시간 구독 에러. 폴백으로 주기적 동기화 사용:', error);
            // 실시간 구독 해제
            if (this.firebaseUnsubscribe) {
              try { this.firebaseUnsubscribe(); } catch { /* ignore */ }
            }
            this.firebaseUnsubscribe = null;
            // 폴백 폴링 시작
            this.setupPeriodicSync();
          }
        );

        console.log('✅ [DataManager] 실시간 구독 활성화');
        resolve();
      } catch (error) {
        console.warn('⚠️ [DataManager] 실시간 구독 설정 실패:', error);
        this.firebaseUnsubscribe = null;
        this.setupPeriodicSync();
        resolve();
      }
    });
  }

  /**
   * 정리 함수
   */
  public cleanup(): void {
    console.log('🧹 [DataManager] 정리 중...');
    
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
      this.firebaseUnsubscribe = null;
    }
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.dataChangeListeners = [];
    this.connectionStatusListeners = [];
    this.errorListeners = [];
    
    console.log('✅ [DataManager] 정리 완료');
  }

  // 디버깅용 메서드들

  public getStatus() {
    return {
      isInitialized: this.isInitialized,
      connectionStatus: this.connectionStatus,
      submissionsCount: this.submissions.length,
      hasFirebaseSubscription: !!this.firebaseUnsubscribe,
      listeners: {
        dataChange: this.dataChangeListeners.length,
        connectionStatus: this.connectionStatusListeners.length,
        error: this.errorListeners.length
      }
    };
  }
}
