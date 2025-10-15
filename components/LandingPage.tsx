
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
  badge?: string;
}> = ({ title, description, icon, onClick, badge }) => {
  return (
    <div 
      className="
        group relative
        flex flex-col sm:flex-row items-center sm:items-start
        p-6 sm:p-8
        bg-white rounded-2xl 
        border-2 border-[#E9ECEF] 
        hover:border-[#0066CC] hover:shadow-xl 
        cursor-pointer 
        transform transition-all duration-300 ease-out
        hover:-translate-y-2
        active:scale-98
      "
      onClick={onClick} 
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
         if ((e.key === 'Enter' || e.key === ' ') && onClick) {
           onClick();
         }
      }}
      aria-label={title}
    >
      {/* 아이콘 */}
      <div className="
        flex-shrink-0 
        flex items-center justify-center 
        h-16 w-16 sm:h-20 sm:w-20
        rounded-2xl 
        bg-gradient-to-br from-[#E6F0FF] to-[#CCE1FF]
        group-hover:from-[#0066CC] group-hover:to-[#0052A3]
        transition-all duration-300
        mb-4 sm:mb-0 sm:mr-6
        shadow-md group-hover:shadow-lg
      ">
        <div className="text-[#0066CC] group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <h3 className="text-xl sm:text-2xl font-bold text-[#212529] group-hover:text-[#0066CC] transition-colors">
            {title}
          </h3>
          {badge && (
            <span className="px-2 py-1 text-xs font-semibold bg-[#0066CC] text-white rounded-md">
              {badge}
            </span>
          )}
        </div>
        <p className="text-base text-[#6C757D] leading-relaxed group-hover:text-[#495057] transition-colors">
          {description}
        </p>
      </div>

      {/* 화살표 아이콘 */}
      <div className="
        hidden sm:block
        ml-4
        text-[#ADB5BD] 
        group-hover:text-[#0066CC] 
        group-hover:translate-x-2
        transition-all duration-300
      ">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};


export const LandingPage: React.FC<LandingPageProps> = ({ onStartEvaluation, onShowList, onShowAdmin }) => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 섹션 (KRDS 스타일) */}
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-5xl font-bold text-[#212529] mb-4 leading-tight">
          무엇을 하시겠습니까?
        </h2>
        <p className="text-lg sm:text-xl text-[#6C757D] leading-relaxed max-w-2xl mx-auto">
          수행할 작업을 선택하여 시작하세요.<br className="hidden sm:block" />
          안전하고 효율적인 작업 관리를 지원합니다.
        </p>
      </div>

      {/* 액션 카드 그리드 */}
      <div className="space-y-6">
        <ActionCard
          title="작업신청하기"
          description="새로운 작업에 대한 안전 평가 및 신청 절차를 시작합니다. 단계별 가이드를 따라 쉽게 작성할 수 있습니다."
          badge="신규"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          onClick={onStartEvaluation}
        />
        
        <ActionCard
          title="신청 목록"
          description="제출된 평가 신청서 목록을 확인하고 관리합니다. 상태별로 필터링하여 조회할 수 있습니다."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          onClick={onShowList}
        />
        
        <ActionCard
          title="관리자 페이지"
          description="시스템 설정을 관리하고 신청서를 승인합니다. 통계 및 리포트를 확인할 수 있습니다."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          onClick={onShowAdmin}
        />
      </div>

      {/* 도움말 섹션 */}
      <div className="mt-12 p-6 bg-gradient-to-r from-[#E6F0FF] to-[#CCE1FF] rounded-2xl border border-[#99C3FF]">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-[#003E7A] mb-2">도움이 필요하신가요?</h4>
            <p className="text-sm text-[#0052A3] leading-relaxed">
              시스템 사용 중 문의사항이 있으시면 관리자에게 연락해주세요. 
              자세한 사용 가이드는 각 메뉴의 도움말을 참고하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
