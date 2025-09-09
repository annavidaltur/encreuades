// Variables globals
let currentTipus = "";
let currentId = "";
let currentCell = null;
let currentDir = 'across';
let currentTitle = "";
let width = 0;
let height = 0;

const isMobile = checkDevice();
function checkDevice() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

//timer
var func;
function startTimer(inici){
    let start;
    if(inici){
        const min = Number(inici.split(":")[0])
        const sec = Number(inici.split(":")[1])
        const elapsedMS = min*60000 + sec*1000;
        start = Date.now() - elapsedMS;
    } else {
        start = Date.now();
    }
    func = setInterval(function() {
        var delta = Date.now() - start; // milliseconds elapsed since start
        var minutes = Math.floor(delta / 60000);
        var seconds = ((delta % 60000) / 1000).toFixed(0);
        var text = seconds == 60 ?
            (minutes+1) + ":00" :
            minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
        document.getElementById("timer").innerHTML = text;
        
        let progress = JSON.parse(localStorage.getItem("progress"));
        progress[currentTipus][currentId].timer = text;
        localStorage.setItem("progress", JSON.stringify(progress));    
    }, 1000); // update about every second
}
function stopTimer() {
    clearInterval(func);
}

carregarPuzzles('minis');
// clickPuzzle("20250818")
// clickPuzzle("maxis", "20250826") // 15x15

// Crea la llista de puzzles
async function carregarPuzzles(tipus) {
    document.getElementById("puzzleSelect").style.display = "block"
	document.getElementById("board").style.display = "none"
    currentTipus = tipus;
    const res = await fetch(`/api/crosswords?` + new URLSearchParams({ type: tipus}));
    const puzzles = await res.json();
    const select = document.getElementById("puzzleSelect");
    select.innerHTML = "";
    lsInitProgress(tipus); // inicialitzar localstorage
    stopTimer();
    hideTeclat();
    const bannerPista = document.querySelector("#banner-clue-text");
    console.log(bannerPista)
    bannerPista.innerText = "";
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

        // afegir titol i author a part esq
        left.appendChild(left1)
        left.appendChild(left2);

        
        // part dreta
        const right = document.createElement("div");
        right.classList.add("puzRight");
        const right2 = document.createElement("div");
        right2.classList.add("puzRightLabel");

        const finished = lsIsFinished(tipus, puzzle.id);
        const perLabel = document.createElement("div");
        const finLabel = document.createElement("div");
        if(finished === undefined){
            finLabel.textContent = "";
        } else {
            const percentatge = lsGetPercentatge(tipus, puzzle.id);
            perLabel.classList.add("progress-ring")
            perLabel.classList.add(percentatge > 50 ? "guai" : "regu");

            perLabel.style.setProperty("--p", percentatge);         
            perLabel.style.setProperty("--percentatge", `"${percentatge}%"`);         

            finLabel.innerText = finished ? "COMPLET" : "EN CURS";
        }

        // icona >
        const arrow = document.createElement("span");
        arrow.classList.add("puzArrow");
        arrow.textContent = "›";

        // afegir percentatge, label i fletxa a la part dreta
        right2.appendChild(perLabel);
        right2.appendChild(finLabel);
        right.appendChild(right2);
        right.appendChild(arrow);

        // muntar puzDiv
        puzDiv.appendChild(left);
        puzDiv.appendChild(right);
        puzDiv.value = puzzle.id;

        // event onclick
        puzDiv.addEventListener("click", () => clickPuzzle(puzzle.id));

        // afegir divPuz al divParent
        select.appendChild(puzDiv);
    });

    // netejar grid
    const grid = document.querySelector("#grid");
    grid.innerHTML = "";
}

