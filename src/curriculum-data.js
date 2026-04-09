/**
 * Farm Adventure — Full Curriculum Data
 *
 * Organized into sub-levels that kids can pick from a level-select screen.
 * Each exercise has: id, image path, word (what the child speaks),
 * and optional colorQuestion for bonus follow-up.
 *
 * Image paths assume: /images/unit1/{filename}.png
 * Color combo images: /images/unit1/colors/{filename}.png
 */

// ─── Helper ───
const img = (name) => `/images/unit1/${name}.png`;
const colorImg = (name) => `/images/unit1/colors/${name}.png`;

// ════════════════════════════════════════════════════════
// LEVEL 1: Farm Animals
// Core animals from the curriculum
// ════════════════════════════════════════════════════════
export const FARM_ANIMALS = {
  id: 'farm-animals',
  title: 'Farm Animals',
  icon: '🐄',
  description: 'Learn the names of animals on the farm.',
  exercises: [
    { id: 'horse', image: img('Brown Horse'), word: 'horse' },
    { id: 'cow', image: img('Cow'), word: 'cow' },
    { id: 'chicken', image: img('Chicken'), word: 'chicken' },
    { id: 'sheep', image: img('Sheep'), word: 'sheep' },
    { id: 'pig', image: img('Pig'), word: 'pig' },
    { id: 'duck', image: img('Duck'), word: 'duck' },
    { id: 'goat', image: img('Goat'), word: 'goat' },
    { id: 'goose', image: img('Geese'), word: 'goose' },
    { id: 'rabbit', image: img('Rabbits'), word: 'rabbit' },
    { id: 'turkey', image: img('Turkey'), word: 'turkey' },
    { id: 'pony', image: img('Pony'), word: 'pony' },
  ],
};

// ════════════════════════════════════════════════════════
// LEVEL 2: More Animals (pets and wild)
// ════════════════════════════════════════════════════════
export const MORE_ANIMALS = {
  id: 'more-animals',
  title: 'More Animals',
  icon: '🐶',
  description: 'Dogs, cats, and more friends.',
  exercises: [
    { id: 'dog', image: img('Dogs'), word: 'dog' },
    { id: 'cat', image: img('Cat'), word: 'cat' },
    { id: 'mouse', image: img('Grey Mouse'), word: 'mouse' },
    { id: 'turtle', image: img('Turtle'), word: 'turtle' },
  ],
};

// ════════════════════════════════════════════════════════
// LEVEL 3: Farm Things
// Non-animal farm vocabulary
// ════════════════════════════════════════════════════════
export const FARM_THINGS = {
  id: 'farm-things',
  title: 'Farm Things',
  icon: '🚜',
  description: 'Learn about the farm, barn, tractor, and more.',
  exercises: [
    { id: 'farm', image: img('Farm'), word: 'farm' },
    { id: 'farmer', image: img('Farmer'), word: 'farmer' },
    { id: 'barn', image: img('Barn'), word: 'barn' },
    { id: 'tractor', image: img('Tractor'), word: 'tractor' },
    { id: 'wheat', image: img('Wheat'), word: 'wheat' },
    { id: 'bread', image: img('Bread'), word: 'bread' },
    { id: 'bees', image: img('Bees'), word: 'bees' },
    { id: 'honey', image: img('Honey'), word: 'honey' },
    { id: 'milk', image: img('Milk'), word: 'milk' },
    { id: 'egg', image: img('Eggs'), word: 'egg' },
  ],
};

// ════════════════════════════════════════════════════════
// LEVEL 4: Colors
// Single-word color identification
// ════════════════════════════════════════════════════════
export const COLORS = {
  id: 'colors',
  title: 'Colors',
  icon: '🎨',
  description: 'Learn all the colors.',
  exercises: [
    { id: 'red', image: colorImg('red'), word: 'red' },
    { id: 'orange', image: colorImg('orange'), word: 'orange' },
    { id: 'yellow', image: colorImg('yellow'), word: 'yellow' },
    { id: 'green', image: colorImg('green'), word: 'green' },
    { id: 'blue', image: colorImg('blue'), word: 'blue' },
    { id: 'pink', image: colorImg('pink'), word: 'pink' },
    { id: 'black', image: colorImg('black'), word: 'black' },
    { id: 'white', image: colorImg('white'), word: 'white' },
    { id: 'grey', image: colorImg('grey'), word: 'grey' },
    { id: 'brown', image: colorImg('brown'), word: 'brown' },
  ],
};

