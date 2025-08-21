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
    const dir = path.join(__dirname, "crosswords");
    try{
        const dToday = new Date()
        const strToday = dToday.toISOString().slice(0,10).replace(/-/g, "")

        // filtrem .ipuz + els que siguen <= que el dia actual
        const files = fs.readdirSync(dir)
            .filter(f => f.endsWith(".ipuz") 
                        && f.replace(".ipuz", "") <= strToday);

        const puzzles = files.map(f => {
            const fName = f.slice(0,f.length - 5) // llevem el .ipuz
            const filePath = path.join(dir, f);
            const content = JSON.parse(fs.readFileSync(filePath, "utf8"))

            return {
                id: fName,
                date: `${fName.slice(0,4)}-${fName.slice(4,6)}-${fName.slice(6,8)}`, // 2025-08-10
                title: content.title,
                author: content.author
            }
        })
        res.json(puzzles);
    } catch (err) {
        console.error("Error llegint els creuats: ", err)
        res.status(500).json({error: "No s'han pogut carregar els creuats"});
    }
});

// endpoint crossword concret
app.get("/api/crossword/:id", (req, res) => {
  try {
    const filePath = path.join(__dirname, "crosswords", `${req.params.id}.ipuz`);
    const puzzle = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const response = {
      title: puzzle.title,
      author: puzzle.author,
      dimensions: puzzle.dimensions,
      puzzle: puzzle.puzzle
    }
    res.json(response);
  } catch (err) {
    res.status(404).json({ error: "Crossword no trobat" });
  }
});

app.listen(PORT, () => console.log(`Servidor escoltant en http://localhost:${PORT}`));
