'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropOverlayProps {
  imageUrl: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export default function CropOverlay({
  imageUrl,
  onCropComplete,
  onCancel,
}: CropOverlayProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleComplete = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  };

  return (
    <div className="space-y-4">
      <ReactCrop
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={undefined}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Crop preview"
          className="max-h-[60vh] w-auto"
        />
      </ReactCrop>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg border border-outline px-4 py-2 text-on-surface hover:bg-surface-variant"
        >
          Abbrechen
        </button>
        <button
          onClick={handleComplete}
          className="rounded-lg bg-primary px-4 py-2 text-on-primary hover:opacity-90"
        >
          Zuschneiden
        </button>
      </div>
    </div>
  );
}
