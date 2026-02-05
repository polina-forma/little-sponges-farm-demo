import { motion } from 'framer-motion';

/**
 * FarmScene - Displays the interactive farm scene with animals
 *
 * In production, replace with:
 * - Actual Little Sponges farm imagery
 * - Clickable hotspots on animals
 * - Dynamic image swapping per lesson
 */
function FarmScene() {
  // Farm animals with positions (percentages for responsive layout)
  const animals = [
    { id: 'cow', emoji: '🐄', name: 'la vaca', x: 15, y: 60, size: 'text-6xl' },
    { id: 'pig', emoji: '🐷', name: 'el cerdo', x: 35, y: 70, size: 'text-5xl' },
    { id: 'chicken', emoji: '🐔', name: 'el pollo', x: 55, y: 75, size: 'text-4xl' },
    { id: 'horse', emoji: '🐴', name: 'el caballo', x: 75, y: 55, size: 'text-6xl' },
    { id: 'sheep', emoji: '🐑', name: 'la oveja', x: 25, y: 80, size: 'text-4xl' },
    { id: 'duck', emoji: '🦆', name: 'el pato', x: 65, y: 85, size: 'text-4xl' },
    { id: 'cat', emoji: '🐱', name: 'el gato', x: 85, y: 75, size: 'text-4xl' },
    { id: 'dog', emoji: '🐕', name: 'el perro', x: 10, y: 85, size: 'text-5xl' },
  ];

  // Background elements
  const scenery = [
    { emoji: '🌳', x: 5, y: 30, size: 'text-5xl' },
    { emoji: '🌳', x: 90, y: 25, size: 'text-6xl' },
    { emoji: '🏠', x: 50, y: 20, size: 'text-7xl' }, // Barn
    { emoji: '☀️', x: 85, y: 5, size: 'text-5xl' },
    { emoji: '🌻', x: 20, y: 45, size: 'text-3xl' },
    { emoji: '🌻', x: 80, y: 40, size: 'text-3xl' },
    { emoji: '🌾', x: 40, y: 50, size: 'text-3xl' },
    { emoji: '🌾', x: 60, y: 48, size: 'text-3xl' },
  ];

  return (
    <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 rounded-2xl overflow-hidden shadow-xl border-4 border-green-600">
      {/* Sky with clouds */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute text-6xl"
          style={{ left: '20%', top: '10%' }}
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ☁️
        </motion.div>
        <motion.div
          className="absolute text-5xl"
          style={{ left: '60%', top: '5%' }}
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          ☁️
        </motion.div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-green-500 to-green-400" />

      {/* Fence */}
      <div className="absolute bottom-[45%] left-0 right-0 flex justify-around">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="text-2xl">🪵</div>
        ))}
      </div>

      {/* Scenery elements */}
      {scenery.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.size}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Animals - interactive */}
      {animals.map((animal) => (
        <motion.button
          key={animal.id}
          className={`absolute ${animal.size} cursor-pointer hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded-full`}
          style={{
            left: `${animal.x}%`,
            top: `${animal.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2
          }}
          onClick={() => {
            // In production: trigger tutor to ask about this animal
            console.log(`Clicked: ${animal.name}`);
          }}
          aria-label={`${animal.name} - ${animal.emoji}`}
        >
          {animal.emoji}
        </motion.button>
      ))}

      {/* Instruction overlay for new users */}
      <div className="absolute bottom-2 left-2 bg-white/80 rounded-lg px-3 py-1 text-sm text-green-800">
        👆 Click an animal to learn its name!
      </div>
    </div>
  );
}

export default FarmScene;
