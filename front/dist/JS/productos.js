const API_URL = '/backend.php';

document.addEventListener('DOMContentLoaded', cargarProductos);

function mostrarAlerta(mensaje, tipo) {
    const alerta = document.getElementById('alerta');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.textContent = mensaje;
    setTimeout(() => alerta.classList.add('d-none'), 4000);
}

async function cargarProductos() {
    try {
        const res = await fetch(`${API_URL}?accion=listar`);
        const productos = await res.json();
        
        const tbody = document.getElementById('tablaProductos');
        document.getElementById('totalProductos').textContent = `Total: ${productos.length}`;
        
        if (productos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay productos registrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = productos.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.descripcion || ''}</td>
                <td>$${parseFloat(p.precio).toFixed(2)}</td>
                <td><span class="badge bg-${p.stock > 5 ? 'success' : 'danger'}">${p.stock} un.</span></td>
                <td class="text-center">
                    <button onclick="eliminarProducto(${p.id})" class="btn btn-sm btn-danger fw-bold">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error al cargar:', error);
    }
}

document.getElementById('formProducto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        precio: document.getElementById('precio').value,
        stock: document.getElementById('stock').value
    };

    const res = await fetch(`${API_URL}?accion=crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    const resultado = await res.json();
    if (resultado.success) {
        mostrarAlerta('¡Producto agregado exitosamente!', 'success');
        document.getElementById('formProducto').reset();
        cargarProductos();
    } else {
        mostrarAlerta('Error al guardar el producto.', 'danger');
    }
});

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const res = await fetch(`${API_URL}?accion=eliminar&id=${id}`, { method: 'DELETE' });
    const resultado = await res.json();
    
    if (resultado.success) {
        mostrarAlerta('Producto eliminado correctamente.', 'success');
        cargarProductos();
    } else {
        mostrarAlerta('Error al eliminar.', 'danger');
    }
}
