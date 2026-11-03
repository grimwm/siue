"use strict";(()=>{var j=["up","down","left","right"],H={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},ce=["red","blue","yellow","green"],Lt=["flippers","fire-boots","skates","suction"],et={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},W=(e,t,o,n={},a,r=t)=>({char:e,minotaur:t,block:o,hazard:r,...n,sprites:a??[]}),D={floor:W(".",!0,!0,{},["floor"]),wall:W("#",!1,!1,{},["wall"]),exit:W("E",!1,!1,{},["exit"]),gate:W("|",!1,!1,{},["gate-closed","gate-open"]),water:W("~",!1,!0,{needs:"flippers"},["water"]),fire:W("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:W("=",!0,!0,{slides:"skates"},["ice"]),"force-up":W("^",!0,!0,{carries:"up"},["force-up"]),"force-down":W("v",!0,!0,{carries:"down"},["force-down"]),"force-left":W("<",!0,!0,{carries:"left"},["force-left"]),"force-right":W(">",!0,!0,{carries:"right"},["force-right"]),dirt:W("%",!0,!0,{},["dirt"]),safe:W("S",!1,!1,{},["safe"]),button:W("_",!0,!0,{},["button"]),"toggle-open":W("t",!0,!1,{},["toggle-open"]),"toggle-closed":W("T",!1,!1,{},["toggle-closed"]),"door-red":W("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":W("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":W("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":W("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:W("&",!0,!0,{},["trap"]),"button-brown":W("-",!0,!0,{},["button-brown"]),"button-red":W("+",!0,!0,{},["button-red"]),popup:W(";",!1,!1,{},["popup"]),gravel:W(":",!1,!1,{},["gravel"]),"fake-wall":W("W",!1,!1,{},["wall"]),"invisible-wall":W("I",!1,!1,{},["floor"]),teleport:W("@",!1,!1,{},["teleport"]),thief:W("$",!0,!0,{},["thief"]),bomb:W("!",!1,!0,{},["bomb"],!0),clone:W("C",!1,!1,{},j.map(e=>`clone-${e}`))},oe={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var ze={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:et.mirror.name},cake:{char:"x",sprite:"cake",name:et.cake.name},cow:{char:"c",sprite:"cow",name:et.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},qo=["theseus","minotaur","minotaur-stone","cow-standing"],Yo=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],Qr=[...new Set([...Object.values(D).flatMap(e=>e.sprites),...Yo,...Object.values(ze).map(e=>e.sprite),...qo,...Object.values(oe).map(e=>e.sprite)])];var Q=class extends Error{line;col;constructor(t,o,n){super(`line ${t}, column ${o}: ${n}`),this.line=t,this.col=o}},Zo=new Map(Object.entries(D).map(([e,t])=>[t.char,e])),Xo=new Map(Object.entries(ze).map(([e,t])=>[t.char,e])),Jo=/^[a-z0-9-]+$/,Vo=/^([a-z]+): (.*)$/,Qo=new Map(Object.entries(oe).map(([e,t])=>[t.char,e])),er=["block","ball","glider","fireball"],tr=["title","intro","hearts","relics","pages","facing","machines"];function or(e,t){let o=e&&e.value!==""?e.value.split(" "):[],n=e??{line:1,col:1},a=new Set;for(let r of o){if(!Jo.test(r))throw new Q(n.line,n.col,`page id '${r}' must be lower-case letters, digits and hyphens`);if(a.has(r))throw new Q(n.line,n.col,`page '${r}' named twice`);a.add(r)}if(o.length>31)throw new Q(n.line,n.col,"a level holds at most 31 pages");if(o.length!==t)throw new Q(n.line,n.col,`pages: ${o.length} named but the grid has ${t}`);return o}function Ot(e,t,o,n,a){let r=t&&t.value!==""?t.value.split(" "):[],s=t??{line:1,col:1};for(let i of r)if(!n(i))throw new Q(s.line,s.col,`${e}: '${i}' is not ${a}`);if(r.length!==o)throw new Q(s.line,s.col,`${e}: ${r.length} named but the grid has ${o}`);return r}function rr(e){let t={},o=e.indexOf("trap"),n=e.indexOf("clone"),a=-1,r=-1;for(let s=e.length-1;s>=0;s--){let i=e[s];if(i==="button-brown"){let l=a>=0?a:o;l>=0&&(t[s]=l)}else if(i==="button-red"){let l=r>=0?r:n;l>=0&&(t[s]=l)}else i==="trap"?a=s:i==="clone"&&(r=s)}return t}function J(e){let t=e.replace(/\r\n/g,`
`).split(`
`),o={},n=0;for(;n<t.length;n++){let g=Vo.exec(t[n]);if(!g)break;if(!tr.includes(g[1]))throw new Q(n+1,1,`unknown header '${g[1]}'`);o[g[1]]={value:g[2],line:n+1,col:g[1].length+3}}for(;n<t.length&&t[n]==="";)n++;let a=n,r=[];for(;n<t.length&&t[n]!=="";n++)r.push(t[n]);if(r.length===0)throw new Q(a+1,1,"no grid");for(;n<t.length;n++)if(t[n].trim()!=="")throw new Q(n+1,1,"text after the grid");let s=r[0].length,i=[],l=[],c=null,u=null,f=0,d=[],h=[],p=[];if(r.forEach((g,v)=>{let L=a+v+1;if(g.length!==s)throw new Q(L,1,`row is ${g.length} wide, expected ${s}`);[...g].forEach((A,y)=>{let b=y+1;if(A==="P"||A==="M"){if(A==="P"&&c)throw new Q(L,b,"second player");if(A==="M"&&u)throw new Q(L,b,"second Minotaur");A==="P"?c={r:v,c:y}:u={r:v,c:y},i.push("floor"),l.push(null);return}let P=Qo.get(A);if(P){h.push({kind:P,at:{r:v,c:y}}),i.push("floor"),l.push(null);return}let B=Zo.get(A),$=Xo.get(A);if(!B&&!$)throw new Q(L,b,`unknown tile '${A}'`);i.push(B??"floor"),l.push($??null),$==="relic"&&f++,B==="clone"&&p.push({r:v,c:y}),$==="page"&&d.push(v*s+y)})}),!c)throw new Q(a+1,1,"no player");let m=(g,v,L,A)=>{let y=o[g];if(!y)return v;let b=Number(y.value);if(!Number.isInteger(b)||b<L)throw new Q(y.line,y.col,`${g} must be ${L} to ${A}`);if(b>A){let P=g==="relics"?`relics: ${y.value} but the grid has ${A}`:`${g} must be ${L} to ${A}`;throw new Q(y.line,y.col,P)}return b},T=m("hearts",3,1,99),w=m("relics",f,0,f),E=or(o.pages,d.length),S=Ot("facing",o.facing,h.length,g=>j.includes(g),"a direction"),k=h.map((g,v)=>({...g,dir:S[v],home:v})),C=Ot("machines",o.machines,p.length,g=>{let[v,L]=g.split("-");return er.includes(v)&&j.includes(L)&&g.split("-").length===2},"a template and a direction like block-up"),R=k.length,G=p.map((g,v)=>{let[L,A]=C[v].split("-"),y={at:g,template:L,dir:A};return L==="block"?y:{...y,home:R++}});return{title:o.title?.value??"",intro:o.intro?.value??"",hearts:T,relics:w,pageIds:E,pageCells:d,rows:r.length,cols:s,terrain:i,objects:l,player:c,minotaur:u,hazards:k,machines:G,links:rr(i)}}function Me(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let t=e.objects.filter(r=>r==="relic").length,o=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&o.push(`hearts: ${e.hearts}`),e.relics!==t&&o.push(`relics: ${e.relics}`),e.pageIds.length>0&&o.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&o.push(`facing: ${e.hazards.map(r=>r.dir).join(" ")}`),e.machines.length>0&&o.push(`machines: ${e.machines.map(r=>`${r.template}-${r.dir}`).join(" ")}`);let n=new Map(e.hazards.map(r=>[r.at.r*e.cols+r.at.c,r.kind])),a=[];for(let r=0;r<e.rows;r++){let s="";for(let i=0;i<e.cols;i++){let l=r*e.cols+i;e.player.r===r&&e.player.c===i?s+="P":e.minotaur&&e.minotaur.r===r&&e.minotaur.c===i?s+="M":n.has(l)?s+=oe[n.get(l)].char:s+=e.objects[l]?ze[e.objects[l]].char:D[e.terrain[l]].char}a.push(s)}return`${o.join(`
`)}

${a.join(`
`)}
`}function Pt(e){let t=0;for(let o of e.objects)o==="cake"&&t++;return e.hearts+t}function se(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var re=(e,t)=>t.r>=0&&t.c>=0&&t.r<e.rows&&t.c<e.cols,O=(e,t)=>t.r*e.level.cols+t.c;var K=(e,t)=>!!t&&e.r===t.r&&e.c===t.c,V=(e,t)=>({r:e.r+H[t][0],c:e.c+H[t][1]}),tt=e=>e.relicsLeft===0;var Le=e=>({...e,terrain:[...e.terrain],objects:[...e.objects],keys:{...e.keys},tools:{...e.tools},gear:[...e.gear],hazards:e.hazards.length>0?[...e.hazards]:e.hazards}),Y=(e,t)=>re(e.level,t)?e.terrain[O(e,t)]:"wall",ie=(e,t)=>re(e.level,t)?e.objects[O(e,t)]:null;var ue=(e,t)=>e.hazards.length>0&&e.hazards.some(o=>K(t,o.at));function Oe(e,t){e.terrain=e.terrain.map(o=>o==="toggle-open"?"toggle-closed":o==="toggle-closed"?"toggle-open":o),t.push({kind:"flipped"})}var Ct=new WeakMap;function Dt(e){let t=Ct.get(e);return t||(t=e.terrain.flatMap((o,n)=>o==="teleport"?[n]:[]),Ct.set(e,t)),t}var It=e=>Dt(e).length>1;function ot(e,t,o,n){let{cols:a}=e.level,r=Dt(e.level),s=t.r*a+t.c,i=r.findIndex(l=>l>s);for(let l=0;l<r.length;l++){let c=r[((i<0?0:i)+l)%r.length];if(c===s)continue;let u={r:Math.floor(c/a),c:c%a},f=V(u,o);if(Y(e,f)!=="teleport"&&n(f))return{via:u,to:f}}return null}var Ft=new WeakMap;function nr(e){let t=Ft.get(e);if(!t){let o=new Map;for(let[n,a]of Object.entries(e.links)){if(e.terrain[a]!=="trap")continue;let r=o.get(a);r?r.push(Number(n)):o.set(a,[Number(n)])}t=o,Ft.set(e,t)}return t}function sr(e,t){let o=nr(e.level).get(t);if(!o)return!1;let{cols:n}=e.level;return o.some(a=>{let r={r:Math.floor(a/n),c:a%n};return K(r,e.player)||ie(e,r)==="block"||ue(e,r)})}var te=(e,t)=>Y(e,t)==="trap"&&!sr(e,t.r*e.level.cols+t.c);function Bt(e,t,o){if(!re(e.level,o))return!1;let n=Y(e,o);return D[n].hazard||oe[t].crosses===n}var Pe=(e,t,o)=>Bt(e,t,o)&&!ie(e,o)&&!K(o,e.minotaur)&&!K(o,e.cow)&&!ue(e,o),Ce=(e,t,o)=>K(o,e.player)?Bt(e,t,o):Pe(e,t,o);function rt(e,t,o,n,a=!1){let r=e.hazards[t],s=Y(e,r.at);return s==="bomb"?(e.terrain[O(e,r.at)]="floor",e.hazards.splice(t,1),o.push({kind:"exploded",who:"hazard",at:r.at}),"gone"):(s==="button"?Oe(e,o):s==="button-red"&&Fe(e,O(e,r.at),o,n,a),te(e,r.at)&&o.push({kind:"held",who:"hazard",at:r.at}),"on")}function Fe(e,t,o,n,a=!1){let r=e.level.links[t];if(r===void 0)return;let s=e.level.machines.find(u=>O(e,u.at)===r),i=V(s.at,s.dir);if(n&&K(i,n))return;if(s.template==="block"){if(!De(e,i))return;e.objects[O(e,i)]="block",o.push({kind:"cloned",what:"block",at:i}),nt(e,i,s.dir,n,o,a);return}if(!Pe(e,s.template,i)||K(i,e.player))return;let l={kind:s.template,at:i,dir:s.dir,home:s.home};e.hazards.length===0&&(e.hazards=[]);let c=e.hazards.length;if(!a){let u=O(e,i);for(;c>0&&O(e,e.hazards[c-1].at)>u;)c--}e.hazards.splice(c,0,l),o.push({kind:"cloned",what:s.template,at:i}),rt(e,c,o,n,a)}function ar(e,t){let o=e.hazards[t];if(o)return o.at;let n=e.machines.find(a=>a.home===t);return V(n.at,n.dir)}function st(e,t,o){Y(e,t)==="popup"&&(e.terrain[O(e,t)]="wall",o.push({kind:"rose",at:t}))}var ir=(e,t,o)=>Pe(e,t,o)&&Y(e,o)!=="bomb"&&!K(o,e.player);function lr(e,t,o){let n=ar(e.level,o),a=new Set([O(e,n)]),r=[n];for(;r.length>0;){let s=r.filter(l=>ir(e,t,l)).sort((l,c)=>O(e,l)-O(e,c));if(s.length>0)return s[0];let i=[];for(let l of r)for(let c of j){let u=V(l,c);!re(e.level,u)||a.has(O(e,u))||(a.add(O(e,u)),i.push(u))}r=i}return null}function $t(e,t,o){let n=e.hazards.findIndex(s=>K(t,s.at));if(n<0)return;let a=e.hazards[n];e.hazards.splice(n,1);let r=lr(e,a.kind,a.home);r&&(e.hazards.push({...a,at:r}),e.hazards.sort((s,i)=>O(e,s.at)-O(e,i.at))),o.push({kind:"sent-home",from:t,to:r})}function me(e,t,o,n){if(e.hearts--,t.push(n?{kind:"caught",at:e.player,hearts:e.hearts,by:o,hazard:n}:{kind:"caught",at:e.player,hearts:e.hearts,by:o}),e.hearts<=0){e.outcome="lost",t.push({kind:"lost"});return}st(e,e.player,t),e.player=e.throwBack;let a=null;K(e.player,e.minotaur)&&(a=e.level.minotaur,e.minotaur=a,K(a,e.cow)&&(e.cow=null)),$t(e,e.player,t),a&&$t(e,a,t)}function Ie(e,t){if(e.outcome!=="playing")return!0;for(let o=0;o<t.length;o++)if(t[o].kind==="caught")return!0;return!1}function Wt(e,t){return re(e.level,t)&&D[Y(e,t)].minotaur&&ie(e,t)!=="block"&&!ue(e,t)}function jt(e,t,o){return e.minotaur=t,te(e,t)&&o.push({kind:"held",who:"minotaur",at:t}),K(t,e.cow)&&(e.cow=null),K(t,e.player)?(me(e,o,"minotaur"),!0):!1}function cr(e,t){let o=e.minotaur;if(!o)return!0;if(te(e,o))return!1;let n=e.cow??e.player,a=Math.sign(n.c-o.c),r=Math.sign(n.r-o.r),s=[];a&&s.push(a>0?"right":"left"),r&&s.push(r>0?"down":"up");let i=s.find(f=>Wt(e,V(o,f)));if(!i)return!1;let l=V(o,i);if(t.push({kind:"moved",who:"minotaur",from:o,to:l}),jt(e,l,t))return!0;let c=i,u=new Set([O(e,l)]);for(;;){let f=D[Y(e,e.minotaur)];if(f.carries)c=f.carries;else if(!f.slides)return!1;let d=V(e.minotaur,c);if(!Wt(e,d)||u.has(O(e,d)))return!1;if(t.push({kind:"slid",who:"minotaur",from:e.minotaur,to:d}),u.add(O(e,d)),jt(e,d,t))return!0}}function Ht(e,t){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let o=0;o<2&&e.outcome==="playing";o++)if(cr(e,t))return}}var hr={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function ur(e,t,o){return K(e.hazards[t].at,e.player)?(K(e.player,e.cow)&&(e.cow=null),me(e,o,"hazard",e.hazards[t].kind),"caught"):rt(e,t,o,void 0,!0)}function fr(e,t,o){let n=e.hazards[t];if(te(e,n.at))return"on";let a=n.dir;if(!Ce(e,n.kind,V(n.at,a))){a=void 0;for(let i of oe[n.kind].turns){let l=hr[i][n.dir];if(Ce(e,n.kind,V(n.at,l))){a=l;break}}}if(!a)return"on";let r=V(n.at,a);o.push({kind:"moved",who:"hazard",hazard:n.kind,from:n.at,to:r});let s=null;for(;;){n=e.hazards[t]={...n,at:r,dir:a};let i=ur(e,t,o);if(i!=="on")return i;let l=D[Y(e,r)];if(l.carries)a=l.carries,n.dir!==a&&(n=e.hazards[t]={...n,dir:a});else if(!l.slides)return"on";s??=new Set([O(e,r)]);let c=V(r,a);if(s.has(O(e,c))||!Ce(e,n.kind,c))return"on";o.push({kind:"slid",who:"hazard",hazard:n.kind,from:r,to:c}),s.add(O(e,c)),r=c}}function Gt(e,t){if(e.hazards.length!==0){for(let o=0,n=e.hazards.length;o<n;){let a=fr(e,o,t);if(a==="caught")break;a==="gone"?n--:o++}e.hazards.sort((o,n)=>O(e,o.at)-O(e,n.at))}}function De(e,t){return re(e.level,t)&&D[Y(e,t)].block&&!ie(e,t)&&!K(t,e.player)&&!K(t,e.minotaur)&&!K(t,e.cow)&&!K(t,e.throwBack)&&!K(t,e.level.minotaur)&&!ue(e,t)}function it(e,t,o,n){let a=V(t,o);if(Y(e,a)!=="teleport")return De(e,a)&&n(a)?{entry:a,to:a}:null;if(K(a,e.player))return null;let r=ot(e,a,o,s=>De(e,s)&&n(s));return r&&{entry:a,via:r.via,to:r.to}}function Kt(e,t,o,n,a){e.objects[O(e,t)]=null,e.objects[O(e,o.to)]="block",a.push(n==="pushed"?{kind:"pushed",from:t,to:o.entry}:{kind:"slid",who:"block",from:t,to:o.entry}),o.via&&a.push({kind:"teleported",who:"block",from:o.entry,via:o.via,to:o.to})}function nt(e,t,o,n,a,r=!1){let s=t,i=o,l=new Set([O(e,s)]);for(n&&l.add(O(e,n));;){let c=Y(e,s);if(c==="water"||c==="bomb"){e.objects[O(e,s)]=null,e.terrain[O(e,s)]=c==="water"?"dirt":"floor",a.push(c==="water"?{kind:"sank",at:s}:{kind:"exploded",who:"block",at:s});return}c==="button"?Oe(e,a):c==="button-red"&&Fe(e,O(e,s),a,n,r),te(e,s)&&a.push({kind:"held",who:"block",at:s});let u=D[c];if(u.carries)i=u.carries;else if(!u.slides)return;let f=it(e,s,i,d=>!l.has(O(e,d)));if(!f)return;Kt(e,s,f,"slid",a),l.add(O(e,f.to)),s=f.to}}var dr=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Nt(e,t,o,n){if(!re(e.level,t)||K(t,e.minotaur))return!1;let a=Y(e,t),r=D[a];return dr.has(a)||a==="teleport"&&!It(e.level)||a==="gate"&&!tt(e)||r.needs&&!e.gear.includes(r.needs)||r.door&&e.keys[r.door]<=0?!1:ue(e,t)||ie(e,t)!=="block"?!0:!n&&!te(e,t)&&!!it(e,t,o,()=>!0)}function lt(e,t,o,n,a){if(!Nt(e,t,o,n))return!1;if(ue(e,t))return me(e,a,"hazard",e.hazards.find(s=>K(s.at,t)).kind),!1;let r=D[Y(e,t)];if(r.door&&(r.door!=="green"&&e.keys[r.door]--,e.terrain[O(e,t)]="floor",a.push({kind:"opened",color:r.door,at:t})),ie(e,t)==="block"){let s=it(e,t,o,()=>!0);Kt(e,t,s,"pushed",a),nt(e,s.to,o,t,a)}return!0}function ct(e,t,o,n,a){st(e,e.player,a),e.player=t;let r=Y(e,t);if(r==="bomb")return e.terrain[O(e,t)]="floor",a.push({kind:"exploded",who:"player",at:t}),me(e,a,"bomb"),!0;let s=ie(e,t);if(s&&s!=="block"&&(e.objects[O(e,t)]=null,a.push({kind:"took",what:s,at:t}),s==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):s==="page"?e.pages|=1<<e.level.pageCells.indexOf(O(e,t)):s.startsWith("key-")?e.keys[s.slice(4)]++:s==="mirror"||s==="cake"||s==="cow"?e.tools[s]++:e.gear.includes(s)||e.gear.push(s)),r==="thief"&&e.gear.length>0&&(a.push({kind:"robbed",at:t,gear:e.gear}),e.gear=[]),r==="safe"&&(e.throwBack=t),te(e,t)&&a.push({kind:"held",who:"player",at:t}),r==="button"?Oe(e,a):r==="button-red"&&Fe(e,O(e,t),a),r==="exit"&&tt(e)&&(e.outcome="won",a.push({kind:"won"})),r==="teleport"){let i=ot(e,t,o,l=>Nt(e,l,o,n));return i?lt(e,i.to,o,n,a)?(a.push({kind:"teleported",who:"player",from:t,via:i.via,to:i.to}),ct(e,i.to,o,n,a)):!0:!1}return!1}function pr(e,t,o){let n=t,a=new Set([O(e,e.player)]);for(;e.outcome==="playing";){let r=D[Y(e,e.player)];if(r.carries&&!e.gear.includes("suction"))n=r.carries;else if(!r.slides||e.gear.includes(r.slides))return;let s=V(e.player,n);if(a.has(O(e,s))||!lt(e,s,n,!0,o)||(o.push({kind:"slid",who:"player",from:e.player,to:s}),a.add(O(e,s)),ct(e,s,n,!0,o)))return;a.add(O(e,e.player))}}function at(e,t){if(e.length!==t.length)return!1;for(let o=0;o<e.length;o++)if(e[o]!==t[o])return!1;return!0}function mr(e,t,o){if(t.kind==="move"){let n=e.player;if(te(e,n))return!1;let a=V(n,t.dir),r=Y(e,a);if(r==="invisible-wall")return e.terrain[O(e,a)]="wall",o.push({kind:"revealed",at:a,what:r}),"shown";if(r==="fake-wall"&&(e.terrain[O(e,a)]="floor",o.push({kind:"revealed",at:a,what:r})),lt(e,a,t.dir,!1,o))o.push({kind:"moved",who:"player",from:n,to:a}),ct(e,a,t.dir,!1,o)||pr(e,t.dir,o);else if(!Ie(e,o))return!1}else if(t.kind==="tool"){if(e.tools[t.tool]<=0)return!1;if(t.tool==="cake")e.hearts++;else if(t.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,o.push({kind:"stoned",turns:3});e.tools[t.tool]--}return!0}function _t(e,t){return at(e.terrain,t.terrain)&&(e.terrain=t.terrain),at(e.objects,t.objects)&&(e.objects=t.objects),at(e.hazards,t.hazards)&&(e.hazards=t.hazards),e}function Be(e,t){return t===e||t.moves===e.moves}function ae(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let o=Le(e),n=[],a=mr(o,t,n);if(!a)return{state:e,events:[]};if(a==="shown")return{state:_t(o,e),events:n};let r=t.kind==="tool"&&t.tool==="mirror";return Ie(o,n)||Gt(o,n),!r&&!Ie(o,n)&&Ht(o,n),o.moves++,{state:_t(o,e),events:n}}var $e=["mirror","cake","cow"],fe=e=>e<=0?0:32-Math.clz32(e),Ut=new WeakMap;function le(e){let t=Ut.get(e);return t||Ut.set(e,t=wr(e)),t}function br(e){let t=new Set,o=[],n=l=>{let c=e.terrain[l];return D[c].block||D[c].door!==void 0||c==="fake-wall"},a=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,r=(l,c)=>l>=0&&c>=0&&l<e.rows&&c<e.cols,s=l=>{t.has(l)||l===a||!n(l)||(t.add(l),o.push(l))};e.objects.forEach((l,c)=>{l==="block"&&(t.add(c),o.push(c))});for(let l of e.machines){let c=l.at.r+H[l.dir][0],u=l.at.c+H[l.dir][1];l.template==="block"&&r(c,u)&&s(c*e.cols+u)}let i=[];for(e.terrain.forEach((l,c)=>{l==="teleport"&&i.push(c)});o.length;){let l=o.pop(),c=Math.floor(l/e.cols),u=l%e.cols,f=D[e.terrain[l]],d=f.slides!==void 0||f.carries!==void 0;for(let h of j){let[p,m]=H[h],T=c+p,w=u+m;if(!r(T,w))continue;let E=c-p,S=u-m;if(!(r(E,S)&&e.terrain[E*e.cols+S]!=="wall")&&!d)continue;let C=T*e.cols+w;if(e.terrain[C]!=="teleport"){s(C);continue}for(let R of i){let G=Math.floor(R/e.cols)+p,g=R%e.cols+m;r(G,g)&&s(G*e.cols+g)}}}return t}var yr={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},ht=e=>yr[e]??(D[e].door!==void 0?"floor":void 0);function gr(e,t){let o=new Set(t.map(a=>oe[a].crosses)),n=[];return e.terrain.forEach((a,r)=>{let s=ht(a);(D[a].hazard||o.has(a)||a==="toggle-closed"||s&&D[s].hazard)&&n.push(r)}),n}function wr(e){let t=y=>e.objects.filter(b=>b===y).length,o=br(e),n=[],a=[],r=[],s=[],i=[];e.terrain.forEach((y,b)=>{ht(y)?n.push(b):(y==="toggle-open"||y==="toggle-closed")&&a.push(b);let P=e.objects[b];o.has(b)?(P&&P!=="block"?i:s).push(b):P&&r.push(b)});let l=e.rows*e.cols,c=ce.map(y=>fe(t(`key-${y}`))),u=$e.map(y=>fe(t(y))),f=Lt.filter(y=>t(y)>0),d=fe(l),h=t("cow")>0,p=e.minotaur!==null,m=t("mirror")>0?2:0,T=d*(2+(p?1:0)+(h?1:0))+m,w=fe(Pt(e)),E=T+w+fe(e.relics),S=[],k=E+e.pageIds.length;for(let y of c)S.push(k),k+=y;let C=[];for(let y of u)C.push(k),k+=y;let R=[...e.hazards.map(y=>y.kind)];for(let y of e.machines)y.home!==void 0&&(R[y.home]=y.template);let G=R.length>e.hazards.length,g=G?0:e.hazards.length,v=G?gr(e,R):[],L=G?fe(4*R.length):0,A=d*(2+(p?1:0)+(h?1:0))+m+w+fe(e.relics)+e.pageIds.length+c.reduce((y,b)=>y+b,0)+u.reduce((y,b)=>y+b,0)+f.length+n.length+(a.length?1:0)+r.length+s.length+2*i.length+g*(d+2)+v.length*L;return{words:Math.max(1,Math.ceil(A/32)),cellBits:d,none:l,minotaur:p,cow:h,stoneBits:m,heartBits:w,relicBits:fe(e.relics),pageBits:e.pageIds.length,keyBits:c,toolBits:u,gear:f,heartAt:T,pageAt:E,keyAt:S,toolAt:C,gearAt:k,changing:Int32Array.from(n),toggles:Int32Array.from(a),fixed:Int32Array.from(r),blockOnly:Int32Array.from(s),blockOrObject:Int32Array.from(i),hazardSlots:g,hazardCells:Int32Array.from(v),hazardBits:L,homeKinds:R}}function Z(e,t,o,n,a){if(n===0)return o;let r=t+(o>>>5),s=o&31;return e[r]|=a<<s,s+n>32&&(e[r+1]|=a>>>32-s),o+n}function Ae(e,t,o,n){if(n===0)return 0;let a=t+(o>>>5),r=o&31,s=e[a]>>>r;return r+n>32&&(s|=e[a+1]<<32-r),n===32?s>>>0:s&(1<<n)-1}var de=(e,t,o)=>t?t.r*e.level.cols+t.c:o;function we(e,t,o,n){let a=t;for(let i=0;i<a.words;i++)o[n+i]=0;let r=0;r=Z(o,n,r,a.cellBits,de(e,e.player,a.none)),r=Z(o,n,r,a.cellBits,de(e,e.throwBack,a.none)),a.minotaur&&(r=Z(o,n,r,a.cellBits,de(e,e.minotaur,a.none))),a.cow&&(r=Z(o,n,r,a.cellBits,de(e,e.cow,a.none))),r=Z(o,n,r,a.stoneBits,e.stone),r=Z(o,n,r,a.heartBits,e.hearts),r=Z(o,n,r,a.relicBits,e.relicsLeft),r=Z(o,n,r,a.pageBits,e.pages);for(let i=0;i<ce.length;i++)r=Z(o,n,r,a.keyBits[i],e.keys[ce[i]]);for(let i=0;i<$e.length;i++)r=Z(o,n,r,a.toolBits[i],e.tools[$e[i]]);for(let i of a.gear)r=Z(o,n,r,1,e.gear.includes(i)?1:0);for(let i of a.changing)r=Z(o,n,r,1,e.terrain[i]===e.level.terrain[i]?0:1);a.toggles.length&&(r=Z(o,n,r,1,e.terrain[a.toggles[0]]===e.level.terrain[a.toggles[0]]?0:1));for(let i of a.fixed)r=Z(o,n,r,1,e.objects[i]?1:0);for(let i of a.blockOnly)r=Z(o,n,r,1,e.objects[i]==="block"?1:0);for(let i of a.blockOrObject)r=Z(o,n,r,2,e.objects[i]==="block"?2:e.objects[i]?1:0);if(a.hazardSlots>1&&e.hazards.some((i,l)=>l>0&&de(e,i.at,a.none)<de(e,e.hazards[l-1].at,a.none)))throw new Error("the hazards must be sorted by cell");for(let i=0;i<a.hazardSlots;i++){let l=e.hazards.find(c=>c.home===i);r=Z(o,n,r,a.cellBits,l?de(e,l.at,a.none):a.none),r=Z(o,n,r,2,l?j.indexOf(l.dir):0)}let s=0;for(let i of a.hazardCells){let l=e.hazards[s],c=l!==void 0&&de(e,l.at,a.none)===i;r=Z(o,n,r,a.hazardBits,c?1+j.indexOf(l.dir)+4*l.home:0),c&&s++}if(a.hazardCells.length&&s!==e.hazards.length)throw new Error(`packed ${s} of ${e.hazards.length} hazards: they must be sorted by cell`)}function We(e,t,o,n,a=0){let r=o,s=0,i=g=>{let v=Ae(e,t,s,g);return s+=g,v},l=g=>{let v=i(g);return v===r.none?null:{r:Math.floor(v/n.cols),c:v%n.cols}},c=l(r.cellBits),u=l(r.cellBits),f=r.minotaur?l(r.cellBits):null,d=r.cow?l(r.cellBits):null,h=i(r.stoneBits),p=i(r.heartBits),m=i(r.relicBits),T=i(r.pageBits),w={red:0,blue:0,yellow:0,green:0};ce.forEach((g,v)=>{w[g]=i(r.keyBits[v])});let E={mirror:0,cake:0,cow:0};$e.forEach((g,v)=>{E[g]=i(r.toolBits[v])});let S=[];for(let g of r.gear)i(1)&&S.push(g);let k=[...n.terrain];for(let g of r.changing)i(1)&&(k[g]=ht(n.terrain[g]));if(r.toggles.length&&i(1))for(let g of r.toggles)k[g]=n.terrain[g]==="toggle-open"?"toggle-closed":"toggle-open";let C=[...n.objects];for(let g of r.fixed)i(1)||(C[g]=null);for(let g of r.blockOnly)C[g]=i(1)?"block":null;for(let g of r.blockOrObject){let v=i(2);v===0?C[g]=null:v===2&&(C[g]="block")}let R=[],G=g=>({r:Math.floor(g/n.cols),c:g%n.cols});for(let g=0;g<r.hazardSlots;g++){let v=i(r.cellBits),L=j[i(2)];v!==r.none&&R.push({kind:r.homeKinds[g],at:G(v),dir:L,home:g})}R.sort((g,v)=>g.at.r*n.cols+g.at.c-(v.at.r*n.cols+v.at.c));for(let g of r.hazardCells){let v=i(r.hazardBits);if(!v)continue;let L=v-1>>>2;R.push({kind:r.homeKinds[L],at:G(g),dir:j[v-1&3],home:L})}return{level:n,terrain:k,objects:C,player:c,hearts:p,keys:w,gear:S,tools:E,pages:T,throwBack:u,minotaur:f,stone:h,cow:d,hazards:R,relicsLeft:m,moves:a,outcome:"playing"}}var Zt=new Set(["wall","invisible-wall","clone"]);function kr(e,t,o,n){let a=(c,u)=>c>=0&&u>=0&&c<e.rows&&u<e.cols&&!Zt.has(e.terrain[c*e.cols+u]),r=new Set,s=new Set,i=[],l=(c,u,f)=>{if(!a(c,u))return;let d=(c*e.cols+u)*4+j.indexOf(f);s.has(d)||(s.add(d),r.add(c*e.cols+u),i.push([c,u,f]))};for(l(Math.floor(t/e.cols)+H[o][0],t%e.cols+H[o][1],o);i.length;){let[c,u,f]=i.pop(),d=e.terrain[c*e.cols+u];if(d==="teleport"){for(let m of n){if(m===c*e.cols+u)continue;let T=Math.floor(m/e.cols)+H[f][0],w=m%e.cols+H[f][1];a(T,w)&&e.terrain[T*e.cols+w]!=="teleport"&&l(T,w,f)}continue}let h=D[d],p=h.carries??(h.slides?f:null);p&&l(c+H[p][0],u+H[p][1],p)}return[...r]}function xr(e){let t=e.rows*e.cols,o=e.terrain.map(s=>!Zt.has(s)),n=e.terrain.flatMap((s,i)=>s==="teleport"?[i]:[]),a=Array.from({length:t},()=>[]);for(let s=0;s<t;s++)if(o[s])for(let i of j)for(let l of kr(e,s,i,n.length>1?n:[]))a[l].push(s);let r=new Uint8Array(t);return e.terrain.forEach((s,i)=>{s==="safe"&&(r[i]=1)}),r[e.player.r*e.cols+e.player.c]=1,{n:t,open:o,into:a,thrown:r}}function qt(e,t){let o=new Float64Array(e.n).fill(1/0),n=new Int32Array(e.n),a=0;for(let s of t)o[s]===1/0&&(o[s]=0,n[a++]=s);let r=!1;for(let s=0;s<a;s++){let i=n[s],l=o[i]+1;for(let c of e.into[i])o[c]===1/0&&(o[c]=l,n[a++]=c);if(!r&&e.thrown[i]){r=!0;for(let c=0;c<e.n;c++)e.open[c]&&o[c]===1/0&&(o[c]=l,n[a++]=c)}}return o}function Tr(e){let t=xr(e),o=e.terrain.flatMap((s,i)=>s==="exit"?[i]:[]),n=qt(t,o),a=e.objects.flatMap((s,i)=>s==="relic"?[i]:[]),r=a.map(s=>qt(t,[s]));return s=>{if(s.outcome==="won")return 0;if(s.outcome==="lost")return 1/0;let i=s.player.r*e.cols+s.player.c,l=n[i];if(s.relicsLeft===0)return l;let c=0,u=1/0,f=0;for(let d=0;d<a.length;d++){if(s.objects[a[d]]!=="relic")continue;let h=r[d][i];c++,h<u&&(u=h),h>f&&(f=h)}return c<s.relicsLeft?1/0:Math.max(l,c===s.relicsLeft?f:u)}}var Yt=new WeakMap;function je(e){let t=Yt.get(e);return t||Yt.set(e,t=Tr(e)),t}var ke=class extends Error{},Xt=1024;function He(e,t,o){let n=2538058380;for(let a=0;a<o;a++){let r=Math.imul(e[t+a],3432918353);r=Math.imul(r<<15|r>>>17,461845907),n^=r,n=Math.imul(n<<13|n>>>19,5)+3864292196}return n^=o,n=Math.imul(n^n>>>16,2246822507),n=Math.imul(n^n>>>13,3266489909),(n^n>>>16)>>>0}function Ge(e){let t=e,o=Xt,n=new Uint32Array(o*t),a=new Uint32Array(o),r=new Int32Array(o),s=new Uint8Array(o),i=new Uint32Array(o),l=0,c=new Int32Array(Xt*2),u=c.length-1;function f(){o*=2;let h=new Uint32Array(o*t);h.set(n),n=h;let p=new Uint32Array(o);p.set(a),a=p;let m=new Int32Array(o);m.set(r),r=m;let T=new Uint8Array(o);T.set(s),s=T;let w=new Uint32Array(o);w.set(i),i=w,c=new Int32Array(o*2),u=c.length-1;for(let E=0;E<l;E++){let S=a[E]&u;for(;c[S]!==0;)S=S+1&u;c[S]=E+1}}function d(h,p,m){let T=h*t;for(let w=0;w<t;w++)if(n[T+w]!==p[m+w])return!1;return!0}return{get size(){return l},add(h,p,m,T,w){let E=He(h,p,t),S=E&u;for(let C=c[S];C!==0;S=S+1&u,C=c[S]){let R=C-1;if(!(a[R]!==E||!d(R,h,p)))return w>=i[R]?-1:(r[R]=m,s[R]=T,i[R]=w,R)}if(l===o)for(f(),S=E&u;c[S]!==0;)S=S+1&u;let k=l++;return n.set(h.subarray(p,p+t),k*t),a[k]=E,r[k]=m,s[k]=T,i[k]=w,c[S]=k+1,k},words(h,p,m){p.set(n.subarray(h*t,h*t+t),m)},parent:h=>r[h],action:h=>s[h],g:h=>i[h]}}var ve=["mirror","cake","cow"],be=j.length,_e=[...j.map(e=>({kind:"move",dir:e})),{kind:"wait"},...ve.map(e=>({kind:"tool",tool:e}))],ut=[be,...j.map((e,t)=>t),...ve.map((e,t)=>be+1+t)];function Jt(e,t){let o=[];for(let n=t;e.parent(n)>=0;n=e.parent(n))o.push(_e[e.action(n)]);return o.reverse()}function ft(e,t){return pt(dt(e,t),t.onProgress)}function*dt(e,t){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let o=t.store??Ge(le(e.level).words),n=r=>{if(r instanceof ke)return{solved:!1,explored:o.size,capped:!0,reason:r.message};throw r},a;try{a=Er(e,t,o)}catch(r){return n(r)}for(;;){let r;try{r=a()}catch(s){return n(s)}if("explored"in r)return r;yield r}}function pt(e,t){for(;;){let o=e.next();if(o.done)return o.value;t?.(o.value)}}function Er(e,t,o){let{cap:n,refuse:a}=t,r=t.prune??null,s=Math.max(1,t.progressEvery??65536),i=e.level,l=le(i),c=je(i),u=new Uint32Array(l.words),f=1024,d=new Int32Array(f),h=new Int32Array(f),p=new Int32Array(f),m=new Uint8Array(f),T=new Uint16Array(f),w=new Int32Array(f),E=0,S=A=>{if(A<f)return;for(;f<=A;)f*=2;let y=new Int32Array(f);y.set(d),d=y;let b=new Int32Array(f);b.set(h),h=b;let P=new Int32Array(f);P.set(p),p=P;let B=new Uint8Array(f);B.set(m),m=B;let $=new Uint16Array(f);$.set(T),T=$},k=(A,y)=>d[A]<d[y]||d[A]===d[y]&&(h[A]<h[y]||h[A]===h[y]&&(T[A]>T[y]||T[A]===T[y]&&A<y)),C=A=>{let y=w[A];for(;A>0;){let b=A-1>>1,P=w[b];if(!k(y,P))break;w[A]=P,p[P]=A,A=b}w[A]=y,p[y]=A},R=A=>{if(E===w.length){let y=new Int32Array(w.length*2);y.set(w),w=y}w[E]=A,C(E++)},G=()=>{let A=w[0];p[A]=-1;let y=w[--E];if(E>0){let b=0;for(;;){let P=2*b+1;if(P>=E)break;let B=P+1,$=B<E&&k(w[B],w[P])?B:P;if(!k(w[$],y))break;w[b]=w[$],p[w[b]]=b,b=$}w[b]=y,p[y]=b}return A},g=c(e);if(we(e,l,u,0),r&&r({...e,moves:0},u,0))return()=>({solved:!1,explored:0,capped:!1});let v=o.add(u,0,-1,0,0);if(o.size>=n)return()=>({solved:!1,explored:o.size,capped:!0});S(v),h[v]=Number.isFinite(g)?g:-1,d[v]=h[v],p[v]=-1,T[v]=e.hearts,h[v]>=0&&R(v);let L=0;return()=>{let A=null;for(;E>0;){if(A)return A;let y=G();if(m[y])return{solved:!0,line:Jt(o,y),explored:o.size};let b=d[y],P=b-h[y];++L%s===0&&(A={expanded:L,stored:o.size,bestF:b,startH:g}),o.words(y,u,0);let B=We(u,0,l,i,P);for(let $ of ut){if($>be&&B.tools[ve[$-be-1]]<=0)continue;let ee=ae(B,_e[$]),F=ee.state;if(Be(B,F)||F.outcome==="lost"||a&&a(ee.events,B)||(we(F,l,u,0),r&&r(F,u,0)))continue;let x=o.size,M=o.add(u,0,y,$,P+1);if(M<0)continue;let z=F.outcome==="won";if(o.size>x){S(M);let I=z?0:c(F);h[M]=Number.isFinite(I)?I:-1,p[M]=-1,m[M]=z?1:0,T[M]=F.hearts}if(z&&P+1===b)return{solved:!0,line:Jt(o,M),explored:o.size};if(o.size>=n)return{solved:!1,explored:o.size,capped:!0};h[M]<0||(d[M]=P+1+h[M],p[M]>=0?C(p[M]):R(M))}}return{solved:!1,explored:o.size,capped:!1}}}function Mr(e,t){for(let o=0;o<e.terrain.length;o++){if(!t(e.terrain[o]))continue;let n=Math.floor(o/e.cols),a=o%e.cols;for(let r of j){let s=n-H[r][0],i=a-H[r][1];if(s<0||i<0||s>=e.rows||i>=e.cols)continue;let l=D[e.terrain[s*e.cols+i]];if(l.slides||l.carries===r)return!0}}return!1}function Ar(e,t){let o=e.terrain.flatMap((n,a)=>n==="teleport"?[a]:[]);return o.length<2?!1:o.some(n=>j.some(a=>{let r=Math.floor(n/e.cols)+H[a][0],s=n%e.cols+H[a][1];return r>=0&&s>=0&&r<e.rows&&s<e.cols&&t(e.terrain[r*e.cols+s])}))}var Vt=(e,t)=>Mr(e,t)||Ar(e,t);function vr(e,t){let o=[];t.heartBits&&o.push({pos:t.heartAt,width:t.heartBits,set:!1}),t.pageBits&&o.push({pos:t.pageAt,width:t.pageBits,set:!0}),ce.forEach((a,r)=>{t.keyBits[r]&&!Vt(e,s=>D[s].door===a)&&o.push({pos:t.keyAt[r],width:t.keyBits[r],set:!1})}),t.toolBits.forEach((a,r)=>{a&&o.push({pos:t.toolAt[r],width:a,set:!1})});let n=["flippers","fire-boots"];return t.gear.forEach((a,r)=>{n.includes(a)&&!Vt(e,s=>D[s].needs===a)&&o.push({pos:t.gearAt+r,width:1,set:!1})}),o}var mt=1024;function Ke(e,t){let o=je(e),n=vr(e,t);if(!n.length)return L=>o(L)===1/0;let a=t.words,r=new Uint32Array(a);for(let L of n)for(let A=L.pos;A<L.pos+L.width;A++)r[A>>>5]|=1<<(A&31);let s=[],i=0;for(let L of n)s.push(i),i+=L.width;let l=i+31>>>5,c=mt,u=new Uint32Array(c*a),f=new Int32Array(c),d=0,h=new Int32Array(mt*2),p=h.length-1,m=mt,T=new Uint32Array(m*l),w=new Uint32Array(m),E=new Int32Array(m),S=0,k=-1,C=new Uint32Array(a),R=new Uint32Array(l);function G(){c*=2;let L=new Uint32Array(c*a);L.set(u),u=L;let A=new Int32Array(c);A.set(f),f=A,h=new Int32Array(c*2),p=h.length-1;for(let y=0;y<d;y++){let b=He(u,y*a,a)&p;for(;h[b]!==0;)b=b+1&p;h[b]=y+1}}function g(L,A){let y=k;if(y>=0)k=E[y];else{if(S===m){m*=2;let b=new Uint32Array(m*l);b.set(T),T=b;let P=new Uint32Array(m);P.set(w),w=P;let B=new Int32Array(m);B.set(E),E=B}y=S++}return T.set(R,y*l),w[y]=L,E[y]=A,y}function v(L,A,y,b){for(let P=0;P<n.length;P++){let B=n[P],$=Ae(L,A,s[P],B.width),ee=Ae(y,b,s[P],B.width);if(B.set?($&ee)!==ee:$<ee)return!1}return!0}return(L,A,y)=>{if(o(L)===1/0)return!0;let b=L.moves;for(let F=0;F<a;F++)C[F]=A[y+F]&~r[F];let P=He(C,0,a);R.fill(0);for(let F=0;F<n.length;F++)Z(R,0,s[F],n[F].width,Ae(A,y,n[F].pos,n[F].width));let B=P&p,$=-1;for(let F=h[B];F!==0;B=B+1&p,F=h[B]){let x=F-1,M=!0;for(let z=0;z<a&&M;z++)M=u[x*a+z]===C[z];if(M){$=x;break}}if($<0){if(d===c)for(G(),B=P&p;h[B]!==0;)B=B+1&p;return $=d++,u.set(C,$*a),h[B]=$+1,f[$]=g(b,-1),!1}for(let F=f[$];F>=0;F=E[F])if(w[F]<=b&&v(T,F*l,R,0))return!0;let ee=-1;for(let F=f[$];F>=0;){let x=E[F];b<=w[F]&&v(R,0,T,F*l)?(ee<0?f[$]=x:E[ee]=x,E[F]=k,k=F):ee=F,F=x}return f[$]=g(b,f[$]),!1}}var pe=2e6,xe=e=>e.some(t=>t.kind==="caught");function Se(e,t=pe){return ft(e,{cap:t,refuse:null,prune:Ke(e.level,le(e.level))})}function Qt(e,t,o=pe){return ft(e,{cap:o,refuse:t,prune:Ke(e.level,le(e.level))})}function Ne(e,t,o=pe,n={}){return dt(e,{cap:o,refuse:t,prune:Ke(e.level,le(e.level)),store:n.store,progressEvery:n.every})}var eo={up:"u",down:"d",left:"l",right:"r"},bt={mirror:"z",cake:"x",cow:"c"};function Ue(e){return e.map(t=>t.kind==="move"?eo[t.dir]:t.kind==="wait"?"w":bt[t.tool]).join("")}function to(e){let t=[];for(let o of e){let n=j.find(r=>eo[r]===o),a=Object.keys(bt).find(r=>bt[r]===o);if(n)t.push({kind:"move",dir:n});else if(o==="w")t.push({kind:"wait"});else if(a)t.push({kind:"tool",tool:a});else return null}return t}var yt=e=>e.solved?e.line.length:e.capped?"unknown":"none";function ro(e,t=pe){return pt(Sr(e,t))}function*Sr(e,t=pe,o={}){let n=se(e),a=E=>({store:o.store?.(le(E).words),every:o.every}),r=yield*Ne(n,null,t,a(e)),s=yt(r),i=0;if(r.solved){let E=n;for(let S of r.line){let k=ae(E,S);E=k.state,xe(k.events,E)&&i++}}let l=yt(yield*Ne(n,xe,t,a(e))),c=yield*zr(e,t,a(e)),u=c===null?"unknown":c?"chase":"solo",f=Fr(e),d=r.solved?Ue(r.line):"";if(!e.minotaur)return{solved:r.solved,shortest:s,explored:r.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:l,catches:i,label:u,naiveWins:f,line:d};let h={...e,minotaur:null},p=yield*Ne(se(h),null,t,a(h)),m=yt(p),T=p.solved?!1:p.capped?null:!1;if(p.solved){let E=n;for(let S of p.line)E=ae(E,S).state;T=E.outcome==="won"}let w=typeof s=="number"&&typeof m=="number"?s-m:null;return{solved:r.solved,shortest:s,explored:r.explored,withoutMinotaur:m,minotaurDelta:w,greedyWins:T,catchFree:l,catches:i,label:u,naiveWins:f,line:d}}function oo(e,t,o,n){let a=new Uint8Array(e.rows*e.cols),r=[t];a[t]=1;for(let s=0;s<r.length;s++){let i=r[s],l=Math.floor(i/e.cols),c=i%e.cols;for(let u of j){let f=l+H[u][0],d=c+H[u][1];if(f<0||d<0||f>=e.rows||d>=e.cols)continue;let h=f*e.cols+d;!a[h]&&o(h)&&(a[h]=1,r.push(h))}if(n?.from(i))for(let u of n.to)!a[u]&&o(u)&&(a[u]=1,r.push(u))}return a}function Rr(e){let t=new Set(e.objects.filter(i=>i!==null));e.machines.some(i=>i.template==="block")&&t.add("block");let o=i=>{let l=D[i];return l.door?t.has(`key-${l.door}`):i==="water"?t.has("block"):i==="toggle-open"||i==="toggle-closed"},n=oo(e,e.minotaur.r*e.cols+e.minotaur.c,i=>{let l=e.terrain[i];return D[l].minotaur||o(l)||l==="fake-wall"||l==="bomb"}),r=e.terrain.flatMap((i,l)=>i==="teleport"?[l]:[]).flatMap(i=>{let l=Math.floor(i/e.cols),c=i%e.cols;return j.flatMap(u=>{let f=l+H[u][0],d=c+H[u][1];return f<0||d<0||f>=e.rows||d>=e.cols?[]:[f*e.cols+d]})}),s=oo(e,e.player.r*e.cols+e.player.c,i=>{let l=e.terrain[i],c=D[l];return l==="wall"?!1:c.door?o(l):!c.needs||t.has(c.needs)||o(l)},{from:i=>e.terrain[i]==="teleport",to:r});return!n.some((i,l)=>i===1&&s[l]===1)}function*zr(e,t=pe,o={}){if(!e.minotaur||Rr(e))return!1;let n=le(e),a=o.store??Ge(n.words),r=Math.max(1,o.every??65536);try{let s=new Uint32Array(n.words);if(we(se(e),n,s,0),a.add(s,0,-1,0,0),a.size>=t)return null;let i=0;for(let l=0;l<a.size;l++){++i%r===0&&(yield{expanded:i,stored:a.size,bestF:0,startH:0}),a.words(l,s,0);let c=We(s,0,n,e,0);for(let u of ut){if(u>be&&c.tools[ve[u-be-1]]<=0)continue;let f=ae(c,_e[u]);if(f.events.some(h=>h.kind==="caught"&&h.by==="minotaur"))return!0;let d=f.state;if(!(Be(c,d)||d.outcome!=="playing")&&(we(d,n,s,0),a.add(s,0,l,u,0),a.size>=t))return null}}return!1}catch(s){if(s instanceof ke)return null;throw s}}var Lr=16;function Or(e,t){let o=e.rows*e.cols,n=new Int32Array(o).fill(-1),a=new Int8Array(o).fill(-1);n[t]=0;let r=[t];for(let s=0;s<r.length;s++){let i=r[s],l=Math.floor(i/e.cols),c=i%e.cols;j.forEach((u,f)=>{let d=l+H[u][0],h=c+H[u][1];if(d<0||h<0||d>=e.rows||h>=e.cols)return;let p=d*e.cols+h;n[p]>=0||e.terrain[p]==="wall"||(n[p]=n[i]+1,a[p]=f,r.push(p))})}return{dist:n,via:a}}function Pr(e){let t=e.rows*e.cols,o=e.player.r*e.cols+e.player.c,n=[],a=[];for(let m=0;m<t;m++)e.objects[m]==="relic"&&n.push(m),e.terrain[m]==="exit"&&a.push(m);let r=e.relics,s=[o,...n].map(m=>Or(e,m)),i=m=>{let T=-1,w=1/0;for(let E of a){let S=s[m].dist[E];S>=0&&S<w&&(w=S,T=E)}return[T,w]},l=(m,T)=>{let w=s[m].dist[T===0?o:n[T-1]];return w<0?1/0:w},c=null;if(r===0)c=[];else if(n.length<=Lr){let m=n.length,T=new Float64Array((1<<m)*m).fill(1/0),w=new Int8Array((1<<m)*m).fill(-1);for(let k=0;k<m;k++)T[(1<<k)*m+k]=l(0,k+1);let E=1/0,S=-1;for(let k=1;k<1<<m;k++){let C=Cr(k);if(!(C>r))for(let R=0;R<m;R++){let G=T[k*m+R];if(!(!(k&1<<R)||G===1/0)){if(C===r){let g=G+i(R+1)[1];g<E&&(E=g,S=k*m+R);continue}for(let g=0;g<m;g++){if(k&1<<g)continue;let v=(k|1<<g)*m+g,L=G+l(R+1,g+1);L<T[v]&&(T[v]=L,w[v]=R)}}}}if(S>=0){c=[];for(let k=S;;){let C=Math.floor(k/m),R=k%m;if(c.push(R+1),w[k]<0)break;k=(C&~(1<<R))*m+w[k]}c.reverse()}}else{c=[];let m=new Set(n.map((w,E)=>E+1)),T=0;for(;c.length<r;){let w=-1,E=1/0;for(let S of m){let k=l(T,S);k<E&&(E=k,w=S)}if(w<0){c=null;break}c.push(w),m.delete(w),T=w}}if(!c)return null;let u=c.length?c[c.length-1]:0,[f]=i(u);if(f<0)return null;let d=[],h=[0,...c],p=[...c.map(m=>n[m-1]),f];return h.forEach((m,T)=>{let{via:w}=s[m],E=p[T],S=[];for(let k=E;w[k]>=0;){let C=j[w[k]];S.push(C),k-=H[C][0]*e.cols+H[C][1]}d.push(...S.reverse())}),d}function Cr(e){let t=0;for(;e;e&=e-1)t++;return t}function Fr(e){let t=Pr(e);if(!t)return!1;let o=se(e);for(let n of t)if(o=ae(o,{kind:"move",dir:n}).state,o.outcome!=="playing")break;return o.outcome==="won"}var ge={minotaurDelta:8,exploredTimes:20};function no(e,t=ge,o){let n=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let a=e.withoutMinotaur!==null;if(a&&(e.minotaurDelta===null||e.greedyWins===null?n.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&n.push("the Minotaur does not matter: the line that ignores him wins, no longer")),n.push(...so(e)),!o)return n;if(!a)return[...n,"a challenge level has a Minotaur"];e.greedyWins!==!1&&n.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<t.minotaurDelta&&n.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${t.minotaurDelta}`);let r=l=>Math.max(0,...o.teaching.map(l)),s=r(l=>l.explored);e.explored<t.exploredTimes*s&&n.push(`a challenge level: stored ${e.explored} situations, the bar is ${t.exploredTimes} × ${s} = ${t.exploredTimes*s}`);let i=r(l=>typeof l.shortest=="number"?l.shortest:0);return typeof e.shortest=="number"&&e.shortest<i&&n.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${i}`),n}function so(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var ao={least:1.2,most:2.2};function io(e,t,o=ao){let n=t.explored/Math.max(1,e.explored);return n<o.least?[`stored ${t.explored} situations, ${n.toFixed(2)} × the challenge level before it (${e.explored}); the ramp asks at least ${o.least} ×`]:n>o.most?[`stored ${t.explored} situations, ${n.toFixed(2)} × the challenge level before it (${e.explored}); the ramp allows at most ${o.most} ×`]:[]}var ye={ramp:{least:1.1,most:1.5},most:2e4};function qe(e){return e.terrain.some(t=>t==="fake-wall"||t==="invisible-wall")}function lo(e){return qe(e)?ye.ramp:ao}function co(e,t){return!qe(e)||t.explored<=ye.most?[]:[`the level hides walls: stored ${t.explored} situations, the ceiling for a level that hides walls is ${ye.most}`]}var Re={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function ho(e,t=Re){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let o=[];e.naiveWins&&o.push("the plain walk to the exit wins"),o.push(...so(e));let n=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=ge.minotaurDelta,a=n?t.chaseShortest:t.shortest,r=n?t.chaseExplored:t.explored;return e.shortest<a&&o.push(`the quickest win is ${e.shortest} moves, the bar is ${a}`),e.explored<r&&o.push(`the solver searched ${e.explored} situations, the bar is ${r}`),o}var Dr={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function he(e,t){let o=[...e.terrain],n=[...e.objects];t(o,n);let a=e.machines.filter(r=>o[r.at.r*e.cols+r.at.c]==="clone");return J(Me({...e,terrain:o,objects:n,machines:a}))}function gt(e){let t=[],o=r=>`row ${Math.floor(r/e.cols)+1}, column ${r%e.cols+1}`;for(let r of ce){let s=`key-${r}`;e.objects.includes(s)&&t.push({name:`the ${r} keys`,ignored:[he(e,(i,l)=>{l.forEach((c,u)=>{c===s&&(l[u]=null)})})]}),e.terrain.some(i=>D[i].door===r)&&t.push({name:`the ${r} doors`,ignored:["wall","floor"].map(i=>he(e,(l,c)=>{l.forEach((u,f)=>{D[u].door===r&&(l[f]=i)}),c.forEach((u,f)=>{u===s&&(c[f]=null)})}))})}let n=e.objects.filter(r=>r==="relic").length>e.relics;e.objects.forEach((r,s)=>{r==="block"?t.push({name:`the block at ${o(s)}`,ignored:[he(e,(i,l)=>{l[s]=null,i[s]="wall"}),he(e,(i,l)=>{l[s]=null})]}):(r==="relic"?n:r!==null&&r!=="cake"&&r!=="page"&&!r.startsWith("key-"))&&t.push({name:`the ${r==="relic"?"spare relic":r} at ${o(s)}`,ignored:[he(e,(i,l)=>{l[s]=null})]})});let a=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[r,s,i]of a){if(!e.terrain.some(u=>s.includes(u)))continue;let l=i.map(u=>he(e,f=>{f.forEach((d,h)=>{s.includes(d)&&(f[h]=u)})})),c=Dr[s[0]];c&&e.objects.includes(c)&&l.push(he(e,(u,f)=>{f.forEach((d,h)=>{d===c&&(f[h]=null)})})),t.push({name:`the ${r}`,ignored:l})}return e.terrain.some(r=>r==="button"||r==="toggle-open"||r==="toggle-closed")&&t.push({name:"the toggle walls and their button",ignored:[he(e,r=>{r.forEach((s,i)=>{s==="button"||s==="toggle-open"?r[i]="floor":s==="toggle-closed"&&(r[i]="wall")})})]}),e.terrain.forEach((r,s)=>{let i=c=>{for(let[u,f]of Object.entries(e.links))f===s&&(c[Number(u)]="floor")},l=(c,u,f,d)=>t.push({name:`the ${c} at ${o(s)}`,ignored:[u,...d?[d]:[]].map(h=>he(e,p=>{p[s]=h,f?.(p)}))});r==="trap"?l("snare","floor",i):r==="fake-wall"?l("fake wall","wall",void 0,"floor"):r==="invisible-wall"?l("invisible wall","floor"):r==="thief"?l("thief","floor"):r==="bomb"?l("bomb","floor"):r==="clone"&&l("clone machine","wall",i)}),e.hazards.forEach((r,s)=>{t.push({name:`the ${oe[r.kind].name.toLowerCase()} at ${o(r.at.r*e.cols+r.at.c)}`,ignored:[J(Me({...e,hazards:e.hazards.filter((i,l)=>l!==s)}))]})}),t}var uo={explored:1.3};function Ir(e,t,o){let n=Se(se(t),o);if(!n.solved)return n.capped?"capped":"the level cannot be won";if(n.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${n.line.length}`;let a=Qt(se(t),xe,o);return a.solved?a.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${a.line.length}`:e.explored>=uo.explored*n.explored?`the search falls from ${e.explored} situations to ${n.explored}`:null:a.capped?"capped":"no win without a catch"}function fo(e,t,o=pe){return!t.solved||typeof t.catchFree!="number"?[]:gt(e).flatMap(n=>{let a=n.ignored.map(r=>Ir(t,r,o));return a.some(r=>r!==null&&r!=="capped")?[]:a.includes("capped")?[{unit:n,problem:`${n.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:n,problem:`${n.name}: ignoring it changes nothing (still ${t.shortest} moves, and the search no ${uo.explored} × smaller)`}]})}var Te={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function Br(e,t){let o=e.level;if(!e.minotaur)return 1/0;let n=e.minotaur.r*o.cols+e.minotaur.c,a=e.player.r*o.cols+e.player.c,r=new Map([[n,0]]),s=[n];for(let i=0;i<s.length;i++){let l=s[i],c=r.get(l);if(l===a)return c;if(c>=t)continue;let u=Math.floor(l/o.cols),f=l%o.cols;for(let d of j){let h=u+H[d][0],p=f+H[d][1];if(h<0||p<0||h>=o.rows||p>=o.cols)continue;let m=h*o.cols+p;r.has(m)||m!==a&&(!D[e.terrain[m]].minotaur||e.objects[m]==="block")||(r.set(m,c+1),s.push(m))}}return 1/0}function wt(e,t){let o=to(t.line)??[],n=se(e),a=0,r=0,s=0;for(let i of o)n=ae(n,i).state,n.stone>0||!!n.minotaur&&(te(Le(n),n.minotaur)||Br(n,Te.reach)<=Te.reach)?(a++,s=0):r=Math.max(r,++s);return{turns:o.length,live:a,quiet:r}}function po(e,t,o){if(!e.minotaur||!t.solved||typeof t.shortest!="number")return[];let n=[];t.minotaurDelta!==null&&t.minotaurDelta<1&&n.push("the beast adds no moves: a route that ignores him wins as quickly");let a=Te[o],r=wt(e,t);return r.live<a.share*r.turns&&n.push(`the beast is live on ${r.live} of ${r.turns} turns; the bar is ${Math.ceil(a.share*r.turns)}`),r.quiet>a.quiet*r.turns&&n.push(`the beast is quiet for ${r.quiet} turns in a row; the bar is ${Math.floor(a.quiet*r.turns)}`),n}function kt(e,t=0){let o=3735928559^t,n=1103547991^t;for(let a=0;a<e.length;a++){let r=e.charCodeAt(a);o=Math.imul(o^r,2654435761),n=Math.imul(n^r,1597334677)}return o=Math.imul(o^o>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),n=Math.imul(n^n>>>16,2246822507)^Math.imul(o^o>>>13,3266489909),[o>>>0,n>>>0]}function mo(...e){return kt(e.join(""))[0]}function bo(...e){let t=e.join(""),[o,n]=kt(t),[a,r]=kt(t,2654435769),s=o,i=n,l=a,c=r|1,u=()=>{let d=(s+i|0)+c|0;return c=c+1|0,s=i^i>>>9,i=l+(l<<3)|0,l=l<<21|l>>>11,l=l+d|0,(d>>>0)/4294967296};for(let d=0;d<12;d++)u();let f=d=>Math.floor(u()*d);return{next:u,int:f,pick:d=>d[f(d.length)],shuffle(d){let h=[...d];for(let p=h.length-1;p>0;p--){let m=f(p+1);[h[p],h[m]]=[h[m],h[p]]}return h}}}var Ye={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function xt(e){return Object.keys(Ye).filter(t=>Ye[t]<=e)}var Xe=["fake","invisible"];function yo(e,t,o,n){let a=t-(o-1);if(a<o*n)return null;let r=Array(o).fill(n);for(let l=a-o*n;l>0;l--)r[e.int(o)]++;let s=[],i=1;for(let l of r)s.push([i,i+l-1]),i+=l+1;return s}var Ee={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},Ze=["up","down","left","right"];function go(e,t){let{rows:o,cols:n}=t,a=yo(e,o-2,t.roomRows,2),r=yo(e,n-2,t.roomCols,2);if(!a||!r)return null;let s=Array.from({length:o},()=>Array(n).fill("#")),i=t.roomRows*t.roomCols,l=x=>({r:a[Math.floor(x/t.roomCols)],c:r[x%t.roomCols]});for(let x=0;x<i;x++){let{r:M,c:z}=l(x);for(let I=M[0];I<=M[1];I++)for(let _=z[0];_<=z[1];_++)s[I][_]="."}let c=[];for(let x=0;x<i;x++)x%t.roomCols<t.roomCols-1&&c.push([x,x+1]),x+t.roomCols<i&&c.push([x,x+t.roomCols]);let u=[...Array(i).keys()],f=x=>u[x]===x?x:u[x]=f(u[x]),d=[],h=(x,M,z)=>{let I=l(x),_=l(M);if(M===x+1){let N=Math.max(I.r[0],_.r[0]),X=Math.min(I.r[1],_.r[1]),U=I.c[1]+1;if(z){for(let ne=N;ne<=X;ne++)s[ne][U]=".";return}let q=N+e.int(X-N+1);s[q][U]=".",d.push({r:q,c:U})}else{let N=Math.max(I.c[0],_.c[0]),X=Math.min(I.c[1],_.c[1]),U=I.r[1]+1;if(z){for(let ne=N;ne<=X;ne++)s[U][ne]=".";return}let q=N+e.int(X-N+1);s[U][q]=".",d.push({r:U,c:q})}};for(let[x,M]of e.shuffle(c))f(x)!==f(M)?(u[f(x)]=f(M),h(x,M,e.next()<t.hall)):e.next()<t.loop&&h(x,M,!1);let p=e.shuffle([...Array(i).keys()]),m=new Set,T=()=>{let x=p.filter(z=>!m.has(z)),M=x.length?x[0]:e.pick(p);return m.add(M),M},w=(x,M=(z,I)=>s[z][I]===".")=>{let{r:z,c:I}=l(x),_=[];for(let N=z[0];N<=z[1];N++)for(let X=I[0];X<=I[1];X++)M(N,X)&&_.push([N,X]);return _.length?e.pick(_):null},E=(x,M)=>Ze.some(z=>d.some(I=>I.r===x+Ee[z][0]&&I.c===M+Ee[z][1])),S=x=>{let M=x===void 0?e.shuffle([...Array(i).keys()]):[x];for(let z of M){let I=w(z,(_,N)=>s[_][N]==="."&&!E(_,N));if(I)return I}return null},k=(x,M)=>{let z=S(M);return z?(s[z[0]][z[1]]=x,!0):!1},C=()=>e.shuffle(d.filter(x=>s[x.r][x.c]===".")),R=x=>{let M=C()[0];return M?(s[M.r][M.c]=x,!0):!1},G=(x,M)=>{let{r:z,c:I}=l(x);if(e.next()<.5){let N=z[0]+e.int(z[1]-z[0]+1),X=Math.min(z[1],N+e.int(2));for(let U=N;U<=X;U++)for(let q=I[0];q<=I[1];q++)s[U][q]==="."&&(s[U][q]=M)}else{let N=I[0]+e.int(I[1]-I[0]+1),X=Math.min(I[1],N+e.int(2));for(let U=z[0];U<=z[1];U++)for(let q=N;q<=X;q++)s[U][q]==="."&&(s[U][q]=M)}},g=T(),v=T(),L=new Map,A=new Map,y=x=>{let M=S();return M?(s[M[0]][M[1]]=x,L.set(M[0]*n+M[1],e.pick(Ze)),!0):!1},b=!0;for(let x of t.families){switch(x){case"keys":{let[M,z]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),I=1+e.int(2);for(let _=0;_<I;_++)b=R(M)&&b;for(let _=0;_<(M==="G"?1:I);_++)b=k(z)&&b;break}case"water":{let M=T();G(M,"~"),b=(e.next()<.5?k("f"):k("O"))&&b;break}case"fire":{let M=T();G(M,"F"),b=k("h")&&b;break}case"ice":{let M=T();G(M,"="),e.next()<.5&&(b=k("k")&&b);break}case"force":{let M=T(),z=e.pick(["^","v","<",">"]);G(M,z),e.next()<.5&&(b=k("u")&&b);break}case"blocks":{let M=1+e.int(2);for(let z=0;z<M;z++)b=k("O")&&b;break}case"toggle":{let M=1+e.int(2);for(let z=0;z<M;z++)b=R(e.next()<.5?"T":"t")&&b;b=k("_")&&b;break}case"mirror":b=k("z")&&b;break;case"cow":b=k("c")&&b;break;case"gravel":{let M=1+e.int(2);for(let z=0;z<M;z++)b=R(":")&&b;break}case"popup":b=R(";")&&b;break;case"fake":b=R("W")&&b;break;case"invisible":b=k("I")&&b;break;case"snare":b=(e.next()<.5?R("&"):k("&"))&&k("-")&&b;break;case"teleport":b=k("@",T())&&k("@",T())&&b;break;case"ball":b=y("o")&&b;break;case"glider":b=y("w")&&b;break;case"fireball":b=y("e")&&b;break;case"thief":b=R("$")&&b;break;case"bomb":b=(e.next()<.5?R("!"):k("!"))&&b;break;case"clone":{let M=!1;for(let z=0;z<40&&!M;z++){let I=e.int(i),{r:_,c:N}=l(I),X=e.int(4),U=X<2?X===0?_[0]-1:_[1]+1:_[0]+e.int(_[1]-_[0]+1),q=X<2?N[0]+e.int(N[1]-N[0]+1):X===2?N[0]-1:N[1]+1,ne=["down","up","right","left"][X],No=U+Ee[ne][0],Uo=q+Ee[ne][1];U<=0||q<=0||U>=o-1||q>=n-1||s[U][q]!=="#"||s[No][Uo]!=="."||(s[U][q]="C",A.set(U*n+q,`${e.pick(["block","ball","block"])}-${ne}`),M=!0)}b=M&&k("+")&&b;break}}if(!b)return null}for(let x=0;x<t.relics;x++)if(!k("*"))return null;if(!k("P",g)||!k("M",v))return null;let P=[];for(let x=1;x<o-1;x++)s[x][1]==="."&&P.push([x,0,x,1]),s[x][n-2]==="."&&P.push([x,n-1,x,n-2]);for(let x=1;x<n-1;x++)s[1][x]==="."&&P.push([0,x,1,x]),s[o-2][x]==="."&&P.push([o-1,x,o-2,x]);if(!P.length)return null;let[B,$,ee,F]=e.pick(P);return s[B][$]="E",t.relics>0&&e.next()<.5&&s[ee][F]==="."&&!E(ee,F)&&(s[ee][F]="|"),{g:s,doors:d,facing:L,machines:A}}function Tt(e,t){let o=[`title: ${t}`,"intro: "],n=[...e.facing.keys()].sort((r,s)=>r-s);n.length&&o.push(`facing: ${n.map(r=>e.facing.get(r)).join(" ")}`);let a=[...e.machines.keys()].sort((r,s)=>r-s);return a.length&&o.push(`machines: ${a.map(r=>e.machines.get(r)).join(" ")}`),`${o.join(`
`)}

${e.g.map(r=>r.join("")).join(`
`)}
`}var $r=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function wo(e,t){let o=t.g.map(f=>[...f]),n=o.length,a=o[0].length,r=[...t.doors],s=new Map(t.facing),i=f=>{let d=[];for(let h=1;h<n-1;h++)for(let p=1;p<a-1;p++)f(h,p)&&d.push([h,p]);return d},l=(f,d)=>r.some(h=>h.r===f&&h.c===d),c=(f,d)=>Ze.some(h=>l(f+Ee[h][0],d+Ee[h][1])),u=e.next();if(u<.55){let f=i((h,p)=>$r.has(o[h][p])&&!l(h,p)),d=i((h,p)=>o[h][p]==="."&&!l(h,p)&&!c(h,p));if(f.length&&d.length){let[h,p]=e.pick(f),[m,T]=e.pick(d);o[m][T]=o[h][p],o[h][p]=".";let w=s.get(h*a+p);w&&(s.delete(h*a+p),s.set(m*a+T,w))}}else if(u<.7){let f=r.filter(h=>o[h.r][h.c]!=="."),d=r.filter(h=>o[h.r][h.c]===".");if(f.length&&d.length){let h=e.pick(f),p=e.pick(d);o[p.r][p.c]=o[h.r][h.c],o[h.r][h.c]="."}}else if(u<.8&&s.size)s.set(e.pick([...s.keys()]),e.pick(Ze));else{let f=r.filter(h=>o[h.r][h.c]==="."),d=i((h,p)=>o[h][p]==="#"&&(o[h-1][p]!=="#"&&o[h+1][p]!=="#"&&o[h][p-1]==="#"&&o[h][p+1]==="#"||o[h][p-1]!=="#"&&o[h][p+1]!=="#"&&o[h-1][p]==="#"&&o[h+1][p]==="#"));if(f.length>1&&(e.next()<.5||!d.length)){let h=e.pick(f);o[h.r][h.c]="#",r=r.filter(p=>p!==h)}else if(d.length){let[h,p]=e.pick(d);o[h][p]=".",r.push({r:h,c:p})}}return{g:o,doors:r,facing:s,machines:new Map(t.machines)}}var ko=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function Wr(e,t,o){for(let n=-1;n<=1;n++)for(let a=-1;a<=1;a++){let r=t+n,s=o+a;if(r>=0&&s>=0&&r<e.rows&&s<e.cols&&ko(e.terrain[r*e.cols+s])!=="wall")return!1}return!0}function Je(e){return Array.from({length:e.rows-2},(t,o)=>Array.from({length:e.cols-2},(n,a)=>{let r=ko(e.terrain[(o+1)*e.cols+a+1]);return r==="wall"&&Wr(e,o+1,a+1)?"":r}))}var jr=e=>e[0].map((t,o)=>e.map(n=>n[o]).reverse()),Hr=e=>e.map(t=>[...t].reverse());function Et(e){let t=[];for(let o=0,n=e;o<4;o++,n=jr(n))t.push(n,Hr(n));return t}function Mt(e,t){let o=0;for(let n of t){let[a,r]=e.length*e[0].length<=n.length*n[0].length?[e,n]:[n,e],s=a.length,i=a[0].length,l=r.length,c=r[0].length;if(!(s>l||i>c||l-s>2||c-i>2))for(let u=0;u<=l-s;u++)for(let f=0;f<=c-i;f++){let d=0,h=0;for(let p=0;p<s;p++)for(let m=0;m<i;m++){let T=a[p][m],w=r[p+u][m+f];T&&T===w&&d++,(T||w)&&h++}o=Math.max(o,h?d/h:1)}}return o}var Eo=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function vt(e){let t=new Set(e.terrain),o=new Set(e.objects.filter(n=>n!==null));return t.has("thief")||t.has("bomb")||t.has("clone")||t.has("button-red")?9:e.hazards.some(n=>n.kind!=="ball")?8:e.hazards.length?7:t.has("teleport")?6:t.has("trap")||t.has("button-brown")?5:t.has("fake-wall")||t.has("invisible-wall")?4:t.has("popup")?3:t.has("gravel")?2:1}var Gr=e=>({teaching:[{...Eo[e-1]}]});function Mo(e){let t=Eo[e-1];return{explored:Math.max(Re.chaseExplored,ge.exploredTimes*t.explored),shortest:Math.max(Re.chaseShortest,t.shortest)}}var To=Re.chaseExplored,_r={least:1.2,most:1.6},At={least:3e4,most:5e4};function Ve(e,t){let o=t?ye.ramp:_r,n=t?ye.most:At.most;if(e===null)return{least:To,most:t?ye.most:2e4,plateau:!1};let a=Math.max(To,Math.ceil(e*o.least)),r=Math.min(n,Math.floor(e*o.most));return r>=a*1.15?{least:a,most:r,plateau:!1}:t?null:{least:At.least,most:At.most,plateau:!0}}function Ao(e){return{features:e.map(t=>Et(Je(t)))}}function St(e){let{rows:t,cols:o}=e,n=(r,s)=>e.terrain[r*o+s]==="wall",a=[];for(let r=1;r<t-1;r++)for(let s=1;s<o-1;s++){let i=r*o+s,l=[n(r-1,s),n(r+1,s),n(r,s-1),n(r,s+1)].filter(Boolean).length;n(r,s)&&l===0&&a.push(`a lone wall at row ${r+1}, column ${s+1}`),e.terrain[i]==="floor"&&e.objects[i]===null&&!(e.player.r===r&&e.player.c===s)&&!(e.minotaur?.r===r&&e.minotaur.c===s)&&!e.hazards.some(u=>u.at.r===r&&u.at.c===s)&&l>=3&&a.push(`a bare pocket at row ${r+1}, column ${s+1}`)}return a}function Rt(e,t,o=[]){let n=Je(e),a=[];return t.features.forEach((r,s)=>{let i=Mt(n,r);i>=.42&&a.push(`its layout repeats campaign level ${s+1}'s (${i.toFixed(2)})`)}),o.forEach((r,s)=>{let i=Mt(n,Et(Je(r)));i>=.42&&a.push(`its layout repeats the run's level ${s+1}'s (${i.toFixed(2)})`)}),a}function vo(e,t,o,n,a=[]){let r=[];return(t.explored<o.band.least||t.explored>o.band.most)&&r.push(`stored ${t.explored} situations, the band is ${o.band.least} to ${o.band.most}`),r.push(...no(t,ge,Gr(vt(e))),...ho(t),...po(e,t,"challenge"),...co(e,t)),!o.band.plateau&&o.previous&&r.push(...io(o.previous,t,lo(e))),qe(e)&&o.band.plateau&&r.push("a level that hides walls never sits on the plateau"),r.length?r:[...St(e),...Rt(e,n,a)]}var Kr=12e6,Lo=12,Qe=120,Nr=.25;function Ur(e,t,o,n){let a=xt(t).filter(c=>!Xe.includes(c)),r=a.filter(c=>Ye[c]===Math.min(t,9)),s=2+e.int(2),i=[];r.length&&e.next()<.5&&i.push(e.pick(r)),n&&i.push(e.pick(Xe));for(let c of e.shuffle(a))i.length<s+(n?1:0)&&!i.includes(c)&&i.push(c);let l=12+e.int(3);return{rows:l,cols:l,roomRows:3,roomCols:3,families:i,relics:1+e.int(3),hall:.2,loop:.35}}var So=e=>Math.ceil(e.most*1.05),Ro=e=>Math.max(2e5,e.most*4);function zt(e,t,o){if(!e.minotaur)return 1/0;let n=St(e).length;if(n)return 14+n;let a=se(e),r=Se(a,So(t));if(o(r.explored),!r.solved)return r.capped?12:30;let s=0,i=Mo(vt(e)),l=Math.max(t.least,i.explored);r.explored<l&&(s+=3*Math.log(l/r.explored)),r.explored>t.most&&(s+=3*Math.log(r.explored/t.most)),r.line.length<i.shortest&&(s+=.2*(i.shortest-r.line.length));let c=a,u=0;for(let h of r.line){let p=ae(c,h);c=p.state,xe(p.events,c)&&u++}s+=3*u;let f=wt(e,{line:Ue(r.line)});if(s+=6*Math.max(0,Te.challenge.share-f.live/Math.max(1,f.turns)),s+=6*Math.max(0,f.quiet/Math.max(1,f.turns)-Te.challenge.quiet),s>0)return s;let d=Se(se({...e,minotaur:null}),So(t));if(o(d.explored),d.solved){s+=.4*Math.max(0,ge.minotaurDelta-(r.line.length-d.line.length));let h=a;for(let p of d.line)h=ae(h,p).state;h.outcome==="won"&&(s+=2)}return s}function qr(e,t){let o=Me(t),n=o.slice(o.indexOf(`

`)+2).trimEnd().split(`
`).map(s=>[...s]),a=new Map(t.hazards.map(s=>[s.at.r*t.cols+s.at.c,s.dir])),r=new Map(t.machines.map(s=>[s.at.r*t.cols+s.at.c,`${s.template}-${s.dir}`]));return{g:n,doors:e.doors,facing:a,machines:r}}function Yr(e){let t=o=>o.terrain.filter(n=>n==="wall").length;return e.reduce((o,n)=>t(n)<t(o)?n:o)}function zo(e,t,o){let n=t.run.slice(-Lo),a=e.filter(u=>u.chapter<=t.tier),r=n.map(u=>J(u.text)),s=a.filter(u=>!n.some(f=>f.text===u.text)&&Rt(J(u.text),{features:[]},r).length===0),i=t.run.at(-1)?.explored??null,l=Ve(Number.MAX_SAFE_INTEGER,!1),c=[u=>u.explored>=o.least&&u.explored<=o.most,u=>i!==null&&u.explored>=i*1.2&&u.explored<=i*2.2,u=>u.explored>=l.least&&u.explored<=l.most,()=>!0];for(let u of[s,a,e])for(let f of c){let d=u.filter(f);if(d.length)return d[mo("endless-bank",t.seed,t.tier,t.depth)%d.length]}throw new RangeError("the bank is empty")}function Zr(e,t,o,n,a,r,s,i,l,c=null,u){let f=d=>{i.spent+=d};for(let d=0;i.spent<s;d++){let h=bo("endless",...e,d),p=c!==null&&h.next()<.25,m=p?c:o,T=go(h,Ur(h,t,m,p));if(!T){f(1e3);continue}let w=C=>{try{return J(Tt(C,""))}catch{return null}},E=w(T),S=E?zt(E,m,f):1/0,k=Qe;for(let C=0;C<k&&i.spent<s&&(C===k-1&&S<2&&k<3*Qe&&(k+=Qe),!(C===Math.floor(Qe/3)&&S>=8));C++){if(i.tries++,C%8===0&&l?.({tries:i.tries,spent:i.spent,budget:s}),S===0&&E){let v=ro(E,Ro(m));f(4*v.explored);let L=vo(E,v,{band:m,previous:n},a,r);if(L.length)u?.(`gate: ${L.join("; ")}`),S=1;else{f(gt(E).reduce((b,P)=>b+P.ignored.length,0)*2*v.explored);let A=fo(E,v,Ro(m));if(!A.length)return{text:Tt(T,""),d:v};u?.(`useless: ${A.map(b=>b.problem).join("; ")}`);let y=Yr(A[0].unit.ignored);T=qr(T,y),E=w(T),S=E?zt(E,m,f):1/0;continue}}let R=wo(h,T),G=w(R);if(!G)continue;let g=zt(G,m,f);(g<=S||Number.isFinite(g)&&h.next()<Math.exp(-(g-S)/Nr))&&(T=R,E=G,S=g)}u?.(`round ${d}: ended ${S.toFixed(2)} from passing, ${i.spent} spent`)}return null}function Oo(e,t,o,n={}){let a=e.budget??n.budget??Kr,r=e.run.at(-1)??null,s=Ve(r?.explored??null,!1),i={tries:0,spent:0},l=d=>({text:d.text,explored:d.explored,shortest:d.shortest,line:d.line,from:"bank",...i});if(e.depth<=1||!r)return l(zo(t,e,s));let c=e.run.slice(-Lo).map(d=>J(d.text)),u=xt(e.tier).some(d=>Xe.includes(d))?Ve(r.explored,!0):null,f=Zr([e.seed,e.tier,e.depth],e.tier,s,{explored:r.explored},o,c,a,i,n.progress,u);return f?{text:f.text,explored:f.d.explored,shortest:f.d.shortest,line:f.d.line,from:"made",...i}:l(zo(t,e,s))}var Xr=150;function Po(e){let t=null;return{receive(o){if(o.type==="make")try{t??=e.known();let n=-1/0,a=Oo(o.request,e.bank,t,{...e.budget!==void 0?{budget:e.budget}:{},progress:r=>{let s=e.now();s-n<Xr||(n=s,e.post({type:"progress",id:o.id,progress:r}))}});e.post({type:"made",id:o.id,made:a})}catch(n){e.post({type:"failed",id:o.id,message:n instanceof Error?n.message:String(n)})}}}}var Co=[];var Fo=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
intro: Ariadne's thread is in your hand, Theseus. The beast runs two steps to your one: do not run at him, let the walls hold him.

#######
#...E.#
#M..#.#
#.#...#
##....#
#P.##.#
#######
`},{id:"trial-2",text:`title: The Tribute Relics
intro: Two relics lie in the dark, and the gate of Minos opens for nothing less. The beast keeps watch over the far one: draw him away.

#########
#P.....*#
##....#M#
#.*#.#..#
#.#....##
#.....|E#
#########
`},{id:"trial-3",text:`title: The Doors of Daedalus
intro: Daedalus hung doors of every colour. A red or blue key is spent in its lock; the green key is never used up.

#########
#..M#.Rb#
#.#.#.###
##g.G...#
###.##.##
##r.#..##
#.#.G..##
#P..#.BE#
#########
`},{id:"trial-4",text:`title: The River and the Flame
intro: The Naiads lend flippers for the water and Hephaestus lends boots for the fire. The beast prowls the shore between.

##########
#.#~...FE#
###~...F##
#f.~...F##
##.~#.hF##
#..~#M#F##
#P.~#..F##
###~...F##
##########
`},{id:"trial-5",text:`title: The Slippery Halls
intro: Daedalus polished these halls to glass and set currents in the stones. Skates hold the ice; suction boots hold the current.

############
#P.#k======#
##.#.##.####
##...##u<<E#
#.##.#######
#....#######
###..#######
#..M.#######
############
`},{id:"trial-6",text:`title: The Sinking Stones
intro: Roll a stone into the deep and the water becomes a road. Tread the plate and the walls of Daedalus change places.

###########
#.M..#._..#
#.#..#..#.#
##PO.~.#..#
##...#....#
#....#...##
#....#.#T##
#######.E##
###########
`},{id:"trial-7",text:`title: The Gifts of Ariadne
intro: Ariadne left you gifts: Medusa's mirror, Daedalus's cow and a honey cake. Stone the beast to pass him, set the cow where the walls will pin him, and keep the cake as a spare heart.

#########
#M.E#.###
##....###
#P#..#.c#
#x.#.#.##
##S.z...#
#####.S.#
#########
`},{id:"trial-8",text:`title: The Riddle of Minos
intro: Here Minos hid a harder riddle: a locked door, a block to sink in the pool, a flood to swim, and the beast between. The halls beyond grow no kinder.

############
#P..#.M.~.##
###.#...~..#
#.r.##..~..#
#.#.R...~..#
#.#.###.~..#
#.z##..O~..#
#...#..~~..#
#...#.~f~.E#
############
`},{id:"trial-9",text:`title: The Bull's Horns
intro: The beast cannot tread the marked stones. A catch costs a heart, not what you carry: you wake on the last mark you stood on, or where you began.
pages: ch1-tribute-marks

############
#.*#...#.|E#
##.#..O#.###
#.S##M...###
#.#.....S.##
#....#.#.#.#
##.S...p.#.#
##...#.....#
##..##....##
#..#..PS...#
############
`},{id:"trial-10",text:`title: The Great Hall
intro: The sealed gate stands at the end of the long hall, and the beast walks the hall before it. Lead him where the walls will hold him, then take the relic from its niche and go.
pages: ch1-chalk

####################
#....#...#.........#
#.P..#...#.######..#
#....R.O.~T###..#..#
#r...#...#.#*#.#...#
#....#._z#.#...M...#
##########.<.##...|E
######p....######..#
##########.#####...#
##########.#####.#.#
##########.######F.#
##########hFFFFFFF##
####################
`}];var Do=[{id:"ch2-1",text:`title: The Loose Stone
intro: Daedalus strewed these ways with loose stone. You can cross it; the beast's hooves cannot. Leave him the open hall and take the stony way round.

###########
#P.....M.E#
#.#######.#
#.:::::::.#
###########
`},{id:"ch2-2",text:`title: The Stone Between
intro: The beast will not step onto loose stone, not even to reach you. Draw him round to your side, keep a stone between you, and walk on.

############
#..........#
#.#.####.#.#
#P..:..:M.*#
#.#.####.#.#
#..........#
##########|#
##########E#
############
`},{id:"ch2-3",text:`title: The Stubborn Block
intro: A pushed block will not cross loose stone either. The near pool is barred to it; find the long way round to the far one.

###########
#E.#.#..M.#
##.#.#..#.#
#....~:OP##
#.##.#...##
#....~....#
#.##.#....#
#.....#####
###########
`},{id:"ch2-4",text:`title: The Currents
intro: Daedalus set currents running through these ways, and they carry the beast as they carry you. Draw him onto them and let them take him while you gather the relics; suction boots will hold you fast.

############
#P..#>..>.##
#>..:.#...##
###..^*:.*.#
#^..#.##...#
#.<:#^:Mu.##
#...:...#.##
##..#.#:...#
#*#...#.##.#
#.<.v.#.:#.E
############
`},{id:"ch2-5",text:`title: The Glassy Ways
intro: The floors are polished to ice, and the beast skids on them as you do. Loose stone does not slide: stop on it, where he cannot follow. Skates lie somewhere in the cold.

############
#P#.#k.#..*#
#=#..:.#=..#
#.:=....:.##
#..=##.=.#M#
#.==.*#=...#
#.:....=...#
#.#.#..===.#
#:..:.#..###
#.=*#..#.=.E
############
`},{id:"ch2-6",text:`title: Water and Fire
intro: A river and a fire cross these ways, with loose stone between them. Flippers and fire boots both lie here, and you will need both; the beast will not wait while you find them.

############
#P:.#~#.#.*#
#...~.O.F:##
#..#....F#:#
#f.#.##:..##
##...##.#..#
#*.#.#...#.#
##F..~h:~###
##M...#:...#
#*.~#.#F:.|E
############
`},{id:"ch2-7",text:`title: The Three Locks
intro: Three doors and three keys, and not every key is worth its door. Each door you open is another road for the beast. Loose stone is a road for you alone.

############
#P..#..#.#*#
##..Rr##.#.#
#.#.#:.:#..#
#r#.##:M..##
#.....:..###
#*#:#b#....#
##R:B...##.#
#..#..####.#
#:#.#..*##.E
############
`},{id:"ch2-8",text:`title: The Shifting Walls
intro: A plate here moves the walls, and the only road over the water is a block you sink yourself. Loose stone turns the blocks aside, and the beast with them.

############
#P...#...*##
#...#.#....#
#.....~.##.#
###....##:.#
#*.#._#:...#
#.#..#:.:..#
#:O...##~.T#
#::...#MT..#
#*.#.......E
############
`},{id:"ch2-9",text:`title: The Bronze Mirror
intro: A bronze mirror lies past the beast, and Daedalus's cow beside him. Marked stones and loose ones both keep him off you; between them you will have to run. Off the quick way, a page waits, and a memory of Athens.
pages: ch2-lots

############
#:.##.p#z.*#
#P....#.:#.#
####.#..:#.#
####.#:#.###
#*...S...c.#
##..##.#.#.#
##x#:..M.#.#
#.S.S####..#
#*..##S.#:|E
############
`},{id:"ch2-10",text:`title: The Inner Gate
intro: The winding ways end at the inner gate. Water guards it, and only the flippers take you across; fire boots open a quicker way through the flames. The beast roams the halls between. The longest way round holds a page and a honey cake.
pages: ch2-black-sail

####################
#P..##.:.......p.#x#
#.#.::..#....#..:#.#
##...:..##...#..:..#
#..##.:..#.##.:##:.#
#*:##.....##.......#
#..#.#.##..#.###.#.#
#.#.#:.h.#.*.#.....#
###.#...####.###~###
##.#........####~###
#.##M#.....#.#..~.*#
#*..:..##.f...FF#.|E
####################
`}];var Io=[{id:"ch3-1",text:`title: The Rising Floor
intro: These stones bear you once. Step off one and it rises into wall behind you. The beast waits on the short way; take the long way, under him.

###########
#P.......E#
#.##.M.##.#
#.#######.#
#.;.....;.#
###########
`},{id:"ch3-2",text:`title: Stones He Will Not Tread
intro: The beast will not set a hoof on these stones, risen or not. Two of them pen him in the lower hall; go round, and leave him there.

############
#..........#
#.########;#
#P#......#.#
#.#.####.#.#
#..;...M.;.#
######.###.#
######...|E#
############
`},{id:"ch3-3",text:`title: The Block That Stays
intro: A pushed block will not cross a closing stone either. The near way to the pool is barred to it, and the beast keeps the way round; get the block there anyway.

############
#P..#..#..##
#.#...#.#.##
#...O..;.~E#
##.#####...#
##.######..#
#..........#
#....#M.##.#
############
`},{id:"ch3-4",text:`title: The Red Door
intro: A red door and its key, and stones that close behind you. The door is the quicker way; every stone you cross is one you cannot cross again.

############
#P..#...r..#
#........#.#
###.#.;..#.#
#.##.....#.#
#...;....#.#
###..M.#.###
#*#.#...;..#
#.#..#.R##.#
#...#.;...|E
############
`},{id:"ch3-5",text:`title: The Flooded Hall
intro: Pools fill the middle of this hall. The beast will not wade them and will not tread the closing stones; between the two, find your way to both relics.

############
#P......#f.#
#..#..#....#
##..;...#.##
####.#....##
#..#.~~~;..#
#.M..~.~#..#
#*;#.~~~...#
#.#......#.#
#*......;#|E
############
`},{id:"ch3-6",text:`title: The Sliding Floor
intro: Ice and a pushing current run through this hall, and closing stones hold the beast back. Let neither the ice nor the current carry you where you cannot leave.

############
#P..#...=..#
#...#.#.=###
#.#...;#=#.#
##....##...#
##.>>>>....#
##.###.....#
#*..;M.....#
###...#.#.##
#*...;..#.|E
############
`},{id:"ch3-7",text:`title: The Stone in the Way
intro: A block stands in the way, and a wall waits on a button. The closing stones leave few ways round; plan before you cross.

############
#P...#...#.#
#.##.#...#.#
#..O.;...###
#.....#..#.#
#...._.T.;.#
###.##...#.#
#*..;...#..#
##.#.#...M.#
#*...#;#..|E
############
`},{id:"ch3-8",text:`title: Marked Ground
intro: Loose stone, marked stone and closing stone: the beast can stand on none of them. Between them lies open floor, and that is where he will look for you.

############
#P..::....##
##....##..##
#.#.;.....##
#...#.S#...#
#*.#....;.M#
###.:.#..#.#
#...###..#.#
#.;##...:..#
#*...#.#.;|E
############
`},{id:"ch3-9",text:`title: The Bronze Glass
intro: Fire burns across these halls, and a bronze mirror lies past the beast. Off the quick way a page waits, and a memory of the games of Minos.
pages: ch3-games

############
#P.....h...#
#.#.#.#....#
#.#.;.FF..##
#.#.##p.#..#
#*.#;.#z#..#
###.#.##..##
#*..##..;..#
#..##..FM..#
#...x.;...|E
############
`},{id:"ch3-10",text:`title: The Ring of Walls
intro: The closing ways end in a ring of walls that were floor a moment ago. The long west hall is the way through, and a red door opens a second road beside it; off the quickest way, a page waits, and a memory of Ariadne.
pages: ch3-thread

####################
#P...#....;...##p..#
#.##...####..##.##.#
#..r.;...#......;..#
#..#.......#.#.##..#
#*...#.#.#.#...#..##
#......#..######.#.#
#....;.......M...#.#
###.##.#####....#;.#
#...R#......#...#..#
#.##..##....##..#..#
#*#.#;...#.##.x.;.|E
####################
`}];var Bo=[{id:"ch4-1",text:`title: The Wall That Gives
intro: The high way runs past the beast. The low way ends in a wall, and one of its stones is only painted: walk into it and it gives way, and you are through.

###########
#P...#..ME#
#.##...##.#
#.#.....#.#
#.#######.#
#....W....#
###########
`},{id:"ch4-2",text:`title: The Gap That Is Not
intro: The gap under the beast is no gap. It is wall you cannot see, to him as much as to you. Walk the low hall beneath him; he will watch you through it and stay where he is.

###########
#P......ME#
#.###I###.#
#.........#
###########
`},{id:"ch4-3",text:`title: Neither Wall Nor Floor
intro: Here what looks open is shut, and what looks shut is open. Bump what blocks you, go round what does not, and keep the beast in his hall above.

###########
#P........#
#.##.M.##.#
#.#######.#
#.I..W...E#
#...#######
###########
`},{id:"ch4-4",text:`title: The Unseen Shore
intro: A relic lies in the pool, two more about it, and the flippers in the far corner. One stretch of floor here is wall you cannot see; the beast knows where it is, and he will not wade after you.

############
#P.#######f#
#...#..~~~.#
#..*.I.~*~.#
#..#.#.~~~M#
#....#..#..#
#..###..#.##
#*..O......#
###........#
###.##...|E#
############
`},{id:"ch4-5",text:`title: The Painted Stone
intro: Two relics, a red key and its door. The beast waits in the upper hall; two of these walls are only painted, and they are your way round him.

############
#P....S.##.#
#.##....#..#
#.#*S.W##.##
#.#.#.....M#
#........#.#
#.##S.#..#.#
#S#rS#..##.#
#..S###.R#.#
###.W..*#|E#
############
`},{id:"ch4-6",text:`title: Lying Ground
intro: Loose stone and closing stone keep the beast off, and here the walls lie both ways: one painted, two unseen. Mind where the stones close behind you.

############
###.*###P..#
#...##.....#
#......I:..#
##.;##.#...#
#..###.W.###
#........###
##....;I.###
###.###..###
#.*.:..M.|E#
############
`},{id:"ch4-7",text:`title: The Glass Floor
intro: Ice runs through these halls and skates lie in the west. Two walls here are only painted, one of them across the ice; the beast skids as you do.

############
#P...#.##.*#
#......#...#
#..==W==.###
#...#..=##.#
#k##.#.=...#
#.....#=...#
##....M.W..#
#...####..##
#*..#....|E#
############
`},{id:"ch4-8",text:`title: The Waiting Wall
intro: A block, a button and a wall that waits on it. A painted stone stands near the block, and an unseen wall guards the low way.

############
#P##.....###
#.#...#....#
#.#O.W..*#.#
#.......T#.#
#....#_....#
###..#.##..#
#*#.##.....#
#...#..#...#
##..I..##M|E
############
`},{id:"ch4-9",text:`title: The General
intro: Fire burns across these halls, and boots lie near it. One wall here is painted and two are unseen; off the quick way a page waits, and a memory of the general of Minos.
pages: ch4-taurus

############
#..#FF::..P#
#.;###..##.#
#..h...I#.##
##...W#..:.#
#..:....##*#
#.#.FF#..###
#.;##.#:...#
#.pI....#..#
E|M#...;.#*#
############
`},{id:"ch4-10",text:`title: The Painted Labyrinth
intro: The false walls end in a maze of them. A red door is the way through, a painted wall opens a second road to the gate, and one stretch of open floor is not open at all. Off the quickest way, a page waits, and a memory of the queen.
pages: ch4-queen

####################
#P....#......####.p#
##.#....###..###..##
###*..:...##..:..###
#.......##.I##.....#
#..##...#.......#W.#
##..#......##.#...##
#r###.:.......:.####
#........##..#.#...#
#..*.###.##..#.R...#
#.#..#.#..:.#####.##
#*##M..###...##.#|E#
####################
`}];var $o=[{id:"ch5-1",text:`title: The Snare
intro: The beast stands between you and the way out. A snare of Daedalus lies in the west hall: lead him into it and it will hold him while you pass.

###########
#P......#E#
#.###.#.#.#
#.#...#.#.#
#.&.#M....#
#...#.###.#
#.........#
###########
`},{id:"ch5-2",text:`title: The Brown Button
intro: The high way runs past the beast; the low way crosses a snare that would hold you for good. Push the block onto the brown button below it, and the snare lies open for as long as the block stays there.

###########
#P...#...E#
#.##...##.#
#.#..M..#.#
#.#######.#
#....&....#
#.O.#######
#.-.#######
###########
`},{id:"ch5-3",text:`title: Bound and Loosed
intro: Lead the beast into the snare, then mind the brown button beside it: whatever stands on the button looses what the snare holds, the beast as well.

###########
#P..#....E#
#..&..#.#.#
#..-..#.#.#
#.....#...#
#M...#....#
######....#
###########
`},{id:"ch5-4",text:`title: The Frozen Snare
intro: Ice runs through the middle halls; skates and a block lie in the west. A snare waits in the south, and the brown button by the ice looses it: lead the beast in, then keep off that button.

############
#P.....#..*#
#......#.M##
#.-==.==...#
#O.###.=...#
#k...#.=####
#....#.=#.##
#.##......##
#..#.&.....#
#*.#....#|E#
############
`},{id:"ch5-5",text:`title: The Drowned Snare
intro: A relic lies in the pool, two more beside it, and the flippers wait by the gate. One snare guards the south door: lead the beast into it. The brown button in the north looses it, so keep off it, and keep the block off it too.

############
#...#......#
#...#......#
#.OP####-###
#..........#
#.##*~~~##.#
#.#..~*~.#.#
#.#*.~~~.#.#
#.####.&####
#..M....f|E#
############
`},{id:"ch5-6",text:`title: The Snare at the Gate
intro: A snare lies before the gate, and its brown button sits far off in the northeast. Two relics and a block; lead the beast into the snare, and stay off that button.

############
#P......#.-#
#.##......##
#.#*...##..#
#.####..##.#
#.#.M##.#..#
#.....#....#
#..O...#...#
#....#.#...#
###.*#.&.|E#
############
`},{id:"ch5-7",text:`title: The Loosing Stone
intro: A block, a red key and its door, two relics and one snare. The brown button by the beast's hall looses the snare: once he is held, keep off it.

############
#P.....#####
#.......####
#..O...&*..#
#....#.#R..#
#...##....##
###.#M..#..#
#*#.#.#-...#
#.....##...#
###r.##...|E
############
`},{id:"ch5-8",text:`title: The Snared Relic
intro: One relic hides in the northwest, and the only way to it runs through a snare. Push the block to the brown button in the south to open it; a second snare lies in the west hall, for the beast.

############
#*#...P....#
#.#....#.#.#
#&.....#...#
#.#.##...O.#
#.&....:#.##
#.###.#...##
#.#.;...#..#
#.#........#
#E|#.-M#:.##
############
`},{id:"ch5-9",text:`title: The House of Erechtheus
intro: Fire burns across these halls, and boots lie in the west. Two snares, and one brown button in the east that looses the western snare. Off the quick way a page waits, and a memory of the man who laid them.
pages: ch5-kinsman

############
#...FF::..P#
#.;.....##.#
#.&h....p&.#
#.###...#:.#
#..:..#..#*#
##..FF.#.###
##;..#.:#-.#
##.........#
E|.M.#.;..*#
############
`},{id:"ch5-10",text:`title: The Gate of the Labyrinth
intro: The snares end at the gate, and the beast waits by it, behind a red door. The door is one way through; the other runs east, past a snare that the block, pushed onto the brown button, holds open. Off the quickest way, a page waits, and a memory of another telling.
pages: ch5-gate

#################
#.....#.##..#...#
#####.#.###.#.#.#
###*..#...#..*#.#
###.#####.#####.#
##..............#
###.###.###.#####
#.r.#.....#.....#
#..P#.....#...Op#
#....*....#...-.#
#######.#######&#
#######..RM.....#
#######...###.#.#
#######...#...#|#
###############E#
#################
`}];var Wo=[{id:"ch6-1",text:`title: The Teleport
intro: The way out lies in a sealed hall. Two teleports join it to the rest: step into the one in the south hall and you step out of the other, still walking the way you went in.

###########
#P....#..E#
#.##..#...#
#..#..#@..#
#..#..#####
#...M.@####
###########
`},{id:"ch6-2",text:`title: Where He Cannot Follow
intro: The short way round to the gate runs past the beast. To him the two teleports are wall: go through, and he is left behind.

##########
#E...##..#
#.M#...@.#
##...#..##
#....##..#
#.....@..#
######..P#
##########
`},{id:"ch6-3",text:`title: Through the Fold
intro: A block goes through a teleport as you do. Of the two teleports, push it into the one in the west hall, and it comes out of the other into the pool beyond and fills it.

###########
#P...##E..#
#....##.#.#
#..O.@#.#.#
#.###.#.#.#
#.M...#@~.#
###########
`},{id:"ch6-4",text:`title: The Driven Fold
intro: Three teleports, each sending you out of the next along, counting left to right and top to bottom. Force floors drive you round the middle; the suction boots in the south let you walk them as you please. Three relics.

############
#..........#
#........@.#
#..#..P..*##
#.#...*...##
#.#>>>v...@#
#...#.v....#
##.##u<<<..#
##.@####...#
#M....*##|E#
############
`},{id:"ch6-5",text:`title: The Drowned Fold
intro: Three teleports, and each sends you out of the next along, counting left to right and top to bottom. Flippers lie by the southern pool; a block waits in the north, by the beast and the first of two relics.

############
#...#M*.~~.#
#...O..#~~.#
#@..##.##@.#
#..#*......#
#..##@###.##
#P.##.....##
#.~~##.##..#
##~~f..##..#
##.......|E#
############
`},{id:"ch6-6",text:`title: The Burning Fold
intro: Three teleports stand together in the west, each sending you out of the next along. Fire burns in two places, and boots lie just past the teleports; the button in the west opens the toggle walls, and shuts them again.

############
#.........M#
#..P..FFF..#
##.........#
##.@@....T.#
#..@.h#...##
#...._##..##
#.FF....T#.#
##*#...#...#
#.#..*.#.|E#
############
`},{id:"ch6-7",text:`title: The Frozen Fold
intro: Two teleports join the northeast to the middle. Ice lies in the northwest and across the south, and skates lie in the east; three relics, and a pop-up wall that rises behind you once you have crossed it.

############
#..#*###..##
#.==.###...#
#.==.###@###
##...@...###
#.;......#.#
#...#*.#P..#
#..===..k..#
#...#..*.###
#E|##.M..###
############
`},{id:"ch6-8",text:`title: The Far Gate
intro: Two teleports, ice in the north and the south, skates by the start, and a pop-up wall in the middle hall. Three relics, and the gate lies in the far southwest.

############
#..#.......#
#....#@.##P#
#..=====#k.#
#.....;....#
#*.........#
##.......*.#
#..@.......#
#.M..=====.#
#E|.#*##..##
############
`},{id:"ch6-9",text:`title: The Workshop
intro: Three teleports, each sending you out of the next along. Force floors run down the north hall, and suction boots lie in the south; four relics. Off the quick way a page waits, and a memory of the sky.
pages: ch6-sky

############
#.P..>>>v.*#
#.......v..#
#....p*.v###
#.......<<##
#.##.M...###
##.@.#...@.#
#.@..##....#
##..*u#....#
#....#*.#|E#
############
`},{id:"ch6-10",text:`title: The Heart of the Fold
intro: The folds end at the gate. Three teleports, fire and the boots for it, the toggle walls and their button, and a red key in the south for the door to the last relic. Off the quickest way, a page waits, and a memory of the man who folded these halls.
pages: ch6-arts

############
#.........##
##.P..FFF.M#
##.....@...#
##..@....T##
#..@.h#...##
#...._##..##
#.FF....T..#
##*#..*#...#
###*R#.#...#
#.##.###.#.#
#r.........#
#.##p.##.|E#
############
`}];var jo=[{id:"ch7-1",text:`title: The Bronze Ball
intro: One bronze ball rolls along the hall between you and the way out, straight ahead, and turns back at each end. Touch it and it costs a heart: step into the niche off the hall and let it roll past.
facing: right

############
#........M.#
#.########.#
#......o...#
#P##.####.E#
############
`},{id:"ch7-2",text:`title: The Ball and the Beast
intro: The beast's one way out of his hall is the passage where one bronze ball rolls up and down. Neither can pass the other: while it rolls there, he stays in.
facing: down

############
#..P......E#
######o#####
######.#####
#####..#####
#.......M..#
############
`},{id:"ch7-3",text:`title: The Rolling Button
intro: One bronze ball rolls in a sealed hall in the north, over a button. Each time it passes, the toggle wall in your way opens or shuts: watch it, and go through while the way is open.
facing: right

############
#o...._....#
############
##...T..####
#P.###M....#
##........E#
############
`},{id:"ch7-4",text:`title: The Frozen Round
intro: Ice runs across the north hall, with skates above it. A snare waits in the west by a block, and the brown button in the south looses it; one bronze ball rolls along the south hall. Two relics.
facing: right

############
####P#######
##...###k###
##.=====.###
##.#&...*.##
##..O###...#
##...M##...#
##...o.....#
##.*#......#
#####..-.|E#
############
`},{id:"ch7-5",text:`title: The Sunken Round
intro: Three teleports, each sending you out of the next along, counting left to right and top to bottom. Pools lie in the northeast and the southwest, with flippers between; a block waits in the southeast, and one bronze ball rolls along the middle hall. Two relics.
facing: right

############
#P#@.#...*##
#....#..~~##
#....#*.~~##
#..###.#####
##..o.M...##
#..f......##
#~~.......##
#.~....#O@##
#E|#...@####
############
`},{id:"ch7-6",text:`title: The Burning Round
intro: Three teleports, each sending you out of the next along. Fire burns in the middle hall, with boots above it; the button in the south opens the toggle wall below the fire, and shuts it again. Two relics, and one bronze ball in the south.
facing: left

############
#P###...####
#.........##
#.........##
#..#h#....##
#..@..FF.@*#
###*#..T####
##..#....###
#.o.._...###
#@M.###..|E#
############
`},{id:"ch7-7",text:`title: The Icy Round
intro: Ice runs down the middle, a current drives west below the east room, and pop-up walls rise behind you once you leave them. Two relics, and one bronze ball in the south, where the ice will carry it.
facing: down

############
#......#####
#P.....#####
#.....######
#....=..*..#
#...;=.....#
##..;=#<<<.#
####...#...#
###......M##
###.*o..#|E#
############
`},{id:"ch7-8",text:`title: The Driven Round
intro: Currents run through these ways, and gravel lies about them: you can cross it, but the beast and the ball cannot. Suction boots in the middle let you walk the currents as you please. Three relics, and one bronze ball in the southeast.
facing: up

############
#..>>>>v####
#.P....v.###
#....#uv:..#
#...#.:....#
#.<<<<.**.##
#......^#.##
#...#..^...#
#.#..:.^.o.#
#.*.M#.^.|E#
############
`},{id:"ch7-9",text:`title: The Mirrored Round
intro: Fire burns down the west halls, with boots beside it, and pop-up walls rise behind you once you leave them. Medusa's mirror lies in the east and a honey cake by the fire; two relics, and one bronze ball in the south. Off the quick way a page waits, and a memory of the man of bronze.
pages: ch7-brazen
facing: down

############
#P##..##p###
#.##..#..###
#..#.F#..#;#
#h.;.F#...*#
#...xF...z;#
#....F.....#
##.##..#.#.#
#......o...#
#..M.....|E#
#*.........#
############
`},{id:"ch7-10",text:`title: The Last Round
intro: The rounds end at the gate. Three teleports, each sending you out of the next along; fire and the boots for it; the toggle wall and its button; and a red key in the west for the door to the last relic, in the southeast. Three relics, and one bronze ball in the north hall. Off the quickest way a page waits, and a memory of how the bronze guard fell.
pages: ch7-vein
facing: up

################
#P...o#........#
#.....#........#
#.#...@...###.p#
#...###...###..#
#...#h....FF...#
#...#*#....#.#.#
#..T._......@..#
#..#.##......###
#...r#...M...#*#
#.@###.FF*..R..#
#E|######...####
################
`}];var Ho=[{id:"ch8-1",text:`title: The Harpy
intro: One Harpy flies the halls ahead, straight on, and turns left at every wall that stops it. Touch it and it costs a heart: wait in the niche while it passes, and keep clear of the beast.
facing: right

############
#..##......#
#...#.####.#
#....#####.#
###.#P####.#
###.#.####.#
###w.......#
#.####...###
#..M......E#
############
`},{id:"ch8-2",text:`title: Over the Water
intro: One Harpy flies up and down the pool in the north, where you cannot swim, and each time it crosses the button there the toggle wall opens or shuts. Go through while it is open, and let it shut on the beast behind you.
facing: left

############
#w~~~_~~~~##
####P#...###
#.##.##...##
#M.#..#...##
#......T...#
#....####..#
#########.E#
############
`},{id:"ch8-3",text:`title: Talos's Fire
intro: Talos's fire runs up and down the burning hall, through the flames as if they were floor. The fire boots carry you over the flames, but not past it: cross when it has gone by.
facing: up

############
#h.P##.F####
#.#....F####
#.##...F####
#.###..e.###
#...##.F.M.#
##.....F...#
##.#..#F.#E#
############
`},{id:"ch8-4",text:`title: The Storm Pool
intro: A pool fills the middle, with flippers by your start. One Harpy flies back and forth in the west, and the button in the north opens and shuts the toggle wall in the south.
facing: down

############
####._.....#
#..###....##
#.w.##~~~###
###.#~~.~~##
##...~.~~..#
#.Pf#.~~~..#
#...#..#..##
#..###.#####
#..T..M...E#
############
`},{id:"ch8-5",text:`title: The Burning Court
intro: Fire rings the court in the middle, with boots in the west. Talos's fire runs the halls of the southwest, turning right at every wall, and a red key in the north opens the red door by the way out.
facing: left

############
###.....P..#
#...##.r...#
##........##
###.FFFFF.##
#.#.F...F.##
#h#.FFFFF.##
#.#..###.###
#..e.###.#R#
##...M....E#
############
`},{id:"ch8-6",text:`title: Harpies on the Ice
intro: Ice runs down the west and the middle, with skates by it. Two Harpies fly here, one in the northeast and one in the south. Two relics.
facing: right right

############
#P..==.*...#
###.==###..#
#.#.==.##w##
#..*...##..#
######...###
#...#..==###
#.###k.==M##
#..###..#..#
###.###w#.|E
############
`},{id:"ch8-7",text:`title: The Frozen Line
intro: A line of ice runs down the middle, with skates beside it and a block in the north. Talos's fire runs the southwest, turning right at every wall.
facing: down

############
####...=O..#
#......=...#
##P....=...#
######.....#
####..k=..##
####...=..##
###....=..E#
#e.....=...#
#...M##.#.##
############
`},{id:"ch8-8",text:`title: The Snared Wing
intro: Two teleports, one sending you out of the other; a snare in the north, loosed by the brown button below it; and one Harpy in the east. Two relics.
facing: right

############
#.P.#...#..#
#.#.#&..#..#
#.#.@.#...##
#....##.*###
#...-.....##
####..###..#
#*....M.##w#
#.##.@...#.#
#.........E#
############
`},{id:"ch8-9",text:`title: The Crossing Winds
intro: Currents run along the north hall, with suction boots at their end, and gravel lies in the west: you can cross it, but the beast cannot. Fire burns in the east, and Talos's fire runs the halls beside it; one Harpy flies the southwest. Off the quick way a page waits, and a memory of whom the Harpies were named for.
pages: ch8-storm
facing: down left

############
#..P..>>>u.#
#:####.#.#.#
#.####..#..#
#.###p.###.#
#..:##...FF#
#.#.#.###.F#
#...#...e.F#
#...w...##.#
#...#..M..E#
############
`},{id:"ch8-10",text:`title: The Last Wind
intro: The den ends at the gate in the east. Two Harpies ride the winds across both ways south, and Talos's fire runs a shaft of fire across the hall below them. The beast keeps the south. Three relics. Off the quickest way a page waits, and a memory of how the bronze guard fell.
pages: ch8-lead
facing: right left down

###############
#######p#######
#######.#####P#
##*...........#
####.#####.##.#
###w.~~#~~.w###
####.#####.####
#.....#e##....#
#.##.......##.#
#.##..#F#.###.#
#.#######...#.#
#*.....*...M#|E
###############
`}];var Go=[{id:"ch9-1",text:`title: The Thief
intro: A thief waits beside you: step on it and it takes all your gear. Take the flippers first, then go round the thief, over the top, and swim the pool to the way out. Keep clear of the beast.

###########
##....#####
#..P$....##
#....##..##
#..f..#...#
#..#..#...#
#.........#
#..###M~~~#
#######~~E#
###########
`},{id:"ch9-2",text:`title: The Bomb
intro: A bomb lies in the hall to the way out: step on it and it bursts, for a heart. Push the block along the hall onto it, and both are gone. The beast never steps on a bomb.

###########
#..O...!.E#
#...P##.M.#
#.#####...#
#.###.....#
#.........#
###########
`},{id:"ch9-3",text:`title: The Clone Machine
intro: A clone machine stands by the moat, its red button above it. Step on the button and the machine makes a block; push the block into the water and cross on the dirt it leaves.
machines: block-right

###########
##.......##
##+...P...#
#C......#M#
#~~~~~~~~~#
#........E#
###########
`},{id:"ch9-4",text:`title: The Thief's Pool
intro: A pool fills the west, and the flippers lie by your start. A thief stands among the relics in the middle: step on it and the flippers are gone. Gravel in the north keeps the beast back, and a block waits beside it. Three relics.

############
##.#####.P##
#..:.......#
#..O#...#f.#
##*.....##.#
#~~~..*.$*.#
#~~~.......#
#..M##.###.#
##..#..#...#
#...#..#...#
#..........#
####E#######
`},{id:"ch9-5",text:`title: The Powder Store
intro: Two bombs guard the doorways, and a block waits in the north hall. The button in the middle opens and shuts the toggle wall to the west. Two relics.

############
###.#...P..#
#....!O....#
#.###...##.#
#*..#...##.#
#...T...#..#
##.##._....#
##..##.##.##
#.....M.#..#
E....!.....#
##..#*.....#
############
`},{id:"ch9-6",text:`title: The Copying Bench
intro: The red button by your start makes the clone machine below it turn out a block. A snare waits in the north hall, loosed by the brown button in the southwest. Two relics.
machines: block-up

############
#.P..#.#...#
#.+........#
#.....&#...#
##C#.####*##
#......#...#
E..#.......#
#.####.##.##
#-.....#.M.#
#..#...#...#
#..#..*..###
############
`},{id:"ch9-7",text:`title: Stolen Skates
intro: Ice fills the room in the northeast, with the skates and a block in the south. A thief waits in the ice room's doorway, and a red key opens the red door on the way out. Three relics.

############
#.....*#===#
##..##..===#
##M....#===#
##..###..###
E...#*##$..#
#...R.....*#
##.r#.##...#
##..#..#...#
#..P#..#kO.#
##.....#...#
############
`},{id:"ch9-8",text:`title: The Bronze Copies
intro: The red button in the northwest wakes the clone machine in the east, which makes bronze balls. Two teleports, one sending you out of the other, and a bomb by the button. Two relics.
machines: ball-up

############
#...#..#...#
#@+.#..#...#
#..!#..#.*.#
#.#.#*.#...#
#...#..#...#
#..P#.###..#
##.##.###.C#
##.....#@M.#
#...#......#
##..#..#...E
############
`},{id:"ch9-9",text:`title: The Backward Tracks
intro: Water fills the northwest, and a thief waits in its doorway: step on it and it takes your flippers. Gravel lies by your start, one Harpy flies the south hall, and a block waits in the southeast. Two relics. Off the quick way a page waits, and a memory of the oldest thief's trick.
pages: ch9-tracks
facing: left

############
#~~~#.P:.*.#
#~~~#..#...#
#~~~$..#...#
##.##..#.###
#..*#......#
#...#f.....#
##.#######.#
#...#w.....#
#p.....#O..#
#.M.#..#...#
########E###
`},{id:"ch9-10",text:`title: The Last Bench
intro: The workshop ends at the gate in the west. The red button in the east wakes the clone machine above it, one Harpy flies the north room, and the beast waits in the northwest. Three relics. Off the quick way a page waits, and a memory of the man who built this place.
pages: ch9-inventor
facing: down
machines: block-right

###############
#Mp.#*..#.....#
#.......#..#..#
#...#w..#..C..#
#E|.#####.##..#
#.......#..#..#
#...#......#+.#
#*..#...#.....#
#####.#######.#
#...#.......*.#
#...#...#.....#
#.......#....P#
#...#...#....##
###############
`}];var _o=[{id:"ch10-1",text:`title: The Wooden Cow
intro: Daedalus's wooden cow lies beside you: set it down and the beast goes to it, not to you. A snare waits in the top hall, with no button to loose it. Lead him round to it.

###########
#cP..&....#
#.###.##..#
#...#.#...#
#...#.#.#.#
#.#.....#.#
#.#######.#
#.....M..E#
###########
`},{id:"ch10-2",text:`title: The Mirror and the Fire
intro: Medusa's mirror lies in the south: hold it up and the beast turns to stone for three turns. Talos's fire runs its round in the west, and the mirror never stills it.
facing: down

###########
#e..M.#...#
#.##..###.#
#.#.P.....#
#.#.#####.#
#...#.....#
###.#z###.#
#.......#E#
###########
`},{id:"ch10-3",text:`title: The Fold and the Bomb
intro: A bomb waits by the way out. Push the block into the teleport in the south: it comes out of the one in the north and rolls on, onto the bomb.

###########
#..@.....!#
#M#####.#E#
#....P#.#.#
#####.#...#
#.........#
#.#########
#......O.@#
###########
`},{id:"ch10-4",text:`title: The Snared Hall
intro: A snare holds the doorway to the southwest room, gravel the way east, and the wooden cow waits in the north room. Two relics.

############
#.......#..#
#...c......#
####.##.#.##
E....#..#..#
#....#P.:..#
#....#..#..#
####.#####.#
#....#...*.#
#....#.....#
#....&*..M.#
############
`},{id:"ch10-5",text:`title: Talos's Round
intro: A fire room lies west of your start, with the fire boots below it and Medusa's mirror beyond. Talos's fire runs the northwest. Two relics.
facing: down

############
#..#FFF#...#
##z.FFFP...#
#e.#FFF#...#
##.#######.#
#......#...#
##h#......*#
#..#...#...#
#..###.#####
#..#M......#
#....*.....#
####E#######
`},{id:"ch10-6",text:`title: The Robbed Ice
intro: Ice runs down the north, with the skates below it, and a thief waits beside your start. A snare holds the doorway to the west room; the brown button by the ice looses it. A block waits by the thief. Two relics.

############
#*#..==#.M.#
#....==#...#
##...==#...#
#....==..-##
#...#k######
#...#...*..#
##&##......#
##.#..##...E
#...#.P.$O.#
#.#........#
############
`},{id:"ch10-7",text:`title: The Powder Fold
intro: Two teleports, one sending you out of the other. A bomb waits by the way out in the west, and a block in the southeast. Three relics.

############
#..........#
##.M....##*#
#####...####
#P.##....#.#
#..*.......#
##.##.####@#
#@..#...#..#
#...##...*.#
E!.......O.#
###.....#..#
############
`},{id:"ch10-8",text:`title: The Rising Wings
intro: Currents run down the northwest room, with the suction boots below them, and a thief waits in the west doorway. One Harpy flies the middle room, and a pop-up wall stands beside your start. Three relics.
facing: left

############
#>>.....##.#
#>>###..#*.#
#>>........#
#.u##.####.#
#..#...M...#
#..#.w.##..#
#*$##.##.###
#..#.*..;P.#
#..#....#..#
#.......#..#
#######E####
`},{id:"ch10-9",text:`title: The Last Part
intro: The wooden cow lies by your start, and a snare holds the west doorway, loosed by the brown button in the north. The red button beside it wakes the clone machine in the south, which makes blocks. Three relics. Off the quick way a page waits, and a memory of how the old book ends the story.
pages: ch10-last-part
machines: block-up

############
#..*..+.M..#
#...#..-...#
#&####.#.###
#......#..*#
#...#p.#*..#
#..##......#
#...####C#.#
#.....c...P#
E...#......#
#...#......#
############
`},{id:"ch10-10",text:`title: The Open Space
intro: The beast waits in the southeast room. Medusa's mirror lies by your start, the wooden cow in the northwest room, and a snare in the middle hall, loosed by the brown button beside the cow. Three relics, and the way out is through the gate in the north. Off the quick way a page waits, and a memory of how the poet ends the story.
pages: ch10-oak

#################
#....p#...#.E...#
#...........|#..#
#.##.######..##.#
#.c#..#*.....#..#
#..#-.#...#..#*.#
#..######.#.##..#
#...............#
##.#..###.#.#####
#.....#.....&#..#
#z..P.#...#*..M.#
##.####...#..#..#
#..#......#..#..#
#..#......#..#..#
#################
`}];var Jr=[...Fo,...Do,...Io,...Bo,...$o,...Wo,...jo,...Ho,...Go,..._o];function Ko(){return Jr.map(e=>J(e.text))}var Vr=Po({post:e=>self.postMessage(e),bank:Co,known:()=>Ao(Ko()),now:()=>performance.now()});self.onmessage=e=>Vr.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
