import React from 'react';
import { ProjectInfo } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Input } from './ui/Input.tsx';
import { Select } from './ui/Select.tsx';
import { LOCATIONS } from '../constants.ts';

interface Step1Props {
  data: ProjectInfo;
  updateData: (field: keyof ProjectInfo, value: string) => void;
}

export const Step1ProjectInfo: React.FC<Step1Props> = ({ data, updateData }) => {
  return (
    <Card>
      <CardHeader 
        title="프로젝트 정보"
        description="수행할 건설 프로젝트의 세부 정보를 입력해주세요."
      />
      <div className="space-y-6">
        <Select
          id="location"
          label="공사 위치"
          value={data.location}
          onChange={(e) => updateData('location', e.target.value)}
        >
          <option value="">장소를 선택하세요</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </Select>
        {data.location === '기타' && (
          <Input
            id="locationOther"
            label="기타 공사 위치"
            type="text"
            value={data.locationOther || ''}
            onChange={(e) => updateData('locationOther', e.target.value)}
            placeholder="공사 위치를 직접 입력하세요"
            required
          />
        )}
        <Input
          id="constructionName"
          label="공사명"
          type="text"
          value={data.constructionName}
          onChange={(e) => updateData('constructionName', e.target.value)}
          required
        />
        <Input
          id="companyName"
          label="업체명"
          type="text"
          value={data.companyName}
          onChange={(e) => updateData('companyName', e.target.value)}
          required
        />
        <Input
          id="contactPerson"
          label="담당자 성명"
          type="text"
          value={data.contactPerson}
          onChange={(e) => updateData('contactPerson', e.target.value)}
          required
        />
      </div>
    </Card>
  );
};