import { useCallback, useEffect, useRef, useState } from "react";

type SilenceRecorderOptions = {
  silenceThreshold?: number;     // 0..1
  silenceDurationMs?: number;    // milliseconds
  mimeType?: string;
};

type StopResult = {
  blob: Blob;
  durationMs: number;
};

export function useSilenceRecorder(stream: MediaStream | null, opts?: SilenceRecorderOptions) {
  const silenceThreshold = opts?.silenceThreshold ?? 0.015;
  const silenceDurationMs = opts?.silenceDurationMs ?? 1600;
  const mimeType = opts?.mimeType;

  const [isRecording, setIsRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [lastResult, setLastResult] = useState<StopResult | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const cleanupAnalyser = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    silenceStartRef.current = null;
    setLevel(0);
  }, []);

  const stop = useCallback(async (): Promise<StopResult | null> => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return null;

    const durationMs = Math.max(0, Date.now() - startedAtRef.current);

    return new Promise((resolve) => {
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        chunksRef.current = [];
        cleanupAnalyser();
        setIsRecording(false);
        const res = { blob, durationMs };
        setLastResult(res);
        resolve(res);
      };

      try {
        rec.stop();
      } catch {
        cleanupAnalyser();
        setIsRecording(false);
        resolve(null);
      }
    });
  }, [cleanupAnalyser]);

  const start = useCallback(() => {
    if (!stream) return false;
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) return false;

    const audioOnly = new MediaStream([audioTracks[0]]);
    chunksRef.current = [];
    setLastResult(null);

    const rec = new MediaRecorder(audioOnly, mimeType ? { mimeType } : undefined);
    recorderRef.current = rec;

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    rec.onstart = () => {
      startedAtRef.current = Date.now();
      setIsRecording(true);
    };

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(audioOnly);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(data);

      let sumSq = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / data.length);
      setLevel(rms);

      const now = performance.now();
      if (rms < silenceThreshold) {
        if (silenceStartRef.current == null) silenceStartRef.current = now;
        if (now - silenceStartRef.current >= silenceDurationMs) {
          stop().catch(() => undefined);
          return;
        }
      } else {
        silenceStartRef.current = null;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    rec.start(250);
    return true;
  }, [mimeType, silenceDurationMs, silenceThreshold, stop, stream]);

  useEffect(() => {
    return () => {
      cleanupAnalyser();
      try { recorderRef.current?.stop(); } catch {}
      recorderRef.current = null;
    };
  }, [cleanupAnalyser]);

  return { start, stop, isRecording, level, lastResult };
}
