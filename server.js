import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// web
app.use(express.static(path.join(__dirname, "public")));

// endpoint que torna la llista de crosswords
app.get("/api/crosswords", (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, "crosswords"));
  res.json(files.map(f => f.replace(".json", "")));
});

// endpoint crossword concret
app.get("/api/crossword/:id", (req, res) => {
  try {
    const puzzle = fs.readFileSync(path.join(__dirname, "crosswords", `${req.params.id}.json`), "utf-8");
    res.json(JSON.parse(puzzle));
  } catch (err) {
    res.status(404).json({ error: "Crossword no trobat" });
  }
});

app.listen(PORT, () => console.log(`Servidor escoltant en http://localhost:${PORT}`));
