"use strict";(()=>{var W=["up","down","left","right"],H={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},ue=["red","blue","yellow","green"],Ct=["flippers","fire-boots","skates","suction"],st={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},j=(e,t,n,r={},s,o=t)=>({char:e,minotaur:t,block:n,hazard:o,...r,sprites:s??[]}),$={floor:j(".",!0,!0,{},["floor"]),wall:j("#",!1,!1,{},["wall"]),exit:j("E",!1,!1,{},["exit"]),gate:j("|",!1,!1,{},["gate-closed","gate-open"]),water:j("~",!1,!0,{needs:"flippers"},["water"]),fire:j("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:j("=",!0,!0,{slides:"skates"},["ice"]),"force-up":j("^",!0,!0,{carries:"up"},["force-up"]),"force-down":j("v",!0,!0,{carries:"down"},["force-down"]),"force-left":j("<",!0,!0,{carries:"left"},["force-left"]),"force-right":j(">",!0,!0,{carries:"right"},["force-right"]),dirt:j("%",!0,!0,{},["dirt"]),safe:j("S",!1,!1,{},["safe"]),button:j("_",!0,!0,{},["button"]),"toggle-open":j("t",!0,!1,{},["toggle-open"]),"toggle-closed":j("T",!1,!1,{},["toggle-closed"]),"door-red":j("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":j("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":j("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":j("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:j("&",!0,!0,{},["trap"]),"button-brown":j("-",!0,!0,{},["button-brown"]),"button-red":j("+",!0,!0,{},["button-red"]),popup:j(";",!1,!1,{},["popup"]),gravel:j(":",!1,!1,{},["gravel"]),"fake-wall":j("W",!1,!1,{},["wall"]),"invisible-wall":j("I",!1,!1,{},["floor"]),teleport:j("@",!1,!1,{},["teleport"]),thief:j("$",!0,!0,{},["thief"]),bomb:j("!",!1,!0,{},["bomb"],!0),clone:j("C",!1,!1,{},W.map(e=>`clone-${e}`))},te={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var Ce={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:st.mirror.name},cake:{char:"x",sprite:"cake",name:st.cake.name},cow:{char:"c",sprite:"cow",name:st.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},nr=["theseus","minotaur","minotaur-stone","cow-standing"],rr=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],or=["exit-off","exit-wake"],po=[...new Set([...Object.values($).flatMap(e=>e.sprites),...rr,...or,...Object.values(Ce).map(e=>e.sprite),...nr,...Object.values(te).map(e=>e.sprite)])];var ee=class extends Error{line;col;constructor(t,n,r){super(`line ${t}, column ${n}: ${r}`),this.line=t,this.col=n}},sr=new Map(Object.entries($).map(([e,t])=>[t.char,e])),lr=new Map(Object.entries(Ce).map(([e,t])=>[t.char,e])),ir=/^[a-z0-9-]+$/,ar=/^([a-z]+): (.*)$/,ur=new Map(Object.entries(te).map(([e,t])=>[t.char,e])),cr=["block","ball","glider","fireball"],dr=["title","intro","hearts","relics","pages","facing","machines"];function hr(e,t){let n=e&&e.value!==""?e.value.split(" "):[],r=e??{line:1,col:1},s=new Set;for(let o of n){if(!ir.test(o))throw new ee(r.line,r.col,`page id '${o}' must be lower-case letters, digits and hyphens`);if(s.has(o))throw new ee(r.line,r.col,`page '${o}' named twice`);s.add(o)}if(n.length>31)throw new ee(r.line,r.col,"a level holds at most 31 pages");if(n.length!==t)throw new ee(r.line,r.col,`pages: ${n.length} named but the grid has ${t}`);return n}function Dt(e,t,n,r,s){let o=t&&t.value!==""?t.value.split(" "):[],l=t??{line:1,col:1};for(let i of o)if(!r(i))throw new ee(l.line,l.col,`${e}: '${i}' is not ${s}`);if(o.length!==n)throw new ee(l.line,l.col,`${e}: ${o.length} named but the grid has ${n}`);return o}function fr(e){let t={},n=e.indexOf("trap"),r=e.indexOf("clone"),s=-1,o=-1;for(let l=e.length-1;l>=0;l--){let i=e[l];if(i==="button-brown"){let a=s>=0?s:n;a>=0&&(t[l]=a)}else if(i==="button-red"){let a=o>=0?o:r;a>=0&&(t[l]=a)}else i==="trap"?s=l:i==="clone"&&(o=l)}return t}function V(e){let t=e.replace(/\r\n/g,`
`).split(`
`),n={},r=0;for(;r<t.length;r++){let g=ar.exec(t[r]);if(!g)break;if(!dr.includes(g[1]))throw new ee(r+1,1,`unknown header '${g[1]}'`);n[g[1]]={value:g[2],line:r+1,col:g[1].length+3}}for(;r<t.length&&t[r]==="";)r++;let s=r,o=[];for(;r<t.length&&t[r]!=="";r++)o.push(t[r]);if(o.length===0)throw new ee(s+1,1,"no grid");for(;r<t.length;r++)if(t[r].trim()!=="")throw new ee(r+1,1,"text after the grid");let l=o[0].length,i=[],a=[],u=null,h=null,f=0,d=[],c=[],p=[];if(o.forEach((g,A)=>{let z=s+A+1;if(g.length!==l)throw new ee(z,1,`row is ${g.length} wide, expected ${l}`);[...g].forEach((v,y)=>{let b=y+1;if(v==="P"||v==="M"){if(v==="P"&&u)throw new ee(z,b,"second player");if(v==="M"&&h)throw new ee(z,b,"second Minotaur");v==="P"?u={r:A,c:y}:h={r:A,c:y},i.push("floor"),a.push(null);return}let L=ur.get(v);if(L){c.push({kind:L,at:{r:A,c:y}}),i.push("floor"),a.push(null);return}let D=sr.get(v),C=lr.get(v);if(!D&&!C)throw new ee(z,b,`unknown tile '${v}'`);i.push(D??"floor"),a.push(C??null),C==="relic"&&f++,D==="clone"&&p.push({r:A,c:y}),C==="page"&&d.push(A*l+y)})}),!u)throw new ee(s+1,1,"no player");let m=(g,A,z,v)=>{let y=n[g];if(!y)return A;let b=Number(y.value);if(!Number.isInteger(b)||b<z)throw new ee(y.line,y.col,`${g} must be ${z} to ${v}`);if(b>v){let L=g==="relics"?`relics: ${y.value} but the grid has ${v}`:`${g} must be ${z} to ${v}`;throw new ee(y.line,y.col,L)}return b},T=m("hearts",3,1,99),w=m("relics",f,0,f),E=hr(n.pages,d.length),S=Dt("facing",n.facing,c.length,g=>W.includes(g),"a direction"),k=c.map((g,A)=>({...g,dir:S[A],home:A})),I=Dt("machines",n.machines,p.length,g=>{let[A,z]=g.split("-");return cr.includes(A)&&W.includes(z)&&g.split("-").length===2},"a template and a direction like block-up"),P=k.length,G=p.map((g,A)=>{let[z,v]=I[A].split("-"),y={at:g,template:z,dir:v};return z==="block"?y:{...y,home:P++}});return{title:n.title?.value??"",intro:n.intro?.value??"",hearts:T,relics:w,pageIds:E,pageCells:d,rows:o.length,cols:l,terrain:i,objects:a,player:u,minotaur:h,hazards:k,machines:G,links:fr(i)}}function ve(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let t=e.objects.filter(o=>o==="relic").length,n=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&n.push(`hearts: ${e.hearts}`),e.relics!==t&&n.push(`relics: ${e.relics}`),e.pageIds.length>0&&n.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&n.push(`facing: ${e.hazards.map(o=>o.dir).join(" ")}`),e.machines.length>0&&n.push(`machines: ${e.machines.map(o=>`${o.template}-${o.dir}`).join(" ")}`);let r=new Map(e.hazards.map(o=>[o.at.r*e.cols+o.at.c,o.kind])),s=[];for(let o=0;o<e.rows;o++){let l="";for(let i=0;i<e.cols;i++){let a=o*e.cols+i;e.player.r===o&&e.player.c===i?l+="P":e.minotaur&&e.minotaur.r===o&&e.minotaur.c===i?l+="M":r.has(a)?l+=te[r.get(a)].char:l+=e.objects[a]?Ce[e.objects[a]].char:$[e.terrain[a]].char}s.push(l)}return`${n.join(`
`)}

${s.join(`
`)}
`}function It(e){let t=0;for(let n of e.objects)n==="cake"&&t++;return e.hearts+t}function re(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var oe=(e,t)=>t.r>=0&&t.c>=0&&t.r<e.rows&&t.c<e.cols,O=(e,t)=>t.r*e.level.cols+t.c;var K=(e,t)=>!!t&&e.r===t.r&&e.c===t.c,Q=(e,t)=>({r:e.r+H[t][0],c:e.c+H[t][1]}),lt=e=>e.relicsLeft===0;var De=e=>({...e,terrain:[...e.terrain],objects:[...e.objects],keys:{...e.keys},tools:{...e.tools},gear:[...e.gear],hazards:e.hazards.length>0?[...e.hazards]:e.hazards}),Y=(e,t)=>oe(e.level,t)?e.terrain[O(e,t)]:"wall",ie=(e,t)=>oe(e.level,t)?e.objects[O(e,t)]:null;var de=(e,t)=>e.hazards.length>0&&e.hazards.some(n=>K(t,n.at));function Ie(e,t){e.terrain=e.terrain.map(n=>n==="toggle-open"?"toggle-closed":n==="toggle-closed"?"toggle-open":n),t.push({kind:"flipped"})}var $t=new WeakMap;function jt(e){let t=$t.get(e);return t||(t=e.terrain.flatMap((n,r)=>n==="teleport"?[r]:[]),$t.set(e,t)),t}var Wt=e=>jt(e).length>1;function it(e,t,n,r){let{cols:s}=e.level,o=jt(e.level),l=t.r*s+t.c,i=o.findIndex(a=>a>l);for(let a=0;a<o.length;a++){let u=o[((i<0?0:i)+a)%o.length];if(u===l)continue;let h={r:Math.floor(u/s),c:u%s},f=Q(h,n);if(Y(e,f)!=="teleport"&&r(f))return{via:h,to:f}}return null}var Bt=new WeakMap;function pr(e){let t=Bt.get(e);if(!t){let n=new Map;for(let[r,s]of Object.entries(e.links)){if(e.terrain[s]!=="trap")continue;let o=n.get(s);o?o.push(Number(r)):n.set(s,[Number(r)])}t=n,Bt.set(e,t)}return t}function mr(e,t){let n=pr(e.level).get(t);if(!n)return!1;let{cols:r}=e.level;return n.some(s=>{let o={r:Math.floor(s/r),c:s%r};return K(o,e.player)||ie(e,o)==="block"||de(e,o)})}var ne=(e,t)=>Y(e,t)==="trap"&&!mr(e,t.r*e.level.cols+t.c);function Ht(e,t,n){if(!oe(e.level,n))return!1;let r=Y(e,n);return $[r].hazard||te[t].crosses===r}var $e=(e,t,n)=>Ht(e,t,n)&&!ie(e,n)&&!K(n,e.minotaur)&&!K(n,e.cow)&&!de(e,n),Be=(e,t,n)=>K(n,e.player)?Ht(e,t,n):$e(e,t,n);function at(e,t,n,r,s=!1){let o=e.hazards[t],l=Y(e,o.at);return l==="bomb"?(e.terrain[O(e,o.at)]="floor",e.hazards.splice(t,1),n.push({kind:"exploded",who:"hazard",at:o.at}),"gone"):(l==="button"?Ie(e,n):l==="button-red"&&je(e,O(e,o.at),n,r,s),ne(e,o.at)&&n.push({kind:"held",who:"hazard",at:o.at}),"on")}function je(e,t,n,r,s=!1){let o=e.level.links[t];if(o===void 0)return;let l=e.level.machines.find(h=>O(e,h.at)===o),i=Q(l.at,l.dir);if(r&&K(i,r))return;if(l.template==="block"){if(!We(e,i))return;e.objects[O(e,i)]="block",n.push({kind:"cloned",what:"block",at:i}),ut(e,i,l.dir,r,n,s);return}if(!$e(e,l.template,i)||K(i,e.player))return;let a={kind:l.template,at:i,dir:l.dir,home:l.home};e.hazards.length===0&&(e.hazards=[]);let u=e.hazards.length;if(!s){let h=O(e,i);for(;u>0&&O(e,e.hazards[u-1].at)>h;)u--}e.hazards.splice(u,0,a),n.push({kind:"cloned",what:l.template,at:i}),at(e,u,n,r,s)}function br(e,t){let n=e.hazards[t];if(n)return n.at;let r=e.machines.find(s=>s.home===t);return Q(r.at,r.dir)}function ct(e,t,n){Y(e,t)==="popup"&&(e.terrain[O(e,t)]="wall",n.push({kind:"rose",at:t}))}var yr=(e,t,n)=>$e(e,t,n)&&Y(e,n)!=="bomb"&&!K(n,e.player);function gr(e,t,n){let r=br(e.level,n),s=new Set([O(e,r)]),o=[r];for(;o.length>0;){let l=o.filter(a=>yr(e,t,a)).sort((a,u)=>O(e,a)-O(e,u));if(l.length>0)return l[0];let i=[];for(let a of o)for(let u of W){let h=Q(a,u);!oe(e.level,h)||s.has(O(e,h))||(s.add(O(e,h)),i.push(h))}o=i}return null}function Gt(e,t,n){let r=e.hazards.findIndex(l=>K(t,l.at));if(r<0)return;let s=e.hazards[r];e.hazards.splice(r,1);let o=gr(e,s.kind,s.home);o&&(e.hazards.push({...s,at:o}),e.hazards.sort((l,i)=>O(e,l.at)-O(e,i.at))),n.push({kind:"sent-home",from:t,to:o})}function me(e,t,n,r){if(e.hearts--,t.push(r?{kind:"caught",at:e.player,hearts:e.hearts,by:n,hazard:r}:{kind:"caught",at:e.player,hearts:e.hearts,by:n}),e.hearts<=0){e.outcome="lost",t.push({kind:"lost"});return}ct(e,e.player,t),e.player=e.throwBack;let s=null;K(e.player,e.minotaur)&&(s=e.level.minotaur,e.minotaur=s,K(s,e.cow)&&(e.cow=null)),Gt(e,e.player,t),s&&Gt(e,s,t)}function He(e,t){if(e.outcome!=="playing")return!0;for(let n=0;n<t.length;n++)if(t[n].kind==="caught")return!0;return!1}function _t(e,t){return oe(e.level,t)&&$[Y(e,t)].minotaur&&ie(e,t)!=="block"&&!de(e,t)}function Kt(e,t,n){return e.minotaur=t,ne(e,t)&&n.push({kind:"held",who:"minotaur",at:t}),K(t,e.cow)&&(e.cow=null),K(t,e.player)?(me(e,n,"minotaur"),!0):!1}function wr(e,t){let n=e.minotaur;if(!n)return!0;if(ne(e,n))return!1;let r=e.cow??e.player,s=Math.sign(r.c-n.c),o=Math.sign(r.r-n.r),l=[];s&&l.push(s>0?"right":"left"),o&&l.push(o>0?"down":"up");let i=l.find(f=>_t(e,Q(n,f)));if(!i)return!1;let a=Q(n,i);if(t.push({kind:"moved",who:"minotaur",from:n,to:a}),Kt(e,a,t))return!0;let u=i,h=new Set([O(e,a)]);for(;;){let f=$[Y(e,e.minotaur)];if(f.carries)u=f.carries;else if(!f.slides)return!1;let d=Q(e.minotaur,u);if(!_t(e,d)||h.has(O(e,d)))return!1;if(t.push({kind:"slid",who:"minotaur",from:e.minotaur,to:d}),h.add(O(e,d)),Kt(e,d,t))return!0}}function Nt(e,t){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let n=0;n<2&&e.outcome==="playing";n++)if(wr(e,t))return}}var kr={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function xr(e,t,n){return K(e.hazards[t].at,e.player)?(K(e.player,e.cow)&&(e.cow=null),me(e,n,"hazard",e.hazards[t].kind),"caught"):at(e,t,n,void 0,!0)}function Tr(e,t,n){let r=e.hazards[t];if(ne(e,r.at))return"on";let s=r.dir;if(!Be(e,r.kind,Q(r.at,s))){s=void 0;for(let i of te[r.kind].turns){let a=kr[i][r.dir];if(Be(e,r.kind,Q(r.at,a))){s=a;break}}}if(!s)return"on";let o=Q(r.at,s);n.push({kind:"moved",who:"hazard",hazard:r.kind,from:r.at,to:o});let l=null;for(;;){r=e.hazards[t]={...r,at:o,dir:s};let i=xr(e,t,n);if(i!=="on")return i;let a=$[Y(e,o)];if(a.carries)s=a.carries,r.dir!==s&&(r=e.hazards[t]={...r,dir:s});else if(!a.slides)return"on";l??=new Set([O(e,o)]);let u=Q(o,s);if(l.has(O(e,u))||!Be(e,r.kind,u))return"on";n.push({kind:"slid",who:"hazard",hazard:r.kind,from:o,to:u}),l.add(O(e,u)),o=u}}function Ut(e,t){if(e.hazards.length!==0){for(let n=0,r=e.hazards.length;n<r;){let s=Tr(e,n,t);if(s==="caught")break;s==="gone"?r--:n++}e.hazards.sort((n,r)=>O(e,n.at)-O(e,r.at))}}function We(e,t){return oe(e.level,t)&&$[Y(e,t)].block&&!ie(e,t)&&!K(t,e.player)&&!K(t,e.minotaur)&&!K(t,e.cow)&&!K(t,e.throwBack)&&!K(t,e.level.minotaur)&&!de(e,t)}function ht(e,t,n,r){let s=Q(t,n);if(Y(e,s)!=="teleport")return We(e,s)&&r(s)?{entry:s,to:s}:null;if(K(s,e.player))return null;let o=it(e,s,n,l=>We(e,l)&&r(l));return o&&{entry:s,via:o.via,to:o.to}}function Yt(e,t,n,r,s){e.objects[O(e,t)]=null,e.objects[O(e,n.to)]="block",s.push(r==="pushed"?{kind:"pushed",from:t,to:n.entry}:{kind:"slid",who:"block",from:t,to:n.entry}),n.via&&s.push({kind:"teleported",who:"block",from:n.entry,via:n.via,to:n.to})}function ut(e,t,n,r,s,o=!1){let l=t,i=n,a=new Set([O(e,l)]);for(r&&a.add(O(e,r));;){let u=Y(e,l);if(u==="water"||u==="bomb"){e.objects[O(e,l)]=null,e.terrain[O(e,l)]=u==="water"?"dirt":"floor",s.push(u==="water"?{kind:"sank",at:l}:{kind:"exploded",who:"block",at:l});return}u==="button"?Ie(e,s):u==="button-red"&&je(e,O(e,l),s,r,o),ne(e,l)&&s.push({kind:"held",who:"block",at:l});let h=$[u];if(h.carries)i=h.carries;else if(!h.slides)return;let f=ht(e,l,i,d=>!a.has(O(e,d)));if(!f)return;Yt(e,l,f,"slid",s),a.add(O(e,f.to)),l=f.to}}var Mr=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Zt(e,t,n,r){if(!oe(e.level,t)||K(t,e.minotaur))return!1;let s=Y(e,t),o=$[s];return Mr.has(s)||s==="teleport"&&!Wt(e.level)||s==="gate"&&!lt(e)||o.needs&&!e.gear.includes(o.needs)||o.door&&e.keys[o.door]<=0?!1:de(e,t)||ie(e,t)!=="block"?!0:!r&&!ne(e,t)&&!!ht(e,t,n,()=>!0)}function ft(e,t,n,r,s){if(!Zt(e,t,n,r))return!1;if(de(e,t))return me(e,s,"hazard",e.hazards.find(l=>K(l.at,t)).kind),!1;let o=$[Y(e,t)];if(o.door&&(o.door!=="green"&&e.keys[o.door]--,e.terrain[O(e,t)]="floor",s.push({kind:"opened",color:o.door,at:t})),ie(e,t)==="block"){let l=ht(e,t,n,()=>!0);Yt(e,t,l,"pushed",s),ut(e,l.to,n,t,s)}return!0}function pt(e,t,n,r,s){ct(e,e.player,s),e.player=t;let o=Y(e,t);if(o==="bomb")return e.terrain[O(e,t)]="floor",s.push({kind:"exploded",who:"player",at:t}),me(e,s,"bomb"),!0;let l=ie(e,t);if(l&&l!=="block"&&(e.objects[O(e,t)]=null,s.push({kind:"took",what:l,at:t}),l==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):l==="page"?e.pages|=1<<e.level.pageCells.indexOf(O(e,t)):l.startsWith("key-")?e.keys[l.slice(4)]++:l==="mirror"||l==="cake"||l==="cow"?e.tools[l]++:e.gear.includes(l)||e.gear.push(l)),o==="thief"&&e.gear.length>0&&(s.push({kind:"robbed",at:t,gear:e.gear}),e.gear=[]),o==="safe"&&(e.throwBack=t),ne(e,t)&&s.push({kind:"held",who:"player",at:t}),o==="button"?Ie(e,s):o==="button-red"&&je(e,O(e,t),s),o==="exit"&&lt(e)&&(e.outcome="won",s.push({kind:"won"})),o==="teleport"){let i=it(e,t,n,a=>Zt(e,a,n,r));return i?ft(e,i.to,n,r,s)?(s.push({kind:"teleported",who:"player",from:t,via:i.via,to:i.to}),pt(e,i.to,n,r,s)):!0:!1}return!1}function Er(e,t,n){let r=t,s=new Set([O(e,e.player)]);for(;e.outcome==="playing";){let o=$[Y(e,e.player)];if(o.carries&&!e.gear.includes("suction"))r=o.carries;else if(!o.slides||e.gear.includes(o.slides))return;let l=Q(e.player,r);if(s.has(O(e,l))||!ft(e,l,r,!0,n)||(n.push({kind:"slid",who:"player",from:e.player,to:l}),s.add(O(e,l)),pt(e,l,r,!0,n)))return;s.add(O(e,e.player))}}function dt(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function Ar(e,t,n){if(t.kind==="move"){let r=e.player;if(ne(e,r))return!1;let s=Q(r,t.dir),o=Y(e,s);if(o==="invisible-wall")return e.terrain[O(e,s)]="wall",n.push({kind:"revealed",at:s,what:o}),"shown";if(o==="fake-wall"&&(e.terrain[O(e,s)]="floor",n.push({kind:"revealed",at:s,what:o})),ft(e,s,t.dir,!1,n))n.push({kind:"moved",who:"player",from:r,to:s}),pt(e,s,t.dir,!1,n)||Er(e,t.dir,n);else if(!He(e,n))return!1}else if(t.kind==="tool"){if(e.tools[t.tool]<=0)return!1;if(t.tool==="cake")e.hearts++;else if(t.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,n.push({kind:"stoned",turns:3});e.tools[t.tool]--}return!0}function qt(e,t){return dt(e.terrain,t.terrain)&&(e.terrain=t.terrain),dt(e.objects,t.objects)&&(e.objects=t.objects),dt(e.hazards,t.hazards)&&(e.hazards=t.hazards),e}function Ge(e,t){return t===e||t.moves===e.moves}function se(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let n=De(e),r=[],s=Ar(n,t,r);if(!s)return{state:e,events:[]};if(s==="shown")return{state:qt(n,e),events:r};let o=t.kind==="tool"&&t.tool==="mirror";return He(n,r)||Ut(n,r),!o&&!He(n,r)&&Nt(n,r),n.moves++,{state:qt(n,e),events:r}}var _e=["mirror","cake","cow"],he=e=>e<=0?0:32-Math.clz32(e),Xt=new WeakMap;function ae(e){let t=Xt.get(e);return t||Xt.set(e,t=Rr(e)),t}function vr(e){let t=new Set,n=[],r=a=>{let u=e.terrain[a];return $[u].block||$[u].door!==void 0||u==="fake-wall"},s=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,o=(a,u)=>a>=0&&u>=0&&a<e.rows&&u<e.cols,l=a=>{t.has(a)||a===s||!r(a)||(t.add(a),n.push(a))};e.objects.forEach((a,u)=>{a==="block"&&(t.add(u),n.push(u))});for(let a of e.machines){let u=a.at.r+H[a.dir][0],h=a.at.c+H[a.dir][1];a.template==="block"&&o(u,h)&&l(u*e.cols+h)}let i=[];for(e.terrain.forEach((a,u)=>{a==="teleport"&&i.push(u)});n.length;){let a=n.pop(),u=Math.floor(a/e.cols),h=a%e.cols,f=$[e.terrain[a]],d=f.slides!==void 0||f.carries!==void 0;for(let c of W){let[p,m]=H[c],T=u+p,w=h+m;if(!o(T,w))continue;let E=u-p,S=h-m;if(!(o(E,S)&&e.terrain[E*e.cols+S]!=="wall")&&!d)continue;let I=T*e.cols+w;if(e.terrain[I]!=="teleport"){l(I);continue}for(let P of i){let G=Math.floor(P/e.cols)+p,g=P%e.cols+m;o(G,g)&&l(G*e.cols+g)}}}return t}var Sr={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},mt=e=>Sr[e]??($[e].door!==void 0?"floor":void 0);function Pr(e,t){let n=new Set(t.map(s=>te[s].crosses)),r=[];return e.terrain.forEach((s,o)=>{let l=mt(s);($[s].hazard||n.has(s)||s==="toggle-closed"||l&&$[l].hazard)&&r.push(o)}),r}function Rr(e){let t=y=>e.objects.filter(b=>b===y).length,n=vr(e),r=[],s=[],o=[],l=[],i=[];e.terrain.forEach((y,b)=>{mt(y)?r.push(b):(y==="toggle-open"||y==="toggle-closed")&&s.push(b);let L=e.objects[b];n.has(b)?(L&&L!=="block"?i:l).push(b):L&&o.push(b)});let a=e.rows*e.cols,u=ue.map(y=>he(t(`key-${y}`))),h=_e.map(y=>he(t(y))),f=Ct.filter(y=>t(y)>0),d=he(a),c=t("cow")>0,p=e.minotaur!==null,m=t("mirror")>0?2:0,T=d*(2+(p?1:0)+(c?1:0))+m,w=he(It(e)),E=T+w+he(e.relics),S=[],k=E+e.pageIds.length;for(let y of u)S.push(k),k+=y;let I=[];for(let y of h)I.push(k),k+=y;let P=[...e.hazards.map(y=>y.kind)];for(let y of e.machines)y.home!==void 0&&(P[y.home]=y.template);let G=P.length>e.hazards.length,g=G?0:e.hazards.length,A=G?Pr(e,P):[],z=G?he(4*P.length):0,v=d*(2+(p?1:0)+(c?1:0))+m+w+he(e.relics)+e.pageIds.length+u.reduce((y,b)=>y+b,0)+h.reduce((y,b)=>y+b,0)+f.length+r.length+(s.length?1:0)+o.length+l.length+2*i.length+g*(d+2)+A.length*z;return{words:Math.max(1,Math.ceil(v/32)),cellBits:d,none:a,minotaur:p,cow:c,stoneBits:m,heartBits:w,relicBits:he(e.relics),pageBits:e.pageIds.length,keyBits:u,toolBits:h,gear:f,heartAt:T,pageAt:E,keyAt:S,toolAt:I,gearAt:k,changing:Int32Array.from(r),toggles:Int32Array.from(s),fixed:Int32Array.from(o),blockOnly:Int32Array.from(l),blockOrObject:Int32Array.from(i),hazardSlots:g,hazardCells:Int32Array.from(A),hazardBits:z,homeKinds:P}}function Z(e,t,n,r,s){if(r===0)return n;let o=t+(n>>>5),l=n&31;return e[o]|=s<<l,l+r>32&&(e[o+1]|=s>>>32-l),n+r}function Se(e,t,n,r){if(r===0)return 0;let s=t+(n>>>5),o=n&31,l=e[s]>>>o;return o+r>32&&(l|=e[s+1]<<32-o),r===32?l>>>0:l&(1<<r)-1}var fe=(e,t,n)=>t?t.r*e.level.cols+t.c:n;function we(e,t,n,r){let s=t;for(let i=0;i<s.words;i++)n[r+i]=0;let o=0;o=Z(n,r,o,s.cellBits,fe(e,e.player,s.none)),o=Z(n,r,o,s.cellBits,fe(e,e.throwBack,s.none)),s.minotaur&&(o=Z(n,r,o,s.cellBits,fe(e,e.minotaur,s.none))),s.cow&&(o=Z(n,r,o,s.cellBits,fe(e,e.cow,s.none))),o=Z(n,r,o,s.stoneBits,e.stone),o=Z(n,r,o,s.heartBits,e.hearts),o=Z(n,r,o,s.relicBits,e.relicsLeft),o=Z(n,r,o,s.pageBits,e.pages);for(let i=0;i<ue.length;i++)o=Z(n,r,o,s.keyBits[i],e.keys[ue[i]]);for(let i=0;i<_e.length;i++)o=Z(n,r,o,s.toolBits[i],e.tools[_e[i]]);for(let i of s.gear)o=Z(n,r,o,1,e.gear.includes(i)?1:0);for(let i of s.changing)o=Z(n,r,o,1,e.terrain[i]===e.level.terrain[i]?0:1);s.toggles.length&&(o=Z(n,r,o,1,e.terrain[s.toggles[0]]===e.level.terrain[s.toggles[0]]?0:1));for(let i of s.fixed)o=Z(n,r,o,1,e.objects[i]?1:0);for(let i of s.blockOnly)o=Z(n,r,o,1,e.objects[i]==="block"?1:0);for(let i of s.blockOrObject)o=Z(n,r,o,2,e.objects[i]==="block"?2:e.objects[i]?1:0);if(s.hazardSlots>1&&e.hazards.some((i,a)=>a>0&&fe(e,i.at,s.none)<fe(e,e.hazards[a-1].at,s.none)))throw new Error("the hazards must be sorted by cell");for(let i=0;i<s.hazardSlots;i++){let a=e.hazards.find(u=>u.home===i);o=Z(n,r,o,s.cellBits,a?fe(e,a.at,s.none):s.none),o=Z(n,r,o,2,a?W.indexOf(a.dir):0)}let l=0;for(let i of s.hazardCells){let a=e.hazards[l],u=a!==void 0&&fe(e,a.at,s.none)===i;o=Z(n,r,o,s.hazardBits,u?1+W.indexOf(a.dir)+4*a.home:0),u&&l++}if(s.hazardCells.length&&l!==e.hazards.length)throw new Error(`packed ${l} of ${e.hazards.length} hazards: they must be sorted by cell`)}function Ke(e,t,n,r,s=0){let o=n,l=0,i=g=>{let A=Se(e,t,l,g);return l+=g,A},a=g=>{let A=i(g);return A===o.none?null:{r:Math.floor(A/r.cols),c:A%r.cols}},u=a(o.cellBits),h=a(o.cellBits),f=o.minotaur?a(o.cellBits):null,d=o.cow?a(o.cellBits):null,c=i(o.stoneBits),p=i(o.heartBits),m=i(o.relicBits),T=i(o.pageBits),w={red:0,blue:0,yellow:0,green:0};ue.forEach((g,A)=>{w[g]=i(o.keyBits[A])});let E={mirror:0,cake:0,cow:0};_e.forEach((g,A)=>{E[g]=i(o.toolBits[A])});let S=[];for(let g of o.gear)i(1)&&S.push(g);let k=[...r.terrain];for(let g of o.changing)i(1)&&(k[g]=mt(r.terrain[g]));if(o.toggles.length&&i(1))for(let g of o.toggles)k[g]=r.terrain[g]==="toggle-open"?"toggle-closed":"toggle-open";let I=[...r.objects];for(let g of o.fixed)i(1)||(I[g]=null);for(let g of o.blockOnly)I[g]=i(1)?"block":null;for(let g of o.blockOrObject){let A=i(2);A===0?I[g]=null:A===2&&(I[g]="block")}let P=[],G=g=>({r:Math.floor(g/r.cols),c:g%r.cols});for(let g=0;g<o.hazardSlots;g++){let A=i(o.cellBits),z=W[i(2)];A!==o.none&&P.push({kind:o.homeKinds[g],at:G(A),dir:z,home:g})}P.sort((g,A)=>g.at.r*r.cols+g.at.c-(A.at.r*r.cols+A.at.c));for(let g of o.hazardCells){let A=i(o.hazardBits);if(!A)continue;let z=A-1>>>2;P.push({kind:o.homeKinds[z],at:G(g),dir:W[A-1&3],home:z})}return{level:r,terrain:k,objects:I,player:u,hearts:p,keys:w,gear:S,tools:E,pages:T,throwBack:h,minotaur:f,stone:c,cow:d,hazards:P,relicsLeft:m,moves:s,outcome:"playing"}}var Qt=new Set(["wall","invisible-wall","clone"]);function zr(e,t,n,r){let s=(u,h)=>u>=0&&h>=0&&u<e.rows&&h<e.cols&&!Qt.has(e.terrain[u*e.cols+h]),o=new Set,l=new Set,i=[],a=(u,h,f)=>{if(!s(u,h))return;let d=(u*e.cols+h)*4+W.indexOf(f);l.has(d)||(l.add(d),o.add(u*e.cols+h),i.push([u,h,f]))};for(a(Math.floor(t/e.cols)+H[n][0],t%e.cols+H[n][1],n);i.length;){let[u,h,f]=i.pop(),d=e.terrain[u*e.cols+h];if(d==="teleport"){for(let m of r){if(m===u*e.cols+h)continue;let T=Math.floor(m/e.cols)+H[f][0],w=m%e.cols+H[f][1];s(T,w)&&e.terrain[T*e.cols+w]!=="teleport"&&a(T,w,f)}continue}let c=$[d],p=c.carries??(c.slides?f:null);p&&a(u+H[p][0],h+H[p][1],p)}return[...o]}function Lr(e){let t=e.rows*e.cols,n=e.terrain.map(l=>!Qt.has(l)),r=e.terrain.flatMap((l,i)=>l==="teleport"?[i]:[]),s=Array.from({length:t},()=>[]);for(let l=0;l<t;l++)if(n[l])for(let i of W)for(let a of zr(e,l,i,r.length>1?r:[]))s[a].push(l);let o=new Uint8Array(t);return e.terrain.forEach((l,i)=>{l==="safe"&&(o[i]=1)}),o[e.player.r*e.cols+e.player.c]=1,{n:t,open:n,into:s,thrown:o}}function Jt(e,t){let n=new Float64Array(e.n).fill(1/0),r=new Int32Array(e.n),s=0;for(let l of t)n[l]===1/0&&(n[l]=0,r[s++]=l);let o=!1;for(let l=0;l<s;l++){let i=r[l],a=n[i]+1;for(let u of e.into[i])n[u]===1/0&&(n[u]=a,r[s++]=u);if(!o&&e.thrown[i]){o=!0;for(let u=0;u<e.n;u++)e.open[u]&&n[u]===1/0&&(n[u]=a,r[s++]=u)}}return n}function Or(e){let t=Lr(e),n=e.terrain.flatMap((l,i)=>l==="exit"?[i]:[]),r=Jt(t,n),s=e.objects.flatMap((l,i)=>l==="relic"?[i]:[]),o=s.map(l=>Jt(t,[l]));return l=>{if(l.outcome==="won")return 0;if(l.outcome==="lost")return 1/0;let i=l.player.r*e.cols+l.player.c,a=r[i];if(l.relicsLeft===0)return a;let u=0,h=1/0,f=0;for(let d=0;d<s.length;d++){if(l.objects[s[d]]!=="relic")continue;let c=o[d][i];u++,c<h&&(h=c),c>f&&(f=c)}return u<l.relicsLeft?1/0:Math.max(a,u===l.relicsLeft?f:h)}}var Vt=new WeakMap;function Ne(e){let t=Vt.get(e);return t||Vt.set(e,t=Or(e)),t}var ke=class extends Error{},en=1024;function Ue(e,t,n){let r=2538058380;for(let s=0;s<n;s++){let o=Math.imul(e[t+s],3432918353);o=Math.imul(o<<15|o>>>17,461845907),r^=o,r=Math.imul(r<<13|r>>>19,5)+3864292196}return r^=n,r=Math.imul(r^r>>>16,2246822507),r=Math.imul(r^r>>>13,3266489909),(r^r>>>16)>>>0}function qe(e){let t=e,n=en,r=new Uint32Array(n*t),s=new Uint32Array(n),o=new Int32Array(n),l=new Uint8Array(n),i=new Uint32Array(n),a=0,u=new Int32Array(en*2),h=u.length-1;function f(){n*=2;let c=new Uint32Array(n*t);c.set(r),r=c;let p=new Uint32Array(n);p.set(s),s=p;let m=new Int32Array(n);m.set(o),o=m;let T=new Uint8Array(n);T.set(l),l=T;let w=new Uint32Array(n);w.set(i),i=w,u=new Int32Array(n*2),h=u.length-1;for(let E=0;E<a;E++){let S=s[E]&h;for(;u[S]!==0;)S=S+1&h;u[S]=E+1}}function d(c,p,m){let T=c*t;for(let w=0;w<t;w++)if(r[T+w]!==p[m+w])return!1;return!0}return{get size(){return a},add(c,p,m,T,w){let E=Ue(c,p,t),S=E&h;for(let I=u[S];I!==0;S=S+1&h,I=u[S]){let P=I-1;if(!(s[P]!==E||!d(P,c,p)))return w>=i[P]?-1:(o[P]=m,l[P]=T,i[P]=w,P)}if(a===n)for(f(),S=E&h;u[S]!==0;)S=S+1&h;let k=a++;return r.set(c.subarray(p,p+t),k*t),s[k]=E,o[k]=m,l[k]=T,i[k]=w,u[S]=k+1,k},words(c,p,m){p.set(r.subarray(c*t,c*t+t),m)},parent:c=>o[c],action:c=>l[c],g:c=>i[c]}}var Pe=["mirror","cake","cow"],be=W.length,Ye=[...W.map(e=>({kind:"move",dir:e})),{kind:"wait"},...Pe.map(e=>({kind:"tool",tool:e}))],bt=[be,...W.map((e,t)=>t),...Pe.map((e,t)=>be+1+t)];function tn(e,t){let n=[];for(let r=t;e.parent(r)>=0;r=e.parent(r))n.push(Ye[e.action(r)]);return n.reverse()}function yt(e,t){return wt(gt(e,t),t.onProgress)}function*gt(e,t){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let n=t.store??qe(ae(e.level).words),r=o=>{if(o instanceof ke)return{solved:!1,explored:n.size,capped:!0,reason:o.message};throw o},s;try{s=Fr(e,t,n)}catch(o){return r(o)}for(;;){let o;try{o=s()}catch(l){return r(l)}if("explored"in o)return o;yield o}}function wt(e,t){for(;;){let n=e.next();if(n.done)return n.value;t?.(n.value)}}function Fr(e,t,n){let{cap:r,refuse:s}=t,o=t.prune??null,l=Math.max(1,t.progressEvery??65536),i=e.level,a=ae(i),u=Ne(i),h=new Uint32Array(a.words),f=1024,d=new Int32Array(f),c=new Int32Array(f),p=new Int32Array(f),m=new Uint8Array(f),T=new Uint16Array(f),w=new Int32Array(f),E=0,S=v=>{if(v<f)return;for(;f<=v;)f*=2;let y=new Int32Array(f);y.set(d),d=y;let b=new Int32Array(f);b.set(c),c=b;let L=new Int32Array(f);L.set(p),p=L;let D=new Uint8Array(f);D.set(m),m=D;let C=new Uint16Array(f);C.set(T),T=C},k=(v,y)=>d[v]<d[y]||d[v]===d[y]&&(c[v]<c[y]||c[v]===c[y]&&(T[v]>T[y]||T[v]===T[y]&&v<y)),I=v=>{let y=w[v];for(;v>0;){let b=v-1>>1,L=w[b];if(!k(y,L))break;w[v]=L,p[L]=v,v=b}w[v]=y,p[y]=v},P=v=>{if(E===w.length){let y=new Int32Array(w.length*2);y.set(w),w=y}w[E]=v,I(E++)},G=()=>{let v=w[0];p[v]=-1;let y=w[--E];if(E>0){let b=0;for(;;){let L=2*b+1;if(L>=E)break;let D=L+1,C=D<E&&k(w[D],w[L])?D:L;if(!k(w[C],y))break;w[b]=w[C],p[w[b]]=b,b=C}w[b]=y,p[y]=b}return v},g=u(e);if(we(e,a,h,0),o&&o({...e,moves:0},h,0))return()=>({solved:!1,explored:0,capped:!1});let A=n.add(h,0,-1,0,0);if(n.size>=r)return()=>({solved:!1,explored:n.size,capped:!0});S(A),c[A]=Number.isFinite(g)?g:-1,d[A]=c[A],p[A]=-1,T[A]=e.hearts,c[A]>=0&&P(A);let z=0;return()=>{let v=null;for(;E>0;){if(v)return v;let y=G();if(m[y])return{solved:!0,line:tn(n,y),explored:n.size};let b=d[y],L=b-c[y];++z%l===0&&(v={expanded:z,stored:n.size,bestF:b,startH:g}),n.words(y,h,0);let D=Ke(h,0,a,i,L);for(let C of bt){if(C>be&&D.tools[Pe[C-be-1]]<=0)continue;let X=se(D,Ye[C]),F=X.state;if(Ge(D,F)||F.outcome==="lost"||s&&s(X.events,D)||(we(F,a,h,0),o&&o(F,h,0)))continue;let x=n.size,M=n.add(h,0,y,C,L+1);if(M<0)continue;let R=F.outcome==="won";if(n.size>x){S(M);let B=R?0:u(F);c[M]=Number.isFinite(B)?B:-1,p[M]=-1,m[M]=R?1:0,T[M]=F.hearts}if(R&&L+1===b)return{solved:!0,line:tn(n,M),explored:n.size};if(n.size>=r)return{solved:!1,explored:n.size,capped:!0};c[M]<0||(d[M]=L+1+c[M],p[M]>=0?I(p[M]):P(M))}}return{solved:!1,explored:n.size,capped:!1}}}function Cr(e,t){for(let n=0;n<e.terrain.length;n++){if(!t(e.terrain[n]))continue;let r=Math.floor(n/e.cols),s=n%e.cols;for(let o of W){let l=r-H[o][0],i=s-H[o][1];if(l<0||i<0||l>=e.rows||i>=e.cols)continue;let a=$[e.terrain[l*e.cols+i]];if(a.slides||a.carries===o)return!0}}return!1}function Dr(e,t){let n=e.terrain.flatMap((r,s)=>r==="teleport"?[s]:[]);return n.length<2?!1:n.some(r=>W.some(s=>{let o=Math.floor(r/e.cols)+H[s][0],l=r%e.cols+H[s][1];return o>=0&&l>=0&&o<e.rows&&l<e.cols&&t(e.terrain[o*e.cols+l])}))}var nn=(e,t)=>Cr(e,t)||Dr(e,t);function Ir(e,t){let n=[];t.heartBits&&n.push({pos:t.heartAt,width:t.heartBits,set:!1}),t.pageBits&&n.push({pos:t.pageAt,width:t.pageBits,set:!0}),ue.forEach((s,o)=>{t.keyBits[o]&&!nn(e,l=>$[l].door===s)&&n.push({pos:t.keyAt[o],width:t.keyBits[o],set:!1})}),t.toolBits.forEach((s,o)=>{s&&n.push({pos:t.toolAt[o],width:s,set:!1})});let r=["flippers","fire-boots"];return t.gear.forEach((s,o)=>{r.includes(s)&&!nn(e,l=>$[l].needs===s)&&n.push({pos:t.gearAt+o,width:1,set:!1})}),n}var kt=1024;function Ze(e,t){let n=Ne(e),r=Ir(e,t);if(!r.length)return z=>n(z)===1/0;let s=t.words,o=new Uint32Array(s);for(let z of r)for(let v=z.pos;v<z.pos+z.width;v++)o[v>>>5]|=1<<(v&31);let l=[],i=0;for(let z of r)l.push(i),i+=z.width;let a=i+31>>>5,u=kt,h=new Uint32Array(u*s),f=new Int32Array(u),d=0,c=new Int32Array(kt*2),p=c.length-1,m=kt,T=new Uint32Array(m*a),w=new Uint32Array(m),E=new Int32Array(m),S=0,k=-1,I=new Uint32Array(s),P=new Uint32Array(a);function G(){u*=2;let z=new Uint32Array(u*s);z.set(h),h=z;let v=new Int32Array(u);v.set(f),f=v,c=new Int32Array(u*2),p=c.length-1;for(let y=0;y<d;y++){let b=Ue(h,y*s,s)&p;for(;c[b]!==0;)b=b+1&p;c[b]=y+1}}function g(z,v){let y=k;if(y>=0)k=E[y];else{if(S===m){m*=2;let b=new Uint32Array(m*a);b.set(T),T=b;let L=new Uint32Array(m);L.set(w),w=L;let D=new Int32Array(m);D.set(E),E=D}y=S++}return T.set(P,y*a),w[y]=z,E[y]=v,y}function A(z,v,y,b){for(let L=0;L<r.length;L++){let D=r[L],C=Se(z,v,l[L],D.width),X=Se(y,b,l[L],D.width);if(D.set?(C&X)!==X:C<X)return!1}return!0}return(z,v,y)=>{if(n(z)===1/0)return!0;let b=z.moves;for(let F=0;F<s;F++)I[F]=v[y+F]&~o[F];let L=Ue(I,0,s);P.fill(0);for(let F=0;F<r.length;F++)Z(P,0,l[F],r[F].width,Se(v,y,r[F].pos,r[F].width));let D=L&p,C=-1;for(let F=c[D];F!==0;D=D+1&p,F=c[D]){let x=F-1,M=!0;for(let R=0;R<s&&M;R++)M=h[x*s+R]===I[R];if(M){C=x;break}}if(C<0){if(d===u)for(G(),D=L&p;c[D]!==0;)D=D+1&p;return C=d++,h.set(I,C*s),c[D]=C+1,f[C]=g(b,-1),!1}for(let F=f[C];F>=0;F=E[F])if(w[F]<=b&&A(T,F*a,P,0))return!0;let X=-1;for(let F=f[C];F>=0;){let x=E[F];b<=w[F]&&A(P,0,T,F*a)?(X<0?f[C]=x:E[X]=x,E[F]=k,k=F):X=F,F=x}return f[C]=g(b,f[C]),!1}}var pe=2e6,xe=e=>e.some(t=>t.kind==="caught");function Re(e,t=pe){return yt(e,{cap:t,refuse:null,prune:Ze(e.level,ae(e.level))})}function rn(e,t,n=pe){return yt(e,{cap:n,refuse:t,prune:Ze(e.level,ae(e.level))})}function Xe(e,t,n=pe,r={}){return gt(e,{cap:n,refuse:t,prune:Ze(e.level,ae(e.level)),store:r.store,progressEvery:r.every})}var on={up:"u",down:"d",left:"l",right:"r"},xt={mirror:"z",cake:"x",cow:"c"};function Je(e){return e.map(t=>t.kind==="move"?on[t.dir]:t.kind==="wait"?"w":xt[t.tool]).join("")}function Tt(e){let t=[];for(let n of e){let r=W.find(o=>on[o]===n),s=Object.keys(xt).find(o=>xt[o]===n);if(r)t.push({kind:"move",dir:r});else if(n==="w")t.push({kind:"wait"});else if(s)t.push({kind:"tool",tool:s});else return null}return t}var Mt=e=>e.solved?e.line.length:e.capped?"unknown":"none";function ln(e,t=pe){return wt($r(e,t))}function*$r(e,t=pe,n={}){let r=re(e),s=E=>({store:n.store?.(ae(E).words),every:n.every}),o=yield*Xe(r,null,t,s(e)),l=Mt(o),i=0;if(o.solved){let E=r;for(let S of o.line){let k=se(E,S);E=k.state,xe(k.events,E)&&i++}}let a=Mt(yield*Xe(r,xe,t,s(e))),u=yield*Br(e,t,s(e)),h=u===null?"unknown":u?"chase":"solo",f=Et(e),d=o.solved?Je(o.line):"";if(!e.minotaur)return{solved:o.solved,shortest:l,explored:o.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:a,catches:i,label:h,naiveWins:f,line:d};let c={...e,minotaur:null},p=yield*Xe(re(c),null,t,s(c)),m=Mt(p),T=p.solved?!1:p.capped?null:!1;if(p.solved){let E=r;for(let S of p.line)E=se(E,S).state;T=E.outcome==="won"}let w=typeof l=="number"&&typeof m=="number"?l-m:null;return{solved:o.solved,shortest:l,explored:o.explored,withoutMinotaur:m,minotaurDelta:w,greedyWins:T,catchFree:a,catches:i,label:h,naiveWins:f,line:d}}function sn(e,t,n,r){let s=new Uint8Array(e.rows*e.cols),o=[t];s[t]=1;for(let l=0;l<o.length;l++){let i=o[l],a=Math.floor(i/e.cols),u=i%e.cols;for(let h of W){let f=a+H[h][0],d=u+H[h][1];if(f<0||d<0||f>=e.rows||d>=e.cols)continue;let c=f*e.cols+d;!s[c]&&n(c)&&(s[c]=1,o.push(c))}if(r?.from(i))for(let h of r.to)!s[h]&&n(h)&&(s[h]=1,o.push(h))}return s}function an(e){let t=new Set(e.objects.filter(i=>i!==null));e.machines.some(i=>i.template==="block")&&t.add("block");let n=i=>{let a=$[i];return a.door?t.has(`key-${a.door}`):i==="water"?t.has("block"):i==="toggle-open"||i==="toggle-closed"},r=sn(e,e.minotaur.r*e.cols+e.minotaur.c,i=>{let a=e.terrain[i];return $[a].minotaur||n(a)||a==="fake-wall"||a==="bomb"}),o=e.terrain.flatMap((i,a)=>i==="teleport"?[a]:[]).flatMap(i=>{let a=Math.floor(i/e.cols),u=i%e.cols;return W.flatMap(h=>{let f=a+H[h][0],d=u+H[h][1];return f<0||d<0||f>=e.rows||d>=e.cols?[]:[f*e.cols+d]})}),l=sn(e,e.player.r*e.cols+e.player.c,i=>{let a=e.terrain[i],u=$[a];return a==="wall"?!1:u.door?n(a):!u.needs||t.has(u.needs)||n(a)},{from:i=>e.terrain[i]==="teleport",to:o});return!r.some((i,a)=>i===1&&l[a]===1)}function*Br(e,t=pe,n={}){if(!e.minotaur||an(e))return!1;let r=ae(e),s=n.store??qe(r.words),o=Math.max(1,n.every??65536);try{let l=new Uint32Array(r.words);if(we(re(e),r,l,0),s.add(l,0,-1,0,0),s.size>=t)return null;let i=0;for(let a=0;a<s.size;a++){++i%o===0&&(yield{expanded:i,stored:s.size,bestF:0,startH:0}),s.words(a,l,0);let u=Ke(l,0,r,e,0);for(let h of bt){if(h>be&&u.tools[Pe[h-be-1]]<=0)continue;let f=se(u,Ye[h]);if(f.events.some(c=>c.kind==="caught"&&c.by==="minotaur"))return!0;let d=f.state;if(!(Ge(u,d)||d.outcome!=="playing")&&(we(d,r,l,0),s.add(l,0,a,h,0),s.size>=t))return null}}return!1}catch(l){if(l instanceof ke)return null;throw l}}var jr=16;function Wr(e,t){let n=e.rows*e.cols,r=new Int32Array(n).fill(-1),s=new Int8Array(n).fill(-1);r[t]=0;let o=[t];for(let l=0;l<o.length;l++){let i=o[l],a=Math.floor(i/e.cols),u=i%e.cols;W.forEach((h,f)=>{let d=a+H[h][0],c=u+H[h][1];if(d<0||c<0||d>=e.rows||c>=e.cols)return;let p=d*e.cols+c;r[p]>=0||e.terrain[p]==="wall"||(r[p]=r[i]+1,s[p]=f,o.push(p))})}return{dist:r,via:s}}function Hr(e){let t=e.rows*e.cols,n=e.player.r*e.cols+e.player.c,r=[],s=[];for(let m=0;m<t;m++)e.objects[m]==="relic"&&r.push(m),e.terrain[m]==="exit"&&s.push(m);let o=e.relics,l=[n,...r].map(m=>Wr(e,m)),i=m=>{let T=-1,w=1/0;for(let E of s){let S=l[m].dist[E];S>=0&&S<w&&(w=S,T=E)}return[T,w]},a=(m,T)=>{let w=l[m].dist[T===0?n:r[T-1]];return w<0?1/0:w},u=null;if(o===0)u=[];else if(r.length<=jr){let m=r.length,T=new Float64Array((1<<m)*m).fill(1/0),w=new Int8Array((1<<m)*m).fill(-1);for(let k=0;k<m;k++)T[(1<<k)*m+k]=a(0,k+1);let E=1/0,S=-1;for(let k=1;k<1<<m;k++){let I=Gr(k);if(!(I>o))for(let P=0;P<m;P++){let G=T[k*m+P];if(!(!(k&1<<P)||G===1/0)){if(I===o){let g=G+i(P+1)[1];g<E&&(E=g,S=k*m+P);continue}for(let g=0;g<m;g++){if(k&1<<g)continue;let A=(k|1<<g)*m+g,z=G+a(P+1,g+1);z<T[A]&&(T[A]=z,w[A]=P)}}}}if(S>=0){u=[];for(let k=S;;){let I=Math.floor(k/m),P=k%m;if(u.push(P+1),w[k]<0)break;k=(I&~(1<<P))*m+w[k]}u.reverse()}}else{u=[];let m=new Set(r.map((w,E)=>E+1)),T=0;for(;u.length<o;){let w=-1,E=1/0;for(let S of m){let k=a(T,S);k<E&&(E=k,w=S)}if(w<0){u=null;break}u.push(w),m.delete(w),T=w}}if(!u)return null;let h=u.length?u[u.length-1]:0,[f]=i(h);if(f<0)return null;let d=[],c=[0,...u],p=[...u.map(m=>r[m-1]),f];return c.forEach((m,T)=>{let{via:w}=l[m],E=p[T],S=[];for(let k=E;w[k]>=0;){let I=W[w[k]];S.push(I),k-=H[I][0]*e.cols+H[I][1]}d.push(...S.reverse())}),d}function Gr(e){let t=0;for(;e;e&=e-1)t++;return t}function Et(e){let t=Hr(e);if(!t)return!1;let n=re(e);for(let r of t)if(n=se(n,{kind:"move",dir:r}).state,n.outcome!=="playing")break;return n.outcome==="won"}var ge={minotaurDelta:8,exploredTimes:20};function un(e,t=ge,n){let r=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let s=e.withoutMinotaur!==null;if(s&&(e.minotaurDelta===null||e.greedyWins===null?r.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&r.push("the Minotaur does not matter: the line that ignores him wins, no longer")),r.push(...cn(e)),!n)return r;if(!s)return[...r,"a challenge level has a Minotaur"];e.greedyWins!==!1&&r.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<t.minotaurDelta&&r.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${t.minotaurDelta}`);let o=a=>Math.max(0,...n.teaching.map(a)),l=o(a=>a.explored);e.explored<t.exploredTimes*l&&r.push(`a challenge level: stored ${e.explored} situations, the bar is ${t.exploredTimes} × ${l} = ${t.exploredTimes*l}`);let i=o(a=>typeof a.shortest=="number"?a.shortest:0);return typeof e.shortest=="number"&&e.shortest<i&&r.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${i}`),r}function cn(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var dn={least:1.2,most:2.2};function hn(e,t,n=dn){let r=t.explored/Math.max(1,e.explored);return r<n.least?[`stored ${t.explored} situations, ${r.toFixed(2)} × the challenge level before it (${e.explored}); the ramp asks at least ${n.least} ×`]:r>n.most?[`stored ${t.explored} situations, ${r.toFixed(2)} × the challenge level before it (${e.explored}); the ramp allows at most ${n.most} ×`]:[]}var ye={ramp:{least:1.1,most:1.5},most:2e4};function Ve(e){return e.terrain.some(t=>t==="fake-wall"||t==="invisible-wall")}function fn(e){return Ve(e)?ye.ramp:dn}function pn(e,t){return!Ve(e)||t.explored<=ye.most?[]:[`the level hides walls: stored ${t.explored} situations, the ceiling for a level that hides walls is ${ye.most}`]}var ze={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function mn(e,t=ze){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let n=[];e.naiveWins&&n.push("the plain walk to the exit wins"),n.push(...cn(e));let r=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=ge.minotaurDelta,s=r?t.chaseShortest:t.shortest,o=r?t.chaseExplored:t.explored;return e.shortest<s&&n.push(`the quickest win is ${e.shortest} moves, the bar is ${s}`),e.explored<o&&n.push(`the solver searched ${e.explored} situations, the bar is ${o}`),n}var _r={flippers:e=>e.gear.includes("flippers")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="water","fire-boots":e=>e.gear.includes("fire-boots")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="fire",skates:e=>e.gear.includes("skates")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="ice",suction:e=>e.gear.includes("suction")&&$[e.terrain[e.player.r*e.level.cols+e.player.c]].carries!==void 0,mirror:e=>e.stone>0,cow:e=>e.cow!==null},Kr={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function ce(e,t){let n=[...e.terrain],r=[...e.objects];t(n,r);let s=e.machines.filter(o=>n[o.at.r*e.cols+o.at.c]==="clone");return V(ve({...e,terrain:n,objects:r,machines:s}))}function At(e){let t=[],n=l=>`row ${Math.floor(l/e.cols)+1}, column ${l%e.cols+1}`,r=l=>e.terrain[l.player.r*e.cols+l.player.c];for(let l of ue){let i=`key-${l}`,a=u=>$[r(u)].door===l;e.objects.includes(i)&&t.push({name:`the ${l} keys`,ignored:[ce(e,(u,h)=>{h.forEach((f,d)=>{f===i&&(h[d]=null)})})],used:a}),e.terrain.some(u=>$[u].door===l)&&t.push({name:`the ${l} doors`,ignored:["wall","floor"].map(u=>ce(e,(h,f)=>{h.forEach((d,c)=>{$[d].door===l&&(h[c]=u)}),f.forEach((d,c)=>{d===i&&(f[c]=null)})})),used:a})}let s=e.objects.filter(l=>l==="relic").length>e.relics;e.objects.forEach((l,i)=>{l==="block"?t.push({name:`the block at ${n(i)}`,ignored:[ce(e,(a,u)=>{u[i]=null,a[i]="wall"}),ce(e,(a,u)=>{u[i]=null})]}):(l==="relic"?s:l!==null&&l!=="cake"&&l!=="page"&&!l.startsWith("key-"))&&t.push({name:`the ${l==="relic"?"spare relic":l} at ${n(i)}`,ignored:[ce(e,(a,u)=>{u[i]=null})],used:l===null?void 0:_r[l]})});let o=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[l,i,a]of o){if(!e.terrain.some(f=>i.includes(f)))continue;let u=a.map(f=>ce(e,d=>{d.forEach((c,p)=>{i.includes(c)&&(d[p]=f)})})),h=Kr[i[0]];h&&e.objects.includes(h)&&u.push(ce(e,(f,d)=>{d.forEach((c,p)=>{c===h&&(d[p]=null)})})),t.push({name:`the ${l}`,ignored:u})}return e.terrain.some(l=>l==="button"||l==="toggle-open"||l==="toggle-closed")&&t.push({name:"the toggle walls and their button",ignored:[ce(e,l=>{l.forEach((i,a)=>{i==="button"||i==="toggle-open"?l[a]="floor":i==="toggle-closed"&&(l[a]="wall")})})]}),e.terrain.forEach((l,i)=>{let a=h=>{for(let[f,d]of Object.entries(e.links))d===i&&(h[Number(f)]="floor")},u=(h,f,d,c)=>t.push({name:`the ${h} at ${n(i)}`,ignored:[f,...c?[c]:[]].map(p=>ce(e,m=>{m[i]=p,d?.(m)}))});l==="trap"?u("snare","floor",a):l==="fake-wall"?u("fake wall","wall",void 0,"floor"):l==="invisible-wall"?u("invisible wall","floor"):l==="thief"?u("thief","floor"):l==="bomb"?u("bomb","floor"):l==="clone"&&u("clone machine","wall",a)}),e.hazards.forEach((l,i)=>{t.push({name:`the ${te[l.kind].name.toLowerCase()} at ${n(l.at.r*e.cols+l.at.c)}`,ignored:[V(ve({...e,hazards:e.hazards.filter((a,u)=>u!==i)}))]})}),t}var bn={explored:1.3};function Nr(e,t,n,r=!1){let s=Re(re(t),n);if(!s.solved)return s.capped?"capped":"the level cannot be won";if(s.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${s.line.length}`;let o=rn(re(t),xe,n);return o.solved?o.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${o.line.length}`:!r&&e.explored>=bn.explored*s.explored?`the search falls from ${e.explored} situations to ${s.explored}`:null:o.capped?"capped":"no win without a catch"}function Ur(e,t){let n=new Set;for(let r of t.ignored)for(let s=0;s<e.terrain.length;s++)(r.terrain[s]!==e.terrain[s]||r.objects[s]!==e.objects[s])&&n.add(s);return[...n]}function qr(e,t,n){let r=n.used?[]:Ur(e,n);if(!r.length&&!n.used)return!1;let s=re(e),o=l=>l.r*e.cols+l.c;for(let l of Tt(t)??[]){if(s=se(s,l).state,n.used?.(s))return!0;let i=o(s.player),a=s.minotaur?o(s.minotaur):-1;for(let u of r)if(i===u||s.terrain[u]!==e.terrain[u]||s.objects[u]!==e.objects[u]||a===u&&e.terrain[u]==="trap")return!0}return!1}function yn(e,t,n=pe,r=!1){return!t.solved||typeof t.catchFree!="number"?[]:At(e).flatMap(s=>{if(r&&qr(e,t.line,s))return[];let o=s.ignored.map(l=>Nr(t,l,n,r));return o.some(l=>l!==null&&l!=="capped")?[]:o.includes("capped")?[{unit:s,problem:`${s.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:s,problem:r?`${s.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${t.shortest}`:`${s.name}: ignoring it changes nothing (still ${t.shortest} moves, and the search no ${bn.explored} × smaller)`}]})}function gn(e){let t=[["Theseus",e.player]];e.minotaur&&t.push(["the Minotaur",e.minotaur]);for(let r of e.hazards)t.push([`the ${te[r.kind].name.toLowerCase()}`,r.at]);let n=[];for(let[r,s]of t){let o=s.r*e.cols+s.c,l=e.terrain[o],i=e.objects[o];(l!=="floor"||i!==null)&&n.push(`${r} starts on ${i??l} at row ${s.r+1}, column ${s.c+1}: nothing may start under a figure`)}return n}var Te={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function wn(e){return!e.minotaur||e.objects.includes("mirror")||e.terrain.includes("trap")?!1:an(e)}function Yr(e,t){let n=e.level;if(!e.minotaur)return 1/0;let r=e.minotaur.r*n.cols+e.minotaur.c,s=e.player.r*n.cols+e.player.c,o=new Map([[r,0]]),l=[r];for(let i=0;i<l.length;i++){let a=l[i],u=o.get(a);if(a===s)return u;if(u>=t)continue;let h=Math.floor(a/n.cols),f=a%n.cols;for(let d of W){let c=h+H[d][0],p=f+H[d][1];if(c<0||p<0||c>=n.rows||p>=n.cols)continue;let m=c*n.cols+p;o.has(m)||m!==s&&(!$[e.terrain[m]].minotaur||e.objects[m]==="block")||(o.set(m,u+1),l.push(m))}}return 1/0}function vt(e,t){let n=Tt(t.line)??[],r=re(e),s=0,o=0,l=0;for(let i of n)r=se(r,i).state,r.stone>0||!!r.minotaur&&(ne(De(r),r.minotaur)||Yr(r,Te.reach)<=Te.reach)?(s++,l=0):o=Math.max(o,++l);return{turns:n.length,live:s,quiet:o}}function kn(e,t,n){if(!e.minotaur||!t.solved||typeof t.shortest!="number")return[];let r=[];t.minotaurDelta!==null&&t.minotaurDelta<1&&r.push("the beast adds no moves: a route that ignores him wins as quickly");let s=Te[n],o=vt(e,t);return o.live<s.share*o.turns&&r.push(`the beast is live on ${o.live} of ${o.turns} turns; the bar is ${Math.ceil(s.share*o.turns)}`),o.quiet>s.quiet*o.turns&&r.push(`the beast is quiet for ${o.quiet} turns in a row; the bar is ${Math.floor(s.quiet*o.turns)}`),r}function St(e,t=0){let n=3735928559^t,r=1103547991^t;for(let s=0;s<e.length;s++){let o=e.charCodeAt(s);n=Math.imul(n^o,2654435761),r=Math.imul(r^o,1597334677)}return n=Math.imul(n^n>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),r=Math.imul(r^r>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),[n>>>0,r>>>0]}function xn(...e){return St(e.join(""))[0]}function Tn(...e){let t=e.join(""),[n,r]=St(t),[s,o]=St(t,2654435769),l=n,i=r,a=s,u=o|1,h=()=>{let d=(l+i|0)+u|0;return u=u+1|0,l=i^i>>>9,i=a+(a<<3)|0,a=a<<21|a>>>11,a=a+d|0,(d>>>0)/4294967296};for(let d=0;d<12;d++)h();let f=d=>Math.floor(h()*d);return{next:h,int:f,pick:d=>d[f(d.length)],shuffle(d){let c=[...d];for(let p=c.length-1;p>0;p--){let m=f(p+1);[c[p],c[m]]=[c[m],c[p]]}return c}}}var Qe={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function Pt(e){return Object.keys(Qe).filter(t=>Qe[t]<=e)}var tt=["fake","invisible"];function Mn(e,t,n,r){let s=t-(n-1);if(s<n*r)return null;let o=Array(n).fill(r);for(let a=s-n*r;a>0;a--)o[e.int(n)]++;let l=[],i=1;for(let a of o)l.push([i,i+a-1]),i+=a+1;return l}var Me={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},et=["up","down","left","right"];function En(e,t){let{rows:n,cols:r}=t,s=Mn(e,n-2,t.roomRows,2),o=Mn(e,r-2,t.roomCols,2);if(!s||!o)return null;let l=Array.from({length:n},()=>Array(r).fill("#")),i=t.roomRows*t.roomCols,a=x=>({r:s[Math.floor(x/t.roomCols)],c:o[x%t.roomCols]});for(let x=0;x<i;x++){let{r:M,c:R}=a(x);for(let B=M[0];B<=M[1];B++)for(let _=R[0];_<=R[1];_++)l[B][_]="."}let u=[];for(let x=0;x<i;x++)x%t.roomCols<t.roomCols-1&&u.push([x,x+1]),x+t.roomCols<i&&u.push([x,x+t.roomCols]);let h=[...Array(i).keys()],f=x=>h[x]===x?x:h[x]=f(h[x]),d=[],c=(x,M,R)=>{let B=a(x),_=a(M);if(M===x+1){let N=Math.max(B.r[0],_.r[0]),J=Math.min(B.r[1],_.r[1]),U=B.c[1]+1;if(R){for(let le=N;le<=J;le++)l[le][U]=".";return}let q=N+e.int(J-N+1);l[q][U]=".",d.push({r:q,c:U})}else{let N=Math.max(B.c[0],_.c[0]),J=Math.min(B.c[1],_.c[1]),U=B.r[1]+1;if(R){for(let le=N;le<=J;le++)l[U][le]=".";return}let q=N+e.int(J-N+1);l[U][q]=".",d.push({r:U,c:q})}};for(let[x,M]of e.shuffle(u))f(x)!==f(M)?(h[f(x)]=f(M),c(x,M,e.next()<t.hall)):e.next()<t.loop&&c(x,M,!1);let p=e.shuffle([...Array(i).keys()]),m=new Set,T=()=>{let x=p.filter(R=>!m.has(R)),M=x.length?x[0]:e.pick(p);return m.add(M),M},w=(x,M=(R,B)=>l[R][B]===".")=>{let{r:R,c:B}=a(x),_=[];for(let N=R[0];N<=R[1];N++)for(let J=B[0];J<=B[1];J++)M(N,J)&&_.push([N,J]);return _.length?e.pick(_):null},E=(x,M)=>et.some(R=>d.some(B=>B.r===x+Me[R][0]&&B.c===M+Me[R][1])),S=x=>{let M=x===void 0?e.shuffle([...Array(i).keys()]):[x];for(let R of M){let B=w(R,(_,N)=>l[_][N]==="."&&!E(_,N));if(B)return B}return null},k=(x,M)=>{let R=S(M);return R?(l[R[0]][R[1]]=x,!0):!1},I=()=>e.shuffle(d.filter(x=>l[x.r][x.c]===".")),P=x=>{let M=I()[0];return M?(l[M.r][M.c]=x,!0):!1},G=(x,M)=>{let{r:R,c:B}=a(x);if(e.next()<.5){let N=R[0]+e.int(R[1]-R[0]+1),J=Math.min(R[1],N+e.int(2));for(let U=N;U<=J;U++)for(let q=B[0];q<=B[1];q++)l[U][q]==="."&&(l[U][q]=M)}else{let N=B[0]+e.int(B[1]-B[0]+1),J=Math.min(B[1],N+e.int(2));for(let U=R[0];U<=R[1];U++)for(let q=N;q<=J;q++)l[U][q]==="."&&(l[U][q]=M)}},g=T(),A=T(),z=new Map,v=new Map,y=x=>{let M=S();return M?(l[M[0]][M[1]]=x,z.set(M[0]*r+M[1],e.pick(et)),!0):!1},b=!0;for(let x of t.families){switch(x){case"keys":{let[M,R]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),B=1+e.int(2);for(let _=0;_<B;_++)b=P(M)&&b;for(let _=0;_<(M==="G"?1:B);_++)b=k(R)&&b;break}case"water":{let M=T();G(M,"~"),b=(e.next()<.5?k("f"):k("O"))&&b;break}case"fire":{let M=T();G(M,"F"),b=k("h")&&b;break}case"ice":{let M=T();G(M,"="),e.next()<.5&&(b=k("k")&&b);break}case"force":{let M=T(),R=e.pick(["^","v","<",">"]);G(M,R),e.next()<.5&&(b=k("u")&&b);break}case"blocks":{let M=1+e.int(2);for(let R=0;R<M;R++)b=k("O")&&b;break}case"toggle":{let M=1+e.int(2);for(let R=0;R<M;R++)b=P(e.next()<.5?"T":"t")&&b;b=k("_")&&b;break}case"mirror":b=k("z")&&b;break;case"cow":b=k("c")&&b;break;case"gravel":{let M=1+e.int(2);for(let R=0;R<M;R++)b=P(":")&&b;break}case"popup":b=P(";")&&b;break;case"fake":b=P("W")&&b;break;case"invisible":b=k("I")&&b;break;case"snare":b=(e.next()<.5?P("&"):k("&"))&&k("-")&&b;break;case"teleport":b=k("@",T())&&k("@",T())&&b;break;case"ball":b=y("o")&&b;break;case"glider":b=y("w")&&b;break;case"fireball":b=y("e")&&b;break;case"thief":b=P("$")&&b;break;case"bomb":b=(e.next()<.5?P("!"):k("!"))&&b;break;case"clone":{let M=!1;for(let R=0;R<40&&!M;R++){let B=e.int(i),{r:_,c:N}=a(B),J=e.int(4),U=J<2?J===0?_[0]-1:_[1]+1:_[0]+e.int(_[1]-_[0]+1),q=J<2?N[0]+e.int(N[1]-N[0]+1):J===2?N[0]-1:N[1]+1,le=["down","up","right","left"][J],er=U+Me[le][0],tr=q+Me[le][1];U<=0||q<=0||U>=n-1||q>=r-1||l[U][q]!=="#"||l[er][tr]!=="."||(l[U][q]="C",v.set(U*r+q,`${e.pick(["block","ball","block"])}-${le}`),M=!0)}b=M&&k("+")&&b;break}}if(!b)return null}for(let x=0;x<t.relics;x++)if(!k("*"))return null;if(!k("P",g)||!k("M",A))return null;let L=[];for(let x=1;x<n-1;x++)l[x][1]==="."&&L.push([x,0,x,1]),l[x][r-2]==="."&&L.push([x,r-1,x,r-2]);for(let x=1;x<r-1;x++)l[1][x]==="."&&L.push([0,x,1,x]),l[n-2][x]==="."&&L.push([n-1,x,n-2,x]);if(!L.length)return null;let[D,C,X,F]=e.pick(L);return l[D][C]="E",t.relics>0&&e.next()<.5&&l[X][F]==="."&&!E(X,F)&&(l[X][F]="|"),{g:l,doors:d,facing:z,machines:v}}function Le(e,t){let n=[`title: ${t}`,"intro: "],r=[...e.facing.keys()].sort((o,l)=>o-l);r.length&&n.push(`facing: ${r.map(o=>e.facing.get(o)).join(" ")}`);let s=[...e.machines.keys()].sort((o,l)=>o-l);return s.length&&n.push(`machines: ${s.map(o=>e.machines.get(o)).join(" ")}`),`${n.join(`
`)}

${e.g.map(o=>o.join("")).join(`
`)}
`}var Zr=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function An(e,t){let n=t.g.map(f=>[...f]),r=n.length,s=n[0].length,o=[...t.doors],l=new Map(t.facing),i=f=>{let d=[];for(let c=1;c<r-1;c++)for(let p=1;p<s-1;p++)f(c,p)&&d.push([c,p]);return d},a=(f,d)=>o.some(c=>c.r===f&&c.c===d),u=(f,d)=>et.some(c=>a(f+Me[c][0],d+Me[c][1])),h=e.next();if(h<.55){let f=i((c,p)=>Zr.has(n[c][p])&&!a(c,p)),d=i((c,p)=>n[c][p]==="."&&!a(c,p)&&!u(c,p));if(f.length&&d.length){let[c,p]=e.pick(f),[m,T]=e.pick(d);n[m][T]=n[c][p],n[c][p]=".";let w=l.get(c*s+p);w&&(l.delete(c*s+p),l.set(m*s+T,w))}}else if(h<.7){let f=o.filter(c=>n[c.r][c.c]!=="."),d=o.filter(c=>n[c.r][c.c]===".");if(f.length&&d.length){let c=e.pick(f),p=e.pick(d);n[p.r][p.c]=n[c.r][c.c],n[c.r][c.c]="."}}else if(h<.8&&l.size)l.set(e.pick([...l.keys()]),e.pick(et));else{let f=o.filter(c=>n[c.r][c.c]==="."),d=i((c,p)=>n[c][p]==="#"&&(n[c-1][p]!=="#"&&n[c+1][p]!=="#"&&n[c][p-1]==="#"&&n[c][p+1]==="#"||n[c][p-1]!=="#"&&n[c][p+1]!=="#"&&n[c-1][p]==="#"&&n[c+1][p]==="#"));if(f.length>1&&(e.next()<.5||!d.length)){let c=e.pick(f);n[c.r][c.c]="#",o=o.filter(p=>p!==c)}else if(d.length){let[c,p]=e.pick(d);n[c][p]=".",o.push({r:c,c:p})}}return{g:n,doors:o,facing:l,machines:new Map(t.machines)}}var vn=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function Xr(e,t,n){for(let r=-1;r<=1;r++)for(let s=-1;s<=1;s++){let o=t+r,l=n+s;if(o>=0&&l>=0&&o<e.rows&&l<e.cols&&vn(e.terrain[o*e.cols+l])!=="wall")return!1}return!0}function Ee(e){return Array.from({length:e.rows-2},(t,n)=>Array.from({length:e.cols-2},(r,s)=>{let o=vn(e.terrain[(n+1)*e.cols+s+1]);return o==="wall"&&Xr(e,n+1,s+1)?"":o}))}var Jr=e=>e[0].map((t,n)=>e.map(r=>r[n]).reverse()),Vr=e=>e.map(t=>[...t].reverse());function nt(e){let t=[];for(let n=0,r=e;n<4;n++,r=Jr(r))t.push(r,Vr(r));return t}function Oe(e,t){let n=0;for(let r of t){let[s,o]=e.length*e[0].length<=r.length*r[0].length?[e,r]:[r,e],l=s.length,i=s[0].length,a=o.length,u=o[0].length;if(!(l>a||i>u||a-l>2||u-i>2))for(let h=0;h<=a-l;h++)for(let f=0;f<=u-i;f++){let d=0,c=0;for(let p=0;p<l;p++)for(let m=0;m<i;m++){let T=s[p][m],w=o[p+h][m+f];T&&T===w&&d++,(T||w)&&c++}n=Math.max(n,c?d/c:1)}}return n}var Pn=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function Rt(e){let t=new Set(e.terrain),n=new Set(e.objects.filter(r=>r!==null));return t.has("thief")||t.has("bomb")||t.has("clone")||t.has("button-red")?9:e.hazards.some(r=>r.kind!=="ball")?8:e.hazards.length?7:t.has("teleport")?6:t.has("trap")||t.has("button-brown")?5:t.has("fake-wall")||t.has("invisible-wall")?4:t.has("popup")?3:t.has("gravel")?2:1}var Qr=e=>({teaching:[{...Pn[e-1]}]});function Rn(e){let t=Pn[e-1];return{explored:Math.max(ze.chaseExplored,ge.exploredTimes*t.explored),shortest:Math.max(ze.chaseShortest,t.shortest)}}var Sn=ze.chaseExplored,eo={least:1.2,most:1.6},Ae={least:3e4,most:5e4};function rt(e,t){let n=t?ye.ramp:eo,r=t?ye.most:Ae.most;if(e===null)return{least:Sn,most:t?ye.most:2e4,plateau:!1};if(!t&&e>=Ae.least)return{least:Ae.least,most:Ae.most,plateau:!0};let s=Math.max(Sn,Math.ceil(e*n.least)),o=Math.min(r,Math.floor(e*n.most));return o>=s*1.15?{least:s,most:o,plateau:!1}:t?null:{least:Ae.least,most:Ae.most,plateau:!0}}function zn(e){return{features:e.map(t=>nt(Ee(t)))}}function zt(e){let{rows:t,cols:n}=e,r=(o,l)=>e.terrain[o*n+l]==="wall",s=[];for(let o=1;o<t-1;o++)for(let l=1;l<n-1;l++){let i=o*n+l,a=[r(o-1,l),r(o+1,l),r(o,l-1),r(o,l+1)].filter(Boolean).length;r(o,l)&&a===0&&s.push(`a lone wall at row ${o+1}, column ${l+1}`),e.terrain[i]==="floor"&&e.objects[i]===null&&!(e.player.r===o&&e.player.c===l)&&!(e.minotaur?.r===o&&e.minotaur.c===l)&&!e.hazards.some(h=>h.at.r===o&&h.at.c===l)&&a>=3&&s.push(`a bare pocket at row ${o+1}, column ${l+1}`)}return s}function Lt(e,t,n=[]){let r=Ee(e),s=[];return t.features.forEach((o,l)=>{let i=Oe(r,o);i>=.42&&s.push(`its layout repeats campaign level ${l+1}'s (${i.toFixed(2)})`)}),n.forEach((o,l)=>{let i=Oe(r,nt(Ee(o)));i>=.42&&s.push(`its layout repeats the run's level ${l+1}'s (${i.toFixed(2)})`)}),s}function Ln(e,t,n=[]){let r=Ee(e),s=0;for(let o of t.features)s=Math.max(s,Oe(r,o));for(let o of n)s=Math.max(s,Oe(r,nt(Ee(o))));return s}function On(e,t,n,r,s=[]){let o=[];return(t.explored<n.band.least||t.explored>n.band.most)&&o.push(`stored ${t.explored} situations, the band is ${n.band.least} to ${n.band.most}`),o.push(...un(t,ge,Qr(Rt(e))),...mn(t),...kn(e,t,"challenge"),...pn(e,t)),!n.band.plateau&&n.previous&&o.push(...hn(n.previous,t,fn(e))),Ve(e)&&n.band.plateau&&o.push("a level that hides walls never sits on the plateau"),o.length?o:[...gn(e),...zt(e),...Lt(e,r,s)]}var In=3e6,Ot=12,Xs=In*Ot;function to(e){return{parts:Ot,budget:e.budget===void 0?In:Math.max(1,Math.floor(e.budget/Ot))}}var $n=12,ot=120,no=.25;function ro(e,t,n,r,s=!1){let o=Pt(t).filter(d=>!tt.includes(d)),l=o.filter(d=>Qe[d]===Math.min(t,9)),i=2+e.int(2),a=[];l.length&&(e.next()<.5||s)&&a.push(e.pick(l)),r&&a.push(e.pick(tt));for(let d of e.shuffle(o))a.length<i+(r?1:0)&&!a.includes(d)&&a.push(d);let u=t<=1?12:11,h=u+e.int(16-u),f=u+e.int(16-u);return{rows:h,cols:f,roomRows:2+e.int(3),roomCols:2+e.int(3),families:a,relics:1+e.int(3),hall:.1+.25*e.next(),loop:.2+.3*e.next()}}var Ft=.6931471805599453;function Fn(e){let t=0;for(;e>=2;)e/=2,t++;for(;e<1;)e*=2,t--;let n=(e-1)/(e+1),r=n*n,s=n,o=0;for(let l=1;l<60;l+=2)o+=s/l,s*=r;return 2*o+t*Ft}function oo(e){if(!(e>=0))return 1;if(e>60)return 0;let t=0;for(;e>=Ft;)e-=Ft,t++;let n=1,r=1;for(let s=1;s<30;s++)n*=-e/s,r+=n;for(;t>0;t--)r/=2;return r}var Cn=e=>Math.ceil(e.most*1.05),Dn=e=>Math.max(2e5,e.most*4);function so(e,t,n,r=()=>0){if(!e.minotaur)return 1/0;let s=zt(e).length;if(s)return 14+s;let o=r(e);if(o>=.42)return 13+10*(o-.42);if(Et(e))return n(0,"cheap:walk"),12.5;if(wn(e))return n(0,"cheap:penned"),12.5;let l=re(e),i=Re(l,Cn(t));if(!i.solved)return n(i.explored,i.capped?"solve:capped":"solve:lost"),i.capped?12:30;n(i.explored,i.explored<t.least?"solve:low":i.explored>t.most?"solve:high":"solve:in");let a=0,u=Rn(Rt(e)),h=Math.max(t.least,u.explored);i.explored<h&&(a+=3*Fn(h/i.explored)),i.explored>t.most&&(a+=3*Fn(i.explored/t.most)),i.line.length<u.shortest&&(a+=.2*(u.shortest-i.line.length));let f=l,d=0;for(let m of i.line){let T=se(f,m);f=T.state,xe(T.events,f)&&d++}a+=3*d;let c=vt(e,{line:Je(i.line)});if(a+=6*Math.max(0,Te.challenge.share-c.live/Math.max(1,c.turns)),a+=6*Math.max(0,c.quiet/Math.max(1,c.turns)-Te.challenge.quiet),a>0)return a;let p=Re(re({...e,minotaur:null}),Cn(t));if(n(p.explored,"free"),p.solved){a+=.4*Math.max(0,ge.minotaurDelta-(i.line.length-p.line.length));let m=l;for(let T of p.line)m=se(m,T).state;m.outcome==="won"&&(a+=2)}return a}function lo(e,t){let n=ve(t),r=n.slice(n.indexOf(`

`)+2).trimEnd().split(`
`).map(l=>[...l]),s=new Map(t.hazards.map(l=>[l.at.r*t.cols+l.at.c,l.dir])),o=new Map(t.machines.map(l=>[l.at.r*t.cols+l.at.c,`${l.template}-${l.dir}`]));return{g:r,doors:e.doors,facing:s,machines:o}}function io(e){let t=n=>n.terrain.filter(r=>r==="wall").length;return e.reduce((n,r)=>t(r)<t(n)?r:n)}function ao(e,t,n){let r=t.run.slice(-$n),s=e.filter(d=>d.chapter<=t.tier),o=r.map(d=>V(d.text)),l=s.filter(d=>!r.some(c=>c.text===d.text)&&Lt(V(d.text),{features:[]},o).length===0),i=t.run.at(-1)?.explored??null,a=rt(Number.MAX_SAFE_INTEGER,!1),u=[d=>d.explored>=n.least&&d.explored<=n.most,d=>i!==null&&d.explored>=i*1.2&&d.explored<=i*2.2,d=>d.explored>=a.least&&d.explored<=a.most,()=>!0],h=d=>d[xn("endless-bank",t.seed,t.tier,t.depth)%d.length],f=s.filter(d=>d.text!==t.run.at(-1)?.text);for(let d of u)for(let c of[l,f,s]){let p=c.filter(d);if(p.length)return h(p)}if(e.length)return h(e);throw new RangeError("the bank is empty")}function uo(e,t,n,r,s,o,l,i,a,u=null,h,f=!1){let d=i.by,c=(T,w="other")=>{i.spent+=T,d&&(d[w]=(d[w]??0)+T,d[w+"#"]=(d[w+"#"]??0)+1)},p=new Map,m=T=>{let w=`${T.cols}:${T.terrain.join(",")}`,E=p.get(w);return E===void 0&&(E=Ln(T,s,o),p.set(w,E)),E};for(let T=0;i.spent<l;T++){let w=Tn("endless",...e,T),E=u!==null&&w.next()<.25,S=E?u:n,k=En(w,ro(w,t,S,E,f));if(!k){c(1e3);continue}let I=b=>{try{return V(Le(b,""))}catch{return null}},P=new Map,G=(b,L)=>{let D=Le(b,""),C=P.get(D);return C===void 0?(C=so(L,S,c,m),P.set(D,C)):d&&(d["memo#"]=(d["memo#"]??0)+1),C},g=I(k),A=g?G(k,g):1/0,z=A,v=i.spent,y=ot;for(let b=0;b<y&&i.spent<l&&(b===y-1&&A<2&&y<3*ot&&(y+=ot),!(b===Math.floor(ot/3)&&A>=8));b++){if(i.tries++,b%8===0&&a?.({tries:i.tries,spent:i.spent,budget:l}),A===0&&g){let X=ln(g,Dn(S));c(4*X.explored,"measure");let F=On(g,X,{band:S,previous:r},s,o);if(F.length){if(h?.(`gate: ${F.join("; ")}`),d)for(let x of F){let M="gate:"+x.replace(/[0-9.,×]+/g,"N").slice(0,50);d[M]=(d[M]??0)+1}A=1,P.set(Le(k,""),A)}else{c(At(g).reduce((R,B)=>R+B.ignored.length,0)*2*X.explored,"useless");let x=yn(g,X,Dn(S),!0);if(!x.length)return{text:Le(k,""),d:X};h?.(`useless: ${x.map(R=>R.problem).join("; ")}`);let M=io(x[0].unit.ignored);k=lo(k,M),g=I(k),A=g?G(k,g):1/0;continue}}let L=An(w,k),D=I(L);if(!D)continue;let C=G(L,D);(C<=A||Number.isFinite(C)&&w.next()<oo((C-A)/no))&&(k=L,g=D,A=C)}h?.(`round ${T}: began ${z.toFixed(2)}, ended ${A.toFixed(2)} from passing, ${i.spent-v} spent`)}return null}function Bn(e){let t=e.run.at(-1)??null,n=rt(t?.explored??null,!1),r=t&&Pt(e.tier).some(s=>tt.includes(s))?rt(t.explored,!0):null;return{band:n,hides:r,before:t}}function jn(e,t,n,r={}){let{band:s,hides:o,before:l}=Bn(e),{parts:i,budget:a}=to(e);if(!l||t<0||t>=i)throw new RangeError(`no part ${t} of a search for level ${e.depth}`);let u={tries:0,spent:0},h=e.run.slice(-$n).map(c=>V(c.text)),f=uo([e.seed,e.tier,e.depth,"part",t],e.tier,s,{explored:l.explored},n,h,a,u,r.progress,o);return{found:f?{text:f.text,explored:f.d.explored,shortest:f.d.shortest,line:f.d.line,from:"made",tries:u.tries,spent:u.spent}:null,...u}}function Wn(e,t,n=0,r=0){let s=ao(t,e,Bn(e).band);return{text:s.text,explored:s.explored,shortest:s.shortest,line:s.line,from:"bank",tries:n,spent:r}}var co=150;function Hn(e){let t=null;return{receive(n){try{if(n.type==="bank"){e.post({type:"made",id:n.id,made:Wn(n.request,e.bank,n.tries,n.spent)});return}if(n.type!=="part")return;t??=e.known();let r=-1/0,s=jn(n.request,n.part,t,{progress:o=>{let l=e.now();l-r<co||(r=l,e.post({type:"progress",id:n.id,progress:o}))}});e.post({type:"part",id:n.id,part:n.part,result:s})}catch(r){e.post({type:"failed",id:n.id,message:r instanceof Error?r.message:String(r)})}}}}var Gn=[{chapter:1,explored:12729,shortest:36,line:"urrrdrrdlddddrrcrdrrruullluuuuurrrur",text:`title: 
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
`},{chapter:1,explored:14905,shortest:38,line:"uullddddzlrrrdddddlludrruuuuurrrrrdrrr",text:`title: 
intro: 

#############
#r......#...#
#..#z...#...#
#..#P...#...#
##.######.###
#r......R...#
#..#....#...E
##R#.##.###.#
#..#....#...#
#.*#....#...#
#...........#
#.#####.#...#
#..M....#...#
#.......#...#
#############
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
`},{chapter:1,explored:19315,shortest:39,line:"urrrrrrudwuuuuuuuulllddddrrurdrruuuurru",text:`title: 
intro: 

############E#
#....*.._#...#
#........#...#
#........#M..#
#........#...#
#......O.T...#
#........#...#
#........#...#
#.##.###.#...#
#......==#...#
#P..#...=#...#
#...#..==t...#
#......==#...#
#...#..==#...#
##############
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
`},{chapter:1,explored:38970,shortest:58,line:"urrruuuuuudddlcrurruullllllllddddduuuuurrrrrrddddddllddlld",text:`title: 
intro: 

###############
#..#.......#..#
#..........#..#
#..#....c.....#
##.#####..*####
#..#..........#
#.M#...#...#..#
#.*#####.###..#
#..#.......#..#
#..#.P.#...#..#
#..#|..#...#..#
####E##########
`},{chapter:1,explored:41384,shortest:48,line:"uluuulrdddlldullldlddrcddddrruruuuddddlllllulldd",text:`title: 
intro: 

#############
#..#..#.....#
#.....#.....#
#..#.....c..#
####.#####..#
#==#..#..#..#
#==.........#
#==#..#.*#.P#
##.#.########
#M.#..#.*#..#
#.....#..#..#
##.##.##.#.##
#.....#.....#
#...O.......#
#E###########
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
`},{chapter:2,explored:8130,shortest:47,line:"lluuurrrrrdrlddrrrzdllldddllllrrrrdddrrrrrlllld",text:`title: 
intro: 

###############
#.............#
#.*...#.z.....#
##.##.#:#####.#
#...P.#.......#
#.....#.......#
#######:##.####
#.............#
#..*..........#
##.####.#####.#
#.....#..M....#
#.....#.....*.#
########E######
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
`},{chapter:2,explored:9786,shortest:39,line:"llllluuddcrrrddrrrdlllddddllllldddlllll",text:`title: 
intro: 

###############
#.....#c......#
#.....#.......#
#...........P.#
#.....####.####
#.....#....^^.#
#.....#....^^*#
#.....#M...^^.#
#.....#....^^.#
#.....:....^^.#
#.....#....^^.#
#.....#....^^.#
E|...*#....^^.#
#.....#....^^.#
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
`},{chapter:2,explored:27792,shortest:44,line:"ddddldluurulllllulurllldddddddlluurruuuuulll",text:`title: 
intro: 

###############
#...#.........#
E|..:....#..P.#
#...#....#....#
#...#.........#
#...#....#....#
###.#.##:#.O..#
#........#....#
#M..#....#....#
#*..#.........#
###############
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
`},{chapter:3,explored:13963,shortest:39,line:"dllddlllllllluuddrruuurdcuurrduuruuuulu",text:`title: 
intro: 

#######E######
#..#.....#...#
#M.#.....#...#
#........;...#
####..##.###.#
#.....#..#...#
#..#.........#
#..#c.#*.#..P#
#.*#..#..#...#
#..#.###.#...#
#............#
#............#
#............#
#............#
##############
`},{chapter:3,explored:14611,shortest:37,line:"dldrrdruuuurlluduuullrrurrrrddddddddd",text:`title: 
intro: 

###########
#.....#...#
#.....:...#
#*....#...#
###:###;###
#.........#
#....*#M..#
#.P...#...#
#.....#...#
#.O...#...#
#.....#...#
#######E###
`},{chapter:3,explored:27661,shortest:46,line:"ddrrrrurrrdrddddrzddddlllllluuulrrrruuuruuuuru",text:`title: 
intro: 

###########E##
#.P.....#....#
#.......;....#
#.*.....#....#
#.###.####.###
#.......#....#
#.......#*...#
#######.#..z.#
#....*.......#
#.......#>>>>#
###.##.##.##.#
#............#
#.......#.M..#
#.......#....#
##############
`},{chapter:5,explored:9946,shortest:41,line:"ddlddrdrlllllluuuuuuuuuuurrrrrlllllldlluu",text:`title: 
intro: 

#E###########
#.O......*..#
#M..........#
#...........#
#.....####&##
#....~#....-#
#....~#.....#
#....~#..P..#
#....~#.....#
#....~#.....#
#....~#.O...#
#....~#.....#
#....~......#
#############
`},{chapter:5,explored:17888,shortest:65,line:"uluuuudddddddrrrurrruuuurruudulllludrrddddrddllldllluuuluuuulldll",text:`title: 
intro: 

##############
#..#..#.*#...#
#....-#....O.#
E..#..#..#.&.#
#..#..#..#...#
####.#####.###
#..#..#..#.*.#
#..#.P#..#.*M#
#..#..#......#
#..#.....#...#
##############
`},{chapter:6,explored:9027,shortest:42,line:"drddrdddddllllluuuuuuurulrdlulllddddrddddd",text:`title: 
intro: 

###############
#...P..#==...@#
#.@.....==.#.*#
#.###.##;######
#..........#.M#
#......#......#
#......#...#..#
#..###.##.#####
#..#...#......#
#*....*#...#..#
#..#...#...#..#
#########E#####
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
`},{chapter:6,explored:29476,shortest:43,line:"rrddlllllrrcrdrulllluuuulddrdddlullllllldll",text:`title: 
intro: 

###############
#*M.....#.....#
#.............#
#.......#.....#
##.###.##.##.##
#@............#
#=======#P....#
###########.###
#.*...c...*...#
E|......#@....#
###############
`},{chapter:6,explored:42402,shortest:45,line:"lddddddluuullulrlrlzllrrddddllllllldrddddrrrd",text:`title: 
intro: 

###############
#...#..@..#...#
#.........#..P#
##T####.####t##
#...#.*..@....#
#...........*.#
########.##...#
#.M.#.....#.z_#
#*........#...#
#...#.........#
##.####.#######
#.........#...#
#.........#...#
#.........#...#
#####E#########
`},{chapter:7,explored:11086,shortest:33,line:"lurrruuuuuuurruwwwuuurrrlllllllll",text:`title: 
intro: 
facing: right

###########
E...M.....#
#o........#
#.........#
###.##.####
#.FF......#
#.FF.#....#
#....####.#
#.........#
#.........#
#.........#
####.#.##.#
#.*..#....#
#*P.......#
###########
`},{chapter:7,explored:17739,shortest:39,line:"rwruwdrrruuluuurrrlulldlllluurlllluuuul",text:`title: 
intro: 
facing: right

###############
E........M.#..#
#..#...#...#..#
#..#...#...#.-#
#.####.#.###R##
#....*.#...#..#
#..#...#..*#..#
#..#*.........#
##.#...#.####.#
#..#...#...&..#
#......R...#..#
#.####.##.#####
#..#P.....o#..#
#......#......#
###############
`},{chapter:7,explored:22691,shortest:69,line:"uwrrddrrruurruuuuuudddldddddlluuuuuuuullddddlllluuuurrrrrrddddddddlld",text:`title: 
intro: 
facing: down

##############
#M...........#
#...#..#.....#
#...#..#.....#
#...#..#.....#
#.*.Y..#.....#
########.....#
#......#.>...#
#..P#y.#.>...#
#...#.....o..#
######E#######
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
`},{chapter:8,explored:9130,shortest:34,line:"rruruuullllluuddddddddrrrrrrrwwrdd",text:`title: 
intro: 
facing: left

##############
#.......#....#
#..w....#....#
#............#
#*...M..#....#
#.####&##....#
#.......#....#
#.......#....#
#.......#....#
#.......#....#
#..P.-..#....#
#.......#....#
#............#
#.......#....#
#########E####
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
`},{chapter:8,explored:24214,shortest:60,line:"lwrwllllllldwwdrrwwwwwwwwwwwwwwwddddddllluurwuuurrrrddrrrddr",text:`title: 
intro: 
facing: down

###########
#....#....#
#.......*P#
##.########
#....#....#
#.........#
#....#....#
#....#....#
#....####.#
#.O.......E
#...M#....#
#.######.##
#..e......#
#....#....#
###########
`},{chapter:8,explored:35208,shortest:40,line:"uuuuuruuuudddrrrrddddduuuuurwwwwwwrrrdrr",text:`title: 
intro: 
facing: up

###############
#....#.....#..#
#....#.....#..#
####.#####.##.#
#....#.....#..#
#.............#
#....#.....#.|E
#....#.....#..#
#....#.....#..#
#....#.....#..#
#.......*..#.M#
#..P.#.....#..#
#....#.....#..#
#....#...e.#..#
###############
`},{chapter:9,explored:9031,shortest:39,line:"uuurrwrrrddrrddddddlluurrwuuuuurruurrrr",text:`title: 
intro: 
facing: left

###############
#...#.........E
#......#...#..#
#...#..#...#..#
#...#..$...#..#
#P..#..#......#
###.##Y#.###Y##
#...#......o..#
#...#.........#
#...#.........#
#...#.*.......#
#............M#
###############
`},{chapter:9,explored:11062,shortest:40,line:"ruuuudddrrrrwdluluuuuuuurldddddrrrdddddr",text:`title: 
intro: 

##############
#.....M......#
#.......#.*..#
#.##.##.#.####
#............#
#............#
#.*..........#
#.........*..#
##$###.##.##.#
#.......#....#
#P...@..#..@.#
#............#
#.......#...|E
#.......#....#
##############
`},{chapter:9,explored:39169,shortest:49,line:"rdddduuuuurrdrdddluruucrrrrdddddluuuruuuuullluulu",text:`title: 
intro: 

#####E#####
#..#M..#..#
#..#...#..#
#.........#
##!###.##.#
#......#..#
#P.#......#
#..##.###.#
#..#...#..#
#..#*..#..#
#.c#...#..#
#..#...#*.#
#..#...#..#
#..#...#..#
###########
`},{chapter:9,explored:44031,shortest:49,line:"uluuuruuuudddddddrruuuuuurrrlllddddddlluuuuuululu",text:`title: 
intro: 
machines: block-left

##E########
#....&....#
#....#M..*#
#....#....#
####.#....#
#....C....#
#....#....#
#...+#....#
#.-.......#
#...P#....#
#....#....#
###########
`}];var _n=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
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
`}];var Kn=[{id:"ch2-1",text:`title: The Loose Stone
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
`}];var Nn=[{id:"ch3-1",text:`title: The Rising Floor
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
`}];var Un=[{id:"ch4-1",text:`title: The Wall That Gives
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
`}];var qn=[{id:"ch5-1",text:`title: The Snare
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
`}];var Yn=[{id:"ch6-1",text:`title: The Teleport
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
`}];var Zn=[{id:"ch7-1",text:`title: The Bronze Ball
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
`}];var Xn=[{id:"ch8-1",text:`title: The Harpy
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
`}];var Jn=[{id:"ch9-1",text:`title: The Thief
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
`}];var Vn=[{id:"ch10-1",text:`title: The Wooden Cow
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
`}];var ho=[..._n,...Kn,...Nn,...Un,...qn,...Yn,...Zn,...Xn,...Jn,...Vn];function Qn(){return ho.map(e=>V(e.text))}var fo=Hn({post:e=>self.postMessage(e),bank:Gn,known:()=>zn(Qn()),now:()=>performance.now()});self.onmessage=e=>fo.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
