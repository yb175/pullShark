import shouldIncludeFile from "./filetypefiltering.js";
// Prioritize important files
function prioritizeFiles(files) {
  return files
    .filter(f => shouldIncludeFile(f.filename))
    .sort((a, b) => {
      const priorityExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs'];
      const aExt = a.filename.substring(a.filename.lastIndexOf('.'));
      const bExt = b.filename.substring(b.filename.lastIndexOf('.'));
      
      const aScore = priorityExtensions.includes(aExt) ? 1 : 0;
      const bScore = priorityExtensions.includes(bExt) ? 1 : 0;
      
      return bScore - aScore;
    })
    .slice(0, 50); // Limit to top 50 files
}

export default prioritizeFiles;