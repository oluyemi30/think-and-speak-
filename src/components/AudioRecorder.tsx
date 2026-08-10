import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { audioService } from '../services/audioService';

interface AudioRecorderProps {
  isSpeaking: boolean;
  onAudioRecorded: (url: string | null) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ isSpeaking, onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const [micLevels, setMicLevels] = useState<number[]>([10, 20, 15, 30, 25, 10, 5]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Auto-start recording when speaking starts if user enables mic
  const handleToggleMic = async () => {
    if (isRecording) {
      const url = await audioService.stopRecording();
      setIsRecording(false);
      onAudioRecorded(url);
      stopAnalyser();
    } else {
      const success = await audioService.startRecording();
      if (success) {
        setIsRecording(true);
        setMicAvailable(true);
        startAnalyser();
      } else {
        setMicAvailable(false);
      }
    }
  };

  // Start audio level visualizer
  const startAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualizer = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = Array.from(dataArray.slice(0, 10)).map((val) => Math.max(10, Math.min(100, val / 2)));
        setMicLevels(bars);
        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      updateVisualizer();
    } catch (e) {
      console.warn('Could not start analyser', e);
    }
  };

  const stopAnalyser = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
  };

  useEffect(() => {
    // Automatically stop recording when speaking stops
    if (!isSpeaking && isRecording) {
      audioService.stopRecording().then((url) => {
        setIsRecording(false);
        onAudioRecorded(url);
        stopAnalyser();
      });
    }
  }, [isSpeaking, isRecording]);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleToggleMic}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
          isRecording
            ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        {isRecording ? (
          <>
            <Mic className="w-3.5 h-3.5 text-red-400" />
            <span>Recording Voice...</span>
          </>
        ) : (
          <>
            <MicOff className="w-3.5 h-3.5 text-zinc-400" />
            <span>Enable Mic Recording</span>
          </>
        )}
      </button>

      {/* Audio Level Waveform visualizer */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-6">
          {micLevels.map((lvl, idx) => (
            <div
              key={idx}
              className="w-1 bg-red-400 rounded-full transition-all duration-75"
              style={{ height: `${lvl}%` }}
            />
          ))}
        </div>
      )}

      {micAvailable === false && (
        <span className="text-[10px] text-zinc-500">
          Microphone access denied or unsupported.
        </span>
      )}
    </div>
  );
};
