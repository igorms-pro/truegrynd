export async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function sharePngBlob(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data: ShareData) => boolean;
  };
  if (!nav.share) return;

  const data: ShareData = { files: [file], title: 'Truegrynd' };
  const canShareFiles = typeof nav.canShare === 'function' ? nav.canShare(data) : false;
  await nav.share(canShareFiles ? data : { title: 'Truegrynd' });
}
