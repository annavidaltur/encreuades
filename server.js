import express from 'express';
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config({override: true});
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// web
app.use(express.static("./public"));

//middleware per parsejar json
app.use(express.json());

// R2 Client
const client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
      }
    });

// cache per evitar cridar a R2
let cacheMinis = null;
let cacheMaxis = null;
let cacheDate = null;

// endpoint que torna la llista de crosswords
app.get("/api/crosswords", async (req, res) => {
    const type = req.query.type;

    // Si estan en cache i és el mateix dia, tornem els cachejats
    const today = new Date().toISOString().slice(0,10);
    if(type === "minis" && cacheMinis && cacheDate === today){
      return res.json(cacheMinis);
    }
    if(type === "maxis" && cacheMaxis && cacheDate === today){
      return res.json(cacheMaxis);
    }

    try {
      const dToday = new Date()
      const strToday = dToday.toISOString().slice(0,10).replace(/-/g, "")

      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET,
        Prefix: type + '/'
      });
      const listResponse = await client.send(command);

      if(listResponse.Contents){
        const files = listResponse.Contents.filter(obj => {
          const id = obj.Key.split("/")[1].slice(0,8);
          return id <= strToday;
        })

        const promises = files.map(async obj => {
          const id = obj.Key.split("/")[1].slice(0,8);
          const content = await getFileContent(obj.Key);
          const json = JSON.parse(content);

          return{
            id,
            date: `${id.slice(0,4)}-${id.slice(4,6)}-${id.slice(6,8)}`, // 2025-08-10,
            title: json.title,
            author: json.author
          };
        });

        const list = await Promise.all(promises);
        const ordered = list.sort((a,b) => (a.id > b.id ? -1 : 1));
        if(type === "minis")
          cacheMinis = ordered;
        else if(type === "maxis")
          cacheMaxis = ordered;
        cacheDate = today;
        res.json(ordered);    
      }
    } catch (err) {
        console.error("Error llegint els creuats: ", err)
        res.status(500).json({error: "No s'han pogut carregar els creuats"});
    }
});

async function getFileContent(key){
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key
  })

  const response = await client.send(command);
  const content = await response.Body.transformToString();
  return content;
}

// endpoint crossword concret
app.get("/api/crossword/:id", async (req, res) => {
  try {
    var key = req.query.type + "/" + req.params.id + ".ipuz";
    const content = await getFileContent(key);
    const puzzle = JSON.parse(content);
    const response = {
      title: puzzle.title,
      author: puzzle.author,
      dimensions: puzzle.dimensions,
      puzzle: puzzle.puzzle,
      clues: puzzle.clues
    };
    res.json(response);    
  } catch (err) {
    res.status(404).json({ error: err });
  }
});

// mostrar solució
app.get("/api/crossword/:id/solve", async (req, res) => {
  try {
    var key = req.query.type + "/" + req.params.id + ".ipuz";
    const content = await getFileContent(key);
    const puzzle = JSON.parse(content);
    res.json(puzzle.solution);
  } catch (err) {
    res.status(404).json({ error: "Crossword no trobat" });
  }
});

// mostrar lletra
app.get("/api/crossword/:id/letter", async (req, res) => {
  try {
    var key = req.query.type + "/" + req.params.id + ".ipuz";
    const content = await getFileContent(key);
    const puzzle = JSON.parse(content);
    const letter = puzzle.solution[req.query.y][req.query.x];

    if(!letter)
      return;
    
    res.status(200).send(letter);
  } catch (err) {
    res.status(404).json({ error: "Crossword no trobat" });
  }
});
// check resultat
app.post("/api/crossword/:id", async (req, res) => {
  try {
    var key = req.query.type + "/" + req.params.id + ".ipuz";
    const content = await getFileContent(key);
    const puzzle = JSON.parse(content);
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
// module.exports = app;
// export default app;