import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload, X } from 'lucide-react';

interface FaceCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export default function FaceCameraModal({ isOpen, onClose, onCapture }: FaceCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    startStream(facingMode);

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startStream = async (mode: 'user' | 'environment') => {
    stopStream();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device/browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 720 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Webcam stream error:', err);
      setCameraError(err.message || 'Camera permission denied or camera not found. You can upload a photo instead.');
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    setIsCapturing(true);

    const canvas = document.createElement('canvas');
    // Crop to square from center of video
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    // Mirror if front-facing user camera
    if (facingMode === 'user') {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    setTimeout(() => {
      setIsCapturing(false);
      onCapture(dataUrl);
      onClose();
    }, 120);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result);
        onClose();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="face-camera-backdrop" onClick={onClose}>
      <div className="face-camera-modal" onClick={e => e.stopPropagation()}>
        <div className="face-camera-header">
          <h3>Snap Your Face for 3D Model</h3>
          <button className="face-camera-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="face-camera-viewport">
          {cameraError ? (
            <div className="face-camera-fallback">
              <Camera size={38} />
              <p>{cameraError}</p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} /> Upload a Face Photo
              </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                playsInline 
                muted 
                className={facingMode === 'user' ? 'mirrored' : ''} 
              />
              {/* Oval Face Guide Overlay */}
              <div className="face-oval-guide">
                <div className="face-oval-ring" />
                <span className="face-oval-hint">Align your face inside the oval</span>
              </div>
              {isCapturing && <div className="face-camera-flash" />}
            </>
          )}
        </div>

        <div className="face-camera-actions">
          {!cameraError && (
            <button 
              type="button" 
              className="face-camera-toggle-btn"
              onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')}
              title="Flip camera"
            >
              <RefreshCw size={16} /> Flip
            </button>
          )}

          {!cameraError && (
            <button 
              type="button" 
              className="face-camera-snap-btn"
              onClick={takeSnapshot}
            >
              <span className="snap-inner" />
            </button>
          )}

          <button 
            type="button" 
            className="face-camera-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} /> Choose Photo
          </button>

          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={handleFileUpload} 
          />
        </div>
      </div>
    </div>
  );
}
