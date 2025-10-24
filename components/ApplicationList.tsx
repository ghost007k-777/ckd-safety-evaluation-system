import React, { useState, useRef } from 'react';
import { Submission, SubmissionStatus } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import Step6Confirmation from './Step6Confirmation.tsx';
import { Spinner } from './ui/Spinner.tsx';
import { downloadSubmissionAsPdf } from '../utils.ts';
import { useConnectionStatus, useData } from '../contexts/DataContext.tsx';
import { getSubmissions } from '../services/firestoreService.ts';

interface ApplicationListProps {
  submissions: Submission[];
  onBack: () => void;
  onEdit?: (submission: Submission) => void;
}

// KRDS 스타일 상태 맵
const statusMap: Record<SubmissionStatus, { text: string; dot: string; textBg: string; }> = {
  pending: { text: '신청 중', dot: 'bg-[#FFC107]', textBg: 'bg-[#FFF3CD] text-[#856404] border border-[#FFC107]' },
  approved: { text: '승인 완료', dot: 'bg-[#28A745]', textBg: 'bg-[#D4EDDA] text-[#155724] border border-[#28A745]' },
  rejected: { text: '승인 거부', dot: 'bg-[#DC3545]', textBg: 'bg-[#F8D7DA] text-[#721C24] border border-[#DC3545]' },
};

// 승인 상태를 더 세부적으로 표시하는 함수 (KRDS 스타일)
const getDetailedApprovalStatus = (submission: Submission) => {
  if (submission.status === 'rejected') {
    return { text: '승인 거부', dot: 'bg-[#DC3545]', textBg: 'bg-[#F8D7DA] text-[#721C24] border border-[#DC3545]' };
  }
  
  if (submission.status === 'approved') {
    return { text: '승인 완료', dot: 'bg-[#28A745]', textBg: 'bg-[#D4EDDA] text-[#155724] border border-[#28A745]' };
  }

  const approvalInfo = submission.approvalInfo;
  
  if (!approvalInfo?.safetyManagerApproval?.approved) {
    return { text: '안전보건관리자 승인 중', dot: 'bg-[#0066CC]', textBg: 'bg-[#CCE1FF] text-[#003E7A] border border-[#0066CC]' };
  } else if (!approvalInfo?.departmentManagerApproval?.approved) {
    return { text: '안전보건부서팀장 승인 중', dot: 'bg-[#FFC107]', textBg: 'bg-[#FFF3CD] text-[#856404] border border-[#FFC107]' };
  } else {
    return { text: '승인 완료', dot: 'bg-[#28A745]', textBg: 'bg-[#D4EDDA] text-[#155724] border border-[#28A745]' };
  }
};

