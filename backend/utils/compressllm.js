// Compress the final payload
function compressForLLM(response) {
  return {
    t: response.title?.substring(0, 200), // truncate title
    a: response.author,
    // Only include critical file changes
    f: response.changedFiles
      .filter(f => !f.includes('test') && !f.includes('spec'))
      .slice(0, 30),
    // Compress diff by removing whitespace
    diff: response.diff.replace(/\n{3,}/g, '\n\n').substring(0, 100000) // 100KB max
  };
}

export default compressForLLM;  