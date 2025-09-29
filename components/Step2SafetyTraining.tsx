import React, { useState, useEffect } from 'react';
import { SafetyTraining, WorkTypeSelection } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Checkbox } from './ui/Checkbox.tsx';
import { Button } from './ui/Button.tsx';

interface Step2Props {
  data: SafetyTraining;
  updateData: (field: keyof SafetyTraining, value: boolean | Date | null | number) => void;
  onComplete: () => void;
}

interface VideoConfig {
  type: keyof WorkTypeSelection;
  title: string;
  url: string; // URL will be provided later
}

export const Step2SafetyTraining: React.FC<Step2Props> = ({ data, updateData, onComplete }) => {
  const [currentVideoCompleted, setCurrentVideoCompleted] = useState(false);

  // Video configurations (URLs will be provided later)
  const videoConfigs: VideoConfig[] = [
    { type: 'general', title: '일반작업 안전교육', url: 'placeholder-general-video-url' },
    { type: 'confined', title: '밀폐공간작업 안전교육', url: 'placeholder-confined-video-url' },
    { type: 'heightWork', title: '고소작업 안전교육', url: 'placeholder-height-video-url' },
    { type: 'hotWork', title: '화기작업 안전교육', url: 'placeholder-hot-video-url' }
  ];

  // Get selected video types
  const selectedVideos = videoConfigs.filter(config => data.workTypes[config.type]);
  const currentVideo = selectedVideos[data.currentVideoIndex];
  const isLastVideo = data.currentVideoIndex >= selectedVideos.length - 1;

  const handleVideoComplete = () => {
    setCurrentVideoCompleted(true);
  };

  const handleNextVideo = () => {
    if (isLastVideo) {
      // All videos completed
      updateData('allVideosCompleted', true);
      updateData('completed', true);
      updateData('completionDate', new Date());
      onComplete();
    } else {
      // Move to next video
      updateData('currentVideoIndex', data.currentVideoIndex + 1);
      setCurrentVideoCompleted(false);
    }
  };

  const handlePreviousVideo = () => {
    if (data.currentVideoIndex > 0) {
      updateData('currentVideoIndex', data.currentVideoIndex - 1);
      setCurrentVideoCompleted(false);
    }
  };

  if (!currentVideo) {
    return (
      <Card>
        <CardHeader
          title="안전 교육"
          description="선택된 작업 유형이 없습니다."
        />
        <div className="text-center py-12">
          <p className="text-gray-500">이전 단계로 돌아가서 작업 유형을 선택해주세요.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <span>
            안전 교육
            <span className="text-sm ml-2 text-gray-500">
              ({data.currentVideoIndex + 1}/{selectedVideos.length})
            </span>
          </span>
        }
        description={`${currentVideo.title}을 시청해주세요.`}
      />
      
      <div className="space-y-8">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((data.currentVideoIndex + (currentVideoCompleted ? 1 : 0)) / selectedVideos.length) * 100}%` }}
          ></div>
        </div>

        {/* Video player area */}
        <div className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{currentVideo.title}</h3>
            <p className="text-gray-500 mb-4">교육 영상이 여기에 표시됩니다.</p>
            <p className="text-sm text-gray-400">URL: {currentVideo.url}</p>
            
            {/* Temporary button to simulate video completion */}
            <Button 
              onClick={handleVideoComplete}
              className="mt-4"
              disabled={currentVideoCompleted}
            >
              {currentVideoCompleted ? '영상 시청 완료' : '영상 시청 완료 (임시)'}
            </Button>
          </div>
        </div>

        {/* Selected work types */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">교육 대상 작업 유형:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedVideos.map((video, index) => (
              <span
                key={video.type}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  index < data.currentVideoIndex 
                    ? 'bg-green-100 text-green-800' 
                    : index === data.currentVideoIndex
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index < data.currentVideoIndex && '✓ '}{video.title}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        {currentVideoCompleted && (
          <div className="flex justify-between items-center p-6 border-l-4 border-emerald-500 bg-emerald-50 rounded-lg">
            <div>
              <p className="text-emerald-800 font-medium">
                {isLastVideo ? '모든 교육이 완료되었습니다!' : '교육 영상 시청이 완료되었습니다.'}
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                {isLastVideo ? '위험성 평가 단계로 이동합니다.' : '다음 교육 영상을 시청해주세요.'}
              </p>
            </div>
            <div className="flex space-x-3">
              {data.currentVideoIndex > 0 && (
                <Button variant="secondary" onClick={handlePreviousVideo}>
                  이전 영상
                </Button>
              )}
              <Button onClick={handleNextVideo}>
                {isLastVideo ? '다음 단계' : '다음 영상'}
              </Button>
            </div>
          </div>
        )}

        {data.completionDate && (
          <p className="text-sm text-emerald-700 font-medium">
            교육 완료일: {data.completionDate.toLocaleString('ko-KR')}
          </p>
        )}
      </div>
    </Card>
  );
};