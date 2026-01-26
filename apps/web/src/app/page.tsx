export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  let data: any = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${baseUrl}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    data = await res.json();
  } catch (e: any) {
    error = e?.message ?? 'Unknown error';
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Booking Marketplace</h1>

      <h2>API Health</h2>
      {error ? (
        <pre style={{ color: 'crimson' }}>{error}</pre>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </main>
  );
}
