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
  onUpdateStatus: (id: string, status: SubmissionStatus, approvalInfo?: ApprovalInfo) => void;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
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
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onClose();
                setApproverName('');
              }}
            >
              취소
            </Button>
            <Button type="submit" variant="primary">
              승인
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const statusMap: Record<SubmissionStatus, { text: string; dot: string; textBg: string; }> = {
  pending: { text: '신청 중', dot: 'bg-amber-500', textBg: 'bg-amber-100 text-amber-800' },
  approved: { text: '승인', dot: 'bg-emerald-500', textBg: 'bg-emerald-100 text-emerald-800' },
  rejected: { text: '승인 거부', dot: 'bg-rose-500', textBg: 'bg-rose-100 text-rose-800' },
};

const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  const { text, dot, textBg } = statusMap[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full ${textBg}`}>
      <span className={`w-2 h-2 mr-2 rounded-full ${dot}`}></span>
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
                description="검토가 필요한 신청서 목록입니다."
            />
            {pendingSubmissions.length === 0 ? (
                <>
                  {console.log('📝 [AdminPage] 승인 대기 신청서 없음 메시지 표시')}
                  <p className="text-center text-gray-500 py-16">승인 대기 중인 신청서가 없습니다.</p>
                </>
            ) : (
                <div className="space-y-10">
                {pendingSubmissions.map((sub) => {
                  const approvalStep = getApprovalStep(sub);
                  return (
                    <div key={sub.id}>
                        <Step6Confirmation data={sub} />
                        <div className="mt-6">
                          {/* 승인 상태 표시 */}
                          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">승인 진행 상황</h4>
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
                              onClick={() => onUpdateStatus(sub.id, 'rejected')}
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
                  );
                })}
                </div>
            )}
        </Card>

        <Card>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">승인 완료 및 거부된 신청서</h3>
                    <p className="text-sm text-gray-600">이미 처리된 신청서 목록입니다.</p>
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
                  <p className="text-center text-gray-500 py-16">처리된 신청서가 없습니다.</p>
                </>
            ) : (
                <div className="space-y-4">
                {processedSubmissions.map((sub) => (
                    <div key={sub.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-5 cursor-pointer hover:bg-gray-50 gap-3 sm:gap-4"
                      onClick={() => toggleExpand(sub.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && toggleExpand(sub.id)}
                    >
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-base sm:text-lg text-gray-800 truncate">{sub.projectInfo?.constructionName || '프로젝트명 없음'}</p>
                            <p className="text-sm text-gray-500 mt-1 truncate">{sub.projectInfo?.companyName || '회사명 없음'}</p>
                            <p className="text-xs text-gray-400 mt-2">{sub.submittedAt?.toLocaleString('ko-KR') || '날짜 미상'}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4 flex-shrink-0">
                            <StatusBadge status={sub.status} />
                            <Button
                                variant="danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(sub.id);
                                }}
                                className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                            >
                                <span className="hidden sm:inline">삭제</span>
                                <span className="sm:hidden">🗑️</span>
                            </Button>
                            <div
                                role="button"
                                aria-label="세부 정보 보기"
                                onClick={(e) => { e.stopPropagation(); toggleExpand(sub.id); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleExpand(sub.id);}}}
                                className="p-1 rounded-full hover:bg-gray-200"
                            >
                                <svg className={`w-6 h-6 text-gray-500 transform transition-transform ${expandedId === sub.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {expandedId === sub.id && (
                        <div className="border-t bg-white">
                           {sub.status === 'approved' && (
                            <div className="p-4 bg-gray-50 flex justify-end">
                                <Button onClick={() => handleDownloadPdf(sub)} disabled={isDownloading}>
                                    {isDownloading ? <Spinner /> : 'PDF 다운로드'}
                                </Button>
                            </div>
                          )}
                          <div className="p-1">
                            <Step6Confirmation data={sub} ref={printRef} />
                          </div>
                        </div>
                    )}
                    </div>
                ))}
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
    </div>
  );
};