const StatusBadge: React.FC<{ submission: Submission }> = ({ submission }) => {
  const { text, dot, textBg } = getDetailedApprovalStatus(submission);
  return (
    <span className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg ${textBg} transition-all`}>
      <span className={`w-2.5 h-2.5 mr-2 rounded-full ${dot} animate-pulse`}></span>
      {text}
    </span>
  );
};

export const ApplicationList: React.FC<ApplicationListProps> = ({ submissions, onBack, onEdit }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const printRef = useRef<HTMLDivElement>(null);
  const connectionStatus = useConnectionStatus();
  const { actions } = useData();

  // 디버그 로그 추가
  console.log('🔍 [ApplicationList] 렌더링:', {
    submissionsCount: submissions?.length || 0,
    connectionStatus,
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

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      console.log('🔄 [ApplicationList] 수동 새로고침 시작');
      await actions.manualSync();
      console.log('✅ [ApplicationList] 수동 새로고침 완료');
    } catch (error) {
      console.error('❌ [ApplicationList] 새로고침 실패:', error);
      alert('데이터 새로고침에 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 날짜별 신청서 통계 계산
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

  // 달력 날짜 생성
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

  // 안전한 데이터 처리
  const safeSubmissions = submissions || [];
  console.log('🔍 [ApplicationList] 안전한 submissions:', safeSubmissions.length);
  
  const sortedSubmissions = [...safeSubmissions].sort((a, b) => {
    const aTime = a.submittedAt?.getTime() || 0;
    const bTime = b.submittedAt?.getTime() || 0;
    return bTime - aTime;
  });

  const groupedSubmissions = sortedSubmissions.reduce((acc, submission) => {
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
      console.warn('⚠️ [ApplicationList] 날짜 변환 실패:', error);
    }
    return acc;
  }, {} as Record<string, Submission[]>);


  return (
    <Card variant="elevated">
      {/* KRDS 스타일 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div className="flex-1">
          <CardHeader
            title="신청 목록"
            description="제출된 평가 신청서 목록입니다. 항목을 클릭하여 세부 내용을 확인하세요."
          />
        </div>
        <div className="flex gap-3 flex-shrink-0 flex-wrap">
          {/* 뷰 모드 전환 버튼 */}
          <div className="flex gap-2 border-2 border-[#E9ECEF] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-white text-[#6C757D] hover:bg-[#F8F9FA]'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">달력</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-white text-[#6C757D] hover:bg-[#F8F9FA]'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">목록</span>
              </div>
            </button>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            {isRefreshing ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" color="primary" />
                <span className="hidden sm:inline">새로고침 중</span>
                <span className="sm:hidden">로딩</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>새로고침</span>
              </div>
            )}
          </Button>
        </div>
      </div>
      
      {/* 연결 상태 표시 (KRDS 스타일) */}
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

      {/* 달력 뷰 */}
      {viewMode === 'calendar' && (
        <div className="mb-6">
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
          <div className="grid grid-cols-7 gap-2">
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
            <div className="mt-8">
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
                {getDateStats(selectedDate).submissions.map((sub) => (
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
                        <StatusBadge submission={sub} />
                        <svg className={`w-6 h-6 text-[#0066CC] transform transition-transform duration-300 ${expandedId === sub.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {expandedId === sub.id && (
                      <div className="border-t-2 border-[#E9ECEF] bg-[#F8F9FA]">
                        {/* 거부 사유 표시 (확장 영역 상단) */}
                        {sub.status === 'rejected' && sub.rejectionReason && (
                          <div className="p-5 bg-[#F8D7DA] border-b-2 border-[#DC3545]">
                            <h4 className="font-semibold text-[#721C24] mb-2">거부 사유</h4>
                            <p className="text-sm text-[#721C24]">{sub.rejectionReason}</p>
                          </div>
                        )}
                        
                        <div className="p-5 flex justify-end gap-3">
                          {sub.status === 'approved' && (
                            <Button 
                              variant="primary" 
                              size="md"
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
                          {(sub.status === 'rejected' || (sub.status === 'pending' && !sub.approvalInfo?.safetyManagerApproval?.approved)) && onEdit && (
                            <Button 
                              variant="secondary" 
                              size="md"
                              onClick={() => onEdit(sub)}
                            >
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>수정</span>
                              </div>
                            </Button>
                          )}
                        </div>
                        
                        {/* 모든 상태에서 신청 내용 표시 */}
                        <div className="p-1">
                          <Step6Confirmation data={sub} ref={printRef} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 목록 뷰 */}
      {viewMode === 'list' && (
        <>
          {sortedSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-[#ADB5BD] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-[#6C757D]">제출된 신청서가 없습니다.</p>
              <p className="text-sm text-[#ADB5BD] mt-2">새로운 작업을 신청해보세요.</p>
            </div>
          ) : (
            <div className="space-y-10">
            {Object.entries(groupedSubmissions).map(([date, subs]) => (
                <section key={date} aria-labelledby={`date-header-${date}`}>
                    <h3 id={`date-header-${date}`} className="text-xl font-bold text-[#212529] mb-5 pb-3 border-b-2 border-[#0066CC] sticky top-[72px] bg-[#F8F9FA]/95 backdrop-blur-sm py-2 z-[1]">
                        {date}
                    </h3>
                    <div className="space-y-5">
                        {subs.map((sub) => (
                            <div key={sub.id} className="border-2 border-[#E9ECEF] rounded-2xl overflow-hidden bg-white hover:border-[#0066CC] hover:shadow-lg transition-all duration-300">
                            <div
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-6 cursor-pointer hover:bg-[#F8F9FA] gap-4 sm:gap-0 transition-colors"
                                onClick={() => toggleExpand(sub.id)}
                                role="button"
                                tabIndex={0}
                                aria-expanded={expandedId === sub.id}
                                aria-controls={`submission-details-${sub.id}`}
                                onKeyDown={(e) => e.key === 'Enter' && toggleExpand(sub.id)}
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
                                    <div className="flex flex-col items-end gap-2">
                                      <StatusBadge submission={sub} />
                                      {/* 승인자 이름 표시 (KRDS 스타일) */}
                                      {sub.approvalInfo && (
                                        <div className="text-xs text-[#6C757D] space-y-0.5">
                                          {sub.approvalInfo.safetyManagerApproval?.approved && (
                                            <div className="flex items-center gap-1">
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                              <span>안전관리자: {sub.approvalInfo.safetyManagerApproval.approverName}</span>
                                            </div>
                                          )}
                                          {sub.approvalInfo.departmentManagerApproval?.approved && (
                                            <div className="flex items-center gap-1">
                                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                              <span>부서팀장: {sub.approvalInfo.departmentManagerApproval.approverName}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <svg className={`w-6 h-6 text-[#0066CC] transform transition-transform duration-300 ${expandedId === sub.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {expandedId === sub.id && (
                                <div id={`submission-details-${sub.id}`} className="border-t-2 border-[#E9ECEF] bg-[#F8F9FA]">
                                  {/* 거부 사유 표시 (확장 영역 상단) */}
                                  {sub.status === 'rejected' && sub.rejectionReason && (
                                    <div className="p-5 bg-[#F8D7DA] border-b-2 border-[#DC3545]">
                                      <h4 className="font-semibold text-[#721C24] mb-2">거부 사유</h4>
                                      <p className="text-sm text-[#721C24]">{sub.rejectionReason}</p>
                                    </div>
                                  )}
                                  
                                  {/* 버튼 영역 */}
                                  <div className="p-5 flex justify-end gap-3">
                                    {/* 승인 완료된 경우: PDF 다운로드 버튼 */}
                                    {sub.status === 'approved' && (
                                      <Button 
                                        variant="primary" 
                                        size="md"
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
                                    
                                    {/* 거부된 경우 또는 신청중(안전보건관리자 승인 전)인 경우: 수정 버튼 */}
                                    {(sub.status === 'rejected' || (sub.status === 'pending' && !sub.approvalInfo?.safetyManagerApproval?.approved)) && onEdit && (
                                      <Button 
                                        variant="secondary" 
                                        size="md"
                                        onClick={() => onEdit(sub)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          <span>수정</span>
                                        </div>
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {/* 모든 상태에서 신청 내용 표시 */}
                                  <div className="p-1">
                                    <Step6Confirmation data={sub} ref={printRef} />
                                  </div>
                                </div>
                            )}
                            </div>
                        ))}
                    </div>
                </section>
            ))}
            </div>
          )}
        </>
      )}
      
      <div className="mt-12 flex flex-col sm:flex-row justify-end gap-3">
        <Button onClick={onBack} variant="secondary" size="lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>홈으로 돌아가기</span>
          </div>
        </Button>
      </div>
    </Card>
  );
};