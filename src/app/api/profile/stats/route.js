export const runtime = "nodejs";

import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";

function dayKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, username: true, image: true, description: true },
    });
    if (!user) return Response.json({ error: "User not found." }, { status: 404 });

    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const yearStart = new Date(todayUtc);
    yearStart.setUTCDate(yearStart.getUTCDate() - 364);

    const [totalQuestions, acceptedQuestions, statusGroups, activitySubmissions, recentSubmissions, violations, giveUps, difficultyTotals] = await Promise.all([
      prisma.question.count(),
      prisma.submission.findMany({
        where: { userId: user.id, status: { equals: "Accepted", mode: "insensitive" }, questionId: { not: null } },
        distinct: ["questionId"],
        select: { questionId: true, problem: { select: { difficulty: true } } },
      }),
      prisma.submission.groupBy({ by: ["status"], where: { userId: user.id }, _count: { _all: true } }),
      prisma.submission.findMany({
        where: { userId: user.id, createdAt: { gte: yearStart } },
        select: { createdAt: true },
      }),
      prisma.submission.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          status: true,
          language: true,
          runtimeMs: true,
          createdAt: true,
          problem: { select: { id: true, title: true, questionNumber: true, difficulty: true } },
        },
      }),
      prisma.session.aggregate({ where: { userId: user.id }, _sum: { violationCount: true } }),
      prisma.session.count({
        where: {
          userId: user.id,
          completedAt: { not: null },
          submissions: { none: { status: { equals: "Accepted", mode: "insensitive" } } },
        },
      }),
      prisma.question.groupBy({ by: ["difficulty"], _count: { _all: true } }),
    ]);

    const difficultyCounts = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 },
    };
    for (const question of acceptedQuestions) {
      const difficulty = question.problem?.difficulty?.toLowerCase();
      if (Object.hasOwn(difficultyCounts, difficulty)) difficultyCounts[difficulty].solved += 1;
    }
    for (const group of difficultyTotals) {
      const difficulty = group.difficulty.toLowerCase();
      if (Object.hasOwn(difficultyCounts, difficulty)) difficultyCounts[difficulty].total = group._count._all;
    }

    const acceptedCount = statusGroups.reduce((total, group) => total + (group.status.toLowerCase() === "accepted" ? group._count._all : 0), 0);
    const timeoutCount = statusGroups.reduce((total, group) => {
      const status = group.status.toLowerCase();
      return total + (status.includes("time limit") || status.includes("timeout") ? group._count._all : 0);
    }, 0);
    const activityCounts = new Map();
    for (const submission of activitySubmissions) {
      const key = dayKey(submission.createdAt);
      activityCounts.set(key, (activityCounts.get(key) || 0) + 1);
    }

    const activeDates = new Set(activityCounts.keys());
    const yesterday = new Date(todayUtc);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    let currentStreak = 0;
    let streakDate = activeDates.has(dayKey(todayUtc)) ? todayUtc : yesterday;
    while (activeDates.has(dayKey(streakDate))) {
      currentStreak += 1;
      streakDate = new Date(streakDate);
      streakDate.setUTCDate(streakDate.getUTCDate() - 1);
    }
    let longestStreak = 0;
    let runningStreak = 0;
    for (let index = 0; index < 365; index += 1) {
      const date = new Date(yearStart);
      date.setUTCDate(date.getUTCDate() + index);
      if (activeDates.has(dayKey(date))) {
        runningStreak += 1;
        longestStreak = Math.max(longestStreak, runningStreak);
      } else {
        runningStreak = 0;
      }
    }

    const startDate = new Date(yearStart);
    startDate.setUTCDate(startDate.getUTCDate() - ((startDate.getUTCDay() + 6) % 7));
    const activityDays = Array.from({ length: 371 }, (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + index);
      const count = activityCounts.get(dayKey(date)) || 0;
      return {
        date: dayKey(date),
        count,
        future: date > todayUtc || date < yearStart,
        level: count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4,
      };
    });

    return Response.json({
      user: { name: user.name, email: user.email, username: user.username, image: user.image, description: user.description },
      stats: {
        solvedCount: acceptedQuestions.length,
        totalQuestions,
        completionPercent: totalQuestions ? Math.round((acceptedQuestions.length / totalQuestions) * 100) : 0,
        difficultyCounts,
        acceptedCount,
        timeoutCount,
        violationCount: violations._sum.violationCount || 0,
        giveUpCount: giveUps,
        totalSubmissions: activitySubmissions.length,
        activeDays: activityCounts.size,
        currentStreak,
        longestStreak,
        activityDays,
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return Response.json({ error: "Could not load profile statistics." }, { status: 500 });
  }
}