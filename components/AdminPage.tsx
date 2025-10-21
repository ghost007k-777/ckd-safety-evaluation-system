import React, { useState, useRef } from 'react';
import { Submission, SubmissionStatus, ApprovalInfo } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import Step6Confirmation from './Step6Confirmation.tsx';
import { Input } from './ui/Input.tsx';
import { Spinner } from './ui/Spinner.tsx';
import { downloadSubmissionAsPdf, downloadSubmissionsAsExcel } from '../utils.ts';
import { useConnectionStatus } from '../contexts/DataContext.tsx';

interface AdminPageProps {
  submissions: Submission[];
  onUpdateStatus: (id: string, status: SubmissionStatus, approvalInfo?: ApprovalInfo, rejectionReason?: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

// 승인자 이름 입력 팝업 컴포넌트
interface ApprovalPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (approverName: string) => void;
  title: string;
  description: string;
}

const ApprovalPopup: React.FC<ApprovalPopupProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description 
}) => {
  const [approverName, setApproverName] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (approverName.trim()) {
      onConfirm(approverName.trim());
      setApproverName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-2xl font-bold text-[#212529] mb-3">{title}</h3>
        <p className="text-[#6C757D] mb-6 leading-relaxed">{description}</p>
        
        <form onSubmit={handleSubmit}>
          <Input
            id="approver-name"
            label="승인자 이름"
            value={approverName}
            onChange={(e) => setApproverName(e.target.value)}
            placeholder="승인자 이름을 입력해주세요"
            autoFocus
            required
          />
          
          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                onClose();
                setApproverName('');
              }}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" size="lg">
              승인
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 거부 사유 입력 팝업 컴포넌트
interface RejectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectionPopup: React.FC<RejectionPopupProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  const [reason, setReason] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-2xl font-bold text-[#DC3545] mb-3">승인 거부 사유</h3>
        <p className="text-[#6C757D] mb-6 leading-relaxed">승인을 거부하는 사유를 입력해주세요.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="rejection-reason" className="block text-sm font-semibold text-[#343A40] mb-2">
              거부 사유 <span className="text-[#DC3545]">*</span>
            </label>
            <textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="거부 사유를 상세히 입력해주세요"
              className="block w-full px-4 py-3 border-2 border-[#DEE2E6] rounded-lg text-[#212529] text-base bg-white placeholder-[#ADB5BD] transition-all duration-200 focus:border-[#DC3545] focus:ring-2 focus:ring-[#F8D7DA] hover:border-[#ADB5BD] resize-none"
              rows={4}
              autoFocus
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                onClose();
                setReason('');
              }}
            >
              취소
            </Button>
            <Button type="submit" variant="danger" size="lg">
              거부
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const statusMap: Record<SubmissionStatus, { text: string; dot: string; textBg: string; }> = {
  pending: { text: '신청 중', dot: 'bg-[#FFC107]', textBg: 'bg-[#FFF3CD] text-[#856404] border border-[#FFC107]' },
  approved: { text: '승인', dot: 'bg-[#28A745]', textBg: 'bg-[#D4EDDA] text-[#155724] border border-[#28A745]' },
  rejected: { text: '승인 거부', dot: 'bg-[#DC3545]', textBg: 'bg-[#F8D7DA] text-[#721C24] border border-[#DC3545]' },
};

