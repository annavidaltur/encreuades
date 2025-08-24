// carregarPuzzles();
clickPuzzle("20250818")
// clickPuzzle("20250829") // 15x15

// Crea la llista de puzzles
async function carregarPuzzles() {
    const res = await fetch("/api/crosswords");
    const puzzles = await res.json();
    const select = document.getElementById("puzzleSelect");
    puzzles.forEach(puzzle => {
        const puzDiv = document.createElement("div");
        puzDiv.classList.add("puzDiv");

        // part esquerra
        const left = document.createElement("div");
        left.classList.add("puzLeft");

        // imatge
        const left1 = document.createElement("div");
        const img = document.createElement("img");
        img.src = "assets/icons/web-app-manifest-512x512.png"
        img.classList.add("puzIcon");
        left1.appendChild(img);

        // data
        const left2 = document.createElement("div");
        const date = document.createElement("p");
        date.classList.add("pDate");
        const puzzleDate = new Date(puzzle.date);
        date.textContent = puzzleDate.toLocaleDateString("ca-ES", { day: "numeric", month: "long", year: "numeric" });
        left2.appendChild(date);

        // títol + author
        const sp = document.createElement("span");
        sp.classList.add("spTitleAuthor");
        sp.textContent = puzzle.title + " / " + puzzle.author;
        left2.appendChild(sp);

        // afegir titol i author a divPuz
        left.appendChild(left1)
        left.appendChild(left2);

        // icona >
        const arrow = document.createElement("span");
        arrow.classList.add("puzArrow");
        arrow.textContent = "›";

        // muntar puzDiv
        puzDiv.appendChild(left);
        puzDiv.appendChild(arrow);
        puzDiv.value = puzzle.id;

        // event onclick
        puzDiv.addEventListener("click", e => clickPuzzle(e.target.value));

        // afegir divPuz al divParent
        select.appendChild(puzDiv);
    });
}

// Event onClick element llista puzzle
async function clickPuzzle(id) {
    if (id == undefined)
        return;
    document.getElementById("puzzleSelect").style.display = "none";
    document.getElementById("board").style.display = "block";

    const res = await fetch("/api/crossword/" + id);
    const data = await res.json();
    buildPuzzle(data);
}

// Crea grid i pistes del puzzle
function buildPuzzle(data) {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    width = data.dimensions.width;
    height = data.dimensions.height;
    const puzzle = data.puzzle;
    const cluesDown = data.clues.Down;
    const cluesAcross = data.clues.Across;

    // grid
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${height}, 1fr)`;

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const cell = document.createElement("div");
            const puzContent = puzzle[i][j];

            // estil
            cell.classList.add("cell");
            cell.dataset.x = j;
            cell.dataset.y = i;
            cell.addEventListener("click", () => onClickCell(cell));
            cell.tabIndex = 0; // Per a que s'active el kwydown pq un div no és focusable per defecte, i keydown sols es dispara quan l'element té el focus
            cell.addEventListener("keydown", (e) => onKeydown(e, cell));
            if (i == 0)
                cell.classList.add("firstRow");
            if (j == 0)
                cell.classList.add("firstCol");
            

            // afegir número de paraula
            if (puzContent == "#") // black square
                cell.classList.add("cellBlack")
            else if (puzContent > 0) // número de pista
            {
                const nPista = document.createElement("span");
                nPista.classList.add("nPista");
                if(width < 7)
                    nPista.classList.add("nPistaMini")
                else nPista.classList.add("nPistaBig")
                nPista.innerText = puzContent;
                cell.appendChild(nPista)
            }

            // afegir span lletra
            const cellLetter = document.createElement("span");
            if(width < 7)
                cellLetter.classList.add("cellLetterMini")
            else cellLetter.classList.add("cellLetterBig");
            cell.appendChild(cellLetter)
            grid.appendChild(cell)
        }
    }

    // clues across
    const listAcross = document.querySelector(".across-clues").firstElementChild;
    listAcross.innerHTML = "";
    const listDown = document.querySelector(".down-clues").firstElementChild;
    listDown.innerHTML = "";

    for (let i = 0; i < cluesAcross.length; i++)
        addClue(listAcross, cluesAcross[i][0], cluesAcross[i][1]);
    for (let i = 0; i < cluesDown.length; i++)
        addClue(listDown, cluesDown[i][0], cluesDown[i][1]);
}

// Afegeix una pista a la llista indicada
function addClue(list, n, clue) {
    const clueDiv = document.createElement("div");
    clueDiv.classList.add("clueDiv");

    const clueNum = document.createElement("span");
    clueNum.classList.add("clueNum");
    clueNum.innerText = n;

    const clueText = document.createElement("span");
    clueText.classList.add("clueText");
    clueText.innerText = clue;

    clueDiv.appendChild(clueNum);
    clueDiv.appendChild(clueText);
    list.appendChild(clueDiv);
}

//
let currentCell = null;
let currentDir = 'across';
let width = 0;
let height = 0;

function onClickCell(cell){
    if(cell.classList.contains("cellBlack"))
        return; // ignorem quadrats negres
    if(currentCell === cell){
        if(currentDir === 'across')
            currentDir = 'down';
        else currentDir = 'across';
    } else {
        currentCell = cell;
    }
    updateSelection();
}

function updateSelection(){
    // netejar selecció previa
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('current-cell', 'highlight-cell')
    })
    
    if(!currentCell) return;

    currentCell.classList.add('current-cell');
    
    const x = parseInt(currentCell.dataset.x);
    const y = parseInt(currentCell.dataset.y);
    
    if(currentDir === 'across'){
        let startX = x;
        for(let next = x;;next--){
            const nextCell = document.querySelector(`.cell[data-x="${next}"][data-y="${y}"]`)
            if(!nextCell || nextCell.classList.contains("cellBlack")){
                break;
            }
            startX = next;
        }

        let endX = x;
        for(let next = x+1;;next++){
            const nextCell = document.querySelector(`.cell[data-x="${next}"][data-y="${y}"]`)
            if(!nextCell || nextCell.classList.contains("cellBlack")){
                break;
            }
            endX = next;
        }

        for(let i=startX; i <= endX; i++){
            const cell = document.querySelector(`.cell[data-x="${i}"][data-y="${y}"]`)
            if(cell !== currentCell)
                cell.classList.add('highlight-cell');
        }
    } else {
        let startY = y;
        for(let next = y;;next--){
            const nextCell = document.querySelector(`.cell[data-x="${x}"][data-y="${next}"]`)
            if(!nextCell || nextCell.classList.contains("cellBlack")){
                break;
            }
            startY = next;
        }

        let endY = y;
        for(let next = y+1;;next++){
            const nextCell = document.querySelector(`.cell[data-x="${x}"][data-y="${next}"]`)
            if(!nextCell || nextCell.classList.contains("cellBlack")){
                break;
            }
            endY = next;
        }

        for(let i=startY; i <= endY; i++){
            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${i}"]`)
            if(cell !== currentCell)
                cell.classList.add('highlight-cell');
        }
    }
}

