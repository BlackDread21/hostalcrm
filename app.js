/* ══════════════════════════════════════════════════════
   ⚙️  CONFIGURACIÓN — EDITA ESTOS 3 VALORES
   ══════════════════════════════════════════════════════
   1. Entra a supabase.com → tu proyecto → Settings → API
   2. Copia "Project URL" y "anon public key"
   3. Entra a console.anthropic.com → API Keys → Create key
   ══════════════════════════════════════════════════════ */
const CFG = {
  SB_URL:       'https://wrzirgqfxlwcmhzbdxxv.supabase.co',
  SB_ANON:      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyemlyZ3FmeGx3Y21oemJkeHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDM4NjIsImV4cCI6MjA5NDc3OTg2Mn0.nb__-vZtpnqBenHBcQDFdK-yWNbmczTnjBXTK3p5_8E',
  CLAUDE_KEY:   'PEGA_AQUI_TU_ANTHROPIC_API_KEY',
  HOSTAL_NAME:  'Mi Hostal',   // ← cambia al nombre del hostal cliente
};

/* ════════════════════════════════════════════════════
   ESTADO GLOBAL
════════════════════════════════════════════════════ */
let sb = null;
let ME = { nombre:'', rol:'admin' };
let D  = { habs:[], huespedes:[], reservas:[], campanas:[], resenas:[], comunicaciones:[], incidencias:[] };

// ── DEMO DATA ──────────────────────────────────────
const DEMO = {
  habs:[
    {id:1,numero:'101',tipo:'Simple',piso:1,precio:45,capacidad:1,estado:'libre',descripcion:'TV, baño privado'},
    {id:2,numero:'102',tipo:'Doble',piso:1,precio:70,capacidad:2,estado:'ocupada',descripcion:'TV, baño privado, WiFi'},
    {id:3,numero:'103',tipo:'Doble',piso:1,precio:70,capacidad:2,estado:'limpieza',descripcion:'TV, WiFi'},
    {id:4,numero:'104',tipo:'Triple',piso:1,precio:95,capacidad:3,estado:'libre',descripcion:'TV, baño privado'},
    {id:5,numero:'201',tipo:'Matrimonial',piso:2,precio:80,capacidad:2,estado:'reservada',descripcion:'TV, agua caliente'},
    {id:6,numero:'202',tipo:'Suite',piso:2,precio:140,capacidad:2,estado:'libre',descripcion:'Jacuzzi, TV, minibar'},
    {id:7,numero:'203',tipo:'Simple',piso:2,precio:45,capacidad:1,estado:'libre',descripcion:'TV, baño compartido'},
    {id:8,numero:'204',tipo:'Doble',piso:2,precio:70,capacidad:2,estado:'ocupada',descripcion:'TV, baño privado'},
  ],
  huespedes:[
    {id:1,nombre:'Carlos Mendoza Ruiz',dni:'45123678',telefono:'955 123 456',email:'carlos@email.com',nacionalidad:'Peruana',etiqueta:'vip',total_estancias:5,gasto_total:840,canal_frecuente:'booking',notas_crm:'Prefiere habitaciones altas. Siempre reserva con anticipación.',created_at:'2024-01-15'},
    {id:2,nombre:'Ana Torres Vega',dni:'38456789',telefono:'944 987 654',email:'ana@email.com',nacionalidad:'Peruana',etiqueta:'recurrente',total_estancias:3,gasto_total:420,canal_frecuente:'instagram',notas_crm:'Viaja con pareja. Le gustan las promociones de fin de semana.',created_at:'2024-03-08'},
    {id:3,nombre:'Luis Ramírez Silva',dni:'12345678',telefono:'966 111 222',email:'',nacionalidad:'Colombiana',etiqueta:'nuevo',total_estancias:1,gasto_total:140,canal_frecuente:'directo',notas_crm:'',created_at:'2025-05-01'},
  ],
  reservas:[
    {id:1,huesped_id:1,habitacion_id:2,fecha_entrada:'2025-05-10',fecha_salida:'2025-05-14',origen:'booking',total:280,estado:'activa'},
    {id:2,huesped_id:2,habitacion_id:5,fecha_entrada:'2025-05-11',fecha_salida:'2025-05-13',origen:'instagram',total:160,estado:'activa'},
    {id:3,huesped_id:3,habitacion_id:8,fecha_entrada:'2025-05-12',fecha_salida:'2025-05-15',origen:'directo',total:210,estado:'activa'},
    {id:4,huesped_id:1,habitacion_id:1,fecha_entrada:'2025-05-20',fecha_salida:'2025-05-22',origen:'instagram',total:90,estado:'pendiente'},
  ],
  campanas:[
    {id:1,nombre:'Promo San Valentín',canal:'instagram',inversion:120,reservas:9,ingresos:720,fecha:'2025-02-10'},
    {id:2,nombre:'Finde largo abril',canal:'tiktok',inversion:80,reservas:14,ingresos:980,fecha:'2025-04-25'},
    {id:3,nombre:'Google Ads Mayo',canal:'google',inversion:200,reservas:6,ingresos:480,fecha:'2025-05-01'},
  ],
  resenas:[
    {id:1,plataforma:'google',autor:'Maria L.',puntuacion:5,texto:'Excelente atención, muy limpio y la ubicación es perfecta. Volveré sin duda.',respuesta:'',respondida:false,fecha:'2025-05-10'},
    {id:2,plataforma:'booking',autor:'Turista anónimo',puntuacion:3,texto:'El hostal está bien pero la ducha del baño tardaba en calentar el agua.',respuesta:'',respondida:false,fecha:'2025-05-08'},
    {id:3,plataforma:'google',autor:'Roberto K.',puntuacion:4,texto:'Muy buena relación calidad-precio. El personal es amable.',respuesta:'Gracias Roberto, fue un placer tenerte.',respondida:true,fecha:'2025-05-01'},
  ],
  comunicaciones:[
    {id:1,huesped_id:1,tipo:'post_checkout',canal:'whatsapp',mensaje:'Gracias Carlos por tu estadía…',enviado:true,created_at:'2025-05-14'},
  ],
  incidencias:[
    {id:1,habitacion_id:3,descripcion:'Fuga leve en la ducha',prioridad:'alta',estado:'pendiente',created_at:'2025-05-12'},
    {id:2,habitacion_id:7,descripcion:'Bombilla fundida en baño',prioridad:'baja',estado:'pendiente',created_at:'2025-05-11'},
  ],
};

