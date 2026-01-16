import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const downloadSinglePhoto = useCallback(
    async (imageUrl: string, fileName: string) => {
      setIsDownloading(true);
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        saveAs(blob, fileName);
      } catch (error) {
        console.error('Download failed:', error);
        throw error;
      } finally {
        setIsDownloading(false);
      }
    },
    []
  );

  const downloadMultiplePhotos = useCallback(
    async (photos: Array<{ imageUrl: string; fileName: string }>, zipName: string) => {
      setIsDownloading(true);
      setProgress(0);

      try {
        const zip = new JSZip();
        const totalPhotos = photos.length;

        for (let i = 0; i < totalPhotos; i++) {
          const { imageUrl, fileName } = photos[i];

          try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
              console.error(`Failed to download ${fileName}`);
              continue;
            }
            
            const blob = await response.blob();
            zip.file(fileName, blob);
          } catch (err) {
            console.error(`Failed to download ${fileName}:`, err);
            continue;
          }

          setProgress(Math.round(((i + 1) / totalPhotos) * 100));
        }

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, zipName);
      } catch (error) {
        console.error('ZIP download failed:', error);
        throw error;
      } finally {
        setIsDownloading(false);
        setProgress(0);
      }
    },
    []
  );

  return {
    downloadSinglePhoto,
    downloadMultiplePhotos,
    isDownloading,
    progress,
  };
}
