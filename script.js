// ===== GLOBAL =====
const { jsPDF } = window.jspdf;
let selectedFiles = [];
let musicPlaying = false;

// ===== MUSIC =====
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicIndicator = document.getElementById('musicIndicator');

// Auto play after first user interaction (browser policy)
document.body.addEventListener('click', () => {
  if (!musicPlaying) {
    bgMusic.volume = 0.3;
    bgMusic.play().then(() => {
      musicPlaying = true;
      musicIndicator.style.display = 'block';
    }).catch(() => {});
  }
}, { once: true });

musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
    musicIndicator.style.display = 'none';
    musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
  } else {
    bgMusic.play();
    musicPlaying = true;
    musicIndicator.style.display = 'block';
    musicToggle.innerHTML = '<i class="fas fa-music"></i>';
  }
});

// ===== THEME =====
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.className = 'theme-' + btn.dataset.theme;
    localStorage.setItem('wazir-theme', btn.dataset.theme);
  });
});
// Load saved theme
const savedTheme = localStorage.getItem('wazir-theme') || 'dark';
document.body.className = 'theme-' + savedTheme;

// ===== MOBILE MENU =====
document.getElementById('menuToggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('active');
});

// ===== IMAGE CONVERTER =====
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewGrid = document.getElementById('previewGrid');
const convertActions = document.getElementById('convertActions');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
  const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  selectedFiles = [...selectedFiles, ...newFiles];
  renderPreviews();
}

