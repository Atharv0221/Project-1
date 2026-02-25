import { QuestionData, LevelData, ChapterData } from './mathChapters.js';

function makeLevels(topics: Record<string, QuestionData[]>): LevelData[] {
    return ['Diagnostic', 'Beginner', 'Intermediate', 'Advance', 'Challenge'].map(n => ({ name: n, questions: topics[n] }));
}

// ========== CHAPTER 1: Vocabulary and Synonyms ==========
const ch1: Record<string, QuestionData[]> = {
    Diagnostic: [
        { q: 'Synonym of "Happy" is:', op: ['Sad', 'Joyful', 'Angry', 'Tired'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Happy and Joyful have same meaning.' },
        { q: 'Antonym of "Big" is:', op: ['Large', 'Huge', 'Small', 'Tall'], ans: 3, diff: 'EASY', r: 'Good!', w: 'Small is opposite of Big.' },
        { q: 'Identify the noun: "The cat is sleeping."', op: ['The', 'Cat', 'Is', 'Sleeping'], ans: 2, diff: 'EASY', r: 'Great!', w: 'Cat is a naming word.' },
        { q: 'Correct spelling:', op: ['Receive', 'Recieve', 'Recive', 'Receve'], ans: 1, diff: 'EASY', r: 'Perfect!', w: 'i before e except after c.' },
        { q: 'Meaning of "Brave":', op: ['Fearful', 'Courageous', 'Weak', 'Shy'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Brave means showing courage.' },
        { q: 'Plural of "Child":', op: ['Childs', 'Children', 'Childrens', 'Childes'], ans: 2, diff: 'MEDIUM', r: 'Correct!', w: 'Child -> Children.' },
        { q: 'Identify the verb: "Run fast."', op: ['Run', 'Fast', 'Both', 'None'], ans: 1, diff: 'MEDIUM', r: 'Good!', w: 'Run is an action word.' },
        { q: 'Synonym of "Beautiful":', op: ['Ugly', 'Pretty', 'Plain', 'Dark'], ans: 2, diff: 'MEDIUM', r: 'Correct!', w: 'Pretty is a synonym.' },
        { q: 'Antonym of "Fast":', op: ['Quick', 'Rapid', 'Slow', 'Swift'], ans: 3, diff: 'HARD', r: 'Great!', w: 'Slow is opposite.' },
        { q: 'Identify adjective: "Blue sky."', op: ['Blue', 'Sky', 'The', 'Is'], ans: 1, diff: 'HARD', r: 'Perfect!', w: 'Blue describes the sky.' },
    ],
    Beginner: [
        { q: 'Identify the Subject: "Rohan plays cricket."', op: ['Rohan', 'Plays', 'Cricket', 'None'], ans: 1, diff: 'EASY', r: 'Correct!', w: 'Rohan is doing the action.' },
        { q: 'Gender of "Actress":', op: ['Masculine', 'Feminine', 'Neuter', 'Common'], ans: 2, diff: 'EASY', r: 'Good!', w: 'Actress is feminine.' },
        { q: 'Past tense of "Go":', op: ['Gone', 'Went', 'Goes', 'Going'], ans: 2, diff: 'EASY', r: 'Perfect!', w: 'Go -> Went.' },
        { q: 'A ____ of lions.', op: ['Pack', 'Pride', 'Flock', 'Herd'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'A group of lions is a Pride.' },
        { q: 'Capital of India:', op: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'General knowledge check.' },
        { q: 'Choose the correct article: "___ apple a day."', op: ['A', 'An', 'The', 'None'], ans: 2, diff: 'MEDIUM', r: 'Good!', w: 'An before vowel sounds.' },
        { q: 'Identify the Adverb: "He works hard."', op: ['He', 'Works', 'Hard', 'None'], ans: 3, diff: 'MEDIUM', r: 'Great!', w: 'Hard describes how he works.' },
        { q: 'Plural of "Knife":', op: ['Knifes', 'Knives', 'Knive', 'Knifees'], ans: 2, diff: 'MEDIUM', r: 'Correct!', w: 'f/fe changes to ves.' },
        { q: 'Synonym of "Tiny":', op: ['Huge', 'Small', 'Great', 'Broad'], ans: 2, diff: 'HARD', r: 'Perfect!', w: 'Tiny means very small.' },
        { q: 'Compound word:', op: ['Book', 'Sunlight', 'Table', 'Red'], ans: 2, diff: 'HARD', r: 'Great!', w: 'Sun + Light = Sunlight.' },
    ],
    Intermediate: [
        { q: 'Type of Noun: "Honesty" is a:', op: ['Proper Noun', 'Abstract Noun', 'Common Noun', 'Collective Noun'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Honesty is an idea/quality.' },
        { q: 'Correct Preposition: "The book is ___ the table."', op: ['In', 'At', 'On', 'Under'], ans: 3, diff: 'EASY', r: 'Good!', w: 'On for surfaces.' },
        { q: 'Identify Conjunction: "I like tea and coffee."', op: ['I', 'Like', 'And', 'Coffee'], ans: 3, diff: 'EASY', r: 'Correct!', w: 'And joins two words.' },
        { q: 'Rhyming word for "Light":', op: ['Fight', 'Little', 'Late', 'Like'], ans: 1, diff: 'EASY', r: 'Good!', w: 'Light rhymes with Fight.' },
        { q: 'Meaning of "Abundant":', op: ['Scarce', 'Plentiful', 'Few', 'Small'], ans: 2, diff: 'EASY', r: 'Perfect!', w: 'Abundant means in large quantity.' },
        { q: 'A person who writes books:', op: ['Artist', 'Author', 'Doctor', 'Teacher'], ans: 2, diff: 'MEDIUM', r: 'Correct!', w: 'Author writes books.' },
        { q: 'Opposite of "Arrive":', op: ['Stay', 'Depart', 'Reach', 'Come'], ans: 2, diff: 'MEDIUM', r: 'Good!', w: 'Depart is the opposite.' },
        { q: 'Sentence type: "Where are you going?"', op: ['Declarative', 'Interrogative', 'Exclamatory', 'Imperative'], ans: 2, diff: 'MEDIUM', r: 'Perfect!', w: 'It ends with a question mark.' },
        { q: 'Identify Pronoun: "They are dancing."', op: ['They', 'Are', 'Dancing', 'None'], ans: 1, diff: 'HARD', r: 'Great!', w: 'They replaces a noun.' },
        { q: 'Silent letter in "Knowledge":', op: ['K', 'N', 'W', 'D'], ans: 1, diff: 'HARD', r: 'Correct!', w: 'K is silent.' },
    ],
    Advance: [
        { q: 'Meaning of the idiom: "A piece of cake"', op: ['Delicious food', 'Easy task', 'Hard work', 'Birthday party'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'It means something very easy.' },
        { q: 'Identify the Tense: "She has finished her work."', op: ['Present Continuous', 'Present Perfect', 'Past Simple', 'Future Simple'], ans: 2, diff: 'EASY', r: 'Good!', w: 'Has + past participle = Present Perfect.' },
        { q: 'Which is a SIMILE?', op: ['He is a lion', 'As brave as a lion', 'Lions are animals', 'None'], ans: 2, diff: 'EASY', r: 'Great!', w: 'Similes use "like" or "as".' },
        { q: 'One word for: "One who knows everything"', op: ['Omniscient', 'Omnipotent', 'Polyglot', 'Scholar'], ans: 1, diff: 'EASY', r: 'Correct!', w: 'Omniscient = all-knowing.' },
        { q: 'Correct Punctuation: "I bought pens books and pencils."', op: ['I bought pens, books and pencils.', 'I bought, pens books and pencils.', 'I bought pens books, and pencils.', 'None'], ans: 1, diff: 'EASY', r: 'Good!', w: 'Commas separate items in a list.' },
        { q: 'Synonym of "Difficult":', op: ['Easy', 'Challenging', 'Simple', 'Quick'], ans: 2, diff: 'MEDIUM', r: 'Perfect!', w: 'Challenging is a synonym.' },
        { q: 'Collective Noun for keys:', op: ['Group', 'Bunch', 'Collection', 'Pack'], ans: 2, diff: 'MEDIUM', r: 'Correct!', w: 'A bunch of keys.' },
        { q: 'Identify Prefix: "Impossible"', op: ['Im', 'Possible', 'Sible', 'None'], ans: 1, diff: 'MEDIUM', r: 'Good!', w: 'Im is added at the beginning.' },
        { q: 'Analyze the voice: "The glass was broken by him."', op: ['Active', 'Passive', 'Neither', 'Both'], ans: 2, diff: 'HARD', r: 'Great!', w: 'Subject receives the action.' },
        { q: 'Which is a METAPHOR?', op: ['Life is like a dream', 'Life is a dream', 'She sleeps well', 'None'], ans: 2, diff: 'HARD', r: 'Perfect!', w: 'Metaphor is direct comparison.' },
    ],
    Challenge: [
        { q: 'Identify the Clause: "Because it was raining, we stayed home."', op: ['Dependent Clause', 'Main Clause', 'Neither', 'Both'], ans: 1, diff: 'EASY', r: 'Correct!', w: '"Because it was raining" cannot stand alone.' },
        { q: 'Meaning of "Ambiguous":', op: ['Clear', 'Uncertain/Double meaning', 'Brief', 'Detailed'], ans: 2, diff: 'EASY', r: 'Good!', w: 'Ambiguous means not clear.' },
        { q: 'Which is an Oxymoron?', op: ['Pretty ugly', 'Very fast', 'Slowly running', 'Blue sky'], ans: 1, diff: 'EASY', r: 'Great!', w: 'Contradictory words together.' },
        { q: 'Correct usage of "Effect":', op: ['The medicine will effect you.', 'The medicine had a side effect.', 'Neither', 'Both'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Effect is usually a noun.' },
        { q: 'Anagram of "Silent":', op: ['Listen', 'Slight', 'Silver', 'None'], ans: 1, diff: 'EASY', r: 'Perfect!', w: 'SILENT -> LISTEN.' },
        { q: 'Identify the Phrasal Verb: "The plan fell through."', op: ['Fell through', 'Plan fell', 'Fell', 'None'], ans: 1, diff: 'MEDIUM', r: 'Good!', w: 'Fell through means to fail.' },
        { q: 'Active form of "Letters are written by me":', op: ['I write letters.', 'I wrote letters.', 'I am writing letters.', 'None'], ans: 1, diff: 'MEDIUM', r: 'Correct!', w: 'Present simple active.' },
        { q: 'Meaning of the foreign word: "Bon voyage"', op: ['Good morning', 'Good journey', 'Good bye', 'Good food'], ans: 2, diff: 'MEDIUM', r: 'Great!', w: 'It means Have a good trip.' },
        { q: 'Analyze the Mood: "If I were a king..."', op: ['Indicative', 'Subjunctive', 'Imperative', 'None'], ans: 2, diff: 'HARD', r: 'Outstanding!', w: 'Subjunctive expresses imaginary states.' },
        { q: 'Identify Transitive Verb: "He kicks the ball."', op: ['Kicks', 'Ball', 'He', 'The'], ans: 1, diff: 'HARD', r: 'Perfect!', w: 'Transitive verb has an object (ball).' },
    ],
};

export const englishChaptersData: ChapterData[] = [
    { name: 'Vocabulary and Grammar Basics', order: 1, levels: makeLevels(ch1) },
];
