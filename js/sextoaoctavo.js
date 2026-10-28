/* ============================================================
   SEMANA CULTURAL DE QUÍMICA — 6° A 8° GRADO
   sextoaoctavo.js | Quizz Gamificado (4 Min) + Laboratorio
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. BANCO DE 6 PREGUNTAS / DESAFÍOS (6° - 8°)
  ---------------------------------------------------------- */
  const quizQuestions = [
    {
      id: 1,
      type: "1. Teoría — Opción Múltiple",
      question: "¿Cuál es el estado de la materia donde las partículas están muy juntas y vibran sin desplazarse?",
      options: [
        { text: "Sólido", correct: true },
        { text: "Líquido", correct: false },
        { text: "Gaseoso", correct: false },
        { text: "Plasma", correct: false }
      ],
      explanation: "En el estado sólido las intensas fuerzas de atracción mantienen las partículas fijas en una estructura ordenada, permitiéndoles solo vibrar."
    },
    {
      id: 2,
      type: "2. Completar Frase — Cambios de Estado",
      question: "El paso directo de estado líquido a gaseoso por aumento de calor se llama ________.",
      options: [
        { text: "Evaporación", correct: true },
        { text: "Condensación", correct: false },
        { text: "Fusión", correct: false },
        { text: "Solidificación", correct: false }
      ],
      explanation: "La evaporación (o vaporización) ocurre cuando las moléculas superficiales del líquido absorben energía térmica suficiente para escapar al estado gaseoso."
    },
    {
      id: 3,
      type: "3. Clasificación — Sistemas Materiales",
      question: "¿Cuál de los siguientes ejemplos es una MEZCLA HETEROGÉNEA?",
      options: [
        { text: "Agua con aceite", correct: true },
        { text: "Agua con sal disuelta", correct: false },
        { text: "Aire atmosférico filtrado", correct: false },
        { text: "Alcohol medicinal al 70%", correct: false }
      ],
      explanation: "El agua y el aceite son líquidos inmiscibles que forman fases ópticamente distinguibles a simple vista (mezcla heterogénea)."
    },
    {
      id: 4,
      type: "4. Teoría — Fenómenos de la Materia",
      question: "Si cortamos una manzana y se vuelve café al contacto con el aire, ¿qué tipo de cambio ocurrió?",
      options: [
        { text: "Cambio Químico (Oxidación)", correct: true },
        { text: "Cambio Físico (Evaporación)", correct: false },
        { text: "Cambio Físico (Fusión)", correct: false },
        { text: "Cambio Nuclear", correct: false }
      ],
      explanation: "Es un cambio químico conocido como pardeamiento enzimático: las polifenol oxidasas de la fruta reaccionan con el O₂ del aire creando nuevos pigmentos oscuros."
    },
    {
      id: 5,
      type: "5. Completar Frase — Escala de pH",
      question: "En la escala de pH, las sustancias con un valor MENOR a 7 se consideran ________.",
      options: [
        { text: "Ácidas", correct: true },
        { text: "Básicas (Alcalinas)", correct: false },
        { text: "Neutras", correct: false },
        { text: "Plasmáticas", correct: false }
      ],
      explanation: "Un pH de 0 a 6.9 define una solución ácida (mayor concentración de iones hidronio H⁺). El 7 es neutro y más de 7 es básico."
    },
    {
      id: 6,
      type: "6. Símbolos Químicos — Tabla Periódica",
      question: "¿Cuál es el símbolo químico correcto del Hierro en la tabla periódica?",
      options: [
        { text: "Fe", correct: true },
        { text: "F", correct: false },
        { text: "Hi", correct: false },
        { text: "Ir", correct: false }
      ],
      explanation: "El símbolo del hierro es 'Fe', derivado de su nombre clásico en latín 'Ferrum'. 'F' corresponde al Flúor e 'Ir' al Iridio."
    }
  ];

  /* ----------------------------------------------------------
     2. ESTADO DEL JUEGO & TEMPORIZADOR
  ---------------------------------------------------------- */
  let currentQuestionIndex = 0;
  let score = 0;
  let answered = false;
  let timerSeconds = 240; // 4 Minutos
  let timerInterval = null;
  let quizCompleted = false;

  /* ----------------------------------------------------------
     3. INICIALIZACIÓN
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    startTimer();
    renderQuestion(0);
    initLab();
  });

  /* ----------------------------------------------------------
     4. TEMPORIZADOR CONTRARRELOJ
  ---------------------------------------------------------- */
  function startTimer() {
    clearInterval(timerInterval);
    timerSeconds = 240;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timerSeconds--;
      updateTimerDisplay();

      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        finishQuiz(true); // Terminar por tiempo
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById('timer-display');
    const badgeEl = document.getElementById('quiz-timer-badge');
    if (!timerEl) return;

    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    const formatted = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timerEl.textContent = formatted;

    if (timerSeconds <= 60 && badgeEl) {
      badgeEl.classList.add('warning');
    } else if (badgeEl) {
      badgeEl.classList.remove('warning');
    }
  }

  /* ----------------------------------------------------------
     5. RENDERIZADO DE PREGUNTAS DEL QUIZZ
  ---------------------------------------------------------- */
  function renderQuestion(index) {
    if (index >= quizQuestions.length) {
      finishQuiz(false);
      return;
    }

    answered = false;
    currentQuestionIndex = index;

    // Actualizar indicador de pasos
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, idx) => {
      dot.classList.remove('active');
      if (idx === index) dot.classList.add('active');
    });

    const q = quizQuestions[index];
    document.getElementById('question-type').textContent = q.type;
    document.getElementById('question-title').textContent = q.question;

    // Ocultar feedback y botón siguiente
    const feedbackBox = document.getElementById('feedback-box');
    const nextBtn = document.getElementById('btn-next-question');
    feedbackBox.style.display = 'none';
    nextBtn.style.display = 'none';

    // Generar opciones
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="option-letter">${letters[idx]}</span>
          <span>${opt.text}</span>
        </div>
        <i class="option-status-icon fa-regular fa-circle text-slate-500"></i>
      `;
      btn.onclick = () => selectOption(btn, opt, q);
      container.appendChild(btn);
    });
  }

  /* ----------------------------------------------------------
     6. SELECCIÓN DE RESPUESTA & FEEDBACK INMEDIATO
  ---------------------------------------------------------- */
  function selectOption(selectedBtn, chosenOpt, questionData) {
    if (answered) return;
    answered = true;

    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => (btn.disabled = true));

    const dots = document.querySelectorAll('.step-dot');
    const currentDot = dots[currentQuestionIndex];

    const feedbackBox = document.getElementById('feedback-box');
    const feedbackHeader = document.getElementById('feedback-header');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackStatus = document.getElementById('feedback-status');
    const feedbackDesc = document.getElementById('feedback-desc');
    const nextBtn = document.getElementById('btn-next-question');

    if (chosenOpt.correct) {
      score++;
      document.getElementById('score-counter').textContent = `${score} / 6`;
      selectedBtn.classList.add('correct');
      selectedBtn.querySelector('.option-status-icon').className = 'option-status-icon fa-solid fa-circle-check text-emerald-400';
      if (currentDot) currentDot.classList.add('completed-correct');

      feedbackBox.className = 'feedback-box correct';
      feedbackHeader.className = 'feedback-header correct';
      feedbackIcon.className = 'fa-solid fa-circle-check text-emerald-400';
      feedbackStatus.textContent = '¡Respuesta Correcta!';
    } else {
      selectedBtn.classList.add('wrong');
      selectedBtn.querySelector('.option-status-icon').className = 'option-status-icon fa-solid fa-circle-xmark text-rose-400';
      if (currentDot) currentDot.classList.add('completed-wrong');

      // Resaltar la respuesta que era correcta
      allButtons.forEach((btn, idx) => {
        if (questionData.options[idx].correct) {
          btn.classList.add('correct');
          btn.querySelector('.option-status-icon').className = 'option-status-icon fa-solid fa-circle-check text-emerald-400';
        }
      });

      feedbackBox.className = 'feedback-box wrong';
      feedbackHeader.className = 'feedback-header wrong';
      feedbackIcon.className = 'fa-solid fa-circle-xmark text-rose-400';
      feedbackStatus.textContent = 'Respuesta Incorrecta';
    }

    feedbackDesc.textContent = questionData.explanation;
    feedbackBox.style.display = 'block';

    // Texto del botón siguiente
    if (currentQuestionIndex === quizQuestions.length - 1) {
      nextBtn.innerHTML = `<span>Ver Resultados Finales</span> <i class="fa-solid fa-trophy"></i>`;
    } else {
      nextBtn.innerHTML = `<span>Siguiente Pregunta</span> <i class="fa-solid fa-arrow-right"></i>`;
    }
    nextBtn.style.display = 'inline-flex';
  }

  window.nextQuestion = function () {
    renderQuestion(currentQuestionIndex + 1);
  };

  /* ----------------------------------------------------------
     7. MODAL DE RESULTADOS & CONFETTI
  ---------------------------------------------------------- */
  function finishQuiz(timedOut) {
    clearInterval(timerInterval);
    quizCompleted = true;

    const modal = document.getElementById('modal-results');
    const titleEl = document.getElementById('modal-result-title');
    const scoreEl = document.getElementById('modal-result-score');
    const msgEl = document.getElementById('modal-result-msg');

    scoreEl.textContent = `${score} / 6`;

    if (timedOut) {
      titleEl.textContent = '¡Tiempo Agotado!';
      msgEl.textContent = `Se acabaron los 4 minutos. Lograste resolver con un puntaje de ${score}/6. ¡Puedes reiniciar para mejorar tu tiempo!`;
    } else if (score === 6) {
      titleEl.textContent = '¡Puntuación Perfecta!';
      msgEl.textContent = '¡Excelente! Dominas a la perfección los fundamentos de la materia, cambios químicos, pH y símbolos periódicos.';
    } else if (score >= 4) {
      titleEl.textContent = '¡Muy Buen Trabajo!';
      msgEl.textContent = 'Tienes una sólida base en los conceptos químicos de 6° a 8°. ¡Sigue así!';
    } else {
      titleEl.textContent = 'Buen Intento';
      msgEl.textContent = 'La química requiere práctica. Puedes repasar la teoría y volver a intentarlo para conseguir el 6/6.';
    }

    modal.classList.add('open');

    // Confeti si puntaje es 5 o 6
    if (score >= 5 && typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#818CF8', '#34D399', '#FBBF24']
      });
    }
  }

  window.restartQuiz = function () {
    const modal = document.getElementById('modal-results');
    modal.classList.remove('open');
    score = 0;
    document.getElementById('score-counter').textContent = '0 / 6';

    const dots = document.querySelectorAll('.step-dot');
    dots.forEach(d => (d.className = 'step-dot'));

    startTimer();
    renderQuestion(0);
  };

  /* ----------------------------------------------------------
     8. VISTA SWITCHER (QUIZZ / LABORATORIO)
  ---------------------------------------------------------- */
  window.switchView = function (view) {
    const quizView = document.getElementById('view-quiz');
    const labView = document.getElementById('view-lab');
    const btnQuiz = document.getElementById('btn-mode-quiz');
    const btnLab = document.getElementById('btn-mode-lab');

    if (view === 'quiz') {
      quizView.style.display = 'block';
      labView.style.display = 'none';
      btnQuiz.classList.add('active');
      btnLab.classList.remove('active');
    } else {
      quizView.style.display = 'none';
      labView.style.display = 'block';
      btnQuiz.classList.remove('active');
      btnLab.classList.add('active');
    }
  };

  window.switchLabTab = function (tab) {
    document.getElementById('tab-lab-btn-1').classList.toggle('active', tab === 'estados');
    document.getElementById('tab-lab-btn-2').classList.toggle('active', tab === 'fq');
    document.getElementById('tab-lab-btn-3').classList.toggle('active', tab === 'ph');

    document.getElementById('lab-tab-estados').style.display = tab === 'estados' ? 'block' : 'none';
    document.getElementById('lab-tab-fq').style.display = tab === 'fq' ? 'block' : 'none';
    document.getElementById('lab-tab-ph').style.display = tab === 'ph' ? 'block' : 'none';
  };

  /* ----------------------------------------------------------
     9. LABORATORIO INTERACTIVO (D&D + FQ + pH)
  ---------------------------------------------------------- */
  function initLab() {
    // 9.1 Drag & Drop de Estados
    const cards = document.querySelectorAll('.draggable-card');
    const zones = document.querySelectorAll('.drop-zone');
    const tray = document.getElementById('cardsTray');

    let draggedItem = null;

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedItem = card;
        e.dataTransfer.setData('text/plain', card.dataset.substance);
        setTimeout(() => (card.style.opacity = '0.5'), 0);
      });
      card.addEventListener('dragend', () => {
        if (draggedItem) draggedItem.style.opacity = '1';
        draggedItem = null;
      });
    });

    zones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (draggedItem) {
          zone.querySelector('.zone-content').appendChild(draggedItem);
        }
      });
    });

    tray.addEventListener('dragover', (e) => e.preventDefault());
    tray.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedItem) tray.appendChild(draggedItem);
    });

    // 9.2 Físico vs Químico Data
    const fqData = [
      { emoji: '🧊', title: 'Derretir hielo', type: 'Físico', desc: 'Solo cambia de estado sólido a líquido; la molécula de H₂O se conserva intacta.' },
      { emoji: '🔥', title: 'Quemar madera', type: 'Químico', desc: 'Combustión: produce cenizas, dióxido de carbono y vapor mediante una reacción irreversible.' },
      { emoji: '✂️', title: 'Cortar papel', type: 'Físico', desc: 'Fragmentación mecánica sin alterar la estructura química de la celulosa.' },
      { emoji: '🦀', title: 'Oxidación del hierro', type: 'Químico', desc: 'El Fe reacciona con el O₂ formando óxido de hierro Fe₂O₃.' },
      { emoji: '💧', title: 'Hervir agua', type: 'Físico', desc: 'Paso de líquido a vapor por aumento de temperatura sin crear nuevas sustancias.' },
      { emoji: '🎂', title: 'Hornear un pastel', type: 'Químico', desc: 'Reacciones térmicas de Maillard y fermentación que crean nuevos compuestos.' }
    ];

    const fqContainer = document.getElementById('fq-cards-container');
    if (fqContainer) {
      fqContainer.innerHTML = '';
      fqData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'quiz-card p-5 text-center flex flex-col justify-between';
        card.innerHTML = `
          <div>
            <div class="text-4xl mb-3">${item.emoji}</div>
            <h4 class="font-bold text-slate-100 text-lg mb-2">${item.title}</h4>
            <p class="text-xs text-slate-400 mb-4">${item.desc}</p>
          </div>
          <span class="inline-block px-3 py-1 text-xs font-bold rounded-full ${item.type === 'Físico' ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'bg-indigo-950 text-indigo-400 border border-indigo-800'}">
            Cambio ${item.type}
          </span>
        `;
        fqContainer.appendChild(card);
      });
    }

    // 9.3 pH samples
    const phSamples = [
      { name: 'Jugo de Limón', ph: 2.2, type: 'Ácido fuerte', color: '#EF4444' },
      { name: 'Vinagre', ph: 3.0, type: 'Ácido moderado', color: '#F97316' },
      { name: 'Café negro', ph: 5.0, type: 'Ácido débil', color: '#FBBF24' },
      { name: 'Agua Pura', ph: 7.0, type: 'Neutro', color: '#34D399' },
      { name: 'Jabón de Manos', ph: 9.5, type: 'Base suave', color: '#38BDF8' },
      { name: 'Lejía / Cloro', ph: 13.0, type: 'Base fuerte', color: '#A855F7' }
    ];

    const phList = document.getElementById('ph-samples-list');
    if (phList) {
      phList.innerHTML = '';
      phSamples.forEach(s => {
        const div = document.createElement('div');
        div.className = 'p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between';
        div.innerHTML = `
          <div>
            <div class="font-bold text-sm text-slate-200">${s.name}</div>
            <div class="text-xs text-slate-400">${s.type}</div>
          </div>
          <div class="font-mono font-bold text-sm px-2.5 py-1 rounded" style="background:${s.color}20; color:${s.color}; border: 1px solid ${s.color}60;">
            pH ${s.ph}
          </div>
        `;
        phList.appendChild(div);
      });
    }
  }

  window.verificarEstados = function () {
    const solido = document.querySelectorAll('#zone-solido .draggable-card');
    const liquido = document.querySelectorAll('#zone-liquido .draggable-card');
    const gas = document.querySelectorAll('#zone-gas .draggable-card');

    let correctCount = 0;
    solido.forEach(c => { if (c.dataset.correct === 'solido') correctCount++; });
    liquido.forEach(c => { if (c.dataset.correct === 'liquido') correctCount++; });
    gas.forEach(c => { if (c.dataset.correct === 'gas') correctCount++; });

    if (correctCount === 8) {
      alert('¡Excelente! Todas las 8 sustancias están en su estado correcto.');
      if (typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      alert(`Has clasificado correctamente ${correctCount} de 8 sustancias. ¡Revisa la bandeja e inténtalo de nuevo!`);
    }
  };

  window.resetEstados = function () {
    const tray = document.getElementById('cardsTray');
    const cards = document.querySelectorAll('.draggable-card');
    cards.forEach(c => tray.appendChild(c));
  };

})();
