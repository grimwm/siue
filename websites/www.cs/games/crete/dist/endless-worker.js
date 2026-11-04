"use strict";(()=>{var Y=["up","down","left","right"],q={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},Me=["red","blue","yellow","green"],$t=["flippers","fire-boots","skates","suction"],lt={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},U=(e,t,n,r={},l,o=t)=>({char:e,minotaur:t,block:n,hazard:o,...r,sprites:l??[]}),$={floor:U(".",!0,!0,{},["floor"]),wall:U("#",!1,!1,{},["wall"]),exit:U("E",!1,!1,{},["exit"]),gate:U("|",!1,!1,{},["gate-closed","gate-open"]),water:U("~",!1,!0,{needs:"flippers"},["water"]),fire:U("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:U("=",!0,!0,{slides:"skates"},["ice"]),"force-up":U("^",!0,!0,{carries:"up"},["force-up"]),"force-down":U("v",!0,!0,{carries:"down"},["force-down"]),"force-left":U("<",!0,!0,{carries:"left"},["force-left"]),"force-right":U(">",!0,!0,{carries:"right"},["force-right"]),dirt:U("%",!0,!0,{},["dirt"]),safe:U("S",!1,!1,{},["safe"]),button:U("_",!0,!0,{},["button"]),"toggle-open":U("t",!0,!1,{},["toggle-open"]),"toggle-closed":U("T",!1,!1,{},["toggle-closed"]),"door-red":U("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":U("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":U("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":U("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:U("&",!0,!0,{},["trap"]),"button-brown":U("-",!0,!0,{},["button-brown"]),"button-red":U("+",!0,!0,{},["button-red"]),popup:U(";",!1,!1,{},["popup"]),gravel:U(":",!1,!1,{},["gravel"]),"fake-wall":U("W",!1,!1,{},["wall"]),"invisible-wall":U("I",!1,!1,{},["floor"]),teleport:U("@",!1,!1,{},["teleport"]),thief:U("$",!0,!0,{},["thief"]),bomb:U("!",!1,!0,{},["bomb"],!0),clone:U("C",!1,!1,{},Y.map(e=>`clone-${e}`))},re={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var $e={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:lt.mirror.name},cake:{char:"x",sprite:"cake",name:lt.cake.name},cow:{char:"c",sprite:"cow",name:lt.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},cr=["theseus","minotaur","minotaur-stone","cow-standing"],dr=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],hr=["exit-off","exit-wake"],So=[...new Set([...Object.values($).flatMap(e=>e.sprites),...dr,...hr,...Object.values($e).map(e=>e.sprite),...cr,...Object.values(re).map(e=>e.sprite)])];var te=class extends Error{line;col;constructor(t,n,r){super(`line ${t}, column ${n}: ${r}`),this.line=t,this.col=n}},fr=new Map(Object.entries($).map(([e,t])=>[t.char,e])),pr=new Map(Object.entries($e).map(([e,t])=>[t.char,e])),mr=/^[a-z0-9-]+$/,br=/^([a-z]+): (.*)$/,yr=new Map(Object.entries(re).map(([e,t])=>[t.char,e])),gr=["block","ball","glider","fireball"],wr=["title","intro","hearts","relics","pages","facing","machines"];function kr(e,t){let n=e&&e.value!==""?e.value.split(" "):[],r=e??{line:1,col:1},l=new Set;for(let o of n){if(!mr.test(o))throw new te(r.line,r.col,`page id '${o}' must be lower-case letters, digits and hyphens`);if(l.has(o))throw new te(r.line,r.col,`page '${o}' named twice`);l.add(o)}if(n.length>31)throw new te(r.line,r.col,"a level holds at most 31 pages");if(n.length!==t)throw new te(r.line,r.col,`pages: ${n.length} named but the grid has ${t}`);return n}function jt(e,t,n,r,l){let o=t&&t.value!==""?t.value.split(" "):[],s=t??{line:1,col:1};for(let i of o)if(!r(i))throw new te(s.line,s.col,`${e}: '${i}' is not ${l}`);if(o.length!==n)throw new te(s.line,s.col,`${e}: ${o.length} named but the grid has ${n}`);return o}function xr(e){let t={},n=e.indexOf("trap"),r=e.indexOf("clone"),l=-1,o=-1;for(let s=e.length-1;s>=0;s--){let i=e[s];if(i==="button-brown"){let a=l>=0?l:n;a>=0&&(t[s]=a)}else if(i==="button-red"){let a=o>=0?o:r;a>=0&&(t[s]=a)}else i==="trap"?l=s:i==="clone"&&(o=s)}return t}function Q(e){let t=e.replace(/\r\n/g,`
`).split(`
`),n={},r=0;for(;r<t.length;r++){let P=br.exec(t[r]);if(!P)break;if(!wr.includes(P[1]))throw new te(r+1,1,`unknown header '${P[1]}'`);n[P[1]]={value:P[2],line:r+1,col:P[1].length+3}}for(;r<t.length&&t[r]==="";)r++;let l=r,o=[];for(;r<t.length&&t[r]!=="";r++)o.push(t[r]);if(o.length===0)throw new te(l+1,1,"no grid");for(;r<t.length;r++)if(t[r].trim()!=="")throw new te(r+1,1,"text after the grid");let s=o[0].length,i=[],a=[],u=null,h=null,p=0,c=[],d=[],f=[];if(o.forEach((P,O)=>{let j=l+O+1;if(P.length!==s)throw new te(j,1,`row is ${P.length} wide, expected ${s}`);[...P].forEach((H,S)=>{let g=S+1;if(H==="P"||H==="M"){if(H==="P"&&u)throw new te(j,g,"second player");if(H==="M"&&h)throw new te(j,g,"second Minotaur");H==="P"?u={r:O,c:S}:h={r:O,c:S},i.push("floor"),a.push(null);return}let D=yr.get(H);if(D){d.push({kind:D,at:{r:O,c:S}}),i.push("floor"),a.push(null);return}let W=fr.get(H),v=pr.get(H);if(!W&&!v)throw new te(j,g,`unknown tile '${H}'`);i.push(W??"floor"),a.push(v??null),v==="relic"&&p++,W==="clone"&&f.push({r:O,c:S}),v==="page"&&c.push(O*s+S)})}),!u)throw new te(l+1,1,"no player");let m=(P,O,j,H)=>{let S=n[P];if(!S)return O;let g=Number(S.value);if(!Number.isInteger(g)||g<j)throw new te(S.line,S.col,`${P} must be ${j} to ${H}`);if(g>H){let D=P==="relics"?`relics: ${S.value} but the grid has ${H}`:`${P} must be ${j} to ${H}`;throw new te(S.line,S.col,D)}return g},b=m("hearts",3,1,99),w=m("relics",p,0,p),x=kr(n.pages,c.length),A=jt("facing",n.facing,d.length,P=>Y.includes(P),"a direction"),k=d.map((P,O)=>({...P,dir:A[O],home:O})),B=jt("machines",n.machines,f.length,P=>{let[O,j]=P.split("-");return gr.includes(O)&&Y.includes(j)&&P.split("-").length===2},"a template and a direction like block-up"),L=k.length,G=f.map((P,O)=>{let[j,H]=B[O].split("-"),S={at:P,template:j,dir:H};return j==="block"?S:{...S,home:L++}});return{title:n.title?.value??"",intro:n.intro?.value??"",hearts:b,relics:w,pageIds:x,pageCells:c,rows:o.length,cols:s,terrain:i,objects:a,player:u,minotaur:h,hazards:k,machines:G,links:xr(i)}}function ze(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let t=e.objects.filter(o=>o==="relic").length,n=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&n.push(`hearts: ${e.hearts}`),e.relics!==t&&n.push(`relics: ${e.relics}`),e.pageIds.length>0&&n.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&n.push(`facing: ${e.hazards.map(o=>o.dir).join(" ")}`),e.machines.length>0&&n.push(`machines: ${e.machines.map(o=>`${o.template}-${o.dir}`).join(" ")}`);let r=new Map(e.hazards.map(o=>[o.at.r*e.cols+o.at.c,o.kind])),l=[];for(let o=0;o<e.rows;o++){let s="";for(let i=0;i<e.cols;i++){let a=o*e.cols+i;e.player.r===o&&e.player.c===i?s+="P":e.minotaur&&e.minotaur.r===o&&e.minotaur.c===i?s+="M":r.has(a)?s+=re[r.get(a)].char:s+=e.objects[a]?$e[e.objects[a]].char:$[e.terrain[a]].char}l.push(s)}return`${n.join(`
`)}

${l.join(`
`)}
`}function Wt(e){let t=0;for(let n of e.objects)n==="cake"&&t++;return e.hearts+t}function se(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var le=(e,t)=>t.r>=0&&t.c>=0&&t.r<e.rows&&t.c<e.cols,F=(e,t)=>t.r*e.level.cols+t.c;var Z=(e,t)=>!!t&&e.r===t.r&&e.c===t.c,be=66,Tr=Array.from({length:be*be},(e,t)=>({r:Math.floor(t/be)-1,c:t%be-1})),Mr=(e,t)=>e>=-1&&t>=-1&&e<be-1&&t<be-1?Tr[(e+1)*be+t+1]:{r:e,c:t},ee=(e,t)=>Mr(e.r+q[t][0],e.c+q[t][1]),it=e=>e.relicsLeft===0;var Ht=e=>{let t=at(e);return t.terrain=[...e.terrain],t.objects=[...e.objects],t.ownTerrain=t.ownObjects=!0,ye(t),t},at=e=>({level:e.level,terrain:e.terrain,objects:e.objects,ownTerrain:!1,ownObjects:!1,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,ownHeld:!1,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:e.hazards.length>0?[...e.hazards]:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome});function ye(e){e.ownHeld||(e.keys={...e.keys},e.tools={...e.tools},e.gear=[...e.gear],e.ownHeld=!0)}function ae(e,t,n){e.ownTerrain||(e.terrain=e.terrain.slice(),e.ownTerrain=!0),e.terrain[t]=n}function ge(e,t,n){e.ownObjects||(e.objects=e.objects.slice(),e.ownObjects=!0),e.objects[t]=n}var V=(e,t)=>le(e.level,t)?e.terrain[F(e,t)]:"wall",ue=(e,t)=>le(e.level,t)?e.objects[F(e,t)]:null;function he(e,t){let n=e.hazards;for(let r=0;r<n.length;r++){let l=n[r].at;if(l.r===t.r&&l.c===t.c)return!0}return!1}function je(e,t){e.terrain=e.terrain.map(n=>n==="toggle-open"?"toggle-closed":n==="toggle-closed"?"toggle-open":n),e.ownTerrain=!0,t.push({kind:"flipped"})}var Gt=new WeakMap;function Kt(e){let t=Gt.get(e);return t||(t=e.terrain.flatMap((n,r)=>n==="teleport"?[r]:[]),Gt.set(e,t)),t}var Ut=e=>Kt(e).length>1;function ut(e,t,n,r){let{cols:l}=e.level,o=Kt(e.level),s=t.r*l+t.c,i=o.findIndex(a=>a>s);for(let a=0;a<o.length;a++){let u=o[((i<0?0:i)+a)%o.length];if(u===s)continue;let h={r:Math.floor(u/l),c:u%l},p=ee(h,n);if(V(e,p)!=="teleport"&&r(p))return{via:h,to:p}}return null}var _t=new WeakMap;function Er(e){let t=_t.get(e);if(!t){let n=new Map;for(let[r,l]of Object.entries(e.links)){if(e.terrain[l]!=="trap")continue;let o=n.get(l);o?o.push(Number(r)):n.set(l,[Number(r)])}t=n,_t.set(e,t)}return t}function Ar(e,t){let n=Er(e.level).get(t);if(!n)return!1;let{cols:r}=e.level;return n.some(l=>{let o={r:Math.floor(l/r),c:l%r};return Z(o,e.player)||ue(e,o)==="block"||he(e,o)})}var oe=(e,t)=>V(e,t)==="trap"&&!Ar(e,t.r*e.level.cols+t.c);function Nt(e,t,n){if(!le(e.level,n))return!1;let r=V(e,n);return $[r].hazard||re[t].crosses===r}var We=(e,t,n)=>Nt(e,t,n)&&!ue(e,n)&&!Z(n,e.minotaur)&&!Z(n,e.cow)&&!he(e,n),He=(e,t,n)=>Z(n,e.player)?Nt(e,t,n):We(e,t,n);function ct(e,t,n,r,l=!1){let o=e.hazards[t],s=V(e,o.at);return s==="bomb"?(ae(e,F(e,o.at),"floor"),e.hazards.splice(t,1),n.push({kind:"exploded",who:"hazard",at:o.at}),"gone"):(s==="button"?je(e,n):s==="button-red"&&Ge(e,F(e,o.at),n,r,l),oe(e,o.at)&&n.push({kind:"held",who:"hazard",at:o.at}),"on")}function Ge(e,t,n,r,l=!1){let o=e.level.links[t];if(o===void 0)return;let s=e.level.machines.find(h=>F(e,h.at)===o),i=ee(s.at,s.dir);if(r&&Z(i,r))return;if(s.template==="block"){if(!_e(e,i))return;ge(e,F(e,i),"block"),n.push({kind:"cloned",what:"block",at:i}),dt(e,i,s.dir,r,n,l);return}if(!We(e,s.template,i)||Z(i,e.player))return;let a={kind:s.template,at:i,dir:s.dir,home:s.home};e.hazards.length===0&&(e.hazards=[]);let u=e.hazards.length;if(!l){let h=F(e,i);for(;u>0&&F(e,e.hazards[u-1].at)>h;)u--}e.hazards.splice(u,0,a),n.push({kind:"cloned",what:s.template,at:i}),ct(e,u,n,r,l)}function vr(e,t){let n=e.hazards[t];if(n)return n.at;let r=e.machines.find(l=>l.home===t);return ee(r.at,r.dir)}function ht(e,t,n){V(e,t)==="popup"&&(ae(e,F(e,t),"wall"),n.push({kind:"rose",at:t}))}var Sr=(e,t,n)=>We(e,t,n)&&V(e,n)!=="bomb"&&!Z(n,e.player);function Pr(e,t,n){let r=vr(e.level,n),l=new Set([F(e,r)]),o=[r];for(;o.length>0;){let s=o.filter(a=>Sr(e,t,a)).sort((a,u)=>F(e,a)-F(e,u));if(s.length>0)return s[0];let i=[];for(let a of o)for(let u of Y){let h=ee(a,u);!le(e.level,h)||l.has(F(e,h))||(l.add(F(e,h)),i.push(h))}o=i}return null}function qt(e,t,n){let r=e.hazards.findIndex(s=>Z(t,s.at));if(r<0)return;let l=e.hazards[r];e.hazards.splice(r,1);let o=Pr(e,l.kind,l.home);o&&(e.hazards.push({...l,at:o}),e.hazards.sort((s,i)=>F(e,s.at)-F(e,i.at))),n.push({kind:"sent-home",from:t,to:o})}function we(e,t,n,r){if(e.hearts--,t.push(r?{kind:"caught",at:e.player,hearts:e.hearts,by:n,hazard:r}:{kind:"caught",at:e.player,hearts:e.hearts,by:n}),e.hearts<=0){e.outcome="lost",t.push({kind:"lost"});return}ht(e,e.player,t),e.player=e.throwBack;let l=null;Z(e.player,e.minotaur)&&(l=e.level.minotaur,e.minotaur=l,Z(l,e.cow)&&(e.cow=null)),qt(e,e.player,t),l&&qt(e,l,t)}function Ke(e,t){if(e.outcome!=="playing")return!0;for(let n=0;n<t.length;n++)if(t[n].kind==="caught")return!0;return!1}function ft(e,t){return le(e.level,t)&&$[V(e,t)].minotaur&&ue(e,t)!=="block"&&!he(e,t)}function Yt(e,t,n){return e.minotaur=t,oe(e,t)&&n.push({kind:"held",who:"minotaur",at:t}),Z(t,e.cow)&&(e.cow=null),Z(t,e.player)?(we(e,n,"minotaur"),!0):!1}function Lr(e,t){let n=e.minotaur;if(!n)return!0;if(oe(e,n))return!1;let r=e.cow??e.player,l=null,o=null;if(r.c!==n.c){let a=r.c>n.c?"right":"left",u=ee(n,a);ft(e,u)&&(l=a,o=u)}if(!o&&r.r!==n.r){let a=r.r>n.r?"down":"up",u=ee(n,a);ft(e,u)&&(l=a,o=u)}if(!l||!o)return!1;if(t.push({kind:"moved",who:"minotaur",from:n,to:o}),Yt(e,o,t))return!0;let s=l,i=null;for(;;){let a=$[V(e,e.minotaur)];if(a.carries)s=a.carries;else if(!a.slides)return!1;i??=new Set([F(e,o)]);let u=ee(e.minotaur,s);if(!ft(e,u)||i.has(F(e,u)))return!1;if(t.push({kind:"slid",who:"minotaur",from:e.minotaur,to:u}),i.add(F(e,u)),Yt(e,u,t))return!0}}function Zt(e,t){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let n=0;n<2&&e.outcome==="playing";n++)if(Lr(e,t))return}}var Rr={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function zr(e,t,n){return Z(e.hazards[t].at,e.player)?(Z(e.player,e.cow)&&(e.cow=null),we(e,n,"hazard",e.hazards[t].kind),"caught"):ct(e,t,n,void 0,!0)}function Or(e,t,n){let r=e.hazards[t];if(oe(e,r.at))return"on";let l=r.dir;if(!He(e,r.kind,ee(r.at,l))){l=void 0;for(let i of re[r.kind].turns){let a=Rr[i][r.dir];if(He(e,r.kind,ee(r.at,a))){l=a;break}}}if(!l)return"on";let o=ee(r.at,l);n.push({kind:"moved",who:"hazard",hazard:r.kind,from:r.at,to:o});let s=null;for(;;){r=e.hazards[t]={kind:r.kind,at:o,dir:l,home:r.home};let i=zr(e,t,n);if(i!=="on")return i;let a=$[V(e,o)];if(a.carries)l=a.carries,r.dir!==l&&(r=e.hazards[t]={kind:r.kind,at:r.at,dir:l,home:r.home});else if(!a.slides)return"on";s??=new Set([F(e,o)]);let u=ee(o,l);if(s.has(F(e,u))||!He(e,r.kind,u))return"on";n.push({kind:"slid",who:"hazard",hazard:r.kind,from:o,to:u}),s.add(F(e,u)),o=u}}function Xt(e,t){if(e.hazards.length!==0){for(let n=0,r=e.hazards.length;n<r;){let l=Or(e,n,t);if(l==="caught")break;l==="gone"?r--:n++}e.hazards.sort((n,r)=>F(e,n.at)-F(e,r.at))}}function _e(e,t){return le(e.level,t)&&$[V(e,t)].block&&!ue(e,t)&&!Z(t,e.player)&&!Z(t,e.minotaur)&&!Z(t,e.cow)&&!Z(t,e.throwBack)&&!Z(t,e.level.minotaur)&&!he(e,t)}function mt(e,t,n,r){let l=ee(t,n);if(V(e,l)!=="teleport")return _e(e,l)&&r(l)?{entry:l,to:l}:null;if(Z(l,e.player))return null;let o=ut(e,l,n,s=>_e(e,s)&&r(s));return o&&{entry:l,via:o.via,to:o.to}}function Vt(e,t,n,r,l){ge(e,F(e,t),null),ge(e,F(e,n.to),"block"),l.push(r==="pushed"?{kind:"pushed",from:t,to:n.entry}:{kind:"slid",who:"block",from:t,to:n.entry}),n.via&&l.push({kind:"teleported",who:"block",from:n.entry,via:n.via,to:n.to})}function dt(e,t,n,r,l,o=!1){let s=t,i=n,a=new Set([F(e,s)]);for(r&&a.add(F(e,r));;){let u=V(e,s);if(u==="water"||u==="bomb"){ge(e,F(e,s),null),ae(e,F(e,s),u==="water"?"dirt":"floor"),l.push(u==="water"?{kind:"sank",at:s}:{kind:"exploded",who:"block",at:s});return}u==="button"?je(e,l):u==="button-red"&&Ge(e,F(e,s),l,r,o),oe(e,s)&&l.push({kind:"held",who:"block",at:s});let h=$[u];if(h.carries)i=h.carries;else if(!h.slides)return;let p=mt(e,s,i,c=>!a.has(F(e,c)));if(!p)return;Vt(e,s,p,"slid",l),a.add(F(e,p.to)),s=p.to}}var Fr=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Qt(e,t,n,r){if(!le(e.level,t)||Z(t,e.minotaur))return!1;let l=V(e,t),o=$[l];return Fr.has(l)||l==="teleport"&&!Ut(e.level)||l==="gate"&&!it(e)||o.needs&&!e.gear.includes(o.needs)||o.door&&e.keys[o.door]<=0?!1:he(e,t)||ue(e,t)!=="block"?!0:!r&&!oe(e,t)&&!!mt(e,t,n,()=>!0)}function bt(e,t,n,r,l){if(!Qt(e,t,n,r))return!1;if(he(e,t))return we(e,l,"hazard",e.hazards.find(s=>Z(s.at,t)).kind),!1;let o=$[V(e,t)];if(o.door&&(o.door!=="green"&&(ye(e),e.keys[o.door]--),ae(e,F(e,t),"floor"),l.push({kind:"opened",color:o.door,at:t})),ue(e,t)==="block"){let s=mt(e,t,n,()=>!0);Vt(e,t,s,"pushed",l),dt(e,s.to,n,t,l)}return!0}function yt(e,t,n,r,l){ht(e,e.player,l),e.player=t;let o=V(e,t);if(o==="bomb")return ae(e,F(e,t),"floor"),l.push({kind:"exploded",who:"player",at:t}),we(e,l,"bomb"),!0;let s=ue(e,t);if(s&&s!=="block"&&(ge(e,F(e,t),null),l.push({kind:"took",what:s,at:t}),s==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):s==="page"?e.pages|=1<<e.level.pageCells.indexOf(F(e,t)):s.startsWith("key-")?(ye(e),e.keys[s.slice(4)]++):s==="mirror"||s==="cake"||s==="cow"?(ye(e),e.tools[s]++):e.gear.includes(s)||(ye(e),e.gear.push(s))),o==="thief"&&e.gear.length>0&&(l.push({kind:"robbed",at:t,gear:e.gear}),e.gear=[]),o==="safe"&&(e.throwBack=t),oe(e,t)&&l.push({kind:"held",who:"player",at:t}),o==="button"?je(e,l):o==="button-red"&&Ge(e,F(e,t),l),o==="exit"&&it(e)&&(e.outcome="won",l.push({kind:"won"})),o==="teleport"){let i=ut(e,t,n,a=>Qt(e,a,n,r));return i?bt(e,i.to,n,r,l)?(l.push({kind:"teleported",who:"player",from:t,via:i.via,to:i.to}),yt(e,i.to,n,r,l)):!0:!1}return!1}function Cr(e,t,n){let r=t,l=e.player,o=null;for(;e.outcome==="playing";){let s=$[V(e,e.player)];if(s.carries&&!e.gear.includes("suction"))r=s.carries;else if(!s.slides||e.gear.includes(s.slides))return;o??=new Set([F(e,l)]);let i=ee(e.player,r);if(o.has(F(e,i))||!bt(e,i,r,!0,n)||(n.push({kind:"slid",who:"player",from:e.player,to:i}),o.add(F(e,i)),yt(e,i,r,!0,n)))return;o.add(F(e,e.player))}}function pt(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function Dr(e,t,n){if(t.kind==="move"){let r=e.player;if(oe(e,r))return!1;let l=ee(r,t.dir),o=V(e,l);if(o==="invisible-wall")return ae(e,F(e,l),"wall"),n.push({kind:"revealed",at:l,what:o}),"shown";if(o==="fake-wall"&&(ae(e,F(e,l),"floor"),n.push({kind:"revealed",at:l,what:o})),bt(e,l,t.dir,!1,n))n.push({kind:"moved",who:"player",from:r,to:l}),yt(e,l,t.dir,!1,n)||Cr(e,t.dir,n);else if(!Ke(e,n))return!1}else if(t.kind==="tool"){if(e.tools[t.tool]<=0)return!1;if(t.tool==="cake")e.hearts++;else if(t.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,n.push({kind:"stoned",turns:3});ye(e),e.tools[t.tool]--}return!0}function Jt(e,t){return{level:e.level,terrain:!e.ownTerrain||pt(e.terrain,t.terrain)?t.terrain:e.terrain,objects:!e.ownObjects||pt(e.objects,t.objects)?t.objects:e.objects,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:pt(e.hazards,t.hazards)?t.hazards:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome}}function Ue(e,t){return t===e||t.moves===e.moves}function ie(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let n=at(e),r=[],l=Dr(n,t,r);if(!l)return{state:e,events:[]};if(l==="shown")return{state:Jt(n,e),events:r};let o=t.kind==="tool"&&t.tool==="mirror";return Ke(n,r)||Xt(n,r),!o&&!Ke(n,r)&&Zt(n,r),n.moves++,{state:Jt(n,e),events:r}}var Br=["mirror","cake","cow"],fe=e=>e<=0?0:32-Math.clz32(e),en=new WeakMap;function ce(e){let t=en.get(e);return t||en.set(e,t=Wr(e)),t}function Ir(e){let t=new Set,n=[],r=a=>{let u=e.terrain[a];return $[u].block||$[u].door!==void 0||u==="fake-wall"},l=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,o=(a,u)=>a>=0&&u>=0&&a<e.rows&&u<e.cols,s=a=>{t.has(a)||a===l||!r(a)||(t.add(a),n.push(a))};e.objects.forEach((a,u)=>{a==="block"&&(t.add(u),n.push(u))});for(let a of e.machines){let u=a.at.r+q[a.dir][0],h=a.at.c+q[a.dir][1];a.template==="block"&&o(u,h)&&s(u*e.cols+h)}let i=[];for(e.terrain.forEach((a,u)=>{a==="teleport"&&i.push(u)});n.length;){let a=n.pop(),u=Math.floor(a/e.cols),h=a%e.cols,p=$[e.terrain[a]],c=p.slides!==void 0||p.carries!==void 0;for(let d of Y){let[f,m]=q[d],b=u+f,w=h+m;if(!o(b,w))continue;let x=u-f,A=h-m;if(!(o(x,A)&&e.terrain[x*e.cols+A]!=="wall")&&!c)continue;let B=b*e.cols+w;if(e.terrain[B]!=="teleport"){s(B);continue}for(let L of i){let G=Math.floor(L/e.cols)+f,P=L%e.cols+m;o(G,P)&&s(G*e.cols+P)}}}return t}var $r={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},gt=e=>$r[e]??($[e].door!==void 0?"floor":void 0);function jr(e,t){let n=new Set(t.map(l=>re[l].crosses)),r=[];return e.terrain.forEach((l,o)=>{let s=gt(l);($[l].hazard||n.has(l)||l==="toggle-closed"||s&&$[s].hazard)&&r.push(o)}),r}function Wr(e){let t=v=>e.objects.filter(M=>M===v).length,n=Ir(e),r=[],l=[],o=[],s=[],i=[];e.terrain.forEach((v,M)=>{gt(v)?r.push(M):(v==="toggle-open"||v==="toggle-closed")&&l.push(M);let I=e.objects[M];n.has(M)?(I&&I!=="block"?i:s).push(M):I&&o.push(M)});let a=e.rows*e.cols,u=Me.map(v=>fe(t(`key-${v}`))),h=Br.map(v=>fe(t(v))),p=$t.filter(v=>t(v)>0),c=fe(a),d=t("cow")>0,f=e.minotaur!==null,m=t("mirror")>0?2:0,b=c*(2+(f?1:0)+(d?1:0))+m,w=fe(Wt(e)),x=b+w+fe(e.relics),A=[],k=x+e.pageIds.length;for(let v of u)A.push(k),k+=v;let B=[];for(let v of h)B.push(k),k+=v;let L=[...e.hazards.map(v=>v.kind)];for(let v of e.machines)v.home!==void 0&&(L[v.home]=v.template);let G=L.length>e.hazards.length,P=G?0:e.hazards.length,O=G?jr(e,L):[],j=G?fe(4*L.length):0,H=c*(2+(f?1:0)+(d?1:0))+m+w+fe(e.relics)+e.pageIds.length+u.reduce((v,M)=>v+M,0)+h.reduce((v,M)=>v+M,0)+p.length+r.length+(l.length?1:0)+o.length+s.length+2*i.length+P*(c+2)+O.length*j,S=k+p.length,g=S+r.length+(l.length?1:0),D=g+o.length+s.length+2*i.length,W=[];for(let v=0;v<a;v++)W.push({r:Math.floor(v/e.cols),c:v%e.cols});return{terrainAt:S,objectsAt:g,hazardsAt:D,cells:W,terrains:new Map,objectLists:new Map,words:Math.max(1,Math.ceil(H/32)),cellBits:c,none:a,minotaur:f,cow:d,stoneBits:m,heartBits:w,relicBits:fe(e.relics),pageBits:e.pageIds.length,keyBits:u,toolBits:h,gear:p,heartAt:b,pageAt:x,keyAt:A,toolAt:B,gearAt:k,changing:Int32Array.from(r),toggles:Int32Array.from(l),fixed:Int32Array.from(o),blockOnly:Int32Array.from(s),blockOrObject:Int32Array.from(i),hazardSlots:P,hazardCells:Int32Array.from(O),hazardBits:j,homeKinds:L}}function X(e,t,n,r,l){if(r===0)return n;let o=t+(n>>>5),s=n&31;return e[o]|=l<<s,s+r>32&&(e[o+1]|=l>>>32-s),n+r}function N(e,t,n,r){if(r===0)return 0;let l=t+(n>>>5),o=n&31,s=e[l]>>>o;return o+r>32&&(s|=e[l+1]<<32-o),r===32?s>>>0:s&(1<<r)-1}var pe=(e,t,n)=>t?t.r*e.level.cols+t.c:n,tn={up:0,down:1,left:2,right:3};function nn(e,t,n,r,l,o){for(let s=l,i=l+o;s<i;s+=30){let a=Math.min(30,i-s);X(n,r,s,a,N(e,t,s,a))}}function Ee(e,t,n,r,l,o,s=0){let i=t;for(let b=0;b<i.words;b++)n[r+b]=0;let a=0;a=X(n,r,a,i.cellBits,pe(e,e.player,i.none)),a=X(n,r,a,i.cellBits,pe(e,e.throwBack,i.none)),i.minotaur&&(a=X(n,r,a,i.cellBits,pe(e,e.minotaur,i.none))),i.cow&&(a=X(n,r,a,i.cellBits,pe(e,e.cow,i.none))),a=X(n,r,a,i.stoneBits,e.stone),a=X(n,r,a,i.heartBits,e.hearts),a=X(n,r,a,i.relicBits,e.relicsLeft),a=X(n,r,a,i.pageBits,e.pages);let u=e.keys,h=e.tools;a=X(n,r,a,i.keyBits[0],u.red),a=X(n,r,a,i.keyBits[1],u.blue),a=X(n,r,a,i.keyBits[2],u.yellow),a=X(n,r,a,i.keyBits[3],u.green),a=X(n,r,a,i.toolBits[0],h.mirror),a=X(n,r,a,i.toolBits[1],h.cake),a=X(n,r,a,i.toolBits[2],h.cow);for(let b=0;b<i.gear.length;b++)a=X(n,r,a,1,e.gear.includes(i.gear[b])?1:0);let p=e.terrain,c=e.objects,d=e.level.terrain;if(l&&o&&p===l.terrain)nn(o,s,n,r,i.terrainAt,i.objectsAt-i.terrainAt);else{for(let b=0;b<i.changing.length;b++){let w=i.changing[b];X(n,r,i.terrainAt+b,1,p[w]===d[w]?0:1)}i.toggles.length&&X(n,r,i.objectsAt-1,1,p[i.toggles[0]]===d[i.toggles[0]]?0:1)}if(l&&o&&c===l.objects)nn(o,s,n,r,i.objectsAt,i.hazardsAt-i.objectsAt);else{a=i.objectsAt;for(let b=0;b<i.fixed.length;b++)a=X(n,r,a,1,c[i.fixed[b]]?1:0);for(let b=0;b<i.blockOnly.length;b++)a=X(n,r,a,1,c[i.blockOnly[b]]==="block"?1:0);for(let b=0;b<i.blockOrObject.length;b++){let w=c[i.blockOrObject[b]];a=X(n,r,a,2,w==="block"?2:w?1:0)}}a=i.hazardsAt;let f=e.hazards;if(i.hazardSlots>1){for(let b=1;b<f.length;b++)if(pe(e,f[b].at,i.none)<pe(e,f[b-1].at,i.none))throw new Error("the hazards must be sorted by cell")}for(let b=0;b<i.hazardSlots;b++){let w;for(let x=0;x<f.length;x++)if(f[x].home===b){w=f[x];break}a=X(n,r,a,i.cellBits,w?pe(e,w.at,i.none):i.none),a=X(n,r,a,2,w?tn[w.dir]:0)}let m=0;for(let b=0;b<i.hazardCells.length;b++){let w=i.hazardCells[b],x=f[m],A=x!==void 0&&pe(e,x.at,i.none)===w;a=X(n,r,a,i.hazardBits,A?1+tn[x.dir]+4*x.home:0),A&&m++}if(i.hazardCells.length&&m!==f.length)throw new Error(`packed ${m} of ${f.length} hazards: they must be sorted by cell`)}var rn=4096;function on(e,t,n,r){if(r<=30)return N(e,t,n,r);let l="";for(let o=n,s=n+r;o<s;o+=30)l+=N(e,t,o,Math.min(30,s-o))+",";return l}function Hr(e,t,n,r){let l=n.objectsAt-n.terrainAt;if(l===0)return r.terrain;let o=on(e,t,n.terrainAt,l),s=n.terrains.get(o);if(s)return s;let i=[...r.terrain];for(let a=0;a<n.changing.length;a++){if(!N(e,t,n.terrainAt+a,1))continue;let u=n.changing[a];i[u]=gt(r.terrain[u])}if(n.toggles.length&&N(e,t,n.objectsAt-1,1))for(let a of n.toggles)i[a]=r.terrain[a]==="toggle-open"?"toggle-closed":"toggle-open";return n.terrains.size>=rn&&n.terrains.clear(),n.terrains.set(o,i),i}function Gr(e,t,n,r){let l=n.hazardsAt-n.objectsAt;if(l===0)return r.objects;let o=on(e,t,n.objectsAt,l),s=n.objectLists.get(o);if(s)return s;let i=[...r.objects],a=n.objectsAt;for(let u of n.fixed)N(e,t,a++,1)||(i[u]=null);for(let u of n.blockOnly)i[u]=N(e,t,a++,1)?"block":null;for(let u of n.blockOrObject){let h=N(e,t,a,2);a+=2,h===0?i[u]=null:h===2&&(i[u]="block")}return n.objectLists.size>=rn&&n.objectLists.clear(),n.objectLists.set(o,i),i}function Ne(e,t,n,r,l=0){let o=n,s=o.cells,i=o.none,a=o.cellBits,u=0,h=s[N(e,t,u,a)];u+=a;let p=s[N(e,t,u,a)];u+=a;let c=null,d=null;if(o.minotaur){let M=N(e,t,u,a);u+=a,c=M===i?null:s[M]}if(o.cow){let M=N(e,t,u,a);u+=a,d=M===i?null:s[M]}let f=N(e,t,u,o.stoneBits);u+=o.stoneBits;let m=N(e,t,u,o.heartBits);u+=o.heartBits;let b=N(e,t,u,o.relicBits);u+=o.relicBits;let w=N(e,t,u,o.pageBits);u+=o.pageBits;let x=o.keyBits,A=o.toolBits,k=N(e,t,u,x[0]);u+=x[0];let B=N(e,t,u,x[1]);u+=x[1];let L=N(e,t,u,x[2]);u+=x[2];let G=N(e,t,u,x[3]);u+=x[3];let P={red:k,blue:B,yellow:L,green:G},O=N(e,t,u,A[0]);u+=A[0];let j=N(e,t,u,A[1]);u+=A[1];let H=N(e,t,u,A[2]);u+=A[2];let S={mirror:O,cake:j,cow:H},g=[];for(let M=0;M<o.gear.length;M++)N(e,t,u++,1)&&g.push(o.gear[M]);let D=Hr(e,t,o,r),W=Gr(e,t,o,r);u=o.hazardsAt;let v=[];for(let M=0;M<o.hazardSlots;M++){let I=N(e,t,u,a);u+=a;let y=Y[N(e,t,u,2)];u+=2,I!==i&&v.push({kind:o.homeKinds[M],at:s[I],dir:y,home:M})}v.length>1&&v.sort((M,I)=>M.at.r*r.cols+M.at.c-(I.at.r*r.cols+I.at.c));for(let M=0;M<o.hazardCells.length;M++){let I=N(e,t,u,o.hazardBits);if(u+=o.hazardBits,!I)continue;let y=I-1>>>2;v.push({kind:o.homeKinds[y],at:s[o.hazardCells[M]],dir:Y[I-1&3],home:y})}return{level:r,terrain:D,objects:W,player:h,hearts:m,keys:P,gear:g,tools:S,pages:w,throwBack:p,minotaur:c,stone:f,cow:d,hazards:v,relicsLeft:b,moves:l,outcome:"playing"}}var an=new Set(["wall","invisible-wall","clone"]);function _r(e,t,n,r){let l=(u,h)=>u>=0&&h>=0&&u<e.rows&&h<e.cols&&!an.has(e.terrain[u*e.cols+h]),o=new Set,s=new Set,i=[],a=(u,h,p)=>{if(!l(u,h))return;let c=(u*e.cols+h)*4+Y.indexOf(p);s.has(c)||(s.add(c),o.add(u*e.cols+h),i.push([u,h,p]))};for(a(Math.floor(t/e.cols)+q[n][0],t%e.cols+q[n][1],n);i.length;){let[u,h,p]=i.pop(),c=e.terrain[u*e.cols+h];if(c==="teleport"){for(let m of r){if(m===u*e.cols+h)continue;let b=Math.floor(m/e.cols)+q[p][0],w=m%e.cols+q[p][1];l(b,w)&&e.terrain[b*e.cols+w]!=="teleport"&&a(b,w,p)}continue}let d=$[c],f=d.carries??(d.slides?p:null);f&&a(u+q[f][0],h+q[f][1],f)}return[...o]}function Kr(e){let t=e.rows*e.cols,n=e.terrain.map(s=>!an.has(s)),r=e.terrain.flatMap((s,i)=>s==="teleport"?[i]:[]),l=Array.from({length:t},()=>[]);for(let s=0;s<t;s++)if(n[s])for(let i of Y)for(let a of _r(e,s,i,r.length>1?r:[]))l[a].push(s);let o=new Uint8Array(t);return e.terrain.forEach((s,i)=>{s==="safe"&&(o[i]=1)}),o[e.player.r*e.cols+e.player.c]=1,{n:t,open:n,into:l,thrown:o}}function sn(e,t){let n=new Float64Array(e.n).fill(1/0),r=new Int32Array(e.n),l=0;for(let s of t)n[s]===1/0&&(n[s]=0,r[l++]=s);let o=!1;for(let s=0;s<l;s++){let i=r[s],a=n[i]+1;for(let u of e.into[i])n[u]===1/0&&(n[u]=a,r[l++]=u);if(!o&&e.thrown[i]){o=!0;for(let u=0;u<e.n;u++)e.open[u]&&n[u]===1/0&&(n[u]=a,r[l++]=u)}}return n}function Ur(e){let t=Kr(e),n=e.terrain.flatMap((s,i)=>s==="exit"?[i]:[]),r=sn(t,n),l=e.objects.flatMap((s,i)=>s==="relic"?[i]:[]),o=l.map(s=>sn(t,[s]));return s=>{if(s.outcome==="won")return 0;if(s.outcome==="lost")return 1/0;let i=s.player.r*e.cols+s.player.c,a=r[i];if(s.relicsLeft===0)return a;let u=0,h=1/0,p=0;for(let c=0;c<l.length;c++){if(s.objects[l[c]]!=="relic")continue;let d=o[c][i];u++,d<h&&(h=d),d>p&&(p=d)}return u<s.relicsLeft?1/0:Math.max(a,u===s.relicsLeft?p:h)}}var ln=new WeakMap;function qe(e){let t=ln.get(e);return t||ln.set(e,t=Ur(e)),t}var Ae=class extends Error{},un=1024;function wt(e,t,n){let r=2538058380;for(let l=0;l<n;l++){let o=Math.imul(e[t+l],3432918353);o=Math.imul(o<<15|o>>>17,461845907),r^=o,r=Math.imul(r<<13|r>>>19,5)+3864292196}return r^=n,r=Math.imul(r^r>>>16,2246822507),r=Math.imul(r^r>>>13,3266489909),(r^r>>>16)>>>0}function Ye(e){let t=e,n=un,r=new Uint32Array(n*t),l=new Uint32Array(n),o=new Int32Array(n),s=new Uint8Array(n),i=new Uint32Array(n),a=0,u=new Int32Array(un*2),h=u.length-1;function p(){n*=2;let d=new Uint32Array(n*t);d.set(r),r=d;let f=new Uint32Array(n);f.set(l),l=f;let m=new Int32Array(n);m.set(o),o=m;let b=new Uint8Array(n);b.set(s),s=b;let w=new Uint32Array(n);w.set(i),i=w,u=new Int32Array(n*2),h=u.length-1;for(let x=0;x<a;x++){let A=l[x]&h;for(;u[A]!==0;)A=A+1&h;u[A]=x+1}}function c(d,f,m){let b=d*t;for(let w=0;w<t;w++)if(r[b+w]!==f[m+w])return!1;return!0}return{get size(){return a},add(d,f,m,b,w){let x=wt(d,f,t),A=x&h;for(let B=u[A];B!==0;A=A+1&h,B=u[A]){let L=B-1;if(!(l[L]!==x||!c(L,d,f)))return w>=i[L]?-1:(o[L]=m,s[L]=b,i[L]=w,L)}if(a===n)for(p(),A=x&h;u[A]!==0;)A=A+1&h;let k=a++;return r.set(d.subarray(f,f+t),k*t),l[k]=x,o[k]=m,s[k]=b,i[k]=w,u[A]=k+1,k},words(d,f,m){f.set(r.subarray(d*t,d*t+t),m)},parent:d=>o[d],action:d=>s[d],g:d=>i[d]}}var Oe=["mirror","cake","cow"],ke=Y.length,Ze=[...Y.map(e=>({kind:"move",dir:e})),{kind:"wait"},...Oe.map(e=>({kind:"tool",tool:e}))],kt=[ke,...Y.map((e,t)=>t),...Oe.map((e,t)=>ke+1+t)];function cn(e,t){let n=[];for(let r=t;e.parent(r)>=0;r=e.parent(r))n.push(Ze[e.action(r)]);return n.reverse()}function xt(e,t){return Mt(Tt(e,t),t.onProgress)}function*Tt(e,t){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let n=t.store??Ye(ce(e.level).words),r=o=>{if(o instanceof Ae)return{solved:!1,explored:n.size,capped:!0,reason:o.message};throw o},l;try{l=Nr(e,t,n)}catch(o){return r(o)}for(;;){let o;try{o=l()}catch(s){return r(s)}if("explored"in o)return o;yield o}}function Mt(e,t){for(;;){let n=e.next();if(n.done)return n.value;t?.(n.value)}}function Nr(e,t,n){let{cap:r,refuse:l}=t,o=t.prune??null,s=Math.max(1,t.progressEvery??65536),i=e.level,a=ce(i),u=qe(i),h=new Uint32Array(a.words),p=new Uint32Array(a.words),c=1024,d=new Int32Array(c),f=new Int32Array(c),m=new Int32Array(c),b=new Uint8Array(c),w=new Uint16Array(c),x=new Int32Array(c),A=0,k=S=>{if(S<c)return;for(;c<=S;)c*=2;let g=new Int32Array(c);g.set(d),d=g;let D=new Int32Array(c);D.set(f),f=D;let W=new Int32Array(c);W.set(m),m=W;let v=new Uint8Array(c);v.set(b),b=v;let M=new Uint16Array(c);M.set(w),w=M},B=(S,g)=>d[S]<d[g]||d[S]===d[g]&&(f[S]<f[g]||f[S]===f[g]&&(w[S]>w[g]||w[S]===w[g]&&S<g)),L=S=>{let g=x[S];for(;S>0;){let D=S-1>>1,W=x[D];if(!B(g,W))break;x[S]=W,m[W]=S,S=D}x[S]=g,m[g]=S},G=S=>{if(A===x.length){let g=new Int32Array(x.length*2);g.set(x),x=g}x[A]=S,L(A++)},P=()=>{let S=x[0];m[S]=-1;let g=x[--A];if(A>0){let D=0;for(;;){let W=2*D+1;if(W>=A)break;let v=W+1,M=v<A&&B(x[v],x[W])?v:W;if(!B(x[M],g))break;x[D]=x[M],m[x[D]]=D,D=M}x[D]=g,m[g]=D}return S},O=u(e);if(Ee(e,a,h,0),o&&o({...e,moves:0},h,0))return()=>({solved:!1,explored:0,capped:!1});let j=n.add(h,0,-1,0,0);if(n.size>=r)return()=>({solved:!1,explored:n.size,capped:!0});k(j),f[j]=Number.isFinite(O)?O:-1,d[j]=f[j],m[j]=-1,w[j]=e.hearts,f[j]>=0&&G(j);let H=0;return()=>{let S=null;for(;A>0;){if(S)return S;let g=P();if(b[g])return{solved:!0,line:cn(n,g),explored:n.size};let D=d[g],W=D-f[g];++H%s===0&&(S={expanded:H,stored:n.size,bestF:D,startH:O}),n.words(g,p,0);let v=Ne(p,0,a,i,W);for(let M of kt){if(M>ke&&v.tools[Oe[M-ke-1]]<=0)continue;let I=ie(v,Ze[M]),y=I.state;if(Ue(v,y)||y.outcome==="lost"||l&&l(I.events,v)||(Ee(y,a,h,0,v,p,0),o&&o(y,h,0)))continue;let E=n.size,T=n.add(h,0,g,M,W+1);if(T<0)continue;let R=y.outcome==="won";if(n.size>E){k(T);let C=R?0:u(y);f[T]=Number.isFinite(C)?C:-1,m[T]=-1,b[T]=R?1:0,w[T]=y.hearts}if(R&&W+1===D)return{solved:!0,line:cn(n,T),explored:n.size};if(n.size>=r)return{solved:!1,explored:n.size,capped:!0};f[T]<0||(d[T]=W+1+f[T],m[T]>=0?L(m[T]):G(T))}}return{solved:!1,explored:n.size,capped:!1}}}function qr(e,t){for(let n=0;n<e.terrain.length;n++){if(!t(e.terrain[n]))continue;let r=Math.floor(n/e.cols),l=n%e.cols;for(let o of Y){let s=r-q[o][0],i=l-q[o][1];if(s<0||i<0||s>=e.rows||i>=e.cols)continue;let a=$[e.terrain[s*e.cols+i]];if(a.slides||a.carries===o)return!0}}return!1}function Yr(e,t){let n=e.terrain.flatMap((r,l)=>r==="teleport"?[l]:[]);return n.length<2?!1:n.some(r=>Y.some(l=>{let o=Math.floor(r/e.cols)+q[l][0],s=r%e.cols+q[l][1];return o>=0&&s>=0&&o<e.rows&&s<e.cols&&t(e.terrain[o*e.cols+s])}))}var dn=(e,t)=>qr(e,t)||Yr(e,t);function Zr(e,t){let n=[];t.heartBits&&n.push({pos:t.heartAt,width:t.heartBits,set:!1}),t.pageBits&&n.push({pos:t.pageAt,width:t.pageBits,set:!0}),Me.forEach((l,o)=>{t.keyBits[o]&&!dn(e,s=>$[s].door===l)&&n.push({pos:t.keyAt[o],width:t.keyBits[o],set:!1})}),t.toolBits.forEach((l,o)=>{l&&n.push({pos:t.toolAt[o],width:l,set:!1})});let r=["flippers","fire-boots"];return t.gear.forEach((l,o)=>{r.includes(l)&&!dn(e,s=>$[s].needs===l)&&n.push({pos:t.gearAt+o,width:1,set:!1})}),n}var Et=1024;function Xe(e,t){let n=qe(e),r=Zr(e,t);if(!r.length)return M=>n(M)===1/0;let l=t.words,o=new Uint32Array(l);for(let M of r)for(let I=M.pos;I<M.pos+M.width;I++)o[I>>>5]|=1<<(I&31);let s=[],i=0;for(let M of r)s.push(i),i+=M.width;let a=i+31>>>5,u=r.length,h=Int32Array.from(r,M=>M.pos),p=Int32Array.from(r,M=>M.width),c=Uint8Array.from(r,M=>M.set?1:0),d=Int32Array.from(s),f=Uint32Array.from(o,M=>~M>>>0),m=Et,b=new Uint32Array(m*l),w=new Int32Array(m),x=new Uint32Array(m),A=0,k=new Int32Array(Et*2),B=k.length-1,L=Et,G=new Uint32Array(L*a),P=new Uint32Array(L),O=new Int32Array(L),j=0,H=-1,S=new Uint32Array(l),g=new Uint32Array(a);function D(){m*=2;let M=new Uint32Array(m*l);M.set(b),b=M;let I=new Int32Array(m);I.set(w),w=I;let y=new Uint32Array(m);y.set(x),x=y,k=new Int32Array(m*2),B=k.length-1;for(let E=0;E<A;E++){let T=x[E]&B;for(;k[T]!==0;)T=T+1&B;k[T]=E+1}}function W(M,I){let y=H;if(y>=0)H=O[y];else{if(j===L){L*=2;let E=new Uint32Array(L*a);E.set(G),G=E;let T=new Uint32Array(L);T.set(P),P=T;let R=new Int32Array(L);R.set(O),O=R}y=j++}return G.set(g,y*a),P[y]=M,O[y]=I,y}function v(M,I,y,E){for(let T=0;T<u;T++){let R=N(M,I,d[T],p[T]),C=N(y,E,d[T],p[T]);if(c[T]?(R&C)!==C:R<C)return!1}return!0}return(M,I,y)=>{if(n(M)===1/0)return!0;let E=M.moves;for(let z=0;z<l;z++)S[z]=I[y+z]&f[z];let T=wt(S,0,l);g.fill(0);for(let z=0;z<u;z++)X(g,0,d[z],p[z],N(I,y,h[z],p[z]));let R=T&B,C=-1;for(let z=k[R];z!==0;R=R+1&B,z=k[R]){let _=z-1;if(x[_]!==T)continue;let J=!0;for(let ne=0;ne<l&&J;ne++)J=b[_*l+ne]===S[ne];if(J){C=_;break}}if(C<0){if(A===m)for(D(),R=T&B;k[R]!==0;)R=R+1&B;return C=A++,b.set(S,C*l),x[C]=T,k[R]=C+1,w[C]=W(E,-1),!1}for(let z=w[C];z>=0;z=O[z])if(P[z]<=E&&v(G,z*a,g,0))return!0;let K=-1;for(let z=w[C];z>=0;){let _=O[z];E<=P[z]&&v(g,0,G,z*a)?(K<0?w[C]=_:O[K]=_,O[z]=H,H=z):K=z,z=_}return w[C]=W(E,w[C]),!1}}var me=2e6,ve=e=>e.some(t=>t.kind==="caught");function Fe(e,t=me){return xt(e,{cap:t,refuse:null,prune:Xe(e.level,ce(e.level))})}function hn(e,t,n=me){return xt(e,{cap:n,refuse:t,prune:Xe(e.level,ce(e.level))})}function Je(e,t,n=me,r={}){return Tt(e,{cap:n,refuse:t,prune:Xe(e.level,ce(e.level)),store:r.store,progressEvery:r.every})}var fn={up:"u",down:"d",left:"l",right:"r"},At={mirror:"z",cake:"x",cow:"c"};function Ve(e){return e.map(t=>t.kind==="move"?fn[t.dir]:t.kind==="wait"?"w":At[t.tool]).join("")}function vt(e){let t=[];for(let n of e){let r=Y.find(o=>fn[o]===n),l=Object.keys(At).find(o=>At[o]===n);if(r)t.push({kind:"move",dir:r});else if(n==="w")t.push({kind:"wait"});else if(l)t.push({kind:"tool",tool:l});else return null}return t}var St=e=>e.solved?e.line.length:e.capped?"unknown":"none";function mn(e,t=me){return Mt(Xr(e,t))}function*Xr(e,t=me,n={}){let r=se(e),l=x=>({store:n.store?.(ce(x).words),every:n.every}),o=yield*Je(r,null,t,l(e)),s=St(o),i=0;if(o.solved){let x=r;for(let A of o.line){let k=ie(x,A);x=k.state,ve(k.events,x)&&i++}}let a=St(yield*Je(r,ve,t,l(e))),u=yield*Jr(e,t,l(e)),h=u===null?"unknown":u?"chase":"solo",p=Pt(e),c=o.solved?Ve(o.line):"";if(!e.minotaur)return{solved:o.solved,shortest:s,explored:o.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:a,catches:i,label:h,naiveWins:p,line:c};let d={...e,minotaur:null},f=yield*Je(se(d),null,t,l(d)),m=St(f),b=f.solved?!1:f.capped?null:!1;if(f.solved){let x=r;for(let A of f.line)x=ie(x,A).state;b=x.outcome==="won"}let w=typeof s=="number"&&typeof m=="number"?s-m:null;return{solved:o.solved,shortest:s,explored:o.explored,withoutMinotaur:m,minotaurDelta:w,greedyWins:b,catchFree:a,catches:i,label:h,naiveWins:p,line:c}}function pn(e,t,n,r){let l=new Uint8Array(e.rows*e.cols),o=[t];l[t]=1;for(let s=0;s<o.length;s++){let i=o[s],a=Math.floor(i/e.cols),u=i%e.cols;for(let h of Y){let p=a+q[h][0],c=u+q[h][1];if(p<0||c<0||p>=e.rows||c>=e.cols)continue;let d=p*e.cols+c;!l[d]&&n(d)&&(l[d]=1,o.push(d))}if(r?.from(i))for(let h of r.to)!l[h]&&n(h)&&(l[h]=1,o.push(h))}return l}function bn(e){let t=new Set(e.objects.filter(i=>i!==null));e.machines.some(i=>i.template==="block")&&t.add("block");let n=i=>{let a=$[i];return a.door?t.has(`key-${a.door}`):i==="water"?t.has("block"):i==="toggle-open"||i==="toggle-closed"},r=pn(e,e.minotaur.r*e.cols+e.minotaur.c,i=>{let a=e.terrain[i];return $[a].minotaur||n(a)||a==="fake-wall"||a==="bomb"}),o=e.terrain.flatMap((i,a)=>i==="teleport"?[a]:[]).flatMap(i=>{let a=Math.floor(i/e.cols),u=i%e.cols;return Y.flatMap(h=>{let p=a+q[h][0],c=u+q[h][1];return p<0||c<0||p>=e.rows||c>=e.cols?[]:[p*e.cols+c]})}),s=pn(e,e.player.r*e.cols+e.player.c,i=>{let a=e.terrain[i],u=$[a];return a==="wall"?!1:u.door?n(a):!u.needs||t.has(u.needs)||n(a)},{from:i=>e.terrain[i]==="teleport",to:o});return!r.some((i,a)=>i===1&&s[a]===1)}function*Jr(e,t=me,n={}){if(!e.minotaur||bn(e))return!1;let r=ce(e),l=n.store??Ye(r.words),o=Math.max(1,n.every??65536);try{let s=new Uint32Array(r.words),i=new Uint32Array(r.words);if(Ee(se(e),r,s,0),l.add(s,0,-1,0,0),l.size>=t)return null;let a=0;for(let u=0;u<l.size;u++){++a%o===0&&(yield{expanded:a,stored:l.size,bestF:0,startH:0}),l.words(u,i,0);let h=Ne(i,0,r,e,0);for(let p of kt){if(p>ke&&h.tools[Oe[p-ke-1]]<=0)continue;let c=ie(h,Ze[p]);if(c.events.some(f=>f.kind==="caught"&&f.by==="minotaur"))return!0;let d=c.state;if(!(Ue(h,d)||d.outcome!=="playing")&&(Ee(d,r,s,0,h,i,0),l.add(s,0,u,p,0),l.size>=t))return null}}return!1}catch(s){if(s instanceof Ae)return null;throw s}}var Vr=16;function Qr(e,t){let n=e.rows*e.cols,r=new Int32Array(n).fill(-1),l=new Int8Array(n).fill(-1);r[t]=0;let o=[t];for(let s=0;s<o.length;s++){let i=o[s],a=Math.floor(i/e.cols),u=i%e.cols;Y.forEach((h,p)=>{let c=a+q[h][0],d=u+q[h][1];if(c<0||d<0||c>=e.rows||d>=e.cols)return;let f=c*e.cols+d;r[f]>=0||e.terrain[f]==="wall"||(r[f]=r[i]+1,l[f]=p,o.push(f))})}return{dist:r,via:l}}function eo(e){let t=e.rows*e.cols,n=e.player.r*e.cols+e.player.c,r=[],l=[];for(let m=0;m<t;m++)e.objects[m]==="relic"&&r.push(m),e.terrain[m]==="exit"&&l.push(m);let o=e.relics,s=[n,...r].map(m=>Qr(e,m)),i=m=>{let b=-1,w=1/0;for(let x of l){let A=s[m].dist[x];A>=0&&A<w&&(w=A,b=x)}return[b,w]},a=(m,b)=>{let w=s[m].dist[b===0?n:r[b-1]];return w<0?1/0:w},u=null;if(o===0)u=[];else if(r.length<=Vr){let m=r.length,b=new Float64Array((1<<m)*m).fill(1/0),w=new Int8Array((1<<m)*m).fill(-1);for(let k=0;k<m;k++)b[(1<<k)*m+k]=a(0,k+1);let x=1/0,A=-1;for(let k=1;k<1<<m;k++){let B=to(k);if(!(B>o))for(let L=0;L<m;L++){let G=b[k*m+L];if(!(!(k&1<<L)||G===1/0)){if(B===o){let P=G+i(L+1)[1];P<x&&(x=P,A=k*m+L);continue}for(let P=0;P<m;P++){if(k&1<<P)continue;let O=(k|1<<P)*m+P,j=G+a(L+1,P+1);j<b[O]&&(b[O]=j,w[O]=L)}}}}if(A>=0){u=[];for(let k=A;;){let B=Math.floor(k/m),L=k%m;if(u.push(L+1),w[k]<0)break;k=(B&~(1<<L))*m+w[k]}u.reverse()}}else{u=[];let m=new Set(r.map((w,x)=>x+1)),b=0;for(;u.length<o;){let w=-1,x=1/0;for(let A of m){let k=a(b,A);k<x&&(x=k,w=A)}if(w<0){u=null;break}u.push(w),m.delete(w),b=w}}if(!u)return null;let h=u.length?u[u.length-1]:0,[p]=i(h);if(p<0)return null;let c=[],d=[0,...u],f=[...u.map(m=>r[m-1]),p];return d.forEach((m,b)=>{let{via:w}=s[m],x=f[b],A=[];for(let k=x;w[k]>=0;){let B=Y[w[k]];A.push(B),k-=q[B][0]*e.cols+q[B][1]}c.push(...A.reverse())}),c}function to(e){let t=0;for(;e;e&=e-1)t++;return t}function Pt(e){let t=eo(e);if(!t)return!1;let n=se(e);for(let r of t)if(n=ie(n,{kind:"move",dir:r}).state,n.outcome!=="playing")break;return n.outcome==="won"}var Te={minotaurDelta:8,exploredTimes:20};function yn(e,t=Te,n){let r=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let l=e.withoutMinotaur!==null;if(l&&(e.minotaurDelta===null||e.greedyWins===null?r.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&r.push("the Minotaur does not matter: the line that ignores him wins, no longer")),r.push(...gn(e)),!n)return r;if(!l)return[...r,"a challenge level has a Minotaur"];e.greedyWins!==!1&&r.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<t.minotaurDelta&&r.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${t.minotaurDelta}`);let o=a=>Math.max(0,...n.teaching.map(a)),s=o(a=>a.explored);e.explored<t.exploredTimes*s&&r.push(`a challenge level: stored ${e.explored} situations, the bar is ${t.exploredTimes} × ${s} = ${t.exploredTimes*s}`);let i=o(a=>typeof a.shortest=="number"?a.shortest:0);return typeof e.shortest=="number"&&e.shortest<i&&r.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${i}`),r}function gn(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var wn={least:1.2,most:2.2};function kn(e,t,n=wn){let r=t.explored/Math.max(1,e.explored);return r<n.least?[`stored ${t.explored} situations, ${r.toFixed(2)} × the challenge level before it (${e.explored}); the ramp asks at least ${n.least} ×`]:r>n.most?[`stored ${t.explored} situations, ${r.toFixed(2)} × the challenge level before it (${e.explored}); the ramp allows at most ${n.most} ×`]:[]}var xe={ramp:{least:1.1,most:1.5},most:2e4};function Qe(e){return e.terrain.some(t=>t==="fake-wall"||t==="invisible-wall")}function xn(e){return Qe(e)?xe.ramp:wn}function Tn(e,t){return!Qe(e)||t.explored<=xe.most?[]:[`the level hides walls: stored ${t.explored} situations, the ceiling for a level that hides walls is ${xe.most}`]}var Ce={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function Mn(e,t=Ce){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let n=[];e.naiveWins&&n.push("the plain walk to the exit wins"),n.push(...gn(e));let r=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=Te.minotaurDelta,l=r?t.chaseShortest:t.shortest,o=r?t.chaseExplored:t.explored;return e.shortest<l&&n.push(`the quickest win is ${e.shortest} moves, the bar is ${l}`),e.explored<o&&n.push(`the solver searched ${e.explored} situations, the bar is ${o}`),n}var no={flippers:e=>e.gear.includes("flippers")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="water","fire-boots":e=>e.gear.includes("fire-boots")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="fire",skates:e=>e.gear.includes("skates")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="ice",suction:e=>e.gear.includes("suction")&&$[e.terrain[e.player.r*e.level.cols+e.player.c]].carries!==void 0,mirror:e=>e.stone>0,cow:e=>e.cow!==null},ro={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function de(e,t){let n=[...e.terrain],r=[...e.objects];t(n,r);let l=e.machines.filter(o=>n[o.at.r*e.cols+o.at.c]==="clone");return Q(ze({...e,terrain:n,objects:r,machines:l}))}function Lt(e){let t=[],n=s=>`row ${Math.floor(s/e.cols)+1}, column ${s%e.cols+1}`,r=s=>e.terrain[s.player.r*e.cols+s.player.c];for(let s of Me){let i=`key-${s}`,a=u=>$[r(u)].door===s;e.objects.includes(i)&&t.push({name:`the ${s} keys`,ignored:[de(e,(u,h)=>{h.forEach((p,c)=>{p===i&&(h[c]=null)})})],used:a}),e.terrain.some(u=>$[u].door===s)&&t.push({name:`the ${s} doors`,ignored:["wall","floor"].map(u=>de(e,(h,p)=>{h.forEach((c,d)=>{$[c].door===s&&(h[d]=u)}),p.forEach((c,d)=>{c===i&&(p[d]=null)})})),used:a})}let l=e.objects.filter(s=>s==="relic").length>e.relics;e.objects.forEach((s,i)=>{s==="block"?t.push({name:`the block at ${n(i)}`,ignored:[de(e,(a,u)=>{u[i]=null,a[i]="wall"}),de(e,(a,u)=>{u[i]=null})]}):(s==="relic"?l:s!==null&&s!=="cake"&&s!=="page"&&!s.startsWith("key-"))&&t.push({name:`the ${s==="relic"?"spare relic":s} at ${n(i)}`,ignored:[de(e,(a,u)=>{u[i]=null})],used:s===null?void 0:no[s]})});let o=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[s,i,a]of o){if(!e.terrain.some(p=>i.includes(p)))continue;let u=a.map(p=>de(e,c=>{c.forEach((d,f)=>{i.includes(d)&&(c[f]=p)})})),h=ro[i[0]];h&&e.objects.includes(h)&&u.push(de(e,(p,c)=>{c.forEach((d,f)=>{d===h&&(c[f]=null)})})),t.push({name:`the ${s}`,ignored:u})}return e.terrain.some(s=>s==="button"||s==="toggle-open"||s==="toggle-closed")&&t.push({name:"the toggle walls and their button",ignored:[de(e,s=>{s.forEach((i,a)=>{i==="button"||i==="toggle-open"?s[a]="floor":i==="toggle-closed"&&(s[a]="wall")})})]}),e.terrain.forEach((s,i)=>{let a=h=>{for(let[p,c]of Object.entries(e.links))c===i&&(h[Number(p)]="floor")},u=(h,p,c,d)=>t.push({name:`the ${h} at ${n(i)}`,ignored:[p,...d?[d]:[]].map(f=>de(e,m=>{m[i]=f,c?.(m)}))});s==="trap"?u("snare","floor",a):s==="fake-wall"?u("fake wall","wall",void 0,"floor"):s==="invisible-wall"?u("invisible wall","floor"):s==="thief"?u("thief","floor"):s==="bomb"?u("bomb","floor"):s==="clone"&&u("clone machine","wall",a)}),e.hazards.forEach((s,i)=>{t.push({name:`the ${re[s.kind].name.toLowerCase()} at ${n(s.at.r*e.cols+s.at.c)}`,ignored:[Q(ze({...e,hazards:e.hazards.filter((a,u)=>u!==i)}))]})}),t}var En={explored:1.3};function oo(e,t,n,r=!1){let l=Fe(se(t),n);if(!l.solved)return l.capped?"capped":"the level cannot be won";if(l.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${l.line.length}`;let o=hn(se(t),ve,n);return o.solved?o.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${o.line.length}`:!r&&e.explored>=En.explored*l.explored?`the search falls from ${e.explored} situations to ${l.explored}`:null:o.capped?"capped":"no win without a catch"}function so(e,t){let n=new Set;for(let r of t.ignored)for(let l=0;l<e.terrain.length;l++)(r.terrain[l]!==e.terrain[l]||r.objects[l]!==e.objects[l])&&n.add(l);return[...n]}function lo(e,t,n){let r=n.used?[]:so(e,n);if(!r.length&&!n.used)return!1;let l=se(e),o=s=>s.r*e.cols+s.c;for(let s of vt(t)??[]){if(l=ie(l,s).state,n.used?.(l))return!0;let i=o(l.player),a=l.minotaur?o(l.minotaur):-1;for(let u of r)if(i===u||l.terrain[u]!==e.terrain[u]||l.objects[u]!==e.objects[u]||a===u&&e.terrain[u]==="trap")return!0}return!1}function An(e,t,n=me,r=!1){return!t.solved||typeof t.catchFree!="number"?[]:Lt(e).flatMap(l=>{if(r&&lo(e,t.line,l))return[];let o=l.ignored.map(s=>oo(t,s,n,r));return o.some(s=>s!==null&&s!=="capped")?[]:o.includes("capped")?[{unit:l,problem:`${l.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:l,problem:r?`${l.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${t.shortest}`:`${l.name}: ignoring it changes nothing (still ${t.shortest} moves, and the search no ${En.explored} × smaller)`}]})}function vn(e){let t=[["Theseus",e.player]];e.minotaur&&t.push(["the Minotaur",e.minotaur]);for(let r of e.hazards)t.push([`the ${re[r.kind].name.toLowerCase()}`,r.at]);let n=[];for(let[r,l]of t){let o=l.r*e.cols+l.c,s=e.terrain[o],i=e.objects[o];(s!=="floor"||i!==null)&&n.push(`${r} starts on ${i??s} at row ${l.r+1}, column ${l.c+1}: nothing may start under a figure`)}return n}var Se={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function Sn(e){return!e.minotaur||e.objects.includes("mirror")||e.terrain.includes("trap")?!1:bn(e)}function io(e,t){let n=e.level;if(!e.minotaur)return 1/0;let r=e.minotaur.r*n.cols+e.minotaur.c,l=e.player.r*n.cols+e.player.c,o=new Map([[r,0]]),s=[r];for(let i=0;i<s.length;i++){let a=s[i],u=o.get(a);if(a===l)return u;if(u>=t)continue;let h=Math.floor(a/n.cols),p=a%n.cols;for(let c of Y){let d=h+q[c][0],f=p+q[c][1];if(d<0||f<0||d>=n.rows||f>=n.cols)continue;let m=d*n.cols+f;o.has(m)||m!==l&&(!$[e.terrain[m]].minotaur||e.objects[m]==="block")||(o.set(m,u+1),s.push(m))}}return 1/0}function Rt(e,t){let n=vt(t.line)??[],r=se(e),l=0,o=0,s=0;for(let i of n)r=ie(r,i).state,r.stone>0||!!r.minotaur&&(oe(Ht(r),r.minotaur)||io(r,Se.reach)<=Se.reach)?(l++,s=0):o=Math.max(o,++s);return{turns:n.length,live:l,quiet:o}}function Pn(e,t,n){if(!e.minotaur||!t.solved||typeof t.shortest!="number")return[];let r=[];t.minotaurDelta!==null&&t.minotaurDelta<1&&r.push("the beast adds no moves: a route that ignores him wins as quickly");let l=Se[n],o=Rt(e,t);return o.live<l.share*o.turns&&r.push(`the beast is live on ${o.live} of ${o.turns} turns; the bar is ${Math.ceil(l.share*o.turns)}`),o.quiet>l.quiet*o.turns&&r.push(`the beast is quiet for ${o.quiet} turns in a row; the bar is ${Math.floor(l.quiet*o.turns)}`),r}function zt(e,t=0){let n=3735928559^t,r=1103547991^t;for(let l=0;l<e.length;l++){let o=e.charCodeAt(l);n=Math.imul(n^o,2654435761),r=Math.imul(r^o,1597334677)}return n=Math.imul(n^n>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),r=Math.imul(r^r>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),[n>>>0,r>>>0]}function Ln(...e){return zt(e.join(""))[0]}function Rn(...e){let t=e.join(""),[n,r]=zt(t),[l,o]=zt(t,2654435769),s=n,i=r,a=l,u=o|1,h=()=>{let c=(s+i|0)+u|0;return u=u+1|0,s=i^i>>>9,i=a+(a<<3)|0,a=a<<21|a>>>11,a=a+c|0,(c>>>0)/4294967296};for(let c=0;c<12;c++)h();let p=c=>Math.floor(h()*c);return{next:h,int:p,pick:c=>c[p(c.length)],shuffle(c){let d=[...c];for(let f=d.length-1;f>0;f--){let m=p(f+1);[d[f],d[m]]=[d[m],d[f]]}return d}}}var et={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function Ot(e){return Object.keys(et).filter(t=>et[t]<=e)}var nt=["fake","invisible"];function zn(e,t,n,r){let l=t-(n-1);if(l<n*r)return null;let o=Array(n).fill(r);for(let a=l-n*r;a>0;a--)o[e.int(n)]++;let s=[],i=1;for(let a of o)s.push([i,i+a-1]),i+=a+1;return s}var Pe={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},tt=["up","down","left","right"];function On(e,t){let{rows:n,cols:r}=t,l=zn(e,n-2,t.roomRows,2),o=zn(e,r-2,t.roomCols,2);if(!l||!o)return null;let s=Array.from({length:n},()=>Array(r).fill("#")),i=t.roomRows*t.roomCols,a=y=>({r:l[Math.floor(y/t.roomCols)],c:o[y%t.roomCols]});for(let y=0;y<i;y++){let{r:E,c:T}=a(y);for(let R=E[0];R<=E[1];R++)for(let C=T[0];C<=T[1];C++)s[R][C]="."}let u=[];for(let y=0;y<i;y++)y%t.roomCols<t.roomCols-1&&u.push([y,y+1]),y+t.roomCols<i&&u.push([y,y+t.roomCols]);let h=[...Array(i).keys()],p=y=>h[y]===y?y:h[y]=p(h[y]),c=[],d=(y,E,T)=>{let R=a(y),C=a(E);if(E===y+1){let K=Math.max(R.r[0],C.r[0]),z=Math.min(R.r[1],C.r[1]),_=R.c[1]+1;if(T){for(let ne=K;ne<=z;ne++)s[ne][_]=".";return}let J=K+e.int(z-K+1);s[J][_]=".",c.push({r:J,c:_})}else{let K=Math.max(R.c[0],C.c[0]),z=Math.min(R.c[1],C.c[1]),_=R.r[1]+1;if(T){for(let ne=K;ne<=z;ne++)s[_][ne]=".";return}let J=K+e.int(z-K+1);s[_][J]=".",c.push({r:_,c:J})}};for(let[y,E]of e.shuffle(u))p(y)!==p(E)?(h[p(y)]=p(E),d(y,E,e.next()<t.hall)):e.next()<t.loop&&d(y,E,!1);let f=e.shuffle([...Array(i).keys()]),m=new Set,b=()=>{let y=f.filter(T=>!m.has(T)),E=y.length?y[0]:e.pick(f);return m.add(E),E},w=(y,E=(T,R)=>s[T][R]===".")=>{let{r:T,c:R}=a(y),C=[];for(let K=T[0];K<=T[1];K++)for(let z=R[0];z<=R[1];z++)E(K,z)&&C.push([K,z]);return C.length?e.pick(C):null},x=(y,E)=>tt.some(T=>c.some(R=>R.r===y+Pe[T][0]&&R.c===E+Pe[T][1])),A=y=>{let E=y===void 0?e.shuffle([...Array(i).keys()]):[y];for(let T of E){let R=w(T,(C,K)=>s[C][K]==="."&&!x(C,K));if(R)return R}return null},k=(y,E)=>{let T=A(E);return T?(s[T[0]][T[1]]=y,!0):!1},B=()=>e.shuffle(c.filter(y=>s[y.r][y.c]===".")),L=y=>{let E=B()[0];return E?(s[E.r][E.c]=y,!0):!1},G=(y,E)=>{let{r:T,c:R}=a(y);if(e.next()<.5){let K=T[0]+e.int(T[1]-T[0]+1),z=Math.min(T[1],K+e.int(2));for(let _=K;_<=z;_++)for(let J=R[0];J<=R[1];J++)s[_][J]==="."&&(s[_][J]=E)}else{let K=R[0]+e.int(R[1]-R[0]+1),z=Math.min(R[1],K+e.int(2));for(let _=T[0];_<=T[1];_++)for(let J=K;J<=z;J++)s[_][J]==="."&&(s[_][J]=E)}},P=b(),O=b(),j=new Map,H=new Map,S=y=>{let E=A();return E?(s[E[0]][E[1]]=y,j.set(E[0]*r+E[1],e.pick(tt)),!0):!1},g=!0;for(let y of t.families){switch(y){case"keys":{let[E,T]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),R=1+e.int(2);for(let C=0;C<R;C++)g=L(E)&&g;for(let C=0;C<(E==="G"?1:R);C++)g=k(T)&&g;break}case"water":{let E=b();G(E,"~"),g=(e.next()<.5?k("f"):k("O"))&&g;break}case"fire":{let E=b();G(E,"F"),g=k("h")&&g;break}case"ice":{let E=b();G(E,"="),e.next()<.5&&(g=k("k")&&g);break}case"force":{let E=b(),T=e.pick(["^","v","<",">"]);G(E,T),e.next()<.5&&(g=k("u")&&g);break}case"blocks":{let E=1+e.int(2);for(let T=0;T<E;T++)g=k("O")&&g;break}case"toggle":{let E=1+e.int(2);for(let T=0;T<E;T++)g=L(e.next()<.5?"T":"t")&&g;g=k("_")&&g;break}case"mirror":g=k("z")&&g;break;case"cow":g=k("c")&&g;break;case"gravel":{let E=1+e.int(2);for(let T=0;T<E;T++)g=L(":")&&g;break}case"popup":g=L(";")&&g;break;case"fake":g=L("W")&&g;break;case"invisible":g=k("I")&&g;break;case"snare":g=(e.next()<.5?L("&"):k("&"))&&k("-")&&g;break;case"teleport":g=k("@",b())&&k("@",b())&&g;break;case"ball":g=S("o")&&g;break;case"glider":g=S("w")&&g;break;case"fireball":g=S("e")&&g;break;case"thief":g=L("$")&&g;break;case"bomb":g=(e.next()<.5?L("!"):k("!"))&&g;break;case"clone":{let E=!1;for(let T=0;T<40&&!E;T++){let R=e.int(i),{r:C,c:K}=a(R),z=e.int(4),_=z<2?z===0?C[0]-1:C[1]+1:C[0]+e.int(C[1]-C[0]+1),J=z<2?K[0]+e.int(K[1]-K[0]+1):z===2?K[0]-1:K[1]+1,ne=["down","up","right","left"][z],ar=_+Pe[ne][0],ur=J+Pe[ne][1];_<=0||J<=0||_>=n-1||J>=r-1||s[_][J]!=="#"||s[ar][ur]!=="."||(s[_][J]="C",H.set(_*r+J,`${e.pick(["block","ball","block"])}-${ne}`),E=!0)}g=E&&k("+")&&g;break}}if(!g)return null}for(let y=0;y<t.relics;y++)if(!k("*"))return null;if(!k("P",P)||!k("M",O))return null;let D=[];for(let y=1;y<n-1;y++)s[y][1]==="."&&D.push([y,0,y,1]),s[y][r-2]==="."&&D.push([y,r-1,y,r-2]);for(let y=1;y<r-1;y++)s[1][y]==="."&&D.push([0,y,1,y]),s[n-2][y]==="."&&D.push([n-1,y,n-2,y]);if(!D.length)return null;let[W,v,M,I]=e.pick(D);return s[W][v]="E",t.relics>0&&e.next()<.5&&s[M][I]==="."&&!x(M,I)&&(s[M][I]="|"),{g:s,doors:c,facing:j,machines:H}}function De(e,t){let n=[`title: ${t}`,"intro: "],r=[...e.facing.keys()].sort((o,s)=>o-s);r.length&&n.push(`facing: ${r.map(o=>e.facing.get(o)).join(" ")}`);let l=[...e.machines.keys()].sort((o,s)=>o-s);return l.length&&n.push(`machines: ${l.map(o=>e.machines.get(o)).join(" ")}`),`${n.join(`
`)}

${e.g.map(o=>o.join("")).join(`
`)}
`}var ao=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function Fn(e,t){let n=t.g.map(p=>[...p]),r=n.length,l=n[0].length,o=[...t.doors],s=new Map(t.facing),i=p=>{let c=[];for(let d=1;d<r-1;d++)for(let f=1;f<l-1;f++)p(d,f)&&c.push([d,f]);return c},a=(p,c)=>o.some(d=>d.r===p&&d.c===c),u=(p,c)=>tt.some(d=>a(p+Pe[d][0],c+Pe[d][1])),h=e.next();if(h<.55){let p=i((d,f)=>ao.has(n[d][f])&&!a(d,f)),c=i((d,f)=>n[d][f]==="."&&!a(d,f)&&!u(d,f));if(p.length&&c.length){let[d,f]=e.pick(p),[m,b]=e.pick(c);n[m][b]=n[d][f],n[d][f]=".";let w=s.get(d*l+f);w&&(s.delete(d*l+f),s.set(m*l+b,w))}}else if(h<.7){let p=o.filter(d=>n[d.r][d.c]!=="."),c=o.filter(d=>n[d.r][d.c]===".");if(p.length&&c.length){let d=e.pick(p),f=e.pick(c);n[f.r][f.c]=n[d.r][d.c],n[d.r][d.c]="."}}else if(h<.8&&s.size)s.set(e.pick([...s.keys()]),e.pick(tt));else{let p=o.filter(d=>n[d.r][d.c]==="."),c=i((d,f)=>n[d][f]==="#"&&(n[d-1][f]!=="#"&&n[d+1][f]!=="#"&&n[d][f-1]==="#"&&n[d][f+1]==="#"||n[d][f-1]!=="#"&&n[d][f+1]!=="#"&&n[d-1][f]==="#"&&n[d+1][f]==="#"));if(p.length>1&&(e.next()<.5||!c.length)){let d=e.pick(p);n[d.r][d.c]="#",o=o.filter(f=>f!==d)}else if(c.length){let[d,f]=e.pick(c);n[d][f]=".",o.push({r:d,c:f})}}return{g:n,doors:o,facing:s,machines:new Map(t.machines)}}var Cn=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function uo(e,t,n){for(let r=-1;r<=1;r++)for(let l=-1;l<=1;l++){let o=t+r,s=n+l;if(o>=0&&s>=0&&o<e.rows&&s<e.cols&&Cn(e.terrain[o*e.cols+s])!=="wall")return!1}return!0}function Le(e){return Array.from({length:e.rows-2},(t,n)=>Array.from({length:e.cols-2},(r,l)=>{let o=Cn(e.terrain[(n+1)*e.cols+l+1]);return o==="wall"&&uo(e,n+1,l+1)?"":o}))}var co=e=>e[0].map((t,n)=>e.map(r=>r[n]).reverse()),ho=e=>e.map(t=>[...t].reverse());function rt(e){let t=[];for(let n=0,r=e;n<4;n++,r=co(r))t.push(r,ho(r));return t}function Be(e,t){let n=0;for(let r of t){let[l,o]=e.length*e[0].length<=r.length*r[0].length?[e,r]:[r,e],s=l.length,i=l[0].length,a=o.length,u=o[0].length;if(!(s>a||i>u||a-s>2||u-i>2))for(let h=0;h<=a-s;h++)for(let p=0;p<=u-i;p++){let c=0,d=0;for(let f=0;f<s;f++)for(let m=0;m<i;m++){let b=l[f][m],w=o[f+h][m+p];b&&b===w&&c++,(b||w)&&d++}n=Math.max(n,d?c/d:1)}}return n}var Bn=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function Ft(e){let t=new Set(e.terrain),n=new Set(e.objects.filter(r=>r!==null));return t.has("thief")||t.has("bomb")||t.has("clone")||t.has("button-red")?9:e.hazards.some(r=>r.kind!=="ball")?8:e.hazards.length?7:t.has("teleport")?6:t.has("trap")||t.has("button-brown")?5:t.has("fake-wall")||t.has("invisible-wall")?4:t.has("popup")?3:t.has("gravel")?2:1}var fo=e=>({teaching:[{...Bn[e-1]}]});function In(e){let t=Bn[e-1];return{explored:Math.max(Ce.chaseExplored,Te.exploredTimes*t.explored),shortest:Math.max(Ce.chaseShortest,t.shortest)}}var Dn=Ce.chaseExplored,po={least:1.2,most:1.6},Re={least:3e4,most:5e4};function ot(e,t){let n=t?xe.ramp:po,r=t?xe.most:Re.most;if(e===null)return{least:Dn,most:t?xe.most:2e4,plateau:!1};if(!t&&e>=Re.least)return{least:Re.least,most:Re.most,plateau:!0};let l=Math.max(Dn,Math.ceil(e*n.least)),o=Math.min(r,Math.floor(e*n.most));return o>=l*1.15?{least:l,most:o,plateau:!1}:t?null:{least:Re.least,most:Re.most,plateau:!0}}function $n(e){return{features:e.map(t=>rt(Le(t)))}}function Ct(e){let{rows:t,cols:n}=e,r=(o,s)=>e.terrain[o*n+s]==="wall",l=[];for(let o=1;o<t-1;o++)for(let s=1;s<n-1;s++){let i=o*n+s,a=[r(o-1,s),r(o+1,s),r(o,s-1),r(o,s+1)].filter(Boolean).length;r(o,s)&&a===0&&l.push(`a lone wall at row ${o+1}, column ${s+1}`),e.terrain[i]==="floor"&&e.objects[i]===null&&!(e.player.r===o&&e.player.c===s)&&!(e.minotaur?.r===o&&e.minotaur.c===s)&&!e.hazards.some(h=>h.at.r===o&&h.at.c===s)&&a>=3&&l.push(`a bare pocket at row ${o+1}, column ${s+1}`)}return l}function Dt(e,t,n=[]){let r=Le(e),l=[];return t.features.forEach((o,s)=>{let i=Be(r,o);i>=.42&&l.push(`its layout repeats campaign level ${s+1}'s (${i.toFixed(2)})`)}),n.forEach((o,s)=>{let i=Be(r,rt(Le(o)));i>=.42&&l.push(`its layout repeats the run's level ${s+1}'s (${i.toFixed(2)})`)}),l}function jn(e,t,n=[]){let r=Le(e),l=0;for(let o of t.features)l=Math.max(l,Be(r,o));for(let o of n)l=Math.max(l,Be(r,rt(Le(o))));return l}function Wn(e,t,n,r,l=[]){let o=[];return(t.explored<n.band.least||t.explored>n.band.most)&&o.push(`stored ${t.explored} situations, the band is ${n.band.least} to ${n.band.most}`),o.push(...yn(t,Te,fo(Ft(e))),...Mn(t),...Pn(e,t,"challenge"),...Tn(e,t)),!n.band.plateau&&n.previous&&o.push(...kn(n.previous,t,xn(e))),Qe(e)&&n.band.plateau&&o.push("a level that hides walls never sits on the plateau"),o.length?o:[...vn(e),...Ct(e),...Dt(e,r,l)]}var Kn=3e6,Bt=12,ul=Kn*Bt;function mo(e){return{parts:Bt,budget:e.budget===void 0?Kn:Math.max(1,Math.floor(e.budget/Bt))}}var Un=12,st=120,bo=.25;function yo(e,t,n,r,l=!1){let o=Ot(t).filter(c=>!nt.includes(c)),s=o.filter(c=>et[c]===Math.min(t,9)),i=2+e.int(2),a=[];s.length&&(e.next()<.5||l)&&a.push(e.pick(s)),r&&a.push(e.pick(nt));for(let c of e.shuffle(o))a.length<i+(r?1:0)&&!a.includes(c)&&a.push(c);let u=t<=1?12:11,h=u+e.int(16-u),p=u+e.int(16-u);return{rows:h,cols:p,roomRows:2+e.int(3),roomCols:2+e.int(3),families:a,relics:1+e.int(3),hall:.1+.25*e.next(),loop:.2+.3*e.next()}}var It=.6931471805599453;function Hn(e){let t=0;for(;e>=2;)e/=2,t++;for(;e<1;)e*=2,t--;let n=(e-1)/(e+1),r=n*n,l=n,o=0;for(let s=1;s<60;s+=2)o+=l/s,l*=r;return 2*o+t*It}function go(e){if(!(e>=0))return 1;if(e>60)return 0;let t=0;for(;e>=It;)e-=It,t++;let n=1,r=1;for(let l=1;l<30;l++)n*=-e/l,r+=n;for(;t>0;t--)r/=2;return r}var Gn=e=>Math.ceil(e.most*1.05),_n=e=>Math.max(2e5,e.most*4);function wo(e,t,n,r=()=>0){if(!e.minotaur)return 1/0;let l=Ct(e).length;if(l)return 14+l;let o=r(e);if(o>=.42)return 13+10*(o-.42);if(Pt(e))return n(0,"cheap:walk"),12.5;if(Sn(e))return n(0,"cheap:penned"),12.5;let s=se(e),i=Fe(s,Gn(t));if(!i.solved)return n(i.explored,i.capped?"solve:capped":"solve:lost"),i.capped?12:30;n(i.explored,i.explored<t.least?"solve:low":i.explored>t.most?"solve:high":"solve:in");let a=0,u=In(Ft(e)),h=Math.max(t.least,u.explored);i.explored<h&&(a+=3*Hn(h/i.explored)),i.explored>t.most&&(a+=3*Hn(i.explored/t.most)),i.line.length<u.shortest&&(a+=.2*(u.shortest-i.line.length));let p=s,c=0;for(let m of i.line){let b=ie(p,m);p=b.state,ve(b.events,p)&&c++}a+=3*c;let d=Rt(e,{line:Ve(i.line)});if(a+=6*Math.max(0,Se.challenge.share-d.live/Math.max(1,d.turns)),a+=6*Math.max(0,d.quiet/Math.max(1,d.turns)-Se.challenge.quiet),a>0)return a;let f=Fe(se({...e,minotaur:null}),Gn(t));if(n(f.explored,"free"),f.solved){a+=.4*Math.max(0,Te.minotaurDelta-(i.line.length-f.line.length));let m=s;for(let b of f.line)m=ie(m,b).state;m.outcome==="won"&&(a+=2)}return a}function ko(e,t){let n=ze(t),r=n.slice(n.indexOf(`

`)+2).trimEnd().split(`
`).map(s=>[...s]),l=new Map(t.hazards.map(s=>[s.at.r*t.cols+s.at.c,s.dir])),o=new Map(t.machines.map(s=>[s.at.r*t.cols+s.at.c,`${s.template}-${s.dir}`]));return{g:r,doors:e.doors,facing:l,machines:o}}function xo(e){let t=n=>n.terrain.filter(r=>r==="wall").length;return e.reduce((n,r)=>t(r)<t(n)?r:n)}function To(e,t,n){let r=t.run.slice(-Un),l=e.filter(c=>c.chapter<=t.tier),o=r.map(c=>Q(c.text)),s=l.filter(c=>!r.some(d=>d.text===c.text)&&Dt(Q(c.text),{features:[]},o).length===0),i=t.run.at(-1)?.explored??null,a=ot(Number.MAX_SAFE_INTEGER,!1),u=[c=>c.explored>=n.least&&c.explored<=n.most,c=>i!==null&&c.explored>=i*1.2&&c.explored<=i*2.2,c=>c.explored>=a.least&&c.explored<=a.most,()=>!0],h=c=>c[Ln("endless-bank",t.seed,t.tier,t.depth)%c.length],p=l.filter(c=>c.text!==t.run.at(-1)?.text);for(let c of u)for(let d of[s,p,l]){let f=d.filter(c);if(f.length)return h(f)}if(e.length)return h(e);throw new RangeError("the bank is empty")}function Mo(e,t,n,r,l,o,s,i,a,u=null,h,p=!1){let c=i.by,d=(b,w="other")=>{i.spent+=b,c&&(c[w]=(c[w]??0)+b,c[w+"#"]=(c[w+"#"]??0)+1)},f=new Map,m=b=>{let w=`${b.cols}:${b.terrain.join(",")}`,x=f.get(w);return x===void 0&&(x=jn(b,l,o),f.set(w,x)),x};for(let b=0;i.spent<s;b++){let w=Rn("endless",...e,b),x=u!==null&&w.next()<.25,A=x?u:n,k=On(w,yo(w,t,A,x,p));if(!k){d(1e3);continue}let B=g=>{try{return Q(De(g,""))}catch{return null}},L=new Map,G=(g,D)=>{let W=De(g,""),v=L.get(W);return v===void 0?(v=wo(D,A,d,m),L.set(W,v)):c&&(c["memo#"]=(c["memo#"]??0)+1),v},P=B(k),O=P?G(k,P):1/0,j=O,H=i.spent,S=st;for(let g=0;g<S&&i.spent<s&&(g===S-1&&O<2&&S<3*st&&(S+=st),!(g===Math.floor(st/3)&&O>=8));g++){if(i.tries++,g%8===0&&a?.({tries:i.tries,spent:i.spent,budget:s}),O===0&&P){let M=mn(P,_n(A));d(4*M.explored,"measure");let I=Wn(P,M,{band:A,previous:r},l,o);if(I.length){if(h?.(`gate: ${I.join("; ")}`),c)for(let y of I){let E="gate:"+y.replace(/[0-9.,×]+/g,"N").slice(0,50);c[E]=(c[E]??0)+1}O=1,L.set(De(k,""),O)}else{d(Lt(P).reduce((T,R)=>T+R.ignored.length,0)*2*M.explored,"useless");let y=An(P,M,_n(A),!0);if(!y.length)return{text:De(k,""),d:M};h?.(`useless: ${y.map(T=>T.problem).join("; ")}`);let E=xo(y[0].unit.ignored);k=ko(k,E),P=B(k),O=P?G(k,P):1/0;continue}}let D=Fn(w,k),W=B(D);if(!W)continue;let v=G(D,W);(v<=O||Number.isFinite(v)&&w.next()<go((v-O)/bo))&&(k=D,P=W,O=v)}h?.(`round ${b}: began ${j.toFixed(2)}, ended ${O.toFixed(2)} from passing, ${i.spent-H} spent`)}return null}function Nn(e){let t=e.run.at(-1)??null,n=ot(t?.explored??null,!1),r=t&&Ot(e.tier).some(l=>nt.includes(l))?ot(t.explored,!0):null;return{band:n,hides:r,before:t}}function qn(e,t,n,r={}){let{band:l,hides:o,before:s}=Nn(e),{parts:i,budget:a}=mo(e);if(!s||t<0||t>=i)throw new RangeError(`no part ${t} of a search for level ${e.depth}`);let u={tries:0,spent:0},h=e.run.slice(-Un).map(d=>Q(d.text)),p=Mo([e.seed,e.tier,e.depth,"part",t],e.tier,l,{explored:s.explored},n,h,a,u,r.progress,o);return{found:p?{text:p.text,explored:p.d.explored,shortest:p.d.shortest,line:p.d.line,from:"made",tries:u.tries,spent:u.spent}:null,...u}}function Yn(e,t,n=0,r=0){let l=To(t,e,Nn(e).band);return{text:l.text,explored:l.explored,shortest:l.shortest,line:l.line,from:"bank",tries:n,spent:r}}var Eo=150;function Zn(e){let t=null;return{receive(n){try{if(n.type==="bank"){e.post({type:"made",id:n.id,made:Yn(n.request,e.bank,n.tries,n.spent)});return}if(n.type!=="part")return;t??=e.known();let r=-1/0,l=qn(n.request,n.part,t,{progress:o=>{let s=e.now();s-r<Eo||(r=s,e.post({type:"progress",id:n.id,progress:o}))}});e.post({type:"part",id:n.id,part:n.part,result:l})}catch(r){e.post({type:"failed",id:n.id,message:r instanceof Error?r.message:String(r)})}}}}var Xn=[{chapter:1,explored:12729,shortest:36,line:"urrrdrrdlddddrrcrdrrruullluuuuurrrur",text:`title: 
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
`}];var Jn=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
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
`}];var Vn=[{id:"ch2-1",text:`title: The Loose Stone
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
`}];var Qn=[{id:"ch3-1",text:`title: The Rising Floor
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
`}];var er=[{id:"ch4-1",text:`title: The Wall That Gives
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
`}];var tr=[{id:"ch5-1",text:`title: The Snare
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
`}];var nr=[{id:"ch6-1",text:`title: The Teleport
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
`}];var rr=[{id:"ch7-1",text:`title: The Bronze Ball
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
`}];var or=[{id:"ch8-1",text:`title: The Harpy
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
`}];var sr=[{id:"ch9-1",text:`title: The Thief
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
`}];var lr=[{id:"ch10-1",text:`title: The Wooden Cow
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
`}];var Ao=[...Jn,...Vn,...Qn,...er,...tr,...nr,...rr,...or,...sr,...lr];function ir(){return Ao.map(e=>Q(e.text))}var vo=Zn({post:e=>self.postMessage(e),bank:Xn,known:()=>$n(ir()),now:()=>performance.now()});self.onmessage=e=>vo.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
