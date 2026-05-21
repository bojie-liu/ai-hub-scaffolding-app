import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const SEED_VERSION = 'v2_lesson_content';

async function seedLessonContent() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  try {
    // Check if seed already applied
    const existing = await db
      .select()
      .from(schema.seedLog)
      .where(eq(schema.seedLog.seedVersion, SEED_VERSION))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Seed "${SEED_VERSION}" already applied. Skipping.`);
      return;
    }

    await db.transaction(async (tx) => {
      const adminUsers = await tx.select().from(schema.users).limit(1);
      const adminId = adminUsers[0]?.id ?? 1;

      // ========== PRE-TEST QUIZ ==========
      const [pretestQuiz] = await tx.insert(schema.quizzes).values({
        storageKey: 'pretest-tpack',
        title: 'TPACK Pre-Test',
        description: 'Assess your baseline knowledge of TPACK basics and AI integration challenges',
        quizType: 'multiple_choice',
      }).returning();

      const pretestQuestions = [
        {
          text: 'What does the acronym TPACK stand for?',
          answers: [
            { text: 'Technological Pedagogical Content Knowledge', correct: true },
            { text: 'Teaching Planning And Content Kit', correct: false },
            { text: 'Technology Practice And Curriculum Knowledge', correct: false },
            { text: 'Technical Pedagogy And Content Processing', correct: false },
          ],
        },
        {
          text: 'Which of the following is NOT one of the three core knowledge domains in TPACK?',
          answers: [
            { text: 'Technological Knowledge', correct: false },
            { text: 'Pedagogical Knowledge', correct: false },
            { text: 'Assessment Knowledge', correct: true },
            { text: 'Content Knowledge', correct: false },
          ],
        },
        {
          text: 'The intersection of Content Knowledge and Pedagogical Knowledge is called:',
          answers: [
            { text: 'Technological Pedagogical Knowledge', correct: false },
            { text: 'Pedagogical Content Knowledge', correct: true },
            { text: 'Technological Content Knowledge', correct: false },
            { text: 'Integrated Knowledge', correct: false },
          ],
        },
        {
          text: 'How many components does the Intelligent TPACK framework include?',
          answers: [
            { text: '5', correct: false },
            { text: '6', correct: false },
            { text: '7', correct: true },
            { text: '8', correct: false },
          ],
        },
        {
          text: 'Which of the following best describes "Intelligent TPACK"?',
          answers: [
            { text: 'TPACK with only AI tools', correct: false },
            { text: 'The integration of AI and smart technologies into the TPACK framework', correct: true },
            { text: 'A completely new framework replacing TPACK', correct: false },
            { text: 'Using computers instead of teachers', correct: false },
          ],
        },
        {
          text: 'What is a key ethical concern when integrating AI tools in education?',
          answers: [
            { text: 'AI tools are too expensive', correct: false },
            { text: 'Student data privacy and equity of access', correct: true },
            { text: 'AI tools are difficult to learn', correct: false },
            { text: 'Teachers do not like technology', correct: false },
          ],
        },
        {
          text: 'Which technology tool is primarily used for interactive video lessons?',
          answers: [
            { text: 'Canva', correct: false },
            { text: 'Edpuzzle', correct: true },
            { text: 'Padlet', correct: false },
            { text: 'Mentimeter', correct: false },
          ],
        },
        {
          text: 'The TPACK framework was developed by:',
          answers: [
            { text: 'Bloom and Anderson', correct: false },
            { text: 'Vygotsky and Piaget', correct: false },
            { text: 'Koehler and Mishra', correct: true },
            { text: 'Dewey and Freire', correct: false },
          ],
        },
        {
          text: 'What does TCK (Technological Content Knowledge) refer to?',
          answers: [
            { text: 'Knowledge about how technology and content influence each other', correct: true },
            { text: 'Knowledge about teaching with technology', correct: false },
            { text: 'Knowledge about student assessment', correct: false },
            { text: 'Knowledge about classroom management', correct: false },
          ],
        },
        {
          text: 'Which of the following is an example of intelligent technology in education?',
          answers: [
            { text: 'A chalkboard', correct: false },
            { text: 'A printed textbook', correct: false },
            { text: 'An adaptive learning platform that personalizes content', correct: true },
            { text: 'A overhead projector', correct: false },
          ],
        },
      ];

      for (let i = 0; i < pretestQuestions.length; i++) {
        const q = pretestQuestions[i];
        const [question] = await tx.insert(schema.questions).values({
          quizId: pretestQuiz.id,
          storageKey: `pretest-q${i + 1}`,
          questionText: q.text,
          questionOrder: i,
          questionType: 'multiple_choice',
          explanation: null,
        }).returning();

        for (let j = 0; j < q.answers.length; j++) {
          await tx.insert(schema.answers).values({
            questionId: question.id,
            answerText: q.answers[j].text,
            isCorrect: q.answers[j].correct,
            answerOrder: j,
          });
        }
      }

      // ========== POST-TEST QUIZ ==========
      const [posttestQuiz] = await tx.insert(schema.quizzes).values({
        storageKey: 'posttest-tpack',
        title: 'TPACK Post-Test',
        description: 'Evaluate your understanding of Intelligent TPACK after the lesson',
        quizType: 'multiple_choice',
      }).returning();

      const posttestQuestions = [
        {
          text: 'Which component of Intelligent TPACK represents the intersection of all three core domains plus AI?',
          answers: [
            { text: 'TPACK-I (Intelligent TPACK)', correct: true },
            { text: 'TCK', correct: false },
            { text: 'TPK', correct: false },
            { text: 'PCK', correct: false },
          ],
        },
        {
          text: 'How does intelligent technology enhance the TPACK framework?',
          answers: [
            { text: 'By replacing teachers entirely', correct: false },
            { text: 'By adding adaptive, data-driven, and personalized capabilities to each intersection', correct: true },
            { text: 'By simplifying content to make it easier', correct: false },
            { text: 'By removing the need for pedagogical knowledge', correct: false },
          ],
        },
        {
          text: 'In the AI Toolkit Workshop, which tool is best suited for creating adaptive assessments?',
          answers: [
            { text: 'Canva for Education', correct: false },
            { text: 'Quizizz AI', correct: true },
            { text: 'Genially', correct: false },
            { text: 'Padlet', correct: false },
          ],
        },
        {
          text: 'What is the primary purpose of the Case Analysis Roundtables activity?',
          answers: [
            { text: 'To memorize TPACK definitions', correct: false },
            { text: 'To evaluate lesson plans for technology integration strengths and weaknesses', correct: true },
            { text: 'To learn how to use Canva', correct: false },
            { text: 'To write essays about education', correct: false },
          ],
        },
        {
          text: 'Which ethical consideration is most important when using AI in classrooms?',
          answers: [
            { text: 'Making sure AI tools look attractive', correct: false },
            { text: 'Ensuring equity of access and protecting student data privacy', correct: true },
            { text: 'Using the most expensive tools available', correct: false },
            { text: 'Replacing all traditional teaching methods', correct: false },
          ],
        },
        {
          text: 'The Peer Teaching Carousel includes a station focused on:',
          answers: [
            { text: 'Cooking skills', correct: false },
            { text: 'Ethical use frameworks', correct: true },
            { text: 'Physical education', correct: false },
            { text: 'Music composition', correct: false },
          ],
        },
        {
          text: 'What does the summative assessment rubric evaluate for "Innovation & Practicality"?',
          answers: [
            { text: 'How creative and feasible the technology integration plan is', correct: true },
            { text: 'How many pages the assignment has', correct: false },
            { text: 'How many tools are mentioned', correct: false },
            { text: 'How fast the student completed the work', correct: false },
          ],
        },
        {
          text: 'Which is an example of scaffolded learning in this lesson?',
          answers: [
            { text: 'Giving students a test without preparation', correct: false },
            { text: 'Moving from a worked example to independent analysis of TPACK applications', correct: true },
            { text: 'Watching videos without any discussion', correct: false },
            { text: 'Skipping the pre-test', correct: false },
          ],
        },
        {
          text: 'The Constructive Alignment Matrix connects:',
          answers: [
            { text: 'Student grades with teacher salary', correct: false },
            { text: 'Learning outcomes, teaching activities, and assessment methods', correct: true },
            { text: 'Technology costs with school budgets', correct: false },
            { text: 'Video length with student attention', correct: false },
          ],
        },
        {
          text: 'According to the lesson plan, what percentage of students should participate in the peer teaching carousel?',
          answers: [
            { text: '50%', correct: false },
            { text: '60%', correct: false },
            { text: '70%', correct: false },
            { text: '80%', correct: true },
          ],
        },
      ];

      for (let i = 0; i < posttestQuestions.length; i++) {
        const q = posttestQuestions[i];
        const [question] = await tx.insert(schema.questions).values({
          quizId: posttestQuiz.id,
          storageKey: `posttest-q${i + 1}`,
          questionText: q.text,
          questionOrder: i,
          questionType: 'multiple_choice',
          explanation: null,
        }).returning();

        for (let j = 0; j < q.answers.length; j++) {
          await tx.insert(schema.answers).values({
            questionId: question.id,
            answerText: q.answers[j].text,
            isCorrect: q.answers[j].correct,
            answerOrder: j,
          });
        }
      }

      // ========== SLIDES (10 slides) ==========
      const slidesData = [
        {
          storageKey: 'slide-01-title',
          slideOrder: 0,
          title: 'Intelligent TPACK Lesson Plan',
          content: 'Technology, Pedagogy, and Content Knowledge for the AI Era\nUniversity Year 2 | 180 minutes',
          slideType: 'title',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-02-ilos',
          slideOrder: 1,
          title: 'Intended Learning Outcomes',
          content: '- Analyze the seven components of Intelligent TPACK and their intersections\n- Evaluate lesson plans for strengths/weaknesses in technology integration\n- Apply intelligent design principles to create innovative pedagogical approaches\n- Synthesize content knowledge with educational technology tools\n- Critique ethical considerations of AI integration in teaching',
          slideType: 'content',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-03-preclass',
          slideOrder: 2,
          title: 'Pre-Class Preparation',
          content: '- Watch: "TPACK Framework Explained" (7min)\n- Read: OECD 2021 Report excerpt on AI in Education\n- Complete the 10-question Pre-Test Quiz\n- Reflect on guiding questions about technology integration',
          slideType: 'content',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-04-intro',
          slideOrder: 3,
          title: 'Introduction (27 min)',
          content: '- Hook: Traditional vs. AI-integrated classroom comparison\n- Think-Pair-Share: Which elements to maintain/transform?\n- Pre-test review with Mentimeter word cloud\n- Case scenario: Ms. Chen\'s Tech Dilemma',
          slideType: 'content',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-05-activity1-2',
          slideOrder: 4,
          title: 'Development Activities (Part 1)',
          content: '- Activity 1: Interactive Lecture & Graphic Organizer (30min)\n  Co-construct concept map of 7 TPACK components\n- Activity 2: Case Analysis Roundtables (45min)\n  5 case studies, rotating stations every 8min\n  Identify TPACK components, suggest enhancements, propose ethical considerations',
          slideType: 'activity',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-06-activity3-4',
          slideOrder: 5,
          title: 'Development Activities (Part 2)',
          content: '- Activity 3: AI Toolkit Workshop (40min)\n  Canva for Education | Quizizz AI | Genially | Edpuzzle\n  Groups create 3-5 min demos\n- Activity 4: Peer Teaching Carousel (20min)\n  6 stations: STEM, Language, Ethics, Assessment, Engagement, PD',
          slideType: 'activity',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-07-synthesis',
          slideOrder: 6,
          title: 'Synthesis & Closure (18 min)',
          content: '- Post-Test: 10-item adaptive quiz with immediate feedback\n- Reflective Discussion: How might your teaching philosophy evolve?\n- Next Session: "Designing a 21st Century Professional Learning Plan"',
          slideType: 'content',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-08-assessment',
          slideOrder: 7,
          title: 'Assessment Rubric',
          content: '- TPACK Integration: All 7 components clearly identified (Excellent)\n- Intelligent Design: 3+ AI tools connected to pedagogy (Excellent)\n- Ethical Reflection: Multifaceted analysis of equity/privacy (Excellent)\n- Innovation: Creatively combines content/technology (Excellent)',
          slideType: 'assessment',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-09-alignment',
          slideOrder: 8,
          title: 'Constructive Alignment',
          content: '- Analyze → Interactive lecture + graphic organizer → Pre/post-test\n- Evaluate → Case analysis roundtables → Worksheet + rubric\n- Apply → AI Toolkit + peer teaching → Demo rubric\n- Synthesize → Lesson plan design → Summative rubric\n- Critique → Ethics discussion → Ethics rubric dimension',
          slideType: 'content',
          backgroundColor: null,
        },
        {
          storageKey: 'slide-10-resources',
          slideOrder: 9,
          title: 'Resources & Next Steps',
          content: '- LMS: Canvas (assessments, readings, cases)\n- Platforms: Mentimeter, Padlet, Zoom breakout rooms\n- Tools: Google Workspace, Canva for Education\n- References: Koehler & Mishra (2009), UNESCO AI Toolkit (2022)\n\nAssignment: Design a technology-integrated lesson plan using Intelligent TPACK',
          slideType: 'content',
          backgroundColor: null,
        },
      ];

      for (const slide of slidesData) {
        await tx.insert(schema.slides).values(slide);
      }

      // ========== DISCUSSIONS (3 guiding questions) ==========
      const discussionsData = [
        {
          storageKey: 'discussion-guiding-q1',
          title: 'How do you currently integrate technology in your teaching practice?',
          description: 'Share your experiences and approaches to technology integration. What tools do you use? What challenges have you faced?',
          createdBy: adminId,
          isPinned: true,
        },
        {
          storageKey: 'discussion-guiding-q2',
          title: 'What are the "intelligence" components in technology-based teaching?',
          description: 'Discuss what makes technology "intelligent" in educational contexts. How do AI and adaptive features enhance learning?',
          createdBy: adminId,
          isPinned: true,
        },
        {
          storageKey: 'discussion-guiding-q3',
          title: 'What ethical dilemmas might arise from AI tools in classrooms?',
          description: 'Explore ethical considerations including data privacy, equity of access, algorithmic bias, and the role of human judgment in AI-assisted teaching.',
          createdBy: adminId,
          isPinned: true,
        },
      ];

      for (const discussion of discussionsData) {
        await tx.insert(schema.discussions).values(discussion);
      }

      // ========== CONCEPT CHECKS ==========
      const conceptChecksData = [
        {
          storageKey: 'cc-ilos',
          title: 'Understanding ILOs',
          prompt: 'Can you identify the seven components of Intelligent TPACK after reading the learning outcomes?',
          checkType: 'thumbs',
          sectionKey: 'ilos',
        },
        {
          storageKey: 'cc-introduction',
          title: 'Hook Activity Comprehension',
          prompt: 'Did the traditional vs. AI-integrated classroom comparison help you understand the need for TPACK?',
          checkType: 'thumbs',
          sectionKey: 'introduction',
        },
        {
          storageKey: 'cc-activity1',
          title: 'TPACK Components Check',
          prompt: 'How well do you understand the 7 components of Intelligent TPACK after the interactive lecture?',
          checkType: 'scale',
          sectionKey: 'activity1',
        },
        {
          storageKey: 'cc-activity3',
          title: 'AI Tools Integration',
          prompt: 'Can you identify how at least 2 intelligent tools could enhance your teaching practice?',
          checkType: 'thumbs',
          sectionKey: 'activity3',
        },
        {
          storageKey: 'cc-ethical',
          title: 'Ethical Awareness',
          prompt: 'Name one ethical concern you have about using AI in education.',
          checkType: 'text',
          sectionKey: 'development',
        },
      ];

      for (const check of conceptChecksData) {
        await tx.insert(schema.conceptChecks).values(check);
      }

      // Mark seed as applied
      await tx.insert(schema.seedLog).values({
        seedVersion: SEED_VERSION,
      });
    });

    console.log(`Seed "${SEED_VERSION}" applied successfully.`);
  } catch (error) {
    console.error('Lesson content seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedLessonContent()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
