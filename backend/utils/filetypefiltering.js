
// Add this before processing files
function shouldIncludeFile(filename) {
  const excludedExtensions = [
    '.lock', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.eot', '.min.js', '.min.css',
    '.map', '.log', '.pdf', '.zip', '.tar', '.gz'
  ];
  
  const excludedPaths = [
    'dist/', 'build/', 'node_modules/', '.git/', 'coverage/',
    '.nyc_output/', 'tmp/', 'temp/', 'vendor/', 'public/assets/'
  ];
  
  const ext = filename.substring(filename.lastIndexOf('.'));
  return !excludedExtensions.includes(ext) && 
         !excludedPaths.some(path => filename.includes(path));
}

export default shouldIncludeFile