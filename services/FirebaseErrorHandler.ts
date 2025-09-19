/**
 * Firebase 오류 처리 유틸리티
 */

export interface FirebaseErrorInfo {
  isRetryable: boolean;
  retryDelay: number;
  fallbackStrategy: 'cache' | 'manual-sync' | 'none';
  userMessage: string;
}

/**
 * Firebase 오류 분석 및 처리 전략 결정
 */
export function analyzeFirebaseError(error: any): FirebaseErrorInfo {
  const errorMessage = error?.message || '';
  const errorCode = error?.code || '';
  
  console.log('🔍 [FirebaseErrorHandler] 오류 분석:', {
    message: errorMessage,
    code: errorCode,
    name: error?.name
  });

  // WebChannel 연결 오류
  if (errorMessage.includes('WebChannelConnection') || errorMessage.includes('transport errored')) {
    return {
      isRetryable: true,
      retryDelay: 5000,
      fallbackStrategy: 'cache',
      userMessage: '네트워크 연결이 불안정합니다. 캐시된 데이터를 표시하고 자동으로 재연결을 시도합니다.'
    };
  }

  // 네트워크 오류 (unavailable)
  if (errorCode === 'unavailable' || errorMessage.includes('unavailable')) {
    return {
      isRetryable: true,
      retryDelay: 3000,
      fallbackStrategy: 'manual-sync',
      userMessage: '서버에 연결할 수 없습니다. 잠시 후 다시 시도하거나 새로고침해주세요.'
    };
  }

  // HTTP 400 Bad Request 오류
  if (errorMessage.includes('400') || errorCode === 'invalid-argument') {
    return {
      isRetryable: false,
      retryDelay: 0,
      fallbackStrategy: 'manual-sync',
      userMessage: '데이터 쿼리에 문제가 있습니다. 단순 모드로 전환합니다.'
    };
  }

  // 권한 오류
  if (errorCode === 'permission-denied') {
    return {
      isRetryable: false,
      retryDelay: 0,
      fallbackStrategy: 'none',
      userMessage: '데이터에 접근할 권한이 없습니다. 관리자에게 문의하세요.'
    };
  }

  // 할당량 초과
  if (errorCode === 'resource-exhausted') {
    return {
      isRetryable: true,
      retryDelay: 30000,
      fallbackStrategy: 'cache',
      userMessage: '서버 사용량이 많습니다. 잠시 후 다시 시도해주세요.'
    };
  }

  // IndexedDB 관련 오류
  if (errorMessage.includes('IndexedDB') || errorMessage.includes('IDBDatabase')) {
    return {
      isRetryable: true,
      retryDelay: 1000,
      fallbackStrategy: 'manual-sync',
      userMessage: '로컬 저장소 문제가 발생했습니다. 브라우저를 새로고침해주세요.'
    };
  }

  // 기타 네트워크 관련 오류
  if (errorCode === 'failed-precondition' || errorCode === 'deadline-exceeded') {
    return {
      isRetryable: true,
      retryDelay: 2000,
      fallbackStrategy: 'manual-sync',
      userMessage: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도합니다.'
    };
  }

  // 알 수 없는 오류
  return {
    isRetryable: false,
    retryDelay: 0,
    fallbackStrategy: 'cache',
    userMessage: '예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 관리자에게 문의하세요.'
  };
}

/**
 * 재시도 가능한 오류인지 확인
 */
export function isRetryableError(error: any): boolean {
  return analyzeFirebaseError(error).isRetryable;
}

/**
 * 사용자 친화적인 오류 메시지 반환
 */
export function getUserFriendlyErrorMessage(error: any): string {
  return analyzeFirebaseError(error).userMessage;
}

/**
 * 오류에 따른 재시도 지연 시간 반환
 */
export function getRetryDelay(error: any): number {
  return analyzeFirebaseError(error).retryDelay;
}

/**
 * Firebase 오류 로깅 (상세 정보 포함)
 */
export function logFirebaseError(context: string, error: any): void {
  const errorInfo = analyzeFirebaseError(error);
  
  console.group(`❌ [${context}] Firebase 오류`);
  console.error('원본 오류:', error);
  console.log('분석 결과:', errorInfo);
  console.log('스택 트레이스:', error?.stack);
  console.log('발생 시간:', new Date().toISOString());
  console.log('URL:', window.location.href);
  console.log('User Agent:', navigator.userAgent);
  console.groupEnd();
}
