import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScanFeedbackProps {
  type: 'success' | 'error' | 'warning' | null;
  message: string;
  onClose: () => void;
}

export function ScanFeedback({ type, message, onClose }: ScanFeedbackProps) {
  if (!type) return null;

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
    },
  };

  const { icon: Icon, bgColor, textColor } = config[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className={`fixed top-20 left-1/2 -translate-x-1/2 ${bgColor} ${textColor} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 min-w-80`}
      >
        <Icon className="w-6 h-6" />
        <span className="font-medium">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