function onKeydown(event, cell){
    const key = event.key;
    if(key === "Enter"){
        event.preventDefault();
        onEnterKey(cell);
        return;
    }
    else if(key === "Backspace"){
        event.preventDefault();
        onBackKey(cell);
        return;
    }
    else if(key === "ArrowDown"){
        event.preventDefault();
        onArrowDownKey();
        return;
    }
    else if(key === "ArrowRight"){
        event.preventDefault();
        onArrowRightKey();
        return;
    }
    else if(key === "ArrowUp"){
        event.preventDefault();
        onArrowUpKey();
        return;
    }
    else if(key === "ArrowLeft"){
        event.preventDefault();
        onArrowLeftKey();
        return;
    }
        
        

    if (!/^[a-zA-Z]$/.test(key)) return;
    
    const cellText = cell.lastElementChild; // últim element perque si té nPista és l'1, i si no el 0
    cellText.innerText = key.toUpperCase(); // mostrem la lletra a la cell actual

    // mou la selecció a la següent cell
    let nextCell;
    if(currentDir === "across")
    {
        const nextX = Number(cell.dataset.x) + 1;
        nextCell = document.querySelector(`.cell[data-x="${nextX}"][data-y="${cell.dataset.y}"]:not(.cellBlack)`)
        
    } else { // down
        const nextY = Number(cell.dataset.y) + 1;
        nextCell = document.querySelector(`.cell[data-x="${cell.dataset.x}"][data-y="${nextY}"]:not(.cellBlack)`)
    }


    if(nextCell){
        currentCell = nextCell;
        nextCell.focus();
    } else { // final de paraula
        currentCell = cell;
    }

    updateSelection();
}

