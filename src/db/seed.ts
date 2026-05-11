import { db } from './index';
import { users } from './schema/users';
import { quizzes } from './schema/quizzes';
import { questions } from './schema/questions';
import { answers } from './schema/answers';
import { slides } from './schema/slides';
import { discussions } from './schema/discussions';
import { conceptChecks } from './schema/concept-checks';
import { editableContent } from './schema/editable-content';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  // --- Users ---
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const [teacher] = await db.insert(users).values({
    username: 'teacher',
    email: 'teacher@university.edu',
    passwordHash: teacherPassword,
    role: 'TEACHER',
    displayName: 'Dr. Smith',
  }).returning();

  const studentUsers = await db.insert(users).values([
    { username: 'student1', email: 'student1@university.edu', passwordHash: studentPassword, role: 'STUDENT', displayName: 'Alice Wang' },
    { username: 'student2', email: 'student2@university.edu', passwordHash: studentPassword, role: 'STUDENT', displayName: 'Bob Chen' },
    { username: 'student3', email: 'student3@university.edu', passwordHash: studentPassword, role: 'STUDENT', displayName: 'Carol Li' },
    { username: 'student4', email: 'student4@university.edu', passwordHash: studentPassword, role: 'STUDENT', displayName: 'David Zhang' },
    { username: 'student5', email: 'student5@university.edu', passwordHash: studentPassword, role: 'STUDENT', displayName: 'Eva Liu' },
  ]).returning();

  console.log(`Created ${1 + studentUsers.length} users`);

  // --- Slides (10-slide presentation) ---
  await db.insert(slides).values([
    {
      storageKey: 'slide:title',
      slideOrder: 1,
      title: 'Cognitive & Social Constructivism',
      content: 'Introduction to Educational Psychology\n\nPiaget vs. Vygotsky\n\n180 minutes | 90 students',
      slideType: 'title',
      backgroundColor: '#1e3a5f',
    },
    {
      storageKey: 'slide:ilos',
      slideOrder: 2,
      title: 'Intended Learning Outcomes',
      content: 'By the end of this lesson, you will be able to:\n\n1. Compare cognitive constructivism (Piaget) and social constructivism (Vygotsky) using specific theoretical principles\n\n2. Analyze educational scenarios to evaluate how each theory informs instructional strategies\n\n3. Design a lesson plan outline incorporating elements of both theories',
      slideType: 'content',
    },
    {
      storageKey: 'slide:piaget',
      slideOrder: 3,
      title: 'Cognitive Constructivism — Piaget',
      content: 'Key Principles:\n\n• Knowledge is constructed individually through interaction with the environment\n• Schema development: Assimilation & Accommodation\n• Stages of development: Sensorimotor → Preoperational → Concrete → Formal\n• Equilibrium & Disequilibrium drive learning\n• Learning is an active, constructive process',
      slideType: 'content',
    },
    {
      storageKey: 'slide:vygotsky',
      slideOrder: 4,
      title: 'Social Constructivism — Vygotsky',
      content: 'Key Principles:\n\n• Knowledge is constructed through social interaction\n• Zone of Proximal Development (ZPD)\n• Scaffolding by More Knowledgeable Other (MKO)\n• Language is central to cognitive development\n• Culture shapes thinking processes\n• Learning leads development',
      slideType: 'content',
    },
    {
      storageKey: 'slide:compare',
      slideOrder: 5,
      title: 'Comparing the Two Theories',
      content: 'Piaget:\n• Individual knowledge construction\n• Stages of development\n• Assimilation & Accommodation\n• Learning = adapting schemas\n\nVygotsky:\n• Social knowledge construction\n• Continuous development\n• ZPD & Scaffolding\n• Learning = social process\n\nShared:\n• Active knowledge construction\n• Prior knowledge matters\n• Learner-centered approach',
      slideType: 'comparison',
    },
    {
      storageKey: 'slide:activities',
      slideOrder: 6,
      title: 'Teaching & Learning Activities',
      content: 'Introduction (20 min)\n• Hook poll: Is learning solitary or social?\n• Pre-test review & misconception check\n\nDevelopment (130 min)\n• Segment 1: Interactive lecture with diagrams (30 min)\n• Segment 2: Padlet group work (40 min)\n• Segment 3: Case study analysis (30 min)\n• Segment 4: Peer teaching & quizzes (30 min)\n\nSynthesis (20 min)\n• Post-test & one-minute paper',
      slideType: 'content',
    },
    {
      storageKey: 'slide:casestudy',
      slideOrder: 7,
      title: 'Case Study Analysis',
      content: 'Scenario 1:\n"A teacher introduces group projects to teach conflict resolution"\n→ Which theory best supports this? Why?\n\nScenario 2:\n"A student independently discovers a new math concept through trial and error"\n→ Which theory explains this learning? Why?\n\nDiscuss: Could both theories apply to each scenario?',
      slideType: 'content',
    },
    {
      storageKey: 'slide:assessment',
      slideOrder: 8,
      title: 'Assessment Methods',
      content: 'Formative Assessment:\n• Padlet participation quality\n• Mentimeter quiz responses\n• Exit ticket reflection\n\nSummative Assessment:\n• Assignment: Design a 1-week lesson plan applying both theories\n• Rubric evaluates theoretical integration and practicality',
      slideType: 'content',
    },
    {
      storageKey: 'slide:alignment',
      slideOrder: 9,
      title: 'Constructive Alignment Matrix',
      content: 'ILO 1: Compare theories\n→ Activity: Padlet discussion, visualizations\n→ Assessment: Post-test questions\n\nILO 2: Analyze scenarios\n→ Activity: Case study, peer teaching\n→ Assessment: Lesson plan rubric — justification\n\nILO 3: Design application\n→ Activity: Group scenarios, jigsaw\n→ Assessment: Lesson plan rubric — implementation',
      slideType: 'content',
    },
    {
      storageKey: 'slide:reflection',
      slideOrder: 10,
      title: 'Reflection & Next Steps',
      content: 'Key Takeaways:\n• Both theories value active learning\n• Piaget emphasizes individual construction\n• Vygotsky emphasizes social construction\n• Effective teaching integrates both approaches\n\nNext Class:\nDifferentiated instruction strategies\n\nOne-Minute Paper:\nHow could both theories coexist in a classroom?',
      slideType: 'closing',
      backgroundColor: '#1e3a5f',
    },
  ]);
  console.log('Created 10 slides');

  // --- Quizzes ---
  const [preTest] = await db.insert(quizzes).values({
    storageKey: 'quiz:pretest',
    title: 'Pre-Test: Constructivism',
    description: 'Assess your prior knowledge before the lesson',
    quizType: 'multiple_choice',
  }).returning();

  const preTestQuestions = [
    {
      storageKey: 'q:pretest-1',
      questionText: 'Which theorist emphasized the Zone of Proximal Development?',
      questionOrder: 1,
      questionType: 'multiple_choice',
      explanation: 'Lev Vygotsky introduced the concept of the Zone of Proximal Development (ZPD), which describes the gap between what a learner can do independently and what they can do with guidance.',
      answers: [
        { answerText: 'Jean Piaget', isCorrect: false, answerOrder: 1 },
        { answerText: 'Lev Vygotsky', isCorrect: true, answerOrder: 2 },
        { answerText: 'John Dewey', isCorrect: false, answerOrder: 3 },
        { answerText: 'B.F. Skinner', isCorrect: false, answerOrder: 4 },
      ],
    },
    {
      storageKey: 'q:pretest-2',
      questionText: 'What is "scaffolding" in the context of learning theory?',
      questionOrder: 2,
      questionType: 'multiple_choice',
      explanation: 'Scaffolding refers to temporary support provided by a more knowledgeable person to help a learner accomplish a task within their Zone of Proximal Development.',
      answers: [
        { answerText: 'Building physical structures for classrooms', isCorrect: false, answerOrder: 1 },
        { answerText: 'Temporary support to help learners accomplish tasks they cannot yet do alone', isCorrect: true, answerOrder: 2 },
        { answerText: 'A type of standardized test', isCorrect: false, answerOrder: 3 },
        { answerText: 'A method of memorization', isCorrect: false, answerOrder: 4 },
      ],
    },
    {
      storageKey: 'q:pretest-3',
      questionText: 'In Piaget\'s theory, what is a "schema"?',
      questionOrder: 3,
      questionType: 'multiple_choice',
      explanation: 'A schema is a mental framework or structure that helps organize and interpret information. Schemas are modified through assimilation and accommodation.',
      answers: [
        { answerText: 'A teaching strategy', isCorrect: false, answerOrder: 1 },
        { answerText: 'A mental framework for organizing and interpreting information', isCorrect: true, answerOrder: 2 },
        { answerText: 'A type of assessment', isCorrect: false, answerOrder: 3 },
        { answerText: 'A social interaction pattern', isCorrect: false, answerOrder: 4 },
      ],
    },
    {
      storageKey: 'q:pretest-4',
      questionText: 'Which concept is central to cognitive constructivism?',
      questionOrder: 4,
      questionType: 'multiple_choice',
      explanation: 'Cognitive constructivism (Piaget) centers on the idea that individuals actively construct knowledge through their own cognitive processes, particularly through assimilation and accommodation of schemas.',
      answers: [
        { answerText: 'Social negotiation of meaning', isCorrect: false, answerOrder: 1 },
        { answerText: 'Individual knowledge construction through interaction with the environment', isCorrect: true, answerOrder: 2 },
        { answerText: 'Behavioral conditioning', isCorrect: false, answerOrder: 3 },
        { answerText: 'Memorization through repetition', isCorrect: false, answerOrder: 4 },
      ],
    },
    {
      storageKey: 'q:pretest-5',
      questionText: 'What distinguishes social constructivism from cognitive constructivism?',
      questionOrder: 5,
      questionType: 'multiple_choice',
      explanation: 'The key distinction is that social constructivism emphasizes that knowledge is constructed through social interaction and cultural tools, while cognitive constructivism focuses on individual construction of knowledge.',
      answers: [
        { answerText: 'Social constructivism emphasizes that knowledge is constructed through social interaction', isCorrect: true, answerOrder: 1 },
        { answerText: 'Cognitive constructivism focuses on group work', isCorrect: false, answerOrder: 2 },
        { answerText: 'Social constructivism rejects the role of prior knowledge', isCorrect: false, answerOrder: 3 },
        { answerText: 'There is no meaningful difference between the two', isCorrect: false, answerOrder: 4 },
      ],
    },
  ];

  for (const q of preTestQuestions) {
    const { answers: answerData, ...questionData } = q;
    const [question] = await db.insert(questions).values({
      ...questionData,
      quizId: preTest.id,
    }).returning();
    await db.insert(answers).values(answerData.map(a => ({ ...a, questionId: question.id })));
  }
  console.log('Created pre-test quiz with questions');

  const [postTest] = await db.insert(quizzes).values({
    storageKey: 'quiz:posttest',
    title: 'Post-Test: Constructivism',
    description: 'Measure your learning gains after the lesson',
    quizType: 'multiple_choice',
  }).returning();

  const postTestQuestions = [
    {
      storageKey: 'q:posttest-1',
      questionText: 'A teacher uses peer mentoring for complex math problems. Which theory does this align with most?',
      questionOrder: 1,
      questionType: 'multiple_choice',
      explanation: 'Peer mentoring is a direct application of Vygotsky\'s social constructivism, specifically the concepts of ZPD and the More Knowledgeable Other.',
      answers: [
        { answerText: 'Cognitive constructivism (Piaget)', isCorrect: false, answerOrder: 1 },
        { answerText: 'Social constructivism (Vygotsky)', isCorrect: true, answerOrder: 2 },
        { answerText: 'Behaviorism (Skinner)', isCorrect: false, answerOrder: 3 },
        { answerText: 'Neither theory', isCorrect: false, answerOrder: 4 },
      ],
    },
    {
      storageKey: 'q:posttest-2',
      questionText: 'How does a "spiral curriculum" reflect cognitive constructivism?',
      questionOrder: 2,
      questionType: 'multiple_choice',
      explanation: 'A spiral curriculum revisits topics at increasing depth, reflecting Piaget\'s view that learners actively build and refine schemas over time through assimilation and accommodation.',
      answers: [
        { answerText: 'It relies on social interaction', isCorrect: false, answerOrder: 1 },
        { answerText: 'It revisits topics at increasing depth, reflecting schema refinement over time', isCorrect: true, answerOrder: 2 },
        { answerText: 'It uses behavioral rewards', isCorrect: false, answerOrder: 3 },
        { answerText: 'It focuses on memorization', isCorrect: false, answerOrder: 4 },
      ],
    },
    {
      storageKey: 'q:posttest-3',
      questionText: 'Which of the following is a shared principle of both cognitive and social constructivism?',
      questionOrder: 3,
      questionType: 'multiple_choice',
      explanation: 'Both theories agree that learners actively construct knowledge rather than passively receive it. This is the core constructivist principle.',
      answers: [
        { answerText: 'Learning is a passive process', isCorrect: false, answerOrder: 1 },
        { answerText: 'Learners actively construct knowledge', isCorrect: true, answerOrder: 2 },
        { answerText: 'Development always precedes learning', isCorrect: false, answerOrder: 3 },
        { answerText: 'Only social interaction produces learning', isCorrect: false, answerOrder: 4 },
      ],
    },
    {
      storageKey: 'q:posttest-4',
      questionText: 'When a teacher gradually reduces support as students gain competence, what Vygotskian concept is being applied?',
      questionOrder: 4,
      questionType: 'multiple_choice',
      explanation: 'Fading scaffolding is the process of gradually withdrawing support as learners become more competent, allowing them to work independently within their ZPD.',
      answers: [
        { answerText: 'Assimilation', isCorrect: false, answerOrder: 1 },
        { answerText: 'Equilibration', isCorrect: false, answerOrder: 2 },
        { answerText: 'Fading scaffolding', isCorrect: true, answerOrder: 3 },
        { answerText: 'Accommodation', isCorrect: false, answerOrder: 4 },
      ],
    },
    {
      storageKey: 'q:posttest-5',
      questionText: 'In designing a lesson that integrates both theories, which combination best reflects their principles?',
      questionOrder: 5,
      questionType: 'multiple_choice',
      explanation: 'The most effective integration combines individual exploration (Piaget\'s active construction) with collaborative learning (Vygotsky\'s social interaction), allowing students to build schemas both independently and socially.',
      answers: [
        { answerText: 'Lecture-only instruction', isCorrect: false, answerOrder: 1 },
        { answerText: 'Individual exploration followed by collaborative group work', isCorrect: true, answerOrder: 2 },
        { answerText: 'Group work without any individual reflection', isCorrect: false, answerOrder: 3 },
        { answerText: 'Standardized testing', isCorrect: false, answerOrder: 4 },
      ],
    },
  ];

  for (const q of postTestQuestions) {
    const { answers: answerData, ...questionData } = q;
    const [question] = await db.insert(questions).values({
      ...questionData,
      quizId: postTest.id,
    }).returning();
    await db.insert(answers).values(answerData.map(a => ({ ...a, questionId: question.id })));
  }
  console.log('Created post-test quiz with questions');

  // --- Discussions ---
  await db.insert(discussions).values([
    {
      storageKey: 'discussion:guiding-q1',
      title: 'How might social interactions shape a child\'s cognitive development?',
      description: 'Pre-class guiding question: Share your thoughts on how social interactions influence cognitive development. Consider Vygotsky\'s perspective.',
      createdBy: teacher.id,
      isPinned: true,
    },
    {
      storageKey: 'discussion:guiding-q2',
      title: 'Personal Learning Experience — Piaget or Vygotsky?',
      description: 'Recall a personal learning experience that aligns with either Piagetian or Vygotskian theory. Describe the experience and explain which theory it reflects.',
      createdBy: teacher.id,
      isPinned: true,
    },
    {
      storageKey: 'discussion:think-pair-share',
      title: 'Think-Pair-Share: Spiral Curriculum',
      description: 'How does a "spiral curriculum" reflect cognitive constructivism? Discuss with your partner and post your insights.',
      createdBy: teacher.id,
    },
    {
      storageKey: 'discussion:theory-coexistence',
      title: 'Can both theories coexist in a classroom?',
      description: 'One-minute paper discussion: Summarize how both cognitive and social constructivism could coexist in a single classroom setting.',
      createdBy: teacher.id,
    },
  ]);
  console.log('Created discussions');

  // --- Concept Checks ---
  await db.insert(conceptChecks).values([
    {
      storageKey: 'conceptcheck:intro-hook',
      title: 'Learning: Solitary or Social?',
      prompt: 'Do you think learning is primarily a solitary or social process?',
      checkType: 'thumbs',
      sectionKey: 'introduction',
    },
    {
      storageKey: 'conceptcheck:piaget-understand',
      title: 'Piaget Comprehension Check',
      prompt: 'Do you understand the key principles of cognitive constructivism (schema, assimilation, accommodation)?',
      checkType: 'thumbs',
      sectionKey: 'development',
    },
    {
      storageKey: 'conceptcheck:vygotsky-understand',
      title: 'Vygotsky Comprehension Check',
      prompt: 'Do you understand the key principles of social constructivism (ZPD, scaffolding, MKO)?',
      checkType: 'thumbs',
      sectionKey: 'development',
    },
    {
      storageKey: 'conceptcheck:case-study',
      title: 'Case Study Confidence',
      prompt: 'How confident are you in analyzing scenarios using both theories?',
      checkType: 'thumbs',
      sectionKey: 'development',
    },
    {
      storageKey: 'conceptcheck:synthesis',
      title: 'Synthesis Check',
      prompt: 'Can you see how both theories could be integrated in classroom practice?',
      checkType: 'thumbs',
      sectionKey: 'synthesis',
    },
  ]);
  console.log('Created concept checks');

  // --- Editable Content ---
  await db.insert(editableContent).values([
    {
      storageKey: 'content:ilos',
      content: 'By the end of the lesson, students will be able to:\n1. Compare **cognitive constructivism (Piaget)** and **social constructivism (Vygotsky)** using specific theoretical principles.\n2. Analyze educational scenarios to evaluate how each theory informs instructional strategies.\n3. Design a lesson plan outline that incorporates elements of both theories.',
    },
    {
      storageKey: 'content:preclass-description',
      content: '**Flipped Learning Components**:\n- **Pre-Reading**: Excerpt from *Educational Psychology: Theory and Practice* (Slavin, 2023) on Piaget and Vygotsky.\n- **Pre-Test** (5 questions via LMS): Topics include key terms (schema, scaffolding), core principles, and differences between theories.',
    },
    {
      storageKey: 'content:intro-hook',
      content: 'Poll question via Mentimeter – "Do you think *learning is solitary or social*? Vote and discuss."',
    },
    {
      storageKey: 'content:intro-pretest-review',
      content: 'Display anonymized pre-test results, address misconceptions (e.g., conflating assimilation with scaffolding).',
    },
    {
      storageKey: 'content:intro-realworld',
      content: 'Why might a teacher use peer mentoring (Vygotsky) for complex math problems?',
    },
    {
      storageKey: 'content:dev-segment1',
      content: '**Annotated Diagrams**: Show Piaget\'s schema development process and Vygotsky\'s ZPD.\n\n**Think-Pair-Share**: "How does a \'spiral curriculum\' reflect cognitive constructivism?"',
    },
    {
      storageKey: 'content:dev-segment2',
      content: 'Split into 15 groups (6 students each). Use Padlet to:\n- List 3 unique principles of each theory.\n- Post one classroom scenario applying each theory.\n\n**Scaffolding**: Provide concept map template for comparing theories.',
    },
    {
      storageKey: 'content:dev-segment3',
      content: 'Analyze 2 case studies:\n1. "A teacher introduces group projects to teach conflict resolution"\n2. "A student independently discovers a new math concept through trial and error"\n\nDebate which theory best supports each strategy using key terms.',
    },
    {
      storageKey: 'content:dev-segment4',
      content: '**Jigsaw Activity**: Groups present Padlet boards to peers.\n\n**Mentimeter Poll**: Quick quiz — "Which theory aligns with using mentors?"',
    },
    {
      storageKey: 'content:synthesis',
      content: '**Post-Test**: 5-question quiz measuring gains compared to pre-test.\n\n**One-Minute Paper**: "Summarize how both theories could coexist in a classroom."\n\n**Preview of Next Class**: Connect to lesson on differentiated instruction strategies.',
    },
    {
      storageKey: 'content:assessment-formative',
      content: '- Padlet participation quality.\n- Mentimeter quiz responses.\n- Exit ticket reflection on pre- and post-test differences.',
    },
    {
      storageKey: 'content:assessment-summative',
      content: '**Assignment**: Design a 1-week lesson plan outline applying both theories (rubric evaluates theoretical integration and practicality).',
    },
    {
      storageKey: 'content:alignment-row1',
      content: '**Compare theories** → Padlet group discussion, animated visualizations → Post-test structured-response questions',
    },
    {
      storageKey: 'content:alignment-row2',
      content: '**Analyze scenarios** → Case study analysis, peer teaching → Lesson plan rubric: theoretical justification',
    },
    {
      storageKey: 'content:alignment-row3',
      content: '**Design application** → Group scenario creation, jigsaw activity → Lesson plan rubric: strategy implementation',
    },
    {
      storageKey: 'content:resources',
      content: '- **LMS**: Pre/post-tests (e.g., Canvas, Moodle).\n- **Interactive Tools**: Mentimeter, Padlet, Quizlet flashcards.\n- **Materials**: Case studies, concept map templates, textbook excerpt.\n- **Video**: TED Talk by Debbie Reese.',
    },
    {
      storageKey: 'content:differentiation',
      content: '- **For Visual Learners**: Provide static theory comparison charts.\n- **Advanced Learners**: Optional extension – read original Piaget/Vygotsky texts.\n- **Multilingual Support**: Subtitles for video, multilingual Padlet interface.\n- **Accessibility**: Transcripts for video, screen-reader-compatible digital content.',
    },
    {
      storageKey: 'content:reflection',
      content: '- **Success Indicators**: 80% post-test improvement from pre-test; Padlet engagement metrics.\n- **Feedback**: Post-class survey (e.g., "Which activity most clarified the theories?").\n- **Modifications**: For future iterations, integrate role-play activities for kinesthetic learners.',
    },
  ]);
  console.log('Created editable content entries');

  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
