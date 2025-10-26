import React from 'react';
import { WorkPermit, SafetyCheckItem, HazardousSafetyCheckItem, ConfinedSpaceSafetyCheckItem, GasMeasurement, WorkerInfo } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { SignaturePad } from './SignaturePad.tsx';
import { Button } from './ui/Button.tsx';
import { generateUniqueId } from '../utils.ts';

interface Step4Props {
  data: WorkPermit;
  updateData: (data: Partial<WorkPermit>) => void;
}

const RadioGroup: React.FC<{ label: string, name: string, value: string, options: {label: string, value: string}[], onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, inline?: boolean }> = 
({ label, name, value, options, onChange, inline=true }) => (
    <div className={`flex items-center ${inline ? '' : 'flex-col items-start'}`}>
        {label && <span className="text-sm font-medium text-gray-700 mr-4">{label}</span>}
        <div className={`flex items-center ${inline ? 'space-x-4' : 'space-x-6'}`}>
            {options.map(opt => (
                <label key={opt.value} className="flex items-center text-sm cursor-pointer">
                    <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"/>
                    <span className="ml-2 text-gray-800">{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
);


const GeneralWorkPermitForm: React.FC<Step4Props> = ({ data, updateData }) => {
    // 내일 날짜를 YYYY-MM-DD 형식으로 가져오기 (오늘과 신청 당일은 선택 불가)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    const handleSafetyCheckChange = (id: string, field: 'applicable' | 'implemented', value: 'O' | 'X') => {
        const newList = (data.safetyCheckList ?? []).map(item => item.id === id ? { ...item, [field]: value } : item);
        updateData({ safetyCheckList: newList as SafetyCheckItem[] });
    };
    
    const handleWorkerCountChange = (count: number) => {
        const currentWorkers = data.workers || [];
        const newWorkers: WorkerInfo[] = [];
        
        for (let i = 0; i < count; i++) {
            if (currentWorkers[i]) {
                newWorkers.push(currentWorkers[i]);
            } else {
                newWorkers.push({
                    id: generateUniqueId(),
                    name: '',
                    phoneNumber: ''
                });
            }
        }
        
        updateData({ workerCount: count, workers: newWorkers });
    };
    
    const handleWorkerChange = (index: number, field: 'name' | 'phoneNumber', value: string) => {
        const newWorkers = [...(data.workers || [])];
        if (newWorkers[index]) {
            newWorkers[index] = { ...newWorkers[index], [field]: value };
            updateData({ workers: newWorkers });
        }
    };
    
    const inputClasses = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900";

    const generalChecks = data.safetyCheckList?.filter(item => item.category === '일반항목') || [];
    const highAltitudeLadderChecks = data.safetyCheckList?.filter(item => item.category === '고소작업-사다리') || [];
    const highAltitudeScaffoldChecks = data.safetyCheckList?.filter(item => item.category === '고소작업-틀비계') || [];
    const highAltitudeHangingChecks = data.safetyCheckList?.filter(item => item.category === '고소작업-달비계') || [];

    return (
        <div className="border border-gray-300 rounded-xl divide-y divide-gray-300">
            {/* Signatures */}
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-gray-300">
                {/* Applicant */}
                <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-center text-gray-700 mb-4">신청자 (시공 업체)</h3>
                    <div className="grid grid-cols-[80px,1fr] items-center gap-3">
                        <label className="font-semibold text-sm text-gray-600">팀</label>
                        <input type="text" className={inputClasses} value={data.applicantTeam || ''} onChange={e => updateData({ applicantTeam: e.target.value })}/>
                    </div>
                    <div className="grid grid-cols-[80px,1fr] items-start gap-3">
                        <label className="font-semibold text-sm text-gray-600 pt-2">성명 (인)</label>
                        <div>
                            <input type="text" placeholder="성명" className={`${inputClasses} mb-2`} value={data.applicantName || ''} onChange={e => updateData({ applicantName: e.target.value })}/>
                            <SignaturePad onEnd={(sig) => updateData({ applicantSignature: sig })} signatureDataUrl={data.applicantSignature || ''} />
                        </div>
                    </div>
                </div>
                {/* Manager */}
                <div className="p-4 space-y-3 border-t lg:border-t-0 border-gray-300">
                    <h3 className="font-semibold text-center text-gray-700 mb-4">시행부서 팀장 (허가서 및 안전조치 확인)</h3>
                    <div className="grid grid-cols-[80px,1fr] items-center gap-3">
                        <label className="font-semibold text-sm text-gray-600">팀</label>
                        <input type="text" className={inputClasses} value={data.managerTeam || ''} onChange={e => updateData({ managerTeam: e.target.value })}/>
                    </div>
                     <div className="grid grid-cols-[80px,1fr] items-start gap-3">
                        <label className="font-semibold text-sm text-gray-600 pt-2">성명 (인)</label>
                        <div>
                            <input type="text" placeholder="성명" className={`${inputClasses} mb-2`} value={data.managerName || ''} onChange={e => updateData({ managerName: e.target.value })}/>
                            <SignaturePad onEnd={(sig) => updateData({ managerSignature: sig })} signatureDataUrl={data.managerSignature || ''} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Details */}
            <div className="p-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">작업장소</label>
                    <input type="text" className={inputClasses} value={data.location} onChange={e => updateData({ location: e.target.value })} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">작업일시</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input type="date" className={inputClasses} value={data.workDate} onChange={e => updateData({ workDate: e.target.value })} min={minDate} />
                        <input type="time" className={inputClasses} value={data.workStartTime} onChange={e => updateData({ workStartTime: e.target.value })}/>
                        <span className="hidden sm:inline">~</span>
                        <input type="time" className={inputClasses} value={data.workEndTime} onChange={e => updateData({ workEndTime: e.target.value })}/>
                    </div>
                </div>
            </div>

            {/* Work Description */}
            <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-start gap-3">
                    <label className="font-semibold text-sm text-gray-600 mt-2">작업내용</label>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <span className="flex items-center text-gray-800">○ 작업 인원 : <input type="number" min="1" max="20" className={`${inputClasses} w-24 ml-2`} value={data.workerCount} onChange={e => handleWorkerCountChange(parseInt(e.target.value) || 1)}/> 명</span>
                            <span className="flex items-center text-gray-800">○ 작업 내용 : <input type="text" className={`${inputClasses} ml-2 flex-1`} value={data.description} onChange={e => updateData({ description: e.target.value })}/></span>
                        </div>
                        
                        {/* Worker Information */}
                        {data.workerCount > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">작업자 정보</h4>
                                <div className="space-y-2">
                                    {Array.from({ length: data.workerCount }, (_, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-600">작업자 {index + 1}</span>
                                            <input 
                                                type="text" 
                                                placeholder="성명" 
                                                className={inputClasses}
                                                value={data.workers?.[index]?.name || ''}
                                                onChange={e => handleWorkerChange(index, 'name', e.target.value)}
                                            />
                                            <input 
                                                type="tel" 
                                                placeholder="휴대번호 (예: 010-1234-5678)" 
                                                className={inputClasses}
                                                value={data.workers?.[index]?.phoneNumber || ''}
                                                onChange={e => handleWorkerChange(index, 'phoneNumber', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Attachments */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">첨부서류</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-4 gap-x-12">
                        <RadioGroup label="작업절차서" name="procedureDocStatus" value={data.procedureDocStatus || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ procedureDocStatus: e.target.value as 'yes' | 'no'})} />
                        <RadioGroup label="위험성평가" name="riskAssessmentStatus" value={data.riskAssessmentStatus || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ riskAssessmentStatus: e.target.value as 'yes' | 'no'})} />
                    </div>
                </div>
            </div>
            
            {/* Safety Checks Header */}
            <div className="text-center font-bold bg-gray-100 p-3 text-gray-800">[작업현장 안전조치 확인사항]</div>

            <div className="divide-y divide-gray-200">
                <div className="hidden md:grid md:grid-cols-12 p-3 font-semibold bg-gray-50 text-gray-700 text-sm">
                    <div className="col-span-2">구분</div>
                    <div className="col-span-6">안전조치 요구사항</div>
                    <div className="col-span-2 text-center">해당여부 (O,X)</div>
                    <div className="col-span-2 text-center">실시여부 (O,X)</div>
                </div>

                {/* General checks */}
                <div className="md:grid md:grid-cols-12">
                    <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">일반항목</div>
                    <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                        {generalChecks.map((item, index) => (
                             <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                <div className="md:col-span-6 text-gray-800">{index+1}. {item.text}</div>
                                <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                        <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                        <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* High altitude checks */}
                <div className="md:grid md:grid-cols-12">
                    <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">고소작업</div>
                    <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                        <div className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0">
                            <div className="md:col-span-6 text-gray-800">해당 작업 유/무</div>
                            <div className="md:col-span-4 mt-2 md:mt-0">
                                <RadioGroup label="" name="isHighAltitudeWork" value={data.isHighAltitudeWork || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ isHighAltitudeWork: e.target.value as 'yes' | 'no' })} />
                            </div>
                        </div>
                        {data.isHighAltitudeWork === 'yes' && (
                            <>
                                {/* 사다리, 작업발판 */}
                                <div className="py-3 md:p-3 bg-gray-50 border-b">
                                    <div className="font-semibold text-sm text-gray-800">1. 사다리, 작업발판</div>
                                </div>
                                {highAltitudeLadderChecks.map((item, index) => (
                                    <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                        <div className="md:col-span-6 text-gray-800 pl-4">- {item.text}</div>
                                        <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                                <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                                <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* 틀비계 */}
                                <div className="py-3 md:p-3 bg-gray-50 border-b">
                                    <div className="font-semibold text-sm text-gray-800">2. 틀비계</div>
                                </div>
                                {highAltitudeScaffoldChecks.map((item, index) => (
                                    <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                        <div className="md:col-span-6 text-gray-800 pl-4">- {item.text}</div>
                                        <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                                <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                                <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* 달비계 */}
                                <div className="py-3 md:p-3 bg-gray-50 border-b">
                                    <div className="font-semibold text-sm text-gray-800">3. 달비계</div>
                                </div>
                                {highAltitudeHangingChecks.map((item, index) => (
                                    <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                        <div className="md:col-span-6 text-gray-800 pl-4">- {item.text}</div>
                                        <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                                <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                                <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Special Notes */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-start gap-3">
                    <label className="font-semibold text-sm text-gray-600 pt-2">기타 특이사항</label>
                    <textarea className={`${inputClasses} h-24`} placeholder="안전조치 외 주의사항 등 기재" value={data.specialNotes} onChange={e => updateData({ specialNotes: e.target.value })}></textarea>
                </div>
            </div>
        </div>
    );
};

const ConfinedSpaceWorkPermitForm: React.FC<Step4Props> = ({ data, updateData }) => {
    // 내일 날짜를 YYYY-MM-DD 형식으로 가져오기 (오늘과 신청 당일은 선택 불가)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    const inputClasses = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900";

    const handleConfinedSpaceSafetyCheckChange = (id: string, field: 'applicable' | 'confirmed', value: '유' | '무' | boolean) => {
        const newList = (data.confinedSpaceSafetyCheckList ?? []).map(item => item.id === id ? { ...item, [field]: value } : item);
        updateData({ confinedSpaceSafetyCheckList: newList as ConfinedSpaceSafetyCheckItem[] });
    };

    const handleWorkerCountChange = (count: number) => {
        const currentWorkers = data.workers || [];
        const newWorkers: WorkerInfo[] = [];
        
        // 밀폐공간작업의 경우 최소 3명 (관리감독자, 감시인, 작업자 1명)
        const minCount = 3;
        const actualCount = Math.max(count, minCount);
        
        for (let i = 0; i < actualCount; i++) {
            if (currentWorkers[i]) {
                newWorkers.push(currentWorkers[i]);
            } else {
                // 기본 역할 설정
                let role: '관리감독자' | '감시인' | '작업자' = '작업자';
                if (i === 0) role = '관리감독자';
                else if (i === 1) role = '감시인';
                
                newWorkers.push({
                    id: generateUniqueId(),
                    name: '',
                    phoneNumber: '',
                    role: role
                });
            }
        }
        
        updateData({ workerCount: actualCount, workers: newWorkers });
    };
    
    const handleWorkerChange = (index: number, field: 'name' | 'phoneNumber', value: string) => {
        const newWorkers = [...(data.workers || [])];
        if (newWorkers[index]) {
            newWorkers[index] = { ...newWorkers[index], [field]: value };
            updateData({ workers: newWorkers });
        }
    };

    return (
        <div className="border border-gray-300 rounded-xl divide-y divide-gray-300">
            {/* Signatures */}
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-gray-300">
                {/* Applicant */}
                <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-center text-gray-700 mb-4">신청자 (시공 업체)</h3>
                    <div className="grid grid-cols-[80px,1fr] items-center gap-3">
                        <label className="font-semibold text-sm text-gray-600">팀</label>
                        <input type="text" className={inputClasses} value={data.applicantTeam || ''} onChange={e => updateData({ applicantTeam: e.target.value })}/>
                    </div>
                    <div className="grid grid-cols-[80px,1fr] items-start gap-3">
                        <label className="font-semibold text-sm text-gray-600 pt-2">성명 (인)</label>
                        <div>
                            <input type="text" placeholder="성명" className={`${inputClasses} mb-2`} value={data.applicantName || ''} onChange={e => updateData({ applicantName: e.target.value })}/>
                            <SignaturePad onEnd={(sig) => updateData({ applicantSignature: sig })} signatureDataUrl={data.applicantSignature || ''} />
                        </div>
                    </div>
                </div>
                {/* Manager */}
                <div className="p-4 space-y-3 border-t lg:border-t-0 border-gray-300">
                    <h3 className="font-semibold text-center text-gray-700 mb-4">시행부서 팀장 (허가서 및 안전조치 확인)</h3>
                    <div className="grid grid-cols-[80px,1fr] items-center gap-3">
                        <label className="font-semibold text-sm text-gray-600">팀</label>
                        <input type="text" className={inputClasses} value={data.managerTeam || ''} onChange={e => updateData({ managerTeam: e.target.value })}/>
                    </div>
                     <div className="grid grid-cols-[80px,1fr] items-start gap-3">
                        <label className="font-semibold text-sm text-gray-600 pt-2">성명 (인)</label>
                        <div>
                            <input type="text" placeholder="성명" className={`${inputClasses} mb-2`} value={data.managerName || ''} onChange={e => updateData({ managerName: e.target.value })}/>
                            <SignaturePad onEnd={(sig) => updateData({ managerSignature: sig })} signatureDataUrl={data.managerSignature || ''} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Details */}
            <div className="p-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">작업장소</label>
                    <input type="text" className={inputClasses} value={data.location} onChange={e => updateData({ location: e.target.value })} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">작업일시</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input type="date" className={inputClasses} value={data.workDate} onChange={e => updateData({ workDate: e.target.value })} min={minDate} />
                        <input type="time" className={inputClasses} value={data.workStartTime} onChange={e => updateData({ workStartTime: e.target.value })}/>
                        <span className="hidden sm:inline">~</span>
                        <input type="time" className={inputClasses} value={data.workEndTime} onChange={e => updateData({ workEndTime: e.target.value })}/>
                    </div>
                </div>
            </div>

            {/* Work Description */}
            <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-start gap-3">
                    <label className="font-semibold text-sm text-gray-600 mt-2">작업내용</label>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <span className="flex items-center text-gray-800">○ 작업 인원 : <input type="number" min="1" max="20" className={`${inputClasses} w-24 ml-2`} value={data.workerCount} onChange={e => handleWorkerCountChange(parseInt(e.target.value) || 1)}/> 명</span>
                            <span className="flex items-center text-gray-800">○ 작업 내용 : <input type="text" className={`${inputClasses} ml-2 flex-1`} value={data.description} onChange={e => updateData({ description: e.target.value })}/></span>
                        </div>
                        
                        {/* Worker Information */}
                        {data.workerCount > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">작업자 정보</h4>
                                <div className="space-y-2">
                                    {Array.from({ length: data.workerCount }, (_, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-600">
                                                {data.workers?.[index]?.role || `작업자 ${index + 1}`}
                                            </span>
                                            <input 
                                                type="text" 
                                                placeholder="성명" 
                                                className={inputClasses}
                                                value={data.workers?.[index]?.name || ''}
                                                onChange={e => handleWorkerChange(index, 'name', e.target.value)}
                                            />
                                            <input 
                                                type="tel" 
                                                placeholder="휴대번호 (예: 010-1234-5678)" 
                                                className={inputClasses}
                                                value={data.workers?.[index]?.phoneNumber || ''}
                                                onChange={e => handleWorkerChange(index, 'phoneNumber', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Attachments */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">첨부서류</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-4 gap-x-12">
                        <RadioGroup label="작업절차서" name="procedureDocStatus" value={data.procedureDocStatus || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ procedureDocStatus: e.target.value as 'yes' | 'no'})} />
                        <RadioGroup label="위험성평가" name="riskAssessmentStatus" value={data.riskAssessmentStatus || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ riskAssessmentStatus: e.target.value as 'yes' | 'no'})} />
                    </div>
                </div>
            </div>

            {/* Safety Checks Header */}
            <div className="text-center font-bold bg-gray-100 p-3 text-gray-800">[밀폐공간작업 안전조치 확인사항]</div>

            <div className="divide-y divide-gray-200">
                <div className="hidden md:grid md:grid-cols-12 p-3 font-semibold bg-gray-50 text-gray-700 text-sm">
                    <div className="col-span-6">확인항목</div>
                    <div className="col-span-3 text-center">해당여부</div>
                    <div className="col-span-3 text-center">확인결과</div>
                </div>

                {/* Confined Space Safety Checks */}
                <div className="divide-y divide-gray-200">
                    {(data.confinedSpaceSafetyCheckList || []).map((item, index) => (
                        <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-12 md:gap-4 items-center md:p-4">
                            <div className="md:col-span-6 text-gray-800 mb-3 md:mb-0">{index+1}. {item.text}</div>
                            <div className="md:col-span-3 mb-3 md:mb-0">
                                <span className="text-sm font-medium text-gray-700 md:hidden block mb-2">해당여부</span>
                                <div className="flex items-center space-x-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`applicable-${item.id}`} 
                                            value="유" 
                                            checked={item.applicable === '유'} 
                                            onChange={e => handleConfinedSpaceSafetyCheckChange(item.id, 'applicable', e.target.value as '유' | '무')} 
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-gray-800">유</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`applicable-${item.id}`} 
                                            value="무" 
                                            checked={item.applicable === '무'} 
                                            onChange={e => handleConfinedSpaceSafetyCheckChange(item.id, 'applicable', e.target.value as '유' | '무')} 
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-gray-800">무</span>
                                    </label>
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <span className="text-sm font-medium text-gray-700 md:hidden block mb-2">확인결과</span>
                                <div className="flex justify-center md:justify-center">
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={item.confirmed} 
                                            onChange={e => handleConfinedSpaceSafetyCheckChange(item.id, 'confirmed', e.target.checked)} 
                                            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Special Notes */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-start gap-3">
                    <label className="font-semibold text-sm text-gray-600 pt-2">기타 특이사항</label>
                    <textarea className={`${inputClasses} h-24`} placeholder="안전조치 외 주의사항 등 기재" value={data.specialNotes} onChange={e => updateData({ specialNotes: e.target.value })}></textarea>
                </div>
            </div>

            {/* 필수서류 다운로드 */}
            <div className="p-4 bg-[#E6F0FF] border-t-2 border-[#0066CC]">
                <div className="flex flex-col items-center justify-center gap-3">
                    <a 
                        href="https://drive.google.com/uc?export=download&id=1TnGiUxb-yvBaFWt0fEn9nwde4QIXb74i"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-lg shadow-md hover:bg-[#0052A3] active:bg-[#003E7A] transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        필수서류 다운로드
                    </a>
                    <p className="text-xs text-[#6C757D]">(작업 전 체크리스트, 출입대장, 가스 측정표)</p>
                </div>
            </div>
        </div>
    );
};

const HazardousWorkPermitForm: React.FC<Step4Props> = ({ data, updateData }) => {
    // 내일 날짜를 YYYY-MM-DD 형식으로 가져오기 (오늘과 신청 당일은 선택 불가)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    const inputClasses = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-900";

    const handleSafetyCheckChange = (id: string, field: 'applicable' | 'implemented', value: 'O' | 'X') => {
        const newList = (data.hazardousSafetyCheckList ?? []).map(item => item.id === id ? { ...item, [field]: value } : item);
        updateData({ hazardousSafetyCheckList: newList as HazardousSafetyCheckItem[] });
    };
    
    const handleWorkerCountChange = (count: number) => {
        const currentWorkers = data.workers || [];
        const newWorkers: WorkerInfo[] = [];
        
        for (let i = 0; i < count; i++) {
            if (currentWorkers[i]) {
                newWorkers.push(currentWorkers[i]);
            } else {
                newWorkers.push({
                    id: generateUniqueId(),
                    name: '',
                    phoneNumber: ''
                });
            }
        }
        
        updateData({ workerCount: count, workers: newWorkers });
    };
    
    const handleWorkerChange = (index: number, field: 'name' | 'phoneNumber', value: string) => {
        const newWorkers = [...(data.workers || [])];
        if (newWorkers[index]) {
            newWorkers[index] = { ...newWorkers[index], [field]: value };
            updateData({ workers: newWorkers });
        }
    };

    const handleGasMeasurementChange = (id: string, field: keyof Omit<GasMeasurement, 'id'>, value: string) => {
        const newList = (data.gasMeasurements ?? []).map(item => item.id === id ? { ...item, [field]: value } : item);
        updateData({ gasMeasurements: newList });
    };

    const addGasRow = () => {
        const newRow: GasMeasurement = { id: generateUniqueId(), name: '', concentration: '', time: '' };
        updateData({ gasMeasurements: [...(data.gasMeasurements || []), newRow] });
    };
    
    const removeGasRow = (id: string) => {
        const newList = (data.gasMeasurements ?? []).filter(item => item.id !== id);
        updateData({ gasMeasurements: newList });
    };


    const renderChecklistSection = (category: '일반항목' | '화기작업' | '고소작업', title: string, condition?: boolean) => {
        const items = data.hazardousSafetyCheckList?.filter(item => item.category === category) || [];
        if (condition === false) return null;

        return (
            <div className="md:grid md:grid-cols-12">
                <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">{title}</div>
                <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                    {items.map((item, index) => (
                        <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                           <div className="md:col-span-6 text-gray-800">{index+1}. {item.text}</div>
                           <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                               <div>
                                   <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                   <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                               </div>
                               <div>
                                   <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                   <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                               </div>
                           </div>
                       </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="border border-gray-300 rounded-xl divide-y divide-gray-300">
            {/* Signatures */}
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-gray-300">
                {/* Applicant */}
                <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-center text-gray-700 mb-4">신청자 (시공 업체)</h3>
                    <div className="grid grid-cols-[80px,1fr] items-center gap-3">
                        <label className="font-semibold text-sm text-gray-600">팀</label>
                        <input type="text" className={inputClasses} value={data.applicantTeam || ''} onChange={e => updateData({ applicantTeam: e.target.value })}/>
                    </div>
                    <div className="grid grid-cols-[80px,1fr] items-start gap-3">
                        <label className="font-semibold text-sm text-gray-600 pt-2">성명 (인)</label>
                        <div>
                            <input type="text" placeholder="성명" className={`${inputClasses} mb-2`} value={data.applicantName || ''} onChange={e => updateData({ applicantName: e.target.value })}/>
                            <SignaturePad onEnd={(sig) => updateData({ applicantSignature: sig })} signatureDataUrl={data.applicantSignature || ''} />
                        </div>
                    </div>
                </div>
                {/* Manager */}
                <div className="p-4 space-y-3 border-t lg:border-t-0 border-gray-300">
                    <h3 className="font-semibold text-center text-gray-700 mb-4">시행부서 팀장 (허가서 및 안전조치 확인)</h3>
                    <div className="grid grid-cols-[80px,1fr] items-center gap-3">
                        <label className="font-semibold text-sm text-gray-600">팀</label>
                        <input type="text" className={inputClasses} value={data.managerTeam || ''} onChange={e => updateData({ managerTeam: e.target.value })}/>
                    </div>
                     <div className="grid grid-cols-[80px,1fr] items-start gap-3">
                        <label className="font-semibold text-sm text-gray-600 pt-2">성명 (인)</label>
                        <div>
                            <input type="text" placeholder="성명" className={`${inputClasses} mb-2`} value={data.managerName || ''} onChange={e => updateData({ managerName: e.target.value })}/>
                            <SignaturePad onEnd={(sig) => updateData({ managerSignature: sig })} signatureDataUrl={data.managerSignature || ''} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Details */}
            <div className="p-4 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">작업장소</label>
                    <input type="text" className={inputClasses} value={data.location} onChange={e => updateData({ location: e.target.value })} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">작업일시</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input type="date" className={inputClasses} value={data.workDate} onChange={e => updateData({ workDate: e.target.value })} min={minDate} />
                        <input type="time" className={inputClasses} value={data.workStartTime} onChange={e => updateData({ workStartTime: e.target.value })}/>
                        <span className="hidden sm:inline">~</span>
                        <input type="time" className={inputClasses} value={data.workEndTime} onChange={e => updateData({ workEndTime: e.target.value })}/>
                    </div>
                </div>
            </div>

            {/* Work Description */}
            <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-start gap-3">
                    <label className="font-semibold text-sm text-gray-600 mt-2">작업내용</label>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <span className="flex items-center text-gray-800">○ 작업 인원 : <input type="number" min="1" max="20" className={`${inputClasses} w-24 ml-2`} value={data.workerCount} onChange={e => handleWorkerCountChange(parseInt(e.target.value) || 1)}/> 명</span>
                            <span className="flex items-center text-gray-800">○ 작업 내용 : <input type="text" className={`${inputClasses} ml-2 flex-1`} value={data.description} onChange={e => updateData({ description: e.target.value })}/></span>
                        </div>
                        
                        {/* Worker Information */}
                        {data.workerCount > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">작업자 정보</h4>
                                <div className="space-y-2">
                                    {Array.from({ length: data.workerCount }, (_, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-600">작업자 {index + 1}</span>
                                            <input 
                                                type="text" 
                                                placeholder="성명" 
                                                className={inputClasses}
                                                value={data.workers?.[index]?.name || ''}
                                                onChange={e => handleWorkerChange(index, 'name', e.target.value)}
                                            />
                                            <input 
                                                type="tel" 
                                                placeholder="휴대번호 (예: 010-1234-5678)" 
                                                className={inputClasses}
                                                value={data.workers?.[index]?.phoneNumber || ''}
                                                onChange={e => handleWorkerChange(index, 'phoneNumber', e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Attachments */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-center gap-3">
                    <label className="font-semibold text-sm text-gray-600">첨부서류</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-4 gap-x-12">
                        <RadioGroup label="작업절차서" name="procedureDocStatus" value={data.procedureDocStatus || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ procedureDocStatus: e.target.value as 'yes' | 'no'})} />
                        <RadioGroup label="위험성평가" name="riskAssessmentStatus" value={data.riskAssessmentStatus || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ riskAssessmentStatus: e.target.value as 'yes' | 'no'})} />
                    </div>
                </div>
            </div>

            {/* Safety Checks Header */}
            <div className="text-center font-bold bg-gray-100 p-3 text-gray-800">[작업현장 안전조치 확인사항]</div>
            <div className="divide-y divide-gray-200">
                <div className="hidden md:grid md:grid-cols-12 p-3 font-semibold bg-gray-50 text-gray-700 text-sm">
                    <div className="col-span-2">구분</div>
                    <div className="col-span-6">안전조치 요구사항</div>
                    <div className="col-span-2 text-center">해당여부 (O,X)</div>
                    <div className="col-span-2 text-center">실시여부 (O,X)</div>
                </div>

                {renderChecklistSection('일반항목', '일반항목', true)}
                
                <div className="md:grid md:grid-cols-12">
                    <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">화기작업</div>
                    <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                        <div className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0">
                           <div className="md:col-span-6 text-gray-800">해당 작업 유/무</div>
                           <div className="md:col-span-4 mt-2 md:mt-0">
                                <RadioGroup label="" name="isHotWork" value={data.isHotWork || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ isHotWork: e.target.value as 'yes' | 'no' })} />
                           </div>
                        </div>
                        {data.isHotWork === 'yes' && (data.hazardousSafetyCheckList?.filter(i => i.category === '화기작업') || []).map((item, index) => (
                             <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                <div className="md:col-span-6 text-gray-800">{index+1}. {item.text}</div>
                                <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                        <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                        <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:grid md:grid-cols-12">
                    <div className="p-3 font-bold text-gray-800 md:col-span-2 md:font-semibold md:bg-gray-50 md:text-gray-700 md:flex md:items-center md:justify-center">고소작업</div>
                    <div className="px-4 pb-4 md:p-0 md:col-span-10 md:divide-y md:divide-gray-200">
                        <div className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0">
                           <div className="md:col-span-6 text-gray-800">해당 작업 유/무</div>
                           <div className="md:col-span-4 mt-2 md:mt-0">
                               <RadioGroup label="" name="isHighAltitudeWork" value={data.isHighAltitudeWork || ''} options={[{label: '유', value: 'yes'}, {label: '무', value: 'no'}]} onChange={e => updateData({ isHighAltitudeWork: e.target.value as 'yes' | 'no' })} />
                           </div>
                        </div>
                        {data.isHighAltitudeWork === 'yes' && (
                            <>
                                {/* 사다리, 작업발판 */}
                                <div className="py-3 md:p-3 bg-gray-50 border-b">
                                    <div className="font-semibold text-sm text-gray-800">1. 사다리, 작업발판</div>
                                </div>
                                {(data.hazardousSafetyCheckList?.filter(i => i.category === '고소작업-사다리') || []).map((item, index) => (
                                    <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                        <div className="md:col-span-6 text-gray-800 pl-4">- {item.text}</div>
                                        <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                                <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                                <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* 틀비계 */}
                                <div className="py-3 md:p-3 bg-gray-50 border-b">
                                    <div className="font-semibold text-sm text-gray-800">2. 틀비계</div>
                                </div>
                                {(data.hazardousSafetyCheckList?.filter(i => i.category === '고소작업-틀비계') || []).map((item, index) => (
                                    <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                        <div className="md:col-span-6 text-gray-800 pl-4">- {item.text}</div>
                                        <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                                <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                                <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* 달비계 */}
                                <div className="py-3 md:p-3 bg-gray-50 border-b">
                                    <div className="font-semibold text-sm text-gray-800">3. 달비계</div>
                                </div>
                                {(data.hazardousSafetyCheckList?.filter(i => i.category === '고소작업-달비계') || []).map((item, index) => (
                                    <div key={item.id} className="py-4 md:py-0 md:grid md:grid-cols-10 md:gap-4 items-center md:p-3 border-b md:border-b-0 last:border-b-0">
                                        <div className="md:col-span-6 text-gray-800 pl-4">- {item.text}</div>
                                        <div className="md:col-span-4 grid grid-cols-2 gap-4 mt-3 md:mt-0">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">해당여부</span>
                                                <RadioGroup label="" name={`applicable-${item.id}`} value={item.applicable} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'applicable', e.target.value as 'O' | 'X')} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 md:hidden">실시여부</span>
                                                <RadioGroup label="" name={`implemented-${item.id}`} value={item.implemented} options={[{label: 'O', value: 'O'}, {label: 'X', value: 'X'}]} onChange={e => handleSafetyCheckChange(item.id, 'implemented', e.target.value as 'O' | 'X')} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Special Notes */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-start gap-3">
                    <label className="font-semibold text-sm text-gray-600 pt-2">기타 특이사항</label>
                    <textarea className={`${inputClasses} h-24`} placeholder="안전조치 외 주의사항 등 기재" value={data.specialNotes} onChange={e => updateData({ specialNotes: e.target.value })}></textarea>
                </div>
            </div>
            
             {/* Gas Measurement */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] items-start gap-3">
                    <label className="font-semibold text-sm text-gray-600 pt-2">가스농도 측정</label>
                    <div className="w-full space-y-3">
                        <div className="hidden sm:grid grid-cols-[1fr,1fr,1fr,auto] gap-2 items-center font-semibold text-sm text-gray-600">
                            <span>가스명</span>
                            <span>농도</span>
                            <span>측정시간</span>
                            <span className="w-10"></span>
                        </div>
                         {(data.gasMeasurements || []).map(item => (
                             <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,1fr,auto] gap-2 items-center">
                                 <div>
                                     <label className="text-sm font-medium text-gray-600 sm:hidden">가스명</label>
                                     <input type="text" value={item.name} onChange={e => handleGasMeasurementChange(item.id, 'name', e.target.value)} className={inputClasses} />
                                 </div>
                                 <div>
                                     <label className="text-sm font-medium text-gray-600 sm:hidden">농도</label>
                                     <input type="text" value={item.concentration} onChange={e => handleGasMeasurementChange(item.id, 'concentration', e.target.value)} className={inputClasses} />
                                 </div>
                                 <div>
                                     <label className="text-sm font-medium text-gray-600 sm:hidden">측정시간</label>
                                     <input type="time" value={item.time} onChange={e => handleGasMeasurementChange(item.id, 'time', e.target.value)} className={inputClasses} />
                                 </div>
                                 <div className="justify-self-end sm:justify-self-center">
                                     <Button type="button" variant="danger" onClick={() => removeGasRow(item.id)} className="px-2 py-1 ml-2 text-xs !rounded-full aspect-square">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" /></svg>
                                     </Button>
                                 </div>
                             </div>
                         ))}
                         <Button type="button" variant="secondary" onClick={addGasRow} className="mt-3 text-xs px-3 py-1.5">측정 항목 추가</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Step4WorkPermit: React.FC<Step4Props> = ({ data, updateData }) => {
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as 'general' | 'hazardous' | 'confined';
    updateData({ type: newType });
  };
  
  return (
    <Card>
      <CardHeader
        title="작업 허가서"
        description="작업 허가서 발급을 위해 세부 정보를 작성해주세요."
      />
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">작업 유형</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center text-md cursor-pointer">
              <input type="radio" name="workType" value="general" checked={data.type === 'general'} onChange={handleTypeChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
              <span className="ml-2">일반</span>
            </label>
            <label className="flex items-center text-md cursor-pointer">
              <input type="radio" name="workType" value="hazardous" checked={data.type === 'hazardous'} onChange={handleTypeChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
              <span className="ml-2">위험(화기, 고소작업)</span>
            </label>
            <label className="flex items-center text-md cursor-pointer">
              <input type="radio" name="workType" value="confined" checked={data.type === 'confined'} onChange={handleTypeChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
              <span className="ml-2">밀폐공간작업</span>
            </label>
          </div>
        </div>
        
        {data.type === 'general' && <GeneralWorkPermitForm data={data} updateData={updateData} />}

        {data.type === 'hazardous' && <HazardousWorkPermitForm data={data} updateData={updateData} />}

        {data.type === 'confined' && <ConfinedSpaceWorkPermitForm data={data} updateData={updateData} />}

      </div>
    </Card>
  );
};

export default Step4WorkPermit;
