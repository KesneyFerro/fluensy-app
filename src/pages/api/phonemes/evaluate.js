// Simple API route to handle phoneme evaluation without external dependencies
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
      const { userId, phonemeScores } = req.body;

      if (!userId || !phonemeScores) {
        return res.status(400).json({
          error: "userId and phonemeScores are required",
        });
      }

      // For now, just return success to test the routing
      res.json({
        message: "Phoneme evaluation endpoint reached successfully",
        userId,
        updatedPhonemes: Object.keys(phonemeScores),
        status: "routing_working",
      });
    } catch (error) {
      console.error("Error in phoneme evaluation:", error);
      res.status(500).json({
        error: "Failed to update phoneme evaluation",
        details: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
