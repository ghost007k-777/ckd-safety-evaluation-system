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
  const [watchTime, setWatchTime] = useState(0);
  const [canComplete, setCanComplete] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // 영상 시청 타이머 (3분 = 180초)
  useEffect(() => {
    const timer = setInterval(() => {
      setWatchTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= 180) { // 3분
          setCanComplete(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data.currentVideoIndex]); // 영상이 바뀔 때마다 타이머 리셋

  // 영상이 바뀔 때 타이머 리셋
  useEffect(() => {
    setWatchTime(0);
    setCanComplete(false);
    setCurrentVideoCompleted(false);
  }, [data.currentVideoIndex]);

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

  // 시간 포맷 함수 (초 -> 분:초)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video configurations
  const baseVideoConfigs: VideoConfig[] = [
    { type: 'general', title: '일반작업 안전교육', url: 'https://youtu.be/AEmvaCOJ9bg?si=vsRnpcKAO7QCMbFu' },
    { type: 'confined', title: '밀폐공간작업 안전교육', url: 'https://www.youtube.com/watch?v=6886vrKJ9-g' },
    { type: 'hotWork', title: '화기작업 안전교육', url: 'https://youtu.be/thn3M_DmoWA?si=GC3LziifK6c7OMZR' }
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
    if (canComplete) {
      setCurrentVideoCompleted(true);
    } else {
      // 3분 미만이면 관리자 암호 입력 프롬프트 표시
      setShowAdminPrompt(true);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin') {
      setCurrentVideoCompleted(true);
      setShowAdminPrompt(false);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('올바른 관리자 암호가 아닙니다.');
      setAdminPassword('');
    }
  };

  const handleAdminCancel = () => {
    setShowAdminPrompt(false);
    setAdminPassword('');
    setAdminError('');
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
              {/* 시청 시간 표시 및 Video completion button */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-lg font-semibold ${canComplete ? 'text-green-600' : 'text-orange-600'}`}>
                    시청 시간: {formatTime(watchTime)} / 3:00
                  </span>
                </div>
                {!canComplete && (
                  <p className="text-sm text-orange-600">
                    ⚠️ 최소 3분 이상 시청 후 완료 버튼이 활성화됩니다
                  </p>
                )}
                <Button 
                  onClick={handleVideoComplete}
                  disabled={currentVideoCompleted}
                  className={`${canComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed hover:bg-gray-400'}`}
                >
                  {currentVideoCompleted ? '✓ 시청 완료' : canComplete ? '영상 시청 완료' : '영상 시청 완료 (3분 후 활성화)'}
                </Button>
                {!canComplete && !currentVideoCompleted && (
                  <p className="text-xs text-gray-500">
                    테스트를 위해 관리자 암호로 건너뛸 수 있습니다
                  </p>
                )}
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

      {/* 관리자 암호 입력 팝업 */}
      {showAdminPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-[#212529] mb-3">관리자 인증</h3>
            <p className="text-[#6C757D] mb-2">
              영상 시청 시간이 3분 미만입니다.
            </p>
            <p className="text-sm text-[#6C757D] mb-6">
              테스트를 위해 관리자 암호를 입력하면 바로 진행할 수 있습니다.
            </p>
            
            <form onSubmit={handleAdminSubmit}>
              <div className="mb-6">
                <label htmlFor="admin-password" className="block text-sm font-semibold text-[#343A40] mb-2">
                  관리자 암호 <span className="text-[#DC3545]">*</span>
                </label>
                <input
                  type="password"
                  id="admin-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="관리자 암호를 입력하세요"
                  className="block w-full px-4 py-3 border-2 border-[#DEE2E6] rounded-lg text-[#212529] text-base bg-white placeholder-[#ADB5BD] transition-all duration-200 focus:border-[#0066CC] focus:ring-2 focus:ring-[#CCE1FF] hover:border-[#ADB5BD]"
                  autoFocus
                  required
                />
                {adminError && (
                  <p className="mt-2 text-sm text-[#DC3545] font-medium">{adminError}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleAdminCancel}
                >
                  취소
                </Button>
                <Button type="submit" variant="primary" size="lg">
                  확인
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};