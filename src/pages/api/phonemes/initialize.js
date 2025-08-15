// Simple API route to handle phoneme initialization without external dependencies
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

  if (req.method === "POST") {
    try {
      const { userId, phonemes } = req.body;

      if (!userId || !phonemes || !Array.isArray(phonemes)) {
        return res.status(400).json({
          error: "userId and phonemes array are required",
        });
      }

      // For now, just return success to test the routing
      res.json({
        message: "Phonemes initialization endpoint reached successfully",
        userId,
        phonemeCount: phonemes.length,
        status: "routing_working",
      });
    } catch (error) {
      console.error("Error in phonemes initialization:", error);
      res.status(500).json({
        error: "Failed to initialize phonemes",
        details: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
