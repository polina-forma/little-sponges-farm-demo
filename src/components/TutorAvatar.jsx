import { motion } from 'framer-motion';

/**
 * TutorAvatar - Animated character representing the AI tutor
 *
 * In production, replace with:
 * - Mishka or Frog character from Little Sponges brand
 * - More sophisticated animations (Lottie, Rive, etc.)
 *
 * States:
 * - idle: Gentle bounce
 * - speaking: Mouth animation
 * - listening: Ear/alert animation
 * - thinking: Contemplative
 */
function TutorAvatar({ isSpeaking, isListening, isThinking }) {
  // Determine current state
  const getState = () => {
    if (isThinking) return 'thinking';
    if (isListening) return 'listening';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  const state = getState();

  return (
    <motion.div
      className="relative"
      animate={{
        y: state === 'idle' ? [0, -5, 0] : 0,
      }}
      transition={{
        duration: 2,
        repeat: state === 'idle' ? Infinity : 0,
        ease: 'easeInOut'
      }}
    >
      {/* Avatar container */}
      <div className="relative w-20 h-20 bg-white rounded-full shadow-lg border-4 border-green-500 flex items-center justify-center overflow-hidden">

        {/* Main face - using emoji for POC */}
        <motion.div
          className="text-5xl"
          animate={{
            scale: state === 'speaking' ? [1, 1.1, 1] : 1,
            rotate: state === 'listening' ? [0, -5, 5, 0] : 0,
          }}
          transition={{
            duration: state === 'speaking' ? 0.3 : 0.5,
            repeat: (state === 'speaking' || state === 'listening') ? Infinity : 0,
          }}
        >
          {state === 'thinking' ? '🤔' :
           state === 'listening' ? '👂' :
           state === 'speaking' ? '🗣️' : '😊'}
        </motion.div>

        {/* Speaking indicator - sound waves */}
        {state === 'speaking' && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full"
                style={{ right: -4 - i * 6 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}

        {/* Listening indicator - ear highlights */}
        {state === 'listening' && (
          <>
            <motion.div
              className="absolute -left-1 top-2 w-3 h-3 bg-yellow-400 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute -right-1 top-2 w-3 h-3 bg-yellow-400 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
            />
          </>
        )}

        {/* Thinking indicator - dots */}
        {state === 'thinking' && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-yellow-500 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* State label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-green-700 bg-white/80 px-2 py-0.5 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={state}
      >
        {state === 'thinking' ? 'Thinking...' :
         state === 'listening' ? 'Listening!' :
         state === 'speaking' ? 'Speaking...' : 'Ready!'}
      </motion.div>
    </motion.div>
  );
}

export default TutorAvatar;
