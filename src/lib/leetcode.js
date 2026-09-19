import { LeetCode } from "@leetnotion/leetcode-api";

const leetcode = new LeetCode();

export async function fetchLeetCodeProblem(urlOrSlug) {
  try {
    let slug = urlOrSlug;

    // Extract slug from URL if necessary
    if (urlOrSlug.includes("leetcode.com/problems/")) {
      const match = urlOrSlug.match(/problems\/([^\/]+)/);
      if (match && match[1]) {
        slug = match[1];
      } else {
        throw new Error("Invalid LeetCode URL format");
      }
    }

    if (!slug) {
      throw new Error("Could not determine problem slug");
    }

    const problem = await leetcode.problem(slug);

    if (!problem) {
      throw new Error("Problem not found on LeetCode");
    }

    return {
      title: problem.title,
      slug: problem.titleSlug,
      difficulty: problem.difficulty,
      description: problem.content,
      examples: problem.exampleTestcases ? problem.exampleTestcases.split("\n") : [],
      constraints: problem.metaData ? JSON.parse(problem.metaData) : null,
      topics: problem.topicTags ? problem.topicTags.map((tag) => tag.name) : [],
      questionId: problem.questionId,
      url: `https://leetcode.com/problems/${problem.titleSlug}/`,
    };
  } catch (error) {
    console.error("Error fetching LeetCode problem:", error);
    throw new Error(error.message || "Failed to fetch problem from LeetCode");
  }
}
