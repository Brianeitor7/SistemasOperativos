<?php
header('Content-Type: application/json; charset=utf-8');

function cargarEnv($ruta) {
    if (!file_exists($ruta)) return;
    $lineas = file($ruta, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lineas as $linea) {
        if (strpos(trim($linea), '#') === 0) continue;
        list($nombre, $valor) = explode('=', $linea, 2);
        $_ENV[trim($nombre)] = trim($valor);
    }
}
cargarEnv(__DIR__ . '/.env');

$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'];
$username = $_ENV['DB_USER'];
$password = $_ENV['DB_PASS'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión BD']);
    exit;
}

$accion = $_GET['accion'] ?? '';

if ($accion === 'listar') {
    $stmt = $pdo->query("SELECT * FROM productos ORDER BY id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($accion === 'crear' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $nombre = trim($data['nombre'] ?? '');
    $descripcion = trim($data['descripcion'] ?? '');
    $precio = $data['precio'] ?? 0;
    $stock = $data['stock'] ?? 0;

    if (!empty($nombre) && is_numeric($precio) && is_numeric($stock)) {
        $stmt = $pdo->prepare("INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)");
        $exito = $stmt->execute([$nombre, $descripcion, $precio, $stock]);
        echo json_encode(['success' => $exito]);
    } else {
        echo json_encode(['success' => false]);
    }
    exit;
}

if ($accion === 'eliminar' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM productos WHERE id = ?");
        $exito = $stmt->execute([$id]);
        echo json_encode(['success' => $exito]);
        exit;
    }
    echo json_encode(['success' => false]);
    exit;
}
?>
