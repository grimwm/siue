"use strict";(()=>{var j=["up","down","left","right"],G={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},ce=["red","blue","yellow","green"],Rt=["flippers","fire-boots","skates","suction"],et={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},W=(e,t,o,n={},s,r=t)=>({char:e,minotaur:t,block:o,hazard:r,...n,sprites:s??[]}),F={floor:W(".",!0,!0,{},["floor"]),wall:W("#",!1,!1,{},["wall"]),exit:W("E",!1,!1,{},["exit"]),gate:W("|",!1,!1,{},["gate-closed","gate-open"]),water:W("~",!1,!0,{needs:"flippers"},["water"]),fire:W("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:W("=",!0,!0,{slides:"skates"},["ice"]),"force-up":W("^",!0,!0,{carries:"up"},["force-up"]),"force-down":W("v",!0,!0,{carries:"down"},["force-down"]),"force-left":W("<",!0,!0,{carries:"left"},["force-left"]),"force-right":W(">",!0,!0,{carries:"right"},["force-right"]),dirt:W("%",!0,!0,{},["dirt"]),safe:W("S",!1,!1,{},["safe"]),button:W("_",!0,!0,{},["button"]),"toggle-open":W("t",!0,!1,{},["toggle-open"]),"toggle-closed":W("T",!1,!1,{},["toggle-closed"]),"door-red":W("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":W("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":W("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":W("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:W("&",!0,!0,{},["trap"]),"button-brown":W("-",!0,!0,{},["button-brown"]),"button-red":W("+",!0,!0,{},["button-red"]),popup:W(";",!1,!1,{},["popup"]),gravel:W(":",!1,!1,{},["gravel"]),"fake-wall":W("W",!1,!1,{},["wall"]),"invisible-wall":W("I",!1,!1,{},["floor"]),teleport:W("@",!1,!1,{},["teleport"]),thief:W("$",!0,!0,{},["thief"]),bomb:W("!",!1,!0,{},["bomb"],!0),clone:W("C",!1,!1,{},j.map(e=>`clone-${e}`))},oe={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var Re={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:et.mirror.name},cake:{char:"x",sprite:"cake",name:et.cake.name},cow:{char:"c",sprite:"cow",name:et.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},Uo=["theseus","minotaur","minotaur-stone","cow-standing"],qo=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],Qr=[...new Set([...Object.values(F).flatMap(e=>e.sprites),...qo,...Object.values(Re).map(e=>e.sprite),...Uo,...Object.values(oe).map(e=>e.sprite)])];var Q=class extends Error{line;col;constructor(t,o,n){super(`line ${t}, column ${o}: ${n}`),this.line=t,this.col=o}},Yo=new Map(Object.entries(F).map(([e,t])=>[t.char,e])),Zo=new Map(Object.entries(Re).map(([e,t])=>[t.char,e])),Xo=/^[a-z0-9-]+$/,Jo=/^([a-z]+): (.*)$/,Vo=new Map(Object.entries(oe).map(([e,t])=>[t.char,e])),Qo=["block","ball","glider","fireball"],er=["title","intro","hearts","relics","pages","facing","machines"];function tr(e,t){let o=e&&e.value!==""?e.value.split(" "):[],n=e??{line:1,col:1},s=new Set;for(let r of o){if(!Xo.test(r))throw new Q(n.line,n.col,`page id '${r}' must be lower-case letters, digits and hyphens`);if(s.has(r))throw new Q(n.line,n.col,`page '${r}' named twice`);s.add(r)}if(o.length>31)throw new Q(n.line,n.col,"a level holds at most 31 pages");if(o.length!==t)throw new Q(n.line,n.col,`pages: ${o.length} named but the grid has ${t}`);return o}function zt(e,t,o,n,s){let r=t&&t.value!==""?t.value.split(" "):[],a=t??{line:1,col:1};for(let i of r)if(!n(i))throw new Q(a.line,a.col,`${e}: '${i}' is not ${s}`);if(r.length!==o)throw new Q(a.line,a.col,`${e}: ${r.length} named but the grid has ${o}`);return r}function or(e){let t={},o=e.indexOf("trap"),n=e.indexOf("clone"),s=-1,r=-1;for(let a=e.length-1;a>=0;a--){let i=e[a];if(i==="button-brown"){let l=s>=0?s:o;l>=0&&(t[a]=l)}else if(i==="button-red"){let l=r>=0?r:n;l>=0&&(t[a]=l)}else i==="trap"?s=a:i==="clone"&&(r=a)}return t}function J(e){let t=e.replace(/\r\n/g,`
`).split(`
`),o={},n=0;for(;n<t.length;n++){let w=Jo.exec(t[n]);if(!w)break;if(!er.includes(w[1]))throw new Q(n+1,1,`unknown header '${w[1]}'`);o[w[1]]={value:w[2],line:n+1,col:w[1].length+3}}for(;n<t.length&&t[n]==="";)n++;let s=n,r=[];for(;n<t.length&&t[n]!=="";n++)r.push(t[n]);if(r.length===0)throw new Q(s+1,1,"no grid");for(;n<t.length;n++)if(t[n].trim()!=="")throw new Q(n+1,1,"text after the grid");let a=r[0].length,i=[],l=[],c=null,h=null,f=0,d=[],u=[],p=[];if(r.forEach((w,A)=>{let z=s+A+1;if(w.length!==a)throw new Q(z,1,`row is ${w.length} wide, expected ${a}`);[...w].forEach((M,y)=>{let b=y+1;if(M==="P"||M==="M"){if(M==="P"&&c)throw new Q(z,b,"second player");if(M==="M"&&h)throw new Q(z,b,"second Minotaur");M==="P"?c={r:A,c:y}:h={r:A,c:y},i.push("floor"),l.push(null);return}let P=Vo.get(M);if(P){u.push({kind:P,at:{r:A,c:y}}),i.push("floor"),l.push(null);return}let I=Yo.get(M),$=Zo.get(M);if(!I&&!$)throw new Q(z,b,`unknown tile '${M}'`);i.push(I??"floor"),l.push($??null),$==="relic"&&f++,I==="clone"&&p.push({r:A,c:y}),$==="page"&&d.push(A*a+y)})}),!c)throw new Q(s+1,1,"no player");let m=(w,A,z,M)=>{let y=o[w];if(!y)return A;let b=Number(y.value);if(!Number.isInteger(b)||b<z)throw new Q(y.line,y.col,`${w} must be ${z} to ${M}`);if(b>M){let P=w==="relics"?`relics: ${y.value} but the grid has ${M}`:`${w} must be ${z} to ${M}`;throw new Q(y.line,y.col,P)}return b},T=m("hearts",3,1,99),g=m("relics",f,0,f),E=tr(o.pages,d.length),v=zt("facing",o.facing,u.length,w=>j.includes(w),"a direction"),k=u.map((w,A)=>({...w,dir:v[A],home:A})),D=zt("machines",o.machines,p.length,w=>{let[A,z]=w.split("-");return Qo.includes(A)&&j.includes(z)&&w.split("-").length===2},"a template and a direction like block-up"),L=k.length,H=p.map((w,A)=>{let[z,M]=D[A].split("-"),y={at:w,template:z,dir:M};return z==="block"?y:{...y,home:L++}});return{title:o.title?.value??"",intro:o.intro?.value??"",hearts:T,relics:g,pageIds:E,pageCells:d,rows:r.length,cols:a,terrain:i,objects:l,player:c,minotaur:h,hazards:k,machines:H,links:or(i)}}function Se(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let t=e.objects.filter(r=>r==="relic").length,o=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&o.push(`hearts: ${e.hearts}`),e.relics!==t&&o.push(`relics: ${e.relics}`),e.pageIds.length>0&&o.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&o.push(`facing: ${e.hazards.map(r=>r.dir).join(" ")}`),e.machines.length>0&&o.push(`machines: ${e.machines.map(r=>`${r.template}-${r.dir}`).join(" ")}`);let n=new Map(e.hazards.map(r=>[r.at.r*e.cols+r.at.c,r.kind])),s=[];for(let r=0;r<e.rows;r++){let a="";for(let i=0;i<e.cols;i++){let l=r*e.cols+i;e.player.r===r&&e.player.c===i?a+="P":e.minotaur&&e.minotaur.r===r&&e.minotaur.c===i?a+="M":n.has(l)?a+=oe[n.get(l)].char:a+=e.objects[l]?Re[e.objects[l]].char:F[e.terrain[l]].char}s.push(a)}return`${o.join(`
`)}

${s.join(`
`)}
`}function Ot(e){let t=0;for(let o of e.objects)o==="cake"&&t++;return e.hearts+t}function se(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var re=(e,t)=>t.r>=0&&t.c>=0&&t.r<e.rows&&t.c<e.cols,O=(e,t)=>t.r*e.level.cols+t.c;var K=(e,t)=>!!t&&e.r===t.r&&e.c===t.c,V=(e,t)=>({r:e.r+G[t][0],c:e.c+G[t][1]}),tt=e=>e.relicsLeft===0;var ze=e=>({...e,terrain:[...e.terrain],objects:[...e.objects],keys:{...e.keys},tools:{...e.tools},gear:[...e.gear],hazards:e.hazards.length>0?[...e.hazards]:e.hazards}),Y=(e,t)=>re(e.level,t)?e.terrain[O(e,t)]:"wall",ie=(e,t)=>re(e.level,t)?e.objects[O(e,t)]:null;var ue=(e,t)=>e.hazards.length>0&&e.hazards.some(o=>K(t,o.at));function Oe(e,t){e.terrain=e.terrain.map(o=>o==="toggle-open"?"toggle-closed":o==="toggle-closed"?"toggle-open":o),t.push({kind:"flipped"})}var Pt=new WeakMap;function Dt(e){let t=Pt.get(e);return t||(t=e.terrain.flatMap((o,n)=>o==="teleport"?[n]:[]),Pt.set(e,t)),t}var Ft=e=>Dt(e).length>1;function ot(e,t,o,n){let{cols:s}=e.level,r=Dt(e.level),a=t.r*s+t.c,i=r.findIndex(l=>l>a);for(let l=0;l<r.length;l++){let c=r[((i<0?0:i)+l)%r.length];if(c===a)continue;let h={r:Math.floor(c/s),c:c%s},f=V(h,o);if(Y(e,f)!=="teleport"&&n(f))return{via:h,to:f}}return null}var Ct=new WeakMap;function rr(e){let t=Ct.get(e);if(!t){let o=new Map;for(let[n,s]of Object.entries(e.links)){if(e.terrain[s]!=="trap")continue;let r=o.get(s);r?r.push(Number(n)):o.set(s,[Number(n)])}t=o,Ct.set(e,t)}return t}function nr(e,t){let o=rr(e.level).get(t);if(!o)return!1;let{cols:n}=e.level;return o.some(s=>{let r={r:Math.floor(s/n),c:s%n};return K(r,e.player)||ie(e,r)==="block"||ue(e,r)})}var te=(e,t)=>Y(e,t)==="trap"&&!nr(e,t.r*e.level.cols+t.c);function Bt(e,t,o){if(!re(e.level,o))return!1;let n=Y(e,o);return F[n].hazard||oe[t].crosses===n}var Pe=(e,t,o)=>Bt(e,t,o)&&!ie(e,o)&&!K(o,e.minotaur)&&!K(o,e.cow)&&!ue(e,o),Ce=(e,t,o)=>K(o,e.player)?Bt(e,t,o):Pe(e,t,o);function rt(e,t,o,n,s=!1){let r=e.hazards[t],a=Y(e,r.at);return a==="bomb"?(e.terrain[O(e,r.at)]="floor",e.hazards.splice(t,1),o.push({kind:"exploded",who:"hazard",at:r.at}),"gone"):(a==="button"?Oe(e,o):a==="button-red"&&De(e,O(e,r.at),o,n,s),te(e,r.at)&&o.push({kind:"held",who:"hazard",at:r.at}),"on")}function De(e,t,o,n,s=!1){let r=e.level.links[t];if(r===void 0)return;let a=e.level.machines.find(h=>O(e,h.at)===r),i=V(a.at,a.dir);if(n&&K(i,n))return;if(a.template==="block"){if(!Fe(e,i))return;e.objects[O(e,i)]="block",o.push({kind:"cloned",what:"block",at:i}),nt(e,i,a.dir,n,o,s);return}if(!Pe(e,a.template,i)||K(i,e.player))return;let l={kind:a.template,at:i,dir:a.dir,home:a.home};e.hazards.length===0&&(e.hazards=[]);let c=e.hazards.length;if(!s){let h=O(e,i);for(;c>0&&O(e,e.hazards[c-1].at)>h;)c--}e.hazards.splice(c,0,l),o.push({kind:"cloned",what:a.template,at:i}),rt(e,c,o,n,s)}function sr(e,t){let o=e.hazards[t];if(o)return o.at;let n=e.machines.find(s=>s.home===t);return V(n.at,n.dir)}function st(e,t,o){Y(e,t)==="popup"&&(e.terrain[O(e,t)]="wall",o.push({kind:"rose",at:t}))}var ar=(e,t,o)=>Pe(e,t,o)&&Y(e,o)!=="bomb"&&!K(o,e.player);function ir(e,t,o){let n=sr(e.level,o),s=new Set([O(e,n)]),r=[n];for(;r.length>0;){let a=r.filter(l=>ar(e,t,l)).sort((l,c)=>O(e,l)-O(e,c));if(a.length>0)return a[0];let i=[];for(let l of r)for(let c of j){let h=V(l,c);!re(e.level,h)||s.has(O(e,h))||(s.add(O(e,h)),i.push(h))}r=i}return null}function It(e,t,o){let n=e.hazards.findIndex(a=>K(t,a.at));if(n<0)return;let s=e.hazards[n];e.hazards.splice(n,1);let r=ir(e,s.kind,s.home);r&&(e.hazards.push({...s,at:r}),e.hazards.sort((a,i)=>O(e,a.at)-O(e,i.at))),o.push({kind:"sent-home",from:t,to:r})}function me(e,t,o,n){if(e.hearts--,t.push(n?{kind:"caught",at:e.player,hearts:e.hearts,by:o,hazard:n}:{kind:"caught",at:e.player,hearts:e.hearts,by:o}),e.hearts<=0){e.outcome="lost",t.push({kind:"lost"});return}st(e,e.player,t),e.player=e.throwBack;let s=null;K(e.player,e.minotaur)&&(s=e.level.minotaur,e.minotaur=s,K(s,e.cow)&&(e.cow=null)),It(e,e.player,t),s&&It(e,s,t)}function Be(e,t){if(e.outcome!=="playing")return!0;for(let o=0;o<t.length;o++)if(t[o].kind==="caught")return!0;return!1}function $t(e,t){return re(e.level,t)&&F[Y(e,t)].minotaur&&ie(e,t)!=="block"&&!ue(e,t)}function Wt(e,t,o){return e.minotaur=t,te(e,t)&&o.push({kind:"held",who:"minotaur",at:t}),K(t,e.cow)&&(e.cow=null),K(t,e.player)?(me(e,o,"minotaur"),!0):!1}function lr(e,t){let o=e.minotaur;if(!o)return!0;if(te(e,o))return!1;let n=e.cow??e.player,s=Math.sign(n.c-o.c),r=Math.sign(n.r-o.r),a=[];s&&a.push(s>0?"right":"left"),r&&a.push(r>0?"down":"up");let i=a.find(f=>$t(e,V(o,f)));if(!i)return!1;let l=V(o,i);if(t.push({kind:"moved",who:"minotaur",from:o,to:l}),Wt(e,l,t))return!0;let c=i,h=new Set([O(e,l)]);for(;;){let f=F[Y(e,e.minotaur)];if(f.carries)c=f.carries;else if(!f.slides)return!1;let d=V(e.minotaur,c);if(!$t(e,d)||h.has(O(e,d)))return!1;if(t.push({kind:"slid",who:"minotaur",from:e.minotaur,to:d}),h.add(O(e,d)),Wt(e,d,t))return!0}}function jt(e,t){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let o=0;o<2&&e.outcome==="playing";o++)if(lr(e,t))return}}var cr={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function hr(e,t,o){return K(e.hazards[t].at,e.player)?(K(e.player,e.cow)&&(e.cow=null),me(e,o,"hazard",e.hazards[t].kind),"caught"):rt(e,t,o,void 0,!0)}function ur(e,t,o){let n=e.hazards[t];if(te(e,n.at))return"on";let s=n.dir;if(!Ce(e,n.kind,V(n.at,s))){s=void 0;for(let i of oe[n.kind].turns){let l=cr[i][n.dir];if(Ce(e,n.kind,V(n.at,l))){s=l;break}}}if(!s)return"on";let r=V(n.at,s);o.push({kind:"moved",who:"hazard",hazard:n.kind,from:n.at,to:r});let a=null;for(;;){n=e.hazards[t]={...n,at:r,dir:s};let i=hr(e,t,o);if(i!=="on")return i;let l=F[Y(e,r)];if(l.carries)s=l.carries,n.dir!==s&&(n=e.hazards[t]={...n,dir:s});else if(!l.slides)return"on";a??=new Set([O(e,r)]);let c=V(r,s);if(a.has(O(e,c))||!Ce(e,n.kind,c))return"on";o.push({kind:"slid",who:"hazard",hazard:n.kind,from:r,to:c}),a.add(O(e,c)),r=c}}function Gt(e,t){if(e.hazards.length!==0){for(let o=0,n=e.hazards.length;o<n;){let s=ur(e,o,t);if(s==="caught")break;s==="gone"?n--:o++}e.hazards.sort((o,n)=>O(e,o.at)-O(e,n.at))}}function Fe(e,t){return re(e.level,t)&&F[Y(e,t)].block&&!ie(e,t)&&!K(t,e.player)&&!K(t,e.minotaur)&&!K(t,e.cow)&&!K(t,e.throwBack)&&!K(t,e.level.minotaur)&&!ue(e,t)}function it(e,t,o,n){let s=V(t,o);if(Y(e,s)!=="teleport")return Fe(e,s)&&n(s)?{entry:s,to:s}:null;if(K(s,e.player))return null;let r=ot(e,s,o,a=>Fe(e,a)&&n(a));return r&&{entry:s,via:r.via,to:r.to}}function _t(e,t,o,n,s){e.objects[O(e,t)]=null,e.objects[O(e,o.to)]="block",s.push(n==="pushed"?{kind:"pushed",from:t,to:o.entry}:{kind:"slid",who:"block",from:t,to:o.entry}),o.via&&s.push({kind:"teleported",who:"block",from:o.entry,via:o.via,to:o.to})}function nt(e,t,o,n,s,r=!1){let a=t,i=o,l=new Set([O(e,a)]);for(n&&l.add(O(e,n));;){let c=Y(e,a);if(c==="water"||c==="bomb"){e.objects[O(e,a)]=null,e.terrain[O(e,a)]=c==="water"?"dirt":"floor",s.push(c==="water"?{kind:"sank",at:a}:{kind:"exploded",who:"block",at:a});return}c==="button"?Oe(e,s):c==="button-red"&&De(e,O(e,a),s,n,r),te(e,a)&&s.push({kind:"held",who:"block",at:a});let h=F[c];if(h.carries)i=h.carries;else if(!h.slides)return;let f=it(e,a,i,d=>!l.has(O(e,d)));if(!f)return;_t(e,a,f,"slid",s),l.add(O(e,f.to)),a=f.to}}var fr=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Kt(e,t,o,n){if(!re(e.level,t)||K(t,e.minotaur))return!1;let s=Y(e,t),r=F[s];return fr.has(s)||s==="teleport"&&!Ft(e.level)||s==="gate"&&!tt(e)||r.needs&&!e.gear.includes(r.needs)||r.door&&e.keys[r.door]<=0?!1:ue(e,t)||ie(e,t)!=="block"?!0:!n&&!te(e,t)&&!!it(e,t,o,()=>!0)}function lt(e,t,o,n,s){if(!Kt(e,t,o,n))return!1;if(ue(e,t))return me(e,s,"hazard",e.hazards.find(a=>K(a.at,t)).kind),!1;let r=F[Y(e,t)];if(r.door&&(r.door!=="green"&&e.keys[r.door]--,e.terrain[O(e,t)]="floor",s.push({kind:"opened",color:r.door,at:t})),ie(e,t)==="block"){let a=it(e,t,o,()=>!0);_t(e,t,a,"pushed",s),nt(e,a.to,o,t,s)}return!0}function ct(e,t,o,n,s){st(e,e.player,s),e.player=t;let r=Y(e,t);if(r==="bomb")return e.terrain[O(e,t)]="floor",s.push({kind:"exploded",who:"player",at:t}),me(e,s,"bomb"),!0;let a=ie(e,t);if(a&&a!=="block"&&(e.objects[O(e,t)]=null,s.push({kind:"took",what:a,at:t}),a==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):a==="page"?e.pages|=1<<e.level.pageCells.indexOf(O(e,t)):a.startsWith("key-")?e.keys[a.slice(4)]++:a==="mirror"||a==="cake"||a==="cow"?e.tools[a]++:e.gear.includes(a)||e.gear.push(a)),r==="thief"&&e.gear.length>0&&(s.push({kind:"robbed",at:t,gear:e.gear}),e.gear=[]),r==="safe"&&(e.throwBack=t),te(e,t)&&s.push({kind:"held",who:"player",at:t}),r==="button"?Oe(e,s):r==="button-red"&&De(e,O(e,t),s),r==="exit"&&tt(e)&&(e.outcome="won",s.push({kind:"won"})),r==="teleport"){let i=ot(e,t,o,l=>Kt(e,l,o,n));return i?lt(e,i.to,o,n,s)?(s.push({kind:"teleported",who:"player",from:t,via:i.via,to:i.to}),ct(e,i.to,o,n,s)):!0:!1}return!1}function dr(e,t,o){let n=t,s=new Set([O(e,e.player)]);for(;e.outcome==="playing";){let r=F[Y(e,e.player)];if(r.carries&&!e.gear.includes("suction"))n=r.carries;else if(!r.slides||e.gear.includes(r.slides))return;let a=V(e.player,n);if(s.has(O(e,a))||!lt(e,a,n,!0,o)||(o.push({kind:"slid",who:"player",from:e.player,to:a}),s.add(O(e,a)),ct(e,a,n,!0,o)))return;s.add(O(e,e.player))}}function at(e,t){if(e.length!==t.length)return!1;for(let o=0;o<e.length;o++)if(e[o]!==t[o])return!1;return!0}function pr(e,t,o){if(t.kind==="move"){let n=e.player;if(te(e,n))return!1;let s=V(n,t.dir),r=Y(e,s);if(r==="invisible-wall")return e.terrain[O(e,s)]="wall",o.push({kind:"revealed",at:s,what:r}),"shown";if(r==="fake-wall"&&(e.terrain[O(e,s)]="floor",o.push({kind:"revealed",at:s,what:r})),lt(e,s,t.dir,!1,o))o.push({kind:"moved",who:"player",from:n,to:s}),ct(e,s,t.dir,!1,o)||dr(e,t.dir,o);else if(!Be(e,o))return!1}else if(t.kind==="tool"){if(e.tools[t.tool]<=0)return!1;if(t.tool==="cake")e.hearts++;else if(t.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,o.push({kind:"stoned",turns:3});e.tools[t.tool]--}return!0}function Ht(e,t){return at(e.terrain,t.terrain)&&(e.terrain=t.terrain),at(e.objects,t.objects)&&(e.objects=t.objects),at(e.hazards,t.hazards)&&(e.hazards=t.hazards),e}function Ie(e,t){return t===e||t.moves===e.moves}function ae(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let o=ze(e),n=[],s=pr(o,t,n);if(!s)return{state:e,events:[]};if(s==="shown")return{state:Ht(o,e),events:n};let r=t.kind==="tool"&&t.tool==="mirror";return Be(o,n)||Gt(o,n),!r&&!Be(o,n)&&jt(o,n),o.moves++,{state:Ht(o,e),events:n}}var $e=["mirror","cake","cow"],fe=e=>e<=0?0:32-Math.clz32(e),Nt=new WeakMap;function le(e){let t=Nt.get(e);return t||Nt.set(e,t=gr(e)),t}function mr(e){let t=new Set,o=[],n=l=>{let c=e.terrain[l];return F[c].block||F[c].door!==void 0||c==="fake-wall"},s=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,r=(l,c)=>l>=0&&c>=0&&l<e.rows&&c<e.cols,a=l=>{t.has(l)||l===s||!n(l)||(t.add(l),o.push(l))};e.objects.forEach((l,c)=>{l==="block"&&(t.add(c),o.push(c))});for(let l of e.machines){let c=l.at.r+G[l.dir][0],h=l.at.c+G[l.dir][1];l.template==="block"&&r(c,h)&&a(c*e.cols+h)}let i=[];for(e.terrain.forEach((l,c)=>{l==="teleport"&&i.push(c)});o.length;){let l=o.pop(),c=Math.floor(l/e.cols),h=l%e.cols,f=F[e.terrain[l]],d=f.slides!==void 0||f.carries!==void 0;for(let u of j){let[p,m]=G[u],T=c+p,g=h+m;if(!r(T,g))continue;let E=c-p,v=h-m;if(!(r(E,v)&&e.terrain[E*e.cols+v]!=="wall")&&!d)continue;let D=T*e.cols+g;if(e.terrain[D]!=="teleport"){a(D);continue}for(let L of i){let H=Math.floor(L/e.cols)+p,w=L%e.cols+m;r(H,w)&&a(H*e.cols+w)}}}return t}var br={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},ht=e=>br[e]??(F[e].door!==void 0?"floor":void 0);function yr(e,t){let o=new Set(t.map(s=>oe[s].crosses)),n=[];return e.terrain.forEach((s,r)=>{let a=ht(s);(F[s].hazard||o.has(s)||s==="toggle-closed"||a&&F[a].hazard)&&n.push(r)}),n}function gr(e){let t=y=>e.objects.filter(b=>b===y).length,o=mr(e),n=[],s=[],r=[],a=[],i=[];e.terrain.forEach((y,b)=>{ht(y)?n.push(b):(y==="toggle-open"||y==="toggle-closed")&&s.push(b);let P=e.objects[b];o.has(b)?(P&&P!=="block"?i:a).push(b):P&&r.push(b)});let l=e.rows*e.cols,c=ce.map(y=>fe(t(`key-${y}`))),h=$e.map(y=>fe(t(y))),f=Rt.filter(y=>t(y)>0),d=fe(l),u=t("cow")>0,p=e.minotaur!==null,m=t("mirror")>0?2:0,T=d*(2+(p?1:0)+(u?1:0))+m,g=fe(Ot(e)),E=T+g+fe(e.relics),v=[],k=E+e.pageIds.length;for(let y of c)v.push(k),k+=y;let D=[];for(let y of h)D.push(k),k+=y;let L=[...e.hazards.map(y=>y.kind)];for(let y of e.machines)y.home!==void 0&&(L[y.home]=y.template);let H=L.length>e.hazards.length,w=H?0:e.hazards.length,A=H?yr(e,L):[],z=H?fe(4*L.length):0,M=d*(2+(p?1:0)+(u?1:0))+m+g+fe(e.relics)+e.pageIds.length+c.reduce((y,b)=>y+b,0)+h.reduce((y,b)=>y+b,0)+f.length+n.length+(s.length?1:0)+r.length+a.length+2*i.length+w*(d+2)+A.length*z;return{words:Math.max(1,Math.ceil(M/32)),cellBits:d,none:l,minotaur:p,cow:u,stoneBits:m,heartBits:g,relicBits:fe(e.relics),pageBits:e.pageIds.length,keyBits:c,toolBits:h,gear:f,heartAt:T,pageAt:E,keyAt:v,toolAt:D,gearAt:k,changing:Int32Array.from(n),toggles:Int32Array.from(s),fixed:Int32Array.from(r),blockOnly:Int32Array.from(a),blockOrObject:Int32Array.from(i),hazardSlots:w,hazardCells:Int32Array.from(A),hazardBits:z,homeKinds:L}}function Z(e,t,o,n,s){if(n===0)return o;let r=t+(o>>>5),a=o&31;return e[r]|=s<<a,a+n>32&&(e[r+1]|=s>>>32-a),o+n}function Me(e,t,o,n){if(n===0)return 0;let s=t+(o>>>5),r=o&31,a=e[s]>>>r;return r+n>32&&(a|=e[s+1]<<32-r),n===32?a>>>0:a&(1<<n)-1}var de=(e,t,o)=>t?t.r*e.level.cols+t.c:o;function we(e,t,o,n){let s=t;for(let i=0;i<s.words;i++)o[n+i]=0;let r=0;r=Z(o,n,r,s.cellBits,de(e,e.player,s.none)),r=Z(o,n,r,s.cellBits,de(e,e.throwBack,s.none)),s.minotaur&&(r=Z(o,n,r,s.cellBits,de(e,e.minotaur,s.none))),s.cow&&(r=Z(o,n,r,s.cellBits,de(e,e.cow,s.none))),r=Z(o,n,r,s.stoneBits,e.stone),r=Z(o,n,r,s.heartBits,e.hearts),r=Z(o,n,r,s.relicBits,e.relicsLeft),r=Z(o,n,r,s.pageBits,e.pages);for(let i=0;i<ce.length;i++)r=Z(o,n,r,s.keyBits[i],e.keys[ce[i]]);for(let i=0;i<$e.length;i++)r=Z(o,n,r,s.toolBits[i],e.tools[$e[i]]);for(let i of s.gear)r=Z(o,n,r,1,e.gear.includes(i)?1:0);for(let i of s.changing)r=Z(o,n,r,1,e.terrain[i]===e.level.terrain[i]?0:1);s.toggles.length&&(r=Z(o,n,r,1,e.terrain[s.toggles[0]]===e.level.terrain[s.toggles[0]]?0:1));for(let i of s.fixed)r=Z(o,n,r,1,e.objects[i]?1:0);for(let i of s.blockOnly)r=Z(o,n,r,1,e.objects[i]==="block"?1:0);for(let i of s.blockOrObject)r=Z(o,n,r,2,e.objects[i]==="block"?2:e.objects[i]?1:0);if(s.hazardSlots>1&&e.hazards.some((i,l)=>l>0&&de(e,i.at,s.none)<de(e,e.hazards[l-1].at,s.none)))throw new Error("the hazards must be sorted by cell");for(let i=0;i<s.hazardSlots;i++){let l=e.hazards.find(c=>c.home===i);r=Z(o,n,r,s.cellBits,l?de(e,l.at,s.none):s.none),r=Z(o,n,r,2,l?j.indexOf(l.dir):0)}let a=0;for(let i of s.hazardCells){let l=e.hazards[a],c=l!==void 0&&de(e,l.at,s.none)===i;r=Z(o,n,r,s.hazardBits,c?1+j.indexOf(l.dir)+4*l.home:0),c&&a++}if(s.hazardCells.length&&a!==e.hazards.length)throw new Error(`packed ${a} of ${e.hazards.length} hazards: they must be sorted by cell`)}function We(e,t,o,n,s=0){let r=o,a=0,i=w=>{let A=Me(e,t,a,w);return a+=w,A},l=w=>{let A=i(w);return A===r.none?null:{r:Math.floor(A/n.cols),c:A%n.cols}},c=l(r.cellBits),h=l(r.cellBits),f=r.minotaur?l(r.cellBits):null,d=r.cow?l(r.cellBits):null,u=i(r.stoneBits),p=i(r.heartBits),m=i(r.relicBits),T=i(r.pageBits),g={red:0,blue:0,yellow:0,green:0};ce.forEach((w,A)=>{g[w]=i(r.keyBits[A])});let E={mirror:0,cake:0,cow:0};$e.forEach((w,A)=>{E[w]=i(r.toolBits[A])});let v=[];for(let w of r.gear)i(1)&&v.push(w);let k=[...n.terrain];for(let w of r.changing)i(1)&&(k[w]=ht(n.terrain[w]));if(r.toggles.length&&i(1))for(let w of r.toggles)k[w]=n.terrain[w]==="toggle-open"?"toggle-closed":"toggle-open";let D=[...n.objects];for(let w of r.fixed)i(1)||(D[w]=null);for(let w of r.blockOnly)D[w]=i(1)?"block":null;for(let w of r.blockOrObject){let A=i(2);A===0?D[w]=null:A===2&&(D[w]="block")}let L=[],H=w=>({r:Math.floor(w/n.cols),c:w%n.cols});for(let w=0;w<r.hazardSlots;w++){let A=i(r.cellBits),z=j[i(2)];A!==r.none&&L.push({kind:r.homeKinds[w],at:H(A),dir:z,home:w})}L.sort((w,A)=>w.at.r*n.cols+w.at.c-(A.at.r*n.cols+A.at.c));for(let w of r.hazardCells){let A=i(r.hazardBits);if(!A)continue;let z=A-1>>>2;L.push({kind:r.homeKinds[z],at:H(w),dir:j[A-1&3],home:z})}return{level:n,terrain:k,objects:D,player:c,hearts:p,keys:g,gear:v,tools:E,pages:T,throwBack:h,minotaur:f,stone:u,cow:d,hazards:L,relicsLeft:m,moves:s,outcome:"playing"}}var Yt=new Set(["wall","invisible-wall","clone"]);function wr(e,t,o,n){let s=(c,h)=>c>=0&&h>=0&&c<e.rows&&h<e.cols&&!Yt.has(e.terrain[c*e.cols+h]),r=new Set,a=new Set,i=[],l=(c,h,f)=>{if(!s(c,h))return;let d=(c*e.cols+h)*4+j.indexOf(f);a.has(d)||(a.add(d),r.add(c*e.cols+h),i.push([c,h,f]))};for(l(Math.floor(t/e.cols)+G[o][0],t%e.cols+G[o][1],o);i.length;){let[c,h,f]=i.pop(),d=e.terrain[c*e.cols+h];if(d==="teleport"){for(let m of n){if(m===c*e.cols+h)continue;let T=Math.floor(m/e.cols)+G[f][0],g=m%e.cols+G[f][1];s(T,g)&&e.terrain[T*e.cols+g]!=="teleport"&&l(T,g,f)}continue}let u=F[d],p=u.carries??(u.slides?f:null);p&&l(c+G[p][0],h+G[p][1],p)}return[...r]}function kr(e){let t=e.rows*e.cols,o=e.terrain.map(a=>!Yt.has(a)),n=e.terrain.flatMap((a,i)=>a==="teleport"?[i]:[]),s=Array.from({length:t},()=>[]);for(let a=0;a<t;a++)if(o[a])for(let i of j)for(let l of wr(e,a,i,n.length>1?n:[]))s[l].push(a);let r=new Uint8Array(t);return e.terrain.forEach((a,i)=>{a==="safe"&&(r[i]=1)}),r[e.player.r*e.cols+e.player.c]=1,{n:t,open:o,into:s,thrown:r}}function Ut(e,t){let o=new Float64Array(e.n).fill(1/0),n=new Int32Array(e.n),s=0;for(let a of t)o[a]===1/0&&(o[a]=0,n[s++]=a);let r=!1;for(let a=0;a<s;a++){let i=n[a],l=o[i]+1;for(let c of e.into[i])o[c]===1/0&&(o[c]=l,n[s++]=c);if(!r&&e.thrown[i]){r=!0;for(let c=0;c<e.n;c++)e.open[c]&&o[c]===1/0&&(o[c]=l,n[s++]=c)}}return o}function xr(e){let t=kr(e),o=e.terrain.flatMap((a,i)=>a==="exit"?[i]:[]),n=Ut(t,o),s=e.objects.flatMap((a,i)=>a==="relic"?[i]:[]),r=s.map(a=>Ut(t,[a]));return a=>{if(a.outcome==="won")return 0;if(a.outcome==="lost")return 1/0;let i=a.player.r*e.cols+a.player.c,l=n[i];if(a.relicsLeft===0)return l;let c=0,h=1/0,f=0;for(let d=0;d<s.length;d++){if(a.objects[s[d]]!=="relic")continue;let u=r[d][i];c++,u<h&&(h=u),u>f&&(f=u)}return c<a.relicsLeft?1/0:Math.max(l,c===a.relicsLeft?f:h)}}var qt=new WeakMap;function je(e){let t=qt.get(e);return t||qt.set(e,t=xr(e)),t}var ke=class extends Error{},Zt=1024;function Ge(e,t,o){let n=2538058380;for(let s=0;s<o;s++){let r=Math.imul(e[t+s],3432918353);r=Math.imul(r<<15|r>>>17,461845907),n^=r,n=Math.imul(n<<13|n>>>19,5)+3864292196}return n^=o,n=Math.imul(n^n>>>16,2246822507),n=Math.imul(n^n>>>13,3266489909),(n^n>>>16)>>>0}function He(e){let t=e,o=Zt,n=new Uint32Array(o*t),s=new Uint32Array(o),r=new Int32Array(o),a=new Uint8Array(o),i=new Uint32Array(o),l=0,c=new Int32Array(Zt*2),h=c.length-1;function f(){o*=2;let u=new Uint32Array(o*t);u.set(n),n=u;let p=new Uint32Array(o);p.set(s),s=p;let m=new Int32Array(o);m.set(r),r=m;let T=new Uint8Array(o);T.set(a),a=T;let g=new Uint32Array(o);g.set(i),i=g,c=new Int32Array(o*2),h=c.length-1;for(let E=0;E<l;E++){let v=s[E]&h;for(;c[v]!==0;)v=v+1&h;c[v]=E+1}}function d(u,p,m){let T=u*t;for(let g=0;g<t;g++)if(n[T+g]!==p[m+g])return!1;return!0}return{get size(){return l},add(u,p,m,T,g){let E=Ge(u,p,t),v=E&h;for(let D=c[v];D!==0;v=v+1&h,D=c[v]){let L=D-1;if(!(s[L]!==E||!d(L,u,p)))return g>=i[L]?-1:(r[L]=m,a[L]=T,i[L]=g,L)}if(l===o)for(f(),v=E&h;c[v]!==0;)v=v+1&h;let k=l++;return n.set(u.subarray(p,p+t),k*t),s[k]=E,r[k]=m,a[k]=T,i[k]=g,c[v]=k+1,k},words(u,p,m){p.set(n.subarray(u*t,u*t+t),m)},parent:u=>r[u],action:u=>a[u],g:u=>i[u]}}var Ae=["mirror","cake","cow"],be=j.length,_e=[...j.map(e=>({kind:"move",dir:e})),{kind:"wait"},...Ae.map(e=>({kind:"tool",tool:e}))],ut=[be,...j.map((e,t)=>t),...Ae.map((e,t)=>be+1+t)];function Xt(e,t){let o=[];for(let n=t;e.parent(n)>=0;n=e.parent(n))o.push(_e[e.action(n)]);return o.reverse()}function ft(e,t){return pt(dt(e,t),t.onProgress)}function*dt(e,t){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let o=t.store??He(le(e.level).words),n=r=>{if(r instanceof ke)return{solved:!1,explored:o.size,capped:!0,reason:r.message};throw r},s;try{s=Tr(e,t,o)}catch(r){return n(r)}for(;;){let r;try{r=s()}catch(a){return n(a)}if("explored"in r)return r;yield r}}function pt(e,t){for(;;){let o=e.next();if(o.done)return o.value;t?.(o.value)}}function Tr(e,t,o){let{cap:n,refuse:s}=t,r=t.prune??null,a=Math.max(1,t.progressEvery??65536),i=e.level,l=le(i),c=je(i),h=new Uint32Array(l.words),f=1024,d=new Int32Array(f),u=new Int32Array(f),p=new Int32Array(f),m=new Uint8Array(f),T=new Uint16Array(f),g=new Int32Array(f),E=0,v=M=>{if(M<f)return;for(;f<=M;)f*=2;let y=new Int32Array(f);y.set(d),d=y;let b=new Int32Array(f);b.set(u),u=b;let P=new Int32Array(f);P.set(p),p=P;let I=new Uint8Array(f);I.set(m),m=I;let $=new Uint16Array(f);$.set(T),T=$},k=(M,y)=>d[M]<d[y]||d[M]===d[y]&&(u[M]<u[y]||u[M]===u[y]&&(T[M]>T[y]||T[M]===T[y]&&M<y)),D=M=>{let y=g[M];for(;M>0;){let b=M-1>>1,P=g[b];if(!k(y,P))break;g[M]=P,p[P]=M,M=b}g[M]=y,p[y]=M},L=M=>{if(E===g.length){let y=new Int32Array(g.length*2);y.set(g),g=y}g[E]=M,D(E++)},H=()=>{let M=g[0];p[M]=-1;let y=g[--E];if(E>0){let b=0;for(;;){let P=2*b+1;if(P>=E)break;let I=P+1,$=I<E&&k(g[I],g[P])?I:P;if(!k(g[$],y))break;g[b]=g[$],p[g[b]]=b,b=$}g[b]=y,p[y]=b}return M},w=c(e);if(we(e,l,h,0),r&&r({...e,moves:0},h,0))return()=>({solved:!1,explored:0,capped:!1});let A=o.add(h,0,-1,0,0);if(o.size>=n)return()=>({solved:!1,explored:o.size,capped:!0});v(A),u[A]=Number.isFinite(w)?w:-1,d[A]=u[A],p[A]=-1,T[A]=e.hearts,u[A]>=0&&L(A);let z=0;return()=>{let M=null;for(;E>0;){if(M)return M;let y=H();if(m[y])return{solved:!0,line:Xt(o,y),explored:o.size};let b=d[y],P=b-u[y];++z%a===0&&(M={expanded:z,stored:o.size,bestF:b,startH:w}),o.words(y,h,0);let I=We(h,0,l,i,P);for(let $ of ut){if($>be&&I.tools[Ae[$-be-1]]<=0)continue;let ee=ae(I,_e[$]),C=ee.state;if(Ie(I,C)||C.outcome==="lost"||s&&s(ee.events,I)||(we(C,l,h,0),r&&r(C,h,0)))continue;let x=o.size,S=o.add(h,0,y,$,P+1);if(S<0)continue;let R=C.outcome==="won";if(o.size>x){v(S);let B=R?0:c(C);u[S]=Number.isFinite(B)?B:-1,p[S]=-1,m[S]=R?1:0,T[S]=C.hearts}if(R&&P+1===b)return{solved:!0,line:Xt(o,S),explored:o.size};if(o.size>=n)return{solved:!1,explored:o.size,capped:!0};u[S]<0||(d[S]=P+1+u[S],p[S]>=0?D(p[S]):L(S))}}return{solved:!1,explored:o.size,capped:!1}}}function Er(e,t){for(let o=0;o<e.terrain.length;o++){if(!t(e.terrain[o]))continue;let n=Math.floor(o/e.cols),s=o%e.cols;for(let r of j){let a=n-G[r][0],i=s-G[r][1];if(a<0||i<0||a>=e.rows||i>=e.cols)continue;let l=F[e.terrain[a*e.cols+i]];if(l.slides||l.carries===r)return!0}}return!1}function Sr(e,t){let o=e.terrain.flatMap((n,s)=>n==="teleport"?[s]:[]);return o.length<2?!1:o.some(n=>j.some(s=>{let r=Math.floor(n/e.cols)+G[s][0],a=n%e.cols+G[s][1];return r>=0&&a>=0&&r<e.rows&&a<e.cols&&t(e.terrain[r*e.cols+a])}))}var Jt=(e,t)=>Er(e,t)||Sr(e,t);function Mr(e,t){let o=[];t.heartBits&&o.push({pos:t.heartAt,width:t.heartBits,set:!1}),t.pageBits&&o.push({pos:t.pageAt,width:t.pageBits,set:!0}),ce.forEach((s,r)=>{t.keyBits[r]&&!Jt(e,a=>F[a].door===s)&&o.push({pos:t.keyAt[r],width:t.keyBits[r],set:!1})}),t.toolBits.forEach((s,r)=>{s&&o.push({pos:t.toolAt[r],width:s,set:!1})});let n=["flippers","fire-boots"];return t.gear.forEach((s,r)=>{n.includes(s)&&!Jt(e,a=>F[a].needs===s)&&o.push({pos:t.gearAt+r,width:1,set:!1})}),o}var mt=1024;function Ke(e,t){let o=je(e),n=Mr(e,t);if(!n.length)return z=>o(z)===1/0;let s=t.words,r=new Uint32Array(s);for(let z of n)for(let M=z.pos;M<z.pos+z.width;M++)r[M>>>5]|=1<<(M&31);let a=[],i=0;for(let z of n)a.push(i),i+=z.width;let l=i+31>>>5,c=mt,h=new Uint32Array(c*s),f=new Int32Array(c),d=0,u=new Int32Array(mt*2),p=u.length-1,m=mt,T=new Uint32Array(m*l),g=new Uint32Array(m),E=new Int32Array(m),v=0,k=-1,D=new Uint32Array(s),L=new Uint32Array(l);function H(){c*=2;let z=new Uint32Array(c*s);z.set(h),h=z;let M=new Int32Array(c);M.set(f),f=M,u=new Int32Array(c*2),p=u.length-1;for(let y=0;y<d;y++){let b=Ge(h,y*s,s)&p;for(;u[b]!==0;)b=b+1&p;u[b]=y+1}}function w(z,M){let y=k;if(y>=0)k=E[y];else{if(v===m){m*=2;let b=new Uint32Array(m*l);b.set(T),T=b;let P=new Uint32Array(m);P.set(g),g=P;let I=new Int32Array(m);I.set(E),E=I}y=v++}return T.set(L,y*l),g[y]=z,E[y]=M,y}function A(z,M,y,b){for(let P=0;P<n.length;P++){let I=n[P],$=Me(z,M,a[P],I.width),ee=Me(y,b,a[P],I.width);if(I.set?($&ee)!==ee:$<ee)return!1}return!0}return(z,M,y)=>{if(o(z)===1/0)return!0;let b=z.moves;for(let C=0;C<s;C++)D[C]=M[y+C]&~r[C];let P=Ge(D,0,s);L.fill(0);for(let C=0;C<n.length;C++)Z(L,0,a[C],n[C].width,Me(M,y,n[C].pos,n[C].width));let I=P&p,$=-1;for(let C=u[I];C!==0;I=I+1&p,C=u[I]){let x=C-1,S=!0;for(let R=0;R<s&&S;R++)S=h[x*s+R]===D[R];if(S){$=x;break}}if($<0){if(d===c)for(H(),I=P&p;u[I]!==0;)I=I+1&p;return $=d++,h.set(D,$*s),u[I]=$+1,f[$]=w(b,-1),!1}for(let C=f[$];C>=0;C=E[C])if(g[C]<=b&&A(T,C*l,L,0))return!0;let ee=-1;for(let C=f[$];C>=0;){let x=E[C];b<=g[C]&&A(L,0,T,C*l)?(ee<0?f[$]=x:E[ee]=x,E[C]=k,k=C):ee=C,C=x}return f[$]=w(b,f[$]),!1}}var pe=2e6,xe=e=>e.some(t=>t.kind==="caught");function ve(e,t=pe){return ft(e,{cap:t,refuse:null,prune:Ke(e.level,le(e.level))})}function Vt(e,t,o=pe){return ft(e,{cap:o,refuse:t,prune:Ke(e.level,le(e.level))})}function Ne(e,t,o=pe,n={}){return dt(e,{cap:o,refuse:t,prune:Ke(e.level,le(e.level)),store:n.store,progressEvery:n.every})}var Qt={up:"u",down:"d",left:"l",right:"r"},bt={mirror:"z",cake:"x",cow:"c"};function Ue(e){return e.map(t=>t.kind==="move"?Qt[t.dir]:t.kind==="wait"?"w":bt[t.tool]).join("")}function eo(e){let t=[];for(let o of e){let n=j.find(r=>Qt[r]===o),s=Object.keys(bt).find(r=>bt[r]===o);if(n)t.push({kind:"move",dir:n});else if(o==="w")t.push({kind:"wait"});else if(s)t.push({kind:"tool",tool:s});else return null}return t}var yt=e=>e.solved?e.line.length:e.capped?"unknown":"none";function oo(e,t=pe){return pt(Ar(e,t))}function*Ar(e,t=pe,o={}){let n=se(e),s=E=>({store:o.store?.(le(E).words),every:o.every}),r=yield*Ne(n,null,t,s(e)),a=yt(r),i=0;if(r.solved){let E=n;for(let v of r.line){let k=ae(E,v);E=k.state,xe(k.events,E)&&i++}}let l=yt(yield*Ne(n,xe,t,s(e))),c=yield*Lr(e,t,s(e)),h=c===null?"unknown":c?"chase":"solo",f=Cr(e),d=r.solved?Ue(r.line):"";if(!e.minotaur)return{solved:r.solved,shortest:a,explored:r.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:l,catches:i,label:h,naiveWins:f,line:d};let u={...e,minotaur:null},p=yield*Ne(se(u),null,t,s(u)),m=yt(p),T=p.solved?!1:p.capped?null:!1;if(p.solved){let E=n;for(let v of p.line)E=ae(E,v).state;T=E.outcome==="won"}let g=typeof a=="number"&&typeof m=="number"?a-m:null;return{solved:r.solved,shortest:a,explored:r.explored,withoutMinotaur:m,minotaurDelta:g,greedyWins:T,catchFree:l,catches:i,label:h,naiveWins:f,line:d}}function to(e,t,o,n){let s=new Uint8Array(e.rows*e.cols),r=[t];s[t]=1;for(let a=0;a<r.length;a++){let i=r[a],l=Math.floor(i/e.cols),c=i%e.cols;for(let h of j){let f=l+G[h][0],d=c+G[h][1];if(f<0||d<0||f>=e.rows||d>=e.cols)continue;let u=f*e.cols+d;!s[u]&&o(u)&&(s[u]=1,r.push(u))}if(n?.from(i))for(let h of n.to)!s[h]&&o(h)&&(s[h]=1,r.push(h))}return s}function vr(e){let t=new Set(e.objects.filter(i=>i!==null));e.machines.some(i=>i.template==="block")&&t.add("block");let o=i=>{let l=F[i];return l.door?t.has(`key-${l.door}`):i==="water"?t.has("block"):i==="toggle-open"||i==="toggle-closed"},n=to(e,e.minotaur.r*e.cols+e.minotaur.c,i=>{let l=e.terrain[i];return F[l].minotaur||o(l)||l==="fake-wall"||l==="bomb"}),r=e.terrain.flatMap((i,l)=>i==="teleport"?[l]:[]).flatMap(i=>{let l=Math.floor(i/e.cols),c=i%e.cols;return j.flatMap(h=>{let f=l+G[h][0],d=c+G[h][1];return f<0||d<0||f>=e.rows||d>=e.cols?[]:[f*e.cols+d]})}),a=to(e,e.player.r*e.cols+e.player.c,i=>{let l=e.terrain[i],c=F[l];return l==="wall"?!1:c.door?o(l):!c.needs||t.has(c.needs)||o(l)},{from:i=>e.terrain[i]==="teleport",to:r});return!n.some((i,l)=>i===1&&a[l]===1)}function*Lr(e,t=pe,o={}){if(!e.minotaur||vr(e))return!1;let n=le(e),s=o.store??He(n.words),r=Math.max(1,o.every??65536);try{let a=new Uint32Array(n.words);if(we(se(e),n,a,0),s.add(a,0,-1,0,0),s.size>=t)return null;let i=0;for(let l=0;l<s.size;l++){++i%r===0&&(yield{expanded:i,stored:s.size,bestF:0,startH:0}),s.words(l,a,0);let c=We(a,0,n,e,0);for(let h of ut){if(h>be&&c.tools[Ae[h-be-1]]<=0)continue;let f=ae(c,_e[h]);if(f.events.some(u=>u.kind==="caught"&&u.by==="minotaur"))return!0;let d=f.state;if(!(Ie(c,d)||d.outcome!=="playing")&&(we(d,n,a,0),s.add(a,0,l,h,0),s.size>=t))return null}}return!1}catch(a){if(a instanceof ke)return null;throw a}}var Rr=16;function zr(e,t){let o=e.rows*e.cols,n=new Int32Array(o).fill(-1),s=new Int8Array(o).fill(-1);n[t]=0;let r=[t];for(let a=0;a<r.length;a++){let i=r[a],l=Math.floor(i/e.cols),c=i%e.cols;j.forEach((h,f)=>{let d=l+G[h][0],u=c+G[h][1];if(d<0||u<0||d>=e.rows||u>=e.cols)return;let p=d*e.cols+u;n[p]>=0||e.terrain[p]==="wall"||(n[p]=n[i]+1,s[p]=f,r.push(p))})}return{dist:n,via:s}}function Or(e){let t=e.rows*e.cols,o=e.player.r*e.cols+e.player.c,n=[],s=[];for(let m=0;m<t;m++)e.objects[m]==="relic"&&n.push(m),e.terrain[m]==="exit"&&s.push(m);let r=e.relics,a=[o,...n].map(m=>zr(e,m)),i=m=>{let T=-1,g=1/0;for(let E of s){let v=a[m].dist[E];v>=0&&v<g&&(g=v,T=E)}return[T,g]},l=(m,T)=>{let g=a[m].dist[T===0?o:n[T-1]];return g<0?1/0:g},c=null;if(r===0)c=[];else if(n.length<=Rr){let m=n.length,T=new Float64Array((1<<m)*m).fill(1/0),g=new Int8Array((1<<m)*m).fill(-1);for(let k=0;k<m;k++)T[(1<<k)*m+k]=l(0,k+1);let E=1/0,v=-1;for(let k=1;k<1<<m;k++){let D=Pr(k);if(!(D>r))for(let L=0;L<m;L++){let H=T[k*m+L];if(!(!(k&1<<L)||H===1/0)){if(D===r){let w=H+i(L+1)[1];w<E&&(E=w,v=k*m+L);continue}for(let w=0;w<m;w++){if(k&1<<w)continue;let A=(k|1<<w)*m+w,z=H+l(L+1,w+1);z<T[A]&&(T[A]=z,g[A]=L)}}}}if(v>=0){c=[];for(let k=v;;){let D=Math.floor(k/m),L=k%m;if(c.push(L+1),g[k]<0)break;k=(D&~(1<<L))*m+g[k]}c.reverse()}}else{c=[];let m=new Set(n.map((g,E)=>E+1)),T=0;for(;c.length<r;){let g=-1,E=1/0;for(let v of m){let k=l(T,v);k<E&&(E=k,g=v)}if(g<0){c=null;break}c.push(g),m.delete(g),T=g}}if(!c)return null;let h=c.length?c[c.length-1]:0,[f]=i(h);if(f<0)return null;let d=[],u=[0,...c],p=[...c.map(m=>n[m-1]),f];return u.forEach((m,T)=>{let{via:g}=a[m],E=p[T],v=[];for(let k=E;g[k]>=0;){let D=j[g[k]];v.push(D),k-=G[D][0]*e.cols+G[D][1]}d.push(...v.reverse())}),d}function Pr(e){let t=0;for(;e;e&=e-1)t++;return t}function Cr(e){let t=Or(e);if(!t)return!1;let o=se(e);for(let n of t)if(o=ae(o,{kind:"move",dir:n}).state,o.outcome!=="playing")break;return o.outcome==="won"}var ge={minotaurDelta:8,exploredTimes:20};function ro(e,t=ge,o){let n=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let s=e.withoutMinotaur!==null;if(s&&(e.minotaurDelta===null||e.greedyWins===null?n.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&n.push("the Minotaur does not matter: the line that ignores him wins, no longer")),n.push(...no(e)),!o)return n;if(!s)return[...n,"a challenge level has a Minotaur"];e.greedyWins!==!1&&n.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<t.minotaurDelta&&n.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${t.minotaurDelta}`);let r=l=>Math.max(0,...o.teaching.map(l)),a=r(l=>l.explored);e.explored<t.exploredTimes*a&&n.push(`a challenge level: stored ${e.explored} situations, the bar is ${t.exploredTimes} × ${a} = ${t.exploredTimes*a}`);let i=r(l=>typeof l.shortest=="number"?l.shortest:0);return typeof e.shortest=="number"&&e.shortest<i&&n.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${i}`),n}function no(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var so={least:1.2,most:2.2};function ao(e,t,o=so){let n=t.explored/Math.max(1,e.explored);return n<o.least?[`stored ${t.explored} situations, ${n.toFixed(2)} × the challenge level before it (${e.explored}); the ramp asks at least ${o.least} ×`]:n>o.most?[`stored ${t.explored} situations, ${n.toFixed(2)} × the challenge level before it (${e.explored}); the ramp allows at most ${o.most} ×`]:[]}var ye={ramp:{least:1.1,most:1.5},most:2e4};function qe(e){return e.terrain.some(t=>t==="fake-wall"||t==="invisible-wall")}function io(e){return qe(e)?ye.ramp:so}function lo(e,t){return!qe(e)||t.explored<=ye.most?[]:[`the level hides walls: stored ${t.explored} situations, the ceiling for a level that hides walls is ${ye.most}`]}var Le={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function co(e,t=Le){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let o=[];e.naiveWins&&o.push("the plain walk to the exit wins"),o.push(...no(e));let n=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=ge.minotaurDelta,s=n?t.chaseShortest:t.shortest,r=n?t.chaseExplored:t.explored;return e.shortest<s&&o.push(`the quickest win is ${e.shortest} moves, the bar is ${s}`),e.explored<r&&o.push(`the solver searched ${e.explored} situations, the bar is ${r}`),o}var Dr={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function he(e,t){let o=[...e.terrain],n=[...e.objects];t(o,n);let s=e.machines.filter(r=>o[r.at.r*e.cols+r.at.c]==="clone");return J(Se({...e,terrain:o,objects:n,machines:s}))}function gt(e){let t=[],o=r=>`row ${Math.floor(r/e.cols)+1}, column ${r%e.cols+1}`;for(let r of ce){let a=`key-${r}`;e.objects.includes(a)&&t.push({name:`the ${r} keys`,ignored:[he(e,(i,l)=>{l.forEach((c,h)=>{c===a&&(l[h]=null)})})]}),e.terrain.some(i=>F[i].door===r)&&t.push({name:`the ${r} doors`,ignored:["wall","floor"].map(i=>he(e,(l,c)=>{l.forEach((h,f)=>{F[h].door===r&&(l[f]=i)}),c.forEach((h,f)=>{h===a&&(c[f]=null)})}))})}let n=e.objects.filter(r=>r==="relic").length>e.relics;e.objects.forEach((r,a)=>{r==="block"?t.push({name:`the block at ${o(a)}`,ignored:[he(e,(i,l)=>{l[a]=null,i[a]="wall"}),he(e,(i,l)=>{l[a]=null})]}):(r==="relic"?n:r!==null&&r!=="cake"&&r!=="page"&&!r.startsWith("key-"))&&t.push({name:`the ${r==="relic"?"spare relic":r} at ${o(a)}`,ignored:[he(e,(i,l)=>{l[a]=null})]})});let s=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[r,a,i]of s){if(!e.terrain.some(h=>a.includes(h)))continue;let l=i.map(h=>he(e,f=>{f.forEach((d,u)=>{a.includes(d)&&(f[u]=h)})})),c=Dr[a[0]];c&&e.objects.includes(c)&&l.push(he(e,(h,f)=>{f.forEach((d,u)=>{d===c&&(f[u]=null)})})),t.push({name:`the ${r}`,ignored:l})}return e.terrain.some(r=>r==="button"||r==="toggle-open"||r==="toggle-closed")&&t.push({name:"the toggle walls and their button",ignored:[he(e,r=>{r.forEach((a,i)=>{a==="button"||a==="toggle-open"?r[i]="floor":a==="toggle-closed"&&(r[i]="wall")})})]}),e.terrain.forEach((r,a)=>{let i=c=>{for(let[h,f]of Object.entries(e.links))f===a&&(c[Number(h)]="floor")},l=(c,h,f,d)=>t.push({name:`the ${c} at ${o(a)}`,ignored:[h,...d?[d]:[]].map(u=>he(e,p=>{p[a]=u,f?.(p)}))});r==="trap"?l("snare","floor",i):r==="fake-wall"?l("fake wall","wall",void 0,"floor"):r==="invisible-wall"?l("invisible wall","floor"):r==="thief"?l("thief","floor"):r==="bomb"?l("bomb","floor"):r==="clone"&&l("clone machine","wall",i)}),e.hazards.forEach((r,a)=>{t.push({name:`the ${oe[r.kind].name.toLowerCase()} at ${o(r.at.r*e.cols+r.at.c)}`,ignored:[J(Se({...e,hazards:e.hazards.filter((i,l)=>l!==a)}))]})}),t}var ho={explored:1.3};function Fr(e,t,o){let n=ve(se(t),o);if(!n.solved)return n.capped?"capped":"the level cannot be won";if(n.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${n.line.length}`;let s=Vt(se(t),xe,o);return s.solved?s.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${s.line.length}`:e.explored>=ho.explored*n.explored?`the search falls from ${e.explored} situations to ${n.explored}`:null:s.capped?"capped":"no win without a catch"}function uo(e,t,o=pe){return!t.solved||typeof t.catchFree!="number"?[]:gt(e).flatMap(n=>{let s=n.ignored.map(r=>Fr(t,r,o));return s.some(r=>r!==null&&r!=="capped")?[]:s.includes("capped")?[{unit:n,problem:`${n.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:n,problem:`${n.name}: ignoring it changes nothing (still ${t.shortest} moves, and the search no ${ho.explored} × smaller)`}]})}var Te={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function Br(e,t){let o=e.level;if(!e.minotaur)return 1/0;let n=e.minotaur.r*o.cols+e.minotaur.c,s=e.player.r*o.cols+e.player.c,r=new Map([[n,0]]),a=[n];for(let i=0;i<a.length;i++){let l=a[i],c=r.get(l);if(l===s)return c;if(c>=t)continue;let h=Math.floor(l/o.cols),f=l%o.cols;for(let d of j){let u=h+G[d][0],p=f+G[d][1];if(u<0||p<0||u>=o.rows||p>=o.cols)continue;let m=u*o.cols+p;r.has(m)||m!==s&&(!F[e.terrain[m]].minotaur||e.objects[m]==="block")||(r.set(m,c+1),a.push(m))}}return 1/0}function wt(e,t){let o=eo(t.line)??[],n=se(e),s=0,r=0,a=0;for(let i of o)n=ae(n,i).state,n.stone>0||!!n.minotaur&&(te(ze(n),n.minotaur)||Br(n,Te.reach)<=Te.reach)?(s++,a=0):r=Math.max(r,++a);return{turns:o.length,live:s,quiet:r}}function fo(e,t,o){if(!e.minotaur||!t.solved||typeof t.shortest!="number")return[];let n=[];t.minotaurDelta!==null&&t.minotaurDelta<1&&n.push("the beast adds no moves: a route that ignores him wins as quickly");let s=Te[o],r=wt(e,t);return r.live<s.share*r.turns&&n.push(`the beast is live on ${r.live} of ${r.turns} turns; the bar is ${Math.ceil(s.share*r.turns)}`),r.quiet>s.quiet*r.turns&&n.push(`the beast is quiet for ${r.quiet} turns in a row; the bar is ${Math.floor(s.quiet*r.turns)}`),n}function kt(e,t=0){let o=3735928559^t,n=1103547991^t;for(let s=0;s<e.length;s++){let r=e.charCodeAt(s);o=Math.imul(o^r,2654435761),n=Math.imul(n^r,1597334677)}return o=Math.imul(o^o>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),n=Math.imul(n^n>>>16,2246822507)^Math.imul(o^o>>>13,3266489909),[o>>>0,n>>>0]}function po(...e){return kt(e.join(""))[0]}function mo(...e){let t=e.join(""),[o,n]=kt(t),[s,r]=kt(t,2654435769),a=o,i=n,l=s,c=r|1,h=()=>{let d=(a+i|0)+c|0;return c=c+1|0,a=i^i>>>9,i=l+(l<<3)|0,l=l<<21|l>>>11,l=l+d|0,(d>>>0)/4294967296};for(let d=0;d<12;d++)h();let f=d=>Math.floor(h()*d);return{next:h,int:f,pick:d=>d[f(d.length)],shuffle(d){let u=[...d];for(let p=u.length-1;p>0;p--){let m=f(p+1);[u[p],u[m]]=[u[m],u[p]]}return u}}}var Ye={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function xt(e){return Object.keys(Ye).filter(t=>Ye[t]<=e)}var Xe=["fake","invisible"];function bo(e,t,o,n){let s=t-(o-1);if(s<o*n)return null;let r=Array(o).fill(n);for(let l=s-o*n;l>0;l--)r[e.int(o)]++;let a=[],i=1;for(let l of r)a.push([i,i+l-1]),i+=l+1;return a}var Ee={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},Ze=["up","down","left","right"];function yo(e,t){let{rows:o,cols:n}=t,s=bo(e,o-2,t.roomRows,2),r=bo(e,n-2,t.roomCols,2);if(!s||!r)return null;let a=Array.from({length:o},()=>Array(n).fill("#")),i=t.roomRows*t.roomCols,l=x=>({r:s[Math.floor(x/t.roomCols)],c:r[x%t.roomCols]});for(let x=0;x<i;x++){let{r:S,c:R}=l(x);for(let B=S[0];B<=S[1];B++)for(let _=R[0];_<=R[1];_++)a[B][_]="."}let c=[];for(let x=0;x<i;x++)x%t.roomCols<t.roomCols-1&&c.push([x,x+1]),x+t.roomCols<i&&c.push([x,x+t.roomCols]);let h=[...Array(i).keys()],f=x=>h[x]===x?x:h[x]=f(h[x]),d=[],u=(x,S,R)=>{let B=l(x),_=l(S);if(S===x+1){let N=Math.max(B.r[0],_.r[0]),X=Math.min(B.r[1],_.r[1]),U=B.c[1]+1;if(R){for(let ne=N;ne<=X;ne++)a[ne][U]=".";return}let q=N+e.int(X-N+1);a[q][U]=".",d.push({r:q,c:U})}else{let N=Math.max(B.c[0],_.c[0]),X=Math.min(B.c[1],_.c[1]),U=B.r[1]+1;if(R){for(let ne=N;ne<=X;ne++)a[U][ne]=".";return}let q=N+e.int(X-N+1);a[U][q]=".",d.push({r:U,c:q})}};for(let[x,S]of e.shuffle(c))f(x)!==f(S)?(h[f(x)]=f(S),u(x,S,e.next()<t.hall)):e.next()<t.loop&&u(x,S,!1);let p=e.shuffle([...Array(i).keys()]),m=new Set,T=()=>{let x=p.filter(R=>!m.has(R)),S=x.length?x[0]:e.pick(p);return m.add(S),S},g=(x,S=(R,B)=>a[R][B]===".")=>{let{r:R,c:B}=l(x),_=[];for(let N=R[0];N<=R[1];N++)for(let X=B[0];X<=B[1];X++)S(N,X)&&_.push([N,X]);return _.length?e.pick(_):null},E=(x,S)=>Ze.some(R=>d.some(B=>B.r===x+Ee[R][0]&&B.c===S+Ee[R][1])),v=x=>{let S=x===void 0?e.shuffle([...Array(i).keys()]):[x];for(let R of S){let B=g(R,(_,N)=>a[_][N]==="."&&!E(_,N));if(B)return B}return null},k=(x,S)=>{let R=v(S);return R?(a[R[0]][R[1]]=x,!0):!1},D=()=>e.shuffle(d.filter(x=>a[x.r][x.c]===".")),L=x=>{let S=D()[0];return S?(a[S.r][S.c]=x,!0):!1},H=(x,S)=>{let{r:R,c:B}=l(x);if(e.next()<.5){let N=R[0]+e.int(R[1]-R[0]+1),X=Math.min(R[1],N+e.int(2));for(let U=N;U<=X;U++)for(let q=B[0];q<=B[1];q++)a[U][q]==="."&&(a[U][q]=S)}else{let N=B[0]+e.int(B[1]-B[0]+1),X=Math.min(B[1],N+e.int(2));for(let U=R[0];U<=R[1];U++)for(let q=N;q<=X;q++)a[U][q]==="."&&(a[U][q]=S)}},w=T(),A=T(),z=new Map,M=new Map,y=x=>{let S=v();return S?(a[S[0]][S[1]]=x,z.set(S[0]*n+S[1],e.pick(Ze)),!0):!1},b=!0;for(let x of t.families){switch(x){case"keys":{let[S,R]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),B=1+e.int(2);for(let _=0;_<B;_++)b=L(S)&&b;for(let _=0;_<(S==="G"?1:B);_++)b=k(R)&&b;break}case"water":{let S=T();H(S,"~"),b=(e.next()<.5?k("f"):k("O"))&&b;break}case"fire":{let S=T();H(S,"F"),b=k("h")&&b;break}case"ice":{let S=T();H(S,"="),e.next()<.5&&(b=k("k")&&b);break}case"force":{let S=T(),R=e.pick(["^","v","<",">"]);H(S,R),e.next()<.5&&(b=k("u")&&b);break}case"blocks":{let S=1+e.int(2);for(let R=0;R<S;R++)b=k("O")&&b;break}case"toggle":{let S=1+e.int(2);for(let R=0;R<S;R++)b=L(e.next()<.5?"T":"t")&&b;b=k("_")&&b;break}case"mirror":b=k("z")&&b;break;case"cow":b=k("c")&&b;break;case"gravel":{let S=1+e.int(2);for(let R=0;R<S;R++)b=L(":")&&b;break}case"popup":b=L(";")&&b;break;case"fake":b=L("W")&&b;break;case"invisible":b=k("I")&&b;break;case"snare":b=(e.next()<.5?L("&"):k("&"))&&k("-")&&b;break;case"teleport":b=k("@",T())&&k("@",T())&&b;break;case"ball":b=y("o")&&b;break;case"glider":b=y("w")&&b;break;case"fireball":b=y("e")&&b;break;case"thief":b=L("$")&&b;break;case"bomb":b=(e.next()<.5?L("!"):k("!"))&&b;break;case"clone":{let S=!1;for(let R=0;R<40&&!S;R++){let B=e.int(i),{r:_,c:N}=l(B),X=e.int(4),U=X<2?X===0?_[0]-1:_[1]+1:_[0]+e.int(_[1]-_[0]+1),q=X<2?N[0]+e.int(N[1]-N[0]+1):X===2?N[0]-1:N[1]+1,ne=["down","up","right","left"][X],Ko=U+Ee[ne][0],No=q+Ee[ne][1];U<=0||q<=0||U>=o-1||q>=n-1||a[U][q]!=="#"||a[Ko][No]!=="."||(a[U][q]="C",M.set(U*n+q,`${e.pick(["block","ball","block"])}-${ne}`),S=!0)}b=S&&k("+")&&b;break}}if(!b)return null}for(let x=0;x<t.relics;x++)if(!k("*"))return null;if(!k("P",w)||!k("M",A))return null;let P=[];for(let x=1;x<o-1;x++)a[x][1]==="."&&P.push([x,0,x,1]),a[x][n-2]==="."&&P.push([x,n-1,x,n-2]);for(let x=1;x<n-1;x++)a[1][x]==="."&&P.push([0,x,1,x]),a[o-2][x]==="."&&P.push([o-1,x,o-2,x]);if(!P.length)return null;let[I,$,ee,C]=e.pick(P);return a[I][$]="E",t.relics>0&&e.next()<.5&&a[ee][C]==="."&&!E(ee,C)&&(a[ee][C]="|"),{g:a,doors:d,facing:z,machines:M}}function Tt(e,t){let o=[`title: ${t}`,"intro: "],n=[...e.facing.keys()].sort((r,a)=>r-a);n.length&&o.push(`facing: ${n.map(r=>e.facing.get(r)).join(" ")}`);let s=[...e.machines.keys()].sort((r,a)=>r-a);return s.length&&o.push(`machines: ${s.map(r=>e.machines.get(r)).join(" ")}`),`${o.join(`
`)}

${e.g.map(r=>r.join("")).join(`
`)}
`}var Ir=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function go(e,t){let o=t.g.map(f=>[...f]),n=o.length,s=o[0].length,r=[...t.doors],a=new Map(t.facing),i=f=>{let d=[];for(let u=1;u<n-1;u++)for(let p=1;p<s-1;p++)f(u,p)&&d.push([u,p]);return d},l=(f,d)=>r.some(u=>u.r===f&&u.c===d),c=(f,d)=>Ze.some(u=>l(f+Ee[u][0],d+Ee[u][1])),h=e.next();if(h<.55){let f=i((u,p)=>Ir.has(o[u][p])&&!l(u,p)),d=i((u,p)=>o[u][p]==="."&&!l(u,p)&&!c(u,p));if(f.length&&d.length){let[u,p]=e.pick(f),[m,T]=e.pick(d);o[m][T]=o[u][p],o[u][p]=".";let g=a.get(u*s+p);g&&(a.delete(u*s+p),a.set(m*s+T,g))}}else if(h<.7){let f=r.filter(u=>o[u.r][u.c]!=="."),d=r.filter(u=>o[u.r][u.c]===".");if(f.length&&d.length){let u=e.pick(f),p=e.pick(d);o[p.r][p.c]=o[u.r][u.c],o[u.r][u.c]="."}}else if(h<.8&&a.size)a.set(e.pick([...a.keys()]),e.pick(Ze));else{let f=r.filter(u=>o[u.r][u.c]==="."),d=i((u,p)=>o[u][p]==="#"&&(o[u-1][p]!=="#"&&o[u+1][p]!=="#"&&o[u][p-1]==="#"&&o[u][p+1]==="#"||o[u][p-1]!=="#"&&o[u][p+1]!=="#"&&o[u-1][p]==="#"&&o[u+1][p]==="#"));if(f.length>1&&(e.next()<.5||!d.length)){let u=e.pick(f);o[u.r][u.c]="#",r=r.filter(p=>p!==u)}else if(d.length){let[u,p]=e.pick(d);o[u][p]=".",r.push({r:u,c:p})}}return{g:o,doors:r,facing:a,machines:new Map(t.machines)}}var wo=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function $r(e,t,o){for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++){let r=t+n,a=o+s;if(r>=0&&a>=0&&r<e.rows&&a<e.cols&&wo(e.terrain[r*e.cols+a])!=="wall")return!1}return!0}function Je(e){return Array.from({length:e.rows-2},(t,o)=>Array.from({length:e.cols-2},(n,s)=>{let r=wo(e.terrain[(o+1)*e.cols+s+1]);return r==="wall"&&$r(e,o+1,s+1)?"":r}))}var Wr=e=>e[0].map((t,o)=>e.map(n=>n[o]).reverse()),jr=e=>e.map(t=>[...t].reverse());function Et(e){let t=[];for(let o=0,n=e;o<4;o++,n=Wr(n))t.push(n,jr(n));return t}function St(e,t){let o=0;for(let n of t){let[s,r]=e.length*e[0].length<=n.length*n[0].length?[e,n]:[n,e],a=s.length,i=s[0].length,l=r.length,c=r[0].length;if(!(a>l||i>c||l-a>2||c-i>2))for(let h=0;h<=l-a;h++)for(let f=0;f<=c-i;f++){let d=0,u=0;for(let p=0;p<a;p++)for(let m=0;m<i;m++){let T=s[p][m],g=r[p+h][m+f];T&&T===g&&d++,(T||g)&&u++}o=Math.max(o,u?d/u:1)}}return o}var To=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function At(e){let t=new Set(e.terrain),o=new Set(e.objects.filter(n=>n!==null));return t.has("thief")||t.has("bomb")||t.has("clone")||t.has("button-red")?9:e.hazards.some(n=>n.kind!=="ball")?8:e.hazards.length?7:t.has("teleport")?6:t.has("trap")||t.has("button-brown")?5:t.has("fake-wall")||t.has("invisible-wall")?4:t.has("popup")?3:t.has("gravel")?2:1}var Gr=e=>({teaching:[{...To[e-1]}]});function Eo(e){let t=To[e-1];return{explored:Math.max(Le.chaseExplored,ge.exploredTimes*t.explored),shortest:Math.max(Le.chaseShortest,t.shortest)}}var xo=Le.chaseExplored,Hr={least:1.2,most:1.6},Mt={least:3e4,most:5e4};function Ve(e,t){let o=t?ye.ramp:Hr,n=t?ye.most:Mt.most;if(e===null)return{least:xo,most:t?ye.most:2e4,plateau:!1};let s=Math.max(xo,Math.ceil(e*o.least)),r=Math.min(n,Math.floor(e*o.most));return r>=s*1.15?{least:s,most:r,plateau:!1}:t?null:{least:Mt.least,most:Mt.most,plateau:!0}}function So(e){return{features:e.map(t=>Et(Je(t)))}}function _r(e){let{rows:t,cols:o}=e,n=(r,a)=>e.terrain[r*o+a]==="wall",s=[];for(let r=1;r<t-1;r++)for(let a=1;a<o-1;a++){let i=r*o+a,l=[n(r-1,a),n(r+1,a),n(r,a-1),n(r,a+1)].filter(Boolean).length;n(r,a)&&l===0&&s.push(`a lone wall at row ${r+1}, column ${a+1}`),e.terrain[i]==="floor"&&e.objects[i]===null&&!(e.player.r===r&&e.player.c===a)&&!(e.minotaur?.r===r&&e.minotaur.c===a)&&!e.hazards.some(h=>h.at.r===r&&h.at.c===a)&&l>=3&&s.push(`a bare pocket at row ${r+1}, column ${a+1}`)}return s}function vt(e,t,o=[]){let n=Je(e),s=[];return t.features.forEach((r,a)=>{let i=St(n,r);i>=.42&&s.push(`its layout repeats campaign level ${a+1}'s (${i.toFixed(2)})`)}),o.forEach((r,a)=>{let i=St(n,Et(Je(r)));i>=.42&&s.push(`its layout repeats the run's level ${a+1}'s (${i.toFixed(2)})`)}),s}function Mo(e,t,o,n,s=[]){let r=[];return(t.explored<o.band.least||t.explored>o.band.most)&&r.push(`stored ${t.explored} situations, the band is ${o.band.least} to ${o.band.most}`),r.push(...ro(t,ge,Gr(At(e))),...co(t),...fo(e,t,"challenge"),...lo(e,t)),!o.band.plateau&&o.previous&&r.push(...ao(o.previous,t,io(e))),qe(e)&&o.band.plateau&&r.push("a level that hides walls never sits on the plateau"),r.length?r:[..._r(e),...vt(e,n,s)]}var Kr=12e6,Ro=12,Qe=120,Nr=.25;function Ur(e,t,o,n){let s=xt(t).filter(c=>!Xe.includes(c)),r=s.filter(c=>Ye[c]===Math.min(t,9)),a=2+e.int(2),i=[];r.length&&e.next()<.5&&i.push(e.pick(r)),n&&i.push(e.pick(Xe));for(let c of e.shuffle(s))i.length<a+(n?1:0)&&!i.includes(c)&&i.push(c);let l=12+e.int(3);return{rows:l,cols:l,roomRows:3,roomCols:3,families:i,relics:1+e.int(3),hall:.2,loop:.35}}var Ao=e=>Math.ceil(e.most*1.05),vo=e=>Math.max(2e5,e.most*4);function Lt(e,t,o){if(!e.minotaur)return 1/0;let n=se(e),s=ve(n,Ao(t));if(o(s.explored),!s.solved)return s.capped?12:30;let r=0,a=Eo(At(e)),i=Math.max(t.least,a.explored);s.explored<i&&(r+=3*Math.log(i/s.explored)),s.explored>t.most&&(r+=3*Math.log(s.explored/t.most)),s.line.length<a.shortest&&(r+=.2*(a.shortest-s.line.length));let l=n,c=0;for(let d of s.line){let u=ae(l,d);l=u.state,xe(u.events,l)&&c++}r+=3*c;let h=wt(e,{line:Ue(s.line)});if(r+=6*Math.max(0,Te.challenge.share-h.live/Math.max(1,h.turns)),r+=6*Math.max(0,h.quiet/Math.max(1,h.turns)-Te.challenge.quiet),globalThis.DEBUG_ENDLESS&&r>0&&r<1.5&&globalThis.DEBUG_ENDLESS("near",`ex ${s.explored>=t.least?s.explored>t.most?"hi":"ok":"lo"} len ${s.line.length>=36?"ok":s.line.length} c ${c} live ${(h.live/h.turns).toFixed(2)} quiet ${(h.quiet/h.turns).toFixed(2)}`),r>0)return r;let f=ve(se({...e,minotaur:null}),Ao(t));if(o(f.explored),f.solved){r+=.4*Math.max(0,ge.minotaurDelta-(s.line.length-f.line.length));let d=n;for(let u of f.line)d=ae(d,u).state;d.outcome==="won"&&(r+=2),globalThis.DEBUG_ENDLESS&&Math.random()<.05&&globalThis.DEBUG_ENDLESS("near",`ex ${s.explored} len ${s.line.length} free ${f.line.length} won ${d.outcome}`)}return r}function qr(e,t){let o=Se(t),n=o.slice(o.indexOf(`

`)+2).trimEnd().split(`
`).map(a=>[...a]),s=new Map(t.hazards.map(a=>[a.at.r*t.cols+a.at.c,a.dir])),r=new Map(t.machines.map(a=>[a.at.r*t.cols+a.at.c,`${a.template}-${a.dir}`]));return{g:n,doors:e.doors,facing:s,machines:r}}function Yr(e){let t=o=>o.terrain.filter(n=>n==="wall").length;return e.reduce((o,n)=>t(n)<t(o)?n:o)}function Lo(e,t,o){let n=t.run.slice(-Ro),s=e.filter(h=>h.chapter<=t.tier),r=n.map(h=>J(h.text)),a=s.filter(h=>!n.some(f=>f.text===h.text)&&vt(J(h.text),{features:[]},r).length===0),i=t.run.at(-1)?.explored??null,l=Ve(Number.MAX_SAFE_INTEGER,!1),c=[h=>h.explored>=o.least&&h.explored<=o.most,h=>i!==null&&h.explored>=i*1.2&&h.explored<=i*2.2,h=>h.explored>=l.least&&h.explored<=l.most,()=>!0];for(let h of[a,s,e])for(let f of c){let d=h.filter(f);if(d.length)return d[po("endless-bank",t.seed,t.tier,t.depth)%d.length]}throw new RangeError("the bank is empty")}function Zr(e,t,o,n,s,r,a,i,l,c=null){let h=f=>{i.spent+=f};for(let f=0;i.spent<a;f++){let d=mo("endless",...e,f),u=c!==null&&d.next()<.25,p=u?c:o,m=yo(d,Ur(d,t,p,u));if(!m){h(1e3);continue}let T=k=>{try{return J(Tt(k,""))}catch{return null}},g=T(m),E=g?Lt(g,p,h):1/0;globalThis.DEBUG_ENDLESS&&globalThis.DEBUG_ENDLESS("round",`${f} start ${E.toFixed(2)}`);let v=Qe;for(let k=0;k<v&&i.spent<a&&(k===v-1&&E<2&&v<3*Qe&&(v+=Qe),!(k===Math.floor(Qe/3)&&E>=8));k++){if(i.tries++,k%8===0&&l?.({tries:i.tries,spent:i.spent,budget:a}),E===0&&g){let w=oo(g,vo(p));h(4*w.explored);let A=Mo(g,w,{band:p,previous:n},s,r);if(globalThis.DEBUG_ENDLESS&&globalThis.DEBUG_ENDLESS("gate",A.join(" | ")),A.length)E=1;else{h(gt(g).reduce((y,b)=>y+b.ignored.length,0)*2*w.explored);let z=uo(g,w,vo(p));if(globalThis.DEBUG_ENDLESS&&globalThis.DEBUG_ENDLESS("useless",z.map(y=>y.problem).join(" | ")),!z.length)return{text:Tt(m,""),d:w};let M=Yr(z[0].unit.ignored);m=qr(m,M),g=T(m),E=g?Lt(g,p,h):1/0;continue}}let D=go(d,m),L=T(D);if(!L)continue;let H=Lt(L,p,h);(H<=E||Number.isFinite(H)&&d.next()<Math.exp(-(H-E)/Nr))&&(m=D,g=L,E=H)}globalThis.DEBUG_ENDLESS&&globalThis.DEBUG_ENDLESS("end",`${f} far ${E.toFixed(2)} spent ${i.spent}`)}return null}function zo(e,t,o,n={}){let s=n.budget??Kr,r=e.run.at(-1)??null,a=Ve(r?.explored??null,!1),i={tries:0,spent:0},l=d=>({text:d.text,explored:d.explored,shortest:d.shortest,from:"bank",...i});if(e.depth<=1||!r)return l(Lo(t,e,a));let c=e.run.slice(-Ro).map(d=>J(d.text)),h=xt(e.tier).some(d=>Xe.includes(d))?Ve(r.explored,!0):null,f=Zr([e.seed,e.tier,e.depth],e.tier,a,{explored:r.explored},o,c,s,i,n.progress,h);return f?{text:f.text,explored:f.d.explored,shortest:f.d.shortest,from:"made",...i}:l(Lo(t,e,a))}var Xr=150;function Oo(e){let t=null;return{receive(o){if(o.type==="make")try{t??=e.known();let n=-1/0,s=zo(o.request,e.bank,t,{...e.budget!==void 0?{budget:e.budget}:{},progress:r=>{let a=e.now();a-n<Xr||(n=a,e.post({type:"progress",id:o.id,progress:r}))}});e.post({type:"made",id:o.id,made:s})}catch(n){e.post({type:"failed",id:o.id,message:n instanceof Error?n.message:String(n)})}}}}var Po=[];var Co=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
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
`}];var Fo=[{id:"ch3-1",text:`title: The Rising Floor
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
`}];var Io=[{id:"ch5-1",text:`title: The Snare
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
`}];var $o=[{id:"ch6-1",text:`title: The Teleport
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
`}];var Wo=[{id:"ch7-1",text:`title: The Bronze Ball
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
`}];var jo=[{id:"ch8-1",text:`title: The Harpy
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
`}];var Ho=[{id:"ch10-1",text:`title: The Wooden Cow
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
`}];var Jr=[...Co,...Do,...Fo,...Bo,...Io,...$o,...Wo,...jo,...Go,...Ho];function _o(){return Jr.map(e=>J(e.text))}var Vr=Oo({post:e=>self.postMessage(e),bank:Po,known:()=>So(_o()),now:()=>performance.now()});self.onmessage=e=>Vr.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
