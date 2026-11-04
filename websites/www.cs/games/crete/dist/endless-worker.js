"use strict";(()=>{var _=["up","down","left","right"],K={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},je=["red","blue","yellow","green"],fr=["flippers","fire-boots","skates","suction"],Lt={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},U=(e,t,r,n={},s,l=t)=>({char:e,minotaur:t,block:r,hazard:l,...n,sprites:s??[]}),G={floor:U(".",!0,!0,{},["floor"]),wall:U("#",!1,!1,{},["wall"]),exit:U("E",!1,!1,{},["exit"]),gate:U("|",!1,!1,{},["gate-closed","gate-open"]),water:U("~",!1,!0,{needs:"flippers"},["water"]),fire:U("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:U("=",!0,!0,{slides:"skates"},["ice"]),"force-up":U("^",!0,!0,{carries:"up"},["force-up"]),"force-down":U("v",!0,!0,{carries:"down"},["force-down"]),"force-left":U("<",!0,!0,{carries:"left"},["force-left"]),"force-right":U(">",!0,!0,{carries:"right"},["force-right"]),dirt:U("%",!0,!0,{},["dirt"]),safe:U("S",!1,!1,{},["safe"]),button:U("_",!0,!0,{},["button"]),"toggle-open":U("t",!0,!1,{},["toggle-open"]),"toggle-closed":U("T",!1,!1,{},["toggle-closed"]),"door-red":U("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":U("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":U("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":U("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:U("&",!0,!0,{},["trap"]),"button-brown":U("-",!0,!0,{},["button-brown"]),"button-red":U("+",!0,!0,{},["button-red"]),popup:U(";",!1,!1,{},["popup"]),gravel:U(":",!1,!1,{},["gravel"]),"fake-wall":U("W",!1,!1,{},["wall"]),"invisible-wall":U("I",!1,!1,{},["floor"]),teleport:U("@",!1,!1,{},["teleport"]),thief:U("$",!0,!0,{},["thief"]),bomb:U("!",!1,!0,{},["bomb"],!0),clone:U("C",!1,!1,{},_.map(e=>`clone-${e}`))},se={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var lt={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:Lt.mirror.name},cake:{char:"x",sprite:"cake",name:Lt.cake.name},cow:{char:"c",sprite:"cow",name:Lt.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},eo=["theseus","minotaur","minotaur-stone","cow-standing"],to=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],ro=["exit-off","exit-wake"],jl=[...new Set([...Object.values(G).flatMap(e=>e.sprites),...to,...ro,...Object.values(lt).map(e=>e.sprite),...eo,...Object.values(se).map(e=>e.sprite)])];var le=class extends Error{line;col;constructor(t,r,n){super(`line ${t}, column ${r}: ${n}`),this.line=t,this.col=r}},no=new Map(Object.entries(G).map(([e,t])=>[t.char,e])),oo=new Map(Object.entries(lt).map(([e,t])=>[t.char,e])),lo=/^[a-z0-9-]+$/,so=/^([a-z]+): (.*)$/,io=new Map(Object.entries(se).map(([e,t])=>[t.char,e])),ao=["block","ball","glider","fireball"],uo=["title","intro","hearts","relics","pages","facing","machines"];function co(e,t){let r=e&&e.value!==""?e.value.split(" "):[],n=e??{line:1,col:1},s=new Set;for(let l of r){if(!lo.test(l))throw new le(n.line,n.col,`page id '${l}' must be lower-case letters, digits and hyphens`);if(s.has(l))throw new le(n.line,n.col,`page '${l}' named twice`);s.add(l)}if(r.length>31)throw new le(n.line,n.col,"a level holds at most 31 pages");if(r.length!==t)throw new le(n.line,n.col,`pages: ${r.length} named but the grid has ${t}`);return r}function pr(e,t,r,n,s){let l=t&&t.value!==""?t.value.split(" "):[],o=t??{line:1,col:1};for(let i of l)if(!n(i))throw new le(o.line,o.col,`${e}: '${i}' is not ${s}`);if(l.length!==r)throw new le(o.line,o.col,`${e}: ${l.length} named but the grid has ${r}`);return l}function ho(e){let t={},r=e.indexOf("trap"),n=e.indexOf("clone"),s=-1,l=-1;for(let o=e.length-1;o>=0;o--){let i=e[o];if(i==="button-brown"){let a=s>=0?s:r;a>=0&&(t[o]=a)}else if(i==="button-red"){let a=l>=0?l:n;a>=0&&(t[o]=a)}else i==="trap"?s=o:i==="clone"&&(l=o)}return t}function Q(e){let t=e.replace(/\r\n/g,`
`).split(`
`),r={},n=0;for(;n<t.length;n++){let L=so.exec(t[n]);if(!L)break;if(!uo.includes(L[1]))throw new le(n+1,1,`unknown header '${L[1]}'`);r[L[1]]={value:L[2],line:n+1,col:L[1].length+3}}for(;n<t.length&&t[n]==="";)n++;let s=n,l=[];for(;n<t.length&&t[n]!=="";n++)l.push(t[n]);if(l.length===0)throw new le(s+1,1,"no grid");for(;n<t.length;n++)if(t[n].trim()!=="")throw new le(n+1,1,"text after the grid");let o=l[0].length,i=[],a=[],u=null,d=null,h=0,c=[],p=[],f=[];if(l.forEach((L,v)=>{let D=s+v+1;if(L.length!==o)throw new le(D,1,`row is ${L.length} wide, expected ${o}`);[...L].forEach((C,E)=>{let S=E+1;if(C==="P"||C==="M"){if(C==="P"&&u)throw new le(D,S,"second player");if(C==="M"&&d)throw new le(D,S,"second Minotaur");C==="P"?u={r:v,c:E}:d={r:v,c:E},i.push("floor"),a.push(null);return}let H=io.get(C);if(H){p.push({kind:H,at:{r:v,c:E}}),i.push("floor"),a.push(null);return}let B=no.get(C),A=oo.get(C);if(!B&&!A)throw new le(D,S,`unknown tile '${C}'`);i.push(B??"floor"),a.push(A??null),A==="relic"&&h++,B==="clone"&&f.push({r:v,c:E}),A==="page"&&c.push(v*o+E)})}),!u)throw new le(s+1,1,"no player");let m=(L,v,D,C)=>{let E=r[L];if(!E)return v;let S=Number(E.value);if(!Number.isInteger(S)||S<D)throw new le(E.line,E.col,`${L} must be ${D} to ${C}`);if(S>C){let H=L==="relics"?`relics: ${E.value} but the grid has ${C}`:`${L} must be ${D} to ${C}`;throw new le(E.line,E.col,H)}return S},b=m("hearts",3,1,99),g=m("relics",h,0,h),w=co(r.pages,c.length),M=pr("facing",r.facing,p.length,L=>_.includes(L),"a direction"),T=p.map((L,v)=>({...L,dir:M[v],home:v})),z=pr("machines",r.machines,f.length,L=>{let[v,D]=L.split("-");return ao.includes(v)&&_.includes(D)&&L.split("-").length===2},"a template and a direction like block-up"),F=T.length,q=f.map((L,v)=>{let[D,C]=z[v].split("-"),E={at:L,template:D,dir:C};return D==="block"?E:{...E,home:F++}});return{title:r.title?.value??"",intro:r.intro?.value??"",hearts:b,relics:g,pageIds:w,pageCells:c,rows:l.length,cols:o,terrain:i,objects:a,player:u,minotaur:d,hazards:T,machines:q,links:ho(i)}}function Me(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let t=e.objects.filter(l=>l==="relic").length,r=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&r.push(`hearts: ${e.hearts}`),e.relics!==t&&r.push(`relics: ${e.relics}`),e.pageIds.length>0&&r.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&r.push(`facing: ${e.hazards.map(l=>l.dir).join(" ")}`),e.machines.length>0&&r.push(`machines: ${e.machines.map(l=>`${l.template}-${l.dir}`).join(" ")}`);let n=new Map(e.hazards.map(l=>[l.at.r*e.cols+l.at.c,l.kind])),s=[];for(let l=0;l<e.rows;l++){let o="";for(let i=0;i<e.cols;i++){let a=l*e.cols+i;e.player.r===l&&e.player.c===i?o+="P":e.minotaur&&e.minotaur.r===l&&e.minotaur.c===i?o+="M":n.has(a)?o+=se[n.get(a)].char:o+=e.objects[a]?lt[e.objects[a]].char:G[e.terrain[a]].char}s.push(o)}return`${r.join(`
`)}

${s.join(`
`)}
`}function mr(e){let t=0;for(let r of e.objects)r==="cake"&&t++;return e.hearts+t}function te(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var ae=(e,t)=>t.r>=0&&t.c>=0&&t.r<e.rows&&t.c<e.cols,O=(e,t)=>t.r*e.level.cols+t.c;var X=(e,t)=>!!t&&e.r===t.r&&e.c===t.c,Se=66,fo=Array.from({length:Se*Se},(e,t)=>({r:Math.floor(t/Se)-1,c:t%Se-1})),po=(e,t)=>e>=-1&&t>=-1&&e<Se-1&&t<Se-1?fo[(e+1)*Se+t+1]:{r:e,c:t},oe=(e,t)=>po(e.r+K[t][0],e.c+K[t][1]),Rt=e=>e.relicsLeft===0;var br=e=>{let t=st(e);return t.terrain=[...e.terrain],t.objects=[...e.objects],t.ownTerrain=t.ownObjects=!0,ze(t),t},st=e=>({level:e.level,terrain:e.terrain,objects:e.objects,ownTerrain:!1,ownObjects:!1,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,ownHeld:!1,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:e.hazards.length>0?[...e.hazards]:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome});function ze(e){e.ownHeld||(e.keys={...e.keys},e.tools={...e.tools},e.gear=[...e.gear],e.ownHeld=!0)}function be(e,t,r){e.ownTerrain||(e.terrain=e.terrain.slice(),e.ownTerrain=!0),e.terrain[t]=r}function Le(e,t,r){e.ownObjects||(e.objects=e.objects.slice(),e.ownObjects=!0),e.objects[t]=r}var re=(e,t)=>ae(e.level,t)?e.terrain[O(e,t)]:"wall",ye=(e,t)=>ae(e.level,t)?e.objects[O(e,t)]:null;function Ee(e,t){let r=e.hazards;for(let n=0;n<r.length;n++){let s=r[n].at;if(s.r===t.r&&s.c===t.c)return!0}return!1}function it(e,t){e.terrain=e.terrain.map(r=>r==="toggle-open"?"toggle-closed":r==="toggle-closed"?"toggle-open":r),e.ownTerrain=!0,t.push({kind:"flipped"})}var yr=new WeakMap;function wr(e){let t=yr.get(e);return t||(t=e.terrain.flatMap((r,n)=>r==="teleport"?[n]:[]),yr.set(e,t)),t}var xr=e=>wr(e).length>1;function Ot(e,t,r,n){let{cols:s}=e.level,l=wr(e.level),o=t.r*s+t.c,i=l.findIndex(a=>a>o);for(let a=0;a<l.length;a++){let u=l[((i<0?0:i)+a)%l.length];if(u===o)continue;let d={r:Math.floor(u/s),c:u%s},h=oe(d,r);if(re(e,h)!=="teleport"&&n(h))return{via:d,to:h}}return null}var gr=new WeakMap;function mo(e){let t=gr.get(e);if(!t){let r=new Map;for(let[n,s]of Object.entries(e.links)){if(e.terrain[s]!=="trap")continue;let l=r.get(s);l?l.push(Number(n)):r.set(s,[Number(n)])}t=r,gr.set(e,t)}return t}function bo(e,t){let r=mo(e.level).get(t);if(!r)return!1;let{cols:n}=e.level;return r.some(s=>{let l={r:Math.floor(s/n),c:s%n};return X(l,e.player)||ye(e,l)==="block"||Ee(e,l)})}var ie=(e,t)=>re(e,t)==="trap"&&!bo(e,t.r*e.level.cols+t.c);function kr(e,t,r){if(!ae(e.level,r))return!1;let n=re(e,r);return G[n].hazard||se[t].crosses===n}var at=(e,t,r)=>kr(e,t,r)&&!ye(e,r)&&!X(r,e.minotaur)&&!X(r,e.cow)&&!Ee(e,r),ut=(e,t,r)=>X(r,e.player)?kr(e,t,r):at(e,t,r);function Ft(e,t,r,n,s=!1){let l=e.hazards[t],o=re(e,l.at);return o==="bomb"?(be(e,O(e,l.at),"floor"),e.hazards.splice(t,1),r.push({kind:"exploded",who:"hazard",at:l.at}),"gone"):(o==="button"?it(e,r):o==="button-red"&&ct(e,O(e,l.at),r,n,s),ie(e,l.at)&&r.push({kind:"held",who:"hazard",at:l.at}),"on")}function ct(e,t,r,n,s=!1){let l=e.level.links[t];if(l===void 0)return;let o=e.level.machines.find(d=>O(e,d.at)===l),i=oe(o.at,o.dir);if(n&&X(i,n))return;if(o.template==="block"){if(!dt(e,i))return;Le(e,O(e,i),"block"),r.push({kind:"cloned",what:"block",at:i}),Ct(e,i,o.dir,n,r,s);return}if(!at(e,o.template,i)||X(i,e.player))return;let a={kind:o.template,at:i,dir:o.dir,home:o.home};e.hazards.length===0&&(e.hazards=[]);let u=e.hazards.length;if(!s){let d=O(e,i);for(;u>0&&O(e,e.hazards[u-1].at)>d;)u--}e.hazards.splice(u,0,a),r.push({kind:"cloned",what:o.template,at:i}),Ft(e,u,r,n,s)}function yo(e,t){let r=e.hazards[t];if(r)return r.at;let n=e.machines.find(s=>s.home===t);return oe(n.at,n.dir)}function Dt(e,t,r){re(e,t)==="popup"&&(be(e,O(e,t),"wall"),r.push({kind:"rose",at:t}))}var go=(e,t,r)=>at(e,t,r)&&re(e,r)!=="bomb"&&!X(r,e.player);function wo(e,t,r){let n=yo(e.level,r),s=new Set([O(e,n)]),l=[n];for(;l.length>0;){let o=l.filter(a=>go(e,t,a)).sort((a,u)=>O(e,a)-O(e,u));if(o.length>0)return o[0];let i=[];for(let a of l)for(let u of _){let d=oe(a,u);!ae(e.level,d)||s.has(O(e,d))||(s.add(O(e,d)),i.push(d))}l=i}return null}function Tr(e,t,r){let n=e.hazards.findIndex(o=>X(t,o.at));if(n<0)return;let s=e.hazards[n];e.hazards.splice(n,1);let l=wo(e,s.kind,s.home);l&&(e.hazards.push({...s,at:l}),e.hazards.sort((o,i)=>O(e,o.at)-O(e,i.at))),r.push({kind:"sent-home",from:t,to:l})}function Re(e,t,r,n){if(e.hearts--,t.push(n?{kind:"caught",at:e.player,hearts:e.hearts,by:r,hazard:n}:{kind:"caught",at:e.player,hearts:e.hearts,by:r}),e.hearts<=0){e.outcome="lost",t.push({kind:"lost"});return}Dt(e,e.player,t),e.player=e.throwBack;let s=null;X(e.player,e.minotaur)&&(s=e.level.minotaur,e.minotaur=s,X(s,e.cow)&&(e.cow=null)),Tr(e,e.player,t),s&&Tr(e,s,t)}function ht(e,t){if(e.outcome!=="playing")return!0;for(let r=0;r<t.length;r++)if(t[r].kind==="caught")return!0;return!1}function It(e,t){return ae(e.level,t)&&G[re(e,t)].minotaur&&ye(e,t)!=="block"&&!Ee(e,t)}function Mr(e,t,r){return e.minotaur=t,ie(e,t)&&r.push({kind:"held",who:"minotaur",at:t}),X(t,e.cow)&&(e.cow=null),X(t,e.player)?(Re(e,r,"minotaur"),!0):!1}function xo(e,t){let r=e.minotaur;if(!r)return!0;if(ie(e,r))return!1;let n=e.cow??e.player,s=null,l=null;if(n.c!==r.c){let a=n.c>r.c?"right":"left",u=oe(r,a);It(e,u)&&(s=a,l=u)}if(!l&&n.r!==r.r){let a=n.r>r.r?"down":"up",u=oe(r,a);It(e,u)&&(s=a,l=u)}if(!s||!l)return!1;if(t.push({kind:"moved",who:"minotaur",from:r,to:l}),Mr(e,l,t))return!0;let o=s,i=null;for(;;){let a=G[re(e,e.minotaur)];if(a.carries)o=a.carries;else if(!a.slides)return!1;i??=new Set([O(e,l)]);let u=oe(e.minotaur,o);if(!It(e,u)||i.has(O(e,u)))return!1;if(t.push({kind:"slid",who:"minotaur",from:e.minotaur,to:u}),i.add(O(e,u)),Mr(e,u,t))return!0}}function Er(e,t){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let r=0;r<2&&e.outcome==="playing";r++)if(xo(e,t))return}}var ko={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function To(e,t,r){return X(e.hazards[t].at,e.player)?(X(e.player,e.cow)&&(e.cow=null),Re(e,r,"hazard",e.hazards[t].kind),"caught"):Ft(e,t,r,void 0,!0)}function Mo(e,t,r){let n=e.hazards[t];if(ie(e,n.at))return"on";let s=n.dir;if(!ut(e,n.kind,oe(n.at,s))){s=void 0;for(let i of se[n.kind].turns){let a=ko[i][n.dir];if(ut(e,n.kind,oe(n.at,a))){s=a;break}}}if(!s)return"on";let l=oe(n.at,s);r.push({kind:"moved",who:"hazard",hazard:n.kind,from:n.at,to:l});let o=null;for(;;){n=e.hazards[t]={kind:n.kind,at:l,dir:s,home:n.home};let i=To(e,t,r);if(i!=="on")return i;let a=G[re(e,l)];if(a.carries)s=a.carries,n.dir!==s&&(n=e.hazards[t]={kind:n.kind,at:n.at,dir:s,home:n.home});else if(!a.slides)return"on";o??=new Set([O(e,l)]);let u=oe(l,s);if(o.has(O(e,u))||!ut(e,n.kind,u))return"on";r.push({kind:"slid",who:"hazard",hazard:n.kind,from:l,to:u}),o.add(O(e,u)),l=u}}function Ar(e,t){if(e.hazards.length!==0){for(let r=0,n=e.hazards.length;r<n;){let s=Mo(e,r,t);if(s==="caught")break;s==="gone"?n--:r++}e.hazards.sort((r,n)=>O(e,r.at)-O(e,n.at))}}function dt(e,t){return ae(e.level,t)&&G[re(e,t)].block&&!ye(e,t)&&!X(t,e.player)&&!X(t,e.minotaur)&&!X(t,e.cow)&&!X(t,e.throwBack)&&!X(t,e.level.minotaur)&&!Ee(e,t)}function jt(e,t,r,n){let s=oe(t,r);if(re(e,s)!=="teleport")return dt(e,s)&&n(s)?{entry:s,to:s}:null;if(X(s,e.player))return null;let l=Ot(e,s,r,o=>dt(e,o)&&n(o));return l&&{entry:s,via:l.via,to:l.to}}function vr(e,t,r,n,s){Le(e,O(e,t),null),Le(e,O(e,r.to),"block"),s.push(n==="pushed"?{kind:"pushed",from:t,to:r.entry}:{kind:"slid",who:"block",from:t,to:r.entry}),r.via&&s.push({kind:"teleported",who:"block",from:r.entry,via:r.via,to:r.to})}function Ct(e,t,r,n,s,l=!1){let o=t,i=r,a=new Set([O(e,o)]);for(n&&a.add(O(e,n));;){let u=re(e,o);if(u==="water"||u==="bomb"){Le(e,O(e,o),null),be(e,O(e,o),u==="water"?"dirt":"floor"),s.push(u==="water"?{kind:"sank",at:o}:{kind:"exploded",who:"block",at:o});return}u==="button"?it(e,s):u==="button-red"&&ct(e,O(e,o),s,n,l),ie(e,o)&&s.push({kind:"held",who:"block",at:o});let d=G[u];if(d.carries)i=d.carries;else if(!d.slides)return;let h=jt(e,o,i,c=>!a.has(O(e,c)));if(!h)return;vr(e,o,h,"slid",s),a.add(O(e,h.to)),o=h.to}}var Eo=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Pr(e,t,r,n){if(!ae(e.level,t)||X(t,e.minotaur))return!1;let s=re(e,t),l=G[s];return Eo.has(s)||s==="teleport"&&!xr(e.level)||s==="gate"&&!Rt(e)||l.needs&&!e.gear.includes(l.needs)||l.door&&e.keys[l.door]<=0?!1:Ee(e,t)||ye(e,t)!=="block"?!0:!n&&!ie(e,t)&&!!jt(e,t,r,()=>!0)}function Gt(e,t,r,n,s){if(!Pr(e,t,r,n))return!1;if(Ee(e,t))return Re(e,s,"hazard",e.hazards.find(o=>X(o.at,t)).kind),!1;let l=G[re(e,t)];if(l.door&&(l.door!=="green"&&(ze(e),e.keys[l.door]--),be(e,O(e,t),"floor"),s.push({kind:"opened",color:l.door,at:t})),ye(e,t)==="block"){let o=jt(e,t,r,()=>!0);vr(e,t,o,"pushed",s),Ct(e,o.to,r,t,s)}return!0}function Ht(e,t,r,n,s){Dt(e,e.player,s),e.player=t;let l=re(e,t);if(l==="bomb")return be(e,O(e,t),"floor"),s.push({kind:"exploded",who:"player",at:t}),Re(e,s,"bomb"),!0;let o=ye(e,t);if(o&&o!=="block"&&(Le(e,O(e,t),null),s.push({kind:"took",what:o,at:t}),o==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):o==="page"?e.pages|=1<<e.level.pageCells.indexOf(O(e,t)):o.startsWith("key-")?(ze(e),e.keys[o.slice(4)]++):o==="mirror"||o==="cake"||o==="cow"?(ze(e),e.tools[o]++):e.gear.includes(o)||(ze(e),e.gear.push(o))),l==="thief"&&e.gear.length>0&&(s.push({kind:"robbed",at:t,gear:e.gear}),e.gear=[]),l==="safe"&&(e.throwBack=t),ie(e,t)&&s.push({kind:"held",who:"player",at:t}),l==="button"?it(e,s):l==="button-red"&&ct(e,O(e,t),s),l==="exit"&&Rt(e)&&(e.outcome="won",s.push({kind:"won"})),l==="teleport"){let i=Ot(e,t,r,a=>Pr(e,a,r,n));return i?Gt(e,i.to,r,n,s)?(s.push({kind:"teleported",who:"player",from:t,via:i.via,to:i.to}),Ht(e,i.to,r,n,s)):!0:!1}return!1}function Ao(e,t,r){let n=t,s=e.player,l=null;for(;e.outcome==="playing";){let o=G[re(e,e.player)];if(o.carries&&!e.gear.includes("suction"))n=o.carries;else if(!o.slides||e.gear.includes(o.slides))return;l??=new Set([O(e,s)]);let i=oe(e.player,n);if(l.has(O(e,i))||!Gt(e,i,n,!0,r)||(r.push({kind:"slid",who:"player",from:e.player,to:i}),l.add(O(e,i)),Ht(e,i,n,!0,r)))return;l.add(O(e,e.player))}}function Bt(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0}function Sr(e,t,r){if(t.kind==="move"){let n=e.player;if(ie(e,n))return!1;let s=oe(n,t.dir),l=re(e,s);if(l==="invisible-wall")return be(e,O(e,s),"wall"),r.push({kind:"revealed",at:s,what:l}),"shown";if(l==="fake-wall"&&(be(e,O(e,s),"floor"),r.push({kind:"revealed",at:s,what:l})),Gt(e,s,t.dir,!1,r))r.push({kind:"moved",who:"player",from:n,to:s}),Ht(e,s,t.dir,!1,r)||Ao(e,t.dir,r);else if(!ht(e,r))return!1}else if(t.kind==="tool"){if(e.tools[t.tool]<=0)return!1;if(t.tool==="cake")e.hearts++;else if(t.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,r.push({kind:"stoned",turns:3});ze(e),e.tools[t.tool]--}return!0}function $t(e,t){return{level:e.level,terrain:!e.ownTerrain||Bt(e.terrain,t.terrain)?t.terrain:e.terrain,objects:!e.ownObjects||Bt(e.objects,t.objects)?t.objects:e.objects,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:Bt(e.hazards,t.hazards)?t.hazards:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome}}function Wt(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let r=st(e),n=[];return Sr(r,t,n)?{state:$t(r,e),events:n}:{state:e,events:[]}}function ft(e,t){return t===e||t.moves===e.moves}function V(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let r=st(e),n=[],s=Sr(r,t,n);if(!s)return{state:e,events:[]};if(s==="shown")return{state:$t(r,e),events:n};let l=t.kind==="tool"&&t.tool==="mirror";return ht(r,n)||Ar(r,n),!l&&!ht(r,n)&&Er(r,n),r.moves++,{state:$t(r,e),events:n}}var vo=["mirror","cake","cow"],Ae=e=>e<=0?0:32-Math.clz32(e),zr=new WeakMap;function ge(e){let t=zr.get(e);return t||zr.set(e,t=Lo(e)),t}function Po(e){let t=new Set,r=[],n=a=>{let u=e.terrain[a];return G[u].block||G[u].door!==void 0||u==="fake-wall"},s=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,l=(a,u)=>a>=0&&u>=0&&a<e.rows&&u<e.cols,o=a=>{t.has(a)||a===s||!n(a)||(t.add(a),r.push(a))};e.objects.forEach((a,u)=>{a==="block"&&(t.add(u),r.push(u))});for(let a of e.machines){let u=a.at.r+K[a.dir][0],d=a.at.c+K[a.dir][1];a.template==="block"&&l(u,d)&&o(u*e.cols+d)}let i=[];for(e.terrain.forEach((a,u)=>{a==="teleport"&&i.push(u)});r.length;){let a=r.pop(),u=Math.floor(a/e.cols),d=a%e.cols,h=G[e.terrain[a]],c=h.slides!==void 0||h.carries!==void 0;for(let p of _){let[f,m]=K[p],b=u+f,g=d+m;if(!l(b,g))continue;let w=u-f,M=d-m;if(!(l(w,M)&&e.terrain[w*e.cols+M]!=="wall")&&!c)continue;let z=b*e.cols+g;if(e.terrain[z]!=="teleport"){o(z);continue}for(let F of i){let q=Math.floor(F/e.cols)+f,L=F%e.cols+m;l(q,L)&&o(q*e.cols+L)}}}return t}var So={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},_t=e=>So[e]??(G[e].door!==void 0?"floor":void 0);function zo(e,t){let r=new Set(t.map(s=>se[s].crosses)),n=[];return e.terrain.forEach((s,l)=>{let o=_t(s);(G[s].hazard||r.has(s)||s==="toggle-closed"||o&&G[o].hazard)&&n.push(l)}),n}function Lo(e){let t=A=>e.objects.filter(y=>y===A).length,r=Po(e),n=[],s=[],l=[],o=[],i=[];e.terrain.forEach((A,y)=>{_t(A)?n.push(y):(A==="toggle-open"||A==="toggle-closed")&&s.push(y);let $=e.objects[y];r.has(y)?($&&$!=="block"?i:o).push(y):$&&l.push(y)});let a=e.rows*e.cols,u=je.map(A=>Ae(t(`key-${A}`))),d=vo.map(A=>Ae(t(A))),h=fr.filter(A=>t(A)>0),c=Ae(a),p=t("cow")>0,f=e.minotaur!==null,m=t("mirror")>0?2:0,b=c*(2+(f?1:0)+(p?1:0))+m,g=Ae(mr(e)),w=b+g+Ae(e.relics),M=[],T=w+e.pageIds.length;for(let A of u)M.push(T),T+=A;let z=[];for(let A of d)z.push(T),T+=A;let F=[...e.hazards.map(A=>A.kind)];for(let A of e.machines)A.home!==void 0&&(F[A.home]=A.template);let q=F.length>e.hazards.length,L=q?0:e.hazards.length,v=q?zo(e,F):[],D=q?Ae(4*F.length):0,C=c*(2+(f?1:0)+(p?1:0))+m+g+Ae(e.relics)+e.pageIds.length+u.reduce((A,y)=>A+y,0)+d.reduce((A,y)=>A+y,0)+h.length+n.length+(s.length?1:0)+l.length+o.length+2*i.length+L*(c+2)+v.length*D,E=T+h.length,S=E+n.length+(s.length?1:0),H=S+l.length+o.length+2*i.length,B=[];for(let A=0;A<a;A++)B.push({r:Math.floor(A/e.cols),c:A%e.cols});return{terrainAt:E,objectsAt:S,hazardsAt:H,cells:B,terrains:new Map,objectLists:new Map,words:Math.max(1,Math.ceil(C/32)),cellBits:c,none:a,minotaur:f,cow:p,stoneBits:m,heartBits:g,relicBits:Ae(e.relics),pageBits:e.pageIds.length,keyBits:u,toolBits:d,gear:h,heartAt:b,pageAt:w,keyAt:M,toolAt:z,gearAt:T,changing:Int32Array.from(n),toggles:Int32Array.from(s),fixed:Int32Array.from(l),blockOnly:Int32Array.from(o),blockOrObject:Int32Array.from(i),hazardSlots:L,hazardCells:Int32Array.from(v),hazardBits:D,homeKinds:F}}function J(e,t,r,n,s){if(n===0)return r;let l=t+(r>>>5),o=r&31;return e[l]|=s<<o,o+n>32&&(e[l+1]|=s>>>32-o),r+n}function Y(e,t,r,n){if(n===0)return 0;let s=t+(r>>>5),l=r&31,o=e[s]>>>l;return l+n>32&&(o|=e[s+1]<<32-l),n===32?o>>>0:o&(1<<n)-1}var ve=(e,t,r)=>t?t.r*e.level.cols+t.c:r,Lr={up:0,down:1,left:2,right:3};function Rr(e,t,r,n,s,l){for(let o=s,i=s+l;o<i;o+=30){let a=Math.min(30,i-o);J(r,n,o,a,Y(e,t,o,a))}}function Ge(e,t,r,n,s,l,o=0){let i=t;for(let b=0;b<i.words;b++)r[n+b]=0;let a=0;a=J(r,n,a,i.cellBits,ve(e,e.player,i.none)),a=J(r,n,a,i.cellBits,ve(e,e.throwBack,i.none)),i.minotaur&&(a=J(r,n,a,i.cellBits,ve(e,e.minotaur,i.none))),i.cow&&(a=J(r,n,a,i.cellBits,ve(e,e.cow,i.none))),a=J(r,n,a,i.stoneBits,e.stone),a=J(r,n,a,i.heartBits,e.hearts),a=J(r,n,a,i.relicBits,e.relicsLeft),a=J(r,n,a,i.pageBits,e.pages);let u=e.keys,d=e.tools;a=J(r,n,a,i.keyBits[0],u.red),a=J(r,n,a,i.keyBits[1],u.blue),a=J(r,n,a,i.keyBits[2],u.yellow),a=J(r,n,a,i.keyBits[3],u.green),a=J(r,n,a,i.toolBits[0],d.mirror),a=J(r,n,a,i.toolBits[1],d.cake),a=J(r,n,a,i.toolBits[2],d.cow);for(let b=0;b<i.gear.length;b++)a=J(r,n,a,1,e.gear.includes(i.gear[b])?1:0);let h=e.terrain,c=e.objects,p=e.level.terrain;if(s&&l&&h===s.terrain)Rr(l,o,r,n,i.terrainAt,i.objectsAt-i.terrainAt);else{for(let b=0;b<i.changing.length;b++){let g=i.changing[b];J(r,n,i.terrainAt+b,1,h[g]===p[g]?0:1)}i.toggles.length&&J(r,n,i.objectsAt-1,1,h[i.toggles[0]]===p[i.toggles[0]]?0:1)}if(s&&l&&c===s.objects)Rr(l,o,r,n,i.objectsAt,i.hazardsAt-i.objectsAt);else{a=i.objectsAt;for(let b=0;b<i.fixed.length;b++)a=J(r,n,a,1,c[i.fixed[b]]?1:0);for(let b=0;b<i.blockOnly.length;b++)a=J(r,n,a,1,c[i.blockOnly[b]]==="block"?1:0);for(let b=0;b<i.blockOrObject.length;b++){let g=c[i.blockOrObject[b]];a=J(r,n,a,2,g==="block"?2:g?1:0)}}a=i.hazardsAt;let f=e.hazards;if(i.hazardSlots>1){for(let b=1;b<f.length;b++)if(ve(e,f[b].at,i.none)<ve(e,f[b-1].at,i.none))throw new Error("the hazards must be sorted by cell")}for(let b=0;b<i.hazardSlots;b++){let g;for(let w=0;w<f.length;w++)if(f[w].home===b){g=f[w];break}a=J(r,n,a,i.cellBits,g?ve(e,g.at,i.none):i.none),a=J(r,n,a,2,g?Lr[g.dir]:0)}let m=0;for(let b=0;b<i.hazardCells.length;b++){let g=i.hazardCells[b],w=f[m],M=w!==void 0&&ve(e,w.at,i.none)===g;a=J(r,n,a,i.hazardBits,M?1+Lr[w.dir]+4*w.home:0),M&&m++}if(i.hazardCells.length&&m!==f.length)throw new Error(`packed ${m} of ${f.length} hazards: they must be sorted by cell`)}var Or=4096;function Fr(e,t,r,n){if(n<=30)return Y(e,t,r,n);let s="";for(let l=r,o=r+n;l<o;l+=30)s+=Y(e,t,l,Math.min(30,o-l))+",";return s}function Ro(e,t,r,n){let s=r.objectsAt-r.terrainAt;if(s===0)return n.terrain;let l=Fr(e,t,r.terrainAt,s),o=r.terrains.get(l);if(o)return o;let i=[...n.terrain];for(let a=0;a<r.changing.length;a++){if(!Y(e,t,r.terrainAt+a,1))continue;let u=r.changing[a];i[u]=_t(n.terrain[u])}if(r.toggles.length&&Y(e,t,r.objectsAt-1,1))for(let a of r.toggles)i[a]=n.terrain[a]==="toggle-open"?"toggle-closed":"toggle-open";return r.terrains.size>=Or&&r.terrains.clear(),r.terrains.set(l,i),i}function Oo(e,t,r,n){let s=r.hazardsAt-r.objectsAt;if(s===0)return n.objects;let l=Fr(e,t,r.objectsAt,s),o=r.objectLists.get(l);if(o)return o;let i=[...n.objects],a=r.objectsAt;for(let u of r.fixed)Y(e,t,a++,1)||(i[u]=null);for(let u of r.blockOnly)i[u]=Y(e,t,a++,1)?"block":null;for(let u of r.blockOrObject){let d=Y(e,t,a,2);a+=2,d===0?i[u]=null:d===2&&(i[u]="block")}return r.objectLists.size>=Or&&r.objectLists.clear(),r.objectLists.set(l,i),i}function pt(e,t,r,n,s=0){let l=r,o=l.cells,i=l.none,a=l.cellBits,u=0,d=o[Y(e,t,u,a)];u+=a;let h=o[Y(e,t,u,a)];u+=a;let c=null,p=null;if(l.minotaur){let y=Y(e,t,u,a);u+=a,c=y===i?null:o[y]}if(l.cow){let y=Y(e,t,u,a);u+=a,p=y===i?null:o[y]}let f=Y(e,t,u,l.stoneBits);u+=l.stoneBits;let m=Y(e,t,u,l.heartBits);u+=l.heartBits;let b=Y(e,t,u,l.relicBits);u+=l.relicBits;let g=Y(e,t,u,l.pageBits);u+=l.pageBits;let w=l.keyBits,M=l.toolBits,T=Y(e,t,u,w[0]);u+=w[0];let z=Y(e,t,u,w[1]);u+=w[1];let F=Y(e,t,u,w[2]);u+=w[2];let q=Y(e,t,u,w[3]);u+=w[3];let L={red:T,blue:z,yellow:F,green:q},v=Y(e,t,u,M[0]);u+=M[0];let D=Y(e,t,u,M[1]);u+=M[1];let C=Y(e,t,u,M[2]);u+=M[2];let E={mirror:v,cake:D,cow:C},S=[];for(let y=0;y<l.gear.length;y++)Y(e,t,u++,1)&&S.push(l.gear[y]);let H=Ro(e,t,l,n),B=Oo(e,t,l,n);u=l.hazardsAt;let A=[];for(let y=0;y<l.hazardSlots;y++){let $=Y(e,t,u,a);u+=a;let R=_[Y(e,t,u,2)];u+=2,$!==i&&A.push({kind:l.homeKinds[y],at:o[$],dir:R,home:y})}A.length>1&&A.sort((y,$)=>y.at.r*n.cols+y.at.c-($.at.r*n.cols+$.at.c));for(let y=0;y<l.hazardCells.length;y++){let $=Y(e,t,u,l.hazardBits);if(u+=l.hazardBits,!$)continue;let R=$-1>>>2;A.push({kind:l.homeKinds[R],at:o[l.hazardCells[y]],dir:_[$-1&3],home:R})}return{level:n,terrain:H,objects:B,player:d,hearts:m,keys:L,gear:S,tools:E,pages:g,throwBack:h,minotaur:c,stone:f,cow:p,hazards:A,relicsLeft:b,moves:s,outcome:"playing"}}var Ir=new Set(["wall","invisible-wall","clone"]);function Fo(e,t,r,n){let s=(u,d)=>u>=0&&d>=0&&u<e.rows&&d<e.cols&&!Ir.has(e.terrain[u*e.cols+d]),l=new Set,o=new Set,i=[],a=(u,d,h)=>{if(!s(u,d))return;let c=(u*e.cols+d)*4+_.indexOf(h);o.has(c)||(o.add(c),l.add(u*e.cols+d),i.push([u,d,h]))};for(a(Math.floor(t/e.cols)+K[r][0],t%e.cols+K[r][1],r);i.length;){let[u,d,h]=i.pop(),c=e.terrain[u*e.cols+d];if(c==="teleport"){for(let m of n){if(m===u*e.cols+d)continue;let b=Math.floor(m/e.cols)+K[h][0],g=m%e.cols+K[h][1];s(b,g)&&e.terrain[b*e.cols+g]!=="teleport"&&a(b,g,h)}continue}let p=G[c],f=p.carries??(p.slides?h:null);f&&a(u+K[f][0],d+K[f][1],f)}return[...l]}function Co(e){let t=e.rows*e.cols,r=e.terrain.map(o=>!Ir.has(o)),n=e.terrain.flatMap((o,i)=>o==="teleport"?[i]:[]),s=Array.from({length:t},()=>[]);for(let o=0;o<t;o++)if(r[o])for(let i of _)for(let a of Fo(e,o,i,n.length>1?n:[]))s[a].push(o);let l=new Uint8Array(t);return e.terrain.forEach((o,i)=>{o==="safe"&&(l[i]=1)}),l[e.player.r*e.cols+e.player.c]=1,{n:t,open:r,into:s,thrown:l}}function Cr(e,t){let r=new Float64Array(e.n).fill(1/0),n=new Int32Array(e.n),s=0;for(let o of t)r[o]===1/0&&(r[o]=0,n[s++]=o);let l=!1;for(let o=0;o<s;o++){let i=n[o],a=r[i]+1;for(let u of e.into[i])r[u]===1/0&&(r[u]=a,n[s++]=u);if(!l&&e.thrown[i]){l=!0;for(let u=0;u<e.n;u++)e.open[u]&&r[u]===1/0&&(r[u]=a,n[s++]=u)}}return r}function Do(e){let t=Co(e),r=e.terrain.flatMap((o,i)=>o==="exit"?[i]:[]),n=Cr(t,r),s=e.objects.flatMap((o,i)=>o==="relic"?[i]:[]),l=s.map(o=>Cr(t,[o]));return o=>{if(o.outcome==="won")return 0;if(o.outcome==="lost")return 1/0;let i=o.player.r*e.cols+o.player.c,a=n[i];if(o.relicsLeft===0)return a;let u=0,d=1/0,h=0;for(let c=0;c<s.length;c++){if(o.objects[s[c]]!=="relic")continue;let p=l[c][i];u++,p<d&&(d=p),p>h&&(h=p)}return u<o.relicsLeft?1/0:Math.max(a,u===o.relicsLeft?h:d)}}var Dr=new WeakMap;function mt(e){let t=Dr.get(e);return t||Dr.set(e,t=Do(e)),t}var He=class extends Error{},Br=1024;function Nt(e,t,r){let n=2538058380;for(let s=0;s<r;s++){let l=Math.imul(e[t+s],3432918353);l=Math.imul(l<<15|l>>>17,461845907),n^=l,n=Math.imul(n<<13|n>>>19,5)+3864292196}return n^=r,n=Math.imul(n^n>>>16,2246822507),n=Math.imul(n^n>>>13,3266489909),(n^n>>>16)>>>0}function bt(e){let t=e,r=Br,n=new Uint32Array(r*t),s=new Uint32Array(r),l=new Int32Array(r),o=new Uint8Array(r),i=new Uint32Array(r),a=0,u=new Int32Array(Br*2),d=u.length-1;function h(){r*=2;let p=new Uint32Array(r*t);p.set(n),n=p;let f=new Uint32Array(r);f.set(s),s=f;let m=new Int32Array(r);m.set(l),l=m;let b=new Uint8Array(r);b.set(o),o=b;let g=new Uint32Array(r);g.set(i),i=g,u=new Int32Array(r*2),d=u.length-1;for(let w=0;w<a;w++){let M=s[w]&d;for(;u[M]!==0;)M=M+1&d;u[M]=w+1}}function c(p,f,m){let b=p*t;for(let g=0;g<t;g++)if(n[b+g]!==f[m+g])return!1;return!0}return{get size(){return a},add(p,f,m,b,g){let w=Nt(p,f,t),M=w&d;for(let z=u[M];z!==0;M=M+1&d,z=u[M]){let F=z-1;if(!(s[F]!==w||!c(F,p,f)))return g>=i[F]?-1:(l[F]=m,o[F]=b,i[F]=g,F)}if(a===r)for(h(),M=w&d;u[M]!==0;)M=M+1&d;let T=a++;return n.set(p.subarray(f,f+t),T*t),s[T]=w,l[T]=m,o[T]=b,i[T]=g,u[M]=T+1,T},words(p,f,m){f.set(n.subarray(p*t,p*t+t),m)},parent:p=>l[p],action:p=>o[p],g:p=>i[p]}}var qe=["mirror","cake","cow"],Oe=_.length,yt=[..._.map(e=>({kind:"move",dir:e})),{kind:"wait"},...qe.map(e=>({kind:"tool",tool:e}))],Kt=[Oe,..._.map((e,t)=>t),...qe.map((e,t)=>Oe+1+t)];function $r(e,t){let r=[];for(let n=t;e.parent(n)>=0;n=e.parent(n))r.push(yt[e.action(n)]);return r.reverse()}function Ut(e,t){return We(Yt(e,t),t.onProgress)}function*Yt(e,t){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let r=t.store??bt(ge(e.level).words),n=l=>{if(l instanceof He)return{solved:!1,explored:r.size,capped:!0,reason:l.message};throw l},s;try{s=Io(e,t,r)}catch(l){return n(l)}for(;;){let l;try{l=s()}catch(o){return n(o)}if("explored"in l)return l;yield l}}function We(e,t){for(;;){let r=e.next();if(r.done)return r.value;t?.(r.value)}}function Io(e,t,r){let{cap:n,refuse:s}=t,l=t.prune??null,o=Math.max(1,t.progressEvery??65536),i=e.level,a=ge(i),u=mt(i),d=new Uint32Array(a.words),h=new Uint32Array(a.words),c=1024,p=new Int32Array(c),f=new Int32Array(c),m=new Int32Array(c),b=new Uint8Array(c),g=new Uint16Array(c),w=new Int32Array(c),M=0,T=E=>{if(E<c)return;for(;c<=E;)c*=2;let S=new Int32Array(c);S.set(p),p=S;let H=new Int32Array(c);H.set(f),f=H;let B=new Int32Array(c);B.set(m),m=B;let A=new Uint8Array(c);A.set(b),b=A;let y=new Uint16Array(c);y.set(g),g=y},z=(E,S)=>p[E]<p[S]||p[E]===p[S]&&(f[E]<f[S]||f[E]===f[S]&&(g[E]>g[S]||g[E]===g[S]&&E<S)),F=E=>{let S=w[E];for(;E>0;){let H=E-1>>1,B=w[H];if(!z(S,B))break;w[E]=B,m[B]=E,E=H}w[E]=S,m[S]=E},q=E=>{if(M===w.length){let S=new Int32Array(w.length*2);S.set(w),w=S}w[M]=E,F(M++)},L=()=>{let E=w[0];m[E]=-1;let S=w[--M];if(M>0){let H=0;for(;;){let B=2*H+1;if(B>=M)break;let A=B+1,y=A<M&&z(w[A],w[B])?A:B;if(!z(w[y],S))break;w[H]=w[y],m[w[H]]=H,H=y}w[H]=S,m[S]=H}return E},v=u(e);if(Ge(e,a,d,0),l&&l({...e,moves:0},d,0))return()=>({solved:!1,explored:0,capped:!1});let D=r.add(d,0,-1,0,0);if(r.size>=n)return()=>({solved:!1,explored:r.size,capped:!0});T(D),f[D]=Number.isFinite(v)?v:-1,p[D]=f[D],m[D]=-1,g[D]=e.hearts,f[D]>=0&&q(D);let C=0;return()=>{let E=null;for(;M>0;){if(E)return E;let S=L();if(b[S])return{solved:!0,line:$r(r,S),explored:r.size};let H=p[S],B=H-f[S];++C%o===0&&(E={expanded:C,stored:r.size,bestF:H,startH:v}),r.words(S,h,0);let A=pt(h,0,a,i,B);for(let y of Kt){if(y>Oe&&A.tools[qe[y-Oe-1]]<=0)continue;let $=V(A,yt[y]),R=$.state;if(ft(A,R)||R.outcome==="lost"||s&&s($.events,A)||(Ge(R,a,d,0,A,h,0),l&&l(R,d,0)))continue;let N=r.size,I=r.add(d,0,S,y,B+1);if(I<0)continue;let ee=R.outcome==="won";if(r.size>N){T(I);let ne=ee?0:u(R);f[I]=Number.isFinite(ne)?ne:-1,m[I]=-1,b[I]=ee?1:0,g[I]=R.hearts}if(ee&&B+1===H)return{solved:!0,line:$r(r,I),explored:r.size};if(r.size>=n)return{solved:!1,explored:r.size,capped:!0};f[I]<0||(p[I]=B+1+f[I],m[I]>=0?F(m[I]):q(I))}}return{solved:!1,explored:r.size,capped:!1}}}function Bo(e,t){for(let r=0;r<e.terrain.length;r++){if(!t(e.terrain[r]))continue;let n=Math.floor(r/e.cols),s=r%e.cols;for(let l of _){let o=n-K[l][0],i=s-K[l][1];if(o<0||i<0||o>=e.rows||i>=e.cols)continue;let a=G[e.terrain[o*e.cols+i]];if(a.slides||a.carries===l)return!0}}return!1}function $o(e,t){let r=e.terrain.flatMap((n,s)=>n==="teleport"?[s]:[]);return r.length<2?!1:r.some(n=>_.some(s=>{let l=Math.floor(n/e.cols)+K[s][0],o=n%e.cols+K[s][1];return l>=0&&o>=0&&l<e.rows&&o<e.cols&&t(e.terrain[l*e.cols+o])}))}var jr=(e,t)=>Bo(e,t)||$o(e,t);function jo(e,t){let r=[];t.heartBits&&r.push({pos:t.heartAt,width:t.heartBits,set:!1}),t.pageBits&&r.push({pos:t.pageAt,width:t.pageBits,set:!0}),je.forEach((s,l)=>{t.keyBits[l]&&!jr(e,o=>G[o].door===s)&&r.push({pos:t.keyAt[l],width:t.keyBits[l],set:!1})}),t.toolBits.forEach((s,l)=>{s&&r.push({pos:t.toolAt[l],width:s,set:!1})});let n=["flippers","fire-boots"];return t.gear.forEach((s,l)=>{n.includes(s)&&!jr(e,o=>G[o].needs===s)&&r.push({pos:t.gearAt+l,width:1,set:!1})}),r}var qt=1024;function gt(e,t){let r=mt(e),n=jo(e,t);if(!n.length)return y=>r(y)===1/0;let s=t.words,l=new Uint32Array(s);for(let y of n)for(let $=y.pos;$<y.pos+y.width;$++)l[$>>>5]|=1<<($&31);let o=[],i=0;for(let y of n)o.push(i),i+=y.width;let a=i+31>>>5,u=n.length,d=Int32Array.from(n,y=>y.pos),h=Int32Array.from(n,y=>y.width),c=Uint8Array.from(n,y=>y.set?1:0),p=Int32Array.from(o),f=Uint32Array.from(l,y=>~y>>>0),m=qt,b=new Uint32Array(m*s),g=new Int32Array(m),w=new Uint32Array(m),M=0,T=new Int32Array(qt*2),z=T.length-1,F=qt,q=new Uint32Array(F*a),L=new Uint32Array(F),v=new Int32Array(F),D=0,C=-1,E=new Uint32Array(s),S=new Uint32Array(a);function H(){m*=2;let y=new Uint32Array(m*s);y.set(b),b=y;let $=new Int32Array(m);$.set(g),g=$;let R=new Uint32Array(m);R.set(w),w=R,T=new Int32Array(m*2),z=T.length-1;for(let N=0;N<M;N++){let I=w[N]&z;for(;T[I]!==0;)I=I+1&z;T[I]=N+1}}function B(y,$){let R=C;if(R>=0)C=v[R];else{if(D===F){F*=2;let N=new Uint32Array(F*a);N.set(q),q=N;let I=new Uint32Array(F);I.set(L),L=I;let ee=new Int32Array(F);ee.set(v),v=ee}R=D++}return q.set(S,R*a),L[R]=y,v[R]=$,R}function A(y,$,R,N){for(let I=0;I<u;I++){let ee=Y(y,$,p[I],h[I]),ne=Y(R,N,p[I],h[I]);if(c[I]?(ee&ne)!==ne:ee<ne)return!1}return!0}return(y,$,R)=>{if(r(y)===1/0)return!0;let N=y.moves;for(let W=0;W<s;W++)E[W]=$[R+W]&f[W];let I=Nt(E,0,s);S.fill(0);for(let W=0;W<u;W++)J(S,0,p[W],h[W],Y($,R,d[W],h[W]));let ee=I&z,ne=-1;for(let W=T[ee];W!==0;ee=ee+1&z,W=T[ee]){let pe=W-1;if(w[pe]!==I)continue;let $e=!0;for(let x=0;x<s&&$e;x++)$e=b[pe*s+x]===E[x];if($e){ne=pe;break}}if(ne<0){if(M===m)for(H(),ee=I&z;T[ee]!==0;)ee=ee+1&z;return ne=M++,b.set(E,ne*s),w[ne]=I,T[ee]=ne+1,g[ne]=B(N,-1),!1}for(let W=g[ne];W>=0;W=v[W])if(L[W]<=N&&A(q,W*a,S,0))return!0;let Te=-1;for(let W=g[ne];W>=0;){let pe=v[W];N<=L[W]&&A(S,0,q,W*a)?(Te<0?g[ne]=pe:v[Te]=pe,v[W]=C,C=W):Te=W,W=pe}return g[ne]=B(N,g[ne]),!1}}var de=2e6,he=e=>e.some(t=>t.kind==="caught");function Ve(e,t=de){return Ut(e,{cap:t,refuse:null,prune:gt(e.level,ge(e.level))})}function Gr(e,t,r=de){return Ut(e,{cap:r,refuse:t,prune:gt(e.level,ge(e.level))})}function fe(e,t,r=de,n={}){return Yt(e,{cap:r,refuse:t,prune:gt(e.level,ge(e.level)),store:n.store,progressEvery:n.every})}var Hr={up:"u",down:"d",left:"l",right:"r"},Vt={mirror:"z",cake:"x",cow:"c"};function Fe(e){return e.map(t=>t.kind==="move"?Hr[t.dir]:t.kind==="wait"?"w":Vt[t.tool]).join("")}function _e(e){let t=[];for(let r of e){let n=_.find(l=>Hr[l]===r),s=Object.keys(Vt).find(l=>Vt[l]===r);if(n)t.push({kind:"move",dir:n});else if(r==="w")t.push({kind:"wait"});else if(s)t.push({kind:"tool",tool:s});else return null}return t}var Zt=e=>e.solved?e.line.length:e.capped?"unknown":"none";function Nr(e,t=de){return We(Go(e,t))}function*Go(e,t=de,r={}){let n=te(e),s=w=>({store:r.store?.(ge(w).words),every:r.every}),l=yield*fe(n,null,t,s(e)),o=Zt(l),i=0;if(l.solved){let w=n;for(let M of l.line){let T=V(w,M);w=T.state,he(T.events,w)&&i++}}let a=Zt(yield*fe(n,he,t,s(e))),u=yield*Ho(e,t,s(e)),d=u===null?"unknown":u?"chase":"solo",h=Xt(e),c=l.solved?Fe(l.line):"";if(!e.minotaur)return{solved:l.solved,shortest:o,explored:l.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:a,catches:i,label:d,naiveWins:h,line:c};let p={...e,minotaur:null},f=yield*fe(te(p),null,t,s(p)),m=Zt(f),b=f.solved?!1:f.capped?null:!1;if(f.solved){let w=n;for(let M of f.line)w=V(w,M).state;b=w.outcome==="won"}let g=typeof o=="number"&&typeof m=="number"?o-m:null;return{solved:l.solved,shortest:o,explored:l.explored,withoutMinotaur:m,minotaurDelta:g,greedyWins:b,catchFree:a,catches:i,label:d,naiveWins:h,line:c}}function Wr(e,t,r,n){let s=new Uint8Array(e.rows*e.cols),l=[t];s[t]=1;for(let o=0;o<l.length;o++){let i=l[o],a=Math.floor(i/e.cols),u=i%e.cols;for(let d of _){let h=a+K[d][0],c=u+K[d][1];if(h<0||c<0||h>=e.rows||c>=e.cols)continue;let p=h*e.cols+c;!s[p]&&r(p)&&(s[p]=1,l.push(p))}if(n?.from(i))for(let d of n.to)!s[d]&&r(d)&&(s[d]=1,l.push(d))}return s}function Kr(e){let t=new Set(e.objects.filter(i=>i!==null));e.machines.some(i=>i.template==="block")&&t.add("block");let r=i=>{let a=G[i];return a.door?t.has(`key-${a.door}`):i==="water"?t.has("block"):i==="toggle-open"||i==="toggle-closed"},n=Wr(e,e.minotaur.r*e.cols+e.minotaur.c,i=>{let a=e.terrain[i];return G[a].minotaur||r(a)||a==="fake-wall"||a==="bomb"}),l=e.terrain.flatMap((i,a)=>i==="teleport"?[a]:[]).flatMap(i=>{let a=Math.floor(i/e.cols),u=i%e.cols;return _.flatMap(d=>{let h=a+K[d][0],c=u+K[d][1];return h<0||c<0||h>=e.rows||c>=e.cols?[]:[h*e.cols+c]})}),o=Wr(e,e.player.r*e.cols+e.player.c,i=>{let a=e.terrain[i],u=G[a];return a==="wall"?!1:u.door?r(a):!u.needs||t.has(u.needs)||r(a)},{from:i=>e.terrain[i]==="teleport",to:l});return!n.some((i,a)=>i===1&&o[a]===1)}function*Ho(e,t=de,r={}){if(!e.minotaur||Kr(e))return!1;let n=ge(e),s=r.store??bt(n.words),l=Math.max(1,r.every??65536);try{let o=new Uint32Array(n.words),i=new Uint32Array(n.words);if(Ge(te(e),n,o,0),s.add(o,0,-1,0,0),s.size>=t)return null;let a=0;for(let u=0;u<s.size;u++){++a%l===0&&(yield{expanded:a,stored:s.size,bestF:0,startH:0}),s.words(u,i,0);let d=pt(i,0,n,e,0);for(let h of Kt){if(h>Oe&&d.tools[qe[h-Oe-1]]<=0)continue;let c=V(d,yt[h]);if(c.events.some(f=>f.kind==="caught"&&f.by==="minotaur"))return!0;let p=c.state;if(!(ft(d,p)||p.outcome!=="playing")&&(Ge(p,n,o,0,d,i,0),s.add(o,0,u,h,0),s.size>=t))return null}}return!1}catch(o){if(o instanceof He)return null;throw o}}var Wo=16;function _o(e,t){let r=e.rows*e.cols,n=new Int32Array(r).fill(-1),s=new Int8Array(r).fill(-1);n[t]=0;let l=[t];for(let o=0;o<l.length;o++){let i=l[o],a=Math.floor(i/e.cols),u=i%e.cols;_.forEach((d,h)=>{let c=a+K[d][0],p=u+K[d][1];if(c<0||p<0||c>=e.rows||p>=e.cols)return;let f=c*e.cols+p;n[f]>=0||e.terrain[f]==="wall"||(n[f]=n[i]+1,s[f]=h,l.push(f))})}return{dist:n,via:s}}function No(e){let t=e.rows*e.cols,r=e.player.r*e.cols+e.player.c,n=[],s=[];for(let m=0;m<t;m++)e.objects[m]==="relic"&&n.push(m),e.terrain[m]==="exit"&&s.push(m);let l=e.relics,o=[r,...n].map(m=>_o(e,m)),i=m=>{let b=-1,g=1/0;for(let w of s){let M=o[m].dist[w];M>=0&&M<g&&(g=M,b=w)}return[b,g]},a=(m,b)=>{let g=o[m].dist[b===0?r:n[b-1]];return g<0?1/0:g},u=null;if(l===0)u=[];else if(n.length<=Wo){let m=n.length,b=new Float64Array((1<<m)*m).fill(1/0),g=new Int8Array((1<<m)*m).fill(-1);for(let T=0;T<m;T++)b[(1<<T)*m+T]=a(0,T+1);let w=1/0,M=-1;for(let T=1;T<1<<m;T++){let z=Ko(T);if(!(z>l))for(let F=0;F<m;F++){let q=b[T*m+F];if(!(!(T&1<<F)||q===1/0)){if(z===l){let L=q+i(F+1)[1];L<w&&(w=L,M=T*m+F);continue}for(let L=0;L<m;L++){if(T&1<<L)continue;let v=(T|1<<L)*m+L,D=q+a(F+1,L+1);D<b[v]&&(b[v]=D,g[v]=F)}}}}if(M>=0){u=[];for(let T=M;;){let z=Math.floor(T/m),F=T%m;if(u.push(F+1),g[T]<0)break;T=(z&~(1<<F))*m+g[T]}u.reverse()}}else{u=[];let m=new Set(n.map((g,w)=>w+1)),b=0;for(;u.length<l;){let g=-1,w=1/0;for(let M of m){let T=a(b,M);T<w&&(w=T,g=M)}if(g<0){u=null;break}u.push(g),m.delete(g),b=g}}if(!u)return null;let d=u.length?u[u.length-1]:0,[h]=i(d);if(h<0)return null;let c=[],p=[0,...u],f=[...u.map(m=>n[m-1]),h];return p.forEach((m,b)=>{let{via:g}=o[m],w=f[b],M=[];for(let T=w;g[T]>=0;){let z=_[g[T]];M.push(z),T-=K[z][0]*e.cols+K[z][1]}c.push(...M.reverse())}),c}function Ko(e){let t=0;for(;e;e&=e-1)t++;return t}function Xt(e){let t=No(e);if(!t)return!1;let r=te(e);for(let n of t)if(r=V(r,{kind:"move",dir:n}).state,r.outcome!=="playing")break;return r.outcome==="won"}var Ce={minotaurDelta:8,exploredTimes:20};function wt(e,t=Ce,r){let n=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let s=e.withoutMinotaur!==null;if(s&&(e.minotaurDelta===null||e.greedyWins===null?n.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&n.push("the Minotaur does not matter: the line that ignores him wins, no longer")),n.push(...Ur(e)),!r)return n;if(!s)return[...n,"a challenge level has a Minotaur"];e.greedyWins!==!1&&n.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<t.minotaurDelta&&n.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${t.minotaurDelta}`);let l=a=>Math.max(0,...r.teaching.map(a)),o=l(a=>a.explored);e.explored<t.exploredTimes*o&&n.push(`a challenge level: stored ${e.explored} situations, the bar is ${t.exploredTimes} × ${o} = ${t.exploredTimes*o}`);let i=l(a=>typeof a.shortest=="number"?a.shortest:0);return typeof e.shortest=="number"&&e.shortest<i&&n.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${i}`),n}function Ur(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var _r={ramp:{least:1.1,most:1.5},most:2e4};function De(e){return e.terrain.some(t=>t==="fake-wall"||t==="invisible-wall")}function Yr(e,t){return!De(e)||t.explored<=_r.most?[]:[`the level hides walls: stored ${t.explored} situations, the ceiling for a level that hides walls is ${_r.most}`]}var xt={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function qr(e,t=xt){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let r=[];e.naiveWins&&r.push("the plain walk to the exit wins"),r.push(...Ur(e));let n=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=Ce.minotaurDelta,s=n?t.chaseShortest:t.shortest,l=n?t.chaseExplored:t.explored;return e.shortest<s&&r.push(`the quickest win is ${e.shortest} moves, the bar is ${s}`),e.explored<l&&r.push(`the solver searched ${e.explored} situations, the bar is ${l}`),r}var Uo={flippers:e=>e.gear.includes("flippers")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="water","fire-boots":e=>e.gear.includes("fire-boots")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="fire",skates:e=>e.gear.includes("skates")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="ice",suction:e=>e.gear.includes("suction")&&G[e.terrain[e.player.r*e.level.cols+e.player.c]].carries!==void 0,mirror:e=>e.stone>0,cow:e=>e.cow!==null},Yo={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function xe(e,t){let r=[...e.terrain],n=[...e.objects];t(r,n);let s=e.machines.filter(l=>r[l.at.r*e.cols+l.at.c]==="clone");return Q(Me({...e,terrain:r,objects:n,machines:s}))}function kt(e){let t=[],r=o=>`row ${Math.floor(o/e.cols)+1}, column ${o%e.cols+1}`,n=o=>e.terrain[o.player.r*e.cols+o.player.c];for(let o of je){let i=`key-${o}`,a=u=>G[n(u)].door===o;e.objects.includes(i)&&t.push({name:`the ${o} keys`,ignored:[xe(e,(u,d)=>{d.forEach((h,c)=>{h===i&&(d[c]=null)})})],used:a}),e.terrain.some(u=>G[u].door===o)&&t.push({name:`the ${o} doors`,ignored:["wall","floor"].map(u=>xe(e,(d,h)=>{d.forEach((c,p)=>{G[c].door===o&&(d[p]=u)}),h.forEach((c,p)=>{c===i&&(h[p]=null)})})),used:a})}let s=e.objects.filter(o=>o==="relic").length>e.relics;e.objects.forEach((o,i)=>{o==="block"?t.push({name:`the block at ${r(i)}`,ignored:[xe(e,(a,u)=>{u[i]=null,a[i]="wall"}),xe(e,(a,u)=>{u[i]=null})]}):(o==="relic"?s:o!==null&&o!=="cake"&&o!=="page"&&!o.startsWith("key-"))&&t.push({name:`the ${o==="relic"?"spare relic":o} at ${r(i)}`,ignored:[xe(e,(a,u)=>{u[i]=null})],used:o===null?void 0:Uo[o]})});let l=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[o,i,a]of l){if(!e.terrain.some(h=>i.includes(h)))continue;let u=a.map(h=>xe(e,c=>{c.forEach((p,f)=>{i.includes(p)&&(c[f]=h)})})),d=Yo[i[0]];d&&e.objects.includes(d)&&u.push(xe(e,(h,c)=>{c.forEach((p,f)=>{p===d&&(c[f]=null)})})),t.push({name:`the ${o}`,ignored:u})}return e.terrain.some(o=>o==="button"||o==="toggle-open"||o==="toggle-closed")&&t.push({name:"the toggle walls and their button",ignored:[xe(e,o=>{o.forEach((i,a)=>{i==="button"||i==="toggle-open"?o[a]="floor":i==="toggle-closed"&&(o[a]="wall")})})]}),e.terrain.forEach((o,i)=>{let a=d=>{for(let[h,c]of Object.entries(e.links))c===i&&(d[Number(h)]="floor")},u=(d,h,c,p)=>t.push({name:`the ${d} at ${r(i)}`,ignored:[h,...p?[p]:[]].map(f=>xe(e,m=>{m[i]=f,c?.(m)}))});o==="trap"?u("snare","floor",a):o==="fake-wall"?u("fake wall","wall",void 0,"floor"):o==="invisible-wall"?u("invisible wall","floor"):o==="thief"?u("thief","floor"):o==="bomb"?u("bomb","floor"):o==="clone"&&u("clone machine","wall",a)}),e.hazards.forEach((o,i)=>{t.push({name:`the ${se[o.kind].name.toLowerCase()} at ${r(o.at.r*e.cols+o.at.c)}`,ignored:[Q(Me({...e,hazards:e.hazards.filter((a,u)=>u!==i)}))]})}),t}var Vr={explored:1.3};function Zr(e,t,r,n=!1){let s=Ve(te(t),r);if(!s.solved)return s.capped?"capped":"the level cannot be won";if(s.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${s.line.length}`;let l=Gr(te(t),he,r);return l.solved?l.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${l.line.length}`:!n&&e.explored>=Vr.explored*s.explored?`the search falls from ${e.explored} situations to ${s.explored}`:null:l.capped?"capped":"no win without a catch"}function qo(e,t){let r=new Set;for(let n of t.ignored)for(let s=0;s<e.terrain.length;s++)(n.terrain[s]!==e.terrain[s]||n.objects[s]!==e.objects[s])&&r.add(s);return[...r]}function Xr(e,t,r){let n=r.used?[]:qo(e,r);if(!n.length&&!r.used)return!1;let s=te(e),l=o=>o.r*e.cols+o.c;for(let o of _e(t)??[]){if(s=V(s,o).state,r.used?.(s))return!0;let i=l(s.player),a=s.minotaur?l(s.minotaur):-1;for(let u of n)if(i===u||s.terrain[u]!==e.terrain[u]||s.objects[u]!==e.objects[u]||a===u&&e.terrain[u]==="trap")return!0}return!1}function Jr(e,t,r=de,n=!1){return!t.solved||typeof t.catchFree!="number"?[]:kt(e).flatMap(s=>{if(n&&Xr(e,t.line,s))return[];let l=s.ignored.map(o=>Zr(t,o,r,n));return l.some(o=>o!==null&&o!=="capped")?[]:l.includes("capped")?[{unit:s,problem:`${s.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:s,problem:n?`${s.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${t.shortest}`:`${s.name}: ignoring it changes nothing (still ${t.shortest} moves, and the search no ${Vr.explored} × smaller)`}]})}function*Qr(e,t,r=de){if(!t.solved||typeof t.catchFree!="number")return[];let n=[];for(let s of kt(e)){if(yield{expanded:0,stored:0,bestF:0,startH:0},Xr(e,t.line,s))continue;let l=s.ignored.map(o=>Zr(t,o,r,!0));l.some(o=>o!==null&&o!=="capped")||n.push(l.includes("capped")?`${s.name}: the search without it hit its cap, so it is not proved to matter`:`${s.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${t.shortest}`)}return n}function en(e){let t=[["Theseus",e.player]];e.minotaur&&t.push(["the Minotaur",e.minotaur]);for(let n of e.hazards)t.push([`the ${se[n.kind].name.toLowerCase()}`,n.at]);let r=[];for(let[n,s]of t){let l=s.r*e.cols+s.c,o=e.terrain[l],i=e.objects[l];(o!=="floor"||i!==null)&&r.push(`${n} starts on ${i??o} at row ${s.r+1}, column ${s.c+1}: nothing may start under a figure`)}return r}var Ne={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function tn(e){return!e.minotaur||e.objects.includes("mirror")||e.terrain.includes("trap")?!1:Kr(e)}function Vo(e,t){let r=e.level;if(!e.minotaur)return 1/0;let n=e.minotaur.r*r.cols+e.minotaur.c,s=e.player.r*r.cols+e.player.c,l=new Map([[n,0]]),o=[n];for(let i=0;i<o.length;i++){let a=o[i],u=l.get(a);if(a===s)return u;if(u>=t)continue;let d=Math.floor(a/r.cols),h=a%r.cols;for(let c of _){let p=d+K[c][0],f=h+K[c][1];if(p<0||f<0||p>=r.rows||f>=r.cols)continue;let m=p*r.cols+f;l.has(m)||m!==s&&(!G[e.terrain[m]].minotaur||e.objects[m]==="block")||(l.set(m,u+1),o.push(m))}}return 1/0}function Jt(e,t){let r=_e(t.line)??[],n=te(e),s=0,l=0,o=0;for(let i of r)n=V(n,i).state,n.stone>0||!!n.minotaur&&(ie(br(n),n.minotaur)||Vo(n,Ne.reach)<=Ne.reach)?(s++,o=0):l=Math.max(l,++o);return{turns:r.length,live:s,quiet:l}}function rn(e,t,r){if(!e.minotaur||!t.solved||typeof t.shortest!="number")return[];let n=[];t.minotaurDelta!==null&&t.minotaurDelta<1&&n.push("the beast adds no moves: a route that ignores him wins as quickly");let s=Ne[r],l=Jt(e,t);return l.live<s.share*l.turns&&n.push(`the beast is live on ${l.live} of ${l.turns} turns; the bar is ${Math.ceil(s.share*l.turns)}`),l.quiet>s.quiet*l.turns&&n.push(`the beast is quiet for ${l.quiet} turns in a row; the bar is ${Math.floor(s.quiet*l.turns)}`),n}var Zo={walk:"walks round the Minotaur and never uses a tool",cowAtOnce:"sets the cow down as soon as it holds it",cowNear:"sets the cow down when the Minotaur is within 3 steps",mirrorNear:"raises the mirror when the Minotaur is within 2 steps",toolsNear:"sets the cow down and raises the mirror when the Minotaur comes near",careful:"takes the safest step when its next one would be caught",carefulTools:"is careful and sets the cow down and raises the mirror when the Minotaur comes near",cowStuck:"sets the cow down where the Minotaur gets stuck behind a wall short of it",cowStuckCareful:"sets the cow down where the Minotaur gets stuck, raises the mirror when he is near, and is careful"},Xe=Object.keys(Zo),Xo={walk:{cow:"none",mirror:!1,careful:!1},cowAtOnce:{cow:"once",mirror:!1,careful:!1},cowNear:{cow:"near",mirror:!1,careful:!1},mirrorNear:{cow:"none",mirror:!0,careful:!1},toolsNear:{cow:"near",mirror:!0,careful:!1},careful:{cow:"none",mirror:!1,careful:!0},carefulTools:{cow:"near",mirror:!0,careful:!0},cowStuck:{cow:"stuck",mirror:!1,careful:!1},cowStuckCareful:{cow:"stuck",mirror:!0,careful:!0}},Jo=_.map(e=>({kind:"move",dir:e})),Ze={kind:"wait"},Tt=e=>({kind:"tool",tool:e}),Qo=(e,t)=>Math.abs(e.r-t.r)+Math.abs(e.c-t.c),Ke=e=>e.some(t=>t.kind==="caught");function el(e){let t=V(e,Tt("cow"));if(t.state===e||Ke(t.events))return!1;let r=t.state;for(let n=0;n<10;n++){if(t=V(r,Ze),Ke(t.events)||t.state.outcome!=="playing")return!1;r=t.state}return!!r.cow}function tl(e,t){let r=null;for(let n=0;n<e.terrain.length;n++){let s=e.terrain[n];(s==="fake-wall"||s==="invisible-wall")&&(r??=[...e.terrain],r[n]=s==="fake-wall"?"wall":"floor")}return t?{...e,terrain:r??e.terrain}:{...e,terrain:r??e.terrain,minotaur:null,stone:0}}var ln=(e,t)=>t.relicsLeft<e.relicsLeft,sn=(e,t)=>t.outcome==="won",nn=e=>e.keys.red+e.keys.blue+e.keys.yellow+e.keys.green,Mt=(e,t)=>nn(t)>nn(e)||t.gear.length>e.gear.length||t.tools.mirror>e.tools.mirror||t.tools.cow>e.tools.cow||t.tools.cake>e.tools.cake,rl=e=>(t,r)=>r.tools[e]>t.tools[e];function ke(e,t){return on(e,t,!0)??on(e,t,!1)}function on(e,t,r){let n=tl(e,r),s=e.level.cols,l=new Set;for(let u of e.hazards){l.add(u.at.r*s+u.at.c);let[d,h]=K[u.dir];l.add((u.at.r+d)*s+u.at.c+h)}let o=u=>u.player.r*s+u.player.c,i=new Set([o(n)]),a=[];for(let u of _){let d=Wt(n,{kind:"move",dir:u});if(d.state===n||Ke(d.events)||d.state.player===n.player&&d.state.terrain===n.terrain||d.events.some(c=>c.kind==="robbed")||l.has(o(d.state)))continue;if(t(n,d.state))return{first:u,dist:1};let h=o(d.state);i.has(h)||(i.add(h),a.push({s:d.state,first:u}))}for(let u=2;a.length&&u<400;u++){let d=[];for(let{s:h,first:c}of a)for(let p of _){let f=Wt(h,{kind:"move",dir:p});if(f.state===h||Ke(f.events)||f.state.outcome==="lost"||f.events.some(b=>b.kind==="robbed"))continue;let m=o(f.state);if(!l.has(m)){if(t(n,f.state))return{first:c,dist:u};i.has(m)||(i.add(m),d.push({s:f.state,first:c}))}}a=d}return null}function Je(e){let t=e.relicsLeft>0?ke(e,ln)??ke(e,Mt):ke(e,sn)??ke(e,Mt);return t?t.dist:1/0}function nl(e,t){for(let r of t)if(e.objects.some(n=>n===r)){let n=ke(e,rl(r));if(n)return n}return e.relicsLeft>0?ke(e,ln)??ke(e,Mt):ke(e,sn)??ke(e,Mt)}function ol(e,t){let r=e.minotaur,n=r?Qo(r,e.player):1/0;if(e.tools.cake>0&&e.hearts<=1)return Tt("cake");if(t.cow!=="none"&&e.tools.cow>0&&!e.cow&&(t.cow==="stuck"?el(e):t.cow==="once"||n<=3))return Tt("cow");if(t.mirror&&e.tools.mirror>0&&e.stone===0&&n<=2)return Tt("mirror");let s=[];t.cow!=="none"&&s.push("cow"),t.mirror&&s.push("mirror");let l=nl(e,s),o=l?{kind:"move",dir:l.first}:Ze;if(o.kind==="move"&&V(e,o).state===e&&(o=Ze),t.careful&&Ke(V(e,o).events)){let i=null,a=1/0;for(let u of[...Jo,Ze]){let d=V(e,u);if(d.state===e||Ke(d.events))continue;let h=Je(d.state);h<a&&(a=h,i=u)}i&&(o=i)}return o}function Qt(e,t,r){let n=Xo[t],s=te(e),l=0;for(;l<r&&s.outcome==="playing";l++){let o=ol(s,n),i=V(s,o);i.state===s&&(i=V(s,Ze)),s=i.state}return{won:s.outcome==="won",turns:l}}var er=e=>4*e+50;function an(e,t){return Xe.filter(r=>Qt(e,r,er(t)).won)}var Ue={detour:1,offRoute:1,away:2,waits:3,traps:3,forced:4},ll=3,sl=e=>Math.max(5e4,2*e.explored),il=e=>Math.max(6e3,e.explored),un=_.map(e=>({kind:"move",dir:e})),cn={kind:"wait"},rr=e=>e.some(t=>t.kind==="caught");function al(e){let t={...e.level,minotaur:null};return{...e,level:t,minotaur:null,stone:0}}function*Qe(e,t,r={spent:0}){let n=_e(t.line)??[],s=Math.max(0,t.minotaurDelta??0),l=0;if(e.minotaur&&n.length){let h=function*(f){if(f.outcome==="won")return 0;let m=yield*fe(al(f),null,sl(t));return r.spent+=m.explored,m.solved?m.line.length:m.capped?NaN:1/0},c=te(e),p=yield*h(c);for(let f of n){let m=V(c,f).state,b=yield*h(m);Number.isFinite(p)&&!Number.isNaN(b)&&b!==p-1&&l++,p=b,c=m}}let o=0,i=0,a=0;{let h=te(e),c=Je(h);for(let p of n){let f=0;for(let g of[...un,cn]){let w=V(h,g);g.kind==="move"&&w.state===h||rr(w.events)||w.state.outcome==="lost"||f++}f===1&&a++,p.kind==="wait"&&i++;let m=V(h,p).state,b=m.outcome==="won"||m.relicsLeft<h.relicsLeft?0:Je(m);p.kind==="move"&&Number.isFinite(c)&&b>c&&o++,c=b===0?Je(m):b,h=m}}let u=0;{let h=te(e);for(let c=0;c<n.length;c++){let p=n[c];if(c%ll===0)for(let f of[...un,cn]){if(f.kind===p.kind&&(f.kind!=="move"||p.kind!=="move"||f.dir===p.dir))continue;let m=V(h,f);if(f.kind==="move"&&m.state===h||rr(m.events)||m.state.outcome!=="playing")continue;let b=yield*fe(m.state,he,il(t));r.spent+=b.explored,!b.solved&&!b.capped&&u++}h=V(h,p).state}}let d=Ue.detour*s+Ue.offRoute*l+Ue.away*o+Ue.waits*i+Ue.traps*u+Ue.forced*a;return{detour:s,offRoute:l,away:o,waits:i,traps:u,forced:a,total:d}}var ul=new Set(["wall","door-red","door-blue","door-yellow","door-green","gate","toggle-closed","fake-wall","invisible-wall","clone"]),tr={most:.5,area:6};function cl(e){let t=e.rows,r=e.cols,n=(d,h)=>d>=0&&h>=0&&d<t&&h<r&&!ul.has(e.terrain[d*r+h]),s=0;for(let d=0;d<t;d++)for(let h=0;h<r;h++)n(d,h)&&s++;let l=new Uint8Array(t*r),o=new Uint8Array(t*r);for(let d=0;d+1<t;d++)for(let h=0;h+1<r;h++)n(d,h)&&n(d+1,h)&&n(d,h+1)&&n(d+1,h+1)&&(l[d*r+h]=1,o[d*r+h]=o[(d+1)*r+h]=o[d*r+h+1]=o[(d+1)*r+h+1]=1);let i=new Uint8Array(t*r),a=[];for(let d=0;d<t*r;d++){if(!l[d]||i[d])continue;let h=new Set,c=[d];i[d]=1;for(let p=0;p<c.length;p++){let f=c[p],m=Math.floor(f/r),b=f%r;h.add(f),h.add(f+1),h.add(f+r),h.add(f+r+1);for(let[g,w]of[[1,0],[-1,0],[0,1],[0,-1]]){let M=m+g,T=b+w,z=M*r+T;M>=0&&T>=0&&M<t&&T<r&&l[z]&&!i[z]&&(i[z]=1,c.push(z))}}a.push({cells:[...h].sort((p,f)=>p-f)})}let u=0;for(let d of o)u+=d;return{open:s,share:s?u/s:0,areas:a}}function dl(e,t){let r=e.cols,n=new Set([e.player.r*r+e.player.c,...e.hazards.map(l=>l.at.r*r+l.at.c)]);e.minotaur&&n.add(e.minotaur.r*r+e.minotaur.c);let s=[...e.terrain];for(let l of t){let o=Math.floor(l/r),i=l%r;o%2===0&&i%2===0&&s[l]==="floor"&&e.objects[l]===null&&!n.has(l)&&(s[l]="wall")}return Q(Me({...e,terrain:s}))}function*hl(e,t){let r=yield*fe(te(e),he,t);if(!r.solved)return null;let n=0;if(e.minotaur){let s=yield*fe(te({...e,minotaur:null}),null,t);if(!s.solved)return null;n=r.line.length-s.line.length}return yield*Qe(e,{line:Fe(r.line),minotaurDelta:n,explored:r.explored})}var fl=(e,t)=>`row ${Math.floor(t/e.cols)+1}, column ${t%e.cols+1}`;function*hn(e,t,r){let n=cl(e),s=[];n.share>tr.most&&s.push({rule:"open",words:`Too open: ${Math.round(100*n.share)}% of the floor is open space (at most ${Math.round(100*tr.most)}%)`});for(let l of n.areas){if(l.cells.length<tr.area)continue;let o=dl(e,l.cells);if(o.terrain.every((a,u)=>a===e.terrain[u]))continue;let i=yield*hl(o,r);i&&i.total>=t.total&&s.push({rule:"open-area",words:`An open area near ${fl(e,l.cells[0])} does not earn its place: walled into corridors, the level is as hard (${i.total} against ${t.total})`,mended:o})}return s}var pl={walk:"The plain walk wins: walking to each relic and the exit, round the Minotaur, clears it",cowAtOnce:"The cow habit wins: setting the cow down at once and walking clears it",cowNear:"The cow habit wins: setting the cow down when the Minotaur comes near clears it",mirrorNear:"The mirror habit wins: raising the mirror when the Minotaur comes near clears it",toolsNear:"The tool habit wins: using the cow and the mirror when the Minotaur comes near clears it",careful:"The careful walk wins: stepping aside whenever the Minotaur would catch clears it",carefulTools:"The careful walk with tools wins: stepping aside and using the tools when he is near clears it",cowStuck:"The cow habit wins: setting the cow down where the Minotaur gets stuck clears it",cowStuckCareful:"The cow habit wins: setting the cow down where he gets stuck and stepping aside clears it"};function fn(e,t){return typeof t.shortest!="number"?[]:Xe.filter(r=>Qt(e,r,er(t.shortest)).won).map(r=>({rule:`habit:${r}`,words:pl[r]}))}var dn=(e,t)=>Q(Me({...e,objects:e.objects.map(r=>r===t?null:r)}));function*pn(e,t,r,n){let s=[];if(typeof t.shortest!="number")return s;for(let l of["cow","mirror"]){if(!e.objects.includes(l))continue;let o=yield*fe(te(dn(e,l)),he,n);o.solved&&o.line.length<=t.shortest&&s.push({rule:`tool:${l}`,words:`The ${l} is not needed: without it the level is won in ${o.line.length} moves`,mended:dn(e,l)})}if(r==="hard"&&e.objects.includes("cow")){let l=te(e);for(let o of _e(t.line)??[]){if(l.tools.cow>0&&!l.cow){let i=V(l,{kind:"tool",tool:"cow"});!rr(i.events)&&i.state!==l&&(yield*fe(i.state,he,n)).solved&&s.push({rule:"tool:cow-early",words:"The cow works too early: setting it down as soon as it is held still wins"});break}l=V(l,o).state}}return s}function nr(e,t=0){let r=3735928559^t,n=1103547991^t;for(let s=0;s<e.length;s++){let l=e.charCodeAt(s);r=Math.imul(r^l,2654435761),n=Math.imul(n^l,1597334677)}return r=Math.imul(r^r>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),n=Math.imul(n^n>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),[r>>>0,n>>>0]}function or(...e){return nr(e.join(""))[0]}function mn(...e){let t=e.join(""),[r,n]=nr(t),[s,l]=nr(t,2654435769),o=r,i=n,a=s,u=l|1,d=()=>{let c=(o+i|0)+u|0;return u=u+1|0,o=i^i>>>9,i=a+(a<<3)|0,a=a<<21|a>>>11,a=a+c|0,(c>>>0)/4294967296};for(let c=0;c<12;c++)d();let h=c=>Math.floor(d()*c);return{next:d,int:h,pick:c=>c[h(c.length)],shuffle(c){let p=[...c];for(let f=p.length-1;f>0;f--){let m=h(f+1);[p[f],p[m]]=[p[m],p[f]]}return p}}}var Et={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function lr(e){return Object.keys(Et).filter(t=>Et[t]<=e)}var Ye=["fake","invisible"],ue={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},Ie=["up","down","left","right"];function ml(e,t,r){let n=e.length,s=e[0].length;return t<=0||r<=0||t>=n-1||r>=s-1||e[t][r]!=="#"?!1:e[t-1][r]!=="#"&&e[t+1][r]!=="#"&&e[t][r-1]!=="#"&&e[t][r+1]!=="#"}function yn(e,t,r){let n=e[t][r];e[t][r]=".";let s=Ie.some(l=>ml(e,t+ue[l][0],r+ue[l][1]));return e[t][r]=n,!s}function gn(e,t){let{rows:r,cols:n}=t;if(r%2===0||n%2===0||r<7||n<7)return null;let s=(r-1)/2,l=(n-1)/2,o=Array.from({length:r},()=>Array(n).fill("#")),i=x=>2*Math.floor(x/l)+1,a=x=>2*(x%l)+1,u=s*l;for(let x=0;x<u;x++)o[i(x)][a(x)]=".";let d=x=>{let k=Math.floor(x/l),P=x%l,j=[];return k>0&&j.push(x-l),k<s-1&&j.push(x+l),P>0&&j.push(x-1),P<l-1&&j.push(x+1),j},h=(x,k)=>[(i(x)+i(k))/2,(a(x)+a(k))/2],c=[],p=(x,k)=>{let[P,j]=h(x,k);o[P][j]=".",c.push({r:P,c:j})},f=new Uint8Array(u),m=e.int(u);f[m]=1;let b=[m];for(;b.length;){let x=e.next()<t.winding?b.length-1:e.int(b.length),k=b[x],P=d(k).filter(Z=>!f[Z]);if(!P.length){b.splice(x,1);continue}let j=e.pick(P);p(k,j),f[j]=1,b.push(j)}let g=(x,k)=>o[x][k]!=="#",w=x=>Ie.filter(k=>g(i(x)+ue[k][0],a(x)+ue[k][1])).length;for(let x of e.shuffle([...Array(u).keys()])){if(w(x)!==1||e.next()>=t.braid)continue;let k=e.shuffle(d(x).filter(P=>{let[j,Z]=h(x,P);return o[j][Z]==="#"&&yn(o,j,Z)}));k.length&&p(x,k[0])}let M=new Set;for(let x=0;x<t.chambers&&s>2&&l>2;x++){let k=e.int(s-1),P=e.int(l-1);for(let j=2*k+1;j<=2*k+3;j++)for(let Z=2*P+1;Z<=2*P+3;Z++)o[j][Z]==="#"&&(o[j][Z]="."),M.add(j*n+Z)}let T=c.filter(x=>!M.has(x.r*n+x.c));T.length!==c.length&&(c.length=0,c.push(...T));let z=(x,k)=>c.some(P=>P.r===x&&P.c===k),F=()=>{let x=[];for(let k=1;k<r-1;k++)for(let P=1;P<n-1;P++)o[k][P]==="."&&!z(k,P)&&x.push([k,P]);return x},q=(x,k)=>Ie.filter(P=>g(x+ue[P][0],k+ue[P][1])).length===1,L=(x=!1)=>{let k=F();if(!k.length)return null;let P=x?k.filter(([j,Z])=>q(j,Z)):[];return e.pick(P.length?P:k)},v=(x,k=!1)=>{let P=L(k);return P?(o[P[0]][P[1]]=x,!0):!1},D=()=>e.shuffle(c.filter(x=>o[x.r][x.c]===".")),C=x=>{let k=D()[0];return k?(o[k.r][k.c]=x,!0):!1},E=()=>{let x=[];for(let k=1;k<r-1;k++)for(let P=1;P<n-1;P++)o[k][P]==="#"&&(o[k-1][P]==="."&&o[k+1][P]==="."&&o[k][P-1]==="#"&&o[k][P+1]==="#"||o[k][P-1]==="."&&o[k][P+1]==="."&&o[k-1][P]==="#"&&o[k+1][P]==="#")&&x.push([k,P]);return x.length?e.pick(x):null},S=x=>{for(let k of D()){let P=g(k.r-1,k.c)&&g(k.r+1,k.c)?["up","down"]:["left","right"],j=[[k.r,k.c]],Z=2+e.int(3);for(let me of e.shuffle(P)){let ce=k.r,we=k.c;for(;j.length<Z&&(ce+=ue[me][0],we+=ue[me][1],o[ce]?.[we]===".");)j.push([ce,we])}if(!(j.length<2)){for(let[me,ce]of j)o[me][ce]=x;return!0}}return!1},H=new Map,B=new Map,A=x=>{let k=L();return k?(o[k[0]][k[1]]=x,H.set(k[0]*n+k[1],e.pick(Ie)),!0):!1},y=!0;for(let x of t.families){switch(x){case"keys":{let[k,P]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),j=1+e.int(2);for(let Z=0;Z<j;Z++)y=C(k)&&y;for(let Z=0;Z<(k==="G"?1:j);Z++)y=v(P,!0)&&y;break}case"water":y=S("~")&&(e.next()<.5?v("f",!0):v("O"))&&y;break;case"fire":y=S("F")&&v("h",!0)&&y;break;case"ice":{y=S("=")&&y,e.next()<.5&&(y=v("k",!0)&&y);break}case"force":{y=S(e.pick(["^","v","<",">"]))&&y,e.next()<.5&&(y=v("u",!0)&&y);break}case"blocks":{let k=1+e.int(2);for(let P=0;P<k;P++)y=v("O")&&y;break}case"toggle":{let k=1+e.int(2);for(let P=0;P<k;P++)y=C(e.next()<.5?"T":"t")&&y;y=v("_")&&y;break}case"mirror":y=v("z",!0)&&y;break;case"cow":y=v("c",!0)&&y;break;case"gravel":{let k=1+e.int(2);for(let P=0;P<k;P++)y=C(":")&&y;break}case"popup":y=C(";")&&y;break;case"fake":{let k=e.next()<.6?E():null;k?o[k[0]][k[1]]="W":y=C("W")&&y;break}case"invisible":y=(e.next()<.5?C("I"):v("I"))&&y;break;case"snare":y=(e.next()<.5?C("&"):v("&"))&&v("-")&&y;break;case"teleport":y=v("@",!0)&&v("@",!0)&&y;break;case"ball":y=A("o")&&y;break;case"glider":y=A("w")&&y;break;case"fireball":y=A("e")&&y;break;case"thief":y=C("$")&&y;break;case"bomb":y=(e.next()<.5?C("!"):v("!"))&&y;break;case"clone":{let k=!1;for(let P=0;P<60&&!k;P++){let j=1+e.int(r-2),Z=1+e.int(n-2),me=e.pick(Ie),ce=j+ue[me][0],we=Z+ue[me][1];o[j][Z]!=="#"||o[ce]?.[we]!=="."||(o[j][Z]="C",B.set(j*n+Z,`${e.pick(["block","ball","block"])}-${me}`),k=!0)}y=k&&v("+")&&y;break}}if(!y)return null}let $=L();if(!$)return null;o[$[0]][$[1]]="P";let R=bl(o,$),N=[];for(let x=1;x<r-1;x++)o[x][1]==="."&&N.push([x,0,x,1,R[x*n+1]]),o[x][n-2]==="."&&N.push([x,n-1,x,n-2,R[x*n+n-2]]);for(let x=1;x<n-1;x++)o[1][x]==="."&&N.push([0,x,1,x,R[n+x]]),o[r-2][x]==="."&&N.push([r-1,x,r-2,x,R[(r-2)*n+x]]);N.sort((x,k)=>k[4]-x[4]||x[0]-k[0]||x[1]-k[1]);let I=N.filter(x=>x[4]>0).slice(0,Math.max(1,Math.ceil(N.length/3)));if(!I.length)return null;let[ee,ne,Te,W]=e.pick(I);o[ee][ne]="E";for(let x=0;x<t.relics;x++){let k=bn(o,R,.5,1).filter(([ce,we])=>!(ce===Te&&we===W)),P=k.filter(([ce,we])=>q(ce,we)),j=P.length&&e.next()<.7?P:k;if(!j.length)return null;let[Z,me]=e.pick(j);o[Z][me]="*"}let pe=bn(o,R,.25,.6);if(!pe.length)return null;let $e=e.pick(pe);return o[$e[0]][$e[1]]="M",t.relics>0&&e.next()<.5&&o[Te][W]==="."&&!z(Te,W)&&(o[Te][W]="|"),{g:o,doors:c,facing:H,machines:B}}function bl(e,t){let r=e.length,n=e[0].length,s=new Int32Array(r*n).fill(-1);s[t[0]*n+t[1]]=0;let l=[t[0]*n+t[1]];for(let o=0;o<l.length;o++){let i=l[o],a=Math.floor(i/n),u=i%n;for(let d of Ie){let h=a+ue[d][0],c=u+ue[d][1];if(h<=0||c<=0||h>=r-1||c>=n-1)continue;let p=h*n+c;s[p]>=0||e[h][c]==="#"||(s[p]=s[i]+1,l.push(p))}}return s}function bn(e,t,r,n){let s=e.length,l=e[0].length,o=[];for(let i=1;i<s-1;i++)for(let a=1;a<l-1;a++)e[i][a]==="."&&t[i*l+a]>0&&o.push([i,a,t[i*l+a]]);return o.sort((i,a)=>i[2]-a[2]||i[0]-a[0]||i[1]-a[1]),o.slice(Math.floor(o.length*r),Math.ceil(o.length*n)).map(([i,a])=>[i,a])}function Be(e,t){let r=[`title: ${t}`,"intro: "],n=[...e.facing.keys()].sort((l,o)=>l-o);n.length&&r.push(`facing: ${n.map(l=>e.facing.get(l)).join(" ")}`);let s=[...e.machines.keys()].sort((l,o)=>l-o);return s.length&&r.push(`machines: ${s.map(l=>e.machines.get(l)).join(" ")}`),`${r.join(`
`)}

${e.g.map(l=>l.join("")).join(`
`)}
`}var yl=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function wn(e,t){let r=t.g.map(d=>[...d]),n=r.length,s=r[0].length,l=[...t.doors],o=new Map(t.facing),i=d=>{let h=[];for(let c=1;c<n-1;c++)for(let p=1;p<s-1;p++)d(c,p)&&h.push([c,p]);return h},a=(d,h)=>l.some(c=>c.r===d&&c.c===h),u=e.next();if(u<.55){let d=i((c,p)=>yl.has(r[c][p])&&!a(c,p)),h=i((c,p)=>r[c][p]==="."&&!a(c,p));if(d.length&&h.length){let[c,p]=e.pick(d),[f,m]=e.pick(h);r[f][m]=r[c][p],r[c][p]=".";let b=o.get(c*s+p);b&&(o.delete(c*s+p),o.set(f*s+m,b))}}else if(u<.7){let d=l.filter(c=>r[c.r][c.c]!=="."),h=l.filter(c=>r[c.r][c.c]===".");if(d.length&&h.length){let c=e.pick(d),p=e.pick(h);r[p.r][p.c]=r[c.r][c.c],r[c.r][c.c]="."}}else if(u<.8&&o.size)o.set(e.pick([...o.keys()]),e.pick(Ie));else{let d=l.filter(c=>r[c.r][c.c]==="."),h=i((c,p)=>r[c][p]==="#"&&(r[c-1][p]!=="#"&&r[c+1][p]!=="#"&&r[c][p-1]==="#"&&r[c][p+1]==="#"||r[c][p-1]!=="#"&&r[c][p+1]!=="#"&&r[c-1][p]==="#"&&r[c+1][p]==="#")&&yn(r,c,p));if(d.length>1&&(e.next()<.5||!h.length)){let c=e.pick(d);r[c.r][c.c]="#",l=l.filter(p=>p!==c)}else if(h.length){let[c,p]=e.pick(h);r[c][p]=".",l.push({r:c,c:p})}}return{g:r,doors:l,facing:o,machines:new Map(t.machines)}}var xn=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function gl(e,t,r){for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++){let l=t+n,o=r+s;if(l>=0&&o>=0&&l<e.rows&&o<e.cols&&xn(e.terrain[l*e.cols+o])!=="wall")return!1}return!0}function kn(e){return Array.from({length:e.rows-2},(t,r)=>Array.from({length:e.cols-2},(n,s)=>{let l=xn(e.terrain[(r+1)*e.cols+s+1]);return l==="wall"&&gl(e,r+1,s+1)?"":l}))}var wl=e=>e[0].map((t,r)=>e.map(n=>n[r]).reverse()),xl=e=>e.map(t=>[...t].reverse());function At(e){let t=[];for(let r=0,n=e;r<4;r++,n=wl(n))t.push(n,xl(n));return t}function et(e,t){let r=0;for(let n of t){let[s,l]=e.length*e[0].length<=n.length*n[0].length?[e,n]:[n,e],o=s.length,i=s[0].length,a=l.length,u=l[0].length;if(!(o>a||i>u||a-o>2||u-i>2))for(let d=0;d<=a-o;d++)for(let h=0;h<=u-i;h++){let c=0,p=0;for(let f=0;f<o;f++)for(let m=0;m<i;m++){let b=s[f][m],g=l[f+d][m+h];b&&b===g&&c++,(b||g)&&p++}r=Math.max(r,p?c/p:1)}}return r}var Mn=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function sr(e){let t=new Set(e.terrain);return t.has("thief")||t.has("bomb")||t.has("clone")||t.has("button-red")?9:e.hazards.some(r=>r.kind!=="ball")?8:e.hazards.length?7:t.has("teleport")?6:t.has("trap")||t.has("button-brown")?5:t.has("fake-wall")||t.has("invisible-wall")?4:t.has("popup")?3:t.has("gravel")?2:1}var vt=2e3,kl={...xt,explored:vt,chaseExplored:vt},Tl=e=>({teaching:[{explored:Math.ceil(vt/Ce.exploredTimes),shortest:Mn[e-1].shortest}]});function En(e){let t=Mn[e-1];return{explored:vt,shortest:Math.max(xt.chaseShortest,t.shortest)}}var nt=3e4,An=4*nt,Ml={easy:{first:[25,40],plateau:[45,70]},medium:{first:[35,55],plateau:[70,110]},hard:{first:[50,75],plateau:[110,170]}},Pt={least:1.1,most:1.35},tt={least:.7,most:.9},vn=5;function ir(e,t){let r=Ml[t];if(e===null)return{least:r.first[0],most:r.first[1],plateau:!1};let n={least:r.plateau[0],most:r.plateau[1],plateau:!0};if(e>=r.plateau[0])return n;let s=Math.max(r.first[0],Math.ceil(e*Pt.least)),l=Math.min(r.plateau[1],Math.floor(e*Pt.most));return s>=r.plateau[0]?n:{least:s,most:Math.max(l,s+4),plateau:!1}}function Pn(e){return{least:Math.floor(e.least*tt.least),most:Math.max(Math.floor(e.least*tt.most),Math.floor(e.least*tt.least)+4),plateau:e.plateau}}function ot(e){return kn(e).map((t,r)=>t.map((n,s)=>(r+1)%2===0&&(s+1)%2===0?"":n))}function Sn(e){return{features:e.map(t=>At(ot(t)))}}function ar(e){let{rows:t,cols:r}=e,n=(o,i)=>e.terrain[o*r+i]==="wall",s=(o,i)=>4-[n(o-1,i),n(o+1,i),n(o,i-1),n(o,i+1)].filter(Boolean).length,l=[];for(let o=1;o<t-1;o++)for(let i=1;i<r-1;i++){let a=o*r+i,u=4-s(o,i);if(n(o,i)&&u===0&&l.push(`a lone wall at row ${o+1}, column ${i+1}`),!(e.terrain[a]==="floor"&&e.objects[a]===null&&!(e.player.r===o&&e.player.c===i)&&!(e.minotaur?.r===o&&e.minotaur.c===i)&&!e.hazards.some(p=>p.at.r===o&&p.at.c===i))||u<3)continue;let[h,c]=n(o-1,i)?n(o+1,i)?n(o,i-1)?[o,i+1]:[o,i-1]:[o+1,i]:[o-1,i];(u===4||h<=0||c<=0||h>=t-1||c>=r-1||s(h,c)!==2)&&l.push(`a bare pocket at row ${o+1}, column ${i+1}`)}return l}function ur(e,t,r=[]){let n=ot(e),s=[];return t.features.forEach((l,o)=>{let i=et(n,l);i>=.42&&s.push(`its layout repeats campaign level ${o+1}'s (${i.toFixed(2)})`)}),r.forEach((l,o)=>{let i=et(n,At(ot(l)));i>=.42&&s.push(`its layout repeats the run's level ${o+1}'s (${i.toFixed(2)})`)}),s}function zn(e,t,r=[]){let n=ot(e),s=0;for(let l of t.features)s=Math.max(s,et(n,l));for(let l of r)s=Math.max(s,et(n,At(ot(l))));return s}var Tn=e=>e.charAt(0).toUpperCase()+e.slice(1);function Pe(e,t){return t.map(r=>{let n=Tn(r);return e==="purpose"?n=`A useless piece: ${r.slice(0,r.indexOf(":")>0?r.indexOf(":"):r.length)}`:r==="the plain walk to the exit wins"?n="The plain walk wins: walking straight to each relic and the exit clears it":r.startsWith("a challenge level: the line that ignores")?n="The Minotaur can be ignored: the best line without him also wins":r.startsWith("a challenge level: ")?n=Tn(r.slice(19)):e==="threat"?n=`The Minotaur is no threat: ${r}`:e==="tidy"&&(n=`Untidy: ${r}`),{rule:e,words:n}})}function*Ln(e,t,r,n,s=de){let l=[],o=a=>(l.push(...a),!n&&l.length>0);if(!t.solved)return{score:null,problems:Pe("solve",wt(t))};if(o(Pe("challenge",wt(t,Ce,Tl(sr(e))))))return{score:null,problems:l};if(o(Pe("shared",qr(t,kl).filter(a=>!wt(t).includes(a)))))return{score:null,problems:l};if(o(Pe("threat",rn(e,t,"challenge"))))return{score:null,problems:l};if(o(Pe("hidden",Yr(e,t))))return{score:null,problems:l};if(o(Pe("start",en(e))))return{score:null,problems:l};if(o(Pe("tidy",ar(e))))return{score:null,problems:l};if(yield{expanded:0,stored:0,bestF:0,startH:0},o(fn(e,t)))return{score:null,problems:l};let i=yield*Qe(e,t);return o(yield*hn(e,i,s))?{score:i,problems:l}:o(yield*pn(e,t,typeof r=="function"?r(i):r,s))?{score:i,problems:l}:(o(Pe("purpose",yield*Qr(e,t,s))),{score:i,problems:l})}function Rn(e,t,r,n=[]){let s=[];return t.explored>nt&&s.push(`stored ${t.explored} situations, more than ${nt}`),[...s,...ur(e,r,n)]}function On(e,t){return e.total<t.least||e.total>t.most?[`scored ${e.total}, the band is ${t.least} to ${t.most}`]:[]}var Dn=3e6,dr=12,ji=Dn*dr;function El(e){return{parts:dr,budget:e.budget===void 0?Dn:Math.max(1,Math.floor(e.budget/dr))}}var In=12,St=120,Al=.25,vl=8,Pl=60;function Sl(e,t,r,n,s=null,l=!1){let o=lr(t).filter(c=>!Ye.includes(c));r==="hard"&&s!=="cow"&&e.int(vl)!==0&&(o=o.filter(c=>c!=="cow"));let i=o.filter(c=>Et[c]===Math.min(t,9)),a=(r==="hard"?4:3)+e.int(2),u=[];s&&!Ye.includes(s)?u.push(s):i.length&&e.next()<.5&&u.push(e.pick(i)),n&&u.push(s&&Ye.includes(s)?s:e.pick(Ye));for(let c of e.shuffle(o))u.length<a+(n?1:0)&&!u.includes(c)&&u.push(c);let d=l?[15]:[13,15],h=e.next();return{rows:e.pick(d),cols:e.pick(d),families:u,relics:(l?2:1)+e.int(2),winding:.3+.6*e.next(),braid:.45+.5*e.next(),chambers:h<.85?0:h<.97?1:2}}var hr=.6931471805599453;function zt(e){let t=0;for(;e>=2;)e/=2,t++;for(;e<1;)e*=2,t--;let r=(e-1)/(e+1),n=r*r,s=r,l=0;for(let o=1;o<60;o+=2)l+=s/o,s*=n;return 2*l+t*hr}function zl(e){if(!(e>=0))return 1;if(e>60)return 0;let t=0;for(;e>=hr;)e-=hr,t++;let r=1,n=1;for(let s=1;s<30;s++)r*=-e/s,n+=r;for(;t>0;t--)n/=2;return n}var Fn=Math.ceil(nt*1.05),cr=An,Ll=2e3;function Rl(e,t,r,n=()=>0){if(!e.minotaur)return 1/0;let s=ar(e).length;if(s)return 14+s;let l=n(e);if(l>=.42)return 13+10*(l-.42);if(Xt(e))return r(0,"cheap:walk"),12.5;if(tn(e))return r(0,"cheap:penned"),12.5;let o=te(e),i=Ve(o,Fn);if(!i.solved)return r(i.explored,i.capped?"solve:capped":"solve:lost"),i.capped?12:30;r(i.explored,"solve");let a=0,u=En(sr(e));i.explored<u.explored&&(a+=3*zt(u.explored/i.explored)),i.line.length<u.shortest&&(a+=.2*(u.shortest-i.line.length));let d=o,h=0;for(let w of i.line){let M=V(d,w);d=M.state,he(M.events,d)&&h++}a+=3*h;let c=Jt(e,{line:Fe(i.line)});if(a+=6*Math.max(0,Ne.challenge.share-c.live/Math.max(1,c.turns)),a+=6*Math.max(0,c.quiet/Math.max(1,c.turns)-Ne.challenge.quiet),a>0)return a;let p=Ve(te({...e,minotaur:null}),Fn);r(p.explored,"free");let f=0;if(p.solved){f=i.line.length-p.line.length,a+=.4*Math.max(0,Ce.minotaurDelta-f);let w=o;for(let M of p.line)w=V(w,M).state;w.outcome==="won"&&(a+=2)}if(a>0)return a;let m=an(e,i.line.length).length;if(r(Ll*Xe.length,"habits"),m)return 1+.5*Math.min(m,4);let b={spent:0},g=We(Qe(e,{line:Fe(i.line),minotaurDelta:f,explored:i.explored},b)).total;return r(b.spent,"score"),g<t.least&&(a+=3*zt(t.least/Math.max(1,g))),g>t.most&&(a+=3*zt(g/t.most)),a}function Cn(e,t){let r=Me(t),n=r.slice(r.indexOf(`

`)+2).trimEnd().split(`
`).map(o=>[...o]),s=new Map(t.hazards.map(o=>[o.at.r*t.cols+o.at.c,o.dir])),l=new Map(t.machines.map(o=>[o.at.r*t.cols+o.at.c,`${o.template}-${o.dir}`]));return{g:n,doors:e.doors,facing:s,machines:l}}function Ol(e){let t=r=>r.terrain.filter(n=>n==="wall").length;return e.reduce((r,n)=>t(n)<t(r)?n:r)}function Fl(e,t,r,n=!1){let s=t.run.slice(-In),l=e.filter(f=>f.chapter<=t.tier),o=s.map(f=>Q(f.text)),i=l.filter(f=>!s.some(m=>m.text===f.text)&&ur(Q(f.text),{features:[]},o).length===0),a=Bn(t.run)?.score??null,u=ir(Number.MAX_SAFE_INTEGER,t.grade),d=f=>De(Q(f.text))===n,h=[f=>d(f)&&f.score>=r.least&&f.score<=r.most,f=>f.score>=r.least&&f.score<=r.most&&!De(Q(f.text)),f=>a!==null&&f.score>=a*tt.least&&f.score<=a*Pt.most,f=>f.score>=u.least&&f.score<=u.most,()=>!0],c=f=>f[or("endless-bank",t.seed,t.tier,t.grade,t.depth)%f.length],p=l.filter(f=>f.text!==t.run.at(-1)?.text);for(let f of h)for(let m of[i,p]){let b=m.filter(f);if(b.length)return c(b)}if(l.length)return c(l);if(e.length)return c(e);throw new RangeError("the bank is empty")}function Bn(e){for(let t=e.length-1;t>=0;t--)if(!De(Q(e[t].text)))return e[t];return null}function Cl(e,t,r,n,s,l,o,i,a){let u=o.by,d=(f,m="other")=>{o.spent+=f,u&&(u[m]=(u[m]??0)+f,u[m+"#"]=(u[m+"#"]??0)+1)},h=new Map,c=f=>{let m=`${f.cols}:${f.terrain.join(",")}`,b=h.get(m);return b===void 0&&(b=zn(f,n,s),h.set(m,b)),b},p={grade:t.grade,band:t.band,previous:r};for(let f=0;o.spent<l;f++){let m=mn("endless",...e,f),b=gn(m,Sl(m,t.tier,t.grade,t.hides,t.family??null,t.band.least>=Pl));if(!b){d(1e3);continue}let g=v=>{try{return Q(Be(v,""))}catch{return null}},w=new Map,M=(v,D)=>{let C=Be(v,""),E=w.get(C);return E===void 0?(E=Rl(D,t.band,d,c),Number.isFinite(E)&&De(D)!==t.hides&&(E+=4),t.family&&Number.isFinite(E)&&!Dl(D,t.family)&&(E+=4),w.set(C,E)):u&&(u["memo#"]=(u["memo#"]??0)+1),E},T=g(b),z=T?M(b,T):1/0,F=z,q=o.spent,L=St;for(let v=0;v<L&&o.spent<l&&(v===L-1&&z<2&&L<3*St&&(L+=St),!(v===Math.floor(St/3)&&z>=8));v++){if(o.tries++,v%8===0&&i?.({tries:o.tries,spent:o.spent,budget:l}),z===0&&T){let S=Nr(T,cr);d(4*S.explored,"measure");let H=Rn(T,S,n,s),B=null;H.length||(B=We(Ln(T,S,t.grade,!1,cr)),d(B.score?8*S.explored:0,"checks"));let A=H.length?H:B.problems.map(R=>R.words),y=!H.length&&B.problems.length>0&&B.problems.every(R=>R.rule==="purpose"),$=H.length?void 0:B.problems.find(R=>R.mended)?.mended;if($){a?.(`mended: ${A.join("; ")}`),u&&(u["mended#"]=(u["mended#"]??0)+1),b=Cn(b,$),T=g(b),z=T?M(b,T):1/0;continue}if(A.length&&!y){if(a?.(`gate: ${A.join("; ")}`),u)for(let R of A){let N="gate:"+R.replace(/[0-9.,×%]+/g,"N").slice(0,50);u[N]=(u[N]??0)+1}z=1,w.set(Be(b,""),z)}else if(y){d(kt(T).reduce((I,ee)=>I+ee.ignored.length,0)*2*S.explored,"useless");let R=Jr(T,S,cr,!0);if(!R.length){z=1,w.set(Be(b,""),z);continue}a?.(`useless: ${R.map(I=>I.problem).join("; ")}`);let N=Ol(R[0].unit.ignored);b=Cn(b,N),T=g(b),z=T?M(b,T):1/0;continue}else{let R=B.score,N=On(R,t.band);if(!N.length)return{text:Be(b,""),d:S,score:R.total};a?.(`band: ${N.join("; ")}`),u&&(u["gate:band"]=(u["gate:band"]??0)+1),z=.5+3*Math.abs(zt(R.total<t.band.least?t.band.least/Math.max(1,R.total):R.total/t.band.most)),w.set(Be(b,""),z)}}let D=wn(m,b),C=g(D);if(!C)continue;let E=M(D,C);(E<=z||Number.isFinite(E)&&m.next()<zl((E-z)/Al))&&(b=D,T=C,z=E)}a?.(`round ${f}: began ${F.toFixed(2)}, ended ${z.toFixed(2)} from passing, ${o.spent-q} spent`)}return null}function Dl(e,t){let r=l=>e.terrain.includes(l),n=l=>e.objects.includes(l),s=l=>e.hazards.some(o=>o.kind===l);switch(t){case"keys":return e.terrain.some(l=>l.startsWith("door-"));case"water":return r("water");case"fire":return r("fire");case"ice":return r("ice");case"force":return e.terrain.some(l=>l.startsWith("force-"));case"blocks":return n("block")||e.machines.some(l=>l.template==="block");case"toggle":return r("toggle-open")||r("toggle-closed");case"mirror":return n("mirror");case"cow":return n("cow");case"gravel":return r("gravel");case"popup":return r("popup");case"fake":return r("fake-wall");case"invisible":return r("invisible-wall");case"snare":return r("trap");case"teleport":return r("teleport");case"ball":return s("ball");case"glider":return s("glider");case"fireball":return s("fireball");case"thief":return r("thief");case"bomb":return r("bomb");case"clone":return r("clone")}}function $n(e){let t=e.run.at(-1)??null,r=ir(Bn(e.run)?.score??null,e.grade),n=e.depth>1&&lr(e.tier).some(s=>Ye.includes(s))&&or("endless-hides",e.seed,e.tier,e.grade,e.depth)%vn===0;return{band:n?Pn(r):r,hides:n,before:t}}function jn(e,t,r,n={}){let{band:s,hides:l,before:o}=$n(e),{parts:i,budget:a}=El(e);if(!o||t<0||t>=i)throw new RangeError(`no part ${t} of a search for level ${e.depth}`);let u={tries:0,spent:0},d=e.run.slice(-In).map(p=>Q(p.text)),h=Cl([e.seed,e.tier,e.grade,e.depth,"part",t],{tier:e.tier,grade:e.grade,band:s,hides:l},{explored:o.explored},r,d,a,u,n.progress);return{found:h?{text:h.text,explored:h.d.explored,shortest:h.d.shortest,score:h.score,line:h.d.line,from:"made",tries:u.tries,spent:u.spent}:null,...u}}function Gn(e,t,r=0,n=0){let s=$n(e),l=Fl(t,e,s.band,s.hides);return{text:l.text,explored:l.explored,shortest:l.shortest,score:l.score,line:l.line,from:"bank",tries:r,spent:n}}var Il=150;function Hn(e){let t=null;return{receive(r){try{if(r.type==="bank"){e.post({type:"made",id:r.id,made:Gn(r.request,e.banks[r.request.grade],r.tries,r.spent)});return}if(r.type!=="part")return;t??=e.known();let n=-1/0,s=jn(r.request,r.part,t,{progress:l=>{let o=e.now();o-n<Il||(n=o,e.post({type:"progress",id:r.id,progress:l}))}});e.post({type:"part",id:r.id,part:r.part,result:s})}catch(n){e.post({type:"failed",id:r.id,message:n instanceof Error?n.message:String(n)})}}}}var Wn={easy:[{chapter:1,explored:3193,shortest:41,score:26,line:"rrrruurrddddddlldcdrrlluurruuuuuulluurrru",text:`title: 
intro: 

##########E##
#...........#
###.#.#.###G#
#...#.#.....#
#.#.#.#.#.#.#
#.#P....#.#.#
#.#.#####.#.#
#...#~G.....#
#.#.#.###.#~#
#.#...#c..#.#
#.###M#.###.#
#........*..#
#############
`},{chapter:1,explored:2233,shortest:45,score:28,line:"ruuddrrrrrrrrllluuuuurruurrduuuulllluullllllu",text:`title: 
intro: 

#E###########
#.........#.#
#.##.##.###.#
#.....#.M...#
#.###.#.###~#
#........O#.#
##.##.#.#..>#
#....>#.#.#*#
#.#.###...#.#
#~#.#>#f#...#
#.#.....##.##
#...#.#...>.#
##.##.#.###.#
#P...u......#
#############
`},{chapter:1,explored:10946,shortest:41,score:37,line:"uuuullwrzrdrrurrrruuuuuullllllllllrrrrrru",text:`title: 
intro: 

#########E#####
#.#*...M......#
#.#.##.##.###.#
#..O#...G.#...#
###.#.###.#G#*#
#...........#.#
#.####.####.#.#
#.......#.....#
#.##.##...###.#
#.....#z#.....#
#.###...#.###.#
#.....#P......#
###############
`},{chapter:1,explored:3678,shortest:41,score:38,line:"ddllwlluuuuuulllllruduulluurrrrddrruuullu",text:`title: 
intro: 

#####E#######
#..=#|....F.#
#.###F#.###.#
#.*...#.#F.F#
#.###.#=###.#
#...#...#.M.#
###.###=..###
#....O..#...#
#.##.##.###.#
#.......#.#.#
#####.#.#.###
#.#...#....P#
#.###.#.###.#
#........*..#
#############
`},{chapter:1,explored:11380,shortest:47,score:39,line:"uuuuuuuuddrrddrruuuurrlcrddddddllrrddrruurrrrur",text:`title: 
intro: 

###############
#f#~.~..#...#.#
#.#.#.#.#.###.#
#...#.#.#...~.#
#Y#.#.#.#.###.#
#.#c~...#.....#
#.#.###.##.##.E
#y..#*..#.....#
#.#####.#.#.#.#
#P#...#...#.#.#
#.###.###.#.#.#
#...#...#...M.#
#.###.###.#.###
#.........#...#
###############
`},{chapter:1,explored:2441,shortest:48,score:40,line:"ddddllddlllwllllrrddrrdduuruuruuuuuullddlluulldl",text:`title: 
intro: 

#############
#...#.......#
E.#F#.#.###.#
#.#...#F...P#
#~#.###.###.#
#......=..=.#
#M#.#.#.###.#
#.#.#.#=#...#
#.#.#~#.#.#.#
#h....=..u#.#
#.#.##^##.#.#
#.#......~..#
#.#.#.##.##.#
#...#*.^....#
#############
`},{chapter:1,explored:2232,shortest:48,score:44,line:"uurruudduurruullruulrrrrrrrrlllldzdddrrddrrddddr",text:`title: 
intro: 

#############
#..*........#
#.##.##.#####
#..z..._T...#
#.###.#.###.#
#.#...#.....#
###.###.#.###
#...#...#...#
#.###.#####.#
#P..#.....#.#
###.#####.#M#
#...#......|E
#.###.#.###.#
#...#.#.#...#
#############
`},{chapter:1,explored:2226,shortest:64,score:46,line:"uulluurruuuuuullrrllddllddllllllddrrrrrllllldduuuurrrrrruurruuru",text:`title: 
intro: 

##########E##
#.......#...#
#.#.#.#.#.#.#
#.#.#.#..b#.#
#.#.#.#=###.#
#.........#k#
#.#######.#.#
#=..B.*.#...#
#.#######.###
#=#...=.....#
#.#.#.#####.#
#...#..M...P#
#############
`},{chapter:1,explored:10825,shortest:43,score:46,line:"wrruurrurrdddlluuuuuculluullllrrrruurrrrddr",text:`title: 
intro: 

###############
#.............#
#.###.#####.###
#.....#.#.....#
#.###.#.#.#.#F#
#....*.F..#.#.E
#.###.#.#.#...#
#.....#.#...#.#
#.###.#M#.#.#.#
#.#.......#.#.#
###.#.#.#.#...#
#...#.#.#...#c#
#.#.#.###.#F#.#
#.#....P..#h..#
###############
`},{chapter:1,explored:2074,shortest:45,score:51,line:"wrrwlldlluullddllddddrrcrrrrrrlllllllluuuuuul",text:`title: 
intro: 

###############
#...#.........#
###.#.###.#.###
E|#...#P..#...#
#.#.#.#=###.#.#
#...#=..#...#.#
#.#.#.###.#.=##
#.#.......#.#.#
#.##.####...#.#
#O.c.....*#.#.#
#.##.##.###.#.#
#.......M.....#
###############
`},{chapter:1,explored:2455,shortest:48,score:63,line:"wuuuuluurrlldddddddzdrrddlllllluurlddlllluuuuuul",text:`title: 
intro: 

#############
#.#.#....*.z#
#.#.#.###.###
#..=.=#.#.=.#
##.##.#.#.#.#
E.....#.#.#.#
#.###M#.#.#.#
#.......#.#P#
#.#.###...###
#.#...*.#...#
#.###.#####.#
#...........#
#############
`},{chapter:2,explored:2015,shortest:39,score:37,line:"llwrrrruullrrrrrruuuuuuuullddlllluurrru",text:`title: 
intro: 

##########E####
#...........:.#
#.###.#.###.#.#
#.#...#.*...#*#
#.###.#.#####.#
#.....#M......#
###.###.###.#R#
#...#....r..#.#
#.#.#.###.###.#
#.#..O.r......#
#.##.####.###.#
#.R....P......#
###############
`},{chapter:3,explored:2622,shortest:49,score:52,line:"lllllldduuddrrdddddrrdrrrrrrddrrlluullluurruurrrr",text:`title: 
intro: 

###############
#......P#.M...#
#.###R#.#.#.###
#r..#.#...#...#
#.#.#.#.###.###
#.#.........R|E
#...#.#.##.##.#
#r#.#.#...;...#
###...##.######
#...#.........#
###.#.#.###.###
#.....#......*#
###############
`},{chapter:4,explored:2879,shortest:54,score:22,line:"uullllllddllllrrrrdcdlldddduurrddrrrruuddllllddddlllld",text:`title: 
intro: 

#############
#...........#
#.###.#####W#
#c....#.#.#P#
#####.#.#M###
#.#.........#
#.#.###.#.###
#.....#.#*..#
#.#.#.###.###
#.#*#.......#
#.###.#####.#
#.#...#.....#
#####.#.#.###
#|......#...#
#E###########
`},{chapter:4,explored:2489,shortest:42,score:32,line:"lrllllddllddddddrrddllrrzrruurruurrruurrur",text:`title: 
intro: 

###############
#..z...P..#...#
###.#####I#.#.#
#...#.......#.#
#.#...###.#.#.E
#.#=#.#...#O..#
#.#.#...###.#.#
#.....#.=.M.#.#
#.###.#.##.##.#
#..*#...#...#.#
###.#.###.#.#.#
#......O..#...#
###############
`},{chapter:4,explored:2308,shortest:37,score:33,line:"dddddurrrrllddddddllrlrruurrrrddrrrrr",text:`title: 
intro: 

###############
#.#P..........#
#.#.###.#.###.#
#.......#.....#
#.#.###.#.###.#
#.#..*....#...#
#.#W#:#.#.#.###
#.#.#.#.#.....#
#.#...#.#.###.#
#...#.......#.#
#####.#.#.###.#
#M..*.#.#....|E
###############
`},{chapter:5,explored:2003,shortest:106,score:57,line:"llddddllddddddrrrrrruuuuuuddddddllllllrluuuuuullddlluuuulldduurrddddrruurrddddddrrrrrruulllluuddrrrrddllld",text:`title: 
intro: 

###############
#.#........P..#
#.#####.#.#.###
#...#...#.#...#
#.#.#.###.#####
#_#.#.....#...#
#.#M#.#.###.#.#
#.#...#.&*#.#.#
#.#.###.#T#T#.#
#.....#.#.....#
#.#.###.#####.#
#-#...#.......#
##########E####
`},{chapter:5,explored:2844,shortest:74,score:59,line:"lrrrrrddllddllllllrrrrrruurruuuuuuuulllllrrrrrddddddddllddlllrlllluuuuuuul",text:`title: 
intro: 

#############
#...*...M...#
#.###.#.#.#.#
#&....#.#.#.#
Et#######.#.#
#...#.....T.#
#.###.###.#.#
#.#.*P....#.#
#.#.#.###.#.#
#.#.#.#.....#
#.#####.###.#
#...._..#..-#
#############
`},{chapter:6,explored:3557,shortest:40,score:40,line:"llddrrurrllrrzddrrddddddllddllllllddrrrd",text:`title: 
intro: 

#############
#.#y.@#..z..#
#.###...#.###
#.#...#.#...#
#...#.#.#.#.#
#.#.#.....#.#
#.#.#####.#.#
#..P#.....#.#
#.###.#.#.#.#
#@..Y.#M#..y#
#.##.####*#.#
#.........#.#
###.#######.#
#...Y.......#
######E######
`},{chapter:7,explored:14398,shortest:48,score:39,line:"dullddllddrrddrrlluuclllluulllrrrddrrrrddrrddddd",text:`title: 
intro: 
facing: down

#############
#......@#..P#
#.###.#.#.#.#
#.*...#...#o#
#M###.#.###.#
#.#.........#
###.#####.###
#.#.....#..c#
#.#########.#
#.#...#.....#
#.#.#.#####.#
#..@#.#.....#
###########E#
`},{chapter:7,explored:4625,shortest:45,score:63,line:"rruuddlldduurruurruuuurrrwwwwrrrlwwllllluurru",text:`title: 
intro: 
facing: down

#######E#####
#.....F|.o#.#
#.###.###.#.#
#..........*#
#.###.#.#.#.#
#.#...#.#F#F#
#.###.#.#.###
#....h#.....#
###.###.#.###
#P....#.#.M.#
#.#####.#.#.#
#.......#.#.#
#############
`},{chapter:8,explored:5954,shortest:56,score:44,line:"wllrrrrrrlluurruwwwwuddllddrrrruurruullruuluulluuuurrrru",text:`title: 
intro: 
facing: up up

###########E#
#.....#....|#
###.###.###.#
#.#...#v#.#.#
#.#.###.#.###
#...#.....#.#
#.#.#.###.#.#
#.#.#o..#wv.#
###.###.##.##
#....M..#*..#
#.#####.###.#
#.#....*#...#
#####v###.###
#..P...u....#
#############
`},{chapter:8,explored:6603,shortest:43,score:57,line:"ddddrrrrrrrrrrllllrrrruuuuuulllwluuzrruullu",text:`title: 
intro: 
facing: down

#########E#####
#...#w..#|....#
#.#.#.#####.###
#.#.#.T..z....#
#########*###.#
#.#...#..OM...#
#.#.#.#.#.###.#
#.#P#...#.....#
#.....#.#.###*#
#.#_#.#.....#.#
#.#.#.#.#####.#
#.........T...#
###############
`},{chapter:8,explored:12010,shortest:39,score:64,line:"llllwlldddwwwddddddrruuurrrrudlddlwddld",text:`title: 
intro: 
facing: down down

#############
#..........P#
#.###.#####.#
#.#...#.....#
#.#.#.#.#.###
#...#...#.#.#
#.###.#.###*#
#...#.#.M...#
###...#.##.##
#...#.#w#..e#
#.#.#...#.#.#
#.#...#...#.#
########E####
`},{chapter:9,explored:3934,shortest:62,score:27,line:"wddddrllruulluuuulluuuullddddddllrruuuuuurrddddrrddllddddlllld",text:`title: 
intro: 

###############
#.#M......#...#
#.###Y#.#.###.#
#...#.#.#.....#
#.#.#.#.####.##
#.#.#.#...&...#
#.###$###.#.#.#
#.#*..#..y#P#.#
#.###.#.#.#.#.#
#...#.#.#...#.#
###.###.###.###
#.Y......-.y..#
###E###########
`},{chapter:9,explored:3732,shortest:52,score:32,line:"ddddllddllddllddrrrrlllluurruurruulluulluullddlluudl",text:`title: 
intro: 
machines: block-down

#############
#*#......I.P#
E.#^#.###.#.#
#...#..+..#.#
#.###.#.C##.#
#.....#.....#
#.###.###.#.#
#....-#...#.#
#.#.#.#.###.#
#.#.#.......#
#.#.#.#####&#
#...#u.^.*.M#
#############
`},{chapter:9,explored:29965,shortest:61,score:40,line:"ruuruuuullllddllllrrlcrrruulluulluurrllddrrddrruurrrrrruuuulu",text:`title: 
intro: 

##########E##
#.....#.....#
#M#####.###.#
#.v*#...#.#.#
#.#####v#.#.#
#...#.......#
###.#.#####.#
#.........#.#
#.###.###.#.#
#....v#.....#
#.#######.###
#....v...c..#
#####.##.##.#
#!.....P....#
#############
`},{chapter:9,explored:2723,shortest:36,score:47,line:"urruddddlddrwrrrruurrrrdduuuuuuuuuur",text:`title: 
intro: 
machines: ball-left

###############
#...#........|E
###.#.###.###.#
#...........#.#
#.#.#.###.##C.#
#.#.#........+#
#.....##.##.#M#
#.#P#.......#.#
#.#.#.#.#.###.#
#..O..#.#.....#
#.##.##.#.###.#
#.......;.#..*#
###############
`}],medium:[{chapter:1,explored:4979,shortest:42,score:35,line:"wdduurruuuurruuudddrrdddurrrruuullulluullu",text:`title: 
intro: 

#####E#######
#....|..#...#
#.###*#.#.#.#
#...#.#...#.#
###.#.###TG.#
#.#gG.....#.#
#.#.###.###.#
#.#....O...*#
#.#.#.#.#.###
#P..#.#_#...#
#.#######.#t#
#.........#M#
#############
`},{chapter:1,explored:3314,shortest:40,score:42,line:"rruurrllddllllddrrlluulcluuuurrrrdduuuuu",text:`title: 
intro: 

#####E#######
#...t.#.....#
#M###.#.#.#.#
#.....#.#.#.#
#.###.#.#.#.#
#....*#.._..#
#T#####.##.##
#....P......#
#.#.###.###.#
#.#..c#...#.#
#.###.#.#.#.#
#.......#...#
#############
`},{chapter:1,explored:3259,shortest:44,score:51,line:"wwrrrddrrrrddddddlllddlllllrruurrrrrrrrddrrr",text:`title: 
intro: 

###############
#P>..h......#.#
###.#.##.##.#.#
#.#.#.........#
#.#.#.###.##.##
#........O....#
#.###.###.###t#
#M#...........#
#.#.##.##.###.#
#>.F..F.*.*...#
###.##.##.#T###
#_........#..|E
###############
`},{chapter:1,explored:3290,shortest:37,score:52,line:"lluullddddzuuuuuulluuddllllddddlldddd",text:`title: 
intro: 

###############
#.....#*......#
#.###.#.###.###
#..v..v.....#.#
###.#.###.###.#
#...#.#..z....#
#.#.#.#.#.#.###
#.#..M#.#.#..P#
#...#.#v#...#.#
#.#.#.....#.#.#
#.#.#.#.#.#.#.#
#.....#.#.....#
#E#############
`},{chapter:1,explored:2603,shortest:54,score:53,line:"lluulluuuulllrrruulluulllldduudddlruuullrrrrrrddrruuru",text:`title: 
intro: 

##########E####
#*......#...#.#
###.###.#.#M#.#
#..=..#...#...#
###F#.###.#=###
#..F#h=...#...#
#.#.###.#.#.###
#.#.#.#.#.#...#
#.#.#F###.###.#
#.......#...#O#
###.###.###.#.#
#...#...#....P#
###############
`},{chapter:1,explored:17304,shortest:75,score:54,line:"uuuuuurruuuurrrrrrrrrrddddddddlllluullldduurrrddllrruulllddddlruuuurrrrrrrr",text:`title: 
intro: 

###############
#..r..........#
#.#.#.##.####.#
#.#.#...R.....#
#.#.#.####.##.#
#.....#r#.....#
#.##M##.#.###.#
#.#........_..E
#.#t##R##.###.#
#.~...*....O..#
#.####.####.###
#P#.T*~~.~#...#
###############
`},{chapter:1,explored:7042,shortest:54,score:62,line:"lluurrrrrrrllllluuruurruuruurrrrllrrrrlllluuddllzuullu",text:`title: 
intro: 

#####E#########
#.#.....#z....#
#.###.#.#.###.#
#.....#......*#
#.#.#.#.###.#.#
#.#.#.....#.#.#
#.#F##.##.#...#
#.#.........#.#
#.##.######.#.#
#.#...........#
#.#.#####.#.#.#
#.......*.#.#.#
#*#########M#.#
#..P.....F.FF.#
###############
`},{chapter:1,explored:14551,shortest:68,score:71,line:"rruurrllrrddrrrruulluuuculluullllddddlllluuuuuuuuddrrrddrruuuurrrrru",text:`title: 
intro: 

############E##
#*#.#.#.M.....#
#.#=#.#.###.#.#
#..=.=#...#.#.#
#.###*#.#####=#
#.#.......#...#
#.###.###.###.#
#...#.#.......#
#.###.#.#.#.#.#
#.......#.#c#.#
#########.#.#.#
#.........#...#
#######.#.###.#
#....P..#.....#
###############
`},{chapter:1,explored:3098,shortest:61,score:72,line:"ddrruuuullllllllddllddlluuuuuuuurruuuurcrddddddrrrruuurluuulu",text:`title: 
intro: 

########E######
#..c*.....#.#.#
#.#.#.###.#T#.#
#.#.#...#.#.#M#
#F#.#.#.#.*.#.#
#.....#.#.#...#
#.###.#.#.#.###
#.#....*t...._#
#.#.######.##.#
#..F#.........#
#.###.#.#####.#
#.#..O#O...P#.#
#.#.#.#####.#.#
#...#.....#...#
###############
`},{chapter:1,explored:9252,shortest:54,score:76,line:"llddddddrrddrrrrwrrrruuuulluurruulllluulldduulluulllll",text:`title: 
intro: 

###############
E...*.........#
#.###.###.#.#.#
#......F..#.#.#
#.###.#F#.#.#.#
#....P#*#.....#
#.#.#=#.#.###.#
#.#.#O.=..#..h#
#.#.###.#...###
#......O#.#...#
#.#.###.#.###M#
#.#...#.#...#.#
#.###.#.#.###.#
#.#...........#
###############
`},{chapter:1,explored:10455,shortest:52,score:76,line:"ddrrrlrrrrrrrrrrlluuuudduuuzullllrruuuullrrrrrrddddr",text:`title: 
intro: 

###############
#...........#.#
#.#.#.##.##.#.#
#.#M#..*......#
#...#####.#.#.#
#.#.#...#.#.#.#
#.#...#.#.#.#.#
#...#.#*.....|E
#.#.#...###.#.#
#.#...#.#...#.#
#.#.#.#.#.#.#.#
#P..#.....#...#
#.###.###.#.###
#............z#
###############
`},{chapter:1,explored:3645,shortest:82,score:88,line:"llddlluuuulluuluuddrddddlllllluuuuuurruulluurrrrddrluullrrddrruurrddrrddddrruuuzur",text:`title: 
intro: 

###############
#..*..#*......#
#.###.#.#.###.#
#...#...#...#.E
###.###.###...#
#.F........z#.#
#.####.##.#M#.#
#.#.......#*..#
#.#.###.###.###
#.#...#..h#.#.#
#.###.#F#.###.#
#F......#.#..P#
#.###.#.#.#.#.#
#.#...#.#...#.#
###############
`},{chapter:2,explored:2145,shortest:49,score:60,line:"uulllrrrdduuuulluullllddddllddrrlluulluuuuuurrrru",text:`title: 
intro: 

#####E#######
#....|..#.t.#
#.#>###.#.#:#
#.#.......#.#
#.#.#.###.###
#...#..>._..#
#.###.#.###.#
#...:.#>*...#
#.#.#####.#.#
#M#..*....#P#
#.#.####.##.#
#...........#
#############
`},{chapter:3,explored:4725,shortest:50,score:72,line:"uullrruuulllddlrrrllllluuddlllrddrddldulllluuuuuul",text:`title: 
intro: 

###############
E|............#
#.#.###.##.##.#
#.#*=......=.=#
#.###;#######.#
#.#........*..#
#.#.##.##.###.#
#...........#P#
#.###*###.#.#.#
#.........#.#.#
#.#.#.#.#.....#
#.#.#.#.#.#.#.#
#.#.#.###M#.#.#
#.............#
###############
`},{chapter:4,explored:2821,shortest:31,score:31,line:"uurruuddlcllluurruuudddlldllddl",text:`title: 
intro: 

#############
#...........#
#.###*#####.#
#...#.R.#.#.#
#.#.#.#.#.#.#
#.#...#c....#
#...###.###R#
#.#*....#...#
E.#.#W###.#.#
#...#P....#.#
###.###.#.#.#
#.......#M..#
#############
`},{chapter:4,explored:2646,shortest:41,score:37,line:"dddwdddlruurrrrrrrrdduuullullluuuuluullll",text:`title: 
intro: 

#############
E|.....<....#
####.###.##.#
#..=...<..FM#
#.###F##.##.#
#..P..#F..#.#
#.#.#.###.#.#
#.#.#h=*..I.#
#.#.##.##...#
#.<.........#
###.##.##.#.#
#.........#*#
#############
`},{chapter:5,explored:9555,shortest:91,score:102,line:"uurruuuuuulluurruullrrddllddrrddddddlllzllllluuuulluuddrrddddrrrrrrrruuuurrudlluulluurruulu",text:`title: 
intro: 

##########E####
#.#.....#z....#
#.#.#.#.###.#.#
#.#.#.#.#...#.#
#.#.#...#:#####
#*..#.#.#...#.#
#.###.#.###.#*#
#...#&..#.#...#
###.#.#.#.#.#.#
#....M#.#...#.#
#.#.#######.#.#
#.#..-........#
#.#.#.###.###.#
#...#....P....#
###############
`},{chapter:6,explored:2085,shortest:55,score:55,line:"llllllddddddrrrrrrddrrrrlllluurruuddlllluulrddddddlllll",text:`title: 
intro: 

###############
#......P..#.M.#
#.#.#####.#.#.#
#.#.#..-#.#.#@#
#.#.#.#.#.#.#.#
#.#@*.#..*....#
#.###.###.#####
#..........&#.#
#####.#.#####.#
#.#F.F#..h....#
#.###.###.###.#
E|......#...F.#
###############
`},{chapter:6,explored:3474,shortest:47,score:56,line:"dduuruuruurrdddduuuurlllddllrzluulllddddddddddl",text:`title: 
intro: 

#############
#.*@.<#...*.#
#.#.#.#.#.#.#
#.#.#<..#.#.#
#.#.##.##.#M#
#.#.#PW@#z#.#
#...#.#####.#
#.#.#.......#
#<#.###.#.###
#.......#...#
#.###.#####.#
E|........#.#
#############
`},{chapter:7,explored:6032,shortest:37,score:53,line:"ddwuuuullrwluullddllllulldddddrrddlld",text:`title: 
intro: 
facing: up

###############
#...#...#~..#.#
#.#...#.#.#.#.#
#.#.#.#...#...#
#...#.#.#.#.###
#.#..*t.#.....#
#.#.###.#.#.#.#
#........_#P#.#
#.###.###.#.#.#
#...#.#..o..~.#
###.#.#T##.##.#
#.......M.....#
#E#############
`},{chapter:7,explored:6937,shortest:55,score:71,line:"ddllllluuuurruuddlllldddduuuuzuulllllldddduuuurrrrruulu",text:`title: 
intro: 
facing: down

#######E#######
#.#.#.........#
#.#.####.##.#.#
#....*....#.#z#
#.#.#.#.#.#.#.#
#.#.#.#o#.....#
#.#.#F#.#.#.#.#
#.#.#.M.#.#.#.#
###.###F#.#.#.#
#F#F.P..#*#..@#
#.###.###.#.###
#@......#.#...#
#.#.#####.###.#
#.#...........#
###############
`},{chapter:8,explored:9617,shortest:53,score:53,line:"duddrrddddlllllluurrlllwwwwrddlllluuuuuuuurruulluurru",text:`title: 
intro: 
facing: left

###E#########
#..|....#...#
#.#####.#.#.#
#...#~.~~.#.#
###.#.#####.#
#......I..#.#
#.##.##.#.#.#
#.#.....#P#.#
#.#.#####.#.#
#.#.#...~...#
#.#M###.#.#*#
#e#....*#.#.#
#.###.###.#.#
#...........#
#############
`},{chapter:8,explored:4500,shortest:56,score:65,line:"dddddwwwwwwwwwdddddddrruurrddrrrrrruuuuuulluuuurrdduuuuu",text:`title: 
intro: 
facing: up

#############E#
#.#P#.#.....#|#
#.#.#.#.#####.#
#..h#.........#
###.#.###.#.#.#
#...#.#M..#.#*#
#.#.#.#.#...###
#.#.....#.#F.F#
#.#.#####.###.#
#.#.#.....#...#
#.#.#.###.#.#F#
#.#.#....w..#.#
#.#.#.#.##.##.#
#.#..*#..*....#
###############
`},{chapter:8,explored:6402,shortest:45,score:70,line:"wllddllddlldurwldwuuuddddrrddrrdduullddllddrd",text:`title: 
intro: 
facing: right

###############
#...#..P......#
#.#.#.#####.###
#.#...#.....#.#
#.#.#.#.###.#.#
#...#...M.....#
#.###.#.##.##.#
#..e#.#.......#
#.#.#.###.#.###
#.#...#...#...#
#.#.#.###.###.#
#*..#*........#
#:###.###.#.###
#...G.....#...#
##E############
`},{chapter:9,explored:2077,shortest:33,score:53,line:"duddddlwwwwwrllllllddllddrlllddrd",text:`title: 
intro: 
facing: up

###############
#............P#
#.###>#.#.#.#.#
#.#M.>#.#.#.#.#
#.#.#.#.#.#.#.#
#...#...$.....#
###.###.#.###.#
#.......#.#...#
#.###.###.#.#.#
#.....*e#...#.#
###.###.#.###.#
#.....>.......#
####E##########
`},{chapter:9,explored:7492,shortest:57,score:54,line:"ddllllllddrrrrrrrrllrruurlddllrruurruulluulllllluuuurrrru",text:`title: 
intro: 
facing: down

#########E#####
#..e.....|....#
###.#.#.#####.#
#...#.#.......#
#.###.#####.#.#
#...#*.M....#.#
###.#######.#.#
#........P&..!#
#.###.###.###.#
#.........#...#
#.#.#######.#.#
#.#......-..#.#
###############
`},{chapter:9,explored:11372,shortest:35,score:65,line:"llwwwwwwwlllllddllddddlllluuuuuuuul",text:`title: 
intro: 
facing: down
machines: ball-up

###############
#.......#.....#
#.###.#.#####.#
E.....#.#.....#
#.#.###.#.###.#
#.#.#....@....#
#.#.###.#.###C#
#....*..#.#...#
#.###.#...#.###
#....+#e#...#.#
#M###...#.#.#.#
#*....#...#...#
#.##.####.###.#
#@.....P......#
###############
`},{chapter:9,explored:2237,shortest:78,score:78,line:"rrrrrrddrruuuulluuuuddddrrddddlluulluuuuuulldurrddddddrrddrrddddrrlluurruurrur",text:`title: 
intro: 

###############
#.#M..#.>.....#
#.#*#.#.###.#.#
#...#.#>....#.#
###.#.#.#####.#
#...#.&>>.#...#
#####.###.#.###
#P......#.....#
#.#####.#.###.E
#!#....u..#...#
#.#.###.#.#.###
#.#...#.#...#.#
#.#####.#.###.#
#...#..-...*#.#
###############
`}],hard:[{chapter:1,explored:26152,shortest:53,score:53,line:"uuuurrrrddrddddrrddrrlzluuuuurruuuuulluullrrddrrddddr",text:`title: 
intro: 

#############
#......*..#.#
#.#######.#.#
#.>...#.....#
#.###.#####.#
#....h..FO..#
#.###.###.#M#
#O..#>...F#.E
#.#.###.#...#
#P#..>..#F#.#
###.###.#.#.#
#...........#
#.##.####.###
#..........z#
#############
`},{chapter:1,explored:4614,shortest:54,score:55,line:"rruurrddrrlluullddllllzddrrddllddddddlrrrrrrruurrrruur",text:`title: 
intro: 

###############
#M....#...#...#
#.#.###.#.###.#
#.#..P..#..z..#
#.#.#######.#.#
#..u..#...~.#.#
#.###...###.#.#
#.#...#..~....#
#.#.#.#.##.##.#
#..>#.~.#....OE
###.###.#.###.#
#.>.#...#.....#
###.###.#.###.#
#.*......O....#
###############
`},{chapter:1,explored:10308,shortest:77,score:65,line:"llllllrrrrrruuuulluuuuluuuullrcllddrddddrrddddllrruuuulluulllllldduurruuuullu",text:`title: 
intro: 

#E#############
#|....M..c#.#.#
#.#.##.##.#.#.#
#=#.....#.#.#.#
###.###.#.###.#
#.........=.#.#
#.#####.###.#.#
#*....#...#.#.#
###.#.###.#.#.#
#.#.#...#.#...#
#.###Y###.###.#
#.#.#.#*....#.#
#.#Y#.#######.#
#............P#
###############
`},{chapter:1,explored:2219,shortest:48,score:73,line:"rrllrrrruurrrruuuuuullzddddlllllluuuuruurrrrrrrr",text:`title: 
intro: 

#############
#...*......|E
#.##.##.###.#
#......F#...#
#.#.###.#.#.#
#.#.#.#F..#.#
#...#.###.#.#
#.#.......M.#
#.#.#.#####.#
#.#.#......z#
###F###.#####
#.#P........#
#.###.###G###
#.........G.#
#############
`},{chapter:1,explored:18419,shortest:67,score:74,line:"uulllluulluuuuuullllrrrrrrddrrddrruuuullllzllddlldddlldddddddrrllul",text:`title: 
intro: 

###############
#.........t.#.#
#####B#.###*#.#
#.#...#...#.#.#
#.#.#.#.#.#...#
#.#.#...#z..#.#
#...#.#####.#.#
#.#.#..b#.....#
#.#.#.#.#.###t#
#b#.#.#.v...#.#
#.#####.###...#
#....M#.#v#P#_#
E.###.###B###.#
#..*....#v#...#
###############
`},{chapter:1,explored:2455,shortest:59,score:76,line:"uwwulldddddduulluulluuddddddrddrluullluuuulluulldddddddddul",text:`title: 
intro: 

###############
#..~#..^#.....#
#*#.#.#.#.#.#.#
#.#~..#...#u#P#
#.###.#.#.#.#.#
#.#...#F#...#.#
#.#.#.#.#.#.#.#
#..O#*.F^.#h#.#
#.######.##.#.#
E...#.~..f....#
#*#F..###.###.#
#.#.#...#M#.#.#
#.#.#.#.#.#F#.#
#.....#.....#.#
###############
`},{chapter:1,explored:23677,shortest:66,score:94,line:"rrlllluuuuuurruurruulluullrrzddrrdddddddduuuuurrdrrrrlllluuuurruuu",text:`title: 
intro: 

#########E#####
#..z....#|....#
#.#.###.#*###.#
#.#.........#.#
#.###.#F###.#.#
#.Mh..#F......#
###.#...##.##.#
#...#.#.......#
#.#.#.###.#.#.#
#_#.#.~~~~#.#.#
#...#.###.###.#
#.#O.*#.......#
#.#####F#.###T#
#..P....#.....#
###############
`},{chapter:1,explored:3588,shortest:49,score:95,line:"llwllrrrrddddddddrrrruurrddddddllllllluuluuulluul",text:`title: 
intro: 

###############
#....P#.#.#..r#
###.#.#.#.#.#.#
#...#f....F.#.#
###.#.##.##...#
#.........~.#.#
ER###.#.#.###R#
#.#...#.#...#.#
#...#.#.#.#.#.#
#.#.#r.*..#..F#
#.#.#.###.#.#.#
#..*=M#.#...#.#
#F##.##.###.#.#
#=.......~.~~.#
###############
`},{chapter:1,explored:6996,shortest:86,score:112,line:"uuuullrrddddllluurlluuurruuurzruullllllllllllddrrddlldduurruulluurrrrddddddllddllddddl",text:`title: 
intro: 

###############
#.............#
#.###.#######.#
#...#...#..=..#
###.#*#.#.#.#~#
#...#.#...#=#.#
#.###.#.###.#.#
#...M...#...#.#
###.#.###=###.#
#...#...#.#z..#
#.#.#.#.#.###.#
#.#..~#..O.*#.#
#.###.####.##.#
E....~.......P#
###############
`},{chapter:1,explored:2020,shortest:84,score:126,line:"lllllllrlluurruulluuuuuuuurrdduullddddddddrruurrrrrrdddrrurruulluulluzulrddrrrruuuur",text:`title: 
intro: 

###############
#.......#.T.R|E
#.#t###.#.###.#
#.#u#...*.....#
#.#.#.###.###.#
#.#.#^#......*#
#.###^#.###.###
#.#..^....#...#
#.#.#.###.###.#
#...#....M#..z#
###.#####...###
#........O#...#
#.###########.#
#.._.....P^.R.#
###############
`},{chapter:2,explored:9938,shortest:68,score:115,line:"rddrddlldduurruurrrrddrrdddrrddduuuuuullrzrdddwlldlldduullrrrrurrddr",text:`title: 
intro: 

###############
#..P....#.....#
#.##.##.#.#.###
#.........#...#
#F###.#.#.#####
#.#...#.#.....#
###.###.###.#.#
#..h#...~.#.#.#
###.###.###*.F#
#.#.#..*....#.#
#.#.#.###.#.#.E
#..~.....*#M.z#
###.#######.#.#
#....F....:.#.#
###############
`},{chapter:3,explored:3556,shortest:35,score:52,line:"ddrrrruuuuwdullullzddlluuuuulllludl",text:`title: 
intro: 

#############
#.......#.#.#
#*##.##.#.#.#
E.....#.....#
#.###.#.#####
#...#..v#...#
###.#.#...###
#.....#.#.;.#
#.###..v###.#
#.#...#P....#
#.#.###.###.#
#.#......z..#
#M#########v#
#.....#.....#
#############
`},{chapter:4,explored:2295,shortest:55,score:37,line:"rlrruurrdduulluuddddduddddzddlllllluurruuuuuullllddlldl",text:`title: 
intro: 

###############
#.........#...#
#.###.#######.#
#.#.#......z..#
###.#####.#.###
#...W.T.#.#...#
###.###.###.#.#
#...#...#P._#*#
E.#.###;###.###
#.#...#...#...#
#...###.#.#.###
#.#.#...#..M#.#
#.#.#.#####.#.#
#...#.........#
###############
`},{chapter:4,explored:5862,shortest:50,score:52,line:"uuuuuurrrrllwllrrddrrddrrrrrrddllddllzllllddrrddld",text:`title: 
intro: 

#############
#f~....I#...#
#.#.###.#.#.#
#.#...#.#.#.#
#...#.#.#.#.#
#.#.#z....~*#
#.#.#.##.##.#
#P.....~....#
#.###.###.#.#
#FM.......#.#
###.###.#.#.#
#F.h..F.#...#
#.###.#.#####
#...F.#.....#
####E########
`},{chapter:4,explored:7102,shortest:62,score:87,line:"lllluurruulluuddlldrrrrzllllulluuuulluurrllddrrddddllllddddddl",text:`title: 
intro: 

###############
#..*.*M.#...#.#
###.###.#.#.#.#
#.........#=.=#
#.###.#.#####.#
#~..#g#.#z....#
#.###.#.#.###~#
#.......W...#.#
#;##.##=###.#.#
#.#.G.........#
#.#.#####.#####
#.......#....P#
#G###.#.###.###
E|....#.#.....#
###############
`},{chapter:5,explored:13011,shortest:72,score:71,line:"rruuulluurruullllrruurrrrrlllllddllddddlllluurrllddrrrruuuurruuuulllllll",text:`title: 
intro: 

###############
E......*......#
#####=#.##.##.#
#....O#.......#
#.###.#.####&##
#..-..........#
#####.###.#.#.#
#..*#.....#.#.#
#.###.#.###.#.#
#.....#.......#
#.#.#M###.###.#
#.#.#....=.=#.#
#.#.#####*###.#
#...#..P......#
###############
`},{chapter:5,explored:2471,shortest:94,score:112,line:"ddllllddrrrrrruurrrruullrrddddrruuuuuuuuuulllllllluulllldddddduuuuuurrrrddddddrrrruurrrruuuulu",text:`title: 
intro: 

############E##
#.....#.......#
#.###.###T###.#
#...#..~......#
#~#.#*#M#####.#
#.#.#.#.#.....#
#.#.#.#.#*###.#
#.#&........:.#
#.#.#####.###.#
#.#..P#.#f:.#.#
#####.#.###.#.#
#..*..#....-#.#
#.#####.###.#.#
#...._..#.....#
###############
`},{chapter:6,explored:5427,shortest:76,score:95,line:"ddddddddrrrrrrrruuuuuulllllllrrrrrrrddddddllluuruulzludrrddlddrrruuuurrrrddr",text:`title: 
intro: 

###############
#...#.....#...#
#.#.#.###.#.#.#
#.#.#.M..z.@#.#
#.#.#.#######.#
#P..#.#...#...#
#.#.#.#.#####.#
#.#.#..@*.....#
#.#.#*###.###.#
#...#...#.....#
#.#####.#.#.#.#
#.#.....#.#.#|E
#.#.##.##.###.#
#...........#.#
###############
`},{chapter:6,explored:3126,shortest:85,score:161,line:"rlllllllllddlldduuddrrrrddrddlllulldurrurrrddrrrrrwwwllwrrwwwlluulluuuurrddrruurrdddr",text:`title: 
intro: 

###############
#..........P*.#
###.#.#########
#-..#.....#.*M#
#.#####.#.#.#.#
#@....#.#..b#.#
#.###.#.#####.E
#&#.B....*#...#
#:..##.##.#####
#b#........@..#
#.#######.###B#
#.....#...#...#
#.###.#.#####.#
#...#...#...#.#
###############
`},{chapter:7,explored:4191,shortest:82,score:111,line:"lllluulwruullllddlldwwulluwwwwdddduuurrdwurruurrrrddrruuddlllldddddddrrddrrlllllld",text:`title: 
intro: 
facing: left

###############
#.#.....*.#*..#
#.###.###.#.#.#
#..o..#.....#.#
#.#.###.#.#####
#.#.#.#.#..-.P#
#.###.#=#####.#
#.#.#&..M...#=#
#.#.###.###=#.#
#.#...#...#.#=#
#.###.#.#####.#
#.....#...#...#
#########.#####
#....|.....*..#
#####E#########
`},{chapter:7,explored:14240,shortest:78,score:114,line:"uuuullddddllllrrrruuuurrllrlddddllddlllldddwduulluulluuddrrddrrddddrrrrrrrruur",text:`title: 
intro: 
facing: up

###############
#.......#.#...#
#.#####.#.#.#.#
#...#.#.#.#.#.#
###.#.#.#.#.#.#
#*....#...._&P#
#.#######.#t###
#...#.....#...#
#.#.#.#######.#
#.#...#-......#
#.#.#.#.#######
#.#.#*#..M#..|E
#.#.#.#.#####.#
#...#o........#
###############
`},{chapter:8,explored:2744,shortest:43,score:75,line:"uurrrruuuurruurruwwuuulllllwwwwwwwwwwlllllu",text:`title: 
intro: 
facing: down

###E###########
#..|.........*#
#.#####M###.#.#
#.........#.#.#
####.##.#.###.#
#..~~...#.#...#
###.#.###.#.###
#...#.#.......#
#.#####.#.###.#
#.......#..e#O#
#.#######.#.#.#
#...#.....#...#
#.#.#.#.#######
#.#.~P#.......#
###############
`},{chapter:8,explored:17438,shortest:68,score:120,line:"ddrrrruuwwwwwwwwlluudlwrdwrrurrdddrruuuurrwluuddlddddddddrrrruulruur",text:`title: 
intro: 
facing: up

###############
#O...........u#
#.#.#=#.##.##.#
#.#.#=#.#..*..#
#...#...#.#.###
#P#...#.#.#.=.#
#.###.#M#.###.#
#.....#...#.#|E
#.#######.#.#<#
#.#.......#.*.#
#.#.#.#.#.###.#
#.<w#.#.#.....#
#.###.###.###.#
#.#<......#...#
###############
`},{chapter:9,explored:2514,shortest:39,score:73,line:"uuuurrrrddrrurwwwwwrdrruuuulldurruuurrr",text:`title: 
intro: 
facing: left

###############
#.#.M.....#...#
#.#####.#.T.#.#
#.......#.#.#.#
#.#.#.#.#.#...E
#.#.#.#...#.#.#
#####.#.#.#.#.#
#.......#..@..#
#.###.#.#*#.###
#.....#.#.#*.@#
#.###$#...#.###
#...#.*.#..w._#
#.#.#.#.#.###.#
#P#...#.......#
###############
`},{chapter:9,explored:3772,shortest:39,score:81,line:"uuudddrwwlrrlluuuwuuurrrrdwurrluuruuuuu",text:`title: 
intro: 
facing: down

#######E#######
#...#.#|......#
#.#t#.#.###.###
#.#.#.#_......#
#.#.#.#.#I###.#
#.#.!...#...M.#
###.##.##.#.#.#
#*...*.*..#.#.#
#.###$##.####.#
#...#....w..#.#
#.#.#######.###
#.#.#.....#...#
#.#.#.#####.#.#
#P..........#.#
###############
`},{chapter:9,explored:21085,shortest:78,score:85,line:"ddllddrrddlllllrrrlllluuuuuuddddzuulluuuuuuuuddddrrlllluuuulldduurrddddddllddl",text:`title: 
intro: 

###############
#...#_....#...#
#T#R#.#######.#
#*#.#.#.#..M#.#
#.#.#.#.###.#.#
#!............#
###.#.#.#.#####
#...#.#z#...#P#
#.#.#t#.#.#.#.#
E|#.#..*#.#...#
#.#.###.#...###
#.........#...#
#.#####.#####.#
#.#..........r#
###############
`},{chapter:9,explored:3227,shortest:67,score:113,line:"rrllllddrrrrrrrrllddddllllllddwlldudddrruurrdddrrrrrrrrudllllllllld",text:`title: 
intro: 
machines: block-up

###############
#....P....#.#.#
###.#####.#.#.#
#.............#
#.###.###.##.##
#.........#=..#
#.###.###*#.#.#
#.........#.#.#
###.#.###.#.#.#
#...#.........#
#.#...###.##.##
#@#.#.#.=.....#
#...#.#.C####*#
#@#!.M...+....#
####E##########
`}]};var _n=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
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
#S.#.O...###
#S.##M...###
#.#.....S.##
#....#.#.#.#
##...p...#.#
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
`}];var Nn=[{id:"ch2-1",text:`title: The Loose Stone
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
#.#.=:.#=..#
#=:=....:.##
#...##.=.#.#
#==..*#=.M.#
#......=...#
#.#.#..===.#
#:.::.#..###
#.=*#..#=..E
############
`},{id:"ch2-6",text:`title: Water and Fire
intro: A river and a fire cross these ways, with loose stone between them. Flippers and fire boots both lie here, and you will need both; the beast will not wait while you find them.

############
#P:.#~#:#.*#
#...~.O...##
#..#...FF#:#
#f.#.##:..##
##...##.#..#
#*.#.#:..#.#
##F..~h.~###
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
intro: A bronze mirror lies past the beast, in the northeast. Marked stones and loose ones both keep him off you; between them you will have to run. Off the quick way, a page waits, and a memory of Athens.
pages: ch2-lots

############
#.P.#..##*.#
#:...p#..z.#
####.#:.:#.#
####.#:#.###
#*...S.....#
##:S##...#.#
#.x#...M.#:#
#.S..##S...#
#*.###..#.|E
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
`}];var Kn=[{id:"ch3-1",text:`title: The Rising Floor
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
#...#...r..#
#..P.....#.#
###.#.;..#.#
#.##.....#.#
#...;....#.#
###..M.#.###
#.#.#...;..#
#.#*.#..##.#
#...##;.R.|E
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
#....##..#;#
###...##...#
#P....;.####
#.O...#..#.#
#.#_...T...#
###*##.....#
#...;.M....#
##.#.#.....#
#*.;.#.#..|E
############
`},{id:"ch3-8",text:`title: Marked Ground
intro: Loose stone, marked stone and closing stone: the beast can stand on none of them. Between them lies open floor, and that is where he will look for you.

############
#.##.:....##
##P...##..##
##..;......#
#...#..#...#
#*##....;M.#
###.S:#.#..#
#...#;#.:..#
#..#...:...#
#*#......;|E
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
intro: The closing ways end in a ring of walls that were floor a moment ago. The long west hall is the way through, and the red key opens its door; off the quickest way, a page waits, and a memory of Ariadne.
pages: ch3-thread

####################
#..P.#..;.;...##p..#
#.##...####..##.##.#
#..r.....#......;..#
##.#.......#.#.##..#
#*...#.#.#.#...#..##
#......#..######.#.#
#....;.......M...#;#
###R##.#####....#..#
#....#.;....#...#..#
#.##..##....##.x#..#
#*#.#....#.##...;.|E
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
#..#....W###
#P##..##..S#
#.#*S.##.M##
#.#.#......#
#........#.#
#.##S.#..#.#
#S#S.#*r.#R#
#..S#....#.#
#...W.###|E#
############
`},{id:"ch4-6",text:`title: Lying Ground
intro: Loose stone and closing stone keep the beast off, and here the walls lie both ways: one painted, two unseen. Mind where the stones close behind you.

############
#.#.*###...#
#...#....P.#
#...;..I:..#
##...#.#.#.#
#..###.W.###
#..........#
##..#..I...#
###.#.#..###
#*:..;M..|E#
############
`},{id:"ch4-7",text:`title: The Glass Floor
intro: Ice runs through these halls and skates lie in the west. Two walls here are only painted; on the ice the beast skids as you do.

############
#P...#.##.*#
#......#...#
#..==.==.###
#...#.=.##.#
#k##M#.=...#
#.....#....#
##....W.W..#
#....###.=##
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
#.;##..:...#
#.pI....#..#
E|M#...;.#*#
############
`},{id:"ch4-10",text:`title: The Painted Labyrinth
intro: The false walls end in a maze. A red door is the way through, and one stretch of open floor is not open at all. Off the quickest way, a page waits, and a memory of the queen.
pages: ch4-queen

####################
#P....#......####..#
##......###..###..##
###*..:...##..:..###
#.......##.I##....p#
#..##...#.......##.#
##.##......#..#...##
#r###*:.......:.####
#........##..#.#...#
#...*###.##..#.R...#
###..#.#..:.#####.##
#.##M..#.#...##.#|E#
####################
`}];var Yn=[{id:"ch5-1",text:`title: The Snare
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
#.P.#.-.#..#
#.O.##.....#
#...####..##
#..........#
#.##*~~.##.#
#.#~.~*~~#.#
#.#*~~...#.#
#.####.&####
#.M.....f|E#
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
#..#...#####
##......####
#P.O...&*#.#
#....#.#R..#
#...##....##
###r#..##.##
#*#.#M.....#
#.....##...#
###..###-.|E
############
`},{id:"ch5-8",text:`title: The Snared Relic
intro: One relic hides in the northwest, and the only way to it runs through a snare. Push the block to the brown button in the south to open it; a second snare lies in the west hall, for the beast.

############
###...P....#
#.#..*...#.#
#&.....#...#
#.#.##.:.O.#
#.&.....#.##
#.###.#...##
#.#.;...#..#
#.#........#
#E|#M-.#:.##
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
intro: The snares end at the gate, and the beast waits by it. The way runs east, past a snare that the block, pushed onto the brown button, holds open; a second snare in the east room is for the beast. Off the quickest way, a page waits, and a memory of another telling.
pages: ch5-gate

#################
#.#..#####......#
#####.#..##.#.#.#
###*.##..##*..#.#
###..####.#####.#
##p.............#
###..##.##..#####
#..P#.....#.....#
#...#.....#.&.O.#
#.*.#....#....-.#
#####.#.#######&#
#######..#......#
#######...###M#.#
#####.#...#.#.#|#
##########.####E#
#################
`}];var qn=[{id:"ch6-1",text:`title: The Teleport
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
#v..#......#
#........@.#
#..#...>>.##
#.#..P*...##
#.#>..v.*.@#
#@..#<....<#
##.##u.....#
##..####<..#
#M..*.###|E#
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
`}];var Vn=[{id:"ch7-1",text:`title: The Bronze Ball
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
intro: Ice runs across the north hall, and you will skid on it as the beast does. A snare waits in the west by a block, and the brown button in the south looses it; one bronze ball rolls along the south hall. Two relics.
facing: right

############
####P###.###
##...###..##
#..=====.###
##.#&...*.##
##..O#.....#
###...##...#
##M..o.....#
##.*#......#
####...-.|E#
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
#..>.>>v####
#.P....v.###
#....#uv:..#
#..>#<.:...#
#.<.<...*..#
#.....:^#.##
#..<#M.^*..#
#.#....^.o.#
#.*..#.^.|E#
############
`},{id:"ch7-9",text:`title: The Mirrored Round
intro: Fire burns down the west halls, with boots beside it, and pop-up walls rise behind you once you leave them. Medusa's mirror lies in the east and a honey cake by the fire; two relics, and one bronze ball in the south. Off the quick way a page waits, and a memory of the man of bronze.
pages: ch7-brazen
facing: down

############
#P.#..##;###
#.##.....###
#..#.F#.p#.#
#h.;.F#...*#
#...xF.....#
#...F....z.#
##.##..#.#;#
#......o...#
#*.....M.|E#
#..#.#.#...#
############
`},{id:"ch7-10",text:`title: The Last Round
intro: The rounds end at the gate. Three teleports, each sending you out of the next along; fire that nobody crosses; the toggle wall and its button; and a red key in the west for the door to the last relic, in the southeast. Three relics, and one bronze ball in the south hall. Off the quickest way a page waits, and a memory of how the bronze guard fell.
pages: ch7-vein
facing: down

################
#P....#........#
#.....#........#
#.#...@...###.p#
#...###...###..#
#...#.....FF...#
#...#*#....#.#.#
#..T._......@..#
#..#.##......###
#...r#o..M...#*#
#.@###.FF*..R..#
#E|######...####
################
`}];var Zn=[{id:"ch8-1",text:`title: The Harpy
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
intro: Fire rings the court in the middle, with boots in the west. Talos's fire runs the halls of the southwest, turning right at every wall.
facing: down

############
##......FF.#
##...##.P..#
#.........F#
##...F.F.###
#.#.....F.##
#.#.F.FFF.##
#.#..#.F.###
#h..e###F###
##..M.....E#
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
#:.P..>>>.u#
#.######.#.#
#.#.##p.#..#
#.###..###F#
#..:##...F.#
#.#.#.##...#
#...#.F.e..#
#...wM..##.#
#...#..F..E#
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
`}];var Xn=[{id:"ch9-1",text:`title: The Thief
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
intro: A pool fills the west, and the flippers lie by your start. A thief stands among the relics in the middle: step on it and the flippers are gone. Three relics, and the beast waits by the way out.

############
#..#.###...#
#........P.#
#.~#....#f.#
##..*~*.##.#
#.~....$*#.#
#..~~~.....#
##..##.###.#
##..#......#
###M#..#...#
#.#...##...#
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
intro: Ice fills the room in the northeast, with the skates and a block in the south. A thief waits in the ice room's doorway. Three relics.

############
#M....*#==##
##..##=...=#
##.....#==.#
#...###.=###
E...#*##.$=#
##..#.=...*#
##..#.#.O..#
#...#..#...#
#..P#.##k..#
##....#....#
############
`},{id:"ch9-8",text:`title: The Bronze Copies
intro: The red button in the south wakes the clone machine in the east, which makes bronze balls. Two teleports, one sending you out of the other, and a bomb above the machine. Two relics.
machines: ball-up

############
#...#..#...#
#@..#..#...#
#...#..#.*.#
#.#.#*.#.!.#
#...#..#...#
#..P#.###..#
##.##.###.C#
##.....#@M.#
#...#.+....#
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
intro: The workshop ends at the gate in the west. The red button in the middle wakes the clone machine in the southwest, one Harpy flies the west hall, and the beast waits in the northwest. Three relics. Off the quick way a page waits, and a memory of the man who built this place.
pages: ch9-inventor
facing: right
machines: block-right

###############
#Mp.#*..#.....#
#.......#..#..#
#...#...#.....#
#E|.#####.##..#
#.......#..#..#
#...#+.....#..#
#*w.#...#.....#
#####.#######.#
#...#.......*.#
#.C.#...#.....#
#.......#....P#
#...#...#....##
###############
`}];var Jn=[{id:"ch10-1",text:`title: The Wooden Cow
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
#*#..#.#.#=#
#......##..#
##.==.##M#-#
##..k===*#.#
###.#..##..#
#...#=.#=..#
##..#P.#..##
##&#.$.#...E
#...#.O....#
#.#...#....#
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
intro: The beast waits in the southeast room. Medusa's mirror lies in the southwest room, and a snare in the middle hall, loosed by the brown button in the north. Three relics, and the way out is through the gate in the north. Off the quick way a page waits, and a memory of how the poet ends the story.
pages: ch10-oak

#################
#...#.......E...#
#...........|#..#
#..#.#-.#....##.#
#.##..#......#..#
#..#..#.*.#..#.##
#...#####.#.##.*#
#p.P............#
##.#..###....####
#.....#.....&#..#
#....z#...#.M...#
##..#.#....#.##.#
#..##.....#..#..#
#..#.....##..#*.#
#################
`}];var Bl=[..._n,...Nn,...Kn,...Un,...Yn,...qn,...Vn,...Zn,...Xn,...Jn];function Qn(){return Bl.map(e=>Q(e.text))}var $l=Hn({post:e=>self.postMessage(e),banks:Wn,known:()=>Sn(Qn()),now:()=>performance.now()});self.onmessage=e=>$l.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
