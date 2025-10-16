import React, { useState, useEffect } from 'react';
import { SafetyTraining, WorkTypeSelection, HeightWorkSubType } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Checkbox } from './ui/Checkbox.tsx';
import { Button } from './ui/Button.tsx';
import { HEIGHT_WORK_VIDEOS } from '../constants.ts';

interface Step2Props {
  data: SafetyTraining;
  updateData: (field: keyof SafetyTraining, value: boolean | Date | null | number) => void;
  onComplete: () => void;
}

interface VideoConfig {
  type: keyof WorkTypeSelection | 'heightWorkLadder' | 'heightWorkScaffold' | 'heightWorkHangingScaffold';
  title: string;
  url: string; // URL will be provided later
}

export const Step2SafetyTraining: React.FC<Step2Props> = ({ data, updateData, onComplete }) => {
  const [currentVideoCompleted, setCurrentVideoCompleted] = useState(false);

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
  const baseVideoConfigs: VideoConfig[] = [
    { type: 'general', title: '일반작업 안전교육', url: 'placeholder-general-video-url' },
    { type: 'confined', title: '밀폐공간작업 안전교육', url: 'https://www.youtube.com/watch?v=6886vrKJ9-g' },
    { type: 'hotWork', title: '화기작업 안전교육', url: 'placeholder-hot-video-url' }
  ];

  // Build video list including height work sub-types
  const buildVideoList = (): VideoConfig[] => {
    const videos: VideoConfig[] = [];
    
    // Add general work type
    if (data.workTypes.general) {
      videos.push(baseVideoConfigs.find(v => v.type === 'general')!);
    }
    
    // Add confined space
    if (data.workTypes.confined) {
      videos.push(baseVideoConfigs.find(v => v.type === 'confined')!);
    }
    
    // Add height work sub-types
    if (data.workTypes.heightWork && data.workTypes.heightWorkSubType) {
      if (data.workTypes.heightWorkSubType.ladder) {
        videos.push({
          type: 'heightWorkLadder',
          title: HEIGHT_WORK_VIDEOS.ladder.title,
          url: HEIGHT_WORK_VIDEOS.ladder.url
        });
      }
      if (data.workTypes.heightWorkSubType.scaffold) {
        videos.push({
          type: 'heightWorkScaffold',
          title: HEIGHT_WORK_VIDEOS.scaffold.title,
          url: HEIGHT_WORK_VIDEOS.scaffold.url
        });
      }
      if (data.workTypes.heightWorkSubType.hangingScaffold) {
        videos.push({
          type: 'heightWorkHangingScaffold',
          title: HEIGHT_WORK_VIDEOS.hangingScaffold.title,
          url: HEIGHT_WORK_VIDEOS.hangingScaffold.url
        });
      }
    }
    
    // Add hot work
    if (data.workTypes.hotWork) {
      videos.push(baseVideoConfigs.find(v => v.type === 'hotWork')!);
    }
    
    return videos;
  };

  // Get selected video types
  const selectedVideos = buildVideoList();
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

  if (!currentVideo) {
    return (
      <Card>
        <CardHeader
          title="안전 교육"
          description="영상 정보를 불러올 수 없습니다."
        />
        <div className="text-center py-12">
          <p className="text-gray-500">이전 단계로 돌아가서 다시 시도해주세요.</p>
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

        {/* Selected work types progress */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">교육 진행 상황:</h4>
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

        {/* Current video display */}
        <div className="border border-gray-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">{currentVideo.title}</h3>
          
          {currentVideo.url.startsWith('placeholder-') ? (
            // Placeholder for videos without URLs
            <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">교육 영상이 준비 중입니다</p>
                <p className="text-sm text-gray-400">{currentVideo.url}</p>
                {/* Temporary button for placeholder videos */}
                <Button 
                  onClick={handleVideoComplete}
                  className="mt-4"
                  disabled={currentVideoCompleted}
                >
                  {currentVideoCompleted ? '시청 완료' : '시청 완료 (임시)'}
                </Button>
              </div>
            </div>
          ) : (
            // Actual video iframe for YouTube URLs
            <div className="space-y-4">
              <div className="w-full aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={getYouTubeEmbedUrl(currentVideo.url)}
                  title={currentVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              {/* Video completion button */}
              <div className="text-center">
                <Button 
                  onClick={handleVideoComplete}
                  disabled={currentVideoCompleted}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {currentVideoCompleted ? '✓ 시청 완료' : '영상 시청 완료'}
                </Button>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-400 mt-2">URL: {currentVideo.url}</p>
        </div>

        {/* Navigation buttons */}
        {currentVideoCompleted && (
          <div className="flex justify-between items-center p-6 border-l-4 border-emerald-500 bg-emerald-50 rounded-lg">
            <div>
              <p className="text-emerald-800 font-medium">
                {isLastVideo ? '모든 교육이 완료되었습니다!' : '영상 시청이 완료되었습니다.'}
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