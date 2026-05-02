import { ScanLine } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  show?: boolean;
}

export function FloatingActionButton({ onClick, show = true }: FloatingActionButtonProps) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center z-50 group"
      aria-label="Quick Scan"
    >
      <ScanLine className="w-7 h-7 group-hover:scale-110 transition-transform" />
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
    </button>
  );
}
