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

type ViewMode = 'home' | 'pending' | 'processed' | 'calendar';

export const AdminPage: React.FC<AdminPageProps> = ({ submissions, onUpdateStatus, onDelete, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'approved' | 'rejected'>('approved');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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
    if (password === 'admin') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  const handleDelete = (submissionId: string) => {
    if (window.confirm('이 신청서를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        onDelete(submissionId);
    }
  };

  const handleApprovalClick = (submissionId: string, approvalType: 'safetyManager' | 'departmentManager') => {
    setApprovalPopup({
      isOpen: true,
      submissionId,
      approvalType
    });
  };

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
      newStatus = 'pending';
    } else {
      newApprovalInfo = {
        ...currentApprovalInfo,
        departmentManagerApproval: {
          approved: true,
          approverName,
          approvedAt: new Date()
        }
      };
      newStatus = 'approved';
    }

    onUpdateStatus(submissionId, newStatus, newApprovalInfo);
    
    setApprovalPopup({
      isOpen: false,
      submissionId: '',
      approvalType: 'safetyManager'
    });
  };

  const handleRejectionClick = (submissionId: string) => {
    setRejectionPopup({
      isOpen: true,
      submissionId
    });
  };

  const handleRejectionConfirm = (reason: string) => {
    const { submissionId } = rejectionPopup;
    onUpdateStatus(submissionId, 'rejected', undefined, reason);
    
    setRejectionPopup({
      isOpen: false,
      submissionId: ''
    });
  };

  const handleApprovalCancel = () => {
    setApprovalPopup({
      isOpen: false,
      submissionId: '',
      approvalType: 'safetyManager'
    });
  };

  const getApprovalStep = (submission: Submission) => {
    const approvalInfo = submission.approvalInfo;
    
    if (!approvalInfo?.safetyManagerApproval?.approved) {
      return 'safetyManager';
    } else if (!approvalInfo?.departmentManagerApproval?.approved) {
      return 'departmentManager';
    } else {
      return 'completed';
    }
  };

  // 달력 관련 함수
  const getDateStats = (date: Date) => {
    const dateStr = date.toDateString();
    const dailySubmissions = submissions.filter(sub => 
      sub.submittedAt && sub.submittedAt.toDateString() === dateStr
    );
    
    return {
      total: dailySubmissions.length,
      approved: dailySubmissions.filter(s => s.status === 'approved').length,
      pending: dailySubmissions.filter(s => s.status === 'pending').length,
      rejected: dailySubmissions.filter(s => s.status === 'rejected').length,
      submissions: dailySubmissions
    };
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
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
  
  const safeSubmissions = submissions || [];
  const pendingSubmissions = safeSubmissions
    .filter(s => s.status === 'pending')
    .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0));
  const approvedSubmissions = safeSubmissions
    .filter(s => s.status === 'approved')
    .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0));
  const rejectedSubmissions = safeSubmissions
    .filter(s => s.status === 'rejected')
    .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0));

  const groupByDate = (submissionsList: Submission[]) => {
    return submissionsList.reduce((acc, submission) => {
      try {
        const dateKey = submission.submittedAt?.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        }) || '날짜 미상';
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(submission);
      } catch (error) {
        console.warn('⚠️ [AdminPage] 날짜 변환 실패:', error);
      }
      return acc;
    }, {} as Record<string, Submission[]>);
  };

  const groupedPendingSubmissions = groupByDate(pendingSubmissions);
  const groupedApprovedSubmissions = groupByDate(approvedSubmissions);
  const groupedRejectedSubmissions = groupByDate(rejectedSubmissions);

  // 홈 화면 - 아이콘 카드
  if (viewMode === 'home') {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">관리자 페이지</h2>
          <p className="text-lg text-gray-600 mt-2">카드를 선택하여 신청서를 관리하세요.</p>
          
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 승인 대기 신청서 카드 */}
          <button
            onClick={() => setViewMode('pending')}
            className="bg-gradient-to-br from-[#FFF3CD] to-[#FFE69C] border-2 border-[#FFC107] rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#FFC107] rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#856404] mb-2">승인 대기 신청서</h3>
              <p className="text-[#856404] mb-4">검토가 필요한 신청서</p>
              <div className="text-4xl font-bold text-[#856404]">{pendingSubmissions.length}</div>
              <p className="text-sm text-[#856404] mt-1">건</p>
            </div>
          </button>

          {/* 처리된 허가서 카드 */}
          <button
            onClick={() => setViewMode('processed')}
            className="bg-gradient-to-br from-[#D4EDDA] to-[#A8D5BA] border-2 border-[#28A745] rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#28A745] rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#155724] mb-2">처리된 허가서</h3>
              <p className="text-[#155724] mb-4">승인/거부된 허가서</p>
              <div className="text-4xl font-bold text-[#155724]">
                {approvedSubmissions.length + rejectedSubmissions.length}
              </div>
              <p className="text-sm text-[#155724] mt-1">건</p>
            </div>
          </button>

          {/* 달력 보기 카드 */}
          <button
            onClick={() => setViewMode('calendar')}
            className="bg-gradient-to-br from-[#CCE1FF] to-[#99C7FF] border-2 border-[#0066CC] rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#0066CC] rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#003E7A] mb-2">달력 보기</h3>
              <p className="text-[#003E7A] mb-4">날짜별 신청서 조회</p>
              <div className="text-4xl font-bold text-[#003E7A]">
                {currentMonth.getMonth() + 1}
              </div>
              <p className="text-sm text-[#003E7A] mt-1">월</p>
            </div>
          </button>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="secondary" onClick={onBack}>
            홈으로 돌아가기
          </Button>
          <Button 
            variant="primary" 
            onClick={() => downloadSubmissionsAsExcel(submissions)}
            className="bg-green-600 hover:bg-green-700"
          >
            📊 전체 엑셀 다운로드
          </Button>
        </div>

        {/* 팝업들 */}
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
        <RejectionPopup
          isOpen={rejectionPopup.isOpen}
          onClose={() => setRejectionPopup({ isOpen: false, submissionId: '' })}
          onConfirm={handleRejectionConfirm}
        />
      </div>
    );
  }

  // 달력 뷰
  if (viewMode === 'calendar') {
    return (
      <div>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">달력 보기</h2>
            <p className="text-lg text-gray-600 mt-2">날짜별 신청서를 확인하세요.</p>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('home')}>
            ← 뒤로 가기
          </Button>
        </div>

        <Card>
          {/* 달력 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold text-[#212529]">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`text-center py-2 font-semibold ${
                  index === 0 ? 'text-[#DC3545]' : index === 6 ? 'text-[#0066CC]' : 'text-[#6C757D]'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {generateCalendarDays().map((date, index) => {
              const stats = getDateStats(date);
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSunday = date.getDay() === 0;
              const isSaturday = date.getDay() === 6;

              return (
                <div
                  key={index}
                  onClick={() => stats.total > 0 && setSelectedDate(date)}
                  className={`min-h-[80px] p-2 border-2 rounded-lg transition-all ${
                    isCurrentMonth 
                      ? 'bg-white border-[#E9ECEF] hover:border-[#0066CC] hover:shadow-md cursor-pointer' 
                      : 'bg-[#F8F9FA] border-[#F8F9FA] opacity-50'
                  } ${isToday ? 'ring-2 ring-[#0066CC]' : ''} ${
                    stats.total > 0 && isCurrentMonth ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    !isCurrentMonth ? 'text-[#ADB5BD]' : 
                    isSunday ? 'text-[#DC3545]' : 
                    isSaturday ? 'text-[#0066CC]' : 'text-[#212529]'
                  }`}>
                    {date.getDate()}
                  </div>
                  {stats.total > 0 && isCurrentMonth && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-center bg-[#E9ECEF] rounded px-1 py-0.5">
                        총 {stats.total}건
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {stats.approved > 0 && (
                          <div className="text-[10px] flex items-center gap-1 text-[#28A745]">
                            <span className="w-1.5 h-1.5 bg-[#28A745] rounded-full"></span>
                            승인 {stats.approved}
                          </div>
                        )}
                        {stats.pending > 0 && (
                          <div className="text-[10px] flex items-center gap-1 text-[#FFC107]">
                            <span className="w-1.5 h-1.5 bg-[#FFC107] rounded-full"></span>
                            승인중 {stats.pending}
                          </div>
                        )}
                        {stats.rejected > 0 && (
                          <div className="text-[10px] flex items-center gap-1 text-[#DC3545]">
                            <span className="w-1.5 h-1.5 bg-[#DC3545] rounded-full"></span>
                            거부 {stats.rejected}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 선택된 날짜의 신청서 목록 */}
          {selectedDate && (
            <div className="mt-8 pt-8 border-t-2 border-[#E9ECEF]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-[#212529]">
                  {selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })} 신청서
                </h4>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[#6C757D] hover:text-[#212529] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {getDateStats(selectedDate).submissions.map((sub) => {
                  const isExpanded = expandedId === sub.id;
                  const approvalStep = getApprovalStep(sub);
                  
                  return (
                    <div key={sub.id} className="border-2 border-[#E9ECEF] rounded-2xl overflow-hidden bg-white hover:border-[#0066CC] hover:shadow-lg transition-all duration-300">
                      <div
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-6 cursor-pointer hover:bg-[#F8F9FA] gap-4 sm:gap-0 transition-colors"
                        onClick={() => toggleExpand(sub.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg sm:text-xl text-[#212529] truncate">{sub.projectInfo?.constructionName || '프로젝트명 없음'}</p>
                          <p className="text-sm text-[#6C757D] mt-1.5 truncate">{sub.projectInfo?.companyName || '회사명 없음'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <svg className="w-4 h-4 text-[#ADB5BD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-[#6C757D] font-medium">
                              {sub.submittedAt?.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) || '시간 미상'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                          <StatusBadge status={sub.status} />
                          <svg className={`w-6 h-6 text-[#0066CC] transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t-2 border-[#E9ECEF] bg-[#F8F9FA]">
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
                            {sub.status === 'pending' && (
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
                            )}
                            
                            <div className="flex flex-wrap justify-end gap-3">
                              <Button variant="danger" onClick={() => handleDelete(sub.id)}>
                                삭제
                              </Button>
                              {sub.status === 'pending' && (
                                <>
                                  <Button variant="secondary" onClick={() => handleRejectionClick(sub.id)}>
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
                                </>
                              )}
                              {sub.status === 'approved' && (
                                <Button 
                                  variant="primary"
                                  onClick={() => handleDownloadPdf(sub)} 
                                  disabled={isDownloading}
                                >
                                  {isDownloading ? (
                                    <div className="flex items-center gap-2">
                                      <Spinner size="sm" color="white" />
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
            </div>
          )}
        </Card>

        {/* 팝업들 */}
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
        <RejectionPopup
          isOpen={rejectionPopup.isOpen}
          onClose={() => setRejectionPopup({ isOpen: false, submissionId: '' })}
          onConfirm={handleRejectionConfirm}
        />
      </div>
    );
  }

  // 승인 대기 신청서 뷰
  if (viewMode === 'pending') {
    return (
      <div>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">승인 대기 신청서</h2>
            <p className="text-lg text-gray-600 mt-2">검토가 필요한 신청서 목록입니다.</p>
          </div>
          <Button variant="secondary" onClick={() => setViewMode('home')}>
            ← 뒤로 가기
          </Button>
        </div>

        {connectionStatus === 'offline' && (
          <div className="mb-6 p-4 bg-[#FFF3CD] border-2 border-[#FFC107] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-[#FFC107] rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-[#856404]">
                오프라인 모드 - 캐시된 데이터를 표시하고 있습니다.
              </span>
            </div>
          </div>
        )}
        
        <Card>
          {pendingSubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-16">승인 대기 중인 신청서가 없습니다.</p>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedPendingSubmissions).map(([date, subs]) => (
                <section key={date}>
                  <h3 className="text-xl font-bold text-[#212529] mb-5 pb-3 border-b-2 border-[#0066CC]">
                    {date}
                  </h3>
                  <div className="space-y-4">
                    {subs.map((sub) => {
                      const approvalStep = getApprovalStep(sub);
                      const isExpanded = expandedId === sub.id;
                      return (
                        <div key={sub.id} className="border-2 border-[#E9ECEF] rounded-2xl overflow-hidden bg-white hover:border-[#0066CC] hover:shadow-lg transition-all duration-300">
                          <div
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-6 cursor-pointer hover:bg-[#F8F9FA] gap-4 sm:gap-0 transition-colors"
                            onClick={() => toggleExpand(sub.id)}
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
                          
                          {isExpanded && (
                            <div className="border-t-2 border-[#E9ECEF] bg-[#F8F9FA]">
                              <div className="p-1">
                                <Step6Confirmation data={sub} />
                              </div>
                              
                              <div className="p-5 border-t-2 border-[#E9ECEF] bg-white">
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
                                
                                <div className="flex flex-wrap justify-end gap-3">
                                  <Button variant="danger" onClick={() => handleDelete(sub.id)}>
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
                </section>
              ))}
            </div>
          )}
        </Card>

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
        <RejectionPopup
          isOpen={rejectionPopup.isOpen}
          onClose={() => setRejectionPopup({ isOpen: false, submissionId: '' })}
          onConfirm={handleRejectionConfirm}
        />
      </div>
    );
  }

  // 처리된 허가서 뷰
  if (viewMode === 'processed') {
    const displaySubmissions = activeTab === 'approved' ? approvedSubmissions : rejectedSubmissions;
    const groupedSubmissions = activeTab === 'approved' ? groupedApprovedSubmissions : groupedRejectedSubmissions;

    return (
      <div>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">처리된 허가서</h2>
            <p className="text-lg text-gray-600 mt-2">승인 및 거부된 허가서 목록입니다.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              onClick={() => downloadSubmissionsAsExcel(submissions)}
              className="bg-green-600 hover:bg-green-700"
            >
              📊 엑셀 다운로드
            </Button>
            <Button variant="secondary" onClick={() => setViewMode('home')}>
              ← 뒤로 가기
            </Button>
          </div>
        </div>

        <Card>
          {/* 탭 버튼 */}
          <div className="flex gap-2 border-b-2 border-[#E9ECEF] mb-8">
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
                activeTab === 'approved'
                  ? 'text-[#0066CC] border-[#0066CC] bg-[#F0F7FF]'
                  : 'text-[#6C757D] border-transparent hover:text-[#0066CC] hover:bg-[#F8F9FA]'
              }`}
            >
              승인 완료 ({approvedSubmissions.length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-[2px] ${
                activeTab === 'rejected'
                  ? 'text-[#DC3545] border-[#DC3545] bg-[#FFF5F5]'
                  : 'text-[#6C757D] border-transparent hover:text-[#DC3545] hover:bg-[#F8F9FA]'
              }`}
            >
              거부된 허가서 ({rejectedSubmissions.length})
            </button>
          </div>

          {displaySubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              {activeTab === 'approved' ? '승인 완료된 허가서가 없습니다.' : '거부된 허가서가 없습니다.'}
            </p>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedSubmissions).map(([date, subs]) => (
                <section key={date}>
                  <h3 className={`text-xl font-bold text-[#212529] mb-5 pb-3 border-b-2 ${
                    activeTab === 'approved' ? 'border-[#28A745]' : 'border-[#DC3545]'
                  }`}>
                    {date}
                  </h3>
                  <div className="space-y-4">
                    {subs.map((sub) => {
                      const isExpanded = expandedId === sub.id;
                      return (
                        <div key={sub.id} className="border-2 border-[#E9ECEF] rounded-2xl overflow-hidden bg-white hover:border-[#0066CC] hover:shadow-lg transition-all duration-300">
                          <div
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-6 cursor-pointer hover:bg-[#F8F9FA] gap-4 sm:gap-0 transition-colors"
                            onClick={() => toggleExpand(sub.id)}
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
                          
                          {isExpanded && (
                            <div className="border-t-2 border-[#E9ECEF] bg-[#F8F9FA]">
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
                                  <Button variant="danger" onClick={() => handleDelete(sub.id)}>
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
                                          <Spinner size="sm" color="white" />
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
                </section>
              ))}
            </div>
          )}
        </Card>

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
        <RejectionPopup
          isOpen={rejectionPopup.isOpen}
          onClose={() => setRejectionPopup({ isOpen: false, submissionId: '' })}
          onConfirm={handleRejectionConfirm}
        />
      </div>
    );
  }

  // 이 코드는 실행되지 않아야 함
  return null;
};
