export const runtime = "nodejs";

import { auth } from "../../../../auth";
import { fetchLeetCodeProblem } from "../../../../lib/leetcode";

export async function GET(request) {
  try {
    const session = await auth();

    // Check if the user is an admin
    if (session?.user?.role !== "ADMIN") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return Response.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const problem = await fetchLeetCodeProblem(url);

    return Response.json({ success: true, problem });
  } catch (error) {
    console.error("API error fetching LeetCode problem:", error);
    // Don't expose internal stack traces to the client
    const message = error.message || "Failed to fetch problem. Please check the URL and try again.";
    return Response.json({ success: false, error: message }, { status: 400 });
  }
}
