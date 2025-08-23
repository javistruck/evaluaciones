document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generator-form');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');

    const addQuestion = (questionText = '') => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
            <input type="text" class="question-input" value="${questionText}" placeholder="Escribe la competencia a evaluar" required>
            <div class="reorder-buttons">
                <button type="button" class="move-up">↑</button>
                <button type="button" class="move-down">↓</button>
            </div>
            <button type="button" class="clone-question-btn">Clonar</button>
            <button type="button" class="remove-question-btn">X</button>
        `;
        questionsContainer.appendChild(questionItem);

        questionItem.querySelector('.remove-question-btn').addEventListener('click', () => {
            questionItem.remove();
        });
        questionItem.querySelector('.clone-question-btn').addEventListener('click', () => {
            const clonedText = questionItem.querySelector('.question-input').value;
            addQuestion(clonedText);
        });
        questionItem.querySelector('.move-up').addEventListener('click', () => {
            if (questionItem.previousElementSibling) {
                questionsContainer.insertBefore(questionItem, questionItem.previousElementSibling);
            }
        });
        questionItem.querySelector('.move-down').addEventListener('click', () => {
            if (questionItem.nextElementSibling) {
                questionsContainer.insertBefore(questionItem.nextElementSibling, questionItem);
            }
        });
    };

    addQuestion("Dominio de conceptos");
    addQuestion("Habilidad de inspección pre-viaje");

    addQuestionBtn.addEventListener('click', () => {
        addQuestion();
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const examTitle = document.getElementById('exam-title').value;
        const examInstructions = document.getElementById('exam-instructions').value;
        const questions = Array.from(document.querySelectorAll('.question-input')).map(input => input.value);
        const studentNames = document.getElementById('student-names').value.split(',').map(name => name.trim()).filter(name => name);
        const instructorNames = document.getElementById('instructor-names').value.split(',').map(name => name.trim()).filter(name => name);

        const generatedHtml = generateFinalEvaluationHtml(examTitle, examInstructions, questions, studentNames, instructorNames);
        
        downloadHtmlFile(generatedHtml, 'evaluacion_personalizada.html');
        
        alert('¡Archivo HTML del examen generado con éxito!');
    });
    
    // Función para generar el HTML final de la evaluación
    const generateFinalEvaluationHtml = (title, instructions, questions, studentNames, instructorNames) => {
        const questionsHtml = questions.map((q, index) => {
            return `
                <div class="form-group">
                    <label>${index + 1}. ${q}</label>
                    <select name="question-${index}" required>
                        <option value="">-- Selecciona una opción --</option>
                        <option value="Excelente">Excelente</option>
                        <option value="Muy Bien">Muy Bien</option>
                        <option value="Bien">Bien</option>
                        <option value="Regular">Regular</option>
                        <option value="Mal">Mal</option>
                        <option value="Pésimo">Pésimo</option>
                    </select>
                </div>
            `;
        }).join('');

        // Genera las opciones para los selectores de nombres
        const studentOptionsHtml = studentNames.map(name => `<option value="${name}">${name}</option>`).join('');
        const instructorOptionsHtml = instructorNames.map(name => `<option value="${name}">${name}</option>`).join('');
        
        const studentSelectHtml = studentNames.length > 0 ? 
            `
            <div class="form-group">
                <label for="student-name">Nombre del Alumno:</label>
                <select id="student-name" required>
                    <option value="">-- Selecciona un Alumno --</option>
                    ${studentOptionsHtml}
                </select>
            </div>
            ` :
            `
            <div class="form-group">
                <label for="student-name">Nombre del Alumno:</label>
                <input type="text" id="student-name" required>
            </div>
            `;

        const instructorSelectHtml = instructorNames.length > 0 ?
            `
            <div class="form-group">
                <label for="instructor-name">Nombre del Instructor:</label>
                <select id="instructor-name" required>
                    <option value="">-- Selecciona un Instructor --</option>
                    ${instructorOptionsHtml}
                </select>
            </div>
            ` :
            `
            <div class="form-group">
                <label for="instructor-name">Nombre del Instructor:</label>
                <input type="text" id="instructor-name" required>
            </div>
            `;

        const questionsArrayString = JSON.stringify(questions).replace(/"/g, "'").replace(/\[/g, '[').replace(/]/g, ']');

        // Se construye el script interno usando un array y join para evitar conflictos
        const innerScriptLines = [
            'document.addEventListener(\'DOMContentLoaded\', () => {',
            '    const dateInfo = document.getElementById(\'date-info\');',
            '    const timeInfo = document.getElementById(\'time-info\');',
            '    const form = document.getElementById(\'evaluation-form\');',
            '    const downloadBtn = document.getElementById(\'download-btn\');',
            '    const clearCacheBtn = document.getElementById(\'clear-cache-btn\');',
            '    const calendarIcon = document.getElementById(\'calendar-icon\');',
            '    const calendarModal = document.getElementById(\'calendar-modal\');',
            '    const closeBtn = document.querySelector(\'.close-btn\');',
            '    const calendarContainer = document.getElementById(\'calendar-container\');',
            '    const evaluationList = document.getElementById(\'evaluation-list\');',
            '    const monthYearSpan = document.getElementById(\'month-year\');',
            '',
            '    const updateTime = () => {',
            '        const now = new Date();',
            '        dateInfo.textContent = \'Fecha: \' + now.toLocaleDateString();',
            '        timeInfo.textContent = \'Hora: \' + now.toLocaleTimeString();',
            '    };',
            '    updateTime();',
            '    setInterval(updateTime, 1000);',
            '',
            '    let evaluationData = null;',
            '    let currentMonth = new Date().getMonth();',
            '    let currentYear = new Date().getFullYear();',
            '',
            '    const downloadEvaluationAsJson = (evaluation) => {',
            '        const jsonStr = JSON.stringify(evaluation, null, 2);',
            '        const blob = new Blob([jsonStr], { type: \'application/json\' });',
            '        const url = URL.createObjectURL(blob);',
            '        const a = document.createElement(\'a\');',
            '        ',
            '        const now = new Date(evaluation.date);',
            '        const yyyy = now.getFullYear();',
            '        const mm = String(now.getMonth() + 1).padStart(2, \'0\');',
            '        const dd = String(now.getDate()).padStart(2, \'0\');',
            '        const hh = String(now.getHours()).padStart(2, \'0\');',
            '        const min = String(now.getMinutes()).padStart(2, \'0\');',
            '        const filename = (evaluation.idMatricula || \'sin_matricula\') + \'_\' + yyyy + \'-\' + mm + \'-\' + dd + \'_\' + hh + \'-\' + min + \'.json\';',
            '        ',
            '        a.href = url;',
            '        a.download = filename;',
            '        document.body.appendChild(a);',
            '        a.click();',
            '        document.body.removeChild(a);',
            '        URL.revokeObjectURL(url);',
            '    };',
            '',
            '    const saveEvaluation = () => {',
            '        const formData = new FormData(form);',
            '        const now = new Date();',
            '        ',
            '        const newEvaluation = {',
            '            examName: \'' + title + '\',',
            '            studentName: document.getElementById(\'student-name\').value,',
            '            idMatricula: document.getElementById(\'id-matricula\').value,',
            '            instructorName: document.getElementById(\'instructor-name\').value,',
            '            studentAptitude: document.getElementById(\'student-aptitude\').value,',
            '            date: now.toISOString(),',
            '            questions: {}',
            '        };',
            '',
            `        const questions = ${questionsArrayString};`,
            '',
            '        for (const [key, value] of formData.entries()) {',
            '            if (key.startsWith(\'question-\')) {',
            '                const questionIndex = parseInt(key.replace(\'question-\', \'\'), 10);',
            '                const questionText = questions[questionIndex];',
            '                newEvaluation.questions[questionText] = value;',
            '            }',
            '        }',
            '        ',
            '        const existingEvaluations = JSON.parse(localStorage.getItem(\'evaluations\')) || [];',
            '        existingEvaluations.push(newEvaluation);',
            '        localStorage.setItem(\'evaluations\', JSON.stringify(existingEvaluations));',
            '        ',
            '        evaluationData = newEvaluation;',
            '        ',
            '        alert(\'Evaluación guardada con éxito! Ahora puedes generar el JSON o verla en el calendario.\');',
            '    };',
            '',
            '    form.addEventListener(\'submit\', (event) => {',
            '        event.preventDefault();',
            '        saveEvaluation();',
            '    });',
            '',
            '    downloadBtn.addEventListener(\'click\', () => {',
            '        if (!evaluationData) {',
            '            alert(\'Por favor, primero guarda la evaluación.\');',
            '            return;',
            '        }',
            '        downloadEvaluationAsJson(evaluationData);',
            '    });',
            '',
            '    clearCacheBtn.addEventListener(\'click\', () => {',
            '        if (confirm(\'¿Estás seguro de que quieres borrar todas las evaluaciones guardadas? Esta acción no se puede deshacer.\')) {',
            '            localStorage.removeItem(\'evaluations\');',
            '            alert(\'Se han borrado todas las evaluaciones guardadas.\');',
            '            if (calendarModal.style.display === \'block\') {',
            '                 renderCalendar(currentMonth, currentYear);',
            '                 evaluationList.innerHTML = \'<p>Selecciona un día del calendario.</p>\';',
            '            }',
            '        }',
            '    });',
            '',
            '    // --- Lógica del nuevo calendario ---',
            '    const getEvaluationsForDay = (day, month, year) => {',
            '        const evaluations = JSON.parse(localStorage.getItem(\'evaluations\')) || [];',
            '        const dateString = `${year}-${String(month + 1).padStart(2, \'0\')}-${String(day).padStart(2, \'0\')}`;',
            '        return evaluations.filter(eval => new Date(eval.date).toISOString().slice(0, 10) === dateString);',
            '    };',
            '',
            '    const hasEvaluations = (day, month, year) => {',
            '        return getEvaluationsForDay(day, month, year).length > 0;',
            '    };',
            '',
            '    const renderEvaluationsList = (evaluations) => {',
            '        evaluationList.innerHTML = \'\';',
            '        if (evaluations.length === 0) {',
            '            evaluationList.innerHTML = \'<p>No hay evaluaciones para este día.</p>\';',
            '            return;',
            '        }',
            '        ',
            '        evaluations.forEach(eval => {',
            '            const listItem = document.createElement(\'li\');',
            '            listItem.className = \'evaluation-item\';',
            '            listItem.innerHTML = `',
            '                <span>Alumno: ${eval.studentName} (Matrícula: ${eval.idMatricula})</span>',
            '                <button class="download-json-btn">Descargar JSON</button>',
            '            `;',
            '            listItem.querySelector(\'.download-json-btn\').addEventListener(\'click\', () => {',
            '                downloadEvaluationAsJson(eval);',
            '            });',
            '            evaluationList.appendChild(listItem);',
            '        });',
            '    };',
            '',
            '    const renderCalendar = (month, year) => {',
            '        const monthNames = [\'Enero\', \'Febrero\', \'Marzo\', \'Abril\', \'Mayo\', \'Junio\', \'Julio\', \'Agosto\', \'Septiembre\', \'Octubre\', \'Noviembre\', \'Diciembre\'];',
            '        monthYearSpan.textContent = `${monthNames[month]} ${year}`;',
            '        calendarContainer.innerHTML = \'\';',
            '',
            '        const firstDay = (new Date(year, month)).getDay();',
            '        const daysInMonth = 32 - new Date(year, month, 32).getDate();',
            '',
            '        const daysOfWeek = [\'Dom\', \'Lun\', \'Mar\', \'Mié\', \'Jue\', \'Vie\', \'Sáb\'];',
            '        daysOfWeek.forEach(dayName => {',
            '            const dayOfWeekHeader = document.createElement(\'div\');',
            '            dayOfWeekHeader.className = \'day-header\';',
            '            dayOfWeekHeader.textContent = dayName;',
            '            calendarContainer.appendChild(dayOfWeekHeader);',
            '        });',
            '',
            '        for (let i = 0; i < firstDay; i++) {',
            '            const emptyCell = document.createElement(\'div\');',
            '            emptyCell.className = \'empty-day\';',
            '            calendarContainer.appendChild(emptyCell);',
            '        }',
            '',
            '        for (let day = 1; day <= daysInMonth; day++) {',
            '            const dayCell = document.createElement(\'div\');',
            '            dayCell.className = \'calendar-day\';',
            '            dayCell.textContent = day;',
            '            ',
            '            if (hasEvaluations(day, month, year)) {',
            '                dayCell.classList.add(\'has-evaluations\');',
            '                dayCell.addEventListener(\'click\', () => {',
            '                    const evaluations = getEvaluationsForDay(day, month, year);',
            '                    renderEvaluationsList(evaluations);',
            '                });',
            '            }',
            '            ',
            '            calendarContainer.appendChild(dayCell);',
            '        }',
            '    };',
            '',
            '    document.getElementById(\'prev-month\').addEventListener(\'click\', () => {',
            '        currentMonth--;',
            '        if (currentMonth < 0) {',
            '            currentMonth = 11;',
            '            currentYear--;',
            '        }',
            '        renderCalendar(currentMonth, currentYear);',
            '        evaluationList.innerHTML = \'<p>Selecciona un día del calendario.</p>\';',
            '    });',
            '',
            '    document.getElementById(\'next-month\').addEventListener(\'click\', () => {',
            '        currentMonth++;',
            '        if (currentMonth > 11) {',
            '            currentMonth = 0;',
            '            currentYear++;',
            '        }',
            '        renderCalendar(currentMonth, currentYear);',
            '        evaluationList.innerHTML = \'<p>Selecciona un día del calendario.</p>\';',
            '    });',
            '',
            '    calendarIcon.addEventListener(\'click\', () => {',
            '        renderCalendar(currentMonth, currentYear);',
            '        evaluationList.innerHTML = \'<p>Selecciona un día del calendario.</p>\';',
            '        calendarModal.style.display = \'block\';',
            '    });',
            '',
            '    closeBtn.addEventListener(\'click\', () => {',
            '        calendarModal.style.display = \'none\';',
            '    });',
            '',
            '    window.onclick = (event) => {',
            '        if (event.target == calendarModal) {',
            '            calendarModal.style.display = \'none\';',
            '        }',
            '    };',
            '});'
        ];
        
        const innerScriptContent = innerScriptLines.join('\n');
        
        // Se modifica el HTML final para incluir la nueva estructura del calendario
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background-color: #f4f7f9; }
        .container { max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative; }
        h1, h2 { text-align: center; color: #004d99; }
        p.instructions { text-align: center; color: #666; font-style: italic; margin-bottom: 20px; }
        .header-info { display: flex; justify-content: space-between; align-items: center; font-size: 0.9em; margin-bottom: 20px; }
        .header-info span { display: block; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], select { width: 98%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        #submit-btn { background-color: #007bff; color: white; padding: 12px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 20px; }
        .button-group { display: flex; justify-content: space-around; margin-top: 20px; gap: 10px; }
        .button-group button { padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; }
        #download-btn { background-color: #2196F3; color: white; }
        #clear-cache-btn { background-color: #f44336; color: white; }
        
        /* Estilos del modal del calendario */
        .modal { display: none; position: fixed; z-index: 1; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4); }
        .modal-content { background-color: #fefefe; margin: 5% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 700px; border-radius: 8px; }
        .close-btn { color: #aaa; float: right; font-size: 28px; font-weight: bold; }
        .close-btn:hover, .close-btn:focus { color: black; text-decoration: none; cursor: pointer; }
        .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .calendar-header button { background: none; border: none; font-size: 1.5em; cursor: pointer; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; }
        .day-header { font-weight: bold; color: #555; }
        .calendar-day { padding: 10px 5px; border: 1px solid #eee; border-radius: 4px; position: relative; }
        .calendar-day:hover { background-color: #f0f0f0; cursor: pointer; }
        .empty-day { padding: 10px 5px; }
        .has-evaluations { font-weight: bold; cursor: pointer; }
        .has-evaluations::after {
            content: '';
            position: absolute;
            bottom: 3px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background-color: #007bff; /* Color del punto */
            border-radius: 50%;
        }
        .evaluation-list { margin-top: 20px; list-style-type: none; padding: 0; }
        .evaluation-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
        .evaluation-item:hover { background-color: #f9f9f9; }
        .download-json-btn { background-color: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-info">
            <div>
                <span id="date-info"></span>
                <span id="time-info"></span>
            </div>
            <div>
                <button id="calendar-icon" title="Ver evaluaciones guardadas">📅</button>
            </div>
        </div>

        <h1>${title}</h1>
        <p class="instructions">${instructions}</p>
        
        <form id="evaluation-form">
            <div class="form-group">
                <label for="id-matricula">ID y Número de Matrícula:</label>
                <input type="text" id="id-matricula" required>
            </div>
            ${studentSelectHtml}
            
            <h2>Competencias a Evaluar</h2>
            ${questionsHtml}

            ${instructorSelectHtml}

            <div class="form-group">
                <label for="student-aptitude">Aptitud del Estudiante en el día:</label>
                <select id="student-aptitude" required>
                    <option value="">-- Selecciona una opción --</option>
                    <option value="Excelente">Excelente</option>
                    <option value="Muy Bien">Muy Bien</option>
                    <option value="Bien">Bien</option>
                    <option value="Regular">Regular</option>
                    <option value="Mal">Mal</option>
                    <option value="Pésimo">Pésimo</option>
                </select>
            </div>

            <button type="submit" id="submit-btn">Guardar Evaluación</button>
        </form>

        <div class="button-group">
            <button id="download-btn">Generar JSON de la última evaluación</button>
            <button id="clear-cache-btn">Borrar Evaluaciones Guardadas</button>
        </div>
    </div>

    <div id="calendar-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Evaluaciones Guardadas</h2>
            <div class="calendar-nav">
                <button id="prev-month">‹</button>
                <span id="month-year"></span>
                <button id="next-month">›</button>
            </div>
            <div id="calendar-container" class="calendar-grid"></div>
            <ul id="evaluation-list" class="evaluation-list">
                <p>Selecciona un día del calendario para ver las evaluaciones.</p>
            </ul>
        </div>
    </div>

    <script>
        ${innerScriptContent}
    </script>

</body>
</html>`;
    };

    const downloadHtmlFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
});