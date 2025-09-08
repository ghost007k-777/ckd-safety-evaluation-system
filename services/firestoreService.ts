import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase.ts';
import { FormData, Submission, SubmissionStatus } from '../types.ts';
import { generateUniqueId } from '../utils.ts';

const SUBMISSIONS_COLLECTION = 'submissions';

// Firestore 데이터를 애플리케이션 타입으로 변환
const convertFirestoreToSubmission = (doc: any): Submission => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    submittedAt: data.submittedAt.toDate(),
    safetyTraining: {
      ...data.safetyTraining,
      completionDate: data.safetyTraining.completionDate 
        ? data.safetyTraining.completionDate.toDate() 
        : null
    }
  };
};

// 애플리케이션 데이터를 Firestore 형식으로 변환
const convertSubmissionToFirestore = (submission: Omit<Submission, 'id'>) => {
  return {
    ...submission,
    submittedAt: Timestamp.fromDate(submission.submittedAt),
    safetyTraining: {
      ...submission.safetyTraining,
      completionDate: submission.safetyTraining.completionDate 
        ? Timestamp.fromDate(submission.safetyTraining.completionDate)
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

// 모든 신청서 조회
export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION), 
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions: Submission[] = [];
    
    querySnapshot.forEach((doc) => {
      submissions.push(convertFirestoreToSubmission(doc));
    });
    
    return submissions;
  } catch (error) {
    console.error('신청서 조회 중 오류 발생:', error);
    throw error;
  }
};

// 신청서 상태 업데이트
export const updateSubmissionStatus = async (
  id: string, 
  status: SubmissionStatus
): Promise<void> => {
  try {
    const submissionRef = doc(db, SUBMISSIONS_COLLECTION, id);
    await updateDoc(submissionRef, { status });
    console.log('신청서 상태가 업데이트되었습니다:', id, status);
  } catch (error) {
    console.error('신청서 상태 업데이트 중 오류 발생:', error);
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

// 실시간 신청서 리스너 (선택사항)
export const subscribeToSubmissions = (
  callback: (submissions: Submission[]) => void
): (() => void) => {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION), 
    orderBy('submittedAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const submissions: Submission[] = [];
    querySnapshot.forEach((doc) => {
      submissions.push(convertFirestoreToSubmission(doc));
    });
    callback(submissions);
  });
  
  return unsubscribe;
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
