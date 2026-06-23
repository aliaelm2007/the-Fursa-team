export default async function handler(req, res) {
  const response = await fetch(
    "https://api.airtable.com/v0/appNBBFAGomb1H6Ba/Waitlist",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
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
  res.status(response.status).json(data);
}
