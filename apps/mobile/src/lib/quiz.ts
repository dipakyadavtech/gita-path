export type Question = { q: string; options: string[]; answer: number; why: string };

// Chapter quizzes (FR-LP-03). Questions are written from the verses in the content seed.
export const QUIZZES: Record<number, Question[]> = {
  2: [
    { q: 'According to verse 2.47, where does your right lie?', options: ['In the fruits of action', 'In action alone', 'In giving up action', "In other people's praise"], answer: 1, why: 'Krishna says your right is to the action itself, never to its results.' },
    { q: 'What does verse 2.48 call "yoga"?', options: ['Physical exercise', 'Evenness of mind in success and failure', 'Leaving the world', 'Following every ritual'], answer: 1, why: '"Samatvam yoga ucyate": evenness of mind is called yoga.' },
    { q: 'In verse 2.50, yoga is described as…', options: ['Skill in action', 'Freedom from work', 'Long meditation', 'Perfect memory'], answer: 0, why: '"Yogah karmasu kausalam": yoga is skill in action.' },
    { q: 'According to 2.62, anger is born from…', options: ['Hunger', 'Desire', 'Sleep', 'Knowledge'], answer: 1, why: 'Dwelling on objects breeds attachment, attachment breeds desire, and desire turns into anger.' },
    { q: 'What does 2.14 advise about pleasure and pain?', options: ['Chase pleasure', 'Avoid all feeling', 'Bear them patiently; they come and go', 'Blame others for pain'], answer: 2, why: 'They are temporary, so endure them patiently ("titikshasva").' },
  ],
};
