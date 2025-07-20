/*
const listaOrdenes = document.getElementById('listaOrdenes');

const addOrdenBtn = document.getElementById('botonAgregarPedido');

let ordenid = 1;

addOrdenBtn.addEventListener('click', () => {
    const orden = {id: ordenid++, status: 'En proceso'};
    botonAgregarPedido(orden);
    processOrden(orden);
})

function botonAgregarPedido(orden) {
    const listaItem = document.createElement('li');
    orden.id = `Lista de pedidos-${orden.id}`;
    listaItem.textContent = `Pedido #${orden.id}: ${orden.status}`;
    listaOrdenes.appendchild(listaItem);
};
*/

/**
 * SISTEMA DE CAFETERÍA CON GESTIÓN DE PEDIDOS
 * 
 * Este script maneja:
 * - Carrito de compras
 * - Gestión de pedidos
 * - Interacción con el usuario
 */

// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // ====================
    // 1. INICIALIZACIÓN
    // ====================
    
    // Carrito de compras
    let cart = [];
    let total = 0;
    
    // Sistema de pedidos
    let orders = JSON.parse(localStorage.getItem('cafeOrders')) || [];
    let currentTab = 'pending';
    
    // ====================
    // 2. ELEMENTOS DEL DOM
    // ====================
    
    // Elementos del carrito
    const cartItemsList = document.getElementById('cart-items-list');
    const cartItemCount = document.getElementById('cart-item-count');
    const cartTotal = document.getElementById('cart-total');
    const cartSidebarTotal = document.getElementById('cart-sidebar-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Elementos de pedidos
    const ordersModal = document.getElementById('orders-modal');
    const viewOrdersBtn = document.getElementById('view-orders-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    const pendingOrdersContainer = document.getElementById('pending-orders');
    const deliveredOrdersContainer = document.getElementById('delivered-orders');
    const tabButtons = document.querySelectorAll('.tab-button');
    const pendingBadge = document.getElementById('pending-badge');
    const pendingCount = document.getElementById('pending-count');
    const deliveredCount = document.getElementById('delivered-count');
    
    // ====================
    // 3. FUNCIONES DEL CARRITO
    // ====================
    
    /**
     * Actualiza la interfaz del carrito
     */
    function updateCartUI() {
        // Calcular total de items
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Actualizar contadores
        cartItemCount.textContent = itemCount;
        cartTotal.textContent = total.toFixed(2);
        cartSidebarTotal.textContent = `$${total.toFixed(2)}`;
        
        // Actualizar lista de items
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li>No hay productos agregados en el carrito.</li>';
        } else {
            cartItemsList.innerHTML = '';
            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
                    <button class="remove-item-btn" data-name="${item.name}">×</button>
                `;
                cartItemsList.appendChild(li);
            });
            
            // Añadir eventos a los botones de eliminar
            document.querySelectorAll('.remove-item-btn').forEach(button => {
                button.addEventListener('click', function() {
                    removeItemFromCart(this.getAttribute('data-name'));
                });
            });
        }
    }
    
    /**
     * Elimina un item del carrito
     * @param {string} itemName - Nombre del producto a eliminar
     */
    function removeItemFromCart(itemName) {
        const itemIndex = cart.findIndex(item => item.name === itemName);
        
        if (itemIndex !== -1) {
            const item = cart[itemIndex];
            total -= item.price * item.quantity;
            cart.splice(itemIndex, 1);
            updateCartUI();
        }
    }
    
    // ====================
    // 4. FUNCIONES DE PEDIDOS
    // ====================
    
    /**
     * Guarda los pedidos en localStorage
     */
    function saveOrders() {
        localStorage.setItem('cafeOrders', JSON.stringify(orders));
        updateOrdersBadge();
    }
    
    /**
     * Actualiza el badge de pedidos pendientes
     */
    function updateOrdersBadge() {
        const pending = orders.filter(o => o.status === 'pending').length;
        pendingBadge.textContent = pending;
        pendingBadge.style.display = pending > 0 ? 'flex' : 'none';
    }
    
    /**
     * Crea un nuevo pedido desde el carrito
     */
    function createOrder() {
        if (cart.length === 0) {
            showNotification('🛒 Tu carrito está vacío');
            return;
        }
        
        const newOrder = {
            id: Date.now(),
            date: new Date().toLocaleString('es-ES'),
            items: [...cart],
            total: total,
            status: 'pending'
        };
        
        orders.unshift(newOrder); // Añadir al inicio del array
        saveOrders();
        
        // Limpiar carrito
        cart = [];
        total = 0;
        updateCartUI();
        
        // Mostrar notificación
        showNotification(`✅ Pedido #${newOrder.id} recibido! Total: $${newOrder.total.toFixed(2)}`);
        
        // Actualizar vista si el modal está abierto
        if (ordersModal.style.display === 'block') {
            renderOrders();
        }
    }
    
    /**
     * Marca un pedido como entregado
     * @param {number} orderId - ID del pedido a marcar
     */
    function markAsDelivered(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'delivered';
            order.deliveredAt = new Date().toLocaleString('es-ES');
            saveOrders();
            renderOrders();
            showNotification(`📦 Pedido #${orderId} marcado como entregado`);
        }
    }
    
    /**
     * Renderiza los pedidos en el modal
     */
    function renderOrders() {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    
    // Actualizar contadores
    pendingCount.textContent = pendingOrders.length;
    deliveredCount.textContent = deliveredOrders.length;
    
    // Renderizar pedidos pendientes con agrupación por fecha
    pendingOrdersContainer.innerHTML = pendingOrders.length > 0 
        ? groupOrdersByDate(pendingOrders)
        : '<p class="no-orders">No hay pedidos pendientes</p>';
    
    // Renderizar pedidos entregados con agrupación por fecha
    deliveredOrdersContainer.innerHTML = deliveredOrders.length > 0 
        ? groupOrdersByDate(deliveredOrders)
        : '<p class="no-orders">No hay pedidos entregados</p>';
    
    // Añadir eventos a los botones de entregar
    document.querySelectorAll('.deliver-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            markAsDelivered(parseInt(btn.dataset.orderId));
        });
    });
}

