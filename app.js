let D,Q=[],eventItems=[];
const $=x=>document.getElementById(x), esc=x=>String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

async function init(){
  D=await fetch("data.json").then(r=>r.json());
  const saved=localStorage.getItem("yv");
  if(saved){try{const s=JSON.parse(saved);D={...D,...s,company:{...D.company,...(s.company||{})},rates:{...D.rates,...(s.rates||{})},pricing:{...D.pricing,...(s.pricing||{})},materials:{...D.materials,...(s.materials||{})},blanks:{...D.blanks,...(s.blanks||{})}}}catch(e){console.warn(e)}}
  loadSettings(); cats(); refresh(); renderMaterials(); renderCatalog(); render();
}
function save(){localStorage.setItem("yv",JSON.stringify(D))}
function allProducts(){return D.products||[]}
function productMeta(p){return p?.[3]||{}}
function isCustom(p){return !!productMeta(p).custom}
function cats(){$("cat").innerHTML=[...new Set(allProducts().map(x=>x[0]))].map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")}
function refresh(){let ps=allProducts().filter(x=>x[0]===$("cat").value);$("product").innerHTML=ps.map((x,i)=>`<option value="${i}">${esc(x[1])}</option>`).join("");show()}
function customParams(p){
 const m=productMeta(p),cat=p[0],mat=m.materialKey||'';
 const mats=Object.entries(D.materials||{}).map(([k,v])=>`<option value="${esc(k)}" ${k===mat?'selected':''}>${esc(D.materialMeta?.[k]?.name||k)}</option>`).join('');
 if(cat==='SUBLIMACIÓN') return `<div><label>Material/base</label><select id="cpMat">${mats}</select></div><div><label>Costo base por unidad</label><input id="cpBase" type="number" value="${m.baseCost||0}" min="0" step="0.01"></div><div><label>Papel (hojas)</label><input id="cpPaper" type="number" value="${m.paper||0}" min="0" step="0.01"></div><div><label>Tinta (ml)</label><input id="cpInk" type="number" value="${m.ink||0}" min="0" step="0.01"></div><div><label>Tiempo (min)</label><input id="cpTime" type="number" value="${m.time||30}" min="0"></div>`;
 if(cat==='DTF') return `<div><label>Costo prenda/base</label><input id="cpBase" type="number" value="${m.baseCost||0}" min="0" step="0.01"></div><div><label>Área DTF (cm²)</label><input id="cpArea" type="number" value="${m.area||500}" min="0"></div><div><label>Tiempo total (min)</label><input id="cpTime" type="number" value="${m.time||10}" min="0"></div>`;
 if(cat==='IMPRESIÓN') return `<div><label>Ancho cm</label><input id="cpW" type="number" value="${m.w||21}" min="0.1"></div><div><label>Alto cm</label><input id="cpH" type="number" value="${m.h||29.7}" min="0.1"></div><div><label>Material</label><select id="cpMat">${mats}</select></div><div><label>¿Laminado?</label><select id="cpLam"><option value="0">No</option><option value="1">Sí</option></select></div><div><label>Tiempo (min)</label><input id="cpTime" type="number" value="${m.time||2}" min="0"></div>`;
 if(cat==='ROTULACIÓN') return `<div><label>Metros lineales</label><input id="cpMeters" type="number" value="${m.meters||1}" min="0.01" step="0.01"></div><div><label>Costo por metro</label><input id="cpBase" type="number" value="${m.baseCost||0}" min="0" step="0.01"></div><div><label>Tiempo por metro (min)</label><input id="cpTime" type="number" value="${m.time||20}" min="0"></div><div><label>¿Instalación?</label><select id="cpInstall"><option value="0">No</option><option value="1">Sí</option></select></div>`;
 if(cat==='ACRÍLICO') return `<div><label>Ancho cm</label><input id="cpW" type="number" value="${m.w||100}" min="1"></div><div><label>Alto cm</label><input id="cpH" type="number" value="${m.h||100}" min="1"></div><div><label>Costo material/m²</label><input id="cpBase" type="number" value="${m.baseCost||0}" min="0" step="0.01"></div><div><label>Fabricación (h)</label><input id="cpHours" type="number" value="${m.hours||2}" min="0" step="0.1"></div><div><label>¿Instalación?</label><select id="cpInstall"><option value="0">No</option><option value="1">Sí</option></select></div>`;
 if(cat==='LÁSER') return `<div><label>Área (cm²)</label><input id="cpArea" type="number" value="${m.area||100}" min="0"></div><div><label>Tiempo láser (min)</label><input id="cpTime" type="number" value="${m.time||10}" min="0"></div><div><label>Costo material/base</label><input id="cpBase" type="number" value="${m.baseCost||0}" min="0" step="0.01"></div>`;
 if(cat==='3D') return `<div><label>Gramos</label><input id="cpGrams" type="number" value="${m.grams||100}" min="0"></div><div><label>Horas máquina</label><input id="cpHours" type="number" value="${m.hours||1}" min="0" step="0.01"></div><div><label>Preparación/acabado (min)</label><input id="cpTime" type="number" value="${m.time||10}" min="0"></div><div><label>Material</label><select id="cpMat">${mats}</select></div>`;
 if(cat==='DISEÑO / DIGITAL') return `<div><label>Horas estimadas</label><input id="cpHours" type="number" value="${m.hours||1}" min="0" step="0.5"></div><div><label>Costo base adicional</label><input id="cpBase" type="number" value="${m.baseCost||0}" min="0" step="0.01"></div>`;
 return `<div><label>Material/base</label><select id="cpMat">${mats}</select></div><div><label>Costo base por unidad</label><input id="cpBase" type="number" value="${m.baseCost||0}" min="0" step="0.01"></div><div><label>Tiempo (min)</label><input id="cpTime" type="number" value="${m.time||15}" min="0"></div>`;
}
function show(){
  let ps=D.products.filter(x=>x[0]===$("cat").value),p=ps[+$('product').value||0],v=p?.[2]||[];
  $("variantBox").innerHTML=v.length?`<div><label>Variante</label><select id="variant">${v.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")}</select></div>`:"";
  let r="";
  if(isCustom(p)) r=customParams(p);
  else if(p?.[0]==="IMPRESIÓN"&&p[1]==="Impresión") r=`<div><label>Medida</label><select id="printSize"><option>A4</option><option>Carta</option><option>Oficio</option><option>A3/Tabloide</option><option>Otro</option></select></div><div id="customPrint"></div><div><label>Material</label><select id="pm"><option value="bond">Bond 80g</option><option value="premium">Premium</option><option value="photo">Fotográfico</option><option value="adhesive">Adhesivo</option></select></div><div><label>¿Laminado?</label><select id="lam"><option value="0">No</option><option value="1">Sí</option></select></div><div><label>Tipo de laminado</label><select id="lt"><option>Frío</option><option>Caliente</option></select></div>`;
  else if(["Vinil impreso","Vinil de corte","Vinil reflectivo","Vinil especial / holográfico"].includes(p?.[1])) r=`<div><label>Metros lineales</label><input id="meters" type="number" value="1" min="0.01" step="0.01"></div><div><label>¿Instalación?</label><select id="install"><option value="0">No</option><option value="1">Sí</option></select></div>`;
  else if(p?.[0]==="ACRÍLICO") r=`<div><label>Ancho cm</label><input id="w" type="number" value="100" min="1"></div><div><label>Alto cm</label><input id="h" type="number" value="100" min="1"></div><div><label>¿Separadores?</label><select id="seps"><option value="0">No</option><option value="1">Sí</option></select></div><div><label>Cantidad de separadores</label><input id="sq" type="number" value="4" min="0"></div><div><label>¿Iluminación?</label><select id="light"><option value="0">No</option><option value="1">Sí</option></select></div><div><label>¿Instalación?</label><select id="install"><option value="0">No</option><option value="1">Sí</option></select></div><div><label>% de vinil sobre acrílico</label><input id="vp" type="number" value="80" min="0" max="100"></div>`;
  else if(p?.[0]==="LÁSER") r=`<div><label>Área a trabajar (cm²)</label><input id="area" type="number" value="100" min="0"></div><div><label>Tiempo de láser (min)</label><input id="mins" type="number" value="1" min="0"></div><div><label>Producto/material base</label><select id="base"><option value="acrylic">Acrílico</option><option value="mdf">MDF</option><option value="leather">Cuero</option><option value="metal">Tarjeta / llavero metálico</option></select></div><div><label>Costo del producto base</label><input id="baseCost" type="number" value="3" min="0"></div>`;
  else if(p?.[0]==="3D") r=`<div><label>Gramos PETG</label><input id="grams" type="number" value="100" min="0"></div><div><label>Horas de máquina</label><input id="mh" type="number" value="1" step="0.01" min="0"></div><div><label>Preparación (min)</label><input id="prep3d" type="number" value="60" min="0"></div>`;
  else if(p?.[0]==="EVENTOS") r=`<div id="eventBuilder"><b>Componentes del evento</b><div class="eventadd"><select id="ep">${D.products.filter(x=>x[0]!=="EVENTOS").map((x,i)=>`<option value="${i}">${esc(x[0])} · ${esc(x[1])}</option>`).join("")}</select><input id="eq" type="number" value="1" min="1"><button id="ea">Añadir</button></div><div id="erows"></div><label>¿Branding/diseño?</label><select id="ed"><option value="0">No</option><option value="1">Sí</option></select><label>¿Producción?</label><select id="eprod"><option value="0">No</option><option value="1">Sí</option></select><label>¿Montaje?</label><select id="ei"><option value="0">No</option><option value="1">Sí</option></select></div>`;
  else if(p?.[1]==="Agenda ½ carta") r=`<div><label>Tipo de tapa</label><select id="agendaCover"><option>Tapa blanda</option><option>Tapa dura</option></select></div><div><label>Cantidad de hojas</label><input id="sheets" type="number" value="50" min="1"></div><div><label>¿Stickers?</label><select id="stick"><option value="0">No</option><option value="1">Sí</option></select></div>`;
  else if(p?.[1]==="Carpetas corporativas") r=`<div><label>Material</label><select id="folderMat"><option>Revestido</option><option>Glasse 300</option></select></div><div><label>¿Laminado?</label><select id="folderLam"><option value="0">No</option><option value="1">Sí</option></select></div>`;
  else if(p?.[1]==="Stickers / etiquetas") r=`<div><label>Ancho sticker cm</label><input id="sw" type="number" value="5" min="0.1" step="0.1"></div><div><label>Alto sticker cm</label><input id="sh" type="number" value="5" min="0.1" step="0.1"></div><div><label>Metros a imprimir</label><input id="sm" type="number" value="1" min="0.01" step="0.01"></div><div><label>Material</label><select id="smat"><option value="adhesive">Adhesivo</option><option value="vinyl">Vinil</option><option value="dtf">DTF</option></select></div><div><label>¿Laminado?</label><select id="slam"><option value="0">No</option><option value="1">Sí</option></select></div>`;
  $("params").innerHTML=r;
  if($("printSize")){$("printSize").onchange=()=>{$("customPrint").innerHTML=$("printSize").value==="Otro"?`<div class="grid"><div><label>Ancho cm</label><input id="pw" type="number" min="0.1" value="21"></div><div><label>Alto cm</label><input id="ph" type="number" min="0.1" value="29.7"></div></div>`:""}}
  if($("ea"))$("ea").onclick=()=>{let idx=+$('ep').value, arr=D.products.filter(x=>x[0]!=="EVENTOS"),pp=arr[idx];eventItems.push({p:pp,q:+$('eq').value||1});eventRows()};
}
function eventRows(){if(!$("erows"))return;$("erows").innerHTML=eventItems.map((x,i)=>`<div class="line"><span>${esc(x.p[0])} · ${esc(x.p[1])} × ${x.q}</span><button onclick="eventItems.splice(${i},1);eventRows()">×</button></div>`).join("")}
function blank(p,v){
  if(isCustom(p)) return Number(productMeta(p).baseCost||0);
  if(p[0]==="SUBLIMACIÓN"){
    if(p[1]==="Taza")return ({"11oz Premium":2.5,"6oz Premium":3.5,"11oz Mágica":6,"6oz Mágica":6,"11oz Peltre":5,"6oz Peltre":5,"Set de 4 6oz":14}[v]||0);
    if(p[1]==="Gorra")return D.blanks[v+"_gorra"]||0;
    if(p[1]==="Peluche")return D.blanks[v+"_peluche"]||0;
    return D.blanks[v]||0;
  }
  if(p[1]==="Logotipo")return 80;if(p[1]==="Branding")return 150;if(p[1]==="Redes sociales")return 150;if(p[1]==="Página web")return 150;if(p[1]==="Campaña Ads")return 20;return 0;
}
function calc(p,v){
 let c=blank(p,v),h=0,d="";
 if(isCustom(p)){
   const m=productMeta(p),cat=p[0];
   if(cat==='SUBLIMACIÓN'){const mat=$('cpMat')?.value||m.materialKey||'', base=+$('cpBase')?.value||0;c=base+(Number(D.materials?.[mat]||0)*(+$('cpPaper')?.value||0))+(Number(D.materials?.subInk||0)*(+$('cpInk')?.value||0));h=(+$('cpTime')?.value||0)/60;d=`Producto nuevo · material/base · ${$('cpPaper')?.value||0} hoja(s) · ${$('cpInk')?.value||0} ml tinta`}
   else if(cat==='DTF'){const a=+$('cpArea')?.value||0;c=(+$('cpBase')?.value||0)+Number(D.materials?.dtf||0)*(a/2800)+Number(D.materials?.teflon||0)/300;h=(+$('cpTime')?.value||0)/60;d=`Producto nuevo · área DTF: ${a} cm²`}
   else if(cat==='IMPRESIÓN'){const area=(+$('cpW')?.value||1)*(+$('cpH')?.value||1)/10000,mat=$('cpMat')?.value||m.materialKey||'bond';c=area*Number(D.materials?.[mat]||0);h=(+$('cpTime')?.value||0)/60;if($('cpLam')?.value==='1'){c+=area*Number(D.materials?.coldLam||0);h+=20/60}d=`Producto nuevo · ${$('cpW')?.value} × ${$('cpH')?.value} cm · ${(D.materialMeta?.[mat]?.name)||mat}`}
   else if(cat==='ROTULACIÓN'){const mm=+$('cpMeters')?.value||1,pc=+$('cpBase')?.value||0,ins=$('cpInstall')?.value==='1';c=mm*pc;h=mm*(+$('cpTime')?.value||0)/60;if(ins){c+=mm*D.pricing.hour;h+=mm}d=`Producto nuevo · ${mm} m · instalación: ${ins?'Sí':'No'}`}
   else if(cat==='ACRÍLICO'){const area=(+$('cpW')?.value||1)*(+$('cpH')?.value||1)/10000,ins=$('cpInstall')?.value==='1';c=area*(+$('cpBase')?.value||0);h=+$('cpHours')?.value||0;if(ins)h+=2;d=`Producto nuevo · ${$('cpW')?.value} × ${$('cpH')?.value} cm`}
   else if(cat==='LÁSER'){c=+$('cpBase')?.value||0;h=(+$('cpTime')?.value||0)/60;d=`Producto nuevo · ${$('cpArea')?.value||0} cm² · ${$('cpTime')?.value||0} min`}
   else if(cat==='3D'){const mat=$('cpMat')?.value||m.materialKey||'petg';c=Number(D.materials?.[mat]||D.materials?.petg||0)*(+$('cpGrams')?.value||0);h=(+$('cpHours')?.value||0)+(+$('cpTime')?.value||0)/60;d=`Producto nuevo · ${$('cpGrams')?.value||0} g · ${$('cpHours')?.value||0} h máquina`}
   else if(cat==='DISEÑO / DIGITAL'){c=+$('cpBase')?.value||0;h=+$('cpHours')?.value||0;d=`Producto digital nuevo · ${h} h estimadas`}
   else {const mat=$('cpMat')?.value||m.materialKey||'';c=(+$('cpBase')?.value||0)+Number(D.materials?.[mat]||0);h=(+$('cpTime')?.value||0)/60;d=`Producto nuevo · ${(D.materialMeta?.[mat]?.name)||mat}`}
 } else if(p[0]==="SUBLIMACIÓN"){
   let paper=(p[1]==="Franela"&&v==="Full")?1:(p[1]==="Gorra"?.25:0.5); if(p[1]==="Mouse pad"||p[1]==="Cuadro aluminio")paper=1;
   if(p[1]==="Cuadro aluminio"&&v==="40×60")paper=1.3;
   c+=D.materials.subPaper*paper+D.materials.subInk*2+D.materials.tape*.3;
   h=p[1]==="Franela"&&v==="Full"?1:.5;
   if(p[1]==="Franela")c+=D.materials.shirt;
   d=`Variante: ${v||"Única"}`;
 } else if(p[0]==="DTF"){
   let a=p[1]==="Franela"?({Pequeña:300,Mediana:750,Grande:952}[v]||500):500;
   c+=D.materials.dtf*(a/2800)+D.materials.teflon/300+D.materials.tape*.3;
   if(p[1]==="Franela")c+=D.materials.shirt;
   h=(5+1+2+2)/60;d=`Variante: ${v||"Única"} · Área DTF: ${a} cm²`;
   if(p[1]==="Aplicación sobre prenda del cliente")c=8+D.materials.teflon/300+D.materials.tape*.3;
 } else if(p[1]==="Impresión"){
   let size=$("printSize")?.value||v, dims={A4:[21,29.7],Carta:[21.59,27.94],Oficio:[21.59,33],"A3/Tabloide":[27.94,43.18]}[size];
   if(size==="Otro")dims=[+$('pw')?.value||21,+$('ph')?.value||29.7];
   let area=(dims[0]*dims[1])/10000, key=$("pm")?.value||"bond";
   let material={bond:D.materials.bond,premium:D.materials.premium,photo:D.materials.photo,adhesive:D.materials.adhesive}[key]||D.materials.bond;
   c=area*material; h=({A4:1.5,Carta:1.5,Oficio:2,"A3/Tabloide":5,Otro:5}[size]||5)/60;
   if($("lam")?.value==="1"){let cold=$("lt").value==="Frío";c+=area*(cold?D.materials.coldLam:D.materials.hotLam);h+=cold?20/60:.5/60}
   d=`Medida: ${dims[0].toFixed(1)} × ${dims[1].toFixed(1)} cm · Material: ${$("pm").selectedOptions[0].text} · Laminado: ${$("lam")?.value==="1"?$("lt").value:"No"}`;
 } else if(["Vinil impreso","Vinil de corte","Vinil reflectivo","Vinil especial / holográfico"].includes(p[1])){
   let m=+$('meters').value||1,pc={"Vinil impreso":10,"Vinil de corte":3,"Vinil reflectivo":6,"Vinil especial / holográfico":15}[p[1]],ins=$('install').value==="1";
   c=pc*m;h=(p[1]==="Vinil impreso"?20:60)/60*m;let installCost=ins?m*D.pricing.hour:0;c+=installCost;h+=ins?m:0;
   d=`${m} m lineales · Producto: $${(pc*m).toFixed(2)} · Instalación: ${ins?'Sí':'No'}${ins?` · $${installCost.toFixed(2)}`:''}`;
 } else if(p[0]==="ACRÍLICO"){
   let a=(+$('w').value||100)*(+$('h').value||100)/10000,sep=$("seps").value==="1",light=$("light").value==="1",ins=$("install").value==="1";
   c=D.materials.acrylic*a+D.materials.vinylPrint*a*(+$('vp').value||0)/100+(sep?D.materials.separator*(+$('sq').value||0):0)+(light?(D.materials.led*a+D.materials.transformer):0);
   h=2+(ins?2:0);d=`Medida: ${$('w').value} × ${$('h').value} cm · ${sep?$('sq').value+' separadores':'sin separadores'} · ${light?'iluminado':'sin iluminación'} · ${ins?'instalación incluida':'sin instalación'}`;
 } else if(p[0]==="LÁSER"){
   let area=+$('area').value||1,mins=+$('mins').value||1,base=+$('baseCost').value||0, spray=$("base").value==="metal"?D.materials.spray:0;
   c=base+spray*(area>0?1:0);h=mins/60;d=`Área: ${area} cm² · Tiempo: ${mins} min · Producto base: $${base.toFixed(2)}${spray?' · Spray metal incluido':''}`;
 } else if(p[0]==="3D"){
   let g=+$('grams').value||0,mh=+$('mh').value||0,prep=(+$('prep3d').value||60)/60;c=D.materials.petg*g;h=mh+prep+(4/60);d=`PETG: ${g} g · Máquina: ${mh} h · Preparación/acabado incluido`;
 } else if(p[1]==="Agenda ½ carta"){
   let sheets=+$('sheets').value||1,hard=$("agendaCover").value==="Tapa dura",stick=$("stick").value==="1";
   c=15*(sheets/50)+(hard?D.materials.cardboard:0)+(stick?2:0);h=1.5;d=`${$("agendaCover").value} · ${sheets} hojas · stickers: ${stick?'Sí':'No'}`;
 } else if(p[1]==="Carpetas corporativas"){
   let mat=$("folderMat").value,material=mat==="Glasse 300"?5:3.5,lam=$("folderLam").value==="1";c=material+(lam?D.materials.coldLam*.5:0);h=.75;d=`Material: ${mat} · Laminado: ${lam?'Sí':'No'}`;
 } else if(p[1]==="Stickers / etiquetas"){
   const w=Math.max(0.1,+$("sw")?.value||5), hh=Math.max(0.1,+$("sh")?.value||5);
   const meters=Math.max(0.01,+$("sm")?.value||1);
   const usableW=58, runL=100;
   const perRow=Math.floor(usableW/w), rows=Math.floor(runL/hh);
   const perMeter=Math.max(0,perRow*rows);
   const totalStickers=Math.floor(perMeter*meters);
   const mat=$("smat")?.value||"adhesive";
   let materialPerMeter=0;
   if(mat==="vinyl") materialPerMeter=D.materials.vinylPrint;
   else if(mat==="dtf") materialPerMeter=D.materials.dtf;
   else materialPerMeter=(D.materials.adhesive||0)*(61/100);
   const materialCost=meters*materialPerMeter;
   const prepMin=5, cutMin=Math.max(1,meters);
   c=materialCost; h=(prepMin+cutMin)/60;
   let lamCost=0;
   if($("slam")?.value==="1"){
     lamCost=meters*D.materials.coldLam*(60/90);
     c+=lamCost; h+=meters*20/60;
   }
   d=`${meters.toFixed(2)} m · sticker ${w.toFixed(1)} × ${hh.toFixed(1)} cm · ${totalStickers.toLocaleString("es-VE")} stickers aprox. · ${perMeter.toLocaleString("es-VE")} stickers por 1 m · material: ${materialPerMeter.toFixed(2)}/m · preparación: ${prepMin} min · corte: ${cutMin.toFixed(1)} min${lamCost?` · laminado: ${meters.toFixed(2)} m`:""}`;
 } else if(p[0]==="DISEÑO / DIGITAL"){h={Logotipo:16,Branding:40,"Redes sociales":40,"Página web":24,"Campaña Ads":2}[p[1]]||1;d=`Servicio · ${h} h estimadas`;
 } else if(p[0]==="EVENTOS"){
   for(const x of eventItems){const rr=calc(x.p,x.p[2]?.[0]||"");c+=rr.cost*x.q;h+=rr.hours*x.q}
   if($("ed")?.value==="1")h+=8;if($("eprod")?.value==="1")h+=8;if($("ei")?.value==="1")h+=4;d=`Evento · ${eventItems.length} componentes`;
 } else {h=.05;d=`${v||'Producto'}`}
 return {cost:c+h*D.pricing.hour,hours:h,detail:d}
}
function eventCalc(p,v){
  try{const r=calc(p,v);if(Number.isFinite(r.cost)&&r.cost>0)return r}catch(e){console.warn('Evento: cálculo especializado no disponible',e)}
  const b=blank(p,v),hours=p[0]==="DISEÑO / DIGITAL"?({Logotipo:16,Branding:40,"Redes sociales":40,"Página web":24,"Campaña Ads":2}[p[1]]||1):0.5;
  return {cost:b+hours*D.pricing.hour,hours,detail:`${v||'Producto'} · cálculo base de evento`};
}
function add(){
  let ps=D.products.filter(x=>x[0]===$("cat").value),p=ps[+$('product').value||0];if(!p)return;
  if(p[0]==="EVENTOS"){
    if(!eventItems.length){alert('Agrega al menos un componente al evento.');return}
    const qtyProject=Math.max(1,+$('qty').value||1);
    eventItems.forEach(x=>{const v=x.v||x.p[2]?.[0]||"",r=eventCalc(x.p,v);Q.push({name:`Evento · ${x.p[1]}`,v,qty:x.q*qtyProject,base:r.cost,hours:r.hours,detail:r.detail})});
    if($("ed")?.value==="1")Q.push({name:'Evento · Branding / diseño',v:'',qty:qtyProject,base:8*D.pricing.hour,hours:8,detail:'Servicio de branding/diseño de evento · 8 h'});
    if($("eprod")?.value==="1")Q.push({name:'Evento · Producción / gestión',v:'',qty:qtyProject,base:8*D.pricing.hour,hours:8,detail:'Gestión y producción de evento · 8 h'});
    if($("ei")?.value==="1")Q.push({name:'Evento · Montaje / instalación',v:'',qty:qtyProject,base:4*D.pricing.hour,hours:4,detail:'Montaje e instalación de evento · 4 h'});
    eventItems=[];eventRows();render();return;
  }
  let v=$("variant")?.value||"",r=calc(p,v);Q.push({name:p[1],v,qty:+$('qty').value||1,base:r.cost,hours:r.hours,detail:r.detail});render()
}
function render(){
 let lev=$("level").value,disc=Math.min(+$('discount').value||0,D.pricing.discountMax)/100;
 let tot=Q.reduce((a,x)=>a+x.base*(1+D.pricing[lev]/100)*x.qty,0)*(1-disc),cur=$("currency").value;
 $("rows").innerHTML=Q.map((x,i)=>`<tr><td>${esc(x.name)} ${x.v?"· "+esc(x.v):""}</td><td>${x.qty}</td><td>${esc(x.detail)}</td><td>${convert(x.base*(1+D.pricing[lev]/100)*x.qty*(1-disc),cur)}</td><td><button onclick="Q.splice(${i},1);render()">×</button></td></tr>`).join("");
 $("total").textContent=convert(tot,cur);$("dep").textContent=convert(tot*D.pricing.deposit/100,cur);$("bal").textContent=convert(tot*(1-D.pricing.deposit/100),cur);print(tot,cur)
}
function money(x){return "$"+Number(x).toFixed(2)}
function convert(x,c){if(c==="USD")return money(x);if(c==="VES")return "Bs "+(x*D.rates.VES_USD).toFixed(2);return "€ "+(x*D.rates.VES_USD/D.rates.VES_EUR).toFixed(2)}
function print(t,c){
 const qi=$("qlogo");if(qi){qi.src=D.company.logo||"";qi.style.display=D.company.logo?"block":"none";}
 $("pname").textContent=D.company.name;
 $('pdata').textContent=[D.company.rif,D.company.address,D.company.phone,D.company.email].filter(Boolean).join(" · ");
 $('pclient').textContent=$('client').value;
 $('ptotal').textContent=convert(t,c);
 $('pdate').textContent=new Date().toLocaleString('es-VE');
 $('valid').textContent=new Date(Date.now()+86400000).toLocaleString('es-VE');
 const dep=t*D.pricing.deposit/100,bal=t-dep;
 $('pdeposit').textContent=convert(dep,c);$('pbalance').textContent=convert(bal,c);
 $('rates').textContent=`BCV: Bs/USD ${D.rates.VES_USD} · Bs/EUR ${D.rates.VES_EUR} · Precio válido 24 horas`;
 $('pobs').textContent=$('observations')?.value||'';
 $('printRows').innerHTML=Q.map(x=>`<tr><td>${esc(x.name)} ${x.v?'· '+esc(x.v):''}</td><td>${x.qty}</td><td>${esc(x.detail)}</td><td>${convert(x.base*(1+D.pricing[$('level').value]/100)*x.qty*(1-Math.min(+$('discount').value||0,D.pricing.discountMax)/100),c)}</td></tr>`).join('')
}

function showCatalogProductForm(){
 const box=$('catalogProductForm');if(!box)return;box.style.display='block';box.innerHTML=`<div class="catalogForm"><h3>Agregar producto al catálogo</h3><div class="grid"><div><label>Categoría</label><select id="npCat"><option>SUBLIMACIÓN</option><option>DTF</option><option>IMPRESIÓN</option><option>ROTULACIÓN</option><option>ACRÍLICO</option><option>LÁSER</option><option>3D</option><option>DISEÑO / DIGITAL</option><option>PAPELERÍA</option></select></div><div><label>Producto</label><input id="npName"></div><div><label>Variantes (coma)</label><input id="npVariants" placeholder="Pequeña, Mediana, Grande"></div></div><div id="npFields" class="grid" style="margin-top:10px"></div><div class="actions"><button class="primary" id="npSave">Guardar producto</button><button id="npCancel">Cancelar</button></div></div>`;
 const rf=()=>{$('npFields').innerHTML=customParams([$('npCat').value,'',[],{custom:true}])};$('npCat').onchange=rf;rf();$('npCancel').onclick=()=>{box.style.display='none';box.innerHTML=''};$('npSave').onclick=saveCatalogProduct;
}
function saveCatalogProduct(){
 const cat=$('npCat').value,name=$('npName').value.trim();if(!name)return alert('Indica el nombre del producto.');if(allProducts().some(p=>p[0]===cat&&p[1].toLowerCase()===name.toLowerCase()))return alert('Ese producto ya existe.');
 const variants=$('npVariants').value.split(',').map(x=>x.trim()).filter(Boolean),m={custom:true,baseCost:+$('cpBase')?.value||0,materialKey:$('cpMat')?.value||'',paper:+$('cpPaper')?.value||0,ink:+$('cpInk')?.value||0,time:+$('cpTime')?.value||0,area:+$('cpArea')?.value||0,w:+$('cpW')?.value||0,h:+$('cpH')?.value||0,meters:+$('cpMeters')?.value||1,hours:+$('cpHours')?.value||0,grams:+$('cpGrams')?.value||0,description:$('npDesc')?.value.trim()||''};
 const file=$('npPhoto')?.files?.[0];const finish=()=>{save();cats();refresh();renderCatalog();$('catalogProductForm').style.display='none';$('catalogProductForm').innerHTML='';alert('Producto agregado al catálogo y al cotizador.')};D.products.push([cat,name,variants,m]);if(file){const rd=new FileReader();rd.onload=()=>{D.catalog=D.catalog||{};D.catalog[productKey([cat,name,variants,m])]=rd.result;finish()};rd.readAsDataURL(file)}else finish();
}
function saveQuote(){if(!Q.length)return alert('Agrega al menos un producto.');const key='yv_quotes',arr=JSON.parse(localStorage.getItem(key)||'[]'),lev=$('level').value,disc=Math.min(+$('discount').value||0,D.pricing.discountMax)/100,cur=$('currency').value,total=Q.reduce((a,x)=>a+x.base*(1+D.pricing[lev]/100)*x.qty,0)*(1-disc),q={id:'COT-'+Date.now(),date:new Date().toISOString(),client:$('client').value,clientEmail:$('clientEmail')?.value||'',items:Q,level:lev,discount:disc*100,currency:cur,total,deposit:total*D.pricing.deposit/100,balance:total*(1-D.pricing.deposit/100),observations:$('observations')?.value||''};arr.unshift(q);localStorage.setItem(key,JSON.stringify(arr.slice(0,100)));alert('Cotización guardada: '+q.id)}
function emailQuote(){if(!Q.length)return alert('Agrega al menos un producto.');const lev=$('level').value,disc=Math.min(+$('discount').value||0,D.pricing.discountMax)/100,cur=$('currency').value,total=Q.reduce((a,x)=>a+x.base*(1+D.pricing[lev]/100)*x.qty,0)*(1-disc),dep=total*D.pricing.deposit/100,bal=total-dep,body=[`Cliente: ${$('client').value||'Sin especificar'}`,'',...Q.map(x=>`• ${x.name}${x.v?' · '+x.v:''} | ${x.qty} | ${x.detail} | ${convert(x.base*(1+D.pricing[lev]/100)*x.qty*(1-disc),cur)}`),'',`TOTAL: ${convert(total,cur)}`,`ANTICIPO ${D.pricing.deposit}%: ${convert(dep,cur)}`,`SALDO: ${convert(bal,cur)}`,'','OBSERVACIONES:',$('observations')?.value||''].join('\n');window.location.href=`mailto:${$('clientEmail')?.value||D.company?.email||''}?subject=${encodeURIComponent('Cotización '+(D.company?.name||'Yovarela Studio'))}&body=${encodeURIComponent(body)}`}
function productKey(p){return p[0]+"||"+p[1]}
function getCatalog(){return D.catalog||{}}
function renderCatalog(){
 const grid=$("catalogGrid"); if(!grid)return;
 const products=D.products.filter(x=>x[0]!=="EVENTOS");
 grid.innerHTML=products.map((p,i)=>{const key=productKey(p),img=getCatalog()[key]||"";return `<div class="catalogItem"><div class="catImg">${img?`<img src="${img}" alt="">`:`<span>Sin foto</span>`}</div><b>${esc(p[1])}</b><small>${esc(p[0])}</small><div class="actions"><label class="photoBtn">Foto<input type="file" accept="image/*" onchange="saveCatalogPhoto(${i},this.files[0])"></label></div></div>`}).join("");
}
function saveCatalogPhoto(i,file){if(!file)return;const p=D.products.filter(x=>x[0]!=="EVENTOS")[i];if(!p)return;const rd=new FileReader();rd.onload=()=>{D.catalog=D.catalog||{};D.catalog[productKey(p)]=rd.result;save();renderCatalog()};rd.readAsDataURL(file)}
function exportCatalogWhatsApp(){
 const products=D.products.filter(x=>x[0]!=="EVENTOS"), lines=[`${D.company?.name||"Yovarela Studio"} · Catálogo`];
 products.forEach(p=>lines.push(`• ${p[1]}${p[2]?.length?" — "+p[2].join(", "):""}`));
 lines.push("", "Solicita precios y cotización personalizada por WhatsApp.");
 const url="https://wa.me/?text="+encodeURIComponent(lines.join("\n")); window.open(url,"_blank");
}
function renderMaterials(){
 $('mrows').innerHTML=Object.entries(D.materials).map(([k,v])=>{let meta=D.materialMeta?.[k]||{};return `<tr><td>${esc(meta.name||k)}</td><td><input type="number" step="0.0001" value="${v}" onchange="D.materials['${esc(k)}']=+this.value;save()"></td><td>${esc(meta.unit||'unidad')}</td><td>${meta.custom?`<button onclick="deleteMaterial('${esc(k)}')">Eliminar</button>`:''}</td></tr>`}).join('')}
function deleteMaterial(k){delete D.materials[k];if(D.materialMeta)delete D.materialMeta[k];save();renderMaterials()}
function addMaterial(){let name=$('newMatName').value.trim(),key=$('newMatKey').value.trim().replace(/[^a-zA-Z0-9_]/g,'');if(!name||!key)return alert('Completa nombre y clave');if(D.materials[key]!==undefined)return alert('Esa clave ya existe');D.materials[key]=+$('newMatCost').value||0;D.materialMeta=D.materialMeta||{};D.materialMeta[key]={name,unit:$('newMatUnit').value.trim()||'unidad',custom:true};save();$('newMatName').value='';$('newMatKey').value='';$('newMatCost').value='';$('newMatUnit').value='';renderMaterials()}
function loadSettings(){$('company').value=D.company.name;$('rif').value=D.company.rif;$('phone').value=D.company.phone;$('email').value=D.company.email;$('address').value=D.company.address;$('usd').value=D.rates.VES_USD;$('eur').value=D.rates.VES_EUR;$('hour').value=D.pricing.hour;$('min').value=D.pricing.min;$('standard').value=D.pricing.standard;$('premium').value=D.pricing.premium;$('maxd').value=D.pricing.discountMax;$('deposit').value=D.pricing.deposit;if(D.company.logo){let img=document.getElementById('logoPreview');if(img)img.src=D.company.logo}}
function saveSettings(){Object.assign(D.company,{name:$('company').value,rif:$('rif').value,phone:$('phone').value,email:$('email').value,address:$('address').value});D.rates.VES_USD=+$('usd').value;D.rates.VES_EUR=+$('eur').value;D.pricing.hour=+$('hour').value;D.pricing.min=+$('min').value;D.pricing.standard=+$('standard').value;D.pricing.premium=+$('premium').value;D.pricing.discountMax=+$('maxd').value;D.pricing.deposit=+$('deposit').value;save();alert('Guardado');render()}
$('cat').onchange=refresh;$('product').onchange=show;$('add').onclick=add;$('level').onchange=render;$('discount').oninput=render;$('currency').onchange=render;$('saveSettings').onclick=saveSettings;$('toggleMaterial').onclick=()=>{let f=$('materialForm');f.style.display=f.style.display==='none'?'block':'none'};$('cancelMaterial').onclick=()=>{$('materialForm').style.display='none'};$('addMaterial').onclick=()=>{addMaterial();$('materialForm').style.display='none'};$('waCatalog').onclick=exportCatalogWhatsApp;$('addCatalogProduct').onclick=showCatalogProductForm;$('saveQuote').onclick=saveQuote;$('emailQuote').onclick=emailQuote;$('logo').addEventListener('change',e=>{let f=e.target.files[0];if(!f)return;let rd=new FileReader();rd.onload=()=>{D.company.logo=rd.result;save();render()};rd.readAsDataURL(f)});$('printBtn').onclick=()=>window.print();init();
