document.addEventListener('DOMContentLoaded', function() {
  let currentDisplay = '0';
  const display = document.getElementById('display');

  const buttons = document.querySelectorAll('button');

  buttons.forEach(button => {
    button.addEventListener('click', function() {
      const value = this.textContent;

      if (this.classList.contains('clear')) {
        clearDisplay();
      } else if (this.classList.contains('equals')) {
        calculate();
      } else if (this.classList.contains('backspace')){
        backspace();
      } else {
        appendToDisplay(value);
      }
    });
  });

  document.addEventListener('keydown', function(e) {
    e.preventDefault();
    const key = e.key;

    if (/[0-9]/.test(key)) {
      appendToDisplay(key);
    } else if (['+', '-', '*', '/', '^', '(', ')'].includes(key)) {
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

  function handleDecimal() {
    const parts = currentDisplay.split(/[\+\-\*\/\^]/);
    if (!parts[parts.length - 1].includes('.')) {
      appendToDisplay('.');
    }
  }

  function calculate() {
    try {
      let expression = currentDisplay.replace(/x/g, '*').replace(/\^/g, '**');

      if (/[a-zA-Z$_]/.test(expression)) {
        throw new Error('Неправильный ввод');
      }

      currentDisplay = eval(expression).toString();
      updateDisplay();
    } catch(error) {
      currentDisplay = 'Ошибка';
      updateDisplay();
      setTimeout(clearDisplay, 1000);
    }
  }
});