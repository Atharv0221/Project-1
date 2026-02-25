import { QuestionData, LevelData, ChapterData } from './mathChapters.js';

function makeLevels(topics: Record<string, QuestionData[]>): LevelData[] {
    return ['Diagnostic', 'Beginner', 'Intermediate', 'Advance', 'Challenge'].map(n => ({ name: n, questions: topics[n] }));
}

// ========== CHAPTER 1: Sources of History & British Rule ==========
const ch1: Record<string, QuestionData[]> = {
    Diagnostic: [
        { q: 'What is a primary source of history?', op: ['Newspapers', 'Oral traditions', 'Artefacts', 'All of these'], ans: 4, diff: 'EASY', r: 'Correct!', w: 'History uses multiple sources.' },
        { q: 'Who founded the Indian National Congress?', op: ['A.O. Hume', 'Gandhi', 'Nehru', 'Tilak'], ans: 1, diff: 'EASY', r: 'Good!', w: 'A.O. Hume was the founder.' },
        { q: 'British East India Company came for:', op: ['War', 'Trade', 'Education', 'Religion'], ans: 2, diff: 'EASY', r: 'Accurate!', w: 'They came initially as traders.' },
        { q: 'First war of independence was in:', op: ['1947', '1857', '1920', '1942'], ans: 2, diff: 'EASY', r: 'Perfect!', w: '1857 is famous for the revolt.' },
        { q: 'Father of Indian Constitution:', op: ['Nehru', 'Dr. B.R. Ambedkar', 'Gandhi', 'Patel'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Dr. Ambedkar chaired the drafting committee.' },
        { q: 'Which is a written source?', op: ['Inscriptions', 'Coins', 'Diaries', 'Forts'], ans: 3, diff: 'MEDIUM', r: 'Good!', w: 'Diaries are written records.' },
        { q: 'Battle of Plassey took place in:', op: ['1757', '1764', '1857', '1947'], ans: 1, diff: 'MEDIUM', r: 'Correct!', w: '1757 established British foothold.' },
        { q: 'Sati practice was banned by:', op: ['Lord Curzon', 'Lord William Bentinck', 'Lord Dalhousie', 'Lord Canning'], ans: 2, diff: 'MEDIUM', r: 'Great!', w: 'Bentinck passed the law in 1829.' },
        { q: 'Meaning of "Satyagraha":', op: ['Violence', 'Insistence on Truth', 'Silence', 'Anger'], ans: 2, diff: 'HARD', r: 'Perfect!', w: 'Satya (Truth) + Agraha (Insistence).' },
        { q: 'First railway in India ran between:', op: ['Mumbai and Thane', 'Delhi and Agra', 'Kolkata and Delhi', 'Delhi and Jaipur'], ans: 1, diff: 'HARD', r: 'Correct!', w: '1853, Mumbai-Thane.' },
    ],
    Beginner: [
        { q: 'The term "Renaissance" means:', op: ['War', 'Rebirth', 'Ending', 'Darkness'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Renaissance means rebirth of art/learning.' },
        { q: 'Main occupation in ancient India:', op: ['IT', 'Agriculture', 'Mining', 'Aviation'], ans: 2, diff: 'EASY', r: 'Good!', w: 'Agriculture has always been key.' },
        { q: 'National anthem written by:', op: ['Bankim Chandra', 'Tagore', 'Premchand', 'Sarojini'], ans: 2, diff: 'EASY', r: 'Perfect!', w: 'Rabindranath Tagore.' },
        { q: 'House of the People is:', op: ['Rajya Sabha', 'Lok Sabha', 'Vidha Sabha', 'None'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Lok Sabha is the Lower House.' },
        { q: 'Fundamental duties are:', op: ['Optional', 'Mandatory', 'Moral only', 'None'], ans: 2, diff: 'EASY', r: 'Good!', w: 'Constitution lists duties for every citizen.' },
        { q: 'Who gave the slogan "Swaraj is my birthright"?', op: ['Gandhi', 'Lokmanya Tilak', 'Nehru', 'Subhash Chandra Bose'], ans: 2, diff: 'MEDIUM', r: 'Correct!', w: 'Bal Gangadhar Tilak.' },
        { q: 'Partition of Bengal (1905) by:', op: ['Lord Curzon', 'Lord Mountbatten', 'Lord Dalhousie', 'Lord Cornwallis'], ans: 1, diff: 'MEDIUM', r: 'Great!', w: 'Curzon implemented the partition.' },
        { q: 'The upper house of Parliament:', op: ['Lok Sabha', 'Rajya Sabha', 'Panchayat', 'Municipal'], ans: 2, diff: 'MEDIUM', r: 'Perfect!', w: 'Rajya Sabha is the Council of States.' },
        { q: 'Right to Vote age in India:', op: ['16', '18', '21', '25'], ans: 2, diff: 'HARD', r: 'Accurate!', w: '18 years.' },
        { q: 'Dandi March started from:', op: ['Dandi', 'Sabarmati Ashram', 'Mumbai', 'Delhi'], ans: 2, diff: 'HARD', r: 'Great!', w: 'Sabarmati to Dandi.' },
    ],
    Intermediate: [
        { q: 'Doctrine of Lapse introduced by:', op: ['Canning', 'Dalhousie', 'Curzon', 'Hastings'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Dalhousie annexed states using this.' },
        { q: 'Who was the first President of Independent India?', op: ['Nehru', 'Dr. Rajendra Prasad', 'Radhakrishnan', 'Ambedkar'], ans: 2, diff: 'EASY', r: 'Good!', w: 'Dr. Rajendra Prasad.' },
        { q: 'Which organ makes laws?', op: ['Executive', 'Legislature', 'Judiciary', 'Press'], ans: 2, diff: 'EASY', r: 'Perfect!', w: 'Legislature (Parliament) makes laws.' },
        { q: 'Number of Fundamental Rights:', op: ['4', '5', '6', '10'], ans: 3, diff: 'EASY', r: 'Correct!', w: 'Total 6 Fundamental Rights.' },
        { q: 'Capital of Maharashtra:', op: ['Pune', 'Nagpur', 'Mumbai', 'Nashik'], ans: 3, diff: 'EASY', r: 'Correct!', w: 'Mumbai.' },
        { q: 'Simla Accord happened between:', op: ['India-China', 'India-Pakistan', 'India-Bangladesh', 'India-UK'], ans: 2, diff: 'MEDIUM', r: 'Great!', w: '1972, India and Pakistan.' },
        { q: 'WHO headquarters:', op: ['New York', 'Geneva', 'Paris', 'London'], ans: 2, diff: 'MEDIUM', r: 'Correct!', w: 'Geneva, Switzerland.' },
        { q: 'Who appoints the Governor of a state?', op: ['PM', 'President', 'Chief Minister', 'Chief Justice'], ans: 2, diff: 'MEDIUM', r: 'Perfect!', w: 'President of India.' },
        { q: 'First woman CM in India:', op: ['Sarojini Naidu', 'Sucheta Kripalani', 'Indira Gandhi', 'Jayalalitha'], ans: 2, diff: 'HARD', r: 'Excellent!', w: 'Sucheta Kripalani (UP).' },
        { q: 'Maximum strength of Lok Sabha:', op: ['500', '545', '552', '250'], ans: 3, diff: 'HARD', r: 'Accurate!', w: '552 members.' },
    ],
    Advance: [
        { q: 'Who wrote "Discovery of India"?', op: ['Gandhi', 'Nehru', 'Ambedkar', 'Tilak'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Jawaharlal Nehru wrote it in jail.' },
        { q: 'Simon Commission was boycotted because:', op: ['No Indian members', 'High taxes', 'Religious reasons', 'None'], ans: 1, diff: 'EASY', r: 'Good!', w: 'All members were British.' },
        { q: 'The term of Rajya Sabha members:', op: ['4 years', '5 years', '6 years', 'Permanent'], ans: 3, diff: 'EASY', r: 'Perfect!', w: '6 years, with 1/3 retiring every 2 years.' },
        { q: 'Highest court of India:', op: ['High Court', 'Supreme Court', 'District Court', 'Session Court'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Supreme Court.' },
        { q: 'Meaning of "SECULAR":', op: ['One religion', 'No state religion/equal respect', 'Only majority religion', 'None'], ans: 2, diff: 'EASY', r: 'Good!', w: 'India is a secular country.' },
        { q: 'First round table conference held in:', op: ['Mumbai', 'Delhi', 'London', 'Paris'], ans: 3, diff: 'MEDIUM', r: 'Correct!', w: 'Held in London (1930).' },
        { q: 'The state with maximum Lok Sabha seats:', op: ['Maharashtra', 'Uttar Pradesh', 'West Bengal', 'Bihar'], ans: 2, diff: 'MEDIUM', r: 'Great!', w: 'UP has 80 seats.' },
        { q: 'Who is the guardian of the Constitution?', op: ['President', 'Parliament', 'Supreme Court', 'Prime Minister'], ans: 3, diff: 'MEDIUM', r: 'Perfect!', w: 'Supreme Court has power of Judicial Review.' },
        { q: 'Non-Cooperation Movement suspended after:', op: ['Simon arrival', 'Chauri Chaura incident', 'Jallianwala Bagh', '1947'], ans: 2, diff: 'HARD', r: 'Correct!', w: 'Violence at Chauri Chaura led Gandhi to stop it.' },
        { q: 'Indian Independence Act passed in:', op: ['1942', '1945', '1947', '1950'], ans: 3, diff: 'HARD', r: 'Accurate!', w: 'British Parliament passed it in July 1947.' },
    ],
    Challenge: [
        { q: '"Quit India" resolution passed in:', op: ['Wardha', 'Mumbai', 'Delhi', 'Nagpur'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Passed at Gowalia Tank, Mumbai.' },
        { q: 'First Satyagraha experimental site:', op: ['Kheda', 'Champaran', 'Ahmedabad', 'Bardoli'], ans: 2, diff: 'EASY', r: 'Good!', w: 'Champaran (1917) against Indigo.' },
        { q: 'Who is the ex-officio Chairman of Rajya Sabha?', op: ['President', 'Vice President', 'Speaker', 'PM'], ans: 2, diff: 'EASY', r: 'Perfect!', w: 'Vice President of India.' },
        { q: 'Number of schedules in the Constitution initially:', op: ['8', '10', '12', '15'], ans: 1, diff: 'EASY', r: 'Great!', w: 'Original 8, now 12.' },
        { q: 'The minimum age to be the President of India:', op: ['25', '30', '35', '40'], ans: 3, diff: 'EASY', r: 'Correct!', w: '35 years.' },
        { q: 'Constituent Assembly first met in:', op: ['1942', '1946', '1947', '1950'], ans: 2, diff: 'MEDIUM', r: 'Correct!', w: 'Dec 9, 1946.' },
        { q: 'Which state first adopted Panchayati Raj?', op: ['Maharashtra', 'Rajasthan', 'Gujarat', 'Kerala'], ans: 2, diff: 'MEDIUM', r: 'Good!', w: 'Nagaur, Rajasthan (1959).' },
        { q: 'Zero Hour in Parliament means:', op: ['Lunch break', 'Question hour', 'Time for urgent matters', 'End of day'], ans: 3, diff: 'MEDIUM', r: 'Great!', w: 'Starts after Question Hour.' },
        { q: 'First Governor General of Bengal:', op: ['Warren Hastings', 'Robert Clive', 'Cornwallis', 'Bentinck'], ans: 1, diff: 'HARD', r: 'Outstanding!', w: 'Hastings, 1773 Regulating Act.' },
        { q: 'Financial Emergency Article:', op: ['352', '356', '360', '368'], ans: 3, diff: 'HARD', r: 'Perfect!', w: 'Article 360.' },
    ],
};

export const socialScienceChaptersData: ChapterData[] = [
    { name: 'History, Civics and Geography Overview', order: 1, levels: makeLevels(ch1) },
];
