/* ===== ELEMENTOS DOM ===== */
const drawer        = document.getElementById("drawer");
const search        = document.getElementById("search");
const list          = document.getElementById("list");
const ticketList    = document.getElementById("ticketList");
const confirmModal  = document.getElementById("confirmModal");
const confirmText   = document.getElementById("confirmText");
const editBtn       = document.getElementById("editBtn");
const editButtons   = document.getElementById("editButtons");
const viewTicketBtn = document.getElementById("viewTicketBtn");

/* ===== MODO EDICIÓN ===== */
let editMode = false;
function toggleEditMode(){
  editMode = !editMode;
  if(editButtons) editButtons.style.display = editMode ? "flex" : "none";
  editBtn.textContent = editMode ? "↩️ Volver" : "✏️ Editar";
  render();
}

/* ===== CATEGORÍAS ===== */
const categories = [
  "Aguas y refrescos","Cerveza, vinos y licores","Café y té",
  "Frutas y verduras","Lácteos y huevos","Carne","Pescado",
  "Limpieza","Congelados","Asiático","Otros"
];

let activeCat = categories[0];
let items = JSON.parse(localStorage.items || "[]");
let cart  = JSON.parse(localStorage.cart  || "[]");

let deleteIndex = null;
let deleteType  = null;

/* ===== DRAWER ===== */
function toggleDrawer(){ drawer.classList.toggle("open"); }
function renderDrawer(){
  drawer.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    if(cat === activeCat) btn.classList.add('active');
    btn.onclick = () => { activeCat = cat; toggleDrawer(); render(); };
    drawer.appendChild(btn);
  });
}

/* ===== RENDER PRINCIPAL ===== */
function render(){
  renderDrawer();
  const q = search.value.toLowerCase();

  list.innerHTML = items
    .filter(i => q ? i.name.toLowerCase().includes(q) : i.cat === activeCat)
    .map(i => `
      <div class="item">
        <span>${i.name}${q ? `<small>(${i.cat})</small>` : ""}</span>
        <div>
          ${editMode
            ? `<button class="del" onclick="askDeleteItem('${i.name}')">✕</button>`
            : `<button class="add" onclick="showQtyModal('${i.name}')">+</button>`}
        </div>
      </div>
    `).join("");

  renderTicket();
  updateTicketCounter();

  localStorage.items = JSON.stringify(items);
  localStorage.cart  = JSON.stringify(cart);
}

/* ===== CONTADOR VER TICKET ===== */
function updateTicketCounter(){
  const total = cart.length;
  viewTicketBtn.textContent = `🧾 Ver Ticket [ ${String(total).padStart(2,"0")} ]`;
  viewTicketBtn.style.display = total ? "block" : "none";
}

