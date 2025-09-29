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
  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url; // Return original URL if not a YouTube URL
  };

  // Video configurations
  const videoConfigs: VideoConfig[] = [
    { type: 'general', title: '일반작업 안전교육', url: 'placeholder-general-video-url' },
    { type: 'confined', title: '밀폐공간작업 안전교육', url: 'https://www.youtube.com/watch?v=6886vrKJ9-g' },
    { type: 'heightWork', title: '고소작업 안전교육', url: 'placeholder-height-video-url' },
    { type: 'hotWork', title: '화기작업 안전교육', url: 'placeholder-hot-video-url' }
  ];

  // Get selected video types
  const selectedVideos = videoConfigs.filter(config => data.workTypes[config.type]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    updateData('completed', isChecked);
    updateData('completionDate', isChecked ? new Date() : null);
    if (isChecked) {
      updateData('allVideosCompleted', true);
    }
  };

  if (selectedVideos.length === 0) {
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
        title="안전 교육"
        description="선택하신 작업 유형에 대한 안전 교육을 진행합니다."
      />
      
      <div className="space-y-8">
        {/* Selected work types display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">교육 대상 작업 유형:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedVideos.map((video) => (
              <span
                key={video.type}
                className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800"
              >
                {video.title}
              </span>
            ))}
          </div>
        </div>

        {/* Video display area */}
        <div className="space-y-6">
          {selectedVideos.map((video) => (
            <div key={video.type} className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{video.title}</h3>
              
              {video.url.startsWith('placeholder-') ? (
                // Placeholder for videos without URLs
                <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">교육 영상이 준비 중입니다</p>
                    <p className="text-sm text-gray-400">{video.url}</p>
                  </div>
                </div>
              ) : (
                // Actual video iframe for YouTube URLs
                <div className="w-full aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl(video.url)}
                    title={video.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-2">URL: {video.url}</p>
            </div>
          ))}
        </div>

        {/* Completion checkbox */}
        <div className="p-6 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg">
          <Checkbox
            id="training-completed"
            label="안전 교육을 이수하였습니다."
            checked={data.completed}
            onChange={handleCheckboxChange}
          />
        </div>

        {data.completionDate && (
          <p className="text-sm text-emerald-700 font-medium">
            교육 이수일: {data.completionDate.toLocaleString('ko-KR')}
          </p>
        )}
      </div>
    </Card>
  );
};