/* ════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  el('ll-name').innerHTML = `${CFG.HOSTAL_NAME} <span>PMS</span>`;
  el('sb-name').innerHTML = `${CFG.HOSTAL_NAME} <span>PMS</span>`;
  if(CFG.SB_URL.startsWith('https://') && CFG.SB_ANON && window.supabase) {
    sb=supabase.createClient(CFG.SB_URL,CFG.SB_ANON);
  }

  document.querySelectorAll('.ni[data-p]').forEach(n=>n.addEventListener('click',()=>go(n.dataset.p)));
  document.querySelectorAll('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)closeMod(o.id)}));
  document.querySelectorAll('#mh-amenities input[type="checkbox"]').forEach(c=>c.addEventListener('change',syncAmenities));
  document.addEventListener('click',e=>{
    const menu=el('mh-amenities');
    if(menu?.open && !menu.contains(e.target))closeAmenities();
  });

  el('btn-nueva-reserva').onclick=openModalReserva;
  el('btn-nueva-inci').onclick=()=>{ fillSel('mi-hab',D.habs,h=>({v:h.id,l:`${h.numero} · ${h.tipo}`})); openMod('m-inci'); };
});

/* ════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════ */
async function doLogin(){
  const email=val('le').trim(), pass=val('lp');
  hide('lerr');
  if(!email||!pass){showErr('lerr','Ingresa correo y contraseña');return;}

  if(!sb){
    const demos={'admin@hostal.com':{rol:'admin',nombre:'Administrador'},'recep@hostal.com':{rol:'recepcion',nombre:'Recepcionista'},'limpieza@hostal.com':{rol:'limpieza',nombre:'Limpieza'}};
    const d=demos[email];
    if(d&&pass==='123456'){await loginOK(d);}else showErr('lerr','Demo: admin@hostal.com · 123456');
    return;
  }
  const {data,error}=await sb.auth.signInWithPassword({email,password:pass});
  if(error){showErr('lerr','Correo o contraseña incorrectos');return;}
  const {data:p}=await sb.from('perfiles').select('*').eq('user_id',data.user.id).single();
  await loginOK({rol:p?.rol||'recepcion',nombre:p?.nombre||email});
}

async function loginOK({rol,nombre}){
  ME={nombre,rol};
  el('sb-uname').textContent=nombre; el('sb-role').textContent=rol;
  hide('login'); show('app');
  show('nav-'+rol);
  await fetchAll();
  if(rol==='admin')go('dashboard');
  else if(rol==='recepcion')go('mapa');
  else go('cola');
}

function doLogout(){
  if(sb)sb.auth.signOut();
  hide('app'); show('login'); setv('lp','');
}

/* ════════════════════════════════════════════════════
   DATA LAYER
════════════════════════════════════════════════════ */
async function fetchAll(){
  if(!sb){Object.assign(D,{habs:[...DEMO.habs],huespedes:[...DEMO.huespedes],reservas:[...DEMO.reservas],campanas:[...DEMO.campanas],resenas:[...DEMO.resenas],comunicaciones:[...DEMO.comunicaciones],incidencias:[...DEMO.incidencias]});return;}
  const queries=await Promise.all([
    sb.from('habitaciones').select('*').order('numero'),
    sb.from('huespedes').select('*').order('nombre'),
    sb.from('reservas').select('*').order('created_at',{ascending:false}),
    sb.from('campanas').select('*').order('fecha',{ascending:false}),
    sb.from('resenas').select('*').order('fecha',{ascending:false}),
    sb.from('comunicaciones').select('*').order('created_at',{ascending:false}),
    sb.from('incidencias').select('*').order('created_at',{ascending:false}),
  ]);
  const keys=['habs','huespedes','reservas','campanas','resenas','comunicaciones','incidencias'];
  queries.forEach((q,i)=>D[keys[i]]=q.data||[]);
}

async function dbIns(t,o){
  const k=t2k(t);
  if(!sb){const r={id:Date.now(),...o};D[k].unshift(r);return r;}
  const {data,error}=await sb.from(t).insert(o).select().single();
  if(error){toast('Error: '+error.message,'er');return null;}
  if(k)D[k].unshift(data);
  return data;
}
async function dbUpd(t,id,o){
  if(!sb){const arr=D[t2k(t)];const i=arr.findIndex(x=>x.id==id);if(i>=0)Object.assign(arr[i],o);return;}
  const {error}=await sb.from(t).update(o).eq('id',id);
  if(error)toast('Error: '+error.message,'er');
}
async function dbDel(t,id){
  if(!sb){const k=t2k(t);D[k]=D[k].filter(x=>x.id!=id);return;}
  const {error}=await sb.from(t).delete().eq('id',id);
  if(error)toast('Error: '+error.message,'er');
}
const t2k=t=>({habitaciones:'habs',huespedes:'huespedes',reservas:'reservas',campanas:'campanas',resenas:'resenas',comunicaciones:'comunicaciones',incidencias:'incidencias'}[t]);

/* ════════════════════════════════════════════════════
   NAVEGACIÓN
════════════════════════════════════════════════════ */
function go(page){
  document.querySelectorAll('[id^="pg-"]').forEach(p=>p.classList.add('hidden'));
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  const pg=el('pg-'+page); if(pg)pg.classList.remove('hidden');
  document.querySelectorAll(`.ni[data-p="${page}"]`).forEach(n=>n.classList.add('active'));
  ({dashboard:rDash,habitaciones:rHabs,mapa:rMapa,huespedes:rHuespedes,fidelizacion:rFidelizacion,
    resenas:rResenas,comunicaciones:rComunicaciones,campanas:rCampanas,
    checkin:setupCI,checkout:rCheckout,reservas:rReservas,cola:rCola,
    incidencias:rIncidencias,checklist:rChecklist}[page]||noop)();
}

/* ════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════ */
function rDash(){
  el('dash-date').textContent=new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const hoy=fmt(new Date());
  el('d1').textContent=D.habs.filter(h=>h.estado==='libre').length;
  el('d2').textContent=D.habs.filter(h=>h.estado==='ocupada').length;
  el('d3').textContent=D.habs.filter(h=>h.estado==='limpieza').length;
  el('d4').textContent=D.habs.filter(h=>h.estado==='reservada').length;
  el('d5').textContent=D.reservas.filter(r=>r.fecha_salida===hoy&&r.estado==='activa').length;
  el('d6').textContent=D.huespedes.filter(h=>h.etiqueta==='vip').length;

  el('d-tbl').innerHTML=D.reservas.filter(r=>r.estado==='activa'||r.estado==='pendiente').slice(0,6).map(r=>{
    const h=hab(r.habitacion_id),hu=huesp(r.huesped_id);
    return`<tr><td class="bold">${hu?.nombre||'—'}</td><td>${h?.numero||'—'}</td><td>${fmt2(r.fecha_salida)}</td><td><span class="badge bv-${r.estado}">${r.estado}</span></td></tr>`;
  }).join('')||'<tr><td colspan="4" class="muted ta-c" style="padding:16px">Sin reservas activas</td></tr>';

  const segCount={nuevo:0,recurrente:0,vip:0,corporativo:0,mochilero:0,grupo:0};
  D.huespedes.forEach(h=>segCount[h.etiqueta]=(segCount[h.etiqueta]||0)+1);
  el('d-pipe').innerHTML=Object.entries(segCount).filter(([,v])=>v>0).map(([k,v])=>`
    <div class="flex jcb aic" style="padding:6px 0;border-bottom:1px solid var(--border)">
      <span class="badge bv-${k}">${k}</span>
      <span class="bold">${v}</span>
    </div>`).join('');
}

