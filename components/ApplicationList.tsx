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
}

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

export const ApplicationList: React.FC<ApplicationListProps> = ({ submissions, onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    <Card>
      <div className="flex justify-between items-start mb-6">
        <CardHeader
          title="신청 목록"
          description="제출된 평가 신청서 목록입니다. 항목을 클릭하여 세부 내용을 확인하세요."
        />
        <div className="flex-shrink-0 ml-4">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
          >
            {isRefreshing ? (
              <div className="flex items-center space-x-2">
                <Spinner />
                <span>새로고침 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>새로고침</span>
              </div>
            )}
          </Button>
        </div>
      </div>
      
      {/* 연결 상태 표시 */}
      {connectionStatus === 'offline' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-yellow-800">
              오프라인 모드 - 캐시된 데이터를 표시하고 있습니다.
            </span>
          </div>
        </div>
      )}
      
      {sortedSubmissions.length === 0 ? (
        <p className="text-center text-gray-500 py-12">제출된 신청서가 없습니다.</p>
      ) : (
        <div className="space-y-8">
            {Object.entries(groupedSubmissions).map(([date, subs]) => (
                <section key={date} aria-labelledby={`date-header-${date}`}>
                    <h3 id={`date-header-${date}`} className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-gray-200 sticky top-[72px] bg-gray-100/95 backdrop-blur-sm py-2 z-[1]">
                        {date}
                    </h3>
                    <div className="space-y-4">
                        {subs.map((sub) => (
                            <div key={sub.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <div
                                className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleExpand(sub.id)}
                                role="button"
                                tabIndex={0}
                                aria-expanded={expandedId === sub.id}
                                aria-controls={`submission-details-${sub.id}`}
                                onKeyDown={(e) => e.key === 'Enter' && toggleExpand(sub.id)}
                            >
                                <div>
                                <p className="font-bold text-lg text-gray-800">{sub.projectInfo?.constructionName || '프로젝트명 없음'}</p>
                                <p className="text-sm text-gray-500 mt-1">{sub.projectInfo?.companyName || '회사명 없음'}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {sub.submittedAt?.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) || '시간 미상'}
                                </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <StatusBadge status={sub.status} />
                                    <svg className={`w-6 h-6 text-gray-500 transform transition-transform ${expandedId === sub.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {expandedId === sub.id && (
                                <div id={`submission-details-${sub.id}`} className="border-t bg-white">
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
                </section>
            ))}
        </div>
      )}
      <div className="mt-10">
        <Button variant="secondary" onClick={onBack}>
          홈으로 돌아가기
        </Button>
      </div>
    </Card>
  );
};