function onEnterKey(cell) {
    // TODO: Tornar al principi si hem arribat al final de la graella
    if (!currentCell) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    let nextCell;

    if (currentDir === 'across') {
        // obtenim el x de la pròxima paraula
        let nextX = x + 1;
        while (true) {
            const candidate = document.querySelector(`.cell[data-x="${nextX}"][data-y="${y}"]`);
            if (!candidate || candidate.classList.contains("cellBlack")) break;
            nextX++;
        }
        // ara buscar el primer caràcter lliure de la següent paraula
        while (true) {
            const candidate = document.querySelector(`.cell[data-x="${nextX}"][data-y="${y}"]`);
            if (!candidate){
                break; // no hi ha més files
            }
            if (!candidate.classList.contains("cellBlack") && !candidate.lastElementChild.innerText != "") {
                nextCell = candidate;
                break;
            }
            nextX++;
        }
        if(!nextCell)
        {
            // buquem en la fila següent
            for (let j = y + 1; j < height; j++) {
                for (let i = 0; i < width; i++) {
                    const candidate = document.querySelector(`.cell[data-x="${i}"][data-y="${j}"]`);
                    if (!candidate) continue;
                    if (!candidate.classList.contains("cellBlack") &&
                        candidate.lastElementChild.innerText === "") {
                        nextCell = candidate;
                        break;
                    }
                }
                if (nextCell) break;
            }
        }
    }
    else { // down
        // obtenim el x de la pròxima paraula
        let nextY = y + 1;
        while (true) {
            const candidate = document.querySelector(`.cell[data-x="${x}"][data-y="${nextY}"]`);
            if (!candidate || candidate.classList.contains("cellBlack")) break;
            nextY++;
        }

        // ara buscar el primer caràcter lliure de la següent paraula
        while (true) {
            const candidate = document.querySelector(`.cell[data-x="${x}"][data-y="${nextY}"]`);
            if (!candidate){
                break; // no hi ha més files
            }
            if (!candidate.classList.contains("cellBlack") && !candidate.lastElementChild.innerText != "") {
                nextCell = candidate;
                break;
            }
            nextY++;
        }
        if(!nextCell)
        {
            // buquem en la COL següent
            for (let i = x + 1; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    const candidate = document.querySelector(`.cell[data-x="${i}"][data-y="${j}"]`);
                    if (!candidate) continue;
                    if (!candidate.classList.contains("cellBlack") &&
                        candidate.lastElementChild.innerText === "") {
                        nextCell = candidate;
                        break;
                    }
                }
                if (nextCell) break;
            }
        }
    }

    if (nextCell) {
        currentCell = nextCell;
        updateSelection();
        currentCell.focus();
    }
}

function onBackKey(cell){
    if (!cell) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    let backCell;
    if (currentDir === 'across') {
        let backX = x-1;
        if(x == 0) backX = 0;
        backCell = document.querySelector(`.cell[data-x="${backX}"][data-y="${y}"]`);
    } else { // down
        let backY = y-1;
        if(y == 0) backY = 0;
        backCell = document.querySelector(`.cell[data-x="${x}"][data-y="${backY}"]`);
    }

    cell.lastElementChild.innerText = "";


    if (backCell && !backCell.classList.contains("cellBlack")) {
        currentCell = backCell;
        updateSelection();
        currentCell.focus();
    }
}

function onArrowDownKey(){
    // canviar de direcció
    if(currentDir === 'across'){
        currentDir = 'down';
        updateSelection();
    } else { // ja estem en down, mou cap avall
        const x = Number(currentCell.dataset.x);
        const y = Number(currentCell.dataset.y);

        const nextCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y+1}"]`)
        if(nextCell && !nextCell.classList.contains("cellBlack")){
            currentCell = nextCell;
            updateSelection();
            currentCell.focus();
        }
    }
}

function onArrowUpKey(){
    // canviar de direcció
    if(currentDir === 'across'){
        currentDir = 'down';
        updateSelection();
    } else { // ja estem en down, mou cap amunt
        const x = Number(currentCell.dataset.x);
        const y = Number(currentCell.dataset.y);

        const nextCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y-1}"]`)
        if(nextCell && !nextCell.classList.contains("cellBlack")){
            currentCell = nextCell;
            updateSelection();
            currentCell.focus();
        }
    }
}

function onArrowRightKey(){
    // canviar de direcció
    if(currentDir === 'down'){
        currentDir = 'across';
        updateSelection();
    } else { // ja estem en across, mou cap a la dreta
        const x = Number(currentCell.dataset.x);
        const y = Number(currentCell.dataset.y);

        const nextCell = document.querySelector(`.cell[data-x="${x+1}"][data-y="${y}"]`)
        if(nextCell && !nextCell.classList.contains("cellBlack")){
            currentCell = nextCell;
            updateSelection();
            currentCell.focus();
        }
    }
}

function onArrowLeftKey(){
    // canviar de direcció
    if(currentDir === 'down'){
        currentDir = 'across';
        updateSelection();
    } else { // ja estem en across, mou cap a l'esq
        const x = Number(currentCell.dataset.x);
        const y = Number(currentCell.dataset.y);

        const nextCell = document.querySelector(`.cell[data-x="${x-1}"][data-y="${y}"]`)
        if(nextCell && !nextCell.classList.contains("cellBlack")){
            currentCell = nextCell;
            updateSelection();
            currentCell.focus();
        }
    }
}