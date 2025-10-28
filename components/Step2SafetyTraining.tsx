import React, { useState, useEffect } from 'react';
import { SafetyTraining, WorkTypeSelection, HeightWorkSubType, TrainingAttendee } from '../types.ts';
import { Card, CardHeader } from './ui/Card.tsx';
import { Checkbox } from './ui/Checkbox.tsx';
import { Button } from './ui/Button.tsx';
import { Input } from './ui/Input.tsx';
import { SignaturePad } from './SignaturePad.tsx';
import { HEIGHT_WORK_VIDEOS } from '../constants.ts';

interface Step2Props {
  data: SafetyTraining;
  updateData: (field: keyof SafetyTraining, value: boolean | Date | null | number | TrainingAttendee[]) => void;
  onComplete: () => void;
}

interface VideoConfig {
  type: keyof WorkTypeSelection | 'heightWorkLadder' | 'heightWorkScaffold' | 'heightWorkHangingScaffold';
  title: string;
  url: string; // URL will be provided later
}

export const Step2SafetyTraining: React.FC<Step2Props> = ({ data, updateData, onComplete }) => {
  console.log('🎬🎬🎬 [SafetyTraining] 컴포넌트 렌더링 시작');
  console.log('🎬 [SafetyTraining] 받은 data:', data);
  console.log('🎬 [SafetyTraining] data.workTypes:', data.workTypes);
  
  // 교육이 완료된 상태인지 확인
  const isTrainingCompleted = data.completed && data.allVideosCompleted;
  
  const [currentVideoCompleted, setCurrentVideoCompleted] = useState(isTrainingCompleted);
  const [watchTime, setWatchTime] = useState(0);
  const [canComplete, setCanComplete] = useState(isTrainingCompleted);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAttendeeForm, setShowAttendeeForm] = useState(false);
  const [tempAttendees, setTempAttendees] = useState<TrainingAttendee[]>([
    { id: '1', name: '', signature: '', trainingType: '' }
  ]);

  // 컴포넌트 마운트 시 교육 완료 상태 복원
  useEffect(() => {
    if (isTrainingCompleted) {
      setCurrentVideoCompleted(true);
      setCanComplete(true);
      setWatchTime(180); // 완료된 상태로 표시
    }
  }, [isTrainingCompleted]);

  // 현재 영상이 이미 완료된 교육인지 확인하고 자동으로 완료 상태로 설정
  useEffect(() => {
    if (isCurrentVideoAlreadyCompleted && !isTrainingCompleted) {
      console.log('✅ 이미 완료한 교육:', currentVideo?.title);
      setCurrentVideoCompleted(true);
      setCanComplete(true);
      setWatchTime(180);
    }
  }, [isCurrentVideoAlreadyCompleted, isTrainingCompleted]);

  // 영상 시청 타이머 (3분 = 180초) - 교육이 완료되지 않은 경우에만 동작
  useEffect(() => {
    if (isTrainingCompleted || isCurrentVideoAlreadyCompleted) {
      return; // 교육 완료된 경우 또는 이미 완료한 교육인 경우 타이머 작동 안 함
    }

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
  }, [data.currentVideoIndex, isTrainingCompleted, isCurrentVideoAlreadyCompleted]); // 영상이 바뀔 때마다 타이머 리셋

  // 영상이 바뀔 때 타이머 리셋 - 교육이 완료되지 않은 경우에만
  useEffect(() => {
    if (!isTrainingCompleted) {
      // 이미 완료한 교육이 아닌 경우에만 리셋
      if (!isCurrentVideoAlreadyCompleted) {
        setWatchTime(0);
        setCanComplete(false);
        setCurrentVideoCompleted(false);
        setShowAttendeeForm(false);
        setTempAttendees([{ id: '1', name: '', signature: '', trainingType: '' }]);
      }
    }
  }, [data.currentVideoIndex, isTrainingCompleted, isCurrentVideoAlreadyCompleted]);

  // Helper function to convert YouTube URL to embed URL with autoplay
  const getYouTubeEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
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

  // Get selected video types (메모이제이션하여 불필요한 재계산 방지)
  const selectedVideos = React.useMemo(() => {
    console.log('🎬 [SafetyTraining] buildVideoList 호출, workTypes:', data.workTypes);
    const videos = buildVideoList();
    console.log('🎬 [SafetyTraining] 생성된 영상 목록:', videos.length, '개');
    return videos;
  }, [
    data.workTypes.general,
    data.workTypes.confined,
    data.workTypes.heightWork,
    data.workTypes.heightWorkSubType?.ladder,
    data.workTypes.heightWorkSubType?.scaffold,
    data.workTypes.heightWorkSubType?.hangingScaffold,
    data.workTypes.hotWork
  ]);
  
  const currentVideo = selectedVideos[data.currentVideoIndex];
  const isLastVideo = data.currentVideoIndex >= selectedVideos.length - 1;
  
  console.log('🎬 [SafetyTraining] currentVideoIndex:', data.currentVideoIndex);
  console.log('🎬 [SafetyTraining] currentVideo:', currentVideo);
  console.log('🎬 [SafetyTraining] selectedVideos.length:', selectedVideos.length);
  
  // 현재 영상이 이미 완료되었는지 확인 (attendees에 해당 교육 유형이 있는지 확인)
  const isCurrentVideoAlreadyCompleted = React.useMemo(() => {
    if (!currentVideo || !data.attendees || data.attendees.length === 0) {
      return false;
    }
    return data.attendees.some(attendee => attendee.trainingType === currentVideo.title);
  }, [currentVideo?.title, data.attendees]);

  const handleVideoComplete = () => {
    if (canComplete) {
      setCurrentVideoCompleted(true);
      // 마지막 영상일 때만 교육자 서명 폼 표시
      if (isLastVideo) {
        setShowAttendeeForm(true);
      }
    } else {
      // 3분 미만이면 관리자 암호 입력 프롬프트 표시
      setShowAdminPrompt(true);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin') {
      setCurrentVideoCompleted(true);
      // 마지막 영상일 때만 교육자 서명 폼 표시
      if (isLastVideo) {
        setShowAttendeeForm(true);
      }
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

  // 교육자 추가
  const handleAddAttendee = () => {
    const newAttendee: TrainingAttendee = {
      id: Date.now().toString(),
      name: '',
      signature: '',
      trainingType: ''
    };
    setTempAttendees([...tempAttendees, newAttendee]);
  };

  // 교육자 삭제
  const handleRemoveAttendee = (id: string) => {
    if (tempAttendees.length > 1) {
      setTempAttendees(tempAttendees.filter(attendee => attendee.id !== id));
    }
  };

  // 교육자 이름 변경
  const handleAttendeeNameChange = (id: string, name: string) => {
    setTempAttendees(tempAttendees.map(attendee =>
      attendee.id === id ? { ...attendee, name } : attendee
    ));
  };

  // 교육자 서명 변경
  const handleAttendeeSignatureChange = (id: string, signature: string) => {
    setTempAttendees(tempAttendees.map(attendee =>
      attendee.id === id ? { ...attendee, signature } : attendee
    ));
  };

  // 교육자 정보 저장 및 다음 단계
  const handleSaveAttendeesAndNext = () => {
    // 모든 교육자의 이름과 서명이 입력되었는지 확인
    const allFilled = tempAttendees.every(attendee => attendee.name.trim() !== '' && attendee.signature !== '');
    
    if (!allFilled) {
      alert('모든 교육자의 성명과 서명을 입력해주세요.');
      return;
    }

    // 현재 영상의 교육자 정보에 교육 유형 추가
    const attendeesWithType = tempAttendees.map(attendee => ({
      ...attendee,
      trainingType: currentVideo.title // 현재 교육 영상의 제목 저장
    }));

    // 현재 영상의 교육자 정보를 data.attendees에 추가
    const updatedAttendees = [...(data.attendees || []), ...attendeesWithType];
    updateData('attendees', updatedAttendees);

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
      setShowAttendeeForm(false);
      setTempAttendees([{ id: Date.now().toString(), name: '', signature: '', trainingType: '' }]);
    }
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
    console.error('❌ [SafetyTraining] selectedVideos가 비어있음!');
    console.error('❌ [SafetyTraining] data.workTypes:', data.workTypes);
    return (
      <Card>
        <CardHeader
          title="안전 교육"
          description="선택된 작업 유형이 없습니다."
        />
        <div className="text-center py-12">
          <p className="text-gray-500">이전 단계로 돌아가서 작업 유형을 선택해주세요.</p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm text-red-700 font-mono">
              디버그 정보:<br/>
              workTypes: {JSON.stringify(data.workTypes, null, 2)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!currentVideo) {
    console.error('❌ [SafetyTraining] currentVideo가 없음!');
    console.error('❌ [SafetyTraining] currentVideoIndex:', data.currentVideoIndex);
    console.error('❌ [SafetyTraining] selectedVideos:', selectedVideos);
    return (
      <Card>
        <CardHeader
          title="안전 교육"
          description="영상 정보를 불러올 수 없습니다."
        />
        <div className="text-center py-12">
          <p className="text-gray-500">이전 단계로 돌아가서 다시 시도해주세요.</p>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm text-red-700 font-mono">
              디버그 정보:<br/>
              currentVideoIndex: {data.currentVideoIndex}<br/>
              selectedVideos.length: {selectedVideos.length}<br/>
              selectedVideos: {JSON.stringify(selectedVideos.map(v => v.title), null, 2)}
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  console.log('✅ [SafetyTraining] 정상 렌더링 진행, currentVideo:', currentVideo?.title);

  return (
    <Card>
      <CardHeader
        title={
          <span>
            안전 교육
            <span className="text-sm ml-2 text-gray-500">
              ({data.currentVideoIndex + 1}/{selectedVideos.length})
            </span>
            {isTrainingCompleted && (
              <span className="ml-3 px-3 py-1 text-sm font-semibold bg-green-100 text-green-800 rounded-full">
                ✓ 교육 완료
              </span>
            )}
          </span>
        }
        description={isTrainingCompleted ? `모든 안전 교육이 완료되었습니다.` : `${currentVideo.title}을 시청해주세요.`}
      />
      
      <div className="space-y-8">
        {/* 교육 완료 안내 메시지 */}
        {isTrainingCompleted && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">모든 안전 교육이 완료되었습니다! 🎉</h3>
                <p className="text-sm text-green-700 mb-3">
                  교육 완료일: {data.completionDate?.toLocaleString('ko-KR')}
                </p>
                {data.attendees && data.attendees.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">교육 이수자 목록:</h4>
                    <div className="space-y-2">
                      {data.attendees.map((attendee, index) => (
                        <div key={attendee.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{attendee.name}</p>
                            <p className="text-xs text-gray-600">{attendee.trainingType}</p>
                          </div>
                          {attendee.signature && (
                            <div className="flex-shrink-0">
                              <img 
                                src={attendee.signature} 
                                alt={`${attendee.name}의 서명`}
                                className="h-10 w-20 object-contain border border-gray-300 rounded bg-white"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${isTrainingCompleted ? 'bg-green-600' : 'bg-indigo-600'}`}
            style={{ width: `${isTrainingCompleted ? 100 : ((data.currentVideoIndex + (currentVideoCompleted ? 1 : 0)) / selectedVideos.length) * 100}%` }}
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
                  isTrainingCompleted || index < data.currentVideoIndex 
                    ? 'bg-green-100 text-green-800' 
                    : index === data.currentVideoIndex
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {(isTrainingCompleted || index < data.currentVideoIndex) && '✓ '}{video.title}
              </span>
            ))}
          </div>
        </div>

        {/* Current video display - 교육 완료 시 숨김 */}
        {!isTrainingCompleted && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">{currentVideo.title}</h3>
            {isCurrentVideoAlreadyCompleted && (
              <span className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-800 rounded-full">
                ✓ 완료한 교육
              </span>
            )}
          </div>
          
          {/* 이미 완료한 교육 안내 메시지 */}
          {isCurrentVideoAlreadyCompleted && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    이미 완료한 교육입니다
                  </p>
                  <p className="text-xs text-green-700">
                    이전에 이 교육을 완료하셨습니다. 다시 시청하시거나 다음 영상으로 넘어가실 수 있습니다.
                  </p>
                  {data.attendees && data.attendees
                    .filter(a => a.trainingType === currentVideo.title)
                    .map((attendee, idx) => (
                      <div key={idx} className="mt-2 text-xs text-green-800">
                        교육 이수자: <span className="font-semibold">{attendee.name}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
          
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
        )}

        {/* 교육자 성명 및 서명 입력 폼 - 교육 완료 시 숨김, 이미 완료한 교육은 건너뛰기 */}
        {!isTrainingCompleted && showAttendeeForm && currentVideoCompleted && !isCurrentVideoAlreadyCompleted && (
          <div className="p-6 border-2 border-[#0066CC] bg-[#F0F7FF] rounded-lg space-y-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#212529] mb-2">해당 교육 교육자 성명 및 서명</h3>
              <p className="text-sm text-[#6C757D]">
                교육을 수료한 모든 인원의 성명과 서명을 입력해주세요.
              </p>
            </div>

            {tempAttendees.map((attendee, index) => (
              <div key={attendee.id} className="p-4 bg-white border-2 border-[#DEE2E6] rounded-lg space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[#212529]">교육자 {index + 1}</h4>
                  {tempAttendees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee.id)}
                      className="text-[#DC3545] hover:text-[#C82333] text-sm font-medium transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
                
                <Input
                  id={`attendee-name-${attendee.id}`}
                  label="성명"
                  value={attendee.name}
                  onChange={(e) => handleAttendeeNameChange(attendee.id, e.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-[#343A40] mb-2">
                    서명 <span className="text-[#DC3545]">*</span>
                  </label>
                  <SignaturePad
                    onEnd={(signature) => handleAttendeeSignatureChange(attendee.id, signature)}
                    signatureDataUrl={attendee.signature}
                  />
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                onClick={handleAddAttendee}
                className="flex-1"
              >
                + 교육자 추가
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveAttendeesAndNext}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLastVideo ? '교육 완료 및 다음 단계' : '저장 및 다음 영상'}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation buttons - 교육 완료 시 숨김, 교육자 폼이 표시되지 않을 때만 보임 (이미 완료한 교육 포함) */}
        {!isTrainingCompleted && currentVideoCompleted && (!showAttendeeForm || isCurrentVideoAlreadyCompleted) && (
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
      </div>

      {/* 관리자 암호 입력 팝업 - 교육 완료 시 숨김 */}
      {!isTrainingCompleted && showAdminPrompt && (
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