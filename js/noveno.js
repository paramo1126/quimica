/* ============================================================
   SEMANA CULTURAL DE QUÍMICA — 9° GRADO
   noveno.js | Quizz Gamificado (5 Min) + Bohr & Cajas Orbitales
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. ESTADO GLOBAL DEL QUIZZ & LIENZO
  ---------------------------------------------------------- */
  const state = {
    timerSeconds: 300, // 5 Minutos
    timerInterval: null,
    score: 0,
    challengesCompleted: [false, false, false, false, false, false], // 6 desafíos
    bohrActive: false,
    draggingAtom: null,
    dragOffset: { x: 0, y: 0 }
  };

  /* ----------------------------------------------------------
     2. INICIALIZACIÓN
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    startTimer();
    initAtomDrag();
    initArrowDragAndDrop();
    updateBondLines();
  });

  /* ----------------------------------------------------------
     3. TEMPORIZADOR CONTRARRELOJ (5 MINUTOS)
  ---------------------------------------------------------- */
  function startTimer() {
    clearInterval(state.timerInterval);
    state.timerSeconds = 300;
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      state.timerSeconds--;
      updateTimerDisplay();

      if (state.timerSeconds <= 0) {
        clearInterval(state.timerInterval);
        finishQuiz(true);
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById('timer-display');
    const badgeEl = document.getElementById('quiz-timer-badge');
    if (!timerEl) return;

    const mins = Math.floor(state.timerSeconds / 60);
    const secs = state.timerSeconds % 60;
    timerEl.textContent = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (state.timerSeconds <= 60 && badgeEl) {
      badgeEl.classList.add('warning');
    } else if (badgeEl) {
      badgeEl.classList.remove('warning');
    }
  }

  /* ----------------------------------------------------------
     4. DESAFÍOS TEÓRICOS (1, 2 Y 3)
  ---------------------------------------------------------- */
  const theoryQuestions = {
    1: {
      correctIndex: 0,
      explanation: "En cualquier átomo neutro, el número de electrones es exactamente igual al número de protones (Z = 8)."
    },
    2: {
      correctIndex: 0,
      explanation: "El Principio de Exclusión de Wolfgang Pauli establece que dos electrones en un mismo orbital deben tener spines opuestos (+½ y -½)."
    },
    3: {
      correctIndex: 0,
      explanation: "El nivel principal n=2 contiene los orbitales 2s² y 2p⁴, totalizando 2 + 4 = 6 electrones de valencia en la capa exterior."
    }
  };

  window.answerTheory = function (questionNum, selectedIndex) {
    if (state.challengesCompleted[questionNum - 1]) return; // Ya respondida

    const q = theoryQuestions[questionNum];
    const optsContainer = document.getElementById(`opts-ch-${questionNum}`);
    const buttons = optsContainer.querySelectorAll('button');
    const expEl = document.getElementById(`exp-ch-${questionNum}`);
    const card = document.getElementById(`card-challenge-${questionNum}`);
    const badge = document.getElementById(`badge-ch-${questionNum}`);

    buttons.forEach(btn => (btn.disabled = true));

    if (selectedIndex === q.correctIndex) {
      buttons[selectedIndex].classList.add('correct');
      buttons[selectedIndex].style.borderColor = 'var(--success)';
      buttons[selectedIndex].style.background = 'rgba(52, 211, 153, 0.15)';
      card.classList.add('completed');
      badge.className = 'challenge-badge success';
      badge.innerHTML = `<i class="fa-solid fa-check"></i> Desafío ${questionNum} Superado`;

      state.challengesCompleted[questionNum - 1] = true;
      state.score++;
      updateScore();
    } else {
      buttons[selectedIndex].classList.add('wrong');
      buttons[selectedIndex].style.borderColor = 'var(--danger)';
      buttons[selectedIndex].style.background = 'rgba(248, 113, 113, 0.15)';
      buttons[q.correctIndex].style.borderColor = 'var(--success)';
      card.classList.add('failed');
      badge.className = 'challenge-badge danger';
      badge.innerHTML = `<i class="fa-solid fa-xmark"></i> Desafío ${questionNum} Incorrecto`;
      state.challengesCompleted[questionNum - 1] = false;
    }

    expEl.textContent = q.explanation;
    expEl.classList.remove('hidden');

    checkAllCompleted();
  };

  function updateScore() {
    document.getElementById('score-counter').textContent = `${state.score} / 6`;
  }

  /* ----------------------------------------------------------
     5. DESAFÍO 4: PRÁCTICO NÚCLEOS ATÓMICOS
  ---------------------------------------------------------- */
  window.toggleAccordion = function () {
    const body = document.getElementById('accordion-body');
    const icon = document.getElementById('accordion-icon');
    body.classList.toggle('open');
    icon.classList.toggle('fa-chevron-up');
    icon.classList.toggle('fa-chevron-down');
  };

  window.saveAtomNuclei = function () {
    const Op = parseInt(document.getElementById('inp-O-p').value) || 0;
    const On = parseInt(document.getElementById('inp-O-n').value) || 0;
    const H1p = parseInt(document.getElementById('inp-H1-p').value) || 0;
    const H1n = parseInt(document.getElementById('inp-H1-n').value) || 0;
    const H2p = parseInt(document.getElementById('inp-H2-p').value) || 0;
    const H2n = parseInt(document.getElementById('inp-H2-n').value) || 0;

    // Actualizar texto dentro de los círculos del lienzo
    document.getElementById('specs-O').textContent = `${Op}p⁺ · ${On}n`;
    document.getElementById('specs-H1').textContent = `${H1p}p⁺ · ${H1n}n`;
    document.getElementById('specs-H2').textContent = `${H2p}p⁺ · ${H2n}n`;

    const card = document.getElementById('card-challenge-4');
    const badge = document.getElementById('badge-ch-4');

    if (Op === 8 && On === 8 && H1p === 1 && H1n === 0 && H2p === 1 && H2n === 0) {
      if (!state.challengesCompleted[3]) {
        state.challengesCompleted[3] = true;
        state.score++;
        updateScore();
      }
      card.classList.add('completed');
      card.classList.remove('failed');
      badge.className = 'challenge-badge success';
      badge.innerHTML = `<i class="fa-solid fa-check"></i> Desafío 4 Superado`;
      alert('¡Excelente! Protones y neutrones configurados correctamente para el H₂O.');
    } else {
      card.classList.add('failed');
      badge.className = 'challenge-badge danger';
      badge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Revisa los valores (O: 8p/8n, H: 1p/0n)`;
      alert('Valores incorrectos. Recuerda: Oxígeno tiene Z=8 (8p⁺, 8n) e Hidrógeno tiene Z=1 (1p⁺, 0n).');
    }

    checkAllCompleted();
  };

  /* ----------------------------------------------------------
     6. DESAFÍOS 5 & 6: CAJAS ORBITALES & VERIFICAR H2O
  ---------------------------------------------------------- */
  window.verificarRespuestaCompleta = function () {
    // Validar orbitales
    const box1s = document.getElementById('box-1s').querySelectorAll('.arrow-token');
    const box2s = document.getElementById('box-2s').querySelectorAll('.arrow-token');
    const box2px = document.getElementById('box-2px').querySelectorAll('.arrow-token');
    const box2py = document.getElementById('box-2py').querySelectorAll('.arrow-token');
    const box2pz = document.getElementById('box-2pz').querySelectorAll('.arrow-token');

    // Desafío 5: 1s con 2, 2s con 2, 2px con 2 (Regla de Pauli y Hund para oxígeno)
    const d5Correct = box1s.length === 2 && box2s.length === 2 && box2px.length === 2;

    // Desafío 6: Enlaces compartidos en 2py y 2pz con flechas de enlace de color
    const allTokens = document.querySelectorAll('.orbital-box .arrow-token');
    let hasRedBond = false;
    let hasBlueBond = false;
    allTokens.forEach(t => {
      if (t.dataset.type === 'bond-red') hasRedBond = true;
      if (t.dataset.type === 'bond-blue') hasBlueBond = true;
    });

    const d6Correct = hasRedBond && hasBlueBond && (box2py.length >= 1 && box2pz.length >= 1);

    if (d5Correct && !state.challengesCompleted[4]) {
      state.challengesCompleted[4] = true;
      state.score++;
    }

    if (d6Correct && !state.challengesCompleted[5]) {
      state.challengesCompleted[5] = true;
      state.score++;
    }

    updateScore();

    const badge5 = document.getElementById('badge-ch-5');
    const card5 = document.getElementById('card-challenge-5-6');

    if (d5Correct && d6Correct) {
      card5.classList.add('completed');
      badge5.className = 'challenge-badge success';
      badge5.innerHTML = '<i class="fa-solid fa-check"></i> Desafíos 5 y 6 Superados';

      // Iluminar cajas en verde
      document.querySelectorAll('.orbital-box').forEach(b => b.classList.add('correct'));

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#818CF8', '#34D399', '#F43F5E']
        });
      }

      alert('¡Configuración de H₂O verificada exitosamente! Has completado el llenado orbital y los enlaces covalentes.');
      finishQuiz(false);
    } else {
      let msg = 'Revisa las cajas orbitales:\n';
      if (!d5Correct) msg += '• 1s, 2s y 2px deben tener 2 electrones cada una (1s² 2s² 2p⁴).\n';
      if (!d6Correct) msg += '• Arrastra las flechas de enlace roja (H₁) y azul (H₂) a las cajas 2py y 2pz.';
      alert(msg);
    }
  };

  function checkAllCompleted() {
    const allDone = state.challengesCompleted.every(Boolean);
    if (allDone) {
      setTimeout(() => finishQuiz(false), 800);
    }
  }

  /* ----------------------------------------------------------
     7. LIENZO: ARRASTRE DE ÁTOMOS & BOHR
  ---------------------------------------------------------- */
  function initAtomDrag() {
    const lienzo = document.getElementById('lienzo');
    const atoms = document.querySelectorAll('.atom-circle');

    atoms.forEach(atom => {
      atom.addEventListener('mousedown', (e) => {
        state.draggingAtom = atom;
        const rect = atom.getBoundingClientRect();
        state.dragOffset.x = e.clientX - rect.left;
        state.dragOffset.y = e.clientY - rect.top;
        atom.classList.add('dragging');
      });
    });

    document.addEventListener('mousemove', (e) => {
      if (!state.draggingAtom) return;
      const lRect = lienzo.getBoundingClientRect();
      let newX = e.clientX - lRect.left - state.dragOffset.x;
      let newY = e.clientY - lRect.top - state.dragOffset.y;

      // Limitar a bordes del lienzo
      const maxW = lRect.width - state.draggingAtom.offsetWidth;
      const maxH = lRect.height - state.draggingAtom.offsetHeight;
      newX = Math.max(10, Math.min(newX, maxW - 10));
      newY = Math.max(10, Math.min(newY, maxH - 10));

      state.draggingAtom.style.left = `${newX}px`;
      state.draggingAtom.style.top = `${newY}px`;

      updateBondLines();
    });

    document.addEventListener('mouseup', () => {
      if (state.draggingAtom) {
        state.draggingAtom.classList.remove('dragging');
        state.draggingAtom = null;
      }
    });
  }

  window.toggleBohr = function () {
    state.bohrActive = !state.bohrActive;
    const btn = document.getElementById('btn-bohr-toggle');
    const line1 = document.getElementById('bond-O-H1');
    const line2 = document.getElementById('bond-O-H2');

    if (state.bohrActive) {
      line1.style.display = 'block';
      line2.style.display = 'block';
      btn.classList.add('bg-emerald-500');
      btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Bohr Activado';
      updateBondLines();
    } else {
      line1.style.display = 'none';
      line2.style.display = 'none';
      btn.classList.remove('bg-emerald-500');
      btn.innerHTML = '<i class="fa-solid fa-project-diagram mr-1"></i> Modelo de Bohr';
    }
  };

  function updateBondLines() {
    const O = document.getElementById('atom-O');
    const H1 = document.getElementById('atom-H1');
    const H2 = document.getElementById('atom-H2');
    const line1 = document.getElementById('bond-O-H1');
    const line2 = document.getElementById('bond-O-H2');

    if (!O || !H1 || !H2 || !line1 || !line2) return;

    function getCenter(el) {
      return {
        x: (parseInt(el.style.left) || 0) + el.offsetWidth / 2,
        y: (parseInt(el.style.top) || 0) + el.offsetHeight / 2
      };
    }

    const cO = getCenter(O);
    const cH1 = getCenter(H1);
    const cH2 = getCenter(H2);

    line1.setAttribute('x1', cO.x);
    line1.setAttribute('y1', cO.y);
    line1.setAttribute('x2', cH1.x);
    line1.setAttribute('y2', cH1.y);

    line2.setAttribute('x1', cO.x);
    line2.setAttribute('y1', cO.y);
    line2.setAttribute('x2', cH2.x);
    line2.setAttribute('y2', cH2.y);
  }

  /* ----------------------------------------------------------
     8. CAJAS ORBITALES DRAG & DROP
  ---------------------------------------------------------- */
  function initArrowDragAndDrop() {
    const paletteTokens = document.querySelectorAll('.arrow-palette .arrow-token');
    const boxes = document.querySelectorAll('.orbital-box');

    paletteTokens.forEach(token => {
      token.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: token.dataset.type,
          symbol: token.textContent.trim(),
          source: 'palette'
        }));
      });
    });

    boxes.forEach(box => {
      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('dragover');
      });

      box.addEventListener('dragleave', () => box.classList.remove('dragover'));

      box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('dragover');

        const currentArrows = box.querySelectorAll('.arrow-token');
        if (currentArrows.length >= 2) {
          alert('¡Límite alcanzado! Según el Principio de Pauli, cada caja orbital solo acepta un máximo de 2 electrones.');
          return;
        }

        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          createArrowInBox(box, data.type, data.symbol);
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  function createArrowInBox(box, type, symbol) {
    const arrow = document.createElement('div');
    arrow.className = `arrow-token arrow-${type}`;
    arrow.textContent = symbol;
    arrow.dataset.type = type;
    arrow.title = 'Haz clic para eliminar este electrón';

    // Clic para eliminar
    arrow.onclick = () => {
      arrow.remove();
      box.classList.remove('correct', 'wrong');
    };

    box.appendChild(arrow);
  }

  window.clearOrbitals = function () {
    document.querySelectorAll('.orbital-box').forEach(box => {
      box.innerHTML = '';
      box.classList.remove('correct', 'wrong');
    });
  };

  /* ----------------------------------------------------------
     9. MODAL DE RESULTADOS FINALES
  ---------------------------------------------------------- */
  function finishQuiz(timedOut) {
    clearInterval(state.timerInterval);

    const modal = document.getElementById('modal-results');
    const titleEl = document.getElementById('modal-result-title');
    const scoreEl = document.getElementById('modal-result-score');
    const msgEl = document.getElementById('modal-result-msg');

    scoreEl.textContent = `${state.score} / 6`;

    if (timedOut) {
      titleEl.textContent = '¡Tiempo Agotado!';
      msgEl.textContent = `Se agotaron los 5 minutos del laboratorio. Tu puntaje final fue de ${state.score}/6. ¡Puedes reiniciar para mejorar tu velocidad!`;
    } else if (state.score === 6) {
      titleEl.textContent = '¡Puntaje Perfecto 6/6!';
      msgEl.textContent = '¡Extraordinario! Has dominado el Principio de Pauli, electrones de valencia, configuración 1s²2s²2p⁴ y los enlaces del agua.';
    } else if (state.score >= 4) {
      titleEl.textContent = '¡Gran Desempeño!';
      msgEl.textContent = `Obtuviste ${state.score}/6. Conoces bien la estructura atómica y configuración cuántica.`;
    } else {
      titleEl.textContent = 'Buen Intento';
      msgEl.textContent = `Tu puntaje fue de ${state.score}/6. Revisa los principios cuánticos y vuelve a intentarlo.`;
    }

    modal.classList.add('open');

    if (state.score >= 5 && typeof confetti === 'function') {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#818CF8', '#34D399', '#FBBF24']
      });
    }
  }

  window.restartNovenoQuiz = function () {
    const modal = document.getElementById('modal-results');
    modal.classList.remove('open');

    state.score = 0;
    state.challengesCompleted = [false, false, false, false, false, false];
    updateScore();

    // Reset UI
    clearOrbitals();
    document.querySelectorAll('.challenge-card').forEach(c => c.className = 'challenge-card');
    document.querySelectorAll('.option-btn').forEach(b => {
      b.disabled = false;
      b.className = 'option-btn text-xs p-2';
      b.style = '';
    });
    document.querySelectorAll('[id^="exp-ch-"]').forEach(e => e.classList.add('hidden'));

    startTimer();
  };

})();