const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  const { text, dot, textBg } = statusMap[status];
  return (
    <span className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg ${textBg} transition-all`}>
      <span className={`w-2.5 h-2.5 mr-2 rounded-full ${dot} animate-pulse`}></span>
      {text}
    </span>
  );
};


export const AdminPage: React.FC<AdminPageProps> = ({ submissions, onUpdateStatus, onDelete, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [approvalPopup, setApprovalPopup] = useState<{
    isOpen: boolean;
    submissionId: string;
    approvalType: 'safetyManager' | 'departmentManager';
  }>({
    isOpen: false,
    submissionId: '',
    approvalType: 'safetyManager'
  });
  const [rejectionPopup, setRejectionPopup] = useState<{
    isOpen: boolean;
    submissionId: string;
  }>({
    isOpen: false,
    submissionId: ''
  });
  const printRef = useRef<HTMLDivElement>(null);
  const connectionStatus = useConnectionStatus();

  // 디버그 로그 추가
  console.log('🔍 [AdminPage] 렌더링:', {
    submissionsCount: submissions?.length || 0,
    connectionStatus,
    isAuthenticated,
    submissions: submissions?.slice(0, 2).map(s => ({
      id: s.id,
      companyName: s.projectInfo?.companyName,
      status: s.status
    }))
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const handleDownloadPdf = async (sub: Submission) => {
    if (!printRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const filename = `안전평가서-${sub.projectInfo.companyName}-${sub.projectInfo.constructionName}.pdf`;
      await downloadSubmissionAsPdf(printRef.current, filename);
    } catch (error) {
      console.error("Failed to download PDF", error);
      alert("PDF 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };


  const handleLogin = () => {
    console.log('🔐 [AdminPage] 로그인 시도:', { password: password === 'admin' ? '올바름' : '틀림' });
    if (password === 'admin') {
      console.log('✅ [AdminPage] 로그인 성공, 인증 상태 변경');
      setIsAuthenticated(true);
      setError('');
    } else {
      console.log('❌ [AdminPage] 로그인 실패');
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  const handleDelete = (submissionId: string) => {
    if (window.confirm('이 신청서를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        onDelete(submissionId);
    }
  };

  // 승인 버튼 클릭 핸들러
  const handleApprovalClick = (submissionId: string, approvalType: 'safetyManager' | 'departmentManager') => {
    setApprovalPopup({
      isOpen: true,
      submissionId,
      approvalType
    });
  };

  // 승인 확인 핸들러
  const handleApprovalConfirm = (approverName: string) => {
    const { submissionId, approvalType } = approvalPopup;
    const submission = submissions.find(s => s.id === submissionId);
    
    if (!submission) return;

    const currentApprovalInfo = submission.approvalInfo || {};
    let newApprovalInfo: ApprovalInfo;
    let newStatus: SubmissionStatus = submission.status;

    if (approvalType === 'safetyManager') {
      newApprovalInfo = {
        ...currentApprovalInfo,
        safetyManagerApproval: {
          approved: true,
          approverName,
          approvedAt: new Date()
        }
      };
      // 안전보건관리자가 승인했지만 아직 부서팀장 승인이 필요한 상태
      newStatus = 'pending';
    } else {
      // 부서팀장 승인 - 최종 승인
      newApprovalInfo = {
        ...currentApprovalInfo,
        departmentManagerApproval: {
          approved: true,
          approverName,
          approvedAt: new Date()
        }
      };
      // 최종 승인 완료
      newStatus = 'approved';
    }

    onUpdateStatus(submissionId, newStatus, newApprovalInfo);
    
    // 팝업 닫기
    setApprovalPopup({
      isOpen: false,
      submissionId: '',
      approvalType: 'safetyManager'
    });
  };

  // 거부 버튼 클릭 핸들러
  const handleRejectionClick = (submissionId: string) => {
    setRejectionPopup({
      isOpen: true,
      submissionId
    });
  };

  // 거부 확인 핸들러
  const handleRejectionConfirm = (reason: string) => {
    const { submissionId } = rejectionPopup;
    onUpdateStatus(submissionId, 'rejected', undefined, reason);
    
    // 팝업 닫기
    setRejectionPopup({
      isOpen: false,
      submissionId: ''
    });
  };

  // 승인 팝업 닫기
  const handleApprovalCancel = () => {
    setApprovalPopup({
      isOpen: false,
      submissionId: '',
      approvalType: 'safetyManager'
    });
  };

  // 승인 단계 확인 함수
  const getApprovalStep = (submission: Submission) => {
    const approvalInfo = submission.approvalInfo;
    
    if (!approvalInfo?.safetyManagerApproval?.approved) {
      return 'safetyManager'; // 안전보건관리자 승인 대기
    } else if (!approvalInfo?.departmentManagerApproval?.approved) {
      return 'departmentManager'; // 안전보건부서팀장 승인 대기
    } else {
      return 'completed'; // 승인 완료
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader
          title="관리자 인증"
          description="계속하려면 관리자 비밀번호를 입력해주세요."
        />
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
          <Input
            id="admin-password"
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-between items-center pt-4">
             <Button type="button" variant="secondary" onClick={onBack}>
                홈으로
             </Button>
            <Button type="submit">로그인</Button>
          </div>
        </form>
      </Card>
    );
  }
  
  // 안전한 데이터 처리
  const safeSubmissions = submissions || [];
  const pendingSubmissions = safeSubmissions.filter(s => s.status === 'pending');
  const processedSubmissions = safeSubmissions
    .filter(s => s.status !== 'pending')
    .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0));

  console.log('🔐 [AdminPage] 인증 후 데이터 처리:', {
    isAuthenticated,
    totalSubmissions: safeSubmissions.length,
    pendingCount: pendingSubmissions.length,
    processedCount: processedSubmissions.length
  });

  return (
    <div>
        <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">관리자 페이지</h2>
            <p className="text-lg text-gray-600 mt-2">신청서를 검토하고 처리합니다.</p>
            
            {/* 연결 상태 표시 */}
            {connectionStatus === 'offline' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-yellow-800">
                    오프라인 모드 - 변경사항은 연결 복구 후 동기화됩니다.
                  </span>
                </div>
              </div>
            )}
        </div>
        
        <Card className="mb-12">
            <CardHeader 
                title="승인 대기 신청서"
                description="검토가 필요한 신청서 목록입니다. 항목을 클릭하여 전체 내용을 확인하세요."
            />
            {pendingSubmissions.length === 0 ? (
                <>
                  {console.log('📝 [AdminPage] 승인 대기 신청서 없음 메시지 표시')}
                  <p className="text-center text-gray-500 py-16">승인 대기 중인 신청서가 없습니다.</p>
                </>
            ) : (
                <div className="space-y-4">
                {pendingSubmissions.map((sub) => {
                  const approvalStep = getApprovalStep(sub);
                  const isExpanded = expandedId === sub.id;
                  return (
                    <div key={sub.id} className="border-2 border-[#E9ECEF] rounded-2xl overflow-hidden bg-white hover:border-[#0066CC] hover:shadow-lg transition-all duration-300">
                      {/* 요약본 */}
                      <div
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-6 cursor-pointer hover:bg-[#F8F9FA] gap-4 sm:gap-0 transition-colors"
                        onClick={() => toggleExpand(sub.id)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        aria-controls={`pending-details-${sub.id}`}
                        onKeyDown={(e) => e.key === 'Enter' && toggleExpand(sub.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg sm:text-xl text-[#212529] truncate">
                            {sub.projectInfo?.constructionName || '프로젝트명 없음'}
                          </p>
                          <p className="text-sm text-[#6C757D] mt-1.5 truncate">
                            {sub.projectInfo?.companyName || '회사명 없음'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <svg className="w-4 h-4 text-[#ADB5BD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-[#6C757D] font-medium">
                              {sub.submittedAt?.toLocaleString('ko-KR') || '날짜 미상'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={sub.status} />
                            {/* 승인 진행 상황 간단 표시 */}
                            <div className="text-xs text-[#6C757D] space-y-0.5">
                              {sub.approvalInfo?.safetyManagerApproval?.approved ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span>안전관리자 승인 완료</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                  <span>안전관리자 승인 대기</span>
                                </div>
                              )}
                              {sub.approvalInfo?.departmentManagerApproval?.approved ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  <span>부서팀장 승인 완료</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                  <span>부서팀장 승인 대기</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <svg 
                            className={`w-6 h-6 text-[#0066CC] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* 확장된 전체 내용 */}
                      {isExpanded && (
                        <div id={`pending-details-${sub.id}`} className="border-t-2 border-[#E9ECEF] bg-[#F8F9FA]">
                          <div className="p-1">
                            <Step6Confirmation data={sub} />
                          </div>
                          
                          <div className="p-5 border-t-2 border-[#E9ECEF] bg-white">
                            {/* 승인 상태 표시 */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-semibold text-blue-900 mb-3">승인 진행 상황</h4>
                              <div className="space-y-2 text-sm">
                                <div className={`flex items-center ${sub.approvalInfo?.safetyManagerApproval?.approved ? 'text-green-600' : 'text-gray-500'}`}>
                                  <span className={`w-2 h-2 rounded-full mr-2 ${sub.approvalInfo?.safetyManagerApproval?.approved ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                  안전보건관리자 승인 
                                  {sub.approvalInfo?.safetyManagerApproval?.approved && (
                                    <span className="ml-2 text-green-700 font-medium">
                                      (승인자: {sub.approvalInfo.safetyManagerApproval.approverName})
                                    </span>
                                  )}
                                </div>
                                <div className={`flex items-center ${sub.approvalInfo?.departmentManagerApproval?.approved ? 'text-green-600' : 'text-gray-500'}`}>
                                  <span className={`w-2 h-2 rounded-full mr-2 ${sub.approvalInfo?.departmentManagerApproval?.approved ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                  안전보건부서팀장 승인
                                  {sub.approvalInfo?.departmentManagerApproval?.approved && (
                                    <span className="ml-2 text-green-700 font-medium">
                                      (승인자: {sub.approvalInfo.departmentManagerApproval.approverName})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* 승인 버튼들 */}
                            <div className="flex flex-wrap justify-end gap-3">
                              <Button
                                  variant="danger"
                                  onClick={() => handleDelete(sub.id)}
                              >
                                  삭제
                              </Button>
                              <Button 
                                variant="secondary" 
                                onClick={() => handleRejectionClick(sub.id)}
                              >
                                  승인 거부
                              </Button>
                              
                              {approvalStep === 'safetyManager' && (
                                <Button 
                                  variant="primary" 
                                  onClick={() => handleApprovalClick(sub.id, 'safetyManager')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  안전보건관리자 승인
                                </Button>
                              )}
                              
                              {approvalStep === 'departmentManager' && (
                                <Button 
                                  variant="primary" 
                                  onClick={() => handleApprovalClick(sub.id, 'departmentManager')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  안전보건부서팀장 승인
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
            )}
        </Card>

        <Card>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">승인 완료 및 거부된 허가서</h3>
                    <p className="text-sm text-gray-600">이미 처리된 허가서 목록입니다. 항목을 클릭하여 전체 내용을 확인하세요.</p>
                </div>
                <div className="flex-shrink-0">
                    <Button 
                        variant="primary" 
                        onClick={() => downloadSubmissionsAsExcel(submissions)}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base"
                    >
                        <span className="hidden sm:inline">📊 엑셀로 다운로드</span>
                        <span className="sm:hidden">📊 엑셀</span>
                    </Button>
                </div>
            </div>
            {processedSubmissions.length === 0 ? (
                <>
                  {console.log('📝 [AdminPage] 처리된 신청서 없음 메시지 표시')}
                  <p className="text-center text-gray-500 py-16">처리된 허가서가 없습니다.</p>
                </>
            ) : (
                <div className="space-y-4">
                {processedSubmissions.map((sub) => {
                  const isExpanded = expandedId === sub.id;
                  return (
                    <div key={sub.id} className="border-2 border-[#E9ECEF] rounded-2xl overflow-hidden bg-white hover:border-[#0066CC] hover:shadow-lg transition-all duration-300">
                      {/* 요약본 */}
                      <div
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-6 cursor-pointer hover:bg-[#F8F9FA] gap-4 sm:gap-0 transition-colors"
                        onClick={() => toggleExpand(sub.id)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        aria-controls={`processed-details-${sub.id}`}
                        onKeyDown={(e) => e.key === 'Enter' && toggleExpand(sub.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg sm:text-xl text-[#212529] truncate">
                            {sub.projectInfo?.constructionName || '프로젝트명 없음'}
                          </p>
                          <p className="text-sm text-[#6C757D] mt-1.5 truncate">
                            {sub.projectInfo?.companyName || '회사명 없음'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <svg className="w-4 h-4 text-[#ADB5BD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-[#6C757D] font-medium">
                              {sub.submittedAt?.toLocaleString('ko-KR') || '날짜 미상'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={sub.status} />
                            {/* 승인자 정보 간단 표시 */}
                            {sub.status === 'approved' && sub.approvalInfo && (
                              <div className="text-xs text-[#6C757D] space-y-0.5">
                                {sub.approvalInfo.safetyManagerApproval?.approved && (
                                  <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>안전관리자: {sub.approvalInfo.safetyManagerApproval.approverName}</span>
                                  </div>
                                )}
                                {sub.approvalInfo.departmentManagerApproval?.approved && (
                                  <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>부서팀장: {sub.approvalInfo.departmentManagerApproval.approverName}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* 거부 사유 간단 표시 */}
                            {sub.status === 'rejected' && sub.rejectionReason && (
                              <div className="text-xs text-[#DC3545] max-w-xs truncate">
                                거부 사유: {sub.rejectionReason}
                              </div>
                            )}
                          </div>
                          <svg 
                            className={`w-6 h-6 text-[#0066CC] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* 확장된 전체 내용 */}
                      {isExpanded && (
                        <div id={`processed-details-${sub.id}`} className="border-t-2 border-[#E9ECEF] bg-[#F8F9FA]">
                          {/* 거부 사유 전체 표시 */}
                          {sub.status === 'rejected' && sub.rejectionReason && (
                            <div className="p-5 bg-[#F8D7DA] border-b-2 border-[#DC3545]">
                              <h4 className="font-semibold text-[#721C24] mb-2">거부 사유</h4>
                              <p className="text-sm text-[#721C24]">{sub.rejectionReason}</p>
                            </div>
                          )}
                          
                          <div className="p-1">
                            <Step6Confirmation data={sub} ref={printRef} />
                          </div>
                          
                          <div className="p-5 border-t-2 border-[#E9ECEF] bg-white">
                            <div className="flex flex-wrap justify-end gap-3">
                              <Button
                                variant="danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(sub.id);
                                }}
                              >
                                삭제
                              </Button>
                              {sub.status === 'approved' && (
                                <Button 
                                  variant="primary"
                                  onClick={() => handleDownloadPdf(sub)} 
                                  disabled={isDownloading}
                                >
                                  {isDownloading ? (
                                    <div className="flex items-center gap-2">
                                      <Spinner />
                                      <span>다운로드 중</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span>PDF 다운로드</span>
                                    </div>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
            )}
        </Card>

        <div className="mt-12">
            <Button variant="secondary" onClick={onBack}>
            홈으로 돌아가기
            </Button>
      </div>

        {/* 승인자 이름 입력 팝업 */}
        <ApprovalPopup
          isOpen={approvalPopup.isOpen}
          onClose={handleApprovalCancel}
          onConfirm={handleApprovalConfirm}
          title={
            approvalPopup.approvalType === 'safetyManager' 
              ? '안전보건관리자 승인' 
              : '안전보건부서팀장 승인'
          }
          description={
            approvalPopup.approvalType === 'safetyManager'
              ? '안전보건관리자 승인을 위해 승인자 이름을 입력해주세요.'
              : '안전보건부서팀장 승인을 위해 승인자 이름을 입력해주세요. 이 승인으로 최종 승인이 완료됩니다.'
          }
        />

        {/* 거부 사유 입력 팝업 */}
        <RejectionPopup
          isOpen={rejectionPopup.isOpen}
          onClose={() => setRejectionPopup({ isOpen: false, submissionId: '' })}
          onConfirm={handleRejectionConfirm}
        />
    </div>
  );
};