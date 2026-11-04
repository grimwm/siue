/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
"use strict";(()=>{var nu=0,fl=1,iu=2;var Hc=1,ru=2,An=3,Zn=0,At=1,Nt=2;var Wn=0,Xi=1,fi=2,pl=3,ml=4,su=5,li=100,ou=101,au=102,gl=103,_l=104,lu=200,cu=201,hu=202,uu=203,Ko=204,Jo=205,du=206,fu=207,pu=208,mu=209,gu=210,_u=211,xu=212,yu=213,vu=214,Mu=0,bu=1,Su=2,gs=3,wu=4,Eu=5,Ba=6,Tu=7,Wc=0,Au=1,Ru=2,Xn=0,Cu=1,Pu=2,Iu=3,za=4,Lu=5,Du=6;var Xc=300,Zi=301,Ki=302,$o=303,jo=304,Ks=306,Kn=1e3,vt=1001,Qo=1002,zt=1003,xl=1004;var fo=1005;var tn=1006,Uu=1007;var Mr=1008;var qn=1009,Nu=1010,Ou=1011,ka=1012,qc=1013,Vn=1014,Hn=1015,br=1016,Yc=1017,Zc=1018,hi=1020,Fu=1021,hn=1023,Bu=1024,zu=1025,ui=1026,Ji=1027,ku=1028,Kc=1029,Gu=1030,Jc=1031,$c=1033,po=33776,mo=33777,go=33778,_o=33779,yl=35840,vl=35841,Ml=35842,bl=35843,jc=36196,Sl=37492,wl=37496,El=37808,Tl=37809,Al=37810,Rl=37811,Cl=37812,Pl=37813,Il=37814,Ll=37815,Dl=37816,Ul=37817,Nl=37818,Ol=37819,Fl=37820,Bl=37821,xo=36492,zl=36494,kl=36495,Vu=36283,Gl=36284,Vl=36285,Hl=36286;var _s=2300,xs=2301,yo=2302,Wl=2400,Xl=2401,ql=2402;var Qc=3e3,di=3001,Hu=3200,Wu=3201,eh=0,Xu=1,nn="",ut="srgb",Pn="srgb-linear",Ga="display-p3",Js="display-p3-linear",ys="linear",st="srgb",vs="rec709",Ms="p3";var wi=7680,th=7681;var nh=517;var Yl=519,qu=512,Yu=513,Zu=514,ih=515,Ku=516,Ju=517,$u=518,ju=519,Zl=35044;var Kl="300 es",ea=1035,Cn=2e3,bs=2001,Jn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Lt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var vo=Math.PI/180,ta=180/Math.PI;function rr(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Lt[i&255]+Lt[i>>8&255]+Lt[i>>16&255]+Lt[i>>24&255]+"-"+Lt[e&255]+Lt[e>>8&255]+"-"+Lt[e>>16&15|64]+Lt[e>>24&255]+"-"+Lt[t&63|128]+Lt[t>>8&255]+"-"+Lt[t>>16&255]+Lt[t>>24&255]+Lt[n&255]+Lt[n>>8&255]+Lt[n>>16&255]+Lt[n>>24&255]).toLowerCase()}function Pt(i,e,t){return Math.max(e,Math.min(t,i))}function Qu(i,e){return(i%e+e)%e}function Mo(i,e,t){return(1-t)*i+t*e}function Jl(i){return(i&i-1)===0&&i!==0}function na(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function cr(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Xt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var J=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Pt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ke=class i{constructor(e,t,n,r,s,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=r,h[2]=a,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],g=n[8],_=r[0],m=r[3],f=r[6],y=r[1],x=r[4],S=r[7],C=r[2],T=r[5],A=r[8];return s[0]=o*_+a*y+l*C,s[3]=o*m+a*x+l*T,s[6]=o*f+a*S+l*A,s[1]=c*_+h*y+u*C,s[4]=c*m+h*x+u*T,s[7]=c*f+h*S+u*A,s[2]=d*_+p*y+g*C,s[5]=d*m+p*x+g*T,s[8]=d*f+p*S+g*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*s*h+n*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*s,p=c*s-o*l,g=t*u+n*d+r*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=u*_,e[1]=(r*c-h*n)*_,e[2]=(a*n-r*o)*_,e[3]=d*_,e[4]=(h*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*s)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(bo.makeScale(e,t)),this}rotate(e){return this.premultiply(bo.makeRotation(-e)),this}translate(e,t){return this.premultiply(bo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},bo=new Ke;function rh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ss(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ed(){let i=Ss("canvas");return i.style.display="block",i}var $l={};function _r(i){i in $l||($l[i]=!0,console.warn(i))}var jl=new Ke().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ql=new Ke().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Hr={[Pn]:{transfer:ys,primaries:vs,toReference:i=>i,fromReference:i=>i},[ut]:{transfer:st,primaries:vs,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Js]:{transfer:ys,primaries:Ms,toReference:i=>i.applyMatrix3(Ql),fromReference:i=>i.applyMatrix3(jl)},[Ga]:{transfer:st,primaries:Ms,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Ql),fromReference:i=>i.applyMatrix3(jl).convertLinearToSRGB()}},td=new Set([Pn,Js]),tt={enabled:!0,_workingColorSpace:Pn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!td.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;let n=Hr[e].toReference,r=Hr[t].fromReference;return r(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return Hr[i].primaries},getTransfer:function(i){return i===nn?ys:Hr[i].transfer}};function qi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function So(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ei,ws=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ei===void 0&&(Ei=Ss("canvas")),Ei.width=e.width,Ei.height=e.height;let n=Ei.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ei}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ss("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=qi(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(qi(t[n]/255)*255):t[n]=qi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},nd=0,Es=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:nd++}),this.uuid=rr(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(wo(r[o].image)):s.push(wo(r[o]))}else s=wo(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function wo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ws.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var id=0,rn=class i extends Jn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=vt,r=vt,s=tn,o=Mr,a=hn,l=qn,c=i.DEFAULT_ANISOTROPY,h=nn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:id++}),this.uuid=rr(),this.name="",this.source=new Es(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new J(0,0),this.repeat=new J(1,1),this.center=new J(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(_r("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===di?ut:nn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Xc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Kn:e.x=e.x-Math.floor(e.x);break;case vt:e.x=e.x<0?0:1;break;case Qo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Kn:e.y=e.y-Math.floor(e.y);break;case vt:e.y=e.y<0?0:1;break;case Qo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return _r("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===ut?di:Qc}set encoding(e){_r("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===di?ut:nn}};rn.DEFAULT_IMAGE=null;rn.DEFAULT_MAPPING=Xc;rn.DEFAULT_ANISOTROPY=1;var lt=class i{constructor(e=0,t=0,n=0,r=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],g=l[9],_=l[2],m=l[6],f=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,S=(p+1)/2,C=(f+1)/2,T=(h+d)/4,A=(u+_)/4,D=(g+m)/4;return x>S&&x>C?x<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(x),r=T/n,s=A/n):S>C?S<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(S),n=T/r,s=D/r):C<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(C),n=A/s,r=D/s),this.set(n,r,s,t),this}let y=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-_)/y,this.z=(d-h)/y,this.w=Math.acos((c+p+f-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ia=class extends Jn{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new lt(0,0,e,t),this.scissorTest=!1,this.viewport=new lt(0,0,e,t);let r={width:e,height:t,depth:1};n.encoding!==void 0&&(_r("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===di?ut:nn),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:tn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new rn(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new Es(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},In=class extends ia{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ts=class extends rn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=zt,this.minFilter=zt,this.wrapR=vt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ra=class extends rn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=zt,this.minFilter=zt,this.wrapR=vt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var $n=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],h=n[r+2],u=n[r+3],d=s[o+0],p=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=p,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==d||c!==p||h!==g){let m=1-a,f=l*d+c*p+h*g+u*_,y=f>=0?1:-1,x=1-f*f;if(x>Number.EPSILON){let C=Math.sqrt(x),T=Math.atan2(C,f*y);m=Math.sin(m*T)/C,a=Math.sin(a*T)/C}let S=a*y;if(l=l*m+d*S,c=c*m+p*S,h=h*m+g*S,u=u*m+_*S,m===1-a){let C=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=C,c*=C,h*=C,u*=C}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,s,o){let a=n[r],l=n[r+1],c=n[r+2],h=n[r+3],u=s[o],d=s[o+1],p=s[o+2],g=s[o+3];return e[t]=a*g+h*u+l*p-c*d,e[t+1]=l*g+h*d+c*u-a*p,e[t+2]=c*g+h*p+a*d-l*u,e[t+3]=h*g-a*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(r/2),u=a(s/2),d=l(n/2),p=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"YZX":this._x=d*h*u+c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u-d*p*g;break;case"XZY":this._x=d*h*u-c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(s-c)*p,this._z=(o-r)*p}else if(n>a&&n>u){let p=2*Math.sqrt(1+n-a-u);this._w=(h-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+c)/p}else if(a>u){let p=2*Math.sqrt(1+a-n-u);this._w=(s-c)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-a);this._w=(o-r)/p,this._x=(s+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Pt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+r*c-s*l,this._y=r*h+o*l+s*a-n*c,this._z=s*h+o*c+n*l-r*a,this._w=o*h-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*r+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=s*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(r),n*Math.sin(s),n*Math.cos(s),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},R=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ec.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ec.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),h=2*(a*t-s*r),u=2*(s*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-s*u,this.z=r+l*u+s*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Eo.copy(this).projectOnVector(e),this.sub(Eo)}reflect(e){return this.sub(Eo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Pt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Eo=new R,ec=new $n,un=class{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(an.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(an.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=an.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,an):an.fromBufferAttribute(s,o),an.applyMatrix4(e.matrixWorld),this.expandByPoint(an);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Wr.copy(n.boundingBox)),Wr.applyMatrix4(e.matrixWorld),this.union(Wr)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,an),an.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(hr),Xr.subVectors(this.max,hr),Ti.subVectors(e.a,hr),Ai.subVectors(e.b,hr),Ri.subVectors(e.c,hr),Fn.subVectors(Ai,Ti),Bn.subVectors(Ri,Ai),ii.subVectors(Ti,Ri);let t=[0,-Fn.z,Fn.y,0,-Bn.z,Bn.y,0,-ii.z,ii.y,Fn.z,0,-Fn.x,Bn.z,0,-Bn.x,ii.z,0,-ii.x,-Fn.y,Fn.x,0,-Bn.y,Bn.x,0,-ii.y,ii.x,0];return!To(t,Ti,Ai,Ri,Xr)||(t=[1,0,0,0,1,0,0,0,1],!To(t,Ti,Ai,Ri,Xr))?!1:(qr.crossVectors(Fn,Bn),t=[qr.x,qr.y,qr.z],To(t,Ti,Ai,Ri,Xr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,an).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(an).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(bn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},bn=[new R,new R,new R,new R,new R,new R,new R,new R],an=new R,Wr=new un,Ti=new R,Ai=new R,Ri=new R,Fn=new R,Bn=new R,ii=new R,hr=new R,Xr=new R,qr=new R,ri=new R;function To(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){ri.fromArray(i,s);let a=r.x*Math.abs(ri.x)+r.y*Math.abs(ri.y)+r.z*Math.abs(ri.z),l=e.dot(ri),c=t.dot(ri),h=n.dot(ri);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var rd=new un,ur=new R,Ao=new R,Ln=class{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):rd.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ur.subVectors(e,this.center);let t=ur.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(ur,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ao.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ur.copy(e.center).add(Ao)),this.expandByPoint(ur.copy(e.center).sub(Ao))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Sn=new R,Ro=new R,Yr=new R,zn=new R,Co=new R,Zr=new R,Po=new R,sa=class{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Sn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Sn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Sn.copy(this.origin).addScaledVector(this.direction,t),Sn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Ro.copy(e).add(t).multiplyScalar(.5),Yr.copy(t).sub(e).normalize(),zn.copy(this.origin).sub(Ro);let s=e.distanceTo(t)*.5,o=-this.direction.dot(Yr),a=zn.dot(this.direction),l=-zn.dot(Yr),c=zn.lengthSq(),h=Math.abs(1-o*o),u,d,p,g;if(h>0)if(u=o*l-a,d=o*a-l,g=s*h,u>=0)if(d>=-g)if(d<=g){let _=1/h;u*=_,d*=_,p=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=s,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;else d=-s,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*s+a)),d=u>0?-s:Math.min(Math.max(-s,-l),s),p=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-s,-l),s),p=d*(d+2*l)+c):(u=Math.max(0,-(o*s+a)),d=u>0?s:Math.min(Math.max(-s,-l),s),p=-u*u+d*(d+2*l)+c);else d=o>0?-s:s,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Ro).addScaledVector(Yr,d),p}intersectSphere(e,t){Sn.subVectors(e.center,this.origin);let n=Sn.dot(this.direction),r=Sn.dot(Sn)-n*n,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),h>=0?(s=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(s=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Sn)!==null}intersectTriangle(e,t,n,r,s){Co.subVectors(t,e),Zr.subVectors(n,e),Po.crossVectors(Co,Zr);let o=this.direction.dot(Po),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;zn.subVectors(this.origin,e);let l=a*this.direction.dot(Zr.crossVectors(zn,Zr));if(l<0)return null;let c=a*this.direction.dot(Co.cross(zn));if(c<0||l+c>o)return null;let h=-a*zn.dot(Po);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ot=class i{constructor(e,t,n,r,s,o,a,l,c,h,u,d,p,g,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,h,u,d,p,g,_,m)}set(e,t,n,r,s,o,a,l,c,h,u,d,p,g,_,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=r,f[1]=s,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=h,f[10]=u,f[14]=d,f[3]=p,f[7]=g,f[11]=_,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Ci.setFromMatrixColumn(e,0).length(),s=1/Ci.setFromMatrixColumn(e,1).length(),o=1/Ci.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){let d=o*h,p=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=g+p*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*h,p=l*u,g=c*h,_=c*u;t[0]=d+_*a,t[4]=g*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=p*a-g,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*h,p=l*u,g=c*h,_=c*u;t[0]=d-_*a,t[4]=-o*u,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*h,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*h,p=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=g*c-p,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=p*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,p=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=_-d*u,t[8]=g*u+p,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=p*u+g,t[10]=d-_*u}else if(e.order==="XZY"){let d=o*l,p=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=o*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=a*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(sd,e,od)}lookAt(e,t,n){let r=this.elements;return Zt.subVectors(e,t),Zt.lengthSq()===0&&(Zt.z=1),Zt.normalize(),kn.crossVectors(n,Zt),kn.lengthSq()===0&&(Math.abs(n.z)===1?Zt.x+=1e-4:Zt.z+=1e-4,Zt.normalize(),kn.crossVectors(n,Zt)),kn.normalize(),Kr.crossVectors(Zt,kn),r[0]=kn.x,r[4]=Kr.x,r[8]=Zt.x,r[1]=kn.y,r[5]=Kr.y,r[9]=Zt.y,r[2]=kn.z,r[6]=Kr.z,r[10]=Zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],g=n[2],_=n[6],m=n[10],f=n[14],y=n[3],x=n[7],S=n[11],C=n[15],T=r[0],A=r[4],D=r[8],M=r[12],b=r[1],U=r[5],H=r[9],j=r[13],I=r[2],F=r[6],V=r[10],Z=r[14],K=r[3],X=r[7],ie=r[11],re=r[15];return s[0]=o*T+a*b+l*I+c*K,s[4]=o*A+a*U+l*F+c*X,s[8]=o*D+a*H+l*V+c*ie,s[12]=o*M+a*j+l*Z+c*re,s[1]=h*T+u*b+d*I+p*K,s[5]=h*A+u*U+d*F+p*X,s[9]=h*D+u*H+d*V+p*ie,s[13]=h*M+u*j+d*Z+p*re,s[2]=g*T+_*b+m*I+f*K,s[6]=g*A+_*U+m*F+f*X,s[10]=g*D+_*H+m*V+f*ie,s[14]=g*M+_*j+m*Z+f*re,s[3]=y*T+x*b+S*I+C*K,s[7]=y*A+x*U+S*F+C*X,s[11]=y*D+x*H+S*V+C*ie,s[15]=y*M+x*j+S*Z+C*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14],g=e[3],_=e[7],m=e[11],f=e[15];return g*(+s*l*u-r*c*u-s*a*d+n*c*d+r*a*p-n*l*p)+_*(+t*l*p-t*c*d+s*o*d-r*o*p+r*c*h-s*l*h)+m*(+t*c*u-t*a*p-s*o*u+n*o*p+s*a*h-n*c*h)+f*(-r*a*h-t*l*u+t*a*d+r*o*u-n*o*d+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],g=e[12],_=e[13],m=e[14],f=e[15],y=u*m*c-_*d*c+_*l*p-a*m*p-u*l*f+a*d*f,x=g*d*c-h*m*c-g*l*p+o*m*p+h*l*f-o*d*f,S=h*_*c-g*u*c+g*a*p-o*_*p-h*a*f+o*u*f,C=g*u*l-h*_*l-g*a*d+o*_*d+h*a*m-o*u*m,T=t*y+n*x+r*S+s*C;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/T;return e[0]=y*A,e[1]=(_*d*s-u*m*s-_*r*p+n*m*p+u*r*f-n*d*f)*A,e[2]=(a*m*s-_*l*s+_*r*c-n*m*c-a*r*f+n*l*f)*A,e[3]=(u*l*s-a*d*s-u*r*c+n*d*c+a*r*p-n*l*p)*A,e[4]=x*A,e[5]=(h*m*s-g*d*s+g*r*p-t*m*p-h*r*f+t*d*f)*A,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*f-t*l*f)*A,e[7]=(o*d*s-h*l*s+h*r*c-t*d*c-o*r*p+t*l*p)*A,e[8]=S*A,e[9]=(g*u*s-h*_*s-g*n*p+t*_*p+h*n*f-t*u*f)*A,e[10]=(o*_*s-g*a*s+g*n*c-t*_*c-o*n*f+t*a*f)*A,e[11]=(h*a*s-o*u*s-h*n*c+t*u*c+o*n*p-t*a*p)*A,e[12]=C*A,e[13]=(h*_*r-g*u*r+g*n*d-t*_*d-h*n*m+t*u*m)*A,e[14]=(g*a*r-o*_*r-g*n*l+t*_*l+o*n*m-t*a*m)*A,e[15]=(o*u*r-h*a*r+h*n*l-t*u*l-o*n*d+t*a*d)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,h=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,h*a+n,h*l-r*o,0,c*l-r*a,h*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,h=o+o,u=a+a,d=s*c,p=s*h,g=s*u,_=o*h,m=o*u,f=a*u,y=l*c,x=l*h,S=l*u,C=n.x,T=n.y,A=n.z;return r[0]=(1-(_+f))*C,r[1]=(p+S)*C,r[2]=(g-x)*C,r[3]=0,r[4]=(p-S)*T,r[5]=(1-(d+f))*T,r[6]=(m+y)*T,r[7]=0,r[8]=(g+x)*A,r[9]=(m-y)*A,r[10]=(1-(d+_))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,s=Ci.set(r[0],r[1],r[2]).length(),o=Ci.set(r[4],r[5],r[6]).length(),a=Ci.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],ln.copy(this);let c=1/s,h=1/o,u=1/a;return ln.elements[0]*=c,ln.elements[1]*=c,ln.elements[2]*=c,ln.elements[4]*=h,ln.elements[5]*=h,ln.elements[6]*=h,ln.elements[8]*=u,ln.elements[9]*=u,ln.elements[10]*=u,t.setFromRotationMatrix(ln),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=Cn){let l=this.elements,c=2*s/(t-e),h=2*s/(n-r),u=(t+e)/(t-e),d=(n+r)/(n-r),p,g;if(a===Cn)p=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===bs)p=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=Cn){let l=this.elements,c=1/(t-e),h=1/(n-r),u=1/(o-s),d=(t+e)*c,p=(n+r)*h,g,_;if(a===Cn)g=(o+s)*u,_=-2*u;else if(a===bs)g=s*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Ci=new R,ln=new ot,sd=new R(0,0,0),od=new R(1,1,1),kn=new R,Kr=new R,Zt=new R,tc=new ot,nc=new $n,As=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],h=r[9],u=r[2],d=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(Pt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Pt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Pt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Pt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Pt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Pt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return tc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(tc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return nc.setFromEuler(this),this.setFromQuaternion(nc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};As.DEFAULT_ORDER="XYZ";var Rs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},ad=0,ic=new R,Pi=new $n,wn=new ot,Jr=new R,dr=new R,ld=new R,cd=new $n,rc=new R(1,0,0),sc=new R(0,1,0),oc=new R(0,0,1),hd={type:"added"},ud={type:"removed"},Gt=class i extends Jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ad++}),this.uuid=rr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new R,t=new As,n=new $n,r=new R(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ot},normalMatrix:{value:new Ke}}),this.matrix=new ot,this.matrixWorld=new ot,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Rs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Pi.setFromAxisAngle(e,t),this.quaternion.multiply(Pi),this}rotateOnWorldAxis(e,t){return Pi.setFromAxisAngle(e,t),this.quaternion.premultiply(Pi),this}rotateX(e){return this.rotateOnAxis(rc,e)}rotateY(e){return this.rotateOnAxis(sc,e)}rotateZ(e){return this.rotateOnAxis(oc,e)}translateOnAxis(e,t){return ic.copy(e).applyQuaternion(this.quaternion),this.position.add(ic.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(rc,e)}translateY(e){return this.translateOnAxis(sc,e)}translateZ(e){return this.translateOnAxis(oc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(wn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Jr.copy(e):Jr.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),dr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?wn.lookAt(dr,Jr,this.up):wn.lookAt(Jr,dr,this.up),this.quaternion.setFromRotationMatrix(wn),r&&(wn.extractRotation(r.matrixWorld),Pi.setFromRotationMatrix(wn),this.quaternion.premultiply(Pi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(hd)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ud)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),wn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),wn.multiply(e.parent.matrixWorld)),e.applyMatrix4(wn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dr,e,ld),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dr,cd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++){let s=t[n];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++){let a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}};Gt.DEFAULT_UP=new R(0,1,0);Gt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var cn=new R,En=new R,Io=new R,Tn=new R,Ii=new R,Li=new R,ac=new R,Lo=new R,Do=new R,Uo=new R,$r=!1,Gi=class i{constructor(e=new R,t=new R,n=new R){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),cn.subVectors(e,t),r.cross(cn);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){cn.subVectors(r,t),En.subVectors(n,t),Io.subVectors(e,t);let o=cn.dot(cn),a=cn.dot(En),l=cn.dot(Io),c=En.dot(En),h=En.dot(Io),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;let d=1/u,p=(c*l-a*h)*d,g=(o*h-a*l)*d;return s.set(1-p-g,g,p)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Tn)===null?!1:Tn.x>=0&&Tn.y>=0&&Tn.x+Tn.y<=1}static getUV(e,t,n,r,s,o,a,l){return $r===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),$r=!0),this.getInterpolation(e,t,n,r,s,o,a,l)}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,Tn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Tn.x),l.addScaledVector(o,Tn.y),l.addScaledVector(a,Tn.z),l)}static isFrontFacing(e,t,n,r){return cn.subVectors(n,t),En.subVectors(e,t),cn.cross(En).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return cn.subVectors(this.c,this.b),En.subVectors(this.a,this.b),cn.cross(En).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,r,s){return $r===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),$r=!0),i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,o,a;Ii.subVectors(r,n),Li.subVectors(s,n),Lo.subVectors(e,n);let l=Ii.dot(Lo),c=Li.dot(Lo);if(l<=0&&c<=0)return t.copy(n);Do.subVectors(e,r);let h=Ii.dot(Do),u=Li.dot(Do);if(h>=0&&u<=h)return t.copy(r);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(Ii,o);Uo.subVectors(e,s);let p=Ii.dot(Uo),g=Li.dot(Uo);if(g>=0&&p<=g)return t.copy(s);let _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Li,a);let m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return ac.subVectors(s,r),a=(u-h)/(u-h+(p-g)),t.copy(r).addScaledVector(ac,a);let f=1/(m+_+d);return o=_*f,a=d*f,t.copy(n).addScaledVector(Ii,o).addScaledVector(Li,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},sh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gn={h:0,s:0,l:0},jr={h:0,s:0,l:0};function No(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Je=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ut){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=tt.workingColorSpace){return this.r=e,this.g=t,this.b=n,tt.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=tt.workingColorSpace){if(e=Qu(e,1),t=Pt(t,0,1),n=Pt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=No(o,s,e+1/3),this.g=No(o,s,e),this.b=No(o,s,e-1/3)}return tt.toWorkingColorSpace(this,r),this}setStyle(e,t=ut){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ut){let n=sh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qi(e.r),this.g=qi(e.g),this.b=qi(e.b),this}copyLinearToSRGB(e){return this.r=So(e.r),this.g=So(e.g),this.b=So(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ut){return tt.fromWorkingColorSpace(Dt.copy(this),e),Math.round(Pt(Dt.r*255,0,255))*65536+Math.round(Pt(Dt.g*255,0,255))*256+Math.round(Pt(Dt.b*255,0,255))}getHexString(e=ut){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.fromWorkingColorSpace(Dt.copy(this),t);let n=Dt.r,r=Dt.g,s=Dt.b,o=Math.max(n,r,s),a=Math.min(n,r,s),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(r-s)/u+(r<s?6:0);break;case r:l=(s-n)/u+2;break;case s:l=(n-r)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=tt.workingColorSpace){return tt.fromWorkingColorSpace(Dt.copy(this),t),e.r=Dt.r,e.g=Dt.g,e.b=Dt.b,e}getStyle(e=ut){tt.fromWorkingColorSpace(Dt.copy(this),e);let t=Dt.r,n=Dt.g,r=Dt.b;return e!==ut?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Gn),this.setHSL(Gn.h+e,Gn.s+t,Gn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Gn),e.getHSL(jr);let n=Mo(Gn.h,jr.h,t),r=Mo(Gn.s,jr.s,t),s=Mo(Gn.l,jr.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Dt=new Je;Je.NAMES=sh;var dd=0,pi=class extends Jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dd++}),this.uuid=rr(),this.name="",this.type="Material",this.blending=Xi,this.side=Zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ko,this.blendDst=Jo,this.blendEquation=li,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Je(0,0,0),this.blendAlpha=0,this.depthFunc=gs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Yl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wi,this.stencilZFail=wi,this.stencilZPass=wi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Xi&&(n.blending=this.blending),this.side!==Zn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ko&&(n.blendSrc=this.blendSrc),this.blendDst!==Jo&&(n.blendDst=this.blendDst),this.blendEquation!==li&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==gs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Yl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==wi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==wi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==wi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ft=class extends pi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Je(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Wc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var xt=new R,Qr=new J,kt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Zl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Hn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Qr.fromBufferAttribute(this,t),Qr.applyMatrix3(e),this.setXY(t,Qr.x,Qr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix3(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix4(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.applyNormalMatrix(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)xt.fromBufferAttribute(this,t),xt.transformDirection(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=cr(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Xt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=cr(t,this.array)),t}setX(e,t){return this.normalized&&(t=Xt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=cr(t,this.array)),t}setY(e,t){return this.normalized&&(t=Xt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=cr(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Xt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=cr(t,this.array)),t}setW(e,t){return this.normalized&&(t=Xt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Xt(t,this.array),n=Xt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Xt(t,this.array),n=Xt(n,this.array),r=Xt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=Xt(t,this.array),n=Xt(n,this.array),r=Xt(r,this.array),s=Xt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Zl&&(e.usage=this.usage),e}};var Cs=class extends kt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ps=class extends kt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Be=class extends kt{constructor(e,t,n){super(new Float32Array(e),t,n)}};var fd=0,en=new ot,Oo=new Gt,Di=new R,Kt=new un,fr=new un,Tt=new R,_t=class i extends Jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:fd++}),this.uuid=rr(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(rh(e)?Ps:Cs)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new Ke().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return en.makeRotationFromQuaternion(e),this.applyMatrix4(en),this}rotateX(e){return en.makeRotationX(e),this.applyMatrix4(en),this}rotateY(e){return en.makeRotationY(e),this.applyMatrix4(en),this}rotateZ(e){return en.makeRotationZ(e),this.applyMatrix4(en),this}translate(e,t,n){return en.makeTranslation(e,t,n),this.applyMatrix4(en),this}scale(e,t,n){return en.makeScale(e,t,n),this.applyMatrix4(en),this}lookAt(e){return Oo.lookAt(e),Oo.updateMatrix(),this.applyMatrix4(Oo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Di).negate(),this.translate(Di.x,Di.y,Di.z),this}setFromPoints(e){let t=[];for(let n=0,r=e.length;n<r;n++){let s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Be(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new un);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];Kt.setFromBufferAttribute(s),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,Kt.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,Kt.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint(Kt.min),this.boundingBox.expandByPoint(Kt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ln);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new R,1/0);return}if(e){let n=this.boundingSphere.center;if(Kt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];fr.setFromBufferAttribute(a),this.morphTargetsRelative?(Tt.addVectors(Kt.min,fr.min),Kt.expandByPoint(Tt),Tt.addVectors(Kt.max,fr.max),Kt.expandByPoint(Tt)):(Kt.expandByPoint(fr.min),Kt.expandByPoint(fr.max))}Kt.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)Tt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(Tt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Tt.fromBufferAttribute(a,c),l&&(Di.fromBufferAttribute(e,c),Tt.add(Di)),r=Math.max(r,n.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.array,r=t.position.array,s=t.normal.array,o=t.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new kt(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],h=[];for(let b=0;b<a;b++)c[b]=new R,h[b]=new R;let u=new R,d=new R,p=new R,g=new J,_=new J,m=new J,f=new R,y=new R;function x(b,U,H){u.fromArray(r,b*3),d.fromArray(r,U*3),p.fromArray(r,H*3),g.fromArray(o,b*2),_.fromArray(o,U*2),m.fromArray(o,H*2),d.sub(u),p.sub(u),_.sub(g),m.sub(g);let j=1/(_.x*m.y-m.x*_.y);isFinite(j)&&(f.copy(d).multiplyScalar(m.y).addScaledVector(p,-_.y).multiplyScalar(j),y.copy(p).multiplyScalar(_.x).addScaledVector(d,-m.x).multiplyScalar(j),c[b].add(f),c[U].add(f),c[H].add(f),h[b].add(y),h[U].add(y),h[H].add(y))}let S=this.groups;S.length===0&&(S=[{start:0,count:n.length}]);for(let b=0,U=S.length;b<U;++b){let H=S[b],j=H.start,I=H.count;for(let F=j,V=j+I;F<V;F+=3)x(n[F+0],n[F+1],n[F+2])}let C=new R,T=new R,A=new R,D=new R;function M(b){A.fromArray(s,b*3),D.copy(A);let U=c[b];C.copy(U),C.sub(A.multiplyScalar(A.dot(U))).normalize(),T.crossVectors(D,U);let j=T.dot(h[b])<0?-1:1;l[b*4]=C.x,l[b*4+1]=C.y,l[b*4+2]=C.z,l[b*4+3]=j}for(let b=0,U=S.length;b<U;++b){let H=S[b],j=H.start,I=H.count;for(let F=j,V=j+I;F<V;F+=3)M(n[F+0]),M(n[F+1]),M(n[F+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new kt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);let r=new R,s=new R,o=new R,a=new R,l=new R,c=new R,h=new R,u=new R;if(e)for(let d=0,p=e.count;d<p;d+=3){let g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Tt.fromBufferAttribute(e,t),Tt.normalize(),e.setXYZ(t,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),p=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?p=l[_]*a.data.stride+a.offset:p=l[_]*h;for(let f=0;f<h;f++)d[g++]=c[p++]}return new kt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,n);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],p=e(d,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let r=e.attributes;for(let c in r){let h=r[c];this.setAttribute(c,h.clone(t))}let s=e.morphAttributes;for(let c in s){let h=[],u=s[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},lc=new ot,si=new sa,es=new Ln,cc=new R,Ui=new R,Ni=new R,Oi=new R,Fo=new R,ts=new R,ns=new J,is=new J,rs=new J,hc=new R,uc=new R,dc=new R,ss=new R,os=new R,ae=class extends Gt{constructor(e=new _t,t=new ft){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){ts.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=a[l],u=s[l];h!==0&&(Fo.fromBufferAttribute(u,e),o?ts.addScaledVector(Fo,h):ts.addScaledVector(Fo.sub(t),h))}t.add(ts)}return t}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),es.copy(n.boundingSphere),es.applyMatrix4(s),si.copy(e.ray).recast(e.near),!(es.containsPoint(si.origin)===!1&&(si.intersectSphere(es,cc)===null||si.origin.distanceToSquared(cc)>(e.far-e.near)**2))&&(lc.copy(s).invert(),si.copy(e.ray).applyMatrix4(lc),!(n.boundingBox!==null&&si.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,si)))}_computeIntersections(e,t,n){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],f=o[m.materialIndex],y=Math.max(m.start,p.start),x=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let S=y,C=x;S<C;S+=3){let T=a.getX(S),A=a.getX(S+1),D=a.getX(S+2);r=as(this,f,e,n,c,h,u,T,A,D),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,p.start),_=Math.min(a.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){let y=a.getX(m),x=a.getX(m+1),S=a.getX(m+2);r=as(this,o,e,n,c,h,u,y,x,S),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],f=o[m.materialIndex],y=Math.max(m.start,p.start),x=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let S=y,C=x;S<C;S+=3){let T=S,A=S+1,D=S+2;r=as(this,f,e,n,c,h,u,T,A,D),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){let y=m,x=m+1,S=m+2;r=as(this,o,e,n,c,h,u,y,x,S),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function pd(i,e,t,n,r,s,o,a){let l;if(e.side===At?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===Zn,a),l===null)return null;os.copy(a),os.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(os);return c<t.near||c>t.far?null:{distance:c,point:os.clone(),object:i}}function as(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,Ui),i.getVertexPosition(l,Ni),i.getVertexPosition(c,Oi);let h=pd(i,e,t,n,Ui,Ni,Oi,ss);if(h){r&&(ns.fromBufferAttribute(r,a),is.fromBufferAttribute(r,l),rs.fromBufferAttribute(r,c),h.uv=Gi.getInterpolation(ss,Ui,Ni,Oi,ns,is,rs,new J)),s&&(ns.fromBufferAttribute(s,a),is.fromBufferAttribute(s,l),rs.fromBufferAttribute(s,c),h.uv1=Gi.getInterpolation(ss,Ui,Ni,Oi,ns,is,rs,new J),h.uv2=h.uv1),o&&(hc.fromBufferAttribute(o,a),uc.fromBufferAttribute(o,l),dc.fromBufferAttribute(o,c),h.normal=Gi.getInterpolation(ss,Ui,Ni,Oi,hc,uc,dc,new R),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a,b:l,c,normal:new R,materialIndex:0};Gi.getNormal(Ui,Ni,Oi,u.normal),h.face=u}return h}var dn=class i extends _t{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,p=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new Be(c,3)),this.setAttribute("normal",new Be(h,3)),this.setAttribute("uv",new Be(u,2));function g(_,m,f,y,x,S,C,T,A,D,M){let b=S/A,U=C/D,H=S/2,j=C/2,I=T/2,F=A+1,V=D+1,Z=0,K=0,X=new R;for(let ie=0;ie<V;ie++){let re=ie*U-j;for(let pe=0;pe<F;pe++){let W=pe*b-H;X[_]=W*y,X[m]=re*x,X[f]=I,c.push(X.x,X.y,X.z),X[_]=0,X[m]=0,X[f]=T>0?1:-1,h.push(X.x,X.y,X.z),u.push(pe/A),u.push(1-ie/D),Z+=1}}for(let ie=0;ie<D;ie++)for(let re=0;re<A;re++){let pe=d+re+F*ie,W=d+re+F*(ie+1),ee=d+(re+1)+F*(ie+1),me=d+(re+1)+F*ie;l.push(pe,W,me),l.push(W,ee,me),K+=6}a.addGroup(p,K,M),p+=K,d+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function $i(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Bt(i){let e={};for(let t=0;t<i.length;t++){let n=$i(i[t]);for(let r in n)e[r]=n[r]}return e}function md(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function oh(i){return i.getRenderTarget()===null?i.outputColorSpace:tt.workingColorSpace}var gd={clone:$i,merge:Bt},_d=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,xd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Dn=class extends pi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_d,this.fragmentShader=xd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=$i(e.uniforms),this.uniformsGroups=md(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Is=class extends Gt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ot,this.projectionMatrix=new ot,this.projectionMatrixInverse=new ot,this.coordinateSystem=Cn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ut=class extends Is{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ta*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(vo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ta*2*Math.atan(Math.tan(vo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(vo*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Fi=-90,Bi=1,oa=class extends Gt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Ut(Fi,Bi,e,t);r.layers=this.layers,this.add(r);let s=new Ut(Fi,Bi,e,t);s.layers=this.layers,this.add(s);let o=new Ut(Fi,Bi,e,t);o.layers=this.layers,this.add(o);let a=new Ut(Fi,Bi,e,t);a.layers=this.layers,this.add(a);let l=new Ut(Fi,Bi,e,t);l.layers=this.layers,this.add(l);let c=new Ut(Fi,Bi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===Cn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===bs)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,r),e.render(t,h),e.setRenderTarget(u,d,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Ls=class extends rn{constructor(e,t,n,r,s,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Zi,super(e,t,n,r,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},aa=class extends In{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];t.encoding!==void 0&&(_r("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===di?ut:nn),this.texture=new Ls(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:tn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new dn(5,5,5),s=new Dn({name:"CubemapFromEquirect",uniforms:$i(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:At,blending:Wn});s.uniforms.tEquirect.value=t;let o=new ae(r,s),a=t.minFilter;return t.minFilter===Mr&&(t.minFilter=tn),new oa(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}},Bo=new R,yd=new R,vd=new Ke,Rn=class{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Bo.subVectors(n,t).cross(yd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Bo),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||vd.getNormalMatrix(e),r=this.coplanarPoint(Bo).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},oi=new Ln,ls=new R,Sr=class{constructor(e=new Rn,t=new Rn,n=new Rn,r=new Rn,s=new Rn,o=new Rn){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Cn){let n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],h=r[5],u=r[6],d=r[7],p=r[8],g=r[9],_=r[10],m=r[11],f=r[12],y=r[13],x=r[14],S=r[15];if(n[0].setComponents(l-s,d-c,m-p,S-f).normalize(),n[1].setComponents(l+s,d+c,m+p,S+f).normalize(),n[2].setComponents(l+o,d+h,m+g,S+y).normalize(),n[3].setComponents(l-o,d-h,m-g,S-y).normalize(),n[4].setComponents(l-a,d-u,m-_,S-x).normalize(),t===Cn)n[5].setComponents(l+a,d+u,m+_,S+x).normalize();else if(t===bs)n[5].setComponents(a,u,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),oi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),oi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(oi)}intersectsSprite(e){return oi.center.set(0,0,0),oi.radius=.7071067811865476,oi.applyMatrix4(e.matrixWorld),this.intersectsSphere(oi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ls.x=r.normal.x>0?e.max.x:e.min.x,ls.y=r.normal.y>0?e.max.y:e.min.y,ls.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ls)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function ah(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Md(i,e){let t=e.isWebGL2,n=new WeakMap;function r(c,h){let u=c.array,d=c.usage,p=u.byteLength,g=i.createBuffer();i.bindBuffer(h,g),i.bufferData(h,u,d),c.onUploadCallback();let _;if(u instanceof Float32Array)_=i.FLOAT;else if(u instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)_=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=i.UNSIGNED_SHORT;else if(u instanceof Int16Array)_=i.SHORT;else if(u instanceof Uint32Array)_=i.UNSIGNED_INT;else if(u instanceof Int32Array)_=i.INT;else if(u instanceof Int8Array)_=i.BYTE;else if(u instanceof Uint8Array)_=i.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)_=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:g,type:_,bytesPerElement:u.BYTES_PER_ELEMENT,version:c.version,size:p}}function s(c,h,u){let d=h.array,p=h._updateRange,g=h.updateRanges;if(i.bindBuffer(u,c),p.count===-1&&g.length===0&&i.bufferSubData(u,0,d),g.length!==0){for(let _=0,m=g.length;_<m;_++){let f=g[_];t?i.bufferSubData(u,f.start*d.BYTES_PER_ELEMENT,d,f.start,f.count):i.bufferSubData(u,f.start*d.BYTES_PER_ELEMENT,d.subarray(f.start,f.start+f.count))}h.clearUpdateRanges()}p.count!==-1&&(t?i.bufferSubData(u,p.offset*d.BYTES_PER_ELEMENT,d,p.offset,p.count):i.bufferSubData(u,p.offset*d.BYTES_PER_ELEMENT,d.subarray(p.offset,p.offset+p.count)),p.count=-1),h.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let h=n.get(c);h&&(i.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){let d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let u=n.get(c);if(u===void 0)n.set(c,r(c,h));else if(u.version<c.version){if(u.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(u.buffer,c,h),u.version=c.version}}return{get:o,remove:a,update:l}}var qt=class i extends _t{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,h=l+1,u=e/a,d=t/l,p=[],g=[],_=[],m=[];for(let f=0;f<h;f++){let y=f*d-o;for(let x=0;x<c;x++){let S=x*u-s;g.push(S,-y,0),_.push(0,0,1),m.push(x/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let y=0;y<a;y++){let x=y+c*f,S=y+c*(f+1),C=y+1+c*(f+1),T=y+1+c*f;p.push(x,S,T),p.push(S,C,T)}this.setIndex(p),this.setAttribute("position",new Be(g,3)),this.setAttribute("normal",new Be(_,3)),this.setAttribute("uv",new Be(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},bd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Sd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,wd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Ed=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Td=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Ad=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Rd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Cd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Pd=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Id=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Ld=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Dd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ud=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Nd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Od=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Fd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Bd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,zd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,kd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Gd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Vd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Hd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Wd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Xd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,qd=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Yd=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Zd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Kd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Jd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,$d=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,jd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Qd=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,ef=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,tf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,nf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,rf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,sf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,of=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,af=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,lf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,cf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,hf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,uf=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,df=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ff=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,pf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,mf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,gf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,_f=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,xf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,yf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,vf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Mf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,bf=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Sf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,wf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ef=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Tf=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Af=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Rf=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Cf=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Pf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,If=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Lf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Df=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Uf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Nf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Of=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ff=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Bf=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,zf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,kf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Gf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Vf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Wf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Xf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,qf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Yf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Zf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Kf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Jf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,$f=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,jf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Qf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ep=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,np=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ip=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,rp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,sp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,op=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ap=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,lp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,cp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,hp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,up=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,dp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,fp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,pp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,mp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,gp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,_p=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,xp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,yp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,vp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Mp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,bp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Sp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ep=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ap=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Cp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Pp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ip=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Lp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Dp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Up=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Np=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Op=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Fp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Gp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Hp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Wp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Yp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,$p=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,jp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,em=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,tm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Xe={alphahash_fragment:bd,alphahash_pars_fragment:Sd,alphamap_fragment:wd,alphamap_pars_fragment:Ed,alphatest_fragment:Td,alphatest_pars_fragment:Ad,aomap_fragment:Rd,aomap_pars_fragment:Cd,batching_pars_vertex:Pd,batching_vertex:Id,begin_vertex:Ld,beginnormal_vertex:Dd,bsdfs:Ud,iridescence_fragment:Nd,bumpmap_pars_fragment:Od,clipping_planes_fragment:Fd,clipping_planes_pars_fragment:Bd,clipping_planes_pars_vertex:zd,clipping_planes_vertex:kd,color_fragment:Gd,color_pars_fragment:Vd,color_pars_vertex:Hd,color_vertex:Wd,common:Xd,cube_uv_reflection_fragment:qd,defaultnormal_vertex:Yd,displacementmap_pars_vertex:Zd,displacementmap_vertex:Kd,emissivemap_fragment:Jd,emissivemap_pars_fragment:$d,colorspace_fragment:jd,colorspace_pars_fragment:Qd,envmap_fragment:ef,envmap_common_pars_fragment:tf,envmap_pars_fragment:nf,envmap_pars_vertex:rf,envmap_physical_pars_fragment:gf,envmap_vertex:sf,fog_vertex:of,fog_pars_vertex:af,fog_fragment:lf,fog_pars_fragment:cf,gradientmap_pars_fragment:hf,lightmap_fragment:uf,lightmap_pars_fragment:df,lights_lambert_fragment:ff,lights_lambert_pars_fragment:pf,lights_pars_begin:mf,lights_toon_fragment:_f,lights_toon_pars_fragment:xf,lights_phong_fragment:yf,lights_phong_pars_fragment:vf,lights_physical_fragment:Mf,lights_physical_pars_fragment:bf,lights_fragment_begin:Sf,lights_fragment_maps:wf,lights_fragment_end:Ef,logdepthbuf_fragment:Tf,logdepthbuf_pars_fragment:Af,logdepthbuf_pars_vertex:Rf,logdepthbuf_vertex:Cf,map_fragment:Pf,map_pars_fragment:If,map_particle_fragment:Lf,map_particle_pars_fragment:Df,metalnessmap_fragment:Uf,metalnessmap_pars_fragment:Nf,morphcolor_vertex:Of,morphnormal_vertex:Ff,morphtarget_pars_vertex:Bf,morphtarget_vertex:zf,normal_fragment_begin:kf,normal_fragment_maps:Gf,normal_pars_fragment:Vf,normal_pars_vertex:Hf,normal_vertex:Wf,normalmap_pars_fragment:Xf,clearcoat_normal_fragment_begin:qf,clearcoat_normal_fragment_maps:Yf,clearcoat_pars_fragment:Zf,iridescence_pars_fragment:Kf,opaque_fragment:Jf,packing:$f,premultiplied_alpha_fragment:jf,project_vertex:Qf,dithering_fragment:ep,dithering_pars_fragment:tp,roughnessmap_fragment:np,roughnessmap_pars_fragment:ip,shadowmap_pars_fragment:rp,shadowmap_pars_vertex:sp,shadowmap_vertex:op,shadowmask_pars_fragment:ap,skinbase_vertex:lp,skinning_pars_vertex:cp,skinning_vertex:hp,skinnormal_vertex:up,specularmap_fragment:dp,specularmap_pars_fragment:fp,tonemapping_fragment:pp,tonemapping_pars_fragment:mp,transmission_fragment:gp,transmission_pars_fragment:_p,uv_pars_fragment:xp,uv_pars_vertex:yp,uv_vertex:vp,worldpos_vertex:Mp,background_vert:bp,background_frag:Sp,backgroundCube_vert:wp,backgroundCube_frag:Ep,cube_vert:Tp,cube_frag:Ap,depth_vert:Rp,depth_frag:Cp,distanceRGBA_vert:Pp,distanceRGBA_frag:Ip,equirect_vert:Lp,equirect_frag:Dp,linedashed_vert:Up,linedashed_frag:Np,meshbasic_vert:Op,meshbasic_frag:Fp,meshlambert_vert:Bp,meshlambert_frag:zp,meshmatcap_vert:kp,meshmatcap_frag:Gp,meshnormal_vert:Vp,meshnormal_frag:Hp,meshphong_vert:Wp,meshphong_frag:Xp,meshphysical_vert:qp,meshphysical_frag:Yp,meshtoon_vert:Zp,meshtoon_frag:Kp,points_vert:Jp,points_frag:$p,shadow_vert:jp,shadow_frag:Qp,sprite_vert:em,sprite_frag:tm},he={common:{diffuse:{value:new Je(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ke},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ke}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ke},normalScale:{value:new J(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Je(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Je(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0},uvTransform:{value:new Ke}},sprite:{diffuse:{value:new Je(16777215)},opacity:{value:1},center:{value:new J(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ke},alphaMap:{value:null},alphaMapTransform:{value:new Ke},alphaTest:{value:0}}},gn={basic:{uniforms:Bt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.fog]),vertexShader:Xe.meshbasic_vert,fragmentShader:Xe.meshbasic_frag},lambert:{uniforms:Bt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new Je(0)}}]),vertexShader:Xe.meshlambert_vert,fragmentShader:Xe.meshlambert_frag},phong:{uniforms:Bt([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new Je(0)},specular:{value:new Je(1118481)},shininess:{value:30}}]),vertexShader:Xe.meshphong_vert,fragmentShader:Xe.meshphong_frag},standard:{uniforms:Bt([he.common,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.roughnessmap,he.metalnessmap,he.fog,he.lights,{emissive:{value:new Je(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag},toon:{uniforms:Bt([he.common,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.gradientmap,he.fog,he.lights,{emissive:{value:new Je(0)}}]),vertexShader:Xe.meshtoon_vert,fragmentShader:Xe.meshtoon_frag},matcap:{uniforms:Bt([he.common,he.bumpmap,he.normalmap,he.displacementmap,he.fog,{matcap:{value:null}}]),vertexShader:Xe.meshmatcap_vert,fragmentShader:Xe.meshmatcap_frag},points:{uniforms:Bt([he.points,he.fog]),vertexShader:Xe.points_vert,fragmentShader:Xe.points_frag},dashed:{uniforms:Bt([he.common,he.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Xe.linedashed_vert,fragmentShader:Xe.linedashed_frag},depth:{uniforms:Bt([he.common,he.displacementmap]),vertexShader:Xe.depth_vert,fragmentShader:Xe.depth_frag},normal:{uniforms:Bt([he.common,he.bumpmap,he.normalmap,he.displacementmap,{opacity:{value:1}}]),vertexShader:Xe.meshnormal_vert,fragmentShader:Xe.meshnormal_frag},sprite:{uniforms:Bt([he.sprite,he.fog]),vertexShader:Xe.sprite_vert,fragmentShader:Xe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Xe.background_vert,fragmentShader:Xe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Xe.backgroundCube_vert,fragmentShader:Xe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Xe.cube_vert,fragmentShader:Xe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Xe.equirect_vert,fragmentShader:Xe.equirect_frag},distanceRGBA:{uniforms:Bt([he.common,he.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Xe.distanceRGBA_vert,fragmentShader:Xe.distanceRGBA_frag},shadow:{uniforms:Bt([he.lights,he.fog,{color:{value:new Je(0)},opacity:{value:1}}]),vertexShader:Xe.shadow_vert,fragmentShader:Xe.shadow_frag}};gn.physical={uniforms:Bt([gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ke},clearcoatNormalScale:{value:new J(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ke},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ke},sheen:{value:0},sheenColor:{value:new Je(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ke},transmissionSamplerSize:{value:new J},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ke},attenuationDistance:{value:0},attenuationColor:{value:new Je(0)},specularColor:{value:new Je(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ke},anisotropyVector:{value:new J},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ke}}]),vertexShader:Xe.meshphysical_vert,fragmentShader:Xe.meshphysical_frag};var cs={r:0,b:0,g:0};function nm(i,e,t,n,r,s,o){let a=new Je(0),l=s===!0?0:1,c,h,u=null,d=0,p=null;function g(m,f){let y=!1,x=f.isScene===!0?f.background:null;x&&x.isTexture&&(x=(f.backgroundBlurriness>0?t:e).get(x)),x===null?_(a,l):x&&x.isColor&&(_(x,1),y=!0);let S=i.xr.getEnvironmentBlendMode();S==="additive"?n.buffers.color.setClear(0,0,0,1,o):S==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||y)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),x&&(x.isCubeTexture||x.mapping===Ks)?(h===void 0&&(h=new ae(new dn(1,1,1),new Dn({name:"BackgroundCubeMaterial",uniforms:$i(gn.backgroundCube.uniforms),vertexShader:gn.backgroundCube.vertexShader,fragmentShader:gn.backgroundCube.fragmentShader,side:At,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,T,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=f.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,h.material.toneMapped=tt.getTransfer(x.colorSpace)!==st,(u!==x||d!==x.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=x,d=x.version,p=i.toneMapping),h.layers.enableAll(),m.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new ae(new qt(2,2),new Dn({name:"BackgroundMaterial",uniforms:$i(gn.background.uniforms),vertexShader:gn.background.vertexShader,fragmentShader:gn.background.fragmentShader,side:Zn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,c.material.toneMapped=tt.getTransfer(x.colorSpace)!==st,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||d!==x.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=x,d=x.version,p=i.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function _(m,f){m.getRGB(cs,oh(i)),n.buffers.color.setClear(cs.r,cs.g,cs.b,f,o)}return{getClearColor:function(){return a},setClearColor:function(m,f=1){a.set(m),l=f,_(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,_(a,l)},render:g}}function im(i,e,t,n){let r=i.getParameter(i.MAX_VERTEX_ATTRIBS),s=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||s!==null,a={},l=m(null),c=l,h=!1;function u(I,F,V,Z,K){let X=!1;if(o){let ie=_(Z,V,F);c!==ie&&(c=ie,p(c.object)),X=f(I,Z,V,K),X&&y(I,Z,V,K)}else{let ie=F.wireframe===!0;(c.geometry!==Z.id||c.program!==V.id||c.wireframe!==ie)&&(c.geometry=Z.id,c.program=V.id,c.wireframe=ie,X=!0)}K!==null&&t.update(K,i.ELEMENT_ARRAY_BUFFER),(X||h)&&(h=!1,D(I,F,V,Z),K!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(K).buffer))}function d(){return n.isWebGL2?i.createVertexArray():s.createVertexArrayOES()}function p(I){return n.isWebGL2?i.bindVertexArray(I):s.bindVertexArrayOES(I)}function g(I){return n.isWebGL2?i.deleteVertexArray(I):s.deleteVertexArrayOES(I)}function _(I,F,V){let Z=V.wireframe===!0,K=a[I.id];K===void 0&&(K={},a[I.id]=K);let X=K[F.id];X===void 0&&(X={},K[F.id]=X);let ie=X[Z];return ie===void 0&&(ie=m(d()),X[Z]=ie),ie}function m(I){let F=[],V=[],Z=[];for(let K=0;K<r;K++)F[K]=0,V[K]=0,Z[K]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:V,attributeDivisors:Z,object:I,attributes:{},index:null}}function f(I,F,V,Z){let K=c.attributes,X=F.attributes,ie=0,re=V.getAttributes();for(let pe in re)if(re[pe].location>=0){let ee=K[pe],me=X[pe];if(me===void 0&&(pe==="instanceMatrix"&&I.instanceMatrix&&(me=I.instanceMatrix),pe==="instanceColor"&&I.instanceColor&&(me=I.instanceColor)),ee===void 0||ee.attribute!==me||me&&ee.data!==me.data)return!0;ie++}return c.attributesNum!==ie||c.index!==Z}function y(I,F,V,Z){let K={},X=F.attributes,ie=0,re=V.getAttributes();for(let pe in re)if(re[pe].location>=0){let ee=X[pe];ee===void 0&&(pe==="instanceMatrix"&&I.instanceMatrix&&(ee=I.instanceMatrix),pe==="instanceColor"&&I.instanceColor&&(ee=I.instanceColor));let me={};me.attribute=ee,ee&&ee.data&&(me.data=ee.data),K[pe]=me,ie++}c.attributes=K,c.attributesNum=ie,c.index=Z}function x(){let I=c.newAttributes;for(let F=0,V=I.length;F<V;F++)I[F]=0}function S(I){C(I,0)}function C(I,F){let V=c.newAttributes,Z=c.enabledAttributes,K=c.attributeDivisors;V[I]=1,Z[I]===0&&(i.enableVertexAttribArray(I),Z[I]=1),K[I]!==F&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](I,F),K[I]=F)}function T(){let I=c.newAttributes,F=c.enabledAttributes;for(let V=0,Z=F.length;V<Z;V++)F[V]!==I[V]&&(i.disableVertexAttribArray(V),F[V]=0)}function A(I,F,V,Z,K,X,ie){ie===!0?i.vertexAttribIPointer(I,F,V,K,X):i.vertexAttribPointer(I,F,V,Z,K,X)}function D(I,F,V,Z){if(n.isWebGL2===!1&&(I.isInstancedMesh||Z.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;x();let K=Z.attributes,X=V.getAttributes(),ie=F.defaultAttributeValues;for(let re in X){let pe=X[re];if(pe.location>=0){let W=K[re];if(W===void 0&&(re==="instanceMatrix"&&I.instanceMatrix&&(W=I.instanceMatrix),re==="instanceColor"&&I.instanceColor&&(W=I.instanceColor)),W!==void 0){let ee=W.normalized,me=W.itemSize,we=t.get(W);if(we===void 0)continue;let xe=we.buffer,De=we.type,ke=we.bytesPerElement,Ee=n.isWebGL2===!0&&(De===i.INT||De===i.UNSIGNED_INT||W.gpuType===qc);if(W.isInterleavedBufferAttribute){let Oe=W.data,P=Oe.stride,le=W.offset;if(Oe.isInstancedInterleavedBuffer){for(let Y=0;Y<pe.locationSize;Y++)C(pe.location+Y,Oe.meshPerAttribute);I.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=Oe.meshPerAttribute*Oe.count)}else for(let Y=0;Y<pe.locationSize;Y++)S(pe.location+Y);i.bindBuffer(i.ARRAY_BUFFER,xe);for(let Y=0;Y<pe.locationSize;Y++)A(pe.location+Y,me/pe.locationSize,De,ee,P*ke,(le+me/pe.locationSize*Y)*ke,Ee)}else{if(W.isInstancedBufferAttribute){for(let Oe=0;Oe<pe.locationSize;Oe++)C(pe.location+Oe,W.meshPerAttribute);I.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let Oe=0;Oe<pe.locationSize;Oe++)S(pe.location+Oe);i.bindBuffer(i.ARRAY_BUFFER,xe);for(let Oe=0;Oe<pe.locationSize;Oe++)A(pe.location+Oe,me/pe.locationSize,De,ee,me*ke,me/pe.locationSize*Oe*ke,Ee)}}else if(ie!==void 0){let ee=ie[re];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(pe.location,ee);break;case 3:i.vertexAttrib3fv(pe.location,ee);break;case 4:i.vertexAttrib4fv(pe.location,ee);break;default:i.vertexAttrib1fv(pe.location,ee)}}}}T()}function M(){H();for(let I in a){let F=a[I];for(let V in F){let Z=F[V];for(let K in Z)g(Z[K].object),delete Z[K];delete F[V]}delete a[I]}}function b(I){if(a[I.id]===void 0)return;let F=a[I.id];for(let V in F){let Z=F[V];for(let K in Z)g(Z[K].object),delete Z[K];delete F[V]}delete a[I.id]}function U(I){for(let F in a){let V=a[F];if(V[I.id]===void 0)continue;let Z=V[I.id];for(let K in Z)g(Z[K].object),delete Z[K];delete V[I.id]}}function H(){j(),h=!0,c!==l&&(c=l,p(c.object))}function j(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:u,reset:H,resetDefaultState:j,dispose:M,releaseStatesOfGeometry:b,releaseStatesOfProgram:U,initAttributes:x,enableAttribute:S,disableUnusedAttributes:T}}function rm(i,e,t,n){let r=n.isWebGL2,s;function o(h){s=h}function a(h,u){i.drawArrays(s,h,u),t.update(u,s,1)}function l(h,u,d){if(d===0)return;let p,g;if(r)p=i,g="drawArraysInstanced";else if(p=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",p===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[g](s,h,u,d),t.update(u,s,d)}function c(h,u,d){if(d===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<d;g++)this.render(h[g],u[g]);else{p.multiDrawArraysWEBGL(s,h,0,u,0,d);let g=0;for(let _=0;_<d;_++)g+=u[_];t.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function sm(i,e,t){let n;function r(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||e.has("WEBGL_draw_buffers"),h=t.logarithmicDepthBuffer===!0,u=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),_=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),f=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),x=d>0,S=o||e.has("OES_texture_float"),C=x&&S,T=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:d,maxTextureSize:p,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:m,maxVaryings:f,maxFragmentUniforms:y,vertexTextures:x,floatFragmentTextures:S,floatVertexTextures:C,maxSamples:T}}function om(i){let e=this,t=null,n=0,r=!1,s=!1,o=new Rn,a=new Ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let p=u.length!==0||d||n!==0||r;return r=d,n=u.length,p},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,p){let g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,f=i.get(u);if(!r||g===null||g.length===0||s&&!m)s?h(null):c();else{let y=s?0:n,x=y*4,S=f.clippingState||null;l.value=S,S=h(g,d,x,p);for(let C=0;C!==x;++C)S[C]=t[C];f.clippingState=S,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,p,g){let _=u!==null?u.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let f=p+_*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<f)&&(m=new Float32Array(f));for(let x=0,S=p;x!==_;++x,S+=4)o.copy(u[x]).applyMatrix4(y,a),o.normal.toArray(m,S),m[S+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function am(i){let e=new WeakMap;function t(o,a){return a===$o?o.mapping=Zi:a===jo&&(o.mapping=Ki),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===$o||a===jo)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new aa(l.height/2);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var Ds=class extends Is{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Vi=4,fc=[.125,.215,.35,.446,.526,.582],ci=20,zo=new Ds,pc=new Je,ko=null,Go=0,Vo=0,ai=(1+Math.sqrt(5))/2,zi=1/ai,mc=[new R(1,1,1),new R(-1,1,1),new R(1,1,-1),new R(-1,1,-1),new R(0,ai,zi),new R(0,ai,-zi),new R(zi,0,ai),new R(-zi,0,ai),new R(ai,zi,0),new R(-ai,zi,0)],ji=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){ko=this._renderer.getRenderTarget(),Go=this._renderer.getActiveCubeFace(),Vo=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=xc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_c(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ko,Go,Vo),e.scissorTest=!1,hs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Zi||e.mapping===Ki?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ko=this._renderer.getRenderTarget(),Go=this._renderer.getActiveCubeFace(),Vo=this._renderer.getActiveMipmapLevel();let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:tn,minFilter:tn,generateMipmaps:!1,type:br,format:hn,colorSpace:Pn,depthBuffer:!1},r=gc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=gc(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=lm(s)),this._blurMaterial=cm(s,e,t)}return r}_compileMaterial(e){let t=new ae(this._lodPlanes[0],e);this._renderer.compile(t,zo)}_sceneToCubeUV(e,t,n,r){let a=new Ut(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(pc),h.toneMapping=Xn,h.autoClear=!1;let p=new ft({name:"PMREM.Background",side:At,depthWrite:!1,depthTest:!1}),g=new ae(new dn,p),_=!1,m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,_=!0):(p.color.copy(pc),_=!0);for(let f=0;f<6;f++){let y=f%3;y===0?(a.up.set(0,l[f],0),a.lookAt(c[f],0,0)):y===1?(a.up.set(0,0,l[f]),a.lookAt(0,c[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,c[f]));let x=this._cubeSize;hs(r,y*x,f>2?x:0,x,x),h.setRenderTarget(r),_&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===Zi||e.mapping===Ki;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=xc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_c());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new ae(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;hs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,zo)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=mc[(r-1)%mc.length];this._blur(e,r-1,r,s,o)}t.autoClear=n}_blur(e,t,n,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new ae(this._lodPlanes[r],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*ci-1),_=s/g,m=isFinite(s)?1+Math.floor(h*_):ci;m>ci&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ci}`);let f=[],y=0;for(let A=0;A<ci;++A){let D=A/_,M=Math.exp(-D*D/2);f.push(M),A===0?y+=M:A<m&&(y+=2*M)}for(let A=0;A<f.length;A++)f[A]=f[A]/y;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;let S=this._sizeLods[r],C=3*S*(r>x-Vi?r-x+Vi:0),T=4*(this._cubeSize-S);hs(t,C,T,3*S,2*S),l.setRenderTarget(t),l.render(u,zo)}};function lm(i){let e=[],t=[],n=[],r=i,s=i-Vi+1+fc.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>i-Vi?l=fc[o-i+Vi-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,_=3,m=2,f=1,y=new Float32Array(_*g*p),x=new Float32Array(m*g*p),S=new Float32Array(f*g*p);for(let T=0;T<p;T++){let A=T%3*2/3-1,D=T>2?0:-1,M=[A,D,0,A+2/3,D,0,A+2/3,D+1,0,A,D,0,A+2/3,D+1,0,A,D+1,0];y.set(M,_*g*T),x.set(d,m*g*T);let b=[T,T,T,T,T,T];S.set(b,f*g*T)}let C=new _t;C.setAttribute("position",new kt(y,_)),C.setAttribute("uv",new kt(x,m)),C.setAttribute("faceIndex",new kt(S,f)),e.push(C),r>Vi&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function gc(i,e,t){let n=new In(i,e,t);return n.texture.mapping=Ks,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function hs(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function cm(i,e,t){let n=new Float32Array(ci),r=new R(0,1,0);return new Dn({name:"SphericalGaussianBlur",defines:{n:ci,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Va(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function _c(){return new Dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Va(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function xc(){return new Dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Va(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function Va(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function hm(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===$o||l===jo,h=l===Zi||l===Ki;if(c||h)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let u=e.get(a);return t===null&&(t=new ji(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),e.set(a,u),u.texture}else{if(e.has(a))return e.get(a).texture;{let u=a.image;if(c&&u&&u.height>0||h&&u&&r(u)){t===null&&(t=new ji(i));let d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",s),d.texture}else return null}}}return a}function r(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function um(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){let r=t(n);return r===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function dm(i,e,t,n){let r={},s=new WeakMap;function o(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);for(let g in d.morphAttributes){let _=d.morphAttributes[g];for(let m=0,f=_.length;m<f;m++)e.remove(_[m])}d.removeEventListener("dispose",o),delete r[d.id];let p=s.get(d);p&&(e.remove(p),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,t.memory.geometries++),d}function l(u){let d=u.attributes;for(let g in d)e.update(d[g],i.ARRAY_BUFFER);let p=u.morphAttributes;for(let g in p){let _=p[g];for(let m=0,f=_.length;m<f;m++)e.update(_[m],i.ARRAY_BUFFER)}}function c(u){let d=[],p=u.index,g=u.attributes.position,_=0;if(p!==null){let y=p.array;_=p.version;for(let x=0,S=y.length;x<S;x+=3){let C=y[x+0],T=y[x+1],A=y[x+2];d.push(C,T,T,A,A,C)}}else if(g!==void 0){let y=g.array;_=g.version;for(let x=0,S=y.length/3-1;x<S;x+=3){let C=x+0,T=x+1,A=x+2;d.push(C,T,T,A,A,C)}}else return;let m=new(rh(d)?Ps:Cs)(d,1);m.version=_;let f=s.get(u);f&&e.remove(f),s.set(u,m)}function h(u){let d=s.get(u);if(d){let p=u.index;p!==null&&d.version<p.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function fm(i,e,t,n){let r=n.isWebGL2,s;function o(p){s=p}let a,l;function c(p){a=p.type,l=p.bytesPerElement}function h(p,g){i.drawElements(s,g,a,p*l),t.update(g,s,1)}function u(p,g,_){if(_===0)return;let m,f;if(r)m=i,f="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),f="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[f](s,g,a,p*l,_),t.update(g,s,_)}function d(p,g,_){if(_===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<_;f++)this.render(p[f]/l,g[f]);else{m.multiDrawElementsWEBGL(s,g,0,a,p,0,_);let f=0;for(let y=0;y<_;y++)f+=g[y];t.update(f,s,1)}}this.setMode=o,this.setIndex=c,this.render=h,this.renderInstances=u,this.renderMultiDraw=d}function pm(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function mm(i,e){return i[0]-e[0]}function gm(i,e){return Math.abs(e[1])-Math.abs(i[1])}function _m(i,e,t){let n={},r=new Float32Array(8),s=new WeakMap,o=new lt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,h,u){let d=c.morphTargetInfluences;if(e.isWebGL2===!0){let p=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=p!==void 0?p.length:0,_=s.get(h);if(_===void 0||_.count!==g){let I=function(){H.dispose(),s.delete(h),h.removeEventListener("dispose",I)};_!==void 0&&_.texture.dispose();let y=h.morphAttributes.position!==void 0,x=h.morphAttributes.normal!==void 0,S=h.morphAttributes.color!==void 0,C=h.morphAttributes.position||[],T=h.morphAttributes.normal||[],A=h.morphAttributes.color||[],D=0;y===!0&&(D=1),x===!0&&(D=2),S===!0&&(D=3);let M=h.attributes.position.count*D,b=1;M>e.maxTextureSize&&(b=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let U=new Float32Array(M*b*4*g),H=new Ts(U,M,b,g);H.type=Hn,H.needsUpdate=!0;let j=D*4;for(let F=0;F<g;F++){let V=C[F],Z=T[F],K=A[F],X=M*b*4*F;for(let ie=0;ie<V.count;ie++){let re=ie*j;y===!0&&(o.fromBufferAttribute(V,ie),U[X+re+0]=o.x,U[X+re+1]=o.y,U[X+re+2]=o.z,U[X+re+3]=0),x===!0&&(o.fromBufferAttribute(Z,ie),U[X+re+4]=o.x,U[X+re+5]=o.y,U[X+re+6]=o.z,U[X+re+7]=0),S===!0&&(o.fromBufferAttribute(K,ie),U[X+re+8]=o.x,U[X+re+9]=o.y,U[X+re+10]=o.z,U[X+re+11]=K.itemSize===4?o.w:1)}}_={count:g,texture:H,size:new J(M,b)},s.set(h,_),h.addEventListener("dispose",I)}let m=0;for(let y=0;y<d.length;y++)m+=d[y];let f=h.morphTargetsRelative?1:1-m;u.getUniforms().setValue(i,"morphTargetBaseInfluence",f),u.getUniforms().setValue(i,"morphTargetInfluences",d),u.getUniforms().setValue(i,"morphTargetsTexture",_.texture,t),u.getUniforms().setValue(i,"morphTargetsTextureSize",_.size)}else{let p=d===void 0?0:d.length,g=n[h.id];if(g===void 0||g.length!==p){g=[];for(let x=0;x<p;x++)g[x]=[x,0];n[h.id]=g}for(let x=0;x<p;x++){let S=g[x];S[0]=x,S[1]=d[x]}g.sort(gm);for(let x=0;x<8;x++)x<p&&g[x][1]?(a[x][0]=g[x][0],a[x][1]=g[x][1]):(a[x][0]=Number.MAX_SAFE_INTEGER,a[x][1]=0);a.sort(mm);let _=h.morphAttributes.position,m=h.morphAttributes.normal,f=0;for(let x=0;x<8;x++){let S=a[x],C=S[0],T=S[1];C!==Number.MAX_SAFE_INTEGER&&T?(_&&h.getAttribute("morphTarget"+x)!==_[C]&&h.setAttribute("morphTarget"+x,_[C]),m&&h.getAttribute("morphNormal"+x)!==m[C]&&h.setAttribute("morphNormal"+x,m[C]),r[x]=T,f+=T):(_&&h.hasAttribute("morphTarget"+x)===!0&&h.deleteAttribute("morphTarget"+x),m&&h.hasAttribute("morphNormal"+x)===!0&&h.deleteAttribute("morphNormal"+x),r[x]=0)}let y=h.morphTargetsRelative?1:1-f;u.getUniforms().setValue(i,"morphTargetBaseInfluence",y),u.getUniforms().setValue(i,"morphTargetInfluences",r)}}return{update:l}}function xm(i,e,t,n){let r=new WeakMap;function s(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(r.get(u)!==c&&(e.update(u),r.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return u}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var Us=class extends rn{constructor(e,t,n,r,s,o,a,l,c,h){if(h=h!==void 0?h:ui,h!==ui&&h!==Ji)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===ui&&(n=Vn),n===void 0&&h===Ji&&(n=hi),super(null,r,s,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:zt,this.minFilter=l!==void 0?l:zt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},lh=new rn,ch=new Us(1,1);ch.compareFunction=ih;var hh=new Ts,uh=new ra,dh=new Ls,yc=[],vc=[],Mc=new Float32Array(16),bc=new Float32Array(9),Sc=new Float32Array(4);function sr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=yc[r];if(s===void 0&&(s=new Float32Array(r),yc[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function Mt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function bt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function $s(i,e){let t=vc[e];t===void 0&&(t=new Int32Array(e),vc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ym(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function vm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2fv(this.addr,e),bt(t,e)}}function Mm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Mt(t,e))return;i.uniform3fv(this.addr,e),bt(t,e)}}function bm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4fv(this.addr,e),bt(t,e)}}function Sm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),bt(t,e)}else{if(Mt(t,n))return;Sc.set(n),i.uniformMatrix2fv(this.addr,!1,Sc),bt(t,n)}}function wm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),bt(t,e)}else{if(Mt(t,n))return;bc.set(n),i.uniformMatrix3fv(this.addr,!1,bc),bt(t,n)}}function Em(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),bt(t,e)}else{if(Mt(t,n))return;Mc.set(n),i.uniformMatrix4fv(this.addr,!1,Mc),bt(t,n)}}function Tm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Am(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2iv(this.addr,e),bt(t,e)}}function Rm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3iv(this.addr,e),bt(t,e)}}function Cm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4iv(this.addr,e),bt(t,e)}}function Pm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Im(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2uiv(this.addr,e),bt(t,e)}}function Lm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3uiv(this.addr,e),bt(t,e)}}function Dm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4uiv(this.addr,e),bt(t,e)}}function Um(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s=this.type===i.SAMPLER_2D_SHADOW?ch:lh;t.setTexture2D(e||s,r)}function Nm(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||uh,r)}function Om(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||dh,r)}function Fm(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||hh,r)}function Bm(i){switch(i){case 5126:return ym;case 35664:return vm;case 35665:return Mm;case 35666:return bm;case 35674:return Sm;case 35675:return wm;case 35676:return Em;case 5124:case 35670:return Tm;case 35667:case 35671:return Am;case 35668:case 35672:return Rm;case 35669:case 35673:return Cm;case 5125:return Pm;case 36294:return Im;case 36295:return Lm;case 36296:return Dm;case 35678:case 36198:case 36298:case 36306:case 35682:return Um;case 35679:case 36299:case 36307:return Nm;case 35680:case 36300:case 36308:case 36293:return Om;case 36289:case 36303:case 36311:case 36292:return Fm}}function zm(i,e){i.uniform1fv(this.addr,e)}function km(i,e){let t=sr(e,this.size,2);i.uniform2fv(this.addr,t)}function Gm(i,e){let t=sr(e,this.size,3);i.uniform3fv(this.addr,t)}function Vm(i,e){let t=sr(e,this.size,4);i.uniform4fv(this.addr,t)}function Hm(i,e){let t=sr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Wm(i,e){let t=sr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Xm(i,e){let t=sr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function qm(i,e){i.uniform1iv(this.addr,e)}function Ym(i,e){i.uniform2iv(this.addr,e)}function Zm(i,e){i.uniform3iv(this.addr,e)}function Km(i,e){i.uniform4iv(this.addr,e)}function Jm(i,e){i.uniform1uiv(this.addr,e)}function $m(i,e){i.uniform2uiv(this.addr,e)}function jm(i,e){i.uniform3uiv(this.addr,e)}function Qm(i,e){i.uniform4uiv(this.addr,e)}function e0(i,e,t){let n=this.cache,r=e.length,s=$s(t,r);Mt(n,s)||(i.uniform1iv(this.addr,s),bt(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||lh,s[o])}function t0(i,e,t){let n=this.cache,r=e.length,s=$s(t,r);Mt(n,s)||(i.uniform1iv(this.addr,s),bt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||uh,s[o])}function n0(i,e,t){let n=this.cache,r=e.length,s=$s(t,r);Mt(n,s)||(i.uniform1iv(this.addr,s),bt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||dh,s[o])}function i0(i,e,t){let n=this.cache,r=e.length,s=$s(t,r);Mt(n,s)||(i.uniform1iv(this.addr,s),bt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||hh,s[o])}function r0(i){switch(i){case 5126:return zm;case 35664:return km;case 35665:return Gm;case 35666:return Vm;case 35674:return Hm;case 35675:return Wm;case 35676:return Xm;case 5124:case 35670:return qm;case 35667:case 35671:return Ym;case 35668:case 35672:return Zm;case 35669:case 35673:return Km;case 5125:return Jm;case 36294:return $m;case 36295:return jm;case 36296:return Qm;case 35678:case 36198:case 36298:case 36306:case 35682:return e0;case 35679:case 36299:case 36307:return t0;case 35680:case 36300:case 36308:case 36293:return n0;case 36289:case 36303:case 36311:case 36292:return i0}}var la=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Bm(t.type)}},ca=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=r0(t.type)}},ha=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],n)}}},Ho=/(\w+)(\])?(\[|\.)?/g;function wc(i,e){i.seq.push(e),i.map[e.id]=e}function s0(i,e,t){let n=i.name,r=n.length;for(Ho.lastIndex=0;;){let s=Ho.exec(n),o=Ho.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){wc(t,c===void 0?new la(a,i,e):new ca(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new ha(a),wc(t,u)),t=u}}}var Yi=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);s0(s,o,this)}}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&n.push(o)}return n}};function Ec(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var o0=37297,a0=0;function l0(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function c0(i){let e=tt.getPrimaries(tt.workingColorSpace),t=tt.getPrimaries(i),n;switch(e===t?n="":e===Ms&&t===vs?n="LinearDisplayP3ToLinearSRGB":e===vs&&t===Ms&&(n="LinearSRGBToLinearDisplayP3"),i){case Pn:case Js:return[n,"LinearTransferOETF"];case ut:case Ga:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Tc(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+l0(i.getShaderSource(e),o)}else return r}function h0(i,e){let t=c0(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function u0(i,e){let t;switch(e){case Cu:t="Linear";break;case Pu:t="Reinhard";break;case Iu:t="OptimizedCineon";break;case za:t="ACESFilmic";break;case Du:t="AgX";break;case Lu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function d0(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Hi).join(`
`)}function f0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(Hi).join(`
`)}function p0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function m0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),o=s.name,a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Hi(i){return i!==""}function Ac(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Rc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var g0=/^[ \t]*#include +<([\w\d./]+)>/gm;function ua(i){return i.replace(g0,x0)}var _0=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function x0(i,e){let t=Xe[e];if(t===void 0){let n=_0.get(e);if(n!==void 0)t=Xe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return ua(t)}var y0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Cc(i){return i.replace(y0,v0)}function v0(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Pc(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function M0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Hc?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===ru?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===An&&(e="SHADOWMAP_TYPE_VSM"),e}function b0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Zi:case Ki:e="ENVMAP_TYPE_CUBE";break;case Ks:e="ENVMAP_TYPE_CUBE_UV";break}return e}function S0(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===Ki&&(e="ENVMAP_MODE_REFRACTION"),e}function w0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Wc:e="ENVMAP_BLENDING_MULTIPLY";break;case Au:e="ENVMAP_BLENDING_MIX";break;case Ru:e="ENVMAP_BLENDING_ADD";break}return e}function E0(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function T0(i,e,t,n){let r=i.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=M0(t),c=b0(t),h=S0(t),u=w0(t),d=E0(t),p=t.isWebGL2?"":d0(t),g=f0(t),_=p0(s),m=r.createProgram(),f,y,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Hi).join(`
`),f.length>0&&(f+=`
`),y=[p,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Hi).join(`
`),y.length>0&&(y+=`
`)):(f=[Pc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Hi).join(`
`),y=[p,Pc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Xn?"#define TONE_MAPPING":"",t.toneMapping!==Xn?Xe.tonemapping_pars_fragment:"",t.toneMapping!==Xn?u0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Xe.colorspace_pars_fragment,h0("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Hi).join(`
`)),o=ua(o),o=Ac(o,t),o=Rc(o,t),a=ua(a),a=Ac(a,t),a=Rc(a,t),o=Cc(o),a=Cc(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,f=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,y=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===Kl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Kl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);let S=x+f+o,C=x+y+a,T=Ec(r,r.VERTEX_SHADER,S),A=Ec(r,r.FRAGMENT_SHADER,C);r.attachShader(m,T),r.attachShader(m,A),t.index0AttributeName!==void 0?r.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(m,0,"position"),r.linkProgram(m);function D(H){if(i.debug.checkShaderErrors){let j=r.getProgramInfoLog(m).trim(),I=r.getShaderInfoLog(T).trim(),F=r.getShaderInfoLog(A).trim(),V=!0,Z=!0;if(r.getProgramParameter(m,r.LINK_STATUS)===!1)if(V=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,m,T,A);else{let K=Tc(r,T,"vertex"),X=Tc(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(m,r.VALIDATE_STATUS)+`

Program Info Log: `+j+`
`+K+`
`+X)}else j!==""?console.warn("THREE.WebGLProgram: Program Info Log:",j):(I===""||F==="")&&(Z=!1);Z&&(H.diagnostics={runnable:V,programLog:j,vertexShader:{log:I,prefix:f},fragmentShader:{log:F,prefix:y}})}r.deleteShader(T),r.deleteShader(A),M=new Yi(r,m),b=m0(r,m)}let M;this.getUniforms=function(){return M===void 0&&D(this),M};let b;this.getAttributes=function(){return b===void 0&&D(this),b};let U=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return U===!1&&(U=r.getProgramParameter(m,o0)),U},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=a0++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=T,this.fragmentShader=A,this}var A0=0,da=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new fa(e),t.set(e,n)),n}},fa=class{constructor(e){this.id=A0++,this.code=e,this.usedTimes=0}};function R0(i,e,t,n,r,s,o){let a=new Rs,l=new da,c=[],h=r.isWebGL2,u=r.logarithmicDepthBuffer,d=r.vertexTextures,p=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(M){return M===0?"uv":`uv${M}`}function m(M,b,U,H,j){let I=H.fog,F=j.geometry,V=M.isMeshStandardMaterial?H.environment:null,Z=(M.isMeshStandardMaterial?t:e).get(M.envMap||V),K=Z&&Z.mapping===Ks?Z.image.height:null,X=g[M.type];M.precision!==null&&(p=r.getMaxPrecision(M.precision),p!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",p,"instead."));let ie=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,re=ie!==void 0?ie.length:0,pe=0;F.morphAttributes.position!==void 0&&(pe=1),F.morphAttributes.normal!==void 0&&(pe=2),F.morphAttributes.color!==void 0&&(pe=3);let W,ee,me,we;if(X){let Ot=gn[X];W=Ot.vertexShader,ee=Ot.fragmentShader}else W=M.vertexShader,ee=M.fragmentShader,l.update(M),me=l.getVertexShaderID(M),we=l.getFragmentShaderID(M);let xe=i.getRenderTarget(),De=j.isInstancedMesh===!0,ke=j.isBatchedMesh===!0,Ee=!!M.map,Oe=!!M.matcap,P=!!Z,le=!!M.aoMap,Y=!!M.lightMap,oe=!!M.bumpMap,q=!!M.normalMap,Ae=!!M.displacementMap,ge=!!M.emissiveMap,w=!!M.metalnessMap,v=!!M.roughnessMap,O=M.anisotropy>0,se=M.clearcoat>0,te=M.iridescence>0,Q=M.sheen>0,Se=M.transmission>0,ue=O&&!!M.anisotropyMap,ye=se&&!!M.clearcoatMap,Pe=se&&!!M.clearcoatNormalMap,Ve=se&&!!M.clearcoatRoughnessMap,ne=te&&!!M.iridescenceMap,je=te&&!!M.iridescenceThicknessMap,$e=Q&&!!M.sheenColorMap,Fe=Q&&!!M.sheenRoughnessMap,Re=!!M.specularMap,ve=!!M.specularColorMap,We=!!M.specularIntensityMap,et=Se&&!!M.transmissionMap,pt=Se&&!!M.thicknessMap,Ye=!!M.gradientMap,ce=!!M.alphaMap,L=M.alphaTest>0,de=!!M.alphaHash,fe=!!M.extensions,Ue=!!F.attributes.uv1,Ie=!!F.attributes.uv2,nt=!!F.attributes.uv3,it=Xn;return M.toneMapped&&(xe===null||xe.isXRRenderTarget===!0)&&(it=i.toneMapping),{isWebGL2:h,shaderID:X,shaderType:M.type,shaderName:M.name,vertexShader:W,fragmentShader:ee,defines:M.defines,customVertexShaderID:me,customFragmentShaderID:we,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:p,batching:ke,instancing:De,instancingColor:De&&j.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:xe===null?i.outputColorSpace:xe.isXRRenderTarget===!0?xe.texture.colorSpace:Pn,map:Ee,matcap:Oe,envMap:P,envMapMode:P&&Z.mapping,envMapCubeUVHeight:K,aoMap:le,lightMap:Y,bumpMap:oe,normalMap:q,displacementMap:d&&Ae,emissiveMap:ge,normalMapObjectSpace:q&&M.normalMapType===Xu,normalMapTangentSpace:q&&M.normalMapType===eh,metalnessMap:w,roughnessMap:v,anisotropy:O,anisotropyMap:ue,clearcoat:se,clearcoatMap:ye,clearcoatNormalMap:Pe,clearcoatRoughnessMap:Ve,iridescence:te,iridescenceMap:ne,iridescenceThicknessMap:je,sheen:Q,sheenColorMap:$e,sheenRoughnessMap:Fe,specularMap:Re,specularColorMap:ve,specularIntensityMap:We,transmission:Se,transmissionMap:et,thicknessMap:pt,gradientMap:Ye,opaque:M.transparent===!1&&M.blending===Xi,alphaMap:ce,alphaTest:L,alphaHash:de,combine:M.combine,mapUv:Ee&&_(M.map.channel),aoMapUv:le&&_(M.aoMap.channel),lightMapUv:Y&&_(M.lightMap.channel),bumpMapUv:oe&&_(M.bumpMap.channel),normalMapUv:q&&_(M.normalMap.channel),displacementMapUv:Ae&&_(M.displacementMap.channel),emissiveMapUv:ge&&_(M.emissiveMap.channel),metalnessMapUv:w&&_(M.metalnessMap.channel),roughnessMapUv:v&&_(M.roughnessMap.channel),anisotropyMapUv:ue&&_(M.anisotropyMap.channel),clearcoatMapUv:ye&&_(M.clearcoatMap.channel),clearcoatNormalMapUv:Pe&&_(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ve&&_(M.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&_(M.iridescenceMap.channel),iridescenceThicknessMapUv:je&&_(M.iridescenceThicknessMap.channel),sheenColorMapUv:$e&&_(M.sheenColorMap.channel),sheenRoughnessMapUv:Fe&&_(M.sheenRoughnessMap.channel),specularMapUv:Re&&_(M.specularMap.channel),specularColorMapUv:ve&&_(M.specularColorMap.channel),specularIntensityMapUv:We&&_(M.specularIntensityMap.channel),transmissionMapUv:et&&_(M.transmissionMap.channel),thicknessMapUv:pt&&_(M.thicknessMap.channel),alphaMapUv:ce&&_(M.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(q||O),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,vertexUv1s:Ue,vertexUv2s:Ie,vertexUv3s:nt,pointsUvs:j.isPoints===!0&&!!F.attributes.uv&&(Ee||ce),fog:!!I,useFog:M.fog===!0,fogExp2:I&&I.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:j.isSkinnedMesh===!0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:pe,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&U.length>0,shadowMapType:i.shadowMap.type,toneMapping:it,useLegacyLights:i._useLegacyLights,decodeVideoTexture:Ee&&M.map.isVideoTexture===!0&&tt.getTransfer(M.map.colorSpace)===st,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Nt,flipSided:M.side===At,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionDerivatives:fe&&M.extensions.derivatives===!0,extensionFragDepth:fe&&M.extensions.fragDepth===!0,extensionDrawBuffers:fe&&M.extensions.drawBuffers===!0,extensionShaderTextureLOD:fe&&M.extensions.shaderTextureLOD===!0,extensionClipCullDistance:fe&&M.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()}}function f(M){let b=[];if(M.shaderID?b.push(M.shaderID):(b.push(M.customVertexShaderID),b.push(M.customFragmentShaderID)),M.defines!==void 0)for(let U in M.defines)b.push(U),b.push(M.defines[U]);return M.isRawShaderMaterial===!1&&(y(b,M),x(b,M),b.push(i.outputColorSpace)),b.push(M.customProgramCacheKey),b.join()}function y(M,b){M.push(b.precision),M.push(b.outputColorSpace),M.push(b.envMapMode),M.push(b.envMapCubeUVHeight),M.push(b.mapUv),M.push(b.alphaMapUv),M.push(b.lightMapUv),M.push(b.aoMapUv),M.push(b.bumpMapUv),M.push(b.normalMapUv),M.push(b.displacementMapUv),M.push(b.emissiveMapUv),M.push(b.metalnessMapUv),M.push(b.roughnessMapUv),M.push(b.anisotropyMapUv),M.push(b.clearcoatMapUv),M.push(b.clearcoatNormalMapUv),M.push(b.clearcoatRoughnessMapUv),M.push(b.iridescenceMapUv),M.push(b.iridescenceThicknessMapUv),M.push(b.sheenColorMapUv),M.push(b.sheenRoughnessMapUv),M.push(b.specularMapUv),M.push(b.specularColorMapUv),M.push(b.specularIntensityMapUv),M.push(b.transmissionMapUv),M.push(b.thicknessMapUv),M.push(b.combine),M.push(b.fogExp2),M.push(b.sizeAttenuation),M.push(b.morphTargetsCount),M.push(b.morphAttributeCount),M.push(b.numDirLights),M.push(b.numPointLights),M.push(b.numSpotLights),M.push(b.numSpotLightMaps),M.push(b.numHemiLights),M.push(b.numRectAreaLights),M.push(b.numDirLightShadows),M.push(b.numPointLightShadows),M.push(b.numSpotLightShadows),M.push(b.numSpotLightShadowsWithMaps),M.push(b.numLightProbes),M.push(b.shadowMapType),M.push(b.toneMapping),M.push(b.numClippingPlanes),M.push(b.numClipIntersection),M.push(b.depthPacking)}function x(M,b){a.disableAll(),b.isWebGL2&&a.enable(0),b.supportsVertexTextures&&a.enable(1),b.instancing&&a.enable(2),b.instancingColor&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),M.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.skinning&&a.enable(4),b.morphTargets&&a.enable(5),b.morphNormals&&a.enable(6),b.morphColors&&a.enable(7),b.premultipliedAlpha&&a.enable(8),b.shadowMapEnabled&&a.enable(9),b.useLegacyLights&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),M.push(a.mask)}function S(M){let b=g[M.type],U;if(b){let H=gn[b];U=gd.clone(H.uniforms)}else U=M.uniforms;return U}function C(M,b){let U;for(let H=0,j=c.length;H<j;H++){let I=c[H];if(I.cacheKey===b){U=I,++U.usedTimes;break}}return U===void 0&&(U=new T0(i,b,M,s),c.push(U)),U}function T(M){if(--M.usedTimes===0){let b=c.indexOf(M);c[b]=c[c.length-1],c.pop(),M.destroy()}}function A(M){l.remove(M)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:S,acquireProgram:C,releaseProgram:T,releaseShaderCache:A,programs:c,dispose:D}}function C0(){let i=new WeakMap;function e(s){let o=i.get(s);return o===void 0&&(o={},i.set(s,o)),o}function t(s){i.delete(s)}function n(s,o,a){i.get(s)[o]=a}function r(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:r}}function P0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Ic(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Lc(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(u,d,p,g,_,m){let f=i[e];return f===void 0?(f={id:u.id,object:u,geometry:d,material:p,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},i[e]=f):(f.id=u.id,f.object=u,f.geometry=d,f.material=p,f.groupOrder=g,f.renderOrder=u.renderOrder,f.z=_,f.group=m),e++,f}function a(u,d,p,g,_,m){let f=o(u,d,p,g,_,m);p.transmission>0?n.push(f):p.transparent===!0?r.push(f):t.push(f)}function l(u,d,p,g,_,m){let f=o(u,d,p,g,_,m);p.transmission>0?n.unshift(f):p.transparent===!0?r.unshift(f):t.unshift(f)}function c(u,d){t.length>1&&t.sort(u||P0),n.length>1&&n.sort(d||Ic),r.length>1&&r.sort(d||Ic)}function h(){for(let u=e,d=i.length;u<d;u++){let p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:h,sort:c}}function I0(){let i=new WeakMap;function e(n,r){let s=i.get(n),o;return s===void 0?(o=new Lc,i.set(n,[o])):r>=s.length?(o=new Lc,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function L0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new Je};break;case"SpotLight":t={position:new R,direction:new R,color:new Je,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new Je,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new Je,groundColor:new Je};break;case"RectAreaLight":t={color:new Je,position:new R,halfWidth:new R,halfHeight:new R};break}return i[e.id]=t,t}}}function D0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var U0=0;function N0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function O0(i,e){let t=new L0,n=D0(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)r.probe.push(new R);let s=new R,o=new ot,a=new ot;function l(h,u){let d=0,p=0,g=0;for(let H=0;H<9;H++)r.probe[H].set(0,0,0);let _=0,m=0,f=0,y=0,x=0,S=0,C=0,T=0,A=0,D=0,M=0;h.sort(N0);let b=u===!0?Math.PI:1;for(let H=0,j=h.length;H<j;H++){let I=h[H],F=I.color,V=I.intensity,Z=I.distance,K=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)d+=F.r*V*b,p+=F.g*V*b,g+=F.b*V*b;else if(I.isLightProbe){for(let X=0;X<9;X++)r.probe[X].addScaledVector(I.sh.coefficients[X],V);M++}else if(I.isDirectionalLight){let X=t.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity*b),I.castShadow){let ie=I.shadow,re=n.get(I);re.shadowBias=ie.bias,re.shadowNormalBias=ie.normalBias,re.shadowRadius=ie.radius,re.shadowMapSize=ie.mapSize,r.directionalShadow[_]=re,r.directionalShadowMap[_]=K,r.directionalShadowMatrix[_]=I.shadow.matrix,S++}r.directional[_]=X,_++}else if(I.isSpotLight){let X=t.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(F).multiplyScalar(V*b),X.distance=Z,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,r.spot[f]=X;let ie=I.shadow;if(I.map&&(r.spotLightMap[A]=I.map,A++,ie.updateMatrices(I),I.castShadow&&D++),r.spotLightMatrix[f]=ie.matrix,I.castShadow){let re=n.get(I);re.shadowBias=ie.bias,re.shadowNormalBias=ie.normalBias,re.shadowRadius=ie.radius,re.shadowMapSize=ie.mapSize,r.spotShadow[f]=re,r.spotShadowMap[f]=K,T++}f++}else if(I.isRectAreaLight){let X=t.get(I);X.color.copy(F).multiplyScalar(V),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),r.rectArea[y]=X,y++}else if(I.isPointLight){let X=t.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity*b),X.distance=I.distance,X.decay=I.decay,I.castShadow){let ie=I.shadow,re=n.get(I);re.shadowBias=ie.bias,re.shadowNormalBias=ie.normalBias,re.shadowRadius=ie.radius,re.shadowMapSize=ie.mapSize,re.shadowCameraNear=ie.camera.near,re.shadowCameraFar=ie.camera.far,r.pointShadow[m]=re,r.pointShadowMap[m]=K,r.pointShadowMatrix[m]=I.shadow.matrix,C++}r.point[m]=X,m++}else if(I.isHemisphereLight){let X=t.get(I);X.skyColor.copy(I.color).multiplyScalar(V*b),X.groundColor.copy(I.groundColor).multiplyScalar(V*b),r.hemi[x]=X,x++}}y>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=he.LTC_FLOAT_1,r.rectAreaLTC2=he.LTC_FLOAT_2):(r.rectAreaLTC1=he.LTC_HALF_1,r.rectAreaLTC2=he.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=he.LTC_FLOAT_1,r.rectAreaLTC2=he.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=he.LTC_HALF_1,r.rectAreaLTC2=he.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=d,r.ambient[1]=p,r.ambient[2]=g;let U=r.hash;(U.directionalLength!==_||U.pointLength!==m||U.spotLength!==f||U.rectAreaLength!==y||U.hemiLength!==x||U.numDirectionalShadows!==S||U.numPointShadows!==C||U.numSpotShadows!==T||U.numSpotMaps!==A||U.numLightProbes!==M)&&(r.directional.length=_,r.spot.length=f,r.rectArea.length=y,r.point.length=m,r.hemi.length=x,r.directionalShadow.length=S,r.directionalShadowMap.length=S,r.pointShadow.length=C,r.pointShadowMap.length=C,r.spotShadow.length=T,r.spotShadowMap.length=T,r.directionalShadowMatrix.length=S,r.pointShadowMatrix.length=C,r.spotLightMatrix.length=T+A-D,r.spotLightMap.length=A,r.numSpotLightShadowsWithMaps=D,r.numLightProbes=M,U.directionalLength=_,U.pointLength=m,U.spotLength=f,U.rectAreaLength=y,U.hemiLength=x,U.numDirectionalShadows=S,U.numPointShadows=C,U.numSpotShadows=T,U.numSpotMaps=A,U.numLightProbes=M,r.version=U0++)}function c(h,u){let d=0,p=0,g=0,_=0,m=0,f=u.matrixWorldInverse;for(let y=0,x=h.length;y<x;y++){let S=h[y];if(S.isDirectionalLight){let C=r.directional[d];C.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),C.direction.sub(s),C.direction.transformDirection(f),d++}else if(S.isSpotLight){let C=r.spot[g];C.position.setFromMatrixPosition(S.matrixWorld),C.position.applyMatrix4(f),C.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),C.direction.sub(s),C.direction.transformDirection(f),g++}else if(S.isRectAreaLight){let C=r.rectArea[_];C.position.setFromMatrixPosition(S.matrixWorld),C.position.applyMatrix4(f),a.identity(),o.copy(S.matrixWorld),o.premultiply(f),a.extractRotation(o),C.halfWidth.set(S.width*.5,0,0),C.halfHeight.set(0,S.height*.5,0),C.halfWidth.applyMatrix4(a),C.halfHeight.applyMatrix4(a),_++}else if(S.isPointLight){let C=r.point[p];C.position.setFromMatrixPosition(S.matrixWorld),C.position.applyMatrix4(f),p++}else if(S.isHemisphereLight){let C=r.hemi[m];C.direction.setFromMatrixPosition(S.matrixWorld),C.direction.transformDirection(f),m++}}}return{setup:l,setupView:c,state:r}}function Dc(i,e){let t=new O0(i,e),n=[],r=[];function s(){n.length=0,r.length=0}function o(u){n.push(u)}function a(u){r.push(u)}function l(u){t.setup(n,u)}function c(u){t.setupView(n,u)}return{init:s,state:{lightsArray:n,shadowsArray:r,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function F0(i,e){let t=new WeakMap;function n(s,o=0){let a=t.get(s),l;return a===void 0?(l=new Dc(i,e),t.set(s,[l])):o>=a.length?(l=new Dc(i,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:n,dispose:r}}var pa=class extends pi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Hu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ma=class extends pi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},B0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,z0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function k0(i,e,t){let n=new Sr,r=new J,s=new J,o=new lt,a=new pa({depthPacking:Wu}),l=new ma,c={},h=t.maxTextureSize,u={[Zn]:At,[At]:Zn,[Nt]:Nt},d=new Dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new J},radius:{value:4}},vertexShader:B0,fragmentShader:z0}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let g=new _t;g.setAttribute("position",new kt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new ae(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Hc;let f=this.type;this.render=function(T,A,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;let M=i.getRenderTarget(),b=i.getActiveCubeFace(),U=i.getActiveMipmapLevel(),H=i.state;H.setBlending(Wn),H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);let j=f!==An&&this.type===An,I=f===An&&this.type!==An;for(let F=0,V=T.length;F<V;F++){let Z=T[F],K=Z.shadow;if(K===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(K.autoUpdate===!1&&K.needsUpdate===!1)continue;r.copy(K.mapSize);let X=K.getFrameExtents();if(r.multiply(X),s.copy(K.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/X.x),r.x=s.x*X.x,K.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/X.y),r.y=s.y*X.y,K.mapSize.y=s.y)),K.map===null||j===!0||I===!0){let re=this.type!==An?{minFilter:zt,magFilter:zt}:{};K.map!==null&&K.map.dispose(),K.map=new In(r.x,r.y,re),K.map.texture.name=Z.name+".shadowMap",K.camera.updateProjectionMatrix()}i.setRenderTarget(K.map),i.clear();let ie=K.getViewportCount();for(let re=0;re<ie;re++){let pe=K.getViewport(re);o.set(s.x*pe.x,s.y*pe.y,s.x*pe.z,s.y*pe.w),H.viewport(o),K.updateMatrices(Z,re),n=K.getFrustum(),S(A,D,K.camera,Z,this.type)}K.isPointLightShadow!==!0&&this.type===An&&y(K,D),K.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(M,b,U)};function y(T,A){let D=e.update(_);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new In(r.x,r.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(A,null,D,d,_,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(A,null,D,p,_,null)}function x(T,A,D,M){let b=null,U=D.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(U!==void 0)b=U;else if(b=D.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){let H=b.uuid,j=A.uuid,I=c[H];I===void 0&&(I={},c[H]=I);let F=I[j];F===void 0&&(F=b.clone(),I[j]=F,A.addEventListener("dispose",C)),b=F}if(b.visible=A.visible,b.wireframe=A.wireframe,M===An?b.side=A.shadowSide!==null?A.shadowSide:A.side:b.side=A.shadowSide!==null?A.shadowSide:u[A.side],b.alphaMap=A.alphaMap,b.alphaTest=A.alphaTest,b.map=A.map,b.clipShadows=A.clipShadows,b.clippingPlanes=A.clippingPlanes,b.clipIntersection=A.clipIntersection,b.displacementMap=A.displacementMap,b.displacementScale=A.displacementScale,b.displacementBias=A.displacementBias,b.wireframeLinewidth=A.wireframeLinewidth,b.linewidth=A.linewidth,D.isPointLight===!0&&b.isMeshDistanceMaterial===!0){let H=i.properties.get(b);H.light=D}return b}function S(T,A,D,M,b){if(T.visible===!1)return;if(T.layers.test(A.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&b===An)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,T.matrixWorld);let j=e.update(T),I=T.material;if(Array.isArray(I)){let F=j.groups;for(let V=0,Z=F.length;V<Z;V++){let K=F[V],X=I[K.materialIndex];if(X&&X.visible){let ie=x(T,X,M,b);T.onBeforeShadow(i,T,A,D,j,ie,K),i.renderBufferDirect(D,null,j,ie,T,K),T.onAfterShadow(i,T,A,D,j,ie,K)}}}else if(I.visible){let F=x(T,I,M,b);T.onBeforeShadow(i,T,A,D,j,F,null),i.renderBufferDirect(D,null,j,F,T,null),T.onAfterShadow(i,T,A,D,j,F,null)}}let H=T.children;for(let j=0,I=H.length;j<I;j++)S(H[j],A,D,M,b)}function C(T){T.target.removeEventListener("dispose",C);for(let D in c){let M=c[D],b=T.target.uuid;b in M&&(M[b].dispose(),delete M[b])}}}function G0(i,e,t){let n=t.isWebGL2;function r(){let L=!1,de=new lt,fe=null,Ue=new lt(0,0,0,0);return{setMask:function(Ie){fe!==Ie&&!L&&(i.colorMask(Ie,Ie,Ie,Ie),fe=Ie)},setLocked:function(Ie){L=Ie},setClear:function(Ie,nt,it,wt,Ot){Ot===!0&&(Ie*=wt,nt*=wt,it*=wt),de.set(Ie,nt,it,wt),Ue.equals(de)===!1&&(i.clearColor(Ie,nt,it,wt),Ue.copy(de))},reset:function(){L=!1,fe=null,Ue.set(-1,0,0,0)}}}function s(){let L=!1,de=null,fe=null,Ue=null;return{setTest:function(Ie){Ie?ke(i.DEPTH_TEST):Ee(i.DEPTH_TEST)},setMask:function(Ie){de!==Ie&&!L&&(i.depthMask(Ie),de=Ie)},setFunc:function(Ie){if(fe!==Ie){switch(Ie){case Mu:i.depthFunc(i.NEVER);break;case bu:i.depthFunc(i.ALWAYS);break;case Su:i.depthFunc(i.LESS);break;case gs:i.depthFunc(i.LEQUAL);break;case wu:i.depthFunc(i.EQUAL);break;case Eu:i.depthFunc(i.GEQUAL);break;case Ba:i.depthFunc(i.GREATER);break;case Tu:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}fe=Ie}},setLocked:function(Ie){L=Ie},setClear:function(Ie){Ue!==Ie&&(i.clearDepth(Ie),Ue=Ie)},reset:function(){L=!1,de=null,fe=null,Ue=null}}}function o(){let L=!1,de=null,fe=null,Ue=null,Ie=null,nt=null,it=null,wt=null,Ot=null;return{setTest:function(rt){L||(rt?ke(i.STENCIL_TEST):Ee(i.STENCIL_TEST))},setMask:function(rt){de!==rt&&!L&&(i.stencilMask(rt),de=rt)},setFunc:function(rt,Ft,mn){(fe!==rt||Ue!==Ft||Ie!==mn)&&(i.stencilFunc(rt,Ft,mn),fe=rt,Ue=Ft,Ie=mn)},setOp:function(rt,Ft,mn){(nt!==rt||it!==Ft||wt!==mn)&&(i.stencilOp(rt,Ft,mn),nt=rt,it=Ft,wt=mn)},setLocked:function(rt){L=rt},setClear:function(rt){Ot!==rt&&(i.clearStencil(rt),Ot=rt)},reset:function(){L=!1,de=null,fe=null,Ue=null,Ie=null,nt=null,it=null,wt=null,Ot=null}}}let a=new r,l=new s,c=new o,h=new WeakMap,u=new WeakMap,d={},p={},g=new WeakMap,_=[],m=null,f=!1,y=null,x=null,S=null,C=null,T=null,A=null,D=null,M=new Je(0,0,0),b=0,U=!1,H=null,j=null,I=null,F=null,V=null,Z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),K=!1,X=0,ie=i.getParameter(i.VERSION);ie.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(ie)[1]),K=X>=1):ie.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]),K=X>=2);let re=null,pe={},W=i.getParameter(i.SCISSOR_BOX),ee=i.getParameter(i.VIEWPORT),me=new lt().fromArray(W),we=new lt().fromArray(ee);function xe(L,de,fe,Ue){let Ie=new Uint8Array(4),nt=i.createTexture();i.bindTexture(L,nt),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let it=0;it<fe;it++)n&&(L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY)?i.texImage3D(de,0,i.RGBA,1,1,Ue,0,i.RGBA,i.UNSIGNED_BYTE,Ie):i.texImage2D(de+it,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ie);return nt}let De={};De[i.TEXTURE_2D]=xe(i.TEXTURE_2D,i.TEXTURE_2D,1),De[i.TEXTURE_CUBE_MAP]=xe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(De[i.TEXTURE_2D_ARRAY]=xe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),De[i.TEXTURE_3D]=xe(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),ke(i.DEPTH_TEST),l.setFunc(gs),ge(!1),w(fl),ke(i.CULL_FACE),q(Wn);function ke(L){d[L]!==!0&&(i.enable(L),d[L]=!0)}function Ee(L){d[L]!==!1&&(i.disable(L),d[L]=!1)}function Oe(L,de){return p[L]!==de?(i.bindFramebuffer(L,de),p[L]=de,n&&(L===i.DRAW_FRAMEBUFFER&&(p[i.FRAMEBUFFER]=de),L===i.FRAMEBUFFER&&(p[i.DRAW_FRAMEBUFFER]=de)),!0):!1}function P(L,de){let fe=_,Ue=!1;if(L)if(fe=g.get(de),fe===void 0&&(fe=[],g.set(de,fe)),L.isWebGLMultipleRenderTargets){let Ie=L.texture;if(fe.length!==Ie.length||fe[0]!==i.COLOR_ATTACHMENT0){for(let nt=0,it=Ie.length;nt<it;nt++)fe[nt]=i.COLOR_ATTACHMENT0+nt;fe.length=Ie.length,Ue=!0}}else fe[0]!==i.COLOR_ATTACHMENT0&&(fe[0]=i.COLOR_ATTACHMENT0,Ue=!0);else fe[0]!==i.BACK&&(fe[0]=i.BACK,Ue=!0);Ue&&(t.isWebGL2?i.drawBuffers(fe):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(fe))}function le(L){return m!==L?(i.useProgram(L),m=L,!0):!1}let Y={[li]:i.FUNC_ADD,[ou]:i.FUNC_SUBTRACT,[au]:i.FUNC_REVERSE_SUBTRACT};if(n)Y[gl]=i.MIN,Y[_l]=i.MAX;else{let L=e.get("EXT_blend_minmax");L!==null&&(Y[gl]=L.MIN_EXT,Y[_l]=L.MAX_EXT)}let oe={[lu]:i.ZERO,[cu]:i.ONE,[hu]:i.SRC_COLOR,[Ko]:i.SRC_ALPHA,[gu]:i.SRC_ALPHA_SATURATE,[pu]:i.DST_COLOR,[du]:i.DST_ALPHA,[uu]:i.ONE_MINUS_SRC_COLOR,[Jo]:i.ONE_MINUS_SRC_ALPHA,[mu]:i.ONE_MINUS_DST_COLOR,[fu]:i.ONE_MINUS_DST_ALPHA,[_u]:i.CONSTANT_COLOR,[xu]:i.ONE_MINUS_CONSTANT_COLOR,[yu]:i.CONSTANT_ALPHA,[vu]:i.ONE_MINUS_CONSTANT_ALPHA};function q(L,de,fe,Ue,Ie,nt,it,wt,Ot,rt){if(L===Wn){f===!0&&(Ee(i.BLEND),f=!1);return}if(f===!1&&(ke(i.BLEND),f=!0),L!==su){if(L!==y||rt!==U){if((x!==li||T!==li)&&(i.blendEquation(i.FUNC_ADD),x=li,T=li),rt)switch(L){case Xi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case fi:i.blendFunc(i.ONE,i.ONE);break;case pl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ml:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Xi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case fi:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case pl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ml:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}S=null,C=null,A=null,D=null,M.set(0,0,0),b=0,y=L,U=rt}return}Ie=Ie||de,nt=nt||fe,it=it||Ue,(de!==x||Ie!==T)&&(i.blendEquationSeparate(Y[de],Y[Ie]),x=de,T=Ie),(fe!==S||Ue!==C||nt!==A||it!==D)&&(i.blendFuncSeparate(oe[fe],oe[Ue],oe[nt],oe[it]),S=fe,C=Ue,A=nt,D=it),(wt.equals(M)===!1||Ot!==b)&&(i.blendColor(wt.r,wt.g,wt.b,Ot),M.copy(wt),b=Ot),y=L,U=!1}function Ae(L,de){L.side===Nt?Ee(i.CULL_FACE):ke(i.CULL_FACE);let fe=L.side===At;de&&(fe=!fe),ge(fe),L.blending===Xi&&L.transparent===!1?q(Wn):q(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),l.setFunc(L.depthFunc),l.setTest(L.depthTest),l.setMask(L.depthWrite),a.setMask(L.colorWrite);let Ue=L.stencilWrite;c.setTest(Ue),Ue&&(c.setMask(L.stencilWriteMask),c.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),c.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),O(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ke(i.SAMPLE_ALPHA_TO_COVERAGE):Ee(i.SAMPLE_ALPHA_TO_COVERAGE)}function ge(L){H!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),H=L)}function w(L){L!==nu?(ke(i.CULL_FACE),L!==j&&(L===fl?i.cullFace(i.BACK):L===iu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ee(i.CULL_FACE),j=L}function v(L){L!==I&&(K&&i.lineWidth(L),I=L)}function O(L,de,fe){L?(ke(i.POLYGON_OFFSET_FILL),(F!==de||V!==fe)&&(i.polygonOffset(de,fe),F=de,V=fe)):Ee(i.POLYGON_OFFSET_FILL)}function se(L){L?ke(i.SCISSOR_TEST):Ee(i.SCISSOR_TEST)}function te(L){L===void 0&&(L=i.TEXTURE0+Z-1),re!==L&&(i.activeTexture(L),re=L)}function Q(L,de,fe){fe===void 0&&(re===null?fe=i.TEXTURE0+Z-1:fe=re);let Ue=pe[fe];Ue===void 0&&(Ue={type:void 0,texture:void 0},pe[fe]=Ue),(Ue.type!==L||Ue.texture!==de)&&(re!==fe&&(i.activeTexture(fe),re=fe),i.bindTexture(L,de||De[L]),Ue.type=L,Ue.texture=de)}function Se(){let L=pe[re];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function ue(){try{i.compressedTexImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ye(){try{i.compressedTexImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Pe(){try{i.texSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ve(){try{i.texSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ne(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function je(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $e(){try{i.texStorage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Fe(){try{i.texStorage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Re(){try{i.texImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ve(){try{i.texImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function We(L){me.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),me.copy(L))}function et(L){we.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),we.copy(L))}function pt(L,de){let fe=u.get(de);fe===void 0&&(fe=new WeakMap,u.set(de,fe));let Ue=fe.get(L);Ue===void 0&&(Ue=i.getUniformBlockIndex(de,L.name),fe.set(L,Ue))}function Ye(L,de){let Ue=u.get(de).get(L);h.get(de)!==Ue&&(i.uniformBlockBinding(de,Ue,L.__bindingPointIndex),h.set(de,Ue))}function ce(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},re=null,pe={},p={},g=new WeakMap,_=[],m=null,f=!1,y=null,x=null,S=null,C=null,T=null,A=null,D=null,M=new Je(0,0,0),b=0,U=!1,H=null,j=null,I=null,F=null,V=null,me.set(0,0,i.canvas.width,i.canvas.height),we.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:ke,disable:Ee,bindFramebuffer:Oe,drawBuffers:P,useProgram:le,setBlending:q,setMaterial:Ae,setFlipSided:ge,setCullFace:w,setLineWidth:v,setPolygonOffset:O,setScissorTest:se,activeTexture:te,bindTexture:Q,unbindTexture:Se,compressedTexImage2D:ue,compressedTexImage3D:ye,texImage2D:Re,texImage3D:ve,updateUBOMapping:pt,uniformBlockBinding:Ye,texStorage2D:$e,texStorage3D:Fe,texSubImage2D:Pe,texSubImage3D:Ve,compressedTexSubImage2D:ne,compressedTexSubImage3D:je,scissor:We,viewport:et,reset:ce}}function V0(i,e,t,n,r,s,o){let a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap,u,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(w,v){return p?new OffscreenCanvas(w,v):Ss("canvas")}function _(w,v,O,se){let te=1;if((w.width>se||w.height>se)&&(te=se/Math.max(w.width,w.height)),te<1||v===!0)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap){let Q=v?na:Math.floor,Se=Q(te*w.width),ue=Q(te*w.height);u===void 0&&(u=g(Se,ue));let ye=O?g(Se,ue):u;return ye.width=Se,ye.height=ue,ye.getContext("2d").drawImage(w,0,0,Se,ue),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+w.width+"x"+w.height+") to ("+Se+"x"+ue+")."),ye}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+w.width+"x"+w.height+")."),w;return w}function m(w){return Jl(w.width)&&Jl(w.height)}function f(w){return a?!1:w.wrapS!==vt||w.wrapT!==vt||w.minFilter!==zt&&w.minFilter!==tn}function y(w,v){return w.generateMipmaps&&v&&w.minFilter!==zt&&w.minFilter!==tn}function x(w){i.generateMipmap(w)}function S(w,v,O,se,te=!1){if(a===!1)return v;if(w!==null){if(i[w]!==void 0)return i[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let Q=v;if(v===i.RED&&(O===i.FLOAT&&(Q=i.R32F),O===i.HALF_FLOAT&&(Q=i.R16F),O===i.UNSIGNED_BYTE&&(Q=i.R8)),v===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(Q=i.R8UI),O===i.UNSIGNED_SHORT&&(Q=i.R16UI),O===i.UNSIGNED_INT&&(Q=i.R32UI),O===i.BYTE&&(Q=i.R8I),O===i.SHORT&&(Q=i.R16I),O===i.INT&&(Q=i.R32I)),v===i.RG&&(O===i.FLOAT&&(Q=i.RG32F),O===i.HALF_FLOAT&&(Q=i.RG16F),O===i.UNSIGNED_BYTE&&(Q=i.RG8)),v===i.RGBA){let Se=te?ys:tt.getTransfer(se);O===i.FLOAT&&(Q=i.RGBA32F),O===i.HALF_FLOAT&&(Q=i.RGBA16F),O===i.UNSIGNED_BYTE&&(Q=Se===st?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function C(w,v,O){return y(w,O)===!0||w.isFramebufferTexture&&w.minFilter!==zt&&w.minFilter!==tn?Math.log2(Math.max(v.width,v.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?v.mipmaps.length:1}function T(w){return w===zt||w===xl||w===fo?i.NEAREST:i.LINEAR}function A(w){let v=w.target;v.removeEventListener("dispose",A),M(v),v.isVideoTexture&&h.delete(v)}function D(w){let v=w.target;v.removeEventListener("dispose",D),U(v)}function M(w){let v=n.get(w);if(v.__webglInit===void 0)return;let O=w.source,se=d.get(O);if(se){let te=se[v.__cacheKey];te.usedTimes--,te.usedTimes===0&&b(w),Object.keys(se).length===0&&d.delete(O)}n.remove(w)}function b(w){let v=n.get(w);i.deleteTexture(v.__webglTexture);let O=w.source,se=d.get(O);delete se[v.__cacheKey],o.memory.textures--}function U(w){let v=w.texture,O=n.get(w),se=n.get(v);if(se.__webglTexture!==void 0&&(i.deleteTexture(se.__webglTexture),o.memory.textures--),w.depthTexture&&w.depthTexture.dispose(),w.isWebGLCubeRenderTarget)for(let te=0;te<6;te++){if(Array.isArray(O.__webglFramebuffer[te]))for(let Q=0;Q<O.__webglFramebuffer[te].length;Q++)i.deleteFramebuffer(O.__webglFramebuffer[te][Q]);else i.deleteFramebuffer(O.__webglFramebuffer[te]);O.__webglDepthbuffer&&i.deleteRenderbuffer(O.__webglDepthbuffer[te])}else{if(Array.isArray(O.__webglFramebuffer))for(let te=0;te<O.__webglFramebuffer.length;te++)i.deleteFramebuffer(O.__webglFramebuffer[te]);else i.deleteFramebuffer(O.__webglFramebuffer);if(O.__webglDepthbuffer&&i.deleteRenderbuffer(O.__webglDepthbuffer),O.__webglMultisampledFramebuffer&&i.deleteFramebuffer(O.__webglMultisampledFramebuffer),O.__webglColorRenderbuffer)for(let te=0;te<O.__webglColorRenderbuffer.length;te++)O.__webglColorRenderbuffer[te]&&i.deleteRenderbuffer(O.__webglColorRenderbuffer[te]);O.__webglDepthRenderbuffer&&i.deleteRenderbuffer(O.__webglDepthRenderbuffer)}if(w.isWebGLMultipleRenderTargets)for(let te=0,Q=v.length;te<Q;te++){let Se=n.get(v[te]);Se.__webglTexture&&(i.deleteTexture(Se.__webglTexture),o.memory.textures--),n.remove(v[te])}n.remove(v),n.remove(w)}let H=0;function j(){H=0}function I(){let w=H;return w>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+r.maxTextures),H+=1,w}function F(w){let v=[];return v.push(w.wrapS),v.push(w.wrapT),v.push(w.wrapR||0),v.push(w.magFilter),v.push(w.minFilter),v.push(w.anisotropy),v.push(w.internalFormat),v.push(w.format),v.push(w.type),v.push(w.generateMipmaps),v.push(w.premultiplyAlpha),v.push(w.flipY),v.push(w.unpackAlignment),v.push(w.colorSpace),v.join()}function V(w,v){let O=n.get(w);if(w.isVideoTexture&&Ae(w),w.isRenderTargetTexture===!1&&w.version>0&&O.__version!==w.version){let se=w.image;if(se===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(se.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{me(O,w,v);return}}t.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+v)}function Z(w,v){let O=n.get(w);if(w.version>0&&O.__version!==w.version){me(O,w,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+v)}function K(w,v){let O=n.get(w);if(w.version>0&&O.__version!==w.version){me(O,w,v);return}t.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+v)}function X(w,v){let O=n.get(w);if(w.version>0&&O.__version!==w.version){we(O,w,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+v)}let ie={[Kn]:i.REPEAT,[vt]:i.CLAMP_TO_EDGE,[Qo]:i.MIRRORED_REPEAT},re={[zt]:i.NEAREST,[xl]:i.NEAREST_MIPMAP_NEAREST,[fo]:i.NEAREST_MIPMAP_LINEAR,[tn]:i.LINEAR,[Uu]:i.LINEAR_MIPMAP_NEAREST,[Mr]:i.LINEAR_MIPMAP_LINEAR},pe={[qu]:i.NEVER,[ju]:i.ALWAYS,[Yu]:i.LESS,[ih]:i.LEQUAL,[Zu]:i.EQUAL,[$u]:i.GEQUAL,[Ku]:i.GREATER,[Ju]:i.NOTEQUAL};function W(w,v,O){if(O?(i.texParameteri(w,i.TEXTURE_WRAP_S,ie[v.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,ie[v.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,ie[v.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,re[v.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,re[v.minFilter])):(i.texParameteri(w,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(w,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(v.wrapS!==vt||v.wrapT!==vt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(w,i.TEXTURE_MAG_FILTER,T(v.magFilter)),i.texParameteri(w,i.TEXTURE_MIN_FILTER,T(v.minFilter)),v.minFilter!==zt&&v.minFilter!==tn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),v.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,pe[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let se=e.get("EXT_texture_filter_anisotropic");if(v.magFilter===zt||v.minFilter!==fo&&v.minFilter!==Mr||v.type===Hn&&e.has("OES_texture_float_linear")===!1||a===!1&&v.type===br&&e.has("OES_texture_half_float_linear")===!1)return;(v.anisotropy>1||n.get(v).__currentAnisotropy)&&(i.texParameterf(w,se.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,r.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy)}}function ee(w,v){let O=!1;w.__webglInit===void 0&&(w.__webglInit=!0,v.addEventListener("dispose",A));let se=v.source,te=d.get(se);te===void 0&&(te={},d.set(se,te));let Q=F(v);if(Q!==w.__cacheKey){te[Q]===void 0&&(te[Q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,O=!0),te[Q].usedTimes++;let Se=te[w.__cacheKey];Se!==void 0&&(te[w.__cacheKey].usedTimes--,Se.usedTimes===0&&b(v)),w.__cacheKey=Q,w.__webglTexture=te[Q].texture}return O}function me(w,v,O){let se=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(se=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(se=i.TEXTURE_3D);let te=ee(w,v),Q=v.source;t.bindTexture(se,w.__webglTexture,i.TEXTURE0+O);let Se=n.get(Q);if(Q.version!==Se.__version||te===!0){t.activeTexture(i.TEXTURE0+O);let ue=tt.getPrimaries(tt.workingColorSpace),ye=v.colorSpace===nn?null:tt.getPrimaries(v.colorSpace),Pe=v.colorSpace===nn||ue===ye?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe);let Ve=f(v)&&m(v.image)===!1,ne=_(v.image,Ve,!1,r.maxTextureSize);ne=ge(v,ne);let je=m(ne)||a,$e=s.convert(v.format,v.colorSpace),Fe=s.convert(v.type),Re=S(v.internalFormat,$e,Fe,v.colorSpace,v.isVideoTexture);W(se,v,je);let ve,We=v.mipmaps,et=a&&v.isVideoTexture!==!0&&Re!==jc,pt=Se.__version===void 0||te===!0,Ye=C(v,ne,je);if(v.isDepthTexture)Re=i.DEPTH_COMPONENT,a?v.type===Hn?Re=i.DEPTH_COMPONENT32F:v.type===Vn?Re=i.DEPTH_COMPONENT24:v.type===hi?Re=i.DEPTH24_STENCIL8:Re=i.DEPTH_COMPONENT16:v.type===Hn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),v.format===ui&&Re===i.DEPTH_COMPONENT&&v.type!==ka&&v.type!==Vn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),v.type=Vn,Fe=s.convert(v.type)),v.format===Ji&&Re===i.DEPTH_COMPONENT&&(Re=i.DEPTH_STENCIL,v.type!==hi&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),v.type=hi,Fe=s.convert(v.type))),pt&&(et?t.texStorage2D(i.TEXTURE_2D,1,Re,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,Re,ne.width,ne.height,0,$e,Fe,null));else if(v.isDataTexture)if(We.length>0&&je){et&&pt&&t.texStorage2D(i.TEXTURE_2D,Ye,Re,We[0].width,We[0].height);for(let ce=0,L=We.length;ce<L;ce++)ve=We[ce],et?t.texSubImage2D(i.TEXTURE_2D,ce,0,0,ve.width,ve.height,$e,Fe,ve.data):t.texImage2D(i.TEXTURE_2D,ce,Re,ve.width,ve.height,0,$e,Fe,ve.data);v.generateMipmaps=!1}else et?(pt&&t.texStorage2D(i.TEXTURE_2D,Ye,Re,ne.width,ne.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,ne.width,ne.height,$e,Fe,ne.data)):t.texImage2D(i.TEXTURE_2D,0,Re,ne.width,ne.height,0,$e,Fe,ne.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){et&&pt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ye,Re,We[0].width,We[0].height,ne.depth);for(let ce=0,L=We.length;ce<L;ce++)ve=We[ce],v.format!==hn?$e!==null?et?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ce,0,0,0,ve.width,ve.height,ne.depth,$e,ve.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ce,Re,ve.width,ve.height,ne.depth,0,ve.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):et?t.texSubImage3D(i.TEXTURE_2D_ARRAY,ce,0,0,0,ve.width,ve.height,ne.depth,$e,Fe,ve.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ce,Re,ve.width,ve.height,ne.depth,0,$e,Fe,ve.data)}else{et&&pt&&t.texStorage2D(i.TEXTURE_2D,Ye,Re,We[0].width,We[0].height);for(let ce=0,L=We.length;ce<L;ce++)ve=We[ce],v.format!==hn?$e!==null?et?t.compressedTexSubImage2D(i.TEXTURE_2D,ce,0,0,ve.width,ve.height,$e,ve.data):t.compressedTexImage2D(i.TEXTURE_2D,ce,Re,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):et?t.texSubImage2D(i.TEXTURE_2D,ce,0,0,ve.width,ve.height,$e,Fe,ve.data):t.texImage2D(i.TEXTURE_2D,ce,Re,ve.width,ve.height,0,$e,Fe,ve.data)}else if(v.isDataArrayTexture)et?(pt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ye,Re,ne.width,ne.height,ne.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,$e,Fe,ne.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,Re,ne.width,ne.height,ne.depth,0,$e,Fe,ne.data);else if(v.isData3DTexture)et?(pt&&t.texStorage3D(i.TEXTURE_3D,Ye,Re,ne.width,ne.height,ne.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,$e,Fe,ne.data)):t.texImage3D(i.TEXTURE_3D,0,Re,ne.width,ne.height,ne.depth,0,$e,Fe,ne.data);else if(v.isFramebufferTexture){if(pt)if(et)t.texStorage2D(i.TEXTURE_2D,Ye,Re,ne.width,ne.height);else{let ce=ne.width,L=ne.height;for(let de=0;de<Ye;de++)t.texImage2D(i.TEXTURE_2D,de,Re,ce,L,0,$e,Fe,null),ce>>=1,L>>=1}}else if(We.length>0&&je){et&&pt&&t.texStorage2D(i.TEXTURE_2D,Ye,Re,We[0].width,We[0].height);for(let ce=0,L=We.length;ce<L;ce++)ve=We[ce],et?t.texSubImage2D(i.TEXTURE_2D,ce,0,0,$e,Fe,ve):t.texImage2D(i.TEXTURE_2D,ce,Re,$e,Fe,ve);v.generateMipmaps=!1}else et?(pt&&t.texStorage2D(i.TEXTURE_2D,Ye,Re,ne.width,ne.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,$e,Fe,ne)):t.texImage2D(i.TEXTURE_2D,0,Re,$e,Fe,ne);y(v,je)&&x(se),Se.__version=Q.version,v.onUpdate&&v.onUpdate(v)}w.__version=v.version}function we(w,v,O){if(v.image.length!==6)return;let se=ee(w,v),te=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+O);let Q=n.get(te);if(te.version!==Q.__version||se===!0){t.activeTexture(i.TEXTURE0+O);let Se=tt.getPrimaries(tt.workingColorSpace),ue=v.colorSpace===nn?null:tt.getPrimaries(v.colorSpace),ye=v.colorSpace===nn||Se===ue?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let Pe=v.isCompressedTexture||v.image[0].isCompressedTexture,Ve=v.image[0]&&v.image[0].isDataTexture,ne=[];for(let ce=0;ce<6;ce++)!Pe&&!Ve?ne[ce]=_(v.image[ce],!1,!0,r.maxCubemapSize):ne[ce]=Ve?v.image[ce].image:v.image[ce],ne[ce]=ge(v,ne[ce]);let je=ne[0],$e=m(je)||a,Fe=s.convert(v.format,v.colorSpace),Re=s.convert(v.type),ve=S(v.internalFormat,Fe,Re,v.colorSpace),We=a&&v.isVideoTexture!==!0,et=Q.__version===void 0||se===!0,pt=C(v,je,$e);W(i.TEXTURE_CUBE_MAP,v,$e);let Ye;if(Pe){We&&et&&t.texStorage2D(i.TEXTURE_CUBE_MAP,pt,ve,je.width,je.height);for(let ce=0;ce<6;ce++){Ye=ne[ce].mipmaps;for(let L=0;L<Ye.length;L++){let de=Ye[L];v.format!==hn?Fe!==null?We?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,L,0,0,de.width,de.height,Fe,de.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,L,ve,de.width,de.height,0,de.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):We?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,L,0,0,de.width,de.height,Fe,Re,de.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,L,ve,de.width,de.height,0,Fe,Re,de.data)}}}else{Ye=v.mipmaps,We&&et&&(Ye.length>0&&pt++,t.texStorage2D(i.TEXTURE_CUBE_MAP,pt,ve,ne[0].width,ne[0].height));for(let ce=0;ce<6;ce++)if(Ve){We?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,0,0,ne[ce].width,ne[ce].height,Fe,Re,ne[ce].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,ve,ne[ce].width,ne[ce].height,0,Fe,Re,ne[ce].data);for(let L=0;L<Ye.length;L++){let fe=Ye[L].image[ce].image;We?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,L+1,0,0,fe.width,fe.height,Fe,Re,fe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,L+1,ve,fe.width,fe.height,0,Fe,Re,fe.data)}}else{We?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,0,0,Fe,Re,ne[ce]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,ve,Fe,Re,ne[ce]);for(let L=0;L<Ye.length;L++){let de=Ye[L];We?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,L+1,0,0,Fe,Re,de.image[ce]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,L+1,ve,Fe,Re,de.image[ce])}}}y(v,$e)&&x(i.TEXTURE_CUBE_MAP),Q.__version=te.version,v.onUpdate&&v.onUpdate(v)}w.__version=v.version}function xe(w,v,O,se,te,Q){let Se=s.convert(O.format,O.colorSpace),ue=s.convert(O.type),ye=S(O.internalFormat,Se,ue,O.colorSpace);if(!n.get(v).__hasExternalTextures){let Ve=Math.max(1,v.width>>Q),ne=Math.max(1,v.height>>Q);te===i.TEXTURE_3D||te===i.TEXTURE_2D_ARRAY?t.texImage3D(te,Q,ye,Ve,ne,v.depth,0,Se,ue,null):t.texImage2D(te,Q,ye,Ve,ne,0,Se,ue,null)}t.bindFramebuffer(i.FRAMEBUFFER,w),q(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,se,te,n.get(O).__webglTexture,0,oe(v)):(te===i.TEXTURE_2D||te>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,se,te,n.get(O).__webglTexture,Q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function De(w,v,O){if(i.bindRenderbuffer(i.RENDERBUFFER,w),v.depthBuffer&&!v.stencilBuffer){let se=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(O||q(v)){let te=v.depthTexture;te&&te.isDepthTexture&&(te.type===Hn?se=i.DEPTH_COMPONENT32F:te.type===Vn&&(se=i.DEPTH_COMPONENT24));let Q=oe(v);q(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Q,se,v.width,v.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,Q,se,v.width,v.height)}else i.renderbufferStorage(i.RENDERBUFFER,se,v.width,v.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,w)}else if(v.depthBuffer&&v.stencilBuffer){let se=oe(v);O&&q(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,se,i.DEPTH24_STENCIL8,v.width,v.height):q(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,se,i.DEPTH24_STENCIL8,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,w)}else{let se=v.isWebGLMultipleRenderTargets===!0?v.texture:[v.texture];for(let te=0;te<se.length;te++){let Q=se[te],Se=s.convert(Q.format,Q.colorSpace),ue=s.convert(Q.type),ye=S(Q.internalFormat,Se,ue,Q.colorSpace),Pe=oe(v);O&&q(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Pe,ye,v.width,v.height):q(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Pe,ye,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,ye,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ke(w,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,w),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(v.depthTexture).__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),V(v.depthTexture,0);let se=n.get(v.depthTexture).__webglTexture,te=oe(v);if(v.depthTexture.format===ui)q(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,se,0,te):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,se,0);else if(v.depthTexture.format===Ji)q(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,se,0,te):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,se,0);else throw new Error("Unknown depthTexture format")}function Ee(w){let v=n.get(w),O=w.isWebGLCubeRenderTarget===!0;if(w.depthTexture&&!v.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");ke(v.__webglFramebuffer,w)}else if(O){v.__webglDepthbuffer=[];for(let se=0;se<6;se++)t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[se]),v.__webglDepthbuffer[se]=i.createRenderbuffer(),De(v.__webglDepthbuffer[se],w,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer=i.createRenderbuffer(),De(v.__webglDepthbuffer,w,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function Oe(w,v,O){let se=n.get(w);v!==void 0&&xe(se.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&Ee(w)}function P(w){let v=w.texture,O=n.get(w),se=n.get(v);w.addEventListener("dispose",D),w.isWebGLMultipleRenderTargets!==!0&&(se.__webglTexture===void 0&&(se.__webglTexture=i.createTexture()),se.__version=v.version,o.memory.textures++);let te=w.isWebGLCubeRenderTarget===!0,Q=w.isWebGLMultipleRenderTargets===!0,Se=m(w)||a;if(te){O.__webglFramebuffer=[];for(let ue=0;ue<6;ue++)if(a&&v.mipmaps&&v.mipmaps.length>0){O.__webglFramebuffer[ue]=[];for(let ye=0;ye<v.mipmaps.length;ye++)O.__webglFramebuffer[ue][ye]=i.createFramebuffer()}else O.__webglFramebuffer[ue]=i.createFramebuffer()}else{if(a&&v.mipmaps&&v.mipmaps.length>0){O.__webglFramebuffer=[];for(let ue=0;ue<v.mipmaps.length;ue++)O.__webglFramebuffer[ue]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(Q)if(r.drawBuffers){let ue=w.texture;for(let ye=0,Pe=ue.length;ye<Pe;ye++){let Ve=n.get(ue[ye]);Ve.__webglTexture===void 0&&(Ve.__webglTexture=i.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&w.samples>0&&q(w)===!1){let ue=Q?v:[v];O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ye=0;ye<ue.length;ye++){let Pe=ue[ye];O.__webglColorRenderbuffer[ye]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[ye]);let Ve=s.convert(Pe.format,Pe.colorSpace),ne=s.convert(Pe.type),je=S(Pe.internalFormat,Ve,ne,Pe.colorSpace,w.isXRRenderTarget===!0),$e=oe(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,$e,je,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,O.__webglColorRenderbuffer[ye])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),De(O.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(te){t.bindTexture(i.TEXTURE_CUBE_MAP,se.__webglTexture),W(i.TEXTURE_CUBE_MAP,v,Se);for(let ue=0;ue<6;ue++)if(a&&v.mipmaps&&v.mipmaps.length>0)for(let ye=0;ye<v.mipmaps.length;ye++)xe(O.__webglFramebuffer[ue][ye],w,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ue,ye);else xe(O.__webglFramebuffer[ue],w,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0);y(v,Se)&&x(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Q){let ue=w.texture;for(let ye=0,Pe=ue.length;ye<Pe;ye++){let Ve=ue[ye],ne=n.get(Ve);t.bindTexture(i.TEXTURE_2D,ne.__webglTexture),W(i.TEXTURE_2D,Ve,Se),xe(O.__webglFramebuffer,w,Ve,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,0),y(Ve,Se)&&x(i.TEXTURE_2D)}t.unbindTexture()}else{let ue=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(a?ue=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ue,se.__webglTexture),W(ue,v,Se),a&&v.mipmaps&&v.mipmaps.length>0)for(let ye=0;ye<v.mipmaps.length;ye++)xe(O.__webglFramebuffer[ye],w,v,i.COLOR_ATTACHMENT0,ue,ye);else xe(O.__webglFramebuffer,w,v,i.COLOR_ATTACHMENT0,ue,0);y(v,Se)&&x(ue),t.unbindTexture()}w.depthBuffer&&Ee(w)}function le(w){let v=m(w)||a,O=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let se=0,te=O.length;se<te;se++){let Q=O[se];if(y(Q,v)){let Se=w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,ue=n.get(Q).__webglTexture;t.bindTexture(Se,ue),x(Se),t.unbindTexture()}}}function Y(w){if(a&&w.samples>0&&q(w)===!1){let v=w.isWebGLMultipleRenderTargets?w.texture:[w.texture],O=w.width,se=w.height,te=i.COLOR_BUFFER_BIT,Q=[],Se=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=n.get(w),ye=w.isWebGLMultipleRenderTargets===!0;if(ye)for(let Pe=0;Pe<v.length;Pe++)t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ue.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglFramebuffer);for(let Pe=0;Pe<v.length;Pe++){Q.push(i.COLOR_ATTACHMENT0+Pe),w.depthBuffer&&Q.push(Se);let Ve=ue.__ignoreDepthValues!==void 0?ue.__ignoreDepthValues:!1;if(Ve===!1&&(w.depthBuffer&&(te|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&(te|=i.STENCIL_BUFFER_BIT)),ye&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ue.__webglColorRenderbuffer[Pe]),Ve===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[Se]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[Se])),ye){let ne=n.get(v[Pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ne,0)}i.blitFramebuffer(0,0,O,se,0,0,O,se,te,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Q)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ye)for(let Pe=0;Pe<v.length;Pe++){t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pe,i.RENDERBUFFER,ue.__webglColorRenderbuffer[Pe]);let Ve=n.get(v[Pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pe,i.TEXTURE_2D,Ve,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglMultisampledFramebuffer)}}function oe(w){return Math.min(r.maxSamples,w.samples)}function q(w){let v=n.get(w);return a&&w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function Ae(w){let v=o.render.frame;h.get(w)!==v&&(h.set(w,v),w.update())}function ge(w,v){let O=w.colorSpace,se=w.format,te=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||w.format===ea||O!==Pn&&O!==nn&&(tt.getTransfer(O)===st?a===!1?e.has("EXT_sRGB")===!0&&se===hn?(w.format=ea,w.minFilter=tn,w.generateMipmaps=!1):v=ws.sRGBToLinear(v):(se!==hn||te!==qn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),v}this.allocateTextureUnit=I,this.resetTextureUnits=j,this.setTexture2D=V,this.setTexture2DArray=Z,this.setTexture3D=K,this.setTextureCube=X,this.rebindTextures=Oe,this.setupRenderTarget=P,this.updateRenderTargetMipmap=le,this.updateMultisampleRenderTarget=Y,this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=q}function H0(i,e,t){let n=t.isWebGL2;function r(s,o=nn){let a,l=tt.getTransfer(o);if(s===qn)return i.UNSIGNED_BYTE;if(s===Yc)return i.UNSIGNED_SHORT_4_4_4_4;if(s===Zc)return i.UNSIGNED_SHORT_5_5_5_1;if(s===Nu)return i.BYTE;if(s===Ou)return i.SHORT;if(s===ka)return i.UNSIGNED_SHORT;if(s===qc)return i.INT;if(s===Vn)return i.UNSIGNED_INT;if(s===Hn)return i.FLOAT;if(s===br)return n?i.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===Fu)return i.ALPHA;if(s===hn)return i.RGBA;if(s===Bu)return i.LUMINANCE;if(s===zu)return i.LUMINANCE_ALPHA;if(s===ui)return i.DEPTH_COMPONENT;if(s===Ji)return i.DEPTH_STENCIL;if(s===ea)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===ku)return i.RED;if(s===Kc)return i.RED_INTEGER;if(s===Gu)return i.RG;if(s===Jc)return i.RG_INTEGER;if(s===$c)return i.RGBA_INTEGER;if(s===po||s===mo||s===go||s===_o)if(l===st)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===po)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===mo)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===go)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===_o)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===po)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===mo)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===go)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===_o)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===yl||s===vl||s===Ml||s===bl)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===yl)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===vl)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Ml)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===bl)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===jc)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Sl||s===wl)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===Sl)return l===st?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===wl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===El||s===Tl||s===Al||s===Rl||s===Cl||s===Pl||s===Il||s===Ll||s===Dl||s===Ul||s===Nl||s===Ol||s===Fl||s===Bl)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===El)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Tl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Al)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Rl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Cl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Pl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Il)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Ll)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Dl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Ul)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Nl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Ol)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Fl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Bl)return l===st?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===xo||s===zl||s===kl)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===xo)return l===st?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===zl)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===kl)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Vu||s===Gl||s===Vl||s===Hl)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===xo)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Gl)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Vl)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Hl)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===hi?n?i.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[s]!==void 0?i[s]:null}return{convert:r}}var ga=class extends Ut{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Me=class extends Gt{constructor(){super(),this.isGroup=!0,this.type="Group"}},W0={type:"move"},xr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Me,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Me,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Me,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),f=this._getHandJoint(c,_);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(W0)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Me;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},_a=class extends Jn{constructor(e,t){super();let n=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,g=null,_=t.getContextAttributes(),m=null,f=null,y=[],x=[],S=new J,C=null,T=new Ut;T.layers.enable(1),T.viewport=new lt;let A=new Ut;A.layers.enable(2),A.viewport=new lt;let D=[T,A],M=new ga;M.layers.enable(1),M.layers.enable(2);let b=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let ee=y[W];return ee===void 0&&(ee=new xr,y[W]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(W){let ee=y[W];return ee===void 0&&(ee=new xr,y[W]=ee),ee.getGripSpace()},this.getHand=function(W){let ee=y[W];return ee===void 0&&(ee=new xr,y[W]=ee),ee.getHandSpace()};function H(W){let ee=x.indexOf(W.inputSource);if(ee===-1)return;let me=y[ee];me!==void 0&&(me.update(W.inputSource,W.frame,c||o),me.dispatchEvent({type:W.type,data:W.inputSource}))}function j(){r.removeEventListener("select",H),r.removeEventListener("selectstart",H),r.removeEventListener("selectend",H),r.removeEventListener("squeeze",H),r.removeEventListener("squeezestart",H),r.removeEventListener("squeezeend",H),r.removeEventListener("end",j),r.removeEventListener("inputsourceschange",I);for(let W=0;W<y.length;W++){let ee=x[W];ee!==null&&(x[W]=null,y[W].disconnect(ee))}b=null,U=null,e.setRenderTarget(m),p=null,d=null,u=null,r=null,f=null,pe.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){s=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){a=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(W){if(r=W,r!==null){if(m=e.getRenderTarget(),r.addEventListener("select",H),r.addEventListener("selectstart",H),r.addEventListener("selectend",H),r.addEventListener("squeeze",H),r.addEventListener("squeezestart",H),r.addEventListener("squeezeend",H),r.addEventListener("end",j),r.addEventListener("inputsourceschange",I),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let ee={antialias:r.renderState.layers===void 0?_.antialias:!0,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,ee),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),f=new In(p.framebufferWidth,p.framebufferHeight,{format:hn,type:qn,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil})}else{let ee=null,me=null,we=null;_.depth&&(we=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=_.stencil?Ji:ui,me=_.stencil?hi:Vn);let xe={colorFormat:t.RGBA8,depthFormat:we,scaleFactor:s};u=new XRWebGLBinding(r,t),d=u.createProjectionLayer(xe),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),f=new In(d.textureWidth,d.textureHeight,{format:hn,type:qn,depthTexture:new Us(d.textureWidth,d.textureHeight,me,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0});let De=e.properties.get(f);De.__ignoreDepthValues=d.ignoreDepthValues}f.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),pe.setContext(r),pe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function I(W){for(let ee=0;ee<W.removed.length;ee++){let me=W.removed[ee],we=x.indexOf(me);we>=0&&(x[we]=null,y[we].disconnect(me))}for(let ee=0;ee<W.added.length;ee++){let me=W.added[ee],we=x.indexOf(me);if(we===-1){for(let De=0;De<y.length;De++)if(De>=x.length){x.push(me),we=De;break}else if(x[De]===null){x[De]=me,we=De;break}if(we===-1)break}let xe=y[we];xe&&xe.connect(me)}}let F=new R,V=new R;function Z(W,ee,me){F.setFromMatrixPosition(ee.matrixWorld),V.setFromMatrixPosition(me.matrixWorld);let we=F.distanceTo(V),xe=ee.projectionMatrix.elements,De=me.projectionMatrix.elements,ke=xe[14]/(xe[10]-1),Ee=xe[14]/(xe[10]+1),Oe=(xe[9]+1)/xe[5],P=(xe[9]-1)/xe[5],le=(xe[8]-1)/xe[0],Y=(De[8]+1)/De[0],oe=ke*le,q=ke*Y,Ae=we/(-le+Y),ge=Ae*-le;ee.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(ge),W.translateZ(Ae),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert();let w=ke+Ae,v=Ee+Ae,O=oe-ge,se=q+(we-ge),te=Oe*Ee/v*w,Q=P*Ee/v*w;W.projectionMatrix.makePerspective(O,se,te,Q,w,v),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}function K(W,ee){ee===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(ee.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(r===null)return;M.near=A.near=T.near=W.near,M.far=A.far=T.far=W.far,(b!==M.near||U!==M.far)&&(r.updateRenderState({depthNear:M.near,depthFar:M.far}),b=M.near,U=M.far);let ee=W.parent,me=M.cameras;K(M,ee);for(let we=0;we<me.length;we++)K(me[we],ee);me.length===2?Z(M,T,A):M.projectionMatrix.copy(T.projectionMatrix),X(W,M,ee)};function X(W,ee,me){me===null?W.matrix.copy(ee.matrixWorld):(W.matrix.copy(me.matrixWorld),W.matrix.invert(),W.matrix.multiply(ee.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(ee.projectionMatrix),W.projectionMatrixInverse.copy(ee.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=ta*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(W){l=W,d!==null&&(d.fixedFoveation=W),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=W)};let ie=null;function re(W,ee){if(h=ee.getViewerPose(c||o),g=ee,h!==null){let me=h.views;p!==null&&(e.setRenderTargetFramebuffer(f,p.framebuffer),e.setRenderTarget(f));let we=!1;me.length!==M.cameras.length&&(M.cameras.length=0,we=!0);for(let xe=0;xe<me.length;xe++){let De=me[xe],ke=null;if(p!==null)ke=p.getViewport(De);else{let Oe=u.getViewSubImage(d,De);ke=Oe.viewport,xe===0&&(e.setRenderTargetTextures(f,Oe.colorTexture,d.ignoreDepthValues?void 0:Oe.depthStencilTexture),e.setRenderTarget(f))}let Ee=D[xe];Ee===void 0&&(Ee=new Ut,Ee.layers.enable(xe),Ee.viewport=new lt,D[xe]=Ee),Ee.matrix.fromArray(De.transform.matrix),Ee.matrix.decompose(Ee.position,Ee.quaternion,Ee.scale),Ee.projectionMatrix.fromArray(De.projectionMatrix),Ee.projectionMatrixInverse.copy(Ee.projectionMatrix).invert(),Ee.viewport.set(ke.x,ke.y,ke.width,ke.height),xe===0&&(M.matrix.copy(Ee.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),we===!0&&M.cameras.push(Ee)}}for(let me=0;me<y.length;me++){let we=x[me],xe=y[me];we!==null&&xe!==void 0&&xe.update(we,ee,c||o)}ie&&ie(W,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}let pe=new ah;pe.setAnimationLoop(re),this.setAnimationLoop=function(W){ie=W},this.dispose=function(){}}};function X0(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,oh(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function r(m,f,y,x,S){f.isMeshBasicMaterial||f.isMeshLambertMaterial?s(m,f):f.isMeshToonMaterial?(s(m,f),u(m,f)):f.isMeshPhongMaterial?(s(m,f),h(m,f)):f.isMeshStandardMaterial?(s(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,S)):f.isMeshMatcapMaterial?(s(m,f),g(m,f)):f.isMeshDepthMaterial?s(m,f):f.isMeshDistanceMaterial?(s(m,f),_(m,f)):f.isMeshNormalMaterial?s(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,y,x):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===At&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===At&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let y=e.get(f).envMap;if(y&&(m.envMap.value=y,m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap){m.lightMap.value=f.lightMap;let x=i._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=f.lightMapIntensity*x,t(f.lightMap,m.lightMapTransform)}f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,y,x){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*y,m.scale.value=x*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),e.get(f).envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,y){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===At&&m.clearcoatNormalScale.value.negate())),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function _(m,f){let y=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function q0(i,e,t,n){let r={},s={},o=[],a=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(y,x){let S=x.program;n.uniformBlockBinding(y,S)}function c(y,x){let S=r[y.id];S===void 0&&(g(y),S=h(y),r[y.id]=S,y.addEventListener("dispose",m));let C=x.program;n.updateUBOMapping(y,C);let T=e.render.frame;s[y.id]!==T&&(d(y),s[y.id]=T)}function h(y){let x=u();y.__bindingPointIndex=x;let S=i.createBuffer(),C=y.__size,T=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,C,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,S),S}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let x=r[y.id],S=y.uniforms,C=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let T=0,A=S.length;T<A;T++){let D=Array.isArray(S[T])?S[T]:[S[T]];for(let M=0,b=D.length;M<b;M++){let U=D[M];if(p(U,T,M,C)===!0){let H=U.__offset,j=Array.isArray(U.value)?U.value:[U.value],I=0;for(let F=0;F<j.length;F++){let V=j[F],Z=_(V);typeof V=="number"||typeof V=="boolean"?(U.__data[0]=V,i.bufferSubData(i.UNIFORM_BUFFER,H+I,U.__data)):V.isMatrix3?(U.__data[0]=V.elements[0],U.__data[1]=V.elements[1],U.__data[2]=V.elements[2],U.__data[3]=0,U.__data[4]=V.elements[3],U.__data[5]=V.elements[4],U.__data[6]=V.elements[5],U.__data[7]=0,U.__data[8]=V.elements[6],U.__data[9]=V.elements[7],U.__data[10]=V.elements[8],U.__data[11]=0):(V.toArray(U.__data,I),I+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,H,U.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(y,x,S,C){let T=y.value,A=x+"_"+S;if(C[A]===void 0)return typeof T=="number"||typeof T=="boolean"?C[A]=T:C[A]=T.clone(),!0;{let D=C[A];if(typeof T=="number"||typeof T=="boolean"){if(D!==T)return C[A]=T,!0}else if(D.equals(T)===!1)return D.copy(T),!0}return!1}function g(y){let x=y.uniforms,S=0,C=16;for(let A=0,D=x.length;A<D;A++){let M=Array.isArray(x[A])?x[A]:[x[A]];for(let b=0,U=M.length;b<U;b++){let H=M[b],j=Array.isArray(H.value)?H.value:[H.value];for(let I=0,F=j.length;I<F;I++){let V=j[I],Z=_(V),K=S%C;K!==0&&C-K<Z.boundary&&(S+=C-K),H.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=S,S+=Z.storage}}}let T=S%C;return T>0&&(S+=C-T),y.__size=S,y.__cache={},this}function _(y){let x={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(x.boundary=4,x.storage=4):y.isVector2?(x.boundary=8,x.storage=8):y.isVector3||y.isColor?(x.boundary=16,x.storage=12):y.isVector4?(x.boundary=16,x.storage=16):y.isMatrix3?(x.boundary=48,x.storage=48):y.isMatrix4?(x.boundary=64,x.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),x}function m(y){let x=y.target;x.removeEventListener("dispose",m);let S=o.indexOf(x.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(r[x.id]),delete r[x.id],delete s[x.id]}function f(){for(let y in r)i.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:f}}var wr=class{constructor(e={}){let{canvas:t=ed(),context:n=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=o;let p=new Uint32Array(4),g=new Int32Array(4),_=null,m=null,f=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=ut,this._useLegacyLights=!1,this.toneMapping=Xn,this.toneMappingExposure=1;let x=this,S=!1,C=0,T=0,A=null,D=-1,M=null,b=new lt,U=new lt,H=null,j=new Je(0),I=0,F=t.width,V=t.height,Z=1,K=null,X=null,ie=new lt(0,0,F,V),re=new lt(0,0,F,V),pe=!1,W=new Sr,ee=!1,me=!1,we=null,xe=new ot,De=new J,ke=new R,Ee={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Oe(){return A===null?Z:1}let P=n;function le(E,N){for(let z=0;z<E.length;z++){let G=E[z],B=t.getContext(G,N);if(B!==null)return B}return null}try{let E={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",ce,!1),t.addEventListener("webglcontextrestored",L,!1),t.addEventListener("webglcontextcreationerror",de,!1),P===null){let N=["webgl2","webgl","experimental-webgl"];if(x.isWebGL1Renderer===!0&&N.shift(),P=le(N,E),P===null)throw le(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&P instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),P.getShaderPrecisionFormat===void 0&&(P.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Y,oe,q,Ae,ge,w,v,O,se,te,Q,Se,ue,ye,Pe,Ve,ne,je,$e,Fe,Re,ve,We,et;function pt(){Y=new um(P),oe=new sm(P,Y,e),Y.init(oe),ve=new H0(P,Y,oe),q=new G0(P,Y,oe),Ae=new pm(P),ge=new C0,w=new V0(P,Y,q,ge,oe,ve,Ae),v=new am(x),O=new hm(x),se=new Md(P,oe),We=new im(P,Y,se,oe),te=new dm(P,se,Ae,We),Q=new xm(P,te,se,Ae),$e=new _m(P,oe,w),Ve=new om(ge),Se=new R0(x,v,O,Y,oe,We,Ve),ue=new X0(x,ge),ye=new I0,Pe=new F0(Y,oe),je=new nm(x,v,O,q,Q,d,l),ne=new k0(x,Q,oe),et=new q0(P,Ae,oe,q),Fe=new rm(P,Y,Ae,oe),Re=new fm(P,Y,Ae,oe),Ae.programs=Se.programs,x.capabilities=oe,x.extensions=Y,x.properties=ge,x.renderLists=ye,x.shadowMap=ne,x.state=q,x.info=Ae}pt();let Ye=new _a(x,P);this.xr=Ye,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let E=Y.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=Y.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(E){E!==void 0&&(Z=E,this.setSize(F,V,!1))},this.getSize=function(E){return E.set(F,V)},this.setSize=function(E,N,z=!0){if(Ye.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}F=E,V=N,t.width=Math.floor(E*Z),t.height=Math.floor(N*Z),z===!0&&(t.style.width=E+"px",t.style.height=N+"px"),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set(F*Z,V*Z).floor()},this.setDrawingBufferSize=function(E,N,z){F=E,V=N,Z=z,t.width=Math.floor(E*z),t.height=Math.floor(N*z),this.setViewport(0,0,E,N)},this.getCurrentViewport=function(E){return E.copy(b)},this.getViewport=function(E){return E.copy(ie)},this.setViewport=function(E,N,z,G){E.isVector4?ie.set(E.x,E.y,E.z,E.w):ie.set(E,N,z,G),q.viewport(b.copy(ie).multiplyScalar(Z).floor())},this.getScissor=function(E){return E.copy(re)},this.setScissor=function(E,N,z,G){E.isVector4?re.set(E.x,E.y,E.z,E.w):re.set(E,N,z,G),q.scissor(U.copy(re).multiplyScalar(Z).floor())},this.getScissorTest=function(){return pe},this.setScissorTest=function(E){q.setScissorTest(pe=E)},this.setOpaqueSort=function(E){K=E},this.setTransparentSort=function(E){X=E},this.getClearColor=function(E){return E.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor.apply(je,arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha.apply(je,arguments)},this.clear=function(E=!0,N=!0,z=!0){let G=0;if(E){let B=!1;if(A!==null){let _e=A.texture.format;B=_e===$c||_e===Jc||_e===Kc}if(B){let _e=A.texture.type,Te=_e===qn||_e===Vn||_e===ka||_e===hi||_e===Yc||_e===Zc,Le=je.getClearColor(),Ne=je.getClearAlpha(),qe=Le.r,Ge=Le.g,He=Le.b;Te?(p[0]=qe,p[1]=Ge,p[2]=He,p[3]=Ne,P.clearBufferuiv(P.COLOR,0,p)):(g[0]=qe,g[1]=Ge,g[2]=He,g[3]=Ne,P.clearBufferiv(P.COLOR,0,g))}else G|=P.COLOR_BUFFER_BIT}N&&(G|=P.DEPTH_BUFFER_BIT),z&&(G|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ce,!1),t.removeEventListener("webglcontextrestored",L,!1),t.removeEventListener("webglcontextcreationerror",de,!1),ye.dispose(),Pe.dispose(),ge.dispose(),v.dispose(),O.dispose(),Q.dispose(),We.dispose(),et.dispose(),Se.dispose(),Ye.dispose(),Ye.removeEventListener("sessionstart",Ot),Ye.removeEventListener("sessionend",rt),we&&(we.dispose(),we=null),Ft.stop()};function ce(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function L(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;let E=Ae.autoReset,N=ne.enabled,z=ne.autoUpdate,G=ne.needsUpdate,B=ne.type;pt(),Ae.autoReset=E,ne.enabled=N,ne.autoUpdate=z,ne.needsUpdate=G,ne.type=B}function de(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function fe(E){let N=E.target;N.removeEventListener("dispose",fe),Ue(N)}function Ue(E){Ie(E),ge.remove(E)}function Ie(E){let N=ge.get(E).programs;N!==void 0&&(N.forEach(function(z){Se.releaseProgram(z)}),E.isShaderMaterial&&Se.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,z,G,B,_e){N===null&&(N=Ee);let Te=B.isMesh&&B.matrixWorld.determinant()<0,Le=jh(E,N,z,G,B);q.setMaterial(G,Te);let Ne=z.index,qe=1;if(G.wireframe===!0){if(Ne=te.getWireframeAttribute(z),Ne===void 0)return;qe=2}let Ge=z.drawRange,He=z.attributes.position,gt=Ge.start*qe,Yt=(Ge.start+Ge.count)*qe;_e!==null&&(gt=Math.max(gt,_e.start*qe),Yt=Math.min(Yt,(_e.start+_e.count)*qe)),Ne!==null?(gt=Math.max(gt,0),Yt=Math.min(Yt,Ne.count)):He!=null&&(gt=Math.max(gt,0),Yt=Math.min(Yt,He.count));let Et=Yt-gt;if(Et<0||Et===1/0)return;We.setup(B,G,Le,z,Ne);let Mn,ht=Fe;if(Ne!==null&&(Mn=se.get(Ne),ht=Re,ht.setIndex(Mn)),B.isMesh)G.wireframe===!0?(q.setLineWidth(G.wireframeLinewidth*Oe()),ht.setMode(P.LINES)):ht.setMode(P.TRIANGLES);else if(B.isLine){let Ze=G.linewidth;Ze===void 0&&(Ze=1),q.setLineWidth(Ze*Oe()),B.isLineSegments?ht.setMode(P.LINES):B.isLineLoop?ht.setMode(P.LINE_LOOP):ht.setMode(P.LINE_STRIP)}else B.isPoints?ht.setMode(P.POINTS):B.isSprite&&ht.setMode(P.TRIANGLES);if(B.isBatchedMesh)ht.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else if(B.isInstancedMesh)ht.renderInstances(gt,Et,B.count);else if(z.isInstancedBufferGeometry){let Ze=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,lo=Math.min(z.instanceCount,Ze);ht.renderInstances(gt,Et,lo)}else ht.render(gt,Et)};function nt(E,N,z){E.transparent===!0&&E.side===Nt&&E.forceSinglePass===!1?(E.side=At,E.needsUpdate=!0,Vr(E,N,z),E.side=Zn,E.needsUpdate=!0,Vr(E,N,z),E.side=Nt):Vr(E,N,z)}this.compile=function(E,N,z=null){z===null&&(z=E),m=Pe.get(z),m.init(),y.push(m),z.traverseVisible(function(B){B.isLight&&B.layers.test(N.layers)&&(m.pushLight(B),B.castShadow&&m.pushShadow(B))}),E!==z&&E.traverseVisible(function(B){B.isLight&&B.layers.test(N.layers)&&(m.pushLight(B),B.castShadow&&m.pushShadow(B))}),m.setupLights(x._useLegacyLights);let G=new Set;return E.traverse(function(B){let _e=B.material;if(_e)if(Array.isArray(_e))for(let Te=0;Te<_e.length;Te++){let Le=_e[Te];nt(Le,z,B),G.add(Le)}else nt(_e,z,B),G.add(_e)}),y.pop(),m=null,G},this.compileAsync=function(E,N,z=null){let G=this.compile(E,N,z);return new Promise(B=>{function _e(){if(G.forEach(function(Te){ge.get(Te).currentProgram.isReady()&&G.delete(Te)}),G.size===0){B(E);return}setTimeout(_e,10)}Y.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let it=null;function wt(E){it&&it(E)}function Ot(){Ft.stop()}function rt(){Ft.start()}let Ft=new ah;Ft.setAnimationLoop(wt),typeof self<"u"&&Ft.setContext(self),this.setAnimationLoop=function(E){it=E,Ye.setAnimationLoop(E),E===null?Ft.stop():Ft.start()},Ye.addEventListener("sessionstart",Ot),Ye.addEventListener("sessionend",rt),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Ye.enabled===!0&&Ye.isPresenting===!0&&(Ye.cameraAutoUpdate===!0&&Ye.updateCamera(N),N=Ye.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,N,A),m=Pe.get(E,y.length),m.init(),y.push(m),xe.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),W.setFromProjectionMatrix(xe),me=this.localClippingEnabled,ee=Ve.init(this.clippingPlanes,me),_=ye.get(E,f.length),_.init(),f.push(_),mn(E,N,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(K,X),this.info.render.frame++,ee===!0&&Ve.beginShadows();let z=m.state.shadowsArray;if(ne.render(z,E,N),ee===!0&&Ve.endShadows(),this.info.autoReset===!0&&this.info.reset(),je.render(_,E),m.setupLights(x._useLegacyLights),N.isArrayCamera){let G=N.cameras;for(let B=0,_e=G.length;B<_e;B++){let Te=G[B];al(_,E,Te,Te.viewport)}}else al(_,E,N);A!==null&&(w.updateMultisampleRenderTarget(A),w.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(x,E,N),We.resetDefaultState(),D=-1,M=null,y.pop(),y.length>0?m=y[y.length-1]:m=null,f.pop(),f.length>0?_=f[f.length-1]:_=null};function mn(E,N,z,G){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)z=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLight)m.pushLight(E),E.castShadow&&m.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||W.intersectsSprite(E)){G&&ke.setFromMatrixPosition(E.matrixWorld).applyMatrix4(xe);let Te=Q.update(E),Le=E.material;Le.visible&&_.push(E,Te,Le,z,ke.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||W.intersectsObject(E))){let Te=Q.update(E),Le=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),ke.copy(E.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),ke.copy(Te.boundingSphere.center)),ke.applyMatrix4(E.matrixWorld).applyMatrix4(xe)),Array.isArray(Le)){let Ne=Te.groups;for(let qe=0,Ge=Ne.length;qe<Ge;qe++){let He=Ne[qe],gt=Le[He.materialIndex];gt&&gt.visible&&_.push(E,Te,gt,z,ke.z,He)}}else Le.visible&&_.push(E,Te,Le,z,ke.z,null)}}let _e=E.children;for(let Te=0,Le=_e.length;Te<Le;Te++)mn(_e[Te],N,z,G)}function al(E,N,z,G){let B=E.opaque,_e=E.transmissive,Te=E.transparent;m.setupLightsView(z),ee===!0&&Ve.setGlobalState(x.clippingPlanes,z),_e.length>0&&$h(B,_e,N,z),G&&q.viewport(b.copy(G)),B.length>0&&Gr(B,N,z),_e.length>0&&Gr(_e,N,z),Te.length>0&&Gr(Te,N,z),q.buffers.depth.setTest(!0),q.buffers.depth.setMask(!0),q.buffers.color.setMask(!0),q.setPolygonOffset(!1)}function $h(E,N,z,G){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;let _e=oe.isWebGL2;we===null&&(we=new In(1,1,{generateMipmaps:!0,type:Y.has("EXT_color_buffer_half_float")?br:qn,minFilter:Mr,samples:_e?4:0})),x.getDrawingBufferSize(De),_e?we.setSize(De.x,De.y):we.setSize(na(De.x),na(De.y));let Te=x.getRenderTarget();x.setRenderTarget(we),x.getClearColor(j),I=x.getClearAlpha(),I<1&&x.setClearColor(16777215,.5),x.clear();let Le=x.toneMapping;x.toneMapping=Xn,Gr(E,z,G),w.updateMultisampleRenderTarget(we),w.updateRenderTargetMipmap(we);let Ne=!1;for(let qe=0,Ge=N.length;qe<Ge;qe++){let He=N[qe],gt=He.object,Yt=He.geometry,Et=He.material,Mn=He.group;if(Et.side===Nt&&gt.layers.test(G.layers)){let ht=Et.side;Et.side=At,Et.needsUpdate=!0,ll(gt,z,G,Yt,Et,Mn),Et.side=ht,Et.needsUpdate=!0,Ne=!0}}Ne===!0&&(w.updateMultisampleRenderTarget(we),w.updateRenderTargetMipmap(we)),x.setRenderTarget(Te),x.setClearColor(j,I),x.toneMapping=Le}function Gr(E,N,z){let G=N.isScene===!0?N.overrideMaterial:null;for(let B=0,_e=E.length;B<_e;B++){let Te=E[B],Le=Te.object,Ne=Te.geometry,qe=G===null?Te.material:G,Ge=Te.group;Le.layers.test(z.layers)&&ll(Le,N,z,Ne,qe,Ge)}}function ll(E,N,z,G,B,_e){E.onBeforeRender(x,N,z,G,B,_e),E.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),B.onBeforeRender(x,N,z,G,E,_e),B.transparent===!0&&B.side===Nt&&B.forceSinglePass===!1?(B.side=At,B.needsUpdate=!0,x.renderBufferDirect(z,N,G,B,E,_e),B.side=Zn,B.needsUpdate=!0,x.renderBufferDirect(z,N,G,B,E,_e),B.side=Nt):x.renderBufferDirect(z,N,G,B,E,_e),E.onAfterRender(x,N,z,G,B,_e)}function Vr(E,N,z){N.isScene!==!0&&(N=Ee);let G=ge.get(E),B=m.state.lights,_e=m.state.shadowsArray,Te=B.state.version,Le=Se.getParameters(E,B.state,_e,N,z),Ne=Se.getProgramCacheKey(Le),qe=G.programs;G.environment=E.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(E.isMeshStandardMaterial?O:v).get(E.envMap||G.environment),qe===void 0&&(E.addEventListener("dispose",fe),qe=new Map,G.programs=qe);let Ge=qe.get(Ne);if(Ge!==void 0){if(G.currentProgram===Ge&&G.lightsStateVersion===Te)return hl(E,Le),Ge}else Le.uniforms=Se.getUniforms(E),E.onBuild(z,Le,x),E.onBeforeCompile(Le,x),Ge=Se.acquireProgram(Le,Ne),qe.set(Ne,Ge),G.uniforms=Le.uniforms;let He=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(He.clippingPlanes=Ve.uniform),hl(E,Le),G.needsLights=eu(E),G.lightsStateVersion=Te,G.needsLights&&(He.ambientLightColor.value=B.state.ambient,He.lightProbe.value=B.state.probe,He.directionalLights.value=B.state.directional,He.directionalLightShadows.value=B.state.directionalShadow,He.spotLights.value=B.state.spot,He.spotLightShadows.value=B.state.spotShadow,He.rectAreaLights.value=B.state.rectArea,He.ltc_1.value=B.state.rectAreaLTC1,He.ltc_2.value=B.state.rectAreaLTC2,He.pointLights.value=B.state.point,He.pointLightShadows.value=B.state.pointShadow,He.hemisphereLights.value=B.state.hemi,He.directionalShadowMap.value=B.state.directionalShadowMap,He.directionalShadowMatrix.value=B.state.directionalShadowMatrix,He.spotShadowMap.value=B.state.spotShadowMap,He.spotLightMatrix.value=B.state.spotLightMatrix,He.spotLightMap.value=B.state.spotLightMap,He.pointShadowMap.value=B.state.pointShadowMap,He.pointShadowMatrix.value=B.state.pointShadowMatrix),G.currentProgram=Ge,G.uniformsList=null,Ge}function cl(E){if(E.uniformsList===null){let N=E.currentProgram.getUniforms();E.uniformsList=Yi.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function hl(E,N){let z=ge.get(E);z.outputColorSpace=N.outputColorSpace,z.batching=N.batching,z.instancing=N.instancing,z.instancingColor=N.instancingColor,z.skinning=N.skinning,z.morphTargets=N.morphTargets,z.morphNormals=N.morphNormals,z.morphColors=N.morphColors,z.morphTargetsCount=N.morphTargetsCount,z.numClippingPlanes=N.numClippingPlanes,z.numIntersection=N.numClipIntersection,z.vertexAlphas=N.vertexAlphas,z.vertexTangents=N.vertexTangents,z.toneMapping=N.toneMapping}function jh(E,N,z,G,B){N.isScene!==!0&&(N=Ee),w.resetTextureUnits();let _e=N.fog,Te=G.isMeshStandardMaterial?N.environment:null,Le=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Pn,Ne=(G.isMeshStandardMaterial?O:v).get(G.envMap||Te),qe=G.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Ge=!!z.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),He=!!z.morphAttributes.position,gt=!!z.morphAttributes.normal,Yt=!!z.morphAttributes.color,Et=Xn;G.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Et=x.toneMapping);let Mn=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,ht=Mn!==void 0?Mn.length:0,Ze=ge.get(G),lo=m.state.lights;if(ee===!0&&(me===!0||E!==M)){let Qt=E===M&&G.id===D;Ve.setState(G,E,Qt)}let mt=!1;G.version===Ze.__version?(Ze.needsLights&&Ze.lightsStateVersion!==lo.state.version||Ze.outputColorSpace!==Le||B.isBatchedMesh&&Ze.batching===!1||!B.isBatchedMesh&&Ze.batching===!0||B.isInstancedMesh&&Ze.instancing===!1||!B.isInstancedMesh&&Ze.instancing===!0||B.isSkinnedMesh&&Ze.skinning===!1||!B.isSkinnedMesh&&Ze.skinning===!0||B.isInstancedMesh&&Ze.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&Ze.instancingColor===!1&&B.instanceColor!==null||Ze.envMap!==Ne||G.fog===!0&&Ze.fog!==_e||Ze.numClippingPlanes!==void 0&&(Ze.numClippingPlanes!==Ve.numPlanes||Ze.numIntersection!==Ve.numIntersection)||Ze.vertexAlphas!==qe||Ze.vertexTangents!==Ge||Ze.morphTargets!==He||Ze.morphNormals!==gt||Ze.morphColors!==Yt||Ze.toneMapping!==Et||oe.isWebGL2===!0&&Ze.morphTargetsCount!==ht)&&(mt=!0):(mt=!0,Ze.__version=G.version);let ti=Ze.currentProgram;mt===!0&&(ti=Vr(G,N,B));let ul=!1,lr=!1,co=!1,It=ti.getUniforms(),ni=Ze.uniforms;if(q.useProgram(ti.program)&&(ul=!0,lr=!0,co=!0),G.id!==D&&(D=G.id,lr=!0),ul||M!==E){It.setValue(P,"projectionMatrix",E.projectionMatrix),It.setValue(P,"viewMatrix",E.matrixWorldInverse);let Qt=It.map.cameraPosition;Qt!==void 0&&Qt.setValue(P,ke.setFromMatrixPosition(E.matrixWorld)),oe.logarithmicDepthBuffer&&It.setValue(P,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&It.setValue(P,"isOrthographic",E.isOrthographicCamera===!0),M!==E&&(M=E,lr=!0,co=!0)}if(B.isSkinnedMesh){It.setOptional(P,B,"bindMatrix"),It.setOptional(P,B,"bindMatrixInverse");let Qt=B.skeleton;Qt&&(oe.floatVertexTextures?(Qt.boneTexture===null&&Qt.computeBoneTexture(),It.setValue(P,"boneTexture",Qt.boneTexture,w)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}B.isBatchedMesh&&(It.setOptional(P,B,"batchingTexture"),It.setValue(P,"batchingTexture",B._matricesTexture,w));let ho=z.morphAttributes;if((ho.position!==void 0||ho.normal!==void 0||ho.color!==void 0&&oe.isWebGL2===!0)&&$e.update(B,z,ti),(lr||Ze.receiveShadow!==B.receiveShadow)&&(Ze.receiveShadow=B.receiveShadow,It.setValue(P,"receiveShadow",B.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(ni.envMap.value=Ne,ni.flipEnvMap.value=Ne.isCubeTexture&&Ne.isRenderTargetTexture===!1?-1:1),lr&&(It.setValue(P,"toneMappingExposure",x.toneMappingExposure),Ze.needsLights&&Qh(ni,co),_e&&G.fog===!0&&ue.refreshFogUniforms(ni,_e),ue.refreshMaterialUniforms(ni,G,Z,V,we),Yi.upload(P,cl(Ze),ni,w)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Yi.upload(P,cl(Ze),ni,w),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&It.setValue(P,"center",B.center),It.setValue(P,"modelViewMatrix",B.modelViewMatrix),It.setValue(P,"normalMatrix",B.normalMatrix),It.setValue(P,"modelMatrix",B.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){let Qt=G.uniformsGroups;for(let uo=0,tu=Qt.length;uo<tu;uo++)if(oe.isWebGL2){let dl=Qt[uo];et.update(dl,ti),et.bind(dl,ti)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return ti}function Qh(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function eu(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,N,z){ge.get(E.texture).__webglTexture=N,ge.get(E.depthTexture).__webglTexture=z;let G=ge.get(E);G.__hasExternalTextures=!0,G.__hasExternalTextures&&(G.__autoAllocateDepthBuffer=z===void 0,G.__autoAllocateDepthBuffer||Y.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(E,N){let z=ge.get(E);z.__webglFramebuffer=N,z.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,z=0){A=E,C=N,T=z;let G=!0,B=null,_e=!1,Te=!1;if(E){let Ne=ge.get(E);Ne.__useDefaultFramebuffer!==void 0?(q.bindFramebuffer(P.FRAMEBUFFER,null),G=!1):Ne.__webglFramebuffer===void 0?w.setupRenderTarget(E):Ne.__hasExternalTextures&&w.rebindTextures(E,ge.get(E.texture).__webglTexture,ge.get(E.depthTexture).__webglTexture);let qe=E.texture;(qe.isData3DTexture||qe.isDataArrayTexture||qe.isCompressedArrayTexture)&&(Te=!0);let Ge=ge.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Ge[N])?B=Ge[N][z]:B=Ge[N],_e=!0):oe.isWebGL2&&E.samples>0&&w.useMultisampledRTT(E)===!1?B=ge.get(E).__webglMultisampledFramebuffer:Array.isArray(Ge)?B=Ge[z]:B=Ge,b.copy(E.viewport),U.copy(E.scissor),H=E.scissorTest}else b.copy(ie).multiplyScalar(Z).floor(),U.copy(re).multiplyScalar(Z).floor(),H=pe;if(q.bindFramebuffer(P.FRAMEBUFFER,B)&&oe.drawBuffers&&G&&q.drawBuffers(E,B),q.viewport(b),q.scissor(U),q.setScissorTest(H),_e){let Ne=ge.get(E.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+N,Ne.__webglTexture,z)}else if(Te){let Ne=ge.get(E.texture),qe=N||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,Ne.__webglTexture,z||0,qe)}D=-1},this.readRenderTargetPixels=function(E,N,z,G,B,_e,Te){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Le=ge.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Te!==void 0&&(Le=Le[Te]),Le){q.bindFramebuffer(P.FRAMEBUFFER,Le);try{let Ne=E.texture,qe=Ne.format,Ge=Ne.type;if(qe!==hn&&ve.convert(qe)!==P.getParameter(P.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let He=Ge===br&&(Y.has("EXT_color_buffer_half_float")||oe.isWebGL2&&Y.has("EXT_color_buffer_float"));if(Ge!==qn&&ve.convert(Ge)!==P.getParameter(P.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ge===Hn&&(oe.isWebGL2||Y.has("OES_texture_float")||Y.has("WEBGL_color_buffer_float")))&&!He){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-G&&z>=0&&z<=E.height-B&&P.readPixels(N,z,G,B,ve.convert(qe),ve.convert(Ge),_e)}finally{let Ne=A!==null?ge.get(A).__webglFramebuffer:null;q.bindFramebuffer(P.FRAMEBUFFER,Ne)}}},this.copyFramebufferToTexture=function(E,N,z=0){let G=Math.pow(2,-z),B=Math.floor(N.image.width*G),_e=Math.floor(N.image.height*G);w.setTexture2D(N,0),P.copyTexSubImage2D(P.TEXTURE_2D,z,0,0,E.x,E.y,B,_e),q.unbindTexture()},this.copyTextureToTexture=function(E,N,z,G=0){let B=N.image.width,_e=N.image.height,Te=ve.convert(z.format),Le=ve.convert(z.type);w.setTexture2D(z,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,z.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,z.unpackAlignment),N.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,G,E.x,E.y,B,_e,Te,Le,N.image.data):N.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,G,E.x,E.y,N.mipmaps[0].width,N.mipmaps[0].height,Te,N.mipmaps[0].data):P.texSubImage2D(P.TEXTURE_2D,G,E.x,E.y,Te,Le,N.image),G===0&&z.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),q.unbindTexture()},this.copyTextureToTexture3D=function(E,N,z,G,B=0){if(x.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let _e=E.max.x-E.min.x+1,Te=E.max.y-E.min.y+1,Le=E.max.z-E.min.z+1,Ne=ve.convert(G.format),qe=ve.convert(G.type),Ge;if(G.isData3DTexture)w.setTexture3D(G,0),Ge=P.TEXTURE_3D;else if(G.isDataArrayTexture||G.isCompressedArrayTexture)w.setTexture2DArray(G,0),Ge=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,G.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,G.unpackAlignment);let He=P.getParameter(P.UNPACK_ROW_LENGTH),gt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),Yt=P.getParameter(P.UNPACK_SKIP_PIXELS),Et=P.getParameter(P.UNPACK_SKIP_ROWS),Mn=P.getParameter(P.UNPACK_SKIP_IMAGES),ht=z.isCompressedTexture?z.mipmaps[B]:z.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,ht.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,ht.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,E.min.x),P.pixelStorei(P.UNPACK_SKIP_ROWS,E.min.y),P.pixelStorei(P.UNPACK_SKIP_IMAGES,E.min.z),z.isDataTexture||z.isData3DTexture?P.texSubImage3D(Ge,B,N.x,N.y,N.z,_e,Te,Le,Ne,qe,ht.data):z.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),P.compressedTexSubImage3D(Ge,B,N.x,N.y,N.z,_e,Te,Le,Ne,ht.data)):P.texSubImage3D(Ge,B,N.x,N.y,N.z,_e,Te,Le,Ne,qe,ht),P.pixelStorei(P.UNPACK_ROW_LENGTH,He),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,gt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Yt),P.pixelStorei(P.UNPACK_SKIP_ROWS,Et),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Mn),B===0&&G.generateMipmaps&&P.generateMipmap(Ge),q.unbindTexture()},this.initTexture=function(E){E.isCubeTexture?w.setTextureCube(E,0):E.isData3DTexture?w.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?w.setTexture2DArray(E,0):w.setTexture2D(E,0),q.unbindTexture()},this.resetState=function(){C=0,T=0,A=null,q.reset(),We.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===Ga?"display-p3":"srgb",t.unpackColorSpace=tt.workingColorSpace===Js?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===ut?di:Qc}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===di?ut:Pn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},xa=class extends wr{};xa.prototype.isWebGL1Renderer=!0;var Qi=class extends Gt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}};var Er=class extends kt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ki=new ot,Uc=new ot,us=[],Nc=new un,Y0=new ot,pr=new ae,mr=new Ln,Ns=class extends ae{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Er(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,Y0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new un),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ki),Nc.copy(e.boundingBox).applyMatrix4(ki),this.boundingBox.union(Nc)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ln),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ki),mr.copy(e.boundingSphere).applyMatrix4(ki),this.boundingSphere.union(mr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let n=this.matrixWorld,r=this.count;if(pr.geometry=this.geometry,pr.material=this.material,pr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),mr.copy(this.boundingSphere),mr.applyMatrix4(n),e.ray.intersectsSphere(mr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,ki),Uc.multiplyMatrices(n,ki),pr.matrixWorld=Uc,pr.raycast(e,us);for(let o=0,a=us.length;o<a;o++){let l=us[o];l.instanceId=s,l.object=this,t.push(l)}us.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Er(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var _n=class extends rn{constructor(e,t,n,r,s,o,a,l,c){super(e,t,n,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},sn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),r=0,s=n.length,o;t?o=t:o=e*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);let h=n[r],d=n[r+1]-h,p=(o-h)/d;return(r+p)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new J:new R);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new R,r=[],s=[],o=[],a=new R,l=new ot;for(let p=0;p<=e;p++){let g=p/e;r[p]=this.getTangentAt(g,new R)}s[0]=new R,o[0]=new R;let c=Number.MAX_VALUE,h=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(r[p-1],r[p]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Pt(r[p-1].dot(r[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(a,g))}o[p].crossVectors(r[p],s[p])}if(t===!0){let p=Math.acos(Pt(s[0].dot(s[e]),-1,1));p/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(p=-p);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],p*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Tr=class extends sn{constructor(e=0,t=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let n=t||new J,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ya=class extends Tr{constructor(e,t,n,r,s,o){super(e,t,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Ha(){let i=0,e=0,t=0,n=0;function r(s,o,a,l){i=s,e=a,t=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,h,u){let d=(o-s)/c-(a-s)/(c+h)+(a-o)/h,p=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,p*=h,r(o,a,d,p)},calc:function(s){let o=s*s,a=o*s;return i+e*s+t*o+n*a}}}var ds=new R,Wo=new Ha,Xo=new Ha,qo=new Ha,Ar=class extends sn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new R){let n=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,h;this.closed||a>0?c=r[(a-1)%s]:(ds.subVectors(r[0],r[1]).add(r[0]),c=ds);let u=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?h=r[(a+2)%s]:(ds.subVectors(r[s-1],r[s-2]).add(r[s-1]),h=ds),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),p),_=Math.pow(u.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(h),p);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Wo.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,_,m),Xo.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,_,m),qo.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&(Wo.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Xo.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),qo.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Wo.calc(l),Xo.calc(l),qo.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new R().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Oc(i,e,t,n,r){let s=(n-e)*.5,o=(r-t)*.5,a=i*i,l=i*a;return(2*t-2*n+s+o)*l+(-3*t+3*n-2*s-o)*a+s*i+t}function Z0(i,e){let t=1-i;return t*t*e}function K0(i,e){return 2*(1-i)*i*e}function J0(i,e){return i*i*e}function yr(i,e,t,n){return Z0(i,e)+K0(i,t)+J0(i,n)}function $0(i,e){let t=1-i;return t*t*t*e}function j0(i,e){let t=1-i;return 3*t*t*i*e}function Q0(i,e){return 3*(1-i)*i*i*e}function eg(i,e){return i*i*i*e}function vr(i,e,t,n,r){return $0(i,e)+j0(i,t)+Q0(i,n)+eg(i,r)}var Os=class extends sn{constructor(e=new J,t=new J,n=new J,r=new J){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new J){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(vr(e,r.x,s.x,o.x,a.x),vr(e,r.y,s.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},va=class extends sn{constructor(e=new R,t=new R,n=new R,r=new R){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new R){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(vr(e,r.x,s.x,o.x,a.x),vr(e,r.y,s.y,o.y,a.y),vr(e,r.z,s.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Fs=class extends sn{constructor(e=new J,t=new J){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new J){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new J){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ma=class extends sn{constructor(e=new R,t=new R){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new R){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new R){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Bs=class extends sn{constructor(e=new J,t=new J,n=new J){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new J){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(yr(e,r.x,s.x,o.x),yr(e,r.y,s.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},zs=class extends sn{constructor(e=new R,t=new R,n=new R){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new R){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(yr(e,r.x,s.x,o.x),yr(e,r.y,s.y,o.y),yr(e,r.z,s.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ks=class extends sn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new J){let n=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],h=r[o>r.length-2?r.length-1:o+1],u=r[o>r.length-3?r.length-1:o+2];return n.set(Oc(a,l.x,c.x,h.x,u.x),Oc(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new J().fromArray(r))}return this}},Gs=Object.freeze({__proto__:null,ArcCurve:ya,CatmullRomCurve3:Ar,CubicBezierCurve:Os,CubicBezierCurve3:va,EllipseCurve:Tr,LineCurve:Fs,LineCurve3:Ma,QuadraticBezierCurve:Bs,QuadraticBezierCurve3:zs,SplineCurve:ks}),ba=class extends sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Gs[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=n){let o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(new Gs[r.type]().fromJSON(r))}return this}},er=class extends ba{constructor(e){super(),this.type="Path",this.currentPoint=new J,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Fs(this.currentPoint.clone(),new J(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let s=new Bs(this.currentPoint.clone(),new J(e,t),new J(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,o){let a=new Os(this.currentPoint.clone(),new J(e,t),new J(n,r),new J(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new ks(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,r,s,o),this}absarc(e,t,n,r,s,o){return this.absellipse(e,t,n,n,r,s,o),this}ellipse(e,t,n,r,s,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,r,s,o,a,l),this}absellipse(e,t,n,r,s,o,a,l){let c=new Tr(e,t,n,r,s,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Vs=class i extends _t{constructor(e=[new J(0,-.5),new J(.5,0),new J(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=Pt(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],h=1/t,u=new R,d=new J,p=new R,g=new R,_=new R,m=0,f=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:m=e[y+1].x-e[y].x,f=e[y+1].y-e[y].y,p.x=f*1,p.y=-m,p.z=f*0,_.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[y+1].x-e[y].x,f=e[y+1].y-e[y].y,p.x=f*1,p.y=-m,p.z=f*0,g.copy(p),p.x+=_.x,p.y+=_.y,p.z+=_.z,p.normalize(),l.push(p.x,p.y,p.z),_.copy(g)}for(let y=0;y<=t;y++){let x=n+y*h*r,S=Math.sin(x),C=Math.cos(x);for(let T=0;T<=e.length-1;T++){u.x=e[T].x*S,u.y=e[T].y,u.z=e[T].x*C,o.push(u.x,u.y,u.z),d.x=y/t,d.y=T/(e.length-1),a.push(d.x,d.y);let A=l[3*T+0]*S,D=l[3*T+1],M=l[3*T+0]*C;c.push(A,D,M)}}for(let y=0;y<t;y++)for(let x=0;x<e.length-1;x++){let S=x+y*e.length,C=S,T=S+e.length,A=S+e.length+1,D=S+1;s.push(C,T,D),s.push(A,D,T)}this.setIndex(s),this.setAttribute("position",new Be(o,3)),this.setAttribute("uv",new Be(a,2)),this.setAttribute("normal",new Be(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var mi=class i extends _t{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new R,h=new J;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){let p=n+u/t*r;c.x=e*Math.cos(p),c.y=e*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/e+1)/2,h.y=(o[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new Be(o,3)),this.setAttribute("normal",new Be(a,3)),this.setAttribute("uv",new Be(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},jn=class i extends _t{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let h=[],u=[],d=[],p=[],g=0,_=[],m=n/2,f=0;y(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new Be(u,3)),this.setAttribute("normal",new Be(d,3)),this.setAttribute("uv",new Be(p,2));function y(){let S=new R,C=new R,T=0,A=(t-e)/n;for(let D=0;D<=s;D++){let M=[],b=D/s,U=b*(t-e)+e;for(let H=0;H<=r;H++){let j=H/r,I=j*l+a,F=Math.sin(I),V=Math.cos(I);C.x=U*F,C.y=-b*n+m,C.z=U*V,u.push(C.x,C.y,C.z),S.set(F,A,V).normalize(),d.push(S.x,S.y,S.z),p.push(j,1-b),M.push(g++)}_.push(M)}for(let D=0;D<r;D++)for(let M=0;M<s;M++){let b=_[M][D],U=_[M+1][D],H=_[M+1][D+1],j=_[M][D+1];h.push(b,U,j),h.push(U,H,j),T+=6}c.addGroup(f,T,0),f+=T}function x(S){let C=g,T=new J,A=new R,D=0,M=S===!0?e:t,b=S===!0?1:-1;for(let H=1;H<=r;H++)u.push(0,m*b,0),d.push(0,b,0),p.push(.5,.5),g++;let U=g;for(let H=0;H<=r;H++){let I=H/r*l+a,F=Math.cos(I),V=Math.sin(I);A.x=M*V,A.y=m*b,A.z=M*F,u.push(A.x,A.y,A.z),d.push(0,b,0),T.x=F*.5+.5,T.y=V*.5*b+.5,p.push(T.x,T.y),g++}for(let H=0;H<r;H++){let j=C+H,I=U+H;S===!0?h.push(I,I+1,j):h.push(I+1,I,j),D+=3}c.addGroup(f,D,S===!0?1:2),f+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Jt=class i extends jn{constructor(e=1,t=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Sa=class i extends _t{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};let s=[],o=[];a(r),c(n),h(),this.setAttribute("position",new Be(s,3)),this.setAttribute("normal",new Be(s.slice(),3)),this.setAttribute("uv",new Be(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let x=new R,S=new R,C=new R;for(let T=0;T<t.length;T+=3)p(t[T+0],x),p(t[T+1],S),p(t[T+2],C),l(x,S,C,y)}function l(y,x,S,C){let T=C+1,A=[];for(let D=0;D<=T;D++){A[D]=[];let M=y.clone().lerp(S,D/T),b=x.clone().lerp(S,D/T),U=T-D;for(let H=0;H<=U;H++)H===0&&D===T?A[D][H]=M:A[D][H]=M.clone().lerp(b,H/U)}for(let D=0;D<T;D++)for(let M=0;M<2*(T-D)-1;M++){let b=Math.floor(M/2);M%2===0?(d(A[D][b+1]),d(A[D+1][b]),d(A[D][b])):(d(A[D][b+1]),d(A[D+1][b+1]),d(A[D+1][b]))}}function c(y){let x=new R;for(let S=0;S<s.length;S+=3)x.x=s[S+0],x.y=s[S+1],x.z=s[S+2],x.normalize().multiplyScalar(y),s[S+0]=x.x,s[S+1]=x.y,s[S+2]=x.z}function h(){let y=new R;for(let x=0;x<s.length;x+=3){y.x=s[x+0],y.y=s[x+1],y.z=s[x+2];let S=m(y)/2/Math.PI+.5,C=f(y)/Math.PI+.5;o.push(S,1-C)}g(),u()}function u(){for(let y=0;y<o.length;y+=6){let x=o[y+0],S=o[y+2],C=o[y+4],T=Math.max(x,S,C),A=Math.min(x,S,C);T>.9&&A<.1&&(x<.2&&(o[y+0]+=1),S<.2&&(o[y+2]+=1),C<.2&&(o[y+4]+=1))}}function d(y){s.push(y.x,y.y,y.z)}function p(y,x){let S=y*3;x.x=e[S+0],x.y=e[S+1],x.z=e[S+2]}function g(){let y=new R,x=new R,S=new R,C=new R,T=new J,A=new J,D=new J;for(let M=0,b=0;M<s.length;M+=9,b+=6){y.set(s[M+0],s[M+1],s[M+2]),x.set(s[M+3],s[M+4],s[M+5]),S.set(s[M+6],s[M+7],s[M+8]),T.set(o[b+0],o[b+1]),A.set(o[b+2],o[b+3]),D.set(o[b+4],o[b+5]),C.copy(y).add(x).add(S).divideScalar(3);let U=m(C);_(T,b+0,y,U),_(A,b+2,x,U),_(D,b+4,S,U)}}function _(y,x,S,C){C<0&&y.x===1&&(o[x]=y.x-1),S.x===0&&S.z===0&&(o[x]=C/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function f(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.details)}};var $t=class extends er{constructor(e){super(e),this.uuid=rr(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(new er().fromJSON(r))}return this}},tg={triangulate:function(i,e,t=2){let n=e&&e.length,r=n?e[0]*t:i.length,s=fh(i,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,h,u,d,p;if(n&&(s=og(i,e,s,t)),i.length>80*t){a=c=i[0],l=h=i[1];for(let g=t;g<r;g+=t)u=i[g],d=i[g+1],u<a&&(a=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);p=Math.max(c-a,h-l),p=p!==0?32767/p:0}return Rr(s,o,t,a,l,p,0),o}};function fh(i,e,t,n,r){let s,o;if(r===_g(i,e,t,n)>0)for(s=e;s<t;s+=n)o=Fc(s,i[s],i[s+1],o);else for(s=t-n;s>=e;s-=n)o=Fc(s,i[s],i[s+1],o);return o&&js(o,o.next)&&(Pr(o),o=o.next),o}function gi(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(js(t,t.next)||dt(t.prev,t,t.next)===0)){if(Pr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Rr(i,e,t,n,r,s,o){if(!i)return;!o&&s&&ug(i,n,r,s);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,s?ig(i,n,r,s):ng(i)){e.push(l.i/t|0),e.push(i.i/t|0),e.push(c.i/t|0),Pr(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=rg(gi(i),e,t),Rr(i,e,t,n,r,s,2)):o===2&&sg(i,e,t,n,r,s):Rr(gi(i),e,t,n,r,s,1);break}}}function ng(i){let e=i.prev,t=i,n=i.next;if(dt(e,t,n)>=0)return!1;let r=e.x,s=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=r<s?r<o?r:o:s<o?s:o,u=a<l?a<c?a:c:l<c?l:c,d=r>s?r>o?r:o:s>o?s:o,p=a>l?a>c?a:c:l>c?l:c,g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=p&&Wi(r,a,s,l,o,c,g.x,g.y)&&dt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function ig(i,e,t,n){let r=i.prev,s=i,o=i.next;if(dt(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,h=r.y,u=s.y,d=o.y,p=a<l?a<c?a:c:l<c?l:c,g=h<u?h<d?h:d:u<d?u:d,_=a>l?a>c?a:c:l>c?l:c,m=h>u?h>d?h:d:u>d?u:d,f=wa(p,g,e,t,n),y=wa(_,m,e,t,n),x=i.prevZ,S=i.nextZ;for(;x&&x.z>=f&&S&&S.z<=y;){if(x.x>=p&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&Wi(a,h,l,u,c,d,x.x,x.y)&&dt(x.prev,x,x.next)>=0||(x=x.prevZ,S.x>=p&&S.x<=_&&S.y>=g&&S.y<=m&&S!==r&&S!==o&&Wi(a,h,l,u,c,d,S.x,S.y)&&dt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;x&&x.z>=f;){if(x.x>=p&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&Wi(a,h,l,u,c,d,x.x,x.y)&&dt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;S&&S.z<=y;){if(S.x>=p&&S.x<=_&&S.y>=g&&S.y<=m&&S!==r&&S!==o&&Wi(a,h,l,u,c,d,S.x,S.y)&&dt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function rg(i,e,t){let n=i;do{let r=n.prev,s=n.next.next;!js(r,s)&&ph(r,n,n.next,s)&&Cr(r,s)&&Cr(s,r)&&(e.push(r.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),Pr(n),Pr(n.next),n=i=s),n=n.next}while(n!==i);return gi(n)}function sg(i,e,t,n,r,s){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&pg(o,a)){let l=mh(o,a);o=gi(o,o.next),l=gi(l,l.next),Rr(o,e,t,n,r,s,0),Rr(l,e,t,n,r,s,0);return}a=a.next}o=o.next}while(o!==i)}function og(i,e,t,n){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*n,l=s<o-1?e[s+1]*n:i.length,c=fh(i,a,l,n,!1),c===c.next&&(c.steiner=!0),r.push(fg(c));for(r.sort(ag),s=0;s<r.length;s++)t=lg(r[s],t);return t}function ag(i,e){return i.x-e.x}function lg(i,e){let t=cg(i,e);if(!t)return e;let n=mh(t,i);return gi(n,n.next),gi(t,t.next)}function cg(i,e){let t=e,n=-1/0,r,s=i.x,o=i.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let d=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=s&&d>n&&(n=d,r=t.x<t.next.x?t:t.next,d===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,h=1/0,u;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&Wi(o<c?s:n,o,l,c,o<c?n:s,o,t.x,t.y)&&(u=Math.abs(o-t.y)/(s-t.x),Cr(t,i)&&(u<h||u===h&&(t.x>r.x||t.x===r.x&&hg(r,t)))&&(r=t,h=u)),t=t.next;while(t!==a);return r}function hg(i,e){return dt(i.prev,i,e.prev)<0&&dt(e.next,i,i.next)<0}function ug(i,e,t,n){let r=i;do r.z===0&&(r.z=wa(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,dg(r)}function dg(i){let e,t,n,r,s,o,a,l,c=1;do{for(t=i,i=null,s=null,o=0;t;){for(o++,n=t,a=0,e=0;e<c&&(a++,n=n.nextZ,!!n);e++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||t.z<=n.z)?(r=t,t=t.nextZ,a--):(r=n,n=n.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;t=n}s.nextZ=null,c*=2}while(o>1);return i}function wa(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function fg(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Wi(i,e,t,n,r,s,o,a){return(r-o)*(e-a)>=(i-o)*(s-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(n-a)}function pg(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!mg(i,e)&&(Cr(i,e)&&Cr(e,i)&&gg(i,e)&&(dt(i.prev,i,e.prev)||dt(i,e.prev,e))||js(i,e)&&dt(i.prev,i,i.next)>0&&dt(e.prev,e,e.next)>0)}function dt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function js(i,e){return i.x===e.x&&i.y===e.y}function ph(i,e,t,n){let r=ps(dt(i,e,t)),s=ps(dt(i,e,n)),o=ps(dt(t,n,i)),a=ps(dt(t,n,e));return!!(r!==s&&o!==a||r===0&&fs(i,t,e)||s===0&&fs(i,n,e)||o===0&&fs(t,i,n)||a===0&&fs(t,e,n))}function fs(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function ps(i){return i>0?1:i<0?-1:0}function mg(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&ph(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Cr(i,e){return dt(i.prev,i,i.next)<0?dt(i,e,i.next)>=0&&dt(i,i.prev,e)>=0:dt(i,e,i.prev)<0||dt(i,i.next,e)<0}function gg(i,e){let t=i,n=!1,r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function mh(i,e){let t=new Ea(i.i,i.x,i.y),n=new Ea(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function Fc(i,e,t,n){let r=new Ea(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function Pr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Ea(i,e,t){this.i=i,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function _g(i,e,t,n){let r=0;for(let s=e,o=t-n;s<t;s+=n)r+=(i[o]-i[s])*(i[s+1]+i[o+1]),o=s;return r}var Yn=class i{static area(e){let t=e.length,n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],r=[],s=[];Bc(e),zc(n,e);let o=e.length;t.forEach(Bc);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,zc(n,t[l]);let a=tg.triangulate(n,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function Bc(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function zc(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var _i=class i extends _t{constructor(e=new $t([new J(.5,.5),new J(-.5,.5),new J(-.5,-.5),new J(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new Be(r,3)),this.setAttribute("uv",new Be(s,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,p=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:p-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,f=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:xg,x,S=!1,C,T,A,D;f&&(x=f.getSpacedPoints(h),S=!0,d=!1,C=f.computeFrenetFrames(h,!1),T=new R,A=new R,D=new R),d||(m=0,p=0,g=0,_=0);let M=a.extractPoints(c),b=M.shape,U=M.holes;if(!Yn.isClockWise(b)){b=b.reverse();for(let P=0,le=U.length;P<le;P++){let Y=U[P];Yn.isClockWise(Y)&&(U[P]=Y.reverse())}}let j=Yn.triangulateShape(b,U),I=b;for(let P=0,le=U.length;P<le;P++){let Y=U[P];b=b.concat(Y)}function F(P,le,Y){return le||console.error("THREE.ExtrudeGeometry: vec does not exist"),P.clone().addScaledVector(le,Y)}let V=b.length,Z=j.length;function K(P,le,Y){let oe,q,Ae,ge=P.x-le.x,w=P.y-le.y,v=Y.x-P.x,O=Y.y-P.y,se=ge*ge+w*w,te=ge*O-w*v;if(Math.abs(te)>Number.EPSILON){let Q=Math.sqrt(se),Se=Math.sqrt(v*v+O*O),ue=le.x-w/Q,ye=le.y+ge/Q,Pe=Y.x-O/Se,Ve=Y.y+v/Se,ne=((Pe-ue)*O-(Ve-ye)*v)/(ge*O-w*v);oe=ue+ge*ne-P.x,q=ye+w*ne-P.y;let je=oe*oe+q*q;if(je<=2)return new J(oe,q);Ae=Math.sqrt(je/2)}else{let Q=!1;ge>Number.EPSILON?v>Number.EPSILON&&(Q=!0):ge<-Number.EPSILON?v<-Number.EPSILON&&(Q=!0):Math.sign(w)===Math.sign(O)&&(Q=!0),Q?(oe=-w,q=ge,Ae=Math.sqrt(se)):(oe=ge,q=w,Ae=Math.sqrt(se/2))}return new J(oe/Ae,q/Ae)}let X=[];for(let P=0,le=I.length,Y=le-1,oe=P+1;P<le;P++,Y++,oe++)Y===le&&(Y=0),oe===le&&(oe=0),X[P]=K(I[P],I[Y],I[oe]);let ie=[],re,pe=X.concat();for(let P=0,le=U.length;P<le;P++){let Y=U[P];re=[];for(let oe=0,q=Y.length,Ae=q-1,ge=oe+1;oe<q;oe++,Ae++,ge++)Ae===q&&(Ae=0),ge===q&&(ge=0),re[oe]=K(Y[oe],Y[Ae],Y[ge]);ie.push(re),pe=pe.concat(re)}for(let P=0;P<m;P++){let le=P/m,Y=p*Math.cos(le*Math.PI/2),oe=g*Math.sin(le*Math.PI/2)+_;for(let q=0,Ae=I.length;q<Ae;q++){let ge=F(I[q],X[q],oe);xe(ge.x,ge.y,-Y)}for(let q=0,Ae=U.length;q<Ae;q++){let ge=U[q];re=ie[q];for(let w=0,v=ge.length;w<v;w++){let O=F(ge[w],re[w],oe);xe(O.x,O.y,-Y)}}}let W=g+_;for(let P=0;P<V;P++){let le=d?F(b[P],pe[P],W):b[P];S?(A.copy(C.normals[0]).multiplyScalar(le.x),T.copy(C.binormals[0]).multiplyScalar(le.y),D.copy(x[0]).add(A).add(T),xe(D.x,D.y,D.z)):xe(le.x,le.y,0)}for(let P=1;P<=h;P++)for(let le=0;le<V;le++){let Y=d?F(b[le],pe[le],W):b[le];S?(A.copy(C.normals[P]).multiplyScalar(Y.x),T.copy(C.binormals[P]).multiplyScalar(Y.y),D.copy(x[P]).add(A).add(T),xe(D.x,D.y,D.z)):xe(Y.x,Y.y,u/h*P)}for(let P=m-1;P>=0;P--){let le=P/m,Y=p*Math.cos(le*Math.PI/2),oe=g*Math.sin(le*Math.PI/2)+_;for(let q=0,Ae=I.length;q<Ae;q++){let ge=F(I[q],X[q],oe);xe(ge.x,ge.y,u+Y)}for(let q=0,Ae=U.length;q<Ae;q++){let ge=U[q];re=ie[q];for(let w=0,v=ge.length;w<v;w++){let O=F(ge[w],re[w],oe);S?xe(O.x,O.y+x[h-1].y,x[h-1].x+Y):xe(O.x,O.y,u+Y)}}}ee(),me();function ee(){let P=r.length/3;if(d){let le=0,Y=V*le;for(let oe=0;oe<Z;oe++){let q=j[oe];De(q[2]+Y,q[1]+Y,q[0]+Y)}le=h+m*2,Y=V*le;for(let oe=0;oe<Z;oe++){let q=j[oe];De(q[0]+Y,q[1]+Y,q[2]+Y)}}else{for(let le=0;le<Z;le++){let Y=j[le];De(Y[2],Y[1],Y[0])}for(let le=0;le<Z;le++){let Y=j[le];De(Y[0]+V*h,Y[1]+V*h,Y[2]+V*h)}}n.addGroup(P,r.length/3-P,0)}function me(){let P=r.length/3,le=0;we(I,le),le+=I.length;for(let Y=0,oe=U.length;Y<oe;Y++){let q=U[Y];we(q,le),le+=q.length}n.addGroup(P,r.length/3-P,1)}function we(P,le){let Y=P.length;for(;--Y>=0;){let oe=Y,q=Y-1;q<0&&(q=P.length-1);for(let Ae=0,ge=h+m*2;Ae<ge;Ae++){let w=V*Ae,v=V*(Ae+1),O=le+oe+w,se=le+q+w,te=le+q+v,Q=le+oe+v;ke(O,se,te,Q)}}}function xe(P,le,Y){l.push(P),l.push(le),l.push(Y)}function De(P,le,Y){Ee(P),Ee(le),Ee(Y);let oe=r.length/3,q=y.generateTopUV(n,r,oe-3,oe-2,oe-1);Oe(q[0]),Oe(q[1]),Oe(q[2])}function ke(P,le,Y,oe){Ee(P),Ee(le),Ee(oe),Ee(le),Ee(Y),Ee(oe);let q=r.length/3,Ae=y.generateSideWallUV(n,r,q-6,q-3,q-2,q-1);Oe(Ae[0]),Oe(Ae[1]),Oe(Ae[3]),Oe(Ae[1]),Oe(Ae[2]),Oe(Ae[3])}function Ee(P){r.push(l[P*3+0]),r.push(l[P*3+1]),r.push(l[P*3+2])}function Oe(P){s.push(P.x),s.push(P.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return yg(t,n,e)}static fromJSON(e,t){let n=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];n.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new Gs[r.type]().fromJSON(r)),new i(n,e.options)}},xg={generateTopUV:function(i,e,t,n,r){let s=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[r*3],h=e[r*3+1];return[new J(s,o),new J(a,l),new J(c,h)]},generateSideWallUV:function(i,e,t,n,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],d=e[r*3],p=e[r*3+1],g=e[r*3+2],_=e[s*3],m=e[s*3+1],f=e[s*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new J(o,1-l),new J(c,1-u),new J(d,1-g),new J(_,1-f)]:[new J(a,1-l),new J(h,1-u),new J(p,1-g),new J(m,1-f)]}};function yg(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){let s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Hs=class i extends Sa{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var tr=class i extends _t{constructor(e=.5,t=1,n=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:o},n=Math.max(3,n),r=Math.max(1,r);let a=[],l=[],c=[],h=[],u=e,d=(t-e)/r,p=new R,g=new J;for(let _=0;_<=r;_++){for(let m=0;m<=n;m++){let f=s+m/n*o;p.x=u*Math.cos(f),p.y=u*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,h.push(g.x,g.y)}u+=d}for(let _=0;_<r;_++){let m=_*(n+1);for(let f=0;f<n;f++){let y=f+m,x=y,S=y+n+1,C=y+n+2,T=y+1;a.push(x,S,T),a.push(S,C,T)}}this.setIndex(a),this.setAttribute("position",new Be(l,3)),this.setAttribute("normal",new Be(c,3)),this.setAttribute("uv",new Be(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},nr=class i extends _t{constructor(e=new $t([new J(0,.5),new J(-.5,-.5),new J(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new Be(r,3)),this.setAttribute("normal",new Be(s,3)),this.setAttribute("uv",new Be(o,2));function c(h){let u=r.length/3,d=h.extractPoints(t),p=d.shape,g=d.holes;Yn.isClockWise(p)===!1&&(p=p.reverse());for(let m=0,f=g.length;m<f;m++){let y=g[m];Yn.isClockWise(y)===!0&&(g[m]=y.reverse())}let _=Yn.triangulateShape(p,g);for(let m=0,f=g.length;m<f;m++){let y=g[m];p=p.concat(y)}for(let m=0,f=p.length;m<f;m++){let y=p[m];r.push(y.x,y.y,0),s.push(0,0,1),o.push(y.x,y.y)}for(let m=0,f=_.length;m<f;m++){let y=_[m],x=y[0]+u,S=y[1]+u,C=y[2]+u;n.push(x,S,C),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return vg(t,e)}static fromJSON(e,t){let n=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];n.push(o)}return new i(n,e.curveSegments)}};function vg(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let r=i[t];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e}var Un=class i extends _t{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new R,d=new R,p=[],g=[],_=[],m=[];for(let f=0;f<=n;f++){let y=[],x=f/n,S=0;f===0&&o===0?S=.5/t:f===n&&l===Math.PI&&(S=-.5/t);for(let C=0;C<=t;C++){let T=C/t;u.x=-e*Math.cos(r+T*s)*Math.sin(o+x*a),u.y=e*Math.cos(o+x*a),u.z=e*Math.sin(r+T*s)*Math.sin(o+x*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),m.push(T+S,1-x),y.push(c++)}h.push(y)}for(let f=0;f<n;f++)for(let y=0;y<t;y++){let x=h[f][y+1],S=h[f][y],C=h[f+1][y],T=h[f+1][y+1];(f!==0||o>0)&&p.push(x,S,T),(f!==n-1||l<Math.PI)&&p.push(S,C,T)}this.setIndex(p),this.setAttribute("position",new Be(g,3)),this.setAttribute("normal",new Be(_,3)),this.setAttribute("uv",new Be(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Vt=class i extends _t{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s},n=Math.floor(n),r=Math.floor(r);let o=[],a=[],l=[],c=[],h=new R,u=new R,d=new R;for(let p=0;p<=n;p++)for(let g=0;g<=r;g++){let _=g/r*s,m=p/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(g/r),c.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=r;g++){let _=(r+1)*p+g-1,m=(r+1)*(p-1)+g-1,f=(r+1)*(p-1)+g,y=(r+1)*p+g;o.push(_,m,y),o.push(m,f,y)}this.setIndex(o),this.setAttribute("position",new Be(a,3)),this.setAttribute("normal",new Be(l,3)),this.setAttribute("uv",new Be(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Ws=class i extends _t{constructor(e=new zs(new R(-1,-1,0),new R(-1,1,0),new R(1,1,0)),t=64,n=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new R,l=new R,c=new J,h=new R,u=[],d=[],p=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new Be(u,3)),this.setAttribute("normal",new Be(d,3)),this.setAttribute("uv",new Be(p,2));function _(){for(let x=0;x<t;x++)m(x);m(s===!1?t:0),y(),f()}function m(x){h=e.getPointAt(x/t,h);let S=o.normals[x],C=o.binormals[x];for(let T=0;T<=r;T++){let A=T/r*Math.PI*2,D=Math.sin(A),M=-Math.cos(A);l.x=M*S.x+D*C.x,l.y=M*S.y+D*C.y,l.z=M*S.z+D*C.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+n*l.x,a.y=h.y+n*l.y,a.z=h.z+n*l.z,u.push(a.x,a.y,a.z)}}function f(){for(let x=1;x<=t;x++)for(let S=1;S<=r;S++){let C=(r+1)*(x-1)+(S-1),T=(r+1)*x+(S-1),A=(r+1)*x+S,D=(r+1)*(x-1)+S;g.push(C,T,D),g.push(T,A,D)}}function y(){for(let x=0;x<=t;x++)for(let S=0;S<=r;S++)c.x=x/t,c.y=S/r,p.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Gs[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var jt=class extends pi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Je(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Je(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=eh,this.normalScale=new J(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function ms(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Mg(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var ir=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Ta=class extends ir{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Wl,endingEnd:Wl}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case Xl:s=e,a=2*t-n;break;case ql:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Xl:o=e,l=2*n-t;break;case ql:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,g=(n-t)/(r-t),_=g*g,m=_*g,f=-d*m+2*d*_-d*g,y=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,x=(-1-p)*m+(1.5+p)*_+.5*g,S=p*m-p*_;for(let C=0;C!==a;++C)s[C]=f*o[h+C]+y*o[c+C]+x*o[l+C]+S*o[u+C];return s}},Aa=class extends ir{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(r-t),u=1-h;for(let d=0;d!==a;++d)s[d]=o[c+d]*u+o[l+d]*h;return s}},Ra=class extends ir{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},fn=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ms(t,this.TimeBufferType),this.values=ms(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ms(e.times,Array),values:ms(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ra(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Aa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ta(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case _s:t=this.InterpolantFactoryMethodDiscrete;break;case xs:t=this.InterpolantFactoryMethodLinear;break;case yo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return _s;case this.InterpolantFactoryMethodLinear:return xs;case this.InterpolantFactoryMethodSmooth:return yo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&Mg(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===yo,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(r)l=!0;else{let u=a*n,d=u-n,p=u+n;for(let g=0;g!==n;++g){let _=t[u+g];if(_!==t[d+g]||_!==t[p+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,d=o*n;for(let p=0;p!==n;++p)t[d+p]=t[u+p]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};fn.prototype.TimeBufferType=Float32Array;fn.prototype.ValueBufferType=Float32Array;fn.prototype.DefaultInterpolation=xs;var xi=class extends fn{};xi.prototype.ValueTypeName="bool";xi.prototype.ValueBufferType=Array;xi.prototype.DefaultInterpolation=_s;xi.prototype.InterpolantFactoryMethodLinear=void 0;xi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ca=class extends fn{};Ca.prototype.ValueTypeName="color";var Pa=class extends fn{};Pa.prototype.ValueTypeName="number";var Ia=class extends ir{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t),c=e*a;for(let h=c+a;c!==h;c+=4)$n.slerpFlat(s,0,o,c-a,o,c,l);return s}},Ir=class extends fn{InterpolantFactoryMethodLinear(e){return new Ia(this.times,this.values,this.getValueSize(),e)}};Ir.prototype.ValueTypeName="quaternion";Ir.prototype.DefaultInterpolation=xs;Ir.prototype.InterpolantFactoryMethodSmooth=void 0;var yi=class extends fn{};yi.prototype.ValueTypeName="string";yi.prototype.ValueBufferType=Array;yi.prototype.DefaultInterpolation=_s;yi.prototype.InterpolantFactoryMethodLinear=void 0;yi.prototype.InterpolantFactoryMethodSmooth=void 0;var La=class extends fn{};La.prototype.ValueTypeName="vector";var Da=class{constructor(e,t,n){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){a++,s===!1&&r.onStart!==void 0&&r.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,r.onProgress!==void 0&&r.onProgress(h,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let p=c[u],g=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null}}},bg=new Da,Ua=class{constructor(e){this.manager=e!==void 0?e:bg,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Ua.DEFAULT_MATERIAL_NAME="__DEFAULT";var Lr=class extends Gt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Je(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},Xs=class extends Lr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Gt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Je(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Yo=new ot,kc=new R,Gc=new R,qs=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new J(512,512),this.map=null,this.mapPass=null,this.matrix=new ot,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Sr,this._frameExtents=new J(1,1),this._viewportCount=1,this._viewports=[new lt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;kc.setFromMatrixPosition(e.matrixWorld),t.position.copy(kc),Gc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Gc),t.updateMatrixWorld(),Yo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Yo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Vc=new ot,gr=new R,Zo=new R,Na=class extends qs{constructor(){super(new Ut(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new J(4,2),this._viewportCount=6,this._viewports=[new lt(2,1,1,1),new lt(0,1,1,1),new lt(3,1,1,1),new lt(1,1,1,1),new lt(3,0,1,1),new lt(1,0,1,1)],this._cubeDirections=[new R(1,0,0),new R(-1,0,0),new R(0,0,1),new R(0,0,-1),new R(0,1,0),new R(0,-1,0)],this._cubeUps=[new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,0,1),new R(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),gr.setFromMatrixPosition(e.matrixWorld),n.position.copy(gr),Zo.copy(n.position),Zo.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Zo),n.updateMatrixWorld(),r.makeTranslation(-gr.x,-gr.y,-gr.z),Vc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vc)}},Ys=class extends Lr{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new Na}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Oa=class extends qs{constructor(){super(new Ds(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Zs=class extends Lr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Gt.DEFAULT_UP),this.updateMatrix(),this.target=new Gt,this.shadow=new Oa}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Wa="\\[\\]\\.:\\/",Sg=new RegExp("["+Wa+"]","g"),Xa="[^"+Wa+"]",wg="[^"+Wa.replace("\\.","")+"]",Eg=/((?:WC+[\/:])*)/.source.replace("WC",Xa),Tg=/(WCOD+)?/.source.replace("WCOD",wg),Ag=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Xa),Rg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Xa),Cg=new RegExp("^"+Eg+Tg+Ag+Rg+"$"),Pg=["material","materials","bones","map"],Fa=class{constructor(e,t,n){let r=n||at.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},at=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Sg,"")}static parseTrackName(e){let t=Cg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);Pg.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};at.Composite=Fa;at.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};at.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};at.prototype.GetterByBindingType=[at.prototype._getValue_direct,at.prototype._getValue_array,at.prototype._getValue_arrayElement,at.prototype._getValue_toArray];at.prototype.SetterByBindingTypeAndVersioning=[[at.prototype._setValue_direct,at.prototype._setValue_direct_setNeedsUpdate,at.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[at.prototype._setValue_array,at.prototype._setValue_array_setNeedsUpdate,at.prototype._setValue_array_setMatrixWorldNeedsUpdate],[at.prototype._setValue_arrayElement,at.prototype._setValue_arrayElement_setNeedsUpdate,at.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[at.prototype._setValue_fromArray,at.prototype._setValue_fromArray_setNeedsUpdate,at.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var X_=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var Rt=i=>({kind:"piece",model:i}),yt=i=>({kind:"tile",model:i}),qa={relic:Rt("relic"),"key-red":Rt("key-red"),"key-blue":Rt("key-blue"),"key-yellow":Rt("key-yellow"),"key-green":Rt("key-green"),flippers:Rt("flippers"),"fire-boots":Rt("fire-boots"),skates:Rt("skates"),suction:Rt("suction"),mirror:Rt("mirror"),cake:Rt("cake"),cow:Rt("cow"),page:Rt("page"),minotaur:Rt("minotaur"),ball:Rt("ball"),glider:Rt("glider"),fireball:Rt("fireball"),block:Rt("block"),exit:yt("exit"),gate:yt("gate-open"),water:yt("water"),fire:yt("fire"),ice:yt("ice"),force:yt("force-right"),dirt:yt("dirt"),safe:yt("safe"),door:yt("door-red"),button:yt("button"),toggle:yt("toggle-closed"),trap:yt("trap"),"button-brown":yt("button-brown"),"button-red":yt("button-red"),clone:yt("clone-down"),popup:yt("popup"),gravel:yt("gravel"),teleport:yt("teleport"),thief:yt("thief"),bomb:yt("bomb"),"fake-wall":{kind:"wall"},"invisible-wall":{kind:"wall"}};var Qs=class extends Qi{constructor(e=null){super();let t=new dn;t.deleteAttribute("uv");let n=new jt({side:At}),r=new jt,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let o=new Ys(16777215,s,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new ae(t,n);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let l=new ae(t,r);l.position.set(-10.906,2.009,1.846),l.rotation.set(0,-.195,0),l.scale.set(2.328,7.905,4.651),this.add(l);let c=new ae(t,r);c.position.set(-5.607,-.754,-.758),c.rotation.set(0,.994,0),c.scale.set(1.97,1.534,3.955),this.add(c);let h=new ae(t,r);h.position.set(6.167,.857,7.803),h.rotation.set(0,.561,0),h.scale.set(3.927,6.285,3.687),this.add(h);let u=new ae(t,r);u.position.set(-2.017,.018,6.124),u.rotation.set(0,.333,0),u.scale.set(2.002,4.566,2.064),this.add(u);let d=new ae(t,r);d.position.set(2.291,-.756,-2.621),d.rotation.set(0,-.286,0),d.scale.set(1.546,1.552,1.496),this.add(d);let p=new ae(t,r);p.position.set(-2.193,-.369,-5.547),p.rotation.set(0,.516,0),p.scale.set(3.875,3.487,2.986),this.add(p);let g=new ae(t,or(50));g.position.set(-16.116,14.37,8.208),g.scale.set(.1,2.428,2.739),this.add(g);let _=new ae(t,or(50));_.position.set(-16.109,18.021,-8.207),_.scale.set(.1,2.425,2.751),this.add(_);let m=new ae(t,or(17));m.position.set(14.904,12.198,-1.832),m.scale.set(.15,4.265,6.331),this.add(m);let f=new ae(t,or(43));f.position.set(-.462,8.89,14.52),f.scale.set(4.38,5.441,.088),this.add(f);let y=new ae(t,or(20));y.position.set(3.235,11.486,-12.541),y.scale.set(2.5,2,.1),this.add(y);let x=new ae(t,or(100));x.position.set(0,20,0),x.scale.set(1,.1,1),this.add(x)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function or(i){let e=new ft;return e.color.setScalar(i),e}var Ig={items:"plate",beacon:!1,cutaway:!1,caps:!1};var Lg=Ig;function Qn(){return Lg}function Ct(i){return()=>(i=i*1664525+1013904223>>>0,i/4294967296)}function Ht(i,e,t=!0){let n=document.createElement("canvas");n.width=n.height=i,e(n.getContext("2d"),i);let r=new _n(n);return t&&(r.colorSpace=ut),r.wrapS=r.wrapT=Kn,r.anisotropy=8,r}function ct(i,e,t,n,r,s,o,a,l=!0){for(let c=0;c<n;c++){let h=t()*e,u=t()*e,d=o+t()*(a-o);i.fillStyle=`rgba(${r},${(s*(.3+.7*t())).toFixed(3)})`;let p=l?[-e,0,e]:[0];for(let g of p)for(let _ of p)l&&(Math.abs(h+g-e/2)>e/2+d||Math.abs(u+_-e/2)>e/2+d)||(i.beginPath(),i.arc(h+g,u+_,d,0,7),i.fill())}}function Dr(i,e,t){let n=i.createRadialGradient(e/2,e/2,e*.3,e/2,e/2,e*.72);n.addColorStop(0,"rgba(0,0,0,0)"),n.addColorStop(1,`rgba(20,14,10,${t})`),i.fillStyle=n,i.fillRect(0,0,e,e)}function Ya(i,e,t,n,r,s,o){i.strokeStyle=r,i.lineWidth=s;for(let a=0;a<n;a++){i.beginPath();let l=t()*e,c=t()*e;i.moveTo(l,c);for(let h=0;h<6;h++)l+=(t()-.5)*o,c+=(t()-.5)*o,i.lineTo(l,c);i.stroke()}}var Dg=i=>Ht(256,(e,t)=>{let n=Ct(i);e.fillStyle="#dcc699",e.fillRect(0,0,t,t),ct(e,t,n,260,"150,120,80",.06,6,26,!1),ct(e,t,n,220,"242,226,192",.1,5,20,!1),ct(e,t,n,1800,"120,96,66",.1,.6,2,!1),ct(e,t,n,900,"250,238,212",.12,.6,1.6,!1),Ya(e,t,n,2,"rgba(120,94,62,.4)",1.3,60),Dr(e,t,.12)}),Ug=()=>Ht(256,(i,e)=>{let t=Ct(7);i.fillStyle="#15171a",i.fillRect(0,0,e,e);let n=e/4,r=e/2;for(let s=0;s<4;s++){let o=s%2?r/2:0;for(let a=-1;a<3;a++){let l=a*r+o,c=s*n,h=.75+t()*.35;i.fillStyle=`rgb(${90*h|0},${94*h|0},${100*h|0})`;for(let u of[0,e])i.fillRect(l+3-u,c+3,r-6,n-6)}}ct(i,e,t,1400,"16,18,22",.25,.7,2.2),ct(i,e,t,500,"150,156,166",.14,.7,2),ct(i,e,t,60,"20,22,26",.25,4,12)}),Ng=()=>Ht(256,(i,e)=>{let t=Ct(11);i.fillStyle="#7a7e86",i.fillRect(0,0,e,e),ct(i,e,t,200,"26,28,32",.2,6,24),ct(i,e,t,1500,"16,18,20",.25,.6,2),ct(i,e,t,600,"140,146,156",.12,.6,1.8)});function Og(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),n=t.createImageData(128,128),r=[[1,2,.3],[3,-1,1.7],[-2,3,4.1],[4,1,2.2],[-3,-4,5.3],[5,-3,.9]],s=(l,c)=>r.reduce((h,[u,d,p],g)=>h+Math.sin(2*Math.PI*(u*l+d*c)/128+p)/(1+g*.6),0),o=new R;for(let l=0;l<128;l++)for(let c=0;c<128;c++){let h=s(c+1,l)-s(c-1,l),u=s(c,l+1)-s(c,l-1);o.set(-h*1.4,-u*1.4,1).normalize();let d=(l*128+c)*4;n.data[d]=(o.x*.5+.5)*255,n.data[d+1]=(o.y*.5+.5)*255,n.data[d+2]=(o.z*.5+.5)*255,n.data[d+3]=255}t.putImageData(n,0,0);let a=new _n(e);return a.wrapS=a.wrapT=Kn,a}var Fg=()=>Ht(256,(i,e)=>{let t=Ct(21);i.fillStyle="#1c120d",i.fillRect(0,0,e,e),ct(i,e,t,200,"50,30,20",.3,4,18,!1),i.lineCap="round";for(let n=0;n<14;n++){i.strokeStyle=`rgba(${200+t()*55|0},${70+t()*80|0},20,.9)`,i.lineWidth=1+t()*2.5,i.shadowColor="#ff6a10",i.shadowBlur=8,i.beginPath();let r=t()*e,s=t()*e;i.moveTo(r,s);for(let o=0;o<5;o++)r+=(t()-.5)*70,s+=(t()-.5)*70,i.lineTo(r,s);i.stroke()}i.shadowBlur=0,Dr(i,e,.7)}),Bg=()=>Ht(256,(i,e)=>{let t=Ct(31);for(let n=0;n<5;n++){let r=.85+t()*.25;i.fillStyle=`rgb(${196*r|0},${150*r|0},${98*r|0})`,i.fillRect(n*e/5,0,e/5,e),i.fillStyle="rgba(60,36,18,.6)",i.fillRect(n*e/5,0,2,e)}for(let n=0;n<160;n++){i.strokeStyle=`rgba(90,58,30,${.08+t()*.15})`,i.lineWidth=.6+t();let r=t()*e;i.beginPath(),i.moveTo(r,0),i.bezierCurveTo(r+(t()-.5)*8,e*.3,r+(t()-.5)*8,e*.7,r+(t()-.5)*6,e),i.stroke()}}),zg=()=>Ht(256,(i,e)=>{let t=Ct(51);i.fillStyle="#3a2414",i.fillRect(0,0,e,e),ct(i,e,t,500,"20,12,6",.25,.6,2.4,!1),ct(i,e,t,80,"90,60,34",.15,4,16,!1),i.strokeStyle="#d8a640",i.lineWidth=22,i.lineJoin="miter";for(let n of[78,178])i.beginPath(),i.moveTo(40,n+38),i.lineTo(128,n-34),i.lineTo(216,n+38),i.stroke();i.strokeStyle="rgba(0,0,0,.6)",i.lineWidth=10,i.strokeRect(5,5,e-10,e-10)}),kg=()=>Ht(256,(i,e)=>{let t=Ct(61);i.fillStyle="#b6dcea",i.fillRect(0,0,e,e),ct(i,e,t,120,"230,246,252",.25,6,30,!1),ct(i,e,t,90,"120,170,196",.15,6,24,!1),Ya(i,e,t,6,"rgba(250,254,255,.8)",1.6,90),Dr(i,e,.25)}),Gg=()=>Ht(256,(i,e)=>{let t=Ct(71);i.fillStyle="#6a4626",i.fillRect(0,0,e,e),ct(i,e,t,260,"40,24,12",.22,4,20,!1),ct(i,e,t,200,"140,98,58",.16,3,14,!1),ct(i,e,t,2200,"30,18,8",.25,.6,2,!1),ct(i,e,t,40,"170,160,150",.7,2,4.5,!1),Dr(i,e,.45)}),Vg=()=>Ht(256,(i,e)=>{let t=Ct(81);i.fillStyle="#5e5a54",i.fillRect(0,0,e,e),ct(i,e,t,1600,"30,28,26",.3,.8,3,!1),ct(i,e,t,500,"160,154,146",.25,1,4,!1),Dr(i,e,.45)}),Hg=()=>{let i=Ht(256,(e,t)=>{e.translate(t/2,t/2),e.strokeStyle="rgba(214,200,160,.55)",e.lineWidth=3,e.beginPath();for(let n=0;n<6;n++){let r=n/6*Math.PI*2+.3;e.lineTo(Math.cos(r)*112,Math.sin(r)*112)}e.closePath(),e.stroke();for(let n=0;n<28;n++){let r=n/28*Math.PI*2;e.save(),e.rotate(r),e.translate(76,0),e.rotate(n%2?.6:-.6),e.fillStyle=n%2?"#4f7a3a":"#3d6a30",e.beginPath(),e.ellipse(0,0,14,6,0,0,7),e.fill(),e.restore()}});return i.wrapS=i.wrapT=vt,i},Wg=()=>{let i=Ht(256,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,"#f2fbff"),n.addColorStop(.35,"#6fc0ef"),n.addColorStop(1,"#1a4f9a"),e.fillStyle=n,e.fillRect(0,0,t,t),e.translate(t/2,t/2),e.lineCap="round";for(let r=0;r<3;r++){e.strokeStyle="rgba(255,255,255,.85)",e.lineWidth=9,e.beginPath();for(let s=0;s<=60;s++){let o=s/60,a=r*(Math.PI*2/3)+o*4.2,l=8+o*110;e.lineTo(Math.cos(a)*l,Math.sin(a)*l)}e.stroke()}});return i.wrapS=i.wrapT=vt,i},Xg=()=>{let i=Ht(256,(e,t)=>{e.fillStyle="#3a1f52",e.fillRect(0,0,t,t),ct(e,t,Ct(91),300,"20,10,30",.3,1,4,!1),e.fillStyle="#e0a838",e.translate(t/2,t/2+18),e.beginPath(),e.roundRect(-46,-30,92,92,30),e.fill();for(let[n,r,s]of[[-34,70,18],[-12,92,19],[12,96,19],[35,78,18]])e.beginPath(),e.roundRect(n-s/2,-30-r,s,r+20,s/2),e.fill();e.save(),e.translate(-50,14),e.rotate(-.8),e.beginPath(),e.roundRect(-11,-58,22,66,11),e.fill(),e.restore()});return i.wrapS=i.wrapT=vt,i},qg=()=>Ht(256,(i,e)=>{let t=Ct(41);i.fillStyle="#ad9f86",i.fillRect(0,0,e,e),ct(i,e,t,300,"60,52,44",.15,4,20,!1),ct(i,e,t,1500,"50,44,38",.2,.6,2,!1),Ya(i,e,t,4,"rgba(60,50,40,.45)",2,40);let n=(r,s,o)=>{i.save(),i.translate(e/2+r,e/2+s),i.fillStyle=o,i.fillRect(-7,-80,14,160);for(let a of[-1,1])i.beginPath(),i.moveTo(0,-38),i.quadraticCurveTo(a*60,-70,a*78,-50),i.quadraticCurveTo(a*58,0,a*78,50),i.quadraticCurveTo(a*60,70,0,38),i.fill();i.restore()};n(3,3,"rgba(225,210,185,.35)"),n(0,0,"rgba(40,32,26,.4)"),i.strokeStyle="rgba(40,32,26,.6)",i.lineWidth=6,i.strokeRect(10,10,e-20,e-20)}),Yg=()=>{let i=Ht(64,(e,t)=>{let n=e.createLinearGradient(0,0,0,t);n.addColorStop(0,"rgba(0,0,0,0.85)"),n.addColorStop(.18,"rgba(0,0,0,0.6)"),n.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=n,e.fillRect(0,0,t,t)});return i.wrapS=i.wrapT=vt,i},Zg=()=>{let i=Ht(64,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,"rgba(255,220,160,1)"),n.addColorStop(.35,"rgba(255,150,60,.45)"),n.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=n,e.fillRect(0,0,t,t)});return i.wrapS=i.wrapT=vt,i},be=(i,e={})=>new jt({color:i,roughness:.8,metalness:0,...e}),ar=(i,e=.9)=>new ft({color:i,transparent:!0,opacity:e,blending:fi,depthWrite:!1}),Kg=.022;function Jg(){let i=new ft({color:656900,side:At});return i.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${Kg.toFixed(3)};`)},i}function gh(i){let e=new ji(i),t=new Qs(i),n=e.fromScene(t,.04).texture;t.dispose(),e.dispose();let r=(c,h=.35,u={})=>be(c,{roughness:h,metalness:.85,envMap:n,envMapIntensity:.55,...u}),s={brick:Ug(),cap:Ng(),water:Og(),ember:Fg(),wood:Bg(),force:zg(),ice:kg(),dirt:Gg(),gravel:Vg(),wreath:Hg(),swirl:Wg(),hand:Xg(),halo:Zg(),ao:Yg(),block:qg(),flags:[101,202,303].map(Dg)},o={under:be(789e3,{roughness:1}),mortar:be(Qn().caps?1972242:7232580,{roughness:1}),ao:new ft({map:s.ao,transparent:!0,depthWrite:!1}),edge:be(789776,{roughness:1,side:Nt}),flags:s.flags.map(c=>be(16777215,{map:c,roughness:.88})),ember:be(16777215,{map:s.ember,emissiveMap:s.ember,emissive:16742960,emissiveIntensity:.9,roughness:.9}),ice:be(10274004,{map:s.ice,roughness:.08,metalness:.1,envMap:n,envMapIntensity:.35}),force:be(16777215,{map:s.force,roughness:.7}),dirt:be(16777215,{map:s.dirt,roughness:.97}),gravelBed:be(16777215,{map:s.gravel,roughness:.95}),pebble:be(9076850,{roughness:.9}),water:be(1722962,{roughness:.14,metalness:.1,normalMap:s.water,normalScale:new J(.55,.55),emissive:399388,envMap:n,envMapIntensity:.25}),basin:be(925216,{roughness:.9}),side:be(11843776,{map:s.brick,roughness:.93}),top:be(Qn().caps?15921128:10791602,{map:s.cap,roughness:.95}),wood:be(16777215,{map:s.wood,roughness:.75}),darkWood:be(9071178,{map:s.wood,roughness:.8}),iron:r(3025446,.6),bronze:r(12618308,.4,{emissive:2758664}),gold:r(15250496,.3,{emissive:5912064}),stone:be(9075818),paleStone:be(13285530,{roughness:.85}),dark:be(657415),keyColor:{red:be(14692382,{roughness:.45,emissive:5901316}),blue:be(3108576,{roughness:.45,emissive:794202}),yellow:be(15910968,{roughness:.45,emissive:5915648}),green:be(3127388,{roughness:.45,emissive:805406})},brownButton:be(6962718,{roughness:.55}),redButton:be(11545116,{roughness:.45,emissive:2753538}),cream:be(15260864,{roughness:.6}),wreath:new jt({map:s.wreath,transparent:!0,roughness:.8,depthWrite:!1}),swirl:new jt({map:s.swirl,emissiveMap:s.swirl,emissive:new Je(6994175),emissiveIntensity:.9,roughness:.3}),hand:be(16777215,{map:s.hand,roughness:.6}),clay:be(11564104,{roughness:.75}),block:be(16777215,{map:s.block,roughness:.85}),skin:be(12618338,{roughness:.7}),tunic:be(2383482,{roughness:.8}),cloak:be(9054750),leather:be(5913122,{roughness:.8}),steel:r(13225424,.3),heroSkin:be(15118472,{roughness:.6,emissive:3020298}),heroTunic:be(3117008,{roughness:.55,emissive:666180}),heroCloak:be(14170660,{roughness:.65,emissive:4328452}),heroLeather:be(9067058,{roughness:.7,emissive:1707012}),heroHair:be(5911576,{roughness:.8,emissive:1312770}),heroRing:new ft({color:1284676,depthWrite:!1}),heroRingEdge:new ft({color:398346,transparent:!0,opacity:.8,depthWrite:!1}),itemShade:new ft({color:656900,transparent:!0,opacity:.9,depthWrite:!1}),itemRing:new ft({color:16773304,depthWrite:!1}),heroBeam:new ft({color:3593324,transparent:!0,opacity:.3,blending:fi,depthTest:!1,depthWrite:!1,side:Nt}),heroXray:new ft({color:6090890,transparent:!0,opacity:.6,depthFunc:Ba,depthWrite:!1,stencilWrite:!0,stencilRef:1,stencilFunc:nh}),outline:Jg(),fur:be(5912096,{roughness:.9,emissive:1181700}),furDark:be(3941396,{roughness:.9}),snout:be(6965814),ivory:be(14866106,{roughness:.5}),kilt:be(11545116,{emissive:2754050}),hoof:be(1314832),eye:new ft({color:16730650}),statue:be(9342088,{roughness:.9}),statueDark:be(6973540,{roughness:.92}),parchment:be(15785648,{emissive:3024920}),teal:be(3193004,{roughness:.4,emissive:670262}),boot:be(12596762,{roughness:.55,emissive:3804164}),bootTrim:be(14715424,{emissive:5906944}),skate:be(13162728,{roughness:.45,emissive:2634300}),suction:be(3445854,{roughness:.5,emissive:798234}),mirror:r(15132390,.08,{envMapIntensity:1,emissive:4211784}),gorgon:be(3450970,{roughness:.5,emissive:798744}),cake:be(15773768,{roughness:.55,emissive:4203528}),hide:be(16051938,{roughness:.65,emissive:2894374}),patch:be(5911072,{roughness:.8}),feather:be(9067058,{roughness:.8,emissive:1970184}),halo:s.halo,env:n},a=new Set([n,...s.flags,...Object.values(s).filter(c=>c instanceof _n)]);for(let c of Object.values(o))c&&typeof c=="object"&&"isMaterial"in c?a.add(c):Array.isArray(c)&&c.forEach(h=>a.add(h));for(let c of Object.values(o.keyColor))a.add(c);return{t:s,m:o,metal:r,std:be,keeps:a,dispose:()=>{for(let c of a)c.dispose()}}}var Ur=new R;function on(i,e,t,n,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;Ur.copy(e),Ur[n]=0,Ur.normalize();let c=.5*o/(o+a),h=1-Ur.angleTo(i)/l;return Math.sign(Ur[t])===1?h*c:a/(o+a)+c+c*(1-h)}var xn=class extends dn{constructor(e=1,t=1,n=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,n/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new R,l=new R,c=new R(e,t,n).divideScalar(2).subScalar(s),h=this.attributes.position.array,u=this.attributes.normal.array,d=this.attributes.uv.array,p=h.length/6,g=new R,_=.5/r;for(let m=0,f=0;m<h.length;m+=3,f+=2)switch(a.fromArray(h,m),l.copy(a),l.x-=Math.sign(l.x)*_,l.y-=Math.sign(l.y)*_,l.z-=Math.sign(l.z)*_,l.normalize(),h[m+0]=c.x*Math.sign(a.x)+l.x*s,h[m+1]=c.y*Math.sign(a.y)+l.y*s,h[m+2]=c.z*Math.sign(a.z)+l.z*s,u[m+0]=l.x,u[m+1]=l.y,u[m+2]=l.z,Math.floor(m/p)){case 0:g.set(1,0,0),d[f+0]=on(g,l,"z","y",s,n),d[f+1]=1-on(g,l,"y","z",s,t);break;case 1:g.set(-1,0,0),d[f+0]=1-on(g,l,"z","y",s,n),d[f+1]=1-on(g,l,"y","z",s,t);break;case 2:g.set(0,1,0),d[f+0]=1-on(g,l,"x","z",s,e),d[f+1]=on(g,l,"z","x",s,n);break;case 3:g.set(0,-1,0),d[f+0]=1-on(g,l,"x","z",s,e),d[f+1]=1-on(g,l,"z","x",s,n);break;case 4:g.set(0,0,1),d[f+0]=1-on(g,l,"x","y",s,e),d[f+1]=1-on(g,l,"y","x",s,t);break;case 5:g.set(0,0,-1),d[f+0]=on(g,l,"x","y",s,e),d[f+1]=1-on(g,l,"y","x",s,t);break}}};var _h=["up","down","left","right"];var Za={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},Qe=(i,e,t,n={},r,s=e)=>({char:i,minotaur:e,block:t,hazard:s,...n,sprites:r??[]}),Ka={floor:Qe(".",!0,!0,{},["floor"]),wall:Qe("#",!1,!1,{},["wall"]),exit:Qe("E",!1,!1,{},["exit"]),gate:Qe("|",!1,!1,{},["gate-closed","gate-open"]),water:Qe("~",!1,!0,{needs:"flippers"},["water"]),fire:Qe("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:Qe("=",!0,!0,{slides:"skates"},["ice"]),"force-up":Qe("^",!0,!0,{carries:"up"},["force-up"]),"force-down":Qe("v",!0,!0,{carries:"down"},["force-down"]),"force-left":Qe("<",!0,!0,{carries:"left"},["force-left"]),"force-right":Qe(">",!0,!0,{carries:"right"},["force-right"]),dirt:Qe("%",!0,!0,{},["dirt"]),safe:Qe("S",!1,!1,{},["safe"]),button:Qe("_",!0,!0,{},["button"]),"toggle-open":Qe("t",!0,!1,{},["toggle-open"]),"toggle-closed":Qe("T",!1,!1,{},["toggle-closed"]),"door-red":Qe("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":Qe("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":Qe("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":Qe("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:Qe("&",!0,!0,{},["trap"]),"button-brown":Qe("-",!0,!0,{},["button-brown"]),"button-red":Qe("+",!0,!0,{},["button-red"]),popup:Qe(";",!1,!1,{},["popup"]),gravel:Qe(":",!1,!1,{},["gravel"]),"fake-wall":Qe("W",!1,!1,{},["wall"]),"invisible-wall":Qe("I",!1,!1,{},["floor"]),teleport:Qe("@",!1,!1,{},["teleport"]),thief:Qe("$",!0,!0,{},["thief"]),bomb:Qe("!",!1,!0,{},["bomb"],!0),clone:Qe("C",!1,!1,{},_h.map(i=>`clone-${i}`))},eo={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var Nr={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:Za.mirror.name},cake:{char:"x",sprite:"cake",name:Za.cake.name},cow:{char:"c",sprite:"cow",name:Za.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},$g=["theseus","minotaur","minotaur-stone","cow-standing"],jg=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],Qg=["exit-off","exit-wake"],ix=[...new Set([...Object.values(Ka).flatMap(i=>i.sprites),...jg,...Qg,...Object.values(Nr).map(i=>i.sprite),...$g,...Object.values(eo).map(i=>i.sprite)])];var Ja=4;var e_=[[.3,420],[.36,160],[.3,200],[.36,160],[.3,380],[-.12,520],[0,400]],ox=e_.reduce((i,[,e])=>i+e,0);var xh={floor:"flag",wall:"none",exit:"flag","gate-closed":"flag","gate-open":"flag",water:"water",fire:"ember",ice:"ice","force-up":"force","force-down":"force","force-left":"force","force-right":"force",dirt:"dirt",safe:"flag",button:"flag","toggle-open":"flag","toggle-closed":"flag","door-red":"flag","door-blue":"flag","door-yellow":"flag","door-green":"flag","door-red-sill":"flag","door-blue-sill":"flag","door-yellow-sill":"flag","door-green-sill":"flag",trap:"flag","button-brown":"flag","button-red":"flag",popup:"flag",gravel:"gravel",teleport:"flag",thief:"flag",bomb:"flag","clone-up":"flag","clone-down":"flag","clone-left":"flag","clone-right":"flag"};function yh(i,e,t){let n=[[-1,0],[0,-1],[0,1],[1,0]].find(([r,s])=>i(e+r,t+s));return n?[0-n[0],0-n[1]]:[1,0]}var vh=["theseus","minotaur","minotaur-stone"];var $=.1,t_=.035,Or=(i,e)=>i-(e-1)/2,Fr=(i,e)=>i-(e-1)/2,n_={"force-up":0,"force-left":Math.PI/2,"force-down":Math.PI,"force-right":-Math.PI/2},Mh=26;function bh(i){let{m:e}=i,t=new Me,n=new xn(.97,.12,.97,2,.02);n.translate(0,$-.06,0);let r=new qt(1,1);r.rotateX(-Math.PI/2),r.translate(0,t_,0);let s=new Hs(.045,0),o=new ae(new qt(1,1),e.under);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,t.add(o);let a=new qt(1,1);a.rotateX(-Math.PI/2);let l=[],c=(u,d,p)=>{let g=new Ns(u,d,Math.max(1,p));return g.count=p,g.receiveShadow=!0,l.push(g),t.add(g),g},h=()=>{for(let u of l)t.remove(u),u.dispose();l=[]};return{group:t,set(u,d,p){h();let g=new $t([new J(-100,-100),new J(100,-100),new J(100,100),new J(-100,100)]);g.holes.push(new er([new J(-p/2,-d/2),new J(-p/2,d/2),new J(p/2,d/2),new J(p/2,-d/2)])),o.geometry.dispose(),o.geometry=new nr(g);let _=[[],[],[]],m={ember:[],ice:[],force:[],dirt:[],gravel:[],water:[],mortar:[]};u.forEach((T,A)=>{let D=xh[T];m.mortar.push(A),D==="flag"?_[Ct(A*2654435761+7)()*3|0].push(A):D!=="none"&&m[D].push(A)});let f=new ot,y=new Je,x=(T,A,D,M)=>{A.forEach((b,U)=>{let H=Ct(b*40503+11);if(f.makeRotationY(D(b,H)).setPosition(Or(b%p,p),0,Fr(Math.floor(b/p),d)),T.setMatrixAt(U,f),M){let j=.78+H()*.3;T.setColorAt(U,y.setRGB(j*(1+(H()-.5)*.06),j,j*(1-H()*.06)))}})},S=(T,A)=>(A()*4|0)*(Math.PI/2);x(c(a,e.mortar,m.mortar.length),m.mortar,()=>0,!1),_.forEach((T,A)=>x(c(n,e.flags[A],T.length),T,S,!0)),x(c(n,e.ember,m.ember.length),m.ember,S,!1),x(c(n,e.ice,m.ice.length),m.ice,S,!1),x(c(n,e.dirt,m.dirt.length),m.dirt,S,!0),x(c(n,e.gravelBed,m.gravel.length),m.gravel,S,!0),x(c(n,e.force,m.force.length),m.force,T=>n_[u[T]]??0,!1),x(c(r,e.water,m.water.length),m.water,()=>0,!1);let C=m.gravel;if(C.length){let T=c(s,e.pebble,C.length*Mh);T.castShadow=!0;let A=0;for(let D of C){let M=Ct(D*7919+3);for(let b=0;b<Mh;b++){let U=.7+M()*.5;f.makeScale(U,.6*U,U).setPosition(Or(D%p,p)+(M()-.5)*.8,$+.015,Fr(Math.floor(D/p),d)+(M()-.5)*.8),T.setMatrixAt(A,f),T.setColorAt(A++,y.setScalar(.75+M()*.5))}}}},loop(u){i.t.water.offset.set(Math.sin(u*.5)*.04,u*.025%1),e.water.emissiveIntensity=1+.15*Math.sin(u*1.3)},dispose(){h(),n.dispose(),r.dispose(),s.dispose(),a.dispose(),o.geometry.dispose()}}}var i_=i=>Math.max(0,Math.min(1,i)),r_=.06666666666666667;function Sh(i){return 1-.67*i_(i)}function wh(i,e,t){let n=e-i;return Math.abs(n)<.005?e:i+n*(1-Math.exp(-t/r_))}var Br=1.25;var $a=.38,s_=.16,ja=.26,o_=.05,a_={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};function l_(i){let[e,,t]=Nn[i].n,n=1.002,r=.5,s=.5-o_,o=e!==0?[[e*s,n,-.5*e],[e*s,n,.5*e],[e*r,n,.5*e],[e*r,n,-.5*e]]:[[.5*t,n,t*s],[-.5*t,n,t*s],[-.5*t,n,t*r],[.5*t,n,t*r]];return(e<0||t<0)&&o.reverse(),{v:o,n:[0,1,0],uvs:[[0,0],[1,0],[1,1],[0,1]],mat:2}}var Nn={n:{d:[-1,0],v:[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]],n:[0,0,-1],u:i=>-i[0]},s:{d:[1,0],v:[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]],n:[0,0,1],u:i=>i[0]},w:{d:[0,-1],v:[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]],n:[-1,0,0],u:i=>i[2]},e:{d:[0,1],v:[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]],n:[1,0,0],u:i=>-i[2]}},c_=Object.keys(Nn);function Eh(i){let e=[],t=[],n=[],r=[],s=new _t,o=0;for(let{v:a,n:l,uvs:c,mat:h}of i){let u=e.length/3;a.forEach((d,p)=>{e.push(...d),t.push(...l),n.push(...c[p])}),r.push(u,u+1,u+2,u,u+2,u+3),s.addGroup(o,6,h),o+=6}return s.setAttribute("position",new Be(e,3)),s.setAttribute("normal",new Be(t,3)),s.setAttribute("uv",new Be(n,2)),s.setIndex(r),s}var Th=(i,e,t)=>({v:Nn[i].v,n:Nn[i].n,mat:0,uvs:Nn[i].v.map(n=>[Nn[i].u([n[0]+e,0,n[2]+t]),n[1]*Br])}),Qa=[];for(let i of[.15,.5,.85])for(let e of[.15,.5,.85])for(let t of[.15,.5,.85])Qa.push([i,e,t]);function h_(i,e,t,n){let r=-1e9,s=1e9;for(let o=0;o<3;o++){if(Math.abs(e[o])<1e-9){if(i[o]<t[o]||i[o]>n[o])return-1;continue}let a=(t[o]-i[o])/e[o],l=(n[o]-i[o])/e[o];if(a>l&&([a,l]=[l,a]),a>r&&(r=a),l<s&&(s=l),r>s)return-1}return r}function Ah(i){let e=new Me,t=[],n=new qt(1,ja);n.rotateX(-Math.PI/2);let r=[],s=new Map,o=0,a="solid",l=new R,c=u=>{let d=u.op<.999;for(let p of u.mats)p.transparent!==d&&(p.transparent=d,p.needsUpdate=!0),p.opacity=u.op},h=()=>{for(let u of t){e.remove(u.mesh),u.mesh.geometry.dispose();for(let d of u.inner)d.mesh.geometry.dispose();for(let d of u.mats)d.dispose()}t=[],s.clear();for(let u of r)e.remove(u);r=[]};return{group:e,list:()=>t,at:(u,d)=>s.get(u*o+d),build(u,d,p){h(),o=p;let g=(m,f)=>m<0||f<0||m>=d||f>=o||u[m*o+f]==="wall",_=a==="low"?$a:Br;for(let m=0;m<d;m++)for(let f=0;f<o;f++){if(u[m*o+f]!=="wall")continue;let y=Or(f,o),x=Fr(m,d),S=[{v:[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]],n:[0,1,0],mat:1,uvs:[[y-.5,-x-.5],[y+.5,-x-.5],[y+.5,-x+.5],[y-.5,-x+.5]]}],C=[];for(let b of c_){let[U,H]=Nn[b].d,j=m+U,I=f+H;if(g(j,I)&&j>=0&&I>=0&&j<d&&I<o?C.push(b):S.push(Th(b,y,x)),g(j,I))continue;S.push(l_(b));let[F,,V]=Nn[b].n,Z=new ae(n,i.m.ao);Z.position.set(y+F*(.5+ja/2),$+.003,x+V*(.5+ja/2)),Z.rotation.y=a_[b],Z.renderOrder=1,e.add(Z),r.push(Z)}let T=[i.m.side.clone(),i.m.top.clone(),i.m.edge.clone()],A=m===0||f===0||m===d-1||f===o-1;if(!A){A=!0;for(let b=-1;b<=1;b++)for(let U=-1;U<=1;U++)g(m+b,f+U)||(A=!1)}A&&T[1].color.multiplyScalar(s_);let D=new ae(Eh(S),T);D.position.set(y,0,x),D.scale.y=_,D.castShadow=D.receiveShadow=!0,e.add(D);let M={r:m,c:f,x:y,z:x,mesh:D,mats:T,op:1,target:1,inner:[]};for(let b of C){let U=new ae(Eh([Th(b,y,x)]),[T[0]]);U.visible=!1,D.add(U),M.inner.push({k:b,mesh:U,nb:null})}t.push(M),s.set(m*o+f,M)}for(let m of t)for(let f of m.inner){let[y,x]=Nn[f.k].d;f.nb=s.get((m.r+y)*o+m.c+x)??null}},setMode(u){a=u;let d=u==="low"?$a:Br;for(let p of t)p.mesh.scale.y=d},aim(u,d){let p=new Map,g=a==="low"?$a:Br;u.getWorldDirection(l);let _=[l.x,l.y,l.z],m=30,f=Math.max(3.2,g/Math.max(.05,-_[1]/Math.hypot(_[0],_[2]))+1.2);for(let y of d){let x=t.filter(C=>Math.abs(C.x-y.x)<f&&Math.abs(C.z-y.z)<f);if(x.length===0)continue;let S=new Map;for(let[C,T,A]of Qa){let D=[y.x-y.half+2*y.half*C,$+y.h*T,y.z-y.half+2*y.half*A],M=[D[0]-_[0]*m,D[1]-_[1]*m,D[2]-_[2]*m];for(let b of x){let U=h_(M,_,[b.x-.49,0,b.z-.49],[b.x+.49,g,b.z+.49]);U>=0&&U<m-.01&&S.set(b,(S.get(b)??0)+1)}}for(let[C,T]of S)p.set(C,Math.max(p.get(C)??0,T/Qa.length))}for(let y of t){let x=Math.min(1,Math.max(0,((p.get(y)??0)-.03)/.45));y.target=Sh(x*x*(3-2*x))}},ease(u,d){let p=!1;for(let g of t)g.op!==g.target&&(g.op=d?g.target:wh(g.op,g.target,u),p=!0,c(g));if(p)for(let g of t)for(let _ of g.inner)_.mesh.visible=!!_.nb&&_.nb.op<.999&&g.op>_.nb.op+.02;return p},dispose(){h(),n.dispose()}}}function Ch(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),r=new Set(Object.keys(i[0].morphAttributes)),s={},o={},a=i[0].morphTargetsRelative,l=new _t,c=0;for(let h=0;h<i.length;++h){let u=i[h],d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in u.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;s[p]===void 0&&(s[p]=[]),s[p].push(u.attributes[p]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in u.morphAttributes){if(!r.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[p]===void 0&&(o[p]=[]),o[p].push(u.morphAttributes[p])}if(e){let p;if(t)p=u.index.count;else if(u.attributes.position!==void 0)p=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,h),c+=p}}if(t){let h=0,u=[];for(let d=0;d<i.length;++d){let p=i[d].index;for(let g=0;g<p.count;++g)u.push(p.getX(g)+h);h+=i[d].attributes.position.count}l.setIndex(u)}for(let h in s){let u=Rh(s[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let p=[];for(let _=0;_<o[h].length;++_)p.push(o[h][_][d]);let g=Rh(p);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function Rh(i){let e,t,n,r=-1,s=0;for(let c=0;c<i.length;++c){let h=i[c];if(h.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=h.gpuType),r!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=h.array.length}let o=new e(s),a=0;for(let c=0;c<i.length;++c)o.set(i[c].array,a),a+=i[c].array.length;let l=new kt(o,t,n);return r!==void 0&&(l.gpuType=r),l}var pn=(i,e,t,n)=>(i.position.set(e,t,n),i);function Lh(i,e,t,n=!1){let r=document.createElement("canvas");r.width=i,r.height=e,t(r.getContext("2d"));let s=new _n(r);return s.colorSpace=ut,s.wrapS=s.wrapT=n?Kn:vt,s}function Ph(i,e){return Lh(128,128,t=>{let n=t.createRadialGradient(64,64,0,64,64,64);n.addColorStop(0,i),n.addColorStop(.5,e),n.addColorStop(1,"rgba(0,0,0,0)"),t.fillStyle=n,t.fillRect(0,0,128,128)})}function u_(){return Lh(128,256,i=>{let e=i.createLinearGradient(0,0,128,0);e.addColorStop(0,"#0b5fa8"),e.addColorStop(.5,"#bfe9ff"),e.addColorStop(1,"#0b5fa8"),i.fillStyle=e,i.fillRect(0,0,128,256),i.strokeStyle="rgba(255,255,255,0.35)",i.lineWidth=3;for(let t=0;t<8;t++){i.beginPath();for(let n=0;n<=128;n+=4)i.lineTo(n,t*32+10*Math.sin(n/20+t));i.stroke()}},!0)}function d_(i,e,t,n,r,s,o){i.add(pn(e(.2,.06,.2,n),0,$+.03,s)),i.add(pn(t(.065,.075,o,n),0,$+.06+o/2,s)),i.add(pn(e(.2,.07,.2,r),0,$+.06+o+.035,s))}function Ih(i,e){let t=new $t;t.moveTo(-i,$),t.lineTo(-i,e),t.absarc(0,e,i,Math.PI,0,!0),t.lineTo(i,$),t.lineTo(-i,$);let n=new nr(t,24);return n.rotateY(Math.PI/2),n}function Dh(i,e,t){let n=new Me,r=[],s=new jt({color:15920352,roughness:.55}),o=.36,a=.62;for(let b of[-o,o])d_(n,e,t,s,i.m.gold,b,a);let l=$+.06+a+.07,c=new ae(new Vt(o,.06,8,24,Math.PI),s);c.scale.z=1.6,c.rotation.y=Math.PI/2,n.add(pn(c,0,l,0)),n.add(pn(e(.16,.14,.1,i.m.gold),0,l+o+.02,0));let h=new jt({color:2502715,roughness:.9,transparent:!0,side:Nt}),u=pn(new ae(Ih(.3,l),h),.015,0,0);r.push(u);let d=u_(),p=new ft({map:d,transparent:!0,opacity:.92,side:Nt,depthWrite:!1}),g=Ih(.3,l);g.translate(0,-$,0);let _=pn(new ae(g,p),0,$,0);r.push(_);let m=new ae(new Vt(.42,.03,6,40),s);m.rotation.x=Math.PI/2,n.add(pn(m,0,$+.012,0));let f=new ae(new mi(.42,40),new jt({color:9077624,roughness:.95}));f.rotation.x=-Math.PI/2,n.add(pn(f,0,$+.006,0));let y=new ft({map:Ph("rgba(190,235,255,1)","rgba(30,120,210,0.95)"),transparent:!0,opacity:.95,depthWrite:!1}),x=new ae(new mi(.42,40),y);x.rotation.x=-Math.PI/2,r.push(pn(x,0,$+.015,0));let S=new ft({map:Ph("rgba(150,215,255,0.8)","rgba(40,130,220,0.3)"),transparent:!0,opacity:.7,blending:fi,depthWrite:!1,side:Nt}),C=new ae(new qt(1.1,1.3),S);C.rotation.y=Math.PI/2,r.push(pn(C,.01,l-.05,0));let T=1,A=.92,D=.95,M=()=>{_.visible=x.visible=C.visible=T>.001,u.visible=T<.999,h.opacity=1-T,_.scale.y=T,x.scale.setScalar(Math.max(.001,T)),p.opacity=A*T,y.opacity=D*T,S.opacity=.7*T};return{g:n,live:r,h:l+.45,loop:b=>{d.offset.y=b*.06%1,A=.86+.08*Math.sin(b*1.4),D=.85+.1*Math.sin(b*1.4+1),M()},light:b=>{T=Math.min(1,Math.max(0,b)),M()}}}var k=(i,e,t,n)=>(i.position.set(e,t,n),i),f_=(i,e,t,n=14)=>new jn(i,e,t,n),Ce=(i,e,t,n,r=14)=>new ae(f_(i,e,t,r),n),ze=(i,e,t,n)=>new ae(new dn(i,e,t),n),vi=i=>(i.rotation.x=Math.PI/2,i);function p_(i){i.updateMatrixWorld(!0);let e=new Map;i.traverse(n=>{if(!(n instanceof ae))return;let r=n.geometry.clone().applyMatrix4(n.matrixWorld);r.index&&(r=r.toNonIndexed());for(let o of Object.keys(r.attributes))o!=="position"&&o!=="normal"&&o!=="uv"&&r.deleteAttribute(o);let s=n.material;e.set(s,[...e.get(s)??[],r]),n.geometry.dispose()});let t=new Me;for(let[n,r]of e){let s=new ae(Ch(r),n);r.forEach(o=>o.dispose()),s.castShadow=s.receiveShadow=!0,t.add(s)}return t}function no(i,e){let t=[];for(let n of e.children)n instanceof ae&&!n.userData.live&&t.push(new ae(n.geometry,i.m.outline));return e.add(...t),e}function St(i,e,t=[]){let n=p_(i);return t.length&&n.add(...t),n.userData=e,n}var yn=()=>Object.assign(new Me,{userData:{half:0,h:0}}),el=i=>(i.wall(i.r-1,i.c)||i.wall(i.r+1,i.c))&&!(i.wall(i.r,i.c-1)&&i.wall(i.r,i.c+1));function ei(i,e,t){let{m:n}=i.kit,r=n.keyColor[e],s=new Me,o=1.1,a=.26;s.add(k(ze(1,.008,a+.08,n.dark),0,$+.003,0)),s.add(k(ze(.98,.012,a,r),0,$+.007,0));let l=new Me;l.add(k(ze(1,o,a,n.wood),0,o/2,0)),l.add(k(ze(1,.06,a+.02,n.iron),0,.34,0)),l.add(k(ze(1,.16,a+.02,r),0,.8,0)),l.add(k(ze(1,.1,a+.02,r),0,.06,0)),l.add(k(ze(1,.04,a+.02,r),0,o+.02,0)),l.add(k(ze(.16,.18,a+.04,n.iron),.24,.55,0)),l.add(vi(k(Ce(.05,.05,a+.08,r,12),.24,.55,0))),l.traverse(u=>{u instanceof ae&&(u.castShadow=u.receiveShadow=!0)});let c=u=>{l.position.y=-(o+.14)*u,l.visible=u<1};c(t?1:0);let h=Fh(i,[l]);return el(i)&&(s.rotation.y=Math.PI/2),St(s,{half:.4,h:t?.02:o,tall:!t,open:c},h)}var zr=null;function m_(){if(zr)return zr;let i=128,e=document.createElement("canvas");e.width=e.height=i;let t=e.getContext("2d");t.fillStyle="#050302",t.fillRect(0,0,i,i);let n=(o,a,l,c,h,u,d,p,g)=>{let _=t.createLinearGradient(h,u,d,p);_.addColorStop(0,g),_.addColorStop(1,"#0a0604"),t.fillStyle=_,t.fillRect(o,a,l-o,c-a)},r=i*.2;n(0,0,i,r,0,0,0,r,"#6a5236"),n(0,i-r,i,i,0,i,0,i-r,"#2a1e14"),n(0,0,r,i,0,0,r,0,"#4a3826"),n(i-r,0,i,i,i,0,i-r,0,"#4a3826"),t.fillStyle="#1e160f",t.fillRect(r,r,i-2*r,i-2*r);let s=Ct(7);for(let o=0;o<14;o++)t.fillStyle=["#3a2c1e","#2c2116","#4a3a28"][o%3],t.beginPath(),t.ellipse(r+s()*(i-2*r),r+s()*(i-2*r),3+s()*5,2+s()*4,s()*3,0,Math.PI*2),t.fill();return zr=new _n(e),zr.colorSpace=ut,zr}function Uh(i,e){let{m:t}=i.kit,n=new Me,r=.7,s=.06,o=new ae(new qt(1,r),new ft({map:m_()}));o.rotation.x=-Math.PI/2,n.add(k(o,0,$+.004,0));for(let c of[-1,1])n.add(k(ze(1,.07,.15,t.paleStone),0,$+.035,c*(r/2+.075))),n.add(k(ze(1,.012,.02,t.dark),0,$+.072,c*(r/2+.005)));let a=[];for(let c=0;c<Ja;c++){let h=-r/2+r*(c+.5)/Ja;for(let u of[-1,1]){let d=k(Ce(s,s,.5,t.bronze,12),0,$+.06,h);d.rotation.z=Math.PI/2,d.castShadow=d.receiveShadow=!0,d.userData.side=u,a.push(d)}}let l=c=>{for(let h of a)h.visible=c>.01,h.scale.y=Math.max(.01,c),h.position.x=h.userData.side*(.5-.25*c)};return l(e?1:0),el(i)&&(n.rotation.y=Math.PI/2),St(n,{half:.5,h:.15,open:l},Fh(i,a))}function Fh(i,e){let t=new Me;return t.add(...e),el(i)&&(t.rotation.y=Math.PI/2),[t]}function g_(i){let e=Dh(i.kit,ze,Ce),[t,n]=yh(i.wall,i.r,i.c);e.g.rotation.y=Math.atan2(t,-n);let r=new Me;return r.add(...e.live),r.rotation.y=e.g.rotation.y,St(e.g,{half:.45,h:e.h,tall:!0,loop:e.loop,open:e.light},[r])}function Nh(i,e){let{m:t}=i.kit,n=new Me;if(e){n.add(k(ze(.8,.72-.04,.8,t.dark),0,$+.72/2,0));for(let s of[$+.04,$+.72-.04])n.add(k(ze(.92,.08,.92,t.darkWood),0,s,0));for(let s of[-1,1])for(let o of[-1,1])n.add(k(ze(.1,.72,.1,t.darkWood),s*.41,$+.72/2,o*.41));for(let s=0;s<4;s++){let o=-.27+s*.18;for(let a of[-1,1])n.add(k(ze(.07,.72-.12,.05,t.wood),o,$+.72/2,a*.43)),n.add(k(ze(.05,.72-.12,.07,t.wood),a*.43,$+.72/2,o));n.add(k(ze(.07,.04,.8,t.wood),o,$+.72-.01,0))}return St(n,{half:.46,h:.72+.1})}n.add(k(ze(.84,.02,.84,t.dark),0,$+.005,0));for(let r of[-1,1])n.add(k(ze(.88,.04,.07,t.darkWood),0,$+.02,r*.42)),n.add(k(ze(.07,.04,.88,t.darkWood),r*.42,$+.02,0));for(let r=0;r<4;r++)n.add(k(ze(.08,.035,.8,t.wood),-.27+r*.18,$+.018,0));return St(n,{half:.42,h:.06})}function Bh(i,e,t=.3){let n=new Me;return n.add(k(Ce(t,t+.03,.05,i,28),0,$+.025,0)),n.add(k(Ce(t-.05,t-.04,.03,e,28),0,$+.06,0)),n}function __(i){let{m:e}=i.kit,t=new Me;t.add(k(Ce(.28,.31,.05,e.iron,24),0,$+.025,0));let n=k(new ae(new Un(.21,20,10,0,Math.PI*2,0,Math.PI/2),e.brownButton),0,$+.04,0);return n.scale.y=.55,t.add(n),St(t,{half:.3,h:.16})}function Oh(i,e){let{m:t}=i.kit,n=Bh(t.bronze,e);return n.add(vi(k(new ae(new Vt(.15,.018,8,32),t.cream),0,$+.077,0))),n.add(k(Ce(.05,.055,.04,t.bronze,16),0,$+.08,0)),St(n,{half:.3,h:.12})}function x_(i){let{m:e}=i.kit,t=Bh(e.bronze,e.dark,.34);for(let n=0;n<12;n++){let r=n/12*Math.PI*2;t.add(k(new ae(new Jt(.028,.12,6),e.iron),Math.cos(r)*.22,$+.13,Math.sin(r)*.22))}return t.add(k(Ce(.1,.11,.04,e.bronze,16),0,$+.09,0)),St(t,{half:.34,h:.2})}function y_(i){let{m:e}=i.kit,t=new Me;t.add(k(Ce(.07,.08,.03,e.gold,18),0,$+.015,0));let n=St(t,{half:.4,h:.05}),r=new ae(new qt(.9,.9),e.wreath);return r.rotation.x=-Math.PI/2,r.position.y=$+.003,r.receiveShadow=!0,n.add(r),n}function v_(i){let{m:e}=i.kit,t=new Me;t.add(k(ze(.78,.04,.78,e.paleStone),0,$+.02,0));for(let n of[-1,1])t.add(k(ze(.9,.09,.07,e.darkWood),0,$+.045,n*.42)),t.add(k(ze(.07,.09,.9,e.darkWood),n*.42,$+.045,0));return St(t,{half:.45,h:.1})}function M_(i){let{m:e}=i.kit,t=new Me;t.add(k(Ce(.36,.38,.06,e.bronze,32),0,$+.03,0));let n=St(t,{half:.36,h:.1}),r=k(Ce(.3,.3,.02,e.swirl,32),0,$+.065,0);return r.receiveShadow=!0,n.add(r),n.userData.loop=s=>{r.rotation.y=-s*1.6},n}function b_(i){let{m:e}=i.kit,t=new Me;t.add(k(Ce(.36,.38,.06,e.gold,32),0,$+.03,0));let n=k(Ce(.3,.3,.02,e.hand,32),0,$+.065,0);return n.rotation.y=Math.PI,t.add(n),St(t,{half:.36,h:.1})}function S_(i){let{m:e}=i.kit,t=new Me,n=[[0,0],[.12,0],[.2,.08],[.22,.2],[.18,.32],[.08,.4],[.07,.46],[.09,.48],[0,.48]].map(([a,l])=>new J(a,l));t.add(k(new ae(new Vs(n,24),e.clay),0,$,0)),t.add(vi(k(new ae(new Vt(.205,.012,6,28),e.dark),0,$+.22,0)));let r=k(Ce(.012,.012,.12,e.dark,6),.02,$+.53,0);r.rotation.z=-.3,t.add(r);let s=k(new ae(new Jt(.035,.1,8),ar(16760928)),.04,$+.62,0),o=St(t,{half:.22,h:.6},[s]);return o.userData.loop=a=>s.scale.set(1,1+.2*Math.sin(a*9),1),o}function to(i,e){let{m:t}=i.kit,n=new Me;n.add(k(new ae(new xn(.86,.36,.86,2,.03),t.darkWood),0,$+.18,0)),n.add(k(ze(.64,.02,.64,t.dark),0,$+.365,0));for(let a of[-1,1])for(let l of[-1,1])n.add(k(Ce(.03,.03,.02,t.gold,10),a*.37,$+.365,l*.37));let r=new $t;r.moveTo(0,.24),r.lineTo(.17,.04),r.lineTo(.07,.04),r.lineTo(.07,-.22),r.lineTo(-.07,-.22),r.lineTo(-.07,.04),r.lineTo(-.17,.04),r.closePath();let s=new ae(new _i(r,{depth:.025,bevelEnabled:!1}),t.gold);s.rotation.x=-Math.PI/2,s.position.y=$+.37;let o=new Me;return o.add(s),o.rotation.y=e,n.add(o),St(n,{half:.43,h:.4})}function w_(i){let e=new Me,t=Ct(i.r*31+i.c),n=[];for(let s=0;s<5;s++){let o=.3+t()*.28,a=k(new ae(new Jt(.08+t()*.05,o,7),ar(s%2?16738848:16756816,.8)),(t()-.5)*.55,$+o/2,(t()-.5)*.55);n.push(a),e.add(a)}let r=t()*6.28;return e.userData={half:.4,h:.5,loop:s=>n.forEach((o,a)=>o.scale.set(1,1+.12*Math.sin(s*(6+a)+r+a),1))},e}var zh={floor:yn,wall:yn,water:yn,ice:yn,dirt:yn,gravel:yn,"force-up":yn,"force-down":yn,"force-left":yn,"force-right":yn,exit:g_,fire:w_,"gate-closed":i=>Uh(i,!1),"gate-open":i=>Uh(i,!0),safe:y_,button:__,trap:x_,popup:v_,teleport:M_,thief:b_,bomb:S_,"toggle-open":i=>Nh(i,!1),"toggle-closed":i=>Nh(i,!0),"door-red":i=>ei(i,"red",!1),"door-blue":i=>ei(i,"blue",!1),"door-yellow":i=>ei(i,"yellow",!1),"door-green":i=>ei(i,"green",!1),"door-red-sill":i=>ei(i,"red",!0),"door-blue-sill":i=>ei(i,"blue",!0),"door-yellow-sill":i=>ei(i,"yellow",!0),"door-green-sill":i=>ei(i,"green",!0),"button-brown":i=>Oh(i,i.kit.m.brownButton),"button-red":i=>Oh(i,i.kit.m.redButton),"clone-up":i=>to(i,0),"clone-left":i=>to(i,Math.PI/2),"clone-down":i=>to(i,Math.PI),"clone-right":i=>to(i,-Math.PI/2)};var Wt=(i,e,t=16,n=12)=>new ae(new Un(i,t,n),e);function Vh(i,e,t){let n=new $t;n.moveTo(i[0][0],i[0][1]);for(let[s,o]of i.slice(1))n.lineTo(s,o);n.closePath();let r=new _i(n,{depth:e,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-e/2),new ae(r,t)}function kr(i,e,t,n,r=0,s=[]){let o=t.h*n;e.position.y-=$;let a=new Me;a.position.set(0,$,o/2*Math.sin(r)),a.rotation.x=-r,a.scale.setScalar(n),a.add(e);let l=new Me;return l.add(a),no(i,St(l,{...t,half:Math.max(t.half*n,o/2*Math.sin(r)),h:o*Math.cos(r),back:o*Math.sin(r)/2},s))}var tl=.45,E_=.035;function Hh(i,e){return i.rotation.x=-Math.PI/2,i.position.y=$+e,i.userData.live=!0,i}var ro=(i,e=.42)=>Hh(new ae(new mi(e,32),i.m.itemShade),.006);function vn(i,e,t,n,r=0){let s=Qn().items==="plate",o=[ro(i,s?tl:.42)];return s&&o.push(Hh(new ae(new tr(tl-E_,tl,48),i.m.itemRing),.008)),kr(i,e,t,s?n*1.12:n,r,o)}function T_(i){let{m:e}=i,t=new Me;t.add(k(Ce(.11,.13,.04,e.bronze,18),0,$+.02,0)),t.add(k(Ce(.02,.022,.66,e.darkWood,8),0,$+.35,0)),t.add(k(Wt(.03,e.gold,10,8),0,$+.7,0));for(let n of[-1,1]){let r=Vh([[.02,.05],[.12,.08],[.21,.17],[.16,0],[.21,-.17],[.12,-.08],[.02,-.05]].map(([s,o])=>[n*s,o]),.03,e.gold);t.add(k(r,0,$+.5,0))}return t.add(k(Ce(.035,.035,.12,e.gold,10),0,$+.5,0)),vn(i,t,{half:.22,h:.72},1.2,.85)}function io(i,e){let{m:t}=i,n=new Me;n.add(k(new ae(new Vt(.075,.03,10,20),t.keyColor[e]),0,.2,0)),n.add(vi(k(Ce(.05,.05,.034,t.keyColor[e],16),0,.2,0))),n.add(k(ze(.035,.24,.03,t.bronze),0,0,0)),n.add(k(ze(.07,.03,.03,t.bronze),.035,-.08,0)),n.add(k(ze(.05,.03,.03,t.bronze),.025,-.03,0)),n.position.y=$+.2,n.rotation.z=.25;let r=new Me;return r.add(n),vn(i,r,{half:.12,h:.42},2.05,1.1)}function A_(i){let{m:e}=i,t=new Me,n=new $t;n.moveTo(0,0),n.bezierCurveTo(.08,.02,.1,.2,.07,.32),n.lineTo(-.07,.32),n.bezierCurveTo(-.1,.2,-.08,.02,0,0);let r=new _i(n,{depth:.025,bevelEnabled:!1});for(let s of[-1,1]){let o=new ae(r,e.teal);o.rotation.x=-Math.PI/2+.35,o.rotation.z=s*.2,o.position.set(s*.1,$+.03,.14),t.add(o),t.add(k(ze(.1,.07,.1,e.teal),s*.1,$+.06,.14))}return vn(i,t,{half:.24,h:.2},1.8)}function nl(i,e,t,n){let r=new Me;for(let s of[-1,1]){let o=new Me,a=n?.(o)??0;o.add(k(ze(.09,.2,.09,e),0,a+.12,0)),o.add(k(ze(.09,.06,.17,e),0,a+.03,.04)),o.add(k(ze(.1,.045,.1,t),0,a+.225,0)),o.position.set(s*.09,$,0),o.rotation.y=s*.2,r.add(o)}return r}function R_(i){let{m:e}=i,t=nl(i,e.boot,e.bootTrim,n=>(n.add(k(new ae(new Jt(.025,.07,6),e.gold),0,.11,.05)),0));return vn(i,t,{half:.2,h:.28},1.9,.7)}function C_(i){let{m:e}=i,t=nl(i,e.skate,e.cream,n=>{n.add(k(ze(.02,.05,.24,e.steel),0,.025,.04));for(let r of[-.04,.12])n.add(k(ze(.03,.03,.03,e.steel),0,.05,r));return .05});return vn(i,t,{half:.2,h:.32},1.8,.7)}function P_(i){let{m:e}=i,t=nl(i,e.suction,e.bootTrim,n=>(n.add(k(Ce(.1,.07,.035,e.bronze,18),0,.018,.03)),.035));return vn(i,t,{half:.22,h:.3},1.8,.7)}function I_(i){let{m:e}=i,t=new Me,n=new Me;n.position.set(0,$+.32,0),n.rotation.x=-.25,n.add(vi(Ce(.13,.13,.02,e.mirror,28))),n.add(new ae(new Vt(.13,.02,8,28),e.bronze));let r=k(Wt(.045,e.gorgon,12,10),0,0,.012);r.scale.z=.5,n.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;n.add(k(Wt(.014,e.gorgon,6,5),Math.cos(o)*.08,Math.sin(o)*.08,.012))}return t.add(n),t.add(k(Ce(.018,.025,.2,e.bronze,8),0,$+.1,0)),t.add(k(Ce(.08,.09,.025,e.bronze),0,$+.012,0)),vn(i,t,{half:.18,h:.48},1.55,.9)}function L_(i){let{m:e}=i,t=new Me;t.add(k(Ce(.24,.22,.03,e.bronze,24),0,$+.015,0)),t.add(k(Ce(.17,.19,.16,e.cake,24),0,$+.11,0)),t.add(k(Ce(.165,.17,.02,e.cream,24),0,$+.2,0));for(let n=0;n<8;n++){let r=n/8*Math.PI*2;t.add(k(Wt(.022,e.cream,8,6),Math.cos(r)*.12,$+.215,Math.sin(r)*.12))}return t.add(k(Wt(.035,e.cake,10,8),0,$+.22,0)),vn(i,t,{half:.24,h:.26},1.4,.35)}function kh(i,e,t=0,n=!1){let{m:r}=i,s=new Me;s.add(k(ze(.56,.05,.3,r.wood),0,.1,0));for(let l of[-1,1])for(let c of[-1,1])s.add(vi(k(Ce(.07,.07,.03,r.darkWood,14),l*.2,.07,c*.165))),s.add(k(Ce(.028,.025,.14,r.hide,8),l*.16,.18,c*.08));s.add(k(new ae(new xn(.46,.22,.24,2,.05),r.hide),0,.34,0));for(let[l,c,h,u]of[[-.1,0,.3,1],[.1,.05,.3,1],[-.04,.12,1,.3],[.12,-.12,1,.3],[-.14,-.12,1,.3]]){let d=k(Wt(.075,r.patch,10,8),l,u===1?.44:.35,c);d.scale.set(1,h,u),s.add(d)}s.add(k(new ae(new xn(.14,.15,.15,2,.03),r.hide),.29,.43,0)),s.add(k(ze(.06,.08,.12,r.snout),.37,.4,0));for(let l of[-1,1]){let c=k(new ae(new Jt(.02,.08,6),r.ivory),.28,.53,l*.06);c.rotation.x=l*.5,s.add(c)}let o=k(Ce(.012,.012,.16,r.patch,6),-.25,.36,0);o.rotation.z=-.4,s.add(o),s.position.y=$,s.rotation.y=.5;let a=new Me;return a.add(s),(n?vn:kr)(i,a,{half:.32,h:.56},e,t)}function D_(i){let{m:e}=i,t=new Me;t.add(k(ze(.26,.008,.14,e.parchment),.02,$+.006,.08));let n=k(Ce(.06,.06,.34,e.parchment,14),0,$+.06,-.02);n.rotation.z=Math.PI/2,t.add(n);for(let s of[-1,1]){let o=k(Ce(.035,.035,.012,e.darkWood,10),s*.172,$+.06,-.02);o.rotation.z=Math.PI/2,t.add(o)}let r=k(Ce(.064,.064,.05,e.cloak,14),-.08,$+.06,-.02);return r.rotation.z=Math.PI/2,t.add(r),t.rotation.y=.3,vn(i,t,{half:.2,h:.14},1.9,.5)}function U_(i){let e=new Me;return e.add(k(new ae(new xn(.84,.8,.84,3,.05),i.m.block),0,$+.4,0)),St(e,{half:.42,h:.9})}function N_(i){let{m:e}=i,t=new Me,n=$+.22;t.add(k(Wt(.22,e.bronze,24,16),0,n,0));let r=k(new ae(new Vt(.222,.012,6,32),e.gold),0,n,0);r.rotation.y=Math.PI/2,t.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;t.add(k(Wt(.022,e.gold,6,5),Math.cos(o)*.222,n,Math.sin(o)*.222)),s%2===0&&t.add(k(Wt(.02,e.gold,6,5),0,n+Math.cos(o+.3)*.224,Math.sin(o+.3)*.224))}return kr(i,t,{half:.24,h:.46},1.45,0,[ro(i)])}function O_(i){let{m:e}=i,t=new Me,n=$+.4,r=k(Wt(.12,e.feather,16,12),0,n,-.02);r.scale.set(.9,1.15,.85),t.add(r),t.add(k(Wt(.075,e.skin,14,10),0,n+.17,.03));let s=k(Wt(.082,e.furDark,14,8),0,n+.19,.01);s.scale.set(1,.8,1),t.add(s);for(let a of[-1,1]){t.add(k(Wt(.012,e.dark,6,5),a*.028,n+.18,.1));let l=Vh([[.06,.08],[.24,.16],[.4,.14],[.38,.06],[.33,.08],[.33,-.01],[.26,.02],[.24,-.08],[.17,-.03],[.12,-.1],[.06,-.04]].map(([c,h])=>[a*c,h]),.025,e.feather);l.position.set(0,n+.04,-.04),l.rotation.x=-.9,t.add(l),t.add(k(Ce(.014,.012,.16,e.bootTrim,6),a*.04,n-.18,.02))}let o=k(new ae(new Jt(.06,.16,6),e.feather),0,n-.1,-.12);return o.rotation.x=-2.4,t.add(o),kr(i,t,{half:.36,h:.66},1.05,0,[ro(i)])}var Gh=1.35;function F_(i){let e=new Me;e.add(k(Wt(.13,i.m.bootTrim,12,8),0,$+.14,0));let t=[],n=k(Wt(.16,ar(13647888,.5),16,12),0,$+.17,0);t.push(n);for(let o=0;o<7;o++){let a=o/7*Math.PI*2,l=.24+o%3*.06,c=k(new ae(new Jt(.08,l,7),ar(o%2?13122060:14182424,.7)),Math.cos(a)*.12,$+l/2+.04,Math.sin(a)*.12);c.rotation.z=-Math.cos(a)*.3,c.rotation.x=Math.sin(a)*.3,t.push(c)}let r=new Me;for(let o of t)o.position.y-=$;r.add(...t),r.position.y=$,r.scale.setScalar(Gh),r.userData.live=!0;let s=kr(i,e,{half:.26,h:.5},Gh,0,[r,ro(i)]);return s.userData.loop=o=>t.forEach((a,l)=>a.scale.set(1,1+.15*Math.sin(o*(7+l)+l*1.7),1)),s}var so={relic:T_,"key-red":i=>io(i,"red"),"key-blue":i=>io(i,"blue"),"key-yellow":i=>io(i,"yellow"),"key-green":i=>io(i,"green"),flippers:A_,"fire-boots":R_,skates:C_,suction:P_,mirror:I_,cake:L_,cow:i=>kh(i,1.1,.35,!0),"cow-standing":i=>kh(i,1.1),page:D_,block:U_,ball:N_,glider:O_,fireball:F_};var iy=new Set(Object.values(eo).map(i=>i.sprite)),ry=new Set(Object.values(Nr).map(i=>i.sprite).filter(i=>i!==Nr.block.sprite));var On=(i,e,t=16,n=12)=>new ae(new Un(i,t,n),e);function Xh(i,e,t,n=1.3,r=[]){e.scale.setScalar(n),e.position.y=$;let s=new Me;return s.add(e),no(i,St(s,t,r))}function B_(i,e,t){let n=[];for(let s of e.children){if(!(s instanceof ae)||s.userData.live||s.material===i.m.outline)continue;let o=s.material;o.stencilWrite=!0,o.stencilRef=1,o.stencilZPass=th;let a=new ae(s.geometry,i.m.heroXray);a.renderOrder=20,a.userData.live=!0,n.push(a)}let r=new ae(new jn(.16,.24,2.2,24,1,!0),i.m.heroBeam);r.position.y=$+t+.25+1.1,r.renderOrder=21,r.userData.live=!0,e.add(...n,r)}var il=1.45;function z_(i){let{m:e}=i,t=new Me;for(let h of[-1,1])t.add(k(Ce(.045,.04,.28,e.heroSkin),h*.065,.14,0)),t.add(k(ze(.07,.05,.12,e.heroLeather),h*.065,.025,.02));t.add(k(Ce(.13,.2,.22,e.heroTunic),0,.35,0)),t.add(k(Ce(.155,.13,.22,e.heroTunic),0,.55,0)),t.add(k(Ce(.16,.16,.035,e.heroLeather),0,.45,0));let n=k(ze(.3,.44,.03,e.heroCloak),0,.44,-.14);n.rotation.x=.12,t.add(n);for(let h of[-1,1]){let u=k(Ce(.04,.035,.26,e.heroSkin),h*.19,.5,.02);u.rotation.z=h*.18,t.add(u)}t.add(k(On(.095,e.heroSkin),0,.75,0)),t.add(k(new ae(new Un(.103,18,10,0,Math.PI*2,0,Math.PI/2),e.heroHair),0,.765,-.012));let r=k(Ce(.15,.15,.03,e.bronze,24),-.26,.5,.04);r.rotation.z=Math.PI/2,t.add(r);let s=k(Ce(.06,.06,.035,e.heroCloak,16),-.275,.5,.04);s.rotation.z=Math.PI/2,t.add(s);let o=k(ze(.03,.34,.012,e.steel),.23,.5,.1);o.rotation.x=.5,t.add(o),t.add(k(ze(.09,.02,.03,e.bronze),.23,.37,.03));let a=(h,u,d,p)=>{let g=new ae(new tr(h,u,48),d);return g.rotation.x=-Math.PI/2,g.position.y=$+p,g.userData.live=!0,g},l=[a(.33,.47,e.heroRingEdge,.01),a(.36,.44,e.heroRing,.012)],c=Xh(i,t,{half:.26*il/1.3,h:1.2*il/1.3},il,l);return Qn().beacon&&B_(i,c,c.userData.h),c}var rl=1.08,k_=.24;function Wh(i,e){let{m:t}=i,n=_=>e?t.statue:_,r=n(t.fur),s=e?t.statueDark:t.furDark,o=new Me;for(let _ of[-1,1]){let m=_*-.05;o.add(k(Ce(.06,.068,.05,n(t.hoof)),_*.13,.025,m+.01));let f=k(Ce(.05,.06,.26,r),_*.125,.18,m);f.rotation.z=_*.04,o.add(f);let y=k(Ce(.09,.062,.26,r),_*.11,.42,m*.6);y.rotation.z=-_*.1,o.add(y)}o.add(k(Ce(.15,.2,.14,n(t.kilt)),0,.54,0));let a=k(new ae(new Vt(.155,.02,8,24),n(t.gold)),0,.605,0);a.rotation.x=Math.PI/2,o.add(a);let l=k(new Me,0,.6,0);l.rotation.x=k_,o.add(l),l.add(k(Ce(.21,.15,.2,r),0,.09,0));let c=k(On(.25,r),0,.29,.01);c.scale.set(1.42,.85,.92),l.add(c);let h=k(On(.17,s),0,.42,-.06);h.scale.set(1.5,.66,1),l.add(h);for(let _ of[-1,1]){l.add(k(On(.12,r),_*.29,.39,0));let m=k(Ce(.088,.072,.26,r),_*.325,.24,.01);m.rotation.z=_*.1,l.add(m);let f=k(Ce(.074,.06,.24,r),_*.335,.04,.07);f.rotation.x=-.45,l.add(f),l.add(k(On(.072,s),_*.33,-.08,.13)),l.add(k(Ce(.076,.076,.035,n(t.gold)),_*.33,.14,.03))}let u=k(new Me,0,.45,.13);u.rotation.x=.3,l.add(u);let d=On(.125,s);d.scale.set(1.05,.95,1.15),u.add(d);let p=k(On(.085,n(t.snout)),0,-.05,.12);p.scale.set(1.1,.8,.95),u.add(p),u.add(k(new ae(new Vt(.035,.008,6,16),n(t.gold)),0,-.1,.19));for(let _ of[-1,1]){u.add(k(On(.02,e?t.statueDark:t.eye,8,6),_*.065,.03,.115));let m=k(On(.04,s),_*.14,.02,-.03);m.scale.set(1.3,.6,.8),u.add(m);let f=new Ar([new R(_*.08,.06,0),new R(_*.24,.07,-.03),new R(_*.37,.15,.01),new R(_*.42,.3,.1)]);u.add(new ae(new Ws(f,20,.036,8),n(t.ivory)));let y=k(new ae(new Jt(.036,.11,8),n(t.ivory)),_*.425,.36,.125);y.rotation.x=.35,y.rotation.z=-_*.15,u.add(y)}let g=new Me;g.add(Ce(.02,.02,1,n(t.iron),8));for(let _ of[-1,1]){let m=new ae(new jn(.17,.17,.022,24,1,!1,0,Math.PI),n(t.steel));m.rotation.z=Math.PI/2,m.rotation.y=_>0?0:Math.PI,m.position.set(0,.36,0),m.scale.set(1,1,.8),g.add(m)}return g.rotation.set(-.12,Math.PI/2,0),g.position.set(.33,.1,.13),l.add(g),Xh(i,o,{half:.42*rl/1.3,h:1.6*rl/1.3},rl)}var sl={theseus:z_,minotaur:i=>Wh(i,!1),"minotaur-stone":i=>Wh(i,!0)},my={...so,...sl},gy=new Set([...vh,"ball","glider","fireball"]),_y={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2};var bi=128,ao=8,ol=50*(Math.PI/180),qh=-20*(Math.PI/180),G_=.96,Zh=Object.keys(qa),V_=Math.ceil(Zh.length/ao),Mi=document.createElement("canvas");Mi.width=bi*ao;Mi.height=bi*V_;var H_=Mi.getContext("2d"),Kh=document.createElement("canvas"),Si=new wr({canvas:Kh,antialias:!0,alpha:!0,preserveDrawingBuffer:!0});Si.setPixelRatio(1);Si.setSize(bi,bi,!1);Si.setClearColor(0,0);Si.toneMapping=za;Si.toneMappingExposure=1.4;var oo=gh(Si);function Yh(i){let e=bh(oo);return e.set([i],1,1),e.group.children[0].visible=!1,e.group}function W_(i){let e=qa[i],t=new Me;if(e.kind==="wall"){let s=Ah(oo);return s.build(["wall"],1,1),s.setMode("solid"),t.add(s.group),{obj:t,focus:null}}if(e.kind==="tile"){t.add(Yh(e.model));let s=zh[e.model]({kit:oo,r:0,c:0,wall:()=>!1});return s.userData.loop?.(.4),t.add(s),{obj:t,focus:null}}t.add(Yh("floor"));let r=(so[e.model]??sl[e.model])(oo);return r.userData.loop?.(.4),t.add(r),{obj:t,focus:r}}var Jh={};Zh.forEach((i,e)=>{let t=new Qi;t.add(new Xs(10131616,2761760,2.4));let n=new Zs(16773340,2.4);n.position.set(-3,7,5),t.add(n);let{obj:r,focus:s}=W_(i);t.add(r);let o=new un().setFromObject(s??r);s&&(o.expandByVector(new R(.12,0,.12)),o.min.y=0),o.min.max(new R(-.5,-.2,-.5)),o.max.min(new R(.5,3,.5));let a=o.getBoundingSphere(new Ln),l=new Ut(26,1,.1,100),c=a.radius/Math.sin(26/2*(Math.PI/180)),h=new R(Math.sin(qh)*Math.cos(ol),Math.sin(ol),Math.cos(qh)*Math.cos(ol)),u=[0,1,2,3,4,5,6,7].map(g=>new R(g&1?o.max.x:o.min.x,g&2?o.max.y:o.min.y,g&4?o.max.z:o.min.z));for(let g=0;g<6;g++){l.position.copy(a.center).addScaledVector(h,c),l.lookAt(a.center),l.updateMatrixWorld();let _=Math.max(...u.map(m=>{let f=m.clone().project(l);return Math.max(Math.abs(f.x),Math.abs(f.y))}));c*=.35+.65*(_/G_)}Si.render(t,l);let d=e%ao*bi,p=Math.floor(e/ao)*bi;H_.drawImage(Kh,d,p),Jh[i]={x:d,y:p}});window.__icons={sheet:{cell:bi,width:Mi.width,height:Mi.height,icons:Jh},webp:Mi.toDataURL("image/webp",.9)};document.body.append(Mi);})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=icons-test.js.map
