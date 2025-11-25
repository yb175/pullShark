function cleanDiff(diff) {
  const lines = diff.split("\n");
  const cleaned = [];
  let contextCount = 0;
  const MAX_CONTEXT_LINES = 3; // Limit context lines

  for (let line of lines) {
    // Skip all metadata
    if (line.startsWith("diff --git") || line.startsWith("index ") || 
        line.startsWith("--- ") || line.startsWith("+++ ")) continue;
    
    // Skip binary files completely
    if (line.includes("Binary file")) continue;

    // Skip generated files more aggressively
    if (line.includes("package-lock.json") || line.includes("yarn.lock") || 
        line.includes("pnpm-lock.yaml") || line.includes("dist/") || 
        line.includes("build/") || line.includes("node_modules/") ||
        line.includes(".min.js") || line.includes(".bundle.js")) {
      continue;
    }

    // Handle +/- lines
    if (line.startsWith("+") || line.startsWith("-")) {
      // More aggressive comment removal
      line = line
        .replace(/\/\/.*$/g, "")
        .replace(/#.*$/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/".*?"/g, '""') // Remove string literals
        .replace(/'.*?'/g, "''")
        .trim();

      if (line === "+" || line === "-" || line.length <= 2) continue;
      
      // Truncate very long lines
      if (line.length > 200) {
        line = line.substring(0, 200) + "...";
      }
      
      cleaned.push(line);
      contextCount = 0;
      continue;
    }

    // Limit context lines between changes
    if (line.startsWith(" ")) {
      if (contextCount < MAX_CONTEXT_LINES && line.trim().length > 0) {
        cleaned.push(line);
        contextCount++;
      }
      continue;
    }

    // Keep only essential hunk headers
    if (line.startsWith("@@")) {
      cleaned.push(line);
      contextCount = 0;
    }
  }

  return cleaned.join("\n");
}
export default cleanDiff