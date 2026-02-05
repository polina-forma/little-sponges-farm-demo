import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

/**
 * VoiceButton - Main interaction button for voice recording
 *
 * States:
 * - idle: Ready to record (green microphone)
 * - recording: Currently recording (red, pulsing)
 * - loading: Processing audio (spinner)
 * - speaking: Tutor is talking (speaker icon)
 */
function VoiceButton({ isRecording, isLoading, isSpeaking, onClick }) {
  // Determine current state
  const getState = () => {
    if (isLoading) return 'loading';
    if (isRecording) return 'recording';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const state = getState();

  // State-based styling
  const stateStyles = {
    idle: {
      bg: 'bg-green-500 hover:bg-green-600',
      ring: 'ring-green-300',
      icon: <Mic className="w-12 h-12" />,
      label: 'Talk to me!'
    },
    recording: {
      bg: 'bg-red-500',
      ring: 'ring-red-300',
      icon: <MicOff className="w-12 h-12" />,
      label: 'Tap to stop'
    },
    loading: {
      bg: 'bg-yellow-500',
      ring: 'ring-yellow-300',
      icon: <Loader2 className="w-12 h-12 animate-spin" />,
      label: 'Thinking...'
    },
    speaking: {
      bg: 'bg-blue-500 hover:bg-blue-600',
      ring: 'ring-blue-300',
      icon: <Volume2 className="w-12 h-12" />,
      label: 'Tap to stop'
    }
  };

  const currentStyle = stateStyles[state];

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={onClick}
        disabled={isLoading}
        className={`
          relative w-24 h-24 rounded-full
          ${currentStyle.bg}
          text-white shadow-lg
          flex items-center justify-center
          focus:outline-none focus:ring-4 ${currentStyle.ring}
          disabled:opacity-70 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        whileHover={!isLoading ? { scale: 1.05 } : {}}
        whileTap={!isLoading ? { scale: 0.95 } : {}}
      >
        {/* Pulsing ring for recording state */}
        {state === 'recording' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2
              }}
            />
          </>
        )}

        {/* Sound wave animation for speaking state */}
        {state === 'speaking' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-full rounded-full border-2 border-blue-300"
                animate={{
                  scale: [1, 1.2 + i * 0.15],
                  opacity: [0.6, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        )}

        {/* Icon */}
        <span className="relative z-10">
          {currentStyle.icon}
        </span>
      </motion.button>

      {/* Label */}
      <motion.span
        className="text-lg font-medium text-green-800"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        key={state} // Re-animate on state change
      >
        {currentStyle.label}
      </motion.span>

      {/* Recording indicator */}
      {state === 'recording' && (
        <motion.div
          className="flex items-center gap-2 text-red-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-3 h-3 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <span className="text-sm font-medium">Recording...</span>
        </motion.div>
      )}
    </div>
  );
}

export default VoiceButton;
