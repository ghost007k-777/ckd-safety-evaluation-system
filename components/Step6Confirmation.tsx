import React from 'react';
import { FormData, WorkPermit } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { PLEDGE_ITEMS } from '../constants.ts';

interface Step6Props {
  data: FormData;
}

const Section: React.FC<{
    title: string;
    children: React.ReactNode;
    className?: string;
} & React.HTMLAttributes<HTMLDivElement>> = ({title, children, className, ...rest}) => (
    <div className={`py-6 border-b border-gray-200 last:border-b-0 pdf-section ${className}`} {...rest}>
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3 text-sm text-gray-700">{children}</div>
    </div>
)

const Field: React.FC<{label: string; value: React.ReactNode}> = ({label, value}) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1">
        <span className="font-semibold text-gray-600">{label}</span>
        <div className="md:col-span-3">{value || <span className="text-gray-400">제공되지 않음</span>}</div>
    </div>
)

const GeneralPermitConfirmation: React.FC<{ data: WorkPermit }> = ({ data }) => {
    const generalChecks = data.safetyCheckList?.filter(item => item.category === '일반항목') || [];
    const highAltitudeChecks = data.safetyCheckList?.filter(item => item.category === '고소작업') || [];

    const renderChecklist = (items: typeof generalChecks, title: string, condition: boolean = true) => {
        if (!condition || items.length === 0) return null;
        return (
            <div className="md:grid md:grid-cols-12">
                <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">{title}</div>
                <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                    {items.map((item, index) => (
                        <div key={item.id} data-break-anchor className="py-2 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                            <div className="md:col-span-6 text-gray-800">{index + 1}. {item.text}</div>
                            <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-2 md:mt-0 text-center">
                                <div><span className="font-semibold md:hidden">해당: </span>{item.applicable}</div>
                                <div><span className="font-semibold md:hidden">실시: </span>{item.implemented}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="border border-gray-300 rounded-xl divide-y divide-gray-300 text-sm" data-section="work-permit-general">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-gray-300">
                <div className="p-4 space-y-2">
                    <h4 className="font-semibold text-center text-gray-700 mb-2">신청자 (시공 업체)</h4>
                    <Field label="팀" value={data.applicantTeam} />
                    <Field label="성명" value={data.applicantName} />
                    <Field label="서명" value={data.applicantSignature ? <img src={data.applicantSignature} alt="applicant signature" className="h-16 max-w-[200px] bg-gray-100 border rounded-md p-1 object-contain" style={{imageRendering: 'high-quality'}} /> : '서명 없음'} />
                </div>
                <div className="p-4 space-y-2 border-t lg:border-t-0 border-gray-300">
                    <h4 className="font-semibold text-center text-gray-700 mb-2">시행부서 팀장</h4>
                     <Field label="팀" value={data.managerTeam} />
                    <Field label="성명" value={data.managerName} />
                    <Field label="서명" value={data.managerSignature ? <img src={data.managerSignature} alt="manager signature" className="h-16 max-w-[200px] bg-gray-100 border rounded-md p-1 object-contain" style={{imageRendering: 'high-quality'}} /> : '서명 없음'} />
                </div>
            </div>
            <div className="p-4 space-y-3">
                <Field label="작업장소" value={data.location} />
                <Field label="작업일시" value={`${data.workDate} ${data.workStartTime} ~ ${data.workEndTime}`} />
            </div>
             <div className="p-4 space-y-2">
                <Field label="작업 인원" value={`${data.workerCount} 명`} />
                <Field label="작업 내용" value={data.description} />
                {data.workers && data.workers.length > 0 && (
                    <Field label="작업자 정보" value={
                        <div className="space-y-2">
                            {data.workers.map((worker, index) => (
                                <div key={worker.id} className="flex items-center space-x-4 text-sm">
                                    <span className="font-medium text-gray-600">작업자 {index + 1}:</span>
                                    <span>{worker.name || '미입력'}</span>
                                    <span className="text-gray-500">{worker.phoneNumber || '미입력'}</span>
                                </div>
                            ))}
                        </div>
                    } />
                )}
            </div>
            <div className="p-4">
                 <Field label="첨부서류" value={
                     <div className="flex flex-col sm:flex-row sm:gap-6">
                        <span>작업절차서: <span className="font-semibold">{data.procedureDocStatus === 'yes' ? '유' : '무'}</span></span>
                        <span>위험성평가: <span className="font-semibold">{data.riskAssessmentStatus === 'yes' ? '유' : '무'}</span></span>
                     </div>
                 } />
            </div>
            <div className="text-center font-bold bg-gray-100 p-3 text-gray-800">[작업현장 안전조치 확인사항]</div>
            <div className="divide-y divide-gray-200">
                 <div className="hidden md:grid md:grid-cols-12 p-3 font-semibold bg-gray-50 text-gray-700">
                    <div className="col-span-2">구분</div>
                    <div className="col-span-6">안전조치 요구사항</div>
                    <div className="col-span-2 text-center">해당여부</div>
                    <div className="col-span-2 text-center">실시여부</div>
                </div>
                {renderChecklist(generalChecks, '일반항목')}
                <div className="md:grid md:grid-cols-12">
                    <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">고소작업</div>
                    <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                         <div data-break-anchor className="py-2 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0">
                             <div className="md:col-span-6">해당 작업 유/무</div>
                             <div className="md:col-span-4 text-left md:text-center font-semibold">{data.isHighAltitudeWork === 'yes' ? '유' : '무'}</div>
                         </div>
                         {highAltitudeChecks.map((item, index) => (
                             <div key={item.id} data-break-anchor className="py-2 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                <div className="md:col-span-6 text-gray-800">{index + 1}. {item.text}</div>
                                <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-2 md:mt-0 text-center">
                                    <div><span className="font-semibold md:hidden">해당: </span>{item.applicable}</div>
                                    <div><span className="font-semibold md:hidden">실시: </span>{item.implemented}</div>
                                </div>
                            </div>
                         ))}
                    </div>
                </div>
            </div>
             <div className="p-4">
                <Field label="기타 특이사항" value={<span className="whitespace-pre-wrap">{data.specialNotes || '없음'}</span>} />
            </div>
        </div>
    );
};

const HazardousPermitConfirmation: React.FC<{ data: WorkPermit }> = ({ data }) => {
     const renderChecklist = (category: '일반항목' | '화기작업' | '고소작업', title: string, condition?: boolean) => {
        const items = data.hazardousSafetyCheckList?.filter(item => item.category === category) || [];
        if (condition === false || items.length === 0) return null;
        
        return (
            <div className="md:grid md:grid-cols-12">
                <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">{title}</div>
                <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                    {items.map((item, index) => (
                        <div key={item.id} data-break-anchor className="py-2 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                            <div className="md:col-span-6 text-gray-800">{index + 1}. {item.text}</div>
                            <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-2 md:mt-0 text-center">
                                <div><span className="font-semibold md:hidden">해당: </span>{item.applicable}</div>
                                <div><span className="font-semibold md:hidden">실시: </span>{item.implemented}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="border border-gray-300 rounded-xl divide-y divide-gray-300 text-sm" data-section="work-permit-hazardous">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-gray-300">
                <div className="p-4 space-y-2">
                    <h4 className="font-semibold text-center text-gray-700 mb-2">신청자 (시공 업체)</h4>
                    <Field label="팀" value={data.applicantTeam} />
                    <Field label="성명" value={data.applicantName} />
                    <Field label="서명" value={data.applicantSignature ? <img src={data.applicantSignature} alt="applicant signature" className="h-16 max-w-[200px] bg-gray-100 border rounded-md p-1 object-contain" style={{imageRendering: 'high-quality'}} /> : '서명 없음'} />
                </div>
                <div className="p-4 space-y-2 border-t lg:border-t-0 border-gray-300">
                    <h4 className="font-semibold text-center text-gray-700 mb-2">시행부서 팀장</h4>
                     <Field label="팀" value={data.managerTeam} />
                    <Field label="성명" value={data.managerName} />
                    <Field label="서명" value={data.managerSignature ? <img src={data.managerSignature} alt="manager signature" className="h-16 max-w-[200px] bg-gray-100 border rounded-md p-1 object-contain" style={{imageRendering: 'high-quality'}} /> : '서명 없음'} />
                </div>
            </div>
            <div className="p-4 space-y-3">
                <Field label="작업장소" value={data.location} />
                <Field label="작업일시" value={`${data.workDate} ${data.workStartTime} ~ ${data.workEndTime}`} />
            </div>
             <div className="p-4 space-y-2">
                <Field label="작업 인원" value={`${data.workerCount} 명`} />
                <Field label="작업 내용" value={data.description} />
                {data.workers && data.workers.length > 0 && (
                    <Field label="작업자 정보" value={
                        <div className="space-y-2">
                            {data.workers.map((worker, index) => (
                                <div key={worker.id} className="flex items-center space-x-4 text-sm">
                                    <span className="font-medium text-gray-600">작업자 {index + 1}:</span>
                                    <span>{worker.name || '미입력'}</span>
                                    <span className="text-gray-500">{worker.phoneNumber || '미입력'}</span>
                                </div>
                            ))}
                        </div>
                    } />
                )}
            </div>
            <div className="p-4">
                 <Field label="첨부서류" value={
                     <div className="flex flex-col sm:flex-row sm:gap-6">
                        <span>작업절차서: <span className="font-semibold">{data.procedureDocStatus === 'yes' ? '유' : '무'}</span></span>
                        <span>위험성평가: <span className="font-semibold">{data.riskAssessmentStatus === 'yes' ? '유' : '무'}</span></span>
                     </div>
                 } />
            </div>
            <div className="text-center font-bold bg-gray-100 p-3 text-gray-800">[작업현장 안전조치 확인사항]</div>
            <div className="divide-y divide-gray-200">
                 <div className="hidden md:grid md:grid-cols-12 p-3 font-semibold bg-gray-50 text-gray-700">
                    <div className="col-span-2">구분</div>
                    <div className="col-span-6">안전조치 요구사항</div>
                    <div className="col-span-2 text-center">해당여부</div>
                    <div className="col-span-2 text-center">실시여부</div>
                </div>
                {renderChecklist('일반항목', '일반항목', true)}

                <div className="md:grid md:grid-cols-12">
                    <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">화기작업</div>
                    <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                         <div className="py-2 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0">
                             <div className="md:col-span-6">해당 작업 유/무</div>
                             <div className="md:col-span-4 text-left md:text-center font-semibold">{data.isHotWork === 'yes' ? '유' : '무'}</div>
                         </div>
                         {renderChecklist('화기작업', '', data.isHotWork === 'yes')}
                    </div>
                </div>
                 <div className="md:grid md:grid-cols-12">
                    <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">고소작업</div>
                    <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                         <div className="py-2 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0">
                             <div className="md:col-span-6">해당 작업 유/무</div>
                             <div className="md:col-span-4 text-left md:text-center font-semibold">{data.isHighAltitudeWork === 'yes' ? '유' : '무'}</div>
                         </div>
                         {renderChecklist('고소작업', '', data.isHighAltitudeWork === 'yes')}
                    </div>
                </div>
            </div>
             <div className="p-4">
                <Field label="기타 특이사항" value={<span className="whitespace-pre-wrap">{data.specialNotes || '없음'}</span>} />
            </div>

            {(data.gasMeasurements && data.gasMeasurements.length > 0 && data.gasMeasurements.some(g => g.name)) && (
                 <div className="p-4">
                    <Field label="가스농도 측정" value={
                        <div className="w-full text-center border rounded-lg overflow-hidden" data-section="gas-measurement">
                            <div className="grid grid-cols-3 bg-gray-50 font-semibold p-2">
                                <span>가스명</span>
                                <span>농도</span>
                                <span>측정시간</span>
                            </div>
                             {data.gasMeasurements.filter(g => g.name).map(item => (
                                <div key={item.id} className="grid grid-cols-3 p-2 border-t">
                                    <span>{item.name}</span>
                                    <span>{item.concentration}</span>
                                    <span>{item.time}</span>
                                </div>
                             ))}
                        </div>
                    }/>
                </div>
            )}
        </div>
    );
};


const Step6Confirmation = React.forwardRef<HTMLDivElement, Step6Props>(({ data }, ref) => {
  // 디버그 로그 추가
  console.log('📋 [Step6Confirmation] 렌더링 시작:', {
    hasData: !!data,
    hasProjectInfo: !!data?.projectInfo,
    hasSafetyTraining: !!data?.safetyTraining,
    hasRiskAssessment: !!data?.riskAssessment,
    hasWorkPermit: !!data?.workPermit,
    hasSafetyPledge: !!data?.safetyPledge
  });

  // 데이터가 없으면 에러 메시지 표시
  if (!data) {
    console.error('❌ [Step6Confirmation] 데이터가 없습니다');
    return (
      <Card ref={ref}>
        <CardHeader
          title="데이터 오류"
          description="신청서 데이터를 불러올 수 없습니다."
        />
        <div className="p-6 text-center text-red-600">
          신청서 데이터가 누락되었습니다. 다시 시도해주세요.
        </div>
      </Card>
    );
  }

  return (
    <Card ref={ref}>
      <CardHeader
        title="검토 및 제출"
        description="제출하기 전에 모든 정보를 주의 깊게 검토해주세요."
      />
      <div className="space-y-4">
        <Section title="프로젝트 정보">
          <Field label="공사 위치" value={
            data.projectInfo?.location === '기타' 
              ? data.projectInfo?.locationOther || '기타 위치 미입력'
              : data.projectInfo?.location || '위치 미입력'
          } />
          <Field label="공사명" value={data.projectInfo?.constructionName || '공사명 미입력'} />
          <Field label="업체명" value={data.projectInfo?.companyName || '업체명 미입력'} />
          <Field label="담당자" value={data.projectInfo?.contactPerson || '담당자 미입력'} />
        </Section>
        
        <Section title="안전 교육">
            <Field label="이수 여부" value={
              data.safetyTraining?.completed 
                ? `완료, 이수일: ${data.safetyTraining.completionDate?.toLocaleString('ko-KR') || '날짜 미상'}`
                : "미이수"
            } />
        </Section>
        
        <Section title="위험성 평가">
            {data.riskAssessment?.length > 0 ? (
                 <div className="overflow-x-auto border border-gray-200 rounded-xl" data-section="risk-table">
                    <table className="min-w-full divide-y divide-gray-200 text-sm" data-pdf-table="risk-assessment">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left font-bold text-gray-800 uppercase tracking-wider">장소/공정</th>
                                <th scope="col" className="px-4 py-3 text-left font-bold text-gray-800 uppercase tracking-wider">세부 작업</th>
                                <th scope="col" className="px-4 py-3 text-left font-bold text-gray-800 uppercase tracking-wider">위험요인</th>
                                <th scope="col" className="px-4 py-3 text-left font-bold text-gray-800 uppercase tracking-wider">재해유형</th>
                                <th scope="col" className="px-4 py-3 text-left font-bold text-gray-800 uppercase tracking-wider">안전조치</th>
                                <th scope="col" className="px-4 py-3 text-center font-bold text-gray-800 uppercase tracking-wider">위험성</th>
                                <th scope="col" className="px-4 py-3 text-left font-bold text-gray-800 uppercase tracking-wider">감소 대책</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data.riskAssessment || []).map((item, index) => {
                                const riskScore = (item?.likelihood || 1) * (item?.severity || 1);
                                const riskColorClass = riskScore >= 9 ? 'bg-rose-50' : riskScore >= 4 ? 'bg-amber-50' : '';
                                return (
                                    <tr key={item?.id || `risk-${index}`} className={riskColorClass}>
                                        <td className="px-4 py-4 whitespace-nowrap text-gray-800">{item?.location || '위치 미상'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-gray-800">{item?.task || '작업 미상'}</td>
                                        <td className="px-4 py-4 whitespace-normal min-w-[150px] text-gray-800">{item?.hazard || '위험요인 미상'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-gray-800">{item?.disasterType || '재해유형 미상'}</td>
                                        <td className="px-4 py-4 whitespace-normal min-w-[150px] text-gray-800">{item?.safetyMeasures || '안전조치 미상'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center text-gray-800">
                                            <div className="font-bold text-lg">{riskScore}</div>
                                            <div className="text-xs text-gray-500">({item?.likelihood || 1}×{item?.severity || 1})</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-normal min-w-[150px] text-gray-800">{item?.reductionMeasures || '감소대책 미상'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : <p className="text-gray-500">추가된 위험 항목이 없습니다.</p>}
        </Section>

        <Section title="안전 서약서" className="border-b-0 pb-0" data-section="safety-pledge">
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">안전보건 준수 서약 내용</h4>
                    <div className="space-y-2 text-sm">
                        {Object.entries(PLEDGE_ITEMS).map(([key, text], index) => (
                            <div key={key} className="flex items-start space-x-2">
                                <span className="font-medium text-gray-600 min-w-[20px]">{index + 1}.</span>
                                <span className="text-gray-800">{text}</span>
                                <span className="ml-auto text-indigo-600 font-semibold">
                                    {data.safetyPledge?.agreements?.[key] ? '✓' : '✗'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                        본인은 교육내용에 대해 충분히 이해하였으며 모두 준수할 것을 동의합니다. 
                        상기 사항 관련 문제 발생 시 본인이 모든 책임을 질 것을 동의합니다.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <Field label="성명" value={data.safetyPledge?.name || '성명 미입력'} />
                    <Field label="전체 동의" value={data.safetyPledge?.agreeToAll ? '예' : '아니오'} />
                    <Field label="서명" value={
                      data.safetyPledge?.signature 
                        ? <img src={data.safetyPledge.signature} alt="signature" className="h-16 max-w-[200px] bg-gray-100 border rounded-md p-1 object-contain" style={{imageRendering: 'high-quality'}} /> 
                        : '서명 없음'
                    } />
                </div>
            </div>
        </Section>

        <Section title="작업 허가서" className="" data-section="work-permit">
            <div className="space-y-3 mb-6">
                <Field label="유형" value={
                  data.workPermit?.type === 'hazardous' ? '위험' : 
                  data.workPermit?.type === 'general' ? '일반' : '유형 미설정'
                } />
            </div>

            {data.workPermit?.type === 'general' ? (
                <GeneralPermitConfirmation data={data.workPermit} />
            ) : data.workPermit?.type === 'hazardous' ? (
                <HazardousPermitConfirmation data={data.workPermit} />
            ) : (
                <p className="text-gray-500">작업 허가서 유형이 설정되지 않았습니다.</p>
            )}
        </Section>
      </div>
    </Card>
  );
});
Step6Confirmation.displayName = 'Step6Confirmation';

export default Step6Confirmation;