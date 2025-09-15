<?php
// Director.php
// Este script maneja la subida de archivos JSON y los guarda en evaluaciones.json

// Define la ruta del archivo JSON principal
$json_file = 'evaluaciones.json';

// Si el archivo JSON no existe, créalo con un array vacío
if (!file_exists($json_file)) {
    file_put_contents($json_file, '[]');
}

// Verifica si se envió el formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file-input'])) {
    $existing_data = json_decode(file_get_contents($json_file), true);

    if ($existing_data === null) {
        $existing_data = []; // Inicializa si el archivo está vacío o mal formateado
    }

    foreach ($_FILES['file-input']['tmp_name'] as $temp_file) {
        // Asegúrate de que el archivo no sea un directorio y tenga un tamaño
        if (is_uploaded_file($temp_file)) {
            $json_content = file_get_contents($temp_file);
            $new_evaluation = json_decode($json_content, true);
            
            if ($new_evaluation !== null) {
                $existing_data[] = $new_evaluation;
            }
        }
    }

    // Guarda los nuevos datos en el archivo JSON
    if (file_put_contents($json_file, json_encode($existing_data, JSON_PRETTY_PRINT)) !== false) {
        echo "<script>alert('¡Evaluaciones guardadas exitosamente!');</script>";
    } else {
        echo "<script>alert('Error al guardar los datos.');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="author" content="Javier Soto Avila" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modo Director</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; }
        .container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #3F51B5; }
        .controls { text-align: center; margin-bottom: 20px; }
        .controls input[type="file"], .controls button { padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; }
        .controls button { background-color: #3F51B5; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Modo Director</h1>
        <p style="text-align: center;">Usa este panel para subir y guardar las evaluaciones en el servidor.</p>
        <form action="" method="post" enctype="multipart/form-data" class="controls">
            <label for="file-input">Selecciona los archivos JSON:</label>
            <input type="file" id="file-input" name="file-input[]" multiple accept=".json">
            <button type="submit">Guardar Evaluaciones</button>
        </form>
    </div>
</body>
</html>
