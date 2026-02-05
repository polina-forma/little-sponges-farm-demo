import { motion } from 'framer-motion';

/**
 * EncouragementBadge - Celebratory animations when child answers correctly
 *
 * Types:
 * - star: Gold star burst
 * - confetti: Confetti explosion
 * - heart: Heart shower
 */
function EncouragementBadge({ type = 'star' }) {
  const badges = {
    star: {
      emoji: '⭐',
      text: '¡Muy bien!',
      color: 'from-yellow-400 to-orange-400',
      particles: ['⭐', '✨', '🌟']
    },
    confetti: {
      emoji: '🎉',
      text: '¡Excelente!',
      color: 'from-pink-400 to-purple-400',
      particles: ['🎊', '🎉', '✨', '🎈']
    },
    heart: {
      emoji: '❤️',
      text: '¡Fantástico!',
      color: 'from-red-400 to-pink-400',
      particles: ['❤️', '💕', '💖', '💗']
    }
  };

  const badge = badges[type] || badges.star;

  // Generate random particles
  const particles = [...Array(12)].map((_, i) => ({
    emoji: badge.particles[i % badge.particles.length],
    x: Math.random() * 200 - 100,
    y: Math.random() * -150 - 50,
    rotate: Math.random() * 360,
    delay: Math.random() * 0.3,
    duration: 0.8 + Math.random() * 0.4
  }));

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Particle explosion */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: [0, 1.5, 1],
            opacity: [1, 1, 0],
            rotate: particle.rotate
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeOut'
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      {/* Central badge */}
      <motion.div
        className={`
          relative px-8 py-4 rounded-2xl
          bg-gradient-to-r ${badge.color}
          shadow-2xl
        `}
        initial={{ scale: 0, rotate: -10 }}
        animate={{
          scale: [0, 1.2, 1],
          rotate: [−10, 5, 0]
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Glow effect */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${badge.color} blur-xl`}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-3">
          <motion.span
            className="text-5xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 15, -15, 0]
            }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            {badge.emoji}
          </motion.span>
          <span className="text-white text-2xl font-bold drop-shadow-lg">
            {badge.text}
          </span>
          <motion.span
            className="text-5xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -15, 15, 0]
            }}
            transition={{ duration: 0.6, repeat: 2, delay: 0.1 }}
          >
            {badge.emoji}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EncouragementBadge;
