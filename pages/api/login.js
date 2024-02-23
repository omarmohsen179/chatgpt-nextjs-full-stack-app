export default function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;
    if (email === "test" && password === "test") {
      res.status(200).json({ token: "fake-token" });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
