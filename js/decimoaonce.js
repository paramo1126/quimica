/* ============================================================
   SEMANA CULTURAL DE QUÍMICA — 10° Y 11° GRADO
   decimoaonce.js | Laboratorio Three.js 3D + Quizz (5 Min)
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. ESTADO GLOBAL & BANCO DE DESAFÍOS
  ---------------------------------------------------------- */
  const quizState = {
    timerSeconds: 300, // 5 Minutos
    timerInterval: null,
    score: 0,
    challenges: [false, false, false, false, false, false]
  };

  const theoryData = {
    1: { correctIndex: 0, exp: "Los átomos de no metales comparten pares de electrones para completar su octeto mediante enlaces covalentes." },
    2: { correctIndex: 0, exp: "El grupo hidroxilo (-OH) unido a un carbono saturado caracteriza químicamente a los alcoholes (como el etanol C₂H₅OH)." },
    3: { correctIndex: 0, exp: "Los alcanos son hidrocarburos alifáticos saturados (fórmula CₙH₂ₙ₊₂); el metano CH₄ es su miembro más simple." }
  };

  /* ----------------------------------------------------------
     2. REACCIONES & BASES DE DATOS DE MOLÉCULAS
  ---------------------------------------------------------- */
  const reactions = {
    "H2O": {
      name: "Agua",
      formula: "H₂O",
      type: "Covalente Polar",
      desc: "Molécula angular polar (104.5°) vital para la vida y excelente solvente universal.",
      emoji: "💧",
      color: 0x38BDF8,
      challengeIndex: 3
    },
    "NaCl": {
      name: "Cloruro de Sodio (Sal Común)",
      formula: "NaCl",
      type: "Enlace Iónico",
      desc: "Estructura cristalina por atracción electrostática entre catión Na⁺ y anión Cl⁻.",
      emoji: "🧂",
      color: 0xFBBF24,
      challengeIndex: 4
    },
    "C2H6O": {
      name: "Etanol (Alcohol Etílico)",
      formula: "C₂H₅OH",
      type: "Orgánico / Alcohol",
      desc: "Compuesto orgánico con cadena de 2 carbonos y grupo funcional hidroxilo (-OH).",
      emoji: "🍷",
      color: 0x818CF8,
      challengeIndex: 5
    },
    "CO2": {
      name: "Dióxido de Carbono",
      formula: "CO₂",
      type: "Covalente Lineal",
      desc: "Gas con dobles enlaces covalentes y geometría lineal no polar.",
      emoji: "🌿",
      color: 0x34D399
    },
    "HCl": {
      name: "Ácido Clorhídrico",
      formula: "HCl",
      type: "Covalente Polar",
      desc: "Ácido fuerte en disolución acuosa con enlace covalente polar H-Cl.",
      emoji: "⚗️",
      color: 0xF43F5E
    }
  };

  let selectedElements = [];
  let currentMolecule = null;

  /* ----------------------------------------------------------
     3. THREE.JS REACTOR SCENE
  ---------------------------------------------------------- */
  const canvas = document.getElementById('reactor-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x070B14, 1);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  // Iluminación volumétrica formal
  const ambientLight = new THREE.AmbientLight(0x131B2E, 2.0);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x38BDF8, 3.0, 30);
  cyanLight.position.set(4, 4, 4);
  scene.add(cyanLight);

  const secondaryLight = new THREE.PointLight(0x818CF8, 2.5, 30);
  secondaryLight.position.set(-4, -4, 4);
  scene.add(secondaryLight);

  // Carcasa del Reactor 3D (Torus wireframe)
  const torusGeo = new THREE.TorusGeometry(3.6, 0.06, 16, 90);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.35 });
  const torus1 = new THREE.Mesh(torusGeo, torusMat);
  scene.add(torus1);

  const torus2Geo = new THREE.TorusGeometry(3.2, 0.04, 12, 70);
  const torus2Mat = new THREE.MeshBasicMaterial({ color: 0x818CF8, transparent: true, opacity: 0.25 });
  const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
  torus2.rotation.x = Math.PI / 2;
  scene.add(torus2);

  const shellGeo = new THREE.SphereGeometry(3.0, 16, 12);
  const shellMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, wireframe: true, transparent: true, opacity: 0.05 });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  scene.add(shell);

  // Grupo central de la molécula sintetizada
  const moleculeGroup = new THREE.Group();
  scene.add(moleculeGroup);

  // Partículas de fondo
  const PART_COUNT = 150;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PART_COUNT * 3);
  for (let i = 0; i < PART_COUNT * 3; i++) {
    pPos[i] = (Math.random() - 0.5) * 14;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x38BDF8, size: 0.04, transparent: true, opacity: 0.45 });
  scene.add(new THREE.Points(pGeo, pMat));

  /* ----------------------------------------------------------
     4. CONTROLES DE ÓRBITA MANUALES (MOUSE & TOUCH)
  ---------------------------------------------------------- */
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };
  let theta = 0;
  let phi = Math.PI / 2;
  let radius = 7.5;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMousePos.x;
    const deltaY = e.clientY - prevMousePos.y;
    prevMousePos = { x: e.clientX, y: e.clientY };

    theta -= deltaX * 0.008;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY * 0.008));
  });

  window.addEventListener('mouseup', () => (isDragging = false));

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    radius = Math.max(4, Math.min(12, radius + e.deltaY * 0.005));
  }, { passive: false });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePos.x;
    const deltaY = e.touches[0].clientY - prevMousePos.y;
    prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    theta -= deltaX * 0.008;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY * 0.008));
  });

  window.addEventListener('touchend', () => (isDragging = false));

  /* ----------------------------------------------------------
     5. ANIMATION LOOP
  ---------------------------------------------------------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Actualizar posición de cámara esférica
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);

    // Rotación suave del reactor
    torus1.rotation.x = elapsed * 0.15;
    torus1.rotation.y = elapsed * 0.1;
    torus2.rotation.y = elapsed * 0.12;
    torus2.rotation.z = elapsed * 0.08;
    shell.rotation.y = elapsed * 0.04;

    // Animación de la molécula
    if (currentMolecule) {
      currentMolecule.rotation.y += 0.01;
      currentMolecule.position.y = Math.sin(elapsed * 1.5) * 0.15;
    }

    renderer.render(scene, camera);
  }

  function resizeRenderer() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  window.addEventListener('resize', resizeRenderer);

  /* ----------------------------------------------------------
     6. CONSTRUCCIÓN DE MODELOS MOLECULARES 3D
  ---------------------------------------------------------- */
  function createSphere(radius, colorHex, pos) {
    const geo = new THREE.SphereGeometry(radius, 28, 28);
    const mat = new THREE.MeshPhongMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.25,
      shininess: 90
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    return mesh;
  }

  function createBond(start, end, radius, colorHex) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(radius || 0.08, radius || 0.08, len, 16);
    const mat = new THREE.MeshPhongMaterial({ color: colorHex || 0x94A3B8, shininess: 40 });
    const cylinder = new THREE.Mesh(geo, mat);

    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    cylinder.position.copy(mid);

    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return cylinder;
  }

  function buildMolecule3D(key) {
    const group = new THREE.Group();

    if (key === 'H2O') {
      // Oxígeno central (rojo)
      const pO = new THREE.Vector3(0, 0.2, 0);
      const pH1 = new THREE.Vector3(-1.2, -0.6, 0);
      const pH2 = new THREE.Vector3(1.2, -0.6, 0);

      group.add(createSphere(0.65, 0xF43F5E, pO)); // Oxígeno
      group.add(createSphere(0.35, 0xF8FAFC, pH1)); // H1
      group.add(createSphere(0.35, 0xF8FAFC, pH2)); // H2
      group.add(createBond(pO, pH1, 0.09, 0x38BDF8));
      group.add(createBond(pO, pH2, 0.09, 0x38BDF8));

    } else if (key === 'NaCl') {
      // Na (ámbar) + Cl (verde esmeralda)
      const pNa = new THREE.Vector3(-1.1, 0, 0);
      const pCl = new THREE.Vector3(1.1, 0, 0);

      group.add(createSphere(0.55, 0xFBBF24, pNa));
      group.add(createSphere(0.75, 0x34D399, pCl));
      group.add(createBond(pNa, pCl, 0.12, 0xE2E8F0));

    } else if (key === 'C2H6O') {
      // Etanol: C1 - C2 - O - H + 5 Hidrógenos
      const pC1 = new THREE.Vector3(-1.2, 0, 0);
      const pC2 = new THREE.Vector3(0.2, 0, 0);
      const pO = new THREE.Vector3(1.3, 0.8, 0);
      const pOH_H = new THREE.Vector3(2.0, 0.5, 0);

      group.add(createSphere(0.5, 0x475569, pC1)); // Carbono 1
      group.add(createSphere(0.5, 0x475569, pC2)); // Carbono 2
      group.add(createSphere(0.48, 0xF43F5E, pO)); // Oxígeno grupo -OH
      group.add(createSphere(0.25, 0xF8FAFC, pOH_H)); // H del -OH

      // Enlaces principales
      group.add(createBond(pC1, pC2, 0.08, 0x94A3B8));
      group.add(createBond(pC2, pO, 0.08, 0xF43F5E));
      group.add(createBond(pO, pOH_H, 0.06, 0x38BDF8));

      // 3 Hidrógenos en C1 (CH3)
      const hC1_1 = new THREE.Vector3(-1.8, 0.8, 0);
      const hC1_2 = new THREE.Vector3(-1.8, -0.8, 0);
      const hC1_3 = new THREE.Vector3(-1.5, 0, 0.8);
      [hC1_1, hC1_2, hC1_3].forEach(pos => {
        group.add(createSphere(0.24, 0xF8FAFC, pos));
        group.add(createBond(pC1, pos, 0.05, 0x64748B));
      });

      // 2 Hidrógenos en C2 (CH2)
      const hC2_1 = new THREE.Vector3(0.2, -0.9, 0.4);
      const hC2_2 = new THREE.Vector3(0.2, -0.9, -0.4);
      [hC2_1, hC2_2].forEach(pos => {
        group.add(createSphere(0.24, 0xF8FAFC, pos));
        group.add(createBond(pC2, pos, 0.05, 0x64748B));
      });

    } else if (key === 'CO2') {
      const pC = new THREE.Vector3(0, 0, 0);
      const pO1 = new THREE.Vector3(-1.5, 0, 0);
      const pO2 = new THREE.Vector3(1.5, 0, 0);

      group.add(createSphere(0.5, 0x475569, pC));
      group.add(createSphere(0.55, 0xF43F5E, pO1));
      group.add(createSphere(0.55, 0xF43F5E, pO2));
      group.add(createBond(pC, pO1, 0.09, 0x34D399));
      group.add(createBond(pC, pO2, 0.09, 0x34D399));

    } else if (key === 'HCl') {
      const pH = new THREE.Vector3(-0.9, 0, 0);
      const pCl = new THREE.Vector3(0.9, 0, 0);
      group.add(createSphere(0.3, 0xF8FAFC, pH));
      group.add(createSphere(0.7, 0x34D399, pCl));
      group.add(createBond(pH, pCl, 0.09, 0x94A3B8));
    }

    return group;
  }

  /* ----------------------------------------------------------
     7. LÓGICA DE REACCIÓN QUÍMICA & CARGA
  ---------------------------------------------------------- */
  function normalizeElements(list) {
    const counts = {};
    list.forEach(el => counts[el] = (counts[el] || 0) + 1);

    // H2O (2H + 1O)
    if (counts['H'] === 2 && counts['O'] === 1 && Object.keys(counts).length === 2) return "H2O";
    // NaCl (1Na + 1Cl)
    if (counts['Na'] === 1 && counts['Cl'] === 1 && Object.keys(counts).length === 2) return "NaCl";
    // C2H6O Etanol (2C + 6H + 1O)
    if (counts['C'] === 2 && counts['H'] === 6 && counts['O'] === 1 && Object.keys(counts).length === 3) return "C2H6O";
    // CO2 (1C + 2O)
    if (counts['C'] === 1 && counts['O'] === 2 && Object.keys(counts).length === 2) return "CO2";
    // HCl (1H + 1Cl)
    if (counts['H'] === 1 && counts['Cl'] === 1 && Object.keys(counts).length === 2) return "HCl";

    return null;
  }

  window.addElement = function (symbol) {
    if (selectedElements.length >= 9) {
      alert('El reactor tiene capacidad máxima para 9 átomos en esta experiencia.');
      return;
    }
    selectedElements.push(symbol);
    updateTrayUI();
  };

  window.removeElement = function (index) {
    selectedElements.splice(index, 1);
    updateTrayUI();
  };

  window.loadPreset = function (arr) {
    selectedElements = [...arr];
    updateTrayUI();
  };

  window.clearReactor = function () {
    selectedElements = [];
    updateTrayUI();
    clearMolecule();
    document.getElementById('molecule-result-card').style.display = 'none';
    document.getElementById('formula-display').textContent = 'Reactor Vacío';
    torusMat.color.setHex(0x38BDF8);
  };

  function clearMolecule() {
    while (moleculeGroup.children.length > 0) {
      moleculeGroup.remove(moleculeGroup.children[0]);
    }
    currentMolecule = null;
  }

  function updateTrayUI() {
    const tray = document.getElementById('loaded-elements-tray');
    const counter = document.getElementById('elements-count');
    const formulaDisplay = document.getElementById('formula-display');

    counter.textContent = `${selectedElements.length} / 9 átomos`;

    if (selectedElements.length === 0) {
      tray.innerHTML = '<span class="text-xs text-slate-500 italic">Haz clic en elementos o en las cargas rápidas...</span>';
      formulaDisplay.textContent = 'Reactor Vacío';
      return;
    }

    tray.innerHTML = '';
    selectedElements.forEach((sym, idx) => {
      const pill = document.createElement('div');
      pill.className = 'element-pill-token';
      pill.innerHTML = `
        <span>${sym}</span>
        <button class="btn-remove-token" onclick="removeElement(${idx})">×</button>
      `;
      tray.appendChild(pill);
    });

    formulaDisplay.textContent = `Mezcla: ${selectedElements.join(' + ')}`;
  }

  window.reactElements = function () {
    if (selectedElements.length === 0) {
      alert('Agrega elementos químicos antes de activar el reactor.');
      return;
    }

    const key = normalizeElements(selectedElements);
    if (!key || !reactions[key]) {
      alert('Combinación no compatible para síntesis estable. Prueba con las combinaciones de los desafíos: 2H + O (Agua), Na + Cl (Sal) o 2C + 6H + O (Etanol).');
      return;
    }

    const r = reactions[key];

    // Limpiar molécula anterior y añadir nueva
    clearMolecule();
    currentMolecule = buildMolecule3D(key);
    moleculeGroup.add(currentMolecule);

    // Destello de color del reactor
    torusMat.color.setHex(r.color);

    // Actualizar UI de resultado
    const card = document.getElementById('molecule-result-card');
    document.getElementById('mol-emoji').textContent = r.emoji;
    document.getElementById('mol-name').textContent = `${r.name} (${r.formula})`;
    document.getElementById('mol-desc').textContent = r.desc;
    document.getElementById('mol-type').textContent = r.type;
    card.style.display = 'flex';

    document.getElementById('formula-display').textContent = `Sintetizado: ${r.formula}`;

    // Validar desafío correspondiente
    if (r.challengeIndex && !quizState.challenges[r.challengeIndex - 1]) {
      const chIdx = r.challengeIndex;
      quizState.challenges[chIdx - 1] = true;
      quizState.score++;
      updateScoreUI();

      const chBox = document.getElementById(`ch-box-${chIdx}`);
      const chBadge = document.getElementById(`ch-badge-${chIdx}`);
      const statusP = document.getElementById(`status-ch-${chIdx}`);

      chBox.classList.add('completed');
      chBadge.className = 'challenge-badge-pill success';
      chBadge.innerHTML = `<i class="fa-solid fa-check"></i> Desafío ${chIdx} Superado`;
      statusP.textContent = `¡Sintetizado exitosamente: ${r.formula}!`;
      statusP.className = 'text-[11px] text-emerald-400 font-bold';

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#818CF8', '#34D399']
        });
      }
    }

    checkAllCompleted();
  };

  /* ----------------------------------------------------------
     8. TEORÍA AVANZADA (DESAFÍOS 1, 2 Y 3)
  ---------------------------------------------------------- */
  window.answerAdvancedTheory = function (questionNum, selectedIndex) {
    if (quizState.challenges[questionNum - 1]) return;

    const q = theoryData[questionNum];
    const container = document.getElementById(`opts-ch-${questionNum}`);
    const buttons = container.querySelectorAll('button');
    const expEl = document.getElementById(`exp-ch-${questionNum}`);
    const box = document.getElementById(`ch-box-${questionNum}`);
    const badge = document.getElementById(`ch-badge-${questionNum}`);

    buttons.forEach(b => (b.disabled = true));

    if (selectedIndex === q.correctIndex) {
      buttons[selectedIndex].classList.add('correct');
      box.classList.add('completed');
      badge.className = 'challenge-badge-pill success';
      badge.innerHTML = `<i class="fa-solid fa-check"></i> Desafío ${questionNum} Superado`;

      quizState.challenges[questionNum - 1] = true;
      quizState.score++;
      updateScoreUI();
    } else {
      buttons[selectedIndex].classList.add('wrong');
      buttons[q.correctIndex].classList.add('correct');
      box.classList.add('wrong');
      badge.className = 'challenge-badge-pill danger';
      badge.innerHTML = `<i class="fa-solid fa-xmark"></i> Desafío ${questionNum} Incorrecto`;
      quizState.challenges[questionNum - 1] = false;
    }

    expEl.textContent = q.exp;
    expEl.classList.remove('hidden');

    checkAllCompleted();
  };

  function updateScoreUI() {
    document.getElementById('score-counter').textContent = `${quizState.score} / 6`;
  }

  function checkAllCompleted() {
    if (quizState.challenges.every(Boolean)) {
      setTimeout(() => finishQuiz(false), 900);
    }
  }

  /* ----------------------------------------------------------
     9. TEMPORIZADOR CONTRARRELOJ (5 MINUTOS)
  ---------------------------------------------------------- */
  function startTimer() {
    clearInterval(quizState.timerInterval);
    quizState.timerSeconds = 300;
    updateTimerDisplay();

    quizState.timerInterval = setInterval(() => {
      quizState.timerSeconds--;
      updateTimerDisplay();

      if (quizState.timerSeconds <= 0) {
        clearInterval(quizState.timerInterval);
        finishQuiz(true);
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById('timer-display');
    const badgeEl = document.getElementById('quiz-timer-badge');
    if (!timerEl) return;

    const mins = Math.floor(quizState.timerSeconds / 60);
    const secs = quizState.timerSeconds % 60;
    timerEl.textContent = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (quizState.timerSeconds <= 60 && badgeEl) {
      badgeEl.classList.add('warning');
    } else if (badgeEl) {
      badgeEl.classList.remove('warning');
    }
  }

  /* ----------------------------------------------------------
     10. MODAL DE RESULTADOS FINALES & CONFETI
  ---------------------------------------------------------- */
  function finishQuiz(timedOut) {
    clearInterval(quizState.timerInterval);

    const modal = document.getElementById('modal-results');
    const titleEl = document.getElementById('modal-result-title');
    const scoreEl = document.getElementById('modal-result-score');
    const msgEl = document.getElementById('modal-result-msg');

    scoreEl.textContent = `${quizState.score} / 6`;

    if (timedOut) {
      titleEl.textContent = '¡Tiempo Agotado!';
      msgEl.textContent = `El temporizador de 5 minutos llegó a su fin. Tu puntaje fue de ${quizState.score}/6. ¡Reinicia para optimizar tu tiempo y síntesis!`;
    } else if (quizState.score === 6) {
      titleEl.textContent = '¡Maestría Química 6/6!';
      msgEl.textContent = '¡Excelente! Dominaste los enlaces covalentes, la química orgánica funcional y sintetizaste con éxito Agua, Sal y Etanol en 3D.';
    } else if (quizState.score >= 4) {
      titleEl.textContent = '¡Muy Buen Trabajo!';
      msgEl.textContent = `Lograste ${quizState.score}/6 desafíos. Buen dominio de la reactividad molecular y modelos 3D.`;
    } else {
      titleEl.textContent = 'Desafío Concluido';
      msgEl.textContent = `Tu puntaje fue de ${quizState.score}/6. Revisa las familias orgánicas y los tipos de enlace para intentarlo de nuevo.`;
    }

    modal.classList.add('open');

    if (quizState.score >= 5 && typeof confetti === 'function') {
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#818CF8', '#34D399', '#FBBF24']
      });
    }
  }

  window.restartDecimoQuiz = function () {
    const modal = document.getElementById('modal-results');
    modal.classList.remove('open');

    quizState.score = 0;
    quizState.challenges = [false, false, false, false, false, false];
    updateScoreUI();

    clearReactor();

    // Reset UI
    document.querySelectorAll('.challenge-box').forEach(b => b.className = 'challenge-box');
    document.querySelectorAll('.opt-btn-sm').forEach(b => {
      b.disabled = false;
      b.className = 'opt-btn-sm';
    });
    document.querySelectorAll('[id^="exp-ch-"]').forEach(e => e.classList.add('hidden'));

    document.getElementById('status-ch-4').textContent = 'Estado: Pendiente de reacción';
    document.getElementById('status-ch-4').className = 'text-[11px] text-slate-400';
    document.getElementById('status-ch-5').textContent = 'Estado: Pendiente de reacción';
    document.getElementById('status-ch-5').className = 'text-[11px] text-slate-400';
    document.getElementById('status-ch-6').textContent = 'Estado: Pendiente de reacción';
    document.getElementById('status-ch-6').className = 'text-[11px] text-slate-400';

    startTimer();
  };

  /* ----------------------------------------------------------
     11. INIT
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    resizeRenderer();
    animate();
    startTimer();
    updateTrayUI();
  });

})();
