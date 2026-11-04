/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
var ep=0,Nc=1,tp=2;var dh=1,$l=2,ni=3,wi=0,Pt=1,Bt=2;var bi=0,Cr=1,dn=2,Oc=3,Fc=4,np=5,Hi=100,ip=101,rp=102,kc=103,zc=104,sp=200,op=201,ap=202,lp=203,ol=204,al=205,cp=206,up=207,hp=208,dp=209,fp=210,pp=211,mp=212,gp=213,xp=214,_p=0,yp=1,vp=2,co=3,bp=4,Mp=5,Jl=6,Sp=7,jl=0,wp=1,Ep=2,Un=0,Tp=1,Ap=2,Cp=3,Bo=4,Rp=5,Pp=6;var fh=300,Ir=301,Lr=302,ll=303,cl=304,Go=306,Ei=1e3,Nt=1001,ul=1002,jt=1003,Bc=1004;var Sa=1005;var _n=1006,Ip=1007;var rs=1008;var Mi=1009,Lp=1010,Dp=1011,Ql=1012,ph=1013,yi=1014,vi=1015,Ki=1016,mh=1017,gh=1018,Xi=1020,Up=1021,Dn=1023,Np=1024,Op=1025,qi=1026,Dr=1027,Fp=1028,xh=1029,kp=1030,_h=1031,yh=1033,wa=33776,Ea=33777,Ta=33778,Aa=33779,Gc=35840,Hc=35841,Vc=35842,Wc=35843,vh=36196,Xc=37492,qc=37496,Yc=37808,Kc=37809,Zc=37810,$c=37811,Jc=37812,jc=37813,Qc=37814,eu=37815,tu=37816,nu=37817,iu=37818,ru=37819,su=37820,ou=37821,Ca=36492,au=36494,lu=36495,zp=36283,cu=36284,uu=36285,hu=36286;var uo=2300,ho=2301,Ra=2302,du=2400,fu=2401,pu=2402;var bh=3e3,Yi=3001,Bp=3200,Gp=3201,ec=0,Hp=1,yn="",pt="srgb",ai="srgb-linear",tc="display-p3",Ho="display-p3-linear",fo="linear",yt="srgb",po="rec709",mo="p3";var rr=7680,Mh=7681;var Sh=517;var mu=519,Vp=512,Wp=513,Xp=514,wh=515,qp=516,Yp=517,Kp=518,Zp=519,hl=35044;var gu="300 es",dl=1035,si=2e3,go=2001,Ti=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let i=this._listeners[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Xt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Pa=Math.PI/180,fl=180/Math.PI;function oi(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Xt[n&255]+Xt[n>>8&255]+Xt[n>>16&255]+Xt[n>>24&255]+"-"+Xt[e&255]+Xt[e>>8&255]+"-"+Xt[e>>16&15|64]+Xt[e>>24&255]+"-"+Xt[t&63|128]+Xt[t>>8&255]+"-"+Xt[t>>16&255]+Xt[t>>24&255]+Xt[i&255]+Xt[i>>8&255]+Xt[i>>16&255]+Xt[i>>24&255]).toLowerCase()}function Ht(n,e,t){return Math.max(e,Math.min(t,n))}function $p(n,e){return(n%e+e)%e}function Ia(n,e,t){return(1-t)*n+t*e}function xu(n){return(n&n-1)===0&&n!==0}function pl(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function ri(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function gt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var re=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ht(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},tt=class n{constructor(e,t,i,r,s,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],h=i[7],d=i[2],f=i[5],m=i[8],x=r[0],p=r[3],g=r[6],y=r[1],_=r[4],S=r[7],E=r[2],b=r[5],T=r[8];return s[0]=o*x+a*y+l*E,s[3]=o*p+a*_+l*b,s[6]=o*g+a*S+l*T,s[1]=c*x+u*y+h*E,s[4]=c*p+u*_+h*b,s[7]=c*g+u*S+h*T,s[2]=d*x+f*y+m*E,s[5]=d*p+f*_+m*b,s[8]=d*g+f*S+m*T,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*s*u+i*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*s,f=c*s-o*l,m=t*h+i*d+r*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/m;return e[0]=h*x,e[1]=(r*c-u*i)*x,e[2]=(a*i-r*o)*x,e[3]=d*x,e[4]=(u*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=f*x,e[7]=(i*l-c*t)*x,e[8]=(o*t-i*s)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(La.makeScale(e,t)),this}rotate(e){return this.premultiply(La.makeRotation(-e)),this}translate(e,t){return this.premultiply(La.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},La=new tt;function Eh(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function xo(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Jp(){let n=xo("canvas");return n.style.display="block",n}var _u={};function es(n){n in _u||(_u[n]=!0,console.warn(n))}var yu=new tt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),vu=new tt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ds={[ai]:{transfer:fo,primaries:po,toReference:n=>n,fromReference:n=>n},[pt]:{transfer:yt,primaries:po,toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[Ho]:{transfer:fo,primaries:mo,toReference:n=>n.applyMatrix3(vu),fromReference:n=>n.applyMatrix3(yu)},[tc]:{transfer:yt,primaries:mo,toReference:n=>n.convertSRGBToLinear().applyMatrix3(vu),fromReference:n=>n.applyMatrix3(yu).convertLinearToSRGB()}},jp=new Set([ai,Ho]),ft={enabled:!0,_workingColorSpace:ai,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!jp.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;let i=Ds[e].toReference,r=Ds[t].fromReference;return r(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this._workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this._workingColorSpace)},getPrimaries:function(n){return Ds[n].primaries},getTransfer:function(n){return n===yn?fo:Ds[n].transfer}};function Rr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Da(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var sr,_o=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{sr===void 0&&(sr=xo("canvas")),sr.width=e.width,sr.height=e.height;let i=sr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=sr}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=xo("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Rr(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Rr(t[i]/255)*255):t[i]=Rr(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Qp=0,yo=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Qp++}),this.uuid=oi(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Ua(r[o].image)):s.push(Ua(r[o]))}else s=Ua(r);i.url=s}return t||(e.images[this.uuid]=i),i}};function Ua(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?_o.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var em=0,vn=class n extends Ti{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Nt,r=Nt,s=_n,o=rs,a=Dn,l=Mi,c=n.DEFAULT_ANISOTROPY,u=yn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:em++}),this.uuid=oi(),this.name="",this.source=new yo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new re(0,0),this.repeat=new re(1,1),this.center=new re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new tt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof u=="string"?this.colorSpace=u:(es("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=u===Yi?pt:yn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==fh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ei:e.x=e.x-Math.floor(e.x);break;case Nt:e.x=e.x<0?0:1;break;case ul:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ei:e.y=e.y-Math.floor(e.y);break;case Nt:e.y=e.y<0?0:1;break;case ul:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return es("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===pt?Yi:bh}set encoding(e){es("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Yi?pt:yn}};vn.DEFAULT_IMAGE=null;vn.DEFAULT_MAPPING=fh;vn.DEFAULT_ANISOTROPY=1;var Mt=class n{constructor(e=0,t=0,i=0,r=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],m=l[9],x=l[2],p=l[6],g=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(m-p)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(m+p)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let _=(c+1)/2,S=(f+1)/2,E=(g+1)/2,b=(u+d)/4,T=(h+x)/4,R=(m+p)/4;return _>S&&_>E?_<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(_),r=b/i,s=T/i):S>E?S<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(S),i=b/r,s=R/r):E<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(E),i=T/s,r=R/s),this.set(i,r,s,t),this}let y=Math.sqrt((p-m)*(p-m)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(y)<.001&&(y=1),this.x=(p-m)/y,this.y=(h-x)/y,this.z=(d-u)/y,this.w=Math.acos((c+f+g-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ml=class extends Ti{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Mt(0,0,e,t),this.scissorTest=!1,this.viewport=new Mt(0,0,e,t);let r={width:e,height:t,depth:1};i.encoding!==void 0&&(es("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===Yi?pt:yn),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:_n,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},i),this.texture=new vn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps,this.texture.internalFormat=i.internalFormat,this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}setSize(e,t,i=1){(this.width!==e||this.height!==t||this.depth!==i)&&(this.width=e,this.height=t,this.depth=i,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new yo(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Qt=class extends ml{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},vo=class extends vn{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=jt,this.minFilter=jt,this.wrapR=Nt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var gl=class extends vn{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=jt,this.minFilter=jt,this.wrapR=Nt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ai=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3],d=s[o+0],f=s[o+1],m=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=m,e[t+3]=x;return}if(h!==x||l!==d||c!==f||u!==m){let p=1-a,g=l*d+c*f+u*m+h*x,y=g>=0?1:-1,_=1-g*g;if(_>Number.EPSILON){let E=Math.sqrt(_),b=Math.atan2(E,g*y);p=Math.sin(p*b)/E,a=Math.sin(a*b)/E}let S=a*y;if(l=l*p+d*S,c=c*p+f*S,u=u*p+m*S,h=h*p+x*S,p===1-a){let E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[o],d=s[o+1],f=s[o+2],m=s[o+3];return e[t]=a*m+u*h+l*f-c*d,e[t+1]=l*m+u*d+c*h-a*f,e[t+2]=c*m+u*f+a*d-l*h,e[t+3]=u*m-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(r/2),h=a(s/2),d=l(i/2),f=l(r/2),m=l(s/2);switch(o){case"XYZ":this._x=d*u*h+c*f*m,this._y=c*f*h-d*u*m,this._z=c*u*m+d*f*h,this._w=c*u*h-d*f*m;break;case"YXZ":this._x=d*u*h+c*f*m,this._y=c*f*h-d*u*m,this._z=c*u*m-d*f*h,this._w=c*u*h+d*f*m;break;case"ZXY":this._x=d*u*h-c*f*m,this._y=c*f*h+d*u*m,this._z=c*u*m+d*f*h,this._w=c*u*h-d*f*m;break;case"ZYX":this._x=d*u*h-c*f*m,this._y=c*f*h+d*u*m,this._z=c*u*m-d*f*h,this._w=c*u*h+d*f*m;break;case"YZX":this._x=d*u*h+c*f*m,this._y=c*f*h+d*u*m,this._z=c*u*m-d*f*h,this._w=c*u*h-d*f*m;break;case"XZY":this._x=d*u*h-c*f*m,this._y=c*f*h-d*u*m,this._z=c*u*m+d*f*h,this._w=c*u*h+d*f*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=i+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(i>a&&i>h){let f=2*Math.sqrt(1+i-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>h){let f=2*Math.sqrt(1+a-i-h);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-i-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ht(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-i*c,this._z=s*u+o*c+i*l-r*a,this._w=o*u-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=i*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=Math.random(),t=Math.sqrt(1-e),i=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(r),i*Math.sin(s),i*Math.cos(s),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),u=2*(a*t-s*r),h=2*(s*i-o*t);return this.x=t+l*c+o*h-a*u,this.y=i+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Na.copy(this).projectOnVector(e),this.sub(Na)}reflect(e){return this.sub(Na.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ht(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(t),this.y=i*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Na=new P,bu=new Ai,Nn=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Pn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Pn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Pn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Pn):Pn.fromBufferAttribute(s,o),Pn.applyMatrix4(e.matrixWorld),this.expandByPoint(Pn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Us.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Us.copy(i.boundingBox)),Us.applyMatrix4(e.matrixWorld),this.union(Us)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Pn),Pn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Wr),Ns.subVectors(this.max,Wr),or.subVectors(e.a,Wr),ar.subVectors(e.b,Wr),lr.subVectors(e.c,Wr),pi.subVectors(ar,or),mi.subVectors(lr,ar),Fi.subVectors(or,lr);let t=[0,-pi.z,pi.y,0,-mi.z,mi.y,0,-Fi.z,Fi.y,pi.z,0,-pi.x,mi.z,0,-mi.x,Fi.z,0,-Fi.x,-pi.y,pi.x,0,-mi.y,mi.x,0,-Fi.y,Fi.x,0];return!Oa(t,or,ar,lr,Ns)||(t=[1,0,0,0,1,0,0,0,1],!Oa(t,or,ar,lr,Ns))?!1:(Os.crossVectors(pi,mi),t=[Os.x,Os.y,Os.z],Oa(t,or,ar,lr,Ns))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Pn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Pn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Jn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Jn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Jn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Jn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Jn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Jn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Jn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Jn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Jn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Jn=[new P,new P,new P,new P,new P,new P,new P,new P],Pn=new P,Us=new Nn,or=new P,ar=new P,lr=new P,pi=new P,mi=new P,Fi=new P,Wr=new P,Ns=new P,Os=new P,ki=new P;function Oa(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){ki.fromArray(n,s);let a=r.x*Math.abs(ki.x)+r.y*Math.abs(ki.y)+r.z*Math.abs(ki.z),l=e.dot(ki),c=t.dot(ki),u=i.dot(ki);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var tm=new Nn,Xr=new P,Fa=new P,Zi=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):tm.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Xr.subVectors(e,this.center);let t=Xr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Xr,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Fa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Xr.copy(e.center).add(Fa)),this.expandByPoint(Xr.copy(e.center).sub(Fa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},jn=new P,ka=new P,Fs=new P,gi=new P,za=new P,ks=new P,Ba=new P,xl=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,jn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=jn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(jn.copy(this.origin).addScaledVector(this.direction,t),jn.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){ka.copy(e).add(t).multiplyScalar(.5),Fs.copy(t).sub(e).normalize(),gi.copy(this.origin).sub(ka);let s=e.distanceTo(t)*.5,o=-this.direction.dot(Fs),a=gi.dot(this.direction),l=-gi.dot(Fs),c=gi.lengthSq(),u=Math.abs(1-o*o),h,d,f,m;if(u>0)if(h=o*l-a,d=o*a-l,m=s*u,h>=0)if(d>=-m)if(d<=m){let x=1/u;h*=x,d*=x,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-m?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c):d<=m?(h=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(ka).addScaledVector(Fs,d),f}intersectSphere(e,t){jn.subVectors(e.center,this.origin);let i=jn.dot(this.direction),r=jn.dot(jn)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,jn)!==null}intersectTriangle(e,t,i,r,s){za.subVectors(t,e),ks.subVectors(i,e),Ba.crossVectors(za,ks);let o=this.direction.dot(Ba),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;gi.subVectors(this.origin,e);let l=a*this.direction.dot(ks.crossVectors(gi,ks));if(l<0)return null;let c=a*this.direction.dot(za.cross(gi));if(c<0||l+c>o)return null;let u=-a*gi.dot(Ba);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},xt=class n{constructor(e,t,i,r,s,o,a,l,c,u,h,d,f,m,x,p){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,u,h,d,f,m,x,p)}set(e,t,i,r,s,o,a,l,c,u,h,d,f,m,x,p){let g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=r,g[1]=s,g[5]=o,g[9]=a,g[13]=l,g[2]=c,g[6]=u,g[10]=h,g[14]=d,g[3]=f,g[7]=m,g[11]=x,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,r=1/cr.setFromMatrixColumn(e,0).length(),s=1/cr.setFromMatrixColumn(e,1).length(),o=1/cr.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let d=o*u,f=o*h,m=a*u,x=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+m*c,t[5]=d-x*c,t[9]=-a*l,t[2]=x-d*c,t[6]=m+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,m=c*u,x=c*h;t[0]=d+x*a,t[4]=m*a-f,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-m,t[6]=x+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,m=c*u,x=c*h;t[0]=d-x*a,t[4]=-o*h,t[8]=m+f*a,t[1]=f+m*a,t[5]=o*u,t[9]=x-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*u,f=o*h,m=a*u,x=a*h;t[0]=l*u,t[4]=m*c-f,t[8]=d*c+x,t[1]=l*h,t[5]=x*c+d,t[9]=f*c-m,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,m=a*l,x=a*c;t[0]=l*u,t[4]=x-d*h,t[8]=m*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*h+m,t[10]=d-x*h}else if(e.order==="XZY"){let d=o*l,f=o*c,m=a*l,x=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+x,t[5]=o*u,t[9]=f*h-m,t[2]=m*h-f,t[6]=a*u,t[10]=x*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(nm,e,im)}lookAt(e,t,i){let r=this.elements;return un.subVectors(e,t),un.lengthSq()===0&&(un.z=1),un.normalize(),xi.crossVectors(i,un),xi.lengthSq()===0&&(Math.abs(i.z)===1?un.x+=1e-4:un.z+=1e-4,un.normalize(),xi.crossVectors(i,un)),xi.normalize(),zs.crossVectors(un,xi),r[0]=xi.x,r[4]=zs.x,r[8]=un.x,r[1]=xi.y,r[5]=zs.y,r[9]=un.y,r[2]=xi.z,r[6]=zs.z,r[10]=un.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],h=i[5],d=i[9],f=i[13],m=i[2],x=i[6],p=i[10],g=i[14],y=i[3],_=i[7],S=i[11],E=i[15],b=r[0],T=r[4],R=r[8],v=r[12],M=r[1],L=r[5],k=r[9],K=r[13],I=r[2],z=r[6],B=r[10],O=r[14],H=r[3],j=r[7],$=r[11],Q=r[15];return s[0]=o*b+a*M+l*I+c*H,s[4]=o*T+a*L+l*z+c*j,s[8]=o*R+a*k+l*B+c*$,s[12]=o*v+a*K+l*O+c*Q,s[1]=u*b+h*M+d*I+f*H,s[5]=u*T+h*L+d*z+f*j,s[9]=u*R+h*k+d*B+f*$,s[13]=u*v+h*K+d*O+f*Q,s[2]=m*b+x*M+p*I+g*H,s[6]=m*T+x*L+p*z+g*j,s[10]=m*R+x*k+p*B+g*$,s[14]=m*v+x*K+p*O+g*Q,s[3]=y*b+_*M+S*I+E*H,s[7]=y*T+_*L+S*z+E*j,s[11]=y*R+_*k+S*B+E*$,s[15]=y*v+_*K+S*O+E*Q,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],m=e[3],x=e[7],p=e[11],g=e[15];return m*(+s*l*h-r*c*h-s*a*d+i*c*d+r*a*f-i*l*f)+x*(+t*l*f-t*c*d+s*o*d-r*o*f+r*c*u-s*l*u)+p*(+t*c*h-t*a*f-s*o*h+i*o*f+s*a*u-i*c*u)+g*(-r*a*u-t*l*h+t*a*d+r*o*h-i*o*d+i*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],m=e[12],x=e[13],p=e[14],g=e[15],y=h*p*c-x*d*c+x*l*f-a*p*f-h*l*g+a*d*g,_=m*d*c-u*p*c-m*l*f+o*p*f+u*l*g-o*d*g,S=u*x*c-m*h*c+m*a*f-o*x*f-u*a*g+o*h*g,E=m*h*l-u*x*l-m*a*d+o*x*d+u*a*p-o*h*p,b=t*y+i*_+r*S+s*E;if(b===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let T=1/b;return e[0]=y*T,e[1]=(x*d*s-h*p*s-x*r*f+i*p*f+h*r*g-i*d*g)*T,e[2]=(a*p*s-x*l*s+x*r*c-i*p*c-a*r*g+i*l*g)*T,e[3]=(h*l*s-a*d*s-h*r*c+i*d*c+a*r*f-i*l*f)*T,e[4]=_*T,e[5]=(u*p*s-m*d*s+m*r*f-t*p*f-u*r*g+t*d*g)*T,e[6]=(m*l*s-o*p*s-m*r*c+t*p*c+o*r*g-t*l*g)*T,e[7]=(o*d*s-u*l*s+u*r*c-t*d*c-o*r*f+t*l*f)*T,e[8]=S*T,e[9]=(m*h*s-u*x*s-m*i*f+t*x*f+u*i*g-t*h*g)*T,e[10]=(o*x*s-m*a*s+m*i*c-t*x*c-o*i*g+t*a*g)*T,e[11]=(u*a*s-o*h*s-u*i*c+t*h*c+o*i*f-t*a*f)*T,e[12]=E*T,e[13]=(u*x*r-m*h*r+m*i*d-t*x*d-u*i*p+t*h*p)*T,e[14]=(m*a*r-o*x*r-m*i*l+t*x*l+o*i*p-t*a*p)*T,e[15]=(o*h*r-u*a*r+u*i*l-t*h*l-o*i*d+t*a*d)*T,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+i,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,d=s*c,f=s*u,m=s*h,x=o*u,p=o*h,g=a*h,y=l*c,_=l*u,S=l*h,E=i.x,b=i.y,T=i.z;return r[0]=(1-(x+g))*E,r[1]=(f+S)*E,r[2]=(m-_)*E,r[3]=0,r[4]=(f-S)*b,r[5]=(1-(d+g))*b,r[6]=(p+y)*b,r[7]=0,r[8]=(m+_)*T,r[9]=(p-y)*T,r[10]=(1-(d+x))*T,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements,s=cr.set(r[0],r[1],r[2]).length(),o=cr.set(r[4],r[5],r[6]).length(),a=cr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],In.copy(this);let c=1/s,u=1/o,h=1/a;return In.elements[0]*=c,In.elements[1]*=c,In.elements[2]*=c,In.elements[4]*=u,In.elements[5]*=u,In.elements[6]*=u,In.elements[8]*=h,In.elements[9]*=h,In.elements[10]*=h,t.setFromRotationMatrix(In),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=si){let l=this.elements,c=2*s/(t-e),u=2*s/(i-r),h=(t+e)/(t-e),d=(i+r)/(i-r),f,m;if(a===si)f=-(o+s)/(o-s),m=-2*o*s/(o-s);else if(a===go)f=-o/(o-s),m=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=si){let l=this.elements,c=1/(t-e),u=1/(i-r),h=1/(o-s),d=(t+e)*c,f=(i+r)*u,m,x;if(a===si)m=(o+s)*h,x=-2*h;else if(a===go)m=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=x,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},cr=new P,In=new xt,nm=new P(0,0,0),im=new P(1,1,1),xi=new P,zs=new P,un=new P,Mu=new xt,Su=new Ai,bo=class n{constructor(e=0,t=0,i=0,r=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],d=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(Ht(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ht(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ht(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ht(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ht(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ht(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Mu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Mu,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Su.setFromEuler(this),this.setFromQuaternion(Su,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};bo.DEFAULT_ORDER="XYZ";var Mo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},rm=0,wu=new P,ur=new Ai,Qn=new xt,Bs=new P,qr=new P,sm=new P,om=new Ai,Eu=new P(1,0,0),Tu=new P(0,1,0),Au=new P(0,0,1),am={type:"added"},lm={type:"removed"},Kt=class n extends Ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:rm++}),this.uuid=oi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new P,t=new bo,i=new Ai,r=new P(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new xt},normalMatrix:{value:new tt}}),this.matrix=new xt,this.matrixWorld=new xt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Mo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ur.setFromAxisAngle(e,t),this.quaternion.multiply(ur),this}rotateOnWorldAxis(e,t){return ur.setFromAxisAngle(e,t),this.quaternion.premultiply(ur),this}rotateX(e){return this.rotateOnAxis(Eu,e)}rotateY(e){return this.rotateOnAxis(Tu,e)}rotateZ(e){return this.rotateOnAxis(Au,e)}translateOnAxis(e,t){return wu.copy(e).applyQuaternion(this.quaternion),this.position.add(wu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Eu,e)}translateY(e){return this.translateOnAxis(Tu,e)}translateZ(e){return this.translateOnAxis(Au,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Qn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Bs.copy(e):Bs.set(e,t,i);let r=this.parent;this.updateWorldMatrix(!0,!1),qr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Qn.lookAt(qr,Bs,this.up):Qn.lookAt(Bs,qr,this.up),this.quaternion.setFromRotationMatrix(Qn),r&&(Qn.extractRotation(r.matrixWorld),ur.setFromRotationMatrix(Qn),this.quaternion.premultiply(ur.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(am)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(lm)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Qn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Qn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Qn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qr,e,sm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qr,om,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,r=t.length;i<r;i++){let s=t[i];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++){let a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),m.length>0&&(i.nodes=m)}return i.object=r,i;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let r=e.children[i];this.add(r.clone())}return this}};Kt.DEFAULT_UP=new P(0,1,0);Kt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Kt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ln=new P,ei=new P,Ga=new P,ti=new P,hr=new P,dr=new P,Cu=new P,Ha=new P,Va=new P,Wa=new P,Gs=!1,Wi=class n{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Ln.subVectors(e,t),r.cross(Ln);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Ln.subVectors(r,t),ei.subVectors(i,t),Ga.subVectors(e,t);let o=Ln.dot(Ln),a=Ln.dot(ei),l=Ln.dot(Ga),c=ei.dot(ei),u=ei.dot(Ga),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let d=1/h,f=(c*l-a*u)*d,m=(o*u-a*l)*d;return s.set(1-f-m,m,f)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,ti)===null?!1:ti.x>=0&&ti.y>=0&&ti.x+ti.y<=1}static getUV(e,t,i,r,s,o,a,l){return Gs===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Gs=!0),this.getInterpolation(e,t,i,r,s,o,a,l)}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,ti)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ti.x),l.addScaledVector(o,ti.y),l.addScaledVector(a,ti.z),l)}static isFrontFacing(e,t,i,r){return Ln.subVectors(i,t),ei.subVectors(e,t),Ln.cross(ei).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ln.subVectors(this.c,this.b),ei.subVectors(this.a,this.b),Ln.cross(ei).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,i,r,s){return Gs===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Gs=!0),n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;hr.subVectors(r,i),dr.subVectors(s,i),Ha.subVectors(e,i);let l=hr.dot(Ha),c=dr.dot(Ha);if(l<=0&&c<=0)return t.copy(i);Va.subVectors(e,r);let u=hr.dot(Va),h=dr.dot(Va);if(u>=0&&h<=u)return t.copy(r);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(hr,o);Wa.subVectors(e,s);let f=hr.dot(Wa),m=dr.dot(Wa);if(m>=0&&f<=m)return t.copy(s);let x=f*c-l*m;if(x<=0&&c>=0&&m<=0)return a=c/(c-m),t.copy(i).addScaledVector(dr,a);let p=u*m-f*h;if(p<=0&&h-u>=0&&f-m>=0)return Cu.subVectors(s,r),a=(h-u)/(h-u+(f-m)),t.copy(r).addScaledVector(Cu,a);let g=1/(p+x+d);return o=x*g,a=d*g,t.copy(i).addScaledVector(hr,o).addScaledVector(dr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Th={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_i={h:0,s:0,l:0},Hs={h:0,s:0,l:0};function Xa(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var We=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=pt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ft.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=ft.workingColorSpace){return this.r=e,this.g=t,this.b=i,ft.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=ft.workingColorSpace){if(e=$p(e,1),t=Ht(t,0,1),i=Ht(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Xa(o,s,e+1/3),this.g=Xa(o,s,e),this.b=Xa(o,s,e-1/3)}return ft.toWorkingColorSpace(this,r),this}setStyle(e,t=pt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=pt){let i=Th[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Rr(e.r),this.g=Rr(e.g),this.b=Rr(e.b),this}copyLinearToSRGB(e){return this.r=Da(e.r),this.g=Da(e.g),this.b=Da(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=pt){return ft.fromWorkingColorSpace(qt.copy(this),e),Math.round(Ht(qt.r*255,0,255))*65536+Math.round(Ht(qt.g*255,0,255))*256+Math.round(Ht(qt.b*255,0,255))}getHexString(e=pt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ft.workingColorSpace){ft.fromWorkingColorSpace(qt.copy(this),t);let i=qt.r,r=qt.g,s=qt.b,o=Math.max(i,r,s),a=Math.min(i,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ft.workingColorSpace){return ft.fromWorkingColorSpace(qt.copy(this),t),e.r=qt.r,e.g=qt.g,e.b=qt.b,e}getStyle(e=pt){ft.fromWorkingColorSpace(qt.copy(this),e);let t=qt.r,i=qt.g,r=qt.b;return e!==pt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(_i),this.setHSL(_i.h+e,_i.s+t,_i.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(_i),e.getHSL(Hs);let i=Ia(_i.h,Hs.h,t),r=Ia(_i.s,Hs.s,t),s=Ia(_i.l,Hs.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},qt=new We;We.NAMES=Th;var cm=0,li=class extends Ti{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:cm++}),this.uuid=oi(),this.name="",this.type="Material",this.blending=Cr,this.side=wi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ol,this.blendDst=al,this.blendEquation=Hi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new We(0,0,0),this.blendAlpha=0,this.depthFunc=co,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=mu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=rr,this.stencilZFail=rr,this.stencilZPass=rr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Cr&&(i.blending=this.blending),this.side!==wi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ol&&(i.blendSrc=this.blendSrc),this.blendDst!==al&&(i.blendDst=this.blendDst),this.blendEquation!==Hi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==co&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==mu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==rr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==rr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==rr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},it=class extends li{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new We(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=jl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Rt=new P,Vs=new re,Yt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=hl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=vi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Vs.fromBufferAttribute(this,t),Vs.applyMatrix3(e),this.setXY(t,Vs.x,Vs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix3(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix4(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyNormalMatrix(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.transformDirection(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=ri(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=gt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ri(t,this.array)),t}setX(e,t){return this.normalized&&(t=gt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ri(t,this.array)),t}setY(e,t){return this.normalized&&(t=gt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ri(t,this.array)),t}setZ(e,t){return this.normalized&&(t=gt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ri(t,this.array)),t}setW(e,t){return this.normalized&&(t=gt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=gt(t,this.array),i=gt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=gt(t,this.array),i=gt(i,this.array),r=gt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=gt(t,this.array),i=gt(i,this.array),r=gt(r,this.array),s=gt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==hl&&(e.usage=this.usage),e}};var So=class extends Yt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var wo=class extends Yt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var Ke=class extends Yt{constructor(e,t,i){super(new Float32Array(e),t,i)}};var um=0,xn=new xt,qa=new Kt,fr=new P,hn=new Nn,Yr=new Nn,zt=new P,Tt=class n extends Ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:um++}),this.uuid=oi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Eh(e)?wo:So)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new tt().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return xn.makeRotationFromQuaternion(e),this.applyMatrix4(xn),this}rotateX(e){return xn.makeRotationX(e),this.applyMatrix4(xn),this}rotateY(e){return xn.makeRotationY(e),this.applyMatrix4(xn),this}rotateZ(e){return xn.makeRotationZ(e),this.applyMatrix4(xn),this}translate(e,t,i){return xn.makeTranslation(e,t,i),this.applyMatrix4(xn),this}scale(e,t,i){return xn.makeScale(e,t,i),this.applyMatrix4(xn),this}lookAt(e){return qa.lookAt(e),qa.updateMatrix(),this.applyMatrix4(qa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(fr).negate(),this.translate(fr.x,fr.y,fr.z),this}setFromPoints(e){let t=[];for(let i=0,r=e.length;i<r;i++){let s=e[i];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Ke(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Nn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];hn.setFromBufferAttribute(s),this.morphTargetsRelative?(zt.addVectors(this.boundingBox.min,hn.min),this.boundingBox.expandByPoint(zt),zt.addVectors(this.boundingBox.max,hn.max),this.boundingBox.expandByPoint(zt)):(this.boundingBox.expandByPoint(hn.min),this.boundingBox.expandByPoint(hn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Zi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new P,1/0);return}if(e){let i=this.boundingSphere.center;if(hn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Yr.setFromBufferAttribute(a),this.morphTargetsRelative?(zt.addVectors(hn.min,Yr.min),hn.expandByPoint(zt),zt.addVectors(hn.max,Yr.max),hn.expandByPoint(zt)):(hn.expandByPoint(Yr.min),hn.expandByPoint(Yr.max))}hn.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)zt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(zt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)zt.fromBufferAttribute(a,c),l&&(fr.fromBufferAttribute(e,c),zt.add(fr)),r=Math.max(r,i.distanceToSquared(zt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.array,r=t.position.array,s=t.normal.array,o=t.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Yt(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],u=[];for(let M=0;M<a;M++)c[M]=new P,u[M]=new P;let h=new P,d=new P,f=new P,m=new re,x=new re,p=new re,g=new P,y=new P;function _(M,L,k){h.fromArray(r,M*3),d.fromArray(r,L*3),f.fromArray(r,k*3),m.fromArray(o,M*2),x.fromArray(o,L*2),p.fromArray(o,k*2),d.sub(h),f.sub(h),x.sub(m),p.sub(m);let K=1/(x.x*p.y-p.x*x.y);isFinite(K)&&(g.copy(d).multiplyScalar(p.y).addScaledVector(f,-x.y).multiplyScalar(K),y.copy(f).multiplyScalar(x.x).addScaledVector(d,-p.x).multiplyScalar(K),c[M].add(g),c[L].add(g),c[k].add(g),u[M].add(y),u[L].add(y),u[k].add(y))}let S=this.groups;S.length===0&&(S=[{start:0,count:i.length}]);for(let M=0,L=S.length;M<L;++M){let k=S[M],K=k.start,I=k.count;for(let z=K,B=K+I;z<B;z+=3)_(i[z+0],i[z+1],i[z+2])}let E=new P,b=new P,T=new P,R=new P;function v(M){T.fromArray(s,M*3),R.copy(T);let L=c[M];E.copy(L),E.sub(T.multiplyScalar(T.dot(L))).normalize(),b.crossVectors(R,L);let K=b.dot(u[M])<0?-1:1;l[M*4]=E.x,l[M*4+1]=E.y,l[M*4+2]=E.z,l[M*4+3]=K}for(let M=0,L=S.length;M<L;++M){let k=S[M],K=k.start,I=k.count;for(let z=K,B=K+I;z<B;z+=3)v(i[z+0]),v(i[z+1]),v(i[z+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Yt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let r=new P,s=new P,o=new P,a=new P,l=new P,c=new P,u=new P,h=new P;if(e)for(let d=0,f=e.count;d<f;d+=3){let m=e.getX(d+0),x=e.getX(d+1),p=e.getX(d+2);r.fromBufferAttribute(t,m),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,p),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,p),a.add(u),l.add(u),c.add(u),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)zt.fromBufferAttribute(e,t),zt.normalize(),e.setXYZ(t,zt.x,zt.y,zt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),f=0,m=0;for(let x=0,p=l.length;x<p;x++){a.isInterleavedBufferAttribute?f=l[x]*a.data.stride+a.offset:f=l[x]*u;for(let g=0;g<u;g++)d[m++]=c[f++]}return new Yt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,i);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,i);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone(t));let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ru=new xt,zi=new xl,Ws=new Zi,Pu=new P,pr=new P,mr=new P,gr=new P,Ya=new P,Xs=new P,qs=new re,Ys=new re,Ks=new re,Iu=new P,Lu=new P,Du=new P,Zs=new P,$s=new P,se=class extends Kt{constructor(e=new Tt,t=new it){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Xs.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(Ya.fromBufferAttribute(h,e),o?Xs.addScaledVector(Ya,u):Xs.addScaledVector(Ya.sub(t),u))}t.add(Xs)}return t}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ws.copy(i.boundingSphere),Ws.applyMatrix4(s),zi.copy(e.ray).recast(e.near),!(Ws.containsPoint(zi.origin)===!1&&(zi.intersectSphere(Ws,Pu)===null||zi.origin.distanceToSquared(Pu)>(e.far-e.near)**2))&&(Ru.copy(s).invert(),zi.copy(e.ray).applyMatrix4(Ru),!(i.boundingBox!==null&&zi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,zi)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,x=d.length;m<x;m++){let p=d[m],g=o[p.materialIndex],y=Math.max(p.start,f.start),_=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let S=y,E=_;S<E;S+=3){let b=a.getX(S),T=a.getX(S+1),R=a.getX(S+2);r=Js(this,g,e,i,c,u,h,b,T,R),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let m=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let p=m,g=x;p<g;p+=3){let y=a.getX(p),_=a.getX(p+1),S=a.getX(p+2);r=Js(this,o,e,i,c,u,h,y,_,S),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,x=d.length;m<x;m++){let p=d[m],g=o[p.materialIndex],y=Math.max(p.start,f.start),_=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let S=y,E=_;S<E;S+=3){let b=S,T=S+1,R=S+2;r=Js(this,g,e,i,c,u,h,b,T,R),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let m=Math.max(0,f.start),x=Math.min(l.count,f.start+f.count);for(let p=m,g=x;p<g;p+=3){let y=p,_=p+1,S=p+2;r=Js(this,o,e,i,c,u,h,y,_,S),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}}};function hm(n,e,t,i,r,s,o,a){let l;if(e.side===Pt?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===wi,a),l===null)return null;$s.copy(a),$s.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo($s);return c<t.near||c>t.far?null:{distance:c,point:$s.clone(),object:n}}function Js(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,pr),n.getVertexPosition(l,mr),n.getVertexPosition(c,gr);let u=hm(n,e,t,i,pr,mr,gr,Zs);if(u){r&&(qs.fromBufferAttribute(r,a),Ys.fromBufferAttribute(r,l),Ks.fromBufferAttribute(r,c),u.uv=Wi.getInterpolation(Zs,pr,mr,gr,qs,Ys,Ks,new re)),s&&(qs.fromBufferAttribute(s,a),Ys.fromBufferAttribute(s,l),Ks.fromBufferAttribute(s,c),u.uv1=Wi.getInterpolation(Zs,pr,mr,gr,qs,Ys,Ks,new re),u.uv2=u.uv1),o&&(Iu.fromBufferAttribute(o,a),Lu.fromBufferAttribute(o,l),Du.fromBufferAttribute(o,c),u.normal=Wi.getInterpolation(Zs,pr,mr,gr,Iu,Lu,Du,new P),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new P,materialIndex:0};Wi.getNormal(pr,mr,gr,h.normal),u.face=h}return u}var en=class n extends Tt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,f=0;m("z","y","x",-1,-1,i,t,e,o,s,0),m("z","y","x",1,-1,i,t,-e,o,s,1),m("x","z","y",1,1,e,i,t,r,o,2),m("x","z","y",1,-1,e,i,-t,r,o,3),m("x","y","z",1,-1,e,t,i,r,s,4),m("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(u,3)),this.setAttribute("uv",new Ke(h,2));function m(x,p,g,y,_,S,E,b,T,R,v){let M=S/T,L=E/R,k=S/2,K=E/2,I=b/2,z=T+1,B=R+1,O=0,H=0,j=new P;for(let $=0;$<B;$++){let Q=$*L-K;for(let pe=0;pe<z;pe++){let V=pe*M-k;j[x]=V*y,j[p]=Q*_,j[g]=I,c.push(j.x,j.y,j.z),j[x]=0,j[p]=0,j[g]=b>0?1:-1,u.push(j.x,j.y,j.z),h.push(pe/T),h.push(1-$/R),O+=1}}for(let $=0;$<R;$++)for(let Q=0;Q<T;Q++){let pe=d+Q+z*$,V=d+Q+z*($+1),oe=d+(Q+1)+z*($+1),de=d+(Q+1)+z*$;l.push(pe,V,de),l.push(V,oe,de),H+=6}a.addGroup(f,H,v),f+=H,d+=O}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ur(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Jt(n){let e={};for(let t=0;t<n.length;t++){let i=Ur(n[t]);for(let r in i)e[r]=i[r]}return e}function dm(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Ah(n){return n.getRenderTarget()===null?n.outputColorSpace:ft.workingColorSpace}var fm={clone:Ur,merge:Jt},pm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,mm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,tn=class extends li{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=pm,this.fragmentShader=mm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ur(e.uniforms),this.uniformsGroups=dm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},Eo=class extends Kt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new xt,this.projectionMatrix=new xt,this.projectionMatrixInverse=new xt,this.coordinateSystem=si}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},cn=class extends Eo{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=fl*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Pa*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return fl*2*Math.atan(Math.tan(Pa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Pa*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},xr=-90,_r=1,_l=class extends Kt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new cn(xr,_r,e,t);r.layers=this.layers,this.add(r);let s=new cn(xr,_r,e,t);s.layers=this.layers,this.add(s);let o=new cn(xr,_r,e,t);o.layers=this.layers,this.add(o);let a=new cn(xr,_r,e,t);a.layers=this.layers,this.add(a);let l=new cn(xr,_r,e,t);l.layers=this.layers,this.add(l);let c=new cn(xr,_r,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===si)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===go)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,r),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},To=class extends vn{constructor(e,t,i,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:Ir,super(e,t,i,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},yl=class extends Qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];t.encoding!==void 0&&(es("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Yi?pt:yn),this.texture=new To(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:_n}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new en(5,5,5),s=new tn({name:"CubemapFromEquirect",uniforms:Ur(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Pt,blending:bi});s.uniforms.tEquirect.value=t;let o=new se(r,s),a=t.minFilter;return t.minFilter===rs&&(t.minFilter=_n),new _l(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}},Ka=new P,gm=new P,xm=new tt,ii=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=Ka.subVectors(i,t).cross(gm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(Ka),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||xm.getNormalMatrix(e),r=this.coplanarPoint(Ka).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Bi=new Zi,js=new P,ss=class{constructor(e=new ii,t=new ii,i=new ii,r=new ii,s=new ii,o=new ii){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=si){let i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],d=r[7],f=r[8],m=r[9],x=r[10],p=r[11],g=r[12],y=r[13],_=r[14],S=r[15];if(i[0].setComponents(l-s,d-c,p-f,S-g).normalize(),i[1].setComponents(l+s,d+c,p+f,S+g).normalize(),i[2].setComponents(l+o,d+u,p+m,S+y).normalize(),i[3].setComponents(l-o,d-u,p-m,S-y).normalize(),i[4].setComponents(l-a,d-h,p-x,S-_).normalize(),t===si)i[5].setComponents(l+a,d+h,p+x,S+_).normalize();else if(t===go)i[5].setComponents(a,h,x,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Bi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bi)}intersectsSprite(e){return Bi.center.set(0,0,0),Bi.radius=.7071067811865476,Bi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bi)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(js.x=r.normal.x>0?e.max.x:e.min.x,js.y=r.normal.y>0?e.max.y:e.min.y,js.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(js)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Ch(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function _m(n,e){let t=e.isWebGL2,i=new WeakMap;function r(c,u){let h=c.array,d=c.usage,f=h.byteLength,m=n.createBuffer();n.bindBuffer(u,m),n.bufferData(u,h,d),c.onUploadCallback();let x;if(h instanceof Float32Array)x=n.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)x=n.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=n.UNSIGNED_SHORT;else if(h instanceof Int16Array)x=n.SHORT;else if(h instanceof Uint32Array)x=n.UNSIGNED_INT;else if(h instanceof Int32Array)x=n.INT;else if(h instanceof Int8Array)x=n.BYTE;else if(h instanceof Uint8Array)x=n.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)x=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:m,type:x,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:f}}function s(c,u,h){let d=u.array,f=u._updateRange,m=u.updateRanges;if(n.bindBuffer(h,c),f.count===-1&&m.length===0&&n.bufferSubData(h,0,d),m.length!==0){for(let x=0,p=m.length;x<p;x++){let g=m[x];t?n.bufferSubData(h,g.start*d.BYTES_PER_ELEMENT,d,g.start,g.count):n.bufferSubData(h,g.start*d.BYTES_PER_ELEMENT,d.subarray(g.start,g.start+g.count))}u.clearUpdateRanges()}f.count!==-1&&(t?n.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d,f.offset,f.count):n.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d.subarray(f.offset,f.offset+f.count)),f.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),i.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let u=i.get(c);u&&(n.deleteBuffer(u.buffer),i.delete(c))}function l(c,u){if(c.isGLBufferAttribute){let d=i.get(c);(!d||d.version<c.version)&&i.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let h=i.get(c);if(h===void 0)i.set(c,r(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}var Gt=class n extends Tt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,u=l+1,h=e/a,d=t/l,f=[],m=[],x=[],p=[];for(let g=0;g<u;g++){let y=g*d-o;for(let _=0;_<c;_++){let S=_*h-s;m.push(S,-y,0),x.push(0,0,1),p.push(_/a),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let y=0;y<a;y++){let _=y+c*g,S=y+c*(g+1),E=y+1+c*(g+1),b=y+1+c*g;f.push(_,S,b),f.push(S,E,b)}this.setIndex(f),this.setAttribute("position",new Ke(m,3)),this.setAttribute("normal",new Ke(x,3)),this.setAttribute("uv",new Ke(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},ym=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,vm=`#ifdef USE_ALPHAHASH
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
#endif`,bm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Mm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Sm=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,wm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Em=`#ifdef USE_AOMAP
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
#endif`,Tm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Am=`#ifdef USE_BATCHING
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
#endif`,Cm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Rm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Pm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Im=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Lm=`#ifdef USE_IRIDESCENCE
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
#endif`,Dm=`#ifdef USE_BUMPMAP
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
#endif`,Um=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Nm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Om=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Fm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,km=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,zm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Bm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Gm=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Hm=`#define PI 3.141592653589793
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
} // validated`,Vm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Wm=`vec3 transformedNormal = objectNormal;
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
#endif`,Xm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ym=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Km=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Zm="gl_FragColor = linearToOutputTexel( gl_FragColor );",$m=`
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
}`,Jm=`#ifdef USE_ENVMAP
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
#endif`,jm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Qm=`#ifdef USE_ENVMAP
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
#endif`,e0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,t0=`#ifdef USE_ENVMAP
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
#endif`,n0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,i0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,r0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,s0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,o0=`#ifdef USE_GRADIENTMAP
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
}`,a0=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,l0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,c0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,u0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,h0=`uniform bool receiveShadow;
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
#endif`,d0=`#ifdef USE_ENVMAP
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
#endif`,f0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,p0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,m0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,g0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,x0=`PhysicalMaterial material;
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
#endif`,_0=`struct PhysicalMaterial {
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
}`,y0=`
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
#endif`,v0=`#if defined( RE_IndirectDiffuse )
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
#endif`,b0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,M0=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,S0=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,w0=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,E0=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,T0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,A0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,C0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,R0=`#if defined( USE_POINTS_UV )
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
#endif`,P0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,I0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,L0=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,D0=`#ifdef USE_MORPHNORMALS
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
#endif`,U0=`#ifdef USE_MORPHTARGETS
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
#endif`,N0=`#ifdef USE_MORPHTARGETS
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
#endif`,O0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,F0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,k0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,z0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,B0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,G0=`#ifdef USE_NORMALMAP
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
#endif`,H0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,V0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,W0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,X0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,q0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Y0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,K0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Z0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,J0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,j0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Q0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,eg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,tg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ng=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,ig=`float getShadowMask() {
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
}`,rg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,sg=`#ifdef USE_SKINNING
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
#endif`,og=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ag=`#ifdef USE_SKINNING
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
#endif`,lg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,cg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ug=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,hg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,dg=`#ifdef USE_TRANSMISSION
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
#endif`,fg=`#ifdef USE_TRANSMISSION
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
#endif`,pg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,mg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,xg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,_g=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,yg=`uniform sampler2D t2D;
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
}`,vg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Mg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wg=`#include <common>
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
}`,Eg=`#if DEPTH_PACKING == 3200
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
}`,Tg=`#define DISTANCE
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
}`,Ag=`#define DISTANCE
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
}`,Cg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Rg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pg=`uniform float scale;
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
}`,Ig=`uniform vec3 diffuse;
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
}`,Lg=`#include <common>
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
}`,Dg=`uniform vec3 diffuse;
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
}`,Ug=`#define LAMBERT
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
}`,Ng=`#define LAMBERT
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
}`,Og=`#define MATCAP
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
}`,Fg=`#define MATCAP
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
}`,kg=`#define NORMAL
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
}`,zg=`#define NORMAL
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
}`,Bg=`#define PHONG
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
}`,Gg=`#define PHONG
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
}`,Hg=`#define STANDARD
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
}`,Vg=`#define STANDARD
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
}`,Wg=`#define TOON
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
}`,Xg=`#define TOON
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
}`,qg=`uniform float size;
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
}`,Yg=`uniform vec3 diffuse;
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
}`,Kg=`#include <common>
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
}`,Zg=`uniform vec3 color;
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
}`,$g=`uniform float rotation;
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
}`,Jg=`uniform vec3 diffuse;
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
}`,Qe={alphahash_fragment:ym,alphahash_pars_fragment:vm,alphamap_fragment:bm,alphamap_pars_fragment:Mm,alphatest_fragment:Sm,alphatest_pars_fragment:wm,aomap_fragment:Em,aomap_pars_fragment:Tm,batching_pars_vertex:Am,batching_vertex:Cm,begin_vertex:Rm,beginnormal_vertex:Pm,bsdfs:Im,iridescence_fragment:Lm,bumpmap_pars_fragment:Dm,clipping_planes_fragment:Um,clipping_planes_pars_fragment:Nm,clipping_planes_pars_vertex:Om,clipping_planes_vertex:Fm,color_fragment:km,color_pars_fragment:zm,color_pars_vertex:Bm,color_vertex:Gm,common:Hm,cube_uv_reflection_fragment:Vm,defaultnormal_vertex:Wm,displacementmap_pars_vertex:Xm,displacementmap_vertex:qm,emissivemap_fragment:Ym,emissivemap_pars_fragment:Km,colorspace_fragment:Zm,colorspace_pars_fragment:$m,envmap_fragment:Jm,envmap_common_pars_fragment:jm,envmap_pars_fragment:Qm,envmap_pars_vertex:e0,envmap_physical_pars_fragment:d0,envmap_vertex:t0,fog_vertex:n0,fog_pars_vertex:i0,fog_fragment:r0,fog_pars_fragment:s0,gradientmap_pars_fragment:o0,lightmap_fragment:a0,lightmap_pars_fragment:l0,lights_lambert_fragment:c0,lights_lambert_pars_fragment:u0,lights_pars_begin:h0,lights_toon_fragment:f0,lights_toon_pars_fragment:p0,lights_phong_fragment:m0,lights_phong_pars_fragment:g0,lights_physical_fragment:x0,lights_physical_pars_fragment:_0,lights_fragment_begin:y0,lights_fragment_maps:v0,lights_fragment_end:b0,logdepthbuf_fragment:M0,logdepthbuf_pars_fragment:S0,logdepthbuf_pars_vertex:w0,logdepthbuf_vertex:E0,map_fragment:T0,map_pars_fragment:A0,map_particle_fragment:C0,map_particle_pars_fragment:R0,metalnessmap_fragment:P0,metalnessmap_pars_fragment:I0,morphcolor_vertex:L0,morphnormal_vertex:D0,morphtarget_pars_vertex:U0,morphtarget_vertex:N0,normal_fragment_begin:O0,normal_fragment_maps:F0,normal_pars_fragment:k0,normal_pars_vertex:z0,normal_vertex:B0,normalmap_pars_fragment:G0,clearcoat_normal_fragment_begin:H0,clearcoat_normal_fragment_maps:V0,clearcoat_pars_fragment:W0,iridescence_pars_fragment:X0,opaque_fragment:q0,packing:Y0,premultiplied_alpha_fragment:K0,project_vertex:Z0,dithering_fragment:$0,dithering_pars_fragment:J0,roughnessmap_fragment:j0,roughnessmap_pars_fragment:Q0,shadowmap_pars_fragment:eg,shadowmap_pars_vertex:tg,shadowmap_vertex:ng,shadowmask_pars_fragment:ig,skinbase_vertex:rg,skinning_pars_vertex:sg,skinning_vertex:og,skinnormal_vertex:ag,specularmap_fragment:lg,specularmap_pars_fragment:cg,tonemapping_fragment:ug,tonemapping_pars_fragment:hg,transmission_fragment:dg,transmission_pars_fragment:fg,uv_pars_fragment:pg,uv_pars_vertex:mg,uv_vertex:gg,worldpos_vertex:xg,background_vert:_g,background_frag:yg,backgroundCube_vert:vg,backgroundCube_frag:bg,cube_vert:Mg,cube_frag:Sg,depth_vert:wg,depth_frag:Eg,distanceRGBA_vert:Tg,distanceRGBA_frag:Ag,equirect_vert:Cg,equirect_frag:Rg,linedashed_vert:Pg,linedashed_frag:Ig,meshbasic_vert:Lg,meshbasic_frag:Dg,meshlambert_vert:Ug,meshlambert_frag:Ng,meshmatcap_vert:Og,meshmatcap_frag:Fg,meshnormal_vert:kg,meshnormal_frag:zg,meshphong_vert:Bg,meshphong_frag:Gg,meshphysical_vert:Hg,meshphysical_frag:Vg,meshtoon_vert:Wg,meshtoon_frag:Xg,points_vert:qg,points_frag:Yg,shadow_vert:Kg,shadow_frag:Zg,sprite_vert:$g,sprite_frag:Jg},_e={common:{diffuse:{value:new We(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new tt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new tt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new tt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new tt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new tt},normalScale:{value:new re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new tt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new tt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new tt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new tt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new We(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new We(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0},uvTransform:{value:new tt}},sprite:{diffuse:{value:new We(16777215)},opacity:{value:1},center:{value:new re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}}},zn={basic:{uniforms:Jt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:Jt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new We(0)}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:Jt([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new We(0)},specular:{value:new We(1118481)},shininess:{value:30}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:Jt([_e.common,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.roughnessmap,_e.metalnessmap,_e.fog,_e.lights,{emissive:{value:new We(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:Jt([_e.common,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.gradientmap,_e.fog,_e.lights,{emissive:{value:new We(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:Jt([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:Jt([_e.points,_e.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:Jt([_e.common,_e.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:Jt([_e.common,_e.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:Jt([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:Jt([_e.sprite,_e.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new tt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distanceRGBA:{uniforms:Jt([_e.common,_e.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distanceRGBA_vert,fragmentShader:Qe.distanceRGBA_frag},shadow:{uniforms:Jt([_e.lights,_e.fog,{color:{value:new We(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};zn.physical={uniforms:Jt([zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new tt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new tt},clearcoatNormalScale:{value:new re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new tt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new tt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new tt},sheen:{value:0},sheenColor:{value:new We(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new tt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new tt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new tt},transmissionSamplerSize:{value:new re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new tt},attenuationDistance:{value:0},attenuationColor:{value:new We(0)},specularColor:{value:new We(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new tt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new tt},anisotropyVector:{value:new re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new tt}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};var Qs={r:0,b:0,g:0};function jg(n,e,t,i,r,s,o){let a=new We(0),l=s===!0?0:1,c,u,h=null,d=0,f=null;function m(p,g){let y=!1,_=g.isScene===!0?g.background:null;_&&_.isTexture&&(_=(g.backgroundBlurriness>0?t:e).get(_)),_===null?x(a,l):_&&_.isColor&&(x(_,1),y=!0);let S=n.xr.getEnvironmentBlendMode();S==="additive"?i.buffers.color.setClear(0,0,0,1,o):S==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||y)&&n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil),_&&(_.isCubeTexture||_.mapping===Go)?(u===void 0&&(u=new se(new en(1,1,1),new tn({name:"BackgroundCubeMaterial",uniforms:Ur(zn.backgroundCube.uniforms),vertexShader:zn.backgroundCube.vertexShader,fragmentShader:zn.backgroundCube.fragmentShader,side:Pt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,b,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),u.material.uniforms.envMap.value=_,u.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=g.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,u.material.toneMapped=ft.getTransfer(_.colorSpace)!==yt,(h!==_||d!==_.version||f!==n.toneMapping)&&(u.material.needsUpdate=!0,h=_,d=_.version,f=n.toneMapping),u.layers.enableAll(),p.unshift(u,u.geometry,u.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new se(new Gt(2,2),new tn({name:"BackgroundMaterial",uniforms:Ur(zn.background.uniforms),vertexShader:zn.background.vertexShader,fragmentShader:zn.background.fragmentShader,side:wi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,c.material.toneMapped=ft.getTransfer(_.colorSpace)!==yt,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(h!==_||d!==_.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,h=_,d=_.version,f=n.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null))}function x(p,g){p.getRGB(Qs,Ah(n)),i.buffers.color.setClear(Qs.r,Qs.g,Qs.b,g,o)}return{getClearColor:function(){return a},setClearColor:function(p,g=1){a.set(p),l=g,x(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,x(a,l)},render:m}}function Qg(n,e,t,i){let r=n.getParameter(n.MAX_VERTEX_ATTRIBS),s=i.isWebGL2?null:e.get("OES_vertex_array_object"),o=i.isWebGL2||s!==null,a={},l=p(null),c=l,u=!1;function h(I,z,B,O,H){let j=!1;if(o){let $=x(O,B,z);c!==$&&(c=$,f(c.object)),j=g(I,O,B,H),j&&y(I,O,B,H)}else{let $=z.wireframe===!0;(c.geometry!==O.id||c.program!==B.id||c.wireframe!==$)&&(c.geometry=O.id,c.program=B.id,c.wireframe=$,j=!0)}H!==null&&t.update(H,n.ELEMENT_ARRAY_BUFFER),(j||u)&&(u=!1,R(I,z,B,O),H!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}function d(){return i.isWebGL2?n.createVertexArray():s.createVertexArrayOES()}function f(I){return i.isWebGL2?n.bindVertexArray(I):s.bindVertexArrayOES(I)}function m(I){return i.isWebGL2?n.deleteVertexArray(I):s.deleteVertexArrayOES(I)}function x(I,z,B){let O=B.wireframe===!0,H=a[I.id];H===void 0&&(H={},a[I.id]=H);let j=H[z.id];j===void 0&&(j={},H[z.id]=j);let $=j[O];return $===void 0&&($=p(d()),j[O]=$),$}function p(I){let z=[],B=[],O=[];for(let H=0;H<r;H++)z[H]=0,B[H]=0,O[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:B,attributeDivisors:O,object:I,attributes:{},index:null}}function g(I,z,B,O){let H=c.attributes,j=z.attributes,$=0,Q=B.getAttributes();for(let pe in Q)if(Q[pe].location>=0){let oe=H[pe],de=j[pe];if(de===void 0&&(pe==="instanceMatrix"&&I.instanceMatrix&&(de=I.instanceMatrix),pe==="instanceColor"&&I.instanceColor&&(de=I.instanceColor)),oe===void 0||oe.attribute!==de||de&&oe.data!==de.data)return!0;$++}return c.attributesNum!==$||c.index!==O}function y(I,z,B,O){let H={},j=z.attributes,$=0,Q=B.getAttributes();for(let pe in Q)if(Q[pe].location>=0){let oe=j[pe];oe===void 0&&(pe==="instanceMatrix"&&I.instanceMatrix&&(oe=I.instanceMatrix),pe==="instanceColor"&&I.instanceColor&&(oe=I.instanceColor));let de={};de.attribute=oe,oe&&oe.data&&(de.data=oe.data),H[pe]=de,$++}c.attributes=H,c.attributesNum=$,c.index=O}function _(){let I=c.newAttributes;for(let z=0,B=I.length;z<B;z++)I[z]=0}function S(I){E(I,0)}function E(I,z){let B=c.newAttributes,O=c.enabledAttributes,H=c.attributeDivisors;B[I]=1,O[I]===0&&(n.enableVertexAttribArray(I),O[I]=1),H[I]!==z&&((i.isWebGL2?n:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](I,z),H[I]=z)}function b(){let I=c.newAttributes,z=c.enabledAttributes;for(let B=0,O=z.length;B<O;B++)z[B]!==I[B]&&(n.disableVertexAttribArray(B),z[B]=0)}function T(I,z,B,O,H,j,$){$===!0?n.vertexAttribIPointer(I,z,B,H,j):n.vertexAttribPointer(I,z,B,O,H,j)}function R(I,z,B,O){if(i.isWebGL2===!1&&(I.isInstancedMesh||O.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;_();let H=O.attributes,j=B.getAttributes(),$=z.defaultAttributeValues;for(let Q in j){let pe=j[Q];if(pe.location>=0){let V=H[Q];if(V===void 0&&(Q==="instanceMatrix"&&I.instanceMatrix&&(V=I.instanceMatrix),Q==="instanceColor"&&I.instanceColor&&(V=I.instanceColor)),V!==void 0){let oe=V.normalized,de=V.itemSize,ge=t.get(V);if(ge===void 0)continue;let Me=ge.buffer,Oe=ge.type,Xe=ge.bytesPerElement,Pe=i.isWebGL2===!0&&(Oe===n.INT||Oe===n.UNSIGNED_INT||V.gpuType===ph);if(V.isInterleavedBufferAttribute){let Ne=V.data,D=Ne.stride,fe=V.offset;if(Ne.isInstancedInterleavedBuffer){for(let W=0;W<pe.locationSize;W++)E(pe.location+W,Ne.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=Ne.meshPerAttribute*Ne.count)}else for(let W=0;W<pe.locationSize;W++)S(pe.location+W);n.bindBuffer(n.ARRAY_BUFFER,Me);for(let W=0;W<pe.locationSize;W++)T(pe.location+W,de/pe.locationSize,Oe,oe,D*Xe,(fe+de/pe.locationSize*W)*Xe,Pe)}else{if(V.isInstancedBufferAttribute){for(let Ne=0;Ne<pe.locationSize;Ne++)E(pe.location+Ne,V.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=V.meshPerAttribute*V.count)}else for(let Ne=0;Ne<pe.locationSize;Ne++)S(pe.location+Ne);n.bindBuffer(n.ARRAY_BUFFER,Me);for(let Ne=0;Ne<pe.locationSize;Ne++)T(pe.location+Ne,de/pe.locationSize,Oe,oe,de*Xe,de/pe.locationSize*Ne*Xe,Pe)}}else if($!==void 0){let oe=$[Q];if(oe!==void 0)switch(oe.length){case 2:n.vertexAttrib2fv(pe.location,oe);break;case 3:n.vertexAttrib3fv(pe.location,oe);break;case 4:n.vertexAttrib4fv(pe.location,oe);break;default:n.vertexAttrib1fv(pe.location,oe)}}}}b()}function v(){k();for(let I in a){let z=a[I];for(let B in z){let O=z[B];for(let H in O)m(O[H].object),delete O[H];delete z[B]}delete a[I]}}function M(I){if(a[I.id]===void 0)return;let z=a[I.id];for(let B in z){let O=z[B];for(let H in O)m(O[H].object),delete O[H];delete z[B]}delete a[I.id]}function L(I){for(let z in a){let B=a[z];if(B[I.id]===void 0)continue;let O=B[I.id];for(let H in O)m(O[H].object),delete O[H];delete B[I.id]}}function k(){K(),u=!0,c!==l&&(c=l,f(c.object))}function K(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:k,resetDefaultState:K,dispose:v,releaseStatesOfGeometry:M,releaseStatesOfProgram:L,initAttributes:_,enableAttribute:S,disableUnusedAttributes:b}}function ex(n,e,t,i){let r=i.isWebGL2,s;function o(u){s=u}function a(u,h){n.drawArrays(s,u,h),t.update(h,s,1)}function l(u,h,d){if(d===0)return;let f,m;if(r)f=n,m="drawArraysInstanced";else if(f=e.get("ANGLE_instanced_arrays"),m="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[m](s,u,h,d),t.update(h,s,d)}function c(u,h,d){if(d===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let m=0;m<d;m++)this.render(u[m],h[m]);else{f.multiDrawArraysWEBGL(s,u,0,h,0,d);let m=0;for(let x=0;x<d;x++)m+=h[x];t.update(m,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function tx(n,e,t){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let T=e.get("EXT_texture_filter_anisotropic");i=n.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(T){if(T==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&n.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),d=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),x=n.getParameter(n.MAX_VERTEX_ATTRIBS),p=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),g=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),_=d>0,S=o||e.has("OES_texture_float"),E=_&&S,b=o?n.getParameter(n.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:d,maxTextureSize:f,maxCubemapSize:m,maxAttributes:x,maxVertexUniforms:p,maxVaryings:g,maxFragmentUniforms:y,vertexTextures:_,floatFragmentTextures:S,floatVertexTextures:E,maxSamples:b}}function nx(n){let e=this,t=null,i=0,r=!1,s=!1,o=new ii,a=new tt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||i!==0||r;return r=d,i=h.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let m=h.clippingPlanes,x=h.clipIntersection,p=h.clipShadows,g=n.get(h);if(!r||m===null||m.length===0||s&&!p)s?u(null):c();else{let y=s?0:i,_=y*4,S=g.clippingState||null;l.value=S,S=u(m,d,_,f);for(let E=0;E!==_;++E)S[E]=t[E];g.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,d,f,m){let x=h!==null?h.length:0,p=null;if(x!==0){if(p=l.value,m!==!0||p===null){let g=f+x*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<g)&&(p=new Float32Array(g));for(let _=0,S=f;_!==x;++_,S+=4)o.copy(h[_]).applyMatrix4(y,a),o.normal.toArray(p,S),p[S+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,p}}function ix(n){let e=new WeakMap;function t(o,a){return a===ll?o.mapping=Ir:a===cl&&(o.mapping=Lr),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===ll||a===cl)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new yl(l.height/2);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}var Bn=class extends Eo{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Er=4,Uu=[.125,.215,.35,.446,.526,.582],Vi=20,Za=new Bn,Nu=new We,$a=null,Ja=0,ja=0,Gi=(1+Math.sqrt(5))/2,yr=1/Gi,Ou=[new P(1,1,1),new P(-1,1,1),new P(1,1,-1),new P(-1,1,-1),new P(0,Gi,yr),new P(0,Gi,-yr),new P(yr,0,Gi),new P(-yr,0,Gi),new P(Gi,yr,0),new P(-Gi,yr,0)],Nr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){$a=this._renderer.getRenderTarget(),Ja=this._renderer.getActiveCubeFace(),ja=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=zu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ku(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget($a,Ja,ja),e.scissorTest=!1,eo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ir||e.mapping===Lr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),$a=this._renderer.getRenderTarget(),Ja=this._renderer.getActiveCubeFace(),ja=this._renderer.getActiveMipmapLevel();let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:_n,minFilter:_n,generateMipmaps:!1,type:Ki,format:Dn,colorSpace:ai,depthBuffer:!1},r=Fu(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fu(e,t,i);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=rx(s)),this._blurMaterial=sx(s,e,t)}return r}_compileMaterial(e){let t=new se(this._lodPlanes[0],e);this._renderer.compile(t,Za)}_sceneToCubeUV(e,t,i,r){let a=new cn(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(Nu),u.toneMapping=Un,u.autoClear=!1;let f=new it({name:"PMREM.Background",side:Pt,depthWrite:!1,depthTest:!1}),m=new se(new en,f),x=!1,p=e.background;p?p.isColor&&(f.color.copy(p),e.background=null,x=!0):(f.color.copy(Nu),x=!0);for(let g=0;g<6;g++){let y=g%3;y===0?(a.up.set(0,l[g],0),a.lookAt(c[g],0,0)):y===1?(a.up.set(0,0,l[g]),a.lookAt(0,c[g],0)):(a.up.set(0,l[g],0),a.lookAt(0,0,c[g]));let _=this._cubeSize;eo(r,y*_,g>2?_:0,_,_),u.setRenderTarget(r),x&&u.render(m,a),u.render(e,a)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=p}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===Ir||e.mapping===Lr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=zu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ku());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new se(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;eo(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Za)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Ou[(r-1)%Ou.length];this._blur(e,r-1,r,s,o)}t.autoClear=i}_blur(e,t,i,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new se(this._lodPlanes[r],c),d=c.uniforms,f=this._sizeLods[i]-1,m=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Vi-1),x=s/m,p=isFinite(s)?1+Math.floor(u*x):Vi;p>Vi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Vi}`);let g=[],y=0;for(let T=0;T<Vi;++T){let R=T/x,v=Math.exp(-R*R/2);g.push(v),T===0?y+=v:T<p&&(y+=2*v)}for(let T=0;T<g.length;T++)g[T]=g[T]/y;d.envMap.value=e.texture,d.samples.value=p,d.weights.value=g,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:_}=this;d.dTheta.value=m,d.mipInt.value=_-i;let S=this._sizeLods[r],E=3*S*(r>_-Er?r-_+Er:0),b=4*(this._cubeSize-S);eo(t,E,b,3*S,2*S),l.setRenderTarget(t),l.render(h,Za)}};function rx(n){let e=[],t=[],i=[],r=n,s=n-Er+1+Uu.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>n-Er?l=Uu[o-n+Er-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,m=6,x=3,p=2,g=1,y=new Float32Array(x*m*f),_=new Float32Array(p*m*f),S=new Float32Array(g*m*f);for(let b=0;b<f;b++){let T=b%3*2/3-1,R=b>2?0:-1,v=[T,R,0,T+2/3,R,0,T+2/3,R+1,0,T,R,0,T+2/3,R+1,0,T,R+1,0];y.set(v,x*m*b),_.set(d,p*m*b);let M=[b,b,b,b,b,b];S.set(M,g*m*b)}let E=new Tt;E.setAttribute("position",new Yt(y,x)),E.setAttribute("uv",new Yt(_,p)),E.setAttribute("faceIndex",new Yt(S,g)),e.push(E),r>Er&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Fu(n,e,t){let i=new Qt(n,e,t);return i.texture.mapping=Go,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function eo(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function sx(n,e,t){let i=new Float32Array(Vi),r=new P(0,1,0);return new tn({name:"SphericalGaussianBlur",defines:{n:Vi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:nc(),fragmentShader:`

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
		`,blending:bi,depthTest:!1,depthWrite:!1})}function ku(){return new tn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:nc(),fragmentShader:`

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
		`,blending:bi,depthTest:!1,depthWrite:!1})}function zu(){return new tn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:nc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:bi,depthTest:!1,depthWrite:!1})}function nc(){return`

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
	`}function ox(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===ll||l===cl,u=l===Ir||l===Lr;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new Nr(n)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{let h=a.image;if(c&&h&&h.height>0||u&&h&&r(h)){t===null&&(t=new Nr(n));let d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",s),d.texture}else return null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function ax(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(i){i.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(i){let r=t(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function lx(n,e,t,i){let r={},s=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);for(let m in d.morphAttributes){let x=d.morphAttributes[m];for(let p=0,g=x.length;p<g;p++)e.remove(x[p])}d.removeEventListener("dispose",o),delete r[d.id];let f=s.get(d);f&&(e.remove(f),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let m in d)e.update(d[m],n.ARRAY_BUFFER);let f=h.morphAttributes;for(let m in f){let x=f[m];for(let p=0,g=x.length;p<g;p++)e.update(x[p],n.ARRAY_BUFFER)}}function c(h){let d=[],f=h.index,m=h.attributes.position,x=0;if(f!==null){let y=f.array;x=f.version;for(let _=0,S=y.length;_<S;_+=3){let E=y[_+0],b=y[_+1],T=y[_+2];d.push(E,b,b,T,T,E)}}else if(m!==void 0){let y=m.array;x=m.version;for(let _=0,S=y.length/3-1;_<S;_+=3){let E=_+0,b=_+1,T=_+2;d.push(E,b,b,T,T,E)}}else return;let p=new(Eh(d)?wo:So)(d,1);p.version=x;let g=s.get(h);g&&e.remove(g),s.set(h,p)}function u(h){let d=s.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function cx(n,e,t,i){let r=i.isWebGL2,s;function o(f){s=f}let a,l;function c(f){a=f.type,l=f.bytesPerElement}function u(f,m){n.drawElements(s,m,a,f*l),t.update(m,s,1)}function h(f,m,x){if(x===0)return;let p,g;if(r)p=n,g="drawElementsInstanced";else if(p=e.get("ANGLE_instanced_arrays"),g="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[g](s,m,a,f*l,x),t.update(m,s,x)}function d(f,m,x){if(x===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<x;g++)this.render(f[g]/l,m[g]);else{p.multiDrawElementsWEBGL(s,m,0,a,f,0,x);let g=0;for(let y=0;y<x;y++)g+=m[y];t.update(g,s,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=d}function ux(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function hx(n,e){return n[0]-e[0]}function dx(n,e){return Math.abs(e[1])-Math.abs(n[1])}function fx(n,e,t){let i={},r=new Float32Array(8),s=new WeakMap,o=new Mt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){let d=c.morphTargetInfluences;if(e.isWebGL2===!0){let f=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,m=f!==void 0?f.length:0,x=s.get(u);if(x===void 0||x.count!==m){let I=function(){k.dispose(),s.delete(u),u.removeEventListener("dispose",I)};x!==void 0&&x.texture.dispose();let y=u.morphAttributes.position!==void 0,_=u.morphAttributes.normal!==void 0,S=u.morphAttributes.color!==void 0,E=u.morphAttributes.position||[],b=u.morphAttributes.normal||[],T=u.morphAttributes.color||[],R=0;y===!0&&(R=1),_===!0&&(R=2),S===!0&&(R=3);let v=u.attributes.position.count*R,M=1;v>e.maxTextureSize&&(M=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let L=new Float32Array(v*M*4*m),k=new vo(L,v,M,m);k.type=vi,k.needsUpdate=!0;let K=R*4;for(let z=0;z<m;z++){let B=E[z],O=b[z],H=T[z],j=v*M*4*z;for(let $=0;$<B.count;$++){let Q=$*K;y===!0&&(o.fromBufferAttribute(B,$),L[j+Q+0]=o.x,L[j+Q+1]=o.y,L[j+Q+2]=o.z,L[j+Q+3]=0),_===!0&&(o.fromBufferAttribute(O,$),L[j+Q+4]=o.x,L[j+Q+5]=o.y,L[j+Q+6]=o.z,L[j+Q+7]=0),S===!0&&(o.fromBufferAttribute(H,$),L[j+Q+8]=o.x,L[j+Q+9]=o.y,L[j+Q+10]=o.z,L[j+Q+11]=H.itemSize===4?o.w:1)}}x={count:m,texture:k,size:new re(v,M)},s.set(u,x),u.addEventListener("dispose",I)}let p=0;for(let y=0;y<d.length;y++)p+=d[y];let g=u.morphTargetsRelative?1:1-p;h.getUniforms().setValue(n,"morphTargetBaseInfluence",g),h.getUniforms().setValue(n,"morphTargetInfluences",d),h.getUniforms().setValue(n,"morphTargetsTexture",x.texture,t),h.getUniforms().setValue(n,"morphTargetsTextureSize",x.size)}else{let f=d===void 0?0:d.length,m=i[u.id];if(m===void 0||m.length!==f){m=[];for(let _=0;_<f;_++)m[_]=[_,0];i[u.id]=m}for(let _=0;_<f;_++){let S=m[_];S[0]=_,S[1]=d[_]}m.sort(dx);for(let _=0;_<8;_++)_<f&&m[_][1]?(a[_][0]=m[_][0],a[_][1]=m[_][1]):(a[_][0]=Number.MAX_SAFE_INTEGER,a[_][1]=0);a.sort(hx);let x=u.morphAttributes.position,p=u.morphAttributes.normal,g=0;for(let _=0;_<8;_++){let S=a[_],E=S[0],b=S[1];E!==Number.MAX_SAFE_INTEGER&&b?(x&&u.getAttribute("morphTarget"+_)!==x[E]&&u.setAttribute("morphTarget"+_,x[E]),p&&u.getAttribute("morphNormal"+_)!==p[E]&&u.setAttribute("morphNormal"+_,p[E]),r[_]=b,g+=b):(x&&u.hasAttribute("morphTarget"+_)===!0&&u.deleteAttribute("morphTarget"+_),p&&u.hasAttribute("morphNormal"+_)===!0&&u.deleteAttribute("morphNormal"+_),r[_]=0)}let y=u.morphTargetsRelative?1:1-g;h.getUniforms().setValue(n,"morphTargetBaseInfluence",y),h.getUniforms().setValue(n,"morphTargetInfluences",r)}}return{update:l}}function px(n,e,t,i){let r=new WeakMap;function s(l){let c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var Ao=class extends vn{constructor(e,t,i,r,s,o,a,l,c,u){if(u=u!==void 0?u:qi,u!==qi&&u!==Dr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===qi&&(i=yi),i===void 0&&u===Dr&&(i=Xi),super(null,r,s,o,a,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:jt,this.minFilter=l!==void 0?l:jt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Rh=new vn,Ph=new Ao(1,1);Ph.compareFunction=wh;var Ih=new vo,Lh=new gl,Dh=new To,Bu=[],Gu=[],Hu=new Float32Array(16),Vu=new Float32Array(9),Wu=new Float32Array(4);function Gr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=Bu[r];if(s===void 0&&(s=new Float32Array(r),Bu[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Ot(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Ft(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Vo(n,e){let t=Gu[e];t===void 0&&(t=new Int32Array(e),Gu[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function mx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function gx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ot(t,e))return;n.uniform2fv(this.addr,e),Ft(t,e)}}function xx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ot(t,e))return;n.uniform3fv(this.addr,e),Ft(t,e)}}function _x(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ot(t,e))return;n.uniform4fv(this.addr,e),Ft(t,e)}}function yx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ot(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Ft(t,e)}else{if(Ot(t,i))return;Wu.set(i),n.uniformMatrix2fv(this.addr,!1,Wu),Ft(t,i)}}function vx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ot(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Ft(t,e)}else{if(Ot(t,i))return;Vu.set(i),n.uniformMatrix3fv(this.addr,!1,Vu),Ft(t,i)}}function bx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ot(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Ft(t,e)}else{if(Ot(t,i))return;Hu.set(i),n.uniformMatrix4fv(this.addr,!1,Hu),Ft(t,i)}}function Mx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Sx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ot(t,e))return;n.uniform2iv(this.addr,e),Ft(t,e)}}function wx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ot(t,e))return;n.uniform3iv(this.addr,e),Ft(t,e)}}function Ex(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ot(t,e))return;n.uniform4iv(this.addr,e),Ft(t,e)}}function Tx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Ax(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ot(t,e))return;n.uniform2uiv(this.addr,e),Ft(t,e)}}function Cx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ot(t,e))return;n.uniform3uiv(this.addr,e),Ft(t,e)}}function Rx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ot(t,e))return;n.uniform4uiv(this.addr,e),Ft(t,e)}}function Px(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s=this.type===n.SAMPLER_2D_SHADOW?Ph:Rh;t.setTexture2D(e||s,r)}function Ix(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||Lh,r)}function Lx(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||Dh,r)}function Dx(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Ih,r)}function Ux(n){switch(n){case 5126:return mx;case 35664:return gx;case 35665:return xx;case 35666:return _x;case 35674:return yx;case 35675:return vx;case 35676:return bx;case 5124:case 35670:return Mx;case 35667:case 35671:return Sx;case 35668:case 35672:return wx;case 35669:case 35673:return Ex;case 5125:return Tx;case 36294:return Ax;case 36295:return Cx;case 36296:return Rx;case 35678:case 36198:case 36298:case 36306:case 35682:return Px;case 35679:case 36299:case 36307:return Ix;case 35680:case 36300:case 36308:case 36293:return Lx;case 36289:case 36303:case 36311:case 36292:return Dx}}function Nx(n,e){n.uniform1fv(this.addr,e)}function Ox(n,e){let t=Gr(e,this.size,2);n.uniform2fv(this.addr,t)}function Fx(n,e){let t=Gr(e,this.size,3);n.uniform3fv(this.addr,t)}function kx(n,e){let t=Gr(e,this.size,4);n.uniform4fv(this.addr,t)}function zx(n,e){let t=Gr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Bx(n,e){let t=Gr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Gx(n,e){let t=Gr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Hx(n,e){n.uniform1iv(this.addr,e)}function Vx(n,e){n.uniform2iv(this.addr,e)}function Wx(n,e){n.uniform3iv(this.addr,e)}function Xx(n,e){n.uniform4iv(this.addr,e)}function qx(n,e){n.uniform1uiv(this.addr,e)}function Yx(n,e){n.uniform2uiv(this.addr,e)}function Kx(n,e){n.uniform3uiv(this.addr,e)}function Zx(n,e){n.uniform4uiv(this.addr,e)}function $x(n,e,t){let i=this.cache,r=e.length,s=Vo(t,r);Ot(i,s)||(n.uniform1iv(this.addr,s),Ft(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||Rh,s[o])}function Jx(n,e,t){let i=this.cache,r=e.length,s=Vo(t,r);Ot(i,s)||(n.uniform1iv(this.addr,s),Ft(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Lh,s[o])}function jx(n,e,t){let i=this.cache,r=e.length,s=Vo(t,r);Ot(i,s)||(n.uniform1iv(this.addr,s),Ft(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Dh,s[o])}function Qx(n,e,t){let i=this.cache,r=e.length,s=Vo(t,r);Ot(i,s)||(n.uniform1iv(this.addr,s),Ft(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Ih,s[o])}function e_(n){switch(n){case 5126:return Nx;case 35664:return Ox;case 35665:return Fx;case 35666:return kx;case 35674:return zx;case 35675:return Bx;case 35676:return Gx;case 5124:case 35670:return Hx;case 35667:case 35671:return Vx;case 35668:case 35672:return Wx;case 35669:case 35673:return Xx;case 5125:return qx;case 36294:return Yx;case 36295:return Kx;case 36296:return Zx;case 35678:case 36198:case 36298:case 36306:case 35682:return $x;case 35679:case 36299:case 36307:return Jx;case 35680:case 36300:case 36308:case 36293:return jx;case 36289:case 36303:case 36311:case 36292:return Qx}}var vl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Ux(t.type)}},bl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=e_(t.type)}},Ml=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},Qa=/(\w+)(\])?(\[|\.)?/g;function Xu(n,e){n.seq.push(e),n.map[e.id]=e}function t_(n,e,t){let i=n.name,r=i.length;for(Qa.lastIndex=0;;){let s=Qa.exec(i),o=Qa.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Xu(t,c===void 0?new vl(a,n,e):new bl(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new Ml(a),Xu(t,h)),t=h}}}var Pr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);t_(s,o,this)}}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};function qu(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var n_=37297,i_=0;function r_(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}function s_(n){let e=ft.getPrimaries(ft.workingColorSpace),t=ft.getPrimaries(n),i;switch(e===t?i="":e===mo&&t===po?i="LinearDisplayP3ToLinearSRGB":e===po&&t===mo&&(i="LinearSRGBToLinearDisplayP3"),n){case ai:case Ho:return[i,"LinearTransferOETF"];case pt:case tc:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function Yu(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+r_(n.getShaderSource(e),o)}else return r}function o_(n,e){let t=s_(e);return`vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function a_(n,e){let t;switch(e){case Tp:t="Linear";break;case Ap:t="Reinhard";break;case Cp:t="OptimizedCineon";break;case Bo:t="ACESFilmic";break;case Pp:t="AgX";break;case Rp:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function l_(n){return[n.extensionDerivatives||n.envMapCubeUVHeight||n.bumpMap||n.normalMapTangentSpace||n.clearcoatNormalMap||n.flatShading||n.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(n.extensionFragDepth||n.logarithmicDepthBuffer)&&n.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",n.extensionDrawBuffers&&n.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(n.extensionShaderTextureLOD||n.envMap||n.transmission)&&n.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Tr).join(`
`)}function c_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(Tr).join(`
`)}function u_(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function h_(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Tr(n){return n!==""}function Ku(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Zu(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var d_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Sl(n){return n.replace(d_,p_)}var f_=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function p_(n,e){let t=Qe[e];if(t===void 0){let i=f_.get(e);if(i!==void 0)t=Qe[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Sl(t)}var m_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $u(n){return n.replace(m_,g_)}function g_(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Ju(n){let e="precision "+n.precision+` float;
precision `+n.precision+" int;";return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function x_(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===dh?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===$l?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===ni&&(e="SHADOWMAP_TYPE_VSM"),e}function __(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Ir:case Lr:e="ENVMAP_TYPE_CUBE";break;case Go:e="ENVMAP_TYPE_CUBE_UV";break}return e}function y_(n){let e="ENVMAP_MODE_REFLECTION";return n.envMap&&n.envMapMode===Lr&&(e="ENVMAP_MODE_REFRACTION"),e}function v_(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case jl:e="ENVMAP_BLENDING_MULTIPLY";break;case wp:e="ENVMAP_BLENDING_MIX";break;case Ep:e="ENVMAP_BLENDING_ADD";break}return e}function b_(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function M_(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=x_(t),c=__(t),u=y_(t),h=v_(t),d=b_(t),f=t.isWebGL2?"":l_(t),m=c_(t),x=u_(s),p=r.createProgram(),g,y,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Tr).join(`
`),g.length>0&&(g+=`
`),y=[f,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Tr).join(`
`),y.length>0&&(y+=`
`)):(g=[Ju(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Tr).join(`
`),y=[f,Ju(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Un?"#define TONE_MAPPING":"",t.toneMapping!==Un?Qe.tonemapping_pars_fragment:"",t.toneMapping!==Un?a_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,o_("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Tr).join(`
`)),o=Sl(o),o=Ku(o,t),o=Zu(o,t),a=Sl(a),a=Ku(a,t),a=Zu(a,t),o=$u(o),a=$u(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,g=[m,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,y=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===gu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===gu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);let S=_+g+o,E=_+y+a,b=qu(r,r.VERTEX_SHADER,S),T=qu(r,r.FRAGMENT_SHADER,E);r.attachShader(p,b),r.attachShader(p,T),t.index0AttributeName!==void 0?r.bindAttribLocation(p,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(p,0,"position"),r.linkProgram(p);function R(k){if(n.debug.checkShaderErrors){let K=r.getProgramInfoLog(p).trim(),I=r.getShaderInfoLog(b).trim(),z=r.getShaderInfoLog(T).trim(),B=!0,O=!0;if(r.getProgramParameter(p,r.LINK_STATUS)===!1)if(B=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,p,b,T);else{let H=Yu(r,b,"vertex"),j=Yu(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(p,r.VALIDATE_STATUS)+`

Program Info Log: `+K+`
`+H+`
`+j)}else K!==""?console.warn("THREE.WebGLProgram: Program Info Log:",K):(I===""||z==="")&&(O=!1);O&&(k.diagnostics={runnable:B,programLog:K,vertexShader:{log:I,prefix:g},fragmentShader:{log:z,prefix:y}})}r.deleteShader(b),r.deleteShader(T),v=new Pr(r,p),M=h_(r,p)}let v;this.getUniforms=function(){return v===void 0&&R(this),v};let M;this.getAttributes=function(){return M===void 0&&R(this),M};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=r.getProgramParameter(p,n_)),L},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=i_++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=b,this.fragmentShader=T,this}var S_=0,wl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new El(e),t.set(e,i)),i}},El=class{constructor(e){this.id=S_++,this.code=e,this.usedTimes=0}};function w_(n,e,t,i,r,s,o){let a=new Mo,l=new wl,c=[],u=r.isWebGL2,h=r.logarithmicDepthBuffer,d=r.vertexTextures,f=r.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(v){return v===0?"uv":`uv${v}`}function p(v,M,L,k,K){let I=k.fog,z=K.geometry,B=v.isMeshStandardMaterial?k.environment:null,O=(v.isMeshStandardMaterial?t:e).get(v.envMap||B),H=O&&O.mapping===Go?O.image.height:null,j=m[v.type];v.precision!==null&&(f=r.getMaxPrecision(v.precision),f!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",f,"instead."));let $=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Q=$!==void 0?$.length:0,pe=0;z.morphAttributes.position!==void 0&&(pe=1),z.morphAttributes.normal!==void 0&&(pe=2),z.morphAttributes.color!==void 0&&(pe=3);let V,oe,de,ge;if(j){let Lt=zn[j];V=Lt.vertexShader,oe=Lt.fragmentShader}else V=v.vertexShader,oe=v.fragmentShader,l.update(v),de=l.getVertexShaderID(v),ge=l.getFragmentShaderID(v);let Me=n.getRenderTarget(),Oe=K.isInstancedMesh===!0,Xe=K.isBatchedMesh===!0,Pe=!!v.map,Ne=!!v.matcap,D=!!O,fe=!!v.aoMap,W=!!v.lightMap,ne=!!v.bumpMap,ee=!!v.normalMap,Re=!!v.displacementMap,xe=!!v.emissiveMap,A=!!v.metalnessMap,w=!!v.roughnessMap,F=v.anisotropy>0,le=v.clearcoat>0,ue=v.iridescence>0,ce=v.sheen>0,ve=v.transmission>0,be=F&&!!v.anisotropyMap,Te=le&&!!v.clearcoatMap,Le=le&&!!v.clearcoatNormalMap,Ye=le&&!!v.clearcoatRoughnessMap,he=ue&&!!v.iridescenceMap,nt=ue&&!!v.iridescenceThicknessMap,et=ce&&!!v.sheenColorMap,qe=ce&&!!v.sheenRoughnessMap,Fe=!!v.specularMap,Ce=!!v.specularColorMap,$e=!!v.specularIntensityMap,st=ve&&!!v.transmissionMap,vt=ve&&!!v.thicknessMap,Je=!!v.gradientMap,me=!!v.alphaMap,U=v.alphaTest>0,ye=!!v.alphaHash,Se=!!v.extensions,Ve=!!z.attributes.uv1,ke=!!z.attributes.uv2,lt=!!z.attributes.uv3,ct=Un;return v.toneMapped&&(Me===null||Me.isXRRenderTarget===!0)&&(ct=n.toneMapping),{isWebGL2:u,shaderID:j,shaderType:v.type,shaderName:v.name,vertexShader:V,fragmentShader:oe,defines:v.defines,customVertexShaderID:de,customFragmentShaderID:ge,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:f,batching:Xe,instancing:Oe,instancingColor:Oe&&K.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:Me===null?n.outputColorSpace:Me.isXRRenderTarget===!0?Me.texture.colorSpace:ai,map:Pe,matcap:Ne,envMap:D,envMapMode:D&&O.mapping,envMapCubeUVHeight:H,aoMap:fe,lightMap:W,bumpMap:ne,normalMap:ee,displacementMap:d&&Re,emissiveMap:xe,normalMapObjectSpace:ee&&v.normalMapType===Hp,normalMapTangentSpace:ee&&v.normalMapType===ec,metalnessMap:A,roughnessMap:w,anisotropy:F,anisotropyMap:be,clearcoat:le,clearcoatMap:Te,clearcoatNormalMap:Le,clearcoatRoughnessMap:Ye,iridescence:ue,iridescenceMap:he,iridescenceThicknessMap:nt,sheen:ce,sheenColorMap:et,sheenRoughnessMap:qe,specularMap:Fe,specularColorMap:Ce,specularIntensityMap:$e,transmission:ve,transmissionMap:st,thicknessMap:vt,gradientMap:Je,opaque:v.transparent===!1&&v.blending===Cr,alphaMap:me,alphaTest:U,alphaHash:ye,combine:v.combine,mapUv:Pe&&x(v.map.channel),aoMapUv:fe&&x(v.aoMap.channel),lightMapUv:W&&x(v.lightMap.channel),bumpMapUv:ne&&x(v.bumpMap.channel),normalMapUv:ee&&x(v.normalMap.channel),displacementMapUv:Re&&x(v.displacementMap.channel),emissiveMapUv:xe&&x(v.emissiveMap.channel),metalnessMapUv:A&&x(v.metalnessMap.channel),roughnessMapUv:w&&x(v.roughnessMap.channel),anisotropyMapUv:be&&x(v.anisotropyMap.channel),clearcoatMapUv:Te&&x(v.clearcoatMap.channel),clearcoatNormalMapUv:Le&&x(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ye&&x(v.clearcoatRoughnessMap.channel),iridescenceMapUv:he&&x(v.iridescenceMap.channel),iridescenceThicknessMapUv:nt&&x(v.iridescenceThicknessMap.channel),sheenColorMapUv:et&&x(v.sheenColorMap.channel),sheenRoughnessMapUv:qe&&x(v.sheenRoughnessMap.channel),specularMapUv:Fe&&x(v.specularMap.channel),specularColorMapUv:Ce&&x(v.specularColorMap.channel),specularIntensityMapUv:$e&&x(v.specularIntensityMap.channel),transmissionMapUv:st&&x(v.transmissionMap.channel),thicknessMapUv:vt&&x(v.thicknessMap.channel),alphaMapUv:me&&x(v.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(ee||F),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,vertexUv1s:Ve,vertexUv2s:ke,vertexUv3s:lt,pointsUvs:K.isPoints===!0&&!!z.attributes.uv&&(Pe||me),fog:!!I,useFog:v.fog===!0,fogExp2:I&&I.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:K.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:pe,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&L.length>0,shadowMapType:n.shadowMap.type,toneMapping:ct,useLegacyLights:n._useLegacyLights,decodeVideoTexture:Pe&&v.map.isVideoTexture===!0&&ft.getTransfer(v.map.colorSpace)===yt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Bt,flipSided:v.side===Pt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:Se&&v.extensions.derivatives===!0,extensionFragDepth:Se&&v.extensions.fragDepth===!0,extensionDrawBuffers:Se&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:Se&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:Se&&v.extensions.clipCullDistance&&i.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:u||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()}}function g(v){let M=[];if(v.shaderID?M.push(v.shaderID):(M.push(v.customVertexShaderID),M.push(v.customFragmentShaderID)),v.defines!==void 0)for(let L in v.defines)M.push(L),M.push(v.defines[L]);return v.isRawShaderMaterial===!1&&(y(M,v),_(M,v),M.push(n.outputColorSpace)),M.push(v.customProgramCacheKey),M.join()}function y(v,M){v.push(M.precision),v.push(M.outputColorSpace),v.push(M.envMapMode),v.push(M.envMapCubeUVHeight),v.push(M.mapUv),v.push(M.alphaMapUv),v.push(M.lightMapUv),v.push(M.aoMapUv),v.push(M.bumpMapUv),v.push(M.normalMapUv),v.push(M.displacementMapUv),v.push(M.emissiveMapUv),v.push(M.metalnessMapUv),v.push(M.roughnessMapUv),v.push(M.anisotropyMapUv),v.push(M.clearcoatMapUv),v.push(M.clearcoatNormalMapUv),v.push(M.clearcoatRoughnessMapUv),v.push(M.iridescenceMapUv),v.push(M.iridescenceThicknessMapUv),v.push(M.sheenColorMapUv),v.push(M.sheenRoughnessMapUv),v.push(M.specularMapUv),v.push(M.specularColorMapUv),v.push(M.specularIntensityMapUv),v.push(M.transmissionMapUv),v.push(M.thicknessMapUv),v.push(M.combine),v.push(M.fogExp2),v.push(M.sizeAttenuation),v.push(M.morphTargetsCount),v.push(M.morphAttributeCount),v.push(M.numDirLights),v.push(M.numPointLights),v.push(M.numSpotLights),v.push(M.numSpotLightMaps),v.push(M.numHemiLights),v.push(M.numRectAreaLights),v.push(M.numDirLightShadows),v.push(M.numPointLightShadows),v.push(M.numSpotLightShadows),v.push(M.numSpotLightShadowsWithMaps),v.push(M.numLightProbes),v.push(M.shadowMapType),v.push(M.toneMapping),v.push(M.numClippingPlanes),v.push(M.numClipIntersection),v.push(M.depthPacking)}function _(v,M){a.disableAll(),M.isWebGL2&&a.enable(0),M.supportsVertexTextures&&a.enable(1),M.instancing&&a.enable(2),M.instancingColor&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),v.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.skinning&&a.enable(4),M.morphTargets&&a.enable(5),M.morphNormals&&a.enable(6),M.morphColors&&a.enable(7),M.premultipliedAlpha&&a.enable(8),M.shadowMapEnabled&&a.enable(9),M.useLegacyLights&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),v.push(a.mask)}function S(v){let M=m[v.type],L;if(M){let k=zn[M];L=fm.clone(k.uniforms)}else L=v.uniforms;return L}function E(v,M){let L;for(let k=0,K=c.length;k<K;k++){let I=c[k];if(I.cacheKey===M){L=I,++L.usedTimes;break}}return L===void 0&&(L=new M_(n,M,v,s),c.push(L)),L}function b(v){if(--v.usedTimes===0){let M=c.indexOf(v);c[M]=c[c.length-1],c.pop(),v.destroy()}}function T(v){l.remove(v)}function R(){l.dispose()}return{getParameters:p,getProgramCacheKey:g,getUniforms:S,acquireProgram:E,releaseProgram:b,releaseShaderCache:T,programs:c,dispose:R}}function E_(){let n=new WeakMap;function e(s){let o=n.get(s);return o===void 0&&(o={},n.set(s,o)),o}function t(s){n.delete(s)}function i(s,o,a){n.get(s)[o]=a}function r(){n=new WeakMap}return{get:e,remove:t,update:i,dispose:r}}function T_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function ju(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Qu(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(h,d,f,m,x,p){let g=n[e];return g===void 0?(g={id:h.id,object:h,geometry:d,material:f,groupOrder:m,renderOrder:h.renderOrder,z:x,group:p},n[e]=g):(g.id=h.id,g.object=h,g.geometry=d,g.material=f,g.groupOrder=m,g.renderOrder=h.renderOrder,g.z=x,g.group=p),e++,g}function a(h,d,f,m,x,p){let g=o(h,d,f,m,x,p);f.transmission>0?i.push(g):f.transparent===!0?r.push(g):t.push(g)}function l(h,d,f,m,x,p){let g=o(h,d,f,m,x,p);f.transmission>0?i.unshift(g):f.transparent===!0?r.unshift(g):t.unshift(g)}function c(h,d){t.length>1&&t.sort(h||T_),i.length>1&&i.sort(d||ju),r.length>1&&r.sort(d||ju)}function u(){for(let h=e,d=n.length;h<d;h++){let f=n[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function A_(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new Qu,n.set(i,[o])):r>=s.length?(o=new Qu,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function C_(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new We};break;case"SpotLight":t={position:new P,direction:new P,color:new We,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new We,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new We,groundColor:new We};break;case"RectAreaLight":t={color:new We,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function R_(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var P_=0;function I_(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function L_(n,e){let t=new C_,i=R_(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)r.probe.push(new P);let s=new P,o=new xt,a=new xt;function l(u,h){let d=0,f=0,m=0;for(let k=0;k<9;k++)r.probe[k].set(0,0,0);let x=0,p=0,g=0,y=0,_=0,S=0,E=0,b=0,T=0,R=0,v=0;u.sort(I_);let M=h===!0?Math.PI:1;for(let k=0,K=u.length;k<K;k++){let I=u[k],z=I.color,B=I.intensity,O=I.distance,H=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)d+=z.r*B*M,f+=z.g*B*M,m+=z.b*B*M;else if(I.isLightProbe){for(let j=0;j<9;j++)r.probe[j].addScaledVector(I.sh.coefficients[j],B);v++}else if(I.isDirectionalLight){let j=t.get(I);if(j.color.copy(I.color).multiplyScalar(I.intensity*M),I.castShadow){let $=I.shadow,Q=i.get(I);Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,r.directionalShadow[x]=Q,r.directionalShadowMap[x]=H,r.directionalShadowMatrix[x]=I.shadow.matrix,S++}r.directional[x]=j,x++}else if(I.isSpotLight){let j=t.get(I);j.position.setFromMatrixPosition(I.matrixWorld),j.color.copy(z).multiplyScalar(B*M),j.distance=O,j.coneCos=Math.cos(I.angle),j.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),j.decay=I.decay,r.spot[g]=j;let $=I.shadow;if(I.map&&(r.spotLightMap[T]=I.map,T++,$.updateMatrices(I),I.castShadow&&R++),r.spotLightMatrix[g]=$.matrix,I.castShadow){let Q=i.get(I);Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,r.spotShadow[g]=Q,r.spotShadowMap[g]=H,b++}g++}else if(I.isRectAreaLight){let j=t.get(I);j.color.copy(z).multiplyScalar(B),j.halfWidth.set(I.width*.5,0,0),j.halfHeight.set(0,I.height*.5,0),r.rectArea[y]=j,y++}else if(I.isPointLight){let j=t.get(I);if(j.color.copy(I.color).multiplyScalar(I.intensity*M),j.distance=I.distance,j.decay=I.decay,I.castShadow){let $=I.shadow,Q=i.get(I);Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,Q.shadowCameraNear=$.camera.near,Q.shadowCameraFar=$.camera.far,r.pointShadow[p]=Q,r.pointShadowMap[p]=H,r.pointShadowMatrix[p]=I.shadow.matrix,E++}r.point[p]=j,p++}else if(I.isHemisphereLight){let j=t.get(I);j.skyColor.copy(I.color).multiplyScalar(B*M),j.groundColor.copy(I.groundColor).multiplyScalar(B*M),r.hemi[_]=j,_++}}y>0&&(e.isWebGL2?n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=_e.LTC_FLOAT_1,r.rectAreaLTC2=_e.LTC_FLOAT_2):(r.rectAreaLTC1=_e.LTC_HALF_1,r.rectAreaLTC2=_e.LTC_HALF_2):n.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=_e.LTC_FLOAT_1,r.rectAreaLTC2=_e.LTC_FLOAT_2):n.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=_e.LTC_HALF_1,r.rectAreaLTC2=_e.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=d,r.ambient[1]=f,r.ambient[2]=m;let L=r.hash;(L.directionalLength!==x||L.pointLength!==p||L.spotLength!==g||L.rectAreaLength!==y||L.hemiLength!==_||L.numDirectionalShadows!==S||L.numPointShadows!==E||L.numSpotShadows!==b||L.numSpotMaps!==T||L.numLightProbes!==v)&&(r.directional.length=x,r.spot.length=g,r.rectArea.length=y,r.point.length=p,r.hemi.length=_,r.directionalShadow.length=S,r.directionalShadowMap.length=S,r.pointShadow.length=E,r.pointShadowMap.length=E,r.spotShadow.length=b,r.spotShadowMap.length=b,r.directionalShadowMatrix.length=S,r.pointShadowMatrix.length=E,r.spotLightMatrix.length=b+T-R,r.spotLightMap.length=T,r.numSpotLightShadowsWithMaps=R,r.numLightProbes=v,L.directionalLength=x,L.pointLength=p,L.spotLength=g,L.rectAreaLength=y,L.hemiLength=_,L.numDirectionalShadows=S,L.numPointShadows=E,L.numSpotShadows=b,L.numSpotMaps=T,L.numLightProbes=v,r.version=P_++)}function c(u,h){let d=0,f=0,m=0,x=0,p=0,g=h.matrixWorldInverse;for(let y=0,_=u.length;y<_;y++){let S=u[y];if(S.isDirectionalLight){let E=r.directional[d];E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),d++}else if(S.isSpotLight){let E=r.spot[m];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(g),E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(g),m++}else if(S.isRectAreaLight){let E=r.rectArea[x];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(g),a.identity(),o.copy(S.matrixWorld),o.premultiply(g),a.extractRotation(o),E.halfWidth.set(S.width*.5,0,0),E.halfHeight.set(0,S.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(S.isPointLight){let E=r.point[f];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(g),f++}else if(S.isHemisphereLight){let E=r.hemi[p];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(g),p++}}}return{setup:l,setupView:c,state:r}}function eh(n,e){let t=new L_(n,e),i=[],r=[];function s(){i.length=0,r.length=0}function o(h){i.push(h)}function a(h){r.push(h)}function l(h){t.setup(i,h)}function c(h){t.setupView(i,h)}return{init:s,state:{lightsArray:i,shadowsArray:r,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function D_(n,e){let t=new WeakMap;function i(s,o=0){let a=t.get(s),l;return a===void 0?(l=new eh(n,e),t.set(s,[l])):o>=a.length?(l=new eh(n,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:i,dispose:r}}var Tl=class extends li{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Bp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Al=class extends li{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},U_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,N_=`uniform sampler2D shadow_pass;
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
}`;function O_(n,e,t){let i=new ss,r=new re,s=new re,o=new Mt,a=new Tl({depthPacking:Gp}),l=new Al,c={},u=t.maxTextureSize,h={[wi]:Pt,[Pt]:wi,[Bt]:Bt},d=new tn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new re},radius:{value:4}},vertexShader:U_,fragmentShader:N_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new Tt;m.setAttribute("position",new Yt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new se(m,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=dh;let g=this.type;this.render=function(b,T,R){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||b.length===0)return;let v=n.getRenderTarget(),M=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),k=n.state;k.setBlending(bi),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);let K=g!==ni&&this.type===ni,I=g===ni&&this.type!==ni;for(let z=0,B=b.length;z<B;z++){let O=b[z],H=O.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",O,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;r.copy(H.mapSize);let j=H.getFrameExtents();if(r.multiply(j),s.copy(H.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/j.x),r.x=s.x*j.x,H.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/j.y),r.y=s.y*j.y,H.mapSize.y=s.y)),H.map===null||K===!0||I===!0){let Q=this.type!==ni?{minFilter:jt,magFilter:jt}:{};H.map!==null&&H.map.dispose(),H.map=new Qt(r.x,r.y,Q),H.map.texture.name=O.name+".shadowMap",H.camera.updateProjectionMatrix()}n.setRenderTarget(H.map),n.clear();let $=H.getViewportCount();for(let Q=0;Q<$;Q++){let pe=H.getViewport(Q);o.set(s.x*pe.x,s.y*pe.y,s.x*pe.z,s.y*pe.w),k.viewport(o),H.updateMatrices(O,Q),i=H.getFrustum(),S(T,R,H.camera,O,this.type)}H.isPointLightShadow!==!0&&this.type===ni&&y(H,R),H.needsUpdate=!1}g=this.type,p.needsUpdate=!1,n.setRenderTarget(v,M,L)};function y(b,T){let R=e.update(x);d.defines.VSM_SAMPLES!==b.blurSamples&&(d.defines.VSM_SAMPLES=b.blurSamples,f.defines.VSM_SAMPLES=b.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new Qt(r.x,r.y)),d.uniforms.shadow_pass.value=b.map.texture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,n.setRenderTarget(b.mapPass),n.clear(),n.renderBufferDirect(T,null,R,d,x,null),f.uniforms.shadow_pass.value=b.mapPass.texture,f.uniforms.resolution.value=b.mapSize,f.uniforms.radius.value=b.radius,n.setRenderTarget(b.map),n.clear(),n.renderBufferDirect(T,null,R,f,x,null)}function _(b,T,R,v){let M=null,L=R.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(L!==void 0)M=L;else if(M=R.isPointLight===!0?l:a,n.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){let k=M.uuid,K=T.uuid,I=c[k];I===void 0&&(I={},c[k]=I);let z=I[K];z===void 0&&(z=M.clone(),I[K]=z,T.addEventListener("dispose",E)),M=z}if(M.visible=T.visible,M.wireframe=T.wireframe,v===ni?M.side=T.shadowSide!==null?T.shadowSide:T.side:M.side=T.shadowSide!==null?T.shadowSide:h[T.side],M.alphaMap=T.alphaMap,M.alphaTest=T.alphaTest,M.map=T.map,M.clipShadows=T.clipShadows,M.clippingPlanes=T.clippingPlanes,M.clipIntersection=T.clipIntersection,M.displacementMap=T.displacementMap,M.displacementScale=T.displacementScale,M.displacementBias=T.displacementBias,M.wireframeLinewidth=T.wireframeLinewidth,M.linewidth=T.linewidth,R.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let k=n.properties.get(M);k.light=R}return M}function S(b,T,R,v,M){if(b.visible===!1)return;if(b.layers.test(T.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&M===ni)&&(!b.frustumCulled||i.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,b.matrixWorld);let K=e.update(b),I=b.material;if(Array.isArray(I)){let z=K.groups;for(let B=0,O=z.length;B<O;B++){let H=z[B],j=I[H.materialIndex];if(j&&j.visible){let $=_(b,j,v,M);b.onBeforeShadow(n,b,T,R,K,$,H),n.renderBufferDirect(R,null,K,$,b,H),b.onAfterShadow(n,b,T,R,K,$,H)}}}else if(I.visible){let z=_(b,I,v,M);b.onBeforeShadow(n,b,T,R,K,z,null),n.renderBufferDirect(R,null,K,z,b,null),b.onAfterShadow(n,b,T,R,K,z,null)}}let k=b.children;for(let K=0,I=k.length;K<I;K++)S(k[K],T,R,v,M)}function E(b){b.target.removeEventListener("dispose",E);for(let R in c){let v=c[R],M=b.target.uuid;M in v&&(v[M].dispose(),delete v[M])}}}function F_(n,e,t){let i=t.isWebGL2;function r(){let U=!1,ye=new Mt,Se=null,Ve=new Mt(0,0,0,0);return{setMask:function(ke){Se!==ke&&!U&&(n.colorMask(ke,ke,ke,ke),Se=ke)},setLocked:function(ke){U=ke},setClear:function(ke,lt,ct,At,Lt){Lt===!0&&(ke*=At,lt*=At,ct*=At),ye.set(ke,lt,ct,At),Ve.equals(ye)===!1&&(n.clearColor(ke,lt,ct,At),Ve.copy(ye))},reset:function(){U=!1,Se=null,Ve.set(-1,0,0,0)}}}function s(){let U=!1,ye=null,Se=null,Ve=null;return{setTest:function(ke){ke?Xe(n.DEPTH_TEST):Pe(n.DEPTH_TEST)},setMask:function(ke){ye!==ke&&!U&&(n.depthMask(ke),ye=ke)},setFunc:function(ke){if(Se!==ke){switch(ke){case _p:n.depthFunc(n.NEVER);break;case yp:n.depthFunc(n.ALWAYS);break;case vp:n.depthFunc(n.LESS);break;case co:n.depthFunc(n.LEQUAL);break;case bp:n.depthFunc(n.EQUAL);break;case Mp:n.depthFunc(n.GEQUAL);break;case Jl:n.depthFunc(n.GREATER);break;case Sp:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Se=ke}},setLocked:function(ke){U=ke},setClear:function(ke){Ve!==ke&&(n.clearDepth(ke),Ve=ke)},reset:function(){U=!1,ye=null,Se=null,Ve=null}}}function o(){let U=!1,ye=null,Se=null,Ve=null,ke=null,lt=null,ct=null,At=null,Lt=null;return{setTest:function(ht){U||(ht?Xe(n.STENCIL_TEST):Pe(n.STENCIL_TEST))},setMask:function(ht){ye!==ht&&!U&&(n.stencilMask(ht),ye=ht)},setFunc:function(ht,Dt,an){(Se!==ht||Ve!==Dt||ke!==an)&&(n.stencilFunc(ht,Dt,an),Se=ht,Ve=Dt,ke=an)},setOp:function(ht,Dt,an){(lt!==ht||ct!==Dt||At!==an)&&(n.stencilOp(ht,Dt,an),lt=ht,ct=Dt,At=an)},setLocked:function(ht){U=ht},setClear:function(ht){Lt!==ht&&(n.clearStencil(ht),Lt=ht)},reset:function(){U=!1,ye=null,Se=null,Ve=null,ke=null,lt=null,ct=null,At=null,Lt=null}}}let a=new r,l=new s,c=new o,u=new WeakMap,h=new WeakMap,d={},f={},m=new WeakMap,x=[],p=null,g=!1,y=null,_=null,S=null,E=null,b=null,T=null,R=null,v=new We(0,0,0),M=0,L=!1,k=null,K=null,I=null,z=null,B=null,O=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,j=0,$=n.getParameter(n.VERSION);$.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec($)[1]),H=j>=1):$.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),H=j>=2);let Q=null,pe={},V=n.getParameter(n.SCISSOR_BOX),oe=n.getParameter(n.VIEWPORT),de=new Mt().fromArray(V),ge=new Mt().fromArray(oe);function Me(U,ye,Se,Ve){let ke=new Uint8Array(4),lt=n.createTexture();n.bindTexture(U,lt),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let ct=0;ct<Se;ct++)i&&(U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY)?n.texImage3D(ye,0,n.RGBA,1,1,Ve,0,n.RGBA,n.UNSIGNED_BYTE,ke):n.texImage2D(ye+ct,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ke);return lt}let Oe={};Oe[n.TEXTURE_2D]=Me(n.TEXTURE_2D,n.TEXTURE_2D,1),Oe[n.TEXTURE_CUBE_MAP]=Me(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(Oe[n.TEXTURE_2D_ARRAY]=Me(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Oe[n.TEXTURE_3D]=Me(n.TEXTURE_3D,n.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),Xe(n.DEPTH_TEST),l.setFunc(co),xe(!1),A(Nc),Xe(n.CULL_FACE),ee(bi);function Xe(U){d[U]!==!0&&(n.enable(U),d[U]=!0)}function Pe(U){d[U]!==!1&&(n.disable(U),d[U]=!1)}function Ne(U,ye){return f[U]!==ye?(n.bindFramebuffer(U,ye),f[U]=ye,i&&(U===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=ye),U===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=ye)),!0):!1}function D(U,ye){let Se=x,Ve=!1;if(U)if(Se=m.get(ye),Se===void 0&&(Se=[],m.set(ye,Se)),U.isWebGLMultipleRenderTargets){let ke=U.texture;if(Se.length!==ke.length||Se[0]!==n.COLOR_ATTACHMENT0){for(let lt=0,ct=ke.length;lt<ct;lt++)Se[lt]=n.COLOR_ATTACHMENT0+lt;Se.length=ke.length,Ve=!0}}else Se[0]!==n.COLOR_ATTACHMENT0&&(Se[0]=n.COLOR_ATTACHMENT0,Ve=!0);else Se[0]!==n.BACK&&(Se[0]=n.BACK,Ve=!0);Ve&&(t.isWebGL2?n.drawBuffers(Se):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(Se))}function fe(U){return p!==U?(n.useProgram(U),p=U,!0):!1}let W={[Hi]:n.FUNC_ADD,[ip]:n.FUNC_SUBTRACT,[rp]:n.FUNC_REVERSE_SUBTRACT};if(i)W[kc]=n.MIN,W[zc]=n.MAX;else{let U=e.get("EXT_blend_minmax");U!==null&&(W[kc]=U.MIN_EXT,W[zc]=U.MAX_EXT)}let ne={[sp]:n.ZERO,[op]:n.ONE,[ap]:n.SRC_COLOR,[ol]:n.SRC_ALPHA,[fp]:n.SRC_ALPHA_SATURATE,[hp]:n.DST_COLOR,[cp]:n.DST_ALPHA,[lp]:n.ONE_MINUS_SRC_COLOR,[al]:n.ONE_MINUS_SRC_ALPHA,[dp]:n.ONE_MINUS_DST_COLOR,[up]:n.ONE_MINUS_DST_ALPHA,[pp]:n.CONSTANT_COLOR,[mp]:n.ONE_MINUS_CONSTANT_COLOR,[gp]:n.CONSTANT_ALPHA,[xp]:n.ONE_MINUS_CONSTANT_ALPHA};function ee(U,ye,Se,Ve,ke,lt,ct,At,Lt,ht){if(U===bi){g===!0&&(Pe(n.BLEND),g=!1);return}if(g===!1&&(Xe(n.BLEND),g=!0),U!==np){if(U!==y||ht!==L){if((_!==Hi||b!==Hi)&&(n.blendEquation(n.FUNC_ADD),_=Hi,b=Hi),ht)switch(U){case Cr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case dn:n.blendFunc(n.ONE,n.ONE);break;case Oc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Fc:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case Cr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case dn:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Oc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Fc:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}S=null,E=null,T=null,R=null,v.set(0,0,0),M=0,y=U,L=ht}return}ke=ke||ye,lt=lt||Se,ct=ct||Ve,(ye!==_||ke!==b)&&(n.blendEquationSeparate(W[ye],W[ke]),_=ye,b=ke),(Se!==S||Ve!==E||lt!==T||ct!==R)&&(n.blendFuncSeparate(ne[Se],ne[Ve],ne[lt],ne[ct]),S=Se,E=Ve,T=lt,R=ct),(At.equals(v)===!1||Lt!==M)&&(n.blendColor(At.r,At.g,At.b,Lt),v.copy(At),M=Lt),y=U,L=!1}function Re(U,ye){U.side===Bt?Pe(n.CULL_FACE):Xe(n.CULL_FACE);let Se=U.side===Pt;ye&&(Se=!Se),xe(Se),U.blending===Cr&&U.transparent===!1?ee(bi):ee(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),l.setFunc(U.depthFunc),l.setTest(U.depthTest),l.setMask(U.depthWrite),a.setMask(U.colorWrite);let Ve=U.stencilWrite;c.setTest(Ve),Ve&&(c.setMask(U.stencilWriteMask),c.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),c.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),F(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?Xe(n.SAMPLE_ALPHA_TO_COVERAGE):Pe(n.SAMPLE_ALPHA_TO_COVERAGE)}function xe(U){k!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),k=U)}function A(U){U!==ep?(Xe(n.CULL_FACE),U!==K&&(U===Nc?n.cullFace(n.BACK):U===tp?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Pe(n.CULL_FACE),K=U}function w(U){U!==I&&(H&&n.lineWidth(U),I=U)}function F(U,ye,Se){U?(Xe(n.POLYGON_OFFSET_FILL),(z!==ye||B!==Se)&&(n.polygonOffset(ye,Se),z=ye,B=Se)):Pe(n.POLYGON_OFFSET_FILL)}function le(U){U?Xe(n.SCISSOR_TEST):Pe(n.SCISSOR_TEST)}function ue(U){U===void 0&&(U=n.TEXTURE0+O-1),Q!==U&&(n.activeTexture(U),Q=U)}function ce(U,ye,Se){Se===void 0&&(Q===null?Se=n.TEXTURE0+O-1:Se=Q);let Ve=pe[Se];Ve===void 0&&(Ve={type:void 0,texture:void 0},pe[Se]=Ve),(Ve.type!==U||Ve.texture!==ye)&&(Q!==Se&&(n.activeTexture(Se),Q=Se),n.bindTexture(U,ye||Oe[U]),Ve.type=U,Ve.texture=ye)}function ve(){let U=pe[Q];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function be(){try{n.compressedTexImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Te(){try{n.compressedTexImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Le(){try{n.texSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ye(){try{n.texSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function he(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function nt(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function et(){try{n.texStorage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function qe(){try{n.texStorage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Fe(){try{n.texImage2D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ce(){try{n.texImage3D.apply(n,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function $e(U){de.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),de.copy(U))}function st(U){ge.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),ge.copy(U))}function vt(U,ye){let Se=h.get(ye);Se===void 0&&(Se=new WeakMap,h.set(ye,Se));let Ve=Se.get(U);Ve===void 0&&(Ve=n.getUniformBlockIndex(ye,U.name),Se.set(U,Ve))}function Je(U,ye){let Ve=h.get(ye).get(U);u.get(ye)!==Ve&&(n.uniformBlockBinding(ye,Ve,U.__bindingPointIndex),u.set(ye,Ve))}function me(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),i===!0&&(n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null)),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),d={},Q=null,pe={},f={},m=new WeakMap,x=[],p=null,g=!1,y=null,_=null,S=null,E=null,b=null,T=null,R=null,v=new We(0,0,0),M=0,L=!1,k=null,K=null,I=null,z=null,B=null,de.set(0,0,n.canvas.width,n.canvas.height),ge.set(0,0,n.canvas.width,n.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:Xe,disable:Pe,bindFramebuffer:Ne,drawBuffers:D,useProgram:fe,setBlending:ee,setMaterial:Re,setFlipSided:xe,setCullFace:A,setLineWidth:w,setPolygonOffset:F,setScissorTest:le,activeTexture:ue,bindTexture:ce,unbindTexture:ve,compressedTexImage2D:be,compressedTexImage3D:Te,texImage2D:Fe,texImage3D:Ce,updateUBOMapping:vt,uniformBlockBinding:Je,texStorage2D:et,texStorage3D:qe,texSubImage2D:Le,texSubImage3D:Ye,compressedTexSubImage2D:he,compressedTexSubImage3D:nt,scissor:$e,viewport:st,reset:me}}function k_(n,e,t,i,r,s,o){let a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(A,w){return f?new OffscreenCanvas(A,w):xo("canvas")}function x(A,w,F,le){let ue=1;if((A.width>le||A.height>le)&&(ue=le/Math.max(A.width,A.height)),ue<1||w===!0)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap){let ce=w?pl:Math.floor,ve=ce(ue*A.width),be=ce(ue*A.height);h===void 0&&(h=m(ve,be));let Te=F?m(ve,be):h;return Te.width=ve,Te.height=be,Te.getContext("2d").drawImage(A,0,0,ve,be),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+A.width+"x"+A.height+") to ("+ve+"x"+be+")."),Te}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+A.width+"x"+A.height+")."),A;return A}function p(A){return xu(A.width)&&xu(A.height)}function g(A){return a?!1:A.wrapS!==Nt||A.wrapT!==Nt||A.minFilter!==jt&&A.minFilter!==_n}function y(A,w){return A.generateMipmaps&&w&&A.minFilter!==jt&&A.minFilter!==_n}function _(A){n.generateMipmap(A)}function S(A,w,F,le,ue=!1){if(a===!1)return w;if(A!==null){if(n[A]!==void 0)return n[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ce=w;if(w===n.RED&&(F===n.FLOAT&&(ce=n.R32F),F===n.HALF_FLOAT&&(ce=n.R16F),F===n.UNSIGNED_BYTE&&(ce=n.R8)),w===n.RED_INTEGER&&(F===n.UNSIGNED_BYTE&&(ce=n.R8UI),F===n.UNSIGNED_SHORT&&(ce=n.R16UI),F===n.UNSIGNED_INT&&(ce=n.R32UI),F===n.BYTE&&(ce=n.R8I),F===n.SHORT&&(ce=n.R16I),F===n.INT&&(ce=n.R32I)),w===n.RG&&(F===n.FLOAT&&(ce=n.RG32F),F===n.HALF_FLOAT&&(ce=n.RG16F),F===n.UNSIGNED_BYTE&&(ce=n.RG8)),w===n.RGBA){let ve=ue?fo:ft.getTransfer(le);F===n.FLOAT&&(ce=n.RGBA32F),F===n.HALF_FLOAT&&(ce=n.RGBA16F),F===n.UNSIGNED_BYTE&&(ce=ve===yt?n.SRGB8_ALPHA8:n.RGBA8),F===n.UNSIGNED_SHORT_4_4_4_4&&(ce=n.RGBA4),F===n.UNSIGNED_SHORT_5_5_5_1&&(ce=n.RGB5_A1)}return(ce===n.R16F||ce===n.R32F||ce===n.RG16F||ce===n.RG32F||ce===n.RGBA16F||ce===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ce}function E(A,w,F){return y(A,F)===!0||A.isFramebufferTexture&&A.minFilter!==jt&&A.minFilter!==_n?Math.log2(Math.max(w.width,w.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?w.mipmaps.length:1}function b(A){return A===jt||A===Bc||A===Sa?n.NEAREST:n.LINEAR}function T(A){let w=A.target;w.removeEventListener("dispose",T),v(w),w.isVideoTexture&&u.delete(w)}function R(A){let w=A.target;w.removeEventListener("dispose",R),L(w)}function v(A){let w=i.get(A);if(w.__webglInit===void 0)return;let F=A.source,le=d.get(F);if(le){let ue=le[w.__cacheKey];ue.usedTimes--,ue.usedTimes===0&&M(A),Object.keys(le).length===0&&d.delete(F)}i.remove(A)}function M(A){let w=i.get(A);n.deleteTexture(w.__webglTexture);let F=A.source,le=d.get(F);delete le[w.__cacheKey],o.memory.textures--}function L(A){let w=A.texture,F=i.get(A),le=i.get(w);if(le.__webglTexture!==void 0&&(n.deleteTexture(le.__webglTexture),o.memory.textures--),A.depthTexture&&A.depthTexture.dispose(),A.isWebGLCubeRenderTarget)for(let ue=0;ue<6;ue++){if(Array.isArray(F.__webglFramebuffer[ue]))for(let ce=0;ce<F.__webglFramebuffer[ue].length;ce++)n.deleteFramebuffer(F.__webglFramebuffer[ue][ce]);else n.deleteFramebuffer(F.__webglFramebuffer[ue]);F.__webglDepthbuffer&&n.deleteRenderbuffer(F.__webglDepthbuffer[ue])}else{if(Array.isArray(F.__webglFramebuffer))for(let ue=0;ue<F.__webglFramebuffer.length;ue++)n.deleteFramebuffer(F.__webglFramebuffer[ue]);else n.deleteFramebuffer(F.__webglFramebuffer);if(F.__webglDepthbuffer&&n.deleteRenderbuffer(F.__webglDepthbuffer),F.__webglMultisampledFramebuffer&&n.deleteFramebuffer(F.__webglMultisampledFramebuffer),F.__webglColorRenderbuffer)for(let ue=0;ue<F.__webglColorRenderbuffer.length;ue++)F.__webglColorRenderbuffer[ue]&&n.deleteRenderbuffer(F.__webglColorRenderbuffer[ue]);F.__webglDepthRenderbuffer&&n.deleteRenderbuffer(F.__webglDepthRenderbuffer)}if(A.isWebGLMultipleRenderTargets)for(let ue=0,ce=w.length;ue<ce;ue++){let ve=i.get(w[ue]);ve.__webglTexture&&(n.deleteTexture(ve.__webglTexture),o.memory.textures--),i.remove(w[ue])}i.remove(w),i.remove(A)}let k=0;function K(){k=0}function I(){let A=k;return A>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+r.maxTextures),k+=1,A}function z(A){let w=[];return w.push(A.wrapS),w.push(A.wrapT),w.push(A.wrapR||0),w.push(A.magFilter),w.push(A.minFilter),w.push(A.anisotropy),w.push(A.internalFormat),w.push(A.format),w.push(A.type),w.push(A.generateMipmaps),w.push(A.premultiplyAlpha),w.push(A.flipY),w.push(A.unpackAlignment),w.push(A.colorSpace),w.join()}function B(A,w){let F=i.get(A);if(A.isVideoTexture&&Re(A),A.isRenderTargetTexture===!1&&A.version>0&&F.__version!==A.version){let le=A.image;if(le===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(le.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{de(F,A,w);return}}t.bindTexture(n.TEXTURE_2D,F.__webglTexture,n.TEXTURE0+w)}function O(A,w){let F=i.get(A);if(A.version>0&&F.__version!==A.version){de(F,A,w);return}t.bindTexture(n.TEXTURE_2D_ARRAY,F.__webglTexture,n.TEXTURE0+w)}function H(A,w){let F=i.get(A);if(A.version>0&&F.__version!==A.version){de(F,A,w);return}t.bindTexture(n.TEXTURE_3D,F.__webglTexture,n.TEXTURE0+w)}function j(A,w){let F=i.get(A);if(A.version>0&&F.__version!==A.version){ge(F,A,w);return}t.bindTexture(n.TEXTURE_CUBE_MAP,F.__webglTexture,n.TEXTURE0+w)}let $={[Ei]:n.REPEAT,[Nt]:n.CLAMP_TO_EDGE,[ul]:n.MIRRORED_REPEAT},Q={[jt]:n.NEAREST,[Bc]:n.NEAREST_MIPMAP_NEAREST,[Sa]:n.NEAREST_MIPMAP_LINEAR,[_n]:n.LINEAR,[Ip]:n.LINEAR_MIPMAP_NEAREST,[rs]:n.LINEAR_MIPMAP_LINEAR},pe={[Vp]:n.NEVER,[Zp]:n.ALWAYS,[Wp]:n.LESS,[wh]:n.LEQUAL,[Xp]:n.EQUAL,[Kp]:n.GEQUAL,[qp]:n.GREATER,[Yp]:n.NOTEQUAL};function V(A,w,F){if(F?(n.texParameteri(A,n.TEXTURE_WRAP_S,$[w.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,$[w.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,$[w.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,Q[w.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,Q[w.minFilter])):(n.texParameteri(A,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(A,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,n.CLAMP_TO_EDGE),(w.wrapS!==Nt||w.wrapT!==Nt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),n.texParameteri(A,n.TEXTURE_MAG_FILTER,b(w.magFilter)),n.texParameteri(A,n.TEXTURE_MIN_FILTER,b(w.minFilter)),w.minFilter!==jt&&w.minFilter!==_n&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),w.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,pe[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let le=e.get("EXT_texture_filter_anisotropic");if(w.magFilter===jt||w.minFilter!==Sa&&w.minFilter!==rs||w.type===vi&&e.has("OES_texture_float_linear")===!1||a===!1&&w.type===Ki&&e.has("OES_texture_half_float_linear")===!1)return;(w.anisotropy>1||i.get(w).__currentAnisotropy)&&(n.texParameterf(A,le.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy)}}function oe(A,w){let F=!1;A.__webglInit===void 0&&(A.__webglInit=!0,w.addEventListener("dispose",T));let le=w.source,ue=d.get(le);ue===void 0&&(ue={},d.set(le,ue));let ce=z(w);if(ce!==A.__cacheKey){ue[ce]===void 0&&(ue[ce]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,F=!0),ue[ce].usedTimes++;let ve=ue[A.__cacheKey];ve!==void 0&&(ue[A.__cacheKey].usedTimes--,ve.usedTimes===0&&M(w)),A.__cacheKey=ce,A.__webglTexture=ue[ce].texture}return F}function de(A,w,F){let le=n.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(le=n.TEXTURE_2D_ARRAY),w.isData3DTexture&&(le=n.TEXTURE_3D);let ue=oe(A,w),ce=w.source;t.bindTexture(le,A.__webglTexture,n.TEXTURE0+F);let ve=i.get(ce);if(ce.version!==ve.__version||ue===!0){t.activeTexture(n.TEXTURE0+F);let be=ft.getPrimaries(ft.workingColorSpace),Te=w.colorSpace===yn?null:ft.getPrimaries(w.colorSpace),Le=w.colorSpace===yn||be===Te?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le);let Ye=g(w)&&p(w.image)===!1,he=x(w.image,Ye,!1,r.maxTextureSize);he=xe(w,he);let nt=p(he)||a,et=s.convert(w.format,w.colorSpace),qe=s.convert(w.type),Fe=S(w.internalFormat,et,qe,w.colorSpace,w.isVideoTexture);V(le,w,nt);let Ce,$e=w.mipmaps,st=a&&w.isVideoTexture!==!0&&Fe!==vh,vt=ve.__version===void 0||ue===!0,Je=E(w,he,nt);if(w.isDepthTexture)Fe=n.DEPTH_COMPONENT,a?w.type===vi?Fe=n.DEPTH_COMPONENT32F:w.type===yi?Fe=n.DEPTH_COMPONENT24:w.type===Xi?Fe=n.DEPTH24_STENCIL8:Fe=n.DEPTH_COMPONENT16:w.type===vi&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),w.format===qi&&Fe===n.DEPTH_COMPONENT&&w.type!==Ql&&w.type!==yi&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),w.type=yi,qe=s.convert(w.type)),w.format===Dr&&Fe===n.DEPTH_COMPONENT&&(Fe=n.DEPTH_STENCIL,w.type!==Xi&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),w.type=Xi,qe=s.convert(w.type))),vt&&(st?t.texStorage2D(n.TEXTURE_2D,1,Fe,he.width,he.height):t.texImage2D(n.TEXTURE_2D,0,Fe,he.width,he.height,0,et,qe,null));else if(w.isDataTexture)if($e.length>0&&nt){st&&vt&&t.texStorage2D(n.TEXTURE_2D,Je,Fe,$e[0].width,$e[0].height);for(let me=0,U=$e.length;me<U;me++)Ce=$e[me],st?t.texSubImage2D(n.TEXTURE_2D,me,0,0,Ce.width,Ce.height,et,qe,Ce.data):t.texImage2D(n.TEXTURE_2D,me,Fe,Ce.width,Ce.height,0,et,qe,Ce.data);w.generateMipmaps=!1}else st?(vt&&t.texStorage2D(n.TEXTURE_2D,Je,Fe,he.width,he.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,he.width,he.height,et,qe,he.data)):t.texImage2D(n.TEXTURE_2D,0,Fe,he.width,he.height,0,et,qe,he.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){st&&vt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Je,Fe,$e[0].width,$e[0].height,he.depth);for(let me=0,U=$e.length;me<U;me++)Ce=$e[me],w.format!==Dn?et!==null?st?t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,me,0,0,0,Ce.width,Ce.height,he.depth,et,Ce.data,0,0):t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,me,Fe,Ce.width,Ce.height,he.depth,0,Ce.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):st?t.texSubImage3D(n.TEXTURE_2D_ARRAY,me,0,0,0,Ce.width,Ce.height,he.depth,et,qe,Ce.data):t.texImage3D(n.TEXTURE_2D_ARRAY,me,Fe,Ce.width,Ce.height,he.depth,0,et,qe,Ce.data)}else{st&&vt&&t.texStorage2D(n.TEXTURE_2D,Je,Fe,$e[0].width,$e[0].height);for(let me=0,U=$e.length;me<U;me++)Ce=$e[me],w.format!==Dn?et!==null?st?t.compressedTexSubImage2D(n.TEXTURE_2D,me,0,0,Ce.width,Ce.height,et,Ce.data):t.compressedTexImage2D(n.TEXTURE_2D,me,Fe,Ce.width,Ce.height,0,Ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):st?t.texSubImage2D(n.TEXTURE_2D,me,0,0,Ce.width,Ce.height,et,qe,Ce.data):t.texImage2D(n.TEXTURE_2D,me,Fe,Ce.width,Ce.height,0,et,qe,Ce.data)}else if(w.isDataArrayTexture)st?(vt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,Je,Fe,he.width,he.height,he.depth),t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,he.width,he.height,he.depth,et,qe,he.data)):t.texImage3D(n.TEXTURE_2D_ARRAY,0,Fe,he.width,he.height,he.depth,0,et,qe,he.data);else if(w.isData3DTexture)st?(vt&&t.texStorage3D(n.TEXTURE_3D,Je,Fe,he.width,he.height,he.depth),t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,he.width,he.height,he.depth,et,qe,he.data)):t.texImage3D(n.TEXTURE_3D,0,Fe,he.width,he.height,he.depth,0,et,qe,he.data);else if(w.isFramebufferTexture){if(vt)if(st)t.texStorage2D(n.TEXTURE_2D,Je,Fe,he.width,he.height);else{let me=he.width,U=he.height;for(let ye=0;ye<Je;ye++)t.texImage2D(n.TEXTURE_2D,ye,Fe,me,U,0,et,qe,null),me>>=1,U>>=1}}else if($e.length>0&&nt){st&&vt&&t.texStorage2D(n.TEXTURE_2D,Je,Fe,$e[0].width,$e[0].height);for(let me=0,U=$e.length;me<U;me++)Ce=$e[me],st?t.texSubImage2D(n.TEXTURE_2D,me,0,0,et,qe,Ce):t.texImage2D(n.TEXTURE_2D,me,Fe,et,qe,Ce);w.generateMipmaps=!1}else st?(vt&&t.texStorage2D(n.TEXTURE_2D,Je,Fe,he.width,he.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,et,qe,he)):t.texImage2D(n.TEXTURE_2D,0,Fe,et,qe,he);y(w,nt)&&_(le),ve.__version=ce.version,w.onUpdate&&w.onUpdate(w)}A.__version=w.version}function ge(A,w,F){if(w.image.length!==6)return;let le=oe(A,w),ue=w.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+F);let ce=i.get(ue);if(ue.version!==ce.__version||le===!0){t.activeTexture(n.TEXTURE0+F);let ve=ft.getPrimaries(ft.workingColorSpace),be=w.colorSpace===yn?null:ft.getPrimaries(w.colorSpace),Te=w.colorSpace===yn||ve===be?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);let Le=w.isCompressedTexture||w.image[0].isCompressedTexture,Ye=w.image[0]&&w.image[0].isDataTexture,he=[];for(let me=0;me<6;me++)!Le&&!Ye?he[me]=x(w.image[me],!1,!0,r.maxCubemapSize):he[me]=Ye?w.image[me].image:w.image[me],he[me]=xe(w,he[me]);let nt=he[0],et=p(nt)||a,qe=s.convert(w.format,w.colorSpace),Fe=s.convert(w.type),Ce=S(w.internalFormat,qe,Fe,w.colorSpace),$e=a&&w.isVideoTexture!==!0,st=ce.__version===void 0||le===!0,vt=E(w,nt,et);V(n.TEXTURE_CUBE_MAP,w,et);let Je;if(Le){$e&&st&&t.texStorage2D(n.TEXTURE_CUBE_MAP,vt,Ce,nt.width,nt.height);for(let me=0;me<6;me++){Je=he[me].mipmaps;for(let U=0;U<Je.length;U++){let ye=Je[U];w.format!==Dn?qe!==null?$e?t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,U,0,0,ye.width,ye.height,qe,ye.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,U,Ce,ye.width,ye.height,0,ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):$e?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,U,0,0,ye.width,ye.height,qe,Fe,ye.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,U,Ce,ye.width,ye.height,0,qe,Fe,ye.data)}}}else{Je=w.mipmaps,$e&&st&&(Je.length>0&&vt++,t.texStorage2D(n.TEXTURE_CUBE_MAP,vt,Ce,he[0].width,he[0].height));for(let me=0;me<6;me++)if(Ye){$e?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,he[me].width,he[me].height,qe,Fe,he[me].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,Ce,he[me].width,he[me].height,0,qe,Fe,he[me].data);for(let U=0;U<Je.length;U++){let Se=Je[U].image[me].image;$e?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,U+1,0,0,Se.width,Se.height,qe,Fe,Se.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,U+1,Ce,Se.width,Se.height,0,qe,Fe,Se.data)}}else{$e?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,qe,Fe,he[me]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,Ce,qe,Fe,he[me]);for(let U=0;U<Je.length;U++){let ye=Je[U];$e?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,U+1,0,0,qe,Fe,ye.image[me]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+me,U+1,Ce,qe,Fe,ye.image[me])}}}y(w,et)&&_(n.TEXTURE_CUBE_MAP),ce.__version=ue.version,w.onUpdate&&w.onUpdate(w)}A.__version=w.version}function Me(A,w,F,le,ue,ce){let ve=s.convert(F.format,F.colorSpace),be=s.convert(F.type),Te=S(F.internalFormat,ve,be,F.colorSpace);if(!i.get(w).__hasExternalTextures){let Ye=Math.max(1,w.width>>ce),he=Math.max(1,w.height>>ce);ue===n.TEXTURE_3D||ue===n.TEXTURE_2D_ARRAY?t.texImage3D(ue,ce,Te,Ye,he,w.depth,0,ve,be,null):t.texImage2D(ue,ce,Te,Ye,he,0,ve,be,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),ee(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,le,ue,i.get(F).__webglTexture,0,ne(w)):(ue===n.TEXTURE_2D||ue>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&ue<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,le,ue,i.get(F).__webglTexture,ce),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Oe(A,w,F){if(n.bindRenderbuffer(n.RENDERBUFFER,A),w.depthBuffer&&!w.stencilBuffer){let le=a===!0?n.DEPTH_COMPONENT24:n.DEPTH_COMPONENT16;if(F||ee(w)){let ue=w.depthTexture;ue&&ue.isDepthTexture&&(ue.type===vi?le=n.DEPTH_COMPONENT32F:ue.type===yi&&(le=n.DEPTH_COMPONENT24));let ce=ne(w);ee(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ce,le,w.width,w.height):n.renderbufferStorageMultisample(n.RENDERBUFFER,ce,le,w.width,w.height)}else n.renderbufferStorage(n.RENDERBUFFER,le,w.width,w.height);n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,A)}else if(w.depthBuffer&&w.stencilBuffer){let le=ne(w);F&&ee(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,le,n.DEPTH24_STENCIL8,w.width,w.height):ee(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,le,n.DEPTH24_STENCIL8,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.RENDERBUFFER,A)}else{let le=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let ue=0;ue<le.length;ue++){let ce=le[ue],ve=s.convert(ce.format,ce.colorSpace),be=s.convert(ce.type),Te=S(ce.internalFormat,ve,be,ce.colorSpace),Le=ne(w);F&&ee(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Le,Te,w.width,w.height):ee(w)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Le,Te,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,Te,w.width,w.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Xe(A,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),B(w.depthTexture,0);let le=i.get(w.depthTexture).__webglTexture,ue=ne(w);if(w.depthTexture.format===qi)ee(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,le,0,ue):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,le,0);else if(w.depthTexture.format===Dr)ee(w)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,le,0,ue):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,le,0);else throw new Error("Unknown depthTexture format")}function Pe(A){let w=i.get(A),F=A.isWebGLCubeRenderTarget===!0;if(A.depthTexture&&!w.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");Xe(w.__webglFramebuffer,A)}else if(F){w.__webglDepthbuffer=[];for(let le=0;le<6;le++)t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer[le]),w.__webglDepthbuffer[le]=n.createRenderbuffer(),Oe(w.__webglDepthbuffer[le],A,!1)}else t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer=n.createRenderbuffer(),Oe(w.__webglDepthbuffer,A,!1);t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ne(A,w,F){let le=i.get(A);w!==void 0&&Me(le.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),F!==void 0&&Pe(A)}function D(A){let w=A.texture,F=i.get(A),le=i.get(w);A.addEventListener("dispose",R),A.isWebGLMultipleRenderTargets!==!0&&(le.__webglTexture===void 0&&(le.__webglTexture=n.createTexture()),le.__version=w.version,o.memory.textures++);let ue=A.isWebGLCubeRenderTarget===!0,ce=A.isWebGLMultipleRenderTargets===!0,ve=p(A)||a;if(ue){F.__webglFramebuffer=[];for(let be=0;be<6;be++)if(a&&w.mipmaps&&w.mipmaps.length>0){F.__webglFramebuffer[be]=[];for(let Te=0;Te<w.mipmaps.length;Te++)F.__webglFramebuffer[be][Te]=n.createFramebuffer()}else F.__webglFramebuffer[be]=n.createFramebuffer()}else{if(a&&w.mipmaps&&w.mipmaps.length>0){F.__webglFramebuffer=[];for(let be=0;be<w.mipmaps.length;be++)F.__webglFramebuffer[be]=n.createFramebuffer()}else F.__webglFramebuffer=n.createFramebuffer();if(ce)if(r.drawBuffers){let be=A.texture;for(let Te=0,Le=be.length;Te<Le;Te++){let Ye=i.get(be[Te]);Ye.__webglTexture===void 0&&(Ye.__webglTexture=n.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&A.samples>0&&ee(A)===!1){let be=ce?w:[w];F.__webglMultisampledFramebuffer=n.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let Te=0;Te<be.length;Te++){let Le=be[Te];F.__webglColorRenderbuffer[Te]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,F.__webglColorRenderbuffer[Te]);let Ye=s.convert(Le.format,Le.colorSpace),he=s.convert(Le.type),nt=S(Le.internalFormat,Ye,he,Le.colorSpace,A.isXRRenderTarget===!0),et=ne(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,et,nt,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Te,n.RENDERBUFFER,F.__webglColorRenderbuffer[Te])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(F.__webglDepthRenderbuffer=n.createRenderbuffer(),Oe(F.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ue){t.bindTexture(n.TEXTURE_CUBE_MAP,le.__webglTexture),V(n.TEXTURE_CUBE_MAP,w,ve);for(let be=0;be<6;be++)if(a&&w.mipmaps&&w.mipmaps.length>0)for(let Te=0;Te<w.mipmaps.length;Te++)Me(F.__webglFramebuffer[be][Te],A,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+be,Te);else Me(F.__webglFramebuffer[be],A,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+be,0);y(w,ve)&&_(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ce){let be=A.texture;for(let Te=0,Le=be.length;Te<Le;Te++){let Ye=be[Te],he=i.get(Ye);t.bindTexture(n.TEXTURE_2D,he.__webglTexture),V(n.TEXTURE_2D,Ye,ve),Me(F.__webglFramebuffer,A,Ye,n.COLOR_ATTACHMENT0+Te,n.TEXTURE_2D,0),y(Ye,ve)&&_(n.TEXTURE_2D)}t.unbindTexture()}else{let be=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(a?be=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(be,le.__webglTexture),V(be,w,ve),a&&w.mipmaps&&w.mipmaps.length>0)for(let Te=0;Te<w.mipmaps.length;Te++)Me(F.__webglFramebuffer[Te],A,w,n.COLOR_ATTACHMENT0,be,Te);else Me(F.__webglFramebuffer,A,w,n.COLOR_ATTACHMENT0,be,0);y(w,ve)&&_(be),t.unbindTexture()}A.depthBuffer&&Pe(A)}function fe(A){let w=p(A)||a,F=A.isWebGLMultipleRenderTargets===!0?A.texture:[A.texture];for(let le=0,ue=F.length;le<ue;le++){let ce=F[le];if(y(ce,w)){let ve=A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,be=i.get(ce).__webglTexture;t.bindTexture(ve,be),_(ve),t.unbindTexture()}}}function W(A){if(a&&A.samples>0&&ee(A)===!1){let w=A.isWebGLMultipleRenderTargets?A.texture:[A.texture],F=A.width,le=A.height,ue=n.COLOR_BUFFER_BIT,ce=[],ve=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,be=i.get(A),Te=A.isWebGLMultipleRenderTargets===!0;if(Te)for(let Le=0;Le<w.length;Le++)t.bindFramebuffer(n.FRAMEBUFFER,be.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Le,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,be.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Le,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let Le=0;Le<w.length;Le++){ce.push(n.COLOR_ATTACHMENT0+Le),A.depthBuffer&&ce.push(ve);let Ye=be.__ignoreDepthValues!==void 0?be.__ignoreDepthValues:!1;if(Ye===!1&&(A.depthBuffer&&(ue|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&(ue|=n.STENCIL_BUFFER_BIT)),Te&&n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,be.__webglColorRenderbuffer[Le]),Ye===!0&&(n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[ve]),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[ve])),Te){let he=i.get(w[Le]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,he,0)}n.blitFramebuffer(0,0,F,le,0,0,F,le,ue,n.NEAREST),c&&n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ce)}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Te)for(let Le=0;Le<w.length;Le++){t.bindFramebuffer(n.FRAMEBUFFER,be.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Le,n.RENDERBUFFER,be.__webglColorRenderbuffer[Le]);let Ye=i.get(w[Le]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,be.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Le,n.TEXTURE_2D,Ye,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}}function ne(A){return Math.min(r.maxSamples,A.samples)}function ee(A){let w=i.get(A);return a&&A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Re(A){let w=o.render.frame;u.get(A)!==w&&(u.set(A,w),A.update())}function xe(A,w){let F=A.colorSpace,le=A.format,ue=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||A.format===dl||F!==ai&&F!==yn&&(ft.getTransfer(F)===yt?a===!1?e.has("EXT_sRGB")===!0&&le===Dn?(A.format=dl,A.minFilter=_n,A.generateMipmaps=!1):w=_o.sRGBToLinear(w):(le!==Dn||ue!==Mi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),w}this.allocateTextureUnit=I,this.resetTextureUnits=K,this.setTexture2D=B,this.setTexture2DArray=O,this.setTexture3D=H,this.setTextureCube=j,this.rebindTextures=Ne,this.setupRenderTarget=D,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=W,this.setupDepthRenderbuffer=Pe,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=ee}function z_(n,e,t){let i=t.isWebGL2;function r(s,o=yn){let a,l=ft.getTransfer(o);if(s===Mi)return n.UNSIGNED_BYTE;if(s===mh)return n.UNSIGNED_SHORT_4_4_4_4;if(s===gh)return n.UNSIGNED_SHORT_5_5_5_1;if(s===Lp)return n.BYTE;if(s===Dp)return n.SHORT;if(s===Ql)return n.UNSIGNED_SHORT;if(s===ph)return n.INT;if(s===yi)return n.UNSIGNED_INT;if(s===vi)return n.FLOAT;if(s===Ki)return i?n.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===Up)return n.ALPHA;if(s===Dn)return n.RGBA;if(s===Np)return n.LUMINANCE;if(s===Op)return n.LUMINANCE_ALPHA;if(s===qi)return n.DEPTH_COMPONENT;if(s===Dr)return n.DEPTH_STENCIL;if(s===dl)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===Fp)return n.RED;if(s===xh)return n.RED_INTEGER;if(s===kp)return n.RG;if(s===_h)return n.RG_INTEGER;if(s===yh)return n.RGBA_INTEGER;if(s===wa||s===Ea||s===Ta||s===Aa)if(l===yt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===wa)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Ea)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Ta)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Aa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===wa)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Ea)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Ta)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Aa)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===Gc||s===Hc||s===Vc||s===Wc)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===Gc)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Hc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===Vc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Wc)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===vh)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Xc||s===qc)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===Xc)return l===yt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===qc)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Yc||s===Kc||s===Zc||s===$c||s===Jc||s===jc||s===Qc||s===eu||s===tu||s===nu||s===iu||s===ru||s===su||s===ou)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===Yc)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Kc)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Zc)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===$c)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Jc)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===jc)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Qc)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===eu)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===tu)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===nu)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===iu)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===ru)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===su)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===ou)return l===yt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Ca||s===au||s===lu)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===Ca)return l===yt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===au)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===lu)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===zp||s===cu||s===uu||s===hu)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===Ca)return a.COMPRESSED_RED_RGTC1_EXT;if(s===cu)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===uu)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===hu)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Xi?i?n.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):n[s]!==void 0?n[s]:null}return{convert:r}}var Cl=class extends cn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},we=class extends Kt{constructor(){super(),this.isGroup=!0,this.type="Group"}},B_={type:"move"},ts=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new we,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new we,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new we,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let p=t.getJointPose(x,i),g=this._getHandJoint(c,x);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(B_)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new we;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Rl=class extends Ti{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,m=null,x=t.getContextAttributes(),p=null,g=null,y=[],_=[],S=new re,E=null,b=new cn;b.layers.enable(1),b.viewport=new Mt;let T=new cn;T.layers.enable(2),T.viewport=new Mt;let R=[b,T],v=new Cl;v.layers.enable(1),v.layers.enable(2);let M=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(V){let oe=y[V];return oe===void 0&&(oe=new ts,y[V]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(V){let oe=y[V];return oe===void 0&&(oe=new ts,y[V]=oe),oe.getGripSpace()},this.getHand=function(V){let oe=y[V];return oe===void 0&&(oe=new ts,y[V]=oe),oe.getHandSpace()};function k(V){let oe=_.indexOf(V.inputSource);if(oe===-1)return;let de=y[oe];de!==void 0&&(de.update(V.inputSource,V.frame,c||o),de.dispatchEvent({type:V.type,data:V.inputSource}))}function K(){r.removeEventListener("select",k),r.removeEventListener("selectstart",k),r.removeEventListener("selectend",k),r.removeEventListener("squeeze",k),r.removeEventListener("squeezestart",k),r.removeEventListener("squeezeend",k),r.removeEventListener("end",K),r.removeEventListener("inputsourceschange",I);for(let V=0;V<y.length;V++){let oe=_[V];oe!==null&&(_[V]=null,y[V].disconnect(oe))}M=null,L=null,e.setRenderTarget(p),f=null,d=null,h=null,r=null,g=null,pe.stop(),i.isPresenting=!1,e.setPixelRatio(E),e.setSize(S.width,S.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(V){s=V,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(V){a=V,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(V){c=V},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(V){if(r=V,r!==null){if(p=e.getRenderTarget(),r.addEventListener("select",k),r.addEventListener("selectstart",k),r.addEventListener("selectend",k),r.addEventListener("squeeze",k),r.addEventListener("squeezestart",k),r.addEventListener("squeezeend",k),r.addEventListener("end",K),r.addEventListener("inputsourceschange",I),x.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(S),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let oe={antialias:r.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,oe),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),g=new Qt(f.framebufferWidth,f.framebufferHeight,{format:Dn,type:Mi,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let oe=null,de=null,ge=null;x.depth&&(ge=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=x.stencil?Dr:qi,de=x.stencil?Xi:yi);let Me={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:s};h=new XRWebGLBinding(r,t),d=h.createProjectionLayer(Me),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),g=new Qt(d.textureWidth,d.textureHeight,{format:Dn,type:Mi,depthTexture:new Ao(d.textureWidth,d.textureHeight,de,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0});let Oe=e.properties.get(g);Oe.__ignoreDepthValues=d.ignoreDepthValues}g.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),pe.setContext(r),pe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function I(V){for(let oe=0;oe<V.removed.length;oe++){let de=V.removed[oe],ge=_.indexOf(de);ge>=0&&(_[ge]=null,y[ge].disconnect(de))}for(let oe=0;oe<V.added.length;oe++){let de=V.added[oe],ge=_.indexOf(de);if(ge===-1){for(let Oe=0;Oe<y.length;Oe++)if(Oe>=_.length){_.push(de),ge=Oe;break}else if(_[Oe]===null){_[Oe]=de,ge=Oe;break}if(ge===-1)break}let Me=y[ge];Me&&Me.connect(de)}}let z=new P,B=new P;function O(V,oe,de){z.setFromMatrixPosition(oe.matrixWorld),B.setFromMatrixPosition(de.matrixWorld);let ge=z.distanceTo(B),Me=oe.projectionMatrix.elements,Oe=de.projectionMatrix.elements,Xe=Me[14]/(Me[10]-1),Pe=Me[14]/(Me[10]+1),Ne=(Me[9]+1)/Me[5],D=(Me[9]-1)/Me[5],fe=(Me[8]-1)/Me[0],W=(Oe[8]+1)/Oe[0],ne=Xe*fe,ee=Xe*W,Re=ge/(-fe+W),xe=Re*-fe;oe.matrixWorld.decompose(V.position,V.quaternion,V.scale),V.translateX(xe),V.translateZ(Re),V.matrixWorld.compose(V.position,V.quaternion,V.scale),V.matrixWorldInverse.copy(V.matrixWorld).invert();let A=Xe+Re,w=Pe+Re,F=ne-xe,le=ee+(ge-xe),ue=Ne*Pe/w*A,ce=D*Pe/w*A;V.projectionMatrix.makePerspective(F,le,ue,ce,A,w),V.projectionMatrixInverse.copy(V.projectionMatrix).invert()}function H(V,oe){oe===null?V.matrixWorld.copy(V.matrix):V.matrixWorld.multiplyMatrices(oe.matrixWorld,V.matrix),V.matrixWorldInverse.copy(V.matrixWorld).invert()}this.updateCamera=function(V){if(r===null)return;v.near=T.near=b.near=V.near,v.far=T.far=b.far=V.far,(M!==v.near||L!==v.far)&&(r.updateRenderState({depthNear:v.near,depthFar:v.far}),M=v.near,L=v.far);let oe=V.parent,de=v.cameras;H(v,oe);for(let ge=0;ge<de.length;ge++)H(de[ge],oe);de.length===2?O(v,b,T):v.projectionMatrix.copy(b.projectionMatrix),j(V,v,oe)};function j(V,oe,de){de===null?V.matrix.copy(oe.matrixWorld):(V.matrix.copy(de.matrixWorld),V.matrix.invert(),V.matrix.multiply(oe.matrixWorld)),V.matrix.decompose(V.position,V.quaternion,V.scale),V.updateMatrixWorld(!0),V.projectionMatrix.copy(oe.projectionMatrix),V.projectionMatrixInverse.copy(oe.projectionMatrixInverse),V.isPerspectiveCamera&&(V.fov=fl*2*Math.atan(1/V.projectionMatrix.elements[5]),V.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(V){l=V,d!==null&&(d.fixedFoveation=V),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=V)};let $=null;function Q(V,oe){if(u=oe.getViewerPose(c||o),m=oe,u!==null){let de=u.views;f!==null&&(e.setRenderTargetFramebuffer(g,f.framebuffer),e.setRenderTarget(g));let ge=!1;de.length!==v.cameras.length&&(v.cameras.length=0,ge=!0);for(let Me=0;Me<de.length;Me++){let Oe=de[Me],Xe=null;if(f!==null)Xe=f.getViewport(Oe);else{let Ne=h.getViewSubImage(d,Oe);Xe=Ne.viewport,Me===0&&(e.setRenderTargetTextures(g,Ne.colorTexture,d.ignoreDepthValues?void 0:Ne.depthStencilTexture),e.setRenderTarget(g))}let Pe=R[Me];Pe===void 0&&(Pe=new cn,Pe.layers.enable(Me),Pe.viewport=new Mt,R[Me]=Pe),Pe.matrix.fromArray(Oe.transform.matrix),Pe.matrix.decompose(Pe.position,Pe.quaternion,Pe.scale),Pe.projectionMatrix.fromArray(Oe.projectionMatrix),Pe.projectionMatrixInverse.copy(Pe.projectionMatrix).invert(),Pe.viewport.set(Xe.x,Xe.y,Xe.width,Xe.height),Me===0&&(v.matrix.copy(Pe.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),ge===!0&&v.cameras.push(Pe)}}for(let de=0;de<y.length;de++){let ge=_[de],Me=y[de];ge!==null&&Me!==void 0&&Me.update(ge,oe,c||o)}$&&$(V,oe),oe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:oe}),m=null}let pe=new Ch;pe.setAnimationLoop(Q),this.setAnimationLoop=function(V){$=V},this.dispose=function(){}}};function G_(n,e){function t(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function i(p,g){g.color.getRGB(p.fogColor.value,Ah(n)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function r(p,g,y,_,S){g.isMeshBasicMaterial||g.isMeshLambertMaterial?s(p,g):g.isMeshToonMaterial?(s(p,g),h(p,g)):g.isMeshPhongMaterial?(s(p,g),u(p,g)):g.isMeshStandardMaterial?(s(p,g),d(p,g),g.isMeshPhysicalMaterial&&f(p,g,S)):g.isMeshMatcapMaterial?(s(p,g),m(p,g)):g.isMeshDepthMaterial?s(p,g):g.isMeshDistanceMaterial?(s(p,g),x(p,g)):g.isMeshNormalMaterial?s(p,g):g.isLineBasicMaterial?(o(p,g),g.isLineDashedMaterial&&a(p,g)):g.isPointsMaterial?l(p,g,y,_):g.isSpriteMaterial?c(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function s(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,t(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===Pt&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,t(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===Pt&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,t(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,t(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);let y=e.get(g).envMap;if(y&&(p.envMap.value=y,p.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap){p.lightMap.value=g.lightMap;let _=n._useLegacyLights===!0?Math.PI:1;p.lightMapIntensity.value=g.lightMapIntensity*_,t(g.lightMap,p.lightMapTransform)}g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,p.aoMapTransform))}function o(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform))}function a(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,y,_){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*y,p.scale.value=_*.5,g.map&&(p.map.value=g.map,t(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function c(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,t(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,t(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function u(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function h(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function d(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,p.roughnessMapTransform)),e.get(g).envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function f(p,g,y){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Pt&&p.clearcoatNormalScale.value.negate())),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,p.specularIntensityMapTransform))}function m(p,g){g.matcap&&(p.matcap.value=g.matcap)}function x(p,g){let y=e.get(g).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function H_(n,e,t,i){let r={},s={},o=[],a=t.isWebGL2?n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(y,_){let S=_.program;i.uniformBlockBinding(y,S)}function c(y,_){let S=r[y.id];S===void 0&&(m(y),S=u(y),r[y.id]=S,y.addEventListener("dispose",p));let E=_.program;i.updateUBOMapping(y,E);let b=e.render.frame;s[y.id]!==b&&(d(y),s[y.id]=b)}function u(y){let _=h();y.__bindingPointIndex=_;let S=n.createBuffer(),E=y.__size,b=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,E,b),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,_,S),S}function h(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let _=r[y.id],S=y.uniforms,E=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,_);for(let b=0,T=S.length;b<T;b++){let R=Array.isArray(S[b])?S[b]:[S[b]];for(let v=0,M=R.length;v<M;v++){let L=R[v];if(f(L,b,v,E)===!0){let k=L.__offset,K=Array.isArray(L.value)?L.value:[L.value],I=0;for(let z=0;z<K.length;z++){let B=K[z],O=x(B);typeof B=="number"||typeof B=="boolean"?(L.__data[0]=B,n.bufferSubData(n.UNIFORM_BUFFER,k+I,L.__data)):B.isMatrix3?(L.__data[0]=B.elements[0],L.__data[1]=B.elements[1],L.__data[2]=B.elements[2],L.__data[3]=0,L.__data[4]=B.elements[3],L.__data[5]=B.elements[4],L.__data[6]=B.elements[5],L.__data[7]=0,L.__data[8]=B.elements[6],L.__data[9]=B.elements[7],L.__data[10]=B.elements[8],L.__data[11]=0):(B.toArray(L.__data,I),I+=O.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,k,L.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(y,_,S,E){let b=y.value,T=_+"_"+S;if(E[T]===void 0)return typeof b=="number"||typeof b=="boolean"?E[T]=b:E[T]=b.clone(),!0;{let R=E[T];if(typeof b=="number"||typeof b=="boolean"){if(R!==b)return E[T]=b,!0}else if(R.equals(b)===!1)return R.copy(b),!0}return!1}function m(y){let _=y.uniforms,S=0,E=16;for(let T=0,R=_.length;T<R;T++){let v=Array.isArray(_[T])?_[T]:[_[T]];for(let M=0,L=v.length;M<L;M++){let k=v[M],K=Array.isArray(k.value)?k.value:[k.value];for(let I=0,z=K.length;I<z;I++){let B=K[I],O=x(B),H=S%E;H!==0&&E-H<O.boundary&&(S+=E-H),k.__data=new Float32Array(O.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=S,S+=O.storage}}}let b=S%E;return b>0&&(S+=E-b),y.__size=S,y.__cache={},this}function x(y){let _={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(_.boundary=4,_.storage=4):y.isVector2?(_.boundary=8,_.storage=8):y.isVector3||y.isColor?(_.boundary=16,_.storage=12):y.isVector4?(_.boundary=16,_.storage=16):y.isMatrix3?(_.boundary=48,_.storage=48):y.isMatrix4?(_.boundary=64,_.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),_}function p(y){let _=y.target;_.removeEventListener("dispose",p);let S=o.indexOf(_.__bindingPointIndex);o.splice(S,1),n.deleteBuffer(r[_.id]),delete r[_.id],delete s[_.id]}function g(){for(let y in r)n.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:g}}var os=class{constructor(e={}){let{canvas:t=Jp(),context:i=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;i!==null?d=i.getContextAttributes().alpha:d=o;let f=new Uint32Array(4),m=new Int32Array(4),x=null,p=null,g=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=pt,this._useLegacyLights=!1,this.toneMapping=Un,this.toneMappingExposure=1;let _=this,S=!1,E=0,b=0,T=null,R=-1,v=null,M=new Mt,L=new Mt,k=null,K=new We(0),I=0,z=t.width,B=t.height,O=1,H=null,j=null,$=new Mt(0,0,z,B),Q=new Mt(0,0,z,B),pe=!1,V=new ss,oe=!1,de=!1,ge=null,Me=new xt,Oe=new re,Xe=new P,Pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Ne(){return T===null?O:1}let D=i;function fe(C,G){for(let Y=0;Y<C.length;Y++){let Z=C[Y],q=t.getContext(Z,G);if(q!==null)return q}return null}try{let C={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",me,!1),t.addEventListener("webglcontextrestored",U,!1),t.addEventListener("webglcontextcreationerror",ye,!1),D===null){let G=["webgl2","webgl","experimental-webgl"];if(_.isWebGL1Renderer===!0&&G.shift(),D=fe(G,C),D===null)throw fe(G)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&D instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),D.getShaderPrecisionFormat===void 0&&(D.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let W,ne,ee,Re,xe,A,w,F,le,ue,ce,ve,be,Te,Le,Ye,he,nt,et,qe,Fe,Ce,$e,st;function vt(){W=new ax(D),ne=new tx(D,W,e),W.init(ne),Ce=new z_(D,W,ne),ee=new F_(D,W,ne),Re=new ux(D),xe=new E_,A=new k_(D,W,ee,xe,ne,Ce,Re),w=new ix(_),F=new ox(_),le=new _m(D,ne),$e=new Qg(D,W,le,ne),ue=new lx(D,le,Re,$e),ce=new px(D,ue,le,Re),et=new fx(D,ne,A),Ye=new nx(xe),ve=new w_(_,w,F,W,ne,$e,Ye),be=new G_(_,xe),Te=new A_,Le=new D_(W,ne),nt=new jg(_,w,F,ee,ce,d,l),he=new O_(_,ce,ne),st=new H_(D,Re,ne,ee),qe=new ex(D,W,Re,ne),Fe=new cx(D,W,Re,ne),Re.programs=ve.programs,_.capabilities=ne,_.extensions=W,_.properties=xe,_.renderLists=Te,_.shadowMap=he,_.state=ee,_.info=Re}vt();let Je=new Rl(_,D);this.xr=Je,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let C=W.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){let C=W.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return O},this.setPixelRatio=function(C){C!==void 0&&(O=C,this.setSize(z,B,!1))},this.getSize=function(C){return C.set(z,B)},this.setSize=function(C,G,Y=!0){if(Je.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=C,B=G,t.width=Math.floor(C*O),t.height=Math.floor(G*O),Y===!0&&(t.style.width=C+"px",t.style.height=G+"px"),this.setViewport(0,0,C,G)},this.getDrawingBufferSize=function(C){return C.set(z*O,B*O).floor()},this.setDrawingBufferSize=function(C,G,Y){z=C,B=G,O=Y,t.width=Math.floor(C*Y),t.height=Math.floor(G*Y),this.setViewport(0,0,C,G)},this.getCurrentViewport=function(C){return C.copy(M)},this.getViewport=function(C){return C.copy($)},this.setViewport=function(C,G,Y,Z){C.isVector4?$.set(C.x,C.y,C.z,C.w):$.set(C,G,Y,Z),ee.viewport(M.copy($).multiplyScalar(O).floor())},this.getScissor=function(C){return C.copy(Q)},this.setScissor=function(C,G,Y,Z){C.isVector4?Q.set(C.x,C.y,C.z,C.w):Q.set(C,G,Y,Z),ee.scissor(L.copy(Q).multiplyScalar(O).floor())},this.getScissorTest=function(){return pe},this.setScissorTest=function(C){ee.setScissorTest(pe=C)},this.setOpaqueSort=function(C){H=C},this.setTransparentSort=function(C){j=C},this.getClearColor=function(C){return C.copy(nt.getClearColor())},this.setClearColor=function(){nt.setClearColor.apply(nt,arguments)},this.getClearAlpha=function(){return nt.getClearAlpha()},this.setClearAlpha=function(){nt.setClearAlpha.apply(nt,arguments)},this.clear=function(C=!0,G=!0,Y=!0){let Z=0;if(C){let q=!1;if(T!==null){let Ee=T.texture.format;q=Ee===yh||Ee===_h||Ee===xh}if(q){let Ee=T.texture.type,De=Ee===Mi||Ee===yi||Ee===Ql||Ee===Xi||Ee===mh||Ee===gh,ze=nt.getClearColor(),N=nt.getClearAlpha(),X=ze.r,te=ze.g,ae=ze.b;De?(f[0]=X,f[1]=te,f[2]=ae,f[3]=N,D.clearBufferuiv(D.COLOR,0,f)):(m[0]=X,m[1]=te,m[2]=ae,m[3]=N,D.clearBufferiv(D.COLOR,0,m))}else Z|=D.COLOR_BUFFER_BIT}G&&(Z|=D.DEPTH_BUFFER_BIT),Y&&(Z|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(Z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",me,!1),t.removeEventListener("webglcontextrestored",U,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),Te.dispose(),Le.dispose(),xe.dispose(),w.dispose(),F.dispose(),ce.dispose(),$e.dispose(),st.dispose(),ve.dispose(),Je.dispose(),Je.removeEventListener("sessionstart",Lt),Je.removeEventListener("sessionend",ht),ge&&(ge.dispose(),ge=null),Dt.stop()};function me(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function U(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;let C=Re.autoReset,G=he.enabled,Y=he.autoUpdate,Z=he.needsUpdate,q=he.type;vt(),Re.autoReset=C,he.enabled=G,he.autoUpdate=Y,he.needsUpdate=Z,he.type=q}function ye(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function Se(C){let G=C.target;G.removeEventListener("dispose",Se),Ve(G)}function Ve(C){ke(C),xe.remove(C)}function ke(C){let G=xe.get(C).programs;G!==void 0&&(G.forEach(function(Y){ve.releaseProgram(Y)}),C.isShaderMaterial&&ve.releaseShaderCache(C))}this.renderBufferDirect=function(C,G,Y,Z,q,Ee){G===null&&(G=Pe);let De=q.isMesh&&q.matrixWorld.determinant()<0,ze=ba(C,G,Y,Z,q);ee.setMaterial(Z,De);let N=Y.index,X=1;if(Z.wireframe===!0){if(N=ue.getWireframeAttribute(Y),N===void 0)return;X=2}let te=Y.drawRange,ae=Y.attributes.position,Ae=te.start*X,je=(te.start+te.count)*X;Ee!==null&&(Ae=Math.max(Ae,Ee.start*X),je=Math.min(je,(Ee.start+Ee.count)*X)),N!==null?(Ae=Math.max(Ae,0),je=Math.min(je,N.count)):ae!=null&&(Ae=Math.max(Ae,0),je=Math.min(je,ae.count));let Ge=je-Ae;if(Ge<0||Ge===1/0)return;$e.setup(q,Z,ze,Y,N);let rt,He=qe;if(N!==null&&(rt=le.get(N),He=Fe,He.setIndex(rt)),q.isMesh)Z.wireframe===!0?(ee.setLineWidth(Z.wireframeLinewidth*Ne()),He.setMode(D.LINES)):He.setMode(D.TRIANGLES);else if(q.isLine){let Ue=Z.linewidth;Ue===void 0&&(Ue=1),ee.setLineWidth(Ue*Ne()),q.isLineSegments?He.setMode(D.LINES):q.isLineLoop?He.setMode(D.LINE_LOOP):He.setMode(D.LINE_STRIP)}else q.isPoints?He.setMode(D.POINTS):q.isSprite&&He.setMode(D.TRIANGLES);if(q.isBatchedMesh)He.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else if(q.isInstancedMesh)He.renderInstances(Ae,Ge,q.count);else if(Y.isInstancedBufferGeometry){let Ue=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Wt=Math.min(Y.instanceCount,Ue);He.renderInstances(Ae,Ge,Wt)}else He.render(Ae,Ge)};function lt(C,G,Y){C.transparent===!0&&C.side===Bt&&C.forceSinglePass===!1?(C.side=Pt,C.needsUpdate=!0,$n(C,G,Y),C.side=wi,C.needsUpdate=!0,$n(C,G,Y),C.side=Bt):$n(C,G,Y)}this.compile=function(C,G,Y=null){Y===null&&(Y=C),p=Le.get(Y),p.init(),y.push(p),Y.traverseVisible(function(q){q.isLight&&q.layers.test(G.layers)&&(p.pushLight(q),q.castShadow&&p.pushShadow(q))}),C!==Y&&C.traverseVisible(function(q){q.isLight&&q.layers.test(G.layers)&&(p.pushLight(q),q.castShadow&&p.pushShadow(q))}),p.setupLights(_._useLegacyLights);let Z=new Set;return C.traverse(function(q){let Ee=q.material;if(Ee)if(Array.isArray(Ee))for(let De=0;De<Ee.length;De++){let ze=Ee[De];lt(ze,Y,q),Z.add(ze)}else lt(Ee,Y,q),Z.add(Ee)}),y.pop(),p=null,Z},this.compileAsync=function(C,G,Y=null){let Z=this.compile(C,G,Y);return new Promise(q=>{function Ee(){if(Z.forEach(function(De){xe.get(De).currentProgram.isReady()&&Z.delete(De)}),Z.size===0){q(C);return}setTimeout(Ee,10)}W.get("KHR_parallel_shader_compile")!==null?Ee():setTimeout(Ee,10)})};let ct=null;function At(C){ct&&ct(C)}function Lt(){Dt.stop()}function ht(){Dt.start()}let Dt=new Ch;Dt.setAnimationLoop(At),typeof self<"u"&&Dt.setContext(self),this.setAnimationLoop=function(C){ct=C,Je.setAnimationLoop(C),C===null?Dt.stop():Dt.start()},Je.addEventListener("sessionstart",Lt),Je.addEventListener("sessionend",ht),this.render=function(C,G){if(G!==void 0&&G.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),Je.enabled===!0&&Je.isPresenting===!0&&(Je.cameraAutoUpdate===!0&&Je.updateCamera(G),G=Je.getCamera()),C.isScene===!0&&C.onBeforeRender(_,C,G,T),p=Le.get(C,y.length),p.init(),y.push(p),Me.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),V.setFromProjectionMatrix(Me),de=this.localClippingEnabled,oe=Ye.init(this.clippingPlanes,de),x=Te.get(C,g.length),x.init(),g.push(x),an(C,G,0,_.sortObjects),x.finish(),_.sortObjects===!0&&x.sort(H,j),this.info.render.frame++,oe===!0&&Ye.beginShadows();let Y=p.state.shadowsArray;if(he.render(Y,C,G),oe===!0&&Ye.endShadows(),this.info.autoReset===!0&&this.info.reset(),nt.render(x,C),p.setupLights(_._useLegacyLights),G.isArrayCamera){let Z=G.cameras;for(let q=0,Ee=Z.length;q<Ee;q++){let De=Z[q];Kn(x,C,De,De.viewport)}}else Kn(x,C,G);T!==null&&(A.updateMultisampleRenderTarget(T),A.updateRenderTargetMipmap(T)),C.isScene===!0&&C.onAfterRender(_,C,G),$e.resetDefaultState(),R=-1,v=null,y.pop(),y.length>0?p=y[y.length-1]:p=null,g.pop(),g.length>0?x=g[g.length-1]:x=null};function an(C,G,Y,Z){if(C.visible===!1)return;if(C.layers.test(G.layers)){if(C.isGroup)Y=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(G);else if(C.isLight)p.pushLight(C),C.castShadow&&p.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||V.intersectsSprite(C)){Z&&Xe.setFromMatrixPosition(C.matrixWorld).applyMatrix4(Me);let De=ce.update(C),ze=C.material;ze.visible&&x.push(C,De,ze,Y,Xe.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||V.intersectsObject(C))){let De=ce.update(C),ze=C.material;if(Z&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),Xe.copy(C.boundingSphere.center)):(De.boundingSphere===null&&De.computeBoundingSphere(),Xe.copy(De.boundingSphere.center)),Xe.applyMatrix4(C.matrixWorld).applyMatrix4(Me)),Array.isArray(ze)){let N=De.groups;for(let X=0,te=N.length;X<te;X++){let ae=N[X],Ae=ze[ae.materialIndex];Ae&&Ae.visible&&x.push(C,De,Ae,Y,Xe.z,ae)}}else ze.visible&&x.push(C,De,ze,Y,Xe.z,null)}}let Ee=C.children;for(let De=0,ze=Ee.length;De<ze;De++)an(Ee[De],G,Y,Z)}function Kn(C,G,Y,Z){let q=C.opaque,Ee=C.transmissive,De=C.transparent;p.setupLightsView(Y),oe===!0&&Ye.setGlobalState(_.clippingPlanes,Y),Ee.length>0&&va(q,Ee,G,Y),Z&&ee.viewport(M.copy(Z)),q.length>0&&fi(q,G,Y),Ee.length>0&&fi(Ee,G,Y),De.length>0&&fi(De,G,Y),ee.buffers.depth.setTest(!0),ee.buffers.depth.setMask(!0),ee.buffers.color.setMask(!0),ee.setPolygonOffset(!1)}function va(C,G,Y,Z){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;let Ee=ne.isWebGL2;ge===null&&(ge=new Qt(1,1,{generateMipmaps:!0,type:W.has("EXT_color_buffer_half_float")?Ki:Mi,minFilter:rs,samples:Ee?4:0})),_.getDrawingBufferSize(Oe),Ee?ge.setSize(Oe.x,Oe.y):ge.setSize(pl(Oe.x),pl(Oe.y));let De=_.getRenderTarget();_.setRenderTarget(ge),_.getClearColor(K),I=_.getClearAlpha(),I<1&&_.setClearColor(16777215,.5),_.clear();let ze=_.toneMapping;_.toneMapping=Un,fi(C,Y,Z),A.updateMultisampleRenderTarget(ge),A.updateRenderTargetMipmap(ge);let N=!1;for(let X=0,te=G.length;X<te;X++){let ae=G[X],Ae=ae.object,je=ae.geometry,Ge=ae.material,rt=ae.group;if(Ge.side===Bt&&Ae.layers.test(Z.layers)){let He=Ge.side;Ge.side=Pt,Ge.needsUpdate=!0,Zn(Ae,Y,Z,je,Ge,rt),Ge.side=He,Ge.needsUpdate=!0,N=!0}}N===!0&&(A.updateMultisampleRenderTarget(ge),A.updateRenderTargetMipmap(ge)),_.setRenderTarget(De),_.setClearColor(K,I),_.toneMapping=ze}function fi(C,G,Y){let Z=G.isScene===!0?G.overrideMaterial:null;for(let q=0,Ee=C.length;q<Ee;q++){let De=C[q],ze=De.object,N=De.geometry,X=Z===null?De.material:Z,te=De.group;ze.layers.test(Y.layers)&&Zn(ze,G,Y,N,X,te)}}function Zn(C,G,Y,Z,q,Ee){C.onBeforeRender(_,G,Y,Z,q,Ee),C.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),q.onBeforeRender(_,G,Y,Z,C,Ee),q.transparent===!0&&q.side===Bt&&q.forceSinglePass===!1?(q.side=Pt,q.needsUpdate=!0,_.renderBufferDirect(Y,G,Z,q,C,Ee),q.side=wi,q.needsUpdate=!0,_.renderBufferDirect(Y,G,Z,q,C,Ee),q.side=Bt):_.renderBufferDirect(Y,G,Z,q,C,Ee),C.onAfterRender(_,G,Y,Z,q,Ee)}function $n(C,G,Y){G.isScene!==!0&&(G=Pe);let Z=xe.get(C),q=p.state.lights,Ee=p.state.shadowsArray,De=q.state.version,ze=ve.getParameters(C,q.state,Ee,G,Y),N=ve.getProgramCacheKey(ze),X=Z.programs;Z.environment=C.isMeshStandardMaterial?G.environment:null,Z.fog=G.fog,Z.envMap=(C.isMeshStandardMaterial?F:w).get(C.envMap||Z.environment),X===void 0&&(C.addEventListener("dispose",Se),X=new Map,Z.programs=X);let te=X.get(N);if(te!==void 0){if(Z.currentProgram===te&&Z.lightsStateVersion===De)return Is(C,ze),te}else ze.uniforms=ve.getUniforms(C),C.onBuild(Y,ze,_),C.onBeforeCompile(ze,_),te=ve.acquireProgram(ze,N),X.set(N,te),Z.uniforms=ze.uniforms;let ae=Z.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(ae.clippingPlanes=Ye.uniform),Is(C,ze),Z.needsLights=Ma(C),Z.lightsStateVersion=De,Z.needsLights&&(ae.ambientLightColor.value=q.state.ambient,ae.lightProbe.value=q.state.probe,ae.directionalLights.value=q.state.directional,ae.directionalLightShadows.value=q.state.directionalShadow,ae.spotLights.value=q.state.spot,ae.spotLightShadows.value=q.state.spotShadow,ae.rectAreaLights.value=q.state.rectArea,ae.ltc_1.value=q.state.rectAreaLTC1,ae.ltc_2.value=q.state.rectAreaLTC2,ae.pointLights.value=q.state.point,ae.pointLightShadows.value=q.state.pointShadow,ae.hemisphereLights.value=q.state.hemi,ae.directionalShadowMap.value=q.state.directionalShadowMap,ae.directionalShadowMatrix.value=q.state.directionalShadowMatrix,ae.spotShadowMap.value=q.state.spotShadowMap,ae.spotLightMatrix.value=q.state.spotLightMatrix,ae.spotLightMap.value=q.state.spotLightMap,ae.pointShadowMap.value=q.state.pointShadowMap,ae.pointShadowMatrix.value=q.state.pointShadowMatrix),Z.currentProgram=te,Z.uniformsList=null,te}function Ni(C){if(C.uniformsList===null){let G=C.currentProgram.getUniforms();C.uniformsList=Pr.seqWithValue(G.seq,C.uniforms)}return C.uniformsList}function Is(C,G){let Y=xe.get(C);Y.outputColorSpace=G.outputColorSpace,Y.batching=G.batching,Y.instancing=G.instancing,Y.instancingColor=G.instancingColor,Y.skinning=G.skinning,Y.morphTargets=G.morphTargets,Y.morphNormals=G.morphNormals,Y.morphColors=G.morphColors,Y.morphTargetsCount=G.morphTargetsCount,Y.numClippingPlanes=G.numClippingPlanes,Y.numIntersection=G.numClipIntersection,Y.vertexAlphas=G.vertexAlphas,Y.vertexTangents=G.vertexTangents,Y.toneMapping=G.toneMapping}function ba(C,G,Y,Z,q){G.isScene!==!0&&(G=Pe),A.resetTextureUnits();let Ee=G.fog,De=Z.isMeshStandardMaterial?G.environment:null,ze=T===null?_.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:ai,N=(Z.isMeshStandardMaterial?F:w).get(Z.envMap||De),X=Z.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,te=!!Y.attributes.tangent&&(!!Z.normalMap||Z.anisotropy>0),ae=!!Y.morphAttributes.position,Ae=!!Y.morphAttributes.normal,je=!!Y.morphAttributes.color,Ge=Un;Z.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(Ge=_.toneMapping);let rt=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,He=rt!==void 0?rt.length:0,Ue=xe.get(Z),Wt=p.state.lights;if(oe===!0&&(de===!0||C!==v)){let Ct=C===v&&Z.id===R;Ye.setState(Z,C,Ct)}let ot=!1;Z.version===Ue.__version?(Ue.needsLights&&Ue.lightsStateVersion!==Wt.state.version||Ue.outputColorSpace!==ze||q.isBatchedMesh&&Ue.batching===!1||!q.isBatchedMesh&&Ue.batching===!0||q.isInstancedMesh&&Ue.instancing===!1||!q.isInstancedMesh&&Ue.instancing===!0||q.isSkinnedMesh&&Ue.skinning===!1||!q.isSkinnedMesh&&Ue.skinning===!0||q.isInstancedMesh&&Ue.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&Ue.instancingColor===!1&&q.instanceColor!==null||Ue.envMap!==N||Z.fog===!0&&Ue.fog!==Ee||Ue.numClippingPlanes!==void 0&&(Ue.numClippingPlanes!==Ye.numPlanes||Ue.numIntersection!==Ye.numIntersection)||Ue.vertexAlphas!==X||Ue.vertexTangents!==te||Ue.morphTargets!==ae||Ue.morphNormals!==Ae||Ue.morphColors!==je||Ue.toneMapping!==Ge||ne.isWebGL2===!0&&Ue.morphTargetsCount!==He)&&(ot=!0):(ot=!0,Ue.__version=Z.version);let Ut=Ue.currentProgram;ot===!0&&(Ut=$n(Z,G,q));let gn=!1,ln=!1,Et=!1,ut=Ut.getUniforms(),_t=Ue.uniforms;if(ee.useProgram(Ut.program)&&(gn=!0,ln=!0,Et=!0),Z.id!==R&&(R=Z.id,ln=!0),gn||v!==C){ut.setValue(D,"projectionMatrix",C.projectionMatrix),ut.setValue(D,"viewMatrix",C.matrixWorldInverse);let Ct=ut.map.cameraPosition;Ct!==void 0&&Ct.setValue(D,Xe.setFromMatrixPosition(C.matrixWorld)),ne.logarithmicDepthBuffer&&ut.setValue(D,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(Z.isMeshPhongMaterial||Z.isMeshToonMaterial||Z.isMeshLambertMaterial||Z.isMeshBasicMaterial||Z.isMeshStandardMaterial||Z.isShaderMaterial)&&ut.setValue(D,"isOrthographic",C.isOrthographicCamera===!0),v!==C&&(v=C,ln=!0,Et=!0)}if(q.isSkinnedMesh){ut.setOptional(D,q,"bindMatrix"),ut.setOptional(D,q,"bindMatrixInverse");let Ct=q.skeleton;Ct&&(ne.floatVertexTextures?(Ct.boneTexture===null&&Ct.computeBoneTexture(),ut.setValue(D,"boneTexture",Ct.boneTexture,A)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}q.isBatchedMesh&&(ut.setOptional(D,q,"batchingTexture"),ut.setValue(D,"batchingTexture",q._matricesTexture,A));let Rn=Y.morphAttributes;if((Rn.position!==void 0||Rn.normal!==void 0||Rn.color!==void 0&&ne.isWebGL2===!0)&&et.update(q,Y,Ut),(ln||Ue.receiveShadow!==q.receiveShadow)&&(Ue.receiveShadow=q.receiveShadow,ut.setValue(D,"receiveShadow",q.receiveShadow)),Z.isMeshGouraudMaterial&&Z.envMap!==null&&(_t.envMap.value=N,_t.flipEnvMap.value=N.isCubeTexture&&N.isRenderTargetTexture===!1?-1:1),ln&&(ut.setValue(D,"toneMappingExposure",_.toneMappingExposure),Ue.needsLights&&Ls(_t,Et),Ee&&Z.fog===!0&&be.refreshFogUniforms(_t,Ee),be.refreshMaterialUniforms(_t,Z,O,B,ge),Pr.upload(D,Ni(Ue),_t,A)),Z.isShaderMaterial&&Z.uniformsNeedUpdate===!0&&(Pr.upload(D,Ni(Ue),_t,A),Z.uniformsNeedUpdate=!1),Z.isSpriteMaterial&&ut.setValue(D,"center",q.center),ut.setValue(D,"modelViewMatrix",q.modelViewMatrix),ut.setValue(D,"normalMatrix",q.normalMatrix),ut.setValue(D,"modelMatrix",q.matrixWorld),Z.isShaderMaterial||Z.isRawShaderMaterial){let Ct=Z.uniformsGroups;for(let Oi=0,Vr=Ct.length;Oi<Vr;Oi++)if(ne.isWebGL2){let Uc=Ct[Oi];st.update(Uc,Ut),st.bind(Uc,Ut)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Ut}function Ls(C,G){C.ambientLightColor.needsUpdate=G,C.lightProbe.needsUpdate=G,C.directionalLights.needsUpdate=G,C.directionalLightShadows.needsUpdate=G,C.pointLights.needsUpdate=G,C.pointLightShadows.needsUpdate=G,C.spotLights.needsUpdate=G,C.spotLightShadows.needsUpdate=G,C.rectAreaLights.needsUpdate=G,C.hemisphereLights.needsUpdate=G}function Ma(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(C,G,Y){xe.get(C.texture).__webglTexture=G,xe.get(C.depthTexture).__webglTexture=Y;let Z=xe.get(C);Z.__hasExternalTextures=!0,Z.__hasExternalTextures&&(Z.__autoAllocateDepthBuffer=Y===void 0,Z.__autoAllocateDepthBuffer||W.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Z.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(C,G){let Y=xe.get(C);Y.__webglFramebuffer=G,Y.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(C,G=0,Y=0){T=C,E=G,b=Y;let Z=!0,q=null,Ee=!1,De=!1;if(C){let N=xe.get(C);N.__useDefaultFramebuffer!==void 0?(ee.bindFramebuffer(D.FRAMEBUFFER,null),Z=!1):N.__webglFramebuffer===void 0?A.setupRenderTarget(C):N.__hasExternalTextures&&A.rebindTextures(C,xe.get(C.texture).__webglTexture,xe.get(C.depthTexture).__webglTexture);let X=C.texture;(X.isData3DTexture||X.isDataArrayTexture||X.isCompressedArrayTexture)&&(De=!0);let te=xe.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(te[G])?q=te[G][Y]:q=te[G],Ee=!0):ne.isWebGL2&&C.samples>0&&A.useMultisampledRTT(C)===!1?q=xe.get(C).__webglMultisampledFramebuffer:Array.isArray(te)?q=te[Y]:q=te,M.copy(C.viewport),L.copy(C.scissor),k=C.scissorTest}else M.copy($).multiplyScalar(O).floor(),L.copy(Q).multiplyScalar(O).floor(),k=pe;if(ee.bindFramebuffer(D.FRAMEBUFFER,q)&&ne.drawBuffers&&Z&&ee.drawBuffers(C,q),ee.viewport(M),ee.scissor(L),ee.setScissorTest(k),Ee){let N=xe.get(C.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+G,N.__webglTexture,Y)}else if(De){let N=xe.get(C.texture),X=G||0;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,N.__webglTexture,Y||0,X)}R=-1},this.readRenderTargetPixels=function(C,G,Y,Z,q,Ee,De){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ze=xe.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&De!==void 0&&(ze=ze[De]),ze){ee.bindFramebuffer(D.FRAMEBUFFER,ze);try{let N=C.texture,X=N.format,te=N.type;if(X!==Dn&&Ce.convert(X)!==D.getParameter(D.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let ae=te===Ki&&(W.has("EXT_color_buffer_half_float")||ne.isWebGL2&&W.has("EXT_color_buffer_float"));if(te!==Mi&&Ce.convert(te)!==D.getParameter(D.IMPLEMENTATION_COLOR_READ_TYPE)&&!(te===vi&&(ne.isWebGL2||W.has("OES_texture_float")||W.has("WEBGL_color_buffer_float")))&&!ae){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=C.width-Z&&Y>=0&&Y<=C.height-q&&D.readPixels(G,Y,Z,q,Ce.convert(X),Ce.convert(te),Ee)}finally{let N=T!==null?xe.get(T).__webglFramebuffer:null;ee.bindFramebuffer(D.FRAMEBUFFER,N)}}},this.copyFramebufferToTexture=function(C,G,Y=0){let Z=Math.pow(2,-Y),q=Math.floor(G.image.width*Z),Ee=Math.floor(G.image.height*Z);A.setTexture2D(G,0),D.copyTexSubImage2D(D.TEXTURE_2D,Y,0,0,C.x,C.y,q,Ee),ee.unbindTexture()},this.copyTextureToTexture=function(C,G,Y,Z=0){let q=G.image.width,Ee=G.image.height,De=Ce.convert(Y.format),ze=Ce.convert(Y.type);A.setTexture2D(Y,0),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,Y.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Y.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,Y.unpackAlignment),G.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,Z,C.x,C.y,q,Ee,De,ze,G.image.data):G.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,Z,C.x,C.y,G.mipmaps[0].width,G.mipmaps[0].height,De,G.mipmaps[0].data):D.texSubImage2D(D.TEXTURE_2D,Z,C.x,C.y,De,ze,G.image),Z===0&&Y.generateMipmaps&&D.generateMipmap(D.TEXTURE_2D),ee.unbindTexture()},this.copyTextureToTexture3D=function(C,G,Y,Z,q=0){if(_.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let Ee=C.max.x-C.min.x+1,De=C.max.y-C.min.y+1,ze=C.max.z-C.min.z+1,N=Ce.convert(Z.format),X=Ce.convert(Z.type),te;if(Z.isData3DTexture)A.setTexture3D(Z,0),te=D.TEXTURE_3D;else if(Z.isDataArrayTexture||Z.isCompressedArrayTexture)A.setTexture2DArray(Z,0),te=D.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,Z.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Z.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,Z.unpackAlignment);let ae=D.getParameter(D.UNPACK_ROW_LENGTH),Ae=D.getParameter(D.UNPACK_IMAGE_HEIGHT),je=D.getParameter(D.UNPACK_SKIP_PIXELS),Ge=D.getParameter(D.UNPACK_SKIP_ROWS),rt=D.getParameter(D.UNPACK_SKIP_IMAGES),He=Y.isCompressedTexture?Y.mipmaps[q]:Y.image;D.pixelStorei(D.UNPACK_ROW_LENGTH,He.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,He.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,C.min.x),D.pixelStorei(D.UNPACK_SKIP_ROWS,C.min.y),D.pixelStorei(D.UNPACK_SKIP_IMAGES,C.min.z),Y.isDataTexture||Y.isData3DTexture?D.texSubImage3D(te,q,G.x,G.y,G.z,Ee,De,ze,N,X,He.data):Y.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),D.compressedTexSubImage3D(te,q,G.x,G.y,G.z,Ee,De,ze,N,He.data)):D.texSubImage3D(te,q,G.x,G.y,G.z,Ee,De,ze,N,X,He),D.pixelStorei(D.UNPACK_ROW_LENGTH,ae),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Ae),D.pixelStorei(D.UNPACK_SKIP_PIXELS,je),D.pixelStorei(D.UNPACK_SKIP_ROWS,Ge),D.pixelStorei(D.UNPACK_SKIP_IMAGES,rt),q===0&&Z.generateMipmaps&&D.generateMipmap(te),ee.unbindTexture()},this.initTexture=function(C){C.isCubeTexture?A.setTextureCube(C,0):C.isData3DTexture?A.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?A.setTexture2DArray(C,0):A.setTexture2D(C,0),ee.unbindTexture()},this.resetState=function(){E=0,b=0,T=null,ee.reset(),$e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return si}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===tc?"display-p3":"srgb",t.unpackColorSpace=ft.workingColorSpace===Ho?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===pt?Yi:bh}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Yi?pt:ai}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},Pl=class extends os{};Pl.prototype.isWebGL1Renderer=!0;var fn=class extends Kt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}},Co=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=hl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=oi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=oi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},$t=new P,as=class n{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}setX(e,t){return this.normalized&&(t=gt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=gt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=gt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=gt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ri(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ri(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ri(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ri(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=gt(t,this.array),i=gt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=gt(t,this.array),i=gt(i,this.array),r=gt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=gt(t,this.array),i=gt(i,this.array),r=gt(r,this.array),s=gt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Yt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Gn=class extends li{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new We(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},vr,Kr=new P,br=new P,Mr=new P,Sr=new re,Zr=new re,Uh=new xt,to=new P,$r=new P,no=new P,th=new re,el=new re,nh=new re,Hn=class extends Kt{constructor(e=new Gn){if(super(),this.isSprite=!0,this.type="Sprite",vr===void 0){vr=new Tt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Co(t,5);vr.setIndex([0,1,2,0,2,3]),vr.setAttribute("position",new as(i,3,0,!1)),vr.setAttribute("uv",new as(i,2,3,!1))}this.geometry=vr,this.material=e,this.center=new re(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),br.setFromMatrixScale(this.matrixWorld),Uh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Mr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&br.multiplyScalar(-Mr.z);let i=this.material.rotation,r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));let o=this.center;io(to.set(-.5,-.5,0),Mr,o,br,r,s),io($r.set(.5,-.5,0),Mr,o,br,r,s),io(no.set(.5,.5,0),Mr,o,br,r,s),th.set(0,0),el.set(1,0),nh.set(1,1);let a=e.ray.intersectTriangle(to,$r,no,!1,Kr);if(a===null&&(io($r.set(-.5,.5,0),Mr,o,br,r,s),el.set(0,1),a=e.ray.intersectTriangle(to,no,$r,!1,Kr),a===null))return;let l=e.ray.origin.distanceTo(Kr);l<e.near||l>e.far||t.push({distance:l,point:Kr.clone(),uv:Wi.getInterpolation(Kr,to,$r,no,th,el,nh,new re),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function io(n,e,t,i,r,s){Sr.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(Zr.x=s*Sr.x-r*Sr.y,Zr.y=r*Sr.x+s*Sr.y):Zr.copy(Sr),n.copy(e),n.x+=Zr.x,n.y+=Zr.y,n.applyMatrix4(Uh)}var ls=class extends Yt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},wr=new xt,ih=new xt,ro=[],rh=new Nn,V_=new xt,Jr=new se,jr=new Zi,Ro=class extends se{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ls(new Float32Array(i*16),16),this.instanceColor=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,V_)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Nn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,wr),rh.copy(e.boundingBox).applyMatrix4(wr),this.boundingBox.union(rh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Zi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,wr),jr.copy(e.boundingSphere).applyMatrix4(wr),this.boundingSphere.union(jr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let i=this.matrixWorld,r=this.count;if(Jr.geometry=this.geometry,Jr.material=this.material,Jr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),jr.copy(this.boundingSphere),jr.applyMatrix4(i),e.ray.intersectsSphere(jr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,wr),ih.multiplyMatrices(i,wr),Jr.matrixWorld=ih,Jr.raycast(e,ro);for(let o=0,a=ro.length;o<a;o++){let l=ro[o];l.instanceId=s,l.object=this,t.push(l)}ro.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new ls(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var bn=class extends vn{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Mn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let i=this.getLengths(),r=0,s=i.length,o;t?o=t:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);let u=i[r],d=i[r+1]-u,f=(o-u)/d;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new re:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){let i=new P,r=[],s=[],o=[],a=new P,l=new xt;for(let f=0;f<=e;f++){let m=f/e;r[f]=this.getTangentAt(m,new P)}s[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),d=Math.abs(r[0].z);u<=c&&(c=u,i.set(1,0,0)),h<=c&&(c=h,i.set(0,1,0)),d<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(Ht(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,m))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(Ht(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let m=1;m<=e;m++)s[m].applyMatrix4(l.makeRotationAxis(r[m],f*m)),o[m].crossVectors(r[m],s[m])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},cs=class extends Mn{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let i=t||new re,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Il=class extends cs{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function ic(){let n=0,e=0,t=0,i=0;function r(s,o,a,l){n=s,e=a,t=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let d=(o-s)/c-(a-s)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,f*=u,r(o,a,d,f)},calc:function(s){let o=s*s,a=o*s;return n+e*s+t*o+i*a}}}var so=new P,tl=new ic,nl=new ic,il=new ic,us=class extends Mn{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new P){let i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(so.subVectors(r[0],r[1]).add(r[0]),c=so);let h=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(so.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=so),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(h),f),x=Math.pow(h.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(u),f);x<1e-4&&(x=1),m<1e-4&&(m=x),p<1e-4&&(p=x),tl.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,m,x,p),nl.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,m,x,p),il.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,m,x,p)}else this.curveType==="catmullrom"&&(tl.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),nl.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),il.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return i.set(tl.calc(l),nl.calc(l),il.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function sh(n,e,t,i,r){let s=(i-e)*.5,o=(r-t)*.5,a=n*n,l=n*a;return(2*t-2*i+s+o)*l+(-3*t+3*i-2*s-o)*a+s*n+t}function W_(n,e){let t=1-n;return t*t*e}function X_(n,e){return 2*(1-n)*n*e}function q_(n,e){return n*n*e}function ns(n,e,t,i){return W_(n,e)+X_(n,t)+q_(n,i)}function Y_(n,e){let t=1-n;return t*t*t*e}function K_(n,e){let t=1-n;return 3*t*t*n*e}function Z_(n,e){return 3*(1-n)*n*n*e}function $_(n,e){return n*n*n*e}function is(n,e,t,i,r){return Y_(n,e)+K_(n,t)+Z_(n,i)+$_(n,r)}var Po=class extends Mn{constructor(e=new re,t=new re,i=new re,r=new re){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new re){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(is(e,r.x,s.x,o.x,a.x),is(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ll=class extends Mn{constructor(e=new P,t=new P,i=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new P){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(is(e,r.x,s.x,o.x,a.x),is(e,r.y,s.y,o.y,a.y),is(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Io=class extends Mn{constructor(e=new re,t=new re){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new re){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new re){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Dl=class extends Mn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Lo=class extends Mn{constructor(e=new re,t=new re,i=new re){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new re){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(ns(e,r.x,s.x,o.x),ns(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Do=class extends Mn{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(ns(e,r.x,s.x,o.x),ns(e,r.y,s.y,o.y),ns(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Uo=class extends Mn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new re){let i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return i.set(sh(a,l.x,c.x,u.x,h.x),sh(a,l.y,c.y,u.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new re().fromArray(r))}return this}},No=Object.freeze({__proto__:null,ArcCurve:Il,CatmullRomCurve3:us,CubicBezierCurve:Po,CubicBezierCurve3:Ll,EllipseCurve:cs,LineCurve:Io,LineCurve3:Dl,QuadraticBezierCurve:Lo,QuadraticBezierCurve3:Do,SplineCurve:Uo}),Ul=class extends Mn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new No[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new No[r.type]().fromJSON(r))}return this}},Ci=class extends Ul{constructor(e){super(),this.type="Path",this.currentPoint=new re,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new Io(this.currentPoint.clone(),new re(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let s=new Lo(this.currentPoint.clone(),new re(e,t),new re(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){let a=new Po(this.currentPoint.clone(),new re(e,t),new re(i,r),new re(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Uo(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,i,r,s,o,a,l),this}absellipse(e,t,i,r,s,o,a,l){let c=new cs(e,t,i,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Or=class n extends Tt{constructor(e=[new re(0,-.5),new re(.5,0),new re(0,.5)],t=12,i=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:r},t=Math.floor(t),r=Ht(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],u=1/t,h=new P,d=new re,f=new P,m=new P,x=new P,p=0,g=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:p=e[y+1].x-e[y].x,g=e[y+1].y-e[y].y,f.x=g*1,f.y=-p,f.z=g*0,x.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(x.x,x.y,x.z);break;default:p=e[y+1].x-e[y].x,g=e[y+1].y-e[y].y,f.x=g*1,f.y=-p,f.z=g*0,m.copy(f),f.x+=x.x,f.y+=x.y,f.z+=x.z,f.normalize(),l.push(f.x,f.y,f.z),x.copy(m)}for(let y=0;y<=t;y++){let _=i+y*u*r,S=Math.sin(_),E=Math.cos(_);for(let b=0;b<=e.length-1;b++){h.x=e[b].x*S,h.y=e[b].y,h.z=e[b].x*E,o.push(h.x,h.y,h.z),d.x=y/t,d.y=b/(e.length-1),a.push(d.x,d.y);let T=l[3*b+0]*S,R=l[3*b+1],v=l[3*b+0]*E;c.push(T,R,v)}}for(let y=0;y<t;y++)for(let _=0;_<e.length-1;_++){let S=_+y*e.length,E=S,b=S+e.length,T=S+e.length+1,R=S+1;s.push(E,b,R),s.push(T,R,b)}this.setIndex(s),this.setAttribute("position",new Ke(o,3)),this.setAttribute("uv",new Ke(a,2)),this.setAttribute("normal",new Ke(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}};var $i=class n extends Tt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new P,u=new re;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let f=i+h/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new Ke(o,3)),this.setAttribute("normal",new Ke(a,3)),this.setAttribute("uv",new Ke(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Sn=class n extends Tt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],d=[],f=[],m=0,x=[],p=i/2,g=0;y(),o===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(u),this.setAttribute("position",new Ke(h,3)),this.setAttribute("normal",new Ke(d,3)),this.setAttribute("uv",new Ke(f,2));function y(){let S=new P,E=new P,b=0,T=(t-e)/i;for(let R=0;R<=s;R++){let v=[],M=R/s,L=M*(t-e)+e;for(let k=0;k<=r;k++){let K=k/r,I=K*l+a,z=Math.sin(I),B=Math.cos(I);E.x=L*z,E.y=-M*i+p,E.z=L*B,h.push(E.x,E.y,E.z),S.set(z,T,B).normalize(),d.push(S.x,S.y,S.z),f.push(K,1-M),v.push(m++)}x.push(v)}for(let R=0;R<r;R++)for(let v=0;v<s;v++){let M=x[v][R],L=x[v+1][R],k=x[v+1][R+1],K=x[v][R+1];u.push(M,L,K),u.push(L,k,K),b+=6}c.addGroup(g,b,0),g+=b}function _(S){let E=m,b=new re,T=new P,R=0,v=S===!0?e:t,M=S===!0?1:-1;for(let k=1;k<=r;k++)h.push(0,p*M,0),d.push(0,M,0),f.push(.5,.5),m++;let L=m;for(let k=0;k<=r;k++){let I=k/r*l+a,z=Math.cos(I),B=Math.sin(I);T.x=v*B,T.y=p*M,T.z=v*z,h.push(T.x,T.y,T.z),d.push(0,M,0),b.x=z*.5+.5,b.y=B*.5*M+.5,f.push(b.x,b.y),m++}for(let k=0;k<r;k++){let K=E+k,I=L+k;S===!0?u.push(I,I+1,K):u.push(I+1,I,K),R+=3}c.addGroup(g,R,S===!0?1:2),g+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Zt=class n extends Sn{constructor(e=1,t=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Nl=class n extends Tt{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};let s=[],o=[];a(r),c(i),u(),this.setAttribute("position",new Ke(s,3)),this.setAttribute("normal",new Ke(s.slice(),3)),this.setAttribute("uv",new Ke(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let _=new P,S=new P,E=new P;for(let b=0;b<t.length;b+=3)f(t[b+0],_),f(t[b+1],S),f(t[b+2],E),l(_,S,E,y)}function l(y,_,S,E){let b=E+1,T=[];for(let R=0;R<=b;R++){T[R]=[];let v=y.clone().lerp(S,R/b),M=_.clone().lerp(S,R/b),L=b-R;for(let k=0;k<=L;k++)k===0&&R===b?T[R][k]=v:T[R][k]=v.clone().lerp(M,k/L)}for(let R=0;R<b;R++)for(let v=0;v<2*(b-R)-1;v++){let M=Math.floor(v/2);v%2===0?(d(T[R][M+1]),d(T[R+1][M]),d(T[R][M])):(d(T[R][M+1]),d(T[R+1][M+1]),d(T[R+1][M]))}}function c(y){let _=new P;for(let S=0;S<s.length;S+=3)_.x=s[S+0],_.y=s[S+1],_.z=s[S+2],_.normalize().multiplyScalar(y),s[S+0]=_.x,s[S+1]=_.y,s[S+2]=_.z}function u(){let y=new P;for(let _=0;_<s.length;_+=3){y.x=s[_+0],y.y=s[_+1],y.z=s[_+2];let S=p(y)/2/Math.PI+.5,E=g(y)/Math.PI+.5;o.push(S,1-E)}m(),h()}function h(){for(let y=0;y<o.length;y+=6){let _=o[y+0],S=o[y+2],E=o[y+4],b=Math.max(_,S,E),T=Math.min(_,S,E);b>.9&&T<.1&&(_<.2&&(o[y+0]+=1),S<.2&&(o[y+2]+=1),E<.2&&(o[y+4]+=1))}}function d(y){s.push(y.x,y.y,y.z)}function f(y,_){let S=y*3;_.x=e[S+0],_.y=e[S+1],_.z=e[S+2]}function m(){let y=new P,_=new P,S=new P,E=new P,b=new re,T=new re,R=new re;for(let v=0,M=0;v<s.length;v+=9,M+=6){y.set(s[v+0],s[v+1],s[v+2]),_.set(s[v+3],s[v+4],s[v+5]),S.set(s[v+6],s[v+7],s[v+8]),b.set(o[M+0],o[M+1]),T.set(o[M+2],o[M+3]),R.set(o[M+4],o[M+5]),E.copy(y).add(_).add(S).divideScalar(3);let L=p(E);x(b,M+0,y,L),x(T,M+2,_,L),x(R,M+4,S,L)}}function x(y,_,S,E){E<0&&y.x===1&&(o[_]=y.x-1),S.x===0&&S.z===0&&(o[_]=E/2/Math.PI+.5)}function p(y){return Math.atan2(y.z,-y.x)}function g(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}};var Vt=class extends Ci{constructor(e){super(e),this.uuid=oi(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new Ci().fromJSON(r))}return this}},J_={triangulate:function(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,s=Nh(n,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,u,h,d,f;if(i&&(s=ny(n,e,s,t)),n.length>80*t){a=c=n[0],l=u=n[1];for(let m=t;m<r;m+=t)h=n[m],d=n[m+1],h<a&&(a=h),d<l&&(l=d),h>c&&(c=h),d>u&&(u=d);f=Math.max(c-a,u-l),f=f!==0?32767/f:0}return hs(s,o,t,a,l,f,0),o}};function Nh(n,e,t,i,r){let s,o;if(r===fy(n,e,t,i)>0)for(s=e;s<t;s+=i)o=oh(s,n[s],n[s+1],o);else for(s=t-i;s>=e;s-=i)o=oh(s,n[s],n[s+1],o);return o&&Wo(o,o.next)&&(fs(o),o=o.next),o}function Ji(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Wo(t,t.next)||wt(t.prev,t,t.next)===0)){if(fs(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function hs(n,e,t,i,r,s,o){if(!n)return;!o&&s&&ay(n,i,r,s);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,s?Q_(n,i,r,s):j_(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),fs(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=ey(Ji(n),e,t),hs(n,e,t,i,r,s,2)):o===2&&ty(n,e,t,i,r,s):hs(Ji(n),e,t,i,r,s,1);break}}}function j_(n){let e=n.prev,t=n,i=n.next;if(wt(e,t,i)>=0)return!1;let r=e.x,s=t.x,o=i.x,a=e.y,l=t.y,c=i.y,u=r<s?r<o?r:o:s<o?s:o,h=a<l?a<c?a:c:l<c?l:c,d=r>s?r>o?r:o:s>o?s:o,f=a>l?a>c?a:c:l>c?l:c,m=i.next;for(;m!==e;){if(m.x>=u&&m.x<=d&&m.y>=h&&m.y<=f&&Ar(r,a,s,l,o,c,m.x,m.y)&&wt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function Q_(n,e,t,i){let r=n.prev,s=n,o=n.next;if(wt(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,d=o.y,f=a<l?a<c?a:c:l<c?l:c,m=u<h?u<d?u:d:h<d?h:d,x=a>l?a>c?a:c:l>c?l:c,p=u>h?u>d?u:d:h>d?h:d,g=Ol(f,m,e,t,i),y=Ol(x,p,e,t,i),_=n.prevZ,S=n.nextZ;for(;_&&_.z>=g&&S&&S.z<=y;){if(_.x>=f&&_.x<=x&&_.y>=m&&_.y<=p&&_!==r&&_!==o&&Ar(a,u,l,h,c,d,_.x,_.y)&&wt(_.prev,_,_.next)>=0||(_=_.prevZ,S.x>=f&&S.x<=x&&S.y>=m&&S.y<=p&&S!==r&&S!==o&&Ar(a,u,l,h,c,d,S.x,S.y)&&wt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;_&&_.z>=g;){if(_.x>=f&&_.x<=x&&_.y>=m&&_.y<=p&&_!==r&&_!==o&&Ar(a,u,l,h,c,d,_.x,_.y)&&wt(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;S&&S.z<=y;){if(S.x>=f&&S.x<=x&&S.y>=m&&S.y<=p&&S!==r&&S!==o&&Ar(a,u,l,h,c,d,S.x,S.y)&&wt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function ey(n,e,t){let i=n;do{let r=i.prev,s=i.next.next;!Wo(r,s)&&Oh(r,i,i.next,s)&&ds(r,s)&&ds(s,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(s.i/t|0),fs(i),fs(i.next),i=n=s),i=i.next}while(i!==n);return Ji(i)}function ty(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&uy(o,a)){let l=Fh(o,a);o=Ji(o,o.next),l=Ji(l,l.next),hs(o,e,t,i,r,s,0),hs(l,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function ny(n,e,t,i){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:n.length,c=Nh(n,a,l,i,!1),c===c.next&&(c.steiner=!0),r.push(cy(c));for(r.sort(iy),s=0;s<r.length;s++)t=ry(r[s],t);return t}function iy(n,e){return n.x-e.x}function ry(n,e){let t=sy(n,e);if(!t)return e;let i=Fh(t,n);return Ji(i,i.next),Ji(t,t.next)}function sy(n,e){let t=e,i=-1/0,r,s=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let d=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=s&&d>i&&(i=d,r=t.x<t.next.x?t:t.next,d===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,u=1/0,h;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&Ar(o<c?s:i,o,l,c,o<c?i:s,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(s-t.x),ds(t,n)&&(h<u||h===u&&(t.x>r.x||t.x===r.x&&oy(r,t)))&&(r=t,u=h)),t=t.next;while(t!==a);return r}function oy(n,e){return wt(n.prev,n,e.prev)<0&&wt(e.next,n,n.next)<0}function ay(n,e,t,i){let r=n;do r.z===0&&(r.z=Ol(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,ly(r)}function ly(n){let e,t,i,r,s,o,a,l,c=1;do{for(t=n,n=null,s=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;t=i}s.nextZ=null,c*=2}while(o>1);return n}function Ol(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function cy(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function Ar(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function uy(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!hy(n,e)&&(ds(n,e)&&ds(e,n)&&dy(n,e)&&(wt(n.prev,n,e.prev)||wt(n,e.prev,e))||Wo(n,e)&&wt(n.prev,n,n.next)>0&&wt(e.prev,e,e.next)>0)}function wt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Wo(n,e){return n.x===e.x&&n.y===e.y}function Oh(n,e,t,i){let r=ao(wt(n,e,t)),s=ao(wt(n,e,i)),o=ao(wt(t,i,n)),a=ao(wt(t,i,e));return!!(r!==s&&o!==a||r===0&&oo(n,t,e)||s===0&&oo(n,i,e)||o===0&&oo(t,n,i)||a===0&&oo(t,e,i))}function oo(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function ao(n){return n>0?1:n<0?-1:0}function hy(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Oh(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function ds(n,e){return wt(n.prev,n,n.next)<0?wt(n,e,n.next)>=0&&wt(n,n.prev,e)>=0:wt(n,e,n.prev)<0||wt(n,n.next,e)<0}function dy(n,e){let t=n,i=!1,r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Fh(n,e){let t=new Fl(n.i,n.x,n.y),i=new Fl(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function oh(n,e,t,i){let r=new Fl(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function fs(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Fl(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function fy(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}var Si=class n{static area(e){let t=e.length,i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],s=[];ah(e),lh(i,e);let o=e.length;t.forEach(ah);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,lh(i,t[l]);let a=J_.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function ah(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function lh(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var ji=class n extends Tt{constructor(e=new Vt([new re(.5,.5),new re(-.5,.5),new re(-.5,-.5),new re(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new Ke(r,3)),this.setAttribute("uv",new Ke(s,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:f-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,p=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:py,_,S=!1,E,b,T,R;g&&(_=g.getSpacedPoints(u),S=!0,d=!1,E=g.computeFrenetFrames(u,!1),b=new P,T=new P,R=new P),d||(p=0,f=0,m=0,x=0);let v=a.extractPoints(c),M=v.shape,L=v.holes;if(!Si.isClockWise(M)){M=M.reverse();for(let D=0,fe=L.length;D<fe;D++){let W=L[D];Si.isClockWise(W)&&(L[D]=W.reverse())}}let K=Si.triangulateShape(M,L),I=M;for(let D=0,fe=L.length;D<fe;D++){let W=L[D];M=M.concat(W)}function z(D,fe,W){return fe||console.error("THREE.ExtrudeGeometry: vec does not exist"),D.clone().addScaledVector(fe,W)}let B=M.length,O=K.length;function H(D,fe,W){let ne,ee,Re,xe=D.x-fe.x,A=D.y-fe.y,w=W.x-D.x,F=W.y-D.y,le=xe*xe+A*A,ue=xe*F-A*w;if(Math.abs(ue)>Number.EPSILON){let ce=Math.sqrt(le),ve=Math.sqrt(w*w+F*F),be=fe.x-A/ce,Te=fe.y+xe/ce,Le=W.x-F/ve,Ye=W.y+w/ve,he=((Le-be)*F-(Ye-Te)*w)/(xe*F-A*w);ne=be+xe*he-D.x,ee=Te+A*he-D.y;let nt=ne*ne+ee*ee;if(nt<=2)return new re(ne,ee);Re=Math.sqrt(nt/2)}else{let ce=!1;xe>Number.EPSILON?w>Number.EPSILON&&(ce=!0):xe<-Number.EPSILON?w<-Number.EPSILON&&(ce=!0):Math.sign(A)===Math.sign(F)&&(ce=!0),ce?(ne=-A,ee=xe,Re=Math.sqrt(le)):(ne=xe,ee=A,Re=Math.sqrt(le/2))}return new re(ne/Re,ee/Re)}let j=[];for(let D=0,fe=I.length,W=fe-1,ne=D+1;D<fe;D++,W++,ne++)W===fe&&(W=0),ne===fe&&(ne=0),j[D]=H(I[D],I[W],I[ne]);let $=[],Q,pe=j.concat();for(let D=0,fe=L.length;D<fe;D++){let W=L[D];Q=[];for(let ne=0,ee=W.length,Re=ee-1,xe=ne+1;ne<ee;ne++,Re++,xe++)Re===ee&&(Re=0),xe===ee&&(xe=0),Q[ne]=H(W[ne],W[Re],W[xe]);$.push(Q),pe=pe.concat(Q)}for(let D=0;D<p;D++){let fe=D/p,W=f*Math.cos(fe*Math.PI/2),ne=m*Math.sin(fe*Math.PI/2)+x;for(let ee=0,Re=I.length;ee<Re;ee++){let xe=z(I[ee],j[ee],ne);Me(xe.x,xe.y,-W)}for(let ee=0,Re=L.length;ee<Re;ee++){let xe=L[ee];Q=$[ee];for(let A=0,w=xe.length;A<w;A++){let F=z(xe[A],Q[A],ne);Me(F.x,F.y,-W)}}}let V=m+x;for(let D=0;D<B;D++){let fe=d?z(M[D],pe[D],V):M[D];S?(T.copy(E.normals[0]).multiplyScalar(fe.x),b.copy(E.binormals[0]).multiplyScalar(fe.y),R.copy(_[0]).add(T).add(b),Me(R.x,R.y,R.z)):Me(fe.x,fe.y,0)}for(let D=1;D<=u;D++)for(let fe=0;fe<B;fe++){let W=d?z(M[fe],pe[fe],V):M[fe];S?(T.copy(E.normals[D]).multiplyScalar(W.x),b.copy(E.binormals[D]).multiplyScalar(W.y),R.copy(_[D]).add(T).add(b),Me(R.x,R.y,R.z)):Me(W.x,W.y,h/u*D)}for(let D=p-1;D>=0;D--){let fe=D/p,W=f*Math.cos(fe*Math.PI/2),ne=m*Math.sin(fe*Math.PI/2)+x;for(let ee=0,Re=I.length;ee<Re;ee++){let xe=z(I[ee],j[ee],ne);Me(xe.x,xe.y,h+W)}for(let ee=0,Re=L.length;ee<Re;ee++){let xe=L[ee];Q=$[ee];for(let A=0,w=xe.length;A<w;A++){let F=z(xe[A],Q[A],ne);S?Me(F.x,F.y+_[u-1].y,_[u-1].x+W):Me(F.x,F.y,h+W)}}}oe(),de();function oe(){let D=r.length/3;if(d){let fe=0,W=B*fe;for(let ne=0;ne<O;ne++){let ee=K[ne];Oe(ee[2]+W,ee[1]+W,ee[0]+W)}fe=u+p*2,W=B*fe;for(let ne=0;ne<O;ne++){let ee=K[ne];Oe(ee[0]+W,ee[1]+W,ee[2]+W)}}else{for(let fe=0;fe<O;fe++){let W=K[fe];Oe(W[2],W[1],W[0])}for(let fe=0;fe<O;fe++){let W=K[fe];Oe(W[0]+B*u,W[1]+B*u,W[2]+B*u)}}i.addGroup(D,r.length/3-D,0)}function de(){let D=r.length/3,fe=0;ge(I,fe),fe+=I.length;for(let W=0,ne=L.length;W<ne;W++){let ee=L[W];ge(ee,fe),fe+=ee.length}i.addGroup(D,r.length/3-D,1)}function ge(D,fe){let W=D.length;for(;--W>=0;){let ne=W,ee=W-1;ee<0&&(ee=D.length-1);for(let Re=0,xe=u+p*2;Re<xe;Re++){let A=B*Re,w=B*(Re+1),F=fe+ne+A,le=fe+ee+A,ue=fe+ee+w,ce=fe+ne+w;Xe(F,le,ue,ce)}}}function Me(D,fe,W){l.push(D),l.push(fe),l.push(W)}function Oe(D,fe,W){Pe(D),Pe(fe),Pe(W);let ne=r.length/3,ee=y.generateTopUV(i,r,ne-3,ne-2,ne-1);Ne(ee[0]),Ne(ee[1]),Ne(ee[2])}function Xe(D,fe,W,ne){Pe(D),Pe(fe),Pe(ne),Pe(fe),Pe(W),Pe(ne);let ee=r.length/3,Re=y.generateSideWallUV(i,r,ee-6,ee-3,ee-2,ee-1);Ne(Re[0]),Ne(Re[1]),Ne(Re[3]),Ne(Re[1]),Ne(Re[2]),Ne(Re[3])}function Pe(D){r.push(l[D*3+0]),r.push(l[D*3+1]),r.push(l[D*3+2])}function Ne(D){s.push(D.x),s.push(D.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return my(t,i,e)}static fromJSON(e,t){let i=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];i.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new No[r.type]().fromJSON(r)),new n(i,e.options)}},py={generateTopUV:function(n,e,t,i,r){let s=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[r*3],u=e[r*3+1];return[new re(s,o),new re(a,l),new re(c,u)]},generateSideWallUV:function(n,e,t,i,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],u=e[i*3+1],h=e[i*3+2],d=e[r*3],f=e[r*3+1],m=e[r*3+2],x=e[s*3],p=e[s*3+1],g=e[s*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new re(o,1-l),new re(c,1-h),new re(d,1-m),new re(x,1-g)]:[new re(a,1-l),new re(u,1-h),new re(f,1-m),new re(p,1-g)]}};function my(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,r=n.length;i<r;i++){let s=n[i];t.shapes.push(s.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Fr=class n extends Nl{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,r=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var Ri=class n extends Tt{constructor(e=.5,t=1,i=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:o},i=Math.max(3,i),r=Math.max(1,r);let a=[],l=[],c=[],u=[],h=e,d=(t-e)/r,f=new P,m=new re;for(let x=0;x<=r;x++){for(let p=0;p<=i;p++){let g=s+p/i*o;f.x=h*Math.cos(g),f.y=h*Math.sin(g),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/t+1)/2,m.y=(f.y/t+1)/2,u.push(m.x,m.y)}h+=d}for(let x=0;x<r;x++){let p=x*(i+1);for(let g=0;g<i;g++){let y=g+p,_=y,S=y+i+1,E=y+i+2,b=y+1;a.push(_,S,b),a.push(S,E,b)}}this.setIndex(a),this.setAttribute("position",new Ke(l,3)),this.setAttribute("normal",new Ke(c,3)),this.setAttribute("uv",new Ke(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Vn=class n extends Tt{constructor(e=new Vt([new re(0,.5),new re(-.5,-.5),new re(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new Ke(r,3)),this.setAttribute("normal",new Ke(s,3)),this.setAttribute("uv",new Ke(o,2));function c(u){let h=r.length/3,d=u.extractPoints(t),f=d.shape,m=d.holes;Si.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,g=m.length;p<g;p++){let y=m[p];Si.isClockWise(y)===!0&&(m[p]=y.reverse())}let x=Si.triangulateShape(f,m);for(let p=0,g=m.length;p<g;p++){let y=m[p];f=f.concat(y)}for(let p=0,g=f.length;p<g;p++){let y=f[p];r.push(y.x,y.y,0),s.push(0,0,1),o.push(y.x,y.y)}for(let p=0,g=x.length;p<g;p++){let y=x[p],_=y[0]+h,S=y[1]+h,E=y[2]+h;i.push(_,S,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return gy(t,e)}static fromJSON(e,t){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];i.push(o)}return new n(i,e.curveSegments)}};function gy(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var On=class n extends Tt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new P,d=new P,f=[],m=[],x=[],p=[];for(let g=0;g<=i;g++){let y=[],_=g/i,S=0;g===0&&o===0?S=.5/t:g===i&&l===Math.PI&&(S=-.5/t);for(let E=0;E<=t;E++){let b=E/t;h.x=-e*Math.cos(r+b*s)*Math.sin(o+_*a),h.y=e*Math.cos(o+_*a),h.z=e*Math.sin(r+b*s)*Math.sin(o+_*a),m.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),p.push(b+S,1-_),y.push(c++)}u.push(y)}for(let g=0;g<i;g++)for(let y=0;y<t;y++){let _=u[g][y+1],S=u[g][y],E=u[g+1][y],b=u[g+1][y+1];(g!==0||o>0)&&f.push(_,S,b),(g!==i-1||l<Math.PI)&&f.push(S,E,b)}this.setIndex(f),this.setAttribute("position",new Ke(m,3)),this.setAttribute("normal",new Ke(x,3)),this.setAttribute("uv",new Ke(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var nn=class n extends Tt{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);let o=[],a=[],l=[],c=[],u=new P,h=new P,d=new P;for(let f=0;f<=i;f++)for(let m=0;m<=r;m++){let x=m/r*s,p=f/i*Math.PI*2;h.x=(e+t*Math.cos(p))*Math.cos(x),h.y=(e+t*Math.cos(p))*Math.sin(x),h.z=t*Math.sin(p),a.push(h.x,h.y,h.z),u.x=e*Math.cos(x),u.y=e*Math.sin(x),d.subVectors(h,u).normalize(),l.push(d.x,d.y,d.z),c.push(m/r),c.push(f/i)}for(let f=1;f<=i;f++)for(let m=1;m<=r;m++){let x=(r+1)*f+m-1,p=(r+1)*(f-1)+m-1,g=(r+1)*(f-1)+m,y=(r+1)*f+m;o.push(x,p,y),o.push(p,g,y)}this.setIndex(o),this.setAttribute("position",new Ke(a,3)),this.setAttribute("normal",new Ke(l,3)),this.setAttribute("uv",new Ke(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Oo=class n extends Tt{constructor(e=new Do(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,i=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new P,l=new P,c=new re,u=new P,h=[],d=[],f=[],m=[];x(),this.setIndex(m),this.setAttribute("position",new Ke(h,3)),this.setAttribute("normal",new Ke(d,3)),this.setAttribute("uv",new Ke(f,2));function x(){for(let _=0;_<t;_++)p(_);p(s===!1?t:0),y(),g()}function p(_){u=e.getPointAt(_/t,u);let S=o.normals[_],E=o.binormals[_];for(let b=0;b<=r;b++){let T=b/r*Math.PI*2,R=Math.sin(T),v=-Math.cos(T);l.x=v*S.x+R*E.x,l.y=v*S.y+R*E.y,l.z=v*S.z+R*E.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=u.x+i*l.x,a.y=u.y+i*l.y,a.z=u.z+i*l.z,h.push(a.x,a.y,a.z)}}function g(){for(let _=1;_<=t;_++)for(let S=1;S<=r;S++){let E=(r+1)*(_-1)+(S-1),b=(r+1)*_+(S-1),T=(r+1)*_+S,R=(r+1)*(_-1)+S;m.push(E,b,R),m.push(b,T,R)}}function y(){for(let _=0;_<=t;_++)for(let S=0;S<=r;S++)c.x=_/t,c.y=S/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new n(new No[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var rn=class extends li{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new We(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new We(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ec,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Fo=class extends li{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new We(16777215),this.specular=new We(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new We(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ec,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=jl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function lo(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function xy(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var kr=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},kl=class extends kr{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:du,endingEnd:du}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case fu:s=e,a=2*t-i;break;case pu:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case fu:o=e,l=2*i-t;break;case pu:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}let c=(i-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(i-t)/(r-t),x=m*m,p=x*m,g=-d*p+2*d*x-d*m,y=(1+d)*p+(-1.5-2*d)*x+(-.5+d)*m+1,_=(-1-f)*p+(1.5+f)*x+.5*m,S=f*p-f*x;for(let E=0;E!==a;++E)s[E]=g*o[u+E]+y*o[c+E]+_*o[l+E]+S*o[h+E];return s}},zl=class extends kr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(i-t)/(r-t),h=1-u;for(let d=0;d!==a;++d)s[d]=o[c+d]*h+o[l+d]*u;return s}},Bl=class extends kr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Fn=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=lo(t,this.TimeBufferType),this.values=lo(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:lo(e.times,Array),values:lo(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Bl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new zl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new kl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case uo:t=this.InterpolantFactoryMethodDiscrete;break;case ho:t=this.InterpolantFactoryMethodLinear;break;case Ra:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return uo;case this.InterpolantFactoryMethodLinear:return ho;case this.InterpolantFactoryMethodSmooth:return Ra}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&xy(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===Ra,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*i,d=h-i,f=h+i;for(let m=0;m!==i;++m){let x=t[h+m];if(x!==t[d+m]||x!==t[f+m]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*i,d=o*i;for(let f=0;f!==i;++f)t[d+f]=t[h+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Fn.prototype.TimeBufferType=Float32Array;Fn.prototype.ValueBufferType=Float32Array;Fn.prototype.DefaultInterpolation=ho;var Qi=class extends Fn{};Qi.prototype.ValueTypeName="bool";Qi.prototype.ValueBufferType=Array;Qi.prototype.DefaultInterpolation=uo;Qi.prototype.InterpolantFactoryMethodLinear=void 0;Qi.prototype.InterpolantFactoryMethodSmooth=void 0;var Gl=class extends Fn{};Gl.prototype.ValueTypeName="color";var Hl=class extends Fn{};Hl.prototype.ValueTypeName="number";var Vl=class extends kr{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)Ai.slerpFlat(s,0,o,c-a,o,c,l);return s}},ps=class extends Fn{InterpolantFactoryMethodLinear(e){return new Vl(this.times,this.values,this.getValueSize(),e)}};ps.prototype.ValueTypeName="quaternion";ps.prototype.DefaultInterpolation=ho;ps.prototype.InterpolantFactoryMethodSmooth=void 0;var er=class extends Fn{};er.prototype.ValueTypeName="string";er.prototype.ValueBufferType=Array;er.prototype.DefaultInterpolation=uo;er.prototype.InterpolantFactoryMethodLinear=void 0;er.prototype.InterpolantFactoryMethodSmooth=void 0;var Wl=class extends Fn{};Wl.prototype.ValueTypeName="vector";var Xl=class{constructor(e,t,i){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],m=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return m}return null}}},_y=new Xl,ql=class{constructor(e){this.manager=e!==void 0?e:_y,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};ql.DEFAULT_MATERIAL_NAME="__DEFAULT";var zr=class extends Kt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new We(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},Br=class extends zr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Kt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new We(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},rl=new xt,ch=new P,uh=new P,ko=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new re(512,512),this.map=null,this.mapPass=null,this.matrix=new xt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ss,this._frameExtents=new re(1,1),this._viewportCount=1,this._viewports=[new Mt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;ch.setFromMatrixPosition(e.matrixWorld),t.position.copy(ch),uh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(uh),t.updateMatrixWorld(),rl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(rl),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(rl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var hh=new xt,Qr=new P,sl=new P,Yl=class extends ko{constructor(){super(new cn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new re(4,2),this._viewportCount=6,this._viewports=[new Mt(2,1,1,1),new Mt(0,1,1,1),new Mt(3,1,1,1),new Mt(1,1,1,1),new Mt(3,0,1,1),new Mt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),Qr.setFromMatrixPosition(e.matrixWorld),i.position.copy(Qr),sl.copy(i.position),sl.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(sl),i.updateMatrixWorld(),r.makeTranslation(-Qr.x,-Qr.y,-Qr.z),hh.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(hh)}},wn=class extends zr{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new Yl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Kl=class extends ko{constructor(){super(new Bn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ci=class extends zr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Kt.DEFAULT_UP),this.updateMatrix(),this.target=new Kt,this.shadow=new Kl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},zo=class extends zr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var rc="\\[\\]\\.:\\/",yy=new RegExp("["+rc+"]","g"),sc="[^"+rc+"]",vy="[^"+rc.replace("\\.","")+"]",by=/((?:WC+[\/:])*)/.source.replace("WC",sc),My=/(WCOD+)?/.source.replace("WCOD",vy),Sy=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",sc),wy=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",sc),Ey=new RegExp("^"+by+My+Sy+wy+"$"),Ty=["material","materials","bones","map"],Zl=class{constructor(e,t,i){let r=i||bt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},bt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(yy,"")}static parseTrackName(e){let t=Ey.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=i.nodeName.substring(r+1);Ty.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};bt.Composite=Zl;bt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};bt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};bt.prototype.GetterByBindingType=[bt.prototype._getValue_direct,bt.prototype._getValue_array,bt.prototype._getValue_arrayElement,bt.prototype._getValue_toArray];bt.prototype.SetterByBindingTypeAndVersioning=[[bt.prototype._setValue_direct,bt.prototype._setValue_direct_setNeedsUpdate,bt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_array,bt.prototype._setValue_array_setNeedsUpdate,bt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_arrayElement,bt.prototype._setValue_arrayElement_setNeedsUpdate,bt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[bt.prototype._setValue_fromArray,bt.prototype._setValue_fromArray_setNeedsUpdate,bt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Qb=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var tr=["up","down","left","right"];var oc={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},at=(n,e,t,i={},r,s=e)=>({char:n,minotaur:e,block:t,hazard:s,...i,sprites:r??[]}),pn={floor:at(".",!0,!0,{},["floor"]),wall:at("#",!1,!1,{},["wall"]),exit:at("E",!1,!1,{},["exit"]),gate:at("|",!1,!1,{},["gate-closed","gate-open"]),water:at("~",!1,!0,{needs:"flippers"},["water"]),fire:at("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:at("=",!0,!0,{slides:"skates"},["ice"]),"force-up":at("^",!0,!0,{carries:"up"},["force-up"]),"force-down":at("v",!0,!0,{carries:"down"},["force-down"]),"force-left":at("<",!0,!0,{carries:"left"},["force-left"]),"force-right":at(">",!0,!0,{carries:"right"},["force-right"]),dirt:at("%",!0,!0,{},["dirt"]),safe:at("S",!1,!1,{},["safe"]),button:at("_",!0,!0,{},["button"]),"toggle-open":at("t",!0,!1,{},["toggle-open"]),"toggle-closed":at("T",!1,!1,{},["toggle-closed"]),"door-red":at("R",!1,!1,{door:"red"},["door-red","door-red-sill"]),"door-blue":at("B",!1,!1,{door:"blue"},["door-blue","door-blue-sill"]),"door-yellow":at("Y",!1,!1,{door:"yellow"},["door-yellow","door-yellow-sill"]),"door-green":at("G",!1,!1,{door:"green"},["door-green","door-green-sill"]),trap:at("&",!0,!0,{},["trap"]),"button-brown":at("-",!0,!0,{},["button-brown"]),"button-red":at("+",!0,!0,{},["button-red"]),popup:at(";",!1,!1,{},["popup"]),gravel:at(":",!1,!1,{},["gravel"]),"fake-wall":at("W",!1,!1,{},["wall"]),"invisible-wall":at("I",!1,!1,{},["floor"]),teleport:at("@",!1,!1,{},["teleport"]),thief:at("$",!0,!0,{},["thief"]),bomb:at("!",!1,!0,{},["bomb"],!0),clone:at("C",!1,!1,{},tr.map(n=>`clone-${n}`))},kn={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var En={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:oc.mirror.name},cake:{char:"x",sprite:"cake",name:oc.cake.name},cow:{char:"c",sprite:"cow",name:oc.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},Ay=["theseus","minotaur","minotaur-stone","cow-standing"],Cy=["gate-closed-v","gate-open-v","gate-slide","gate-slide-v","door-red-sill-v","door-blue-sill-v","door-yellow-sill-v","door-green-sill-v"],Ry=["exit-off","exit-wake"],tM=[...new Set([...Object.values(pn).flatMap(n=>n.sprites),...Cy,...Ry,...Object.values(En).map(n=>n.sprite),...Ay,...Object.values(kn).map(n=>n.sprite)])];function kh(n,e){let t=e.minotaur,i=n.minotaur;if(!t||!i||t.r!==i.r||t.c!==i.c)return[];let r=n.objects[i.r*n.level.cols+i.c];return r&&r!=="block"?[{kind:r,c:i.c,r:i.r,by:"minotaur"}]:[]}var ac=[[.55,-.62],[-.55,-.62],[.95,.15],[-.95,.15],[.55,.9],[-.55,.9]],Pi=2,Py=220;function zh(n){return Math.round(Math.min(54,Math.max(34,n*.8)))}function Iy(n,e,t,i,r){let s=zh(t),o=s/2,a=n+t*.12,l=e+t*.08;for(let d=0;d<ac.length;d++){let[f,m]=ac[d],x=a+f*s,p=l+m*s;if(x-o>=Pi&&x+o<=i-Pi&&p-o>=Pi&&p+o<=r-Pi)return{cx:x,cy:p,place:d}}let[c,u]=ac[0],h=(d,f,m)=>f>m?(f+m)/2:Math.min(m,Math.max(f,d));return{cx:h(a+c*s,o+Pi,i-o-Pi),cy:h(l+u*s,o+Pi,r-o-Pi),place:0}}function Ly(n,e,t){return n.x>=0&&n.x<=e&&n.head>=-n.cell&&n.head<=t}function Bh(n){return{look:"modern",frame(e){let t=n.icons[e];return t?{x:t.x,y:t.y,w:n.cell,h:n.cell,sw:n.width,sh:n.height,mx:.5,my:.44,fill:.92}:null}}}function Gh(n,e){let t=document.createElement("div");t.className="item-bubbles",t.dataset.look=e.look,t.setAttribute("aria-hidden","true"),n(t);let i=new Map;function r(o){let a=document.createElement("div");a.className="item-bubble",a.dataset.kind=o.kind,a.dataset.by=o.by;let l=[document.createElement("span"),document.createElement("span")];for(let h of l)h.className="item-bubble-puff";let c=document.createElement("span");c.className="item-bubble-cloud";let u=document.createElement("span");return u.className="item-bubble-pic",c.append(u),a.append(...l,c),t.append(a),a.offsetWidth,a.classList.add("shown"),{el:a,cloud:c,pic:u,puffs:l,bubble:o,place:0,x:0,y:0,d:0,key:""}}function s(o,a,l,c){let u=zh(a.cell),{cx:h,cy:d,place:f}=Iy(a.x,a.head,a.cell,l,c),m=`${h.toFixed(1)} ${d.toFixed(1)} ${u} ${a.x.toFixed(1)} ${a.head.toFixed(1)}`;if(m===o.key)return;Object.assign(o,{key:m,place:f,x:h,y:d,d:u}),o.cloud.style.cssText=`left:${h-u/2}px;top:${d-u/2}px;width:${u}px;height:${u*.86}px`;let x=a.x+a.cell*.08,p=a.head+a.cell*.12;[[.3,.13],[.55,.2]].forEach(([y,_],S)=>{let E=Math.max(4,u*_),b=x+(h-x)*y,T=p+(d-p)*y;o.puffs[S].style.cssText=`left:${b-E/2}px;top:${T-E/2}px;width:${E}px;height:${E}px`});let g=e.frame(o.bubble.kind);if(g){let y=u*g.fill/g.w,_=u-3,S=u*.86-3;o.pic.style.cssText=`background-size:${g.sw*y}px ${g.sh*y}px;background-position:${_/2-(g.x+g.mx*g.w)*y}px ${S/2-(g.y+g.my*g.h)*y}px`}}return{place(o,a,l){let c=new Set;for(let u of o){if(!Ly(u,a,l))continue;let h=`${u.bubble.by} ${u.bubble.c},${u.bubble.r} ${u.bubble.kind}`;c.add(h);let d=i.get(h);d||i.set(h,d=r(u.bubble)),s(d,u,a,l)}for(let[u,h]of i)c.has(u)||(i.delete(u),h.el.classList.remove("shown"),setTimeout(()=>h.el.remove(),Py))},shown(){return[...i.values()].map(o=>({kind:o.bubble.kind,c:o.bubble.c,r:o.bubble.r,by:o.bubble.by,place:o.place,x:o.x,y:o.y,size:o.d}))}}}var Xo=n=>Math.min(1,Math.max(0,n)),Hh=n=>{let e=Xo(n);return e*e*(3-2*e)},Vh=n=>n<=0||n>=1?0:Math.sin(Math.PI*n),qo=n=>Hh((n-770)/630),Wh=n=>Vh((n-590)/420);function Xh(n,e){let t=n/700-e,i=Xo(t*8),r=i*(1-Xo(t*2));return i*(.45+.55*r)*(1-.65*Hh((n-980)/420))}var qh=Array.from({length:12},(n,e)=>{let t=i=>{let r=Math.sin(e*12.9898+i*78.233)*43758.5453;return r-Math.floor(r)};return{x:-.05-t(2)*.25,z:(t(1)-.5)*.6,t0:1e3+e/11*500,rise:.8+t(4)*.6}});function Yh(n,e){let t=(n-e.t0)/600;return{o:Vh(t),up:Xo(t)}}var lc=4,Uy=900,Ny=800,Oy=500,Fy=.22,Kh=[[.3,420],[.36,160],[.3,200],[.36,160],[.3,380],[-.12,520],[0,400]],ky=Kh.reduce((n,[,e])=>n+e,0),zy=[[-1,0],[1,0],[0,-1],[0,1]],ms=(n,e,t)=>e<0||t<0||e>=n.level.rows||t>=n.level.cols||n.terrain[e*n.level.cols+t]==="wall";function cc(n,e,t){return(ms(n,e-1,t)||ms(n,e+1,t))&&!(ms(n,e,t-1)&&ms(n,e,t+1))?"h":"v"}function Yo(n,e){return n.terrain[e]!=="floor"?null:pn[n.level.terrain[e]].door??null}function Zh(n,e,t){for(let i of zy){let r=e+i[0],s=t+i[1];if(!ms(n,r,s)&&n.terrain[r*n.level.cols+s]==="gate")return i}return null}function Ko(n,e,t=0){let i=Math.round(e.r),r=Math.round(e.c),s=Zh(n,i,r);if(!s)return e;let o=Math.max(0,1-2*Math.max(Math.abs(e.r-i),Math.abs(e.c-r))),a=-Fy*o+t;return{r:e.r+s[0]*a,c:e.c+s[1]*a}}var gs={bars:new Map,portal:null,wake:null,doors:new Map,hoof:0,busy:!1},By=n=>n.relicsLeft===0?1:0,xs=(n,e)=>e.portal??By(n),$h=n=>n*n*(3-2*n);function Gy(n){let e=0,t=0;for(let[i,r]of Kh){if(n<e+r)return t+(i-t)*$h((n-e)/r);e+=r,t=i}return 0}function Jh(){let n=null,e=!1,t=0,i=new Map,r={move:null},s={move:null},o=null,a=new Map,l=!1,c=null,u=(d,f)=>{let m=Math.min(1,Math.max(0,(f-d.t0)/d.ms));return d.from+(d.to-d.from)*$h(m)},h=(d,f,m,x)=>{let p=d?u(d,m):1-f;return{from:p,to:f,t0:m,ms:x*Math.abs(f-p)}};return{at(d,f,m,x,p){let{cols:g}=d.level,y=[];d.level.terrain.forEach((K,I)=>{pn[K].door&&y.push(I)});let _=K=>{let I=Math.floor(K/g),z=K%g;return Math.abs(f.player.r-I)+Math.abs(f.player.c-z)<.999},S=new Map(y.map(K=>[K,d.terrain[K]==="floor"||_(K)])),E=d.relicsLeft===0;if(d.level!==n)n=d.level,r.move=null,s.move=null,o=null,a.clear(),l=!1,c=null;else if(!x){d.moves===0&&t>1?(r.move=null,s.move=null,o=null):E!==e&&(r.move=h(r.move,E?1:0,m,Uy),s.move=h(s.move,E?1:0,m,Ny),o=E?m:null);for(let[K,I]of S)i.get(K)!==I&&a.set(K,h(a.get(K),I?1:0,m,Oy))}e=E,i=S,t=d.moves,x&&(r.move=null,s.move=null,o=null,a.clear());let b=!1,T=new Map;if(r.move)if(m-r.move.t0>=r.move.ms)r.move=null;else{let K=u(r.move,m);d.terrain.forEach((I,z)=>{I==="gate"&&T.set(z,K)}),b=!0}let R=null;s.move&&(m-s.move.t0>=s.move.ms?s.move=null:(R=u(s.move,m),b=!0));let v=null;o!==null&&(m-o>=2100?o=null:(v=Math.max(0,m-o),b=!0));let M=new Map;for(let[K,I]of a)m-I.t0>=I.ms?a.delete(K):(M.set(K,u(I,m)),b=!0);d.moves===0&&(l=!1),c&&c.s!==d&&(c=null);let L=d.minotaur;!l&&!x&&p&&E&&d.outcome==="playing"&&L&&d.stone===0&&Zh(d,L.r,L.c)&&(l=!0,c={s:d,t0:m});let k=0;return c&&(m-c.t0>=ky?c=null:(k=Gy(m-c.t0),b=!0)),b?{bars:T,portal:R,wake:v,doors:M,hoof:k,busy:b}:gs}}}function _s(n){return Math.max(10,Math.min(90,n))}function Qh(n,e){let t=n*Math.PI/180;return Math.max(40,e/2*Math.cos(t)/Math.max(.05,Math.sin(t))+4)}var ys=n=>Math.sin(n*Math.PI/180);function ed(n,e,t,i){let r=i?1:1-Math.exp(-Math.max(0,t)*11),s=!1;for(let o of["yaw","pitch","tx","tz","zoom"]){let a=e[o]-n[o];a!==0&&(n[o]=Math.abs(a)>(o==="yaw"||o==="pitch"?.02:.002)&&!i?n[o]+a*r:e[o],n[o]!==e[o]&&(s=!0))}return n.pitch=_s(n.pitch),s}var jh=(n,e)=>Math.max(-Math.max(0,e),Math.min(Math.max(0,e),n));function Zo(n,e,t,i){let r=n.yaw*Math.PI/180,s=Math.cos(r),o=Math.sin(r),a=n.tx*s-n.tz*o,l=-n.tx*o-n.tz*s,c=(e*Math.abs(s)+t*Math.abs(o))/2,u=(e*Math.abs(o)+t*Math.abs(s))/2,h=jh(a,c+1-n.zoom*i/2),d=jh(l,u+1-n.zoom/2/ys(n.pitch));return{...n,tx:h*s-d*o,tz:-h*o-d*s}}function td(n,e,t,i){let r=n.yaw*Math.PI/180,s=Math.cos(r),o=-Math.sin(r),a=-Math.sin(r),l=-Math.cos(r),c=e*i,u=t*i/ys(n.pitch);return{...n,tx:n.tx-s*c+a*u,tz:n.tz-o*c+l*u}}function nd(n,e){return n+360*Math.round((e-n)/360)}var uc=5,Wn=1.25,id=n=>2*Wn*Math.cos(n*Math.PI/180);function rd(n,e,t,i,r){let s=r*Math.PI/180,o=Math.abs(Math.cos(s)),a=Math.abs(Math.sin(s)),l=e,c=t,u=l*o+c*a,h=(l*a+c*o)*ys(i);return Math.max(uc,h+id(i),u/n)}function sd(n,e,t,i){let r=Math.hypot(e+2,t+2);return{min:uc,max:Math.max(uc,r*ys(i)+id(i),r/n)}}var $o=(n,e)=>Math.max(e.min,Math.min(e.max,n));function Ii(n,e,t){let i=n.yaw*Math.PI/180,r=t/ys(n.pitch);return{x:n.tx+Math.cos(i)*e-Math.sin(i)*r,z:n.tz-Math.sin(i)*e-Math.cos(i)*r}}function od(n,e,t,i,r,s){let o=Ii(n,t*n.zoom*e,i*n.zoom),a=Math.round(o.x+(r-1)/2),l=Math.round(o.z+(s-1)/2);return!Number.isFinite(a)||!Number.isFinite(l)||a<0||l<0||a>=r||l>=s?null:{r:l+0,c:a+0}}function ad(n,e,t,i,r){let s=$o(n.zoom*e,r),o=n.zoom-s,a=Ii(n,t*o,i*o);return{...n,zoom:s,tx:a.x,tz:a.z}}function ld(n,e){let t=n.zoom/2,i=t*e;return{corners:[Ii(n,-i,t),Ii(n,i,t),Ii(n,i,-t),Ii(n,-i,-t)],tick:[Ii(n,0,0),Ii(n,0,t*.4)]}}function cd(n,e,t,i){let r=n<520?8:11,s=Math.min(Math.floor(n*.5/t),Math.floor(e*.4/i));return Math.max(2,Math.min(r,s))}function ud(n,e,t,i,r){return[(n.x+e/2)*i,r+(n.z+t/2)*i]}function hd(n,e,t,i,r,s){return{x:n/r-t/2,z:(e-s)/r-i/2}}var dd={items:"plate",beacon:!1,cutaway:!1,caps:!1},fd="crete-variant";function Hy(n){let e={...dd};if(!n)return e;let t;try{t=JSON.parse(n)}catch{return e}if(!t||typeof t!="object")return e;let i=t;(i.items==="cyan"||i.items==="white"||i.items==="plate")&&(e.items=i.items);for(let r of["beacon","cutaway","caps"])typeof i[r]=="boolean"&&(e[r]=i[r]);return e}var pd=dd;function mn(){return pd}function md(n){pd=Hy(n)}var Wy=12,Xy=.6,qy=.4,Yy=.4;function xd(){let n=null,e={down(t,i,r){return n?[]:(n={id:t,x0:i,y0:r,x:i,y:r,dragging:!1},[])},move(t,i,r){if(!n||n.id!==t)return[];if(!n.dragging){if(Math.hypot(i-n.x0,r-n.y0)<Wy)return[];n.dragging=!0}let s=i-n.x,o=r-n.y;n.x=i,n.y=r;let a=[];return s!==0&&a.push({kind:"turn",deg:-s*Xy}),o!==0&&a.push({kind:"tilt",deg:o*qy}),a},up(t,i,r){if(!n||n.id!==t)return[];let s=e.move(t,i,r),o=n.dragging;return n=null,o?s:[{kind:"reset"}]},cancel(t){return n?.id===t&&(n=null),[]}};return e}function _d(n){let e=_s(n.pitch);return{needle:n.yaw,squash:Math.max(Yy,Math.sin(e*Math.PI/180)),tilt:(90-e)/80}}var hc=n=>Math.max(-30,Math.min(30,n));function yd(n){let e=new Map,t=null,i=null,r=!1,s=()=>{let[o,a]=[...e.values()];return!o||!a?{ang:0,d:0,mx:0,my:0}:{ang:Math.atan2(a.y-o.y,a.x-o.x),d:Math.hypot(a.x-o.x,a.y-o.y),mx:(o.x+a.x)/2,my:(o.y+a.y)/2}};return{down(o){let a=n();for(let[l,c]of e)(l===o.id||a-c.seen>1e3)&&e.delete(l);return e.size===0&&(r=!1),e.set(o.id,{x:o.x,y:o.y,x0:o.x,y0:o.y,t0:a,seen:a,button:o.type==="mouse"?o.button:0}),t=e.size===2?s():null,e.size>1&&(r=!0),[]},move(o){let a=e.get(o.id);if(!a)return[];let l=o.x-a.x,c=o.y-a.y;a.x=o.x,a.y=o.y,a.seen=n();let u=[];if(e.size===1){if(r)return u;a.button===1||a.button===2?(l!==0||c!==0)&&u.push({kind:"pan",dx:l,dy:c}):(l!==0&&u.push({kind:"turn",deg:hc(-l*.35)}),c!==0&&u.push({kind:"tilt",deg:hc(c*.3)}))}else if(e.size===2&&t){let h=s(),d=h.ang-t.ang;d>Math.PI&&(d-=2*Math.PI),d<-Math.PI&&(d+=2*Math.PI),d!==0&&u.push({kind:"turn",deg:hc(d*180/Math.PI)});let f=h.mx-t.mx,m=h.my-t.my;(f!==0||m!==0)&&u.push({kind:"pan",dx:f,dy:m});let x=Math.max(10,t.d)/Math.max(10,h.d);x!==1&&u.push({kind:"zoom",factor:x,x:h.mx,y:h.my}),t=h}return u},up(o){let a=e.get(o.id);if(!a)return[];e.delete(o.id),t=e.size===2?s():null;let l=r;if(e.size===0&&(r=!1),o.type==="mouse"||e.size!==0||l)return[];let c=n();return c-a.t0>=280||Math.hypot(o.x-a.x0,o.y-a.y0)>=12?[]:i&&c-i.t<320&&Math.hypot(o.x-i.x,o.y-i.y)<40?(i=null,[{kind:"reset"}]):(i={t:c,x:o.x,y:o.y},[])},cancel(o){return e.delete(o),t=e.size===2?s():null,e.size===0&&(r=!1),[]},wheel(o,a,l){return o===0?[]:[{kind:"zoom",factor:Math.exp(o*.0015),x:a,y:l}]}}}function vd(){let n=null,e=new Set,t=i=>i.type==="mouse"?{...i,button:i.button===2?0:1}:i;return{down(i){if(i.type==="mouse"&&i.button!==0)return e.add(i.id),[{kind:"cam",op:"down",p:t(i)}];if(i.type==="mouse")return n?[]:(n={...i},[{kind:"paint",x:i.x,y:i.y,first:!0}]);if(e.size>0)return e.add(i.id),[{kind:"cam",op:"down",p:i}];if(n&&n.type!=="mouse"&&n.id!==i.id){let r=n;return n=null,e.add(r.id),e.add(i.id),[{kind:"drop"},{kind:"cam",op:"down",p:r},{kind:"cam",op:"down",p:i}]}return n?[]:(n={...i},[{kind:"paint",x:i.x,y:i.y,first:!0}])},move(i){return n&&n.id===i.id?(n.x=i.x,n.y=i.y,[{kind:"paint",x:i.x,y:i.y,first:!1}]):e.has(i.id)?[{kind:"cam",op:"move",p:t(i)}]:i.type==="mouse"?[{kind:"hover",x:i.x,y:i.y}]:[]},up(i){return n&&n.id===i.id?(n=null,[{kind:"end"}]):e.delete(i.id)?[{kind:"cam",op:"up",p:t(i)}]:[]},cancel(i){return n&&n.id===i?(n=null,[{kind:"end"}]):e.delete(i)?[{kind:"cam",op:"cancel",p:{id:i,x:0,y:0,type:"touch",button:0}}]:[]}}}var dc="crete-view-hint";function fc(n){try{let e=n?JSON.parse(n):{};return{shows:Number.isInteger(e.shows)&&e.shows>0?e.shows:0,moved:e.moved===!0}}catch{return{shows:0,moved:!1}}}function bd(n){return n?"Drag to turn and tilt · Two fingers pan, twist and pinch · Tap the compass to reset":"Drag to turn and tilt · Right-drag to pan · Tap the compass to reset"}function Md(n,e){let t={...n},i=t.moved||t.shows>=2?"done":"waiting",r=e,s=0,o=()=>{let a=i;return i="done",a==="shown"?"hide":null};return{record:()=>({...t}),tick(a,l){return i==="waiting"?l?(r=a,null):a-r<1500?null:(i="shown",s=a,t.shows++,"show"):i==="shown"&&(l||a-s>=8e3)?o():null},moved(){return t.moved=!0,o()},dismiss(){return i==="shown"?o():null},show(a){return s=a,i==="shown"?null:(i="shown","show")},over:()=>i==="done"}}var Sd=15,wd=10,Ed=1.2,Ky=16,Zy='<span class="tilt-ring" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dial" cx="12" cy="12" r="11"/><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>',$y=600,Td=250;function Jy(n,e,t,i){let r=document.createElement("button");return r.type="button",r.id=n,r.className=i,r.setAttribute("aria-label",e),r.title=e,r.innerHTML=t,r}function Ad(n,e,t,i,r){let s=!1,o=()=>{let O=v.moved();s||(s=!0,I()),z(O)},a={turn:(O,H)=>{o(),i.turn(O,H)},pan:(O,H)=>{o(),i.pan(O,H)},zoom:(O,H,j,$)=>{o(),i.zoom(O,H,j,$)},tilt:(O,H)=>{o(),i.tilt(O,H)},reset:()=>{o(),i.reset()}},l="",c=yd(()=>performance.now()),u=O=>({id:O.pointerId,x:O.clientX,y:O.clientY,type:O.pointerType==="touch"||O.pointerType==="pen"?O.pointerType:"mouse",button:O.button}),h=O=>{if(!(!O.length||t.blocked())){t.gesture();for(let H of O)if(H.kind==="turn")a.turn(H.deg,!1);else if(H.kind==="tilt")a.tilt(H.deg,!1);else if(H.kind==="pan")a.pan(H.dx,H.dy);else if(H.kind==="zoom"){let j=n.getBoundingClientRect();a.zoom(H.factor,(H.x-j.left)/(j.width||1)-.5,.5-(H.y-j.top)/(j.height||1),!1)}else a.reset()}},d=r?vd():null,f=O=>{for(let H of O)H.kind==="paint"?r.stroke(H.x,H.y,H.first):H.kind==="end"?r.end():H.kind==="drop"?r.drop():H.kind==="hover"?r.hover({x:H.x,y:H.y}):H.op==="cancel"?h(c.cancel(H.p.id)):h(c[H.op](H.p))},m=O=>{if(l=O.pointerType,!t.blocked()){try{n.setPointerCapture(O.pointerId)}catch{}d?(O.preventDefault(),f(d.down(u(O)))):h(c.down(u(O)))}},x=O=>d?f(d.move(u(O))):h(c.move(u(O))),p=O=>d?f(d.up(u(O))):h(c.up(u(O))),g=O=>d?f(d.cancel(O.pointerId)):h(c.cancel(O.pointerId)),y=O=>{O.pointerType==="mouse"?r?.hover(null):n.hasPointerCapture?.(O.pointerId)||g(O)},_=()=>{r||t.blocked()||(t.gesture(),a.reset())},S=O=>O.preventDefault(),E=O=>{if(t.blocked())return;O.preventDefault();let H=O.deltaMode===1?Ky:O.deltaMode===2?n.clientHeight:1;h(c.wheel(O.deltaY*H,O.clientX,O.clientY))};n.style.touchAction="none",n.addEventListener("pointerdown",m),n.addEventListener("pointermove",x),n.addEventListener("pointerup",p),n.addEventListener("pointercancel",g),n.addEventListener("lostpointercapture",g),n.addEventListener("pointerleave",y),n.addEventListener("dblclick",_),n.addEventListener("contextmenu",S),n.addEventListener("wheel",E,{passive:!1});let b=jy("cam-compass",t,{...a,zoomStep:O=>a.zoom(O>0?1/Ed:Ed,0,0,!0)},O=>{l=O}),T=b.button;e.append(T);let R=fc(null);try{R=fc(localStorage.getItem(dc))}catch{}let v=Md(R,performance.now()),M=document.createElement("p");M.className="view-hint",M.id="view-hint",M.hidden=!0,M.setAttribute("role","status"),e.append(M);let L=0,k=0,K=()=>z(v.tick(performance.now(),B()));function I(){try{localStorage.setItem(dc,JSON.stringify(v.record()))}catch{}}function z(O){if(O){if(I(),O==="show"){let H=l?l!=="mouse":matchMedia("(pointer: coarse)").matches;M.textContent=bd(H),clearTimeout(k),M.hidden=!1,requestAnimationFrame(()=>M.classList.add("on")),T.classList.remove("wiggle"),T.offsetWidth,T.classList.add("wiggle");return}clearInterval(L),M.classList.remove("on"),T.classList.remove("wiggle"),k=window.setTimeout(()=>{M.hidden=!0},300)}}let B=()=>t.covered()||document.hidden||e.closest("[hidden]")!==null;return!r&&!v.over()&&!matchMedia("(pointer: coarse)").matches&&(L=window.setInterval(K,Td)),M.addEventListener("click",()=>z(v.dismiss())),{setView:b.setView,showTips(){let O=v.show(performance.now());O&&(clearInterval(L),L=window.setInterval(K,Td)),z(O)},dispose(){clearInterval(L),clearTimeout(k),M.remove(),n.removeEventListener("pointerdown",m),n.removeEventListener("pointermove",x),n.removeEventListener("pointerup",p),n.removeEventListener("pointercancel",g),n.removeEventListener("lostpointercapture",g),n.removeEventListener("pointerleave",y),n.removeEventListener("dblclick",_),n.removeEventListener("contextmenu",S),n.removeEventListener("wheel",E),T.remove()}}}function jy(n,e,t,i=()=>{}){let r=Jy(n,"Compass: drag or use the arrow keys to turn and tilt the view, plus and minus to zoom, tap to reset it",Zy,"compass");r.title="Compass";let s=r.querySelector("svg"),o=xd(),a=-1e9,l=u=>{if(u.length){e.gesture();for(let h of u)h.kind==="turn"?t.turn(h.deg,!0):h.kind==="tilt"?t.tilt(h.deg,!0):h.kind==="reset"&&t.reset()}};r.style.touchAction="none";for(let u of["pointerdown","pointermove","pointerup","pointercancel"])r.addEventListener(u,h=>h.stopPropagation());r.addEventListener("pointerdown",u=>{if(i(u.pointerType),!(e.blocked()||u.pointerType==="mouse"&&u.button!==0)){u.preventDefault();try{r.setPointerCapture(u.pointerId)}catch{}l(o.down(u.pointerId,u.clientX,u.clientY))}}),r.addEventListener("pointermove",u=>{e.blocked()||l(o.move(u.pointerId,u.clientX,u.clientY))}),r.addEventListener("pointerup",u=>{let h=o.up(u.pointerId,u.clientX,u.clientY);h.length&&(a=performance.now()),e.blocked()||l(h)}),r.addEventListener("pointercancel",u=>l(o.cancel(u.pointerId)));let c={ArrowLeft:()=>t.turn(-Sd,!0),ArrowRight:()=>t.turn(Sd,!0),ArrowUp:()=>t.tilt(-wd,!0),ArrowDown:()=>t.tilt(wd,!0),"+":()=>t.zoomStep(1),"=":()=>t.zoomStep(1),"-":()=>t.zoomStep(-1),_:()=>t.zoomStep(-1)};return r.addEventListener("keydown",u=>{if(u.ctrlKey||u.metaKey||u.altKey)return;let h=c[u.key];h&&(u.preventDefault(),u.stopPropagation(),!e.blocked()&&(e.gesture(),h()))}),r.addEventListener("click",()=>{performance.now()-a<$y||e.blocked()||(e.gesture(),t.reset())}),{button:r,setView(u,h){let d=_d({yaw:u,pitch:h});s&&(s.style.transform=`scale(1, ${d.squash.toFixed(3)}) rotate(${d.needle.toFixed(1)}deg)`),r.style.setProperty("--tilt",d.tilt.toFixed(3)),r.dataset.heading=String(Math.round(u)),r.dataset.pitch=String(Math.round(h))}}}var vs=new P;function Tn(n,e,t,i,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;vs.copy(e),vs[i]=0,vs.normalize();let c=.5*o/(o+a),u=1-vs.angleTo(n)/l;return Math.sign(vs[t])===1?u*c:a/(o+a)+c+c*(1-u)}var Xn=class extends en{constructor(e=1,t=1,i=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,i/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new P,l=new P,c=new P(e,t,i).divideScalar(2).subScalar(s),u=this.attributes.position.array,h=this.attributes.normal.array,d=this.attributes.uv.array,f=u.length/6,m=new P,x=.5/r;for(let p=0,g=0;p<u.length;p+=3,g+=2)switch(a.fromArray(u,p),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),u[p+0]=c.x*Math.sign(a.x)+l.x*s,u[p+1]=c.y*Math.sign(a.y)+l.y*s,u[p+2]=c.z*Math.sign(a.z)+l.z*s,h[p+0]=l.x,h[p+1]=l.y,h[p+2]=l.z,Math.floor(p/f)){case 0:m.set(1,0,0),d[g+0]=Tn(m,l,"z","y",s,i),d[g+1]=1-Tn(m,l,"y","z",s,t);break;case 1:m.set(-1,0,0),d[g+0]=1-Tn(m,l,"z","y",s,i),d[g+1]=1-Tn(m,l,"y","z",s,t);break;case 2:m.set(0,1,0),d[g+0]=1-Tn(m,l,"x","z",s,e),d[g+1]=Tn(m,l,"z","x",s,i);break;case 3:m.set(0,-1,0),d[g+0]=1-Tn(m,l,"x","z",s,e),d[g+1]=1-Tn(m,l,"z","x",s,i);break;case 4:m.set(0,0,1),d[g+0]=1-Tn(m,l,"x","y",s,e),d[g+1]=1-Tn(m,l,"y","x",s,t);break;case 5:m.set(0,0,-1),d[g+0]=Tn(m,l,"x","y",s,e),d[g+1]=1-Tn(m,l,"y","x",s,t);break}}};var bs={floor:"flag",wall:"none",exit:"flag","gate-closed":"flag","gate-open":"flag",water:"water",fire:"ember",ice:"ice","force-up":"force","force-down":"force","force-left":"force","force-right":"force",dirt:"dirt",safe:"flag",button:"flag","toggle-open":"flag","toggle-closed":"flag","door-red":"flag","door-blue":"flag","door-yellow":"flag","door-green":"flag","door-red-sill":"flag","door-blue-sill":"flag","door-yellow-sill":"flag","door-green-sill":"flag",trap:"flag","button-brown":"flag","button-red":"flag",popup:"flag",gravel:"gravel",teleport:"flag",thief:"flag",bomb:"flag","clone-up":"flag","clone-down":"flag","clone-left":"flag","clone-right":"flag"};function Cd(n,e){let t=n.terrain[e],i=pn[t].sprites;if(t==="clone"){let s=Math.floor(e/n.level.cols),o=e%n.level.cols,a=n.level.machines.find(l=>l.at.r===s&&l.at.c===o);return i[tr.indexOf(a?.dir??"up")]}let r=Yo(n,e);return r?`door-${r}-sill`:t==="gate"&&n.relicsLeft===0?i[1]:i[0]}function Rd(n,e,t){let i=[[-1,0],[0,-1],[0,1],[1,0]].find(([r,s])=>n(e+r,t+s));return i?[0-i[0],0-i[1]]:[1,0]}var Pd=["theseus","minotaur","minotaur-stone"];function Id(n,e,t=0){let i=[],r=n.level.cols;n.objects.forEach((s,o)=>{if(!s)return;let a=Math.floor(o/r),l=o%r;s==="block"&&e.blocks?.some(c=>c.origin.r===a&&c.origin.c===l)||i.push({model:En[s].sprite,r:a,c:l,id:`o${o}`})});for(let s of n.level.machines){let o=s.template==="block"?En.block.sprite:kn[s.template].sprite;i.push({model:o,r:s.at.r,c:s.at.c,id:`machine${s.at.r*r+s.at.c}`,dir:s.dir})}for(let s of e.blocks??[])i.push({model:"block",r:s.at.r,c:s.at.c,id:null});for(let s of e.hazards){let o=n.hazards.find(a=>a.kind===s.kind&&a.at.r===s.at.r&&a.at.c===s.at.c);i.push({model:kn[s.kind].sprite,r:s.at.r,c:s.at.c,id:null,dir:o?.dir})}if(n.cow&&i.push({model:"cow-standing",r:n.cow.r,c:n.cow.c,id:"cow"}),e.minotaur){let s=Ko(n,e.minotaur,t);i.push({model:n.stone>0?"minotaur-stone":"minotaur",r:s.r,c:s.c,id:"minotaur"})}return i.push({model:"theseus",r:e.player.r,c:e.player.c,id:"theseus"}),i}var Jo=class extends fn{constructor(e=null){super();let t=new en;t.deleteAttribute("uv");let i=new rn({side:Pt}),r=new rn,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let o=new wn(16777215,s,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new se(t,i);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let l=new se(t,r);l.position.set(-10.906,2.009,1.846),l.rotation.set(0,-.195,0),l.scale.set(2.328,7.905,4.651),this.add(l);let c=new se(t,r);c.position.set(-5.607,-.754,-.758),c.rotation.set(0,.994,0),c.scale.set(1.97,1.534,3.955),this.add(c);let u=new se(t,r);u.position.set(6.167,.857,7.803),u.rotation.set(0,.561,0),u.scale.set(3.927,6.285,3.687),this.add(u);let h=new se(t,r);h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),this.add(h);let d=new se(t,r);d.position.set(2.291,-.756,-2.621),d.rotation.set(0,-.286,0),d.scale.set(1.546,1.552,1.496),this.add(d);let f=new se(t,r);f.position.set(-2.193,-.369,-5.547),f.rotation.set(0,.516,0),f.scale.set(3.875,3.487,2.986),this.add(f);let m=new se(t,Hr(50));m.position.set(-16.116,14.37,8.208),m.scale.set(.1,2.428,2.739),this.add(m);let x=new se(t,Hr(50));x.position.set(-16.109,18.021,-8.207),x.scale.set(.1,2.425,2.751),this.add(x);let p=new se(t,Hr(17));p.position.set(14.904,12.198,-1.832),p.scale.set(.15,4.265,6.331),this.add(p);let g=new se(t,Hr(43));g.position.set(-.462,8.89,14.52),g.scale.set(4.38,5.441,.088),this.add(g);let y=new se(t,Hr(20));y.position.set(3.235,11.486,-12.541),y.scale.set(2.5,2,.1),this.add(y);let _=new se(t,Hr(100));_.position.set(0,20,0),_.scale.set(1,.1,1),this.add(_)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Hr(n){let e=new it;return e.color.setScalar(n),e}function It(n){return()=>(n=n*1664525+1013904223>>>0,n/4294967296)}function sn(n,e,t=!0){let i=document.createElement("canvas");i.width=i.height=n,e(i.getContext("2d"),n);let r=new bn(i);return t&&(r.colorSpace=pt),r.wrapS=r.wrapT=Ei,r.anisotropy=8,r}function St(n,e,t,i,r,s,o,a,l=!0){for(let c=0;c<i;c++){let u=t()*e,h=t()*e,d=o+t()*(a-o);n.fillStyle=`rgba(${r},${(s*(.3+.7*t())).toFixed(3)})`;let f=l?[-e,0,e]:[0];for(let m of f)for(let x of f)l&&(Math.abs(u+m-e/2)>e/2+d||Math.abs(h+x-e/2)>e/2+d)||(n.beginPath(),n.arc(u+m,h+x,d,0,7),n.fill())}}function Ms(n,e,t){let i=n.createRadialGradient(e/2,e/2,e*.3,e/2,e/2,e*.72);i.addColorStop(0,"rgba(0,0,0,0)"),i.addColorStop(1,`rgba(20,14,10,${t})`),n.fillStyle=i,n.fillRect(0,0,e,e)}function pc(n,e,t,i,r,s,o){n.strokeStyle=r,n.lineWidth=s;for(let a=0;a<i;a++){n.beginPath();let l=t()*e,c=t()*e;n.moveTo(l,c);for(let u=0;u<6;u++)l+=(t()-.5)*o,c+=(t()-.5)*o,n.lineTo(l,c);n.stroke()}}var Qy=n=>sn(256,(e,t)=>{let i=It(n);e.fillStyle="#dcc699",e.fillRect(0,0,t,t),St(e,t,i,260,"150,120,80",.06,6,26,!1),St(e,t,i,220,"242,226,192",.1,5,20,!1),St(e,t,i,1800,"120,96,66",.1,.6,2,!1),St(e,t,i,900,"250,238,212",.12,.6,1.6,!1),pc(e,t,i,2,"rgba(120,94,62,.4)",1.3,60),Ms(e,t,.12)}),ev=()=>sn(256,(n,e)=>{let t=It(7);n.fillStyle="#15171a",n.fillRect(0,0,e,e);let i=e/4,r=e/2;for(let s=0;s<4;s++){let o=s%2?r/2:0;for(let a=-1;a<3;a++){let l=a*r+o,c=s*i,u=.75+t()*.35;n.fillStyle=`rgb(${90*u|0},${94*u|0},${100*u|0})`;for(let h of[0,e])n.fillRect(l+3-h,c+3,r-6,i-6)}}St(n,e,t,1400,"16,18,22",.25,.7,2.2),St(n,e,t,500,"150,156,166",.14,.7,2),St(n,e,t,60,"20,22,26",.25,4,12)}),tv=()=>sn(256,(n,e)=>{let t=It(11);n.fillStyle="#7a7e86",n.fillRect(0,0,e,e),St(n,e,t,200,"26,28,32",.2,6,24),St(n,e,t,1500,"16,18,20",.25,.6,2),St(n,e,t,600,"140,146,156",.12,.6,1.8)});function nv(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),i=t.createImageData(128,128),r=[[1,2,.3],[3,-1,1.7],[-2,3,4.1],[4,1,2.2],[-3,-4,5.3],[5,-3,.9]],s=(l,c)=>r.reduce((u,[h,d,f],m)=>u+Math.sin(2*Math.PI*(h*l+d*c)/128+f)/(1+m*.6),0),o=new P;for(let l=0;l<128;l++)for(let c=0;c<128;c++){let u=s(c+1,l)-s(c-1,l),h=s(c,l+1)-s(c,l-1);o.set(-u*1.4,-h*1.4,1).normalize();let d=(l*128+c)*4;i.data[d]=(o.x*.5+.5)*255,i.data[d+1]=(o.y*.5+.5)*255,i.data[d+2]=(o.z*.5+.5)*255,i.data[d+3]=255}t.putImageData(i,0,0);let a=new bn(e);return a.wrapS=a.wrapT=Ei,a}var iv=()=>sn(256,(n,e)=>{let t=It(21);n.fillStyle="#1c120d",n.fillRect(0,0,e,e),St(n,e,t,200,"50,30,20",.3,4,18,!1),n.lineCap="round";for(let i=0;i<14;i++){n.strokeStyle=`rgba(${200+t()*55|0},${70+t()*80|0},20,.9)`,n.lineWidth=1+t()*2.5,n.shadowColor="#ff6a10",n.shadowBlur=8,n.beginPath();let r=t()*e,s=t()*e;n.moveTo(r,s);for(let o=0;o<5;o++)r+=(t()-.5)*70,s+=(t()-.5)*70,n.lineTo(r,s);n.stroke()}n.shadowBlur=0,Ms(n,e,.7)}),rv=()=>sn(256,(n,e)=>{let t=It(31);for(let i=0;i<5;i++){let r=.85+t()*.25;n.fillStyle=`rgb(${196*r|0},${150*r|0},${98*r|0})`,n.fillRect(i*e/5,0,e/5,e),n.fillStyle="rgba(60,36,18,.6)",n.fillRect(i*e/5,0,2,e)}for(let i=0;i<160;i++){n.strokeStyle=`rgba(90,58,30,${.08+t()*.15})`,n.lineWidth=.6+t();let r=t()*e;n.beginPath(),n.moveTo(r,0),n.bezierCurveTo(r+(t()-.5)*8,e*.3,r+(t()-.5)*8,e*.7,r+(t()-.5)*6,e),n.stroke()}}),sv=()=>sn(256,(n,e)=>{let t=It(51);n.fillStyle="#3a2414",n.fillRect(0,0,e,e),St(n,e,t,500,"20,12,6",.25,.6,2.4,!1),St(n,e,t,80,"90,60,34",.15,4,16,!1),n.strokeStyle="#d8a640",n.lineWidth=22,n.lineJoin="miter";for(let i of[78,178])n.beginPath(),n.moveTo(40,i+38),n.lineTo(128,i-34),n.lineTo(216,i+38),n.stroke();n.strokeStyle="rgba(0,0,0,.6)",n.lineWidth=10,n.strokeRect(5,5,e-10,e-10)}),ov=()=>sn(256,(n,e)=>{let t=It(61);n.fillStyle="#b6dcea",n.fillRect(0,0,e,e),St(n,e,t,120,"230,246,252",.25,6,30,!1),St(n,e,t,90,"120,170,196",.15,6,24,!1),pc(n,e,t,6,"rgba(250,254,255,.8)",1.6,90),Ms(n,e,.25)}),av=()=>sn(256,(n,e)=>{let t=It(71);n.fillStyle="#6a4626",n.fillRect(0,0,e,e),St(n,e,t,260,"40,24,12",.22,4,20,!1),St(n,e,t,200,"140,98,58",.16,3,14,!1),St(n,e,t,2200,"30,18,8",.25,.6,2,!1),St(n,e,t,40,"170,160,150",.7,2,4.5,!1),Ms(n,e,.45)}),lv=()=>sn(256,(n,e)=>{let t=It(81);n.fillStyle="#5e5a54",n.fillRect(0,0,e,e),St(n,e,t,1600,"30,28,26",.3,.8,3,!1),St(n,e,t,500,"160,154,146",.25,1,4,!1),Ms(n,e,.45)}),cv=()=>{let n=sn(256,(e,t)=>{e.translate(t/2,t/2),e.strokeStyle="rgba(214,200,160,.55)",e.lineWidth=3,e.beginPath();for(let i=0;i<6;i++){let r=i/6*Math.PI*2+.3;e.lineTo(Math.cos(r)*112,Math.sin(r)*112)}e.closePath(),e.stroke();for(let i=0;i<28;i++){let r=i/28*Math.PI*2;e.save(),e.rotate(r),e.translate(76,0),e.rotate(i%2?.6:-.6),e.fillStyle=i%2?"#4f7a3a":"#3d6a30",e.beginPath(),e.ellipse(0,0,14,6,0,0,7),e.fill(),e.restore()}});return n.wrapS=n.wrapT=Nt,n},uv=()=>{let n=sn(256,(e,t)=>{let i=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);i.addColorStop(0,"#f2fbff"),i.addColorStop(.35,"#6fc0ef"),i.addColorStop(1,"#1a4f9a"),e.fillStyle=i,e.fillRect(0,0,t,t),e.translate(t/2,t/2),e.lineCap="round";for(let r=0;r<3;r++){e.strokeStyle="rgba(255,255,255,.85)",e.lineWidth=9,e.beginPath();for(let s=0;s<=60;s++){let o=s/60,a=r*(Math.PI*2/3)+o*4.2,l=8+o*110;e.lineTo(Math.cos(a)*l,Math.sin(a)*l)}e.stroke()}});return n.wrapS=n.wrapT=Nt,n},hv=()=>{let n=sn(256,(e,t)=>{e.fillStyle="#3a1f52",e.fillRect(0,0,t,t),St(e,t,It(91),300,"20,10,30",.3,1,4,!1),e.fillStyle="#e0a838",e.translate(t/2,t/2+18),e.beginPath(),e.roundRect(-46,-30,92,92,30),e.fill();for(let[i,r,s]of[[-34,70,18],[-12,92,19],[12,96,19],[35,78,18]])e.beginPath(),e.roundRect(i-s/2,-30-r,s,r+20,s/2),e.fill();e.save(),e.translate(-50,14),e.rotate(-.8),e.beginPath(),e.roundRect(-11,-58,22,66,11),e.fill(),e.restore()});return n.wrapS=n.wrapT=Nt,n},dv=()=>sn(256,(n,e)=>{let t=It(41);n.fillStyle="#ad9f86",n.fillRect(0,0,e,e),St(n,e,t,300,"60,52,44",.15,4,20,!1),St(n,e,t,1500,"50,44,38",.2,.6,2,!1),pc(n,e,t,4,"rgba(60,50,40,.45)",2,40);let i=(r,s,o)=>{n.save(),n.translate(e/2+r,e/2+s),n.fillStyle=o,n.fillRect(-7,-80,14,160);for(let a of[-1,1])n.beginPath(),n.moveTo(0,-38),n.quadraticCurveTo(a*60,-70,a*78,-50),n.quadraticCurveTo(a*58,0,a*78,50),n.quadraticCurveTo(a*60,70,0,38),n.fill();n.restore()};i(3,3,"rgba(225,210,185,.35)"),i(0,0,"rgba(40,32,26,.4)"),n.strokeStyle="rgba(40,32,26,.6)",n.lineWidth=6,n.strokeRect(10,10,e-20,e-20)}),fv=()=>{let n=sn(64,(e,t)=>{let i=e.createLinearGradient(0,0,0,t);i.addColorStop(0,"rgba(0,0,0,0.85)"),i.addColorStop(.18,"rgba(0,0,0,0.6)"),i.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=i,e.fillRect(0,0,t,t)});return n.wrapS=n.wrapT=Nt,n},pv=()=>{let n=sn(64,(e,t)=>{let i=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);i.addColorStop(0,"rgba(255,220,160,1)"),i.addColorStop(.35,"rgba(255,150,60,.45)"),i.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=i,e.fillRect(0,0,t,t)});return n.wrapS=n.wrapT=Nt,n},Ie=(n,e={})=>new rn({color:n,roughness:.8,metalness:0,...e}),ui=(n,e=.9)=>new it({color:n,transparent:!0,opacity:e,blending:dn,depthWrite:!1}),mv=.022;function gv(){let n=new it({color:656900,side:Pt});return n.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${mv.toFixed(3)};`)},n}function Ld(n){let e=new Nr(n),t=new Jo(n),i=e.fromScene(t,.04).texture;t.dispose(),e.dispose();let r=(c,u=.35,h={})=>Ie(c,{roughness:u,metalness:.85,envMap:i,envMapIntensity:.55,...h}),s={brick:ev(),cap:tv(),water:nv(),ember:iv(),wood:rv(),force:sv(),ice:ov(),dirt:av(),gravel:lv(),wreath:cv(),swirl:uv(),hand:hv(),halo:pv(),ao:fv(),block:dv(),flags:[101,202,303].map(Qy)},o={under:Ie(789e3,{roughness:1}),mortar:Ie(mn().caps?1972242:7232580,{roughness:1}),ao:new it({map:s.ao,transparent:!0,depthWrite:!1}),edge:Ie(789776,{roughness:1,side:Bt}),flags:s.flags.map(c=>Ie(16777215,{map:c,roughness:.88})),ember:Ie(16777215,{map:s.ember,emissiveMap:s.ember,emissive:16742960,emissiveIntensity:.9,roughness:.9}),ice:Ie(10274004,{map:s.ice,roughness:.08,metalness:.1,envMap:i,envMapIntensity:.35}),force:Ie(16777215,{map:s.force,roughness:.7}),dirt:Ie(16777215,{map:s.dirt,roughness:.97}),gravelBed:Ie(16777215,{map:s.gravel,roughness:.95}),pebble:Ie(9076850,{roughness:.9}),water:Ie(1722962,{roughness:.14,metalness:.1,normalMap:s.water,normalScale:new re(.55,.55),emissive:399388,envMap:i,envMapIntensity:.25}),basin:Ie(925216,{roughness:.9}),side:Ie(11843776,{map:s.brick,roughness:.93}),top:Ie(mn().caps?15921128:10791602,{map:s.cap,roughness:.95}),wood:Ie(16777215,{map:s.wood,roughness:.75}),darkWood:Ie(9071178,{map:s.wood,roughness:.8}),iron:r(3025446,.6),bronze:r(12618308,.4,{emissive:2758664}),gold:r(15250496,.3,{emissive:5912064}),stone:Ie(9075818),paleStone:Ie(13285530,{roughness:.85}),dark:Ie(657415),keyColor:{red:Ie(14692382,{roughness:.45,emissive:5901316}),blue:Ie(3108576,{roughness:.45,emissive:794202}),yellow:Ie(15910968,{roughness:.45,emissive:5915648}),green:Ie(3127388,{roughness:.45,emissive:805406})},brownButton:Ie(6962718,{roughness:.55}),redButton:Ie(11545116,{roughness:.45,emissive:2753538}),cream:Ie(15260864,{roughness:.6}),wreath:new rn({map:s.wreath,transparent:!0,roughness:.8,depthWrite:!1}),swirl:new rn({map:s.swirl,emissiveMap:s.swirl,emissive:new We(6994175),emissiveIntensity:.9,roughness:.3}),hand:Ie(16777215,{map:s.hand,roughness:.6}),clay:Ie(11564104,{roughness:.75}),block:Ie(16777215,{map:s.block,roughness:.85}),skin:Ie(12618338,{roughness:.7}),tunic:Ie(2383482,{roughness:.8}),cloak:Ie(9054750),leather:Ie(5913122,{roughness:.8}),steel:r(13225424,.3),heroSkin:Ie(15118472,{roughness:.6,emissive:3020298}),heroTunic:Ie(3117008,{roughness:.55,emissive:666180}),heroCloak:Ie(14170660,{roughness:.65,emissive:4328452}),heroLeather:Ie(9067058,{roughness:.7,emissive:1707012}),heroHair:Ie(5911576,{roughness:.8,emissive:1312770}),heroRing:new it({color:1284676,depthWrite:!1}),heroRingEdge:new it({color:398346,transparent:!0,opacity:.8,depthWrite:!1}),itemShade:new it({color:656900,transparent:!0,opacity:.9,depthWrite:!1}),itemRing:new it({color:16773304,depthWrite:!1}),heroBeam:new it({color:3593324,transparent:!0,opacity:.3,blending:dn,depthTest:!1,depthWrite:!1,side:Bt}),heroXray:new it({color:6090890,transparent:!0,opacity:.6,depthFunc:Jl,depthWrite:!1,stencilWrite:!0,stencilRef:1,stencilFunc:Sh}),outline:gv(),fur:Ie(5912096,{roughness:.9,emissive:1181700}),furDark:Ie(3941396,{roughness:.9}),snout:Ie(6965814),ivory:Ie(14866106,{roughness:.5}),kilt:Ie(11545116,{emissive:2754050}),hoof:Ie(1314832),eye:new it({color:16730650}),statue:Ie(9342088,{roughness:.9}),statueDark:Ie(6973540,{roughness:.92}),parchment:Ie(15785648,{emissive:3024920}),teal:Ie(3193004,{roughness:.4,emissive:670262}),boot:Ie(12596762,{roughness:.55,emissive:3804164}),bootTrim:Ie(14715424,{emissive:5906944}),skate:Ie(13162728,{roughness:.45,emissive:2634300}),suction:Ie(3445854,{roughness:.5,emissive:798234}),mirror:r(15132390,.08,{envMapIntensity:1,emissive:4211784}),gorgon:Ie(3450970,{roughness:.5,emissive:798744}),cake:Ie(15773768,{roughness:.55,emissive:4203528}),hide:Ie(16051938,{roughness:.65,emissive:2894374}),patch:Ie(5911072,{roughness:.8}),feather:Ie(9067058,{roughness:.8,emissive:1970184}),halo:s.halo,env:i},a=new Set([i,...s.flags,...Object.values(s).filter(c=>c instanceof bn)]);for(let c of Object.values(o))c&&typeof c=="object"&&"isMaterial"in c?a.add(c):Array.isArray(c)&&c.forEach(u=>a.add(u));for(let c of Object.values(o.keyColor))a.add(c);return{t:s,m:o,metal:r,std:Ie,keeps:a,dispose:()=>{for(let c of a)c.dispose()}}}var ie=.1,Li=.035,dt=(n,e)=>n-(e-1)/2,mt=(n,e)=>n-(e-1)/2,xv={"force-up":0,"force-left":Math.PI/2,"force-down":Math.PI,"force-right":-Math.PI/2},Dd=26;function Ud(n){let{m:e}=n,t=new we,i=new Xn(.97,.12,.97,2,.02);i.translate(0,ie-.06,0);let r=new Gt(1,1);r.rotateX(-Math.PI/2),r.translate(0,Li,0);let s=new Fr(.045,0),o=new se(new Gt(1,1),e.under);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,t.add(o);let a=new Gt(1,1);a.rotateX(-Math.PI/2);let l=[],c=(h,d,f)=>{let m=new Ro(h,d,Math.max(1,f));return m.count=f,m.receiveShadow=!0,l.push(m),t.add(m),m},u=()=>{for(let h of l)t.remove(h),h.dispose();l=[]};return{group:t,set(h,d,f){u();let m=new Vt([new re(-100,-100),new re(100,-100),new re(100,100),new re(-100,100)]);m.holes.push(new Ci([new re(-f/2,-d/2),new re(-f/2,d/2),new re(f/2,d/2),new re(f/2,-d/2)])),o.geometry.dispose(),o.geometry=new Vn(m);let x=[[],[],[]],p={ember:[],ice:[],force:[],dirt:[],gravel:[],water:[],mortar:[]};h.forEach((b,T)=>{let R=bs[b];p.mortar.push(T),R==="flag"?x[It(T*2654435761+7)()*3|0].push(T):R!=="none"&&p[R].push(T)});let g=new xt,y=new We,_=(b,T,R,v)=>{T.forEach((M,L)=>{let k=It(M*40503+11);if(g.makeRotationY(R(M,k)).setPosition(dt(M%f,f),0,mt(Math.floor(M/f),d)),b.setMatrixAt(L,g),v){let K=.78+k()*.3;b.setColorAt(L,y.setRGB(K*(1+(k()-.5)*.06),K,K*(1-k()*.06)))}})},S=(b,T)=>(T()*4|0)*(Math.PI/2);_(c(a,e.mortar,p.mortar.length),p.mortar,()=>0,!1),x.forEach((b,T)=>_(c(i,e.flags[T],b.length),b,S,!0)),_(c(i,e.ember,p.ember.length),p.ember,S,!1),_(c(i,e.ice,p.ice.length),p.ice,S,!1),_(c(i,e.dirt,p.dirt.length),p.dirt,S,!0),_(c(i,e.gravelBed,p.gravel.length),p.gravel,S,!0),_(c(i,e.force,p.force.length),p.force,b=>xv[h[b]]??0,!1),_(c(r,e.water,p.water.length),p.water,()=>0,!1);let E=p.gravel;if(E.length){let b=c(s,e.pebble,E.length*Dd);b.castShadow=!0;let T=0;for(let R of E){let v=It(R*7919+3);for(let M=0;M<Dd;M++){let L=.7+v()*.5;g.makeScale(L,.6*L,L).setPosition(dt(R%f,f)+(v()-.5)*.8,ie+.015,mt(Math.floor(R/f),d)+(v()-.5)*.8),b.setMatrixAt(T,g),b.setColorAt(T++,y.setScalar(.75+v()*.5))}}}},loop(h){n.t.water.offset.set(Math.sin(h*.5)*.04,h*.025%1),e.water.emissiveIntensity=1+.15*Math.sin(h*1.3)},dispose(){u(),i.dispose(),r.dispose(),s.dispose(),a.dispose(),o.geometry.dispose()}}}var _v=15774761,yv=.08,Nd=.5;function Od(){let n=new fn,e=new Vt;e.moveTo(-.5,-.5).lineTo(.5,-.5).lineTo(.5,.5).lineTo(-.5,.5).lineTo(-.5,-.5);let t=.5-yv,i=new Ci;i.moveTo(-t,-t).lineTo(-t,t).lineTo(t,t).lineTo(t,-t).lineTo(-t,-t),e.holes.push(i);let r=new Vn(e);r.rotateX(-Math.PI/2);let s=new it({color:_v,depthTest:!1,depthWrite:!1,toneMapped:!1,fog:!1}),o=new se(r,s);o.visible=!1,o.renderOrder=2;let a=new we;n.add(o,a);let l=new Map;function c(u){let h=l.get(u);if(h)return h;let d=document.createElement("canvas");d.width=d.height=64;let f=d.getContext("2d");f.fillStyle="rgba(1, 4, 9, 0.78)",f.fillRect(4,4,56,56),f.fillStyle="#f0b429",f.font="bold 44px system-ui, sans-serif",f.textAlign="center",f.textBaseline="middle",f.fillText(u,32,35);let m=new bn(d);m.colorSpace=pt;let x=new Gn({map:m,depthTest:!1,depthWrite:!1,toneMapped:!1,fog:!1});return l.set(u,x),x}return{scene:n,hover(u,h,d){o.visible=u!==null,u&&o.position.set(dt(u.c,h),ie+.01,mt(u.r,d))},marks(u,h,d){a.clear();for(let f of u){let m=new Hn(c(f.mark));m.scale.set(Nd,Nd,1),m.position.set(dt(f.c,h),ie+.05,mt(f.r,d)),m.renderOrder=3,a.add(m)}},empty:()=>!o.visible&&a.children.length===0,dispose(){a.clear(),r.dispose(),s.dispose();for(let u of l.values())u.map?.dispose(),u.dispose();l.clear()}}}function Fd(n,e){let t=[];for(let i=0;i<n.terrain.length;i++)(n.terrain[i]!==e.terrain[i]||n.objects[i]!==e.objects[i])&&t.push(i);return t}function mc(n,e){let t=[];return n.forEach((i,r)=>{i==="water"&&e[r]==="dirt"&&t.push(r)}),t}function kd(n,e){if(n<=0)return e;if(n<.25){let t=n/.25;return e+(-.2-e)*t*t}if(n<.25+.35){let t=(n-.25)/.35;return-.2+(.065- -.2)*(1-(1-t)**3)}return .065}function zd(n,e){return e?0:.012*Math.sin(2*Math.PI*n/3)}var vv=n=>Math.max(0,Math.min(1,n)),bv=.06666666666666667;function Bd(n){return 1-.67*vv(n)}function Gd(n,e,t){let i=e-n;return Math.abs(i)<.005?e:n+i*(1-Math.exp(-t/bv))}function Hd(n,e,t){let i=e?[e]:[];return n==="ghosted"?[...i,...t]:i}var Vd={minotaur:16730682,theseus:3593324,hazard:12614911,item:3859711},Wd=657414,Mv=10;function Xd(n){return Math.max(1,Mv/(Ss*Math.max(n,1e-6)))}var Ss=.18,jo=.3,Sv=.06,wv=.02,Ev=2.4,Tv=new Set(Object.values(kn).map(n=>n.sprite)),Av=new Set(Object.values(En).map(n=>n.sprite).filter(n=>n!==En.block.sprite));function qd(n,e=mn().items){return n.id?.startsWith("machine")?null:n.model==="theseus"?"theseus":n.model==="minotaur"||n.model==="minotaur-stone"?"minotaur":e==="plate"?null:Tv.has(n.model)?"hazard":Av.has(n.model)?"item":null}function Yd(n,e,t=0){let i=e*Math.PI/180;return n*Math.cos(i)+t*Math.sin(i)+Sv}function Kd(n,e){return e?0:-wv*(1-Math.cos(2*Math.PI*n/Ev))}var Zd=.08;function $d(n,e,t,i,r,s,o){let a=(l,c,u)=>c>u?0:Math.max(c,Math.min(u,l))-l;return[a(n,-r+o+t/2,r-o-t/2),a(e,-s+o,s-o-i)]}var Qo=66,KM=Array.from({length:Qo*Qo},(n,e)=>({r:Math.floor(e/Qo)-1,c:e%Qo-1}));function Ts(n,e){let t=n[e],i=n[e+1];return!t||!i||i.jump?null:i.r<t.r?"up":i.r>t.r?"down":i.c<t.c?"left":"right"}function ia(n){return n.length<2?null:Ts(n,0)??n[0].way??null}var As=1.4,Pv=1.2;function ra(n){return 1+.05*(1-Math.cos(2*Math.PI*n/Pv))}function nf(n,e,t){let i=n.getContext("2d"),r=e.rise/e.cell,s=16,o=0;return{size(a,l,c){let u=window.devicePixelRatio||1;s=Math.max(1,Math.round(c*u)),o=Math.round(r*s),n.width=a*s,n.height=l*s+o,n.style.width=`${n.width/u}px`,n.style.height=`${n.height/u}px`,n.dataset.cell=String(c),i.setTransform(1,0,0,1,0,0),i.imageSmoothingEnabled=!0,i.imageSmoothingQuality="high"},paint(a,l,c){i.clearRect(0,0,n.width,n.height);let u=e.cell,h=e.cell+e.rise;for(let d of a){let f=e.sprites[d.sprite];if(!f)continue;let m=Math.round(d.x*s),x=Math.round(d.y*s);if(d.sink){i.save(),i.beginPath(),i.rect(m,x,s,s+o),i.clip(),i.drawImage(t,f.x+d.frame*u,f.y,u,h,m,x+Math.round(d.sink*(s+o)),s,s+o),i.restore();continue}i.drawImage(t,f.x+d.frame*u,f.y,u,h,m,x,s,s+o)}l&&l.length>1&&zv(i,l,s,o,c===void 0?1:ra(c))}}}var Iv="#8f291f",Lv="#bb4131",Dv="#ffd23f",tf="#1c0402",Uv=12,Nv=.42,Ov=.14,Fv=.2,kv={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function zv(n,e,t,i,r){let s=u=>[(u.c+.5)*t,(u.r+.5)*t+i],o=Math.max(1.5,t/12),a=Math.max(.75,t/30);if(n.lineJoin="round",n.lineCap="round",n.beginPath(),e.forEach((u,h)=>{let[d,f]=s(u);h===0||u.jump?n.moveTo(d,f):n.lineTo(d,f)}),n.strokeStyle=tf,n.lineWidth=o+2*a,n.stroke(),n.strokeStyle=Iv,n.lineWidth=o,n.stroke(),t<Uv)return;let l=(u,h,d,f)=>{let m=t*Nv*d,x=t*Ov*d,[p,g]=s(e[u]);n.save(),n.translate(p,g),n.rotate(kv[h]),n.translate(t*Fv,0),n.beginPath(),n.moveTo(m/2,0),n.lineTo(-m/2,-x),n.lineTo(-m/4,0),n.lineTo(-m/2,x),n.closePath(),n.lineWidth=Math.max(1,t/21*d),n.strokeStyle=tf,n.stroke(),n.fillStyle=f,n.fill(),n.restore()};n.lineJoin="miter";for(let u=1;u<e.length;u++){let h=Ts(e,u);h&&l(u,h,1,Lv)}let c=ia(e);c&&l(0,c,As*r,Dv)}function Bv(n,e,t){let i=n.sprites[e];return!i||i.frames<=1||i.fps<=0?0:Math.floor(t*i.fps/1e3)%i.frames}function rf(n,e,t="gate-slide"){let i=n.sprites[t]?.frames??1;return Math.max(-1,Math.min(i,Math.round(e*(i+1))-1))}function Gv(n,e){let t=rf(n,e,"exit-wake");return t<0?{sprite:"exit-off",frame:0}:t>=(n.sprites["exit-wake"]?.frames??1)?{sprite:"exit",frame:0}:{sprite:"exit-wake",frame:t}}function sf(n,e,t,i,r=gs){let s=[],o=(f,m,x)=>s.push({sprite:f,frame:Bv(t,f,i),x:m,y:x}),a=(f,m,x)=>{let p=cc(n,m,f)==="v"?"-v":"",g=rf(t,x),y=t.sprites["gate-slide"]?.frames??1;g<0?o("gate-closed"+p,f,m):g>=y?o("gate-open"+p,f,m):s.push({sprite:"gate-slide"+p,frame:g,x:f,y:m})},l=(f,m,x,p)=>{o(`door-${f}-sill${cc(n,x,m)==="v"?"-v":""}`,m,x),p<1&&s.push({sprite:`door-${f}`,frame:0,x:m,y:x,sink:p})},{rows:c,cols:u}=n.level,h=(f,m)=>!!f&&Math.ceil(f.r-1e-9)===m,d=e.minotaur&&Ko(n,e.minotaur,r.hoof);for(let f=0;f<c;f++){for(let m=0;m<u;m++){let x=n.terrain[f*u+m],p=pn[x].sprites,g=x==="clone"?n.level.machines.find(S=>S.at.r===f&&S.at.c===m):void 0,y=f*u+m,_=pn[x].door??Yo(n,y);g?o(p[tr.indexOf(g.dir)],m,f):x==="gate"?a(m,f,r.bars.get(y)??(n.relicsLeft===0?1:0)):x==="exit"?s.push({...Gv(t,xs(n,r)),x:m,y:f}):_&&(x==="floor"||r.doors.has(y))?l(_,m,f,r.doors.get(y)??1):o(p[0],m,f)}for(let m=0;m<u;m++){let x=n.objects[f*u+m];x==="block"&&e.blocks?.some(p=>p.origin.r===f&&p.origin.c===m)||x&&o(En[x].sprite,m,f)}for(let m of n.level.machines)m.at.r===f&&o(m.template==="block"?En.block.sprite:kn[m.template].sprite,m.at.c,f);for(let m of e.blocks??[])h(m.at,f)&&o(En.block.sprite,m.at.c,m.at.r);for(let m of e.hazards)h(m.at,f)&&o(kn[m.kind].sprite,m.at.c,m.at.r);n.cow&&n.cow.r===f&&o("cow-standing",n.cow.c,f),d&&h(d,f)&&o(n.stone>0?"minotaur-stone":"minotaur",d.c,d.r),h(e.player,f)&&o("theseus",e.player.c,e.player.r)}return s}function of(n){return!(n instanceof HTMLImageElement)||n.complete&&n.naturalWidth>0}function af(n,e,t,i){let r=document.createElement("div");r.className="minimap",r.hidden=!0;let s=document.createElement("canvas");s.id="minimap",s.setAttribute("aria-hidden","true");let o=document.createElement("canvas");o.id="minimap-view",o.setAttribute("role","img"),o.setAttribute("aria-label","Mini map: the whole level from above; the outline is what the camera sees. Tap to look there."),r.append(s,o),n.append(r);let a=nf(s,e,t),l=o.getContext("2d"),c=null,u=null,h=0,d=0,f=0,m=0,x=0,p=1,g=0;function y(){if(!c)return;let L=c.s.level.cols,k=c.s.level.rows,K=cd(h||1280,d||800,L,k);if(L===f&&k===m&&K===x)return;f=L,m=k,x=K,a.size(f,m,x);let I=window.devicePixelRatio||1;o.width=s.width,o.height=s.height,o.style.width=s.style.width,o.style.height=s.style.height,p=s.width/I/f,g=s.height/I-m*p}function _(){!c||!of(t)||a.paint(sf(c.s,c.f,e,0),c.thread??void 0)}function S(){if(!u||!f)return;let L=window.devicePixelRatio||1;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,o.width,o.height),l.setTransform(L,0,0,L,0,0);let k=ld(u.c,u.aspect),K=B=>ud(B,f,m,p,g);l.save(),l.beginPath(),l.rect(0,g,f*p,m*p),l.clip(),l.beginPath(),k.corners.map(K).forEach(([B,O],H)=>H?l.lineTo(B,O):l.moveTo(B,O)),l.closePath(),l.fillStyle="rgba(255,230,180,0.10)",l.fill(),l.lineWidth=1.5,l.strokeStyle="#ffd890",l.stroke();let[I,z]=k.tick.map(K);l.beginPath(),l.moveTo(I[0],I[1]),l.lineTo(z[0],z[1]),l.stroke(),l.restore()}let E=()=>_();of(t)||t.addEventListener("load",E,{once:!0});let b=!1,T=L=>{if(i.blocked()||!f)return;let k=o.getBoundingClientRect();i.look(hd(L.clientX-k.left,L.clientY-k.top,f,m,p,g))},R=L=>{if(!i.blocked()){b=!0;try{o.setPointerCapture(L.pointerId)}catch{}T(L)}},v=L=>{b&&T(L)},M=()=>{b=!1};return o.addEventListener("pointerdown",R),o.addEventListener("pointermove",v),o.addEventListener("pointerup",M),o.addEventListener("pointercancel",M),{show(L){r.hidden=!L},paint(L,k,K){c={s:L,f:k,thread:K},y(),_(),S()},view(L,k){u={c:{...L},aspect:k},S()},fit(L,k){h=L,d=k;let K=x;y(),x!==K&&(_(),S())},dispose(){t.removeEventListener("load",E),r.remove()}}}function lf(){return{q:3,gaps:[],skip:10,fails:[0,0,0,0]}}function Cs(n){n.gaps=[],n.skip=10}function sa(n,e){let t=0;for(let i=n.length-1;i>=0;i--)if(t+=n[i],t>=e)return(n.length-i)*1e3/t;return null}function cf(n,e){if(e>250)return n.q;if(n.skip>0)return n.skip--,n.q;n.gaps.push(e);let t=0,i=0;for(let s=n.gaps.length-1;s>=0&&t<3e3;s--,i++)t+=n.gaps[s];i<n.gaps.length&&(n.gaps=n.gaps.slice(-i));let r=sa(n.gaps,2e3);if(r!==null&&r<40&&n.q>0)n.fails[n.q]++,n.q=n.q-1,Cs(n);else if(n.q<3&&(n.fails[n.q+1]??0)<2){let s=sa(n.gaps,3e3);s!==null&&s>55&&(n.q=n.q+1,Cs(n))}return n.q}function uf(n,e){return n?e:null}function oa(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,l=new Tt,c=0;for(let u=0;u<n.length;++u){let h=n[u],d=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in h.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;s[f]===void 0&&(s[f]=[]),s[f].push(h.attributes[f]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in h.morphAttributes){if(!r.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(h.morphAttributes[f])}if(e){let f;if(t)f=h.index.count;else if(h.attributes.position!==void 0)f=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,u),c+=f}}if(t){let u=0,h=[];for(let d=0;d<n.length;++d){let f=n[d].index;for(let m=0;m<f.count;++m)h.push(f.getX(m)+u);u+=n[d].attributes.position.count}l.setIndex(h)}for(let u in s){let h=hf(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let f=[];for(let x=0;x<o[u].length;++x)f.push(o[u][x][d]);let m=hf(f);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(m)}}return l}function hf(n){let e,t,i,r=-1,s=0;for(let c=0;c<n.length;++c){let u=n[c];if(u.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.array.length}let o=new e(s),a=0;for(let c=0;c<n.length;++c)o.set(n[c].array,a),a+=n[c].array.length;let l=new Yt(o,t,i);return r!==void 0&&(l.gpuType=r),l}var nr=.38,Hv=.16,gc=.26,Vv=.05,Wv={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};function Xv(n){let[e,,t]=An[n].n,i=1.002,r=.5,s=.5-Vv,o=e!==0?[[e*s,i,-.5*e],[e*s,i,.5*e],[e*r,i,.5*e],[e*r,i,-.5*e]]:[[.5*t,i,t*s],[-.5*t,i,t*s],[-.5*t,i,t*r],[.5*t,i,t*r]];return(e<0||t<0)&&o.reverse(),{v:o,n:[0,1,0],uvs:[[0,0],[1,0],[1,1],[0,1]],mat:2}}var An={n:{d:[-1,0],v:[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]],n:[0,0,-1],u:n=>-n[0]},s:{d:[1,0],v:[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]],n:[0,0,1],u:n=>n[0]},w:{d:[0,-1],v:[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]],n:[-1,0,0],u:n=>n[2]},e:{d:[0,1],v:[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]],n:[1,0,0],u:n=>-n[2]}},qv=Object.keys(An);function df(n){let e=[],t=[],i=[],r=[],s=new Tt,o=0;for(let{v:a,n:l,uvs:c,mat:u}of n){let h=e.length/3;a.forEach((d,f)=>{e.push(...d),t.push(...l),i.push(...c[f])}),r.push(h,h+1,h+2,h,h+2,h+3),s.addGroup(o,6,u),o+=6}return s.setAttribute("position",new Ke(e,3)),s.setAttribute("normal",new Ke(t,3)),s.setAttribute("uv",new Ke(i,2)),s.setIndex(r),s}var ff=(n,e,t)=>({v:An[n].v,n:An[n].n,mat:0,uvs:An[n].v.map(i=>[An[n].u([i[0]+e,0,i[2]+t]),i[1]*Wn])}),xc=[];for(let n of[.15,.5,.85])for(let e of[.15,.5,.85])for(let t of[.15,.5,.85])xc.push([n,e,t]);function Yv(n,e,t,i){let r=-1e9,s=1e9;for(let o=0;o<3;o++){if(Math.abs(e[o])<1e-9){if(n[o]<t[o]||n[o]>i[o])return-1;continue}let a=(t[o]-n[o])/e[o],l=(i[o]-n[o])/e[o];if(a>l&&([a,l]=[l,a]),a>r&&(r=a),l<s&&(s=l),r>s)return-1}return r}function pf(n){let e=new we,t=[],i=new Gt(1,gc);i.rotateX(-Math.PI/2);let r=[],s=new Map,o=0,a="solid",l=new P,c=h=>{let d=h.op<.999;for(let f of h.mats)f.transparent!==d&&(f.transparent=d,f.needsUpdate=!0),f.opacity=h.op},u=()=>{for(let h of t){e.remove(h.mesh),h.mesh.geometry.dispose();for(let d of h.inner)d.mesh.geometry.dispose();for(let d of h.mats)d.dispose()}t=[],s.clear();for(let h of r)e.remove(h);r=[]};return{group:e,list:()=>t,at:(h,d)=>s.get(h*o+d),build(h,d,f){u(),o=f;let m=(p,g)=>p<0||g<0||p>=d||g>=o||h[p*o+g]==="wall",x=a==="low"?nr:Wn;for(let p=0;p<d;p++)for(let g=0;g<o;g++){if(h[p*o+g]!=="wall")continue;let y=dt(g,o),_=mt(p,d),S=[{v:[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]],n:[0,1,0],mat:1,uvs:[[y-.5,-_-.5],[y+.5,-_-.5],[y+.5,-_+.5],[y-.5,-_+.5]]}],E=[];for(let M of qv){let[L,k]=An[M].d,K=p+L,I=g+k;if(m(K,I)&&K>=0&&I>=0&&K<d&&I<o?E.push(M):S.push(ff(M,y,_)),m(K,I))continue;S.push(Xv(M));let[z,,B]=An[M].n,O=new se(i,n.m.ao);O.position.set(y+z*(.5+gc/2),ie+.003,_+B*(.5+gc/2)),O.rotation.y=Wv[M],O.renderOrder=1,e.add(O),r.push(O)}let b=[n.m.side.clone(),n.m.top.clone(),n.m.edge.clone()],T=p===0||g===0||p===d-1||g===o-1;if(!T){T=!0;for(let M=-1;M<=1;M++)for(let L=-1;L<=1;L++)m(p+M,g+L)||(T=!1)}T&&b[1].color.multiplyScalar(Hv);let R=new se(df(S),b);R.position.set(y,0,_),R.scale.y=x,R.castShadow=R.receiveShadow=!0,e.add(R);let v={r:p,c:g,x:y,z:_,mesh:R,mats:b,op:1,target:1,inner:[]};for(let M of E){let L=new se(df([ff(M,y,_)]),[b[0]]);L.visible=!1,R.add(L),v.inner.push({k:M,mesh:L,nb:null})}t.push(v),s.set(p*o+g,v)}for(let p of t)for(let g of p.inner){let[y,_]=An[g.k].d;g.nb=s.get((p.r+y)*o+p.c+_)??null}},setMode(h){a=h;let d=h==="low"?nr:Wn;for(let f of t)f.mesh.scale.y=d},aim(h,d){let f=new Map,m=a==="low"?nr:Wn;h.getWorldDirection(l);let x=[l.x,l.y,l.z],p=30,g=Math.max(3.2,m/Math.max(.05,-x[1]/Math.hypot(x[0],x[2]))+1.2);for(let y of d){let _=t.filter(E=>Math.abs(E.x-y.x)<g&&Math.abs(E.z-y.z)<g);if(_.length===0)continue;let S=new Map;for(let[E,b,T]of xc){let R=[y.x-y.half+2*y.half*E,ie+y.h*b,y.z-y.half+2*y.half*T],v=[R[0]-x[0]*p,R[1]-x[1]*p,R[2]-x[2]*p];for(let M of _){let L=Yv(v,x,[M.x-.49,0,M.z-.49],[M.x+.49,m,M.z+.49]);L>=0&&L<p-.01&&S.set(M,(S.get(M)??0)+1)}}for(let[E,b]of S)f.set(E,Math.max(f.get(E)??0,b/xc.length))}for(let y of t){let _=Math.min(1,Math.max(0,((f.get(y)??0)-.03)/.45));y.target=Bd(_*_*(3-2*_))}},ease(h,d){let f=!1;for(let m of t)m.op!==m.target&&(m.op=d?m.target:Gd(m.op,m.target,h),f=!0,c(m));if(f)for(let m of t)for(let x of m.inner)x.mesh.visible=!!x.nb&&x.nb.op<.999&&m.op>x.nb.op+.02;return f},dispose(){u(),i.dispose()}}}var Cn=(n,e,t,i)=>(n.position.set(e,t,i),n);function _c(n,e,t,i=!1){let r=document.createElement("canvas");r.width=n,r.height=e,t(r.getContext("2d"));let s=new bn(r);return s.colorSpace=pt,s.wrapS=s.wrapT=i?Ei:Nt,s}function aa(n,e){return _c(128,128,t=>{let i=t.createRadialGradient(64,64,0,64,64,64);i.addColorStop(0,n),i.addColorStop(.5,e),i.addColorStop(1,"rgba(0,0,0,0)"),t.fillStyle=i,t.fillRect(0,0,128,128)})}function Zv(){return _c(128,256,n=>{let e=n.createLinearGradient(0,0,128,0);e.addColorStop(0,"#0b5fa8"),e.addColorStop(.5,"#bfe9ff"),e.addColorStop(1,"#0b5fa8"),n.fillStyle=e,n.fillRect(0,0,128,256),n.strokeStyle="rgba(255,255,255,0.35)",n.lineWidth=3;for(let t=0;t<8;t++){n.beginPath();for(let i=0;i<=128;i+=4)n.lineTo(i,t*32+10*Math.sin(i/20+t));n.stroke()}},!0)}var gf=[[[32,12,32,52],[32,26,18,14],[32,26,46,14]],[[22,12,22,52],[22,14,44,30],[44,30,22,44]],[[18,52,32,12],[32,12,46,52],[22,36,42,36]],[[32,12,32,52],[18,22,46,42],[46,22,18,42]]];function $v(n){return _c(64,64,e=>{let t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,200,80,0.55)"),t.addColorStop(1,"rgba(255,170,40,0)"),e.fillStyle=t,e.fillRect(0,0,64,64),e.strokeStyle="#b87400",e.lineWidth=6,e.lineCap="round";for(let[i,r,s,o]of gf[n])e.beginPath(),e.moveTo(i,r),e.lineTo(s,o),e.stroke()})}function Jv(n,e,t,i,r,s,o){n.add(Cn(e(.2,.06,.2,i),0,ie+.03,s)),n.add(Cn(t(.065,.075,o,i),0,ie+.06+o/2,s)),n.add(Cn(e(.2,.07,.2,r),0,ie+.06+o+.035,s))}function mf(n,e){let t=new Vt;t.moveTo(-n,ie),t.lineTo(-n,e),t.absarc(0,e,n,Math.PI,0,!0),t.lineTo(n,ie),t.lineTo(-n,ie);let i=new Vn(t,24);return i.rotateY(Math.PI/2),i}function xf(n,e,t){let i=new we,r=[],s=new rn({color:15920352,roughness:.55}),o=.36,a=.62;for(let $ of[-o,o])Jv(i,e,t,s,n.m.gold,$,a);let l=ie+.06+a+.07,c=new se(new nn(o,.06,8,24,Math.PI),s);c.scale.z=1.6,c.rotation.y=Math.PI/2,i.add(Cn(c,0,l,0)),i.add(Cn(e(.16,.14,.1,n.m.gold),0,l+o+.02,0));let u=new rn({color:2502715,roughness:.9,transparent:!0,side:Bt}),h=Cn(new se(mf(.3,l),u),.015,0,0);r.push(h);let d=Zv(),f=new it({map:d,transparent:!0,opacity:.92,side:Bt,depthWrite:!1}),m=mf(.3,l);m.translate(0,-ie,0);let x=Cn(new se(m,f),0,ie,0);r.push(x);let p=new se(new nn(.42,.03,6,40),s);p.rotation.x=Math.PI/2,i.add(Cn(p,0,ie+.012,0));let g=new se(new $i(.42,40),new rn({color:9077624,roughness:.95}));g.rotation.x=-Math.PI/2,i.add(Cn(g,0,ie+.006,0));let y=new it({map:aa("rgba(190,235,255,1)","rgba(30,120,210,0.95)"),transparent:!0,opacity:.95,depthWrite:!1}),_=new se(new $i(.42,40),y);_.rotation.x=-Math.PI/2,r.push(Cn(_,0,ie+.015,0));let S=new it({map:aa("rgba(150,215,255,0.8)","rgba(40,130,220,0.3)"),transparent:!0,opacity:.7,blending:dn,depthWrite:!1,side:Bt}),E=new se(new Gt(1.1,1.3),S);E.rotation.y=Math.PI/2,r.push(Cn(E,.01,l-.05,0));let b=($,Q,pe,V,oe)=>{let de=new Hn($);return de.scale.set(Q,Q,1),de.visible=!1,r.push(Cn(de,pe,V,oe)),de},T=$=>new Gn({map:$,transparent:!0,opacity:0,blending:dn,depthWrite:!1}),R=9,v=[],M=gf.map(($,Q)=>$v(Q));for(let $ of[-1,1])for(let Q=0;Q<R;Q++){let pe=(Q+.5)/R,V=pe*(Math.PI/2),oe=o+.07,de=M[(Q+($>0?R:0))%M.length],ge=new Gn({map:de,transparent:!0,opacity:0,depthWrite:!1});v.push({m:b(ge,.13,-.05,l+Math.sin(V)*oe,$*Math.cos(V)*oe),u:pe})}let L=b(T(aa("rgba(255,248,210,1)","rgba(255,190,60,0.6)")),.5,-.1,l+o+.02,0),k=aa("rgba(230,248,255,1)","rgba(120,200,255,0.5)"),K=qh.map($=>({d:$,m:b(T(k),.08,$.x,ie,$.z)})),I=($,Q)=>{$.material.opacity=Q,$.visible=Q>.01},z=1,B=null,O=.92,H=.95,j=()=>{let $=B,Q=$===null?z:qo($);x.visible=_.visible=E.visible=Q>.001,h.visible=Q<.999,u.opacity=1-Q,x.scale.y=Q,_.scale.setScalar(Math.max(.001,Q)),f.opacity=O*Q,y.opacity=H*Q,S.opacity=.7*Q;for(let V of v)I(V.m,$===null?.1575*z:Xh($,V.u));let pe=$===null?0:Wh($);I(L,pe),L.scale.setScalar(.25+.5*pe);for(let{d:V,m:oe}of K){let{o:de,up:ge}=$===null?{o:0,up:0}:Yh($,V);I(oe,de),oe.visible&&(oe.position.y=ie+.05+ge*V.rise)}};return j(),{g:i,live:r,h:l+.45,loop:$=>{d.offset.y=$*.06%1,O=.86+.08*Math.sin($*1.4),H=.85+.1*Math.sin($*1.4+1),j()},light:$=>{z=Math.min(1,Math.max(0,$)),B=null,j()},wake:$=>{z=1,B=Math.max(0,$),j()}}}var J=(n,e,t,i)=>(n.position.set(e,t,i),n),jv=(n,e,t,i=14)=>new Sn(n,e,t,i),Be=(n,e,t,i,r=14)=>new se(jv(n,e,t,r),i),Ze=(n,e,t,i)=>new se(new en(n,e,t),i),ir=n=>(n.rotation.x=Math.PI/2,n);function Qv(n){n.updateMatrixWorld(!0);let e=new Map;n.traverse(i=>{if(!(i instanceof se))return;let r=i.geometry.clone().applyMatrix4(i.matrixWorld);r.index&&(r=r.toNonIndexed());for(let o of Object.keys(r.attributes))o!=="position"&&o!=="normal"&&o!=="uv"&&r.deleteAttribute(o);let s=i.material;e.set(s,[...e.get(s)??[],r]),i.geometry.dispose()});let t=new we;for(let[i,r]of e){let s=new se(oa(r),i);r.forEach(o=>o.dispose()),s.castShadow=s.receiveShadow=!0,t.add(s)}return t}function ca(n,e){let t=[];for(let i of e.children)i instanceof se&&!i.userData.live&&t.push(new se(i.geometry,n.m.outline));return e.add(...t),e}function kt(n,e,t=[]){let i=Qv(n);return t.length&&i.add(...t),i.userData=e,i}var qn=()=>Object.assign(new we,{userData:{half:0,h:0}}),yc=n=>(n.wall(n.r-1,n.c)||n.wall(n.r+1,n.c))&&!(n.wall(n.r,n.c-1)&&n.wall(n.r,n.c+1));function Di(n,e,t){let{m:i}=n.kit,r=i.keyColor[e],s=new we,o=1.1,a=.26;s.add(J(Ze(1,.008,a+.08,i.dark),0,ie+.003,0)),s.add(J(Ze(.98,.012,a,r),0,ie+.007,0));let l=new we;l.add(J(Ze(1,o,a,i.wood),0,o/2,0)),l.add(J(Ze(1,.06,a+.02,i.iron),0,.34,0)),l.add(J(Ze(1,.16,a+.02,r),0,.8,0)),l.add(J(Ze(1,.1,a+.02,r),0,.06,0)),l.add(J(Ze(1,.04,a+.02,r),0,o+.02,0)),l.add(J(Ze(.16,.18,a+.04,i.iron),.24,.55,0)),l.add(ir(J(Be(.05,.05,a+.08,r,12),.24,.55,0))),l.traverse(h=>{h instanceof se&&(h.castShadow=h.receiveShadow=!0)});let c=h=>{l.position.y=-(o+.14)*h,l.visible=h<1};c(t?1:0);let u=bf(n,[l]);return yc(n)&&(s.rotation.y=Math.PI/2),kt(s,{half:.4,h:t?.02:o,tall:!t,open:c},u)}var Rs=null;function eb(){if(Rs)return Rs;let n=128,e=document.createElement("canvas");e.width=e.height=n;let t=e.getContext("2d");t.fillStyle="#050302",t.fillRect(0,0,n,n);let i=(o,a,l,c,u,h,d,f,m)=>{let x=t.createLinearGradient(u,h,d,f);x.addColorStop(0,m),x.addColorStop(1,"#0a0604"),t.fillStyle=x,t.fillRect(o,a,l-o,c-a)},r=n*.2;i(0,0,n,r,0,0,0,r,"#6a5236"),i(0,n-r,n,n,0,n,0,n-r,"#2a1e14"),i(0,0,r,n,0,0,r,0,"#4a3826"),i(n-r,0,n,n,n,0,n-r,0,"#4a3826"),t.fillStyle="#1e160f",t.fillRect(r,r,n-2*r,n-2*r);let s=It(7);for(let o=0;o<14;o++)t.fillStyle=["#3a2c1e","#2c2116","#4a3a28"][o%3],t.beginPath(),t.ellipse(r+s()*(n-2*r),r+s()*(n-2*r),3+s()*5,2+s()*4,s()*3,0,Math.PI*2),t.fill();return Rs=new bn(e),Rs.colorSpace=pt,Rs}function _f(n,e){let{m:t}=n.kit,i=new we,r=.7,s=.06,o=new se(new Gt(1,r),new it({map:eb()}));o.rotation.x=-Math.PI/2,i.add(J(o,0,ie+.004,0));for(let c of[-1,1])i.add(J(Ze(1,.07,.15,t.paleStone),0,ie+.035,c*(r/2+.075))),i.add(J(Ze(1,.012,.02,t.dark),0,ie+.072,c*(r/2+.005)));let a=[];for(let c=0;c<lc;c++){let u=-r/2+r*(c+.5)/lc;for(let h of[-1,1]){let d=J(Be(s,s,.5,t.bronze,12),0,ie+.06,u);d.rotation.z=Math.PI/2,d.castShadow=d.receiveShadow=!0,d.userData.side=h,a.push(d)}}let l=c=>{for(let u of a)u.visible=c>.01,u.scale.y=Math.max(.01,c),u.position.x=u.userData.side*(.5-.25*c)};return l(e?1:0),yc(n)&&(i.rotation.y=Math.PI/2),kt(i,{half:.5,h:.15,open:l},bf(n,a))}function bf(n,e){let t=new we;return t.add(...e),yc(n)&&(t.rotation.y=Math.PI/2),[t]}function tb(n){let e=xf(n.kit,Ze,Be),[t,i]=Rd(n.wall,n.r,n.c);e.g.rotation.y=Math.atan2(t,-i);let r=new we;return r.add(...e.live),r.rotation.y=e.g.rotation.y,kt(e.g,{half:.45,h:e.h,tall:!0,loop:e.loop,open:e.light,wake:e.wake},[r])}function yf(n,e){let{m:t}=n.kit,i=new we;if(e){i.add(J(Ze(.8,.72-.04,.8,t.dark),0,ie+.72/2,0));for(let s of[ie+.04,ie+.72-.04])i.add(J(Ze(.92,.08,.92,t.darkWood),0,s,0));for(let s of[-1,1])for(let o of[-1,1])i.add(J(Ze(.1,.72,.1,t.darkWood),s*.41,ie+.72/2,o*.41));for(let s=0;s<4;s++){let o=-.27+s*.18;for(let a of[-1,1])i.add(J(Ze(.07,.72-.12,.05,t.wood),o,ie+.72/2,a*.43)),i.add(J(Ze(.05,.72-.12,.07,t.wood),a*.43,ie+.72/2,o));i.add(J(Ze(.07,.04,.8,t.wood),o,ie+.72-.01,0))}return kt(i,{half:.46,h:.72+.1})}i.add(J(Ze(.84,.02,.84,t.dark),0,ie+.005,0));for(let r of[-1,1])i.add(J(Ze(.88,.04,.07,t.darkWood),0,ie+.02,r*.42)),i.add(J(Ze(.07,.04,.88,t.darkWood),r*.42,ie+.02,0));for(let r=0;r<4;r++)i.add(J(Ze(.08,.035,.8,t.wood),-.27+r*.18,ie+.018,0));return kt(i,{half:.42,h:.06})}function Mf(n,e,t=.3){let i=new we;return i.add(J(Be(t,t+.03,.05,n,28),0,ie+.025,0)),i.add(J(Be(t-.05,t-.04,.03,e,28),0,ie+.06,0)),i}function nb(n){let{m:e}=n.kit,t=new we;t.add(J(Be(.28,.31,.05,e.iron,24),0,ie+.025,0));let i=J(new se(new On(.21,20,10,0,Math.PI*2,0,Math.PI/2),e.brownButton),0,ie+.04,0);return i.scale.y=.55,t.add(i),kt(t,{half:.3,h:.16})}function vf(n,e){let{m:t}=n.kit,i=Mf(t.bronze,e);return i.add(ir(J(new se(new nn(.15,.018,8,32),t.cream),0,ie+.077,0))),i.add(J(Be(.05,.055,.04,t.bronze,16),0,ie+.08,0)),kt(i,{half:.3,h:.12})}function ib(n){let{m:e}=n.kit,t=Mf(e.bronze,e.dark,.34);for(let i=0;i<12;i++){let r=i/12*Math.PI*2;t.add(J(new se(new Zt(.028,.12,6),e.iron),Math.cos(r)*.22,ie+.13,Math.sin(r)*.22))}return t.add(J(Be(.1,.11,.04,e.bronze,16),0,ie+.09,0)),kt(t,{half:.34,h:.2})}function rb(n){let{m:e}=n.kit,t=new we;t.add(J(Be(.07,.08,.03,e.gold,18),0,ie+.015,0));let i=kt(t,{half:.4,h:.05}),r=new se(new Gt(.9,.9),e.wreath);return r.rotation.x=-Math.PI/2,r.position.y=ie+.003,r.receiveShadow=!0,i.add(r),i}function sb(n){let{m:e}=n.kit,t=new we;t.add(J(Ze(.78,.04,.78,e.paleStone),0,ie+.02,0));for(let i of[-1,1])t.add(J(Ze(.9,.09,.07,e.darkWood),0,ie+.045,i*.42)),t.add(J(Ze(.07,.09,.9,e.darkWood),i*.42,ie+.045,0));return kt(t,{half:.45,h:.1})}function ob(n){let{m:e}=n.kit,t=new we;t.add(J(Be(.36,.38,.06,e.bronze,32),0,ie+.03,0));let i=kt(t,{half:.36,h:.1}),r=J(Be(.3,.3,.02,e.swirl,32),0,ie+.065,0);return r.receiveShadow=!0,i.add(r),i.userData.loop=s=>{r.rotation.y=-s*1.6},i}function ab(n){let{m:e}=n.kit,t=new we;t.add(J(Be(.36,.38,.06,e.gold,32),0,ie+.03,0));let i=J(Be(.3,.3,.02,e.hand,32),0,ie+.065,0);return i.rotation.y=Math.PI,t.add(i),kt(t,{half:.36,h:.1})}function lb(n){let{m:e}=n.kit,t=new we,i=[[0,0],[.12,0],[.2,.08],[.22,.2],[.18,.32],[.08,.4],[.07,.46],[.09,.48],[0,.48]].map(([a,l])=>new re(a,l));t.add(J(new se(new Or(i,24),e.clay),0,ie,0)),t.add(ir(J(new se(new nn(.205,.012,6,28),e.dark),0,ie+.22,0)));let r=J(Be(.012,.012,.12,e.dark,6),.02,ie+.53,0);r.rotation.z=-.3,t.add(r);let s=J(new se(new Zt(.035,.1,8),ui(16760928)),.04,ie+.62,0),o=kt(t,{half:.22,h:.6},[s]);return o.userData.loop=a=>s.scale.set(1,1+.2*Math.sin(a*9),1),o}function la(n,e){let{m:t}=n.kit,i=new we;i.add(J(new se(new Xn(.86,.36,.86,2,.03),t.darkWood),0,ie+.18,0)),i.add(J(Ze(.64,.02,.64,t.dark),0,ie+.365,0));for(let a of[-1,1])for(let l of[-1,1])i.add(J(Be(.03,.03,.02,t.gold,10),a*.37,ie+.365,l*.37));let r=new Vt;r.moveTo(0,.24),r.lineTo(.17,.04),r.lineTo(.07,.04),r.lineTo(.07,-.22),r.lineTo(-.07,-.22),r.lineTo(-.07,.04),r.lineTo(-.17,.04),r.closePath();let s=new se(new ji(r,{depth:.025,bevelEnabled:!1}),t.gold);s.rotation.x=-Math.PI/2,s.position.y=ie+.37;let o=new we;return o.add(s),o.rotation.y=e,i.add(o),kt(i,{half:.43,h:.4})}function cb(n){let e=new we,t=It(n.r*31+n.c),i=[];for(let s=0;s<5;s++){let o=.3+t()*.28,a=J(new se(new Zt(.08+t()*.05,o,7),ui(s%2?16738848:16756816,.8)),(t()-.5)*.55,ie+o/2,(t()-.5)*.55);i.push(a),e.add(a)}let r=t()*6.28;return e.userData={half:.4,h:.5,loop:s=>i.forEach((o,a)=>o.scale.set(1,1+.12*Math.sin(s*(6+a)+r+a),1))},e}var Sf={floor:qn,wall:qn,water:qn,ice:qn,dirt:qn,gravel:qn,"force-up":qn,"force-down":qn,"force-left":qn,"force-right":qn,exit:tb,fire:cb,"gate-closed":n=>_f(n,!1),"gate-open":n=>_f(n,!0),safe:rb,button:nb,trap:ib,popup:sb,teleport:ob,thief:ab,bomb:lb,"toggle-open":n=>yf(n,!1),"toggle-closed":n=>yf(n,!0),"door-red":n=>Di(n,"red",!1),"door-blue":n=>Di(n,"blue",!1),"door-yellow":n=>Di(n,"yellow",!1),"door-green":n=>Di(n,"green",!1),"door-red-sill":n=>Di(n,"red",!0),"door-blue-sill":n=>Di(n,"blue",!0),"door-yellow-sill":n=>Di(n,"yellow",!0),"door-green-sill":n=>Di(n,"green",!0),"button-brown":n=>vf(n,n.kit.m.brownButton),"button-red":n=>vf(n,n.kit.m.redButton),"clone-up":n=>la(n,0),"clone-left":n=>la(n,Math.PI/2),"clone-down":n=>la(n,Math.PI),"clone-right":n=>la(n,-Math.PI/2)};function Ui(n,e){n.traverse(t=>{if(t instanceof Hn){e.keeps.has(t.material)||t.material.dispose();return}if(!(t instanceof se))return;t.geometry.dispose();let i=Array.isArray(t.material)?t.material:[t.material];for(let r of i)e.keeps.has(r)||r.dispose()})}var on=(n,e,t=16,i=12)=>new se(new On(n,t,i),e);function Tf(n,e,t){let i=new Vt;i.moveTo(n[0][0],n[0][1]);for(let[s,o]of n.slice(1))i.lineTo(s,o);i.closePath();let r=new ji(i,{depth:e,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-e/2),new se(r,t)}function Ps(n,e,t,i,r=0,s=[]){let o=t.h*i;e.position.y-=ie;let a=new we;a.position.set(0,ie,o/2*Math.sin(r)),a.rotation.x=-r,a.scale.setScalar(i),a.add(e);let l=new we;return l.add(a),ca(n,kt(l,{...t,half:Math.max(t.half*i,o/2*Math.sin(r)),h:o*Math.cos(r),back:o*Math.sin(r)/2},s))}var vc=.45,ub=.035;function Af(n,e){return n.rotation.x=-Math.PI/2,n.position.y=ie+e,n.userData.live=!0,n}var ha=(n,e=.42)=>Af(new se(new $i(e,32),n.m.itemShade),.006);function Yn(n,e,t,i,r=0){let s=mn().items==="plate",o=[ha(n,s?vc:.42)];return s&&o.push(Af(new se(new Ri(vc-ub,vc,48),n.m.itemRing),.008)),Ps(n,e,t,s?i*1.12:i,r,o)}function hb(n){let{m:e}=n,t=new we;t.add(J(Be(.11,.13,.04,e.bronze,18),0,ie+.02,0)),t.add(J(Be(.02,.022,.66,e.darkWood,8),0,ie+.35,0)),t.add(J(on(.03,e.gold,10,8),0,ie+.7,0));for(let i of[-1,1]){let r=Tf([[.02,.05],[.12,.08],[.21,.17],[.16,0],[.21,-.17],[.12,-.08],[.02,-.05]].map(([s,o])=>[i*s,o]),.03,e.gold);t.add(J(r,0,ie+.5,0))}return t.add(J(Be(.035,.035,.12,e.gold,10),0,ie+.5,0)),Yn(n,t,{half:.22,h:.72},1.2,.85)}function ua(n,e){let{m:t}=n,i=new we;i.add(J(new se(new nn(.075,.03,10,20),t.keyColor[e]),0,.2,0)),i.add(ir(J(Be(.05,.05,.034,t.keyColor[e],16),0,.2,0))),i.add(J(Ze(.035,.24,.03,t.bronze),0,0,0)),i.add(J(Ze(.07,.03,.03,t.bronze),.035,-.08,0)),i.add(J(Ze(.05,.03,.03,t.bronze),.025,-.03,0)),i.position.y=ie+.2,i.rotation.z=.25;let r=new we;return r.add(i),Yn(n,r,{half:.12,h:.42},2.05,1.1)}function db(n){let{m:e}=n,t=new we,i=new Vt;i.moveTo(0,0),i.bezierCurveTo(.08,.02,.1,.2,.07,.32),i.lineTo(-.07,.32),i.bezierCurveTo(-.1,.2,-.08,.02,0,0);let r=new ji(i,{depth:.025,bevelEnabled:!1});for(let s of[-1,1]){let o=new se(r,e.teal);o.rotation.x=-Math.PI/2+.35,o.rotation.z=s*.2,o.position.set(s*.1,ie+.03,.14),t.add(o),t.add(J(Ze(.1,.07,.1,e.teal),s*.1,ie+.06,.14))}return Yn(n,t,{half:.24,h:.2},1.8)}function bc(n,e,t,i){let r=new we;for(let s of[-1,1]){let o=new we,a=i?.(o)??0;o.add(J(Ze(.09,.2,.09,e),0,a+.12,0)),o.add(J(Ze(.09,.06,.17,e),0,a+.03,.04)),o.add(J(Ze(.1,.045,.1,t),0,a+.225,0)),o.position.set(s*.09,ie,0),o.rotation.y=s*.2,r.add(o)}return r}function fb(n){let{m:e}=n,t=bc(n,e.boot,e.bootTrim,i=>(i.add(J(new se(new Zt(.025,.07,6),e.gold),0,.11,.05)),0));return Yn(n,t,{half:.2,h:.28},1.9,.7)}function pb(n){let{m:e}=n,t=bc(n,e.skate,e.cream,i=>{i.add(J(Ze(.02,.05,.24,e.steel),0,.025,.04));for(let r of[-.04,.12])i.add(J(Ze(.03,.03,.03,e.steel),0,.05,r));return .05});return Yn(n,t,{half:.2,h:.32},1.8,.7)}function mb(n){let{m:e}=n,t=bc(n,e.suction,e.bootTrim,i=>(i.add(J(Be(.1,.07,.035,e.bronze,18),0,.018,.03)),.035));return Yn(n,t,{half:.22,h:.3},1.8,.7)}function gb(n){let{m:e}=n,t=new we,i=new we;i.position.set(0,ie+.32,0),i.rotation.x=-.25,i.add(ir(Be(.13,.13,.02,e.mirror,28))),i.add(new se(new nn(.13,.02,8,28),e.bronze));let r=J(on(.045,e.gorgon,12,10),0,0,.012);r.scale.z=.5,i.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;i.add(J(on(.014,e.gorgon,6,5),Math.cos(o)*.08,Math.sin(o)*.08,.012))}return t.add(i),t.add(J(Be(.018,.025,.2,e.bronze,8),0,ie+.1,0)),t.add(J(Be(.08,.09,.025,e.bronze),0,ie+.012,0)),Yn(n,t,{half:.18,h:.48},1.55,.9)}function xb(n){let{m:e}=n,t=new we;t.add(J(Be(.24,.22,.03,e.bronze,24),0,ie+.015,0)),t.add(J(Be(.17,.19,.16,e.cake,24),0,ie+.11,0)),t.add(J(Be(.165,.17,.02,e.cream,24),0,ie+.2,0));for(let i=0;i<8;i++){let r=i/8*Math.PI*2;t.add(J(on(.022,e.cream,8,6),Math.cos(r)*.12,ie+.215,Math.sin(r)*.12))}return t.add(J(on(.035,e.cake,10,8),0,ie+.22,0)),Yn(n,t,{half:.24,h:.26},1.4,.35)}function wf(n,e,t=0,i=!1){let{m:r}=n,s=new we;s.add(J(Ze(.56,.05,.3,r.wood),0,.1,0));for(let l of[-1,1])for(let c of[-1,1])s.add(ir(J(Be(.07,.07,.03,r.darkWood,14),l*.2,.07,c*.165))),s.add(J(Be(.028,.025,.14,r.hide,8),l*.16,.18,c*.08));s.add(J(new se(new Xn(.46,.22,.24,2,.05),r.hide),0,.34,0));for(let[l,c,u,h]of[[-.1,0,.3,1],[.1,.05,.3,1],[-.04,.12,1,.3],[.12,-.12,1,.3],[-.14,-.12,1,.3]]){let d=J(on(.075,r.patch,10,8),l,h===1?.44:.35,c);d.scale.set(1,u,h),s.add(d)}s.add(J(new se(new Xn(.14,.15,.15,2,.03),r.hide),.29,.43,0)),s.add(J(Ze(.06,.08,.12,r.snout),.37,.4,0));for(let l of[-1,1]){let c=J(new se(new Zt(.02,.08,6),r.ivory),.28,.53,l*.06);c.rotation.x=l*.5,s.add(c)}let o=J(Be(.012,.012,.16,r.patch,6),-.25,.36,0);o.rotation.z=-.4,s.add(o),s.position.y=ie,s.rotation.y=.5;let a=new we;return a.add(s),(i?Yn:Ps)(n,a,{half:.32,h:.56},e,t)}function _b(n){let{m:e}=n,t=new we;t.add(J(Ze(.26,.008,.14,e.parchment),.02,ie+.006,.08));let i=J(Be(.06,.06,.34,e.parchment,14),0,ie+.06,-.02);i.rotation.z=Math.PI/2,t.add(i);for(let s of[-1,1]){let o=J(Be(.035,.035,.012,e.darkWood,10),s*.172,ie+.06,-.02);o.rotation.z=Math.PI/2,t.add(o)}let r=J(Be(.064,.064,.05,e.cloak,14),-.08,ie+.06,-.02);return r.rotation.z=Math.PI/2,t.add(r),t.rotation.y=.3,Yn(n,t,{half:.2,h:.14},1.9,.5)}function yb(n){let e=new we;return e.add(J(new se(new Xn(.84,.8,.84,3,.05),n.m.block),0,ie+.4,0)),kt(e,{half:.42,h:.9})}function vb(n){let{m:e}=n,t=new we,i=ie+.22;t.add(J(on(.22,e.bronze,24,16),0,i,0));let r=J(new se(new nn(.222,.012,6,32),e.gold),0,i,0);r.rotation.y=Math.PI/2,t.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;t.add(J(on(.022,e.gold,6,5),Math.cos(o)*.222,i,Math.sin(o)*.222)),s%2===0&&t.add(J(on(.02,e.gold,6,5),0,i+Math.cos(o+.3)*.224,Math.sin(o+.3)*.224))}return Ps(n,t,{half:.24,h:.46},1.45,0,[ha(n)])}function bb(n){let{m:e}=n,t=new we,i=ie+.4,r=J(on(.12,e.feather,16,12),0,i,-.02);r.scale.set(.9,1.15,.85),t.add(r),t.add(J(on(.075,e.skin,14,10),0,i+.17,.03));let s=J(on(.082,e.furDark,14,8),0,i+.19,.01);s.scale.set(1,.8,1),t.add(s);for(let a of[-1,1]){t.add(J(on(.012,e.dark,6,5),a*.028,i+.18,.1));let l=Tf([[.06,.08],[.24,.16],[.4,.14],[.38,.06],[.33,.08],[.33,-.01],[.26,.02],[.24,-.08],[.17,-.03],[.12,-.1],[.06,-.04]].map(([c,u])=>[a*c,u]),.025,e.feather);l.position.set(0,i+.04,-.04),l.rotation.x=-.9,t.add(l),t.add(J(Be(.014,.012,.16,e.bootTrim,6),a*.04,i-.18,.02))}let o=J(new se(new Zt(.06,.16,6),e.feather),0,i-.1,-.12);return o.rotation.x=-2.4,t.add(o),Ps(n,t,{half:.36,h:.66},1.05,0,[ha(n)])}var Ef=1.35;function Mb(n){let e=new we;e.add(J(on(.13,n.m.bootTrim,12,8),0,ie+.14,0));let t=[],i=J(on(.16,ui(13647888,.5),16,12),0,ie+.17,0);t.push(i);for(let o=0;o<7;o++){let a=o/7*Math.PI*2,l=.24+o%3*.06,c=J(new se(new Zt(.08,l,7),ui(o%2?13122060:14182424,.7)),Math.cos(a)*.12,ie+l/2+.04,Math.sin(a)*.12);c.rotation.z=-Math.cos(a)*.3,c.rotation.x=Math.sin(a)*.3,t.push(c)}let r=new we;for(let o of t)o.position.y-=ie;r.add(...t),r.position.y=ie,r.scale.setScalar(Ef),r.userData.live=!0;let s=Ps(n,e,{half:.26,h:.5},Ef,0,[r,ha(n)]);return s.userData.loop=o=>t.forEach((a,l)=>a.scale.set(1,1+.15*Math.sin(o*(7+l)+l*1.7),1)),s}var da={relic:hb,"key-red":n=>ua(n,"red"),"key-blue":n=>ua(n,"blue"),"key-yellow":n=>ua(n,"yellow"),"key-green":n=>ua(n,"green"),flippers:db,"fire-boots":fb,skates:pb,suction:mb,mirror:gb,cake:xb,cow:n=>wf(n,1.1,.35,!0),"cow-standing":n=>wf(n,1.1),page:_b,block:yb,ball:vb,glider:bb,fireball:Mb};var hi=(n,e,t=16,i=12)=>new se(new On(n,t,i),e);function Pf(n,e,t,i=1.3,r=[]){e.scale.setScalar(i),e.position.y=ie;let s=new we;return s.add(e),ca(n,kt(s,t,r))}function Sb(n,e,t){let i=[];for(let s of e.children){if(!(s instanceof se)||s.userData.live||s.material===n.m.outline)continue;let o=s.material;o.stencilWrite=!0,o.stencilRef=1,o.stencilZPass=Mh;let a=new se(s.geometry,n.m.heroXray);a.renderOrder=20,a.userData.live=!0,i.push(a)}let r=new se(new Sn(.16,.24,2.2,24,1,!0),n.m.heroBeam);r.position.y=ie+t+.25+1.1,r.renderOrder=21,r.userData.live=!0,e.add(...i,r)}var Mc=1.45;function wb(n){let{m:e}=n,t=new we;for(let u of[-1,1])t.add(J(Be(.045,.04,.28,e.heroSkin),u*.065,.14,0)),t.add(J(Ze(.07,.05,.12,e.heroLeather),u*.065,.025,.02));t.add(J(Be(.13,.2,.22,e.heroTunic),0,.35,0)),t.add(J(Be(.155,.13,.22,e.heroTunic),0,.55,0)),t.add(J(Be(.16,.16,.035,e.heroLeather),0,.45,0));let i=J(Ze(.3,.44,.03,e.heroCloak),0,.44,-.14);i.rotation.x=.12,t.add(i);for(let u of[-1,1]){let h=J(Be(.04,.035,.26,e.heroSkin),u*.19,.5,.02);h.rotation.z=u*.18,t.add(h)}t.add(J(hi(.095,e.heroSkin),0,.75,0)),t.add(J(new se(new On(.103,18,10,0,Math.PI*2,0,Math.PI/2),e.heroHair),0,.765,-.012));let r=J(Be(.15,.15,.03,e.bronze,24),-.26,.5,.04);r.rotation.z=Math.PI/2,t.add(r);let s=J(Be(.06,.06,.035,e.heroCloak,16),-.275,.5,.04);s.rotation.z=Math.PI/2,t.add(s);let o=J(Ze(.03,.34,.012,e.steel),.23,.5,.1);o.rotation.x=.5,t.add(o),t.add(J(Ze(.09,.02,.03,e.bronze),.23,.37,.03));let a=(u,h,d,f)=>{let m=new se(new Ri(u,h,48),d);return m.rotation.x=-Math.PI/2,m.position.y=ie+f,m.userData.live=!0,m},l=[a(.33,.47,e.heroRingEdge,.01),a(.36,.44,e.heroRing,.012)],c=Pf(n,t,{half:.26*Mc/1.3,h:1.2*Mc/1.3},Mc,l);return mn().beacon&&Sb(n,c,c.userData.h),c}var Sc=1.08,Eb=.24;function Cf(n,e){let{m:t}=n,i=x=>e?t.statue:x,r=i(t.fur),s=e?t.statueDark:t.furDark,o=new we;for(let x of[-1,1]){let p=x*-.05;o.add(J(Be(.06,.068,.05,i(t.hoof)),x*.13,.025,p+.01));let g=J(Be(.05,.06,.26,r),x*.125,.18,p);g.rotation.z=x*.04,o.add(g);let y=J(Be(.09,.062,.26,r),x*.11,.42,p*.6);y.rotation.z=-x*.1,o.add(y)}o.add(J(Be(.15,.2,.14,i(t.kilt)),0,.54,0));let a=J(new se(new nn(.155,.02,8,24),i(t.gold)),0,.605,0);a.rotation.x=Math.PI/2,o.add(a);let l=J(new we,0,.6,0);l.rotation.x=Eb,o.add(l),l.add(J(Be(.21,.15,.2,r),0,.09,0));let c=J(hi(.25,r),0,.29,.01);c.scale.set(1.42,.85,.92),l.add(c);let u=J(hi(.17,s),0,.42,-.06);u.scale.set(1.5,.66,1),l.add(u);for(let x of[-1,1]){l.add(J(hi(.12,r),x*.29,.39,0));let p=J(Be(.088,.072,.26,r),x*.325,.24,.01);p.rotation.z=x*.1,l.add(p);let g=J(Be(.074,.06,.24,r),x*.335,.04,.07);g.rotation.x=-.45,l.add(g),l.add(J(hi(.072,s),x*.33,-.08,.13)),l.add(J(Be(.076,.076,.035,i(t.gold)),x*.33,.14,.03))}let h=J(new we,0,.45,.13);h.rotation.x=.3,l.add(h);let d=hi(.125,s);d.scale.set(1.05,.95,1.15),h.add(d);let f=J(hi(.085,i(t.snout)),0,-.05,.12);f.scale.set(1.1,.8,.95),h.add(f),h.add(J(new se(new nn(.035,.008,6,16),i(t.gold)),0,-.1,.19));for(let x of[-1,1]){h.add(J(hi(.02,e?t.statueDark:t.eye,8,6),x*.065,.03,.115));let p=J(hi(.04,s),x*.14,.02,-.03);p.scale.set(1.3,.6,.8),h.add(p);let g=new us([new P(x*.08,.06,0),new P(x*.24,.07,-.03),new P(x*.37,.15,.01),new P(x*.42,.3,.1)]);h.add(new se(new Oo(g,20,.036,8),i(t.ivory)));let y=J(new se(new Zt(.036,.11,8),i(t.ivory)),x*.425,.36,.125);y.rotation.x=.35,y.rotation.z=-x*.15,h.add(y)}let m=new we;m.add(Be(.02,.02,1,i(t.iron),8));for(let x of[-1,1]){let p=new se(new Sn(.17,.17,.022,24,1,!1,0,Math.PI),i(t.steel));p.rotation.z=Math.PI/2,p.rotation.y=x>0?0:Math.PI,p.position.set(0,.36,0),p.scale.set(1,1,.8),m.add(p)}return m.rotation.set(-.12,Math.PI/2,0),m.position.set(.33,.1,.13),l.add(m),Pf(n,o,{half:.42*Sc/1.3,h:1.6*Sc/1.3},Sc)}var wc={theseus:wb,minotaur:n=>Cf(n,!1),"minotaur-stone":n=>Cf(n,!0)},Tb={...da,...wc},Ab=new Set([...Pd,"ball","glider","fireball"]),Cb={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2},Rb=1.5,Pb=.05,Rf={y:.37,scale:.7},Ib=n=>Math.atan2(Math.sin(n),Math.cos(n));function If(n,e){let t=new we,i=[],r=(f,m,x)=>{let p=qd(f),g=x.userData;return p?e.make(p,m,g.h,g.back??0):null};function s(f){f.foot.set(f.obj.position.x,ie+f.y,f.obj.position.z)}function o(f){let m=Tb[f.model](n);return f.id?.startsWith("machine")&&m.scale.setScalar(Rf.scale),t.add(m),m}function a(f,m){let x=f.id?.startsWith("machine")?Rf.y:0,p=o(f),g=new P;return{model:f.model,id:f.id,obj:p,marker:r(f,g,p),foot:g,r:f.r,c:f.c,yaw:m,goal:m,y:x}}function l(f){t.remove(f.obj),Ui(f.obj,n),f.marker&&e.group.remove(f.marker)}function c(f,m){l(f),f.model=m.model,f.obj=o(m),f.marker=r(m,f.foot,f.obj)}function u(f,m,x,p){let g=!1,y=new Set(i),_=new Map,S=new Map(i.filter(R=>R.id).map(R=>[R.id,R]));for(let R of f){let v=R.id?S.get(R.id):void 0;v&&(y.delete(v),_.set(R,v))}let E=[];for(let R of f)if(!_.has(R))for(let v of y){let M=Math.hypot(v.r-R.r,v.c-R.c);v.model===R.model&&M<=Rb&&E.push([M,R,v])}E.sort((R,v)=>R[0]-v[0]);for(let[,R,v]of E)_.has(R)||!y.has(v)||(y.delete(v),v.id=R.id,_.set(R,v));for(let R of y)l(R),g=!0;let b=f.find(R=>R.model==="theseus"),T=[];for(let R of f){let v=_.get(R);if(!v){let k=R.dir?Cb[R.dir]:R.id==="minotaur"&&b?Math.atan2(b.c-R.c,b.r-R.r):0;v=a(R,k),g=!0}v.model!==R.model&&(c(v,R),g=!0);let M=R.r-v.r,L=R.c-v.c;Math.abs(M)+Math.abs(L)>1e-6&&(Ab.has(v.model)&&(v.goal=Math.atan2(L,M)),g=!0),v.r=R.r,v.c=R.c,p&&(v.yaw=v.goal),v.obj.position.set(dt(v.c,m),v.y,mt(v.r,x)),v.obj.rotation.y=v.yaw,s(v),T.push(v)}return i=T,g}function h(f,m){let x=!1;for(let p of i){let g=Ib(p.goal-p.yaw);if(Math.abs(g)<.001){p.yaw=p.goal,p.obj.rotation.y=p.yaw;continue}p.yaw=m?p.goal:p.yaw+g*(1-Math.exp(-f/Pb)),p.obj.rotation.y=p.yaw,x=!0}return x}function d(){for(let f of i)l(f);i=[]}return{group:t,set:u,ease:h,seen(){let f=x=>{let p=x.obj.userData;return{x:x.obj.position.x,z:x.obj.position.z,half:p.half,h:p.h}},m=i.find(x=>x.model==="theseus");return{hero:m?f(m):null,rest:i.filter(x=>x!==m).map(f)}},hero:()=>i.find(f=>f.model==="theseus")?.obj??null,loop(f){for(let m of i)m.obj.userData.loop?.(f)},looping:()=>i.flatMap(f=>f.marker||f.obj.userData.loop?[f.obj]:[]),clear:d,dispose:d}}var Of=.8,Df=ie+Of-Li,Uf=9,Ub=9,Nf=13823214;function Ff(n){let e=new we,t=new Fr(.05,0),i=new Ri(.82,1,40);i.rotateX(-Math.PI/2);let r=new Map,s=0,o=(u,h)=>{u.block.position.y=Li+h-(ie+Of)};function a(u){let h=u.splash;if(h){for(let d of[h.ring,...h.drops])e.remove(d),d.material.dispose();u.splash=null}}function l(u,h,d){let f=It(u*2246822519+5),m=new se(i,new it({color:Nf,transparent:!0,depthWrite:!1}));m.position.set(h,Li+.004,d),m.scale.setScalar(.35),e.add(m);let x=[],p=[];for(let g=0;g<Uf;g++){let y=(g+f()*.6)/Uf*Math.PI*2,_=.55+f()*.45;p.push([Math.cos(y)*_,Math.sin(y)*_,1.6+f()*.8]);let S=new se(t,new it({color:Nf,transparent:!0,depthWrite:!1}));S.position.set(h,Li,d),e.add(S),x.push(S)}return{t0:null,ring:m,drops:x,flight:p}}function c(u){let h=r.get(u);h&&(a(h),e.remove(h.block),Ui(h.block,n),r.delete(u))}return{group:e,set(u,h,d,f){let m=!1,x=new Set(u);for(let p of[...r.keys()])x.has(p)||(c(p),m=!0);for(let p of u){if(r.has(p))continue;let g=dt(p%h,h),y=mt(Math.floor(p/h),d),_=da.block(n);_.position.set(g,0,y),e.add(_);let S={block:_,x:g,z:y,splash:f?l(p,g,y):null};o(S,f?Df:.065+s),r.set(p,S),m=!0}return m},splashing:()=>[...r].filter(([,u])=>u.splash).map(([u])=>u),frame(u){let h=!1;for(let d of r.values()){let f=d.splash;if(!f)continue;f.t0??=u;let m=(u-f.t0)/1e3;if(m>=Math.max(.4,.25+.35)){a(d),o(d,.065+s);continue}h=!0,o(d,kd(m,Df));let x=Math.min(1,m/.4);f.ring.scale.setScalar(.35+.35*(1-(1-x)**2)),f.ring.material.opacity=.75*(1-x),f.drops.forEach((p,g)=>{let[y,_,S]=f.flight[g],E=Li+S*m-Ub/2*m*m;p.visible=x<1&&E>=Li,p.position.set(d.x+y*m,E,d.z+_*m),p.material.opacity=.9*(1-x*x)})}return h},loop(u,h){s=zd(u,h);for(let d of r.values())d.splash||o(d,.065+s)},cells:()=>[...r.keys()].sort((u,h)=>u-h),clear(){for(let u of[...r.keys()])c(u)},dispose(){this.clear(),t.dispose(),i.dispose()}}}var Nb=Math.PI/6;function kf(){let n=new fn,e=new we,t=Ss/2,i=jo,r=new Or([new re(0,0),new re(t,i*.6),new re(0,i)],6),s=new Map,o=mn().items==="white";for(let[d,f]of Object.entries(Vd)){let m=o&&d==="item"?16777215:f;s.set(d,new Fo({color:m,emissive:m,emissiveIntensity:.45,specular:16777215,shininess:80,flatShading:!0,transparent:!0,opacity:.9,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1}))}let a=new it({color:Wd,side:Pt,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1});a.onBeforeCompile=d=>{d.vertexShader=d.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${o?"0.04":"0.022"};`)};let l=new ci(16777215,2.2);n.add(new zo(16777215,.7),l,e);let c=new P,u=new P,h=new P;return{scene:n,group:e,make(d,f,m,x=0){let p=new se(r,s.get(d));p.userData={kind:d,foot:f,h:m,back:x},p.renderOrder=10;let g=new se(r,a);return g.renderOrder=9,p.add(g),e.add(p),p},place(d,f,m,x,p){let g=Xd(p);c.setFromMatrixColumn(d.matrixWorld,0),u.setFromMatrixColumn(d.matrixWorld,1),h.setFromMatrixColumn(d.matrixWorld,2),l.position.copy(h).multiplyScalar(3).addScaledVector(u,2).addScaledVector(c,-1.5);let y=Kd(m,x);for(let _ of e.children){let S=_.userData;_.position.copy(S.foot).addScaledVector(u,Yd(S.h,f,S.back)+y),_.quaternion.copy(d.quaternion),_.rotateY(Nb),_.scale.setScalar(g)}return g},dispose(){e.clear(),r.dispose();for(let d of s.values())d.dispose();a.dispose()}}}var Ob={"door-red":fa,"door-blue":fa,"door-yellow":fa,"door-green":fa,"gate-closed":zf,"gate-open":zf,exit:(n,e)=>di(new wn(5945599,4,4,1.6),n,.4,e)};function fa(n,e){return di(new wn(16756848,1.6,2.6,1.8),n,.9,e+.6)}function zf(n,e){return di(new wn(16760944,1.2,2.5,1.8),n,1,e)}function di(n,e,t,i){return n.position.set(e,t,i),n}var Bf=n=>n.endsWith("-sill")?"sill":n.startsWith("door")?"door":n.startsWith("gate")?"gate":n;function Tc(n,e,t,i,r){let{m:s}=n,o=new we,a=[];o.add(new Br(10131616,2761760,2.4));let l=Math.hypot(i,t)/2+1.5,c=new ci(11581648,1.6);c.position.set(-6,14,8),c.castShadow=!0,c.shadow.mapSize.set(2048,2048),Object.assign(c.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:1,far:40+l}),c.shadow.camera.updateProjectionMatrix(),c.shadow.bias=-8e-4,o.add(c,c.target);let u=new wn(16758904,5.5,5.5,1.6);u.castShadow=!0,u.shadow.mapSize.set(512,512),u.shadow.bias=-.004,o.add(u);let h=[],d=[],f=Math.min(8,Math.max(3,Math.round(t*i/37))),m=["s","e","w","n"],x=[];for(let E of r)for(let b of m){let[T,R]=An[b].d,v=E.r+T,M=E.c+R;v<0||M<0||v>=t||M>=i||e[v*i+M]!=="floor"||x.push({w:E,k:b,r:v,c:M,pri:m.indexOf(b)})}x.sort((E,b)=>E.pri-b.pri||E.r-b.r||E.c-b.c);let p=[];for(let E of x){if(p.length>=f)break;p.some(b=>Math.max(Math.abs(b.r-E.r),Math.abs(b.c-E.c))<4)||p.push(E)}let g=new Gn({map:s.halo,blending:dn,depthWrite:!1,transparent:!0,opacity:.55});a.push(g),p.forEach(({w:E,k:b},T)=>{let[R,,v]=An[b].n,M=new we;M.position.set(E.x+R*.5,0,E.z+v*.5),M.add(di(new se(new en(.08,.2,.08),s.iron),R*.04,.82,v*.04)),M.add(di(new se(new Sn(.05,.03,.12,8),s.iron),R*.1,.92,v*.1));let L=di(new se(new Zt(.055,.2,8),ui(16747056)),R*.1,1.07,v*.1),k=di(new se(new Zt(.03,.12,8),ui(16769184)),R*.1,1.04,v*.1);a.push(L.material,k.material);let K=new Hn(g);K.scale.setScalar(.7),K.position.set(R*.12,1.05,v*.12),M.add(L,k,K);for(let z of M.children)z instanceof se&&z.material===s.iron&&(z.castShadow=!0);o.add(M);let I=di(new wn(16754788,4,6,1.7),M.position.x+R*.45,1.05,M.position.z+v*.45);o.add(I),d.push({g:M,flames:[L,k],halo:K,light:I,base:4,ph:T*2.39}),h.push(new P(M.position.x,1,M.position.z))});let y=[],_=[];e.forEach((E,b)=>{if(E!=="fire")return;let T=Math.floor(b/i),R=b%i,v=_.at(-1);v&&v.r===T&&v.c1===R-1?v.c1=R:_.push({r:T,c0:R,c1:R}),h.push(new P(dt(R,i),ie+.2,mt(T,t)))});for(let E of _){let b=E.c1-E.c0+1,T=di(new wn(16742960,3+b*1.2,3+b*.8,1.6),(dt(E.c0,i)+dt(E.c1,i))/2,.8,mt(E.r,t));o.add(T),y.push({light:T,base:T.intensity,ph:E.r})}e.forEach((E,b)=>{(E==="water"||E==="teleport")&&h.push(new P(dt(b%i,i),ie,mt(Math.floor(b/i),t)))});let S=new Map;return e.forEach((E,b)=>{let T=Ob[E];if(!T)return;let R=T(dt(b%i,i),mt(Math.floor(b/i),t));o.add(R),S.set(b,{light:R,base:R.intensity,kind:Bf(E)})}),{group:o,anchors:h,hero(E,b){u.position.set(E,1.5,b+.1)},setMode(E){for(let b of d)b.g.visible=E!=="low",b.light.position.y=E==="low"?.7:1.05},piece(E,b){let T=S.get(E);T&&(T.light.intensity=Bf(b)===T.kind?T.base:0)},portal(E,b){let T=S.get(E);T?.kind==="exit"&&(T.light.intensity=T.base*b)},shadows(E){c.castShadow=E,u.castShadow=E},loop(E){for(let b of d){let T=1+.07*Math.sin(E*7.1+b.ph)+.04*Math.sin(E*12.7+b.ph*2);b.flames.forEach(R=>R.scale.set(1,T,1)),b.light.intensity=b.base*(1+.1*Math.sin(E*6.3+b.ph)+.05*Math.sin(E*11.1))}g.opacity=.5+.06*Math.sin(E*5);for(let b of y)b.light.intensity=b.base*(1+.1*Math.sin(E*5.7+b.ph))},dispose(){o.traverse(E=>{E instanceof se&&E.geometry.dispose(),(E instanceof ci||E instanceof wn)&&E.shadow.map?.dispose()});for(let E of a)E.dispose()}}}var Ac={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new re(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
		precision highp float;

		uniform sampler2D tDiffuse;

		uniform vec2 resolution;

		varying vec2 vUv;

		// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)

		//----------------------------------------------------------------------------------
		// File:        es3-keplerFXAAassetsshaders/FXAA_DefaultES.frag
		// SDK Version: v3.00
		// Email:       gameworks@nvidia.com
		// Site:        http://developer.nvidia.com/
		//
		// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.
		//
		// Redistribution and use in source and binary forms, with or without
		// modification, are permitted provided that the following conditions
		// are met:
		//  * Redistributions of source code must retain the above copyright
		//    notice, this list of conditions and the following disclaimer.
		//  * Redistributions in binary form must reproduce the above copyright
		//    notice, this list of conditions and the following disclaimer in the
		//    documentation and/or other materials provided with the distribution.
		//  * Neither the name of NVIDIA CORPORATION nor the names of its
		//    contributors may be used to endorse or promote products derived
		//    from this software without specific prior written permission.
		//
		// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ''AS IS'' AND ANY
		// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
		// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
		// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
		// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
		// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
		// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
		// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
		// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
		// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
		// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		//
		//----------------------------------------------------------------------------------

		#ifndef FXAA_DISCARD
			//
			// Only valid for PC OpenGL currently.
			// Probably will not work when FXAA_GREEN_AS_LUMA = 1.
			//
			// 1 = Use discard on pixels which don't need AA.
			//     For APIs which enable concurrent TEX+ROP from same surface.
			// 0 = Return unchanged color on pixels which don't need AA.
			//
			#define FXAA_DISCARD 0
		#endif

		/*--------------------------------------------------------------------------*/
		#define FxaaTexTop(t, p) texture2D(t, p, -100.0)
		#define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), -100.0)
		/*--------------------------------------------------------------------------*/

		#define NUM_SAMPLES 5

		// assumes colors have premultipliedAlpha, so that the calculated color contrast is scaled by alpha
		float contrast( vec4 a, vec4 b ) {
			vec4 diff = abs( a - b );
			return max( max( max( diff.r, diff.g ), diff.b ), diff.a );
		}

		/*============================================================================

									FXAA3 QUALITY - PC

		============================================================================*/

		/*--------------------------------------------------------------------------*/
		vec4 FxaaPixelShader(
			vec2 posM,
			sampler2D tex,
			vec2 fxaaQualityRcpFrame,
			float fxaaQualityEdgeThreshold,
			float fxaaQualityinvEdgeThreshold
		) {
			vec4 rgbaM = FxaaTexTop(tex, posM);
			vec4 rgbaS = FxaaTexOff(tex, posM, vec2( 0.0, 1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaE = FxaaTexOff(tex, posM, vec2( 1.0, 0.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaN = FxaaTexOff(tex, posM, vec2( 0.0,-1.0), fxaaQualityRcpFrame.xy);
			vec4 rgbaW = FxaaTexOff(tex, posM, vec2(-1.0, 0.0), fxaaQualityRcpFrame.xy);
			// . S .
			// W M E
			// . N .

			bool earlyExit = max( max( max(
					contrast( rgbaM, rgbaN ),
					contrast( rgbaM, rgbaS ) ),
					contrast( rgbaM, rgbaE ) ),
					contrast( rgbaM, rgbaW ) )
					< fxaaQualityEdgeThreshold;
			// . 0 .
			// 0 0 0
			// . 0 .

			#if (FXAA_DISCARD == 1)
				if(earlyExit) FxaaDiscard;
			#else
				if(earlyExit) return rgbaM;
			#endif

			float contrastN = contrast( rgbaM, rgbaN );
			float contrastS = contrast( rgbaM, rgbaS );
			float contrastE = contrast( rgbaM, rgbaE );
			float contrastW = contrast( rgbaM, rgbaW );

			float relativeVContrast = ( contrastN + contrastS ) - ( contrastE + contrastW );
			relativeVContrast *= fxaaQualityinvEdgeThreshold;

			bool horzSpan = relativeVContrast > 0.;
			// . 1 .
			// 0 0 0
			// . 1 .

			// 45 deg edge detection and corners of objects, aka V/H contrast is too similar
			if( abs( relativeVContrast ) < .3 ) {
				// locate the edge
				vec2 dirToEdge;
				dirToEdge.x = contrastE > contrastW ? 1. : -1.;
				dirToEdge.y = contrastS > contrastN ? 1. : -1.;
				// . 2 .      . 1 .
				// 1 0 2  ~=  0 0 1
				// . 1 .      . 0 .

				// tap 2 pixels and see which ones are "outside" the edge, to
				// determine if the edge is vertical or horizontal

				vec4 rgbaAlongH = FxaaTexOff(tex, posM, vec2( dirToEdge.x, -dirToEdge.y ), fxaaQualityRcpFrame.xy);
				float matchAlongH = contrast( rgbaM, rgbaAlongH );
				// . 1 .
				// 0 0 1
				// . 0 H

				vec4 rgbaAlongV = FxaaTexOff(tex, posM, vec2( -dirToEdge.x, dirToEdge.y ), fxaaQualityRcpFrame.xy);
				float matchAlongV = contrast( rgbaM, rgbaAlongV );
				// V 1 .
				// 0 0 1
				// . 0 .

				relativeVContrast = matchAlongV - matchAlongH;
				relativeVContrast *= fxaaQualityinvEdgeThreshold;

				if( abs( relativeVContrast ) < .3 ) { // 45 deg edge
					// 1 1 .
					// 0 0 1
					// . 0 1

					// do a simple blur
					return mix(
						rgbaM,
						(rgbaN + rgbaS + rgbaE + rgbaW) * .25,
						.4
					);
				}

				horzSpan = relativeVContrast > 0.;
			}

			if(!horzSpan) rgbaN = rgbaW;
			if(!horzSpan) rgbaS = rgbaE;
			// . 0 .      1
			// 1 0 1  ->  0
			// . 0 .      1

			bool pairN = contrast( rgbaM, rgbaN ) > contrast( rgbaM, rgbaS );
			if(!pairN) rgbaN = rgbaS;

			vec2 offNP;
			offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;
			offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;

			bool doneN = false;
			bool doneP = false;

			float nDist = 0.;
			float pDist = 0.;

			vec2 posN = posM;
			vec2 posP = posM;

			int iterationsUsed = 0;
			int iterationsUsedN = 0;
			int iterationsUsedP = 0;
			for( int i = 0; i < NUM_SAMPLES; i++ ) {
				iterationsUsed = i;

				float increment = float(i + 1);

				if(!doneN) {
					nDist += increment;
					posN = posM + offNP * nDist;
					vec4 rgbaEndN = FxaaTexTop(tex, posN.xy);
					doneN = contrast( rgbaEndN, rgbaM ) > contrast( rgbaEndN, rgbaN );
					iterationsUsedN = i;
				}

				if(!doneP) {
					pDist += increment;
					posP = posM - offNP * pDist;
					vec4 rgbaEndP = FxaaTexTop(tex, posP.xy);
					doneP = contrast( rgbaEndP, rgbaM ) > contrast( rgbaEndP, rgbaN );
					iterationsUsedP = i;
				}

				if(doneN || doneP) break;
			}


			if ( !doneP && !doneN ) return rgbaM; // failed to find end of edge

			float dist = min(
				doneN ? float( iterationsUsedN ) / float( NUM_SAMPLES - 1 ) : 1.,
				doneP ? float( iterationsUsedP ) / float( NUM_SAMPLES - 1 ) : 1.
			);

			// hacky way of reduces blurriness of mostly diagonal edges
			// but reduces AA quality
			dist = pow(dist, .5);

			dist = 1. - dist;

			return mix(
				rgbaM,
				rgbaN,
				dist * .5
			);
		}

		void main() {
			const float edgeDetectionQuality = .2;
			const float invEdgeDetectionQuality = 1. / edgeDetectionQuality;

			gl_FragColor = FxaaPixelShader(
				vUv,
				tDiffuse,
				resolution,
				edgeDetectionQuality, // [0,1] contrast needed, otherwise early discard
				invEdgeDetectionQuality
			);

		}
	`};var Fb="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",kb=`
uniform sampler2D tDiffuse; uniform float exposure; uniform vec2 res; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){
  vec3 col = pow(aces(texture2D(tDiffuse, vUv).rgb * exposure), vec3(1.0/2.2));
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = col * vec3(1.02, 1.0, 0.96) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  gl_FragColor = vec4(col, 1.0);
}`;function Gf(n){let e=new Bn(-1,1,1,-1,0,1),t=new tn({uniforms:{tDiffuse:{value:null},exposure:{value:1.4},res:{value:new re(1,1)}},vertexShader:Fb,fragmentShader:kb,depthTest:!1,depthWrite:!1}),i=new tn({uniforms:{tDiffuse:{value:null},resolution:{value:new re}},vertexShader:Ac.vertexShader,fragmentShader:Ac.fragmentShader,depthTest:!1,depthWrite:!1}),r=new se(new Gt(2,2),t);r.frustumCulled=!1;let s=new fn;s.add(r);let o=new Qt(1,1,{type:Ki,samples:4,stencilBuffer:!0}),a=new Qt(1,1);return{setSize(l,c){o.setSize(l,c),a.setSize(l,c),t.uniforms.res.value.set(l,c),i.uniforms.resolution.value.set(1/l,1/c)},render(l,c,u){n.setRenderTarget(o),n.render(l,c),r.material=t,t.uniforms.tDiffuse.value=o.texture,n.setRenderTarget(u?a:null),n.render(s,e),u&&(r.material=i,i.uniforms.tDiffuse.value=a.texture,n.setRenderTarget(null),n.render(s,e))},dispose(){o.dispose(),a.dispose(),t.dispose(),i.dispose(),r.geometry.dispose()}}}var Hf=9382175,zb=12271921,Bb=16765503,Vf=1836034,ga=.03,Cc=ie+.035,xa=Cc+ga+.01,Wf=xa+.006,Gb=.42,Hb=.2,Vb=.2,Xf=1.32,pa={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function ma(n){let e=Gb*n,t=Hb*n,i=new Vt;return i.moveTo(e/2,0),i.lineTo(-e/2,t),i.lineTo(-e/4,0),i.lineTo(-e/2,-t),i.closePath(),new Vn(i).rotateX(-Math.PI/2).translate(Vb,0,0)}function qf(){let n=new we,e=new rn({color:Hf,roughness:.7,emissive:Hf,emissiveIntensity:.35}),t=new it({color:zb}),i=new it({color:Vf}),r=new it({color:Bb,depthTest:!1}),s=new it({color:Vf,depthTest:!1}),o=[],a=null,l="",c=()=>{for(let h of o)h.parent?.remove(h),h.geometry.dispose();o.length=0,a&&n.remove(a.mesh),a=null},u=(h,d)=>{if(h.length===0)return null;let f=h.map(x=>x.index?x.toNonIndexed():x),m=new se(oa(f),d);return h.forEach(x=>x.dispose()),f.forEach(x=>x.dispose()),o.push(m),n.add(m),m};return{group:n,set(h,d,f){let m=h&&h.length>1?`${d}x${f}:${h.map(E=>`${E.jump?"^":""}${E.r},${E.c}${E.way??""}`).join(" ")}`:"";if(m===l)return!1;if(l=m,c(),!h||h.length<2)return!0;let x=h.map(E=>[dt(E.c,d),mt(E.r,f)]),p=[],g=[],y=[];x.forEach(([E,b],T)=>{p.push(new On(ga,8,6).translate(E,Cc,b));let R=Ts(h,T);if(!R)return;let[v,M]=x[T+1],L=v-E,k=M-b,K=Math.hypot(L,k),I=new Sn(ga,ga,K,8,1,!0);I.rotateZ(Math.PI/2),I.rotateY(-Math.atan2(k,L)),I.translate(E+L/2,Cc,b+k/2),p.push(I),T!==0&&(y.push(ma(Xf).rotateY(-pa[R]).translate(E,xa,b)),g.push(ma(1).rotateY(-pa[R]).translate(E,Wf,b)))});let _=u(p,e);_&&(_.receiveShadow=!0),u(y,i),u(g,t);let S=ia(h);if(S){let E=new we,b=new se(ma(Xf).rotateY(-pa[S]),s),T=new se(ma(1).rotateY(-pa[S]).translate(0,Wf-xa,0),r);b.renderOrder=10,T.renderOrder=11,o.push(b,T),E.add(b,T),E.position.set(x[0][0],xa,x[0][1]),E.scale.setScalar(As),n.add(E),a={mesh:E,dir:S}}return!0},pulse(h){return a?(a.mesh.scale.setScalar(As*ra(h)),!0):!1},next(){return a?{dir:a.dir,scale:a.mesh.scale.x}:null},dispose(){c(),e.dispose(),t.dispose(),i.dispose(),r.dispose(),s.dispose()}}}var Wb=new We(.55,.78,1),Xb=new We(1,.9,.74),_a=1.03,Rc=.012,Pc=.3,Yf=`
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,qb=`
uniform vec3 uColor;
uniform float uH;
uniform float uBand;
uniform float uFlash;
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vec2 e = abs(vUv - 0.5) * 2.0;
  float edge = smoothstep(0.78, 1.0, max(e.x, e.y));
  float a = 0.045 + 0.17 * edge;
  float d = (vPos.y / uH + 0.5) * 0.7 + (vPos.x + vPos.z) * 0.3 + 0.15;
  float band = uFlash * exp(-pow((d - uBand) * 5.0, 2.0));
  a += 0.18 * uFlash + 0.55 * band;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), band) * a, 1.0);
}`,Yb=`
uniform vec3 uColor;
uniform float uA;
uniform float uT;
uniform float uStill;
varying vec2 vUv;
void main() {
  float ends = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x) * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
  float wave = vUv.y * 16.0 + sin(vUv.x * 9.0 + uT * 2.2) * 1.4 - uT * 2.6;
  float bands = mix(0.35 + 0.65 * (0.5 + 0.5 * sin(wave)), 0.7, uStill);
  gl_FragColor = vec4(uColor * uA * bands * ends, 1.0);
}`,Kb={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};function Kf(){let n=new we,e=new en(1,1,1),t=new Gt(1,1),i=[],r=[],s=()=>new tn({vertexShader:Yf,fragmentShader:qb,transparent:!0,depthWrite:!1,blending:dn,toneMapped:!1,uniforms:{uColor:{value:Wb},uH:{value:1},uBand:{value:-1},uFlash:{value:0}}}),o=()=>new tn({vertexShader:Yf,fragmentShader:Yb,transparent:!0,depthWrite:!1,blending:dn,toneMapped:!1,side:Bt,uniforms:{uColor:{value:Xb},uA:{value:0},uT:{value:0},uStill:{value:0}}});function a(c,u,h){let d=c[u];return d||(d=h(),c.push(d),n.add(d)),d.visible=!0,d}function l(c,u,h,d,f,m,x){let[p,g]=Kb[c.face],y=dt(c.at.c,f),_=mt(c.at.r,m),S=Math.atan2(p,g),E=R=>{let v=R.material.uniforms;v.uA.value=(h.still?.16:.24)*d,v.uT.value=h.t,v.uStill.value=h.still?1:0},b=a(r,2*u,()=>new se(t,o()));b.scale.set(1,x,1),b.rotation.set(0,S,0),b.position.set(y+p*(.5+Rc),x/2,_+g*(.5+Rc)),E(b);let T=a(r,2*u+1,()=>new se(t,o()));T.scale.set(1,Pc,1),T.rotation.set(-Math.PI/2,S,0,"YXZ"),T.position.set(y+p*(.5-Pc/2),x+Rc,_+g*(.5-Pc/2)),E(T)}return{group:n,set(c,u,h,d){c.found.forEach((m,x)=>{let p=a(i,x,()=>new se(e,s()));p.scale.set(_a,d*_a,_a),p.position.set(dt(m.at.c,u),d*_a/2-.005,mt(m.at.r,h));let g=p.material.uniforms;g.uH.value=1,g.uBand.value=m.shimmer===null?-1:-.3+1.6*m.shimmer,g.uFlash.value=m.shimmer===null?0:Math.sin(Math.PI*m.shimmer)});for(let m=c.found.length;m<i.length;m++)i[m].visible=!1;let f=c.haze?.faces??[];f.forEach((m,x)=>l(m,x,c,c.haze.strength,u,h,d));for(let m=2*f.length;m<r.length;m++)r[m].visible=!1},clear(){for(let c of[...i,...r])c.visible=!1},dispose(){for(let c of[...i,...r])c.material.dispose();e.dispose(),t.dispose()}}}var Zf={found:[],haze:null,t:0,still:!1};var $f=n=>({found:n.found.map(e=>e.at),haze:n.haze?n.haze.faces.map(e=>({at:e.at,face:e.face})):[],strength:n.haze?.strength??0});var Jf=394500,$b=1.15,Lc=Math.PI/180,Dc=12,jf=(n,e)=>e.wake!==null?qo(e.wake):xs(n,e),Qf=.12,Jb=400;function jb(n){let e=null;try{e=localStorage.getItem(fd)}catch{e=null}md(e);let t=new os({canvas:n.canvas,antialias:!0,powerPreference:"high-performance"});t.shadowMap.enabled=!0,t.shadowMap.type=$l,t.shadowMap.autoUpdate=!1;let i=Ld(t),r=new fn;r.background=new We(Jf);let s=new Bn(-1,1,1,-1,.1,200),o=new P,a=new P,l=new P,c=Gf(t),u=Ud(i),h=pf(i),d=new we,f=kf(),m=If(i,f),x=qf(),p=Ff(i),g=Od(),y=Kf(),_=Zf;r.add(u.group,h.group,d,m.group,x.group,p.group,y.group);let S=!0,E=0,b=0,T=-1e9,R=!1,v=lf(),M=v.q,L=1,k=1,K=Gh(N=>n.overlay.prepend(N),Bh(n.icons)),I="solid",z=mn(),B=null,O=null,H=!0,j=Jh(),$=0,Q=gs,pe=null,V=[],oe=new Set,de=[],ge=null,Me=0,Oe=0,Xe=!0,Pe="",Ne=!0,D=!0,fe=!0,W={yaw:0,pitch:75,tx:0,tz:0,zoom:10},ne={...W},ee=!0,Re=!1,xe=()=>n.reducedMotion(),A=()=>M===0?1:Math.min(globalThis.devicePixelRatio||1,2),w=()=>B?.level.rows??1,F=()=>B?.level.cols??1,le=()=>L/k,ue=(N,X)=>oe.has(X)?"water":Cd(N,X),ce=()=>sd(le(),F(),w(),ne.pitch);function ve(){!b&&S&&(b=requestAnimationFrame(Fe))}function be(N){Me=N,D=!0,ve()}let Te=()=>S&&Xe&&!document.hidden&&!n.reducedMotion();function Le(){Oe&&clearTimeout(Oe),Oe=0,Te()&&(Oe=setTimeout(()=>{Oe=0,Te()&&(B&&(Ye()||x.next())?be(Me+1/Dc):Me+=1/Dc,Le())},1e3/Dc))}function Ye(){he();let N=X=>(o.copy(X).project(s),Math.abs(o.x)<1.05&&Math.abs(o.y)<1.05);return(ge?.anchors??[]).some(N)||m.looping().some(X=>N(X.position))||de.some(X=>!!X?.userData?.loop&&N(X.position))}function he(){let N=W.yaw*Lc,X=W.pitch*Lc,te=W.zoom/2,ae=le(),Ae=Qh(W.pitch,W.zoom);s.position.set(W.tx+Math.sin(N)*Math.cos(X)*Ae,ie+Math.sin(X)*Ae,W.tz+Math.cos(N)*Math.cos(X)*Ae),s.up.set(-Math.sin(N),0,-Math.cos(N)),s.lookAt(W.tx,ie,W.tz),s.far=Ae+160,s.left=-te*ae,s.right=te*ae,s.top=te,s.bottom=-te,s.updateProjectionMatrix(),s.updateMatrixWorld()}function nt(){Re?(ee&&pe&&(ne.tx=dt(pe.c,F()),ne.tz=mt(pe.r,w())),ne.zoom=$o(ne.zoom,ce())):(ne.tx=ne.tz=0,ne.zoom=rd(le(),F(),w(),ne.pitch,ne.yaw)),Object.assign(ne,Zo(ne,F(),w(),le()))}function et(){let{hero:N,rest:X}=m.seen();if(I==="ghosted"&&B){let te=F(),ae=w();de.forEach((Ae,je)=>{let Ge=Ae?.userData;!Ge||Ge.h<=0||X.push({x:dt(je%te,te),z:mt(Math.floor(je/te),ae),half:Ge.half,h:Ge.h})})}return Hd(I,N,X)}function qe(){ge?.shadows(M>=3),fe=!0,ke()}function Fe(N){if(b=0,!S){R=!1;return}let X=N-T;T=N;let te=uf(R,X);if(te!==null){let Ge=cf(v,te);Ge!==M&&(M=Ge,qe())}let ae=te!==null?Math.min(.1,X/1e3):1/60;nt();let Ae=ed(W,ne,ae,xe());if(Ae&&(Ne=!0),he(),Y.setView(W.yaw,W.pitch),Ne&&(h.aim(s,et()),Ne=!1),Ae=h.ease(ae,xe())||Ae,m.ease(ae,xe())&&(Ae=!0,fe=!0),p.frame(N)&&(Ae=!0,fe=!0),Ce(N)&&(Ae=!0,fe=!0),D){u.loop(Me),ge?.loop(Me),m.loop(Me),p.loop(Me,xe()),x.pulse(Me);for(let Ge of de)Ge?.userData?.loop?.(Me);D=!1}if(fe&&(t.shadowMap.needsUpdate=!0,fe=!1),c.render(r,s,M>=2),f.group.children.length){let Ge=f.place(s,W.pitch,Me,xe(),k/W.zoom);$e(Ge),t.autoClear=!1,t.render(f.scene,s),t.autoClear=!0}g.empty()||(t.autoClear=!1,t.render(g.scene,s),t.autoClear=!0),vt();let je=`${W.yaw} ${W.tx} ${W.tz} ${W.zoom} ${L} ${k}`;je!==Pe&&(Pe=je,Z?.view(W,le())),E++,R=Ae,Ae&&ve()}function Ce(N){if(!B||!O)return!1;let X=Q=j.at(B,O,N,xe(),H);return B.terrain.forEach((te,ae)=>{let Ae=de[ae]?.userData;Ae?.open&&(te==="gate"?Ae.open(X.bars.get(ae)??(B.relicsLeft===0?1:0)):te==="exit"?(X.wake!==null&&Ae.wake?Ae.wake(X.wake):Ae.open(xs(B,X)),ge?.portal(ae,jf(B,X))):Ae.open(X.doors.get(ae)??(te==="floor"?1:0)))}),X.hoof!==$&&($=X.hoof,ct(B,O)),X.busy}function $e(N){let X=W.zoom/2,te=X*le();a.setFromMatrixColumn(s.matrixWorld,0),l.setFromMatrixColumn(s.matrixWorld,1);for(let ae of f.group.children){if(o.copy(ae.userData.foot).project(s),Math.abs(o.x)>1||Math.abs(o.y)>1)continue;o.copy(ae.position).project(s);let[Ae,je]=$d(o.x*te,o.y*X,Ss*N,jo*N,te,X,Zd);ae.position.addScaledVector(a,Ae).addScaledVector(l,je)}}function st(){let N=X=>(o.copy(X).project(s),[(o.x+1)/2*L,(1-o.y)/2*k]);return f.group.children.map(X=>{let te=X.userData;return{kind:te.kind,at:N(X.position),foot:N(te.foot),cell:k/W.zoom}})}function vt(){let N=B&&O?kh(B,O):[];K.place(N.map(X=>{let te=dt(X.c,F()),ae=mt(X.r,w());return o.set(te,ie+$b,ae).project(s),{bubble:X,x:(o.x+1)/2*L,head:(1-o.y)/2*k,cell:k/W.zoom}}),L,k)}function Je(N,X){return o.set(dt(N,F()),ie,mt(X,w())).project(s),[(o.x+1)/2*L,(1-o.y)/2*k]}let me=new Bn(-1,1,1,-1,.1,200),U=null,ye=new Uint8Array(0);function Se(N,X,te,ae,Ae){if(!B)return!1;let je=F(),Ge=w(),rt=N.width,He=N.height,Ue=(_t,Rn,Ct)=>Ct<=Rn?(Ct-1)/2:Math.max((Rn-1)/2,Math.min(Ct-1-(Rn-1)/2,_t)),Wt=dt(Ue(te,ae,je),je),ot=mt(Ue(X,Ae,Ge),Ge),Ut=75*Lc,gn=40;me.position.set(Wt,ie+Math.sin(Ut)*gn,ot+Math.cos(Ut)*gn),me.up.set(0,0,-1),me.lookAt(Wt,ie,ot);let ln=ae/2,Et=Ae*Math.sin(Ut)/2;Object.assign(me,{left:-ln,right:ln,top:Et,bottom:-Et}),me.updateProjectionMatrix(),me.updateMatrixWorld(),(!U||U.width!==rt||U.height!==He)&&(U?.dispose(),U=new Qt(rt,He),U.texture.colorSpace=pt,ye=new Uint8Array(rt*He*4)),t.toneMapping=Bo,t.toneMappingExposure=1.4,t.setRenderTarget(U),t.render(r,me),t.setRenderTarget(null),t.toneMapping=Un,t.readRenderTargetPixels(U,0,0,rt,He,ye);let ut=new ImageData(rt,He);for(let _t=0;_t<He;_t++)ut.data.set(ye.subarray((He-1-_t)*rt*4,(He-_t)*rt*4),_t*rt*4);return N.getContext("2d").putImageData(ut,0,0),!0}function Ve(N){let X=N.width,te=N.height,ae=new fn,Ae=wc.theseus(i);ae.add(Ae,new Br(16773596,2759954,1.6));let je=new ci(16769720,2.4);je.position.set(1.5,3,4),ae.add(je);let Ge=new Nn().setFromObject(Ae),rt=Ge.max.y,He=Math.max(Ge.max.y-Ge.min.y,Ge.max.x-Ge.min.x)*.8,Ue=(Ge.min.x+Ge.max.x)/2,Wt=(Ge.min.z+Ge.max.z)/2,ot=rt-He*.46,Ut=new Bn(-He/2,He/2,He/2,-He/2,.1,50);Ut.position.set(Ue+3,ot+3,Wt+9),Ut.lookAt(Ue,ot,Wt),Ut.updateMatrixWorld();let gn=new Qt(X,te);gn.texture.colorSpace=pt;let ln=new Uint8Array(X*te*4),Et=t.getClearAlpha();t.setClearColor(0,0),t.toneMapping=Bo,t.toneMappingExposure=1.4,t.setRenderTarget(gn),t.clear(),t.render(ae,Ut),t.setRenderTarget(null),t.toneMapping=Un,t.setClearColor(Jf,Et),t.readRenderTargetPixels(gn,0,0,X,te,ln),gn.dispose(),Ui(Ae,i);let ut=new ImageData(X,te);for(let _t=0;_t<te;_t++)ut.data.set(ln.subarray((te-1-_t)*X*4,(te-_t)*X*4),_t*X*4);N.getContext("2d").putImageData(ut,0,0)}function ke(){let N=n.canvas.clientWidth,X=n.canvas.clientHeight;if(N<=0||X<=0)return;L=N,k=X;let te=A();t.setPixelRatio(te),t.setSize(N,X,!1),c.setSize(Math.round(N*te),Math.round(X*te)),Z?.fit(n.overlay.clientWidth||N,n.overlay.clientHeight||X),Re||(nt(),W.zoom=ne.zoom),Ne=!0}function lt(N){let X=de[N];X&&(d.remove(X),Ui(X,i));let te=F(),ae=w(),Ae=Math.floor(N/te),je=N%te,Ge=(Ue,Wt)=>Ue<0||Wt<0||Ue>=ae||Wt>=te||V[Ue*te+Wt]==="wall",rt=Sf[V[N]]({kit:i,r:Ae,c:je,wall:Ge}),He=rt.userData;if(!rt.children.length){de[N]=null;return}rt.position.set(dt(je,te),0,mt(Ae,ae)),He.tall&&I==="low"&&(rt.scale.y=nr/Wn),d.add(rt),de[N]=rt}function ct(N,X){pe&&(pe.r!==X.player.r||pe.c!==X.player.c)&&(ee=!0),pe={r:X.player.r,c:X.player.c};let te=m.set(Id(N,X,$),F(),w(),xe()),ae=m.hero();return ae&&ge?.hero(ae.position.x,ae.position.z),te}function At(){for(let N of de)N&&(d.remove(N),Ui(N,i));de=[],ge&&(r.remove(ge.group),ge.dispose(),ge=null),m.clear(),p.clear(),x.set(null,0,0)}function Lt(N){At(),B=N;let{rows:X,cols:te}=N.level;oe=new Set(mc(N.level.terrain,N.terrain)),V=N.terrain.map((ae,Ae)=>ue(N,Ae)),p.set([...oe],te,X,!1),u.set(V,X,te),h.build(V,X,te),de=V.map(()=>null);for(let ae=0;ae<V.length;ae++)lt(ae);ge=Tc(i,V,X,te,h.list()),ge.setMode(I),ge.shadows(M>=3),r.add(ge.group),Cs(v),pe=null,ct(N,{player:N.player,minotaur:N.minotaur,hazards:N.hazards.map(ae=>({kind:ae.kind,at:ae.at}))}),ee=!0,Re=!1,ne.yaw=0,ne.pitch=75,nt(),Object.assign(W,ne),Ne=D=fe=!0,Z?.paint(N,{player:N.player,minotaur:N.minotaur,hazards:N.hazards.map(ae=>({kind:ae.kind,at:ae.at}))},null),ve(),Oe||Le()}function ht(N,X,te=!1){let ae=N.state;O=N.figures,H=N.done??!0,(!B||ae.level!==B.level&&!te)&&Lt(ae);let Ae=B,je=Fd(Ae,ae);Ae.relicsLeft!==ae.relicsLeft&&ae.terrain.forEach((Et,ut)=>{(Et==="gate"||Et==="exit")&&je.push(ut)});let Ge=!1,rt=!1,{rows:He,cols:Ue}=ae.level,Wt=new Set,ot=mc(ae.level.terrain,ae.terrain);oe=new Set(ot);for(let Et of je){let ut=ue(ae,Et),_t=V[Et];if(ut!==_t){if(bs[ut]!==bs[_t]&&(Ge=!0),ut==="wall"!=(_t==="wall")){rt=!0;let Rn=Math.floor(Et/Ue),Ct=Et%Ue;for(let[Oi,Vr]of[[-1,0],[1,0],[0,-1],[0,1]])Rn+Oi>=0&&Rn+Oi<He&&Ct+Vr>=0&&Ct+Vr<Ue&&Wt.add((Rn+Oi)*Ue+Ct+Vr)}V[Et]=ut,lt(Et),ge?.piece(Et,ut)}}for(let Et of Wt)je.includes(Et)||lt(Et);Ge&&u.set(V,He,Ue),rt&&(h.build(V,He,Ue),h.setMode(I)),B=ae;let Ut=ct(ae,N.figures),gn=x.set(X,Ue,He),ln=p.set(ot,Ue,He,!xe());je.length===0&&!Ut&&!gn&&!ln&&ae===Ae||((je.length||Ut||ln)&&(Ne=!0,fe=!0),Z?.paint(ae,N.figures,X),ve(),Oe||Le())}let Dt=N=>N.map((X,te)=>X==="wall"||X.startsWith("door")||X.startsWith("gate")||X==="exit"||X==="fire"?`${te}${X}`:"").join(","),an="",Kn=0;function va(N){let X={player:N.player,minotaur:N.minotaur,hazards:N.hazards.map(te=>({kind:te.kind,at:te.at}))};if(!B||B.level.rows!==N.level.rows||B.level.cols!==N.level.cols){O=X,H=!0,Lt(N),an=Dt(V),$n(null);return}ht({state:N,figures:X,done:!0},null,!0),Dt(V)!==an&&(Kn&&clearTimeout(Kn),Kn=setTimeout(()=>{if(Kn=0,!B||!ge)return;r.remove(ge.group),ge.dispose(),ge=Tc(i,V,w(),F(),h.list()),ge.setMode(I),ge.shadows(M>=3);let te=m.hero();te&&ge.hero(te.position.x,te.position.z),r.add(ge.group),an=Dt(V),fe=D=!0,ve()},Jb))}function fi(N,X){if(!B)return null;let te=n.canvas.getBoundingClientRect();return te.width<=0||te.height<=0?null:od(W,le(),(N-te.left)/te.width-.5,.5-(X-te.top)/te.height,F(),w())}let Zn=null;function $n(N){N===Zn||N&&Zn&&N.r===Zn.r&&N.c===Zn.c||(Zn=N,g.hover(N,F(),w()),ve())}let Ni=n.painter,Is=Ni&&{stroke(N,X,te){let ae=fi(N,X);$n(ae),ae&&Ni.stroke(ae,te)},end(){Ni.end()},drop(){$n(null),Ni.drop()},hover(N){$n(N?fi(N.x,N.y):null)}};function ba(N){let X=z.cutaway&&N==="solid"?"ghosted":N;I=X,h.setMode(X),ge?.setMode(X);for(let te of de)te&&te.userData.tall&&(te.scale.y=X==="low"?nr/Wn:1);Ne=fe=!0,Ls(_)}function Ls(N){_=N,y.set(N,F(),w(),I==="low"?nr:Wn),ve()}function Ma(){ee=!0,Re=!1,ne.yaw=nd(0,W.yaw),ne.pitch=75,xe()&&(W.yaw=ne.yaw,W.pitch=ne.pitch)}let C={turn(N,X){ne.yaw+=N,(!X||xe())&&(W.yaw+=N),Ne=!0,ve()},pan(N,X){ee=!1;let te=W.zoom/k;for(let ae of[W,ne])Object.assign(ae,Zo(td(ae,N,X,te),F(),w(),le()));Ne=!0,ve()},zoom(N,X,te,ae){Re=!0;let Ae=ce();if(ae)ne.zoom=$o(ne.zoom*N,Ae);else{let je=Math.abs(X)>Qf||Math.abs(te)>Qf;je&&(ee=!1);let Ge=je?X*le():0,rt=je?te:0;for(let He of[W,ne])Object.assign(He,Zo(ad(He,N,Ge,rt,Ae),F(),w(),le()))}Ne=!0,ve()},tilt(N,X){ne.pitch=_s(ne.pitch+N),(!X||xe())&&(W.pitch=ne.pitch),Ne=!0,ve()},reset(){Ma(),Ne=!0,ve()}},G=document.createElement("div");G.className="modern-ui",n.overlay.append(G);let Y=Ad(n.canvas,G,n,C,Is),Z=!n.painter&&n.atlas&&n.image?af(G,n.atlas,n.image,{blocked:()=>n.blocked(),look(N){n.gesture(),ee=!1,ne.tx=N.x,ne.tz=N.z,ve()}}):null,q=()=>{Cs(v),Le()};document.addEventListener("visibilitychange",q);let Ee=typeof IntersectionObserver=="function"?new IntersectionObserver(N=>{Xe=N.some(X=>X.isIntersecting),Le()}):null;Ee?.observe(n.canvas);let De=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,ze=()=>{D=!0,ve(),Le()};return De?.addEventListener("change",ze),ke(),{level:Lt,show:(N,X)=>ht(N,X),edit:va,marks(N){g.marks(N,F(),w()),ve()},cellUnder:fi,hovered:()=>Zn,walls:ba,cues:Ls,shownCues:()=>$f(_),yaw:()=>W.yaw,zoom:()=>W.zoom,pitch:()=>W.pitch,setView(N,X){C.turn(N-ne.yaw,!1),C.tilt(X-ne.pitch,!1),nt(),Object.assign(W,ne)},following:()=>ee,reset:C.reset,resize(){ke(),ve()},setActive(N){S=N,G.hidden=!N,N?ve():(b&&cancelAnimationFrame(b),b=0,R=!1),Le()},frames:()=>E,opening:()=>({bars:[...Q.bars.values()],portal:B?jf(B,Q):0,doors:[...Q.doors.values()],hoof:Q.hoof}),quality:()=>M,fps:()=>sa(v.gaps,2e3),floating:()=>p.cells(),routeNext:()=>x.next(),markers:st,cellAt:Je,bubbles:()=>K.shown(),splashing:()=>p.splashing(),minimap(N){Z?.show(N)},showTips:()=>Y.showTips(),snapshot:Se,portrait:Ve,dispose(){b&&cancelAnimationFrame(b),b=0,Kn&&clearTimeout(Kn),S=!1,Le(),document.removeEventListener("visibilitychange",q),Ee?.disconnect(),De?.removeEventListener("change",ze),Y.dispose(),Z?.dispose(),G.remove(),At(),u.dispose(),h.dispose(),m.dispose(),p.dispose(),x.dispose(),y.dispose(),f.dispose(),g.dispose(),U?.dispose(),c.dispose(),i.dispose(),t.dispose()}}}export{jb as createModernBoard};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=modern.js.map