/* ===== NUEVO ARTÍCULO ===== */
function showAddItem(){
  const m = document.createElement("div");
  m.className = "modal"; m.style.display = "flex";
  m.innerHTML = `
    <div class="box">
      <h3>Nuevo artículo</h3>
      <input id="iname" placeholder="Nombre">
      <select id="icat">${categories.map(c => `<option>${c}</option>`).join("")}</select>
      <div>
        <button id="save">Guardar</button>
        <button id="cancel">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.querySelector("#cancel").onclick = () => m.remove();
  m.querySelector("#save").onclick = () => {
    const n = m.querySelector("#iname").value.trim();
    const c = m.querySelector("#icat").value;
    if(n){ items.push({ name:n, cat:c }); m.remove(); render(); }
  };
}

/* ===== MODAL CANTIDAD ===== */
function showQtyModal(name){
  let qty = 1, unit = "UNIDAD";
  const m = document.createElement("div");
  m.className = "modal"; m.style.display = "flex";
  m.innerHTML = `
    <div class="box">
      <h3>${name}</h3>
      <p>Cantidad</p>
      <div class="btns qty">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button>${n}</button>`).join("")}</div>
      <p>Unidad</p>
      <div class="btns unit">
        <button class="active">UNIDAD</button>
        <button>KG</button>
        <button>CAJA</button>
      </div>
      <div>
        <button id="add">Añadir</button>
        <button id="cancel">Cancelar</button>
      </div>
    </div>`;
  document.body.appendChild(m);

  m.querySelectorAll(".qty button").forEach(b => b.onclick = () => {
    m.querySelectorAll(".qty button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); qty=+b.textContent;
  });

  m.querySelectorAll(".unit button").forEach(b => b.onclick = () => {
    m.querySelectorAll(".unit button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); unit=b.textContent;
  });

  m.querySelector("#cancel").onclick = () => m.remove();
  m.querySelector("#add").onclick = () => {
    const found = cart.find(c=>c.name===name && c.unit===unit);
    if(found) found.qty += qty;
    else cart.push({ name, qty, unit });
    m.remove(); render();
  };
}

/* ===== TICKET ===== */
function renderTicket(){
  ticketList.innerHTML = cart.map((c,i)=>`
    <li>
      <span>${c.name}</span>
      <span>${c.qty} ${c.unit}</span>
      <button class="del" onclick="askDeleteTicket(${i})">✕</button>
    </li>
  `).join("");
}

/* ===== MODAL TICKET ===== */
function openTicketModal(){
  document.getElementById("ticketModal").style.display = "flex";
}
function closeTicketModal(){
  document.getElementById("ticketModal").style.display = "none";
}

/* ===== ELIMINAR ===== */
function askDeleteItem(name){
  deleteType="item";
  deleteIndex=items.findIndex(i=>i.name===name);
  confirmText.textContent=`¿Eliminar ${name}?`;
  confirmModal.style.display="flex";
}
function askDeleteTicket(i){
  deleteType="ticket";
  deleteIndex=i;
  confirmText.textContent=`¿Eliminar ${cart[i].name}?`;
  confirmModal.style.display="flex";
}
function confirmDelete(){
  if(deleteType==="item") items.splice(deleteIndex,1);
  if(deleteType==="ticket") cart.splice(deleteIndex,1);
  closeConfirm(); render();
}
function closeConfirm(){ confirmModal.style.display="none"; }

/* ===== IMPRIMIR ===== */
function printTicket(){
  let html = `<div id="print-ticket"><h2>PEDIDO</h2><hr>`;
  cart.forEach(c=>{
    html+=`<div>${c.name} — ${c.qty} ${c.unit}</div>`;
  });
  html+=`<hr></div>`;
  document.body.insertAdjacentHTML("beforeend",html);
  window.print();
  document.getElementById("print-ticket").remove();
}

/* ===== WHATSAPP ===== */
function sendWhatsApp(){
  let txt = "🧾 PEDIDO\n\n";
  cart.forEach(c=>{
    txt += `• ${c.name}: ${c.qty} ${c.unit}\n`;
  });

  if (navigator.share) {
    navigator.share({
      title: "Pedido",
      text: txt
    });
  } else {
    window.open("https://wa.me/?text=" + encodeURIComponent(txt));
  }
}

/* ===== DATOS INICIALES ===== */
if(items.length===0){
  items=[
    {name:"Agua 50cl",cat:"Aguas y refrescos"},
    {name:"Coca Cola",cat:"Aguas y refrescos"}
  ];
}
/* ===== NUEVO TICKET ===== */
function resetTicket(){
  if(!cart.length) return;

  if(!confirm("¿Empezar un nuevo ticket?")){
    return;
  }

  cart = [];
  localStorage.cart = JSON.stringify(cart);
  closeTicketModal();
  render();
}

function exportData(){
  const data = {
    items,
    cart
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "despensa_backup.json";
  a.click();

  URL.revokeObjectURL(a.href);
}

function importData(event){
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      if (Array.isArray(data.items)) items = data.items;
      if (Array.isArray(data.cart))  cart  = data.cart;

      localStorage.items = JSON.stringify(items);
      localStorage.cart  = JSON.stringify(cart);

      render();
      alert("Datos importados correctamente ✅");
    } catch {
      alert("Archivo no válido ❌");
    }
  };
  reader.readAsText(file);
}


render();
