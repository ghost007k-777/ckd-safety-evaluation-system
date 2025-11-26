import React from 'react';

interface LandingPageProps {
  onStartEvaluation: () => void;
  onShowList: () => void;
  onShowAdmin: () => void;
}

const ActionCard: React.FC<{
  title: string;
  description: string;
  imageSrc: string;
  onClick?: () => void;
  badge?: string;
  delay?: number;
}> = ({ title, description, imageSrc, onClick, badge, delay = 0 }) => {
  return (
    <div
      className="
        group relative
        flex flex-col items-center
        p-8
        bg-white/80 backdrop-blur-xl
        rounded-3xl
        border border-white/50
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        hover:shadow-[0_20px_40px_rgb(0,102,204,0.15)]
        cursor-pointer 
        transform transition-all duration-500 ease-out
        hover:-translate-y-2
        overflow-hidden
      "
      style={{ animationDelay: `${delay}ms` }}
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
      {/* 배경 장식 (Hover 효과) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* 3D 아이콘 이미지 */}
      <div className="
        relative z-10
        w-32 h-32 mb-6
        transform transition-transform duration-500
        group-hover:scale-110 group-hover:rotate-3
        filter drop-shadow-xl
      ">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 flex-1 text-center w-full">
        <div className="flex items-center justify-center gap-3 mb-3">
          <h3 className="text-2xl font-bold text-slate-800 group-hover:text-[#0066CC] transition-colors">
            {title}
          </h3>
          {badge && (
            <span className="
              px-2.5 py-1 
              text-xs font-bold 
              bg-gradient-to-r from-[#0066CC] to-[#0052A3]
              text-white 
              rounded-full
              shadow-md
              transform group-hover:scale-105 transition-transform
            ">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {/* 하단 액션 버튼 스타일 */}
      <div className="
        relative z-10 mt-6
        flex items-center gap-2
        text-sm font-bold text-[#0066CC]
        opacity-0 transform translate-y-4
        group-hover:opacity-100 group-hover:translate-y-0
        transition-all duration-300
      ">
        <span>시작하기</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </div>
  );
};


export const LandingPage: React.FC<LandingPageProps> = ({ onStartEvaluation, onShowList, onShowAdmin }) => {
  return (
    <div className="max-w-7xl mx-auto relative">
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* 헤더 섹션 */}
      <div className="text-center mb-16 sm:mb-20 pt-8">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-[#0066CC] text-sm font-bold mb-4 border border-blue-100 shadow-sm">
          Smart Safety System
        </span>
        <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
          안전한 작업 환경,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066CC] to-[#00C6FF]">
            스마트하게 시작하세요
          </span>
        </h2>
        <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
          복잡한 서류 작업은 이제 그만. <br className="hidden sm:block" />
          디지털 안전작업허가서로 빠르고 정확하게 관리하세요.
        </p>
      </div>

      {/* 액션 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <ActionCard
          title="작업신청하기"
          description="새로운 작업에 대한 안전 평가 및 신청 절차를 시작합니다."
          badge="START"
          imageSrc="/assets/helmet.png"
          onClick={onStartEvaluation}
          delay={0}
        />

        <ActionCard
          title="신청 목록"
          description="제출된 평가 신청서 목록을 확인하고 진행상황을 관리합니다."
          imageSrc="/assets/clipboard.png"
          onClick={onShowList}
          delay={100}
        />

        <ActionCard
          title="관리자 페이지"
          description="시스템 설정을 관리하고 신청서를 최종 승인합니다."
          imageSrc="/assets/shield.png"
          onClick={onShowAdmin}
          delay={200}
        />
      </div>

      {/* 하단 정보 섹션 */}
      <div className="mt-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-slate-200 text-slate-500 text-sm backdrop-blur-sm">
          <svg className="w-4 h-4 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>도움이 필요하신가요? 관리자에게 문의하세요.</span>
        </div>
      </div>
    </div>
  );
};
