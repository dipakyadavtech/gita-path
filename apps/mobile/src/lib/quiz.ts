export type Question = { q: string; options: string[]; answer: number; why: string };

// Chapter quizzes (FR-LP-03). Questions are written from the verses in the content seed.
export const QUIZZES: Record<number, Question[]> = {
  1: [
    { q: 'Who asks the opening question of the Gita in verse 1.1?', options: ['Arjuna', 'Krishna', 'Dhritarashtra', 'Bhishma'], answer: 2, why: 'The blind king Dhritarashtra asks Sanjaya what happened on the field of Kurukshetra.' },
    { q: 'In 1.21, what does Arjuna ask Krishna to do?', options: ['Blow his conch', 'Place the chariot between the two armies', 'Leave the battlefield', 'Call for peace talks'], answer: 1, why: 'He wants to see clearly the people he will have to fight.' },
    { q: 'What does Arjuna see when the chariot stops (1.26)?', options: ['Strangers', 'Only soldiers', 'Teachers, relatives and friends', 'An empty field'], answer: 2, why: 'He sees fathers, grandfathers, teachers, uncles, brothers, sons and friends on both sides.' },
    { q: 'Which signs of anxiety does Arjuna describe in 1.29?', options: ['Hunger and sleepiness', 'Trembling, a dry mouth and hair standing on end', 'Anger and shouting', 'Laughter'], answer: 1, why: 'His limbs give way, his mouth dries, his body trembles and his hair stands on end.' },
    { q: 'How does Chapter 1 end (1.47)?', options: ['Arjuna charges into battle', 'Arjuna sits down, bow cast aside, overwhelmed by grief', 'Krishna leaves', 'The armies make peace'], answer: 1, why: 'Arjuna sinks into the chariot seat, putting down his bow and arrows.' },
  ],
  3: [
    { q: 'According to 3.5, can anyone stay without action even for a moment?', options: ['Yes, by meditating', 'Yes, by sleeping', 'No, nature makes everyone act', 'Only kings can'], answer: 2, why: 'Everyone is driven to act by the qualities born of nature.' },
    { q: 'What does 3.8 say about action and inaction?', options: ['Inaction is better', 'Action is better than inaction', 'Both are equally bad', 'Only rituals count'], answer: 1, why: '"Karma jyayo hy akarmanah": action is better than inaction.' },
    { q: 'In 3.21, what do people follow?', options: ['Whatever the great do', 'Only written laws', 'Their own moods', 'The richest person'], answer: 0, why: 'Whatever a great person does, others follow; the standard they set, the world follows.' },
    { q: 'Verse 3.35 says it is better to…', options: ["do another's duty perfectly", 'do your own duty, even imperfectly', 'avoid all duty', 'copy successful people'], answer: 1, why: "Your own duty done imperfectly is better than another's done well." },
    { q: 'What does Krishna name as the enemy in 3.37?', options: ['Other people', 'Desire and anger', 'Bad luck', 'Hard work'], answer: 1, why: 'Desire, which turns into anger when blocked, is the enemy to overcome.' },
  ],
  2: [
    { q: 'According to verse 2.47, where does your right lie?', options: ['In the fruits of action', 'In action alone', 'In giving up action', "In other people's praise"], answer: 1, why: 'Krishna says your right is to the action itself, never to its results.' },
    { q: 'What does verse 2.48 call "yoga"?', options: ['Physical exercise', 'Evenness of mind in success and failure', 'Leaving the world', 'Following every ritual'], answer: 1, why: '"Samatvam yoga ucyate": evenness of mind is called yoga.' },
    { q: 'In verse 2.50, yoga is described as…', options: ['Skill in action', 'Freedom from work', 'Long meditation', 'Perfect memory'], answer: 0, why: '"Yogah karmasu kausalam": yoga is skill in action.' },
    { q: 'According to 2.62, anger is born from…', options: ['Hunger', 'Desire', 'Sleep', 'Knowledge'], answer: 1, why: 'Dwelling on objects breeds attachment, attachment breeds desire, and desire turns into anger.' },
    { q: 'What does 2.14 advise about pleasure and pain?', options: ['Chase pleasure', 'Avoid all feeling', 'Bear them patiently; they come and go', 'Blame others for pain'], answer: 2, why: 'They are temporary, so endure them patiently ("titikshasva").' },
  ],
};
