export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const response = await fetch(
    'https://api.airtable.com/v0/appNBBFAGomb1H6Ba/Partners',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: req.body,
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return res.status(response.status).json(data);
}
