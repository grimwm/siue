"use strict";(()=>{var H=["up","down","left","right"],U={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},Ge=["red","blue","yellow","green"],Dn=["flippers","fire-boots","skates","suction"],Hr={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},Y=(e,r,n,t={},s,l=r)=>({char:e,minotaur:r,block:n,hazard:l,...t,sprites:s??[]}),_={floor:Y(".",!0,!0,{},["floor"]),wall:Y("#",!1,!1,{},["wall"]),exit:Y("E",!1,!1,{},["exit"]),gate:Y("|",!1,!1,{},["gate-closed","gate-open"]),water:Y("~",!1,!0,{needs:"flippers"},["water"]),fire:Y("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:Y("=",!0,!0,{slides:"skates"},["ice"]),"force-up":Y("^",!0,!0,{carries:"up"},["force-up"]),"force-down":Y("v",!0,!0,{carries:"down"},["force-down"]),"force-left":Y("<",!0,!0,{carries:"left"},["force-left"]),"force-right":Y(">",!0,!0,{carries:"right"},["force-right"]),dirt:Y("%",!0,!0,{},["dirt"]),safe:Y("S",!1,!1,{},["safe"]),button:Y("_",!0,!0,{},["button"]),"toggle-open":Y("t",!0,!1,{},["toggle-open"]),"toggle-closed":Y("T",!1,!1,{},["toggle-closed"]),"door-red":Y("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":Y("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":Y("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":Y("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:Y("&",!0,!0,{},["trap"]),"button-brown":Y("-",!0,!0,{},["button-brown"]),"button-red":Y("+",!0,!0,{},["button-red"]),popup:Y(";",!1,!1,{},["popup"]),gravel:Y(":",!1,!1,{},["gravel"]),"fake-wall":Y("W",!1,!1,{},["wall"]),"invisible-wall":Y("I",!1,!1,{},["floor"]),teleport:Y("@",!1,!1,{},["teleport"]),thief:Y("$",!0,!0,{},["thief"]),bomb:Y("!",!1,!0,{},["bomb"],!0),clone:Y("C",!1,!1,{},H.map(e=>`clone-${e}`))},le={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var ar={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:Hr.mirror.name},cake:{char:"x",sprite:"cake",name:Hr.cake.name},cow:{char:"c",sprite:"cow",name:Hr.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},To=["theseus","minotaur","minotaur-stone","cow-standing"],Eo=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],Po=["exit-off","exit-wake"],xs=[...new Set([...Object.values(_).flatMap(e=>e.sprites),...Eo,...Po,...Object.values(ar).map(e=>e.sprite),...To,...Object.values(le).map(e=>e.sprite)])];var oe=class extends Error{line;col;constructor(r,n,t){super(`line ${r}, column ${n}: ${t}`),this.line=r,this.col=n}},vo=new Map(Object.entries(_).map(([e,r])=>[r.char,e])),So=new Map(Object.entries(ar).map(([e,r])=>[r.char,e])),Ao=/^[a-z0-9-]+$/,zo=/^([a-z]+): (.*)$/,Lo=new Map(Object.entries(le).map(([e,r])=>[r.char,e])),Oo=["block","ball","glider","fireball"],Ro=["title","intro","hearts","relics","pages","facing","machines"];function Fo(e,r){let n=e&&e.value!==""?e.value.split(" "):[],t=e??{line:1,col:1},s=new Set;for(let l of n){if(!Ao.test(l))throw new oe(t.line,t.col,`page id '${l}' must be lower-case letters, digits and hyphens`);if(s.has(l))throw new oe(t.line,t.col,`page '${l}' named twice`);s.add(l)}if(n.length>31)throw new oe(t.line,t.col,"a level holds at most 31 pages");if(n.length!==r)throw new oe(t.line,t.col,`pages: ${n.length} named but the grid has ${r}`);return n}function In(e,r,n,t,s){let l=r&&r.value!==""?r.value.split(" "):[],o=r??{line:1,col:1};for(let u of l)if(!t(u))throw new oe(o.line,o.col,`${e}: '${u}' is not ${s}`);if(l.length!==n)throw new oe(o.line,o.col,`${e}: ${l.length} named but the grid has ${n}`);return l}function Co(e){let r={},n=e.indexOf("trap"),t=e.indexOf("clone"),s=-1,l=-1;for(let o=e.length-1;o>=0;o--){let u=e[o];if(u==="button-brown"){let i=s>=0?s:n;i>=0&&(r[o]=i)}else if(u==="button-red"){let i=l>=0?l:t;i>=0&&(r[o]=i)}else u==="trap"?s=o:u==="clone"&&(l=o)}return r}function W(e){let r=e.replace(/\r\n/g,`
`).split(`
`),n={},t=0;for(;t<r.length;t++){let S=zo.exec(r[t]);if(!S)break;if(!Ro.includes(S[1]))throw new oe(t+1,1,`unknown header '${S[1]}'`);n[S[1]]={value:S[2],line:t+1,col:S[1].length+3}}for(;t<r.length&&r[t]==="";)t++;let s=t,l=[];for(;t<r.length&&r[t]!=="";t++)l.push(r[t]);if(l.length===0)throw new oe(s+1,1,"no grid");for(;t<r.length;t++)if(r[t].trim()!=="")throw new oe(t+1,1,"text after the grid");let o=l[0].length,u=[],i=[],a=null,c=null,h=0,d=[],f=[],m=[];if(l.forEach((S,D)=>{let I=s+D+1;if(S.length!==o)throw new oe(I,1,`row is ${S.length} wide, expected ${o}`);[...S].forEach((B,z)=>{let R=z+1;if(B==="P"||B==="M"){if(B==="P"&&a)throw new oe(I,R,"second player");if(B==="M"&&c)throw new oe(I,R,"second Minotaur");B==="P"?a={r:D,c:z}:c={r:D,c:z},u.push("floor"),i.push(null);return}let P=Lo.get(B);if(P){f.push({kind:P,at:{r:D,c:z}}),u.push("floor"),i.push(null);return}let $=vo.get(B),A=So.get(B);if(!$&&!A)throw new oe(I,R,`unknown tile '${B}'`);u.push($??"floor"),i.push(A??null),A==="relic"&&h++,$==="clone"&&m.push({r:D,c:z}),A==="page"&&d.push(D*o+z)})}),!a)throw new oe(s+1,1,"no player");let p=(S,D,I,B)=>{let z=n[S];if(!z)return D;let R=Number(z.value);if(!Number.isInteger(R)||R<I)throw new oe(z.line,z.col,`${S} must be ${I} to ${B}`);if(R>B){let P=S==="relics"?`relics: ${z.value} but the grid has ${B}`:`${S} must be ${I} to ${B}`;throw new oe(z.line,z.col,P)}return R},g=p("hearts",3,1,99),y=p("relics",h,0,h),b=Fo(n.pages,d.length),w=In("facing",n.facing,f.length,S=>H.includes(S),"a direction"),E=f.map((S,D)=>({...S,dir:w[D],home:D})),k=In("machines",n.machines,m.length,S=>{let[D,I]=S.split("-");return Oo.includes(D)&&H.includes(I)&&S.split("-").length===2},"a template and a direction like block-up"),T=E.length,L=m.map((S,D)=>{let[I,B]=k[D].split("-"),z={at:S,template:I,dir:B};return I==="block"?z:{...z,home:T++}});return{title:n.title?.value??"",intro:n.intro?.value??"",hearts:g,relics:y,pageIds:b,pageCells:d,rows:l.length,cols:o,terrain:u,objects:i,player:a,minotaur:c,hazards:E,machines:L,links:Co(u)}}function Te(e){if(/[\r\n]/.test(e.title)||/[\r\n]/.test(e.intro))throw new Error("title and intro must be one line");let r=e.objects.filter(l=>l==="relic").length,n=[`title: ${e.title}`,`intro: ${e.intro}`];e.hearts!==3&&n.push(`hearts: ${e.hearts}`),e.relics!==r&&n.push(`relics: ${e.relics}`),e.pageIds.length>0&&n.push(`pages: ${e.pageIds.join(" ")}`),e.hazards.length>0&&n.push(`facing: ${e.hazards.map(l=>l.dir).join(" ")}`),e.machines.length>0&&n.push(`machines: ${e.machines.map(l=>`${l.template}-${l.dir}`).join(" ")}`);let t=new Map(e.hazards.map(l=>[l.at.r*e.cols+l.at.c,l.kind])),s=[];for(let l=0;l<e.rows;l++){let o="";for(let u=0;u<e.cols;u++){let i=l*e.cols+u;e.player.r===l&&e.player.c===u?o+="P":e.minotaur&&e.minotaur.r===l&&e.minotaur.c===u?o+="M":t.has(i)?o+=le[t.get(i)].char:o+=e.objects[i]?ar[e.objects[i]].char:_[e.terrain[i]].char}s.push(o)}return`${n.join(`
`)}

${s.join(`
`)}
`}function Bn(e){let r=0;for(let n of e.objects)n==="cake"&&r++;return e.hearts+r}function ee(e){return{level:e,terrain:e.terrain,objects:e.objects,player:e.player,hearts:e.hearts,keys:{red:0,blue:0,yellow:0,green:0},gear:[],tools:{mirror:0,cake:0,cow:0},pages:0,throwBack:e.player,minotaur:e.minotaur,stone:0,cow:null,hazards:[...e.hazards],relicsLeft:e.relics,moves:0,outcome:"playing"}}var ie=(e,r)=>r.r>=0&&r.c>=0&&r.r<e.rows&&r.c<e.cols,C=(e,r)=>r.r*e.level.cols+r.c;var Z=(e,r)=>!!r&&e.r===r.r&&e.c===r.c,ze=66,Do=Array.from({length:ze*ze},(e,r)=>({r:Math.floor(r/ze)-1,c:r%ze-1})),Io=(e,r)=>e>=-1&&r>=-1&&e<ze-1&&r<ze-1?Do[(e+1)*ze+r+1]:{r:e,c:r},te=(e,r)=>Io(e.r+U[r][0],e.c+U[r][1]),Wr=e=>e.relicsLeft===0;var $n=e=>{let r=dr(e);return r.terrain=[...e.terrain],r.objects=[...e.objects],r.ownTerrain=r.ownObjects=!0,Le(r),r},dr=e=>({level:e.level,terrain:e.terrain,objects:e.objects,ownTerrain:!1,ownObjects:!1,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,ownHeld:!1,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:e.hazards.length>0?[...e.hazards]:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome});function Le(e){e.ownHeld||(e.keys={...e.keys},e.tools={...e.tools},e.gear=[...e.gear],e.ownHeld=!0)}function me(e,r,n){e.ownTerrain||(e.terrain=e.terrain.slice(),e.ownTerrain=!0),e.terrain[r]=n}function Oe(e,r,n){e.ownObjects||(e.objects=e.objects.slice(),e.ownObjects=!0),e.objects[r]=n}var re=(e,r)=>ie(e.level,r)?e.terrain[C(e,r)]:"wall",be=(e,r)=>ie(e.level,r)?e.objects[C(e,r)]:null;function Ee(e,r){let n=e.hazards;for(let t=0;t<n.length;t++){let s=n[t].at;if(s.r===r.r&&s.c===r.c)return!0}return!1}function cr(e,r){e.terrain=e.terrain.map(n=>n==="toggle-open"?"toggle-closed":n==="toggle-closed"?"toggle-open":n),e.ownTerrain=!0,r.push({kind:"flipped"})}var Gn=new WeakMap;function _n(e){let r=Gn.get(e);return r||(r=e.terrain.flatMap((n,t)=>n==="teleport"?[t]:[]),Gn.set(e,r)),r}var Hn=e=>_n(e).length>1;function Nr(e,r,n,t){let{cols:s}=e.level,l=_n(e.level),o=r.r*s+r.c,u=l.findIndex(i=>i>o);for(let i=0;i<l.length;i++){let a=l[((u<0?0:u)+i)%l.length];if(a===o)continue;let c={r:Math.floor(a/s),c:a%s},h=te(c,n);if(re(e,h)!=="teleport"&&t(h))return{via:c,to:h}}return null}var jn=new WeakMap;function Bo(e){let r=jn.get(e);if(!r){let n=new Map;for(let[t,s]of Object.entries(e.links)){if(e.terrain[s]!=="trap")continue;let l=n.get(s);l?l.push(Number(t)):n.set(s,[Number(t)])}r=n,jn.set(e,r)}return r}function $o(e,r){let n=Bo(e.level).get(r);if(!n)return!1;let{cols:t}=e.level;return n.some(s=>{let l={r:Math.floor(s/t),c:s%t};return Z(l,e.player)||be(e,l)==="block"||Ee(e,l)})}var se=(e,r)=>re(e,r)==="trap"&&!$o(e,r.r*e.level.cols+r.c);function Wn(e,r,n){if(!ie(e.level,n))return!1;let t=re(e,n);return _[t].hazard||le[r].crosses===t}var hr=(e,r,n)=>Wn(e,r,n)&&!be(e,n)&&!Z(n,e.minotaur)&&!Z(n,e.cow)&&!Ee(e,n),fr=(e,r,n)=>Z(n,e.player)?Wn(e,r,n):hr(e,r,n);function Kr(e,r,n,t,s=!1){let l=e.hazards[r],o=re(e,l.at);return o==="bomb"?(me(e,C(e,l.at),"floor"),e.hazards.splice(r,1),n.push({kind:"exploded",who:"hazard",at:l.at}),"gone"):(o==="button"?cr(e,n):o==="button-red"&&pr(e,C(e,l.at),n,t,s),se(e,l.at)&&n.push({kind:"held",who:"hazard",at:l.at}),"on")}function pr(e,r,n,t,s=!1){let l=e.level.links[r];if(l===void 0)return;let o=e.level.machines.find(c=>C(e,c.at)===l),u=te(o.at,o.dir);if(t&&Z(u,t))return;if(o.template==="block"){if(!mr(e,u))return;Oe(e,C(e,u),"block"),n.push({kind:"cloned",what:"block",at:u}),Ur(e,u,o.dir,t,n,s);return}if(!hr(e,o.template,u)||Z(u,e.player))return;let i={kind:o.template,at:u,dir:o.dir,home:o.home};e.hazards.length===0&&(e.hazards=[]);let a=e.hazards.length;if(!s){let c=C(e,u);for(;a>0&&C(e,e.hazards[a-1].at)>c;)a--}e.hazards.splice(a,0,i),n.push({kind:"cloned",what:o.template,at:u}),Kr(e,a,n,t,s)}function Go(e,r){let n=e.hazards[r];if(n)return n.at;let t=e.machines.find(s=>s.home===r);return te(t.at,t.dir)}function Yr(e,r,n){re(e,r)==="popup"&&(me(e,C(e,r),"wall"),n.push({kind:"rose",at:r}))}var jo=(e,r,n)=>hr(e,r,n)&&re(e,n)!=="bomb"&&!Z(n,e.player);function _o(e,r,n){let t=Go(e.level,n),s=new Set([C(e,t)]),l=[t];for(;l.length>0;){let o=l.filter(i=>jo(e,r,i)).sort((i,a)=>C(e,i)-C(e,a));if(o.length>0)return o[0];let u=[];for(let i of l)for(let a of H){let c=te(i,a);!ie(e.level,c)||s.has(C(e,c))||(s.add(C(e,c)),u.push(c))}l=u}return null}function Nn(e,r,n){let t=e.hazards.findIndex(o=>Z(r,o.at));if(t<0)return;let s=e.hazards[t];e.hazards.splice(t,1);let l=_o(e,s.kind,s.home);l&&(e.hazards.push({...s,at:l}),e.hazards.sort((o,u)=>C(e,o.at)-C(e,u.at))),n.push({kind:"sent-home",from:r,to:l})}function Re(e,r,n,t){if(e.hearts--,r.push(t?{kind:"caught",at:e.player,hearts:e.hearts,by:n,hazard:t}:{kind:"caught",at:e.player,hearts:e.hearts,by:n}),e.hearts<=0){e.outcome="lost",r.push({kind:"lost"});return}Yr(e,e.player,r),e.player=e.throwBack;let s=null;Z(e.player,e.minotaur)&&(s=e.level.minotaur,e.minotaur=s,Z(s,e.cow)&&(e.cow=null)),Nn(e,e.player,r),s&&Nn(e,s,r)}function br(e,r){if(e.outcome!=="playing")return!0;for(let n=0;n<r.length;n++)if(r[n].kind==="caught")return!0;return!1}function qr(e,r){return ie(e.level,r)&&_[re(e,r)].minotaur&&be(e,r)!=="block"&&!Ee(e,r)}function Kn(e,r,n){return e.minotaur=r,se(e,r)&&n.push({kind:"held",who:"minotaur",at:r}),Z(r,e.cow)&&(e.cow=null),Z(r,e.player)?(Re(e,n,"minotaur"),!0):!1}function Ho(e,r){let n=e.minotaur;if(!n)return!0;if(se(e,n))return!1;let t=e.cow??e.player,s=null,l=null;if(t.c!==n.c){let i=t.c>n.c?"right":"left",a=te(n,i);qr(e,a)&&(s=i,l=a)}if(!l&&t.r!==n.r){let i=t.r>n.r?"down":"up",a=te(n,i);qr(e,a)&&(s=i,l=a)}if(!s||!l)return!1;if(r.push({kind:"moved",who:"minotaur",from:n,to:l}),Kn(e,l,r))return!0;let o=s,u=null;for(;;){let i=_[re(e,e.minotaur)];if(i.carries)o=i.carries;else if(!i.slides)return!1;u??=new Set([C(e,l)]);let a=te(e.minotaur,o);if(!qr(e,a)||u.has(C(e,a)))return!1;if(r.push({kind:"slid",who:"minotaur",from:e.minotaur,to:a}),u.add(C(e,a)),Kn(e,a,r))return!0}}function Un(e,r){if(e.minotaur){if(e.stone>0){e.stone--;return}for(let n=0;n<2&&e.outcome==="playing";n++)if(Ho(e,r))return}}var Wo={ahead:{up:"up",down:"down",left:"left",right:"right"},left:{up:"left",left:"down",down:"right",right:"up"},right:{up:"right",right:"down",down:"left",left:"up"},back:{up:"down",down:"up",left:"right",right:"left"}};function No(e,r,n){return Z(e.hazards[r].at,e.player)?(Z(e.player,e.cow)&&(e.cow=null),Re(e,n,"hazard",e.hazards[r].kind),"caught"):Kr(e,r,n,void 0,!0)}function Ko(e,r,n){let t=e.hazards[r];if(se(e,t.at))return"on";let s=t.dir;if(!fr(e,t.kind,te(t.at,s))){s=void 0;for(let u of le[t.kind].turns){let i=Wo[u][t.dir];if(fr(e,t.kind,te(t.at,i))){s=i;break}}}if(!s)return"on";let l=te(t.at,s);n.push({kind:"moved",who:"hazard",hazard:t.kind,from:t.at,to:l});let o=null;for(;;){t=e.hazards[r]={kind:t.kind,at:l,dir:s,home:t.home};let u=No(e,r,n);if(u!=="on")return u;let i=_[re(e,l)];if(i.carries)s=i.carries,t.dir!==s&&(t=e.hazards[r]={kind:t.kind,at:t.at,dir:s,home:t.home});else if(!i.slides)return"on";o??=new Set([C(e,l)]);let a=te(l,s);if(o.has(C(e,a))||!fr(e,t.kind,a))return"on";n.push({kind:"slid",who:"hazard",hazard:t.kind,from:l,to:a}),o.add(C(e,a)),l=a}}function Yn(e,r){if(e.hazards.length!==0){for(let n=0,t=e.hazards.length;n<t;){let s=Ko(e,n,r);if(s==="caught")break;s==="gone"?t--:n++}e.hazards.sort((n,t)=>C(e,n.at)-C(e,t.at))}}function mr(e,r){return ie(e.level,r)&&_[re(e,r)].block&&!be(e,r)&&!Z(r,e.player)&&!Z(r,e.minotaur)&&!Z(r,e.cow)&&!Z(r,e.throwBack)&&!Z(r,e.level.minotaur)&&!Ee(e,r)}function Zr(e,r,n,t){let s=te(r,n);if(re(e,s)!=="teleport")return mr(e,s)&&t(s)?{entry:s,to:s}:null;if(Z(s,e.player))return null;let l=Nr(e,s,n,o=>mr(e,o)&&t(o));return l&&{entry:s,via:l.via,to:l.to}}function qn(e,r,n,t,s){Oe(e,C(e,r),null),Oe(e,C(e,n.to),"block"),s.push(t==="pushed"?{kind:"pushed",from:r,to:n.entry}:{kind:"slid",who:"block",from:r,to:n.entry}),n.via&&s.push({kind:"teleported",who:"block",from:n.entry,via:n.via,to:n.to})}function Ur(e,r,n,t,s,l=!1){let o=r,u=n,i=new Set([C(e,o)]);for(t&&i.add(C(e,t));;){let a=re(e,o);if(a==="water"||a==="bomb"){Oe(e,C(e,o),null),me(e,C(e,o),a==="water"?"dirt":"floor"),s.push(a==="water"?{kind:"sank",at:o}:{kind:"exploded",who:"block",at:o});return}a==="button"?cr(e,s):a==="button-red"&&pr(e,C(e,o),s,t,l),se(e,o)&&s.push({kind:"held",who:"block",at:o});let c=_[a];if(c.carries)u=c.carries;else if(!c.slides)return;let h=Zr(e,o,u,d=>!i.has(C(e,d)));if(!h)return;qn(e,o,h,"slid",s),i.add(C(e,h.to)),o=h.to}}var Uo=new Set(["wall","toggle-closed","fake-wall","invisible-wall","clone"]);function Vn(e,r,n,t){if(!ie(e.level,r)||Z(r,e.minotaur))return!1;let s=re(e,r),l=_[s];return Uo.has(s)||s==="teleport"&&!Hn(e.level)||s==="gate"&&!Wr(e)||l.needs&&!e.gear.includes(l.needs)||l.door&&e.keys[l.door]<=0?!1:Ee(e,r)||be(e,r)!=="block"?!0:!t&&!se(e,r)&&!!Zr(e,r,n,()=>!0)}function Xr(e,r,n,t,s){if(!Vn(e,r,n,t))return!1;if(Ee(e,r))return Re(e,s,"hazard",e.hazards.find(o=>Z(o.at,r)).kind),!1;let l=_[re(e,r)];if(l.door&&(l.door!=="green"&&(Le(e),e.keys[l.door]--),me(e,C(e,r),"floor"),s.push({kind:"opened",color:l.door,at:r})),be(e,r)==="block"){let o=Zr(e,r,n,()=>!0);qn(e,r,o,"pushed",s),Ur(e,o.to,n,r,s)}return!0}function Jr(e,r,n,t,s){Yr(e,e.player,s),e.player=r;let l=re(e,r);if(l==="bomb")return me(e,C(e,r),"floor"),s.push({kind:"exploded",who:"player",at:r}),Re(e,s,"bomb"),!0;let o=be(e,r);if(o&&o!=="block"&&(Oe(e,C(e,r),null),s.push({kind:"took",what:o,at:r}),o==="relic"?e.relicsLeft=Math.max(0,e.relicsLeft-1):o==="page"?e.pages|=1<<e.level.pageCells.indexOf(C(e,r)):o.startsWith("key-")?(Le(e),e.keys[o.slice(4)]++):o==="mirror"||o==="cake"||o==="cow"?(Le(e),e.tools[o]++):e.gear.includes(o)||(Le(e),e.gear.push(o))),l==="thief"&&e.gear.length>0&&(s.push({kind:"robbed",at:r,gear:e.gear}),e.gear=[]),l==="safe"&&(e.throwBack=r),se(e,r)&&s.push({kind:"held",who:"player",at:r}),l==="button"?cr(e,s):l==="button-red"&&pr(e,C(e,r),s),l==="exit"&&Wr(e)&&(e.outcome="won",s.push({kind:"won"})),l==="teleport"){let u=Nr(e,r,n,i=>Vn(e,i,n,t));return u?Xr(e,u.to,n,t,s)?(s.push({kind:"teleported",who:"player",from:r,via:u.via,to:u.to}),Jr(e,u.to,n,t,s)):!0:!1}return!1}function Yo(e,r,n){let t=r,s=e.player,l=null;for(;e.outcome==="playing";){let o=_[re(e,e.player)];if(o.carries&&!e.gear.includes("suction"))t=o.carries;else if(!o.slides||e.gear.includes(o.slides))return;l??=new Set([C(e,s)]);let u=te(e.player,t);if(l.has(C(e,u))||!Xr(e,u,t,!0,n)||(n.push({kind:"slid",who:"player",from:e.player,to:u}),l.add(C(e,u)),Jr(e,u,t,!0,n)))return;l.add(C(e,e.player))}}function Vr(e,r){if(e.length!==r.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==r[n])return!1;return!0}function Zn(e,r,n){if(r.kind==="move"){let t=e.player;if(se(e,t))return!1;let s=te(t,r.dir),l=re(e,s);if(l==="invisible-wall")return me(e,C(e,s),"wall"),n.push({kind:"revealed",at:s,what:l}),!0;if(l==="fake-wall"&&(me(e,C(e,s),"floor"),n.push({kind:"revealed",at:s,what:l})),Xr(e,s,r.dir,!1,n))n.push({kind:"moved",who:"player",from:t,to:s}),Jr(e,s,r.dir,!1,n)||Yo(e,r.dir,n);else if(!br(e,n))return!1}else if(r.kind==="tool"){if(e.tools[r.tool]<=0)return!1;if(r.tool==="cake")e.hearts++;else if(r.tool==="cow"){if(e.cow)return!1;e.cow=e.player}else e.stone=3,n.push({kind:"stoned",turns:3});Le(e),e.tools[r.tool]--}return!0}function Xn(e,r){return{level:e.level,terrain:!e.ownTerrain||Vr(e.terrain,r.terrain)?r.terrain:e.terrain,objects:!e.ownObjects||Vr(e.objects,r.objects)?r.objects:e.objects,player:e.player,hearts:e.hearts,keys:e.keys,gear:e.gear,tools:e.tools,pages:e.pages,throwBack:e.throwBack,minotaur:e.minotaur,stone:e.stone,cow:e.cow,hazards:Vr(e.hazards,r.hazards)?r.hazards:e.hazards,relicsLeft:e.relicsLeft,moves:e.moves,outcome:e.outcome}}function Qr(e,r){if(e.outcome!=="playing")return{state:e,events:[]};let n=dr(e),t=[];return Zn(n,r,t)?{state:Xn(n,e),events:t}:{state:e,events:[]}}function Fe(e,r){if(r.state===e)return!0;let n=r.events[0];return n?.kind==="revealed"&&n.what==="invisible-wall"}function V(e,r){if(e.outcome!=="playing")return{state:e,events:[]};let n=dr(e),t=[];if(!Zn(n,r,t))return{state:e,events:[]};let s=r.kind==="tool"&&r.tool==="mirror";return br(n,t)||Yn(n,t),!s&&!br(n,t)&&Un(n,t),n.moves++,{state:Xn(n,e),events:t}}var qo=["mirror","cake","cow"],Pe=e=>e<=0?0:32-Math.clz32(e),Jn=new WeakMap;function ge(e){let r=Jn.get(e);return r||Jn.set(e,r=Jo(e)),r}function Vo(e){let r=new Set,n=[],t=i=>{let a=e.terrain[i];return _[a].block||_[a].door!==void 0||a==="fake-wall"},s=e.minotaur?e.minotaur.r*e.cols+e.minotaur.c:-1,l=(i,a)=>i>=0&&a>=0&&i<e.rows&&a<e.cols,o=i=>{r.has(i)||i===s||!t(i)||(r.add(i),n.push(i))};e.objects.forEach((i,a)=>{i==="block"&&(r.add(a),n.push(a))});for(let i of e.machines){let a=i.at.r+U[i.dir][0],c=i.at.c+U[i.dir][1];i.template==="block"&&l(a,c)&&o(a*e.cols+c)}let u=[];for(e.terrain.forEach((i,a)=>{i==="teleport"&&u.push(a)});n.length;){let i=n.pop(),a=Math.floor(i/e.cols),c=i%e.cols,h=_[e.terrain[i]],d=h.slides!==void 0||h.carries!==void 0;for(let f of H){let[m,p]=U[f],g=a+m,y=c+p;if(!l(g,y))continue;let b=a-m,w=c-p;if(!(l(b,w)&&e.terrain[b*e.cols+w]!=="wall")&&!d)continue;let k=g*e.cols+y;if(e.terrain[k]!=="teleport"){o(k);continue}for(let T of u){let L=Math.floor(T/e.cols)+m,S=T%e.cols+p;l(L,S)&&o(L*e.cols+S)}}}return r}var Zo={water:"dirt",popup:"wall","fake-wall":"floor","invisible-wall":"wall",bomb:"floor"},en=e=>Zo[e]??(_[e].door!==void 0?"floor":void 0);function Xo(e,r){let n=new Set(r.map(s=>le[s].crosses)),t=[];return e.terrain.forEach((s,l)=>{let o=en(s);(_[s].hazard||n.has(s)||s==="toggle-closed"||o&&_[o].hazard)&&t.push(l)}),t}function Jo(e){let r=A=>e.objects.filter(v=>v===A).length,n=Vo(e),t=[],s=[],l=[],o=[],u=[];e.terrain.forEach((A,v)=>{en(A)?t.push(v):(A==="toggle-open"||A==="toggle-closed")&&s.push(v);let G=e.objects[v];n.has(v)?(G&&G!=="block"?u:o).push(v):G&&l.push(v)});let i=e.rows*e.cols,a=Ge.map(A=>Pe(r(`key-${A}`))),c=qo.map(A=>Pe(r(A))),h=Dn.filter(A=>r(A)>0),d=Pe(i),f=r("cow")>0,m=e.minotaur!==null,p=r("mirror")>0?2:0,g=d*(2+(m?1:0)+(f?1:0))+p,y=Pe(Bn(e)),b=g+y+Pe(e.relics),w=[],E=b+e.pageIds.length;for(let A of a)w.push(E),E+=A;let k=[];for(let A of c)k.push(E),E+=A;let T=[...e.hazards.map(A=>A.kind)];for(let A of e.machines)A.home!==void 0&&(T[A.home]=A.template);let L=T.length>e.hazards.length,S=L?0:e.hazards.length,D=L?Xo(e,T):[],I=L?Pe(4*T.length):0,B=d*(2+(m?1:0)+(f?1:0))+p+y+Pe(e.relics)+e.pageIds.length+a.reduce((A,v)=>A+v,0)+c.reduce((A,v)=>A+v,0)+h.length+t.length+(s.length?1:0)+l.length+o.length+2*u.length+S*(d+2)+D.length*I,z=E+h.length,R=z+t.length+(s.length?1:0),P=R+l.length+o.length+2*u.length,$=[];for(let A=0;A<i;A++)$.push({r:Math.floor(A/e.cols),c:A%e.cols});return{terrainAt:z,objectsAt:R,hazardsAt:P,cells:$,terrains:new Map,objectLists:new Map,words:Math.max(1,Math.ceil(B/32)),cellBits:d,none:i,minotaur:m,cow:f,stoneBits:p,heartBits:y,relicBits:Pe(e.relics),pageBits:e.pageIds.length,keyBits:a,toolBits:c,gear:h,heartAt:g,pageAt:b,keyAt:w,toolAt:k,gearAt:E,changing:Int32Array.from(t),toggles:Int32Array.from(s),fixed:Int32Array.from(l),blockOnly:Int32Array.from(o),blockOrObject:Int32Array.from(u),hazardSlots:S,hazardCells:Int32Array.from(D),hazardBits:I,homeKinds:T}}function X(e,r,n,t,s){if(t===0)return n;let l=r+(n>>>5),o=n&31;return e[l]|=s<<o,o+t>32&&(e[l+1]|=s>>>32-o),n+t}function q(e,r,n,t){if(t===0)return 0;let s=r+(n>>>5),l=n&31,o=e[s]>>>l;return l+t>32&&(o|=e[s+1]<<32-l),t===32?o>>>0:o&(1<<t)-1}var ve=(e,r,n)=>r?r.r*e.level.cols+r.c:n,Qn={up:0,down:1,left:2,right:3};function et(e,r,n,t,s,l){for(let o=s,u=s+l;o<u;o+=30){let i=Math.min(30,u-o);X(n,t,o,i,q(e,r,o,i))}}function je(e,r,n,t,s,l,o=0){let u=r;for(let g=0;g<u.words;g++)n[t+g]=0;let i=0;i=X(n,t,i,u.cellBits,ve(e,e.player,u.none)),i=X(n,t,i,u.cellBits,ve(e,e.throwBack,u.none)),u.minotaur&&(i=X(n,t,i,u.cellBits,ve(e,e.minotaur,u.none))),u.cow&&(i=X(n,t,i,u.cellBits,ve(e,e.cow,u.none))),i=X(n,t,i,u.stoneBits,e.stone),i=X(n,t,i,u.heartBits,e.hearts),i=X(n,t,i,u.relicBits,e.relicsLeft),i=X(n,t,i,u.pageBits,e.pages);let a=e.keys,c=e.tools;i=X(n,t,i,u.keyBits[0],a.red),i=X(n,t,i,u.keyBits[1],a.blue),i=X(n,t,i,u.keyBits[2],a.yellow),i=X(n,t,i,u.keyBits[3],a.green),i=X(n,t,i,u.toolBits[0],c.mirror),i=X(n,t,i,u.toolBits[1],c.cake),i=X(n,t,i,u.toolBits[2],c.cow);for(let g=0;g<u.gear.length;g++)i=X(n,t,i,1,e.gear.includes(u.gear[g])?1:0);let h=e.terrain,d=e.objects,f=e.level.terrain;if(s&&l&&h===s.terrain)et(l,o,n,t,u.terrainAt,u.objectsAt-u.terrainAt);else{for(let g=0;g<u.changing.length;g++){let y=u.changing[g];X(n,t,u.terrainAt+g,1,h[y]===f[y]?0:1)}u.toggles.length&&X(n,t,u.objectsAt-1,1,h[u.toggles[0]]===f[u.toggles[0]]?0:1)}if(s&&l&&d===s.objects)et(l,o,n,t,u.objectsAt,u.hazardsAt-u.objectsAt);else{i=u.objectsAt;for(let g=0;g<u.fixed.length;g++)i=X(n,t,i,1,d[u.fixed[g]]?1:0);for(let g=0;g<u.blockOnly.length;g++)i=X(n,t,i,1,d[u.blockOnly[g]]==="block"?1:0);for(let g=0;g<u.blockOrObject.length;g++){let y=d[u.blockOrObject[g]];i=X(n,t,i,2,y==="block"?2:y?1:0)}}i=u.hazardsAt;let m=e.hazards;if(u.hazardSlots>1){for(let g=1;g<m.length;g++)if(ve(e,m[g].at,u.none)<ve(e,m[g-1].at,u.none))throw new Error("the hazards must be sorted by cell")}for(let g=0;g<u.hazardSlots;g++){let y;for(let b=0;b<m.length;b++)if(m[b].home===g){y=m[b];break}i=X(n,t,i,u.cellBits,y?ve(e,y.at,u.none):u.none),i=X(n,t,i,2,y?Qn[y.dir]:0)}let p=0;for(let g=0;g<u.hazardCells.length;g++){let y=u.hazardCells[g],b=m[p],w=b!==void 0&&ve(e,b.at,u.none)===y;i=X(n,t,i,u.hazardBits,w?1+Qn[b.dir]+4*b.home:0),w&&p++}if(u.hazardCells.length&&p!==m.length)throw new Error(`packed ${p} of ${m.length} hazards: they must be sorted by cell`)}var rt=4096;function nt(e,r,n,t){if(t<=30)return q(e,r,n,t);let s="";for(let l=n,o=n+t;l<o;l+=30)s+=q(e,r,l,Math.min(30,o-l))+",";return s}function Qo(e,r,n,t){let s=n.objectsAt-n.terrainAt;if(s===0)return t.terrain;let l=nt(e,r,n.terrainAt,s),o=n.terrains.get(l);if(o)return o;let u=[...t.terrain];for(let i=0;i<n.changing.length;i++){if(!q(e,r,n.terrainAt+i,1))continue;let a=n.changing[i];u[a]=en(t.terrain[a])}if(n.toggles.length&&q(e,r,n.objectsAt-1,1))for(let i of n.toggles)u[i]=t.terrain[i]==="toggle-open"?"toggle-closed":"toggle-open";return n.terrains.size>=rt&&n.terrains.clear(),n.terrains.set(l,u),u}function el(e,r,n,t){let s=n.hazardsAt-n.objectsAt;if(s===0)return t.objects;let l=nt(e,r,n.objectsAt,s),o=n.objectLists.get(l);if(o)return o;let u=[...t.objects],i=n.objectsAt;for(let a of n.fixed)q(e,r,i++,1)||(u[a]=null);for(let a of n.blockOnly)u[a]=q(e,r,i++,1)?"block":null;for(let a of n.blockOrObject){let c=q(e,r,i,2);i+=2,c===0?u[a]=null:c===2&&(u[a]="block")}return n.objectLists.size>=rt&&n.objectLists.clear(),n.objectLists.set(l,u),u}function gr(e,r,n,t,s=0){let l=n,o=l.cells,u=l.none,i=l.cellBits,a=0,c=o[q(e,r,a,i)];a+=i;let h=o[q(e,r,a,i)];a+=i;let d=null,f=null;if(l.minotaur){let v=q(e,r,a,i);a+=i,d=v===u?null:o[v]}if(l.cow){let v=q(e,r,a,i);a+=i,f=v===u?null:o[v]}let m=q(e,r,a,l.stoneBits);a+=l.stoneBits;let p=q(e,r,a,l.heartBits);a+=l.heartBits;let g=q(e,r,a,l.relicBits);a+=l.relicBits;let y=q(e,r,a,l.pageBits);a+=l.pageBits;let b=l.keyBits,w=l.toolBits,E=q(e,r,a,b[0]);a+=b[0];let k=q(e,r,a,b[1]);a+=b[1];let T=q(e,r,a,b[2]);a+=b[2];let L=q(e,r,a,b[3]);a+=b[3];let S={red:E,blue:k,yellow:T,green:L},D=q(e,r,a,w[0]);a+=w[0];let I=q(e,r,a,w[1]);a+=w[1];let B=q(e,r,a,w[2]);a+=w[2];let z={mirror:D,cake:I,cow:B},R=[];for(let v=0;v<l.gear.length;v++)q(e,r,a++,1)&&R.push(l.gear[v]);let P=Qo(e,r,l,t),$=el(e,r,l,t);a=l.hazardsAt;let A=[];for(let v=0;v<l.hazardSlots;v++){let G=q(e,r,a,i);a+=i;let N=H[q(e,r,a,2)];a+=2,G!==u&&A.push({kind:l.homeKinds[v],at:o[G],dir:N,home:v})}A.length>1&&A.sort((v,G)=>v.at.r*t.cols+v.at.c-(G.at.r*t.cols+G.at.c));for(let v=0;v<l.hazardCells.length;v++){let G=q(e,r,a,l.hazardBits);if(a+=l.hazardBits,!G)continue;let N=G-1>>>2;A.push({kind:l.homeKinds[N],at:o[l.hazardCells[v]],dir:H[G-1&3],home:N})}return{level:t,terrain:P,objects:$,player:c,hearts:p,keys:S,gear:R,tools:z,pages:y,throwBack:h,minotaur:d,stone:m,cow:f,hazards:A,relicsLeft:g,moves:s,outcome:"playing"}}var lt=new Set(["wall","invisible-wall","clone"]);function rl(e,r,n,t){let s=(a,c)=>a>=0&&c>=0&&a<e.rows&&c<e.cols&&!lt.has(e.terrain[a*e.cols+c]),l=new Set,o=new Set,u=[],i=(a,c,h)=>{if(!s(a,c))return;let d=(a*e.cols+c)*4+H.indexOf(h);o.has(d)||(o.add(d),l.add(a*e.cols+c),u.push([a,c,h]))};for(i(Math.floor(r/e.cols)+U[n][0],r%e.cols+U[n][1],n);u.length;){let[a,c,h]=u.pop(),d=e.terrain[a*e.cols+c];if(d==="teleport"){for(let p of t){if(p===a*e.cols+c)continue;let g=Math.floor(p/e.cols)+U[h][0],y=p%e.cols+U[h][1];s(g,y)&&e.terrain[g*e.cols+y]!=="teleport"&&i(g,y,h)}continue}let f=_[d],m=f.carries??(f.slides?h:null);m&&i(a+U[m][0],c+U[m][1],m)}return[...l]}function nl(e){let r=e.rows*e.cols,n=e.terrain.map(o=>!lt.has(o)),t=e.terrain.flatMap((o,u)=>o==="teleport"?[u]:[]),s=Array.from({length:r},()=>[]);for(let o=0;o<r;o++)if(n[o])for(let u of H)for(let i of rl(e,o,u,t.length>1?t:[]))s[i].push(o);let l=new Uint8Array(r);return e.terrain.forEach((o,u)=>{o==="safe"&&(l[u]=1)}),l[e.player.r*e.cols+e.player.c]=1,{n:r,open:n,into:s,thrown:l}}function tt(e,r){let n=new Float64Array(e.n).fill(1/0),t=new Int32Array(e.n),s=0;for(let o of r)n[o]===1/0&&(n[o]=0,t[s++]=o);let l=!1;for(let o=0;o<s;o++){let u=t[o],i=n[u]+1;for(let a of e.into[u])n[a]===1/0&&(n[a]=i,t[s++]=a);if(!l&&e.thrown[u]){l=!0;for(let a=0;a<e.n;a++)e.open[a]&&n[a]===1/0&&(n[a]=i,t[s++]=a)}}return n}function tl(e){let r=nl(e),n=e.terrain.flatMap((o,u)=>o==="exit"?[u]:[]),t=tt(r,n),s=e.objects.flatMap((o,u)=>o==="relic"?[u]:[]),l=s.map(o=>tt(r,[o]));return o=>{if(o.outcome==="won")return 0;if(o.outcome==="lost")return 1/0;let u=o.player.r*e.cols+o.player.c,i=t[u];if(o.relicsLeft===0)return i;let a=0,c=1/0,h=0;for(let d=0;d<s.length;d++){if(o.objects[s[d]]!=="relic")continue;let f=l[d][u];a++,f<c&&(c=f),f>h&&(h=f)}return a<o.relicsLeft?1/0:Math.max(i,a===o.relicsLeft?h:c)}}var ot=new WeakMap;function wr(e){let r=ot.get(e);return r||ot.set(e,r=tl(e)),r}var _e=class extends Error{},st=1024;function rn(e,r,n){let t=2538058380;for(let s=0;s<n;s++){let l=Math.imul(e[r+s],3432918353);l=Math.imul(l<<15|l>>>17,461845907),t^=l,t=Math.imul(t<<13|t>>>19,5)+3864292196}return t^=n,t=Math.imul(t^t>>>16,2246822507),t=Math.imul(t^t>>>13,3266489909),(t^t>>>16)>>>0}function yr(e){let r=e,n=st,t=new Uint32Array(n*r),s=new Uint32Array(n),l=new Int32Array(n),o=new Uint8Array(n),u=new Uint32Array(n),i=0,a=new Int32Array(st*2),c=a.length-1;function h(){n*=2;let f=new Uint32Array(n*r);f.set(t),t=f;let m=new Uint32Array(n);m.set(s),s=m;let p=new Int32Array(n);p.set(l),l=p;let g=new Uint8Array(n);g.set(o),o=g;let y=new Uint32Array(n);y.set(u),u=y,a=new Int32Array(n*2),c=a.length-1;for(let b=0;b<i;b++){let w=s[b]&c;for(;a[w]!==0;)w=w+1&c;a[w]=b+1}}function d(f,m,p){let g=f*r;for(let y=0;y<r;y++)if(t[g+y]!==m[p+y])return!1;return!0}return{get size(){return i},add(f,m,p,g,y){let b=rn(f,m,r),w=b&c;for(let k=a[w];k!==0;w=w+1&c,k=a[w]){let T=k-1;if(!(s[T]!==b||!d(T,f,m)))return y>=u[T]?-1:(l[T]=p,o[T]=g,u[T]=y,T)}if(i===n)for(h(),w=b&c;a[w]!==0;)w=w+1&c;let E=i++;return t.set(f.subarray(m,m+r),E*r),s[E]=b,l[E]=p,o[E]=g,u[E]=y,a[w]=E+1,E},words(f,m,p){m.set(t.subarray(f*r,f*r+r),p)},parent:f=>l[f],action:f=>o[f],g:f=>u[f]}}var Xe=["mirror","cake","cow"],Ce=H.length,xr=[...H.map(e=>({kind:"move",dir:e})),{kind:"wait"},...Xe.map(e=>({kind:"tool",tool:e}))],nn=[Ce,...H.map((e,r)=>r),...Xe.map((e,r)=>Ce+1+r)];function ut(e,r){let n=[];for(let t=r;e.parent(t)>=0;t=e.parent(t))n.push(xr[e.action(t)]);return n.reverse()}function tn(e,r){return Se(on(e,r),r.onProgress)}function*on(e,r){if(e.outcome==="won")return{solved:!0,line:[],explored:0};let n=r.store??yr(ge(e.level).words),t=l=>{if(l instanceof _e)return{solved:!1,explored:n.size,capped:!0,reason:l.message};throw l},s;try{s=ol(e,r,n)}catch(l){return t(l)}for(;;){let l;try{l=s()}catch(o){return t(o)}if("explored"in l)return l;yield l}}function Se(e,r){for(;;){let n=e.next();if(n.done)return n.value;r?.(n.value)}}function ol(e,r,n){let{cap:t,refuse:s}=r,l=r.prune??null,o=Math.max(1,r.progressEvery??65536),u=e.level,i=ge(u),a=wr(u),c=new Uint32Array(i.words),h=new Uint32Array(i.words),d=1024,f=new Int32Array(d),m=new Int32Array(d),p=new Int32Array(d),g=new Uint8Array(d),y=new Uint16Array(d),b=new Int32Array(d),w=0,E=z=>{if(z<d)return;for(;d<=z;)d*=2;let R=new Int32Array(d);R.set(f),f=R;let P=new Int32Array(d);P.set(m),m=P;let $=new Int32Array(d);$.set(p),p=$;let A=new Uint8Array(d);A.set(g),g=A;let v=new Uint16Array(d);v.set(y),y=v},k=(z,R)=>f[z]<f[R]||f[z]===f[R]&&(m[z]<m[R]||m[z]===m[R]&&(y[z]>y[R]||y[z]===y[R]&&z<R)),T=z=>{let R=b[z];for(;z>0;){let P=z-1>>1,$=b[P];if(!k(R,$))break;b[z]=$,p[$]=z,z=P}b[z]=R,p[R]=z},L=z=>{if(w===b.length){let R=new Int32Array(b.length*2);R.set(b),b=R}b[w]=z,T(w++)},S=()=>{let z=b[0];p[z]=-1;let R=b[--w];if(w>0){let P=0;for(;;){let $=2*P+1;if($>=w)break;let A=$+1,v=A<w&&k(b[A],b[$])?A:$;if(!k(b[v],R))break;b[P]=b[v],p[b[P]]=P,P=v}b[P]=R,p[R]=P}return z},D=a(e);if(je(e,i,c,0),l&&l({...e,moves:0},c,0))return()=>({solved:!1,explored:0,capped:!1});let I=n.add(c,0,-1,0,0);if(n.size>=t)return()=>({solved:!1,explored:n.size,capped:!0});E(I),m[I]=Number.isFinite(D)?D:-1,f[I]=m[I],p[I]=-1,y[I]=e.hearts,m[I]>=0&&L(I);let B=0;return()=>{let z=null;for(;w>0;){if(z)return z;let R=S();if(g[R])return{solved:!0,line:ut(n,R),explored:n.size};let P=f[R],$=P-m[R];++B%o===0&&(z={expanded:B,stored:n.size,bestF:P,startH:D}),n.words(R,h,0);let A=gr(h,0,i,u,$);for(let v of nn){if(v>Ce&&A.tools[Xe[v-Ce-1]]<=0)continue;let G=V(A,xr[v]),N=G.state;if(Fe(A,G)||N.outcome==="lost"||s&&s(G.events,A)||(je(N,i,c,0,A,h,0),l&&l(N,c,0)))continue;let ne=n.size,F=n.add(c,0,R,v,$+1);if(F<0)continue;let K=N.outcome==="won";if(n.size>ne){E(F);let J=K?0:a(N);m[F]=Number.isFinite(J)?J:-1,p[F]=-1,g[F]=K?1:0,y[F]=N.hearts}if(K&&$+1===P)return{solved:!0,line:ut(n,F),explored:n.size};if(n.size>=t)return{solved:!1,explored:n.size,capped:!0};m[F]<0||(f[F]=$+1+m[F],p[F]>=0?T(p[F]):L(F))}}return{solved:!1,explored:n.size,capped:!1}}}function ll(e,r){for(let n=0;n<e.terrain.length;n++){if(!r(e.terrain[n]))continue;let t=Math.floor(n/e.cols),s=n%e.cols;for(let l of H){let o=t-U[l][0],u=s-U[l][1];if(o<0||u<0||o>=e.rows||u>=e.cols)continue;let i=_[e.terrain[o*e.cols+u]];if(i.slides||i.carries===l)return!0}}return!1}function sl(e,r){let n=e.terrain.flatMap((t,s)=>t==="teleport"?[s]:[]);return n.length<2?!1:n.some(t=>H.some(s=>{let l=Math.floor(t/e.cols)+U[s][0],o=t%e.cols+U[s][1];return l>=0&&o>=0&&l<e.rows&&o<e.cols&&r(e.terrain[l*e.cols+o])}))}var it=(e,r)=>ll(e,r)||sl(e,r);function ul(e,r){let n=[];r.heartBits&&n.push({pos:r.heartAt,width:r.heartBits,set:!1}),r.pageBits&&n.push({pos:r.pageAt,width:r.pageBits,set:!0}),Ge.forEach((s,l)=>{r.keyBits[l]&&!it(e,o=>_[o].door===s)&&n.push({pos:r.keyAt[l],width:r.keyBits[l],set:!1})}),r.toolBits.forEach((s,l)=>{s&&n.push({pos:r.toolAt[l],width:s,set:!1})});let t=["flippers","fire-boots"];return r.gear.forEach((s,l)=>{t.includes(s)&&!it(e,o=>_[o].needs===s)&&n.push({pos:r.gearAt+l,width:1,set:!1})}),n}var ln=1024;function kr(e,r){let n=wr(e),t=ul(e,r);if(!t.length)return v=>n(v)===1/0;let s=r.words,l=new Uint32Array(s);for(let v of t)for(let G=v.pos;G<v.pos+v.width;G++)l[G>>>5]|=1<<(G&31);let o=[],u=0;for(let v of t)o.push(u),u+=v.width;let i=u+31>>>5,a=t.length,c=Int32Array.from(t,v=>v.pos),h=Int32Array.from(t,v=>v.width),d=Uint8Array.from(t,v=>v.set?1:0),f=Int32Array.from(o),m=Uint32Array.from(l,v=>~v>>>0),p=ln,g=new Uint32Array(p*s),y=new Int32Array(p),b=new Uint32Array(p),w=0,E=new Int32Array(ln*2),k=E.length-1,T=ln,L=new Uint32Array(T*i),S=new Uint32Array(T),D=new Int32Array(T),I=0,B=-1,z=new Uint32Array(s),R=new Uint32Array(i);function P(){p*=2;let v=new Uint32Array(p*s);v.set(g),g=v;let G=new Int32Array(p);G.set(y),y=G;let N=new Uint32Array(p);N.set(b),b=N,E=new Int32Array(p*2),k=E.length-1;for(let ne=0;ne<w;ne++){let F=b[ne]&k;for(;E[F]!==0;)F=F+1&k;E[F]=ne+1}}function $(v,G){let N=B;if(N>=0)B=D[N];else{if(I===T){T*=2;let ne=new Uint32Array(T*i);ne.set(L),L=ne;let F=new Uint32Array(T);F.set(S),S=F;let K=new Int32Array(T);K.set(D),D=K}N=I++}return L.set(R,N*i),S[N]=v,D[N]=G,N}function A(v,G,N,ne){for(let F=0;F<a;F++){let K=q(v,G,f[F],h[F]),J=q(N,ne,f[F],h[F]);if(d[F]?(K&J)!==J:K<J)return!1}return!0}return(v,G,N)=>{if(n(v)===1/0)return!0;let ne=v.moves;for(let x=0;x<s;x++)z[x]=G[N+x]&m[x];let F=rn(z,0,s);R.fill(0);for(let x=0;x<a;x++)X(R,0,f[x],h[x],q(G,N,c[x],h[x]));let K=F&k,J=-1;for(let x=E[K];x!==0;K=K+1&k,x=E[K]){let M=x-1;if(b[M]!==F)continue;let O=!0;for(let j=0;j<s&&O;j++)O=g[M*s+j]===z[j];if(O){J=M;break}}if(J<0){if(w===p)for(P(),K=F&k;E[K]!==0;)K=K+1&k;return J=w++,g.set(z,J*s),b[J]=F,E[K]=J+1,y[J]=$(ne,-1),!1}for(let x=y[J];x>=0;x=D[x])if(S[x]<=ne&&A(L,x*i,R,0))return!0;let Me=-1;for(let x=y[J];x>=0;){let M=D[x];ne<=S[x]&&A(R,0,L,x*i)?(Me<0?y[J]=M:D[Me]=M,D[x]=B,B=x):Me=x,x=M}return y[J]=$(ne,y[J]),!1}}var ce=2e6,he=e=>e.some(r=>r.kind==="caught");function Je(e,r=ce){return tn(e,{cap:r,refuse:null,prune:kr(e.level,ge(e.level))})}function at(e,r,n=ce){return tn(e,{cap:n,refuse:r,prune:kr(e.level,ge(e.level))})}function fe(e,r,n=ce,t={}){return on(e,{cap:n,refuse:r,prune:kr(e.level,ge(e.level)),store:t.store,progressEvery:t.every})}var dt={up:"u",down:"d",left:"l",right:"r"},sn={mirror:"z",cake:"x",cow:"c"};function De(e){return e.map(r=>r.kind==="move"?dt[r.dir]:r.kind==="wait"?"w":sn[r.tool]).join("")}function He(e){let r=[];for(let n of e){let t=H.find(l=>dt[l]===n),s=Object.keys(sn).find(l=>sn[l]===n);if(t)r.push({kind:"move",dir:t});else if(n==="w")r.push({kind:"wait"});else if(s)r.push({kind:"tool",tool:s});else return null}return r}var un=e=>e.solved?e.line.length:e.capped?"unknown":"none";function Mr(e,r=ce){return Se(il(e,r))}function*il(e,r=ce,n={}){let t=ee(e),s=b=>({store:n.store?.(ge(b).words),every:n.every}),l=yield*fe(t,null,r,s(e)),o=un(l),u=0;if(l.solved){let b=t;for(let w of l.line){let E=V(b,w);b=E.state,he(E.events,b)&&u++}}let i=un(yield*fe(t,he,r,s(e))),a=yield*al(e,r,s(e)),c=a===null?"unknown":a?"chase":"solo",h=an(e),d=l.solved?De(l.line):"";if(!e.minotaur)return{solved:l.solved,shortest:o,explored:l.explored,withoutMinotaur:null,minotaurDelta:0,greedyWins:!0,catchFree:i,catches:u,label:c,naiveWins:h,line:d};let f={...e,minotaur:null},m=yield*fe(ee(f),null,r,s(f)),p=un(m),g=m.solved?!1:m.capped?null:!1;if(m.solved){let b=t;for(let w of m.line)b=V(b,w).state;g=b.outcome==="won"}let y=typeof o=="number"&&typeof p=="number"?o-p:null;return{solved:l.solved,shortest:o,explored:l.explored,withoutMinotaur:p,minotaurDelta:y,greedyWins:g,catchFree:i,catches:u,label:c,naiveWins:h,line:d}}function ct(e,r,n,t){let s=new Uint8Array(e.rows*e.cols),l=[r];s[r]=1;for(let o=0;o<l.length;o++){let u=l[o],i=Math.floor(u/e.cols),a=u%e.cols;for(let c of H){let h=i+U[c][0],d=a+U[c][1];if(h<0||d<0||h>=e.rows||d>=e.cols)continue;let f=h*e.cols+d;!s[f]&&n(f)&&(s[f]=1,l.push(f))}if(t?.from(u))for(let c of t.to)!s[c]&&n(c)&&(s[c]=1,l.push(c))}return s}function ft(e){let r=new Set(e.objects.filter(u=>u!==null));e.machines.some(u=>u.template==="block")&&r.add("block");let n=u=>{let i=_[u];return i.door?r.has(`key-${i.door}`):u==="water"?r.has("block"):u==="toggle-open"||u==="toggle-closed"},t=ct(e,e.minotaur.r*e.cols+e.minotaur.c,u=>{let i=e.terrain[u];return _[i].minotaur||n(i)||i==="fake-wall"||i==="bomb"}),l=e.terrain.flatMap((u,i)=>u==="teleport"?[i]:[]).flatMap(u=>{let i=Math.floor(u/e.cols),a=u%e.cols;return H.flatMap(c=>{let h=i+U[c][0],d=a+U[c][1];return h<0||d<0||h>=e.rows||d>=e.cols?[]:[h*e.cols+d]})}),o=ct(e,e.player.r*e.cols+e.player.c,u=>{let i=e.terrain[u],a=_[i];return i==="wall"?!1:a.door?n(i):!a.needs||r.has(a.needs)||n(i)},{from:u=>e.terrain[u]==="teleport",to:l});return!t.some((u,i)=>u===1&&o[i]===1)}function*al(e,r=ce,n={}){if(!e.minotaur||ft(e))return!1;let t=ge(e),s=n.store??yr(t.words),l=Math.max(1,n.every??65536);try{let o=new Uint32Array(t.words),u=new Uint32Array(t.words);if(je(ee(e),t,o,0),s.add(o,0,-1,0,0),s.size>=r)return null;let i=0;for(let a=0;a<s.size;a++){++i%l===0&&(yield{expanded:i,stored:s.size,bestF:0,startH:0}),s.words(a,u,0);let c=gr(u,0,t,e,0);for(let h of nn){if(h>Ce&&c.tools[Xe[h-Ce-1]]<=0)continue;let d=V(c,xr[h]);if(d.events.some(m=>m.kind==="caught"&&m.by==="minotaur"))return!0;let f=d.state;if(!(Fe(c,d)||f.outcome!=="playing")&&(je(f,t,o,0,c,u,0),s.add(o,0,a,h,0),s.size>=r))return null}}return!1}catch(o){if(o instanceof _e)return null;throw o}}var dl=16;function cl(e,r){let n=e.rows*e.cols,t=new Int32Array(n).fill(-1),s=new Int8Array(n).fill(-1);t[r]=0;let l=[r];for(let o=0;o<l.length;o++){let u=l[o],i=Math.floor(u/e.cols),a=u%e.cols;H.forEach((c,h)=>{let d=i+U[c][0],f=a+U[c][1];if(d<0||f<0||d>=e.rows||f>=e.cols)return;let m=d*e.cols+f;t[m]>=0||e.terrain[m]==="wall"||(t[m]=t[u]+1,s[m]=h,l.push(m))})}return{dist:t,via:s}}function hl(e){let r=e.rows*e.cols,n=e.player.r*e.cols+e.player.c,t=[],s=[];for(let p=0;p<r;p++)e.objects[p]==="relic"&&t.push(p),e.terrain[p]==="exit"&&s.push(p);let l=e.relics,o=[n,...t].map(p=>cl(e,p)),u=p=>{let g=-1,y=1/0;for(let b of s){let w=o[p].dist[b];w>=0&&w<y&&(y=w,g=b)}return[g,y]},i=(p,g)=>{let y=o[p].dist[g===0?n:t[g-1]];return y<0?1/0:y},a=null;if(l===0)a=[];else if(t.length<=dl){let p=t.length,g=new Float64Array((1<<p)*p).fill(1/0),y=new Int8Array((1<<p)*p).fill(-1);for(let E=0;E<p;E++)g[(1<<E)*p+E]=i(0,E+1);let b=1/0,w=-1;for(let E=1;E<1<<p;E++){let k=fl(E);if(!(k>l))for(let T=0;T<p;T++){let L=g[E*p+T];if(!(!(E&1<<T)||L===1/0)){if(k===l){let S=L+u(T+1)[1];S<b&&(b=S,w=E*p+T);continue}for(let S=0;S<p;S++){if(E&1<<S)continue;let D=(E|1<<S)*p+S,I=L+i(T+1,S+1);I<g[D]&&(g[D]=I,y[D]=T)}}}}if(w>=0){a=[];for(let E=w;;){let k=Math.floor(E/p),T=E%p;if(a.push(T+1),y[E]<0)break;E=(k&~(1<<T))*p+y[E]}a.reverse()}}else{a=[];let p=new Set(t.map((y,b)=>b+1)),g=0;for(;a.length<l;){let y=-1,b=1/0;for(let w of p){let E=i(g,w);E<b&&(b=E,y=w)}if(y<0){a=null;break}a.push(y),p.delete(y),g=y}}if(!a)return null;let c=a.length?a[a.length-1]:0,[h]=u(c);if(h<0)return null;let d=[],f=[0,...a],m=[...a.map(p=>t[p-1]),h];return f.forEach((p,g)=>{let{via:y}=o[p],b=m[g],w=[];for(let E=b;y[E]>=0;){let k=H[y[E]];w.push(k),E-=U[k][0]*e.cols+U[k][1]}d.push(...w.reverse())}),d}function fl(e){let r=0;for(;e;e&=e-1)r++;return r}function an(e){let r=hl(e);if(!r)return!1;let n=ee(e);for(let t of r)if(n=V(n,{kind:"move",dir:t}).state,n.outcome!=="playing")break;return n.outcome==="won"}var Ie={minotaurDelta:8,exploredTimes:20};function Tr(e,r=Ie,n){let t=[];if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved)return["the level cannot be won"];let s=e.withoutMinotaur!==null;if(s&&(e.minotaurDelta===null||e.greedyWins===null?t.push("the Minotaur-free search hit its cap"):e.minotaurDelta<=0&&e.greedyWins&&t.push("the Minotaur does not matter: the line that ignores him wins, no longer")),t.push(...pt(e)),!n)return t;if(!s)return[...t,"a challenge level has a Minotaur"];e.greedyWins!==!1&&t.push("a challenge level: the line that ignores the Minotaur must lose"),e.minotaurDelta!==null&&e.minotaurDelta<r.minotaurDelta&&t.push(`a challenge level: the Minotaur adds ${e.minotaurDelta} moves, the bar is ${r.minotaurDelta}`);let l=i=>Math.max(0,...n.teaching.map(i)),o=l(i=>i.explored);e.explored<r.exploredTimes*o&&t.push(`a challenge level: stored ${e.explored} situations, the bar is ${r.exploredTimes} × ${o} = ${r.exploredTimes*o}`);let u=l(i=>typeof i.shortest=="number"?i.shortest:0);return typeof e.shortest=="number"&&e.shortest<u&&t.push(`a challenge level: ${e.shortest} moves, shorter than the longest teaching level's ${u}`),t}function pt(e){return e.catchFree==="unknown"?["the catch-free search hit its cap"]:e.catchFree==="none"?["no win without a catch: no level may need one"]:typeof e.shortest=="number"&&e.catchFree>e.shortest?[`the fewest moves take a catch (${e.shortest}, against ${e.catchFree} without one): no level may need one`]:e.catches>0?["the shortest line takes a catch, though a line as short takes none: no level may need one"]:[]}var ht={ramp:{least:1.1,most:1.5},most:2e4};function ue(e){return e.terrain.some(r=>r==="fake-wall"||r==="invisible-wall")}function mt(e,r){return!ue(e)||r.explored<=ht.most?[]:[`the level hides walls: stored ${r.explored} situations, the ceiling for a level that hides walls is ${ht.most}`]}var Er={shortest:40,explored:12e3,chaseShortest:30,chaseExplored:6e3};function bt(e,r=Er){if(e.shortest==="unknown")return["the solver hit its cap: the level is not proved winnable"];if(!e.solved||typeof e.shortest!="number")return["the level cannot be won"];let n=[];e.naiveWins&&n.push("the plain walk to the exit wins"),n.push(...pt(e));let t=e.label==="chase"&&e.greedyWins===!1&&e.minotaurDelta!==null&&e.minotaurDelta>=Ie.minotaurDelta,s=t?r.chaseShortest:r.shortest,l=t?r.chaseExplored:r.explored;return e.shortest<s&&n.push(`the quickest win is ${e.shortest} moves, the bar is ${s}`),e.explored<l&&n.push(`the solver searched ${e.explored} situations, the bar is ${l}`),n}var pl={flippers:e=>e.gear.includes("flippers")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="water","fire-boots":e=>e.gear.includes("fire-boots")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="fire",skates:e=>e.gear.includes("skates")&&e.terrain[e.player.r*e.level.cols+e.player.c]==="ice",suction:e=>e.gear.includes("suction")&&_[e.terrain[e.player.r*e.level.cols+e.player.c]].carries!==void 0,mirror:e=>e.stone>0,cow:e=>e.cow!==null},ml={ice:"skates","force-up":"suction","force-down":"suction","force-left":"suction","force-right":"suction"};function ye(e,r){let n=[...e.terrain],t=[...e.objects];r(n,t);let s=e.machines.filter(l=>n[l.at.r*e.cols+l.at.c]==="clone");return W(Te({...e,terrain:n,objects:t,machines:s}))}function Pr(e){let r=[],n=o=>`row ${Math.floor(o/e.cols)+1}, column ${o%e.cols+1}`,t=o=>e.terrain[o.player.r*e.cols+o.player.c];for(let o of Ge){let u=`key-${o}`,i=a=>_[t(a)].door===o;e.objects.includes(u)&&r.push({name:`the ${o} keys`,ignored:[ye(e,(a,c)=>{c.forEach((h,d)=>{h===u&&(c[d]=null)})})],used:i}),e.terrain.some(a=>_[a].door===o)&&r.push({name:`the ${o} doors`,ignored:["wall","floor"].map(a=>ye(e,(c,h)=>{c.forEach((d,f)=>{_[d].door===o&&(c[f]=a)}),h.forEach((d,f)=>{d===u&&(h[f]=null)})})),used:i})}let s=e.objects.filter(o=>o==="relic").length>e.relics;e.objects.forEach((o,u)=>{o==="block"?r.push({name:`the block at ${n(u)}`,ignored:[ye(e,(i,a)=>{a[u]=null,i[u]="wall"}),ye(e,(i,a)=>{a[u]=null})]}):(o==="relic"?s:o!==null&&o!=="cake"&&o!=="page"&&!o.startsWith("key-"))&&r.push({name:`the ${o==="relic"?"spare relic":o} at ${n(u)}`,ignored:[ye(e,(i,a)=>{a[u]=null})],used:o===null?void 0:pl[o]})});let l=[["gravel",["gravel"],["floor","wall"]],["marked stones",["safe"],["floor","wall"]],["pop-up walls",["popup"],["floor","wall"]],["ice",["ice"],["floor"]],["currents",["force-up","force-down","force-left","force-right"],["floor"]],["water",["water"],["wall","floor"]],["fire",["fire"],["wall","floor"]],["teleports",["teleport"],["wall","floor"]]];for(let[o,u,i]of l){if(!e.terrain.some(h=>u.includes(h)))continue;let a=i.map(h=>ye(e,d=>{d.forEach((f,m)=>{u.includes(f)&&(d[m]=h)})})),c=ml[u[0]];c&&e.objects.includes(c)&&a.push(ye(e,(h,d)=>{d.forEach((f,m)=>{f===c&&(d[m]=null)})})),r.push({name:`the ${o}`,ignored:a})}return e.terrain.some(o=>o==="button"||o==="toggle-open"||o==="toggle-closed")&&r.push({name:"the toggle walls and their button",ignored:[ye(e,o=>{o.forEach((u,i)=>{u==="button"||u==="toggle-open"?o[i]="floor":u==="toggle-closed"&&(o[i]="wall")})})]}),e.terrain.forEach((o,u)=>{let i=c=>{for(let[h,d]of Object.entries(e.links))d===u&&(c[Number(h)]="floor")},a=(c,h,d,f)=>r.push({name:`the ${c} at ${n(u)}`,ignored:[h,...f?[f]:[]].map(m=>ye(e,p=>{p[u]=m,d?.(p)}))});o==="trap"?a("snare","floor",i):o==="fake-wall"?a("fake wall","wall",void 0,"floor"):o==="invisible-wall"?a("invisible wall","floor"):o==="thief"?a("thief","floor"):o==="bomb"?a("bomb","floor"):o==="clone"&&a("clone machine","wall",i)}),e.hazards.forEach((o,u)=>{r.push({name:`the ${le[o.kind].name.toLowerCase()} at ${n(o.at.r*e.cols+o.at.c)}`,ignored:[W(Te({...e,hazards:e.hazards.filter((i,a)=>a!==u)}))]})}),r}var gt={explored:1.3};function wt(e,r,n,t=!1){let s=Je(ee(r),n);if(!s.solved)return s.capped?"capped":"the level cannot be won";if(s.line.length!==e.shortest)return`the fewest moves go from ${e.shortest} to ${s.line.length}`;let l=at(ee(r),he,n);return l.solved?l.line.length!==e.catchFree?`the fewest catch-free moves go from ${e.catchFree} to ${l.line.length}`:!t&&e.explored>=gt.explored*s.explored?`the search falls from ${e.explored} situations to ${s.explored}`:null:l.capped?"capped":"no win without a catch"}function bl(e,r){let n=new Set;for(let t of r.ignored)for(let s=0;s<e.terrain.length;s++)(t.terrain[s]!==e.terrain[s]||t.objects[s]!==e.objects[s])&&n.add(s);return[...n]}function yt(e,r,n){let t=n.used?[]:bl(e,n);if(!t.length&&!n.used)return!1;let s=ee(e),l=o=>o.r*e.cols+o.c;for(let o of He(r)??[]){if(s=V(s,o).state,n.used?.(s))return!0;let u=l(s.player),i=s.minotaur?l(s.minotaur):-1;for(let a of t)if(u===a||s.terrain[a]!==e.terrain[a]||s.objects[a]!==e.objects[a]||i===a&&e.terrain[a]==="trap")return!0}return!1}function xt(e,r,n=ce,t=!1){return!r.solved||typeof r.catchFree!="number"?[]:Pr(e).flatMap(s=>{if(t&&yt(e,r.line,s))return[];let l=s.ignored.map(o=>wt(r,o,n,t));return l.some(o=>o!==null&&o!=="capped")?[]:l.includes("capped")?[{unit:s,problem:`${s.name}: the search without it hit its cap, so it is not proved to matter`}]:[{unit:s,problem:t?`${s.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${r.shortest}`:`${s.name}: ignoring it changes nothing (still ${r.shortest} moves, and the search no ${gt.explored} × smaller)`}]})}function*kt(e,r,n=ce){if(!r.solved||typeof r.catchFree!="number")return[];let t=[];for(let s of Pr(e)){if(yield{expanded:0,stored:0,bestF:0,startH:0},yt(e,r.line,s))continue;let l=s.ignored.map(o=>wt(r,o,n,!0));l.some(o=>o!==null&&o!=="capped")||t.push(l.includes("capped")?`${s.name}: the search without it hit its cap, so it is not proved to matter`:`${s.name}: the shortest line never meets it, and ignoring it leaves the fewest moves at ${r.shortest}`)}return t}function Mt(e){let r=[["Theseus",e.player]];e.minotaur&&r.push(["the Minotaur",e.minotaur]);for(let t of e.hazards)r.push([`the ${le[t.kind].name.toLowerCase()}`,t.at]);let n=[];for(let[t,s]of r){let l=s.r*e.cols+s.c,o=e.terrain[l],u=e.objects[l];(o!=="floor"||u!==null)&&n.push(`${t} starts on ${u??o} at row ${s.r+1}, column ${s.c+1}: nothing may start under a figure`)}return n}var We={reach:8,challenge:{share:1/3,quiet:1/3},teaching:{share:1/4,quiet:1}};function Tt(e){return!e.minotaur||e.objects.includes("mirror")||e.terrain.includes("trap")?!1:ft(e)}function gl(e,r){let n=e.level;if(!e.minotaur)return 1/0;let t=e.minotaur.r*n.cols+e.minotaur.c,s=e.player.r*n.cols+e.player.c,l=new Map([[t,0]]),o=[t];for(let u=0;u<o.length;u++){let i=o[u],a=l.get(i);if(i===s)return a;if(a>=r)continue;let c=Math.floor(i/n.cols),h=i%n.cols;for(let d of H){let f=c+U[d][0],m=h+U[d][1];if(f<0||m<0||f>=n.rows||m>=n.cols)continue;let p=f*n.cols+m;l.has(p)||p!==s&&(!_[e.terrain[p]].minotaur||e.objects[p]==="block")||(l.set(p,a+1),o.push(p))}}return 1/0}function dn(e,r){let n=He(r.line)??[],t=ee(e),s=0,l=0,o=0;for(let u of n)t=V(t,u).state,t.stone>0||!!t.minotaur&&(se($n(t),t.minotaur)||gl(t,We.reach)<=We.reach)?(s++,o=0):l=Math.max(l,++o);return{turns:n.length,live:s,quiet:l}}function Et(e,r,n){if(!e.minotaur||!r.solved||typeof r.shortest!="number")return[];let t=[];r.minotaurDelta!==null&&r.minotaurDelta<1&&t.push("the beast adds no moves: a route that ignores him wins as quickly");let s=We[n],l=dn(e,r);return l.live<s.share*l.turns&&t.push(`the beast is live on ${l.live} of ${l.turns} turns; the bar is ${Math.ceil(s.share*l.turns)}`),l.quiet>s.quiet*l.turns&&t.push(`the beast is quiet for ${l.quiet} turns in a row; the bar is ${Math.floor(s.quiet*l.turns)}`),t}var wl={walk:"walks round the Minotaur and never uses a tool",cowAtOnce:"sets the cow down as soon as it holds it",cowNear:"sets the cow down when the Minotaur is within 3 steps",mirrorNear:"raises the mirror when the Minotaur is within 2 steps",toolsNear:"sets the cow down and raises the mirror when the Minotaur comes near",careful:"takes the safest step when its next one would be caught",carefulTools:"is careful and sets the cow down and raises the mirror when the Minotaur comes near",cowStuck:"sets the cow down where the Minotaur gets stuck behind a wall short of it",cowStuckCareful:"sets the cow down where the Minotaur gets stuck, raises the mirror when he is near, and is careful"},er=Object.keys(wl),yl={walk:{cow:"none",mirror:!1,careful:!1},cowAtOnce:{cow:"once",mirror:!1,careful:!1},cowNear:{cow:"near",mirror:!1,careful:!1},mirrorNear:{cow:"none",mirror:!0,careful:!1},toolsNear:{cow:"near",mirror:!0,careful:!1},careful:{cow:"none",mirror:!1,careful:!0},carefulTools:{cow:"near",mirror:!0,careful:!0},cowStuck:{cow:"stuck",mirror:!1,careful:!1},cowStuckCareful:{cow:"stuck",mirror:!0,careful:!0}},xl=H.map(e=>({kind:"move",dir:e})),Qe={kind:"wait"},vr=e=>({kind:"tool",tool:e}),kl=(e,r)=>Math.abs(e.r-r.r)+Math.abs(e.c-r.c),Ne=e=>e.some(r=>r.kind==="caught");function Ml(e){let r=V(e,vr("cow"));if(r.state===e||Ne(r.events))return!1;let n=r.state;for(let t=0;t<10;t++){if(r=V(n,Qe),Ne(r.events)||r.state.outcome!=="playing")return!1;n=r.state}return!!n.cow}function Tl(e,r){let n=null;for(let t=0;t<e.terrain.length;t++){let s=e.terrain[t];(s==="fake-wall"||s==="invisible-wall")&&(n??=[...e.terrain],n[t]=s==="fake-wall"?"wall":"floor")}return r?{...e,terrain:n??e.terrain}:{...e,terrain:n??e.terrain,minotaur:null,stone:0}}var St=(e,r)=>r.relicsLeft<e.relicsLeft,At=(e,r)=>r.outcome==="won",Pt=e=>e.keys.red+e.keys.blue+e.keys.yellow+e.keys.green,Sr=(e,r)=>Pt(r)>Pt(e)||r.gear.length>e.gear.length||r.tools.mirror>e.tools.mirror||r.tools.cow>e.tools.cow||r.tools.cake>e.tools.cake,El=e=>(r,n)=>n.tools[e]>r.tools[e];function xe(e,r){return vt(e,r,!0)??vt(e,r,!1)}function vt(e,r,n){let t=Tl(e,n),s=e.level.cols,l=new Set;for(let a of e.hazards){l.add(a.at.r*s+a.at.c);let[c,h]=U[a.dir];l.add((a.at.r+c)*s+a.at.c+h)}let o=a=>a.player.r*s+a.player.c,u=new Set([o(t)]),i=[];for(let a of H){let c=Qr(t,{kind:"move",dir:a});if(c.state===t||Ne(c.events)||c.state.player===t.player&&c.state.terrain===t.terrain||c.events.some(d=>d.kind==="robbed")||l.has(o(c.state)))continue;if(r(t,c.state))return{first:a,dist:1};let h=o(c.state);u.has(h)||(u.add(h),i.push({s:c.state,first:a}))}for(let a=2;i.length&&a<400;a++){let c=[];for(let{s:h,first:d}of i)for(let f of H){let m=Qr(h,{kind:"move",dir:f});if(m.state===h||Ne(m.events)||m.state.outcome==="lost"||m.events.some(g=>g.kind==="robbed"))continue;let p=o(m.state);if(!l.has(p)){if(r(t,m.state))return{first:d,dist:a};u.has(p)||(u.add(p),c.push({s:m.state,first:d}))}}i=c}return null}function rr(e){let r=e.relicsLeft>0?xe(e,St)??xe(e,Sr):xe(e,At)??xe(e,Sr);return r?r.dist:1/0}function Pl(e,r){for(let n of r)if(e.objects.some(t=>t===n)){let t=xe(e,El(n));if(t)return t}return e.relicsLeft>0?xe(e,St)??xe(e,Sr):xe(e,At)??xe(e,Sr)}function vl(e,r){let n=e.minotaur,t=n?kl(n,e.player):1/0;if(e.tools.cake>0&&e.hearts<=1)return vr("cake");if(r.cow!=="none"&&e.tools.cow>0&&!e.cow&&(r.cow==="stuck"?Ml(e):r.cow==="once"||t<=3))return vr("cow");if(r.mirror&&e.tools.mirror>0&&e.stone===0&&t<=2)return vr("mirror");let s=[];r.cow!=="none"&&s.push("cow"),r.mirror&&s.push("mirror");let l=Pl(e,s),o=l?{kind:"move",dir:l.first}:Qe;if(o.kind==="move"&&V(e,o).state===e&&(o=Qe),r.careful&&Ne(V(e,o).events)){let u=null,i=1/0;for(let a of[...xl,Qe]){let c=V(e,a);if(c.state===e||Ne(c.events))continue;let h=rr(c.state);h<i&&(i=h,u=a)}u&&(o=u)}return o}function cn(e,r,n){let t=yl[r],s=ee(e),l=0;for(;l<n&&s.outcome==="playing";l++){let o=vl(s,t),u=V(s,o);u.state===s&&(u=V(s,Qe)),s=u.state}return{won:s.outcome==="won",turns:l}}var hn=e=>4*e+50;function zt(e,r){return er.filter(n=>cn(e,n,hn(r)).won)}var Ke={detour:1,offRoute:1,away:2,waits:3,traps:3,forced:4},Sl=3,Al=e=>Math.max(5e4,2*e.explored),zl=e=>Math.max(6e3,e.explored),Lt=H.map(e=>({kind:"move",dir:e})),Ot={kind:"wait"},pn=e=>e.some(r=>r.kind==="caught");function Ll(e){let r={...e.level,minotaur:null};return{...e,level:r,minotaur:null,stone:0}}function*nr(e,r,n={spent:0}){let t=He(r.line)??[],s=Math.max(0,r.minotaurDelta??0),l=0;if(e.minotaur&&t.length){let h=function*(m){if(m.outcome==="won")return 0;let p=yield*fe(Ll(m),null,Al(r));return n.spent+=p.explored,p.solved?p.line.length:p.capped?NaN:1/0},d=ee(e),f=yield*h(d);for(let m of t){let p=V(d,m).state,g=yield*h(p);Number.isFinite(f)&&!Number.isNaN(g)&&g!==f-1&&l++,f=g,d=p}}let o=0,u=0,i=0;{let h=ee(e),d=rr(h);for(let f of t){let m=0;for(let y of[...Lt,Ot]){let b=V(h,y);y.kind==="move"&&Fe(h,b)||pn(b.events)||b.state.outcome==="lost"||m++}m===1&&i++,f.kind==="wait"&&u++;let p=V(h,f).state,g=p.outcome==="won"||p.relicsLeft<h.relicsLeft?0:rr(p);f.kind==="move"&&Number.isFinite(d)&&g>d&&o++,d=g===0?rr(p):g,h=p}}let a=0;{let h=ee(e);for(let d=0;d<t.length;d++){let f=t[d];if(d%Sl===0)for(let m of[...Lt,Ot]){if(m.kind===f.kind&&(m.kind!=="move"||f.kind!=="move"||m.dir===f.dir))continue;let p=V(h,m);if(m.kind==="move"&&Fe(h,p)||pn(p.events)||p.state.outcome!=="playing")continue;let g=yield*fe(p.state,he,zl(r));n.spent+=g.explored,!g.solved&&!g.capped&&a++}h=V(h,f).state}}let c=Ke.detour*s+Ke.offRoute*l+Ke.away*o+Ke.waits*u+Ke.traps*a+Ke.forced*i;return{detour:s,offRoute:l,away:o,waits:u,traps:a,forced:i,total:c}}var Ol=new Set(["wall","door-red","door-blue","door-yellow","door-green","gate","toggle-closed","fake-wall","invisible-wall","clone"]),fn={most:.5,area:6};function Rl(e){let r=e.rows,n=e.cols,t=(c,h)=>c>=0&&h>=0&&c<r&&h<n&&!Ol.has(e.terrain[c*n+h]),s=0;for(let c=0;c<r;c++)for(let h=0;h<n;h++)t(c,h)&&s++;let l=new Uint8Array(r*n),o=new Uint8Array(r*n);for(let c=0;c+1<r;c++)for(let h=0;h+1<n;h++)t(c,h)&&t(c+1,h)&&t(c,h+1)&&t(c+1,h+1)&&(l[c*n+h]=1,o[c*n+h]=o[(c+1)*n+h]=o[c*n+h+1]=o[(c+1)*n+h+1]=1);let u=new Uint8Array(r*n),i=[];for(let c=0;c<r*n;c++){if(!l[c]||u[c])continue;let h=new Set,d=[c];u[c]=1;for(let f=0;f<d.length;f++){let m=d[f],p=Math.floor(m/n),g=m%n;h.add(m),h.add(m+1),h.add(m+n),h.add(m+n+1);for(let[y,b]of[[1,0],[-1,0],[0,1],[0,-1]]){let w=p+y,E=g+b,k=w*n+E;w>=0&&E>=0&&w<r&&E<n&&l[k]&&!u[k]&&(u[k]=1,d.push(k))}}i.push({cells:[...h].sort((f,m)=>f-m)})}let a=0;for(let c of o)a+=c;return{open:s,share:s?a/s:0,areas:i}}function Fl(e,r){let n=e.cols,t=new Set([e.player.r*n+e.player.c,...e.hazards.map(l=>l.at.r*n+l.at.c)]);e.minotaur&&t.add(e.minotaur.r*n+e.minotaur.c);let s=[...e.terrain];for(let l of r){let o=Math.floor(l/n),u=l%n;o%2===0&&u%2===0&&s[l]==="floor"&&e.objects[l]===null&&!t.has(l)&&(s[l]="wall")}return W(Te({...e,terrain:s}))}function*Cl(e,r){let n=yield*fe(ee(e),he,r);if(!n.solved)return null;let t=0;if(e.minotaur){let s=yield*fe(ee({...e,minotaur:null}),null,r);if(!s.solved)return null;t=n.line.length-s.line.length}return yield*nr(e,{line:De(n.line),minotaurDelta:t,explored:n.explored})}var Dl=(e,r)=>`row ${Math.floor(r/e.cols)+1}, column ${r%e.cols+1}`;function*Ft(e,r,n){let t=Rl(e),s=[];t.share>fn.most&&s.push({rule:"open",words:`Too open: ${Math.round(100*t.share)}% of the floor is open space (at most ${Math.round(100*fn.most)}%)`});for(let l of t.areas){if(l.cells.length<fn.area)continue;let o=Fl(e,l.cells);if(o.terrain.every((i,a)=>i===e.terrain[a]))continue;let u=yield*Cl(o,n);u&&u.total>=r.total&&s.push({rule:"open-area",words:`An open area near ${Dl(e,l.cells[0])} does not earn its place: walled into corridors, the level is as hard (${u.total} against ${r.total})`,mended:o})}return s}var Il={walk:"The plain walk wins: walking to each relic and the exit, round the Minotaur, clears it",cowAtOnce:"The cow habit wins: setting the cow down at once and walking clears it",cowNear:"The cow habit wins: setting the cow down when the Minotaur comes near clears it",mirrorNear:"The mirror habit wins: raising the mirror when the Minotaur comes near clears it",toolsNear:"The tool habit wins: using the cow and the mirror when the Minotaur comes near clears it",careful:"The careful walk wins: stepping aside whenever the Minotaur would catch clears it",carefulTools:"The careful walk with tools wins: stepping aside and using the tools when he is near clears it",cowStuck:"The cow habit wins: setting the cow down where the Minotaur gets stuck clears it",cowStuckCareful:"The cow habit wins: setting the cow down where he gets stuck and stepping aside clears it"};function Ct(e,r){return typeof r.shortest!="number"?[]:er.filter(n=>cn(e,n,hn(r.shortest)).won).map(n=>({rule:`habit:${n}`,words:Il[n]}))}var Rt=(e,r)=>W(Te({...e,objects:e.objects.map(n=>n===r?null:n)}));function*Dt(e,r,n,t){let s=[];if(typeof r.shortest!="number")return s;for(let l of["cow","mirror"]){if(!e.objects.includes(l))continue;let o=yield*fe(ee(Rt(e,l)),he,t);o.solved&&o.line.length<=r.shortest&&s.push({rule:`tool:${l}`,words:`The ${l} is not needed: without it the level is won in ${o.line.length} moves`,mended:Rt(e,l)})}if(n==="hard"&&e.objects.includes("cow")){let l=ee(e);for(let o of He(r.line)??[]){if(l.tools.cow>0&&!l.cow){let u=V(l,{kind:"tool",tool:"cow"});!pn(u.events)&&u.state!==l&&(yield*fe(u.state,he,t)).solved&&s.push({rule:"tool:cow-early",words:"The cow works too early: setting it down as soon as it is held still wins"});break}l=V(l,o).state}}return s}function mn(e,r=0){let n=3735928559^r,t=1103547991^r;for(let s=0;s<e.length;s++){let l=e.charCodeAt(s);n=Math.imul(n^l,2654435761),t=Math.imul(t^l,1597334677)}return n=Math.imul(n^n>>>16,2246822507)^Math.imul(t^t>>>13,3266489909),t=Math.imul(t^t>>>16,2246822507)^Math.imul(n^n>>>13,3266489909),[n>>>0,t>>>0]}function bn(...e){return mn(e.join(""))[0]}function Ar(...e){let r=e.join(""),[n,t]=mn(r),[s,l]=mn(r,2654435769),o=n,u=t,i=s,a=l|1,c=()=>{let d=(o+u|0)+a|0;return a=a+1|0,o=u^u>>>9,u=i+(i<<3)|0,i=i<<21|i>>>11,i=i+d|0,(d>>>0)/4294967296};for(let d=0;d<12;d++)c();let h=d=>Math.floor(c()*d);return{next:c,int:h,pick:d=>d[h(d.length)],shuffle(d){let f=[...d];for(let m=f.length-1;m>0;m--){let p=h(m+1);[f[m],f[p]]=[f[p],f[m]]}return f}}}var zr={keys:1,water:1,fire:1,ice:1,force:1,blocks:1,toggle:1,mirror:1,cow:1,gravel:2,popup:3,fake:4,invisible:4,snare:5,teleport:6,ball:7,glider:8,fireball:8,thief:9,bomb:9,clone:9};function gn(e){return Object.keys(zr).filter(r=>zr[r]<=e)}var Ue=["fake","invisible"],Lr=["tree","winding","branching","sidewinder","division","braided"],ae={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]},Be=["up","down","left","right"];function Bl(e,r,n){let t=e.length,s=e[0].length;return r<=0||n<=0||r>=t-1||n>=s-1||e[r][n]!=="#"?!1:e[r-1][n]!=="#"&&e[r+1][n]!=="#"&&e[r][n-1]!=="#"&&e[r][n+1]!=="#"}function Bt(e,r,n){let t=e[r][n];e[r][n]=".";let s=Be.some(l=>Bl(e,r+ae[l][0],n+ae[l][1]));return e[r][n]=t,!s}function $t(e,r){let{rows:n,cols:t}=r;if(n%2===0||t%2===0||n<7||t<7)return null;let s=(n-1)/2,l=(t-1)/2,o=Array.from({length:n},()=>Array(t).fill("#")),u=x=>2*Math.floor(x/l)+1,i=x=>2*(x%l)+1,a=s*l;for(let x=0;x<a;x++)o[u(x)][i(x)]=".";let c=x=>{let M=Math.floor(x/l),O=x%l,j=[];return M>0&&j.push(x-l),M<s-1&&j.push(x+l),O>0&&j.push(x-1),O<l-1&&j.push(x+1),j},h=(x,M)=>[(u(x)+u(M))/2,(i(x)+i(M))/2],d=[],f=(x,M)=>{let[O,j]=h(x,M);o[O][j]=".",d.push({r:O,c:j})};for(let[x,M]of $l(e,r.style,s,l,r.winding,c))f(x,M);let m=(x,M)=>o[x][M]!=="#",p=x=>Be.filter(M=>m(u(x)+ae[M][0],i(x)+ae[M][1])).length;for(let x of e.shuffle([...Array(a).keys()])){if(p(x)!==1||e.next()>=r.braid)continue;let M=e.shuffle(c(x).filter(O=>{let[j,Q]=h(x,O);return o[j][Q]==="#"&&Bt(o,j,Q)}));M.length&&f(x,M[0])}let g=new Set;for(let x=0;x<r.chambers&&s>2&&l>2;x++){let M=e.int(s-1),O=e.int(l-1);for(let j=2*M+1;j<=2*M+3;j++)for(let Q=2*O+1;Q<=2*O+3;Q++)o[j][Q]==="#"&&(o[j][Q]="."),g.add(j*t+Q)}let y=d.filter(x=>!g.has(x.r*t+x.c));y.length!==d.length&&(d.length=0,d.push(...y));let b=(x,M)=>d.some(O=>O.r===x&&O.c===M),w=()=>{let x=[];for(let M=1;M<n-1;M++)for(let O=1;O<t-1;O++)o[M][O]==="."&&!b(M,O)&&x.push([M,O]);return x},E=(x,M)=>Be.filter(O=>m(x+ae[O][0],M+ae[O][1])).length===1,k=(x=!1)=>{let M=w();if(!M.length)return null;let O=x?M.filter(([j,Q])=>E(j,Q)):[];return e.pick(O.length?O:M)},T=(x,M=!1)=>{let O=k(M);return O?(o[O[0]][O[1]]=x,!0):!1},L=()=>e.shuffle(d.filter(x=>o[x.r][x.c]===".")),S=x=>{let M=L()[0];return M?(o[M.r][M.c]=x,!0):!1},D=()=>{let x=[];for(let M=1;M<n-1;M++)for(let O=1;O<t-1;O++)o[M][O]==="#"&&(o[M-1][O]==="."&&o[M+1][O]==="."&&o[M][O-1]==="#"&&o[M][O+1]==="#"||o[M][O-1]==="."&&o[M][O+1]==="."&&o[M-1][O]==="#"&&o[M+1][O]==="#")&&x.push([M,O]);return x.length?e.pick(x):null},I=x=>{for(let M of L()){let O=m(M.r-1,M.c)&&m(M.r+1,M.c)?["up","down"]:["left","right"],j=[[M.r,M.c]],Q=2+e.int(3);for(let pe of e.shuffle(O)){let de=M.r,we=M.c;for(;j.length<Q&&(de+=ae[pe][0],we+=ae[pe][1],o[de]?.[we]===".");)j.push([de,we])}if(!(j.length<2)){for(let[pe,de]of j)o[pe][de]=x;return!0}}return!1},B=new Map,z=new Map,R=x=>{let M=k();return M?(o[M[0]][M[1]]=x,B.set(M[0]*t+M[1],e.pick(Be)),!0):!1},P=!0;for(let x of r.families){switch(x){case"keys":{let[M,O]=e.pick([["R","r"],["B","b"],["Y","y"],["G","g"]]),j=1+e.int(2);for(let Q=0;Q<j;Q++)P=S(M)&&P;for(let Q=0;Q<(M==="G"?1:j);Q++)P=T(O,!0)&&P;break}case"water":P=I("~")&&(e.next()<.5?T("f",!0):T("O"))&&P;break;case"fire":P=I("F")&&T("h",!0)&&P;break;case"ice":{P=I("=")&&P,e.next()<.5&&(P=T("k",!0)&&P);break}case"force":{P=I(e.pick(["^","v","<",">"]))&&P,e.next()<.5&&(P=T("u",!0)&&P);break}case"blocks":{let M=1+e.int(2);for(let O=0;O<M;O++)P=T("O")&&P;break}case"toggle":{let M=1+e.int(2);for(let O=0;O<M;O++)P=S(e.next()<.5?"T":"t")&&P;P=T("_")&&P;break}case"mirror":P=T("z",!0)&&P;break;case"cow":P=T("c",!0)&&P;break;case"gravel":{let M=1+e.int(2);for(let O=0;O<M;O++)P=S(":")&&P;break}case"popup":P=S(";")&&P;break;case"fake":{let M=e.next()<.6?D():null;M?o[M[0]][M[1]]="W":P=S("W")&&P;break}case"invisible":P=(e.next()<.5?S("I"):T("I"))&&P;break;case"snare":P=(e.next()<.5?S("&"):T("&"))&&T("-")&&P;break;case"teleport":P=T("@",!0)&&T("@",!0)&&P;break;case"ball":P=R("o")&&P;break;case"glider":P=R("w")&&P;break;case"fireball":P=R("e")&&P;break;case"thief":P=S("$")&&P;break;case"bomb":P=(e.next()<.5?S("!"):T("!"))&&P;break;case"clone":{let M=!1;for(let O=0;O<60&&!M;O++){let j=1+e.int(n-2),Q=1+e.int(t-2),pe=e.pick(Be),de=j+ae[pe][0],we=Q+ae[pe][1];o[j][Q]!=="#"||o[de]?.[we]!=="."||(o[j][Q]="C",z.set(j*t+Q,`${e.pick(["block","ball","block"])}-${pe}`),M=!0)}P=M&&T("+")&&P;break}}if(!P)return null}let $=k();if(!$)return null;o[$[0]][$[1]]="P";let A=Gl(o,$),v=[];for(let x=1;x<n-1;x++)o[x][1]==="."&&v.push([x,0,x,1,A[x*t+1]]),o[x][t-2]==="."&&v.push([x,t-1,x,t-2,A[x*t+t-2]]);for(let x=1;x<t-1;x++)o[1][x]==="."&&v.push([0,x,1,x,A[t+x]]),o[n-2][x]==="."&&v.push([n-1,x,n-2,x,A[(n-2)*t+x]]);v.sort((x,M)=>M[4]-x[4]||x[0]-M[0]||x[1]-M[1]);let G=v.filter(x=>x[4]>0).slice(0,Math.max(1,Math.ceil(v.length/3)));if(!G.length)return null;let[N,ne,F,K]=e.pick(G);o[N][ne]="E";for(let x=0;x<r.relics;x++){let M=It(o,A,.5,1).filter(([de,we])=>!(de===F&&we===K)),O=M.filter(([de,we])=>E(de,we)),j=O.length&&e.next()<.7?O:M;if(!j.length)return null;let[Q,pe]=e.pick(j);o[Q][pe]="*"}let J=It(o,A,.25,.6);if(!J.length)return null;let Me=e.pick(J);return o[Me[0]][Me[1]]="M",r.relics>0&&e.next()<.5&&o[F][K]==="."&&!b(F,K)&&(o[F][K]="|"),{g:o,doors:d,facing:B,machines:z}}function $l(e,r,n,t,s,l){let o=n*t,u=[];if(r==="sidewinder"){let d=e.next()<.5,f=e.next()<.5,m=d?t:n,p=d?n:t,g=(y,b)=>{let w=f?m-1-y:y;return d?b*t+w:w*t+b};for(let y=0;y<m;y++){let b=[];for(let w=0;w<p;w++){b.push(g(y,w));let E=y>0&&(w===p-1||e.next()<.5);if(y===0?w<p-1:!E){u.push([g(y,w),g(y,w+1)]);continue}if(y>0){let k=e.int(b.length);u.push([b[k],g(y-1,k+w-b.length+1)])}b=[]}}return u}if(r==="division"){let d=new Set,f=(m,p,g,y)=>{let b=g-m+1,w=y-p+1;if(b<2||w<2)return;if(b>w||b===w&&e.next()<.5){let k=m+e.int(b-1),T=p+e.int(w);for(let L=p;L<=y;L++)L!==T&&d.add(`${k*t+L}:${(k+1)*t+L}`);f(m,p,k,y),f(k+1,p,g,y)}else{let k=p+e.int(w-1),T=m+e.int(b);for(let L=m;L<=g;L++)L!==T&&d.add(`${L*t+k}:${L*t+k+1}`);f(m,p,g,k),f(m,k+1,g,y)}};f(0,0,n-1,t-1);for(let m=0;m<o;m++)m%t<t-1&&!d.has(`${m}:${m+1}`)&&u.push([m,m+1]),m+t<o&&!d.has(`${m}:${m+t}`)&&u.push([m,m+t]);return u}let i=r==="winding"?Math.max(s,.85):r==="branching"?Math.min(s,.15):s,a=new Uint8Array(o),c=e.int(o);a[c]=1;let h=[c];for(;h.length;){let d=e.next()<i?h.length-1:e.int(h.length),f=h[d],m=l(f).filter(g=>!a[g]);if(!m.length){h.splice(d,1);continue}let p=e.pick(m);u.push([f,p]),a[p]=1,h.push(p)}return u}function Gl(e,r){let n=e.length,t=e[0].length,s=new Int32Array(n*t).fill(-1);s[r[0]*t+r[1]]=0;let l=[r[0]*t+r[1]];for(let o=0;o<l.length;o++){let u=l[o],i=Math.floor(u/t),a=u%t;for(let c of Be){let h=i+ae[c][0],d=a+ae[c][1];if(h<=0||d<=0||h>=n-1||d>=t-1)continue;let f=h*t+d;s[f]>=0||e[h][d]==="#"||(s[f]=s[u]+1,l.push(f))}}return s}function It(e,r,n,t){let s=e.length,l=e[0].length,o=[];for(let u=1;u<s-1;u++)for(let i=1;i<l-1;i++)e[u][i]==="."&&r[u*l+i]>0&&o.push([u,i,r[u*l+i]]);return o.sort((u,i)=>u[2]-i[2]||u[0]-i[0]||u[1]-i[1]),o.slice(Math.floor(o.length*n),Math.ceil(o.length*t)).map(([u,i])=>[u,i])}function ke(e,r){let n=[`title: ${r}`,"intro: "],t=[...e.facing.keys()].sort((l,o)=>l-o);t.length&&n.push(`facing: ${t.map(l=>e.facing.get(l)).join(" ")}`);let s=[...e.machines.keys()].sort((l,o)=>l-o);return s.length&&n.push(`machines: ${s.map(l=>e.machines.get(l)).join(" ")}`),`${n.join(`
`)}

${e.g.map(l=>l.join("")).join(`
`)}
`}var jl=new Set("PM*rbygfhkuzcxOowe_-+&!I@");function Or(e,r){let n=r.g.map(c=>[...c]),t=n.length,s=n[0].length,l=[...r.doors],o=new Map(r.facing),u=c=>{let h=[];for(let d=1;d<t-1;d++)for(let f=1;f<s-1;f++)c(d,f)&&h.push([d,f]);return h},i=(c,h)=>l.some(d=>d.r===c&&d.c===h),a=e.next();if(a<.55){let c=u((d,f)=>jl.has(n[d][f])&&!i(d,f)),h=u((d,f)=>n[d][f]==="."&&!i(d,f));if(c.length&&h.length){let[d,f]=e.pick(c),[m,p]=e.pick(h);n[m][p]=n[d][f],n[d][f]=".";let g=o.get(d*s+f);g&&(o.delete(d*s+f),o.set(m*s+p,g))}}else if(a<.7){let c=l.filter(d=>n[d.r][d.c]!=="."),h=l.filter(d=>n[d.r][d.c]===".");if(c.length&&h.length){let d=e.pick(c),f=e.pick(h);n[f.r][f.c]=n[d.r][d.c],n[d.r][d.c]="."}}else if(a<.8&&o.size)o.set(e.pick([...o.keys()]),e.pick(Be));else{let c=l.filter(d=>n[d.r][d.c]==="."),h=u((d,f)=>n[d][f]==="#"&&(n[d-1][f]!=="#"&&n[d+1][f]!=="#"&&n[d][f-1]==="#"&&n[d][f+1]==="#"||n[d][f-1]!=="#"&&n[d][f+1]!=="#"&&n[d-1][f]==="#"&&n[d+1][f]==="#")&&Bt(n,d,f));if(c.length>1&&(e.next()<.5||!h.length)){let d=e.pick(c);n[d.r][d.c]="#",l=l.filter(f=>f!==d)}else if(h.length){let[d,f]=e.pick(h);n[d][f]=".",l.push({r:d,c:f})}}return{g:n,doors:l,facing:o,machines:new Map(r.machines)}}var Gt=e=>e==="floor"?"":e.startsWith("force")?"force":e.startsWith("toggle")?"toggle":e==="exit"||e==="gate"?"wall":e;function _l(e,r,n){for(let t=-1;t<=1;t++)for(let s=-1;s<=1;s++){let l=r+t,o=n+s;if(l>=0&&o>=0&&l<e.rows&&o<e.cols&&Gt(e.terrain[l*e.cols+o])!=="wall")return!1}return!0}function jt(e){return Array.from({length:e.rows-2},(r,n)=>Array.from({length:e.cols-2},(t,s)=>{let l=Gt(e.terrain[(n+1)*e.cols+s+1]);return l==="wall"&&_l(e,n+1,s+1)?"":l}))}var Hl=e=>e[0].map((r,n)=>e.map(t=>t[n]).reverse()),Wl=e=>e.map(r=>[...r].reverse());function wn(e){let r=[];for(let n=0,t=e;n<4;n++,t=Hl(t))r.push(t,Wl(t));return r}function Ye(e,r){let n=0;for(let t of r){let[s,l]=e.length*e[0].length<=t.length*t[0].length?[e,t]:[t,e],o=s.length,u=s[0].length,i=l.length,a=l[0].length;if(!(o>i||u>a||i-o>2||a-u>2))for(let c=0;c<=i-o;c++)for(let h=0;h<=a-u;h++){let d=0,f=0;for(let m=0;m<o;m++)for(let p=0;p<u;p++){let g=s[m][p],y=l[m+c][p+h];g&&g===y&&d++,(g||y)&&f++}n=Math.max(n,f?d/f:1)}}return n}var Ut=[{explored:614,shortest:36},{explored:272,shortest:25},{explored:259,shortest:23},{explored:53,shortest:16},{explored:59,shortest:18},{explored:98,shortest:14},{explored:174,shortest:18},{explored:322,shortest:25},{explored:450,shortest:18}];function sr(e){let r=new Set(e.terrain);return r.has("thief")||r.has("bomb")||r.has("clone")||r.has("button-red")?9:e.hazards.some(n=>n.kind!=="ball")?8:e.hazards.length?7:r.has("teleport")?6:r.has("trap")||r.has("button-brown")?5:r.has("fake-wall")||r.has("invisible-wall")?4:r.has("popup")?3:r.has("gravel")?2:1}var Rr=2e3,Nl={...Er,explored:Rr,chaseExplored:Rr},Kl=e=>({teaching:[{explored:Math.ceil(Rr/Ie.exploredTimes),shortest:Ut[e-1].shortest}]});function Yt(e){let r=Ut[e-1];return{explored:Rr,shortest:Math.max(Er.chaseShortest,r.shortest)}}var or=3e4,Fr=4*or,yn={easy:{first:[25,40],plateau:[45,70]},medium:{first:[35,55],plateau:[70,110]},hard:{first:[50,75],plateau:[110,170]}},lr={least:1.1,most:1.35},qe={least:.7,most:.9},qt=5;function xn(e,r){let n=yn[r];if(e===null)return{least:n.first[0],most:n.first[1],plateau:!1};let t={least:n.plateau[0],most:n.plateau[1],plateau:!0};if(e>=n.plateau[0])return t;let s=Math.max(n.first[0],Math.ceil(e*lr.least)),l=Math.min(n.plateau[1],Math.floor(e*lr.most));return s>=n.plateau[0]?t:{least:s,most:Math.max(l,s+4),plateau:!1}}function kn(e){return{least:Math.floor(e.least*qe.least),most:Math.max(Math.floor(e.least*qe.most),Math.floor(e.least*qe.least)+4),plateau:e.plateau}}function ur(e){return jt(e).map((r,n)=>r.map((t,s)=>(n+1)%2===0&&(s+1)%2===0?"":t))}function Vt(e){return{features:e.map(r=>wn(ur(r)))}}function Mn(e){let{rows:r,cols:n}=e,t=(o,u)=>e.terrain[o*n+u]==="wall",s=(o,u)=>4-[t(o-1,u),t(o+1,u),t(o,u-1),t(o,u+1)].filter(Boolean).length,l=[];for(let o=1;o<r-1;o++)for(let u=1;u<n-1;u++){let i=o*n+u,a=4-s(o,u);if(t(o,u)&&a===0&&l.push(`a lone wall at row ${o+1}, column ${u+1}`),!(e.terrain[i]==="floor"&&e.objects[i]===null&&!(e.player.r===o&&e.player.c===u)&&!(e.minotaur?.r===o&&e.minotaur.c===u)&&!e.hazards.some(f=>f.at.r===o&&f.at.c===u))||a<3)continue;let[h,d]=t(o-1,u)?t(o+1,u)?t(o,u-1)?[o,u+1]:[o,u-1]:[o+1,u]:[o-1,u];(a===4||h<=0||d<=0||h>=r-1||d>=n-1||s(h,d)!==2)&&l.push(`a bare pocket at row ${o+1}, column ${u+1}`)}return l}function Ul(e){let{rows:r,cols:n}=e,t=(b,w)=>b>=1&&w>=1&&b<r-1&&w<n-1,s=(b,w)=>{let E=e.terrain[b*n+w];return E==="wall"||E==="exit"||E==="gate"},l=(b,w)=>t(b,w)&&!s(b,w),o=(b,w)=>t(b,w)&&s(b,w),u=0,i=0,a=0,c=0,h=[[0,0],[0,0],[0,0]],d=(b,w,E,k,T,L)=>{if(b(w-k,E-T))return;let S=0;for(;b(w+S*k,E+S*T);)S++;S>=2&&(L[0]++,L[1]+=S)};for(let b=1;b<r-1;b++)for(let w=1;w<n-1;w++){if(o(b,w)){d(o,b,w,0,1,h[2]),d(o,b,w,1,0,h[2]);continue}u++;let E=[l(b-1,w),l(b+1,w),l(b,w-1),l(b,w+1)].filter(Boolean).length;E===1&&i++,E>=3&&a++,l(b,w+1)&&c++,l(b+1,w)&&c++,d(l,b,w,0,1,h[0]),d(l,b,w,1,0,h[1])}let f=Math.max(1,u),m=([b,w])=>b?w/b:0,[p,g,y]=h.map(m);return{rows:r,cols:n,dead:i/f,forks:a/f,loops:Math.max(0,c-u+1)/f,run:m([h[0][0]+h[1][0],h[0][1]+h[1][1]]),walls:y,skew:p+g?Math.abs(p-g)/(p+g):0}}var _t={dead:.08,forks:.08,loops:.05,run:2,walls:3,skew:.3};function Yl(e,r){let n=(o,u)=>Math.min(o,u)/Math.max(o,u),t=Math.max(n(e.rows,r.rows)*n(e.cols,r.cols),n(e.rows,r.cols)*n(e.cols,r.rows)),s=Object.keys(_t),l=s.reduce((o,u)=>o+Math.abs(e[u]-r[u])/_t[u],0)/s.length;return t*Math.max(0,1-l)}var Tn=.6;function Cr(e,r){return Math.max(Yl(Nt(e),Nt(r)),Ye(ur(e),En(r))*Tn/.42)}var Ht=new WeakMap,Wt=new WeakMap,Nt=e=>{let r=Ht.get(e);return r||(r=Ul(e),Ht.set(e,r)),r},En=e=>{let r=Wt.get(e);return r||(r=wn(ur(e)),Wt.set(e,r)),r};function Pn(e,r,n=[],t=!0){let s=ur(e),l=[];return r.features.forEach((o,u)=>{let i=Ye(s,o);i>=.42&&l.push(`its layout repeats campaign level ${u+1}'s (${i.toFixed(2)})`)}),n.forEach((o,u)=>{let i=t?Cr(e,o):Ye(s,En(o));i>=(t?Tn:.42)&&l.push(`its layout ${t?"looks like":"repeats"} the run's level ${u+1}'s (${i.toFixed(2)})`)}),l}function Dr(e,r,n=[],t=!0){let s=ur(e),l=0;for(let o of r.features)l=Math.max(l,Ye(s,o)/.42);for(let o of n)l=Math.max(l,t?Cr(e,o)/Tn:Ye(s,En(o))/.42);return l}var Kt=e=>e.charAt(0).toUpperCase()+e.slice(1);function Ae(e,r){return r.map(n=>{let t=Kt(n);return e==="purpose"?t=`A useless piece: ${n.slice(0,n.indexOf(":")>0?n.indexOf(":"):n.length)}`:n==="the plain walk to the exit wins"?t="The plain walk wins: walking straight to each relic and the exit clears it":n.startsWith("a challenge level: the line that ignores")?t="The Minotaur can be ignored: the best line without him also wins":n.startsWith("a challenge level: ")?t=Kt(n.slice(19)):e==="threat"?t=`The Minotaur is no threat: ${n}`:e==="tidy"&&(t=`Untidy: ${n}`),{rule:e,words:t}})}function*Ir(e,r,n,t,s=ce){let l=[],o=i=>(l.push(...i),!t&&l.length>0);if(!r.solved)return{score:null,problems:Ae("solve",Tr(r))};if(o(Ae("challenge",Tr(r,Ie,Kl(sr(e))))))return{score:null,problems:l};if(o(Ae("shared",bt(r,Nl).filter(i=>!Tr(r).includes(i)))))return{score:null,problems:l};if(o(Ae("threat",Et(e,r,"challenge"))))return{score:null,problems:l};if(o(Ae("hidden",mt(e,r))))return{score:null,problems:l};if(o(Ae("start",Mt(e))))return{score:null,problems:l};if(o(Ae("tidy",Mn(e))))return{score:null,problems:l};if(yield{expanded:0,stored:0,bestF:0,startH:0},o(Ct(e,r)))return{score:null,problems:l};let u=yield*nr(e,r);return o(yield*Ft(e,u,s))?{score:u,problems:l}:o(yield*Dt(e,r,typeof n=="function"?n(u):n,s))?{score:u,problems:l}:(o(Ae("purpose",yield*kt(e,r,s))),{score:u,problems:l})}function Br(e,r,n,t=[],s=!0){let l=[];return r.explored>or&&l.push(`stored ${r.explored} situations, more than ${or}`),[...l,...Pn(e,n,t,s)]}function $r(e,r){return e.total<r.least||e.total>r.most?[`scored ${e.total}, the band is ${r.least} to ${r.most}`]:[]}function ql(e,r){let n=r.slice(r.indexOf(`

`)+2).trimEnd().split(`
`).map(o=>[...o]),t=[];for(let o=1;o<e.rows-1;o++)for(let u=1;u<e.cols-1;u++)o%2===u%2||e.terrain[o*e.cols+u]==="wall"||t.push({r:o,c:u});let s=new Map(e.hazards.map(o=>[o.at.r*e.cols+o.at.c,o.dir])),l=new Map(e.machines.map(o=>[o.at.r*e.cols+o.at.c,`${o.template}-${o.dir}`]));return{g:n,doors:t,facing:s,machines:l}}var Zt=Fr;function Xt(e,r,n,t,s){let l=Mr(e,Zt);if(s(4*l.explored),!l.solved||Br(e,l,n,t).length)return null;let o=Se(Ir(e,l,r,!1,Zt));return s(o.score?8*l.explored:0),o.problems.length||!o.score?null:{d:l,score:o.score.total}}function Jt(e,r,n,t,s,l=[],o=1/0){let u={found:null,tries:0,kept:0,best:0,spent:0},i=y=>{u.spent+=y},a;try{a=W(e)}catch{return u}let c=ue(a),h=ql(a,e),d=Xt(a,r.grade,s,l,i);if(!d)return u;let f=d.score;if(u.best=f,!$r({total:f},r.band).length)return u.found={text:e,d:d.d,score:f},u;let m=Ar("endless","grow",...n),p=y=>Dr(y,s,l),g=new Set;for(let y=0;y<t&&u.spent<o;y++){u.tries++;let b=Or(m,h),w=ke(b,"");if(g.has(w))continue;g.add(w);let E;try{E=W(w)}catch{continue}if(ue(E)!==c||vn(E,{least:f+1,most:r.band.most,plateau:r.band.plateau},i,p)!==0)continue;let k=Xt(E,r.grade,s,l,i);if(!(!k||k.score<=f||k.score>r.band.most)&&(h=b,f=k.score,u.kept++,u.best=f,f>=r.band.least))return u.found={text:w,d:k.d,score:f},u}return u}var no=3e6,An=12,Ai=no*An;function to(e){return{parts:An,budget:e.budget===void 0?no:Math.max(1,Math.floor(e.budget/An))}}var _r=12,Gr=120,Vl=.25,Zl=8,Xl={easy:{first:[11,13],plateau:[15,17]},medium:{first:[13,15],plateau:[15,19]},hard:{first:[13,15],plateau:[15,21]}},Jl=.3,Ql=4;function es(e,r){if(e.plateau)return 1;let n=yn[r];return Math.max(0,Math.min(1,(e.least-n.first[0])/(n.plateau[0]-n.first[0])))}var Ve=e=>Math.max(7,Math.floor(e)%2?Math.floor(e):Math.floor(e)-1);function rs(e,r,n,t=null){let{first:s,plateau:l}=Xl[r],o=Ve(t?t[0]:s[0]+(l[0]-s[0])*n+1),u=Math.max(o,Ve(t?t[1]:s[1]+(l[1]-s[1])*n+1)),i=(a,c)=>a+2*e.int((c-a)/2+1);if(e.next()<Jl){let a=i(u,Ve(u+Ql)),c=i(o,Ve((o+u)/2+1));return e.next()<.5?[c,a]:[a,c]}return[i(o,u),i(o,u)]}var Qt={tree:3,winding:1,branching:1,sidewinder:1,division:1,braided:1},ns=e=>{let r=e.int(Lr.reduce((n,t)=>n+Qt[t],0));for(let n of Lr)if(r-=Qt[n],r<0)return n;return Lr[0]};function ts(e,r,n,t,s=null,l=0,o=null){let u=gn(r).filter(p=>!Ue.includes(p));n==="hard"&&s!=="cow"&&e.int(Zl)!==0&&(u=u.filter(p=>p!=="cow"));let i=u.filter(p=>zr[p]===Math.min(r,9)),a=(n==="hard"?4:3)+e.int(2),c=[];s&&!Ue.includes(s)?c.push(s):i.length&&e.next()<.5&&c.push(e.pick(i)),t&&c.push(s&&Ue.includes(s)?s:e.pick(Ue));for(let p of e.shuffle(u))c.length<a+(t?1:0)&&!c.includes(p)&&c.push(p);let[h,d]=rs(e,n,l,o),f=ns(e),m=e.next();return{rows:h,cols:d,families:c,relics:(l>=.5?2:1)+e.int(2),style:f,winding:.3+.6*e.next(),braid:f==="braided"?.95+.05*e.next():.45+.5*e.next(),chambers:m<.85?0:m<.97?1:2}}var zn=.6931471805599453;function jr(e){let r=0;for(;e>=2;)e/=2,r++;for(;e<1;)e*=2,r--;let n=(e-1)/(e+1),t=n*n,s=n,l=0;for(let o=1;o<60;o+=2)l+=s/o,s*=t;return 2*l+r*zn}function os(e){if(!(e>=0))return 1;if(e>60)return 0;let r=0;for(;e>=zn;)e-=zn,r++;let n=1,t=1;for(let s=1;s<30;s++)n*=-e/s,t+=n;for(;r>0;r--)t/=2;return t}var eo=Math.ceil(or*1.05),Sn=Fr,ls=2e3;function vn(e,r,n,t=()=>0){if(!e.minotaur)return 1/0;let s=Mn(e).length;if(s)return 14+s;let l=t(e);if(l>=1)return 13+10*(l-1);if(an(e))return n(0,"cheap:walk"),12.5;if(Tt(e))return n(0,"cheap:penned"),12.5;let o=ee(e),u=Je(o,eo);if(!u.solved)return n(u.explored,u.capped?"solve:capped":"solve:lost"),u.capped?12:30;n(u.explored,"solve");let i=0,a=Yt(sr(e));u.explored<a.explored&&(i+=3*jr(a.explored/u.explored)),u.line.length<a.shortest&&(i+=.2*(a.shortest-u.line.length));let c=o,h=0;for(let b of u.line){let w=V(c,b);c=w.state,he(w.events,c)&&h++}i+=3*h;let d=dn(e,{line:De(u.line)});if(i+=6*Math.max(0,We.challenge.share-d.live/Math.max(1,d.turns)),i+=6*Math.max(0,d.quiet/Math.max(1,d.turns)-We.challenge.quiet),i>0)return i;let f=Je(ee({...e,minotaur:null}),eo);n(f.explored,"free");let m=0;if(f.solved){m=u.line.length-f.line.length,i+=.4*Math.max(0,Ie.minotaurDelta-m);let b=o;for(let w of f.line)b=V(b,w).state;b.outcome==="won"&&(i+=2)}if(i>0)return i;let p=zt(e,u.line.length).length;if(n(ls*er.length,"habits"),p)return 1+.5*Math.min(p,4);let g={spent:0},y=Se(nr(e,{line:De(u.line),minotaurDelta:m,explored:u.explored},g)).total;return n(g.spent,"score"),y<r.least&&(i+=3*jr(r.least/Math.max(1,y))),y>r.most&&(i+=3*jr(y/r.most)),i}function ro(e,r){let n=Te(r),t=n.slice(n.indexOf(`

`)+2).trimEnd().split(`
`).map(o=>[...o]),s=new Map(r.hazards.map(o=>[o.at.r*r.cols+o.at.c,o.dir])),l=new Map(r.machines.map(o=>[o.at.r*r.cols+o.at.c,`${o.template}-${o.dir}`]));return{g:t,doors:e.doors,facing:s,machines:l}}function ss(e){let r=n=>n.terrain.filter(t=>t==="wall").length;return e.reduce((n,t)=>r(t)<r(n)?t:n)}function us(e,r,n,t=!1){let s=r.run.slice(-_r),l=e.filter(k=>k.chapter<=r.tier),o=s.map(k=>W(k.text)),u=l.filter(k=>!s.some(T=>T.text===k.text)&&Pn(W(k.text),{features:[]},o).length===0),i=oo(r.run)?.score??null,a=xn(Number.MAX_SAFE_INTEGER,r.grade),c=k=>ue(W(k.text))===t,h=[k=>c(k)&&k.score>=n.least&&k.score<=n.most,k=>k.score>=n.least&&k.score<=n.most&&!ue(W(k.text)),k=>i!==null&&k.score>=i*qe.least&&k.score<=i*lr.most,k=>k.score>=a.least&&k.score<=a.most],d=k=>k[bn("endless-bank",r.seed,r.tier,r.grade,r.depth)%k.length],f=l.filter(k=>!s.some(T=>T.text===k.text)),m=l.filter(k=>k.text!==r.run.at(-1)?.text),p=new Map,g=k=>{let T=p.get(k);if(T===void 0){let L=W(k.text);T=o.reduce((S,D)=>Math.max(S,Cr(L,D)),0),p.set(k,T)}return T},y=k=>{let T=Math.min(...k.map(g));return k.filter(L=>g(L)<=T+.02)},b=k=>i!==null&&k.score>=i*qe.least&&k.score<=Math.max(i*lr.most,a.most),w=()=>!0,E=[...h.map(k=>[u,k]),[u,b],...h.map(k=>[f,k]),[f,b],...h.map(k=>[m,k]),[m,b],[u,w],[f,w],[m,w]];for(let[k,T]of E){let L=k.filter(T);if(L.length)return d(k===u?L:y(L))}if(l.length)return d(l);if(e.length)return d(e);throw new RangeError("the bank is empty")}function oo(e){for(let r=e.length-1;r>=0;r--)if(!ue(W(e[r].text)))return e[r];return null}function is(e,r,n){let t=Ar("endless",...e,n),s=ts(t,r.tier,r.grade,r.hides,r.family??null,es(r.band,r.grade),r.sides??null);return{rng:t,plan:s,sketch:$t(t,s)}}function as(e,r,n,t,s,l,o,u,i){let a=o.by,c=(m,p="other")=>{o.spent+=m,a&&(a[p]=(a[p]??0)+m,a[p+"#"]=(a[p+"#"]??0)+1)},h=new Map,d=m=>{let p=`${m.cols}:${m.terrain.join(",")}`,g=h.get(p);return g===void 0&&(g=Dr(m,t,s,r.look??!0),h.set(p,g)),g},f={grade:r.grade,band:r.band,previous:n};for(let m=0;o.spent<l;m++){let{rng:p,plan:g,sketch:y}=is(e,r,m),b=y;if(!b){c(1e3);continue}let w=B=>{try{return W(ke(B,""))}catch{return null}},E=new Map,k=(B,z)=>{let R=ke(B,""),P=E.get(R);return P===void 0?(P=vn(z,r.band,c,d),Number.isFinite(P)&&ue(z)!==r.hides&&(P+=4),r.family&&Number.isFinite(P)&&!ds(z,r.family)&&(P+=4),E.set(R,P)):a&&(a["memo#"]=(a["memo#"]??0)+1),P},T=w(b);if(!T||d(T)>=1){c(1e3,"like");continue}let L=k(b,T),S=L,D=o.spent,I=Gr;for(let B=0;B<I&&o.spent<l&&(B===I-1&&L<2&&I<3*Gr&&(I+=Gr),!(B===Math.floor(Gr/3)&&L>=8));B++){if(o.tries++,B%8===0&&u?.({tries:o.tries,spent:o.spent,budget:l}),L===0&&T){let $=Mr(T,Sn);c(4*$.explored,"measure");let A=Br(T,$,t,s,r.look??!0),v=null;A.length||(v=Se(Ir(T,$,r.grade,!1,Sn)),c(v.score?8*$.explored:0,"checks"));let G=A.length?A:v.problems.map(F=>F.words),N=!A.length&&v.problems.length>0&&v.problems.every(F=>F.rule==="purpose"),ne=A.length?void 0:v.problems.find(F=>F.mended)?.mended;if(ne){i?.(`mended: ${G.join("; ")}`),a&&(a["mended#"]=(a["mended#"]??0)+1),b=ro(b,ne),T=w(b),L=T?k(b,T):1/0;continue}if(G.length&&!N){if(i?.(`gate: ${G.join("; ")}`),a)for(let F of G){let K="gate:"+F.replace(/[0-9.,×%]+/g,"N").slice(0,50);a[K]=(a[K]??0)+1}L=1,E.set(ke(b,""),L)}else if(N){c(Pr(T).reduce((J,Me)=>J+Me.ignored.length,0)*2*$.explored,"useless");let F=xt(T,$,Sn,!0);if(!F.length){L=1,E.set(ke(b,""),L);continue}i?.(`useless: ${F.map(J=>J.problem).join("; ")}`);let K=ss(F[0].unit.ignored);b=ro(b,K),T=w(b),L=T?k(b,T):1/0;continue}else{let F=v.score,K=$r(F,r.band);if(!K.length)return{text:ke(b,""),d:$,score:F.total,plan:g};i?.(`band: ${K.join("; ")}`),a&&(a["gate:band"]=(a["gate:band"]??0)+1),L=.5+3*Math.abs(jr(F.total<r.band.least?r.band.least/Math.max(1,F.total):F.total/r.band.most)),E.set(ke(b,""),L)}}let z=Or(p,b),R=w(z);if(!R)continue;let P=k(z,R);(P<=L||Number.isFinite(P)&&p.next()<os((P-L)/Vl))&&(b=z,T=R,L=P)}i?.(`round ${m}: began ${S.toFixed(2)}, ended ${L.toFixed(2)} from passing, ${o.spent-D} spent`)}return null}function ds(e,r){let n=l=>e.terrain.includes(l),t=l=>e.objects.includes(l),s=l=>e.hazards.some(o=>o.kind===l);switch(r){case"keys":return e.terrain.some(l=>l.startsWith("door-"));case"water":return n("water");case"fire":return n("fire");case"ice":return n("ice");case"force":return e.terrain.some(l=>l.startsWith("force-"));case"blocks":return t("block")||e.machines.some(l=>l.template==="block");case"toggle":return n("toggle-open")||n("toggle-closed");case"mirror":return t("mirror");case"cow":return t("cow");case"gravel":return n("gravel");case"popup":return n("popup");case"fake":return n("fake-wall");case"invisible":return n("invisible-wall");case"snare":return n("trap");case"teleport":return n("teleport");case"ball":return s("ball");case"glider":return s("glider");case"fireball":return s("fireball");case"thief":return n("thief");case"bomb":return n("bomb");case"clone":return n("clone")}}function Ln(e){return xn(oo(e.run)?.score??null,e.grade)}function $e(e){let r=e.run.at(-1)??null,n=Ln(e),t=e.depth>1&&gn(e.tier).some(s=>Ue.includes(s))&&bn("endless-hides",e.seed,e.tier,e.grade,e.depth)%qt===0;return{band:t?kn(n):n,hides:t,before:r}}var cs=300;function On(e,r){return e.grade==="hard"&&r%2===1?{from:"medium",seed:"part",steps:cs}:null}function lo(e,r,n,t={}){let s=t.grow===void 0?On(e,r):t.grow;return s?Rn(e,r,s,n,t).part:Ze(e,r,n,t)}function Ze(e,r,n,t={}){let s=$e(e),{before:l}=s,{band:o,hides:u}=t.hides===void 0||t.hides===s.hides?s:{band:t.hides?kn(Ln(e)):Ln(e),hides:t.hides},{parts:i,budget:a}=to(e);if(!l||r<0||r>=i)throw new RangeError(`no part ${r} of a search for level ${e.depth}`);let c={tries:0,spent:0},h=e.run.slice(-_r).map(m=>W(m.text)),d=as([e.seed,e.tier,e.grade,e.depth,"part",r],{tier:e.tier,grade:e.grade,band:o,hides:u},{explored:l.explored},n,h,a,c,t.progress);return{found:d?{text:d.text,explored:d.d.explored,shortest:d.d.shortest,score:d.score,line:d.d.line,from:"made",tries:c.tries,spent:c.spent}:null,...c}}function Rn(e,r,n,t,s={}){let l=$e(e),{budget:o}=to(e),u=(s.search??((p,g,y,b)=>Ze(p,g,y,{...b,progress:w=>s.progress?.({...w,budget:2*o})})))({...e,grade:n.from},r,t,{hides:l.hides}),i=u.found;if(!i||ue(W(i.text))!==l.hides)return{parent:i,climb:null,part:{found:null,tries:u.tries,spent:u.spent}};let a=e.run.slice(-_r).map(p=>W(p.text)),c=Jt(i.text,{grade:e.grade,band:l.band},[e.seed,e.tier,e.grade,e.depth,"part",r,n.from,n.seed],n.steps,t,a,o),h=u.tries+c.tries,d=u.spent+c.spent,f=c.found,m=f?{text:f.text,explored:f.d.explored,shortest:f.d.shortest,score:f.score,line:f.d.line,from:"made",grown:!0,tries:h,spent:d}:null;return{parent:i,climb:c,part:{found:m,tries:h,spent:d}}}function so(e,r,n=0,t=0){let s=$e(e),l=us(r,e,s.band,s.hides);return{text:l.text,explored:l.explored,shortest:l.shortest,score:l.score,line:l.line,from:"bank",tries:n,spent:t}}var hs=[2,3],fs=1e3;function ir(e){return{seed:e.seed,tier:e.tier,grade:e.grade,depth:e.depth,run:e.run}}function Fn(e){let r=W(e.text);return{text:e.text,line:e.line,shortest:e.shortest,score:e.score,explored:e.explored,chapter:sr(r),hides:ue(r)}}var Cn=["easy","medium","hard"];function uo(e,r,n=Ze){return Rn(ir(e),e.k,e.grow,r,{search:(t,s,l,o)=>n(t,s,l,o)})}function ps(e){if(!hs.includes(e.v))return!1;if(!e.grow)return!0;let r=e.grow;return e.v>=3&&Cn.indexOf(r.from)>=0&&Cn.indexOf(r.from)<Cn.indexOf(e.grade)&&/^[a-z0-9-]{1,32}$/.test(r.seed)&&Number.isInteger(r.steps)&&r.steps>=1&&r.steps<=fs}function ms(e){if(e.grade!=="medium"||e.grow||e.v<3)return null;let r={...e,grade:"hard",grow:On({grade:"hard"},1)};try{if($e(ir(r)).hides!==$e(ir(e)).hides)return null}catch{return null}return r}function bs(e,r,n=Ze,t=!1,s=Date.now){if(!ps(e))return{made:null,grown:!1,child:null};try{if($e(ir(e)),e.grow){let d=uo(e,r,n).part.found;return{made:d?Fn(d):null,grown:!!d,child:null}}let l=n(ir(e),e.k,r),o=l.found?Fn(l.found):null,u=t&&o?ms(e):null;if(!u)return{made:o,grown:!1,child:null};let i=s(),a=uo(u,r,()=>l),c=s()-i,h=a.climb&&a.climb.kept>0?a.part.found:null;return{made:o,grown:!1,child:h?{tuple:u,made:Fn(h),ms:c}:null}}catch{return{made:null,grown:!1,child:null}}}function io(e,r,n=Ze){return bs(e,r,n).made}var gs=150;function ao(e){let r=null;return{receive(n){try{if(n.type==="bank"){e.post({type:"made",id:n.id,made:so(n.request,e.banks[n.request.grade],n.tries,n.spent)});return}if(n.type==="tuple"){r??=e.known(),e.post({type:"remade",id:n.id,found:io(n.tuple,r)});return}if(n.type!=="part")return;r??=e.known();let t=-1/0,s=lo(n.request,n.part,r,{progress:l=>{let o=e.now();o-t<gs||(t=o,e.post({type:"progress",id:n.id,progress:l}))}});e.post({type:"part",id:n.id,part:n.part,result:s})}catch(t){e.post({type:"failed",id:n.id,message:t instanceof Error?t.message:String(t)})}}}}var co={easy:[{chapter:1,explored:3193,shortest:41,score:26,line:"rrrruurrddddddlldcdrrlluurruuuuuulluurrru",text:`title: 
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
`},{chapter:1,explored:3103,shortest:88,score:111,line:"uurrrrrrrrddddrrddrruurrrrrddddrrrrddddllllddddddrrrruuuullddllllllllzllddlllllluuudddrd",text:`title: 
intro: 

#########################
#...........#.......#.#.#
#.#####.#.#.###.###.#.#.#
#P..#...#.#...#.........#
###...#.#*#####.##.####.#
#.#.#.#.#...#.....=...#.#
#.#.#.#.#.#.#.#.###.#.#.#
#.#.....#.#...#.#.#.#...#
#.#.###.#.#.###.#.#.#.###
#.....#...#...#...#.....#
#.###.#######R#.#.###R#.#
#.....#.........#.....#.#
#######.###.###.#.#####.#
#.....#.M=..............#
#.###.#.###.##.##.#.#####
#...#...#=........#.#...#
#.#.#*#.#.##.####.#.#.#.#
#.#.#.#...#...........#z#
#.###.###.#.###.#.#.###.#
#.#...........#.#.#.....#
######E##################
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
`},{chapter:1,explored:2333,shortest:85,score:124,line:"uuuuuuuuuuuulluullllllllddllllllddlluuddddrrrruurrddrrrruuuuddddlllluullddlllluuuuuuu",text:`title: 
intro: 

#E###################
#.....#.............#
#.#.#####.#######.###
#.#.......#*........#
#.#.###.#.#.#.###.#.#
#...#...#...#...#.#.#
#.###.#.###.#.#.#.#.#
#.....#....*#.#...#.#
#.###########.###.#.#
#.........#.M.#.#.#.#
#.#######.#.###.#.#.#
#.#.....#...#...#...#
###.###.#.###.#####.#
#...#.#~..#.........#
#.#.#.###.#.#######.#
#.#.....#O..#.....~P#
#.#######.###.#######
#.#.......#...#.....#
###.#.#########.###.#
#...#...............#
#####################
`},{chapter:1,explored:21046,shortest:99,score:125,line:"rrwrrrrruurlluurrrruuuulluulluurruuddlldlrdddllwrlrzruuuurruullwllllddllddddlluuddrrrruuulllllluuru",text:`title: 
intro: 

##E##################
#..........M..#...#.#
#.#####.#.###.#.#.#.#
#.......#.#.....#.#.#
#####.#.#.*.#####.#.#
#.#*#.#^#.#.......#.#
#.#.#.#.#.#.#.###.#.#
#.#....*#...#FFF#O..#
#.###########.#.###.#
#.....#...#...#...#.#
#.###.#.#######.###.#
#..............h#...#
#.###.#.###.###.#.###
#.....#...#..z#.....#
#.###.###.##.##.###.#
#.#..P........^.....#
#####################
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
`},{chapter:1,explored:6116,shortest:111,score:139,line:"uurrrddrrruuuullllrrrrddrrrrddrrrrddllddlllldduuuullllddddllrrlllldduuuurruurrrrrrddrrddddllllddrrddllddrrddrrd",text:`title: 
intro: 

#####################
#...#.....#.....#...#
#B#####.#####.#####.#
#.#....b#.#.#...#...#
#######.#.#.#.###.###
#.....#.....#.#b#...#
#.#...#.###.###.###.#
#P#..*....#.......#.#
###.###########.#.#.#
#.....T.........#.#.#
###.#.###.###.#####.#
#.M.#...#.._......#.#
#.###B###.#.#.#.#####
#..>.>#.#u#.#.#.#...#
#.###.#.###.#########
#*#.#.#.....#.......#
#.#.###.#####.###.#.#
#.#...#...........#.#
#####.###.#####.###.#
#.....#...........#.#
#######.#####.#####.#
#.#.#.>.....#.#.#.#.#
#.#.#.#.#.#####.#.###
#...#.#.#.....#.....#
###########E#########
`},{chapter:1,explored:6309,shortest:125,score:160,line:"rrrrrrdddddddddddduuuuuullllwrrrrddddddddddddllllrrrrlluuuullddllddlluuuurruuuuuullrrddddlllldddllddlllluuuuuuuulluulllluuuul",text:`title: 
intro: 

#########################
#.......#.......#P......#
#.###.#.#.#.#.#########.#
#.....#=..#.#.#.T.......#
#####...#####.#####.#.#.#
E.....#=#.....#.....#.#.#
#.#######.###.#.###.#.#.#
#.#.#...#.#.#.#.........#
#.#.#.#.#.#.###.###.###.#
#.....#...#.M..*..#...#.#
###.#.#.#########.#.###.#
#...#.........#...#.....#
#.#.###.#########.#.###.#
#.#...................#.#
#.#####.##.##=###.#####.#
#.#...#.......#.......#.#
#.#.#.#.#.###...###.#.#.#
#...#...#.....#.#.._#.#.#
#.#####.###T###.#.#.#.#.#
#...#.=....*..#...#.....#
#########################
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
`},{chapter:2,explored:11910,shortest:101,score:113,line:"ddddddrrrrrrddrrrruurruurruuuuuulluullllddlluuuuuuluurrrwrrrlllddddddrrddddrrllddrrddrrrrrrddddddllld",text:`title: 
intro: 

#####################
#.......#...#.......#
#.###.#####.#.###.###
#.........F.....~.#.#
#.####.##.#.#####.#~#
#.#.....#.#.....#.#.#
#.#.###.#.##.##...#.#
#.....#.#.......#.#.#
#.###.#.#.###.#.#.###
#.#~#..h#M....#.....#
###.###:#.#.#.###.#.#
#..~F.....#.#.....#.#
###.#.#.###.###.###.#
#P#.#.#......*#.#...#
#.#.#.###.#.###.###.#
#...#.....#...#.#...#
#.#.#####.#.#.#.###.#
#.#...#.....#....F.F#
#.#.###.#.###.#####.#
#.......#.......#.#*#
#.##.##.###.#####.#.#
#.#...#.....#...#.#.#
#.#.#.#.###.#.#.#.#.#
#...#......O..#.....#
################E####
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
`},{chapter:2,explored:22120,shortest:150,score:166,line:"llllddrrddllllllllddddrrddllddddddrrddrruuddddrrrruuudrrrrdduulluuuuuurrwlllluurrllddllddddddulluddddrrrrrrrrrrrrrrlllllluuuddduulluuuuuulllllllluulll",text:`title: 
intro: 

#####################
#...#......P#.......#
#.#.#.#.#####.#.###.#
#.#.#.#.......#.#...#
#.#.#####.#.###.###.#
#.........#.....#.#.#
#.#.##.##.#.#.#.#.#.#
#.#..~.~#...#.#.#.#.#
#.###.#.#########...#
#.....#...#.....:.#.#
###.#.###.#####.#.#.#
E.*O#...#..f#.#.#.#.#
#.#.#####.###.#.#.#.#
#.#*..........#...#.#
#.#.###.###.#.###.###
#.#.#...#...#...#...#
#.###.#.#.#.#######~#
#...#.#...#.#..M....#
###.#...#.#.#.#.###.#
#.#...#.#.....#.#...#
#.###:#.#.###.#.#.###
#.#...............~*#
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
`},{chapter:3,explored:6789,shortest:78,score:112,line:"dddduurrzddrrrrrrrrllwllllrruurrrruduulluuuurruulllllluulllluuuuuurruurrrrrrru",text:`title: 
intro: 

##########E####
#.#......M....#
#.#.##.####.#.#
#*..#...#...#.#
#.###.#.#.#.#.#
#.....#...#...#
#.#.#.#.#.#####
#.#.#...#...#.#
#*#.#.#.###.#.#
#.....#...#.#.#
#####.#.#####.#
#...#.......#.#
#.#####.###.#.#
#...#...#.....#
###.#####.#.###
#.#.....#.#...#
#.###.#...#.#.#
#P..#.#.#..*#.#
#;###...###.#.#
#.....#.....#.#
#.#.###.###.#.#
#z#...........#
###############
`},{chapter:3,explored:5027,shortest:72,score:120,line:"dduulllluuuullllllllrrrrllllddddddddddddrruuuurrrruurlddrrllllllzddddrrd",text:`title: 
intro: 

#######################
#.................#...#
#.###.#.#.#######.#.#.#
#.#...#.#.#.....#...#.#
#.###.#.#.#.###.##.####
#.......#....P#F..;...#
#M###.#######.#.##.####
#...#.#.*...#.#F......#
#.#.#.#.###.#.#.###.#.#
#.#......*..#.=...#=#.#
#.#.#.#.###.#####.#...#
#.#.#.#...#.F.#.#...#.#
#.#.#####F#####.###.#.#
#z....#...............#
#####E#################
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
`},{chapter:3,explored:3032,shortest:119,score:147,line:"wllllrrrrrrrrddrrrruuuulllluuuuuuuuruuuullddlluulllluullddddrrdddrrdrrlluuuulllluuuurrddrrrrddrruurrddddddrrrruuuuuuuur",text:`title: 
intro: 

#################
#.............#|E
#.#.###########.#
#.#.....#...#F#F#
#.#####.#.#>#.#.#
#....*#...#...#.#
###.#;#.###.#.#.#
#...#..>.>:.#.#.#
#.#...###.#.#.#.#
#.#.#..*#.#....h#
#.#.###.#.#######
#.F...#.#.#.#...#
#####.#.#.#.#.###
#.........M.....#
#.#.#####.#######
#.#.#.:.........#
#############.#.#
#....P......#.#.#
#.#####.#>###.#.#
#.......#.......#
#################
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
`},{chapter:5,explored:14904,shortest:112,score:120,line:"uulddddllddwuuddrrdduulluuuuuurrrddrrddddrrrddddrddrrddllllllddrrlluuuuuurrruuuuluuuuuullrrdddllulluulddddlldddl",text:`title: 
intro: 

#################
#...=.#*..#...#.#
#.#.#.###.#.###.#
#.#.#P..#.#...#.#
#.#.###...###.#.#
#...#...#.#...#.#
#.###.#*#.#M#...#
#...#.#.....#.#.#
E;#.#.#.##.##.#.#
#.#.#&#.#-...=.=#
#...#.####.##.#.#
#.#.#.........#.#
#.#.###T###.###.#
#...#...#.#...#.#
#######.#.###...#
#.#...#.......#.#
#.#####.#######.#
#......*._....#.#
#################
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
`},{chapter:5,explored:6482,shortest:150,score:128,line:"rrrrddlddrrrrrrruurruurrdddrruuurruulluuddrrddlldduudddlluuullddlluuuuuulllllluuuulllludrrrrddddrrrrrruuuuuurruuullulllludrrrrdrruuurrrrrrdddddddddddr",text:`title: 
intro: 

#####################
#.........#.........#
#.#.#.#.#.#####.###.#
#.#.#.#.#...#.......#
#.#.#..*###.#.###.#.#
#.....#.....#.#.#.#.#
#.######.##...#.#.#.#
#.#.#.......#.#...#.#
###.#########.#.#.#.#
#.#.....#.#.....#.~.#
#*##.####.#.#####.#.#
#....M..#...#.....#.#
#####.#.#.#.#.#.###.#
#...#.#.#.#.#.#...#.#
#.#.#.###.#.#.#.#.#.E
#.#.#.......#...#...#
#.###.#.###.#.#.#.###
#.#..~#.....#.#....-#
#.###.#.###.####.##.#
#P....#.#.#.#...&...#
#####..~#.#.#.#.#.#.#
#.....#...#...#.#.#.#
#.##.######.###...#.#
#..............O#...#
#####################
`},{chapter:5,explored:6364,shortest:120,score:162,line:"ddrrrruurrddrrddrrrrlllluulluullddlllluuuuuulluuuullllrrrrrruuuuddddrrrrddrrrrddddddddddrrlluuuuuuuurrddddduuuuurrdddddr",text:`title: 
intro: 

#####################
#.........#...#...#.#
#T###.###.#.#.#.#.#.#
#......_M.#.#...#...#
#.###.#.#.#.###.#.#.#
#.....#.#...#.#.#.#.#
###.###.#.###.#.#.#.#
#*...-.h....#.......#
#####.#####.###.###.#
#...................#
#.###.#########F###.#
#.#.....#.#....F..T.#
#.#.#.#.#.###.#F#.#.#
#...#.#.#.....#.#.#.#
#####.#.#######.#.#.#
#.....#P..#...#.#.#.#
#~##.##.###.#.#.#*#.E
#~......^^..#...#&..#
#~##.##.#####.#.#####
#.......#.....#.....#
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
`},{chapter:6,explored:6848,shortest:153,score:112,line:"rrrrrruulllllluurruurrrrrruuuuwuuuuddddddddllllllddlllluullddllddlllluuddrrrruulluuuuuuuuuuduuuurrdrlddrrddddrrrrrrrruuuuuurrrrrrrrrrddddddddddddddllddrd",text:`title: 
intro: 

###########################
#...#.......#.............#
###t..###.#.######.######.#
#...#.*.#.#.#.............#
#.#.#.###.###.#.###.#.###.#
#.#_#..@#.#-..#...#.#.#.#.#
#.#.###...#####.###.#.#.#.#
#M#...#.#.....#.#.#.....#.#
#.#.#.#.###.###.#.#.#.###.#
#.#.#...t.......#...#.#.#.#
#.#.###.#.#.###.#.#.#.#.#.#
#...#..&#.#.....#.#.#...#.#
###.#.###.#.###.###.#####.#
#.#.#.....#.#.........#.#.#
#.#.###.#.#.#.#########.#.#
#*#.....#.....#.........#.#
#.###.#####.###.#########.#
#.....#.#.#...........#...#
#.#.###.#.#######.###.#.###
#.#.#...#..P..........#..@#
########################E##
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
`},{chapter:6,explored:2821,shortest:179,score:127,line:"uuuurrddrrdrruurrrrddrrrrrrrrrrlllllllllluullllddllulluurruurrruuluulluuuulldduurrddddrrrruulluurrrrrrrruuuurrrrddrrrddllllluullddllllllllddrrddllddrddlllddllddrrdrruurrrrddrrrrrd",text:`title: 
intro: 

#########################
#.....#...#...#.........#
#.#.#####.#.#.#.###.###.#
#.#.....#...#.#...#..=..#
#.#=#########F#.#.#####.#
#.....#......F..#....M<*#
#.#.#.#.#############.###
#.#h#.#...#.........#...#
#.###.###.#.#.#####.#.#.#
#.....*...#.#.#.....#&#.#
#######.###.#.#.#####.#.#
#.....#@......#.#.....#.#
#.#.#.##.####.#.#########
#.#.#.........#.....#..-#
#.#.#.#############...###
#.......#.........#.#...#
#.#.#####.###.#.#...#.#.#
#.#...#.......#.#.#.#<#.#
#.#.#=#.###.###.#.#.#.#.#
#P<.#...#@..............#
################E########
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
`},{chapter:7,explored:10549,shortest:91,score:118,line:"llddwwwwddrruuddddrrrrdduulllllwwwruullrrlluuuuuullddllddrrddddddrrrrddlllllllllllllluuuuul",text:`title: 
intro: 
facing: right

#####################
#.........#...#...#.#
#.###.#####.#.#.#.#.#
#...#.......#.;P#.#.#
###.###.#.###.#####.#
#.......#...#.#*....#
#.#.###.###.#.#.###.#
#.#.........#....o..#
E.#.#.#.###M###.###.#
#...#.#.....#.......#
#.###.#####*#.#####.#
#.#.#.#...#.....#...#
#.#.###.#######.#.###
#....*..............#
#####################
`},{chapter:7,explored:28435,shortest:106,score:126,line:"uuuuuurrruuruurrddddrlddddrrrrddrrdzddddduuuuuulluulllluullrrddrrrrddllrrrrddddddlluuddlllllluuuullddddlld",text:`title: 
intro: 
facing: up

###############
#.#.#..z......#
#.#.#.#.###.#.#
#...._#...#.#.#
####.##.###.#.#
#....o..*.....#
#.#.###.#####.#
#.#.#...#.#...#
#.###.#.#.###.#
#....&#......-#
#.###.##t##.###
#P..#...#*....#
#######.#####.#
#.....#.......#
#.#.#.#.#.###.#
#M#.#.#.#.#*#.#
#.#.#.#####.#.#
#...#.........#
#E#############
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
`},{chapter:8,explored:18029,shortest:78,score:118,line:"rrddrrrlrrddrrddrrdddwwwwwwwwwwwdrrrrddddddlllllluuuulluuddrrddddrrrrrrrrrrrrr",text:`title: 
intro: 
facing: down

#########################
#...#.#.......#.....#...#
#.#.#.#.#.#.###.#####.###
#.#...#.#.#.#.#.#.......#
###.###.###.#.#...#######
#..P..#.#...#...#.......#
#####.#####.#.#####.###.#
#.#.#.....#.#...........#
#.#.#####.#.#####.###.#.#
#.#.#...#...#...#.#...#.#
###.#.#.###.#.#.#.###...#
#.....#.#.....#.#.#...#.#
#.#;#######.#.#.#.#####.#
#.#.....#.#.#.#.........#
#.#.###.#.###.#.###.#.#.#
#.#......*.e........#.#.#
#.#######.#####.#.#####.#
#.#...........#.#...M...#
#.#.###.#.#.#####.#.###.#
#.....#.#.#.#.....#.....#
#####.#...#.#.###.#######
#.......#..*............E
#########################
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
`},{chapter:8,explored:13132,shortest:71,score:122,line:"llllllllddrrrrddllddlddllllldduwwwwwwwuudddddddrruurruulllluuuuuuuuuuru",text:`title: 
intro: 
facing: down

##E################
#..h#........P....#
#.###.###########.#
#...#....*..#...#.#
#.#.#.###.#.###.###
#.#.#.#...#.....#.#
#.#####.#.#####.#.#
#.......#...#.....#
#.####.####.#####.#
#.......#.......#.#
#.#####.#.#.#.#.###
#..*;.#...#.#.#.#.#
#.###.###.#.#.#.#.#
#w#...#.......#.M.#
#.#.###.#######.###
#...#...#.....#...#
#####.###.###.###.#
#...............#.#
###################
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
`},{chapter:8,explored:12179,shortest:44,score:133,line:"uurruwdddddllrrllrruuuuuulluurrllrruurrrrrru",text:`title: 
intro: 
facing: left

#########E###############
#.#*.....M........#.....#
#.#.#.###.###.#.###.###.#
#...#.#.......#...#...#.#
#.###.#.#######.#.###.#.#
#.....#.........#.#...#.#
###.###.#.#####...#.#.###
#...#...#.#.....#...#.#.#
#.#.#.#####.#.#######.#.#
#P#*#...#...#...#.#...#.#
#.#.###.#.#####.#.#.###.#
#.....#.....#...#.#.#...#
###.#.#####.#.###.#.###.#
#...#.......#.....#...#.#
#.#######.#.#.#.#.###.#.#
#.#.......#...#.#...#...#
#.#.#######.#.#.#.#.###.#
#.......#...#...#.#...#.#
#.#####.#.#.#.#.#.###.#.#
#.#....w..#.#.#.#.#...#.#
#.#.#.###.#.#.#.#.#.#.#.#
#...#.....#...#.....#...#
#########################
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
`},{chapter:9,explored:6506,shortest:50,score:110,line:"llddllldwdrdurrrrddlllwwlllllddddddllllllddddrrrrd",text:`title: 
intro: 
facing: down

#####################
#...#.......#.......#
#.#.#.#####.#.###.###
#.#...#............P#
#.#####.###.##.##.###
#.........#......*..#
#M###.#.#.#.##.##.###
#.....#.#e..........#
###.#####.#####.###.#
#.......#.#......*..#
#.###.#.###.#.#######
#...#.#.#.#.#...#...#
#.###.###.#.#.#.#.#.#
#.#.....#.#...#...#.#
#...###.#.#.###.#.#.#
#.#.#.......#...#.#.#
#.#..$###.###.#...#.#
#.#.#.....#...#.#.#.#
###.#.#######.#.#.#.#
#........|..#...#...#
#########E###########
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
`},{chapter:9,explored:16029,shortest:102,score:116,line:"ddllwrrlluullddlllllluuuuuuurrurruurrrrddlllllldlldllduuuuuuuuuwdduuuurrrrrrddrrrrlllluulllllldddddddl",text:`title: 
intro: 
facing: down

#####################
#M............#.....#
#.###.#.#####.#.###.#
#...#v#....*..#.#...#
#.###.#.###.###.#####
#.#@#...#..o....#...#
#.###.###.#######.#.#
#.#...#...$*..#...#.#
E.#.###.###.###.###.#
#.#.#@......#...#...#
#.#...###########.###
#...#...#.v.#.......#
#*#.###.#.#.#.#######
#.#.#...#.#.#.....#.#
#...#######.#.###.#.#
#.#.#...#...#P..#...#
#.#.###.#.#.#.#.###.#
#.#.......#...#.....#
#####################
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
`}]};var ho=[{id:"trial-1",text:`title: The Mouth of the Labyrinth
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
`}];var fo=[{id:"ch2-1",text:`title: The Loose Stone
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
`}];var po=[{id:"ch3-1",text:`title: The Rising Floor
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
`}];var mo=[{id:"ch4-1",text:`title: The Wall That Gives
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
`}];var bo=[{id:"ch5-1",text:`title: The Snare
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
`}];var go=[{id:"ch6-1",text:`title: The Teleport
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
`}];var wo=[{id:"ch7-1",text:`title: The Bronze Ball
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
`}];var yo=[{id:"ch8-1",text:`title: The Harpy
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
`}];var xo=[{id:"ch9-1",text:`title: The Thief
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
`}];var ko=[{id:"ch10-1",text:`title: The Wooden Cow
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
`}];var ws=[...ho,...fo,...po,...mo,...bo,...go,...wo,...yo,...xo,...ko];function Mo(){return ws.map(e=>W(e.text))}var ys=ao({post:e=>self.postMessage(e),banks:co,known:()=>Vt(Mo()),now:()=>performance.now()});self.onmessage=e=>ys.receive(e.data);})();
//# sourceMappingURL=endless-worker.js.map
