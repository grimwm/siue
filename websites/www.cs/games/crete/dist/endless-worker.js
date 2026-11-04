"use strict";(()=>{var _=["up","down","left","right"],K={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},je=["red","blue","yellow","green"],dr=["flippers","fire-boots","skates","suction"],Pt={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},U=(e,t,r,o={},i,s=t)=>({char:e,minotaur:t,block:r,hazard:s,...o,sprites:i??[]}),H={floor:U(".",!0,!0,{},["floor"]),wall:U("#",!1,!1,{},["wall"]),exit:U("E",!1,!1,{},["exit"]),gate:U("|",!1,!1,{},["gate-closed","gate-open"]),water:U("~",!1,!0,{needs:"flippers"},["water"]),fire:U("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:U("=",!0,!0,{slides:"skates"},["ice"]),"force-up":U("^",!0,!0,{carries:"up"},["force-up"]),"force-down":U("v",!0,!0,{carries:"down"},["force-down"]),"force-left":U("<",!0,!0,{carries:"left"},["force-left"]),"force-right":U(">",!0,!0,{carries:"right"},["force-right"]),dirt:U("%",!0,!0,{},["dirt"]),safe:U("S",!1,!1,{},["safe"]),button:U("_",!0,!0,{},["button"]),"toggle-open":U("t",!0,!1,{},["toggle-open"]),"toggle-closed":U("T",!1,!1,{},["toggle-closed"]),"door-red":U("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":U("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":U("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":U("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:U("&",!0,!0,{},["trap"]),"button-brown":U("-",!0,!0,{},["button-brown"]),"button-red":U("+",!0,!0,{},["button-red"]),popup:U(";",!1,!1,{},["popup"]),gravel:U(":",!1,!1,{},["gravel"]),"fake-wall":U("W",!1,!1,{},["wall"]),"invisible-wall":U("I",!1,!1,{},["floor"]),teleport:U("@",!1,!1,{},["teleport"]),thief:U("$",!0,!0,{},["thief"]),bomb:U("!",!1,!0,{},["bomb"],!0),clone:U("C",!1,!1,{},_.map(e=>`clone-${e}`))},ie={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var st={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:Pt.mirror.name},cake:{char:"x",sprite:"cake",name:Pt.cake.name},cow:{char:"c",sprite:"cow",name:Pt.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},en=["theseus","minotaur","minotaur-stone","cow-standing"],tn=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],rn=["exit-off","exit-wake"],js=[...new Set([...Object.values(H).flatMap(e=>e.sprites),...tn,...rn,...Object.values(st).map(e=>e.sprite),...en,...Object.values(ie).map(e=>e.sprite)])];var se=class extends Error{line;col;constructor(t,r,o){super(`line ${t}, column ${r}: ${o}`),this.line=t,this.col=r}},on=new Map(Object.entries(H).map(([e,t])=>[t.char,e])),nn=new Map(Object.entries(st).map(([e,t])=>[t.char,e])),sn=/^[a-z0-9-]+$/,an=/^([a-z]+): (.*)$/,ln=new Map(Object.entries(ie).map(([e,t])=>[t.char,e])),cn=["block","ball","glider","fireball"],un=["title","intro","hearts","relics","pages","facing","machines"];function hn(e,t){let r=e&&e.value!==""?e.value.split(" "):[],o=e??{line:1,col:1},i=new Set;for(let s of r){if(!sn.test(s))throw new se(o.line,o.col,`page id '${s}' must be lower-case letters, digits and hyphens`);if(i.has(s))throw new se(o.line,o.col,`page '${s}' named twice`);i.add(s)}if(r.length>31)throw new se(o.line,o.col,"a level holds at most 31 pages");if(r.length!==t)throw new se(o.line,o.col,`pages: ${r.length} named but the grid has ${t}`);return r}function pr(e,t,r,o,i){let s=t&&t.value!==""?t.value.split(" "):[],n=t??{line:1,col:1};for(let a of s)if(!o(a))throw new se(n.line,n.col,`${e}: '${a}' is not ${i}`);if(s.length!==r)throw new se(n.line,n.col,`${e}: ${s.length} named but the grid has ${r}`);return s}function fn(e){let t={},r=e.indexOf("trap"),o=e.indexOf("clone"),i=-1,s=-1;for(let n=e.length-1;n>=0;n--){let a=e[n];if(a==="button-brown"){let l=i>=0?i:r;l>=0&&(t[n]=l)}else if(a==="button-red"){let l=s>=0?s:o;l>=0&&(t[n]=l)}else a==="trap"?i=n:a==="clone"&&(s=n)}return t}function Q(e){let t=e.replace(/\r\n/g,`
`).split(`
`),r={},o=0;for(;o<t.length;o++){let P=an.exec(t[o]);if(!P)break;if(!un.includes(P[1]))throw new se(o+1,1,`unknown header '${P[1]}'`);r[P[1]]={value:P[2],line:o+1,col:P[1].length+3}}for(;o<t.length&&t[o]==="";)o++;let i=o,s=[];for(;o<t.length&&t[o]!=="";o++)s.push(t[o]);if(s.length===0)throw new se(i+1,1,"no grid");for(;o<t.length;o++)if(t[o].trim()!=="")throw new se(o+1,1,"text after the grid");let n=s[0].length,a=[],l=[],c=null,h=null,f=0,u=[],p=[],d=[];if(s.forEach((P,M)=>{let F=i+M+1;if(P.length!==n)throw new se(F,1,`row is ${P.length} wide, expected ${n}`);[...P].forEach((D,S)=>{let L=S+1;if(D==="P"||D==="M"){if(D==="P"&&c)throw new se(F,L,"second player");if(D==="M"&&h)throw new se(F,L,"second Minotaur");D==="P"?c={r:M,c:S}:h={r:M,c:S},a.push("floor"),l.push(null);return}let G=ln.get(D);if(G){p.push({kind:G,at:{r:M,c:S}}),a.push("floor"),l.push(null);return}let B=on.get(D),v=nn.get(D);if(!B&&!v)throw new se(F,L,`unknown tile '${D}'`);a.push(B??"floor"),l.push(v??null),v==="relic"&&f++,B==="clone"&&d.push({r:M,c:S}),v==="page"&&u.push(M*n+S)})}),!c)throw new se(i+1,1,"no player");let m=(P,M,F,D)=>{let S=r[P];if(!S)return M;let L=Number(S.value);if(!Number.isInteger(L)||L<F)throw new se(S.line,S.col,`${P} must be ${F} to ${D}`);if(L>D){let G=P==="relics"?`relics: ${S.value} but the grid has ${D}`:`${P} must be ${F} to ${D}`;throw new se(S.line,S.col,G)}return L},b=m("hearts",3,1,99),g=m("relics",f,0,f),w=hn(r.pages,u.length),A=pr("facing",r.facing,p.length,P=>_.includes(P),"a direction"),T=p.map((P,M)=>({...P,dir:A[M],home:M})),R=pr("machines",r.machines,d.length,P=>{let[M,F]=P.split("-");return cn.includes(M)&&_.includes(F)&&P.split("-").length===2},"a template and a direction like block-up"),C=T.length,Y=d.map((P,M)=>{let[F,D]=R[M].split("-"),S={at:P,template:F,dir:D};return F==="block"?S:{...S,home:C++}});return{title:r.title?.value??"",intro:r.intro?.value??"",hearts:b,relics:g,pageIds:w,pageCells:u,rows:s.length,cols:n,terrain:a,objects:l,player:c,minotaur:h,hazards:T,machines:Y,links:fn(a)}}function Ae(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let t=e.objects.filter(s=>s==="relic").length,r=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&r.push(`hearts: ${e.hearts}`),e.relics!==t&&r.push(`relics: ${e.relics}`),e.pageIds.length>0&&r.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&r.push(`facing: ${e.hazards.map(s=>s.dir).join(" ")}`),e.machines.length>0&&r.push(`machines: ${e.machines.map(s=>`${s.template}-${s.dir}`).join(" ")}`);let o=new Map(e.hazards.map(s=>[s.at.r*e.cols+s.at.c,s.kind])),i=[];for(let s=0;s<e.rows;s++){let n="";for(let a=0;a<e.cols;a++){let l=s*e.cols+a;e.player.r===s&&e.player.c===a?n+="P":e.minotaur&&e.minotaur.r===s&&e.minotaur.c===a?n+="M":o.has(l)?n+=ie[o.get(l)].char:n+=e.objects[l]?st[e.objects[l]].char:H[e.terrain[l]].char}i.push(n)}return`${r.join(`
`)}

${i.join(`
`)}
`}function mr(e){let t=0;for(let r of e.objects)r==="cake"&&t++;return e.hearts+t}function te(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var le=(e,t)=>t.r>=0&&t.c>=0&&t.r<e.rows&&t.c<e.cols,z=(e,t)=>t.r*e.level.cols+t.c;var X=(e,t)=>!!t&&e.r===t.r&&e.c===t.c,Le=66,dn=Array.from({length:Le*Le},(e,t)=>({r:Math.floor(t/Le)-1,c:t%Le-1})),pn=(e,t)=>e>=-1&&t>=-1&&e<Le-1&&t<Le-1?dn[(e+1)*Le+t+1]:{r:e,c:t},ne=(e,t)=>pn(e.r+K[t][0],e.c+K[t][1]),Ot=e=>e.relicsLeft===0;var br=e=>{let t=it(e);return t.terrain=[...e.terrain],t.objects=[...e.objects],t.ownTerrain=t.ownObjects=!0,Re(t),t},it=e=>({level:e.level,terrain:e.terrain,objects:e.objects,ownTerrain:!1,ownObjects:!1,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,ownHeld:!1,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:e.hazards.length>0?[...e.hazards]:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome});function Re(e){e.ownHeld||(e.keys={...e.keys},e.tools={...e.tools},e.gear=[...e.gear],e.ownHeld=!0)}function be(e,t,r){e.ownTerrain||(e.terrain=e.terrain.slice(),e.ownTerrain=!0),e.terrain[t]=r}function Pe(e,t,r){e.ownObjects||(e.objects=e.objects.slice(),e.ownObjects=!0),e.objects[t]=r}var re=(e,t)=>le(e.level,t)?e.terrain[z(e,t)]:"wall",ye=(e,t)=>le(e.level,t)?e.objects[z(e,t)]:null;function Se(e,t){let r=e.hazards;for(let o=0;o<r.length;o++){let i=r[o].at;if(i.r===t.r&&i.c===t.c)return!0}return!1}function at(e,t){e.terrain=e.terrain.map(r=>r==="toggle-open"?"toggle-closed":r==="toggle-closed"?"toggle-open":r),e.ownTerrain=!0,t.push({kind:"flipped"})}var yr=new WeakMap;function wr(e){let t=yr.get(e);return t||(t=e.terrain.flatMap((r,o)=>r==="teleport"?[o]:[]),yr.set(e,t)),t}var kr=e=>wr(e).length>1;function zt(e,t,r,o){let{cols:i}=e.level,s=wr(e.level),n=t.r*i+t.c,a=s.findIndex(l=>l>n);for(let l=0;l<s.length;l++){let c=s[((a<0?0:a)+l)%s.length];if(c===n)continue;let h={r:Math.floor(c/i),c:c%i},f=ne(h,r);if(re(e,f)!=="teleport"&&o(f))return{via:h,to:f}}return null}var gr=new WeakMap;function mn(e){let t=gr.get(e);if(!t){let r=new Map;for(let[o,i]of Object.entries(e.links)){if(e.terrain[i]!=="trap")continue;let s=r.get(i);s?s.push(Number(o)):r.set(i,[Number(o)])}t=r,gr.set(e,t)}return t}function bn(e,t){let r=mn(e.level).get(t);if(!r)return!1;let{cols:o}=e.level;return r.some(i=>{let s={r:Math.floor(i/o),c:i%o};return X(s,e.player)||ye(e,s)==="block"||Se(e,s)})}var ae=(e,t)=>re(e,t)==="trap"&&!bn(e,t.r*e.level.cols+t.c);function xr(e,t,r){if(!le(e.level,r))return!1;let o=re(e,r);return H[o].hazard||ie[t].crosses===o}var lt=(e,t,r)=>xr(e,t,r)&&!ye(e,r)&&!X(r,e.minotaur)&&!X(r,e.cow)&&!Se(e,r),ct=(e,t,r)=>X(r,e.player)?xr(e,t,r):lt(e,t,r);function Ct(e,t,r,o,i=!1){let s=e.hazards[t],n=re(e,s.at);return n==="bomb"?(be(e,z(e,s.at),"floor"),e.hazards.splice(t,1),r.push({kind:"exploded",who:"hazard",at:s.at}),"gone"):(n==="button"?at(e,r):n==="button-red"&&ut(e,z(e,s.at),r,o,i),ae(e,s.at)&&r.push({kind:"held",who:"hazard",at:s.at}),"on")}function ut(e,t,r,o,i=!1){let s=e.level.links[t];if(s===void 0)return;let n=e.level.machines.find(h=>z(e,h.at)===s),a=ne(n.at,n.dir);if(o&&X(a,o))return;if(n.template==="block"){if(!ht(e,a))return;Pe(e,z(e,a),"block"),r.push({kind:"cloned",what:"block",at:a}),Dt(e,a,n.dir,o,r,i);return}if(!lt(e,n.template,a)||X(a,e.player))return;let l={kind:n.template,at:a,dir:n.dir,home:n.home};e.hazards.length===0&&(e.hazards=[]);let c=e.hazards.length;if(!i){let h=z(e,a);for(;c>0&&z(e,e.hazards[c-1].at)>h;)c--}e.hazards.splice(c,0,l),r.push({kind:"cloned",what:n.template,at:a}),Ct(e,c,r,o,i)}function yn(e,t){let r=e.hazards[t];if(r)return r.at;let o=e.machines.find(i=>i.home===t);return ne(o.at,o.dir)}function Ft(e,t,r){re(e,t)==="popup"&&(be(e,z(e,t),"wall"),r.push({kind:"rose",at:t}))}var gn=(e,t,r)=>lt(e,t,r)&&re(e,r)!=="bomb"&&!X(r,e.player);function wn(e,t,r){let o=yn(e.level,r),i=new Set([z(e,o)]),s=[o];for(;s.length>0;){let n=s.filter(l=>gn(e,t,l)).sort((l,c)=>z(e,l)-z(e,c));if(n.length>0)return n[0];let a=[];for(let l of s)for(let c of _){let h=ne(l,c);!le(e.level,h)||i.has(z(e,h))||(i.add(z(e,h)),a.push(h))}s=a}return null}function Tr(e,t,r){let o=e.hazards.findIndex(n=>X(t,n.at));if(o<0)return;let i=e.hazards[o];e.hazards.splice(o,1);let s=wn(e,i.kind,i.home);s&&(e.hazards.push({...i,at:s}),e.hazards.sort((n,a)=>z(e,n.at)-z(e,a.at))),r.push({kind:"sent-home",from:t,to:s})}function Oe(e,t,r,o){if(e.hearts--,t.push(o?{kind:"caught",at:e.player,hearts:e.hearts,by:r,hazard:o}:{kind:"caught",at:e.player,hearts:e.hearts,by:r}),e.hearts<=0){e.outcome="lost",t.push({kind:"lost"});return}Ft(e,e.player,t),e.player=e.throwBack;let i=null;X(e.player,e.minotaur)&&(i=e.level.minotaur,e.minotaur=i,X(i,e.cow)&&(e.cow=null)),Tr(e,e.player,t),i&&Tr(e,i,t)}function ft(e,t){if(e.outcome!=="playing")return!0;for(let r=0;r<t.length;r++)if(t[r].kind==="caught")return!0;return!1}function It(e,t){return le(e.level,t)&&H[re(e,t)].minotaur&&ye(e,t)!=="block"&&!Se(e,t)}function Ar(e,t,r){return e.minotaur=t,ae(e,t)&&r.push({kind:"held",who:"minotaur",at:t}),X(t,e.cow)&&(e.cow=null),X(t,e.player)?(Oe(e,r,"minotaur"),!0):!1}function kn(e,t){let r=e.minotaur;if(!r)return!0;if(ae(e,r))return!1;let o=e.cow??e.player,i=null,s=null;if(o.c!==r.c){let l=o.c>r.c?"right":"left",c=ne(r,l);It(e,c)&&(i=l,s=c)}if(!s&&o.r!==r.r){let l=o.r>r.r?"down":"up",c=ne(r,l);It(e,c)&&(i=l,s=c)}if(!i||!s)return!1;if(t.push({kind:"moved",who:"minotaur",from:r,to:s}),Ar(e,s,t))return!0;let n=i,a=null;for(;;){let l=H[re(e,e.minotaur)];if(l.carries)n=l.carries;else if(!l.slides)return!1;a??=new Set([z(e,s)]);let c=ne(e.minotaur,n);if(!It(e,c)||a.has(z(e,c)))return!1;if(t.push({kind:"slid",who:"minotaur",from:e.minotaur,to:c}),a.add(z(e,c)),Ar(e,c,t))return!0}}function Sr(e,t){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let r=0;r<2&&e.outcome==="playing";r++)if(kn(e,t))return}}var xn={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function Tn(e,t,r){return X(e.hazards[t].at,e.player)?(X(e.player,e.cow)&&(e.cow=null),Oe(e,r,"hazard",e.hazards[t].kind),"caught"):Ct(e,t,r,void 0,!0)}function An(e,t,r){let o=e.hazards[t];if(ae(e,o.at))return"on";let i=o.dir;if(!ct(e,o.kind,ne(o.at,i))){i=void 0;for(let a of ie[o.kind].turns){let l=xn[a][o.dir];if(ct(e,o.kind,ne(o.at,l))){i=l;break}}}if(!i)return"on";let s=ne(o.at,i);r.push({kind:"moved",who:"hazard",hazard:o.kind,from:o.at,to:s});let n=null;for(;;){o=e.hazards[t]={kind:o.kind,at:s,dir:i,home:o.home};let a=Tn(e,t,r);if(a!=="on")return a;let l=H[re(e,s)];if(l.carries)i=l.carries,o.dir!==i&&(o=e.hazards[t]={kind:o.kind,at:o.at,dir:i,home:o.home});else if(!l.slides)return"on";n??=new Set([z(e,s)]);let c=ne(s,i);if(n.has(z(e,c))||!ct(e,o.kind,c))return"on";r.push({kind:"slid",who:"hazard",hazard:o.kind,from:s,to:c}),n.add(z(e,c)),s=c}}function vr(e,t){if(e.hazards.length!==0){for(let r=0,o=e.hazards.length;r<o;){let i=An(e,r,t);if(i==="caught")break;i==="gone"?o--:r++}e.hazards.sort((r,o)=>z(e,r.at)-z(e,o.at))}}function ht(e,t){return le(e.level,t)&&H[re(e,t)].block&&!ye(e,t)&&!X(t,e.player)&&!X(t,e.minotaur)&&!X(t,e.cow)&&!X(t,e.throwBack)&&!X(t,e.level.minotaur)&&!Se(e,t)}function jt(e,t,r,o){let i=ne(t,r);if(re(e,i)!=="teleport")return ht(e,i)&&o(i)?{entry:i,to:i}:null;if(X(i,e.player))return null;let s=zt(e,i,r,n=>ht(e,n)&&o(n));return s&&{entry:i,via:s.via,to:s.to}}function Mr(e,t,r,o,i){Pe(e,z(e,t),null),Pe(e,z(e,r.to),"block"),i.push(o==="pushed"?{kind:"pushed",from:t,to:r.entry}:{kind:"slid",who:"block",from:t,to:r.entry}),r.via&&i.push({kind:"teleported",who:"block",from:r.entry,via:r.via,to:r.to})}function Dt(e,t,r,o,i,s=!1){let n=t,a=r,l=new Set([z(e,n)]);for(o&&l.add(z(e,o));;){let c=re(e,n);if(c==="water"||c==="bomb"){Pe(e,z(e,n),null),be(e,z(e,n),c==="water"?"dirt":"floor"),i.push(c==="water"?{kind:"sank",at:n}:{kind:"exploded",who:"block",at:n});return}c==="button"?at(e,i):c==="button-red"&&ut(e,z(e,n),i,o,s),ae(e,n)&&i.push({kind:"held",who:"block",at:n});let h=H[c];if(h.carries)a=h.carries;else if(!h.slides)return;let f=jt(e,n,a,u=>!l.has(z(e,u)));if(!f)return;Mr(e,n,f,"slid",i),l.add(z(e,f.to)),n=f.to}}var Sn=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Er(e,t,r,o){if(!le(e.level,t)||X(t,e.minotaur))return!1;let i=re(e,t),s=H[i];return Sn.has(i)||i==="teleport"&&!kr(e.level)||i==="gate"&&!Ot(e)||s.needs&&!e.gear.includes(s.needs)||s.door&&e.keys[s.door]<=0?!1:Se(e,t)||ye(e,t)!=="block"?!0:!o&&!ae(e,t)&&!!jt(e,t,r,()=>!0)}function Ht(e,t,r,o,i){if(!Er(e,t,r,o))return!1;if(Se(e,t))return Oe(e,i,"hazard",e.hazards.find(n=>X(n.at,t)).kind),!1;let s=H[re(e,t)];if(s.door&&(s.door!=="green"&&(Re(e),e.keys[s.door]--),be(e,z(e,t),"floor"),i.push({kind:"opened",color:s.door,at:t})),ye(e,t)==="block"){let n=jt(e,t,r,()=>!0);Mr(e,t,n,"pushed",i),Dt(e,n.to,r,t,i)}return!0}function Gt(e,t,r,o,i){Ft(e,e.player,i),e.player=t;let s=re(e,t);if(s==="bomb")return be(e,z(e,t),"floor"),i.push({kind:"exploded",who:"player",at:t}),Oe(e,i,"bomb"),!0;let n=ye(e,t);if(n&&n!=="block"&&(Pe(e,z(e,t),null),i.push({kind:"took",what:n,at:t}),n==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):n==="page"?e.pages|=1<<e.level.pageCells.indexOf(z(e,t)):n.startsWith("key-")?(Re(e),e.keys[n.slice(4)]++):n==="mirror"||n==="cake"||n==="cow"?(Re(e),e.tools[n]++):e.gear.includes(n)||(Re(e),e.gear.push(n))),s==="thief"&&e.gear.length>0&&(i.push({kind:"robbed",at:t,gear:e.gear}),e.gear=[]),s==="safe"&&(e.throwBack=t),ae(e,t)&&i.push({kind:"held",who:"player",at:t}),s==="button"?at(e,i):s==="button-red"&&ut(e,z(e,t),i),s==="exit"&&Ot(e)&&(e.outcome="won",i.push({kind:"won"})),s==="teleport"){let a=zt(e,t,r,l=>Er(e,l,r,o));return a?Ht(e,a.to,r,o,i)?(i.push({kind:"teleported",who:"player",from:t,via:a.via,to:a.to}),Gt(e,a.to,r,o,i)):!0:!1}return!1}function vn(e,t,r){let o=t,i=e.player,s=null;for(;e.outcome==="playing";){let n=H[re(e,e.player)];if(n.carries&&!e.gear.includes("suction"))o=n.carries;else if(!n.slides||e.gear.includes(n.slides))return;s??=new Set([z(e,i)]);let a=ne(e.player,o);if(s.has(z(e,a))||!Ht(e,a,o,!0,r)||(r.push({kind:"slid",who:"player",from:e.player,to:a}),s.add(z(e,a)),Gt(e,a,o,!0,r)))return;s.add(z(e,e.player))}}function Bt(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0}function Lr(e,t,r){if(t.kind==="move"){let o=e.player;if(ae(e,o))return!1;let i=ne(o,t.dir),s=re(e,i);if(s==="invisible-wall")return be(e,z(e,i),"wall"),r.push({kind:"revealed",at:i,what:s}),"shown";if(s==="fake-wall"&&(be(e,z(e,i),"floor"),r.push({kind:"revealed",at:i,what:s})),Ht(e,i,t.dir,!1,r))r.push({kind:"moved",who:"player",from:o,to:i}),Gt(e,i,t.dir,!1,r)||vn(e,t.dir,r);else if(!ft(e,r))return!1}else if(t.kind==="tool"){if(e.tools[t.tool]<=0)return!1;if(t.tool==="cake")e.hearts++;else if(t.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,r.push({kind:"stoned",turns:3});Re(e),e.tools[t.tool]--}return!0}function $t(e,t){return{level:e.level,terrain:!e.ownTerrain||Bt(e.terrain,t.terrain)?t.terrain:e.terrain,objects:!e.ownObjects||Bt(e.objects,t.objects)?t.objects:e.objects,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:Bt(e.hazards,t.hazards)?t.hazards:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome}}function Wt(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let r=it(e),o=[];return Lr(r,t,o)?{state:$t(r,e),events:o}:{state:e,events:[]}}function dt(e,t){return t===e||t.moves===e.moves}function V(e,t){if(e.outcome!=="playing")return{state:e,events:[]};let r=it(e),o=[],i=Lr(r,t,o);if(!i)return{state:e,events:[]};if(i==="shown")return{state:$t(r,e),events:o};let s=t.kind==="tool"&&t.tool==="mirror";return ft(r,o)||vr(r,o),!s&&!ft(r,o)&&Sr(r,o),r.moves++,{state:$t(r,e),events:o}}var Mn=["mirror","cake","cow"],ve=e=>e<=0?0:32-Math.clz32(e),Rr=new WeakMap;function ge(e){let t=Rr.get(e);return t||Rr.set(e,t=Pn(e)),t}function En(e){let t=new Set,r=[],o=l=>{let c=e.terrain[l];return H[c].block||H[c].door!==void 0||c==="fake-wall"},i=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,s=(l,c)=>l>=0&&c>=0&&l<e.rows&&c<e.cols,n=l=>{t.has(l)||l===i||!o(l)||(t.add(l),r.push(l))};e.objects.forEach((l,c)=>{l==="block"&&(t.add(c),r.push(c))});for(let l of e.machines){let c=l.at.r+K[l.dir][0],h=l.at.c+K[l.dir][1];l.template==="block"&&s(c,h)&&n(c*e.cols+h)}let a=[];for(e.terrain.forEach((l,c)=>{l==="teleport"&&a.push(c)});r.length;){let l=r.pop(),c=Math.floor(l/e.cols),h=l%e.cols,f=H[e.terrain[l]],u=f.slides!==void 0||f.carries!==void 0;for(let p of _){let[d,m]=K[p],b=c+d,g=h+m;if(!s(b,g))continue;let w=c-d,A=h-m;if(!(s(w,A)&&e.terrain[w*e.cols+A]!=="wall")&&!u)continue;let R=b*e.cols+g;if(e.terrain[R]!=="teleport"){n(R);continue}for(let C of a){let Y=Math.floor(C/e.cols)+d,P=C%e.cols+m;s(Y,P)&&n(Y*e.cols+P)}}}return t}var Ln={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},_t=e=>Ln[e]??(H[e].door!==void 0?"floor":void 0);function Rn(e,t){let r=new Set(t.map(i=>ie[i].crosses)),o=[];return e.terrain.forEach((i,s)=>{let n=_t(i);(H[i].hazard||r.has(i)||i==="toggle-closed"||n&&H[n].hazard)&&o.push(s)}),o}function Pn(e){let t=v=>e.objects.filter(y=>y===v).length,r=En(e),o=[],i=[],s=[],n=[],a=[];e.terrain.forEach((v,y)=>{_t(v)?o.push(y):(v==="toggle-open"||v==="toggle-closed")&&i.push(y);let $=e.objects[y];r.has(y)?($&&$!=="block"?a:n).push(y):$&&s.push(y)});let l=e.rows*e.cols,c=je.map(v=>ve(t(`key-${v}`))),h=Mn.map(v=>ve(t(v))),f=dr.filter(v=>t(v)>0),u=ve(l),p=t("cow")>0,d=e.minotaur!==null,m=t("mirror")>0?2:0,b=u*(2+(d?1:0)+(p?1:0))+m,g=ve(mr(e)),w=b+g+ve(e.relics),A=[],T=w+e.pageIds.length;for(let v of c)A.push(T),T+=v;let R=[];for(let v of h)R.push(T),T+=v;let C=[...e.hazards.map(v=>v.kind)];for(let v of e.machines)v.home!==void 0&&(C[v.home]=v.template);let Y=C.length>e.hazards.length,P=Y?0:e.hazards.length,M=Y?Rn(e,C):[],F=Y?ve(4*C.length):0,D=u*(2+(d?1:0)+(p?1:0))+m+g+ve(e.relics)+e.pageIds.length+c.reduce((v,y)=>v+y,0)+h.reduce((v,y)=>v+y,0)+f.length+o.length+(i.length?1:0)+s.length+n.length+2*a.length+P*(u+2)+M.length*F,S=T+f.length,L=S+o.length+(i.length?1:0),G=L+s.length+n.length+2*a.length,B=[];for(let v=0;v<l;v++)B.push({r:Math.floor(v/e.cols),c:v%e.cols});return{terrainAt:S,objectsAt:L,hazardsAt:G,cells:B,terrains:new Map,objectLists:new Map,words:Math.max(1,Math.ceil(D/32)),cellBits:u,none:l,minotaur:d,cow:p,stoneBits:m,heartBits:g,relicBits:ve(e.relics),pageBits:e.pageIds.length,keyBits:c,toolBits:h,gear:f,heartAt:b,pageAt:w,keyAt:A,toolAt:R,gearAt:T,changing:Int32Array.from(o),toggles:Int32Array.from(i),fixed:Int32Array.from(s),blockOnly:Int32Array.from(n),blockOrObject:Int32Array.from(a),hazardSlots:P,hazardCells:Int32Array.from(M),hazardBits:F,homeKinds:C}}function J(e,t,r,o,i){if(o===0)return r;let s=t+(r>>>5),n=r&31;return e[s]|=i<<n,n+o>32&&(e[s+1]|=i>>>32-n),r+o}function q(e,t,r,o){if(o===0)return 0;let i=t+(r>>>5),s=r&31,n=e[i]>>>s;return s+o>32&&(n|=e[i+1]<<32-s),o===32?n>>>0:n&(1<<o)-1}var Me=(e,t,r)=>t?t.r*e.level.cols+t.c:r,Pr={up:0,down:1,left:2,right:3};function Or(e,t,r,o,i,s){for(let n=i,a=i+s;n<a;n+=30){let l=Math.min(30,a-n);J(r,o,n,l,q(e,t,n,l))}}function He(e,t,r,o,i,s,n=0){let a=t;for(let b=0;b<a.words;b++)r[o+b]=0;let l=0;l=J(r,o,l,a.cellBits,Me(e,e.player,a.none)),l=J(r,o,l,a.cellBits,Me(e,e.throwBack,a.none)),a.minotaur&&(l=J(r,o,l,a.cellBits,Me(e,e.minotaur,a.none))),a.cow&&(l=J(r,o,l,a.cellBits,Me(e,e.cow,a.none))),l=J(r,o,l,a.stoneBits,e.stone),l=J(r,o,l,a.heartBits,e.hearts),l=J(r,o,l,a.relicBits,e.relicsLeft),l=J(r,o,l,a.pageBits,e.pages);let c=e.keys,h=e.tools;l=J(r,o,l,a.keyBits[0],c.red),l=J(r,o,l,a.keyBits[1],c.blue),l=J(r,o,l,a.keyBits[2],c.yellow),l=J(r,o,l,a.keyBits[3],c.green),l=J(r,o,l,a.toolBits[0],h.mirror),l=J(r,o,l,a.toolBits[1],h.cake),l=J(r,o,l,a.toolBits[2],h.cow);for(let b=0;b<a.gear.length;b++)l=J(r,o,l,1,e.gear.includes(a.gear[b])?1:0);let f=e.terrain,u=e.objects,p=e.level.terrain;if(i&&s&&f===i.terrain)Or(s,n,r,o,a.terrainAt,a.objectsAt-a.terrainAt);else{for(let b=0;b<a.changing.length;b++){let g=a.changing[b];J(r,o,a.terrainAt+b,1,f[g]===p[g]?0:1)}a.toggles.length&&J(r,o,a.objectsAt-1,1,f[a.toggles[0]]===p[a.toggles[0]]?0:1)}if(i&&s&&u===i.objects)Or(s,n,r,o,a.objectsAt,a.hazardsAt-a.objectsAt);else{l=a.objectsAt;for(let b=0;b<a.fixed.length;b++)l=J(r,o,l,1,u[a.fixed[b]]?1:0);for(let b=0;b<a.blockOnly.length;b++)l=J(r,o,l,1,u[a.blockOnly[b]]==="block"?1:0);for(let b=0;b<a.blockOrObject.length;b++){let g=u[a.blockOrObject[b]];l=J(r,o,l,2,g==="block"?2:g?1:0)}}l=a.hazardsAt;let d=e.hazards;if(a.hazardSlots>1){for(let b=1;b<d.length;b++)if(Me(e,d[b].at,a.none)<Me(e,d[b-1].at,a.none))throw new Error("the hazards must be sorted by cell")}for(let b=0;b<a.hazardSlots;b++){let g;for(let w=0;w<d.length;w++)if(d[w].home===b){g=d[w];break}l=J(r,o,l,a.cellBits,g?Me(e,g.at,a.none):a.none),l=J(r,o,l,2,g?Pr[g.dir]:0)}let m=0;for(let b=0;b<a.hazardCells.length;b++){let g=a.hazardCells[b],w=d[m],A=w!==void 0&&Me(e,w.at,a.none)===g;l=J(r,o,l,a.hazardBits,A?1+Pr[w.dir]+4*w.home:0),A&&m++}if(a.hazardCells.length&&m!==d.length)throw new Error(`packed ${m} of ${d.length} hazards: they must be sorted by cell`)}var zr=4096;function Cr(e,t,r,o){if(o<=30)return q(e,t,r,o);let i="";for(let s=r,n=r+o;s<n;s+=30)i+=q(e,t,s,Math.min(30,n-s))+",";return i}function On(e,t,r,o){let i=r.objectsAt-r.terrainAt;if(i===0)return o.terrain;let s=Cr(e,t,r.terrainAt,i),n=r.terrains.get(s);if(n)return n;let a=[...o.terrain];for(let l=0;l<r.changing.length;l++){if(!q(e,t,r.terrainAt+l,1))continue;let c=r.changing[l];a[c]=_t(o.terrain[c])}if(r.toggles.length&&q(e,t,r.objectsAt-1,1))for(let l of r.toggles)a[l]=o.terrain[l]==="toggle-open"?"toggle-closed":"toggle-open";return r.terrains.size>=zr&&r.terrains.clear(),r.terrains.set(s,a),a}function zn(e,t,r,o){let i=r.hazardsAt-r.objectsAt;if(i===0)return o.objects;let s=Cr(e,t,r.objectsAt,i),n=r.objectLists.get(s);if(n)return n;let a=[...o.objects],l=r.objectsAt;for(let c of r.fixed)q(e,t,l++,1)||(a[c]=null);for(let c of r.blockOnly)a[c]=q(e,t,l++,1)?"block":null;for(let c of r.blockOrObject){let h=q(e,t,l,2);l+=2,h===0?a[c]=null:h===2&&(a[c]="block")}return r.objectLists.size>=zr&&r.objectLists.clear(),r.objectLists.set(s,a),a}function pt(e,t,r,o,i=0){let s=r,n=s.cells,a=s.none,l=s.cellBits,c=0,h=n[q(e,t,c,l)];c+=l;let f=n[q(e,t,c,l)];c+=l;let u=null,p=null;if(s.minotaur){let y=q(e,t,c,l);c+=l,u=y===a?null:n[y]}if(s.cow){let y=q(e,t,c,l);c+=l,p=y===a?null:n[y]}let d=q(e,t,c,s.stoneBits);c+=s.stoneBits;let m=q(e,t,c,s.heartBits);c+=s.heartBits;let b=q(e,t,c,s.relicBits);c+=s.relicBits;let g=q(e,t,c,s.pageBits);c+=s.pageBits;let w=s.keyBits,A=s.toolBits,T=q(e,t,c,w[0]);c+=w[0];let R=q(e,t,c,w[1]);c+=w[1];let C=q(e,t,c,w[2]);c+=w[2];let Y=q(e,t,c,w[3]);c+=w[3];let P={red:T,blue:R,yellow:C,green:Y},M=q(e,t,c,A[0]);c+=A[0];let F=q(e,t,c,A[1]);c+=A[1];let D=q(e,t,c,A[2]);c+=A[2];let S={mirror:M,cake:F,cow:D},L=[];for(let y=0;y<s.gear.length;y++)q(e,t,c++,1)&&L.push(s.gear[y]);let G=On(e,t,s,o),B=zn(e,t,s,o);c=s.hazardsAt;let v=[];for(let y=0;y<s.hazardSlots;y++){let $=q(e,t,c,l);c+=l;let O=_[q(e,t,c,2)];c+=2,$!==a&&v.push({kind:s.homeKinds[y],at:n[$],dir:O,home:y})}v.length>1&&v.sort((y,$)=>y.at.r*o.cols+y.at.c-($.at.r*o.cols+$.at.c));for(let y=0;y<s.hazardCells.length;y++){let $=q(e,t,c,s.hazardBits);if(c+=s.hazardBits,!$)continue;let O=$-1>>>2;v.push({kind:s.homeKinds[O],at:n[s.hazardCells[y]],dir:_[$-1&3],home:O})}return{level:o,terrain:G,objects:B,player:h,hearts:m,keys:P,gear:L,tools:S,pages:g,throwBack:f,minotaur:u,stone:d,cow:p,hazards:v,relicsLeft:b,moves:i,outcome:"playing"}}var Ir=new Set(["wall","invisible-wall","clone"]);function Cn(e,t,r,o){let i=(c,h)=>c>=0&&h>=0&&c<e.rows&&h<e.cols&&!Ir.has(e.terrain[c*e.cols+h]),s=new Set,n=new Set,a=[],l=(c,h,f)=>{if(!i(c,h))return;let u=(c*e.cols+h)*4+_.indexOf(f);n.has(u)||(n.add(u),s.add(c*e.cols+h),a.push([c,h,f]))};for(l(Math.floor(t/e.cols)+K[r][0],t%e.cols+K[r][1],r);a.length;){let[c,h,f]=a.pop(),u=e.terrain[c*e.cols+h];if(u==="teleport"){for(let m of o){if(m===c*e.cols+h)continue;let b=Math.floor(m/e.cols)+K[f][0],g=m%e.cols+K[f][1];i(b,g)&&e.terrain[b*e.cols+g]!=="teleport"&&l(b,g,f)}continue}let p=H[u],d=p.carries??(p.slides?f:null);d&&l(c+K[d][0],h+K[d][1],d)}return[...s]}function Dn(e){let t=e.rows*e.cols,r=e.terrain.map(n=>!Ir.has(n)),o=e.terrain.flatMap((n,a)=>n==="teleport"?[a]:[]),i=Array.from({length:t},()=>[]);for(let n=0;n<t;n++)if(r[n])for(let a of _)for(let l of Cn(e,n,a,o.length>1?o:[]))i[l].push(n);let s=new Uint8Array(t);return e.terrain.forEach((n,a)=>{n==="safe"&&(s[a]=1)}),s[e.player.r*e.cols+e.player.c]=1,{n:t,open:r,into:i,thrown:s}}function Dr(e,t){let r=new Float64Array(e.n).fill(1/0),o=new Int32Array(e.n),i=0;for(let n of t)r[n]===1/0&&(r[n]=0,o[i++]=n);let s=!1;for(let n=0;n<i;n++){let a=o[n],l=r[a]+1;for(let c of e.into[a])r[c]===1/0&&(r[c]=l,o[i++]=c);if(!s&&e.thrown[a]){s=!0;for(let c=0;c<e.n;c++)e.open[c]&&r[c]===1/0&&(r[c]=l,o[i++]=c)}}return r}function Fn(e){let t=Dn(e),r=e.terrain.flatMap((n,a)=>n==="exit"?[a]:[]),o=Dr(t,r),i=e.objects.flatMap((n,a)=>n==="relic"?[a]:[]),s=i.map(n=>Dr(t,[n]));return n=>{if(n.outcome==="won")return 0;if(n.outcome==="lost")return 1/0;let a=n.player.r*e.cols+n.player.c,l=o[a];if(n.relicsLeft===0)return l;let c=0,h=1/0,f=0;for(let u=0;u<i.length;u++){if(n.objects[i[u]]!=="relic")continue;let p=s[u][a];c++,p<h&&(h=p),p>f&&(f=p)}return c<n.relicsLeft?1/0:Math.max(l,c===n.relicsLeft?f:h)}}var Fr=new WeakMap;function mt(e){let t=Fr.get(e);return t||Fr.set(e,t=Fn(e)),t}var Ge=class extends Error{},Br=1024;function Nt(e,t,r){let o=2538058380;for(let i=0;i<r;i++){let s=Math.imul(e[t+i],3432918353);s=Math.imul(s<<15|s>>>17,461845907),o^=s,o=Math.imul(o<<13|o>>>19,5)+3864292196}return o^=r,o=Math.imul(o^o>>>16,2246822507),o=Math.imul(o^o>>>13,3266489909),(o^o>>>16)>>>0}function bt(e){let t=e,r=Br,o=new Uint32Array(r*t),i=new Uint32Array(r),s=new Int32Array(r),n=new Uint8Array(r),a=new Uint32Array(r),l=0,c=new Int32Array(Br*2),h=c.length-1;function f(){r*=2;let p=new Uint32Array(r*t);p.set(o),o=p;let d=new Uint32Array(r);d.set(i),i=d;let m=new Int32Array(r);m.set(s),s=m;let b=new Uint8Array(r);b.set(n),n=b;let g=new Uint32Array(r);g.set(a),a=g,c=new Int32Array(r*2),h=c.length-1;for(let w=0;w<l;w++){let A=i[w]&h;for(;c[A]!==0;)A=A+1&h;c[A]=w+1}}function u(p,d,m){let b=p*t;for(let g=0;g<t;g++)if(o[b+g]!==d[m+g])return!1;return!0}return{get size(){return l},add(p,d,m,b,g){let w=Nt(p,d,t),A=w&h;for(let R=c[A];R!==0;A=A+1&h,R=c[A]){let C=R-1;if(!(i[C]!==w||!u(C,p,d)))return g>=a[C]?-1:(s[C]=m,n[C]=b,a[C]=g,C)}if(l===r)for(f(),A=w&h;c[A]!==0;)A=A+1&h;let T=l++;return o.set(p.subarray(d,d+t),T*t),i[T]=w,s[T]=m,n[T]=b,a[T]=g,c[A]=T+1,T},words(p,d,m){d.set(o.subarray(p*t,p*t+t),m)},parent:p=>s[p],action:p=>n[p],g:p=>a[p]}}var Ye=["mirror","cake","cow"],ze=_.length,yt=[..._.map(e=>({kind:"move",dir:e})),{kind:"wait"},...Ye.map(e=>({kind:"tool",tool:e}))],Kt=[ze,..._.map((e,t)=>t),...Ye.map((e,t)=>ze+1+t)];function $r(e,t){let r=[];for(let o=t;e.parent(o)>=0;o=e.parent(o))r.push(yt[e.action(o)]);return r.reverse()}function Ut(e,t){return We(qt(e,t),t.onProgress)}function*qt(e,t){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let r=t.store??bt(ge(e.level).words),o=s=>{if(s instanceof Ge)return{solved:!1,explored:r.size,capped:!0,reason:s.message};throw s},i;try{i=In(e,t,r)}catch(s){return o(s)}for(;;){let s;try{s=i()}catch(n){return o(n)}if("explored"in s)return s;yield s}}function We(e,t){for(;;){let r=e.next();if(r.done)return r.value;t?.(r.value)}}function In(e,t,r){let{cap:o,refuse:i}=t,s=t.prune??null,n=Math.max(1,t.progressEvery??65536),a=e.level,l=ge(a),c=mt(a),h=new Uint32Array(l.words),f=new Uint32Array(l.words),u=1024,p=new Int32Array(u),d=new Int32Array(u),m=new Int32Array(u),b=new Uint8Array(u),g=new Uint16Array(u),w=new Int32Array(u),A=0,T=S=>{if(S<u)return;for(;u<=S;)u*=2;let L=new Int32Array(u);L.set(p),p=L;let G=new Int32Array(u);G.set(d),d=G;let B=new Int32Array(u);B.set(m),m=B;let v=new Uint8Array(u);v.set(b),b=v;let y=new Uint16Array(u);y.set(g),g=y},R=(S,L)=>p[S]<p[L]||p[S]===p[L]&&(d[S]<d[L]||d[S]===d[L]&&(g[S]>g[L]||g[S]===g[L]&&S<L)),C=S=>{let L=w[S];for(;S>0;){let G=S-1>>1,B=w[G];if(!R(L,B))break;w[S]=B,m[B]=S,S=G}w[S]=L,m[L]=S},Y=S=>{if(A===w.length){let L=new Int32Array(w.length*2);L.set(w),w=L}w[A]=S,C(A++)},P=()=>{let S=w[0];m[S]=-1;let L=w[--A];if(A>0){let G=0;for(;;){let B=2*G+1;if(B>=A)break;let v=B+1,y=v<A&&R(w[v],w[B])?v:B;if(!R(w[y],L))break;w[G]=w[y],m[w[G]]=G,G=y}w[G]=L,m[L]=G}return S},M=c(e);if(He(e,l,h,0),s&&s({...e,moves:0},h,0))return()=>({solved:!1,explored:0,capped:!1});let F=r.add(h,0,-1,0,0);if(r.size>=o)return()=>({solved:!1,explored:r.size,capped:!0});T(F),d[F]=Number.isFinite(M)?M:-1,p[F]=d[F],m[F]=-1,g[F]=e.hearts,d[F]>=0&&Y(F);let D=0;return()=>{let S=null;for(;A>0;){if(S)return S;let L=P();if(b[L])return{solved:!0,line:$r(r,L),explored:r.size};let G=p[L],B=G-d[L];++D%n===0&&(S={expanded:D,stored:r.size,bestF:G,startH:M}),r.words(L,f,0);let v=pt(f,0,l,a,B);for(let y of Kt){if(y>ze&&v.tools[Ye[y-ze-1]]<=0)continue;let $=V(v,yt[y]),O=$.state;if(dt(v,O)||O.outcome==="lost"||i&&i($.events,v)||(He(O,l,h,0,v,f,0),s&&s(O,h,0)))continue;let N=r.size,I=r.add(h,0,L,y,B+1);if(I<0)continue;let ee=O.outcome==="won";if(r.size>N){T(I);let oe=ee?0:c(O);d[I]=Number.isFinite(oe)?oe:-1,m[I]=-1,b[I]=ee?1:0,g[I]=O.hearts}if(ee&&B+1===G)return{solved:!0,line:$r(r,I),explored:r.size};if(r.size>=o)return{solved:!1,explored:r.size,capped:!0};d[I]<0||(p[I]=B+1+d[I],m[I]>=0?C(m[I]):Y(I))}}return{solved:!1,explored:r.size,capped:!1}}}function Bn(e,t){for(let r=0;r<e.terrain.length;r++){if(!t(e.terrain[r]))continue;let o=Math.floor(r/e.cols),i=r%e.cols;for(let s of _){let n=o-K[s][0],a=i-K[s][1];if(n<0||a<0||n>=e.rows||a>=e.cols)continue;let l=H[e.terrain[n*e.cols+a]];if(l.slides||l.carries===s)return!0}}return!1}function $n(e,t){let r=e.terrain.flatMap((o,i)=>o==="teleport"?[i]:[]);return r.length<2?!1:r.some(o=>_.some(i=>{let s=Math.floor(o/e.cols)+K[i][0],n=o%e.cols+K[i][1];return s>=0&&n>=0&&s<e.rows&&n<e.cols&&t(e.terrain[s*e.cols+n])}))}var jr=(e,t)=>Bn(e,t)||$n(e,t);function jn(e,t){let r=[];t.heartBits&&r.push({pos:t.heartAt,width:t.heartBits,set:!1}),t.pageBits&&r.push({pos:t.pageAt,width:t.pageBits,set:!0}),je.forEach((i,s)=>{t.keyBits[s]&&!jr(e,n=>H[n].door===i)&&r.push({pos:t.keyAt[s],width:t.keyBits[s],set:!1})}),t.toolBits.forEach((i,s)=>{i&&r.push({pos:t.toolAt[s],width:i,set:!1})});let o=["flippers","fire-boots"];return t.gear.forEach((i,s)=>{o.includes(i)&&!jr(e,n=>H[n].needs===i)&&r.push({pos:t.gearAt+s,width:1,set:!1})}),r}var Yt=1024;function gt(e,t){let r=mt(e),o=jn(e,t);if(!o.length)return y=>r(y)===1/0;let i=t.words,s=new Uint32Array(i);for(let y of o)for(let $=y.pos;$<y.pos+y.width;$++)s[$>>>5]|=1<<($&31);let n=[],a=0;for(let y of o)n.push(a),a+=y.width;let l=a+31>>>5,c=o.length,h=Int32Array.from(o,y=>y.pos),f=Int32Array.from(o,y=>y.width),u=Uint8Array.from(o,y=>y.set?1:0),p=Int32Array.from(n),d=Uint32Array.from(s,y=>~y>>>0),m=Yt,b=new Uint32Array(m*i),g=new Int32Array(m),w=new Uint32Array(m),A=0,T=new Int32Array(Yt*2),R=T.length-1,C=Yt,Y=new Uint32Array(C*l),P=new Uint32Array(C),M=new Int32Array(C),F=0,D=-1,S=new Uint32Array(i),L=new Uint32Array(l);function G(){m*=2;let y=new Uint32Array(m*i);y.set(b),b=y;let $=new Int32Array(m);$.set(g),g=$;let O=new Uint32Array(m);O.set(w),w=O,T=new Int32Array(m*2),R=T.length-1;for(let N=0;N<A;N++){let I=w[N]&R;for(;T[I]!==0;)I=I+1&R;T[I]=N+1}}function B(y,$){let O=D;if(O>=0)D=M[O];else{if(F===C){C*=2;let N=new Uint32Array(C*l);N.set(Y),Y=N;let I=new Uint32Array(C);I.set(P),P=I;let ee=new Int32Array(C);ee.set(M),M=ee}O=F++}return Y.set(L,O*l),P[O]=y,M[O]=$,O}function v(y,$,O,N){for(let I=0;I<c;I++){let ee=q(y,$,p[I],f[I]),oe=q(O,N,p[I],f[I]);if(u[I]?(ee&oe)!==oe:ee<oe)return!1}return!0}return(y,$,O)=>{if(r(y)===1/0)return!0;let N=y.moves;for(let W=0;W<i;W++)S[W]=$[O+W]&d[W];let I=Nt(S,0,i);L.fill(0);for(let W=0;W<c;W++)J(L,0,p[W],f[W],q($,O,h[W],f[W]));let ee=I&R,oe=-1;for(let W=T[ee];W!==0;ee=ee+1&R,W=T[ee]){let pe=W-1;if(w[pe]!==I)continue;let $e=!0;for(let k=0;k<i&&$e;k++)$e=b[pe*i+k]===S[k];if($e){oe=pe;break}}if(oe<0){if(A===m)for(G(),ee=I&R;T[ee]!==0;)ee=ee+1&R;return oe=A++,b.set(S,oe*i),w[oe]=I,T[ee]=oe+1,g[oe]=B(N,-1),!1}for(let W=g[oe];W>=0;W=M[W])if(P[W]<=N&&v(Y,W*l,L,0))return!0;let Te=-1;for(let W=g[oe];W>=0;){let pe=M[W];N<=P[W]&&v(L,0,Y,W*l)?(Te<0?g[oe]=pe:M[Te]=pe,M[W]=D,D=W):Te=W,W=pe}return g[oe]=B(N,g[oe]),!1}}var he=2e6,fe=e=>e.some(t=>t.kind==="caught");function Ve(e,t=he){return Ut(e,{cap:t,refuse:null,prune:gt(e.level,ge(e.level))})}function Hr(e,t,r=he){return Ut(e,{cap:r,refuse:t,prune:gt(e.level,ge(e.level))})}function de(e,t,r=he,o={}){return qt(e,{cap:r,refuse:t,prune:gt(e.level,ge(e.level)),store:o.store,progressEvery:o.every})}var Gr={up:"u",down:"d",left:"l",right:"r"},Vt={mirror:"z",cake:"x",cow:"c"};function Ce(e){return e.map(t=>t.kind==="move"?Gr[t.dir]:t.kind==="wait"?"w":Vt[t.tool]).join("")}function _e(e){let t=[];for(let r of e){let o=_.find(s=>Gr[s]===r),i=Object.keys(Vt).find(s=>Vt[s]===r);if(o)t.push({kind:"move",dir:o});else if(r==="w")t.push({kind:"wait"});else if(i)t.push({kind:"tool",tool:i});else return null}return t}var Zt=e=>e.solved?e.line.length:e.capped?"unknown":"none";function Nr(e,t=he){return We(Hn(e,t))}function*Hn(e,t=he,r={}){let o=te(e),i=w=>({store:r.store?.(ge(w).words),every:r.every}),s=yield*de(o,null,t,i(e)),n=Zt(s),a=0;if(s.solved){let w=o;for(let A of s.line){let T=V(w,A);w=T.state,fe(T.events,w)&&a++}}let l=Zt(yield*de(o,fe,t,i(e))),c=yield*Gn(e,t,i(e)),h=c===null?"unknown":c?"chase":"solo",f=Xt(e),u=s.solved?Ce(s.line):"";if(!e.minotaur)return{solved:s.solved,shortest:n,explored:s.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:l,catches:a,label:h,naiveWins:f,line:u};let p={...e,minotaur:null},d=yield*de(te(p),null,t,i(p)),m=Zt(d),b=d.solved?!1:d.capped?null:!1;if(d.solved){let w=o;for(let A of d.line)w=V(w,A).state;b=w.outcome==="won"}let g=typeof n=="number"&&typeof m=="number"?n-m:null;return{solved:s.solved,shortest:n,explored:s.explored,withoutMinotaur:m,minotaurDelta:g,greedyWins:b,catchFree:l,catches:a,label:h,naiveWins:f,line:u}}function Wr(e,t,r,o){let i=new Uint8Array(e.rows*e.cols),s=[t];i[t]=1;for(let n=0;n<s.length;n++){let a=s[n],l=Math.floor(a/e.cols),c=a%e.cols;for(let h of _){let f=l+K[h][0],u=c+K[h][1];if(f<0||u<0||f>=e.rows||u>=e.cols)continue;let p=f*e.cols+u;!i[p]&&r(p)&&(i[p]=1,s.push(p))}if(o?.from(a))for(let h of o.to)!i[h]&&r(h)&&(i[h]=1,s.push(h))}return i}function Kr(e){let t=new Set(e.objects.filter(a=>a!==null));e.machines.some(a=>a.template==="block")&&t.add("block");let r=a=>{let l=H[a];return l.door?t.has(`key-${l.door}`):a==="water"?t.has("block"):a==="toggle-open"||a==="toggle-closed"},o=Wr(e,e.minotaur.r*e.cols+e.minotaur.c,a=>{let l=e.terrain[a];return H[l].minotaur||r(l)||l==="fake-wall"||l==="bomb"}),s=e.terrain.flatMap((a,l)=>a==="teleport"?[l]:[]).flatMap(a=>{let l=Math.floor(a/e.cols),c=a%e.cols;return _.flatMap(h=>{let f=l+K[h][0],u=c+K[h][1];return f<0||u<0||f>=e.rows||u>=e.cols?[]:[f*e.cols+u]})}),n=Wr(e,e.player.r*e.cols+e.player.c,a=>{let l=e.terrain[a],c=H[l];return l==="wall"?!1:c.door?r(l):!c.needs||t.has(c.needs)||r(l)},{from:a=>e.terrain[a]==="teleport",to:s});return!o.some((a,l)=>a===1&&n[l]===1)}function*Gn(e,t=he,r={}){if(!e.minotaur||Kr(e))return!1;let o=ge(e),i=r.store??bt(o.words),s=Math.max(1,r.every??65536);try{let n=new Uint32Array(o.words),a=new Uint32Array(o.words);if(He(te(e),o,n,0),i.add(n,0,-1,0,0),i.size>=t)return null;let l=0;for(let c=0;c<i.size;c++){++l%s===0&&(yield{expanded:l,stored:i.size,bestF:0,startH:0}),i.words(c,a,0);let h=pt(a,0,o,e,0);for(let f of Kt){if(f>ze&&h.tools[Ye[f-ze-1]]<=0)continue;let u=V(h,yt[f]);if(u.events.some(d=>d.kind==="caught"&&d.by==="minotaur"))return!0;let p=u.state;if(!(dt(h,p)||p.outcome!=="playing")&&(He(p,o,n,0,h,a,0),i.add(n,0,c,f,0),i.size>=t))return null}}return!1}catch(n){if(n instanceof Ge)return null;throw n}}var Wn=16;function _n(e,t){let r=e.rows*e.cols,o=new Int32Array(r).fill(-1),i=new Int8Array(r).fill(-1);o[t]=0;let s=[t];for(let n=0;n<s.length;n++){let a=s[n],l=Math.floor(a/e.cols),c=a%e.cols;_.forEach((h,f)=>{let u=l+K[h][0],p=c+K[h][1];if(u<0||p<0||u>=e.rows||p>=e.cols)return;let d=u*e.cols+p;o[d]>=0||e.terrain[d]==="wall"||(o[d]=o[a]+1,i[d]=f,s.push(d))})}return{dist:o,via:i}}function Nn(e){let t=e.rows*e.cols,r=e.player.r*e.cols+e.player.c,o=[],i=[];for(let m=0;m<t;m++)e.objects[m]==="relic"&&o.push(m),e.terrain[m]==="exit"&&i.push(m);let s=e.relics,n=[r,...o].map(m=>_n(e,m)),a=m=>{let b=-1,g=1/0;for(let w of i){let A=n[m].dist[w];A>=0&&A<g&&(g=A,b=w)}return[b,g]},l=(m,b)=>{let g=n[m].dist[b===0?r:o[b-1]];return g<0?1/0:g},c=null;if(s===0)c=[];else if(o.length<=Wn){let m=o.length,b=new Float64Array((1<<m)*m).fill(1/0),g=new Int8Array((1<<m)*m).fill(-1);for(let T=0;T<m;T++)b[(1<<T)*m+T]=l(0,T+1);let w=1/0,A=-1;for(let T=1;T<1<<m;T++){let R=Kn(T);if(!(R>s))for(let C=0;C<m;C++){let Y=b[T*m+C];if(!(!(T&1<<C)||Y===1/0)){if(R===s){let P=Y+a(C+1)[1];P<w&&(w=P,A=T*m+C);continue}for(let P=0;P<m;P++){if(T&1<<P)continue;let M=(T|1<<P)*m+P,F=Y+l(C+1,P+1);F<b[M]&&(b[M]=F,g[M]=C)}}}}if(A>=0){c=[];for(let T=A;;){let R=Math.floor(T/m),C=T%m;if(c.push(C+1),g[T]<0)break;T=(R&~(1<<C))*m+g[T]}c.reverse()}}else{c=[];let m=new Set(o.map((g,w)=>w+1)),b=0;for(;c.length<s;){let g=-1,w=1/0;for(let A of m){let T=l(b,A);T<w&&(w=T,g=A)}if(g<0){c=null;break}c.push(g),m.delete(g),b=g}}if(!c)return null;let h=c.length?c[c.length-1]:0,[f]=a(h);if(f<0)return null;let u=[],p=[0,...c],d=[...c.map(m=>o[m-1]),f];return p.forEach((m,b)=>{let{via:g}=n[m],w=d[b],A=[];for(let T=w;g[T]>=0;){let R=_[g[T]];A.push(R),T-=K[R][0]*e.cols+K[R][1]}u.push(...A.reverse())}),u}function Kn(e){let t=0;for(;e;e&=e-1)t++;return t}function Xt(e){let t=Nn(e);if(!t)return!1;let r=te(e);for(let o of t)if(r=V(r,{kind:"move",dir:o}).state,r.outcome!=="playing")break;return r.outcome==="won"}var De={minotaurDelta:8,exploredTimes:20};function wt(e,t=De,r){let o=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let i=e.withoutMinotaur!==null;if(i&&(e.minotaurDelta===null||e.greedyWins===null?o.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&o.push("the Minotaur does not matter: the line that ignores him wins, no longer")),o.push(...Ur(e)),!r)return o;if(!i)return[...o,"a challenge level has a Minotaur"];e.greedyWins!==!1&&o.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<t.minotaurDelta&&o.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${t.minotaurDelta}`);let s=l=>Math.max(0,...r.teaching.map(l)),n=s(l=>l.explored);e.explored<t.exploredTimes*n&&o.push(`a challenge level: stored ${e.explored} situations, the bar is ${t.exploredTimes} × ${n} = ${t.exploredTimes*n}`);let a=s(l=>typeof l.shortest=="number"?l.shortest:0);return typeof e.shortest=="number"&&e.shortest<a&&o.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${a}`),o}function Ur(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var _r={ramp:{least:1.1,most:1.5},most:2e4};function Fe(e){return e.terrain.some(t=>t==="fake-wall"||t==="invisible-wall")}function qr(e,t){return!Fe(e)||t.explored<=_r.most?[]:[`the level hides walls: stored ${t.explored} situations, the ceiling for a level that hides walls is ${_r.most}`]}var kt={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function Yr(e,t=kt){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let r=[];e.naiveWins&&r.push("the plain walk to the exit wins"),r.push(...Ur(e));let o=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=De.minotaurDelta,i=o?t.chaseShortest:t.shortest,s=o?t.chaseExplored:t.explored;return e.shortest<i&&r.push(`the quickest win is ${e.shortest} moves, the bar is ${i}`),e.explored<s&&r.push(`the solver searched ${e.explored} situations, the bar is ${s}`),r}var Un={flippers:e=>e.gear.includes("flippers")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="water","fire-boots":e=>e.gear.includes("fire-boots")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="fire",skates:e=>e.gear.includes("skates")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="ice",suction:e=>e.gear.includes("suction")&&H[e.terrain[e.player.r*e.level.cols+e.player.c]].carries!==void 0,mirror:e=>e.stone>0,cow:e=>e.cow!==null},qn={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function ke(e,t){let r=[...e.terrain],o=[...e.objects];t(r,o);let i=e.machines.filter(s=>r[s.at.r*e.cols+s.at.c]==="clone");return Q(Ae({...e,terrain:r,objects:o,machines:i}))}function xt(e){let t=[],r=n=>`row ${Math.floor(n/e.cols)+1}, column ${n%e.cols+1}`,o=n=>e.terrain[n.player.r*e.cols+n.player.c];for(let n of je){let a=`key-${n}`,l=c=>H[o(c)].door===n;e.objects.includes(a)&&t.push({name:`the ${n} keys`,ignored:[ke(e,(c,h)=>{h.forEach((f,u)=>{f===a&&(h[u]=null)})})],used:l}),e.terrain.some(c=>H[c].door===n)&&t.push({name:`the ${n} doors`,ignored:["wall","floor"].map(c=>ke(e,(h,f)=>{h.forEach((u,p)=>{H[u].door===n&&(h[p]=c)}),f.forEach((u,p)=>{u===a&&(f[p]=null)})})),used:l})}let i=e.objects.filter(n=>n==="relic").length>e.relics;e.objects.forEach((n,a)=>{n==="block"?t.push({name:`the block at ${r(a)}`,ignored:[ke(e,(l,c)=>{c[a]=null,l[a]="wall"}),ke(e,(l,c)=>{c[a]=null})]}):(n==="relic"?i:n!==null&&n!=="cake"&&n!=="page"&&!n.startsWith("key-"))&&t.push({name:`the ${n==="relic"?"spare relic":n} at ${r(a)}`,ignored:[ke(e,(l,c)=>{c[a]=null})],used:n===null?void 0:Un[n]})});let s=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[n,a,l]of s){if(!e.terrain.some(f=>a.includes(f)))continue;let c=l.map(f=>ke(e,u=>{u.forEach((p,d)=>{a.includes(p)&&(u[d]=f)})})),h=qn[a[0]];h&&e.objects.includes(h)&&c.push(ke(e,(f,u)=>{u.forEach((p,d)=>{p===h&&(u[d]=null)})})),t.push({name:`the ${n}`,ignored:c})}return e.terrain.some(n=>n==="button"||n==="toggle-open"||n==="toggle-closed")&&t.push({name:"the toggle walls and their button",ignored:[ke(e,n=>{n.forEach((a,l)=>{a==="button"||a==="toggle-open"?n[l]="floor":a==="toggle-closed"&&(n[l]="wall")})})]}),e.terrain.forEach((n,a)=>{let l=h=>{for(let[f,u]of Object.entries(e.links))u===a&&(h[Number(f)]="floor")},c=(h,f,u,p)=>t.push({name:`the ${h} at ${r(a)}`,ignored:[f,...p?[p]:[]].map(d=>ke(e,m=>{m[a]=d,u?.(m)}))});n==="trap"?c("snare","floor",l):n==="fake-wall"?c("fake wall","wall",void 0,"floor"):n==="invisible-wall"?c("invisible wall","floor"):n==="thief"?c("thief","floor"):n==="bomb"?c("bomb","floor"):n==="clone"&&c("clone machine","wall",l)}),e.hazards.forEach((n,a)=>{t.push({name:`the ${ie[n.kind].name.toLowerCase()} at ${r(n.at.r*e.cols+n.at.c)}`,ignored:[Q(Ae({...e,hazards:e.hazards.filter((l,c)=>c!==a)}))]})}),t}var Vr={explored:1.3};function Zr(e,t,r,o=!1){let i=Ve(te(t),r);if(!i.solved)return i.capped?"capped":"the level cannot be won";if(i.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${i.line.length}`;let s=Hr(te(t),fe,r);return s.solved?s.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${s.line.length}`:!o&&e.explored>=Vr.explored*i.explored?`the search falls from ${e.explored} situations to ${i.explored}`:null:s.capped?"capped":"no win without a catch"}function Yn(e,t){let r=new Set;for(let o of t.ignored)for(let i=0;i<e.terrain.length;i++)(o.terrain[i]!==e.terrain[i]||o.objects[i]!==e.objects[i])&&r.add(i);return[...r]}function Xr(e,t,r){let o=r.used?[]:Yn(e,r);if(!o.length&&!r.used)return!1;let i=te(e),s=n=>n.r*e.cols+n.c;for(let n of _e(t)??[]){if(i=V(i,n).state,r.used?.(i))return!0;let a=s(i.player),l=i.minotaur?s(i.minotaur):-1;for(let c of o)if(a===c||i.terrain[c]!==e.terrain[c]||i.objects[c]!==e.objects[c]||l===c&&e.terrain[c]==="trap")return!0}return!1}function Jr(e,t,r=he,o=!1){return!t.solved||typeof t.catchFree!="number"?[]:xt(e).flatMap(i=>{if(o&&Xr(e,t.line,i))return[];let s=i.ignored.map(n=>Zr(t,n,r,o));return s.some(n=>n!==null&&n!=="capped")?[]:s.includes("capped")?[{unit:i,problem:`${i.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:i,problem:o?`${i.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${t.shortest}`:`${i.name}: ignoring it changes nothing (still ${t.shortest} moves, and the search no ${Vr.explored} × smaller)`}]})}function*Qr(e,t,r=he){if(!t.solved||typeof t.catchFree!="number")return[];let o=[];for(let i of xt(e)){if(yield{expanded:0,stored:0,bestF:0,startH:0},Xr(e,t.line,i))continue;let s=i.ignored.map(n=>Zr(t,n,r,!0));s.some(n=>n!==null&&n!=="capped")||o.push(s.includes("capped")?`${i.name}: the search without it hit its cap, so it is not proved to matter`:`${i.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${t.shortest}`)}return o}function eo(e){let t=[["Theseus",e.player]];e.minotaur&&t.push(["the Minotaur",e.minotaur]);for(let o of e.hazards)t.push([`the ${ie[o.kind].name.toLowerCase()}`,o.at]);let r=[];for(let[o,i]of t){let s=i.r*e.cols+i.c,n=e.terrain[s],a=e.objects[s];(n!=="floor"||a!==null)&&r.push(`${o} starts on ${a??n} at row ${i.r+1}, column ${i.c+1}: nothing may start under a figure`)}return r}var Ne={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function to(e){return!e.minotaur||e.objects.includes("mirror")||e.terrain.includes("trap")?!1:Kr(e)}function Vn(e,t){let r=e.level;if(!e.minotaur)return 1/0;let o=e.minotaur.r*r.cols+e.minotaur.c,i=e.player.r*r.cols+e.player.c,s=new Map([[o,0]]),n=[o];for(let a=0;a<n.length;a++){let l=n[a],c=s.get(l);if(l===i)return c;if(c>=t)continue;let h=Math.floor(l/r.cols),f=l%r.cols;for(let u of _){let p=h+K[u][0],d=f+K[u][1];if(p<0||d<0||p>=r.rows||d>=r.cols)continue;let m=p*r.cols+d;s.has(m)||m!==i&&(!H[e.terrain[m]].minotaur||e.objects[m]==="block")||(s.set(m,c+1),n.push(m))}}return 1/0}function Jt(e,t){let r=_e(t.line)??[],o=te(e),i=0,s=0,n=0;for(let a of r)o=V(o,a).state,o.stone>0||!!o.minotaur&&(ae(br(o),o.minotaur)||Vn(o,Ne.reach)<=Ne.reach)?(i++,n=0):s=Math.max(s,++n);return{turns:r.length,live:i,quiet:s}}function ro(e,t,r){if(!e.minotaur||!t.solved||typeof t.shortest!="number")return[];let o=[];t.minotaurDelta!==null&&t.minotaurDelta<1&&o.push("the beast adds no moves: a route that ignores him wins as quickly");let i=Ne[r],s=Jt(e,t);return s.live<i.share*s.turns&&o.push(`the beast is live on ${s.live} of ${s.turns} turns; the bar is ${Math.ceil(i.share*s.turns)}`),s.quiet>i.quiet*s.turns&&o.push(`the beast is quiet for ${s.quiet} turns in a row; the bar is ${Math.floor(i.quiet*s.turns)}`),o}var Zn={walk:"walks round the Minotaur and never uses a tool",cowAtOnce:"sets the cow down as soon as it holds it",cowNear:"sets the cow down when the Minotaur is within 3 steps",mirrorNear:"raises the mirror when the Minotaur is within 2 steps",toolsNear:"sets the cow down and raises the mirror when the Minotaur comes near",careful:"takes the safest step when its next one would be caught",carefulTools:"is careful and sets the cow down and raises the mirror when the Minotaur comes near",cowStuck:"sets the cow down where the Minotaur gets stuck behind a wall short of it",cowStuckCareful:"sets the cow down where the Minotaur gets stuck, raises the mirror when he is near, and is careful"},Xe=Object.keys(Zn),Xn={walk:{cow:"none",mirror:!1,careful:!1},cowAtOnce:{cow:"once",mirror:!1,careful:!1},cowNear:{cow:"near",mirror:!1,careful:!1},mirrorNear:{cow:"none",mirror:!0,careful:!1},toolsNear:{cow:"near",mirror:!0,careful:!1},careful:{cow:"none",mirror:!1,careful:!0},carefulTools:{cow:"near",mirror:!0,careful:!0},cowStuck:{cow:"stuck",mirror:!1,careful:!1},cowStuckCareful:{cow:"stuck",mirror:!0,careful:!0}},Jn=_.map(e=>({kind:"move",dir:e})),Ze={kind:"wait"},Tt=e=>({kind:"tool",tool:e}),Qn=(e,t)=>Math.abs(e.r-t.r)+Math.abs(e.c-t.c),Ke=e=>e.some(t=>t.kind==="caught");function es(e){let t=V(e,Tt("cow"));if(t.state===e||Ke(t.events))return!1;let r=t.state;for(let o=0;o<10;o++){if(t=V(r,Ze),Ke(t.events)||t.state.outcome!=="playing")return!1;r=t.state}return!!r.cow}function ts(e,t){let r=null;for(let o=0;o<e.terrain.length;o++){let i=e.terrain[o];(i==="fake-wall"||i==="invisible-wall")&&(r??=[...e.terrain],r[o]=i==="fake-wall"?"wall":"floor")}return t?{...e,terrain:r??e.terrain}:{...e,terrain:r??e.terrain,minotaur:null,stone:0}}var so=(e,t)=>t.relicsLeft<e.relicsLeft,io=(e,t)=>t.outcome==="won",oo=e=>e.keys.red+e.keys.blue+e.keys.yellow+e.keys.green,At=(e,t)=>oo(t)>oo(e)||t.gear.length>e.gear.length||t.tools.mirror>e.tools.mirror||t.tools.cow>e.tools.cow||t.tools.cake>e.tools.cake,rs=e=>(t,r)=>r.tools[e]>t.tools[e];function xe(e,t){return no(e,t,!0)??no(e,t,!1)}function no(e,t,r){let o=ts(e,r),i=e.level.cols,s=new Set;for(let c of e.hazards){s.add(c.at.r*i+c.at.c);let[h,f]=K[c.dir];s.add((c.at.r+h)*i+c.at.c+f)}let n=c=>c.player.r*i+c.player.c,a=new Set([n(o)]),l=[];for(let c of _){let h=Wt(o,{kind:"move",dir:c});if(h.state===o||Ke(h.events)||h.state.player===o.player&&h.state.terrain===o.terrain||h.events.some(u=>u.kind==="robbed")||s.has(n(h.state)))continue;if(t(o,h.state))return{first:c,dist:1};let f=n(h.state);a.has(f)||(a.add(f),l.push({s:h.state,first:c}))}for(let c=2;l.length&&c<400;c++){let h=[];for(let{s:f,first:u}of l)for(let p of _){let d=Wt(f,{kind:"move",dir:p});if(d.state===f||Ke(d.events)||d.state.outcome==="lost"||d.events.some(b=>b.kind==="robbed"))continue;let m=n(d.state);if(!s.has(m)){if(t(o,d.state))return{first:u,dist:c};a.has(m)||(a.add(m),h.push({s:d.state,first:u}))}}l=h}return null}function Je(e){let t=e.relicsLeft>0?xe(e,so)??xe(e,At):xe(e,io)??xe(e,At);return t?t.dist:1/0}function os(e,t){for(let r of t)if(e.objects.some(o=>o===r)){let o=xe(e,rs(r));if(o)return o}return e.relicsLeft>0?xe(e,so)??xe(e,At):xe(e,io)??xe(e,At)}function ns(e,t){let r=e.minotaur,o=r?Qn(r,e.player):1/0;if(e.tools.cake>0&&e.hearts<=1)return Tt("cake");if(t.cow!=="none"&&e.tools.cow>0&&!e.cow&&(t.cow==="stuck"?es(e):t.cow==="once"||o<=3))return Tt("cow");if(t.mirror&&e.tools.mirror>0&&e.stone===0&&o<=2)return Tt("mirror");let i=[];t.cow!=="none"&&i.push("cow"),t.mirror&&i.push("mirror");let s=os(e,i),n=s?{kind:"move",dir:s.first}:Ze;if(n.kind==="move"&&V(e,n).state===e&&(n=Ze),t.careful&&Ke(V(e,n).events)){let a=null,l=1/0;for(let c of[...Jn,Ze]){let h=V(e,c);if(h.state===e||Ke(h.events))continue;let f=Je(h.state);f<l&&(l=f,a=c)}a&&(n=a)}return n}function Qt(e,t,r){let o=Xn[t],i=te(e),s=0;for(;s<r&&i.outcome==="playing";s++){let n=ns(i,o),a=V(i,n);a.state===i&&(a=V(i,Ze)),i=a.state}return{won:i.outcome==="won",turns:s}}var er=e=>4*e+50;function ao(e,t){return Xe.filter(r=>Qt(e,r,er(t)).won)}var Ue={detour:1,offRoute:1,away:2,waits:3,traps:3,forced:4},ss=3,is=e=>Math.max(5e4,2*e.explored),as=e=>Math.max(6e3,e.explored),lo=_.map(e=>({kind:"move",dir:e})),co={kind:"wait"},rr=e=>e.some(t=>t.kind==="caught");function ls(e){let t={...e.level,minotaur:null};return{...e,level:t,minotaur:null,stone:0}}function*Qe(e,t,r={spent:0}){let o=_e(t.line)??[],i=Math.max(0,t.minotaurDelta??0),s=0;if(e.minotaur&&o.length){let f=function*(d){if(d.outcome==="won")return 0;let m=yield*de(ls(d),null,is(t));return r.spent+=m.explored,m.solved?m.line.length:m.capped?NaN:1/0},u=te(e),p=yield*f(u);for(let d of o){let m=V(u,d).state,b=yield*f(m);Number.isFinite(p)&&!Number.isNaN(b)&&b!==p-1&&s++,p=b,u=m}}let n=0,a=0,l=0;{let f=te(e),u=Je(f);for(let p of o){let d=0;for(let g of[...lo,co]){let w=V(f,g);g.kind==="move"&&w.state===f||rr(w.events)||w.state.outcome==="lost"||d++}d===1&&l++,p.kind==="wait"&&a++;let m=V(f,p).state,b=m.outcome==="won"||m.relicsLeft<f.relicsLeft?0:Je(m);p.kind==="move"&&Number.isFinite(u)&&b>u&&n++,u=b===0?Je(m):b,f=m}}let c=0;{let f=te(e);for(let u=0;u<o.length;u++){let p=o[u];if(u%ss===0)for(let d of[...lo,co]){if(d.kind===p.kind&&(d.kind!=="move"||p.kind!=="move"||d.dir===p.dir))continue;let m=V(f,d);if(d.kind==="move"&&m.state===f||rr(m.events)||m.state.outcome!=="playing")continue;let b=yield*de(m.state,fe,as(t));r.spent+=b.explored,!b.solved&&!b.capped&&c++}f=V(f,p).state}}let h=Ue.detour*i+Ue.offRoute*s+Ue.away*n+Ue.waits*a+Ue.traps*c+Ue.forced*l;return{detour:i,offRoute:s,away:n,waits:a,traps:c,forced:l,total:h}}var cs=new Set(["wall","door-red","door-blue","door-yellow","door-green","gate","toggle-closed","fake-wall","invisible-wall","clone"]),tr={most:.5,area:6};function us(e){let t=e.rows,r=e.cols,o=(h,f)=>h>=0&&f>=0&&h<t&&f<r&&!cs.has(e.terrain[h*r+f]),i=0;for(let h=0;h<t;h++)for(let f=0;f<r;f++)o(h,f)&&i++;let s=new Uint8Array(t*r),n=new Uint8Array(t*r);for(let h=0;h+1<t;h++)for(let f=0;f+1<r;f++)o(h,f)&&o(h+1,f)&&o(h,f+1)&&o(h+1,f+1)&&(s[h*r+f]=1,n[h*r+f]=n[(h+1)*r+f]=n[h*r+f+1]=n[(h+1)*r+f+1]=1);let a=new Uint8Array(t*r),l=[];for(let h=0;h<t*r;h++){if(!s[h]||a[h])continue;let f=new Set,u=[h];a[h]=1;for(let p=0;p<u.length;p++){let d=u[p],m=Math.floor(d/r),b=d%r;f.add(d),f.add(d+1),f.add(d+r),f.add(d+r+1);for(let[g,w]of[[1,0],[-1,0],[0,1],[0,-1]]){let A=m+g,T=b+w,R=A*r+T;A>=0&&T>=0&&A<t&&T<r&&s[R]&&!a[R]&&(a[R]=1,u.push(R))}}l.push({cells:[...f].sort((p,d)=>p-d)})}let c=0;for(let h of n)c+=h;return{open:i,share:i?c/i:0,areas:l}}function hs(e,t){let r=e.cols,o=new Set([e.player.r*r+e.player.c,...e.hazards.map(s=>s.at.r*r+s.at.c)]);e.minotaur&&o.add(e.minotaur.r*r+e.minotaur.c);let i=[...e.terrain];for(let s of t){let n=Math.floor(s/r),a=s%r;n%2===0&&a%2===0&&i[s]==="floor"&&e.objects[s]===null&&!o.has(s)&&(i[s]="wall")}return Q(Ae({...e,terrain:i}))}function*fs(e,t){let r=yield*de(te(e),fe,t);if(!r.solved)return null;let o=0;if(e.minotaur){let i=yield*de(te({...e,minotaur:null}),null,t);if(!i.solved)return null;o=r.line.length-i.line.length}return yield*Qe(e,{line:Ce(r.line),minotaurDelta:o,explored:r.explored})}var ds=(e,t)=>`row ${Math.floor(t/e.cols)+1}, column ${t%e.cols+1}`;function*ho(e,t,r){let o=us(e),i=[];o.share>tr.most&&i.push({rule:"open",words:`Too open: ${Math.round(100*o.share)}% of the floor is open space (at most ${Math.round(100*tr.most)}%)`});for(let s of o.areas){if(s.cells.length<tr.area)continue;let n=hs(e,s.cells);if(n.terrain.every((l,c)=>l===e.terrain[c]))continue;let a=yield*fs(n,r);a&&a.total>=t.total&&i.push({rule:"open-area",words:`An open area near ${ds(e,s.cells[0])} does not earn its place: walled into corridors, the level is as hard (${a.total} against ${t.total})`,mended:n})}return i}var ps={walk:"The plain walk wins: walking to each relic and the exit, round the Minotaur, clears it",cowAtOnce:"The cow habit wins: setting the cow down at once and walking clears it",cowNear:"The cow habit wins: setting the cow down when the Minotaur comes near clears it",mirrorNear:"The mirror habit wins: raising the mirror when the Minotaur comes near clears it",toolsNear:"The tool habit wins: using the cow and the mirror when the Minotaur comes near clears it",careful:"The careful walk wins: stepping aside whenever the Minotaur would catch clears it",carefulTools:"The careful walk with tools wins: stepping aside and using the tools when he is near clears it",cowStuck:"The cow habit wins: setting the cow down where the Minotaur gets stuck clears it",cowStuckCareful:"The cow habit wins: setting the cow down where he gets stuck and stepping aside clears it"};function fo(e,t){return typeof t.shortest!="number"?[]:Xe.filter(r=>Qt(e,r,er(t.shortest)).won).map(r=>({rule:`habit:${r}`,words:ps[r]}))}var uo=(e,t)=>Q(Ae({...e,objects:e.objects.map(r=>r===t?null:r)}));function*po(e,t,r,o){let i=[];if(typeof t.shortest!="number")return i;for(let s of["cow","mirror"]){if(!e.objects.includes(s))continue;let n=yield*de(te(uo(e,s)),fe,o);n.solved&&n.line.length<=t.shortest&&i.push({rule:`tool:${s}`,words:`The ${s} is not needed: without it the level is won in ${n.line.length} moves`,mended:uo(e,s)})}if(r==="hard"&&e.objects.includes("cow")){let s=te(e);for(let n of _e(t.line)??[]){if(s.tools.cow>0&&!s.cow){let a=V(s,{kind:"tool",tool:"cow"});!rr(a.events)&&a.state!==s&&(yield*de(a.state,fe,o)).solved&&i.push({rule:"tool:cow-early",words:"The cow works too early: setting it down as soon as it is held still wins"});break}s=V(s,n).state}}return i}function or(e,t=0){let r=3735928559^t,o=1103547991^t;for(let i=0;i<e.length;i++){let s=e.charCodeAt(i);r=Math.imul(r^s,2654435761),o=Math.imul(o^s,1597334677)}return r=Math.imul(r^r>>>16,2246822507)^Math.imul(o^o>>>13,3266489909),o=Math.imul(o^o>>>16,2246822507)^Math.imul(r^r>>>13,3266489909),[r>>>0,o>>>0]}function nr(...e){return or(e.join(""))[0]}function mo(...e){let t=e.join(""),[r,o]=or(t),[i,s]=or(t,2654435769),n=r,a=o,l=i,c=s|1,h=()=>{let u=(n+a|0)+c|0;return c=c+1|0,n=a^a>>>9,a=l+(l<<3)|0,l=l<<21|l>>>11,l=l+u|0,(u>>>0)/4294967296};for(let u=0;u<12;u++)h();let f=u=>Math.floor(h()*u);return{next:h,int:f,pick:u=>u[f(u.length)],shuffle(u){let p=[...u];for(let d=p.length-1;d>0;d--){let m=f(d+1);[p[d],p[m]]=[p[m],p[d]]}return p}}}var St={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function sr(e){return Object.keys(St).filter(t=>St[t]<=e)}var qe=["fake","invisible"],ce={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},Ie=["up","down","left","right"];function ms(e,t,r){let o=e.length,i=e[0].length;return t<=0||r<=0||t>=o-1||r>=i-1||e[t][r]!=="#"?!1:e[t-1][r]!=="#"&&e[t+1][r]!=="#"&&e[t][r-1]!=="#"&&e[t][r+1]!=="#"}function yo(e,t,r){let o=e[t][r];e[t][r]=".";let i=Ie.some(s=>ms(e,t+ce[s][0],r+ce[s][1]));return e[t][r]=o,!i}function go(e,t){let{rows:r,cols:o}=t;if(r%2===0||o%2===0||r<7||o<7)return null;let i=(r-1)/2,s=(o-1)/2,n=Array.from({length:r},()=>Array(o).fill("#")),a=k=>2*Math.floor(k/s)+1,l=k=>2*(k%s)+1,c=i*s;for(let k=0;k<c;k++)n[a(k)][l(k)]=".";let h=k=>{let x=Math.floor(k/s),E=k%s,j=[];return x>0&&j.push(k-s),x<i-1&&j.push(k+s),E>0&&j.push(k-1),E<s-1&&j.push(k+1),j},f=(k,x)=>[(a(k)+a(x))/2,(l(k)+l(x))/2],u=[],p=(k,x)=>{let[E,j]=f(k,x);n[E][j]=".",u.push({r:E,c:j})},d=new Uint8Array(c),m=e.int(c);d[m]=1;let b=[m];for(;b.length;){let k=e.next()<t.winding?b.length-1:e.int(b.length),x=b[k],E=h(x).filter(Z=>!d[Z]);if(!E.length){b.splice(k,1);continue}let j=e.pick(E);p(x,j),d[j]=1,b.push(j)}let g=(k,x)=>n[k][x]!=="#",w=k=>Ie.filter(x=>g(a(k)+ce[x][0],l(k)+ce[x][1])).length;for(let k of e.shuffle([...Array(c).keys()])){if(w(k)!==1||e.next()>=t.braid)continue;let x=e.shuffle(h(k).filter(E=>{let[j,Z]=f(k,E);return n[j][Z]==="#"&&yo(n,j,Z)}));x.length&&p(k,x[0])}let A=new Set;for(let k=0;k<t.chambers&&i>2&&s>2;k++){let x=e.int(i-1),E=e.int(s-1);for(let j=2*x+1;j<=2*x+3;j++)for(let Z=2*E+1;Z<=2*E+3;Z++)n[j][Z]==="#"&&(n[j][Z]="."),A.add(j*o+Z)}let T=u.filter(k=>!A.has(k.r*o+k.c));T.length!==u.length&&(u.length=0,u.push(...T));let R=(k,x)=>u.some(E=>E.r===k&&E.c===x),C=()=>{let k=[];for(let x=1;x<r-1;x++)for(let E=1;E<o-1;E++)n[x][E]==="."&&!R(x,E)&&k.push([x,E]);return k},Y=(k,x)=>Ie.filter(E=>g(k+ce[E][0],x+ce[E][1])).length===1,P=(k=!1)=>{let x=C();if(!x.length)return null;let E=k?x.filter(([j,Z])=>Y(j,Z)):[];return e.pick(E.length?E:x)},M=(k,x=!1)=>{let E=P(x);return E?(n[E[0]][E[1]]=k,!0):!1},F=()=>e.shuffle(u.filter(k=>n[k.r][k.c]===".")),D=k=>{let x=F()[0];return x?(n[x.r][x.c]=k,!0):!1},S=()=>{let k=[];for(let x=1;x<r-1;x++)for(let E=1;E<o-1;E++)n[x][E]==="#"&&(n[x-1][E]==="."&&n[x+1][E]==="."&&n[x][E-1]==="#"&&n[x][E+1]==="#"||n[x][E-1]==="."&&n[x][E+1]==="."&&n[x-1][E]==="#"&&n[x+1][E]==="#")&&k.push([x,E]);return k.length?e.pick(k):null},L=k=>{for(let x of F()){let E=g(x.r-1,x.c)&&g(x.r+1,x.c)?["up","down"]:["left","right"],j=[[x.r,x.c]],Z=2+e.int(3);for(let me of e.shuffle(E)){let ue=x.r,we=x.c;for(;j.length<Z&&(ue+=ce[me][0],we+=ce[me][1],n[ue]?.[we]===".");)j.push([ue,we])}if(!(j.length<2)){for(let[me,ue]of j)n[me][ue]=k;return!0}}return!1},G=new Map,B=new Map,v=k=>{let x=P();return x?(n[x[0]][x[1]]=k,G.set(x[0]*o+x[1],e.pick(Ie)),!0):!1},y=!0;for(let k of t.families){switch(k){case"keys":{let[x,E]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),j=1+e.int(2);for(let Z=0;Z<j;Z++)y=D(x)&&y;for(let Z=0;Z<(x==="G"?1:j);Z++)y=M(E,!0)&&y;break}case"water":y=L("~")&&(e.next()<.5?M("f",!0):M("O"))&&y;break;case"fire":y=L("F")&&M("h",!0)&&y;break;case"ice":{y=L("=")&&y,e.next()<.5&&(y=M("k",!0)&&y);break}case"force":{y=L(e.pick(["^","v","<",">"]))&&y,e.next()<.5&&(y=M("u",!0)&&y);break}case"blocks":{let x=1+e.int(2);for(let E=0;E<x;E++)y=M("O")&&y;break}case"toggle":{let x=1+e.int(2);for(let E=0;E<x;E++)y=D(e.next()<.5?"T":"t")&&y;y=M("_")&&y;break}case"mirror":y=M("z",!0)&&y;break;case"cow":y=M("c",!0)&&y;break;case"gravel":{let x=1+e.int(2);for(let E=0;E<x;E++)y=D(":")&&y;break}case"popup":y=D(";")&&y;break;case"fake":{let x=e.next()<.6?S():null;x?n[x[0]][x[1]]="W":y=D("W")&&y;break}case"invisible":y=(e.next()<.5?D("I"):M("I"))&&y;break;case"snare":y=(e.next()<.5?D("&"):M("&"))&&M("-")&&y;break;case"teleport":y=M("@",!0)&&M("@",!0)&&y;break;case"ball":y=v("o")&&y;break;case"glider":y=v("w")&&y;break;case"fireball":y=v("e")&&y;break;case"thief":y=D("$")&&y;break;case"bomb":y=(e.next()<.5?D("!"):M("!"))&&y;break;case"clone":{let x=!1;for(let E=0;E<60&&!x;E++){let j=1+e.int(r-2),Z=1+e.int(o-2),me=e.pick(Ie),ue=j+ce[me][0],we=Z+ce[me][1];n[j][Z]!=="#"||n[ue]?.[we]!=="."||(n[j][Z]="C",B.set(j*o+Z,`${e.pick(["block","ball","block"])}-${me}`),x=!0)}y=x&&M("+")&&y;break}}if(!y)return null}let $=P();if(!$)return null;n[$[0]][$[1]]="P";let O=bs(n,$),N=[];for(let k=1;k<r-1;k++)n[k][1]==="."&&N.push([k,0,k,1,O[k*o+1]]),n[k][o-2]==="."&&N.push([k,o-1,k,o-2,O[k*o+o-2]]);for(let k=1;k<o-1;k++)n[1][k]==="."&&N.push([0,k,1,k,O[o+k]]),n[r-2][k]==="."&&N.push([r-1,k,r-2,k,O[(r-2)*o+k]]);N.sort((k,x)=>x[4]-k[4]||k[0]-x[0]||k[1]-x[1]);let I=N.filter(k=>k[4]>0).slice(0,Math.max(1,Math.ceil(N.length/3)));if(!I.length)return null;let[ee,oe,Te,W]=e.pick(I);n[ee][oe]="E";for(let k=0;k<t.relics;k++){let x=bo(n,O,.5,1).filter(([ue,we])=>!(ue===Te&&we===W)),E=x.filter(([ue,we])=>Y(ue,we)),j=E.length&&e.next()<.7?E:x;if(!j.length)return null;let[Z,me]=e.pick(j);n[Z][me]="*"}let pe=bo(n,O,.25,.6);if(!pe.length)return null;let $e=e.pick(pe);return n[$e[0]][$e[1]]="M",t.relics>0&&e.next()<.5&&n[Te][W]==="."&&!R(Te,W)&&(n[Te][W]="|"),{g:n,doors:u,facing:G,machines:B}}function bs(e,t){let r=e.length,o=e[0].length,i=new Int32Array(r*o).fill(-1);i[t[0]*o+t[1]]=0;let s=[t[0]*o+t[1]];for(let n=0;n<s.length;n++){let a=s[n],l=Math.floor(a/o),c=a%o;for(let h of Ie){let f=l+ce[h][0],u=c+ce[h][1];if(f<=0||u<=0||f>=r-1||u>=o-1)continue;let p=f*o+u;i[p]>=0||e[f][u]==="#"||(i[p]=i[a]+1,s.push(p))}}return i}function bo(e,t,r,o){let i=e.length,s=e[0].length,n=[];for(let a=1;a<i-1;a++)for(let l=1;l<s-1;l++)e[a][l]==="."&&t[a*s+l]>0&&n.push([a,l,t[a*s+l]]);return n.sort((a,l)=>a[2]-l[2]||a[0]-l[0]||a[1]-l[1]),n.slice(Math.floor(n.length*r),Math.ceil(n.length*o)).map(([a,l])=>[a,l])}function Be(e,t){let r=[`title: ${t}`,"intro: "],o=[...e.facing.keys()].sort((s,n)=>s-n);o.length&&r.push(`facing: ${o.map(s=>e.facing.get(s)).join(" ")}`);let i=[...e.machines.keys()].sort((s,n)=>s-n);return i.length&&r.push(`machines: ${i.map(s=>e.machines.get(s)).join(" ")}`),`${r.join(`
`)}

${e.g.map(s=>s.join("")).join(`
`)}
`}var ys=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function wo(e,t){let r=t.g.map(h=>[...h]),o=r.length,i=r[0].length,s=[...t.doors],n=new Map(t.facing),a=h=>{let f=[];for(let u=1;u<o-1;u++)for(let p=1;p<i-1;p++)h(u,p)&&f.push([u,p]);return f},l=(h,f)=>s.some(u=>u.r===h&&u.c===f),c=e.next();if(c<.55){let h=a((u,p)=>ys.has(r[u][p])&&!l(u,p)),f=a((u,p)=>r[u][p]==="."&&!l(u,p));if(h.length&&f.length){let[u,p]=e.pick(h),[d,m]=e.pick(f);r[d][m]=r[u][p],r[u][p]=".";let b=n.get(u*i+p);b&&(n.delete(u*i+p),n.set(d*i+m,b))}}else if(c<.7){let h=s.filter(u=>r[u.r][u.c]!=="."),f=s.filter(u=>r[u.r][u.c]===".");if(h.length&&f.length){let u=e.pick(h),p=e.pick(f);r[p.r][p.c]=r[u.r][u.c],r[u.r][u.c]="."}}else if(c<.8&&n.size)n.set(e.pick([...n.keys()]),e.pick(Ie));else{let h=s.filter(u=>r[u.r][u.c]==="."),f=a((u,p)=>r[u][p]==="#"&&(r[u-1][p]!=="#"&&r[u+1][p]!=="#"&&r[u][p-1]==="#"&&r[u][p+1]==="#"||r[u][p-1]!=="#"&&r[u][p+1]!=="#"&&r[u-1][p]==="#"&&r[u+1][p]==="#")&&yo(r,u,p));if(h.length>1&&(e.next()<.5||!f.length)){let u=e.pick(h);r[u.r][u.c]="#",s=s.filter(p=>p!==u)}else if(f.length){let[u,p]=e.pick(f);r[u][p]=".",s.push({r:u,c:p})}}return{g:r,doors:s,facing:n,machines:new Map(t.machines)}}var ko=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function gs(e,t,r){for(let o=-1;o<=1;o++)for(let i=-1;i<=1;i++){let s=t+o,n=r+i;if(s>=0&&n>=0&&s<e.rows&&n<e.cols&&ko(e.terrain[s*e.cols+n])!=="wall")return!1}return!0}function xo(e){return Array.from({length:e.rows-2},(t,r)=>Array.from({length:e.cols-2},(o,i)=>{let s=ko(e.terrain[(r+1)*e.cols+i+1]);return s==="wall"&&gs(e,r+1,i+1)?"":s}))}var ws=e=>e[0].map((t,r)=>e.map(o=>o[r]).reverse()),ks=e=>e.map(t=>[...t].reverse());function vt(e){let t=[];for(let r=0,o=e;r<4;r++,o=ws(o))t.push(o,ks(o));return t}function et(e,t){let r=0;for(let o of t){let[i,s]=e.length*e[0].length<=o.length*o[0].length?[e,o]:[o,e],n=i.length,a=i[0].length,l=s.length,c=s[0].length;if(!(n>l||a>c||l-n>2||c-a>2))for(let h=0;h<=l-n;h++)for(let f=0;f<=c-a;f++){let u=0,p=0;for(let d=0;d<n;d++)for(let m=0;m<a;m++){let b=i[d][m],g=s[d+h][m+f];b&&b===g&&u++,(b||g)&&p++}r=Math.max(r,p?u/p:1)}}return r}var Ao=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function ir(e){let t=new Set(e.terrain);return t.has("thief")||t.has("bomb")||t.has("clone")||t.has("button-red")?9:e.hazards.some(r=>r.kind!=="ball")?8:e.hazards.length?7:t.has("teleport")?6:t.has("trap")||t.has("button-brown")?5:t.has("fake-wall")||t.has("invisible-wall")?4:t.has("popup")?3:t.has("gravel")?2:1}var Mt=2e3,xs={...kt,explored:Mt,chaseExplored:Mt},Ts=e=>({teaching:[{explored:Math.ceil(Mt/De.exploredTimes),shortest:Ao[e-1].shortest}]});function So(e){let t=Ao[e-1];return{explored:Mt,shortest:Math.max(kt.chaseShortest,t.shortest)}}var ot=3e4,vo=4*ot,As={easy:{first:[25,40],plateau:[45,70]},medium:{first:[35,55],plateau:[70,110]},hard:{first:[50,75],plateau:[110,170]}},Et={least:1.1,most:1.35},tt={least:.7,most:.9},Mo=5;function ar(e,t){let r=As[t];if(e===null)return{least:r.first[0],most:r.first[1],plateau:!1};let o={least:r.plateau[0],most:r.plateau[1],plateau:!0};if(e>=r.plateau[0])return o;let i=Math.max(r.first[0],Math.ceil(e*Et.least)),s=Math.min(r.plateau[1],Math.floor(e*Et.most));return i>=r.plateau[0]?o:{least:i,most:Math.max(s,i+4),plateau:!1}}function Eo(e){return{least:Math.floor(e.least*tt.least),most:Math.max(Math.floor(e.least*tt.most),Math.floor(e.least*tt.least)+4),plateau:e.plateau}}function nt(e){return xo(e).map((t,r)=>t.map((o,i)=>(r+1)%2===0&&(i+1)%2===0?"":o))}function Lo(e){return{features:e.map(t=>vt(nt(t)))}}function lr(e){let{rows:t,cols:r}=e,o=(n,a)=>e.terrain[n*r+a]==="wall",i=(n,a)=>4-[o(n-1,a),o(n+1,a),o(n,a-1),o(n,a+1)].filter(Boolean).length,s=[];for(let n=1;n<t-1;n++)for(let a=1;a<r-1;a++){let l=n*r+a,c=4-i(n,a);if(o(n,a)&&c===0&&s.push(`a lone wall at row ${n+1}, column ${a+1}`),!(e.terrain[l]==="floor"&&e.objects[l]===null&&!(e.player.r===n&&e.player.c===a)&&!(e.minotaur?.r===n&&e.minotaur.c===a)&&!e.hazards.some(p=>p.at.r===n&&p.at.c===a))||c<3)continue;let[f,u]=o(n-1,a)?o(n+1,a)?o(n,a-1)?[n,a+1]:[n,a-1]:[n+1,a]:[n-1,a];(c===4||f<=0||u<=0||f>=t-1||u>=r-1||i(f,u)!==2)&&s.push(`a bare pocket at row ${n+1}, column ${a+1}`)}return s}function cr(e,t,r=[]){let o=nt(e),i=[];return t.features.forEach((s,n)=>{let a=et(o,s);a>=.42&&i.push(`its layout repeats campaign level ${n+1}'s (${a.toFixed(2)})`)}),r.forEach((s,n)=>{let a=et(o,vt(nt(s)));a>=.42&&i.push(`its layout repeats the run's level ${n+1}'s (${a.toFixed(2)})`)}),i}function Ro(e,t,r=[]){let o=nt(e),i=0;for(let s of t.features)i=Math.max(i,et(o,s));for(let s of r)i=Math.max(i,et(o,vt(nt(s))));return i}var To=e=>e.charAt(0).toUpperCase()+e.slice(1);function Ee(e,t){return t.map(r=>{let o=To(r);return e==="purpose"?o=`A useless piece: ${r.slice(0,r.indexOf(":")>0?r.indexOf(":"):r.length)}`:r==="the plain walk to the exit wins"?o="The plain walk wins: walking straight to each relic and the exit clears it":r.startsWith("a challenge level: the line that ignores")?o="The Minotaur can be ignored: the best line without him also wins":r.startsWith("a challenge level: ")?o=To(r.slice(19)):e==="threat"?o=`The Minotaur is no threat: ${r}`:e==="tidy"&&(o=`Untidy: ${r}`),{rule:e,words:o}})}function*Po(e,t,r,o,i=he){let s=[],n=l=>(s.push(...l),!o&&s.length>0);if(!t.solved)return{score:null,problems:Ee("solve",wt(t))};if(n(Ee("challenge",wt(t,De,Ts(ir(e))))))return{score:null,problems:s};if(n(Ee("shared",Yr(t,xs).filter(l=>!wt(t).includes(l)))))return{score:null,problems:s};if(n(Ee("threat",ro(e,t,"challenge"))))return{score:null,problems:s};if(n(Ee("hidden",qr(e,t))))return{score:null,problems:s};if(n(Ee("start",eo(e))))return{score:null,problems:s};if(n(Ee("tidy",lr(e))))return{score:null,problems:s};if(yield{expanded:0,stored:0,bestF:0,startH:0},n(fo(e,t)))return{score:null,problems:s};let a=yield*Qe(e,t);return n(yield*ho(e,a,i))?{score:a,problems:s}:n(yield*po(e,t,typeof r=="function"?r(a):r,i))?{score:a,problems:s}:(n(Ee("purpose",yield*Qr(e,t,i))),{score:a,problems:s})}function Oo(e,t,r,o=[]){let i=[];return t.explored>ot&&i.push(`stored ${t.explored} situations, more than ${ot}`),[...i,...cr(e,r,o)]}function zo(e,t){return e.total<t.least||e.total>t.most?[`scored ${e.total}, the band is ${t.least} to ${t.most}`]:[]}var Fo=3e6,hr=12,ja=Fo*hr;function Ss(e){return{parts:hr,budget:e.budget===void 0?Fo:Math.max(1,Math.floor(e.budget/hr))}}var Io=12,Lt=120,vs=.25,Ms=8,Es=60;function Ls(e,t,r,o,i=null,s=!1){let n=sr(t).filter(u=>!qe.includes(u));r==="hard"&&i!=="cow"&&e.int(Ms)!==0&&(n=n.filter(u=>u!=="cow"));let a=n.filter(u=>St[u]===Math.min(t,9)),l=(r==="hard"?4:3)+e.int(2),c=[];i&&!qe.includes(i)?c.push(i):a.length&&e.next()<.5&&c.push(e.pick(a)),o&&c.push(i&&qe.includes(i)?i:e.pick(qe));for(let u of e.shuffle(n))c.length<l+(o?1:0)&&!c.includes(u)&&c.push(u);let h=s?[15]:[13,15],f=e.next();return{rows:e.pick(h),cols:e.pick(h),families:c,relics:(s?2:1)+e.int(2),winding:.3+.6*e.next(),braid:.45+.5*e.next(),chambers:f<.85?0:f<.97?1:2}}var fr=.6931471805599453;function Rt(e){let t=0;for(;e>=2;)e/=2,t++;for(;e<1;)e*=2,t--;let r=(e-1)/(e+1),o=r*r,i=r,s=0;for(let n=1;n<60;n+=2)s+=i/n,i*=o;return 2*s+t*fr}function Rs(e){if(!(e>=0))return 1;if(e>60)return 0;let t=0;for(;e>=fr;)e-=fr,t++;let r=1,o=1;for(let i=1;i<30;i++)r*=-e/i,o+=r;for(;t>0;t--)o/=2;return o}var Co=Math.ceil(ot*1.05),ur=vo,Ps=2e3;function Os(e,t,r,o=()=>0){if(!e.minotaur)return 1/0;let i=lr(e).length;if(i)return 14+i;let s=o(e);if(s>=.42)return 13+10*(s-.42);if(Xt(e))return r(0,"cheap:walk"),12.5;if(to(e))return r(0,"cheap:penned"),12.5;let n=te(e),a=Ve(n,Co);if(!a.solved)return r(a.explored,a.capped?"solve:capped":"solve:lost"),a.capped?12:30;r(a.explored,"solve");let l=0,c=So(ir(e));a.explored<c.explored&&(l+=3*Rt(c.explored/a.explored)),a.line.length<c.shortest&&(l+=.2*(c.shortest-a.line.length));let h=n,f=0;for(let w of a.line){let A=V(h,w);h=A.state,fe(A.events,h)&&f++}l+=3*f;let u=Jt(e,{line:Ce(a.line)});if(l+=6*Math.max(0,Ne.challenge.share-u.live/Math.max(1,u.turns)),l+=6*Math.max(0,u.quiet/Math.max(1,u.turns)-Ne.challenge.quiet),l>0)return l;let p=Ve(te({...e,minotaur:null}),Co);r(p.explored,"free");let d=0;if(p.solved){d=a.line.length-p.line.length,l+=.4*Math.max(0,De.minotaurDelta-d);let w=n;for(let A of p.line)w=V(w,A).state;w.outcome==="won"&&(l+=2)}if(l>0)return l;let m=ao(e,a.line.length).length;if(r(Ps*Xe.length,"habits"),m)return 1+.5*Math.min(m,4);let b={spent:0},g=We(Qe(e,{line:Ce(a.line),minotaurDelta:d,explored:a.explored},b)).total;return r(b.spent,"score"),g<t.least&&(l+=3*Rt(t.least/Math.max(1,g))),g>t.most&&(l+=3*Rt(g/t.most)),l}function Do(e,t){let r=Ae(t),o=r.slice(r.indexOf(`

`)+2).trimEnd().split(`
`).map(n=>[...n]),i=new Map(t.hazards.map(n=>[n.at.r*t.cols+n.at.c,n.dir])),s=new Map(t.machines.map(n=>[n.at.r*t.cols+n.at.c,`${n.template}-${n.dir}`]));return{g:o,doors:e.doors,facing:i,machines:s}}function zs(e){let t=r=>r.terrain.filter(o=>o==="wall").length;return e.reduce((r,o)=>t(o)<t(r)?o:r)}function Cs(e,t,r,o=!1){let i=t.run.slice(-Io),s=e.filter(d=>d.chapter<=t.tier),n=i.map(d=>Q(d.text)),a=s.filter(d=>!i.some(m=>m.text===d.text)&&cr(Q(d.text),{features:[]},n).length===0),l=Bo(t.run)?.score??null,c=ar(Number.MAX_SAFE_INTEGER,t.grade),h=d=>Fe(Q(d.text))===o,f=[d=>h(d)&&d.score>=r.least&&d.score<=r.most,d=>d.score>=r.least&&d.score<=r.most&&!Fe(Q(d.text)),d=>l!==null&&d.score>=l*tt.least&&d.score<=l*Et.most,d=>d.score>=c.least&&d.score<=c.most,()=>!0],u=d=>d[nr("endless-bank",t.seed,t.tier,t.grade,t.depth)%d.length],p=s.filter(d=>d.text!==t.run.at(-1)?.text);for(let d of f)for(let m of[a,p,s]){let b=m.filter(d);if(b.length)return u(b)}if(e.length)return u(e);throw new RangeError("the bank is empty")}function Bo(e){for(let t=e.length-1;t>=0;t--)if(!Fe(Q(e[t].text)))return e[t];return null}function Ds(e,t,r,o,i,s,n,a,l){let c=n.by,h=(d,m="other")=>{n.spent+=d,c&&(c[m]=(c[m]??0)+d,c[m+"#"]=(c[m+"#"]??0)+1)},f=new Map,u=d=>{let m=`${d.cols}:${d.terrain.join(",")}`,b=f.get(m);return b===void 0&&(b=Ro(d,o,i),f.set(m,b)),b},p={grade:t.grade,band:t.band,previous:r};for(let d=0;n.spent<s;d++){let m=mo("endless",...e,d),b=go(m,Ls(m,t.tier,t.grade,t.hides,t.family??null,t.band.least>=Es));if(!b){h(1e3);continue}let g=M=>{try{return Q(Be(M,""))}catch{return null}},w=new Map,A=(M,F)=>{let D=Be(M,""),S=w.get(D);return S===void 0?(S=Os(F,t.band,h,u),Number.isFinite(S)&&Fe(F)!==t.hides&&(S+=4),t.family&&Number.isFinite(S)&&!Fs(F,t.family)&&(S+=4),w.set(D,S)):c&&(c["memo#"]=(c["memo#"]??0)+1),S},T=g(b),R=T?A(b,T):1/0,C=R,Y=n.spent,P=Lt;for(let M=0;M<P&&n.spent<s&&(M===P-1&&R<2&&P<3*Lt&&(P+=Lt),!(M===Math.floor(Lt/3)&&R>=8));M++){if(n.tries++,M%8===0&&a?.({tries:n.tries,spent:n.spent,budget:s}),R===0&&T){let L=Nr(T,ur);h(4*L.explored,"measure");let G=Oo(T,L,o,i),B=null;G.length||(B=We(Po(T,L,t.grade,!1,ur)),h(B.score?8*L.explored:0,"checks"));let v=G.length?G:B.problems.map(O=>O.words),y=!G.length&&B.problems.length>0&&B.problems.every(O=>O.rule==="purpose"),$=G.length?void 0:B.problems.find(O=>O.mended)?.mended;if($){l?.(`mended: ${v.join("; ")}`),c&&(c["mended#"]=(c["mended#"]??0)+1),b=Do(b,$),T=g(b),R=T?A(b,T):1/0;continue}if(v.length&&!y){if(l?.(`gate: ${v.join("; ")}`),c)for(let O of v){let N="gate:"+O.replace(/[0-9.,×%]+/g,"N").slice(0,50);c[N]=(c[N]??0)+1}R=1,w.set(Be(b,""),R)}else if(y){h(xt(T).reduce((I,ee)=>I+ee.ignored.length,0)*2*L.explored,"useless");let O=Jr(T,L,ur,!0);if(!O.length){R=1,w.set(Be(b,""),R);continue}l?.(`useless: ${O.map(I=>I.problem).join("; ")}`);let N=zs(O[0].unit.ignored);b=Do(b,N),T=g(b),R=T?A(b,T):1/0;continue}else{let O=B.score,N=zo(O,t.band);if(!N.length)return{text:Be(b,""),d:L,score:O.total};l?.(`band: ${N.join("; ")}`),c&&(c["gate:band"]=(c["gate:band"]??0)+1),R=.5+3*Math.abs(Rt(O.total<t.band.least?t.band.least/Math.max(1,O.total):O.total/t.band.most)),w.set(Be(b,""),R)}}let F=wo(m,b),D=g(F);if(!D)continue;let S=A(F,D);(S<=R||Number.isFinite(S)&&m.next()<Rs((S-R)/vs))&&(b=F,T=D,R=S)}l?.(`round ${d}: began ${C.toFixed(2)}, ended ${R.toFixed(2)} from passing, ${n.spent-Y} spent`)}return null}function Fs(e,t){let r=s=>e.terrain.includes(s),o=s=>e.objects.includes(s),i=s=>e.hazards.some(n=>n.kind===s);switch(t){case"keys":return e.terrain.some(s=>s.startsWith("door-"));case"water":return r("water");case"fire":return r("fire");case"ice":return r("ice");case"force":return e.terrain.some(s=>s.startsWith("force-"));case"blocks":return o("block")||e.machines.some(s=>s.template==="block");case"toggle":return r("toggle-open")||r("toggle-closed");case"mirror":return o("mirror");case"cow":return o("cow");case"gravel":return r("gravel");case"popup":return r("popup");case"fake":return r("fake-wall");case"invisible":return r("invisible-wall");case"snare":return r("trap");case"teleport":return r("teleport");case"ball":return i("ball");case"glider":return i("glider");case"fireball":return i("fireball");case"thief":return r("thief");case"bomb":return r("bomb");case"clone":return r("clone")}}function $o(e){let t=e.run.at(-1)??null,r=ar(Bo(e.run)?.score??null,e.grade),o=e.depth>1&&sr(e.tier).some(i=>qe.includes(i))&&nr("endless-hides",e.seed,e.tier,e.grade,e.depth)%Mo===0;return{band:o?Eo(r):r,hides:o,before:t}}function jo(e,t,r,o={}){let{band:i,hides:s,before:n}=$o(e),{parts:a,budget:l}=Ss(e);if(!n||t<0||t>=a)throw new RangeError(`no part ${t} of a search for level ${e.depth}`);let c={tries:0,spent:0},h=e.run.slice(-Io).map(p=>Q(p.text)),f=Ds([e.seed,e.tier,e.grade,e.depth,"part",t],{tier:e.tier,grade:e.grade,band:i,hides:s},{explored:n.explored},r,h,l,c,o.progress);return{found:f?{text:f.text,explored:f.d.explored,shortest:f.d.shortest,score:f.score,line:f.d.line,from:"made",tries:c.tries,spent:c.spent}:null,...c}}function Ho(e,t,r=0,o=0){let i=$o(e),s=Cs(t,e,i.band,i.hides);return{text:s.text,explored:s.explored,shortest:s.shortest,score:s.score,line:s.line,from:"bank",tries:r,spent:o}}var Is=150;function Go(e){let t=null;return{receive(r){try{if(r.type==="bank"){e.post({type:"made",id:r.id,made:Ho(r.request,e.banks[r.request.grade],r.tries,r.spent)});return}if(r.type!=="part")return;t??=e.known();let o=-1/0,i=jo(r.request,r.part,t,{progress:s=>{let n=e.now();n-o<Is||(o=n,e.post({type:"progress",id:r.id,progress:s}))}});e.post({type:"part",id:r.id,part:r.part,result:i})}catch(o){e.post({type:"failed",id:r.id,message:o instanceof Error?o.message:String(o)})}}}}var Wo={easy:[],medium:[],hard:[]};var _o=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
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
`}];var No=[{id:"ch2-1",text:`title: The Loose Stone
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
`}];var Ko=[{id:"ch3-1",text:`title: The Rising Floor
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
`}];var Uo=[{id:"ch4-1",text:`title: The Wall That Gives
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
`}];var qo=[{id:"ch5-1",text:`title: The Snare
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
`}];var Yo=[{id:"ch6-1",text:`title: The Teleport
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
`}];var Vo=[{id:"ch7-1",text:`title: The Bronze Ball
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
`}];var Zo=[{id:"ch8-1",text:`title: The Harpy
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
`}];var Xo=[{id:"ch9-1",text:`title: The Thief
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
`}];var Jo=[{id:"ch10-1",text:`title: The Wooden Cow
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
`}];var Bs=[..._o,...No,...Ko,...Uo,...qo,...Yo,...Vo,...Zo,...Xo,...Jo];function Qo(){return Bs.map(e=>Q(e.text))}var $s=Go({post:e=>self.postMessage(e),banks:Wo,known:()=>Lo(Qo()),now:()=>performance.now()});self.onmessage=e=>$s.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
