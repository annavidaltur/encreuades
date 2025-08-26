import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// web
app.use(express.static(path.join(__dirname, "public")));

//middleware per parsejar json
app.use(express.json());

// endpoint que torna la llista de crosswords
app.get("/api/crosswords", (req, res) => {
    const type = req.query.type;
    const dir = path.join(__dirname, type);
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
    const filePath = path.join(__dirname, req.query.type, `${req.params.id}.ipuz`);
    const puzzle = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const response = {
      title: puzzle.title,
      author: puzzle.author,
      dimensions: puzzle.dimensions,
      puzzle: puzzle.puzzle,
      clues: puzzle.clues
    }
    res.json(response);
  } catch (err) {
    res.status(404).json({ error: "Crossword no trobat" });
  }
});

// mostrar solució
app.get("/api/crossword/:id/solve", (req, res) => {
  try {
    const filePath = path.join(__dirname, req.query.type, `${req.params.id}.ipuz`);
    const puzzle = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(puzzle.solution);
  } catch (err) {
    res.status(404).json({ error: "Crossword no trobat" });
  }
});

// check resultat
app.post("/api/crossword/:id", (req, res) => {
  try {
    const filePath = path.join(__dirname, req.query.type, `${req.params.id}.ipuz`);
    const puzzle = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const solution = puzzle.solution;
    const width = puzzle.dimensions.width;
    const height = puzzle.dimensions.height;
    const userInput = req.body;

    let checked = [];
    for(let j=0; j < height; j++){
      let row = [];
      for(let i=0; i < width; i++){
        const sol = solution[j][i];
        const input = userInput[j][i];

        if(sol == "#" || input == undefined || input == "")
          row.push("") // blackSquare o cell buida
        else if(sol == input)
          row.push("correct")
        else row.push("incorrect");
      }
      checked.push(row)
    }
    res.json(checked);
  } catch (err) {
    res.status(404).json({ error: "Crossword no trobat" });
  }
});

app.listen(PORT, () => console.log(`Servidor escoltant en http://localhost:${PORT}`));