/* ════════════════════════════════════════════════════
   HABITACIONES CRUD
════════════════════════════════════════════════════ */
function rHabs(){
  const q=val('hab-q').toLowerCase(),f=val('hab-f');
  const list=D.habs.filter(h=>(!q||h.numero.toLowerCase().includes(q)||h.tipo.toLowerCase().includes(q))&&(!f||h.estado===f));
  el('hab-tbl').innerHTML=list.map(h=>`<tr>
    <td class="bold mono">${h.numero}</td><td>${h.tipo}</td><td>${h.piso}</td>
    <td>S/ ${h.precio}</td><td>${h.capacidad||'—'}</td>
    <td><span class="badge bv-${h.estado}">${h.estado}</span></td>
    <td><div class="tda"><span class="ico" onclick="editHab(${h.id})">✏️</span><span class="ico" onclick="delHab(${h.id})">🗑️</span></div></td>
  </tr>`).join('')||noRows(7,'Sin habitaciones');
}
function editHab(id){const h=D.habs.find(x=>x.id==id);if(!h)return;setv('mh-id',h.id);setv('mh-num',h.numero);setv('mh-piso',h.piso);setv('mh-tipo',h.tipo);setv('mh-cap',h.capacidad||'');setv('mh-precio',h.precio);setv('mh-est',h.estado);setAmenities(h.descripcion||'');el('mh-title').textContent='Editar habitación';openMod('m-hab');}
async function saveHab(){
  const id=val('mh-id'),num=val('mh-num').trim();if(!num){toast('Ingresa el número','er');return;}
  syncAmenities();
  const o={numero:num,piso:+val('mh-piso'),tipo:val('mh-tipo'),capacidad:+val('mh-cap'),precio:+val('mh-precio'),estado:val('mh-est'),descripcion:val('mh-desc')};
  if(id){await dbUpd('habitaciones',id,o);toast('Habitación actualizada','ok');}
  else{await dbIns('habitaciones',o);toast('Habitación creada','ok');}
  closeMod('m-hab');rHabs();
}
async function delHab(id){if(!confirm('¿Eliminar habitación?'))return;await dbDel('habitaciones',id);toast('Eliminada','ok');rHabs();}
function resetForm(t){
  if(t==='hab'){['mh-id','mh-num','mh-piso','mh-cap','mh-precio'].forEach(i=>setv(i,''));setAmenities('');el('mh-title').textContent='Nueva habitación';}
  if(t==='huesp'){['mhu-id','mhu-nom','mhu-dni','mhu-tel','mhu-ema','mhu-nac','mhu-fnac','mhu-notas'].forEach(i=>setv(i,''));el('mhu-title').textContent='Nuevo huésped';}
  if(t==='resena'){['mre-id','mre-autor','mre-txt'].forEach(i=>setv(i,''));setStar(5);setv('mre-fecha',fmt(new Date()));}
  if(t==='camp'){['mc-id','mc-nom','mc-inv','mc-res','mc-ing'].forEach(i=>setv(i,''));setv('mc-fecha',fmt(new Date()));}
}

/* ════════════════════════════════════════════════════
   MAPA
════════════════════════════════════════════════════ */
function rMapa(){
  el('mapa-c').innerHTML=D.habs.map(h=>`
    <div class="rt ${h.estado}" onclick="tileAct(${h.id})">
      <div class="rn">${h.numero}</div>
      <div class="rtp">${h.tipo}</div>
      <span class="badge bv-${h.estado}">${h.estado}</span>
      <div class="rpr">S/ ${h.precio}/noche</div>
    </div>`).join('')||'<p class="muted">Sin habitaciones. Agrégalas en Habitaciones.</p>';
}
function tileAct(id){
  const h=D.habs.find(x=>x.id==id);if(!h)return;
  if(h.estado==='libre')go('checkin');
  else if(h.estado==='ocupada')go('checkout');
  else if(h.estado==='limpieza'){if(confirm(`¿Marcar ${h.numero} como libre?`))updHabEst(id,'libre');}
  else toast(`Hab. ${h.numero} · ${h.estado}`,'in');
}
async function updHabEst(id,est){await dbUpd('habitaciones',id,{estado:est});const i=D.habs.findIndex(x=>x.id==id);if(i>=0)D.habs[i].estado=est;rMapa();toast('Estado actualizado','ok');}

/* ════════════════════════════════════════════════════
   HUÉSPEDES CRM CRUD
════════════════════════════════════════════════════ */
function rHuespedes(){
  const q=val('hu-q').toLowerCase(),f=val('hu-f');
  const list=D.huespedes.filter(h=>(!q||h.nombre.toLowerCase().includes(q)||(h.dni||'').includes(q)||(h.telefono||'').includes(q))&&(!f||h.etiqueta===f));
  el('hu-tbl').innerHTML=list.map(h=>`<tr>
    <td><span class="bold" style="cursor:pointer;color:var(--accent)" onclick="verPerfil(${h.id})">${h.nombre}</span></td>
    <td class="mono sm">${h.dni||'—'}</td><td>${h.telefono||'—'}</td>
    <td><span class="badge bv-${h.etiqueta}">${h.etiqueta}</span></td>
    <td class="bold">${h.total_estancias||0}</td>
    <td>S/ ${h.gasto_total||0}</td>
    <td>${h.canal_frecuente||'—'}</td>
    <td><div class="tda"><span class="ico" onclick="verPerfil(${h.id})">👁</span><span class="ico" onclick="editHuesp(${h.id})">✏️</span><span class="ico" onclick="delHuesp(${h.id})">🗑️</span></div></td>
  </tr>`).join('')||noRows(8,'Sin huéspedes');
}

function editHuesp(id){
  const h=D.huespedes.find(x=>x.id==id);if(!h)return;
  setv('mhu-id',h.id);setv('mhu-nom',h.nombre);setv('mhu-dni',h.dni||'');setv('mhu-tel',h.telefono||'');
  setv('mhu-ema',h.email||'');setv('mhu-nac',h.nacionalidad||'');setv('mhu-fnac',h.fecha_nacimiento||'');
  setv('mhu-seg',h.etiqueta||'nuevo');setv('mhu-canal',h.canal_frecuente||'');setv('mhu-notas',h.notas_crm||'');
  el('mhu-title').textContent='Editar huésped';openMod('m-huesp');
}
async function saveHuesped(){
  const id=val('mhu-id'),nom=val('mhu-nom').trim();if(!nom){toast('Ingresa el nombre','er');return;}
  const o={nombre:nom,dni:val('mhu-dni'),telefono:val('mhu-tel'),email:val('mhu-ema'),nacionalidad:val('mhu-nac'),fecha_nacimiento:val('mhu-fnac')||null,etiqueta:val('mhu-seg'),canal_frecuente:val('mhu-canal'),notas_crm:val('mhu-notas'),created_at:new Date().toISOString()};
  if(id){await dbUpd('huespedes',id,o);toast('Huésped actualizado','ok');}
  else{await dbIns('huespedes',o);toast('Huésped registrado','ok');}
  closeMod('m-huesp');rHuespedes();
}
async function delHuesp(id){if(!confirm('¿Eliminar huésped?'))return;await dbDel('huespedes',id);toast('Eliminado','ok');rHuespedes();}

