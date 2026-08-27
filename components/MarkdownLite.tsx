// Minimal markdown renderer for FAQ answers.
// Handles only what this content actually uses: paragraphs, **bold**,
// numbered lists ("1. "), and bullet lists ("- "). Not a general-purpose
// markdown parser -- kept intentionally small instead of adding a library.

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function MarkdownLite({ markdown }: { markdown: string }) {
  const blocks = markdown.trim().split(/\n\n+/)

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter(Boolean)
        const isNumbered = lines.every((l) => /^\d+\.\s/.test(l.trim()))
        const isBulleted = lines.every((l) => /^-\s/.test(l.trim()))

        if (isNumbered) {
          return (
            <ol key={i} className="list-decimal list-inside space-y-2">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\d+\.\s/, ''))}</li>
              ))}
            </ol>
          )
        }

        if (isBulleted) {
          return (
            <ul key={i} className="list-disc list-inside space-y-2">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^-\s/, ''))}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i} className="leading-relaxed">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}
