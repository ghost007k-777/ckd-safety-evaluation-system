import React, { useState, useRef } from 'react';
import { Submission, SubmissionStatus } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import Step6Confirmation from './Step6Confirmation.tsx';
import { Input } from './ui/Input.tsx';
import { Spinner } from './ui/Spinner.tsx';
import { downloadSubmissionAsPdf, downloadSubmissionsAsExcel } from '../utils.ts';

interface AdminPageProps {
  submissions: Submission[];
  onUpdateStatus: (id: string, status: SubmissionStatus) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const statusMap: { [key in SubmissionStatus]: { text: string; dot: string; textBg: string; } } = {
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
  const printRef = useRef<HTMLDivElement>(null);

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
  
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const processedSubmissions = submissions
    .filter(s => s.status !== 'pending')
    .sort((a, b) => (b.submittedAt?.getTime() || 0) - (a.submittedAt?.getTime() || 0));

  return (
    <div>
        <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">관리자 페이지</h2>
            <p className="text-lg text-gray-600 mt-2">신청서를 검토하고 처리합니다.</p>
        </div>
        
        <Card className="mb-12">
            <CardHeader 
                title="승인 대기 신청서"
                description="검토가 필요한 신청서 목록입니다."
            />
            {pendingSubmissions.length === 0 ? (
                <p className="text-center text-gray-500 py-16">승인 대기 중인 신청서가 없습니다.</p>
            ) : (
                <div className="space-y-10">
                {pendingSubmissions.map((sub) => (
                    <div key={sub.id}>
                        <Step6Confirmation data={sub} />
                        <div className="mt-6 flex justify-end space-x-4">
                            <Button
                                variant="danger"
                                onClick={() => handleDelete(sub.id)}
                            >
                                삭제
                            </Button>
                            <Button variant="secondary" onClick={() => onUpdateStatus(sub.id, 'rejected')}>
                                승인 거부
                            </Button>
                            <Button variant="primary" onClick={() => onUpdateStatus(sub.id, 'approved')}>
                                승인
                            </Button>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </Card>

        <Card>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">승인 완료 및 거부된 신청서</h3>
                    <p className="text-sm text-gray-600">이미 처리된 신청서 목록입니다.</p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={() => downloadSubmissionsAsExcel(submissions)}
                    className="bg-green-600 hover:bg-green-700"
                >
                    📊 엑셀로 다운로드
                </Button>
            </div>
            {processedSubmissions.length === 0 ? (
                 <p className="text-center text-gray-500 py-16">처리된 신청서가 없습니다.</p>
            ) : (
                <div className="space-y-4">
                {processedSubmissions.map((sub) => (
                    <div key={sub.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div
                      className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpand(sub.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && toggleExpand(sub.id)}
                    >
                        <div className="flex-grow">
                            <p className="font-bold text-lg text-gray-800">{sub.projectInfo.constructionName}</p>
                            <p className="text-sm text-gray-500 mt-1">{sub.projectInfo.companyName}</p>
                            <p className="text-xs text-gray-400 mt-2">{sub.submittedAt.toLocaleString('ko-KR')}</p>
                        </div>
                        <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                            <StatusBadge status={sub.status} />
                            <Button
                                variant="danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(sub.id);
                                }}
                                className="px-4 py-2 text-sm"
                            >
                                삭제
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
    </div>
  );
};