import { useState, useRef, useEffect } from 'react';
import { Camera, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function BarcodeScanner({ onScan, placeholder = 'Scan or type barcode...', autoFocus = true }: BarcodeScannerProps) {
  const [input, setInput] = useState('');
  const [scanMode, setScanMode] = useState<'camera' | 'keyboard'>('keyboard');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onScan(input.trim());
      setInput('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setScanMode('keyboard')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium ${
            scanMode === 'keyboard'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Keyboard className="w-5 h-5" />
          Type Code
        </button>
        <button
          type="button"
          onClick={() => setScanMode('camera')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium ${
            scanMode === 'camera'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          Scan Camera
        </button>
      </div>

      {scanMode === 'keyboard' ? (
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 text-lg transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">
            ↵ Enter
          </div>
        </form>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-gray-900 font-medium mb-1">Camera scanning mode</p>
          <p className="text-sm text-gray-500 mb-6">Position barcode in camera view</p>
          <div className="max-w-md mx-auto p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Demo mode:</strong> Use keyboard input for testing barcodes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