// ════════════════════════════════════════════════════════
// LEVEL 5: Color + Animal Combos
// Two-word answers: "brown horse", "black cat", etc.
// Only realistic/natural color-animal pairings.
// ════════════════════════════════════════════════════════
export const COLOR_ANIMALS = {
  id: 'color-animals',
  title: 'Color Animals',
  icon: '🐴',
  description: 'What color is the animal? Say both words.',
  exercises: [
    // Brown animals
    { id: 'brown-horse', image: colorImg('brown-horse'), word: 'brown horse' },
    { id: 'brown-cow', image: colorImg('brown-cow'), word: 'brown cow' },
    { id: 'brown-dog', image: colorImg('brown-dog'), word: 'brown dog' },
    { id: 'brown-rabbit', image: colorImg('brown-rabbit'), word: 'brown rabbit' },
    { id: 'brown-goat', image: colorImg('brown-goat'), word: 'brown goat' },
    { id: 'brown-mouse', image: colorImg('brown-mouse'), word: 'brown mouse' },
    // Black animals
    { id: 'black-cat', image: colorImg('black-cat'), word: 'black cat' },
    { id: 'black-dog', image: colorImg('black-dog'), word: 'black dog' },
    { id: 'black-horse', image: colorImg('black-horse'), word: 'black horse' },
    { id: 'black-sheep', image: colorImg('black-sheep'), word: 'black sheep' },
    { id: 'black-cow', image: colorImg('black-cow'), word: 'black cow' },
    // White animals
    { id: 'white-rabbit', image: colorImg('white-rabbit'), word: 'white rabbit' },
    { id: 'white-goose', image: colorImg('white-goose'), word: 'white goose' },
    { id: 'white-sheep', image: colorImg('white-sheep'), word: 'white sheep' },
    { id: 'white-duck', image: colorImg('white-duck'), word: 'white duck' },
    { id: 'white-chicken', image: colorImg('white-chicken'), word: 'white chicken' },
    { id: 'white-cat', image: colorImg('white-cat'), word: 'white cat' },
    { id: 'white-horse', image: colorImg('white-horse'), word: 'white horse' },
    // Grey animals
    { id: 'grey-mouse', image: colorImg('grey-mouse'), word: 'grey mouse' },
    { id: 'grey-cat', image: colorImg('grey-cat'), word: 'grey cat' },
    { id: 'grey-goat', image: colorImg('grey-goat'), word: 'grey goat' },
    { id: 'grey-rabbit', image: colorImg('grey-rabbit'), word: 'grey rabbit' },
    { id: 'grey-goose', image: colorImg('grey-goose'), word: 'grey goose' },
    { id: 'grey-dog', image: colorImg('grey-dog'), word: 'grey dog' },
    // Pink animals
    { id: 'pink-pig', image: colorImg('pink-pig'), word: 'pink pig' },
    // Yellow animals
    { id: 'yellow-duck', image: colorImg('yellow-duck'), word: 'yellow duck' },
    { id: 'yellow-chicken', image: colorImg('yellow-chicken'), word: 'yellow chicken' },
    // Orange animals
    { id: 'orange-cat', image: colorImg('orange-cat'), word: 'orange cat' },
    // Red animals
    { id: 'red-chicken', image: colorImg('red-chicken'), word: 'red chicken' },
  ],
};

// ════════════════════════════════════════════════════════
// LEVEL 6: Color + Things Combos
// Two-word answers with non-animal farm objects.
// ════════════════════════════════════════════════════════
export const COLOR_THINGS = {
  id: 'color-things',
  title: 'Color Things',
  icon: '🌈',
  description: 'Colors and objects together. Say both words.',
  exercises: [
    { id: 'red-strawberry', image: colorImg('red-strawberry'), word: 'red strawberry' },
    { id: 'red-barn', image: colorImg('red-barn'), word: 'red barn' },
    { id: 'red-tractor', image: colorImg('red-tractor'), word: 'red tractor' },
    { id: 'orange-leaves', image: colorImg('orange-leaves'), word: 'orange leaves' },
    { id: 'yellow-sun', image: colorImg('yellow-sun'), word: 'yellow sun' },
    { id: 'green-grass', image: colorImg('green-grass'), word: 'green grass' },
    { id: 'green-tractor', image: colorImg('green-tractor'), word: 'green tractor' },
    { id: 'blue-sky', image: colorImg('blue-sky'), word: 'blue sky' },
    { id: 'blue-tractor', image: colorImg('blue-tractor'), word: 'blue tractor' },
    { id: 'white-egg', image: colorImg('white-egg'), word: 'white egg' },
    { id: 'white-milk', image: colorImg('white-milk'), word: 'white milk' },
    { id: 'brown-bread', image: colorImg('brown-bread'), word: 'brown bread' },
    { id: 'brown-barn', image: colorImg('brown-barn'), word: 'brown barn' },
    { id: 'yellow-honey', image: colorImg('yellow-honey'), word: 'yellow honey' },
    { id: 'green-leaves', image: colorImg('green-leaves'), word: 'green leaves' },
  ],
};

// ════════════════════════════════════════════════════════
// LEVEL 7: Counting
// Numbers 1-10 — child says the number
// ════════════════════════════════════════════════════════
export const COUNTING = {
  id: 'counting',
  title: 'Counting',
  icon: '🔢',
  description: 'Count from one to ten.',
  exercises: [
    { id: 'one', image: img('counting/one'), word: 'one' },
    { id: 'two', image: img('counting/two'), word: 'two' },
    { id: 'three', image: img('counting/three'), word: 'three' },
    { id: 'four', image: img('counting/four'), word: 'four' },
    { id: 'five', image: img('counting/five'), word: 'five' },
    { id: 'six', image: img('counting/six'), word: 'six' },
    { id: 'seven', image: img('counting/seven'), word: 'seven' },
    { id: 'eight', image: img('counting/eight'), word: 'eight' },
    { id: 'nine', image: img('counting/nine'), word: 'nine' },
    { id: 'ten', image: img('counting/ten'), word: 'ten' },
  ],
};

// ════════════════════════════════════════════════════════
// ALL LEVELS — master list for level-select screen
// ════════════════════════════════════════════════════════
export const ALL_LEVELS = [
  FARM_ANIMALS,
  MORE_ANIMALS,
  FARM_THINGS,
  COLORS,
  COLOR_ANIMALS,
  COLOR_THINGS,
  COUNTING,
];

// ════════════════════════════════════════════════════════
// FLAT VOCABULARY — for audio generation
// Every unique word across all levels
// ════════════════════════════════════════════════════════
export function getAllUniqueWords() {
  const words = new Set();
  for (const level of ALL_LEVELS) {
    for (const ex of level.exercises) {
      words.add(ex.word);
    }
  }
  return [...words].sort();
}
