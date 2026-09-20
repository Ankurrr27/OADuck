function cleanValue(value) {
  let cleaned = value.trim();
  if (!cleaned) return "";

  // LeetCode commonly formats examples as `x = 121` or `nums = [..], target = 9`.
  // For a single assignment, stdin should contain only the value.
  const assignments = cleaned.split(/\s*,\s*(?=[A-Za-z_][\w]*\s*=)/);
  if (assignments.length === 1 && assignments[0].includes("=")) {
    cleaned = assignments[0].slice(assignments[0].indexOf("=") + 1).trim();
  }
  return cleaned.replace(/^```(?:text|plaintext)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

export function parseLeetCodeExamples(description = "") {
  const blocks = [...String(description).matchAll(/(?:^|\n)\s*Example\s*\d+\s*:\s*([\s\S]*?)(?=\n\s*Example\s*\d+\s*:|$)/gi)];
  return blocks.flatMap((match) => {
    const block = match[1];
    const inputMatch = block.match(/(?:^|\n)\s*Input\s*:\s*([\s\S]*?)(?=\n\s*Output\s*:)/i);
    const outputMatch = block.match(/(?:^|\n)\s*Output\s*:\s*([\s\S]*?)(?=\n\s*Explanation\s*:|$)/i);
    if (!inputMatch || !outputMatch) return [];
    return [{ input: cleanValue(inputMatch[1]), expectedOutput: cleanValue(outputMatch[1]), isSample: true }];
  }).filter((testCase) => testCase.input && testCase.expectedOutput);
}
