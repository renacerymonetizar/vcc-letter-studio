// AUTH — official Netlify Identity widget
function showAuthMessage(message,type='info'){
  const box=document.getElementById('authMessage');
  if(!box) return;
  box.textContent=message||'';
  box.style.display=message?'block':'none';
  box.dataset.type=type;
}
function enterStudio(){document.getElementById('introView').style.display='none';document.getElementById('appView').style.display='block'}
function returnToLogin(){document.getElementById('appView').style.display='none';document.getElementById('introView').style.display='block'}
function identity(){return window.netlifyIdentity||null}
function openIdentity(mode){
  const api=identity();
  if(!api){showAuthMessage('El sistema de acceso aún no terminó de cargar. Recarga la página.','error');return;}
  api.open(mode);
}
const showLogin=document.getElementById('showLogin');
const showRegister=document.getElementById('showRegister');
const loginPane=document.getElementById('loginPane');
const registerPane=document.getElementById('registerPane');
showLogin.onclick=()=>{
  showLogin.classList.add('active');showRegister.classList.remove('active');
  loginPane.classList.remove('hidden');registerPane.classList.add('hidden');
  openIdentity('login');
};
showRegister.onclick=()=>{
  showRegister.classList.add('active');showLogin.classList.remove('active');
  registerPane.classList.remove('hidden');loginPane.classList.add('hidden');
  openIdentity('signup');
};
document.getElementById('loginBtn').onclick=()=>openIdentity('login');
document.getElementById('registerBtn').onclick=()=>openIdentity('signup');
document.getElementById('forgotPasswordBtn').onclick=()=>openIdentity('login');
const resetPasswordBtn=document.getElementById('resetPasswordBtn');
if(resetPasswordBtn) resetPasswordBtn.onclick=()=>openIdentity('login');
async function logout(){
  const api=identity();
  if(api){try{await api.logout()}catch(e){console.error(e)}}
  returnToLogin();
}
function initIdentity(){
  const api=identity();
  if(!api){showAuthMessage('No se pudo cargar Netlify Identity. Recarga la página.','error');return;}
  api.init({locale:'es'});
  api.on('init',user=>{if(user) enterStudio()});
  api.on('login',user=>{api.close();showAuthMessage('');enterStudio()});
  api.on('signup',user=>{showAuthMessage('Registro creado. Revisa tu correo para confirmar tu cuenta.','success')});
  api.on('logout',()=>returnToLogin());
  api.on('error',err=>{console.error(err);showAuthMessage(err?.message||'No se pudo completar el acceso.','error')});
}
initIdentity();

const titles=[["Portada","Bienvenida al Studio"],["Modo","Crear desde cero o con foto"],["Intención","Qué debe hacer sentir"],["Universo","Dónde viven tus letras"],["Materialidad","De qué están hechas"],["Composición","Cómo conviven en la imagen"],["Dirección visual","Luz, color y acabado"],["Candados","Qué no puede cambiar"],["Prompt final","Resultado listo para usar"]];
let current=0;
function renderSteps(){
  const steps=document.getElementById('steps'); steps.innerHTML='';
  titles.forEach((t,i)=>{ const d=document.createElement('div'); d.className='step'+(i===current?' active':''); d.innerHTML=`<b>${i+1}. ${t[0]}</b><small>${t[1]}</small>`; d.onclick=()=>go(i); steps.appendChild(d); });
  document.getElementById('bar').style.width=((current+1)/titles.length*100)+'%';
  document.getElementById('progressText').textContent=`Paso ${current+1} de ${titles.length}`;
}
function go(i){ current=Math.max(0,Math.min(titles.length-1,i)); document.querySelectorAll('#appView .card').forEach((c,n)=>c.classList.toggle('active',n===current)); renderSteps(); window.scrollTo({top:0,behavior:'smooth'}); }
function next(){go(current+1)} function prev(){go(current-1)}
renderSteps();

document.querySelectorAll('#locks .choice').forEach(c=>c.onclick=()=>c.classList.toggle('on'));
function setCreationMode(mode){
  const input=document.getElementById('creationMode');
  if(input) input.value=mode;
  const scratch=document.getElementById('modeScratchCard');
  const photo=document.getElementById('modePhotoCard');
  if(scratch) scratch.classList.toggle('active', mode==='scratch');
  if(photo) photo.classList.toggle('active', mode==='photo');
  const tip=document.getElementById('creationModeTip');
  if(tip){
    tip.innerHTML = mode==='photo'
      ? '<strong>Modo actual:</strong> Usar una foto. Recuerda que al final deberás llevar el prompt a ChatGPT y subir también tu imagen base.'
      : '<strong>Modo actual:</strong> Crear desde cero. El Studio construirá un prompt para generar toda la pieza completa.';
  }
}