// Event onClick element llista puzzle
async function clickPuzzle(id) {
    if (id == undefined)
        return;
    document.getElementById("puzzleSelect").style.display = "none";
    document.getElementById("board").style.display = "block";
    document.querySelector("#timer").innerText = ""; // netejar estat
    
    const bannerPista = document.querySelector("#bannerClue");
    if(isMobile){
        showTeclat();
        bannerPista.style.position = "fixed";
    } else {
        bannerPista.style.position = "relative";
    }   
        

    currentId = id;

    const res = await fetch(`/api/crossword/${currentId}?` + new URLSearchParams({ type: currentTipus }));
    const data = await res.json();
    buildPuzzle(data);

    // storage
    const progress = lsInitProgressPuzzle(data.puzzle);
    const finished = progress[0];
    const timer = progress[1];
    if(finished){
        mostrarModalFi(); // modal fi de joc
        getSolution(); // omplir el grid amb la solució
        return; // evitar iniciar el timer
    }

    // Timer
    document.querySelector("#timer").innerText = ""; // netejar estat
    startTimer(timer);
}

function clearTimer(){
    stopTimer();
    document.querySelector("#timer").innerText = "";
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

    // title
    const title = document.querySelector("#title");
    title.innerHTML = `${data.title} <em>per ${data.author}</em>`;
    currentTitle = data.title;

    // Afegir botó enrere
    var backBtn = document.getElementById("btnEnrere");
    var newBackBtn = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(newBackBtn, backBtn);
    newBackBtn.addEventListener("click", () => carregarPuzzles(currentTipus));

    // Netejar previ
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('current-cell', 'highlight-cell', 'cellBlack')
        c.lastElementChild.innerText = "";
    })

    // storage
    let gridProgress;
    const progress = JSON.parse(localStorage.getItem("progress"))
    if(progress !== null && progress[currentTipus][currentId])
        gridProgress = progress[currentTipus][currentId].grid;

    // Graella
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const cell = document.createElement("div");
            const puzContent = puzzle[i][j];

            // estil
            cell.classList.add("cell");
            cell.dataset.x = j;
            cell.dataset.y = i;
            if (i == 0)
                cell.classList.add("firstRow");
            if (j == 0)
                cell.classList.add("firstCol");
            

            // events
            cell.addEventListener("click", () => onClickCell(cell));
            cell.addEventListener("keydown", (e) => onKeydownDesktop(e));
            cell.tabIndex = 0; // Per a que s'active el kwydown pq un div no és focusable per defecte, i keydown sols es dispara quan l'element té el focus

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

            // storage
            if(gridProgress && gridProgress[i][j] != "#"){
                cellLetter.innerText = gridProgress[i][j];
            }

            cell.appendChild(cellLetter)
            grid.appendChild(cell)
        }
    }

    

    // clues
    const listAcross = document.querySelector(".across-clues").firstElementChild;
    listAcross.innerHTML = "";
    const listDown = document.querySelector(".down-clues").firstElementChild;
    listDown.innerHTML = "";

    for (let i = 0; i < cluesAcross.length; i++)
        addClue(listAcross, cluesAcross[i][0], cluesAcross[i][1], "across");
    for (let i = 0; i < cluesDown.length; i++)
        addClue(listDown, cluesDown[i][0], cluesDown[i][1], "down");
}

