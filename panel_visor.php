<?php
// panel_visor.php
// Este script lee el archivo JSON y muestra las gráficas y la tabla.

// Define la ruta del archivo JSON principal
$json_file = 'evaluaciones.json';

// Carga el contenido del archivo JSON
if (file_exists($json_file)) {
    $json_content = file_get_contents($json_file);
    $all_evaluations = json_decode($json_content, true);
    if ($all_evaluations === null) {
        $all_evaluations = [];
    }
} else {
    $all_evaluations = [];
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Visor de Evaluaciones</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; }
        .container { max-width: 1200px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #3F51B5; }
        .controls { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 10px; }
        #search-box { display: flex; align-items: center; gap: 10px; }
        #search-box input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        #results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        #results-table th, #results-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        #results-table th { background-color: #f2f2f2; }
        #charts-container { display: flex; flex-wrap: wrap; justify-content: space-around; margin-top: 40px; }
        .chart-box { width: 45%; background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        @media (max-width: 768px) {
            .chart-box { width: 100%; }
            .controls { flex-direction: column; align-items: stretch; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Panel Visor de Evaluaciones</h1>
        <div class="controls">
            <div id="search-box">
                <label for="instructor-search">Buscar por Instructor:</label>
                <input type="text" id="instructor-search" placeholder="Escribe el nombre del instructor...">
            </div>
        </div>

        <div id="charts-container">
            <div class="chart-box">
                <h2>Estadísticas de Aptitud por Alumno</h2>
                <canvas id="aptitudeChart"></canvas>
            </div>
            <div class="chart-box">
                <h2>Evaluaciones por Día</h2>
                <canvas id="dailyChart"></canvas>
            </div>
        </div>
        
        <table id="results-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>ID Matrícula</th>
                    <th>Nombre del Alumno</th>
                    <th>Instructor</th>
                    <th>Aptitud del Día</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>

    <script>
        // Los datos se pasan de PHP a JavaScript
        const allEvaluations = <?php echo json_encode($all_evaluations); ?>;

        document.addEventListener('DOMContentLoaded', () => {
            const instructorSearchInput = document.getElementById('instructor-search');
            const resultsTableBody = document.querySelector('#results-table tbody');
            let aptitudeChart = null;
            let dailyChart = null;

            const displayEvaluations = (evaluations) => {
                resultsTableBody.innerHTML = '';
                evaluations.forEach((data) => {
                    const row = resultsTableBody.insertRow();
                    const formattedDate = new Date(data.date).toLocaleDateString();
                    row.insertCell().textContent = formattedDate;
                    row.insertCell().textContent = data.idMatricula;
                    row.insertCell().textContent = data.studentName;
                    row.insertCell().textContent = data.instructorName;
                    row.insertCell().textContent = data.studentAptitude;
                });
            };

            const updateCharts = (evaluations) => {
                if (aptitudeChart) aptitudeChart.destroy();
                if (dailyChart) dailyChart.destroy();

                const aptitudeData = {};
                const dailyData = {};

                evaluations.forEach(eval => {
                    const studentName = eval.studentName;
                    const aptitude = eval.studentAptitude;
                    if (!aptitudeData[studentName]) {
                        aptitudeData[studentName] = {};
                        ['Excelente', 'Muy Bien', 'Bien', 'Regular', 'Mal', 'Pésimo'].forEach(opt => aptitudeData[studentName][opt] = 0);
                    }
                    if (aptitudeData[studentName][aptitude] !== undefined) {
                        aptitudeData[studentName][aptitude]++;
                    }
                    
                    const date = new Date(eval.date).toLocaleDateString();
                    if (!dailyData[date]) {
                        dailyData[date] = 0;
                    }
                    dailyData[date]++;
                });

                const aptitudeLabels = Object.keys(aptitudeData);
                const aptitudeDatasets = ['Excelente', 'Muy Bien', 'Bien', 'Regular', 'Mal', 'Pésimo'].map(option => {
                    const data = aptitudeLabels.map(student => aptitudeData[student][option]);
                    return {
                        label: option,
                        data: data,
                        backgroundColor: getAptitudeColor(option)
                    };
                });

                const aptitudeCtx = document.getElementById('aptitudeChart').getContext('2d');
                aptitudeChart = new Chart(aptitudeCtx, {
                    type: 'bar',
                    data: {
                        labels: aptitudeLabels,
                        datasets: aptitudeDatasets
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: { stacked: true },
                            y: { stacked: true, beginAtZero: true }
                        }
                    }
                });

                const dailyCtx = document.getElementById('dailyChart').getContext('2d');
                dailyChart = new Chart(dailyCtx, {
                    type: 'line',
                    data: {
                        labels: Object.keys(dailyData).sort(),
                        datasets: [{
                            label: 'Evaluaciones por Día',
                            data: Object.values(dailyData),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            };

            const getAptitudeColor = (aptitude) => {
                switch (aptitude) {
                    case 'Excelente': return '#4CAF50';
                    case 'Muy Bien': return '#8BC34A';
                    case 'Bien': return '#CDDC39';
                    case 'Regular': return '#FFC107';
                    case 'Mal': return '#FF9800';
                    case 'Pésimo': return '#F44336';
                    default: return '#9E9E9E';
                }
            };
            
            instructorSearchInput.addEventListener('keyup', (event) => {
                const searchTerm = event.target.value.toLowerCase();
                const filteredEvaluations = allEvaluations.filter(eval => 
                    eval.instructorName.toLowerCase().includes(searchTerm)
                );
                displayEvaluations(filteredEvaluations);
                updateCharts(filteredEvaluations);
            });

            // Carga inicial de datos y gráficos
            displayEvaluations(allEvaluations);
            updateCharts(allEvaluations);
        });
    </script>
</body>
</html>