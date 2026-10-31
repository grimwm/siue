/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
var qd=0,rc=1,Yd=2;var Nu=1,Pl=2,Wn=3,fi=0,Ct=1,fn=2;var ui=0,gr=1,Ui=2,sc=3,oc=4,Zd=5,Ri=100,Kd=101,Jd=102,ac=103,lc=104,$d=200,jd=201,Qd=202,ef=203,Ba=204,Ga=205,tf=206,nf=207,rf=208,sf=209,of=210,af=211,lf=212,cf=213,uf=214,hf=0,df=1,ff=2,Js=3,pf=4,mf=5,Il=6,gf=7,Ll=0,xf=1,_f=2,Dn=0,yf=1,vf=2,bf=3,Dl=4,Mf=5,Sf=6;var Ou=300,yr=301,vr=302,Ha=303,Va=304,Po=306,br=1e3,kt=1001,Wa=1002,Zt=1003,cc=1004;var ia=1005;var dn=1006,wf=1007;var jr=1008;var hi=1009,Ef=1010,Tf=1011,Ul=1012,Fu=1013,li=1014,ci=1015,Ni=1016,zu=1017,ku=1018,Ii=1020,Af=1021,Tn=1023,Rf=1024,Cf=1025,Li=1026,Mr=1027,Pf=1028,Bu=1029,If=1030,Gu=1031,Hu=1033,ra=33776,sa=33777,oa=33778,aa=33779,uc=35840,hc=35841,dc=35842,fc=35843,Vu=36196,pc=37492,mc=37496,gc=37808,xc=37809,_c=37810,yc=37811,vc=37812,bc=37813,Mc=37814,Sc=37815,wc=37816,Ec=37817,Tc=37818,Ac=37819,Rc=37820,Cc=37821,la=36492,Pc=36494,Ic=36495,Lf=36283,Lc=36284,Dc=36285,Uc=36286;var $s=2300,js=2301,ca=2302,Nc=2400,Oc=2401,Fc=2402;var Wu=3e3,Di=3001,Df=3200,Uf=3201,Nl=0,Nf=1,pn="",Tt="srgb",Kn="srgb-linear",Ol="display-p3",Io="display-p3-linear",Qs="linear",pt="srgb",eo="rec709",to="p3";var qi=7680,Xu=7681;var qu=517;var zc=519,Of=512,Ff=513,zf=514,Yu=515,kf=516,Bf=517,Gf=518,Hf=519,Xa=35044;var kc="300 es",qa=1035,Yn=2e3,no=2001,pi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Gt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var ua=Math.PI/180,Ya=180/Math.PI;function Zn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Gt[i&255]+Gt[i>>8&255]+Gt[i>>16&255]+Gt[i>>24&255]+"-"+Gt[e&255]+Gt[e>>8&255]+"-"+Gt[e>>16&15|64]+Gt[e>>24&255]+"-"+Gt[t&63|128]+Gt[t>>8&255]+"-"+Gt[t>>16&255]+Gt[t>>24&255]+Gt[n&255]+Gt[n>>8&255]+Gt[n>>16&255]+Gt[n>>24&255]).toLowerCase()}function zt(i,e,t){return Math.max(e,Math.min(t,i))}function Vf(i,e){return(i%e+e)%e}function ha(i,e,t){return(1-t)*i+t*e}function Bc(i){return(i&i-1)===0&&i!==0}function Za(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function qn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ut(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var J=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(zt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},nt=class i{constructor(e,t,n,r,s,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],_=r[0],m=r[3],p=r[6],v=r[1],x=r[4],b=r[7],E=r[2],S=r[5],A=r[8];return s[0]=o*_+a*v+l*E,s[3]=o*m+a*x+l*S,s[6]=o*p+a*b+l*A,s[1]=c*_+u*v+h*E,s[4]=c*m+u*x+h*S,s[7]=c*p+u*b+h*A,s[2]=d*_+f*v+g*E,s[5]=d*m+f*x+g*S,s[8]=d*p+f*b+g*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*s,f=c*s-o*l,g=t*h+n*d+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=h*_,e[1]=(r*c-u*n)*_,e[2]=(a*n-r*o)*_,e[3]=d*_,e[4]=(u*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*s)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(da.makeScale(e,t)),this}rotate(e){return this.premultiply(da.makeRotation(-e)),this}translate(e,t){return this.premultiply(da.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},da=new nt;function Zu(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function io(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Wf(){let i=io("canvas");return i.style.display="block",i}var Gc={};function Zr(i){i in Gc||(Gc[i]=!0,console.warn(i))}var Hc=new nt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Vc=new nt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),vs={[Kn]:{transfer:Qs,primaries:eo,toReference:i=>i,fromReference:i=>i},[Tt]:{transfer:pt,primaries:eo,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Io]:{transfer:Qs,primaries:to,toReference:i=>i.applyMatrix3(Vc),fromReference:i=>i.applyMatrix3(Hc)},[Ol]:{transfer:pt,primaries:to,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Vc),fromReference:i=>i.applyMatrix3(Hc).convertLinearToSRGB()}},Xf=new Set([Kn,Io]),ct={enabled:!0,_workingColorSpace:Kn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!Xf.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;let n=vs[e].toReference,r=vs[t].fromReference;return r(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return vs[i].primaries},getTransfer:function(i){return i===pn?Qs:vs[i].transfer}};function xr(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function fa(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Yi,ro=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Yi===void 0&&(Yi=io("canvas")),Yi.width=e.width,Yi.height=e.height;let n=Yi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Yi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=io("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=xr(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(xr(t[n]/255)*255):t[n]=xr(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},qf=0,so=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=Zn(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(pa(r[o].image)):s.push(pa(r[o]))}else s=pa(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function pa(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ro.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Yf=0,mn=class i extends pi{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=kt,r=kt,s=dn,o=jr,a=Tn,l=hi,c=i.DEFAULT_ANISOTROPY,u=pn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Yf++}),this.uuid=Zn(),this.name="",this.source=new so(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new J(0,0),this.repeat=new J(1,1),this.center=new J(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new nt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof u=="string"?this.colorSpace=u:(Zr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=u===Di?Tt:pn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ou)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case br:e.x=e.x-Math.floor(e.x);break;case kt:e.x=e.x<0?0:1;break;case Wa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case br:e.y=e.y-Math.floor(e.y);break;case kt:e.y=e.y<0?0:1;break;case Wa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Zr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===Tt?Di:Wu}set encoding(e){Zr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Di?Tt:pn}};mn.DEFAULT_IMAGE=null;mn.DEFAULT_MAPPING=Ou;mn.DEFAULT_ANISOTROPY=1;var xt=class i{constructor(e=0,t=0,n=0,r=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,b=(f+1)/2,E=(p+1)/2,S=(u+d)/4,A=(h+_)/4,C=(g+m)/4;return x>b&&x>E?x<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(x),r=S/n,s=A/n):b>E?b<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(b),n=S/r,s=C/r):E<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(E),n=A/s,r=C/s),this.set(n,r,s,t),this}let v=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(h-_)/v,this.z=(d-u)/v,this.w=Math.acos((c+f+p-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ka=class extends pi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t);let r={width:e,height:t,depth:1};n.encoding!==void 0&&(Zr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===Di?Tt:pn),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:dn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new mn(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new so(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Qt=class extends Ka{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},oo=class extends mn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=kt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ja=class extends mn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=kt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var mi=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],u=n[r+2],h=n[r+3],d=s[o+0],f=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(h!==_||l!==d||c!==f||u!==g){let m=1-a,p=l*d+c*f+u*g+h*_,v=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let E=Math.sqrt(x),S=Math.atan2(E,p*v);m=Math.sin(m*S)/E,a=Math.sin(a*S)/E}let b=a*v;if(l=l*m+d*b,c=c*m+f*b,u=u*m+g*b,h=h*m+_*b,m===1-a){let E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){let a=n[r],l=n[r+1],c=n[r+2],u=n[r+3],h=s[o],d=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-a*f,e[t+2]=c*g+u*f+a*d-l*h,e[t+3]=u*g-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(r/2),h=a(s/2),d=l(n/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(n>a&&n>h){let f=2*Math.sqrt(1+n-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>h){let f=2*Math.sqrt(1+a-n-h);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-n-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(zt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-r*a,this._w=o*u-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(r),n*Math.sin(s),n*Math.cos(s),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Wc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Wc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),u=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ma.copy(this).projectOnVector(e),this.sub(ma)}reflect(e){return this.sub(ma.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(zt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ma=new P,Wc=new mi,Jn=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Sn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Sn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Sn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Sn):Sn.fromBufferAttribute(s,o),Sn.applyMatrix4(e.matrixWorld),this.expandByPoint(Sn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),bs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),bs.copy(n.boundingBox)),bs.applyMatrix4(e.matrixWorld),this.union(bs)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Sn),Sn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zr),Ms.subVectors(this.max,zr),Zi.subVectors(e.a,zr),Ki.subVectors(e.b,zr),Ji.subVectors(e.c,zr),ii.subVectors(Ki,Zi),ri.subVectors(Ji,Ki),Si.subVectors(Zi,Ji);let t=[0,-ii.z,ii.y,0,-ri.z,ri.y,0,-Si.z,Si.y,ii.z,0,-ii.x,ri.z,0,-ri.x,Si.z,0,-Si.x,-ii.y,ii.x,0,-ri.y,ri.x,0,-Si.y,Si.x,0];return!ga(t,Zi,Ki,Ji,Ms)||(t=[1,0,0,0,1,0,0,0,1],!ga(t,Zi,Ki,Ji,Ms))?!1:(Ss.crossVectors(ii,ri),t=[Ss.x,Ss.y,Ss.z],ga(t,Zi,Ki,Ji,Ms))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Sn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Sn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(kn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},kn=[new P,new P,new P,new P,new P,new P,new P,new P],Sn=new P,bs=new Jn,Zi=new P,Ki=new P,Ji=new P,ii=new P,ri=new P,Si=new P,zr=new P,Ms=new P,Ss=new P,wi=new P;function ga(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){wi.fromArray(i,s);let a=r.x*Math.abs(wi.x)+r.y*Math.abs(wi.y)+r.z*Math.abs(wi.z),l=e.dot(wi),c=t.dot(wi),u=n.dot(wi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var Zf=new Jn,kr=new P,xa=new P,Oi=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Zf.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;kr.subVectors(e,this.center);let t=kr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(kr,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(kr.copy(e.center).add(xa)),this.expandByPoint(kr.copy(e.center).sub(xa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Bn=new P,_a=new P,ws=new P,si=new P,ya=new P,Es=new P,va=new P,$a=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Bn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Bn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Bn.copy(this.origin).addScaledVector(this.direction,t),Bn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){_a.copy(e).add(t).multiplyScalar(.5),ws.copy(t).sub(e).normalize(),si.copy(this.origin).sub(_a);let s=e.distanceTo(t)*.5,o=-this.direction.dot(ws),a=si.dot(this.direction),l=-si.dot(ws),c=si.lengthSq(),u=Math.abs(1-o*o),h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=s*u,h>=0)if(d>=-g)if(d<=g){let _=1/u;h*=_,d*=_,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(_a).addScaledVector(ws,d),f}intersectSphere(e,t){Bn.subVectors(e.center,this.origin);let n=Bn.dot(this.direction),r=Bn.dot(Bn)-n*n,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Bn)!==null}intersectTriangle(e,t,n,r,s){ya.subVectors(t,e),Es.subVectors(n,e),va.crossVectors(ya,Es);let o=this.direction.dot(va),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;si.subVectors(this.origin,e);let l=a*this.direction.dot(Es.crossVectors(si,Es));if(l<0)return null;let c=a*this.direction.dot(ya.cross(si));if(c<0||l+c>o)return null;let u=-a*si.dot(va);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ht=class i{constructor(e,t,n,r,s,o,a,l,c,u,h,d,f,g,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,u,h,d,f,g,_,m)}set(e,t,n,r,s,o,a,l,c,u,h,d,f,g,_,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=r,p[1]=s,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/$i.setFromMatrixColumn(e,0).length(),s=1/$i.setFromMatrixColumn(e,1).length(),o=1/$i.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let d=o*u,f=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d-_*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*u,f=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+_,t[1]=l*h,t[5]=_*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-d*h,t[8]=g*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-_*h}else if(e.order==="XZY"){let d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+_,t[5]=o*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*u,t[10]=_*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Kf,e,Jf)}lookAt(e,t,n){let r=this.elements;return nn.subVectors(e,t),nn.lengthSq()===0&&(nn.z=1),nn.normalize(),oi.crossVectors(n,nn),oi.lengthSq()===0&&(Math.abs(n.z)===1?nn.x+=1e-4:nn.z+=1e-4,nn.normalize(),oi.crossVectors(n,nn)),oi.normalize(),Ts.crossVectors(nn,oi),r[0]=oi.x,r[4]=Ts.x,r[8]=nn.x,r[1]=oi.y,r[5]=Ts.y,r[9]=nn.y,r[2]=oi.z,r[6]=Ts.z,r[10]=nn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],v=n[3],x=n[7],b=n[11],E=n[15],S=r[0],A=r[4],C=r[8],y=r[12],M=r[1],U=r[5],z=r[9],Y=r[13],I=r[2],D=r[6],O=r[10],V=r[14],K=r[3],Z=r[7],re=r[11],se=r[15];return s[0]=o*S+a*M+l*I+c*K,s[4]=o*A+a*U+l*D+c*Z,s[8]=o*C+a*z+l*O+c*re,s[12]=o*y+a*Y+l*V+c*se,s[1]=u*S+h*M+d*I+f*K,s[5]=u*A+h*U+d*D+f*Z,s[9]=u*C+h*z+d*O+f*re,s[13]=u*y+h*Y+d*V+f*se,s[2]=g*S+_*M+m*I+p*K,s[6]=g*A+_*U+m*D+p*Z,s[10]=g*C+_*z+m*O+p*re,s[14]=g*y+_*Y+m*V+p*se,s[3]=v*S+x*M+b*I+E*K,s[7]=v*A+x*U+b*D+E*Z,s[11]=v*C+x*z+b*O+E*re,s[15]=v*y+x*Y+b*V+E*se,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+s*l*h-r*c*h-s*a*d+n*c*d+r*a*f-n*l*f)+_*(+t*l*f-t*c*d+s*o*d-r*o*f+r*c*u-s*l*u)+m*(+t*c*h-t*a*f-s*o*h+n*o*f+s*a*u-n*c*u)+p*(-r*a*u-t*l*h+t*a*d+r*o*h-n*o*d+n*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],v=h*m*c-_*d*c+_*l*f-a*m*f-h*l*p+a*d*p,x=g*d*c-u*m*c-g*l*f+o*m*f+u*l*p-o*d*p,b=u*_*c-g*h*c+g*a*f-o*_*f-u*a*p+o*h*p,E=g*h*l-u*_*l-g*a*d+o*_*d+u*a*m-o*h*m,S=t*v+n*x+r*b+s*E;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/S;return e[0]=v*A,e[1]=(_*d*s-h*m*s-_*r*f+n*m*f+h*r*p-n*d*p)*A,e[2]=(a*m*s-_*l*s+_*r*c-n*m*c-a*r*p+n*l*p)*A,e[3]=(h*l*s-a*d*s-h*r*c+n*d*c+a*r*f-n*l*f)*A,e[4]=x*A,e[5]=(u*m*s-g*d*s+g*r*f-t*m*f-u*r*p+t*d*p)*A,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*p-t*l*p)*A,e[7]=(o*d*s-u*l*s+u*r*c-t*d*c-o*r*f+t*l*f)*A,e[8]=b*A,e[9]=(g*h*s-u*_*s-g*n*f+t*_*f+u*n*p-t*h*p)*A,e[10]=(o*_*s-g*a*s+g*n*c-t*_*c-o*n*p+t*a*p)*A,e[11]=(u*a*s-o*h*s-u*n*c+t*h*c+o*n*f-t*a*f)*A,e[12]=E*A,e[13]=(u*_*r-g*h*r+g*n*d-t*_*d-u*n*m+t*h*m)*A,e[14]=(g*a*r-o*_*r-g*n*l+t*_*l+o*n*m-t*a*m)*A,e[15]=(o*h*r-u*a*r+u*n*l-t*h*l-o*n*d+t*a*d)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+n,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,d=s*c,f=s*u,g=s*h,_=o*u,m=o*h,p=a*h,v=l*c,x=l*u,b=l*h,E=n.x,S=n.y,A=n.z;return r[0]=(1-(_+p))*E,r[1]=(f+b)*E,r[2]=(g-x)*E,r[3]=0,r[4]=(f-b)*S,r[5]=(1-(d+p))*S,r[6]=(m+v)*S,r[7]=0,r[8]=(g+x)*A,r[9]=(m-v)*A,r[10]=(1-(d+_))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,s=$i.set(r[0],r[1],r[2]).length(),o=$i.set(r[4],r[5],r[6]).length(),a=$i.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],wn.copy(this);let c=1/s,u=1/o,h=1/a;return wn.elements[0]*=c,wn.elements[1]*=c,wn.elements[2]*=c,wn.elements[4]*=u,wn.elements[5]*=u,wn.elements[6]*=u,wn.elements[8]*=h,wn.elements[9]*=h,wn.elements[10]*=h,t.setFromRotationMatrix(wn),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=Yn){let l=this.elements,c=2*s/(t-e),u=2*s/(n-r),h=(t+e)/(t-e),d=(n+r)/(n-r),f,g;if(a===Yn)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===no)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=Yn){let l=this.elements,c=1/(t-e),u=1/(n-r),h=1/(o-s),d=(t+e)*c,f=(n+r)*u,g,_;if(a===Yn)g=(o+s)*h,_=-2*h;else if(a===no)g=s*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},$i=new P,wn=new ht,Kf=new P(0,0,0),Jf=new P(1,1,1),oi=new P,Ts=new P,nn=new P,Xc=new ht,qc=new mi,ao=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],d=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(zt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-zt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(zt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-zt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(zt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-zt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Xc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Xc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return qc.setFromEuler(this),this.setFromQuaternion(qc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ao.DEFAULT_ORDER="XYZ";var lo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},$f=0,Yc=new P,ji=new mi,Gn=new ht,As=new P,Br=new P,jf=new P,Qf=new mi,Zc=new P(1,0,0),Kc=new P(0,1,0),Jc=new P(0,0,1),ep={type:"added"},tp={type:"removed"},Wt=class i extends pi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$f++}),this.uuid=Zn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new P,t=new ao,n=new mi,r=new P(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new ht},normalMatrix:{value:new nt}}),this.matrix=new ht,this.matrixWorld=new ht,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new lo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ji.setFromAxisAngle(e,t),this.quaternion.multiply(ji),this}rotateOnWorldAxis(e,t){return ji.setFromAxisAngle(e,t),this.quaternion.premultiply(ji),this}rotateX(e){return this.rotateOnAxis(Zc,e)}rotateY(e){return this.rotateOnAxis(Kc,e)}rotateZ(e){return this.rotateOnAxis(Jc,e)}translateOnAxis(e,t){return Yc.copy(e).applyQuaternion(this.quaternion),this.position.add(Yc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Zc,e)}translateY(e){return this.translateOnAxis(Kc,e)}translateZ(e){return this.translateOnAxis(Jc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Gn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?As.copy(e):As.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Br.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Gn.lookAt(Br,As,this.up):Gn.lookAt(As,Br,this.up),this.quaternion.setFromRotationMatrix(Gn),r&&(Gn.extractRotation(r.matrixWorld),ji.setFromRotationMatrix(Gn),this.quaternion.premultiply(ji.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(ep)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(tp)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Gn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Gn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Gn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Br,e,jf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Br,Qf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++){let s=t[n];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++){let a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}};Wt.DEFAULT_UP=new P(0,1,0);Wt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var En=new P,Hn=new P,ba=new P,Vn=new P,Qi=new P,er=new P,$c=new P,Ma=new P,Sa=new P,wa=new P,Rs=!1,Pi=class i{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),En.subVectors(e,t),r.cross(En);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){En.subVectors(r,t),Hn.subVectors(n,t),ba.subVectors(e,t);let o=En.dot(En),a=En.dot(Hn),l=En.dot(ba),c=Hn.dot(Hn),u=Hn.dot(ba),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return s.set(1-f-g,g,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Vn)===null?!1:Vn.x>=0&&Vn.y>=0&&Vn.x+Vn.y<=1}static getUV(e,t,n,r,s,o,a,l){return Rs===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Rs=!0),this.getInterpolation(e,t,n,r,s,o,a,l)}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,Vn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Vn.x),l.addScaledVector(o,Vn.y),l.addScaledVector(a,Vn.z),l)}static isFrontFacing(e,t,n,r){return En.subVectors(n,t),Hn.subVectors(e,t),En.cross(Hn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return En.subVectors(this.c,this.b),Hn.subVectors(this.a,this.b),En.cross(Hn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,r,s){return Rs===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Rs=!0),i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,o,a;Qi.subVectors(r,n),er.subVectors(s,n),Ma.subVectors(e,n);let l=Qi.dot(Ma),c=er.dot(Ma);if(l<=0&&c<=0)return t.copy(n);Sa.subVectors(e,r);let u=Qi.dot(Sa),h=er.dot(Sa);if(u>=0&&h<=u)return t.copy(r);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(Qi,o);wa.subVectors(e,s);let f=Qi.dot(wa),g=er.dot(wa);if(g>=0&&f<=g)return t.copy(s);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(er,a);let m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return $c.subVectors(s,r),a=(h-u)/(h-u+(f-g)),t.copy(r).addScaledVector($c,a);let p=1/(m+_+d);return o=_*p,a=d*p,t.copy(n).addScaledVector(Qi,o).addScaledVector(er,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Ku={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ai={h:0,s:0,l:0},Cs={h:0,s:0,l:0};function Ea(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Xe=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Tt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=ct.workingColorSpace){return this.r=e,this.g=t,this.b=n,ct.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=ct.workingColorSpace){if(e=Vf(e,1),t=zt(t,0,1),n=zt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=Ea(o,s,e+1/3),this.g=Ea(o,s,e),this.b=Ea(o,s,e-1/3)}return ct.toWorkingColorSpace(this,r),this}setStyle(e,t=Tt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Tt){let n=Ku[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xr(e.r),this.g=xr(e.g),this.b=xr(e.b),this}copyLinearToSRGB(e){return this.r=fa(e.r),this.g=fa(e.g),this.b=fa(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Tt){return ct.fromWorkingColorSpace(Ht.copy(this),e),Math.round(zt(Ht.r*255,0,255))*65536+Math.round(zt(Ht.g*255,0,255))*256+Math.round(zt(Ht.b*255,0,255))}getHexString(e=Tt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.fromWorkingColorSpace(Ht.copy(this),t);let n=Ht.r,r=Ht.g,s=Ht.b,o=Math.max(n,r,s),a=Math.min(n,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ct.workingColorSpace){return ct.fromWorkingColorSpace(Ht.copy(this),t),e.r=Ht.r,e.g=Ht.g,e.b=Ht.b,e}getStyle(e=Tt){ct.fromWorkingColorSpace(Ht.copy(this),e);let t=Ht.r,n=Ht.g,r=Ht.b;return e!==Tt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(ai),this.setHSL(ai.h+e,ai.s+t,ai.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ai),e.getHSL(Cs);let n=ha(ai.h,Cs.h,t),r=ha(ai.s,Cs.s,t),s=ha(ai.l,Cs.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ht=new Xe;Xe.NAMES=Ku;var np=0,$n=class extends pi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=Zn(),this.name="",this.type="Material",this.blending=gr,this.side=fi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ba,this.blendDst=Ga,this.blendEquation=Ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Xe(0,0,0),this.blendAlpha=0,this.depthFunc=Js,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=zc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=qi,this.stencilZFail=qi,this.stencilZPass=qi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==gr&&(n.blending=this.blending),this.side!==fi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ba&&(n.blendSrc=this.blendSrc),this.blendDst!==Ga&&(n.blendDst=this.blendDst),this.blendEquation!==Ri&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Js&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==zc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==qi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==qi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==qi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},dt=class extends $n{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Ll,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Rt=new P,Ps=new J,Vt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Xa,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=ci,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ps.fromBufferAttribute(this,t),Ps.applyMatrix3(e),this.setXY(t,Ps.x,Ps.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix3(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix4(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Rt.fromBufferAttribute(this,t),Rt.applyNormalMatrix(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Rt.fromBufferAttribute(this,t),Rt.transformDirection(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ut(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array),s=ut(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Xa&&(e.usage=this.usage),e}};var co=class extends Vt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var uo=class extends Vt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Ye=class extends Vt{constructor(e,t,n){super(new Float32Array(e),t,n)}};var ip=0,hn=new ht,Ta=new Wt,tr=new P,rn=new Jn,Gr=new Jn,Ot=new P,wt=class i extends pi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ip++}),this.uuid=Zn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Zu(e)?uo:co)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new nt().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return hn.makeRotationFromQuaternion(e),this.applyMatrix4(hn),this}rotateX(e){return hn.makeRotationX(e),this.applyMatrix4(hn),this}rotateY(e){return hn.makeRotationY(e),this.applyMatrix4(hn),this}rotateZ(e){return hn.makeRotationZ(e),this.applyMatrix4(hn),this}translate(e,t,n){return hn.makeTranslation(e,t,n),this.applyMatrix4(hn),this}scale(e,t,n){return hn.makeScale(e,t,n),this.applyMatrix4(hn),this}lookAt(e){return Ta.lookAt(e),Ta.updateMatrix(),this.applyMatrix4(Ta.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(tr).negate(),this.translate(tr.x,tr.y,tr.z),this}setFromPoints(e){let t=[];for(let n=0,r=e.length;n<r;n++){let s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Ye(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Jn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];rn.setFromBufferAttribute(s),this.morphTargetsRelative?(Ot.addVectors(this.boundingBox.min,rn.min),this.boundingBox.expandByPoint(Ot),Ot.addVectors(this.boundingBox.max,rn.max),this.boundingBox.expandByPoint(Ot)):(this.boundingBox.expandByPoint(rn.min),this.boundingBox.expandByPoint(rn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Oi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new P,1/0);return}if(e){let n=this.boundingSphere.center;if(rn.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Gr.setFromBufferAttribute(a),this.morphTargetsRelative?(Ot.addVectors(rn.min,Gr.min),rn.expandByPoint(Ot),Ot.addVectors(rn.max,Gr.max),rn.expandByPoint(Ot)):(rn.expandByPoint(Gr.min),rn.expandByPoint(Gr.max))}rn.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)Ot.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(Ot));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Ot.fromBufferAttribute(a,c),l&&(tr.fromBufferAttribute(e,c),Ot.add(tr)),r=Math.max(r,n.distanceToSquared(Ot))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.array,r=t.position.array,s=t.normal.array,o=t.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Vt(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],u=[];for(let M=0;M<a;M++)c[M]=new P,u[M]=new P;let h=new P,d=new P,f=new P,g=new J,_=new J,m=new J,p=new P,v=new P;function x(M,U,z){h.fromArray(r,M*3),d.fromArray(r,U*3),f.fromArray(r,z*3),g.fromArray(o,M*2),_.fromArray(o,U*2),m.fromArray(o,z*2),d.sub(h),f.sub(h),_.sub(g),m.sub(g);let Y=1/(_.x*m.y-m.x*_.y);isFinite(Y)&&(p.copy(d).multiplyScalar(m.y).addScaledVector(f,-_.y).multiplyScalar(Y),v.copy(f).multiplyScalar(_.x).addScaledVector(d,-m.x).multiplyScalar(Y),c[M].add(p),c[U].add(p),c[z].add(p),u[M].add(v),u[U].add(v),u[z].add(v))}let b=this.groups;b.length===0&&(b=[{start:0,count:n.length}]);for(let M=0,U=b.length;M<U;++M){let z=b[M],Y=z.start,I=z.count;for(let D=Y,O=Y+I;D<O;D+=3)x(n[D+0],n[D+1],n[D+2])}let E=new P,S=new P,A=new P,C=new P;function y(M){A.fromArray(s,M*3),C.copy(A);let U=c[M];E.copy(U),E.sub(A.multiplyScalar(A.dot(U))).normalize(),S.crossVectors(C,U);let Y=S.dot(u[M])<0?-1:1;l[M*4]=E.x,l[M*4+1]=E.y,l[M*4+2]=E.z,l[M*4+3]=Y}for(let M=0,U=b.length;M<U;++M){let z=b[M],Y=z.start,I=z.count;for(let D=Y,O=Y+I;D<O;D+=3)y(n[D+0]),y(n[D+1]),y(n[D+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Vt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let r=new P,s=new P,o=new P,a=new P,l=new P,c=new P,u=new P,h=new P;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ot.fromBufferAttribute(e,t),Ot.normalize(),e.setXYZ(t,Ot.x,Ot.y,Ot.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new Vt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,n);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},jc=new ht,Ei=new $a,Is=new Oi,Qc=new P,nr=new P,ir=new P,rr=new P,Aa=new P,Ls=new P,Ds=new J,Us=new J,Ns=new J,eu=new P,tu=new P,nu=new P,Os=new P,Fs=new P,le=class extends Wt{constructor(e=new wt,t=new dt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Ls.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(Aa.fromBufferAttribute(h,e),o?Ls.addScaledVector(Aa,u):Ls.addScaledVector(Aa.sub(t),u))}t.add(Ls)}return t}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Is.copy(n.boundingSphere),Is.applyMatrix4(s),Ei.copy(e.ray).recast(e.near),!(Is.containsPoint(Ei.origin)===!1&&(Ei.intersectSphere(Is,Qc)===null||Ei.origin.distanceToSquared(Qc)>(e.far-e.near)**2))&&(jc.copy(s).invert(),Ei.copy(e.ray).applyMatrix4(jc),!(n.boundingBox!==null&&Ei.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ei)))}_computeIntersections(e,t,n){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],v=Math.max(m.start,f.start),x=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let b=v,E=x;b<E;b+=3){let S=a.getX(b),A=a.getX(b+1),C=a.getX(b+2);r=zs(this,p,e,n,c,u,h,S,A,C),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let v=a.getX(m),x=a.getX(m+1),b=a.getX(m+2);r=zs(this,o,e,n,c,u,h,v,x,b),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],v=Math.max(m.start,f.start),x=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let b=v,E=x;b<E;b+=3){let S=b,A=b+1,C=b+2;r=zs(this,p,e,n,c,u,h,S,A,C),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let v=m,x=m+1,b=m+2;r=zs(this,o,e,n,c,u,h,v,x,b),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function rp(i,e,t,n,r,s,o,a){let l;if(e.side===Ct?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===fi,a),l===null)return null;Fs.copy(a),Fs.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Fs);return c<t.near||c>t.far?null:{distance:c,point:Fs.clone(),object:i}}function zs(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,nr),i.getVertexPosition(l,ir),i.getVertexPosition(c,rr);let u=rp(i,e,t,n,nr,ir,rr,Os);if(u){r&&(Ds.fromBufferAttribute(r,a),Us.fromBufferAttribute(r,l),Ns.fromBufferAttribute(r,c),u.uv=Pi.getInterpolation(Os,nr,ir,rr,Ds,Us,Ns,new J)),s&&(Ds.fromBufferAttribute(s,a),Us.fromBufferAttribute(s,l),Ns.fromBufferAttribute(s,c),u.uv1=Pi.getInterpolation(Os,nr,ir,rr,Ds,Us,Ns,new J),u.uv2=u.uv1),o&&(eu.fromBufferAttribute(o,a),tu.fromBufferAttribute(o,l),nu.fromBufferAttribute(o,c),u.normal=Pi.getInterpolation(Os,nr,ir,rr,eu,tu,nu,new P),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new P,materialIndex:0};Pi.getNormal(nr,ir,rr,h.normal),u.face=h}return u}var sn=class i extends wt{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new Ye(c,3)),this.setAttribute("normal",new Ye(u,3)),this.setAttribute("uv",new Ye(h,2));function g(_,m,p,v,x,b,E,S,A,C,y){let M=b/A,U=E/C,z=b/2,Y=E/2,I=S/2,D=A+1,O=C+1,V=0,K=0,Z=new P;for(let re=0;re<O;re++){let se=re*U-Y;for(let pe=0;pe<D;pe++){let X=pe*M-z;Z[_]=X*v,Z[m]=se*x,Z[p]=I,c.push(Z.x,Z.y,Z.z),Z[_]=0,Z[m]=0,Z[p]=S>0?1:-1,u.push(Z.x,Z.y,Z.z),h.push(pe/A),h.push(1-re/C),V+=1}}for(let re=0;re<C;re++)for(let se=0;se<A;se++){let pe=d+se+D*re,X=d+se+D*(re+1),Q=d+(se+1)+D*(re+1),ee=d+(se+1)+D*re;l.push(pe,X,ee),l.push(X,Q,ee),K+=6}a.addGroup(f,K,y),f+=K,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Sr(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Yt(i){let e={};for(let t=0;t<i.length;t++){let n=Sr(i[t]);for(let r in n)e[r]=n[r]}return e}function sp(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Ju(i){return i.getRenderTarget()===null?i.outputColorSpace:ct.workingColorSpace}var op={clone:Sr,merge:Yt},ap=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,lp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,gn=class extends $n{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ap,this.fragmentShader=lp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Sr(e.uniforms),this.uniformsGroups=sp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ho=class extends Wt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ht,this.projectionMatrix=new ht,this.projectionMatrixInverse=new ht,this.coordinateSystem=Yn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},jt=class extends ho{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ya*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ua*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ya*2*Math.atan(Math.tan(ua*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ua*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},sr=-90,or=1,ja=class extends Wt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new jt(sr,or,e,t);r.layers=this.layers,this.add(r);let s=new jt(sr,or,e,t);s.layers=this.layers,this.add(s);let o=new jt(sr,or,e,t);o.layers=this.layers,this.add(o);let a=new jt(sr,or,e,t);a.layers=this.layers,this.add(a);let l=new jt(sr,or,e,t);l.layers=this.layers,this.add(l);let c=new jt(sr,or,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===Yn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===no)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},fo=class extends mn{constructor(e,t,n,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:yr,super(e,t,n,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Qa=class extends Qt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];t.encoding!==void 0&&(Zr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Di?Tt:pn),this.texture=new fo(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:dn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new sn(5,5,5),s=new gn({name:"CubemapFromEquirect",uniforms:Sr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ct,blending:ui});s.uniforms.tEquirect.value=t;let o=new le(r,s),a=t.minFilter;return t.minFilter===jr&&(t.minFilter=dn),new ja(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}},Ra=new P,cp=new P,up=new nt,Xn=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Ra.subVectors(n,t).cross(cp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Ra),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||up.getNormalMatrix(e),r=this.coplanarPoint(Ra).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ti=new Oi,ks=new P,Qr=class{constructor(e=new Xn,t=new Xn,n=new Xn,r=new Xn,s=new Xn,o=new Xn){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Yn){let n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],d=r[7],f=r[8],g=r[9],_=r[10],m=r[11],p=r[12],v=r[13],x=r[14],b=r[15];if(n[0].setComponents(l-s,d-c,m-f,b-p).normalize(),n[1].setComponents(l+s,d+c,m+f,b+p).normalize(),n[2].setComponents(l+o,d+u,m+g,b+v).normalize(),n[3].setComponents(l-o,d-u,m-g,b-v).normalize(),n[4].setComponents(l-a,d-h,m-_,b-x).normalize(),t===Yn)n[5].setComponents(l+a,d+h,m+_,b+x).normalize();else if(t===no)n[5].setComponents(a,h,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ti.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ti.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ti)}intersectsSprite(e){return Ti.center.set(0,0,0),Ti.radius=.7071067811865476,Ti.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ti)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ks.x=r.normal.x>0?e.max.x:e.min.x,ks.y=r.normal.y>0?e.max.y:e.min.y,ks.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ks)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function $u(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function hp(i,e){let t=e.isWebGL2,n=new WeakMap;function r(c,u){let h=c.array,d=c.usage,f=h.byteLength,g=i.createBuffer();i.bindBuffer(u,g),i.bufferData(u,h,d),c.onUploadCallback();let _;if(h instanceof Float32Array)_=i.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)_=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)_=i.SHORT;else if(h instanceof Uint32Array)_=i.UNSIGNED_INT;else if(h instanceof Int32Array)_=i.INT;else if(h instanceof Int8Array)_=i.BYTE;else if(h instanceof Uint8Array)_=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)_=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:_,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:f}}function s(c,u,h){let d=u.array,f=u._updateRange,g=u.updateRanges;if(i.bindBuffer(h,c),f.count===-1&&g.length===0&&i.bufferSubData(h,0,d),g.length!==0){for(let _=0,m=g.length;_<m;_++){let p=g[_];t?i.bufferSubData(h,p.start*d.BYTES_PER_ELEMENT,d,p.start,p.count):i.bufferSubData(h,p.start*d.BYTES_PER_ELEMENT,d.subarray(p.start,p.start+p.count))}u.clearUpdateRanges()}f.count!==-1&&(t?i.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d,f.offset,f.count):i.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d.subarray(f.offset,f.offset+f.count)),f.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let u=n.get(c);u&&(i.deleteBuffer(u.buffer),n.delete(c))}function l(c,u){if(c.isGLBufferAttribute){let d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let h=n.get(c);if(h===void 0)n.set(c,r(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}var en=class i extends wt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,u=l+1,h=e/a,d=t/l,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){let v=p*d-o;for(let x=0;x<c;x++){let b=x*h-s;g.push(b,-v,0),_.push(0,0,1),m.push(x/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let v=0;v<a;v++){let x=v+c*p,b=v+c*(p+1),E=v+1+c*(p+1),S=v+1+c*p;f.push(x,b,S),f.push(b,E,S)}this.setIndex(f),this.setAttribute("position",new Ye(g,3)),this.setAttribute("normal",new Ye(_,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},dp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,fp=`#ifdef USE_ALPHAHASH
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
#endif`,pp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,mp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gp=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,xp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,_p=`#ifdef USE_AOMAP
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
#endif`,yp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,vp=`#ifdef USE_BATCHING
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
#endif`,bp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Mp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Sp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Ep=`#ifdef USE_IRIDESCENCE
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
#endif`,Tp=`#ifdef USE_BUMPMAP
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
#endif`,Ap=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Rp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Cp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ip=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Lp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Dp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Up=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Np=`#define PI 3.141592653589793
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
} // validated`,Op=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Fp=`vec3 transformedNormal = objectNormal;
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
#endif`,zp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,kp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Bp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Gp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Hp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Vp=`
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
}`,Wp=`#ifdef USE_ENVMAP
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
#endif`,Xp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,qp=`#ifdef USE_ENVMAP
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
#endif`,Yp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Zp=`#ifdef USE_ENVMAP
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
#endif`,Kp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Jp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,$p=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,jp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Qp=`#ifdef USE_GRADIENTMAP
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
}`,em=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,tm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,nm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,im=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,rm=`uniform bool receiveShadow;
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
#endif`,sm=`#ifdef USE_ENVMAP
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
#endif`,om=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,am=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,cm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,um=`PhysicalMaterial material;
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
#endif`,hm=`struct PhysicalMaterial {
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
}`,dm=`
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
#endif`,fm=`#if defined( RE_IndirectDiffuse )
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
#endif`,pm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,mm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,gm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,xm=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,_m=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,ym=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,vm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,bm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Mm=`#if defined( USE_POINTS_UV )
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
#endif`,Sm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,wm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Em=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Tm=`#ifdef USE_MORPHNORMALS
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
#endif`,Am=`#ifdef USE_MORPHTARGETS
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
#endif`,Rm=`#ifdef USE_MORPHTARGETS
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
#endif`,Cm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Pm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Im=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Lm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Um=`#ifdef USE_NORMALMAP
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
#endif`,Nm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Om=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Fm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,zm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,km=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Bm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Gm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Hm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Vm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Wm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Xm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,qm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ym=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Zm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Km=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Jm=`float getShadowMask() {
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
}`,$m=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,jm=`#ifdef USE_SKINNING
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
#endif`,Qm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,e0=`#ifdef USE_SKINNING
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
#endif`,t0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,n0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,i0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,r0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,s0=`#ifdef USE_TRANSMISSION
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
#endif`,o0=`#ifdef USE_TRANSMISSION
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
#endif`,a0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,l0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,c0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,u0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,h0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,d0=`uniform sampler2D t2D;
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
}`,f0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,p0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,m0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,g0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,x0=`#include <common>
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
}`,_0=`#if DEPTH_PACKING == 3200
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
}`,y0=`#define DISTANCE
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
}`,v0=`#define DISTANCE
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
}`,b0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,M0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,S0=`uniform float scale;
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
}`,w0=`uniform vec3 diffuse;
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
}`,E0=`#include <common>
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
}`,T0=`uniform vec3 diffuse;
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
}`,A0=`#define LAMBERT
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
}`,R0=`#define LAMBERT
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
}`,C0=`#define MATCAP
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
}`,P0=`#define MATCAP
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
}`,I0=`#define NORMAL
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
}`,L0=`#define NORMAL
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
}`,D0=`#define PHONG
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
}`,U0=`#define PHONG
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
}`,N0=`#define STANDARD
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
}`,O0=`#define STANDARD
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
}`,F0=`#define TOON
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
}`,z0=`#define TOON
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
}`,k0=`uniform float size;
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
}`,B0=`uniform vec3 diffuse;
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
}`,G0=`#include <common>
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
}`,H0=`uniform vec3 color;
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
}`,V0=`uniform float rotation;
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
}`,W0=`uniform vec3 diffuse;
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
}`,Qe={alphahash_fragment:dp,alphahash_pars_fragment:fp,alphamap_fragment:pp,alphamap_pars_fragment:mp,alphatest_fragment:gp,alphatest_pars_fragment:xp,aomap_fragment:_p,aomap_pars_fragment:yp,batching_pars_vertex:vp,batching_vertex:bp,begin_vertex:Mp,beginnormal_vertex:Sp,bsdfs:wp,iridescence_fragment:Ep,bumpmap_pars_fragment:Tp,clipping_planes_fragment:Ap,clipping_planes_pars_fragment:Rp,clipping_planes_pars_vertex:Cp,clipping_planes_vertex:Pp,color_fragment:Ip,color_pars_fragment:Lp,color_pars_vertex:Dp,color_vertex:Up,common:Np,cube_uv_reflection_fragment:Op,defaultnormal_vertex:Fp,displacementmap_pars_vertex:zp,displacementmap_vertex:kp,emissivemap_fragment:Bp,emissivemap_pars_fragment:Gp,colorspace_fragment:Hp,colorspace_pars_fragment:Vp,envmap_fragment:Wp,envmap_common_pars_fragment:Xp,envmap_pars_fragment:qp,envmap_pars_vertex:Yp,envmap_physical_pars_fragment:sm,envmap_vertex:Zp,fog_vertex:Kp,fog_pars_vertex:Jp,fog_fragment:$p,fog_pars_fragment:jp,gradientmap_pars_fragment:Qp,lightmap_fragment:em,lightmap_pars_fragment:tm,lights_lambert_fragment:nm,lights_lambert_pars_fragment:im,lights_pars_begin:rm,lights_toon_fragment:om,lights_toon_pars_fragment:am,lights_phong_fragment:lm,lights_phong_pars_fragment:cm,lights_physical_fragment:um,lights_physical_pars_fragment:hm,lights_fragment_begin:dm,lights_fragment_maps:fm,lights_fragment_end:pm,logdepthbuf_fragment:mm,logdepthbuf_pars_fragment:gm,logdepthbuf_pars_vertex:xm,logdepthbuf_vertex:_m,map_fragment:ym,map_pars_fragment:vm,map_particle_fragment:bm,map_particle_pars_fragment:Mm,metalnessmap_fragment:Sm,metalnessmap_pars_fragment:wm,morphcolor_vertex:Em,morphnormal_vertex:Tm,morphtarget_pars_vertex:Am,morphtarget_vertex:Rm,normal_fragment_begin:Cm,normal_fragment_maps:Pm,normal_pars_fragment:Im,normal_pars_vertex:Lm,normal_vertex:Dm,normalmap_pars_fragment:Um,clearcoat_normal_fragment_begin:Nm,clearcoat_normal_fragment_maps:Om,clearcoat_pars_fragment:Fm,iridescence_pars_fragment:zm,opaque_fragment:km,packing:Bm,premultiplied_alpha_fragment:Gm,project_vertex:Hm,dithering_fragment:Vm,dithering_pars_fragment:Wm,roughnessmap_fragment:Xm,roughnessmap_pars_fragment:qm,shadowmap_pars_fragment:Ym,shadowmap_pars_vertex:Zm,shadowmap_vertex:Km,shadowmask_pars_fragment:Jm,skinbase_vertex:$m,skinning_pars_vertex:jm,skinning_vertex:Qm,skinnormal_vertex:e0,specularmap_fragment:t0,specularmap_pars_fragment:n0,tonemapping_fragment:i0,tonemapping_pars_fragment:r0,transmission_fragment:s0,transmission_pars_fragment:o0,uv_pars_fragment:a0,uv_pars_vertex:l0,uv_vertex:c0,worldpos_vertex:u0,background_vert:h0,background_frag:d0,backgroundCube_vert:f0,backgroundCube_frag:p0,cube_vert:m0,cube_frag:g0,depth_vert:x0,depth_frag:_0,distanceRGBA_vert:y0,distanceRGBA_frag:v0,equirect_vert:b0,equirect_frag:M0,linedashed_vert:S0,linedashed_frag:w0,meshbasic_vert:E0,meshbasic_frag:T0,meshlambert_vert:A0,meshlambert_frag:R0,meshmatcap_vert:C0,meshmatcap_frag:P0,meshnormal_vert:I0,meshnormal_frag:L0,meshphong_vert:D0,meshphong_frag:U0,meshphysical_vert:N0,meshphysical_frag:O0,meshtoon_vert:F0,meshtoon_frag:z0,points_vert:k0,points_frag:B0,shadow_vert:G0,shadow_frag:H0,sprite_vert:V0,sprite_frag:W0},xe={common:{diffuse:{value:new Xe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new nt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new nt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new nt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new nt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new nt},normalScale:{value:new J(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new nt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new nt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new nt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new nt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0},uvTransform:{value:new nt}},sprite:{diffuse:{value:new Xe(16777215)},opacity:{value:1},center:{value:new J(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}}},Ln={basic:{uniforms:Yt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:Yt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new Xe(0)}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:Yt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new Xe(0)},specular:{value:new Xe(1118481)},shininess:{value:30}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:Yt([xe.common,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.roughnessmap,xe.metalnessmap,xe.fog,xe.lights,{emissive:{value:new Xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:Yt([xe.common,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.gradientmap,xe.fog,xe.lights,{emissive:{value:new Xe(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:Yt([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:Yt([xe.points,xe.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:Yt([xe.common,xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:Yt([xe.common,xe.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:Yt([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:Yt([xe.sprite,xe.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new nt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distanceRGBA:{uniforms:Yt([xe.common,xe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distanceRGBA_vert,fragmentShader:Qe.distanceRGBA_frag},shadow:{uniforms:Yt([xe.lights,xe.fog,{color:{value:new Xe(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};Ln.physical={uniforms:Yt([Ln.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new nt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new nt},clearcoatNormalScale:{value:new J(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new nt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new nt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new nt},sheen:{value:0},sheenColor:{value:new Xe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new nt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new nt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new nt},transmissionSamplerSize:{value:new J},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new nt},attenuationDistance:{value:0},attenuationColor:{value:new Xe(0)},specularColor:{value:new Xe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new nt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new nt},anisotropyVector:{value:new J},anisotropyMap:{value:null},anisotropyMapTransform:{value:new nt}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};var Bs={r:0,b:0,g:0};function X0(i,e,t,n,r,s,o){let a=new Xe(0),l=s===!0?0:1,c,u,h=null,d=0,f=null;function g(m,p){let v=!1,x=p.isScene===!0?p.background:null;x&&x.isTexture&&(x=(p.backgroundBlurriness>0?t:e).get(x)),x===null?_(a,l):x&&x.isColor&&(_(x,1),v=!0);let b=i.xr.getEnvironmentBlendMode();b==="additive"?n.buffers.color.setClear(0,0,0,1,o):b==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||v)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),x&&(x.isCubeTexture||x.mapping===Po)?(u===void 0&&(u=new le(new sn(1,1,1),new gn({name:"BackgroundCubeMaterial",uniforms:Sr(Ln.backgroundCube.uniforms),vertexShader:Ln.backgroundCube.vertexShader,fragmentShader:Ln.backgroundCube.fragmentShader,side:Ct,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,S,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),u.material.uniforms.envMap.value=x,u.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=p.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,u.material.toneMapped=ct.getTransfer(x.colorSpace)!==pt,(h!==x||d!==x.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=x,d=x.version,f=i.toneMapping),u.layers.enableAll(),m.unshift(u,u.geometry,u.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new le(new en(2,2),new gn({name:"BackgroundMaterial",uniforms:Sr(Ln.background.uniforms),vertexShader:Ln.background.vertexShader,fragmentShader:Ln.background.fragmentShader,side:fi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,c.material.toneMapped=ct.getTransfer(x.colorSpace)!==pt,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,f=i.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function _(m,p){m.getRGB(Bs,Ju(i)),n.buffers.color.setClear(Bs.r,Bs.g,Bs.b,p,o)}return{getClearColor:function(){return a},setClearColor:function(m,p=1){a.set(m),l=p,_(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,_(a,l)},render:g}}function q0(i,e,t,n){let r=i.getParameter(i.MAX_VERTEX_ATTRIBS),s=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||s!==null,a={},l=m(null),c=l,u=!1;function h(I,D,O,V,K){let Z=!1;if(o){let re=_(V,O,D);c!==re&&(c=re,f(c.object)),Z=p(I,V,O,K),Z&&v(I,V,O,K)}else{let re=D.wireframe===!0;(c.geometry!==V.id||c.program!==O.id||c.wireframe!==re)&&(c.geometry=V.id,c.program=O.id,c.wireframe=re,Z=!0)}K!==null&&t.update(K,i.ELEMENT_ARRAY_BUFFER),(Z||u)&&(u=!1,C(I,D,O,V),K!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(K).buffer))}function d(){return n.isWebGL2?i.createVertexArray():s.createVertexArrayOES()}function f(I){return n.isWebGL2?i.bindVertexArray(I):s.bindVertexArrayOES(I)}function g(I){return n.isWebGL2?i.deleteVertexArray(I):s.deleteVertexArrayOES(I)}function _(I,D,O){let V=O.wireframe===!0,K=a[I.id];K===void 0&&(K={},a[I.id]=K);let Z=K[D.id];Z===void 0&&(Z={},K[D.id]=Z);let re=Z[V];return re===void 0&&(re=m(d()),Z[V]=re),re}function m(I){let D=[],O=[],V=[];for(let K=0;K<r;K++)D[K]=0,O[K]=0,V[K]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:O,attributeDivisors:V,object:I,attributes:{},index:null}}function p(I,D,O,V){let K=c.attributes,Z=D.attributes,re=0,se=O.getAttributes();for(let pe in se)if(se[pe].location>=0){let Q=K[pe],ee=Z[pe];if(ee===void 0&&(pe==="instanceMatrix"&&I.instanceMatrix&&(ee=I.instanceMatrix),pe==="instanceColor"&&I.instanceColor&&(ee=I.instanceColor)),Q===void 0||Q.attribute!==ee||ee&&Q.data!==ee.data)return!0;re++}return c.attributesNum!==re||c.index!==V}function v(I,D,O,V){let K={},Z=D.attributes,re=0,se=O.getAttributes();for(let pe in se)if(se[pe].location>=0){let Q=Z[pe];Q===void 0&&(pe==="instanceMatrix"&&I.instanceMatrix&&(Q=I.instanceMatrix),pe==="instanceColor"&&I.instanceColor&&(Q=I.instanceColor));let ee={};ee.attribute=Q,Q&&Q.data&&(ee.data=Q.data),K[pe]=ee,re++}c.attributes=K,c.attributesNum=re,c.index=V}function x(){let I=c.newAttributes;for(let D=0,O=I.length;D<O;D++)I[D]=0}function b(I){E(I,0)}function E(I,D){let O=c.newAttributes,V=c.enabledAttributes,K=c.attributeDivisors;O[I]=1,V[I]===0&&(i.enableVertexAttribArray(I),V[I]=1),K[I]!==D&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](I,D),K[I]=D)}function S(){let I=c.newAttributes,D=c.enabledAttributes;for(let O=0,V=D.length;O<V;O++)D[O]!==I[O]&&(i.disableVertexAttribArray(O),D[O]=0)}function A(I,D,O,V,K,Z,re){re===!0?i.vertexAttribIPointer(I,D,O,K,Z):i.vertexAttribPointer(I,D,O,V,K,Z)}function C(I,D,O,V){if(n.isWebGL2===!1&&(I.isInstancedMesh||V.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;x();let K=V.attributes,Z=O.getAttributes(),re=D.defaultAttributeValues;for(let se in Z){let pe=Z[se];if(pe.location>=0){let X=K[se];if(X===void 0&&(se==="instanceMatrix"&&I.instanceMatrix&&(X=I.instanceMatrix),se==="instanceColor"&&I.instanceColor&&(X=I.instanceColor)),X!==void 0){let Q=X.normalized,ee=X.itemSize,ce=t.get(X);if(ce===void 0)continue;let ve=ce.buffer,Oe=ce.type,De=ce.bytesPerElement,Ce=n.isWebGL2===!0&&(Oe===i.INT||Oe===i.UNSIGNED_INT||X.gpuType===Fu);if(X.isInterleavedBufferAttribute){let Ue=X.data,L=Ue.stride,ue=X.offset;if(Ue.isInstancedInterleavedBuffer){for(let $=0;$<pe.locationSize;$++)E(pe.location+$,Ue.meshPerAttribute);I.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=Ue.meshPerAttribute*Ue.count)}else for(let $=0;$<pe.locationSize;$++)b(pe.location+$);i.bindBuffer(i.ARRAY_BUFFER,ve);for(let $=0;$<pe.locationSize;$++)A(pe.location+$,ee/pe.locationSize,Oe,Q,L*De,(ue+ee/pe.locationSize*$)*De,Ce)}else{if(X.isInstancedBufferAttribute){for(let Ue=0;Ue<pe.locationSize;Ue++)E(pe.location+Ue,X.meshPerAttribute);I.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let Ue=0;Ue<pe.locationSize;Ue++)b(pe.location+Ue);i.bindBuffer(i.ARRAY_BUFFER,ve);for(let Ue=0;Ue<pe.locationSize;Ue++)A(pe.location+Ue,ee/pe.locationSize,Oe,Q,ee*De,ee/pe.locationSize*Ue*De,Ce)}}else if(re!==void 0){let Q=re[se];if(Q!==void 0)switch(Q.length){case 2:i.vertexAttrib2fv(pe.location,Q);break;case 3:i.vertexAttrib3fv(pe.location,Q);break;case 4:i.vertexAttrib4fv(pe.location,Q);break;default:i.vertexAttrib1fv(pe.location,Q)}}}}S()}function y(){z();for(let I in a){let D=a[I];for(let O in D){let V=D[O];for(let K in V)g(V[K].object),delete V[K];delete D[O]}delete a[I]}}function M(I){if(a[I.id]===void 0)return;let D=a[I.id];for(let O in D){let V=D[O];for(let K in V)g(V[K].object),delete V[K];delete D[O]}delete a[I.id]}function U(I){for(let D in a){let O=a[D];if(O[I.id]===void 0)continue;let V=O[I.id];for(let K in V)g(V[K].object),delete V[K];delete O[I.id]}}function z(){Y(),u=!0,c!==l&&(c=l,f(c.object))}function Y(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:z,resetDefaultState:Y,dispose:y,releaseStatesOfGeometry:M,releaseStatesOfProgram:U,initAttributes:x,enableAttribute:b,disableUnusedAttributes:S}}function Y0(i,e,t,n){let r=n.isWebGL2,s;function o(u){s=u}function a(u,h){i.drawArrays(s,u,h),t.update(h,s,1)}function l(u,h,d){if(d===0)return;let f,g;if(r)f=i,g="drawArraysInstanced";else if(f=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[g](s,u,h,d),t.update(h,s,d)}function c(u,h,d){if(d===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<d;g++)this.render(u[g],h[g]);else{f.multiDrawArraysWEBGL(s,u,0,h,0,d);let g=0;for(let _=0;_<d;_++)g+=h[_];t.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function Z0(i,e,t){let n;function r(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),_=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),p=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),x=d>0,b=o||e.has("OES_texture_float"),E=x&&b,S=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:d,maxTextureSize:f,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:m,maxVaryings:p,maxFragmentUniforms:v,vertexTextures:x,floatFragmentTextures:b,floatVertexTextures:E,maxSamples:S}}function K0(i){let e=this,t=null,n=0,r=!1,s=!1,o=new Xn,a=new nt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||n!==0||r;return r=d,n=h.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{let v=s?0:n,x=v*4,b=p.clippingState||null;l.value=b,b=u(g,d,x,f);for(let E=0;E!==x;++E)b[E]=t[E];p.clippingState=b,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){let _=h!==null?h.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let p=f+_*4,v=d.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<p)&&(m=new Float32Array(p));for(let x=0,b=f;x!==_;++x,b+=4)o.copy(h[x]).applyMatrix4(v,a),o.normal.toArray(m,b),m[b+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function J0(i){let e=new WeakMap;function t(o,a){return a===Ha?o.mapping=yr:a===Va&&(o.mapping=vr),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===Ha||a===Va)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Qa(l.height/2);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var jn=class extends ho{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},fr=4,iu=[.125,.215,.35,.446,.526,.582],Ci=20,Ca=new jn,ru=new Xe,Pa=null,Ia=0,La=0,Ai=(1+Math.sqrt(5))/2,ar=1/Ai,su=[new P(1,1,1),new P(-1,1,1),new P(1,1,-1),new P(-1,1,-1),new P(0,Ai,ar),new P(0,Ai,-ar),new P(ar,0,Ai),new P(-ar,0,Ai),new P(Ai,ar,0),new P(-Ai,ar,0)],wr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Pa=this._renderer.getRenderTarget(),Ia=this._renderer.getActiveCubeFace(),La=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=lu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=au(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Pa,Ia,La),e.scissorTest=!1,Gs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===yr||e.mapping===vr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Pa=this._renderer.getRenderTarget(),Ia=this._renderer.getActiveCubeFace(),La=this._renderer.getActiveMipmapLevel();let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:dn,minFilter:dn,generateMipmaps:!1,type:Ni,format:Tn,colorSpace:Kn,depthBuffer:!1},r=ou(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ou(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=$0(s)),this._blurMaterial=j0(s,e,t)}return r}_compileMaterial(e){let t=new le(this._lodPlanes[0],e);this._renderer.compile(t,Ca)}_sceneToCubeUV(e,t,n,r){let a=new jt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(ru),u.toneMapping=Dn,u.autoClear=!1;let f=new dt({name:"PMREM.Background",side:Ct,depthWrite:!1,depthTest:!1}),g=new le(new sn,f),_=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,_=!0):(f.color.copy(ru),_=!0);for(let p=0;p<6;p++){let v=p%3;v===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):v===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));let x=this._cubeSize;Gs(r,v*x,p>2?x:0,x,x),u.setRenderTarget(r),_&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===yr||e.mapping===vr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=lu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=au());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new le(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Gs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Ca)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=su[(r-1)%su.length];this._blur(e,r-1,r,s,o)}t.autoClear=n}_blur(e,t,n,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new le(this._lodPlanes[r],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Ci-1),_=s/g,m=isFinite(s)?1+Math.floor(u*_):Ci;m>Ci&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ci}`);let p=[],v=0;for(let A=0;A<Ci;++A){let C=A/_,y=Math.exp(-C*C/2);p.push(y),A===0?v+=y:A<m&&(v+=2*y)}for(let A=0;A<p.length;A++)p[A]=p[A]/v;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;let b=this._sizeLods[r],E=3*b*(r>x-fr?r-x+fr:0),S=4*(this._cubeSize-b);Gs(t,E,S,3*b,2*b),l.setRenderTarget(t),l.render(h,Ca)}};function $0(i){let e=[],t=[],n=[],r=i,s=i-fr+1+iu.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>i-fr?l=iu[o-i+fr-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,m=2,p=1,v=new Float32Array(_*g*f),x=new Float32Array(m*g*f),b=new Float32Array(p*g*f);for(let S=0;S<f;S++){let A=S%3*2/3-1,C=S>2?0:-1,y=[A,C,0,A+2/3,C,0,A+2/3,C+1,0,A,C,0,A+2/3,C+1,0,A,C+1,0];v.set(y,_*g*S),x.set(d,m*g*S);let M=[S,S,S,S,S,S];b.set(M,p*g*S)}let E=new wt;E.setAttribute("position",new Vt(v,_)),E.setAttribute("uv",new Vt(x,m)),E.setAttribute("faceIndex",new Vt(b,p)),e.push(E),r>fr&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function ou(i,e,t){let n=new Qt(i,e,t);return n.texture.mapping=Po,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Gs(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function j0(i,e,t){let n=new Float32Array(Ci),r=new P(0,1,0);return new gn({name:"SphericalGaussianBlur",defines:{n:Ci,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Fl(),fragmentShader:`

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
		`,blending:ui,depthTest:!1,depthWrite:!1})}function au(){return new gn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Fl(),fragmentShader:`

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
		`,blending:ui,depthTest:!1,depthWrite:!1})}function lu(){return new gn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Fl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ui,depthTest:!1,depthWrite:!1})}function Fl(){return`

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
	`}function Q0(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===Ha||l===Va,u=l===yr||l===vr;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new wr(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{let h=a.image;if(c&&h&&h.height>0||u&&h&&r(h)){t===null&&(t=new wr(i));let d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",s),d.texture}else return null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function eg(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){let r=t(n);return r===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function tg(i,e,t,n){let r={},s=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);for(let g in d.morphAttributes){let _=d.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)e.remove(_[m])}d.removeEventListener("dispose",o),delete r[d.id];let f=s.get(d);f&&(e.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let g in d)e.update(d[g],i.ARRAY_BUFFER);let f=h.morphAttributes;for(let g in f){let _=f[g];for(let m=0,p=_.length;m<p;m++)e.update(_[m],i.ARRAY_BUFFER)}}function c(h){let d=[],f=h.index,g=h.attributes.position,_=0;if(f!==null){let v=f.array;_=f.version;for(let x=0,b=v.length;x<b;x+=3){let E=v[x+0],S=v[x+1],A=v[x+2];d.push(E,S,S,A,A,E)}}else if(g!==void 0){let v=g.array;_=g.version;for(let x=0,b=v.length/3-1;x<b;x+=3){let E=x+0,S=x+1,A=x+2;d.push(E,S,S,A,A,E)}}else return;let m=new(Zu(d)?uo:co)(d,1);m.version=_;let p=s.get(h);p&&e.remove(p),s.set(h,m)}function u(h){let d=s.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function ng(i,e,t,n){let r=n.isWebGL2,s;function o(f){s=f}let a,l;function c(f){a=f.type,l=f.bytesPerElement}function u(f,g){i.drawElements(s,g,a,f*l),t.update(g,s,1)}function h(f,g,_){if(_===0)return;let m,p;if(r)m=i,p="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),p="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[p](s,g,a,f*l,_),t.update(g,s,_)}function d(f,g,_){if(_===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<_;p++)this.render(f[p]/l,g[p]);else{m.multiDrawElementsWEBGL(s,g,0,a,f,0,_);let p=0;for(let v=0;v<_;v++)p+=g[v];t.update(p,s,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=d}function ig(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function rg(i,e){return i[0]-e[0]}function sg(i,e){return Math.abs(e[1])-Math.abs(i[1])}function og(i,e,t){let n={},r=new Float32Array(8),s=new WeakMap,o=new xt,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){let d=c.morphTargetInfluences;if(e.isWebGL2===!0){let f=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,g=f!==void 0?f.length:0,_=s.get(u);if(_===void 0||_.count!==g){let I=function(){z.dispose(),s.delete(u),u.removeEventListener("dispose",I)};_!==void 0&&_.texture.dispose();let v=u.morphAttributes.position!==void 0,x=u.morphAttributes.normal!==void 0,b=u.morphAttributes.color!==void 0,E=u.morphAttributes.position||[],S=u.morphAttributes.normal||[],A=u.morphAttributes.color||[],C=0;v===!0&&(C=1),x===!0&&(C=2),b===!0&&(C=3);let y=u.attributes.position.count*C,M=1;y>e.maxTextureSize&&(M=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let U=new Float32Array(y*M*4*g),z=new oo(U,y,M,g);z.type=ci,z.needsUpdate=!0;let Y=C*4;for(let D=0;D<g;D++){let O=E[D],V=S[D],K=A[D],Z=y*M*4*D;for(let re=0;re<O.count;re++){let se=re*Y;v===!0&&(o.fromBufferAttribute(O,re),U[Z+se+0]=o.x,U[Z+se+1]=o.y,U[Z+se+2]=o.z,U[Z+se+3]=0),x===!0&&(o.fromBufferAttribute(V,re),U[Z+se+4]=o.x,U[Z+se+5]=o.y,U[Z+se+6]=o.z,U[Z+se+7]=0),b===!0&&(o.fromBufferAttribute(K,re),U[Z+se+8]=o.x,U[Z+se+9]=o.y,U[Z+se+10]=o.z,U[Z+se+11]=K.itemSize===4?o.w:1)}}_={count:g,texture:z,size:new J(y,M)},s.set(u,_),u.addEventListener("dispose",I)}let m=0;for(let v=0;v<d.length;v++)m+=d[v];let p=u.morphTargetsRelative?1:1-m;h.getUniforms().setValue(i,"morphTargetBaseInfluence",p),h.getUniforms().setValue(i,"morphTargetInfluences",d),h.getUniforms().setValue(i,"morphTargetsTexture",_.texture,t),h.getUniforms().setValue(i,"morphTargetsTextureSize",_.size)}else{let f=d===void 0?0:d.length,g=n[u.id];if(g===void 0||g.length!==f){g=[];for(let x=0;x<f;x++)g[x]=[x,0];n[u.id]=g}for(let x=0;x<f;x++){let b=g[x];b[0]=x,b[1]=d[x]}g.sort(sg);for(let x=0;x<8;x++)x<f&&g[x][1]?(a[x][0]=g[x][0],a[x][1]=g[x][1]):(a[x][0]=Number.MAX_SAFE_INTEGER,a[x][1]=0);a.sort(rg);let _=u.morphAttributes.position,m=u.morphAttributes.normal,p=0;for(let x=0;x<8;x++){let b=a[x],E=b[0],S=b[1];E!==Number.MAX_SAFE_INTEGER&&S?(_&&u.getAttribute("morphTarget"+x)!==_[E]&&u.setAttribute("morphTarget"+x,_[E]),m&&u.getAttribute("morphNormal"+x)!==m[E]&&u.setAttribute("morphNormal"+x,m[E]),r[x]=S,p+=S):(_&&u.hasAttribute("morphTarget"+x)===!0&&u.deleteAttribute("morphTarget"+x),m&&u.hasAttribute("morphNormal"+x)===!0&&u.deleteAttribute("morphNormal"+x),r[x]=0)}let v=u.morphTargetsRelative?1:1-p;h.getUniforms().setValue(i,"morphTargetBaseInfluence",v),h.getUniforms().setValue(i,"morphTargetInfluences",r)}}return{update:l}}function ag(i,e,t,n){let r=new WeakMap;function s(l){let c=n.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var po=class extends mn{constructor(e,t,n,r,s,o,a,l,c,u){if(u=u!==void 0?u:Li,u!==Li&&u!==Mr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Li&&(n=li),n===void 0&&u===Mr&&(n=Ii),super(null,r,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Zt,this.minFilter=l!==void 0?l:Zt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},ju=new mn,Qu=new po(1,1);Qu.compareFunction=Yu;var eh=new oo,th=new Ja,nh=new fo,cu=[],uu=[],hu=new Float32Array(16),du=new Float32Array(9),fu=new Float32Array(4);function Lr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=cu[r];if(s===void 0&&(s=new Float32Array(r),cu[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function It(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Lt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Lo(i,e){let t=uu[e];t===void 0&&(t=new Int32Array(e),uu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function lg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function cg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2fv(this.addr,e),Lt(t,e)}}function ug(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(It(t,e))return;i.uniform3fv(this.addr,e),Lt(t,e)}}function hg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4fv(this.addr,e),Lt(t,e)}}function dg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Lt(t,e)}else{if(It(t,n))return;fu.set(n),i.uniformMatrix2fv(this.addr,!1,fu),Lt(t,n)}}function fg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Lt(t,e)}else{if(It(t,n))return;du.set(n),i.uniformMatrix3fv(this.addr,!1,du),Lt(t,n)}}function pg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(It(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Lt(t,e)}else{if(It(t,n))return;hu.set(n),i.uniformMatrix4fv(this.addr,!1,hu),Lt(t,n)}}function mg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function gg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2iv(this.addr,e),Lt(t,e)}}function xg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;i.uniform3iv(this.addr,e),Lt(t,e)}}function _g(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4iv(this.addr,e),Lt(t,e)}}function yg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function vg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;i.uniform2uiv(this.addr,e),Lt(t,e)}}function bg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;i.uniform3uiv(this.addr,e),Lt(t,e)}}function Mg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;i.uniform4uiv(this.addr,e),Lt(t,e)}}function Sg(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s=this.type===i.SAMPLER_2D_SHADOW?Qu:ju;t.setTexture2D(e||s,r)}function wg(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||th,r)}function Eg(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||nh,r)}function Tg(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||eh,r)}function Ag(i){switch(i){case 5126:return lg;case 35664:return cg;case 35665:return ug;case 35666:return hg;case 35674:return dg;case 35675:return fg;case 35676:return pg;case 5124:case 35670:return mg;case 35667:case 35671:return gg;case 35668:case 35672:return xg;case 35669:case 35673:return _g;case 5125:return yg;case 36294:return vg;case 36295:return bg;case 36296:return Mg;case 35678:case 36198:case 36298:case 36306:case 35682:return Sg;case 35679:case 36299:case 36307:return wg;case 35680:case 36300:case 36308:case 36293:return Eg;case 36289:case 36303:case 36311:case 36292:return Tg}}function Rg(i,e){i.uniform1fv(this.addr,e)}function Cg(i,e){let t=Lr(e,this.size,2);i.uniform2fv(this.addr,t)}function Pg(i,e){let t=Lr(e,this.size,3);i.uniform3fv(this.addr,t)}function Ig(i,e){let t=Lr(e,this.size,4);i.uniform4fv(this.addr,t)}function Lg(i,e){let t=Lr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Dg(i,e){let t=Lr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ug(i,e){let t=Lr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Ng(i,e){i.uniform1iv(this.addr,e)}function Og(i,e){i.uniform2iv(this.addr,e)}function Fg(i,e){i.uniform3iv(this.addr,e)}function zg(i,e){i.uniform4iv(this.addr,e)}function kg(i,e){i.uniform1uiv(this.addr,e)}function Bg(i,e){i.uniform2uiv(this.addr,e)}function Gg(i,e){i.uniform3uiv(this.addr,e)}function Hg(i,e){i.uniform4uiv(this.addr,e)}function Vg(i,e,t){let n=this.cache,r=e.length,s=Lo(t,r);It(n,s)||(i.uniform1iv(this.addr,s),Lt(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||ju,s[o])}function Wg(i,e,t){let n=this.cache,r=e.length,s=Lo(t,r);It(n,s)||(i.uniform1iv(this.addr,s),Lt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||th,s[o])}function Xg(i,e,t){let n=this.cache,r=e.length,s=Lo(t,r);It(n,s)||(i.uniform1iv(this.addr,s),Lt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||nh,s[o])}function qg(i,e,t){let n=this.cache,r=e.length,s=Lo(t,r);It(n,s)||(i.uniform1iv(this.addr,s),Lt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||eh,s[o])}function Yg(i){switch(i){case 5126:return Rg;case 35664:return Cg;case 35665:return Pg;case 35666:return Ig;case 35674:return Lg;case 35675:return Dg;case 35676:return Ug;case 5124:case 35670:return Ng;case 35667:case 35671:return Og;case 35668:case 35672:return Fg;case 35669:case 35673:return zg;case 5125:return kg;case 36294:return Bg;case 36295:return Gg;case 36296:return Hg;case 35678:case 36198:case 36298:case 36306:case 35682:return Vg;case 35679:case 36299:case 36307:return Wg;case 35680:case 36300:case 36308:case 36293:return Xg;case 36289:case 36303:case 36311:case 36292:return qg}}var el=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ag(t.type)}},tl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Yg(t.type)}},nl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],n)}}},Da=/(\w+)(\])?(\[|\.)?/g;function pu(i,e){i.seq.push(e),i.map[e.id]=e}function Zg(i,e,t){let n=i.name,r=n.length;for(Da.lastIndex=0;;){let s=Da.exec(n),o=Da.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){pu(t,c===void 0?new el(a,i,e):new tl(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new nl(a),pu(t,h)),t=h}}}var _r=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Zg(s,o,this)}}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&n.push(o)}return n}};function mu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Kg=37297,Jg=0;function $g(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function jg(i){let e=ct.getPrimaries(ct.workingColorSpace),t=ct.getPrimaries(i),n;switch(e===t?n="":e===to&&t===eo?n="LinearDisplayP3ToLinearSRGB":e===eo&&t===to&&(n="LinearSRGBToLinearDisplayP3"),i){case Kn:case Io:return[n,"LinearTransferOETF"];case Tt:case Ol:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function gu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+$g(i.getShaderSource(e),o)}else return r}function Qg(i,e){let t=jg(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function ex(i,e){let t;switch(e){case yf:t="Linear";break;case vf:t="Reinhard";break;case bf:t="OptimizedCineon";break;case Dl:t="ACESFilmic";break;case Sf:t="AgX";break;case Mf:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function tx(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(pr).join(`
`)}function nx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(pr).join(`
`)}function ix(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function rx(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),o=s.name,a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function pr(i){return i!==""}function xu(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function _u(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var sx=/^[ \t]*#include +<([\w\d./]+)>/gm;function il(i){return i.replace(sx,ax)}var ox=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function ax(i,e){let t=Qe[e];if(t===void 0){let n=ox.get(e);if(n!==void 0)t=Qe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return il(t)}var lx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function yu(i){return i.replace(lx,cx)}function cx(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function vu(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function ux(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Nu?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Pl?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Wn&&(e="SHADOWMAP_TYPE_VSM"),e}function hx(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case yr:case vr:e="ENVMAP_TYPE_CUBE";break;case Po:e="ENVMAP_TYPE_CUBE_UV";break}return e}function dx(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===vr&&(e="ENVMAP_MODE_REFRACTION"),e}function fx(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Ll:e="ENVMAP_BLENDING_MULTIPLY";break;case xf:e="ENVMAP_BLENDING_MIX";break;case _f:e="ENVMAP_BLENDING_ADD";break}return e}function px(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function mx(i,e,t,n){let r=i.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=ux(t),c=hx(t),u=dx(t),h=fx(t),d=px(t),f=t.isWebGL2?"":tx(t),g=nx(t),_=ix(s),m=r.createProgram(),p,v,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(pr).join(`
`),p.length>0&&(p+=`
`),v=[f,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(pr).join(`
`),v.length>0&&(v+=`
`)):(p=[vu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(pr).join(`
`),v=[f,vu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Dn?"#define TONE_MAPPING":"",t.toneMapping!==Dn?Qe.tonemapping_pars_fragment:"",t.toneMapping!==Dn?ex("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,Qg("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(pr).join(`
`)),o=il(o),o=xu(o,t),o=_u(o,t),a=il(a),a=xu(a,t),a=_u(a,t),o=yu(o),a=yu(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,v=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===kc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===kc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);let b=x+p+o,E=x+v+a,S=mu(r,r.VERTEX_SHADER,b),A=mu(r,r.FRAGMENT_SHADER,E);r.attachShader(m,S),r.attachShader(m,A),t.index0AttributeName!==void 0?r.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(m,0,"position"),r.linkProgram(m);function C(z){if(i.debug.checkShaderErrors){let Y=r.getProgramInfoLog(m).trim(),I=r.getShaderInfoLog(S).trim(),D=r.getShaderInfoLog(A).trim(),O=!0,V=!0;if(r.getProgramParameter(m,r.LINK_STATUS)===!1)if(O=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,m,S,A);else{let K=gu(r,S,"vertex"),Z=gu(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(m,r.VALIDATE_STATUS)+`

Program Info Log: `+Y+`
`+K+`
`+Z)}else Y!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Y):(I===""||D==="")&&(V=!1);V&&(z.diagnostics={runnable:O,programLog:Y,vertexShader:{log:I,prefix:p},fragmentShader:{log:D,prefix:v}})}r.deleteShader(S),r.deleteShader(A),y=new _r(r,m),M=rx(r,m)}let y;this.getUniforms=function(){return y===void 0&&C(this),y};let M;this.getAttributes=function(){return M===void 0&&C(this),M};let U=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return U===!1&&(U=r.getProgramParameter(m,Kg)),U},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Jg++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=S,this.fragmentShader=A,this}var gx=0,rl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new sl(e),t.set(e,n)),n}},sl=class{constructor(e){this.id=gx++,this.code=e,this.usedTimes=0}};function xx(i,e,t,n,r,s,o){let a=new lo,l=new rl,c=[],u=r.isWebGL2,h=r.logarithmicDepthBuffer,d=r.vertexTextures,f=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(y){return y===0?"uv":`uv${y}`}function m(y,M,U,z,Y){let I=z.fog,D=Y.geometry,O=y.isMeshStandardMaterial?z.environment:null,V=(y.isMeshStandardMaterial?t:e).get(y.envMap||O),K=V&&V.mapping===Po?V.image.height:null,Z=g[y.type];y.precision!==null&&(f=r.getMaxPrecision(y.precision),f!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",f,"instead."));let re=D.morphAttributes.position||D.morphAttributes.normal||D.morphAttributes.color,se=re!==void 0?re.length:0,pe=0;D.morphAttributes.position!==void 0&&(pe=1),D.morphAttributes.normal!==void 0&&(pe=2),D.morphAttributes.color!==void 0&&(pe=3);let X,Q,ee,ce;if(Z){let de=Ln[Z];X=de.vertexShader,Q=de.fragmentShader}else X=y.vertexShader,Q=y.fragmentShader,l.update(y),ee=l.getVertexShaderID(y),ce=l.getFragmentShaderID(y);let ve=i.getRenderTarget(),Oe=Y.isInstancedMesh===!0,De=Y.isBatchedMesh===!0,Ce=!!y.map,Ue=!!y.matcap,L=!!V,ue=!!y.aoMap,$=!!y.lightMap,he=!!y.bumpMap,q=!!y.normalMap,Ie=!!y.displacementMap,be=!!y.emissiveMap,T=!!y.metalnessMap,w=!!y.roughnessMap,k=y.anisotropy>0,ie=y.clearcoat>0,oe=y.iridescence>0,te=y.sheen>0,Te=y.transmission>0,_e=k&&!!y.anisotropyMap,Se=ie&&!!y.clearcoatMap,Pe=ie&&!!y.clearcoatNormalMap,ze=ie&&!!y.clearcoatRoughnessMap,ne=oe&&!!y.iridescenceMap,it=oe&&!!y.iridescenceThicknessMap,Je=te&&!!y.sheenColorMap,Ge=te&&!!y.sheenRoughnessMap,Ne=!!y.specularMap,we=!!y.specularColorMap,qe=!!y.specularIntensityMap,rt=Te&&!!y.transmissionMap,mt=Te&&!!y.thicknessMap,je=!!y.gradientMap,me=!!y.alphaMap,N=y.alphaTest>0,ye=!!y.alphaHash,ge=!!y.extensions,ke=!!D.attributes.uv1,Fe=!!D.attributes.uv2,ot=!!D.attributes.uv3,at=Dn;return y.toneMapped&&(ve===null||ve.isXRRenderTarget===!0)&&(at=i.toneMapping),{isWebGL2:u,shaderID:Z,shaderType:y.type,shaderName:y.name,vertexShader:X,fragmentShader:Q,defines:y.defines,customVertexShaderID:ee,customFragmentShaderID:ce,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:f,batching:De,instancing:Oe,instancingColor:Oe&&Y.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:ve===null?i.outputColorSpace:ve.isXRRenderTarget===!0?ve.texture.colorSpace:Kn,map:Ce,matcap:Ue,envMap:L,envMapMode:L&&V.mapping,envMapCubeUVHeight:K,aoMap:ue,lightMap:$,bumpMap:he,normalMap:q,displacementMap:d&&Ie,emissiveMap:be,normalMapObjectSpace:q&&y.normalMapType===Nf,normalMapTangentSpace:q&&y.normalMapType===Nl,metalnessMap:T,roughnessMap:w,anisotropy:k,anisotropyMap:_e,clearcoat:ie,clearcoatMap:Se,clearcoatNormalMap:Pe,clearcoatRoughnessMap:ze,iridescence:oe,iridescenceMap:ne,iridescenceThicknessMap:it,sheen:te,sheenColorMap:Je,sheenRoughnessMap:Ge,specularMap:Ne,specularColorMap:we,specularIntensityMap:qe,transmission:Te,transmissionMap:rt,thicknessMap:mt,gradientMap:je,opaque:y.transparent===!1&&y.blending===gr,alphaMap:me,alphaTest:N,alphaHash:ye,combine:y.combine,mapUv:Ce&&_(y.map.channel),aoMapUv:ue&&_(y.aoMap.channel),lightMapUv:$&&_(y.lightMap.channel),bumpMapUv:he&&_(y.bumpMap.channel),normalMapUv:q&&_(y.normalMap.channel),displacementMapUv:Ie&&_(y.displacementMap.channel),emissiveMapUv:be&&_(y.emissiveMap.channel),metalnessMapUv:T&&_(y.metalnessMap.channel),roughnessMapUv:w&&_(y.roughnessMap.channel),anisotropyMapUv:_e&&_(y.anisotropyMap.channel),clearcoatMapUv:Se&&_(y.clearcoatMap.channel),clearcoatNormalMapUv:Pe&&_(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ze&&_(y.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&_(y.iridescenceMap.channel),iridescenceThicknessMapUv:it&&_(y.iridescenceThicknessMap.channel),sheenColorMapUv:Je&&_(y.sheenColorMap.channel),sheenRoughnessMapUv:Ge&&_(y.sheenRoughnessMap.channel),specularMapUv:Ne&&_(y.specularMap.channel),specularColorMapUv:we&&_(y.specularColorMap.channel),specularIntensityMapUv:qe&&_(y.specularIntensityMap.channel),transmissionMapUv:rt&&_(y.transmissionMap.channel),thicknessMapUv:mt&&_(y.thicknessMap.channel),alphaMapUv:me&&_(y.alphaMap.channel),vertexTangents:!!D.attributes.tangent&&(q||k),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!D.attributes.color&&D.attributes.color.itemSize===4,vertexUv1s:ke,vertexUv2s:Fe,vertexUv3s:ot,pointsUvs:Y.isPoints===!0&&!!D.attributes.uv&&(Ce||me),fog:!!I,useFog:y.fog===!0,fogExp2:I&&I.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:Y.isSkinnedMesh===!0,morphTargets:D.morphAttributes.position!==void 0,morphNormals:D.morphAttributes.normal!==void 0,morphColors:D.morphAttributes.color!==void 0,morphTargetsCount:se,morphTextureStride:pe,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:i.shadowMap.enabled&&U.length>0,shadowMapType:i.shadowMap.type,toneMapping:at,useLegacyLights:i._useLegacyLights,decodeVideoTexture:Ce&&y.map.isVideoTexture===!0&&ct.getTransfer(y.map.colorSpace)===pt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===fn,flipSided:y.side===Ct,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionDerivatives:ge&&y.extensions.derivatives===!0,extensionFragDepth:ge&&y.extensions.fragDepth===!0,extensionDrawBuffers:ge&&y.extensions.drawBuffers===!0,extensionShaderTextureLOD:ge&&y.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ge&&y.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:u||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()}}function p(y){let M=[];if(y.shaderID?M.push(y.shaderID):(M.push(y.customVertexShaderID),M.push(y.customFragmentShaderID)),y.defines!==void 0)for(let U in y.defines)M.push(U),M.push(y.defines[U]);return y.isRawShaderMaterial===!1&&(v(M,y),x(M,y),M.push(i.outputColorSpace)),M.push(y.customProgramCacheKey),M.join()}function v(y,M){y.push(M.precision),y.push(M.outputColorSpace),y.push(M.envMapMode),y.push(M.envMapCubeUVHeight),y.push(M.mapUv),y.push(M.alphaMapUv),y.push(M.lightMapUv),y.push(M.aoMapUv),y.push(M.bumpMapUv),y.push(M.normalMapUv),y.push(M.displacementMapUv),y.push(M.emissiveMapUv),y.push(M.metalnessMapUv),y.push(M.roughnessMapUv),y.push(M.anisotropyMapUv),y.push(M.clearcoatMapUv),y.push(M.clearcoatNormalMapUv),y.push(M.clearcoatRoughnessMapUv),y.push(M.iridescenceMapUv),y.push(M.iridescenceThicknessMapUv),y.push(M.sheenColorMapUv),y.push(M.sheenRoughnessMapUv),y.push(M.specularMapUv),y.push(M.specularColorMapUv),y.push(M.specularIntensityMapUv),y.push(M.transmissionMapUv),y.push(M.thicknessMapUv),y.push(M.combine),y.push(M.fogExp2),y.push(M.sizeAttenuation),y.push(M.morphTargetsCount),y.push(M.morphAttributeCount),y.push(M.numDirLights),y.push(M.numPointLights),y.push(M.numSpotLights),y.push(M.numSpotLightMaps),y.push(M.numHemiLights),y.push(M.numRectAreaLights),y.push(M.numDirLightShadows),y.push(M.numPointLightShadows),y.push(M.numSpotLightShadows),y.push(M.numSpotLightShadowsWithMaps),y.push(M.numLightProbes),y.push(M.shadowMapType),y.push(M.toneMapping),y.push(M.numClippingPlanes),y.push(M.numClipIntersection),y.push(M.depthPacking)}function x(y,M){a.disableAll(),M.isWebGL2&&a.enable(0),M.supportsVertexTextures&&a.enable(1),M.instancing&&a.enable(2),M.instancingColor&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),y.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.skinning&&a.enable(4),M.morphTargets&&a.enable(5),M.morphNormals&&a.enable(6),M.morphColors&&a.enable(7),M.premultipliedAlpha&&a.enable(8),M.shadowMapEnabled&&a.enable(9),M.useLegacyLights&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),y.push(a.mask)}function b(y){let M=g[y.type],U;if(M){let z=Ln[M];U=op.clone(z.uniforms)}else U=y.uniforms;return U}function E(y,M){let U;for(let z=0,Y=c.length;z<Y;z++){let I=c[z];if(I.cacheKey===M){U=I,++U.usedTimes;break}}return U===void 0&&(U=new mx(i,M,y,s),c.push(U)),U}function S(y){if(--y.usedTimes===0){let M=c.indexOf(y);c[M]=c[c.length-1],c.pop(),y.destroy()}}function A(y){l.remove(y)}function C(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:b,acquireProgram:E,releaseProgram:S,releaseShaderCache:A,programs:c,dispose:C}}function _x(){let i=new WeakMap;function e(s){let o=i.get(s);return o===void 0&&(o={},i.set(s,o)),o}function t(s){i.delete(s)}function n(s,o,a){i.get(s)[o]=a}function r(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:r}}function yx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function bu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Mu(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(h,d,f,g,_,m){let p=i[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),e++,p}function a(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?r.push(p):t.push(p)}function l(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?r.unshift(p):t.unshift(p)}function c(h,d){t.length>1&&t.sort(h||yx),n.length>1&&n.sort(d||bu),r.length>1&&r.sort(d||bu)}function u(){for(let h=e,d=i.length;h<d;h++){let f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function vx(){let i=new WeakMap;function e(n,r){let s=i.get(n),o;return s===void 0?(o=new Mu,i.set(n,[o])):r>=s.length?(o=new Mu,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function bx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Xe};break;case"SpotLight":t={position:new P,direction:new P,color:new Xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Xe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Xe,groundColor:new Xe};break;case"RectAreaLight":t={color:new Xe,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function Mx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Sx=0;function wx(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Ex(i,e){let t=new bx,n=Mx(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)r.probe.push(new P);let s=new P,o=new ht,a=new ht;function l(u,h){let d=0,f=0,g=0;for(let z=0;z<9;z++)r.probe[z].set(0,0,0);let _=0,m=0,p=0,v=0,x=0,b=0,E=0,S=0,A=0,C=0,y=0;u.sort(wx);let M=h===!0?Math.PI:1;for(let z=0,Y=u.length;z<Y;z++){let I=u[z],D=I.color,O=I.intensity,V=I.distance,K=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)d+=D.r*O*M,f+=D.g*O*M,g+=D.b*O*M;else if(I.isLightProbe){for(let Z=0;Z<9;Z++)r.probe[Z].addScaledVector(I.sh.coefficients[Z],O);y++}else if(I.isDirectionalLight){let Z=t.get(I);if(Z.color.copy(I.color).multiplyScalar(I.intensity*M),I.castShadow){let re=I.shadow,se=n.get(I);se.shadowBias=re.bias,se.shadowNormalBias=re.normalBias,se.shadowRadius=re.radius,se.shadowMapSize=re.mapSize,r.directionalShadow[_]=se,r.directionalShadowMap[_]=K,r.directionalShadowMatrix[_]=I.shadow.matrix,b++}r.directional[_]=Z,_++}else if(I.isSpotLight){let Z=t.get(I);Z.position.setFromMatrixPosition(I.matrixWorld),Z.color.copy(D).multiplyScalar(O*M),Z.distance=V,Z.coneCos=Math.cos(I.angle),Z.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),Z.decay=I.decay,r.spot[p]=Z;let re=I.shadow;if(I.map&&(r.spotLightMap[A]=I.map,A++,re.updateMatrices(I),I.castShadow&&C++),r.spotLightMatrix[p]=re.matrix,I.castShadow){let se=n.get(I);se.shadowBias=re.bias,se.shadowNormalBias=re.normalBias,se.shadowRadius=re.radius,se.shadowMapSize=re.mapSize,r.spotShadow[p]=se,r.spotShadowMap[p]=K,S++}p++}else if(I.isRectAreaLight){let Z=t.get(I);Z.color.copy(D).multiplyScalar(O),Z.halfWidth.set(I.width*.5,0,0),Z.halfHeight.set(0,I.height*.5,0),r.rectArea[v]=Z,v++}else if(I.isPointLight){let Z=t.get(I);if(Z.color.copy(I.color).multiplyScalar(I.intensity*M),Z.distance=I.distance,Z.decay=I.decay,I.castShadow){let re=I.shadow,se=n.get(I);se.shadowBias=re.bias,se.shadowNormalBias=re.normalBias,se.shadowRadius=re.radius,se.shadowMapSize=re.mapSize,se.shadowCameraNear=re.camera.near,se.shadowCameraFar=re.camera.far,r.pointShadow[m]=se,r.pointShadowMap[m]=K,r.pointShadowMatrix[m]=I.shadow.matrix,E++}r.point[m]=Z,m++}else if(I.isHemisphereLight){let Z=t.get(I);Z.skyColor.copy(I.color).multiplyScalar(O*M),Z.groundColor.copy(I.groundColor).multiplyScalar(O*M),r.hemi[x]=Z,x++}}v>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=xe.LTC_FLOAT_1,r.rectAreaLTC2=xe.LTC_FLOAT_2):(r.rectAreaLTC1=xe.LTC_HALF_1,r.rectAreaLTC2=xe.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=xe.LTC_FLOAT_1,r.rectAreaLTC2=xe.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=xe.LTC_HALF_1,r.rectAreaLTC2=xe.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=d,r.ambient[1]=f,r.ambient[2]=g;let U=r.hash;(U.directionalLength!==_||U.pointLength!==m||U.spotLength!==p||U.rectAreaLength!==v||U.hemiLength!==x||U.numDirectionalShadows!==b||U.numPointShadows!==E||U.numSpotShadows!==S||U.numSpotMaps!==A||U.numLightProbes!==y)&&(r.directional.length=_,r.spot.length=p,r.rectArea.length=v,r.point.length=m,r.hemi.length=x,r.directionalShadow.length=b,r.directionalShadowMap.length=b,r.pointShadow.length=E,r.pointShadowMap.length=E,r.spotShadow.length=S,r.spotShadowMap.length=S,r.directionalShadowMatrix.length=b,r.pointShadowMatrix.length=E,r.spotLightMatrix.length=S+A-C,r.spotLightMap.length=A,r.numSpotLightShadowsWithMaps=C,r.numLightProbes=y,U.directionalLength=_,U.pointLength=m,U.spotLength=p,U.rectAreaLength=v,U.hemiLength=x,U.numDirectionalShadows=b,U.numPointShadows=E,U.numSpotShadows=S,U.numSpotMaps=A,U.numLightProbes=y,r.version=Sx++)}function c(u,h){let d=0,f=0,g=0,_=0,m=0,p=h.matrixWorldInverse;for(let v=0,x=u.length;v<x;v++){let b=u[v];if(b.isDirectionalLight){let E=r.directional[d];E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),d++}else if(b.isSpotLight){let E=r.spot[g];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),g++}else if(b.isRectAreaLight){let E=r.rectArea[_];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),a.identity(),o.copy(b.matrixWorld),o.premultiply(p),a.extractRotation(o),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),_++}else if(b.isPointLight){let E=r.point[f];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),f++}else if(b.isHemisphereLight){let E=r.hemi[m];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(p),m++}}}return{setup:l,setupView:c,state:r}}function Su(i,e){let t=new Ex(i,e),n=[],r=[];function s(){n.length=0,r.length=0}function o(h){n.push(h)}function a(h){r.push(h)}function l(h){t.setup(n,h)}function c(h){t.setupView(n,h)}return{init:s,state:{lightsArray:n,shadowsArray:r,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function Tx(i,e){let t=new WeakMap;function n(s,o=0){let a=t.get(s),l;return a===void 0?(l=new Su(i,e),t.set(s,[l])):o>=a.length?(l=new Su(i,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:n,dispose:r}}var ol=class extends $n{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Df,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},al=class extends $n{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},Ax=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Rx=`uniform sampler2D shadow_pass;
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
}`;function Cx(i,e,t){let n=new Qr,r=new J,s=new J,o=new xt,a=new ol({depthPacking:Uf}),l=new al,c={},u=t.maxTextureSize,h={[fi]:Ct,[Ct]:fi,[fn]:fn},d=new gn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new J},radius:{value:4}},vertexShader:Ax,fragmentShader:Rx}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new wt;g.setAttribute("position",new Vt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new le(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nu;let p=this.type;this.render=function(S,A,C){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;let y=i.getRenderTarget(),M=i.getActiveCubeFace(),U=i.getActiveMipmapLevel(),z=i.state;z.setBlending(ui),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let Y=p!==Wn&&this.type===Wn,I=p===Wn&&this.type!==Wn;for(let D=0,O=S.length;D<O;D++){let V=S[D],K=V.shadow;if(K===void 0){console.warn("THREE.WebGLShadowMap:",V,"has no shadow.");continue}if(K.autoUpdate===!1&&K.needsUpdate===!1)continue;r.copy(K.mapSize);let Z=K.getFrameExtents();if(r.multiply(Z),s.copy(K.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/Z.x),r.x=s.x*Z.x,K.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/Z.y),r.y=s.y*Z.y,K.mapSize.y=s.y)),K.map===null||Y===!0||I===!0){let se=this.type!==Wn?{minFilter:Zt,magFilter:Zt}:{};K.map!==null&&K.map.dispose(),K.map=new Qt(r.x,r.y,se),K.map.texture.name=V.name+".shadowMap",K.camera.updateProjectionMatrix()}i.setRenderTarget(K.map),i.clear();let re=K.getViewportCount();for(let se=0;se<re;se++){let pe=K.getViewport(se);o.set(s.x*pe.x,s.y*pe.y,s.x*pe.z,s.y*pe.w),z.viewport(o),K.updateMatrices(V,se),n=K.getFrustum(),b(A,C,K.camera,V,this.type)}K.isPointLightShadow!==!0&&this.type===Wn&&v(K,C),K.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(y,M,U)};function v(S,A){let C=e.update(_);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new Qt(r.x,r.y)),d.uniforms.shadow_pass.value=S.map.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(A,null,C,d,_,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(A,null,C,f,_,null)}function x(S,A,C,y){let M=null,U=C.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(U!==void 0)M=U;else if(M=C.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){let z=M.uuid,Y=A.uuid,I=c[z];I===void 0&&(I={},c[z]=I);let D=I[Y];D===void 0&&(D=M.clone(),I[Y]=D,A.addEventListener("dispose",E)),M=D}if(M.visible=A.visible,M.wireframe=A.wireframe,y===Wn?M.side=A.shadowSide!==null?A.shadowSide:A.side:M.side=A.shadowSide!==null?A.shadowSide:h[A.side],M.alphaMap=A.alphaMap,M.alphaTest=A.alphaTest,M.map=A.map,M.clipShadows=A.clipShadows,M.clippingPlanes=A.clippingPlanes,M.clipIntersection=A.clipIntersection,M.displacementMap=A.displacementMap,M.displacementScale=A.displacementScale,M.displacementBias=A.displacementBias,M.wireframeLinewidth=A.wireframeLinewidth,M.linewidth=A.linewidth,C.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let z=i.properties.get(M);z.light=C}return M}function b(S,A,C,y,M){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&M===Wn)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,S.matrixWorld);let Y=e.update(S),I=S.material;if(Array.isArray(I)){let D=Y.groups;for(let O=0,V=D.length;O<V;O++){let K=D[O],Z=I[K.materialIndex];if(Z&&Z.visible){let re=x(S,Z,y,M);S.onBeforeShadow(i,S,A,C,Y,re,K),i.renderBufferDirect(C,null,Y,re,S,K),S.onAfterShadow(i,S,A,C,Y,re,K)}}}else if(I.visible){let D=x(S,I,y,M);S.onBeforeShadow(i,S,A,C,Y,D,null),i.renderBufferDirect(C,null,Y,D,S,null),S.onAfterShadow(i,S,A,C,Y,D,null)}}let z=S.children;for(let Y=0,I=z.length;Y<I;Y++)b(z[Y],A,C,y,M)}function E(S){S.target.removeEventListener("dispose",E);for(let C in c){let y=c[C],M=S.target.uuid;M in y&&(y[M].dispose(),delete y[M])}}}function Px(i,e,t){let n=t.isWebGL2;function r(){let N=!1,ye=new xt,ge=null,ke=new xt(0,0,0,0);return{setMask:function(Fe){ge!==Fe&&!N&&(i.colorMask(Fe,Fe,Fe,Fe),ge=Fe)},setLocked:function(Fe){N=Fe},setClear:function(Fe,ot,at,j,de){de===!0&&(Fe*=j,ot*=j,at*=j),ye.set(Fe,ot,at,j),ke.equals(ye)===!1&&(i.clearColor(Fe,ot,at,j),ke.copy(ye))},reset:function(){N=!1,ge=null,ke.set(-1,0,0,0)}}}function s(){let N=!1,ye=null,ge=null,ke=null;return{setTest:function(Fe){Fe?De(i.DEPTH_TEST):Ce(i.DEPTH_TEST)},setMask:function(Fe){ye!==Fe&&!N&&(i.depthMask(Fe),ye=Fe)},setFunc:function(Fe){if(ge!==Fe){switch(Fe){case hf:i.depthFunc(i.NEVER);break;case df:i.depthFunc(i.ALWAYS);break;case ff:i.depthFunc(i.LESS);break;case Js:i.depthFunc(i.LEQUAL);break;case pf:i.depthFunc(i.EQUAL);break;case mf:i.depthFunc(i.GEQUAL);break;case Il:i.depthFunc(i.GREATER);break;case gf:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ge=Fe}},setLocked:function(Fe){N=Fe},setClear:function(Fe){ke!==Fe&&(i.clearDepth(Fe),ke=Fe)},reset:function(){N=!1,ye=null,ge=null,ke=null}}}function o(){let N=!1,ye=null,ge=null,ke=null,Fe=null,ot=null,at=null,j=null,de=null;return{setTest:function(fe){N||(fe?De(i.STENCIL_TEST):Ce(i.STENCIL_TEST))},setMask:function(fe){ye!==fe&&!N&&(i.stencilMask(fe),ye=fe)},setFunc:function(fe,Ae,Ze){(ge!==fe||ke!==Ae||Fe!==Ze)&&(i.stencilFunc(fe,Ae,Ze),ge=fe,ke=Ae,Fe=Ze)},setOp:function(fe,Ae,Ze){(ot!==fe||at!==Ae||j!==Ze)&&(i.stencilOp(fe,Ae,Ze),ot=fe,at=Ae,j=Ze)},setLocked:function(fe){N=fe},setClear:function(fe){de!==fe&&(i.clearStencil(fe),de=fe)},reset:function(){N=!1,ye=null,ge=null,ke=null,Fe=null,ot=null,at=null,j=null,de=null}}}let a=new r,l=new s,c=new o,u=new WeakMap,h=new WeakMap,d={},f={},g=new WeakMap,_=[],m=null,p=!1,v=null,x=null,b=null,E=null,S=null,A=null,C=null,y=new Xe(0,0,0),M=0,U=!1,z=null,Y=null,I=null,D=null,O=null,V=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),K=!1,Z=0,re=i.getParameter(i.VERSION);re.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(re)[1]),K=Z>=1):re.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),K=Z>=2);let se=null,pe={},X=i.getParameter(i.SCISSOR_BOX),Q=i.getParameter(i.VIEWPORT),ee=new xt().fromArray(X),ce=new xt().fromArray(Q);function ve(N,ye,ge,ke){let Fe=new Uint8Array(4),ot=i.createTexture();i.bindTexture(N,ot),i.texParameteri(N,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(N,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let at=0;at<ge;at++)n&&(N===i.TEXTURE_3D||N===i.TEXTURE_2D_ARRAY)?i.texImage3D(ye,0,i.RGBA,1,1,ke,0,i.RGBA,i.UNSIGNED_BYTE,Fe):i.texImage2D(ye+at,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Fe);return ot}let Oe={};Oe[i.TEXTURE_2D]=ve(i.TEXTURE_2D,i.TEXTURE_2D,1),Oe[i.TEXTURE_CUBE_MAP]=ve(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Oe[i.TEXTURE_2D_ARRAY]=ve(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Oe[i.TEXTURE_3D]=ve(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),De(i.DEPTH_TEST),l.setFunc(Js),be(!1),T(rc),De(i.CULL_FACE),q(ui);function De(N){d[N]!==!0&&(i.enable(N),d[N]=!0)}function Ce(N){d[N]!==!1&&(i.disable(N),d[N]=!1)}function Ue(N,ye){return f[N]!==ye?(i.bindFramebuffer(N,ye),f[N]=ye,n&&(N===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=ye),N===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=ye)),!0):!1}function L(N,ye){let ge=_,ke=!1;if(N)if(ge=g.get(ye),ge===void 0&&(ge=[],g.set(ye,ge)),N.isWebGLMultipleRenderTargets){let Fe=N.texture;if(ge.length!==Fe.length||ge[0]!==i.COLOR_ATTACHMENT0){for(let ot=0,at=Fe.length;ot<at;ot++)ge[ot]=i.COLOR_ATTACHMENT0+ot;ge.length=Fe.length,ke=!0}}else ge[0]!==i.COLOR_ATTACHMENT0&&(ge[0]=i.COLOR_ATTACHMENT0,ke=!0);else ge[0]!==i.BACK&&(ge[0]=i.BACK,ke=!0);ke&&(t.isWebGL2?i.drawBuffers(ge):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(ge))}function ue(N){return m!==N?(i.useProgram(N),m=N,!0):!1}let $={[Ri]:i.FUNC_ADD,[Kd]:i.FUNC_SUBTRACT,[Jd]:i.FUNC_REVERSE_SUBTRACT};if(n)$[ac]=i.MIN,$[lc]=i.MAX;else{let N=e.get("EXT_blend_minmax");N!==null&&($[ac]=N.MIN_EXT,$[lc]=N.MAX_EXT)}let he={[$d]:i.ZERO,[jd]:i.ONE,[Qd]:i.SRC_COLOR,[Ba]:i.SRC_ALPHA,[of]:i.SRC_ALPHA_SATURATE,[rf]:i.DST_COLOR,[tf]:i.DST_ALPHA,[ef]:i.ONE_MINUS_SRC_COLOR,[Ga]:i.ONE_MINUS_SRC_ALPHA,[sf]:i.ONE_MINUS_DST_COLOR,[nf]:i.ONE_MINUS_DST_ALPHA,[af]:i.CONSTANT_COLOR,[lf]:i.ONE_MINUS_CONSTANT_COLOR,[cf]:i.CONSTANT_ALPHA,[uf]:i.ONE_MINUS_CONSTANT_ALPHA};function q(N,ye,ge,ke,Fe,ot,at,j,de,fe){if(N===ui){p===!0&&(Ce(i.BLEND),p=!1);return}if(p===!1&&(De(i.BLEND),p=!0),N!==Zd){if(N!==v||fe!==U){if((x!==Ri||S!==Ri)&&(i.blendEquation(i.FUNC_ADD),x=Ri,S=Ri),fe)switch(N){case gr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ui:i.blendFunc(i.ONE,i.ONE);break;case sc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case oc:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case gr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ui:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case sc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case oc:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}b=null,E=null,A=null,C=null,y.set(0,0,0),M=0,v=N,U=fe}return}Fe=Fe||ye,ot=ot||ge,at=at||ke,(ye!==x||Fe!==S)&&(i.blendEquationSeparate($[ye],$[Fe]),x=ye,S=Fe),(ge!==b||ke!==E||ot!==A||at!==C)&&(i.blendFuncSeparate(he[ge],he[ke],he[ot],he[at]),b=ge,E=ke,A=ot,C=at),(j.equals(y)===!1||de!==M)&&(i.blendColor(j.r,j.g,j.b,de),y.copy(j),M=de),v=N,U=!1}function Ie(N,ye){N.side===fn?Ce(i.CULL_FACE):De(i.CULL_FACE);let ge=N.side===Ct;ye&&(ge=!ge),be(ge),N.blending===gr&&N.transparent===!1?q(ui):q(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),l.setFunc(N.depthFunc),l.setTest(N.depthTest),l.setMask(N.depthWrite),a.setMask(N.colorWrite);let ke=N.stencilWrite;c.setTest(ke),ke&&(c.setMask(N.stencilWriteMask),c.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),c.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),k(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?De(i.SAMPLE_ALPHA_TO_COVERAGE):Ce(i.SAMPLE_ALPHA_TO_COVERAGE)}function be(N){z!==N&&(N?i.frontFace(i.CW):i.frontFace(i.CCW),z=N)}function T(N){N!==qd?(De(i.CULL_FACE),N!==Y&&(N===rc?i.cullFace(i.BACK):N===Yd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ce(i.CULL_FACE),Y=N}function w(N){N!==I&&(K&&i.lineWidth(N),I=N)}function k(N,ye,ge){N?(De(i.POLYGON_OFFSET_FILL),(D!==ye||O!==ge)&&(i.polygonOffset(ye,ge),D=ye,O=ge)):Ce(i.POLYGON_OFFSET_FILL)}function ie(N){N?De(i.SCISSOR_TEST):Ce(i.SCISSOR_TEST)}function oe(N){N===void 0&&(N=i.TEXTURE0+V-1),se!==N&&(i.activeTexture(N),se=N)}function te(N,ye,ge){ge===void 0&&(se===null?ge=i.TEXTURE0+V-1:ge=se);let ke=pe[ge];ke===void 0&&(ke={type:void 0,texture:void 0},pe[ge]=ke),(ke.type!==N||ke.texture!==ye)&&(se!==ge&&(i.activeTexture(ge),se=ge),i.bindTexture(N,ye||Oe[N]),ke.type=N,ke.texture=ye)}function Te(){let N=pe[se];N!==void 0&&N.type!==void 0&&(i.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function _e(){try{i.compressedTexImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Se(){try{i.compressedTexImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Pe(){try{i.texSubImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ze(){try{i.texSubImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ne(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function it(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Je(){try{i.texStorage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ge(){try{i.texStorage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ne(){try{i.texImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function we(){try{i.texImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function qe(N){ee.equals(N)===!1&&(i.scissor(N.x,N.y,N.z,N.w),ee.copy(N))}function rt(N){ce.equals(N)===!1&&(i.viewport(N.x,N.y,N.z,N.w),ce.copy(N))}function mt(N,ye){let ge=h.get(ye);ge===void 0&&(ge=new WeakMap,h.set(ye,ge));let ke=ge.get(N);ke===void 0&&(ke=i.getUniformBlockIndex(ye,N.name),ge.set(N,ke))}function je(N,ye){let ke=h.get(ye).get(N);u.get(ye)!==ke&&(i.uniformBlockBinding(ye,ke,N.__bindingPointIndex),u.set(ye,ke))}function me(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},se=null,pe={},f={},g=new WeakMap,_=[],m=null,p=!1,v=null,x=null,b=null,E=null,S=null,A=null,C=null,y=new Xe(0,0,0),M=0,U=!1,z=null,Y=null,I=null,D=null,O=null,ee.set(0,0,i.canvas.width,i.canvas.height),ce.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:De,disable:Ce,bindFramebuffer:Ue,drawBuffers:L,useProgram:ue,setBlending:q,setMaterial:Ie,setFlipSided:be,setCullFace:T,setLineWidth:w,setPolygonOffset:k,setScissorTest:ie,activeTexture:oe,bindTexture:te,unbindTexture:Te,compressedTexImage2D:_e,compressedTexImage3D:Se,texImage2D:Ne,texImage3D:we,updateUBOMapping:mt,uniformBlockBinding:je,texStorage2D:Je,texStorage3D:Ge,texSubImage2D:Pe,texSubImage3D:ze,compressedTexSubImage2D:ne,compressedTexSubImage3D:it,scissor:qe,viewport:rt,reset:me}}function Ix(i,e,t,n,r,s,o){let a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,w){return f?new OffscreenCanvas(T,w):io("canvas")}function _(T,w,k,ie){let oe=1;if((T.width>ie||T.height>ie)&&(oe=ie/Math.max(T.width,T.height)),oe<1||w===!0)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap){let te=w?Za:Math.floor,Te=te(oe*T.width),_e=te(oe*T.height);h===void 0&&(h=g(Te,_e));let Se=k?g(Te,_e):h;return Se.width=Te,Se.height=_e,Se.getContext("2d").drawImage(T,0,0,Te,_e),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+T.width+"x"+T.height+") to ("+Te+"x"+_e+")."),Se}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+T.width+"x"+T.height+")."),T;return T}function m(T){return Bc(T.width)&&Bc(T.height)}function p(T){return a?!1:T.wrapS!==kt||T.wrapT!==kt||T.minFilter!==Zt&&T.minFilter!==dn}function v(T,w){return T.generateMipmaps&&w&&T.minFilter!==Zt&&T.minFilter!==dn}function x(T){i.generateMipmap(T)}function b(T,w,k,ie,oe=!1){if(a===!1)return w;if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let te=w;if(w===i.RED&&(k===i.FLOAT&&(te=i.R32F),k===i.HALF_FLOAT&&(te=i.R16F),k===i.UNSIGNED_BYTE&&(te=i.R8)),w===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(te=i.R8UI),k===i.UNSIGNED_SHORT&&(te=i.R16UI),k===i.UNSIGNED_INT&&(te=i.R32UI),k===i.BYTE&&(te=i.R8I),k===i.SHORT&&(te=i.R16I),k===i.INT&&(te=i.R32I)),w===i.RG&&(k===i.FLOAT&&(te=i.RG32F),k===i.HALF_FLOAT&&(te=i.RG16F),k===i.UNSIGNED_BYTE&&(te=i.RG8)),w===i.RGBA){let Te=oe?Qs:ct.getTransfer(ie);k===i.FLOAT&&(te=i.RGBA32F),k===i.HALF_FLOAT&&(te=i.RGBA16F),k===i.UNSIGNED_BYTE&&(te=Te===pt?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT_4_4_4_4&&(te=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(te=i.RGB5_A1)}return(te===i.R16F||te===i.R32F||te===i.RG16F||te===i.RG32F||te===i.RGBA16F||te===i.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function E(T,w,k){return v(T,k)===!0||T.isFramebufferTexture&&T.minFilter!==Zt&&T.minFilter!==dn?Math.log2(Math.max(w.width,w.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?w.mipmaps.length:1}function S(T){return T===Zt||T===cc||T===ia?i.NEAREST:i.LINEAR}function A(T){let w=T.target;w.removeEventListener("dispose",A),y(w),w.isVideoTexture&&u.delete(w)}function C(T){let w=T.target;w.removeEventListener("dispose",C),U(w)}function y(T){let w=n.get(T);if(w.__webglInit===void 0)return;let k=T.source,ie=d.get(k);if(ie){let oe=ie[w.__cacheKey];oe.usedTimes--,oe.usedTimes===0&&M(T),Object.keys(ie).length===0&&d.delete(k)}n.remove(T)}function M(T){let w=n.get(T);i.deleteTexture(w.__webglTexture);let k=T.source,ie=d.get(k);delete ie[w.__cacheKey],o.memory.textures--}function U(T){let w=T.texture,k=n.get(T),ie=n.get(w);if(ie.__webglTexture!==void 0&&(i.deleteTexture(ie.__webglTexture),o.memory.textures--),T.depthTexture&&T.depthTexture.dispose(),T.isWebGLCubeRenderTarget)for(let oe=0;oe<6;oe++){if(Array.isArray(k.__webglFramebuffer[oe]))for(let te=0;te<k.__webglFramebuffer[oe].length;te++)i.deleteFramebuffer(k.__webglFramebuffer[oe][te]);else i.deleteFramebuffer(k.__webglFramebuffer[oe]);k.__webglDepthbuffer&&i.deleteRenderbuffer(k.__webglDepthbuffer[oe])}else{if(Array.isArray(k.__webglFramebuffer))for(let oe=0;oe<k.__webglFramebuffer.length;oe++)i.deleteFramebuffer(k.__webglFramebuffer[oe]);else i.deleteFramebuffer(k.__webglFramebuffer);if(k.__webglDepthbuffer&&i.deleteRenderbuffer(k.__webglDepthbuffer),k.__webglMultisampledFramebuffer&&i.deleteFramebuffer(k.__webglMultisampledFramebuffer),k.__webglColorRenderbuffer)for(let oe=0;oe<k.__webglColorRenderbuffer.length;oe++)k.__webglColorRenderbuffer[oe]&&i.deleteRenderbuffer(k.__webglColorRenderbuffer[oe]);k.__webglDepthRenderbuffer&&i.deleteRenderbuffer(k.__webglDepthRenderbuffer)}if(T.isWebGLMultipleRenderTargets)for(let oe=0,te=w.length;oe<te;oe++){let Te=n.get(w[oe]);Te.__webglTexture&&(i.deleteTexture(Te.__webglTexture),o.memory.textures--),n.remove(w[oe])}n.remove(w),n.remove(T)}let z=0;function Y(){z=0}function I(){let T=z;return T>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+r.maxTextures),z+=1,T}function D(T){let w=[];return w.push(T.wrapS),w.push(T.wrapT),w.push(T.wrapR||0),w.push(T.magFilter),w.push(T.minFilter),w.push(T.anisotropy),w.push(T.internalFormat),w.push(T.format),w.push(T.type),w.push(T.generateMipmaps),w.push(T.premultiplyAlpha),w.push(T.flipY),w.push(T.unpackAlignment),w.push(T.colorSpace),w.join()}function O(T,w){let k=n.get(T);if(T.isVideoTexture&&Ie(T),T.isRenderTargetTexture===!1&&T.version>0&&k.__version!==T.version){let ie=T.image;if(ie===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ie.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ee(k,T,w);return}}t.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+w)}function V(T,w){let k=n.get(T);if(T.version>0&&k.__version!==T.version){ee(k,T,w);return}t.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+w)}function K(T,w){let k=n.get(T);if(T.version>0&&k.__version!==T.version){ee(k,T,w);return}t.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+w)}function Z(T,w){let k=n.get(T);if(T.version>0&&k.__version!==T.version){ce(k,T,w);return}t.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+w)}let re={[br]:i.REPEAT,[kt]:i.CLAMP_TO_EDGE,[Wa]:i.MIRRORED_REPEAT},se={[Zt]:i.NEAREST,[cc]:i.NEAREST_MIPMAP_NEAREST,[ia]:i.NEAREST_MIPMAP_LINEAR,[dn]:i.LINEAR,[wf]:i.LINEAR_MIPMAP_NEAREST,[jr]:i.LINEAR_MIPMAP_LINEAR},pe={[Of]:i.NEVER,[Hf]:i.ALWAYS,[Ff]:i.LESS,[Yu]:i.LEQUAL,[zf]:i.EQUAL,[Gf]:i.GEQUAL,[kf]:i.GREATER,[Bf]:i.NOTEQUAL};function X(T,w,k){if(k?(i.texParameteri(T,i.TEXTURE_WRAP_S,re[w.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,re[w.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,re[w.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,se[w.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,se[w.minFilter])):(i.texParameteri(T,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(T,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(w.wrapS!==kt||w.wrapT!==kt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(T,i.TEXTURE_MAG_FILTER,S(w.magFilter)),i.texParameteri(T,i.TEXTURE_MIN_FILTER,S(w.minFilter)),w.minFilter!==Zt&&w.minFilter!==dn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),w.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,pe[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let ie=e.get("EXT_texture_filter_anisotropic");if(w.magFilter===Zt||w.minFilter!==ia&&w.minFilter!==jr||w.type===ci&&e.has("OES_texture_float_linear")===!1||a===!1&&w.type===Ni&&e.has("OES_texture_half_float_linear")===!1)return;(w.anisotropy>1||n.get(w).__currentAnisotropy)&&(i.texParameterf(T,ie.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy)}}function Q(T,w){let k=!1;T.__webglInit===void 0&&(T.__webglInit=!0,w.addEventListener("dispose",A));let ie=w.source,oe=d.get(ie);oe===void 0&&(oe={},d.set(ie,oe));let te=D(w);if(te!==T.__cacheKey){oe[te]===void 0&&(oe[te]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,k=!0),oe[te].usedTimes++;let Te=oe[T.__cacheKey];Te!==void 0&&(oe[T.__cacheKey].usedTimes--,Te.usedTimes===0&&M(w)),T.__cacheKey=te,T.__webglTexture=oe[te].texture}return k}function ee(T,w,k){let ie=i.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(ie=i.TEXTURE_2D_ARRAY),w.isData3DTexture&&(ie=i.TEXTURE_3D);let oe=Q(T,w),te=w.source;t.bindTexture(ie,T.__webglTexture,i.TEXTURE0+k);let Te=n.get(te);if(te.version!==Te.__version||oe===!0){t.activeTexture(i.TEXTURE0+k);let _e=ct.getPrimaries(ct.workingColorSpace),Se=w.colorSpace===pn?null:ct.getPrimaries(w.colorSpace),Pe=w.colorSpace===pn||_e===Se?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,w.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,w.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe);let ze=p(w)&&m(w.image)===!1,ne=_(w.image,ze,!1,r.maxTextureSize);ne=be(w,ne);let it=m(ne)||a,Je=s.convert(w.format,w.colorSpace),Ge=s.convert(w.type),Ne=b(w.internalFormat,Je,Ge,w.colorSpace,w.isVideoTexture);X(ie,w,it);let we,qe=w.mipmaps,rt=a&&w.isVideoTexture!==!0&&Ne!==Vu,mt=Te.__version===void 0||oe===!0,je=E(w,ne,it);if(w.isDepthTexture)Ne=i.DEPTH_COMPONENT,a?w.type===ci?Ne=i.DEPTH_COMPONENT32F:w.type===li?Ne=i.DEPTH_COMPONENT24:w.type===Ii?Ne=i.DEPTH24_STENCIL8:Ne=i.DEPTH_COMPONENT16:w.type===ci&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),w.format===Li&&Ne===i.DEPTH_COMPONENT&&w.type!==Ul&&w.type!==li&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),w.type=li,Ge=s.convert(w.type)),w.format===Mr&&Ne===i.DEPTH_COMPONENT&&(Ne=i.DEPTH_STENCIL,w.type!==Ii&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),w.type=Ii,Ge=s.convert(w.type))),mt&&(rt?t.texStorage2D(i.TEXTURE_2D,1,Ne,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,Ne,ne.width,ne.height,0,Je,Ge,null));else if(w.isDataTexture)if(qe.length>0&&it){rt&&mt&&t.texStorage2D(i.TEXTURE_2D,je,Ne,qe[0].width,qe[0].height);for(let me=0,N=qe.length;me<N;me++)we=qe[me],rt?t.texSubImage2D(i.TEXTURE_2D,me,0,0,we.width,we.height,Je,Ge,we.data):t.texImage2D(i.TEXTURE_2D,me,Ne,we.width,we.height,0,Je,Ge,we.data);w.generateMipmaps=!1}else rt?(mt&&t.texStorage2D(i.TEXTURE_2D,je,Ne,ne.width,ne.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,ne.width,ne.height,Je,Ge,ne.data)):t.texImage2D(i.TEXTURE_2D,0,Ne,ne.width,ne.height,0,Je,Ge,ne.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){rt&&mt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,je,Ne,qe[0].width,qe[0].height,ne.depth);for(let me=0,N=qe.length;me<N;me++)we=qe[me],w.format!==Tn?Je!==null?rt?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,me,0,0,0,we.width,we.height,ne.depth,Je,we.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,me,Ne,we.width,we.height,ne.depth,0,we.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):rt?t.texSubImage3D(i.TEXTURE_2D_ARRAY,me,0,0,0,we.width,we.height,ne.depth,Je,Ge,we.data):t.texImage3D(i.TEXTURE_2D_ARRAY,me,Ne,we.width,we.height,ne.depth,0,Je,Ge,we.data)}else{rt&&mt&&t.texStorage2D(i.TEXTURE_2D,je,Ne,qe[0].width,qe[0].height);for(let me=0,N=qe.length;me<N;me++)we=qe[me],w.format!==Tn?Je!==null?rt?t.compressedTexSubImage2D(i.TEXTURE_2D,me,0,0,we.width,we.height,Je,we.data):t.compressedTexImage2D(i.TEXTURE_2D,me,Ne,we.width,we.height,0,we.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):rt?t.texSubImage2D(i.TEXTURE_2D,me,0,0,we.width,we.height,Je,Ge,we.data):t.texImage2D(i.TEXTURE_2D,me,Ne,we.width,we.height,0,Je,Ge,we.data)}else if(w.isDataArrayTexture)rt?(mt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,je,Ne,ne.width,ne.height,ne.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,Je,Ge,ne.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ne,ne.width,ne.height,ne.depth,0,Je,Ge,ne.data);else if(w.isData3DTexture)rt?(mt&&t.texStorage3D(i.TEXTURE_3D,je,Ne,ne.width,ne.height,ne.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,Je,Ge,ne.data)):t.texImage3D(i.TEXTURE_3D,0,Ne,ne.width,ne.height,ne.depth,0,Je,Ge,ne.data);else if(w.isFramebufferTexture){if(mt)if(rt)t.texStorage2D(i.TEXTURE_2D,je,Ne,ne.width,ne.height);else{let me=ne.width,N=ne.height;for(let ye=0;ye<je;ye++)t.texImage2D(i.TEXTURE_2D,ye,Ne,me,N,0,Je,Ge,null),me>>=1,N>>=1}}else if(qe.length>0&&it){rt&&mt&&t.texStorage2D(i.TEXTURE_2D,je,Ne,qe[0].width,qe[0].height);for(let me=0,N=qe.length;me<N;me++)we=qe[me],rt?t.texSubImage2D(i.TEXTURE_2D,me,0,0,Je,Ge,we):t.texImage2D(i.TEXTURE_2D,me,Ne,Je,Ge,we);w.generateMipmaps=!1}else rt?(mt&&t.texStorage2D(i.TEXTURE_2D,je,Ne,ne.width,ne.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,Je,Ge,ne)):t.texImage2D(i.TEXTURE_2D,0,Ne,Je,Ge,ne);v(w,it)&&x(ie),Te.__version=te.version,w.onUpdate&&w.onUpdate(w)}T.__version=w.version}function ce(T,w,k){if(w.image.length!==6)return;let ie=Q(T,w),oe=w.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+k);let te=n.get(oe);if(oe.version!==te.__version||ie===!0){t.activeTexture(i.TEXTURE0+k);let Te=ct.getPrimaries(ct.workingColorSpace),_e=w.colorSpace===pn?null:ct.getPrimaries(w.colorSpace),Se=w.colorSpace===pn||Te===_e?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,w.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,w.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);let Pe=w.isCompressedTexture||w.image[0].isCompressedTexture,ze=w.image[0]&&w.image[0].isDataTexture,ne=[];for(let me=0;me<6;me++)!Pe&&!ze?ne[me]=_(w.image[me],!1,!0,r.maxCubemapSize):ne[me]=ze?w.image[me].image:w.image[me],ne[me]=be(w,ne[me]);let it=ne[0],Je=m(it)||a,Ge=s.convert(w.format,w.colorSpace),Ne=s.convert(w.type),we=b(w.internalFormat,Ge,Ne,w.colorSpace),qe=a&&w.isVideoTexture!==!0,rt=te.__version===void 0||ie===!0,mt=E(w,it,Je);X(i.TEXTURE_CUBE_MAP,w,Je);let je;if(Pe){qe&&rt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,mt,we,it.width,it.height);for(let me=0;me<6;me++){je=ne[me].mipmaps;for(let N=0;N<je.length;N++){let ye=je[N];w.format!==Tn?Ge!==null?qe?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,N,0,0,ye.width,ye.height,Ge,ye.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,N,we,ye.width,ye.height,0,ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):qe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,N,0,0,ye.width,ye.height,Ge,Ne,ye.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,N,we,ye.width,ye.height,0,Ge,Ne,ye.data)}}}else{je=w.mipmaps,qe&&rt&&(je.length>0&&mt++,t.texStorage2D(i.TEXTURE_CUBE_MAP,mt,we,ne[0].width,ne[0].height));for(let me=0;me<6;me++)if(ze){qe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,ne[me].width,ne[me].height,Ge,Ne,ne[me].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,we,ne[me].width,ne[me].height,0,Ge,Ne,ne[me].data);for(let N=0;N<je.length;N++){let ge=je[N].image[me].image;qe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,N+1,0,0,ge.width,ge.height,Ge,Ne,ge.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,N+1,we,ge.width,ge.height,0,Ge,Ne,ge.data)}}else{qe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,Ge,Ne,ne[me]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,we,Ge,Ne,ne[me]);for(let N=0;N<je.length;N++){let ye=je[N];qe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,N+1,0,0,Ge,Ne,ye.image[me]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,N+1,we,Ge,Ne,ye.image[me])}}}v(w,Je)&&x(i.TEXTURE_CUBE_MAP),te.__version=oe.version,w.onUpdate&&w.onUpdate(w)}T.__version=w.version}function ve(T,w,k,ie,oe,te){let Te=s.convert(k.format,k.colorSpace),_e=s.convert(k.type),Se=b(k.internalFormat,Te,_e,k.colorSpace);if(!n.get(w).__hasExternalTextures){let ze=Math.max(1,w.width>>te),ne=Math.max(1,w.height>>te);oe===i.TEXTURE_3D||oe===i.TEXTURE_2D_ARRAY?t.texImage3D(oe,te,Se,ze,ne,w.depth,0,Te,_e,null):t.texImage2D(oe,te,Se,ze,ne,0,Te,_e,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),q(w)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ie,oe,n.get(k).__webglTexture,0,he(w)):(oe===i.TEXTURE_2D||oe>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&oe<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ie,oe,n.get(k).__webglTexture,te),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Oe(T,w,k){if(i.bindRenderbuffer(i.RENDERBUFFER,T),w.depthBuffer&&!w.stencilBuffer){let ie=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(k||q(w)){let oe=w.depthTexture;oe&&oe.isDepthTexture&&(oe.type===ci?ie=i.DEPTH_COMPONENT32F:oe.type===li&&(ie=i.DEPTH_COMPONENT24));let te=he(w);q(w)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,te,ie,w.width,w.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,te,ie,w.width,w.height)}else i.renderbufferStorage(i.RENDERBUFFER,ie,w.width,w.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,T)}else if(w.depthBuffer&&w.stencilBuffer){let ie=he(w);k&&q(w)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ie,i.DEPTH24_STENCIL8,w.width,w.height):q(w)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ie,i.DEPTH24_STENCIL8,w.width,w.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,T)}else{let ie=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let oe=0;oe<ie.length;oe++){let te=ie[oe],Te=s.convert(te.format,te.colorSpace),_e=s.convert(te.type),Se=b(te.internalFormat,Te,_e,te.colorSpace),Pe=he(w);k&&q(w)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Pe,Se,w.width,w.height):q(w)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Pe,Se,w.width,w.height):i.renderbufferStorage(i.RENDERBUFFER,Se,w.width,w.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function De(T,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),O(w.depthTexture,0);let ie=n.get(w.depthTexture).__webglTexture,oe=he(w);if(w.depthTexture.format===Li)q(w)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ie,0,oe):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ie,0);else if(w.depthTexture.format===Mr)q(w)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ie,0,oe):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ie,0);else throw new Error("Unknown depthTexture format")}function Ce(T){let w=n.get(T),k=T.isWebGLCubeRenderTarget===!0;if(T.depthTexture&&!w.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");De(w.__webglFramebuffer,T)}else if(k){w.__webglDepthbuffer=[];for(let ie=0;ie<6;ie++)t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer[ie]),w.__webglDepthbuffer[ie]=i.createRenderbuffer(),Oe(w.__webglDepthbuffer[ie],T,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer=i.createRenderbuffer(),Oe(w.__webglDepthbuffer,T,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ue(T,w,k){let ie=n.get(T);w!==void 0&&ve(ie.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&Ce(T)}function L(T){let w=T.texture,k=n.get(T),ie=n.get(w);T.addEventListener("dispose",C),T.isWebGLMultipleRenderTargets!==!0&&(ie.__webglTexture===void 0&&(ie.__webglTexture=i.createTexture()),ie.__version=w.version,o.memory.textures++);let oe=T.isWebGLCubeRenderTarget===!0,te=T.isWebGLMultipleRenderTargets===!0,Te=m(T)||a;if(oe){k.__webglFramebuffer=[];for(let _e=0;_e<6;_e++)if(a&&w.mipmaps&&w.mipmaps.length>0){k.__webglFramebuffer[_e]=[];for(let Se=0;Se<w.mipmaps.length;Se++)k.__webglFramebuffer[_e][Se]=i.createFramebuffer()}else k.__webglFramebuffer[_e]=i.createFramebuffer()}else{if(a&&w.mipmaps&&w.mipmaps.length>0){k.__webglFramebuffer=[];for(let _e=0;_e<w.mipmaps.length;_e++)k.__webglFramebuffer[_e]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(te)if(r.drawBuffers){let _e=T.texture;for(let Se=0,Pe=_e.length;Se<Pe;Se++){let ze=n.get(_e[Se]);ze.__webglTexture===void 0&&(ze.__webglTexture=i.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&T.samples>0&&q(T)===!1){let _e=te?w:[w];k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let Se=0;Se<_e.length;Se++){let Pe=_e[Se];k.__webglColorRenderbuffer[Se]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[Se]);let ze=s.convert(Pe.format,Pe.colorSpace),ne=s.convert(Pe.type),it=b(Pe.internalFormat,ze,ne,Pe.colorSpace,T.isXRRenderTarget===!0),Je=he(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Je,it,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Se,i.RENDERBUFFER,k.__webglColorRenderbuffer[Se])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),Oe(k.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,ie.__webglTexture),X(i.TEXTURE_CUBE_MAP,w,Te);for(let _e=0;_e<6;_e++)if(a&&w.mipmaps&&w.mipmaps.length>0)for(let Se=0;Se<w.mipmaps.length;Se++)ve(k.__webglFramebuffer[_e][Se],T,w,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Se);else ve(k.__webglFramebuffer[_e],T,w,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0);v(w,Te)&&x(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(te){let _e=T.texture;for(let Se=0,Pe=_e.length;Se<Pe;Se++){let ze=_e[Se],ne=n.get(ze);t.bindTexture(i.TEXTURE_2D,ne.__webglTexture),X(i.TEXTURE_2D,ze,Te),ve(k.__webglFramebuffer,T,ze,i.COLOR_ATTACHMENT0+Se,i.TEXTURE_2D,0),v(ze,Te)&&x(i.TEXTURE_2D)}t.unbindTexture()}else{let _e=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(a?_e=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(_e,ie.__webglTexture),X(_e,w,Te),a&&w.mipmaps&&w.mipmaps.length>0)for(let Se=0;Se<w.mipmaps.length;Se++)ve(k.__webglFramebuffer[Se],T,w,i.COLOR_ATTACHMENT0,_e,Se);else ve(k.__webglFramebuffer,T,w,i.COLOR_ATTACHMENT0,_e,0);v(w,Te)&&x(_e),t.unbindTexture()}T.depthBuffer&&Ce(T)}function ue(T){let w=m(T)||a,k=T.isWebGLMultipleRenderTargets===!0?T.texture:[T.texture];for(let ie=0,oe=k.length;ie<oe;ie++){let te=k[ie];if(v(te,w)){let Te=T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,_e=n.get(te).__webglTexture;t.bindTexture(Te,_e),x(Te),t.unbindTexture()}}}function $(T){if(a&&T.samples>0&&q(T)===!1){let w=T.isWebGLMultipleRenderTargets?T.texture:[T.texture],k=T.width,ie=T.height,oe=i.COLOR_BUFFER_BIT,te=[],Te=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_e=n.get(T),Se=T.isWebGLMultipleRenderTargets===!0;if(Se)for(let Pe=0;Pe<w.length;Pe++)t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,_e.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,_e.__webglFramebuffer);for(let Pe=0;Pe<w.length;Pe++){te.push(i.COLOR_ATTACHMENT0+Pe),T.depthBuffer&&te.push(Te);let ze=_e.__ignoreDepthValues!==void 0?_e.__ignoreDepthValues:!1;if(ze===!1&&(T.depthBuffer&&(oe|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&(oe|=i.STENCIL_BUFFER_BIT)),Se&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,_e.__webglColorRenderbuffer[Pe]),ze===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[Te]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[Te])),Se){let ne=n.get(w[Pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ne,0)}i.blitFramebuffer(0,0,k,ie,0,0,k,ie,oe,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,te)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Se)for(let Pe=0;Pe<w.length;Pe++){t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pe,i.RENDERBUFFER,_e.__webglColorRenderbuffer[Pe]);let ze=n.get(w[Pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,_e.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Pe,i.TEXTURE_2D,ze,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,_e.__webglMultisampledFramebuffer)}}function he(T){return Math.min(r.maxSamples,T.samples)}function q(T){let w=n.get(T);return a&&T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Ie(T){let w=o.render.frame;u.get(T)!==w&&(u.set(T,w),T.update())}function be(T,w){let k=T.colorSpace,ie=T.format,oe=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||T.format===qa||k!==Kn&&k!==pn&&(ct.getTransfer(k)===pt?a===!1?e.has("EXT_sRGB")===!0&&ie===Tn?(T.format=qa,T.minFilter=dn,T.generateMipmaps=!1):w=ro.sRGBToLinear(w):(ie!==Tn||oe!==hi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),w}this.allocateTextureUnit=I,this.resetTextureUnits=Y,this.setTexture2D=O,this.setTexture2DArray=V,this.setTexture3D=K,this.setTextureCube=Z,this.rebindTextures=Ue,this.setupRenderTarget=L,this.updateRenderTargetMipmap=ue,this.updateMultisampleRenderTarget=$,this.setupDepthRenderbuffer=Ce,this.setupFrameBufferTexture=ve,this.useMultisampledRTT=q}function Lx(i,e,t){let n=t.isWebGL2;function r(s,o=pn){let a,l=ct.getTransfer(o);if(s===hi)return i.UNSIGNED_BYTE;if(s===zu)return i.UNSIGNED_SHORT_4_4_4_4;if(s===ku)return i.UNSIGNED_SHORT_5_5_5_1;if(s===Ef)return i.BYTE;if(s===Tf)return i.SHORT;if(s===Ul)return i.UNSIGNED_SHORT;if(s===Fu)return i.INT;if(s===li)return i.UNSIGNED_INT;if(s===ci)return i.FLOAT;if(s===Ni)return n?i.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===Af)return i.ALPHA;if(s===Tn)return i.RGBA;if(s===Rf)return i.LUMINANCE;if(s===Cf)return i.LUMINANCE_ALPHA;if(s===Li)return i.DEPTH_COMPONENT;if(s===Mr)return i.DEPTH_STENCIL;if(s===qa)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===Pf)return i.RED;if(s===Bu)return i.RED_INTEGER;if(s===If)return i.RG;if(s===Gu)return i.RG_INTEGER;if(s===Hu)return i.RGBA_INTEGER;if(s===ra||s===sa||s===oa||s===aa)if(l===pt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===ra)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===sa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===oa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===aa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===ra)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===sa)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===oa)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===aa)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===uc||s===hc||s===dc||s===fc)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===uc)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===hc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===dc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===fc)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===Vu)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===pc||s===mc)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===pc)return l===pt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===mc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===gc||s===xc||s===_c||s===yc||s===vc||s===bc||s===Mc||s===Sc||s===wc||s===Ec||s===Tc||s===Ac||s===Rc||s===Cc)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===gc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===xc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===_c)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===yc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===vc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===bc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Mc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Sc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===wc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Ec)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Tc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Ac)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Rc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Cc)return l===pt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===la||s===Pc||s===Ic)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===la)return l===pt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Pc)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Ic)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Lf||s===Lc||s===Dc||s===Uc)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===la)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Lc)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Dc)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Uc)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Ii?n?i.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[s]!==void 0?i[s]:null}return{convert:r}}var ll=class extends jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Ee=class extends Wt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Dx={type:"move"},Kr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ee,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ee,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ee,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Dx)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ee;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},cl=class extends pi{constructor(e,t){super();let n=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null,_=t.getContextAttributes(),m=null,p=null,v=[],x=[],b=new J,E=null,S=new jt;S.layers.enable(1),S.viewport=new xt;let A=new jt;A.layers.enable(2),A.viewport=new xt;let C=[S,A],y=new ll;y.layers.enable(1),y.layers.enable(2);let M=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let Q=v[X];return Q===void 0&&(Q=new Kr,v[X]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(X){let Q=v[X];return Q===void 0&&(Q=new Kr,v[X]=Q),Q.getGripSpace()},this.getHand=function(X){let Q=v[X];return Q===void 0&&(Q=new Kr,v[X]=Q),Q.getHandSpace()};function z(X){let Q=x.indexOf(X.inputSource);if(Q===-1)return;let ee=v[Q];ee!==void 0&&(ee.update(X.inputSource,X.frame,c||o),ee.dispatchEvent({type:X.type,data:X.inputSource}))}function Y(){r.removeEventListener("select",z),r.removeEventListener("selectstart",z),r.removeEventListener("selectend",z),r.removeEventListener("squeeze",z),r.removeEventListener("squeezestart",z),r.removeEventListener("squeezeend",z),r.removeEventListener("end",Y),r.removeEventListener("inputsourceschange",I);for(let X=0;X<v.length;X++){let Q=x[X];Q!==null&&(x[X]=null,v[X].disconnect(Q))}M=null,U=null,e.setRenderTarget(m),f=null,d=null,h=null,r=null,p=null,pe.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(b.width,b.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){s=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(X){if(r=X,r!==null){if(m=e.getRenderTarget(),r.addEventListener("select",z),r.addEventListener("selectstart",z),r.addEventListener("selectend",z),r.addEventListener("squeeze",z),r.addEventListener("squeezestart",z),r.addEventListener("squeezeend",z),r.addEventListener("end",Y),r.addEventListener("inputsourceschange",I),_.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(b),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let Q={antialias:r.renderState.layers===void 0?_.antialias:!0,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,Q),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),p=new Qt(f.framebufferWidth,f.framebufferHeight,{format:Tn,type:hi,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil})}else{let Q=null,ee=null,ce=null;_.depth&&(ce=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Q=_.stencil?Mr:Li,ee=_.stencil?Ii:li);let ve={colorFormat:t.RGBA8,depthFormat:ce,scaleFactor:s};h=new XRWebGLBinding(r,t),d=h.createProjectionLayer(ve),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),p=new Qt(d.textureWidth,d.textureHeight,{format:Tn,type:hi,depthTexture:new po(d.textureWidth,d.textureHeight,ee,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0});let Oe=e.properties.get(p);Oe.__ignoreDepthValues=d.ignoreDepthValues}p.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),pe.setContext(r),pe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function I(X){for(let Q=0;Q<X.removed.length;Q++){let ee=X.removed[Q],ce=x.indexOf(ee);ce>=0&&(x[ce]=null,v[ce].disconnect(ee))}for(let Q=0;Q<X.added.length;Q++){let ee=X.added[Q],ce=x.indexOf(ee);if(ce===-1){for(let Oe=0;Oe<v.length;Oe++)if(Oe>=x.length){x.push(ee),ce=Oe;break}else if(x[Oe]===null){x[Oe]=ee,ce=Oe;break}if(ce===-1)break}let ve=v[ce];ve&&ve.connect(ee)}}let D=new P,O=new P;function V(X,Q,ee){D.setFromMatrixPosition(Q.matrixWorld),O.setFromMatrixPosition(ee.matrixWorld);let ce=D.distanceTo(O),ve=Q.projectionMatrix.elements,Oe=ee.projectionMatrix.elements,De=ve[14]/(ve[10]-1),Ce=ve[14]/(ve[10]+1),Ue=(ve[9]+1)/ve[5],L=(ve[9]-1)/ve[5],ue=(ve[8]-1)/ve[0],$=(Oe[8]+1)/Oe[0],he=De*ue,q=De*$,Ie=ce/(-ue+$),be=Ie*-ue;Q.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(be),X.translateZ(Ie),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert();let T=De+Ie,w=Ce+Ie,k=he-be,ie=q+(ce-be),oe=Ue*Ce/w*T,te=L*Ce/w*T;X.projectionMatrix.makePerspective(k,ie,oe,te,T,w),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}function K(X,Q){Q===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(Q.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(r===null)return;y.near=A.near=S.near=X.near,y.far=A.far=S.far=X.far,(M!==y.near||U!==y.far)&&(r.updateRenderState({depthNear:y.near,depthFar:y.far}),M=y.near,U=y.far);let Q=X.parent,ee=y.cameras;K(y,Q);for(let ce=0;ce<ee.length;ce++)K(ee[ce],Q);ee.length===2?V(y,S,A):y.projectionMatrix.copy(S.projectionMatrix),Z(X,y,Q)};function Z(X,Q,ee){ee===null?X.matrix.copy(Q.matrixWorld):(X.matrix.copy(ee.matrixWorld),X.matrix.invert(),X.matrix.multiply(Q.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(Q.projectionMatrix),X.projectionMatrixInverse.copy(Q.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Ya*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(X){l=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)};let re=null;function se(X,Q){if(u=Q.getViewerPose(c||o),g=Q,u!==null){let ee=u.views;f!==null&&(e.setRenderTargetFramebuffer(p,f.framebuffer),e.setRenderTarget(p));let ce=!1;ee.length!==y.cameras.length&&(y.cameras.length=0,ce=!0);for(let ve=0;ve<ee.length;ve++){let Oe=ee[ve],De=null;if(f!==null)De=f.getViewport(Oe);else{let Ue=h.getViewSubImage(d,Oe);De=Ue.viewport,ve===0&&(e.setRenderTargetTextures(p,Ue.colorTexture,d.ignoreDepthValues?void 0:Ue.depthStencilTexture),e.setRenderTarget(p))}let Ce=C[ve];Ce===void 0&&(Ce=new jt,Ce.layers.enable(ve),Ce.viewport=new xt,C[ve]=Ce),Ce.matrix.fromArray(Oe.transform.matrix),Ce.matrix.decompose(Ce.position,Ce.quaternion,Ce.scale),Ce.projectionMatrix.fromArray(Oe.projectionMatrix),Ce.projectionMatrixInverse.copy(Ce.projectionMatrix).invert(),Ce.viewport.set(De.x,De.y,De.width,De.height),ve===0&&(y.matrix.copy(Ce.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),ce===!0&&y.cameras.push(Ce)}}for(let ee=0;ee<v.length;ee++){let ce=x[ee],ve=v[ee];ce!==null&&ve!==void 0&&ve.update(ce,Q,c||o)}re&&re(X,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}let pe=new $u;pe.setAnimationLoop(se),this.setAnimationLoop=function(X){re=X},this.dispose=function(){}}};function Ux(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Ju(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function r(m,p,v,x,b){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),h(m,p)):p.isMeshPhongMaterial?(s(m,p),u(m,p)):p.isMeshStandardMaterial?(s(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,b)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),_(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,v,x):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Ct&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Ct&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let v=e.get(p).envMap;if(v&&(m.envMap.value=v,m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap){m.lightMap.value=p.lightMap;let x=i._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=p.lightMapIntensity*x,t(p.lightMap,m.lightMapTransform)}p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,v,x){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*v,m.scale.value=x*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),e.get(p).envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,v){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ct&&m.clearcoatNormalScale.value.negate())),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let v=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function Nx(i,e,t,n){let r={},s={},o=[],a=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(v,x){let b=x.program;n.uniformBlockBinding(v,b)}function c(v,x){let b=r[v.id];b===void 0&&(g(v),b=u(v),r[v.id]=b,v.addEventListener("dispose",m));let E=x.program;n.updateUBOMapping(v,E);let S=e.render.frame;s[v.id]!==S&&(d(v),s[v.id]=S)}function u(v){let x=h();v.__bindingPointIndex=x;let b=i.createBuffer(),E=v.__size,S=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,b),i.bufferData(i.UNIFORM_BUFFER,E,S),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,b),b}function h(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let x=r[v.id],b=v.uniforms,E=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let S=0,A=b.length;S<A;S++){let C=Array.isArray(b[S])?b[S]:[b[S]];for(let y=0,M=C.length;y<M;y++){let U=C[y];if(f(U,S,y,E)===!0){let z=U.__offset,Y=Array.isArray(U.value)?U.value:[U.value],I=0;for(let D=0;D<Y.length;D++){let O=Y[D],V=_(O);typeof O=="number"||typeof O=="boolean"?(U.__data[0]=O,i.bufferSubData(i.UNIFORM_BUFFER,z+I,U.__data)):O.isMatrix3?(U.__data[0]=O.elements[0],U.__data[1]=O.elements[1],U.__data[2]=O.elements[2],U.__data[3]=0,U.__data[4]=O.elements[3],U.__data[5]=O.elements[4],U.__data[6]=O.elements[5],U.__data[7]=0,U.__data[8]=O.elements[6],U.__data[9]=O.elements[7],U.__data[10]=O.elements[8],U.__data[11]=0):(O.toArray(U.__data,I),I+=V.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,z,U.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(v,x,b,E){let S=v.value,A=x+"_"+b;if(E[A]===void 0)return typeof S=="number"||typeof S=="boolean"?E[A]=S:E[A]=S.clone(),!0;{let C=E[A];if(typeof S=="number"||typeof S=="boolean"){if(C!==S)return E[A]=S,!0}else if(C.equals(S)===!1)return C.copy(S),!0}return!1}function g(v){let x=v.uniforms,b=0,E=16;for(let A=0,C=x.length;A<C;A++){let y=Array.isArray(x[A])?x[A]:[x[A]];for(let M=0,U=y.length;M<U;M++){let z=y[M],Y=Array.isArray(z.value)?z.value:[z.value];for(let I=0,D=Y.length;I<D;I++){let O=Y[I],V=_(O),K=b%E;K!==0&&E-K<V.boundary&&(b+=E-K),z.__data=new Float32Array(V.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=b,b+=V.storage}}}let S=b%E;return S>0&&(b+=E-S),v.__size=b,v.__cache={},this}function _(v){let x={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(x.boundary=4,x.storage=4):v.isVector2?(x.boundary=8,x.storage=8):v.isVector3||v.isColor?(x.boundary=16,x.storage=12):v.isVector4?(x.boundary=16,x.storage=16):v.isMatrix3?(x.boundary=48,x.storage=48):v.isMatrix4?(x.boundary=64,x.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),x}function m(v){let x=v.target;x.removeEventListener("dispose",m);let b=o.indexOf(x.__bindingPointIndex);o.splice(b,1),i.deleteBuffer(r[x.id]),delete r[x.id],delete s[x.id]}function p(){for(let v in r)i.deleteBuffer(r[v]);o=[],r={},s={}}return{bind:l,update:c,dispose:p}}var es=class{constructor(e={}){let{canvas:t=Wf(),context:n=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=o;let f=new Uint32Array(4),g=new Int32Array(4),_=null,m=null,p=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Tt,this._useLegacyLights=!1,this.toneMapping=Dn,this.toneMappingExposure=1;let x=this,b=!1,E=0,S=0,A=null,C=-1,y=null,M=new xt,U=new xt,z=null,Y=new Xe(0),I=0,D=t.width,O=t.height,V=1,K=null,Z=null,re=new xt(0,0,D,O),se=new xt(0,0,D,O),pe=!1,X=new Qr,Q=!1,ee=!1,ce=null,ve=new ht,Oe=new J,De=new P,Ce={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Ue(){return A===null?V:1}let L=n;function ue(R,F){for(let B=0;B<R.length;B++){let H=R[B],G=t.getContext(H,F);if(G!==null)return G}return null}try{let R={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",me,!1),t.addEventListener("webglcontextrestored",N,!1),t.addEventListener("webglcontextcreationerror",ye,!1),L===null){let F=["webgl2","webgl","experimental-webgl"];if(x.isWebGL1Renderer===!0&&F.shift(),L=ue(F,R),L===null)throw ue(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&L instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),L.getShaderPrecisionFormat===void 0&&(L.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let $,he,q,Ie,be,T,w,k,ie,oe,te,Te,_e,Se,Pe,ze,ne,it,Je,Ge,Ne,we,qe,rt;function mt(){$=new eg(L),he=new Z0(L,$,e),$.init(he),we=new Lx(L,$,he),q=new Px(L,$,he),Ie=new ig(L),be=new _x,T=new Ix(L,$,q,be,he,we,Ie),w=new J0(x),k=new Q0(x),ie=new hp(L,he),qe=new q0(L,$,ie,he),oe=new tg(L,ie,Ie,qe),te=new ag(L,oe,ie,Ie),Je=new og(L,he,T),ze=new K0(be),Te=new xx(x,w,k,$,he,qe,ze),_e=new Ux(x,be),Se=new vx,Pe=new Tx($,he),it=new X0(x,w,k,q,te,d,l),ne=new Cx(x,te,he),rt=new Nx(L,Ie,he,q),Ge=new Y0(L,$,Ie,he),Ne=new ng(L,$,Ie,he),Ie.programs=Te.programs,x.capabilities=he,x.extensions=$,x.properties=be,x.renderLists=Se,x.shadowMap=ne,x.state=q,x.info=Ie}mt();let je=new cl(x,L);this.xr=je,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let R=$.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){let R=$.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(R){R!==void 0&&(V=R,this.setSize(D,O,!1))},this.getSize=function(R){return R.set(D,O)},this.setSize=function(R,F,B=!0){if(je.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}D=R,O=F,t.width=Math.floor(R*V),t.height=Math.floor(F*V),B===!0&&(t.style.width=R+"px",t.style.height=F+"px"),this.setViewport(0,0,R,F)},this.getDrawingBufferSize=function(R){return R.set(D*V,O*V).floor()},this.setDrawingBufferSize=function(R,F,B){D=R,O=F,V=B,t.width=Math.floor(R*B),t.height=Math.floor(F*B),this.setViewport(0,0,R,F)},this.getCurrentViewport=function(R){return R.copy(M)},this.getViewport=function(R){return R.copy(re)},this.setViewport=function(R,F,B,H){R.isVector4?re.set(R.x,R.y,R.z,R.w):re.set(R,F,B,H),q.viewport(M.copy(re).multiplyScalar(V).floor())},this.getScissor=function(R){return R.copy(se)},this.setScissor=function(R,F,B,H){R.isVector4?se.set(R.x,R.y,R.z,R.w):se.set(R,F,B,H),q.scissor(U.copy(se).multiplyScalar(V).floor())},this.getScissorTest=function(){return pe},this.setScissorTest=function(R){q.setScissorTest(pe=R)},this.setOpaqueSort=function(R){K=R},this.setTransparentSort=function(R){Z=R},this.getClearColor=function(R){return R.copy(it.getClearColor())},this.setClearColor=function(){it.setClearColor.apply(it,arguments)},this.getClearAlpha=function(){return it.getClearAlpha()},this.setClearAlpha=function(){it.setClearAlpha.apply(it,arguments)},this.clear=function(R=!0,F=!0,B=!0){let H=0;if(R){let G=!1;if(A!==null){let Me=A.texture.format;G=Me===Hu||Me===Gu||Me===Bu}if(G){let Me=A.texture.type,Le=Me===hi||Me===li||Me===Ul||Me===Ii||Me===zu||Me===ku,Be=it.getClearColor(),We=it.getClearAlpha(),et=Be.r,Ke=Be.g,$e=Be.b;Le?(f[0]=et,f[1]=Ke,f[2]=$e,f[3]=We,L.clearBufferuiv(L.COLOR,0,f)):(g[0]=et,g[1]=Ke,g[2]=$e,g[3]=We,L.clearBufferiv(L.COLOR,0,g))}else H|=L.COLOR_BUFFER_BIT}F&&(H|=L.DEPTH_BUFFER_BIT),B&&(H|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",me,!1),t.removeEventListener("webglcontextrestored",N,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),Se.dispose(),Pe.dispose(),be.dispose(),w.dispose(),k.dispose(),te.dispose(),qe.dispose(),rt.dispose(),Te.dispose(),je.dispose(),je.removeEventListener("sessionstart",de),je.removeEventListener("sessionend",fe),ce&&(ce.dispose(),ce=null),Ae.stop()};function me(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),b=!0}function N(){console.log("THREE.WebGLRenderer: Context Restored."),b=!1;let R=Ie.autoReset,F=ne.enabled,B=ne.autoUpdate,H=ne.needsUpdate,G=ne.type;mt(),Ie.autoReset=R,ne.enabled=F,ne.autoUpdate=B,ne.needsUpdate=H,ne.type=G}function ye(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function ge(R){let F=R.target;F.removeEventListener("dispose",ge),ke(F)}function ke(R){Fe(R),be.remove(R)}function Fe(R){let F=be.get(R).programs;F!==void 0&&(F.forEach(function(B){Te.releaseProgram(B)}),R.isShaderMaterial&&Te.releaseShaderCache(R))}this.renderBufferDirect=function(R,F,B,H,G,Me){F===null&&(F=Ce);let Le=G.isMesh&&G.matrixWorld.determinant()<0,Be=yi(R,F,B,H,G);q.setMaterial(H,Le);let We=B.index,et=1;if(H.wireframe===!0){if(We=oe.getWireframeAttribute(B),We===void 0)return;et=2}let Ke=B.drawRange,$e=B.attributes.position,Et=Ke.start*et,tn=(Ke.start+Ke.count)*et;Me!==null&&(Et=Math.max(Et,Me.start*et),tn=Math.min(tn,(Me.start+Me.count)*et)),We!==null?(Et=Math.max(Et,0),tn=Math.min(tn,We.count)):$e!=null&&(Et=Math.max(Et,0),tn=Math.min(tn,$e.count));let Nt=tn-Et;if(Nt<0||Nt===1/0)return;qe.setup(G,H,Be,B,We);let zn,bt=Ge;if(We!==null&&(zn=ie.get(We),bt=Ne,bt.setIndex(zn)),G.isMesh)H.wireframe===!0?(q.setLineWidth(H.wireframeLinewidth*Ue()),bt.setMode(L.LINES)):bt.setMode(L.TRIANGLES);else if(G.isLine){let tt=H.linewidth;tt===void 0&&(tt=1),q.setLineWidth(tt*Ue()),G.isLineSegments?bt.setMode(L.LINES):G.isLineLoop?bt.setMode(L.LINE_LOOP):bt.setMode(L.LINE_STRIP)}else G.isPoints?bt.setMode(L.POINTS):G.isSprite&&bt.setMode(L.TRIANGLES);if(G.isBatchedMesh)bt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else if(G.isInstancedMesh)bt.renderInstances(Et,Nt,G.count);else if(B.isInstancedBufferGeometry){let tt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,Qo=Math.min(B.instanceCount,tt);bt.renderInstances(Et,Nt,Qo)}else bt.render(Et,Nt)};function ot(R,F,B){R.transparent===!0&&R.side===fn&&R.forceSinglePass===!1?(R.side=Ct,R.needsUpdate=!0,$t(R,F,B),R.side=fi,R.needsUpdate=!0,$t(R,F,B),R.side=fn):$t(R,F,B)}this.compile=function(R,F,B=null){B===null&&(B=R),m=Pe.get(B),m.init(),v.push(m),B.traverseVisible(function(G){G.isLight&&G.layers.test(F.layers)&&(m.pushLight(G),G.castShadow&&m.pushShadow(G))}),R!==B&&R.traverseVisible(function(G){G.isLight&&G.layers.test(F.layers)&&(m.pushLight(G),G.castShadow&&m.pushShadow(G))}),m.setupLights(x._useLegacyLights);let H=new Set;return R.traverse(function(G){let Me=G.material;if(Me)if(Array.isArray(Me))for(let Le=0;Le<Me.length;Le++){let Be=Me[Le];ot(Be,B,G),H.add(Be)}else ot(Me,B,G),H.add(Me)}),v.pop(),m=null,H},this.compileAsync=function(R,F,B=null){let H=this.compile(R,F,B);return new Promise(G=>{function Me(){if(H.forEach(function(Le){be.get(Le).currentProgram.isReady()&&H.delete(Le)}),H.size===0){G(R);return}setTimeout(Me,10)}$.get("KHR_parallel_shader_compile")!==null?Me():setTimeout(Me,10)})};let at=null;function j(R){at&&at(R)}function de(){Ae.stop()}function fe(){Ae.start()}let Ae=new $u;Ae.setAnimationLoop(j),typeof self<"u"&&Ae.setContext(self),this.setAnimationLoop=function(R){at=R,je.setAnimationLoop(R),R===null?Ae.stop():Ae.start()},je.addEventListener("sessionstart",de),je.addEventListener("sessionend",fe),this.render=function(R,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(b===!0)return;R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),je.enabled===!0&&je.isPresenting===!0&&(je.cameraAutoUpdate===!0&&je.updateCamera(F),F=je.getCamera()),R.isScene===!0&&R.onBeforeRender(x,R,F,A),m=Pe.get(R,v.length),m.init(),v.push(m),ve.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),X.setFromProjectionMatrix(ve),ee=this.localClippingEnabled,Q=ze.init(this.clippingPlanes,ee),_=Se.get(R,p.length),_.init(),p.push(_),Ze(R,F,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(K,Z),this.info.render.frame++,Q===!0&&ze.beginShadows();let B=m.state.shadowsArray;if(ne.render(B,R,F),Q===!0&&ze.endShadows(),this.info.autoReset===!0&&this.info.reset(),it.render(_,R),m.setupLights(x._useLegacyLights),F.isArrayCamera){let H=F.cameras;for(let G=0,Me=H.length;G<Me;G++){let Le=H[G];yt(_,R,Le,Le.viewport)}}else yt(_,R,F);A!==null&&(T.updateMultisampleRenderTarget(A),T.updateRenderTargetMipmap(A)),R.isScene===!0&&R.onAfterRender(x,R,F),qe.resetDefaultState(),C=-1,y=null,v.pop(),v.length>0?m=v[v.length-1]:m=null,p.pop(),p.length>0?_=p[p.length-1]:_=null};function Ze(R,F,B,H){if(R.visible===!1)return;if(R.layers.test(F.layers)){if(R.isGroup)B=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(F);else if(R.isLight)m.pushLight(R),R.castShadow&&m.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||X.intersectsSprite(R)){H&&De.setFromMatrixPosition(R.matrixWorld).applyMatrix4(ve);let Le=te.update(R),Be=R.material;Be.visible&&_.push(R,Le,Be,B,De.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||X.intersectsObject(R))){let Le=te.update(R),Be=R.material;if(H&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),De.copy(R.boundingSphere.center)):(Le.boundingSphere===null&&Le.computeBoundingSphere(),De.copy(Le.boundingSphere.center)),De.applyMatrix4(R.matrixWorld).applyMatrix4(ve)),Array.isArray(Be)){let We=Le.groups;for(let et=0,Ke=We.length;et<Ke;et++){let $e=We[et],Et=Be[$e.materialIndex];Et&&Et.visible&&_.push(R,Le,Et,B,De.z,$e)}}else Be.visible&&_.push(R,Le,Be,B,De.z,null)}}let Me=R.children;for(let Le=0,Be=Me.length;Le<Be;Le++)Ze(Me[Le],F,B,H)}function yt(R,F,B,H){let G=R.opaque,Me=R.transmissive,Le=R.transparent;m.setupLightsView(B),Q===!0&&ze.setGlobalState(x.clippingPlanes,B),Me.length>0&&vt(G,Me,F,B),H&&q.viewport(M.copy(H)),G.length>0&&lt(G,F,B),Me.length>0&&lt(Me,F,B),Le.length>0&&lt(Le,F,B),q.buffers.depth.setTest(!0),q.buffers.depth.setMask(!0),q.buffers.color.setMask(!0),q.setPolygonOffset(!1)}function vt(R,F,B,H){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;let Me=he.isWebGL2;ce===null&&(ce=new Qt(1,1,{generateMipmaps:!0,type:$.has("EXT_color_buffer_half_float")?Ni:hi,minFilter:jr,samples:Me?4:0})),x.getDrawingBufferSize(Oe),Me?ce.setSize(Oe.x,Oe.y):ce.setSize(Za(Oe.x),Za(Oe.y));let Le=x.getRenderTarget();x.setRenderTarget(ce),x.getClearColor(Y),I=x.getClearAlpha(),I<1&&x.setClearColor(16777215,.5),x.clear();let Be=x.toneMapping;x.toneMapping=Dn,lt(R,B,H),T.updateMultisampleRenderTarget(ce),T.updateRenderTargetMipmap(ce);let We=!1;for(let et=0,Ke=F.length;et<Ke;et++){let $e=F[et],Et=$e.object,tn=$e.geometry,Nt=$e.material,zn=$e.group;if(Nt.side===fn&&Et.layers.test(H.layers)){let bt=Nt.side;Nt.side=Ct,Nt.needsUpdate=!0,ft(Et,B,H,tn,Nt,zn),Nt.side=bt,Nt.needsUpdate=!0,We=!0}}We===!0&&(T.updateMultisampleRenderTarget(ce),T.updateRenderTargetMipmap(ce)),x.setRenderTarget(Le),x.setClearColor(Y,I),x.toneMapping=Be}function lt(R,F,B){let H=F.isScene===!0?F.overrideMaterial:null;for(let G=0,Me=R.length;G<Me;G++){let Le=R[G],Be=Le.object,We=Le.geometry,et=H===null?Le.material:H,Ke=Le.group;Be.layers.test(B.layers)&&ft(Be,F,B,We,et,Ke)}}function ft(R,F,B,H,G,Me){R.onBeforeRender(x,F,B,H,G,Me),R.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),G.onBeforeRender(x,F,B,H,R,Me),G.transparent===!0&&G.side===fn&&G.forceSinglePass===!1?(G.side=Ct,G.needsUpdate=!0,x.renderBufferDirect(B,F,H,G,R,Me),G.side=fi,G.needsUpdate=!0,x.renderBufferDirect(B,F,H,G,R,Me),G.side=fn):x.renderBufferDirect(B,F,H,G,R,Me),R.onAfterRender(x,F,B,H,G,Me)}function $t(R,F,B){F.isScene!==!0&&(F=Ce);let H=be.get(R),G=m.state.lights,Me=m.state.shadowsArray,Le=G.state.version,Be=Te.getParameters(R,G.state,Me,F,B),We=Te.getProgramCacheKey(Be),et=H.programs;H.environment=R.isMeshStandardMaterial?F.environment:null,H.fog=F.fog,H.envMap=(R.isMeshStandardMaterial?k:w).get(R.envMap||H.environment),et===void 0&&(R.addEventListener("dispose",ge),et=new Map,H.programs=et);let Ke=et.get(We);if(Ke!==void 0){if(H.currentProgram===Ke&&H.lightsStateVersion===Le)return ni(R,Be),Ke}else Be.uniforms=Te.getUniforms(R),R.onBuild(B,Be,x),R.onBeforeCompile(Be,x),Ke=Te.acquireProgram(Be,We),et.set(We,Ke),H.uniforms=Be.uniforms;let $e=H.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&($e.clippingPlanes=ze.uniform),ni(R,Be),H.needsLights=Ft(R),H.lightsStateVersion=Le,H.needsLights&&($e.ambientLightColor.value=G.state.ambient,$e.lightProbe.value=G.state.probe,$e.directionalLights.value=G.state.directional,$e.directionalLightShadows.value=G.state.directionalShadow,$e.spotLights.value=G.state.spot,$e.spotLightShadows.value=G.state.spotShadow,$e.rectAreaLights.value=G.state.rectArea,$e.ltc_1.value=G.state.rectAreaLTC1,$e.ltc_2.value=G.state.rectAreaLTC2,$e.pointLights.value=G.state.point,$e.pointLightShadows.value=G.state.pointShadow,$e.hemisphereLights.value=G.state.hemi,$e.directionalShadowMap.value=G.state.directionalShadowMap,$e.directionalShadowMatrix.value=G.state.directionalShadowMatrix,$e.spotShadowMap.value=G.state.spotShadowMap,$e.spotLightMatrix.value=G.state.spotLightMatrix,$e.spotLightMap.value=G.state.spotLightMap,$e.pointShadowMap.value=G.state.pointShadowMap,$e.pointShadowMatrix.value=G.state.pointShadowMatrix),H.currentProgram=Ke,H.uniformsList=null,Ke}function cn(R){if(R.uniformsList===null){let F=R.currentProgram.getUniforms();R.uniformsList=_r.seqWithValue(F.seq,R.uniforms)}return R.uniformsList}function ni(R,F){let B=be.get(R);B.outputColorSpace=F.outputColorSpace,B.batching=F.batching,B.instancing=F.instancing,B.instancingColor=F.instancingColor,B.skinning=F.skinning,B.morphTargets=F.morphTargets,B.morphNormals=F.morphNormals,B.morphColors=F.morphColors,B.morphTargetsCount=F.morphTargetsCount,B.numClippingPlanes=F.numClippingPlanes,B.numIntersection=F.numClipIntersection,B.vertexAlphas=F.vertexAlphas,B.vertexTangents=F.vertexTangents,B.toneMapping=F.toneMapping}function yi(R,F,B,H,G){F.isScene!==!0&&(F=Ce),T.resetTextureUnits();let Me=F.fog,Le=H.isMeshStandardMaterial?F.environment:null,Be=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Kn,We=(H.isMeshStandardMaterial?k:w).get(H.envMap||Le),et=H.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Ke=!!B.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),$e=!!B.morphAttributes.position,Et=!!B.morphAttributes.normal,tn=!!B.morphAttributes.color,Nt=Dn;H.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Nt=x.toneMapping);let zn=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,bt=zn!==void 0?zn.length:0,tt=be.get(H),Qo=m.state.lights;if(Q===!0&&(ee===!0||R!==y)){let un=R===y&&H.id===C;ze.setState(H,R,un)}let St=!1;H.version===tt.__version?(tt.needsLights&&tt.lightsStateVersion!==Qo.state.version||tt.outputColorSpace!==Be||G.isBatchedMesh&&tt.batching===!1||!G.isBatchedMesh&&tt.batching===!0||G.isInstancedMesh&&tt.instancing===!1||!G.isInstancedMesh&&tt.instancing===!0||G.isSkinnedMesh&&tt.skinning===!1||!G.isSkinnedMesh&&tt.skinning===!0||G.isInstancedMesh&&tt.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&tt.instancingColor===!1&&G.instanceColor!==null||tt.envMap!==We||H.fog===!0&&tt.fog!==Me||tt.numClippingPlanes!==void 0&&(tt.numClippingPlanes!==ze.numPlanes||tt.numIntersection!==ze.numIntersection)||tt.vertexAlphas!==et||tt.vertexTangents!==Ke||tt.morphTargets!==$e||tt.morphNormals!==Et||tt.morphColors!==tn||tt.toneMapping!==Nt||he.isWebGL2===!0&&tt.morphTargetsCount!==bt)&&(St=!0):(St=!0,tt.__version=H.version);let bi=tt.currentProgram;St===!0&&(bi=$t(H,F,G));let nc=!1,Fr=!1,ea=!1,Bt=bi.getUniforms(),Mi=tt.uniforms;if(q.useProgram(bi.program)&&(nc=!0,Fr=!0,ea=!0),H.id!==C&&(C=H.id,Fr=!0),nc||y!==R){Bt.setValue(L,"projectionMatrix",R.projectionMatrix),Bt.setValue(L,"viewMatrix",R.matrixWorldInverse);let un=Bt.map.cameraPosition;un!==void 0&&un.setValue(L,De.setFromMatrixPosition(R.matrixWorld)),he.logarithmicDepthBuffer&&Bt.setValue(L,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&Bt.setValue(L,"isOrthographic",R.isOrthographicCamera===!0),y!==R&&(y=R,Fr=!0,ea=!0)}if(G.isSkinnedMesh){Bt.setOptional(L,G,"bindMatrix"),Bt.setOptional(L,G,"bindMatrixInverse");let un=G.skeleton;un&&(he.floatVertexTextures?(un.boneTexture===null&&un.computeBoneTexture(),Bt.setValue(L,"boneTexture",un.boneTexture,T)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}G.isBatchedMesh&&(Bt.setOptional(L,G,"batchingTexture"),Bt.setValue(L,"batchingTexture",G._matricesTexture,T));let ta=B.morphAttributes;if((ta.position!==void 0||ta.normal!==void 0||ta.color!==void 0&&he.isWebGL2===!0)&&Je.update(G,B,bi),(Fr||tt.receiveShadow!==G.receiveShadow)&&(tt.receiveShadow=G.receiveShadow,Bt.setValue(L,"receiveShadow",G.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Mi.envMap.value=We,Mi.flipEnvMap.value=We.isCubeTexture&&We.isRenderTargetTexture===!1?-1:1),Fr&&(Bt.setValue(L,"toneMappingExposure",x.toneMappingExposure),tt.needsLights&&vi(Mi,ea),Me&&H.fog===!0&&_e.refreshFogUniforms(Mi,Me),_e.refreshMaterialUniforms(Mi,H,V,O,ce),_r.upload(L,cn(tt),Mi,T)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(_r.upload(L,cn(tt),Mi,T),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&Bt.setValue(L,"center",G.center),Bt.setValue(L,"modelViewMatrix",G.modelViewMatrix),Bt.setValue(L,"normalMatrix",G.normalMatrix),Bt.setValue(L,"modelMatrix",G.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){let un=H.uniformsGroups;for(let na=0,Xd=un.length;na<Xd;na++)if(he.isWebGL2){let ic=un[na];rt.update(ic,bi),rt.bind(ic,bi)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return bi}function vi(R,F){R.ambientLightColor.needsUpdate=F,R.lightProbe.needsUpdate=F,R.directionalLights.needsUpdate=F,R.directionalLightShadows.needsUpdate=F,R.pointLights.needsUpdate=F,R.pointLightShadows.needsUpdate=F,R.spotLights.needsUpdate=F,R.spotLightShadows.needsUpdate=F,R.rectAreaLights.needsUpdate=F,R.hemisphereLights.needsUpdate=F}function Ft(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(R,F,B){be.get(R.texture).__webglTexture=F,be.get(R.depthTexture).__webglTexture=B;let H=be.get(R);H.__hasExternalTextures=!0,H.__hasExternalTextures&&(H.__autoAllocateDepthBuffer=B===void 0,H.__autoAllocateDepthBuffer||$.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(R,F){let B=be.get(R);B.__webglFramebuffer=F,B.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(R,F=0,B=0){A=R,E=F,S=B;let H=!0,G=null,Me=!1,Le=!1;if(R){let We=be.get(R);We.__useDefaultFramebuffer!==void 0?(q.bindFramebuffer(L.FRAMEBUFFER,null),H=!1):We.__webglFramebuffer===void 0?T.setupRenderTarget(R):We.__hasExternalTextures&&T.rebindTextures(R,be.get(R.texture).__webglTexture,be.get(R.depthTexture).__webglTexture);let et=R.texture;(et.isData3DTexture||et.isDataArrayTexture||et.isCompressedArrayTexture)&&(Le=!0);let Ke=be.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(Ke[F])?G=Ke[F][B]:G=Ke[F],Me=!0):he.isWebGL2&&R.samples>0&&T.useMultisampledRTT(R)===!1?G=be.get(R).__webglMultisampledFramebuffer:Array.isArray(Ke)?G=Ke[B]:G=Ke,M.copy(R.viewport),U.copy(R.scissor),z=R.scissorTest}else M.copy(re).multiplyScalar(V).floor(),U.copy(se).multiplyScalar(V).floor(),z=pe;if(q.bindFramebuffer(L.FRAMEBUFFER,G)&&he.drawBuffers&&H&&q.drawBuffers(R,G),q.viewport(M),q.scissor(U),q.setScissorTest(z),Me){let We=be.get(R.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+F,We.__webglTexture,B)}else if(Le){let We=be.get(R.texture),et=F||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,We.__webglTexture,B||0,et)}C=-1},this.readRenderTargetPixels=function(R,F,B,H,G,Me,Le){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Be=be.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Le!==void 0&&(Be=Be[Le]),Be){q.bindFramebuffer(L.FRAMEBUFFER,Be);try{let We=R.texture,et=We.format,Ke=We.type;if(et!==Tn&&we.convert(et)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let $e=Ke===Ni&&($.has("EXT_color_buffer_half_float")||he.isWebGL2&&$.has("EXT_color_buffer_float"));if(Ke!==hi&&we.convert(Ke)!==L.getParameter(L.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ke===ci&&(he.isWebGL2||$.has("OES_texture_float")||$.has("WEBGL_color_buffer_float")))&&!$e){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=R.width-H&&B>=0&&B<=R.height-G&&L.readPixels(F,B,H,G,we.convert(et),we.convert(Ke),Me)}finally{let We=A!==null?be.get(A).__webglFramebuffer:null;q.bindFramebuffer(L.FRAMEBUFFER,We)}}},this.copyFramebufferToTexture=function(R,F,B=0){let H=Math.pow(2,-B),G=Math.floor(F.image.width*H),Me=Math.floor(F.image.height*H);T.setTexture2D(F,0),L.copyTexSubImage2D(L.TEXTURE_2D,B,0,0,R.x,R.y,G,Me),q.unbindTexture()},this.copyTextureToTexture=function(R,F,B,H=0){let G=F.image.width,Me=F.image.height,Le=we.convert(B.format),Be=we.convert(B.type);T.setTexture2D(B,0),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,B.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,B.unpackAlignment),F.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,H,R.x,R.y,G,Me,Le,Be,F.image.data):F.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,H,R.x,R.y,F.mipmaps[0].width,F.mipmaps[0].height,Le,F.mipmaps[0].data):L.texSubImage2D(L.TEXTURE_2D,H,R.x,R.y,Le,Be,F.image),H===0&&B.generateMipmaps&&L.generateMipmap(L.TEXTURE_2D),q.unbindTexture()},this.copyTextureToTexture3D=function(R,F,B,H,G=0){if(x.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let Me=R.max.x-R.min.x+1,Le=R.max.y-R.min.y+1,Be=R.max.z-R.min.z+1,We=we.convert(H.format),et=we.convert(H.type),Ke;if(H.isData3DTexture)T.setTexture3D(H,0),Ke=L.TEXTURE_3D;else if(H.isDataArrayTexture||H.isCompressedArrayTexture)T.setTexture2DArray(H,0),Ke=L.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,H.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,H.unpackAlignment);let $e=L.getParameter(L.UNPACK_ROW_LENGTH),Et=L.getParameter(L.UNPACK_IMAGE_HEIGHT),tn=L.getParameter(L.UNPACK_SKIP_PIXELS),Nt=L.getParameter(L.UNPACK_SKIP_ROWS),zn=L.getParameter(L.UNPACK_SKIP_IMAGES),bt=B.isCompressedTexture?B.mipmaps[G]:B.image;L.pixelStorei(L.UNPACK_ROW_LENGTH,bt.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,bt.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,R.min.x),L.pixelStorei(L.UNPACK_SKIP_ROWS,R.min.y),L.pixelStorei(L.UNPACK_SKIP_IMAGES,R.min.z),B.isDataTexture||B.isData3DTexture?L.texSubImage3D(Ke,G,F.x,F.y,F.z,Me,Le,Be,We,et,bt.data):B.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),L.compressedTexSubImage3D(Ke,G,F.x,F.y,F.z,Me,Le,Be,We,bt.data)):L.texSubImage3D(Ke,G,F.x,F.y,F.z,Me,Le,Be,We,et,bt),L.pixelStorei(L.UNPACK_ROW_LENGTH,$e),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Et),L.pixelStorei(L.UNPACK_SKIP_PIXELS,tn),L.pixelStorei(L.UNPACK_SKIP_ROWS,Nt),L.pixelStorei(L.UNPACK_SKIP_IMAGES,zn),G===0&&H.generateMipmaps&&L.generateMipmap(Ke),q.unbindTexture()},this.initTexture=function(R){R.isCubeTexture?T.setTextureCube(R,0):R.isData3DTexture?T.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?T.setTexture2DArray(R,0):T.setTexture2D(R,0),q.unbindTexture()},this.resetState=function(){E=0,S=0,A=null,q.reset(),qe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Yn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===Ol?"display-p3":"srgb",t.unpackColorSpace=ct.workingColorSpace===Io?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===Tt?Di:Wu}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Di?Tt:Kn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},ul=class extends es{};ul.prototype.isWebGL1Renderer=!0;var Un=class extends Wt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}},mo=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Xa,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=Zn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Zn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Zn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},qt=new P,ts=class i{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix4(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyNormalMatrix(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.transformDirection(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}setX(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=qn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=qn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=qn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=qn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array),s=ut(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Vt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},ns=class extends $n{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Xe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},lr,Hr=new P,cr=new P,ur=new P,hr=new J,Vr=new J,ih=new ht,Hs=new P,Wr=new P,Vs=new P,wu=new J,Ua=new J,Eu=new J,go=class extends Wt{constructor(e=new ns){if(super(),this.isSprite=!0,this.type="Sprite",lr===void 0){lr=new wt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new mo(t,5);lr.setIndex([0,1,2,0,2,3]),lr.setAttribute("position",new ts(n,3,0,!1)),lr.setAttribute("uv",new ts(n,2,3,!1))}this.geometry=lr,this.material=e,this.center=new J(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),cr.setFromMatrixScale(this.matrixWorld),ih.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ur.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&cr.multiplyScalar(-ur.z);let n=this.material.rotation,r,s;n!==0&&(s=Math.cos(n),r=Math.sin(n));let o=this.center;Ws(Hs.set(-.5,-.5,0),ur,o,cr,r,s),Ws(Wr.set(.5,-.5,0),ur,o,cr,r,s),Ws(Vs.set(.5,.5,0),ur,o,cr,r,s),wu.set(0,0),Ua.set(1,0),Eu.set(1,1);let a=e.ray.intersectTriangle(Hs,Wr,Vs,!1,Hr);if(a===null&&(Ws(Wr.set(-.5,.5,0),ur,o,cr,r,s),Ua.set(0,1),a=e.ray.intersectTriangle(Hs,Vs,Wr,!1,Hr),a===null))return;let l=e.ray.origin.distanceTo(Hr);l<e.near||l>e.far||t.push({distance:l,point:Hr.clone(),uv:Pi.getInterpolation(Hr,Hs,Wr,Vs,wu,Ua,Eu,new J),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Ws(i,e,t,n,r,s){hr.subVectors(i,t).addScalar(.5).multiply(n),r!==void 0?(Vr.x=s*hr.x-r*hr.y,Vr.y=r*hr.x+s*hr.y):Vr.copy(hr),i.copy(e),i.x+=Vr.x,i.y+=Vr.y,i.applyMatrix4(ih)}var is=class extends Vt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},dr=new ht,Tu=new ht,Xs=[],Au=new Jn,Ox=new ht,Xr=new le,qr=new Oi,xo=class extends le{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new is(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,Ox)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Jn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,dr),Au.copy(e.boundingBox).applyMatrix4(dr),this.boundingBox.union(Au)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Oi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,dr),qr.copy(e.boundingSphere).applyMatrix4(dr),this.boundingSphere.union(qr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Xr.geometry=this.geometry,Xr.material=this.material,Xr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),qr.copy(this.boundingSphere),qr.applyMatrix4(n),e.ray.intersectsSphere(qr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,dr),Tu.multiplyMatrices(n,dr),Xr.matrixWorld=Tu,Xr.raycast(e,Xs);for(let o=0,a=Xs.length;o<a;o++){let l=Xs[o];l.instanceId=s,l.object=this,t.push(l)}Xs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new is(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var Er=class extends mn{constructor(e,t,n,r,s,o,a,l,c){super(e,t,n,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},xn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),r=0,s=n.length,o;t?o=t:o=e*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);let u=n[r],d=n[r+1]-u,f=(o-u)/d;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new J:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new P,r=[],s=[],o=[],a=new P,l=new ht;for(let f=0;f<=e;f++){let g=f/e;r[f]=this.getTangentAt(g,new P)}s[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),d=Math.abs(r[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(zt(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(zt(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],f*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},rs=class extends xn{constructor(e=0,t=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let n=t||new J,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},hl=class extends rs{constructor(e,t,n,r,s,o){super(e,t,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function zl(){let i=0,e=0,t=0,n=0;function r(s,o,a,l){i=s,e=a,t=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let d=(o-s)/c-(a-s)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,f*=u,r(o,a,d,f)},calc:function(s){let o=s*s,a=o*s;return i+e*s+t*o+n*a}}}var qs=new P,Na=new zl,Oa=new zl,Fa=new zl,ss=class extends xn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new P){let n=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(qs.subVectors(r[0],r[1]).add(r[0]),c=qs);let h=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(qs.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=qs),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),f),_=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Na.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,_,m),Oa.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,_,m),Fa.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,_,m)}else this.curveType==="catmullrom"&&(Na.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),Oa.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Fa.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(Na.calc(l),Oa.calc(l),Fa.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Ru(i,e,t,n,r){let s=(n-e)*.5,o=(r-t)*.5,a=i*i,l=i*a;return(2*t-2*n+s+o)*l+(-3*t+3*n-2*s-o)*a+s*i+t}function Fx(i,e){let t=1-i;return t*t*e}function zx(i,e){return 2*(1-i)*i*e}function kx(i,e){return i*i*e}function Jr(i,e,t,n){return Fx(i,e)+zx(i,t)+kx(i,n)}function Bx(i,e){let t=1-i;return t*t*t*e}function Gx(i,e){let t=1-i;return 3*t*t*i*e}function Hx(i,e){return 3*(1-i)*i*i*e}function Vx(i,e){return i*i*i*e}function $r(i,e,t,n,r){return Bx(i,e)+Gx(i,t)+Hx(i,n)+Vx(i,r)}var _o=class extends xn{constructor(e=new J,t=new J,n=new J,r=new J){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new J){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set($r(e,r.x,s.x,o.x,a.x),$r(e,r.y,s.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},dl=class extends xn{constructor(e=new P,t=new P,n=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new P){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set($r(e,r.x,s.x,o.x,a.x),$r(e,r.y,s.y,o.y,a.y),$r(e,r.z,s.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},yo=class extends xn{constructor(e=new J,t=new J){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new J){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new J){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},fl=class extends xn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},vo=class extends xn{constructor(e=new J,t=new J,n=new J){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new J){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Jr(e,r.x,s.x,o.x),Jr(e,r.y,s.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},bo=class extends xn{constructor(e=new P,t=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new P){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Jr(e,r.x,s.x,o.x),Jr(e,r.y,s.y,o.y),Jr(e,r.z,s.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Mo=class extends xn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new J){let n=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return n.set(Ru(a,l.x,c.x,u.x,h.x),Ru(a,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new J().fromArray(r))}return this}},So=Object.freeze({__proto__:null,ArcCurve:hl,CatmullRomCurve3:ss,CubicBezierCurve:_o,CubicBezierCurve3:dl,EllipseCurve:rs,LineCurve:yo,LineCurve3:fl,QuadraticBezierCurve:vo,QuadraticBezierCurve3:bo,SplineCurve:Mo}),pl=class extends xn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new So[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=n){let o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(new So[r.type]().fromJSON(r))}return this}},Tr=class extends pl{constructor(e){super(),this.type="Path",this.currentPoint=new J,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new yo(this.currentPoint.clone(),new J(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let s=new vo(this.currentPoint.clone(),new J(e,t),new J(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,o){let a=new _o(this.currentPoint.clone(),new J(e,t),new J(n,r),new J(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Mo(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,r,s,o),this}absarc(e,t,n,r,s,o){return this.absellipse(e,t,n,n,r,s,o),this}ellipse(e,t,n,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,r,s,o,a,l),this}absellipse(e,t,n,r,s,o,a,l){let c=new rs(e,t,n,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Ar=class i extends wt{constructor(e=[new J(0,-.5),new J(.5,0),new J(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=zt(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],u=1/t,h=new P,d=new J,f=new P,g=new P,_=new P,m=0,p=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,p=e[v+1].y-e[v].y,f.x=p*1,f.y=-m,f.z=p*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[v+1].x-e[v].x,p=e[v+1].y-e[v].y,f.x=p*1,f.y=-m,f.z=p*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let v=0;v<=t;v++){let x=n+v*u*r,b=Math.sin(x),E=Math.cos(x);for(let S=0;S<=e.length-1;S++){h.x=e[S].x*b,h.y=e[S].y,h.z=e[S].x*E,o.push(h.x,h.y,h.z),d.x=v/t,d.y=S/(e.length-1),a.push(d.x,d.y);let A=l[3*S+0]*b,C=l[3*S+1],y=l[3*S+0]*E;c.push(A,C,y)}}for(let v=0;v<t;v++)for(let x=0;x<e.length-1;x++){let b=x+v*e.length,E=b,S=b+e.length,A=b+e.length+1,C=b+1;s.push(E,S,C),s.push(A,C,S)}this.setIndex(s),this.setAttribute("position",new Ye(o,3)),this.setAttribute("uv",new Ye(a,2)),this.setAttribute("normal",new Ye(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var wo=class i extends wt{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new P,u=new J;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let f=n+h/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new Ye(o,3)),this.setAttribute("normal",new Ye(a,3)),this.setAttribute("uv",new Ye(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},_n=class i extends wt{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],d=[],f=[],g=0,_=[],m=n/2,p=0;v(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new Ye(h,3)),this.setAttribute("normal",new Ye(d,3)),this.setAttribute("uv",new Ye(f,2));function v(){let b=new P,E=new P,S=0,A=(t-e)/n;for(let C=0;C<=s;C++){let y=[],M=C/s,U=M*(t-e)+e;for(let z=0;z<=r;z++){let Y=z/r,I=Y*l+a,D=Math.sin(I),O=Math.cos(I);E.x=U*D,E.y=-M*n+m,E.z=U*O,h.push(E.x,E.y,E.z),b.set(D,A,O).normalize(),d.push(b.x,b.y,b.z),f.push(Y,1-M),y.push(g++)}_.push(y)}for(let C=0;C<r;C++)for(let y=0;y<s;y++){let M=_[y][C],U=_[y+1][C],z=_[y+1][C+1],Y=_[y][C+1];u.push(M,U,Y),u.push(U,z,Y),S+=6}c.addGroup(p,S,0),p+=S}function x(b){let E=g,S=new J,A=new P,C=0,y=b===!0?e:t,M=b===!0?1:-1;for(let z=1;z<=r;z++)h.push(0,m*M,0),d.push(0,M,0),f.push(.5,.5),g++;let U=g;for(let z=0;z<=r;z++){let I=z/r*l+a,D=Math.cos(I),O=Math.sin(I);A.x=y*O,A.y=m*M,A.z=y*D,h.push(A.x,A.y,A.z),d.push(0,M,0),S.x=D*.5+.5,S.y=O*.5*M+.5,f.push(S.x,S.y),g++}for(let z=0;z<r;z++){let Y=E+z,I=U+z;b===!0?u.push(I,I+1,Y):u.push(I+1,I,Y),C+=3}c.addGroup(p,C,b===!0?1:2),p+=C}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Xt=class i extends _n{constructor(e=1,t=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ml=class i extends wt{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};let s=[],o=[];a(r),c(n),u(),this.setAttribute("position",new Ye(s,3)),this.setAttribute("normal",new Ye(s.slice(),3)),this.setAttribute("uv",new Ye(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(v){let x=new P,b=new P,E=new P;for(let S=0;S<t.length;S+=3)f(t[S+0],x),f(t[S+1],b),f(t[S+2],E),l(x,b,E,v)}function l(v,x,b,E){let S=E+1,A=[];for(let C=0;C<=S;C++){A[C]=[];let y=v.clone().lerp(b,C/S),M=x.clone().lerp(b,C/S),U=S-C;for(let z=0;z<=U;z++)z===0&&C===S?A[C][z]=y:A[C][z]=y.clone().lerp(M,z/U)}for(let C=0;C<S;C++)for(let y=0;y<2*(S-C)-1;y++){let M=Math.floor(y/2);y%2===0?(d(A[C][M+1]),d(A[C+1][M]),d(A[C][M])):(d(A[C][M+1]),d(A[C+1][M+1]),d(A[C+1][M]))}}function c(v){let x=new P;for(let b=0;b<s.length;b+=3)x.x=s[b+0],x.y=s[b+1],x.z=s[b+2],x.normalize().multiplyScalar(v),s[b+0]=x.x,s[b+1]=x.y,s[b+2]=x.z}function u(){let v=new P;for(let x=0;x<s.length;x+=3){v.x=s[x+0],v.y=s[x+1],v.z=s[x+2];let b=m(v)/2/Math.PI+.5,E=p(v)/Math.PI+.5;o.push(b,1-E)}g(),h()}function h(){for(let v=0;v<o.length;v+=6){let x=o[v+0],b=o[v+2],E=o[v+4],S=Math.max(x,b,E),A=Math.min(x,b,E);S>.9&&A<.1&&(x<.2&&(o[v+0]+=1),b<.2&&(o[v+2]+=1),E<.2&&(o[v+4]+=1))}}function d(v){s.push(v.x,v.y,v.z)}function f(v,x){let b=v*3;x.x=e[b+0],x.y=e[b+1],x.z=e[b+2]}function g(){let v=new P,x=new P,b=new P,E=new P,S=new J,A=new J,C=new J;for(let y=0,M=0;y<s.length;y+=9,M+=6){v.set(s[y+0],s[y+1],s[y+2]),x.set(s[y+3],s[y+4],s[y+5]),b.set(s[y+6],s[y+7],s[y+8]),S.set(o[M+0],o[M+1]),A.set(o[M+2],o[M+3]),C.set(o[M+4],o[M+5]),E.copy(v).add(x).add(b).divideScalar(3);let U=m(E);_(S,M+0,v,U),_(A,M+2,x,U),_(C,M+4,b,U)}}function _(v,x,b,E){E<0&&v.x===1&&(o[x]=v.x-1),b.x===0&&b.z===0&&(o[x]=E/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function p(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.details)}};var on=class extends Tr{constructor(e){super(e),this.uuid=Zn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(new Tr().fromJSON(r))}return this}},Wx={triangulate:function(i,e,t=2){let n=e&&e.length,r=n?e[0]*t:i.length,s=rh(i,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,u,h,d,f;if(n&&(s=Kx(i,e,s,t)),i.length>80*t){a=c=i[0],l=u=i[1];for(let g=t;g<r;g+=t)h=i[g],d=i[g+1],h<a&&(a=h),d<l&&(l=d),h>c&&(c=h),d>u&&(u=d);f=Math.max(c-a,u-l),f=f!==0?32767/f:0}return os(s,o,t,a,l,f,0),o}};function rh(i,e,t,n,r){let s,o;if(r===o_(i,e,t,n)>0)for(s=e;s<t;s+=n)o=Cu(s,i[s],i[s+1],o);else for(s=t-n;s>=e;s-=n)o=Cu(s,i[s],i[s+1],o);return o&&Do(o,o.next)&&(ls(o),o=o.next),o}function Fi(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Do(t,t.next)||Mt(t.prev,t,t.next)===0)){if(ls(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function os(i,e,t,n,r,s,o){if(!i)return;!o&&s&&e_(i,n,r,s);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,s?qx(i,n,r,s):Xx(i)){e.push(l.i/t|0),e.push(i.i/t|0),e.push(c.i/t|0),ls(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Yx(Fi(i),e,t),os(i,e,t,n,r,s,2)):o===2&&Zx(i,e,t,n,r,s):os(Fi(i),e,t,n,r,s,1);break}}}function Xx(i){let e=i.prev,t=i,n=i.next;if(Mt(e,t,n)>=0)return!1;let r=e.x,s=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=r<s?r<o?r:o:s<o?s:o,h=a<l?a<c?a:c:l<c?l:c,d=r>s?r>o?r:o:s>o?s:o,f=a>l?a>c?a:c:l>c?l:c,g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=d&&g.y>=h&&g.y<=f&&mr(r,a,s,l,o,c,g.x,g.y)&&Mt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function qx(i,e,t,n){let r=i.prev,s=i,o=i.next;if(Mt(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,d=o.y,f=a<l?a<c?a:c:l<c?l:c,g=u<h?u<d?u:d:h<d?h:d,_=a>l?a>c?a:c:l>c?l:c,m=u>h?u>d?u:d:h>d?h:d,p=gl(f,g,e,t,n),v=gl(_,m,e,t,n),x=i.prevZ,b=i.nextZ;for(;x&&x.z>=p&&b&&b.z<=v;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&mr(a,u,l,h,c,d,x.x,x.y)&&Mt(x.prev,x,x.next)>=0||(x=x.prevZ,b.x>=f&&b.x<=_&&b.y>=g&&b.y<=m&&b!==r&&b!==o&&mr(a,u,l,h,c,d,b.x,b.y)&&Mt(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;x&&x.z>=p;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&mr(a,u,l,h,c,d,x.x,x.y)&&Mt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;b&&b.z<=v;){if(b.x>=f&&b.x<=_&&b.y>=g&&b.y<=m&&b!==r&&b!==o&&mr(a,u,l,h,c,d,b.x,b.y)&&Mt(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Yx(i,e,t){let n=i;do{let r=n.prev,s=n.next.next;!Do(r,s)&&sh(r,n,n.next,s)&&as(r,s)&&as(s,r)&&(e.push(r.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),ls(n),ls(n.next),n=i=s),n=n.next}while(n!==i);return Fi(n)}function Zx(i,e,t,n,r,s){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&i_(o,a)){let l=oh(o,a);o=Fi(o,o.next),l=Fi(l,l.next),os(o,e,t,n,r,s,0),os(l,e,t,n,r,s,0);return}a=a.next}o=o.next}while(o!==i)}function Kx(i,e,t,n){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*n,l=s<o-1?e[s+1]*n:i.length,c=rh(i,a,l,n,!1),c===c.next&&(c.steiner=!0),r.push(n_(c));for(r.sort(Jx),s=0;s<r.length;s++)t=$x(r[s],t);return t}function Jx(i,e){return i.x-e.x}function $x(i,e){let t=jx(i,e);if(!t)return e;let n=oh(t,i);return Fi(n,n.next),Fi(t,t.next)}function jx(i,e){let t=e,n=-1/0,r,s=i.x,o=i.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let d=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=s&&d>n&&(n=d,r=t.x<t.next.x?t:t.next,d===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,u=1/0,h;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&mr(o<c?s:n,o,l,c,o<c?n:s,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(s-t.x),as(t,i)&&(h<u||h===u&&(t.x>r.x||t.x===r.x&&Qx(r,t)))&&(r=t,u=h)),t=t.next;while(t!==a);return r}function Qx(i,e){return Mt(i.prev,i,e.prev)<0&&Mt(e.next,i,i.next)<0}function e_(i,e,t,n){let r=i;do r.z===0&&(r.z=gl(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,t_(r)}function t_(i){let e,t,n,r,s,o,a,l,c=1;do{for(t=i,i=null,s=null,o=0;t;){for(o++,n=t,a=0,e=0;e<c&&(a++,n=n.nextZ,!!n);e++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||t.z<=n.z)?(r=t,t=t.nextZ,a--):(r=n,n=n.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;t=n}s.nextZ=null,c*=2}while(o>1);return i}function gl(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function n_(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function mr(i,e,t,n,r,s,o,a){return(r-o)*(e-a)>=(i-o)*(s-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(n-a)}function i_(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!r_(i,e)&&(as(i,e)&&as(e,i)&&s_(i,e)&&(Mt(i.prev,i,e.prev)||Mt(i,e.prev,e))||Do(i,e)&&Mt(i.prev,i,i.next)>0&&Mt(e.prev,e,e.next)>0)}function Mt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Do(i,e){return i.x===e.x&&i.y===e.y}function sh(i,e,t,n){let r=Zs(Mt(i,e,t)),s=Zs(Mt(i,e,n)),o=Zs(Mt(t,n,i)),a=Zs(Mt(t,n,e));return!!(r!==s&&o!==a||r===0&&Ys(i,t,e)||s===0&&Ys(i,n,e)||o===0&&Ys(t,i,n)||a===0&&Ys(t,e,n))}function Ys(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Zs(i){return i>0?1:i<0?-1:0}function r_(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&sh(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function as(i,e){return Mt(i.prev,i,i.next)<0?Mt(i,e,i.next)>=0&&Mt(i,i.prev,e)>=0:Mt(i,e,i.prev)<0||Mt(i,i.next,e)<0}function s_(i,e){let t=i,n=!1,r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function oh(i,e){let t=new xl(i.i,i.x,i.y),n=new xl(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function Cu(i,e,t,n){let r=new xl(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function ls(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function xl(i,e,t){this.i=i,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function o_(i,e,t,n){let r=0;for(let s=e,o=t-n;s<t;s+=n)r+=(i[o]-i[s])*(i[s+1]+i[o+1]),o=s;return r}var di=class i{static area(e){let t=e.length,n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],r=[],s=[];Pu(e),Iu(n,e);let o=e.length;t.forEach(Pu);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,Iu(n,t[l]);let a=Wx.triangulate(n,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function Pu(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Iu(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var zi=class i extends wt{constructor(e=new on([new J(.5,.5),new J(-.5,.5),new J(-.5,-.5),new J(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new Ye(r,3)),this.setAttribute("uv",new Ye(s,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:a_,x,b=!1,E,S,A,C;p&&(x=p.getSpacedPoints(u),b=!0,d=!1,E=p.computeFrenetFrames(u,!1),S=new P,A=new P,C=new P),d||(m=0,f=0,g=0,_=0);let y=a.extractPoints(c),M=y.shape,U=y.holes;if(!di.isClockWise(M)){M=M.reverse();for(let L=0,ue=U.length;L<ue;L++){let $=U[L];di.isClockWise($)&&(U[L]=$.reverse())}}let Y=di.triangulateShape(M,U),I=M;for(let L=0,ue=U.length;L<ue;L++){let $=U[L];M=M.concat($)}function D(L,ue,$){return ue||console.error("THREE.ExtrudeGeometry: vec does not exist"),L.clone().addScaledVector(ue,$)}let O=M.length,V=Y.length;function K(L,ue,$){let he,q,Ie,be=L.x-ue.x,T=L.y-ue.y,w=$.x-L.x,k=$.y-L.y,ie=be*be+T*T,oe=be*k-T*w;if(Math.abs(oe)>Number.EPSILON){let te=Math.sqrt(ie),Te=Math.sqrt(w*w+k*k),_e=ue.x-T/te,Se=ue.y+be/te,Pe=$.x-k/Te,ze=$.y+w/Te,ne=((Pe-_e)*k-(ze-Se)*w)/(be*k-T*w);he=_e+be*ne-L.x,q=Se+T*ne-L.y;let it=he*he+q*q;if(it<=2)return new J(he,q);Ie=Math.sqrt(it/2)}else{let te=!1;be>Number.EPSILON?w>Number.EPSILON&&(te=!0):be<-Number.EPSILON?w<-Number.EPSILON&&(te=!0):Math.sign(T)===Math.sign(k)&&(te=!0),te?(he=-T,q=be,Ie=Math.sqrt(ie)):(he=be,q=T,Ie=Math.sqrt(ie/2))}return new J(he/Ie,q/Ie)}let Z=[];for(let L=0,ue=I.length,$=ue-1,he=L+1;L<ue;L++,$++,he++)$===ue&&($=0),he===ue&&(he=0),Z[L]=K(I[L],I[$],I[he]);let re=[],se,pe=Z.concat();for(let L=0,ue=U.length;L<ue;L++){let $=U[L];se=[];for(let he=0,q=$.length,Ie=q-1,be=he+1;he<q;he++,Ie++,be++)Ie===q&&(Ie=0),be===q&&(be=0),se[he]=K($[he],$[Ie],$[be]);re.push(se),pe=pe.concat(se)}for(let L=0;L<m;L++){let ue=L/m,$=f*Math.cos(ue*Math.PI/2),he=g*Math.sin(ue*Math.PI/2)+_;for(let q=0,Ie=I.length;q<Ie;q++){let be=D(I[q],Z[q],he);ve(be.x,be.y,-$)}for(let q=0,Ie=U.length;q<Ie;q++){let be=U[q];se=re[q];for(let T=0,w=be.length;T<w;T++){let k=D(be[T],se[T],he);ve(k.x,k.y,-$)}}}let X=g+_;for(let L=0;L<O;L++){let ue=d?D(M[L],pe[L],X):M[L];b?(A.copy(E.normals[0]).multiplyScalar(ue.x),S.copy(E.binormals[0]).multiplyScalar(ue.y),C.copy(x[0]).add(A).add(S),ve(C.x,C.y,C.z)):ve(ue.x,ue.y,0)}for(let L=1;L<=u;L++)for(let ue=0;ue<O;ue++){let $=d?D(M[ue],pe[ue],X):M[ue];b?(A.copy(E.normals[L]).multiplyScalar($.x),S.copy(E.binormals[L]).multiplyScalar($.y),C.copy(x[L]).add(A).add(S),ve(C.x,C.y,C.z)):ve($.x,$.y,h/u*L)}for(let L=m-1;L>=0;L--){let ue=L/m,$=f*Math.cos(ue*Math.PI/2),he=g*Math.sin(ue*Math.PI/2)+_;for(let q=0,Ie=I.length;q<Ie;q++){let be=D(I[q],Z[q],he);ve(be.x,be.y,h+$)}for(let q=0,Ie=U.length;q<Ie;q++){let be=U[q];se=re[q];for(let T=0,w=be.length;T<w;T++){let k=D(be[T],se[T],he);b?ve(k.x,k.y+x[u-1].y,x[u-1].x+$):ve(k.x,k.y,h+$)}}}Q(),ee();function Q(){let L=r.length/3;if(d){let ue=0,$=O*ue;for(let he=0;he<V;he++){let q=Y[he];Oe(q[2]+$,q[1]+$,q[0]+$)}ue=u+m*2,$=O*ue;for(let he=0;he<V;he++){let q=Y[he];Oe(q[0]+$,q[1]+$,q[2]+$)}}else{for(let ue=0;ue<V;ue++){let $=Y[ue];Oe($[2],$[1],$[0])}for(let ue=0;ue<V;ue++){let $=Y[ue];Oe($[0]+O*u,$[1]+O*u,$[2]+O*u)}}n.addGroup(L,r.length/3-L,0)}function ee(){let L=r.length/3,ue=0;ce(I,ue),ue+=I.length;for(let $=0,he=U.length;$<he;$++){let q=U[$];ce(q,ue),ue+=q.length}n.addGroup(L,r.length/3-L,1)}function ce(L,ue){let $=L.length;for(;--$>=0;){let he=$,q=$-1;q<0&&(q=L.length-1);for(let Ie=0,be=u+m*2;Ie<be;Ie++){let T=O*Ie,w=O*(Ie+1),k=ue+he+T,ie=ue+q+T,oe=ue+q+w,te=ue+he+w;De(k,ie,oe,te)}}}function ve(L,ue,$){l.push(L),l.push(ue),l.push($)}function Oe(L,ue,$){Ce(L),Ce(ue),Ce($);let he=r.length/3,q=v.generateTopUV(n,r,he-3,he-2,he-1);Ue(q[0]),Ue(q[1]),Ue(q[2])}function De(L,ue,$,he){Ce(L),Ce(ue),Ce(he),Ce(ue),Ce($),Ce(he);let q=r.length/3,Ie=v.generateSideWallUV(n,r,q-6,q-3,q-2,q-1);Ue(Ie[0]),Ue(Ie[1]),Ue(Ie[3]),Ue(Ie[1]),Ue(Ie[2]),Ue(Ie[3])}function Ce(L){r.push(l[L*3+0]),r.push(l[L*3+1]),r.push(l[L*3+2])}function Ue(L){s.push(L.x),s.push(L.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return l_(t,n,e)}static fromJSON(e,t){let n=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];n.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new So[r.type]().fromJSON(r)),new i(n,e.options)}},a_={generateTopUV:function(i,e,t,n,r){let s=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[r*3],u=e[r*3+1];return[new J(s,o),new J(a,l),new J(c,u)]},generateSideWallUV:function(i,e,t,n,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],h=e[n*3+2],d=e[r*3],f=e[r*3+1],g=e[r*3+2],_=e[s*3],m=e[s*3+1],p=e[s*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new J(o,1-l),new J(c,1-h),new J(d,1-g),new J(_,1-p)]:[new J(a,1-l),new J(u,1-h),new J(f,1-g),new J(m,1-p)]}};function l_(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){let s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Rr=class i extends ml{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var gi=class i extends wt{constructor(e=.5,t=1,n=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:o},n=Math.max(3,n),r=Math.max(1,r);let a=[],l=[],c=[],u=[],h=e,d=(t-e)/r,f=new P,g=new J;for(let _=0;_<=r;_++){for(let m=0;m<=n;m++){let p=s+m/n*o;f.x=h*Math.cos(p),f.y=h*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}h+=d}for(let _=0;_<r;_++){let m=_*(n+1);for(let p=0;p<n;p++){let v=p+m,x=v,b=v+n+1,E=v+n+2,S=v+1;a.push(x,b,S),a.push(b,E,S)}}this.setIndex(a),this.setAttribute("position",new Ye(l,3)),this.setAttribute("normal",new Ye(c,3)),this.setAttribute("uv",new Ye(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Cr=class i extends wt{constructor(e=new on([new J(0,.5),new J(-.5,-.5),new J(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new Ye(r,3)),this.setAttribute("normal",new Ye(s,3)),this.setAttribute("uv",new Ye(o,2));function c(u){let h=r.length/3,d=u.extractPoints(t),f=d.shape,g=d.holes;di.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,p=g.length;m<p;m++){let v=g[m];di.isClockWise(v)===!0&&(g[m]=v.reverse())}let _=di.triangulateShape(f,g);for(let m=0,p=g.length;m<p;m++){let v=g[m];f=f.concat(v)}for(let m=0,p=f.length;m<p;m++){let v=f[m];r.push(v.x,v.y,0),s.push(0,0,1),o.push(v.x,v.y)}for(let m=0,p=_.length;m<p;m++){let v=_[m],x=v[0]+h,b=v[1]+h,E=v[2]+h;n.push(x,b,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return c_(t,e)}static fromJSON(e,t){let n=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];n.push(o)}return new i(n,e.curveSegments)}};function c_(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let r=i[t];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e}var An=class i extends wt{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new P,d=new P,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){let v=[],x=p/n,b=0;p===0&&o===0?b=.5/t:p===n&&l===Math.PI&&(b=-.5/t);for(let E=0;E<=t;E++){let S=E/t;h.x=-e*Math.cos(r+S*s)*Math.sin(o+x*a),h.y=e*Math.cos(o+x*a),h.z=e*Math.sin(r+S*s)*Math.sin(o+x*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(S+b,1-x),v.push(c++)}u.push(v)}for(let p=0;p<n;p++)for(let v=0;v<t;v++){let x=u[p][v+1],b=u[p][v],E=u[p+1][v],S=u[p+1][v+1];(p!==0||o>0)&&f.push(x,b,S),(p!==n-1||l<Math.PI)&&f.push(b,E,S)}this.setIndex(f),this.setAttribute("position",new Ye(g,3)),this.setAttribute("normal",new Ye(_,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var yn=class i extends wt{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s},n=Math.floor(n),r=Math.floor(r);let o=[],a=[],l=[],c=[],u=new P,h=new P,d=new P;for(let f=0;f<=n;f++)for(let g=0;g<=r;g++){let _=g/r*s,m=f/n*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(_),h.y=(e+t*Math.cos(m))*Math.sin(_),h.z=t*Math.sin(m),a.push(h.x,h.y,h.z),u.x=e*Math.cos(_),u.y=e*Math.sin(_),d.subVectors(h,u).normalize(),l.push(d.x,d.y,d.z),c.push(g/r),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=r;g++){let _=(r+1)*f+g-1,m=(r+1)*(f-1)+g-1,p=(r+1)*(f-1)+g,v=(r+1)*f+g;o.push(_,m,v),o.push(m,p,v)}this.setIndex(o),this.setAttribute("position",new Ye(a,3)),this.setAttribute("normal",new Ye(l,3)),this.setAttribute("uv",new Ye(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Eo=class i extends wt{constructor(e=new bo(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,n=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new P,l=new P,c=new J,u=new P,h=[],d=[],f=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new Ye(h,3)),this.setAttribute("normal",new Ye(d,3)),this.setAttribute("uv",new Ye(f,2));function _(){for(let x=0;x<t;x++)m(x);m(s===!1?t:0),v(),p()}function m(x){u=e.getPointAt(x/t,u);let b=o.normals[x],E=o.binormals[x];for(let S=0;S<=r;S++){let A=S/r*Math.PI*2,C=Math.sin(A),y=-Math.cos(A);l.x=y*b.x+C*E.x,l.y=y*b.y+C*E.y,l.z=y*b.z+C*E.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,h.push(a.x,a.y,a.z)}}function p(){for(let x=1;x<=t;x++)for(let b=1;b<=r;b++){let E=(r+1)*(x-1)+(b-1),S=(r+1)*x+(b-1),A=(r+1)*x+b,C=(r+1)*(x-1)+b;g.push(E,S,C),g.push(S,A,C)}}function v(){for(let x=0;x<=t;x++)for(let b=0;b<=r;b++)c.x=x/t,c.y=b/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new So[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Rn=class extends $n{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Nl,this.normalScale=new J(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var To=class extends $n{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Xe(16777215),this.specular=new Xe(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Nl,this.normalScale=new J(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Ll,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function Ks(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function u_(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Pr=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},_l=class extends Pr{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Nc,endingEnd:Nc}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case Oc:s=e,a=2*t-n;break;case Fc:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Oc:o=e,l=2*n-t;break;case Fc:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(r-t),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,v=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,x=(-1-f)*m+(1.5+f)*_+.5*g,b=f*m-f*_;for(let E=0;E!==a;++E)s[E]=p*o[u+E]+v*o[c+E]+x*o[l+E]+b*o[h+E];return s}},yl=class extends Pr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(r-t),h=1-u;for(let d=0;d!==a;++d)s[d]=o[c+d]*h+o[l+d]*u;return s}},vl=class extends Pr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Cn=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ks(t,this.TimeBufferType),this.values=Ks(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ks(e.times,Array),values:Ks(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new vl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new yl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new _l(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case $s:t=this.InterpolantFactoryMethodDiscrete;break;case js:t=this.InterpolantFactoryMethodLinear;break;case ca:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return $s;case this.InterpolantFactoryMethodLinear:return js;case this.InterpolantFactoryMethodSmooth:return ca}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&u_(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===ca,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*n,d=h-n,f=h+n;for(let g=0;g!==n;++g){let _=t[h+g];if(_!==t[d+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Cn.prototype.TimeBufferType=Float32Array;Cn.prototype.ValueBufferType=Float32Array;Cn.prototype.DefaultInterpolation=js;var ki=class extends Cn{};ki.prototype.ValueTypeName="bool";ki.prototype.ValueBufferType=Array;ki.prototype.DefaultInterpolation=$s;ki.prototype.InterpolantFactoryMethodLinear=void 0;ki.prototype.InterpolantFactoryMethodSmooth=void 0;var bl=class extends Cn{};bl.prototype.ValueTypeName="color";var Ml=class extends Cn{};Ml.prototype.ValueTypeName="number";var Sl=class extends Pr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)mi.slerpFlat(s,0,o,c-a,o,c,l);return s}},cs=class extends Cn{InterpolantFactoryMethodLinear(e){return new Sl(this.times,this.values,this.getValueSize(),e)}};cs.prototype.ValueTypeName="quaternion";cs.prototype.DefaultInterpolation=js;cs.prototype.InterpolantFactoryMethodSmooth=void 0;var Bi=class extends Cn{};Bi.prototype.ValueTypeName="string";Bi.prototype.ValueBufferType=Array;Bi.prototype.DefaultInterpolation=$s;Bi.prototype.InterpolantFactoryMethodLinear=void 0;Bi.prototype.InterpolantFactoryMethodSmooth=void 0;var wl=class extends Cn{};wl.prototype.ValueTypeName="vector";var El=class{constructor(e,t,n){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null}}},h_=new El,Tl=class{constructor(e){this.manager=e!==void 0?e:h_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Tl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ir=class extends Wt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Xe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},Ao=class extends Ir{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Wt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Xe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},za=new ht,Lu=new P,Du=new P,Ro=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new J(512,512),this.map=null,this.mapPass=null,this.matrix=new ht,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Qr,this._frameExtents=new J(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Lu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Lu),Du.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Du),t.updateMatrixWorld(),za.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(za),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(za)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Uu=new ht,Yr=new P,ka=new P,Al=class extends Ro{constructor(){super(new jt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new J(4,2),this._viewportCount=6,this._viewports=[new xt(2,1,1,1),new xt(0,1,1,1),new xt(3,1,1,1),new xt(1,1,1,1),new xt(3,0,1,1),new xt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Yr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Yr),ka.copy(n.position),ka.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(ka),n.updateMatrixWorld(),r.makeTranslation(-Yr.x,-Yr.y,-Yr.z),Uu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Uu)}},vn=class extends Ir{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new Al}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Rl=class extends Ro{constructor(){super(new jn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Gi=class extends Ir{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Wt.DEFAULT_UP),this.updateMatrix(),this.target=new Wt,this.shadow=new Rl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Co=class extends Ir{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var kl="\\[\\]\\.:\\/",d_=new RegExp("["+kl+"]","g"),Bl="[^"+kl+"]",f_="[^"+kl.replace("\\.","")+"]",p_=/((?:WC+[\/:])*)/.source.replace("WC",Bl),m_=/(WCOD+)?/.source.replace("WCOD",f_),g_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Bl),x_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Bl),__=new RegExp("^"+p_+m_+g_+x_+"$"),y_=["material","materials","bones","map"],Cl=class{constructor(e,t,n){let r=n||gt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},gt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(d_,"")}static parseTrackName(e){let t=__.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);y_.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};gt.Composite=Cl;gt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};gt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};gt.prototype.GetterByBindingType=[gt.prototype._getValue_direct,gt.prototype._getValue_array,gt.prototype._getValue_arrayElement,gt.prototype._getValue_toArray];gt.prototype.SetterByBindingTypeAndVersioning=[[gt.prototype._setValue_direct,gt.prototype._setValue_direct_setNeedsUpdate,gt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[gt.prototype._setValue_array,gt.prototype._setValue_array_setNeedsUpdate,gt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[gt.prototype._setValue_arrayElement,gt.prototype._setValue_arrayElement_setNeedsUpdate,gt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[gt.prototype._setValue_fromArray,gt.prototype._setValue_fromArray_setNeedsUpdate,gt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var wv=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");function lh(i){return Math.round(i/90)*90}function Uo(i){return Math.max(45,Math.min(75,i))}var us=i=>Math.sin(i*Math.PI/180);function ch(i,e,t,n){let r=n?1:1-Math.exp(-t*11),s=!1;for(let o of["yaw","pitch","tx","tz","zoom"]){let a=e[o]-i[o];a!==0&&(i[o]=Math.abs(a)>(o==="yaw"||o==="pitch"?.02:.002)&&!n?i[o]+a*r:e[o],i[o]!==e[o]&&(s=!0))}return s}var ah=(i,e)=>Math.max(-Math.max(0,e),Math.min(Math.max(0,e),i));function No(i,e,t,n){let r=i.yaw*Math.PI/180,s=Math.cos(r),o=Math.sin(r),a=i.tx*s-i.tz*o,l=-i.tx*o-i.tz*s,c=(e*Math.abs(s)+t*Math.abs(o))/2,u=(e*Math.abs(o)+t*Math.abs(s))/2,h=ah(a,c+1-i.zoom*n/2),d=ah(l,u+1-i.zoom/2/us(i.pitch));return{...i,tx:h*s-d*o,tz:-h*o-d*s}}function uh(i,e,t,n){let r=i.yaw*Math.PI/180,s=Math.cos(r),o=-Math.sin(r),a=-Math.sin(r),l=-Math.cos(r),c=e*n,u=t*n/us(i.pitch);return{...i,tx:i.tx-s*c+a*u,tz:i.tz-o*c+l*u}}function hh(i,e){return i+360*Math.round((e-i)/360)}var Gl=5,an=1.25,dh=i=>2*an*Math.cos(i*Math.PI/180);function fh(i,e,t,n,r){let s=r*Math.PI/180,o=Math.abs(Math.cos(s)),a=Math.abs(Math.sin(s)),l=e+2,c=t+2,u=l*o+c*a,h=(l*a+c*o)*us(n);return Math.max(Gl,h+dh(n),u/i)}function ph(i,e,t,n){let r=Math.hypot(e+2,t+2);return{min:Gl,max:Math.max(Gl,r*us(n)+dh(n),r/i)}}var Oo=(i,e)=>Math.max(e.min,Math.min(e.max,i));function Hi(i,e,t){let n=i.yaw*Math.PI/180,r=t/us(i.pitch);return{x:i.tx+Math.cos(n)*e-Math.sin(n)*r,z:i.tz-Math.sin(n)*e-Math.cos(n)*r}}function mh(i,e,t,n,r){let s=Oo(i.zoom*e,r),o=i.zoom-s,a=Hi(i,t*o,n*o);return{...i,zoom:s,tx:a.x,tz:a.z}}function gh(i,e){let t=i.zoom/2,n=t*e;return{corners:[Hi(i,-n,t),Hi(i,n,t),Hi(i,n,-t),Hi(i,-n,-t)],tick:[Hi(i,0,0),Hi(i,0,t*.4)]}}function xh(i,e,t,n){let r=i<520?8:11,s=Math.min(Math.floor(i*.5/t),Math.floor(e*.4/n));return Math.max(2,Math.min(r,s))}function _h(i,e,t,n,r){return[(i.x+e/2)*n,r+(i.z+t/2)*n]}function yh(i,e,t,n,r,s){return{x:i/r-t/2,z:(e-s)/r-n/2}}var vh={items:"plate",beacon:!1,cutaway:!1,caps:!1},bh="crete-variant";function v_(i){let e={...vh};if(!i)return e;let t;try{t=JSON.parse(i)}catch{return e}if(!t||typeof t!="object")return e;let n=t;(n.items==="cyan"||n.items==="white"||n.items==="plate")&&(e.items=n.items);for(let r of["beacon","cutaway","caps"])typeof n[r]=="boolean"&&(e[r]=n[r]);return e}var Mh=vh;function ln(){return Mh}function Sh(i){Mh=v_(i)}var M_=6,S_=.6,w_=.4;function wh(){let i=null,e={down(t,n,r){return i?[]:(i={id:t,x0:n,y0:r,x:n,y:r,dragging:!1},[])},move(t,n,r){if(!i||i.id!==t)return[];if(!i.dragging){if(Math.hypot(n-i.x0,r-i.y0)<M_)return[];i.dragging=!0}let s=n-i.x,o=r-i.y;i.x=n,i.y=r;let a=[];return s!==0&&a.push({kind:"turn",deg:-s*S_}),o!==0&&a.push({kind:"tilt",deg:-o*w_}),a},up(t,n,r){if(!i||i.id!==t)return[];let s=e.move(t,n,r),o=i.dragging;return i=null,o?[...s,{kind:"settle"}]:[{kind:"reset"}]},cancel(t){if(!i||i.id!==t)return[];let n=i.dragging;return i=null,n?[{kind:"settle"}]:[]}};return e}function Eh(i){let e=Uo(i.pitch);return{needle:i.yaw,squash:Math.sin(e*Math.PI/180)/Math.sin(75*Math.PI/180),tilt:(75-e)/30}}function Th(i,e,t){return t>700||Math.hypot(i,e)<24?null:Math.abs(i)>Math.abs(e)?i>0?"right":"left":e>0?"down":"up"}var E_=.35,Ah=.3,hs=10,T_=280,A_=12,R_=320,C_=40,P_=.0015,Rh=10;function Ch(i){let e=new Map,t=null,n=null,r=!1,s=null,o=null,a=!1,l=()=>{let[c,u]=[...e.values()];return!c||!u?{ang:0,d:0,mx:0,my:0}:{ang:Math.atan2(u.y-c.y,u.x-c.x),d:Math.hypot(u.x-c.x,u.y-c.y),mx:(c.x+u.x)/2,my:(c.y+u.y)/2}};return{down(c){e.set(c.id,{x:c.x,y:c.y,sx:c.x,sy:c.y,x0:c.x,y0:c.y,t0:i(),type:c.type,button:c.button});for(let u of e.values())u.sx=u.x,u.sy=u.y;return t=e.size===2?l():null,o=t,s=null,e.size>1&&(r=!0),[]},move(c){let u=e.get(c.id);if(!u)return[];let h=c.x-u.x,d=c.y-u.y;u.x=c.x,u.y=c.y;let f=[];if(e.size===1){if(u.type!=="mouse")return f;u.button===1||u.button===2?(h!==0||d!==0)&&f.push({kind:"pan",dx:h,dy:d}):(h!==0&&f.push({kind:"turn",deg:-h*E_}),d!==0&&f.push({kind:"tilt",deg:-d*Ah}))}else if(e.size===2&&t&&o){let g=l();if(!s){let[x,b]=[...e.values()],E=x.y-x.sy,S=b.y-b.sy,A=x.x-x.sx,C=b.x-b.sx,y=Math.min(Math.hypot(A,E),Math.hypot(C,S)),M=Math.max(Math.hypot(A,E),Math.hypot(C,S));if(!(Math.abs(g.d-o.d)>=hs)&&(M<hs||y<hs/2&&M<2*hs))return f;let z=Math.abs(Math.sin(o.ang))<Math.sin(35*Math.PI/180),Y=Math.sign(E)===Math.sign(S)&&Math.min(Math.abs(E),Math.abs(S))>hs/2&&Math.abs(E-S)<Math.max(Math.abs(E),Math.abs(S))/2,I=Math.abs(A)<Math.abs(E)/2&&Math.abs(C)<Math.abs(S)/2;s=z&&Y&&I?"tilt":"free"}if(s==="tilt"){let x=g.my-t.my;return x!==0&&f.push({kind:"tilt",deg:-x*Ah}),t=g,f.length&&(a=!0),f}let _=g.ang-t.ang;_>Math.PI&&(_-=2*Math.PI),_<-Math.PI&&(_+=2*Math.PI),_!==0&&f.push({kind:"turn",deg:_*180/Math.PI});let m=g.mx-t.mx,p=g.my-t.my;(m!==0||p!==0)&&f.push({kind:"pan",dx:m,dy:p});let v=Math.max(Rh,t.d)/Math.max(Rh,g.d);v!==1&&f.push({kind:"zoom",factor:v,x:g.mx,y:g.my}),t=g}return f.length&&(a=!0),f},up(c){let u=e.get(c.id);if(!u)return[];e.delete(c.id),t=null,o=null;let h=r;if(e.size===0&&(r=!1),e.size===0&&a)return a=!1,[{kind:"settle"}];if(u.type==="mouse"||e.size!==0||h)return[];let d=i(),f=Th(c.x-u.x0,c.y-u.y0,d-u.t0);return f?(n=null,[{kind:"swipe",dir:f}]):d-u.t0>=T_||Math.hypot(c.x-u.x0,c.y-u.y0)>=A_?[]:n&&d-n.t<R_&&Math.hypot(c.x-n.x,c.y-n.y)<C_?(n=null,[{kind:"reset"}]):(n={t:d,x:c.x,y:c.y},[])},cancel(c){return e.delete(c),t=null,o=null,e.size===0&&(r=!1,a)?(a=!1,[{kind:"settle"}]):[]},wheel(c,u,h){return c===0?[]:[{kind:"zoom",factor:Math.exp(c*P_),x:u,y:h}]}}}var Ph=90,Ih=1.2,I_=16,L_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/></svg>',D_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>',U_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',N_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',O_='<span class="tilt-ring" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dial" cx="12" cy="12" r="11"/><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>',F_=600;function Dr(i,e,t,n){let r=document.createElement("button");return r.type="button",r.id=i,r.className=n,r.setAttribute("aria-label",e),r.title=e,r.innerHTML=t,r}function Lh(i,e,t,n){let r=Ch(()=>performance.now()),s=D=>({id:D.pointerId,x:D.clientX,y:D.clientY,type:D.pointerType==="touch"||D.pointerType==="pen"?D.pointerType:"mouse",button:D.button}),o=D=>{if(!(!D.length||t.blocked())){t.gesture();for(let O of D)if(O.kind==="swipe")t.swipe(O.dir);else if(O.kind==="turn")n.turn(O.deg,!1);else if(O.kind==="tilt")n.tilt(O.deg,!1);else if(O.kind==="settle")n.settle();else if(O.kind==="pan")n.pan(O.dx,O.dy);else if(O.kind==="zoom"){let V=i.getBoundingClientRect();n.zoom(O.factor,(O.x-V.left)/(V.width||1)-.5,.5-(O.y-V.top)/(V.height||1),!1)}else n.reset()}},a=D=>{if(!t.blocked()){try{i.setPointerCapture(D.pointerId)}catch{}o(r.down(s(D)))}},l=D=>o(r.move(s(D))),c=D=>o(r.up(s(D))),u=D=>o(r.cancel(D.pointerId)),h=()=>{t.blocked()||(t.gesture(),n.reset())},d=D=>D.preventDefault(),f=D=>{if(t.blocked())return;D.preventDefault();let O=D.deltaMode===1?I_:D.deltaMode===2?i.clientHeight:1;o(r.wheel(D.deltaY*O,D.clientX,D.clientY))};i.style.touchAction="none",i.addEventListener("pointerdown",a),i.addEventListener("pointermove",l),i.addEventListener("pointerup",c),i.addEventListener("pointercancel",u),i.addEventListener("dblclick",h),i.addEventListener("contextmenu",d),i.addEventListener("wheel",f,{passive:!1});let g=document.createElement("button");g.type="button",g.className="modern-viewbtn",g.textContent="View",g.setAttribute("aria-expanded","false"),g.setAttribute("aria-controls","cam-buttons");let _=document.createElement("div");_.id="cam-buttons",_.className="cam",_.setAttribute("role","group"),_.setAttribute("aria-label","Camera");let m=Dr("cam-left","Turn left",L_,"cbtn"),p=Dr("cam-right","Turn right",D_,"cbtn"),v=Dr("cam-zoom-in","Zoom in",U_,"cbtn"),x=Dr("cam-zoom-out","Zoom out",N_,"cbtn"),b=Dr("cam-reset","Reset view","Reset","cbtn wide");_.append(m,p,v,x,b);let E=Dr("cam-compass","Compass: drag to turn and tilt the view, tap to reset it",O_,"compass");E.title="Compass";let S=E.querySelector("svg");e.append(g,_,E);let A=wh(),C=-1e9,y=D=>{if(D.length){t.gesture();for(let O of D)O.kind==="turn"?n.turn(O.deg,!0):O.kind==="tilt"?n.tilt(O.deg,!0):O.kind==="settle"?n.settle():O.kind==="reset"&&n.reset()}},M=D=>{if(!(t.blocked()||D.pointerType==="mouse"&&D.button!==0)){D.preventDefault();try{E.setPointerCapture(D.pointerId)}catch{}y(A.down(D.pointerId,D.clientX,D.clientY))}},U=D=>{t.blocked()||y(A.move(D.pointerId,D.clientX,D.clientY))},z=D=>{let O=A.up(D.pointerId,D.clientX,D.clientY);O.length&&(C=performance.now()),t.blocked()||y(O)},Y=D=>y(A.cancel(D.pointerId));E.style.touchAction="none",E.addEventListener("pointerdown",M),E.addEventListener("pointermove",U),E.addEventListener("pointerup",z),E.addEventListener("pointercancel",Y),E.addEventListener("click",()=>{performance.now()-C<F_||I(()=>n.reset())()});let I=D=>()=>{t.blocked()||(t.gesture(),D())};return m.addEventListener("click",I(()=>n.turn(-Ph,!0))),p.addEventListener("click",I(()=>n.turn(Ph,!0))),v.addEventListener("click",I(()=>n.zoom(1/Ih,0,0,!0))),x.addEventListener("click",I(()=>n.zoom(Ih,0,0,!0))),b.addEventListener("click",I(()=>n.reset())),g.addEventListener("click",()=>{let D=_.classList.toggle("open");g.setAttribute("aria-expanded",String(D))}),{setView(D,O){let V=Eh({yaw:D,pitch:O});S.style.transform=`scale(1, ${V.squash.toFixed(3)}) rotate(${V.needle.toFixed(1)}deg)`,E.style.setProperty("--tilt",V.tilt.toFixed(3)),E.dataset.heading=String(Math.round(D)),E.dataset.pitch=String(Math.round(O))},dispose(){i.removeEventListener("pointerdown",a),i.removeEventListener("pointermove",l),i.removeEventListener("pointerup",c),i.removeEventListener("pointercancel",u),i.removeEventListener("dblclick",h),i.removeEventListener("contextmenu",d),i.removeEventListener("wheel",f),g.remove(),_.remove(),E.remove()}}}function Dh(i,e){let t=[];for(let n=0;n<i.terrain.length;n++)(i.terrain[n]!==e.terrain[n]||i.objects[n]!==e.objects[n])&&t.push(n);return t}function Hl(i,e){let t=[];return i.forEach((n,r)=>{n==="water"&&e[r]==="dirt"&&t.push(r)}),t}function Uh(i,e){if(i<=0)return e;if(i<.25){let t=i/.25;return e+(-.2-e)*t*t}if(i<.25+.35){let t=(i-.25)/.35;return-.2+(.065- -.2)*(1-(1-t)**3)}return .065}function Nh(i,e){return e?0:.012*Math.sin(2*Math.PI*i/3)}var z_=i=>Math.max(0,Math.min(1,i)),k_=.06666666666666667;function Oh(i){return 1-.67*z_(i)}function Fh(i,e,t){let n=e-i;return Math.abs(n)<.005?e:i+n*(1-Math.exp(-t/k_))}function zh(i,e,t){let n=e?[e]:[];return i==="ghosted"?[...n,...t]:n}var Ur=["up","down","left","right"];var Vl={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},st=(i,e,t,n={},r,s=e)=>({char:i,minotaur:e,block:t,hazard:s,...n,sprites:r??[]}),Qn={floor:st(".",!0,!0,{},["floor"]),wall:st("#",!1,!1,{},["wall"]),exit:st("E",!1,!1,{},["exit"]),gate:st("|",!1,!1,{},["gate-closed","gate-open"]),water:st("~",!1,!0,{needs:"flippers"},["water"]),fire:st("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:st("=",!0,!0,{slides:"skates"},["ice"]),"force-up":st("^",!0,!0,{carries:"up"},["force-up"]),"force-down":st("v",!0,!0,{carries:"down"},["force-down"]),"force-left":st("<",!0,!0,{carries:"left"},["force-left"]),"force-right":st(">",!0,!0,{carries:"right"},["force-right"]),dirt:st("%",!0,!0,{},["dirt"]),safe:st("S",!1,!1,{},["safe"]),button:st("_",!0,!0,{},["button"]),"toggle-open":st("t",!0,!1,{},["toggle-open"]),"toggle-closed":st("T",!1,!1,{},["toggle-closed"]),"door-red":st("R",!1,!1,{door:"red"},["door-red"]),"door-blue":st("B",!1,!1,{door:"blue"},["door-blue"]),"door-yellow":st("Y",!1,!1,{door:"yellow"},["door-yellow"]),"door-green":st("G",!1,!1,{door:"green"},["door-green"]),trap:st("&",!0,!0,{},["trap"]),"button-brown":st("-",!0,!0,{},["button-brown"]),"button-red":st("+",!0,!0,{},["button-red"]),popup:st(";",!1,!1,{},["popup"]),gravel:st(":",!1,!1,{},["gravel"]),"fake-wall":st("W",!1,!1,{},["wall"]),"invisible-wall":st("I",!1,!1,{},["floor"]),teleport:st("@",!1,!1,{},["teleport"]),thief:st("$",!0,!0,{},["thief"]),bomb:st("!",!1,!0,{},["bomb"],!0),clone:st("C",!1,!1,{},Ur.map(i=>`clone-${i}`))},Pn={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var In={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:Vl.mirror.name},cake:{char:"x",sprite:"cake",name:Vl.cake.name},cow:{char:"c",sprite:"cow",name:Vl.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},B_=["theseus","minotaur","minotaur-stone","cow-standing"],kv=[...new Set([...Object.values(Qn).flatMap(i=>i.sprites),...Object.values(In).map(i=>i.sprite),...B_,...Object.values(Pn).map(i=>i.sprite)])];var kh={minotaur:16730682,theseus:3593324,hazard:12614911,item:3859711},Bh=657414,G_=14;function Gh(i){return Math.max(1,G_/(ds*Math.max(i,1e-6)))}var ds=.26,Fo=.44,H_=.06,V_=.02,W_=2.4,X_=new Set(Object.values(Pn).map(i=>i.sprite)),q_=new Set(Object.values(In).map(i=>i.sprite).filter(i=>i!==In.block.sprite));function Hh(i,e=ln().items){return i.id?.startsWith("machine")?null:i.model==="theseus"?"theseus":i.model==="minotaur"||i.model==="minotaur-stone"?"minotaur":e==="plate"?null:X_.has(i.model)?"hazard":q_.has(i.model)?"item":null}function Vh(i,e,t=0){let n=e*Math.PI/180;return i*Math.cos(n)+t*Math.sin(n)+H_}function Wh(i,e){return e?0:-V_*(1-Math.cos(2*Math.PI*i/W_))}var Xh=.08;function qh(i,e,t,n,r,s,o){let a=(l,c,u)=>c>u?0:Math.max(c,Math.min(u,l))-l;return[a(i,-r+o+t/2,r-o-t/2),a(e,-s+o,s-o-n)]}function Go(i,e){let t=i[e],n=i[e+1];return!t||!n||n.jump?null:n.r<t.r?"up":n.r>t.r?"down":n.c<t.c?"left":"right"}function $h(i,e,t){let n=i.getContext("2d"),r=e.rise/e.cell,s=16,o=0;return{size(a,l,c){let u=window.devicePixelRatio||1;s=Math.max(1,Math.round(c*u)),o=Math.round(r*s),i.width=a*s,i.height=l*s+o,i.style.width=`${i.width/u}px`,i.style.height=`${i.height/u}px`,i.dataset.cell=String(c),n.setTransform(1,0,0,1,0,0),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality="high"},paint(a,l){n.clearRect(0,0,i.width,i.height);let c=e.cell,u=e.cell+e.rise;for(let h of a){let d=e.sprites[h.sprite];d&&n.drawImage(t,d.x+h.frame*c,d.y,c,u,Math.round(h.x*s),Math.round(h.y*s),s,s+o)}l&&l.length>1&&ty(n,l,s,o)}}}var Z_="#c0392b",K_="#ff5b45",Jh="#1c0402",J_=12,$_=.42,j_=.14,Q_=.2,ey={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function ty(i,e,t,n){let r=c=>[(c.c+.5)*t,(c.r+.5)*t+n],s=Math.max(1.5,t/12),o=Math.max(.75,t/30);if(i.lineJoin="round",i.lineCap="round",i.beginPath(),e.forEach((c,u)=>{let[h,d]=r(c);u===0||c.jump?i.moveTo(h,d):i.lineTo(h,d)}),i.strokeStyle=Jh,i.lineWidth=s+2*o,i.stroke(),i.strokeStyle=Z_,i.lineWidth=s,i.stroke(),t<J_)return;let a=t*$_,l=t*j_;i.lineJoin="miter";for(let c=0;c<e.length;c++){let u=Go(e,c);if(!u)continue;let[h,d]=r(e[c]);i.save(),i.translate(h,d),i.rotate(ey[u]),i.translate(t*Q_,0),i.beginPath(),i.moveTo(a/2,0),i.lineTo(-a/2,-l),i.lineTo(-a/4,0),i.lineTo(-a/2,l),i.closePath(),i.lineWidth=Math.max(1,t/21),i.strokeStyle=Jh,i.stroke(),i.fillStyle=K_,i.fill(),i.restore()}}function ny(i,e,t){let n=i.sprites[e];return!n||n.frames<=1||n.fps<=0?0:Math.floor(t*n.fps/1e3)%n.frames}function jh(i,e,t,n){let r=[],s=(c,u,h)=>r.push({sprite:c,frame:ny(t,c,n),x:u,y:h}),{rows:o,cols:a}=i.level,l=(c,u)=>!!c&&Math.ceil(c.r-1e-9)===u;for(let c=0;c<o;c++){for(let u=0;u<a;u++){let h=i.terrain[c*a+u],d=Qn[h].sprites,f=h==="clone"?i.level.machines.find(g=>g.at.r===c&&g.at.c===u):void 0;s(f?d[Ur.indexOf(f.dir)]:h==="gate"&&i.relicsLeft===0?d[1]:d[0],u,c)}for(let u=0;u<a;u++){let h=i.objects[c*a+u];h==="block"&&e.blocks?.some(d=>d.origin.r===c&&d.origin.c===u)||h&&s(In[h].sprite,u,c)}for(let u of i.level.machines)u.at.r===c&&s(u.template==="block"?In.block.sprite:Pn[u.template].sprite,u.at.c,c);for(let u of e.blocks??[])l(u.at,c)&&s(In.block.sprite,u.at.c,u.at.r);for(let u of e.hazards)l(u.at,c)&&s(Pn[u.kind].sprite,u.at.c,u.at.r);i.cow&&i.cow.r===c&&s("cow-standing",i.cow.c,c),l(e.minotaur,c)&&s(i.stone>0?"minotaur-stone":"minotaur",e.minotaur.c,e.minotaur.r),l(e.player,c)&&s("theseus",e.player.c,e.player.r)}return r}function Qh(i){return!(i instanceof HTMLImageElement)||i.complete&&i.naturalWidth>0}function ed(i,e,t,n){let r=document.createElement("div");r.className="minimap",r.hidden=!0;let s=document.createElement("canvas");s.id="minimap",s.setAttribute("aria-hidden","true");let o=document.createElement("canvas");o.id="minimap-view",o.setAttribute("role","img"),o.setAttribute("aria-label","Mini map: the whole level from above; the outline is what the camera sees. Tap to look there."),r.append(s,o),i.append(r);let a=$h(s,e,t),l=o.getContext("2d"),c=null,u=null,h=0,d=0,f=0,g=0,_=0,m=1,p=0;function v(){if(!c)return;let U=c.s.level.cols,z=c.s.level.rows,Y=xh(h||1280,d||800,U,z);if(U===f&&z===g&&Y===_)return;f=U,g=z,_=Y,a.size(f,g,_);let I=window.devicePixelRatio||1;o.width=s.width,o.height=s.height,o.style.width=s.style.width,o.style.height=s.style.height,m=s.width/I/f,p=s.height/I-g*m}function x(){!c||!Qh(t)||a.paint(jh(c.s,c.f,e,0),c.thread??void 0)}function b(){if(!u||!f)return;let U=window.devicePixelRatio||1;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,o.width,o.height),l.setTransform(U,0,0,U,0,0);let z=gh(u.c,u.aspect),Y=O=>_h(O,f,g,m,p);l.save(),l.beginPath(),l.rect(0,p,f*m,g*m),l.clip(),l.beginPath(),z.corners.map(Y).forEach(([O,V],K)=>K?l.lineTo(O,V):l.moveTo(O,V)),l.closePath(),l.fillStyle="rgba(255,230,180,0.10)",l.fill(),l.lineWidth=1.5,l.strokeStyle="#ffd890",l.stroke();let[I,D]=z.tick.map(Y);l.beginPath(),l.moveTo(I[0],I[1]),l.lineTo(D[0],D[1]),l.stroke(),l.restore()}let E=()=>x();Qh(t)||t.addEventListener("load",E,{once:!0});let S=!1,A=U=>{if(n.blocked()||!f)return;let z=o.getBoundingClientRect();n.look(yh(U.clientX-z.left,U.clientY-z.top,f,g,m,p))},C=U=>{if(!n.blocked()){S=!0;try{o.setPointerCapture(U.pointerId)}catch{}A(U)}},y=U=>{S&&A(U)},M=()=>{S=!1};return o.addEventListener("pointerdown",C),o.addEventListener("pointermove",y),o.addEventListener("pointerup",M),o.addEventListener("pointercancel",M),{show(U){r.hidden=!U},paint(U,z,Y){c={s:U,f:z,thread:Y},v(),x(),b()},view(U,z){u={c:{...U},aspect:z},b()},fit(U,z){h=U,d=z;let Y=_;v(),_!==Y&&(x(),b())},dispose(){t.removeEventListener("load",E),r.remove()}}}var ms={floor:"flag",wall:"none",exit:"none","gate-closed":"flag","gate-open":"flag",water:"water",fire:"ember",ice:"ice","force-up":"force","force-down":"force","force-left":"force","force-right":"force",dirt:"dirt",safe:"flag",button:"flag","toggle-open":"flag","toggle-closed":"flag","door-red":"flag","door-blue":"flag","door-yellow":"flag","door-green":"flag",trap:"flag","button-brown":"flag","button-red":"flag",popup:"flag",gravel:"gravel",teleport:"flag",thief:"flag",bomb:"flag","clone-up":"flag","clone-down":"flag","clone-left":"flag","clone-right":"flag"};function td(i,e){let t=i.terrain[e],n=Qn[t].sprites;if(t==="clone"){let r=Math.floor(e/i.level.cols),s=e%i.level.cols,o=i.level.machines.find(a=>a.at.r===r&&a.at.c===s);return n[Ur.indexOf(o?.dir??"up")]}return t==="gate"&&i.relicsLeft===0?n[1]:n[0]}var nd=["theseus","minotaur","minotaur-stone"];function id(i,e){let t=[],n=i.level.cols;i.objects.forEach((r,s)=>{if(!r)return;let o=Math.floor(s/n),a=s%n;r==="block"&&e.blocks?.some(l=>l.origin.r===o&&l.origin.c===a)||t.push({model:In[r].sprite,r:o,c:a,id:`o${s}`})});for(let r of i.level.machines){let s=r.template==="block"?In.block.sprite:Pn[r.template].sprite;t.push({model:s,r:r.at.r,c:r.at.c,id:`machine${r.at.r*n+r.at.c}`,dir:r.dir})}for(let r of e.blocks??[])t.push({model:"block",r:r.at.r,c:r.at.c,id:null});for(let r of e.hazards){let s=i.hazards.find(o=>o.kind===r.kind&&o.at.r===r.at.r&&o.at.c===r.at.c);t.push({model:Pn[r.kind].sprite,r:r.at.r,c:r.at.c,id:null,dir:s?.dir})}return i.cow&&t.push({model:"cow-standing",r:i.cow.r,c:i.cow.c,id:"cow"}),e.minotaur&&t.push({model:i.stone>0?"minotaur-stone":"minotaur",r:e.minotaur.r,c:e.minotaur.c,id:"minotaur"}),t.push({model:"theseus",r:e.player.r,c:e.player.c,id:"theseus"}),t}function rd(){return{q:3,gaps:[],skip:10,fails:[0,0,0,0]}}function gs(i){i.gaps=[],i.skip=10}function Ho(i,e){let t=0;for(let n=i.length-1;n>=0;n--)if(t+=i[n],t>=e)return(i.length-n)*1e3/t;return null}function sd(i,e){if(e>250)return i.q;if(i.skip>0)return i.skip--,i.q;i.gaps.push(e);let t=0,n=0;for(let s=i.gaps.length-1;s>=0&&t<3e3;s--,n++)t+=i.gaps[s];n<i.gaps.length&&(i.gaps=i.gaps.slice(-n));let r=Ho(i.gaps,2e3);if(r!==null&&r<40&&i.q>0)i.fails[i.q]++,i.q=i.q-1,gs(i);else if(i.q<3&&(i.fails[i.q+1]??0)<2){let s=Ho(i.gaps,3e3);s!==null&&s>55&&(i.q=i.q+1,gs(i))}return i.q}function od(i,e){return i?e:null}var xs=new P;function bn(i,e,t,n,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;xs.copy(e),xs[n]=0,xs.normalize();let c=.5*o/(o+a),u=1-xs.angleTo(i)/l;return Math.sign(xs[t])===1?u*c:a/(o+a)+c+c*(1-u)}var Nn=class extends sn{constructor(e=1,t=1,n=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,n/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new P,l=new P,c=new P(e,t,n).divideScalar(2).subScalar(s),u=this.attributes.position.array,h=this.attributes.normal.array,d=this.attributes.uv.array,f=u.length/6,g=new P,_=.5/r;for(let m=0,p=0;m<u.length;m+=3,p+=2)switch(a.fromArray(u,m),l.copy(a),l.x-=Math.sign(l.x)*_,l.y-=Math.sign(l.y)*_,l.z-=Math.sign(l.z)*_,l.normalize(),u[m+0]=c.x*Math.sign(a.x)+l.x*s,u[m+1]=c.y*Math.sign(a.y)+l.y*s,u[m+2]=c.z*Math.sign(a.z)+l.z*s,h[m+0]=l.x,h[m+1]=l.y,h[m+2]=l.z,Math.floor(m/f)){case 0:g.set(1,0,0),d[p+0]=bn(g,l,"z","y",s,n),d[p+1]=1-bn(g,l,"y","z",s,t);break;case 1:g.set(-1,0,0),d[p+0]=1-bn(g,l,"z","y",s,n),d[p+1]=1-bn(g,l,"y","z",s,t);break;case 2:g.set(0,1,0),d[p+0]=1-bn(g,l,"x","z",s,e),d[p+1]=bn(g,l,"z","x",s,n);break;case 3:g.set(0,-1,0),d[p+0]=1-bn(g,l,"x","z",s,e),d[p+1]=1-bn(g,l,"z","x",s,n);break;case 4:g.set(0,0,1),d[p+0]=1-bn(g,l,"x","y",s,e),d[p+1]=1-bn(g,l,"y","x",s,t);break;case 5:g.set(0,0,-1),d[p+0]=bn(g,l,"x","y",s,e),d[p+1]=1-bn(g,l,"y","x",s,t);break}}};var Vo=class extends Un{constructor(e=null){super();let t=new sn;t.deleteAttribute("uv");let n=new Rn({side:Ct}),r=new Rn,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let o=new vn(16777215,s,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new le(t,n);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let l=new le(t,r);l.position.set(-10.906,2.009,1.846),l.rotation.set(0,-.195,0),l.scale.set(2.328,7.905,4.651),this.add(l);let c=new le(t,r);c.position.set(-5.607,-.754,-.758),c.rotation.set(0,.994,0),c.scale.set(1.97,1.534,3.955),this.add(c);let u=new le(t,r);u.position.set(6.167,.857,7.803),u.rotation.set(0,.561,0),u.scale.set(3.927,6.285,3.687),this.add(u);let h=new le(t,r);h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),this.add(h);let d=new le(t,r);d.position.set(2.291,-.756,-2.621),d.rotation.set(0,-.286,0),d.scale.set(1.546,1.552,1.496),this.add(d);let f=new le(t,r);f.position.set(-2.193,-.369,-5.547),f.rotation.set(0,.516,0),f.scale.set(3.875,3.487,2.986),this.add(f);let g=new le(t,Nr(50));g.position.set(-16.116,14.37,8.208),g.scale.set(.1,2.428,2.739),this.add(g);let _=new le(t,Nr(50));_.position.set(-16.109,18.021,-8.207),_.scale.set(.1,2.425,2.751),this.add(_);let m=new le(t,Nr(17));m.position.set(14.904,12.198,-1.832),m.scale.set(.15,4.265,6.331),this.add(m);let p=new le(t,Nr(43));p.position.set(-.462,8.89,14.52),p.scale.set(4.38,5.441,.088),this.add(p);let v=new le(t,Nr(20));v.position.set(3.235,11.486,-12.541),v.scale.set(2.5,2,.1),this.add(v);let x=new le(t,Nr(100));x.position.set(0,20,0),x.scale.set(1,.1,1),this.add(x)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Nr(i){let e=new dt;return e.color.setScalar(i),e}function Dt(i){return()=>(i=i*1664525+1013904223>>>0,i/4294967296)}function Kt(i,e,t=!0){let n=document.createElement("canvas");n.width=n.height=i,e(n.getContext("2d"),i);let r=new Er(n);return t&&(r.colorSpace=Tt),r.wrapS=r.wrapT=br,r.anisotropy=8,r}function _t(i,e,t,n,r,s,o,a,l=!0){for(let c=0;c<n;c++){let u=t()*e,h=t()*e,d=o+t()*(a-o);i.fillStyle=`rgba(${r},${(s*(.3+.7*t())).toFixed(3)})`;let f=l?[-e,0,e]:[0];for(let g of f)for(let _ of f)l&&(Math.abs(u+g-e/2)>e/2+d||Math.abs(h+_-e/2)>e/2+d)||(i.beginPath(),i.arc(u+g,h+_,d,0,7),i.fill())}}function _s(i,e,t){let n=i.createRadialGradient(e/2,e/2,e*.3,e/2,e/2,e*.72);n.addColorStop(0,"rgba(0,0,0,0)"),n.addColorStop(1,`rgba(20,14,10,${t})`),i.fillStyle=n,i.fillRect(0,0,e,e)}function Wl(i,e,t,n,r,s,o){i.strokeStyle=r,i.lineWidth=s;for(let a=0;a<n;a++){i.beginPath();let l=t()*e,c=t()*e;i.moveTo(l,c);for(let u=0;u<6;u++)l+=(t()-.5)*o,c+=(t()-.5)*o,i.lineTo(l,c);i.stroke()}}var iy=i=>Kt(256,(e,t)=>{let n=Dt(i);e.fillStyle="#dcc699",e.fillRect(0,0,t,t),_t(e,t,n,260,"150,120,80",.06,6,26,!1),_t(e,t,n,220,"242,226,192",.1,5,20,!1),_t(e,t,n,1800,"120,96,66",.1,.6,2,!1),_t(e,t,n,900,"250,238,212",.12,.6,1.6,!1),Wl(e,t,n,2,"rgba(120,94,62,.4)",1.3,60),_s(e,t,.12)}),ry=()=>Kt(256,(i,e)=>{let t=Dt(7);i.fillStyle="#15171a",i.fillRect(0,0,e,e);let n=e/4,r=e/2;for(let s=0;s<4;s++){let o=s%2?r/2:0;for(let a=-1;a<3;a++){let l=a*r+o,c=s*n,u=.75+t()*.35;i.fillStyle=`rgb(${90*u|0},${94*u|0},${100*u|0})`;for(let h of[0,e])i.fillRect(l+3-h,c+3,r-6,n-6)}}_t(i,e,t,1400,"16,18,22",.25,.7,2.2),_t(i,e,t,500,"150,156,166",.14,.7,2),_t(i,e,t,60,"20,22,26",.25,4,12)}),sy=()=>Kt(256,(i,e)=>{let t=Dt(11);i.fillStyle="#7a7e86",i.fillRect(0,0,e,e),_t(i,e,t,200,"26,28,32",.2,6,24),_t(i,e,t,1500,"16,18,20",.25,.6,2),_t(i,e,t,600,"140,146,156",.12,.6,1.8)});function oy(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),n=t.createImageData(128,128),r=[[1,2,.3],[3,-1,1.7],[-2,3,4.1],[4,1,2.2],[-3,-4,5.3],[5,-3,.9]],s=(l,c)=>r.reduce((u,[h,d,f],g)=>u+Math.sin(2*Math.PI*(h*l+d*c)/128+f)/(1+g*.6),0),o=new P;for(let l=0;l<128;l++)for(let c=0;c<128;c++){let u=s(c+1,l)-s(c-1,l),h=s(c,l+1)-s(c,l-1);o.set(-u*1.4,-h*1.4,1).normalize();let d=(l*128+c)*4;n.data[d]=(o.x*.5+.5)*255,n.data[d+1]=(o.y*.5+.5)*255,n.data[d+2]=(o.z*.5+.5)*255,n.data[d+3]=255}t.putImageData(n,0,0);let a=new Er(e);return a.wrapS=a.wrapT=br,a}var ay=()=>Kt(256,(i,e)=>{let t=Dt(21);i.fillStyle="#1c120d",i.fillRect(0,0,e,e),_t(i,e,t,200,"50,30,20",.3,4,18,!1),i.lineCap="round";for(let n=0;n<14;n++){i.strokeStyle=`rgba(${200+t()*55|0},${70+t()*80|0},20,.9)`,i.lineWidth=1+t()*2.5,i.shadowColor="#ff6a10",i.shadowBlur=8,i.beginPath();let r=t()*e,s=t()*e;i.moveTo(r,s);for(let o=0;o<5;o++)r+=(t()-.5)*70,s+=(t()-.5)*70,i.lineTo(r,s);i.stroke()}i.shadowBlur=0,_s(i,e,.7)}),ly=()=>Kt(256,(i,e)=>{let t=Dt(31);for(let n=0;n<5;n++){let r=.85+t()*.25;i.fillStyle=`rgb(${196*r|0},${150*r|0},${98*r|0})`,i.fillRect(n*e/5,0,e/5,e),i.fillStyle="rgba(60,36,18,.6)",i.fillRect(n*e/5,0,2,e)}for(let n=0;n<160;n++){i.strokeStyle=`rgba(90,58,30,${.08+t()*.15})`,i.lineWidth=.6+t();let r=t()*e;i.beginPath(),i.moveTo(r,0),i.bezierCurveTo(r+(t()-.5)*8,e*.3,r+(t()-.5)*8,e*.7,r+(t()-.5)*6,e),i.stroke()}}),cy=()=>Kt(256,(i,e)=>{let t=Dt(51);i.fillStyle="#3a2414",i.fillRect(0,0,e,e),_t(i,e,t,500,"20,12,6",.25,.6,2.4,!1),_t(i,e,t,80,"90,60,34",.15,4,16,!1),i.strokeStyle="#d8a640",i.lineWidth=22,i.lineJoin="miter";for(let n of[78,178])i.beginPath(),i.moveTo(40,n+38),i.lineTo(128,n-34),i.lineTo(216,n+38),i.stroke();i.strokeStyle="rgba(0,0,0,.6)",i.lineWidth=10,i.strokeRect(5,5,e-10,e-10)}),uy=()=>Kt(256,(i,e)=>{let t=Dt(61);i.fillStyle="#b6dcea",i.fillRect(0,0,e,e),_t(i,e,t,120,"230,246,252",.25,6,30,!1),_t(i,e,t,90,"120,170,196",.15,6,24,!1),Wl(i,e,t,6,"rgba(250,254,255,.8)",1.6,90),_s(i,e,.25)}),hy=()=>Kt(256,(i,e)=>{let t=Dt(71);i.fillStyle="#6a4626",i.fillRect(0,0,e,e),_t(i,e,t,260,"40,24,12",.22,4,20,!1),_t(i,e,t,200,"140,98,58",.16,3,14,!1),_t(i,e,t,2200,"30,18,8",.25,.6,2,!1),_t(i,e,t,40,"170,160,150",.7,2,4.5,!1),_s(i,e,.45)}),dy=()=>Kt(256,(i,e)=>{let t=Dt(81);i.fillStyle="#5e5a54",i.fillRect(0,0,e,e),_t(i,e,t,1600,"30,28,26",.3,.8,3,!1),_t(i,e,t,500,"160,154,146",.25,1,4,!1),_s(i,e,.45)}),fy=()=>{let i=Kt(256,(e,t)=>{e.translate(t/2,t/2),e.strokeStyle="rgba(214,200,160,.55)",e.lineWidth=3,e.beginPath();for(let n=0;n<6;n++){let r=n/6*Math.PI*2+.3;e.lineTo(Math.cos(r)*112,Math.sin(r)*112)}e.closePath(),e.stroke();for(let n=0;n<28;n++){let r=n/28*Math.PI*2;e.save(),e.rotate(r),e.translate(76,0),e.rotate(n%2?.6:-.6),e.fillStyle=n%2?"#4f7a3a":"#3d6a30",e.beginPath(),e.ellipse(0,0,14,6,0,0,7),e.fill(),e.restore()}});return i.wrapS=i.wrapT=kt,i},py=()=>{let i=Kt(256,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,"#f2fbff"),n.addColorStop(.35,"#6fc0ef"),n.addColorStop(1,"#1a4f9a"),e.fillStyle=n,e.fillRect(0,0,t,t),e.translate(t/2,t/2),e.lineCap="round";for(let r=0;r<3;r++){e.strokeStyle="rgba(255,255,255,.85)",e.lineWidth=9,e.beginPath();for(let s=0;s<=60;s++){let o=s/60,a=r*(Math.PI*2/3)+o*4.2,l=8+o*110;e.lineTo(Math.cos(a)*l,Math.sin(a)*l)}e.stroke()}});return i.wrapS=i.wrapT=kt,i},my=()=>{let i=Kt(256,(e,t)=>{e.fillStyle="#3a1f52",e.fillRect(0,0,t,t),_t(e,t,Dt(91),300,"20,10,30",.3,1,4,!1),e.fillStyle="#e0a838",e.translate(t/2,t/2+18),e.beginPath(),e.roundRect(-46,-30,92,92,30),e.fill();for(let[n,r,s]of[[-34,70,18],[-12,92,19],[12,96,19],[35,78,18]])e.beginPath(),e.roundRect(n-s/2,-30-r,s,r+20,s/2),e.fill();e.save(),e.translate(-50,14),e.rotate(-.8),e.beginPath(),e.roundRect(-11,-58,22,66,11),e.fill(),e.restore()});return i.wrapS=i.wrapT=kt,i},gy=()=>Kt(256,(i,e)=>{let t=Dt(41);i.fillStyle="#ad9f86",i.fillRect(0,0,e,e),_t(i,e,t,300,"60,52,44",.15,4,20,!1),_t(i,e,t,1500,"50,44,38",.2,.6,2,!1),Wl(i,e,t,4,"rgba(60,50,40,.45)",2,40);let n=(r,s,o)=>{i.save(),i.translate(e/2+r,e/2+s),i.fillStyle=o,i.fillRect(-7,-80,14,160);for(let a of[-1,1])i.beginPath(),i.moveTo(0,-38),i.quadraticCurveTo(a*60,-70,a*78,-50),i.quadraticCurveTo(a*58,0,a*78,50),i.quadraticCurveTo(a*60,70,0,38),i.fill();i.restore()};n(3,3,"rgba(225,210,185,.35)"),n(0,0,"rgba(40,32,26,.4)"),i.strokeStyle="rgba(40,32,26,.6)",i.lineWidth=6,i.strokeRect(10,10,e-20,e-20)}),xy=()=>{let i=Kt(64,(e,t)=>{let n=e.createLinearGradient(0,0,0,t);n.addColorStop(0,"rgba(0,0,0,0.85)"),n.addColorStop(.18,"rgba(0,0,0,0.6)"),n.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=n,e.fillRect(0,0,t,t)});return i.wrapS=i.wrapT=kt,i},_y=()=>{let i=Kt(64,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,"rgba(255,220,160,1)"),n.addColorStop(.35,"rgba(255,150,60,.45)"),n.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=n,e.fillRect(0,0,t,t)});return i.wrapS=i.wrapT=kt,i},Re=(i,e={})=>new Rn({color:i,roughness:.8,metalness:0,...e}),ei=(i,e=.9)=>new dt({color:i,transparent:!0,opacity:e,blending:Ui,depthWrite:!1}),yy=.022;function vy(){let i=new dt({color:656900,side:Ct});return i.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${yy.toFixed(3)};`)},i}function ad(i){let e=new wr(i),t=new Vo(i),n=e.fromScene(t,.04).texture;t.dispose(),e.dispose();let r=(c,u=.35,h={})=>Re(c,{roughness:u,metalness:.85,envMap:n,envMapIntensity:.55,...h}),s={brick:ry(),cap:sy(),water:oy(),ember:ay(),wood:ly(),force:cy(),ice:uy(),dirt:hy(),gravel:dy(),wreath:fy(),swirl:py(),hand:my(),halo:_y(),ao:xy(),block:gy(),flags:[101,202,303].map(iy)},o={under:Re(789e3,{roughness:1}),mortar:Re(ln().caps?1972242:7232580,{roughness:1}),ao:new dt({map:s.ao,transparent:!0,depthWrite:!1}),edge:Re(789776,{roughness:1,side:fn}),flags:s.flags.map(c=>Re(16777215,{map:c,roughness:.88})),ember:Re(16777215,{map:s.ember,emissiveMap:s.ember,emissive:16742960,emissiveIntensity:.9,roughness:.9}),ice:Re(10274004,{map:s.ice,roughness:.08,metalness:.1,envMap:n,envMapIntensity:.35}),force:Re(16777215,{map:s.force,roughness:.7}),dirt:Re(16777215,{map:s.dirt,roughness:.97}),gravelBed:Re(16777215,{map:s.gravel,roughness:.95}),pebble:Re(9076850,{roughness:.9}),water:Re(1722962,{roughness:.14,metalness:.1,normalMap:s.water,normalScale:new J(.55,.55),emissive:399388,envMap:n,envMapIntensity:.25}),basin:Re(925216,{roughness:.9}),side:Re(11843776,{map:s.brick,roughness:.93}),top:Re(ln().caps?15921128:10791602,{map:s.cap,roughness:.95}),wood:Re(16777215,{map:s.wood,roughness:.75}),darkWood:Re(9071178,{map:s.wood,roughness:.8}),iron:r(3025446,.6),bronze:r(12618308,.4,{emissive:2758664}),gold:r(15250496,.3,{emissive:5912064}),stone:Re(9075818),paleStone:Re(13285530,{roughness:.85}),dark:Re(657415),glow:new dt({color:16751168}),keyColor:{red:Re(14692382,{roughness:.45,emissive:5901316}),blue:Re(3108576,{roughness:.45,emissive:794202}),yellow:Re(15910968,{roughness:.45,emissive:5915648}),green:Re(3127388,{roughness:.45,emissive:805406})},brownButton:Re(6962718,{roughness:.55}),redButton:Re(11545116,{roughness:.45,emissive:2753538}),cream:Re(15260864,{roughness:.6}),wreath:new Rn({map:s.wreath,transparent:!0,roughness:.8,depthWrite:!1}),swirl:new Rn({map:s.swirl,emissiveMap:s.swirl,emissive:new Xe(6994175),emissiveIntensity:.9,roughness:.3}),hand:Re(16777215,{map:s.hand,roughness:.6}),clay:Re(11564104,{roughness:.75}),block:Re(16777215,{map:s.block,roughness:.85}),skin:Re(12618338,{roughness:.7}),tunic:Re(2383482,{roughness:.8}),cloak:Re(9054750),leather:Re(5913122,{roughness:.8}),steel:r(13225424,.3),heroSkin:Re(15118472,{roughness:.6,emissive:3020298}),heroTunic:Re(3117008,{roughness:.55,emissive:666180}),heroCloak:Re(14170660,{roughness:.65,emissive:4328452}),heroLeather:Re(9067058,{roughness:.7,emissive:1707012}),heroHair:Re(5911576,{roughness:.8,emissive:1312770}),heroRing:new dt({color:1284676,depthWrite:!1}),heroRingEdge:new dt({color:398346,transparent:!0,opacity:.8,depthWrite:!1}),itemShade:new dt({color:656900,transparent:!0,opacity:.9,depthWrite:!1}),itemRing:new dt({color:16773304,depthWrite:!1}),heroBeam:new dt({color:3593324,transparent:!0,opacity:.3,blending:Ui,depthTest:!1,depthWrite:!1,side:fn}),heroXray:new dt({color:6090890,transparent:!0,opacity:.6,depthFunc:Il,depthWrite:!1,stencilWrite:!0,stencilRef:1,stencilFunc:qu}),outline:vy(),fur:Re(5912096,{roughness:.9,emissive:1181700}),furDark:Re(3941396,{roughness:.9}),snout:Re(6965814),ivory:Re(14866106,{roughness:.5}),kilt:Re(11545116,{emissive:2754050}),hoof:Re(1314832),eye:new dt({color:16730650}),statue:Re(9342088,{roughness:.9}),statueDark:Re(6973540,{roughness:.92}),parchment:Re(15785648,{emissive:3024920}),teal:Re(3193004,{roughness:.4,emissive:670262}),boot:Re(12596762,{roughness:.55,emissive:3804164}),bootTrim:Re(14715424,{emissive:5906944}),skate:Re(13162728,{roughness:.45,emissive:2634300}),suction:Re(3445854,{roughness:.5,emissive:798234}),mirror:r(15132390,.08,{envMapIntensity:1,emissive:4211784}),gorgon:Re(3450970,{roughness:.5,emissive:798744}),cake:Re(15773768,{roughness:.55,emissive:4203528}),hide:Re(16051938,{roughness:.65,emissive:2894374}),patch:Re(5911072,{roughness:.8}),feather:Re(9067058,{roughness:.8,emissive:1970184}),halo:s.halo,env:n},a=new Set([n,...s.flags,...Object.values(s).filter(c=>c instanceof Er)]);for(let c of Object.values(o))c&&typeof c=="object"&&"isMaterial"in c?a.add(c):Array.isArray(c)&&c.forEach(u=>a.add(u));for(let c of Object.values(o.keyColor))a.add(c);return{t:s,m:o,metal:r,std:Re,keeps:a,dispose:()=>{for(let c of a)c.dispose()}}}var ae=.1,_i=.035,At=(i,e)=>i-(e-1)/2,Pt=(i,e)=>i-(e-1)/2,by={"force-up":0,"force-left":Math.PI/2,"force-down":Math.PI,"force-right":-Math.PI/2},ld=26;function cd(i){let{m:e}=i,t=new Ee,n=new Nn(.97,.12,.97,2,.02);n.translate(0,ae-.06,0);let r=new en(1,1);r.rotateX(-Math.PI/2),r.translate(0,_i,0);let s=new Rr(.045,0),o=new le(new en(1,1),e.under);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,t.add(o);let a=new en(1,1);a.rotateX(-Math.PI/2);let l=[],c=(h,d,f)=>{let g=new xo(h,d,Math.max(1,f));return g.count=f,g.receiveShadow=!0,l.push(g),t.add(g),g},u=()=>{for(let h of l)t.remove(h),h.dispose();l=[]};return{group:t,set(h,d,f){u();let g=new on([new J(-100,-100),new J(100,-100),new J(100,100),new J(-100,100)]);g.holes.push(new Tr([new J(-f/2,-d/2),new J(-f/2,d/2),new J(f/2,d/2),new J(f/2,-d/2)])),o.geometry.dispose(),o.geometry=new Cr(g);let _=[[],[],[]],m={ember:[],ice:[],force:[],dirt:[],gravel:[],water:[],mortar:[]};h.forEach((S,A)=>{let C=ms[S];S!=="exit"&&m.mortar.push(A),C==="flag"?_[Dt(A*2654435761+7)()*3|0].push(A):C!=="none"&&m[C].push(A)});let p=new ht,v=new Xe,x=(S,A,C,y)=>{A.forEach((M,U)=>{let z=Dt(M*40503+11);if(p.makeRotationY(C(M,z)).setPosition(At(M%f,f),0,Pt(Math.floor(M/f),d)),S.setMatrixAt(U,p),y){let Y=.78+z()*.3;S.setColorAt(U,v.setRGB(Y*(1+(z()-.5)*.06),Y,Y*(1-z()*.06)))}})},b=(S,A)=>(A()*4|0)*(Math.PI/2);x(c(a,e.mortar,m.mortar.length),m.mortar,()=>0,!1),_.forEach((S,A)=>x(c(n,e.flags[A],S.length),S,b,!0)),x(c(n,e.ember,m.ember.length),m.ember,b,!1),x(c(n,e.ice,m.ice.length),m.ice,b,!1),x(c(n,e.dirt,m.dirt.length),m.dirt,b,!0),x(c(n,e.gravelBed,m.gravel.length),m.gravel,b,!0),x(c(n,e.force,m.force.length),m.force,S=>by[h[S]]??0,!1),x(c(r,e.water,m.water.length),m.water,()=>0,!1);let E=m.gravel;if(E.length){let S=c(s,e.pebble,E.length*ld);S.castShadow=!0;let A=0;for(let C of E){let y=Dt(C*7919+3);for(let M=0;M<ld;M++){let U=.7+y()*.5;p.makeScale(U,.6*U,U).setPosition(At(C%f,f)+(y()-.5)*.8,ae+.015,Pt(Math.floor(C/f),d)+(y()-.5)*.8),S.setMatrixAt(A,p),S.setColorAt(A++,v.setScalar(.75+y()*.5))}}}},loop(h){i.t.water.offset.set(Math.sin(h*.5)*.04,h*.025%1),e.water.emissiveIntensity=1+.15*Math.sin(h*1.3)},dispose(){u(),n.dispose(),r.dispose(),s.dispose(),a.dispose(),o.geometry.dispose()}}}function Wo(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),r=new Set(Object.keys(i[0].morphAttributes)),s={},o={},a=i[0].morphTargetsRelative,l=new wt,c=0;for(let u=0;u<i.length;++u){let h=i[u],d=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in h.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;s[f]===void 0&&(s[f]=[]),s[f].push(h.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in h.morphAttributes){if(!r.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(h.morphAttributes[f])}if(e){let f;if(t)f=h.index.count;else if(h.attributes.position!==void 0)f=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,u),c+=f}}if(t){let u=0,h=[];for(let d=0;d<i.length;++d){let f=i[d].index;for(let g=0;g<f.count;++g)h.push(f.getX(g)+u);u+=i[d].attributes.position.count}l.setIndex(h)}for(let u in s){let h=ud(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let f=[];for(let _=0;_<o[u].length;++_)f.push(o[u][_][d]);let g=ud(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}return l}function ud(i){let e,t,n,r=-1,s=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.array.length}let o=new e(s),a=0;for(let c=0;c<i.length;++c)o.set(i[c].array,a),a+=i[c].array.length;let l=new Vt(o,t,n);return r!==void 0&&(l.gpuType=r),l}var Or=.38,My=.16,Xl=.26,Sy=.05,wy={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};function Ey(i){let[e,,t]=Mn[i].n,n=1.002,r=.5,s=.5-Sy,o=e!==0?[[e*s,n,-.5*e],[e*s,n,.5*e],[e*r,n,.5*e],[e*r,n,-.5*e]]:[[.5*t,n,t*s],[-.5*t,n,t*s],[-.5*t,n,t*r],[.5*t,n,t*r]];return(e<0||t<0)&&o.reverse(),{v:o,n:[0,1,0],uvs:[[0,0],[1,0],[1,1],[0,1]],mat:2}}var Mn={n:{d:[-1,0],v:[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]],n:[0,0,-1],u:i=>-i[0]},s:{d:[1,0],v:[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]],n:[0,0,1],u:i=>i[0]},w:{d:[0,-1],v:[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]],n:[-1,0,0],u:i=>i[2]},e:{d:[0,1],v:[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]],n:[1,0,0],u:i=>-i[2]}},Ty=Object.keys(Mn);function hd(i){let e=[],t=[],n=[],r=[],s=new wt,o=0;for(let{v:a,n:l,uvs:c,mat:u}of i){let h=e.length/3;a.forEach((d,f)=>{e.push(...d),t.push(...l),n.push(...c[f])}),r.push(h,h+1,h+2,h,h+2,h+3),s.addGroup(o,6,u),o+=6}return s.setAttribute("position",new Ye(e,3)),s.setAttribute("normal",new Ye(t,3)),s.setAttribute("uv",new Ye(n,2)),s.setIndex(r),s}var dd=(i,e,t)=>({v:Mn[i].v,n:Mn[i].n,mat:0,uvs:Mn[i].v.map(n=>[Mn[i].u([n[0]+e,0,n[2]+t]),n[1]*an])}),ql=[];for(let i of[.15,.5,.85])for(let e of[.15,.5,.85])for(let t of[.15,.5,.85])ql.push([i,e,t]);function Ay(i,e,t,n){let r=-1e9,s=1e9;for(let o=0;o<3;o++){if(Math.abs(e[o])<1e-9){if(i[o]<t[o]||i[o]>n[o])return-1;continue}let a=(t[o]-i[o])/e[o],l=(n[o]-i[o])/e[o];if(a>l&&([a,l]=[l,a]),a>r&&(r=a),l<s&&(s=l),r>s)return-1}return r}function fd(i){let e=new Ee,t=[],n=new en(1,Xl);n.rotateX(-Math.PI/2);let r=[],s=new Map,o=0,a="solid",l=new P,c=h=>{let d=h.op<.999;for(let f of h.mats)f.transparent!==d&&(f.transparent=d,f.needsUpdate=!0),f.opacity=h.op},u=()=>{for(let h of t){e.remove(h.mesh),h.mesh.geometry.dispose();for(let d of h.inner)d.mesh.geometry.dispose();for(let d of h.mats)d.dispose()}t=[],s.clear();for(let h of r)e.remove(h);r=[]};return{group:e,list:()=>t,at:(h,d)=>s.get(h*o+d),build(h,d,f){u(),o=f;let g=(m,p)=>m<0||p<0||m>=d||p>=o||h[m*o+p]==="wall",_=a==="low"?Or:an;for(let m=0;m<d;m++)for(let p=0;p<o;p++){if(h[m*o+p]!=="wall")continue;let v=At(p,o),x=Pt(m,d),b=[{v:[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]],n:[0,1,0],mat:1,uvs:[[v-.5,-x-.5],[v+.5,-x-.5],[v+.5,-x+.5],[v-.5,-x+.5]]}],E=[];for(let M of Ty){let[U,z]=Mn[M].d,Y=m+U,I=p+z;if(g(Y,I)&&Y>=0&&I>=0&&Y<d&&I<o?E.push(M):b.push(dd(M,v,x)),g(Y,I))continue;b.push(Ey(M));let[D,,O]=Mn[M].n,V=new le(n,i.m.ao);V.position.set(v+D*(.5+Xl/2),ae+.003,x+O*(.5+Xl/2)),V.rotation.y=wy[M],V.renderOrder=1,e.add(V),r.push(V)}let S=[i.m.side.clone(),i.m.top.clone(),i.m.edge.clone()],A=m===0||p===0||m===d-1||p===o-1;if(!A){A=!0;for(let M=-1;M<=1;M++)for(let U=-1;U<=1;U++)g(m+M,p+U)||(A=!1)}A&&S[1].color.multiplyScalar(My);let C=new le(hd(b),S);C.position.set(v,0,x),C.scale.y=_,C.castShadow=C.receiveShadow=!0,e.add(C);let y={r:m,c:p,x:v,z:x,mesh:C,mats:S,op:1,target:1,inner:[]};for(let M of E){let U=new le(hd([dd(M,v,x)]),[S[0]]);U.visible=!1,C.add(U),y.inner.push({k:M,mesh:U,nb:null})}t.push(y),s.set(m*o+p,y)}for(let m of t)for(let p of m.inner){let[v,x]=Mn[p.k].d;p.nb=s.get((m.r+v)*o+m.c+x)??null}},setMode(h){a=h;let d=h==="low"?Or:an;for(let f of t)f.mesh.scale.y=d},aim(h,d){let f=new Map,g=a==="low"?Or:an;h.getWorldDirection(l);let _=[l.x,l.y,l.z],m=30;for(let p of d){let v=t.filter(b=>Math.abs(b.x-p.x)<3.2&&Math.abs(b.z-p.z)<3.2);if(v.length===0)continue;let x=new Map;for(let[b,E,S]of ql){let A=[p.x-p.half+2*p.half*b,ae+p.h*E,p.z-p.half+2*p.half*S],C=[A[0]-_[0]*m,A[1]-_[1]*m,A[2]-_[2]*m];for(let y of v){let M=Ay(C,_,[y.x-.49,0,y.z-.49],[y.x+.49,g,y.z+.49]);M>=0&&M<m-.01&&x.set(y,(x.get(y)??0)+1)}}for(let[b,E]of x)f.set(b,Math.max(f.get(b)??0,E/ql.length))}for(let p of t){let v=Math.min(1,Math.max(0,((f.get(p)??0)-.03)/.45));p.target=Oh(v*v*(3-2*v))}},ease(h,d){let f=!1;for(let g of t)g.op!==g.target&&(g.op=d?g.target:Fh(g.op,g.target,h),f=!0,c(g));if(f)for(let g of t)for(let _ of g.inner)_.mesh.visible=!!_.nb&&_.nb.op<.999&&g.op>_.nb.op+.02;return f},dispose(){u(),n.dispose()}}}var W=(i,e,t,n)=>(i.position.set(e,t,n),i),Ry=(i,e,t,n=14)=>new _n(i,e,t,n),Ve=(i,e,t,n,r=14)=>new le(Ry(i,e,t,r),n),He=(i,e,t,n)=>new le(new sn(i,e,t),n),Vi=i=>(i.rotation.x=Math.PI/2,i);function Cy(i){i.updateMatrixWorld(!0);let e=new Map;i.traverse(n=>{if(!(n instanceof le))return;let r=n.geometry.clone().applyMatrix4(n.matrixWorld);r.index&&(r=r.toNonIndexed());for(let o of Object.keys(r.attributes))o!=="position"&&o!=="normal"&&o!=="uv"&&r.deleteAttribute(o);let s=n.material;e.set(s,[...e.get(s)??[],r]),n.geometry.dispose()});let t=new Ee;for(let[n,r]of e){let s=new le(Wo(r),n);r.forEach(o=>o.dispose()),s.castShadow=s.receiveShadow=!0,t.add(s)}return t}function Yo(i,e){let t=[];for(let n of e.children)n instanceof le&&!n.userData.live&&t.push(new le(n.geometry,i.m.outline));return e.add(...t),e}function Ut(i,e,t=[]){let n=Cy(i);return t.length&&n.add(...t),n.userData=e,n}var On=()=>Object.assign(new Ee,{userData:{half:0,h:0}}),xd=i=>(i.wall(i.r-1,i.c)||i.wall(i.r+1,i.c))&&!(i.wall(i.r,i.c-1)&&i.wall(i.r,i.c+1));function Xo(i,e){let{m:t}=i.kit,n=t.keyColor[e],r=new Ee,s=1.1,o=.26;return r.add(W(He(1,s,o,t.wood),0,s/2,0)),r.add(W(He(1,.06,o+.02,t.iron),0,.34,0)),r.add(W(He(1,.16,o+.02,n),0,.8,0)),r.add(W(He(1,.1,o+.02,n),0,.06,0)),r.add(W(He(1,.04,o+.02,n),0,s+.02,0)),r.add(W(He(.16,.18,o+.04,t.iron),.24,.55,0)),r.add(Vi(W(Ve(.05,.05,o+.08,n,12),.24,.55,0))),xd(i)&&(r.rotation.y=Math.PI/2),Ut(r,{half:.4,h:s,tall:!0})}function pd(i,e){let{m:t}=i.kit,n=new Ee;for(let r=0;r<6;r++)e?n.add(W(Ve(.025,.012,.12,t.bronze,8),-.42+r*.168,1,0)):n.add(W(Ve(.025,.025,1.05,t.bronze,8),-.42+r*.168,.55,0));if(!e)for(let r of[.3,.8])n.add(W(He(1,.05,.05,t.bronze),0,r,0));for(let r of[-1,1])n.add(W(He(.08,1.06,.12,t.darkWood),r*.47,.53,0));return n.add(W(He(1,.16,.3,t.darkWood),0,1.1,0)),n.add(W(He(1,.04,.32,t.bronze),0,1.2,0)),xd(i)&&(n.rotation.y=Math.PI/2),Ut(n,{half:.4,h:e?.3:1.05,tall:!0})}function Py(i){let{m:e}=i.kit,t=new Ee;for(let a=0;a<3;a++)t.add(W(He(.25,.08,.9,e.stone),-.375+a*.25,ae-.04-a*.12,0));for(let a of[-1,1])t.add(W(He(1,.7,.05,e.stone),0,ae-.35,a*.475));t.add(W(He(.05,.7,.9,e.stone),.475,ae-.35,0));let n=W(new le(new en(.25,.9),e.glow),.375,-.32,0);n.rotation.x=-Math.PI/2,t.add(n),t.add(W(He(.3,.16,1.1,e.top),0,an-.08,0));for(let a of[-1,1])t.add(W(He(.16,an-.16,.12,e.darkWood),0,(an-.16)/2,a*.5));let r=[[0,-1],[-1,0],[1,0],[0,1]].find(([a,l])=>!i.wall(i.r+a,i.c+l)),[s,o]=r??[0,-1];return t.rotation.y=Math.atan2(s,-o),Ut(t,{half:.4,h:.3,tall:!0})}function md(i,e){let{m:t}=i.kit,n=new Ee;if(e){n.add(W(He(.8,.72-.04,.8,t.dark),0,ae+.72/2,0));for(let s of[ae+.04,ae+.72-.04])n.add(W(He(.92,.08,.92,t.darkWood),0,s,0));for(let s of[-1,1])for(let o of[-1,1])n.add(W(He(.1,.72,.1,t.darkWood),s*.41,ae+.72/2,o*.41));for(let s=0;s<4;s++){let o=-.27+s*.18;for(let a of[-1,1])n.add(W(He(.07,.72-.12,.05,t.wood),o,ae+.72/2,a*.43)),n.add(W(He(.05,.72-.12,.07,t.wood),a*.43,ae+.72/2,o));n.add(W(He(.07,.04,.8,t.wood),o,ae+.72-.01,0))}return Ut(n,{half:.46,h:.72+.1})}n.add(W(He(.84,.02,.84,t.dark),0,ae+.005,0));for(let r of[-1,1])n.add(W(He(.88,.04,.07,t.darkWood),0,ae+.02,r*.42)),n.add(W(He(.07,.04,.88,t.darkWood),r*.42,ae+.02,0));for(let r=0;r<4;r++)n.add(W(He(.08,.035,.8,t.wood),-.27+r*.18,ae+.018,0));return Ut(n,{half:.42,h:.06})}function _d(i,e,t=.3){let n=new Ee;return n.add(W(Ve(t,t+.03,.05,i,28),0,ae+.025,0)),n.add(W(Ve(t-.05,t-.04,.03,e,28),0,ae+.06,0)),n}function Iy(i){let{m:e}=i.kit,t=new Ee;t.add(W(Ve(.28,.31,.05,e.iron,24),0,ae+.025,0));let n=W(new le(new An(.21,20,10,0,Math.PI*2,0,Math.PI/2),e.brownButton),0,ae+.04,0);return n.scale.y=.55,t.add(n),Ut(t,{half:.3,h:.16})}function gd(i,e){let{m:t}=i.kit,n=_d(t.bronze,e);return n.add(Vi(W(new le(new yn(.15,.018,8,32),t.cream),0,ae+.077,0))),n.add(W(Ve(.05,.055,.04,t.bronze,16),0,ae+.08,0)),Ut(n,{half:.3,h:.12})}function Ly(i){let{m:e}=i.kit,t=_d(e.bronze,e.dark,.34);for(let n=0;n<12;n++){let r=n/12*Math.PI*2;t.add(W(new le(new Xt(.028,.12,6),e.iron),Math.cos(r)*.22,ae+.13,Math.sin(r)*.22))}return t.add(W(Ve(.1,.11,.04,e.bronze,16),0,ae+.09,0)),Ut(t,{half:.34,h:.2})}function Dy(i){let{m:e}=i.kit,t=new Ee;t.add(W(Ve(.07,.08,.03,e.gold,18),0,ae+.015,0));let n=Ut(t,{half:.4,h:.05}),r=new le(new en(.9,.9),e.wreath);return r.rotation.x=-Math.PI/2,r.position.y=ae+.003,r.receiveShadow=!0,n.add(r),n}function Uy(i){let{m:e}=i.kit,t=new Ee;t.add(W(He(.78,.04,.78,e.paleStone),0,ae+.02,0));for(let n of[-1,1])t.add(W(He(.9,.09,.07,e.darkWood),0,ae+.045,n*.42)),t.add(W(He(.07,.09,.9,e.darkWood),n*.42,ae+.045,0));return Ut(t,{half:.45,h:.1})}function Ny(i){let{m:e}=i.kit,t=new Ee;t.add(W(Ve(.36,.38,.06,e.bronze,32),0,ae+.03,0));let n=Ut(t,{half:.36,h:.1}),r=W(Ve(.3,.3,.02,e.swirl,32),0,ae+.065,0);return r.receiveShadow=!0,n.add(r),n.userData.loop=s=>{r.rotation.y=-s*1.6},n}function Oy(i){let{m:e}=i.kit,t=new Ee;t.add(W(Ve(.36,.38,.06,e.gold,32),0,ae+.03,0));let n=W(Ve(.3,.3,.02,e.hand,32),0,ae+.065,0);return n.rotation.y=Math.PI,t.add(n),Ut(t,{half:.36,h:.1})}function Fy(i){let{m:e}=i.kit,t=new Ee,n=[[0,0],[.12,0],[.2,.08],[.22,.2],[.18,.32],[.08,.4],[.07,.46],[.09,.48],[0,.48]].map(([a,l])=>new J(a,l));t.add(W(new le(new Ar(n,24),e.clay),0,ae,0)),t.add(Vi(W(new le(new yn(.205,.012,6,28),e.dark),0,ae+.22,0)));let r=W(Ve(.012,.012,.12,e.dark,6),.02,ae+.53,0);r.rotation.z=-.3,t.add(r);let s=W(new le(new Xt(.035,.1,8),ei(16760928)),.04,ae+.62,0),o=Ut(t,{half:.22,h:.6},[s]);return o.userData.loop=a=>s.scale.set(1,1+.2*Math.sin(a*9),1),o}function qo(i,e){let{m:t}=i.kit,n=new Ee;n.add(W(new le(new Nn(.86,.36,.86,2,.03),t.darkWood),0,ae+.18,0)),n.add(W(He(.64,.02,.64,t.dark),0,ae+.365,0));for(let a of[-1,1])for(let l of[-1,1])n.add(W(Ve(.03,.03,.02,t.gold,10),a*.37,ae+.365,l*.37));let r=new on;r.moveTo(0,.24),r.lineTo(.17,.04),r.lineTo(.07,.04),r.lineTo(.07,-.22),r.lineTo(-.07,-.22),r.lineTo(-.07,.04),r.lineTo(-.17,.04),r.closePath();let s=new le(new zi(r,{depth:.025,bevelEnabled:!1}),t.gold);s.rotation.x=-Math.PI/2,s.position.y=ae+.37;let o=new Ee;return o.add(s),o.rotation.y=e,n.add(o),Ut(n,{half:.43,h:.4})}function zy(i){let e=new Ee,t=Dt(i.r*31+i.c),n=[];for(let s=0;s<5;s++){let o=.3+t()*.28,a=W(new le(new Xt(.08+t()*.05,o,7),ei(s%2?16738848:16756816,.8)),(t()-.5)*.55,ae+o/2,(t()-.5)*.55);n.push(a),e.add(a)}let r=t()*6.28;return e.userData={half:.4,h:.5,loop:s=>n.forEach((o,a)=>o.scale.set(1,1+.12*Math.sin(s*(6+a)+r+a),1))},e}var yd={floor:On,wall:On,water:On,ice:On,dirt:On,gravel:On,"force-up":On,"force-down":On,"force-left":On,"force-right":On,exit:Py,fire:zy,"gate-closed":i=>pd(i,!1),"gate-open":i=>pd(i,!0),safe:Dy,button:Iy,trap:Ly,popup:Uy,teleport:Ny,thief:Oy,bomb:Fy,"toggle-open":i=>md(i,!1),"toggle-closed":i=>md(i,!0),"door-red":i=>Xo(i,"red"),"door-blue":i=>Xo(i,"blue"),"door-yellow":i=>Xo(i,"yellow"),"door-green":i=>Xo(i,"green"),"button-brown":i=>gd(i,i.kit.m.brownButton),"button-red":i=>gd(i,i.kit.m.redButton),"clone-up":i=>qo(i,0),"clone-left":i=>qo(i,Math.PI/2),"clone-down":i=>qo(i,Math.PI),"clone-right":i=>qo(i,-Math.PI/2)};function Wi(i,e){i.traverse(t=>{if(!(t instanceof le))return;t.geometry.dispose();let n=Array.isArray(t.material)?t.material:[t.material];for(let r of n)e.keeps.has(r)||r.dispose()})}var Jt=(i,e,t=16,n=12)=>new le(new An(i,t,n),e);function Md(i,e,t){let n=new on;n.moveTo(i[0][0],i[0][1]);for(let[s,o]of i.slice(1))n.lineTo(s,o);n.closePath();let r=new zi(n,{depth:e,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-e/2),new le(r,t)}function ys(i,e,t,n,r=0,s=[]){let o=t.h*n;e.position.y-=ae;let a=new Ee;a.position.set(0,ae,o/2*Math.sin(r)),a.rotation.x=-r,a.scale.setScalar(n),a.add(e);let l=new Ee;return l.add(a),Yo(i,Ut(l,{...t,half:Math.max(t.half*n,o/2*Math.sin(r)),h:o*Math.cos(r),back:o*Math.sin(r)/2},s))}var Yl=.45,ky=.035;function Sd(i,e){return i.rotation.x=-Math.PI/2,i.position.y=ae+e,i.userData.live=!0,i}var Ko=(i,e=.42)=>Sd(new le(new wo(e,32),i.m.itemShade),.006);function Fn(i,e,t,n,r=0){let s=ln().items==="plate",o=[Ko(i,s?Yl:.42)];return s&&o.push(Sd(new le(new gi(Yl-ky,Yl,48),i.m.itemRing),.008)),ys(i,e,t,s?n*1.12:n,r,o)}function By(i){let{m:e}=i,t=new Ee;t.add(W(Ve(.11,.13,.04,e.bronze,18),0,ae+.02,0)),t.add(W(Ve(.02,.022,.66,e.darkWood,8),0,ae+.35,0)),t.add(W(Jt(.03,e.gold,10,8),0,ae+.7,0));for(let n of[-1,1]){let r=Md([[.02,.05],[.12,.08],[.21,.17],[.16,0],[.21,-.17],[.12,-.08],[.02,-.05]].map(([s,o])=>[n*s,o]),.03,e.gold);t.add(W(r,0,ae+.5,0))}return t.add(W(Ve(.035,.035,.12,e.gold,10),0,ae+.5,0)),Fn(i,t,{half:.22,h:.72},1.2,.85)}function Zo(i,e){let{m:t}=i,n=new Ee;n.add(W(new le(new yn(.075,.03,10,20),t.keyColor[e]),0,.2,0)),n.add(Vi(W(Ve(.05,.05,.034,t.keyColor[e],16),0,.2,0))),n.add(W(He(.035,.24,.03,t.bronze),0,0,0)),n.add(W(He(.07,.03,.03,t.bronze),.035,-.08,0)),n.add(W(He(.05,.03,.03,t.bronze),.025,-.03,0)),n.position.y=ae+.2,n.rotation.z=.25;let r=new Ee;return r.add(n),Fn(i,r,{half:.12,h:.42},2.05,1.1)}function Gy(i){let{m:e}=i,t=new Ee,n=new on;n.moveTo(0,0),n.bezierCurveTo(.08,.02,.1,.2,.07,.32),n.lineTo(-.07,.32),n.bezierCurveTo(-.1,.2,-.08,.02,0,0);let r=new zi(n,{depth:.025,bevelEnabled:!1});for(let s of[-1,1]){let o=new le(r,e.teal);o.rotation.x=-Math.PI/2+.35,o.rotation.z=s*.2,o.position.set(s*.1,ae+.03,.14),t.add(o),t.add(W(He(.1,.07,.1,e.teal),s*.1,ae+.06,.14))}return Fn(i,t,{half:.24,h:.2},1.8)}function Zl(i,e,t,n){let r=new Ee;for(let s of[-1,1]){let o=new Ee,a=n?.(o)??0;o.add(W(He(.09,.2,.09,e),0,a+.12,0)),o.add(W(He(.09,.06,.17,e),0,a+.03,.04)),o.add(W(He(.1,.045,.1,t),0,a+.225,0)),o.position.set(s*.09,ae,0),o.rotation.y=s*.2,r.add(o)}return r}function Hy(i){let{m:e}=i,t=Zl(i,e.boot,e.bootTrim,n=>(n.add(W(new le(new Xt(.025,.07,6),e.gold),0,.11,.05)),0));return Fn(i,t,{half:.2,h:.28},1.9,.7)}function Vy(i){let{m:e}=i,t=Zl(i,e.skate,e.cream,n=>{n.add(W(He(.02,.05,.24,e.steel),0,.025,.04));for(let r of[-.04,.12])n.add(W(He(.03,.03,.03,e.steel),0,.05,r));return .05});return Fn(i,t,{half:.2,h:.32},1.8,.7)}function Wy(i){let{m:e}=i,t=Zl(i,e.suction,e.bootTrim,n=>(n.add(W(Ve(.1,.07,.035,e.bronze,18),0,.018,.03)),.035));return Fn(i,t,{half:.22,h:.3},1.8,.7)}function Xy(i){let{m:e}=i,t=new Ee,n=new Ee;n.position.set(0,ae+.32,0),n.rotation.x=-.25,n.add(Vi(Ve(.13,.13,.02,e.mirror,28))),n.add(new le(new yn(.13,.02,8,28),e.bronze));let r=W(Jt(.045,e.gorgon,12,10),0,0,.012);r.scale.z=.5,n.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;n.add(W(Jt(.014,e.gorgon,6,5),Math.cos(o)*.08,Math.sin(o)*.08,.012))}return t.add(n),t.add(W(Ve(.018,.025,.2,e.bronze,8),0,ae+.1,0)),t.add(W(Ve(.08,.09,.025,e.bronze),0,ae+.012,0)),Fn(i,t,{half:.18,h:.48},1.55,.9)}function qy(i){let{m:e}=i,t=new Ee;t.add(W(Ve(.24,.22,.03,e.bronze,24),0,ae+.015,0)),t.add(W(Ve(.17,.19,.16,e.cake,24),0,ae+.11,0)),t.add(W(Ve(.165,.17,.02,e.cream,24),0,ae+.2,0));for(let n=0;n<8;n++){let r=n/8*Math.PI*2;t.add(W(Jt(.022,e.cream,8,6),Math.cos(r)*.12,ae+.215,Math.sin(r)*.12))}return t.add(W(Jt(.035,e.cake,10,8),0,ae+.22,0)),Fn(i,t,{half:.24,h:.26},1.4,.35)}function vd(i,e,t=0,n=!1){let{m:r}=i,s=new Ee;s.add(W(He(.56,.05,.3,r.wood),0,.1,0));for(let l of[-1,1])for(let c of[-1,1])s.add(Vi(W(Ve(.07,.07,.03,r.darkWood,14),l*.2,.07,c*.165))),s.add(W(Ve(.028,.025,.14,r.hide,8),l*.16,.18,c*.08));s.add(W(new le(new Nn(.46,.22,.24,2,.05),r.hide),0,.34,0));for(let[l,c,u,h]of[[-.1,0,.3,1],[.1,.05,.3,1],[-.04,.12,1,.3],[.12,-.12,1,.3],[-.14,-.12,1,.3]]){let d=W(Jt(.075,r.patch,10,8),l,h===1?.44:.35,c);d.scale.set(1,u,h),s.add(d)}s.add(W(new le(new Nn(.14,.15,.15,2,.03),r.hide),.29,.43,0)),s.add(W(He(.06,.08,.12,r.snout),.37,.4,0));for(let l of[-1,1]){let c=W(new le(new Xt(.02,.08,6),r.ivory),.28,.53,l*.06);c.rotation.x=l*.5,s.add(c)}let o=W(Ve(.012,.012,.16,r.patch,6),-.25,.36,0);o.rotation.z=-.4,s.add(o),s.position.y=ae,s.rotation.y=.5;let a=new Ee;return a.add(s),(n?Fn:ys)(i,a,{half:.32,h:.56},e,t)}function Yy(i){let{m:e}=i,t=new Ee;t.add(W(He(.26,.008,.14,e.parchment),.02,ae+.006,.08));let n=W(Ve(.06,.06,.34,e.parchment,14),0,ae+.06,-.02);n.rotation.z=Math.PI/2,t.add(n);for(let s of[-1,1]){let o=W(Ve(.035,.035,.012,e.darkWood,10),s*.172,ae+.06,-.02);o.rotation.z=Math.PI/2,t.add(o)}let r=W(Ve(.064,.064,.05,e.cloak,14),-.08,ae+.06,-.02);return r.rotation.z=Math.PI/2,t.add(r),t.rotation.y=.3,Fn(i,t,{half:.2,h:.14},1.9,.5)}function Zy(i){let e=new Ee;return e.add(W(new le(new Nn(.84,.8,.84,3,.05),i.m.block),0,ae+.4,0)),Ut(e,{half:.42,h:.9})}function Ky(i){let{m:e}=i,t=new Ee,n=ae+.22;t.add(W(Jt(.22,e.bronze,24,16),0,n,0));let r=W(new le(new yn(.222,.012,6,32),e.gold),0,n,0);r.rotation.y=Math.PI/2,t.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;t.add(W(Jt(.022,e.gold,6,5),Math.cos(o)*.222,n,Math.sin(o)*.222)),s%2===0&&t.add(W(Jt(.02,e.gold,6,5),0,n+Math.cos(o+.3)*.224,Math.sin(o+.3)*.224))}return ys(i,t,{half:.24,h:.46},1.45,0,[Ko(i)])}function Jy(i){let{m:e}=i,t=new Ee,n=ae+.4,r=W(Jt(.12,e.feather,16,12),0,n,-.02);r.scale.set(.9,1.15,.85),t.add(r),t.add(W(Jt(.075,e.skin,14,10),0,n+.17,.03));let s=W(Jt(.082,e.furDark,14,8),0,n+.19,.01);s.scale.set(1,.8,1),t.add(s);for(let a of[-1,1]){t.add(W(Jt(.012,e.dark,6,5),a*.028,n+.18,.1));let l=Md([[.06,.08],[.24,.16],[.4,.14],[.38,.06],[.33,.08],[.33,-.01],[.26,.02],[.24,-.08],[.17,-.03],[.12,-.1],[.06,-.04]].map(([c,u])=>[a*c,u]),.025,e.feather);l.position.set(0,n+.04,-.04),l.rotation.x=-.9,t.add(l),t.add(W(Ve(.014,.012,.16,e.bootTrim,6),a*.04,n-.18,.02))}let o=W(new le(new Xt(.06,.16,6),e.feather),0,n-.1,-.12);return o.rotation.x=-2.4,t.add(o),ys(i,t,{half:.36,h:.66},1.05,0,[Ko(i)])}var bd=1.35;function $y(i){let e=new Ee;e.add(W(Jt(.13,i.m.bootTrim,12,8),0,ae+.14,0));let t=[],n=W(Jt(.16,ei(13647888,.5),16,12),0,ae+.17,0);t.push(n);for(let o=0;o<7;o++){let a=o/7*Math.PI*2,l=.24+o%3*.06,c=W(new le(new Xt(.08,l,7),ei(o%2?13122060:14182424,.7)),Math.cos(a)*.12,ae+l/2+.04,Math.sin(a)*.12);c.rotation.z=-Math.cos(a)*.3,c.rotation.x=Math.sin(a)*.3,t.push(c)}let r=new Ee;for(let o of t)o.position.y-=ae;r.add(...t),r.position.y=ae,r.scale.setScalar(bd),r.userData.live=!0;let s=ys(i,e,{half:.26,h:.5},bd,0,[r,Ko(i)]);return s.userData.loop=o=>t.forEach((a,l)=>a.scale.set(1,1+.15*Math.sin(o*(7+l)+l*1.7),1)),s}var Jo={relic:By,"key-red":i=>Zo(i,"red"),"key-blue":i=>Zo(i,"blue"),"key-yellow":i=>Zo(i,"yellow"),"key-green":i=>Zo(i,"green"),flippers:Gy,"fire-boots":Hy,skates:Vy,suction:Wy,mirror:Xy,cake:qy,cow:i=>vd(i,1.1,.35,!0),"cow-standing":i=>vd(i,1.1),page:Yy,block:Zy,ball:Ky,glider:Jy,fireball:$y};var Xi=(i,e,t=16,n=12)=>new le(new An(i,t,n),e);function Td(i,e,t,n=1.3,r=[]){e.scale.setScalar(n),e.position.y=ae;let s=new Ee;return s.add(e),Yo(i,Ut(s,t,r))}function jy(i,e,t){let n=[];for(let s of e.children){if(!(s instanceof le)||s.userData.live||s.material===i.m.outline)continue;let o=s.material;o.stencilWrite=!0,o.stencilRef=1,o.stencilZPass=Xu;let a=new le(s.geometry,i.m.heroXray);a.renderOrder=20,a.userData.live=!0,n.push(a)}let r=new le(new _n(.16,.24,2.2,24,1,!0),i.m.heroBeam);r.position.y=ae+t+.25+1.1,r.renderOrder=21,r.userData.live=!0,e.add(...n,r)}var Kl=1.45;function Qy(i){let{m:e}=i,t=new Ee;for(let u of[-1,1])t.add(W(Ve(.045,.04,.28,e.heroSkin),u*.065,.14,0)),t.add(W(He(.07,.05,.12,e.heroLeather),u*.065,.025,.02));t.add(W(Ve(.13,.2,.22,e.heroTunic),0,.35,0)),t.add(W(Ve(.155,.13,.22,e.heroTunic),0,.55,0)),t.add(W(Ve(.16,.16,.035,e.heroLeather),0,.45,0));let n=W(He(.3,.44,.03,e.heroCloak),0,.44,-.14);n.rotation.x=.12,t.add(n);for(let u of[-1,1]){let h=W(Ve(.04,.035,.26,e.heroSkin),u*.19,.5,.02);h.rotation.z=u*.18,t.add(h)}t.add(W(Xi(.095,e.heroSkin),0,.75,0)),t.add(W(new le(new An(.103,18,10,0,Math.PI*2,0,Math.PI/2),e.heroHair),0,.765,-.012));let r=W(Ve(.15,.15,.03,e.bronze,24),-.26,.5,.04);r.rotation.z=Math.PI/2,t.add(r);let s=W(Ve(.06,.06,.035,e.heroCloak,16),-.275,.5,.04);s.rotation.z=Math.PI/2,t.add(s);let o=W(He(.03,.34,.012,e.steel),.23,.5,.1);o.rotation.x=.5,t.add(o),t.add(W(He(.09,.02,.03,e.bronze),.23,.37,.03));let a=(u,h,d,f)=>{let g=new le(new gi(u,h,48),d);return g.rotation.x=-Math.PI/2,g.position.y=ae+f,g.userData.live=!0,g},l=[a(.33,.47,e.heroRingEdge,.01),a(.36,.44,e.heroRing,.012)],c=Td(i,t,{half:.26*Kl/1.3,h:1.2*Kl/1.3},Kl,l);return ln().beacon&&jy(i,c,c.userData.h),c}function wd(i,e){let{m:t}=i,n=d=>e?t.statue:d,r=n(t.fur),s=e?t.statueDark:t.furDark,o=new Ee;for(let d of[-1,1])o.add(W(Ve(.07,.06,.3,r),d*.1,.17,0)),o.add(W(Ve(.065,.07,.05,n(t.hoof)),d*.1,.025,0));o.add(W(Ve(.2,.26,.2,n(t.kilt)),0,.38,0));let a=W(new le(new yn(.2,.02,8,24),n(t.gold)),0,.47,0);a.rotation.x=Math.PI/2,o.add(a);let l=W(Xi(.26,r),0,.66,0);l.scale.set(1.05,1,.75),o.add(l);for(let d of[-1,1]){o.add(W(Xi(.11,r),d*.26,.78,0));let f=W(Ve(.07,.055,.36,r),d*.31,.57,.03);f.rotation.z=d*.2,o.add(f)}let c=W(Xi(.13,s),0,.95,.06);c.scale.set(1,.95,1.15),o.add(c);let u=W(Xi(.085,n(t.snout)),0,.9,.19);u.scale.set(1.1,.8,.9),o.add(u),o.add(W(new le(new yn(.035,.008,6,16),n(t.gold)),0,.85,.26));for(let d of[-1,1]){o.add(W(Xi(.018,e?t.statueDark:t.eye,8,6),d*.065,.99,.17));let f=new ss([new P(d*.1,1,.04),new P(d*.24,1.03,.02),new P(d*.33,1.12,.07),new P(d*.33,1.22,.13)]);o.add(new le(new Eo(f,16,.028,8),n(t.ivory))),o.add(W(new le(new Xt(.028,.07,8),n(t.ivory)),d*.33,1.25,.14));let g=W(Xi(.04,s),d*.14,.97,.02);g.scale.set(1.3,.6,.8),o.add(g)}let h=new Ee;h.add(Ve(.018,.018,.85,n(t.iron),8));for(let d of[-1,1]){let f=new le(new _n(.17,.17,.02,24,1,!1,0,Math.PI),n(t.steel));f.rotation.z=Math.PI/2,f.rotation.y=d>0?0:Math.PI,f.position.set(0,.3,0),f.scale.set(1,1,.8),h.add(f)}return h.rotation.y=Math.PI/2,h.position.set(.4,.62,.08),o.add(h),Td(i,o,{half:.36,h:1.6})}var ev={theseus:Qy,minotaur:i=>wd(i,!1),"minotaur-stone":i=>wd(i,!0)},tv={...Jo,...ev},nv=new Set([...nd,"ball","glider","fireball"]),iv={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2},rv=1.5,sv=.05,Ed={y:.37,scale:.7},ov=i=>Math.atan2(Math.sin(i),Math.cos(i));function Ad(i,e){let t=new Ee,n=[],r=(f,g,_)=>{let m=Hh(f),p=_.userData;return m?e.make(m,g,p.h,p.back??0):null};function s(f){f.foot.set(f.obj.position.x,ae+f.y,f.obj.position.z)}function o(f){let g=tv[f.model](i);return f.id?.startsWith("machine")&&g.scale.setScalar(Ed.scale),t.add(g),g}function a(f,g){let _=f.id?.startsWith("machine")?Ed.y:0,m=o(f),p=new P;return{model:f.model,id:f.id,obj:m,marker:r(f,p,m),foot:p,r:f.r,c:f.c,yaw:g,goal:g,y:_}}function l(f){t.remove(f.obj),Wi(f.obj,i),f.marker&&e.group.remove(f.marker)}function c(f,g){l(f),f.model=g.model,f.obj=o(g),f.marker=r(g,f.foot,f.obj)}function u(f,g,_,m){let p=!1,v=new Set(n),x=new Map,b=new Map(n.filter(C=>C.id).map(C=>[C.id,C]));for(let C of f){let y=C.id?b.get(C.id):void 0;y&&(v.delete(y),x.set(C,y))}let E=[];for(let C of f)if(!x.has(C))for(let y of v){let M=Math.hypot(y.r-C.r,y.c-C.c);y.model===C.model&&M<=rv&&E.push([M,C,y])}E.sort((C,y)=>C[0]-y[0]);for(let[,C,y]of E)x.has(C)||!v.has(y)||(v.delete(y),y.id=C.id,x.set(C,y));for(let C of v)l(C),p=!0;let S=f.find(C=>C.model==="theseus"),A=[];for(let C of f){let y=x.get(C);if(!y){let z=C.dir?iv[C.dir]:C.id==="minotaur"&&S?Math.atan2(S.c-C.c,S.r-C.r):0;y=a(C,z),p=!0}y.model!==C.model&&(c(y,C),p=!0);let M=C.r-y.r,U=C.c-y.c;Math.abs(M)+Math.abs(U)>1e-6&&(nv.has(y.model)&&(y.goal=Math.atan2(U,M)),p=!0),y.r=C.r,y.c=C.c,m&&(y.yaw=y.goal),y.obj.position.set(At(y.c,g),y.y,Pt(y.r,_)),y.obj.rotation.y=y.yaw,s(y),A.push(y)}return n=A,p}function h(f,g){let _=!1;for(let m of n){let p=ov(m.goal-m.yaw);if(Math.abs(p)<.001){m.yaw=m.goal,m.obj.rotation.y=m.yaw;continue}m.yaw=g?m.goal:m.yaw+p*(1-Math.exp(-f/sv)),m.obj.rotation.y=m.yaw,_=!0}return _}function d(){for(let f of n)l(f);n=[]}return{group:t,set:u,ease:h,seen(){let f=_=>{let m=_.obj.userData;return{x:_.obj.position.x,z:_.obj.position.z,half:m.half,h:m.h}},g=n.find(_=>_.model==="theseus");return{hero:g?f(g):null,rest:n.filter(_=>_!==g).map(f)}},hero:()=>n.find(f=>f.model==="theseus")?.obj??null,loop(f){for(let g of n)g.obj.userData.loop?.(f)},looping:()=>n.flatMap(f=>f.marker||f.obj.userData.loop?[f.obj]:[]),clear:d,dispose:d}}var Ld=.8,Cd=ae+Ld-_i,Pd=9,cv=9,Id=13823214;function Dd(i){let e=new Ee,t=new Rr(.05,0),n=new gi(.82,1,40);n.rotateX(-Math.PI/2);let r=new Map,s=0,o=(u,h)=>{u.block.position.y=_i+h-(ae+Ld)};function a(u){let h=u.splash;if(h){for(let d of[h.ring,...h.drops])e.remove(d),d.material.dispose();u.splash=null}}function l(u,h,d){let f=Dt(u*2246822519+5),g=new le(n,new dt({color:Id,transparent:!0,depthWrite:!1}));g.position.set(h,_i+.004,d),g.scale.setScalar(.35),e.add(g);let _=[],m=[];for(let p=0;p<Pd;p++){let v=(p+f()*.6)/Pd*Math.PI*2,x=.55+f()*.45;m.push([Math.cos(v)*x,Math.sin(v)*x,1.6+f()*.8]);let b=new le(t,new dt({color:Id,transparent:!0,depthWrite:!1}));b.position.set(h,_i,d),e.add(b),_.push(b)}return{t0:null,ring:g,drops:_,flight:m}}function c(u){let h=r.get(u);h&&(a(h),e.remove(h.block),Wi(h.block,i),r.delete(u))}return{group:e,set(u,h,d,f){let g=!1,_=new Set(u);for(let m of[...r.keys()])_.has(m)||(c(m),g=!0);for(let m of u){if(r.has(m))continue;let p=At(m%h,h),v=Pt(Math.floor(m/h),d),x=Jo.block(i);x.position.set(p,0,v),e.add(x);let b={block:x,x:p,z:v,splash:f?l(m,p,v):null};o(b,f?Cd:.065+s),r.set(m,b),g=!0}return g},splashing:()=>[...r].filter(([,u])=>u.splash).map(([u])=>u),frame(u){let h=!1;for(let d of r.values()){let f=d.splash;if(!f)continue;f.t0??=u;let g=(u-f.t0)/1e3;if(g>=Math.max(.4,.25+.35)){a(d),o(d,.065+s);continue}h=!0,o(d,Uh(g,Cd));let _=Math.min(1,g/.4);f.ring.scale.setScalar(.35+.35*(1-(1-_)**2)),f.ring.material.opacity=.75*(1-_),f.drops.forEach((m,p)=>{let[v,x,b]=f.flight[p],E=_i+b*g-cv/2*g*g;m.visible=_<1&&E>=_i,m.position.set(d.x+v*g,E,d.z+x*g),m.material.opacity=.9*(1-_*_)})}return h},loop(u,h){s=Nh(u,h);for(let d of r.values())d.splash||o(d,.065+s)},cells:()=>[...r.keys()].sort((u,h)=>u-h),clear(){for(let u of[...r.keys()])c(u)},dispose(){this.clear(),t.dispose(),n.dispose()}}}var uv=Math.PI/6;function Ud(){let i=new Un,e=new Ee,t=ds/2,n=Fo,r=new Ar([new J(0,0),new J(t,n*.6),new J(0,n)],6),s=new Map,o=ln().items==="white";for(let[d,f]of Object.entries(kh)){let g=o&&d==="item"?16777215:f;s.set(d,new To({color:g,emissive:g,emissiveIntensity:.45,specular:16777215,shininess:80,flatShading:!0,transparent:!0,opacity:.9,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1}))}let a=new dt({color:Bh,side:Ct,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1});a.onBeforeCompile=d=>{d.vertexShader=d.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${o?"0.04":"0.022"};`)};let l=new Gi(16777215,2.2);i.add(new Co(16777215,.7),l,e);let c=new P,u=new P,h=new P;return{scene:i,group:e,make(d,f,g,_=0){let m=new le(r,s.get(d));m.userData={kind:d,foot:f,h:g,back:_},m.renderOrder=10;let p=new le(r,a);return p.renderOrder=9,m.add(p),e.add(m),m},place(d,f,g,_,m){let p=Gh(m);c.setFromMatrixColumn(d.matrixWorld,0),u.setFromMatrixColumn(d.matrixWorld,1),h.setFromMatrixColumn(d.matrixWorld,2),l.position.copy(h).multiplyScalar(3).addScaledVector(u,2).addScaledVector(c,-1.5);let v=Wh(g,_);for(let x of e.children){let b=x.userData;x.position.copy(b.foot).addScaledVector(u,Vh(b.h,f,b.back)+v),x.quaternion.copy(d.quaternion),x.rotateY(uv),x.scale.setScalar(p)}return p},dispose(){e.clear(),r.dispose();for(let d of s.values())d.dispose();a.dispose()}}}var hv={"door-red":$o,"door-blue":$o,"door-yellow":$o,"door-green":$o,"gate-closed":Nd,"gate-open":Nd,exit:(i,e)=>ti(new vn(16751168,4,4,1.6),i,.4,e)};function $o(i,e){return ti(new vn(16756848,1.6,2.6,1.8),i,.9,e+.6)}function Nd(i,e){return ti(new vn(16760944,1.2,2.5,1.8),i,1,e)}function ti(i,e,t,n){return i.position.set(e,t,n),i}var Od=i=>i.startsWith("door")?"door":i.startsWith("gate")?"gate":i;function Fd(i,e,t,n,r){let{m:s}=i,o=new Ee,a=[];o.add(new Ao(10131616,2761760,2.4));let l=Math.hypot(n,t)/2+1.5,c=new Gi(11581648,1.6);c.position.set(-6,14,8),c.castShadow=!0,c.shadow.mapSize.set(2048,2048),Object.assign(c.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:1,far:40+l}),c.shadow.camera.updateProjectionMatrix(),c.shadow.bias=-8e-4,o.add(c,c.target);let u=new vn(16758904,5.5,5.5,1.6);u.castShadow=!0,u.shadow.mapSize.set(512,512),u.shadow.bias=-.004,o.add(u);let h=[],d=[],f=Math.min(8,Math.max(3,Math.round(t*n/37))),g=["s","e","w","n"],_=[];for(let E of r)for(let S of g){let[A,C]=Mn[S].d,y=E.r+A,M=E.c+C;y<0||M<0||y>=t||M>=n||e[y*n+M]!=="floor"||_.push({w:E,k:S,r:y,c:M,pri:g.indexOf(S)})}_.sort((E,S)=>E.pri-S.pri||E.r-S.r||E.c-S.c);let m=[];for(let E of _){if(m.length>=f)break;m.some(S=>Math.max(Math.abs(S.r-E.r),Math.abs(S.c-E.c))<4)||m.push(E)}let p=new ns({map:s.halo,blending:Ui,depthWrite:!1,transparent:!0,opacity:.55});a.push(p),m.forEach(({w:E,k:S},A)=>{let[C,,y]=Mn[S].n,M=new Ee;M.position.set(E.x+C*.5,0,E.z+y*.5),M.add(ti(new le(new sn(.08,.2,.08),s.iron),C*.04,.82,y*.04)),M.add(ti(new le(new _n(.05,.03,.12,8),s.iron),C*.1,.92,y*.1));let U=ti(new le(new Xt(.055,.2,8),ei(16747056)),C*.1,1.07,y*.1),z=ti(new le(new Xt(.03,.12,8),ei(16769184)),C*.1,1.04,y*.1);a.push(U.material,z.material);let Y=new go(p);Y.scale.setScalar(.7),Y.position.set(C*.12,1.05,y*.12),M.add(U,z,Y);for(let D of M.children)D instanceof le&&D.material===s.iron&&(D.castShadow=!0);o.add(M);let I=ti(new vn(16754788,4,6,1.7),M.position.x+C*.45,1.05,M.position.z+y*.45);o.add(I),d.push({g:M,flames:[U,z],halo:Y,light:I,base:4,ph:A*2.39}),h.push(new P(M.position.x,1,M.position.z))});let v=[],x=[];e.forEach((E,S)=>{if(E!=="fire")return;let A=Math.floor(S/n),C=S%n,y=x.at(-1);y&&y.r===A&&y.c1===C-1?y.c1=C:x.push({r:A,c0:C,c1:C}),h.push(new P(At(C,n),ae+.2,Pt(A,t)))});for(let E of x){let S=E.c1-E.c0+1,A=ti(new vn(16742960,3+S*1.2,3+S*.8,1.6),(At(E.c0,n)+At(E.c1,n))/2,.8,Pt(E.r,t));o.add(A),v.push({light:A,base:A.intensity,ph:E.r})}e.forEach((E,S)=>{(E==="water"||E==="teleport")&&h.push(new P(At(S%n,n),ae,Pt(Math.floor(S/n),t)))});let b=new Map;return e.forEach((E,S)=>{let A=hv[E];if(!A)return;let C=A(At(S%n,n),Pt(Math.floor(S/n),t));o.add(C),b.set(S,{light:C,base:C.intensity,kind:Od(E)})}),{group:o,anchors:h,hero(E,S){u.position.set(E,1.5,S+.1)},setMode(E){for(let S of d)S.g.visible=E!=="low",S.light.position.y=E==="low"?.7:1.05},piece(E,S){let A=b.get(E);A&&(A.light.intensity=Od(S)===A.kind?A.base:0)},shadows(E){c.castShadow=E,u.castShadow=E},loop(E){for(let S of d){let A=1+.07*Math.sin(E*7.1+S.ph)+.04*Math.sin(E*12.7+S.ph*2);S.flames.forEach(C=>C.scale.set(1,A,1)),S.light.intensity=S.base*(1+.1*Math.sin(E*6.3+S.ph)+.05*Math.sin(E*11.1))}p.opacity=.5+.06*Math.sin(E*5);for(let S of v)S.light.intensity=S.base*(1+.1*Math.sin(E*5.7+S.ph))},dispose(){o.traverse(E=>{E instanceof le&&E.geometry.dispose(),(E instanceof Gi||E instanceof vn)&&E.shadow.map?.dispose()});for(let E of a)E.dispose()}}}var $l={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new J(1/1024,1/512)}},vertexShader:`

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
	`};var dv="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fv=`
uniform sampler2D tDiffuse; uniform float exposure; uniform vec2 res; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){
  vec3 col = pow(aces(texture2D(tDiffuse, vUv).rgb * exposure), vec3(1.0/2.2));
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = col * vec3(1.02, 1.0, 0.96) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  gl_FragColor = vec4(col, 1.0);
}`;function zd(i){let e=new jn(-1,1,1,-1,0,1),t=new gn({uniforms:{tDiffuse:{value:null},exposure:{value:1.4},res:{value:new J(1,1)}},vertexShader:dv,fragmentShader:fv,depthTest:!1,depthWrite:!1}),n=new gn({uniforms:{tDiffuse:{value:null},resolution:{value:new J}},vertexShader:$l.vertexShader,fragmentShader:$l.fragmentShader,depthTest:!1,depthWrite:!1}),r=new le(new en(2,2),t);r.frustumCulled=!1;let s=new Un;s.add(r);let o=new Qt(1,1,{type:Ni,samples:4,stencilBuffer:!0}),a=new Qt(1,1);return{setSize(l,c){o.setSize(l,c),a.setSize(l,c),t.uniforms.res.value.set(l,c),n.uniforms.resolution.value.set(1/l,1/c)},render(l,c,u){i.setRenderTarget(o),i.render(l,c),r.material=t,t.uniforms.tDiffuse.value=o.texture,i.setRenderTarget(u?a:null),i.render(s,e),u&&(r.material=n,n.uniforms.tDiffuse.value=a.texture,i.setRenderTarget(null),i.render(s,e))},dispose(){o.dispose(),a.dispose(),t.dispose(),n.dispose(),r.geometry.dispose()}}}var kd=12597547,pv=16735045,mv=1836034,jo=.03,jl=ae+.035,Hd=jl+jo+.01,gv=Hd+.006,xv=.42,_v=.2,yv=.2,vv=1.32,Bd={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function Gd(i){let e=xv*i,t=_v*i,n=new on;return n.moveTo(e/2,0),n.lineTo(-e/2,t),n.lineTo(-e/4,0),n.lineTo(-e/2,-t),n.closePath(),new Cr(n).rotateX(-Math.PI/2).translate(yv,0,0)}function Vd(){let i=new Ee,e=new Rn({color:kd,roughness:.7,emissive:kd,emissiveIntensity:.35}),t=new dt({color:pv}),n=new dt({color:mv}),r=[],s="",o=()=>{for(let l of r)i.remove(l),l.geometry.dispose();r.length=0},a=(l,c)=>{if(l.length===0)return null;let u=l.map(d=>d.index?d.toNonIndexed():d),h=new le(Wo(u),c);return l.forEach(d=>d.dispose()),u.forEach(d=>d.dispose()),r.push(h),i.add(h),h};return{group:i,set(l,c,u){let h=l&&l.length>1?`${c}x${u}:${l.map(p=>`${p.jump?"^":""}${p.r},${p.c}`).join(" ")}`:"";if(h===s)return!1;if(s=h,o(),!l||l.length<2)return!0;let d=l.map(p=>[At(p.c,c),Pt(p.r,u)]),f=[],g=[],_=[];d.forEach(([p,v],x)=>{f.push(new An(jo,8,6).translate(p,jl,v));let b=Go(l,x);if(!b)return;let[E,S]=d[x+1],A=E-p,C=S-v,y=Math.hypot(A,C),M=new _n(jo,jo,y,8,1,!0);M.rotateZ(Math.PI/2),M.rotateY(-Math.atan2(C,A)),M.translate(p+A/2,jl,v+C/2),f.push(M),_.push(Gd(vv).rotateY(-Bd[b]).translate(p,Hd,v)),g.push(Gd(1).rotateY(-Bd[b]).translate(p,gv,v))});let m=a(f,e);return m&&(m.receiveShadow=!0),a(_,n),a(g,t),!0},dispose(){o(),e.dispose(),t.dispose(),n.dispose()}}}var Mv=394500,ec=Math.PI/180,tc=12,Wd=.12;function Sv(i){let e=null;try{e=localStorage.getItem(bh)}catch{e=null}Sh(e);let t=new es({canvas:i.canvas,antialias:!0,powerPreference:"high-performance"});t.shadowMap.enabled=!0,t.shadowMap.type=Pl,t.shadowMap.autoUpdate=!1;let n=ad(t),r=new Un;r.background=new Xe(Mv);let s=new jn(-1,1,1,-1,.1,200),o=new P,a=new P,l=new P,c=zd(t),u=cd(n),h=fd(n),d=new Ee,f=Ud(),g=Ad(n,f),_=Vd(),m=Dd(n);r.add(u.group,h.group,d,g.group,_.group,m.group);let p=!0,v=0,x=0,b=-1e9,E=!1,S=rd(),A=S.q,C=1,y=1,M="solid",U=ln(),z=null,Y=null,I=[],D=new Set,O=[],V=null,K=0,Z=0,re=!0,se="",pe=!0,X=!0,Q=!0,ee={yaw:0,pitch:75,tx:0,tz:0,zoom:10},ce={...ee},ve=!0,Oe=!1,De=()=>i.reducedMotion(),Ce=()=>A===0?1:Math.min(globalThis.devicePixelRatio||1,2),Ue=()=>z?.level.rows??1,L=()=>z?.level.cols??1,ue=()=>C/y,$=(j,de)=>D.has(de)?"water":td(j,de),he=()=>ph(ue(),L(),Ue(),ce.pitch);function q(){!x&&p&&(x=requestAnimationFrame(Te))}function Ie(j){K=j,X=!0,q()}let be=()=>p&&re&&!document.hidden&&!i.reducedMotion();function T(){Z&&clearTimeout(Z),Z=0,be()&&(Z=setTimeout(()=>{Z=0,be()&&(z&&w()?Ie(K+1/tc):K+=1/tc,T())},1e3/tc))}function w(){k();let j=de=>(o.copy(de).project(s),Math.abs(o.x)<1.05&&Math.abs(o.y)<1.05);return(V?.anchors??[]).some(j)||g.looping().some(de=>j(de.position))||O.some(de=>!!de?.userData?.loop&&j(de.position))}function k(){let j=ee.yaw*ec,de=ee.pitch*ec,fe=40;s.position.set(ee.tx+Math.sin(j)*Math.cos(de)*fe,ae+Math.sin(de)*fe,ee.tz+Math.cos(j)*Math.cos(de)*fe),s.up.set(-Math.sin(j),0,-Math.cos(j)),s.lookAt(ee.tx,ae,ee.tz);let Ae=ee.zoom/2,Ze=ue();s.left=-Ae*Ze,s.right=Ae*Ze,s.top=Ae,s.bottom=-Ae,s.updateProjectionMatrix(),s.updateMatrixWorld()}function ie(){Oe?(ve&&Y&&(ce.tx=At(Y.c,L()),ce.tz=Pt(Y.r,Ue())),ce.zoom=Oo(ce.zoom,he())):(ce.tx=ce.tz=0,ce.zoom=fh(ue(),L(),Ue(),ce.pitch,ce.yaw)),Object.assign(ce,No(ce,L(),Ue(),ue()))}function oe(){let{hero:j,rest:de}=g.seen();if(M==="ghosted"&&z){let fe=L(),Ae=Ue();O.forEach((Ze,yt)=>{let vt=Ze?.userData;!vt||vt.h<=0||de.push({x:At(yt%fe,fe),z:Pt(Math.floor(yt/fe),Ae),half:vt.half,h:vt.h})})}return zh(M,j,de)}function te(){V?.shadows(A>=3),Q=!0,Je()}function Te(j){if(x=0,!p){E=!1;return}let de=j-b;b=j;let fe=od(E,de);if(fe!==null){let vt=sd(S,fe);vt!==A&&(A=vt,te())}let Ae=fe!==null?Math.min(.1,de/1e3):1/60;ie();let Ze=ch(ee,ce,Ae,De());if(Ze&&(pe=!0),k(),ye.setView(ee.yaw,ee.pitch),pe&&(h.aim(s,oe()),pe=!1),Ze=h.ease(Ae,De())||Ze,g.ease(Ae,De())&&(Ze=!0,Q=!0),m.frame(j)&&(Ze=!0,Q=!0),X){u.loop(K),V?.loop(K),g.loop(K),m.loop(K,De());for(let vt of O)vt?.userData?.loop?.(K);X=!1}if(Q&&(t.shadowMap.needsUpdate=!0,Q=!1),c.render(r,s,A>=2),f.group.children.length){let vt=f.place(s,ee.pitch,K,De(),y/ee.zoom);_e(vt),t.autoClear=!1,t.render(f.scene,s),t.autoClear=!0}let yt=`${ee.yaw} ${ee.tx} ${ee.tz} ${ee.zoom} ${C} ${y}`;yt!==se&&(se=yt,ge?.view(ee,ue())),v++,E=Ze,Ze&&q()}function _e(j){let de=ee.zoom/2,fe=de*ue();a.setFromMatrixColumn(s.matrixWorld,0),l.setFromMatrixColumn(s.matrixWorld,1);for(let Ae of f.group.children){if(o.copy(Ae.userData.foot).project(s),Math.abs(o.x)>1||Math.abs(o.y)>1)continue;o.copy(Ae.position).project(s);let[Ze,yt]=qh(o.x*fe,o.y*de,ds*j,Fo*j,fe,de,Xh);Ae.position.addScaledVector(a,Ze).addScaledVector(l,yt)}}function Se(){let j=de=>(o.copy(de).project(s),[(o.x+1)/2*C,(1-o.y)/2*y]);return f.group.children.map(de=>{let fe=de.userData;return{kind:fe.kind,at:j(de.position),foot:j(fe.foot),cell:y/ee.zoom}})}let Pe=new jn(-1,1,1,-1,.1,200),ze=null,ne=new Uint8Array(0);function it(j,de,fe,Ae,Ze){if(!z)return!1;let yt=L(),vt=Ue(),lt=j.width,ft=j.height,$t=(B,H,G)=>G<=H?(G-1)/2:Math.max((H-1)/2,Math.min(G-1-(H-1)/2,B)),cn=At($t(fe,Ae,yt),yt),ni=Pt($t(de,Ze,vt),vt),yi=75*ec,vi=40;Pe.position.set(cn,ae+Math.sin(yi)*vi,ni+Math.cos(yi)*vi),Pe.up.set(0,0,-1),Pe.lookAt(cn,ae,ni);let Ft=Ae/2,R=Ze*Math.sin(yi)/2;Object.assign(Pe,{left:-Ft,right:Ft,top:R,bottom:-R}),Pe.updateProjectionMatrix(),Pe.updateMatrixWorld(),(!ze||ze.width!==lt||ze.height!==ft)&&(ze?.dispose(),ze=new Qt(lt,ft),ze.texture.colorSpace=Tt,ne=new Uint8Array(lt*ft*4)),t.toneMapping=Dl,t.toneMappingExposure=1.4,t.setRenderTarget(ze),t.render(r,Pe),t.setRenderTarget(null),t.toneMapping=Dn,t.readRenderTargetPixels(ze,0,0,lt,ft,ne);let F=new ImageData(lt,ft);for(let B=0;B<ft;B++)F.data.set(ne.subarray((ft-1-B)*lt*4,(ft-B)*lt*4),B*lt*4);return j.getContext("2d").putImageData(F,0,0),!0}function Je(){let j=i.canvas.clientWidth,de=i.canvas.clientHeight;if(j<=0||de<=0)return;C=j,y=de;let fe=Ce();t.setPixelRatio(fe),t.setSize(j,de,!1),c.setSize(Math.round(j*fe),Math.round(de*fe)),ge?.fit(i.overlay.clientWidth||j,i.overlay.clientHeight||de),Oe||(ie(),ee.zoom=ce.zoom),pe=!0}function Ge(j){let de=O[j];de&&(d.remove(de),Wi(de,n));let fe=L(),Ae=Ue(),Ze=Math.floor(j/fe),yt=j%fe,vt=($t,cn)=>$t<0||cn<0||$t>=Ae||cn>=fe||I[$t*fe+cn]==="wall",lt=yd[I[j]]({kit:n,r:Ze,c:yt,wall:vt}),ft=lt.userData;if(!lt.children.length){O[j]=null;return}lt.position.set(At(yt,fe),0,Pt(Ze,Ae)),ft.tall&&M==="low"&&(lt.scale.y=Or/an),d.add(lt),O[j]=lt}function Ne(j,de){Y&&(Y.r!==de.player.r||Y.c!==de.player.c)&&(ve=!0),Y={r:de.player.r,c:de.player.c};let fe=g.set(id(j,de),L(),Ue(),De()),Ae=g.hero();return Ae&&V?.hero(Ae.position.x,Ae.position.z),fe}function we(){for(let j of O)j&&(d.remove(j),Wi(j,n));O=[],V&&(r.remove(V.group),V.dispose(),V=null),g.clear(),m.clear(),_.set(null,0,0)}function qe(j){we(),z=j;let{rows:de,cols:fe}=j.level;D=new Set(Hl(j.level.terrain,j.terrain)),I=j.terrain.map((Ae,Ze)=>$(j,Ze)),m.set([...D],fe,de,!1),u.set(I,de,fe),h.build(I,de,fe),O=I.map(()=>null);for(let Ae=0;Ae<I.length;Ae++)Ge(Ae);V=Fd(n,I,de,fe,h.list()),V.setMode(M),V.shadows(A>=3),r.add(V.group),gs(S),Y=null,Ne(j,{player:j.player,minotaur:j.minotaur,hazards:j.hazards.map(Ae=>({kind:Ae.kind,at:Ae.at}))}),ve=!0,Oe=!1,ce.yaw=0,ce.pitch=75,ie(),Object.assign(ee,ce),pe=X=Q=!0,ge?.paint(j,{player:j.player,minotaur:j.minotaur,hazards:j.hazards.map(Ae=>({kind:Ae.kind,at:Ae.at}))},null),q(),Z||T()}function rt(j,de){let fe=j.state;(!z||fe.level!==z.level)&&qe(fe);let Ae=z,Ze=Dh(Ae,fe);Ae.relicsLeft!==fe.relicsLeft&&fe.terrain.forEach((Ft,R)=>{Ft==="gate"&&Ze.push(R)});let yt=!1,vt=!1,{rows:lt,cols:ft}=fe.level,$t=new Set,cn=Hl(fe.level.terrain,fe.terrain);D=new Set(cn);for(let Ft of Ze){let R=$(fe,Ft),F=I[Ft];if(R!==F){if(ms[R]!==ms[F]&&(yt=!0),R==="wall"!=(F==="wall")){vt=!0;let B=Math.floor(Ft/ft),H=Ft%ft;for(let[G,Me]of[[-1,0],[1,0],[0,-1],[0,1]])B+G>=0&&B+G<lt&&H+Me>=0&&H+Me<ft&&$t.add((B+G)*ft+H+Me)}I[Ft]=R,Ge(Ft),V?.piece(Ft,R)}}for(let Ft of $t)Ze.includes(Ft)||Ge(Ft);yt&&u.set(I,lt,ft),vt&&(h.build(I,lt,ft),h.setMode(M)),z=fe;let ni=Ne(fe,j.figures),yi=_.set(de,ft,lt),vi=m.set(cn,ft,lt,!De());Ze.length===0&&!ni&&!yi&&!vi&&fe===Ae||((Ze.length||ni||vi)&&(pe=!0,Q=!0),ge?.paint(fe,j.figures,de),q(),Z||T())}function mt(j){let de=U.cutaway&&j==="solid"?"ghosted":j;M=de,h.setMode(de),V?.setMode(de);for(let fe of O)fe&&fe.userData.tall&&(fe.scale.y=de==="low"?Or/an:1);pe=Q=!0,q()}function je(){ve=!0,Oe=!1,ce.yaw=hh(0,ee.yaw),ce.pitch=75,De()&&(ee.yaw=ce.yaw,ee.pitch=ce.pitch)}let me={turn(j,de){ce.yaw+=j,(!de||De())&&(ee.yaw+=j),pe=!0,q()},pan(j,de){ve=!1;let fe=ee.zoom/y;for(let Ae of[ee,ce])Object.assign(Ae,No(uh(Ae,j,de,fe),L(),Ue(),ue()));pe=!0,q()},zoom(j,de,fe,Ae){Oe=!0;let Ze=he();if(Ae)ce.zoom=Oo(ce.zoom*j,Ze);else{let yt=Math.abs(de)>Wd||Math.abs(fe)>Wd;yt&&(ve=!1);let vt=yt?de*ue():0,lt=yt?fe:0;for(let ft of[ee,ce])Object.assign(ft,No(mh(ft,j,vt,lt,Ze),L(),Ue(),ue()))}pe=!0,q()},tilt(j,de){ce.pitch=Uo(ce.pitch+j),(!de||De())&&(ee.pitch=ce.pitch),pe=!0,q()},settle(){ce.yaw=lh(ce.yaw),De()&&(ee.yaw=ce.yaw),pe=!0,q()},reset(){je(),pe=!0,q()}},N=document.createElement("div");N.className="modern-ui",i.overlay.append(N);let ye=Lh(i.canvas,N,i,me),ge=i.atlas&&i.image?ed(N,i.atlas,i.image,{blocked:()=>i.blocked(),look(j){i.gesture(),ve=!1,ce.tx=j.x,ce.tz=j.z,q()}}):null,ke=()=>{gs(S),T()};document.addEventListener("visibilitychange",ke);let Fe=typeof IntersectionObserver=="function"?new IntersectionObserver(j=>{re=j.some(de=>de.isIntersecting),T()}):null;Fe?.observe(i.canvas);let ot=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,at=()=>{X=!0,q(),T()};return ot?.addEventListener("change",at),Je(),{level:qe,show:rt,walls:mt,yaw:()=>ee.yaw,zoom:()=>ee.zoom,pitch:()=>ee.pitch,following:()=>ve,reset:me.reset,resize(){Je(),q()},setActive(j){p=j,N.hidden=!j,j?q():(x&&cancelAnimationFrame(x),x=0,E=!1),T()},frames:()=>v,quality:()=>A,fps:()=>Ho(S.gaps,2e3),floating:()=>m.cells(),markers:Se,splashing:()=>m.splashing(),minimap(j){ge?.show(j)},snapshot:it,dispose(){x&&cancelAnimationFrame(x),x=0,p=!1,T(),document.removeEventListener("visibilitychange",ke),Fe?.disconnect(),ot?.removeEventListener("change",at),ye.dispose(),ge?.dispose(),N.remove(),we(),u.dispose(),h.dispose(),g.dispose(),m.dispose(),_.dispose(),f.dispose(),ze?.dispose(),c.dispose(),n.dispose(),t.dispose()}}}export{Sv as createModernBoard};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=modern.js.map