/* ── PERFIL 360° ── */
function verPerfil(id){
  const h=D.huespedes.find(x=>x.id==id);if(!h)return;
  const reservasH=D.reservas.filter(r=>r.huesped_id==id);
  const habFav=reservasH.length?D.habs.find(x=>x.id==reservasH[0].habitacion_id)?.tipo||'—':'—';
  const initials=h.nombre.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  el('perfil-c').innerHTML=`
    <div class="perfil-header">
      <div class="flex aic g2">
        <div class="perfil-avatar">${initials}</div>
        <div>
          <div style="font-size:18px;font-weight:700">${h.nombre}</div>
          <div class="flex aic g1 wrap" style="margin-top:4px">
            <span class="badge bv-${h.etiqueta}">${h.etiqueta}</span>
            <span class="sm muted">${h.nacionalidad||''}</span>
            ${h.telefono?`<span class="sm muted">📱 ${h.telefono}</span>`:''}
            ${h.email?`<span class="sm muted">✉ ${h.email}</span>`:''}
          </div>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-v">${h.total_estancias||0}</div><div class="kpi-l">Estadías</div></div>
        <div class="kpi"><div class="kpi-v">S/${h.gasto_total||0}</div><div class="kpi-l">Gasto total</div></div>
        <div class="kpi"><div class="kpi-v">${habFav}</div><div class="kpi-l">Hab. favorita</div></div>
        <div class="kpi"><div class="kpi-v">${h.canal_frecuente||'—'}</div><div class="kpi-l">Canal top</div></div>
      </div>
      ${h.notas_crm?`<div style="margin-top:12px;padding:10px 12px;background:var(--bg4);border-radius:var(--r);font-size:13px;color:var(--muted2)">📝 ${h.notas_crm}</div>`:''}
    </div>
    <div class="card">
      <div class="ct">Historial de reservas</div>
      <div class="tw"><table>
        <thead><tr><th>Habitación</th><th>Entrada</th><th>Salida</th><th>Canal</th><th>Total</th><th>Estado</th></tr></thead>
        <tbody>${reservasH.map(r=>{const hb=hab(r.habitacion_id);return`<tr>
          <td>${hb?.numero||'—'} · ${hb?.tipo||''}</td>
          <td>${fmt2(r.fecha_entrada)}</td><td>${fmt2(r.fecha_salida)}</td>
          <td><span class="badge bv-reservada">${r.origen}</span></td>
          <td>S/ ${r.total}</td>
          <td><span class="badge bv-${r.estado}">${r.estado}</span></td>
        </tr>`;}).join('')||noRows(6,'Sin reservas')}</tbody>
      </table></div>
    </div>`;
  go('perfil');
}

/* ════════════════════════════════════════════════════
   FIDELIZACIÓN
════════════════════════════════════════════════════ */
function rFidelizacion(){
  const segs=['nuevo','recurrente','vip'];
  const labels={nuevo:'🆕 Nuevo',recurrente:'🔁 Recurrente',vip:'👑 VIP'};
  el('pipe-c').innerHTML=segs.map(seg=>{
    const list=D.huespedes.filter(h=>h.etiqueta===seg);
    return`<div class="pipe-col">
      <div class="pipe-title">${labels[seg]} <span class="badge bv-${seg}">${list.length}</span></div>
      ${list.map(h=>`
        <div class="pipe-card" onclick="verPerfil(${h.id})">
          <div class="bold">${h.nombre}</div>
          <div class="sm muted">${h.total_estancias||0} estadías · S/${h.gasto_total||0}</div>
          <div class="sm muted">${h.canal_frecuente||'sin canal'}</div>
        </div>`).join('')||'<p class="sm muted ta-c" style="padding:10px">Sin huéspedes</p>'}
    </div>`;
  }).join('');
}

/* ════════════════════════════════════════════════════
   RESEÑAS + IA
════════════════════════════════════════════════════ */
function rResenas(){
  const avg=D.resenas.length?(D.resenas.reduce((s,r)=>s+r.puntuacion,0)/D.resenas.length).toFixed(1):0;
  el('res-avg').textContent=avg+' ★';
  el('res-tot').textContent=D.resenas.length;
  el('res-pen').textContent=D.resenas.filter(r=>!r.respondida).length;

  el('res-lista').innerHTML=D.resenas.map(r=>`
    <div class="card card-sm">
      <div class="flex jcb aic wrap g1" style="margin-bottom:10px">
        <div class="flex aic g2">
          <span class="badge bv-reservada">${r.plataforma}</span>
          <span class="bold">${r.autor}</span>
          <span style="color:var(--yellow)">${'★'.repeat(r.puntuacion)}${'☆'.repeat(5-r.puntuacion)}</span>
        </div>
        <div class="flex aic g1">
          <span class="sm muted">${fmt2(r.fecha)}</span>
          ${r.respondida?'<span class="badge bv-activa">Respondida</span>':'<span class="badge bv-pendiente">Pendiente</span>'}
        </div>
      </div>
      <p style="font-size:13px;color:var(--muted2);margin-bottom:10px;font-style:italic">"${r.texto}"</p>
      ${r.respondida&&r.respuesta?`<div style="background:var(--bg4);border-left:3px solid var(--green);padding:10px 12px;border-radius:0 var(--r) var(--r) 0;font-size:13px">${r.respuesta}</div>`:''}
      ${!r.respondida?`
        <div id="ia-${r.id}" class="ia-output" style="margin-bottom:8px">La respuesta de IA aparecerá aquí…</div>
        <div class="flex g1 wrap">
          <button class="btn btn-v btn-sm" onclick="genRespuesta(${r.id})">✨ Generar respuesta con IA</button>
          <button class="btn btn-g btn-sm" onclick="marcarRespondida(${r.id})">✓ Marcar respondida</button>
          <button class="btn btn-o btn-sm" onclick="copiarRespuesta(${r.id})">📋 Copiar</button>
        </div>`:''}
    </div>`).join('')||'<div class="card"><p class="muted ta-c" style="padding:20px">Sin reseñas registradas</p></div>';
}

