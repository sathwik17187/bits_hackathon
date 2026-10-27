/**
 * Safe, reliable file downloader utility for browser environments.
 * Prevents 0-byte (empty file) downloads by:
 * 1. Attaching anchor to document.body prior to click dispatch
 * 2. Prepending UTF-8 BOM (\uFEFF) for CSV and text documents
 * 3. Safely delaying URL.revokeObjectURL to avoid early garbage collection
 */
export const downloadFile = (filename, content, mimeType = 'text/plain;charset=utf-8') => {
  if (content === undefined || content === null || content === '') {
    console.error(`[downloadFile] Refused to download empty file: ${filename}`);
    return false;
  }

  try {
    // Add UTF-8 BOM so spreadsheet viewers and text editors properly render encoding
    const withBom = (mimeType.includes('csv') || mimeType.includes('text'))
      ? '\uFEFF' + content
      : content;

    const blob = new Blob([withBom], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Delay cleanup to ensure browser flushes download stream to disk
    setTimeout(() => {
      try {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      } catch (err) {
        // Ignored
      }
    }, 400);

    return true;
  } catch (err) {
    console.error(`[downloadFile] Download failed for ${filename}:`, err);
    return false;
  }
};
