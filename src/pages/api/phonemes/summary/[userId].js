// Simple API route to handle phoneme performance summary
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          error: "userId is required",
        });
      }

      // For now, return mock data to test the routing
      res.json({
        message: "Phoneme performance summary endpoint reached successfully",
        userId,
        status: "routing_working",
        mockData: {
          totalPhonemes: 44,
          masteredPhonemes: 15,
          strugglingPhonemes: 8,
          improvingPhonemes: 21,
        },
      });
    } catch (error) {
      console.error("Error in phoneme performance summary:", error);
      res.status(500).json({
        error: "Failed to get phoneme performance",
        details: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