// Afegeix una pista a la llista indicada
function addClue(list, n, clue, dir) {
    const clueDiv = document.createElement("div");
    clueDiv.classList.add("clueDiv");
    clueDiv.dataset.num = n;
    clueDiv.dataset.dir = dir;
    clueDiv.addEventListener("click", () => clueClick(n, dir));
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
    highlightClue();

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

function onKeydownDesktop(event){
    if(!currentCell) return;

    const key = event.key;

    onKeydown(event, key);    
}


function onKeydown(event, key){
    if(lsIsFinished(currentTipus, currentId)) return; // permitim navegar però no modificar el grid

    if(key === "Enter"){
        event.preventDefault();
        onEnterKey();
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
    else if(key === "Backspace"){
        event.preventDefault();
        onBackKey();
        return;
    }
    
    if (!/^[a-zA-ZçÇ]$/.test(key)) return;
    
    // Assignem la lletra a currentCell
    // lastElementChild perque si té nPista és l'1, i si no el 0
    const letter = key.toUpperCase();
    const x = Number(currentCell.dataset.x);
    const y = Number(currentCell.dataset.y);
    currentCell.lastElementChild.innerText = letter; 
    lsUpdateGrid(letter, x, y);

    // mou la selecció a la següent cell
    let nextCell;
    if(currentDir === "across")
    {
        const nextX = x + 1;
        nextCell = document.querySelector(`.cell[data-x="${nextX}"][data-y="${y}"]:not(.cellBlack)`)
        
    } else { // down
        const nextY = y + 1;
        nextCell = document.querySelector(`.cell[data-x="${x}"][data-y="${nextY}"]:not(.cellBlack)`)
    }


    if(nextCell){
        currentCell = nextCell;
    } else { // final de paraula
        onEnterKey()
    }

    updateSelection();

    // comprovar si ha escrit totes les lletres
    const allCells = Array.from(document.querySelectorAll(`.cell`));
    const cellsJugables = allCells.filter((c) => !c.classList.contains("cellBlack"));
    const isGridCompleted = cellsJugables.every(c => c.lastElementChild?.innerText.trim() !== "");
    
    if(isGridCompleted){
        isOk().then(ok => {
            if(!ok){
                // Fi de joc amb errors
                var modalErrors = new bootstrap.Modal(document.getElementById('modalErrors'))
                modalErrors.show();
            } else {
                // Fi de joc correcte
                finishCorrect();                            
            }
        })
    }
}

function finishCorrect(){
    mostrarModalFi();

    // update finished
    let progress = JSON.parse(localStorage.getItem("progress"));
    progress[currentTipus][currentId].finished = true;
    localStorage.setItem("progress", JSON.stringify(progress))   
}

function mostrarModalFi(){
    stopTimer();
    hideTeclat();
    var modalFi = new bootstrap.Modal(document.getElementById('modalFi'))
    modalFi.show();

    // passem el timer al modal
    const timerls = JSON.parse(localStorage.getItem('progress'))[currentTipus][currentId].timer;
    document.querySelector("#intervalFi").innerText = timerls;    
}

function onEnterKey() {
    if (!currentCell) return;

    const x = Number(currentCell.dataset.x);
    const y = Number(currentCell.dataset.y);

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
        currentCell.focus();
        // hiddenInput.focus()
    }
    updateSelection();
}

function onEnterBackKey() {
    if (!currentCell) return;

    // trobar index pista actual
    const allCluesDir = document.querySelectorAll(`.clueDiv[data-dir="${currentDir}"]`);
    const clueActive = document.querySelector('.clueDiv.active');
    const index = Array.prototype.indexOf.call(allCluesDir, clueActive)
    if(index <= 0)
        return;

    // trobar pista prèvia
    const prevClueText = allCluesDir[index-1].firstChild.innerText;
    const spans = document.querySelectorAll('.nPista');
    const prevClue = Array.from(spans).filter(sp => sp.innerText == prevClueText)[0];
    if(!prevClue) 
        return;

    // trobar primera cell lliure de la paraula prèvia
    const prevWordX = prevClue.parentNode.dataset.x;
    const prevWordY = prevClue.parentNode.dataset.y;
    let nextCell;

    if(currentDir == "across"){
        let nextX = prevWordX;
        while (true) {
            const candidate = document.querySelector(`.cell[data-x="${nextX}"][data-y="${prevWordY}"]`);
            if (!candidate){
                break; // no hi ha més files
            }
            if (!candidate.classList.contains("cellBlack") && !candidate.lastElementChild.innerText != "") {
                nextCell = candidate;
                break;
            }
            nextX++;
        }
    } else {
        let nextY = prevWordY;
        while (true) {
            const candidate = document.querySelector(`.cell[data-x="${prevWordX}"][data-y="${nextY}"]`);
            if (!candidate){
                break; // no hi ha més files
            }
            if (!candidate.classList.contains("cellBlack") && !candidate.lastElementChild.innerText != "") {
                nextCell = candidate;
                break;
            }
            nextY++;
        }
    }
    
    if(nextCell){
        currentCell = nextCell;
    } else {
        // totes les cells estan escrites
        currentCell = document.querySelector(`.cell[data-x="${prevWordX}"][data-y="${prevWordY}"]`);
    }
    currentCell.focus();
    updateSelection();
}

function onBackKey(){
    if (!currentCell) return;

    const x = Number(currentCell.dataset.x);
    const y = Number(currentCell.dataset.y);

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

    currentCell.lastElementChild.innerText = "";
    lsUpdateGrid("", x, y);

    if (backCell && !backCell.classList.contains("cellBlack")) {
        currentCell = backCell;
        updateSelection();
        // currentCell.focus();
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

// comprova tota la graella
function checkPuzzle(){
    if(currentId == undefined)
        return;

    let mapped = [];
    for (let j = 0; j < height; j++) {
        let row = [];
        for(let i=0; i<width; i++){
            const cell = document.querySelector(`.cell[data-x="${i}"][data-y="${j}"]`);
            if (cell.classList.contains("cellBlack"))
                row.push("#");
            else row.push(cell.lastElementChild.innerText);
        }
        mapped.push(row)
    }

    fetch(`/api/crossword/${currentId}?type=${currentTipus}`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(mapped)
    }).then(function (a) {
        return a.json();
    })
    .then(function (result) {
        for (let j = 0; j < height; j++) {
            for(let i=0; i<width; i++){
                const cell = document.querySelector(`.cell[data-x="${i}"][data-y="${j}"]`);
                if (cell.classList.contains("cellBlack"))
                    continue;
                else {
                    const res = result[j][i];
                    if(res !== "" && res !== undefined){
                        cell.lastElementChild.classList.add(res)
                        setTimeout(() => {
                            cell.lastElementChild.classList.remove(res);
                        }, 5000) // borra la class correct/incorrect als 5s
                    }
                }
            }
        }
    })
}

// comprova si hi ha errors en la graella
function isOk(){
    if(currentId == undefined)
        return Promise.resolve(false);
    
    let mapped = [];
    for (let j = 0; j < height; j++) {
        let row = [];
        for(let i=0; i<width; i++){
            const cell = document.querySelector(`.cell[data-x="${i}"][data-y="${j}"]`);
            if (cell.classList.contains("cellBlack"))
                row.push("#");
            else row.push(cell.lastElementChild.innerText);
        }
        mapped.push(row)
    }

    return fetch(`/api/crossword/${currentId}?type=${currentTipus}`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(mapped)
    }).then(response => response.json())
    .then(result => {
        for (let j = 0; j < height; j++) {
            for(let i=0; i<width; i++){
                const cell = document.querySelector(`.cell[data-x="${i}"][data-y="${j}"]`);
                if (cell.classList.contains("cellBlack"))
                    continue;
                else {
                    const res = result[j][i];
                    if(res == "incorrect")
                    {
                        return false;
                    }
                }
            }
        }
        return true;
    })
}

// mostra la solució
async function solvePuzzle(){
    if(currentId == undefined)
        return;

    await getSolution();
    
    var modalResoldre = document.getElementById('modalResoldre');
    var modal = bootstrap.Modal.getInstance(modalResoldre)
    modal.hide();

    // finished
    finishCorrect();
}

// crida a solvePuzzle
async function getSolution(){
    const res = await fetch(`/api/crossword/${currentId}/solve?` + new URLSearchParams({ type: currentTipus}));
    const solution = await res.json();
    for (let j = 0; j < height; j++) {
        for(let i=0; i<width; i++){
            const cell = document.querySelector(`.cell[data-x="${i}"][data-y="${j}"]`);
            const sol = solution[j][i];
            if(sol !== "#"){
                cell.lastElementChild.innerText = sol;
                lsUpdateGrid(sol, i, j)
            }
        }
    }
}

// mostra la lletra seleccionada
function showLetter(){
    if(currentId == undefined || currentTipus == undefined || !currentCell)
        return;

    fetch(`/api/crossword/${currentId}/letter?` + new URLSearchParams({ 
        type: currentTipus,
        x: currentCell.dataset.x,
        y: currentCell.dataset.y
    }))
    .then(res => res.text())
    .then(letter => {
        if(letter)
            currentCell.lastElementChild.innerText = letter;
    });
}
// mostra la pista activa
function highlightClue(){
    // netegem estat anterior
    document.querySelectorAll('.clueDiv.active').forEach(e => e.classList.remove('active'));

    const clueNum = getClueNum();
    if(!clueNum) return; 

    const clue = document.querySelector(`.clueDiv[data-dir="${currentDir}"][data-num="${clueNum}"]`);
    if(clue){
        clue.classList.add('active');
        if (!/Mobi|Android/i.test(navigator.userAgent)) {
            clue.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'})
        }
        const bannerClue = document.querySelector('#banner-clue-text');
        const dir = currentDir === "across" ? "H" : "V";
        bannerClue.innerHTML = `<b>${clue.firstChild.innerText} ${dir}</b> ${clue.lastChild.innerText.trim()}`;
    }
}

function getClueNum(){
    const pistaSpan = currentCell.querySelector('.nPista');
    if(pistaSpan) 
    {
        const candidateClue = document.querySelector(`.clueDiv[data-dir="${currentDir}"][data-num="${pistaSpan.innerText}"]`);
        if(candidateClue)
            return pistaSpan.innerText;
    }

    const x = Number(currentCell.dataset.x);
    const y = Number(currentCell.dataset.y);

    if(currentDir === "across"){
        for(let i=x-1;;i--){
            const prevCell = document.querySelector(`.cell[data-x="${i}"][data-y="${y}"]`)
            if(!prevCell || prevCell.classList.contains("cellBlack")){
                break;
            }
            const span = prevCell.querySelector('.nPista');            
            if(span){
                const candidateClue = document.querySelector(`.clueDiv[data-dir="across"][data-num="${span.innerText}"]`);
                if(candidateClue){
                    return span.innerText;
                }
            }
        }
    } else { // down
        for(let j=y-1;;j--){
            const prevCell = document.querySelector(`.cell[data-x="${x}"][data-y="${j}"]`)
            if(!prevCell || prevCell.classList.contains("cellBlack")){
                break;
            }
            const span = prevCell.querySelector('.nPista');            
            if(span){
                const candidateClue = document.querySelector(`.clueDiv[data-dir="down"][data-num="${span.innerText}"]`);
                if(candidateClue){
                    return span.innerText;
                }
            }
        }
    }
    return null;
}

function clueClick(n, dir){
    const spPistes = document.querySelectorAll('.nPista');
    const candidate = Array.from(spPistes).filter(sp => sp.innerText == n)[0]; // principi de paraula
    
    if(candidate){
        currentCell = candidate.parentNode;
        currentDir = dir;
        updateSelection();
    }
}

// compartir resultat
const shareOnTwitter = () => {
    const temps = document.querySelector("#timer").innerText;
    const text = `He resolt l'encreuat ${currentTitle} en ${temps}. Intenta-ho tu també! https://lalala.com`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
};

const shareOnFacebook = () => {
    const temps = document.querySelector("#timer").innerText;
    const text = `He resolt l'encreuat ${currentTitle} en ${temps}. Intenta-ho tu també! https://lalala.com`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
};

const shareOnWhatsApp = () => {
    const temps = document.querySelector("#timer").innerText;
    const text = `He resolt l'encreuat ${currentTitle} en ${temps}. Intenta-ho tu també! https://lalala.com`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
};

// botó "Més encreuats" del modal fi de joc
function mesEncreuatsClick(){
    var modalFi = document.getElementById('modalFi');
    var modal = bootstrap.Modal.getInstance(modalFi)
    modal.hide();
    carregarPuzzles(currentTipus)
}

// localStorage
function lsIsFinished(tipus, id){
    const progress = JSON.parse(localStorage.getItem("progress"));
    if(progress === null || progress[tipus][id] === undefined)
        return undefined;
    else return progress[tipus][id].finished;
}

function lsInitProgress(tipus){
    let progress = JSON.parse(localStorage.getItem('progress')) || {minis: {}, maxis: {}};
    progress[tipus] = progress[tipus] || {};  // inicialitza progress[minis] o progress[maxis] si no existeixen
    localStorage.setItem('progress', JSON.stringify(progress))
}

function lsInitProgressPuzzle(puzzle){
    let progress = JSON.parse(localStorage.getItem('progress')) || {minis: {}, maxis: {}};
    progress[currentTipus] = progress[currentTipus] || {};  // inicialitza progress[minis] o progress[maxis] si no existeixen
    if(!progress[currentTipus][currentId]){
        const emptyGrid = puzzle.map(row => row.map(c => c === "#" ? "#" : ""));
        progress[currentTipus][currentId] = { finished: false, grid: emptyGrid, timer: "00:00"}; // inicialitza el puzzle a false si no existeix
    }
    localStorage.setItem('progress', JSON.stringify(progress))
    return [progress[currentTipus][currentId].finished, progress[currentTipus][currentId].timer]; // return finished
}

function lsUpdateGrid(letter, x, y){
    let progress = JSON.parse(localStorage.getItem("progress"));
    progress[currentTipus][currentId].grid[y][x] = letter;
    const timer = document.querySelector("#timer").innerText;    
    if(timer != "")
        progress[currentTipus][currentId].timer = document.querySelector("#timer").innerText;
    localStorage.setItem("progress", JSON.stringify(progress))
}

function lsGetPercentatge(tipus, id){
    const progress = JSON.parse(localStorage.getItem("progress"));
    if(progress === null || progress[tipus][id] === undefined)
        return;

    const grid = progress[tipus][id].grid;
    const total = grid.reduce( (acc, row) => acc + row.filter(cell => cell != "#").length, 0);
    const plenes = grid.reduce( (acc, row) => acc + row.filter(cell => cell != "#" && cell != "").length, 0);
    const percentatge = Math.round((plenes * 100) / total);

    return percentatge;
}


// gestionar teclat
const keyboard = document.querySelector("#teclat");
function showTeclat(){
    keyboard.classList.remove("d-none"); // mostrar teclat
    keyboard.addEventListener('click', (e) => {
        if(!currentCell) return;
        const key = e.target.innerText;
        onKeydown(e, key);
    });

    // moure barra pista i mostrar fletxes
    const bannerPista = document.querySelector("#bannerClue");
    const teclatHeight = teclat.offsetHeight;    //resize de l'altura del banner
    bannerPista.style.bottom = teclatHeight + "px";

    // afegir arrows al banner de pistes
    if(bannerPista.children.length >= 2)
        return;

    const arrowPrev = document.createElement("button");
    arrowPrev.classList.add("arrow-banner")
    arrowPrev.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#333333" class="bi bi-caret-left-fill" viewBox="0 0 16 16"><path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/></svg>`;
    arrowPrev.addEventListener("click", () => onEnterBackKey())
    bannerPista.insertBefore(arrowPrev, bannerPista.firstChild);

    const arrowNext = document.createElement("button");
    arrowNext.classList.add("arrow-banner")
    arrowNext.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#333333" class="bi bi-caret-right-fill" viewBox="0 0 16 16"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>`;
    arrowNext.addEventListener("click", () => onEnterKey())
    bannerPista.appendChild(arrowNext);
}

function hideTeclat(){
    keyboard.classList.add("d-none");
}

