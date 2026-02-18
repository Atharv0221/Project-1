import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with DETAILED usage...');

    // 1. Clear existing Data (Optional, but good for clean state if needed, or just upsert)
    // For now, we'll upsert.

    // --- MATHEMATICS ---
    const mathSubject = await prisma.subject.upsert({
        where: { name_standard: { name: 'Mathematics', standard: '8' } },
        update: {},
        create: { name: 'Mathematics', standard: '8' }
    });

    console.log('Processing Mathematics...');

    const mathChapter = await prisma.chapter.upsert({
        where: { subjectId_name: { subjectId: mathSubject.id, name: 'Rational and Irrational Numbers' } },
        update: {},
        create: { name: 'Rational and Irrational Numbers', subjectId: mathSubject.id, order: 1 }
    });

    const mathLevels = [
        {
            name: 'Diagnostic',
            questions: [
                // Easy (5)
                { q: 'Which of the following is a natural number?', op: ['−2', '0', '5', '1/2'], ans: 3, diff: 'EASY', r: 'Correct and quick! Good accuracy and strong basic speed.', w: 'Revise natural numbers (1,2,3…). Accuracy low, slow down and read carefully.' },
                { q: 'Which is an integer?', op: ['3/4', '−5', '2.5', '√2'], ans: 2, diff: 'EASY', r: 'Excellent accuracy and fast recognition of integers.', w: 'Integers include negative numbers too. Improve accuracy and focus.' },
                { q: 'Rational number form is:', op: ['m/n where n≠0', 'Only whole number', 'Only decimal', 'Only fraction'], ans: 1, diff: 'EASY', r: 'Perfect! Fast and accurate concept clarity.', w: 'Rational numbers are m/n form. Improve conceptual accuracy.' },
                { q: 'Which is rational?', op: ['√2', 'π', '3/5', '√3'], ans: 3, diff: 'EASY', r: 'Good speed and correct identification.', w: 'Rational numbers are fractions. Accuracy needs improvement.' },
                { q: 'How many rational numbers between 1 and 2?', op: ['1', '2', '10', 'Infinite'], ans: 4, diff: 'EASY', r: 'Excellent! Strong accuracy and fast thinking.', w: 'There are infinite rational numbers. Improve concept clarity.' },
                // Medium (3)
                { q: '7/3 on number line equals:', op: ['1⅓', '2⅓', '3⅓', '4⅓'], ans: 2, diff: 'MEDIUM', r: 'Great speed and fraction understanding.', w: 'Divide properly. Accuracy needs work.' },
                { q: 'Which is smaller?', op: ['−2', '1', '0', '3'], ans: 1, diff: 'MEDIUM', r: 'Good speed and sign understanding.', w: 'Negative numbers are smallest. Improve accuracy.' },
                { q: '−2/3 lies:', op: ['Right of 0', 'Left of 0', 'At 0', 'At 1'], ans: 2, diff: 'MEDIUM', r: 'Accurate and quick understanding.', w: 'Negative numbers lie left. Focus on number line.' },
                // Hard (2)
                { q: 'Compare 5/4 and 2/3', op: ['5/4 > 2/3', '5/4 < 2/3', 'Equal', 'None'], ans: 1, diff: 'HARD', r: 'Excellent calculation speed and accuracy.', w: 'Use LCM method. Work on accuracy.' },
                { q: 'Decimal of 7/4 is:', op: ['1.25', '1.75', '2.75', '0.75'], ans: 2, diff: 'HARD', r: 'Fast and accurate conversion.', w: 'Divide carefully. Accuracy low.' },
            ]
        },
        {
            name: 'Beginner',
            questions: [
                // Easy (5)
                { q: 'Whole numbers include:', op: ['−1', '0', '1/2', 'π'], ans: 2, diff: 'EASY', r: 'Good accuracy and fast recall.', w: 'Whole numbers start from 0. Revise basics.' },
                { q: 'Which is NOT rational?', op: ['4', '−3', '√5', '1/2'], ans: 3, diff: 'EASY', r: 'Strong concept and quick response.', w: '√5 is irrational. Improve accuracy.' },
                { q: '0 is:', op: ['Natural only', 'Whole number', 'Irrational', 'Fraction'], ans: 2, diff: 'EASY', r: 'Accurate and quick.', w: '0 belongs to whole numbers.' },
                { q: '−5/2 is:', op: ['Rational', 'Irrational', 'Natural', 'Whole'], ans: 1, diff: 'EASY', r: 'Excellent speed and concept clarity.', w: 'Fractions are rational numbers.' },
                { q: '3/5 in decimal:', op: ['0.6', '0.5', '0.3', '1.5'], ans: 1, diff: 'EASY', r: 'Fast and accurate.', w: 'Divide properly.' },
                // Medium (3)
                { q: 'Larger number:', op: ['−3', '−7', '−10', '−1'], ans: 4, diff: 'MEDIUM', r: 'Good number sense.', w: 'Closer to zero is greater.' },
                { q: '3/5 and 6/10 are:', op: ['Equal', 'Greater', 'Smaller', 'None'], ans: 1, diff: 'MEDIUM', r: 'Accurate and quick.', w: 'Multiply to compare.' },
                { q: 'Decimal of −5/3:', op: ['−1.66…', '−2.5', '−0.5', '1.66'], ans: 1, diff: 'MEDIUM', r: 'Good speed.', w: 'Divide carefully.' },
                // Hard (2)
                { q: 'Which is greatest?', op: ['−1/2', '0', '1/3', '−1'], ans: 3, diff: 'HARD', r: 'Strong accuracy.', w: 'Compare on number line.' },
                { q: 'Terminating decimal example:', op: ['1/3', '1/6', '1/4', '2/7'], ans: 3, diff: 'HARD', r: 'Excellent understanding.', w: 'Terminating ends finite.' },
            ]
        },
        {
            name: 'Intermediate',
            questions: [
                // Easy (5)
                { q: 'Which of the following is a rational number?', op: ['√3', '√5', '3/7', 'π'], ans: 3, diff: 'EASY', r: 'Great accuracy and quick recognition of rational numbers. Good speed.', w: 'Rational numbers are of form m/n. Improve accuracy and read carefully.' },
                { q: 'Which is a whole number?', op: ['−3', '1/2', '0', '−1'], ans: 3, diff: 'EASY', r: 'Excellent speed and accuracy. Strong basics.', w: 'Whole numbers start from 0. Revise classification carefully.' },
                { q: 'Which is an integer?', op: ['2/3', '−5', '1.2', '√2'], ans: 2, diff: 'EASY', r: 'Good accuracy and fast identification.', w: 'Integers include negative numbers. Improve attention.' },
                { q: 'Which number is positive?', op: ['−4/5', '−2', '3/2', '−7'], ans: 3, diff: 'EASY', r: 'Accurate and quick. Strong understanding.', w: 'Positive numbers are greater than zero. Slow down and check sign.' },
                { q: 'Which is smaller?', op: ['5', '−3', '2', '1'], ans: 2, diff: 'EASY', r: 'Excellent speed and correct comparison.', w: 'Negative numbers are always smaller. Improve accuracy.' },
                // Medium (3)
                { q: 'Compare 5/4 and 2/3', op: ['5/4 > 2/3', '5/4 < 2/3', 'Equal', 'Cannot compare'], ans: 1, diff: 'MEDIUM', r: 'Very good calculation speed and accuracy.', w: 'Use cross multiplication. Improve precision.' },
                { q: 'Which is greater?', op: ['−7/3', '−5/2', 'Both equal', 'Cannot compare'], ans: 2, diff: 'MEDIUM', r: 'Excellent accuracy comparing negatives.', w: '−5/2 is closer to zero, so greater. Revise carefully.' },
                { q: '3/5 and 6/10 are:', op: ['Equal', 'Greater', 'Smaller', 'Not related'], ans: 1, diff: 'MEDIUM', r: 'Good simplification speed and accuracy.', w: 'Convert to same denominator. Improve accuracy.' },
                // Hard (2)
                { q: 'Which is non-terminating recurring decimal?', op: ['1/2', '3/4', '5/6', '1/5'], ans: 3, diff: 'HARD', r: 'Excellent concept clarity and speed.', w: '5/6 = 0.8333… recurring. Revise decimals.' },
                { q: 'How many rational numbers between 1 and 2?', op: ['1', '2', 'Infinite', 'None'], ans: 3, diff: 'HARD', r: 'Strong conceptual understanding and fast response.', w: 'There are infinite rational numbers. Revise theory.' },
            ]
        },
        {
            name: 'Advance',
            questions: [
                // Easy (5)
                { q: 'Which of the following is an irrational number?', op: ['3/4', '√2', '−5', '0'], ans: 2, diff: 'EASY', r: 'Excellent accuracy and fast identification of irrational numbers. Strong speed.', w: '√2 is irrational. Revise irrational numbers and slow down for better accuracy.' },
                { q: 'π is:', op: ['Rational', 'Irrational', 'Integer', 'Whole'], ans: 2, diff: 'EASY', r: 'Very quick and accurate response. Good conceptual clarity.', w: 'π is irrational. Improve accuracy and revise definitions.' },
                { q: 'Which is a terminating decimal?', op: ['1/3', '2/7', '3/8', '5/9'], ans: 3, diff: 'EASY', r: 'Good speed and correct identification.', w: '3/8 = 0.375 (terminating). Focus more carefully.' },
                { q: '−√5 is:', op: ['Rational', 'Irrational', 'Integer', 'Whole'], ans: 2, diff: 'EASY', r: 'Excellent accuracy and quick thinking.', w: 'Square root of non-perfect square is irrational. Revise concept.' },
                { q: 'Which is rational?', op: ['√3', 'π', '0.75', '√7'], ans: 3, diff: 'EASY', r: 'Good speed and accuracy.', w: 'Decimal 0.75 is rational. Improve attention.' },
                // Medium (3)
                { q: 'Compare −17/20 and −13/20', op: ['−17/20 > −13/20', '−17/20 < −13/20', 'Equal', 'Cannot compare'], ans: 2, diff: 'MEDIUM', r: 'Strong accuracy comparing negative fractions.', w: 'More negative is smaller. Work on accuracy.' },
                { q: '12/15 and 3/5 are:', op: ['Equal', 'Greater', 'Smaller', 'None'], ans: 1, diff: 'MEDIUM', r: 'Excellent simplification speed and accuracy.', w: 'Simplify fractions carefully.' },
                { q: 'Which is non-terminating recurring?', op: ['1/2', '1/4', '2/3', '3/8'], ans: 3, diff: 'MEDIUM', r: 'Good concept clarity and speed.', w: '2/3 = 0.666… recurring. Improve accuracy.' },
                // Hard (2)
                { q: 'Which is irrational?', op: ['3 + √2', '4/5', '7', '0.25'], ans: 1, diff: 'HARD', r: 'Excellent higher-level thinking and fast response.', w: 'Sum with √2 becomes irrational. Revise carefully.' },
                { q: 'Which statement is true?', op: ['All rational numbers are integers', 'All integers are rational', 'All rational are whole', 'None'], ans: 2, diff: 'HARD', r: 'Very accurate and quick conceptual understanding.', w: 'Integers can be written as fraction → rational. Improve clarity.' },
            ]
        },
        {
            name: 'Challenge',
            questions: [
                // Easy (5)
                { q: 'Real numbers include:', op: ['Only rational', 'Only irrational', 'Both rational and irrational', 'Only integers'], ans: 3, diff: 'EASY', r: 'Excellent accuracy and strong speed.', w: 'Real numbers include both types. Revise basics.' },
                { q: 'Which lies left of zero?', op: ['3', '−2', '1/2', '√4'], ans: 2, diff: 'EASY', r: 'Good speed and correct understanding.', w: 'Negative numbers lie left. Improve accuracy.' },
                { q: '3.14 is:', op: ['Irrational', 'Rational', 'Integer', 'Natural'], ans: 2, diff: 'EASY', r: 'Accurate and quick.', w: 'Finite decimal is rational. Revise.' },
                { q: 'Infinite irrational numbers exist?', op: ['Yes', 'No', 'Only 10', 'Only 1'], ans: 1, diff: 'EASY', r: 'Strong conceptual clarity and speed.', w: 'There are infinite irrational numbers.' },
                { q: '−2 on number line is:', op: ['Right of 0', 'Left of 0', 'At 0', 'At 2'], ans: 2, diff: 'EASY', r: 'Fast and accurate.', w: 'Negative always left. Improve focus.' },
                // Medium (3)
                { q: 'Which is greater?', op: ['−7/11', '−3/4', 'Both equal', 'Cannot say'], ans: 1, diff: 'MEDIUM', r: 'Excellent accuracy comparing negatives.', w: 'Less negative is greater. Revise carefully.' },
                { q: 'Decimal of 9/14 is:', op: ['0.5', '0.64…', '0.75', '1.5'], ans: 2, diff: 'MEDIUM', r: 'Good calculation speed and accuracy.', w: 'Divide properly. Improve precision.' },
                { q: 'Which is terminating decimal?', op: ['1/6', '1/7', '1/8', '2/9'], ans: 3, diff: 'MEDIUM', r: 'Strong accuracy and quick recognition.', w: '1/8 terminates. Revise concept.' },
                // Hard (2)
                { q: 'Rational number between 1 and 2:', op: ['Only 1', 'Only 2', 'Infinite', 'None'], ans: 3, diff: 'HARD', r: 'Excellent advanced concept clarity.', w: 'Infinite rational numbers exist. Revise.' },
                { q: '√2 is irrational because:', op: ['Cannot be written as m/n', 'It is integer', 'It is whole', 'It is negative'], ans: 1, diff: 'HARD', r: 'Very high accuracy and conceptual mastery.', w: 'Irrational cannot be written as fraction. Improve concept.' },
            ]
        }
    ];

    // --- SCIENCE ---
    const scienceSubject = await prisma.subject.upsert({
        where: { name_standard: { name: 'Science', standard: '8' } },
        update: {},
        create: { name: 'Science', standard: '8' }
    });

    console.log('Processing Science...');

    const scienceChapter = await prisma.chapter.upsert({
        where: { subjectId_name: { subjectId: scienceSubject.id, name: 'Living World and Classification of Microbes' } },
        update: {},
        create: { name: 'Living World and Classification of Microbes', subjectId: scienceSubject.id, order: 1 }
    });

    const scienceLevels = [
        {
            name: 'Diagnostic',
            questions: [
                { q: 'Biological classification means:', op: ['Naming only', 'Grouping organisms', 'Eating food', 'Movement'], ans: 2, diff: 'EASY', r: 'Excellent speed and accuracy in basic concept.', w: 'Classification means grouping. Improve accuracy and read carefully.' },
                { q: 'Total kingdoms in five-kingdom system:', op: ['2', '3', '5', '7'], ans: 3, diff: 'EASY', r: 'Good speed and correct recall.', w: 'Revise five kingdom system for better accuracy.' },
                { q: 'Monera organisms are:', op: ['Multicellular', 'Prokaryotic', 'Only plants', 'Only animals'], ans: 2, diff: 'EASY', r: 'Accurate and quick response.', w: 'Monera are prokaryotic. Revise basics.' },
                { q: 'Amoeba belongs to:', op: ['Monera', 'Protista', 'Fungi', 'Animalia'], ans: 2, diff: 'EASY', r: 'Fast and correct identification.', w: 'Amoeba is Protista. Improve attention.' },
                { q: 'Fungi obtain food by:', op: ['Photosynthesis', 'Absorption', 'Hunting', 'Chewing'], ans: 2, diff: 'EASY', r: 'Good speed and accuracy.', w: 'Fungi absorb nutrients. Revise nutrition modes.' },
                // Medium
                { q: 'Bacteria reproduce by:', op: ['Budding', 'Binary fission', 'Seeds', 'Spores only'], ans: 2, diff: 'MEDIUM', r: 'Strong accuracy and speed.', w: 'Bacteria divide by binary fission. Revise reproduction.' },
                { q: 'Protista are mostly:', op: ['Multicellular', 'Unicellular', 'Only plants', 'Only fungi'], ans: 2, diff: 'MEDIUM', r: 'Accurate and quick.', w: 'Protista are unicellular. Improve concept clarity.' },
                { q: 'Viruses are visible using:', op: ['Simple microscope', 'Compound microscope', 'Electron microscope', 'Naked eye'], ans: 3, diff: 'MEDIUM', r: 'Excellent accuracy and speed.', w: 'Viruses need electron microscope. Revise size concept.' },
                // Hard
                { q: 'Producers in ecosystem:', op: ['Animals', 'Plants', 'Fungi', 'Viruses'], ans: 2, diff: 'HARD', r: 'High accuracy and quick thinking.', w: 'Plants are producers. Improve understanding.' },
                { q: 'Smallest microbes are:', op: ['Bacteria', 'Fungi', 'Virus', 'Algae'], ans: 3, diff: 'HARD', r: 'Excellent advanced accuracy.', w: 'Viruses are smallest. Revise carefully.' },
            ]
        },
        {
            name: 'Beginner',
            questions: [
                { q: 'Study of microbes is called:', op: ['Botany', 'Zoology', 'Microbiology', 'Physics'], ans: 3, diff: 'EASY', r: 'Good speed and accuracy.', w: 'Microbiology studies microbes.' },
                { q: 'Which is unicellular?', op: ['Mushroom', 'Amoeba', 'Human', 'Tree'], ans: 2, diff: 'EASY', r: 'Accurate and quick.', w: 'Amoeba is unicellular. Revise.' },
                { q: 'Algae are mostly:', op: ['Aquatic', 'Desert', 'Air', 'Soil only'], ans: 1, diff: 'EASY', r: 'Good accuracy.', w: 'Algae mostly live in water.' },
                { q: 'Cell wall in fungi made of:', op: ['Cellulose', 'Chitin', 'Protein', 'Fat'], ans: 2, diff: 'EASY', r: 'Excellent recall speed.', w: 'Fungi wall contains chitin.' },
                { q: 'Euglena is:', op: ['Bacteria', 'Protist', 'Virus', 'Animal'], ans: 2, diff: 'EASY', r: 'Strong accuracy.', w: 'Euglena belongs to Protista.' },
                // Medium
                { q: 'Saprotrophs feed on:', op: ['Fresh plants', 'Dead matter', 'Water', 'Air'], ans: 2, diff: 'MEDIUM', r: 'Accurate and quick.', w: 'Saprotrophs feed on dead matter.' },
                { q: 'Which is prokaryotic?', op: ['Amoeba', 'Bacteria', 'Fungi', 'Algae'], ans: 2, diff: 'MEDIUM', r: 'Excellent accuracy.', w: 'Bacteria are prokaryotes.' },
                { q: 'Photosynthesis occurs in:', op: ['Fungi', 'Animals', 'Algae', 'Virus'], ans: 3, diff: 'MEDIUM', r: 'Good speed and concept clarity.', w: 'Algae perform photosynthesis.' },
                // Hard
                { q: 'Virus contains:', op: ['Only protein', 'DNA/RNA + protein', 'Only nucleus', 'Cytoplasm'], ans: 2, diff: 'HARD', r: 'Strong advanced accuracy.', w: 'Virus has genetic material + protein coat.' },
                { q: 'Decomposers are:', op: ['Plants', 'Fungi', 'Animals', 'Birds'], ans: 2, diff: 'HARD', r: 'Excellent conceptual accuracy.', w: 'Fungi act as decomposers.' },
            ]
        },
        {
            name: 'Intermediate',
            questions: [
                { q: 'Five kingdom system based on:', op: ['Colour', 'Size', 'Cell and nutrition', 'Weight'], ans: 3, diff: 'EASY', r: 'Good accuracy and speed.', w: 'Revise classification criteria.' },
                { q: 'Multicellular kingdom:', op: ['Monera', 'Protista', 'Animalia', 'Virus'], ans: 3, diff: 'EASY', r: 'Accurate and quick.', w: 'Animals are multicellular.' },
                { q: 'Bacteria size measured in:', op: ['Meter', 'Kilometer', 'Micrometer', 'Liter'], ans: 3, diff: 'EASY', r: 'Good scientific accuracy.', w: 'Bacteria measured in micrometer.' },
                { q: 'Protozoa found in:', op: ['Space', 'Soil/water', 'Fire', 'Metal'], ans: 2, diff: 'EASY', r: 'Correct and fast.', w: 'Protozoa live in soil & water.' },
                { q: 'Mushroom belongs to:', op: ['Fungi', 'Monera', 'Protista', 'Virus'], ans: 1, diff: 'EASY', r: 'Strong accuracy.', w: 'Mushroom is fungus.' },
                // Medium
                { q: 'Autotroph example:', op: ['Amoeba', 'Algae', 'Fungi', 'Virus'], ans: 2, diff: 'MEDIUM', r: 'Good speed and clarity.', w: 'Algae are autotrophs.' },
                { q: 'Pathogenic protozoa causes:', op: ['Cold', 'Malaria', 'Fever only', 'Headache'], ans: 2, diff: 'MEDIUM', r: 'Excellent accuracy.', w: 'Plasmodium causes malaria.' },
                { q: 'Virus multiplies in:', op: ['Water', 'Air', 'Host cell', 'Soil'], ans: 3, diff: 'MEDIUM', r: 'High accuracy and speed.', w: 'Virus needs host cell.' },
                // Hard
                { q: 'Which has no nucleus?', op: ['Fungi', 'Protista', 'Bacteria', 'Algae'], ans: 3, diff: 'HARD', r: 'Excellent advanced accuracy.', w: 'Bacteria lack nucleus.' },
                { q: 'Consumers are:', op: ['Plants', 'Animals', 'Fungi', 'Algae'], ans: 2, diff: 'HARD', r: 'Strong ecosystem understanding.', w: 'Animals are consumers.' },
            ]
        },
        {
            name: 'Advance',
            questions: [
                { q: 'Producers make food by:', op: ['Digestion', 'Photosynthesis', 'Absorption', 'Hunting'], ans: 2, diff: 'EASY', r: 'Accurate and fast.', w: 'Producers photosynthesize.' },
                { q: 'Chlorella is:', op: ['Bacteria', 'Algae', 'Virus', 'Animal'], ans: 2, diff: 'EASY', r: 'Good accuracy.', w: 'Chlorella is algae.' },
                { q: 'Fungi are:', op: ['Autotroph', 'Heterotroph', 'Producers', 'None'], ans: 2, diff: 'EASY', r: 'Correct and quick.', w: 'Fungi are heterotrophs.' },
                { q: 'Monera includes:', op: ['Virus', 'Bacteria', 'Plants', 'Animals'], ans: 2, diff: 'EASY', r: 'Excellent speed.', w: 'Monera = bacteria.' },
                { q: 'Binary fission seen in:', op: ['Plants', 'Animals', 'Bacteria', 'Birds'], ans: 3, diff: 'EASY', r: 'Accurate recall.', w: 'Bacteria divide by fission.' },
                // Medium
                { q: 'Virus size measured in:', op: ['Meter', 'mm', 'nm', 'cm'], ans: 3, diff: 'MEDIUM', r: 'Good scientific accuracy.', w: 'Virus measured in nanometer.' },
                { q: 'Multicellular fungi example:', op: ['Yeast', 'Mushroom', 'Bacteria', 'Virus'], ans: 2, diff: 'MEDIUM', r: 'Accurate and quick.', w: 'Mushroom multicellular fungus.' },
                { q: 'Euglena shows:', op: ['Only plant trait', 'Only animal trait', 'Both', 'None'], ans: 3, diff: 'MEDIUM', r: 'High concept accuracy.', w: 'Euglena shows both traits.' },
                // Hard
                { q: 'Edge of living and non-living:', op: ['Fungi', 'Virus', 'Algae', 'Bacteria'], ans: 2, diff: 'HARD', r: 'Excellent advanced knowledge.', w: 'Virus shows both properties.' },
                { q: 'Decomposer role done by:', op: ['Plants', 'Fungi', 'Birds', 'Fish'], ans: 2, diff: 'HARD', r: 'Strong ecosystem concept.', w: 'Fungi decompose matter.' },
            ]
        },
        {
            name: 'Challenge',
            questions: [
                { q: 'Classification helps in:', op: ['Confusion', 'Study organisms', 'Destroy life', 'Ignore species'], ans: 2, diff: 'EASY', r: 'Fast and accurate.', w: 'Classification helps study.' },
                { q: 'Autotroph means:', op: ['Eats others', 'Makes own food', 'No food', 'Only water'], ans: 2, diff: 'EASY', r: 'Accurate understanding.', w: 'Autotroph makes own food.' },
                { q: 'Protozoa are:', op: ['Multicellular', 'Unicellular', 'Plants', 'Virus'], ans: 2, diff: 'EASY', r: 'Good accuracy.', w: 'Protozoa unicellular.' },
                { q: 'Virus contains:', op: ['Only cell', 'Only nucleus', 'DNA or RNA', 'Roots'], ans: 3, diff: 'EASY', r: 'Excellent accuracy.', w: 'Virus has DNA/RNA.' },
                { q: 'Algae contain:', op: ['Chloroplast', 'Bone', 'Muscle', 'Hair'], ans: 1, diff: 'EASY', r: 'Correct and quick.', w: 'Chloroplast present in algae.' },
                // Medium
                { q: 'Example of pathogenic bacteria:', op: ['Mushroom', 'Lactobacillus', 'Salmonella', 'Algae'], ans: 3, diff: 'MEDIUM', r: 'Strong accuracy.', w: 'Salmonella causes disease.' },
                { q: 'Fungi reproduce by:', op: ['Budding/spores', 'Seeds', 'Eggs', 'Roots'], ans: 1, diff: 'MEDIUM', r: 'Excellent concept clarity.', w: 'Fungi reproduce by spores/budding.' },
                { q: 'Which is eukaryotic?', op: ['Bacteria', 'Virus', 'Amoeba', 'None'], ans: 3, diff: 'MEDIUM', r: 'Accurate and fast.', w: 'Amoeba is eukaryotic.' },
                // Hard
                { q: 'Most numerous organisms:', op: ['Animals', 'Microorganisms', 'Plants', 'Birds'], ans: 2, diff: 'HARD', r: 'Advanced concept accuracy.', w: 'Microbes most numerous.' },
                { q: 'Study of classification called:', op: ['Taxonomy', 'Anatomy', 'Chemistry', 'Physics'], ans: 1, diff: 'HARD', r: 'Excellent mastery and speed.', w: 'Taxonomy = classification study.' },
            ]
        }
    ];


    // HELPER to create Levels and Questions
    async function createLevels(chapterId: string, levelsData: any[]) {
        for (const [index, lvl] of levelsData.entries()) {
            const level = await prisma.level.upsert({
                where: { chapterId_name: { chapterId: chapterId, name: lvl.name } },
                update: {},
                create: { name: lvl.name, order: index + 1, chapterId: chapterId }
            });

            console.log(`  - Level: ${lvl.name}`);

            // Delete existing questions for this level to ensure clean state with new structure
            await prisma.question.deleteMany({ where: { levelId: level.id } });

            for (const q of lvl.questions) {
                await prisma.question.create({
                    data: {
                        content: q.q,
                        options: JSON.stringify(q.op.map((text: string, i: number) => ({ id: i + 1, text }))),
                        correctOption: q.ans,
                        difficulty: q.diff,
                        explanation: q.r, // Using right feedback as explanation for now, can be separate
                        rightFeedback: q.r,
                        wrongFeedback: q.w,
                        levelId: level.id
                    }
                });
            }
        }
    }

    await createLevels(mathChapter.id, mathLevels);
    await createLevels(scienceChapter.id, scienceLevels);

    // --- STANDARD 9 & 10 (Placeholders) ---
    const standards = ['9', '10'];
    const subjects = ['Mathematics', 'Science'];

    for (const std of standards) {
        console.log(`Processing Standard ${std}...`);
        for (const subjName of subjects) {
            const subject = await prisma.subject.upsert({
                where: { name_standard: { name: subjName, standard: std } },
                update: {},
                create: { name: subjName, standard: std }
            });

            // Create one placeholder chapter
            const chapter = await prisma.chapter.upsert({
                where: { subjectId_name: { subjectId: subject.id, name: `${subjName} - ${std}th Grade Intro` } },
                update: {},
                create: { name: `${subjName} - ${std}th Grade Intro`, subjectId: subject.id, order: 1 }
            });

            // Create placeholder levels
            const levelsData = [
                {
                    name: 'Diagnostic',
                    questions: [
                        { q: `Placeholder question 1 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 1, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                        { q: `Placeholder question 2 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 2, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                        { q: `Placeholder question 3 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 3, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                        { q: `Placeholder question 4 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 4, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                        { q: `Placeholder question 5 for ${subjName} ${std}`, op: ['Option A', 'Option B', 'Option C', 'Option D'], ans: 1, diff: 'EASY', r: 'Correct!', w: 'Incorrect.' },
                    ]
                }
            ];
            await createLevels(chapter.id, levelsData);
        }
    }

    console.log('Seeding completed successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
