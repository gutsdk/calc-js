document.addEventListener('DOMContentLoaded', function() {
  let currentDisplay = '0';
  const display = document.getElementById('display');

  // Режимы
  const modeBtns = document.querySelectorAll('.mode-btn');
  const basicMode = document.querySelector('.basic-mode');
  const advancedMode = document.querySelector('.advanced-mode');
  const graphMode = document.querySelector('.graph-mode');

  // Графики
  const functionInput = document.getElementById('functionInput');
  const plotBtn = document.getElementById('plotBtn');
  const clearPlotBtn = document.getElementById('clearPlotBtn');
  const graphCanvas = document.getElementById('graphCanvas');
  const ctx = graphCanvas.getContext('2d');

  // Справка
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeModal = document.getElementById('closeModal');
  const tablinks = document.querySelectorAll('.tablinks');
  const tabcontents = document.querySelectorAll('.tabcontent');

  graphCanvas.width = 300;
  graphCanvas.height = 300;

  // Переключение режимов
  modeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      modeBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const mode = this.dataset.mode;
      basicMode.classList.add('hidden');
      advancedMode.classList.add('hidden');
      graphMode.classList.add('hidden');

      if (mode === 'basic') {
        basicMode.classList.remove('hidden');
        display.textContent = currentDisplay;
      } else if (mode === 'advanced') {
        advancedMode.classList.remove('hidden');
        display.textContent = currentDisplay;
      } else if (mode === 'graph') {
        display.textContent = 'Режим графики';
        graphMode.classList.remove('hidden');
        drawGrid();
      }
    });
  });

  const buttons = document.querySelectorAll('.buttons button, .advanced-mode button');

  buttons.forEach(button => {
    button.addEventListener('click', function() {
      const value = this.textContent;

      if (this.classList.contains('clear')) {
        clearDisplay();
      } else if (this.classList.contains('equals')) {
        calculate();
      } else if (this.classList.contains('backspace')) {
        backspace();
      } else if (this.classList.contains('function')) {
        handleFunction(value);
      } else if (this.classList.contains('constant')) {
        handleConstant(value);
      } else {
        appendToDisplay(value);
      }
    });
  });

  // Построение графиков
  plotBtn.addEventListener('click', plotFunction);
  clearPlotBtn.addEventListener('click', clearPlot);

  // Справка
  helpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
  });

  closeModal.addEventListener('click', () => {
    helpModal.classList.add('hidden');
  });

  tablinks.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;

      tablinks.forEach(tl => tl.classList.remove('active'));
      tabcontents.forEach(tc => tc.style.display = 'none');

      this.classList.add('active');
      document.getElementById(tabName).style.display = 'block';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.add('hidden');
    }
  });

  // Обработка клавиатуры
  document.addEventListener('keydown', function(e) {
    const activeMode = document.querySelector('.mode-btn.active').dataset.mode;

    if (activeMode === 'graph') {
      if (document.activeElement !== functionInput) {
        e.preventDefault();
      }
      return;
    }

    const key = e.key;
    if (/[0-9]/.test(key)) {
      appendToDisplay(key);
    } else if (['+', '-', '*', '/', '^', '(', ')', '%'].includes(key)) {
      handleOperator(key);
    } else if (key === '.') {
      handleDecimal();
    } else if (key === 'Enter' || key === '=') {
      calculate();
    } else if (key === 'Escape') {
      clearDisplay();
    } else if (key === 'Backspace') {
      backspace();
    }
  });

  function updateDisplay() {
    display.textContent = currentDisplay;
  }

  function appendToDisplay(value) {
    if (currentDisplay === '0' && value !== '.') {
      currentDisplay = value;
    } else {
      currentDisplay += value;
    }
    updateDisplay();
  }

  function clearDisplay() {
    currentDisplay = '0';
    updateDisplay();
  }

  function backspace() {
    if (currentDisplay.length === 1) {
      currentDisplay = '0';
    } else {
      currentDisplay = currentDisplay.slice(0, -1);
    }
    updateDisplay();
  }

  function handleOperator(operator) {
    const op = operator === 'x' ? '*' : operator;
    appendToDisplay(op);
  }

  function handleFunction(func) {
    appendToDisplay(func + '(');
    updateDisplay();
  }

  function handleConstant(constant) {
    if (constant === 'π'){
      appendToDisplay(Math.PI.toString());
    } else if (constant === 'e') {
      appendToDisplay(Math.E.toString());
    } 
  }

  function handleDecimal() {
    const parts = currentDisplay.split(/[\+\-\*\/\^]/);
    if (!parts[parts.length - 1].includes('.')) {
      appendToDisplay('.');
    }
  }

  function calculate() {
    try {
      let expression = currentDisplay
        .replace(/\s+/g, '') // Удаляем все пробелы
        .replace(/x/g, '*')
        .replace(/,/g, '.') // Заменяем запятые на точки
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/(\d+|\))\s*\(/g, '$1*(') // Неявное умножение: 2(3) → 2*(3)
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Проверка на валидность скобок
      const bracketStack = [];
      for (const char of expression) {
        if (char === '(') bracketStack.push(char);
        if (char === ')') {
          if (bracketStack.length === 0) throw new Error('Непарные скобки');
          bracketStack.pop();
        }
      }
      if (bracketStack.length > 0) throw new Error('Непарные скобки');

      // Проверка на недопустимые символы
      const allowedChars = /^[\d+\-*\/.()^Math.PIEMath.sinMath.cosMath.tanMath.log10Math.logMath.sqrt\s]+$/;
      if (!allowedChars.test(expression)) {
        throw new Error('Недопустимые символы в выражении');
      }

      // Вычисление с обработкой ошибок
      const result = new Function(`return ${expression}`)();
      
      if (isNaN(result)) throw new Error('Результат не является числом');
      if (!isFinite(result)) throw new Error('Результат слишком большой');

      currentDisplay = result.toString();
      updateDisplay();
    } catch(error) {
      currentDisplay = 'Ошибка';
      alert(error.message);
      updateDisplay();
      setTimeout(clearDisplay, 1000);
    }
  }

  function drawGrid(clearAll = false) {
    const gridStep = 30;
    ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.heigth);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    if (clearAll) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, graphCanvas.width, graphCanvas.height);
    }

    for (let x = 0; x <= graphCanvas.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, graphCanvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= graphCanvas.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(graphCanvas.width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(graphCanvas.width / 2, 0);
    ctx.lineTo(graphCanvas.width / 2, graphCanvas.height);
    ctx.moveTo(0, graphCanvas.height / 2);
    ctx.lineTo(graphCanvas.width, graphCanvas.height / 2);
    ctx.stroke();
  }

  functionInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      plotFunction();
    }
  });

  function plotFunction() {
    const funcStr = functionInput.value.trim();
    if (!funcStr) {
      alert('Пожалуйста, введите корректную функцию');
      return;
    }

    try {
      const processedFunc = funcStr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log');

      const func = new Function('x', `return ${processedFunc}`);

      drawGrid();
      ctx.strokeStyle = '#ff9500';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const scale = 30;
      const centerX = graphCanvas.width / 2;
      const centerY = graphCanvas.height / 2;

      let isFirstPoint = true;

      for (let x = -10; x <= 10; x += 0.1) {
        try {
          const y = -func(x);
          const pixelX = centerX + x * scale;
          const pixelY = centerY + y * scale;

          if (isFirstPoint) {
            ctx.moveTo(pixelX, pixelY);
            isFirstPoint = false;
          } else {
            ctx.lineTo(pixelX, pixelY);
          }
        } catch(e) {
          isFirstPoint = true;
        }
      }

      ctx.stroke();
    } catch(error) {
      alert('Ошибка в функции: ' + error.message);
      console.error(error);
    }
  }

  function clearPlot() {
    functionInput.value = '';
    drawGrid(true);
  }
});