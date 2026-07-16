import type { Memory } from '../types'

/** Local preview deck when VITE_MEMORIES_ENDPOINT is not configured yet. */
export const DEMO_MEMORIES: Memory[] = [
  {
    id: 'demo-1',
    message:
      'Thank you for making every Monday easier. The way you showed up for all of us — quietly, consistently — is something I will carry with me.',
    author: 'Sarah',
  },
  {
    id: 'demo-2',
    message:
      'Remember that afternoon we spent debugging for three hours and then realized it was a missing semicolon? Still one of my favorite work memories.',
    author: 'Alex',
  },
  {
    id: 'demo-3',
    message:
      'You always knew when someone needed a coffee and a kind word. The team will not be the same without you — in the best way, because you taught us how to look after each other.',
  },
  {
    id: 'demo-4',
    message:
      'For the late nights, the shared laughs, and the patience you had with every question I asked. I hope the next chapter is as warm as the one you wrote here.',
    author: 'Jordan',
  },
]
