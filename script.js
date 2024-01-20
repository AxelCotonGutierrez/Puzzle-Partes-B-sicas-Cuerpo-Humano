document.addEventListener('DOMContentLoaded', (event) => {
    initPuzzle();
    document.getElementById('check-button').addEventListener('click', checkPuzzle);
    document.getElementById('next-question').addEventListener('click', resetGame);
});

let remainingPieces = []; // Almacenar las piezas restantes
let draggedElement = null; // Variable global para almacenar el elemento arrastrado
let offsetX = 0;
let offsetY = 0;

function initPuzzle() {
    const puzzlePieces = document.getElementById('puzzle-pieces');
    const puzzleBoard = document.getElementById('puzzle-board');
    const imageSrc = 'cuerpo.jpg';
    const numRows = 3;
    const numCols = 3;
    const pieceWidth = 443 / numCols;
    const pieceHeight = 492 / numRows;
    let pieces = [];

    // Crear piezas del puzzle y almacenarlas en un array
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.id = 'piece-' + row + '-' + col;
            piece.style.backgroundImage = `url(${imageSrc})`;
            piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
            piece.style.width = `${pieceWidth}px`;
            piece.style.height = `${pieceHeight}px`;
            piece.draggable = true;
            piece.addEventListener('dragstart', dragStart);
            pieces.push(piece);
        }
    }

    // Desordenar y mostrar las primeras piezas
    shuffleArray(pieces);
    for (let i = 0; i < pieces.length; i++) {
        if (i < 3) { // Muestra las primeras 3 piezas
            puzzlePieces.appendChild(pieces[i]);
        } else {
            remainingPieces.push(pieces[i]); // Almacena las piezas restantes
        }
    }

    // Crear slots para el puzzle
    for (let i = 0; i < numRows * numCols; i++) {
        let slot = document.createElement('div');
        slot.classList.add('puzzle-slot');
        slot.id = 'slot-' + Math.floor(i / numCols) + '-' + (i % numCols);
        slot.style.width = `${pieceWidth}px`;
        slot.style.height = `${pieceHeight}px`;
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('drop', drop);
        puzzleBoard.appendChild(slot);
    }

    // Añadir eventos táctiles
    addTouchEventsToPieces();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dragStart(event) {
    draggedElement = event.target; // Almacenar la referencia al elemento arrastrado
    event.dataTransfer.setData('text/plain', event.target.id); // Usar el ID como dato de transferencia
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const slot = event.target.closest('.puzzle-slot');
    const draggableId = event.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(draggableId);

    if (slot && !slot.firstChild) {
        slot.appendChild(draggableElement);
        if (remainingPieces.length > 0) {
            addNextPiece();
        }
    }
}

function addNextPiece() {
    const nextPiece = remainingPieces.shift();
    document.getElementById('puzzle-pieces').appendChild(nextPiece);
}

function checkPuzzle() {
    let correctCount = 0;
    const numRows = 3;
    const numCols = 3;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let slot = document.getElementById('slot-' + row + '-' + col);
            let piece = slot.firstChild;

            if (piece && piece.id === 'piece-' + row + '-' + col) {
                correctCount++;
            }
        }
    }

    const resultDisplay = document.getElementById('result');
    if (correctCount === numRows * numCols) {
        resultDisplay.textContent = '¡Correcto! Todas las piezas están en el lugar adecuado.';
        resultDisplay.style.color = 'green';
    } else {
        resultDisplay.textContent = `Algunas piezas están en el lugar incorrecto. Intenta de nuevo. (${correctCount} de ${numRows * numCols} correctas)`;
        resultDisplay.style.color = 'red';
    }
}

function resetGame() {
    const puzzleBoard = document.getElementById('puzzle-board');
    const puzzlePieces = document.getElementById('puzzle-pieces');
    puzzleBoard.innerHTML = '';
    puzzlePieces.innerHTML = '';
    const resultDisplay = document.getElementById('result');
    resultDisplay.textContent = '';
    initPuzzle();
}

// Funciones para manejar eventos táctiles
function touchStart(e) {
    draggedElement = e.target;
    const touchLocation = e.targetTouches[0];
    offsetX = touchLocation.pageX - draggedElement.offsetLeft;
    offsetY = touchLocation.pageY - draggedElement.offsetTop;
    // Prevenir el desplazamiento solo si se ha iniciado el arrastre de una pieza
    document.addEventListener('touchmove', touchMove, { passive: false });
}

function touchMove(e) {
    if (draggedElement) {
        const touchLocation = e.targetTouches[0];
        draggedElement.style.position = 'absolute';
        draggedElement.style.left = `${touchLocation.pageX - offsetX}px`;
        draggedElement.style.top = `${touchLocation.pageY - offsetY}px`;
        e.preventDefault(); // Prevenir el desplazamiento mientras se arrastra una pieza
    }
}

function touchEnd(e) {
    if (draggedElement) {
        const slots = document.querySelectorAll('.puzzle-slot');
        let targetSlot = null;
        slots.forEach(slot => {
            if (isElementOverlapping(draggedElement, slot)) {
                targetSlot = slot;
            }
        });

        if (targetSlot && !targetSlot.firstChild) {
            targetSlot.appendChild(draggedElement);
            draggedElement.style.position = 'static';

            if (remainingPieces.length > 0) {
                addNextPiece();
            }
        } else {
            draggedElement.style.position = 'static';
        }
        draggedElement = null;
        document.removeEventListener('touchmove', touchMove); // Permitir el desplazamiento normal una vez que se suelta la pieza
    }
}

function isElementOverlapping(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

function addNextPiece() {
    const nextPiece = remainingPieces.shift();
    document.getElementById('puzzle-pieces').appendChild(nextPiece);
    addTouchEventsToPiece(nextPiece); // Añadir eventos táctiles a la nueva pieza
}

function addTouchEventsToPiece(piece) {
    piece.addEventListener('touchstart', touchStart, { passive: false });
    piece.addEventListener('touchmove', touchMove, { passive: false });
    piece.addEventListener('touchend', touchEnd);
}

function addTouchEventsToPieces() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach(addTouchEventsToPiece);
}

document.addEventListener('touchmove', touchMove, { passive: false });

// Navegaciòn"  
 
document.addEventListener('DOMContentLoaded', function() {
    var menuToggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.menu');
        
    menuToggle.addEventListener('click', function() {
    menu.classList.toggle('active');
    });
  });