function renderPreviews() {
  previewGrid.innerHTML = '';
  selectedFiles.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${e.target.result}" alt="preview">
        <button class="remove" data-index="${i}"><i class="fas fa-times"></i></button>
      `;
      previewGrid.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
  convertActions.style.display = selectedFiles.length ? 'flex' : 'none';

  // Remove buttons
  setTimeout(() => {
    document.querySelectorAll('.remove').forEach(btn => {
      btn.onclick = () => {
        selectedFiles.splice(+btn.dataset.index, 1);
        renderPreviews();
      };
    });
  }, 100);
}

document.getElementById('clearBtn').addEventListener('click', () => {
  selectedFiles = [];
  renderPreviews();
});

// Convert to PDF (multi image)
document.getElementById('toPdfBtn').addEventListener('click', async () => {
  if (!selectedFiles.length) return;
  const pdf = new jsPDF();
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const dataUrl = await readFileAsDataURL(file);
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = dataUrl; });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / img.width, pageHeight / img.height) * 0.9;
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, 'JPEG', x, y, w, h);
  }
  pdf.save('wazir-aura-converted.pdf');
});

// Convert to PNG / JPG (download each)
document.getElementById('toPngBtn').addEventListener('click', () => downloadAs('png'));
document.getElementById('toJpgBtn').addEventListener('click', () => downloadAs('jpeg'));

function downloadAs(type) {
  selectedFiles.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `wazir-aura-${i + 1}.${type === 'jpeg' ? 'jpg' : 'png'}`;
          a.click();
        }, `image/${type}`, 0.95);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// ===== GAMES =====

// 1. Tic Tac Toe
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
const tttBoard = document.getElementById('ticTacToe');
const tttStatus = document.getElementById('tttStatus');

function initTicTacToe() {
  tttBoard.innerHTML = '';
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  tttStatus.textContent = 'Player X turn';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleTttClick(i));
    tttBoard.appendChild(cell);
  }
}
function handleTttClick(i) {
  if (!gameActive || board[i]) return;
  board[i] = currentPlayer;
  tttBoard.children[i].textContent = currentPlayer;
  if (checkWin()) {
    tttStatus.textContent = `Player ${currentPlayer} wins!`;
    gameActive = false;
  } else if (board.every(c => c)) {
    tttStatus.textContent = 'Draw!';
    gameActive = false;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    tttStatus.textContent = `Player ${currentPlayer} turn`;
  }
}
function checkWin() {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(([a,b,c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
}
function resetTicTacToe() { initTicTacToe(); }
initTicTacToe();

// 2. Memory Match
const emojis = ['🍎','🍌','🍇','🍊','🍓','🍉','🍒','🥝'];
let memoryCards = [], flipped = [], matched = 0, moves = 0;
const memoryBoard = document.getElementById('memoryGame');
const memoryMoves = document.getElementById('memoryMoves');

function resetMemory() {
  memoryCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  flipped = [];
  matched = 0;
  moves = 0;
  memoryMoves.textContent = '0';
  memoryBoard.innerHTML = '';
  memoryCards.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.index = i;
    card.dataset.emoji = emoji;
    card.textContent = '?';
    card.addEventListener('click', () => flipCard(card));
    memoryBoard.appendChild(card);
  });
}
function flipCard(card) {
  if (flipped.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  card.textContent = card.dataset.emoji;
  flipped.push(card);
  if (flipped.length === 2) {
    moves++;
    memoryMoves.textContent = moves;
    if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
      flipped.forEach(c => c.classList.add('matched'));
      matched += 2;
      flipped = [];
      if (matched === 16) alert('You won in ' + moves + ' moves!');
    } else {
      setTimeout(() => {
        flipped.forEach(c => {
          c.classList.remove('flipped');
          c.textContent = '?';
        });
        flipped = [];
      }, 700);
    }
  }
}
resetMemory();

// 3. Click Speed
let clickCount = 0, clickTimer = null, timeLeft = 10;
const clickArea = document.getElementById('clickArea');
const clickCountEl = document.getElementById('clickCount');
const clickTimerEl = document.getElementById('clickTimer');
const startClickBtn = document.getElementById('startClickGame');

startClickBtn.addEventListener('click', () => {
  clickCount = 0;
  timeLeft = 10;
  clickCountEl.textContent = '0';
  clickTimerEl.textContent = '10';
  startClickBtn.disabled = true;
  clickTimer = setInterval(() => {
    timeLeft--;
    clickTimerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(clickTimer);
      startClickBtn.disabled = false;
      alert('Time up! Your score: ' + clickCount);
    }
  }, 1000);
});
clickArea.addEventListener('click', () => {
  if (timeLeft > 0 && startClickBtn.disabled) {
    clickCount++;
    clickCountEl.textContent = clickCount;
  }
});

// 4. Color Guess
const colors = [
  { name: 'Red', hex: '#ff1744' },
  { name: 'Blue', hex: '#2979ff' },
  { name: 'Green', hex: '#00c853' },
  { name: 'Purple', hex: '#aa00ff' },
  { name: 'Orange', hex: '#ff9100' },
  { name: 'Pink', hex: '#f50057' }
];
function newColorRound() {
  const correct = colors[Math.floor(Math.random() * colors.length)];
  document.getElementById('colorBox').style.background = correct.hex;
  document.getElementById('colorResult').textContent = '';
  const options = document.getElementById('colorOptions');
  options.innerHTML = '';
  const shuffled = [...colors].sort(() => Math.random() - 0.5);
  shuffled.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'color-opt';
    btn.textContent = c.name;
    btn.onclick = () => {
      document.getElementById('colorResult').textContent = c.name === correct.name ? 'Correct! 🎉' : 'Wrong! It was ' + correct.name;
    };
    options.appendChild(btn);
  });
}
newColorRound();

// 5. Number Guess
let secret = Math.floor(Math.random() * 100) + 1;
document.getElementById('guessBtn').addEventListener('click', () => {
  const val = +document.getElementById('guessInput').value;
  const res = document.getElementById('guessResult');
  if (!val) return;
  if (val === secret) res.textContent = 'Correct! 🎉 Number was ' + secret;
  else if (val < secret) res.textContent = 'Too low! Try higher';
  else res.textContent = 'Too high! Try lower';
});
function resetGuess() {
  secret = Math.floor(Math.random() * 100) + 1;
  document.getElementById('guessResult').textContent = '';
  document.getElementById('guessInput').value = '';
}
