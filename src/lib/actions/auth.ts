'use server';

import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

export async function loginUser(username: string, password: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: 'Invalid username' };
    }

    const user = result[0];
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: 'Invalid password' };
    }

    return {
      success: true,
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role.toUpperCase(),
      },
    };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  role: string = 'STUDENT'
) {
  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: 'Username already exists' };
    }

    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      return { success: false, error: 'Email already exists' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ username, email, passwordHash, role })
      .returning();

    return {
      success: true,
      user: {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role.toUpperCase(),
      },
    };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: 'Registration failed' };
  }
}
