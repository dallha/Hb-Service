export function JsonLd({ data }: { data: Record<string, any> }) {
  // Sanitize the JSON string to prevent XSS vulnerabilities
  // Replaces < with \u003c
  const sanitizedData = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedData }}
    />
  );
}
