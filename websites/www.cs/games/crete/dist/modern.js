/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
var Uu=0,Ml=1,Nu=2;var jc=1,nl=2,Pn=3,ei=0,Nt=1,Ln=2;var $n=0,ir=1,or=2,bl=3,Sl=4,Ou=5,pi=100,Fu=101,Bu=102,wl=103,El=104,zu=200,ku=201,Gu=202,Vu=203,da=204,fa=205,Hu=206,Wu=207,Xu=208,qu=209,Yu=210,Zu=211,Ju=212,$u=213,Ku=214,ju=0,Qu=1,ed=2,Us=3,td=4,nd=5,id=6,rd=7,Qc=0,sd=1,od=2,Kn=0,ad=1,ld=2,cd=3,hd=4,ud=5,dd=6;var eh=300,ar=301,lr=302,pa=303,ma=304,fo=306,cr=1e3,Ut=1001,ga=1002,Gt=1003,Tl=1004;var Ro=1005;var jt=1006,fd=1007;var Nr=1008;var jn=1009,pd=1010,md=1011,il=1012,th=1013,Zn=1014,Jn=1015,vi=1016,nh=1017,ih=1018,_i=1020,gd=1021,dn=1023,_d=1024,xd=1025,xi=1026,hr=1027,yd=1028,rh=1029,vd=1030,sh=1031,oh=1033,Po=33776,Io=33777,Lo=33778,Do=33779,Al=35840,Cl=35841,Rl=35842,Pl=35843,ah=36196,Il=37492,Ll=37496,Dl=37808,Ul=37809,Nl=37810,Ol=37811,Fl=37812,Bl=37813,zl=37814,kl=37815,Gl=37816,Vl=37817,Hl=37818,Wl=37819,Xl=37820,ql=37821,Uo=36492,Yl=36494,Zl=36495,Md=36283,Jl=36284,$l=36285,Kl=36286;var Ns=2300,Os=2301,No=2302,jl=2400,Ql=2401,ec=2402;var lh=3e3,yi=3001,bd=3200,Sd=3201,ch=0,wd=1,Qt="",yt="srgb",On="srgb-linear",rl="display-p3",po="display-p3-linear",Fs="linear",ht="srgb",Bs="rec709",zs="p3";var Di=7680;var tc=519,Ed=512,Td=513,Ad=514,hh=515,Cd=516,Rd=517,Pd=518,Id=519,_a=35044;var nc="300 es",xa=1035,Un=2e3,ks=2001,ti=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Lt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Oo=Math.PI/180,ya=180/Math.PI;function Nn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Lt[i&255]+Lt[i>>8&255]+Lt[i>>16&255]+Lt[i>>24&255]+"-"+Lt[e&255]+Lt[e>>8&255]+"-"+Lt[e>>16&15|64]+Lt[e>>24&255]+"-"+Lt[t&63|128]+Lt[t>>8&255]+"-"+Lt[t>>16&255]+Lt[t>>24&255]+Lt[n&255]+Lt[n>>8&255]+Lt[n>>16&255]+Lt[n>>24&255]).toLowerCase()}function Ct(i,e,t){return Math.max(e,Math.min(t,i))}function Ld(i,e){return(i%e+e)%e}function Fo(i,e,t){return(1-t)*i+t*e}function ic(i){return(i&i-1)===0&&i!==0}function va(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Dn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function lt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var j=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},et=class i{constructor(e,t,n,r,s,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=r,h[2]=a,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],x=r[0],p=r[3],m=r[6],y=r[1],_=r[4],S=r[7],E=r[2],v=r[5],T=r[8];return s[0]=o*x+a*y+l*E,s[3]=o*p+a*_+l*v,s[6]=o*m+a*S+l*T,s[1]=c*x+h*y+u*E,s[4]=c*p+h*_+u*v,s[7]=c*m+h*S+u*T,s[2]=d*x+f*y+g*E,s[5]=d*p+f*_+g*v,s[8]=d*m+f*S+g*T,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*s*h+n*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*s,f=c*s-o*l,g=t*u+n*d+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=u*x,e[1]=(r*c-h*n)*x,e[2]=(a*n-r*o)*x,e[3]=d*x,e[4]=(h*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=f*x,e[7]=(n*l-c*t)*x,e[8]=(o*t-n*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Bo.makeScale(e,t)),this}rotate(e){return this.premultiply(Bo.makeRotation(-e)),this}translate(e,t){return this.premultiply(Bo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Bo=new et;function uh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Gs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Dd(){let i=Gs("canvas");return i.style.display="block",i}var rc={};function Ir(i){i in rc||(rc[i]=!0,console.warn(i))}var sc=new et().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),oc=new et().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),rs={[On]:{transfer:Fs,primaries:Bs,toReference:i=>i,fromReference:i=>i},[yt]:{transfer:ht,primaries:Bs,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[po]:{transfer:Fs,primaries:zs,toReference:i=>i.applyMatrix3(oc),fromReference:i=>i.applyMatrix3(sc)},[rl]:{transfer:ht,primaries:zs,toReference:i=>i.convertSRGBToLinear().applyMatrix3(oc),fromReference:i=>i.applyMatrix3(sc).convertLinearToSRGB()}},Ud=new Set([On,po]),ot={enabled:!0,_workingColorSpace:On,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!Ud.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;let n=rs[e].toReference,r=rs[t].fromReference;return r(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return rs[i].primaries},getTransfer:function(i){return i===Qt?Fs:rs[i].transfer}};function rr(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function zo(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ui,Vs=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ui===void 0&&(Ui=Gs("canvas")),Ui.width=e.width,Ui.height=e.height;let n=Ui.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ui}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Gs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=rr(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(rr(t[n]/255)*255):t[n]=rr(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Nd=0,Hs=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Nd++}),this.uuid=Nn(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(ko(r[o].image)):s.push(ko(r[o]))}else s=ko(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function ko(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Vs.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Od=0,en=class i extends ti{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Ut,r=Ut,s=jt,o=Nr,a=dn,l=jn,c=i.DEFAULT_ANISOTROPY,h=Qt){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Od++}),this.uuid=Nn(),this.name="",this.source=new Hs(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new j(0,0),this.repeat=new j(1,1),this.center=new j(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new et,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(Ir("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===yi?yt:Qt),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==eh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case cr:e.x=e.x-Math.floor(e.x);break;case Ut:e.x=e.x<0?0:1;break;case ga:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case cr:e.y=e.y-Math.floor(e.y);break;case Ut:e.y=e.y<0?0:1;break;case ga:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Ir("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===yt?yi:lh}set encoding(e){Ir("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===yi?yt:Qt}};en.DEFAULT_IMAGE=null;en.DEFAULT_MAPPING=eh;en.DEFAULT_ANISOTROPY=1;var dt=class i{constructor(e=0,t=0,n=0,r=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],x=l[2],p=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let _=(c+1)/2,S=(f+1)/2,E=(m+1)/2,v=(h+d)/4,T=(u+x)/4,U=(g+p)/4;return _>S&&_>E?_<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(_),r=v/n,s=T/n):S>E?S<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(S),n=v/r,s=U/r):E<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(E),n=T/s,r=U/s),this.set(n,r,s,t),this}let y=Math.sqrt((p-g)*(p-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(u-x)/y,this.z=(d-h)/y,this.w=Math.acos((c+f+m-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ma=class extends ti{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t);let r={width:e,height:t,depth:1};n.encoding!==void 0&&(Ir("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===yi?yt:Qt),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:jt,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new en(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new Hs(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},tn=class extends Ma{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ws=class extends en{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=Ut,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ba=class extends en{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=Ut,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ni=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],h=n[r+2],u=n[r+3],d=s[o+0],f=s[o+1],g=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=x;return}if(u!==x||l!==d||c!==f||h!==g){let p=1-a,m=l*d+c*f+h*g+u*x,y=m>=0?1:-1,_=1-m*m;if(_>Number.EPSILON){let E=Math.sqrt(_),v=Math.atan2(E,m*y);p=Math.sin(p*v)/E,a=Math.sin(a*v)/E}let S=a*y;if(l=l*p+d*S,c=c*p+f*S,h=h*p+g*S,u=u*p+x*S,p===1-a){let E=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=E,c*=E,h*=E,u*=E}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,s,o){let a=n[r],l=n[r+1],c=n[r+2],h=n[r+3],u=s[o],d=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+h*u+l*f-c*d,e[t+1]=l*g+h*d+c*u-a*f,e[t+2]=c*g+h*f+a*d-l*u,e[t+3]=h*g-a*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(r/2),u=a(s/2),d=l(n/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ct(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+r*c-s*l,this._y=r*h+o*l+s*a-n*c,this._z=s*h+o*c+n*l-r*a,this._w=o*h-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=r*u+this._y*d,this._z=s*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(r),n*Math.sin(s),n*Math.cos(s),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ac.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ac.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),h=2*(a*t-s*r),u=2*(s*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-s*u,this.z=r+l*u+s*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Go.copy(this).projectOnVector(e),this.sub(Go)}reflect(e){return this.sub(Go.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ct(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Go=new P,ac=new ni,Fn=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(cn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(cn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=cn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,cn):cn.fromBufferAttribute(s,o),cn.applyMatrix4(e.matrixWorld),this.expandByPoint(cn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ss.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ss.copy(n.boundingBox)),ss.applyMatrix4(e.matrixWorld),this.union(ss)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,cn),cn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Mr),os.subVectors(this.max,Mr),Ni.subVectors(e.a,Mr),Oi.subVectors(e.b,Mr),Fi.subVectors(e.c,Mr),Hn.subVectors(Oi,Ni),Wn.subVectors(Fi,Oi),ci.subVectors(Ni,Fi);let t=[0,-Hn.z,Hn.y,0,-Wn.z,Wn.y,0,-ci.z,ci.y,Hn.z,0,-Hn.x,Wn.z,0,-Wn.x,ci.z,0,-ci.x,-Hn.y,Hn.x,0,-Wn.y,Wn.x,0,-ci.y,ci.x,0];return!Vo(t,Ni,Oi,Fi,os)||(t=[1,0,0,0,1,0,0,0,1],!Vo(t,Ni,Oi,Fi,os))?!1:(as.crossVectors(Hn,Wn),t=[as.x,as.y,as.z],Vo(t,Ni,Oi,Fi,os))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,cn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(cn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(En[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),En[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),En[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),En[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),En[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),En[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),En[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),En[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(En),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},En=[new P,new P,new P,new P,new P,new P,new P,new P],cn=new P,ss=new Fn,Ni=new P,Oi=new P,Fi=new P,Hn=new P,Wn=new P,ci=new P,Mr=new P,os=new P,as=new P,hi=new P;function Vo(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){hi.fromArray(i,s);let a=r.x*Math.abs(hi.x)+r.y*Math.abs(hi.y)+r.z*Math.abs(hi.z),l=e.dot(hi),c=t.dot(hi),h=n.dot(hi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Fd=new Fn,br=new P,Ho=new P,Mi=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Fd.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;br.subVectors(e,this.center);let t=br.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(br,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ho.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(br.copy(e.center).add(Ho)),this.expandByPoint(br.copy(e.center).sub(Ho))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Tn=new P,Wo=new P,ls=new P,Xn=new P,Xo=new P,cs=new P,qo=new P,Sa=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Tn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Tn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Tn.copy(this.origin).addScaledVector(this.direction,t),Tn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Wo.copy(e).add(t).multiplyScalar(.5),ls.copy(t).sub(e).normalize(),Xn.copy(this.origin).sub(Wo);let s=e.distanceTo(t)*.5,o=-this.direction.dot(ls),a=Xn.dot(this.direction),l=-Xn.dot(ls),c=Xn.lengthSq(),h=Math.abs(1-o*o),u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=s*h,u>=0)if(d>=-g)if(d<=g){let x=1/h;u*=x,d*=x,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*s+a)),d=u>0?-s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(u=Math.max(0,-(o*s+a)),d=u>0?s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c);else d=o>0?-s:s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Wo).addScaledVector(ls,d),f}intersectSphere(e,t){Tn.subVectors(e.center,this.origin);let n=Tn.dot(this.direction),r=Tn.dot(Tn)-n*n,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),h>=0?(s=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(s=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Tn)!==null}intersectTriangle(e,t,n,r,s){Xo.subVectors(t,e),cs.subVectors(n,e),qo.crossVectors(Xo,cs);let o=this.direction.dot(qo),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Xn.subVectors(this.origin,e);let l=a*this.direction.dot(cs.crossVectors(Xn,cs));if(l<0)return null;let c=a*this.direction.dot(Xo.cross(Xn));if(c<0||l+c>o)return null;let h=-a*Xn.dot(qo);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ct=class i{constructor(e,t,n,r,s,o,a,l,c,h,u,d,f,g,x,p){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,h,u,d,f,g,x,p)}set(e,t,n,r,s,o,a,l,c,h,u,d,f,g,x,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=r,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=g,m[11]=x,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Bi.setFromMatrixColumn(e,0).length(),s=1/Bi.setFromMatrixColumn(e,1).length(),o=1/Bi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){let d=o*h,f=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=d-x*c,t[9]=-a*l,t[2]=x-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*h,f=l*u,g=c*h,x=c*u;t[0]=d+x*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=x+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*h,f=l*u,g=c*h,x=c*u;t[0]=d-x*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=x-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*h,f=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=d*c+x,t[1]=l*u,t[5]=x*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=x-d*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=d-x*u}else if(e.order==="XZY"){let d=o*l,f=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+x,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=x*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Bd,e,zd)}lookAt(e,t,n){let r=this.elements;return Yt.subVectors(e,t),Yt.lengthSq()===0&&(Yt.z=1),Yt.normalize(),qn.crossVectors(n,Yt),qn.lengthSq()===0&&(Math.abs(n.z)===1?Yt.x+=1e-4:Yt.z+=1e-4,Yt.normalize(),qn.crossVectors(n,Yt)),qn.normalize(),hs.crossVectors(Yt,qn),r[0]=qn.x,r[4]=hs.x,r[8]=Yt.x,r[1]=qn.y,r[5]=hs.y,r[9]=Yt.y,r[2]=qn.z,r[6]=hs.z,r[10]=Yt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],x=n[6],p=n[10],m=n[14],y=n[3],_=n[7],S=n[11],E=n[15],v=r[0],T=r[4],U=r[8],M=r[12],w=r[1],I=r[5],N=r[9],q=r[13],D=r[2],O=r[6],k=r[10],K=r[14],$=r[3],Y=r[7],ne=r[11],Q=r[15];return s[0]=o*v+a*w+l*D+c*$,s[4]=o*T+a*I+l*O+c*Y,s[8]=o*U+a*N+l*k+c*ne,s[12]=o*M+a*q+l*K+c*Q,s[1]=h*v+u*w+d*D+f*$,s[5]=h*T+u*I+d*O+f*Y,s[9]=h*U+u*N+d*k+f*ne,s[13]=h*M+u*q+d*K+f*Q,s[2]=g*v+x*w+p*D+m*$,s[6]=g*T+x*I+p*O+m*Y,s[10]=g*U+x*N+p*k+m*ne,s[14]=g*M+x*q+p*K+m*Q,s[3]=y*v+_*w+S*D+E*$,s[7]=y*T+_*I+S*O+E*Y,s[11]=y*U+_*N+S*k+E*ne,s[15]=y*M+_*q+S*K+E*Q,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],g=e[3],x=e[7],p=e[11],m=e[15];return g*(+s*l*u-r*c*u-s*a*d+n*c*d+r*a*f-n*l*f)+x*(+t*l*f-t*c*d+s*o*d-r*o*f+r*c*h-s*l*h)+p*(+t*c*u-t*a*f-s*o*u+n*o*f+s*a*h-n*c*h)+m*(-r*a*h-t*l*u+t*a*d+r*o*u-n*o*d+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],g=e[12],x=e[13],p=e[14],m=e[15],y=u*p*c-x*d*c+x*l*f-a*p*f-u*l*m+a*d*m,_=g*d*c-h*p*c-g*l*f+o*p*f+h*l*m-o*d*m,S=h*x*c-g*u*c+g*a*f-o*x*f-h*a*m+o*u*m,E=g*u*l-h*x*l-g*a*d+o*x*d+h*a*p-o*u*p,v=t*y+n*_+r*S+s*E;if(v===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let T=1/v;return e[0]=y*T,e[1]=(x*d*s-u*p*s-x*r*f+n*p*f+u*r*m-n*d*m)*T,e[2]=(a*p*s-x*l*s+x*r*c-n*p*c-a*r*m+n*l*m)*T,e[3]=(u*l*s-a*d*s-u*r*c+n*d*c+a*r*f-n*l*f)*T,e[4]=_*T,e[5]=(h*p*s-g*d*s+g*r*f-t*p*f-h*r*m+t*d*m)*T,e[6]=(g*l*s-o*p*s-g*r*c+t*p*c+o*r*m-t*l*m)*T,e[7]=(o*d*s-h*l*s+h*r*c-t*d*c-o*r*f+t*l*f)*T,e[8]=S*T,e[9]=(g*u*s-h*x*s-g*n*f+t*x*f+h*n*m-t*u*m)*T,e[10]=(o*x*s-g*a*s+g*n*c-t*x*c-o*n*m+t*a*m)*T,e[11]=(h*a*s-o*u*s-h*n*c+t*u*c+o*n*f-t*a*f)*T,e[12]=E*T,e[13]=(h*x*r-g*u*r+g*n*d-t*x*d-h*n*p+t*u*p)*T,e[14]=(g*a*r-o*x*r-g*n*l+t*x*l+o*n*p-t*a*p)*T,e[15]=(o*u*r-h*a*r+h*n*l-t*u*l-o*n*d+t*a*d)*T,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,h=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,h*a+n,h*l-r*o,0,c*l-r*a,h*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,h=o+o,u=a+a,d=s*c,f=s*h,g=s*u,x=o*h,p=o*u,m=a*u,y=l*c,_=l*h,S=l*u,E=n.x,v=n.y,T=n.z;return r[0]=(1-(x+m))*E,r[1]=(f+S)*E,r[2]=(g-_)*E,r[3]=0,r[4]=(f-S)*v,r[5]=(1-(d+m))*v,r[6]=(p+y)*v,r[7]=0,r[8]=(g+_)*T,r[9]=(p-y)*T,r[10]=(1-(d+x))*T,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,s=Bi.set(r[0],r[1],r[2]).length(),o=Bi.set(r[4],r[5],r[6]).length(),a=Bi.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],hn.copy(this);let c=1/s,h=1/o,u=1/a;return hn.elements[0]*=c,hn.elements[1]*=c,hn.elements[2]*=c,hn.elements[4]*=h,hn.elements[5]*=h,hn.elements[6]*=h,hn.elements[8]*=u,hn.elements[9]*=u,hn.elements[10]*=u,t.setFromRotationMatrix(hn),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=Un){let l=this.elements,c=2*s/(t-e),h=2*s/(n-r),u=(t+e)/(t-e),d=(n+r)/(n-r),f,g;if(a===Un)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===ks)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=Un){let l=this.elements,c=1/(t-e),h=1/(n-r),u=1/(o-s),d=(t+e)*c,f=(n+r)*h,g,x;if(a===Un)g=(o+s)*u,x=-2*u;else if(a===ks)g=s*u,x=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Bi=new P,hn=new ct,Bd=new P(0,0,0),zd=new P(1,1,1),qn=new P,hs=new P,Yt=new P,lc=new ct,cc=new ni,Xs=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],h=r[9],u=r[2],d=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(Ct(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ct(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ct(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ct(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ct(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ct(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return lc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(lc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return cc.setFromEuler(this),this.setFromQuaternion(cc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Xs.DEFAULT_ORDER="XYZ";var qs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},kd=0,hc=new P,zi=new ni,An=new ct,us=new P,Sr=new P,Gd=new P,Vd=new ni,uc=new P(1,0,0),dc=new P(0,1,0),fc=new P(0,0,1),Hd={type:"added"},Wd={type:"removed"},Ft=class i extends ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=Nn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new P,t=new Xs,n=new ni,r=new P(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ct},normalMatrix:{value:new et}}),this.matrix=new ct,this.matrixWorld=new ct,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return zi.setFromAxisAngle(e,t),this.quaternion.multiply(zi),this}rotateOnWorldAxis(e,t){return zi.setFromAxisAngle(e,t),this.quaternion.premultiply(zi),this}rotateX(e){return this.rotateOnAxis(uc,e)}rotateY(e){return this.rotateOnAxis(dc,e)}rotateZ(e){return this.rotateOnAxis(fc,e)}translateOnAxis(e,t){return hc.copy(e).applyQuaternion(this.quaternion),this.position.add(hc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(uc,e)}translateY(e){return this.translateOnAxis(dc,e)}translateZ(e){return this.translateOnAxis(fc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(An.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?us.copy(e):us.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Sr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?An.lookAt(Sr,us,this.up):An.lookAt(us,Sr,this.up),this.quaternion.setFromRotationMatrix(An),r&&(An.extractRotation(r.matrixWorld),zi.setFromRotationMatrix(An),this.quaternion.premultiply(zi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(Hd)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Wd)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),An.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),An.multiply(e.parent.matrixWorld)),e.applyMatrix4(An),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sr,e,Gd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sr,Vd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++){let s=t[n];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++){let a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}};Ft.DEFAULT_UP=new P(0,1,0);Ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var un=new P,Cn=new P,Yo=new P,Rn=new P,ki=new P,Gi=new P,pc=new P,Zo=new P,Jo=new P,$o=new P,ds=!1,gi=class i{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),un.subVectors(e,t),r.cross(un);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){un.subVectors(r,t),Cn.subVectors(n,t),Yo.subVectors(e,t);let o=un.dot(un),a=un.dot(Cn),l=un.dot(Yo),c=Cn.dot(Cn),h=Cn.dot(Yo),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return s.set(1-f-g,g,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Rn)===null?!1:Rn.x>=0&&Rn.y>=0&&Rn.x+Rn.y<=1}static getUV(e,t,n,r,s,o,a,l){return ds===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ds=!0),this.getInterpolation(e,t,n,r,s,o,a,l)}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,Rn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Rn.x),l.addScaledVector(o,Rn.y),l.addScaledVector(a,Rn.z),l)}static isFrontFacing(e,t,n,r){return un.subVectors(n,t),Cn.subVectors(e,t),un.cross(Cn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return un.subVectors(this.c,this.b),Cn.subVectors(this.a,this.b),un.cross(Cn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,r,s){return ds===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ds=!0),i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,o,a;ki.subVectors(r,n),Gi.subVectors(s,n),Zo.subVectors(e,n);let l=ki.dot(Zo),c=Gi.dot(Zo);if(l<=0&&c<=0)return t.copy(n);Jo.subVectors(e,r);let h=ki.dot(Jo),u=Gi.dot(Jo);if(h>=0&&u<=h)return t.copy(r);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(ki,o);$o.subVectors(e,s);let f=ki.dot($o),g=Gi.dot($o);if(g>=0&&f<=g)return t.copy(s);let x=f*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Gi,a);let p=h*g-f*u;if(p<=0&&u-h>=0&&f-g>=0)return pc.subVectors(s,r),a=(u-h)/(u-h+(f-g)),t.copy(r).addScaledVector(pc,a);let m=1/(p+x+d);return o=x*m,a=d*m,t.copy(n).addScaledVector(ki,o).addScaledVector(Gi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},dh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Yn={h:0,s:0,l:0},fs={h:0,s:0,l:0};function Ko(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ye=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ot.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=ot.workingColorSpace){return this.r=e,this.g=t,this.b=n,ot.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=ot.workingColorSpace){if(e=Ld(e,1),t=Ct(t,0,1),n=Ct(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=Ko(o,s,e+1/3),this.g=Ko(o,s,e),this.b=Ko(o,s,e-1/3)}return ot.toWorkingColorSpace(this,r),this}setStyle(e,t=yt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){let n=dh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=rr(e.r),this.g=rr(e.g),this.b=rr(e.b),this}copyLinearToSRGB(e){return this.r=zo(e.r),this.g=zo(e.g),this.b=zo(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return ot.fromWorkingColorSpace(Dt.copy(this),e),Math.round(Ct(Dt.r*255,0,255))*65536+Math.round(Ct(Dt.g*255,0,255))*256+Math.round(Ct(Dt.b*255,0,255))}getHexString(e=yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ot.workingColorSpace){ot.fromWorkingColorSpace(Dt.copy(this),t);let n=Dt.r,r=Dt.g,s=Dt.b,o=Math.max(n,r,s),a=Math.min(n,r,s),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(r-s)/u+(r<s?6:0);break;case r:l=(s-n)/u+2;break;case s:l=(n-r)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=ot.workingColorSpace){return ot.fromWorkingColorSpace(Dt.copy(this),t),e.r=Dt.r,e.g=Dt.g,e.b=Dt.b,e}getStyle(e=yt){ot.fromWorkingColorSpace(Dt.copy(this),e);let t=Dt.r,n=Dt.g,r=Dt.b;return e!==yt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Yn),this.setHSL(Yn.h+e,Yn.s+t,Yn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Yn),e.getHSL(fs);let n=Fo(Yn.h,fs.h,t),r=Fo(Yn.s,fs.s,t),s=Fo(Yn.l,fs.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Dt=new Ye;Ye.NAMES=dh;var Xd=0,ii=class extends ti{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=Nn(),this.name="",this.type="Material",this.blending=ir,this.side=ei,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=da,this.blendDst=fa,this.blendEquation=pi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ye(0,0,0),this.blendAlpha=0,this.depthFunc=Us,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=tc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Di,this.stencilZFail=Di,this.stencilZPass=Di,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ir&&(n.blending=this.blending),this.side!==ei&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==da&&(n.blendSrc=this.blendSrc),this.blendDst!==fa&&(n.blendDst=this.blendDst),this.blendEquation!==pi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Us&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==tc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Di&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Di&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Di&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},vn=class extends ii{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Qc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var vt=new P,ps=new j,Ot=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=_a,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Jn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ps.fromBufferAttribute(this,t),ps.applyMatrix3(e),this.setXY(t,ps.x,ps.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix3(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix4(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyNormalMatrix(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.transformDirection(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Dn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=lt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Dn(t,this.array)),t}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Dn(t,this.array)),t}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Dn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Dn(t,this.array)),t}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array),r=lt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array),r=lt(r,this.array),s=lt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==_a&&(e.usage=this.usage),e}};var Ys=class extends Ot{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Zs=class extends Ot{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var tt=class extends Ot{constructor(e,t,n){super(new Float32Array(e),t,n)}};var qd=0,Kt=new ct,jo=new Ft,Vi=new P,Zt=new Fn,wr=new Fn,Et=new P,Mt=class i extends ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:qd++}),this.uuid=Nn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(uh(e)?Zs:Ys)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new et().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Kt.makeRotationFromQuaternion(e),this.applyMatrix4(Kt),this}rotateX(e){return Kt.makeRotationX(e),this.applyMatrix4(Kt),this}rotateY(e){return Kt.makeRotationY(e),this.applyMatrix4(Kt),this}rotateZ(e){return Kt.makeRotationZ(e),this.applyMatrix4(Kt),this}translate(e,t,n){return Kt.makeTranslation(e,t,n),this.applyMatrix4(Kt),this}scale(e,t,n){return Kt.makeScale(e,t,n),this.applyMatrix4(Kt),this}lookAt(e){return jo.lookAt(e),jo.updateMatrix(),this.applyMatrix4(jo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vi).negate(),this.translate(Vi.x,Vi.y,Vi.z),this}setFromPoints(e){let t=[];for(let n=0,r=e.length;n<r;n++){let s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new tt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];Zt.setFromBufferAttribute(s),this.morphTargetsRelative?(Et.addVectors(this.boundingBox.min,Zt.min),this.boundingBox.expandByPoint(Et),Et.addVectors(this.boundingBox.max,Zt.max),this.boundingBox.expandByPoint(Et)):(this.boundingBox.expandByPoint(Zt.min),this.boundingBox.expandByPoint(Zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new P,1/0);return}if(e){let n=this.boundingSphere.center;if(Zt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];wr.setFromBufferAttribute(a),this.morphTargetsRelative?(Et.addVectors(Zt.min,wr.min),Zt.expandByPoint(Et),Et.addVectors(Zt.max,wr.max),Zt.expandByPoint(Et)):(Zt.expandByPoint(wr.min),Zt.expandByPoint(wr.max))}Zt.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)Et.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(Et));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Et.fromBufferAttribute(a,c),l&&(Vi.fromBufferAttribute(e,c),Et.add(Vi)),r=Math.max(r,n.distanceToSquared(Et))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.array,r=t.position.array,s=t.normal.array,o=t.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ot(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],h=[];for(let w=0;w<a;w++)c[w]=new P,h[w]=new P;let u=new P,d=new P,f=new P,g=new j,x=new j,p=new j,m=new P,y=new P;function _(w,I,N){u.fromArray(r,w*3),d.fromArray(r,I*3),f.fromArray(r,N*3),g.fromArray(o,w*2),x.fromArray(o,I*2),p.fromArray(o,N*2),d.sub(u),f.sub(u),x.sub(g),p.sub(g);let q=1/(x.x*p.y-p.x*x.y);isFinite(q)&&(m.copy(d).multiplyScalar(p.y).addScaledVector(f,-x.y).multiplyScalar(q),y.copy(f).multiplyScalar(x.x).addScaledVector(d,-p.x).multiplyScalar(q),c[w].add(m),c[I].add(m),c[N].add(m),h[w].add(y),h[I].add(y),h[N].add(y))}let S=this.groups;S.length===0&&(S=[{start:0,count:n.length}]);for(let w=0,I=S.length;w<I;++w){let N=S[w],q=N.start,D=N.count;for(let O=q,k=q+D;O<k;O+=3)_(n[O+0],n[O+1],n[O+2])}let E=new P,v=new P,T=new P,U=new P;function M(w){T.fromArray(s,w*3),U.copy(T);let I=c[w];E.copy(I),E.sub(T.multiplyScalar(T.dot(I))).normalize(),v.crossVectors(U,I);let q=v.dot(h[w])<0?-1:1;l[w*4]=E.x,l[w*4+1]=E.y,l[w*4+2]=E.z,l[w*4+3]=q}for(let w=0,I=S.length;w<I;++w){let N=S[w],q=N.start,D=N.count;for(let O=q,k=q+D;O<k;O+=3)M(n[O+0]),M(n[O+1]),M(n[O+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ot(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let r=new P,s=new P,o=new P,a=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),x=e.getX(d+1),p=e.getX(d+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,p),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Et.fromBufferAttribute(e,t),Et.normalize(),e.setXYZ(t,Et.x,Et.y,Et.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,g=0;for(let x=0,p=l.length;x<p;x++){a.isInterleavedBufferAttribute?f=l[x]*a.data.stride+a.offset:f=l[x]*h;for(let m=0;m<h;m++)d[g++]=c[f++]}return new Ot(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,n);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let r=e.attributes;for(let c in r){let h=r[c];this.setAttribute(c,h.clone(t))}let s=e.morphAttributes;for(let c in s){let h=[],u=s[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},mc=new ct,ui=new Sa,ms=new Mi,gc=new P,Hi=new P,Wi=new P,Xi=new P,Qo=new P,gs=new P,_s=new j,xs=new j,ys=new j,_c=new P,xc=new P,yc=new P,vs=new P,Ms=new P,pe=class extends Ft{constructor(e=new Mt,t=new vn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){gs.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=a[l],u=s[l];h!==0&&(Qo.fromBufferAttribute(u,e),o?gs.addScaledVector(Qo,h):gs.addScaledVector(Qo.sub(t),h))}t.add(gs)}return t}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ms.copy(n.boundingSphere),ms.applyMatrix4(s),ui.copy(e.ray).recast(e.near),!(ms.containsPoint(ui.origin)===!1&&(ui.intersectSphere(ms,gc)===null||ui.origin.distanceToSquared(gc)>(e.far-e.near)**2))&&(mc.copy(s).invert(),ui.copy(e.ray).applyMatrix4(mc),!(n.boundingBox!==null&&ui.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ui)))}_computeIntersections(e,t,n){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){let p=d[g],m=o[p.materialIndex],y=Math.max(p.start,f.start),_=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let S=y,E=_;S<E;S+=3){let v=a.getX(S),T=a.getX(S+1),U=a.getX(S+2);r=bs(this,m,e,n,c,h,u,v,T,U),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let p=g,m=x;p<m;p+=3){let y=a.getX(p),_=a.getX(p+1),S=a.getX(p+2);r=bs(this,o,e,n,c,h,u,y,_,S),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){let p=d[g],m=o[p.materialIndex],y=Math.max(p.start,f.start),_=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let S=y,E=_;S<E;S+=3){let v=S,T=S+1,U=S+2;r=bs(this,m,e,n,c,h,u,v,T,U),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),x=Math.min(l.count,f.start+f.count);for(let p=g,m=x;p<m;p+=3){let y=p,_=p+1,S=p+2;r=bs(this,o,e,n,c,h,u,y,_,S),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}}};function Yd(i,e,t,n,r,s,o,a){let l;if(e.side===Nt?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===ei,a),l===null)return null;Ms.copy(a),Ms.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ms);return c<t.near||c>t.far?null:{distance:c,point:Ms.clone(),object:i}}function bs(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,Hi),i.getVertexPosition(l,Wi),i.getVertexPosition(c,Xi);let h=Yd(i,e,t,n,Hi,Wi,Xi,vs);if(h){r&&(_s.fromBufferAttribute(r,a),xs.fromBufferAttribute(r,l),ys.fromBufferAttribute(r,c),h.uv=gi.getInterpolation(vs,Hi,Wi,Xi,_s,xs,ys,new j)),s&&(_s.fromBufferAttribute(s,a),xs.fromBufferAttribute(s,l),ys.fromBufferAttribute(s,c),h.uv1=gi.getInterpolation(vs,Hi,Wi,Xi,_s,xs,ys,new j),h.uv2=h.uv1),o&&(_c.fromBufferAttribute(o,a),xc.fromBufferAttribute(o,l),yc.fromBufferAttribute(o,c),h.normal=gi.getInterpolation(vs,Hi,Wi,Xi,_c,xc,yc,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let u={a,b:l,c,normal:new P,materialIndex:0};gi.getNormal(Hi,Wi,Xi,u.normal),h.face=u}return h}var Jt=class i extends Mt{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new tt(c,3)),this.setAttribute("normal",new tt(h,3)),this.setAttribute("uv",new tt(u,2));function g(x,p,m,y,_,S,E,v,T,U,M){let w=S/T,I=E/U,N=S/2,q=E/2,D=v/2,O=T+1,k=U+1,K=0,$=0,Y=new P;for(let ne=0;ne<k;ne++){let Q=ne*I-q;for(let ce=0;ce<O;ce++){let z=ce*w-N;Y[x]=z*y,Y[p]=Q*_,Y[m]=D,c.push(Y.x,Y.y,Y.z),Y[x]=0,Y[p]=0,Y[m]=v>0?1:-1,h.push(Y.x,Y.y,Y.z),u.push(ce/T),u.push(1-ne/U),K+=1}}for(let ne=0;ne<U;ne++)for(let Q=0;Q<T;Q++){let ce=d+Q+O*ne,z=d+Q+O*(ne+1),ee=d+(Q+1)+O*(ne+1),_e=d+(Q+1)+O*ne;l.push(ce,z,_e),l.push(z,ee,_e),$+=6}a.addGroup(f,$,M),f+=$,d+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ur(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function kt(i){let e={};for(let t=0;t<i.length;t++){let n=ur(i[t]);for(let r in n)e[r]=n[r]}return e}function Zd(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function fh(i){return i.getRenderTarget()===null?i.outputColorSpace:ot.workingColorSpace}var Jd={clone:ur,merge:kt},$d=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Kd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,nn=class extends ii{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=$d,this.fragmentShader=Kd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ur(e.uniforms),this.uniformsGroups=Zd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Js=class extends Ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ct,this.projectionMatrix=new ct,this.projectionMatrixInverse=new ct,this.coordinateSystem=Un}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Wt=class extends Js{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ya*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Oo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ya*2*Math.atan(Math.tan(Oo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Oo*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},qi=-90,Yi=1,wa=class extends Ft{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Wt(qi,Yi,e,t);r.layers=this.layers,this.add(r);let s=new Wt(qi,Yi,e,t);s.layers=this.layers,this.add(s);let o=new Wt(qi,Yi,e,t);o.layers=this.layers,this.add(o);let a=new Wt(qi,Yi,e,t);a.layers=this.layers,this.add(a);let l=new Wt(qi,Yi,e,t);l.layers=this.layers,this.add(l);let c=new Wt(qi,Yi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===Un)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ks)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,r),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},$s=class extends en{constructor(e,t,n,r,s,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:ar,super(e,t,n,r,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ea=class extends tn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];t.encoding!==void 0&&(Ir("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===yi?yt:Qt),this.texture=new $s(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:jt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Jt(5,5,5),s=new nn({name:"CubemapFromEquirect",uniforms:ur(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Nt,blending:$n});s.uniforms.tEquirect.value=t;let o=new pe(r,s),a=t.minFilter;return t.minFilter===Nr&&(t.minFilter=jt),new wa(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}},ea=new P,jd=new P,Qd=new et,In=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=ea.subVectors(n,t).cross(jd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(ea),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Qd.getNormalMatrix(e),r=this.coplanarPoint(ea).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},di=new Mi,Ss=new P,Or=class{constructor(e=new In,t=new In,n=new In,r=new In,s=new In,o=new In){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Un){let n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],h=r[5],u=r[6],d=r[7],f=r[8],g=r[9],x=r[10],p=r[11],m=r[12],y=r[13],_=r[14],S=r[15];if(n[0].setComponents(l-s,d-c,p-f,S-m).normalize(),n[1].setComponents(l+s,d+c,p+f,S+m).normalize(),n[2].setComponents(l+o,d+h,p+g,S+y).normalize(),n[3].setComponents(l-o,d-h,p-g,S-y).normalize(),n[4].setComponents(l-a,d-u,p-x,S-_).normalize(),t===Un)n[5].setComponents(l+a,d+u,p+x,S+_).normalize();else if(t===ks)n[5].setComponents(a,u,x,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),di.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),di.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(di)}intersectsSprite(e){return di.center.set(0,0,0),di.radius=.7071067811865476,di.applyMatrix4(e.matrixWorld),this.intersectsSphere(di)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Ss.x=r.normal.x>0?e.max.x:e.min.x,Ss.y=r.normal.y>0?e.max.y:e.min.y,Ss.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ss)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function ph(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function ef(i,e){let t=e.isWebGL2,n=new WeakMap;function r(c,h){let u=c.array,d=c.usage,f=u.byteLength,g=i.createBuffer();i.bindBuffer(h,g),i.bufferData(h,u,d),c.onUploadCallback();let x;if(u instanceof Float32Array)x=i.FLOAT;else if(u instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)x=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=i.UNSIGNED_SHORT;else if(u instanceof Int16Array)x=i.SHORT;else if(u instanceof Uint32Array)x=i.UNSIGNED_INT;else if(u instanceof Int32Array)x=i.INT;else if(u instanceof Int8Array)x=i.BYTE;else if(u instanceof Uint8Array)x=i.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)x=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:g,type:x,bytesPerElement:u.BYTES_PER_ELEMENT,version:c.version,size:f}}function s(c,h,u){let d=h.array,f=h._updateRange,g=h.updateRanges;if(i.bindBuffer(u,c),f.count===-1&&g.length===0&&i.bufferSubData(u,0,d),g.length!==0){for(let x=0,p=g.length;x<p;x++){let m=g[x];t?i.bufferSubData(u,m.start*d.BYTES_PER_ELEMENT,d,m.start,m.count):i.bufferSubData(u,m.start*d.BYTES_PER_ELEMENT,d.subarray(m.start,m.start+m.count))}h.clearUpdateRanges()}f.count!==-1&&(t?i.bufferSubData(u,f.offset*d.BYTES_PER_ELEMENT,d,f.offset,f.count):i.bufferSubData(u,f.offset*d.BYTES_PER_ELEMENT,d.subarray(f.offset,f.offset+f.count)),f.count=-1),h.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let h=n.get(c);h&&(i.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){let d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let u=n.get(c);if(u===void 0)n.set(c,r(c,h));else if(u.version<c.version){if(u.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(u.buffer,c,h),u.version=c.version}}return{get:o,remove:a,update:l}}var rn=class i extends Mt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,h=l+1,u=e/a,d=t/l,f=[],g=[],x=[],p=[];for(let m=0;m<h;m++){let y=m*d-o;for(let _=0;_<c;_++){let S=_*u-s;g.push(S,-y,0),x.push(0,0,1),p.push(_/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<a;y++){let _=y+c*m,S=y+c*(m+1),E=y+1+c*(m+1),v=y+1+c*m;f.push(_,S,v),f.push(S,E,v)}this.setIndex(f),this.setAttribute("position",new tt(g,3)),this.setAttribute("normal",new tt(x,3)),this.setAttribute("uv",new tt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},tf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,nf=`#ifdef USE_ALPHAHASH
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
#endif`,rf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,sf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,of=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,af=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,lf=`#ifdef USE_AOMAP
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
#endif`,cf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,hf=`#ifdef USE_BATCHING
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
#endif`,uf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,df=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ff=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,pf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,mf=`#ifdef USE_IRIDESCENCE
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
#endif`,gf=`#ifdef USE_BUMPMAP
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
#endif`,_f=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,xf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,yf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,vf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Mf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,bf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Sf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,wf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Ef=`#define PI 3.141592653589793
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
} // validated`,Tf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Af=`vec3 transformedNormal = objectNormal;
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
#endif`,Cf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Rf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Pf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,If=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Lf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Df=`
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
}`,Uf=`#ifdef USE_ENVMAP
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
#endif`,Nf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Of=`#ifdef USE_ENVMAP
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
#endif`,Ff=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Bf=`#ifdef USE_ENVMAP
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
#endif`,zf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,kf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Gf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Vf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Hf=`#ifdef USE_GRADIENTMAP
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
}`,Wf=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Xf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Yf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Zf=`uniform bool receiveShadow;
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
#endif`,Jf=`#ifdef USE_ENVMAP
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
#endif`,$f=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Kf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,jf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Qf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ep=`PhysicalMaterial material;
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
#endif`,tp=`struct PhysicalMaterial {
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
}`,np=`
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
#endif`,ip=`#if defined( RE_IndirectDiffuse )
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
#endif`,rp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,sp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,op=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ap=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,lp=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,cp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,hp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,up=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,dp=`#if defined( USE_POINTS_UV )
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
#endif`,fp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,pp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,mp=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,gp=`#ifdef USE_MORPHNORMALS
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
#endif`,_p=`#ifdef USE_MORPHTARGETS
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
#endif`,xp=`#ifdef USE_MORPHTARGETS
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
#endif`,yp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,vp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Mp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,bp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Sp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,wp=`#ifdef USE_NORMALMAP
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
#endif`,Ep=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Tp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ap=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Cp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Rp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Pp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Ip=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Lp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Dp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Up=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Np=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Op=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Fp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Bp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,zp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,kp=`float getShadowMask() {
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
}`,Gp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Vp=`#ifdef USE_SKINNING
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
#endif`,Hp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Wp=`#ifdef USE_SKINNING
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
#endif`,Xp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,qp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Yp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Zp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Jp=`#ifdef USE_TRANSMISSION
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
#endif`,$p=`#ifdef USE_TRANSMISSION
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
#endif`,Kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,jp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Qp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,em=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,tm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,nm=`uniform sampler2D t2D;
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
}`,im=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,rm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,sm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,om=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,am=`#include <common>
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
}`,lm=`#if DEPTH_PACKING == 3200
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
}`,cm=`#define DISTANCE
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
}`,hm=`#define DISTANCE
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
}`,um=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,dm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fm=`uniform float scale;
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
}`,pm=`uniform vec3 diffuse;
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
}`,mm=`#include <common>
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
}`,gm=`uniform vec3 diffuse;
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
}`,_m=`#define LAMBERT
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
}`,xm=`#define LAMBERT
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
}`,ym=`#define MATCAP
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
}`,vm=`#define MATCAP
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
}`,Mm=`#define NORMAL
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
}`,bm=`#define NORMAL
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
}`,Sm=`#define PHONG
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
}`,wm=`#define PHONG
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
}`,Em=`#define STANDARD
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
}`,Tm=`#define STANDARD
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
}`,Am=`#define TOON
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
}`,Cm=`#define TOON
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
}`,Rm=`uniform float size;
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
}`,Pm=`uniform vec3 diffuse;
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
}`,Im=`#include <common>
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
}`,Lm=`uniform vec3 color;
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
}`,Dm=`uniform float rotation;
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
}`,Um=`uniform vec3 diffuse;
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
}`,Ze={alphahash_fragment:tf,alphahash_pars_fragment:nf,alphamap_fragment:rf,alphamap_pars_fragment:sf,alphatest_fragment:of,alphatest_pars_fragment:af,aomap_fragment:lf,aomap_pars_fragment:cf,batching_pars_vertex:hf,batching_vertex:uf,begin_vertex:df,beginnormal_vertex:ff,bsdfs:pf,iridescence_fragment:mf,bumpmap_pars_fragment:gf,clipping_planes_fragment:_f,clipping_planes_pars_fragment:xf,clipping_planes_pars_vertex:yf,clipping_planes_vertex:vf,color_fragment:Mf,color_pars_fragment:bf,color_pars_vertex:Sf,color_vertex:wf,common:Ef,cube_uv_reflection_fragment:Tf,defaultnormal_vertex:Af,displacementmap_pars_vertex:Cf,displacementmap_vertex:Rf,emissivemap_fragment:Pf,emissivemap_pars_fragment:If,colorspace_fragment:Lf,colorspace_pars_fragment:Df,envmap_fragment:Uf,envmap_common_pars_fragment:Nf,envmap_pars_fragment:Of,envmap_pars_vertex:Ff,envmap_physical_pars_fragment:Jf,envmap_vertex:Bf,fog_vertex:zf,fog_pars_vertex:kf,fog_fragment:Gf,fog_pars_fragment:Vf,gradientmap_pars_fragment:Hf,lightmap_fragment:Wf,lightmap_pars_fragment:Xf,lights_lambert_fragment:qf,lights_lambert_pars_fragment:Yf,lights_pars_begin:Zf,lights_toon_fragment:$f,lights_toon_pars_fragment:Kf,lights_phong_fragment:jf,lights_phong_pars_fragment:Qf,lights_physical_fragment:ep,lights_physical_pars_fragment:tp,lights_fragment_begin:np,lights_fragment_maps:ip,lights_fragment_end:rp,logdepthbuf_fragment:sp,logdepthbuf_pars_fragment:op,logdepthbuf_pars_vertex:ap,logdepthbuf_vertex:lp,map_fragment:cp,map_pars_fragment:hp,map_particle_fragment:up,map_particle_pars_fragment:dp,metalnessmap_fragment:fp,metalnessmap_pars_fragment:pp,morphcolor_vertex:mp,morphnormal_vertex:gp,morphtarget_pars_vertex:_p,morphtarget_vertex:xp,normal_fragment_begin:yp,normal_fragment_maps:vp,normal_pars_fragment:Mp,normal_pars_vertex:bp,normal_vertex:Sp,normalmap_pars_fragment:wp,clearcoat_normal_fragment_begin:Ep,clearcoat_normal_fragment_maps:Tp,clearcoat_pars_fragment:Ap,iridescence_pars_fragment:Cp,opaque_fragment:Rp,packing:Pp,premultiplied_alpha_fragment:Ip,project_vertex:Lp,dithering_fragment:Dp,dithering_pars_fragment:Up,roughnessmap_fragment:Np,roughnessmap_pars_fragment:Op,shadowmap_pars_fragment:Fp,shadowmap_pars_vertex:Bp,shadowmap_vertex:zp,shadowmask_pars_fragment:kp,skinbase_vertex:Gp,skinning_pars_vertex:Vp,skinning_vertex:Hp,skinnormal_vertex:Wp,specularmap_fragment:Xp,specularmap_pars_fragment:qp,tonemapping_fragment:Yp,tonemapping_pars_fragment:Zp,transmission_fragment:Jp,transmission_pars_fragment:$p,uv_pars_fragment:Kp,uv_pars_vertex:jp,uv_vertex:Qp,worldpos_vertex:em,background_vert:tm,background_frag:nm,backgroundCube_vert:im,backgroundCube_frag:rm,cube_vert:sm,cube_frag:om,depth_vert:am,depth_frag:lm,distanceRGBA_vert:cm,distanceRGBA_frag:hm,equirect_vert:um,equirect_frag:dm,linedashed_vert:fm,linedashed_frag:pm,meshbasic_vert:mm,meshbasic_frag:gm,meshlambert_vert:_m,meshlambert_frag:xm,meshmatcap_vert:ym,meshmatcap_frag:vm,meshnormal_vert:Mm,meshnormal_frag:bm,meshphong_vert:Sm,meshphong_frag:wm,meshphysical_vert:Em,meshphysical_frag:Tm,meshtoon_vert:Am,meshtoon_frag:Cm,points_vert:Rm,points_frag:Pm,shadow_vert:Im,shadow_frag:Lm,sprite_vert:Dm,sprite_frag:Um},me={common:{diffuse:{value:new Ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new et}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new et}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new et}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new et},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new et},normalScale:{value:new j(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new et},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new et}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new et}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new et}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0},uvTransform:{value:new et}},sprite:{diffuse:{value:new Ye(16777215)},opacity:{value:1},center:{value:new j(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}}},yn={basic:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ze.meshbasic_vert,fragmentShader:Ze.meshbasic_frag},lambert:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ye(0)}}]),vertexShader:Ze.meshlambert_vert,fragmentShader:Ze.meshlambert_frag},phong:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ye(0)},specular:{value:new Ye(1118481)},shininess:{value:30}}]),vertexShader:Ze.meshphong_vert,fragmentShader:Ze.meshphong_frag},standard:{uniforms:kt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag},toon:{uniforms:kt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Ye(0)}}]),vertexShader:Ze.meshtoon_vert,fragmentShader:Ze.meshtoon_frag},matcap:{uniforms:kt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ze.meshmatcap_vert,fragmentShader:Ze.meshmatcap_frag},points:{uniforms:kt([me.points,me.fog]),vertexShader:Ze.points_vert,fragmentShader:Ze.points_frag},dashed:{uniforms:kt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ze.linedashed_vert,fragmentShader:Ze.linedashed_frag},depth:{uniforms:kt([me.common,me.displacementmap]),vertexShader:Ze.depth_vert,fragmentShader:Ze.depth_frag},normal:{uniforms:kt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ze.meshnormal_vert,fragmentShader:Ze.meshnormal_frag},sprite:{uniforms:kt([me.sprite,me.fog]),vertexShader:Ze.sprite_vert,fragmentShader:Ze.sprite_frag},background:{uniforms:{uvTransform:{value:new et},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ze.background_vert,fragmentShader:Ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Ze.backgroundCube_vert,fragmentShader:Ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ze.cube_vert,fragmentShader:Ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ze.equirect_vert,fragmentShader:Ze.equirect_frag},distanceRGBA:{uniforms:kt([me.common,me.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ze.distanceRGBA_vert,fragmentShader:Ze.distanceRGBA_frag},shadow:{uniforms:kt([me.lights,me.fog,{color:{value:new Ye(0)},opacity:{value:1}}]),vertexShader:Ze.shadow_vert,fragmentShader:Ze.shadow_frag}};yn.physical={uniforms:kt([yn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new et},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new et},clearcoatNormalScale:{value:new j(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new et},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new et},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new et},sheen:{value:0},sheenColor:{value:new Ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new et},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new et},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new et},transmissionSamplerSize:{value:new j},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new et},attenuationDistance:{value:0},attenuationColor:{value:new Ye(0)},specularColor:{value:new Ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new et},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new et},anisotropyVector:{value:new j},anisotropyMap:{value:null},anisotropyMapTransform:{value:new et}}]),vertexShader:Ze.meshphysical_vert,fragmentShader:Ze.meshphysical_frag};var ws={r:0,b:0,g:0};function Nm(i,e,t,n,r,s,o){let a=new Ye(0),l=s===!0?0:1,c,h,u=null,d=0,f=null;function g(p,m){let y=!1,_=m.isScene===!0?m.background:null;_&&_.isTexture&&(_=(m.backgroundBlurriness>0?t:e).get(_)),_===null?x(a,l):_&&_.isColor&&(x(_,1),y=!0);let S=i.xr.getEnvironmentBlendMode();S==="additive"?n.buffers.color.setClear(0,0,0,1,o):S==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||y)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),_&&(_.isCubeTexture||_.mapping===fo)?(h===void 0&&(h=new pe(new Jt(1,1,1),new nn({name:"BackgroundCubeMaterial",uniforms:ur(yn.backgroundCube.uniforms),vertexShader:yn.backgroundCube.vertexShader,fragmentShader:yn.backgroundCube.fragmentShader,side:Nt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(E,v,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),h.material.uniforms.envMap.value=_,h.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,h.material.toneMapped=ot.getTransfer(_.colorSpace)!==ht,(u!==_||d!==_.version||f!==i.toneMapping)&&(h.material.needsUpdate=!0,u=_,d=_.version,f=i.toneMapping),h.layers.enableAll(),p.unshift(h,h.geometry,h.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new pe(new rn(2,2),new nn({name:"BackgroundMaterial",uniforms:ur(yn.background.uniforms),vertexShader:yn.background.vertexShader,fragmentShader:yn.background.fragmentShader,side:ei,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,c.material.toneMapped=ot.getTransfer(_.colorSpace)!==ht,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||d!==_.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,u=_,d=_.version,f=i.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null))}function x(p,m){p.getRGB(ws,fh(i)),n.buffers.color.setClear(ws.r,ws.g,ws.b,m,o)}return{getClearColor:function(){return a},setClearColor:function(p,m=1){a.set(p),l=m,x(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,x(a,l)},render:g}}function Om(i,e,t,n){let r=i.getParameter(i.MAX_VERTEX_ATTRIBS),s=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||s!==null,a={},l=p(null),c=l,h=!1;function u(D,O,k,K,$){let Y=!1;if(o){let ne=x(K,k,O);c!==ne&&(c=ne,f(c.object)),Y=m(D,K,k,$),Y&&y(D,K,k,$)}else{let ne=O.wireframe===!0;(c.geometry!==K.id||c.program!==k.id||c.wireframe!==ne)&&(c.geometry=K.id,c.program=k.id,c.wireframe=ne,Y=!0)}$!==null&&t.update($,i.ELEMENT_ARRAY_BUFFER),(Y||h)&&(h=!1,U(D,O,k,K),$!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get($).buffer))}function d(){return n.isWebGL2?i.createVertexArray():s.createVertexArrayOES()}function f(D){return n.isWebGL2?i.bindVertexArray(D):s.bindVertexArrayOES(D)}function g(D){return n.isWebGL2?i.deleteVertexArray(D):s.deleteVertexArrayOES(D)}function x(D,O,k){let K=k.wireframe===!0,$=a[D.id];$===void 0&&($={},a[D.id]=$);let Y=$[O.id];Y===void 0&&(Y={},$[O.id]=Y);let ne=Y[K];return ne===void 0&&(ne=p(d()),Y[K]=ne),ne}function p(D){let O=[],k=[],K=[];for(let $=0;$<r;$++)O[$]=0,k[$]=0,K[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:k,attributeDivisors:K,object:D,attributes:{},index:null}}function m(D,O,k,K){let $=c.attributes,Y=O.attributes,ne=0,Q=k.getAttributes();for(let ce in Q)if(Q[ce].location>=0){let ee=$[ce],_e=Y[ce];if(_e===void 0&&(ce==="instanceMatrix"&&D.instanceMatrix&&(_e=D.instanceMatrix),ce==="instanceColor"&&D.instanceColor&&(_e=D.instanceColor)),ee===void 0||ee.attribute!==_e||_e&&ee.data!==_e.data)return!0;ne++}return c.attributesNum!==ne||c.index!==K}function y(D,O,k,K){let $={},Y=O.attributes,ne=0,Q=k.getAttributes();for(let ce in Q)if(Q[ce].location>=0){let ee=Y[ce];ee===void 0&&(ce==="instanceMatrix"&&D.instanceMatrix&&(ee=D.instanceMatrix),ce==="instanceColor"&&D.instanceColor&&(ee=D.instanceColor));let _e={};_e.attribute=ee,ee&&ee.data&&(_e.data=ee.data),$[ce]=_e,ne++}c.attributes=$,c.attributesNum=ne,c.index=K}function _(){let D=c.newAttributes;for(let O=0,k=D.length;O<k;O++)D[O]=0}function S(D){E(D,0)}function E(D,O){let k=c.newAttributes,K=c.enabledAttributes,$=c.attributeDivisors;k[D]=1,K[D]===0&&(i.enableVertexAttribArray(D),K[D]=1),$[D]!==O&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](D,O),$[D]=O)}function v(){let D=c.newAttributes,O=c.enabledAttributes;for(let k=0,K=O.length;k<K;k++)O[k]!==D[k]&&(i.disableVertexAttribArray(k),O[k]=0)}function T(D,O,k,K,$,Y,ne){ne===!0?i.vertexAttribIPointer(D,O,k,$,Y):i.vertexAttribPointer(D,O,k,K,$,Y)}function U(D,O,k,K){if(n.isWebGL2===!1&&(D.isInstancedMesh||K.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;_();let $=K.attributes,Y=k.getAttributes(),ne=O.defaultAttributeValues;for(let Q in Y){let ce=Y[Q];if(ce.location>=0){let z=$[Q];if(z===void 0&&(Q==="instanceMatrix"&&D.instanceMatrix&&(z=D.instanceMatrix),Q==="instanceColor"&&D.instanceColor&&(z=D.instanceColor)),z!==void 0){let ee=z.normalized,_e=z.itemSize,Te=t.get(z);if(Te===void 0)continue;let Me=Te.buffer,Pe=Te.type,Ue=Te.bytesPerElement,we=n.isWebGL2===!0&&(Pe===i.INT||Pe===i.UNSIGNED_INT||z.gpuType===th);if(z.isInterleavedBufferAttribute){let ke=z.data,L=ke.stride,fe=z.offset;if(ke.isInstancedInterleavedBuffer){for(let Z=0;Z<ce.locationSize;Z++)E(ce.location+Z,ke.meshPerAttribute);D.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=ke.meshPerAttribute*ke.count)}else for(let Z=0;Z<ce.locationSize;Z++)S(ce.location+Z);i.bindBuffer(i.ARRAY_BUFFER,Me);for(let Z=0;Z<ce.locationSize;Z++)T(ce.location+Z,_e/ce.locationSize,Pe,ee,L*Ue,(fe+_e/ce.locationSize*Z)*Ue,we)}else{if(z.isInstancedBufferAttribute){for(let ke=0;ke<ce.locationSize;ke++)E(ce.location+ke,z.meshPerAttribute);D.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=z.meshPerAttribute*z.count)}else for(let ke=0;ke<ce.locationSize;ke++)S(ce.location+ke);i.bindBuffer(i.ARRAY_BUFFER,Me);for(let ke=0;ke<ce.locationSize;ke++)T(ce.location+ke,_e/ce.locationSize,Pe,ee,_e*Ue,_e/ce.locationSize*ke*Ue,we)}}else if(ne!==void 0){let ee=ne[Q];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(ce.location,ee);break;case 3:i.vertexAttrib3fv(ce.location,ee);break;case 4:i.vertexAttrib4fv(ce.location,ee);break;default:i.vertexAttrib1fv(ce.location,ee)}}}}v()}function M(){N();for(let D in a){let O=a[D];for(let k in O){let K=O[k];for(let $ in K)g(K[$].object),delete K[$];delete O[k]}delete a[D]}}function w(D){if(a[D.id]===void 0)return;let O=a[D.id];for(let k in O){let K=O[k];for(let $ in K)g(K[$].object),delete K[$];delete O[k]}delete a[D.id]}function I(D){for(let O in a){let k=a[O];if(k[D.id]===void 0)continue;let K=k[D.id];for(let $ in K)g(K[$].object),delete K[$];delete k[D.id]}}function N(){q(),h=!0,c!==l&&(c=l,f(c.object))}function q(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:u,reset:N,resetDefaultState:q,dispose:M,releaseStatesOfGeometry:w,releaseStatesOfProgram:I,initAttributes:_,enableAttribute:S,disableUnusedAttributes:v}}function Fm(i,e,t,n){let r=n.isWebGL2,s;function o(h){s=h}function a(h,u){i.drawArrays(s,h,u),t.update(u,s,1)}function l(h,u,d){if(d===0)return;let f,g;if(r)f=i,g="drawArraysInstanced";else if(f=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[g](s,h,u,d),t.update(u,s,d)}function c(h,u,d){if(d===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<d;g++)this.render(h[g],u[g]);else{f.multiDrawArraysWEBGL(s,h,0,u,0,d);let g=0;for(let x=0;x<d;x++)g+=u[x];t.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function Bm(i,e,t){let n;function r(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let T=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(T){if(T==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||e.has("WEBGL_draw_buffers"),h=t.logarithmicDepthBuffer===!0,u=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),x=i.getParameter(i.MAX_VERTEX_ATTRIBS),p=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),m=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),_=d>0,S=o||e.has("OES_texture_float"),E=_&&S,v=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:d,maxTextureSize:f,maxCubemapSize:g,maxAttributes:x,maxVertexUniforms:p,maxVaryings:m,maxFragmentUniforms:y,vertexTextures:_,floatFragmentTextures:S,floatVertexTextures:E,maxSamples:v}}function zm(i){let e=this,t=null,n=0,r=!1,s=!1,o=new In,a=new et,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||r;return r=d,n=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,x=u.clipIntersection,p=u.clipShadows,m=i.get(u);if(!r||g===null||g.length===0||s&&!p)s?h(null):c();else{let y=s?0:n,_=y*4,S=m.clippingState||null;l.value=S,S=h(g,d,_,f);for(let E=0;E!==_;++E)S[E]=t[E];m.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,g){let x=u!==null?u.length:0,p=null;if(x!==0){if(p=l.value,g!==!0||p===null){let m=f+x*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<m)&&(p=new Float32Array(m));for(let _=0,S=f;_!==x;++_,S+=4)o.copy(u[_]).applyMatrix4(y,a),o.normal.toArray(p,S),p[S+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,p}}function km(i){let e=new WeakMap;function t(o,a){return a===pa?o.mapping=ar:a===ma&&(o.mapping=lr),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===pa||a===ma)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Ea(l.height/2);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var ri=class extends Js{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},er=4,vc=[.125,.215,.35,.446,.526,.582],mi=20,ta=new ri,Mc=new Ye,na=null,ia=0,ra=0,fi=(1+Math.sqrt(5))/2,Zi=1/fi,bc=[new P(1,1,1),new P(-1,1,1),new P(1,1,-1),new P(-1,1,-1),new P(0,fi,Zi),new P(0,fi,-Zi),new P(Zi,0,fi),new P(-Zi,0,fi),new P(fi,Zi,0),new P(-fi,Zi,0)],dr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){na=this._renderer.getRenderTarget(),ia=this._renderer.getActiveCubeFace(),ra=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ec(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=wc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(na,ia,ra),e.scissorTest=!1,Es(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ar||e.mapping===lr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),na=this._renderer.getRenderTarget(),ia=this._renderer.getActiveCubeFace(),ra=this._renderer.getActiveMipmapLevel();let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:jt,minFilter:jt,generateMipmaps:!1,type:vi,format:dn,colorSpace:On,depthBuffer:!1},r=Sc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Sc(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Gm(s)),this._blurMaterial=Vm(s,e,t)}return r}_compileMaterial(e){let t=new pe(this._lodPlanes[0],e);this._renderer.compile(t,ta)}_sceneToCubeUV(e,t,n,r){let a=new Wt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(Mc),h.toneMapping=Kn,h.autoClear=!1;let f=new vn({name:"PMREM.Background",side:Nt,depthWrite:!1,depthTest:!1}),g=new pe(new Jt,f),x=!1,p=e.background;p?p.isColor&&(f.color.copy(p),e.background=null,x=!0):(f.color.copy(Mc),x=!0);for(let m=0;m<6;m++){let y=m%3;y===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):y===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));let _=this._cubeSize;Es(r,y*_,m>2?_:0,_,_),h.setRenderTarget(r),x&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=p}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===ar||e.mapping===lr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ec()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=wc());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new pe(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Es(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,ta)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=bc[(r-1)%bc.length];this._blur(e,r-1,r,s,o)}t.autoClear=n}_blur(e,t,n,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new pe(this._lodPlanes[r],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*mi-1),x=s/g,p=isFinite(s)?1+Math.floor(h*x):mi;p>mi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${mi}`);let m=[],y=0;for(let T=0;T<mi;++T){let U=T/x,M=Math.exp(-U*U/2);m.push(M),T===0?y+=M:T<p&&(y+=2*M)}for(let T=0;T<m.length;T++)m[T]=m[T]/y;d.envMap.value=e.texture,d.samples.value=p,d.weights.value=m,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:_}=this;d.dTheta.value=g,d.mipInt.value=_-n;let S=this._sizeLods[r],E=3*S*(r>_-er?r-_+er:0),v=4*(this._cubeSize-S);Es(t,E,v,3*S,2*S),l.setRenderTarget(t),l.render(u,ta)}};function Gm(i){let e=[],t=[],n=[],r=i,s=i-er+1+vc.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>i-er?l=vc[o-i+er-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,x=3,p=2,m=1,y=new Float32Array(x*g*f),_=new Float32Array(p*g*f),S=new Float32Array(m*g*f);for(let v=0;v<f;v++){let T=v%3*2/3-1,U=v>2?0:-1,M=[T,U,0,T+2/3,U,0,T+2/3,U+1,0,T,U,0,T+2/3,U+1,0,T,U+1,0];y.set(M,x*g*v),_.set(d,p*g*v);let w=[v,v,v,v,v,v];S.set(w,m*g*v)}let E=new Mt;E.setAttribute("position",new Ot(y,x)),E.setAttribute("uv",new Ot(_,p)),E.setAttribute("faceIndex",new Ot(S,m)),e.push(E),r>er&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Sc(i,e,t){let n=new tn(i,e,t);return n.texture.mapping=fo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Es(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function Vm(i,e,t){let n=new Float32Array(mi),r=new P(0,1,0);return new nn({name:"SphericalGaussianBlur",defines:{n:mi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:sl(),fragmentShader:`

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
		`,blending:$n,depthTest:!1,depthWrite:!1})}function wc(){return new nn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sl(),fragmentShader:`

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
		`,blending:$n,depthTest:!1,depthWrite:!1})}function Ec(){return new nn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:$n,depthTest:!1,depthWrite:!1})}function sl(){return`

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
	`}function Hm(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===pa||l===ma,h=l===ar||l===lr;if(c||h)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let u=e.get(a);return t===null&&(t=new dr(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),e.set(a,u),u.texture}else{if(e.has(a))return e.get(a).texture;{let u=a.image;if(c&&u&&u.height>0||h&&u&&r(u)){t===null&&(t=new dr(i));let d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",s),d.texture}else return null}}}return a}function r(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Wm(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){let r=t(n);return r===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function Xm(i,e,t,n){let r={},s=new WeakMap;function o(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);for(let g in d.morphAttributes){let x=d.morphAttributes[g];for(let p=0,m=x.length;p<m;p++)e.remove(x[p])}d.removeEventListener("dispose",o),delete r[d.id];let f=s.get(d);f&&(e.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,t.memory.geometries++),d}function l(u){let d=u.attributes;for(let g in d)e.update(d[g],i.ARRAY_BUFFER);let f=u.morphAttributes;for(let g in f){let x=f[g];for(let p=0,m=x.length;p<m;p++)e.update(x[p],i.ARRAY_BUFFER)}}function c(u){let d=[],f=u.index,g=u.attributes.position,x=0;if(f!==null){let y=f.array;x=f.version;for(let _=0,S=y.length;_<S;_+=3){let E=y[_+0],v=y[_+1],T=y[_+2];d.push(E,v,v,T,T,E)}}else if(g!==void 0){let y=g.array;x=g.version;for(let _=0,S=y.length/3-1;_<S;_+=3){let E=_+0,v=_+1,T=_+2;d.push(E,v,v,T,T,E)}}else return;let p=new(uh(d)?Zs:Ys)(d,1);p.version=x;let m=s.get(u);m&&e.remove(m),s.set(u,p)}function h(u){let d=s.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function qm(i,e,t,n){let r=n.isWebGL2,s;function o(f){s=f}let a,l;function c(f){a=f.type,l=f.bytesPerElement}function h(f,g){i.drawElements(s,g,a,f*l),t.update(g,s,1)}function u(f,g,x){if(x===0)return;let p,m;if(r)p=i,m="drawElementsInstanced";else if(p=e.get("ANGLE_instanced_arrays"),m="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[m](s,g,a,f*l,x),t.update(g,s,x)}function d(f,g,x){if(x===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<x;m++)this.render(f[m]/l,g[m]);else{p.multiDrawElementsWEBGL(s,g,0,a,f,0,x);let m=0;for(let y=0;y<x;y++)m+=g[y];t.update(m,s,1)}}this.setMode=o,this.setIndex=c,this.render=h,this.renderInstances=u,this.renderMultiDraw=d}function Ym(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function Zm(i,e){return i[0]-e[0]}function Jm(i,e){return Math.abs(e[1])-Math.abs(i[1])}function $m(i,e,t){let n={},r=new Float32Array(8),s=new WeakMap,o=new dt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,h,u){let d=c.morphTargetInfluences;if(e.isWebGL2===!0){let f=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=f!==void 0?f.length:0,x=s.get(h);if(x===void 0||x.count!==g){let D=function(){N.dispose(),s.delete(h),h.removeEventListener("dispose",D)};x!==void 0&&x.texture.dispose();let y=h.morphAttributes.position!==void 0,_=h.morphAttributes.normal!==void 0,S=h.morphAttributes.color!==void 0,E=h.morphAttributes.position||[],v=h.morphAttributes.normal||[],T=h.morphAttributes.color||[],U=0;y===!0&&(U=1),_===!0&&(U=2),S===!0&&(U=3);let M=h.attributes.position.count*U,w=1;M>e.maxTextureSize&&(w=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let I=new Float32Array(M*w*4*g),N=new Ws(I,M,w,g);N.type=Jn,N.needsUpdate=!0;let q=U*4;for(let O=0;O<g;O++){let k=E[O],K=v[O],$=T[O],Y=M*w*4*O;for(let ne=0;ne<k.count;ne++){let Q=ne*q;y===!0&&(o.fromBufferAttribute(k,ne),I[Y+Q+0]=o.x,I[Y+Q+1]=o.y,I[Y+Q+2]=o.z,I[Y+Q+3]=0),_===!0&&(o.fromBufferAttribute(K,ne),I[Y+Q+4]=o.x,I[Y+Q+5]=o.y,I[Y+Q+6]=o.z,I[Y+Q+7]=0),S===!0&&(o.fromBufferAttribute($,ne),I[Y+Q+8]=o.x,I[Y+Q+9]=o.y,I[Y+Q+10]=o.z,I[Y+Q+11]=$.itemSize===4?o.w:1)}}x={count:g,texture:N,size:new j(M,w)},s.set(h,x),h.addEventListener("dispose",D)}let p=0;for(let y=0;y<d.length;y++)p+=d[y];let m=h.morphTargetsRelative?1:1-p;u.getUniforms().setValue(i,"morphTargetBaseInfluence",m),u.getUniforms().setValue(i,"morphTargetInfluences",d),u.getUniforms().setValue(i,"morphTargetsTexture",x.texture,t),u.getUniforms().setValue(i,"morphTargetsTextureSize",x.size)}else{let f=d===void 0?0:d.length,g=n[h.id];if(g===void 0||g.length!==f){g=[];for(let _=0;_<f;_++)g[_]=[_,0];n[h.id]=g}for(let _=0;_<f;_++){let S=g[_];S[0]=_,S[1]=d[_]}g.sort(Jm);for(let _=0;_<8;_++)_<f&&g[_][1]?(a[_][0]=g[_][0],a[_][1]=g[_][1]):(a[_][0]=Number.MAX_SAFE_INTEGER,a[_][1]=0);a.sort(Zm);let x=h.morphAttributes.position,p=h.morphAttributes.normal,m=0;for(let _=0;_<8;_++){let S=a[_],E=S[0],v=S[1];E!==Number.MAX_SAFE_INTEGER&&v?(x&&h.getAttribute("morphTarget"+_)!==x[E]&&h.setAttribute("morphTarget"+_,x[E]),p&&h.getAttribute("morphNormal"+_)!==p[E]&&h.setAttribute("morphNormal"+_,p[E]),r[_]=v,m+=v):(x&&h.hasAttribute("morphTarget"+_)===!0&&h.deleteAttribute("morphTarget"+_),p&&h.hasAttribute("morphNormal"+_)===!0&&h.deleteAttribute("morphNormal"+_),r[_]=0)}let y=h.morphTargetsRelative?1:1-m;u.getUniforms().setValue(i,"morphTargetBaseInfluence",y),u.getUniforms().setValue(i,"morphTargetInfluences",r)}}return{update:l}}function Km(i,e,t,n){let r=new WeakMap;function s(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(r.get(u)!==c&&(e.update(u),r.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return u}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var Ks=class extends en{constructor(e,t,n,r,s,o,a,l,c,h){if(h=h!==void 0?h:xi,h!==xi&&h!==hr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===xi&&(n=Zn),n===void 0&&h===hr&&(n=_i),super(null,r,s,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Gt,this.minFilter=l!==void 0?l:Gt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},mh=new en,gh=new Ks(1,1);gh.compareFunction=hh;var _h=new Ws,xh=new ba,yh=new $s,Tc=[],Ac=[],Cc=new Float32Array(16),Rc=new Float32Array(9),Pc=new Float32Array(4);function gr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=Tc[r];if(s===void 0&&(s=new Float32Array(r),Tc[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function bt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function St(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function mo(i,e){let t=Ac[e];t===void 0&&(t=new Int32Array(e),Ac[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function jm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Qm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2fv(this.addr,e),St(t,e)}}function e0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(bt(t,e))return;i.uniform3fv(this.addr,e),St(t,e)}}function t0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4fv(this.addr,e),St(t,e)}}function n0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),St(t,e)}else{if(bt(t,n))return;Pc.set(n),i.uniformMatrix2fv(this.addr,!1,Pc),St(t,n)}}function i0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),St(t,e)}else{if(bt(t,n))return;Rc.set(n),i.uniformMatrix3fv(this.addr,!1,Rc),St(t,n)}}function r0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),St(t,e)}else{if(bt(t,n))return;Cc.set(n),i.uniformMatrix4fv(this.addr,!1,Cc),St(t,n)}}function s0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function o0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2iv(this.addr,e),St(t,e)}}function a0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;i.uniform3iv(this.addr,e),St(t,e)}}function l0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4iv(this.addr,e),St(t,e)}}function c0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function h0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2uiv(this.addr,e),St(t,e)}}function u0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;i.uniform3uiv(this.addr,e),St(t,e)}}function d0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4uiv(this.addr,e),St(t,e)}}function f0(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s=this.type===i.SAMPLER_2D_SHADOW?gh:mh;t.setTexture2D(e||s,r)}function p0(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||xh,r)}function m0(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||yh,r)}function g0(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||_h,r)}function _0(i){switch(i){case 5126:return jm;case 35664:return Qm;case 35665:return e0;case 35666:return t0;case 35674:return n0;case 35675:return i0;case 35676:return r0;case 5124:case 35670:return s0;case 35667:case 35671:return o0;case 35668:case 35672:return a0;case 35669:case 35673:return l0;case 5125:return c0;case 36294:return h0;case 36295:return u0;case 36296:return d0;case 35678:case 36198:case 36298:case 36306:case 35682:return f0;case 35679:case 36299:case 36307:return p0;case 35680:case 36300:case 36308:case 36293:return m0;case 36289:case 36303:case 36311:case 36292:return g0}}function x0(i,e){i.uniform1fv(this.addr,e)}function y0(i,e){let t=gr(e,this.size,2);i.uniform2fv(this.addr,t)}function v0(i,e){let t=gr(e,this.size,3);i.uniform3fv(this.addr,t)}function M0(i,e){let t=gr(e,this.size,4);i.uniform4fv(this.addr,t)}function b0(i,e){let t=gr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function S0(i,e){let t=gr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function w0(i,e){let t=gr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function E0(i,e){i.uniform1iv(this.addr,e)}function T0(i,e){i.uniform2iv(this.addr,e)}function A0(i,e){i.uniform3iv(this.addr,e)}function C0(i,e){i.uniform4iv(this.addr,e)}function R0(i,e){i.uniform1uiv(this.addr,e)}function P0(i,e){i.uniform2uiv(this.addr,e)}function I0(i,e){i.uniform3uiv(this.addr,e)}function L0(i,e){i.uniform4uiv(this.addr,e)}function D0(i,e,t){let n=this.cache,r=e.length,s=mo(t,r);bt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||mh,s[o])}function U0(i,e,t){let n=this.cache,r=e.length,s=mo(t,r);bt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||xh,s[o])}function N0(i,e,t){let n=this.cache,r=e.length,s=mo(t,r);bt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||yh,s[o])}function O0(i,e,t){let n=this.cache,r=e.length,s=mo(t,r);bt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||_h,s[o])}function F0(i){switch(i){case 5126:return x0;case 35664:return y0;case 35665:return v0;case 35666:return M0;case 35674:return b0;case 35675:return S0;case 35676:return w0;case 5124:case 35670:return E0;case 35667:case 35671:return T0;case 35668:case 35672:return A0;case 35669:case 35673:return C0;case 5125:return R0;case 36294:return P0;case 36295:return I0;case 36296:return L0;case 35678:case 36198:case 36298:case 36306:case 35682:return D0;case 35679:case 36299:case 36307:return U0;case 35680:case 36300:case 36308:case 36293:return N0;case 36289:case 36303:case 36311:case 36292:return O0}}var Ta=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=_0(t.type)}},Aa=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=F0(t.type)}},Ca=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],n)}}},sa=/(\w+)(\])?(\[|\.)?/g;function Ic(i,e){i.seq.push(e),i.map[e.id]=e}function B0(i,e,t){let n=i.name,r=n.length;for(sa.lastIndex=0;;){let s=sa.exec(n),o=sa.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Ic(t,c===void 0?new Ta(a,i,e):new Aa(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new Ca(a),Ic(t,u)),t=u}}}var sr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);B0(s,o,this)}}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&n.push(o)}return n}};function Lc(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var z0=37297,k0=0;function G0(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function V0(i){let e=ot.getPrimaries(ot.workingColorSpace),t=ot.getPrimaries(i),n;switch(e===t?n="":e===zs&&t===Bs?n="LinearDisplayP3ToLinearSRGB":e===Bs&&t===zs&&(n="LinearSRGBToLinearDisplayP3"),i){case On:case po:return[n,"LinearTransferOETF"];case yt:case rl:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Dc(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+G0(i.getShaderSource(e),o)}else return r}function H0(i,e){let t=V0(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function W0(i,e){let t;switch(e){case ad:t="Linear";break;case ld:t="Reinhard";break;case cd:t="OptimizedCineon";break;case hd:t="ACESFilmic";break;case dd:t="AgX";break;case ud:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function X0(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(tr).join(`
`)}function q0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(tr).join(`
`)}function Y0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Z0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),o=s.name,a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function tr(i){return i!==""}function Uc(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Nc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var J0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ra(i){return i.replace(J0,K0)}var $0=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function K0(i,e){let t=Ze[e];if(t===void 0){let n=$0.get(e);if(n!==void 0)t=Ze[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Ra(t)}var j0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Oc(i){return i.replace(j0,Q0)}function Q0(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Fc(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function eg(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===jc?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===nl?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Pn&&(e="SHADOWMAP_TYPE_VSM"),e}function tg(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ar:case lr:e="ENVMAP_TYPE_CUBE";break;case fo:e="ENVMAP_TYPE_CUBE_UV";break}return e}function ng(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===lr&&(e="ENVMAP_MODE_REFRACTION"),e}function ig(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Qc:e="ENVMAP_BLENDING_MULTIPLY";break;case sd:e="ENVMAP_BLENDING_MIX";break;case od:e="ENVMAP_BLENDING_ADD";break}return e}function rg(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function sg(i,e,t,n){let r=i.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=eg(t),c=tg(t),h=ng(t),u=ig(t),d=rg(t),f=t.isWebGL2?"":X0(t),g=q0(t),x=Y0(s),p=r.createProgram(),m,y,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(tr).join(`
`),m.length>0&&(m+=`
`),y=[f,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(tr).join(`
`),y.length>0&&(y+=`
`)):(m=[Fc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(tr).join(`
`),y=[f,Fc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Kn?"#define TONE_MAPPING":"",t.toneMapping!==Kn?Ze.tonemapping_pars_fragment:"",t.toneMapping!==Kn?W0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ze.colorspace_pars_fragment,H0("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(tr).join(`
`)),o=Ra(o),o=Uc(o,t),o=Nc(o,t),a=Ra(a),a=Uc(a,t),a=Nc(a,t),o=Oc(o),a=Oc(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,y=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===nc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===nc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);let S=_+m+o,E=_+y+a,v=Lc(r,r.VERTEX_SHADER,S),T=Lc(r,r.FRAGMENT_SHADER,E);r.attachShader(p,v),r.attachShader(p,T),t.index0AttributeName!==void 0?r.bindAttribLocation(p,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(p,0,"position"),r.linkProgram(p);function U(N){if(i.debug.checkShaderErrors){let q=r.getProgramInfoLog(p).trim(),D=r.getShaderInfoLog(v).trim(),O=r.getShaderInfoLog(T).trim(),k=!0,K=!0;if(r.getProgramParameter(p,r.LINK_STATUS)===!1)if(k=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,p,v,T);else{let $=Dc(r,v,"vertex"),Y=Dc(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(p,r.VALIDATE_STATUS)+`

Program Info Log: `+q+`
`+$+`
`+Y)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(D===""||O==="")&&(K=!1);K&&(N.diagnostics={runnable:k,programLog:q,vertexShader:{log:D,prefix:m},fragmentShader:{log:O,prefix:y}})}r.deleteShader(v),r.deleteShader(T),M=new sr(r,p),w=Z0(r,p)}let M;this.getUniforms=function(){return M===void 0&&U(this),M};let w;this.getAttributes=function(){return w===void 0&&U(this),w};let I=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=r.getProgramParameter(p,z0)),I},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=k0++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=v,this.fragmentShader=T,this}var og=0,Pa=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Ia(e),t.set(e,n)),n}},Ia=class{constructor(e){this.id=og++,this.code=e,this.usedTimes=0}};function ag(i,e,t,n,r,s,o){let a=new qs,l=new Pa,c=[],h=r.isWebGL2,u=r.logarithmicDepthBuffer,d=r.vertexTextures,f=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(M){return M===0?"uv":`uv${M}`}function p(M,w,I,N,q){let D=N.fog,O=q.geometry,k=M.isMeshStandardMaterial?N.environment:null,K=(M.isMeshStandardMaterial?t:e).get(M.envMap||k),$=K&&K.mapping===fo?K.image.height:null,Y=g[M.type];M.precision!==null&&(f=r.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));let ne=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Q=ne!==void 0?ne.length:0,ce=0;O.morphAttributes.position!==void 0&&(ce=1),O.morphAttributes.normal!==void 0&&(ce=2),O.morphAttributes.color!==void 0&&(ce=3);let z,ee,_e,Te;if(Y){let At=yn[Y];z=At.vertexShader,ee=At.fragmentShader}else z=M.vertexShader,ee=M.fragmentShader,l.update(M),_e=l.getVertexShaderID(M),Te=l.getFragmentShaderID(M);let Me=i.getRenderTarget(),Pe=q.isInstancedMesh===!0,Ue=q.isBatchedMesh===!0,we=!!M.map,ke=!!M.matcap,L=!!K,fe=!!M.aoMap,Z=!!M.lightMap,le=!!M.bumpMap,J=!!M.normalMap,Re=!!M.displacementMap,xe=!!M.emissiveMap,A=!!M.metalnessMap,b=!!M.roughnessMap,B=M.anisotropy>0,ae=M.clearcoat>0,re=M.iridescence>0,te=M.sheen>0,Ae=M.transmission>0,ge=B&&!!M.anisotropyMap,ye=ae&&!!M.clearcoatMap,Ne=ae&&!!M.clearcoatNormalMap,Ve=ae&&!!M.clearcoatRoughnessMap,se=re&&!!M.iridescenceMap,je=re&&!!M.iridescenceThicknessMap,Je=te&&!!M.sheenColorMap,Oe=te&&!!M.sheenRoughnessMap,Le=!!M.specularMap,Ee=!!M.specularColorMap,He=!!M.specularIntensityMap,it=Ae&&!!M.transmissionMap,oe=Ae&&!!M.thicknessMap,he=!!M.gradientMap,X=!!M.alphaMap,R=M.alphaTest>0,ie=!!M.alphaHash,ue=!!M.extensions,be=!!O.attributes.uv1,Se=!!O.attributes.uv2,Xe=!!O.attributes.uv3,nt=Kn;return M.toneMapped&&(Me===null||Me.isXRRenderTarget===!0)&&(nt=i.toneMapping),{isWebGL2:h,shaderID:Y,shaderType:M.type,shaderName:M.name,vertexShader:z,fragmentShader:ee,defines:M.defines,customVertexShaderID:_e,customFragmentShaderID:Te,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:Ue,instancing:Pe,instancingColor:Pe&&q.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:Me===null?i.outputColorSpace:Me.isXRRenderTarget===!0?Me.texture.colorSpace:On,map:we,matcap:ke,envMap:L,envMapMode:L&&K.mapping,envMapCubeUVHeight:$,aoMap:fe,lightMap:Z,bumpMap:le,normalMap:J,displacementMap:d&&Re,emissiveMap:xe,normalMapObjectSpace:J&&M.normalMapType===wd,normalMapTangentSpace:J&&M.normalMapType===ch,metalnessMap:A,roughnessMap:b,anisotropy:B,anisotropyMap:ge,clearcoat:ae,clearcoatMap:ye,clearcoatNormalMap:Ne,clearcoatRoughnessMap:Ve,iridescence:re,iridescenceMap:se,iridescenceThicknessMap:je,sheen:te,sheenColorMap:Je,sheenRoughnessMap:Oe,specularMap:Le,specularColorMap:Ee,specularIntensityMap:He,transmission:Ae,transmissionMap:it,thicknessMap:oe,gradientMap:he,opaque:M.transparent===!1&&M.blending===ir,alphaMap:X,alphaTest:R,alphaHash:ie,combine:M.combine,mapUv:we&&x(M.map.channel),aoMapUv:fe&&x(M.aoMap.channel),lightMapUv:Z&&x(M.lightMap.channel),bumpMapUv:le&&x(M.bumpMap.channel),normalMapUv:J&&x(M.normalMap.channel),displacementMapUv:Re&&x(M.displacementMap.channel),emissiveMapUv:xe&&x(M.emissiveMap.channel),metalnessMapUv:A&&x(M.metalnessMap.channel),roughnessMapUv:b&&x(M.roughnessMap.channel),anisotropyMapUv:ge&&x(M.anisotropyMap.channel),clearcoatMapUv:ye&&x(M.clearcoatMap.channel),clearcoatNormalMapUv:Ne&&x(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ve&&x(M.clearcoatRoughnessMap.channel),iridescenceMapUv:se&&x(M.iridescenceMap.channel),iridescenceThicknessMapUv:je&&x(M.iridescenceThicknessMap.channel),sheenColorMapUv:Je&&x(M.sheenColorMap.channel),sheenRoughnessMapUv:Oe&&x(M.sheenRoughnessMap.channel),specularMapUv:Le&&x(M.specularMap.channel),specularColorMapUv:Ee&&x(M.specularColorMap.channel),specularIntensityMapUv:He&&x(M.specularIntensityMap.channel),transmissionMapUv:it&&x(M.transmissionMap.channel),thicknessMapUv:oe&&x(M.thicknessMap.channel),alphaMapUv:X&&x(M.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(J||B),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,vertexUv1s:be,vertexUv2s:Se,vertexUv3s:Xe,pointsUvs:q.isPoints===!0&&!!O.attributes.uv&&(we||X),fog:!!D,useFog:M.fog===!0,fogExp2:D&&D.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:q.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:ce,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:nt,useLegacyLights:i._useLegacyLights,decodeVideoTexture:we&&M.map.isVideoTexture===!0&&ot.getTransfer(M.map.colorSpace)===ht,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Ln,flipSided:M.side===Nt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionDerivatives:ue&&M.extensions.derivatives===!0,extensionFragDepth:ue&&M.extensions.fragDepth===!0,extensionDrawBuffers:ue&&M.extensions.drawBuffers===!0,extensionShaderTextureLOD:ue&&M.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ue&&M.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()}}function m(M){let w=[];if(M.shaderID?w.push(M.shaderID):(w.push(M.customVertexShaderID),w.push(M.customFragmentShaderID)),M.defines!==void 0)for(let I in M.defines)w.push(I),w.push(M.defines[I]);return M.isRawShaderMaterial===!1&&(y(w,M),_(w,M),w.push(i.outputColorSpace)),w.push(M.customProgramCacheKey),w.join()}function y(M,w){M.push(w.precision),M.push(w.outputColorSpace),M.push(w.envMapMode),M.push(w.envMapCubeUVHeight),M.push(w.mapUv),M.push(w.alphaMapUv),M.push(w.lightMapUv),M.push(w.aoMapUv),M.push(w.bumpMapUv),M.push(w.normalMapUv),M.push(w.displacementMapUv),M.push(w.emissiveMapUv),M.push(w.metalnessMapUv),M.push(w.roughnessMapUv),M.push(w.anisotropyMapUv),M.push(w.clearcoatMapUv),M.push(w.clearcoatNormalMapUv),M.push(w.clearcoatRoughnessMapUv),M.push(w.iridescenceMapUv),M.push(w.iridescenceThicknessMapUv),M.push(w.sheenColorMapUv),M.push(w.sheenRoughnessMapUv),M.push(w.specularMapUv),M.push(w.specularColorMapUv),M.push(w.specularIntensityMapUv),M.push(w.transmissionMapUv),M.push(w.thicknessMapUv),M.push(w.combine),M.push(w.fogExp2),M.push(w.sizeAttenuation),M.push(w.morphTargetsCount),M.push(w.morphAttributeCount),M.push(w.numDirLights),M.push(w.numPointLights),M.push(w.numSpotLights),M.push(w.numSpotLightMaps),M.push(w.numHemiLights),M.push(w.numRectAreaLights),M.push(w.numDirLightShadows),M.push(w.numPointLightShadows),M.push(w.numSpotLightShadows),M.push(w.numSpotLightShadowsWithMaps),M.push(w.numLightProbes),M.push(w.shadowMapType),M.push(w.toneMapping),M.push(w.numClippingPlanes),M.push(w.numClipIntersection),M.push(w.depthPacking)}function _(M,w){a.disableAll(),w.isWebGL2&&a.enable(0),w.supportsVertexTextures&&a.enable(1),w.instancing&&a.enable(2),w.instancingColor&&a.enable(3),w.matcap&&a.enable(4),w.envMap&&a.enable(5),w.normalMapObjectSpace&&a.enable(6),w.normalMapTangentSpace&&a.enable(7),w.clearcoat&&a.enable(8),w.iridescence&&a.enable(9),w.alphaTest&&a.enable(10),w.vertexColors&&a.enable(11),w.vertexAlphas&&a.enable(12),w.vertexUv1s&&a.enable(13),w.vertexUv2s&&a.enable(14),w.vertexUv3s&&a.enable(15),w.vertexTangents&&a.enable(16),w.anisotropy&&a.enable(17),w.alphaHash&&a.enable(18),w.batching&&a.enable(19),M.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.skinning&&a.enable(4),w.morphTargets&&a.enable(5),w.morphNormals&&a.enable(6),w.morphColors&&a.enable(7),w.premultipliedAlpha&&a.enable(8),w.shadowMapEnabled&&a.enable(9),w.useLegacyLights&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),M.push(a.mask)}function S(M){let w=g[M.type],I;if(w){let N=yn[w];I=Jd.clone(N.uniforms)}else I=M.uniforms;return I}function E(M,w){let I;for(let N=0,q=c.length;N<q;N++){let D=c[N];if(D.cacheKey===w){I=D,++I.usedTimes;break}}return I===void 0&&(I=new sg(i,w,M,s),c.push(I)),I}function v(M){if(--M.usedTimes===0){let w=c.indexOf(M);c[w]=c[c.length-1],c.pop(),M.destroy()}}function T(M){l.remove(M)}function U(){l.dispose()}return{getParameters:p,getProgramCacheKey:m,getUniforms:S,acquireProgram:E,releaseProgram:v,releaseShaderCache:T,programs:c,dispose:U}}function lg(){let i=new WeakMap;function e(s){let o=i.get(s);return o===void 0&&(o={},i.set(s,o)),o}function t(s){i.delete(s)}function n(s,o,a){i.get(s)[o]=a}function r(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:r}}function cg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Bc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function zc(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(u,d,f,g,x,p){let m=i[e];return m===void 0?(m={id:u.id,object:u,geometry:d,material:f,groupOrder:g,renderOrder:u.renderOrder,z:x,group:p},i[e]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=f,m.groupOrder=g,m.renderOrder=u.renderOrder,m.z=x,m.group=p),e++,m}function a(u,d,f,g,x,p){let m=o(u,d,f,g,x,p);f.transmission>0?n.push(m):f.transparent===!0?r.push(m):t.push(m)}function l(u,d,f,g,x,p){let m=o(u,d,f,g,x,p);f.transmission>0?n.unshift(m):f.transparent===!0?r.unshift(m):t.unshift(m)}function c(u,d){t.length>1&&t.sort(u||cg),n.length>1&&n.sort(d||Bc),r.length>1&&r.sort(d||Bc)}function h(){for(let u=e,d=i.length;u<d;u++){let f=i[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:h,sort:c}}function hg(){let i=new WeakMap;function e(n,r){let s=i.get(n),o;return s===void 0?(o=new zc,i.set(n,[o])):r>=s.length?(o=new zc,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function ug(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ye};break;case"SpotLight":t={position:new P,direction:new P,color:new Ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ye,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ye,groundColor:new Ye};break;case"RectAreaLight":t={color:new Ye,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function dg(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var fg=0;function pg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function mg(i,e){let t=new ug,n=dg(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)r.probe.push(new P);let s=new P,o=new ct,a=new ct;function l(h,u){let d=0,f=0,g=0;for(let N=0;N<9;N++)r.probe[N].set(0,0,0);let x=0,p=0,m=0,y=0,_=0,S=0,E=0,v=0,T=0,U=0,M=0;h.sort(pg);let w=u===!0?Math.PI:1;for(let N=0,q=h.length;N<q;N++){let D=h[N],O=D.color,k=D.intensity,K=D.distance,$=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)d+=O.r*k*w,f+=O.g*k*w,g+=O.b*k*w;else if(D.isLightProbe){for(let Y=0;Y<9;Y++)r.probe[Y].addScaledVector(D.sh.coefficients[Y],k);M++}else if(D.isDirectionalLight){let Y=t.get(D);if(Y.color.copy(D.color).multiplyScalar(D.intensity*w),D.castShadow){let ne=D.shadow,Q=n.get(D);Q.shadowBias=ne.bias,Q.shadowNormalBias=ne.normalBias,Q.shadowRadius=ne.radius,Q.shadowMapSize=ne.mapSize,r.directionalShadow[x]=Q,r.directionalShadowMap[x]=$,r.directionalShadowMatrix[x]=D.shadow.matrix,S++}r.directional[x]=Y,x++}else if(D.isSpotLight){let Y=t.get(D);Y.position.setFromMatrixPosition(D.matrixWorld),Y.color.copy(O).multiplyScalar(k*w),Y.distance=K,Y.coneCos=Math.cos(D.angle),Y.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),Y.decay=D.decay,r.spot[m]=Y;let ne=D.shadow;if(D.map&&(r.spotLightMap[T]=D.map,T++,ne.updateMatrices(D),D.castShadow&&U++),r.spotLightMatrix[m]=ne.matrix,D.castShadow){let Q=n.get(D);Q.shadowBias=ne.bias,Q.shadowNormalBias=ne.normalBias,Q.shadowRadius=ne.radius,Q.shadowMapSize=ne.mapSize,r.spotShadow[m]=Q,r.spotShadowMap[m]=$,v++}m++}else if(D.isRectAreaLight){let Y=t.get(D);Y.color.copy(O).multiplyScalar(k),Y.halfWidth.set(D.width*.5,0,0),Y.halfHeight.set(0,D.height*.5,0),r.rectArea[y]=Y,y++}else if(D.isPointLight){let Y=t.get(D);if(Y.color.copy(D.color).multiplyScalar(D.intensity*w),Y.distance=D.distance,Y.decay=D.decay,D.castShadow){let ne=D.shadow,Q=n.get(D);Q.shadowBias=ne.bias,Q.shadowNormalBias=ne.normalBias,Q.shadowRadius=ne.radius,Q.shadowMapSize=ne.mapSize,Q.shadowCameraNear=ne.camera.near,Q.shadowCameraFar=ne.camera.far,r.pointShadow[p]=Q,r.pointShadowMap[p]=$,r.pointShadowMatrix[p]=D.shadow.matrix,E++}r.point[p]=Y,p++}else if(D.isHemisphereLight){let Y=t.get(D);Y.skyColor.copy(D.color).multiplyScalar(k*w),Y.groundColor.copy(D.groundColor).multiplyScalar(k*w),r.hemi[_]=Y,_++}}y>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=me.LTC_FLOAT_1,r.rectAreaLTC2=me.LTC_FLOAT_2):(r.rectAreaLTC1=me.LTC_HALF_1,r.rectAreaLTC2=me.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=me.LTC_FLOAT_1,r.rectAreaLTC2=me.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=me.LTC_HALF_1,r.rectAreaLTC2=me.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=d,r.ambient[1]=f,r.ambient[2]=g;let I=r.hash;(I.directionalLength!==x||I.pointLength!==p||I.spotLength!==m||I.rectAreaLength!==y||I.hemiLength!==_||I.numDirectionalShadows!==S||I.numPointShadows!==E||I.numSpotShadows!==v||I.numSpotMaps!==T||I.numLightProbes!==M)&&(r.directional.length=x,r.spot.length=m,r.rectArea.length=y,r.point.length=p,r.hemi.length=_,r.directionalShadow.length=S,r.directionalShadowMap.length=S,r.pointShadow.length=E,r.pointShadowMap.length=E,r.spotShadow.length=v,r.spotShadowMap.length=v,r.directionalShadowMatrix.length=S,r.pointShadowMatrix.length=E,r.spotLightMatrix.length=v+T-U,r.spotLightMap.length=T,r.numSpotLightShadowsWithMaps=U,r.numLightProbes=M,I.directionalLength=x,I.pointLength=p,I.spotLength=m,I.rectAreaLength=y,I.hemiLength=_,I.numDirectionalShadows=S,I.numPointShadows=E,I.numSpotShadows=v,I.numSpotMaps=T,I.numLightProbes=M,r.version=fg++)}function c(h,u){let d=0,f=0,g=0,x=0,p=0,m=u.matrixWorldInverse;for(let y=0,_=h.length;y<_;y++){let S=h[y];if(S.isDirectionalLight){let E=r.directional[d];E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),d++}else if(S.isSpotLight){let E=r.spot[g];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),g++}else if(S.isRectAreaLight){let E=r.rectArea[x];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),a.identity(),o.copy(S.matrixWorld),o.premultiply(m),a.extractRotation(o),E.halfWidth.set(S.width*.5,0,0),E.halfHeight.set(0,S.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(S.isPointLight){let E=r.point[f];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),f++}else if(S.isHemisphereLight){let E=r.hemi[p];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(m),p++}}}return{setup:l,setupView:c,state:r}}function kc(i,e){let t=new mg(i,e),n=[],r=[];function s(){n.length=0,r.length=0}function o(u){n.push(u)}function a(u){r.push(u)}function l(u){t.setup(n,u)}function c(u){t.setupView(n,u)}return{init:s,state:{lightsArray:n,shadowsArray:r,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function gg(i,e){let t=new WeakMap;function n(s,o=0){let a=t.get(s),l;return a===void 0?(l=new kc(i,e),t.set(s,[l])):o>=a.length?(l=new kc(i,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:n,dispose:r}}var La=class extends ii{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=bd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Da=class extends ii{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},_g=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xg=`uniform sampler2D shadow_pass;
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
}`;function yg(i,e,t){let n=new Or,r=new j,s=new j,o=new dt,a=new La({depthPacking:Sd}),l=new Da,c={},h=t.maxTextureSize,u={[ei]:Nt,[Nt]:ei,[Ln]:Ln},d=new nn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new j},radius:{value:4}},vertexShader:_g,fragmentShader:xg}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new Mt;g.setAttribute("position",new Ot(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new pe(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=jc;let m=this.type;this.render=function(v,T,U){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||v.length===0)return;let M=i.getRenderTarget(),w=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),N=i.state;N.setBlending($n),N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let q=m!==Pn&&this.type===Pn,D=m===Pn&&this.type!==Pn;for(let O=0,k=v.length;O<k;O++){let K=v[O],$=K.shadow;if($===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if($.autoUpdate===!1&&$.needsUpdate===!1)continue;r.copy($.mapSize);let Y=$.getFrameExtents();if(r.multiply(Y),s.copy($.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/Y.x),r.x=s.x*Y.x,$.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/Y.y),r.y=s.y*Y.y,$.mapSize.y=s.y)),$.map===null||q===!0||D===!0){let Q=this.type!==Pn?{minFilter:Gt,magFilter:Gt}:{};$.map!==null&&$.map.dispose(),$.map=new tn(r.x,r.y,Q),$.map.texture.name=K.name+".shadowMap",$.camera.updateProjectionMatrix()}i.setRenderTarget($.map),i.clear();let ne=$.getViewportCount();for(let Q=0;Q<ne;Q++){let ce=$.getViewport(Q);o.set(s.x*ce.x,s.y*ce.y,s.x*ce.z,s.y*ce.w),N.viewport(o),$.updateMatrices(K,Q),n=$.getFrustum(),S(T,U,$.camera,K,this.type)}$.isPointLightShadow!==!0&&this.type===Pn&&y($,U),$.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(M,w,I)};function y(v,T){let U=e.update(x);d.defines.VSM_SAMPLES!==v.blurSamples&&(d.defines.VSM_SAMPLES=v.blurSamples,f.defines.VSM_SAMPLES=v.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),v.mapPass===null&&(v.mapPass=new tn(r.x,r.y)),d.uniforms.shadow_pass.value=v.map.texture,d.uniforms.resolution.value=v.mapSize,d.uniforms.radius.value=v.radius,i.setRenderTarget(v.mapPass),i.clear(),i.renderBufferDirect(T,null,U,d,x,null),f.uniforms.shadow_pass.value=v.mapPass.texture,f.uniforms.resolution.value=v.mapSize,f.uniforms.radius.value=v.radius,i.setRenderTarget(v.map),i.clear(),i.renderBufferDirect(T,null,U,f,x,null)}function _(v,T,U,M){let w=null,I=U.isPointLight===!0?v.customDistanceMaterial:v.customDepthMaterial;if(I!==void 0)w=I;else if(w=U.isPointLight===!0?l:a,i.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){let N=w.uuid,q=T.uuid,D=c[N];D===void 0&&(D={},c[N]=D);let O=D[q];O===void 0&&(O=w.clone(),D[q]=O,T.addEventListener("dispose",E)),w=O}if(w.visible=T.visible,w.wireframe=T.wireframe,M===Pn?w.side=T.shadowSide!==null?T.shadowSide:T.side:w.side=T.shadowSide!==null?T.shadowSide:u[T.side],w.alphaMap=T.alphaMap,w.alphaTest=T.alphaTest,w.map=T.map,w.clipShadows=T.clipShadows,w.clippingPlanes=T.clippingPlanes,w.clipIntersection=T.clipIntersection,w.displacementMap=T.displacementMap,w.displacementScale=T.displacementScale,w.displacementBias=T.displacementBias,w.wireframeLinewidth=T.wireframeLinewidth,w.linewidth=T.linewidth,U.isPointLight===!0&&w.isMeshDistanceMaterial===!0){let N=i.properties.get(w);N.light=U}return w}function S(v,T,U,M,w){if(v.visible===!1)return;if(v.layers.test(T.layers)&&(v.isMesh||v.isLine||v.isPoints)&&(v.castShadow||v.receiveShadow&&w===Pn)&&(!v.frustumCulled||n.intersectsObject(v))){v.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,v.matrixWorld);let q=e.update(v),D=v.material;if(Array.isArray(D)){let O=q.groups;for(let k=0,K=O.length;k<K;k++){let $=O[k],Y=D[$.materialIndex];if(Y&&Y.visible){let ne=_(v,Y,M,w);v.onBeforeShadow(i,v,T,U,q,ne,$),i.renderBufferDirect(U,null,q,ne,v,$),v.onAfterShadow(i,v,T,U,q,ne,$)}}}else if(D.visible){let O=_(v,D,M,w);v.onBeforeShadow(i,v,T,U,q,O,null),i.renderBufferDirect(U,null,q,O,v,null),v.onAfterShadow(i,v,T,U,q,O,null)}}let N=v.children;for(let q=0,D=N.length;q<D;q++)S(N[q],T,U,M,w)}function E(v){v.target.removeEventListener("dispose",E);for(let U in c){let M=c[U],w=v.target.uuid;w in M&&(M[w].dispose(),delete M[w])}}}function vg(i,e,t){let n=t.isWebGL2;function r(){let R=!1,ie=new dt,ue=null,be=new dt(0,0,0,0);return{setMask:function(Se){ue!==Se&&!R&&(i.colorMask(Se,Se,Se,Se),ue=Se)},setLocked:function(Se){R=Se},setClear:function(Se,Xe,nt,at,At){At===!0&&(Se*=at,Xe*=at,nt*=at),ie.set(Se,Xe,nt,at),be.equals(ie)===!1&&(i.clearColor(Se,Xe,nt,at),be.copy(ie))},reset:function(){R=!1,ue=null,be.set(-1,0,0,0)}}}function s(){let R=!1,ie=null,ue=null,be=null;return{setTest:function(Se){Se?Ue(i.DEPTH_TEST):we(i.DEPTH_TEST)},setMask:function(Se){ie!==Se&&!R&&(i.depthMask(Se),ie=Se)},setFunc:function(Se){if(ue!==Se){switch(Se){case ju:i.depthFunc(i.NEVER);break;case Qu:i.depthFunc(i.ALWAYS);break;case ed:i.depthFunc(i.LESS);break;case Us:i.depthFunc(i.LEQUAL);break;case td:i.depthFunc(i.EQUAL);break;case nd:i.depthFunc(i.GEQUAL);break;case id:i.depthFunc(i.GREATER);break;case rd:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ue=Se}},setLocked:function(Se){R=Se},setClear:function(Se){be!==Se&&(i.clearDepth(Se),be=Se)},reset:function(){R=!1,ie=null,ue=null,be=null}}}function o(){let R=!1,ie=null,ue=null,be=null,Se=null,Xe=null,nt=null,at=null,At=null;return{setTest:function($e){R||($e?Ue(i.STENCIL_TEST):we(i.STENCIL_TEST))},setMask:function($e){ie!==$e&&!R&&(i.stencilMask($e),ie=$e)},setFunc:function($e,pt,Ht){(ue!==$e||be!==pt||Se!==Ht)&&(i.stencilFunc($e,pt,Ht),ue=$e,be=pt,Se=Ht)},setOp:function($e,pt,Ht){(Xe!==$e||nt!==pt||at!==Ht)&&(i.stencilOp($e,pt,Ht),Xe=$e,nt=pt,at=Ht)},setLocked:function($e){R=$e},setClear:function($e){At!==$e&&(i.clearStencil($e),At=$e)},reset:function(){R=!1,ie=null,ue=null,be=null,Se=null,Xe=null,nt=null,at=null,At=null}}}let a=new r,l=new s,c=new o,h=new WeakMap,u=new WeakMap,d={},f={},g=new WeakMap,x=[],p=null,m=!1,y=null,_=null,S=null,E=null,v=null,T=null,U=null,M=new Ye(0,0,0),w=0,I=!1,N=null,q=null,D=null,O=null,k=null,K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),$=!1,Y=0,ne=i.getParameter(i.VERSION);ne.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(ne)[1]),$=Y>=1):ne.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),$=Y>=2);let Q=null,ce={},z=i.getParameter(i.SCISSOR_BOX),ee=i.getParameter(i.VIEWPORT),_e=new dt().fromArray(z),Te=new dt().fromArray(ee);function Me(R,ie,ue,be){let Se=new Uint8Array(4),Xe=i.createTexture();i.bindTexture(R,Xe),i.texParameteri(R,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(R,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let nt=0;nt<ue;nt++)n&&(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)?i.texImage3D(ie,0,i.RGBA,1,1,be,0,i.RGBA,i.UNSIGNED_BYTE,Se):i.texImage2D(ie+nt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Se);return Xe}let Pe={};Pe[i.TEXTURE_2D]=Me(i.TEXTURE_2D,i.TEXTURE_2D,1),Pe[i.TEXTURE_CUBE_MAP]=Me(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Pe[i.TEXTURE_2D_ARRAY]=Me(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Pe[i.TEXTURE_3D]=Me(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),Ue(i.DEPTH_TEST),l.setFunc(Us),xe(!1),A(Ml),Ue(i.CULL_FACE),J($n);function Ue(R){d[R]!==!0&&(i.enable(R),d[R]=!0)}function we(R){d[R]!==!1&&(i.disable(R),d[R]=!1)}function ke(R,ie){return f[R]!==ie?(i.bindFramebuffer(R,ie),f[R]=ie,n&&(R===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=ie),R===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=ie)),!0):!1}function L(R,ie){let ue=x,be=!1;if(R)if(ue=g.get(ie),ue===void 0&&(ue=[],g.set(ie,ue)),R.isWebGLMultipleRenderTargets){let Se=R.texture;if(ue.length!==Se.length||ue[0]!==i.COLOR_ATTACHMENT0){for(let Xe=0,nt=Se.length;Xe<nt;Xe++)ue[Xe]=i.COLOR_ATTACHMENT0+Xe;ue.length=Se.length,be=!0}}else ue[0]!==i.COLOR_ATTACHMENT0&&(ue[0]=i.COLOR_ATTACHMENT0,be=!0);else ue[0]!==i.BACK&&(ue[0]=i.BACK,be=!0);be&&(t.isWebGL2?i.drawBuffers(ue):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(ue))}function fe(R){return p!==R?(i.useProgram(R),p=R,!0):!1}let Z={[pi]:i.FUNC_ADD,[Fu]:i.FUNC_SUBTRACT,[Bu]:i.FUNC_REVERSE_SUBTRACT};if(n)Z[wl]=i.MIN,Z[El]=i.MAX;else{let R=e.get("EXT_blend_minmax");R!==null&&(Z[wl]=R.MIN_EXT,Z[El]=R.MAX_EXT)}let le={[zu]:i.ZERO,[ku]:i.ONE,[Gu]:i.SRC_COLOR,[da]:i.SRC_ALPHA,[Yu]:i.SRC_ALPHA_SATURATE,[Xu]:i.DST_COLOR,[Hu]:i.DST_ALPHA,[Vu]:i.ONE_MINUS_SRC_COLOR,[fa]:i.ONE_MINUS_SRC_ALPHA,[qu]:i.ONE_MINUS_DST_COLOR,[Wu]:i.ONE_MINUS_DST_ALPHA,[Zu]:i.CONSTANT_COLOR,[Ju]:i.ONE_MINUS_CONSTANT_COLOR,[$u]:i.CONSTANT_ALPHA,[Ku]:i.ONE_MINUS_CONSTANT_ALPHA};function J(R,ie,ue,be,Se,Xe,nt,at,At,$e){if(R===$n){m===!0&&(we(i.BLEND),m=!1);return}if(m===!1&&(Ue(i.BLEND),m=!0),R!==Ou){if(R!==y||$e!==I){if((_!==pi||v!==pi)&&(i.blendEquation(i.FUNC_ADD),_=pi,v=pi),$e)switch(R){case ir:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case or:i.blendFunc(i.ONE,i.ONE);break;case bl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Sl:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}else switch(R){case ir:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case or:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case bl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Sl:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}S=null,E=null,T=null,U=null,M.set(0,0,0),w=0,y=R,I=$e}return}Se=Se||ie,Xe=Xe||ue,nt=nt||be,(ie!==_||Se!==v)&&(i.blendEquationSeparate(Z[ie],Z[Se]),_=ie,v=Se),(ue!==S||be!==E||Xe!==T||nt!==U)&&(i.blendFuncSeparate(le[ue],le[be],le[Xe],le[nt]),S=ue,E=be,T=Xe,U=nt),(at.equals(M)===!1||At!==w)&&(i.blendColor(at.r,at.g,at.b,At),M.copy(at),w=At),y=R,I=!1}function Re(R,ie){R.side===Ln?we(i.CULL_FACE):Ue(i.CULL_FACE);let ue=R.side===Nt;ie&&(ue=!ue),xe(ue),R.blending===ir&&R.transparent===!1?J($n):J(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),l.setFunc(R.depthFunc),l.setTest(R.depthTest),l.setMask(R.depthWrite),a.setMask(R.colorWrite);let be=R.stencilWrite;c.setTest(be),be&&(c.setMask(R.stencilWriteMask),c.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),c.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),B(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?Ue(i.SAMPLE_ALPHA_TO_COVERAGE):we(i.SAMPLE_ALPHA_TO_COVERAGE)}function xe(R){N!==R&&(R?i.frontFace(i.CW):i.frontFace(i.CCW),N=R)}function A(R){R!==Uu?(Ue(i.CULL_FACE),R!==q&&(R===Ml?i.cullFace(i.BACK):R===Nu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):we(i.CULL_FACE),q=R}function b(R){R!==D&&($&&i.lineWidth(R),D=R)}function B(R,ie,ue){R?(Ue(i.POLYGON_OFFSET_FILL),(O!==ie||k!==ue)&&(i.polygonOffset(ie,ue),O=ie,k=ue)):we(i.POLYGON_OFFSET_FILL)}function ae(R){R?Ue(i.SCISSOR_TEST):we(i.SCISSOR_TEST)}function re(R){R===void 0&&(R=i.TEXTURE0+K-1),Q!==R&&(i.activeTexture(R),Q=R)}function te(R,ie,ue){ue===void 0&&(Q===null?ue=i.TEXTURE0+K-1:ue=Q);let be=ce[ue];be===void 0&&(be={type:void 0,texture:void 0},ce[ue]=be),(be.type!==R||be.texture!==ie)&&(Q!==ue&&(i.activeTexture(ue),Q=ue),i.bindTexture(R,ie||Pe[R]),be.type=R,be.texture=ie)}function Ae(){let R=ce[Q];R!==void 0&&R.type!==void 0&&(i.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function ge(){try{i.compressedTexImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ye(){try{i.compressedTexImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Ne(){try{i.texSubImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Ve(){try{i.texSubImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function se(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function je(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Je(){try{i.texStorage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Oe(){try{i.texStorage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Le(){try{i.texImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Ee(){try{i.texImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function He(R){_e.equals(R)===!1&&(i.scissor(R.x,R.y,R.z,R.w),_e.copy(R))}function it(R){Te.equals(R)===!1&&(i.viewport(R.x,R.y,R.z,R.w),Te.copy(R))}function oe(R,ie){let ue=u.get(ie);ue===void 0&&(ue=new WeakMap,u.set(ie,ue));let be=ue.get(R);be===void 0&&(be=i.getUniformBlockIndex(ie,R.name),ue.set(R,be))}function he(R,ie){let be=u.get(ie).get(R);h.get(ie)!==be&&(i.uniformBlockBinding(ie,be,R.__bindingPointIndex),h.set(ie,be))}function X(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},Q=null,ce={},f={},g=new WeakMap,x=[],p=null,m=!1,y=null,_=null,S=null,E=null,v=null,T=null,U=null,M=new Ye(0,0,0),w=0,I=!1,N=null,q=null,D=null,O=null,k=null,_e.set(0,0,i.canvas.width,i.canvas.height),Te.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:Ue,disable:we,bindFramebuffer:ke,drawBuffers:L,useProgram:fe,setBlending:J,setMaterial:Re,setFlipSided:xe,setCullFace:A,setLineWidth:b,setPolygonOffset:B,setScissorTest:ae,activeTexture:re,bindTexture:te,unbindTexture:Ae,compressedTexImage2D:ge,compressedTexImage3D:ye,texImage2D:Le,texImage3D:Ee,updateUBOMapping:oe,uniformBlockBinding:he,texStorage2D:Je,texStorage3D:Oe,texSubImage2D:Ne,texSubImage3D:Ve,compressedTexSubImage2D:se,compressedTexSubImage3D:je,scissor:He,viewport:it,reset:X}}function Mg(i,e,t,n,r,s,o){let a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap,u,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,b){return f?new OffscreenCanvas(A,b):Gs("canvas")}function x(A,b,B,ae){let re=1;if((A.width>ae||A.height>ae)&&(re=ae/Math.max(A.width,A.height)),re<1||b===!0)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap){let te=b?va:Math.floor,Ae=te(re*A.width),ge=te(re*A.height);u===void 0&&(u=g(Ae,ge));let ye=B?g(Ae,ge):u;return ye.width=Ae,ye.height=ge,ye.getContext("2d").drawImage(A,0,0,Ae,ge),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+A.width+"x"+A.height+") to ("+Ae+"x"+ge+")."),ye}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+A.width+"x"+A.height+")."),A;return A}function p(A){return ic(A.width)&&ic(A.height)}function m(A){return a?!1:A.wrapS!==Ut||A.wrapT!==Ut||A.minFilter!==Gt&&A.minFilter!==jt}function y(A,b){return A.generateMipmaps&&b&&A.minFilter!==Gt&&A.minFilter!==jt}function _(A){i.generateMipmap(A)}function S(A,b,B,ae,re=!1){if(a===!1)return b;if(A!==null){if(i[A]!==void 0)return i[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let te=b;if(b===i.RED&&(B===i.FLOAT&&(te=i.R32F),B===i.HALF_FLOAT&&(te=i.R16F),B===i.UNSIGNED_BYTE&&(te=i.R8)),b===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(te=i.R8UI),B===i.UNSIGNED_SHORT&&(te=i.R16UI),B===i.UNSIGNED_INT&&(te=i.R32UI),B===i.BYTE&&(te=i.R8I),B===i.SHORT&&(te=i.R16I),B===i.INT&&(te=i.R32I)),b===i.RG&&(B===i.FLOAT&&(te=i.RG32F),B===i.HALF_FLOAT&&(te=i.RG16F),B===i.UNSIGNED_BYTE&&(te=i.RG8)),b===i.RGBA){let Ae=re?Fs:ot.getTransfer(ae);B===i.FLOAT&&(te=i.RGBA32F),B===i.HALF_FLOAT&&(te=i.RGBA16F),B===i.UNSIGNED_BYTE&&(te=Ae===ht?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(te=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(te=i.RGB5_A1)}return(te===i.R16F||te===i.R32F||te===i.RG16F||te===i.RG32F||te===i.RGBA16F||te===i.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function E(A,b,B){return y(A,B)===!0||A.isFramebufferTexture&&A.minFilter!==Gt&&A.minFilter!==jt?Math.log2(Math.max(b.width,b.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?b.mipmaps.length:1}function v(A){return A===Gt||A===Tl||A===Ro?i.NEAREST:i.LINEAR}function T(A){let b=A.target;b.removeEventListener("dispose",T),M(b),b.isVideoTexture&&h.delete(b)}function U(A){let b=A.target;b.removeEventListener("dispose",U),I(b)}function M(A){let b=n.get(A);if(b.__webglInit===void 0)return;let B=A.source,ae=d.get(B);if(ae){let re=ae[b.__cacheKey];re.usedTimes--,re.usedTimes===0&&w(A),Object.keys(ae).length===0&&d.delete(B)}n.remove(A)}function w(A){let b=n.get(A);i.deleteTexture(b.__webglTexture);let B=A.source,ae=d.get(B);delete ae[b.__cacheKey],o.memory.textures--}function I(A){let b=A.texture,B=n.get(A),ae=n.get(b);if(ae.__webglTexture!==void 0&&(i.deleteTexture(ae.__webglTexture),o.memory.textures--),A.depthTexture&&A.depthTexture.dispose(),A.isWebGLCubeRenderTarget)for(let re=0;re<6;re++){if(Array.isArray(B.__webglFramebuffer[re]))for(let te=0;te<B.__webglFramebuffer[re].length;te++)i.deleteFramebuffer(B.__webglFramebuffer[re][te]);else i.deleteFramebuffer(B.__webglFramebuffer[re]);B.__webglDepthbuffer&&i.deleteRenderbuffer(B.__webglDepthbuffer[re])}else{if(Array.isArray(B.__webglFramebuffer))for(let re=0;re<B.__webglFramebuffer.length;re++)i.deleteFramebuffer(B.__webglFramebuffer[re]);else i.deleteFramebuffer(B.__webglFramebuffer);if(B.__webglDepthbuffer&&i.deleteRenderbuffer(B.__webglDepthbuffer),B.__webglMultisampledFramebuffer&&i.deleteFramebuffer(B.__webglMultisampledFramebuffer),B.__webglColorRenderbuffer)for(let re=0;re<B.__webglColorRenderbuffer.length;re++)B.__webglColorRenderbuffer[re]&&i.deleteRenderbuffer(B.__webglColorRenderbuffer[re]);B.__webglDepthRenderbuffer&&i.deleteRenderbuffer(B.__webglDepthRenderbuffer)}if(A.isWebGLMultipleRenderTargets)for(let re=0,te=b.length;re<te;re++){let Ae=n.get(b[re]);Ae.__webglTexture&&(i.deleteTexture(Ae.__webglTexture),o.memory.textures--),n.remove(b[re])}n.remove(b),n.remove(A)}let N=0;function q(){N=0}function D(){let A=N;return A>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+r.maxTextures),N+=1,A}function O(A){let b=[];return b.push(A.wrapS),b.push(A.wrapT),b.push(A.wrapR||0),b.push(A.magFilter),b.push(A.minFilter),b.push(A.anisotropy),b.push(A.internalFormat),b.push(A.format),b.push(A.type),b.push(A.generateMipmaps),b.push(A.premultiplyAlpha),b.push(A.flipY),b.push(A.unpackAlignment),b.push(A.colorSpace),b.join()}function k(A,b){let B=n.get(A);if(A.isVideoTexture&&Re(A),A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){let ae=A.image;if(ae===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ae.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{_e(B,A,b);return}}t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+b)}function K(A,b){let B=n.get(A);if(A.version>0&&B.__version!==A.version){_e(B,A,b);return}t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+b)}function $(A,b){let B=n.get(A);if(A.version>0&&B.__version!==A.version){_e(B,A,b);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+b)}function Y(A,b){let B=n.get(A);if(A.version>0&&B.__version!==A.version){Te(B,A,b);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+b)}let ne={[cr]:i.REPEAT,[Ut]:i.CLAMP_TO_EDGE,[ga]:i.MIRRORED_REPEAT},Q={[Gt]:i.NEAREST,[Tl]:i.NEAREST_MIPMAP_NEAREST,[Ro]:i.NEAREST_MIPMAP_LINEAR,[jt]:i.LINEAR,[fd]:i.LINEAR_MIPMAP_NEAREST,[Nr]:i.LINEAR_MIPMAP_LINEAR},ce={[Ed]:i.NEVER,[Id]:i.ALWAYS,[Td]:i.LESS,[hh]:i.LEQUAL,[Ad]:i.EQUAL,[Pd]:i.GEQUAL,[Cd]:i.GREATER,[Rd]:i.NOTEQUAL};function z(A,b,B){if(B?(i.texParameteri(A,i.TEXTURE_WRAP_S,ne[b.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,ne[b.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,ne[b.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,Q[b.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,Q[b.minFilter])):(i.texParameteri(A,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(A,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(b.wrapS!==Ut||b.wrapT!==Ut)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(A,i.TEXTURE_MAG_FILTER,v(b.magFilter)),i.texParameteri(A,i.TEXTURE_MIN_FILTER,v(b.minFilter)),b.minFilter!==Gt&&b.minFilter!==jt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),b.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,ce[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let ae=e.get("EXT_texture_filter_anisotropic");if(b.magFilter===Gt||b.minFilter!==Ro&&b.minFilter!==Nr||b.type===Jn&&e.has("OES_texture_float_linear")===!1||a===!1&&b.type===vi&&e.has("OES_texture_half_float_linear")===!1)return;(b.anisotropy>1||n.get(b).__currentAnisotropy)&&(i.texParameterf(A,ae.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,r.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy)}}function ee(A,b){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,b.addEventListener("dispose",T));let ae=b.source,re=d.get(ae);re===void 0&&(re={},d.set(ae,re));let te=O(b);if(te!==A.__cacheKey){re[te]===void 0&&(re[te]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),re[te].usedTimes++;let Ae=re[A.__cacheKey];Ae!==void 0&&(re[A.__cacheKey].usedTimes--,Ae.usedTimes===0&&w(b)),A.__cacheKey=te,A.__webglTexture=re[te].texture}return B}function _e(A,b,B){let ae=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(ae=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(ae=i.TEXTURE_3D);let re=ee(A,b),te=b.source;t.bindTexture(ae,A.__webglTexture,i.TEXTURE0+B);let Ae=n.get(te);if(te.version!==Ae.__version||re===!0){t.activeTexture(i.TEXTURE0+B);let ge=ot.getPrimaries(ot.workingColorSpace),ye=b.colorSpace===Qt?null:ot.getPrimaries(b.colorSpace),Ne=b.colorSpace===Qt||ge===ye?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ne);let Ve=m(b)&&p(b.image)===!1,se=x(b.image,Ve,!1,r.maxTextureSize);se=xe(b,se);let je=p(se)||a,Je=s.convert(b.format,b.colorSpace),Oe=s.convert(b.type),Le=S(b.internalFormat,Je,Oe,b.colorSpace,b.isVideoTexture);z(ae,b,je);let Ee,He=b.mipmaps,it=a&&b.isVideoTexture!==!0&&Le!==ah,oe=Ae.__version===void 0||re===!0,he=E(b,se,je);if(b.isDepthTexture)Le=i.DEPTH_COMPONENT,a?b.type===Jn?Le=i.DEPTH_COMPONENT32F:b.type===Zn?Le=i.DEPTH_COMPONENT24:b.type===_i?Le=i.DEPTH24_STENCIL8:Le=i.DEPTH_COMPONENT16:b.type===Jn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),b.format===xi&&Le===i.DEPTH_COMPONENT&&b.type!==il&&b.type!==Zn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),b.type=Zn,Oe=s.convert(b.type)),b.format===hr&&Le===i.DEPTH_COMPONENT&&(Le=i.DEPTH_STENCIL,b.type!==_i&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),b.type=_i,Oe=s.convert(b.type))),oe&&(it?t.texStorage2D(i.TEXTURE_2D,1,Le,se.width,se.height):t.texImage2D(i.TEXTURE_2D,0,Le,se.width,se.height,0,Je,Oe,null));else if(b.isDataTexture)if(He.length>0&&je){it&&oe&&t.texStorage2D(i.TEXTURE_2D,he,Le,He[0].width,He[0].height);for(let X=0,R=He.length;X<R;X++)Ee=He[X],it?t.texSubImage2D(i.TEXTURE_2D,X,0,0,Ee.width,Ee.height,Je,Oe,Ee.data):t.texImage2D(i.TEXTURE_2D,X,Le,Ee.width,Ee.height,0,Je,Oe,Ee.data);b.generateMipmaps=!1}else it?(oe&&t.texStorage2D(i.TEXTURE_2D,he,Le,se.width,se.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,se.width,se.height,Je,Oe,se.data)):t.texImage2D(i.TEXTURE_2D,0,Le,se.width,se.height,0,Je,Oe,se.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){it&&oe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,he,Le,He[0].width,He[0].height,se.depth);for(let X=0,R=He.length;X<R;X++)Ee=He[X],b.format!==dn?Je!==null?it?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,Ee.width,Ee.height,se.depth,Je,Ee.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,X,Le,Ee.width,Ee.height,se.depth,0,Ee.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):it?t.texSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,Ee.width,Ee.height,se.depth,Je,Oe,Ee.data):t.texImage3D(i.TEXTURE_2D_ARRAY,X,Le,Ee.width,Ee.height,se.depth,0,Je,Oe,Ee.data)}else{it&&oe&&t.texStorage2D(i.TEXTURE_2D,he,Le,He[0].width,He[0].height);for(let X=0,R=He.length;X<R;X++)Ee=He[X],b.format!==dn?Je!==null?it?t.compressedTexSubImage2D(i.TEXTURE_2D,X,0,0,Ee.width,Ee.height,Je,Ee.data):t.compressedTexImage2D(i.TEXTURE_2D,X,Le,Ee.width,Ee.height,0,Ee.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):it?t.texSubImage2D(i.TEXTURE_2D,X,0,0,Ee.width,Ee.height,Je,Oe,Ee.data):t.texImage2D(i.TEXTURE_2D,X,Le,Ee.width,Ee.height,0,Je,Oe,Ee.data)}else if(b.isDataArrayTexture)it?(oe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,he,Le,se.width,se.height,se.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,Je,Oe,se.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,Le,se.width,se.height,se.depth,0,Je,Oe,se.data);else if(b.isData3DTexture)it?(oe&&t.texStorage3D(i.TEXTURE_3D,he,Le,se.width,se.height,se.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,Je,Oe,se.data)):t.texImage3D(i.TEXTURE_3D,0,Le,se.width,se.height,se.depth,0,Je,Oe,se.data);else if(b.isFramebufferTexture){if(oe)if(it)t.texStorage2D(i.TEXTURE_2D,he,Le,se.width,se.height);else{let X=se.width,R=se.height;for(let ie=0;ie<he;ie++)t.texImage2D(i.TEXTURE_2D,ie,Le,X,R,0,Je,Oe,null),X>>=1,R>>=1}}else if(He.length>0&&je){it&&oe&&t.texStorage2D(i.TEXTURE_2D,he,Le,He[0].width,He[0].height);for(let X=0,R=He.length;X<R;X++)Ee=He[X],it?t.texSubImage2D(i.TEXTURE_2D,X,0,0,Je,Oe,Ee):t.texImage2D(i.TEXTURE_2D,X,Le,Je,Oe,Ee);b.generateMipmaps=!1}else it?(oe&&t.texStorage2D(i.TEXTURE_2D,he,Le,se.width,se.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,Je,Oe,se)):t.texImage2D(i.TEXTURE_2D,0,Le,Je,Oe,se);y(b,je)&&_(ae),Ae.__version=te.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function Te(A,b,B){if(b.image.length!==6)return;let ae=ee(A,b),re=b.source;t.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+B);let te=n.get(re);if(re.version!==te.__version||ae===!0){t.activeTexture(i.TEXTURE0+B);let Ae=ot.getPrimaries(ot.workingColorSpace),ge=b.colorSpace===Qt?null:ot.getPrimaries(b.colorSpace),ye=b.colorSpace===Qt||Ae===ge?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let Ne=b.isCompressedTexture||b.image[0].isCompressedTexture,Ve=b.image[0]&&b.image[0].isDataTexture,se=[];for(let X=0;X<6;X++)!Ne&&!Ve?se[X]=x(b.image[X],!1,!0,r.maxCubemapSize):se[X]=Ve?b.image[X].image:b.image[X],se[X]=xe(b,se[X]);let je=se[0],Je=p(je)||a,Oe=s.convert(b.format,b.colorSpace),Le=s.convert(b.type),Ee=S(b.internalFormat,Oe,Le,b.colorSpace),He=a&&b.isVideoTexture!==!0,it=te.__version===void 0||ae===!0,oe=E(b,je,Je);z(i.TEXTURE_CUBE_MAP,b,Je);let he;if(Ne){He&&it&&t.texStorage2D(i.TEXTURE_CUBE_MAP,oe,Ee,je.width,je.height);for(let X=0;X<6;X++){he=se[X].mipmaps;for(let R=0;R<he.length;R++){let ie=he[R];b.format!==dn?Oe!==null?He?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,R,0,0,ie.width,ie.height,Oe,ie.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,R,Ee,ie.width,ie.height,0,ie.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):He?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,R,0,0,ie.width,ie.height,Oe,Le,ie.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,R,Ee,ie.width,ie.height,0,Oe,Le,ie.data)}}}else{he=b.mipmaps,He&&it&&(he.length>0&&oe++,t.texStorage2D(i.TEXTURE_CUBE_MAP,oe,Ee,se[0].width,se[0].height));for(let X=0;X<6;X++)if(Ve){He?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,se[X].width,se[X].height,Oe,Le,se[X].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,Ee,se[X].width,se[X].height,0,Oe,Le,se[X].data);for(let R=0;R<he.length;R++){let ue=he[R].image[X].image;He?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,R+1,0,0,ue.width,ue.height,Oe,Le,ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,R+1,Ee,ue.width,ue.height,0,Oe,Le,ue.data)}}else{He?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,Oe,Le,se[X]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,Ee,Oe,Le,se[X]);for(let R=0;R<he.length;R++){let ie=he[R];He?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,R+1,0,0,Oe,Le,ie.image[X]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+X,R+1,Ee,Oe,Le,ie.image[X])}}}y(b,Je)&&_(i.TEXTURE_CUBE_MAP),te.__version=re.version,b.onUpdate&&b.onUpdate(b)}A.__version=b.version}function Me(A,b,B,ae,re,te){let Ae=s.convert(B.format,B.colorSpace),ge=s.convert(B.type),ye=S(B.internalFormat,Ae,ge,B.colorSpace);if(!n.get(b).__hasExternalTextures){let Ve=Math.max(1,b.width>>te),se=Math.max(1,b.height>>te);re===i.TEXTURE_3D||re===i.TEXTURE_2D_ARRAY?t.texImage3D(re,te,ye,Ve,se,b.depth,0,Ae,ge,null):t.texImage2D(re,te,ye,Ve,se,0,Ae,ge,null)}t.bindFramebuffer(i.FRAMEBUFFER,A),J(b)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ae,re,n.get(B).__webglTexture,0,le(b)):(re===i.TEXTURE_2D||re>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ae,re,n.get(B).__webglTexture,te),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Pe(A,b,B){if(i.bindRenderbuffer(i.RENDERBUFFER,A),b.depthBuffer&&!b.stencilBuffer){let ae=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(B||J(b)){let re=b.depthTexture;re&&re.isDepthTexture&&(re.type===Jn?ae=i.DEPTH_COMPONENT32F:re.type===Zn&&(ae=i.DEPTH_COMPONENT24));let te=le(b);J(b)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,te,ae,b.width,b.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,te,ae,b.width,b.height)}else i.renderbufferStorage(i.RENDERBUFFER,ae,b.width,b.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,A)}else if(b.depthBuffer&&b.stencilBuffer){let ae=le(b);B&&J(b)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,i.DEPTH24_STENCIL8,b.width,b.height):J(b)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ae,i.DEPTH24_STENCIL8,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,A)}else{let ae=b.isWebGLMultipleRenderTargets===!0?b.texture:[b.texture];for(let re=0;re<ae.length;re++){let te=ae[re],Ae=s.convert(te.format,te.colorSpace),ge=s.convert(te.type),ye=S(te.internalFormat,Ae,ge,te.colorSpace),Ne=le(b);B&&J(b)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ne,ye,b.width,b.height):J(b)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ne,ye,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,ye,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ue(A,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,A),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(b.depthTexture).__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),k(b.depthTexture,0);let ae=n.get(b.depthTexture).__webglTexture,re=le(b);if(b.depthTexture.format===xi)J(b)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ae,0,re):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ae,0);else if(b.depthTexture.format===hr)J(b)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ae,0,re):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ae,0);else throw new Error("Unknown depthTexture format")}function we(A){let b=n.get(A),B=A.isWebGLCubeRenderTarget===!0;if(A.depthTexture&&!b.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");Ue(b.__webglFramebuffer,A)}else if(B){b.__webglDepthbuffer=[];for(let ae=0;ae<6;ae++)t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[ae]),b.__webglDepthbuffer[ae]=i.createRenderbuffer(),Pe(b.__webglDepthbuffer[ae],A,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer=i.createRenderbuffer(),Pe(b.__webglDepthbuffer,A,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function ke(A,b,B){let ae=n.get(A);b!==void 0&&Me(ae.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&we(A)}function L(A){let b=A.texture,B=n.get(A),ae=n.get(b);A.addEventListener("dispose",U),A.isWebGLMultipleRenderTargets!==!0&&(ae.__webglTexture===void 0&&(ae.__webglTexture=i.createTexture()),ae.__version=b.version,o.memory.textures++);let re=A.isWebGLCubeRenderTarget===!0,te=A.isWebGLMultipleRenderTargets===!0,Ae=p(A)||a;if(re){B.__webglFramebuffer=[];for(let ge=0;ge<6;ge++)if(a&&b.mipmaps&&b.mipmaps.length>0){B.__webglFramebuffer[ge]=[];for(let ye=0;ye<b.mipmaps.length;ye++)B.__webglFramebuffer[ge][ye]=i.createFramebuffer()}else B.__webglFramebuffer[ge]=i.createFramebuffer()}else{if(a&&b.mipmaps&&b.mipmaps.length>0){B.__webglFramebuffer=[];for(let ge=0;ge<b.mipmaps.length;ge++)B.__webglFramebuffer[ge]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(te)if(r.drawBuffers){let ge=A.texture;for(let ye=0,Ne=ge.length;ye<Ne;ye++){let Ve=n.get(ge[ye]);Ve.__webglTexture===void 0&&(Ve.__webglTexture=i.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&A.samples>0&&J(A)===!1){let ge=te?b:[b];B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ye=0;ye<ge.length;ye++){let Ne=ge[ye];B.__webglColorRenderbuffer[ye]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[ye]);let Ve=s.convert(Ne.format,Ne.colorSpace),se=s.convert(Ne.type),je=S(Ne.internalFormat,Ve,se,Ne.colorSpace,A.isXRRenderTarget===!0),Je=le(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Je,je,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,B.__webglColorRenderbuffer[ye])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),Pe(B.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(re){t.bindTexture(i.TEXTURE_CUBE_MAP,ae.__webglTexture),z(i.TEXTURE_CUBE_MAP,b,Ae);for(let ge=0;ge<6;ge++)if(a&&b.mipmaps&&b.mipmaps.length>0)for(let ye=0;ye<b.mipmaps.length;ye++)Me(B.__webglFramebuffer[ge][ye],A,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,ye);else Me(B.__webglFramebuffer[ge],A,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0);y(b,Ae)&&_(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(te){let ge=A.texture;for(let ye=0,Ne=ge.length;ye<Ne;ye++){let Ve=ge[ye],se=n.get(Ve);t.bindTexture(i.TEXTURE_2D,se.__webglTexture),z(i.TEXTURE_2D,Ve,Ae),Me(B.__webglFramebuffer,A,Ve,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,0),y(Ve,Ae)&&_(i.TEXTURE_2D)}t.unbindTexture()}else{let ge=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(a?ge=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ge,ae.__webglTexture),z(ge,b,Ae),a&&b.mipmaps&&b.mipmaps.length>0)for(let ye=0;ye<b.mipmaps.length;ye++)Me(B.__webglFramebuffer[ye],A,b,i.COLOR_ATTACHMENT0,ge,ye);else Me(B.__webglFramebuffer,A,b,i.COLOR_ATTACHMENT0,ge,0);y(b,Ae)&&_(ge),t.unbindTexture()}A.depthBuffer&&we(A)}function fe(A){let b=p(A)||a,B=A.isWebGLMultipleRenderTargets===!0?A.texture:[A.texture];for(let ae=0,re=B.length;ae<re;ae++){let te=B[ae];if(y(te,b)){let Ae=A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,ge=n.get(te).__webglTexture;t.bindTexture(Ae,ge),_(Ae),t.unbindTexture()}}}function Z(A){if(a&&A.samples>0&&J(A)===!1){let b=A.isWebGLMultipleRenderTargets?A.texture:[A.texture],B=A.width,ae=A.height,re=i.COLOR_BUFFER_BIT,te=[],Ae=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ge=n.get(A),ye=A.isWebGLMultipleRenderTargets===!0;if(ye)for(let Ne=0;Ne<b.length;Ne++)t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let Ne=0;Ne<b.length;Ne++){te.push(i.COLOR_ATTACHMENT0+Ne),A.depthBuffer&&te.push(Ae);let Ve=ge.__ignoreDepthValues!==void 0?ge.__ignoreDepthValues:!1;if(Ve===!1&&(A.depthBuffer&&(re|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&(re|=i.STENCIL_BUFFER_BIT)),ye&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ge.__webglColorRenderbuffer[Ne]),Ve===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[Ae]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[Ae])),ye){let se=n.get(b[Ne]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,se,0)}i.blitFramebuffer(0,0,B,ae,0,0,B,ae,re,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,te)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ye)for(let Ne=0;Ne<b.length;Ne++){t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.RENDERBUFFER,ge.__webglColorRenderbuffer[Ne]);let Ve=n.get(b[Ne]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.TEXTURE_2D,Ve,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}}function le(A){return Math.min(r.maxSamples,A.samples)}function J(A){let b=n.get(A);return a&&A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Re(A){let b=o.render.frame;h.get(A)!==b&&(h.set(A,b),A.update())}function xe(A,b){let B=A.colorSpace,ae=A.format,re=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||A.format===xa||B!==On&&B!==Qt&&(ot.getTransfer(B)===ht?a===!1?e.has("EXT_sRGB")===!0&&ae===dn?(A.format=xa,A.minFilter=jt,A.generateMipmaps=!1):b=Vs.sRGBToLinear(b):(ae!==dn||re!==jn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),b}this.allocateTextureUnit=D,this.resetTextureUnits=q,this.setTexture2D=k,this.setTexture2DArray=K,this.setTexture3D=$,this.setTextureCube=Y,this.rebindTextures=ke,this.setupRenderTarget=L,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=Z,this.setupDepthRenderbuffer=we,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=J}function bg(i,e,t){let n=t.isWebGL2;function r(s,o=Qt){let a,l=ot.getTransfer(o);if(s===jn)return i.UNSIGNED_BYTE;if(s===nh)return i.UNSIGNED_SHORT_4_4_4_4;if(s===ih)return i.UNSIGNED_SHORT_5_5_5_1;if(s===pd)return i.BYTE;if(s===md)return i.SHORT;if(s===il)return i.UNSIGNED_SHORT;if(s===th)return i.INT;if(s===Zn)return i.UNSIGNED_INT;if(s===Jn)return i.FLOAT;if(s===vi)return n?i.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===gd)return i.ALPHA;if(s===dn)return i.RGBA;if(s===_d)return i.LUMINANCE;if(s===xd)return i.LUMINANCE_ALPHA;if(s===xi)return i.DEPTH_COMPONENT;if(s===hr)return i.DEPTH_STENCIL;if(s===xa)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===yd)return i.RED;if(s===rh)return i.RED_INTEGER;if(s===vd)return i.RG;if(s===sh)return i.RG_INTEGER;if(s===oh)return i.RGBA_INTEGER;if(s===Po||s===Io||s===Lo||s===Do)if(l===ht)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===Po)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Io)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Lo)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Do)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===Po)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Io)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Lo)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Do)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===Al||s===Cl||s===Rl||s===Pl)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===Al)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Cl)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Rl)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Pl)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===ah)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Il||s===Ll)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===Il)return l===ht?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===Ll)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Dl||s===Ul||s===Nl||s===Ol||s===Fl||s===Bl||s===zl||s===kl||s===Gl||s===Vl||s===Hl||s===Wl||s===Xl||s===ql)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===Dl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Ul)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Nl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Ol)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Fl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Bl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===zl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===kl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Gl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Vl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Hl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Wl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Xl)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===ql)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Uo||s===Yl||s===Zl)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===Uo)return l===ht?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Yl)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Zl)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Md||s===Jl||s===$l||s===Kl)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===Uo)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Jl)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===$l)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Kl)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===_i?n?i.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[s]!==void 0?i[s]:null}return{convert:r}}var Ua=class extends Wt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Ce=class extends Ft{constructor(){super(),this.isGroup=!0,this.type="Group"}},Sg={type:"move"},Lr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ce,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ce,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ce,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let p=t.getJointPose(x,n),m=this._getHandJoint(c,x);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Sg)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ce;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Na=class extends ti{constructor(e,t){super();let n=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null,x=t.getContextAttributes(),p=null,m=null,y=[],_=[],S=new j,E=null,v=new Wt;v.layers.enable(1),v.viewport=new dt;let T=new Wt;T.layers.enable(2),T.viewport=new dt;let U=[v,T],M=new Ua;M.layers.enable(1),M.layers.enable(2);let w=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(z){let ee=y[z];return ee===void 0&&(ee=new Lr,y[z]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(z){let ee=y[z];return ee===void 0&&(ee=new Lr,y[z]=ee),ee.getGripSpace()},this.getHand=function(z){let ee=y[z];return ee===void 0&&(ee=new Lr,y[z]=ee),ee.getHandSpace()};function N(z){let ee=_.indexOf(z.inputSource);if(ee===-1)return;let _e=y[ee];_e!==void 0&&(_e.update(z.inputSource,z.frame,c||o),_e.dispatchEvent({type:z.type,data:z.inputSource}))}function q(){r.removeEventListener("select",N),r.removeEventListener("selectstart",N),r.removeEventListener("selectend",N),r.removeEventListener("squeeze",N),r.removeEventListener("squeezestart",N),r.removeEventListener("squeezeend",N),r.removeEventListener("end",q),r.removeEventListener("inputsourceschange",D);for(let z=0;z<y.length;z++){let ee=_[z];ee!==null&&(_[z]=null,y[z].disconnect(ee))}w=null,I=null,e.setRenderTarget(p),f=null,d=null,u=null,r=null,m=null,ce.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(z){s=z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(z){a=z,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(z){c=z},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(z){if(r=z,r!==null){if(p=e.getRenderTarget(),r.addEventListener("select",N),r.addEventListener("selectstart",N),r.addEventListener("selectend",N),r.addEventListener("squeeze",N),r.addEventListener("squeezestart",N),r.addEventListener("squeezeend",N),r.addEventListener("end",q),r.addEventListener("inputsourceschange",D),x.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(S),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let ee={antialias:r.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,ee),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),m=new tn(f.framebufferWidth,f.framebufferHeight,{format:dn,type:jn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let ee=null,_e=null,Te=null;x.depth&&(Te=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=x.stencil?hr:xi,_e=x.stencil?_i:Zn);let Me={colorFormat:t.RGBA8,depthFormat:Te,scaleFactor:s};u=new XRWebGLBinding(r,t),d=u.createProjectionLayer(Me),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),m=new tn(d.textureWidth,d.textureHeight,{format:dn,type:jn,depthTexture:new Ks(d.textureWidth,d.textureHeight,_e,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0});let Pe=e.properties.get(m);Pe.__ignoreDepthValues=d.ignoreDepthValues}m.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),ce.setContext(r),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function D(z){for(let ee=0;ee<z.removed.length;ee++){let _e=z.removed[ee],Te=_.indexOf(_e);Te>=0&&(_[Te]=null,y[Te].disconnect(_e))}for(let ee=0;ee<z.added.length;ee++){let _e=z.added[ee],Te=_.indexOf(_e);if(Te===-1){for(let Pe=0;Pe<y.length;Pe++)if(Pe>=_.length){_.push(_e),Te=Pe;break}else if(_[Pe]===null){_[Pe]=_e,Te=Pe;break}if(Te===-1)break}let Me=y[Te];Me&&Me.connect(_e)}}let O=new P,k=new P;function K(z,ee,_e){O.setFromMatrixPosition(ee.matrixWorld),k.setFromMatrixPosition(_e.matrixWorld);let Te=O.distanceTo(k),Me=ee.projectionMatrix.elements,Pe=_e.projectionMatrix.elements,Ue=Me[14]/(Me[10]-1),we=Me[14]/(Me[10]+1),ke=(Me[9]+1)/Me[5],L=(Me[9]-1)/Me[5],fe=(Me[8]-1)/Me[0],Z=(Pe[8]+1)/Pe[0],le=Ue*fe,J=Ue*Z,Re=Te/(-fe+Z),xe=Re*-fe;ee.matrixWorld.decompose(z.position,z.quaternion,z.scale),z.translateX(xe),z.translateZ(Re),z.matrixWorld.compose(z.position,z.quaternion,z.scale),z.matrixWorldInverse.copy(z.matrixWorld).invert();let A=Ue+Re,b=we+Re,B=le-xe,ae=J+(Te-xe),re=ke*we/b*A,te=L*we/b*A;z.projectionMatrix.makePerspective(B,ae,re,te,A,b),z.projectionMatrixInverse.copy(z.projectionMatrix).invert()}function $(z,ee){ee===null?z.matrixWorld.copy(z.matrix):z.matrixWorld.multiplyMatrices(ee.matrixWorld,z.matrix),z.matrixWorldInverse.copy(z.matrixWorld).invert()}this.updateCamera=function(z){if(r===null)return;M.near=T.near=v.near=z.near,M.far=T.far=v.far=z.far,(w!==M.near||I!==M.far)&&(r.updateRenderState({depthNear:M.near,depthFar:M.far}),w=M.near,I=M.far);let ee=z.parent,_e=M.cameras;$(M,ee);for(let Te=0;Te<_e.length;Te++)$(_e[Te],ee);_e.length===2?K(M,v,T):M.projectionMatrix.copy(v.projectionMatrix),Y(z,M,ee)};function Y(z,ee,_e){_e===null?z.matrix.copy(ee.matrixWorld):(z.matrix.copy(_e.matrixWorld),z.matrix.invert(),z.matrix.multiply(ee.matrixWorld)),z.matrix.decompose(z.position,z.quaternion,z.scale),z.updateMatrixWorld(!0),z.projectionMatrix.copy(ee.projectionMatrix),z.projectionMatrixInverse.copy(ee.projectionMatrixInverse),z.isPerspectiveCamera&&(z.fov=ya*2*Math.atan(1/z.projectionMatrix.elements[5]),z.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(z){l=z,d!==null&&(d.fixedFoveation=z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=z)};let ne=null;function Q(z,ee){if(h=ee.getViewerPose(c||o),g=ee,h!==null){let _e=h.views;f!==null&&(e.setRenderTargetFramebuffer(m,f.framebuffer),e.setRenderTarget(m));let Te=!1;_e.length!==M.cameras.length&&(M.cameras.length=0,Te=!0);for(let Me=0;Me<_e.length;Me++){let Pe=_e[Me],Ue=null;if(f!==null)Ue=f.getViewport(Pe);else{let ke=u.getViewSubImage(d,Pe);Ue=ke.viewport,Me===0&&(e.setRenderTargetTextures(m,ke.colorTexture,d.ignoreDepthValues?void 0:ke.depthStencilTexture),e.setRenderTarget(m))}let we=U[Me];we===void 0&&(we=new Wt,we.layers.enable(Me),we.viewport=new dt,U[Me]=we),we.matrix.fromArray(Pe.transform.matrix),we.matrix.decompose(we.position,we.quaternion,we.scale),we.projectionMatrix.fromArray(Pe.projectionMatrix),we.projectionMatrixInverse.copy(we.projectionMatrix).invert(),we.viewport.set(Ue.x,Ue.y,Ue.width,Ue.height),Me===0&&(M.matrix.copy(we.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),Te===!0&&M.cameras.push(we)}}for(let _e=0;_e<y.length;_e++){let Te=_[_e],Me=y[_e];Te!==null&&Me!==void 0&&Me.update(Te,ee,c||o)}ne&&ne(z,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}let ce=new ph;ce.setAnimationLoop(Q),this.setAnimationLoop=function(z){ne=z},this.dispose=function(){}}};function wg(i,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,fh(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function r(p,m,y,_,S){m.isMeshBasicMaterial||m.isMeshLambertMaterial?s(p,m):m.isMeshToonMaterial?(s(p,m),u(p,m)):m.isMeshPhongMaterial?(s(p,m),h(p,m)):m.isMeshStandardMaterial?(s(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,S)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),x(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,y,_):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Nt&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Nt&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let y=e.get(m).envMap;if(y&&(p.envMap.value=y,p.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap){p.lightMap.value=m.lightMap;let _=i._useLegacyLights===!0?Math.PI:1;p.lightMapIntensity.value=m.lightMapIntensity*_,t(m.lightMap,p.lightMapTransform)}m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,y,_){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*y,p.scale.value=_*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),e.get(m).envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,y){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Nt&&p.clearcoatNormalScale.value.negate())),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function x(p,m){let y=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function Eg(i,e,t,n){let r={},s={},o=[],a=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(y,_){let S=_.program;n.uniformBlockBinding(y,S)}function c(y,_){let S=r[y.id];S===void 0&&(g(y),S=h(y),r[y.id]=S,y.addEventListener("dispose",p));let E=_.program;n.updateUBOMapping(y,E);let v=e.render.frame;s[y.id]!==v&&(d(y),s[y.id]=v)}function h(y){let _=u();y.__bindingPointIndex=_;let S=i.createBuffer(),E=y.__size,v=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,E,v),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,_,S),S}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let _=r[y.id],S=y.uniforms,E=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,_);for(let v=0,T=S.length;v<T;v++){let U=Array.isArray(S[v])?S[v]:[S[v]];for(let M=0,w=U.length;M<w;M++){let I=U[M];if(f(I,v,M,E)===!0){let N=I.__offset,q=Array.isArray(I.value)?I.value:[I.value],D=0;for(let O=0;O<q.length;O++){let k=q[O],K=x(k);typeof k=="number"||typeof k=="boolean"?(I.__data[0]=k,i.bufferSubData(i.UNIFORM_BUFFER,N+D,I.__data)):k.isMatrix3?(I.__data[0]=k.elements[0],I.__data[1]=k.elements[1],I.__data[2]=k.elements[2],I.__data[3]=0,I.__data[4]=k.elements[3],I.__data[5]=k.elements[4],I.__data[6]=k.elements[5],I.__data[7]=0,I.__data[8]=k.elements[6],I.__data[9]=k.elements[7],I.__data[10]=k.elements[8],I.__data[11]=0):(k.toArray(I.__data,D),D+=K.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,N,I.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(y,_,S,E){let v=y.value,T=_+"_"+S;if(E[T]===void 0)return typeof v=="number"||typeof v=="boolean"?E[T]=v:E[T]=v.clone(),!0;{let U=E[T];if(typeof v=="number"||typeof v=="boolean"){if(U!==v)return E[T]=v,!0}else if(U.equals(v)===!1)return U.copy(v),!0}return!1}function g(y){let _=y.uniforms,S=0,E=16;for(let T=0,U=_.length;T<U;T++){let M=Array.isArray(_[T])?_[T]:[_[T]];for(let w=0,I=M.length;w<I;w++){let N=M[w],q=Array.isArray(N.value)?N.value:[N.value];for(let D=0,O=q.length;D<O;D++){let k=q[D],K=x(k),$=S%E;$!==0&&E-$<K.boundary&&(S+=E-$),N.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=S,S+=K.storage}}}let v=S%E;return v>0&&(S+=E-v),y.__size=S,y.__cache={},this}function x(y){let _={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(_.boundary=4,_.storage=4):y.isVector2?(_.boundary=8,_.storage=8):y.isVector3||y.isColor?(_.boundary=16,_.storage=12):y.isVector4?(_.boundary=16,_.storage=16):y.isMatrix3?(_.boundary=48,_.storage=48):y.isMatrix4?(_.boundary=64,_.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),_}function p(y){let _=y.target;_.removeEventListener("dispose",p);let S=o.indexOf(_.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(r[_.id]),delete r[_.id],delete s[_.id]}function m(){for(let y in r)i.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:m}}var Fr=class{constructor(e={}){let{canvas:t=Dd(),context:n=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=o;let f=new Uint32Array(4),g=new Int32Array(4),x=null,p=null,m=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=yt,this._useLegacyLights=!1,this.toneMapping=Kn,this.toneMappingExposure=1;let _=this,S=!1,E=0,v=0,T=null,U=-1,M=null,w=new dt,I=new dt,N=null,q=new Ye(0),D=0,O=t.width,k=t.height,K=1,$=null,Y=null,ne=new dt(0,0,O,k),Q=new dt(0,0,O,k),ce=!1,z=new Or,ee=!1,_e=!1,Te=null,Me=new ct,Pe=new j,Ue=new P,we={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ke(){return T===null?K:1}let L=n;function fe(C,F){for(let V=0;V<C.length;V++){let W=C[V],G=t.getContext(W,F);if(G!==null)return G}return null}try{let C={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",X,!1),t.addEventListener("webglcontextrestored",R,!1),t.addEventListener("webglcontextcreationerror",ie,!1),L===null){let F=["webgl2","webgl","experimental-webgl"];if(_.isWebGL1Renderer===!0&&F.shift(),L=fe(F,C),L===null)throw fe(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&L instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),L.getShaderPrecisionFormat===void 0&&(L.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let Z,le,J,Re,xe,A,b,B,ae,re,te,Ae,ge,ye,Ne,Ve,se,je,Je,Oe,Le,Ee,He,it;function oe(){Z=new Wm(L),le=new Bm(L,Z,e),Z.init(le),Ee=new bg(L,Z,le),J=new vg(L,Z,le),Re=new Ym(L),xe=new lg,A=new Mg(L,Z,J,xe,le,Ee,Re),b=new km(_),B=new Hm(_),ae=new ef(L,le),He=new Om(L,Z,ae,le),re=new Xm(L,ae,Re,He),te=new Km(L,re,ae,Re),Je=new $m(L,le,A),Ve=new zm(xe),Ae=new ag(_,b,B,Z,le,He,Ve),ge=new wg(_,xe),ye=new hg,Ne=new gg(Z,le),je=new Nm(_,b,B,J,te,d,l),se=new yg(_,te,le),it=new Eg(L,Re,le,J),Oe=new Fm(L,Z,Re,le),Le=new qm(L,Z,Re,le),Re.programs=Ae.programs,_.capabilities=le,_.extensions=Z,_.properties=xe,_.renderLists=ye,_.shadowMap=se,_.state=J,_.info=Re}oe();let he=new Na(_,L);this.xr=he,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let C=Z.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){let C=Z.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(C){C!==void 0&&(K=C,this.setSize(O,k,!1))},this.getSize=function(C){return C.set(O,k)},this.setSize=function(C,F,V=!0){if(he.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=C,k=F,t.width=Math.floor(C*K),t.height=Math.floor(F*K),V===!0&&(t.style.width=C+"px",t.style.height=F+"px"),this.setViewport(0,0,C,F)},this.getDrawingBufferSize=function(C){return C.set(O*K,k*K).floor()},this.setDrawingBufferSize=function(C,F,V){O=C,k=F,K=V,t.width=Math.floor(C*V),t.height=Math.floor(F*V),this.setViewport(0,0,C,F)},this.getCurrentViewport=function(C){return C.copy(w)},this.getViewport=function(C){return C.copy(ne)},this.setViewport=function(C,F,V,W){C.isVector4?ne.set(C.x,C.y,C.z,C.w):ne.set(C,F,V,W),J.viewport(w.copy(ne).multiplyScalar(K).floor())},this.getScissor=function(C){return C.copy(Q)},this.setScissor=function(C,F,V,W){C.isVector4?Q.set(C.x,C.y,C.z,C.w):Q.set(C,F,V,W),J.scissor(I.copy(Q).multiplyScalar(K).floor())},this.getScissorTest=function(){return ce},this.setScissorTest=function(C){J.setScissorTest(ce=C)},this.setOpaqueSort=function(C){$=C},this.setTransparentSort=function(C){Y=C},this.getClearColor=function(C){return C.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor.apply(je,arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha.apply(je,arguments)},this.clear=function(C=!0,F=!0,V=!0){let W=0;if(C){let G=!1;if(T!==null){let ve=T.texture.format;G=ve===oh||ve===sh||ve===rh}if(G){let ve=T.texture.type,Ie=ve===jn||ve===Zn||ve===il||ve===_i||ve===nh||ve===ih,Fe=je.getClearColor(),Ge=je.getClearAlpha(),Ke=Fe.r,We=Fe.g,qe=Fe.b;Ie?(f[0]=Ke,f[1]=We,f[2]=qe,f[3]=Ge,L.clearBufferuiv(L.COLOR,0,f)):(g[0]=Ke,g[1]=We,g[2]=qe,g[3]=Ge,L.clearBufferiv(L.COLOR,0,g))}else W|=L.COLOR_BUFFER_BIT}F&&(W|=L.DEPTH_BUFFER_BIT),V&&(W|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",X,!1),t.removeEventListener("webglcontextrestored",R,!1),t.removeEventListener("webglcontextcreationerror",ie,!1),ye.dispose(),Ne.dispose(),xe.dispose(),b.dispose(),B.dispose(),te.dispose(),He.dispose(),it.dispose(),Ae.dispose(),he.dispose(),he.removeEventListener("sessionstart",At),he.removeEventListener("sessionend",$e),Te&&(Te.dispose(),Te=null),pt.stop()};function X(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function R(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;let C=Re.autoReset,F=se.enabled,V=se.autoUpdate,W=se.needsUpdate,G=se.type;oe(),Re.autoReset=C,se.enabled=F,se.autoUpdate=V,se.needsUpdate=W,se.type=G}function ie(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function ue(C){let F=C.target;F.removeEventListener("dispose",ue),be(F)}function be(C){Se(C),xe.remove(C)}function Se(C){let F=xe.get(C).programs;F!==void 0&&(F.forEach(function(V){Ae.releaseProgram(V)}),C.isShaderMaterial&&Ae.releaseShaderCache(C))}this.renderBufferDirect=function(C,F,V,W,G,ve){F===null&&(F=we);let Ie=G.isMesh&&G.matrixWorld.determinant()<0,Fe=Pu(C,F,V,W,G);J.setMaterial(W,Ie);let Ge=V.index,Ke=1;if(W.wireframe===!0){if(Ge=re.getWireframeAttribute(V),Ge===void 0)return;Ke=2}let We=V.drawRange,qe=V.attributes.position,xt=We.start*Ke,qt=(We.start+We.count)*Ke;ve!==null&&(xt=Math.max(xt,ve.start*Ke),qt=Math.min(qt,(ve.start+ve.count)*Ke)),Ge!==null?(xt=Math.max(xt,0),qt=Math.min(qt,Ge.count)):qe!=null&&(xt=Math.max(xt,0),qt=Math.min(qt,qe.count));let wt=qt-xt;if(wt<0||wt===1/0)return;He.setup(G,W,Fe,V,Ge);let wn,mt=Oe;if(Ge!==null&&(wn=ae.get(Ge),mt=Le,mt.setIndex(wn)),G.isMesh)W.wireframe===!0?(J.setLineWidth(W.wireframeLinewidth*ke()),mt.setMode(L.LINES)):mt.setMode(L.TRIANGLES);else if(G.isLine){let Qe=W.linewidth;Qe===void 0&&(Qe=1),J.setLineWidth(Qe*ke()),G.isLineSegments?mt.setMode(L.LINES):G.isLineLoop?mt.setMode(L.LINE_LOOP):mt.setMode(L.LINE_STRIP)}else G.isPoints?mt.setMode(L.POINTS):G.isSprite&&mt.setMode(L.TRIANGLES);if(G.isBatchedMesh)mt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else if(G.isInstancedMesh)mt.renderInstances(xt,wt,G.count);else if(V.isInstancedBufferGeometry){let Qe=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,Eo=Math.min(V.instanceCount,Qe);mt.renderInstances(xt,wt,Eo)}else mt.render(xt,wt)};function Xe(C,F,V){C.transparent===!0&&C.side===Ln&&C.forceSinglePass===!1?(C.side=Nt,C.needsUpdate=!0,is(C,F,V),C.side=ei,C.needsUpdate=!0,is(C,F,V),C.side=Ln):is(C,F,V)}this.compile=function(C,F,V=null){V===null&&(V=C),p=Ne.get(V),p.init(),y.push(p),V.traverseVisible(function(G){G.isLight&&G.layers.test(F.layers)&&(p.pushLight(G),G.castShadow&&p.pushShadow(G))}),C!==V&&C.traverseVisible(function(G){G.isLight&&G.layers.test(F.layers)&&(p.pushLight(G),G.castShadow&&p.pushShadow(G))}),p.setupLights(_._useLegacyLights);let W=new Set;return C.traverse(function(G){let ve=G.material;if(ve)if(Array.isArray(ve))for(let Ie=0;Ie<ve.length;Ie++){let Fe=ve[Ie];Xe(Fe,V,G),W.add(Fe)}else Xe(ve,V,G),W.add(ve)}),y.pop(),p=null,W},this.compileAsync=function(C,F,V=null){let W=this.compile(C,F,V);return new Promise(G=>{function ve(){if(W.forEach(function(Ie){xe.get(Ie).currentProgram.isReady()&&W.delete(Ie)}),W.size===0){G(C);return}setTimeout(ve,10)}Z.get("KHR_parallel_shader_compile")!==null?ve():setTimeout(ve,10)})};let nt=null;function at(C){nt&&nt(C)}function At(){pt.stop()}function $e(){pt.start()}let pt=new ph;pt.setAnimationLoop(at),typeof self<"u"&&pt.setContext(self),this.setAnimationLoop=function(C){nt=C,he.setAnimationLoop(C),C===null?pt.stop():pt.start()},he.addEventListener("sessionstart",At),he.addEventListener("sessionend",$e),this.render=function(C,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),he.enabled===!0&&he.isPresenting===!0&&(he.cameraAutoUpdate===!0&&he.updateCamera(F),F=he.getCamera()),C.isScene===!0&&C.onBeforeRender(_,C,F,T),p=Ne.get(C,y.length),p.init(),y.push(p),Me.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),z.setFromProjectionMatrix(Me),_e=this.localClippingEnabled,ee=Ve.init(this.clippingPlanes,_e),x=ye.get(C,m.length),x.init(),m.push(x),Ht(C,F,0,_.sortObjects),x.finish(),_.sortObjects===!0&&x.sort($,Y),this.info.render.frame++,ee===!0&&Ve.beginShadows();let V=p.state.shadowsArray;if(se.render(V,C,F),ee===!0&&Ve.endShadows(),this.info.autoReset===!0&&this.info.reset(),je.render(x,C),p.setupLights(_._useLegacyLights),F.isArrayCamera){let W=F.cameras;for(let G=0,ve=W.length;G<ve;G++){let Ie=W[G];Ii(x,C,Ie,Ie.viewport)}}else Ii(x,C,F);T!==null&&(A.updateMultisampleRenderTarget(T),A.updateRenderTargetMipmap(T)),C.isScene===!0&&C.onAfterRender(_,C,F),He.resetDefaultState(),U=-1,M=null,y.pop(),y.length>0?p=y[y.length-1]:p=null,m.pop(),m.length>0?x=m[m.length-1]:x=null};function Ht(C,F,V,W){if(C.visible===!1)return;if(C.layers.test(F.layers)){if(C.isGroup)V=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(F);else if(C.isLight)p.pushLight(C),C.castShadow&&p.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||z.intersectsSprite(C)){W&&Ue.setFromMatrixPosition(C.matrixWorld).applyMatrix4(Me);let Ie=te.update(C),Fe=C.material;Fe.visible&&x.push(C,Ie,Fe,V,Ue.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||z.intersectsObject(C))){let Ie=te.update(C),Fe=C.material;if(W&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),Ue.copy(C.boundingSphere.center)):(Ie.boundingSphere===null&&Ie.computeBoundingSphere(),Ue.copy(Ie.boundingSphere.center)),Ue.applyMatrix4(C.matrixWorld).applyMatrix4(Me)),Array.isArray(Fe)){let Ge=Ie.groups;for(let Ke=0,We=Ge.length;Ke<We;Ke++){let qe=Ge[Ke],xt=Fe[qe.materialIndex];xt&&xt.visible&&x.push(C,Ie,xt,V,Ue.z,qe)}}else Fe.visible&&x.push(C,Ie,Fe,V,Ue.z,null)}}let ve=C.children;for(let Ie=0,Fe=ve.length;Ie<Fe;Ie++)Ht(ve[Ie],F,V,W)}function Ii(C,F,V,W){let G=C.opaque,ve=C.transmissive,Ie=C.transparent;p.setupLightsView(V),ee===!0&&Ve.setGlobalState(_.clippingPlanes,V),ve.length>0&&yr(G,ve,F,V),W&&J.viewport(w.copy(W)),G.length>0&&Vn(G,F,V),ve.length>0&&Vn(ve,F,V),Ie.length>0&&Vn(Ie,F,V),J.buffers.depth.setTest(!0),J.buffers.depth.setMask(!0),J.buffers.color.setMask(!0),J.setPolygonOffset(!1)}function yr(C,F,V,W){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;let ve=le.isWebGL2;Te===null&&(Te=new tn(1,1,{generateMipmaps:!0,type:Z.has("EXT_color_buffer_half_float")?vi:jn,minFilter:Nr,samples:ve?4:0})),_.getDrawingBufferSize(Pe),ve?Te.setSize(Pe.x,Pe.y):Te.setSize(va(Pe.x),va(Pe.y));let Ie=_.getRenderTarget();_.setRenderTarget(Te),_.getClearColor(q),D=_.getClearAlpha(),D<1&&_.setClearColor(16777215,.5),_.clear();let Fe=_.toneMapping;_.toneMapping=Kn,Vn(C,V,W),A.updateMultisampleRenderTarget(Te),A.updateRenderTargetMipmap(Te);let Ge=!1;for(let Ke=0,We=F.length;Ke<We;Ke++){let qe=F[Ke],xt=qe.object,qt=qe.geometry,wt=qe.material,wn=qe.group;if(wt.side===Ln&&xt.layers.test(W.layers)){let mt=wt.side;wt.side=Nt,wt.needsUpdate=!0,Li(xt,V,W,qt,wt,wn),wt.side=mt,wt.needsUpdate=!0,Ge=!0}}Ge===!0&&(A.updateMultisampleRenderTarget(Te),A.updateRenderTargetMipmap(Te)),_.setRenderTarget(Ie),_.setClearColor(q,D),_.toneMapping=Fe}function Vn(C,F,V){let W=F.isScene===!0?F.overrideMaterial:null;for(let G=0,ve=C.length;G<ve;G++){let Ie=C[G],Fe=Ie.object,Ge=Ie.geometry,Ke=W===null?Ie.material:W,We=Ie.group;Fe.layers.test(V.layers)&&Li(Fe,F,V,Ge,Ke,We)}}function Li(C,F,V,W,G,ve){C.onBeforeRender(_,F,V,W,G,ve),C.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),G.onBeforeRender(_,F,V,W,C,ve),G.transparent===!0&&G.side===Ln&&G.forceSinglePass===!1?(G.side=Nt,G.needsUpdate=!0,_.renderBufferDirect(V,F,W,G,C,ve),G.side=ei,G.needsUpdate=!0,_.renderBufferDirect(V,F,W,G,C,ve),G.side=Ln):_.renderBufferDirect(V,F,W,G,C,ve),C.onAfterRender(_,F,V,W,G,ve)}function is(C,F,V){F.isScene!==!0&&(F=we);let W=xe.get(C),G=p.state.lights,ve=p.state.shadowsArray,Ie=G.state.version,Fe=Ae.getParameters(C,G.state,ve,F,V),Ge=Ae.getProgramCacheKey(Fe),Ke=W.programs;W.environment=C.isMeshStandardMaterial?F.environment:null,W.fog=F.fog,W.envMap=(C.isMeshStandardMaterial?B:b).get(C.envMap||W.environment),Ke===void 0&&(C.addEventListener("dispose",ue),Ke=new Map,W.programs=Ke);let We=Ke.get(Ge);if(We!==void 0){if(W.currentProgram===We&&W.lightsStateVersion===Ie)return xl(C,Fe),We}else Fe.uniforms=Ae.getUniforms(C),C.onBuild(V,Fe,_),C.onBeforeCompile(Fe,_),We=Ae.acquireProgram(Fe,Ge),Ke.set(Ge,We),W.uniforms=Fe.uniforms;let qe=W.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(qe.clippingPlanes=Ve.uniform),xl(C,Fe),W.needsLights=Lu(C),W.lightsStateVersion=Ie,W.needsLights&&(qe.ambientLightColor.value=G.state.ambient,qe.lightProbe.value=G.state.probe,qe.directionalLights.value=G.state.directional,qe.directionalLightShadows.value=G.state.directionalShadow,qe.spotLights.value=G.state.spot,qe.spotLightShadows.value=G.state.spotShadow,qe.rectAreaLights.value=G.state.rectArea,qe.ltc_1.value=G.state.rectAreaLTC1,qe.ltc_2.value=G.state.rectAreaLTC2,qe.pointLights.value=G.state.point,qe.pointLightShadows.value=G.state.pointShadow,qe.hemisphereLights.value=G.state.hemi,qe.directionalShadowMap.value=G.state.directionalShadowMap,qe.directionalShadowMatrix.value=G.state.directionalShadowMatrix,qe.spotShadowMap.value=G.state.spotShadowMap,qe.spotLightMatrix.value=G.state.spotLightMatrix,qe.spotLightMap.value=G.state.spotLightMap,qe.pointShadowMap.value=G.state.pointShadowMap,qe.pointShadowMatrix.value=G.state.pointShadowMatrix),W.currentProgram=We,W.uniformsList=null,We}function _l(C){if(C.uniformsList===null){let F=C.currentProgram.getUniforms();C.uniformsList=sr.seqWithValue(F.seq,C.uniforms)}return C.uniformsList}function xl(C,F){let V=xe.get(C);V.outputColorSpace=F.outputColorSpace,V.batching=F.batching,V.instancing=F.instancing,V.instancingColor=F.instancingColor,V.skinning=F.skinning,V.morphTargets=F.morphTargets,V.morphNormals=F.morphNormals,V.morphColors=F.morphColors,V.morphTargetsCount=F.morphTargetsCount,V.numClippingPlanes=F.numClippingPlanes,V.numIntersection=F.numClipIntersection,V.vertexAlphas=F.vertexAlphas,V.vertexTangents=F.vertexTangents,V.toneMapping=F.toneMapping}function Pu(C,F,V,W,G){F.isScene!==!0&&(F=we),A.resetTextureUnits();let ve=F.fog,Ie=W.isMeshStandardMaterial?F.environment:null,Fe=T===null?_.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:On,Ge=(W.isMeshStandardMaterial?B:b).get(W.envMap||Ie),Ke=W.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,We=!!V.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),qe=!!V.morphAttributes.position,xt=!!V.morphAttributes.normal,qt=!!V.morphAttributes.color,wt=Kn;W.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(wt=_.toneMapping);let wn=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,mt=wn!==void 0?wn.length:0,Qe=xe.get(W),Eo=p.state.lights;if(ee===!0&&(_e===!0||C!==M)){let $t=C===M&&W.id===U;Ve.setState(W,C,$t)}let _t=!1;W.version===Qe.__version?(Qe.needsLights&&Qe.lightsStateVersion!==Eo.state.version||Qe.outputColorSpace!==Fe||G.isBatchedMesh&&Qe.batching===!1||!G.isBatchedMesh&&Qe.batching===!0||G.isInstancedMesh&&Qe.instancing===!1||!G.isInstancedMesh&&Qe.instancing===!0||G.isSkinnedMesh&&Qe.skinning===!1||!G.isSkinnedMesh&&Qe.skinning===!0||G.isInstancedMesh&&Qe.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Qe.instancingColor===!1&&G.instanceColor!==null||Qe.envMap!==Ge||W.fog===!0&&Qe.fog!==ve||Qe.numClippingPlanes!==void 0&&(Qe.numClippingPlanes!==Ve.numPlanes||Qe.numIntersection!==Ve.numIntersection)||Qe.vertexAlphas!==Ke||Qe.vertexTangents!==We||Qe.morphTargets!==qe||Qe.morphNormals!==xt||Qe.morphColors!==qt||Qe.toneMapping!==wt||le.isWebGL2===!0&&Qe.morphTargetsCount!==mt)&&(_t=!0):(_t=!0,Qe.__version=W.version);let ai=Qe.currentProgram;_t===!0&&(ai=is(W,F,G));let yl=!1,vr=!1,To=!1,It=ai.getUniforms(),li=Qe.uniforms;if(J.useProgram(ai.program)&&(yl=!0,vr=!0,To=!0),W.id!==U&&(U=W.id,vr=!0),yl||M!==C){It.setValue(L,"projectionMatrix",C.projectionMatrix),It.setValue(L,"viewMatrix",C.matrixWorldInverse);let $t=It.map.cameraPosition;$t!==void 0&&$t.setValue(L,Ue.setFromMatrixPosition(C.matrixWorld)),le.logarithmicDepthBuffer&&It.setValue(L,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&It.setValue(L,"isOrthographic",C.isOrthographicCamera===!0),M!==C&&(M=C,vr=!0,To=!0)}if(G.isSkinnedMesh){It.setOptional(L,G,"bindMatrix"),It.setOptional(L,G,"bindMatrixInverse");let $t=G.skeleton;$t&&(le.floatVertexTextures?($t.boneTexture===null&&$t.computeBoneTexture(),It.setValue(L,"boneTexture",$t.boneTexture,A)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}G.isBatchedMesh&&(It.setOptional(L,G,"batchingTexture"),It.setValue(L,"batchingTexture",G._matricesTexture,A));let Ao=V.morphAttributes;if((Ao.position!==void 0||Ao.normal!==void 0||Ao.color!==void 0&&le.isWebGL2===!0)&&Je.update(G,V,ai),(vr||Qe.receiveShadow!==G.receiveShadow)&&(Qe.receiveShadow=G.receiveShadow,It.setValue(L,"receiveShadow",G.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(li.envMap.value=Ge,li.flipEnvMap.value=Ge.isCubeTexture&&Ge.isRenderTargetTexture===!1?-1:1),vr&&(It.setValue(L,"toneMappingExposure",_.toneMappingExposure),Qe.needsLights&&Iu(li,To),ve&&W.fog===!0&&ge.refreshFogUniforms(li,ve),ge.refreshMaterialUniforms(li,W,K,k,Te),sr.upload(L,_l(Qe),li,A)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(sr.upload(L,_l(Qe),li,A),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&It.setValue(L,"center",G.center),It.setValue(L,"modelViewMatrix",G.modelViewMatrix),It.setValue(L,"normalMatrix",G.normalMatrix),It.setValue(L,"modelMatrix",G.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){let $t=W.uniformsGroups;for(let Co=0,Du=$t.length;Co<Du;Co++)if(le.isWebGL2){let vl=$t[Co];it.update(vl,ai),it.bind(vl,ai)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return ai}function Iu(C,F){C.ambientLightColor.needsUpdate=F,C.lightProbe.needsUpdate=F,C.directionalLights.needsUpdate=F,C.directionalLightShadows.needsUpdate=F,C.pointLights.needsUpdate=F,C.pointLightShadows.needsUpdate=F,C.spotLights.needsUpdate=F,C.spotLightShadows.needsUpdate=F,C.rectAreaLights.needsUpdate=F,C.hemisphereLights.needsUpdate=F}function Lu(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return v},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(C,F,V){xe.get(C.texture).__webglTexture=F,xe.get(C.depthTexture).__webglTexture=V;let W=xe.get(C);W.__hasExternalTextures=!0,W.__hasExternalTextures&&(W.__autoAllocateDepthBuffer=V===void 0,W.__autoAllocateDepthBuffer||Z.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),W.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(C,F){let V=xe.get(C);V.__webglFramebuffer=F,V.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(C,F=0,V=0){T=C,E=F,v=V;let W=!0,G=null,ve=!1,Ie=!1;if(C){let Ge=xe.get(C);Ge.__useDefaultFramebuffer!==void 0?(J.bindFramebuffer(L.FRAMEBUFFER,null),W=!1):Ge.__webglFramebuffer===void 0?A.setupRenderTarget(C):Ge.__hasExternalTextures&&A.rebindTextures(C,xe.get(C.texture).__webglTexture,xe.get(C.depthTexture).__webglTexture);let Ke=C.texture;(Ke.isData3DTexture||Ke.isDataArrayTexture||Ke.isCompressedArrayTexture)&&(Ie=!0);let We=xe.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(We[F])?G=We[F][V]:G=We[F],ve=!0):le.isWebGL2&&C.samples>0&&A.useMultisampledRTT(C)===!1?G=xe.get(C).__webglMultisampledFramebuffer:Array.isArray(We)?G=We[V]:G=We,w.copy(C.viewport),I.copy(C.scissor),N=C.scissorTest}else w.copy(ne).multiplyScalar(K).floor(),I.copy(Q).multiplyScalar(K).floor(),N=ce;if(J.bindFramebuffer(L.FRAMEBUFFER,G)&&le.drawBuffers&&W&&J.drawBuffers(C,G),J.viewport(w),J.scissor(I),J.setScissorTest(N),ve){let Ge=xe.get(C.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+F,Ge.__webglTexture,V)}else if(Ie){let Ge=xe.get(C.texture),Ke=F||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ge.__webglTexture,V||0,Ke)}U=-1},this.readRenderTargetPixels=function(C,F,V,W,G,ve,Ie){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Fe=xe.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Ie!==void 0&&(Fe=Fe[Ie]),Fe){J.bindFramebuffer(L.FRAMEBUFFER,Fe);try{let Ge=C.texture,Ke=Ge.format,We=Ge.type;if(Ke!==dn&&Ee.convert(Ke)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let qe=We===vi&&(Z.has("EXT_color_buffer_half_float")||le.isWebGL2&&Z.has("EXT_color_buffer_float"));if(We!==jn&&Ee.convert(We)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_TYPE)&&!(We===Jn&&(le.isWebGL2||Z.has("OES_texture_float")||Z.has("WEBGL_color_buffer_float")))&&!qe){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=C.width-W&&V>=0&&V<=C.height-G&&L.readPixels(F,V,W,G,Ee.convert(Ke),Ee.convert(We),ve)}finally{let Ge=T!==null?xe.get(T).__webglFramebuffer:null;J.bindFramebuffer(L.FRAMEBUFFER,Ge)}}},this.copyFramebufferToTexture=function(C,F,V=0){let W=Math.pow(2,-V),G=Math.floor(F.image.width*W),ve=Math.floor(F.image.height*W);A.setTexture2D(F,0),L.copyTexSubImage2D(L.TEXTURE_2D,V,0,0,C.x,C.y,G,ve),J.unbindTexture()},this.copyTextureToTexture=function(C,F,V,W=0){let G=F.image.width,ve=F.image.height,Ie=Ee.convert(V.format),Fe=Ee.convert(V.type);A.setTexture2D(V,0),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,V.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,V.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,V.unpackAlignment),F.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,W,C.x,C.y,G,ve,Ie,Fe,F.image.data):F.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,W,C.x,C.y,F.mipmaps[0].width,F.mipmaps[0].height,Ie,F.mipmaps[0].data):L.texSubImage2D(L.TEXTURE_2D,W,C.x,C.y,Ie,Fe,F.image),W===0&&V.generateMipmaps&&L.generateMipmap(L.TEXTURE_2D),J.unbindTexture()},this.copyTextureToTexture3D=function(C,F,V,W,G=0){if(_.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let ve=C.max.x-C.min.x+1,Ie=C.max.y-C.min.y+1,Fe=C.max.z-C.min.z+1,Ge=Ee.convert(W.format),Ke=Ee.convert(W.type),We;if(W.isData3DTexture)A.setTexture3D(W,0),We=L.TEXTURE_3D;else if(W.isDataArrayTexture||W.isCompressedArrayTexture)A.setTexture2DArray(W,0),We=L.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,W.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,W.unpackAlignment);let qe=L.getParameter(L.UNPACK_ROW_LENGTH),xt=L.getParameter(L.UNPACK_IMAGE_HEIGHT),qt=L.getParameter(L.UNPACK_SKIP_PIXELS),wt=L.getParameter(L.UNPACK_SKIP_ROWS),wn=L.getParameter(L.UNPACK_SKIP_IMAGES),mt=V.isCompressedTexture?V.mipmaps[G]:V.image;L.pixelStorei(L.UNPACK_ROW_LENGTH,mt.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,mt.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,C.min.x),L.pixelStorei(L.UNPACK_SKIP_ROWS,C.min.y),L.pixelStorei(L.UNPACK_SKIP_IMAGES,C.min.z),V.isDataTexture||V.isData3DTexture?L.texSubImage3D(We,G,F.x,F.y,F.z,ve,Ie,Fe,Ge,Ke,mt.data):V.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),L.compressedTexSubImage3D(We,G,F.x,F.y,F.z,ve,Ie,Fe,Ge,mt.data)):L.texSubImage3D(We,G,F.x,F.y,F.z,ve,Ie,Fe,Ge,Ke,mt),L.pixelStorei(L.UNPACK_ROW_LENGTH,qe),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,xt),L.pixelStorei(L.UNPACK_SKIP_PIXELS,qt),L.pixelStorei(L.UNPACK_SKIP_ROWS,wt),L.pixelStorei(L.UNPACK_SKIP_IMAGES,wn),G===0&&W.generateMipmaps&&L.generateMipmap(We),J.unbindTexture()},this.initTexture=function(C){C.isCubeTexture?A.setTextureCube(C,0):C.isData3DTexture?A.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?A.setTexture2DArray(C,0):A.setTexture2D(C,0),J.unbindTexture()},this.resetState=function(){E=0,v=0,T=null,J.reset(),He.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Un}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===rl?"display-p3":"srgb",t.unpackColorSpace=ot.workingColorSpace===po?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===yt?yi:lh}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===yi?yt:On}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},Oa=class extends Fr{};Oa.prototype.isWebGL1Renderer=!0;var Bn=class extends Ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}},js=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=_a,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=Nn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Nn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Nn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},zt=new P,Br=class i{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyMatrix4(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyNormalMatrix(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.transformDirection(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Dn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Dn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Dn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Dn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array),r=lt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),n=lt(n,this.array),r=lt(r,this.array),s=lt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Ot(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},bi=class extends ii{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ye(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ji,Er=new P,$i=new P,Ki=new P,ji=new j,Tr=new j,vh=new ct,Ts=new P,Ar=new P,As=new P,Gc=new j,oa=new j,Vc=new j,fr=class extends Ft{constructor(e=new bi){if(super(),this.isSprite=!0,this.type="Sprite",Ji===void 0){Ji=new Mt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new js(t,5);Ji.setIndex([0,1,2,0,2,3]),Ji.setAttribute("position",new Br(n,3,0,!1)),Ji.setAttribute("uv",new Br(n,2,3,!1))}this.geometry=Ji,this.material=e,this.center=new j(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),$i.setFromMatrixScale(this.matrixWorld),vh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ki.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&$i.multiplyScalar(-Ki.z);let n=this.material.rotation,r,s;n!==0&&(s=Math.cos(n),r=Math.sin(n));let o=this.center;Cs(Ts.set(-.5,-.5,0),Ki,o,$i,r,s),Cs(Ar.set(.5,-.5,0),Ki,o,$i,r,s),Cs(As.set(.5,.5,0),Ki,o,$i,r,s),Gc.set(0,0),oa.set(1,0),Vc.set(1,1);let a=e.ray.intersectTriangle(Ts,Ar,As,!1,Er);if(a===null&&(Cs(Ar.set(-.5,.5,0),Ki,o,$i,r,s),oa.set(0,1),a=e.ray.intersectTriangle(Ts,As,Ar,!1,Er),a===null))return;let l=e.ray.origin.distanceTo(Er);l<e.near||l>e.far||t.push({distance:l,point:Er.clone(),uv:gi.getInterpolation(Er,Ts,Ar,As,Gc,oa,Vc,new j),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Cs(i,e,t,n,r,s){ji.subVectors(i,t).addScalar(.5).multiply(n),r!==void 0?(Tr.x=s*ji.x-r*ji.y,Tr.y=r*ji.x+s*ji.y):Tr.copy(ji),i.copy(e),i.x+=Tr.x,i.y+=Tr.y,i.applyMatrix4(vh)}var zr=class extends Ot{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Qi=new ct,Hc=new ct,Rs=[],Wc=new Fn,Tg=new ct,Cr=new pe,Rr=new Mi,Qs=class extends pe{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new zr(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,Tg)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Fn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Qi),Wc.copy(e.boundingBox).applyMatrix4(Qi),this.boundingBox.union(Wc)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Mi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Qi),Rr.copy(e.boundingSphere).applyMatrix4(Qi),this.boundingSphere.union(Rr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Cr.geometry=this.geometry,Cr.material=this.material,Cr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Rr.copy(this.boundingSphere),Rr.applyMatrix4(n),e.ray.intersectsSphere(Rr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,Qi),Hc.multiplyMatrices(n,Qi),Cr.matrixWorld=Hc,Cr.raycast(e,Rs);for(let o=0,a=Rs.length;o<a;o++){let l=Rs[o];l.instanceId=s,l.object=this,t.push(l)}Rs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new zr(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var si=class extends en{constructor(e,t,n,r,s,o,a,l,c){super(e,t,n,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},sn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),r=0,s=n.length,o;t?o=t:o=e*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);let h=n[r],d=n[r+1]-h,f=(o-h)/d;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new j:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new P,r=[],s=[],o=[],a=new P,l=new ct;for(let f=0;f<=e;f++){let g=f/e;r[f]=this.getTangentAt(g,new P)}s[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,h=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Ct(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(Ct(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],f*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},kr=class extends sn{constructor(e=0,t=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let n=t||new j,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Fa=class extends kr{constructor(e,t,n,r,s,o){super(e,t,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function ol(){let i=0,e=0,t=0,n=0;function r(s,o,a,l){i=s,e=a,t=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,h,u){let d=(o-s)/c-(a-s)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,r(o,a,d,f)},calc:function(s){let o=s*s,a=o*s;return i+e*s+t*o+n*a}}}var Ps=new P,aa=new ol,la=new ol,ca=new ol,Gr=class extends sn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new P){let n=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,h;this.closed||a>0?c=r[(a-1)%s]:(Ps.subVectors(r[0],r[1]).add(r[0]),c=Ps);let u=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?h=r[(a+2)%s]:(Ps.subVectors(r[s-1],r[s-2]).add(r[s-1]),h=Ps),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),f),x=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);x<1e-4&&(x=1),g<1e-4&&(g=x),p<1e-4&&(p=x),aa.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,x,p),la.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,x,p),ca.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,x,p)}else this.curveType==="catmullrom"&&(aa.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),la.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),ca.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(aa.calc(l),la.calc(l),ca.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Xc(i,e,t,n,r){let s=(n-e)*.5,o=(r-t)*.5,a=i*i,l=i*a;return(2*t-2*n+s+o)*l+(-3*t+3*n-2*s-o)*a+s*i+t}function Ag(i,e){let t=1-i;return t*t*e}function Cg(i,e){return 2*(1-i)*i*e}function Rg(i,e){return i*i*e}function Dr(i,e,t,n){return Ag(i,e)+Cg(i,t)+Rg(i,n)}function Pg(i,e){let t=1-i;return t*t*t*e}function Ig(i,e){let t=1-i;return 3*t*t*i*e}function Lg(i,e){return 3*(1-i)*i*i*e}function Dg(i,e){return i*i*i*e}function Ur(i,e,t,n,r){return Pg(i,e)+Ig(i,t)+Lg(i,n)+Dg(i,r)}var eo=class extends sn{constructor(e=new j,t=new j,n=new j,r=new j){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new j){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(Ur(e,r.x,s.x,o.x,a.x),Ur(e,r.y,s.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ba=class extends sn{constructor(e=new P,t=new P,n=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new P){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(Ur(e,r.x,s.x,o.x,a.x),Ur(e,r.y,s.y,o.y,a.y),Ur(e,r.z,s.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},to=class extends sn{constructor(e=new j,t=new j){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new j){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new j){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},za=class extends sn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},no=class extends sn{constructor(e=new j,t=new j,n=new j){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new j){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Dr(e,r.x,s.x,o.x),Dr(e,r.y,s.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},io=class extends sn{constructor(e=new P,t=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new P){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Dr(e,r.x,s.x,o.x),Dr(e,r.y,s.y,o.y),Dr(e,r.z,s.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ro=class extends sn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new j){let n=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],h=r[o>r.length-2?r.length-1:o+1],u=r[o>r.length-3?r.length-1:o+2];return n.set(Xc(a,l.x,c.x,h.x,u.x),Xc(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new j().fromArray(r))}return this}},so=Object.freeze({__proto__:null,ArcCurve:Fa,CatmullRomCurve3:Gr,CubicBezierCurve:eo,CubicBezierCurve3:Ba,EllipseCurve:kr,LineCurve:to,LineCurve3:za,QuadraticBezierCurve:no,QuadraticBezierCurve3:io,SplineCurve:ro}),ka=class extends sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new so[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=n){let o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(new so[r.type]().fromJSON(r))}return this}},pr=class extends ka{constructor(e){super(),this.type="Path",this.currentPoint=new j,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new to(this.currentPoint.clone(),new j(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let s=new no(this.currentPoint.clone(),new j(e,t),new j(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,o){let a=new eo(this.currentPoint.clone(),new j(e,t),new j(n,r),new j(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new ro(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,r,s,o),this}absarc(e,t,n,r,s,o){return this.absellipse(e,t,n,n,r,s,o),this}ellipse(e,t,n,r,s,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,r,s,o,a,l),this}absellipse(e,t,n,r,s,o,a,l){let c=new kr(e,t,n,r,s,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},oo=class i extends Mt{constructor(e=[new j(0,-.5),new j(.5,0),new j(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=Ct(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],h=1/t,u=new P,d=new j,f=new P,g=new P,x=new P,p=0,m=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,f.x=m*1,f.y=-p,f.z=m*0,x.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(x.x,x.y,x.z);break;default:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,f.x=m*1,f.y=-p,f.z=m*0,g.copy(f),f.x+=x.x,f.y+=x.y,f.z+=x.z,f.normalize(),l.push(f.x,f.y,f.z),x.copy(g)}for(let y=0;y<=t;y++){let _=n+y*h*r,S=Math.sin(_),E=Math.cos(_);for(let v=0;v<=e.length-1;v++){u.x=e[v].x*S,u.y=e[v].y,u.z=e[v].x*E,o.push(u.x,u.y,u.z),d.x=y/t,d.y=v/(e.length-1),a.push(d.x,d.y);let T=l[3*v+0]*S,U=l[3*v+1],M=l[3*v+0]*E;c.push(T,U,M)}}for(let y=0;y<t;y++)for(let _=0;_<e.length-1;_++){let S=_+y*e.length,E=S,v=S+e.length,T=S+e.length+1,U=S+1;s.push(E,v,U),s.push(T,U,v)}this.setIndex(s),this.setAttribute("position",new tt(o,3)),this.setAttribute("uv",new tt(a,2)),this.setAttribute("normal",new tt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var fn=class i extends Mt{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let h=[],u=[],d=[],f=[],g=0,x=[],p=n/2,m=0;y(),o===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new tt(u,3)),this.setAttribute("normal",new tt(d,3)),this.setAttribute("uv",new tt(f,2));function y(){let S=new P,E=new P,v=0,T=(t-e)/n;for(let U=0;U<=s;U++){let M=[],w=U/s,I=w*(t-e)+e;for(let N=0;N<=r;N++){let q=N/r,D=q*l+a,O=Math.sin(D),k=Math.cos(D);E.x=I*O,E.y=-w*n+p,E.z=I*k,u.push(E.x,E.y,E.z),S.set(O,T,k).normalize(),d.push(S.x,S.y,S.z),f.push(q,1-w),M.push(g++)}x.push(M)}for(let U=0;U<r;U++)for(let M=0;M<s;M++){let w=x[M][U],I=x[M+1][U],N=x[M+1][U+1],q=x[M][U+1];h.push(w,I,q),h.push(I,N,q),v+=6}c.addGroup(m,v,0),m+=v}function _(S){let E=g,v=new j,T=new P,U=0,M=S===!0?e:t,w=S===!0?1:-1;for(let N=1;N<=r;N++)u.push(0,p*w,0),d.push(0,w,0),f.push(.5,.5),g++;let I=g;for(let N=0;N<=r;N++){let D=N/r*l+a,O=Math.cos(D),k=Math.sin(D);T.x=M*k,T.y=p*w,T.z=M*O,u.push(T.x,T.y,T.z),d.push(0,w,0),v.x=O*.5+.5,v.y=k*.5*w+.5,f.push(v.x,v.y),g++}for(let N=0;N<r;N++){let q=E+N,D=I+N;S===!0?h.push(D,D+1,q):h.push(D+1,D,q),U+=3}c.addGroup(m,U,S===!0?1:2),m+=U}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Bt=class i extends fn{constructor(e=1,t=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ga=class i extends Mt{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};let s=[],o=[];a(r),c(n),h(),this.setAttribute("position",new tt(s,3)),this.setAttribute("normal",new tt(s.slice(),3)),this.setAttribute("uv",new tt(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let _=new P,S=new P,E=new P;for(let v=0;v<t.length;v+=3)f(t[v+0],_),f(t[v+1],S),f(t[v+2],E),l(_,S,E,y)}function l(y,_,S,E){let v=E+1,T=[];for(let U=0;U<=v;U++){T[U]=[];let M=y.clone().lerp(S,U/v),w=_.clone().lerp(S,U/v),I=v-U;for(let N=0;N<=I;N++)N===0&&U===v?T[U][N]=M:T[U][N]=M.clone().lerp(w,N/I)}for(let U=0;U<v;U++)for(let M=0;M<2*(v-U)-1;M++){let w=Math.floor(M/2);M%2===0?(d(T[U][w+1]),d(T[U+1][w]),d(T[U][w])):(d(T[U][w+1]),d(T[U+1][w+1]),d(T[U+1][w]))}}function c(y){let _=new P;for(let S=0;S<s.length;S+=3)_.x=s[S+0],_.y=s[S+1],_.z=s[S+2],_.normalize().multiplyScalar(y),s[S+0]=_.x,s[S+1]=_.y,s[S+2]=_.z}function h(){let y=new P;for(let _=0;_<s.length;_+=3){y.x=s[_+0],y.y=s[_+1],y.z=s[_+2];let S=p(y)/2/Math.PI+.5,E=m(y)/Math.PI+.5;o.push(S,1-E)}g(),u()}function u(){for(let y=0;y<o.length;y+=6){let _=o[y+0],S=o[y+2],E=o[y+4],v=Math.max(_,S,E),T=Math.min(_,S,E);v>.9&&T<.1&&(_<.2&&(o[y+0]+=1),S<.2&&(o[y+2]+=1),E<.2&&(o[y+4]+=1))}}function d(y){s.push(y.x,y.y,y.z)}function f(y,_){let S=y*3;_.x=e[S+0],_.y=e[S+1],_.z=e[S+2]}function g(){let y=new P,_=new P,S=new P,E=new P,v=new j,T=new j,U=new j;for(let M=0,w=0;M<s.length;M+=9,w+=6){y.set(s[M+0],s[M+1],s[M+2]),_.set(s[M+3],s[M+4],s[M+5]),S.set(s[M+6],s[M+7],s[M+8]),v.set(o[w+0],o[w+1]),T.set(o[w+2],o[w+3]),U.set(o[w+4],o[w+5]),E.copy(y).add(_).add(S).divideScalar(3);let I=p(E);x(v,w+0,y,I),x(T,w+2,_,I),x(U,w+4,S,I)}}function x(y,_,S,E){E<0&&y.x===1&&(o[_]=y.x-1),S.x===0&&S.z===0&&(o[_]=E/2/Math.PI+.5)}function p(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.details)}};var pn=class extends pr{constructor(e){super(e),this.uuid=Nn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(new pr().fromJSON(r))}return this}},Ug={triangulate:function(i,e,t=2){let n=e&&e.length,r=n?e[0]*t:i.length,s=Mh(i,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,h,u,d,f;if(n&&(s=zg(i,e,s,t)),i.length>80*t){a=c=i[0],l=h=i[1];for(let g=t;g<r;g+=t)u=i[g],d=i[g+1],u<a&&(a=u),d<l&&(l=d),u>c&&(c=u),d>h&&(h=d);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return Vr(s,o,t,a,l,f,0),o}};function Mh(i,e,t,n,r){let s,o;if(r===$g(i,e,t,n)>0)for(s=e;s<t;s+=n)o=qc(s,i[s],i[s+1],o);else for(s=t-n;s>=e;s-=n)o=qc(s,i[s],i[s+1],o);return o&&go(o,o.next)&&(Wr(o),o=o.next),o}function Si(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(go(t,t.next)||gt(t.prev,t,t.next)===0)){if(Wr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Vr(i,e,t,n,r,s,o){if(!i)return;!o&&s&&Wg(i,n,r,s);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,s?Og(i,n,r,s):Ng(i)){e.push(l.i/t|0),e.push(i.i/t|0),e.push(c.i/t|0),Wr(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Fg(Si(i),e,t),Vr(i,e,t,n,r,s,2)):o===2&&Bg(i,e,t,n,r,s):Vr(Si(i),e,t,n,r,s,1);break}}}function Ng(i){let e=i.prev,t=i,n=i.next;if(gt(e,t,n)>=0)return!1;let r=e.x,s=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=r<s?r<o?r:o:s<o?s:o,u=a<l?a<c?a:c:l<c?l:c,d=r>s?r>o?r:o:s>o?s:o,f=a>l?a>c?a:c:l>c?l:c,g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&nr(r,a,s,l,o,c,g.x,g.y)&&gt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Og(i,e,t,n){let r=i.prev,s=i,o=i.next;if(gt(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,h=r.y,u=s.y,d=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<d?h:d:u<d?u:d,x=a>l?a>c?a:c:l>c?l:c,p=h>u?h>d?h:d:u>d?u:d,m=Va(f,g,e,t,n),y=Va(x,p,e,t,n),_=i.prevZ,S=i.nextZ;for(;_&&_.z>=m&&S&&S.z<=y;){if(_.x>=f&&_.x<=x&&_.y>=g&&_.y<=p&&_!==r&&_!==o&&nr(a,h,l,u,c,d,_.x,_.y)&&gt(_.prev,_,_.next)>=0||(_=_.prevZ,S.x>=f&&S.x<=x&&S.y>=g&&S.y<=p&&S!==r&&S!==o&&nr(a,h,l,u,c,d,S.x,S.y)&&gt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;_&&_.z>=m;){if(_.x>=f&&_.x<=x&&_.y>=g&&_.y<=p&&_!==r&&_!==o&&nr(a,h,l,u,c,d,_.x,_.y)&&gt(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;S&&S.z<=y;){if(S.x>=f&&S.x<=x&&S.y>=g&&S.y<=p&&S!==r&&S!==o&&nr(a,h,l,u,c,d,S.x,S.y)&&gt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function Fg(i,e,t){let n=i;do{let r=n.prev,s=n.next.next;!go(r,s)&&bh(r,n,n.next,s)&&Hr(r,s)&&Hr(s,r)&&(e.push(r.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),Wr(n),Wr(n.next),n=i=s),n=n.next}while(n!==i);return Si(n)}function Bg(i,e,t,n,r,s){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Yg(o,a)){let l=Sh(o,a);o=Si(o,o.next),l=Si(l,l.next),Vr(o,e,t,n,r,s,0),Vr(l,e,t,n,r,s,0);return}a=a.next}o=o.next}while(o!==i)}function zg(i,e,t,n){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*n,l=s<o-1?e[s+1]*n:i.length,c=Mh(i,a,l,n,!1),c===c.next&&(c.steiner=!0),r.push(qg(c));for(r.sort(kg),s=0;s<r.length;s++)t=Gg(r[s],t);return t}function kg(i,e){return i.x-e.x}function Gg(i,e){let t=Vg(i,e);if(!t)return e;let n=Sh(t,i);return Si(n,n.next),Si(t,t.next)}function Vg(i,e){let t=e,n=-1/0,r,s=i.x,o=i.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let d=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=s&&d>n&&(n=d,r=t.x<t.next.x?t:t.next,d===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,h=1/0,u;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&nr(o<c?s:n,o,l,c,o<c?n:s,o,t.x,t.y)&&(u=Math.abs(o-t.y)/(s-t.x),Hr(t,i)&&(u<h||u===h&&(t.x>r.x||t.x===r.x&&Hg(r,t)))&&(r=t,h=u)),t=t.next;while(t!==a);return r}function Hg(i,e){return gt(i.prev,i,e.prev)<0&&gt(e.next,i,i.next)<0}function Wg(i,e,t,n){let r=i;do r.z===0&&(r.z=Va(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,Xg(r)}function Xg(i){let e,t,n,r,s,o,a,l,c=1;do{for(t=i,i=null,s=null,o=0;t;){for(o++,n=t,a=0,e=0;e<c&&(a++,n=n.nextZ,!!n);e++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||t.z<=n.z)?(r=t,t=t.nextZ,a--):(r=n,n=n.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;t=n}s.nextZ=null,c*=2}while(o>1);return i}function Va(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function qg(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function nr(i,e,t,n,r,s,o,a){return(r-o)*(e-a)>=(i-o)*(s-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(n-a)}function Yg(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Zg(i,e)&&(Hr(i,e)&&Hr(e,i)&&Jg(i,e)&&(gt(i.prev,i,e.prev)||gt(i,e.prev,e))||go(i,e)&&gt(i.prev,i,i.next)>0&&gt(e.prev,e,e.next)>0)}function gt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function go(i,e){return i.x===e.x&&i.y===e.y}function bh(i,e,t,n){let r=Ls(gt(i,e,t)),s=Ls(gt(i,e,n)),o=Ls(gt(t,n,i)),a=Ls(gt(t,n,e));return!!(r!==s&&o!==a||r===0&&Is(i,t,e)||s===0&&Is(i,n,e)||o===0&&Is(t,i,n)||a===0&&Is(t,e,n))}function Is(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Ls(i){return i>0?1:i<0?-1:0}function Zg(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&bh(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Hr(i,e){return gt(i.prev,i,i.next)<0?gt(i,e,i.next)>=0&&gt(i,i.prev,e)>=0:gt(i,e,i.prev)<0||gt(i,i.next,e)<0}function Jg(i,e){let t=i,n=!1,r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Sh(i,e){let t=new Ha(i.i,i.x,i.y),n=new Ha(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function qc(i,e,t,n){let r=new Ha(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function Wr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Ha(i,e,t){this.i=i,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function $g(i,e,t,n){let r=0;for(let s=e,o=t-n;s<t;s+=n)r+=(i[o]-i[s])*(i[s+1]+i[o+1]),o=s;return r}var Qn=class i{static area(e){let t=e.length,n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],r=[],s=[];Yc(e),Zc(n,e);let o=e.length;t.forEach(Yc);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,Zc(n,t[l]);let a=Ug.triangulate(n,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function Yc(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Zc(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var wi=class i extends Mt{constructor(e=new pn([new j(.5,.5),new j(-.5,.5),new j(-.5,-.5),new j(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new tt(r,3)),this.setAttribute("uv",new tt(s,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,p=t.bevelSegments!==void 0?t.bevelSegments:3,m=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:Kg,_,S=!1,E,v,T,U;m&&(_=m.getSpacedPoints(h),S=!0,d=!1,E=m.computeFrenetFrames(h,!1),v=new P,T=new P,U=new P),d||(p=0,f=0,g=0,x=0);let M=a.extractPoints(c),w=M.shape,I=M.holes;if(!Qn.isClockWise(w)){w=w.reverse();for(let L=0,fe=I.length;L<fe;L++){let Z=I[L];Qn.isClockWise(Z)&&(I[L]=Z.reverse())}}let q=Qn.triangulateShape(w,I),D=w;for(let L=0,fe=I.length;L<fe;L++){let Z=I[L];w=w.concat(Z)}function O(L,fe,Z){return fe||console.error("THREE.ExtrudeGeometry: vec does not exist"),L.clone().addScaledVector(fe,Z)}let k=w.length,K=q.length;function $(L,fe,Z){let le,J,Re,xe=L.x-fe.x,A=L.y-fe.y,b=Z.x-L.x,B=Z.y-L.y,ae=xe*xe+A*A,re=xe*B-A*b;if(Math.abs(re)>Number.EPSILON){let te=Math.sqrt(ae),Ae=Math.sqrt(b*b+B*B),ge=fe.x-A/te,ye=fe.y+xe/te,Ne=Z.x-B/Ae,Ve=Z.y+b/Ae,se=((Ne-ge)*B-(Ve-ye)*b)/(xe*B-A*b);le=ge+xe*se-L.x,J=ye+A*se-L.y;let je=le*le+J*J;if(je<=2)return new j(le,J);Re=Math.sqrt(je/2)}else{let te=!1;xe>Number.EPSILON?b>Number.EPSILON&&(te=!0):xe<-Number.EPSILON?b<-Number.EPSILON&&(te=!0):Math.sign(A)===Math.sign(B)&&(te=!0),te?(le=-A,J=xe,Re=Math.sqrt(ae)):(le=xe,J=A,Re=Math.sqrt(ae/2))}return new j(le/Re,J/Re)}let Y=[];for(let L=0,fe=D.length,Z=fe-1,le=L+1;L<fe;L++,Z++,le++)Z===fe&&(Z=0),le===fe&&(le=0),Y[L]=$(D[L],D[Z],D[le]);let ne=[],Q,ce=Y.concat();for(let L=0,fe=I.length;L<fe;L++){let Z=I[L];Q=[];for(let le=0,J=Z.length,Re=J-1,xe=le+1;le<J;le++,Re++,xe++)Re===J&&(Re=0),xe===J&&(xe=0),Q[le]=$(Z[le],Z[Re],Z[xe]);ne.push(Q),ce=ce.concat(Q)}for(let L=0;L<p;L++){let fe=L/p,Z=f*Math.cos(fe*Math.PI/2),le=g*Math.sin(fe*Math.PI/2)+x;for(let J=0,Re=D.length;J<Re;J++){let xe=O(D[J],Y[J],le);Me(xe.x,xe.y,-Z)}for(let J=0,Re=I.length;J<Re;J++){let xe=I[J];Q=ne[J];for(let A=0,b=xe.length;A<b;A++){let B=O(xe[A],Q[A],le);Me(B.x,B.y,-Z)}}}let z=g+x;for(let L=0;L<k;L++){let fe=d?O(w[L],ce[L],z):w[L];S?(T.copy(E.normals[0]).multiplyScalar(fe.x),v.copy(E.binormals[0]).multiplyScalar(fe.y),U.copy(_[0]).add(T).add(v),Me(U.x,U.y,U.z)):Me(fe.x,fe.y,0)}for(let L=1;L<=h;L++)for(let fe=0;fe<k;fe++){let Z=d?O(w[fe],ce[fe],z):w[fe];S?(T.copy(E.normals[L]).multiplyScalar(Z.x),v.copy(E.binormals[L]).multiplyScalar(Z.y),U.copy(_[L]).add(T).add(v),Me(U.x,U.y,U.z)):Me(Z.x,Z.y,u/h*L)}for(let L=p-1;L>=0;L--){let fe=L/p,Z=f*Math.cos(fe*Math.PI/2),le=g*Math.sin(fe*Math.PI/2)+x;for(let J=0,Re=D.length;J<Re;J++){let xe=O(D[J],Y[J],le);Me(xe.x,xe.y,u+Z)}for(let J=0,Re=I.length;J<Re;J++){let xe=I[J];Q=ne[J];for(let A=0,b=xe.length;A<b;A++){let B=O(xe[A],Q[A],le);S?Me(B.x,B.y+_[h-1].y,_[h-1].x+Z):Me(B.x,B.y,u+Z)}}}ee(),_e();function ee(){let L=r.length/3;if(d){let fe=0,Z=k*fe;for(let le=0;le<K;le++){let J=q[le];Pe(J[2]+Z,J[1]+Z,J[0]+Z)}fe=h+p*2,Z=k*fe;for(let le=0;le<K;le++){let J=q[le];Pe(J[0]+Z,J[1]+Z,J[2]+Z)}}else{for(let fe=0;fe<K;fe++){let Z=q[fe];Pe(Z[2],Z[1],Z[0])}for(let fe=0;fe<K;fe++){let Z=q[fe];Pe(Z[0]+k*h,Z[1]+k*h,Z[2]+k*h)}}n.addGroup(L,r.length/3-L,0)}function _e(){let L=r.length/3,fe=0;Te(D,fe),fe+=D.length;for(let Z=0,le=I.length;Z<le;Z++){let J=I[Z];Te(J,fe),fe+=J.length}n.addGroup(L,r.length/3-L,1)}function Te(L,fe){let Z=L.length;for(;--Z>=0;){let le=Z,J=Z-1;J<0&&(J=L.length-1);for(let Re=0,xe=h+p*2;Re<xe;Re++){let A=k*Re,b=k*(Re+1),B=fe+le+A,ae=fe+J+A,re=fe+J+b,te=fe+le+b;Ue(B,ae,re,te)}}}function Me(L,fe,Z){l.push(L),l.push(fe),l.push(Z)}function Pe(L,fe,Z){we(L),we(fe),we(Z);let le=r.length/3,J=y.generateTopUV(n,r,le-3,le-2,le-1);ke(J[0]),ke(J[1]),ke(J[2])}function Ue(L,fe,Z,le){we(L),we(fe),we(le),we(fe),we(Z),we(le);let J=r.length/3,Re=y.generateSideWallUV(n,r,J-6,J-3,J-2,J-1);ke(Re[0]),ke(Re[1]),ke(Re[3]),ke(Re[1]),ke(Re[2]),ke(Re[3])}function we(L){r.push(l[L*3+0]),r.push(l[L*3+1]),r.push(l[L*3+2])}function ke(L){s.push(L.x),s.push(L.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return jg(t,n,e)}static fromJSON(e,t){let n=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];n.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new so[r.type]().fromJSON(r)),new i(n,e.options)}},Kg={generateTopUV:function(i,e,t,n,r){let s=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[r*3],h=e[r*3+1];return[new j(s,o),new j(a,l),new j(c,h)]},generateSideWallUV:function(i,e,t,n,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],d=e[r*3],f=e[r*3+1],g=e[r*3+2],x=e[s*3],p=e[s*3+1],m=e[s*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new j(o,1-l),new j(c,1-u),new j(d,1-g),new j(x,1-m)]:[new j(a,1-l),new j(h,1-u),new j(f,1-g),new j(p,1-m)]}};function jg(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){let s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var ao=class i extends Ga{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var lo=class i extends Mt{constructor(e=new pn([new j(0,.5),new j(-.5,-.5),new j(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new tt(r,3)),this.setAttribute("normal",new tt(s,3)),this.setAttribute("uv",new tt(o,2));function c(h){let u=r.length/3,d=h.extractPoints(t),f=d.shape,g=d.holes;Qn.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,m=g.length;p<m;p++){let y=g[p];Qn.isClockWise(y)===!0&&(g[p]=y.reverse())}let x=Qn.triangulateShape(f,g);for(let p=0,m=g.length;p<m;p++){let y=g[p];f=f.concat(y)}for(let p=0,m=f.length;p<m;p++){let y=f[p];r.push(y.x,y.y,0),s.push(0,0,1),o.push(y.x,y.y)}for(let p=0,m=x.length;p<m;p++){let y=x[p],_=y[0]+u,S=y[1]+u,E=y[2]+u;n.push(_,S,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Qg(t,e)}static fromJSON(e,t){let n=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];n.push(o)}return new i(n,e.curveSegments)}};function Qg(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let r=i[t];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e}var mn=class i extends Mt{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new P,d=new P,f=[],g=[],x=[],p=[];for(let m=0;m<=n;m++){let y=[],_=m/n,S=0;m===0&&o===0?S=.5/t:m===n&&l===Math.PI&&(S=-.5/t);for(let E=0;E<=t;E++){let v=E/t;u.x=-e*Math.cos(r+v*s)*Math.sin(o+_*a),u.y=e*Math.cos(o+_*a),u.z=e*Math.sin(r+v*s)*Math.sin(o+_*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),x.push(d.x,d.y,d.z),p.push(v+S,1-_),y.push(c++)}h.push(y)}for(let m=0;m<n;m++)for(let y=0;y<t;y++){let _=h[m][y+1],S=h[m][y],E=h[m+1][y],v=h[m+1][y+1];(m!==0||o>0)&&f.push(_,S,v),(m!==n-1||l<Math.PI)&&f.push(S,E,v)}this.setIndex(f),this.setAttribute("position",new tt(g,3)),this.setAttribute("normal",new tt(x,3)),this.setAttribute("uv",new tt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var on=class i extends Mt{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s},n=Math.floor(n),r=Math.floor(r);let o=[],a=[],l=[],c=[],h=new P,u=new P,d=new P;for(let f=0;f<=n;f++)for(let g=0;g<=r;g++){let x=g/r*s,p=f/n*Math.PI*2;u.x=(e+t*Math.cos(p))*Math.cos(x),u.y=(e+t*Math.cos(p))*Math.sin(x),u.z=t*Math.sin(p),a.push(u.x,u.y,u.z),h.x=e*Math.cos(x),h.y=e*Math.sin(x),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(g/r),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=r;g++){let x=(r+1)*f+g-1,p=(r+1)*(f-1)+g-1,m=(r+1)*(f-1)+g,y=(r+1)*f+g;o.push(x,p,y),o.push(p,m,y)}this.setIndex(o),this.setAttribute("position",new tt(a,3)),this.setAttribute("normal",new tt(l,3)),this.setAttribute("uv",new tt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var co=class i extends Mt{constructor(e=new io(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,n=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new P,l=new P,c=new j,h=new P,u=[],d=[],f=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new tt(u,3)),this.setAttribute("normal",new tt(d,3)),this.setAttribute("uv",new tt(f,2));function x(){for(let _=0;_<t;_++)p(_);p(s===!1?t:0),y(),m()}function p(_){h=e.getPointAt(_/t,h);let S=o.normals[_],E=o.binormals[_];for(let v=0;v<=r;v++){let T=v/r*Math.PI*2,U=Math.sin(T),M=-Math.cos(T);l.x=M*S.x+U*E.x,l.y=M*S.y+U*E.y,l.z=M*S.z+U*E.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+n*l.x,a.y=h.y+n*l.y,a.z=h.z+n*l.z,u.push(a.x,a.y,a.z)}}function m(){for(let _=1;_<=t;_++)for(let S=1;S<=r;S++){let E=(r+1)*(_-1)+(S-1),v=(r+1)*_+(S-1),T=(r+1)*_+S,U=(r+1)*(_-1)+S;g.push(E,v,U),g.push(v,T,U)}}function y(){for(let _=0;_<=t;_++)for(let S=0;S<=r;S++)c.x=_/t,c.y=S/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new so[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var gn=class extends ii{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ye(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ch,this.normalScale=new j(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function Ds(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function e_(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var mr=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Wa=class extends mr{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:jl,endingEnd:jl}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ql:s=e,a=2*t-n;break;case ec:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ql:o=e,l=2*n-t;break;case ec:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(r-t),x=g*g,p=x*g,m=-d*p+2*d*x-d*g,y=(1+d)*p+(-1.5-2*d)*x+(-.5+d)*g+1,_=(-1-f)*p+(1.5+f)*x+.5*g,S=f*p-f*x;for(let E=0;E!==a;++E)s[E]=m*o[h+E]+y*o[c+E]+_*o[l+E]+S*o[u+E];return s}},Xa=class extends mr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(r-t),u=1-h;for(let d=0;d!==a;++d)s[d]=o[c+d]*u+o[l+d]*h;return s}},qa=class extends mr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},_n=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ds(t,this.TimeBufferType),this.values=Ds(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ds(e.times,Array),values:Ds(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new qa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Xa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Wa(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ns:t=this.InterpolantFactoryMethodDiscrete;break;case Os:t=this.InterpolantFactoryMethodLinear;break;case No:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ns;case this.InterpolantFactoryMethodLinear:return Os;case this.InterpolantFactoryMethodSmooth:return No}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&e_(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===No,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(r)l=!0;else{let u=a*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){let x=t[u+g];if(x!==t[d+g]||x!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};_n.prototype.TimeBufferType=Float32Array;_n.prototype.ValueBufferType=Float32Array;_n.prototype.DefaultInterpolation=Os;var Ei=class extends _n{};Ei.prototype.ValueTypeName="bool";Ei.prototype.ValueBufferType=Array;Ei.prototype.DefaultInterpolation=Ns;Ei.prototype.InterpolantFactoryMethodLinear=void 0;Ei.prototype.InterpolantFactoryMethodSmooth=void 0;var Ya=class extends _n{};Ya.prototype.ValueTypeName="color";var Za=class extends _n{};Za.prototype.ValueTypeName="number";var Ja=class extends mr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t),c=e*a;for(let h=c+a;c!==h;c+=4)ni.slerpFlat(s,0,o,c-a,o,c,l);return s}},Xr=class extends _n{InterpolantFactoryMethodLinear(e){return new Ja(this.times,this.values,this.getValueSize(),e)}};Xr.prototype.ValueTypeName="quaternion";Xr.prototype.DefaultInterpolation=Os;Xr.prototype.InterpolantFactoryMethodSmooth=void 0;var Ti=class extends _n{};Ti.prototype.ValueTypeName="string";Ti.prototype.ValueBufferType=Array;Ti.prototype.DefaultInterpolation=Ns;Ti.prototype.InterpolantFactoryMethodLinear=void 0;Ti.prototype.InterpolantFactoryMethodSmooth=void 0;var $a=class extends _n{};$a.prototype.ValueTypeName="vector";var Ka=class{constructor(e,t,n){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){a++,s===!1&&r.onStart!==void 0&&r.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,r.onProgress!==void 0&&r.onProgress(h,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}},t_=new Ka,ja=class{constructor(e){this.manager=e!==void 0?e:t_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};ja.DEFAULT_MATERIAL_NAME="__DEFAULT";var qr=class extends Ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ye(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},ho=class extends qr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ye(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},ha=new ct,Jc=new P,$c=new P,uo=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new j(512,512),this.map=null,this.mapPass=null,this.matrix=new ct,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Or,this._frameExtents=new j(1,1),this._viewportCount=1,this._viewports=[new dt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Jc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Jc),$c.setFromMatrixPosition(e.target.matrixWorld),t.lookAt($c),t.updateMatrixWorld(),ha.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ha),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ha)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Kc=new ct,Pr=new P,ua=new P,Qa=class extends uo{constructor(){super(new Wt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new j(4,2),this._viewportCount=6,this._viewports=[new dt(2,1,1,1),new dt(0,1,1,1),new dt(3,1,1,1),new dt(1,1,1,1),new dt(3,0,1,1),new dt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Pr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Pr),ua.copy(n.position),ua.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(ua),n.updateMatrixWorld(),r.makeTranslation(-Pr.x,-Pr.y,-Pr.z),Kc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kc)}},an=class extends qr{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new Qa}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},el=class extends uo{constructor(){super(new ri(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Yr=class extends qr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.target=new Ft,this.shadow=new el}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var al="\\[\\]\\.:\\/",n_=new RegExp("["+al+"]","g"),ll="[^"+al+"]",i_="[^"+al.replace("\\.","")+"]",r_=/((?:WC+[\/:])*)/.source.replace("WC",ll),s_=/(WCOD+)?/.source.replace("WCOD",i_),o_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ll),a_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ll),l_=new RegExp("^"+r_+s_+o_+a_+"$"),c_=["material","materials","bones","map"],tl=class{constructor(e,t,n){let r=n||ut.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ut=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(n_,"")}static parseTrackName(e){let t=l_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);c_.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ut.Composite=tl;ut.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ut.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ut.prototype.GetterByBindingType=[ut.prototype._getValue_direct,ut.prototype._getValue_array,ut.prototype._getValue_arrayElement,ut.prototype._getValue_toArray];ut.prototype.SetterByBindingTypeAndVersioning=[[ut.prototype._setValue_direct,ut.prototype._setValue_direct_setNeedsUpdate,ut.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_array,ut.prototype._setValue_array_setNeedsUpdate,ut.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_arrayElement,ut.prototype._setValue_arrayElement_setNeedsUpdate,ut.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_fromArray,ut.prototype._setValue_fromArray_setNeedsUpdate,ut.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Ex=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var cl=Math.sin(45*Math.PI/180);function wh(i,e,t,n){let r=n?1:1-Math.exp(-t*11),s=!1;for(let o of["yaw","tx","tz","zoom"]){let a=e[o]-i[o];a!==0&&(i[o]=Math.abs(a)>(o==="yaw"?.02:.002)&&!n?i[o]+a*r:e[o],i[o]!==e[o]&&(s=!0))}return s}function _o(i,e,t){let n=(e-1)/2+1,r=(t-1)/2+1;return{...i,tx:Math.max(-n,Math.min(n,i.tx)),tz:Math.max(-r,Math.min(r,i.tz))}}function Eh(i,e,t,n){let r=i.yaw*Math.PI/180,s=Math.cos(r),o=-Math.sin(r),a=-Math.sin(r),l=-Math.cos(r),c=e*n,h=t*n/cl;return{...i,tx:i.tx-s*c+a*h,tz:i.tz-o*c+l*h}}function Th(i,e){return i+360*Math.round((e-i)/360)}function Zr(i){return Math.min(14,Math.max(7.5,7.5/i))}var h_=5,u_=22;function Ah(i,e,t){let n=Math.hypot(e,t),r=Math.max(n*cl,n/i)+1;return{min:h_,max:Math.max(Zr(i),Math.min(u_,r))}}var xo=(i,e)=>Math.max(e.min,Math.min(e.max,i));function Ai(i,e,t){let n=i.yaw*Math.PI/180,r=t/cl;return{x:i.tx+Math.cos(n)*e-Math.sin(n)*r,z:i.tz-Math.sin(n)*e-Math.cos(n)*r}}function Ch(i,e,t,n,r){let s=xo(i.zoom*e,r),o=i.zoom-s,a=Ai(i,t*o,n*o);return{...i,zoom:s,tx:a.x,tz:a.z}}function Rh(i,e){let t=i.zoom/2,n=t*e;return{corners:[Ai(i,-n,t),Ai(i,n,t),Ai(i,n,-t),Ai(i,-n,-t)],tick:[Ai(i,0,0),Ai(i,0,t*.4)]}}function Ph(i,e,t,n){let r=i<520?8:11,s=Math.min(Math.floor(i*.5/t),Math.floor(e*.4/n));return Math.max(2,Math.min(r,s))}function Ih(i,e,t,n,r){return[(i.x+e/2)*n,r+(i.z+t/2)*n]}function Lh(i,e,t,n,r,s){return{x:i/r-t/2,z:(e-s)/r-n/2}}function Dh(i){let e=new Map,t=null,n=null,r=()=>{let[s,o]=[...e.values()];return!s||!o?{ang:0,d:0,mx:0,my:0}:{ang:Math.atan2(o.y-s.y,o.x-s.x),d:Math.hypot(o.x-s.x,o.y-s.y),mx:(s.x+o.x)/2,my:(s.y+o.y)/2}};return{down(s){return e.set(s.id,{x:s.x,y:s.y,x0:s.x,y0:s.y,t0:i(),type:s.type,button:s.button}),t=e.size===2?r():null,[]},move(s){let o=e.get(s.id);if(!o)return[];let a=s.x-o.x,l=s.y-o.y;o.x=s.x,o.y=s.y;let c=[];if(e.size===1)o.type==="mouse"&&(o.button===1||o.button===2)?(a!==0||l!==0)&&c.push({kind:"pan",dx:a,dy:l}):a!==0&&c.push({kind:"turn",deg:-a*.35});else if(e.size===2&&t){let h=r(),u=h.ang-t.ang;u>Math.PI&&(u-=2*Math.PI),u<-Math.PI&&(u+=2*Math.PI),u!==0&&c.push({kind:"turn",deg:u*180/Math.PI});let d=h.mx-t.mx,f=h.my-t.my;(d!==0||f!==0)&&c.push({kind:"pan",dx:d,dy:f});let g=Math.max(10,t.d)/Math.max(10,h.d);g!==1&&c.push({kind:"zoom",factor:g,x:h.mx,y:h.my}),t=h}return c},up(s){let o=e.get(s.id);if(!o)return[];if(e.delete(s.id),t=null,o.type==="mouse"||e.size!==0)return[];let a=i();return a-o.t0>=280||Math.hypot(s.x-o.x0,s.y-o.y0)>=12?[]:n&&a-n.t<320&&Math.hypot(s.x-n.x,s.y-n.y)<40?(n=null,[{kind:"reset"}]):(n={t:a,x:s.x,y:s.y},[])},cancel(s){e.delete(s),t=null},wheel(s,o,a){return s===0?[]:[{kind:"zoom",factor:Math.exp(s*.0015),x:o,y:a}]}}}var Uh=15,Nh=1.2,d_=16,f_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/></svg>',p_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>',m_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',g_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';function Jr(i,e,t,n){let r=document.createElement("button");return r.type="button",r.id=i,r.className=n,r.setAttribute("aria-label",e),r.title=e,r.innerHTML=t,r}function Oh(i,e,t,n){let r=Dh(()=>performance.now()),s=v=>({id:v.pointerId,x:v.clientX,y:v.clientY,type:v.pointerType==="touch"||v.pointerType==="pen"?v.pointerType:"mouse",button:v.button}),o=v=>{if(!(!v.length||t.blocked())){t.gesture();for(let T of v)if(T.kind==="turn")n.turn(T.deg,!1);else if(T.kind==="pan")n.pan(T.dx,T.dy);else if(T.kind==="zoom"){let U=i.getBoundingClientRect();n.zoom(T.factor,(T.x-U.left)/(U.width||1)-.5,.5-(T.y-U.top)/(U.height||1),!1)}else n.reset()}},a=v=>{if(!t.blocked()){try{i.setPointerCapture(v.pointerId)}catch{}o(r.down(s(v)))}},l=v=>o(r.move(s(v))),c=v=>o(r.up(s(v))),h=v=>r.cancel(v.pointerId),u=()=>{t.blocked()||(t.gesture(),n.reset())},d=v=>v.preventDefault(),f=v=>{if(t.blocked())return;v.preventDefault();let T=v.deltaMode===1?d_:v.deltaMode===2?i.clientHeight:1;o(r.wheel(v.deltaY*T,v.clientX,v.clientY))};i.style.touchAction="none",i.addEventListener("pointerdown",a),i.addEventListener("pointermove",l),i.addEventListener("pointerup",c),i.addEventListener("pointercancel",h),i.addEventListener("dblclick",u),i.addEventListener("contextmenu",d),i.addEventListener("wheel",f,{passive:!1});let g=document.createElement("button");g.type="button",g.className="modern-viewbtn",g.textContent="View",g.setAttribute("aria-expanded","false"),g.setAttribute("aria-controls","cam-buttons");let x=document.createElement("div");x.id="cam-buttons",x.className="cam",x.setAttribute("role","group"),x.setAttribute("aria-label","Camera");let p=Jr("cam-left","Turn left",f_,"cbtn"),m=Jr("cam-right","Turn right",p_,"cbtn"),y=Jr("cam-zoom-in","Zoom in",m_,"cbtn"),_=Jr("cam-zoom-out","Zoom out",g_,"cbtn"),S=Jr("cam-reset","Reset view","Reset","cbtn wide");x.append(p,m,y,_,S),e.append(g,x);let E=v=>()=>{t.blocked()||(t.gesture(),v())};return p.addEventListener("click",E(()=>n.turn(-Uh,!0))),m.addEventListener("click",E(()=>n.turn(Uh,!0))),y.addEventListener("click",E(()=>n.zoom(1/Nh,0,0,!0))),_.addEventListener("click",E(()=>n.zoom(Nh,0,0,!0))),S.addEventListener("click",E(()=>n.reset())),g.addEventListener("click",()=>{let v=x.classList.toggle("open");g.setAttribute("aria-expanded",String(v))}),{dispose(){i.removeEventListener("pointerdown",a),i.removeEventListener("pointermove",l),i.removeEventListener("pointerup",c),i.removeEventListener("pointercancel",h),i.removeEventListener("dblclick",u),i.removeEventListener("contextmenu",d),i.removeEventListener("wheel",f),g.remove(),x.remove()}}}function Fh(i,e){let t=[];for(let n=0;n<i.terrain.length;n++)(i.terrain[n]!==e.terrain[n]||i.objects[n]!==e.objects[n])&&t.push(n);return t}var __=i=>Math.max(0,Math.min(1,i)),x_=.06666666666666667;function Bh(i){return 1-.67*__(i)}function zh(i,e,t){let n=e-i;return Math.abs(n)<.005?e:i+n*(1-Math.exp(-t/x_))}function kh(i,e,t){let n=e?[e]:[];return i==="ghosted"?[...n,...t]:n}function Gh(i){return i.model==="block"||i.model==="theseus"||i.model==="cow-standing"||i.id?.startsWith("machine")?null:i.model}function Vh(i,e){return e?0:.03*Math.sin(2*Math.PI*i/2)}var Hh=.08;function Wh(i,e,t,n,r,s,o){let a=(l,c,h)=>c>h?0:Math.max(c,Math.min(h,l))-l;return[a(i,-r+o+t/2,r-o-t/2),a(e,-s+o,s-o-n)]}function Xh(i,e,t){let n=i.getContext("2d"),r=e.rise/e.cell,s=16,o=0;return{size(a,l,c){let h=window.devicePixelRatio||1;s=Math.max(1,Math.round(c*h)),o=Math.round(r*s),i.width=a*s,i.height=l*s+o,i.style.width=`${i.width/h}px`,i.style.height=`${i.height/h}px`,i.dataset.cell=String(c),n.setTransform(1,0,0,1,0,0),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality="high"},paint(a,l){n.clearRect(0,0,i.width,i.height);let c=e.cell,h=e.cell+e.rise;for(let u of a){let d=e.sprites[u.sprite];d&&n.drawImage(t,d.x+u.frame*c,d.y,c,h,Math.round(u.x*s),Math.round(u.y*s),s,s+o)}l&&l.length>1&&(n.strokeStyle="#c0392b",n.lineWidth=Math.max(2,s/8),n.lineJoin="round",n.beginPath(),l.forEach((u,d)=>{let f=(u.c+.5)*s,g=(u.r+.5)*s+o;d===0?n.moveTo(f,g):n.lineTo(f,g)}),n.stroke())}}}var $r=["up","down","left","right"];var hl={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Gives back one heart."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},rt=(i,e,t,n={},r,s=e)=>({char:i,minotaur:e,block:t,hazard:s,...n,sprites:r??[]}),Kr={floor:rt(".",!0,!0,{},["floor"]),wall:rt("#",!1,!1,{},["wall"]),exit:rt("E",!1,!1,{},["exit"]),gate:rt("|",!1,!1,{},["gate-closed","gate-open"]),water:rt("~",!1,!0,{needs:"flippers"},["water"]),fire:rt("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:rt("=",!0,!0,{slides:"skates"},["ice"]),"force-up":rt("^",!0,!0,{carries:"up"},["force-up"]),"force-down":rt("v",!0,!0,{carries:"down"},["force-down"]),"force-left":rt("<",!0,!0,{carries:"left"},["force-left"]),"force-right":rt(">",!0,!0,{carries:"right"},["force-right"]),dirt:rt("%",!0,!0,{},["dirt"]),safe:rt("S",!1,!1,{},["safe"]),button:rt("_",!0,!0,{},["button"]),"toggle-open":rt("t",!0,!1,{},["toggle-open"]),"toggle-closed":rt("T",!1,!1,{},["toggle-closed"]),"door-red":rt("R",!1,!1,{door:"red"},["door-red"]),"door-blue":rt("B",!1,!1,{door:"blue"},["door-blue"]),"door-yellow":rt("Y",!1,!1,{door:"yellow"},["door-yellow"]),"door-green":rt("G",!1,!1,{door:"green"},["door-green"]),trap:rt("&",!0,!0,{},["trap"]),"button-brown":rt("-",!0,!0,{},["button-brown"]),"button-red":rt("+",!0,!0,{},["button-red"]),popup:rt(";",!1,!1,{},["popup"]),gravel:rt(":",!1,!1,{},["gravel"]),"fake-wall":rt("W",!1,!1,{},["wall"]),"invisible-wall":rt("I",!1,!1,{},["floor"]),teleport:rt("@",!1,!1,{},["teleport"]),thief:rt("$",!0,!0,{},["thief"]),bomb:rt("!",!1,!0,{},["bomb"],!0),clone:rt("C",!1,!1,{},$r.map(i=>`clone-${i}`))},Ci={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var oi={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:hl.mirror.name},cake:{char:"x",sprite:"cake",name:hl.cake.name},cow:{char:"c",sprite:"cow",name:hl.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},y_=["theseus","minotaur","minotaur-stone","cow-standing"],Nx=[...new Set([...Object.values(Kr).flatMap(i=>i.sprites),...Object.values(oi).map(i=>i.sprite),...y_,...Object.values(Ci).map(i=>i.sprite)])];function v_(i,e,t){let n=i.sprites[e];return!n||n.frames<=1||n.fps<=0?0:Math.floor(t*n.fps/1e3)%n.frames}function qh(i,e,t,n){let r=[],s=(c,h,u)=>r.push({sprite:c,frame:v_(t,c,n),x:h,y:u}),{rows:o,cols:a}=i.level,l=(c,h)=>!!c&&Math.ceil(c.r-1e-9)===h;for(let c=0;c<o;c++){for(let h=0;h<a;h++){let u=i.terrain[c*a+h],d=Kr[u].sprites,f=u==="clone"?i.level.machines.find(g=>g.at.r===c&&g.at.c===h):void 0;s(f?d[$r.indexOf(f.dir)]:u==="gate"&&i.relicsLeft===0?d[1]:d[0],h,c)}for(let h=0;h<a;h++){let u=i.objects[c*a+h];u==="block"&&e.blocks?.some(d=>d.origin.r===c&&d.origin.c===h)||u&&s(oi[u].sprite,h,c)}for(let h of i.level.machines)h.at.r===c&&s(h.template==="block"?oi.block.sprite:Ci[h.template].sprite,h.at.c,c);for(let h of e.blocks??[])l(h.at,c)&&s(oi.block.sprite,h.at.c,h.at.r);for(let h of e.hazards)l(h.at,c)&&s(Ci[h.kind].sprite,h.at.c,h.at.r);i.cow&&i.cow.r===c&&s("cow-standing",i.cow.c,c),l(e.minotaur,c)&&s(i.stone>0?"minotaur-stone":"minotaur",e.minotaur.c,e.minotaur.r),l(e.player,c)&&s("theseus",e.player.c,e.player.r)}return r}var zn=8,b_=10;function jr(i){return!(i instanceof HTMLImageElement)||i.complete&&i.naturalWidth>0}function Yh(i,e,t){let n=new Map,r=new Map,s=i.cell,o=i.cell+i.rise;function a(h,u){let d=i.sprites[h];if(!d||!jr(e))return;let f=u.getContext("2d");f.clearRect(0,0,u.width,u.height),f.shadowColor="rgba(8,5,3,0.9)",f.shadowBlur=6;for(let g=0;g<2;g++)f.drawImage(e,d.x,d.y,s,o,zn,zn,s,o);f.shadowColor="transparent",f.drawImage(e,d.x,d.y,s,o,zn,zn,s,o)}function l(){for(let[h,u]of r){a(h,u);let d=n.get(h)?.map;d&&(d.needsUpdate=!0)}r.size&&t()}!jr(e)&&e instanceof HTMLImageElement&&e.addEventListener("load",l,{once:!0});function c(h){let u=n.get(h);if(u)return u;if(!i.sprites[h])return null;let f=document.createElement("canvas");f.width=s+2*zn,f.height=o+2*zn,a(h,f),r.set(h,f);let g=new si(f);g.colorSpace=yt;let x=new bi({map:g,depthTest:!1,depthWrite:!1,transparent:!0,fog:!1,toneMapped:!1});return n.set(h,x),x}return{make(h){let u=c(h);if(!u)return null;let d=new fr(u),f=.75*(s+2*zn)/s;return d.scale.set(f,f*(o+2*zn)/(s+2*zn),1),d.center.set(.5,0),d.renderOrder=b_,d},dispose(){e instanceof HTMLImageElement&&e.removeEventListener("load",l),r.clear();for(let h of n.values())h.map?.dispose(),h.dispose();n.clear()}}}function Zh(i,e,t,n){let r=document.createElement("div");r.className="minimap";let s=document.createElement("canvas");s.id="minimap",s.setAttribute("aria-hidden","true");let o=document.createElement("canvas");o.id="minimap-view",o.setAttribute("role","img"),o.setAttribute("aria-label","Mini map: the whole level from above; the outline is what the camera sees. Tap to look there."),r.append(s,o),i.append(r);let a=Xh(s,e,t),l=o.getContext("2d"),c=null,h=null,u=0,d=0,f=0,g=0,x=0,p=1,m=0;function y(){if(!c)return;let I=c.s.level.cols,N=c.s.level.rows,q=Ph(u||1280,d||800,I,N);if(I===f&&N===g&&q===x)return;f=I,g=N,x=q,a.size(f,g,x);let D=window.devicePixelRatio||1;o.width=s.width,o.height=s.height,o.style.width=s.style.width,o.style.height=s.style.height,p=s.width/D/f,m=s.height/D-g*p}function _(){!c||!jr(t)||a.paint(qh(c.s,c.f,e,0),c.thread??void 0)}function S(){if(!h||!f)return;let I=window.devicePixelRatio||1;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,o.width,o.height),l.setTransform(I,0,0,I,0,0);let N=Rh(h.c,h.aspect),q=k=>Ih(k,f,g,p,m);l.save(),l.beginPath(),l.rect(0,m,f*p,g*p),l.clip(),l.beginPath(),N.corners.map(q).forEach(([k,K],$)=>$?l.lineTo(k,K):l.moveTo(k,K)),l.closePath(),l.fillStyle="rgba(255,230,180,0.10)",l.fill(),l.lineWidth=1.5,l.strokeStyle="#ffd890",l.stroke();let[D,O]=N.tick.map(q);l.beginPath(),l.moveTo(D[0],D[1]),l.lineTo(O[0],O[1]),l.stroke(),l.restore()}let E=()=>_();jr(t)||t.addEventListener("load",E,{once:!0});let v=!1,T=I=>{if(n.blocked()||!f)return;let N=o.getBoundingClientRect();n.look(Lh(I.clientX-N.left,I.clientY-N.top,f,g,p,m))},U=I=>{if(!n.blocked()){v=!0;try{o.setPointerCapture(I.pointerId)}catch{}T(I)}},M=I=>{v&&T(I)},w=()=>{v=!1};return o.addEventListener("pointerdown",U),o.addEventListener("pointermove",M),o.addEventListener("pointerup",w),o.addEventListener("pointercancel",w),{paint(I,N,q){c={s:I,f:N,thread:q},y(),_(),S()},view(I,N){h={c:{...I},aspect:N},S()},fit(I,N){u=I,d=N;let q=x;y(),x!==q&&(_(),S())},dispose(){t.removeEventListener("load",E),r.remove()}}}var Qr={floor:"flag",wall:"none",exit:"none","gate-closed":"flag","gate-open":"flag",water:"water",fire:"ember",ice:"ice","force-up":"force","force-down":"force","force-left":"force","force-right":"force",dirt:"dirt",safe:"flag",button:"flag","toggle-open":"flag","toggle-closed":"flag","door-red":"flag","door-blue":"flag","door-yellow":"flag","door-green":"flag",trap:"flag","button-brown":"flag","button-red":"flag",popup:"flag",gravel:"gravel",teleport:"flag",thief:"flag",bomb:"flag","clone-up":"flag","clone-down":"flag","clone-left":"flag","clone-right":"flag"};function ul(i,e){let t=i.terrain[e],n=Kr[t].sprites;if(t==="clone"){let r=Math.floor(e/i.level.cols),s=e%i.level.cols,o=i.level.machines.find(a=>a.at.r===r&&a.at.c===s);return n[$r.indexOf(o?.dir??"up")]}return t==="gate"&&i.relicsLeft===0?n[1]:n[0]}var Jh=["theseus","minotaur","minotaur-stone"];function $h(i,e){let t=[],n=i.level.cols;i.objects.forEach((r,s)=>{if(!r)return;let o=Math.floor(s/n),a=s%n;r==="block"&&e.blocks?.some(l=>l.origin.r===o&&l.origin.c===a)||t.push({model:oi[r].sprite,r:o,c:a,id:`o${s}`})});for(let r of i.level.machines){let s=r.template==="block"?oi.block.sprite:Ci[r.template].sprite;t.push({model:s,r:r.at.r,c:r.at.c,id:`machine${r.at.r*n+r.at.c}`,dir:r.dir})}for(let r of e.blocks??[])t.push({model:"block",r:r.at.r,c:r.at.c,id:null});for(let r of e.hazards){let s=i.hazards.find(o=>o.kind===r.kind&&o.at.r===r.at.r&&o.at.c===r.at.c);t.push({model:Ci[r.kind].sprite,r:r.at.r,c:r.at.c,id:null,dir:s?.dir})}return i.cow&&t.push({model:"cow-standing",r:i.cow.r,c:i.cow.c,id:"cow"}),e.minotaur&&t.push({model:i.stone>0?"minotaur-stone":"minotaur",r:e.minotaur.r,c:e.minotaur.c,id:"minotaur"}),t.push({model:"theseus",r:e.player.r,c:e.player.c,id:"theseus"}),t}function Kh(i,e){if(i===0||e.length<20)return i;let t=e.slice(-20).sort((r,s)=>r-s);return((t[20/2-1]??0)+(t[20/2]??0))/2>40?i-1:i}function jh(i,e){return i?e:null}var es=new P;function ln(i,e,t,n,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;es.copy(e),es[n]=0,es.normalize();let c=.5*o/(o+a),h=1-es.angleTo(i)/l;return Math.sign(es[t])===1?h*c:a/(o+a)+c+c*(1-h)}var Mn=class extends Jt{constructor(e=1,t=1,n=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,n/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new P,l=new P,c=new P(e,t,n).divideScalar(2).subScalar(s),h=this.attributes.position.array,u=this.attributes.normal.array,d=this.attributes.uv.array,f=h.length/6,g=new P,x=.5/r;for(let p=0,m=0;p<h.length;p+=3,m+=2)switch(a.fromArray(h,p),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),h[p+0]=c.x*Math.sign(a.x)+l.x*s,h[p+1]=c.y*Math.sign(a.y)+l.y*s,h[p+2]=c.z*Math.sign(a.z)+l.z*s,u[p+0]=l.x,u[p+1]=l.y,u[p+2]=l.z,Math.floor(p/f)){case 0:g.set(1,0,0),d[m+0]=ln(g,l,"z","y",s,n),d[m+1]=1-ln(g,l,"y","z",s,t);break;case 1:g.set(-1,0,0),d[m+0]=1-ln(g,l,"z","y",s,n),d[m+1]=1-ln(g,l,"y","z",s,t);break;case 2:g.set(0,1,0),d[m+0]=1-ln(g,l,"x","z",s,e),d[m+1]=ln(g,l,"z","x",s,n);break;case 3:g.set(0,-1,0),d[m+0]=1-ln(g,l,"x","z",s,e),d[m+1]=1-ln(g,l,"z","x",s,n);break;case 4:g.set(0,0,1),d[m+0]=1-ln(g,l,"x","y",s,e),d[m+1]=1-ln(g,l,"y","x",s,t);break;case 5:g.set(0,0,-1),d[m+0]=ln(g,l,"x","y",s,e),d[m+1]=1-ln(g,l,"y","x",s,t);break}}};var yo=class extends Bn{constructor(e=null){super();let t=new Jt;t.deleteAttribute("uv");let n=new gn({side:Nt}),r=new gn,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let o=new an(16777215,s,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new pe(t,n);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let l=new pe(t,r);l.position.set(-10.906,2.009,1.846),l.rotation.set(0,-.195,0),l.scale.set(2.328,7.905,4.651),this.add(l);let c=new pe(t,r);c.position.set(-5.607,-.754,-.758),c.rotation.set(0,.994,0),c.scale.set(1.97,1.534,3.955),this.add(c);let h=new pe(t,r);h.position.set(6.167,.857,7.803),h.rotation.set(0,.561,0),h.scale.set(3.927,6.285,3.687),this.add(h);let u=new pe(t,r);u.position.set(-2.017,.018,6.124),u.rotation.set(0,.333,0),u.scale.set(2.002,4.566,2.064),this.add(u);let d=new pe(t,r);d.position.set(2.291,-.756,-2.621),d.rotation.set(0,-.286,0),d.scale.set(1.546,1.552,1.496),this.add(d);let f=new pe(t,r);f.position.set(-2.193,-.369,-5.547),f.rotation.set(0,.516,0),f.scale.set(3.875,3.487,2.986),this.add(f);let g=new pe(t,_r(50));g.position.set(-16.116,14.37,8.208),g.scale.set(.1,2.428,2.739),this.add(g);let x=new pe(t,_r(50));x.position.set(-16.109,18.021,-8.207),x.scale.set(.1,2.425,2.751),this.add(x);let p=new pe(t,_r(17));p.position.set(14.904,12.198,-1.832),p.scale.set(.15,4.265,6.331),this.add(p);let m=new pe(t,_r(43));m.position.set(-.462,8.89,14.52),m.scale.set(4.38,5.441,.088),this.add(m);let y=new pe(t,_r(20));y.position.set(3.235,11.486,-12.541),y.scale.set(2.5,2,.1),this.add(y);let _=new pe(t,_r(100));_.position.set(0,20,0),_.scale.set(1,.1,1),this.add(_)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function _r(i){let e=new vn;return e.color.setScalar(i),e}function Rt(i){return()=>(i=i*1664525+1013904223>>>0,i/4294967296)}function Xt(i,e,t=!0){let n=document.createElement("canvas");n.width=n.height=i,e(n.getContext("2d"),i);let r=new si(n);return t&&(r.colorSpace=yt),r.wrapS=r.wrapT=cr,r.anisotropy=4,r}function ft(i,e,t,n,r,s,o,a,l=!0){for(let c=0;c<n;c++){let h=t()*e,u=t()*e,d=o+t()*(a-o);i.fillStyle=`rgba(${r},${(s*(.3+.7*t())).toFixed(3)})`;let f=l?[-e,0,e]:[0];for(let g of f)for(let x of f)l&&(Math.abs(h+g-e/2)>e/2+d||Math.abs(u+x-e/2)>e/2+d)||(i.beginPath(),i.arc(h+g,u+x,d,0,7),i.fill())}}function ts(i,e,t){let n=i.createRadialGradient(e/2,e/2,e*.3,e/2,e/2,e*.72);n.addColorStop(0,"rgba(0,0,0,0)"),n.addColorStop(1,`rgba(20,14,10,${t})`),i.fillStyle=n,i.fillRect(0,0,e,e)}function dl(i,e,t,n,r,s,o){i.strokeStyle=r,i.lineWidth=s;for(let a=0;a<n;a++){i.beginPath();let l=t()*e,c=t()*e;i.moveTo(l,c);for(let h=0;h<6;h++)l+=(t()-.5)*o,c+=(t()-.5)*o,i.lineTo(l,c);i.stroke()}}var S_=i=>Xt(256,(e,t)=>{let n=Rt(i);e.fillStyle="#7d6c5a",e.fillRect(0,0,t,t),ft(e,t,n,260,"40,32,26",.1,6,26,!1),ft(e,t,n,220,"170,150,124",.08,5,20,!1),ft(e,t,n,1800,"30,24,20",.18,.6,2,!1),ft(e,t,n,900,"200,182,156",.12,.6,1.6,!1),dl(e,t,n,2,"rgba(28,22,18,.55)",1.3,60),ts(e,t,.55)}),w_=()=>Xt(256,(i,e)=>{let t=Rt(7);i.fillStyle="#1b1612",i.fillRect(0,0,e,e);let n=e/4,r=e/2;for(let s=0;s<4;s++){let o=s%2?r/2:0;for(let a=-1;a<3;a++){let l=a*r+o,c=s*n,h=.75+t()*.35;i.fillStyle=`rgb(${92*h|0},${81*h|0},${70*h|0})`;for(let u of[0,e])i.fillRect(l+3-u,c+3,r-6,n-6)}}ft(i,e,t,1400,"20,16,12",.25,.7,2.2),ft(i,e,t,500,"160,140,118",.14,.7,2),ft(i,e,t,60,"25,20,16",.25,4,12)}),E_=()=>Xt(256,(i,e)=>{let t=Rt(11);i.fillStyle="#857a6c",i.fillRect(0,0,e,e),ft(i,e,t,200,"30,26,22",.2,6,24),ft(i,e,t,1500,"20,18,15",.25,.6,2),ft(i,e,t,600,"130,118,104",.12,.6,1.8)});function T_(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),n=t.createImageData(128,128),r=[[1,2,.3],[3,-1,1.7],[-2,3,4.1],[4,1,2.2],[-3,-4,5.3],[5,-3,.9]],s=(l,c)=>r.reduce((h,[u,d,f],g)=>h+Math.sin(2*Math.PI*(u*l+d*c)/128+f)/(1+g*.6),0),o=new P;for(let l=0;l<128;l++)for(let c=0;c<128;c++){let h=s(c+1,l)-s(c-1,l),u=s(c,l+1)-s(c,l-1);o.set(-h*1.4,-u*1.4,1).normalize();let d=(l*128+c)*4;n.data[d]=(o.x*.5+.5)*255,n.data[d+1]=(o.y*.5+.5)*255,n.data[d+2]=(o.z*.5+.5)*255,n.data[d+3]=255}t.putImageData(n,0,0);let a=new si(e);return a.wrapS=a.wrapT=cr,a}var A_=()=>Xt(256,(i,e)=>{let t=Rt(21);i.fillStyle="#1c120d",i.fillRect(0,0,e,e),ft(i,e,t,200,"50,30,20",.3,4,18,!1),i.lineCap="round";for(let n=0;n<14;n++){i.strokeStyle=`rgba(${200+t()*55|0},${70+t()*80|0},20,.9)`,i.lineWidth=1+t()*2.5,i.shadowColor="#ff6a10",i.shadowBlur=8,i.beginPath();let r=t()*e,s=t()*e;i.moveTo(r,s);for(let o=0;o<5;o++)r+=(t()-.5)*70,s+=(t()-.5)*70,i.lineTo(r,s);i.stroke()}i.shadowBlur=0,ts(i,e,.7)}),C_=()=>Xt(256,(i,e)=>{let t=Rt(31);for(let n=0;n<5;n++){let r=.85+t()*.25;i.fillStyle=`rgb(${196*r|0},${150*r|0},${98*r|0})`,i.fillRect(n*e/5,0,e/5,e),i.fillStyle="rgba(60,36,18,.6)",i.fillRect(n*e/5,0,2,e)}for(let n=0;n<160;n++){i.strokeStyle=`rgba(90,58,30,${.08+t()*.15})`,i.lineWidth=.6+t();let r=t()*e;i.beginPath(),i.moveTo(r,0),i.bezierCurveTo(r+(t()-.5)*8,e*.3,r+(t()-.5)*8,e*.7,r+(t()-.5)*6,e),i.stroke()}}),R_=()=>Xt(256,(i,e)=>{let t=Rt(51);i.fillStyle="#3a2414",i.fillRect(0,0,e,e),ft(i,e,t,500,"20,12,6",.25,.6,2.4,!1),ft(i,e,t,80,"90,60,34",.15,4,16,!1),i.strokeStyle="#d8a640",i.lineWidth=22,i.lineJoin="miter";for(let n of[78,178])i.beginPath(),i.moveTo(40,n+38),i.lineTo(128,n-34),i.lineTo(216,n+38),i.stroke();i.strokeStyle="rgba(0,0,0,.6)",i.lineWidth=10,i.strokeRect(5,5,e-10,e-10)}),P_=()=>Xt(256,(i,e)=>{let t=Rt(61);i.fillStyle="#b6dcea",i.fillRect(0,0,e,e),ft(i,e,t,120,"230,246,252",.25,6,30,!1),ft(i,e,t,90,"120,170,196",.15,6,24,!1),dl(i,e,t,6,"rgba(250,254,255,.8)",1.6,90),ts(i,e,.25)}),I_=()=>Xt(256,(i,e)=>{let t=Rt(71);i.fillStyle="#6a4626",i.fillRect(0,0,e,e),ft(i,e,t,260,"40,24,12",.22,4,20,!1),ft(i,e,t,200,"140,98,58",.16,3,14,!1),ft(i,e,t,2200,"30,18,8",.25,.6,2,!1),ft(i,e,t,40,"170,160,150",.7,2,4.5,!1),ts(i,e,.45)}),L_=()=>Xt(256,(i,e)=>{let t=Rt(81);i.fillStyle="#5e5a54",i.fillRect(0,0,e,e),ft(i,e,t,1600,"30,28,26",.3,.8,3,!1),ft(i,e,t,500,"160,154,146",.25,1,4,!1),ts(i,e,.45)}),D_=()=>{let i=Xt(256,(e,t)=>{e.translate(t/2,t/2),e.strokeStyle="rgba(214,200,160,.55)",e.lineWidth=3,e.beginPath();for(let n=0;n<6;n++){let r=n/6*Math.PI*2+.3;e.lineTo(Math.cos(r)*112,Math.sin(r)*112)}e.closePath(),e.stroke();for(let n=0;n<28;n++){let r=n/28*Math.PI*2;e.save(),e.rotate(r),e.translate(76,0),e.rotate(n%2?.6:-.6),e.fillStyle=n%2?"#4f7a3a":"#3d6a30",e.beginPath(),e.ellipse(0,0,14,6,0,0,7),e.fill(),e.restore()}});return i.wrapS=i.wrapT=Ut,i},U_=()=>{let i=Xt(256,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,"#f2fbff"),n.addColorStop(.35,"#6fc0ef"),n.addColorStop(1,"#1a4f9a"),e.fillStyle=n,e.fillRect(0,0,t,t),e.translate(t/2,t/2),e.lineCap="round";for(let r=0;r<3;r++){e.strokeStyle="rgba(255,255,255,.85)",e.lineWidth=9,e.beginPath();for(let s=0;s<=60;s++){let o=s/60,a=r*(Math.PI*2/3)+o*4.2,l=8+o*110;e.lineTo(Math.cos(a)*l,Math.sin(a)*l)}e.stroke()}});return i.wrapS=i.wrapT=Ut,i},N_=()=>{let i=Xt(256,(e,t)=>{e.fillStyle="#3a1f52",e.fillRect(0,0,t,t),ft(e,t,Rt(91),300,"20,10,30",.3,1,4,!1),e.fillStyle="#e0a838",e.translate(t/2,t/2+18),e.beginPath(),e.roundRect(-46,-30,92,92,30),e.fill();for(let[n,r,s]of[[-34,70,18],[-12,92,19],[12,96,19],[35,78,18]])e.beginPath(),e.roundRect(n-s/2,-30-r,s,r+20,s/2),e.fill();e.save(),e.translate(-50,14),e.rotate(-.8),e.beginPath(),e.roundRect(-11,-58,22,66,11),e.fill(),e.restore()});return i.wrapS=i.wrapT=Ut,i},O_=()=>Xt(256,(i,e)=>{let t=Rt(41);i.fillStyle="#ad9f86",i.fillRect(0,0,e,e),ft(i,e,t,300,"60,52,44",.15,4,20,!1),ft(i,e,t,1500,"50,44,38",.2,.6,2,!1),dl(i,e,t,4,"rgba(60,50,40,.45)",2,40);let n=(r,s,o)=>{i.save(),i.translate(e/2+r,e/2+s),i.fillStyle=o,i.fillRect(-7,-80,14,160);for(let a of[-1,1])i.beginPath(),i.moveTo(0,-38),i.quadraticCurveTo(a*60,-70,a*78,-50),i.quadraticCurveTo(a*58,0,a*78,50),i.quadraticCurveTo(a*60,70,0,38),i.fill();i.restore()};n(3,3,"rgba(225,210,185,.35)"),n(0,0,"rgba(40,32,26,.4)"),i.strokeStyle="rgba(40,32,26,.6)",i.lineWidth=6,i.strokeRect(10,10,e-20,e-20)}),F_=()=>{let i=Xt(64,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,"rgba(255,220,160,1)"),n.addColorStop(.35,"rgba(255,150,60,.45)"),n.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=n,e.fillRect(0,0,t,t)});return i.wrapS=i.wrapT=Ut,i},De=(i,e={})=>new gn({color:i,roughness:.8,metalness:0,...e}),kn=(i,e=.9)=>new vn({color:i,transparent:!0,opacity:e,blending:or,depthWrite:!1});function Qh(i){let e=new dr(i),t=new yo(i),n=e.fromScene(t,.04).texture;t.dispose(),e.dispose();let r=(c,h=.35,u={})=>De(c,{roughness:h,metalness:.85,envMap:n,envMapIntensity:.55,...u}),s={brick:w_(),cap:E_(),water:T_(),ember:A_(),wood:C_(),force:R_(),ice:P_(),dirt:I_(),gravel:L_(),wreath:D_(),swirl:U_(),hand:N_(),halo:F_(),block:O_(),flags:[101,202,303].map(S_)},o={under:De(789e3,{roughness:1}),mortar:De(1511950,{roughness:1}),flags:s.flags.map(c=>De(16777215,{map:c,roughness:.88})),ember:De(16777215,{map:s.ember,emissiveMap:s.ember,emissive:16742960,emissiveIntensity:.9,roughness:.9}),ice:De(10274004,{map:s.ice,roughness:.08,metalness:.1,envMap:n,envMapIntensity:.35}),force:De(16777215,{map:s.force,roughness:.7}),dirt:De(16777215,{map:s.dirt,roughness:.97}),gravelBed:De(16777215,{map:s.gravel,roughness:.95}),pebble:De(9076850,{roughness:.9}),water:De(1722962,{roughness:.14,metalness:.1,normalMap:s.water,normalScale:new j(.55,.55),emissive:399388,envMap:n,envMapIntensity:.25}),basin:De(925216,{roughness:.9}),side:De(12760226,{map:s.brick,roughness:.93}),top:De(11576984,{map:s.cap,roughness:.95}),wood:De(16777215,{map:s.wood,roughness:.75}),darkWood:De(9071178,{map:s.wood,roughness:.8}),iron:r(3025446,.6),bronze:r(11827770,.4),gold:r(14198336,.3,{emissive:2758144}),stone:De(9075818),paleStone:De(13285530,{roughness:.85}),dark:De(657415),glow:new vn({color:16751168}),keyColor:{red:De(11020316,{roughness:.5,emissive:2098178}),blue:De(2775720,{roughness:.5,emissive:264736}),yellow:r(14198336,.3,{emissive:2758144}),green:De(4160082,{roughness:.45,metalness:.3,envMap:n,envMapIntensity:.3})},brownButton:De(6962718,{roughness:.55}),redButton:De(11545116,{roughness:.45,emissive:2753538}),cream:De(15260864,{roughness:.6}),wreath:new gn({map:s.wreath,transparent:!0,roughness:.8,depthWrite:!1}),swirl:new gn({map:s.swirl,emissiveMap:s.swirl,emissive:new Ye(6994175),emissiveIntensity:.9,roughness:.3}),hand:De(16777215,{map:s.hand,roughness:.6}),clay:De(11564104,{roughness:.75}),block:De(16777215,{map:s.block,roughness:.85}),skin:De(12618338,{roughness:.7}),tunic:De(2383482,{roughness:.8}),cloak:De(9054750),leather:De(5913122,{roughness:.8}),steel:r(13225424,.3),fur:De(4072984,{roughness:.95}),furDark:De(2496271,{roughness:.95}),snout:De(6965814),ivory:De(14866106,{roughness:.5}),kilt:De(8003094),hoof:De(1314832),eye:new vn({color:16730650}),statue:De(9342088,{roughness:.9}),statueDark:De(6973540,{roughness:.92}),parchment:De(14864546),teal:De(2857618,{roughness:.4}),boot:De(9316884,{roughness:.6}),bootTrim:De(14715424,{emissive:5906944}),skate:De(11057352,{roughness:.5}),suction:De(2779722,{roughness:.55}),mirror:r(15132390,.08,{envMapIntensity:1}),gorgon:De(3111498,{roughness:.5}),cake:De(14721088,{roughness:.6}),hide:De(15656664,{roughness:.7}),patch:De(5911072,{roughness:.8}),feather:De(6964262,{roughness:.85}),halo:s.halo,env:n},a=new Set([n,...s.flags,...Object.values(s).filter(c=>c instanceof si)]);for(let c of Object.values(o))c&&typeof c=="object"&&"isMaterial"in c?a.add(c):Array.isArray(c)&&c.forEach(h=>a.add(h));for(let c of Object.values(o.keyColor))a.add(c);return{t:s,m:o,metal:r,std:De,keeps:a,dispose:()=>{for(let c of a)c.dispose()}}}var de=.1,Tt=(i,e)=>i-(e-1)/2,Pt=(i,e)=>i-(e-1)/2,B_={"force-up":0,"force-left":Math.PI/2,"force-down":Math.PI,"force-right":-Math.PI/2},eu=26;function tu(i){let{m:e}=i,t=new Ce,n=new Mn(.93,.12,.93,2,.035);n.translate(0,de-.06,0);let r=new rn(1,1);r.rotateX(-Math.PI/2),r.translate(0,.035,0);let s=new ao(.045,0),o=new pe(new rn(1,1),e.under);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,t.add(o);let a=new rn(1,1);a.rotateX(-Math.PI/2);let l=[],c=(u,d,f)=>{let g=new Qs(u,d,Math.max(1,f));return g.count=f,g.receiveShadow=!0,l.push(g),t.add(g),g},h=()=>{for(let u of l)t.remove(u),u.dispose();l=[]};return{group:t,set(u,d,f){h();let g=new pn([new j(-100,-100),new j(100,-100),new j(100,100),new j(-100,100)]);g.holes.push(new pr([new j(-f/2,-d/2),new j(-f/2,d/2),new j(f/2,d/2),new j(f/2,-d/2)])),o.geometry.dispose(),o.geometry=new lo(g);let x=[[],[],[]],p={ember:[],ice:[],force:[],dirt:[],gravel:[],water:[],mortar:[]};u.forEach((v,T)=>{let U=Qr[v];v!=="exit"&&p.mortar.push(T),U==="flag"?x[Rt(T*2654435761+7)()*3|0].push(T):U!=="none"&&p[U].push(T)});let m=new ct,y=new Ye,_=(v,T,U,M)=>{T.forEach((w,I)=>{let N=Rt(w*40503+11);if(m.makeRotationY(U(w,N)).setPosition(Tt(w%f,f),0,Pt(Math.floor(w/f),d)),v.setMatrixAt(I,m),M){let q=.78+N()*.3;v.setColorAt(I,y.setRGB(q*(1+(N()-.5)*.06),q,q*(1-N()*.06)))}})},S=(v,T)=>(T()*4|0)*(Math.PI/2);_(c(a,e.mortar,p.mortar.length),p.mortar,()=>0,!1),x.forEach((v,T)=>_(c(n,e.flags[T],v.length),v,S,!0)),_(c(n,e.ember,p.ember.length),p.ember,S,!1),_(c(n,e.ice,p.ice.length),p.ice,S,!1),_(c(n,e.dirt,p.dirt.length),p.dirt,S,!0),_(c(n,e.gravelBed,p.gravel.length),p.gravel,S,!0),_(c(n,e.force,p.force.length),p.force,v=>B_[u[v]]??0,!1),_(c(r,e.water,p.water.length),p.water,()=>0,!1);let E=p.gravel;if(E.length){let v=c(s,e.pebble,E.length*eu);v.castShadow=!0;let T=0;for(let U of E){let M=Rt(U*7919+3);for(let w=0;w<eu;w++){let I=.7+M()*.5;m.makeScale(I,.6*I,I).setPosition(Tt(U%f,f)+(M()-.5)*.8,de+.015,Pt(Math.floor(U/f),d)+(M()-.5)*.8),v.setMatrixAt(T,m),v.setColorAt(T++,y.setScalar(.75+M()*.5))}}}},loop(u){i.t.water.offset.set(Math.sin(u*.5)*.04,u*.025%1),e.water.emissiveIntensity=1+.15*Math.sin(u*1.3)},dispose(){h(),n.dispose(),r.dispose(),s.dispose(),a.dispose(),o.geometry.dispose()}}}function vo(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),r=new Set(Object.keys(i[0].morphAttributes)),s={},o={},a=i[0].morphTargetsRelative,l=new Mt,c=0;for(let h=0;h<i.length;++h){let u=i[h],d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;s[f]===void 0&&(s[f]=[]),s[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!r.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0,u=[];for(let d=0;d<i.length;++d){let f=i[d].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=i[d].attributes.position.count}l.setIndex(u)}for(let h in s){let u=nu(s[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let x=0;x<o[h].length;++x)f.push(o[h][x][d]);let g=nu(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function nu(i){let e,t,n,r=-1,s=0;for(let c=0;c<i.length;++c){let h=i[c];if(h.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=h.gpuType),r!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=h.array.length}let o=new e(s),a=0;for(let c=0;c<i.length;++c)o.set(i[c].array,a),a+=i[c].array.length;let l=new Ot(o,t,n);return r!==void 0&&(l.gpuType=r),l}var xn=1.25,xr=.38,bn={n:{d:[-1,0],v:[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]],n:[0,0,-1],u:i=>-i[0]},s:{d:[1,0],v:[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]],n:[0,0,1],u:i=>i[0]},w:{d:[0,-1],v:[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]],n:[-1,0,0],u:i=>i[2]},e:{d:[0,1],v:[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]],n:[1,0,0],u:i=>-i[2]}},z_=Object.keys(bn);function iu(i){let e=[],t=[],n=[],r=[],s=new Mt,o=0;for(let{v:a,n:l,uvs:c,mat:h}of i){let u=e.length/3;a.forEach((d,f)=>{e.push(...d),t.push(...l),n.push(...c[f])}),r.push(u,u+1,u+2,u,u+2,u+3),s.addGroup(o,6,h),o+=6}return s.setAttribute("position",new tt(e,3)),s.setAttribute("normal",new tt(t,3)),s.setAttribute("uv",new tt(n,2)),s.setIndex(r),s}var ru=(i,e,t)=>({v:bn[i].v,n:bn[i].n,mat:0,uvs:bn[i].v.map(n=>[bn[i].u([n[0]+e,0,n[2]+t]),n[1]*xn])}),fl=[];for(let i of[.15,.5,.85])for(let e of[.15,.5,.85])for(let t of[.15,.5,.85])fl.push([i,e,t]);function k_(i,e,t,n){let r=-1e9,s=1e9;for(let o=0;o<3;o++){if(Math.abs(e[o])<1e-9){if(i[o]<t[o]||i[o]>n[o])return-1;continue}let a=(t[o]-i[o])/e[o],l=(n[o]-i[o])/e[o];if(a>l&&([a,l]=[l,a]),a>r&&(r=a),l<s&&(s=l),r>s)return-1}return r}function su(i){let e=new Ce,t=[],n=new Map,r=0,s="solid",o=new P,a=c=>{let h=c.op<.999;for(let u of c.mats)u.transparent!==h&&(u.transparent=h,u.needsUpdate=!0),u.opacity=c.op},l=()=>{for(let c of t){e.remove(c.mesh),c.mesh.geometry.dispose();for(let h of c.inner)h.mesh.geometry.dispose();for(let h of c.mats)h.dispose()}t=[],n.clear()};return{group:e,list:()=>t,at:(c,h)=>n.get(c*r+h),build(c,h,u){l(),r=u;let d=(g,x)=>g<0||x<0||g>=h||x>=r||c[g*r+x]==="wall",f=s==="low"?xr:xn;for(let g=0;g<h;g++)for(let x=0;x<r;x++){if(c[g*r+x]!=="wall")continue;let p=Tt(x,r),m=Pt(g,h),y=[{v:[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]],n:[0,1,0],mat:1,uvs:[[p-.5,-m-.5],[p+.5,-m-.5],[p+.5,-m+.5],[p-.5,-m+.5]]}],_=[];for(let T of z_){let[U,M]=bn[T].d,w=g+U,I=x+M;d(w,I)&&w>=0&&I>=0&&w<h&&I<r?_.push(T):y.push(ru(T,p,m))}let S=[i.m.side.clone(),i.m.top.clone()],E=new pe(iu(y),S);E.position.set(p,0,m),E.scale.y=f,E.castShadow=E.receiveShadow=!0,e.add(E);let v={r:g,c:x,x:p,z:m,mesh:E,mats:S,op:1,target:1,inner:[]};for(let T of _){let U=new pe(iu([ru(T,p,m)]),[S[0]]);U.visible=!1,E.add(U),v.inner.push({k:T,mesh:U,nb:null})}t.push(v),n.set(g*r+x,v)}for(let g of t)for(let x of g.inner){let[p,m]=bn[x.k].d;x.nb=n.get((g.r+p)*r+g.c+m)??null}},setMode(c){s=c;let h=c==="low"?xr:xn;for(let u of t)u.mesh.scale.y=h},aim(c,h){let u=new Map,d=s==="low"?xr:xn;c.getWorldDirection(o);let f=[o.x,o.y,o.z],g=30;for(let x of h){let p=t.filter(y=>Math.abs(y.x-x.x)<3.2&&Math.abs(y.z-x.z)<3.2);if(p.length===0)continue;let m=new Map;for(let[y,_,S]of fl){let E=[x.x-x.half+2*x.half*y,de+x.h*_,x.z-x.half+2*x.half*S],v=[E[0]-f[0]*g,E[1]-f[1]*g,E[2]-f[2]*g];for(let T of p){let U=k_(v,f,[T.x-.49,0,T.z-.49],[T.x+.49,d,T.z+.49]);U>=0&&U<g-.01&&m.set(T,(m.get(T)??0)+1)}}for(let[y,_]of m)u.set(y,Math.max(u.get(y)??0,_/fl.length))}for(let x of t){let p=Math.min(1,Math.max(0,((u.get(x)??0)-.03)/.45));x.target=Bh(p*p*(3-2*p))}},ease(c,h){let u=!1;for(let d of t)d.op!==d.target&&(d.op=h?d.target:zh(d.op,d.target,c),u=!0,a(d));if(u)for(let d of t)for(let f of d.inner)f.mesh.visible=!!f.nb&&f.nb.op<.999&&d.op>f.nb.op+.02;return u},dispose:l}}var H=(i,e,t,n)=>(i.position.set(e,t,n),i),G_=(i,e,t,n=14)=>new fn(i,e,t,n),Be=(i,e,t,n,r=14)=>new pe(G_(i,e,t,r),n),ze=(i,e,t,n)=>new pe(new Jt(i,e,t),n),Ri=i=>(i.rotation.x=Math.PI/2,i);function V_(i){i.updateMatrixWorld(!0);let e=new Map;i.traverse(n=>{if(!(n instanceof pe))return;let r=n.geometry.clone().applyMatrix4(n.matrixWorld);r.index&&(r=r.toNonIndexed());for(let o of Object.keys(r.attributes))o!=="position"&&o!=="normal"&&o!=="uv"&&r.deleteAttribute(o);let s=n.material;e.set(s,[...e.get(s)??[],r]),n.geometry.dispose()});let t=new Ce;for(let[n,r]of e){let s=new pe(vo(r),n);r.forEach(o=>o.dispose()),s.castShadow=s.receiveShadow=!0,t.add(s)}return t}function st(i,e,t=[]){let n=V_(i);return t.length&&n.add(...t),n.userData=e,n}var Sn=()=>Object.assign(new Ce,{userData:{half:0,h:0}}),cu=i=>(i.wall(i.r-1,i.c)||i.wall(i.r+1,i.c))&&!(i.wall(i.r,i.c-1)&&i.wall(i.r,i.c+1));function Mo(i,e){let{m:t}=i.kit,n=t.keyColor[e],r=new Ce,s=1.1,o=.26;return r.add(H(ze(1,s,o,t.wood),0,s/2,0)),r.add(H(ze(1,.06,o+.02,t.iron),0,.34,0)),r.add(H(ze(1,.16,o+.02,n),0,.8,0)),r.add(H(ze(1,.1,o+.02,n),0,.06,0)),r.add(H(ze(1,.04,o+.02,n),0,s+.02,0)),r.add(H(ze(.16,.18,o+.04,t.iron),.24,.55,0)),r.add(Ri(H(Be(.05,.05,o+.08,n,12),.24,.55,0))),cu(i)&&(r.rotation.y=Math.PI/2),st(r,{half:.4,h:s,tall:!0})}function ou(i,e){let{m:t}=i.kit,n=new Ce;for(let r=0;r<6;r++)e?n.add(H(Be(.025,.012,.12,t.bronze,8),-.42+r*.168,1,0)):n.add(H(Be(.025,.025,1.05,t.bronze,8),-.42+r*.168,.55,0));if(!e)for(let r of[.3,.8])n.add(H(ze(1,.05,.05,t.bronze),0,r,0));for(let r of[-1,1])n.add(H(ze(.08,1.06,.12,t.darkWood),r*.47,.53,0));return n.add(H(ze(1,.16,.3,t.darkWood),0,1.1,0)),n.add(H(ze(1,.04,.32,t.bronze),0,1.2,0)),cu(i)&&(n.rotation.y=Math.PI/2),st(n,{half:.4,h:e?.3:1.05,tall:!0})}function H_(i){let{m:e}=i.kit,t=new Ce;for(let a=0;a<3;a++)t.add(H(ze(.25,.08,.9,e.stone),-.375+a*.25,de-.04-a*.12,0));for(let a of[-1,1])t.add(H(ze(1,.7,.05,e.stone),0,de-.35,a*.475));t.add(H(ze(.05,.7,.9,e.stone),.475,de-.35,0));let n=H(new pe(new rn(.25,.9),e.glow),.375,-.32,0);n.rotation.x=-Math.PI/2,t.add(n),t.add(H(ze(.3,.16,1.1,e.top),0,xn-.08,0));for(let a of[-1,1])t.add(H(ze(.16,xn-.16,.12,e.darkWood),0,(xn-.16)/2,a*.5));let r=[[0,-1],[-1,0],[1,0],[0,1]].find(([a,l])=>!i.wall(i.r+a,i.c+l)),[s,o]=r??[0,-1];return t.rotation.y=Math.atan2(s,-o),st(t,{half:.4,h:.3,tall:!0})}function au(i,e){let{m:t}=i.kit,n=new Ce;if(e){n.add(H(ze(.8,.72-.04,.8,t.dark),0,de+.72/2,0));for(let s of[de+.04,de+.72-.04])n.add(H(ze(.92,.08,.92,t.darkWood),0,s,0));for(let s of[-1,1])for(let o of[-1,1])n.add(H(ze(.1,.72,.1,t.darkWood),s*.41,de+.72/2,o*.41));for(let s=0;s<4;s++){let o=-.27+s*.18;for(let a of[-1,1])n.add(H(ze(.07,.72-.12,.05,t.wood),o,de+.72/2,a*.43)),n.add(H(ze(.05,.72-.12,.07,t.wood),a*.43,de+.72/2,o));n.add(H(ze(.07,.04,.8,t.wood),o,de+.72-.01,0))}return st(n,{half:.46,h:.72+.1})}n.add(H(ze(.84,.02,.84,t.dark),0,de+.005,0));for(let r of[-1,1])n.add(H(ze(.88,.04,.07,t.darkWood),0,de+.02,r*.42)),n.add(H(ze(.07,.04,.88,t.darkWood),r*.42,de+.02,0));for(let r=0;r<4;r++)n.add(H(ze(.08,.035,.8,t.wood),-.27+r*.18,de+.018,0));return st(n,{half:.42,h:.06})}function hu(i,e,t=.3){let n=new Ce;return n.add(H(Be(t,t+.03,.05,i,28),0,de+.025,0)),n.add(H(Be(t-.05,t-.04,.03,e,28),0,de+.06,0)),n}function W_(i){let{m:e}=i.kit,t=new Ce;t.add(H(Be(.28,.31,.05,e.iron,24),0,de+.025,0));let n=H(new pe(new mn(.21,20,10,0,Math.PI*2,0,Math.PI/2),e.brownButton),0,de+.04,0);return n.scale.y=.55,t.add(n),st(t,{half:.3,h:.16})}function lu(i,e){let{m:t}=i.kit,n=hu(t.bronze,e);return n.add(Ri(H(new pe(new on(.15,.018,8,32),t.cream),0,de+.077,0))),n.add(H(Be(.05,.055,.04,t.bronze,16),0,de+.08,0)),st(n,{half:.3,h:.12})}function X_(i){let{m:e}=i.kit,t=hu(e.bronze,e.dark,.34);for(let n=0;n<12;n++){let r=n/12*Math.PI*2;t.add(H(new pe(new Bt(.028,.12,6),e.iron),Math.cos(r)*.22,de+.13,Math.sin(r)*.22))}return t.add(H(Be(.1,.11,.04,e.bronze,16),0,de+.09,0)),st(t,{half:.34,h:.2})}function q_(i){let{m:e}=i.kit,t=new Ce;t.add(H(Be(.07,.08,.03,e.gold,18),0,de+.015,0));let n=st(t,{half:.4,h:.05}),r=new pe(new rn(.9,.9),e.wreath);return r.rotation.x=-Math.PI/2,r.position.y=de+.003,r.receiveShadow=!0,n.add(r),n}function Y_(i){let{m:e}=i.kit,t=new Ce;t.add(H(ze(.78,.04,.78,e.paleStone),0,de+.02,0));for(let n of[-1,1])t.add(H(ze(.9,.09,.07,e.darkWood),0,de+.045,n*.42)),t.add(H(ze(.07,.09,.9,e.darkWood),n*.42,de+.045,0));return st(t,{half:.45,h:.1})}function Z_(i){let{m:e}=i.kit,t=new Ce;t.add(H(Be(.36,.38,.06,e.bronze,32),0,de+.03,0));let n=st(t,{half:.36,h:.1}),r=H(Be(.3,.3,.02,e.swirl,32),0,de+.065,0);return r.receiveShadow=!0,n.add(r),n.userData.loop=s=>{r.rotation.y=-s*1.6},n}function J_(i){let{m:e}=i.kit,t=new Ce;t.add(H(Be(.36,.38,.06,e.gold,32),0,de+.03,0));let n=H(Be(.3,.3,.02,e.hand,32),0,de+.065,0);return n.rotation.y=Math.PI,t.add(n),st(t,{half:.36,h:.1})}function $_(i){let{m:e}=i.kit,t=new Ce,n=[[0,0],[.12,0],[.2,.08],[.22,.2],[.18,.32],[.08,.4],[.07,.46],[.09,.48],[0,.48]].map(([a,l])=>new j(a,l));t.add(H(new pe(new oo(n,24),e.clay),0,de,0)),t.add(Ri(H(new pe(new on(.205,.012,6,28),e.dark),0,de+.22,0)));let r=H(Be(.012,.012,.12,e.dark,6),.02,de+.53,0);r.rotation.z=-.3,t.add(r);let s=H(new pe(new Bt(.035,.1,8),kn(16760928)),.04,de+.62,0),o=st(t,{half:.22,h:.6},[s]);return o.userData.loop=a=>s.scale.set(1,1+.2*Math.sin(a*9),1),o}function bo(i,e){let{m:t}=i.kit,n=new Ce;n.add(H(new pe(new Mn(.86,.36,.86,2,.03),t.darkWood),0,de+.18,0)),n.add(H(ze(.64,.02,.64,t.dark),0,de+.365,0));for(let a of[-1,1])for(let l of[-1,1])n.add(H(Be(.03,.03,.02,t.gold,10),a*.37,de+.365,l*.37));let r=new pn;r.moveTo(0,.24),r.lineTo(.17,.04),r.lineTo(.07,.04),r.lineTo(.07,-.22),r.lineTo(-.07,-.22),r.lineTo(-.07,.04),r.lineTo(-.17,.04),r.closePath();let s=new pe(new wi(r,{depth:.025,bevelEnabled:!1}),t.gold);s.rotation.x=-Math.PI/2,s.position.y=de+.37;let o=new Ce;return o.add(s),o.rotation.y=e,n.add(o),st(n,{half:.43,h:.4})}function K_(i){let e=new Ce,t=Rt(i.r*31+i.c),n=[];for(let s=0;s<5;s++){let o=.3+t()*.28,a=H(new pe(new Bt(.08+t()*.05,o,7),kn(s%2?16738848:16756816,.8)),(t()-.5)*.55,de+o/2,(t()-.5)*.55);n.push(a),e.add(a)}let r=t()*6.28;return e.userData={half:.4,h:.5,loop:s=>n.forEach((o,a)=>o.scale.set(1,1+.12*Math.sin(s*(6+a)+r+a),1))},e}var uu={floor:Sn,wall:Sn,water:Sn,ice:Sn,dirt:Sn,gravel:Sn,"force-up":Sn,"force-down":Sn,"force-left":Sn,"force-right":Sn,exit:H_,fire:K_,"gate-closed":i=>ou(i,!1),"gate-open":i=>ou(i,!0),safe:q_,button:W_,trap:X_,popup:Y_,teleport:Z_,thief:J_,bomb:$_,"toggle-open":i=>au(i,!1),"toggle-closed":i=>au(i,!0),"door-red":i=>Mo(i,"red"),"door-blue":i=>Mo(i,"blue"),"door-yellow":i=>Mo(i,"yellow"),"door-green":i=>Mo(i,"green"),"button-brown":i=>lu(i,i.kit.m.brownButton),"button-red":i=>lu(i,i.kit.m.redButton),"clone-up":i=>bo(i,0),"clone-left":i=>bo(i,Math.PI/2),"clone-down":i=>bo(i,Math.PI),"clone-right":i=>bo(i,-Math.PI/2)};function ns(i,e){i.traverse(t=>{if(!(t instanceof pe))return;t.geometry.dispose();let n=Array.isArray(t.material)?t.material:[t.material];for(let r of n)e.keeps.has(r)||r.dispose()})}var Vt=(i,e,t=16,n=12)=>new pe(new mn(i,t,n),e);function fu(i,e,t){let n=new pn;n.moveTo(i[0][0],i[0][1]);for(let[s,o]of i.slice(1))n.lineTo(s,o);n.closePath();let r=new wi(n,{depth:e,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-e/2),new pe(r,t)}function j_(i){let{m:e}=i,t=new Ce;t.add(H(Be(.11,.13,.04,e.bronze,18),0,de+.02,0)),t.add(H(Be(.02,.022,.66,e.darkWood,8),0,de+.35,0)),t.add(H(Vt(.03,e.gold,10,8),0,de+.7,0));for(let n of[-1,1]){let r=fu([[.02,.05],[.12,.08],[.21,.17],[.16,0],[.21,-.17],[.12,-.08],[.02,-.05]].map(([s,o])=>[n*s,o]),.03,e.gold);t.add(H(r,0,de+.5,0))}return t.add(H(Be(.035,.035,.12,e.gold,10),0,de+.5,0)),st(t,{half:.22,h:.72})}function So(i,e){let{m:t}=i,n=new Ce;n.add(H(new pe(new on(.075,.026,10,20),t.bronze),0,.2,0)),n.add(Ri(H(Be(.052,.052,.03,t.keyColor[e],16),0,.2,0))),n.add(H(ze(.035,.24,.03,t.bronze),0,0,0)),n.add(H(ze(.07,.03,.03,t.bronze),.035,-.08,0)),n.add(H(ze(.05,.03,.03,t.bronze),.025,-.03,0)),n.position.y=de+.2,n.rotation.z=.25;let r=new Ce;return r.add(n),r.add(H(Be(.16,.18,.03,t.iron,20),0,de+.015,0)),st(r,{half:.2,h:.42})}function Q_(i){let{m:e}=i,t=new Ce,n=new pn;n.moveTo(0,0),n.bezierCurveTo(.08,.02,.1,.2,.07,.32),n.lineTo(-.07,.32),n.bezierCurveTo(-.1,.2,-.08,.02,0,0);let r=new wi(n,{depth:.025,bevelEnabled:!1});for(let s of[-1,1]){let o=new pe(r,e.teal);o.rotation.x=-Math.PI/2+.35,o.rotation.z=s*.2,o.position.set(s*.1,de+.03,.14),t.add(o),t.add(H(ze(.1,.07,.1,e.teal),s*.1,de+.06,.14))}return st(t,{half:.24,h:.2})}function pl(i,e,t,n){let r=new Ce;for(let s of[-1,1]){let o=new Ce,a=n?.(o)??0;o.add(H(ze(.09,.2,.09,e),0,a+.12,0)),o.add(H(ze(.09,.06,.17,e),0,a+.03,.04)),o.add(H(ze(.1,.045,.1,t),0,a+.225,0)),o.position.set(s*.09,de,0),o.rotation.y=s*.2,r.add(o)}return r}function ex(i){let{m:e}=i,t=pl(i,e.boot,e.bootTrim,n=>(n.add(H(new pe(new Bt(.025,.07,6),e.gold),0,.11,.05)),0));return st(t,{half:.2,h:.28})}function tx(i){let{m:e}=i,t=pl(i,e.skate,e.cream,n=>{n.add(H(ze(.02,.05,.24,e.steel),0,.025,.04));for(let r of[-.04,.12])n.add(H(ze(.03,.03,.03,e.steel),0,.05,r));return .05});return st(t,{half:.2,h:.32})}function nx(i){let{m:e}=i,t=pl(i,e.suction,e.bootTrim,n=>(n.add(H(Be(.1,.07,.035,e.bronze,18),0,.018,.03)),.035));return st(t,{half:.22,h:.3})}function ix(i){let{m:e}=i,t=new Ce,n=new Ce;n.position.set(0,de+.32,0),n.rotation.x=-.25,n.add(Ri(Be(.13,.13,.02,e.mirror,28))),n.add(new pe(new on(.13,.02,8,28),e.bronze));let r=H(Vt(.045,e.gorgon,12,10),0,0,.012);r.scale.z=.5,n.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;n.add(H(Vt(.014,e.gorgon,6,5),Math.cos(o)*.08,Math.sin(o)*.08,.012))}return t.add(n),t.add(H(Be(.018,.025,.2,e.bronze,8),0,de+.1,0)),t.add(H(Be(.08,.09,.025,e.bronze),0,de+.012,0)),st(t,{half:.18,h:.48})}function rx(i){let{m:e}=i,t=new Ce;t.add(H(Be(.24,.22,.03,e.bronze,24),0,de+.015,0)),t.add(H(Be(.17,.19,.16,e.cake,24),0,de+.11,0)),t.add(H(Be(.165,.17,.02,e.cream,24),0,de+.2,0));for(let n=0;n<8;n++){let r=n/8*Math.PI*2;t.add(H(Vt(.022,e.cream,8,6),Math.cos(r)*.12,de+.215,Math.sin(r)*.12))}return t.add(H(Vt(.035,e.cake,10,8),0,de+.22,0)),st(t,{half:.24,h:.26})}function du(i,e){let{m:t}=i,n=new Ce;n.add(H(ze(.56,.05,.3,t.wood),0,.1,0));for(let o of[-1,1])for(let a of[-1,1])n.add(Ri(H(Be(.07,.07,.03,t.darkWood,14),o*.2,.07,a*.165))),n.add(H(Be(.028,.025,.14,t.hide,8),o*.16,.18,a*.08));n.add(H(new pe(new Mn(.46,.22,.24,2,.05),t.hide),0,.34,0));for(let[o,a,l,c]of[[-.1,0,.3,1],[.1,.05,.3,1],[-.04,.12,1,.3],[.12,-.12,1,.3],[-.14,-.12,1,.3]]){let h=H(Vt(.075,t.patch,10,8),o,c===1?.44:.35,a);h.scale.set(1,l,c),n.add(h)}n.add(H(new pe(new Mn(.14,.15,.15,2,.03),t.hide),.29,.43,0)),n.add(H(ze(.06,.08,.12,t.snout),.37,.4,0));for(let o of[-1,1]){let a=H(new pe(new Bt(.02,.08,6),t.ivory),.28,.53,o*.06);a.rotation.x=o*.5,n.add(a)}let r=H(Be(.012,.012,.16,t.patch,6),-.25,.36,0);r.rotation.z=-.4,n.add(r),n.position.y=de,n.scale.setScalar(e),n.rotation.y=.5;let s=new Ce;return s.add(n),st(s,{half:.32*e,h:.56*e})}function sx(i){let{m:e}=i,t=new Ce;t.add(H(ze(.26,.008,.14,e.parchment),.02,de+.006,.08));let n=H(Be(.06,.06,.34,e.parchment,14),0,de+.06,-.02);n.rotation.z=Math.PI/2,t.add(n);for(let s of[-1,1]){let o=H(Be(.035,.035,.012,e.darkWood,10),s*.172,de+.06,-.02);o.rotation.z=Math.PI/2,t.add(o)}let r=H(Be(.064,.064,.05,e.cloak,14),-.08,de+.06,-.02);return r.rotation.z=Math.PI/2,t.add(r),t.rotation.y=.3,st(t,{half:.2,h:.14})}function ox(i){let e=new Ce;return e.add(H(new pe(new Mn(.84,.8,.84,3,.05),i.m.block),0,de+.4,0)),st(e,{half:.42,h:.9})}function ax(i){let{m:e}=i,t=new Ce,n=de+.22;t.add(H(Vt(.22,e.bronze,24,16),0,n,0));let r=H(new pe(new on(.222,.012,6,32),e.gold),0,n,0);r.rotation.y=Math.PI/2,t.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;t.add(H(Vt(.022,e.gold,6,5),Math.cos(o)*.222,n,Math.sin(o)*.222)),s%2===0&&t.add(H(Vt(.02,e.gold,6,5),0,n+Math.cos(o+.3)*.224,Math.sin(o+.3)*.224))}return st(t,{half:.24,h:.46})}function lx(i){let{m:e}=i,t=new Ce,n=de+.4,r=H(Vt(.12,e.feather,16,12),0,n,-.02);r.scale.set(.9,1.15,.85),t.add(r),t.add(H(Vt(.075,e.skin,14,10),0,n+.17,.03));let s=H(Vt(.082,e.furDark,14,8),0,n+.19,.01);s.scale.set(1,.8,1),t.add(s);for(let a of[-1,1]){t.add(H(Vt(.012,e.dark,6,5),a*.028,n+.18,.1));let l=fu([[.06,.08],[.24,.16],[.4,.14],[.38,.06],[.33,.08],[.33,-.01],[.26,.02],[.24,-.08],[.17,-.03],[.12,-.1],[.06,-.04]].map(([c,h])=>[a*c,h]),.025,e.feather);l.position.set(0,n+.04,-.04),l.rotation.x=-.9,t.add(l),t.add(H(Be(.014,.012,.16,e.bootTrim,6),a*.04,n-.18,.02))}let o=H(new pe(new Bt(.06,.16,6),e.feather),0,n-.1,-.12);return o.rotation.x=-2.4,t.add(o),st(t,{half:.36,h:.66})}function cx(i){let e=new Ce;e.add(H(Vt(.13,i.m.bootTrim,12,8),0,de+.14,0));let t=st(e,{half:.26,h:.5}),n=[],r=H(Vt(.16,kn(13647888,.5),16,12),0,de+.17,0);n.push(r);for(let s=0;s<7;s++){let o=s/7*Math.PI*2,a=.24+s%3*.06,l=H(new pe(new Bt(.08,a,7),kn(s%2?13122060:14182424,.7)),Math.cos(o)*.12,de+a/2+.04,Math.sin(o)*.12);l.rotation.z=-Math.cos(o)*.3,l.rotation.x=Math.sin(o)*.3,n.push(l)}return t.add(...n),t.userData.loop=s=>n.forEach((o,a)=>o.scale.set(1,1+.15*Math.sin(s*(7+a)+a*1.7),1)),t}var pu={relic:j_,"key-red":i=>So(i,"red"),"key-blue":i=>So(i,"blue"),"key-yellow":i=>So(i,"yellow"),"key-green":i=>So(i,"green"),flippers:Q_,"fire-boots":ex,skates:tx,suction:nx,mirror:ix,cake:rx,cow:i=>du(i,.8),"cow-standing":i=>du(i,1.05),page:sx,block:ox,ball:ax,glider:lx,fireball:cx};var Pi=(i,e,t=16,n=12)=>new pe(new mn(i,t,n),e);function _u(i,e){i.scale.setScalar(1.3),i.position.y=de;let t=new Ce;return t.add(i),st(t,e)}function ux(i){let{m:e}=i,t=new Ce;for(let a of[-1,1])t.add(H(Be(.045,.04,.28,e.skin),a*.065,.14,0)),t.add(H(ze(.07,.05,.12,e.leather),a*.065,.025,.02));t.add(H(Be(.13,.2,.22,e.tunic),0,.35,0)),t.add(H(Be(.155,.13,.22,e.tunic),0,.55,0)),t.add(H(Be(.16,.16,.035,e.leather),0,.45,0));let n=H(ze(.3,.44,.03,e.cloak),0,.44,-.14);n.rotation.x=.12,t.add(n);for(let a of[-1,1]){let l=H(Be(.04,.035,.26,e.skin),a*.19,.5,.02);l.rotation.z=a*.18,t.add(l)}t.add(H(Pi(.095,e.skin),0,.75,0)),t.add(H(new pe(new mn(.103,18,10,0,Math.PI*2,0,Math.PI/2),e.furDark),0,.765,-.012));let r=H(Be(.15,.15,.03,e.bronze,24),-.26,.5,.04);r.rotation.z=Math.PI/2,t.add(r);let s=H(Be(.06,.06,.035,e.cloak,16),-.275,.5,.04);s.rotation.z=Math.PI/2,t.add(s);let o=H(ze(.03,.34,.012,e.steel),.23,.5,.1);return o.rotation.x=.5,t.add(o),t.add(H(ze(.09,.02,.03,e.bronze),.23,.37,.03)),_u(t,{half:.26,h:1.2})}function mu(i,e){let{m:t}=i,n=d=>e?t.statue:d,r=n(t.fur),s=e?t.statueDark:t.furDark,o=new Ce;for(let d of[-1,1])o.add(H(Be(.07,.06,.3,r),d*.1,.17,0)),o.add(H(Be(.065,.07,.05,n(t.hoof)),d*.1,.025,0));o.add(H(Be(.2,.26,.2,n(t.kilt)),0,.38,0));let a=H(new pe(new on(.2,.02,8,24),n(t.gold)),0,.47,0);a.rotation.x=Math.PI/2,o.add(a);let l=H(Pi(.26,r),0,.66,0);l.scale.set(1.05,1,.75),o.add(l);for(let d of[-1,1]){o.add(H(Pi(.11,r),d*.26,.78,0));let f=H(Be(.07,.055,.36,r),d*.31,.57,.03);f.rotation.z=d*.2,o.add(f)}let c=H(Pi(.13,s),0,.95,.06);c.scale.set(1,.95,1.15),o.add(c);let h=H(Pi(.085,n(t.snout)),0,.9,.19);h.scale.set(1.1,.8,.9),o.add(h),o.add(H(new pe(new on(.035,.008,6,16),n(t.gold)),0,.85,.26));for(let d of[-1,1]){o.add(H(Pi(.018,e?t.statueDark:t.eye,8,6),d*.065,.99,.17));let f=new Gr([new P(d*.1,1,.04),new P(d*.24,1.03,.02),new P(d*.33,1.12,.07),new P(d*.33,1.22,.13)]);o.add(new pe(new co(f,16,.028,8),n(t.ivory))),o.add(H(new pe(new Bt(.028,.07,8),n(t.ivory)),d*.33,1.25,.14));let g=H(Pi(.04,s),d*.14,.97,.02);g.scale.set(1.3,.6,.8),o.add(g)}let u=new Ce;u.add(Be(.018,.018,.85,n(t.iron),8));for(let d of[-1,1]){let f=new pe(new fn(.17,.17,.02,24,1,!1,0,Math.PI),n(t.steel));f.rotation.z=Math.PI/2,f.rotation.y=d>0?0:Math.PI,f.position.set(0,.3,0),f.scale.set(1,1,.8),u.add(f)}return u.rotation.y=Math.PI/2,u.position.set(.4,.62,.08),o.add(u),_u(o,{half:.36,h:1.6})}var dx={theseus:ux,minotaur:i=>mu(i,!1),"minotaur-stone":i=>mu(i,!0)},fx={...pu,...dx},px=new Set([...Jh,"ball","glider","fireball"]),mx={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2},gx=1.5,_x=.05,gu={y:.37,scale:.7},xx=i=>Math.atan2(Math.sin(i),Math.cos(i));function xu(i,e,t){let n=new Ce,r=new Ce,s=[],o=0,a=p=>{let m=Gh(p),y=m&&e?e.make(m):null;return y&&r.add(y),y};function l(p){if(!p.icon)return;let m=p.obj.position;p.icon.position.set(m.x,de+p.obj.userData.h+.32+Vh(o,t()),m.z)}function c(p){let m=fx[p.model](i);return p.id?.startsWith("machine")&&m.scale.setScalar(gu.scale),n.add(m),m}function h(p,m){let y=p.id?.startsWith("machine")?gu.y:0;return{model:p.model,id:p.id,obj:c(p),icon:a(p),r:p.r,c:p.c,yaw:m,goal:m,y}}function u(p){n.remove(p.obj),ns(p.obj,i),p.icon&&r.remove(p.icon)}function d(p,m){u(p),p.model=m.model,p.obj=c(m),p.icon=a(m)}function f(p,m,y,_){let S=!1,E=new Set(s),v=new Map,T=new Map(s.filter(I=>I.id).map(I=>[I.id,I]));for(let I of p){let N=I.id?T.get(I.id):void 0;N&&(E.delete(N),v.set(I,N))}let U=[];for(let I of p)if(!v.has(I))for(let N of E){let q=Math.hypot(N.r-I.r,N.c-I.c);N.model===I.model&&q<=gx&&U.push([q,I,N])}U.sort((I,N)=>I[0]-N[0]);for(let[,I,N]of U)v.has(I)||!E.has(N)||(E.delete(N),N.id=I.id,v.set(I,N));for(let I of E)u(I),S=!0;let M=p.find(I=>I.model==="theseus"),w=[];for(let I of p){let N=v.get(I);if(!N){let O=I.dir?mx[I.dir]:I.id==="minotaur"&&M?Math.atan2(M.c-I.c,M.r-I.r):0;N=h(I,O),S=!0}N.model!==I.model&&(d(N,I),S=!0);let q=I.r-N.r,D=I.c-N.c;Math.abs(q)+Math.abs(D)>1e-6&&(px.has(N.model)&&(N.goal=Math.atan2(D,q)),S=!0),N.r=I.r,N.c=I.c,_&&(N.yaw=N.goal),N.obj.position.set(Tt(N.c,m),N.y,Pt(N.r,y)),N.obj.rotation.y=N.yaw,l(N),w.push(N)}return s=w,S}function g(p,m){let y=!1;for(let _ of s){let S=xx(_.goal-_.yaw);if(Math.abs(S)<.001){_.yaw=_.goal,_.obj.rotation.y=_.yaw;continue}_.yaw=m?_.goal:_.yaw+S*(1-Math.exp(-p/_x)),_.obj.rotation.y=_.yaw,y=!0}return y}function x(){for(let p of s)u(p);s=[]}return{group:n,icons:r,set:f,ease:g,seen(){let p=y=>{let _=y.obj.userData;return{x:y.obj.position.x,z:y.obj.position.z,half:_.half,h:_.h}},m=s.find(y=>y.model==="theseus");return{hero:m?p(m):null,rest:s.filter(y=>y!==m).map(p)}},hero:()=>s.find(p=>p.model==="theseus")?.obj??null,loop(p){o=p;for(let m of s)m.obj.userData.loop?.(p),l(m)},looping:()=>s.flatMap(p=>p.icon?[p.icon]:p.obj.userData.loop?[p.obj]:[]),clear:x,dispose:x}}var yx={"door-red":wo,"door-blue":wo,"door-yellow":wo,"door-green":wo,"gate-closed":yu,"gate-open":yu,exit:(i,e)=>Gn(new an(16751168,4,4,1.6),i,.4,e)};function wo(i,e){return Gn(new an(16756848,1.6,2.6,1.8),i,.9,e+.6)}function yu(i,e){return Gn(new an(16760944,1.2,2.5,1.8),i,1,e)}function Gn(i,e,t,n){return i.position.set(e,t,n),i}var vu=i=>i.startsWith("door")?"door":i.startsWith("gate")?"gate":i;function Mu(i,e,t,n,r){let{m:s}=i,o=new Ce,a=[];o.add(new ho(6972528,1840142,1.5));let l=Math.hypot(n,t)/2+1.5,c=new Yr(10134720,1.1);c.position.set(-6,14,8),c.castShadow=!0,c.shadow.mapSize.set(2048,2048),Object.assign(c.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:1,far:40+l}),c.shadow.camera.updateProjectionMatrix(),c.shadow.bias=-8e-4,o.add(c,c.target);let h=new an(16758904,5.5,5.5,1.6);h.castShadow=!0,h.shadow.mapSize.set(512,512),h.shadow.bias=-.004,o.add(h);let u=[],d=[],f=Math.min(8,Math.max(3,Math.round(t*n/37))),g=["s","e","w","n"],x=[];for(let E of r)for(let v of g){let[T,U]=bn[v].d,M=E.r+T,w=E.c+U;M<0||w<0||M>=t||w>=n||e[M*n+w]!=="floor"||x.push({w:E,k:v,r:M,c:w,pri:g.indexOf(v)})}x.sort((E,v)=>E.pri-v.pri||E.r-v.r||E.c-v.c);let p=[];for(let E of x){if(p.length>=f)break;p.some(v=>Math.max(Math.abs(v.r-E.r),Math.abs(v.c-E.c))<4)||p.push(E)}let m=new bi({map:s.halo,blending:or,depthWrite:!1,transparent:!0,opacity:.55});a.push(m),p.forEach(({w:E,k:v},T)=>{let[U,,M]=bn[v].n,w=new Ce;w.position.set(E.x+U*.5,0,E.z+M*.5),w.add(Gn(new pe(new Jt(.08,.2,.08),s.iron),U*.04,.82,M*.04)),w.add(Gn(new pe(new fn(.05,.03,.12,8),s.iron),U*.1,.92,M*.1));let I=Gn(new pe(new Bt(.055,.2,8),kn(16747056)),U*.1,1.07,M*.1),N=Gn(new pe(new Bt(.03,.12,8),kn(16769184)),U*.1,1.04,M*.1);a.push(I.material,N.material);let q=new fr(m);q.scale.setScalar(.7),q.position.set(U*.12,1.05,M*.12),w.add(I,N,q);for(let O of w.children)O instanceof pe&&O.material===s.iron&&(O.castShadow=!0);o.add(w);let D=Gn(new an(16754788,4,6,1.7),w.position.x+U*.45,1.05,w.position.z+M*.45);o.add(D),d.push({g:w,flames:[I,N],halo:q,light:D,base:4,ph:T*2.39}),u.push(new P(w.position.x,1,w.position.z))});let y=[],_=[];e.forEach((E,v)=>{if(E!=="fire")return;let T=Math.floor(v/n),U=v%n,M=_.at(-1);M&&M.r===T&&M.c1===U-1?M.c1=U:_.push({r:T,c0:U,c1:U}),u.push(new P(Tt(U,n),de+.2,Pt(T,t)))});for(let E of _){let v=E.c1-E.c0+1,T=Gn(new an(16742960,3+v*1.2,3+v*.8,1.6),(Tt(E.c0,n)+Tt(E.c1,n))/2,.8,Pt(E.r,t));o.add(T),y.push({light:T,base:T.intensity,ph:E.r})}e.forEach((E,v)=>{(E==="water"||E==="teleport")&&u.push(new P(Tt(v%n,n),de,Pt(Math.floor(v/n),t)))});let S=new Map;return e.forEach((E,v)=>{let T=yx[E];if(!T)return;let U=T(Tt(v%n,n),Pt(Math.floor(v/n),t));o.add(U),S.set(v,{light:U,base:U.intensity,kind:vu(E)})}),{group:o,anchors:u,hero(E,v){h.position.set(E,1.5,v+.1)},setMode(E){for(let v of d)v.g.visible=E!=="low",v.light.position.y=E==="low"?.7:1.05},piece(E,v){let T=S.get(E);T&&(T.light.intensity=vu(v)===T.kind?T.base:0)},shadows(E){c.castShadow=E,h.castShadow=E},loop(E){for(let v of d){let T=1+.07*Math.sin(E*7.1+v.ph)+.04*Math.sin(E*12.7+v.ph*2);v.flames.forEach(U=>U.scale.set(1,T,1)),v.light.intensity=v.base*(1+.1*Math.sin(E*6.3+v.ph)+.05*Math.sin(E*11.1))}m.opacity=.5+.06*Math.sin(E*5);for(let v of y)v.light.intensity=v.base*(1+.1*Math.sin(E*5.7+v.ph))},dispose(){o.traverse(E=>{E instanceof pe&&E.geometry.dispose(),(E instanceof Yr||E instanceof an)&&E.shadow.map?.dispose()});for(let E of a)E.dispose()}}}var bu="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",vx=`
uniform sampler2D tDiffuse; uniform float exposure; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb * exposure; c = aces(c); gl_FragColor = vec4(pow(c, vec3(1.0/2.2)), 1.0); }`,Mx=`
uniform sampler2D tDiffuse; uniform vec2 texel; uniform float radius; uniform float stride; uniform float grain; uniform float dpr; uniform vec2 res; varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec3 col; int r = int(radius + 0.5);
  if (r == 0) { col = texture2D(tDiffuse, vUv).rgb; }
  else {
    vec3 m0 = vec3(0.), m1 = vec3(0.), m2 = vec3(0.), m3 = vec3(0.), s0 = vec3(0.), s1 = vec3(0.), s2 = vec3(0.), s3 = vec3(0.);
    for (int j = -6; j <= 6; j++) { if (j < -r || j > r) continue;
      for (int i = -6; i <= 6; i++) { if (i < -r || i > r) continue;
        vec3 c = texture2D(tDiffuse, vUv + vec2(float(i), float(j)) * texel * stride).rgb; vec3 c2 = c * c;
        if (i <= 0 && j <= 0) { m0 += c; s0 += c2; }
        if (i >= 0 && j <= 0) { m1 += c; s1 += c2; }
        if (i <= 0 && j >= 0) { m2 += c; s2 += c2; }
        if (i >= 0 && j >= 0) { m3 += c; s3 += c2; } } }
    float n = float((r + 1) * (r + 1));
    m0 /= n; m1 /= n; m2 /= n; m3 /= n;
    float v0 = dot(s0 / n - m0 * m0, vec3(1.)), v1 = dot(s1 / n - m1 * m1, vec3(1.)), v2 = dot(s2 / n - m2 * m2, vec3(1.)), v3 = dot(s3 / n - m3 * m3, vec3(1.));
    float w0 = 1.0 / pow(0.0008 + max(v0, 0.), 2.0), w1 = 1.0 / pow(0.0008 + max(v1, 0.), 2.0), w2 = 1.0 / pow(0.0008 + max(v2, 0.), 2.0), w3 = 1.0 / pow(0.0008 + max(v3, 0.), 2.0);
    col = (m0 * w0 + m1 * w1 + m2 * w2 + m3 * w3) / (w0 + w1 + w2 + w3);
  }
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = mix(vec3(l), col, 0.78);
  col = col * vec3(1.05, 1.0, 0.9) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  vec2 fc = gl_FragCoord.xy / dpr;
  float weave = sin(fc.x * 2.3) * sin(fc.y * 2.3);
  float nz = hash(floor(fc)) - 0.5;
  col += (weave * 0.012 + nz * 0.028) * grain * (0.35 + l);
  gl_FragColor = vec4(col, 1.0);
}`;function Su(i){let e=new ri(-1,1,1,-1,0,1),t=new nn({uniforms:{tDiffuse:{value:null},exposure:{value:1.3}},vertexShader:bu,fragmentShader:vx,depthTest:!1,depthWrite:!1}),n=new nn({uniforms:{tDiffuse:{value:null},texel:{value:new j},radius:{value:2},stride:{value:1},grain:{value:1},dpr:{value:1},res:{value:new j(1,1)}},vertexShader:bu,fragmentShader:Mx,depthTest:!1,depthWrite:!1}),r=new pe(new rn(2,2),t);r.frustumCulled=!1;let s=new Bn;s.add(r);let o=new tn(1,1,{type:vi,samples:4}),a=new tn(1,1);return{setSize(l,c,h){o.setSize(l,c),a.setSize(l,c);let u=n.uniforms;u.texel.value.set(1/l,1/c),u.res.value.set(l,c),u.stride.value=h,u.dpr.value=h},render(l,c,h){i.setRenderTarget(o),i.render(l,c),r.material=t,t.uniforms.tDiffuse.value=o.texture,i.setRenderTarget(h?a:null),i.render(s,e),h&&(r.material=n,n.uniforms.tDiffuse.value=a.texture,i.setRenderTarget(null),i.render(s,e))},dispose(){o.dispose(),a.dispose(),t.dispose(),n.dispose(),r.geometry.dispose()}}}var wu=12597547,ml=.03,Eu=de+.035;function Tu(){let i=new Ce,e=new gn({color:wu,roughness:.7,emissive:wu,emissiveIntensity:.35}),t=null,n="",r=()=>{t&&(i.remove(t),t.geometry.dispose(),t=null)};return{group:i,set(s,o,a){let l=s&&s.length>1?`${o}x${a}:${s.map(d=>`${d.r},${d.c}`).join(" ")}`:"";if(l===n)return!1;if(n=l,r(),!s||s.length<2)return!0;let c=s.map(d=>[Tt(d.c,o),Pt(d.r,a)]),h=[];c.forEach(([d,f],g)=>{h.push(new mn(ml,8,6).translate(d,Eu,f));let x=c[g+1];if(!x)return;let p=x[0]-d,m=x[1]-f,y=Math.hypot(p,m);if(y<1e-6)return;let _=new fn(ml,ml,y,8,1,!0);_.rotateZ(Math.PI/2),_.rotateY(-Math.atan2(m,p)),_.translate(d+p/2,Eu,f+m/2),h.push(_)});let u=h.map(d=>d.index?d.toNonIndexed():d);return t=new pe(vo(u),e),h.forEach(d=>d.dispose()),u.forEach(d=>d.dispose()),t.receiveShadow=!0,i.add(t),!0},dispose(){r(),e.dispose()}}}var Sx=394500,Cu=Math.PI/180,gl=12,Ru=.12;function wx(i){let e=new Fr({canvas:i.canvas,antialias:!1,powerPreference:"high-performance"});e.shadowMap.enabled=!0,e.shadowMap.type=nl,e.shadowMap.autoUpdate=!1;let t=Qh(e),n=new Bn;n.background=new Ye(Sx);let r=new ri(-1,1,1,-1,.1,200),s=new P,o=new P,a=new P,l=Su(e),c=tu(t),h=su(t),u=new Ce,d=i.atlas&&i.image?Yh(i.atlas,i.image,()=>L()):null,f=xu(t,d,()=>i.reducedMotion()),g=Tu();n.add(c.group,h.group,u,f.group,g.group);let x=new Bn;x.add(f.icons);let p=!0,m=0,y=0,_=-1e9,S=!1,E=3,v=[],T=1,U=1,M="solid",w=null,I=null,N=[],q=[],D=null,O=0,k=0,K=!0,$="",Y=!0,ne=!0,Q=!0,ce={yaw:15,tx:0,tz:0,zoom:Zr(1)},z={...ce},ee=!0,_e=!1,Te=()=>i.reducedMotion(),Me=()=>E===0?1:Math.min(globalThis.devicePixelRatio||1,2),Pe=()=>w?.level.rows??1,Ue=()=>w?.level.cols??1,we=()=>T/U,ke=()=>Ah(we(),Ue(),Pe());function L(){!y&&p&&(y=requestAnimationFrame(B))}function fe(oe){O=oe,ne=!0,L()}let Z=()=>p&&K&&!document.hidden&&!i.reducedMotion();function le(){k&&clearTimeout(k),k=0,Z()&&(k=setTimeout(()=>{k=0,Z()&&(w&&J()?fe(O+1/gl):O+=1/gl,le())},1e3/gl))}function J(){Re();let oe=he=>(s.copy(he).project(r),Math.abs(s.x)<1.05&&Math.abs(s.y)<1.05);return(D?.anchors??[]).some(oe)||f.looping().some(he=>oe(he.position))||q.some(he=>!!he?.userData?.loop&&oe(he.position))}function Re(){let oe=ce.yaw*Cu,he=45*Cu,X=40;r.position.set(ce.tx+Math.sin(oe)*Math.cos(he)*X,de+Math.sin(he)*X,ce.tz+Math.cos(oe)*Math.cos(he)*X),r.up.set(-Math.sin(oe),0,-Math.cos(oe)),r.lookAt(ce.tx,de,ce.tz);let R=ce.zoom/2,ie=we();r.left=-R*ie,r.right=R*ie,r.top=R,r.bottom=-R,r.updateProjectionMatrix(),r.updateMatrixWorld()}function xe(){ee&&I&&(z.tx=Tt(I.c,Ue()),z.tz=Pt(I.r,Pe())),z.zoom=_e?xo(z.zoom,ke()):Zr(we()),Object.assign(z,_o(z,Ue(),Pe()))}function A(){let{hero:oe,rest:he}=f.seen();if(M==="ghosted"&&w){let X=Ue(),R=Pe();q.forEach((ie,ue)=>{let be=ie?.userData;!be||be.h<=0||he.push({x:Tt(ue%X,X),z:Pt(Math.floor(ue/X),R),half:be.half,h:be.h})})}return kh(M,oe,he)}function b(){D?.shadows(E>=3),Q=!0,re()}function B(oe){if(y=0,!p){S=!1;return}let he=oe-_;_=oe;let X=jh(S,he);if(X!==null){v.push(X),v.length>20&&(v=v.slice(-20));let be=Kh(E,v);be!==E&&(E=be,v=[],b())}let R=X!==null?Math.min(.1,he/1e3):1/60;xe();let ie=wh(ce,z,R,Te());if(ie&&(Y=!0),Re(),Y&&(h.aim(r,A()),Y=!1),ie=h.ease(R,Te())||ie,f.ease(R,Te())&&(ie=!0,Q=!0),ne){c.loop(O),D?.loop(O),f.loop(O);for(let be of q)be?.userData?.loop?.(O);ne=!1}if(Q&&(e.shadowMap.needsUpdate=!0,Q=!1),l.render(n,r,E>=2),f.icons.children.length){let be=ae();e.autoClear=!1,e.render(x,r),e.autoClear=!0;for(let[Se,Xe,nt,at]of be)Se.position.set(Xe,nt,at)}let ue=`${ce.yaw} ${ce.tx} ${ce.tz} ${ce.zoom} ${T} ${U}`;ue!==$&&($=ue,Oe?.view(ce,we())),m++,S=ie,ie&&L()}function ae(){let oe=ce.zoom/2,he=oe*we();o.setFromMatrixColumn(r.matrixWorld,0),a.setFromMatrixColumn(r.matrixWorld,1);let X=[];for(let R of f.icons.children){if(s.set(R.position.x,de,R.position.z).project(r),Math.abs(s.x)>1||Math.abs(s.y)>1)continue;s.copy(R.position).project(r);let[ie,ue]=Wh(s.x*he,s.y*oe,R.scale.x,R.scale.y,he,oe,Hh);ie===0&&ue===0||(X.push([R,R.position.x,R.position.y,R.position.z]),R.position.addScaledVector(o,ie).addScaledVector(a,ue))}return X}function re(){let oe=i.canvas.clientWidth,he=i.canvas.clientHeight;if(oe<=0||he<=0)return;T=oe,U=he;let X=Me();e.setPixelRatio(X),e.setSize(oe,he,!1),l.setSize(Math.round(oe*X),Math.round(he*X),X),Oe?.fit(i.overlay.clientWidth||oe,i.overlay.clientHeight||he),_e||(ce.zoom=z.zoom=Zr(we())),Y=!0}function te(oe){let he=q[oe];he&&(u.remove(he),ns(he,t));let X=Ue(),R=Pe(),ie=Math.floor(oe/X),ue=oe%X,be=(nt,at)=>nt<0||at<0||nt>=R||at>=X||N[nt*X+at]==="wall",Se=uu[N[oe]]({kit:t,r:ie,c:ue,wall:be}),Xe=Se.userData;if(!Se.children.length){q[oe]=null;return}Se.position.set(Tt(ue,X),0,Pt(ie,R)),Xe.tall&&M==="low"&&(Se.scale.y=xr/xn),u.add(Se),q[oe]=Se}function Ae(oe,he){I={r:he.player.r,c:he.player.c};let X=f.set($h(oe,he),Ue(),Pe(),Te()),R=f.hero();return R&&D?.hero(R.position.x,R.position.z),X}function ge(){for(let oe of q)oe&&(u.remove(oe),ns(oe,t));q=[],D&&(n.remove(D.group),D.dispose(),D=null),f.clear(),g.set(null,0,0)}function ye(oe){ge(),w=oe;let{rows:he,cols:X}=oe.level;N=oe.terrain.map((R,ie)=>ul(oe,ie)),c.set(N,he,X),h.build(N,he,X),q=N.map(()=>null);for(let R=0;R<N.length;R++)te(R);D=Mu(t,N,he,X,h.list()),D.setMode(M),D.shadows(E>=3),n.add(D.group),I=null,Ae(oe,{player:oe.player,minotaur:oe.minotaur,hazards:oe.hazards.map(R=>({kind:R.kind,at:R.at}))}),ee=!0,_e=!1,xe(),Object.assign(ce,z),Y=ne=Q=!0,Oe?.paint(oe,{player:oe.player,minotaur:oe.minotaur,hazards:oe.hazards.map(R=>({kind:R.kind,at:R.at}))},null),L(),k||le()}function Ne(oe,he){let X=oe.state;(!w||X.level!==w.level)&&ye(X);let R=w,ie=Fh(R,X);R.relicsLeft!==X.relicsLeft&&X.terrain.forEach(($e,pt)=>{$e==="gate"&&ie.push(pt)});let ue=!1,be=!1,{rows:Se,cols:Xe}=X.level,nt=new Set;for(let $e of ie){let pt=ul(X,$e),Ht=N[$e];if(pt!==Ht){if(Qr[pt]!==Qr[Ht]&&(ue=!0),pt==="wall"!=(Ht==="wall")){be=!0;let Ii=Math.floor($e/Xe),yr=$e%Xe;for(let[Vn,Li]of[[-1,0],[1,0],[0,-1],[0,1]])Ii+Vn>=0&&Ii+Vn<Se&&yr+Li>=0&&yr+Li<Xe&&nt.add((Ii+Vn)*Xe+yr+Li)}N[$e]=pt,te($e),D?.piece($e,pt)}}for(let $e of nt)ie.includes($e)||te($e);ue&&c.set(N,Se,Xe),be&&(h.build(N,Se,Xe),h.setMode(M)),w=X;let at=Ae(X,oe.figures),At=g.set(he,Xe,Se);ie.length===0&&!at&&!At&&X===R||((ie.length||at)&&(Y=!0,Q=!0),Oe?.paint(X,oe.figures,he),L(),k||le())}function Ve(oe){M=oe,h.setMode(oe),D?.setMode(oe);for(let he of q)he&&he.userData.tall&&(he.scale.y=oe==="low"?xr/xn:1);Y=Q=!0,L()}let se={turn(oe,he){z.yaw+=oe,he||(ce.yaw+=oe),Y=!0,L()},pan(oe,he){ee=!1;let X=ce.zoom/U;for(let R of[ce,z])Object.assign(R,_o(Eh(R,oe,he,X),Ue(),Pe()));Y=!0,L()},zoom(oe,he,X,R){_e=!0;let ie=ke();if(R)z.zoom=xo(z.zoom*oe,ie);else{let ue=Math.abs(he)>Ru||Math.abs(X)>Ru;ue&&(ee=!1);let be=ue?he*we():0,Se=ue?X:0;for(let Xe of[ce,z])Object.assign(Xe,_o(Ch(Xe,oe,be,Se,ie),Ue(),Pe()))}Y=!0,L()},reset(){ee=!0,_e=!1,z.yaw=Th(15,ce.yaw),L()}},je=document.createElement("div");je.className="modern-ui",i.overlay.append(je);let Je=Oh(i.canvas,je,i,se),Oe=i.atlas&&i.image?Zh(je,i.atlas,i.image,{blocked:()=>i.blocked(),look(oe){i.gesture(),ee=!1,z.tx=oe.x,z.tz=oe.z,L()}}):null,Le=()=>le();document.addEventListener("visibilitychange",Le);let Ee=typeof IntersectionObserver=="function"?new IntersectionObserver(oe=>{K=oe.some(he=>he.isIntersecting),le()}):null;Ee?.observe(i.canvas);let He=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,it=()=>{ne=!0,L(),le()};return He?.addEventListener("change",it),re(),{level:ye,show:Ne,walls:Ve,yaw:()=>ce.yaw,zoom:()=>ce.zoom,reset:se.reset,resize(){re(),L()},setActive(oe){p=oe,je.hidden=!oe,oe?L():(y&&cancelAnimationFrame(y),y=0,S=!1),le()},frames:()=>m,quality:()=>E,dispose(){y&&cancelAnimationFrame(y),y=0,p=!1,le(),document.removeEventListener("visibilitychange",Le),Ee?.disconnect(),He?.removeEventListener("change",it),Je.dispose(),Oe?.dispose(),je.remove(),ge(),c.dispose(),h.dispose(),f.dispose(),g.dispose(),d?.dispose(),l.dispose(),t.dispose(),e.dispose()}}}export{wx as createModernBoard};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=modern.js.map
