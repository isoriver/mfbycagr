/** Injects a JSON-LD <script> block. Safe: content is our own structured object. */
export function StructuredData({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
