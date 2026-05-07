import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 96,
        fontWeight: 900,
        letterSpacing: '-0.08em',
        color: '#dc2626',
      }}
    >
      TG
    </div>,
    { ...size },
  );
}
