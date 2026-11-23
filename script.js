(function(){
var KEY="casa-al-dia-v1",S={tasks:[],done:{},view:"list"},view=new Date();view.setDate(1);
try{var r=localStorage.getItem(KEY);if(r){var p=JSON.parse(r);if(p&&p.tasks){S=p;S.done=S.done||{}}}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
var $=function(i){return document.getElementById(i)};
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function parse(s){var a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2])}
function dim(y,m){return new Date(y,m+1,0).getDate()}
function dd(a,b){return Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/864e5)}
function occurs(t,d){
 var s=parse(t.start);if(d<s)return false;
 if(t.unit==="none")return dd(s,d)===0;
 if(t.unit==="days")return dd(s,d)%t.n===0;
 if(t.unit==="weeks")return dd(s,d)%(7*t.n)===0;
 var m=(d.getFullYear()-s.getFullYear())*12+d.getMonth()-s.getMonth();
 return m%t.n===0&&d.getDate()===Math.min(s.getDate(),dim(d.getFullYear(),d.getMonth()));
}
function desc(t){
 var s=parse(t.start),dn=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"][s.getDay()];
 if(t.unit==="none")return "Una sola vez";
 if(t.unit==="days")return t.n===1?"Todos los días":"Cada "+t.n+" días";
 if(t.unit==="weeks")return (t.n===1?"Cada semana":"Cada "+t.n+" semanas")+", el "+dn;
 return (t.n===1?"Cada mes":"Cada "+t.n+" meses")+", el día "+s.getDate();
}
function tasksOn(d){return S.tasks.filter(function(t){return occurs(t,d)})}
function isDone(t,d){return !!S.done[t.id+"|"+iso(d)]}
function toggle(t,d){var k=t.id+"|"+iso(d);if(S.done[k])delete S.done[k];else S.done[k]=1;save();render()}
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function ck(t){return "var(--c"+t.c+")"}
function render(){
 var today=new Date();today=new Date(today.getFullYear(),today.getMonth(),today.getDate());
 var isL=S.view!=="cal";
 $("list").hidden=!isL;$("cal").hidden=isL;
 $("vl").setAttribute("aria-pressed",isL);$("vc").setAttribute("aria-pressed",!isL);

 var L=$("list");L.innerHTML="";var any=false;
 for(var j=0;j<14;j++){
  let x=new Date(today);x.setDate(today.getDate()+j);var ts=tasksOn(x);
  if(!ts.length)continue;any=true;
  var lab=j===0?"Hoy":j===1?"Mañana":x.toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"});
  var h=el("div","sec"+(!L.children.length?" first":""),lab);L.appendChild(h);
  var c=el("div","card");
  ts.forEach(function(t){
   var r=el("div","row");
   var b=el("button","ring"+(isDone(t,x)?" on":""),isDone(t,x)?"✓":"");b.type="button";
   b.style.setProperty("--k",ck(t));b.setAttribute("aria-label","Marcar "+t.name+(isDone(t,x)?" como pendiente":" como hecha"));
   b.onclick=function(){toggle(t,x)};
   var w=el("div","grow"),nm=el("span",isDone(t,x)?"done-t":"",t.name);
   w.appendChild(nm);r.appendChild(b);r.appendChild(w);c.appendChild(r);
  });
  L.appendChild(c);
 }
 if(!any){var e=el("div","card");e.appendChild(el("p","empty",S.tasks.length?"Nada pendiente en los próximos 14 días.":"Toca + para agregar tu primera tarea."));L.appendChild(e)}

 $("mt").textContent=view.toLocaleDateString("es-MX",{month:"long",year:"numeric"});
 var g=$("g");g.innerHTML="";
 ["lun","mar","mié","jue","vie","sáb","dom"].forEach(function(x){g.appendChild(el("div","dow",x))});
 var first=new Date(view.getFullYear(),view.getMonth(),1),off=(first.getDay()+6)%7,st=new Date(first);st.setDate(1-off);
 var total=Math.ceil((off+dim(view.getFullYear(),view.getMonth()))/7)*7;
 for(var i=0;i<total;i++){
  var d=new Date(st);d.setDate(st.getDate()+i);
  var c2=el("div","day"+(d.getMonth()!==view.getMonth()?" off":"")+(dd(d,today)===0?" today":""));
  c2.appendChild(el("span","num",d.getDate()));
  tasksOn(d).forEach(function(t){
   var b=el("button","chip"+(isDone(t,d)?" done":""),t.name);b.type="button";b.title=t.name;b.style.setProperty("--k",ck(t));
   (function(t,d){b.onclick=function(){toggle(t,d)}})(t,d);c2.appendChild(b);
  });
  g.appendChild(c2);
 }

 var ls=$("ls");ls.innerHTML="";
 if(!S.tasks.length)ls.appendChild(el("p","empty","Aún no hay tareas."));
 S.tasks.forEach(function(t){
  var r=el("div","row"),dot=el("span","dot");dot.style.setProperty("--k",ck(t));
  var w=el("div","grow");w.appendChild(el("span","",t.name));w.appendChild(el("small","",desc(t)));
  var b=el("button","del","✕");b.type="button";b.setAttribute("aria-label","Eliminar "+t.name);
  b.onclick=function(){
   if(!confirm("¿Eliminar "+t.name+"?"))return;
   S.tasks=S.tasks.filter(function(z){return z.id!==t.id});
   Object.keys(S.done).forEach(function(k){if(k.indexOf(t.id+"|")===0)delete S.done[k]});
   save();render();
  };
  r.appendChild(dot);r.appendChild(w);r.appendChild(b);ls.appendChild(r);
 });
}
function hint(){
 var u=$("u").value,n=Math.max(1,+$("i").value||1),d=$("d").value;
 $("iw").style.display=u==="none"?"none":"";
 $("h").textContent=d?desc({unit:u,n:n,start:d})+(u==="months"&&parse(d).getDate()>28?". Si el mes es más corto, cae en su último día.":""):"";
}
$("u").onchange=$("i").oninput=$("d").onchange=hint;
$("ad").onclick=function(){var o=!$("f").classList.contains("open");$("f").classList.toggle("open",o);$("ad").setAttribute("aria-expanded",o);$("ad").textContent=o?"×":"+";if(o)$("n").focus()};
$("f").onsubmit=function(e){
 e.preventDefault();
 var t={id:"t"+Date.now(),name:$("n").value.trim(),start:$("d").value,unit:$("u").value,n:Math.max(1,+$("i").value||1),c:S.tasks.length%6};
 if(!t.name||!t.start)return;
 S.tasks.push(t);save();$("n").value="";
 view=parse(t.start);view.setDate(1);
 $("f").classList.remove("open");$("ad").setAttribute("aria-expanded","false");$("ad").textContent="+";
 render();
};
$("vl").onclick=function(){S.view="list";save();render()};
$("vc").onclick=function(){S.view="cal";save();render()};
$("pv").onclick=function(){view.setMonth(view.getMonth()-1);render()};
$("nx").onclick=function(){view.setMonth(view.getMonth()+1);render()};
$("td").onclick=function(){view=new Date();view.setDate(1);render()};
$("d").value=iso(new Date());hint();render();
})();