async function genRespuesta(id){
  const r=D.resenas.find(x=>x.id==id);if(!r)return;
  const out=el('ia-'+id);
  out.textContent='⟳ Generando respuesta con IA…';out.classList.remove('loaded');

  if(CFG.CLAUDE_KEY==='PEGA_AQUI_TU_ANTHROPIC_API_KEY'){
    // Respuesta demo sin API key real
    await sleep(1200);
    const demos={5:'Muchísimas gracias por tu maravillosa reseña. Es un honor para todo nuestro equipo recibir este reconocimiento. Esperamos verte pronto.',3:'Agradecemos mucho tu visita y tus comentarios. Lamentamos el inconveniente con el agua caliente — ya lo hemos corregido. Esperamos darte una experiencia aún mejor en tu próxima visita.',4:'Gracias por tu calificación y por destacar la amabilidad de nuestro equipo. Seguimos trabajando para mejorar cada día. Bienvenido de regreso cuando gustes.'};
    const resp=demos[r.puntuacion]||'Gracias por tu visita y tus comentarios. Nos alegra que hayas elegido nuestro hostal.';
    out.textContent=resp;out.classList.add('loaded');
    await dbUpd('resenas',id,{respuesta:resp});
    const i=D.resenas.findIndex(x=>x.id==id);if(i>=0)D.resenas[i].respuesta=resp;
    return;
  }

  // IA REAL con Claude API
  try{
    const sentiment=r.puntuacion>=4?'positiva':r.puntuacion===3?'neutral':'negativa';
    const prompt=`Eres el gerente de ${CFG.HOSTAL_NAME}, un hostal en Perú. Un huésped dejó la siguiente reseña ${sentiment} (${r.puntuacion}/5 estrellas) en ${r.plataforma}:\n\n"${r.texto}"\n\nEscribe una respuesta profesional, cálida y en español peruano. Si es positiva, agradece y refuerza. Si es negativa, pide disculpas con empatía y muestra solución. Máximo 3 oraciones. Sin saludos formales al inicio.`;
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':CFG.CLAUDE_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:200,messages:[{role:'user',content:prompt}]})
    });
    const json=await res.json();
    const resp=json.content?.[0]?.text||'No se pudo generar respuesta.';
    out.textContent=resp;out.classList.add('loaded');
    await dbUpd('resenas',id,{respuesta:resp});
    const i=D.resenas.findIndex(x=>x.id==id);if(i>=0)D.resenas[i].respuesta=resp;
  }catch(e){out.textContent='Error al conectar con IA. Revisa tu API key.';toast('Error IA: '+e.message,'er');}
}

async function marcarRespondida(id){
  await dbUpd('resenas',id,{respondida:true});
  const i=D.resenas.findIndex(x=>x.id==id);if(i>=0)D.resenas[i].respondida=true;
  toast('Reseña marcada como respondida','ok');rResenas();
}
function copiarRespuesta(id){
  const r=D.resenas.find(x=>x.id==id);
  if(r?.respuesta){navigator.clipboard.writeText(r.respuesta);toast('Respuesta copiada al portapapeles','ok');}
  else{const t=el('ia-'+id);if(t)navigator.clipboard.writeText(t.textContent);toast('Copiado','ok');}
}
function setStar(n){
  setv('mre-pts',n);
  el('stars-input').querySelectorAll('span').forEach((s,i)=>s.textContent=i<n?'★':'☆');
}
async function saveResena(){
  const txt=val('mre-txt').trim();if(!txt){toast('Ingresa el texto de la reseña','er');return;}
  const o={plataforma:val('mre-plat'),autor:val('mre-autor')||'Anónimo',puntuacion:+val('mre-pts')||5,texto:txt,respondida:false,fecha:val('mre-fecha')||fmt(new Date()),respuesta:''};
  await dbIns('resenas',o);toast('Reseña guardada','ok');closeMod('m-resena');rResenas();
}

/* ════════════════════════════════════════════════════
   COMUNICACIONES CRM + IA
════════════════════════════════════════════════════ */
function rComunicaciones(){
  fillSel('mco-hu',D.huespedes,h=>({v:h.id,l:h.nombre}));
  el('comu-tbl').innerHTML=D.comunicaciones.map(c=>{
    const hu=huesp(c.huesped_id);
    return`<tr>
      <td class="bold">${hu?.nombre||'—'}</td>
      <td>${c.tipo}</td><td>${c.canal}</td>
      <td class="sm muted">${fmt2(c.created_at)}</td>
      <td>${c.enviado?'<span class="badge bv-activa">Enviado</span>':'<span class="badge bv-pendiente">Pendiente</span>'}</td>
      <td><span class="ico" onclick="delComu(${c.id})">🗑️</span></td>
    </tr>`;
  }).join('')||noRows(6,'Sin comunicaciones');
}

async function genPlantilla(tipo){
  const out=el('plantilla-out');
  out.textContent='⟳ Generando con IA…';out.classList.remove('loaded');
  const hostal=CFG.HOSTAL_NAME;

  if(CFG.CLAUDE_KEY==='PEGA_AQUI_TU_ANTHROPIC_API_KEY'){
    await sleep(1000);
    const demos={
      bienvenida:`Hola [nombre], bienvenido/a a ${hostal} 🏨 Tu habitación [número] está lista. WiFi: hostal2025. Cualquier cosa, estamos en recepción. ¡Que disfrutes tu estadía!`,
      post_checkout:`Hola [nombre], gracias por hospedarte en ${hostal} 🙏 Fue un gusto tenerte. Si puedes dejarnos una reseña en Google, nos ayudaría mucho: [enlace]. ¡Te esperamos pronto!`,
      oferta:`Hola [nombre] 🎁 Tenemos una promoción especial este fin de semana en ${hostal}: 2 noches al precio de 1. Solo para clientes frecuentes como tú. Reserva respondiendo este mensaje.`,
      retencion:`Hola [nombre], te extranamos en ${hostal}. Como cliente VIP, tienes 15% de descuento en tu proxima estadia. La oferta es valida hasta fin de mes. Esperamos verte pronto.`
    };
    out.textContent=demos[tipo]||'Plantilla generada.';out.classList.add('loaded');return;
  }

  try{
    const prompts={
      bienvenida:`Crea un mensaje de bienvenida de WhatsApp para un huésped recién llegado a ${hostal}. Incluye marcadores [nombre] y [número de habitación]. Cálido, breve, emoji apropiado. En español peruano.`,
      post_checkout:`Crea un mensaje de WhatsApp post check-out para ${hostal} pidiendo una reseña en Google. Incluye marcador [nombre]. Agradecido, breve, sin presionar. En español peruano.`,
      oferta:`Crea un mensaje de WhatsApp con oferta especial de fin de semana para ${hostal}. Incluye marcador [nombre]. Atractivo, urgente pero no agresivo. En español peruano.`,
      retencion:`Crea un mensaje de WhatsApp de retencion para cliente VIP de ${hostal} que lleva tiempo sin volver. Incluye marcador [nombre] y un beneficio exclusivo. En espanol peruano.`
    };
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':CFG.CLAUDE_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:200,messages:[{role:'user',content:prompts[tipo]}]})
    });
    const json=await res.json();
    out.textContent=json.content?.[0]?.text||'No se pudo generar.';out.classList.add('loaded');
  }catch(e){out.textContent='Error al conectar con IA.';toast('Error: '+e.message,'er');}
}

