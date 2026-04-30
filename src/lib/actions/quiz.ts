'use server';

import { db } from '@/db';
import { quizzes, questions, answers, quizAttempts, questionResponses } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { routes } from '@/lib/routes';

export async function getQuiz(id: number) {
  try {
    const quizRows = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .limit(1);

    if (quizRows.length === 0) {
      return { success: false, error: 'Quiz not found' };
    }

    const quiz = quizRows[0];

    const questionRows = await db
      .select({
        question: questions,
        answer: answers,
      })
      .from(questions)
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .where(eq(questions.quizId, id))
      .orderBy(questions.questionOrder, answers.answerOrder);

    const questionsMap = new Map<number, typeof questions.$inferSelect & { answers: typeof answers.$inferSelect[] }>();

    for (const row of questionRows) {
      const q = row.question;
      if (!questionsMap.has(q.id)) {
        questionsMap.set(q.id, { ...q, answers: [] });
      }
      if (row.answer) {
        questionsMap.get(q.id)!.answers.push(row.answer);
      }
    }

    return {
      success: true,
      data: {
        quiz,
        questions: Array.from(questionsMap.values()),
      },
    };
  } catch (error) {
    console.error('Failed to fetch quiz:', error);
    return { success: false, error: 'Failed to fetch quiz' };
  }
}

export async function getAllQuizzes() {
  try {
    const allQuizzes = await db
      .select()
      .from(quizzes)
      .orderBy(desc(quizzes.createdAt));

    return { success: true, data: allQuizzes };
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
    return { success: false, error: 'Failed to fetch quizzes' };
  }
}

export async function submitQuizAttempt(
  userId: number,
  quizId: number,
  responses: { questionId: number; answerId?: number; textResponse?: string }[]
) {
  try {
    const questionRows = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));

    const totalQuestions = questionRows.length;

    // Determine correct answers for each question
    const correctAnswerMap = new Map<number, number | null>();
    for (const question of questionRows) {
      const correctAnswers = await db
        .select({ id: answers.id })
        .from(answers)
        .where(eq(answers.questionId, question.id))
        .limit(1);

      correctAnswerMap.set(question.id, correctAnswers.length > 0 ? correctAnswers[0].id : null);
    }

    let score = 0;
    const responseInserts: typeof questionResponses.$inferInsert[] = [];

    // Create the attempt first
    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        userId,
        quizId,
        score: 0,
        totalQuestions,
      })
      .returning();

    for (const response of responses) {
      const isCorrect = response.answerId != null && response.answerId === correctAnswerMap.get(response.questionId);
      if (isCorrect) {
        score++;
      }

      responseInserts.push({
        attemptId: attempt.id,
        questionId: response.questionId,
        answerId: response.answerId ?? null,
        textResponse: response.textResponse ?? null,
        isCorrect: isCorrect ?? false,
      });
    }

    // Insert all question responses
    await db.insert(questionResponses).values(responseInserts);

    // Update the attempt with the final score
    await db
      .update(quizAttempts)
      .set({ score, completedAt: new Date() })
      .where(eq(quizAttempts.id, attempt.id));

    revalidatePath(routes.quizzes);

    return { success: true, data: { score, totalQuestions } };
  } catch (error) {
    console.error('Failed to submit quiz attempt:', error);
    return { success: false, error: 'Failed to submit quiz attempt' };
  }
}

export async function getQuizResults(quizId: number) {
  try {
    const results = await db
      .select({
        attempt: quizAttempts,
        user: {
          id: quizAttempts.userId,
          username: quizAttempts.userId,
        },
      })
      .from(quizAttempts)
      .innerJoin(
        // We need to join with users table, so let's use a proper approach
        db.select({
          id: quizAttempts.userId,
        }).from(quizAttempts).as('_sub'),
        eq(quizAttempts.id, quizAttempts.id)
      )
      .where(eq(quizAttempts.quizId, quizId))
      .orderBy(desc(quizAttempts.completedAt));

    // Simpler approach: fetch attempts then fetch users
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId))
      .orderBy(desc(quizAttempts.completedAt));

    const userIds = [...new Set(attempts.map((a) => a.userId))];

    if (userIds.length === 0) {
      return { success: true, data: [] };
    }

    const { users } = await import('@/db/schema');
    const userList = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userIds[0])); // We'll fetch all users below

    // Fetch all relevant users in one query
    const allUsers = await db.select().from(users);

    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const data = attempts.map((attempt) => ({
      attempt,
      user: userMap.get(attempt.userId) ?? null,
    }));

    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch quiz results:', error);
    return { success: false, error: 'Failed to fetch quiz results' };
  }
}
