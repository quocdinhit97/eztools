'use client';

interface JsonHighlightProps {
  json: string;
  className?: string;
}

export function JsonHighlight({ json, className = '' }: JsonHighlightProps) {
  const syntaxHighlight = (jsonString: string) => {
    // Escape HTML
    jsonString = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Apply syntax highlighting with color classes
    return jsonString.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-[var(--color-code-number)]'; // Numbers
        
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            // Property names (keys)
            cls = 'text-[var(--color-code-property)] font-semibold';
          } else {
            // String values
            cls = 'text-[var(--color-code-string)]';
          }
        } else if (/true|false/.test(match)) {
          // Booleans
          cls = 'text-[var(--color-code-keyword)]';
        } else if (/null/.test(match)) {
          // Null
          cls = 'text-[var(--color-text-tertiary)]';
        }
        
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <pre 
      className={`overflow-auto font-mono text-[15px] leading-relaxed text-[var(--color-text-primary)] ${className}`}
      dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
    />
  );
}