document.querySelectorAll('.choice[data-set]').forEach(chip=>chip.addEventListener('click',()=>{
  const target=chip.dataset.set;
  const value=chip.dataset.value || chip.textContent.trim();
  const setStandard=(id,val)=>{
    const sel=document.getElementById(id); if(!sel) return;
    const opt=[...sel.options].find(o=>o.value===val || o.textContent.trim()===val);
    if(opt){ sel.value=opt.value; }
    else {
      sel.value='custom';
      const custom=document.getElementById(id+'Custom');
      if(custom){ custom.value=val; custom.style.display='block'; }
    }
    sel.dispatchEvent(new Event('change'));
  };
  if(target.endsWith('-custom')){
    const id=target.replace('-custom','');
    const sel=document.getElementById(id);
    if(sel){ sel.value='custom'; sel.dispatchEvent(new Event('change')); }
    const custom=document.getElementById(id+'Custom');
    if(custom){ custom.value=value; custom.style.display='block'; }
  } else {
    setStandard(target, value);
  }
}));
setCreationMode(document.getElementById('creationMode')?.value || 'scratch');
const customSelects=['emotion','world','material','finish','texture','behavior','camera','placement','depth','palette','lighting','contrast','finalLook','effects'];
customSelects.forEach(id=>{
  const sel=document.getElementById(id); const custom=document.getElementById(id+'Custom');
  if(!sel||!custom) return;
  const sync=()=>{ custom.style.display=sel.value==='custom'?'block':'none'; };
  sel.addEventListener('change', sync); sync();
});

function val(id){ return (document.getElementById(id)?.value || '').trim(); }
function smartVal(id){ const base=val(id); if(base==='custom') return val(id+'Custom') || '[PERSONALIZADO]'; return base; }
function activeLocks(){ return [...document.querySelectorAll('#locks .choice.on')].map(x=>x.textContent.trim()) }