function groupOrdersByDate(orders) {
    const grouped = {};
    
    // Agrupar pedidos por fecha
    orders.forEach(order => {
        const date = order.date.split(',')[0]; // Solo la fecha sin la hora
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(order);
    });
    
    // Generar HTML agrupado
    let html = '';
    for (const date in grouped) {
        html += `<div class="order-group">
        <h4 class="order-date-header">${date}</h4>
        ${grouped[date].map(createOrderCard).join('')}
    </div>`;
    }
    
    return html;
}
    
    /**
     * Crea la tarjeta HTML para un pedido
     * @param {Object} order - Objeto del pedido
     * @returns {string} HTML de la tarjeta del pedido
     */
    function createOrderCard(order) {
        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Pedido #${order.id}</span>
                    <span class="order-date">${order.date}</span>
                    <span class="order-status status-${order.status}">
                        ${order.status === 'pending' ? 'POR ENTREGAR' : 'ENTREGADO'}
                    </span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <span>Total:</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
                ${order.status === 'pending' ? `
                <div class="order-actions">
                    <button class="deliver-btn" data-order-id="${order.id}">
                        Marcar como Entregado
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje a mostrar
     */
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    /**
     * Cambia entre pestañas en el modal de pedidos
     * @param {string} tabName - Nombre de la pestaña a mostrar
     */
    function changeTab(tabName) {
        currentTab = tabName;
        
        // Actualizar botones
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        // Actualizar contenido
        document.querySelectorAll('.order-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-orders`);
        });
    }
    
    // ====================
    // 5. EVENT LISTENERS
    // ====================
    
    // Añadir productos al carrito
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const menuItem = this.closest('.menu-item');
            const itemName = menuItem.getAttribute('data-name');
            const itemPrice = parseFloat(menuItem.getAttribute('data-price'));
            
            // Verificar si el producto ya está en el carrito
            const existingItem = cart.find(item => item.name === itemName);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                });
            }
            
            total += itemPrice;
            updateCartUI();
        });
    });
    
    // Vaciar carrito
    clearCartBtn.addEventListener('click', function() {
        cart = [];
        total = 0;
        updateCartUI();
    });
    
    // Realizar pedido
    checkoutBtn.addEventListener('click', createOrder);
    
    // Abrir modal de pedidos
    viewOrdersBtn.addEventListener('click', function() {
        ordersModal.style.display = 'block';
        renderOrders();
    });
    
    // Cerrar modal de pedidos
    closeModalBtn.addEventListener('click', function() {
        ordersModal.style.display = 'none';
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === ordersModal) {
            ordersModal.style.display = 'none';
        }
    });
    
    // Cambiar pestañas en el modal
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            changeTab(this.dataset.tab);
        });
    });
    
    // ====================
    // 6. INICIALIZACIÓN
    // ====================
    
    // Actualizar UI inicial
    updateCartUI();
    updateOrdersBadge();
});

