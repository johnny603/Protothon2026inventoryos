import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  /** Value to encode in the QR code (e.g. user ID). */
  value: string;
  /** Canvas size in pixels. Defaults to 180. */
  size?: number;
  /** Alt label for accessibility. */
  label?: string;
}

/**
 * Renders a QR code image for the given value using the `qrcode` library.
 * The QR code encodes the raw value (typically a unique user ID) so that a
 * scanner can read it and look up or import the matching user.
 */
export function QRCodeDisplay({ value, size = 180, label = 'QR code' }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    }).catch(err => {
      console.warn('[QRCodeDisplay] Failed to render QR code:', err);
    });
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={label}
      className="rounded-xl shadow-sm border border-gray-200"
    />
  );
}
