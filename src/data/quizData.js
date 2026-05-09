/* ═══════════════════════════════════════════════════
   Quiz Data — 40+ MCQs for page replacement algorithms
   ═══════════════════════════════════════════════════ */

export const QUIZ_DATA = {

  FIFO: [
    {
      id: 'fifo-1',
      algorithm: 'FIFO',
      question: 'Which page is replaced first in FIFO?',
      options: ['Most recently used', 'Least recently used', 'Oldest loaded page', 'Random page'],
      correctAnswer: 'Oldest loaded page',
      explanation: 'FIFO always replaces the page that entered memory first — the "oldest" page in the queue.',
      difficulty: 'Easy'
    },
    {
      id: 'fifo-2',
      algorithm: 'FIFO',
      question: 'Which anomaly is associated with FIFO page replacement?',
      options: ["Belady's Anomaly", 'Thrashing', 'Starvation', 'Deadlock'],
      correctAnswer: "Belady's Anomaly",
      explanation: "Belady's Anomaly is unique to FIFO — increasing the number of frames can sometimes increase page faults.",
      difficulty: 'Easy'
    },
    {
      id: 'fifo-3',
      algorithm: 'FIFO',
      question: 'What data structure best represents FIFO page replacement?',
      options: ['Stack', 'Queue', 'Priority Queue', 'Hash Map'],
      correctAnswer: 'Queue',
      explanation: 'FIFO operates exactly like a queue — first in, first out.',
      difficulty: 'Easy'
    },
    {
      id: 'fifo-4',
      algorithm: 'FIFO',
      question: 'Given reference string: 1, 2, 3, 4, 1, 2 with 3 frames starting empty. How many page faults occur?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '6',
      explanation: 'Each page is new and causes a fault: 1(F), 2(F), 3(F), 4(F→evicts 1), 1(F→evicts 2), 2(F→evicts 3). Total = 6.',
      difficulty: 'Medium'
    },
    {
      id: 'fifo-5',
      algorithm: 'FIFO',
      question: "In Belady's Anomaly, what happens when you increase the number of frames?",
      options: ['Faults always decrease', 'Faults always increase', 'Faults may increase', 'No effect on faults'],
      correctAnswer: 'Faults may increase',
      explanation: "Belady's Anomaly shows that more frames CAN lead to more faults with FIFO, though it doesn't always happen.",
      difficulty: 'Medium'
    },
    {
      id: 'fifo-6',
      algorithm: 'FIFO',
      question: 'FIFO does NOT consider which factor when replacing pages?',
      options: ['Arrival order', 'Queue position', 'Recent usage', 'Loading sequence'],
      correctAnswer: 'Recent usage',
      explanation: 'FIFO only cares about the order pages arrived, completely ignoring how recently a page was accessed.',
      difficulty: 'Easy'
    },
    {
      id: 'fifo-7',
      algorithm: 'FIFO',
      question: 'With FIFO and reference string: 7, 0, 1, 2, 0, 3, 0, 4 (3 frames), what is the last page evicted?',
      options: ['Page 7', 'Page 0', 'Page 2', 'Page 3'],
      correctAnswer: 'Page 3',
      explanation: 'Trace: [7,0,1]→2 evicts 7→[0,1,2]→0 HIT→3 evicts 0→[1,2,3]→0 evicts 1→[2,3,0]→4 evicts 2, but 3 was evicted when 0 was loaded after the hit.',
      difficulty: 'Hard'
    },
    {
      id: 'fifo-8',
      algorithm: 'FIFO',
      question: 'What is the best-case scenario for FIFO page replacements?',
      options: [
        'When every page is accessed only once',
        'When pages are accessed in the same order repeatedly',
        'When the reference string has high locality',
        'When frames equal the number of unique pages'
      ],
      correctAnswer: 'When frames equal the number of unique pages',
      explanation: 'If frames ≥ unique pages, every page fits in memory and there are no evictions after initial loading.',
      difficulty: 'Medium'
    },
    {
      id: 'fifo-9',
      algorithm: 'FIFO',
      question: 'FIFO page replacement is sometimes called:',
      options: ['Clock Algorithm', 'Second Chance', 'Least Recently Used', 'None of these — it is simply FIFO'],
      correctAnswer: 'None of these — it is simply FIFO',
      explanation: 'FIFO is its own distinct algorithm. Clock/Second Chance are enhancements built upon FIFO.',
      difficulty: 'Easy'
    },
    {
      id: 'fifo-10',
      algorithm: 'FIFO',
      question: 'Why is FIFO generally considered worse than LRU?',
      options: [
        'FIFO is harder to implement',
        'FIFO ignores recent usage patterns',
        'FIFO requires more memory',
        'FIFO is slower'
      ],
      correctAnswer: 'FIFO ignores recent usage patterns',
      explanation: 'FIFO evicts the oldest page regardless of whether it is still being used frequently, unlike LRU which keeps recently-used pages.',
      difficulty: 'Medium'
    },
  ],

  LRU: [
    {
      id: 'lru-1',
      algorithm: 'LRU',
      question: 'What does LRU stand for?',
      options: ['Last Recently Updated', 'Least Recently Used', 'Longest Running Usage', 'Latest Resource Utilization'],
      correctAnswer: 'Least Recently Used',
      explanation: 'LRU = Least Recently Used — it evicts the page that has not been accessed for the longest time.',
      difficulty: 'Easy'
    },
    {
      id: 'lru-2',
      algorithm: 'LRU',
      question: 'Which principle does LRU exploit?',
      options: ['FIFO ordering', 'Temporal locality', 'Spatial locality', 'Random access'],
      correctAnswer: 'Temporal locality',
      explanation: 'LRU exploits temporal locality — pages accessed recently are likely to be accessed again soon.',
      difficulty: 'Easy'
    },
    {
      id: 'lru-3',
      algorithm: 'LRU',
      question: 'Does LRU suffer from Belady\'s Anomaly?',
      options: ['Yes, always', 'Yes, sometimes', 'No, never', 'Only with 3+ frames'],
      correctAnswer: 'No, never',
      explanation: 'LRU is a stack algorithm, which means it is immune to Belady\'s Anomaly.',
      difficulty: 'Medium'
    },
    {
      id: 'lru-4',
      algorithm: 'LRU',
      question: 'Which data structure is commonly used to implement LRU efficiently?',
      options: ['Simple Queue', 'Hash Map + Doubly Linked List', 'Binary Tree', 'Circular Buffer'],
      correctAnswer: 'Hash Map + Doubly Linked List',
      explanation: 'A hash map provides O(1) lookup while a doubly linked list allows O(1) reordering when a page is accessed.',
      difficulty: 'Hard'
    },
    {
      id: 'lru-5',
      algorithm: 'LRU',
      question: 'Given reference string: 1, 2, 3, 2, 1, 4 with 3 frames, how many faults with LRU?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      explanation: '1(F)[1], 2(F)[1,2], 3(F)[1,2,3], 2(H)[1,3,2], 1(H)[3,2,1], 4(F→evicts 3)[2,1,4]. Total = 4 faults.',
      difficulty: 'Medium'
    },
    {
      id: 'lru-6',
      algorithm: 'LRU',
      question: 'In LRU, when does a page move to the "most recently used" position?',
      options: ['Only when first loaded', 'Every time it is accessed', 'Never, position is fixed', 'Only on eviction'],
      correctAnswer: 'Every time it is accessed',
      explanation: 'Every access (both hit and initial load) moves a page to the most-recently-used position in LRU.',
      difficulty: 'Easy'
    },
    {
      id: 'lru-7',
      algorithm: 'LRU',
      question: 'What is the main disadvantage of LRU?',
      options: [
        'It suffers from Belady\'s Anomaly',
        'It is expensive to implement perfectly in hardware',
        'It ignores access frequency',
        'It cannot handle more than 4 frames'
      ],
      correctAnswer: 'It is expensive to implement perfectly in hardware',
      explanation: 'Pure LRU requires tracking the access order of every page on every memory reference, which is costly in hardware.',
      difficulty: 'Medium'
    },
    {
      id: 'lru-8',
      algorithm: 'LRU',
      question: 'LRU approximation algorithms include:',
      options: ['Optimal', 'Second Chance / Clock', 'FIFO', 'Random'],
      correctAnswer: 'Second Chance / Clock',
      explanation: 'The Second Chance (Clock) algorithm is a practical approximation of LRU using reference bits.',
      difficulty: 'Hard'
    },
    {
      id: 'lru-9',
      algorithm: 'LRU',
      question: 'If all pages in memory were accessed at the same time, which page does LRU evict?',
      options: ['The first one loaded', 'The last one loaded', 'Any page (tie-breaking rule applies)', 'None, it waits'],
      correctAnswer: 'Any page (tie-breaking rule applies)',
      explanation: 'When all pages have equal recency, a tie-breaking rule (typically FIFO or arbitrary) is used.',
      difficulty: 'Hard'
    },
    {
      id: 'lru-10',
      algorithm: 'LRU',
      question: 'LRU is considered a _____ algorithm.',
      options: ['Greedy', 'Stack-based', 'Probabilistic', 'Preemptive'],
      correctAnswer: 'Stack-based',
      explanation: 'LRU is a stack algorithm — the set of pages in N frames is always a subset of pages in N+1 frames.',
      difficulty: 'Medium'
    },
  ],

  OPT: [
    {
      id: 'opt-1',
      algorithm: 'OPT',
      question: 'What does the Optimal algorithm use to make replacement decisions?',
      options: ['Past access history', 'Random selection', 'Future reference knowledge', 'Page size'],
      correctAnswer: 'Future reference knowledge',
      explanation: 'OPT looks ahead in the reference string to find which page will not be used for the longest time.',
      difficulty: 'Easy'
    },
    {
      id: 'opt-2',
      algorithm: 'OPT',
      question: 'Why is the Optimal algorithm impractical in real systems?',
      options: [
        'It is too slow',
        'It requires knowledge of future page references',
        'It uses too much memory',
        'It only works with 2 frames'
      ],
      correctAnswer: 'It requires knowledge of future page references',
      explanation: 'OPT needs to know the complete future reference string, which is impossible to know at runtime.',
      difficulty: 'Easy'
    },
    {
      id: 'opt-3',
      algorithm: 'OPT',
      question: 'The Optimal algorithm is primarily used as:',
      options: ['A production replacement algorithm', 'A benchmark for comparing other algorithms', 'A caching strategy', 'A scheduling algorithm'],
      correctAnswer: 'A benchmark for comparing other algorithms',
      explanation: 'OPT provides the theoretical minimum faults, making it the gold standard to compare how well other algorithms perform.',
      difficulty: 'Easy'
    },
    {
      id: 'opt-4',
      algorithm: 'OPT',
      question: 'Given reference string: 1, 2, 3, 4, 1, 2 with 3 frames, how many faults does OPT produce?',
      options: ['4', '5', '6', '3'],
      correctAnswer: '5',
      explanation: '1(F), 2(F), 3(F), 4(F→evicts 3, since 3 is not used again), 1(H), 2(H). Total = 4 faults.',
      difficulty: 'Hard'
    },
    {
      id: 'opt-5',
      algorithm: 'OPT',
      question: 'Does the Optimal algorithm suffer from Belady\'s Anomaly?',
      options: ['Yes', 'No', 'Only with small frames', 'Only with large reference strings'],
      correctAnswer: 'No',
      explanation: 'OPT is a stack algorithm and is therefore immune to Belady\'s Anomaly.',
      difficulty: 'Medium'
    },
    {
      id: 'opt-6',
      algorithm: 'OPT',
      question: 'When OPT chooses a page to evict, it evicts the page that:',
      options: [
        'Was loaded first',
        'Was used least recently',
        'Will not be used for the longest time in the future',
        'Has the smallest page number'
      ],
      correctAnswer: 'Will not be used for the longest time in the future',
      explanation: 'OPT evicts the page whose next use is farthest in the future (or never used again).',
      difficulty: 'Easy'
    },
    {
      id: 'opt-7',
      algorithm: 'OPT',
      question: 'If a page in memory is never referenced again, OPT will:',
      options: ['Keep it forever', 'Evict it immediately', 'Prioritize it for eviction', 'Move it to secondary storage'],
      correctAnswer: 'Prioritize it for eviction',
      explanation: 'A page never referenced again has infinite "distance" to next use, making it the ideal candidate for eviction.',
      difficulty: 'Medium'
    },
    {
      id: 'opt-8',
      algorithm: 'OPT',
      question: 'The Optimal algorithm is also known as:',
      options: ['MIN', 'MAX', 'BEST', 'IDEAL'],
      correctAnswer: 'MIN',
      explanation: 'OPT is also called MIN because it produces the minimum number of page faults possible.',
      difficulty: 'Medium'
    },
    {
      id: 'opt-9',
      algorithm: 'OPT',
      question: 'Which statement about OPT is FALSE?',
      options: [
        'It gives the minimum number of page faults',
        'It can be implemented in practice easily',
        'It requires future knowledge',
        'It is used as a theoretical benchmark'
      ],
      correctAnswer: 'It can be implemented in practice easily',
      explanation: 'OPT CANNOT be easily implemented in practice because future page references are unknown.',
      difficulty: 'Easy'
    },
    {
      id: 'opt-10',
      algorithm: 'OPT',
      question: 'If two pages have the same "next use distance" in OPT, what typically happens?',
      options: [
        'Both are evicted',
        'A tie-breaking rule (e.g., FIFO order) is applied',
        'The algorithm fails',
        'Neither is evicted'
      ],
      correctAnswer: 'A tie-breaking rule (e.g., FIFO order) is applied',
      explanation: 'When distances are equal, implementations use a secondary criterion like load order to break the tie.',
      difficulty: 'Hard'
    },
  ],

  SecondChance: [
    {
      id: 'sc-1',
      algorithm: 'SecondChance',
      question: 'The Second Chance algorithm is an enhancement of which algorithm?',
      options: ['LRU', 'Optimal', 'FIFO', 'Random'],
      correctAnswer: 'FIFO',
      explanation: 'Second Chance modifies FIFO by giving pages a "second chance" using a reference bit before evicting them.',
      difficulty: 'Easy'
    },
    {
      id: 'sc-2',
      algorithm: 'SecondChance',
      question: 'What does the reference bit indicate in Second Chance?',
      options: [
        'The page size',
        'Whether the page was recently accessed',
        'The page number',
        'Whether the page is dirty'
      ],
      correctAnswer: 'Whether the page was recently accessed',
      explanation: 'The reference bit is set to 1 when a page is accessed. The algorithm checks this bit before evicting.',
      difficulty: 'Easy'
    },
    {
      id: 'sc-3',
      algorithm: 'SecondChance',
      question: 'What happens when the clock pointer finds a page with reference bit = 1?',
      options: [
        'The page is immediately evicted',
        'The reference bit is reset to 0 and the pointer moves on',
        'The page is moved to disk',
        'The algorithm terminates'
      ],
      correctAnswer: 'The reference bit is reset to 0 and the pointer moves on',
      explanation: 'A reference bit of 1 means the page was used recently. The bit is cleared (given a "second chance") and the pointer advances.',
      difficulty: 'Easy'
    },
    {
      id: 'sc-4',
      algorithm: 'SecondChance',
      question: 'What happens when the clock pointer finds a page with reference bit = 0?',
      options: [
        'The bit is set to 1',
        'The page is given another chance',
        'The page is evicted and replaced',
        'The pointer skips it'
      ],
      correctAnswer: 'The page is evicted and replaced',
      explanation: 'Reference bit 0 means the page was not accessed since its last chance — it is evicted.',
      difficulty: 'Easy'
    },
    {
      id: 'sc-5',
      algorithm: 'SecondChance',
      question: 'The Clock algorithm uses which data structure internally?',
      options: ['Stack', 'Linear Queue', 'Circular Queue (Buffer)', 'Binary Heap'],
      correctAnswer: 'Circular Queue (Buffer)',
      explanation: 'The Clock algorithm arranges frames in a circular buffer with a pointer that rotates like a clock hand.',
      difficulty: 'Medium'
    },
    {
      id: 'sc-6',
      algorithm: 'SecondChance',
      question: 'If all pages have reference bit = 1, what does the Clock algorithm do?',
      options: [
        'Evicts the first page',
        'Resets all bits to 0 during a full rotation, then evicts the next page it reaches',
        'Stops and waits',
        'Randomly picks a page'
      ],
      correctAnswer: 'Resets all bits to 0 during a full rotation, then evicts the next page it reaches',
      explanation: 'The pointer makes a full rotation resetting all bits, then the first page it encounters again (now with bit 0) is evicted.',
      difficulty: 'Medium'
    },
    {
      id: 'sc-7',
      algorithm: 'SecondChance',
      question: 'In the worst case, the Second Chance algorithm degenerates into:',
      options: ['LRU', 'Pure FIFO', 'Optimal', 'Random'],
      correctAnswer: 'Pure FIFO',
      explanation: 'If all reference bits are 0, Second Chance behaves exactly like FIFO since no page gets a second chance.',
      difficulty: 'Medium'
    },
    {
      id: 'sc-8',
      algorithm: 'SecondChance',
      question: 'Why is the Clock algorithm considered practical for real operating systems?',
      options: [
        'It uses future knowledge',
        'It has low overhead with hardware reference bit support',
        'It is the same as LRU',
        'It never causes page faults'
      ],
      correctAnswer: 'It has low overhead with hardware reference bit support',
      explanation: 'Hardware automatically sets reference bits on page access, so the OS only needs to check and clear them periodically.',
      difficulty: 'Hard'
    },
    {
      id: 'sc-9',
      algorithm: 'SecondChance',
      question: 'The Second Chance algorithm approximates which ideal algorithm?',
      options: ['FIFO', 'LRU', 'Optimal', 'MRU'],
      correctAnswer: 'LRU',
      explanation: 'Second Chance approximates LRU behavior — pages that were recently used (bit=1) are kept, similar to LRU\'s recency principle.',
      difficulty: 'Medium'
    },
    {
      id: 'sc-10',
      algorithm: 'SecondChance',
      question: 'What is the key advantage of Second Chance over pure FIFO?',
      options: [
        'It is faster',
        'It avoids evicting frequently-used pages',
        'It uses less memory',
        'It prevents all page faults'
      ],
      correctAnswer: 'It avoids evicting frequently-used pages',
      explanation: 'By checking the reference bit, Second Chance avoids evicting pages that are still being used — the main weakness of FIFO.',
      difficulty: 'Easy'
    },
  ],
};

/** Get shuffled questions for a specific algorithm */
export function getQuizQuestions(algorithm, count = 10) {
  const pool = QUIZ_DATA[algorithm] || [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Get all algorithms available */
export const ALGO_LIST = [
  {
    key: 'FIFO',
    name: 'FIFO',
    fullName: 'First In, First Out',
    description: 'Replaces the oldest page in memory — simple queue-based eviction.',
    difficulty: 'Easy',
    efficiency: 2,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    key: 'LRU',
    name: 'LRU',
    fullName: 'Least Recently Used',
    description: 'Evicts the page not accessed for the longest time — exploits temporal locality.',
    difficulty: 'Medium',
    efficiency: 4,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.3)',
  },
  {
    key: 'OPT',
    name: 'Optimal',
    fullName: 'Optimal (MIN)',
    description: 'Replaces the page used farthest in the future — theoretical best, impossible in practice.',
    difficulty: 'Hard',
    efficiency: 5,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.3)',
  },
  {
    key: 'SecondChance',
    name: 'Second Chance',
    fullName: 'Clock / Second Chance',
    description: 'Enhanced FIFO with reference bits — gives pages a second chance before eviction.',
    difficulty: 'Medium',
    efficiency: 3,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
  },
];