async function saveComu(){
  const hid=val('mco-hu'),msg=val('mco-msg').trim();
  if(!hid||!msg){toast('Selecciona huésped y escribe el mensaje','er');return;}
  const o={huesped_id:+hid,tipo:val('mco-tipo'),canal:val('mco-canal'),mensaje:msg,enviado:false,created_at:new Date().toISOString()};
  await dbIns('comunicaciones',o);toast('Comunicación registrada','ok');closeMod('m-comu');rComunicaciones();
}
async function delComu(id){if(!confirm('¿Eliminar?'))return;await dbDel('comunicaciones',id);toast('Eliminada','ok');rComunicaciones();}

/* ════════════════════════════════════════════════════
   CAMPAÑAS CRUD
════════════════════════════════════════════════════ */
function rCampanas(){
  const inv=D.campanas.reduce((s,c)=>s+Number(c.inversion||0),0);
  const res=D.campanas.reduce((s,c)=>s+Number(c.reservas||0),0);
  const ing=D.campanas.reduce((s,c)=>s+Number(c.ingresos||0),0);
  const roi=inv>0?Math.round(((ing-inv)/inv)*100):0;
  el('c-inv').textContent=`S/${inv.toLocaleString()}`;el('c-res').textContent=res;
  el('c-ing').textContent=`S/${ing.toLocaleString()}`;el('c-roi').textContent=roi+'%';
  el('camp-tbl').innerHTML=D.campanas.map(c=>{
    const r=c.inversion>0?Math.round(((c.ingresos-c.inversion)/c.inversion)*100):0;
    return`<tr>
      <td class="bold">${c.nombre}</td>
      <td><span class="badge bv-reservada">${c.canal}</span></td>
      <td>S/${c.inversion}</td><td>${c.reservas}</td><td>S/${c.ingresos}</td>
      <td style="font-weight:600;color:${r>=0?'var(--green)':'var(--red)'}">${r}%</td>
      <td class="sm muted">${fmt2(c.fecha)}</td>
      <td><div class="tda"><span class="ico" onclick="editCamp(${c.id})">✏️</span><span class="ico" onclick="delCamp(${c.id})">🗑️</span></div></td>
    </tr>`;
  }).join('')||noRows(8,'Sin campañas');
}
function editCamp(id){const c=D.campanas.find(x=>x.id==id);if(!c)return;setv('mc-id',c.id);setv('mc-nom',c.nombre);setv('mc-canal',c.canal);setv('mc-fecha',c.fecha);setv('mc-inv',c.inversion);setv('mc-res',c.reservas);setv('mc-ing',c.ingresos);openMod('m-camp');}
async function saveCamp(){
  const id=val('mc-id'),nom=val('mc-nom').trim();if(!nom){toast('Ingresa el nombre','er');return;}
  const o={nombre:nom,canal:val('mc-canal'),fecha:val('mc-fecha'),inversion:+val('mc-inv')||0,reservas:+val('mc-res')||0,ingresos:+val('mc-ing')||0};
  if(id){await dbUpd('campanas',id,o);toast('Campaña actualizada','ok');}else{await dbIns('campanas',o);toast('Campaña guardada','ok');}
  closeMod('m-camp');rCampanas();
}
async function delCamp(id){if(!confirm('¿Eliminar campaña?'))return;await dbDel('campanas',id);toast('Eliminada','ok');rCampanas();}

/* ════════════════════════════════════════════════════
   CHECK-IN
════════════════════════════════════════════════════ */
function setupCI(){
  fillSel('ci-hab',D.habs.filter(h=>h.estado==='libre'),h=>({v:h.id,l:`${h.numero} · ${h.tipo} · S/${h.precio}`}));
  const m=new Date();m.setDate(m.getDate()+1);
  el('ci-sal').min=fmt(m);setv('ci-sal',fmt(m));
}
async function doCheckin(){
  const nom=val('ci-nom').trim(),dni=val('ci-dni').trim();
  const tel=val('ci-tel'),ema=val('ci-ema');
  const habid=val('ci-hab'),salida=val('ci-sal'),origen=val('ci-ori');
  if(!nom||!habid||!salida){toast('Nombre, habitación y fecha de salida son obligatorios','er');return;}

  let hid;
  const ex=D.huespedes.find(x=>x.dni===dni&&dni);
  if(ex){
    hid=ex.id;
    // Actualizar CRM: sumar estadía
    const ne=ex.total_estancias+1;
    const newSeg=ne>=5?'vip':ne>=2?'recurrente':'nuevo';
    await dbUpd('huespedes',ex.id,{total_estancias:ne,etiqueta:newSeg,canal_frecuente:origen});
    const i=D.huespedes.findIndex(x=>x.id==ex.id);
    if(i>=0){D.huespedes[i].total_estancias=ne;D.huespedes[i].etiqueta=newSeg;}
  }else{
    const nh=await dbIns('huespedes',{nombre:nom,dni,telefono:tel,email:ema,etiqueta:'nuevo',total_estancias:1,gasto_total:0,canal_frecuente:origen,created_at:new Date().toISOString()});
    if(!nh)return;hid=nh.id;
  }

  const hb=D.habs.find(x=>x.id==habid);
  const hoy=fmt(new Date());
  const noches=Math.max(1,Math.round((new Date(salida)-new Date(hoy))/86400000));
  const total=(hb?.precio||0)*noches;

  const nr=await dbIns('reservas',{huesped_id:hid,habitacion_id:+habid,fecha_entrada:hoy,fecha_salida:salida,origen,total,estado:'activa'});
  if(!nr)return;
  await dbUpd('habitaciones',+habid,{estado:'ocupada'});
  const hi=D.habs.findIndex(x=>x.id==habid);if(hi>=0)D.habs[hi].estado='ocupada';

  toast(`✓ Check-in ${nom} · Hab.${hb?.numero} · ${noches} noche(s) · S/${total}`,'ok');
  ['ci-nom','ci-dni','ci-tel','ci-ema','ci-not'].forEach(i=>setv(i,''));
  setupCI();
}

