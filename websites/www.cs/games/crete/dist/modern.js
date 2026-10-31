/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
var Yd=0,lc=1,Zd=2;var ku=1,Cl=2,qn=3,pi=0,Lt=1,mn=2;var hi=0,pr=1,Li=2,cc=3,uc=4,Kd=5,Ti=100,Jd=101,$d=102,hc=103,dc=104,jd=200,Qd=201,ef=202,tf=203,ka=204,Ba=205,nf=206,rf=207,sf=208,of=209,af=210,lf=211,cf=212,uf=213,hf=214,df=0,ff=1,pf=2,Js=3,mf=4,gf=5,Pl=6,xf=7,Il=0,_f=1,yf=2,Nn=0,vf=1,bf=2,Mf=3,Ll=4,Sf=5,wf=6;var Bu=300,xr=301,_r=302,Ga=303,Ha=304,Po=306,yr=1e3,Ht=1001,Va=1002,$t=1003,fc=1004;var na=1005;var pn=1006,Ef=1007;var $r=1008;var di=1009,Tf=1010,Af=1011,Dl=1012,Gu=1013,ci=1014,ui=1015,Di=1016,Hu=1017,Vu=1018,Ci=1020,Rf=1021,Rn=1023,Cf=1024,Pf=1025,Pi=1026,vr=1027,If=1028,Wu=1029,Lf=1030,Xu=1031,qu=1033,ia=33776,ra=33777,sa=33778,oa=33779,pc=35840,mc=35841,gc=35842,xc=35843,Yu=36196,_c=37492,yc=37496,vc=37808,bc=37809,Mc=37810,Sc=37811,wc=37812,Ec=37813,Tc=37814,Ac=37815,Rc=37816,Cc=37817,Pc=37818,Ic=37819,Lc=37820,Dc=37821,aa=36492,Uc=36494,Nc=36495,Df=36283,Oc=36284,Fc=36285,zc=36286;var $s=2300,js=2301,la=2302,kc=2400,Bc=2401,Gc=2402;var Zu=3e3,Ii=3001,Uf=3200,Nf=3201,Ul=0,Of=1,gn="",Ct="srgb",$n="srgb-linear",Nl="display-p3",Io="display-p3-linear",Qs="linear",mt="srgb",eo="rec709",to="p3";var Wi=7680,Ku=7681;var Ju=517;var Hc=519,Ff=512,zf=513,kf=514,$u=515,Bf=516,Gf=517,Hf=518,Vf=519,Wa=35044;var Vc="300 es",Xa=1035,Kn=2e3,no=2001,mi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Wt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var ca=Math.PI/180,qa=180/Math.PI;function Jn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Wt[i&255]+Wt[i>>8&255]+Wt[i>>16&255]+Wt[i>>24&255]+"-"+Wt[e&255]+Wt[e>>8&255]+"-"+Wt[e>>16&15|64]+Wt[e>>24&255]+"-"+Wt[t&63|128]+Wt[t>>8&255]+"-"+Wt[t>>16&255]+Wt[t>>24&255]+Wt[n&255]+Wt[n>>8&255]+Wt[n>>16&255]+Wt[n>>24&255]).toLowerCase()}function Gt(i,e,t){return Math.max(e,Math.min(t,i))}function Wf(i,e){return(i%e+e)%e}function ua(i,e,t){return(1-t)*i+t*e}function Wc(i){return(i&i-1)===0&&i!==0}function Ya(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Zn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ut(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var J=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Gt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},tt=class i{constructor(e,t,n,r,s,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],_=r[0],m=r[3],p=r[6],v=r[1],x=r[4],b=r[7],E=r[2],S=r[5],A=r[8];return s[0]=o*_+a*v+l*E,s[3]=o*m+a*x+l*S,s[6]=o*p+a*b+l*A,s[1]=c*_+u*v+h*E,s[4]=c*m+u*x+h*S,s[7]=c*p+u*b+h*A,s[2]=d*_+f*v+g*E,s[5]=d*m+f*x+g*S,s[8]=d*p+f*b+g*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*s,f=c*s-o*l,g=t*h+n*d+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=h*_,e[1]=(r*c-u*n)*_,e[2]=(a*n-r*o)*_,e[3]=d*_,e[4]=(u*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*s)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(ha.makeScale(e,t)),this}rotate(e){return this.premultiply(ha.makeRotation(-e)),this}translate(e,t){return this.premultiply(ha.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ha=new tt;function ju(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function io(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Xf(){let i=io("canvas");return i.style.display="block",i}var Xc={};function Yr(i){i in Xc||(Xc[i]=!0,console.warn(i))}var qc=new tt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Yc=new tt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),vs={[$n]:{transfer:Qs,primaries:eo,toReference:i=>i,fromReference:i=>i},[Ct]:{transfer:mt,primaries:eo,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Io]:{transfer:Qs,primaries:to,toReference:i=>i.applyMatrix3(Yc),fromReference:i=>i.applyMatrix3(qc)},[Nl]:{transfer:mt,primaries:to,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Yc),fromReference:i=>i.applyMatrix3(qc).convertLinearToSRGB()}},qf=new Set([$n,Io]),ct={enabled:!0,_workingColorSpace:$n,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!qf.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;let n=vs[e].toReference,r=vs[t].fromReference;return r(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return vs[i].primaries},getTransfer:function(i){return i===gn?Qs:vs[i].transfer}};function mr(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function da(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Xi,ro=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Xi===void 0&&(Xi=io("canvas")),Xi.width=e.width,Xi.height=e.height;let n=Xi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Xi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=io("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=mr(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(mr(t[n]/255)*255):t[n]=mr(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Yf=0,so=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Yf++}),this.uuid=Jn(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(fa(r[o].image)):s.push(fa(r[o]))}else s=fa(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function fa(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ro.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Zf=0,xn=class i extends mi{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Ht,r=Ht,s=pn,o=$r,a=Rn,l=di,c=i.DEFAULT_ANISOTROPY,u=gn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Zf++}),this.uuid=Jn(),this.name="",this.source=new so(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new J(0,0),this.repeat=new J(1,1),this.center=new J(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new tt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof u=="string"?this.colorSpace=u:(Yr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=u===Ii?Ct:gn),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Bu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case yr:e.x=e.x-Math.floor(e.x);break;case Ht:e.x=e.x<0?0:1;break;case Va:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case yr:e.y=e.y-Math.floor(e.y);break;case Ht:e.y=e.y<0?0:1;break;case Va:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Yr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===Ct?Ii:Zu}set encoding(e){Yr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Ii?Ct:gn}};xn.DEFAULT_IMAGE=null;xn.DEFAULT_MAPPING=Bu;xn.DEFAULT_ANISOTROPY=1;var _t=class i{constructor(e=0,t=0,n=0,r=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,b=(f+1)/2,E=(p+1)/2,S=(u+d)/4,A=(h+_)/4,C=(g+m)/4;return x>b&&x>E?x<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(x),r=S/n,s=A/n):b>E?b<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(b),n=S/r,s=C/r):E<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(E),n=A/s,r=C/s),this.set(n,r,s,t),this}let v=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(h-_)/v,this.z=(d-u)/v,this.w=Math.acos((c+f+p-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Za=class extends mi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new _t(0,0,e,t),this.scissorTest=!1,this.viewport=new _t(0,0,e,t);let r={width:e,height:t,depth:1};n.encoding!==void 0&&(Yr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===Ii?Ct:gn),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:pn,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new xn(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new so(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},tn=class extends Za{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},oo=class extends xn{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=$t,this.minFilter=$t,this.wrapR=Ht,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ka=class extends xn{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=$t,this.minFilter=$t,this.wrapR=Ht,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var gi=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],u=n[r+2],h=n[r+3],d=s[o+0],f=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(h!==_||l!==d||c!==f||u!==g){let m=1-a,p=l*d+c*f+u*g+h*_,v=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let E=Math.sqrt(x),S=Math.atan2(E,p*v);m=Math.sin(m*S)/E,a=Math.sin(a*S)/E}let b=a*v;if(l=l*m+d*b,c=c*m+f*b,u=u*m+g*b,h=h*m+_*b,m===1-a){let E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){let a=n[r],l=n[r+1],c=n[r+2],u=n[r+3],h=s[o],d=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-a*f,e[t+2]=c*g+u*f+a*d-l*h,e[t+3]=u*g-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(r/2),h=a(s/2),d=l(n/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(n>a&&n>h){let f=2*Math.sqrt(1+n-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>h){let f=2*Math.sqrt(1+a-n-h);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-n-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Gt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-r*a,this._w=o*u-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,s=this._z,o=this._w,a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(r),n*Math.sin(s),n*Math.cos(s),t*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},I=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Zc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Zc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),u=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return pa.copy(this).projectOnVector(e),this.sub(pa)}reflect(e){return this.sub(pa.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Gt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},pa=new I,Zc=new gi,jn=class{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(En.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(En.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=En.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,En):En.fromBufferAttribute(s,o),En.applyMatrix4(e.matrixWorld),this.expandByPoint(En);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),bs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),bs.copy(n.boundingBox)),bs.applyMatrix4(e.matrixWorld),this.union(bs)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,En),En.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Fr),Ms.subVectors(this.max,Fr),qi.subVectors(e.a,Fr),Yi.subVectors(e.b,Fr),Zi.subVectors(e.c,Fr),ri.subVectors(Yi,qi),si.subVectors(Zi,Yi),bi.subVectors(qi,Zi);let t=[0,-ri.z,ri.y,0,-si.z,si.y,0,-bi.z,bi.y,ri.z,0,-ri.x,si.z,0,-si.x,bi.z,0,-bi.x,-ri.y,ri.x,0,-si.y,si.x,0,-bi.y,bi.x,0];return!ma(t,qi,Yi,Zi,Ms)||(t=[1,0,0,0,1,0,0,0,1],!ma(t,qi,Yi,Zi,Ms))?!1:(Ss.crossVectors(ri,si),t=[Ss.x,Ss.y,Ss.z],ma(t,qi,Yi,Zi,Ms))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,En).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(En).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Gn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Gn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Gn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Gn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Gn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Gn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Gn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Gn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Gn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Gn=[new I,new I,new I,new I,new I,new I,new I,new I],En=new I,bs=new jn,qi=new I,Yi=new I,Zi=new I,ri=new I,si=new I,bi=new I,Fr=new I,Ms=new I,Ss=new I,Mi=new I;function ma(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){Mi.fromArray(i,s);let a=r.x*Math.abs(Mi.x)+r.y*Math.abs(Mi.y)+r.z*Math.abs(Mi.z),l=e.dot(Mi),c=t.dot(Mi),u=n.dot(Mi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var Kf=new jn,zr=new I,ga=new I,Ui=class{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Kf.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zr.subVectors(e,this.center);let t=zr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(zr,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ga.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zr.copy(e.center).add(ga)),this.expandByPoint(zr.copy(e.center).sub(ga))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Hn=new I,xa=new I,ws=new I,oi=new I,_a=new I,Es=new I,ya=new I,Ja=class{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Hn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Hn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Hn.copy(this.origin).addScaledVector(this.direction,t),Hn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){xa.copy(e).add(t).multiplyScalar(.5),ws.copy(t).sub(e).normalize(),oi.copy(this.origin).sub(xa);let s=e.distanceTo(t)*.5,o=-this.direction.dot(ws),a=oi.dot(this.direction),l=-oi.dot(ws),c=oi.lengthSq(),u=Math.abs(1-o*o),h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=s*u,h>=0)if(d>=-g)if(d<=g){let _=1/u;h*=_,d*=_,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(xa).addScaledVector(ws,d),f}intersectSphere(e,t){Hn.subVectors(e.center,this.origin);let n=Hn.dot(this.direction),r=Hn.dot(Hn)-n*n,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Hn)!==null}intersectTriangle(e,t,n,r,s){_a.subVectors(t,e),Es.subVectors(n,e),ya.crossVectors(_a,Es);let o=this.direction.dot(ya),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;oi.subVectors(this.origin,e);let l=a*this.direction.dot(Es.crossVectors(oi,Es));if(l<0)return null;let c=a*this.direction.dot(_a.cross(oi));if(c<0||l+c>o)return null;let u=-a*oi.dot(ya);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},dt=class i{constructor(e,t,n,r,s,o,a,l,c,u,h,d,f,g,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,u,h,d,f,g,_,m)}set(e,t,n,r,s,o,a,l,c,u,h,d,f,g,_,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=r,p[1]=s,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Ki.setFromMatrixColumn(e,0).length(),s=1/Ki.setFromMatrixColumn(e,1).length(),o=1/Ki.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let d=o*u,f=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d-_*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*u,f=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+_,t[1]=l*h,t[5]=_*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-d*h,t[8]=g*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-_*h}else if(e.order==="XZY"){let d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+_,t[5]=o*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*u,t[10]=_*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Jf,e,$f)}lookAt(e,t,n){let r=this.elements;return on.subVectors(e,t),on.lengthSq()===0&&(on.z=1),on.normalize(),ai.crossVectors(n,on),ai.lengthSq()===0&&(Math.abs(n.z)===1?on.x+=1e-4:on.z+=1e-4,on.normalize(),ai.crossVectors(n,on)),ai.normalize(),Ts.crossVectors(on,ai),r[0]=ai.x,r[4]=Ts.x,r[8]=on.x,r[1]=ai.y,r[5]=Ts.y,r[9]=on.y,r[2]=ai.z,r[6]=Ts.z,r[10]=on.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],v=n[3],x=n[7],b=n[11],E=n[15],S=r[0],A=r[4],C=r[8],y=r[12],M=r[1],D=r[5],z=r[9],Y=r[13],L=r[2],O=r[6],H=r[10],q=r[14],Z=r[3],X=r[7],ie=r[11],Q=r[15];return s[0]=o*S+a*M+l*L+c*Z,s[4]=o*A+a*D+l*O+c*X,s[8]=o*C+a*z+l*H+c*ie,s[12]=o*y+a*Y+l*q+c*Q,s[1]=u*S+h*M+d*L+f*Z,s[5]=u*A+h*D+d*O+f*X,s[9]=u*C+h*z+d*H+f*ie,s[13]=u*y+h*Y+d*q+f*Q,s[2]=g*S+_*M+m*L+p*Z,s[6]=g*A+_*D+m*O+p*X,s[10]=g*C+_*z+m*H+p*ie,s[14]=g*y+_*Y+m*q+p*Q,s[3]=v*S+x*M+b*L+E*Z,s[7]=v*A+x*D+b*O+E*X,s[11]=v*C+x*z+b*H+E*ie,s[15]=v*y+x*Y+b*q+E*Q,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+s*l*h-r*c*h-s*a*d+n*c*d+r*a*f-n*l*f)+_*(+t*l*f-t*c*d+s*o*d-r*o*f+r*c*u-s*l*u)+m*(+t*c*h-t*a*f-s*o*h+n*o*f+s*a*u-n*c*u)+p*(-r*a*u-t*l*h+t*a*d+r*o*h-n*o*d+n*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],v=h*m*c-_*d*c+_*l*f-a*m*f-h*l*p+a*d*p,x=g*d*c-u*m*c-g*l*f+o*m*f+u*l*p-o*d*p,b=u*_*c-g*h*c+g*a*f-o*_*f-u*a*p+o*h*p,E=g*h*l-u*_*l-g*a*d+o*_*d+u*a*m-o*h*m,S=t*v+n*x+r*b+s*E;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/S;return e[0]=v*A,e[1]=(_*d*s-h*m*s-_*r*f+n*m*f+h*r*p-n*d*p)*A,e[2]=(a*m*s-_*l*s+_*r*c-n*m*c-a*r*p+n*l*p)*A,e[3]=(h*l*s-a*d*s-h*r*c+n*d*c+a*r*f-n*l*f)*A,e[4]=x*A,e[5]=(u*m*s-g*d*s+g*r*f-t*m*f-u*r*p+t*d*p)*A,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*p-t*l*p)*A,e[7]=(o*d*s-u*l*s+u*r*c-t*d*c-o*r*f+t*l*f)*A,e[8]=b*A,e[9]=(g*h*s-u*_*s-g*n*f+t*_*f+u*n*p-t*h*p)*A,e[10]=(o*_*s-g*a*s+g*n*c-t*_*c-o*n*p+t*a*p)*A,e[11]=(u*a*s-o*h*s-u*n*c+t*h*c+o*n*f-t*a*f)*A,e[12]=E*A,e[13]=(u*_*r-g*h*r+g*n*d-t*_*d-u*n*m+t*h*m)*A,e[14]=(g*a*r-o*_*r-g*n*l+t*_*l+o*n*m-t*a*m)*A,e[15]=(o*h*r-u*a*r+u*n*l-t*h*l-o*n*d+t*a*d)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+n,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,d=s*c,f=s*u,g=s*h,_=o*u,m=o*h,p=a*h,v=l*c,x=l*u,b=l*h,E=n.x,S=n.y,A=n.z;return r[0]=(1-(_+p))*E,r[1]=(f+b)*E,r[2]=(g-x)*E,r[3]=0,r[4]=(f-b)*S,r[5]=(1-(d+p))*S,r[6]=(m+v)*S,r[7]=0,r[8]=(g+x)*A,r[9]=(m-v)*A,r[10]=(1-(d+_))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,s=Ki.set(r[0],r[1],r[2]).length(),o=Ki.set(r[4],r[5],r[6]).length(),a=Ki.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Tn.copy(this);let c=1/s,u=1/o,h=1/a;return Tn.elements[0]*=c,Tn.elements[1]*=c,Tn.elements[2]*=c,Tn.elements[4]*=u,Tn.elements[5]*=u,Tn.elements[6]*=u,Tn.elements[8]*=h,Tn.elements[9]*=h,Tn.elements[10]*=h,t.setFromRotationMatrix(Tn),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=Kn){let l=this.elements,c=2*s/(t-e),u=2*s/(n-r),h=(t+e)/(t-e),d=(n+r)/(n-r),f,g;if(a===Kn)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===no)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=Kn){let l=this.elements,c=1/(t-e),u=1/(n-r),h=1/(o-s),d=(t+e)*c,f=(n+r)*u,g,_;if(a===Kn)g=(o+s)*h,_=-2*h;else if(a===no)g=s*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Ki=new I,Tn=new dt,Jf=new I(0,0,0),$f=new I(1,1,1),ai=new I,Ts=new I,on=new I,Kc=new dt,Jc=new gi,ao=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],d=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(Gt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Gt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(Gt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Gt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Gt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Gt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Kc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Kc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Jc.setFromEuler(this),this.setFromQuaternion(Jc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ao.DEFAULT_ORDER="XYZ";var lo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},jf=0,$c=new I,Ji=new gi,Vn=new dt,As=new I,kr=new I,Qf=new I,ep=new gi,jc=new I(1,0,0),Qc=new I(0,1,0),eu=new I(0,0,1),tp={type:"added"},np={type:"removed"},Yt=class i extends mi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:jf++}),this.uuid=Jn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new I,t=new ao,n=new gi,r=new I(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new dt},normalMatrix:{value:new tt}}),this.matrix=new dt,this.matrixWorld=new dt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new lo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ji.setFromAxisAngle(e,t),this.quaternion.multiply(Ji),this}rotateOnWorldAxis(e,t){return Ji.setFromAxisAngle(e,t),this.quaternion.premultiply(Ji),this}rotateX(e){return this.rotateOnAxis(jc,e)}rotateY(e){return this.rotateOnAxis(Qc,e)}rotateZ(e){return this.rotateOnAxis(eu,e)}translateOnAxis(e,t){return $c.copy(e).applyQuaternion(this.quaternion),this.position.add($c.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(jc,e)}translateY(e){return this.translateOnAxis(Qc,e)}translateZ(e){return this.translateOnAxis(eu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Vn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?As.copy(e):As.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),kr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Vn.lookAt(kr,As,this.up):Vn.lookAt(As,kr,this.up),this.quaternion.setFromRotationMatrix(Vn),r&&(Vn.extractRotation(r.matrixWorld),Ji.setFromRotationMatrix(Vn),this.quaternion.premultiply(Ji.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(tp)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(np)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Vn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Vn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Vn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kr,e,Qf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(kr,ep,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++){let s=t[n];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let r=this.children;for(let s=0,o=r.length;s<o;s++){let a=r[s];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxGeometryCount=this._maxGeometryCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}};Yt.DEFAULT_UP=new I(0,1,0);Yt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var An=new I,Wn=new I,va=new I,Xn=new I,$i=new I,ji=new I,tu=new I,ba=new I,Ma=new I,Sa=new I,Rs=!1,Ri=class i{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),An.subVectors(e,t),r.cross(An);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){An.subVectors(r,t),Wn.subVectors(n,t),va.subVectors(e,t);let o=An.dot(An),a=An.dot(Wn),l=An.dot(va),c=Wn.dot(Wn),u=Wn.dot(va),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return s.set(1-f-g,g,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Xn)===null?!1:Xn.x>=0&&Xn.y>=0&&Xn.x+Xn.y<=1}static getUV(e,t,n,r,s,o,a,l){return Rs===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Rs=!0),this.getInterpolation(e,t,n,r,s,o,a,l)}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,Xn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Xn.x),l.addScaledVector(o,Xn.y),l.addScaledVector(a,Xn.z),l)}static isFrontFacing(e,t,n,r){return An.subVectors(n,t),Wn.subVectors(e,t),An.cross(Wn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return An.subVectors(this.c,this.b),Wn.subVectors(this.a,this.b),An.cross(Wn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,r,s){return Rs===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Rs=!0),i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,o,a;$i.subVectors(r,n),ji.subVectors(s,n),ba.subVectors(e,n);let l=$i.dot(ba),c=ji.dot(ba);if(l<=0&&c<=0)return t.copy(n);Ma.subVectors(e,r);let u=$i.dot(Ma),h=ji.dot(Ma);if(u>=0&&h<=u)return t.copy(r);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector($i,o);Sa.subVectors(e,s);let f=$i.dot(Sa),g=ji.dot(Sa);if(g>=0&&f<=g)return t.copy(s);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(ji,a);let m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return tu.subVectors(s,r),a=(h-u)/(h-u+(f-g)),t.copy(r).addScaledVector(tu,a);let p=1/(m+_+d);return o=_*p,a=d*p,t.copy(n).addScaledVector($i,o).addScaledVector(ji,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Qu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},li={h:0,s:0,l:0},Cs={h:0,s:0,l:0};function wa(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ze=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ct){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=ct.workingColorSpace){return this.r=e,this.g=t,this.b=n,ct.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=ct.workingColorSpace){if(e=Wf(e,1),t=Gt(t,0,1),n=Gt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=wa(o,s,e+1/3),this.g=wa(o,s,e),this.b=wa(o,s,e-1/3)}return ct.toWorkingColorSpace(this,r),this}setStyle(e,t=Ct){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ct){let n=Qu[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=mr(e.r),this.g=mr(e.g),this.b=mr(e.b),this}copyLinearToSRGB(e){return this.r=da(e.r),this.g=da(e.g),this.b=da(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ct){return ct.fromWorkingColorSpace(Xt.copy(this),e),Math.round(Gt(Xt.r*255,0,255))*65536+Math.round(Gt(Xt.g*255,0,255))*256+Math.round(Gt(Xt.b*255,0,255))}getHexString(e=Ct){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.fromWorkingColorSpace(Xt.copy(this),t);let n=Xt.r,r=Xt.g,s=Xt.b,o=Math.max(n,r,s),a=Math.min(n,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ct.workingColorSpace){return ct.fromWorkingColorSpace(Xt.copy(this),t),e.r=Xt.r,e.g=Xt.g,e.b=Xt.b,e}getStyle(e=Ct){ct.fromWorkingColorSpace(Xt.copy(this),e);let t=Xt.r,n=Xt.g,r=Xt.b;return e!==Ct?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(li),this.setHSL(li.h+e,li.s+t,li.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(li),e.getHSL(Cs);let n=ua(li.h,Cs.h,t),r=ua(li.s,Cs.s,t),s=ua(li.l,Cs.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Xt=new Ze;Ze.NAMES=Qu;var ip=0,Qn=class extends mi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ip++}),this.uuid=Jn(),this.name="",this.type="Material",this.blending=pr,this.side=pi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ka,this.blendDst=Ba,this.blendEquation=Ti,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ze(0,0,0),this.blendAlpha=0,this.depthFunc=Js,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Hc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Wi,this.stencilZFail=Wi,this.stencilZPass=Wi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==pr&&(n.blending=this.blending),this.side!==pi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ka&&(n.blendSrc=this.blendSrc),this.blendDst!==Ba&&(n.blendDst=this.blendDst),this.blendEquation!==Ti&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Js&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Hc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Wi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Wi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Wi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ft=class extends Qn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ze(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Il,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var It=new I,Ps=new J,qt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Wa,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=ui,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ps.fromBufferAttribute(this,t),Ps.applyMatrix3(e),this.setXY(t,Ps.x,Ps.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix3(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ut(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ut(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array),s=ut(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Wa&&(e.usage=this.usage),e}};var co=class extends qt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var uo=class extends qt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Je=class extends qt{constructor(e,t,n){super(new Float32Array(e),t,n)}};var rp=0,fn=new dt,Ea=new Yt,Qi=new I,an=new jn,Br=new jn,Bt=new I,At=class i extends mi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rp++}),this.uuid=Jn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ju(e)?uo:co)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new tt().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return fn.makeRotationFromQuaternion(e),this.applyMatrix4(fn),this}rotateX(e){return fn.makeRotationX(e),this.applyMatrix4(fn),this}rotateY(e){return fn.makeRotationY(e),this.applyMatrix4(fn),this}rotateZ(e){return fn.makeRotationZ(e),this.applyMatrix4(fn),this}translate(e,t,n){return fn.makeTranslation(e,t,n),this.applyMatrix4(fn),this}scale(e,t,n){return fn.makeScale(e,t,n),this.applyMatrix4(fn),this}lookAt(e){return Ea.lookAt(e),Ea.updateMatrix(),this.applyMatrix4(Ea.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Qi).negate(),this.translate(Qi.x,Qi.y,Qi.z),this}setFromPoints(e){let t=[];for(let n=0,r=e.length;n<r;n++){let s=e[n];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Je(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new jn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];an.setFromBufferAttribute(s),this.morphTargetsRelative?(Bt.addVectors(this.boundingBox.min,an.min),this.boundingBox.expandByPoint(Bt),Bt.addVectors(this.boundingBox.max,an.max),this.boundingBox.expandByPoint(Bt)):(this.boundingBox.expandByPoint(an.min),this.boundingBox.expandByPoint(an.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ui);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new I,1/0);return}if(e){let n=this.boundingSphere.center;if(an.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Br.setFromBufferAttribute(a),this.morphTargetsRelative?(Bt.addVectors(an.min,Br.min),an.expandByPoint(Bt),Bt.addVectors(an.max,Br.max),an.expandByPoint(Bt)):(an.expandByPoint(Br.min),an.expandByPoint(Br.max))}an.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)Bt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(Bt));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)Bt.fromBufferAttribute(a,c),l&&(Qi.fromBufferAttribute(e,c),Bt.add(Qi)),r=Math.max(r,n.distanceToSquared(Bt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.array,r=t.position.array,s=t.normal.array,o=t.uv.array,a=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new qt(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],u=[];for(let M=0;M<a;M++)c[M]=new I,u[M]=new I;let h=new I,d=new I,f=new I,g=new J,_=new J,m=new J,p=new I,v=new I;function x(M,D,z){h.fromArray(r,M*3),d.fromArray(r,D*3),f.fromArray(r,z*3),g.fromArray(o,M*2),_.fromArray(o,D*2),m.fromArray(o,z*2),d.sub(h),f.sub(h),_.sub(g),m.sub(g);let Y=1/(_.x*m.y-m.x*_.y);isFinite(Y)&&(p.copy(d).multiplyScalar(m.y).addScaledVector(f,-_.y).multiplyScalar(Y),v.copy(f).multiplyScalar(_.x).addScaledVector(d,-m.x).multiplyScalar(Y),c[M].add(p),c[D].add(p),c[z].add(p),u[M].add(v),u[D].add(v),u[z].add(v))}let b=this.groups;b.length===0&&(b=[{start:0,count:n.length}]);for(let M=0,D=b.length;M<D;++M){let z=b[M],Y=z.start,L=z.count;for(let O=Y,H=Y+L;O<H;O+=3)x(n[O+0],n[O+1],n[O+2])}let E=new I,S=new I,A=new I,C=new I;function y(M){A.fromArray(s,M*3),C.copy(A);let D=c[M];E.copy(D),E.sub(A.multiplyScalar(A.dot(D))).normalize(),S.crossVectors(C,D);let Y=S.dot(u[M])<0?-1:1;l[M*4]=E.x,l[M*4+1]=E.y,l[M*4+2]=E.z,l[M*4+3]=Y}for(let M=0,D=b.length;M<D;++M){let z=b[M],Y=z.start,L=z.count;for(let O=Y,H=Y+L;O<H;O+=3)y(n[O+0]),y(n[O+1]),y(n[O+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new qt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let r=new I,s=new I,o=new I,a=new I,l=new I,c=new I,u=new I,h=new I;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Bt.fromBufferAttribute(e,t),Bt.normalize(),e.setXYZ(t,Bt.x,Bt.y,Bt.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new qt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,n);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},nu=new dt,Si=new Ja,Is=new Ui,iu=new I,er=new I,tr=new I,nr=new I,Ta=new I,Ls=new I,Ds=new J,Us=new J,Ns=new J,ru=new I,su=new I,ou=new I,Os=new I,Fs=new I,le=class extends Yt{constructor(e=new At,t=new ft){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Ls.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(Ta.fromBufferAttribute(h,e),o?Ls.addScaledVector(Ta,u):Ls.addScaledVector(Ta.sub(t),u))}t.add(Ls)}return t}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Is.copy(n.boundingSphere),Is.applyMatrix4(s),Si.copy(e.ray).recast(e.near),!(Is.containsPoint(Si.origin)===!1&&(Si.intersectSphere(Is,iu)===null||Si.origin.distanceToSquared(iu)>(e.far-e.near)**2))&&(nu.copy(s).invert(),Si.copy(e.ray).applyMatrix4(nu),!(n.boundingBox!==null&&Si.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Si)))}_computeIntersections(e,t,n){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],v=Math.max(m.start,f.start),x=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let b=v,E=x;b<E;b+=3){let S=a.getX(b),A=a.getX(b+1),C=a.getX(b+2);r=zs(this,p,e,n,c,u,h,S,A,C),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let v=a.getX(m),x=a.getX(m+1),b=a.getX(m+2);r=zs(this,o,e,n,c,u,h,v,x,b),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],v=Math.max(m.start,f.start),x=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let b=v,E=x;b<E;b+=3){let S=b,A=b+1,C=b+2;r=zs(this,p,e,n,c,u,h,S,A,C),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let v=m,x=m+1,b=m+2;r=zs(this,o,e,n,c,u,h,v,x,b),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function sp(i,e,t,n,r,s,o,a){let l;if(e.side===Lt?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===pi,a),l===null)return null;Fs.copy(a),Fs.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Fs);return c<t.near||c>t.far?null:{distance:c,point:Fs.clone(),object:i}}function zs(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,er),i.getVertexPosition(l,tr),i.getVertexPosition(c,nr);let u=sp(i,e,t,n,er,tr,nr,Os);if(u){r&&(Ds.fromBufferAttribute(r,a),Us.fromBufferAttribute(r,l),Ns.fromBufferAttribute(r,c),u.uv=Ri.getInterpolation(Os,er,tr,nr,Ds,Us,Ns,new J)),s&&(Ds.fromBufferAttribute(s,a),Us.fromBufferAttribute(s,l),Ns.fromBufferAttribute(s,c),u.uv1=Ri.getInterpolation(Os,er,tr,nr,Ds,Us,Ns,new J),u.uv2=u.uv1),o&&(ru.fromBufferAttribute(o,a),su.fromBufferAttribute(o,l),ou.fromBufferAttribute(o,c),u.normal=Ri.getInterpolation(Os,er,tr,nr,ru,su,ou,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new I,materialIndex:0};Ri.getNormal(er,tr,nr,h.normal),u.face=h}return u}var ln=class i extends At{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new Je(c,3)),this.setAttribute("normal",new Je(u,3)),this.setAttribute("uv",new Je(h,2));function g(_,m,p,v,x,b,E,S,A,C,y){let M=b/A,D=E/C,z=b/2,Y=E/2,L=S/2,O=A+1,H=C+1,q=0,Z=0,X=new I;for(let ie=0;ie<H;ie++){let Q=ie*D-Y;for(let ue=0;ue<O;ue++){let V=ue*M-z;X[_]=V*v,X[m]=Q*x,X[p]=L,c.push(X.x,X.y,X.z),X[_]=0,X[m]=0,X[p]=S>0?1:-1,u.push(X.x,X.y,X.z),h.push(ue/A),h.push(1-ie/C),q+=1}}for(let ie=0;ie<C;ie++)for(let Q=0;Q<A;Q++){let ue=d+Q+O*ie,V=d+Q+O*(ie+1),ee=d+(Q+1)+O*(ie+1),ve=d+(Q+1)+O*ie;l.push(ue,V,ve),l.push(V,ee,ve),Z+=6}a.addGroup(f,Z,y),f+=Z,d+=q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function br(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Jt(i){let e={};for(let t=0;t<i.length;t++){let n=br(i[t]);for(let r in n)e[r]=n[r]}return e}function op(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function eh(i){return i.getRenderTarget()===null?i.outputColorSpace:ct.workingColorSpace}var ap={clone:br,merge:Jt},lp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,_n=class extends Qn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lp,this.fragmentShader=cp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=br(e.uniforms),this.uniformsGroups=op(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ho=class extends Yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new dt,this.projectionMatrix=new dt,this.projectionMatrixInverse=new dt,this.coordinateSystem=Kn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},en=class extends ho{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=qa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ca*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return qa*2*Math.atan(Math.tan(ca*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ca*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ir=-90,rr=1,$a=class extends Yt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new en(ir,rr,e,t);r.layers=this.layers,this.add(r);let s=new en(ir,rr,e,t);s.layers=this.layers,this.add(s);let o=new en(ir,rr,e,t);o.layers=this.layers,this.add(o);let a=new en(ir,rr,e,t);a.layers=this.layers,this.add(a);let l=new en(ir,rr,e,t);l.layers=this.layers,this.add(l);let c=new en(ir,rr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===Kn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===no)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},fo=class extends xn{constructor(e,t,n,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:xr,super(e,t,n,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},ja=class extends tn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];t.encoding!==void 0&&(Yr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Ii?Ct:gn),this.texture=new fo(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:pn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new ln(5,5,5),s=new _n({name:"CubemapFromEquirect",uniforms:br(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Lt,blending:hi});s.uniforms.tEquirect.value=t;let o=new le(r,s),a=t.minFilter;return t.minFilter===$r&&(t.minFilter=pn),new $a(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}},Aa=new I,up=new I,hp=new tt,Yn=class{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Aa.subVectors(n,t).cross(up.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Aa),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||hp.getNormalMatrix(e),r=this.coplanarPoint(Aa).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},wi=new Ui,ks=new I,jr=class{constructor(e=new Yn,t=new Yn,n=new Yn,r=new Yn,s=new Yn,o=new Yn){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Kn){let n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],d=r[7],f=r[8],g=r[9],_=r[10],m=r[11],p=r[12],v=r[13],x=r[14],b=r[15];if(n[0].setComponents(l-s,d-c,m-f,b-p).normalize(),n[1].setComponents(l+s,d+c,m+f,b+p).normalize(),n[2].setComponents(l+o,d+u,m+g,b+v).normalize(),n[3].setComponents(l-o,d-u,m-g,b-v).normalize(),n[4].setComponents(l-a,d-h,m-_,b-x).normalize(),t===Kn)n[5].setComponents(l+a,d+h,m+_,b+x).normalize();else if(t===no)n[5].setComponents(a,h,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),wi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),wi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(wi)}intersectsSprite(e){return wi.center.set(0,0,0),wi.radius=.7071067811865476,wi.applyMatrix4(e.matrixWorld),this.intersectsSphere(wi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ks.x=r.normal.x>0?e.max.x:e.min.x,ks.y=r.normal.y>0?e.max.y:e.min.y,ks.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ks)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function th(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function dp(i,e){let t=e.isWebGL2,n=new WeakMap;function r(c,u){let h=c.array,d=c.usage,f=h.byteLength,g=i.createBuffer();i.bindBuffer(u,g),i.bufferData(u,h,d),c.onUploadCallback();let _;if(h instanceof Float32Array)_=i.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)_=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)_=i.SHORT;else if(h instanceof Uint32Array)_=i.UNSIGNED_INT;else if(h instanceof Int32Array)_=i.INT;else if(h instanceof Int8Array)_=i.BYTE;else if(h instanceof Uint8Array)_=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)_=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:_,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:f}}function s(c,u,h){let d=u.array,f=u._updateRange,g=u.updateRanges;if(i.bindBuffer(h,c),f.count===-1&&g.length===0&&i.bufferSubData(h,0,d),g.length!==0){for(let _=0,m=g.length;_<m;_++){let p=g[_];t?i.bufferSubData(h,p.start*d.BYTES_PER_ELEMENT,d,p.start,p.count):i.bufferSubData(h,p.start*d.BYTES_PER_ELEMENT,d.subarray(p.start,p.start+p.count))}u.clearUpdateRanges()}f.count!==-1&&(t?i.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d,f.offset,f.count):i.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d.subarray(f.offset,f.offset+f.count)),f.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let u=n.get(c);u&&(i.deleteBuffer(u.buffer),n.delete(c))}function l(c,u){if(c.isGLBufferAttribute){let d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let h=n.get(c);if(h===void 0)n.set(c,r(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}var nn=class i extends At{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,u=l+1,h=e/a,d=t/l,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){let v=p*d-o;for(let x=0;x<c;x++){let b=x*h-s;g.push(b,-v,0),_.push(0,0,1),m.push(x/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let v=0;v<a;v++){let x=v+c*p,b=v+c*(p+1),E=v+1+c*(p+1),S=v+1+c*p;f.push(x,b,S),f.push(b,E,S)}this.setIndex(f),this.setAttribute("position",new Je(g,3)),this.setAttribute("normal",new Je(_,3)),this.setAttribute("uv",new Je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},fp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,pp=`#ifdef USE_ALPHAHASH
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
#endif`,mp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,xp=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,_p=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,yp=`#ifdef USE_AOMAP
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
#endif`,vp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,bp=`#ifdef USE_BATCHING
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
#endif`,Mp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Sp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,wp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ep=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Tp=`#ifdef USE_IRIDESCENCE
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
#endif`,Ap=`#ifdef USE_BUMPMAP
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
#endif`,Rp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Cp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ip=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Lp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Dp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Up=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Np=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Op=`#define PI 3.141592653589793
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
} // validated`,Fp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,zp=`vec3 transformedNormal = objectNormal;
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
#endif`,kp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Bp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Gp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Hp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Vp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Wp=`
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
}`,Xp=`#ifdef USE_ENVMAP
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
#endif`,qp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Yp=`#ifdef USE_ENVMAP
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
#endif`,Zp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Kp=`#ifdef USE_ENVMAP
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
#endif`,Jp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,$p=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,jp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Qp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,em=`#ifdef USE_GRADIENTMAP
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
}`,tm=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,nm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,im=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,rm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,sm=`uniform bool receiveShadow;
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
#endif`,om=`#ifdef USE_ENVMAP
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
#endif`,am=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,cm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,um=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,hm=`PhysicalMaterial material;
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
#endif`,dm=`struct PhysicalMaterial {
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
}`,fm=`
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
#endif`,pm=`#if defined( RE_IndirectDiffuse )
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
#endif`,mm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,gm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,xm=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_m=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,ym=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,vm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,bm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Mm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Sm=`#if defined( USE_POINTS_UV )
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
#endif`,wm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Em=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Tm=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Am=`#ifdef USE_MORPHNORMALS
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
#endif`,Rm=`#ifdef USE_MORPHTARGETS
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
#endif`,Cm=`#ifdef USE_MORPHTARGETS
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
#endif`,Pm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Im=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Lm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Um=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Nm=`#ifdef USE_NORMALMAP
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
#endif`,Om=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Fm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,km=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Bm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Gm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Hm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Vm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Wm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Xm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,qm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ym=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Zm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Km=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Jm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,$m=`float getShadowMask() {
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
}`,jm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Qm=`#ifdef USE_SKINNING
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
#endif`,e0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,t0=`#ifdef USE_SKINNING
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
#endif`,n0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,i0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,r0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,s0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,o0=`#ifdef USE_TRANSMISSION
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
#endif`,a0=`#ifdef USE_TRANSMISSION
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
#endif`,l0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,c0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,u0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,h0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,d0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,f0=`uniform sampler2D t2D;
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
}`,p0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,m0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,g0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,x0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_0=`#include <common>
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
}`,y0=`#if DEPTH_PACKING == 3200
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
}`,v0=`#define DISTANCE
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
}`,b0=`#define DISTANCE
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
}`,M0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,S0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,w0=`uniform float scale;
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
}`,E0=`uniform vec3 diffuse;
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
}`,T0=`#include <common>
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
}`,A0=`uniform vec3 diffuse;
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
}`,R0=`#define LAMBERT
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
}`,C0=`#define LAMBERT
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
}`,P0=`#define MATCAP
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
}`,I0=`#define MATCAP
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
}`,L0=`#define NORMAL
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
}`,D0=`#define NORMAL
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
}`,U0=`#define PHONG
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
}`,N0=`#define PHONG
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
}`,O0=`#define STANDARD
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
}`,F0=`#define STANDARD
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
}`,z0=`#define TOON
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
}`,k0=`#define TOON
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
}`,B0=`uniform float size;
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
}`,G0=`uniform vec3 diffuse;
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
}`,H0=`#include <common>
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
}`,V0=`uniform vec3 color;
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
}`,W0=`uniform float rotation;
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
}`,X0=`uniform vec3 diffuse;
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
}`,je={alphahash_fragment:fp,alphahash_pars_fragment:pp,alphamap_fragment:mp,alphamap_pars_fragment:gp,alphatest_fragment:xp,alphatest_pars_fragment:_p,aomap_fragment:yp,aomap_pars_fragment:vp,batching_pars_vertex:bp,batching_vertex:Mp,begin_vertex:Sp,beginnormal_vertex:wp,bsdfs:Ep,iridescence_fragment:Tp,bumpmap_pars_fragment:Ap,clipping_planes_fragment:Rp,clipping_planes_pars_fragment:Cp,clipping_planes_pars_vertex:Pp,clipping_planes_vertex:Ip,color_fragment:Lp,color_pars_fragment:Dp,color_pars_vertex:Up,color_vertex:Np,common:Op,cube_uv_reflection_fragment:Fp,defaultnormal_vertex:zp,displacementmap_pars_vertex:kp,displacementmap_vertex:Bp,emissivemap_fragment:Gp,emissivemap_pars_fragment:Hp,colorspace_fragment:Vp,colorspace_pars_fragment:Wp,envmap_fragment:Xp,envmap_common_pars_fragment:qp,envmap_pars_fragment:Yp,envmap_pars_vertex:Zp,envmap_physical_pars_fragment:om,envmap_vertex:Kp,fog_vertex:Jp,fog_pars_vertex:$p,fog_fragment:jp,fog_pars_fragment:Qp,gradientmap_pars_fragment:em,lightmap_fragment:tm,lightmap_pars_fragment:nm,lights_lambert_fragment:im,lights_lambert_pars_fragment:rm,lights_pars_begin:sm,lights_toon_fragment:am,lights_toon_pars_fragment:lm,lights_phong_fragment:cm,lights_phong_pars_fragment:um,lights_physical_fragment:hm,lights_physical_pars_fragment:dm,lights_fragment_begin:fm,lights_fragment_maps:pm,lights_fragment_end:mm,logdepthbuf_fragment:gm,logdepthbuf_pars_fragment:xm,logdepthbuf_pars_vertex:_m,logdepthbuf_vertex:ym,map_fragment:vm,map_pars_fragment:bm,map_particle_fragment:Mm,map_particle_pars_fragment:Sm,metalnessmap_fragment:wm,metalnessmap_pars_fragment:Em,morphcolor_vertex:Tm,morphnormal_vertex:Am,morphtarget_pars_vertex:Rm,morphtarget_vertex:Cm,normal_fragment_begin:Pm,normal_fragment_maps:Im,normal_pars_fragment:Lm,normal_pars_vertex:Dm,normal_vertex:Um,normalmap_pars_fragment:Nm,clearcoat_normal_fragment_begin:Om,clearcoat_normal_fragment_maps:Fm,clearcoat_pars_fragment:zm,iridescence_pars_fragment:km,opaque_fragment:Bm,packing:Gm,premultiplied_alpha_fragment:Hm,project_vertex:Vm,dithering_fragment:Wm,dithering_pars_fragment:Xm,roughnessmap_fragment:qm,roughnessmap_pars_fragment:Ym,shadowmap_pars_fragment:Zm,shadowmap_pars_vertex:Km,shadowmap_vertex:Jm,shadowmask_pars_fragment:$m,skinbase_vertex:jm,skinning_pars_vertex:Qm,skinning_vertex:e0,skinnormal_vertex:t0,specularmap_fragment:n0,specularmap_pars_fragment:i0,tonemapping_fragment:r0,tonemapping_pars_fragment:s0,transmission_fragment:o0,transmission_pars_fragment:a0,uv_pars_fragment:l0,uv_pars_vertex:c0,uv_vertex:u0,worldpos_vertex:h0,background_vert:d0,background_frag:f0,backgroundCube_vert:p0,backgroundCube_frag:m0,cube_vert:g0,cube_frag:x0,depth_vert:_0,depth_frag:y0,distanceRGBA_vert:v0,distanceRGBA_frag:b0,equirect_vert:M0,equirect_frag:S0,linedashed_vert:w0,linedashed_frag:E0,meshbasic_vert:T0,meshbasic_frag:A0,meshlambert_vert:R0,meshlambert_frag:C0,meshmatcap_vert:P0,meshmatcap_frag:I0,meshnormal_vert:L0,meshnormal_frag:D0,meshphong_vert:U0,meshphong_frag:N0,meshphysical_vert:O0,meshphysical_frag:F0,meshtoon_vert:z0,meshtoon_frag:k0,points_vert:B0,points_frag:G0,shadow_vert:H0,shadow_frag:V0,sprite_vert:W0,sprite_frag:X0},me={common:{diffuse:{value:new Ze(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new tt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new tt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new tt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new tt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new tt},normalScale:{value:new J(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new tt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new tt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new tt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new tt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ze(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ze(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0},uvTransform:{value:new tt}},sprite:{diffuse:{value:new Ze(16777215)},opacity:{value:1},center:{value:new J(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}}},Un={basic:{uniforms:Jt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:Jt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ze(0)}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:Jt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ze(0)},specular:{value:new Ze(1118481)},shininess:{value:30}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:Jt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Ze(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:Jt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Ze(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:Jt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:Jt([me.points,me.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:Jt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:Jt([me.common,me.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:Jt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:Jt([me.sprite,me.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new tt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distanceRGBA:{uniforms:Jt([me.common,me.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distanceRGBA_vert,fragmentShader:je.distanceRGBA_frag},shadow:{uniforms:Jt([me.lights,me.fog,{color:{value:new Ze(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};Un.physical={uniforms:Jt([Un.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new tt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new tt},clearcoatNormalScale:{value:new J(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new tt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new tt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new tt},sheen:{value:0},sheenColor:{value:new Ze(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new tt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new tt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new tt},transmissionSamplerSize:{value:new J},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new tt},attenuationDistance:{value:0},attenuationColor:{value:new Ze(0)},specularColor:{value:new Ze(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new tt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new tt},anisotropyVector:{value:new J},anisotropyMap:{value:null},anisotropyMapTransform:{value:new tt}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};var Bs={r:0,b:0,g:0};function q0(i,e,t,n,r,s,o){let a=new Ze(0),l=s===!0?0:1,c,u,h=null,d=0,f=null;function g(m,p){let v=!1,x=p.isScene===!0?p.background:null;x&&x.isTexture&&(x=(p.backgroundBlurriness>0?t:e).get(x)),x===null?_(a,l):x&&x.isColor&&(_(x,1),v=!0);let b=i.xr.getEnvironmentBlendMode();b==="additive"?n.buffers.color.setClear(0,0,0,1,o):b==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||v)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),x&&(x.isCubeTexture||x.mapping===Po)?(u===void 0&&(u=new le(new ln(1,1,1),new _n({name:"BackgroundCubeMaterial",uniforms:br(Un.backgroundCube.uniforms),vertexShader:Un.backgroundCube.vertexShader,fragmentShader:Un.backgroundCube.fragmentShader,side:Lt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,S,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),u.material.uniforms.envMap.value=x,u.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=p.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,u.material.toneMapped=ct.getTransfer(x.colorSpace)!==mt,(h!==x||d!==x.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=x,d=x.version,f=i.toneMapping),u.layers.enableAll(),m.unshift(u,u.geometry,u.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new le(new nn(2,2),new _n({name:"BackgroundMaterial",uniforms:br(Un.background.uniforms),vertexShader:Un.background.vertexShader,fragmentShader:Un.background.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,c.material.toneMapped=ct.getTransfer(x.colorSpace)!==mt,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,f=i.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function _(m,p){m.getRGB(Bs,eh(i)),n.buffers.color.setClear(Bs.r,Bs.g,Bs.b,p,o)}return{getClearColor:function(){return a},setClearColor:function(m,p=1){a.set(m),l=p,_(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,_(a,l)},render:g}}function Y0(i,e,t,n){let r=i.getParameter(i.MAX_VERTEX_ATTRIBS),s=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||s!==null,a={},l=m(null),c=l,u=!1;function h(L,O,H,q,Z){let X=!1;if(o){let ie=_(q,H,O);c!==ie&&(c=ie,f(c.object)),X=p(L,q,H,Z),X&&v(L,q,H,Z)}else{let ie=O.wireframe===!0;(c.geometry!==q.id||c.program!==H.id||c.wireframe!==ie)&&(c.geometry=q.id,c.program=H.id,c.wireframe=ie,X=!0)}Z!==null&&t.update(Z,i.ELEMENT_ARRAY_BUFFER),(X||u)&&(u=!1,C(L,O,H,q),Z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Z).buffer))}function d(){return n.isWebGL2?i.createVertexArray():s.createVertexArrayOES()}function f(L){return n.isWebGL2?i.bindVertexArray(L):s.bindVertexArrayOES(L)}function g(L){return n.isWebGL2?i.deleteVertexArray(L):s.deleteVertexArrayOES(L)}function _(L,O,H){let q=H.wireframe===!0,Z=a[L.id];Z===void 0&&(Z={},a[L.id]=Z);let X=Z[O.id];X===void 0&&(X={},Z[O.id]=X);let ie=X[q];return ie===void 0&&(ie=m(d()),X[q]=ie),ie}function m(L){let O=[],H=[],q=[];for(let Z=0;Z<r;Z++)O[Z]=0,H[Z]=0,q[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:H,attributeDivisors:q,object:L,attributes:{},index:null}}function p(L,O,H,q){let Z=c.attributes,X=O.attributes,ie=0,Q=H.getAttributes();for(let ue in Q)if(Q[ue].location>=0){let ee=Z[ue],ve=X[ue];if(ve===void 0&&(ue==="instanceMatrix"&&L.instanceMatrix&&(ve=L.instanceMatrix),ue==="instanceColor"&&L.instanceColor&&(ve=L.instanceColor)),ee===void 0||ee.attribute!==ve||ve&&ee.data!==ve.data)return!0;ie++}return c.attributesNum!==ie||c.index!==q}function v(L,O,H,q){let Z={},X=O.attributes,ie=0,Q=H.getAttributes();for(let ue in Q)if(Q[ue].location>=0){let ee=X[ue];ee===void 0&&(ue==="instanceMatrix"&&L.instanceMatrix&&(ee=L.instanceMatrix),ue==="instanceColor"&&L.instanceColor&&(ee=L.instanceColor));let ve={};ve.attribute=ee,ee&&ee.data&&(ve.data=ee.data),Z[ue]=ve,ie++}c.attributes=Z,c.attributesNum=ie,c.index=q}function x(){let L=c.newAttributes;for(let O=0,H=L.length;O<H;O++)L[O]=0}function b(L){E(L,0)}function E(L,O){let H=c.newAttributes,q=c.enabledAttributes,Z=c.attributeDivisors;H[L]=1,q[L]===0&&(i.enableVertexAttribArray(L),q[L]=1),Z[L]!==O&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](L,O),Z[L]=O)}function S(){let L=c.newAttributes,O=c.enabledAttributes;for(let H=0,q=O.length;H<q;H++)O[H]!==L[H]&&(i.disableVertexAttribArray(H),O[H]=0)}function A(L,O,H,q,Z,X,ie){ie===!0?i.vertexAttribIPointer(L,O,H,Z,X):i.vertexAttribPointer(L,O,H,q,Z,X)}function C(L,O,H,q){if(n.isWebGL2===!1&&(L.isInstancedMesh||q.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;x();let Z=q.attributes,X=H.getAttributes(),ie=O.defaultAttributeValues;for(let Q in X){let ue=X[Q];if(ue.location>=0){let V=Z[Q];if(V===void 0&&(Q==="instanceMatrix"&&L.instanceMatrix&&(V=L.instanceMatrix),Q==="instanceColor"&&L.instanceColor&&(V=L.instanceColor)),V!==void 0){let ee=V.normalized,ve=V.itemSize,Pe=t.get(V);if(Pe===void 0)continue;let ge=Pe.buffer,Oe=Pe.type,Fe=Pe.bytesPerElement,Ee=n.isWebGL2===!0&&(Oe===i.INT||Oe===i.UNSIGNED_INT||V.gpuType===Gu);if(V.isInterleavedBufferAttribute){let pe=V.data,P=pe.stride,ce=V.offset;if(pe.isInstancedInterleavedBuffer){for(let K=0;K<ue.locationSize;K++)E(ue.location+K,pe.meshPerAttribute);L.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=pe.meshPerAttribute*pe.count)}else for(let K=0;K<ue.locationSize;K++)b(ue.location+K);i.bindBuffer(i.ARRAY_BUFFER,ge);for(let K=0;K<ue.locationSize;K++)A(ue.location+K,ve/ue.locationSize,Oe,ee,P*Fe,(ce+ve/ue.locationSize*K)*Fe,Ee)}else{if(V.isInstancedBufferAttribute){for(let pe=0;pe<ue.locationSize;pe++)E(ue.location+pe,V.meshPerAttribute);L.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=V.meshPerAttribute*V.count)}else for(let pe=0;pe<ue.locationSize;pe++)b(ue.location+pe);i.bindBuffer(i.ARRAY_BUFFER,ge);for(let pe=0;pe<ue.locationSize;pe++)A(ue.location+pe,ve/ue.locationSize,Oe,ee,ve*Fe,ve/ue.locationSize*pe*Fe,Ee)}}else if(ie!==void 0){let ee=ie[Q];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(ue.location,ee);break;case 3:i.vertexAttrib3fv(ue.location,ee);break;case 4:i.vertexAttrib4fv(ue.location,ee);break;default:i.vertexAttrib1fv(ue.location,ee)}}}}S()}function y(){z();for(let L in a){let O=a[L];for(let H in O){let q=O[H];for(let Z in q)g(q[Z].object),delete q[Z];delete O[H]}delete a[L]}}function M(L){if(a[L.id]===void 0)return;let O=a[L.id];for(let H in O){let q=O[H];for(let Z in q)g(q[Z].object),delete q[Z];delete O[H]}delete a[L.id]}function D(L){for(let O in a){let H=a[O];if(H[L.id]===void 0)continue;let q=H[L.id];for(let Z in q)g(q[Z].object),delete q[Z];delete H[L.id]}}function z(){Y(),u=!0,c!==l&&(c=l,f(c.object))}function Y(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:z,resetDefaultState:Y,dispose:y,releaseStatesOfGeometry:M,releaseStatesOfProgram:D,initAttributes:x,enableAttribute:b,disableUnusedAttributes:S}}function Z0(i,e,t,n){let r=n.isWebGL2,s;function o(u){s=u}function a(u,h){i.drawArrays(s,u,h),t.update(h,s,1)}function l(u,h,d){if(d===0)return;let f,g;if(r)f=i,g="drawArraysInstanced";else if(f=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[g](s,u,h,d),t.update(h,s,d)}function c(u,h,d){if(d===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<d;g++)this.render(u[g],h[g]);else{f.multiDrawArraysWEBGL(s,u,0,h,0,d);let g=0;for(let _=0;_<d;_++)g+=h[_];t.update(g,s,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function K0(i,e,t){let n;function r(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=s(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),_=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),p=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),x=d>0,b=o||e.has("OES_texture_float"),E=x&&b,S=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:d,maxTextureSize:f,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:m,maxVaryings:p,maxFragmentUniforms:v,vertexTextures:x,floatFragmentTextures:b,floatVertexTextures:E,maxSamples:S}}function J0(i){let e=this,t=null,n=0,r=!1,s=!1,o=new Yn,a=new tt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||n!==0||r;return r=d,n=h.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{let v=s?0:n,x=v*4,b=p.clippingState||null;l.value=b,b=u(g,d,x,f);for(let E=0;E!==x;++E)b[E]=t[E];p.clippingState=b,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){let _=h!==null?h.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let p=f+_*4,v=d.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<p)&&(m=new Float32Array(p));for(let x=0,b=f;x!==_;++x,b+=4)o.copy(h[x]).applyMatrix4(v,a),o.normal.toArray(m,b),m[b+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function $0(i){let e=new WeakMap;function t(o,a){return a===Ga?o.mapping=xr:a===Ha&&(o.mapping=_r),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===Ga||a===Ha)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new ja(l.height/2);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){let a=o.target;a.removeEventListener("dispose",r);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var ei=class extends ho{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},hr=4,au=[.125,.215,.35,.446,.526,.582],Ai=20,Ra=new ei,lu=new Ze,Ca=null,Pa=0,Ia=0,Ei=(1+Math.sqrt(5))/2,sr=1/Ei,cu=[new I(1,1,1),new I(-1,1,1),new I(1,1,-1),new I(-1,1,-1),new I(0,Ei,sr),new I(0,Ei,-sr),new I(sr,0,Ei),new I(-sr,0,Ei),new I(Ei,sr,0),new I(-Ei,sr,0)],Mr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Ca=this._renderer.getRenderTarget(),Pa=this._renderer.getActiveCubeFace(),Ia=this._renderer.getActiveMipmapLevel(),this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=du(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=hu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ca,Pa,Ia),e.scissorTest=!1,Gs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===xr||e.mapping===_r?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ca=this._renderer.getRenderTarget(),Pa=this._renderer.getActiveCubeFace(),Ia=this._renderer.getActiveMipmapLevel();let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:pn,minFilter:pn,generateMipmaps:!1,type:Di,format:Rn,colorSpace:$n,depthBuffer:!1},r=uu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=uu(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=j0(s)),this._blurMaterial=Q0(s,e,t)}return r}_compileMaterial(e){let t=new le(this._lodPlanes[0],e);this._renderer.compile(t,Ra)}_sceneToCubeUV(e,t,n,r){let a=new en(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(lu),u.toneMapping=Nn,u.autoClear=!1;let f=new ft({name:"PMREM.Background",side:Lt,depthWrite:!1,depthTest:!1}),g=new le(new ln,f),_=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,_=!0):(f.color.copy(lu),_=!0);for(let p=0;p<6;p++){let v=p%3;v===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):v===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));let x=this._cubeSize;Gs(r,v*x,p>2?x:0,x,x),u.setRenderTarget(r),_&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===xr||e.mapping===_r;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=du()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=hu());let s=r?this._cubemapMaterial:this._equirectMaterial,o=new le(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Gs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Ra)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){let s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=cu[(r-1)%cu.length];this._blur(e,r-1,r,s,o)}t.autoClear=n}_blur(e,t,n,r,s){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new le(this._lodPlanes[r],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Ai-1),_=s/g,m=isFinite(s)?1+Math.floor(u*_):Ai;m>Ai&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ai}`);let p=[],v=0;for(let A=0;A<Ai;++A){let C=A/_,y=Math.exp(-C*C/2);p.push(y),A===0?v+=y:A<m&&(v+=2*y)}for(let A=0;A<p.length;A++)p[A]=p[A]/v;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;let b=this._sizeLods[r],E=3*b*(r>x-hr?r-x+hr:0),S=4*(this._cubeSize-b);Gs(t,E,S,3*b,2*b),l.setRenderTarget(t),l.render(h,Ra)}};function j0(i){let e=[],t=[],n=[],r=i,s=i-hr+1+au.length;for(let o=0;o<s;o++){let a=Math.pow(2,r);t.push(a);let l=1/a;o>i-hr?l=au[o-i+hr-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,m=2,p=1,v=new Float32Array(_*g*f),x=new Float32Array(m*g*f),b=new Float32Array(p*g*f);for(let S=0;S<f;S++){let A=S%3*2/3-1,C=S>2?0:-1,y=[A,C,0,A+2/3,C,0,A+2/3,C+1,0,A,C,0,A+2/3,C+1,0,A,C+1,0];v.set(y,_*g*S),x.set(d,m*g*S);let M=[S,S,S,S,S,S];b.set(M,p*g*S)}let E=new At;E.setAttribute("position",new qt(v,_)),E.setAttribute("uv",new qt(x,m)),E.setAttribute("faceIndex",new qt(b,p)),e.push(E),r>hr&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function uu(i,e,t){let n=new tn(i,e,t);return n.texture.mapping=Po,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Gs(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function Q0(i,e,t){let n=new Float32Array(Ai),r=new I(0,1,0);return new _n({name:"SphericalGaussianBlur",defines:{n:Ai,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Ol(),fragmentShader:`

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
		`,blending:hi,depthTest:!1,depthWrite:!1})}function hu(){return new _n({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ol(),fragmentShader:`

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
		`,blending:hi,depthTest:!1,depthWrite:!1})}function du(){return new _n({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ol(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Ol(){return`

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
	`}function eg(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===Ga||l===Ha,u=l===xr||l===_r;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new Mr(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{let h=a.image;if(c&&h&&h.height>0||u&&h&&r(h)){t===null&&(t=new Mr(i));let d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",s),d.texture}else return null}}}return a}function r(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){let l=a.target;l.removeEventListener("dispose",s);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function tg(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){let r=t(n);return r===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function ng(i,e,t,n){let r={},s=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);for(let g in d.morphAttributes){let _=d.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)e.remove(_[m])}d.removeEventListener("dispose",o),delete r[d.id];let f=s.get(d);f&&(e.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let g in d)e.update(d[g],i.ARRAY_BUFFER);let f=h.morphAttributes;for(let g in f){let _=f[g];for(let m=0,p=_.length;m<p;m++)e.update(_[m],i.ARRAY_BUFFER)}}function c(h){let d=[],f=h.index,g=h.attributes.position,_=0;if(f!==null){let v=f.array;_=f.version;for(let x=0,b=v.length;x<b;x+=3){let E=v[x+0],S=v[x+1],A=v[x+2];d.push(E,S,S,A,A,E)}}else if(g!==void 0){let v=g.array;_=g.version;for(let x=0,b=v.length/3-1;x<b;x+=3){let E=x+0,S=x+1,A=x+2;d.push(E,S,S,A,A,E)}}else return;let m=new(ju(d)?uo:co)(d,1);m.version=_;let p=s.get(h);p&&e.remove(p),s.set(h,m)}function u(h){let d=s.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function ig(i,e,t,n){let r=n.isWebGL2,s;function o(f){s=f}let a,l;function c(f){a=f.type,l=f.bytesPerElement}function u(f,g){i.drawElements(s,g,a,f*l),t.update(g,s,1)}function h(f,g,_){if(_===0)return;let m,p;if(r)m=i,p="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),p="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[p](s,g,a,f*l,_),t.update(g,s,_)}function d(f,g,_){if(_===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<_;p++)this.render(f[p]/l,g[p]);else{m.multiDrawElementsWEBGL(s,g,0,a,f,0,_);let p=0;for(let v=0;v<_;v++)p+=g[v];t.update(p,s,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=d}function rg(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function sg(i,e){return i[0]-e[0]}function og(i,e){return Math.abs(e[1])-Math.abs(i[1])}function ag(i,e,t){let n={},r=new Float32Array(8),s=new WeakMap,o=new _t,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){let d=c.morphTargetInfluences;if(e.isWebGL2===!0){let f=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,g=f!==void 0?f.length:0,_=s.get(u);if(_===void 0||_.count!==g){let L=function(){z.dispose(),s.delete(u),u.removeEventListener("dispose",L)};_!==void 0&&_.texture.dispose();let v=u.morphAttributes.position!==void 0,x=u.morphAttributes.normal!==void 0,b=u.morphAttributes.color!==void 0,E=u.morphAttributes.position||[],S=u.morphAttributes.normal||[],A=u.morphAttributes.color||[],C=0;v===!0&&(C=1),x===!0&&(C=2),b===!0&&(C=3);let y=u.attributes.position.count*C,M=1;y>e.maxTextureSize&&(M=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let D=new Float32Array(y*M*4*g),z=new oo(D,y,M,g);z.type=ui,z.needsUpdate=!0;let Y=C*4;for(let O=0;O<g;O++){let H=E[O],q=S[O],Z=A[O],X=y*M*4*O;for(let ie=0;ie<H.count;ie++){let Q=ie*Y;v===!0&&(o.fromBufferAttribute(H,ie),D[X+Q+0]=o.x,D[X+Q+1]=o.y,D[X+Q+2]=o.z,D[X+Q+3]=0),x===!0&&(o.fromBufferAttribute(q,ie),D[X+Q+4]=o.x,D[X+Q+5]=o.y,D[X+Q+6]=o.z,D[X+Q+7]=0),b===!0&&(o.fromBufferAttribute(Z,ie),D[X+Q+8]=o.x,D[X+Q+9]=o.y,D[X+Q+10]=o.z,D[X+Q+11]=Z.itemSize===4?o.w:1)}}_={count:g,texture:z,size:new J(y,M)},s.set(u,_),u.addEventListener("dispose",L)}let m=0;for(let v=0;v<d.length;v++)m+=d[v];let p=u.morphTargetsRelative?1:1-m;h.getUniforms().setValue(i,"morphTargetBaseInfluence",p),h.getUniforms().setValue(i,"morphTargetInfluences",d),h.getUniforms().setValue(i,"morphTargetsTexture",_.texture,t),h.getUniforms().setValue(i,"morphTargetsTextureSize",_.size)}else{let f=d===void 0?0:d.length,g=n[u.id];if(g===void 0||g.length!==f){g=[];for(let x=0;x<f;x++)g[x]=[x,0];n[u.id]=g}for(let x=0;x<f;x++){let b=g[x];b[0]=x,b[1]=d[x]}g.sort(og);for(let x=0;x<8;x++)x<f&&g[x][1]?(a[x][0]=g[x][0],a[x][1]=g[x][1]):(a[x][0]=Number.MAX_SAFE_INTEGER,a[x][1]=0);a.sort(sg);let _=u.morphAttributes.position,m=u.morphAttributes.normal,p=0;for(let x=0;x<8;x++){let b=a[x],E=b[0],S=b[1];E!==Number.MAX_SAFE_INTEGER&&S?(_&&u.getAttribute("morphTarget"+x)!==_[E]&&u.setAttribute("morphTarget"+x,_[E]),m&&u.getAttribute("morphNormal"+x)!==m[E]&&u.setAttribute("morphNormal"+x,m[E]),r[x]=S,p+=S):(_&&u.hasAttribute("morphTarget"+x)===!0&&u.deleteAttribute("morphTarget"+x),m&&u.hasAttribute("morphNormal"+x)===!0&&u.deleteAttribute("morphNormal"+x),r[x]=0)}let v=u.morphTargetsRelative?1:1-p;h.getUniforms().setValue(i,"morphTargetBaseInfluence",v),h.getUniforms().setValue(i,"morphTargetInfluences",r)}}return{update:l}}function lg(i,e,t,n){let r=new WeakMap;function s(l){let c=n.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function o(){r=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}var po=class extends xn{constructor(e,t,n,r,s,o,a,l,c,u){if(u=u!==void 0?u:Pi,u!==Pi&&u!==vr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Pi&&(n=ci),n===void 0&&u===vr&&(n=Ci),super(null,r,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:$t,this.minFilter=l!==void 0?l:$t,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},nh=new xn,ih=new po(1,1);ih.compareFunction=$u;var rh=new oo,sh=new Ka,oh=new fo,fu=[],pu=[],mu=new Float32Array(16),gu=new Float32Array(9),xu=new Float32Array(4);function Pr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=fu[r];if(s===void 0&&(s=new Float32Array(r),fu[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function Ut(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Nt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Lo(i,e){let t=pu[e];t===void 0&&(t=new Int32Array(e),pu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function cg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function ug(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2fv(this.addr,e),Nt(t,e)}}function hg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ut(t,e))return;i.uniform3fv(this.addr,e),Nt(t,e)}}function dg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4fv(this.addr,e),Nt(t,e)}}function fg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,n))return;xu.set(n),i.uniformMatrix2fv(this.addr,!1,xu),Nt(t,n)}}function pg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,n))return;gu.set(n),i.uniformMatrix3fv(this.addr,!1,gu),Nt(t,n)}}function mg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,n))return;mu.set(n),i.uniformMatrix4fv(this.addr,!1,mu),Nt(t,n)}}function gg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function xg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2iv(this.addr,e),Nt(t,e)}}function _g(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;i.uniform3iv(this.addr,e),Nt(t,e)}}function yg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4iv(this.addr,e),Nt(t,e)}}function vg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function bg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2uiv(this.addr,e),Nt(t,e)}}function Mg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;i.uniform3uiv(this.addr,e),Nt(t,e)}}function Sg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4uiv(this.addr,e),Nt(t,e)}}function wg(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s=this.type===i.SAMPLER_2D_SHADOW?ih:nh;t.setTexture2D(e||s,r)}function Eg(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||sh,r)}function Tg(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||oh,r)}function Ag(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||rh,r)}function Rg(i){switch(i){case 5126:return cg;case 35664:return ug;case 35665:return hg;case 35666:return dg;case 35674:return fg;case 35675:return pg;case 35676:return mg;case 5124:case 35670:return gg;case 35667:case 35671:return xg;case 35668:case 35672:return _g;case 35669:case 35673:return yg;case 5125:return vg;case 36294:return bg;case 36295:return Mg;case 36296:return Sg;case 35678:case 36198:case 36298:case 36306:case 35682:return wg;case 35679:case 36299:case 36307:return Eg;case 35680:case 36300:case 36308:case 36293:return Tg;case 36289:case 36303:case 36311:case 36292:return Ag}}function Cg(i,e){i.uniform1fv(this.addr,e)}function Pg(i,e){let t=Pr(e,this.size,2);i.uniform2fv(this.addr,t)}function Ig(i,e){let t=Pr(e,this.size,3);i.uniform3fv(this.addr,t)}function Lg(i,e){let t=Pr(e,this.size,4);i.uniform4fv(this.addr,t)}function Dg(i,e){let t=Pr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Ug(i,e){let t=Pr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ng(i,e){let t=Pr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Og(i,e){i.uniform1iv(this.addr,e)}function Fg(i,e){i.uniform2iv(this.addr,e)}function zg(i,e){i.uniform3iv(this.addr,e)}function kg(i,e){i.uniform4iv(this.addr,e)}function Bg(i,e){i.uniform1uiv(this.addr,e)}function Gg(i,e){i.uniform2uiv(this.addr,e)}function Hg(i,e){i.uniform3uiv(this.addr,e)}function Vg(i,e){i.uniform4uiv(this.addr,e)}function Wg(i,e,t){let n=this.cache,r=e.length,s=Lo(t,r);Ut(n,s)||(i.uniform1iv(this.addr,s),Nt(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||nh,s[o])}function Xg(i,e,t){let n=this.cache,r=e.length,s=Lo(t,r);Ut(n,s)||(i.uniform1iv(this.addr,s),Nt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||sh,s[o])}function qg(i,e,t){let n=this.cache,r=e.length,s=Lo(t,r);Ut(n,s)||(i.uniform1iv(this.addr,s),Nt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||oh,s[o])}function Yg(i,e,t){let n=this.cache,r=e.length,s=Lo(t,r);Ut(n,s)||(i.uniform1iv(this.addr,s),Nt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||rh,s[o])}function Zg(i){switch(i){case 5126:return Cg;case 35664:return Pg;case 35665:return Ig;case 35666:return Lg;case 35674:return Dg;case 35675:return Ug;case 35676:return Ng;case 5124:case 35670:return Og;case 35667:case 35671:return Fg;case 35668:case 35672:return zg;case 35669:case 35673:return kg;case 5125:return Bg;case 36294:return Gg;case 36295:return Hg;case 36296:return Vg;case 35678:case 36198:case 36298:case 36306:case 35682:return Wg;case 35679:case 36299:case 36307:return Xg;case 35680:case 36300:case 36308:case 36293:return qg;case 36289:case 36303:case 36311:case 36292:return Yg}}var Qa=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Rg(t.type)}},el=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Zg(t.type)}},tl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],n)}}},La=/(\w+)(\])?(\[|\.)?/g;function _u(i,e){i.seq.push(e),i.map[e.id]=e}function Kg(i,e,t){let n=i.name,r=n.length;for(La.lastIndex=0;;){let s=La.exec(n),o=La.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){_u(t,c===void 0?new Qa(a,i,e):new el(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new tl(a),_u(t,h)),t=h}}}var gr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Kg(s,o,this)}}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&n.push(o)}return n}};function yu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Jg=37297,$g=0;function jg(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function Qg(i){let e=ct.getPrimaries(ct.workingColorSpace),t=ct.getPrimaries(i),n;switch(e===t?n="":e===to&&t===eo?n="LinearDisplayP3ToLinearSRGB":e===eo&&t===to&&(n="LinearSRGBToLinearDisplayP3"),i){case $n:case Io:return[n,"LinearTransferOETF"];case Ct:case Nl:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function vu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+jg(i.getShaderSource(e),o)}else return r}function ex(i,e){let t=Qg(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function tx(i,e){let t;switch(e){case vf:t="Linear";break;case bf:t="Reinhard";break;case Mf:t="OptimizedCineon";break;case Ll:t="ACESFilmic";break;case wf:t="AgX";break;case Sf:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function nx(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(dr).join(`
`)}function ix(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(dr).join(`
`)}function rx(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function sx(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),o=s.name,a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function dr(i){return i!==""}function bu(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Mu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var ox=/^[ \t]*#include +<([\w\d./]+)>/gm;function nl(i){return i.replace(ox,lx)}var ax=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function lx(i,e){let t=je[e];if(t===void 0){let n=ax.get(e);if(n!==void 0)t=je[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return nl(t)}var cx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Su(i){return i.replace(cx,ux)}function ux(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function wu(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function hx(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ku?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Cl?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===qn&&(e="SHADOWMAP_TYPE_VSM"),e}function dx(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case xr:case _r:e="ENVMAP_TYPE_CUBE";break;case Po:e="ENVMAP_TYPE_CUBE_UV";break}return e}function fx(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===_r&&(e="ENVMAP_MODE_REFRACTION"),e}function px(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Il:e="ENVMAP_BLENDING_MULTIPLY";break;case _f:e="ENVMAP_BLENDING_MIX";break;case yf:e="ENVMAP_BLENDING_ADD";break}return e}function mx(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function gx(i,e,t,n){let r=i.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=hx(t),c=dx(t),u=fx(t),h=px(t),d=mx(t),f=t.isWebGL2?"":nx(t),g=ix(t),_=rx(s),m=r.createProgram(),p,v,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(dr).join(`
`),p.length>0&&(p+=`
`),v=[f,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(dr).join(`
`),v.length>0&&(v+=`
`)):(p=[wu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(dr).join(`
`),v=[f,wu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Nn?"#define TONE_MAPPING":"",t.toneMapping!==Nn?je.tonemapping_pars_fragment:"",t.toneMapping!==Nn?tx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,ex("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(dr).join(`
`)),o=nl(o),o=bu(o,t),o=Mu(o,t),a=nl(a),a=bu(a,t),a=Mu(a,t),o=Su(o),a=Su(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,v=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===Vc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Vc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);let b=x+p+o,E=x+v+a,S=yu(r,r.VERTEX_SHADER,b),A=yu(r,r.FRAGMENT_SHADER,E);r.attachShader(m,S),r.attachShader(m,A),t.index0AttributeName!==void 0?r.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(m,0,"position"),r.linkProgram(m);function C(z){if(i.debug.checkShaderErrors){let Y=r.getProgramInfoLog(m).trim(),L=r.getShaderInfoLog(S).trim(),O=r.getShaderInfoLog(A).trim(),H=!0,q=!0;if(r.getProgramParameter(m,r.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,m,S,A);else{let Z=vu(r,S,"vertex"),X=vu(r,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(m,r.VALIDATE_STATUS)+`

Program Info Log: `+Y+`
`+Z+`
`+X)}else Y!==""?console.warn("THREE.WebGLProgram: Program Info Log:",Y):(L===""||O==="")&&(q=!1);q&&(z.diagnostics={runnable:H,programLog:Y,vertexShader:{log:L,prefix:p},fragmentShader:{log:O,prefix:v}})}r.deleteShader(S),r.deleteShader(A),y=new gr(r,m),M=sx(r,m)}let y;this.getUniforms=function(){return y===void 0&&C(this),y};let M;this.getAttributes=function(){return M===void 0&&C(this),M};let D=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=r.getProgramParameter(m,Jg)),D},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=$g++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=S,this.fragmentShader=A,this}var xx=0,il=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new rl(e),t.set(e,n)),n}},rl=class{constructor(e){this.id=xx++,this.code=e,this.usedTimes=0}};function _x(i,e,t,n,r,s,o){let a=new lo,l=new il,c=[],u=r.isWebGL2,h=r.logarithmicDepthBuffer,d=r.vertexTextures,f=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(y){return y===0?"uv":`uv${y}`}function m(y,M,D,z,Y){let L=z.fog,O=Y.geometry,H=y.isMeshStandardMaterial?z.environment:null,q=(y.isMeshStandardMaterial?t:e).get(y.envMap||H),Z=q&&q.mapping===Po?q.image.height:null,X=g[y.type];y.precision!==null&&(f=r.getMaxPrecision(y.precision),f!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",f,"instead."));let ie=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Q=ie!==void 0?ie.length:0,ue=0;O.morphAttributes.position!==void 0&&(ue=1),O.morphAttributes.normal!==void 0&&(ue=2),O.morphAttributes.color!==void 0&&(ue=3);let V,ee,ve,Pe;if(X){let Et=Un[X];V=Et.vertexShader,ee=Et.fragmentShader}else V=y.vertexShader,ee=y.fragmentShader,l.update(y),ve=l.getVertexShaderID(y),Pe=l.getFragmentShaderID(y);let ge=i.getRenderTarget(),Oe=Y.isInstancedMesh===!0,Fe=Y.isBatchedMesh===!0,Ee=!!y.map,pe=!!y.matcap,P=!!q,ce=!!y.aoMap,K=!!y.lightMap,ae=!!y.bumpMap,$=!!y.normalMap,Ae=!!y.displacementMap,fe=!!y.emissiveMap,T=!!y.metalnessMap,w=!!y.roughnessMap,F=y.anisotropy>0,j=y.clearcoat>0,re=y.iridescence>0,ne=y.sheen>0,Se=y.transmission>0,xe=F&&!!y.anisotropyMap,we=j&&!!y.clearcoatMap,Ne=j&&!!y.clearcoatNormalMap,Ke=j&&!!y.clearcoatRoughnessMap,se=re&&!!y.iridescenceMap,it=re&&!!y.iridescenceThicknessMap,Qe=ne&&!!y.sheenColorMap,Xe=ne&&!!y.sheenRoughnessMap,Ie=!!y.specularMap,Me=!!y.specularColorMap,Ye=!!y.specularIntensityMap,st=Se&&!!y.transmissionMap,ht=Se&&!!y.thicknessMap,$e=!!y.gradientMap,de=!!y.alphaMap,U=y.alphaTest>0,_e=!!y.alphaHash,ye=!!y.extensions,Be=!!O.attributes.uv1,ze=!!O.attributes.uv2,at=!!O.attributes.uv3,rt=Nn;return y.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&(rt=i.toneMapping),{isWebGL2:u,shaderID:X,shaderType:y.type,shaderName:y.name,vertexShader:V,fragmentShader:ee,defines:y.defines,customVertexShaderID:ve,customFragmentShaderID:Pe,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:f,batching:Fe,instancing:Oe,instancingColor:Oe&&Y.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:ge===null?i.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:$n,map:Ee,matcap:pe,envMap:P,envMapMode:P&&q.mapping,envMapCubeUVHeight:Z,aoMap:ce,lightMap:K,bumpMap:ae,normalMap:$,displacementMap:d&&Ae,emissiveMap:fe,normalMapObjectSpace:$&&y.normalMapType===Of,normalMapTangentSpace:$&&y.normalMapType===Ul,metalnessMap:T,roughnessMap:w,anisotropy:F,anisotropyMap:xe,clearcoat:j,clearcoatMap:we,clearcoatNormalMap:Ne,clearcoatRoughnessMap:Ke,iridescence:re,iridescenceMap:se,iridescenceThicknessMap:it,sheen:ne,sheenColorMap:Qe,sheenRoughnessMap:Xe,specularMap:Ie,specularColorMap:Me,specularIntensityMap:Ye,transmission:Se,transmissionMap:st,thicknessMap:ht,gradientMap:$e,opaque:y.transparent===!1&&y.blending===pr,alphaMap:de,alphaTest:U,alphaHash:_e,combine:y.combine,mapUv:Ee&&_(y.map.channel),aoMapUv:ce&&_(y.aoMap.channel),lightMapUv:K&&_(y.lightMap.channel),bumpMapUv:ae&&_(y.bumpMap.channel),normalMapUv:$&&_(y.normalMap.channel),displacementMapUv:Ae&&_(y.displacementMap.channel),emissiveMapUv:fe&&_(y.emissiveMap.channel),metalnessMapUv:T&&_(y.metalnessMap.channel),roughnessMapUv:w&&_(y.roughnessMap.channel),anisotropyMapUv:xe&&_(y.anisotropyMap.channel),clearcoatMapUv:we&&_(y.clearcoatMap.channel),clearcoatNormalMapUv:Ne&&_(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ke&&_(y.clearcoatRoughnessMap.channel),iridescenceMapUv:se&&_(y.iridescenceMap.channel),iridescenceThicknessMapUv:it&&_(y.iridescenceThicknessMap.channel),sheenColorMapUv:Qe&&_(y.sheenColorMap.channel),sheenRoughnessMapUv:Xe&&_(y.sheenRoughnessMap.channel),specularMapUv:Ie&&_(y.specularMap.channel),specularColorMapUv:Me&&_(y.specularColorMap.channel),specularIntensityMapUv:Ye&&_(y.specularIntensityMap.channel),transmissionMapUv:st&&_(y.transmissionMap.channel),thicknessMapUv:ht&&_(y.thicknessMap.channel),alphaMapUv:de&&_(y.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&($||F),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,vertexUv1s:Be,vertexUv2s:ze,vertexUv3s:at,pointsUvs:Y.isPoints===!0&&!!O.attributes.uv&&(Ee||de),fog:!!L,useFog:y.fog===!0,fogExp2:L&&L.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:Y.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:ue,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:i.shadowMap.enabled&&D.length>0,shadowMapType:i.shadowMap.type,toneMapping:rt,useLegacyLights:i._useLegacyLights,decodeVideoTexture:Ee&&y.map.isVideoTexture===!0&&ct.getTransfer(y.map.colorSpace)===mt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===mn,flipSided:y.side===Lt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionDerivatives:ye&&y.extensions.derivatives===!0,extensionFragDepth:ye&&y.extensions.fragDepth===!0,extensionDrawBuffers:ye&&y.extensions.drawBuffers===!0,extensionShaderTextureLOD:ye&&y.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ye&&y.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:u||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()}}function p(y){let M=[];if(y.shaderID?M.push(y.shaderID):(M.push(y.customVertexShaderID),M.push(y.customFragmentShaderID)),y.defines!==void 0)for(let D in y.defines)M.push(D),M.push(y.defines[D]);return y.isRawShaderMaterial===!1&&(v(M,y),x(M,y),M.push(i.outputColorSpace)),M.push(y.customProgramCacheKey),M.join()}function v(y,M){y.push(M.precision),y.push(M.outputColorSpace),y.push(M.envMapMode),y.push(M.envMapCubeUVHeight),y.push(M.mapUv),y.push(M.alphaMapUv),y.push(M.lightMapUv),y.push(M.aoMapUv),y.push(M.bumpMapUv),y.push(M.normalMapUv),y.push(M.displacementMapUv),y.push(M.emissiveMapUv),y.push(M.metalnessMapUv),y.push(M.roughnessMapUv),y.push(M.anisotropyMapUv),y.push(M.clearcoatMapUv),y.push(M.clearcoatNormalMapUv),y.push(M.clearcoatRoughnessMapUv),y.push(M.iridescenceMapUv),y.push(M.iridescenceThicknessMapUv),y.push(M.sheenColorMapUv),y.push(M.sheenRoughnessMapUv),y.push(M.specularMapUv),y.push(M.specularColorMapUv),y.push(M.specularIntensityMapUv),y.push(M.transmissionMapUv),y.push(M.thicknessMapUv),y.push(M.combine),y.push(M.fogExp2),y.push(M.sizeAttenuation),y.push(M.morphTargetsCount),y.push(M.morphAttributeCount),y.push(M.numDirLights),y.push(M.numPointLights),y.push(M.numSpotLights),y.push(M.numSpotLightMaps),y.push(M.numHemiLights),y.push(M.numRectAreaLights),y.push(M.numDirLightShadows),y.push(M.numPointLightShadows),y.push(M.numSpotLightShadows),y.push(M.numSpotLightShadowsWithMaps),y.push(M.numLightProbes),y.push(M.shadowMapType),y.push(M.toneMapping),y.push(M.numClippingPlanes),y.push(M.numClipIntersection),y.push(M.depthPacking)}function x(y,M){a.disableAll(),M.isWebGL2&&a.enable(0),M.supportsVertexTextures&&a.enable(1),M.instancing&&a.enable(2),M.instancingColor&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),y.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.skinning&&a.enable(4),M.morphTargets&&a.enable(5),M.morphNormals&&a.enable(6),M.morphColors&&a.enable(7),M.premultipliedAlpha&&a.enable(8),M.shadowMapEnabled&&a.enable(9),M.useLegacyLights&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),y.push(a.mask)}function b(y){let M=g[y.type],D;if(M){let z=Un[M];D=ap.clone(z.uniforms)}else D=y.uniforms;return D}function E(y,M){let D;for(let z=0,Y=c.length;z<Y;z++){let L=c[z];if(L.cacheKey===M){D=L,++D.usedTimes;break}}return D===void 0&&(D=new gx(i,M,y,s),c.push(D)),D}function S(y){if(--y.usedTimes===0){let M=c.indexOf(y);c[M]=c[c.length-1],c.pop(),y.destroy()}}function A(y){l.remove(y)}function C(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:b,acquireProgram:E,releaseProgram:S,releaseShaderCache:A,programs:c,dispose:C}}function yx(){let i=new WeakMap;function e(s){let o=i.get(s);return o===void 0&&(o={},i.set(s,o)),o}function t(s){i.delete(s)}function n(s,o,a){i.get(s)[o]=a}function r(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:r}}function vx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Eu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Tu(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(h,d,f,g,_,m){let p=i[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),e++,p}function a(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?r.push(p):t.push(p)}function l(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?r.unshift(p):t.unshift(p)}function c(h,d){t.length>1&&t.sort(h||vx),n.length>1&&n.sort(d||Eu),r.length>1&&r.sort(d||Eu)}function u(){for(let h=e,d=i.length;h<d;h++){let f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function bx(){let i=new WeakMap;function e(n,r){let s=i.get(n),o;return s===void 0?(o=new Tu,i.set(n,[o])):r>=s.length?(o=new Tu,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Mx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Ze};break;case"SpotLight":t={position:new I,direction:new I,color:new Ze,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Ze,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Ze,groundColor:new Ze};break;case"RectAreaLight":t={color:new Ze,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function Sx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var wx=0;function Ex(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Tx(i,e){let t=new Mx,n=Sx(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)r.probe.push(new I);let s=new I,o=new dt,a=new dt;function l(u,h){let d=0,f=0,g=0;for(let z=0;z<9;z++)r.probe[z].set(0,0,0);let _=0,m=0,p=0,v=0,x=0,b=0,E=0,S=0,A=0,C=0,y=0;u.sort(Ex);let M=h===!0?Math.PI:1;for(let z=0,Y=u.length;z<Y;z++){let L=u[z],O=L.color,H=L.intensity,q=L.distance,Z=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)d+=O.r*H*M,f+=O.g*H*M,g+=O.b*H*M;else if(L.isLightProbe){for(let X=0;X<9;X++)r.probe[X].addScaledVector(L.sh.coefficients[X],H);y++}else if(L.isDirectionalLight){let X=t.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity*M),L.castShadow){let ie=L.shadow,Q=n.get(L);Q.shadowBias=ie.bias,Q.shadowNormalBias=ie.normalBias,Q.shadowRadius=ie.radius,Q.shadowMapSize=ie.mapSize,r.directionalShadow[_]=Q,r.directionalShadowMap[_]=Z,r.directionalShadowMatrix[_]=L.shadow.matrix,b++}r.directional[_]=X,_++}else if(L.isSpotLight){let X=t.get(L);X.position.setFromMatrixPosition(L.matrixWorld),X.color.copy(O).multiplyScalar(H*M),X.distance=q,X.coneCos=Math.cos(L.angle),X.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),X.decay=L.decay,r.spot[p]=X;let ie=L.shadow;if(L.map&&(r.spotLightMap[A]=L.map,A++,ie.updateMatrices(L),L.castShadow&&C++),r.spotLightMatrix[p]=ie.matrix,L.castShadow){let Q=n.get(L);Q.shadowBias=ie.bias,Q.shadowNormalBias=ie.normalBias,Q.shadowRadius=ie.radius,Q.shadowMapSize=ie.mapSize,r.spotShadow[p]=Q,r.spotShadowMap[p]=Z,S++}p++}else if(L.isRectAreaLight){let X=t.get(L);X.color.copy(O).multiplyScalar(H),X.halfWidth.set(L.width*.5,0,0),X.halfHeight.set(0,L.height*.5,0),r.rectArea[v]=X,v++}else if(L.isPointLight){let X=t.get(L);if(X.color.copy(L.color).multiplyScalar(L.intensity*M),X.distance=L.distance,X.decay=L.decay,L.castShadow){let ie=L.shadow,Q=n.get(L);Q.shadowBias=ie.bias,Q.shadowNormalBias=ie.normalBias,Q.shadowRadius=ie.radius,Q.shadowMapSize=ie.mapSize,Q.shadowCameraNear=ie.camera.near,Q.shadowCameraFar=ie.camera.far,r.pointShadow[m]=Q,r.pointShadowMap[m]=Z,r.pointShadowMatrix[m]=L.shadow.matrix,E++}r.point[m]=X,m++}else if(L.isHemisphereLight){let X=t.get(L);X.skyColor.copy(L.color).multiplyScalar(H*M),X.groundColor.copy(L.groundColor).multiplyScalar(H*M),r.hemi[x]=X,x++}}v>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=me.LTC_FLOAT_1,r.rectAreaLTC2=me.LTC_FLOAT_2):(r.rectAreaLTC1=me.LTC_HALF_1,r.rectAreaLTC2=me.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=me.LTC_FLOAT_1,r.rectAreaLTC2=me.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=me.LTC_HALF_1,r.rectAreaLTC2=me.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=d,r.ambient[1]=f,r.ambient[2]=g;let D=r.hash;(D.directionalLength!==_||D.pointLength!==m||D.spotLength!==p||D.rectAreaLength!==v||D.hemiLength!==x||D.numDirectionalShadows!==b||D.numPointShadows!==E||D.numSpotShadows!==S||D.numSpotMaps!==A||D.numLightProbes!==y)&&(r.directional.length=_,r.spot.length=p,r.rectArea.length=v,r.point.length=m,r.hemi.length=x,r.directionalShadow.length=b,r.directionalShadowMap.length=b,r.pointShadow.length=E,r.pointShadowMap.length=E,r.spotShadow.length=S,r.spotShadowMap.length=S,r.directionalShadowMatrix.length=b,r.pointShadowMatrix.length=E,r.spotLightMatrix.length=S+A-C,r.spotLightMap.length=A,r.numSpotLightShadowsWithMaps=C,r.numLightProbes=y,D.directionalLength=_,D.pointLength=m,D.spotLength=p,D.rectAreaLength=v,D.hemiLength=x,D.numDirectionalShadows=b,D.numPointShadows=E,D.numSpotShadows=S,D.numSpotMaps=A,D.numLightProbes=y,r.version=wx++)}function c(u,h){let d=0,f=0,g=0,_=0,m=0,p=h.matrixWorldInverse;for(let v=0,x=u.length;v<x;v++){let b=u[v];if(b.isDirectionalLight){let E=r.directional[d];E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),d++}else if(b.isSpotLight){let E=r.spot[g];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),g++}else if(b.isRectAreaLight){let E=r.rectArea[_];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),a.identity(),o.copy(b.matrixWorld),o.premultiply(p),a.extractRotation(o),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),_++}else if(b.isPointLight){let E=r.point[f];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),f++}else if(b.isHemisphereLight){let E=r.hemi[m];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(p),m++}}}return{setup:l,setupView:c,state:r}}function Au(i,e){let t=new Tx(i,e),n=[],r=[];function s(){n.length=0,r.length=0}function o(h){n.push(h)}function a(h){r.push(h)}function l(h){t.setup(n,h)}function c(h){t.setupView(n,h)}return{init:s,state:{lightsArray:n,shadowsArray:r,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function Ax(i,e){let t=new WeakMap;function n(s,o=0){let a=t.get(s),l;return a===void 0?(l=new Au(i,e),t.set(s,[l])):o>=a.length?(l=new Au(i,e),a.push(l)):l=a[o],l}function r(){t=new WeakMap}return{get:n,dispose:r}}var sl=class extends Qn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Uf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ol=class extends Qn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},Rx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Cx=`uniform sampler2D shadow_pass;
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
}`;function Px(i,e,t){let n=new jr,r=new J,s=new J,o=new _t,a=new sl({depthPacking:Nf}),l=new ol,c={},u=t.maxTextureSize,h={[pi]:Lt,[Lt]:pi,[mn]:mn},d=new _n({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new J},radius:{value:4}},vertexShader:Rx,fragmentShader:Cx}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new At;g.setAttribute("position",new qt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new le(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ku;let p=this.type;this.render=function(S,A,C){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;let y=i.getRenderTarget(),M=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),z=i.state;z.setBlending(hi),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let Y=p!==qn&&this.type===qn,L=p===qn&&this.type!==qn;for(let O=0,H=S.length;O<H;O++){let q=S[O],Z=q.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",q,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;r.copy(Z.mapSize);let X=Z.getFrameExtents();if(r.multiply(X),s.copy(Z.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/X.x),r.x=s.x*X.x,Z.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/X.y),r.y=s.y*X.y,Z.mapSize.y=s.y)),Z.map===null||Y===!0||L===!0){let Q=this.type!==qn?{minFilter:$t,magFilter:$t}:{};Z.map!==null&&Z.map.dispose(),Z.map=new tn(r.x,r.y,Q),Z.map.texture.name=q.name+".shadowMap",Z.camera.updateProjectionMatrix()}i.setRenderTarget(Z.map),i.clear();let ie=Z.getViewportCount();for(let Q=0;Q<ie;Q++){let ue=Z.getViewport(Q);o.set(s.x*ue.x,s.y*ue.y,s.x*ue.z,s.y*ue.w),z.viewport(o),Z.updateMatrices(q,Q),n=Z.getFrustum(),b(A,C,Z.camera,q,this.type)}Z.isPointLightShadow!==!0&&this.type===qn&&v(Z,C),Z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(y,M,D)};function v(S,A){let C=e.update(_);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new tn(r.x,r.y)),d.uniforms.shadow_pass.value=S.map.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(A,null,C,d,_,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(A,null,C,f,_,null)}function x(S,A,C,y){let M=null,D=C.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(D!==void 0)M=D;else if(M=C.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){let z=M.uuid,Y=A.uuid,L=c[z];L===void 0&&(L={},c[z]=L);let O=L[Y];O===void 0&&(O=M.clone(),L[Y]=O,A.addEventListener("dispose",E)),M=O}if(M.visible=A.visible,M.wireframe=A.wireframe,y===qn?M.side=A.shadowSide!==null?A.shadowSide:A.side:M.side=A.shadowSide!==null?A.shadowSide:h[A.side],M.alphaMap=A.alphaMap,M.alphaTest=A.alphaTest,M.map=A.map,M.clipShadows=A.clipShadows,M.clippingPlanes=A.clippingPlanes,M.clipIntersection=A.clipIntersection,M.displacementMap=A.displacementMap,M.displacementScale=A.displacementScale,M.displacementBias=A.displacementBias,M.wireframeLinewidth=A.wireframeLinewidth,M.linewidth=A.linewidth,C.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let z=i.properties.get(M);z.light=C}return M}function b(S,A,C,y,M){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&M===qn)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,S.matrixWorld);let Y=e.update(S),L=S.material;if(Array.isArray(L)){let O=Y.groups;for(let H=0,q=O.length;H<q;H++){let Z=O[H],X=L[Z.materialIndex];if(X&&X.visible){let ie=x(S,X,y,M);S.onBeforeShadow(i,S,A,C,Y,ie,Z),i.renderBufferDirect(C,null,Y,ie,S,Z),S.onAfterShadow(i,S,A,C,Y,ie,Z)}}}else if(L.visible){let O=x(S,L,y,M);S.onBeforeShadow(i,S,A,C,Y,O,null),i.renderBufferDirect(C,null,Y,O,S,null),S.onAfterShadow(i,S,A,C,Y,O,null)}}let z=S.children;for(let Y=0,L=z.length;Y<L;Y++)b(z[Y],A,C,y,M)}function E(S){S.target.removeEventListener("dispose",E);for(let C in c){let y=c[C],M=S.target.uuid;M in y&&(y[M].dispose(),delete y[M])}}}function Ix(i,e,t){let n=t.isWebGL2;function r(){let U=!1,_e=new _t,ye=null,Be=new _t(0,0,0,0);return{setMask:function(ze){ye!==ze&&!U&&(i.colorMask(ze,ze,ze,ze),ye=ze)},setLocked:function(ze){U=ze},setClear:function(ze,at,rt,wt,Et){Et===!0&&(ze*=wt,at*=wt,rt*=wt),_e.set(ze,at,rt,wt),Be.equals(_e)===!1&&(i.clearColor(ze,at,rt,wt),Be.copy(_e))},reset:function(){U=!1,ye=null,Be.set(-1,0,0,0)}}}function s(){let U=!1,_e=null,ye=null,Be=null;return{setTest:function(ze){ze?Fe(i.DEPTH_TEST):Ee(i.DEPTH_TEST)},setMask:function(ze){_e!==ze&&!U&&(i.depthMask(ze),_e=ze)},setFunc:function(ze){if(ye!==ze){switch(ze){case df:i.depthFunc(i.NEVER);break;case ff:i.depthFunc(i.ALWAYS);break;case pf:i.depthFunc(i.LESS);break;case Js:i.depthFunc(i.LEQUAL);break;case mf:i.depthFunc(i.EQUAL);break;case gf:i.depthFunc(i.GEQUAL);break;case Pl:i.depthFunc(i.GREATER);break;case xf:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ye=ze}},setLocked:function(ze){U=ze},setClear:function(ze){Be!==ze&&(i.clearDepth(ze),Be=ze)},reset:function(){U=!1,_e=null,ye=null,Be=null}}}function o(){let U=!1,_e=null,ye=null,Be=null,ze=null,at=null,rt=null,wt=null,Et=null;return{setTest:function(lt){U||(lt?Fe(i.STENCIL_TEST):Ee(i.STENCIL_TEST))},setMask:function(lt){_e!==lt&&!U&&(i.stencilMask(lt),_e=lt)},setFunc:function(lt,zt,rn){(ye!==lt||Be!==zt||ze!==rn)&&(i.stencilFunc(lt,zt,rn),ye=lt,Be=zt,ze=rn)},setOp:function(lt,zt,rn){(at!==lt||rt!==zt||wt!==rn)&&(i.stencilOp(lt,zt,rn),at=lt,rt=zt,wt=rn)},setLocked:function(lt){U=lt},setClear:function(lt){Et!==lt&&(i.clearStencil(lt),Et=lt)},reset:function(){U=!1,_e=null,ye=null,Be=null,ze=null,at=null,rt=null,wt=null,Et=null}}}let a=new r,l=new s,c=new o,u=new WeakMap,h=new WeakMap,d={},f={},g=new WeakMap,_=[],m=null,p=!1,v=null,x=null,b=null,E=null,S=null,A=null,C=null,y=new Ze(0,0,0),M=0,D=!1,z=null,Y=null,L=null,O=null,H=null,q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Z=!1,X=0,ie=i.getParameter(i.VERSION);ie.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(ie)[1]),Z=X>=1):ie.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]),Z=X>=2);let Q=null,ue={},V=i.getParameter(i.SCISSOR_BOX),ee=i.getParameter(i.VIEWPORT),ve=new _t().fromArray(V),Pe=new _t().fromArray(ee);function ge(U,_e,ye,Be){let ze=new Uint8Array(4),at=i.createTexture();i.bindTexture(U,at),i.texParameteri(U,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(U,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let rt=0;rt<ye;rt++)n&&(U===i.TEXTURE_3D||U===i.TEXTURE_2D_ARRAY)?i.texImage3D(_e,0,i.RGBA,1,1,Be,0,i.RGBA,i.UNSIGNED_BYTE,ze):i.texImage2D(_e+rt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ze);return at}let Oe={};Oe[i.TEXTURE_2D]=ge(i.TEXTURE_2D,i.TEXTURE_2D,1),Oe[i.TEXTURE_CUBE_MAP]=ge(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Oe[i.TEXTURE_2D_ARRAY]=ge(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Oe[i.TEXTURE_3D]=ge(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),Fe(i.DEPTH_TEST),l.setFunc(Js),fe(!1),T(lc),Fe(i.CULL_FACE),$(hi);function Fe(U){d[U]!==!0&&(i.enable(U),d[U]=!0)}function Ee(U){d[U]!==!1&&(i.disable(U),d[U]=!1)}function pe(U,_e){return f[U]!==_e?(i.bindFramebuffer(U,_e),f[U]=_e,n&&(U===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=_e),U===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=_e)),!0):!1}function P(U,_e){let ye=_,Be=!1;if(U)if(ye=g.get(_e),ye===void 0&&(ye=[],g.set(_e,ye)),U.isWebGLMultipleRenderTargets){let ze=U.texture;if(ye.length!==ze.length||ye[0]!==i.COLOR_ATTACHMENT0){for(let at=0,rt=ze.length;at<rt;at++)ye[at]=i.COLOR_ATTACHMENT0+at;ye.length=ze.length,Be=!0}}else ye[0]!==i.COLOR_ATTACHMENT0&&(ye[0]=i.COLOR_ATTACHMENT0,Be=!0);else ye[0]!==i.BACK&&(ye[0]=i.BACK,Be=!0);Be&&(t.isWebGL2?i.drawBuffers(ye):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(ye))}function ce(U){return m!==U?(i.useProgram(U),m=U,!0):!1}let K={[Ti]:i.FUNC_ADD,[Jd]:i.FUNC_SUBTRACT,[$d]:i.FUNC_REVERSE_SUBTRACT};if(n)K[hc]=i.MIN,K[dc]=i.MAX;else{let U=e.get("EXT_blend_minmax");U!==null&&(K[hc]=U.MIN_EXT,K[dc]=U.MAX_EXT)}let ae={[jd]:i.ZERO,[Qd]:i.ONE,[ef]:i.SRC_COLOR,[ka]:i.SRC_ALPHA,[af]:i.SRC_ALPHA_SATURATE,[sf]:i.DST_COLOR,[nf]:i.DST_ALPHA,[tf]:i.ONE_MINUS_SRC_COLOR,[Ba]:i.ONE_MINUS_SRC_ALPHA,[of]:i.ONE_MINUS_DST_COLOR,[rf]:i.ONE_MINUS_DST_ALPHA,[lf]:i.CONSTANT_COLOR,[cf]:i.ONE_MINUS_CONSTANT_COLOR,[uf]:i.CONSTANT_ALPHA,[hf]:i.ONE_MINUS_CONSTANT_ALPHA};function $(U,_e,ye,Be,ze,at,rt,wt,Et,lt){if(U===hi){p===!0&&(Ee(i.BLEND),p=!1);return}if(p===!1&&(Fe(i.BLEND),p=!0),U!==Kd){if(U!==v||lt!==D){if((x!==Ti||S!==Ti)&&(i.blendEquation(i.FUNC_ADD),x=Ti,S=Ti),lt)switch(U){case pr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Li:i.blendFunc(i.ONE,i.ONE);break;case cc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case uc:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case pr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Li:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case cc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case uc:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}b=null,E=null,A=null,C=null,y.set(0,0,0),M=0,v=U,D=lt}return}ze=ze||_e,at=at||ye,rt=rt||Be,(_e!==x||ze!==S)&&(i.blendEquationSeparate(K[_e],K[ze]),x=_e,S=ze),(ye!==b||Be!==E||at!==A||rt!==C)&&(i.blendFuncSeparate(ae[ye],ae[Be],ae[at],ae[rt]),b=ye,E=Be,A=at,C=rt),(wt.equals(y)===!1||Et!==M)&&(i.blendColor(wt.r,wt.g,wt.b,Et),y.copy(wt),M=Et),v=U,D=!1}function Ae(U,_e){U.side===mn?Ee(i.CULL_FACE):Fe(i.CULL_FACE);let ye=U.side===Lt;_e&&(ye=!ye),fe(ye),U.blending===pr&&U.transparent===!1?$(hi):$(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),l.setFunc(U.depthFunc),l.setTest(U.depthTest),l.setMask(U.depthWrite),a.setMask(U.colorWrite);let Be=U.stencilWrite;c.setTest(Be),Be&&(c.setMask(U.stencilWriteMask),c.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),c.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),F(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?Fe(i.SAMPLE_ALPHA_TO_COVERAGE):Ee(i.SAMPLE_ALPHA_TO_COVERAGE)}function fe(U){z!==U&&(U?i.frontFace(i.CW):i.frontFace(i.CCW),z=U)}function T(U){U!==Yd?(Fe(i.CULL_FACE),U!==Y&&(U===lc?i.cullFace(i.BACK):U===Zd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ee(i.CULL_FACE),Y=U}function w(U){U!==L&&(Z&&i.lineWidth(U),L=U)}function F(U,_e,ye){U?(Fe(i.POLYGON_OFFSET_FILL),(O!==_e||H!==ye)&&(i.polygonOffset(_e,ye),O=_e,H=ye)):Ee(i.POLYGON_OFFSET_FILL)}function j(U){U?Fe(i.SCISSOR_TEST):Ee(i.SCISSOR_TEST)}function re(U){U===void 0&&(U=i.TEXTURE0+q-1),Q!==U&&(i.activeTexture(U),Q=U)}function ne(U,_e,ye){ye===void 0&&(Q===null?ye=i.TEXTURE0+q-1:ye=Q);let Be=ue[ye];Be===void 0&&(Be={type:void 0,texture:void 0},ue[ye]=Be),(Be.type!==U||Be.texture!==_e)&&(Q!==ye&&(i.activeTexture(ye),Q=ye),i.bindTexture(U,_e||Oe[U]),Be.type=U,Be.texture=_e)}function Se(){let U=ue[Q];U!==void 0&&U.type!==void 0&&(i.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function xe(){try{i.compressedTexImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function we(){try{i.compressedTexImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ne(){try{i.texSubImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ke(){try{i.texSubImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function se(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function it(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Qe(){try{i.texStorage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Xe(){try{i.texStorage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ie(){try{i.texImage2D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Me(){try{i.texImage3D.apply(i,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Ye(U){ve.equals(U)===!1&&(i.scissor(U.x,U.y,U.z,U.w),ve.copy(U))}function st(U){Pe.equals(U)===!1&&(i.viewport(U.x,U.y,U.z,U.w),Pe.copy(U))}function ht(U,_e){let ye=h.get(_e);ye===void 0&&(ye=new WeakMap,h.set(_e,ye));let Be=ye.get(U);Be===void 0&&(Be=i.getUniformBlockIndex(_e,U.name),ye.set(U,Be))}function $e(U,_e){let Be=h.get(_e).get(U);u.get(_e)!==Be&&(i.uniformBlockBinding(_e,Be,U.__bindingPointIndex),u.set(_e,Be))}function de(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},Q=null,ue={},f={},g=new WeakMap,_=[],m=null,p=!1,v=null,x=null,b=null,E=null,S=null,A=null,C=null,y=new Ze(0,0,0),M=0,D=!1,z=null,Y=null,L=null,O=null,H=null,ve.set(0,0,i.canvas.width,i.canvas.height),Pe.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:Fe,disable:Ee,bindFramebuffer:pe,drawBuffers:P,useProgram:ce,setBlending:$,setMaterial:Ae,setFlipSided:fe,setCullFace:T,setLineWidth:w,setPolygonOffset:F,setScissorTest:j,activeTexture:re,bindTexture:ne,unbindTexture:Se,compressedTexImage2D:xe,compressedTexImage3D:we,texImage2D:Ie,texImage3D:Me,updateUBOMapping:ht,uniformBlockBinding:$e,texStorage2D:Qe,texStorage3D:Xe,texSubImage2D:Ne,texSubImage3D:Ke,compressedTexSubImage2D:se,compressedTexSubImage3D:it,scissor:Ye,viewport:st,reset:de}}function Lx(i,e,t,n,r,s,o){let a=r.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,w){return f?new OffscreenCanvas(T,w):io("canvas")}function _(T,w,F,j){let re=1;if((T.width>j||T.height>j)&&(re=j/Math.max(T.width,T.height)),re<1||w===!0)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap){let ne=w?Ya:Math.floor,Se=ne(re*T.width),xe=ne(re*T.height);h===void 0&&(h=g(Se,xe));let we=F?g(Se,xe):h;return we.width=Se,we.height=xe,we.getContext("2d").drawImage(T,0,0,Se,xe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+T.width+"x"+T.height+") to ("+Se+"x"+xe+")."),we}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+T.width+"x"+T.height+")."),T;return T}function m(T){return Wc(T.width)&&Wc(T.height)}function p(T){return a?!1:T.wrapS!==Ht||T.wrapT!==Ht||T.minFilter!==$t&&T.minFilter!==pn}function v(T,w){return T.generateMipmaps&&w&&T.minFilter!==$t&&T.minFilter!==pn}function x(T){i.generateMipmap(T)}function b(T,w,F,j,re=!1){if(a===!1)return w;if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let ne=w;if(w===i.RED&&(F===i.FLOAT&&(ne=i.R32F),F===i.HALF_FLOAT&&(ne=i.R16F),F===i.UNSIGNED_BYTE&&(ne=i.R8)),w===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(ne=i.R8UI),F===i.UNSIGNED_SHORT&&(ne=i.R16UI),F===i.UNSIGNED_INT&&(ne=i.R32UI),F===i.BYTE&&(ne=i.R8I),F===i.SHORT&&(ne=i.R16I),F===i.INT&&(ne=i.R32I)),w===i.RG&&(F===i.FLOAT&&(ne=i.RG32F),F===i.HALF_FLOAT&&(ne=i.RG16F),F===i.UNSIGNED_BYTE&&(ne=i.RG8)),w===i.RGBA){let Se=re?Qs:ct.getTransfer(j);F===i.FLOAT&&(ne=i.RGBA32F),F===i.HALF_FLOAT&&(ne=i.RGBA16F),F===i.UNSIGNED_BYTE&&(ne=Se===mt?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(ne=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(ne=i.RGB5_A1)}return(ne===i.R16F||ne===i.R32F||ne===i.RG16F||ne===i.RG32F||ne===i.RGBA16F||ne===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ne}function E(T,w,F){return v(T,F)===!0||T.isFramebufferTexture&&T.minFilter!==$t&&T.minFilter!==pn?Math.log2(Math.max(w.width,w.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?w.mipmaps.length:1}function S(T){return T===$t||T===fc||T===na?i.NEAREST:i.LINEAR}function A(T){let w=T.target;w.removeEventListener("dispose",A),y(w),w.isVideoTexture&&u.delete(w)}function C(T){let w=T.target;w.removeEventListener("dispose",C),D(w)}function y(T){let w=n.get(T);if(w.__webglInit===void 0)return;let F=T.source,j=d.get(F);if(j){let re=j[w.__cacheKey];re.usedTimes--,re.usedTimes===0&&M(T),Object.keys(j).length===0&&d.delete(F)}n.remove(T)}function M(T){let w=n.get(T);i.deleteTexture(w.__webglTexture);let F=T.source,j=d.get(F);delete j[w.__cacheKey],o.memory.textures--}function D(T){let w=T.texture,F=n.get(T),j=n.get(w);if(j.__webglTexture!==void 0&&(i.deleteTexture(j.__webglTexture),o.memory.textures--),T.depthTexture&&T.depthTexture.dispose(),T.isWebGLCubeRenderTarget)for(let re=0;re<6;re++){if(Array.isArray(F.__webglFramebuffer[re]))for(let ne=0;ne<F.__webglFramebuffer[re].length;ne++)i.deleteFramebuffer(F.__webglFramebuffer[re][ne]);else i.deleteFramebuffer(F.__webglFramebuffer[re]);F.__webglDepthbuffer&&i.deleteRenderbuffer(F.__webglDepthbuffer[re])}else{if(Array.isArray(F.__webglFramebuffer))for(let re=0;re<F.__webglFramebuffer.length;re++)i.deleteFramebuffer(F.__webglFramebuffer[re]);else i.deleteFramebuffer(F.__webglFramebuffer);if(F.__webglDepthbuffer&&i.deleteRenderbuffer(F.__webglDepthbuffer),F.__webglMultisampledFramebuffer&&i.deleteFramebuffer(F.__webglMultisampledFramebuffer),F.__webglColorRenderbuffer)for(let re=0;re<F.__webglColorRenderbuffer.length;re++)F.__webglColorRenderbuffer[re]&&i.deleteRenderbuffer(F.__webglColorRenderbuffer[re]);F.__webglDepthRenderbuffer&&i.deleteRenderbuffer(F.__webglDepthRenderbuffer)}if(T.isWebGLMultipleRenderTargets)for(let re=0,ne=w.length;re<ne;re++){let Se=n.get(w[re]);Se.__webglTexture&&(i.deleteTexture(Se.__webglTexture),o.memory.textures--),n.remove(w[re])}n.remove(w),n.remove(T)}let z=0;function Y(){z=0}function L(){let T=z;return T>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+r.maxTextures),z+=1,T}function O(T){let w=[];return w.push(T.wrapS),w.push(T.wrapT),w.push(T.wrapR||0),w.push(T.magFilter),w.push(T.minFilter),w.push(T.anisotropy),w.push(T.internalFormat),w.push(T.format),w.push(T.type),w.push(T.generateMipmaps),w.push(T.premultiplyAlpha),w.push(T.flipY),w.push(T.unpackAlignment),w.push(T.colorSpace),w.join()}function H(T,w){let F=n.get(T);if(T.isVideoTexture&&Ae(T),T.isRenderTargetTexture===!1&&T.version>0&&F.__version!==T.version){let j=T.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ve(F,T,w);return}}t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+w)}function q(T,w){let F=n.get(T);if(T.version>0&&F.__version!==T.version){ve(F,T,w);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+w)}function Z(T,w){let F=n.get(T);if(T.version>0&&F.__version!==T.version){ve(F,T,w);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+w)}function X(T,w){let F=n.get(T);if(T.version>0&&F.__version!==T.version){Pe(F,T,w);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+w)}let ie={[yr]:i.REPEAT,[Ht]:i.CLAMP_TO_EDGE,[Va]:i.MIRRORED_REPEAT},Q={[$t]:i.NEAREST,[fc]:i.NEAREST_MIPMAP_NEAREST,[na]:i.NEAREST_MIPMAP_LINEAR,[pn]:i.LINEAR,[Ef]:i.LINEAR_MIPMAP_NEAREST,[$r]:i.LINEAR_MIPMAP_LINEAR},ue={[Ff]:i.NEVER,[Vf]:i.ALWAYS,[zf]:i.LESS,[$u]:i.LEQUAL,[kf]:i.EQUAL,[Hf]:i.GEQUAL,[Bf]:i.GREATER,[Gf]:i.NOTEQUAL};function V(T,w,F){if(F?(i.texParameteri(T,i.TEXTURE_WRAP_S,ie[w.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ie[w.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ie[w.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,Q[w.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,Q[w.minFilter])):(i.texParameteri(T,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(T,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(w.wrapS!==Ht||w.wrapT!==Ht)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(T,i.TEXTURE_MAG_FILTER,S(w.magFilter)),i.texParameteri(T,i.TEXTURE_MIN_FILTER,S(w.minFilter)),w.minFilter!==$t&&w.minFilter!==pn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),w.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,ue[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let j=e.get("EXT_texture_filter_anisotropic");if(w.magFilter===$t||w.minFilter!==na&&w.minFilter!==$r||w.type===ui&&e.has("OES_texture_float_linear")===!1||a===!1&&w.type===Di&&e.has("OES_texture_half_float_linear")===!1)return;(w.anisotropy>1||n.get(w).__currentAnisotropy)&&(i.texParameterf(T,j.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy)}}function ee(T,w){let F=!1;T.__webglInit===void 0&&(T.__webglInit=!0,w.addEventListener("dispose",A));let j=w.source,re=d.get(j);re===void 0&&(re={},d.set(j,re));let ne=O(w);if(ne!==T.__cacheKey){re[ne]===void 0&&(re[ne]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),re[ne].usedTimes++;let Se=re[T.__cacheKey];Se!==void 0&&(re[T.__cacheKey].usedTimes--,Se.usedTimes===0&&M(w)),T.__cacheKey=ne,T.__webglTexture=re[ne].texture}return F}function ve(T,w,F){let j=i.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),w.isData3DTexture&&(j=i.TEXTURE_3D);let re=ee(T,w),ne=w.source;t.bindTexture(j,T.__webglTexture,i.TEXTURE0+F);let Se=n.get(ne);if(ne.version!==Se.__version||re===!0){t.activeTexture(i.TEXTURE0+F);let xe=ct.getPrimaries(ct.workingColorSpace),we=w.colorSpace===gn?null:ct.getPrimaries(w.colorSpace),Ne=w.colorSpace===gn||xe===we?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,w.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,w.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ne);let Ke=p(w)&&m(w.image)===!1,se=_(w.image,Ke,!1,r.maxTextureSize);se=fe(w,se);let it=m(se)||a,Qe=s.convert(w.format,w.colorSpace),Xe=s.convert(w.type),Ie=b(w.internalFormat,Qe,Xe,w.colorSpace,w.isVideoTexture);V(j,w,it);let Me,Ye=w.mipmaps,st=a&&w.isVideoTexture!==!0&&Ie!==Yu,ht=Se.__version===void 0||re===!0,$e=E(w,se,it);if(w.isDepthTexture)Ie=i.DEPTH_COMPONENT,a?w.type===ui?Ie=i.DEPTH_COMPONENT32F:w.type===ci?Ie=i.DEPTH_COMPONENT24:w.type===Ci?Ie=i.DEPTH24_STENCIL8:Ie=i.DEPTH_COMPONENT16:w.type===ui&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),w.format===Pi&&Ie===i.DEPTH_COMPONENT&&w.type!==Dl&&w.type!==ci&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),w.type=ci,Xe=s.convert(w.type)),w.format===vr&&Ie===i.DEPTH_COMPONENT&&(Ie=i.DEPTH_STENCIL,w.type!==Ci&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),w.type=Ci,Xe=s.convert(w.type))),ht&&(st?t.texStorage2D(i.TEXTURE_2D,1,Ie,se.width,se.height):t.texImage2D(i.TEXTURE_2D,0,Ie,se.width,se.height,0,Qe,Xe,null));else if(w.isDataTexture)if(Ye.length>0&&it){st&&ht&&t.texStorage2D(i.TEXTURE_2D,$e,Ie,Ye[0].width,Ye[0].height);for(let de=0,U=Ye.length;de<U;de++)Me=Ye[de],st?t.texSubImage2D(i.TEXTURE_2D,de,0,0,Me.width,Me.height,Qe,Xe,Me.data):t.texImage2D(i.TEXTURE_2D,de,Ie,Me.width,Me.height,0,Qe,Xe,Me.data);w.generateMipmaps=!1}else st?(ht&&t.texStorage2D(i.TEXTURE_2D,$e,Ie,se.width,se.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,se.width,se.height,Qe,Xe,se.data)):t.texImage2D(i.TEXTURE_2D,0,Ie,se.width,se.height,0,Qe,Xe,se.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){st&&ht&&t.texStorage3D(i.TEXTURE_2D_ARRAY,$e,Ie,Ye[0].width,Ye[0].height,se.depth);for(let de=0,U=Ye.length;de<U;de++)Me=Ye[de],w.format!==Rn?Qe!==null?st?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,de,0,0,0,Me.width,Me.height,se.depth,Qe,Me.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,de,Ie,Me.width,Me.height,se.depth,0,Me.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):st?t.texSubImage3D(i.TEXTURE_2D_ARRAY,de,0,0,0,Me.width,Me.height,se.depth,Qe,Xe,Me.data):t.texImage3D(i.TEXTURE_2D_ARRAY,de,Ie,Me.width,Me.height,se.depth,0,Qe,Xe,Me.data)}else{st&&ht&&t.texStorage2D(i.TEXTURE_2D,$e,Ie,Ye[0].width,Ye[0].height);for(let de=0,U=Ye.length;de<U;de++)Me=Ye[de],w.format!==Rn?Qe!==null?st?t.compressedTexSubImage2D(i.TEXTURE_2D,de,0,0,Me.width,Me.height,Qe,Me.data):t.compressedTexImage2D(i.TEXTURE_2D,de,Ie,Me.width,Me.height,0,Me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):st?t.texSubImage2D(i.TEXTURE_2D,de,0,0,Me.width,Me.height,Qe,Xe,Me.data):t.texImage2D(i.TEXTURE_2D,de,Ie,Me.width,Me.height,0,Qe,Xe,Me.data)}else if(w.isDataArrayTexture)st?(ht&&t.texStorage3D(i.TEXTURE_2D_ARRAY,$e,Ie,se.width,se.height,se.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,Qe,Xe,se.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ie,se.width,se.height,se.depth,0,Qe,Xe,se.data);else if(w.isData3DTexture)st?(ht&&t.texStorage3D(i.TEXTURE_3D,$e,Ie,se.width,se.height,se.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,Qe,Xe,se.data)):t.texImage3D(i.TEXTURE_3D,0,Ie,se.width,se.height,se.depth,0,Qe,Xe,se.data);else if(w.isFramebufferTexture){if(ht)if(st)t.texStorage2D(i.TEXTURE_2D,$e,Ie,se.width,se.height);else{let de=se.width,U=se.height;for(let _e=0;_e<$e;_e++)t.texImage2D(i.TEXTURE_2D,_e,Ie,de,U,0,Qe,Xe,null),de>>=1,U>>=1}}else if(Ye.length>0&&it){st&&ht&&t.texStorage2D(i.TEXTURE_2D,$e,Ie,Ye[0].width,Ye[0].height);for(let de=0,U=Ye.length;de<U;de++)Me=Ye[de],st?t.texSubImage2D(i.TEXTURE_2D,de,0,0,Qe,Xe,Me):t.texImage2D(i.TEXTURE_2D,de,Ie,Qe,Xe,Me);w.generateMipmaps=!1}else st?(ht&&t.texStorage2D(i.TEXTURE_2D,$e,Ie,se.width,se.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,Qe,Xe,se)):t.texImage2D(i.TEXTURE_2D,0,Ie,Qe,Xe,se);v(w,it)&&x(j),Se.__version=ne.version,w.onUpdate&&w.onUpdate(w)}T.__version=w.version}function Pe(T,w,F){if(w.image.length!==6)return;let j=ee(T,w),re=w.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+F);let ne=n.get(re);if(re.version!==ne.__version||j===!0){t.activeTexture(i.TEXTURE0+F);let Se=ct.getPrimaries(ct.workingColorSpace),xe=w.colorSpace===gn?null:ct.getPrimaries(w.colorSpace),we=w.colorSpace===gn||Se===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,w.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,w.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let Ne=w.isCompressedTexture||w.image[0].isCompressedTexture,Ke=w.image[0]&&w.image[0].isDataTexture,se=[];for(let de=0;de<6;de++)!Ne&&!Ke?se[de]=_(w.image[de],!1,!0,r.maxCubemapSize):se[de]=Ke?w.image[de].image:w.image[de],se[de]=fe(w,se[de]);let it=se[0],Qe=m(it)||a,Xe=s.convert(w.format,w.colorSpace),Ie=s.convert(w.type),Me=b(w.internalFormat,Xe,Ie,w.colorSpace),Ye=a&&w.isVideoTexture!==!0,st=ne.__version===void 0||j===!0,ht=E(w,it,Qe);V(i.TEXTURE_CUBE_MAP,w,Qe);let $e;if(Ne){Ye&&st&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ht,Me,it.width,it.height);for(let de=0;de<6;de++){$e=se[de].mipmaps;for(let U=0;U<$e.length;U++){let _e=$e[U];w.format!==Rn?Xe!==null?Ye?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,U,0,0,_e.width,_e.height,Xe,_e.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,U,Me,_e.width,_e.height,0,_e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ye?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,U,0,0,_e.width,_e.height,Xe,Ie,_e.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,U,Me,_e.width,_e.height,0,Xe,Ie,_e.data)}}}else{$e=w.mipmaps,Ye&&st&&($e.length>0&&ht++,t.texStorage2D(i.TEXTURE_CUBE_MAP,ht,Me,se[0].width,se[0].height));for(let de=0;de<6;de++)if(Ke){Ye?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,se[de].width,se[de].height,Xe,Ie,se[de].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,Me,se[de].width,se[de].height,0,Xe,Ie,se[de].data);for(let U=0;U<$e.length;U++){let ye=$e[U].image[de].image;Ye?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,U+1,0,0,ye.width,ye.height,Xe,Ie,ye.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,U+1,Me,ye.width,ye.height,0,Xe,Ie,ye.data)}}else{Ye?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,Xe,Ie,se[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,Me,Xe,Ie,se[de]);for(let U=0;U<$e.length;U++){let _e=$e[U];Ye?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,U+1,0,0,Xe,Ie,_e.image[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,U+1,Me,Xe,Ie,_e.image[de])}}}v(w,Qe)&&x(i.TEXTURE_CUBE_MAP),ne.__version=re.version,w.onUpdate&&w.onUpdate(w)}T.__version=w.version}function ge(T,w,F,j,re,ne){let Se=s.convert(F.format,F.colorSpace),xe=s.convert(F.type),we=b(F.internalFormat,Se,xe,F.colorSpace);if(!n.get(w).__hasExternalTextures){let Ke=Math.max(1,w.width>>ne),se=Math.max(1,w.height>>ne);re===i.TEXTURE_3D||re===i.TEXTURE_2D_ARRAY?t.texImage3D(re,ne,we,Ke,se,w.depth,0,Se,xe,null):t.texImage2D(re,ne,we,Ke,se,0,Se,xe,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),$(w)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,re,n.get(F).__webglTexture,0,ae(w)):(re===i.TEXTURE_2D||re>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,re,n.get(F).__webglTexture,ne),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Oe(T,w,F){if(i.bindRenderbuffer(i.RENDERBUFFER,T),w.depthBuffer&&!w.stencilBuffer){let j=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(F||$(w)){let re=w.depthTexture;re&&re.isDepthTexture&&(re.type===ui?j=i.DEPTH_COMPONENT32F:re.type===ci&&(j=i.DEPTH_COMPONENT24));let ne=ae(w);$(w)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ne,j,w.width,w.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,ne,j,w.width,w.height)}else i.renderbufferStorage(i.RENDERBUFFER,j,w.width,w.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,T)}else if(w.depthBuffer&&w.stencilBuffer){let j=ae(w);F&&$(w)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,j,i.DEPTH24_STENCIL8,w.width,w.height):$(w)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,j,i.DEPTH24_STENCIL8,w.width,w.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,T)}else{let j=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let re=0;re<j.length;re++){let ne=j[re],Se=s.convert(ne.format,ne.colorSpace),xe=s.convert(ne.type),we=b(ne.internalFormat,Se,xe,ne.colorSpace),Ne=ae(w);F&&$(w)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ne,we,w.width,w.height):$(w)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ne,we,w.width,w.height):i.renderbufferStorage(i.RENDERBUFFER,we,w.width,w.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Fe(T,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(w.depthTexture).__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),H(w.depthTexture,0);let j=n.get(w.depthTexture).__webglTexture,re=ae(w);if(w.depthTexture.format===Pi)$(w)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,re):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(w.depthTexture.format===vr)$(w)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,re):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Ee(T){let w=n.get(T),F=T.isWebGLCubeRenderTarget===!0;if(T.depthTexture&&!w.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");Fe(w.__webglFramebuffer,T)}else if(F){w.__webglDepthbuffer=[];for(let j=0;j<6;j++)t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer[j]),w.__webglDepthbuffer[j]=i.createRenderbuffer(),Oe(w.__webglDepthbuffer[j],T,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer=i.createRenderbuffer(),Oe(w.__webglDepthbuffer,T,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function pe(T,w,F){let j=n.get(T);w!==void 0&&ge(j.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Ee(T)}function P(T){let w=T.texture,F=n.get(T),j=n.get(w);T.addEventListener("dispose",C),T.isWebGLMultipleRenderTargets!==!0&&(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=w.version,o.memory.textures++);let re=T.isWebGLCubeRenderTarget===!0,ne=T.isWebGLMultipleRenderTargets===!0,Se=m(T)||a;if(re){F.__webglFramebuffer=[];for(let xe=0;xe<6;xe++)if(a&&w.mipmaps&&w.mipmaps.length>0){F.__webglFramebuffer[xe]=[];for(let we=0;we<w.mipmaps.length;we++)F.__webglFramebuffer[xe][we]=i.createFramebuffer()}else F.__webglFramebuffer[xe]=i.createFramebuffer()}else{if(a&&w.mipmaps&&w.mipmaps.length>0){F.__webglFramebuffer=[];for(let xe=0;xe<w.mipmaps.length;xe++)F.__webglFramebuffer[xe]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(ne)if(r.drawBuffers){let xe=T.texture;for(let we=0,Ne=xe.length;we<Ne;we++){let Ke=n.get(xe[we]);Ke.__webglTexture===void 0&&(Ke.__webglTexture=i.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&T.samples>0&&$(T)===!1){let xe=ne?w:[w];F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let we=0;we<xe.length;we++){let Ne=xe[we];F.__webglColorRenderbuffer[we]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[we]);let Ke=s.convert(Ne.format,Ne.colorSpace),se=s.convert(Ne.type),it=b(Ne.internalFormat,Ke,se,Ne.colorSpace,T.isXRRenderTarget===!0),Qe=ae(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Qe,it,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+we,i.RENDERBUFFER,F.__webglColorRenderbuffer[we])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),Oe(F.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(re){t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),V(i.TEXTURE_CUBE_MAP,w,Se);for(let xe=0;xe<6;xe++)if(a&&w.mipmaps&&w.mipmaps.length>0)for(let we=0;we<w.mipmaps.length;we++)ge(F.__webglFramebuffer[xe][we],T,w,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,we);else ge(F.__webglFramebuffer[xe],T,w,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0);v(w,Se)&&x(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ne){let xe=T.texture;for(let we=0,Ne=xe.length;we<Ne;we++){let Ke=xe[we],se=n.get(Ke);t.bindTexture(i.TEXTURE_2D,se.__webglTexture),V(i.TEXTURE_2D,Ke,Se),ge(F.__webglFramebuffer,T,Ke,i.COLOR_ATTACHMENT0+we,i.TEXTURE_2D,0),v(Ke,Se)&&x(i.TEXTURE_2D)}t.unbindTexture()}else{let xe=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(a?xe=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(xe,j.__webglTexture),V(xe,w,Se),a&&w.mipmaps&&w.mipmaps.length>0)for(let we=0;we<w.mipmaps.length;we++)ge(F.__webglFramebuffer[we],T,w,i.COLOR_ATTACHMENT0,xe,we);else ge(F.__webglFramebuffer,T,w,i.COLOR_ATTACHMENT0,xe,0);v(w,Se)&&x(xe),t.unbindTexture()}T.depthBuffer&&Ee(T)}function ce(T){let w=m(T)||a,F=T.isWebGLMultipleRenderTargets===!0?T.texture:[T.texture];for(let j=0,re=F.length;j<re;j++){let ne=F[j];if(v(ne,w)){let Se=T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,xe=n.get(ne).__webglTexture;t.bindTexture(Se,xe),x(Se),t.unbindTexture()}}}function K(T){if(a&&T.samples>0&&$(T)===!1){let w=T.isWebGLMultipleRenderTargets?T.texture:[T.texture],F=T.width,j=T.height,re=i.COLOR_BUFFER_BIT,ne=[],Se=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=n.get(T),we=T.isWebGLMultipleRenderTargets===!0;if(we)for(let Ne=0;Ne<w.length;Ne++)t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let Ne=0;Ne<w.length;Ne++){ne.push(i.COLOR_ATTACHMENT0+Ne),T.depthBuffer&&ne.push(Se);let Ke=xe.__ignoreDepthValues!==void 0?xe.__ignoreDepthValues:!1;if(Ke===!1&&(T.depthBuffer&&(re|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&(re|=i.STENCIL_BUFFER_BIT)),we&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,xe.__webglColorRenderbuffer[Ne]),Ke===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[Se]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[Se])),we){let se=n.get(w[Ne]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,se,0)}i.blitFramebuffer(0,0,F,j,0,0,F,j,re,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ne)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),we)for(let Ne=0;Ne<w.length;Ne++){t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.RENDERBUFFER,xe.__webglColorRenderbuffer[Ne]);let Ke=n.get(w[Ne]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,xe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ne,i.TEXTURE_2D,Ke,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}}function ae(T){return Math.min(r.maxSamples,T.samples)}function $(T){let w=n.get(T);return a&&T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Ae(T){let w=o.render.frame;u.get(T)!==w&&(u.set(T,w),T.update())}function fe(T,w){let F=T.colorSpace,j=T.format,re=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||T.format===Xa||F!==$n&&F!==gn&&(ct.getTransfer(F)===mt?a===!1?e.has("EXT_sRGB")===!0&&j===Rn?(T.format=Xa,T.minFilter=pn,T.generateMipmaps=!1):w=ro.sRGBToLinear(w):(j!==Rn||re!==di)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),w}this.allocateTextureUnit=L,this.resetTextureUnits=Y,this.setTexture2D=H,this.setTexture2DArray=q,this.setTexture3D=Z,this.setTextureCube=X,this.rebindTextures=pe,this.setupRenderTarget=P,this.updateRenderTargetMipmap=ce,this.updateMultisampleRenderTarget=K,this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=$}function Dx(i,e,t){let n=t.isWebGL2;function r(s,o=gn){let a,l=ct.getTransfer(o);if(s===di)return i.UNSIGNED_BYTE;if(s===Hu)return i.UNSIGNED_SHORT_4_4_4_4;if(s===Vu)return i.UNSIGNED_SHORT_5_5_5_1;if(s===Tf)return i.BYTE;if(s===Af)return i.SHORT;if(s===Dl)return i.UNSIGNED_SHORT;if(s===Gu)return i.INT;if(s===ci)return i.UNSIGNED_INT;if(s===ui)return i.FLOAT;if(s===Di)return n?i.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(s===Rf)return i.ALPHA;if(s===Rn)return i.RGBA;if(s===Cf)return i.LUMINANCE;if(s===Pf)return i.LUMINANCE_ALPHA;if(s===Pi)return i.DEPTH_COMPONENT;if(s===vr)return i.DEPTH_STENCIL;if(s===Xa)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(s===If)return i.RED;if(s===Wu)return i.RED_INTEGER;if(s===Lf)return i.RG;if(s===Xu)return i.RG_INTEGER;if(s===qu)return i.RGBA_INTEGER;if(s===ia||s===ra||s===sa||s===oa)if(l===mt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===ia)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===ra)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===sa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===oa)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===ia)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===ra)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===sa)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===oa)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===pc||s===mc||s===gc||s===xc)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===pc)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===mc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===gc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===xc)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===Yu)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===_c||s===yc)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===_c)return l===mt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===yc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===vc||s===bc||s===Mc||s===Sc||s===wc||s===Ec||s===Tc||s===Ac||s===Rc||s===Cc||s===Pc||s===Ic||s===Lc||s===Dc)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===vc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===bc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===Mc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Sc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===wc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Ec)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Tc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Ac)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Rc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Cc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Pc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Ic)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Lc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Dc)return l===mt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===aa||s===Uc||s===Nc)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===aa)return l===mt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===Uc)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Nc)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Df||s===Oc||s===Fc||s===zc)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===aa)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Oc)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===Fc)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===zc)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Ci?n?i.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[s]!==void 0?i[s]:null}return{convert:r}}var al=class extends en{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Re=class extends Yt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Ux={type:"move"},Zr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Re,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Re,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Re,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Ux)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Re;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},ll=class extends mi{constructor(e,t){super();let n=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null,_=t.getContextAttributes(),m=null,p=null,v=[],x=[],b=new J,E=null,S=new en;S.layers.enable(1),S.viewport=new _t;let A=new en;A.layers.enable(2),A.viewport=new _t;let C=[S,A],y=new al;y.layers.enable(1),y.layers.enable(2);let M=null,D=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(V){let ee=v[V];return ee===void 0&&(ee=new Zr,v[V]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(V){let ee=v[V];return ee===void 0&&(ee=new Zr,v[V]=ee),ee.getGripSpace()},this.getHand=function(V){let ee=v[V];return ee===void 0&&(ee=new Zr,v[V]=ee),ee.getHandSpace()};function z(V){let ee=x.indexOf(V.inputSource);if(ee===-1)return;let ve=v[ee];ve!==void 0&&(ve.update(V.inputSource,V.frame,c||o),ve.dispatchEvent({type:V.type,data:V.inputSource}))}function Y(){r.removeEventListener("select",z),r.removeEventListener("selectstart",z),r.removeEventListener("selectend",z),r.removeEventListener("squeeze",z),r.removeEventListener("squeezestart",z),r.removeEventListener("squeezeend",z),r.removeEventListener("end",Y),r.removeEventListener("inputsourceschange",L);for(let V=0;V<v.length;V++){let ee=x[V];ee!==null&&(x[V]=null,v[V].disconnect(ee))}M=null,D=null,e.setRenderTarget(m),f=null,d=null,h=null,r=null,p=null,ue.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(b.width,b.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(V){s=V,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(V){a=V,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(V){c=V},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(V){if(r=V,r!==null){if(m=e.getRenderTarget(),r.addEventListener("select",z),r.addEventListener("selectstart",z),r.addEventListener("selectend",z),r.addEventListener("squeeze",z),r.addEventListener("squeezestart",z),r.addEventListener("squeezeend",z),r.addEventListener("end",Y),r.addEventListener("inputsourceschange",L),_.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(b),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let ee={antialias:r.renderState.layers===void 0?_.antialias:!0,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,ee),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),p=new tn(f.framebufferWidth,f.framebufferHeight,{format:Rn,type:di,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil})}else{let ee=null,ve=null,Pe=null;_.depth&&(Pe=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=_.stencil?vr:Pi,ve=_.stencil?Ci:ci);let ge={colorFormat:t.RGBA8,depthFormat:Pe,scaleFactor:s};h=new XRWebGLBinding(r,t),d=h.createProjectionLayer(ge),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),p=new tn(d.textureWidth,d.textureHeight,{format:Rn,type:di,depthTexture:new po(d.textureWidth,d.textureHeight,ve,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0});let Oe=e.properties.get(p);Oe.__ignoreDepthValues=d.ignoreDepthValues}p.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),ue.setContext(r),ue.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode};function L(V){for(let ee=0;ee<V.removed.length;ee++){let ve=V.removed[ee],Pe=x.indexOf(ve);Pe>=0&&(x[Pe]=null,v[Pe].disconnect(ve))}for(let ee=0;ee<V.added.length;ee++){let ve=V.added[ee],Pe=x.indexOf(ve);if(Pe===-1){for(let Oe=0;Oe<v.length;Oe++)if(Oe>=x.length){x.push(ve),Pe=Oe;break}else if(x[Oe]===null){x[Oe]=ve,Pe=Oe;break}if(Pe===-1)break}let ge=v[Pe];ge&&ge.connect(ve)}}let O=new I,H=new I;function q(V,ee,ve){O.setFromMatrixPosition(ee.matrixWorld),H.setFromMatrixPosition(ve.matrixWorld);let Pe=O.distanceTo(H),ge=ee.projectionMatrix.elements,Oe=ve.projectionMatrix.elements,Fe=ge[14]/(ge[10]-1),Ee=ge[14]/(ge[10]+1),pe=(ge[9]+1)/ge[5],P=(ge[9]-1)/ge[5],ce=(ge[8]-1)/ge[0],K=(Oe[8]+1)/Oe[0],ae=Fe*ce,$=Fe*K,Ae=Pe/(-ce+K),fe=Ae*-ce;ee.matrixWorld.decompose(V.position,V.quaternion,V.scale),V.translateX(fe),V.translateZ(Ae),V.matrixWorld.compose(V.position,V.quaternion,V.scale),V.matrixWorldInverse.copy(V.matrixWorld).invert();let T=Fe+Ae,w=Ee+Ae,F=ae-fe,j=$+(Pe-fe),re=pe*Ee/w*T,ne=P*Ee/w*T;V.projectionMatrix.makePerspective(F,j,re,ne,T,w),V.projectionMatrixInverse.copy(V.projectionMatrix).invert()}function Z(V,ee){ee===null?V.matrixWorld.copy(V.matrix):V.matrixWorld.multiplyMatrices(ee.matrixWorld,V.matrix),V.matrixWorldInverse.copy(V.matrixWorld).invert()}this.updateCamera=function(V){if(r===null)return;y.near=A.near=S.near=V.near,y.far=A.far=S.far=V.far,(M!==y.near||D!==y.far)&&(r.updateRenderState({depthNear:y.near,depthFar:y.far}),M=y.near,D=y.far);let ee=V.parent,ve=y.cameras;Z(y,ee);for(let Pe=0;Pe<ve.length;Pe++)Z(ve[Pe],ee);ve.length===2?q(y,S,A):y.projectionMatrix.copy(S.projectionMatrix),X(V,y,ee)};function X(V,ee,ve){ve===null?V.matrix.copy(ee.matrixWorld):(V.matrix.copy(ve.matrixWorld),V.matrix.invert(),V.matrix.multiply(ee.matrixWorld)),V.matrix.decompose(V.position,V.quaternion,V.scale),V.updateMatrixWorld(!0),V.projectionMatrix.copy(ee.projectionMatrix),V.projectionMatrixInverse.copy(ee.projectionMatrixInverse),V.isPerspectiveCamera&&(V.fov=qa*2*Math.atan(1/V.projectionMatrix.elements[5]),V.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(V){l=V,d!==null&&(d.fixedFoveation=V),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=V)};let ie=null;function Q(V,ee){if(u=ee.getViewerPose(c||o),g=ee,u!==null){let ve=u.views;f!==null&&(e.setRenderTargetFramebuffer(p,f.framebuffer),e.setRenderTarget(p));let Pe=!1;ve.length!==y.cameras.length&&(y.cameras.length=0,Pe=!0);for(let ge=0;ge<ve.length;ge++){let Oe=ve[ge],Fe=null;if(f!==null)Fe=f.getViewport(Oe);else{let pe=h.getViewSubImage(d,Oe);Fe=pe.viewport,ge===0&&(e.setRenderTargetTextures(p,pe.colorTexture,d.ignoreDepthValues?void 0:pe.depthStencilTexture),e.setRenderTarget(p))}let Ee=C[ge];Ee===void 0&&(Ee=new en,Ee.layers.enable(ge),Ee.viewport=new _t,C[ge]=Ee),Ee.matrix.fromArray(Oe.transform.matrix),Ee.matrix.decompose(Ee.position,Ee.quaternion,Ee.scale),Ee.projectionMatrix.fromArray(Oe.projectionMatrix),Ee.projectionMatrixInverse.copy(Ee.projectionMatrix).invert(),Ee.viewport.set(Fe.x,Fe.y,Fe.width,Fe.height),ge===0&&(y.matrix.copy(Ee.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),Pe===!0&&y.cameras.push(Ee)}}for(let ve=0;ve<v.length;ve++){let Pe=x[ve],ge=v[ve];Pe!==null&&ge!==void 0&&ge.update(Pe,ee,c||o)}ie&&ie(V,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}let ue=new th;ue.setAnimationLoop(Q),this.setAnimationLoop=function(V){ie=V},this.dispose=function(){}}};function Nx(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,eh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function r(m,p,v,x,b){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),h(m,p)):p.isMeshPhongMaterial?(s(m,p),u(m,p)):p.isMeshStandardMaterial?(s(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,b)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),_(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,v,x):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Lt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Lt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let v=e.get(p).envMap;if(v&&(m.envMap.value=v,m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap){m.lightMap.value=p.lightMap;let x=i._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=p.lightMapIntensity*x,t(p.lightMap,m.lightMapTransform)}p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,v,x){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*v,m.scale.value=x*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),e.get(p).envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,v){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Lt&&m.clearcoatNormalScale.value.negate())),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let v=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function Ox(i,e,t,n){let r={},s={},o=[],a=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(v,x){let b=x.program;n.uniformBlockBinding(v,b)}function c(v,x){let b=r[v.id];b===void 0&&(g(v),b=u(v),r[v.id]=b,v.addEventListener("dispose",m));let E=x.program;n.updateUBOMapping(v,E);let S=e.render.frame;s[v.id]!==S&&(d(v),s[v.id]=S)}function u(v){let x=h();v.__bindingPointIndex=x;let b=i.createBuffer(),E=v.__size,S=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,b),i.bufferData(i.UNIFORM_BUFFER,E,S),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,b),b}function h(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let x=r[v.id],b=v.uniforms,E=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let S=0,A=b.length;S<A;S++){let C=Array.isArray(b[S])?b[S]:[b[S]];for(let y=0,M=C.length;y<M;y++){let D=C[y];if(f(D,S,y,E)===!0){let z=D.__offset,Y=Array.isArray(D.value)?D.value:[D.value],L=0;for(let O=0;O<Y.length;O++){let H=Y[O],q=_(H);typeof H=="number"||typeof H=="boolean"?(D.__data[0]=H,i.bufferSubData(i.UNIFORM_BUFFER,z+L,D.__data)):H.isMatrix3?(D.__data[0]=H.elements[0],D.__data[1]=H.elements[1],D.__data[2]=H.elements[2],D.__data[3]=0,D.__data[4]=H.elements[3],D.__data[5]=H.elements[4],D.__data[6]=H.elements[5],D.__data[7]=0,D.__data[8]=H.elements[6],D.__data[9]=H.elements[7],D.__data[10]=H.elements[8],D.__data[11]=0):(H.toArray(D.__data,L),L+=q.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,z,D.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(v,x,b,E){let S=v.value,A=x+"_"+b;if(E[A]===void 0)return typeof S=="number"||typeof S=="boolean"?E[A]=S:E[A]=S.clone(),!0;{let C=E[A];if(typeof S=="number"||typeof S=="boolean"){if(C!==S)return E[A]=S,!0}else if(C.equals(S)===!1)return C.copy(S),!0}return!1}function g(v){let x=v.uniforms,b=0,E=16;for(let A=0,C=x.length;A<C;A++){let y=Array.isArray(x[A])?x[A]:[x[A]];for(let M=0,D=y.length;M<D;M++){let z=y[M],Y=Array.isArray(z.value)?z.value:[z.value];for(let L=0,O=Y.length;L<O;L++){let H=Y[L],q=_(H),Z=b%E;Z!==0&&E-Z<q.boundary&&(b+=E-Z),z.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=b,b+=q.storage}}}let S=b%E;return S>0&&(b+=E-S),v.__size=b,v.__cache={},this}function _(v){let x={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(x.boundary=4,x.storage=4):v.isVector2?(x.boundary=8,x.storage=8):v.isVector3||v.isColor?(x.boundary=16,x.storage=12):v.isVector4?(x.boundary=16,x.storage=16):v.isMatrix3?(x.boundary=48,x.storage=48):v.isMatrix4?(x.boundary=64,x.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),x}function m(v){let x=v.target;x.removeEventListener("dispose",m);let b=o.indexOf(x.__bindingPointIndex);o.splice(b,1),i.deleteBuffer(r[x.id]),delete r[x.id],delete s[x.id]}function p(){for(let v in r)i.deleteBuffer(r[v]);o=[],r={},s={}}return{bind:l,update:c,dispose:p}}var Qr=class{constructor(e={}){let{canvas:t=Xf(),context:n=null,depth:r=!0,stencil:s=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=o;let f=new Uint32Array(4),g=new Int32Array(4),_=null,m=null,p=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ct,this._useLegacyLights=!1,this.toneMapping=Nn,this.toneMappingExposure=1;let x=this,b=!1,E=0,S=0,A=null,C=-1,y=null,M=new _t,D=new _t,z=null,Y=new Ze(0),L=0,O=t.width,H=t.height,q=1,Z=null,X=null,ie=new _t(0,0,O,H),Q=new _t(0,0,O,H),ue=!1,V=new jr,ee=!1,ve=!1,Pe=null,ge=new dt,Oe=new J,Fe=new I,Ee={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function pe(){return A===null?q:1}let P=n;function ce(R,N){for(let B=0;B<R.length;B++){let G=R[B],k=t.getContext(G,N);if(k!==null)return k}return null}try{let R={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",de,!1),t.addEventListener("webglcontextrestored",U,!1),t.addEventListener("webglcontextcreationerror",_e,!1),P===null){let N=["webgl2","webgl","experimental-webgl"];if(x.isWebGL1Renderer===!0&&N.shift(),P=ce(N,R),P===null)throw ce(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&P instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),P.getShaderPrecisionFormat===void 0&&(P.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let K,ae,$,Ae,fe,T,w,F,j,re,ne,Se,xe,we,Ne,Ke,se,it,Qe,Xe,Ie,Me,Ye,st;function ht(){K=new tg(P),ae=new K0(P,K,e),K.init(ae),Me=new Dx(P,K,ae),$=new Ix(P,K,ae),Ae=new rg(P),fe=new yx,T=new Lx(P,K,$,fe,ae,Me,Ae),w=new $0(x),F=new eg(x),j=new dp(P,ae),Ye=new Y0(P,K,j,ae),re=new ng(P,j,Ae,Ye),ne=new lg(P,re,j,Ae),Qe=new ag(P,ae,T),Ke=new J0(fe),Se=new _x(x,w,F,K,ae,Ye,Ke),xe=new Nx(x,fe),we=new bx,Ne=new Ax(K,ae),it=new q0(x,w,F,$,ne,d,l),se=new Px(x,ne,ae),st=new Ox(P,Ae,ae,$),Xe=new Z0(P,K,Ae,ae),Ie=new ig(P,K,Ae,ae),Ae.programs=Se.programs,x.capabilities=ae,x.extensions=K,x.properties=fe,x.renderLists=we,x.shadowMap=se,x.state=$,x.info=Ae}ht();let $e=new ll(x,P);this.xr=$e,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let R=K.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){let R=K.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return q},this.setPixelRatio=function(R){R!==void 0&&(q=R,this.setSize(O,H,!1))},this.getSize=function(R){return R.set(O,H)},this.setSize=function(R,N,B=!0){if($e.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=R,H=N,t.width=Math.floor(R*q),t.height=Math.floor(N*q),B===!0&&(t.style.width=R+"px",t.style.height=N+"px"),this.setViewport(0,0,R,N)},this.getDrawingBufferSize=function(R){return R.set(O*q,H*q).floor()},this.setDrawingBufferSize=function(R,N,B){O=R,H=N,q=B,t.width=Math.floor(R*B),t.height=Math.floor(N*B),this.setViewport(0,0,R,N)},this.getCurrentViewport=function(R){return R.copy(M)},this.getViewport=function(R){return R.copy(ie)},this.setViewport=function(R,N,B,G){R.isVector4?ie.set(R.x,R.y,R.z,R.w):ie.set(R,N,B,G),$.viewport(M.copy(ie).multiplyScalar(q).floor())},this.getScissor=function(R){return R.copy(Q)},this.setScissor=function(R,N,B,G){R.isVector4?Q.set(R.x,R.y,R.z,R.w):Q.set(R,N,B,G),$.scissor(D.copy(Q).multiplyScalar(q).floor())},this.getScissorTest=function(){return ue},this.setScissorTest=function(R){$.setScissorTest(ue=R)},this.setOpaqueSort=function(R){Z=R},this.setTransparentSort=function(R){X=R},this.getClearColor=function(R){return R.copy(it.getClearColor())},this.setClearColor=function(){it.setClearColor.apply(it,arguments)},this.getClearAlpha=function(){return it.getClearAlpha()},this.setClearAlpha=function(){it.setClearAlpha.apply(it,arguments)},this.clear=function(R=!0,N=!0,B=!0){let G=0;if(R){let k=!1;if(A!==null){let he=A.texture.format;k=he===qu||he===Xu||he===Wu}if(k){let he=A.texture.type,Te=he===di||he===ci||he===Dl||he===Ci||he===Hu||he===Vu,Ue=it.getClearColor(),De=it.getClearAlpha(),He=Ue.r,ke=Ue.g,qe=Ue.b;Te?(f[0]=He,f[1]=ke,f[2]=qe,f[3]=De,P.clearBufferuiv(P.COLOR,0,f)):(g[0]=He,g[1]=ke,g[2]=qe,g[3]=De,P.clearBufferiv(P.COLOR,0,g))}else G|=P.COLOR_BUFFER_BIT}N&&(G|=P.DEPTH_BUFFER_BIT),B&&(G|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",de,!1),t.removeEventListener("webglcontextrestored",U,!1),t.removeEventListener("webglcontextcreationerror",_e,!1),we.dispose(),Ne.dispose(),fe.dispose(),w.dispose(),F.dispose(),ne.dispose(),Ye.dispose(),st.dispose(),Se.dispose(),$e.dispose(),$e.removeEventListener("sessionstart",Et),$e.removeEventListener("sessionend",lt),Pe&&(Pe.dispose(),Pe=null),zt.stop()};function de(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),b=!0}function U(){console.log("THREE.WebGLRenderer: Context Restored."),b=!1;let R=Ae.autoReset,N=se.enabled,B=se.autoUpdate,G=se.needsUpdate,k=se.type;ht(),Ae.autoReset=R,se.enabled=N,se.autoUpdate=B,se.needsUpdate=G,se.type=k}function _e(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function ye(R){let N=R.target;N.removeEventListener("dispose",ye),Be(N)}function Be(R){ze(R),fe.remove(R)}function ze(R){let N=fe.get(R).programs;N!==void 0&&(N.forEach(function(B){Se.releaseProgram(B)}),R.isShaderMaterial&&Se.releaseShaderCache(R))}this.renderBufferDirect=function(R,N,B,G,k,he){N===null&&(N=Ee);let Te=k.isMesh&&k.matrixWorld.determinant()<0,Ue=bt(R,N,B,G,k);$.setMaterial(G,Te);let De=B.index,He=1;if(G.wireframe===!0){if(De=re.getWireframeAttribute(B),De===void 0)return;He=2}let ke=B.drawRange,qe=B.attributes.position,Rt=ke.start*He,sn=(ke.start+ke.count)*He;he!==null&&(Rt=Math.max(Rt,he.start*He),sn=Math.min(sn,(he.start+he.count)*He)),De!==null?(Rt=Math.max(Rt,0),sn=Math.min(sn,De.count)):qe!=null&&(Rt=Math.max(Rt,0),sn=Math.min(sn,qe.count));let kt=sn-Rt;if(kt<0||kt===1/0)return;Ye.setup(k,G,Ue,B,De);let Bn,Mt=Xe;if(De!==null&&(Bn=j.get(De),Mt=Ie,Mt.setIndex(Bn)),k.isMesh)G.wireframe===!0?($.setLineWidth(G.wireframeLinewidth*pe()),Mt.setMode(P.LINES)):Mt.setMode(P.TRIANGLES);else if(k.isLine){let et=G.linewidth;et===void 0&&(et=1),$.setLineWidth(et*pe()),k.isLineSegments?Mt.setMode(P.LINES):k.isLineLoop?Mt.setMode(P.LINE_LOOP):Mt.setMode(P.LINE_STRIP)}else k.isPoints?Mt.setMode(P.POINTS):k.isSprite&&Mt.setMode(P.TRIANGLES);if(k.isBatchedMesh)Mt.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else if(k.isInstancedMesh)Mt.renderInstances(Rt,kt,k.count);else if(B.isInstancedBufferGeometry){let et=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,jo=Math.min(B.instanceCount,et);Mt.renderInstances(Rt,kt,jo)}else Mt.render(Rt,kt)};function at(R,N,B){R.transparent===!0&&R.side===mn&&R.forceSinglePass===!1?(R.side=Lt,R.needsUpdate=!0,Ge(R,N,B),R.side=pi,R.needsUpdate=!0,Ge(R,N,B),R.side=mn):Ge(R,N,B)}this.compile=function(R,N,B=null){B===null&&(B=R),m=Ne.get(B),m.init(),v.push(m),B.traverseVisible(function(k){k.isLight&&k.layers.test(N.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),R!==B&&R.traverseVisible(function(k){k.isLight&&k.layers.test(N.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),m.setupLights(x._useLegacyLights);let G=new Set;return R.traverse(function(k){let he=k.material;if(he)if(Array.isArray(he))for(let Te=0;Te<he.length;Te++){let Ue=he[Te];at(Ue,B,k),G.add(Ue)}else at(he,B,k),G.add(he)}),v.pop(),m=null,G},this.compileAsync=function(R,N,B=null){let G=this.compile(R,N,B);return new Promise(k=>{function he(){if(G.forEach(function(Te){fe.get(Te).currentProgram.isReady()&&G.delete(Te)}),G.size===0){k(R);return}setTimeout(he,10)}K.get("KHR_parallel_shader_compile")!==null?he():setTimeout(he,10)})};let rt=null;function wt(R){rt&&rt(R)}function Et(){zt.stop()}function lt(){zt.start()}let zt=new th;zt.setAnimationLoop(wt),typeof self<"u"&&zt.setContext(self),this.setAnimationLoop=function(R){rt=R,$e.setAnimationLoop(R),R===null?zt.stop():zt.start()},$e.addEventListener("sessionstart",Et),$e.addEventListener("sessionend",lt),this.render=function(R,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(b===!0)return;R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),$e.enabled===!0&&$e.isPresenting===!0&&($e.cameraAutoUpdate===!0&&$e.updateCamera(N),N=$e.getCamera()),R.isScene===!0&&R.onBeforeRender(x,R,N,A),m=Ne.get(R,v.length),m.init(),v.push(m),ge.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),V.setFromProjectionMatrix(ge),ve=this.localClippingEnabled,ee=Ke.init(this.clippingPlanes,ve),_=we.get(R,p.length),_.init(),p.push(_),rn(R,N,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(Z,X),this.info.render.frame++,ee===!0&&Ke.beginShadows();let B=m.state.shadowsArray;if(se.render(B,R,N),ee===!0&&Ke.endShadows(),this.info.autoReset===!0&&this.info.reset(),it.render(_,R),m.setupLights(x._useLegacyLights),N.isArrayCamera){let G=N.cameras;for(let k=0,he=G.length;k<he;k++){let Te=G[k];Nr(_,R,Te,Te.viewport)}}else Nr(_,R,N);A!==null&&(T.updateMultisampleRenderTarget(A),T.updateRenderTargetMipmap(A)),R.isScene===!0&&R.onAfterRender(x,R,N),Ye.resetDefaultState(),C=-1,y=null,v.pop(),v.length>0?m=v[v.length-1]:m=null,p.pop(),p.length>0?_=p[p.length-1]:_=null};function rn(R,N,B,G){if(R.visible===!1)return;if(R.layers.test(N.layers)){if(R.isGroup)B=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(N);else if(R.isLight)m.pushLight(R),R.castShadow&&m.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||V.intersectsSprite(R)){G&&Fe.setFromMatrixPosition(R.matrixWorld).applyMatrix4(ge);let Te=ne.update(R),Ue=R.material;Ue.visible&&_.push(R,Te,Ue,B,Fe.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||V.intersectsObject(R))){let Te=ne.update(R),Ue=R.material;if(G&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),Fe.copy(R.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),Fe.copy(Te.boundingSphere.center)),Fe.applyMatrix4(R.matrixWorld).applyMatrix4(ge)),Array.isArray(Ue)){let De=Te.groups;for(let He=0,ke=De.length;He<ke;He++){let qe=De[He],Rt=Ue[qe.materialIndex];Rt&&Rt.visible&&_.push(R,Te,Rt,B,Fe.z,qe)}}else Ue.visible&&_.push(R,Te,Ue,B,Fe.z,null)}}let he=R.children;for(let Te=0,Ue=he.length;Te<Ue;Te++)rn(he[Te],N,B,G)}function Nr(R,N,B,G){let k=R.opaque,he=R.transmissive,Te=R.transparent;m.setupLightsView(B),ee===!0&&Ke.setGlobalState(x.clippingPlanes,B),he.length>0&&te(k,he,N,B),G&&$.viewport(M.copy(G)),k.length>0&&be(k,N,B),he.length>0&&be(he,N,B),Te.length>0&&be(Te,N,B),$.buffers.depth.setTest(!0),$.buffers.depth.setMask(!0),$.buffers.color.setMask(!0),$.setPolygonOffset(!1)}function te(R,N,B,G){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;let he=ae.isWebGL2;Pe===null&&(Pe=new tn(1,1,{generateMipmaps:!0,type:K.has("EXT_color_buffer_half_float")?Di:di,minFilter:$r,samples:he?4:0})),x.getDrawingBufferSize(Oe),he?Pe.setSize(Oe.x,Oe.y):Pe.setSize(Ya(Oe.x),Ya(Oe.y));let Te=x.getRenderTarget();x.setRenderTarget(Pe),x.getClearColor(Y),L=x.getClearAlpha(),L<1&&x.setClearColor(16777215,.5),x.clear();let Ue=x.toneMapping;x.toneMapping=Nn,be(R,B,G),T.updateMultisampleRenderTarget(Pe),T.updateRenderTargetMipmap(Pe);let De=!1;for(let He=0,ke=N.length;He<ke;He++){let qe=N[He],Rt=qe.object,sn=qe.geometry,kt=qe.material,Bn=qe.group;if(kt.side===mn&&Rt.layers.test(G.layers)){let Mt=kt.side;kt.side=Lt,kt.needsUpdate=!0,Ce(Rt,B,G,sn,kt,Bn),kt.side=Mt,kt.needsUpdate=!0,De=!0}}De===!0&&(T.updateMultisampleRenderTarget(Pe),T.updateRenderTargetMipmap(Pe)),x.setRenderTarget(Te),x.setClearColor(Y,L),x.toneMapping=Ue}function be(R,N,B){let G=N.isScene===!0?N.overrideMaterial:null;for(let k=0,he=R.length;k<he;k++){let Te=R[k],Ue=Te.object,De=Te.geometry,He=G===null?Te.material:G,ke=Te.group;Ue.layers.test(B.layers)&&Ce(Ue,N,B,De,He,ke)}}function Ce(R,N,B,G,k,he){R.onBeforeRender(x,N,B,G,k,he),R.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),k.onBeforeRender(x,N,B,G,R,he),k.transparent===!0&&k.side===mn&&k.forceSinglePass===!1?(k.side=Lt,k.needsUpdate=!0,x.renderBufferDirect(B,N,G,k,R,he),k.side=pi,k.needsUpdate=!0,x.renderBufferDirect(B,N,G,k,R,he),k.side=mn):x.renderBufferDirect(B,N,G,k,R,he),R.onAfterRender(x,N,B,G,k,he)}function Ge(R,N,B){N.isScene!==!0&&(N=Ee);let G=fe.get(R),k=m.state.lights,he=m.state.shadowsArray,Te=k.state.version,Ue=Se.getParameters(R,k.state,he,N,B),De=Se.getProgramCacheKey(Ue),He=G.programs;G.environment=R.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(R.isMeshStandardMaterial?F:w).get(R.envMap||G.environment),He===void 0&&(R.addEventListener("dispose",ye),He=new Map,G.programs=He);let ke=He.get(De);if(ke!==void 0){if(G.currentProgram===ke&&G.lightsStateVersion===Te)return vt(R,Ue),ke}else Ue.uniforms=Se.getUniforms(R),R.onBuild(B,Ue,x),R.onBeforeCompile(Ue,x),ke=Se.acquireProgram(Ue,De),He.set(De,ke),G.uniforms=Ue.uniforms;let qe=G.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(qe.clippingPlanes=Ke.uniform),vt(R,Ue),G.needsLights=gt(R),G.lightsStateVersion=Te,G.needsLights&&(qe.ambientLightColor.value=k.state.ambient,qe.lightProbe.value=k.state.probe,qe.directionalLights.value=k.state.directional,qe.directionalLightShadows.value=k.state.directionalShadow,qe.spotLights.value=k.state.spot,qe.spotLightShadows.value=k.state.spotShadow,qe.rectAreaLights.value=k.state.rectArea,qe.ltc_1.value=k.state.rectAreaLTC1,qe.ltc_2.value=k.state.rectAreaLTC2,qe.pointLights.value=k.state.point,qe.pointLightShadows.value=k.state.pointShadow,qe.hemisphereLights.value=k.state.hemi,qe.directionalShadowMap.value=k.state.directionalShadowMap,qe.directionalShadowMatrix.value=k.state.directionalShadowMatrix,qe.spotShadowMap.value=k.state.spotShadowMap,qe.spotLightMatrix.value=k.state.spotLightMatrix,qe.spotLightMap.value=k.state.spotLightMap,qe.pointShadowMap.value=k.state.pointShadowMap,qe.pointShadowMatrix.value=k.state.pointShadowMatrix),G.currentProgram=ke,G.uniformsList=null,ke}function nt(R){if(R.uniformsList===null){let N=R.currentProgram.getUniforms();R.uniformsList=gr.seqWithValue(N.seq,R.uniforms)}return R.uniformsList}function vt(R,N){let B=fe.get(R);B.outputColorSpace=N.outputColorSpace,B.batching=N.batching,B.instancing=N.instancing,B.instancingColor=N.instancingColor,B.skinning=N.skinning,B.morphTargets=N.morphTargets,B.morphNormals=N.morphNormals,B.morphColors=N.morphColors,B.morphTargetsCount=N.morphTargetsCount,B.numClippingPlanes=N.numClippingPlanes,B.numIntersection=N.numClipIntersection,B.vertexAlphas=N.vertexAlphas,B.vertexTangents=N.vertexTangents,B.toneMapping=N.toneMapping}function bt(R,N,B,G,k){N.isScene!==!0&&(N=Ee),T.resetTextureUnits();let he=N.fog,Te=G.isMeshStandardMaterial?N.environment:null,Ue=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:$n,De=(G.isMeshStandardMaterial?F:w).get(G.envMap||Te),He=G.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,ke=!!B.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),qe=!!B.morphAttributes.position,Rt=!!B.morphAttributes.normal,sn=!!B.morphAttributes.color,kt=Nn;G.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(kt=x.toneMapping);let Bn=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Mt=Bn!==void 0?Bn.length:0,et=fe.get(G),jo=m.state.lights;if(ee===!0&&(ve===!0||R!==y)){let dn=R===y&&G.id===C;Ke.setState(G,R,dn)}let Tt=!1;G.version===et.__version?(et.needsLights&&et.lightsStateVersion!==jo.state.version||et.outputColorSpace!==Ue||k.isBatchedMesh&&et.batching===!1||!k.isBatchedMesh&&et.batching===!0||k.isInstancedMesh&&et.instancing===!1||!k.isInstancedMesh&&et.instancing===!0||k.isSkinnedMesh&&et.skinning===!1||!k.isSkinnedMesh&&et.skinning===!0||k.isInstancedMesh&&et.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&et.instancingColor===!1&&k.instanceColor!==null||et.envMap!==De||G.fog===!0&&et.fog!==he||et.numClippingPlanes!==void 0&&(et.numClippingPlanes!==Ke.numPlanes||et.numIntersection!==Ke.numIntersection)||et.vertexAlphas!==He||et.vertexTangents!==ke||et.morphTargets!==qe||et.morphNormals!==Rt||et.morphColors!==sn||et.toneMapping!==kt||ae.isWebGL2===!0&&et.morphTargetsCount!==Mt)&&(Tt=!0):(Tt=!0,et.__version=G.version);let yi=et.currentProgram;Tt===!0&&(yi=Ge(G,N,k));let oc=!1,Or=!1,Qo=!1,Vt=yi.getUniforms(),vi=et.uniforms;if($.useProgram(yi.program)&&(oc=!0,Or=!0,Qo=!0),G.id!==C&&(C=G.id,Or=!0),oc||y!==R){Vt.setValue(P,"projectionMatrix",R.projectionMatrix),Vt.setValue(P,"viewMatrix",R.matrixWorldInverse);let dn=Vt.map.cameraPosition;dn!==void 0&&dn.setValue(P,Fe.setFromMatrixPosition(R.matrixWorld)),ae.logarithmicDepthBuffer&&Vt.setValue(P,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Vt.setValue(P,"isOrthographic",R.isOrthographicCamera===!0),y!==R&&(y=R,Or=!0,Qo=!0)}if(k.isSkinnedMesh){Vt.setOptional(P,k,"bindMatrix"),Vt.setOptional(P,k,"bindMatrixInverse");let dn=k.skeleton;dn&&(ae.floatVertexTextures?(dn.boneTexture===null&&dn.computeBoneTexture(),Vt.setValue(P,"boneTexture",dn.boneTexture,T)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}k.isBatchedMesh&&(Vt.setOptional(P,k,"batchingTexture"),Vt.setValue(P,"batchingTexture",k._matricesTexture,T));let ea=B.morphAttributes;if((ea.position!==void 0||ea.normal!==void 0||ea.color!==void 0&&ae.isWebGL2===!0)&&Qe.update(k,B,yi),(Or||et.receiveShadow!==k.receiveShadow)&&(et.receiveShadow=k.receiveShadow,Vt.setValue(P,"receiveShadow",k.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(vi.envMap.value=De,vi.flipEnvMap.value=De.isCubeTexture&&De.isRenderTargetTexture===!1?-1:1),Or&&(Vt.setValue(P,"toneMappingExposure",x.toneMappingExposure),et.needsLights&&pt(vi,Qo),he&&G.fog===!0&&xe.refreshFogUniforms(vi,he),xe.refreshMaterialUniforms(vi,G,q,H,Pe),gr.upload(P,nt(et),vi,T)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(gr.upload(P,nt(et),vi,T),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Vt.setValue(P,"center",k.center),Vt.setValue(P,"modelViewMatrix",k.modelViewMatrix),Vt.setValue(P,"normalMatrix",k.normalMatrix),Vt.setValue(P,"modelMatrix",k.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){let dn=G.uniformsGroups;for(let ta=0,qd=dn.length;ta<qd;ta++)if(ae.isWebGL2){let ac=dn[ta];st.update(ac,yi),st.bind(ac,yi)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return yi}function pt(R,N){R.ambientLightColor.needsUpdate=N,R.lightProbe.needsUpdate=N,R.directionalLights.needsUpdate=N,R.directionalLightShadows.needsUpdate=N,R.pointLights.needsUpdate=N,R.pointLightShadows.needsUpdate=N,R.spotLights.needsUpdate=N,R.spotLightShadows.needsUpdate=N,R.rectAreaLights.needsUpdate=N,R.hemisphereLights.needsUpdate=N}function gt(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(R,N,B){fe.get(R.texture).__webglTexture=N,fe.get(R.depthTexture).__webglTexture=B;let G=fe.get(R);G.__hasExternalTextures=!0,G.__hasExternalTextures&&(G.__autoAllocateDepthBuffer=B===void 0,G.__autoAllocateDepthBuffer||K.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(R,N){let B=fe.get(R);B.__webglFramebuffer=N,B.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(R,N=0,B=0){A=R,E=N,S=B;let G=!0,k=null,he=!1,Te=!1;if(R){let De=fe.get(R);De.__useDefaultFramebuffer!==void 0?($.bindFramebuffer(P.FRAMEBUFFER,null),G=!1):De.__webglFramebuffer===void 0?T.setupRenderTarget(R):De.__hasExternalTextures&&T.rebindTextures(R,fe.get(R.texture).__webglTexture,fe.get(R.depthTexture).__webglTexture);let He=R.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(Te=!0);let ke=fe.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(ke[N])?k=ke[N][B]:k=ke[N],he=!0):ae.isWebGL2&&R.samples>0&&T.useMultisampledRTT(R)===!1?k=fe.get(R).__webglMultisampledFramebuffer:Array.isArray(ke)?k=ke[B]:k=ke,M.copy(R.viewport),D.copy(R.scissor),z=R.scissorTest}else M.copy(ie).multiplyScalar(q).floor(),D.copy(Q).multiplyScalar(q).floor(),z=ue;if($.bindFramebuffer(P.FRAMEBUFFER,k)&&ae.drawBuffers&&G&&$.drawBuffers(R,k),$.viewport(M),$.scissor(D),$.setScissorTest(z),he){let De=fe.get(R.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+N,De.__webglTexture,B)}else if(Te){let De=fe.get(R.texture),He=N||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,De.__webglTexture,B||0,He)}C=-1},this.readRenderTargetPixels=function(R,N,B,G,k,he,Te){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ue=fe.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Te!==void 0&&(Ue=Ue[Te]),Ue){$.bindFramebuffer(P.FRAMEBUFFER,Ue);try{let De=R.texture,He=De.format,ke=De.type;if(He!==Rn&&Me.convert(He)!==P.getParameter(P.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let qe=ke===Di&&(K.has("EXT_color_buffer_half_float")||ae.isWebGL2&&K.has("EXT_color_buffer_float"));if(ke!==di&&Me.convert(ke)!==P.getParameter(P.IMPLEMENTATION_COLOR_READ_TYPE)&&!(ke===ui&&(ae.isWebGL2||K.has("OES_texture_float")||K.has("WEBGL_color_buffer_float")))&&!qe){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=R.width-G&&B>=0&&B<=R.height-k&&P.readPixels(N,B,G,k,Me.convert(He),Me.convert(ke),he)}finally{let De=A!==null?fe.get(A).__webglFramebuffer:null;$.bindFramebuffer(P.FRAMEBUFFER,De)}}},this.copyFramebufferToTexture=function(R,N,B=0){let G=Math.pow(2,-B),k=Math.floor(N.image.width*G),he=Math.floor(N.image.height*G);T.setTexture2D(N,0),P.copyTexSubImage2D(P.TEXTURE_2D,B,0,0,R.x,R.y,k,he),$.unbindTexture()},this.copyTextureToTexture=function(R,N,B,G=0){let k=N.image.width,he=N.image.height,Te=Me.convert(B.format),Ue=Me.convert(B.type);T.setTexture2D(B,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,B.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,B.unpackAlignment),N.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,G,R.x,R.y,k,he,Te,Ue,N.image.data):N.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,G,R.x,R.y,N.mipmaps[0].width,N.mipmaps[0].height,Te,N.mipmaps[0].data):P.texSubImage2D(P.TEXTURE_2D,G,R.x,R.y,Te,Ue,N.image),G===0&&B.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),$.unbindTexture()},this.copyTextureToTexture3D=function(R,N,B,G,k=0){if(x.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let he=R.max.x-R.min.x+1,Te=R.max.y-R.min.y+1,Ue=R.max.z-R.min.z+1,De=Me.convert(G.format),He=Me.convert(G.type),ke;if(G.isData3DTexture)T.setTexture3D(G,0),ke=P.TEXTURE_3D;else if(G.isDataArrayTexture||G.isCompressedArrayTexture)T.setTexture2DArray(G,0),ke=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,G.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,G.unpackAlignment);let qe=P.getParameter(P.UNPACK_ROW_LENGTH),Rt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),sn=P.getParameter(P.UNPACK_SKIP_PIXELS),kt=P.getParameter(P.UNPACK_SKIP_ROWS),Bn=P.getParameter(P.UNPACK_SKIP_IMAGES),Mt=B.isCompressedTexture?B.mipmaps[k]:B.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,Mt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Mt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,R.min.x),P.pixelStorei(P.UNPACK_SKIP_ROWS,R.min.y),P.pixelStorei(P.UNPACK_SKIP_IMAGES,R.min.z),B.isDataTexture||B.isData3DTexture?P.texSubImage3D(ke,k,N.x,N.y,N.z,he,Te,Ue,De,He,Mt.data):B.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),P.compressedTexSubImage3D(ke,k,N.x,N.y,N.z,he,Te,Ue,De,Mt.data)):P.texSubImage3D(ke,k,N.x,N.y,N.z,he,Te,Ue,De,He,Mt),P.pixelStorei(P.UNPACK_ROW_LENGTH,qe),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Rt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,sn),P.pixelStorei(P.UNPACK_SKIP_ROWS,kt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Bn),k===0&&G.generateMipmaps&&P.generateMipmap(ke),$.unbindTexture()},this.initTexture=function(R){R.isCubeTexture?T.setTextureCube(R,0):R.isData3DTexture?T.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?T.setTexture2DArray(R,0):T.setTexture2D(R,0),$.unbindTexture()},this.resetState=function(){E=0,S=0,A=null,$.reset(),Ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Kn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===Nl?"display-p3":"srgb",t.unpackColorSpace=ct.workingColorSpace===Io?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===Ct?Ii:Zu}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Ii?Ct:$n}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},cl=class extends Qr{};cl.prototype.isWebGL1Renderer=!0;var On=class extends Yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}},mo=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Wa,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=Jn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Jn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Jn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Kt=new I,es=class i{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix4(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.applyNormalMatrix(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.transformDirection(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}setX(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ut(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Zn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Zn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Zn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Zn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ut(t,this.array),n=ut(n,this.array),r=ut(r,this.array),s=ut(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new qt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},ts=class extends Qn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ze(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},or,Gr=new I,ar=new I,lr=new I,cr=new J,Hr=new J,ah=new dt,Hs=new I,Vr=new I,Vs=new I,Ru=new J,Da=new J,Cu=new J,go=class extends Yt{constructor(e=new ts){if(super(),this.isSprite=!0,this.type="Sprite",or===void 0){or=new At;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new mo(t,5);or.setIndex([0,1,2,0,2,3]),or.setAttribute("position",new es(n,3,0,!1)),or.setAttribute("uv",new es(n,2,3,!1))}this.geometry=or,this.material=e,this.center=new J(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ar.setFromMatrixScale(this.matrixWorld),ah.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),lr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ar.multiplyScalar(-lr.z);let n=this.material.rotation,r,s;n!==0&&(s=Math.cos(n),r=Math.sin(n));let o=this.center;Ws(Hs.set(-.5,-.5,0),lr,o,ar,r,s),Ws(Vr.set(.5,-.5,0),lr,o,ar,r,s),Ws(Vs.set(.5,.5,0),lr,o,ar,r,s),Ru.set(0,0),Da.set(1,0),Cu.set(1,1);let a=e.ray.intersectTriangle(Hs,Vr,Vs,!1,Gr);if(a===null&&(Ws(Vr.set(-.5,.5,0),lr,o,ar,r,s),Da.set(0,1),a=e.ray.intersectTriangle(Hs,Vs,Vr,!1,Gr),a===null))return;let l=e.ray.origin.distanceTo(Gr);l<e.near||l>e.far||t.push({distance:l,point:Gr.clone(),uv:Ri.getInterpolation(Gr,Hs,Vr,Vs,Ru,Da,Cu,new J),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Ws(i,e,t,n,r,s){cr.subVectors(i,t).addScalar(.5).multiply(n),r!==void 0?(Hr.x=s*cr.x-r*cr.y,Hr.y=r*cr.x+s*cr.y):Hr.copy(cr),i.copy(e),i.x+=Hr.x,i.y+=Hr.y,i.applyMatrix4(ah)}var ns=class extends qt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ur=new dt,Pu=new dt,Xs=[],Iu=new jn,Fx=new dt,Wr=new le,Xr=new Ui,xo=class extends le{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ns(new Float32Array(n*16),16),this.instanceColor=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,Fx)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new jn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ur),Iu.copy(e.boundingBox).applyMatrix4(ur),this.boundingBox.union(Iu)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ui),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ur),Xr.copy(e.boundingSphere).applyMatrix4(ur),this.boundingSphere.union(Xr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Wr.geometry=this.geometry,Wr.material=this.material,Wr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Xr.copy(this.boundingSphere),Xr.applyMatrix4(n),e.ray.intersectsSphere(Xr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,ur),Pu.multiplyMatrices(n,ur),Wr.matrixWorld=Pu,Wr.raycast(e,Xs);for(let o=0,a=Xs.length;o<a;o++){let l=Xs[o];l.instanceId=s,l.object=this,t.push(l)}Xs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new ns(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}};var Sr=class extends xn{constructor(e,t,n,r,s,o,a,l,c){super(e,t,n,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},yn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),r=0,s=n.length,o;t?o=t:o=e*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);let u=n[r],d=n[r+1]-u,f=(o-u)/d;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new J:new I);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new I,r=[],s=[],o=[],a=new I,l=new dt;for(let f=0;f<=e;f++){let g=f/e;r[f]=this.getTangentAt(g,new I)}s[0]=new I,o[0]=new I;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),d=Math.abs(r[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Gt(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(Gt(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],f*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},is=class extends yn{constructor(e=0,t=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let n=t||new J,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ul=class extends is{constructor(e,t,n,r,s,o){super(e,t,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Fl(){let i=0,e=0,t=0,n=0;function r(s,o,a,l){i=s,e=a,t=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let d=(o-s)/c-(a-s)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,f*=u,r(o,a,d,f)},calc:function(s){let o=s*s,a=o*s;return i+e*s+t*o+n*a}}}var qs=new I,Ua=new Fl,Na=new Fl,Oa=new Fl,rs=class extends yn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new I){let n=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(qs.subVectors(r[0],r[1]).add(r[0]),c=qs);let h=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(qs.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=qs),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),f),_=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Ua.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,_,m),Na.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,_,m),Oa.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,_,m)}else this.curveType==="catmullrom"&&(Ua.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),Na.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Oa.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(Ua.calc(l),Na.calc(l),Oa.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new I().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Lu(i,e,t,n,r){let s=(n-e)*.5,o=(r-t)*.5,a=i*i,l=i*a;return(2*t-2*n+s+o)*l+(-3*t+3*n-2*s-o)*a+s*i+t}function zx(i,e){let t=1-i;return t*t*e}function kx(i,e){return 2*(1-i)*i*e}function Bx(i,e){return i*i*e}function Kr(i,e,t,n){return zx(i,e)+kx(i,t)+Bx(i,n)}function Gx(i,e){let t=1-i;return t*t*t*e}function Hx(i,e){let t=1-i;return 3*t*t*i*e}function Vx(i,e){return 3*(1-i)*i*i*e}function Wx(i,e){return i*i*i*e}function Jr(i,e,t,n,r){return Gx(i,e)+Hx(i,t)+Vx(i,n)+Wx(i,r)}var _o=class extends yn{constructor(e=new J,t=new J,n=new J,r=new J){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new J){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(Jr(e,r.x,s.x,o.x,a.x),Jr(e,r.y,s.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},hl=class extends yn{constructor(e=new I,t=new I,n=new I,r=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new I){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(Jr(e,r.x,s.x,o.x,a.x),Jr(e,r.y,s.y,o.y,a.y),Jr(e,r.z,s.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},yo=class extends yn{constructor(e=new J,t=new J){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new J){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new J){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},dl=class extends yn{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},vo=class extends yn{constructor(e=new J,t=new J,n=new J){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new J){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Kr(e,r.x,s.x,o.x),Kr(e,r.y,s.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},bo=class extends yn{constructor(e=new I,t=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Kr(e,r.x,s.x,o.x),Kr(e,r.y,s.y,o.y),Kr(e,r.z,s.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Mo=class extends yn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new J){let n=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return n.set(Lu(a,l.x,c.x,u.x,h.x),Lu(a,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new J().fromArray(r))}return this}},So=Object.freeze({__proto__:null,ArcCurve:ul,CatmullRomCurve3:rs,CubicBezierCurve:_o,CubicBezierCurve3:hl,EllipseCurve:is,LineCurve:yo,LineCurve3:dl,QuadraticBezierCurve:vo,QuadraticBezierCurve3:bo,SplineCurve:Mo}),fl=class extends yn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new So[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=n){let o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(new So[r.type]().fromJSON(r))}return this}},wr=class extends fl{constructor(e){super(),this.type="Path",this.currentPoint=new J,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new yo(this.currentPoint.clone(),new J(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let s=new vo(this.currentPoint.clone(),new J(e,t),new J(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,o){let a=new _o(this.currentPoint.clone(),new J(e,t),new J(n,r),new J(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Mo(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,r,s,o),this}absarc(e,t,n,r,s,o){return this.absellipse(e,t,n,n,r,s,o),this}ellipse(e,t,n,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,r,s,o,a,l),this}absellipse(e,t,n,r,s,o,a,l){let c=new is(e,t,n,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Er=class i extends At{constructor(e=[new J(0,-.5),new J(.5,0),new J(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=Gt(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],u=1/t,h=new I,d=new J,f=new I,g=new I,_=new I,m=0,p=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,p=e[v+1].y-e[v].y,f.x=p*1,f.y=-m,f.z=p*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[v+1].x-e[v].x,p=e[v+1].y-e[v].y,f.x=p*1,f.y=-m,f.z=p*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let v=0;v<=t;v++){let x=n+v*u*r,b=Math.sin(x),E=Math.cos(x);for(let S=0;S<=e.length-1;S++){h.x=e[S].x*b,h.y=e[S].y,h.z=e[S].x*E,o.push(h.x,h.y,h.z),d.x=v/t,d.y=S/(e.length-1),a.push(d.x,d.y);let A=l[3*S+0]*b,C=l[3*S+1],y=l[3*S+0]*E;c.push(A,C,y)}}for(let v=0;v<t;v++)for(let x=0;x<e.length-1;x++){let b=x+v*e.length,E=b,S=b+e.length,A=b+e.length+1,C=b+1;s.push(E,S,C),s.push(A,C,S)}this.setIndex(s),this.setAttribute("position",new Je(o,3)),this.setAttribute("uv",new Je(a,2)),this.setAttribute("normal",new Je(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var wo=class i extends At{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new I,u=new J;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let f=n+h/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new Je(o,3)),this.setAttribute("normal",new Je(a,3)),this.setAttribute("uv",new Je(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},vn=class i extends At{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],d=[],f=[],g=0,_=[],m=n/2,p=0;v(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new Je(h,3)),this.setAttribute("normal",new Je(d,3)),this.setAttribute("uv",new Je(f,2));function v(){let b=new I,E=new I,S=0,A=(t-e)/n;for(let C=0;C<=s;C++){let y=[],M=C/s,D=M*(t-e)+e;for(let z=0;z<=r;z++){let Y=z/r,L=Y*l+a,O=Math.sin(L),H=Math.cos(L);E.x=D*O,E.y=-M*n+m,E.z=D*H,h.push(E.x,E.y,E.z),b.set(O,A,H).normalize(),d.push(b.x,b.y,b.z),f.push(Y,1-M),y.push(g++)}_.push(y)}for(let C=0;C<r;C++)for(let y=0;y<s;y++){let M=_[y][C],D=_[y+1][C],z=_[y+1][C+1],Y=_[y][C+1];u.push(M,D,Y),u.push(D,z,Y),S+=6}c.addGroup(p,S,0),p+=S}function x(b){let E=g,S=new J,A=new I,C=0,y=b===!0?e:t,M=b===!0?1:-1;for(let z=1;z<=r;z++)h.push(0,m*M,0),d.push(0,M,0),f.push(.5,.5),g++;let D=g;for(let z=0;z<=r;z++){let L=z/r*l+a,O=Math.cos(L),H=Math.sin(L);A.x=y*H,A.y=m*M,A.z=y*O,h.push(A.x,A.y,A.z),d.push(0,M,0),S.x=O*.5+.5,S.y=H*.5*M+.5,f.push(S.x,S.y),g++}for(let z=0;z<r;z++){let Y=E+z,L=D+z;b===!0?u.push(L,L+1,Y):u.push(L+1,L,Y),C+=3}c.addGroup(p,C,b===!0?1:2),p+=C}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Zt=class i extends vn{constructor(e=1,t=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},pl=class i extends At{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};let s=[],o=[];a(r),c(n),u(),this.setAttribute("position",new Je(s,3)),this.setAttribute("normal",new Je(s.slice(),3)),this.setAttribute("uv",new Je(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(v){let x=new I,b=new I,E=new I;for(let S=0;S<t.length;S+=3)f(t[S+0],x),f(t[S+1],b),f(t[S+2],E),l(x,b,E,v)}function l(v,x,b,E){let S=E+1,A=[];for(let C=0;C<=S;C++){A[C]=[];let y=v.clone().lerp(b,C/S),M=x.clone().lerp(b,C/S),D=S-C;for(let z=0;z<=D;z++)z===0&&C===S?A[C][z]=y:A[C][z]=y.clone().lerp(M,z/D)}for(let C=0;C<S;C++)for(let y=0;y<2*(S-C)-1;y++){let M=Math.floor(y/2);y%2===0?(d(A[C][M+1]),d(A[C+1][M]),d(A[C][M])):(d(A[C][M+1]),d(A[C+1][M+1]),d(A[C+1][M]))}}function c(v){let x=new I;for(let b=0;b<s.length;b+=3)x.x=s[b+0],x.y=s[b+1],x.z=s[b+2],x.normalize().multiplyScalar(v),s[b+0]=x.x,s[b+1]=x.y,s[b+2]=x.z}function u(){let v=new I;for(let x=0;x<s.length;x+=3){v.x=s[x+0],v.y=s[x+1],v.z=s[x+2];let b=m(v)/2/Math.PI+.5,E=p(v)/Math.PI+.5;o.push(b,1-E)}g(),h()}function h(){for(let v=0;v<o.length;v+=6){let x=o[v+0],b=o[v+2],E=o[v+4],S=Math.max(x,b,E),A=Math.min(x,b,E);S>.9&&A<.1&&(x<.2&&(o[v+0]+=1),b<.2&&(o[v+2]+=1),E<.2&&(o[v+4]+=1))}}function d(v){s.push(v.x,v.y,v.z)}function f(v,x){let b=v*3;x.x=e[b+0],x.y=e[b+1],x.z=e[b+2]}function g(){let v=new I,x=new I,b=new I,E=new I,S=new J,A=new J,C=new J;for(let y=0,M=0;y<s.length;y+=9,M+=6){v.set(s[y+0],s[y+1],s[y+2]),x.set(s[y+3],s[y+4],s[y+5]),b.set(s[y+6],s[y+7],s[y+8]),S.set(o[M+0],o[M+1]),A.set(o[M+2],o[M+3]),C.set(o[M+4],o[M+5]),E.copy(v).add(x).add(b).divideScalar(3);let D=m(E);_(S,M+0,v,D),_(A,M+2,x,D),_(C,M+4,b,D)}}function _(v,x,b,E){E<0&&v.x===1&&(o[x]=v.x-1),b.x===0&&b.z===0&&(o[x]=E/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function p(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.details)}};var cn=class extends wr{constructor(e){super(e),this.uuid=Jn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(new wr().fromJSON(r))}return this}},Xx={triangulate:function(i,e,t=2){let n=e&&e.length,r=n?e[0]*t:i.length,s=lh(i,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c,u,h,d,f;if(n&&(s=Jx(i,e,s,t)),i.length>80*t){a=c=i[0],l=u=i[1];for(let g=t;g<r;g+=t)h=i[g],d=i[g+1],h<a&&(a=h),d<l&&(l=d),h>c&&(c=h),d>u&&(u=d);f=Math.max(c-a,u-l),f=f!==0?32767/f:0}return ss(s,o,t,a,l,f,0),o}};function lh(i,e,t,n,r){let s,o;if(r===a_(i,e,t,n)>0)for(s=e;s<t;s+=n)o=Du(s,i[s],i[s+1],o);else for(s=t-n;s>=e;s-=n)o=Du(s,i[s],i[s+1],o);return o&&Do(o,o.next)&&(as(o),o=o.next),o}function Ni(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Do(t,t.next)||St(t.prev,t,t.next)===0)){if(as(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function ss(i,e,t,n,r,s,o){if(!i)return;!o&&s&&t_(i,n,r,s);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,s?Yx(i,n,r,s):qx(i)){e.push(l.i/t|0),e.push(i.i/t|0),e.push(c.i/t|0),as(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Zx(Ni(i),e,t),ss(i,e,t,n,r,s,2)):o===2&&Kx(i,e,t,n,r,s):ss(Ni(i),e,t,n,r,s,1);break}}}function qx(i){let e=i.prev,t=i,n=i.next;if(St(e,t,n)>=0)return!1;let r=e.x,s=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=r<s?r<o?r:o:s<o?s:o,h=a<l?a<c?a:c:l<c?l:c,d=r>s?r>o?r:o:s>o?s:o,f=a>l?a>c?a:c:l>c?l:c,g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=d&&g.y>=h&&g.y<=f&&fr(r,a,s,l,o,c,g.x,g.y)&&St(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Yx(i,e,t,n){let r=i.prev,s=i,o=i.next;if(St(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,d=o.y,f=a<l?a<c?a:c:l<c?l:c,g=u<h?u<d?u:d:h<d?h:d,_=a>l?a>c?a:c:l>c?l:c,m=u>h?u>d?u:d:h>d?h:d,p=ml(f,g,e,t,n),v=ml(_,m,e,t,n),x=i.prevZ,b=i.nextZ;for(;x&&x.z>=p&&b&&b.z<=v;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&fr(a,u,l,h,c,d,x.x,x.y)&&St(x.prev,x,x.next)>=0||(x=x.prevZ,b.x>=f&&b.x<=_&&b.y>=g&&b.y<=m&&b!==r&&b!==o&&fr(a,u,l,h,c,d,b.x,b.y)&&St(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;x&&x.z>=p;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&fr(a,u,l,h,c,d,x.x,x.y)&&St(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;b&&b.z<=v;){if(b.x>=f&&b.x<=_&&b.y>=g&&b.y<=m&&b!==r&&b!==o&&fr(a,u,l,h,c,d,b.x,b.y)&&St(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Zx(i,e,t){let n=i;do{let r=n.prev,s=n.next.next;!Do(r,s)&&ch(r,n,n.next,s)&&os(r,s)&&os(s,r)&&(e.push(r.i/t|0),e.push(n.i/t|0),e.push(s.i/t|0),as(n),as(n.next),n=i=s),n=n.next}while(n!==i);return Ni(n)}function Kx(i,e,t,n,r,s){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&r_(o,a)){let l=uh(o,a);o=Ni(o,o.next),l=Ni(l,l.next),ss(o,e,t,n,r,s,0),ss(l,e,t,n,r,s,0);return}a=a.next}o=o.next}while(o!==i)}function Jx(i,e,t,n){let r=[],s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*n,l=s<o-1?e[s+1]*n:i.length,c=lh(i,a,l,n,!1),c===c.next&&(c.steiner=!0),r.push(i_(c));for(r.sort($x),s=0;s<r.length;s++)t=jx(r[s],t);return t}function $x(i,e){return i.x-e.x}function jx(i,e){let t=Qx(i,e);if(!t)return e;let n=uh(t,i);return Ni(n,n.next),Ni(t,t.next)}function Qx(i,e){let t=e,n=-1/0,r,s=i.x,o=i.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let d=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=s&&d>n&&(n=d,r=t.x<t.next.x?t:t.next,d===s))return r}t=t.next}while(t!==e);if(!r)return null;let a=r,l=r.x,c=r.y,u=1/0,h;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&fr(o<c?s:n,o,l,c,o<c?n:s,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(s-t.x),os(t,i)&&(h<u||h===u&&(t.x>r.x||t.x===r.x&&e_(r,t)))&&(r=t,u=h)),t=t.next;while(t!==a);return r}function e_(i,e){return St(i.prev,i,e.prev)<0&&St(e.next,i,i.next)<0}function t_(i,e,t,n){let r=i;do r.z===0&&(r.z=ml(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,n_(r)}function n_(i){let e,t,n,r,s,o,a,l,c=1;do{for(t=i,i=null,s=null,o=0;t;){for(o++,n=t,a=0,e=0;e<c&&(a++,n=n.nextZ,!!n);e++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||t.z<=n.z)?(r=t,t=t.nextZ,a--):(r=n,n=n.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;t=n}s.nextZ=null,c*=2}while(o>1);return i}function ml(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function i_(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function fr(i,e,t,n,r,s,o,a){return(r-o)*(e-a)>=(i-o)*(s-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(n-a)}function r_(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!s_(i,e)&&(os(i,e)&&os(e,i)&&o_(i,e)&&(St(i.prev,i,e.prev)||St(i,e.prev,e))||Do(i,e)&&St(i.prev,i,i.next)>0&&St(e.prev,e,e.next)>0)}function St(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Do(i,e){return i.x===e.x&&i.y===e.y}function ch(i,e,t,n){let r=Zs(St(i,e,t)),s=Zs(St(i,e,n)),o=Zs(St(t,n,i)),a=Zs(St(t,n,e));return!!(r!==s&&o!==a||r===0&&Ys(i,t,e)||s===0&&Ys(i,n,e)||o===0&&Ys(t,i,n)||a===0&&Ys(t,e,n))}function Ys(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Zs(i){return i>0?1:i<0?-1:0}function s_(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&ch(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function os(i,e){return St(i.prev,i,i.next)<0?St(i,e,i.next)>=0&&St(i,i.prev,e)>=0:St(i,e,i.prev)<0||St(i,i.next,e)<0}function o_(i,e){let t=i,n=!1,r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function uh(i,e){let t=new gl(i.i,i.x,i.y),n=new gl(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function Du(i,e,t,n){let r=new gl(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function as(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function gl(i,e,t){this.i=i,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function a_(i,e,t,n){let r=0;for(let s=e,o=t-n;s<t;s+=n)r+=(i[o]-i[s])*(i[s+1]+i[o+1]),o=s;return r}var fi=class i{static area(e){let t=e.length,n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],r=[],s=[];Uu(e),Nu(n,e);let o=e.length;t.forEach(Uu);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,Nu(n,t[l]);let a=Xx.triangulate(n,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function Uu(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Nu(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var Oi=class i extends At{constructor(e=new cn([new J(.5,.5),new J(-.5,.5),new J(-.5,-.5),new J(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new Je(r,3)),this.setAttribute("uv",new Je(s,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:l_,x,b=!1,E,S,A,C;p&&(x=p.getSpacedPoints(u),b=!0,d=!1,E=p.computeFrenetFrames(u,!1),S=new I,A=new I,C=new I),d||(m=0,f=0,g=0,_=0);let y=a.extractPoints(c),M=y.shape,D=y.holes;if(!fi.isClockWise(M)){M=M.reverse();for(let P=0,ce=D.length;P<ce;P++){let K=D[P];fi.isClockWise(K)&&(D[P]=K.reverse())}}let Y=fi.triangulateShape(M,D),L=M;for(let P=0,ce=D.length;P<ce;P++){let K=D[P];M=M.concat(K)}function O(P,ce,K){return ce||console.error("THREE.ExtrudeGeometry: vec does not exist"),P.clone().addScaledVector(ce,K)}let H=M.length,q=Y.length;function Z(P,ce,K){let ae,$,Ae,fe=P.x-ce.x,T=P.y-ce.y,w=K.x-P.x,F=K.y-P.y,j=fe*fe+T*T,re=fe*F-T*w;if(Math.abs(re)>Number.EPSILON){let ne=Math.sqrt(j),Se=Math.sqrt(w*w+F*F),xe=ce.x-T/ne,we=ce.y+fe/ne,Ne=K.x-F/Se,Ke=K.y+w/Se,se=((Ne-xe)*F-(Ke-we)*w)/(fe*F-T*w);ae=xe+fe*se-P.x,$=we+T*se-P.y;let it=ae*ae+$*$;if(it<=2)return new J(ae,$);Ae=Math.sqrt(it/2)}else{let ne=!1;fe>Number.EPSILON?w>Number.EPSILON&&(ne=!0):fe<-Number.EPSILON?w<-Number.EPSILON&&(ne=!0):Math.sign(T)===Math.sign(F)&&(ne=!0),ne?(ae=-T,$=fe,Ae=Math.sqrt(j)):(ae=fe,$=T,Ae=Math.sqrt(j/2))}return new J(ae/Ae,$/Ae)}let X=[];for(let P=0,ce=L.length,K=ce-1,ae=P+1;P<ce;P++,K++,ae++)K===ce&&(K=0),ae===ce&&(ae=0),X[P]=Z(L[P],L[K],L[ae]);let ie=[],Q,ue=X.concat();for(let P=0,ce=D.length;P<ce;P++){let K=D[P];Q=[];for(let ae=0,$=K.length,Ae=$-1,fe=ae+1;ae<$;ae++,Ae++,fe++)Ae===$&&(Ae=0),fe===$&&(fe=0),Q[ae]=Z(K[ae],K[Ae],K[fe]);ie.push(Q),ue=ue.concat(Q)}for(let P=0;P<m;P++){let ce=P/m,K=f*Math.cos(ce*Math.PI/2),ae=g*Math.sin(ce*Math.PI/2)+_;for(let $=0,Ae=L.length;$<Ae;$++){let fe=O(L[$],X[$],ae);ge(fe.x,fe.y,-K)}for(let $=0,Ae=D.length;$<Ae;$++){let fe=D[$];Q=ie[$];for(let T=0,w=fe.length;T<w;T++){let F=O(fe[T],Q[T],ae);ge(F.x,F.y,-K)}}}let V=g+_;for(let P=0;P<H;P++){let ce=d?O(M[P],ue[P],V):M[P];b?(A.copy(E.normals[0]).multiplyScalar(ce.x),S.copy(E.binormals[0]).multiplyScalar(ce.y),C.copy(x[0]).add(A).add(S),ge(C.x,C.y,C.z)):ge(ce.x,ce.y,0)}for(let P=1;P<=u;P++)for(let ce=0;ce<H;ce++){let K=d?O(M[ce],ue[ce],V):M[ce];b?(A.copy(E.normals[P]).multiplyScalar(K.x),S.copy(E.binormals[P]).multiplyScalar(K.y),C.copy(x[P]).add(A).add(S),ge(C.x,C.y,C.z)):ge(K.x,K.y,h/u*P)}for(let P=m-1;P>=0;P--){let ce=P/m,K=f*Math.cos(ce*Math.PI/2),ae=g*Math.sin(ce*Math.PI/2)+_;for(let $=0,Ae=L.length;$<Ae;$++){let fe=O(L[$],X[$],ae);ge(fe.x,fe.y,h+K)}for(let $=0,Ae=D.length;$<Ae;$++){let fe=D[$];Q=ie[$];for(let T=0,w=fe.length;T<w;T++){let F=O(fe[T],Q[T],ae);b?ge(F.x,F.y+x[u-1].y,x[u-1].x+K):ge(F.x,F.y,h+K)}}}ee(),ve();function ee(){let P=r.length/3;if(d){let ce=0,K=H*ce;for(let ae=0;ae<q;ae++){let $=Y[ae];Oe($[2]+K,$[1]+K,$[0]+K)}ce=u+m*2,K=H*ce;for(let ae=0;ae<q;ae++){let $=Y[ae];Oe($[0]+K,$[1]+K,$[2]+K)}}else{for(let ce=0;ce<q;ce++){let K=Y[ce];Oe(K[2],K[1],K[0])}for(let ce=0;ce<q;ce++){let K=Y[ce];Oe(K[0]+H*u,K[1]+H*u,K[2]+H*u)}}n.addGroup(P,r.length/3-P,0)}function ve(){let P=r.length/3,ce=0;Pe(L,ce),ce+=L.length;for(let K=0,ae=D.length;K<ae;K++){let $=D[K];Pe($,ce),ce+=$.length}n.addGroup(P,r.length/3-P,1)}function Pe(P,ce){let K=P.length;for(;--K>=0;){let ae=K,$=K-1;$<0&&($=P.length-1);for(let Ae=0,fe=u+m*2;Ae<fe;Ae++){let T=H*Ae,w=H*(Ae+1),F=ce+ae+T,j=ce+$+T,re=ce+$+w,ne=ce+ae+w;Fe(F,j,re,ne)}}}function ge(P,ce,K){l.push(P),l.push(ce),l.push(K)}function Oe(P,ce,K){Ee(P),Ee(ce),Ee(K);let ae=r.length/3,$=v.generateTopUV(n,r,ae-3,ae-2,ae-1);pe($[0]),pe($[1]),pe($[2])}function Fe(P,ce,K,ae){Ee(P),Ee(ce),Ee(ae),Ee(ce),Ee(K),Ee(ae);let $=r.length/3,Ae=v.generateSideWallUV(n,r,$-6,$-3,$-2,$-1);pe(Ae[0]),pe(Ae[1]),pe(Ae[3]),pe(Ae[1]),pe(Ae[2]),pe(Ae[3])}function Ee(P){r.push(l[P*3+0]),r.push(l[P*3+1]),r.push(l[P*3+2])}function pe(P){s.push(P.x),s.push(P.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return c_(t,n,e)}static fromJSON(e,t){let n=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];n.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new So[r.type]().fromJSON(r)),new i(n,e.options)}},l_={generateTopUV:function(i,e,t,n,r){let s=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[r*3],u=e[r*3+1];return[new J(s,o),new J(a,l),new J(c,u)]},generateSideWallUV:function(i,e,t,n,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],h=e[n*3+2],d=e[r*3],f=e[r*3+1],g=e[r*3+2],_=e[s*3],m=e[s*3+1],p=e[s*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new J(o,1-l),new J(c,1-h),new J(d,1-g),new J(_,1-p)]:[new J(a,1-l),new J(u,1-h),new J(f,1-g),new J(m,1-p)]}};function c_(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){let s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Tr=class i extends pl{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var xi=class i extends At{constructor(e=.5,t=1,n=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:o},n=Math.max(3,n),r=Math.max(1,r);let a=[],l=[],c=[],u=[],h=e,d=(t-e)/r,f=new I,g=new J;for(let _=0;_<=r;_++){for(let m=0;m<=n;m++){let p=s+m/n*o;f.x=h*Math.cos(p),f.y=h*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}h+=d}for(let _=0;_<r;_++){let m=_*(n+1);for(let p=0;p<n;p++){let v=p+m,x=v,b=v+n+1,E=v+n+2,S=v+1;a.push(x,b,S),a.push(b,E,S)}}this.setIndex(a),this.setAttribute("position",new Je(l,3)),this.setAttribute("normal",new Je(c,3)),this.setAttribute("uv",new Je(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Ar=class i extends At{constructor(e=new cn([new J(0,.5),new J(-.5,-.5),new J(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new Je(r,3)),this.setAttribute("normal",new Je(s,3)),this.setAttribute("uv",new Je(o,2));function c(u){let h=r.length/3,d=u.extractPoints(t),f=d.shape,g=d.holes;fi.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,p=g.length;m<p;m++){let v=g[m];fi.isClockWise(v)===!0&&(g[m]=v.reverse())}let _=fi.triangulateShape(f,g);for(let m=0,p=g.length;m<p;m++){let v=g[m];f=f.concat(v)}for(let m=0,p=f.length;m<p;m++){let v=f[m];r.push(v.x,v.y,0),s.push(0,0,1),o.push(v.x,v.y)}for(let m=0,p=_.length;m<p;m++){let v=_[m],x=v[0]+h,b=v[1]+h,E=v[2]+h;n.push(x,b,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return u_(t,e)}static fromJSON(e,t){let n=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];n.push(o)}return new i(n,e.curveSegments)}};function u_(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let r=i[t];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e}var Cn=class i extends At{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new I,d=new I,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){let v=[],x=p/n,b=0;p===0&&o===0?b=.5/t:p===n&&l===Math.PI&&(b=-.5/t);for(let E=0;E<=t;E++){let S=E/t;h.x=-e*Math.cos(r+S*s)*Math.sin(o+x*a),h.y=e*Math.cos(o+x*a),h.z=e*Math.sin(r+S*s)*Math.sin(o+x*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(S+b,1-x),v.push(c++)}u.push(v)}for(let p=0;p<n;p++)for(let v=0;v<t;v++){let x=u[p][v+1],b=u[p][v],E=u[p+1][v],S=u[p+1][v+1];(p!==0||o>0)&&f.push(x,b,S),(p!==n-1||l<Math.PI)&&f.push(b,E,S)}this.setIndex(f),this.setAttribute("position",new Je(g,3)),this.setAttribute("normal",new Je(_,3)),this.setAttribute("uv",new Je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var bn=class i extends At{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s},n=Math.floor(n),r=Math.floor(r);let o=[],a=[],l=[],c=[],u=new I,h=new I,d=new I;for(let f=0;f<=n;f++)for(let g=0;g<=r;g++){let _=g/r*s,m=f/n*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(_),h.y=(e+t*Math.cos(m))*Math.sin(_),h.z=t*Math.sin(m),a.push(h.x,h.y,h.z),u.x=e*Math.cos(_),u.y=e*Math.sin(_),d.subVectors(h,u).normalize(),l.push(d.x,d.y,d.z),c.push(g/r),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=r;g++){let _=(r+1)*f+g-1,m=(r+1)*(f-1)+g-1,p=(r+1)*(f-1)+g,v=(r+1)*f+g;o.push(_,m,v),o.push(m,p,v)}this.setIndex(o),this.setAttribute("position",new Je(a,3)),this.setAttribute("normal",new Je(l,3)),this.setAttribute("uv",new Je(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var Eo=class i extends At{constructor(e=new bo(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),t=64,n=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new I,l=new I,c=new J,u=new I,h=[],d=[],f=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new Je(h,3)),this.setAttribute("normal",new Je(d,3)),this.setAttribute("uv",new Je(f,2));function _(){for(let x=0;x<t;x++)m(x);m(s===!1?t:0),v(),p()}function m(x){u=e.getPointAt(x/t,u);let b=o.normals[x],E=o.binormals[x];for(let S=0;S<=r;S++){let A=S/r*Math.PI*2,C=Math.sin(A),y=-Math.cos(A);l.x=y*b.x+C*E.x,l.y=y*b.y+C*E.y,l.z=y*b.z+C*E.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,h.push(a.x,a.y,a.z)}}function p(){for(let x=1;x<=t;x++)for(let b=1;b<=r;b++){let E=(r+1)*(x-1)+(b-1),S=(r+1)*x+(b-1),A=(r+1)*x+b,C=(r+1)*(x-1)+b;g.push(E,S,C),g.push(S,A,C)}}function v(){for(let x=0;x<=t;x++)for(let b=0;b<=r;b++)c.x=x/t,c.y=b/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new So[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Pn=class extends Qn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Ze(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ul,this.normalScale=new J(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var To=class extends Qn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ze(16777215),this.specular=new Ze(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ze(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ul,this.normalScale=new J(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Il,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function Ks(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function h_(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Rr=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},xl=class extends Rr{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:kc,endingEnd:kc}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case Bc:s=e,a=2*t-n;break;case Gc:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Bc:o=e,l=2*n-t;break;case Gc:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(r-t),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,v=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,x=(-1-f)*m+(1.5+f)*_+.5*g,b=f*m-f*_;for(let E=0;E!==a;++E)s[E]=p*o[u+E]+v*o[c+E]+x*o[l+E]+b*o[h+E];return s}},_l=class extends Rr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(r-t),h=1-u;for(let d=0;d!==a;++d)s[d]=o[c+d]*h+o[l+d]*u;return s}},yl=class extends Rr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},In=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ks(t,this.TimeBufferType),this.values=Ks(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ks(e.times,Array),values:Ks(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new yl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new _l(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new xl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case $s:t=this.InterpolantFactoryMethodDiscrete;break;case js:t=this.InterpolantFactoryMethodLinear;break;case la:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return $s;case this.InterpolantFactoryMethodLinear:return js;case this.InterpolantFactoryMethodSmooth:return la}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&h_(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===la,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*n,d=h-n,f=h+n;for(let g=0;g!==n;++g){let _=t[h+g];if(_!==t[d+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};In.prototype.TimeBufferType=Float32Array;In.prototype.ValueBufferType=Float32Array;In.prototype.DefaultInterpolation=js;var Fi=class extends In{};Fi.prototype.ValueTypeName="bool";Fi.prototype.ValueBufferType=Array;Fi.prototype.DefaultInterpolation=$s;Fi.prototype.InterpolantFactoryMethodLinear=void 0;Fi.prototype.InterpolantFactoryMethodSmooth=void 0;var vl=class extends In{};vl.prototype.ValueTypeName="color";var bl=class extends In{};bl.prototype.ValueTypeName="number";var Ml=class extends Rr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)gi.slerpFlat(s,0,o,c-a,o,c,l);return s}},ls=class extends In{InterpolantFactoryMethodLinear(e){return new Ml(this.times,this.values,this.getValueSize(),e)}};ls.prototype.ValueTypeName="quaternion";ls.prototype.DefaultInterpolation=js;ls.prototype.InterpolantFactoryMethodSmooth=void 0;var zi=class extends In{};zi.prototype.ValueTypeName="string";zi.prototype.ValueBufferType=Array;zi.prototype.DefaultInterpolation=$s;zi.prototype.InterpolantFactoryMethodLinear=void 0;zi.prototype.InterpolantFactoryMethodSmooth=void 0;var Sl=class extends In{};Sl.prototype.ValueTypeName="vector";var wl=class{constructor(e,t,n){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null}}},d_=new wl,El=class{constructor(e){this.manager=e!==void 0?e:d_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};El.DEFAULT_MATERIAL_NAME="__DEFAULT";var Cr=class extends Yt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ze(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},Ao=class extends Cr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Yt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ze(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Fa=new dt,Ou=new I,Fu=new I,Ro=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new J(512,512),this.map=null,this.mapPass=null,this.matrix=new dt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new jr,this._frameExtents=new J(1,1),this._viewportCount=1,this._viewports=[new _t(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Ou.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ou),Fu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Fu),t.updateMatrixWorld(),Fa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Fa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Fa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var zu=new dt,qr=new I,za=new I,Tl=class extends Ro{constructor(){super(new en(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new J(4,2),this._viewportCount=6,this._viewports=[new _t(2,1,1,1),new _t(0,1,1,1),new _t(3,1,1,1),new _t(1,1,1,1),new _t(3,0,1,1),new _t(1,0,1,1)],this._cubeDirections=[new I(1,0,0),new I(-1,0,0),new I(0,0,1),new I(0,0,-1),new I(0,1,0),new I(0,-1,0)],this._cubeUps=[new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,0,1),new I(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),qr.setFromMatrixPosition(e.matrixWorld),n.position.copy(qr),za.copy(n.position),za.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(za),n.updateMatrixWorld(),r.makeTranslation(-qr.x,-qr.y,-qr.z),zu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(zu)}},Mn=class extends Cr{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new Tl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Al=class extends Ro{constructor(){super(new ei(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ki=class extends Cr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Yt.DEFAULT_UP),this.updateMatrix(),this.target=new Yt,this.shadow=new Al}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Co=class extends Cr{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var zl="\\[\\]\\.:\\/",f_=new RegExp("["+zl+"]","g"),kl="[^"+zl+"]",p_="[^"+zl.replace("\\.","")+"]",m_=/((?:WC+[\/:])*)/.source.replace("WC",kl),g_=/(WCOD+)?/.source.replace("WCOD",p_),x_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",kl),__=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",kl),y_=new RegExp("^"+m_+g_+x_+__+"$"),v_=["material","materials","bones","map"],Rl=class{constructor(e,t,n){let r=n||xt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},xt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(f_,"")}static parseTrackName(e){let t=y_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);v_.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=Rl;xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray];xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Sv=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var cs={angled:45,top:75},Gl=0,Hl={angled:Gl,top:0},b_=90;function Vl(i){return Math.round(i/90)*90}function Wl(i){return Math.max(cs.angled,Math.min(b_,i))}var us=i=>Math.sin(i*Math.PI/180);function dh(i,e,t,n){let r=n?1:1-Math.exp(-t*11),s=!1;for(let o of["yaw","pitch","tx","tz","zoom"]){let a=e[o]-i[o];a!==0&&(i[o]=Math.abs(a)>(o==="yaw"||o==="pitch"?.02:.002)&&!n?i[o]+a*r:e[o],i[o]!==e[o]&&(s=!0))}return s}var hh=(i,e)=>Math.max(-Math.max(0,e),Math.min(Math.max(0,e),i));function Uo(i,e,t,n){let r=i.yaw*Math.PI/180,s=Math.cos(r),o=Math.sin(r),a=i.tx*s-i.tz*o,l=-i.tx*o-i.tz*s,c=(e*Math.abs(s)+t*Math.abs(o))/2,u=(e*Math.abs(o)+t*Math.abs(s))/2,h=hh(a,c+1-i.zoom*n/2),d=hh(l,u+1-i.zoom/2/us(i.pitch));return{...i,tx:h*s-d*o,tz:-h*o-d*s}}function fh(i,e,t,n){let r=i.yaw*Math.PI/180,s=Math.cos(r),o=-Math.sin(r),a=-Math.sin(r),l=-Math.cos(r),c=e*n,u=t*n/us(i.pitch);return{...i,tx:i.tx-s*c+a*u,tz:i.tz-o*c+l*u}}function Xl(i,e){return i+360*Math.round((e-i)/360)}var Bl=5,un=1.25,ph=i=>2*un*Math.cos(i*Math.PI/180);function mh(i,e,t,n,r){let s=r*Math.PI/180,o=Math.abs(Math.cos(s)),a=Math.abs(Math.sin(s)),l=e+2,c=t+2,u=l*o+c*a,h=(l*a+c*o)*us(n);return Math.max(Bl,h+ph(n),u/i)}function gh(i,e,t,n){let r=Math.hypot(e+2,t+2);return{min:Bl,max:Math.max(Bl,r*us(n)+ph(n),r/i)}}var No=(i,e)=>Math.max(e.min,Math.min(e.max,i));function Bi(i,e,t){let n=i.yaw*Math.PI/180,r=t/us(i.pitch);return{x:i.tx+Math.cos(n)*e-Math.sin(n)*r,z:i.tz-Math.sin(n)*e-Math.cos(n)*r}}function xh(i,e,t,n,r){let s=No(i.zoom*e,r),o=i.zoom-s,a=Bi(i,t*o,n*o);return{...i,zoom:s,tx:a.x,tz:a.z}}function _h(i,e){let t=i.zoom/2,n=t*e;return{corners:[Bi(i,-n,t),Bi(i,n,t),Bi(i,n,-t),Bi(i,-n,-t)],tick:[Bi(i,0,0),Bi(i,0,t*.4)]}}function yh(i,e,t,n){let r=i<520?8:11,s=Math.min(Math.floor(i*.5/t),Math.floor(e*.4/n));return Math.max(2,Math.min(r,s))}function vh(i,e,t,n,r){return[(i.x+e/2)*n,r+(i.z+t/2)*n]}function bh(i,e,t,n,r,s){return{x:i/r-t/2,z:(e-s)/r-n/2}}var Mh={items:"plate",beacon:!1,cutaway:!1,steep:!1,caps:!1},Sh="crete-variant";function M_(i){let e={...Mh};if(!i)return e;let t;try{t=JSON.parse(i)}catch{return e}if(!t||typeof t!="object")return e;let n=t;(n.items==="cyan"||n.items==="white"||n.items==="plate")&&(e.items=n.items);for(let r of["beacon","cutaway","steep","caps"])typeof n[r]=="boolean"&&(e[r]=n[r]);return e}var wh=Mh;function hn(){return wh}function Eh(i){wh=M_(i)}function Th(i,e,t){return t>700||Math.hypot(i,e)<24?null:Math.abs(i)>Math.abs(e)?i>0?"right":"left":e>0?"down":"up"}var S_=.35,Ah=.3,hs=10,w_=280,E_=12,T_=320,A_=40,R_=.0015,Rh=10;function Ch(i){let e=new Map,t=null,n=null,r=!1,s=null,o=null,a=!1,l=()=>{let[c,u]=[...e.values()];return!c||!u?{ang:0,d:0,mx:0,my:0}:{ang:Math.atan2(u.y-c.y,u.x-c.x),d:Math.hypot(u.x-c.x,u.y-c.y),mx:(c.x+u.x)/2,my:(c.y+u.y)/2}};return{down(c){e.set(c.id,{x:c.x,y:c.y,sx:c.x,sy:c.y,x0:c.x,y0:c.y,t0:i(),type:c.type,button:c.button});for(let u of e.values())u.sx=u.x,u.sy=u.y;return t=e.size===2?l():null,o=t,s=null,e.size>1&&(r=!0),[]},move(c){let u=e.get(c.id);if(!u)return[];let h=c.x-u.x,d=c.y-u.y;u.x=c.x,u.y=c.y;let f=[];if(e.size===1){if(u.type!=="mouse")return f;u.button===1||u.button===2?(h!==0||d!==0)&&f.push({kind:"pan",dx:h,dy:d}):(h!==0&&f.push({kind:"turn",deg:-h*S_}),d!==0&&f.push({kind:"tilt",deg:-d*Ah}))}else if(e.size===2&&t&&o){let g=l();if(!s){let[x,b]=[...e.values()],E=x.y-x.sy,S=b.y-b.sy,A=x.x-x.sx,C=b.x-b.sx,y=Math.min(Math.hypot(A,E),Math.hypot(C,S)),M=Math.max(Math.hypot(A,E),Math.hypot(C,S));if(!(Math.abs(g.d-o.d)>=hs)&&(M<hs||y<hs/2&&M<2*hs))return f;let z=Math.abs(Math.sin(o.ang))<Math.sin(35*Math.PI/180),Y=Math.sign(E)===Math.sign(S)&&Math.min(Math.abs(E),Math.abs(S))>hs/2&&Math.abs(E-S)<Math.max(Math.abs(E),Math.abs(S))/2,L=Math.abs(A)<Math.abs(E)/2&&Math.abs(C)<Math.abs(S)/2;s=z&&Y&&L?"tilt":"free"}if(s==="tilt"){let x=g.my-t.my;return x!==0&&f.push({kind:"tilt",deg:-x*Ah}),t=g,f.length&&(a=!0),f}let _=g.ang-t.ang;_>Math.PI&&(_-=2*Math.PI),_<-Math.PI&&(_+=2*Math.PI),_!==0&&f.push({kind:"turn",deg:_*180/Math.PI});let m=g.mx-t.mx,p=g.my-t.my;(m!==0||p!==0)&&f.push({kind:"pan",dx:m,dy:p});let v=Math.max(Rh,t.d)/Math.max(Rh,g.d);v!==1&&f.push({kind:"zoom",factor:v,x:g.mx,y:g.my}),t=g}return f.length&&(a=!0),f},up(c){let u=e.get(c.id);if(!u)return[];e.delete(c.id),t=null,o=null;let h=r;if(e.size===0&&(r=!1),e.size===0&&a)return a=!1,[{kind:"settle"}];if(u.type==="mouse"||e.size!==0||h)return[];let d=i(),f=Th(c.x-u.x0,c.y-u.y0,d-u.t0);return f?(n=null,[{kind:"swipe",dir:f}]):d-u.t0>=w_||Math.hypot(c.x-u.x0,c.y-u.y0)>=E_?[]:n&&d-n.t<T_&&Math.hypot(c.x-n.x,c.y-n.y)<A_?(n=null,[{kind:"reset"}]):(n={t:d,x:c.x,y:c.y},[])},cancel(c){return e.delete(c),t=null,o=null,e.size===0&&(r=!1,a)?(a=!1,[{kind:"settle"}]):[]},wheel(c,u,h){return c===0?[]:[{kind:"zoom",factor:Math.exp(c*R_),x:u,y:h}]}}}var Ph=90,Ih=1.2,C_=16,P_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/></svg>',I_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>',L_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',D_='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',U_='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="n" d="M12 3l3.5 9h-7z"/><path class="s" d="M12 21l-3.5-9h7z"/></svg>';function Ir(i,e,t,n){let r=document.createElement("button");return r.type="button",r.id=i,r.className=n,r.setAttribute("aria-label",e),r.title=e,r.innerHTML=t,r}function Lh(i,e,t,n){let r=Ch(()=>performance.now()),s=C=>({id:C.pointerId,x:C.clientX,y:C.clientY,type:C.pointerType==="touch"||C.pointerType==="pen"?C.pointerType:"mouse",button:C.button}),o=C=>{if(!(!C.length||t.blocked())){t.gesture();for(let y of C)if(y.kind==="swipe")t.swipe(y.dir);else if(y.kind==="turn")n.turn(y.deg,!1);else if(y.kind==="tilt")n.tilt(y.deg);else if(y.kind==="settle")n.settle();else if(y.kind==="pan")n.pan(y.dx,y.dy);else if(y.kind==="zoom"){let M=i.getBoundingClientRect();n.zoom(y.factor,(y.x-M.left)/(M.width||1)-.5,.5-(y.y-M.top)/(M.height||1),!1)}else n.reset()}},a=C=>{if(!t.blocked()){try{i.setPointerCapture(C.pointerId)}catch{}o(r.down(s(C)))}},l=C=>o(r.move(s(C))),c=C=>o(r.up(s(C))),u=C=>o(r.cancel(C.pointerId)),h=()=>{t.blocked()||(t.gesture(),n.reset())},d=C=>C.preventDefault(),f=C=>{if(t.blocked())return;C.preventDefault();let y=C.deltaMode===1?C_:C.deltaMode===2?i.clientHeight:1;o(r.wheel(C.deltaY*y,C.clientX,C.clientY))};i.style.touchAction="none",i.addEventListener("pointerdown",a),i.addEventListener("pointermove",l),i.addEventListener("pointerup",c),i.addEventListener("pointercancel",u),i.addEventListener("dblclick",h),i.addEventListener("contextmenu",d),i.addEventListener("wheel",f,{passive:!1});let g=document.createElement("button");g.type="button",g.className="modern-viewbtn",g.textContent="View",g.setAttribute("aria-expanded","false"),g.setAttribute("aria-controls","cam-buttons");let _=document.createElement("div");_.id="cam-buttons",_.className="cam",_.setAttribute("role","group"),_.setAttribute("aria-label","Camera");let m=Ir("cam-left","Turn left",P_,"cbtn"),p=Ir("cam-right","Turn right",I_,"cbtn"),v=Ir("cam-zoom-in","Zoom in",L_,"cbtn"),x=Ir("cam-zoom-out","Zoom out",D_,"cbtn"),b=Ir("cam-reset","Reset view","Reset","cbtn wide");_.append(m,p,v,x,b);let E=Ir("cam-compass","Compass: reset the view",U_,"compass"),S=E.querySelector("svg");e.append(g,_,E);let A=C=>()=>{t.blocked()||(t.gesture(),C())};return m.addEventListener("click",A(()=>n.turn(-Ph,!0))),p.addEventListener("click",A(()=>n.turn(Ph,!0))),v.addEventListener("click",A(()=>n.zoom(1/Ih,0,0,!0))),x.addEventListener("click",A(()=>n.zoom(Ih,0,0,!0))),b.addEventListener("click",A(()=>n.reset())),E.addEventListener("click",A(()=>n.reset())),g.addEventListener("click",()=>{let C=_.classList.toggle("open");g.setAttribute("aria-expanded",String(C))}),{setTurnable(C){m.hidden=p.hidden=E.hidden=!C},setHeading(C){S.style.transform=`rotate(${C}deg)`},dispose(){i.removeEventListener("pointerdown",a),i.removeEventListener("pointermove",l),i.removeEventListener("pointerup",c),i.removeEventListener("pointercancel",u),i.removeEventListener("dblclick",h),i.removeEventListener("contextmenu",d),i.removeEventListener("wheel",f),g.remove(),_.remove()}}}function Dh(i,e){let t=[];for(let n=0;n<i.terrain.length;n++)(i.terrain[n]!==e.terrain[n]||i.objects[n]!==e.objects[n])&&t.push(n);return t}function ql(i,e){let t=[];return i.forEach((n,r)=>{n==="water"&&e[r]==="dirt"&&t.push(r)}),t}function Uh(i,e){if(i<=0)return e;if(i<.25){let t=i/.25;return e+(-.2-e)*t*t}if(i<.25+.35){let t=(i-.25)/.35;return-.2+(.065- -.2)*(1-(1-t)**3)}return .065}function Nh(i,e){return e?0:.012*Math.sin(2*Math.PI*i/3)}var N_=i=>Math.max(0,Math.min(1,i)),O_=.06666666666666667;function Oh(i){return 1-.67*N_(i)}function Fh(i,e,t){let n=e-i;return Math.abs(n)<.005?e:i+n*(1-Math.exp(-t/O_))}function zh(i,e,t){let n=e?[e]:[];return i==="ghosted"?[...n,...t]:n}var Lr=["up","down","left","right"];var Yl={mirror:{name:"Medusa's mirror",key:"Z",desc:"Turns the Minotaur to stone for the turn you raise it and the 3 turns after; stone blocks everyone."},cake:{name:"Honey cake",key:"X",desc:"Adds one heart, with no limit; extra hearts last until the level ends."},cow:{name:"Daedalus's cow",key:"C",desc:"Set down where you stand; the Minotaur goes for it first."}},ot=(i,e,t,n={},r,s=e)=>({char:i,minotaur:e,block:t,hazard:s,...n,sprites:r??[]}),ti={floor:ot(".",!0,!0,{},["floor"]),wall:ot("#",!1,!1,{},["wall"]),exit:ot("E",!1,!1,{},["exit"]),gate:ot("|",!1,!1,{},["gate-closed","gate-open"]),water:ot("~",!1,!0,{needs:"flippers"},["water"]),fire:ot("F",!1,!1,{needs:"fire-boots"},["fire"]),ice:ot("=",!0,!0,{slides:"skates"},["ice"]),"force-up":ot("^",!0,!0,{carries:"up"},["force-up"]),"force-down":ot("v",!0,!0,{carries:"down"},["force-down"]),"force-left":ot("<",!0,!0,{carries:"left"},["force-left"]),"force-right":ot(">",!0,!0,{carries:"right"},["force-right"]),dirt:ot("%",!0,!0,{},["dirt"]),safe:ot("S",!1,!1,{},["safe"]),button:ot("_",!0,!0,{},["button"]),"toggle-open":ot("t",!0,!1,{},["toggle-open"]),"toggle-closed":ot("T",!1,!1,{},["toggle-closed"]),"door-red":ot("R",!1,!1,{door:"red"},["door-red"]),"door-blue":ot("B",!1,!1,{door:"blue"},["door-blue"]),"door-yellow":ot("Y",!1,!1,{door:"yellow"},["door-yellow"]),"door-green":ot("G",!1,!1,{door:"green"},["door-green"]),trap:ot("&",!0,!0,{},["trap"]),"button-brown":ot("-",!0,!0,{},["button-brown"]),"button-red":ot("+",!0,!0,{},["button-red"]),popup:ot(";",!1,!1,{},["popup"]),gravel:ot(":",!1,!1,{},["gravel"]),"fake-wall":ot("W",!1,!1,{},["wall"]),"invisible-wall":ot("I",!1,!1,{},["floor"]),teleport:ot("@",!1,!1,{},["teleport"]),thief:ot("$",!0,!0,{},["thief"]),bomb:ot("!",!1,!0,{},["bomb"],!0),clone:ot("C",!1,!1,{},Lr.map(i=>`clone-${i}`))},Ln={ball:{char:"o",name:"Bronze ball",sprite:"ball",turns:["back"]},glider:{char:"w",name:"Harpy",sprite:"glider",turns:["left","right","back"],crosses:"water"},fireball:{char:"e",name:"Talos's fire",sprite:"fireball",turns:["right","left","back"],crosses:"fire"}};var Dn={relic:{char:"*",sprite:"relic",name:"relic"},"key-red":{char:"r",sprite:"key-red",name:"red key"},"key-blue":{char:"b",sprite:"key-blue",name:"blue key"},"key-yellow":{char:"y",sprite:"key-yellow",name:"yellow key"},"key-green":{char:"g",sprite:"key-green",name:"green key"},flippers:{char:"f",sprite:"flippers",name:"flippers"},"fire-boots":{char:"h",sprite:"fire-boots",name:"fire boots"},skates:{char:"k",sprite:"skates",name:"skates"},suction:{char:"u",sprite:"suction",name:"suction boots"},mirror:{char:"z",sprite:"mirror",name:Yl.mirror.name},cake:{char:"x",sprite:"cake",name:Yl.cake.name},cow:{char:"c",sprite:"cow",name:Yl.cow.name},page:{char:"p",sprite:"page",name:"story page"},block:{char:"O",sprite:"block",name:"block"}},F_=["theseus","minotaur","minotaur-stone","cow-standing"],Nv=[...new Set([...Object.values(ti).flatMap(i=>i.sprites),...Object.values(Dn).map(i=>i.sprite),...F_,...Object.values(Ln).map(i=>i.sprite)])];var kh={minotaur:16730682,theseus:3593324,hazard:12614911,item:3859711},Bh=657414,z_=14;function Gh(i){return Math.max(1,z_/(ds*Math.max(i,1e-6)))}var ds=.26,Oo=.44,k_=.06,B_=.02,G_=2.4,H_=new Set(Object.values(Ln).map(i=>i.sprite)),V_=new Set(Object.values(Dn).map(i=>i.sprite).filter(i=>i!==Dn.block.sprite));function Hh(i,e=hn().items){return i.id?.startsWith("machine")?null:i.model==="theseus"?"theseus":i.model==="minotaur"||i.model==="minotaur-stone"?"minotaur":e==="plate"?null:H_.has(i.model)?"hazard":V_.has(i.model)?"item":null}function Vh(i,e,t=0){let n=e*Math.PI/180;return i*Math.cos(n)+t*Math.sin(n)+k_}function Wh(i,e){return e?0:-B_*(1-Math.cos(2*Math.PI*i/G_))}var Xh=.08;function qh(i,e,t,n,r,s,o){let a=(l,c,u)=>c>u?0:Math.max(c,Math.min(u,l))-l;return[a(i,-r+o+t/2,r-o-t/2),a(e,-s+o,s-o-n)]}function Bo(i,e){let t=i[e],n=i[e+1];return!t||!n||n.jump?null:n.r<t.r?"up":n.r>t.r?"down":n.c<t.c?"left":"right"}function $h(i,e,t){let n=i.getContext("2d"),r=e.rise/e.cell,s=16,o=0;return{size(a,l,c){let u=window.devicePixelRatio||1;s=Math.max(1,Math.round(c*u)),o=Math.round(r*s),i.width=a*s,i.height=l*s+o,i.style.width=`${i.width/u}px`,i.style.height=`${i.height/u}px`,i.dataset.cell=String(c),n.setTransform(1,0,0,1,0,0),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality="high"},paint(a,l){n.clearRect(0,0,i.width,i.height);let c=e.cell,u=e.cell+e.rise;for(let h of a){let d=e.sprites[h.sprite];d&&n.drawImage(t,d.x+h.frame*c,d.y,c,u,Math.round(h.x*s),Math.round(h.y*s),s,s+o)}l&&l.length>1&&j_(n,l,s,o)}}}var X_="#c0392b",q_="#ff5b45",Jh="#1c0402",Y_=12,Z_=.42,K_=.14,J_=.2,$_={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function j_(i,e,t,n){let r=c=>[(c.c+.5)*t,(c.r+.5)*t+n],s=Math.max(1.5,t/12),o=Math.max(.75,t/30);if(i.lineJoin="round",i.lineCap="round",i.beginPath(),e.forEach((c,u)=>{let[h,d]=r(c);u===0||c.jump?i.moveTo(h,d):i.lineTo(h,d)}),i.strokeStyle=Jh,i.lineWidth=s+2*o,i.stroke(),i.strokeStyle=X_,i.lineWidth=s,i.stroke(),t<Y_)return;let a=t*Z_,l=t*K_;i.lineJoin="miter";for(let c=0;c<e.length;c++){let u=Bo(e,c);if(!u)continue;let[h,d]=r(e[c]);i.save(),i.translate(h,d),i.rotate($_[u]),i.translate(t*J_,0),i.beginPath(),i.moveTo(a/2,0),i.lineTo(-a/2,-l),i.lineTo(-a/4,0),i.lineTo(-a/2,l),i.closePath(),i.lineWidth=Math.max(1,t/21),i.strokeStyle=Jh,i.stroke(),i.fillStyle=q_,i.fill(),i.restore()}}function Q_(i,e,t){let n=i.sprites[e];return!n||n.frames<=1||n.fps<=0?0:Math.floor(t*n.fps/1e3)%n.frames}function jh(i,e,t,n){let r=[],s=(c,u,h)=>r.push({sprite:c,frame:Q_(t,c,n),x:u,y:h}),{rows:o,cols:a}=i.level,l=(c,u)=>!!c&&Math.ceil(c.r-1e-9)===u;for(let c=0;c<o;c++){for(let u=0;u<a;u++){let h=i.terrain[c*a+u],d=ti[h].sprites,f=h==="clone"?i.level.machines.find(g=>g.at.r===c&&g.at.c===u):void 0;s(f?d[Lr.indexOf(f.dir)]:h==="gate"&&i.relicsLeft===0?d[1]:d[0],u,c)}for(let u=0;u<a;u++){let h=i.objects[c*a+u];h==="block"&&e.blocks?.some(d=>d.origin.r===c&&d.origin.c===u)||h&&s(Dn[h].sprite,u,c)}for(let u of i.level.machines)u.at.r===c&&s(u.template==="block"?Dn.block.sprite:Ln[u.template].sprite,u.at.c,c);for(let u of e.blocks??[])l(u.at,c)&&s(Dn.block.sprite,u.at.c,u.at.r);for(let u of e.hazards)l(u.at,c)&&s(Ln[u.kind].sprite,u.at.c,u.at.r);i.cow&&i.cow.r===c&&s("cow-standing",i.cow.c,c),l(e.minotaur,c)&&s(i.stone>0?"minotaur-stone":"minotaur",e.minotaur.c,e.minotaur.r),l(e.player,c)&&s("theseus",e.player.c,e.player.r)}return r}function Qh(i){return!(i instanceof HTMLImageElement)||i.complete&&i.naturalWidth>0}function ed(i,e,t,n){let r=document.createElement("div");r.className="minimap",r.hidden=!0;let s=document.createElement("canvas");s.id="minimap",s.setAttribute("aria-hidden","true");let o=document.createElement("canvas");o.id="minimap-view",o.setAttribute("role","img"),o.setAttribute("aria-label","Mini map: the whole level from above; the outline is what the camera sees. Tap to look there."),r.append(s,o),i.append(r);let a=$h(s,e,t),l=o.getContext("2d"),c=null,u=null,h=0,d=0,f=0,g=0,_=0,m=1,p=0;function v(){if(!c)return;let D=c.s.level.cols,z=c.s.level.rows,Y=yh(h||1280,d||800,D,z);if(D===f&&z===g&&Y===_)return;f=D,g=z,_=Y,a.size(f,g,_);let L=window.devicePixelRatio||1;o.width=s.width,o.height=s.height,o.style.width=s.style.width,o.style.height=s.style.height,m=s.width/L/f,p=s.height/L-g*m}function x(){!c||!Qh(t)||a.paint(jh(c.s,c.f,e,0),c.thread??void 0)}function b(){if(!u||!f)return;let D=window.devicePixelRatio||1;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,o.width,o.height),l.setTransform(D,0,0,D,0,0);let z=_h(u.c,u.aspect),Y=H=>vh(H,f,g,m,p);l.save(),l.beginPath(),l.rect(0,p,f*m,g*m),l.clip(),l.beginPath(),z.corners.map(Y).forEach(([H,q],Z)=>Z?l.lineTo(H,q):l.moveTo(H,q)),l.closePath(),l.fillStyle="rgba(255,230,180,0.10)",l.fill(),l.lineWidth=1.5,l.strokeStyle="#ffd890",l.stroke();let[L,O]=z.tick.map(Y);l.beginPath(),l.moveTo(L[0],L[1]),l.lineTo(O[0],O[1]),l.stroke(),l.restore()}let E=()=>x();Qh(t)||t.addEventListener("load",E,{once:!0});let S=!1,A=D=>{if(n.blocked()||!f)return;let z=o.getBoundingClientRect();n.look(bh(D.clientX-z.left,D.clientY-z.top,f,g,m,p))},C=D=>{if(!n.blocked()){S=!0;try{o.setPointerCapture(D.pointerId)}catch{}A(D)}},y=D=>{S&&A(D)},M=()=>{S=!1};return o.addEventListener("pointerdown",C),o.addEventListener("pointermove",y),o.addEventListener("pointerup",M),o.addEventListener("pointercancel",M),{show(D){r.hidden=!D},paint(D,z,Y){c={s:D,f:z,thread:Y},v(),x(),b()},view(D,z){u={c:{...D},aspect:z},b()},fit(D,z){h=D,d=z;let Y=_;v(),_!==Y&&(x(),b())},dispose(){t.removeEventListener("load",E),r.remove()}}}var ms={floor:"flag",wall:"none",exit:"none","gate-closed":"flag","gate-open":"flag",water:"water",fire:"ember",ice:"ice","force-up":"force","force-down":"force","force-left":"force","force-right":"force",dirt:"dirt",safe:"flag",button:"flag","toggle-open":"flag","toggle-closed":"flag","door-red":"flag","door-blue":"flag","door-yellow":"flag","door-green":"flag",trap:"flag","button-brown":"flag","button-red":"flag",popup:"flag",gravel:"gravel",teleport:"flag",thief:"flag",bomb:"flag","clone-up":"flag","clone-down":"flag","clone-left":"flag","clone-right":"flag"};function td(i,e){let t=i.terrain[e],n=ti[t].sprites;if(t==="clone"){let r=Math.floor(e/i.level.cols),s=e%i.level.cols,o=i.level.machines.find(a=>a.at.r===r&&a.at.c===s);return n[Lr.indexOf(o?.dir??"up")]}return t==="gate"&&i.relicsLeft===0?n[1]:n[0]}var nd=["theseus","minotaur","minotaur-stone"];function id(i,e){let t=[],n=i.level.cols;i.objects.forEach((r,s)=>{if(!r)return;let o=Math.floor(s/n),a=s%n;r==="block"&&e.blocks?.some(l=>l.origin.r===o&&l.origin.c===a)||t.push({model:Dn[r].sprite,r:o,c:a,id:`o${s}`})});for(let r of i.level.machines){let s=r.template==="block"?Dn.block.sprite:Ln[r.template].sprite;t.push({model:s,r:r.at.r,c:r.at.c,id:`machine${r.at.r*n+r.at.c}`,dir:r.dir})}for(let r of e.blocks??[])t.push({model:"block",r:r.at.r,c:r.at.c,id:null});for(let r of e.hazards){let s=i.hazards.find(o=>o.kind===r.kind&&o.at.r===r.at.r&&o.at.c===r.at.c);t.push({model:Ln[r.kind].sprite,r:r.at.r,c:r.at.c,id:null,dir:s?.dir})}return i.cow&&t.push({model:"cow-standing",r:i.cow.r,c:i.cow.c,id:"cow"}),e.minotaur&&t.push({model:i.stone>0?"minotaur-stone":"minotaur",r:e.minotaur.r,c:e.minotaur.c,id:"minotaur"}),t.push({model:"theseus",r:e.player.r,c:e.player.c,id:"theseus"}),t}function rd(){return{q:3,gaps:[],skip:10,fails:[0,0,0,0]}}function gs(i){i.gaps=[],i.skip=10}function Go(i,e){let t=0;for(let n=i.length-1;n>=0;n--)if(t+=i[n],t>=e)return(i.length-n)*1e3/t;return null}function sd(i,e){if(e>250)return i.q;if(i.skip>0)return i.skip--,i.q;i.gaps.push(e);let t=0,n=0;for(let s=i.gaps.length-1;s>=0&&t<3e3;s--,n++)t+=i.gaps[s];n<i.gaps.length&&(i.gaps=i.gaps.slice(-n));let r=Go(i.gaps,2e3);if(r!==null&&r<40&&i.q>0)i.fails[i.q]++,i.q=i.q-1,gs(i);else if(i.q<3&&(i.fails[i.q+1]??0)<2){let s=Go(i.gaps,3e3);s!==null&&s>55&&(i.q=i.q+1,gs(i))}return i.q}function od(i,e){return i?e:null}var xs=new I;function Sn(i,e,t,n,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;xs.copy(e),xs[n]=0,xs.normalize();let c=.5*o/(o+a),u=1-xs.angleTo(i)/l;return Math.sign(xs[t])===1?u*c:a/(o+a)+c+c*(1-u)}var Fn=class extends ln{constructor(e=1,t=1,n=1,r=2,s=.1){if(r=r*2+1,s=Math.min(e/2,t/2,n/2,s),super(1,1,1,r,r,r),r===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new I,l=new I,c=new I(e,t,n).divideScalar(2).subScalar(s),u=this.attributes.position.array,h=this.attributes.normal.array,d=this.attributes.uv.array,f=u.length/6,g=new I,_=.5/r;for(let m=0,p=0;m<u.length;m+=3,p+=2)switch(a.fromArray(u,m),l.copy(a),l.x-=Math.sign(l.x)*_,l.y-=Math.sign(l.y)*_,l.z-=Math.sign(l.z)*_,l.normalize(),u[m+0]=c.x*Math.sign(a.x)+l.x*s,u[m+1]=c.y*Math.sign(a.y)+l.y*s,u[m+2]=c.z*Math.sign(a.z)+l.z*s,h[m+0]=l.x,h[m+1]=l.y,h[m+2]=l.z,Math.floor(m/f)){case 0:g.set(1,0,0),d[p+0]=Sn(g,l,"z","y",s,n),d[p+1]=1-Sn(g,l,"y","z",s,t);break;case 1:g.set(-1,0,0),d[p+0]=1-Sn(g,l,"z","y",s,n),d[p+1]=1-Sn(g,l,"y","z",s,t);break;case 2:g.set(0,1,0),d[p+0]=1-Sn(g,l,"x","z",s,e),d[p+1]=Sn(g,l,"z","x",s,n);break;case 3:g.set(0,-1,0),d[p+0]=1-Sn(g,l,"x","z",s,e),d[p+1]=1-Sn(g,l,"z","x",s,n);break;case 4:g.set(0,0,1),d[p+0]=1-Sn(g,l,"x","y",s,e),d[p+1]=1-Sn(g,l,"y","x",s,t);break;case 5:g.set(0,0,-1),d[p+0]=Sn(g,l,"x","y",s,e),d[p+1]=1-Sn(g,l,"y","x",s,t);break}}};var Ho=class extends On{constructor(e=null){super();let t=new ln;t.deleteAttribute("uv");let n=new Pn({side:Lt}),r=new Pn,s=5;e!==null&&e._useLegacyLights===!1&&(s=900);let o=new Mn(16777215,s,28,2);o.position.set(.418,16.199,.3),this.add(o);let a=new le(t,n);a.position.set(-.757,13.219,.717),a.scale.set(31.713,28.305,28.591),this.add(a);let l=new le(t,r);l.position.set(-10.906,2.009,1.846),l.rotation.set(0,-.195,0),l.scale.set(2.328,7.905,4.651),this.add(l);let c=new le(t,r);c.position.set(-5.607,-.754,-.758),c.rotation.set(0,.994,0),c.scale.set(1.97,1.534,3.955),this.add(c);let u=new le(t,r);u.position.set(6.167,.857,7.803),u.rotation.set(0,.561,0),u.scale.set(3.927,6.285,3.687),this.add(u);let h=new le(t,r);h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),this.add(h);let d=new le(t,r);d.position.set(2.291,-.756,-2.621),d.rotation.set(0,-.286,0),d.scale.set(1.546,1.552,1.496),this.add(d);let f=new le(t,r);f.position.set(-2.193,-.369,-5.547),f.rotation.set(0,.516,0),f.scale.set(3.875,3.487,2.986),this.add(f);let g=new le(t,Dr(50));g.position.set(-16.116,14.37,8.208),g.scale.set(.1,2.428,2.739),this.add(g);let _=new le(t,Dr(50));_.position.set(-16.109,18.021,-8.207),_.scale.set(.1,2.425,2.751),this.add(_);let m=new le(t,Dr(17));m.position.set(14.904,12.198,-1.832),m.scale.set(.15,4.265,6.331),this.add(m);let p=new le(t,Dr(43));p.position.set(-.462,8.89,14.52),p.scale.set(4.38,5.441,.088),this.add(p);let v=new le(t,Dr(20));v.position.set(3.235,11.486,-12.541),v.scale.set(2.5,2,.1),this.add(v);let x=new le(t,Dr(100));x.position.set(0,20,0),x.scale.set(1,.1,1),this.add(x)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Dr(i){let e=new ft;return e.color.setScalar(i),e}function Ot(i){return()=>(i=i*1664525+1013904223>>>0,i/4294967296)}function jt(i,e,t=!0){let n=document.createElement("canvas");n.width=n.height=i,e(n.getContext("2d"),i);let r=new Sr(n);return t&&(r.colorSpace=Ct),r.wrapS=r.wrapT=yr,r.anisotropy=8,r}function yt(i,e,t,n,r,s,o,a,l=!0){for(let c=0;c<n;c++){let u=t()*e,h=t()*e,d=o+t()*(a-o);i.fillStyle=`rgba(${r},${(s*(.3+.7*t())).toFixed(3)})`;let f=l?[-e,0,e]:[0];for(let g of f)for(let _ of f)l&&(Math.abs(u+g-e/2)>e/2+d||Math.abs(h+_-e/2)>e/2+d)||(i.beginPath(),i.arc(u+g,h+_,d,0,7),i.fill())}}function _s(i,e,t){let n=i.createRadialGradient(e/2,e/2,e*.3,e/2,e/2,e*.72);n.addColorStop(0,"rgba(0,0,0,0)"),n.addColorStop(1,`rgba(20,14,10,${t})`),i.fillStyle=n,i.fillRect(0,0,e,e)}function Zl(i,e,t,n,r,s,o){i.strokeStyle=r,i.lineWidth=s;for(let a=0;a<n;a++){i.beginPath();let l=t()*e,c=t()*e;i.moveTo(l,c);for(let u=0;u<6;u++)l+=(t()-.5)*o,c+=(t()-.5)*o,i.lineTo(l,c);i.stroke()}}var ey=i=>jt(256,(e,t)=>{let n=Ot(i);e.fillStyle="#dcc699",e.fillRect(0,0,t,t),yt(e,t,n,260,"150,120,80",.06,6,26,!1),yt(e,t,n,220,"242,226,192",.1,5,20,!1),yt(e,t,n,1800,"120,96,66",.1,.6,2,!1),yt(e,t,n,900,"250,238,212",.12,.6,1.6,!1),Zl(e,t,n,2,"rgba(120,94,62,.4)",1.3,60),_s(e,t,.12)}),ty=()=>jt(256,(i,e)=>{let t=Ot(7);i.fillStyle="#15171a",i.fillRect(0,0,e,e);let n=e/4,r=e/2;for(let s=0;s<4;s++){let o=s%2?r/2:0;for(let a=-1;a<3;a++){let l=a*r+o,c=s*n,u=.75+t()*.35;i.fillStyle=`rgb(${90*u|0},${94*u|0},${100*u|0})`;for(let h of[0,e])i.fillRect(l+3-h,c+3,r-6,n-6)}}yt(i,e,t,1400,"16,18,22",.25,.7,2.2),yt(i,e,t,500,"150,156,166",.14,.7,2),yt(i,e,t,60,"20,22,26",.25,4,12)}),ny=()=>jt(256,(i,e)=>{let t=Ot(11);i.fillStyle="#7a7e86",i.fillRect(0,0,e,e),yt(i,e,t,200,"26,28,32",.2,6,24),yt(i,e,t,1500,"16,18,20",.25,.6,2),yt(i,e,t,600,"140,146,156",.12,.6,1.8)});function iy(){let e=document.createElement("canvas");e.width=e.height=128;let t=e.getContext("2d"),n=t.createImageData(128,128),r=[[1,2,.3],[3,-1,1.7],[-2,3,4.1],[4,1,2.2],[-3,-4,5.3],[5,-3,.9]],s=(l,c)=>r.reduce((u,[h,d,f],g)=>u+Math.sin(2*Math.PI*(h*l+d*c)/128+f)/(1+g*.6),0),o=new I;for(let l=0;l<128;l++)for(let c=0;c<128;c++){let u=s(c+1,l)-s(c-1,l),h=s(c,l+1)-s(c,l-1);o.set(-u*1.4,-h*1.4,1).normalize();let d=(l*128+c)*4;n.data[d]=(o.x*.5+.5)*255,n.data[d+1]=(o.y*.5+.5)*255,n.data[d+2]=(o.z*.5+.5)*255,n.data[d+3]=255}t.putImageData(n,0,0);let a=new Sr(e);return a.wrapS=a.wrapT=yr,a}var ry=()=>jt(256,(i,e)=>{let t=Ot(21);i.fillStyle="#1c120d",i.fillRect(0,0,e,e),yt(i,e,t,200,"50,30,20",.3,4,18,!1),i.lineCap="round";for(let n=0;n<14;n++){i.strokeStyle=`rgba(${200+t()*55|0},${70+t()*80|0},20,.9)`,i.lineWidth=1+t()*2.5,i.shadowColor="#ff6a10",i.shadowBlur=8,i.beginPath();let r=t()*e,s=t()*e;i.moveTo(r,s);for(let o=0;o<5;o++)r+=(t()-.5)*70,s+=(t()-.5)*70,i.lineTo(r,s);i.stroke()}i.shadowBlur=0,_s(i,e,.7)}),sy=()=>jt(256,(i,e)=>{let t=Ot(31);for(let n=0;n<5;n++){let r=.85+t()*.25;i.fillStyle=`rgb(${196*r|0},${150*r|0},${98*r|0})`,i.fillRect(n*e/5,0,e/5,e),i.fillStyle="rgba(60,36,18,.6)",i.fillRect(n*e/5,0,2,e)}for(let n=0;n<160;n++){i.strokeStyle=`rgba(90,58,30,${.08+t()*.15})`,i.lineWidth=.6+t();let r=t()*e;i.beginPath(),i.moveTo(r,0),i.bezierCurveTo(r+(t()-.5)*8,e*.3,r+(t()-.5)*8,e*.7,r+(t()-.5)*6,e),i.stroke()}}),oy=()=>jt(256,(i,e)=>{let t=Ot(51);i.fillStyle="#3a2414",i.fillRect(0,0,e,e),yt(i,e,t,500,"20,12,6",.25,.6,2.4,!1),yt(i,e,t,80,"90,60,34",.15,4,16,!1),i.strokeStyle="#d8a640",i.lineWidth=22,i.lineJoin="miter";for(let n of[78,178])i.beginPath(),i.moveTo(40,n+38),i.lineTo(128,n-34),i.lineTo(216,n+38),i.stroke();i.strokeStyle="rgba(0,0,0,.6)",i.lineWidth=10,i.strokeRect(5,5,e-10,e-10)}),ay=()=>jt(256,(i,e)=>{let t=Ot(61);i.fillStyle="#b6dcea",i.fillRect(0,0,e,e),yt(i,e,t,120,"230,246,252",.25,6,30,!1),yt(i,e,t,90,"120,170,196",.15,6,24,!1),Zl(i,e,t,6,"rgba(250,254,255,.8)",1.6,90),_s(i,e,.25)}),ly=()=>jt(256,(i,e)=>{let t=Ot(71);i.fillStyle="#6a4626",i.fillRect(0,0,e,e),yt(i,e,t,260,"40,24,12",.22,4,20,!1),yt(i,e,t,200,"140,98,58",.16,3,14,!1),yt(i,e,t,2200,"30,18,8",.25,.6,2,!1),yt(i,e,t,40,"170,160,150",.7,2,4.5,!1),_s(i,e,.45)}),cy=()=>jt(256,(i,e)=>{let t=Ot(81);i.fillStyle="#5e5a54",i.fillRect(0,0,e,e),yt(i,e,t,1600,"30,28,26",.3,.8,3,!1),yt(i,e,t,500,"160,154,146",.25,1,4,!1),_s(i,e,.45)}),uy=()=>{let i=jt(256,(e,t)=>{e.translate(t/2,t/2),e.strokeStyle="rgba(214,200,160,.55)",e.lineWidth=3,e.beginPath();for(let n=0;n<6;n++){let r=n/6*Math.PI*2+.3;e.lineTo(Math.cos(r)*112,Math.sin(r)*112)}e.closePath(),e.stroke();for(let n=0;n<28;n++){let r=n/28*Math.PI*2;e.save(),e.rotate(r),e.translate(76,0),e.rotate(n%2?.6:-.6),e.fillStyle=n%2?"#4f7a3a":"#3d6a30",e.beginPath(),e.ellipse(0,0,14,6,0,0,7),e.fill(),e.restore()}});return i.wrapS=i.wrapT=Ht,i},hy=()=>{let i=jt(256,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,"#f2fbff"),n.addColorStop(.35,"#6fc0ef"),n.addColorStop(1,"#1a4f9a"),e.fillStyle=n,e.fillRect(0,0,t,t),e.translate(t/2,t/2),e.lineCap="round";for(let r=0;r<3;r++){e.strokeStyle="rgba(255,255,255,.85)",e.lineWidth=9,e.beginPath();for(let s=0;s<=60;s++){let o=s/60,a=r*(Math.PI*2/3)+o*4.2,l=8+o*110;e.lineTo(Math.cos(a)*l,Math.sin(a)*l)}e.stroke()}});return i.wrapS=i.wrapT=Ht,i},dy=()=>{let i=jt(256,(e,t)=>{e.fillStyle="#3a1f52",e.fillRect(0,0,t,t),yt(e,t,Ot(91),300,"20,10,30",.3,1,4,!1),e.fillStyle="#e0a838",e.translate(t/2,t/2+18),e.beginPath(),e.roundRect(-46,-30,92,92,30),e.fill();for(let[n,r,s]of[[-34,70,18],[-12,92,19],[12,96,19],[35,78,18]])e.beginPath(),e.roundRect(n-s/2,-30-r,s,r+20,s/2),e.fill();e.save(),e.translate(-50,14),e.rotate(-.8),e.beginPath(),e.roundRect(-11,-58,22,66,11),e.fill(),e.restore()});return i.wrapS=i.wrapT=Ht,i},fy=()=>jt(256,(i,e)=>{let t=Ot(41);i.fillStyle="#ad9f86",i.fillRect(0,0,e,e),yt(i,e,t,300,"60,52,44",.15,4,20,!1),yt(i,e,t,1500,"50,44,38",.2,.6,2,!1),Zl(i,e,t,4,"rgba(60,50,40,.45)",2,40);let n=(r,s,o)=>{i.save(),i.translate(e/2+r,e/2+s),i.fillStyle=o,i.fillRect(-7,-80,14,160);for(let a of[-1,1])i.beginPath(),i.moveTo(0,-38),i.quadraticCurveTo(a*60,-70,a*78,-50),i.quadraticCurveTo(a*58,0,a*78,50),i.quadraticCurveTo(a*60,70,0,38),i.fill();i.restore()};n(3,3,"rgba(225,210,185,.35)"),n(0,0,"rgba(40,32,26,.4)"),i.strokeStyle="rgba(40,32,26,.6)",i.lineWidth=6,i.strokeRect(10,10,e-20,e-20)}),py=()=>{let i=jt(64,(e,t)=>{let n=e.createLinearGradient(0,0,0,t);n.addColorStop(0,"rgba(0,0,0,0.85)"),n.addColorStop(.18,"rgba(0,0,0,0.6)"),n.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=n,e.fillRect(0,0,t,t)});return i.wrapS=i.wrapT=Ht,i},my=()=>{let i=jt(64,(e,t)=>{let n=e.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);n.addColorStop(0,"rgba(255,220,160,1)"),n.addColorStop(.35,"rgba(255,150,60,.45)"),n.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=n,e.fillRect(0,0,t,t)});return i.wrapS=i.wrapT=Ht,i},Le=(i,e={})=>new Pn({color:i,roughness:.8,metalness:0,...e}),ni=(i,e=.9)=>new ft({color:i,transparent:!0,opacity:e,blending:Li,depthWrite:!1}),gy=.022;function xy(){let i=new ft({color:656900,side:Lt});return i.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${gy.toFixed(3)};`)},i}function ad(i){let e=new Mr(i),t=new Ho(i),n=e.fromScene(t,.04).texture;t.dispose(),e.dispose();let r=(c,u=.35,h={})=>Le(c,{roughness:u,metalness:.85,envMap:n,envMapIntensity:.55,...h}),s={brick:ty(),cap:ny(),water:iy(),ember:ry(),wood:sy(),force:oy(),ice:ay(),dirt:ly(),gravel:cy(),wreath:uy(),swirl:hy(),hand:dy(),halo:my(),ao:py(),block:fy(),flags:[101,202,303].map(ey)},o={under:Le(789e3,{roughness:1}),mortar:Le(hn().caps?1972242:7232580,{roughness:1}),ao:new ft({map:s.ao,transparent:!0,depthWrite:!1}),edge:Le(789776,{roughness:1,side:mn}),flags:s.flags.map(c=>Le(16777215,{map:c,roughness:.88})),ember:Le(16777215,{map:s.ember,emissiveMap:s.ember,emissive:16742960,emissiveIntensity:.9,roughness:.9}),ice:Le(10274004,{map:s.ice,roughness:.08,metalness:.1,envMap:n,envMapIntensity:.35}),force:Le(16777215,{map:s.force,roughness:.7}),dirt:Le(16777215,{map:s.dirt,roughness:.97}),gravelBed:Le(16777215,{map:s.gravel,roughness:.95}),pebble:Le(9076850,{roughness:.9}),water:Le(1722962,{roughness:.14,metalness:.1,normalMap:s.water,normalScale:new J(.55,.55),emissive:399388,envMap:n,envMapIntensity:.25}),basin:Le(925216,{roughness:.9}),side:Le(11843776,{map:s.brick,roughness:.93}),top:Le(hn().caps?15921128:10791602,{map:s.cap,roughness:.95}),wood:Le(16777215,{map:s.wood,roughness:.75}),darkWood:Le(9071178,{map:s.wood,roughness:.8}),iron:r(3025446,.6),bronze:r(12618308,.4,{emissive:2758664}),gold:r(15250496,.3,{emissive:5912064}),stone:Le(9075818),paleStone:Le(13285530,{roughness:.85}),dark:Le(657415),glow:new ft({color:16751168}),keyColor:{red:Le(14692382,{roughness:.45,emissive:5901316}),blue:Le(3108576,{roughness:.45,emissive:794202}),yellow:Le(15910968,{roughness:.45,emissive:5915648}),green:Le(3127388,{roughness:.45,emissive:805406})},brownButton:Le(6962718,{roughness:.55}),redButton:Le(11545116,{roughness:.45,emissive:2753538}),cream:Le(15260864,{roughness:.6}),wreath:new Pn({map:s.wreath,transparent:!0,roughness:.8,depthWrite:!1}),swirl:new Pn({map:s.swirl,emissiveMap:s.swirl,emissive:new Ze(6994175),emissiveIntensity:.9,roughness:.3}),hand:Le(16777215,{map:s.hand,roughness:.6}),clay:Le(11564104,{roughness:.75}),block:Le(16777215,{map:s.block,roughness:.85}),skin:Le(12618338,{roughness:.7}),tunic:Le(2383482,{roughness:.8}),cloak:Le(9054750),leather:Le(5913122,{roughness:.8}),steel:r(13225424,.3),heroSkin:Le(15118472,{roughness:.6,emissive:3020298}),heroTunic:Le(3117008,{roughness:.55,emissive:666180}),heroCloak:Le(14170660,{roughness:.65,emissive:4328452}),heroLeather:Le(9067058,{roughness:.7,emissive:1707012}),heroHair:Le(5911576,{roughness:.8,emissive:1312770}),heroRing:new ft({color:1284676,depthWrite:!1}),heroRingEdge:new ft({color:398346,transparent:!0,opacity:.8,depthWrite:!1}),itemShade:new ft({color:656900,transparent:!0,opacity:.9,depthWrite:!1}),itemRing:new ft({color:16773304,depthWrite:!1}),heroBeam:new ft({color:3593324,transparent:!0,opacity:.3,blending:Li,depthTest:!1,depthWrite:!1,side:mn}),heroXray:new ft({color:6090890,transparent:!0,opacity:.6,depthFunc:Pl,depthWrite:!1,stencilWrite:!0,stencilRef:1,stencilFunc:Ju}),outline:xy(),fur:Le(5912096,{roughness:.9,emissive:1181700}),furDark:Le(3941396,{roughness:.9}),snout:Le(6965814),ivory:Le(14866106,{roughness:.5}),kilt:Le(11545116,{emissive:2754050}),hoof:Le(1314832),eye:new ft({color:16730650}),statue:Le(9342088,{roughness:.9}),statueDark:Le(6973540,{roughness:.92}),parchment:Le(15785648,{emissive:3024920}),teal:Le(3193004,{roughness:.4,emissive:670262}),boot:Le(12596762,{roughness:.55,emissive:3804164}),bootTrim:Le(14715424,{emissive:5906944}),skate:Le(13162728,{roughness:.45,emissive:2634300}),suction:Le(3445854,{roughness:.5,emissive:798234}),mirror:r(15132390,.08,{envMapIntensity:1,emissive:4211784}),gorgon:Le(3450970,{roughness:.5,emissive:798744}),cake:Le(15773768,{roughness:.55,emissive:4203528}),hide:Le(16051938,{roughness:.65,emissive:2894374}),patch:Le(5911072,{roughness:.8}),feather:Le(9067058,{roughness:.8,emissive:1970184}),halo:s.halo,env:n},a=new Set([n,...s.flags,...Object.values(s).filter(c=>c instanceof Sr)]);for(let c of Object.values(o))c&&typeof c=="object"&&"isMaterial"in c?a.add(c):Array.isArray(c)&&c.forEach(u=>a.add(u));for(let c of Object.values(o.keyColor))a.add(c);return{t:s,m:o,metal:r,std:Le,keeps:a,dispose:()=>{for(let c of a)c.dispose()}}}var oe=.1,_i=.035,Pt=(i,e)=>i-(e-1)/2,Dt=(i,e)=>i-(e-1)/2,_y={"force-up":0,"force-left":Math.PI/2,"force-down":Math.PI,"force-right":-Math.PI/2},ld=26;function cd(i){let{m:e}=i,t=new Re,n=new Fn(.97,.12,.97,2,.02);n.translate(0,oe-.06,0);let r=new nn(1,1);r.rotateX(-Math.PI/2),r.translate(0,_i,0);let s=new Tr(.045,0),o=new le(new nn(1,1),e.under);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,t.add(o);let a=new nn(1,1);a.rotateX(-Math.PI/2);let l=[],c=(h,d,f)=>{let g=new xo(h,d,Math.max(1,f));return g.count=f,g.receiveShadow=!0,l.push(g),t.add(g),g},u=()=>{for(let h of l)t.remove(h),h.dispose();l=[]};return{group:t,set(h,d,f){u();let g=new cn([new J(-100,-100),new J(100,-100),new J(100,100),new J(-100,100)]);g.holes.push(new wr([new J(-f/2,-d/2),new J(-f/2,d/2),new J(f/2,d/2),new J(f/2,-d/2)])),o.geometry.dispose(),o.geometry=new Ar(g);let _=[[],[],[]],m={ember:[],ice:[],force:[],dirt:[],gravel:[],water:[],mortar:[]};h.forEach((S,A)=>{let C=ms[S];S!=="exit"&&m.mortar.push(A),C==="flag"?_[Ot(A*2654435761+7)()*3|0].push(A):C!=="none"&&m[C].push(A)});let p=new dt,v=new Ze,x=(S,A,C,y)=>{A.forEach((M,D)=>{let z=Ot(M*40503+11);if(p.makeRotationY(C(M,z)).setPosition(Pt(M%f,f),0,Dt(Math.floor(M/f),d)),S.setMatrixAt(D,p),y){let Y=.78+z()*.3;S.setColorAt(D,v.setRGB(Y*(1+(z()-.5)*.06),Y,Y*(1-z()*.06)))}})},b=(S,A)=>(A()*4|0)*(Math.PI/2);x(c(a,e.mortar,m.mortar.length),m.mortar,()=>0,!1),_.forEach((S,A)=>x(c(n,e.flags[A],S.length),S,b,!0)),x(c(n,e.ember,m.ember.length),m.ember,b,!1),x(c(n,e.ice,m.ice.length),m.ice,b,!1),x(c(n,e.dirt,m.dirt.length),m.dirt,b,!0),x(c(n,e.gravelBed,m.gravel.length),m.gravel,b,!0),x(c(n,e.force,m.force.length),m.force,S=>_y[h[S]]??0,!1),x(c(r,e.water,m.water.length),m.water,()=>0,!1);let E=m.gravel;if(E.length){let S=c(s,e.pebble,E.length*ld);S.castShadow=!0;let A=0;for(let C of E){let y=Ot(C*7919+3);for(let M=0;M<ld;M++){let D=.7+y()*.5;p.makeScale(D,.6*D,D).setPosition(Pt(C%f,f)+(y()-.5)*.8,oe+.015,Dt(Math.floor(C/f),d)+(y()-.5)*.8),S.setMatrixAt(A,p),S.setColorAt(A++,v.setScalar(.75+y()*.5))}}}},loop(h){i.t.water.offset.set(Math.sin(h*.5)*.04,h*.025%1),e.water.emissiveIntensity=1+.15*Math.sin(h*1.3)},dispose(){u(),n.dispose(),r.dispose(),s.dispose(),a.dispose(),o.geometry.dispose()}}}function Vo(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),r=new Set(Object.keys(i[0].morphAttributes)),s={},o={},a=i[0].morphTargetsRelative,l=new At,c=0;for(let u=0;u<i.length;++u){let h=i[u],d=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in h.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;s[f]===void 0&&(s[f]=[]),s[f].push(h.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in h.morphAttributes){if(!r.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(h.morphAttributes[f])}if(e){let f;if(t)f=h.index.count;else if(h.attributes.position!==void 0)f=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,u),c+=f}}if(t){let u=0,h=[];for(let d=0;d<i.length;++d){let f=i[d].index;for(let g=0;g<f.count;++g)h.push(f.getX(g)+u);u+=i[d].attributes.position.count}l.setIndex(h)}for(let u in s){let h=ud(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let f=[];for(let _=0;_<o[u].length;++_)f.push(o[u][_][d]);let g=ud(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}return l}function ud(i){let e,t,n,r=-1,s=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.array.length}let o=new e(s),a=0;for(let c=0;c<i.length;++c)o.set(i[c].array,a),a+=i[c].array.length;let l=new qt(o,t,n);return r!==void 0&&(l.gpuType=r),l}var Ur=.38,yy=.16,Kl=.26,vy=.05,by={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2};function My(i){let[e,,t]=wn[i].n,n=1.002,r=.5,s=.5-vy,o=e!==0?[[e*s,n,-.5*e],[e*s,n,.5*e],[e*r,n,.5*e],[e*r,n,-.5*e]]:[[.5*t,n,t*s],[-.5*t,n,t*s],[-.5*t,n,t*r],[.5*t,n,t*r]];return(e<0||t<0)&&o.reverse(),{v:o,n:[0,1,0],uvs:[[0,0],[1,0],[1,1],[0,1]],mat:2}}var wn={n:{d:[-1,0],v:[[.5,0,-.5],[-.5,0,-.5],[-.5,1,-.5],[.5,1,-.5]],n:[0,0,-1],u:i=>-i[0]},s:{d:[1,0],v:[[-.5,0,.5],[.5,0,.5],[.5,1,.5],[-.5,1,.5]],n:[0,0,1],u:i=>i[0]},w:{d:[0,-1],v:[[-.5,0,-.5],[-.5,0,.5],[-.5,1,.5],[-.5,1,-.5]],n:[-1,0,0],u:i=>i[2]},e:{d:[0,1],v:[[.5,0,.5],[.5,0,-.5],[.5,1,-.5],[.5,1,.5]],n:[1,0,0],u:i=>-i[2]}},Sy=Object.keys(wn);function hd(i){let e=[],t=[],n=[],r=[],s=new At,o=0;for(let{v:a,n:l,uvs:c,mat:u}of i){let h=e.length/3;a.forEach((d,f)=>{e.push(...d),t.push(...l),n.push(...c[f])}),r.push(h,h+1,h+2,h,h+2,h+3),s.addGroup(o,6,u),o+=6}return s.setAttribute("position",new Je(e,3)),s.setAttribute("normal",new Je(t,3)),s.setAttribute("uv",new Je(n,2)),s.setIndex(r),s}var dd=(i,e,t)=>({v:wn[i].v,n:wn[i].n,mat:0,uvs:wn[i].v.map(n=>[wn[i].u([n[0]+e,0,n[2]+t]),n[1]*un])}),Jl=[];for(let i of[.15,.5,.85])for(let e of[.15,.5,.85])for(let t of[.15,.5,.85])Jl.push([i,e,t]);function wy(i,e,t,n){let r=-1e9,s=1e9;for(let o=0;o<3;o++){if(Math.abs(e[o])<1e-9){if(i[o]<t[o]||i[o]>n[o])return-1;continue}let a=(t[o]-i[o])/e[o],l=(n[o]-i[o])/e[o];if(a>l&&([a,l]=[l,a]),a>r&&(r=a),l<s&&(s=l),r>s)return-1}return r}function fd(i){let e=new Re,t=[],n=new nn(1,Kl);n.rotateX(-Math.PI/2);let r=[],s=new Map,o=0,a="solid",l=new I,c=h=>{let d=h.op<.999;for(let f of h.mats)f.transparent!==d&&(f.transparent=d,f.needsUpdate=!0),f.opacity=h.op},u=()=>{for(let h of t){e.remove(h.mesh),h.mesh.geometry.dispose();for(let d of h.inner)d.mesh.geometry.dispose();for(let d of h.mats)d.dispose()}t=[],s.clear();for(let h of r)e.remove(h);r=[]};return{group:e,list:()=>t,at:(h,d)=>s.get(h*o+d),build(h,d,f){u(),o=f;let g=(m,p)=>m<0||p<0||m>=d||p>=o||h[m*o+p]==="wall",_=a==="low"?Ur:un;for(let m=0;m<d;m++)for(let p=0;p<o;p++){if(h[m*o+p]!=="wall")continue;let v=Pt(p,o),x=Dt(m,d),b=[{v:[[-.5,1,.5],[.5,1,.5],[.5,1,-.5],[-.5,1,-.5]],n:[0,1,0],mat:1,uvs:[[v-.5,-x-.5],[v+.5,-x-.5],[v+.5,-x+.5],[v-.5,-x+.5]]}],E=[];for(let M of Sy){let[D,z]=wn[M].d,Y=m+D,L=p+z;if(g(Y,L)&&Y>=0&&L>=0&&Y<d&&L<o?E.push(M):b.push(dd(M,v,x)),g(Y,L))continue;b.push(My(M));let[O,,H]=wn[M].n,q=new le(n,i.m.ao);q.position.set(v+O*(.5+Kl/2),oe+.003,x+H*(.5+Kl/2)),q.rotation.y=by[M],q.renderOrder=1,e.add(q),r.push(q)}let S=[i.m.side.clone(),i.m.top.clone(),i.m.edge.clone()],A=m===0||p===0||m===d-1||p===o-1;if(!A){A=!0;for(let M=-1;M<=1;M++)for(let D=-1;D<=1;D++)g(m+M,p+D)||(A=!1)}A&&S[1].color.multiplyScalar(yy);let C=new le(hd(b),S);C.position.set(v,0,x),C.scale.y=_,C.castShadow=C.receiveShadow=!0,e.add(C);let y={r:m,c:p,x:v,z:x,mesh:C,mats:S,op:1,target:1,inner:[]};for(let M of E){let D=new le(hd([dd(M,v,x)]),[S[0]]);D.visible=!1,C.add(D),y.inner.push({k:M,mesh:D,nb:null})}t.push(y),s.set(m*o+p,y)}for(let m of t)for(let p of m.inner){let[v,x]=wn[p.k].d;p.nb=s.get((m.r+v)*o+m.c+x)??null}},setMode(h){a=h;let d=h==="low"?Ur:un;for(let f of t)f.mesh.scale.y=d},aim(h,d){let f=new Map,g=a==="low"?Ur:un;h.getWorldDirection(l);let _=[l.x,l.y,l.z],m=30;for(let p of d){let v=t.filter(b=>Math.abs(b.x-p.x)<3.2&&Math.abs(b.z-p.z)<3.2);if(v.length===0)continue;let x=new Map;for(let[b,E,S]of Jl){let A=[p.x-p.half+2*p.half*b,oe+p.h*E,p.z-p.half+2*p.half*S],C=[A[0]-_[0]*m,A[1]-_[1]*m,A[2]-_[2]*m];for(let y of v){let M=wy(C,_,[y.x-.49,0,y.z-.49],[y.x+.49,g,y.z+.49]);M>=0&&M<m-.01&&x.set(y,(x.get(y)??0)+1)}}for(let[b,E]of x)f.set(b,Math.max(f.get(b)??0,E/Jl.length))}for(let p of t){let v=Math.min(1,Math.max(0,((f.get(p)??0)-.03)/.45));p.target=Oh(v*v*(3-2*v))}},ease(h,d){let f=!1;for(let g of t)g.op!==g.target&&(g.op=d?g.target:Fh(g.op,g.target,h),f=!0,c(g));if(f)for(let g of t)for(let _ of g.inner)_.mesh.visible=!!_.nb&&_.nb.op<.999&&g.op>_.nb.op+.02;return f},dispose(){u(),n.dispose()}}}var W=(i,e,t,n)=>(i.position.set(e,t,n),i),Ey=(i,e,t,n=14)=>new vn(i,e,t,n),We=(i,e,t,n,r=14)=>new le(Ey(i,e,t,r),n),Ve=(i,e,t,n)=>new le(new ln(i,e,t),n),Gi=i=>(i.rotation.x=Math.PI/2,i);function Ty(i){i.updateMatrixWorld(!0);let e=new Map;i.traverse(n=>{if(!(n instanceof le))return;let r=n.geometry.clone().applyMatrix4(n.matrixWorld);r.index&&(r=r.toNonIndexed());for(let o of Object.keys(r.attributes))o!=="position"&&o!=="normal"&&o!=="uv"&&r.deleteAttribute(o);let s=n.material;e.set(s,[...e.get(s)??[],r]),n.geometry.dispose()});let t=new Re;for(let[n,r]of e){let s=new le(Vo(r),n);r.forEach(o=>o.dispose()),s.castShadow=s.receiveShadow=!0,t.add(s)}return t}function qo(i,e){let t=[];for(let n of e.children)n instanceof le&&!n.userData.live&&t.push(new le(n.geometry,i.m.outline));return e.add(...t),e}function Ft(i,e,t=[]){let n=Ty(i);return t.length&&n.add(...t),n.userData=e,n}var zn=()=>Object.assign(new Re,{userData:{half:0,h:0}}),xd=i=>(i.wall(i.r-1,i.c)||i.wall(i.r+1,i.c))&&!(i.wall(i.r,i.c-1)&&i.wall(i.r,i.c+1));function Wo(i,e){let{m:t}=i.kit,n=t.keyColor[e],r=new Re,s=1.1,o=.26;return r.add(W(Ve(1,s,o,t.wood),0,s/2,0)),r.add(W(Ve(1,.06,o+.02,t.iron),0,.34,0)),r.add(W(Ve(1,.16,o+.02,n),0,.8,0)),r.add(W(Ve(1,.1,o+.02,n),0,.06,0)),r.add(W(Ve(1,.04,o+.02,n),0,s+.02,0)),r.add(W(Ve(.16,.18,o+.04,t.iron),.24,.55,0)),r.add(Gi(W(We(.05,.05,o+.08,n,12),.24,.55,0))),xd(i)&&(r.rotation.y=Math.PI/2),Ft(r,{half:.4,h:s,tall:!0})}function pd(i,e){let{m:t}=i.kit,n=new Re;for(let r=0;r<6;r++)e?n.add(W(We(.025,.012,.12,t.bronze,8),-.42+r*.168,1,0)):n.add(W(We(.025,.025,1.05,t.bronze,8),-.42+r*.168,.55,0));if(!e)for(let r of[.3,.8])n.add(W(Ve(1,.05,.05,t.bronze),0,r,0));for(let r of[-1,1])n.add(W(Ve(.08,1.06,.12,t.darkWood),r*.47,.53,0));return n.add(W(Ve(1,.16,.3,t.darkWood),0,1.1,0)),n.add(W(Ve(1,.04,.32,t.bronze),0,1.2,0)),xd(i)&&(n.rotation.y=Math.PI/2),Ft(n,{half:.4,h:e?.3:1.05,tall:!0})}function Ay(i){let{m:e}=i.kit,t=new Re;for(let a=0;a<3;a++)t.add(W(Ve(.25,.08,.9,e.stone),-.375+a*.25,oe-.04-a*.12,0));for(let a of[-1,1])t.add(W(Ve(1,.7,.05,e.stone),0,oe-.35,a*.475));t.add(W(Ve(.05,.7,.9,e.stone),.475,oe-.35,0));let n=W(new le(new nn(.25,.9),e.glow),.375,-.32,0);n.rotation.x=-Math.PI/2,t.add(n),t.add(W(Ve(.3,.16,1.1,e.top),0,un-.08,0));for(let a of[-1,1])t.add(W(Ve(.16,un-.16,.12,e.darkWood),0,(un-.16)/2,a*.5));let r=[[0,-1],[-1,0],[1,0],[0,1]].find(([a,l])=>!i.wall(i.r+a,i.c+l)),[s,o]=r??[0,-1];return t.rotation.y=Math.atan2(s,-o),Ft(t,{half:.4,h:.3,tall:!0})}function md(i,e){let{m:t}=i.kit,n=new Re;if(e){n.add(W(Ve(.8,.72-.04,.8,t.dark),0,oe+.72/2,0));for(let s of[oe+.04,oe+.72-.04])n.add(W(Ve(.92,.08,.92,t.darkWood),0,s,0));for(let s of[-1,1])for(let o of[-1,1])n.add(W(Ve(.1,.72,.1,t.darkWood),s*.41,oe+.72/2,o*.41));for(let s=0;s<4;s++){let o=-.27+s*.18;for(let a of[-1,1])n.add(W(Ve(.07,.72-.12,.05,t.wood),o,oe+.72/2,a*.43)),n.add(W(Ve(.05,.72-.12,.07,t.wood),a*.43,oe+.72/2,o));n.add(W(Ve(.07,.04,.8,t.wood),o,oe+.72-.01,0))}return Ft(n,{half:.46,h:.72+.1})}n.add(W(Ve(.84,.02,.84,t.dark),0,oe+.005,0));for(let r of[-1,1])n.add(W(Ve(.88,.04,.07,t.darkWood),0,oe+.02,r*.42)),n.add(W(Ve(.07,.04,.88,t.darkWood),r*.42,oe+.02,0));for(let r=0;r<4;r++)n.add(W(Ve(.08,.035,.8,t.wood),-.27+r*.18,oe+.018,0));return Ft(n,{half:.42,h:.06})}function _d(i,e,t=.3){let n=new Re;return n.add(W(We(t,t+.03,.05,i,28),0,oe+.025,0)),n.add(W(We(t-.05,t-.04,.03,e,28),0,oe+.06,0)),n}function Ry(i){let{m:e}=i.kit,t=new Re;t.add(W(We(.28,.31,.05,e.iron,24),0,oe+.025,0));let n=W(new le(new Cn(.21,20,10,0,Math.PI*2,0,Math.PI/2),e.brownButton),0,oe+.04,0);return n.scale.y=.55,t.add(n),Ft(t,{half:.3,h:.16})}function gd(i,e){let{m:t}=i.kit,n=_d(t.bronze,e);return n.add(Gi(W(new le(new bn(.15,.018,8,32),t.cream),0,oe+.077,0))),n.add(W(We(.05,.055,.04,t.bronze,16),0,oe+.08,0)),Ft(n,{half:.3,h:.12})}function Cy(i){let{m:e}=i.kit,t=_d(e.bronze,e.dark,.34);for(let n=0;n<12;n++){let r=n/12*Math.PI*2;t.add(W(new le(new Zt(.028,.12,6),e.iron),Math.cos(r)*.22,oe+.13,Math.sin(r)*.22))}return t.add(W(We(.1,.11,.04,e.bronze,16),0,oe+.09,0)),Ft(t,{half:.34,h:.2})}function Py(i){let{m:e}=i.kit,t=new Re;t.add(W(We(.07,.08,.03,e.gold,18),0,oe+.015,0));let n=Ft(t,{half:.4,h:.05}),r=new le(new nn(.9,.9),e.wreath);return r.rotation.x=-Math.PI/2,r.position.y=oe+.003,r.receiveShadow=!0,n.add(r),n}function Iy(i){let{m:e}=i.kit,t=new Re;t.add(W(Ve(.78,.04,.78,e.paleStone),0,oe+.02,0));for(let n of[-1,1])t.add(W(Ve(.9,.09,.07,e.darkWood),0,oe+.045,n*.42)),t.add(W(Ve(.07,.09,.9,e.darkWood),n*.42,oe+.045,0));return Ft(t,{half:.45,h:.1})}function Ly(i){let{m:e}=i.kit,t=new Re;t.add(W(We(.36,.38,.06,e.bronze,32),0,oe+.03,0));let n=Ft(t,{half:.36,h:.1}),r=W(We(.3,.3,.02,e.swirl,32),0,oe+.065,0);return r.receiveShadow=!0,n.add(r),n.userData.loop=s=>{r.rotation.y=-s*1.6},n}function Dy(i){let{m:e}=i.kit,t=new Re;t.add(W(We(.36,.38,.06,e.gold,32),0,oe+.03,0));let n=W(We(.3,.3,.02,e.hand,32),0,oe+.065,0);return n.rotation.y=Math.PI,t.add(n),Ft(t,{half:.36,h:.1})}function Uy(i){let{m:e}=i.kit,t=new Re,n=[[0,0],[.12,0],[.2,.08],[.22,.2],[.18,.32],[.08,.4],[.07,.46],[.09,.48],[0,.48]].map(([a,l])=>new J(a,l));t.add(W(new le(new Er(n,24),e.clay),0,oe,0)),t.add(Gi(W(new le(new bn(.205,.012,6,28),e.dark),0,oe+.22,0)));let r=W(We(.012,.012,.12,e.dark,6),.02,oe+.53,0);r.rotation.z=-.3,t.add(r);let s=W(new le(new Zt(.035,.1,8),ni(16760928)),.04,oe+.62,0),o=Ft(t,{half:.22,h:.6},[s]);return o.userData.loop=a=>s.scale.set(1,1+.2*Math.sin(a*9),1),o}function Xo(i,e){let{m:t}=i.kit,n=new Re;n.add(W(new le(new Fn(.86,.36,.86,2,.03),t.darkWood),0,oe+.18,0)),n.add(W(Ve(.64,.02,.64,t.dark),0,oe+.365,0));for(let a of[-1,1])for(let l of[-1,1])n.add(W(We(.03,.03,.02,t.gold,10),a*.37,oe+.365,l*.37));let r=new cn;r.moveTo(0,.24),r.lineTo(.17,.04),r.lineTo(.07,.04),r.lineTo(.07,-.22),r.lineTo(-.07,-.22),r.lineTo(-.07,.04),r.lineTo(-.17,.04),r.closePath();let s=new le(new Oi(r,{depth:.025,bevelEnabled:!1}),t.gold);s.rotation.x=-Math.PI/2,s.position.y=oe+.37;let o=new Re;return o.add(s),o.rotation.y=e,n.add(o),Ft(n,{half:.43,h:.4})}function Ny(i){let e=new Re,t=Ot(i.r*31+i.c),n=[];for(let s=0;s<5;s++){let o=.3+t()*.28,a=W(new le(new Zt(.08+t()*.05,o,7),ni(s%2?16738848:16756816,.8)),(t()-.5)*.55,oe+o/2,(t()-.5)*.55);n.push(a),e.add(a)}let r=t()*6.28;return e.userData={half:.4,h:.5,loop:s=>n.forEach((o,a)=>o.scale.set(1,1+.12*Math.sin(s*(6+a)+r+a),1))},e}var yd={floor:zn,wall:zn,water:zn,ice:zn,dirt:zn,gravel:zn,"force-up":zn,"force-down":zn,"force-left":zn,"force-right":zn,exit:Ay,fire:Ny,"gate-closed":i=>pd(i,!1),"gate-open":i=>pd(i,!0),safe:Py,button:Ry,trap:Cy,popup:Iy,teleport:Ly,thief:Dy,bomb:Uy,"toggle-open":i=>md(i,!1),"toggle-closed":i=>md(i,!0),"door-red":i=>Wo(i,"red"),"door-blue":i=>Wo(i,"blue"),"door-yellow":i=>Wo(i,"yellow"),"door-green":i=>Wo(i,"green"),"button-brown":i=>gd(i,i.kit.m.brownButton),"button-red":i=>gd(i,i.kit.m.redButton),"clone-up":i=>Xo(i,0),"clone-left":i=>Xo(i,Math.PI/2),"clone-down":i=>Xo(i,Math.PI),"clone-right":i=>Xo(i,-Math.PI/2)};function Hi(i,e){i.traverse(t=>{if(!(t instanceof le))return;t.geometry.dispose();let n=Array.isArray(t.material)?t.material:[t.material];for(let r of n)e.keeps.has(r)||r.dispose()})}var Qt=(i,e,t=16,n=12)=>new le(new Cn(i,t,n),e);function Md(i,e,t){let n=new cn;n.moveTo(i[0][0],i[0][1]);for(let[s,o]of i.slice(1))n.lineTo(s,o);n.closePath();let r=new Oi(n,{depth:e,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-e/2),new le(r,t)}function ys(i,e,t,n,r=0,s=[]){let o=t.h*n;e.position.y-=oe;let a=new Re;a.position.set(0,oe,o/2*Math.sin(r)),a.rotation.x=-r,a.scale.setScalar(n),a.add(e);let l=new Re;return l.add(a),qo(i,Ft(l,{...t,half:Math.max(t.half*n,o/2*Math.sin(r)),h:o*Math.cos(r),back:o*Math.sin(r)/2},s))}var $l=.45,Oy=.035;function Sd(i,e){return i.rotation.x=-Math.PI/2,i.position.y=oe+e,i.userData.live=!0,i}var Zo=(i,e=.42)=>Sd(new le(new wo(e,32),i.m.itemShade),.006);function kn(i,e,t,n,r=0){let s=hn().items==="plate",o=[Zo(i,s?$l:.42)];return s&&o.push(Sd(new le(new xi($l-Oy,$l,48),i.m.itemRing),.008)),ys(i,e,t,s?n*1.12:n,r,o)}function Fy(i){let{m:e}=i,t=new Re;t.add(W(We(.11,.13,.04,e.bronze,18),0,oe+.02,0)),t.add(W(We(.02,.022,.66,e.darkWood,8),0,oe+.35,0)),t.add(W(Qt(.03,e.gold,10,8),0,oe+.7,0));for(let n of[-1,1]){let r=Md([[.02,.05],[.12,.08],[.21,.17],[.16,0],[.21,-.17],[.12,-.08],[.02,-.05]].map(([s,o])=>[n*s,o]),.03,e.gold);t.add(W(r,0,oe+.5,0))}return t.add(W(We(.035,.035,.12,e.gold,10),0,oe+.5,0)),kn(i,t,{half:.22,h:.72},1.2,.85)}function Yo(i,e){let{m:t}=i,n=new Re;n.add(W(new le(new bn(.075,.03,10,20),t.keyColor[e]),0,.2,0)),n.add(Gi(W(We(.05,.05,.034,t.keyColor[e],16),0,.2,0))),n.add(W(Ve(.035,.24,.03,t.bronze),0,0,0)),n.add(W(Ve(.07,.03,.03,t.bronze),.035,-.08,0)),n.add(W(Ve(.05,.03,.03,t.bronze),.025,-.03,0)),n.position.y=oe+.2,n.rotation.z=.25;let r=new Re;return r.add(n),kn(i,r,{half:.12,h:.42},2.05,1.1)}function zy(i){let{m:e}=i,t=new Re,n=new cn;n.moveTo(0,0),n.bezierCurveTo(.08,.02,.1,.2,.07,.32),n.lineTo(-.07,.32),n.bezierCurveTo(-.1,.2,-.08,.02,0,0);let r=new Oi(n,{depth:.025,bevelEnabled:!1});for(let s of[-1,1]){let o=new le(r,e.teal);o.rotation.x=-Math.PI/2+.35,o.rotation.z=s*.2,o.position.set(s*.1,oe+.03,.14),t.add(o),t.add(W(Ve(.1,.07,.1,e.teal),s*.1,oe+.06,.14))}return kn(i,t,{half:.24,h:.2},1.8)}function jl(i,e,t,n){let r=new Re;for(let s of[-1,1]){let o=new Re,a=n?.(o)??0;o.add(W(Ve(.09,.2,.09,e),0,a+.12,0)),o.add(W(Ve(.09,.06,.17,e),0,a+.03,.04)),o.add(W(Ve(.1,.045,.1,t),0,a+.225,0)),o.position.set(s*.09,oe,0),o.rotation.y=s*.2,r.add(o)}return r}function ky(i){let{m:e}=i,t=jl(i,e.boot,e.bootTrim,n=>(n.add(W(new le(new Zt(.025,.07,6),e.gold),0,.11,.05)),0));return kn(i,t,{half:.2,h:.28},1.9,.7)}function By(i){let{m:e}=i,t=jl(i,e.skate,e.cream,n=>{n.add(W(Ve(.02,.05,.24,e.steel),0,.025,.04));for(let r of[-.04,.12])n.add(W(Ve(.03,.03,.03,e.steel),0,.05,r));return .05});return kn(i,t,{half:.2,h:.32},1.8,.7)}function Gy(i){let{m:e}=i,t=jl(i,e.suction,e.bootTrim,n=>(n.add(W(We(.1,.07,.035,e.bronze,18),0,.018,.03)),.035));return kn(i,t,{half:.22,h:.3},1.8,.7)}function Hy(i){let{m:e}=i,t=new Re,n=new Re;n.position.set(0,oe+.32,0),n.rotation.x=-.25,n.add(Gi(We(.13,.13,.02,e.mirror,28))),n.add(new le(new bn(.13,.02,8,28),e.bronze));let r=W(Qt(.045,e.gorgon,12,10),0,0,.012);r.scale.z=.5,n.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;n.add(W(Qt(.014,e.gorgon,6,5),Math.cos(o)*.08,Math.sin(o)*.08,.012))}return t.add(n),t.add(W(We(.018,.025,.2,e.bronze,8),0,oe+.1,0)),t.add(W(We(.08,.09,.025,e.bronze),0,oe+.012,0)),kn(i,t,{half:.18,h:.48},1.55,.9)}function Vy(i){let{m:e}=i,t=new Re;t.add(W(We(.24,.22,.03,e.bronze,24),0,oe+.015,0)),t.add(W(We(.17,.19,.16,e.cake,24),0,oe+.11,0)),t.add(W(We(.165,.17,.02,e.cream,24),0,oe+.2,0));for(let n=0;n<8;n++){let r=n/8*Math.PI*2;t.add(W(Qt(.022,e.cream,8,6),Math.cos(r)*.12,oe+.215,Math.sin(r)*.12))}return t.add(W(Qt(.035,e.cake,10,8),0,oe+.22,0)),kn(i,t,{half:.24,h:.26},1.4,.35)}function vd(i,e,t=0,n=!1){let{m:r}=i,s=new Re;s.add(W(Ve(.56,.05,.3,r.wood),0,.1,0));for(let l of[-1,1])for(let c of[-1,1])s.add(Gi(W(We(.07,.07,.03,r.darkWood,14),l*.2,.07,c*.165))),s.add(W(We(.028,.025,.14,r.hide,8),l*.16,.18,c*.08));s.add(W(new le(new Fn(.46,.22,.24,2,.05),r.hide),0,.34,0));for(let[l,c,u,h]of[[-.1,0,.3,1],[.1,.05,.3,1],[-.04,.12,1,.3],[.12,-.12,1,.3],[-.14,-.12,1,.3]]){let d=W(Qt(.075,r.patch,10,8),l,h===1?.44:.35,c);d.scale.set(1,u,h),s.add(d)}s.add(W(new le(new Fn(.14,.15,.15,2,.03),r.hide),.29,.43,0)),s.add(W(Ve(.06,.08,.12,r.snout),.37,.4,0));for(let l of[-1,1]){let c=W(new le(new Zt(.02,.08,6),r.ivory),.28,.53,l*.06);c.rotation.x=l*.5,s.add(c)}let o=W(We(.012,.012,.16,r.patch,6),-.25,.36,0);o.rotation.z=-.4,s.add(o),s.position.y=oe,s.rotation.y=.5;let a=new Re;return a.add(s),(n?kn:ys)(i,a,{half:.32,h:.56},e,t)}function Wy(i){let{m:e}=i,t=new Re;t.add(W(Ve(.26,.008,.14,e.parchment),.02,oe+.006,.08));let n=W(We(.06,.06,.34,e.parchment,14),0,oe+.06,-.02);n.rotation.z=Math.PI/2,t.add(n);for(let s of[-1,1]){let o=W(We(.035,.035,.012,e.darkWood,10),s*.172,oe+.06,-.02);o.rotation.z=Math.PI/2,t.add(o)}let r=W(We(.064,.064,.05,e.cloak,14),-.08,oe+.06,-.02);return r.rotation.z=Math.PI/2,t.add(r),t.rotation.y=.3,kn(i,t,{half:.2,h:.14},1.9,.5)}function Xy(i){let e=new Re;return e.add(W(new le(new Fn(.84,.8,.84,3,.05),i.m.block),0,oe+.4,0)),Ft(e,{half:.42,h:.9})}function qy(i){let{m:e}=i,t=new Re,n=oe+.22;t.add(W(Qt(.22,e.bronze,24,16),0,n,0));let r=W(new le(new bn(.222,.012,6,32),e.gold),0,n,0);r.rotation.y=Math.PI/2,t.add(r);for(let s=0;s<10;s++){let o=s/10*Math.PI*2;t.add(W(Qt(.022,e.gold,6,5),Math.cos(o)*.222,n,Math.sin(o)*.222)),s%2===0&&t.add(W(Qt(.02,e.gold,6,5),0,n+Math.cos(o+.3)*.224,Math.sin(o+.3)*.224))}return ys(i,t,{half:.24,h:.46},1.45,0,[Zo(i)])}function Yy(i){let{m:e}=i,t=new Re,n=oe+.4,r=W(Qt(.12,e.feather,16,12),0,n,-.02);r.scale.set(.9,1.15,.85),t.add(r),t.add(W(Qt(.075,e.skin,14,10),0,n+.17,.03));let s=W(Qt(.082,e.furDark,14,8),0,n+.19,.01);s.scale.set(1,.8,1),t.add(s);for(let a of[-1,1]){t.add(W(Qt(.012,e.dark,6,5),a*.028,n+.18,.1));let l=Md([[.06,.08],[.24,.16],[.4,.14],[.38,.06],[.33,.08],[.33,-.01],[.26,.02],[.24,-.08],[.17,-.03],[.12,-.1],[.06,-.04]].map(([c,u])=>[a*c,u]),.025,e.feather);l.position.set(0,n+.04,-.04),l.rotation.x=-.9,t.add(l),t.add(W(We(.014,.012,.16,e.bootTrim,6),a*.04,n-.18,.02))}let o=W(new le(new Zt(.06,.16,6),e.feather),0,n-.1,-.12);return o.rotation.x=-2.4,t.add(o),ys(i,t,{half:.36,h:.66},1.05,0,[Zo(i)])}var bd=1.35;function Zy(i){let e=new Re;e.add(W(Qt(.13,i.m.bootTrim,12,8),0,oe+.14,0));let t=[],n=W(Qt(.16,ni(13647888,.5),16,12),0,oe+.17,0);t.push(n);for(let o=0;o<7;o++){let a=o/7*Math.PI*2,l=.24+o%3*.06,c=W(new le(new Zt(.08,l,7),ni(o%2?13122060:14182424,.7)),Math.cos(a)*.12,oe+l/2+.04,Math.sin(a)*.12);c.rotation.z=-Math.cos(a)*.3,c.rotation.x=Math.sin(a)*.3,t.push(c)}let r=new Re;for(let o of t)o.position.y-=oe;r.add(...t),r.position.y=oe,r.scale.setScalar(bd),r.userData.live=!0;let s=ys(i,e,{half:.26,h:.5},bd,0,[r,Zo(i)]);return s.userData.loop=o=>t.forEach((a,l)=>a.scale.set(1,1+.15*Math.sin(o*(7+l)+l*1.7),1)),s}var Ko={relic:Fy,"key-red":i=>Yo(i,"red"),"key-blue":i=>Yo(i,"blue"),"key-yellow":i=>Yo(i,"yellow"),"key-green":i=>Yo(i,"green"),flippers:zy,"fire-boots":ky,skates:By,suction:Gy,mirror:Hy,cake:Vy,cow:i=>vd(i,1.1,.35,!0),"cow-standing":i=>vd(i,1.1),page:Wy,block:Xy,ball:qy,glider:Yy,fireball:Zy};var Vi=(i,e,t=16,n=12)=>new le(new Cn(i,t,n),e);function Td(i,e,t,n=1.3,r=[]){e.scale.setScalar(n),e.position.y=oe;let s=new Re;return s.add(e),qo(i,Ft(s,t,r))}function Ky(i,e,t){let n=[];for(let s of e.children){if(!(s instanceof le)||s.userData.live||s.material===i.m.outline)continue;let o=s.material;o.stencilWrite=!0,o.stencilRef=1,o.stencilZPass=Ku;let a=new le(s.geometry,i.m.heroXray);a.renderOrder=20,a.userData.live=!0,n.push(a)}let r=new le(new vn(.16,.24,2.2,24,1,!0),i.m.heroBeam);r.position.y=oe+t+.25+1.1,r.renderOrder=21,r.userData.live=!0,e.add(...n,r)}var Ql=1.45;function Jy(i){let{m:e}=i,t=new Re;for(let u of[-1,1])t.add(W(We(.045,.04,.28,e.heroSkin),u*.065,.14,0)),t.add(W(Ve(.07,.05,.12,e.heroLeather),u*.065,.025,.02));t.add(W(We(.13,.2,.22,e.heroTunic),0,.35,0)),t.add(W(We(.155,.13,.22,e.heroTunic),0,.55,0)),t.add(W(We(.16,.16,.035,e.heroLeather),0,.45,0));let n=W(Ve(.3,.44,.03,e.heroCloak),0,.44,-.14);n.rotation.x=.12,t.add(n);for(let u of[-1,1]){let h=W(We(.04,.035,.26,e.heroSkin),u*.19,.5,.02);h.rotation.z=u*.18,t.add(h)}t.add(W(Vi(.095,e.heroSkin),0,.75,0)),t.add(W(new le(new Cn(.103,18,10,0,Math.PI*2,0,Math.PI/2),e.heroHair),0,.765,-.012));let r=W(We(.15,.15,.03,e.bronze,24),-.26,.5,.04);r.rotation.z=Math.PI/2,t.add(r);let s=W(We(.06,.06,.035,e.heroCloak,16),-.275,.5,.04);s.rotation.z=Math.PI/2,t.add(s);let o=W(Ve(.03,.34,.012,e.steel),.23,.5,.1);o.rotation.x=.5,t.add(o),t.add(W(Ve(.09,.02,.03,e.bronze),.23,.37,.03));let a=(u,h,d,f)=>{let g=new le(new xi(u,h,48),d);return g.rotation.x=-Math.PI/2,g.position.y=oe+f,g.userData.live=!0,g},l=[a(.33,.47,e.heroRingEdge,.01),a(.36,.44,e.heroRing,.012)],c=Td(i,t,{half:.26*Ql/1.3,h:1.2*Ql/1.3},Ql,l);return hn().beacon&&Ky(i,c,c.userData.h),c}function wd(i,e){let{m:t}=i,n=d=>e?t.statue:d,r=n(t.fur),s=e?t.statueDark:t.furDark,o=new Re;for(let d of[-1,1])o.add(W(We(.07,.06,.3,r),d*.1,.17,0)),o.add(W(We(.065,.07,.05,n(t.hoof)),d*.1,.025,0));o.add(W(We(.2,.26,.2,n(t.kilt)),0,.38,0));let a=W(new le(new bn(.2,.02,8,24),n(t.gold)),0,.47,0);a.rotation.x=Math.PI/2,o.add(a);let l=W(Vi(.26,r),0,.66,0);l.scale.set(1.05,1,.75),o.add(l);for(let d of[-1,1]){o.add(W(Vi(.11,r),d*.26,.78,0));let f=W(We(.07,.055,.36,r),d*.31,.57,.03);f.rotation.z=d*.2,o.add(f)}let c=W(Vi(.13,s),0,.95,.06);c.scale.set(1,.95,1.15),o.add(c);let u=W(Vi(.085,n(t.snout)),0,.9,.19);u.scale.set(1.1,.8,.9),o.add(u),o.add(W(new le(new bn(.035,.008,6,16),n(t.gold)),0,.85,.26));for(let d of[-1,1]){o.add(W(Vi(.018,e?t.statueDark:t.eye,8,6),d*.065,.99,.17));let f=new rs([new I(d*.1,1,.04),new I(d*.24,1.03,.02),new I(d*.33,1.12,.07),new I(d*.33,1.22,.13)]);o.add(new le(new Eo(f,16,.028,8),n(t.ivory))),o.add(W(new le(new Zt(.028,.07,8),n(t.ivory)),d*.33,1.25,.14));let g=W(Vi(.04,s),d*.14,.97,.02);g.scale.set(1.3,.6,.8),o.add(g)}let h=new Re;h.add(We(.018,.018,.85,n(t.iron),8));for(let d of[-1,1]){let f=new le(new vn(.17,.17,.02,24,1,!1,0,Math.PI),n(t.steel));f.rotation.z=Math.PI/2,f.rotation.y=d>0?0:Math.PI,f.position.set(0,.3,0),f.scale.set(1,1,.8),h.add(f)}return h.rotation.y=Math.PI/2,h.position.set(.4,.62,.08),o.add(h),Td(i,o,{half:.36,h:1.6})}var $y={theseus:Jy,minotaur:i=>wd(i,!1),"minotaur-stone":i=>wd(i,!0)},jy={...Ko,...$y},Qy=new Set([...nd,"ball","glider","fireball"]),ev={down:0,up:Math.PI,right:Math.PI/2,left:-Math.PI/2},tv=1.5,nv=.05,Ed={y:.37,scale:.7},iv=i=>Math.atan2(Math.sin(i),Math.cos(i));function Ad(i,e){let t=new Re,n=[],r=(f,g,_)=>{let m=Hh(f),p=_.userData;return m?e.make(m,g,p.h,p.back??0):null};function s(f){f.foot.set(f.obj.position.x,oe+f.y,f.obj.position.z)}function o(f){let g=jy[f.model](i);return f.id?.startsWith("machine")&&g.scale.setScalar(Ed.scale),t.add(g),g}function a(f,g){let _=f.id?.startsWith("machine")?Ed.y:0,m=o(f),p=new I;return{model:f.model,id:f.id,obj:m,marker:r(f,p,m),foot:p,r:f.r,c:f.c,yaw:g,goal:g,y:_}}function l(f){t.remove(f.obj),Hi(f.obj,i),f.marker&&e.group.remove(f.marker)}function c(f,g){l(f),f.model=g.model,f.obj=o(g),f.marker=r(g,f.foot,f.obj)}function u(f,g,_,m){let p=!1,v=new Set(n),x=new Map,b=new Map(n.filter(C=>C.id).map(C=>[C.id,C]));for(let C of f){let y=C.id?b.get(C.id):void 0;y&&(v.delete(y),x.set(C,y))}let E=[];for(let C of f)if(!x.has(C))for(let y of v){let M=Math.hypot(y.r-C.r,y.c-C.c);y.model===C.model&&M<=tv&&E.push([M,C,y])}E.sort((C,y)=>C[0]-y[0]);for(let[,C,y]of E)x.has(C)||!v.has(y)||(v.delete(y),y.id=C.id,x.set(C,y));for(let C of v)l(C),p=!0;let S=f.find(C=>C.model==="theseus"),A=[];for(let C of f){let y=x.get(C);if(!y){let z=C.dir?ev[C.dir]:C.id==="minotaur"&&S?Math.atan2(S.c-C.c,S.r-C.r):0;y=a(C,z),p=!0}y.model!==C.model&&(c(y,C),p=!0);let M=C.r-y.r,D=C.c-y.c;Math.abs(M)+Math.abs(D)>1e-6&&(Qy.has(y.model)&&(y.goal=Math.atan2(D,M)),p=!0),y.r=C.r,y.c=C.c,m&&(y.yaw=y.goal),y.obj.position.set(Pt(y.c,g),y.y,Dt(y.r,_)),y.obj.rotation.y=y.yaw,s(y),A.push(y)}return n=A,p}function h(f,g){let _=!1;for(let m of n){let p=iv(m.goal-m.yaw);if(Math.abs(p)<.001){m.yaw=m.goal,m.obj.rotation.y=m.yaw;continue}m.yaw=g?m.goal:m.yaw+p*(1-Math.exp(-f/nv)),m.obj.rotation.y=m.yaw,_=!0}return _}function d(){for(let f of n)l(f);n=[]}return{group:t,set:u,ease:h,seen(){let f=_=>{let m=_.obj.userData;return{x:_.obj.position.x,z:_.obj.position.z,half:m.half,h:m.h}},g=n.find(_=>_.model==="theseus");return{hero:g?f(g):null,rest:n.filter(_=>_!==g).map(f)}},hero:()=>n.find(f=>f.model==="theseus")?.obj??null,loop(f){for(let g of n)g.obj.userData.loop?.(f)},looping:()=>n.flatMap(f=>f.marker||f.obj.userData.loop?[f.obj]:[]),clear:d,dispose:d}}var Ld=.8,Cd=oe+Ld-_i,Pd=9,ov=9,Id=13823214;function Dd(i){let e=new Re,t=new Tr(.05,0),n=new xi(.82,1,40);n.rotateX(-Math.PI/2);let r=new Map,s=0,o=(u,h)=>{u.block.position.y=_i+h-(oe+Ld)};function a(u){let h=u.splash;if(h){for(let d of[h.ring,...h.drops])e.remove(d),d.material.dispose();u.splash=null}}function l(u,h,d){let f=Ot(u*2246822519+5),g=new le(n,new ft({color:Id,transparent:!0,depthWrite:!1}));g.position.set(h,_i+.004,d),g.scale.setScalar(.35),e.add(g);let _=[],m=[];for(let p=0;p<Pd;p++){let v=(p+f()*.6)/Pd*Math.PI*2,x=.55+f()*.45;m.push([Math.cos(v)*x,Math.sin(v)*x,1.6+f()*.8]);let b=new le(t,new ft({color:Id,transparent:!0,depthWrite:!1}));b.position.set(h,_i,d),e.add(b),_.push(b)}return{t0:null,ring:g,drops:_,flight:m}}function c(u){let h=r.get(u);h&&(a(h),e.remove(h.block),Hi(h.block,i),r.delete(u))}return{group:e,set(u,h,d,f){let g=!1,_=new Set(u);for(let m of[...r.keys()])_.has(m)||(c(m),g=!0);for(let m of u){if(r.has(m))continue;let p=Pt(m%h,h),v=Dt(Math.floor(m/h),d),x=Ko.block(i);x.position.set(p,0,v),e.add(x);let b={block:x,x:p,z:v,splash:f?l(m,p,v):null};o(b,f?Cd:.065+s),r.set(m,b),g=!0}return g},splashing:()=>[...r].filter(([,u])=>u.splash).map(([u])=>u),frame(u){let h=!1;for(let d of r.values()){let f=d.splash;if(!f)continue;f.t0??=u;let g=(u-f.t0)/1e3;if(g>=Math.max(.4,.25+.35)){a(d),o(d,.065+s);continue}h=!0,o(d,Uh(g,Cd));let _=Math.min(1,g/.4);f.ring.scale.setScalar(.35+.35*(1-(1-_)**2)),f.ring.material.opacity=.75*(1-_),f.drops.forEach((m,p)=>{let[v,x,b]=f.flight[p],E=_i+b*g-ov/2*g*g;m.visible=_<1&&E>=_i,m.position.set(d.x+v*g,E,d.z+x*g),m.material.opacity=.9*(1-_*_)})}return h},loop(u,h){s=Nh(u,h);for(let d of r.values())d.splash||o(d,.065+s)},cells:()=>[...r.keys()].sort((u,h)=>u-h),clear(){for(let u of[...r.keys()])c(u)},dispose(){this.clear(),t.dispose(),n.dispose()}}}var av=Math.PI/6;function Ud(){let i=new On,e=new Re,t=ds/2,n=Oo,r=new Er([new J(0,0),new J(t,n*.6),new J(0,n)],6),s=new Map,o=hn().items==="white";for(let[d,f]of Object.entries(kh)){let g=o&&d==="item"?16777215:f;s.set(d,new To({color:g,emissive:g,emissiveIntensity:.45,specular:16777215,shininess:80,flatShading:!0,transparent:!0,opacity:.9,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1}))}let a=new ft({color:Bh,side:Lt,depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1});a.onBeforeCompile=d=>{d.vertexShader=d.vertexShader.replace("#include <begin_vertex>",`vec3 transformed = position + normal * ${o?"0.04":"0.022"};`)};let l=new ki(16777215,2.2);i.add(new Co(16777215,.7),l,e);let c=new I,u=new I,h=new I;return{scene:i,group:e,make(d,f,g,_=0){let m=new le(r,s.get(d));m.userData={kind:d,foot:f,h:g,back:_},m.renderOrder=10;let p=new le(r,a);return p.renderOrder=9,m.add(p),e.add(m),m},place(d,f,g,_,m){let p=Gh(m);c.setFromMatrixColumn(d.matrixWorld,0),u.setFromMatrixColumn(d.matrixWorld,1),h.setFromMatrixColumn(d.matrixWorld,2),l.position.copy(h).multiplyScalar(3).addScaledVector(u,2).addScaledVector(c,-1.5);let v=Wh(g,_);for(let x of e.children){let b=x.userData;x.position.copy(b.foot).addScaledVector(u,Vh(b.h,f,b.back)+v),x.quaternion.copy(d.quaternion),x.rotateY(av),x.scale.setScalar(p)}return p},dispose(){e.clear(),r.dispose();for(let d of s.values())d.dispose();a.dispose()}}}var lv={"door-red":Jo,"door-blue":Jo,"door-yellow":Jo,"door-green":Jo,"gate-closed":Nd,"gate-open":Nd,exit:(i,e)=>ii(new Mn(16751168,4,4,1.6),i,.4,e)};function Jo(i,e){return ii(new Mn(16756848,1.6,2.6,1.8),i,.9,e+.6)}function Nd(i,e){return ii(new Mn(16760944,1.2,2.5,1.8),i,1,e)}function ii(i,e,t,n){return i.position.set(e,t,n),i}var Od=i=>i.startsWith("door")?"door":i.startsWith("gate")?"gate":i;function Fd(i,e,t,n,r){let{m:s}=i,o=new Re,a=[];o.add(new Ao(10131616,2761760,2.4));let l=Math.hypot(n,t)/2+1.5,c=new ki(11581648,1.6);c.position.set(-6,14,8),c.castShadow=!0,c.shadow.mapSize.set(2048,2048),Object.assign(c.shadow.camera,{left:-l,right:l,top:l,bottom:-l,near:1,far:40+l}),c.shadow.camera.updateProjectionMatrix(),c.shadow.bias=-8e-4,o.add(c,c.target);let u=new Mn(16758904,5.5,5.5,1.6);u.castShadow=!0,u.shadow.mapSize.set(512,512),u.shadow.bias=-.004,o.add(u);let h=[],d=[],f=Math.min(8,Math.max(3,Math.round(t*n/37))),g=["s","e","w","n"],_=[];for(let E of r)for(let S of g){let[A,C]=wn[S].d,y=E.r+A,M=E.c+C;y<0||M<0||y>=t||M>=n||e[y*n+M]!=="floor"||_.push({w:E,k:S,r:y,c:M,pri:g.indexOf(S)})}_.sort((E,S)=>E.pri-S.pri||E.r-S.r||E.c-S.c);let m=[];for(let E of _){if(m.length>=f)break;m.some(S=>Math.max(Math.abs(S.r-E.r),Math.abs(S.c-E.c))<4)||m.push(E)}let p=new ts({map:s.halo,blending:Li,depthWrite:!1,transparent:!0,opacity:.55});a.push(p),m.forEach(({w:E,k:S},A)=>{let[C,,y]=wn[S].n,M=new Re;M.position.set(E.x+C*.5,0,E.z+y*.5),M.add(ii(new le(new ln(.08,.2,.08),s.iron),C*.04,.82,y*.04)),M.add(ii(new le(new vn(.05,.03,.12,8),s.iron),C*.1,.92,y*.1));let D=ii(new le(new Zt(.055,.2,8),ni(16747056)),C*.1,1.07,y*.1),z=ii(new le(new Zt(.03,.12,8),ni(16769184)),C*.1,1.04,y*.1);a.push(D.material,z.material);let Y=new go(p);Y.scale.setScalar(.7),Y.position.set(C*.12,1.05,y*.12),M.add(D,z,Y);for(let O of M.children)O instanceof le&&O.material===s.iron&&(O.castShadow=!0);o.add(M);let L=ii(new Mn(16754788,4,6,1.7),M.position.x+C*.45,1.05,M.position.z+y*.45);o.add(L),d.push({g:M,flames:[D,z],halo:Y,light:L,base:4,ph:A*2.39}),h.push(new I(M.position.x,1,M.position.z))});let v=[],x=[];e.forEach((E,S)=>{if(E!=="fire")return;let A=Math.floor(S/n),C=S%n,y=x.at(-1);y&&y.r===A&&y.c1===C-1?y.c1=C:x.push({r:A,c0:C,c1:C}),h.push(new I(Pt(C,n),oe+.2,Dt(A,t)))});for(let E of x){let S=E.c1-E.c0+1,A=ii(new Mn(16742960,3+S*1.2,3+S*.8,1.6),(Pt(E.c0,n)+Pt(E.c1,n))/2,.8,Dt(E.r,t));o.add(A),v.push({light:A,base:A.intensity,ph:E.r})}e.forEach((E,S)=>{(E==="water"||E==="teleport")&&h.push(new I(Pt(S%n,n),oe,Dt(Math.floor(S/n),t)))});let b=new Map;return e.forEach((E,S)=>{let A=lv[E];if(!A)return;let C=A(Pt(S%n,n),Dt(Math.floor(S/n),t));o.add(C),b.set(S,{light:C,base:C.intensity,kind:Od(E)})}),{group:o,anchors:h,hero(E,S){u.position.set(E,1.5,S+.1)},setMode(E){for(let S of d)S.g.visible=E!=="low",S.light.position.y=E==="low"?.7:1.05},piece(E,S){let A=b.get(E);A&&(A.light.intensity=Od(S)===A.kind?A.base:0)},shadows(E){c.castShadow=E,u.castShadow=E},loop(E){for(let S of d){let A=1+.07*Math.sin(E*7.1+S.ph)+.04*Math.sin(E*12.7+S.ph*2);S.flames.forEach(C=>C.scale.set(1,A,1)),S.light.intensity=S.base*(1+.1*Math.sin(E*6.3+S.ph)+.05*Math.sin(E*11.1))}p.opacity=.5+.06*Math.sin(E*5);for(let S of v)S.light.intensity=S.base*(1+.1*Math.sin(E*5.7+S.ph))},dispose(){o.traverse(E=>{E instanceof le&&E.geometry.dispose(),(E instanceof ki||E instanceof Mn)&&E.shadow.map?.dispose()});for(let E of a)E.dispose()}}}var tc={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new J(1/1024,1/512)}},vertexShader:`

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
	`};var cv="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",uv=`
uniform sampler2D tDiffuse; uniform float exposure; uniform vec2 res; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){
  vec3 col = pow(aces(texture2D(tDiffuse, vUv).rgb * exposure), vec3(1.0/2.2));
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = col * vec3(1.02, 1.0, 0.96) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  gl_FragColor = vec4(col, 1.0);
}`;function zd(i){let e=new ei(-1,1,1,-1,0,1),t=new _n({uniforms:{tDiffuse:{value:null},exposure:{value:1.4},res:{value:new J(1,1)}},vertexShader:cv,fragmentShader:uv,depthTest:!1,depthWrite:!1}),n=new _n({uniforms:{tDiffuse:{value:null},resolution:{value:new J}},vertexShader:tc.vertexShader,fragmentShader:tc.fragmentShader,depthTest:!1,depthWrite:!1}),r=new le(new nn(2,2),t);r.frustumCulled=!1;let s=new On;s.add(r);let o=new tn(1,1,{type:Di,samples:4,stencilBuffer:!0}),a=new tn(1,1);return{setSize(l,c){o.setSize(l,c),a.setSize(l,c),t.uniforms.res.value.set(l,c),n.uniforms.resolution.value.set(1/l,1/c)},render(l,c,u){i.setRenderTarget(o),i.render(l,c),r.material=t,t.uniforms.tDiffuse.value=o.texture,i.setRenderTarget(u?a:null),i.render(s,e),u&&(r.material=n,n.uniforms.tDiffuse.value=a.texture,i.setRenderTarget(null),i.render(s,e))},dispose(){o.dispose(),a.dispose(),t.dispose(),n.dispose(),r.geometry.dispose()}}}var kd=12597547,hv=16735045,dv=1836034,$o=.03,nc=oe+.035,Hd=nc+$o+.01,fv=Hd+.006,pv=.42,mv=.2,gv=.2,xv=1.32,Bd={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};function Gd(i){let e=pv*i,t=mv*i,n=new cn;return n.moveTo(e/2,0),n.lineTo(-e/2,t),n.lineTo(-e/4,0),n.lineTo(-e/2,-t),n.closePath(),new Ar(n).rotateX(-Math.PI/2).translate(gv,0,0)}function Vd(){let i=new Re,e=new Pn({color:kd,roughness:.7,emissive:kd,emissiveIntensity:.35}),t=new ft({color:hv}),n=new ft({color:dv}),r=[],s="",o=()=>{for(let l of r)i.remove(l),l.geometry.dispose();r.length=0},a=(l,c)=>{if(l.length===0)return null;let u=l.map(d=>d.index?d.toNonIndexed():d),h=new le(Vo(u),c);return l.forEach(d=>d.dispose()),u.forEach(d=>d.dispose()),r.push(h),i.add(h),h};return{group:i,set(l,c,u){let h=l&&l.length>1?`${c}x${u}:${l.map(p=>`${p.jump?"^":""}${p.r},${p.c}`).join(" ")}`:"";if(h===s)return!1;if(s=h,o(),!l||l.length<2)return!0;let d=l.map(p=>[Pt(p.c,c),Dt(p.r,u)]),f=[],g=[],_=[];d.forEach(([p,v],x)=>{f.push(new Cn($o,8,6).translate(p,nc,v));let b=Bo(l,x);if(!b)return;let[E,S]=d[x+1],A=E-p,C=S-v,y=Math.hypot(A,C),M=new vn($o,$o,y,8,1,!0);M.rotateZ(Math.PI/2),M.rotateY(-Math.atan2(C,A)),M.translate(p+A/2,nc,v+C/2),f.push(M),_.push(Gd(xv).rotateY(-Bd[b]).translate(p,Hd,v)),g.push(Gd(1).rotateY(-Bd[b]).translate(p,fv,v))});let m=a(f,e);return m&&(m.receiveShadow=!0),a(_,n),a(g,t),!0},dispose(){o(),e.dispose(),t.dispose(),n.dispose()}}}var yv=394500,vv=67,ic=Math.PI/180,rc=12,Wd=.12,sc="crete-cam";function bv(i){try{let e=JSON.parse(localStorage.getItem(sc)??"null");if(e&&typeof e.heading=="number"&&typeof e.tilt=="number"&&Number.isFinite(e.heading)&&Number.isFinite(e.tilt))return{heading:Vl(e.heading),tilt:Wl(e.tilt)}}catch{}return i}function Xd(i){try{i?localStorage.setItem(sc,JSON.stringify(i)):localStorage.removeItem(sc)}catch{}}function Mv(i){let e=null;try{e=localStorage.getItem(Sh)}catch{e=null}Eh(e);let t=new Qr({canvas:i.canvas,antialias:!0,powerPreference:"high-performance"});t.shadowMap.enabled=!0,t.shadowMap.type=Cl,t.shadowMap.autoUpdate=!1;let n=ad(t),r=new On;r.background=new Ze(yv);let s=new ei(-1,1,1,-1,.1,200),o=new I,a=new I,l=new I,c=zd(t),u=cd(n),h=fd(n),d=new Re,f=Ud(),g=Ad(n,f),_=Vd(),m=Dd(n);r.add(u.group,h.group,d,g.group,_.group,m.group);let p=!0,v=0,x=0,b=-1e9,E=!1,S=rd(),A=S.q,C=1,y=1,M="solid",D="solid",z=hn(),Y=()=>({heading:Gl,tilt:z.steep?vv:cs.angled}),{heading:L,tilt:O}=bv(Y()),H=te=>te==="angled"?O:cs[te],q=null,Z=null,X=[],ie=new Set,Q=[],ue=null,V=0,ee=0,ve=!0,Pe="",ge=!0,Oe=!0,Fe=!0,Ee="angled",pe={yaw:L,pitch:O,tx:0,tz:0,zoom:10},P={...pe},ce=!0,K=!1,ae=()=>i.reducedMotion(),$=()=>A===0?1:Math.min(globalThis.devicePixelRatio||1,2),Ae=()=>q?.level.rows??1,fe=()=>q?.level.cols??1,T=()=>C/y,w=(te,be)=>ie.has(be)?"water":td(te,be),F=()=>gh(T(),fe(),Ae(),P.pitch);function j(){!x&&p&&(x=requestAnimationFrame(it))}function re(te){V=te,Oe=!0,j()}let ne=()=>p&&ve&&!document.hidden&&!i.reducedMotion();function Se(){ee&&clearTimeout(ee),ee=0,ne()&&(ee=setTimeout(()=>{ee=0,ne()&&(q&&xe()?re(V+1/rc):V+=1/rc,Se())},1e3/rc))}function xe(){we();let te=be=>(o.copy(be).project(s),Math.abs(o.x)<1.05&&Math.abs(o.y)<1.05);return(ue?.anchors??[]).some(te)||g.looping().some(be=>te(be.position))||Q.some(be=>!!be?.userData?.loop&&te(be.position))}function we(){let te=pe.yaw*ic,be=pe.pitch*ic,Ce=40;s.position.set(pe.tx+Math.sin(te)*Math.cos(be)*Ce,oe+Math.sin(be)*Ce,pe.tz+Math.cos(te)*Math.cos(be)*Ce),s.up.set(-Math.sin(te),0,-Math.cos(te)),s.lookAt(pe.tx,oe,pe.tz);let Ge=pe.zoom/2,nt=T();s.left=-Ge*nt,s.right=Ge*nt,s.top=Ge,s.bottom=-Ge,s.updateProjectionMatrix(),s.updateMatrixWorld()}function Ne(){P.pitch=H(Ee),K?(ce&&Z&&(P.tx=Pt(Z.c,fe()),P.tz=Dt(Z.r,Ae())),P.zoom=No(P.zoom,F())):(P.tx=P.tz=0,P.zoom=mh(T(),fe(),Ae(),P.pitch,P.yaw)),Object.assign(P,Uo(P,fe(),Ae(),T()))}function Ke(){let{hero:te,rest:be}=g.seen();if(M==="ghosted"&&q){let Ce=fe(),Ge=Ae();Q.forEach((nt,vt)=>{let bt=nt?.userData;!bt||bt.h<=0||be.push({x:Pt(vt%Ce,Ce),z:Dt(Math.floor(vt/Ce),Ge),half:bt.half,h:bt.h})})}return zh(M,te,be)}function se(){ue?.shadows(A>=3),Fe=!0,ht()}function it(te){if(x=0,!p){E=!1;return}let be=te-b;b=te;let Ce=od(E,be);if(Ce!==null){let bt=sd(S,Ce);bt!==A&&(A=bt,se())}let Ge=Ce!==null?Math.min(.1,be/1e3):1/60;Ne();let nt=dh(pe,P,Ge,ae());if(nt&&(ge=!0),we(),wt.setHeading(pe.yaw),ge&&(h.aim(s,Ke()),ge=!1),nt=h.ease(Ge,ae())||nt,g.ease(Ge,ae())&&(nt=!0,Fe=!0),m.frame(te)&&(nt=!0,Fe=!0),Oe){u.loop(V),ue?.loop(V),g.loop(V),m.loop(V,ae());for(let bt of Q)bt?.userData?.loop?.(V);Oe=!1}if(Fe&&(t.shadowMap.needsUpdate=!0,Fe=!1),c.render(r,s,A>=2),f.group.children.length){let bt=f.place(s,pe.pitch,V,ae(),y/pe.zoom);Qe(bt),t.autoClear=!1,t.render(f.scene,s),t.autoClear=!0}let vt=`${pe.yaw} ${pe.tx} ${pe.tz} ${pe.zoom} ${C} ${y}`;vt!==Pe&&(Pe=vt,Et?.view(pe,T())),v++,E=nt,nt&&j()}function Qe(te){let be=pe.zoom/2,Ce=be*T();a.setFromMatrixColumn(s.matrixWorld,0),l.setFromMatrixColumn(s.matrixWorld,1);for(let Ge of f.group.children){if(o.copy(Ge.userData.foot).project(s),Math.abs(o.x)>1||Math.abs(o.y)>1)continue;o.copy(Ge.position).project(s);let[nt,vt]=qh(o.x*Ce,o.y*be,ds*te,Oo*te,Ce,be,Xh);Ge.position.addScaledVector(a,nt).addScaledVector(l,vt)}}function Xe(){let te=be=>(o.copy(be).project(s),[(o.x+1)/2*C,(1-o.y)/2*y]);return f.group.children.map(be=>{let Ce=be.userData;return{kind:Ce.kind,at:te(be.position),foot:te(Ce.foot),cell:y/pe.zoom}})}let Ie=new ei(-1,1,1,-1,.1,200),Me=null,Ye=new Uint8Array(0);function st(te,be,Ce,Ge,nt){if(!q)return!1;let vt=fe(),bt=Ae(),pt=te.width,gt=te.height,R=(De,He,ke)=>ke<=He?(ke-1)/2:Math.max((He-1)/2,Math.min(ke-1-(He-1)/2,De)),N=Pt(R(Ce,Ge,vt),vt),B=Dt(R(be,nt,bt),bt),G=cs.top*ic,k=40;Ie.position.set(N,oe+Math.sin(G)*k,B+Math.cos(G)*k),Ie.up.set(0,0,-1),Ie.lookAt(N,oe,B);let he=Ge/2,Te=nt*Math.sin(G)/2;Object.assign(Ie,{left:-he,right:he,top:Te,bottom:-Te}),Ie.updateProjectionMatrix(),Ie.updateMatrixWorld(),(!Me||Me.width!==pt||Me.height!==gt)&&(Me?.dispose(),Me=new tn(pt,gt),Me.texture.colorSpace=Ct,Ye=new Uint8Array(pt*gt*4)),t.toneMapping=Ll,t.toneMappingExposure=1.4,t.setRenderTarget(Me),t.render(r,Ie),t.setRenderTarget(null),t.toneMapping=Nn,t.readRenderTargetPixels(Me,0,0,pt,gt,Ye);let Ue=new ImageData(pt,gt);for(let De=0;De<gt;De++)Ue.data.set(Ye.subarray((gt-1-De)*pt*4,(gt-De)*pt*4),De*pt*4);return te.getContext("2d").putImageData(Ue,0,0),!0}function ht(){let te=i.canvas.clientWidth,be=i.canvas.clientHeight;if(te<=0||be<=0)return;C=te,y=be;let Ce=$();t.setPixelRatio(Ce),t.setSize(te,be,!1),c.setSize(Math.round(te*Ce),Math.round(be*Ce)),Et?.fit(i.overlay.clientWidth||te,i.overlay.clientHeight||be),K||(Ne(),pe.zoom=P.zoom),ge=!0}function $e(te){let be=Q[te];be&&(d.remove(be),Hi(be,n));let Ce=fe(),Ge=Ae(),nt=Math.floor(te/Ce),vt=te%Ce,bt=(R,N)=>R<0||N<0||R>=Ge||N>=Ce||X[R*Ce+N]==="wall",pt=yd[X[te]]({kit:n,r:nt,c:vt,wall:bt}),gt=pt.userData;if(!pt.children.length){Q[te]=null;return}pt.position.set(Pt(vt,Ce),0,Dt(nt,Ge)),gt.tall&&M==="low"&&(pt.scale.y=Ur/un),d.add(pt),Q[te]=pt}function de(te,be){Z&&(Z.r!==be.player.r||Z.c!==be.player.c)&&(ce=!0),Z={r:be.player.r,c:be.player.c};let Ce=g.set(id(te,be),fe(),Ae(),ae()),Ge=g.hero();return Ge&&ue?.hero(Ge.position.x,Ge.position.z),Ce}function U(){for(let te of Q)te&&(d.remove(te),Hi(te,n));Q=[],ue&&(r.remove(ue.group),ue.dispose(),ue=null),g.clear(),m.clear(),_.set(null,0,0)}function _e(te){U(),q=te;let{rows:be,cols:Ce}=te.level;ie=new Set(ql(te.level.terrain,te.terrain)),X=te.terrain.map((Ge,nt)=>w(te,nt)),m.set([...ie],Ce,be,!1),u.set(X,be,Ce),h.build(X,be,Ce),Q=X.map(()=>null);for(let Ge=0;Ge<X.length;Ge++)$e(Ge);ue=Fd(n,X,be,Ce,h.list()),ue.setMode(M),ue.shadows(A>=3),r.add(ue.group),gs(S),Z=null,de(te,{player:te.player,minotaur:te.minotaur,hazards:te.hazards.map(Ge=>({kind:Ge.kind,at:Ge.at}))}),ce=!0,K=!1,Ne(),Object.assign(pe,P),ge=Oe=Fe=!0,Et?.paint(te,{player:te.player,minotaur:te.minotaur,hazards:te.hazards.map(Ge=>({kind:Ge.kind,at:Ge.at}))},null),j(),ee||Se()}function ye(te,be){let Ce=te.state;(!q||Ce.level!==q.level)&&_e(Ce);let Ge=q,nt=Dh(Ge,Ce);Ge.relicsLeft!==Ce.relicsLeft&&Ce.terrain.forEach((he,Te)=>{he==="gate"&&nt.push(Te)});let vt=!1,bt=!1,{rows:pt,cols:gt}=Ce.level,R=new Set,N=ql(Ce.level.terrain,Ce.terrain);ie=new Set(N);for(let he of nt){let Te=w(Ce,he),Ue=X[he];if(Te!==Ue){if(ms[Te]!==ms[Ue]&&(vt=!0),Te==="wall"!=(Ue==="wall")){bt=!0;let De=Math.floor(he/gt),He=he%gt;for(let[ke,qe]of[[-1,0],[1,0],[0,-1],[0,1]])De+ke>=0&&De+ke<pt&&He+qe>=0&&He+qe<gt&&R.add((De+ke)*gt+He+qe)}X[he]=Te,$e(he),ue?.piece(he,Te)}}for(let he of R)nt.includes(he)||$e(he);vt&&u.set(X,pt,gt),bt&&(h.build(X,pt,gt),h.setMode(M)),q=Ce;let B=de(Ce,te.figures),G=_.set(be,gt,pt),k=m.set(N,gt,pt,!ae());nt.length===0&&!B&&!G&&!k&&Ce===Ge||((nt.length||B||k)&&(ge=!0,Fe=!0),Et?.paint(Ce,te.figures,be),j(),ee||Se())}function Be(te){D=te;let be=z.cutaway&&Ee==="angled"&&te==="solid"?"ghosted":te;M=be,h.setMode(be),ue?.setMode(be);for(let Ce of Q)Ce&&Ce.userData.tall&&(Ce.scale.y=be==="low"?Ur/un:1);ge=Fe=!0,j()}function ze(te){te!==Ee&&(Ee=te,P.yaw=Xl(te==="angled"?L:Hl[te],pe.yaw),q||(P.pitch=H(te),pe.yaw=P.yaw,pe.pitch=P.pitch),wt.setTurnable(te!=="top"),Be(D))}let at={turn(te,be){Ee!=="top"&&(P.yaw+=te,be||(pe.yaw+=te),ge=!0,j())},pan(te,be){ce=!1;let Ce=pe.zoom/y;for(let Ge of[pe,P])Object.assign(Ge,Uo(fh(Ge,te,be,Ce),fe(),Ae(),T()));ge=!0,j()},zoom(te,be,Ce,Ge){K=!0;let nt=F();if(Ge)P.zoom=No(P.zoom*te,nt);else{let vt=Math.abs(be)>Wd||Math.abs(Ce)>Wd;vt&&(ce=!1);let bt=vt?be*T():0,pt=vt?Ce:0;for(let gt of[pe,P])Object.assign(gt,Uo(xh(gt,te,bt,pt,nt),fe(),Ae(),T()))}ge=!0,j()},tilt(te){Ee==="angled"&&(O=Wl(O+te),pe.pitch=P.pitch=O,ge=!0,j())},settle(){Ee==="angled"&&(P.yaw=Vl(P.yaw),ae()&&(pe.yaw=P.yaw),L=(P.yaw%360+360)%360,Xd({heading:L,tilt:O}),ge=!0,j())},reset(){ce=!0,K=!1,Ee==="angled"&&({heading:L,tilt:O}=Y()),Xd(null),P.yaw=Xl(Hl[Ee],pe.yaw),ae()&&(pe.yaw=P.yaw),ge=!0,j()}},rt=document.createElement("div");rt.className="modern-ui",i.overlay.append(rt);let wt=Lh(i.canvas,rt,i,at),Et=i.atlas&&i.image?ed(rt,i.atlas,i.image,{blocked:()=>i.blocked(),look(te){i.gesture(),ce=!1,P.tx=te.x,P.tz=te.z,j()}}):null,lt=()=>{gs(S),Se()};document.addEventListener("visibilitychange",lt);let zt=typeof IntersectionObserver=="function"?new IntersectionObserver(te=>{ve=te.some(be=>be.isIntersecting),Se()}):null;zt?.observe(i.canvas);let rn=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,Nr=()=>{Oe=!0,j(),Se()};return rn?.addEventListener("change",Nr),ht(),{level:_e,show:ye,walls:Be,view:ze,yaw:()=>pe.yaw,zoom:()=>pe.zoom,pitch:()=>pe.pitch,following:()=>ce,reset:at.reset,resize(){ht(),j()},setActive(te){p=te,rt.hidden=!te,te?j():(x&&cancelAnimationFrame(x),x=0,E=!1),Se()},frames:()=>v,quality:()=>A,fps:()=>Go(S.gaps,2e3),floating:()=>m.cells(),markers:Xe,splashing:()=>m.splashing(),minimap(te){Et?.show(te)},snapshot:st,dispose(){x&&cancelAnimationFrame(x),x=0,p=!1,Se(),document.removeEventListener("visibilitychange",lt),zt?.disconnect(),rn?.removeEventListener("change",Nr),wt.dispose(),Et?.dispose(),rt.remove(),U(),u.dispose(),h.dispose(),g.dispose(),m.dispose(),_.dispose(),f.dispose(),Me?.dispose(),c.dispose(),n.dispose(),t.dispose()}}}export{Mv as createModernBoard};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=modern.js.map
