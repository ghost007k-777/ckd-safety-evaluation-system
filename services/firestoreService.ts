import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase.ts';
import { FormData, Submission, SubmissionStatus, ApprovalInfo } from '../types.ts';
import { generateUniqueId } from '../utils.ts';

const SUBMISSIONS_COLLECTION = 'submissions';

// Firestore 데이터를 애플리케이션 타입으로 변환
const convertFirestoreToSubmission = (doc: any): Submission => {
  const data = doc.data();

  // 안전한 데이터 변환 - safetyTraining이 없을 수도 있음
  const safetyTraining = data.safetyTraining || {};

  // ApprovalInfo 변환
  let approvalInfo: ApprovalInfo | undefined;
  if (data.approvalInfo) {
    approvalInfo = {};

    if (data.approvalInfo.safetyManagerApproval) {
      approvalInfo.safetyManagerApproval = {
        ...data.approvalInfo.safetyManagerApproval,
        approvedAt: data.approvalInfo.safetyManagerApproval.approvedAt?.toDate() || new Date()
      };
    }

    if (data.approvalInfo.departmentManagerApproval) {
      approvalInfo.departmentManagerApproval = {
        ...data.approvalInfo.departmentManagerApproval,
        approvedAt: data.approvalInfo.departmentManagerApproval.approvedAt?.toDate() || new Date()
      };
    }
  }

  return {
    id: doc.id,
    ...data,
    submittedAt: data.submittedAt?.toDate() || new Date(),
    safetyTraining: {
      ...safetyTraining,
      completionDate: safetyTraining.completionDate
        ? safetyTraining.completionDate.toDate()
        : null
    },
    ...(approvalInfo && { approvalInfo })
  };
};

// 애플리케이션 데이터를 Firestore 형식으로 변환
const convertSubmissionToFirestore = (submission: Omit<Submission, 'id'>) => {
  // 안전한 데이터 변환
  const safetyTraining = submission.safetyTraining || {};

  return {
    ...submission,
    submittedAt: Timestamp.fromDate(submission.submittedAt || new Date()),
    safetyTraining: {
      ...safetyTraining,
      completionDate: safetyTraining.completionDate
        ? Timestamp.fromDate(safetyTraining.completionDate)
        : null
    }
  };
};

// 신청서 추가
export const addSubmission = async (formData: FormData): Promise<string> => {
  try {
    const newSubmission = {
      status: 'pending' as SubmissionStatus,
      submittedAt: new Date(),
      ...formData,
    };

    const docRef = await addDoc(
      collection(db, SUBMISSIONS_COLLECTION),
      convertSubmissionToFirestore(newSubmission)
    );

    console.log('신청서가 성공적으로 저장되었습니다:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('신청서 저장 중 오류 발생:', error);
    throw error;
  }
};

// 모든 신청서 조회 (폴백 로직 포함)
export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    console.log('📖 [firestoreService] 신청서 조회 시작...');

    // 1차 시도: orderBy 쿼리
    let q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      orderBy('submittedAt', 'desc')
    );

    let querySnapshot = await getDocs(q);
    const submissions: Submission[] = [];

    querySnapshot.forEach((doc) => {
      try {
        submissions.push(convertFirestoreToSubmission(doc));
      } catch (error) {
        console.warn(`⚠️ [firestoreService] 문서 ${doc.id} 변환 실패:`, error);
        // 변환 실패한 문서는 건너뛰고 계속 진행
      }
    });

    console.log(`✅ [firestoreService] ${submissions.length}개 신청서 조회 완료`);
    return submissions;

  } catch (error: any) {
    console.warn('⚠️ [firestoreService] orderBy 쿼리 실패, 단순 쿼리로 폴백:', error);

    // 2차 시도: 단순 쿼리 (orderBy 없이)
    try {
      const simpleQuery = collection(db, SUBMISSIONS_COLLECTION);
      const querySnapshot = await getDocs(simpleQuery);
      const submissions: Submission[] = [];

      querySnapshot.forEach((doc) => {
        try {
          submissions.push(convertFirestoreToSubmission(doc));
        } catch (error) {
          console.warn(`⚠️ [firestoreService] 폴백 문서 ${doc.id} 변환 실패:`, error);
          // 변환 실패한 문서는 건너뛰고 계속 진행
        }
      });

      // 클라이언트에서 정렬
      submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

      console.log(`✅ [firestoreService] 폴백으로 ${submissions.length}개 신청서 조회 완료`);
      return submissions;

    } catch (fallbackError) {
      console.error('❌ [firestoreService] 모든 쿼리 방법 실패:', fallbackError);
      throw fallbackError;
    }
  }
};