function buildPrompt(){
  const mode=val('creationMode') || 'scratch';
  const modeLabel = mode==='photo' ? 'Use a photo as base' : 'Create everything from scratch';
  const main=val('mainText')||'[TEXTO PRINCIPAL]';
  const sec=val('secondaryText');
  const world=smartVal('world') || '[UNIVERSO VISUAL]';
  const mat=val('customMaterial') || [smartVal('material'),smartVal('finish'),smartVal('texture'),smartVal('behavior')].filter(Boolean).join(', ') || '[MATERIAL]';
  const locks=activeLocks(); if(val('customLocks')) locks.push(val('customLocks'));
  const prompt=`Create a premium, high-impact thematic lettering composition.

EXACT TEXT
Main text: "${main}".
${sec ? `Secondary text: "${sec}".` : 'No secondary text.'}

CREATE MODE
Mode: ${modeLabel}.
${mode==='photo' ? 'The user will provide a base photo. Use that photo as the main visual reference, preserve its main subject or scene, and integrate the thematic lettering into the composition without blocking important elements unless requested.' : 'Create the full image from scratch based on the visual direction below.'}

CREATIVE INTENTION
The composition should communicate: ${smartVal('emotion') || '[EMOTION / INTENTION]'}.
Purpose: ${val('purpose') || '[PURPOSE]'}.

VISUAL WORLD
Build the scene inside this visual universe:
${world}.
Elements that should be present: ${val('worldElements') || '[KEY ELEMENTS]'}.
Avoid: ${val('avoidWorld') || '[UNWANTED ELEMENTS]'}.

LETTER MATERIALITY
The lettering must feel physically real and dimensional.
Material construction: ${mat}.
Make the material believable through texture, reflections, volume, surface behavior, edge detail and interaction with light.

COMPOSITION
Format: ${val('ratio') || '[FORMAT]'}.
Camera / framing: ${smartVal('camera') || '[CAMERA]'}.
Placement of lettering: ${smartVal('placement') || '[PLACEMENT]'}.
Depth structure: ${smartVal('depth') || '[DEPTH]'}.
Protection rules: ${val('protection') || 'Use available negative space and do not obstruct the main subject unless explicitly requested.'}

COLOR & LIGHT
Palette: ${smartVal('palette') || '[PALETTE]'}.
Lighting: ${smartVal('lighting') || '[LIGHTING]'}.
Contrast: ${smartVal('contrast') || '[CONTRAST]'}.
Atmospheric effects: ${smartVal('effects') || '[EFFECTS]'}.
Final visual finish: ${smartVal('finalLook') || 'premium editorial, polished, highly art-directed'}.

CRITICAL TEXT CONTROL
Spell every word exactly as provided.
Do not invent, remove, duplicate, merge or replace letters.
Keep the typography readable and visually intentional.
The text must remain recognizable even when rendered as a physical 3D object.

LOCKS
${locks.length ? locks.map(x=>'• '+x).join('\n') : '• Preserve exact wording and legibility.'}

FINAL DIRECTION
The result must look art-directed, premium, cohesive, visually striking and professionally composed.
Do not produce a generic font treatment. Build the lettering as an original thematic object that belongs naturally inside the chosen visual world.`;

  const short=`${mode==='photo' ? 'Use the uploaded photo as the base image and add thematic lettering.' : 'Create the full image from scratch.'} Use the exact text "${main}"${sec ? ` and "${sec}"` : ''}. Build the letters from ${mat}, inside ${world}, communicating ${smartVal('emotion')||'the desired emotion'}. Use ${smartVal('lighting')||'intentional lighting'}, ${smartVal('palette')||'a cohesive palette'}, and place the lettering ${smartVal('placement')||'in the most visually balanced available space'}. Keep every word exact, readable and free of invented letters. Final look: ${smartVal('finalLook')||'premium editorial'}.`;

  document.getElementById('masterOutput').textContent=prompt;
  document.getElementById('shortOutput').textContent=short;
  document.getElementById('sumConcept').textContent=(mode==='photo' ? 'Con foto base' : 'Desde cero')+' · '+(smartVal('emotion')||'Sin definir')+' · '+world;
  document.getElementById('sumMaterial').textContent=mat;
  document.getElementById('sumDirection').textContent=(smartVal('lighting')||'Sin luz')+' · '+(smartVal('finalLook')||'Sin acabado');
}

async function copyText(id){
  const text=(document.getElementById(id)?.textContent || '').trim();
  if(!text){ alert('Primero genera el prompt.'); return; }
  try{
    if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(text); alert('Prompt copiado.'); return; }
  }catch(e){}
  const ta=document.createElement('textarea');
  ta.value=text; ta.setAttribute('readonly',''); ta.style.position='absolute'; ta.style.left='-9999px'; document.body.appendChild(ta);
  ta.select(); ta.setSelectionRange(0, ta.value.length);
  let ok=false;
  try{ ok=document.execCommand('copy'); }catch(e){ ok=false; }
  document.body.removeChild(ta);
  if(ok) alert('Prompt copiado.');
  else window.prompt('Tu navegador bloqueó el copiado automático. Copia el texto desde aquí:', text);
}

