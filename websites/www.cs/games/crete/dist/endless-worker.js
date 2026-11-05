"use strict";(()=>{var _=["up","down","left","right"],K={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},$e=["red","blue","yellow","green"],bn=["flippers","fire-boots","skates","suction"],St={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},U=(e,t,n,r={},s,l=t)=>({char:e,minotaur:t,block:n,hazard:l,...r,sprites:s??[]}),H={floor:U(".",!0,!0,{},["floor"]),wall:U("#",!1,!1,{},["wall"]),exit:U("E",!1,!1,{},["exit"]),gate:U("|",!1,!1,{},["gate-closed","gate-open"]),water:U("~",!1,!0,{needs:"flippers"},["water"]),fire:U("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:U("=",!0,!0,{slides:"skates"},["ice"]),"force-up":U("^",!0,!0,{carries:"up"},["force-up"]),"force-down":U("v",!0,!0,{carries:"down"},["force-down"]),"force-left":U("<",!0,!0,{carries:"left"},["force-left"]),"force-right":U(">",!0,!0,{carries:"right"},["force-right"]),dirt:U("%",!0,!0,{},["dirt"]),safe:U("S",!1,!1,{},["safe"]),button:U("_",!0,!0,{},["button"]),"toggle-open":U("t",!0,!1,{},["toggle-open"]),"toggle-closed":U("T",!1,!1,{},["toggle-closed"]),"door-red":U("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":U("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":U("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":U("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:U("&",!0,!0,{},["trap"]),"button-brown":U("-",!0,!0,{},["button-brown"]),"button-red":U("+",!0,!0,{},["button-red"]),popup:U(";",!1,!1,{},["popup"]),gravel:U(":",!1,!1,{},["gravel"]),"fake-wall":U("W",!1,!1,{},["wall"]),"invisible-wall":U("I",!1,!1,{},["floor"]),teleport:U("@",!1,!1,{},["teleport"]),thief:U("$",!0,!0,{},["thief"]),bomb:U("!",!1,!0,{},["bomb"],!0),clone:U("C",!1,!1,{},_.map(e=>`clone-${e}`))},le={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var lt={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:St.mirror.name},cake:{char:"x",sprite:"cake",name:St.cake.name},cow:{char:"c",sprite:"cow",name:St.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},ao=["theseus","minotaur","minotaur-stone","cow-standing"],uo=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],co=["exit-off","exit-wake"],ts=[...new Set([...Object.values(H).flatMap(e=>e.sprites),...uo,...co,...Object.values(lt).map(e=>e.sprite),...ao,...Object.values(le).map(e=>e.sprite)])];var oe=class extends Error{line;col;constructor(t,n,r){super(`line ${t}, column ${n}: ${r}`),this.line=t,this.col=n}},ho=new Map(Object.entries(H).map(([e,t])=>[t.char,e])),fo=new Map(Object.entries(lt).map(([e,t])=>[t.char,e])),po=/^[a-z0-9-]+$/,mo=/^([a-z]+): (.*)$/,bo=new Map(Object.entries(le).map(([e,t])=>[t.char,e])),yo=["block","ball","glider","fireball"],go=["title","intro","hearts","relics","pages","facing","machines"];function wo(e,t){let n=e&&e.value!==""?e.value.split(" "):[],r=e??{line:1,col:1},s=new Set;for(let l of n){if(!po.test(l))throw new oe(r.line,r.col,`page id '${l}' must be lower-case letters, digits and hyphens`);if(s.has(l))throw new oe(r.line,r.col,`page '${l}' named twice`);s.add(l)}if(n.length>31)throw new oe(r.line,r.col,"a level holds at most 31 pages");if(n.length!==t)throw new oe(r.line,r.col,`pages: ${n.length} named but the grid has ${t}`);return n}function yn(e,t,n,r,s){let l=t&&t.value!==""?t.value.split(" "):[],o=t??{line:1,col:1};for(let i of l)if(!r(i))throw new oe(o.line,o.col,`${e}: '${i}' is not ${s}`);if(l.length!==n)throw new oe(o.line,o.col,`${e}: ${l.length} named but the grid has ${n}`);return l}function xo(e){let t={},n=e.indexOf("trap"),r=e.indexOf("clone"),s=-1,l=-1;for(let o=e.length-1;o>=0;o--){let i=e[o];if(i==="button-brown"){let a=s>=0?s:n;a>=0&&(t[o]=a)}else if(i==="button-red"){let a=l>=0?l:r;a>=0&&(t[o]=a)}else i==="trap"?s=o:i==="clone"&&(l=o)}return t}function J(e){let t=e.replace(/\r\n/g,`
`).split(`
`),n={},r=0;for(;r<t.length;r++){let v=mo.exec(t[r]);if(!v)break;if(!go.includes(v[1]))throw new oe(r+1,1,`unknown header '${v[1]}'`);n[v[1]]={value:v[2],line:r+1,col:v[1].length+3}}for(;r<t.length&&t[r]==="";)r++;let s=r,l=[];for(;r<t.length&&t[r]!=="";r++)l.push(t[r]);if(l.length===0)throw new oe(s+1,1,"no grid");for(;r<t.length;r++)if(t[r].trim()!=="")throw new oe(r+1,1,"text after the grid");let o=l[0].length,i=[],a=[],u=null,c=null,h=0,d=[],f=[],m=[];if(l.forEach((v,I)=>{let D=s+I+1;if(v.length!==o)throw new oe(D,1,`row is ${v.length} wide, expected ${o}`);[...v].forEach(($,S)=>{let R=S+1;if($==="P"||$==="M"){if($==="P"&&u)throw new oe(D,R,"second player");if($==="M"&&c)throw new oe(D,R,"second Minotaur");$==="P"?u={r:I,c:S}:c={r:I,c:S},i.push("floor"),a.push(null);return}let T=bo.get($);if(T){f.push({kind:T,at:{r:I,c:S}}),i.push("floor"),a.push(null);return}let B=ho.get($),A=fo.get($);if(!B&&!A)throw new oe(D,R,`unknown tile '${$}'`);i.push(B??"floor"),a.push(A??null),A==="relic"&&h++,B==="clone"&&m.push({r:I,c:S}),A==="page"&&d.push(I*o+S)})}),!u)throw new oe(s+1,1,"no player");let p=(v,I,D,$)=>{let S=n[v];if(!S)return I;let R=Number(S.value);if(!Number.isInteger(R)||R<D)throw new oe(S.line,S.col,`${v} must be ${D} to ${$}`);if(R>$){let T=v==="relics"?`relics: ${S.value} but the grid has ${$}`:`${v} must be ${D} to ${$}`;throw new oe(S.line,S.col,T)}return R},g=p("hearts",3,1,99),y=p("relics",h,0,h),b=wo(n.pages,d.length),w=yn("facing",n.facing,f.length,v=>_.includes(v),"a direction"),E=f.map((v,I)=>({...v,dir:w[I],home:I})),L=yn("machines",n.machines,m.length,v=>{let[I,D]=v.split("-");return yo.includes(I)&&_.includes(D)&&v.split("-").length===2},"a template and a direction like block-up"),P=E.length,O=m.map((v,I)=>{let[D,$]=L[I].split("-"),S={at:v,template:D,dir:$};return D==="block"?S:{...S,home:P++}});return{title:n.title?.value??"",intro:n.intro?.value??"",hearts:g,relics:y,pageIds:b,pageCells:d,rows:l.length,cols:o,terrain:i,objects:a,player:u,minotaur:c,hazards:E,machines:O,links:xo(i)}}function ke(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let t=e.objects.filter(l=>l==="relic").length,n=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&n.push(`hearts: ${e.hearts}`),e.relics!==t&&n.push(`relics: ${e.relics}`),e.pageIds.length>0&&n.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&n.push(`facing: ${e.hazards.map(l=>l.dir).join(" ")}`),e.machines.length>0&&n.push(`machines: ${e.machines.map(l=>`${l.template}-${l.dir}`).join(" ")}`);let r=new Map(e.hazards.map(l=>[l.at.r*e.cols+l.at.c,l.kind])),s=[];for(let l=0;l<e.rows;l++){let o="";for(let i=0;i<e.cols;i++){let a=l*e.cols+i;e.player.r===l&&e.player.c===i?o+="P":e.minotaur&&e.minotaur.r===l&&e.minotaur.c===i?o+="M":r.has(a)?o+=le[r.get(a)].char:o+=e.objects[a]?lt[e.objects[a]].char:H[e.terrain[a]].char}s.push(o)}return`${n.join(`
`)}

${s.join(`
`)}
`}function gn(e){let t=0;for(let n of e.objects)n==="cake"&&t++;return e.hearts+t}function ee(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var ie=(e,t)=>t.r>=0&&t.c>=0&&t.r<e.rows&&t.c<e.cols,C=(e,t)=>t.r*e.level.cols+t.c;var V=(e,t)=>!!t&&e.r===t.r&&e.c===t.c,Ae=66,ko=Array.from({length:Ae*Ae},(e,t)=>({r:Math.floor(t/Ae)-1,c:t%Ae-1})),To=(e,t)=>e>=-1&&t>=-1&&e<Ae-1&&t<Ae-1?ko[(e+1)*Ae+t+1]:{r:e,c:t},re=(e,t)=>To(e.r+K[t][0],e.c+K[t][1]),zt=e=>e.relicsLeft===0;var wn=e=>{let t=st(e);return t.terrain=[...e.terrain],t.objects=[...e.objects],t.ownTerrain=t.ownObjects=!0,ve(t),t},st=e=>({level:e.level,terrain:e.terrain,objects:e.objects,ownTerrain:!1,ownObjects:!1,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,ownHeld:!1,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:e.hazards.length>0?[...e.hazards]:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome});function ve(e){e.ownHeld||(e.keys={...e.keys},e.tools={...e.tools},e.gear=[...e.gear],e.ownHeld=!0)}function pe(e,t,n){e.ownTerrain||(e.terrain=e.terrain.slice(),e.ownTerrain=!0),e.terrain[t]=n}function Se(e,t,n){e.ownObjects||(e.objects=e.objects.slice(),e.ownObjects=!0),e.objects[t]=n}var te=(e,t)=>ie(e.level,t)?e.terrain[C(e,t)]:"wall",me=(e,t)=>ie(e.level,t)?e.objects[C(e,t)]:null;function Te(e,t){let n=e.hazards;for(let r=0;r<n.length;r++){let s=n[r].at;if(s.r===t.r&&s.c===t.c)return!0}return!1}function it(e,t){e.terrain=e.terrain.map(n=>n==="toggle-open"?"toggle-closed":n==="toggle-closed"?"toggle-open":n),e.ownTerrain=!0,t.push({kind:"flipped"})}var xn=new WeakMap;function Tn(e){let t=xn.get(e);return t||(t=e.terrain.flatMap((n,r)=>n==="teleport"?[r]:[]),xn.set(e,t)),t}var Mn=e=>Tn(e).length>1;function Lt(e,t,n,r){let{cols:s}=e.level,l=Tn(e.level),o=t.r*s+t.c,i=l.findIndex(a=>a>o);for(let a=0;a<l.length;a++){let u=l[((i<0?0:i)+a)%l.length];if(u===o)continue;let c={r:Math.floor(u/s),c:u%s},h=re(c,n);if(te(e,h)!=="teleport"&&r(h))return{via:c,to:h}}return null}var kn=new WeakMap;function Mo(e){let t=kn.get(e);if(!t){let n=new Map;for(let[r,s]of Object.entries(e.links)){if(e.terrain[s]!=="trap")continue;let l=n.get(s);l?l.push(Number(r)):n.set(s,[Number(r)])}t=n,kn.set(e,t)}return t}function Eo(e,t){let n=Mo(e.level).get(t);if(!n)return!1;let{cols:r}=e.level;return n.some(s=>{let l={r:Math.floor(s/r),c:s%r};return V(l,e.player)||me(e,l)==="block"||Te(e,l)})}var se=(e,t)=>te(e,t)==="trap"&&!Eo(e,t.r*e.level.cols+t.c);function En(e,t,n){if(!ie(e.level,n))return!1;let r=te(e,n);return H[r].hazard||le[t].crosses===r}var at=(e,t,n)=>En(e,t,n)&&!me(e,n)&&!V(n,e.minotaur)&&!V(n,e.cow)&&!Te(e,n),ut=(e,t,n)=>V(n,e.player)?En(e,t,n):at(e,t,n);function Rt(e,t,n,r,s=!1){let l=e.hazards[t],o=te(e,l.at);return o==="bomb"?(pe(e,C(e,l.at),"floor"),e.hazards.splice(t,1),n.push({kind:"exploded",who:"hazard",at:l.at}),"gone"):(o==="button"?it(e,n):o==="button-red"&&dt(e,C(e,l.at),n,r,s),se(e,l.at)&&n.push({kind:"held",who:"hazard",at:l.at}),"on")}function dt(e,t,n,r,s=!1){let l=e.level.links[t];if(l===void 0)return;let o=e.level.machines.find(c=>C(e,c.at)===l),i=re(o.at,o.dir);if(r&&V(i,r))return;if(o.template==="block"){if(!ct(e,i))return;Se(e,C(e,i),"block"),n.push({kind:"cloned",what:"block",at:i}),Ot(e,i,o.dir,r,n,s);return}if(!at(e,o.template,i)||V(i,e.player))return;let a={kind:o.template,at:i,dir:o.dir,home:o.home};e.hazards.length===0&&(e.hazards=[]);let u=e.hazards.length;if(!s){let c=C(e,i);for(;u>0&&C(e,e.hazards[u-1].at)>c;)u--}e.hazards.splice(u,0,a),n.push({kind:"cloned",what:o.template,at:i}),Rt(e,u,n,r,s)}function Po(e,t){let n=e.hazards[t];if(n)return n.at;let r=e.machines.find(s=>s.home===t);return re(r.at,r.dir)}function Ft(e,t,n){te(e,t)==="popup"&&(pe(e,C(e,t),"wall"),n.push({kind:"rose",at:t}))}var Ao=(e,t,n)=>at(e,t,n)&&te(e,n)!=="bomb"&&!V(n,e.player);function vo(e,t,n){let r=Po(e.level,n),s=new Set([C(e,r)]),l=[r];for(;l.length>0;){let o=l.filter(a=>Ao(e,t,a)).sort((a,u)=>C(e,a)-C(e,u));if(o.length>0)return o[0];let i=[];for(let a of l)for(let u of _){let c=re(a,u);!ie(e.level,c)||s.has(C(e,c))||(s.add(C(e,c)),i.push(c))}l=i}return null}function Pn(e,t,n){let r=e.hazards.findIndex(o=>V(t,o.at));if(r<0)return;let s=e.hazards[r];e.hazards.splice(r,1);let l=vo(e,s.kind,s.home);l&&(e.hazards.push({...s,at:l}),e.hazards.sort((o,i)=>C(e,o.at)-C(e,i.at))),n.push({kind:"sent-home",from:t,to:l})}function ze(e,t,n,r){if(e.hearts--,t.push(r?{kind:"caught",at:e.player,hearts:e.hearts,by:n,hazard:r}:{kind:"caught",at:e.player,hearts:e.hearts,by:n}),e.hearts<=0){e.outcome="lost",t.push({kind:"lost"});return}Ft(e,e.player,t),e.player=e.throwBack;let s=null;V(e.player,e.minotaur)&&(s=e.level.minotaur,e.minotaur=s,V(s,e.cow)&&(e.cow=null)),Pn(e,e.player,t),s&&Pn(e,s,t)}function ht(e,t){if(e.outcome!=="playing")return!0;for(let n=0;n<t.length;n++)if(t[n].kind==="caught")return!0;return!1}function Ct(e,t){return ie(e.level,t)&&H[te(e,t)].minotaur&&me(e,t)!=="block"&&!Te(e,t)}function An(e,t,n){return e.minotaur=t,se(e,t)&&n.push({kind:"held",who:"minotaur",at:t}),V(t,e.cow)&&(e.cow=null),V(t,e.player)?(ze(e,n,"minotaur"),!0):!1}function So(e,t){let n=e.minotaur;if(!n)return!0;if(se(e,n))return!1;let r=e.cow??e.player,s=null,l=null;if(r.c!==n.c){let a=r.c>n.c?"right":"left",u=re(n,a);Ct(e,u)&&(s=a,l=u)}if(!l&&r.r!==n.r){let a=r.r>n.r?"down":"up",u=re(n,a);Ct(e,u)&&(s=a,l=u)}if(!s||!l)return!1;if(t.push({kind:"moved",who:"minotaur",from:n,to:l}),An(e,l,t))return!0;let o=s,i=null;for(;;){let a=H[te(e,e.minotaur)];if(a.carries)o=a.carries;else if(!a.slides)return!1;i??=new Set([C(e,l)]);let u=re(e.minotaur,o);if(!Ct(e,u)||i.has(C(e,u)))return!1;if(t.push({kind:"slid",who:"minotaur",from:e.minotaur,to:u}),i.add(C(e,u)),An(e,u,t))return!0}}function vn(e,t){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let n=0;n<2&&e.outcome==="playing";n++)if(So(e,t))return}}var zo={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function Lo(e,t,n){return V(e.hazards[t].at,e.player)?(V(e.player,e.cow)&&(e.cow=null),ze(e,n,"hazard",e.hazards[t].kind),"caught"):Rt(e,t,n,void 0,!0)}function Ro(e,t,n){let r=e.hazards[t];if(se(e,r.at))return"on";let s=r.dir;if(!ut(e,r.kind,re(r.at,s))){s=void 0;for(let i of le[r.kind].turns){let a=zo[i][r.dir];if(ut(e,r.kind,re(r.at,a))){s=a;break}}}if(!s)return"on";let l=re(r.at,s);n.push({kind:"moved",who:"hazard",hazard:r.kind,from:r.at,to:l});let o=null;for(;;){r=e.hazards[t]={kind:r.kind,at:l,dir:s,home:r.home};let i=Lo(e,t,n);if(i!=="on")return i;let a=H[te(e,l)];if(a.carries)s=a.carries,r.dir!==s&&(r=e.hazards[t]={kind:r.kind,at:r.at,dir:s,home:r.home});else if(!a.slides)return"on";o??=new Set([C(e,l)]);let u=re(l,s);if(o.has(C(e,u))||!ut(e,r.kind,u))return"on";n.push({kind:"slid",who:"hazard",hazard:r.kind,from:l,to:u}),o.add(C(e,u)),l=u}}function Sn(e,t){if(e.hazards.length!==0){for(let n=0,r=e.hazards.length;n<r;){let s=Ro(e,n,t);if(s==="caught")break;s==="gone"?r--:n++}e.hazards.sort((n,r)=>C(e,n.at)-C(e,r.at))}}function ct(e,t){return ie(e.level,t)&&H[te(e,t)].block&&!me(e,t)&&!V(t,e.player)&&!V(t,e.minotaur)&&!V(t,e.cow)&&!V(t,e.throwBack)&&!V(t,e.level.minotaur)&&!Te(e,t)}function It(e,t,n,r){let s=re(t,n);if(te(e,s)!=="teleport")return ct(e,s)&&r(s)?{entry:s,to:s}:null;if(V(s,e.player))return null;let l=Lt(e,s,n,o=>ct(e,o)&&r(o));return l&&{entry:s,via:l.via,to:l.to}}function zn(e,t,n,r,s){Se(e,C(e,t),null),Se(e,C(e,n.to),"block"),s.push(r==="pushed"?{kind:"pushed",from:t,to:n.entry}:{kind:"slid",who:"block",from:t,to:n.entry}),n.via&&s.push({kind:"teleported",who:"block",from:n.entry,via:n.via,to:n.to})}function Ot(e,t,n,r,s,l=!1){let o=t,i=n,a=new Set([C(e,o)]);for(r&&a.add(C(e,r));;){let u=te(e,o);if(u==="water"||u==="bomb"){Se(e,C(e,o),null),pe(e,C(e,o),u==="water"?"dirt":"floor"),s.push(u==="water"?{kind:"sank",at:o}:{kind:"exploded",who:"block",at:o});return}u==="button"?it(e,s):u==="button-red"&&dt(e,C(e,o),s,r,l),se(e,o)&&s.push({kind:"held",who:"block",at:o});let c=H[u];if(c.carries)i=c.carries;else if(!c.slides)return;let h=It(e,o,i,d=>!a.has(C(e,d)));if(!h)return;zn(e,o,h,"slid",s),a.add(C(e,h.to)),o=h.to}}var Oo=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Ln(e,t,n,r){if(!ie(e.level,t)||V(t,e.minotaur))return!1;let s=te(e,t),l=H[s];return Oo.has(s)||s==="teleport"&&!Mn(e.level)||s==="gate"&&!zt(e)||l.needs&&!e.gear.includes(l.needs)||l.door&&e.keys[l.door]<=0?!1:Te(e,t)||me(e,t)!=="block"?!0:!r&&!se(e,t)&&!!It(e,t,n,()=>!0)}function $t(e,t,n,r,s){if(!Ln(e,t,n,r))return!1;if(Te(e,t))return ze(e,s,"hazard",e.hazards.find(o=>V(o.at,t)).kind),!1;let l=H[te(e,t)];if(l.door&&(l.door!=="green"&&(ve(e),e.keys[l.door]--),pe(e,C(e,t),"floor"),s.push({kind:"opened",color:l.door,at:t})),me(e,t)==="block"){let o=It(e,t,n,()=>!0);zn(e,t,o,"pushed",s),Ot(e,o.to,n,t,s)}return!0}function Bt(e,t,n,r,s){Ft(e,e.player,s),e.player=t;let l=te(e,t);if(l==="bomb")return pe(e,C(e,t),"floor"),s.push({kind:"exploded",who:"player",at:t}),ze(e,s,"bomb"),!0;let o=me(e,t);if(o&&o!=="block"&&(Se(e,C(e,t),null),s.push({kind:"took",what:o,at:t}),o==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):o==="page"?e.pages|=1<<e.level.pageCells.indexOf(C(e,t)):o.startsWith("key-")?(ve(e),e.keys[o.slice(4)]++):o==="mirror"||o==="cake"||o==="cow"?(ve(e),e.tools[o]++):e.gear.includes(o)||(ve(e),e.gear.push(o))),l==="thief"&&e.gear.length>0&&(s.push({kind:"robbed",at:t,gear:e.gear}),e.gear=[]),l==="safe"&&(e.throwBack=t),se(e,t)&&s.push({kind:"held",who:"player",at:t}),l==="button"?it(e,s):l==="button-red"&&dt(e,C(e,t),s),l==="exit"&&zt(e)&&(e.outcome="won",s.push({kind:"won"})),l==="teleport"){let i=Lt(e,t,n,a=>Ln(e,a,n,r));return i?$t(e,i.to,n,r,s)?(s.push({kind:"teleported",who:"player",from:t,via:i.via,to:i.to}),Bt(e,i.to,n,r,s)):!0:!1}return!1}function Fo(e,t,n){let r=t,s=e.player,l=null;for(;e.outcome==="playing";){let o=H[te(e,e.player)];if(o.carries&&!e.gear.includes("suction"))r=o.carries;else if(!o.slides||e.gear.includes(o.slides))return;l??=new Set([C(e,s)]);let i=re(e.player,r);if(l.has(C(e,i))||!$t(e,i,r,!0,n)||(n.push({kind:"slid",who:"player",from:e.player,to:i}),l.add(C(e,i)),Bt(e,i,r,!0,n)))return;l.add(C(e,e.player))}}function Dt(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function Rn(e,t,n){if(t.kind==="move"){let r=e.player;if(se(e,r))return!1;let s=re(r,t.dir),l=te(e,s);if(l==="invisible-wall")return pe(e,C(e,s),"wall"),n.push({kind:"revealed",at:s,what:l}),!0;if(l==="fake-wall"&&(pe(e,C(e,s),"floor"),n.push({kind:"revealed",at:s,what:l})),$t(e,s,t.dir,!1,n))n.push({kind:"moved",who:"player",from:r,to:s}),Bt(e,s,t.dir,!1,n)||Fo(e,t.dir,n);else if(!ht(e,n))return!1}else if(t.kind==="tool"){if(e.tools[t.tool]<=0)return!1;if(t.tool==="cake")e.hearts++;else if(t.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,n.push({kind:"stoned",turns:3});ve(e),e.tools[t.tool]--}return!0}function On(e,t){return{level:e.level,terrain:!e.ownTerrain||Dt(e.terrain,t.terrain)?t.terrain:e.terrain,objects:!e.ownObjects||Dt(e.objects,t.objects)?t.objects:e.objects,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:Dt(e.hazards,t.hazards)?t.hazards:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome}}function jt(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let n=st(e),r=[];return Rn(n,t,r)?{state:On(n,e),events:r}:{state:e,events:[]}}function Le(e,t){if(t.state===e)return!0;let n=t.events[0];return n?.kind==="revealed"&&n.what==="invisible-wall"}function q(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let n=st(e),r=[];if(!Rn(n,t,r))return{state:e,events:[]};let s=t.kind==="tool"&&t.tool==="mirror";return ht(n,r)||Sn(n,r),!s&&!ht(n,r)&&vn(n,r),n.moves++,{state:On(n,e),events:r}}var Co=["mirror","cake","cow"],Me=e=>e<=0?0:32-Math.clz32(e),Fn=new WeakMap;function be(e){let t=Fn.get(e);return t||Fn.set(e,t=Bo(e)),t}function Do(e){let t=new Set,n=[],r=a=>{let u=e.terrain[a];return H[u].block||H[u].door!==void 0||u==="fake-wall"},s=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,l=(a,u)=>a>=0&&u>=0&&a<e.rows&&u<e.cols,o=a=>{t.has(a)||a===s||!r(a)||(t.add(a),n.push(a))};e.objects.forEach((a,u)=>{a==="block"&&(t.add(u),n.push(u))});for(let a of e.machines){let u=a.at.r+K[a.dir][0],c=a.at.c+K[a.dir][1];a.template==="block"&&l(u,c)&&o(u*e.cols+c)}let i=[];for(e.terrain.forEach((a,u)=>{a==="teleport"&&i.push(u)});n.length;){let a=n.pop(),u=Math.floor(a/e.cols),c=a%e.cols,h=H[e.terrain[a]],d=h.slides!==void 0||h.carries!==void 0;for(let f of _){let[m,p]=K[f],g=u+m,y=c+p;if(!l(g,y))continue;let b=u-m,w=c-p;if(!(l(b,w)&&e.terrain[b*e.cols+w]!=="wall")&&!d)continue;let L=g*e.cols+y;if(e.terrain[L]!=="teleport"){o(L);continue}for(let P of i){let O=Math.floor(P/e.cols)+m,v=P%e.cols+p;l(O,v)&&o(O*e.cols+v)}}}return t}var Io={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},Gt=e=>Io[e]??(H[e].door!==void 0?"floor":void 0);function $o(e,t){let n=new Set(t.map(s=>le[s].crosses)),r=[];return e.terrain.forEach((s,l)=>{let o=Gt(s);(H[s].hazard||n.has(s)||s==="toggle-closed"||o&&H[o].hazard)&&r.push(l)}),r}function Bo(e){let t=A=>e.objects.filter(M=>M===A).length,n=Do(e),r=[],s=[],l=[],o=[],i=[];e.terrain.forEach((A,M)=>{Gt(A)?r.push(M):(A==="toggle-open"||A==="toggle-closed")&&s.push(M);let j=e.objects[M];n.has(M)?(j&&j!=="block"?i:o).push(M):j&&l.push(M)});let a=e.rows*e.cols,u=$e.map(A=>Me(t(`key-${A}`))),c=Co.map(A=>Me(t(A))),h=bn.filter(A=>t(A)>0),d=Me(a),f=t("cow")>0,m=e.minotaur!==null,p=t("mirror")>0?2:0,g=d*(2+(m?1:0)+(f?1:0))+p,y=Me(gn(e)),b=g+y+Me(e.relics),w=[],E=b+e.pageIds.length;for(let A of u)w.push(E),E+=A;let L=[];for(let A of c)L.push(E),E+=A;let P=[...e.hazards.map(A=>A.kind)];for(let A of e.machines)A.home!==void 0&&(P[A.home]=A.template);let O=P.length>e.hazards.length,v=O?0:e.hazards.length,I=O?$o(e,P):[],D=O?Me(4*P.length):0,$=d*(2+(m?1:0)+(f?1:0))+p+y+Me(e.relics)+e.pageIds.length+u.reduce((A,M)=>A+M,0)+c.reduce((A,M)=>A+M,0)+h.length+r.length+(s.length?1:0)+l.length+o.length+2*i.length+v*(d+2)+I.length*D,S=E+h.length,R=S+r.length+(s.length?1:0),T=R+l.length+o.length+2*i.length,B=[];for(let A=0;A<a;A++)B.push({r:Math.floor(A/e.cols),c:A%e.cols});return{terrainAt:S,objectsAt:R,hazardsAt:T,cells:B,terrains:new Map,objectLists:new Map,words:Math.max(1,Math.ceil($/32)),cellBits:d,none:a,minotaur:m,cow:f,stoneBits:p,heartBits:y,relicBits:Me(e.relics),pageBits:e.pageIds.length,keyBits:u,toolBits:c,gear:h,heartAt:g,pageAt:b,keyAt:w,toolAt:L,gearAt:E,changing:Int32Array.from(r),toggles:Int32Array.from(s),fixed:Int32Array.from(l),blockOnly:Int32Array.from(o),blockOrObject:Int32Array.from(i),hazardSlots:v,hazardCells:Int32Array.from(I),hazardBits:D,homeKinds:P}}function Z(e,t,n,r,s){if(r===0)return n;let l=t+(n>>>5),o=n&31;return e[l]|=s<<o,o+r>32&&(e[l+1]|=s>>>32-o),n+r}function Y(e,t,n,r){if(r===0)return 0;let s=t+(n>>>5),l=n&31,o=e[s]>>>l;return l+r>32&&(o|=e[s+1]<<32-l),r===32?o>>>0:o&(1<<r)-1}var Ee=(e,t,n)=>t?t.r*e.level.cols+t.c:n,Cn={up:0,down:1,left:2,right:3};function Dn(e,t,n,r,s,l){for(let o=s,i=s+l;o<i;o+=30){let a=Math.min(30,i-o);Z(n,r,o,a,Y(e,t,o,a))}}function Be(e,t,n,r,s,l,o=0){let i=t;for(let g=0;g<i.words;g++)n[r+g]=0;let a=0;a=Z(n,r,a,i.cellBits,Ee(e,e.player,i.none)),a=Z(n,r,a,i.cellBits,Ee(e,e.throwBack,i.none)),i.minotaur&&(a=Z(n,r,a,i.cellBits,Ee(e,e.minotaur,i.none))),i.cow&&(a=Z(n,r,a,i.cellBits,Ee(e,e.cow,i.none))),a=Z(n,r,a,i.stoneBits,e.stone),a=Z(n,r,a,i.heartBits,e.hearts),a=Z(n,r,a,i.relicBits,e.relicsLeft),a=Z(n,r,a,i.pageBits,e.pages);let u=e.keys,c=e.tools;a=Z(n,r,a,i.keyBits[0],u.red),a=Z(n,r,a,i.keyBits[1],u.blue),a=Z(n,r,a,i.keyBits[2],u.yellow),a=Z(n,r,a,i.keyBits[3],u.green),a=Z(n,r,a,i.toolBits[0],c.mirror),a=Z(n,r,a,i.toolBits[1],c.cake),a=Z(n,r,a,i.toolBits[2],c.cow);for(let g=0;g<i.gear.length;g++)a=Z(n,r,a,1,e.gear.includes(i.gear[g])?1:0);let h=e.terrain,d=e.objects,f=e.level.terrain;if(s&&l&&h===s.terrain)Dn(l,o,n,r,i.terrainAt,i.objectsAt-i.terrainAt);else{for(let g=0;g<i.changing.length;g++){let y=i.changing[g];Z(n,r,i.terrainAt+g,1,h[y]===f[y]?0:1)}i.toggles.length&&Z(n,r,i.objectsAt-1,1,h[i.toggles[0]]===f[i.toggles[0]]?0:1)}if(s&&l&&d===s.objects)Dn(l,o,n,r,i.objectsAt,i.hazardsAt-i.objectsAt);else{a=i.objectsAt;for(let g=0;g<i.fixed.length;g++)a=Z(n,r,a,1,d[i.fixed[g]]?1:0);for(let g=0;g<i.blockOnly.length;g++)a=Z(n,r,a,1,d[i.blockOnly[g]]==="block"?1:0);for(let g=0;g<i.blockOrObject.length;g++){let y=d[i.blockOrObject[g]];a=Z(n,r,a,2,y==="block"?2:y?1:0)}}a=i.hazardsAt;let m=e.hazards;if(i.hazardSlots>1){for(let g=1;g<m.length;g++)if(Ee(e,m[g].at,i.none)<Ee(e,m[g-1].at,i.none))throw new Error("the hazards must be sorted by cell")}for(let g=0;g<i.hazardSlots;g++){let y;for(let b=0;b<m.length;b++)if(m[b].home===g){y=m[b];break}a=Z(n,r,a,i.cellBits,y?Ee(e,y.at,i.none):i.none),a=Z(n,r,a,2,y?Cn[y.dir]:0)}let p=0;for(let g=0;g<i.hazardCells.length;g++){let y=i.hazardCells[g],b=m[p],w=b!==void 0&&Ee(e,b.at,i.none)===y;a=Z(n,r,a,i.hazardBits,w?1+Cn[b.dir]+4*b.home:0),w&&p++}if(i.hazardCells.length&&p!==m.length)throw new Error(`packed ${p} of ${m.length} hazards: they must be sorted by cell`)}var In=4096;function $n(e,t,n,r){if(r<=30)return Y(e,t,n,r);let s="";for(let l=n,o=n+r;l<o;l+=30)s+=Y(e,t,l,Math.min(30,o-l))+",";return s}function jo(e,t,n,r){let s=n.objectsAt-n.terrainAt;if(s===0)return r.terrain;let l=$n(e,t,n.terrainAt,s),o=n.terrains.get(l);if(o)return o;let i=[...r.terrain];for(let a=0;a<n.changing.length;a++){if(!Y(e,t,n.terrainAt+a,1))continue;let u=n.changing[a];i[u]=Gt(r.terrain[u])}if(n.toggles.length&&Y(e,t,n.objectsAt-1,1))for(let a of n.toggles)i[a]=r.terrain[a]==="toggle-open"?"toggle-closed":"toggle-open";return n.terrains.size>=In&&n.terrains.clear(),n.terrains.set(l,i),i}function Go(e,t,n,r){let s=n.hazardsAt-n.objectsAt;if(s===0)return r.objects;let l=$n(e,t,n.objectsAt,s),o=n.objectLists.get(l);if(o)return o;let i=[...r.objects],a=n.objectsAt;for(let u of n.fixed)Y(e,t,a++,1)||(i[u]=null);for(let u of n.blockOnly)i[u]=Y(e,t,a++,1)?"block":null;for(let u of n.blockOrObject){let c=Y(e,t,a,2);a+=2,c===0?i[u]=null:c===2&&(i[u]="block")}return n.objectLists.size>=In&&n.objectLists.clear(),n.objectLists.set(l,i),i}function ft(e,t,n,r,s=0){let l=n,o=l.cells,i=l.none,a=l.cellBits,u=0,c=o[Y(e,t,u,a)];u+=a;let h=o[Y(e,t,u,a)];u+=a;let d=null,f=null;if(l.minotaur){let M=Y(e,t,u,a);u+=a,d=M===i?null:o[M]}if(l.cow){let M=Y(e,t,u,a);u+=a,f=M===i?null:o[M]}let m=Y(e,t,u,l.stoneBits);u+=l.stoneBits;let p=Y(e,t,u,l.heartBits);u+=l.heartBits;let g=Y(e,t,u,l.relicBits);u+=l.relicBits;let y=Y(e,t,u,l.pageBits);u+=l.pageBits;let b=l.keyBits,w=l.toolBits,E=Y(e,t,u,b[0]);u+=b[0];let L=Y(e,t,u,b[1]);u+=b[1];let P=Y(e,t,u,b[2]);u+=b[2];let O=Y(e,t,u,b[3]);u+=b[3];let v={red:E,blue:L,yellow:P,green:O},I=Y(e,t,u,w[0]);u+=w[0];let D=Y(e,t,u,w[1]);u+=w[1];let $=Y(e,t,u,w[2]);u+=w[2];let S={mirror:I,cake:D,cow:$},R=[];for(let M=0;M<l.gear.length;M++)Y(e,t,u++,1)&&R.push(l.gear[M]);let T=jo(e,t,l,r),B=Go(e,t,l,r);u=l.hazardsAt;let A=[];for(let M=0;M<l.hazardSlots;M++){let j=Y(e,t,u,a);u+=a;let W=_[Y(e,t,u,2)];u+=2,j!==i&&A.push({kind:l.homeKinds[M],at:o[j],dir:W,home:M})}A.length>1&&A.sort((M,j)=>M.at.r*r.cols+M.at.c-(j.at.r*r.cols+j.at.c));for(let M=0;M<l.hazardCells.length;M++){let j=Y(e,t,u,l.hazardBits);if(u+=l.hazardBits,!j)continue;let W=j-1>>>2;A.push({kind:l.homeKinds[W],at:o[l.hazardCells[M]],dir:_[j-1&3],home:W})}return{level:r,terrain:T,objects:B,player:c,hearts:p,keys:v,gear:R,tools:S,pages:y,throwBack:h,minotaur:d,stone:m,cow:f,hazards:A,relicsLeft:g,moves:s,outcome:"playing"}}var Gn=new Set(["wall","invisible-wall","clone"]);function Ho(e,t,n,r){let s=(u,c)=>u>=0&&c>=0&&u<e.rows&&c<e.cols&&!Gn.has(e.terrain[u*e.cols+c]),l=new Set,o=new Set,i=[],a=(u,c,h)=>{if(!s(u,c))return;let d=(u*e.cols+c)*4+_.indexOf(h);o.has(d)||(o.add(d),l.add(u*e.cols+c),i.push([u,c,h]))};for(a(Math.floor(t/e.cols)+K[n][0],t%e.cols+K[n][1],n);i.length;){let[u,c,h]=i.pop(),d=e.terrain[u*e.cols+c];if(d==="teleport"){for(let p of r){if(p===u*e.cols+c)continue;let g=Math.floor(p/e.cols)+K[h][0],y=p%e.cols+K[h][1];s(g,y)&&e.terrain[g*e.cols+y]!=="teleport"&&a(g,y,h)}continue}let f=H[d],m=f.carries??(f.slides?h:null);m&&a(u+K[m][0],c+K[m][1],m)}return[...l]}function _o(e){let t=e.rows*e.cols,n=e.terrain.map(o=>!Gn.has(o)),r=e.terrain.flatMap((o,i)=>o==="teleport"?[i]:[]),s=Array.from({length:t},()=>[]);for(let o=0;o<t;o++)if(n[o])for(let i of _)for(let a of Ho(e,o,i,r.length>1?r:[]))s[a].push(o);let l=new Uint8Array(t);return e.terrain.forEach((o,i)=>{o==="safe"&&(l[i]=1)}),l[e.player.r*e.cols+e.player.c]=1,{n:t,open:n,into:s,thrown:l}}function Bn(e,t){let n=new Float64Array(e.n).fill(1/0),r=new Int32Array(e.n),s=0;for(let o of t)n[o]===1/0&&(n[o]=0,r[s++]=o);let l=!1;for(let o=0;o<s;o++){let i=r[o],a=n[i]+1;for(let u of e.into[i])n[u]===1/0&&(n[u]=a,r[s++]=u);if(!l&&e.thrown[i]){l=!0;for(let u=0;u<e.n;u++)e.open[u]&&n[u]===1/0&&(n[u]=a,r[s++]=u)}}return n}function Wo(e){let t=_o(e),n=e.terrain.flatMap((o,i)=>o==="exit"?[i]:[]),r=Bn(t,n),s=e.objects.flatMap((o,i)=>o==="relic"?[i]:[]),l=s.map(o=>Bn(t,[o]));return o=>{if(o.outcome==="won")return 0;if(o.outcome==="lost")return 1/0;let i=o.player.r*e.cols+o.player.c,a=r[i];if(o.relicsLeft===0)return a;let u=0,c=1/0,h=0;for(let d=0;d<s.length;d++){if(o.objects[s[d]]!=="relic")continue;let f=l[d][i];u++,f<c&&(c=f),f>h&&(h=f)}return u<o.relicsLeft?1/0:Math.max(a,u===o.relicsLeft?h:c)}}var jn=new WeakMap;function pt(e){let t=jn.get(e);return t||jn.set(e,t=Wo(e)),t}var je=class extends Error{},Hn=1024;function Ht(e,t,n){let r=2538058380;for(let s=0;s<n;s++){let l=Math.imul(e[t+s],3432918353);l=Math.imul(l<<15|l>>>17,461845907),r^=l,r=Math.imul(r<<13|r>>>19,5)+3864292196}return r^=n,r=Math.imul(r^r>>>16,2246822507),r=Math.imul(r^r>>>13,3266489909),(r^r>>>16)>>>0}function mt(e){let t=e,n=Hn,r=new Uint32Array(n*t),s=new Uint32Array(n),l=new Int32Array(n),o=new Uint8Array(n),i=new Uint32Array(n),a=0,u=new Int32Array(Hn*2),c=u.length-1;function h(){n*=2;let f=new Uint32Array(n*t);f.set(r),r=f;let m=new Uint32Array(n);m.set(s),s=m;let p=new Int32Array(n);p.set(l),l=p;let g=new Uint8Array(n);g.set(o),o=g;let y=new Uint32Array(n);y.set(i),i=y,u=new Int32Array(n*2),c=u.length-1;for(let b=0;b<a;b++){let w=s[b]&c;for(;u[w]!==0;)w=w+1&c;u[w]=b+1}}function d(f,m,p){let g=f*t;for(let y=0;y<t;y++)if(r[g+y]!==m[p+y])return!1;return!0}return{get size(){return a},add(f,m,p,g,y){let b=Ht(f,m,t),w=b&c;for(let L=u[w];L!==0;w=w+1&c,L=u[w]){let P=L-1;if(!(s[P]!==b||!d(P,f,m)))return y>=i[P]?-1:(l[P]=p,o[P]=g,i[P]=y,P)}if(a===n)for(h(),w=b&c;u[w]!==0;)w=w+1&c;let E=a++;return r.set(f.subarray(m,m+t),E*t),s[E]=b,l[E]=p,o[E]=g,i[E]=y,u[w]=E+1,E},words(f,m,p){m.set(r.subarray(f*t,f*t+t),p)},parent:f=>l[f],action:f=>o[f],g:f=>i[f]}}var Ve=["mirror","cake","cow"],Re=_.length,bt=[..._.map(e=>({kind:"move",dir:e})),{kind:"wait"},...Ve.map(e=>({kind:"tool",tool:e}))],_t=[Re,..._.map((e,t)=>t),...Ve.map((e,t)=>Re+1+t)];function _n(e,t){let n=[];for(let r=t;e.parent(r)>=0;r=e.parent(r))n.push(bt[e.action(r)]);return n.reverse()}function Wt(e,t){return Ge(Nt(e,t),t.onProgress)}function*Nt(e,t){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let n=t.store??mt(be(e.level).words),r=l=>{if(l instanceof je)return{solved:!1,explored:n.size,capped:!0,reason:l.message};throw l},s;try{s=No(e,t,n)}catch(l){return r(l)}for(;;){let l;try{l=s()}catch(o){return r(o)}if("explored"in l)return l;yield l}}function Ge(e,t){for(;;){let n=e.next();if(n.done)return n.value;t?.(n.value)}}function No(e,t,n){let{cap:r,refuse:s}=t,l=t.prune??null,o=Math.max(1,t.progressEvery??65536),i=e.level,a=be(i),u=pt(i),c=new Uint32Array(a.words),h=new Uint32Array(a.words),d=1024,f=new Int32Array(d),m=new Int32Array(d),p=new Int32Array(d),g=new Uint8Array(d),y=new Uint16Array(d),b=new Int32Array(d),w=0,E=S=>{if(S<d)return;for(;d<=S;)d*=2;let R=new Int32Array(d);R.set(f),f=R;let T=new Int32Array(d);T.set(m),m=T;let B=new Int32Array(d);B.set(p),p=B;let A=new Uint8Array(d);A.set(g),g=A;let M=new Uint16Array(d);M.set(y),y=M},L=(S,R)=>f[S]<f[R]||f[S]===f[R]&&(m[S]<m[R]||m[S]===m[R]&&(y[S]>y[R]||y[S]===y[R]&&S<R)),P=S=>{let R=b[S];for(;S>0;){let T=S-1>>1,B=b[T];if(!L(R,B))break;b[S]=B,p[B]=S,S=T}b[S]=R,p[R]=S},O=S=>{if(w===b.length){let R=new Int32Array(b.length*2);R.set(b),b=R}b[w]=S,P(w++)},v=()=>{let S=b[0];p[S]=-1;let R=b[--w];if(w>0){let T=0;for(;;){let B=2*T+1;if(B>=w)break;let A=B+1,M=A<w&&L(b[A],b[B])?A:B;if(!L(b[M],R))break;b[T]=b[M],p[b[T]]=T,T=M}b[T]=R,p[R]=T}return S},I=u(e);if(Be(e,a,c,0),l&&l({...e,moves:0},c,0))return()=>({solved:!1,explored:0,capped:!1});let D=n.add(c,0,-1,0,0);if(n.size>=r)return()=>({solved:!1,explored:n.size,capped:!0});E(D),m[D]=Number.isFinite(I)?I:-1,f[D]=m[D],p[D]=-1,y[D]=e.hearts,m[D]>=0&&O(D);let $=0;return()=>{let S=null;for(;w>0;){if(S)return S;let R=v();if(g[R])return{solved:!0,line:_n(n,R),explored:n.size};let T=f[R],B=T-m[R];++$%o===0&&(S={expanded:$,stored:n.size,bestF:T,startH:I}),n.words(R,h,0);let A=ft(h,0,a,i,B);for(let M of _t){if(M>Re&&A.tools[Ve[M-Re-1]]<=0)continue;let j=q(A,bt[M]),W=j.state;if(Le(A,j)||W.outcome==="lost"||s&&s(j.events,A)||(Be(W,a,c,0,A,h,0),l&&l(W,c,0)))continue;let ne=n.size,F=n.add(c,0,R,M,B+1);if(F<0)continue;let N=W.outcome==="won";if(n.size>ne){E(F);let X=N?0:u(W);m[F]=Number.isFinite(X)?X:-1,p[F]=-1,g[F]=N?1:0,y[F]=W.hearts}if(N&&B+1===T)return{solved:!0,line:_n(n,F),explored:n.size};if(n.size>=r)return{solved:!1,explored:n.size,capped:!0};m[F]<0||(f[F]=B+1+m[F],p[F]>=0?P(p[F]):O(F))}}return{solved:!1,explored:n.size,capped:!1}}}function Ko(e,t){for(let n=0;n<e.terrain.length;n++){if(!t(e.terrain[n]))continue;let r=Math.floor(n/e.cols),s=n%e.cols;for(let l of _){let o=r-K[l][0],i=s-K[l][1];if(o<0||i<0||o>=e.rows||i>=e.cols)continue;let a=H[e.terrain[o*e.cols+i]];if(a.slides||a.carries===l)return!0}}return!1}function Uo(e,t){let n=e.terrain.flatMap((r,s)=>r==="teleport"?[s]:[]);return n.length<2?!1:n.some(r=>_.some(s=>{let l=Math.floor(r/e.cols)+K[s][0],o=r%e.cols+K[s][1];return l>=0&&o>=0&&l<e.rows&&o<e.cols&&t(e.terrain[l*e.cols+o])}))}var Wn=(e,t)=>Ko(e,t)||Uo(e,t);function Yo(e,t){let n=[];t.heartBits&&n.push({pos:t.heartAt,width:t.heartBits,set:!1}),t.pageBits&&n.push({pos:t.pageAt,width:t.pageBits,set:!0}),$e.forEach((s,l)=>{t.keyBits[l]&&!Wn(e,o=>H[o].door===s)&&n.push({pos:t.keyAt[l],width:t.keyBits[l],set:!1})}),t.toolBits.forEach((s,l)=>{s&&n.push({pos:t.toolAt[l],width:s,set:!1})});let r=["flippers","fire-boots"];return t.gear.forEach((s,l)=>{r.includes(s)&&!Wn(e,o=>H[o].needs===s)&&n.push({pos:t.gearAt+l,width:1,set:!1})}),n}var Kt=1024;function yt(e,t){let n=pt(e),r=Yo(e,t);if(!r.length)return M=>n(M)===1/0;let s=t.words,l=new Uint32Array(s);for(let M of r)for(let j=M.pos;j<M.pos+M.width;j++)l[j>>>5]|=1<<(j&31);let o=[],i=0;for(let M of r)o.push(i),i+=M.width;let a=i+31>>>5,u=r.length,c=Int32Array.from(r,M=>M.pos),h=Int32Array.from(r,M=>M.width),d=Uint8Array.from(r,M=>M.set?1:0),f=Int32Array.from(o),m=Uint32Array.from(l,M=>~M>>>0),p=Kt,g=new Uint32Array(p*s),y=new Int32Array(p),b=new Uint32Array(p),w=0,E=new Int32Array(Kt*2),L=E.length-1,P=Kt,O=new Uint32Array(P*a),v=new Uint32Array(P),I=new Int32Array(P),D=0,$=-1,S=new Uint32Array(s),R=new Uint32Array(a);function T(){p*=2;let M=new Uint32Array(p*s);M.set(g),g=M;let j=new Int32Array(p);j.set(y),y=j;let W=new Uint32Array(p);W.set(b),b=W,E=new Int32Array(p*2),L=E.length-1;for(let ne=0;ne<w;ne++){let F=b[ne]&L;for(;E[F]!==0;)F=F+1&L;E[F]=ne+1}}function B(M,j){let W=$;if(W>=0)$=I[W];else{if(D===P){P*=2;let ne=new Uint32Array(P*a);ne.set(O),O=ne;let F=new Uint32Array(P);F.set(v),v=F;let N=new Int32Array(P);N.set(I),I=N}W=D++}return O.set(R,W*a),v[W]=M,I[W]=j,W}function A(M,j,W,ne){for(let F=0;F<u;F++){let N=Y(M,j,f[F],h[F]),X=Y(W,ne,f[F],h[F]);if(d[F]?(N&X)!==X:N<X)return!1}return!0}return(M,j,W)=>{if(n(M)===1/0)return!0;let ne=M.moves;for(let x=0;x<s;x++)S[x]=j[W+x]&m[x];let F=Ht(S,0,s);R.fill(0);for(let x=0;x<u;x++)Z(R,0,f[x],h[x],Y(j,W,c[x],h[x]));let N=F&L,X=-1;for(let x=E[N];x!==0;N=N+1&L,x=E[N]){let k=x-1;if(b[k]!==F)continue;let z=!0;for(let G=0;G<s&&z;G++)z=g[k*s+G]===S[G];if(z){X=k;break}}if(X<0){if(w===p)for(T(),N=F&L;E[N]!==0;)N=N+1&L;return X=w++,g.set(S,X*s),b[X]=F,E[N]=X+1,y[X]=B(ne,-1),!1}for(let x=y[X];x>=0;x=I[x])if(v[x]<=ne&&A(O,x*a,R,0))return!0;let xe=-1;for(let x=y[X];x>=0;){let k=I[x];ne<=v[x]&&A(R,0,O,x*a)?(xe<0?y[X]=k:I[xe]=k,I[x]=$,$=x):xe=x,x=k}return y[X]=B(ne,y[X]),!1}}var de=2e6,ce=e=>e.some(t=>t.kind==="caught");function Ze(e,t=de){return Wt(e,{cap:t,refuse:null,prune:yt(e.level,be(e.level))})}function Nn(e,t,n=de){return Wt(e,{cap:n,refuse:t,prune:yt(e.level,be(e.level))})}function he(e,t,n=de,r={}){return Nt(e,{cap:n,refuse:t,prune:yt(e.level,be(e.level)),store:r.store,progressEvery:r.every})}var Kn={up:"u",down:"d",left:"l",right:"r"},Ut={mirror:"z",cake:"x",cow:"c"};function Oe(e){return e.map(t=>t.kind==="move"?Kn[t.dir]:t.kind==="wait"?"w":Ut[t.tool]).join("")}function He(e){let t=[];for(let n of e){let r=_.find(l=>Kn[l]===n),s=Object.keys(Ut).find(l=>Ut[l]===n);if(r)t.push({kind:"move",dir:r});else if(n==="w")t.push({kind:"wait"});else if(s)t.push({kind:"tool",tool:s});else return null}return t}var Yt=e=>e.solved?e.line.length:e.capped?"unknown":"none";function qn(e,t=de){return Ge(qo(e,t))}function*qo(e,t=de,n={}){let r=ee(e),s=b=>({store:n.store?.(be(b).words),every:n.every}),l=yield*he(r,null,t,s(e)),o=Yt(l),i=0;if(l.solved){let b=r;for(let w of l.line){let E=q(b,w);b=E.state,ce(E.events,b)&&i++}}let a=Yt(yield*he(r,ce,t,s(e))),u=yield*Vo(e,t,s(e)),c=u===null?"unknown":u?"chase":"solo",h=qt(e),d=l.solved?Oe(l.line):"";if(!e.minotaur)return{solved:l.solved,shortest:o,explored:l.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:a,catches:i,label:c,naiveWins:h,line:d};let f={...e,minotaur:null},m=yield*he(ee(f),null,t,s(f)),p=Yt(m),g=m.solved?!1:m.capped?null:!1;if(m.solved){let b=r;for(let w of m.line)b=q(b,w).state;g=b.outcome==="won"}let y=typeof o=="number"&&typeof p=="number"?o-p:null;return{solved:l.solved,shortest:o,explored:l.explored,withoutMinotaur:p,minotaurDelta:y,greedyWins:g,catchFree:a,catches:i,label:c,naiveWins:h,line:d}}function Un(e,t,n,r){let s=new Uint8Array(e.rows*e.cols),l=[t];s[t]=1;for(let o=0;o<l.length;o++){let i=l[o],a=Math.floor(i/e.cols),u=i%e.cols;for(let c of _){let h=a+K[c][0],d=u+K[c][1];if(h<0||d<0||h>=e.rows||d>=e.cols)continue;let f=h*e.cols+d;!s[f]&&n(f)&&(s[f]=1,l.push(f))}if(r?.from(i))for(let c of r.to)!s[c]&&n(c)&&(s[c]=1,l.push(c))}return s}function Vn(e){let t=new Set(e.objects.filter(i=>i!==null));e.machines.some(i=>i.template==="block")&&t.add("block");let n=i=>{let a=H[i];return a.door?t.has(`key-${a.door}`):i==="water"?t.has("block"):i==="toggle-open"||i==="toggle-closed"},r=Un(e,e.minotaur.r*e.cols+e.minotaur.c,i=>{let a=e.terrain[i];return H[a].minotaur||n(a)||a==="fake-wall"||a==="bomb"}),l=e.terrain.flatMap((i,a)=>i==="teleport"?[a]:[]).flatMap(i=>{let a=Math.floor(i/e.cols),u=i%e.cols;return _.flatMap(c=>{let h=a+K[c][0],d=u+K[c][1];return h<0||d<0||h>=e.rows||d>=e.cols?[]:[h*e.cols+d]})}),o=Un(e,e.player.r*e.cols+e.player.c,i=>{let a=e.terrain[i],u=H[a];return a==="wall"?!1:u.door?n(a):!u.needs||t.has(u.needs)||n(a)},{from:i=>e.terrain[i]==="teleport",to:l});return!r.some((i,a)=>i===1&&o[a]===1)}function*Vo(e,t=de,n={}){if(!e.minotaur||Vn(e))return!1;let r=be(e),s=n.store??mt(r.words),l=Math.max(1,n.every??65536);try{let o=new Uint32Array(r.words),i=new Uint32Array(r.words);if(Be(ee(e),r,o,0),s.add(o,0,-1,0,0),s.size>=t)return null;let a=0;for(let u=0;u<s.size;u++){++a%l===0&&(yield{expanded:a,stored:s.size,bestF:0,startH:0}),s.words(u,i,0);let c=ft(i,0,r,e,0);for(let h of _t){if(h>Re&&c.tools[Ve[h-Re-1]]<=0)continue;let d=q(c,bt[h]);if(d.events.some(m=>m.kind==="caught"&&m.by==="minotaur"))return!0;let f=d.state;if(!(Le(c,d)||f.outcome!=="playing")&&(Be(f,r,o,0,c,i,0),s.add(o,0,u,h,0),s.size>=t))return null}}return!1}catch(o){if(o instanceof je)return null;throw o}}var Zo=16;function Xo(e,t){let n=e.rows*e.cols,r=new Int32Array(n).fill(-1),s=new Int8Array(n).fill(-1);r[t]=0;let l=[t];for(let o=0;o<l.length;o++){let i=l[o],a=Math.floor(i/e.cols),u=i%e.cols;_.forEach((c,h)=>{let d=a+K[c][0],f=u+K[c][1];if(d<0||f<0||d>=e.rows||f>=e.cols)return;let m=d*e.cols+f;r[m]>=0||e.terrain[m]==="wall"||(r[m]=r[i]+1,s[m]=h,l.push(m))})}return{dist:r,via:s}}function Jo(e){let t=e.rows*e.cols,n=e.player.r*e.cols+e.player.c,r=[],s=[];for(let p=0;p<t;p++)e.objects[p]==="relic"&&r.push(p),e.terrain[p]==="exit"&&s.push(p);let l=e.relics,o=[n,...r].map(p=>Xo(e,p)),i=p=>{let g=-1,y=1/0;for(let b of s){let w=o[p].dist[b];w>=0&&w<y&&(y=w,g=b)}return[g,y]},a=(p,g)=>{let y=o[p].dist[g===0?n:r[g-1]];return y<0?1/0:y},u=null;if(l===0)u=[];else if(r.length<=Zo){let p=r.length,g=new Float64Array((1<<p)*p).fill(1/0),y=new Int8Array((1<<p)*p).fill(-1);for(let E=0;E<p;E++)g[(1<<E)*p+E]=a(0,E+1);let b=1/0,w=-1;for(let E=1;E<1<<p;E++){let L=Qo(E);if(!(L>l))for(let P=0;P<p;P++){let O=g[E*p+P];if(!(!(E&1<<P)||O===1/0)){if(L===l){let v=O+i(P+1)[1];v<b&&(b=v,w=E*p+P);continue}for(let v=0;v<p;v++){if(E&1<<v)continue;let I=(E|1<<v)*p+v,D=O+a(P+1,v+1);D<g[I]&&(g[I]=D,y[I]=P)}}}}if(w>=0){u=[];for(let E=w;;){let L=Math.floor(E/p),P=E%p;if(u.push(P+1),y[E]<0)break;E=(L&~(1<<P))*p+y[E]}u.reverse()}}else{u=[];let p=new Set(r.map((y,b)=>b+1)),g=0;for(;u.length<l;){let y=-1,b=1/0;for(let w of p){let E=a(g,w);E<b&&(b=E,y=w)}if(y<0){u=null;break}u.push(y),p.delete(y),g=y}}if(!u)return null;let c=u.length?u[u.length-1]:0,[h]=i(c);if(h<0)return null;let d=[],f=[0,...u],m=[...u.map(p=>r[p-1]),h];return f.forEach((p,g)=>{let{via:y}=o[p],b=m[g],w=[];for(let E=b;y[E]>=0;){let L=_[y[E]];w.push(L),E-=K[L][0]*e.cols+K[L][1]}d.push(...w.reverse())}),d}function Qo(e){let t=0;for(;e;e&=e-1)t++;return t}function qt(e){let t=Jo(e);if(!t)return!1;let n=ee(e);for(let r of t)if(n=q(n,{kind:"move",dir:r}).state,n.outcome!=="playing")break;return n.outcome==="won"}var Fe={minotaurDelta:8,exploredTimes:20};function gt(e,t=Fe,n){let r=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let s=e.withoutMinotaur!==null;if(s&&(e.minotaurDelta===null||e.greedyWins===null?r.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&r.push("the Minotaur does not matter: the line that ignores him wins, no longer")),r.push(...Zn(e)),!n)return r;if(!s)return[...r,"a challenge level has a Minotaur"];e.greedyWins!==!1&&r.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<t.minotaurDelta&&r.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${t.minotaurDelta}`);let l=a=>Math.max(0,...n.teaching.map(a)),o=l(a=>a.explored);e.explored<t.exploredTimes*o&&r.push(`a challenge level: stored ${e.explored} situations, the bar is ${t.exploredTimes} × ${o} = ${t.exploredTimes*o}`);let i=l(a=>typeof a.shortest=="number"?a.shortest:0);return typeof e.shortest=="number"&&e.shortest<i&&r.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${i}`),r}function Zn(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var Yn={ramp:{least:1.1,most:1.5},most:2e4};function Ce(e){return e.terrain.some(t=>t==="fake-wall"||t==="invisible-wall")}function Xn(e,t){return!Ce(e)||t.explored<=Yn.most?[]:[`the level hides walls: stored ${t.explored} situations, the ceiling for a level that hides walls is ${Yn.most}`]}var wt={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function Jn(e,t=wt){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let n=[];e.naiveWins&&n.push("the plain walk to the exit wins"),n.push(...Zn(e));let r=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=Fe.minotaurDelta,s=r?t.chaseShortest:t.shortest,l=r?t.chaseExplored:t.explored;return e.shortest<s&&n.push(`the quickest win is ${e.shortest} moves, the bar is ${s}`),e.explored<l&&n.push(`the solver searched ${e.explored} situations, the bar is ${l}`),n}var el={flippers:e=>e.gear.includes("flippers")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="water","fire-boots":e=>e.gear.includes("fire-boots")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="fire",skates:e=>e.gear.includes("skates")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="ice",suction:e=>e.gear.includes("suction")&&H[e.terrain[e.player.r*e.level.cols+e.player.c]].carries!==void 0,mirror:e=>e.stone>0,cow:e=>e.cow!==null},tl={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function ge(e,t){let n=[...e.terrain],r=[...e.objects];t(n,r);let s=e.machines.filter(l=>n[l.at.r*e.cols+l.at.c]==="clone");return J(ke({...e,terrain:n,objects:r,machines:s}))}function xt(e){let t=[],n=o=>`row ${Math.floor(o/e.cols)+1}, column ${o%e.cols+1}`,r=o=>e.terrain[o.player.r*e.cols+o.player.c];for(let o of $e){let i=`key-${o}`,a=u=>H[r(u)].door===o;e.objects.includes(i)&&t.push({name:`the ${o} keys`,ignored:[ge(e,(u,c)=>{c.forEach((h,d)=>{h===i&&(c[d]=null)})})],used:a}),e.terrain.some(u=>H[u].door===o)&&t.push({name:`the ${o} doors`,ignored:["wall","floor"].map(u=>ge(e,(c,h)=>{c.forEach((d,f)=>{H[d].door===o&&(c[f]=u)}),h.forEach((d,f)=>{d===i&&(h[f]=null)})})),used:a})}let s=e.objects.filter(o=>o==="relic").length>e.relics;e.objects.forEach((o,i)=>{o==="block"?t.push({name:`the block at ${n(i)}`,ignored:[ge(e,(a,u)=>{u[i]=null,a[i]="wall"}),ge(e,(a,u)=>{u[i]=null})]}):(o==="relic"?s:o!==null&&o!=="cake"&&o!=="page"&&!o.startsWith("key-"))&&t.push({name:`the ${o==="relic"?"spare relic":o} at ${n(i)}`,ignored:[ge(e,(a,u)=>{u[i]=null})],used:o===null?void 0:el[o]})});let l=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[o,i,a]of l){if(!e.terrain.some(h=>i.includes(h)))continue;let u=a.map(h=>ge(e,d=>{d.forEach((f,m)=>{i.includes(f)&&(d[m]=h)})})),c=tl[i[0]];c&&e.objects.includes(c)&&u.push(ge(e,(h,d)=>{d.forEach((f,m)=>{f===c&&(d[m]=null)})})),t.push({name:`the ${o}`,ignored:u})}return e.terrain.some(o=>o==="button"||o==="toggle-open"||o==="toggle-closed")&&t.push({name:"the toggle walls and their button",ignored:[ge(e,o=>{o.forEach((i,a)=>{i==="button"||i==="toggle-open"?o[a]="floor":i==="toggle-closed"&&(o[a]="wall")})})]}),e.terrain.forEach((o,i)=>{let a=c=>{for(let[h,d]of Object.entries(e.links))d===i&&(c[Number(h)]="floor")},u=(c,h,d,f)=>t.push({name:`the ${c} at ${n(i)}`,ignored:[h,...f?[f]:[]].map(m=>ge(e,p=>{p[i]=m,d?.(p)}))});o==="trap"?u("snare","floor",a):o==="fake-wall"?u("fake wall","wall",void 0,"floor"):o==="invisible-wall"?u("invisible wall","floor"):o==="thief"?u("thief","floor"):o==="bomb"?u("bomb","floor"):o==="clone"&&u("clone machine","wall",a)}),e.hazards.forEach((o,i)=>{t.push({name:`the ${le[o.kind].name.toLowerCase()} at ${n(o.at.r*e.cols+o.at.c)}`,ignored:[J(ke({...e,hazards:e.hazards.filter((a,u)=>u!==i)}))]})}),t}var Qn={explored:1.3};function er(e,t,n,r=!1){let s=Ze(ee(t),n);if(!s.solved)return s.capped?"capped":"the level cannot be won";if(s.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${s.line.length}`;let l=Nn(ee(t),ce,n);return l.solved?l.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${l.line.length}`:!r&&e.explored>=Qn.explored*s.explored?`the search falls from ${e.explored} situations to ${s.explored}`:null:l.capped?"capped":"no win without a catch"}function nl(e,t){let n=new Set;for(let r of t.ignored)for(let s=0;s<e.terrain.length;s++)(r.terrain[s]!==e.terrain[s]||r.objects[s]!==e.objects[s])&&n.add(s);return[...n]}function tr(e,t,n){let r=n.used?[]:nl(e,n);if(!r.length&&!n.used)return!1;let s=ee(e),l=o=>o.r*e.cols+o.c;for(let o of He(t)??[]){if(s=q(s,o).state,n.used?.(s))return!0;let i=l(s.player),a=s.minotaur?l(s.minotaur):-1;for(let u of r)if(i===u||s.terrain[u]!==e.terrain[u]||s.objects[u]!==e.objects[u]||a===u&&e.terrain[u]==="trap")return!0}return!1}function nr(e,t,n=de,r=!1){return!t.solved||typeof t.catchFree!="number"?[]:xt(e).flatMap(s=>{if(r&&tr(e,t.line,s))return[];let l=s.ignored.map(o=>er(t,o,n,r));return l.some(o=>o!==null&&o!=="capped")?[]:l.includes("capped")?[{unit:s,problem:`${s.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:s,problem:r?`${s.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${t.shortest}`:`${s.name}: ignoring it changes nothing (still ${t.shortest} moves, and the search no ${Qn.explored} × smaller)`}]})}function*rr(e,t,n=de){if(!t.solved||typeof t.catchFree!="number")return[];let r=[];for(let s of xt(e)){if(yield{expanded:0,stored:0,bestF:0,startH:0},tr(e,t.line,s))continue;let l=s.ignored.map(o=>er(t,o,n,!0));l.some(o=>o!==null&&o!=="capped")||r.push(l.includes("capped")?`${s.name}: the search without it hit its cap, so it is not proved to matter`:`${s.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${t.shortest}`)}return r}function or(e){let t=[["Theseus",e.player]];e.minotaur&&t.push(["the Minotaur",e.minotaur]);for(let r of e.hazards)t.push([`the ${le[r.kind].name.toLowerCase()}`,r.at]);let n=[];for(let[r,s]of t){let l=s.r*e.cols+s.c,o=e.terrain[l],i=e.objects[l];(o!=="floor"||i!==null)&&n.push(`${r} starts on ${i??o} at row ${s.r+1}, column ${s.c+1}: nothing may start under a figure`)}return n}var _e={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function lr(e){return!e.minotaur||e.objects.includes("mirror")||e.terrain.includes("trap")?!1:Vn(e)}function rl(e,t){let n=e.level;if(!e.minotaur)return 1/0;let r=e.minotaur.r*n.cols+e.minotaur.c,s=e.player.r*n.cols+e.player.c,l=new Map([[r,0]]),o=[r];for(let i=0;i<o.length;i++){let a=o[i],u=l.get(a);if(a===s)return u;if(u>=t)continue;let c=Math.floor(a/n.cols),h=a%n.cols;for(let d of _){let f=c+K[d][0],m=h+K[d][1];if(f<0||m<0||f>=n.rows||m>=n.cols)continue;let p=f*n.cols+m;l.has(p)||p!==s&&(!H[e.terrain[p]].minotaur||e.objects[p]==="block")||(l.set(p,u+1),o.push(p))}}return 1/0}function Vt(e,t){let n=He(t.line)??[],r=ee(e),s=0,l=0,o=0;for(let i of n)r=q(r,i).state,r.stone>0||!!r.minotaur&&(se(wn(r),r.minotaur)||rl(r,_e.reach)<=_e.reach)?(s++,o=0):l=Math.max(l,++o);return{turns:n.length,live:s,quiet:l}}function sr(e,t,n){if(!e.minotaur||!t.solved||typeof t.shortest!="number")return[];let r=[];t.minotaurDelta!==null&&t.minotaurDelta<1&&r.push("the beast adds no moves: a route that ignores him wins as quickly");let s=_e[n],l=Vt(e,t);return l.live<s.share*l.turns&&r.push(`the beast is live on ${l.live} of ${l.turns} turns; the bar is ${Math.ceil(s.share*l.turns)}`),l.quiet>s.quiet*l.turns&&r.push(`the beast is quiet for ${l.quiet} turns in a row; the bar is ${Math.floor(s.quiet*l.turns)}`),r}var ol={walk:"walks round the Minotaur and never uses a tool",cowAtOnce:"sets the cow down as soon as it holds it",cowNear:"sets the cow down when the Minotaur is within 3 steps",mirrorNear:"raises the mirror when the Minotaur is within 2 steps",toolsNear:"sets the cow down and raises the mirror when the Minotaur comes near",careful:"takes the safest step when its next one would be caught",carefulTools:"is careful and sets the cow down and raises the mirror when the Minotaur comes near",cowStuck:"sets the cow down where the Minotaur gets stuck behind a wall short of it",cowStuckCareful:"sets the cow down where the Minotaur gets stuck, raises the mirror when he is near, and is careful"},Je=Object.keys(ol),ll={walk:{cow:"none",mirror:!1,careful:!1},cowAtOnce:{cow:"once",mirror:!1,careful:!1},cowNear:{cow:"near",mirror:!1,careful:!1},mirrorNear:{cow:"none",mirror:!0,careful:!1},toolsNear:{cow:"near",mirror:!0,careful:!1},careful:{cow:"none",mirror:!1,careful:!0},carefulTools:{cow:"near",mirror:!0,careful:!0},cowStuck:{cow:"stuck",mirror:!1,careful:!1},cowStuckCareful:{cow:"stuck",mirror:!0,careful:!0}},sl=_.map(e=>({kind:"move",dir:e})),Xe={kind:"wait"},kt=e=>({kind:"tool",tool:e}),il=(e,t)=>Math.abs(e.r-t.r)+Math.abs(e.c-t.c),We=e=>e.some(t=>t.kind==="caught");function al(e){let t=q(e,kt("cow"));if(t.state===e||We(t.events))return!1;let n=t.state;for(let r=0;r<10;r++){if(t=q(n,Xe),We(t.events)||t.state.outcome!=="playing")return!1;n=t.state}return!!n.cow}function ul(e,t){let n=null;for(let r=0;r<e.terrain.length;r++){let s=e.terrain[r];(s==="fake-wall"||s==="invisible-wall")&&(n??=[...e.terrain],n[r]=s==="fake-wall"?"wall":"floor")}return t?{...e,terrain:n??e.terrain}:{...e,terrain:n??e.terrain,minotaur:null,stone:0}}var ur=(e,t)=>t.relicsLeft<e.relicsLeft,dr=(e,t)=>t.outcome==="won",ir=e=>e.keys.red+e.keys.blue+e.keys.yellow+e.keys.green,Tt=(e,t)=>ir(t)>ir(e)||t.gear.length>e.gear.length||t.tools.mirror>e.tools.mirror||t.tools.cow>e.tools.cow||t.tools.cake>e.tools.cake,dl=e=>(t,n)=>n.tools[e]>t.tools[e];function we(e,t){return ar(e,t,!0)??ar(e,t,!1)}function ar(e,t,n){let r=ul(e,n),s=e.level.cols,l=new Set;for(let u of e.hazards){l.add(u.at.r*s+u.at.c);let[c,h]=K[u.dir];l.add((u.at.r+c)*s+u.at.c+h)}let o=u=>u.player.r*s+u.player.c,i=new Set([o(r)]),a=[];for(let u of _){let c=jt(r,{kind:"move",dir:u});if(c.state===r||We(c.events)||c.state.player===r.player&&c.state.terrain===r.terrain||c.events.some(d=>d.kind==="robbed")||l.has(o(c.state)))continue;if(t(r,c.state))return{first:u,dist:1};let h=o(c.state);i.has(h)||(i.add(h),a.push({s:c.state,first:u}))}for(let u=2;a.length&&u<400;u++){let c=[];for(let{s:h,first:d}of a)for(let f of _){let m=jt(h,{kind:"move",dir:f});if(m.state===h||We(m.events)||m.state.outcome==="lost"||m.events.some(g=>g.kind==="robbed"))continue;let p=o(m.state);if(!l.has(p)){if(t(r,m.state))return{first:d,dist:u};i.has(p)||(i.add(p),c.push({s:m.state,first:d}))}}a=c}return null}function Qe(e){let t=e.relicsLeft>0?we(e,ur)??we(e,Tt):we(e,dr)??we(e,Tt);return t?t.dist:1/0}function cl(e,t){for(let n of t)if(e.objects.some(r=>r===n)){let r=we(e,dl(n));if(r)return r}return e.relicsLeft>0?we(e,ur)??we(e,Tt):we(e,dr)??we(e,Tt)}function hl(e,t){let n=e.minotaur,r=n?il(n,e.player):1/0;if(e.tools.cake>0&&e.hearts<=1)return kt("cake");if(t.cow!=="none"&&e.tools.cow>0&&!e.cow&&(t.cow==="stuck"?al(e):t.cow==="once"||r<=3))return kt("cow");if(t.mirror&&e.tools.mirror>0&&e.stone===0&&r<=2)return kt("mirror");let s=[];t.cow!=="none"&&s.push("cow"),t.mirror&&s.push("mirror");let l=cl(e,s),o=l?{kind:"move",dir:l.first}:Xe;if(o.kind==="move"&&q(e,o).state===e&&(o=Xe),t.careful&&We(q(e,o).events)){let i=null,a=1/0;for(let u of[...sl,Xe]){let c=q(e,u);if(c.state===e||We(c.events))continue;let h=Qe(c.state);h<a&&(a=h,i=u)}i&&(o=i)}return o}function Zt(e,t,n){let r=ll[t],s=ee(e),l=0;for(;l<n&&s.outcome==="playing";l++){let o=hl(s,r),i=q(s,o);i.state===s&&(i=q(s,Xe)),s=i.state}return{won:s.outcome==="won",turns:l}}var Xt=e=>4*e+50;function cr(e,t){return Je.filter(n=>Zt(e,n,Xt(t)).won)}var Ne={detour:1,offRoute:1,away:2,waits:3,traps:3,forced:4},fl=3,pl=e=>Math.max(5e4,2*e.explored),ml=e=>Math.max(6e3,e.explored),hr=_.map(e=>({kind:"move",dir:e})),fr={kind:"wait"},Qt=e=>e.some(t=>t.kind==="caught");function bl(e){let t={...e.level,minotaur:null};return{...e,level:t,minotaur:null,stone:0}}function*et(e,t,n={spent:0}){let r=He(t.line)??[],s=Math.max(0,t.minotaurDelta??0),l=0;if(e.minotaur&&r.length){let h=function*(m){if(m.outcome==="won")return 0;let p=yield*he(bl(m),null,pl(t));return n.spent+=p.explored,p.solved?p.line.length:p.capped?NaN:1/0},d=ee(e),f=yield*h(d);for(let m of r){let p=q(d,m).state,g=yield*h(p);Number.isFinite(f)&&!Number.isNaN(g)&&g!==f-1&&l++,f=g,d=p}}let o=0,i=0,a=0;{let h=ee(e),d=Qe(h);for(let f of r){let m=0;for(let y of[...hr,fr]){let b=q(h,y);y.kind==="move"&&Le(h,b)||Qt(b.events)||b.state.outcome==="lost"||m++}m===1&&a++,f.kind==="wait"&&i++;let p=q(h,f).state,g=p.outcome==="won"||p.relicsLeft<h.relicsLeft?0:Qe(p);f.kind==="move"&&Number.isFinite(d)&&g>d&&o++,d=g===0?Qe(p):g,h=p}}let u=0;{let h=ee(e);for(let d=0;d<r.length;d++){let f=r[d];if(d%fl===0)for(let m of[...hr,fr]){if(m.kind===f.kind&&(m.kind!=="move"||f.kind!=="move"||m.dir===f.dir))continue;let p=q(h,m);if(m.kind==="move"&&Le(h,p)||Qt(p.events)||p.state.outcome!=="playing")continue;let g=yield*he(p.state,ce,ml(t));n.spent+=g.explored,!g.solved&&!g.capped&&u++}h=q(h,f).state}}let c=Ne.detour*s+Ne.offRoute*l+Ne.away*o+Ne.waits*i+Ne.traps*u+Ne.forced*a;return{detour:s,offRoute:l,away:o,waits:i,traps:u,forced:a,total:c}}var yl=new Set(["wall","door-red","door-blue","door-yellow","door-green","gate","toggle-closed","fake-wall","invisible-wall","clone"]),Jt={most:.5,area:6};function gl(e){let t=e.rows,n=e.cols,r=(c,h)=>c>=0&&h>=0&&c<t&&h<n&&!yl.has(e.terrain[c*n+h]),s=0;for(let c=0;c<t;c++)for(let h=0;h<n;h++)r(c,h)&&s++;let l=new Uint8Array(t*n),o=new Uint8Array(t*n);for(let c=0;c+1<t;c++)for(let h=0;h+1<n;h++)r(c,h)&&r(c+1,h)&&r(c,h+1)&&r(c+1,h+1)&&(l[c*n+h]=1,o[c*n+h]=o[(c+1)*n+h]=o[c*n+h+1]=o[(c+1)*n+h+1]=1);let i=new Uint8Array(t*n),a=[];for(let c=0;c<t*n;c++){if(!l[c]||i[c])continue;let h=new Set,d=[c];i[c]=1;for(let f=0;f<d.length;f++){let m=d[f],p=Math.floor(m/n),g=m%n;h.add(m),h.add(m+1),h.add(m+n),h.add(m+n+1);for(let[y,b]of[[1,0],[-1,0],[0,1],[0,-1]]){let w=p+y,E=g+b,L=w*n+E;w>=0&&E>=0&&w<t&&E<n&&l[L]&&!i[L]&&(i[L]=1,d.push(L))}}a.push({cells:[...h].sort((f,m)=>f-m)})}let u=0;for(let c of o)u+=c;return{open:s,share:s?u/s:0,areas:a}}function wl(e,t){let n=e.cols,r=new Set([e.player.r*n+e.player.c,...e.hazards.map(l=>l.at.r*n+l.at.c)]);e.minotaur&&r.add(e.minotaur.r*n+e.minotaur.c);let s=[...e.terrain];for(let l of t){let o=Math.floor(l/n),i=l%n;o%2===0&&i%2===0&&s[l]==="floor"&&e.objects[l]===null&&!r.has(l)&&(s[l]="wall")}return J(ke({...e,terrain:s}))}function*xl(e,t){let n=yield*he(ee(e),ce,t);if(!n.solved)return null;let r=0;if(e.minotaur){let s=yield*he(ee({...e,minotaur:null}),null,t);if(!s.solved)return null;r=n.line.length-s.line.length}return yield*et(e,{line:Oe(n.line),minotaurDelta:r,explored:n.explored})}var kl=(e,t)=>`row ${Math.floor(t/e.cols)+1}, column ${t%e.cols+1}`;function*mr(e,t,n){let r=gl(e),s=[];r.share>Jt.most&&s.push({rule:"open",words:`Too open: ${Math.round(100*r.share)}% of the floor is open space (at most ${Math.round(100*Jt.most)}%)`});for(let l of r.areas){if(l.cells.length<Jt.area)continue;let o=wl(e,l.cells);if(o.terrain.every((a,u)=>a===e.terrain[u]))continue;let i=yield*xl(o,n);i&&i.total>=t.total&&s.push({rule:"open-area",words:`An open area near ${kl(e,l.cells[0])} does not earn its place: walled into corridors, the level is as hard (${i.total} against ${t.total})`,mended:o})}return s}var Tl={walk:"The plain walk wins: walking to each relic and the exit, round the Minotaur, clears it",cowAtOnce:"The cow habit wins: setting the cow down at once and walking clears it",cowNear:"The cow habit wins: setting the cow down when the Minotaur comes near clears it",mirrorNear:"The mirror habit wins: raising the mirror when the Minotaur comes near clears it",toolsNear:"The tool habit wins: using the cow and the mirror when the Minotaur comes near clears it",careful:"The careful walk wins: stepping aside whenever the Minotaur would catch clears it",carefulTools:"The careful walk with tools wins: stepping aside and using the tools when he is near clears it",cowStuck:"The cow habit wins: setting the cow down where the Minotaur gets stuck clears it",cowStuckCareful:"The cow habit wins: setting the cow down where he gets stuck and stepping aside clears it"};function br(e,t){return typeof t.shortest!="number"?[]:Je.filter(n=>Zt(e,n,Xt(t.shortest)).won).map(n=>({rule:`habit:${n}`,words:Tl[n]}))}var pr=(e,t)=>J(ke({...e,objects:e.objects.map(n=>n===t?null:n)}));function*yr(e,t,n,r){let s=[];if(typeof t.shortest!="number")return s;for(let l of["cow","mirror"]){if(!e.objects.includes(l))continue;let o=yield*he(ee(pr(e,l)),ce,r);o.solved&&o.line.length<=t.shortest&&s.push({rule:`tool:${l}`,words:`The ${l} is not needed: without it the level is won in ${o.line.length} moves`,mended:pr(e,l)})}if(n==="hard"&&e.objects.includes("cow")){let l=ee(e);for(let o of He(t.line)??[]){if(l.tools.cow>0&&!l.cow){let i=q(l,{kind:"tool",tool:"cow"});!Qt(i.events)&&i.state!==l&&(yield*he(i.state,ce,r)).solved&&s.push({rule:"tool:cow-early",words:"The cow works too early: setting it down as soon as it is held still wins"});break}l=q(l,o).state}}return s}function en(e,t=0){let n=3735928559^t,r=1103547991^t;for(let s=0;s<e.length;s++){let l=e.charCodeAt(s);n=Math.imul(n^l,2654435761),r=Math.imul(r^l,1597334677)}return n=Math.imul(n^n>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),r=Math.imul(r^r>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),[n>>>0,r>>>0]}function tn(...e){return en(e.join(""))[0]}function gr(...e){let t=e.join(""),[n,r]=en(t),[s,l]=en(t,2654435769),o=n,i=r,a=s,u=l|1,c=()=>{let d=(o+i|0)+u|0;return u=u+1|0,o=i^i>>>9,i=a+(a<<3)|0,a=a<<21|a>>>11,a=a+d|0,(d>>>0)/4294967296};for(let d=0;d<12;d++)c();let h=d=>Math.floor(c()*d);return{next:c,int:h,pick:d=>d[h(d.length)],shuffle(d){let f=[...d];for(let m=f.length-1;m>0;m--){let p=h(m+1);[f[m],f[p]]=[f[p],f[m]]}return f}}}var Mt={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function nn(e){return Object.keys(Mt).filter(t=>Mt[t]<=e)}var Ke=["fake","invisible"],Et=["tree","winding","branching","sidewinder","division","braided"],ae={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},De=["up","down","left","right"];function Ml(e,t,n){let r=e.length,s=e[0].length;return t<=0||n<=0||t>=r-1||n>=s-1||e[t][n]!=="#"?!1:e[t-1][n]!=="#"&&e[t+1][n]!=="#"&&e[t][n-1]!=="#"&&e[t][n+1]!=="#"}function xr(e,t,n){let r=e[t][n];e[t][n]=".";let s=De.some(l=>Ml(e,t+ae[l][0],n+ae[l][1]));return e[t][n]=r,!s}function kr(e,t){let{rows:n,cols:r}=t;if(n%2===0||r%2===0||n<7||r<7)return null;let s=(n-1)/2,l=(r-1)/2,o=Array.from({length:n},()=>Array(r).fill("#")),i=x=>2*Math.floor(x/l)+1,a=x=>2*(x%l)+1,u=s*l;for(let x=0;x<u;x++)o[i(x)][a(x)]=".";let c=x=>{let k=Math.floor(x/l),z=x%l,G=[];return k>0&&G.push(x-l),k<s-1&&G.push(x+l),z>0&&G.push(x-1),z<l-1&&G.push(x+1),G},h=(x,k)=>[(i(x)+i(k))/2,(a(x)+a(k))/2],d=[],f=(x,k)=>{let[z,G]=h(x,k);o[z][G]=".",d.push({r:z,c:G})};for(let[x,k]of El(e,t.style,s,l,t.winding,c))f(x,k);let m=(x,k)=>o[x][k]!=="#",p=x=>De.filter(k=>m(i(x)+ae[k][0],a(x)+ae[k][1])).length;for(let x of e.shuffle([...Array(u).keys()])){if(p(x)!==1||e.next()>=t.braid)continue;let k=e.shuffle(c(x).filter(z=>{let[G,Q]=h(x,z);return o[G][Q]==="#"&&xr(o,G,Q)}));k.length&&f(x,k[0])}let g=new Set;for(let x=0;x<t.chambers&&s>2&&l>2;x++){let k=e.int(s-1),z=e.int(l-1);for(let G=2*k+1;G<=2*k+3;G++)for(let Q=2*z+1;Q<=2*z+3;Q++)o[G][Q]==="#"&&(o[G][Q]="."),g.add(G*r+Q)}let y=d.filter(x=>!g.has(x.r*r+x.c));y.length!==d.length&&(d.length=0,d.push(...y));let b=(x,k)=>d.some(z=>z.r===x&&z.c===k),w=()=>{let x=[];for(let k=1;k<n-1;k++)for(let z=1;z<r-1;z++)o[k][z]==="."&&!b(k,z)&&x.push([k,z]);return x},E=(x,k)=>De.filter(z=>m(x+ae[z][0],k+ae[z][1])).length===1,L=(x=!1)=>{let k=w();if(!k.length)return null;let z=x?k.filter(([G,Q])=>E(G,Q)):[];return e.pick(z.length?z:k)},P=(x,k=!1)=>{let z=L(k);return z?(o[z[0]][z[1]]=x,!0):!1},O=()=>e.shuffle(d.filter(x=>o[x.r][x.c]===".")),v=x=>{let k=O()[0];return k?(o[k.r][k.c]=x,!0):!1},I=()=>{let x=[];for(let k=1;k<n-1;k++)for(let z=1;z<r-1;z++)o[k][z]==="#"&&(o[k-1][z]==="."&&o[k+1][z]==="."&&o[k][z-1]==="#"&&o[k][z+1]==="#"||o[k][z-1]==="."&&o[k][z+1]==="."&&o[k-1][z]==="#"&&o[k+1][z]==="#")&&x.push([k,z]);return x.length?e.pick(x):null},D=x=>{for(let k of O()){let z=m(k.r-1,k.c)&&m(k.r+1,k.c)?["up","down"]:["left","right"],G=[[k.r,k.c]],Q=2+e.int(3);for(let fe of e.shuffle(z)){let ue=k.r,ye=k.c;for(;G.length<Q&&(ue+=ae[fe][0],ye+=ae[fe][1],o[ue]?.[ye]===".");)G.push([ue,ye])}if(!(G.length<2)){for(let[fe,ue]of G)o[fe][ue]=x;return!0}}return!1},$=new Map,S=new Map,R=x=>{let k=L();return k?(o[k[0]][k[1]]=x,$.set(k[0]*r+k[1],e.pick(De)),!0):!1},T=!0;for(let x of t.families){switch(x){case"keys":{let[k,z]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),G=1+e.int(2);for(let Q=0;Q<G;Q++)T=v(k)&&T;for(let Q=0;Q<(k==="G"?1:G);Q++)T=P(z,!0)&&T;break}case"water":T=D("~")&&(e.next()<.5?P("f",!0):P("O"))&&T;break;case"fire":T=D("F")&&P("h",!0)&&T;break;case"ice":{T=D("=")&&T,e.next()<.5&&(T=P("k",!0)&&T);break}case"force":{T=D(e.pick(["^","v","<",">"]))&&T,e.next()<.5&&(T=P("u",!0)&&T);break}case"blocks":{let k=1+e.int(2);for(let z=0;z<k;z++)T=P("O")&&T;break}case"toggle":{let k=1+e.int(2);for(let z=0;z<k;z++)T=v(e.next()<.5?"T":"t")&&T;T=P("_")&&T;break}case"mirror":T=P("z",!0)&&T;break;case"cow":T=P("c",!0)&&T;break;case"gravel":{let k=1+e.int(2);for(let z=0;z<k;z++)T=v(":")&&T;break}case"popup":T=v(";")&&T;break;case"fake":{let k=e.next()<.6?I():null;k?o[k[0]][k[1]]="W":T=v("W")&&T;break}case"invisible":T=(e.next()<.5?v("I"):P("I"))&&T;break;case"snare":T=(e.next()<.5?v("&"):P("&"))&&P("-")&&T;break;case"teleport":T=P("@",!0)&&P("@",!0)&&T;break;case"ball":T=R("o")&&T;break;case"glider":T=R("w")&&T;break;case"fireball":T=R("e")&&T;break;case"thief":T=v("$")&&T;break;case"bomb":T=(e.next()<.5?v("!"):P("!"))&&T;break;case"clone":{let k=!1;for(let z=0;z<60&&!k;z++){let G=1+e.int(n-2),Q=1+e.int(r-2),fe=e.pick(De),ue=G+ae[fe][0],ye=Q+ae[fe][1];o[G][Q]!=="#"||o[ue]?.[ye]!=="."||(o[G][Q]="C",S.set(G*r+Q,`${e.pick(["block","ball","block"])}-${fe}`),k=!0)}T=k&&P("+")&&T;break}}if(!T)return null}let B=L();if(!B)return null;o[B[0]][B[1]]="P";let A=Pl(o,B),M=[];for(let x=1;x<n-1;x++)o[x][1]==="."&&M.push([x,0,x,1,A[x*r+1]]),o[x][r-2]==="."&&M.push([x,r-1,x,r-2,A[x*r+r-2]]);for(let x=1;x<r-1;x++)o[1][x]==="."&&M.push([0,x,1,x,A[r+x]]),o[n-2][x]==="."&&M.push([n-1,x,n-2,x,A[(n-2)*r+x]]);M.sort((x,k)=>k[4]-x[4]||x[0]-k[0]||x[1]-k[1]);let j=M.filter(x=>x[4]>0).slice(0,Math.max(1,Math.ceil(M.length/3)));if(!j.length)return null;let[W,ne,F,N]=e.pick(j);o[W][ne]="E";for(let x=0;x<t.relics;x++){let k=wr(o,A,.5,1).filter(([ue,ye])=>!(ue===F&&ye===N)),z=k.filter(([ue,ye])=>E(ue,ye)),G=z.length&&e.next()<.7?z:k;if(!G.length)return null;let[Q,fe]=e.pick(G);o[Q][fe]="*"}let X=wr(o,A,.25,.6);if(!X.length)return null;let xe=e.pick(X);return o[xe[0]][xe[1]]="M",t.relics>0&&e.next()<.5&&o[F][N]==="."&&!b(F,N)&&(o[F][N]="|"),{g:o,doors:d,facing:$,machines:S}}function El(e,t,n,r,s,l){let o=n*r,i=[];if(t==="sidewinder"){let d=e.next()<.5,f=e.next()<.5,m=d?r:n,p=d?n:r,g=(y,b)=>{let w=f?m-1-y:y;return d?b*r+w:w*r+b};for(let y=0;y<m;y++){let b=[];for(let w=0;w<p;w++){b.push(g(y,w));let E=y>0&&(w===p-1||e.next()<.5);if(y===0?w<p-1:!E){i.push([g(y,w),g(y,w+1)]);continue}if(y>0){let L=e.int(b.length);i.push([b[L],g(y-1,L+w-b.length+1)])}b=[]}}return i}if(t==="division"){let d=new Set,f=(m,p,g,y)=>{let b=g-m+1,w=y-p+1;if(b<2||w<2)return;if(b>w||b===w&&e.next()<.5){let L=m+e.int(b-1),P=p+e.int(w);for(let O=p;O<=y;O++)O!==P&&d.add(`${L*r+O}:${(L+1)*r+O}`);f(m,p,L,y),f(L+1,p,g,y)}else{let L=p+e.int(w-1),P=m+e.int(b);for(let O=m;O<=g;O++)O!==P&&d.add(`${O*r+L}:${O*r+L+1}`);f(m,p,g,L),f(m,L+1,g,y)}};f(0,0,n-1,r-1);for(let m=0;m<o;m++)m%r<r-1&&!d.has(`${m}:${m+1}`)&&i.push([m,m+1]),m+r<o&&!d.has(`${m}:${m+r}`)&&i.push([m,m+r]);return i}let a=t==="winding"?Math.max(s,.85):t==="branching"?Math.min(s,.15):s,u=new Uint8Array(o),c=e.int(o);u[c]=1;let h=[c];for(;h.length;){let d=e.next()<a?h.length-1:e.int(h.length),f=h[d],m=l(f).filter(g=>!u[g]);if(!m.length){h.splice(d,1);continue}let p=e.pick(m);i.push([f,p]),u[p]=1,h.push(p)}return i}function Pl(e,t){let n=e.length,r=e[0].length,s=new Int32Array(n*r).fill(-1);s[t[0]*r+t[1]]=0;let l=[t[0]*r+t[1]];for(let o=0;o<l.length;o++){let i=l[o],a=Math.floor(i/r),u=i%r;for(let c of De){let h=a+ae[c][0],d=u+ae[c][1];if(h<=0||d<=0||h>=n-1||d>=r-1)continue;let f=h*r+d;s[f]>=0||e[h][d]==="#"||(s[f]=s[i]+1,l.push(f))}}return s}function wr(e,t,n,r){let s=e.length,l=e[0].length,o=[];for(let i=1;i<s-1;i++)for(let a=1;a<l-1;a++)e[i][a]==="."&&t[i*l+a]>0&&o.push([i,a,t[i*l+a]]);return o.sort((i,a)=>i[2]-a[2]||i[0]-a[0]||i[1]-a[1]),o.slice(Math.floor(o.length*n),Math.ceil(o.length*r)).map(([i,a])=>[i,a])}function Ie(e,t){let n=[`title: ${t}`,"intro: "],r=[...e.facing.keys()].sort((l,o)=>l-o);r.length&&n.push(`facing: ${r.map(l=>e.facing.get(l)).join(" ")}`);let s=[...e.machines.keys()].sort((l,o)=>l-o);return s.length&&n.push(`machines: ${s.map(l=>e.machines.get(l)).join(" ")}`),`${n.join(`
`)}

${e.g.map(l=>l.join("")).join(`
`)}
`}var Al=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function Tr(e,t){let n=t.g.map(c=>[...c]),r=n.length,s=n[0].length,l=[...t.doors],o=new Map(t.facing),i=c=>{let h=[];for(let d=1;d<r-1;d++)for(let f=1;f<s-1;f++)c(d,f)&&h.push([d,f]);return h},a=(c,h)=>l.some(d=>d.r===c&&d.c===h),u=e.next();if(u<.55){let c=i((d,f)=>Al.has(n[d][f])&&!a(d,f)),h=i((d,f)=>n[d][f]==="."&&!a(d,f));if(c.length&&h.length){let[d,f]=e.pick(c),[m,p]=e.pick(h);n[m][p]=n[d][f],n[d][f]=".";let g=o.get(d*s+f);g&&(o.delete(d*s+f),o.set(m*s+p,g))}}else if(u<.7){let c=l.filter(d=>n[d.r][d.c]!=="."),h=l.filter(d=>n[d.r][d.c]===".");if(c.length&&h.length){let d=e.pick(c),f=e.pick(h);n[f.r][f.c]=n[d.r][d.c],n[d.r][d.c]="."}}else if(u<.8&&o.size)o.set(e.pick([...o.keys()]),e.pick(De));else{let c=l.filter(d=>n[d.r][d.c]==="."),h=i((d,f)=>n[d][f]==="#"&&(n[d-1][f]!=="#"&&n[d+1][f]!=="#"&&n[d][f-1]==="#"&&n[d][f+1]==="#"||n[d][f-1]!=="#"&&n[d][f+1]!=="#"&&n[d-1][f]==="#"&&n[d+1][f]==="#")&&xr(n,d,f));if(c.length>1&&(e.next()<.5||!h.length)){let d=e.pick(c);n[d.r][d.c]="#",l=l.filter(f=>f!==d)}else if(h.length){let[d,f]=e.pick(h);n[d][f]=".",l.push({r:d,c:f})}}return{g:n,doors:l,facing:o,machines:new Map(t.machines)}}var Mr=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function vl(e,t,n){for(let r=-1;r<=1;r++)for(let s=-1;s<=1;s++){let l=t+r,o=n+s;if(l>=0&&o>=0&&l<e.rows&&o<e.cols&&Mr(e.terrain[l*e.cols+o])!=="wall")return!1}return!0}function rn(e){return Array.from({length:e.rows-2},(t,n)=>Array.from({length:e.cols-2},(r,s)=>{let l=Mr(e.terrain[(n+1)*e.cols+s+1]);return l==="wall"&&vl(e,n+1,s+1)?"":l}))}var Sl=e=>e[0].map((t,n)=>e.map(r=>r[n]).reverse()),zl=e=>e.map(t=>[...t].reverse());function on(e){let t=[];for(let n=0,r=e;n<4;n++,r=Sl(r))t.push(r,zl(r));return t}function Ue(e,t){let n=0;for(let r of t){let[s,l]=e.length*e[0].length<=r.length*r[0].length?[e,r]:[r,e],o=s.length,i=s[0].length,a=l.length,u=l[0].length;if(!(o>a||i>u||a-o>2||u-i>2))for(let c=0;c<=a-o;c++)for(let h=0;h<=u-i;h++){let d=0,f=0;for(let m=0;m<o;m++)for(let p=0;p<i;p++){let g=s[m][p],y=l[m+c][p+h];g&&g===y&&d++,(g||y)&&f++}n=Math.max(n,f?d/f:1)}}return n}var zr=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function ln(e){let t=new Set(e.terrain);return t.has("thief")||t.has("bomb")||t.has("clone")||t.has("button-red")?9:e.hazards.some(n=>n.kind!=="ball")?8:e.hazards.length?7:t.has("teleport")?6:t.has("trap")||t.has("button-brown")?5:t.has("fake-wall")||t.has("invisible-wall")?4:t.has("popup")?3:t.has("gravel")?2:1}var Pt=2e3,Ll={...wt,explored:Pt,chaseExplored:Pt},Rl=e=>({teaching:[{explored:Math.ceil(Pt/Fe.exploredTimes),shortest:zr[e-1].shortest}]});function Lr(e){let t=zr[e-1];return{explored:Pt,shortest:Math.max(wt.chaseShortest,t.shortest)}}var nt=3e4,Rr=4*nt,sn={easy:{first:[25,40],plateau:[45,70]},medium:{first:[35,55],plateau:[70,110]},hard:{first:[50,75],plateau:[110,170]}},rt={least:1.1,most:1.35},Ye={least:.7,most:.9},Or=5;function an(e,t){let n=sn[t];if(e===null)return{least:n.first[0],most:n.first[1],plateau:!1};let r={least:n.plateau[0],most:n.plateau[1],plateau:!0};if(e>=n.plateau[0])return r;let s=Math.max(n.first[0],Math.ceil(e*rt.least)),l=Math.min(n.plateau[1],Math.floor(e*rt.most));return s>=n.plateau[0]?r:{least:s,most:Math.max(l,s+4),plateau:!1}}function Fr(e){return{least:Math.floor(e.least*Ye.least),most:Math.max(Math.floor(e.least*Ye.most),Math.floor(e.least*Ye.least)+4),plateau:e.plateau}}function ot(e){return rn(e).map((t,n)=>t.map((r,s)=>(n+1)%2===0&&(s+1)%2===0?"":r))}function Cr(e){return{features:e.map(t=>on(ot(t)))}}function un(e){let{rows:t,cols:n}=e,r=(o,i)=>e.terrain[o*n+i]==="wall",s=(o,i)=>4-[r(o-1,i),r(o+1,i),r(o,i-1),r(o,i+1)].filter(Boolean).length,l=[];for(let o=1;o<t-1;o++)for(let i=1;i<n-1;i++){let a=o*n+i,u=4-s(o,i);if(r(o,i)&&u===0&&l.push(`a lone wall at row ${o+1}, column ${i+1}`),!(e.terrain[a]==="floor"&&e.objects[a]===null&&!(e.player.r===o&&e.player.c===i)&&!(e.minotaur?.r===o&&e.minotaur.c===i)&&!e.hazards.some(f=>f.at.r===o&&f.at.c===i))||u<3)continue;let[h,d]=r(o-1,i)?r(o+1,i)?r(o,i-1)?[o,i+1]:[o,i-1]:[o+1,i]:[o-1,i];(u===4||h<=0||d<=0||h>=t-1||d>=n-1||s(h,d)!==2)&&l.push(`a bare pocket at row ${o+1}, column ${i+1}`)}return l}function Ol(e){let{rows:t,cols:n}=e,r=rn(e),s=(b,w)=>b>=1&&w>=1&&b<t-1&&w<n-1,l=(b,w)=>s(b,w)&&r[b-1][w-1]!=="wall",o=(b,w)=>s(b,w)&&r[b-1][w-1]==="wall",i=0,a=0,u=0,c=0,h=[[0,0],[0,0],[0,0]],d=(b,w,E,L,P,O)=>{if(b(w-L,E-P))return;let v=0;for(;b(w+v*L,E+v*P);)v++;v>=2&&(O[0]++,O[1]+=v)};for(let b=1;b<t-1;b++)for(let w=1;w<n-1;w++){if(o(b,w)){d(o,b,w,0,1,h[2]),d(o,b,w,1,0,h[2]);continue}i++;let E=[l(b-1,w),l(b+1,w),l(b,w-1),l(b,w+1)].filter(Boolean).length;E===1&&a++,E>=3&&u++,l(b,w+1)&&c++,l(b+1,w)&&c++,d(l,b,w,0,1,h[0]),d(l,b,w,1,0,h[1])}let f=Math.max(1,i),m=([b,w])=>b?w/b:0,[p,g,y]=h.map(m);return{rows:t,cols:n,dead:a/f,forks:u/f,loops:Math.max(0,c-i+1)/f,run:m([h[0][0]+h[1][0],h[0][1]+h[1][1]]),walls:y,skew:p+g?Math.abs(p-g)/(p+g):0}}var Er={dead:.08,forks:.08,loops:.05,run:2,walls:3,skew:.3};function Fl(e,t){let n=(o,i)=>Math.min(o,i)/Math.max(o,i),r=Math.max(n(e.rows,t.rows)*n(e.cols,t.cols),n(e.rows,t.cols)*n(e.cols,t.rows)),s=Object.keys(Er),l=s.reduce((o,i)=>o+Math.abs(e[i]-t[i])/Er[i],0)/s.length;return r*Math.max(0,1-l)}var dn=.6;function Dr(e,t){return Math.max(Fl(vr(e),vr(t)),Ue(ot(e),cn(t))*dn/.42)}var Pr=new WeakMap,Ar=new WeakMap,vr=e=>{let t=Pr.get(e);return t||(t=Ol(e),Pr.set(e,t)),t},cn=e=>{let t=Ar.get(e);return t||(t=on(ot(e)),Ar.set(e,t)),t};function hn(e,t,n=[],r=!0){let s=ot(e),l=[];return t.features.forEach((o,i)=>{let a=Ue(s,o);a>=.42&&l.push(`its layout repeats campaign level ${i+1}'s (${a.toFixed(2)})`)}),n.forEach((o,i)=>{let a=r?Dr(e,o):Ue(s,cn(o));a>=(r?dn:.42)&&l.push(`its layout ${r?"looks like":"repeats"} the run's level ${i+1}'s (${a.toFixed(2)})`)}),l}function Ir(e,t,n=[],r=!0){let s=ot(e),l=0;for(let o of t.features)l=Math.max(l,Ue(s,o)/.42);for(let o of n)l=Math.max(l,r?Dr(e,o)/dn:Ue(s,cn(o))/.42);return l}var Sr=e=>e.charAt(0).toUpperCase()+e.slice(1);function Pe(e,t){return t.map(n=>{let r=Sr(n);return e==="purpose"?r=`A useless piece: ${n.slice(0,n.indexOf(":")>0?n.indexOf(":"):n.length)}`:n==="the plain walk to the exit wins"?r="The plain walk wins: walking straight to each relic and the exit clears it":n.startsWith("a challenge level: the line that ignores")?r="The Minotaur can be ignored: the best line without him also wins":n.startsWith("a challenge level: ")?r=Sr(n.slice(19)):e==="threat"?r=`The Minotaur is no threat: ${n}`:e==="tidy"&&(r=`Untidy: ${n}`),{rule:e,words:r}})}function*$r(e,t,n,r,s=de){let l=[],o=a=>(l.push(...a),!r&&l.length>0);if(!t.solved)return{score:null,problems:Pe("solve",gt(t))};if(o(Pe("challenge",gt(t,Fe,Rl(ln(e))))))return{score:null,problems:l};if(o(Pe("shared",Jn(t,Ll).filter(a=>!gt(t).includes(a)))))return{score:null,problems:l};if(o(Pe("threat",sr(e,t,"challenge"))))return{score:null,problems:l};if(o(Pe("hidden",Xn(e,t))))return{score:null,problems:l};if(o(Pe("start",or(e))))return{score:null,problems:l};if(o(Pe("tidy",un(e))))return{score:null,problems:l};if(yield{expanded:0,stored:0,bestF:0,startH:0},o(br(e,t)))return{score:null,problems:l};let i=yield*et(e,t);return o(yield*mr(e,i,s))?{score:i,problems:l}:o(yield*yr(e,t,typeof n=="function"?n(i):n,s))?{score:i,problems:l}:(o(Pe("purpose",yield*rr(e,t,s))),{score:i,problems:l})}function Br(e,t,n,r=[],s=!0){let l=[];return t.explored>nt&&l.push(`stored ${t.explored} situations, more than ${nt}`),[...l,...hn(e,n,r,s)]}function jr(e,t){return e.total<t.least||e.total>t.most?[`scored ${e.total}, the band is ${t.least} to ${t.most}`]:[]}var Wr=3e6,pn=12,ea=Wr*pn;function Cl(e){return{parts:pn,budget:e.budget===void 0?Wr:Math.max(1,Math.floor(e.budget/pn))}}var Nr=12,At=120,Dl=.25,Il=8,$l={easy:{first:[11,13],plateau:[15,17]},medium:{first:[13,15],plateau:[15,19]},hard:{first:[13,15],plateau:[15,21]}},Bl=.3,jl=4;function Gl(e,t){if(e.plateau)return 1;let n=sn[t];return Math.max(0,Math.min(1,(e.least-n.first[0])/(n.plateau[0]-n.first[0])))}var qe=e=>Math.max(7,Math.floor(e)%2?Math.floor(e):Math.floor(e)-1);function Hl(e,t,n,r=null){let{first:s,plateau:l}=$l[t],o=qe(r?r[0]:s[0]+(l[0]-s[0])*n+1),i=Math.max(o,qe(r?r[1]:s[1]+(l[1]-s[1])*n+1)),a=(u,c)=>u+2*e.int((c-u)/2+1);if(e.next()<Bl){let u=a(i,qe(i+jl)),c=a(o,qe((o+i)/2+1));return e.next()<.5?[c,u]:[u,c]}return[a(o,i),a(o,i)]}var Gr={tree:3,winding:1,branching:1,sidewinder:1,division:1,braided:1},_l=e=>{let t=e.int(Et.reduce((n,r)=>n+Gr[r],0));for(let n of Et)if(t-=Gr[n],t<0)return n;return Et[0]};function Wl(e,t,n,r,s=null,l=0,o=null){let i=nn(t).filter(p=>!Ke.includes(p));n==="hard"&&s!=="cow"&&e.int(Il)!==0&&(i=i.filter(p=>p!=="cow"));let a=i.filter(p=>Mt[p]===Math.min(t,9)),u=(n==="hard"?4:3)+e.int(2),c=[];s&&!Ke.includes(s)?c.push(s):a.length&&e.next()<.5&&c.push(e.pick(a)),r&&c.push(s&&Ke.includes(s)?s:e.pick(Ke));for(let p of e.shuffle(i))c.length<u+(r?1:0)&&!c.includes(p)&&c.push(p);let[h,d]=Hl(e,n,l,o),f=_l(e),m=e.next();return{rows:h,cols:d,families:c,relics:(l>=.5?2:1)+e.int(2),style:f,winding:.3+.6*e.next(),braid:f==="braided"?.95+.05*e.next():.45+.5*e.next(),chambers:m<.85?0:m<.97?1:2}}var mn=.6931471805599453;function vt(e){let t=0;for(;e>=2;)e/=2,t++;for(;e<1;)e*=2,t--;let n=(e-1)/(e+1),r=n*n,s=n,l=0;for(let o=1;o<60;o+=2)l+=s/o,s*=r;return 2*l+t*mn}function Nl(e){if(!(e>=0))return 1;if(e>60)return 0;let t=0;for(;e>=mn;)e-=mn,t++;let n=1,r=1;for(let s=1;s<30;s++)n*=-e/s,r+=n;for(;t>0;t--)r/=2;return r}var Hr=Math.ceil(nt*1.05),fn=Rr,Kl=2e3;function Ul(e,t,n,r=()=>0){if(!e.minotaur)return 1/0;let s=un(e).length;if(s)return 14+s;let l=r(e);if(l>=1)return 13+10*(l-1);if(qt(e))return n(0,"cheap:walk"),12.5;if(lr(e))return n(0,"cheap:penned"),12.5;let o=ee(e),i=Ze(o,Hr);if(!i.solved)return n(i.explored,i.capped?"solve:capped":"solve:lost"),i.capped?12:30;n(i.explored,"solve");let a=0,u=Lr(ln(e));i.explored<u.explored&&(a+=3*vt(u.explored/i.explored)),i.line.length<u.shortest&&(a+=.2*(u.shortest-i.line.length));let c=o,h=0;for(let b of i.line){let w=q(c,b);c=w.state,ce(w.events,c)&&h++}a+=3*h;let d=Vt(e,{line:Oe(i.line)});if(a+=6*Math.max(0,_e.challenge.share-d.live/Math.max(1,d.turns)),a+=6*Math.max(0,d.quiet/Math.max(1,d.turns)-_e.challenge.quiet),a>0)return a;let f=Ze(ee({...e,minotaur:null}),Hr);n(f.explored,"free");let m=0;if(f.solved){m=i.line.length-f.line.length,a+=.4*Math.max(0,Fe.minotaurDelta-m);let b=o;for(let w of f.line)b=q(b,w).state;b.outcome==="won"&&(a+=2)}if(a>0)return a;let p=cr(e,i.line.length).length;if(n(Kl*Je.length,"habits"),p)return 1+.5*Math.min(p,4);let g={spent:0},y=Ge(et(e,{line:Oe(i.line),minotaurDelta:m,explored:i.explored},g)).total;return n(g.spent,"score"),y<t.least&&(a+=3*vt(t.least/Math.max(1,y))),y>t.most&&(a+=3*vt(y/t.most)),a}function _r(e,t){let n=ke(t),r=n.slice(n.indexOf(`

`)+2).trimEnd().split(`
`).map(o=>[...o]),s=new Map(t.hazards.map(o=>[o.at.r*t.cols+o.at.c,o.dir])),l=new Map(t.machines.map(o=>[o.at.r*t.cols+o.at.c,`${o.template}-${o.dir}`]));return{g:r,doors:e.doors,facing:s,machines:l}}function Yl(e){let t=n=>n.terrain.filter(r=>r==="wall").length;return e.reduce((n,r)=>t(r)<t(n)?r:n)}function ql(e,t,n,r=!1){let s=t.run.slice(-Nr),l=e.filter(y=>y.chapter<=t.tier),o=s.map(y=>J(y.text)),i=l.filter(y=>!s.some(b=>b.text===y.text)&&hn(J(y.text),{features:[]},o).length===0),a=Kr(t.run)?.score??null,u=an(Number.MAX_SAFE_INTEGER,t.grade),c=y=>Ce(J(y.text))===r,h=[y=>c(y)&&y.score>=n.least&&y.score<=n.most,y=>y.score>=n.least&&y.score<=n.most&&!Ce(J(y.text)),y=>a!==null&&y.score>=a*Ye.least&&y.score<=a*rt.most,y=>y.score>=u.least&&y.score<=u.most],d=y=>y[tn("endless-bank",t.seed,t.tier,t.grade,t.depth)%y.length],f=l.filter(y=>y.text!==t.run.at(-1)?.text),m=y=>a!==null&&y.score>=a*Ye.least&&y.score<=Math.max(a*rt.most,u.most),p=()=>!0,g=[...h.map(y=>[i,y]),[i,m],...h.map(y=>[f,y]),[i,p],[f,p]];for(let[y,b]of g){let w=y.filter(b);if(w.length)return d(w)}if(l.length)return d(l);if(e.length)return d(e);throw new RangeError("the bank is empty")}function Kr(e){for(let t=e.length-1;t>=0;t--)if(!Ce(J(e[t].text)))return e[t];return null}function Vl(e,t,n){let r=gr("endless",...e,n),s=Wl(r,t.tier,t.grade,t.hides,t.family??null,Gl(t.band,t.grade),t.sides??null);return{rng:r,plan:s,sketch:kr(r,s)}}function Zl(e,t,n,r,s,l,o,i,a){let u=o.by,c=(m,p="other")=>{o.spent+=m,u&&(u[p]=(u[p]??0)+m,u[p+"#"]=(u[p+"#"]??0)+1)},h=new Map,d=m=>{let p=`${m.cols}:${m.terrain.join(",")}`,g=h.get(p);return g===void 0&&(g=Ir(m,r,s,t.look??!0),h.set(p,g)),g},f={grade:t.grade,band:t.band,previous:n};for(let m=0;o.spent<l;m++){let{rng:p,plan:g,sketch:y}=Vl(e,t,m),b=y;if(!b){c(1e3);continue}let w=$=>{try{return J(Ie($,""))}catch{return null}},E=new Map,L=($,S)=>{let R=Ie($,""),T=E.get(R);return T===void 0?(T=Ul(S,t.band,c,d),Number.isFinite(T)&&Ce(S)!==t.hides&&(T+=4),t.family&&Number.isFinite(T)&&!Xl(S,t.family)&&(T+=4),E.set(R,T)):u&&(u["memo#"]=(u["memo#"]??0)+1),T},P=w(b);if(!P||d(P)>=1){c(1e3,"like");continue}let O=L(b,P),v=O,I=o.spent,D=At;for(let $=0;$<D&&o.spent<l&&($===D-1&&O<2&&D<3*At&&(D+=At),!($===Math.floor(At/3)&&O>=8));$++){if(o.tries++,$%8===0&&i?.({tries:o.tries,spent:o.spent,budget:l}),O===0&&P){let B=qn(P,fn);c(4*B.explored,"measure");let A=Br(P,B,r,s,t.look??!0),M=null;A.length||(M=Ge($r(P,B,t.grade,!1,fn)),c(M.score?8*B.explored:0,"checks"));let j=A.length?A:M.problems.map(F=>F.words),W=!A.length&&M.problems.length>0&&M.problems.every(F=>F.rule==="purpose"),ne=A.length?void 0:M.problems.find(F=>F.mended)?.mended;if(ne){a?.(`mended: ${j.join("; ")}`),u&&(u["mended#"]=(u["mended#"]??0)+1),b=_r(b,ne),P=w(b),O=P?L(b,P):1/0;continue}if(j.length&&!W){if(a?.(`gate: ${j.join("; ")}`),u)for(let F of j){let N="gate:"+F.replace(/[0-9.,×%]+/g,"N").slice(0,50);u[N]=(u[N]??0)+1}O=1,E.set(Ie(b,""),O)}else if(W){c(xt(P).reduce((X,xe)=>X+xe.ignored.length,0)*2*B.explored,"useless");let F=nr(P,B,fn,!0);if(!F.length){O=1,E.set(Ie(b,""),O);continue}a?.(`useless: ${F.map(X=>X.problem).join("; ")}`);let N=Yl(F[0].unit.ignored);b=_r(b,N),P=w(b),O=P?L(b,P):1/0;continue}else{let F=M.score,N=jr(F,t.band);if(!N.length)return{text:Ie(b,""),d:B,score:F.total,plan:g};a?.(`band: ${N.join("; ")}`),u&&(u["gate:band"]=(u["gate:band"]??0)+1),O=.5+3*Math.abs(vt(F.total<t.band.least?t.band.least/Math.max(1,F.total):F.total/t.band.most)),E.set(Ie(b,""),O)}}let S=Tr(p,b),R=w(S);if(!R)continue;let T=L(S,R);(T<=O||Number.isFinite(T)&&p.next()<Nl((T-O)/Dl))&&(b=S,P=R,O=T)}a?.(`round ${m}: began ${v.toFixed(2)}, ended ${O.toFixed(2)} from passing, ${o.spent-I} spent`)}return null}function Xl(e,t){let n=l=>e.terrain.includes(l),r=l=>e.objects.includes(l),s=l=>e.hazards.some(o=>o.kind===l);switch(t){case"keys":return e.terrain.some(l=>l.startsWith("door-"));case"water":return n("water");case"fire":return n("fire");case"ice":return n("ice");case"force":return e.terrain.some(l=>l.startsWith("force-"));case"blocks":return r("block")||e.machines.some(l=>l.template==="block");case"toggle":return n("toggle-open")||n("toggle-closed");case"mirror":return r("mirror");case"cow":return r("cow");case"gravel":return n("gravel");case"popup":return n("popup");case"fake":return n("fake-wall");case"invisible":return n("invisible-wall");case"snare":return n("trap");case"teleport":return n("teleport");case"ball":return s("ball");case"glider":return s("glider");case"fireball":return s("fireball");case"thief":return n("thief");case"bomb":return n("bomb");case"clone":return n("clone")}}function Ur(e){let t=e.run.at(-1)??null,n=an(Kr(e.run)?.score??null,e.grade),r=e.depth>1&&nn(e.tier).some(s=>Ke.includes(s))&&tn("endless-hides",e.seed,e.tier,e.grade,e.depth)%Or===0;return{band:r?Fr(n):n,hides:r,before:t}}function Yr(e,t,n,r={}){let{band:s,hides:l,before:o}=Ur(e),{parts:i,budget:a}=Cl(e);if(!o||t<0||t>=i)throw new RangeError(`no part ${t} of a search for level ${e.depth}`);let u={tries:0,spent:0},c=e.run.slice(-Nr).map(f=>J(f.text)),h=Zl([e.seed,e.tier,e.grade,e.depth,"part",t],{tier:e.tier,grade:e.grade,band:s,hides:l},{explored:o.explored},n,c,a,u,r.progress);return{found:h?{text:h.text,explored:h.d.explored,shortest:h.d.shortest,score:h.score,line:h.d.line,from:"made",tries:u.tries,spent:u.spent}:null,...u}}function qr(e,t,n=0,r=0){let s=Ur(e),l=ql(t,e,s.band,s.hides);return{text:l.text,explored:l.explored,shortest:l.shortest,score:l.score,line:l.line,from:"bank",tries:n,spent:r}}var Jl=150;function Vr(e){let t=null;return{receive(n){try{if(n.type==="bank"){e.post({type:"made",id:n.id,made:qr(n.request,e.banks[n.request.grade],n.tries,n.spent)});return}if(n.type!=="part")return;t??=e.known();let r=-1/0,s=Yr(n.request,n.part,t,{progress:l=>{let o=e.now();o-r<Jl||(r=o,e.post({type:"progress",id:n.id,progress:l}))}});e.post({type:"part",id:n.id,part:n.part,result:s})}catch(r){e.post({type:"failed",id:n.id,message:r instanceof Error?r.message:String(r)})}}}}var Zr={easy:[{chapter:1,explored:3193,shortest:41,score:26,line:"rrrruurrddddddlldcdrrlluurruuuuuulluurrru",text:`title: 
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
`},{chapter:1,explored:2980,shortest:52,score:47,line:"rrddllwllllllulluuduurrudlluulluuuurrrrrruulluullllu",text:`title: 
intro: 

#####E#############
#......F..#.......#
#<#####.#.#.#.#.#.#
#.......#...#.#.#.#
#.#.#######...#...#
#.#.#....*..#...#.#
#...#<###.#.#.###.#
#.#.......#.......#
#.#.#.#####.##.##.#
#...#...#.........#
#.#.#F#.#*#.#.#.###
#.#...#...#.#.#.M.#
#.#.#...###.#...###
#...#<#h#.....#P..#
#.###.#...###.###.#
#.......#.........#
###################
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
`},{chapter:2,explored:29717,shortest:64,score:50,line:"ddlrrrrrrrlllllclddddlddrrrrrrrrddlllrrruullllllldduulllluulluul",text:`title: 
intro: 

###################
#......P#.#.#.#.#.#
#.#####.#.#.#.#.#.#
#............c#...#
##.####.#.#######.#
E|..:.#.#...#.#...#
#.#####.#####.#.#.#
#...........#.#.#.#
###.##.############
#...*...M.........#
#######.######:##.#
#.....#*..#*......#
###################
`},{chapter:2,explored:4621,shortest:75,score:53,line:"wllllllddddddddrruurrddurrurruullwllllllddddrrddddrrddrrrruuuuuurruurruuuur",text:`title: 
intro: 

###############
#...._*P..#...#
#.#######.#.###
#.....#.#.#.#.E
#.###.#.###...#
#...........#.#
#.#######.###T#
#.#...#...#.:.#
#.#.#...###.###
#...#*#.......#
#.#.#.###.#.#.#
#.#.t.#...#.#.#
#.#.###.#:#####
#......M#.....#
#.###.###.###.#
#......*......#
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
`},{chapter:5,explored:4288,shortest:60,score:48,line:"dlldurruuurrrruuuurrllddddddddllrruuuullllddddddrrlluuullddl",text:`title: 
intro: 

#############
#...#.....#.#
#.#.#####.#.#
#.#.........#
#.#####.#&#.#
#F.F....#.#.#
#.#.###.#.#.#
#.#.....#.#.#
#.#.###F#...#
#-#P#.....#.#
#...###.#.#.#
#h#.#*M.#...#
E.#.#######.#
#.#..*....#.#
#.#.#.###.#.#
#...#.......#
#############
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
`},{chapter:6,explored:13704,shortest:50,score:49,line:"lluwwwuuurrddduurrllulluuuuullzddlldduullddddddlld",text:`title: 
intro: 

###################
#@..#.#.....#.....#
#.###.#####.#.#####
#..P..............#
#.##.##.###.###.#.#
#...............#.#
###.####.##.###.#.#
#...#.............#
#####.#####.#.###.#
#...#.#.....#z..#.#
###.#.#.#.###.#.#.#
#.......#*#.#.#.#.#
#####.#.###.#M..#.#
#.....#.#...#.#...#
#.#####...###.#.#.#
#....|..#....@#*#.#
#####E#############
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
`},{chapter:7,explored:7944,shortest:54,score:49,line:"uulluulluullulldlllwrrruuuuruuruullllllddddllddrrlllll",text:`title: 
intro: 
facing: right

#########################
#...#...........#.......#
###.#.#####.#.#.#.#.###.#
#...#.#.....#.#...#.....#
#.#.#.####.##.#.#####.###
#.#.....#.....#.#.......#
#.#.###.#.###.#.#.##.##.#
E....*..#.#.............#
#.#######...####.##.###.#
#o....*...#.R...........#
#.#.###.###.#.##.####.###
#.#.......#.#r..........#
###.#.#.#######.###.###.#
#...#.#...#.......#.....#
#.###.#.#####.###.#.#####
#....M......#....P......#
#########################
`},{chapter:7,explored:7455,shortest:70,score:50,line:"rwwwlllrrrrwwlllluuuurrrruurrlluulllluurruurrrruulluurrrrddrruurrrrrrr",text:`title: 
intro: 
facing: left

###################
#...#.....#......|E
#.#.#*###M#.#.###.#
#.#.#...#...#....-#
#.#.###.#.#.###.#.#
#.........#.....#.#
###.#############.#
#...#.....#.#...#.#
#.###.#####.#.#.#.#
#.....#...#...#...#
#.###.###.#.#####.#
#o..#..*....#.....#
###.#.##.####.###.#
#.........#...#.#.#
#.###.#.#.#.#.#.#.#
#....&#.#...#.....#
#.###########.###.#
#..P..........#...#
###################
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
`},{chapter:8,explored:7014,shortest:52,score:57,line:"rruulllllluurrrluurruwwwwwwwwwwulluurruurruurruulllu",text:`title: 
intro: 
facing: left

############E############
#.#.......#.....#.......#
#.#.#.###...###.#.###.#.#
#...#.....#.#..*..#...#.#
#.###.#.#.#.#.#####.###.#
#...#.#.#.#...#.....#w..#
#.###.#.#.#.#####.###.###
#.#...#.#...............#
###.#.#.#.#####.#######.#
#...#.#.#....M#.........#
#.###.#.###.#.#.###.#.###
#.#...#.#...#.;.#...#...#
#.#.#####.#######.#####.#
#.....#...*.....#.......#
###.#.#.#######.###.###.#
#...#.........#.....#...#
#.#####.#####.#####.#.###
#..........P......#.....#
#########################
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
`},{chapter:1,explored:8555,shortest:73,score:72,line:"lluuuuuullllllllrrrrrruurruduullllluulwlluulldddddullddddrrudrddrddddrrrd",text:`title: 
intro: 

#################
#.....#.........#
#.#.#.#.#####.#.#
#.#.#....M....#.#
#.###.####.##...#
#.#*..#.#.....#.#
#.#.#.#.#.#.###.#
#..O#.....#...#.#
###...##.##.###.#
#...#.#.........#
#.#.#...#####.###
#.#...#...#.....#
#.#*#####.#.###.#
#...............#
#.##.##.#.###.###
#.#...#.#.#.#...#
#.#.#.#...#.#.#.#
#...#...#..~#.#.#
#.###.#####.#.###
#.........~....P#
########E########
`},{chapter:1,explored:15021,shortest:101,score:72,line:"rrrrrrrrddllddllllddddddddddlluuuullllddddzddllddrrrrlclllllllllrruurrrrrruuuuuuuulluuudddllddlluulll",text:`title: 
intro: 

#######################
#...#.......#P........#
#.#########.#########.#
#.....#...........#...#
#.###########.#####.###
#...#...#...........#.#
#.###.#*#.#.###.###.#.#
#.#.#.#.#.#...#.#.#.#.#
###.#.#.#.###.#.#.###.#
E|..#.......#.#.#...#.#
###.#.#.#.#####...###.#
#.....#.#.....#.#.....#
#.#.#.###.#.#.#.#.###.#
#.#.#.#.#.#.#.#.#...#.#
#.#...#.#.#.#.#.#.###.#
#...#...#z#.......#.#.#
#########.#.#######.#.#
#.#...............#.#.#
#.#.###M#######.#######
#*.....*...c..........#
#######################
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
`},{chapter:1,explored:7623,shortest:79,score:77,line:"lllllllluulluulluulluuuuuulllluuuullrrddddrruurrrruuddddlldddlldllllddddddddrrd",text:`title: 
intro: 

#############################
#...........#......=......#.#
#.#.#####.#.#.#.##.##.#####.#
#.#.#*....#.#.#.#.........#.#
#.#.#.###.#.#.#...#.##.####.#
#.#......k#.#...#.#.......#.#
#.#####.#######.#.###.#####.#
#M....#...#.....#.#...#.....#
##.##=..#.###.#####.#.#######
#..*..#.#...#.......#.#...#.#
#.#.#.#.###.#####.#######.#.#
#.#.#.#*..#.....#.#.........#
#.#.#.###.#.###.#.#.#.###.###
#.#...#.......#...#.#.....#.#
#.#########.#####.#.####.##.#
#.#...#...#...#...#.#.......#
#.###.###.###.#####.#.###.#.#
#....................P....#.#
###E#########################
`},{chapter:1,explored:4543,shortest:72,score:79,line:"uullllllddlluulllllluurruuuulluurrrrrrrrrrrrrddrdrrdullullruurlllllllllu",text:`title: 
intro: 

########E##############
#.....................#
#.#.###.#.#.####.####.#
#.#...#.#.#....O..#...#
#.###.#.####.####...###
#.................#*..#
#.###.#.#.#M#####.#####
#.#...#.#.#.....#.#...#
#.#.###.#.###########.#
#.........#.......#.#.#
#.#.###.#.#.###.#.#.###
#.#...#.#..*..#.#P#.#.#
###.#.#.#.#.#.#.#.#.#.#
#...#...#.#.#.....#.#.#
###.#####.###.#.###.###
#.......#.....#.#...#.#
###.#####.#.#.#####.#.#
#.#.....#.#.#.......#.#
#.#.###.#...###.###.#.#
#.....#...#.....#.....#
#######################
`},{chapter:1,explored:5956,shortest:75,score:83,line:"uuuurrrrddrrddddrrrrlllluwdrruuuurruurruulluuuullllrrrrrruuuurruulllllclllu",text:`title: 
intro: 

#######E#########
#.....#|......*c#
#.#.#.#.#M#####.#
#.#.#...#.......#
#.#.#.###.###.#.#
#.#.#.......#.#.#
#.#.#.#####.#.#.#
#...#..*........#
#.#.#######.#.#.#
#.#...#.....#.#.#
#.###.#.###.#G#.#
#...#.#.........#
###.#.#.#####.###
#..k..#...#.....#
#.###.#.#.#.#.#.#
#...#...#...#.#.#
#.#.###.#.#.#.#.#
#P#.#...#.#.#...#
#.#.#.#.#.###.###
#.....#..==.....#
#################
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
`},{chapter:1,explored:7100,shortest:88,score:103,line:"uurruuuuuuuuuullllddllddddddddddddddddlluuuuuuuuuuuuuulllllluulluurrrruuuullluuruurrrrru",text:`title: 
intro: 

##########E##########
#.#...........#.....#
#.###.#######.#.###.#
#.............#.....#
#.##.###.####.#.#.#.#
#...............#.#.#
#.###.#.###.#.###.#.#
#.....#.....#.......#
#.#####.#####.###.###
#.#.......#.#.......#
###.#######.###.###.#
#...............#...#
#.###.#####.#.###.#.#
#...........#...#.#.#
###.###.###.#.#.#.#.#
#.......#.#*..#.....#
#.###.#.#.#.#.##.##.#
#.....#.#...#.......#
#.###...#.#...#.###.#
#.....#...#.#.#.#...#
###.###.#.#.#.#.#.#.#
#.....#.#...#.#.#P#.#
#.#.###.###.#...#.#.#
#.#...#...#.#.#.#...#
#.#.#.#.#.#.#.#.#.###
#...#...#...#...#...#
#.###.#####.#.#.#.#.#
#.#....M...*..#.#.#.#
#####################
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
`},{chapter:3,explored:2390,shortest:75,score:84,line:"rruuuulluuddlldzdlluuuulllddlddllddddrrrrddddrruuddlluulldlluuuuuuurruuruuu",text:`title: 
intro: 

####E##########
#.......#.#z#.#
####.##;#.#.#.#
#.....#.#.....#
###.#.#.#.#.#.#
#...#.....#.#.#
#.####.##.###.#
#.#.....#.#P:.#
#.#.###.#.#####
#.....#.....#.#
#.###.###.###.#
#*#...#*..#...#
#...#.#.#####.#
#.#.#...#.#...#
#.#.#M#.#.###.#
#.....#.....#.#
#.##.######.#.#
#.........#...#
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
`},{chapter:5,explored:4030,shortest:58,score:75,line:"uurrrrrrlllllllluulldduuuurrrruuuuuudddrrzdddrrruuluuuullu",text:`title: 
intro: 

###########E#####
#.......#z#|.*..#
#.###.###.#.#.#.#
#.........#.#.#.#
#.###.###...#.#.#
#.......#M#.#...#
#.#.#####.#*##.##
#.#........-....#
#.###.#########&#
#.#.......#.....#
#.#.#.#.###.#####
#...#*#.........#
#.###.###.###.###
#.#.....#P..#...#
#.#####.#.#.###.#
#.........#.....#
#################
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
`},{chapter:6,explored:2932,shortest:58,score:73,line:"uullllddlldddddulldlldddrrrrrrrrrrrrrruuuulluullwlluulluuu",text:`title: 
intro: 

#########E#########
#.......#...;*.@..#
###.#####.###.#.#.#
#.#...#.....#P#@#.#
#.###...#.#.###.###
#.....#.#.#.....#.#
#.#.###.#.#.###.#.#
#.#.#...#...#..M..#
#..*..#.###...###.#
#.#.#.#.....#...#.#
#.#.#.###.###.###.#
#.#...............#
#.#.###.###.#.###.#
#.....#...#.#...#.#
#.###.###.#.###.#.#
#.............#...#
#.##.####.#.###.###
#.#.....#.#.......#
#.#.###.#.###.###.#
#.............#...#
###################
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
`},{chapter:7,explored:14970,shortest:54,score:83,line:"uuuullddddllddlluulwwwwwwwwlwrruuuullllllddddddcdrrddd",text:`title: 
intro: 
facing: down

#####################
#..........M....#...#
#.#.#####.#######.#.#
#.#...*c......#...#.#
#####.###.#.#.#*#.###
#...#.#.#.#.#.#.#...#
#.#.#v#.#.#.#.#.#.###
#.#v..#.#..o#...#P..#
#.###.#.#.#.#.###.#.#
#.#v.-#...#...#...#.#
#.###.#.#...#.#.#.#.#
#&#.....#.#.#.#.#...#
#.#.###.#.#.#...#.###
#...#..|..#...#.....#
#######E#############
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
`},{chapter:8,explored:17739,shortest:59,score:70,line:"rrrrlllldddwdlluullllddddddrrddllddddrrddrrrrrruuddddddrrrd",text:`title: 
intro: 
facing: right

###################
#.#...#P..........#
#.#T###.#####.###.#
#.....#.#.#.......#
#.###.#.#.#.##.##.#
#.#...............#
#.###.#.#.##.##.###
#.#...#.#..M......#
#.#.#.#.#.###.###.#
#_..#......F#.#...#
###.###.#.#.#.###.#
#...#...#.#FF..e#.#
#.###.#.#.###.###.#
#.....#.........#.#
#.###.#####.#.###.#
#*..#....*..#.....#
###.#.###.#.###.###
#.........#.......#
###.##T##...###.#.#
#.......#.#.#.#.#.#
#.###.#.#.#.#.#.#.#
#.....#.......#...#
############E######
`},{chapter:8,explored:27442,shortest:63,score:74,line:"llddllllwrrllddddlllllllrrrrrrrdwwwwdddddddllddllddlllllluuuuul",text:`title: 
intro: 
facing: right

#######################
#.........#...#*.P....#
#.###.#####.###.#.###.#
#.........#.....#.....#
#.#.#######.###.#####.#
#.#.#...#...#.....#...#
#.#.###.###.#.#.###.#.#
#.#.*.......#.#.....#.#
#.#########.#.#.###.#.#
#.............#...#...#
###.#.#.###.#.###.#####
#...#.#.....#.#.#.#...#
#.#####.###.###.#.###.#
#.M...........#.#.....#
E.#.#.#.###.#.###.###.#
#.#.#.#.....#.#.......#
#.#.#.###.###.#.###.#.#
#.#.#.#......e#.#.#.#.#
#.###.#.#.###.#.#.#.#.#
#.....*.#.....#.......#
#######################
`},{chapter:8,explored:5605,shortest:61,score:96,line:"uuuurrrruuuuddddrrdddwwwwwwwwwwwwwwdrrddddrrrrrrddddddddrrrrd",text:`title: 
intro: 
facing: down

#####################
#.#..*#...........#.#
#.#.#.#.###.#####.#.#
#.#.#.#...#.#...#...#
#.#.#.###.#.#.#.#.###
#.......#...#.#.#...#
#.#####.#####.#.###.#
#...#.#.#.....#.....#
#.#.#.#.#.#.###.###.#
#P#.......#.#.......#
#####.#.#.#####.###.#
#.....#.#.....#.....#
#.#.#.###.###.#######
#.#.#......e....#...#
#########.#.###.###.#
#.......#M#.#..*..#.#
#.#.#######.#.#.#.#.#
#.#.#.....#.#.#.#...#
#.#.#######.#.#.###.#
#.....#.#...#.#.....#
###.#.#.#.#.#.#.###.#
#...#...#.#.#.......#
###################E#
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
`},{chapter:9,explored:4779,shortest:87,score:92,line:"llddddddrrddddrrrrrrlllllluuuuddrrrrddrrrddddlluuuuurruuuulluuuurrrrrrrllddrddddddrrddr",text:`title: 
intro: 

#########################
#.......#.....=.#.#.....#
#.#.#####.#######.#.###.#
#.#......P....#.$.....*.#
#.#.###.###.###*####.##.#
#.....:.#.#.#...#.......#
#.###.#.#.#####.#.###.###
#...#.#.......#...#.#...#
###.###.###.#####.#.#.#.#
#...#...........#.....#M#
###.#.#.#.###.#.#.###.#.#
#.....#.#.....#.....#...#
#.###.###.###:#.###.#.#.#
#.#..........=.=..#...#.E
###.##.##.#.###.#.#.#.#.#
#.#.=.....#...#.#.#.#.#.#
#.#.#####.#.###.#.#.###.#
#.......#.....#.........#
#########################
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
`},{chapter:1,explored:3181,shortest:70,score:112,line:"uullulluuurrlzldddlldddllllllddddrrrrddrrlluulluuddllddllulluuullddlll",text:`title: 
intro: 

#######################
#...........#.......#.#
#####.#.#.#.#.###.#.#.#
#.....#.#.#.....#z#...#
#.###...#.#.#.#.....###
#.....#.....#.#.#.#...#
###.####.##.#.#.#.###.#
#.................#.#P#
#M##.##.#.#.#.###.#.###
#.......#.#*#O..#.....#
###.#.#.#.#.###.#.#.#.#
E|..#.#.#*........#.#~#
###~#...#.#.#.###.#.#.#
#.....#...#.#..*......#
#######################
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
`},{chapter:2,explored:21698,shortest:84,score:111,line:"rrddrrddddddddrrrrrrddurruuulllluuuulluuuuddllllddddddddddzddlldddddddrruddrrrrddddd",text:`title: 
intro: 

#####################
#P..#.#*............#
###.#.#.##.##.#######
#...............#...#
#.#.#.#.#######.#.#.#
#.#.#.#.........#.#.#
#.#.#.#.#.###.###.#.#
#...#...#...#.......#
###.#.###.#####.#.###
#...#...#.......#...#
#.#.#.#######.###.#.#
#.#.#.......#.#...#.#
#.#.#.#.###:..###.#.#
#...M.#...#z#.......#
###.#.###.#.###.###.#
#...#...#.......#...#
#.#.###.#.#.###.#.###
#.#...#.#.#.........#
#.#.###.###.###.#.###
#...#....O..#.#.#...#
#.###.#.#.###.#.#.###
#.#*..#.#...#.......#
#...#######.#.#####.#
#.#.....#.#.#.......#
#.#.#.#.#.#.###.#.#.#
#.#.#.#.#...#...#.#.#
#####.#.#.#.#.#####.#
#.....#.#.#.........#
#######E#############
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
`},{chapter:2,explored:2077,shortest:74,score:128,line:"lluuuurrllrruuuurrrruurrrrddwdduuuulllllluulllluuuuuulllluurruuuulllluurru",text:`title: 
intro: 

###E#################
#..*....#...#...#...#
#.#####.#.#.#.###.#.#
#.....#...#.#...#.#.#
#####...#...#.#.#.###
#.....#.#.#...#F....#
#.###:#.#.#####.###.#
#.....#........F..#.#
#.#.#####.#.#####.#.#
#.#.....#.#.....#...#
#.#.###.#.###.#.#.###
#.#.F...#...#.#.....#
#.#.###.#.#.#.#.###.#
#...#M..#.#.#.......#
#.#.###.#.#.#.###.###
#.#......*..#.......#
#####.###.#.#.#####.#
#...:.....#.........#
#.#####.#.###.###.###
#.#.#...#.....F.#...#
#.#.#.###.#.#.###.###
#.#.......#.#...#...#
#.###.###.#.###.#.#.#
#.#.#...........#.#.#
#.#.###.###.#####.#.#
#.#...........#.#...#
#####.#.###.#.#.#.###
#.....#..P..#...#...#
#####################
`},{chapter:2,explored:14964,shortest:84,score:131,line:"llllddlllluulllluuuurruuuuuulluurrlluuluurlluullrrddrddlrrddllllddddddlluuuddddddddl",text:`title: 
intro: 

#####################
#.....#.............#
#.#.#:###.##.##.#.#.#
#.#.#.....#...#.#.#.#
#.#.##.##.#.#.###.###
#....f....#.#...#...#
#.#####.###.#.#...#.#
#........*....#.#.#.#
###.###.#####.#.#.#.#
#.#*#.......#.#.....#
#*#.#.#.#.#.#.#######
#.#...#.#.#.........#
#.#.#.#.#.###.#.#.#.#
#~.~#.#.M.....#.#.#.#
#.#...###.###.#.#.#.#
#.#.#.#.....#.....#.#
#.#.#~..#####.#.#...#
#.#...#.......#.#.#.#
E.#####.###.#.#.#.#.#
#...........#......P#
#.###.#.#.#.###.#.###
#.....#.#.#.....#...#
#####################
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
`},{chapter:3,explored:2116,shortest:125,score:126,line:"ddddllddrzrddrrrrrruurrddrrrrrruuuurruuuuddddllddddlllllluullddlllllluudduurrrruurrrruuuulluuurruuuuuuulllllllluuuulllllldddl",text:`title: 
intro: 

#########################
#...*...#.#.#...#.......#
#.###.#.#.#.###.#####.###
#.....#...#.#.#...#.....#
E.#.###.###.#.#.###.###.#
#.#...#.........#.....#.#
#.###...###.###.#.###...#
#...#.#...#...........#.#
#.###.###.###.#.###.#.#.#
#.............#...#.#...#
#####.#########.#.#####.#
#<#...#.#.#...#.#.#...#.#
#.#####.#.#.#...#.###.###
#.....#.#.#.#.#.....#.#.#
#####.#.#####.#####.###.#
#.#.#.#P#...#.....#.#..*#
#.#.###.#####.#.#####.#.#
#.#.....#...<.#.......#.#
#.#####.#.#####.#.#####.#
#......z#.#.....#.#.....#
#####;###<#.#.###.###.###
#...#....*..#M..#...#.#.#
#.###.#.#####.#.#.###.#.#
#.....#.......#.......#.#
#########################
`},{chapter:3,explored:23780,shortest:122,score:134,line:"urrdrrrrrruuuurruuuuruurrrrrudddllddddddddlllludrrrruuulluuuuuluulullulluullllulluuurrrrrrrrllrrddddrrrruuuurrddrrdddddddr",text:`title: 
intro: 

###################
#...........#.Y...#
#.#.###.#;#.#.#.###
#*#.....#.#...#..*#
#...###.#.###.#.#.#
#.#.....#y....#.#O#
#.#.###.#.#.###.#.#
#.#.#.....#.#...Y.#
#.#...###...#####.#
#...#.#...#.......#
#:#.#.#.#.##.####.E
#.#...~M#.#...#...#
#########.#.#.#.#.#
#......y#...#.#.#~#
#.###.#####...#...#
#...#...#.:.#.#.#.#
#.#.#####.#.#...#.#
#.#.....#.#..O#...#
#...###.#.#.###.###
#P#.......~.......#
###################
`},{chapter:3,explored:3344,shortest:113,score:157,line:"urrdrrrruuuuuurruurrruuruurrllddlddrddllllllllllllllddrrdduulluuuuuurruuurrduurrrrrrddrrrrddlddrddddllrrddrrddrrd",text:`title: 
intro: 

#####################
#...#......~.~......#
#.#...#####.###.###.#
#.#.#*#...#.......#.#
#.#.#v#.#######.#.#.#
#.~.......#.....#.#.#
#.###.#.###.##.##.###
#.#...#.#........v..#
#.#.###.###.###.#.###
#..............f#v..#
#.#####.#.#####.#.#.#
#.....#.#.#..*.M#.#.#
###.#####.#####.#.#.#
#...#...#.........#.#
#.#;v.###.###~###.###
#.#P#.......#...#*..#
###################E#
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
`},{chapter:5,explored:6682,shortest:136,score:110,line:"ddddllllllllllrrllrrrruurruurrrruuuuuuddddddllllddllddlllluurruullulldddddlluuuuuuuuruurrrdulllddrdddrrdrrddllddrrrruurruurrrruurruuuuur",text:`title: 
intro: 

#######################
#.............#.......#
#.###.#.###.#.#.#######
#.....#.#..M#...#...#.#
#.###...#.###.###.###.#
#.#...#.......t...#..-#
#.#.#.#.###.###.###.#.E
#.#.#...........#&..#.#
#.#.##T##*#######.#.#.#
#...#...#.........#.#.#
#.#.#.#.######.##.#.#.#
#.#...#.#.........#...#
#.###.#...#########.###
#.....#.#...#.#.....#P#
#.#.#...###.#.#.#####.#
#.#.#.#.#...#...#.....#
#.#.#.#.#.###.#######.#
#....*._#......=....=.#
#######################
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
`},{chapter:5,explored:2442,shortest:122,score:121,line:"rrddrrrruuuurruuuurrrruurrwllddllllddddllddddllllllddddddddrrddrrrrrruulluurruurrrrrruulluurruurrllddrrrrddlrddddddddlllld",text:`title: 
intro: 

#####################
#..-................#
#.##.##.#####.###.#.#
#.....#.......#...#.#
###.#.#.#.#########.#
#...#...#.#.#.......#
#####.###.#.###.#.###
#...#.#.....#.#&#.#.#
#.###.#.#####.#.###.#
#P..#.#.#........*..#
###.###.#.#####.#####
#.......#...#.......#
#.###.###.#.#.#####.#
#...#.#...#.#M....*.#
#.#.#.#.###.###.#.#.#
#.#.#.#.........#.#.#
#.#.#.###.###.#####.#
#.#...#.....#.#.#...#
#.#####;###.###.#.#.#
#...#.....#...#.#.#.#
#.#.#####.###.#.#.#.#
#.#...........#.....#
###############E#####
`},{chapter:5,explored:2912,shortest:101,score:123,line:"uuuurrdddddddddurrrrrrrrddddrrrrrruuuulluulluuddrrddrrddddllllrrlllluuuuuuuurrrruuuurruuuuuudddrrdddr",text:`title: 
intro: 

#####################
#.............#..*..#
#.#.###.##.##.#.#.#.#
#.#...........#.#.#.#
#.#.#.###.#.###.#...#
#...#.....#.#.....#.#
###.#.###.#.F.###.#.#
#.......#...#.....#.E
#.#.###...#.###.#####
#.#.....#.#.#.......#
#.#.#####.#####.#.#.#
#P#.#.......M...#.#.#
###.###.#.#.#.###..F#
#...#.#.#.#.#.....#.#
#.#.#.###.#.###.###.#
#.#.........#&......#
#.#*###.#.#.#.#.#.###
#...#...#.#...#.#...#
#.###.#.#.#.#####.#.#
#.#...#...#......-#.#
#####.#.###.###.#.#.#
#...#...#..F....#...#
#####################
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
`},{chapter:6,explored:22253,shortest:83,score:116,line:"dduuuuuuuuduuuuddddllllullullllddddddlllldduuuurrrrzllllddrrrrddrrlluulllllluuuuuuu",text:`title: 
intro: 

#######################
#....<........#.....#.#
#.###.###.#.###.#####.#
#........M#.#.#.#@...@#
E<#.##.##.#.#.#.#.###~#
#.#.#......*#.#.#...#.#
#.###<#.###...###.#...#
#.....#.....#.....#.#.#
#.#####.#.###.###.#.#.#
#.#..*..#.#.........#.#
#.#.###.#.#.#.#.#.#.#.#
#~.~........#.#.#.#..P#
#.#.###.###.#.#.#.###.#
#.#z#....*#.#........f#
#######################
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
`},{chapter:7,explored:10386,shortest:97,score:111,line:"rrddllddrrllddddddlluullddlllrlluuuulluuuuuurrrruuuuuuuurrlwwwwlwrrddrwlddrrddllddzddlldddlldlldl",text:`title: 
intro: 
facing: down

#######################
#......o#.#...#...#...#
#.#.#.#.#.#.###.#.#####
#.#.#.#...#.....#...#.#
#...#.#.#####.###.###.#
#.#..*#..*#...........#
#.###.###.####.####.###
#.#.#.#..z#P......#.#.#
#.#.#.#.#.###.###.#.#.#
#.....M.#.#...........#
#.#####.#.#.###.#.###.#
#.#.......#..v#.#.....#
#.#.#.#######v#.#.###.#
#.#.#...#.#..v#.....#.#
#.#...###.#.#########.#
#...#.....#...#...#...#
E.#.###.###.#####.#.###
#.#.#.#...#.#.....#.#.#
#.#.#.#.#.#.#####.###.#
#.......#..*#.........#
#######################
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
`},{chapter:8,explored:10314,shortest:68,score:111,line:"lllluurruulllllluulllwwwwwwwlrrrrllllddddlllldwwdddrrrrlllluuuuuuuul",text:`title: 
intro: 
facing: left up

#####################
E...#..*.........w#.#
#.#.#.###.###.###.#.#
#.#.............#.#.#
#.###.#########.#.#.#
#.........#.....#.#.#
#.#.#####.#.#.#####.#
#.#.......#.#....P#.#
#.#####.#.#.#.#####.#
#*.M.*..#.#.#.......#
#######.#.#.###.###.#
#.#.....#.#.......#.#
#.#######.#.#.###.#.#
#.#.......#.#...#.#.#
#.#.#########.###.#.#
#.#...#...#.#.#...#.#
#.#.#.#.#.#.#.#^###.#
#...#.#.#...#.#.....#
#####.#.##.##.#.###.#
#...#....^.^#.....#.#
#.#.#.#.#####.###.#.#
#.#...#......e......#
#####################
`},{chapter:8,explored:9401,shortest:56,score:115,line:"uuuuuurrrddrrrrddldwwwwwwdrrrrrrrrddrrdwwuuudwdddllddrrd",text:`title: 
intro: 
facing: up

###################
#.................#
#.##.##.###.###.#.#
#..O.......O..#.#.#
#.#.####.##.#.#.###
#.#...#....w#...#.#
#.#.#M#.#########.#
#P..#...........#.#
######.##.###.#*#.#
#.......#.....#.*.#
#.###.#.#.#.#.###.#
#.....#...#.#.....#
#.###...###.###.###
#.....#.......#..|#
#################E#
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
`},{chapter:8,explored:14191,shortest:72,score:122,line:"llllllllddrrddrruurrdwwdrwwruuddrwllluullddllddrrrrrrddrrddrrrrddrruurrr",text:`title: 
intro: 
facing: left

#####################
#........P#.........#
#.###################
#...#...#*....#.....#
#.#.#.#.#.###.#.#.###
#.#...#......w#.#...#
###.###.###.#.#.###.#
#.........#.#.#.#...#
#.#######.#.###...#.#
#...#.#....M#.#.#.#.#
###.#.#.###.#.#.#.#.#
#.#...#.........#..*E
#.###.#.#####.#.#.###
#.......#...#.#.....#
#.###.###.#.#.#.###.#
#.........#.....#...#
#.###.###.#.###.#.###
#.#.#...#.......#...#
###.#.#...##.##.#.###
#...#.#.#.......#.#.#
#.#####.#.##.##.#.#.#
#...................#
#####################
`},{chapter:8,explored:19769,shortest:83,score:126,line:"uurddrruuwwwwwwwwwwwwwwwwuuuuurrddrruurruulluullllllllllulluuuuuudddddllllddddddddl",text:`title: 
intro: 
facing: left

#####################
#.......#.#.....#...#
#.#.#*###.#.###.#.###
#.#.#.#.............#
#.#.#.###.#.#####.#.#
#...#...#.#.......#.#
#.###.#...###.###.#.#
#F....#.#.......#...#
#.###...#.#########.#
#F..#.#..e...*.h....#
#F#.#.###########.###
#.#.#.#...#...#.....#
#.#.#.#######&#####.#
#...#.....#.....#...#
#.#####.#.#.#.#.#.###
E|#.#...#...#-#.....#
#.#.#########.#.###F#
#...#.........#...#.#
#####.#.###.#.###=#.#
#.....#.#.=.#=#.#...#
#M#####.#.#.#.#.#.###
#........P#..=#.....#
#####################
`},{chapter:8,explored:21942,shortest:68,score:130,line:"ddllllllllddllllddllddlldwwwwwwwwwwwwwwwwwwdddddddddrruurrddddrrrrrd",text:`title: 
intro: 
facing: left

#######################
#.....#...........#...#
###.#.#.###.#####.#.#.#
#.#.#...........#P#.#.#
#.#:#.#####.###.#.#.#.#
#.......#.............#
#.#####.#.#.##.##.###.#
#...#.....#.......#...#
#.#.#:###########.#.###
#.#.....#.........#...#
#.#.###.#############.#
#.**#.....#...#.....#.#
#.###.#.###.#.#.###.#.#
#.....#...#.#.#.....#.#
#.#.#.#.#########.#.###
#.#.#.#....M..#.#.#...#
#.#.#.##.####.#.#####.#
#...#.#.............#.#
#.###...#####.#.#.#.#.#
#.#...#.#.....#.#.#...#
#.#.#.#.#.#.###.#.###.#
#...#.#...#....e#.#.#.#
#.###.###.#.#.#.#.#.#.#
#.#.........#.#.......#
##########E############
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
`},{chapter:9,explored:3181,shortest:89,score:110,line:"uuuurrrrrrrrrrddrrdrrdrrdduuuuuullllrwrllddlllllllllldddduuuurrrrrrrrrrddurrdrrddrrrrdddr",text:`title: 
intro: 
machines: ball-right

#########################
#.#..*........#.....#.#.#
#.#.#########.#.#~#.#.#.#
#.#.#...........#.#....~#
##C.#.#.####.##...#.###.#
#.#P#.#.......#*#..+..#~#
#.#.#.#######.#.###.###.#
#.#.#*............#.....#
#####.#.#.#.##.####.###.#
#.#...#.#.#.....#.....#.#
#.#.#.#...#####.#.###.#.E
#...#...#.....#.#...#...#
#####.#.##.##.#.#.#####.#
#...#.#.......#.#.....#.#
###.#.###.###.#.#.###.#.#
#.......#...#....M#.....#
#.#####.#~###.###...###.#
#.#...#.#.#...#.#.#...#.#
#.#.#.#.###.#.#.#.###.###
#...#.......#...........#
#########################
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
`},{chapter:9,explored:17520,shortest:59,score:145,line:"uwwwwwwwwwullllllllddrrrrddllddwuullrrddllddrrrrrrrrddddlld",text:`title: 
intro: 
facing: right up

#################
#.._............#
#.###.#.#.#.#.#.#
#.....#.#P#.#.#.#
#####.#.#####.#.#
#*...w#.#...#.!M#
###.###.#.###.#.#
#....o#.#.....#.#
#.###.#####.#.#.#
#........*..#.#.#
###.###.#.###.###
#.#...t.#.t.....#
#.###.#.#.###.###
#.....#.........#
#######E#########
`}]};var Xr=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
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
`}];var Jr=[{id:"ch2-1",text:`title: The Loose Stone
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
`}];var Qr=[{id:"ch3-1",text:`title: The Rising Floor
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
`}];var eo=[{id:"ch4-1",text:`title: The Wall That Gives
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
`}];var to=[{id:"ch5-1",text:`title: The Snare
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
`}];var no=[{id:"ch6-1",text:`title: The Teleport
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
`}];var ro=[{id:"ch7-1",text:`title: The Bronze Ball
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
`}];var oo=[{id:"ch8-1",text:`title: The Harpy
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
`}];var lo=[{id:"ch9-1",text:`title: The Thief
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
`}];var so=[{id:"ch10-1",text:`title: The Wooden Cow
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
`}];var Ql=[...Xr,...Jr,...Qr,...eo,...to,...no,...ro,...oo,...lo,...so];function io(){return Ql.map(e=>J(e.text))}var es=Vr({post:e=>self.postMessage(e),banks:Zr,known:()=>Cr(io()),now:()=>performance.now()});self.onmessage=e=>es.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
