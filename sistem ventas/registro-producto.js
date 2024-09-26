import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, getDocs, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";

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
const auth = getAuth();

// Referencia a los elementos del DOM
const tableBody = document.querySelector('#productosTable tbody');
const registrarButton = document.getElementById("registrar");

// Variable para controlar si estamos editando
let editandoProductoId = null;

// Evento para registrar o actualizar productos
registrarButton.addEventListener("click", async function() {
    const id = document.getElementById("id").value;
    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const precio = parseFloat(document.getElementById("precio").value);
    const cantidad = parseInt(document.getElementById("cantidad").value, 10);

    // Validar si los campos están completos
    if (id === "" || nombre === "" || descripcion === "" || isNaN(precio) || isNaN(cantidad)) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        if (editandoProductoId) {
            // Si estamos editando, actualizamos el producto existente
            await updateDoc(doc(db, "Productos", editandoProductoId), {
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                cantidad: cantidad
            });
            alert("Producto actualizado exitosamente");
            editandoProductoId = null;
            registrarButton.textContent = "Registrar Producto";
        } else {
            // Si no estamos editando, creamos un nuevo producto
            await setDoc(doc(db, "Productos", id), {
                nombre: nombre,
                descripcion: descripcion,
                precio: precio,
                cantidad: cantidad,
                timestamp: new Date()
            });
            alert("Producto registrado exitosamente");
        }

        // Limpiar los campos del formulario
        limpiarFormulario();
        // Actualizar la tabla con los productos registrados
        cargarProductos();
    } catch (error) {
        console.log("Error al registrar o actualizar el producto: ", error);
        alert("Hubo un error al registrar o actualizar el producto.");
    }
});

// Función para cargar los productos desde Firebase y mostrarlos en la tabla
async function cargarProductos() {
    const querySnapshot = await getDocs(collection(db, "Productos"));
    tableBody.innerHTML = "";  // Limpiar el contenido previo de la tabla

    querySnapshot.forEach((doc) => {
        const producto = doc.data();
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>${doc.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.descripcion}</td>
            <td>${producto.precio}</td>
            <td>${producto.cantidad}</td>
            <td>
                <button class="editar" onclick="editarProducto('${doc.id}')">Editar</button>
                <button class="eliminar" onclick="eliminarProducto('${doc.id}')">Eliminar</button>
            </td>
        `;

        // Añadir la nueva fila a la tabla
        tableBody.appendChild(newRow);
    });
}

// Función para eliminar un producto
window.eliminarProducto = async function(id) {
    const confirmacion = confirm("¿Estás seguro de que quieres eliminar este producto?");
    if (confirmacion) {
        try {
            await deleteDoc(doc(db, "Productos", id));
            alert("Producto eliminado exitosamente");
            cargarProductos();  // Recargar los productos en la tabla
        } catch (error) {
            console.log("Error al eliminar el producto: ", error);
            alert("Hubo un error al eliminar el producto.");
        }
    }
}

// Función para cargar los datos del producto a editar en el formulario
window.editarProducto = async function(id) {
    const productoRef = doc(db, "Productos", id);
    const productoDoc = await getDoc(productoRef);

    if (productoDoc.exists()) {
        const producto = productoDoc.data();
        document.getElementById("id").value = id;
        document.getElementById("nombre").value = producto.nombre;
        document.getElementById("descripcion").value = producto.descripcion;
        document.getElementById("precio").value = producto.precio;
        document.getElementById("cantidad").value = producto.cantidad;

        // Cambiar el texto del botón a "Guardar Cambios"
        registrarButton.textContent = "Guardar Cambios";
        editandoProductoId = id;  // Guardamos el ID del producto que se está editando
    } else {
        alert("Producto no encontrado");
    }
}

// Función para limpiar los campos del formulario
function limpiarFormulario() {
    document.getElementById("id").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("cantidad").value = "";
    registrarButton.textContent = "Registrar Producto";  // Resetear el botón
    editandoProductoId = null;
}

// Cargar productos al cargar la página
window.addEventListener('DOMContentLoaded', (event) => {
    cargarProductos();
});
