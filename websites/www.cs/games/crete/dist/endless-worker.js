"use strict";(()=>{var j=["up","down","left","right"],H={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},ue=["red","blue","yellow","green"],Rt=["flippers","fire-boots","skates","suction"],tt={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},W=(e,t,r,o={},l,n=t)=>({char:e,minotaur:t,block:r,hazard:n,...o,sprites:l??[]}),D={floor:W(".",!0,!0,{},["floor"]),wall:W("#",!1,!1,{},["wall"]),exit:W("E",!1,!1,{},["exit"]),gate:W("|",!1,!1,{},["gate-closed","gate-open"]),water:W("~",!1,!0,{needs:"flippers"},["water"]),fire:W("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:W("=",!0,!0,{slides:"skates"},["ice"]),"force-up":W("^",!0,!0,{carries:"up"},["force-up"]),"force-down":W("v",!0,!0,{carries:"down"},["force-down"]),"force-left":W("<",!0,!0,{carries:"left"},["force-left"]),"force-right":W(">",!0,!0,{carries:"right"},["force-right"]),dirt:W("%",!0,!0,{},["dirt"]),safe:W("S",!1,!1,{},["safe"]),button:W("_",!0,!0,{},["button"]),"toggle-open":W("t",!0,!1,{},["toggle-open"]),"toggle-closed":W("T",!1,!1,{},["toggle-closed"]),"door-red":W("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":W("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":W("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":W("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:W("&",!0,!0,{},["trap"]),"button-brown":W("-",!0,!0,{},["button-brown"]),"button-red":W("+",!0,!0,{},["button-red"]),popup:W(";",!1,!1,{},["popup"]),gravel:W(":",!1,!1,{},["gravel"]),"fake-wall":W("W",!1,!1,{},["wall"]),"invisible-wall":W("I",!1,!1,{},["floor"]),teleport:W("@",!1,!1,{},["teleport"]),thief:W("$",!0,!0,{},["thief"]),bomb:W("!",!1,!0,{},["bomb"],!0),clone:W("C",!1,!1,{},j.map(e=>`clone-${e}`))},re={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var Re={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:tt.mirror.name},cake:{char:"x",sprite:"cake",name:tt.cake.name},cow:{char:"c",sprite:"cow",name:tt.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},Ur=["theseus","minotaur","minotaur-stone","cow-standing"],qr=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],Qn=[...new Set([...Object.values(D).flatMap(e=>e.sprites),...qr,...Object.values(Re).map(e=>e.sprite),...Ur,...Object.values(re).map(e=>e.sprite)])];var Q=class extends Error{line;col;constructor(t,r,o){super(`line ${t}, column ${r}: ${o}`),this.line=t,this.col=r}},Yr=new Map(Object.entries(D).map(([e,t])=>[t.char,e])),Zr=new Map(Object.entries(Re).map(([e,t])=>[t.char,e])),Xr=/^[a-z0-9-]+$/,Jr=/^([a-z]+): (.*)$/,Vr=new Map(Object.entries(re).map(([e,t])=>[t.char,e])),Qr=["block","ball","glider","fireball"],en=["title","intro","hearts","relics","pages","facing","machines"];function tn(e,t){let r=e&&e.value!==""?e.value.split(" "):[],o=e??{line:1,col:1},l=new Set;for(let n of r){if(!Xr.test(n))throw new Q(o.line,o.col,`page id '${n}' must be lower-case letters, digits and hyphens`);if(l.has(n))throw new Q(o.line,o.col,`page '${n}' named twice`);l.add(n)}if(r.length>31)throw new Q(o.line,o.col,"a level holds at most 31 pages");if(r.length!==t)throw new Q(o.line,o.col,`pages: ${r.length} named but the grid has ${t}`);return r}function Lt(e,t,r,o,l){let n=t&&t.value!==""?t.value.split(" "):[],s=t??{line:1,col:1};for(let i of n)if(!o(i))throw new Q(s.line,s.col,`${e}: '${i}' is not ${l}`);if(n.length!==r)throw new Q(s.line,s.col,`${e}: ${n.length} named but the grid has ${r}`);return n}function rn(e){let t={},r=e.indexOf("trap"),o=e.indexOf("clone"),l=-1,n=-1;for(let s=e.length-1;s>=0;s--){let i=e[s];if(i==="button-brown"){let a=l>=0?l:r;a>=0&&(t[s]=a)}else if(i==="button-red"){let a=n>=0?n:o;a>=0&&(t[s]=a)}else i==="trap"?l=s:i==="clone"&&(n=s)}return t}function J(e){let t=e.replace(/\r\n/g,`
`).split(`
`),r={},o=0;for(;o<t.length;o++){let g=Jr.exec(t[o]);if(!g)break;if(!en.includes(g[1]))throw new Q(o+1,1,`unknown header '${g[1]}'`);r[g[1]]={value:g[2],line:o+1,col:g[1].length+3}}for(;o<t.length&&t[o]==="";)o++;let l=o,n=[];for(;o<t.length&&t[o]!=="";o++)n.push(t[o]);if(n.length===0)throw new Q(l+1,1,"no grid");for(;o<t.length;o++)if(t[o].trim()!=="")throw new Q(o+1,1,"text after the grid");let s=n[0].length,i=[],a=[],u=null,f=null,d=0,h=[],c=[],p=[];if(n.forEach((g,A)=>{let R=l+A+1;if(g.length!==s)throw new Q(R,1,`row is ${g.length} wide, expected ${s}`);[...g].forEach((v,y)=>{let b=y+1;if(v==="P"||v==="M"){if(v==="P"&&u)throw new Q(R,b,"second player");if(v==="M"&&f)throw new Q(R,b,"second Minotaur");v==="P"?u={r:A,c:y}:f={r:A,c:y},i.push("floor"),a.push(null);return}let O=Vr.get(v);if(O){c.push({kind:O,at:{r:A,c:y}}),i.push("floor"),a.push(null);return}let B=Yr.get(v),$=Zr.get(v);if(!B&&!$)throw new Q(R,b,`unknown tile '${v}'`);i.push(B??"floor"),a.push($??null),$==="relic"&&d++,B==="clone"&&p.push({r:A,c:y}),$==="page"&&h.push(A*s+y)})}),!u)throw new Q(l+1,1,"no player");let m=(g,A,R,v)=>{let y=r[g];if(!y)return A;let b=Number(y.value);if(!Number.isInteger(b)||b<R)throw new Q(y.line,y.col,`${g} must be ${R} to ${v}`);if(b>v){let O=g==="relics"?`relics: ${y.value} but the grid has ${v}`:`${g} must be ${R} to ${v}`;throw new Q(y.line,y.col,O)}return b},T=m("hearts",3,1,99),w=m("relics",d,0,d),E=tn(r.pages,h.length),S=Lt("facing",r.facing,c.length,g=>j.includes(g),"a direction"),k=c.map((g,A)=>({...g,dir:S[A],home:A})),F=Lt("machines",r.machines,p.length,g=>{let[A,R]=g.split("-");return Qr.includes(A)&&j.includes(R)&&g.split("-").length===2},"a template and a direction like block-up"),P=k.length,G=p.map((g,A)=>{let[R,v]=F[A].split("-"),y={at:g,template:R,dir:v};return R==="block"?y:{...y,home:P++}});return{title:r.title?.value??"",intro:r.intro?.value??"",hearts:T,relics:w,pageIds:E,pageCells:h,rows:n.length,cols:s,terrain:i,objects:a,player:u,minotaur:f,hazards:k,machines:G,links:rn(i)}}function ve(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let t=e.objects.filter(n=>n==="relic").length,r=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&r.push(`hearts: ${e.hearts}`),e.relics!==t&&r.push(`relics: ${e.relics}`),e.pageIds.length>0&&r.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&r.push(`facing: ${e.hazards.map(n=>n.dir).join(" ")}`),e.machines.length>0&&r.push(`machines: ${e.machines.map(n=>`${n.template}-${n.dir}`).join(" ")}`);let o=new Map(e.hazards.map(n=>[n.at.r*e.cols+n.at.c,n.kind])),l=[];for(let n=0;n<e.rows;n++){let s="";for(let i=0;i<e.cols;i++){let a=n*e.cols+i;e.player.r===n&&e.player.c===i?s+="P":e.minotaur&&e.minotaur.r===n&&e.minotaur.c===i?s+="M":o.has(a)?s+=re[o.get(a)].char:s+=e.objects[a]?Re[e.objects[a]].char:D[e.terrain[a]].char}l.push(s)}return`${r.join(`
`)}

${l.join(`
`)}
`}function Ot(e){let t=0;for(let r of e.objects)r==="cake"&&t++;return e.hearts+t}function se(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var ne=(e,t)=>t.r>=0&&t.c>=0&&t.r<e.rows&&t.c<e.cols,L=(e,t)=>t.r*e.level.cols+t.c;var K=(e,t)=>!!t&&e.r===t.r&&e.c===t.c,V=(e,t)=>({r:e.r+H[t][0],c:e.c+H[t][1]}),rt=e=>e.relicsLeft===0;var Le=e=>({...e,terrain:[...e.terrain],objects:[...e.objects],keys:{...e.keys},tools:{...e.tools},gear:[...e.gear],hazards:e.hazards.length>0?[...e.hazards]:e.hazards}),Y=(e,t)=>ne(e.level,t)?e.terrain[L(e,t)]:"wall",ie=(e,t)=>ne(e.level,t)?e.objects[L(e,t)]:null;var he=(e,t)=>e.hazards.length>0&&e.hazards.some(r=>K(t,r.at));function Oe(e,t){e.terrain=e.terrain.map(r=>r==="toggle-open"?"toggle-closed":r==="toggle-closed"?"toggle-open":r),t.push({kind:"flipped"})}var Ft=new WeakMap;function Dt(e){let t=Ft.get(e);return t||(t=e.terrain.flatMap((r,o)=>r==="teleport"?[o]:[]),Ft.set(e,t)),t}var It=e=>Dt(e).length>1;function nt(e,t,r,o){let{cols:l}=e.level,n=Dt(e.level),s=t.r*l+t.c,i=n.findIndex(a=>a>s);for(let a=0;a<n.length;a++){let u=n[((i<0?0:i)+a)%n.length];if(u===s)continue;let f={r:Math.floor(u/l),c:u%l},d=V(f,r);if(Y(e,d)!=="teleport"&&o(d))return{via:f,to:d}}return null}var Ct=new WeakMap;function nn(e){let t=Ct.get(e);if(!t){let r=new Map;for(let[o,l]of Object.entries(e.links)){if(e.terrain[l]!=="trap")continue;let n=r.get(l);n?n.push(Number(o)):r.set(l,[Number(o)])}t=r,Ct.set(e,t)}return t}function on(e,t){let r=nn(e.level).get(t);if(!r)return!1;let{cols:o}=e.level;return r.some(l=>{let n={r:Math.floor(l/o),c:l%o};return K(n,e.player)||ie(e,n)==="block"||he(e,n)})}var te=(e,t)=>Y(e,t)==="trap"&&!on(e,t.r*e.level.cols+t.c);function Bt(e,t,r){if(!ne(e.level,r))return!1;let o=Y(e,r);return D[o].hazard||re[t].crosses===o}var Fe=(e,t,r)=>Bt(e,t,r)&&!ie(e,r)&&!K(r,e.minotaur)&&!K(r,e.cow)&&!he(e,r),Ce=(e,t,r)=>K(r,e.player)?Bt(e,t,r):Fe(e,t,r);function ot(e,t,r,o,l=!1){let n=e.hazards[t],s=Y(e,n.at);return s==="bomb"?(e.terrain[L(e,n.at)]="floor",e.hazards.splice(t,1),r.push({kind:"exploded",who:"hazard",at:n.at}),"gone"):(s==="button"?Oe(e,r):s==="button-red"&&De(e,L(e,n.at),r,o,l),te(e,n.at)&&r.push({kind:"held",who:"hazard",at:n.at}),"on")}function De(e,t,r,o,l=!1){let n=e.level.links[t];if(n===void 0)return;let s=e.level.machines.find(f=>L(e,f.at)===n),i=V(s.at,s.dir);if(o&&K(i,o))return;if(s.template==="block"){if(!Ie(e,i))return;e.objects[L(e,i)]="block",r.push({kind:"cloned",what:"block",at:i}),st(e,i,s.dir,o,r,l);return}if(!Fe(e,s.template,i)||K(i,e.player))return;let a={kind:s.template,at:i,dir:s.dir,home:s.home};e.hazards.length===0&&(e.hazards=[]);let u=e.hazards.length;if(!l){let f=L(e,i);for(;u>0&&L(e,e.hazards[u-1].at)>f;)u--}e.hazards.splice(u,0,a),r.push({kind:"cloned",what:s.template,at:i}),ot(e,u,r,o,l)}function sn(e,t){let r=e.hazards[t];if(r)return r.at;let o=e.machines.find(l=>l.home===t);return V(o.at,o.dir)}function lt(e,t,r){Y(e,t)==="popup"&&(e.terrain[L(e,t)]="wall",r.push({kind:"rose",at:t}))}var ln=(e,t,r)=>Fe(e,t,r)&&Y(e,r)!=="bomb"&&!K(r,e.player);function an(e,t,r){let o=sn(e.level,r),l=new Set([L(e,o)]),n=[o];for(;n.length>0;){let s=n.filter(a=>ln(e,t,a)).sort((a,u)=>L(e,a)-L(e,u));if(s.length>0)return s[0];let i=[];for(let a of n)for(let u of j){let f=V(a,u);!ne(e.level,f)||l.has(L(e,f))||(l.add(L(e,f)),i.push(f))}n=i}return null}function $t(e,t,r){let o=e.hazards.findIndex(s=>K(t,s.at));if(o<0)return;let l=e.hazards[o];e.hazards.splice(o,1);let n=an(e,l.kind,l.home);n&&(e.hazards.push({...l,at:n}),e.hazards.sort((s,i)=>L(e,s.at)-L(e,i.at))),r.push({kind:"sent-home",from:t,to:n})}function me(e,t,r,o){if(e.hearts--,t.push(o?{kind:"caught",at:e.player,hearts:e.hearts,by:r,hazard:o}:{kind:"caught",at:e.player,hearts:e.hearts,by:r}),e.hearts<=0){e.outcome="lost",t.push({kind:"lost"});return}lt(e,e.player,t),e.player=e.throwBack;let l=null;K(e.player,e.minotaur)&&(l=e.level.minotaur,e.minotaur=l,K(l,e.cow)&&(e.cow=null)),$t(e,e.player,t),l&&$t(e,l,t)}function Be(e,t){if(e.outcome!=="playing")return!0;for(let r=0;r<t.length;r++)if(t[r].kind==="caught")return!0;return!1}function Wt(e,t){return ne(e.level,t)&&D[Y(e,t)].minotaur&&ie(e,t)!=="block"&&!he(e,t)}function jt(e,t,r){return e.minotaur=t,te(e,t)&&r.push({kind:"held",who:"minotaur",at:t}),K(t,e.cow)&&(e.cow=null),K(t,e.player)?(me(e,r,"minotaur"),!0):!1}function un(e,t){let r=e.minotaur;if(!r)return!0;if(te(e,r))return!1;let o=e.cow??e.player,l=Math.sign(o.c-r.c),n=Math.sign(o.r-r.r),s=[];l&&s.push(l>0?"right":"left"),n&&s.push(n>0?"down":"up");let i=s.find(d=>Wt(e,V(r,d)));if(!i)return!1;let a=V(r,i);if(t.push({kind:"moved",who:"minotaur",from:r,to:a}),jt(e,a,t))return!0;let u=i,f=new Set([L(e,a)]);for(;;){let d=D[Y(e,e.minotaur)];if(d.carries)u=d.carries;else if(!d.slides)return!1;let h=V(e.minotaur,u);if(!Wt(e,h)||f.has(L(e,h)))return!1;if(t.push({kind:"slid",who:"minotaur",from:e.minotaur,to:h}),f.add(L(e,h)),jt(e,h,t))return!0}}function Ht(e,t){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let r=0;r<2&&e.outcome==="playing";r++)if(un(e,t))return}}var cn={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function hn(e,t,r){return K(e.hazards[t].at,e.player)?(K(e.player,e.cow)&&(e.cow=null),me(e,r,"hazard",e.hazards[t].kind),"caught"):ot(e,t,r,void 0,!0)}function dn(e,t,r){let o=e.hazards[t];if(te(e,o.at))return"on";let l=o.dir;if(!Ce(e,o.kind,V(o.at,l))){l=void 0;for(let i of re[o.kind].turns){let a=cn[i][o.dir];if(Ce(e,o.kind,V(o.at,a))){l=a;break}}}if(!l)return"on";let n=V(o.at,l);r.push({kind:"moved",who:"hazard",hazard:o.kind,from:o.at,to:n});let s=null;for(;;){o=e.hazards[t]={...o,at:n,dir:l};let i=hn(e,t,r);if(i!=="on")return i;let a=D[Y(e,n)];if(a.carries)l=a.carries,o.dir!==l&&(o=e.hazards[t]={...o,dir:l});else if(!a.slides)return"on";s??=new Set([L(e,n)]);let u=V(n,l);if(s.has(L(e,u))||!Ce(e,o.kind,u))return"on";r.push({kind:"slid",who:"hazard",hazard:o.kind,from:n,to:u}),s.add(L(e,u)),n=u}}function Gt(e,t){if(e.hazards.length!==0){for(let r=0,o=e.hazards.length;r<o;){let l=dn(e,r,t);if(l==="caught")break;l==="gone"?o--:r++}e.hazards.sort((r,o)=>L(e,r.at)-L(e,o.at))}}function Ie(e,t){return ne(e.level,t)&&D[Y(e,t)].block&&!ie(e,t)&&!K(t,e.player)&&!K(t,e.minotaur)&&!K(t,e.cow)&&!K(t,e.throwBack)&&!K(t,e.level.minotaur)&&!he(e,t)}function at(e,t,r,o){let l=V(t,r);if(Y(e,l)!=="teleport")return Ie(e,l)&&o(l)?{entry:l,to:l}:null;if(K(l,e.player))return null;let n=nt(e,l,r,s=>Ie(e,s)&&o(s));return n&&{entry:l,via:n.via,to:n.to}}function Kt(e,t,r,o,l){e.objects[L(e,t)]=null,e.objects[L(e,r.to)]="block",l.push(o==="pushed"?{kind:"pushed",from:t,to:r.entry}:{kind:"slid",who:"block",from:t,to:r.entry}),r.via&&l.push({kind:"teleported",who:"block",from:r.entry,via:r.via,to:r.to})}function st(e,t,r,o,l,n=!1){let s=t,i=r,a=new Set([L(e,s)]);for(o&&a.add(L(e,o));;){let u=Y(e,s);if(u==="water"||u==="bomb"){e.objects[L(e,s)]=null,e.terrain[L(e,s)]=u==="water"?"dirt":"floor",l.push(u==="water"?{kind:"sank",at:s}:{kind:"exploded",who:"block",at:s});return}u==="button"?Oe(e,l):u==="button-red"&&De(e,L(e,s),l,o,n),te(e,s)&&l.push({kind:"held",who:"block",at:s});let f=D[u];if(f.carries)i=f.carries;else if(!f.slides)return;let d=at(e,s,i,h=>!a.has(L(e,h)));if(!d)return;Kt(e,s,d,"slid",l),a.add(L(e,d.to)),s=d.to}}var fn=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Nt(e,t,r,o){if(!ne(e.level,t)||K(t,e.minotaur))return!1;let l=Y(e,t),n=D[l];return fn.has(l)||l==="teleport"&&!It(e.level)||l==="gate"&&!rt(e)||n.needs&&!e.gear.includes(n.needs)||n.door&&e.keys[n.door]<=0?!1:he(e,t)||ie(e,t)!=="block"?!0:!o&&!te(e,t)&&!!at(e,t,r,()=>!0)}function ut(e,t,r,o,l){if(!Nt(e,t,r,o))return!1;if(he(e,t))return me(e,l,"hazard",e.hazards.find(s=>K(s.at,t)).kind),!1;let n=D[Y(e,t)];if(n.door&&(n.door!=="green"&&e.keys[n.door]--,e.terrain[L(e,t)]="floor",l.push({kind:"opened",color:n.door,at:t})),ie(e,t)==="block"){let s=at(e,t,r,()=>!0);Kt(e,t,s,"pushed",l),st(e,s.to,r,t,l)}return!0}function ct(e,t,r,o,l){lt(e,e.player,l),e.player=t;let n=Y(e,t);if(n==="bomb")return e.terrain[L(e,t)]="floor",l.push({kind:"exploded",who:"player",at:t}),me(e,l,"bomb"),!0;let s=ie(e,t);if(s&&s!=="block"&&(e.objects[L(e,t)]=null,l.push({kind:"took",what:s,at:t}),s==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):s==="page"?e.pages|=1<<e.level.pageCells.indexOf(L(e,t)):s.startsWith("key-")?e.keys[s.slice(4)]++:s==="mirror"||s==="cake"||s==="cow"?e.tools[s]++:e.gear.includes(s)||e.gear.push(s)),n==="thief"&&e.gear.length>0&&(l.push({kind:"robbed",at:t,gear:e.gear}),e.gear=[]),n==="safe"&&(e.throwBack=t),te(e,t)&&l.push({kind:"held",who:"player",at:t}),n==="button"?Oe(e,l):n==="button-red"&&De(e,L(e,t),l),n==="exit"&&rt(e)&&(e.outcome="won",l.push({kind:"won"})),n==="teleport"){let i=nt(e,t,r,a=>Nt(e,a,r,o));return i?ut(e,i.to,r,o,l)?(l.push({kind:"teleported",who:"player",from:t,via:i.via,to:i.to}),ct(e,i.to,r,o,l)):!0:!1}return!1}function pn(e,t,r){let o=t,l=new Set([L(e,e.player)]);for(;e.outcome==="playing";){let n=D[Y(e,e.player)];if(n.carries&&!e.gear.includes("suction"))o=n.carries;else if(!n.slides||e.gear.includes(n.slides))return;let s=V(e.player,o);if(l.has(L(e,s))||!ut(e,s,o,!0,r)||(r.push({kind:"slid",who:"player",from:e.player,to:s}),l.add(L(e,s)),ct(e,s,o,!0,r)))return;l.add(L(e,e.player))}}function it(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0}function mn(e,t,r){if(t.kind==="move"){let o=e.player;if(te(e,o))return!1;let l=V(o,t.dir),n=Y(e,l);if(n==="invisible-wall")return e.terrain[L(e,l)]="wall",r.push({kind:"revealed",at:l,what:n}),"shown";if(n==="fake-wall"&&(e.terrain[L(e,l)]="floor",r.push({kind:"revealed",at:l,what:n})),ut(e,l,t.dir,!1,r))r.push({kind:"moved",who:"player",from:o,to:l}),ct(e,l,t.dir,!1,r)||pn(e,t.dir,r);else if(!Be(e,r))return!1}else if(t.kind==="tool"){if(e.tools[t.tool]<=0)return!1;if(t.tool==="cake")e.hearts++;else if(t.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,r.push({kind:"stoned",turns:3});e.tools[t.tool]--}return!0}function _t(e,t){return it(e.terrain,t.terrain)&&(e.terrain=t.terrain),it(e.objects,t.objects)&&(e.objects=t.objects),it(e.hazards,t.hazards)&&(e.hazards=t.hazards),e}function $e(e,t){return t===e||t.moves===e.moves}function le(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let r=Le(e),o=[],l=mn(r,t,o);if(!l)return{state:e,events:[]};if(l==="shown")return{state:_t(r,e),events:o};let n=t.kind==="tool"&&t.tool==="mirror";return Be(r,o)||Gt(r,o),!n&&!Be(r,o)&&Ht(r,o),r.moves++,{state:_t(r,e),events:o}}var We=["mirror","cake","cow"],de=e=>e<=0?0:32-Math.clz32(e),Ut=new WeakMap;function ae(e){let t=Ut.get(e);return t||Ut.set(e,t=wn(e)),t}function bn(e){let t=new Set,r=[],o=a=>{let u=e.terrain[a];return D[u].block||D[u].door!==void 0||u==="fake-wall"},l=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,n=(a,u)=>a>=0&&u>=0&&a<e.rows&&u<e.cols,s=a=>{t.has(a)||a===l||!o(a)||(t.add(a),r.push(a))};e.objects.forEach((a,u)=>{a==="block"&&(t.add(u),r.push(u))});for(let a of e.machines){let u=a.at.r+H[a.dir][0],f=a.at.c+H[a.dir][1];a.template==="block"&&n(u,f)&&s(u*e.cols+f)}let i=[];for(e.terrain.forEach((a,u)=>{a==="teleport"&&i.push(u)});r.length;){let a=r.pop(),u=Math.floor(a/e.cols),f=a%e.cols,d=D[e.terrain[a]],h=d.slides!==void 0||d.carries!==void 0;for(let c of j){let[p,m]=H[c],T=u+p,w=f+m;if(!n(T,w))continue;let E=u-p,S=f-m;if(!(n(E,S)&&e.terrain[E*e.cols+S]!=="wall")&&!h)continue;let F=T*e.cols+w;if(e.terrain[F]!=="teleport"){s(F);continue}for(let P of i){let G=Math.floor(P/e.cols)+p,g=P%e.cols+m;n(G,g)&&s(G*e.cols+g)}}}return t}var yn={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},ht=e=>yn[e]??(D[e].door!==void 0?"floor":void 0);function gn(e,t){let r=new Set(t.map(l=>re[l].crosses)),o=[];return e.terrain.forEach((l,n)=>{let s=ht(l);(D[l].hazard||r.has(l)||l==="toggle-closed"||s&&D[s].hazard)&&o.push(n)}),o}function wn(e){let t=y=>e.objects.filter(b=>b===y).length,r=bn(e),o=[],l=[],n=[],s=[],i=[];e.terrain.forEach((y,b)=>{ht(y)?o.push(b):(y==="toggle-open"||y==="toggle-closed")&&l.push(b);let O=e.objects[b];r.has(b)?(O&&O!=="block"?i:s).push(b):O&&n.push(b)});let a=e.rows*e.cols,u=ue.map(y=>de(t(`key-${y}`))),f=We.map(y=>de(t(y))),d=Rt.filter(y=>t(y)>0),h=de(a),c=t("cow")>0,p=e.minotaur!==null,m=t("mirror")>0?2:0,T=h*(2+(p?1:0)+(c?1:0))+m,w=de(Ot(e)),E=T+w+de(e.relics),S=[],k=E+e.pageIds.length;for(let y of u)S.push(k),k+=y;let F=[];for(let y of f)F.push(k),k+=y;let P=[...e.hazards.map(y=>y.kind)];for(let y of e.machines)y.home!==void 0&&(P[y.home]=y.template);let G=P.length>e.hazards.length,g=G?0:e.hazards.length,A=G?gn(e,P):[],R=G?de(4*P.length):0,v=h*(2+(p?1:0)+(c?1:0))+m+w+de(e.relics)+e.pageIds.length+u.reduce((y,b)=>y+b,0)+f.reduce((y,b)=>y+b,0)+d.length+o.length+(l.length?1:0)+n.length+s.length+2*i.length+g*(h+2)+A.length*R;return{words:Math.max(1,Math.ceil(v/32)),cellBits:h,none:a,minotaur:p,cow:c,stoneBits:m,heartBits:w,relicBits:de(e.relics),pageBits:e.pageIds.length,keyBits:u,toolBits:f,gear:d,heartAt:T,pageAt:E,keyAt:S,toolAt:F,gearAt:k,changing:Int32Array.from(o),toggles:Int32Array.from(l),fixed:Int32Array.from(n),blockOnly:Int32Array.from(s),blockOrObject:Int32Array.from(i),hazardSlots:g,hazardCells:Int32Array.from(A),hazardBits:R,homeKinds:P}}function Z(e,t,r,o,l){if(o===0)return r;let n=t+(r>>>5),s=r&31;return e[n]|=l<<s,s+o>32&&(e[n+1]|=l>>>32-s),r+o}function Ae(e,t,r,o){if(o===0)return 0;let l=t+(r>>>5),n=r&31,s=e[l]>>>n;return n+o>32&&(s|=e[l+1]<<32-n),o===32?s>>>0:s&(1<<o)-1}var fe=(e,t,r)=>t?t.r*e.level.cols+t.c:r;function we(e,t,r,o){let l=t;for(let i=0;i<l.words;i++)r[o+i]=0;let n=0;n=Z(r,o,n,l.cellBits,fe(e,e.player,l.none)),n=Z(r,o,n,l.cellBits,fe(e,e.throwBack,l.none)),l.minotaur&&(n=Z(r,o,n,l.cellBits,fe(e,e.minotaur,l.none))),l.cow&&(n=Z(r,o,n,l.cellBits,fe(e,e.cow,l.none))),n=Z(r,o,n,l.stoneBits,e.stone),n=Z(r,o,n,l.heartBits,e.hearts),n=Z(r,o,n,l.relicBits,e.relicsLeft),n=Z(r,o,n,l.pageBits,e.pages);for(let i=0;i<ue.length;i++)n=Z(r,o,n,l.keyBits[i],e.keys[ue[i]]);for(let i=0;i<We.length;i++)n=Z(r,o,n,l.toolBits[i],e.tools[We[i]]);for(let i of l.gear)n=Z(r,o,n,1,e.gear.includes(i)?1:0);for(let i of l.changing)n=Z(r,o,n,1,e.terrain[i]===e.level.terrain[i]?0:1);l.toggles.length&&(n=Z(r,o,n,1,e.terrain[l.toggles[0]]===e.level.terrain[l.toggles[0]]?0:1));for(let i of l.fixed)n=Z(r,o,n,1,e.objects[i]?1:0);for(let i of l.blockOnly)n=Z(r,o,n,1,e.objects[i]==="block"?1:0);for(let i of l.blockOrObject)n=Z(r,o,n,2,e.objects[i]==="block"?2:e.objects[i]?1:0);if(l.hazardSlots>1&&e.hazards.some((i,a)=>a>0&&fe(e,i.at,l.none)<fe(e,e.hazards[a-1].at,l.none)))throw new Error("the hazards must be sorted by cell");for(let i=0;i<l.hazardSlots;i++){let a=e.hazards.find(u=>u.home===i);n=Z(r,o,n,l.cellBits,a?fe(e,a.at,l.none):l.none),n=Z(r,o,n,2,a?j.indexOf(a.dir):0)}let s=0;for(let i of l.hazardCells){let a=e.hazards[s],u=a!==void 0&&fe(e,a.at,l.none)===i;n=Z(r,o,n,l.hazardBits,u?1+j.indexOf(a.dir)+4*a.home:0),u&&s++}if(l.hazardCells.length&&s!==e.hazards.length)throw new Error(`packed ${s} of ${e.hazards.length} hazards: they must be sorted by cell`)}function je(e,t,r,o,l=0){let n=r,s=0,i=g=>{let A=Ae(e,t,s,g);return s+=g,A},a=g=>{let A=i(g);return A===n.none?null:{r:Math.floor(A/o.cols),c:A%o.cols}},u=a(n.cellBits),f=a(n.cellBits),d=n.minotaur?a(n.cellBits):null,h=n.cow?a(n.cellBits):null,c=i(n.stoneBits),p=i(n.heartBits),m=i(n.relicBits),T=i(n.pageBits),w={red:0,blue:0,yellow:0,green:0};ue.forEach((g,A)=>{w[g]=i(n.keyBits[A])});let E={mirror:0,cake:0,cow:0};We.forEach((g,A)=>{E[g]=i(n.toolBits[A])});let S=[];for(let g of n.gear)i(1)&&S.push(g);let k=[...o.terrain];for(let g of n.changing)i(1)&&(k[g]=ht(o.terrain[g]));if(n.toggles.length&&i(1))for(let g of n.toggles)k[g]=o.terrain[g]==="toggle-open"?"toggle-closed":"toggle-open";let F=[...o.objects];for(let g of n.fixed)i(1)||(F[g]=null);for(let g of n.blockOnly)F[g]=i(1)?"block":null;for(let g of n.blockOrObject){let A=i(2);A===0?F[g]=null:A===2&&(F[g]="block")}let P=[],G=g=>({r:Math.floor(g/o.cols),c:g%o.cols});for(let g=0;g<n.hazardSlots;g++){let A=i(n.cellBits),R=j[i(2)];A!==n.none&&P.push({kind:n.homeKinds[g],at:G(A),dir:R,home:g})}P.sort((g,A)=>g.at.r*o.cols+g.at.c-(A.at.r*o.cols+A.at.c));for(let g of n.hazardCells){let A=i(n.hazardBits);if(!A)continue;let R=A-1>>>2;P.push({kind:n.homeKinds[R],at:G(g),dir:j[A-1&3],home:R})}return{level:o,terrain:k,objects:F,player:u,hearts:p,keys:w,gear:S,tools:E,pages:T,throwBack:f,minotaur:d,stone:c,cow:h,hazards:P,relicsLeft:m,moves:l,outcome:"playing"}}var Zt=new Set(["wall","invisible-wall","clone"]);function kn(e,t,r,o){let l=(u,f)=>u>=0&&f>=0&&u<e.rows&&f<e.cols&&!Zt.has(e.terrain[u*e.cols+f]),n=new Set,s=new Set,i=[],a=(u,f,d)=>{if(!l(u,f))return;let h=(u*e.cols+f)*4+j.indexOf(d);s.has(h)||(s.add(h),n.add(u*e.cols+f),i.push([u,f,d]))};for(a(Math.floor(t/e.cols)+H[r][0],t%e.cols+H[r][1],r);i.length;){let[u,f,d]=i.pop(),h=e.terrain[u*e.cols+f];if(h==="teleport"){for(let m of o){if(m===u*e.cols+f)continue;let T=Math.floor(m/e.cols)+H[d][0],w=m%e.cols+H[d][1];l(T,w)&&e.terrain[T*e.cols+w]!=="teleport"&&a(T,w,d)}continue}let c=D[h],p=c.carries??(c.slides?d:null);p&&a(u+H[p][0],f+H[p][1],p)}return[...n]}function xn(e){let t=e.rows*e.cols,r=e.terrain.map(s=>!Zt.has(s)),o=e.terrain.flatMap((s,i)=>s==="teleport"?[i]:[]),l=Array.from({length:t},()=>[]);for(let s=0;s<t;s++)if(r[s])for(let i of j)for(let a of kn(e,s,i,o.length>1?o:[]))l[a].push(s);let n=new Uint8Array(t);return e.terrain.forEach((s,i)=>{s==="safe"&&(n[i]=1)}),n[e.player.r*e.cols+e.player.c]=1,{n:t,open:r,into:l,thrown:n}}function qt(e,t){let r=new Float64Array(e.n).fill(1/0),o=new Int32Array(e.n),l=0;for(let s of t)r[s]===1/0&&(r[s]=0,o[l++]=s);let n=!1;for(let s=0;s<l;s++){let i=o[s],a=r[i]+1;for(let u of e.into[i])r[u]===1/0&&(r[u]=a,o[l++]=u);if(!n&&e.thrown[i]){n=!0;for(let u=0;u<e.n;u++)e.open[u]&&r[u]===1/0&&(r[u]=a,o[l++]=u)}}return r}function Tn(e){let t=xn(e),r=e.terrain.flatMap((s,i)=>s==="exit"?[i]:[]),o=qt(t,r),l=e.objects.flatMap((s,i)=>s==="relic"?[i]:[]),n=l.map(s=>qt(t,[s]));return s=>{if(s.outcome==="won")return 0;if(s.outcome==="lost")return 1/0;let i=s.player.r*e.cols+s.player.c,a=o[i];if(s.relicsLeft===0)return a;let u=0,f=1/0,d=0;for(let h=0;h<l.length;h++){if(s.objects[l[h]]!=="relic")continue;let c=n[h][i];u++,c<f&&(f=c),c>d&&(d=c)}return u<s.relicsLeft?1/0:Math.max(a,u===s.relicsLeft?d:f)}}var Yt=new WeakMap;function He(e){let t=Yt.get(e);return t||Yt.set(e,t=Tn(e)),t}var ke=class extends Error{},Xt=1024;function Ge(e,t,r){let o=2538058380;for(let l=0;l<r;l++){let n=Math.imul(e[t+l],3432918353);n=Math.imul(n<<15|n>>>17,461845907),o^=n,o=Math.imul(o<<13|o>>>19,5)+3864292196}return o^=r,o=Math.imul(o^o>>>16,2246822507),o=Math.imul(o^o>>>13,3266489909),(o^o>>>16)>>>0}function _e(e){let t=e,r=Xt,o=new Uint32Array(r*t),l=new Uint32Array(r),n=new Int32Array(r),s=new Uint8Array(r),i=new Uint32Array(r),a=0,u=new Int32Array(Xt*2),f=u.length-1;function d(){r*=2;let c=new Uint32Array(r*t);c.set(o),o=c;let p=new Uint32Array(r);p.set(l),l=p;let m=new Int32Array(r);m.set(n),n=m;let T=new Uint8Array(r);T.set(s),s=T;let w=new Uint32Array(r);w.set(i),i=w,u=new Int32Array(r*2),f=u.length-1;for(let E=0;E<a;E++){let S=l[E]&f;for(;u[S]!==0;)S=S+1&f;u[S]=E+1}}function h(c,p,m){let T=c*t;for(let w=0;w<t;w++)if(o[T+w]!==p[m+w])return!1;return!0}return{get size(){return a},add(c,p,m,T,w){let E=Ge(c,p,t),S=E&f;for(let F=u[S];F!==0;S=S+1&f,F=u[S]){let P=F-1;if(!(l[P]!==E||!h(P,c,p)))return w>=i[P]?-1:(n[P]=m,s[P]=T,i[P]=w,P)}if(a===r)for(d(),S=E&f;u[S]!==0;)S=S+1&f;let k=a++;return o.set(c.subarray(p,p+t),k*t),l[k]=E,n[k]=m,s[k]=T,i[k]=w,u[S]=k+1,k},words(c,p,m){p.set(o.subarray(c*t,c*t+t),m)},parent:c=>n[c],action:c=>s[c],g:c=>i[c]}}var Se=["mirror","cake","cow"],be=j.length,Ke=[...j.map(e=>({kind:"move",dir:e})),{kind:"wait"},...Se.map(e=>({kind:"tool",tool:e}))],dt=[be,...j.map((e,t)=>t),...Se.map((e,t)=>be+1+t)];function Jt(e,t){let r=[];for(let o=t;e.parent(o)>=0;o=e.parent(o))r.push(Ke[e.action(o)]);return r.reverse()}function ft(e,t){return mt(pt(e,t),t.onProgress)}function*pt(e,t){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let r=t.store??_e(ae(e.level).words),o=n=>{if(n instanceof ke)return{solved:!1,explored:r.size,capped:!0,reason:n.message};throw n},l;try{l=En(e,t,r)}catch(n){return o(n)}for(;;){let n;try{n=l()}catch(s){return o(s)}if("explored"in n)return n;yield n}}function mt(e,t){for(;;){let r=e.next();if(r.done)return r.value;t?.(r.value)}}function En(e,t,r){let{cap:o,refuse:l}=t,n=t.prune??null,s=Math.max(1,t.progressEvery??65536),i=e.level,a=ae(i),u=He(i),f=new Uint32Array(a.words),d=1024,h=new Int32Array(d),c=new Int32Array(d),p=new Int32Array(d),m=new Uint8Array(d),T=new Uint16Array(d),w=new Int32Array(d),E=0,S=v=>{if(v<d)return;for(;d<=v;)d*=2;let y=new Int32Array(d);y.set(h),h=y;let b=new Int32Array(d);b.set(c),c=b;let O=new Int32Array(d);O.set(p),p=O;let B=new Uint8Array(d);B.set(m),m=B;let $=new Uint16Array(d);$.set(T),T=$},k=(v,y)=>h[v]<h[y]||h[v]===h[y]&&(c[v]<c[y]||c[v]===c[y]&&(T[v]>T[y]||T[v]===T[y]&&v<y)),F=v=>{let y=w[v];for(;v>0;){let b=v-1>>1,O=w[b];if(!k(y,O))break;w[v]=O,p[O]=v,v=b}w[v]=y,p[y]=v},P=v=>{if(E===w.length){let y=new Int32Array(w.length*2);y.set(w),w=y}w[E]=v,F(E++)},G=()=>{let v=w[0];p[v]=-1;let y=w[--E];if(E>0){let b=0;for(;;){let O=2*b+1;if(O>=E)break;let B=O+1,$=B<E&&k(w[B],w[O])?B:O;if(!k(w[$],y))break;w[b]=w[$],p[w[b]]=b,b=$}w[b]=y,p[y]=b}return v},g=u(e);if(we(e,a,f,0),n&&n({...e,moves:0},f,0))return()=>({solved:!1,explored:0,capped:!1});let A=r.add(f,0,-1,0,0);if(r.size>=o)return()=>({solved:!1,explored:r.size,capped:!0});S(A),c[A]=Number.isFinite(g)?g:-1,h[A]=c[A],p[A]=-1,T[A]=e.hearts,c[A]>=0&&P(A);let R=0;return()=>{let v=null;for(;E>0;){if(v)return v;let y=G();if(m[y])return{solved:!0,line:Jt(r,y),explored:r.size};let b=h[y],O=b-c[y];++R%s===0&&(v={expanded:R,stored:r.size,bestF:b,startH:g}),r.words(y,f,0);let B=je(f,0,a,i,O);for(let $ of dt){if($>be&&B.tools[Se[$-be-1]]<=0)continue;let ee=le(B,Ke[$]),C=ee.state;if($e(B,C)||C.outcome==="lost"||l&&l(ee.events,B)||(we(C,a,f,0),n&&n(C,f,0)))continue;let x=r.size,M=r.add(f,0,y,$,O+1);if(M<0)continue;let z=C.outcome==="won";if(r.size>x){S(M);let I=z?0:u(C);c[M]=Number.isFinite(I)?I:-1,p[M]=-1,m[M]=z?1:0,T[M]=C.hearts}if(z&&O+1===b)return{solved:!0,line:Jt(r,M),explored:r.size};if(r.size>=o)return{solved:!1,explored:r.size,capped:!0};c[M]<0||(h[M]=O+1+c[M],p[M]>=0?F(p[M]):P(M))}}return{solved:!1,explored:r.size,capped:!1}}}function Mn(e,t){for(let r=0;r<e.terrain.length;r++){if(!t(e.terrain[r]))continue;let o=Math.floor(r/e.cols),l=r%e.cols;for(let n of j){let s=o-H[n][0],i=l-H[n][1];if(s<0||i<0||s>=e.rows||i>=e.cols)continue;let a=D[e.terrain[s*e.cols+i]];if(a.slides||a.carries===n)return!0}}return!1}function vn(e,t){let r=e.terrain.flatMap((o,l)=>o==="teleport"?[l]:[]);return r.length<2?!1:r.some(o=>j.some(l=>{let n=Math.floor(o/e.cols)+H[l][0],s=o%e.cols+H[l][1];return n>=0&&s>=0&&n<e.rows&&s<e.cols&&t(e.terrain[n*e.cols+s])}))}var Vt=(e,t)=>Mn(e,t)||vn(e,t);function An(e,t){let r=[];t.heartBits&&r.push({pos:t.heartAt,width:t.heartBits,set:!1}),t.pageBits&&r.push({pos:t.pageAt,width:t.pageBits,set:!0}),ue.forEach((l,n)=>{t.keyBits[n]&&!Vt(e,s=>D[s].door===l)&&r.push({pos:t.keyAt[n],width:t.keyBits[n],set:!1})}),t.toolBits.forEach((l,n)=>{l&&r.push({pos:t.toolAt[n],width:l,set:!1})});let o=["flippers","fire-boots"];return t.gear.forEach((l,n)=>{o.includes(l)&&!Vt(e,s=>D[s].needs===l)&&r.push({pos:t.gearAt+n,width:1,set:!1})}),r}var bt=1024;function Ne(e,t){let r=He(e),o=An(e,t);if(!o.length)return R=>r(R)===1/0;let l=t.words,n=new Uint32Array(l);for(let R of o)for(let v=R.pos;v<R.pos+R.width;v++)n[v>>>5]|=1<<(v&31);let s=[],i=0;for(let R of o)s.push(i),i+=R.width;let a=i+31>>>5,u=bt,f=new Uint32Array(u*l),d=new Int32Array(u),h=0,c=new Int32Array(bt*2),p=c.length-1,m=bt,T=new Uint32Array(m*a),w=new Uint32Array(m),E=new Int32Array(m),S=0,k=-1,F=new Uint32Array(l),P=new Uint32Array(a);function G(){u*=2;let R=new Uint32Array(u*l);R.set(f),f=R;let v=new Int32Array(u);v.set(d),d=v,c=new Int32Array(u*2),p=c.length-1;for(let y=0;y<h;y++){let b=Ge(f,y*l,l)&p;for(;c[b]!==0;)b=b+1&p;c[b]=y+1}}function g(R,v){let y=k;if(y>=0)k=E[y];else{if(S===m){m*=2;let b=new Uint32Array(m*a);b.set(T),T=b;let O=new Uint32Array(m);O.set(w),w=O;let B=new Int32Array(m);B.set(E),E=B}y=S++}return T.set(P,y*a),w[y]=R,E[y]=v,y}function A(R,v,y,b){for(let O=0;O<o.length;O++){let B=o[O],$=Ae(R,v,s[O],B.width),ee=Ae(y,b,s[O],B.width);if(B.set?($&ee)!==ee:$<ee)return!1}return!0}return(R,v,y)=>{if(r(R)===1/0)return!0;let b=R.moves;for(let C=0;C<l;C++)F[C]=v[y+C]&~n[C];let O=Ge(F,0,l);P.fill(0);for(let C=0;C<o.length;C++)Z(P,0,s[C],o[C].width,Ae(v,y,o[C].pos,o[C].width));let B=O&p,$=-1;for(let C=c[B];C!==0;B=B+1&p,C=c[B]){let x=C-1,M=!0;for(let z=0;z<l&&M;z++)M=f[x*l+z]===F[z];if(M){$=x;break}}if($<0){if(h===u)for(G(),B=O&p;c[B]!==0;)B=B+1&p;return $=h++,f.set(F,$*l),c[B]=$+1,d[$]=g(b,-1),!1}for(let C=d[$];C>=0;C=E[C])if(w[C]<=b&&A(T,C*a,P,0))return!0;let ee=-1;for(let C=d[$];C>=0;){let x=E[C];b<=w[C]&&A(P,0,T,C*a)?(ee<0?d[$]=x:E[ee]=x,E[C]=k,k=C):ee=C,C=x}return d[$]=g(b,d[$]),!1}}var pe=2e6,xe=e=>e.some(t=>t.kind==="caught");function Pe(e,t=pe){return ft(e,{cap:t,refuse:null,prune:Ne(e.level,ae(e.level))})}function Qt(e,t,r=pe){return ft(e,{cap:r,refuse:t,prune:Ne(e.level,ae(e.level))})}function Ue(e,t,r=pe,o={}){return pt(e,{cap:r,refuse:t,prune:Ne(e.level,ae(e.level)),store:o.store,progressEvery:o.every})}var er={up:"u",down:"d",left:"l",right:"r"},yt={mirror:"z",cake:"x",cow:"c"};function qe(e){return e.map(t=>t.kind==="move"?er[t.dir]:t.kind==="wait"?"w":yt[t.tool]).join("")}function tr(e){let t=[];for(let r of e){let o=j.find(n=>er[n]===r),l=Object.keys(yt).find(n=>yt[n]===r);if(o)t.push({kind:"move",dir:o});else if(r==="w")t.push({kind:"wait"});else if(l)t.push({kind:"tool",tool:l});else return null}return t}var gt=e=>e.solved?e.line.length:e.capped?"unknown":"none";function nr(e,t=pe){return mt(Sn(e,t))}function*Sn(e,t=pe,r={}){let o=se(e),l=E=>({store:r.store?.(ae(E).words),every:r.every}),n=yield*Ue(o,null,t,l(e)),s=gt(n),i=0;if(n.solved){let E=o;for(let S of n.line){let k=le(E,S);E=k.state,xe(k.events,E)&&i++}}let a=gt(yield*Ue(o,xe,t,l(e))),u=yield*zn(e,t,l(e)),f=u===null?"unknown":u?"chase":"solo",d=Cn(e),h=n.solved?qe(n.line):"";if(!e.minotaur)return{solved:n.solved,shortest:s,explored:n.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:a,catches:i,label:f,naiveWins:d,line:h};let c={...e,minotaur:null},p=yield*Ue(se(c),null,t,l(c)),m=gt(p),T=p.solved?!1:p.capped?null:!1;if(p.solved){let E=o;for(let S of p.line)E=le(E,S).state;T=E.outcome==="won"}let w=typeof s=="number"&&typeof m=="number"?s-m:null;return{solved:n.solved,shortest:s,explored:n.explored,withoutMinotaur:m,minotaurDelta:w,greedyWins:T,catchFree:a,catches:i,label:f,naiveWins:d,line:h}}function rr(e,t,r,o){let l=new Uint8Array(e.rows*e.cols),n=[t];l[t]=1;for(let s=0;s<n.length;s++){let i=n[s],a=Math.floor(i/e.cols),u=i%e.cols;for(let f of j){let d=a+H[f][0],h=u+H[f][1];if(d<0||h<0||d>=e.rows||h>=e.cols)continue;let c=d*e.cols+h;!l[c]&&r(c)&&(l[c]=1,n.push(c))}if(o?.from(i))for(let f of o.to)!l[f]&&r(f)&&(l[f]=1,n.push(f))}return l}function Pn(e){let t=new Set(e.objects.filter(i=>i!==null));e.machines.some(i=>i.template==="block")&&t.add("block");let r=i=>{let a=D[i];return a.door?t.has(`key-${a.door}`):i==="water"?t.has("block"):i==="toggle-open"||i==="toggle-closed"},o=rr(e,e.minotaur.r*e.cols+e.minotaur.c,i=>{let a=e.terrain[i];return D[a].minotaur||r(a)||a==="fake-wall"||a==="bomb"}),n=e.terrain.flatMap((i,a)=>i==="teleport"?[a]:[]).flatMap(i=>{let a=Math.floor(i/e.cols),u=i%e.cols;return j.flatMap(f=>{let d=a+H[f][0],h=u+H[f][1];return d<0||h<0||d>=e.rows||h>=e.cols?[]:[d*e.cols+h]})}),s=rr(e,e.player.r*e.cols+e.player.c,i=>{let a=e.terrain[i],u=D[a];return a==="wall"?!1:u.door?r(a):!u.needs||t.has(u.needs)||r(a)},{from:i=>e.terrain[i]==="teleport",to:n});return!o.some((i,a)=>i===1&&s[a]===1)}function*zn(e,t=pe,r={}){if(!e.minotaur||Pn(e))return!1;let o=ae(e),l=r.store??_e(o.words),n=Math.max(1,r.every??65536);try{let s=new Uint32Array(o.words);if(we(se(e),o,s,0),l.add(s,0,-1,0,0),l.size>=t)return null;let i=0;for(let a=0;a<l.size;a++){++i%n===0&&(yield{expanded:i,stored:l.size,bestF:0,startH:0}),l.words(a,s,0);let u=je(s,0,o,e,0);for(let f of dt){if(f>be&&u.tools[Se[f-be-1]]<=0)continue;let d=le(u,Ke[f]);if(d.events.some(c=>c.kind==="caught"&&c.by==="minotaur"))return!0;let h=d.state;if(!($e(u,h)||h.outcome!=="playing")&&(we(h,o,s,0),l.add(s,0,a,f,0),l.size>=t))return null}}return!1}catch(s){if(s instanceof ke)return null;throw s}}var Rn=16;function Ln(e,t){let r=e.rows*e.cols,o=new Int32Array(r).fill(-1),l=new Int8Array(r).fill(-1);o[t]=0;let n=[t];for(let s=0;s<n.length;s++){let i=n[s],a=Math.floor(i/e.cols),u=i%e.cols;j.forEach((f,d)=>{let h=a+H[f][0],c=u+H[f][1];if(h<0||c<0||h>=e.rows||c>=e.cols)return;let p=h*e.cols+c;o[p]>=0||e.terrain[p]==="wall"||(o[p]=o[i]+1,l[p]=d,n.push(p))})}return{dist:o,via:l}}function On(e){let t=e.rows*e.cols,r=e.player.r*e.cols+e.player.c,o=[],l=[];for(let m=0;m<t;m++)e.objects[m]==="relic"&&o.push(m),e.terrain[m]==="exit"&&l.push(m);let n=e.relics,s=[r,...o].map(m=>Ln(e,m)),i=m=>{let T=-1,w=1/0;for(let E of l){let S=s[m].dist[E];S>=0&&S<w&&(w=S,T=E)}return[T,w]},a=(m,T)=>{let w=s[m].dist[T===0?r:o[T-1]];return w<0?1/0:w},u=null;if(n===0)u=[];else if(o.length<=Rn){let m=o.length,T=new Float64Array((1<<m)*m).fill(1/0),w=new Int8Array((1<<m)*m).fill(-1);for(let k=0;k<m;k++)T[(1<<k)*m+k]=a(0,k+1);let E=1/0,S=-1;for(let k=1;k<1<<m;k++){let F=Fn(k);if(!(F>n))for(let P=0;P<m;P++){let G=T[k*m+P];if(!(!(k&1<<P)||G===1/0)){if(F===n){let g=G+i(P+1)[1];g<E&&(E=g,S=k*m+P);continue}for(let g=0;g<m;g++){if(k&1<<g)continue;let A=(k|1<<g)*m+g,R=G+a(P+1,g+1);R<T[A]&&(T[A]=R,w[A]=P)}}}}if(S>=0){u=[];for(let k=S;;){let F=Math.floor(k/m),P=k%m;if(u.push(P+1),w[k]<0)break;k=(F&~(1<<P))*m+w[k]}u.reverse()}}else{u=[];let m=new Set(o.map((w,E)=>E+1)),T=0;for(;u.length<n;){let w=-1,E=1/0;for(let S of m){let k=a(T,S);k<E&&(E=k,w=S)}if(w<0){u=null;break}u.push(w),m.delete(w),T=w}}if(!u)return null;let f=u.length?u[u.length-1]:0,[d]=i(f);if(d<0)return null;let h=[],c=[0,...u],p=[...u.map(m=>o[m-1]),d];return c.forEach((m,T)=>{let{via:w}=s[m],E=p[T],S=[];for(let k=E;w[k]>=0;){let F=j[w[k]];S.push(F),k-=H[F][0]*e.cols+H[F][1]}h.push(...S.reverse())}),h}function Fn(e){let t=0;for(;e;e&=e-1)t++;return t}function Cn(e){let t=On(e);if(!t)return!1;let r=se(e);for(let o of t)if(r=le(r,{kind:"move",dir:o}).state,r.outcome!=="playing")break;return r.outcome==="won"}var ge={minotaurDelta:8,exploredTimes:20};function or(e,t=ge,r){let o=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let l=e.withoutMinotaur!==null;if(l&&(e.minotaurDelta===null||e.greedyWins===null?o.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&o.push("the Minotaur does not matter: the line that ignores him wins, no longer")),o.push(...sr(e)),!r)return o;if(!l)return[...o,"a challenge level has a Minotaur"];e.greedyWins!==!1&&o.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<t.minotaurDelta&&o.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${t.minotaurDelta}`);let n=a=>Math.max(0,...r.teaching.map(a)),s=n(a=>a.explored);e.explored<t.exploredTimes*s&&o.push(`a challenge level: stored ${e.explored} situations, the bar is ${t.exploredTimes} × ${s} = ${t.exploredTimes*s}`);let i=n(a=>typeof a.shortest=="number"?a.shortest:0);return typeof e.shortest=="number"&&e.shortest<i&&o.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${i}`),o}function sr(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var lr={least:1.2,most:2.2};function ir(e,t,r=lr){let o=t.explored/Math.max(1,e.explored);return o<r.least?[`stored ${t.explored} situations, ${o.toFixed(2)} × the challenge level before it (${e.explored}); the ramp asks at least ${r.least} ×`]:o>r.most?[`stored ${t.explored} situations, ${o.toFixed(2)} × the challenge level before it (${e.explored}); the ramp allows at most ${r.most} ×`]:[]}var ye={ramp:{least:1.1,most:1.5},most:2e4};function Ye(e){return e.terrain.some(t=>t==="fake-wall"||t==="invisible-wall")}function ar(e){return Ye(e)?ye.ramp:lr}function ur(e,t){return!Ye(e)||t.explored<=ye.most?[]:[`the level hides walls: stored ${t.explored} situations, the ceiling for a level that hides walls is ${ye.most}`]}var ze={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function cr(e,t=ze){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let r=[];e.naiveWins&&r.push("the plain walk to the exit wins"),r.push(...sr(e));let o=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=ge.minotaurDelta,l=o?t.chaseShortest:t.shortest,n=o?t.chaseExplored:t.explored;return e.shortest<l&&r.push(`the quickest win is ${e.shortest} moves, the bar is ${l}`),e.explored<n&&r.push(`the solver searched ${e.explored} situations, the bar is ${n}`),r}var Dn={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function ce(e,t){let r=[...e.terrain],o=[...e.objects];t(r,o);let l=e.machines.filter(n=>r[n.at.r*e.cols+n.at.c]==="clone");return J(ve({...e,terrain:r,objects:o,machines:l}))}function wt(e){let t=[],r=n=>`row ${Math.floor(n/e.cols)+1}, column ${n%e.cols+1}`;for(let n of ue){let s=`key-${n}`;e.objects.includes(s)&&t.push({name:`the ${n} keys`,ignored:[ce(e,(i,a)=>{a.forEach((u,f)=>{u===s&&(a[f]=null)})})]}),e.terrain.some(i=>D[i].door===n)&&t.push({name:`the ${n} doors`,ignored:["wall","floor"].map(i=>ce(e,(a,u)=>{a.forEach((f,d)=>{D[f].door===n&&(a[d]=i)}),u.forEach((f,d)=>{f===s&&(u[d]=null)})}))})}let o=e.objects.filter(n=>n==="relic").length>e.relics;e.objects.forEach((n,s)=>{n==="block"?t.push({name:`the block at ${r(s)}`,ignored:[ce(e,(i,a)=>{a[s]=null,i[s]="wall"}),ce(e,(i,a)=>{a[s]=null})]}):(n==="relic"?o:n!==null&&n!=="cake"&&n!=="page"&&!n.startsWith("key-"))&&t.push({name:`the ${n==="relic"?"spare relic":n} at ${r(s)}`,ignored:[ce(e,(i,a)=>{a[s]=null})]})});let l=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[n,s,i]of l){if(!e.terrain.some(f=>s.includes(f)))continue;let a=i.map(f=>ce(e,d=>{d.forEach((h,c)=>{s.includes(h)&&(d[c]=f)})})),u=Dn[s[0]];u&&e.objects.includes(u)&&a.push(ce(e,(f,d)=>{d.forEach((h,c)=>{h===u&&(d[c]=null)})})),t.push({name:`the ${n}`,ignored:a})}return e.terrain.some(n=>n==="button"||n==="toggle-open"||n==="toggle-closed")&&t.push({name:"the toggle walls and their button",ignored:[ce(e,n=>{n.forEach((s,i)=>{s==="button"||s==="toggle-open"?n[i]="floor":s==="toggle-closed"&&(n[i]="wall")})})]}),e.terrain.forEach((n,s)=>{let i=u=>{for(let[f,d]of Object.entries(e.links))d===s&&(u[Number(f)]="floor")},a=(u,f,d,h)=>t.push({name:`the ${u} at ${r(s)}`,ignored:[f,...h?[h]:[]].map(c=>ce(e,p=>{p[s]=c,d?.(p)}))});n==="trap"?a("snare","floor",i):n==="fake-wall"?a("fake wall","wall",void 0,"floor"):n==="invisible-wall"?a("invisible wall","floor"):n==="thief"?a("thief","floor"):n==="bomb"?a("bomb","floor"):n==="clone"&&a("clone machine","wall",i)}),e.hazards.forEach((n,s)=>{t.push({name:`the ${re[n.kind].name.toLowerCase()} at ${r(n.at.r*e.cols+n.at.c)}`,ignored:[J(ve({...e,hazards:e.hazards.filter((i,a)=>a!==s)}))]})}),t}var hr={explored:1.3};function In(e,t,r){let o=Pe(se(t),r);if(!o.solved)return o.capped?"capped":"the level cannot be won";if(o.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${o.line.length}`;let l=Qt(se(t),xe,r);return l.solved?l.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${l.line.length}`:e.explored>=hr.explored*o.explored?`the search falls from ${e.explored} situations to ${o.explored}`:null:l.capped?"capped":"no win without a catch"}function dr(e,t,r=pe){return!t.solved||typeof t.catchFree!="number"?[]:wt(e).flatMap(o=>{let l=o.ignored.map(n=>In(t,n,r));return l.some(n=>n!==null&&n!=="capped")?[]:l.includes("capped")?[{unit:o,problem:`${o.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:o,problem:`${o.name}: ignoring it changes nothing (still ${t.shortest} moves, and the search no ${hr.explored} × smaller)`}]})}var Te={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function Bn(e,t){let r=e.level;if(!e.minotaur)return 1/0;let o=e.minotaur.r*r.cols+e.minotaur.c,l=e.player.r*r.cols+e.player.c,n=new Map([[o,0]]),s=[o];for(let i=0;i<s.length;i++){let a=s[i],u=n.get(a);if(a===l)return u;if(u>=t)continue;let f=Math.floor(a/r.cols),d=a%r.cols;for(let h of j){let c=f+H[h][0],p=d+H[h][1];if(c<0||p<0||c>=r.rows||p>=r.cols)continue;let m=c*r.cols+p;n.has(m)||m!==l&&(!D[e.terrain[m]].minotaur||e.objects[m]==="block")||(n.set(m,u+1),s.push(m))}}return 1/0}function kt(e,t){let r=tr(t.line)??[],o=se(e),l=0,n=0,s=0;for(let i of r)o=le(o,i).state,o.stone>0||!!o.minotaur&&(te(Le(o),o.minotaur)||Bn(o,Te.reach)<=Te.reach)?(l++,s=0):n=Math.max(n,++s);return{turns:r.length,live:l,quiet:n}}function fr(e,t,r){if(!e.minotaur||!t.solved||typeof t.shortest!="number")return[];let o=[];t.minotaurDelta!==null&&t.minotaurDelta<1&&o.push("the beast adds no moves: a route that ignores him wins as quickly");let l=Te[r],n=kt(e,t);return n.live<l.share*n.turns&&o.push(`the beast is live on ${n.live} of ${n.turns} turns; the bar is ${Math.ceil(l.share*n.turns)}`),n.quiet>l.quiet*n.turns&&o.push(`the beast is quiet for ${n.quiet} turns in a row; the bar is ${Math.floor(l.quiet*n.turns)}`),o}function xt(e,t=0){let r=3735928559^t,o=1103547991^t;for(let l=0;l<e.length;l++){let n=e.charCodeAt(l);r=Math.imul(r^n,2654435761),o=Math.imul(o^n,1597334677)}return r=Math.imul(r^r>>>16,2246822507)^Math.imul(o^o>>>13,3266489909),o=Math.imul(o^o>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),[r>>>0,o>>>0]}function pr(...e){return xt(e.join(""))[0]}function mr(...e){let t=e.join(""),[r,o]=xt(t),[l,n]=xt(t,2654435769),s=r,i=o,a=l,u=n|1,f=()=>{let h=(s+i|0)+u|0;return u=u+1|0,s=i^i>>>9,i=a+(a<<3)|0,a=a<<21|a>>>11,a=a+h|0,(h>>>0)/4294967296};for(let h=0;h<12;h++)f();let d=h=>Math.floor(f()*h);return{next:f,int:d,pick:h=>h[d(h.length)],shuffle(h){let c=[...h];for(let p=c.length-1;p>0;p--){let m=d(p+1);[c[p],c[m]]=[c[m],c[p]]}return c}}}var Ze={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function Tt(e){return Object.keys(Ze).filter(t=>Ze[t]<=e)}var Je=["fake","invisible"];function br(e,t,r,o){let l=t-(r-1);if(l<r*o)return null;let n=Array(r).fill(o);for(let a=l-r*o;a>0;a--)n[e.int(r)]++;let s=[],i=1;for(let a of n)s.push([i,i+a-1]),i+=a+1;return s}var Ee={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},Xe=["up","down","left","right"];function yr(e,t){let{rows:r,cols:o}=t,l=br(e,r-2,t.roomRows,2),n=br(e,o-2,t.roomCols,2);if(!l||!n)return null;let s=Array.from({length:r},()=>Array(o).fill("#")),i=t.roomRows*t.roomCols,a=x=>({r:l[Math.floor(x/t.roomCols)],c:n[x%t.roomCols]});for(let x=0;x<i;x++){let{r:M,c:z}=a(x);for(let I=M[0];I<=M[1];I++)for(let _=z[0];_<=z[1];_++)s[I][_]="."}let u=[];for(let x=0;x<i;x++)x%t.roomCols<t.roomCols-1&&u.push([x,x+1]),x+t.roomCols<i&&u.push([x,x+t.roomCols]);let f=[...Array(i).keys()],d=x=>f[x]===x?x:f[x]=d(f[x]),h=[],c=(x,M,z)=>{let I=a(x),_=a(M);if(M===x+1){let N=Math.max(I.r[0],_.r[0]),X=Math.min(I.r[1],_.r[1]),U=I.c[1]+1;if(z){for(let oe=N;oe<=X;oe++)s[oe][U]=".";return}let q=N+e.int(X-N+1);s[q][U]=".",h.push({r:q,c:U})}else{let N=Math.max(I.c[0],_.c[0]),X=Math.min(I.c[1],_.c[1]),U=I.r[1]+1;if(z){for(let oe=N;oe<=X;oe++)s[U][oe]=".";return}let q=N+e.int(X-N+1);s[U][q]=".",h.push({r:U,c:q})}};for(let[x,M]of e.shuffle(u))d(x)!==d(M)?(f[d(x)]=d(M),c(x,M,e.next()<t.hall)):e.next()<t.loop&&c(x,M,!1);let p=e.shuffle([...Array(i).keys()]),m=new Set,T=()=>{let x=p.filter(z=>!m.has(z)),M=x.length?x[0]:e.pick(p);return m.add(M),M},w=(x,M=(z,I)=>s[z][I]===".")=>{let{r:z,c:I}=a(x),_=[];for(let N=z[0];N<=z[1];N++)for(let X=I[0];X<=I[1];X++)M(N,X)&&_.push([N,X]);return _.length?e.pick(_):null},E=(x,M)=>Xe.some(z=>h.some(I=>I.r===x+Ee[z][0]&&I.c===M+Ee[z][1])),S=x=>{let M=x===void 0?e.shuffle([...Array(i).keys()]):[x];for(let z of M){let I=w(z,(_,N)=>s[_][N]==="."&&!E(_,N));if(I)return I}return null},k=(x,M)=>{let z=S(M);return z?(s[z[0]][z[1]]=x,!0):!1},F=()=>e.shuffle(h.filter(x=>s[x.r][x.c]===".")),P=x=>{let M=F()[0];return M?(s[M.r][M.c]=x,!0):!1},G=(x,M)=>{let{r:z,c:I}=a(x);if(e.next()<.5){let N=z[0]+e.int(z[1]-z[0]+1),X=Math.min(z[1],N+e.int(2));for(let U=N;U<=X;U++)for(let q=I[0];q<=I[1];q++)s[U][q]==="."&&(s[U][q]=M)}else{let N=I[0]+e.int(I[1]-I[0]+1),X=Math.min(I[1],N+e.int(2));for(let U=z[0];U<=z[1];U++)for(let q=N;q<=X;q++)s[U][q]==="."&&(s[U][q]=M)}},g=T(),A=T(),R=new Map,v=new Map,y=x=>{let M=S();return M?(s[M[0]][M[1]]=x,R.set(M[0]*o+M[1],e.pick(Xe)),!0):!1},b=!0;for(let x of t.families){switch(x){case"keys":{let[M,z]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),I=1+e.int(2);for(let _=0;_<I;_++)b=P(M)&&b;for(let _=0;_<(M==="G"?1:I);_++)b=k(z)&&b;break}case"water":{let M=T();G(M,"~"),b=(e.next()<.5?k("f"):k("O"))&&b;break}case"fire":{let M=T();G(M,"F"),b=k("h")&&b;break}case"ice":{let M=T();G(M,"="),e.next()<.5&&(b=k("k")&&b);break}case"force":{let M=T(),z=e.pick(["^","v","<",">"]);G(M,z),e.next()<.5&&(b=k("u")&&b);break}case"blocks":{let M=1+e.int(2);for(let z=0;z<M;z++)b=k("O")&&b;break}case"toggle":{let M=1+e.int(2);for(let z=0;z<M;z++)b=P(e.next()<.5?"T":"t")&&b;b=k("_")&&b;break}case"mirror":b=k("z")&&b;break;case"cow":b=k("c")&&b;break;case"gravel":{let M=1+e.int(2);for(let z=0;z<M;z++)b=P(":")&&b;break}case"popup":b=P(";")&&b;break;case"fake":b=P("W")&&b;break;case"invisible":b=k("I")&&b;break;case"snare":b=(e.next()<.5?P("&"):k("&"))&&k("-")&&b;break;case"teleport":b=k("@",T())&&k("@",T())&&b;break;case"ball":b=y("o")&&b;break;case"glider":b=y("w")&&b;break;case"fireball":b=y("e")&&b;break;case"thief":b=P("$")&&b;break;case"bomb":b=(e.next()<.5?P("!"):k("!"))&&b;break;case"clone":{let M=!1;for(let z=0;z<40&&!M;z++){let I=e.int(i),{r:_,c:N}=a(I),X=e.int(4),U=X<2?X===0?_[0]-1:_[1]+1:_[0]+e.int(_[1]-_[0]+1),q=X<2?N[0]+e.int(N[1]-N[0]+1):X===2?N[0]-1:N[1]+1,oe=["down","up","right","left"][X],Kr=U+Ee[oe][0],Nr=q+Ee[oe][1];U<=0||q<=0||U>=r-1||q>=o-1||s[U][q]!=="#"||s[Kr][Nr]!=="."||(s[U][q]="C",v.set(U*o+q,`${e.pick(["block","ball","block"])}-${oe}`),M=!0)}b=M&&k("+")&&b;break}}if(!b)return null}for(let x=0;x<t.relics;x++)if(!k("*"))return null;if(!k("P",g)||!k("M",A))return null;let O=[];for(let x=1;x<r-1;x++)s[x][1]==="."&&O.push([x,0,x,1]),s[x][o-2]==="."&&O.push([x,o-1,x,o-2]);for(let x=1;x<o-1;x++)s[1][x]==="."&&O.push([0,x,1,x]),s[r-2][x]==="."&&O.push([r-1,x,r-2,x]);if(!O.length)return null;let[B,$,ee,C]=e.pick(O);return s[B][$]="E",t.relics>0&&e.next()<.5&&s[ee][C]==="."&&!E(ee,C)&&(s[ee][C]="|"),{g:s,doors:h,facing:R,machines:v}}function Et(e,t){let r=[`title: ${t}`,"intro: "],o=[...e.facing.keys()].sort((n,s)=>n-s);o.length&&r.push(`facing: ${o.map(n=>e.facing.get(n)).join(" ")}`);let l=[...e.machines.keys()].sort((n,s)=>n-s);return l.length&&r.push(`machines: ${l.map(n=>e.machines.get(n)).join(" ")}`),`${r.join(`
`)}

${e.g.map(n=>n.join("")).join(`
`)}
`}var $n=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function gr(e,t){let r=t.g.map(d=>[...d]),o=r.length,l=r[0].length,n=[...t.doors],s=new Map(t.facing),i=d=>{let h=[];for(let c=1;c<o-1;c++)for(let p=1;p<l-1;p++)d(c,p)&&h.push([c,p]);return h},a=(d,h)=>n.some(c=>c.r===d&&c.c===h),u=(d,h)=>Xe.some(c=>a(d+Ee[c][0],h+Ee[c][1])),f=e.next();if(f<.55){let d=i((c,p)=>$n.has(r[c][p])&&!a(c,p)),h=i((c,p)=>r[c][p]==="."&&!a(c,p)&&!u(c,p));if(d.length&&h.length){let[c,p]=e.pick(d),[m,T]=e.pick(h);r[m][T]=r[c][p],r[c][p]=".";let w=s.get(c*l+p);w&&(s.delete(c*l+p),s.set(m*l+T,w))}}else if(f<.7){let d=n.filter(c=>r[c.r][c.c]!=="."),h=n.filter(c=>r[c.r][c.c]===".");if(d.length&&h.length){let c=e.pick(d),p=e.pick(h);r[p.r][p.c]=r[c.r][c.c],r[c.r][c.c]="."}}else if(f<.8&&s.size)s.set(e.pick([...s.keys()]),e.pick(Xe));else{let d=n.filter(c=>r[c.r][c.c]==="."),h=i((c,p)=>r[c][p]==="#"&&(r[c-1][p]!=="#"&&r[c+1][p]!=="#"&&r[c][p-1]==="#"&&r[c][p+1]==="#"||r[c][p-1]!=="#"&&r[c][p+1]!=="#"&&r[c-1][p]==="#"&&r[c+1][p]==="#"));if(d.length>1&&(e.next()<.5||!h.length)){let c=e.pick(d);r[c.r][c.c]="#",n=n.filter(p=>p!==c)}else if(h.length){let[c,p]=e.pick(h);r[c][p]=".",n.push({r:c,c:p})}}return{g:r,doors:n,facing:s,machines:new Map(t.machines)}}var wr=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function Wn(e,t,r){for(let o=-1;o<=1;o++)for(let l=-1;l<=1;l++){let n=t+o,s=r+l;if(n>=0&&s>=0&&n<e.rows&&s<e.cols&&wr(e.terrain[n*e.cols+s])!=="wall")return!1}return!0}function Ve(e){return Array.from({length:e.rows-2},(t,r)=>Array.from({length:e.cols-2},(o,l)=>{let n=wr(e.terrain[(r+1)*e.cols+l+1]);return n==="wall"&&Wn(e,r+1,l+1)?"":n}))}var jn=e=>e[0].map((t,r)=>e.map(o=>o[r]).reverse()),Hn=e=>e.map(t=>[...t].reverse());function Mt(e){let t=[];for(let r=0,o=e;r<4;r++,o=jn(o))t.push(o,Hn(o));return t}function vt(e,t){let r=0;for(let o of t){let[l,n]=e.length*e[0].length<=o.length*o[0].length?[e,o]:[o,e],s=l.length,i=l[0].length,a=n.length,u=n[0].length;if(!(s>a||i>u||a-s>2||u-i>2))for(let f=0;f<=a-s;f++)for(let d=0;d<=u-i;d++){let h=0,c=0;for(let p=0;p<s;p++)for(let m=0;m<i;m++){let T=l[p][m],w=n[p+f][m+d];T&&T===w&&h++,(T||w)&&c++}r=Math.max(r,c?h/c:1)}}return r}var Tr=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function At(e){let t=new Set(e.terrain),r=new Set(e.objects.filter(o=>o!==null));return t.has("thief")||t.has("bomb")||t.has("clone")||t.has("button-red")?9:e.hazards.some(o=>o.kind!=="ball")?8:e.hazards.length?7:t.has("teleport")?6:t.has("trap")||t.has("button-brown")?5:t.has("fake-wall")||t.has("invisible-wall")?4:t.has("popup")?3:t.has("gravel")?2:1}var Gn=e=>({teaching:[{...Tr[e-1]}]});function Er(e){let t=Tr[e-1];return{explored:Math.max(ze.chaseExplored,ge.exploredTimes*t.explored),shortest:Math.max(ze.chaseShortest,t.shortest)}}var xr=ze.chaseExplored,_n={least:1.2,most:1.6},Me={least:3e4,most:5e4};function Qe(e,t){let r=t?ye.ramp:_n,o=t?ye.most:Me.most;if(e===null)return{least:xr,most:t?ye.most:2e4,plateau:!1};if(!t&&e>=Me.least)return{least:Me.least,most:Me.most,plateau:!0};let l=Math.max(xr,Math.ceil(e*r.least)),n=Math.min(o,Math.floor(e*r.most));return n>=l*1.15?{least:l,most:n,plateau:!1}:t?null:{least:Me.least,most:Me.most,plateau:!0}}function Mr(e){return{features:e.map(t=>Mt(Ve(t)))}}function St(e){let{rows:t,cols:r}=e,o=(n,s)=>e.terrain[n*r+s]==="wall",l=[];for(let n=1;n<t-1;n++)for(let s=1;s<r-1;s++){let i=n*r+s,a=[o(n-1,s),o(n+1,s),o(n,s-1),o(n,s+1)].filter(Boolean).length;o(n,s)&&a===0&&l.push(`a lone wall at row ${n+1}, column ${s+1}`),e.terrain[i]==="floor"&&e.objects[i]===null&&!(e.player.r===n&&e.player.c===s)&&!(e.minotaur?.r===n&&e.minotaur.c===s)&&!e.hazards.some(f=>f.at.r===n&&f.at.c===s)&&a>=3&&l.push(`a bare pocket at row ${n+1}, column ${s+1}`)}return l}function Pt(e,t,r=[]){let o=Ve(e),l=[];return t.features.forEach((n,s)=>{let i=vt(o,n);i>=.42&&l.push(`its layout repeats campaign level ${s+1}'s (${i.toFixed(2)})`)}),r.forEach((n,s)=>{let i=vt(o,Mt(Ve(n)));i>=.42&&l.push(`its layout repeats the run's level ${s+1}'s (${i.toFixed(2)})`)}),l}function vr(e,t,r,o,l=[]){let n=[];return(t.explored<r.band.least||t.explored>r.band.most)&&n.push(`stored ${t.explored} situations, the band is ${r.band.least} to ${r.band.most}`),n.push(...or(t,ge,Gn(At(e))),...cr(t),...fr(e,t,"challenge"),...ur(e,t)),!r.band.plateau&&r.previous&&n.push(...ir(r.previous,t,ar(e))),Ye(e)&&r.band.plateau&&n.push("a level that hides walls never sits on the plateau"),n.length?n:[...St(e),...Pt(e,o,l)]}var Kn=6e6,zr=12,et=120,Nn=.25;function Un(e,t,r,o){let l=Tt(t).filter(d=>!Je.includes(d)),n=l.filter(d=>Ze[d]===Math.min(t,9)),s=2+e.int(2),i=[];n.length&&e.next()<.5&&i.push(e.pick(n)),o&&i.push(e.pick(Je));for(let d of e.shuffle(l))i.length<s+(o?1:0)&&!i.includes(d)&&i.push(d);let a=t<=1?12:11,u=a+e.int(16-a),f=a+e.int(16-a);return{rows:u,cols:f,roomRows:2+e.int(3),roomCols:2+e.int(3),families:i,relics:1+e.int(3),hall:.1+.25*e.next(),loop:.2+.3*e.next()}}var Ar=e=>Math.ceil(e.most*1.05),Sr=e=>Math.max(2e5,e.most*4);function zt(e,t,r){if(!e.minotaur)return 1/0;let o=St(e).length;if(o)return 14+o;let l=se(e),n=Pe(l,Ar(t));if(r(n.explored),!n.solved)return n.capped?12:30;let s=0,i=Er(At(e)),a=Math.max(t.least,i.explored);n.explored<a&&(s+=3*Math.log(a/n.explored)),n.explored>t.most&&(s+=3*Math.log(n.explored/t.most)),n.line.length<i.shortest&&(s+=.2*(i.shortest-n.line.length));let u=l,f=0;for(let c of n.line){let p=le(u,c);u=p.state,xe(p.events,u)&&f++}s+=3*f;let d=kt(e,{line:qe(n.line)});if(s+=6*Math.max(0,Te.challenge.share-d.live/Math.max(1,d.turns)),s+=6*Math.max(0,d.quiet/Math.max(1,d.turns)-Te.challenge.quiet),s>0)return s;let h=Pe(se({...e,minotaur:null}),Ar(t));if(r(h.explored),h.solved){s+=.4*Math.max(0,ge.minotaurDelta-(n.line.length-h.line.length));let c=l;for(let p of h.line)c=le(c,p).state;c.outcome==="won"&&(s+=2)}return s}function qn(e,t){let r=ve(t),o=r.slice(r.indexOf(`

`)+2).trimEnd().split(`
`).map(s=>[...s]),l=new Map(t.hazards.map(s=>[s.at.r*t.cols+s.at.c,s.dir])),n=new Map(t.machines.map(s=>[s.at.r*t.cols+s.at.c,`${s.template}-${s.dir}`]));return{g:o,doors:e.doors,facing:l,machines:n}}function Yn(e){let t=r=>r.terrain.filter(o=>o==="wall").length;return e.reduce((r,o)=>t(o)<t(r)?o:r)}function Pr(e,t,r){let o=t.run.slice(-zr),l=e.filter(h=>h.chapter<=t.tier),n=o.map(h=>J(h.text)),s=l.filter(h=>!o.some(c=>c.text===h.text)&&Pt(J(h.text),{features:[]},n).length===0),i=t.run.at(-1)?.explored??null,a=Qe(Number.MAX_SAFE_INTEGER,!1),u=[h=>h.explored>=r.least&&h.explored<=r.most,h=>i!==null&&h.explored>=i*1.2&&h.explored<=i*2.2,h=>h.explored>=a.least&&h.explored<=a.most,()=>!0],f=h=>h[pr("endless-bank",t.seed,t.tier,t.depth)%h.length],d=l.filter(h=>h.text!==t.run.at(-1)?.text);for(let h of u)for(let c of[s,d,l]){let p=c.filter(h);if(p.length)return f(p)}if(e.length)return f(e);throw new RangeError("the bank is empty")}function Zn(e,t,r,o,l,n,s,i,a,u=null,f){let d=h=>{i.spent+=h};for(let h=0;i.spent<s;h++){let c=mr("endless",...e,h),p=u!==null&&c.next()<.25,m=p?u:r,T=yr(c,Un(c,t,m,p));if(!T){d(1e3);continue}let w=F=>{try{return J(Et(F,""))}catch{return null}},E=w(T),S=E?zt(E,m,d):1/0,k=et;for(let F=0;F<k&&i.spent<s&&(F===k-1&&S<2&&k<3*et&&(k+=et),!(F===Math.floor(et/3)&&S>=8));F++){if(i.tries++,F%8===0&&a?.({tries:i.tries,spent:i.spent,budget:s}),S===0&&E){let A=nr(E,Sr(m));d(4*A.explored);let R=vr(E,A,{band:m,previous:o},l,n);if(R.length)f?.(`gate: ${R.join("; ")}`),S=1;else{d(wt(E).reduce((b,O)=>b+O.ignored.length,0)*2*A.explored);let v=dr(E,A,Sr(m));if(!v.length)return{text:Et(T,""),d:A};f?.(`useless: ${v.map(b=>b.problem).join("; ")}`);let y=Yn(v[0].unit.ignored);T=qn(T,y),E=w(T),S=E?zt(E,m,d):1/0;continue}}let P=gr(c,T),G=w(P);if(!G)continue;let g=zt(G,m,d);(g<=S||Number.isFinite(g)&&c.next()<Math.exp(-(g-S)/Nn))&&(T=P,E=G,S=g)}f?.(`round ${h}: ended ${S.toFixed(2)} from passing, ${i.spent} spent`)}return null}function Rr(e,t,r,o={}){let l=e.budget??o.budget??Kn,n=e.run.at(-1)??null,s=Qe(n?.explored??null,!1),i={tries:0,spent:0},a=h=>({text:h.text,explored:h.explored,shortest:h.shortest,line:h.line,from:"bank",...i});if(e.depth<=1||!n)return a(Pr(t,e,s));let u=e.run.slice(-zr).map(h=>J(h.text)),f=Tt(e.tier).some(h=>Je.includes(h))?Qe(n.explored,!0):null,d=Zn([e.seed,e.tier,e.depth],e.tier,s,{explored:n.explored},r,u,l,i,o.progress,f);return d?{text:d.text,explored:d.d.explored,shortest:d.d.shortest,line:d.d.line,from:"made",...i}:a(Pr(t,e,s))}var Xn=150;function Lr(e){let t=null;return{receive(r){if(r.type==="make")try{t??=e.known();let o=-1/0,l=Rr(r.request,e.bank,t,{...e.budget!==void 0?{budget:e.budget}:{},progress:n=>{let s=e.now();s-o<Xn||(o=s,e.post({type:"progress",id:r.id,progress:n}))}});e.post({type:"made",id:r.id,made:l})}catch(o){e.post({type:"failed",id:r.id,message:o instanceof Error?o.message:String(o)})}}}}var Or=[{chapter:1,explored:12597,shortest:38,line:"rwlrruuurrucuuulllluuudddrruuurrrrrrrr",text:`title: 
intro: 

#############
#.*#.......|E
#..#........#
#..#........#
#...........#
#.##..M##.###
#...........#
#..#.f.#....#
#..#_.c#....#
#.##...#t####
#..#...#....#
#.P....#....#
#############
`},{chapter:1,explored:12729,shortest:36,line:"urrrdrrdlddddrrcrdrrruullluuuuurrrur",text:`title: 
intro: 

##############
#FFF#...#....#
#FFF|...#....#
##.####.####.E
#...u...#....#
#.P....c#....#
#.......#....#
#....>>>.....#
###.##.##.####
#...#...#....#
#..M#........#
#...#...#...*#
#.......#....#
##############
`},{chapter:1,explored:12802,shortest:40,line:"rrrurrrdllldcdllllldddluuurrrddddrrrrrrr",text:`title: 
intro: 

##############
#..==#.......#
#M.==#.......#
#..==#.......#
#..==#......c#
#..==#P......#
#....####.####
#............#
#....#.......#
#..z.#.......#
#..*.#.......#
#....#.......E
##############
`},{chapter:1,explored:12877,shortest:37,line:"drrllllrrddrrrrrruudddddddwllllddllld",text:`title: 
intro: 

##############
#...P..#.....#
#..*......*..#
####.##.##.###
#..O..h.*....#
#............#
#............#
######.###.###
#......#.FF..#
#........FF..#
#......#.FF..#
#...M..#.FF..#
###E##########
`},{chapter:1,explored:13357,shortest:37,line:"uruuuuluurudrrcrddrrrrrrrdulldddddlld",text:`title: 
intro: 

###############
#..#.......#..#
#.c#..#....#..#
#.....#.......#
#.###.##.####.#
#..#..........#
#..#......M#*.#
#..#FF.....#..#
##.##.#.##.####
#z....#.......#
#P......|.....#
########E######
`},{chapter:1,explored:13564,shortest:47,line:"uludddlllddduuuuullllddlluuuldddrrrzrddrrddddld",text:`title: 
intro: 

##############
#*M#..#...#r.#
#..#z...r.#.*#
#..#..#...#.P#
#.....#......#
#####.##R###R#
#.....|......#
#...<<#......#
##.#.##...##.#
#..#..#...#..#
#..#......#..#
######E#######
`},{chapter:1,explored:14513,shortest:42,line:"uurrrrrdrdrdduulullurzrrrrddddrddddlllllld",text:`title: 
intro: 

##############
#........#...#
#........#...#
############.#
#............#
#...#*u..#...#
#P..#....#...#
#...#....#...#
#...#...z#.*.#
#####.####...#
#.vv.........#
#.vv.........#
#.vv.|M......#
#####E########
`},{chapter:1,explored:15124,shortest:48,line:"drddrrrrdulldcllllllldddduuuurrrrurrrrrrruuuullu",text:`title: 
intro: 

##########E###
#........#...#
#...#P...#...#
#...#....#...#
#...##.#####.#
#...#........#
#........#c..#
#.###....###.#
#..M#........#
#...#........#
#*..#........#
##############
`},{chapter:1,explored:18952,shortest:46,line:"uuurrrrddrrrdrllllrrruuuuruulrdddrrlllddlllddd",text:`title: 
intro: 

###############
#........#....#
#....#........#
#....#...#.M..#
#....#...#....#
#........#....#
#....#...#*...#
#.##.###.##.###
#.............#
#.............#
###.###.##.####
#....#..O.....#
#..P.#....====#
#....#........#
#######E#######
`},{chapter:1,explored:19028,shortest:49,line:"ddrrrwrlllllrrrrdddurrrruuddlllddddddrrrllldllldd",text:`title: 
intro: 

###########
#.P.#..#..#
#...#..#..#
#.f....#..#
###.#.###.#
#.O.#.....#
#...#.O#..#
#......#..#
#...##.####
#...#.....#
#~~~#.....#
#~~~#....*#
#....M....#
#...#.....#
###E#######
`},{chapter:1,explored:19437,shortest:37,line:"llluuuluuuurrddlldcdllldduuuuuurrrrru",text:`title: 
intro: 

#######E####
#..u...c...#
#..........#
#......h...#
##.##.######
#......v...#
#..#...vvP.#
#.*#...vv..#
#......vv..#
#..#.#######
#..#.......#
#..#..M....#
############
`},{chapter:1,explored:20248,shortest:45,line:"rdrrdrddduuuucurrruuuulddrddlllddddddddllllll",text:`title: 
intro: 

##############
#......#**...#
#......#.....#
#......#.....#
######.##.####
#.P..........#
#......#..M..#
#......#.....#
#......#.....#
#..u...#.....#
#.....c#<<<<<#
#......#.....#
#......#.....#
E......#.....#
##############
`},{chapter:1,explored:22561,shortest:53,line:"dddullllllldlllrrcruuuuuuuurrdddlllluuuuurrrrrrrrruru",text:`title: 
intro: 

############E#
#=.#......#..#
#=...........#
##.###########
#..#..*...#..#
#M.#......#..#
#..#......#..#
#..R.........#
#.##.#######.#
#.........#P.#
#..#......#..#
#.k#.........#
#c........#r.#
##############
`},{chapter:1,explored:23322,shortest:39,line:"drrrrllllullluucurrrrrruuullllllluuudll",text:`title: 
intro: 

#############
#...#.......#
#.*.#.......#
E|..####.##.#
#=..........#
#=..........#
#=....O.....#
#########.###
#...........#
#...#...M...#
###.#########
#.....PO....#
#.........c.#
#...........#
#############
`},{chapter:1,explored:26329,shortest:51,line:"rrrrulldllulluuurrrruuuuuuulllldddrrrrdddrrrrdrrrrr",text:`title: 
intro: 

###############
#*............#
#...#.........#
#...#...M.....#
#.............#
#...#.........#
#####.........#
#...#........k#
#...B.........E
#.###.##B##.###
#..b#.........#
#.b.#=========#
#P...=========#
###############
`},{chapter:1,explored:28416,shortest:43,line:"uuuururddlduuuulurruluurrrwllrrrrrrrrrulllu",text:`title: 
intro: 

#########E####
#...#........#
#...........*#
##.###.####.##
#...#........#
#..*#........#
#*....z......#
#...#........#
#.O.#........#
#...#......M.#
#............#
#...#........#
#P..#........#
#............#
##############
`},{chapter:1,explored:31875,shortest:40,line:"uuuurrrddduuuuuuulluulllurrrcurrrrdduurr",text:`title: 
intro: 

##############
#............E
#.......#M...#
#...*.h*#..*.#
#.......##.###
#............#
#............#
#............#
#............#
#............#
#.......#.####
#.......#....#
#.......#c...#
#.....P.#....#
##############
`},{chapter:1,explored:32566,shortest:62,line:"dddddddldddrrrrrdrrrruuuurruluurzuuuuddddddlllluldrrrddddrdurr",text:`title: 
intro: 

###############
#..P..#......*#
#.....#...#...#
#......^^^#...#
#.....###.#...#
#..u..#...#.z.#
#.....#.*.#...#
#.....#...t.._#
#.....#...#..M#
##.##T#####.###
#.....#...#...#
#.........#..|E
#.....#.....*.#
#.....#...#...#
###############
`},{chapter:1,explored:33707,shortest:40,line:"rddrrwwlruuuuuuurldddddcrrrdldddllllllld",text:`title: 
intro: 

############
#..M..#*c..#
#..........#
###Y###.####
#...y.#....#
#.....#....#
#...P.#...*#
#####.#....#
#.....k=...#
#......=...#
#......=.*.#
##E#########
`},{chapter:1,explored:34913,shortest:61,line:"lluuurdlddddddrluuullcluuuurldddlluuudddddldddruluuurrrrrrrrr",text:`title: 
intro: 

############
#..*#.*#.h.#
#<<<#..#...#
###.#.##.###
#.....F#..P#
#M...uF...|E
#.....F#...#
##.#####.###
#......#.c.#
#..*#..#...#
#...#..#...#
############
`},{chapter:1,explored:37913,shortest:45,line:"ldddrluuulldlllllulllrrdrddlrrrrrrdlddddlllld",text:`title: 
intro: 

###############
#..#..#....#..#
#..#..#.O..#..#
#..........#..#
####.####.##.##
#.....#......P#
#..#.......#..#
#.###.####.#.##
#..#*....._#.*#
#.....#....#..#
#.##.####.##.##
#..#..#....#..#
#....M#....#..#
#..#..T....#..#
#####E#########
`},{chapter:1,explored:38173,shortest:50,line:"lddddruluuullddddllcdlldddluuurrruuuuurrrrddddddrr",text:`title: 
intro: 

############
#...#.....P#
#...B.b.#..#
#####...#.##
#...#...#..#
#.M.#...#.c#
#.......#..#
#...#...#..E
#...#.###..#
#.*.#...#..#
#...#...#..#
#...#...#..#
#...#......#
#...#...#..#
############
`},{chapter:1,explored:39882,shortest:46,line:"luudddddddduuuuurrrrrdcrddrrdruuulllullldllldl",text:`title: 
intro: 

############
#....#..#..#
#f......#..#
#....#.....#
#.P..##.#M.#
#.......#..#
#....#.....#
E.##.##.##.#
#~~~~#.....#
#~~~~#..#z*#
#c...#..#..#
############
`},{chapter:1,explored:41416,shortest:56,line:"drrrddrllldddldduulcluuuuullldddrrrdddddluuurrrrrrdddrrr",text:`title: 
intro: 

#############
#....#P.#...#
#*...#h.....#
#....####...#
#..M.#FF..*.#
#.....FF#...#
####.##.###.#
#...........#
#....#..#...#
#....#c.#...#
#..*.#..#..|E
#....#..#...#
#############
`},{chapter:1,explored:43050,shortest:41,line:"urrrrdrrrddddluuruuulllllluuuluuurrrrrzru",text:`title: 
intro: 

##########E##
#...........#
#..#c.......#
##.#B###.####
#...z.#....M#
#.....#..#..#
##.##.####.##
#...........#
#..#P.#.b...#
#.b####..##.#
#..#.....B..#
#........#..#
#..#.....#**#
#############
`},{chapter:1,explored:44373,shortest:49,line:"dllldddrdcdddrrdrrrurruuddllllluuuurddlddlluuulll",text:`title: 
intro: 

#############
#...#P....F.#
#........#FF#
##.####.##..#
#...#....#..#
#..c#.*..#..#
E...#....#M.#
#...#....#*.#
###.#.####..#
#...........#
#.......*#..#
#........#..#
#############
`},{chapter:2,explored:6669,shortest:37,line:"llldurrrrrrrruuuuluuuruulllllulllllll",text:`title: 
intro: 

##############
E..*.:..#..~~#
#....#..T..~~#
###.##.##.##.#
#....#..#..M.#
#....#..#....#
#.........._.#
#....#..#..*.#
##:###.##.##.#
#............#
#............#
#......P....*#
#...f........#
##############
`},{chapter:2,explored:7828,shortest:39,line:"drrrrudlllddlcldddddddrrrrrllluulllllll",text:`title: 
intro: 

###############
#.......#.....#
#.....P.#.c...#
#.......:.....#
#.......#.....#
#.......#.....#
##.##.####G####
#.......#.....#
#..M....:.....#
#.......#.....#
E.......#.....#
#.......#####.#
#.........*...#
#.......#.....#
###############
`},{chapter:2,explored:9111,shortest:51,line:"urruuulllrrrrcrddrrrrrrrllluurruuuuuuuurllldllllulu",text:`title: 
intro: 

#####E#########
#..#.|.#.....*#
#..#.......#..#
#..###.#.###:##
#..#...#.M.#..#
#..#...#...#..#
#..#..........#
#.####.#.###..#
#..#...#...#..#
#c.....#......#
####...#...####
#..#.........*#
#......#......#
#.P#...#......#
###############
`},{chapter:2,explored:15172,shortest:53,line:"rrrrrrrrurdlllulcruuulluurudrrruuddrrrllllllldddlllll",text:`title: 
intro: 

##############
#.......#*...#
#.....*.#....#
#...........*#
#:###.###....#
#...M...#....#
E.......#....#
##.####B######
#.......#.c..#
#Pb.....:....#
##############
`},{chapter:3,explored:6716,shortest:49,line:"rrrurrrrlllcrrrruuluuddlluuluulllurrrrurrdrullllu",text:`title: 
intro: 

######E#####
#.....|....#
#..M....#.*#
#..*....#..#
######.#####
#...#...#*.#
#...#...#..#
#..........#
##.#######;#
#...#....c.#
#.P........#
############
`},{chapter:3,explored:8195,shortest:61,line:"ddrddrrrrlllllllllluuuludrrrdrrrrdddddlddddrrrlluulllluullldl",text:`title: 
intro: 

##############
#*~#...P.#...#
#.~..........#
#.~#.....#...#
##.##.##.##;##
#.....h.....f#
#............#
#............#
#............#
E.##.##|##.###
#..#.....#...#
#..#.....#FFF#
#M.#.........#
##############
`},{chapter:3,explored:29348,shortest:54,line:"urrrddddrrrrddruulluuululuuuurrurrrdlllllddddddlddddld",text:`title: 
intro: 

##############
#.......#...*#
#............#
#..M....#....#
#.......#....#
#.##;##.##R###
#.....r...>>.#
#..P......>..#
#.........>>.#
##.###.##.####
#.......R....#
#......r#....#
#....|..#..*.#
#####E########
`},{chapter:5,explored:11018,shortest:39,line:"llullddldllrdddrdddllurruurrruuuurruulu",text:`title: 
intro: 

########E#####
#.......|....#
#.....#..P...#
#.-...#..*...#
#.....#f.....#
#.&...#*.....#
#.....#......#
#............#
####.###.###.#
#.....M......#
#.*..........#
#............#
#............#
##############
`},{chapter:5,explored:30530,shortest:41,line:"rddduuulrdddrrrrrrddrdruruuulllllllllllll",text:`title: 
intro: 

###############
#..P...O......#
#..&..-.......#
E|...........*#
#.............#
##.##.#.##.##.#
#.....#.......#
#.....#.....*.#
#.....#....OM.#
#.....#.......#
#.....#.......#
###############
`},{chapter:6,explored:15138,shortest:57,line:"uuuurrruuddlldldddllllllrrrrddddddllulldrrrrrrrrrrruluurr",text:`title: 
intro: 

##############
#........#*..#
#........#...#
#......-.....#
#....@...#...#
###.###.######
#...#.......@#
#......P.#...#
#&###....#.###
#...#........#
#M..#....#...E
###.#.#####.##
#*..#........#
#...........*#
##############
`},{chapter:6,explored:18509,shortest:36,line:"uuuurdluruuddlucrrdddrrruuullllldrdr",text:`title: 
intro: 

#############
#.....#.....#
#..#..#..#..#
####.########
#.c#.....#..#
#..#.....#..#
#.@......#.@#
#..#.M...#.O#
#..#.....#O.E
#..#...*.#P.#
#############
`},{chapter:6,explored:30186,shortest:41,line:"druuurrdrrrrrrrruurllllludrrrrddllllurrdr",text:`title: 
intro: 

############
#......_...#
#..#..O..@.E
#P.#########
#.*#.*#....#
#..#......*#
#.##T####.##
#....@.....#
#..........#
#.....M....#
#..........#
############
`},{chapter:7,explored:8777,shortest:33,line:"dddduuuurrrrdddduuulllllllldddddl",text:`title: 
intro: 
facing: right

###########
#.o...#...#
#.........#
#.....##.##
#....P....#
#*......-.#
#.....###.#
#.....#M..#
#.....&..*#
#.#####...#
E.....#...#
#.........#
###########
`},{chapter:7,explored:14875,shortest:41,line:"urrrrwwluulllllldddluruurrrrrrddrurrrrrru",text:`title: 
intro: 
facing: left

##########E###
#..M.........#
#..@......#..#
#########.####
#..#....o....#
#..#......#..#
######.##.#..#
#..#...#.....#
#..#.........#
#..##:#####.##
#......#....@#
#...*..#P....#
##############
`},{chapter:7,explored:42668,shortest:45,line:"llllrrrrrrduruuuuuurrlllluulullllurrrrrrrrrrr",text:`title: 
intro: 
facing: left

#############
#......#....#
#...........E
#*....-#....#
#.M....#....#
#......######
#.........*.#
#&.....#....#
#####.##....#
#......#....#
#....o.#....#
#;######.####
#....P......#
#......*....#
#############
`},{chapter:8,explored:7105,shortest:31,line:"rrwllldlllrrrrrdwwwdrddllllllll",text:`title: 
intro: 
facing: down

#############
#.......#...#
#....*P.....#
#.......#...#
#######.###:#
#..#vvvv#...#
#...vvvv....#
#:######.####
E.....u...w.#
#..#........#
#..#......M.#
#..#........#
#############
`},{chapter:8,explored:13383,shortest:31,line:"ldldlllurrrwwwwwwwwwwuuuuruuurr",text:`title: 
intro: 
facing: down

#############
#.......#...E
#<<<<#......#
#<<<<#..#...#
#e...#..#...#
###.###.#.###
#....#......#
#.......u..P#
#.M..#*.....#
#....#*.....#
#############
`},{chapter:8,explored:19110,shortest:37,line:"dllwwwwwwdlrddlllulullluuuuuuurrrrrru",text:`title: 
intro: 
facing: left

#######E####
#..........#
#*....#....#
#....w#....#
#~~~~~....M#
#;###.#.####
#.....#...P#
#.....#....#
#*....#f...#
#...*.#....#
#..........#
############
`}];var Fr=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
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
`}];var Cr=[{id:"ch2-1",text:`title: The Loose Stone
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
`}];var Dr=[{id:"ch3-1",text:`title: The Rising Floor
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
`}];var Ir=[{id:"ch4-1",text:`title: The Wall That Gives
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
`}];var Br=[{id:"ch5-1",text:`title: The Snare
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
`}];var $r=[{id:"ch6-1",text:`title: The Teleport
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
`}];var Wr=[{id:"ch7-1",text:`title: The Bronze Ball
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
`}];var jr=[{id:"ch8-1",text:`title: The Harpy
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
`}];var Hr=[{id:"ch9-1",text:`title: The Thief
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
`}];var Gr=[{id:"ch10-1",text:`title: The Wooden Cow
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
`}];var Jn=[...Fr,...Cr,...Dr,...Ir,...Br,...$r,...Wr,...jr,...Hr,...Gr];function _r(){return Jn.map(e=>J(e.text))}var Vn=Lr({post:e=>self.postMessage(e),bank:Or,known:()=>Mr(_r()),now:()=>performance.now()});self.onmessage=e=>Vn.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
