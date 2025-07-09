
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