/* ════════════════════════════════════════════════════
   CHECK-OUT
════════════════════════════════════════════════════ */
function rCheckout(){
  const activas=D.reservas.filter(r=>r.estado==='activa');
  el('co-tbl').innerHTML=activas.map(r=>{
    const hb=hab(r.habitacion_id),hu=huesp(r.huesped_id);
    const noches=Math.max(1,Math.round((new Date(r.fecha_salida)-new Date(r.fecha_entrada))/86400000));
    return`<tr>
      <td class="bold">${hu?.nombre||'—'}</td>
      <td><span class="badge bv-${hu?.etiqueta||'nuevo'}">${hu?.etiqueta||'—'}</span></td>
      <td>${hb?.numero||'—'} · ${hb?.tipo||''}</td>
      <td>${fmt2(r.fecha_entrada)}</td><td>${fmt2(r.fecha_salida)}</td>
      <td>${noches}</td><td class="bold">S/${r.total||0}</td>
      <td><button class="btn btn-g btn-sm" onclick="doCheckout(${r.id})">↗ Check-out</button></td>
    </tr>`;
  }).join('')||noRows(8,'Sin huéspedes activos');
}
async function doCheckout(id){
  const r=D.reservas.find(x=>x.id==id);if(!r)return;
  const hu=huesp(r.huesped_id);
  if(!confirm(`¿Confirmar check-out de ${hu?.nombre||'este huésped'}?`))return;
  await dbUpd('reservas',id,{estado:'checkout'});
  await dbUpd('habitaciones',r.habitacion_id,{estado:'limpieza'});
  // CRM: actualizar gasto total
  if(hu){
    const ng=Number(hu.gasto_total||0)+Number(r.total||0);
    await dbUpd('huespedes',hu.id,{gasto_total:ng});
    const i=D.huespedes.findIndex(x=>x.id==hu.id);if(i>=0)D.huespedes[i].gasto_total=ng;
  }
  const ri=D.reservas.findIndex(x=>x.id==id);if(ri>=0)D.reservas[ri].estado='checkout';
  const hi=D.habs.findIndex(x=>x.id==r.habitacion_id);if(hi>=0)D.habs[hi].estado='limpieza';
  toast('Check-out completado · Habitación pasa a limpieza','ok');rCheckout();
}

/* ════════════════════════════════════════════════════
   RESERVAS CRUD
════════════════════════════════════════════════════ */
function rReservas(){
  const q=val('res-q').toLowerCase(),f=val('res-f');
  const list=D.reservas.filter(r=>{const hu=huesp(r.huesped_id);return(!q||(hu?.nombre||'').toLowerCase().includes(q))&&(!f||r.estado===f);});
  el('res-tbl').innerHTML=list.map(r=>{
    const hb=hab(r.habitacion_id),hu=huesp(r.huesped_id);
    return`<tr>
      <td class="bold">${hu?.nombre||'—'}</td>
      <td>${hb?.numero||'—'} · ${hb?.tipo||''}</td>
      <td>${fmt2(r.fecha_entrada)}</td><td>${fmt2(r.fecha_salida)}</td>
      <td><span class="badge bv-reservada">${r.origen||'—'}</span></td>
      <td class="bold">S/${r.total||0}</td>
      <td><span class="badge bv-${r.estado}">${r.estado}</span></td>
      <td><div class="tda">
        <span class="ico" onclick="editRes(${r.id})">✏️</span>
        <span class="ico" onclick="cancelRes(${r.id})">✕</span>
      </div></td>
    </tr>`;
  }).join('')||noRows(8,'Sin reservas');
}
function openModalReserva(){
  fillSel('mres-hu',D.huespedes,h=>({v:h.id,l:h.nombre}));
  fillSel('mres-hab',D.habs.filter(h=>h.estado==='libre'),h=>({v:h.id,l:`${h.numero} · ${h.tipo} · S/${h.precio}`}));
  const hoy=fmt(new Date());setv('mres-ent',hoy);
  const m=new Date();m.setDate(m.getDate()+1);setv('mres-sal',fmt(m));
  setv('mres-id','');el('mres-title').textContent='Nueva reserva';
  openMod('m-reserva');
}
function editRes(id){
  const r=D.reservas.find(x=>x.id==id);if(!r)return;
  fillSel('mres-hu',D.huespedes,h=>({v:h.id,l:h.nombre}));
  fillSel('mres-hab',D.habs,h=>({v:h.id,l:`${h.numero} · ${h.tipo}`}));
  setv('mres-id',r.id);setv('mres-hu',r.huesped_id);setv('mres-hab',r.habitacion_id);
  setv('mres-ent',r.fecha_entrada);setv('mres-sal',r.fecha_salida);
  setv('mres-ori',r.origen||'directo');setv('mres-tot',r.total||'');setv('mres-est',r.estado);
  el('mres-title').textContent='Editar reserva';openMod('m-reserva');
}
async function saveReserva(){
  const id=val('mres-id'),hid=val('mres-hu'),habid=val('mres-hab');
  const ent=val('mres-ent'),sal=val('mres-sal');
  if(!hid||!habid||!ent||!sal){toast('Completa todos los campos requeridos','er');return;}
  const hb=D.habs.find(x=>x.id==habid);
  const noches=Math.max(1,Math.round((new Date(sal)-new Date(ent))/86400000));
  const total=val('mres-tot')||((hb?.precio||0)*noches);
  const o={huesped_id:+hid,habitacion_id:+habid,fecha_entrada:ent,fecha_salida:sal,origen:val('mres-ori'),total:+total,estado:val('mres-est')};
  if(id){await dbUpd('reservas',id,o);toast('Reserva actualizada','ok');}
  else{const nr=await dbIns('reservas',o);if(nr){toast('Reserva creada','ok');}}
  if(o.estado==='activa')await dbUpd('habitaciones',+habid,{estado:'ocupada'});
  closeMod('m-reserva');rReservas();
}
async function cancelRes(id){
  if(!confirm('¿Cancelar esta reserva?'))return;
  const r=D.reservas.find(x=>x.id==id);
  await dbUpd('reservas',id,{estado:'cancelada'});
  const ri=D.reservas.findIndex(x=>x.id==id);if(ri>=0)D.reservas[ri].estado='cancelada';
  if(r)await dbUpd('habitaciones',r.habitacion_id,{estado:'libre'});
  const hi=D.habs.findIndex(x=>x.id==r?.habitacion_id);if(hi>=0)D.habs[hi].estado='libre';
  toast('Reserva cancelada','ok');rReservas();
}

/* ════════════════════════════════════════════════════
   COLA LIMPIEZA
════════════════════════════════════════════════════ */
function rCola(){
  const list=D.habs.filter(h=>h.estado==='limpieza'||h.estado==='libre');
  el('cola-c').innerHTML=list.map(h=>`
    <div class="card card-xs flex aic jcb">
      <div class="flex aic g2">
        <span class="bold">Hab. ${h.numero}</span>
        <span class="sm muted">${h.tipo} · Piso ${h.piso}</span>
        <span class="badge bv-${h.estado}">${h.estado}</span>
      </div>
      ${h.estado==='limpieza'?`<button class="btn btn-g btn-sm" onclick="marcarLimpia(${h.id})">✓ Lista</button>`:'<span class="sm muted">Libre</span>'}
    </div>`).join('')||'<div class="card"><p class="muted ta-c" style="padding:20px">🎉 Sin cuartos pendientes</p></div>';
}
async function marcarLimpia(id){
  await dbUpd('habitaciones',id,{estado:'libre'});
  const i=D.habs.findIndex(x=>x.id==id);if(i>=0)D.habs[i].estado='libre';
  toast('Habitación lista','ok');rCola();
}

