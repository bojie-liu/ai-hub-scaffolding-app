import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from './schema';

const SEED_VERSION = 'v2_lesson_data';

// --- Quiz Data ---

const preClassQuiz = {
  storageKey: 'quiz:preclass',
  title: 'Pre-Class Quiz: Accounting Equation Basics',
  description: 'Test your understanding of the pre-class video content about the accounting equation.',
  quizType: 'multiple_choice',
  questions: [
    {
      storageKey: 'preclass:q1',
      text: 'Dumpling cart owner spends HK$500 on ingredients - Where does this appear?',
      type: 'multiple_choice' as const,
      order: 1,
      explanation: 'Ingredients are consumed immediately in the production process, so they are recorded as an operating expense, reducing owner\'s equity.',
      answers: [
        { text: 'Assets', isCorrect: false, order: 1 },
        { text: 'Expenses', isCorrect: true, order: 2 },
        { text: 'Liabilities', isCorrect: false, order: 3 },
        { text: "Owner's Equity", isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'preclass:q2',
      text: 'Cathay Pacific pays HK$10M aircraft lease deposit - This is classified as:',
      type: 'multiple_choice' as const,
      order: 2,
      explanation: 'A lease deposit is a current asset because it is recoverable or will be applied to future lease payments. It is not an expense because the benefit has not yet been consumed.',
      answers: [
        { text: 'Operating expense', isCorrect: false, order: 1 },
        { text: 'Current asset', isCorrect: true, order: 2 },
        { text: 'Long-term liability', isCorrect: false, order: 3 },
        { text: "Owner's equity", isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'preclass:q3',
      text: 'If you open a bubble tea stall with personal savings, which parts of the accounting equation increase?',
      type: 'multiple_choice' as const,
      order: 3,
      explanation: 'When the owner invests personal savings, cash (an asset) increases and owner\'s equity (capital) increases by the same amount. No liability is created.',
      answers: [
        { text: 'Liabilities only', isCorrect: false, order: 1 },
        { text: 'Assets and Owner\'s Equity', isCorrect: true, order: 2 },
        { text: 'Assets and Liabilities', isCorrect: false, order: 3 },
        { text: "Owner's Equity only", isCorrect: false, order: 4 },
      ],
    },
  ],
};

const summativeQuiz = {
  storageKey: 'quiz:summative',
  title: 'Summative Assessment: The Accounting Equation',
  description: 'Comprehensive assessment covering all intended learning outcomes from the lesson.',
  quizType: 'multiple_choice',
  questions: [
    {
      storageKey: 'summative:q1',
      text: 'What is the fundamental accounting equation?',
      type: 'multiple_choice' as const,
      order: 1,
      explanation: 'The fundamental accounting equation is Assets = Liabilities + Owner\'s Equity. Every transaction must keep this equation in balance.',
      answers: [
        { text: 'Assets = Liabilities - Owner\'s Equity', isCorrect: false, order: 1 },
        { text: 'Assets = Liabilities + Owner\'s Equity', isCorrect: true, order: 2 },
        { text: 'Assets + Liabilities = Owner\'s Equity', isCorrect: false, order: 3 },
        { text: 'Liabilities = Assets + Owner\'s Equity', isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'summative:q2',
      text: 'If a business takes a bank loan of HK$50,000, how is the accounting equation affected?',
      type: 'multiple_choice' as const,
      order: 2,
      explanation: 'Taking a bank loan increases cash (asset) and increases the loan payable (liability) by the same amount. Owner\'s equity is not affected.',
      answers: [
        { text: 'Assets decrease, Liabilities increase', isCorrect: false, order: 1 },
        { text: 'Assets increase, Owner\'s Equity increases', isCorrect: false, order: 2 },
        { text: 'Assets increase, Liabilities increase', isCorrect: true, order: 3 },
        { text: 'Liabilities increase, Owner\'s Equity decreases', isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'summative:q3',
      text: 'Which of the following is NOT an asset?',
      type: 'multiple_choice' as const,
      order: 3,
      explanation: 'A bank loan is a liability (an obligation to repay), not an asset. Cash, equipment, and accounts receivable are all assets because they represent resources owned by the business.',
      answers: [
        { text: 'Cash in bank', isCorrect: false, order: 1 },
        { text: 'Bank loan', isCorrect: true, order: 2 },
        { text: 'Equipment', isCorrect: false, order: 3 },
        { text: 'Accounts receivable', isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'summative:q4',
      text: 'A company receives HK$50,000 prepayment for services not yet rendered. This is classified as:',
      type: 'multiple_choice' as const,
      order: 4,
      explanation: 'Unearned revenue (prepayment for undelivered services) is a liability because the company has an obligation to deliver the service or refund the money.',
      answers: [
        { text: 'Revenue', isCorrect: false, order: 1 },
        { text: 'Asset', isCorrect: false, order: 2 },
        { text: 'Liability', isCorrect: true, order: 3 },
        { text: "Owner's Equity", isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'summative:q5',
      text: 'When a business purchases equipment with cash, which two elements of the equation change?',
      type: 'multiple_choice' as const,
      order: 5,
      explanation: 'Equipment purchase with cash involves one asset increasing (equipment) and another asset decreasing (cash). This is an asset-for-asset exchange. Total assets remain unchanged.',
      answers: [
        { text: 'Liabilities and Owner\'s Equity', isCorrect: false, order: 1 },
        { text: 'Assets and Liabilities', isCorrect: false, order: 2 },
        { text: 'Two types of Assets - one increases, one decreases', isCorrect: true, order: 3 },
        { text: 'Assets and Owner\'s Equity', isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'summative:q6',
      text: 'Revenue earned by a business will:',
      type: 'multiple_choice' as const,
      order: 6,
      explanation: 'Revenue increases owner\'s equity (through retained earnings) and also increases an asset (typically cash or accounts receivable). The equation stays in balance.',
      answers: [
        { text: 'Increase Assets and increase Liabilities', isCorrect: false, order: 1 },
        { text: 'Increase Assets and increase Owner\'s Equity', isCorrect: true, order: 2 },
        { text: 'Decrease Liabilities and increase Owner\'s Equity', isCorrect: false, order: 3 },
        { text: 'Increase Assets and decrease Liabilities', isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'summative:q7',
      text: 'Every transaction affects at least two elements of the accounting equation.',
      type: 'true_false' as const,
      order: 7,
      explanation: 'This is the dual effect principle (double-entry concept). Every transaction has at least two effects on the accounting equation to keep it in balance.',
      answers: [
        { text: 'True', isCorrect: true, order: 1 },
        { text: 'False', isCorrect: false, order: 2 },
      ],
    },
    {
      storageKey: 'summative:q8',
      text: 'If total assets are HK$100,000 and liabilities are HK$30,000, owner\'s equity must be HK$70,000.',
      type: 'true_false' as const,
      order: 8,
      explanation: 'Using the accounting equation: Assets = Liabilities + Owner\'s Equity. Therefore Owner\'s Equity = Assets - Liabilities = HK$100,000 - HK$30,000 = HK$70,000.',
      answers: [
        { text: 'True', isCorrect: true, order: 1 },
        { text: 'False', isCorrect: false, order: 2 },
      ],
    },
    {
      storageKey: 'summative:q9',
      text: 'Why might Cathay Pacific capitalize an aircraft purchase while a street vendor expenses a similar relative purchase?',
      type: 'short_answer' as const,
      order: 9,
      explanation: 'Materiality and useful life determine classification. The aircraft provides benefit over many years and exceeds materiality thresholds, so it is capitalized and depreciated. The street vendor\'s purchase may be below the materiality threshold or have a short useful life, so it is expensed immediately.',
      answers: [],
    },
    {
      storageKey: 'summative:q10',
      text: 'A dumpling cart owner buys a new wok for HK$1,200. Cathay Pacific buys new business class seats for HK$20M. The different treatment is primarily due to:',
      type: 'multiple_choice' as const,
      order: 10,
      explanation: 'Materiality and useful life are the primary factors. For Cathay Pacific, HK$20M is material and the seats have a long useful life, justifying capitalization. For the street vendor, HK$1,200 may be immaterial or have a short useful life.',
      answers: [
        { text: 'Different accounting standards', isCorrect: false, order: 1 },
        { text: 'Materiality and useful life differences', isCorrect: true, order: 2 },
        { text: 'Tax regulations only', isCorrect: false, order: 3 },
        { text: 'Company preference', isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'summative:q11',
      text: 'A bubble tea stall owner invests HK$50,000 and takes a loan of HK$30,000. After buying equipment (HK$20,000) and ingredients (HK$5,000), and earning HK$8,000 revenue, what is the owner\'s equity?',
      type: 'multiple_choice' as const,
      order: 11,
      explanation: 'Owner\'s Equity = Capital + Revenue - Expenses = HK$50,000 + HK$8,000 - HK$5,000 = HK$53,000. The equipment purchase is an asset exchange (does not affect equity), and the loan is a liability (does not affect equity).',
      answers: [
        { text: 'HK$50,000', isCorrect: false, order: 1 },
        { text: 'HK$53,000', isCorrect: true, order: 2 },
        { text: 'HK$80,000', isCorrect: false, order: 3 },
        { text: 'HK$63,000', isCorrect: false, order: 4 },
      ],
    },
    {
      storageKey: 'summative:q12',
      text: 'In the accounting equation, if a transaction increases assets by HK$10,000 and increases liabilities by HK$4,000, what else must happen to keep the equation balanced?',
      type: 'multiple_choice' as const,
      order: 12,
      explanation: 'If assets increase by HK$10,000 and liabilities increase by HK$4,000, then owner\'s equity must increase by HK$6,000 to keep the equation balanced: +10,000 = +4,000 + +6,000.',
      answers: [
        { text: 'Owner\'s Equity decreases by HK$6,000', isCorrect: false, order: 1 },
        { text: 'Owner\'s Equity increases by HK$6,000', isCorrect: true, order: 2 },
        { text: 'Assets decrease by HK$6,000', isCorrect: false, order: 3 },
        { text: 'Liabilities decrease by HK$6,000', isCorrect: false, order: 4 },
      ],
    },
  ],
};

// --- Slide Data ---

const slideData = [
  {
    storageKey: 'slide:1',
    slideOrder: 1,
    title: 'The Accounting Equation: From Street Vendors to Skyscrapers',
    content: 'Understanding how every Hong Kong business — from Tai Kok Tsui dumpling carts to Cathay Pacific — uses the same fundamental accounting principle.',
    slideType: 'title' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:2',
    slideOrder: 2,
    title: 'Intended Learning Outcomes',
    content: '- Define and explain the fundamental accounting equation\n- Classify transactions into assets, liabilities, and owner\'s equity\n- Analyze how transactions affect the equation across business scales\n- Differentiate capital expenditures from operating expenses\n- Apply the accounting equation to solve basic problems',
    slideType: 'content' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:3',
    slideOrder: 3,
    title: 'The Fundamental Accounting Equation',
    content: 'Assets = Liabilities + Owner\'s Equity\n\nThis equation MUST always balance.\nEvery business transaction affects at least two elements.\n\n- Assets: What the business OWNS (cash, equipment, property)\n- Liabilities: What the business OWES (loans, payables)\n- Owner\'s Equity: What belongs to the OWNER (capital, retained earnings)',
    slideType: 'content' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:4',
    slideOrder: 4,
    title: 'Cathay Pacific vs. Dumpling Cart',
    content: 'Same principle, different scale:\n\n- Cathay Pacific: HK$200M aircraft upgrade → Capital Asset\n- Tai Kok Tsui dumpling cart: HK$1,200 wok → Operating Expense\n\nWhy the difference?\n- Materiality: Is the amount significant?\n- Useful life: Does the item benefit multiple years?\n- Business context: How does the business operate?',
    slideType: 'activity' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:5',
    slideOrder: 5,
    title: 'Transaction Analysis: Bubble Tea Stall',
    content: 'Kowloon City Bubble Tea Stall:\n\n- Owner invests HK$50,000 → Cash ↑, Owner\'s Equity ↑\n- Bank loan HK$30,000 → Cash ↑, Liabilities ↑\n- Buy equipment HK$20,000 → Equipment ↑, Cash ↓\n- Ingredients HK$5,000 → Cash ↓, Expenses ↑\n- Revenue HK$8,000 → Cash ↑, Revenue ↑\n\nBalance: Assets (83K) = Liabilities (30K) + Equity (53K) ✓',
    slideType: 'activity' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:6',
    slideOrder: 6,
    title: 'Capital Expenditure vs Operating Expense',
    content: 'How do businesses decide?\n\nCapital Expenditure (CapEx):\n- Long-term benefit (more than 1 year)\n- Above materiality threshold\n- Recorded as asset, depreciated over time\n\nOperating Expense (OpEx):\n- Short-term benefit (consumed within 1 year)\n- Below materiality threshold\n- Recorded as expense immediately\n\nKey factors: Materiality + Useful Life',
    slideType: 'content' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:7',
    slideOrder: 7,
    title: 'The Dual Effect Principle',
    content: 'Every transaction has at least TWO effects:\n\n1. Investment: Cash ↑ AND Owner\'s Equity ↑\n2. Loan: Cash ↑ AND Liabilities ↑\n3. Equipment purchase: Equipment ↑ AND Cash ↓\n4. Revenue: Cash ↑ AND Owner\'s Equity ↑\n5. Expense: Cash ↓ AND Owner\'s Equity ↓\n\nThe equation ALWAYS stays in balance.',
    slideType: 'content' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:8',
    slideOrder: 8,
    title: 'Comparison: SME vs. Corporation',
    content: 'Same transaction, different treatment:\n\n- Kitchen equipment:\n  Dumpling Cart → Immediate expense\n  Cathay Pacific → Capitalized as asset\n\n- Prepayment received:\n  Both → Liability (needs delivery)\n\n- Vehicle purchase:\n  Small van → Expense for SME\n  Fleet vehicle → Capital asset for corporation',
    slideType: 'content' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:9',
    slideOrder: 9,
    title: 'Financial Statement Impact',
    content: 'Dumpling Cart (After 1 month):\n- Assets: Cash HK$63,000 + Equipment HK$20,000 = HK$83,000\n- Liabilities: Bank Loan HK$30,000\n- Owner\'s Equity: Capital HK$50,000 + Revenue HK$8,000 - Expenses HK$5,000 = HK$53,000\n- Check: HK$83,000 = HK$30,000 + HK$53,000 ✓\n\nThe equation must ALWAYS balance!',
    slideType: 'content' as const,
    backgroundColor: null,
  },
  {
    storageKey: 'slide:10',
    slideOrder: 10,
    title: 'Key Takeaways',
    content: '- The accounting equation: Assets = Liabilities + Owner\'s Equity\n- Every transaction has a dual effect\n- The equation must always balance\n- Materiality and useful life determine CapEx vs OpEx\n- Business scale affects accounting treatment\n- Same principles apply from street vendors to skyscrapers\n\nNext: Practice problems and case study!',
    slideType: 'assessment' as const,
    backgroundColor: null,
  },
];

// --- Discussion Data ---

const discussionData = [
  {
    storageKey: 'discussion:cathay-vs-dumpling',
    title: 'Why Different Accounting Treatments?',
    description: 'Why does Cathay record certain purchases as assets while the street vendor treats similar purchases as expenses? Consider business scale, materiality, and asset lifespan.',
  },
  {
    storageKey: 'discussion:guiding-question',
    title: 'Guiding Question: Bubble Tea Stall Accounting',
    description: 'If you open a Kowloon City bubble tea stall with personal savings vs. bank loan, how does each choice affect your accounting equation? Try simple calculations.',
  },
];

// --- Concept Check Data ---

const conceptCheckData = [
  {
    storageKey: 'concept:accounting-equation',
    title: 'Understanding the Accounting Equation',
    prompt: 'Do you understand the fundamental accounting equation (Assets = Liabilities + Owner\'s Equity)?',
    checkType: 'thumbs' as const,
    sectionKey: 'segment1',
  },
  {
    storageKey: 'concept:classify-transactions',
    title: 'Classifying Transactions',
    prompt: 'Can you correctly classify a business transaction into assets, liabilities, or owner\'s equity?',
    checkType: 'thumbs' as const,
    sectionKey: 'segment2',
  },
  {
    storageKey: 'concept:capex-opex',
    title: 'CapEx vs OpEx Understanding',
    prompt: 'Do you understand why different businesses treat similar purchases differently?',
    checkType: 'thumbs' as const,
    sectionKey: 'segment3',
  },
  {
    storageKey: 'concept:dual-effect',
    title: 'Dual Effect Principle',
    prompt: 'Can you explain the dual effect principle in your own words?',
    checkType: 'text' as const,
    sectionKey: 'segment4',
  },
  {
    storageKey: 'concept:overall-lesson',
    title: 'Overall Lesson Understanding',
    prompt: 'How well do you understand today\'s lesson on the accounting equation?',
    checkType: 'scale' as const,
    sectionKey: 'assessment',
  },
];

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  try {
    // Create _seed_log table idempotently
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS _seed_log (
        id integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        seed_version text NOT NULL UNIQUE,
        applied_at timestamp DEFAULT now()
      )
    `);

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

    // Run seed data within a transaction
    await db.transaction(async (tx) => {
      // 1. Create student user
      const studentPasswordHash = await bcrypt.hash('student123', 10);
      const [studentUser] = await tx.insert(schema.users).values({
        username: 'student',
        email: 'student@example.com',
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        displayName: 'Demo Student',
      }).returning();

      // 2. Get admin user ID for discussions
      const adminRows = await tx
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.username, 'admin'))
        .limit(1);
      const adminId = adminRows[0]?.id ?? studentUser.id;

      // 3. Insert pre-class quiz
      const [preClassQuizRow] = await tx.insert(schema.quizzes).values({
        storageKey: preClassQuiz.storageKey,
        title: preClassQuiz.title,
        description: preClassQuiz.description,
        quizType: preClassQuiz.quizType,
      }).returning();

      for (const q of preClassQuiz.questions) {
        const [questionRow] = await tx.insert(schema.questions).values({
          storageKey: q.storageKey,
          quizId: preClassQuizRow.id,
          questionText: q.text,
          questionType: q.type,
          questionOrder: q.order,
          explanation: q.explanation,
        }).returning();

        for (const a of q.answers) {
          await tx.insert(schema.answers).values({
            questionId: questionRow.id,
            answerText: a.text,
            isCorrect: a.isCorrect,
            answerOrder: a.order,
          });
        }
      }

      // 4. Insert summative quiz
      const [summativeQuizRow] = await tx.insert(schema.quizzes).values({
        storageKey: summativeQuiz.storageKey,
        title: summativeQuiz.title,
        description: summativeQuiz.description,
        quizType: summativeQuiz.quizType,
      }).returning();

      for (const q of summativeQuiz.questions) {
        const [questionRow] = await tx.insert(schema.questions).values({
          storageKey: q.storageKey,
          quizId: summativeQuizRow.id,
          questionText: q.text,
          questionType: q.type,
          questionOrder: q.order,
          explanation: q.explanation,
        }).returning();

        for (const a of q.answers) {
          await tx.insert(schema.answers).values({
            questionId: questionRow.id,
            answerText: a.text,
            isCorrect: a.isCorrect,
            answerOrder: a.order,
          });
        }
      }

      // 5. Insert slides
      for (const slide of slideData) {
        await tx.insert(schema.slides).values({
          storageKey: slide.storageKey,
          slideOrder: slide.slideOrder,
          title: slide.title,
          content: slide.content,
          slideType: slide.slideType,
          backgroundColor: slide.backgroundColor,
        });
      }

      // 6. Insert discussions
      for (const disc of discussionData) {
        await tx.insert(schema.discussions).values({
          storageKey: disc.storageKey,
          title: disc.title,
          description: disc.description,
          createdBy: adminId,
        });
      }

      // 7. Insert concept checks
      for (const cc of conceptCheckData) {
        await tx.insert(schema.conceptChecks).values({
          storageKey: cc.storageKey,
          title: cc.title,
          prompt: cc.prompt,
          checkType: cc.checkType,
          sectionKey: cc.sectionKey,
        });
      }

      // 8. Mark seed as applied
      await tx.insert(schema.seedLog).values({
        seedVersion: SEED_VERSION,
      });
    });

    console.log(`Seed "${SEED_VERSION}" applied successfully.`);
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