function collect(){
  const ids=['creationMode','mainText','secondaryText','emotion','emotionCustom','purpose','world','worldCustom','worldElements','avoidWorld','material','materialCustom','finish','finishCustom','texture','textureCustom','behavior','behaviorCustom','customMaterial','ratio','camera','cameraCustom','placement','placementCustom','depth','depthCustom','protection','palette','paletteCustom','lighting','lightingCustom','contrast','contrastCustom','finalLook','finalLookCustom','effects','effectsCustom','customLocks'];
  const o={current,locks:activeLocks()}; ids.forEach(id=>o[id]=val(id)); return o;
}
function saveProject(){ localStorage.setItem('vls_project', JSON.stringify(collect())); alert('Proyecto guardado.'); }
function loadProject(){
  const raw=localStorage.getItem('vls_project'); if(!raw){alert('No hay proyecto guardado.'); return;}
  const o=JSON.parse(raw); Object.keys(o).forEach(k=>{ const el=document.getElementById(k); if(el && typeof o[k]==='string') el.value=o[k]; });
  document.querySelectorAll('#locks .choice').forEach(c=>c.classList.toggle('on', (o.locks||[]).includes(c.textContent.trim())));
  customSelects.forEach(id=>{ const s=document.getElementById(id), c=document.getElementById(id+'Custom'); if(s&&c) c.style.display=s.value==='custom'?'block':'none'; });
  setCreationMode(o.creationMode || 'scratch');
  go(o.current||0); buildPrompt(); alert('Proyecto recuperado.');
}
function resetAll(){
  document.querySelectorAll('#appView input, #appView textarea').forEach(x=>x.value='');
  document.querySelectorAll('#appView select').forEach(x=>x.selectedIndex=0);
  document.querySelectorAll('.custom-field').forEach(x=>x.style.display='none');
  document.querySelectorAll('#locks .choice').forEach((c,i)=>c.classList.toggle('on', i<4));
  document.getElementById('masterOutput').textContent=''; document.getElementById('shortOutput').textContent='';
  document.getElementById('sumConcept').textContent=''; document.getElementById('sumMaterial').textContent=''; document.getElementById('sumDirection').textContent='';
  setCreationMode('scratch');
  localStorage.removeItem('vls_project'); go(0);
}
function downloadPrompt(){
  const t=document.getElementById('masterOutput').textContent; if(!t){alert('Primero genera el prompt.'); return;}
  const blob=new Blob([t],{type:'text/plain'}); const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='Visual-Letter-Studio-Prompt.txt'; a.click(); URL.revokeObjectURL(a.href);
}

function quickPreset(type){
  if(type==='luxury'){ document.getElementById('mainText').value='Visual Letter Studio'; document.getElementById('secondaryText').value='Laboratorio interactivo de letras temáticas'; document.getElementById('emotion').value='Exclusividad'; document.getElementById('world').value='Futurista tecnológico'; document.getElementById('material').value='Vidrio'; document.getElementById('finish').value='Pulido espejo'; document.getElementById('texture').value='Superficie lisa'; document.getElementById('behavior').value='Se integra con la arquitectura'; document.getElementById('camera').value='Perspectiva cinematográfica'; document.getElementById('placement').value='Lado izquierdo'; document.getElementById('depth').value='Foreground + midground + background'; document.getElementById('palette').value='Negro + oro'; document.getElementById('lighting').value='Estudio glossy'; document.getElementById('contrast').value='Cinematográfico'; document.getElementById('finalLook').value='Editorial premium'; document.getElementById('effects').value='Sin efectos extra'; }
  if(type==='tulum'){ document.getElementById('mainText').value='VCC AI TRIP'; document.getElementById('secondaryText').value='EDICIÓN TULUM'; document.getElementById('emotion').value='Lujo natural'; document.getElementById('world').value='Lujo tropical orgánico'; document.getElementById('material').value='Piedra tallada'; document.getElementById('finish').value='Mate'; document.getElementById('texture').value='Tallado'; document.getElementById('behavior').value='Parece tallado en el entorno'; document.getElementById('camera').value='Editorial frontal'; document.getElementById('placement').value='Espacio negativo disponible'; document.getElementById('depth').value='Capas editoriales'; document.getElementById('palette').value='Beige + arena + oro suave'; document.getElementById('lighting').value='Golden hour'; document.getElementById('contrast').value='Editorial limpio'; document.getElementById('finalLook').value='Campaña de lujo'; document.getElementById('effects').value='Haze suave'; }
  if(type==='neon'){ document.getElementById('mainText').value='Midnight Icon'; document.getElementById('secondaryText').value=''; document.getElementById('emotion').value='Impacto'; document.getElementById('world').value='Nocturno de lujo'; document.getElementById('material').value='Neón'; document.getElementById('finish').value='Glossy brillante'; document.getElementById('texture').value='Superficie lisa'; document.getElementById('behavior').value='Emite luz propia'; document.getElementById('camera').value='Composición de campaña'; document.getElementById('placement').value='Centro'; document.getElementById('depth').value='Profundidad cinematográfica'; document.getElementById('palette').value='Azul eléctrico + violeta + negro'; document.getElementById('lighting').value='Neón nocturno'; document.getElementById('contrast').value='Alto'; document.getElementById('finalLook').value='Futurista premium'; document.getElementById('effects').value='Glow sutil'; }
  customSelects.forEach(id=>{ const s=document.getElementById(id), c=document.getElementById(id+'Custom'); if(s&&c) c.style.display=s.value==='custom'?'block':'none'; });
  buildPrompt(); go(8);
}