// 신청서 상태 업데이트
export const updateSubmissionStatus = async (
  id: string,
  status: SubmissionStatus,
  approvalInfo?: ApprovalInfo,
  rejectionReason?: string
): Promise<void> => {
  try {
    const submissionRef = doc(db, SUBMISSIONS_COLLECTION, id);
    const updateData: any = { status };

    // 승인 정보가 있으면 함께 업데이트
    if (approvalInfo) {
      // ApprovalInfo의 Date 객체들을 Timestamp로 변환
      const convertedApprovalInfo: any = {};

      if (approvalInfo.safetyManagerApproval) {
        convertedApprovalInfo.safetyManagerApproval = {
          ...approvalInfo.safetyManagerApproval,
          approvedAt: Timestamp.fromDate(approvalInfo.safetyManagerApproval.approvedAt)
        };
      }

      if (approvalInfo.departmentManagerApproval) {
        convertedApprovalInfo.departmentManagerApproval = {
          ...approvalInfo.departmentManagerApproval,
          approvedAt: Timestamp.fromDate(approvalInfo.departmentManagerApproval.approvedAt)
        };
      }

      updateData.approvalInfo = convertedApprovalInfo;
    }

    // 거부 사유가 있으면 추가
    if (rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason;
    }

    await updateDoc(submissionRef, updateData);
    console.log('신청서 상태가 업데이트되었습니다:', id, status, approvalInfo, rejectionReason);
  } catch (error) {
    console.error('신청서 상태 업데이트 중 오류 발생:', error);
    throw error;
  }
};

// 신청서 수정
export const updateSubmission = async (id: string, formData: FormData): Promise<void> => {
  try {
    const submissionRef = doc(db, SUBMISSIONS_COLLECTION, id);
    const submissionDoc = await getDoc(submissionRef);

    if (!submissionDoc.exists()) {
      throw new Error('신청서를 찾을 수 없습니다.');
    }

    const existingData = submissionDoc.data() as Submission;
    const updateData: any = {
      ...existingData,
      ...formData,
      // 기존 id, submittedAt, status는 유지
      id: existingData.id,
      submittedAt: existingData.submittedAt,
      status: existingData.status,
      approvalInfo: existingData.approvalInfo,
      rejectionReason: existingData.rejectionReason
    };

    await updateDoc(submissionRef, updateData);
    console.log('신청서가 수정되었습니다:', id);
  } catch (error) {
    console.error('신청서 수정 중 오류 발생:', error);
    throw error;
  }
};

// 신청서 삭제
export const deleteSubmission = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, id));
    console.log('신청서가 삭제되었습니다:', id);
  } catch (error) {
    console.error('신청서 삭제 중 오류 발생:', error);
    throw error;
  }
};

// 실시간 신청서 리스너 (폴백 로직 포함)
export const subscribeToSubmissions = (
  callback: (submissions: Submission[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  console.log('📡 [firestoreService] 실시간 구독 시작...');

  // 1차 시도: orderBy 쿼리로 실시간 구독
  const tryOrderBySubscription = () => {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      orderBy('submittedAt', 'desc')
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const submissions: Submission[] = [];
          querySnapshot.forEach((doc) => {
            try {
              submissions.push(convertFirestoreToSubmission(doc));
            } catch (error) {
              console.warn(`⚠️ [firestoreService] 실시간 문서 ${doc.id} 변환 실패:`, error);
              // 변환 실패한 문서는 건너뛰고 계속 진행
            }
          });
          console.log(`📡 [firestoreService] 실시간 업데이트: ${submissions.length}개의 신청서 동기화`);
          callback(submissions);
        } catch (error) {
          console.error('❌ [firestoreService] 실시간 데이터 처리 오류:', error);
          if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
        }
      },
      (error) => {
        console.warn('⚠️ [firestoreService] orderBy 실시간 구독 실패, 단순 구독으로 폴백:', error);

        // 2차 시도: 단순 쿼리로 실시간 구독
        const fallbackUnsubscribe = trySimpleSubscription();
        if (!fallbackUnsubscribe && onError) {
          onError(error);
        }
      }
    );
  };

  // 단순 쿼리로 실시간 구독
  const trySimpleSubscription = () => {
    try {
      const simpleCollection = collection(db, SUBMISSIONS_COLLECTION);

      return onSnapshot(
        simpleCollection,
        (querySnapshot) => {
          try {
            const submissions: Submission[] = [];
            querySnapshot.forEach((doc) => {
              try {
                submissions.push(convertFirestoreToSubmission(doc));
              } catch (error) {
                console.warn(`⚠️ [firestoreService] 폴백 실시간 문서 ${doc.id} 변환 실패:`, error);
                // 변환 실패한 문서는 건너뛰고 계속 진행
              }
            });

            // 클라이언트에서 정렬
            submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

            console.log(`📡 [firestoreService] 폴백 실시간 업데이트: ${submissions.length}개의 신청서 동기화`);
            callback(submissions);
          } catch (error) {
            console.error('❌ [firestoreService] 폴백 실시간 데이터 처리 오류:', error);
            if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
          }
        },
        (error) => {
          console.error('❌ [firestoreService] 폴백 실시간 구독도 실패:', error);
          if (onError) onError(error);
        }
      );
    } catch (error) {
      console.error('❌ [firestoreService] 폴백 구독 설정 실패:', error);
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
      return null;
    }
  };

  // 먼저 orderBy 시도
  try {
    return tryOrderBySubscription();
  } catch (error) {
    console.warn('⚠️ [firestoreService] orderBy 구독 설정 실패, 폴백 시도:', error);
    const fallbackUnsubscribe = trySimpleSubscription();
    if (!fallbackUnsubscribe && onError) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
    return fallbackUnsubscribe || (() => { });
  }
};

// Firebase 연결 테스트 함수
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // 빈 쿼리로 연결 테스트
    const testQuery = query(collection(db, SUBMISSIONS_COLLECTION));
    await getDocs(testQuery);
    console.log('✅ Firebase 연결 성공!');
    return true;
  } catch (error) {
    console.error('❌ Firebase 연결 실패:', error);
    return false;
  }
};
