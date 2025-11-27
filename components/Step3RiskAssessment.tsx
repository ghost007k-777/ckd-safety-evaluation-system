import React, { useState } from 'react';
import { RiskAssessment, RiskItem } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { DISASTER_TYPES } from '../constants.ts';
import { generateUniqueId } from '../utils.ts';

interface Step3Props {
  data: RiskAssessment;
  setData: (data: RiskAssessment) => void;
}

// 가능성/중대성 기준표 팝업 컴포넌트
interface CriteriaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'likelihood' | 'severity';
}

const CriteriaPopup: React.FC<CriteriaPopupProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const likelihoodCriteria = [
    { level: 5, name: '매우 높음', description: '피해가 발생할 가능성이 매우 높음. 안전대책이 되어 있지 않고, 안전표시·표지가 없으며, 안전수칙·작업표준 등도 없음' },
    { level: 4, name: '높음', description: '피해가 발생할 가능성이 높음. 가드·방호복개 등 안전장치를 설치하였으나 쉽게 해제가 가능하고, 안전수칙·작업표준을 시키기 어려운 것이 필요함' },
    { level: 3, name: '보통', description: '부주의하면 피해가 발생할 가능성이 있음. 가드·방호복개 등 안전장치를 설치하였으나 쉽게 해제가 가능하고, 일부 안전수칙·작업표준이 준수하기 어려움' },
    { level: 2, name: '낮음', description: '피해가 발생할 가능성이 낮음. 가드·방호복개 등 안전장치가 적정하게 설치되어 있고, 안전수칙 등의 준수가 쉬우나 피해의 가능성이 남아 있음' },
    { level: 1, name: '매우 낮음', description: '피해가 발생할 가능성이 매우 낮음. 가드·방호복개 등 안전장치가 적정하게 설치되어 있고, 안전수칙 등의 준수가 쉬우며 전반적 안전조치가 잘 되어 있음' }
  ];

  const severityCriteria = [
    { level: 4, name: '사망자, 장애발생', description: '사망 또는 영구적 근로불능, 장애가 남는 부상·질병 (ex. 추락, 감전, 질식 등의 사고 위험이 있는 작업)' },
    { level: 3, name: '휴업 필요', description: '휴업을 수반하는 중대한 부상 또는 질병(복귀 완치 가능)' },
    { level: 2, name: '경상', description: '휴업을 수반하지 않는 부상 또는 질병' },
    { level: 1, name: '무해', description: '부상 또는 질병이 발생하지 않음' }
  ];

  const criteria = type === 'likelihood' ? likelihoodCriteria : severityCriteria;
  const title = type === 'likelihood' ? '위험의 가능성(빈도) 기준' : '위험의 중대성(강도) 기준';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b-2 border-[#E9ECEF] p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-[#212529]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#6C757D] hover:text-[#212529] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full border-2 border-[#DEE2E6]">
              <thead>
                <tr className="bg-[#F8F9FA]">
                  <th className="px-6 py-4 text-center font-bold text-[#212529] border-2 border-[#DEE2E6] w-32">구분</th>
                  <th className="px-6 py-4 text-center font-bold text-[#212529] border-2 border-[#DEE2E6] w-40">
                    {type === 'likelihood' ? '가능성(빈도)' : '중대성(강도)'}
                  </th>
                  <th className="px-6 py-4 text-center font-bold text-[#212529] border-2 border-[#DEE2E6]">내용</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((item) => (
                  <tr key={item.level} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="px-6 py-4 text-center font-semibold text-[#212529] border-2 border-[#DEE2E6]">
                      {item.level === criteria[0].level ? '최상' :
                        item.level === criteria[criteria.length - 1].level ? '최하' :
                          item.level === criteria[1]?.level ? (type === 'likelihood' ? '상' : '최대') :
                            item.level === criteria[2]?.level ? (type === 'likelihood' ? '중' : '대') :
                              item.level === criteria[3]?.level ? '하' : ''}
                    </td>
                    <td className="px-6 py-4 text-center border-2 border-[#DEE2E6]">
                      <div className="font-bold text-lg text-[#0066CC] mb-1">{item.name}</div>
                      <div className="text-sm text-[#6C757D]">{item.level}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#343A40] border-2 border-[#DEE2E6] leading-relaxed">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const RiskRow: React.FC<{ item: RiskItem; onUpdate: (item: RiskItem) => void; onRemove: (id: string) => void }> = ({ item, onUpdate, onRemove }) => {
  const [showLikelihoodPopup, setShowLikelihoodPopup] = useState(false);
  const [showSeverityPopup, setShowSeverityPopup] = useState(false);

  const riskScore = item.likelihood * item.severity;
  const riskColor = riskScore >= 9 ? 'bg-rose-50' : riskScore >= 4 ? 'bg-amber-50' : 'bg-emerald-50';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 border p-6 rounded-xl ${riskColor}`}>
      <Input label="장소명(공정명)" value={item.location} onChange={e => onUpdate({ ...item, location: e.target.value })} />
      <Input label="세부작업명" value={item.task} onChange={e => onUpdate({ ...item, task: e.target.value })} />
      <div className="md:col-span-2">
        <Input label="유해·위험요인" value={item.hazard} onChange={e => onUpdate({ ...item, hazard: e.target.value })} />
      </div>
      <Select label="재해유형분류" value={item.disasterType} onChange={e => onUpdate({ ...item, disasterType: e.target.value })}>
        <option value="">유형 선택</option>
        {DISASTER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
      </Select>
      <div className="md:col-span-2">
        <Input label="현재 안전보건조치" value={item.safetyMeasures} onChange={e => onUpdate({ ...item, safetyMeasures: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-semibold text-[#343A40]">가능성 (1-5)</label>
            <button
              type="button"
              onClick={() => setShowLikelihoodPopup(true)}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0066CC] text-white hover:bg-[#0052A3] transition-colors"
              title="가능성 기준표 보기"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <select
            value={item.likelihood}
            onChange={e => onUpdate({ ...item, likelihood: parseInt(e.target.value) })}
            className="block w-full px-4 py-3 border-2 border-[#DEE2E6] rounded-lg text-[#212529] text-base bg-white transition-all duration-200 focus:border-[#0066CC] focus:ring-2 focus:ring-[#CCE1FF] hover:border-[#ADB5BD]"
          >
            <option value={5}>5 - 매우 높음</option>
            <option value={4}>4 - 높음</option>
            <option value={3}>3 - 보통</option>
            <option value={2}>2 - 낮음</option>
            <option value={1}>1 - 매우 낮음</option>
          </select>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-semibold text-[#343A40]">중대성 (1-4)</label>
            <button
              type="button"
              onClick={() => setShowSeverityPopup(true)}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0066CC] text-white hover:bg-[#0052A3] transition-colors"
              title="중대성 기준표 보기"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <select
            value={item.severity}
            onChange={e => onUpdate({ ...item, severity: parseInt(e.target.value) })}
            className="block w-full px-4 py-3 border-2 border-[#DEE2E6] rounded-lg text-[#212529] text-base bg-white transition-all duration-200 focus:border-[#0066CC] focus:ring-2 focus:ring-[#CCE1FF] hover:border-[#ADB5BD]"
          >
            <option value={4}>4 - 사망자, 장애발생</option>
            <option value={3}>3 - 휴업 필요</option>
            <option value={2}>2 - 경상</option>
            <option value={1}>1 - 무해</option>
          </select>
        </div>
        <div className="text-center p-3 rounded-lg bg-white border-2 border-[#DEE2E6]">
          <div className="text-sm text-[#6C757D]">위험성</div>
          <div className="font-bold text-2xl text-[#212529]">{riskScore}</div>
        </div>
      </div>

      {/* 팝업들 */}
      <CriteriaPopup
        isOpen={showLikelihoodPopup}
        onClose={() => setShowLikelihoodPopup(false)}
        type="likelihood"
      />
      <CriteriaPopup
        isOpen={showSeverityPopup}
        onClose={() => setShowSeverityPopup(false)}
        type="severity"
      />
      <div className="md:col-span-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-semibold text-gray-700">
              위험성 감소대책
            </label>
            {riskScore >= 9 && (
              <span className="text-xs text-red-600 font-medium">* 필수 입력</span>
            )}
            <span className="text-xs text-gray-500">(위험성 9 이상일 경우 작성)</span>
          </div>
          <input
            type="text"
            value={item.reductionMeasures}
            onChange={e => onUpdate({ ...item, reductionMeasures: e.target.value })}
            required={riskScore >= 9}
            className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 text-base bg-white placeholder-gray-400 transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:border-gray-400"
            placeholder={riskScore >= 9 ? "위험성 감소를 위한 대책을 입력하세요" : "선택 사항"}
          />
        </div>
      </div>
      <div className="md:col-span-2 text-right">
        <Button variant="danger" onClick={() => onRemove(item.id)} className="px-4 py-2">삭제</Button>
      </div>
    </div>
  );
};

const Step3RiskAssessment: React.FC<Step3Props> = ({ data, setData }) => {

  const addRow = () => {
    setData([
      ...data,
      {
        id: generateUniqueId(),
        location: '', task: '', disasterType: '', hazard: '', safetyMeasures: '',
        likelihood: 1, severity: 1, reductionMeasures: ''
      }
    ]);
  };

  const updateRow = (updatedItem: RiskItem) => {
    setData(data.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <div className="hidden sm:block w-24 h-24 flex-shrink-0">
          <img
            src="/assets/risk.png"
            alt="Risk Assessment"
            className="w-full h-full object-contain filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300 mix-blend-multiply"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">위험성 평가</h2>
          <p className="text-slate-500 text-lg">
            잠재적 위험 요소를 식별하고 완화 조치를 작성합니다.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-800">위험성평가 작성</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">최소 1건 이상 작성해주세요.</p>
            </div>
          </div>

          <div className="space-y-8">
            {data.map(item => <RiskRow key={item.id} item={item} onUpdate={updateRow} onRemove={removeRow} />)}
            <Button onClick={addRow} className="w-full py-4 border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold rounded-xl">
              + 위험 항목 추가하기
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Step3RiskAssessment;