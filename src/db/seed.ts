import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

// ── v1_initial: create the admin user ──────────────────────────────────────
const SEED_V1 = "v1_initial";

async function seedV1(db: ReturnType<typeof drizzle>) {
  const existing = await db
    .select()
    .from(schema.seedLog)
    .where(eq(schema.seedLog.seedVersion, SEED_V1))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Seed "${SEED_V1}" already applied. Skipping.`);
    return;
  }

  await db.transaction(async (tx) => {
    const passwordHash = await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD || "changeme",
      10,
    );

    await tx.insert(schema.users).values({
      username: "admin",
      email: "admin@example.com",
      passwordHash,
      role: "TEACHER",
      displayName: "Admin User",
    });

    await tx.insert(schema.seedLog).values({
      seedVersion: SEED_V1,
    });
  });

  console.log(`Seed "${SEED_V1}" applied successfully.`);
}

// ── v2_hk_environment: HK Environment Science lesson data ──────────────────
const SEED_V2 = "v2_hk_environment";

async function seedV2(db: ReturnType<typeof drizzle>) {
  const existing = await db
    .select()
    .from(schema.seedLog)
    .where(eq(schema.seedLog.seedVersion, SEED_V2))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Seed "${SEED_V2}" already applied. Skipping.`);
    return;
  }

  // Look up admin user for discussion createdBy
  const adminUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, "admin"))
    .limit(1);

  if (adminUsers.length === 0) {
    throw new Error("Admin user not found. Run v1_initial seed first.");
  }
  const adminId = adminUsers[0].id;

  await db.transaction(async (tx) => {
    // ── Slides ──────────────────────────────────────────────────────────
    await tx.insert(schema.slides).values([
      {
        storageKey: "slide:1",
        slideOrder: 1,
        title: "HK Environment Science: Pollution Control & Waste Management",
        content:
          "A comprehensive lesson on Hong Kong's environmental challenges and solutions\nUniversity Year 1 | Environmental Science",
        slideType: "title",
      },
      {
        storageKey: "slide:2",
        slideOrder: 2,
        title: "Intended Learning Outcomes",
        content:
          "- Compare pollution control strategies in HK with global best practices (Analyze)\n- Evaluate waste management policies in reducing landfill dependency (Evaluate)\n- Design localized solutions for household waste reduction using circular economy (Create)\n- Analyze case studies of pollution crises to propose mitigation plans (Analyze)",
        slideType: "content",
      },
      {
        storageKey: "slide:3",
        slideOrder: 3,
        title: "Pre-Class Preparation",
        content:
          "- Pre-Video: Watch HK EPD video on Waste Management (10 min)\n- Pre-Test: 5-question quiz on basic pollution terms\n- Guiding Questions:\n  - What are the three biggest waste management challenges in HK?\n  - How does a waste hierarchy pyramid work?",
        slideType: "content",
      },
      {
        storageKey: "slide:4",
        slideOrder: 4,
        title: "Introduction: The Waste Crisis",
        content:
          "- Hook: Timelapse of HK landfills reaching capacity\n- Key question: How will HK manage waste when all landfills close by 2035?\n- Pre-test review: Discuss common misconceptions\n- Real-world: 2023 mandatory food waste recycling trial",
        slideType: "content",
      },
      {
        storageKey: "slide:5",
        slideOrder: 5,
        title: "Pollution Control in Hong Kong",
        content:
          "- Air pollution: Vehicle emissions, industrial output\n- Water pollution: Victoria Harbour microplastics\n- Land pollution: Landfill dependency\n- Think-Pair-Share: Why is vehicle emissions regulation harder in HK than Berlin?",
        slideType: "activity",
      },
      {
        storageKey: "slide:6",
        slideOrder: 6,
        title: "Waste Hierarchy Pyramid",
        content:
          "- Refuse: Avoid unnecessary items\n- Reduce: Minimize waste generation\n- Reuse: Extend product lifecycle\n- Recycle: Process materials into new products\n- Recover: Extract energy from waste\n- Dispose: Landfill as last resort\n- Question: Is HK succeeding at each level?",
        slideType: "content",
      },
      {
        storageKey: "slide:7",
        slideOrder: 7,
        title: "Case Study: HK Plastic Crisis 2017",
        content:
          "- 8 million plastic particles per km² in HK bay\n- One of the highest concentrations globally\n- Group work: Mitigate microplastic pollution using frameworks\n- Consider: Source reduction, policy intervention, cleanup strategies",
        slideType: "activity",
      },
      {
        storageKey: "slide:8",
        slideOrder: 8,
        title: "Peer Teaching & Formative Quiz",
        content:
          "- Groups present solutions for one waste stream:\n  - Plastic waste\n  - Textile waste\n  - Food waste\n- Kahoot quiz: 10 questions on pollution control policies\n- Covers: Plastic Bag Levy, Food Waste Recycling Trials, waste hierarchy",
        slideType: "assessment",
      },
      {
        storageKey: "slide:9",
        slideOrder: 9,
        title: "Marine Pollution Workshop",
        content:
          "- Case: 2018 sunken vessel oil spill in Mirs Bay\n- Propose mitigation plan using Marine Department framework\n- Consider: Immediate response, containment, cleanup, prevention\n- Stakeholder analysis: Government, fishing industry, environmental groups",
        slideType: "activity",
      },
      {
        storageKey: "slide:10",
        slideOrder: 10,
        title: "Synthesis & Assessment",
        content:
          "- Post-test: 5 questions on new concepts\n- Reflective Discussion: How might HK adapt Sweden's zero-waste model?\n- Assignment: 1,000-word Waste Reduction Proposal for HK\n- Rubric: Policy analysis (30%), Solution creativity (30%), Case study application (40%)\n- Next session: Air Pollution and Policy Advocacy",
        slideType: "assessment",
      },
    ]);

    // ── Quizzes ─────────────────────────────────────────────────────────
    // Quiz 1: Pre-Test
    const [quiz1] = await tx
      .insert(schema.quizzes)
      .values({
        storageKey: "quiz:pre-test",
        title: "Pre-Test: Basic Pollution Terms",
        description:
          "Test your knowledge of basic pollution and waste management terminology.",
        quizType: "multiple_choice",
      })
      .returning();

    // Quiz 2: Formative Quiz
    const [quiz2] = await tx
      .insert(schema.quizzes)
      .values({
        storageKey: "quiz:formative",
        title: "Formative Quiz: Pollution Control Policies in HK",
        description:
          "Test your understanding of HK pollution control policies and waste management strategies.",
        quizType: "multiple_choice",
      })
      .returning();

    // Quiz 3: Post-Test
    const [quiz3] = await tx
      .insert(schema.quizzes)
      .values({
        storageKey: "quiz:post-test",
        title: "Post-Test: New Concepts Review",
        description:
          "Review new concepts from the lesson on pollution control and waste management.",
        quizType: "multiple_choice",
      })
      .returning();

    // ── Questions & Answers ─────────────────────────────────────────────
    // Pre-Test Questions
    const [preQ1] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz1.id,
        storageKey: "question:pre-1",
        questionText: "What is landfill leachate?",
        questionOrder: 1,
        questionType: "multiple_choice",
        explanation:
          "Leachate is the liquid that drains from a landfill, carrying dissolved contaminants from the waste.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: preQ1.id,
        answerText:
          "Liquid that drains from a landfill, carrying dissolved contaminants",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: preQ1.id,
        answerText: "Gas emitted from waste decomposition",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: preQ1.id,
        answerText: "Solid waste compacted in layers",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: preQ1.id,
        answerText: "Cover material used to seal landfills",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [preQ2] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz1.id,
        storageKey: "question:pre-2",
        questionText: "What is the waste hierarchy?",
        questionOrder: 2,
        questionType: "multiple_choice",
        explanation:
          "The waste hierarchy ranks strategies from most to least preferred for managing waste.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: preQ2.id,
        answerText:
          "A ranking of waste management strategies from most to least preferred",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: preQ2.id,
        answerText: "A classification system for types of waste",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: preQ2.id,
        answerText: "A timeline of waste production levels",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: preQ2.id,
        answerText: "A pricing structure for waste disposal",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [preQ3] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz1.id,
        storageKey: "question:pre-3",
        questionText: "What does circular economy mean?",
        questionOrder: 3,
        questionType: "multiple_choice",
        explanation:
          "A circular economy eliminates waste through continual use of resources.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: preQ3.id,
        answerText:
          "An economic system aimed at eliminating waste through continual resource use",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: preQ3.id,
        answerText: "An economy based on circular trade routes",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: preQ3.id,
        answerText: "A financial model for waste management companies",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: preQ3.id,
        answerText: "A system where waste is exported and re-imported",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [preQ4] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz1.id,
        storageKey: "question:pre-4",
        questionText: "What is microplastic pollution?",
        questionOrder: 4,
        questionType: "multiple_choice",
        explanation:
          "Microplastics are plastic particles smaller than 5mm that pollute water and soil.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: preQ4.id,
        answerText: "Pollution caused by plastic particles smaller than 5mm",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: preQ4.id,
        answerText: "Pollution from microscopic organisms in plastic",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: preQ4.id,
        answerText: "Pollution visible only under a microscope",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: preQ4.id,
        answerText: "Pollution from small plastic factories",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [preQ5] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz1.id,
        storageKey: "question:pre-5",
        questionText: "What are the three main types of pollution?",
        questionOrder: 5,
        questionType: "multiple_choice",
        explanation:
          "The three primary categories are air, water, and land pollution.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: preQ5.id,
        answerText: "Air, water, and land pollution",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: preQ5.id,
        answerText: "Plastic, chemical, and noise pollution",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: preQ5.id,
        answerText: "Industrial, agricultural, and domestic pollution",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: preQ5.id,
        answerText: "Surface, underground, and atmospheric pollution",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    // Formative Quiz Questions
    const [formQ1] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-1",
        questionText: "Which HK policy targets reduce in the waste hierarchy?",
        questionOrder: 1,
        questionType: "multiple_choice",
        explanation:
          "The Plastic Bag Levy directly targets reduce by discouraging single-use plastic bags.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ1.id,
        answerText: "Plastic Bag Levy",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ1.id,
        answerText: "Landfill expansion",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ1.id,
        answerText: "Waste-to-energy incineration",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ1.id,
        answerText: "Ocean cleanup program",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ2] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-2",
        questionText: "What is the primary waste disposal method in Hong Kong?",
        questionOrder: 2,
        questionType: "multiple_choice",
        explanation:
          "Hong Kong primarily relies on landfilling for waste disposal.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ2.id,
        answerText: "Landfilling",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ2.id,
        answerText: "Incineration",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ2.id,
        answerText: "Recycling",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ2.id,
        answerText: "Composting",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ3] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-3",
        questionText:
          "By what year are all of HK landfills expected to reach capacity?",
        questionOrder: 3,
        questionType: "multiple_choice",
        explanation:
          "All three strategic landfills are expected to reach capacity by 2035.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ3.id,
        answerText: "2035",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ3.id,
        answerText: "2025",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ3.id,
        answerText: "2050",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ3.id,
        answerText: "2040",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ4] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-4",
        questionText: "What was the 2017 Hong Kong Plastic Crisis measurement?",
        questionOrder: 4,
        questionType: "multiple_choice",
        explanation:
          "The 2017 study found 8 million plastic particles per km² in Hong Kong waters.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ4.id,
        answerText: "8 million plastic particles per km²",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ4.id,
        answerText: "800,000 plastic particles per km²",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ4.id,
        answerText: "80 million plastic particles per km²",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ4.id,
        answerText: "8,000 plastic particles per km²",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ5] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-5",
        questionText:
          "Which waste hierarchy level involves refusing to use unnecessary items?",
        questionOrder: 5,
        questionType: "multiple_choice",
        explanation:
          "Refuse is the top level of the waste hierarchy, meaning to avoid unnecessary items altogether.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ5.id,
        answerText: "Refuse",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ5.id,
        answerText: "Reduce",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ5.id,
        answerText: "Reuse",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ5.id,
        answerText: "Recycle",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ6] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-6",
        questionText:
          "What does the recover level of the waste hierarchy involve?",
        questionOrder: 6,
        questionType: "multiple_choice",
        explanation:
          "Recover involves extracting energy or materials from waste before disposal.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ6.id,
        answerText: "Extracting energy or materials from waste",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ6.id,
        answerText: "Recovering land from landfill sites",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ6.id,
        answerText: "Recovering costs from waste disposal",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ6.id,
        answerText: "Reclaiming recyclable materials only",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ7] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-7",
        questionText:
          "HK 2023 food waste recycling trial targeted which sector?",
        questionOrder: 7,
        questionType: "multiple_choice",
        explanation:
          "The 2023 trial targeted restaurants for mandatory food waste recycling.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ7.id,
        answerText: "Restaurants",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ7.id,
        answerText: "Schools",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ7.id,
        answerText: "Hospitals",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ7.id,
        answerText: "Office buildings",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ8] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-8",
        questionText:
          "Which marine pollution event occurred in Mirs Bay in 2018?",
        questionOrder: 8,
        questionType: "multiple_choice",
        explanation:
          "In 2018, a sunken vessel caused an oil spill in Mirs Bay.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ8.id,
        answerText: "Sunken vessel oil spill",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ8.id,
        answerText: "Red tide outbreak",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ8.id,
        answerText: "Plastic waste dumping",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ8.id,
        answerText: "Chemical factory leak",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ9] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-9",
        questionText:
          "What type of economy aims to eliminate waste through continual resource use?",
        questionOrder: 9,
        questionType: "multiple_choice",
        explanation:
          "Circular economy aims to eliminate waste through continual resource use.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ9.id,
        answerText: "Circular economy",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ9.id,
        answerText: "Linear economy",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ9.id,
        answerText: "Sharing economy",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ9.id,
        answerText: "Green economy",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [formQ10] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz2.id,
        storageKey: "question:form-10",
        questionText: "Which country is known as a zero-waste society model?",
        questionOrder: 10,
        questionType: "multiple_choice",
        explanation:
          "Sweden is recognized as a zero-waste society model due to its advanced waste-to-energy and recycling programs.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: formQ10.id,
        answerText: "Sweden",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: formQ10.id,
        answerText: "Japan",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: formQ10.id,
        answerText: "Germany",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: formQ10.id,
        answerText: "Singapore",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    // Post-Test Questions
    const [postQ1] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz3.id,
        storageKey: "question:post-1",
        questionText:
          "Which principle is central to circular economy in household waste management?",
        questionOrder: 1,
        questionType: "multiple_choice",
        explanation:
          "The central principle of circular economy is keeping materials in use for as long as possible.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: postQ1.id,
        answerText: "Keeping materials in use for as long as possible",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: postQ1.id,
        answerText: "Maximizing waste collection efficiency",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: postQ1.id,
        answerText: "Increasing landfill capacity",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: postQ1.id,
        answerText: "Exporting waste to other regions",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [postQ2] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz3.id,
        storageKey: "question:post-2",
        questionText:
          "What is the most effective strategy in the waste hierarchy?",
        questionOrder: 2,
        questionType: "multiple_choice",
        explanation:
          "Refuse is the most effective strategy as it prevents waste from being created in the first place.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: postQ2.id,
        answerText: "Refuse",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: postQ2.id,
        answerText: "Recycle",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: postQ2.id,
        answerText: "Recover",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: postQ2.id,
        answerText: "Dispose",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [postQ3] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz3.id,
        storageKey: "question:post-3",
        questionText:
          "How can individuals apply circular economy principles at home?",
        questionOrder: 3,
        questionType: "multiple_choice",
        explanation:
          "Individuals can apply circular economy principles by repairing, reusing, and composting items instead of discarding them.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: postQ3.id,
        answerText:
          "By repairing, reusing, and composting items instead of discarding them",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: postQ3.id,
        answerText: "By buying more recycled products",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: postQ3.id,
        answerText: "By using larger waste bins",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: postQ3.id,
        answerText: "By relying on government recycling programs",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [postQ4] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz3.id,
        storageKey: "question:post-4",
        questionText: "What is closed-loop recycling?",
        questionOrder: 4,
        questionType: "multiple_choice",
        explanation:
          "Closed-loop recycling is a system where a product is recycled into the same type of product.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: postQ4.id,
        answerText:
          "A system where a product is recycled into the same type of product",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: postQ4.id,
        answerText: "A recycling process that never ends",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: postQ4.id,
        answerText: "A system where waste is recycled once and then landfilled",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: postQ4.id,
        answerText: "A financial model for recycling companies",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    const [postQ5] = await tx
      .insert(schema.questions)
      .values({
        quizId: quiz3.id,
        storageKey: "question:post-5",
        questionText:
          "Why is comparing HK waste policies to global best practices important?",
        questionOrder: 5,
        questionType: "multiple_choice",
        explanation:
          "Comparing policies helps identify gaps and opportunities for improvement in local strategies.",
      })
      .returning();

    await tx.insert(schema.answers).values([
      {
        questionId: postQ5.id,
        answerText:
          "It helps identify gaps and opportunities for improvement in local strategies",
        isCorrect: true,
        answerOrder: 1,
      },
      {
        questionId: postQ5.id,
        answerText: "It allows HK to copy other countries policies exactly",
        isCorrect: false,
        answerOrder: 2,
      },
      {
        questionId: postQ5.id,
        answerText: "It proves HK policies are superior",
        isCorrect: false,
        answerOrder: 3,
      },
      {
        questionId: postQ5.id,
        answerText: "It is not important as each city is unique",
        isCorrect: false,
        answerOrder: 4,
      },
    ]);

    // ── Discussions ─────────────────────────────────────────────────────
    await tx.insert(schema.discussions).values([
      {
        storageKey: "discussion:vehicle-emissions",
        title: "Think-Pair-Share: Vehicle Emissions Regulation",
        description:
          "Why is vehicle emissions regulation harder in HK than in Berlin? Consider factors like urban density, cross-border traffic, and enforcement challenges.",
        createdBy: adminId,
      },
      {
        storageKey: "discussion:zero-waste",
        title: "Reflective Discussion: Zero-Waste Society",
        description:
          "How might Hong Kong adapt Sweden's zero-waste society model? What cultural, geographic, and economic factors would influence this adaptation?",
        createdBy: adminId,
      },
      {
        storageKey: "discussion:waste-hierarchy-success",
        title: "Waste Hierarchy Success in HK",
        description:
          "Is HK succeeding at each level of the waste hierarchy (refuse, reduce, reuse, recycle, recover, dispose)? Share examples for each level.",
        createdBy: adminId,
      },
    ]);

    // ── Concept Checks ──────────────────────────────────────────────────
    await tx.insert(schema.conceptChecks).values([
      {
        storageKey: "concept:waste-hierarchy",
        title: "Waste Hierarchy Understanding",
        prompt:
          "Do you understand the waste hierarchy pyramid and how it applies to Hong Kong?",
        checkType: "thumbs",
        sectionKey: "waste-hierarchy",
      },
      {
        storageKey: "concept:circular-economy",
        title: "Circular Economy Comprehension",
        prompt:
          "Can you explain circular economy principles in the context of household waste?",
        checkType: "thumbs",
        sectionKey: "synthesis",
      },
      {
        storageKey: "concept:case-study-confidence",
        title: "Case Study Confidence",
        prompt:
          "How confident are you in analyzing pollution case studies and proposing mitigation plans?",
        checkType: "scale",
        sectionKey: "case-study",
      },
    ]);

    // ── Mark seed as applied ────────────────────────────────────────────
    await tx.insert(schema.seedLog).values({
      seedVersion: SEED_V2,
    });
  });

  console.log(`Seed "${SEED_V2}" applied successfully.`);
}

// ── Main seed runner ───────────────────────────────────────────────────────
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

    // Run each seed version in order
    await seedV1(db);
    await seedV2(db);
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
