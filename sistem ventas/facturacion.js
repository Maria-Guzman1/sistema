import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAD7USPTMS7uuuqmVDeGPnZw54fAo8TMIA",
    authDomain: "sistema-de-ventas-ef94d.firebaseapp.com",
    projectId: "sistema-de-ventas-ef94d",
    storageBucket: "sistema-de-ventas-ef94d.appspot.com",
    messagingSenderId: "495607998971",
    appId: "1:495607998971:web:3277abae25304c3185c35e"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencias a los elementos del DOM
const clienteSelect = document.getElementById("cliente");
const productoSelect = document.getElementById("producto");
const cantidadInput = document.getElementById("cantidad");
const facturaProductos = document.getElementById("facturaProductos");
const totalFacturaElement = document.getElementById("totalFactura");
const finalizarFacturaBtn = document.getElementById("finalizarFactura");

let totalFactura = 0;
let productosFactura = [];

// Función para cargar clientes
async function cargarClientes() {
    const clientesSnapshot = await getDocs(collection(db, "Clientes"));
    clientesSnapshot.forEach((doc) => {
        const cliente = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = cliente.nombre;
        clienteSelect.appendChild(option);
    });
}

// Función para cargar productos
async function cargarProductos() {
    const productosSnapshot = await getDocs(collection(db, "Productos"));
    productosSnapshot.forEach((doc) => {
        const producto = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${producto.nombre} - ${producto.precio} Q`;
        productoSelect.appendChild(option);
    });
}

// Función para agregar producto a la factura
document.getElementById("agregarProducto").addEventListener("click", () => {
    const productoId = productoSelect.value;
    const productoText = productoSelect.options[productoSelect.selectedIndex].text;
    const cantidad = parseInt(cantidadInput.value);

    if (!productoId || cantidad <= 0) {
        alert("Seleccione un producto y una cantidad válida");
        return;
    }

    const [productoNombre, productoPrecio] = productoText.split(" - ");
    const precioUnitario = parseFloat(productoPrecio.replace(" Q", ""));
    const subtotal = precioUnitario * cantidad;

    // Agregar el producto a la tabla
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${productoNombre}</td>
        <td>${cantidad}</td>
        <td>${precioUnitario.toFixed(2)} Q</td>
        <td>${subtotal.toFixed(2)} Q</td>
        <td><button class="btn btn-danger btn-sm eliminarProducto">Eliminar</button></td>
    `;
    facturaProductos.appendChild(newRow);

    // Actualizar el total de la factura
    totalFactura += subtotal;
    totalFacturaElement.textContent = totalFactura.toFixed(2);

    // Guardar el producto en la factura temporal
    productosFactura.push({
        id: productoId,
        nombre: productoNombre,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        subtotal: subtotal
    });

    // Evento para eliminar productos de la factura
    newRow.querySelector(".eliminarProducto").addEventListener("click", () => {
        totalFactura -= subtotal;
        totalFacturaElement.textContent = totalFactura.toFixed(2);
        facturaProductos.removeChild(newRow);
        productosFactura = productosFactura.filter(producto => producto.id !== productoId);
    });

    // Limpiar el formulario de producto
    cantidadInput.value = "";
    productoSelect.value = "";
});

// Función para finalizar la factura
finalizarFacturaBtn.addEventListener("click", async () => {
    const clienteId = clienteSelect.value;

    if (!clienteId || productosFactura.length === 0) {
        alert("Seleccione un cliente y agregue al menos un producto");
        return;
    }

    const factura = {
        clienteId: clienteId,
        productos: productosFactura,
        total: totalFactura,
        fecha: new Date()
    };

    try {
        // Guardar la factura en Firebase
        await setDoc(doc(db, "Facturas", Date.now().toString()), factura);
        alert("Factura guardada exitosamente");
        window.location.reload();  // Recargar la página para limpiar los datos
    } catch (error) {
        console.error("Error al guardar la factura:", error);
        alert("Hubo un error al guardar la factura");
    }
});

// Cargar clientes y productos al cargar la página
window.addEventListener("DOMContentLoaded", () => {
    cargarClientes();
    cargarProductos();
});