/* ════════════════════════════════════════════════════
   INCIDENCIAS CRUD
════════════════════════════════════════════════════ */
function rIncidencias(){
  el('inci-tbl').innerHTML=D.incidencias.map(i=>{
    const hb=hab(i.habitacion_id);
    return`<tr>
      <td class="bold">${hb?.numero||'—'}</td>
      <td>${i.descripcion}</td>
      <td class="bv-${i.prioridad} bold">${i.prioridad.toUpperCase()}</td>
      <td><span class="badge bv-${i.estado==='resuelta'?'activa':'ocupada'}">${i.estado}</span></td>
      <td class="sm muted">${fmt2(i.created_at)}</td>
      <td><div class="tda">
        ${i.estado!=='resuelta'?`<button class="btn btn-g btn-xs" onclick="resolverInci(${i.id})">✓</button>`:''}
        <span class="ico" onclick="delInci(${i.id})">🗑️</span>
      </div></td>
    </tr>`;
  }).join('')||noRows(6,'Sin incidencias');
}
async function saveInci(){
  const habid=val('mi-hab'),desc=val('mi-desc').trim();
  if(!habid||!desc){toast('Selecciona habitación y describe el problema','er');return;}
  const o={habitacion_id:+habid,descripcion:desc,prioridad:val('mi-pri'),estado:'pendiente',created_at:new Date().toISOString()};
  await dbIns('incidencias',o);toast('Incidencia reportada','ok');closeMod('m-inci');rIncidencias();
}
async function resolverInci(id){
  await dbUpd('incidencias',id,{estado:'resuelta'});
  const i=D.incidencias.findIndex(x=>x.id==id);if(i>=0)D.incidencias[i].estado='resuelta';
  toast('Incidencia resuelta','ok');rIncidencias();
}
async function delInci(id){if(!confirm('¿Eliminar?'))return;await dbDel('incidencias',id);toast('Eliminada','ok');rIncidencias();}

/* ════════════════════════════════════════════════════
   CHECKLIST 3★
════════════════════════════════════════════════════ */
const CL=[
  {cat:'Infraestructura',items:['Habitaciones mínimo 8m² (simple) y 12m² (doble)','Baño privado en todas las habitaciones','Agua caliente las 24 horas','Ventilación natural o climatización','Señalización de emergencia y salidas','Extintor por piso'].map(t=>({t,done:false}))},
  {cat:'Servicio al huésped',items:['Recepción atendida mínimo 12 horas al día','Limpieza diaria de habitaciones','Cambio de lencería cada 3 días o al cambio de huésped','Caja de seguridad en recepción','Wi-Fi en todas las habitaciones','Oferta de desayuno'].map(t=>({t,done:false}))},
  {cat:'Documentación legal',items:['Registro en MINCETUR vigente','Licencia de funcionamiento vigente','Certificado INDECI vigente','Libro de reclamaciones visible','TUPA canceladas y al día'].map(t=>({t,done:false}))},
  {cat:'Equipamiento mínimo',items:['Televisor en habitación','Mesa y silla de trabajo','Espejo de cuerpo entero','Amenities básicos (jabón, shampoo, papel)','Perchero o armario en cada habitación'].map(t=>({t,done:false}))},
];
function rChecklist(){
  let tot=0,done=0;
  CL.forEach(c=>{tot+=c.items.length;done+=c.items.filter(i=>i.done).length;});
  const pct=Math.round((done/tot)*100);
  el('cl-pct').textContent=pct+'%';
  el('cl-pct').style.color=pct>=80?'var(--green)':'var(--accent)';
  el('cl-bar').style.width=pct+'%';el('cl-bar').style.background=pct>=80?'var(--green)':'var(--accent)';
  el('cl-sub').textContent=`${done} de ${tot} requisitos${pct>=100?' · ¡Listo para solicitar la categorización!':''}`;
  el('cl-c').innerHTML=CL.map((cat,ci)=>{
    const ch=cat.items.filter(i=>i.done).length;
    const cp=Math.round((ch/cat.items.length)*100);
    return`<div class="card">
      <div class="flex jcb aic" style="margin-bottom:8px">
        <div class="ct" style="margin:0">${cat.cat}</div>
        <span class="sm muted">${ch}/${cat.items.length} · ${cp}%</span>
      </div>
      <div class="pb"><div class="pf" style="width:${cp}%;background:${cp===100?'var(--green)':'var(--accent)'}"></div></div>
      <div style="margin-top:10px">${cat.items.map((item,ii)=>`
        <label class="cl-item${item.done?' done':''}">
          <input type="checkbox" ${item.done?'checked':''} onchange="toggleCL(${ci},${ii},this.checked)" style="width:auto;cursor:pointer;accent-color:var(--accent)"/>
          <span>${item.t}</span>
        </label>`).join('')}</div>
    </div>`;
  }).join('');
}
function toggleCL(ci,ii,v){CL[ci].items[ii].done=v;rChecklist();}

/* ════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════ */
const el=id=>document.getElementById(id);
const val=id=>el(id)?.value||'';
const setv=(id,v)=>{if(el(id))el(id).value=v};
const show=id=>el(id)?.classList.remove('hidden');
const hide=id=>el(id)?.classList.add('hidden');
const showErr=(id,m)=>{el(id).textContent=m;show(id)};
const noop=()=>{};
const fmt=d=>d instanceof Date?d.toISOString().split('T')[0]:d;
const fmt2=s=>{if(!s)return'—';const[y,m,d]=(s.includes('T')?s.split('T')[0]:s).split('-');return`${d}/${m}/${y}`};
const hab=id=>D.habs.find(x=>x.id==id);
const huesp=id=>D.huespedes.find(x=>x.id==id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const noRows=(cols,msg)=>`<tr><td colspan="${cols}" class="muted ta-c" style="padding:20px">${msg}</td></tr>`;

function openMod(id){show(id)}
function closeMod(id){hide(id)}

function fillSel(id,items,mapFn,ph='Seleccionar…'){
  const s=el(id);if(!s)return;
  s.innerHTML=`<option value="">${ph}</option>`+items.map(i=>{const{v,l}=mapFn(i);return`<option value="${v}">${l}</option>`}).join('');
}

function selectedAmenities(){
  return [...document.querySelectorAll('#mh-amenities input:checked')].map(c=>c.value);
}

function syncAmenities(){
  const selected=selectedAmenities();
  setv('mh-desc',selected.join(', '));
  const summary=el('mh-amenities-summary');
  if(summary)summary.textContent=selected.length?selected.join(', '):'Seleccionar comodidades';
}

function setAmenities(value){
  const selected=(value||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  document.querySelectorAll('#mh-amenities input[type="checkbox"]').forEach(c=>{
    c.checked=selected.includes(c.value.toLowerCase());
  });
  syncAmenities();
  closeAmenities();
}

function closeAmenities(){
  const menu=el('mh-amenities');
  if(menu)menu.open=false;
}

let _tt;
function toast(msg,type='in'){
  const t=el('toast');t.textContent=msg;t.className=type+' show';
  clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),3500);
}


