import React from "react";

/**
 * Render text with simple markup:
 *   **word**  → bold + red (highlighted, like a yellow-highlighter on paper)
 *   *word*    → italic
 * Newlines become <br/>.
 */
export function RichText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return <span className={className}>{renderInline(text)}</span>;
}

export function renderInline(text: string): React.ReactNode[] {
  if (!text) return [];
  const out: React.ReactNode[] = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, li) => {
    out.push(...parseLine(line, `${li}`));
    if (li < lines.length - 1) out.push(<br key={`br-${li}`} />);
  });
  return out;
}

function parseLine(line: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // Tokenize on **...** first, then *...*
  const regex = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > lastIndex) {
      out.push(line.slice(lastIndex, m.index));
    }
    const token = m[0];
    if (token.startsWith("**")) {
      out.push(
        <strong
          key={`${keyPrefix}-b-${i++}`}
          className="font-bold text-destructive"
        >
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      out.push(
        <em key={`${keyPrefix}-i-${i++}`} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = m.index + token.length;
  }
  if (lastIndex < line.length) out.push(line.slice(lastIndex));
  return out;
}

/** Strip markup for previews / share text. */
export function stripMarkup(text: string): string {
  return text.replace(/\*\*([^*\n]+)\*\*/g, "$1").replace(/\*([^*\n]+)\*/g, "$1");
}