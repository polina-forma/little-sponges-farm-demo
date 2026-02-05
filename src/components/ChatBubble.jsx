import { motion } from 'framer-motion';

/**
 * ChatBubble - Displays conversation messages
 *
 * Props:
 * - message: { role: 'tutor' | 'child', content: string, timestamp: Date }
 * - isLatest: boolean - triggers entrance animation
 */
function ChatBubble({ message, isLatest }) {
  const isTutor = message.role === 'tutor';

  return (
    <motion.div
      className={`flex ${isTutor ? 'justify-start' : 'justify-end'}`}
      initial={isLatest ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 shadow-md
          ${isTutor
            ? 'bg-green-100 text-green-900 rounded-tl-none'
            : 'bg-blue-100 text-blue-900 rounded-tr-none'
          }
        `}
      >
        {/* Role indicator */}
        <div className={`text-xs font-medium mb-1 ${isTutor ? 'text-green-600' : 'text-blue-600'}`}>
          {isTutor ? '🎓 Tutor' : '👧 You'}
        </div>

        {/* Message content */}
        <p className="text-base leading-relaxed">
          {message.content}
        </p>

        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isTutor ? 'text-green-500' : 'text-blue-500'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </motion.div>
  );
}

// Helper to format timestamp
function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default ChatBubble;
