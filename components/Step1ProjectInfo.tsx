import React from 'react';
import { ProjectInfo } from '../types.ts';
import { Card } from './ui/Card.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { LOCATIONS } from '../constants.ts';

interface Step1Props {
  data: ProjectInfo;
  updateData: (field: keyof ProjectInfo, value: string) => void;
}

export const Step1ProjectInfo: React.FC<Step1Props> = ({ data, updateData }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <div className="hidden sm:block w-24 h-24 flex-shrink-0">
          <img
            src="/assets/site.png"
            alt="Construction Site"
            className="w-full h-full object-contain filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300 mix-blend-multiply"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">프로젝트 정보</h2>
          <p className="text-slate-500 text-lg">
            수행할 건설 프로젝트의 기본 정보를 입력해주세요.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Select
                id="location"
                label="공사 위치"
                value={data.location}
                onChange={(e) => updateData('location', e.target.value)}
                className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-200 transition-all"
              >
                <option value="">장소를 선택하세요</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </Select>

              {data.location === '기타' && (
                <div className="animate-fadeIn">
                  <Input
                    id="locationOther"
                    label="기타 공사 위치"
                    type="text"
                    value={data.locationOther || ''}
                    onChange={(e) => updateData('locationOther', e.target.value)}
                    placeholder="공사 위치를 직접 입력하세요"
                    required
                    className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-200 transition-all"
                  />
                </div>
              )}

              <Input
                id="constructionName"
                label="공사명"
                type="text"
                value={data.constructionName}
                onChange={(e) => updateData('constructionName', e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="space-y-6">
              <Input
                id="companyName"
                label="업체명"
                type="text"
                value={data.companyName}
                onChange={(e) => updateData('companyName', e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-200 transition-all"
              />

              <Input
                id="contactPerson"
                label="담당자 성명"
                type="text"
                value={data.contactPerson}
                onChange={(e) => updateData('contactPerson', e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};