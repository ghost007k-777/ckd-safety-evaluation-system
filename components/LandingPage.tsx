
import React from 'react';

interface LandingPageProps {
  onStartEvaluation: () => void;
  onShowList: () => void;
  onShowAdmin: () => void;
}

const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}> = ({ title, description, icon, onClick }) => {
  const cardClasses = `
    flex flex-col text-center items-center p-6 bg-white rounded-xl shadow-lg 
    border border-transparent hover:border-indigo-500 hover:shadow-xl 
    cursor-pointer transform hover:-translate-y-1
    sm:flex-row sm:text-left
  `;

  return (
    <div className={cardClasses} 
         onClick={onClick} 
         role="button"
         tabIndex={0}
         onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
              onClick();
            }
         }}
    >
      <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4 sm:mb-0 sm:mr-6">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-md text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
};


export const LandingPage: React.FC<LandingPageProps> = ({ onStartEvaluation, onShowList, onShowAdmin }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">무엇을 하시겠습니까?</h2>
        <p className="mt-4 text-lg text-gray-600">수행할 작업을 선택해주세요.</p>
      </div>
      <div className="space-y-8">
        <ActionCard
          title="작업신청하기"
          description="새로운 작업에 대한 안전 평가 및 신청 절차를 시작합니다."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" /></svg>}
          onClick={onStartEvaluation}
        />
        <ActionCard
          title="신청 목록"
          description="제출된 평가 신청서 목록을 확인하고 관리합니다."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
          onClick={onShowList}
        />
        <ActionCard
          title="관리자 페이지"
          description="시스템 설정을 관리하고 신청서를 승인합니다."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          onClick={onShowAdmin}
        />
      </div>
    </div>
  );
};
