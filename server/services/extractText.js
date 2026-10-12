import { createRequire } from "module";
import mammoth from "mammoth";

// pdf-parse is CommonJS-only — load it via createRequire
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const extractText = async (file) => {
  const { mimetype, buffer } = file;

  // PDF
  if (mimetype === "application/pdf") {
    const data = await pdf(buffer);
    return cleanText(data.text);
  }

  // DOCX
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return cleanText(result.value);
  }

  // TXT
  if (mimetype === "text/plain") {
    return cleanText(buffer.toString("utf-8"));
  }

  throw new Error("Unsupported file type: " + mimetype);
};

function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}